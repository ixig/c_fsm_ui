# CLAUDE.md

This file provides guidance to agents when working with code in this repository.

## Commands

```bash
pnpm dev        # start dev server at localhost:3000
pnpm build      # production build
pnpm lint       # run ESLint
```

No test suite is configured.

## Important: Next.js Version

This project uses a potentially breaking version of Next.js. **Read `node_modules/next/dist/docs/` before writing any Next.js-specific code.** APIs and conventions may differ from training data.

## Architecture

Single-page React app — a visual finite-state machine (FSM) editor built on **React Flow** (`@xyflow/react`) with **Zustand** state management.

### Data model (`lib/types.ts`)
- `StateNode` — React Flow node with `StateNodeData` (`name`, `onEnter`, `onExit`, `isInitial`)
- `TransitionEdge` — React Flow edge with `TransitionEdgeData` (`trigger`, `guard`, `action`)
- `FsmExport` (version 1) — serialization format for import/export JSON

### State (`lib/store.ts`)
Single Zustand store `useFsmStore` owns all nodes, edges, and modal state. All mutations go through store actions — components never mutate nodes/edges directly.

### Persistence (`lib/persistence.ts`)
`usePersistence()` hook hydrates from `localStorage` (`c_fsm_ui.fsm.v1`) on mount, then debounces saves (300 ms) on any node/edge change. `exportJson`/`importJson` convert between store state and the `FsmExport` wire format.

### Component tree
```
app/page.tsx
└── FsmEditor (components/FsmEditor.tsx)  ← ReactFlowProvider wrapper
    ├── ReactFlow canvas
    │   ├── StateNode (custom node)
    │   └── TransitionEdge (custom edge)
    ├── Toolbar
    ├── StateEditorModal
    └── TransitionEditorModal
```

All components are `"use client"` — this is a pure client-side app with no server components beyond the root layout.
