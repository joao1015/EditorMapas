// src/components/MapEditor/MapEditor.tsx
"use client";

import React from "react";
import { useEditorState } from "./useEditorState";
import { Toolbar } from "./Toolbar";
//- import { CanvasStage } from "../components/CanvasStage";
//- import { PropertiesPanel } from "../components/PropertiesPanel";
 import { CanvasStage } from "./CanvasStage";
 import { PropertiesPanel } from "./PropertiesPanel";
import { MiniMap } from "./MiniMap";

export default function MapEditor() {
  const editor = useEditorState();

  return (
    <div>
      <h1>Radar Moto - Editor de Mapas</h1>
      <Toolbar editor={editor} />
      <div style={{ display: "flex" }}>
        <CanvasStage editor={editor} />
        <PropertiesPanel editor={editor} />
      </div>
    </div>
  );
}
