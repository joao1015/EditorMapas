// src/components/MapEditor/useEditorState.ts

import { useRef, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Shape, FreePath, Point, Mode, HistoryState } from "./shapes";
import { snapToGrid, calculateLength } from "./mapUtils";

export function useEditorState() {
  const [areaWidth, setAreaWidth] = useState(40);
  const [areaHeight, setAreaHeight] = useState(25);
  const areaTotal = areaWidth * areaHeight;
  const pixelsPerMeter = Math.sqrt(
    (window.innerWidth * window.innerHeight) / Math.max(1, areaTotal)
  );

  const [useSnap, setUseSnap] = useState(true);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [paths, setPaths] = useState<FreePath[]>([]);
  const [mode, setMode] = useState<Mode>("none");
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [history, setHistory] = useState<HistoryState[]>([{
    shapes: [],
    paths: [],
    areaWidth: 40,
    areaHeight: 25,
  }]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const historyRef = useRef(history);
  const currentIndexRef = useRef(currentIndex);
  const isUndoRedo = useRef(false);

  const [scale, setScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  const stageRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  const [viewport, setViewport] = useState({
    x: 0,
    y: 0,
    scale,
    stageSize: {
      w: window.innerWidth * 0.75,
      h: window.innerHeight * 0.8,
    },
  });

  function activateMode(m: Mode) {
    setMode(m);
    setCurrentPath([]);
  }

  function handleExportJSON() {
    const data = JSON.stringify({ areaWidth, areaHeight, shapes, paths }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mapa.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportJSON(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(reader.result as string);
        setAreaWidth(obj.areaWidth);
        setAreaHeight(obj.areaHeight);
        setShapes(obj.shapes || []);
        setPaths(obj.paths || []);
      } catch {
        alert("Arquivo JSON inválido");
      }
    };
    reader.readAsText(file);
  }

  function handleStageClick() {
    if (isPanning) return;
    const pos = stageRef.current?.getPointerPosition();
    if (!pos) return;
    const { x, y } = snapToGrid(pos.x, pos.y, useSnap);

    if (mode === "rect") {
      setShapes((prev) => [
        ...prev,
        {
          id: uuidv4(),
          type: "rect",
          name: `Área ${prev.length + 1}`,
          x,
          y,
          width: 100,
          height: 60,
          nameOffset: { x: 10, y: -20 },
        },
      ]);
      setMode("none");
    } else if (["polygon", "path", "line"].includes(mode)) {
      setCurrentPath((prev) => [...prev, { x, y }]);
    }
  }

  function finishDrawing() {
    if (currentPath.length < 2) {
      setMode("none");
      setCurrentPath([]);
      return;
    }
    if (mode === "polygon") {
      setShapes((prev) => [
        ...prev,
        {
          id: uuidv4(),
          type: "polygon",
          name: `Área ${prev.length + 1}`,
          x: 0,
          y: 0,
          points: currentPath,
          nameOffset: { x: 10, y: -20 },
        },
      ]);
    } else {
      setPaths((prev) => [
        ...prev,
        {
          id: uuidv4(),
          name: `Corredor ${prev.length + 1}`,
          width: pixelsPerMeter * 0.5,
          color: "#4f46e5",
          points: currentPath,
          nameOffset: { x: 10, y: -20 },
        },
      ]);
    }
    setCurrentPath([]);
    setMode("none");
  }

  function updatePathPoint(id: string, index: number, p: Point) {
    setPaths((prev) =>
      prev.map((pl) =>
        pl.id === id
          ? { ...pl, points: pl.points.map((pt, i) => (i === index ? p : pt)) }
          : pl
      )
    );
  }

  useEffect(() => {
    const tr = trRef.current;
    const stage = stageRef.current;
    if (tr && stage) {
      const selNode = stage.findOne("#" + selectedId);
      tr.nodes(selNode ? [selNode] : []);
      tr.getLayer()?.batchDraw();
    }
  }, [selectedId, shapes, paths]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target !== document.body) return;
      switch (e.key) {
        case "r": activateMode("rect"); break;
        case "p": activateMode("polygon"); break;
        case "l": activateMode("path"); break;
        case "Enter": finishDrawing(); break;
        case "Delete":
          if (selectedId) {
            setShapes((s) => s.filter((sh) => sh.id !== selectedId));
            setPaths((p) => p.filter((pp) => pp.id !== selectedId));
            setSelectedId(null);
          }
          break;
        case "z":
          if (e.ctrlKey && currentIndex > 0) {
            isUndoRedo.current = true;
            const prev = history[currentIndex - 1];
            setShapes(prev.shapes);
            setPaths(prev.paths);
            setAreaWidth(prev.areaWidth);
            setAreaHeight(prev.areaHeight);
            setCurrentIndex(currentIndex - 1);
          }
          break;
        case "y":
          if (e.ctrlKey && currentIndex < history.length - 1) {
            isUndoRedo.current = true;
            const next = history[currentIndex + 1];
            setShapes(next.shapes);
            setPaths(next.paths);
            setAreaWidth(next.areaWidth);
            setAreaHeight(next.areaHeight);
            setCurrentIndex(currentIndex + 1);
          }
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedId, mode, currentPath, currentIndex, history]);

  return {
    areaWidth,
    setAreaWidth,
    areaHeight,
    setAreaHeight,
    areaTotal,
    pixelsPerMeter,
    useSnap,
    setUseSnap,
    shapes,
    setShapes,
    paths,
    setPaths,
    mode,
    setMode,
    currentPath,
    setCurrentPath,
    selectedId,
    setSelectedId,
    activateMode,
    handleExportJSON,
    handleImportJSON,
    handleStageClick,
    finishDrawing,
    updatePathPoint,
    scale,
    setScale,
    stagePos,
    setStagePos,
    isPanning,
    setIsPanning,
    viewport,
    setViewport,
    stageRef,
    trRef,
  };
}
