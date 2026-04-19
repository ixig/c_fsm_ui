import type { Node, Edge } from "@xyflow/react";

export type StateNodeData = {
  name: string;
  onEnter?: string;
  onExit?: string;
  isInitial?: boolean;
};

export type TransitionEdgeData = {
  trigger: string;
  guard?: string;
  action?: string;
};

export type StateNode = Node<StateNodeData, "state">;
export type TransitionEdge = Edge<TransitionEdgeData, "transition">;

export type FsmExport = {
  version: 1;
  states: {
    id: string;
    name: string;
    onEnter?: string;
    onExit?: string;
    isInitial?: boolean;
    position: { x: number; y: number };
  }[];
  transitions: {
    id: string;
    from: string;
    to: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
    trigger: string;
    guard?: string;
    action?: string;
  }[];
};
