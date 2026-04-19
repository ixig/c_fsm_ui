"use client";

import { useEffect, useState } from "react";
import { useFsmStore } from "@/lib/store";

export function StateEditorModal() {
  const modal = useFsmStore((s) => s.modal);
  const node = useFsmStore((s) => {
    if (s.modal.kind !== "state") return null;
    const targetId = s.modal.nodeId;
    return s.nodes.find((n) => n.id === targetId) ?? null;
  });
  const closeModal = useFsmStore((s) => s.closeModal);
  const updateState = useFsmStore((s) => s.updateState);
  const deleteState = useFsmStore((s) => s.deleteState);
  const setInitialState = useFsmStore((s) => s.setInitialState);

  const [name, setName] = useState("");
  const [onEnter, setOnEnter] = useState("");
  const [onExit, setOnExit] = useState("");
  const [timeoutMs, setTimeoutMs] = useState("");
  const [isInitial, setIsInitial] = useState(false);

  useEffect(() => {
    if (node) {
      setName(node.data.name);
      setOnEnter(node.data.onEnter ?? "");
      setOnExit(node.data.onExit ?? "");
      setTimeoutMs(node.data.timeout_ms !== undefined ? String(node.data.timeout_ms) : "");
      setIsInitial(!!node.data.isInitial);
    }
  }, [node]);

  if (modal.kind !== "state" || !node) return null;

  const save = () => {
    const parsedTimeout = parseInt(timeoutMs, 10);
    updateState(node.id, {
      name: name.trim() || node.data.name,
      onEnter: onEnter.trim() || undefined,
      onExit: onExit.trim() || undefined,
      timeout_ms: timeoutMs.trim() && parsedTimeout > 0 ? parsedTimeout : undefined,
    });
    if (isInitial && !node.data.isInitial) setInitialState(node.id);
    else if (!isInitial && node.data.isInitial) setInitialState(null);
    closeModal();
  };

  const remove = () => {
    if (window.confirm(`Delete state "${node.data.name}"?`)) {
      deleteState(node.id);
    }
  };

  return (
    <ModalShell onClose={closeModal} title="Edit State">
      <Field label="Name">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-neutral-300 rounded px-2 py-1 text-sm"
        />
      </Field>
      <Field label="on_enter (function name)">
        <input
          value={onEnter}
          onChange={(e) => setOnEnter(e.target.value)}
          placeholder="e.g. logEntry"
          className="w-full border border-neutral-300 rounded px-2 py-1 text-sm font-mono"
        />
      </Field>
      <Field label="on_exit (function name)">
        <input
          value={onExit}
          onChange={(e) => setOnExit(e.target.value)}
          placeholder="e.g. cleanup"
          className="w-full border border-neutral-300 rounded px-2 py-1 text-sm font-mono"
        />
      </Field>
      <Field label="timeout_ms (positive integer, optional)">
        <input
          value={timeoutMs}
          onChange={(e) => setTimeoutMs(e.target.value.replace(/\D/g, "").replace(/^0+/, ""))}
          placeholder="e.g. 5000"
          className="w-full border border-neutral-300 rounded px-2 py-1 text-sm font-mono"
        />
      </Field>
      <label className="flex items-center gap-2 text-sm select-none">
        <input
          type="checkbox"
          checked={isInitial}
          onChange={(e) => setIsInitial(e.target.checked)}
        />
        Mark as initial state
      </label>

      <div className="flex justify-between pt-2">
        <button
          onClick={remove}
          className="px-3 py-1.5 text-sm rounded bg-red-50 hover:bg-red-100 text-red-700 font-medium"
        >
          Delete
        </button>
        <div className="flex gap-2">
          <button
            onClick={closeModal}
            className="px-3 py-1.5 text-sm rounded bg-neutral-100 hover:bg-neutral-200"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="px-3 py-1.5 text-sm rounded bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            Save
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

export function ModalShell({
  onClose,
  title,
  children,
}: {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState<{
    startX: number;
    startY: number;
    startOffsetX: number;
    startOffsetY: number;
  } | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!dragging) return;

    const onMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      setOffset({
        x: dragging.startOffsetX + (e.clientX - dragging.startX),
        y: dragging.startOffsetY + (e.clientY - dragging.startY),
      });
    };

    const onMouseUp = () => {
      setDragging(null);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setDragging({
      startX: e.clientX,
      startY: e.clientY,
      startOffsetX: offset.x,
      startOffsetY: offset.y,
    });
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onMouseDown={onClose}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px)`,
        }}
        className="bg-white rounded-lg shadow-xl w-[380px] p-5 flex flex-col gap-3"
      >
        <h2
          onMouseDown={handleMouseDown}
          className="text-base font-semibold text-neutral-900 cursor-move select-none"
        >
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-neutral-700">{label}</span>
      {children}
    </label>
  );
}
