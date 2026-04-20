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
- **Hover highlighting** — hovering a state highlights its outbound edges; hovering a transition edge or its label highlights both
- **Persistence** — diagram auto-saves to `localStorage` (`c_fsm_ui.fsm.v1`) on change and rehydrates on load
- **Import / Export** — round-trip the diagram as JSON via the toolbar

## Code generation

`gen_fsm_states.py` takes an exported FSM JSON file and emits a **complete, self-contained C source file** for the `c_fsm` engine:

```bash
python3 gen_fsm_states.py fsm.json > fsm_states.c
```

The generated file includes:

- **X-macro enums** (`MY_STATES` / `MY_EVENTS`) with `GEN_ENUM` / `GEN_STR` macros, producing `state_id_t`, `event_id_t`, and `state_names[]` / `event_names[]` arrays
- **Forward declarations** for every unique `on_enter`, `on_exit`, `guard`, and `action` callback referenced in the diagram
- **`states[]` table** with designated initializers, sorted transitions, and sentinel terminators
- **`#define INITIAL_STATE`** for one-line `fsm_init()` calls

State enum order: `ST_NONE`, initial state, remaining states in diagram order, `ST_COUNT`. Event enum order: `EVT_NONE`, then unique triggers sorted alphabetically.

Self-loops with the `internal` flag emit `.target = ST_NONE` (no exit/enter/timer reset). Without the flag, self-loops emit the real target (external self-transition with full exit→enter cycle).

### Usage with c_fsm

```c
#include "fsm_states.c"  /* or compile separately and link */

fsm_t fsm;
fsm_init(&fsm, states, ST_COUNT, INITIAL_STATE, &ctx, state_names, event_names, NULL);
```

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
