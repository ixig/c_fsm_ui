"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { memo } from "react";
import type { StateNode as StateNodeType } from "@/lib/types";
import { useFsmStore } from "@/lib/store";

export const STATE_NODE_MIN_WIDTH = 160;
export const STATE_NODE_MIN_HEIGHT = 64;

function StateNodeImpl({ id, data, selected }: NodeProps<StateNodeType>) {
  const setHoveredNode = useFsmStore((s) => s.setHoveredNode);

  return (
    <div
      onMouseEnter={() => setHoveredNode(id)}
      onMouseLeave={() => setHoveredNode(null)}
      className={`relative rounded-xl border-2 bg-white shadow-sm flex items-center justify-center text-center px-5 py-3 transition-colors ${
        selected ? "border-blue-500" : "border-neutral-700 hover:border-blue-400"
      }`}
      style={{ minWidth: STATE_NODE_MIN_WIDTH, minHeight: STATE_NODE_MIN_HEIGHT }}
    >
      {data.isInitial && (
        <span
          title="Initial state"
          className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center shadow"
        >
          ▶
        </span>
      )}
      <div className="flex flex-col items-center" style={{ gap: 0 }}>
        <div className="text-sm font-medium text-neutral-900 whitespace-nowrap">
          {data.name || "(unnamed)"}
        </div>
        {data.onEnter && (
          <div className="text-[11px] font-mono text-emerald-700 leading-tight whitespace-nowrap">
            ↳ {data.onEnter}
          </div>
        )}
        {data.onExit && (
          <div className="text-[11px] font-mono text-rose-700 leading-tight whitespace-nowrap">
            ↰ {data.onExit}
          </div>
        )}
        {data.timeout_ms !== undefined && (
          <div className="text-[11px] font-mono text-neutral-500 leading-tight">
            ⏱ {data.timeout_ms}ms
          </div>
        )}
      </div>

      {(["top", "right", "bottom", "left"] as const).map((side) => {
        const pos =
          side === "top"
            ? Position.Top
            : side === "right"
              ? Position.Right
              : side === "bottom"
                ? Position.Bottom
                : Position.Left;
        return (
          <div key={side}>
            <Handle
              id={`${side}-target`}
              type="target"
              position={pos}
              className="!w-3 !h-3 !bg-transparent !border-0"
            />
            <Handle
              id={`${side}-source`}
              type="source"
              position={pos}
              className="!w-3 !h-3 !bg-neutral-400 !border !border-white"
            />
          </div>
        );
      })}
    </div>
  );
}

export const StateNode = memo(StateNodeImpl);
