// src/components/MapEditor/Toolbar.tsx

import React from "react";
import { Mode } from "./shapes";

interface ToolbarProps {
  editor: {
    areaWidth: number;
    areaHeight: number;
    setAreaWidth: (n: number) => void;
    setAreaHeight: (n: number) => void;
    areaTotal: number;
    useSnap: boolean;
    setUseSnap: (b: boolean) => void;
    activateMode: (m: Mode) => void;
    finishDrawing: () => void;
    handleExportJSON: () => void;
    handleImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
  };
}

export const Toolbar: React.FC<{ editor: ToolbarProps["editor"] }> = ({ editor }) => {
  return (
    <div style={{ background: "#f3f4f6", padding: 10 }}>
      <label>
        Largura (m):
        <input
          type="number"
          value={editor.areaWidth}
          onChange={(e) => editor.setAreaWidth(+e.target.value)}
          style={{ margin: "0 10px" }}
        />
      </label>
      <label>
        Altura (m):
        <input
          type="number"
          value={editor.areaHeight}
          onChange={(e) => editor.setAreaHeight(+e.target.value)}
          style={{ margin: "0 10px" }}
        />
      </label>
      <span>Área total: {editor.areaTotal.toFixed(2)} m²</span>
      <label style={{ marginLeft: 20 }}>
        <input
          type="checkbox"
          checked={editor.useSnap}
          onChange={(e) => editor.setUseSnap(e.target.checked)}
        />{" "}
        Grade
      </label>

      <div
        style={{
          display: "flex",
          gap: 10,
          marginTop: 10,
          flexWrap: "wrap",
        }}
      >
        {(["rect", "polygon", "path", "line"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => editor.activateMode(m)}
            style={{ transition: "transform 0.1s" }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {m === "rect"
              ? "➕ Área Geométrica"
              : m === "polygon"
              ? "✏️ Área Livre"
              : m === "path"
              ? "🌐 Corredor Livre"
              : "📏 Corredor Reto"}
          </button>
        ))}

        <button
          onClick={editor.finishDrawing}
          style={{
            background: "#10b981",
            color: "#fff",
            transition: "transform 0.1s",
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          ✅ Finalizar
        </button>

        <button onClick={editor.handleExportJSON}>💾 Salvar JSON</button>
        <label style={{ position: "relative", overflow: "hidden" }}>
          📂 Carregar JSON
          <input
            type="file"
            accept="application/json"
            onChange={editor.handleImportJSON}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              opacity: 0,
              cursor: "pointer",
            }}
          />
        </label>
      </div>
    </div>
  );
};
