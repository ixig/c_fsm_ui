"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
  type EdgeProps,
} from "@xyflow/react";
import { memo, useRef } from "react";
import type { TransitionEdge as TEdge } from "@/lib/types";
import { useFsmStore } from "@/lib/store";

function TransitionEdgeImpl(props: EdgeProps<TEdge>) {
  const {
    id,
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

  const { getViewport } = useReactFlow();
  const updateTransition = useFsmStore((s) => s.updateTransition);
  const setHoveredEdge = useFsmStore((s) => s.setHoveredEdge);
  const hoveredEdgeId = useFsmStore((s) => s.hoveredEdgeId);
  const hoveredNodeId = useFsmStore((s) => s.hoveredNodeId);

  const isHovered = hoveredEdgeId === id;
  const isSourceHovered = hoveredNodeId === props.source;
  const isHighlighted = selected || isHovered || isSourceHovered;

  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    curvature: 0.4,
  });

  const isDragging = useRef(false);

  const onMouseDown = (event: React.MouseEvent) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    isDragging.current = false;

    const initialOffset = data?.labelOffset || { x: 0, y: 0 };

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (
        Math.abs(moveEvent.clientX - event.clientX) > 2 ||
        Math.abs(moveEvent.clientY - event.clientY) > 2
      ) {
        isDragging.current = true;
      }

      const { zoom } = getViewport();
      const snap = (v: number) => Math.round(v / 10) * 10;
      updateTransition(id, {
        labelOffset: {
          x: snap(initialOffset.x + (moveEvent.clientX - event.clientX) / zoom),
          y: snap(initialOffset.y + (moveEvent.clientY - event.clientY) / zoom),
        },
      });
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const onLabelClick = (event: React.MouseEvent) => {
    if (isDragging.current) {
      event.stopPropagation();
    }
  };

  const offsetX = data?.labelOffset?.x || 0;
  const offsetY = data?.labelOffset?.y || 0;

  const highlightColor = "#ea580c";
  const defaultColor = "#334155";
  const strokeColor = isHighlighted ? highlightColor : defaultColor;

  return (
    <>
      <BaseEdge
        path={path}
        markerEnd={markerEnd}
        style={{
          stroke: strokeColor,
          strokeWidth: isHighlighted ? 2.5 : 1.75,
          fill: "none",
        }}
      />
      {(data?.trigger || data?.guard || data?.action) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX + offsetX}px, ${labelY + offsetY}px)`,
              pointerEvents: "all",
            }}
            onMouseDown={onMouseDown}
            onClick={onLabelClick}
            onMouseEnter={() => setHoveredEdge(id)}
            onMouseLeave={() => setHoveredEdge(null)}
            className={`nopan bg-white px-2 py-1 text-[11px] font-mono rounded border shadow-sm flex flex-col items-center leading-tight cursor-move select-none transition-colors ${
              isHighlighted ? "border-orange-600" : "border-neutral-200 hover:border-orange-400"
            }`}
          >
            {data?.trigger && (
              <div>
                {data.priority !== undefined ? `#${data.priority}: ` : ""}
                {data.trigger}
              </div>
            )}
            {data?.guard && <div className="text-neutral-500">[{data.guard}]</div>}
            {data?.action && <div className="text-neutral-600">{data.action}</div>}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const TransitionEdge = memo(TransitionEdgeImpl);
