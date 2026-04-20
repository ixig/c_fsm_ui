"use client";

import { useEffect, useRef } from "react";
import { MarkerType } from "@xyflow/react";
import { useFsmStore } from "./store";
import type { FsmExport, StateNode, TransitionEdge } from "./types";

import { GRID_SIZE } from "./constants";

const STORAGE_KEY = "c_fsm_ui.fsm.v3";

export function exportJson(
  nodes: StateNode[],
  edges: TransitionEdge[],
): FsmExport {
  return {
    version: 3,
    states: nodes.map((n) => ({
      id: n.id,
      name: n.data.name,
      onEnter: n.data.onEnter,
      onExit: n.data.onExit,
      timeout_ms: n.data.timeout_ms,
      isInitial: n.data.isInitial,
      position: { x: n.position.x, y: n.position.y },
    })),
    transitions: edges.map((e) => ({
      id: e.id,
      from: e.source,
      to: e.target,
      sourceHandle: e.sourceHandle ?? null,
      targetHandle: e.targetHandle ?? null,
      priority: e.data?.priority,
      trigger: e.data?.trigger ?? "",
      guard: e.data?.guard,
      action: e.data?.action,
      internal: e.data?.internal,
      labelOffset: e.data?.labelOffset,
    })),
  };
}

export function importJson(raw: unknown): {
  nodes: StateNode[];
  edges: TransitionEdge[];
} {
  if (!raw || typeof raw !== "object") throw new Error("Invalid FSM JSON");
  const fsm = raw as Record<string, unknown>;
  const version = fsm.version as number;
  if (version !== 3) throw new Error(`Unsupported version: ${version}`);

  const states = fsm.states;
  const transitions = fsm.transitions;

  if (!Array.isArray(states) || !Array.isArray(transitions)) {
    throw new Error("Missing states or transitions");
  }

  const nodes: StateNode[] = states.map((s_raw) => {
    const s = s_raw as Record<string, unknown>;
    const position = { ...(s.position as { x: number; y: number }) };

    // Snap to grid on import
    position.x = Math.round(position.x / GRID_SIZE) * GRID_SIZE;
    position.y = Math.round(position.y / GRID_SIZE) * GRID_SIZE;

    return {
      id: s.id as string,
      type: "state",
      position,
      data: {
        name: s.name as string,
        onEnter: s.onEnter as string | undefined,
        onExit: s.onExit as string | undefined,
        timeout_ms: s.timeout_ms as number | undefined,
        isInitial: s.isInitial as boolean | undefined,
      },
    };
  });

  const edges: TransitionEdge[] = transitions.map((t_raw) => {
    const t = t_raw as Record<string, unknown>;
    return {
      id: t.id as string,
      source: t.from as string,
      target: t.to as string,
      sourceHandle: (t.sourceHandle as string | null) ?? undefined,
      targetHandle: (t.targetHandle as string | null) ?? undefined,
      type: "transition",
      markerEnd: { type: MarkerType.ArrowClosed, color: "#334155" },
      data: {
        priority: t.priority as number | undefined,
        trigger: (t.trigger as string) ?? "",
        guard: t.guard as string | undefined,
        action: t.action as string | undefined,
        internal: t.internal as boolean | undefined,
        labelOffset: t.labelOffset as { x: number; y: number } | undefined,
      },
    };
  });
  return { nodes, edges };
}

export function usePersistence() {
  const replaceAll = useFsmStore((s) => s.replaceAll);
  const nodes = useFsmStore((s) => s.nodes);
  const edges = useFsmStore((s) => s.edges);
  const hydratedRef = useRef(false);
  const saveTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Parameters<typeof importJson>[0];
      const { nodes, edges } = importJson(parsed);
      replaceAll(nodes, edges);
    } catch {
      // ignore corrupt storage
    }
  }, [replaceAll]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    if (saveTimeout.current) window.clearTimeout(saveTimeout.current);
    saveTimeout.current = window.setTimeout(() => {
      try {
        const json = exportJson(nodes, edges);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(json));
      } catch {
        // quota / serialization errors — ignored
      }
    }, 300);
    return () => {
      if (saveTimeout.current) window.clearTimeout(saveTimeout.current);
    };
  }, [nodes, edges]);
}
