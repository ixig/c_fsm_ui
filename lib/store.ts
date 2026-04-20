"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  MarkerType,
  type Connection,
  type EdgeChange,
  type NodeChange,
} from "@xyflow/react";
import type {
  StateNode,
  TransitionEdge,
  StateNodeData,
  TransitionEdgeData,
} from "./types";

import { GRID_SIZE } from "./constants";

export type ModalState =
  | { kind: "none" }
  | { kind: "state"; nodeId: string }
  | { kind: "transition"; edgeId: string };

type FsmStore = {
  nodes: StateNode[];
  edges: TransitionEdge[];
  modal: ModalState;
  hoveredEdgeId: string | null;
  hoveredNodeId: string | null;

  setNodes: (nodes: StateNode[]) => void;
  setEdges: (edges: TransitionEdge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  addState: (name: string, position: { x: number; y: number }) => string;
  updateState: (id: string, patch: Partial<StateNodeData>) => void;
  deleteState: (id: string) => void;
  setInitialState: (id: string | null) => void;

  updateTransition: (id: string, patch: Partial<TransitionEdgeData>) => void;
  deleteTransition: (id: string) => void;
  setHoveredEdge: (id: string | null) => void;
  setHoveredNode: (id: string | null) => void;

  openStateModal: (nodeId: string) => void;
  openTransitionModal: (edgeId: string) => void;
  closeModal: () => void;

  replaceAll: (nodes: StateNode[], edges: TransitionEdge[]) => void;
  clear: () => void;
};

export const useFsmStore = create<FsmStore>((set, get) => ({
  nodes: [],
  edges: [],
  modal: { kind: "none" },
  hoveredEdgeId: null,
  hoveredNodeId: null,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) =>
    set((s) => ({
      nodes: applyNodeChanges(changes, s.nodes) as StateNode[],
    })),

  onEdgesChange: (changes) =>
    set((s) => ({
      edges: applyEdgeChanges(changes, s.edges) as TransitionEdge[],
    })),

  onConnect: (connection) => {
    const id = nanoid(8);
    set((s) => {
      const priority = s.edges.filter((e) => e.source === connection.source).length;
      const edge: TransitionEdge = {
        id,
        source: connection.source!,
        target: connection.target!,
        sourceHandle: connection.sourceHandle ?? undefined,
        targetHandle: connection.targetHandle ?? undefined,
        type: "transition",
        markerEnd: { type: MarkerType.ArrowClosed, color: "#334155" },
        data: { priority, trigger: "" },
      };
      return {
        edges: addEdge(edge, s.edges) as TransitionEdge[],
        modal: { kind: "transition", edgeId: id },
      };
    });
  },

  addState: (name, position) => {
    const id = nanoid(8);
    const hasInitial = get().nodes.some((n) => n.data.isInitial);
    
    // Snap to grid for extra safety
    const snappedPosition = {
      x: Math.round(position.x / GRID_SIZE) * GRID_SIZE,
      y: Math.round(position.y / GRID_SIZE) * GRID_SIZE,
    };

    const node: StateNode = {
      id,
      type: "state",
      position: snappedPosition,
      data: { name, isInitial: !hasInitial },
    };
    set((s) => ({ nodes: [...s.nodes, node] }));
    return id;
  },

  updateState: (id, patch) =>
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...patch } } : n,
      ),
    })),

  deleteState: (id) =>
    set((s) => {
      const remainingEdges = s.edges.filter((e) => e.source !== id && e.target !== id);
      const wasHoveredEdgeDeleted = s.hoveredEdgeId && !remainingEdges.some(e => e.id === s.hoveredEdgeId);
      return {
        nodes: s.nodes.filter((n) => n.id !== id),
        edges: remainingEdges,
        modal: { kind: "none" },
        hoveredEdgeId: wasHoveredEdgeDeleted ? null : s.hoveredEdgeId,
        hoveredNodeId: s.hoveredNodeId === id ? null : s.hoveredNodeId,
      };
    }),

  setInitialState: (id) =>
    set((s) => ({
      nodes: s.nodes.map((n) => ({
        ...n,
        data: { ...n.data, isInitial: id !== null && n.id === id },
      })),
    })),

  updateTransition: (id, patch) =>
    set((s) => ({
      edges: s.edges.map((e) =>
        e.id === id ? { ...e, data: { ...(e.data ?? { trigger: "" }), ...patch } } : e,
      ),
    })),

  deleteTransition: (id) =>
    set((s) => ({
      edges: s.edges.filter((e) => e.id !== id),
      modal: { kind: "none" },
      hoveredEdgeId: s.hoveredEdgeId === id ? null : s.hoveredEdgeId,
    })),

  setHoveredEdge: (id) => set({ hoveredEdgeId: id }),
  setHoveredNode: (id) => set({ hoveredNodeId: id }),

  openStateModal: (nodeId) => set({ modal: { kind: "state", nodeId } }),
  openTransitionModal: (edgeId) => set({ modal: { kind: "transition", edgeId } }),
  closeModal: () => set({ modal: { kind: "none" } }),

  replaceAll: (nodes, edges) => set({ nodes, edges, modal: { kind: "none" } }),
  clear: () => set({ nodes: [], edges: [], modal: { kind: "none" }, hoveredEdgeId: null, hoveredNodeId: null }),
}));
