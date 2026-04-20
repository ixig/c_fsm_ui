"use client";

import { useRef } from "react";
import { useReactFlow } from "@xyflow/react";
import { useFsmStore } from "@/lib/store";
import { exportJson, importJson } from "@/lib/persistence";

export function Toolbar() {
  const rf = useReactFlow();
  const addState = useFsmStore((s) => s.addState);
  const replaceAll = useFsmStore((s) => s.replaceAll);
  const clear = useFsmStore((s) => s.clear);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    const name = window.prompt("State name?")?.toUpperCase();
    if (!name) return;
    const nodes = useFsmStore.getState().nodes;
    if (nodes.some((n) => n.data.name === name)) {
      window.alert(`A state named "${name}" already exists.`);
      return;
    }
    const { x, y, zoom } = rf.getViewport();
    const bounds =
      typeof window !== "undefined"
        ? { w: window.innerWidth, h: window.innerHeight }
        : { w: 800, h: 600 };
    const cx = (bounds.w / 2 - x) / zoom;
    const cy = (bounds.h / 2 - y) / zoom;
    const jitter = () => (Math.random() - 0.5) * 80;
    addState(name, { x: cx + jitter() - 80, y: cy + jitter() - 32 });
  };

  const handleExport = () => {
    const { nodes, edges } = useFsmStore.getState();
    const json = exportJson(nodes, edges);
    const blob = new Blob([JSON.stringify(json, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fsm.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const { nodes, edges } = importJson(parsed);
      replaceAll(nodes, edges);
    } catch (err) {
      window.alert(`Import failed: ${(err as Error).message}`);
    } finally {
      e.target.value = "";
    }
  };

  const handleClear = () => {
    if (window.confirm("Clear the entire diagram?")) clear();
  };

  return (
    <div className="absolute top-3 left-3 z-10 flex gap-2 bg-white/90 backdrop-blur rounded-lg shadow border border-neutral-200 p-2">
      <button
        onClick={handleAdd}
        className="px-3 py-1.5 text-sm rounded bg-blue-600 hover:bg-blue-700 text-white font-medium"
      >
        + Add State
      </button>
      <button
        onClick={handleImportClick}
        className="px-3 py-1.5 text-sm rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-900"
      >
        Import JSON
      </button>
      <button
        onClick={handleExport}
        className="px-3 py-1.5 text-sm rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-900"
      >
        Export JSON
      </button>
      <button
        onClick={handleClear}
        className="px-3 py-1.5 text-sm rounded bg-neutral-100 hover:bg-red-100 text-neutral-900"
      >
        Clear
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
