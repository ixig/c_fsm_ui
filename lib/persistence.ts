"use client";

import { useEffect, useRef } from "react";
import { MarkerType } from "@xyflow/react";
import { useFsmStore } from "./store";
import type { FsmExport, StateNode, TransitionEdge } from "./types";

const STORAGE_KEY = "c_fsm_ui.fsm.v1";

export function exportJson(
  nodes: StateNode[],
  edges: TransitionEdge[],
): FsmExport {
  return {
    version: 1,
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
      labelOffset: e.data?.labelOffset,
    })),
  };
}

export function importJson(raw: unknown): {
  nodes: StateNode[];
  edges: TransitionEdge[];
} {
  if (!raw || typeof raw !== "object") throw new Error("Invalid FSM JSON");
  const fsm = raw as Partial<FsmExport>;
  if (fsm.version !== 1) throw new Error("Unsupported version");
  if (!Array.isArray(fsm.states) || !Array.isArray(fsm.transitions)) {
    throw new Error("Missing states or transitions");
  }
  const nodes: StateNode[] = fsm.states.map((s) => ({
    id: s.id,
    type: "state",
    position: s.position,
    data: {
      name: s.name,
      onEnter: s.onEnter,
      onExit: s.onExit,
      timeout_ms: s.timeout_ms,
      isInitial: s.isInitial,
    },
  }));
  const edges: TransitionEdge[] = fsm.transitions.map((t) => ({
    id: t.id,
    source: t.from,
    target: t.to,
    sourceHandle: t.sourceHandle ?? undefined,
    targetHandle: t.targetHandle ?? undefined,
    type: "transition",
    markerEnd: { type: MarkerType.ArrowClosed, color: "#334155" },
    data: {
      priority: t.priority,
      trigger: t.trigger ?? "",
      guard: t.guard,
      action: t.action,
      labelOffset: t.labelOffset,
    },
  }));
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
      const parsed = JSON.parse(raw);
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
