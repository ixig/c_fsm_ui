"use client";

import { useEffect, useState } from "react";
import { useFsmStore } from "@/lib/store";
import { ModalShell, Field } from "./StateEditorModal";

export function TransitionEditorModal() {
  const modal = useFsmStore((s) => s.modal);
  const edge = useFsmStore((s) => {
    if (s.modal.kind !== "transition") return null;
    return s.edges.find((e) => e.id === s.modal.edgeId) ?? null;
  });
  const sourceName = useFsmStore((s) => {
    if (s.modal.kind !== "transition") return "";
    const e = s.edges.find((ed) => ed.id === s.modal.edgeId);
    if (!e) return "";
    return s.nodes.find((n) => n.id === e.source)?.data.name ?? "?";
  });
  const targetName = useFsmStore((s) => {
    if (s.modal.kind !== "transition") return "";
    const e = s.edges.find((ed) => ed.id === s.modal.edgeId);
    if (!e) return "";
    return s.nodes.find((n) => n.id === e.target)?.data.name ?? "?";
  });
  const closeModal = useFsmStore((s) => s.closeModal);
  const updateTransition = useFsmStore((s) => s.updateTransition);
  const deleteTransition = useFsmStore((s) => s.deleteTransition);

  const [trigger, setTrigger] = useState("");
  const [guard, setGuard] = useState("");
  const [action, setAction] = useState("");

  useEffect(() => {
    if (edge) {
      setTrigger(edge.data?.trigger ?? "");
      setGuard(edge.data?.guard ?? "");
      setAction(edge.data?.action ?? "");
    }
  }, [edge]);

  if (modal.kind !== "transition" || !edge) return null;

  const save = () => {
    updateTransition(edge.id, {
      trigger: trigger.trim(),
      guard: guard.trim() || undefined,
      action: action.trim() || undefined,
    });
    closeModal();
  };

  const remove = () => {
    if (window.confirm("Delete this transition?")) deleteTransition(edge.id);
  };

  const resetPosition = () => {
    updateTransition(edge.id, { labelOffset: undefined });
  };

  return (
    <ModalShell onClose={closeModal} title="Edit Transition">
      <p className="text-xs text-neutral-500">
        <span className="font-medium">{sourceName}</span>
        {" → "}
        <span className="font-medium">{targetName}</span>
      </p>
      <Field label="trigger (event name)">
        <input
          autoFocus
          value={trigger}
          onChange={(e) => setTrigger(e.target.value.toUpperCase())}
          placeholder="e.g. USER_CLICKED"
          className="w-full border border-neutral-300 rounded px-2 py-1 text-sm font-mono"
        />
      </Field>
      <Field label="guard (function name, optional)">
        <input
          value={guard}
          onChange={(e) => setGuard(e.target.value)}
          placeholder="e.g. isAuthorized"
          className="w-full border border-neutral-300 rounded px-2 py-1 text-sm font-mono"
        />
      </Field>
      <Field label="action (function name, optional)">
        <input
          value={action}
          onChange={(e) => setAction(e.target.value)}
          placeholder="e.g. submitForm"
          className="w-full border border-neutral-300 rounded px-2 py-1 text-sm font-mono"
        />
      </Field>

      {edge.data?.labelOffset && (
        <button
          onClick={resetPosition}
          className="text-[10px] text-blue-600 hover:underline mt-1"
        >
          Reset label position
        </button>
      )}

      <div className="flex justify-between pt-4">
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
