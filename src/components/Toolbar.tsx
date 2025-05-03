import React from "react";

interface ToolbarProps {
  selectedShape: any;
  selectedLink: any;
  selectedPath: any;
  onShapeChange: (key: string, value: any) => void;
  onLinkChange: (key: string, value: any) => void;
  onPathChange: (key: string, value: any) => void;
}

export default function Toolbar({
  selectedShape,
  selectedLink,
  selectedPath,
  onShapeChange,
  onLinkChange,
  onPathChange,
}: ToolbarProps) {
  return (
    <div className="w-72 p-4 border-l border-gray-300 bg-white text-black shadow-xl h-full">
      <h2 className="font-bold text-xl mb-4">Editar</h2>

      {selectedShape && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold">Nome</label>
            <input
              className="w-full border p-1"
              value={selectedShape.name || ""}
              onChange={(e) => onShapeChange("name", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">Categoria</label>
            <input
              className="w-full border p-1"
              value={selectedShape.category || ""}
              onChange={(e) => onShapeChange("category", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">Largura</label>
            <input
              className="w-full border p-1"
              type="number"
              value={selectedShape.width || 0}
              onChange={(e) => onShapeChange("width", parseFloat(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">Altura</label>
            <input
              className="w-full border p-1"
              type="number"
              value={selectedShape.height || 0}
              onChange={(e) => onShapeChange("height", parseFloat(e.target.value))}
            />
          </div>
        </div>
      )}

      {selectedLink && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold">Tipo</label>
            <select
              className="w-full border p-1"
              value={selectedLink.type || ""}
              onChange={(e) => onLinkChange("type", e.target.value)}
            >
              <option value="retangular">Retangular</option>
              <option value="curvo">Curvo</option>
              <option value="rotatoria">Rotatória</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold">Largura (px)</label>
            <input
              className="w-full border p-1"
              type="number"
              value={selectedLink.width || 0}
              onChange={(e) => onLinkChange("width", parseFloat(e.target.value))}
            />
          </div>
        </div>
      )}

      {selectedPath && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold">Nome do Corredor</label>
            <input
              className="w-full border p-1"
              value={selectedPath.name || ""}
              onChange={(e) => onPathChange("name", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">Categoria</label>
            <input
              className="w-full border p-1"
              value={selectedPath.category || ""}
              onChange={(e) => onPathChange("category", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">Largura (px)</label>
            <input
              className="w-full border p-1"
              type="number"
              value={selectedPath.width || 0}
              onChange={(e) => onPathChange("width", parseFloat(e.target.value))}
            />
          </div>
        </div>
      )}
    </div>
  );
}
