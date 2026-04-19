# c_fsm_ui

A visual finite-state machine editor — drag-and-drop states, connect transitions, edit triggers/guards/actions, and import/export the diagram as JSON.

Built with Next.js 16, React 19, [React Flow](https://reactflow.dev/) (`@xyflow/react`), Zustand, and Tailwind CSS 4.

## Getting started

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # production build
pnpm lint       # run ESLint
```

There is no test suite.

## Features

- **States** — add via the toolbar, rename, edit `onEnter` / `onExit` actions, mark one as the initial state
- **Transitions** — drag from a node handle to another to connect; edit `trigger`, `guard`, and `action` in the modal
- **Self-loops** — drag a handle back onto the same node
- **Persistence** — diagram auto-saves to `localStorage` (`c_fsm_ui.fsm.v1`) on change and rehydrates on load
- **Import / Export** — round-trip the diagram as JSON via the toolbar

## Project layout

```
app/                 Next.js App Router entry (layout, page, globals)
components/          FsmEditor, StateNode, TransitionEdge, Toolbar, modals
lib/
  types.ts           StateNode, TransitionEdge, FsmExport types
  store.ts           Zustand store (useFsmStore) — single source of truth
  persistence.ts     localStorage hydration + JSON import/export
```

See `CLAUDE.md` for architectural detail.
