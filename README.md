# c_fsm_ui

A visual finite-state machine editor — drag-and-drop states, connect transitions, edit triggers/guards/actions, and import/export the diagram as JSON.

Built with Next.js 16, React 19, React Flow (`@xyflow/react`), Zustand, and Tailwind CSS 4.

## Getting started

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # production build
pnpm lint       # run ESLint
```

There is no test suite.

## Features

- **States** — add via the toolbar, rename, edit `onEnter` / `onExit` actions, set `timeout_ms`, mark one as the initial state
- **Transitions** — drag from a node handle to another to connect; edit `trigger`, `guard`, `action`, and `priority` in the modal; transition label boxes are repositionable
- **Self-loops** — drag a handle back onto the same node
- **Hover highlighting** — hovering a state highlights its outbound edges; hovering a transition label highlights the edge
- **Persistence** — diagram auto-saves to `localStorage` (`c_fsm_ui.fsm.v1`) on change and rehydrates on load
- **Import / Export** — round-trip the diagram as JSON via the toolbar

## Code generation

`gen_fsm_states.py` takes an exported FSM JSON file and emits a C `states[]` array suitable for a table-driven FSM engine:

```bash
python3 gen_fsm_states.py fsm.json > fsm_states.c
```

Each state maps to a `state_t` entry with `.on_enter`, `.on_exit`, `.timeout_ms`, and a sentinel-terminated `.transitions` array. Transitions are sorted by `priority` and reference state names as enum values (e.g. `ST_IDLE`), so the generated file compiles alongside a matching `state_t` / `transition_t` definition and a `typedef enum { ..., ST_COUNT } state_id_t;`.

## Project layout

```
app/                 Next.js App Router entry (layout, page, globals)
components/          FsmEditor, StateNode, TransitionEdge, Toolbar, modals
lib/
  constants.ts       STATE_NODE_WIDTH, STATE_NODE_HEIGHT, GRID_SIZE
  types.ts           StateNode, TransitionEdge, FsmExport types
  store.ts           Zustand store (useFsmStore) — single source of truth
  persistence.ts     localStorage hydration + JSON import/export
```
