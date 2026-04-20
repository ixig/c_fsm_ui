"use client";

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  type NodeTypes,
  type EdgeTypes,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useEffect } from "react";
import { StateNode } from "./StateNode";
import { TransitionEdge } from "./TransitionEdge";
import { Toolbar } from "./Toolbar";
import { StateEditorModal } from "./StateEditorModal";
import { TransitionEditorModal } from "./TransitionEditorModal";
import { useFsmStore } from "@/lib/store";
import { usePersistence } from "@/lib/persistence";

const nodeTypes: NodeTypes = { state: StateNode };
const edgeTypes: EdgeTypes = { transition: TransitionEdge };
const GRID_SIZE = 20;

function FsmEditorInner() {
  const nodes = useFsmStore((s) => s.nodes);
  const edges = useFsmStore((s) => s.edges);
  const onNodesChange = useFsmStore((s) => s.onNodesChange);
  const onEdgesChange = useFsmStore((s) => s.onEdgesChange);
  const onConnect = useFsmStore((s) => s.onConnect);
  const setNodes = useFsmStore((s) => s.setNodes);
  const openStateModal = useFsmStore((s) => s.openStateModal);
  const openTransitionModal = useFsmStore((s) => s.openTransitionModal);

  usePersistence();

  const handleNodeDragStop = (_: React.MouseEvent, node: Node) => {
    const snappedX = Math.round(node.position.x / GRID_SIZE) * GRID_SIZE;
    const snappedY = Math.round(node.position.y / GRID_SIZE) * GRID_SIZE;
    if (snappedX !== node.position.x || snappedY !== node.position.y) {
      setNodes(nodes.map((n) => n.id === node.id ? { ...n, position: { x: snappedX, y: snappedY } } : n));
    }
  };

  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    openStateModal(node.id);
  };
  const handleEdgeClick = (_: React.MouseEvent, edge: Edge) => {
    openTransitionModal(edge.id);
  };

  useEffect(() => {
    document.title = "FSM Editor";
  }, []);

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={handleNodeDragStop}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls />
        <MiniMap pannable zoomable />
      </ReactFlow>
      <Toolbar />
      <StateEditorModal />
      <TransitionEditorModal />
      {nodes.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="text-neutral-400 text-sm">
            Click <span className="font-semibold">+ Add State</span> to begin.
          </p>
        </div>
      )}
    </div>
  );
}

export function FsmEditor() {
  return (
    <ReactFlowProvider>
      <FsmEditorInner />
    </ReactFlowProvider>
  );
}
