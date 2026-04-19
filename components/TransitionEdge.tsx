"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";
import { memo } from "react";
import type { TransitionEdge as TEdge } from "@/lib/types";

function TransitionEdgeImpl(props: EdgeProps<TEdge>) {
  const {
    data,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    markerEnd,
    selected,
  } = props;

  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        path={path}
        markerEnd={markerEnd}
        style={{
          stroke: selected ? "#2563eb" : "#334155",
          strokeWidth: selected ? 2.5 : 1.75,
          fill: "none",
        }}
      />
      {(data?.trigger || data?.guard || data?.action) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: "all",
            }}
            className="nodrag nopan bg-white px-2 py-1 text-[11px] font-mono rounded border border-neutral-200 shadow-sm flex flex-col items-center leading-tight"
          >
            {data?.trigger && <div>{data.trigger}</div>}
            {data?.guard && <div className="text-neutral-500">[{data.guard}]</div>}
            {data?.action && <div className="text-neutral-600">{data.action}</div>}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const TransitionEdge = memo(TransitionEdgeImpl);
