#!/usr/bin/env python3
import json
import sys
from collections import defaultdict

def emit_transition(t, id_to_name, indent):
    lines = [f"{indent}{{"]
    lines.append(f"{indent}  .event = {t['trigger']},")
    guard = t.get("guard")
    if guard:
        lines.append(f"{indent}  .guard = {guard},")
    action = t.get("action")
    if action:
        lines.append(f"{indent}  .action = {action},")
    target = "ST_NONE" if t["from"] == t["to"] else id_to_name[t["to"]]
    lines.append(f"{indent}  .target = {target}")
    lines.append(f"{indent}}},")
    return lines

def generate(fsm_path):
    with open(fsm_path) as f:
        fsm = json.load(f)

    id_to_name = {s["id"]: s["name"] for s in fsm["states"]}

    by_from = defaultdict(list)
    for t in fsm["transitions"]:
        by_from[t["from"]].append(t)
    errors = []
    for sid, lst in by_from.items():
        priorities = [t["priority"] for t in lst]
        seen = set()
        for p in priorities:
            if p in seen:
                errors.append(f"State '{id_to_name[sid]}' has multiple transitions with priority {p}")
            seen.add(p)
    if errors:
        for e in errors:
            print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

    for lst in by_from.values():
        lst.sort(key=lambda t: t["priority"])

    out = []
    out.append("// fmt: off")
    out.append("static const state_t states[ST_COUNT] = {")

    for state in fsm["states"]:
        sid = state["id"]
        name = state["name"]
        out.append(f"  [{name}] = {{")
        if "onEnter" in state:
            out.append(f"    .on_enter = {state['onEnter']},")
        if "onExit" in state:
            out.append(f"    .on_exit = {state['onExit']},")
        if "timeout_ms" in state:
            out.append(f"    .timeout_ms = {state['timeout_ms']},")
        out.append("    .transitions = (const transition_t[]) {")
        for t in by_from.get(sid, []):
            out.extend(emit_transition(t, id_to_name, "      "))
        out.append("      {0}, /* sentinel */")
        out.append("    }")
        out.append("  },")

    out.append("};")
    out.append("// fmt: on")
    print("\n".join(out))

if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else "fsm.json"
    generate(path)
