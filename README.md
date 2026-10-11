# <project name>

![Schematic](__snapshots__/index.circuit-schematic.snap.svg)

![PCB layout](docs/images/pcb.png)

![3D view](docs/images/3d.png)

PCB design written in [tscircuit](https://tscircuit.com) (React/TSX, compiled by the `tsci` CLI). This file is the project doc: the brief (requirements) the design is built from, then design decisions and status, kept current as the design evolves.

> Template note: the circuit and images above are a placeholder (one resistor, one LED, one connection). Fill in **Requirements** below, then ask Claude to build the design from this README; see `CLAUDE.md`.

## How it works

Claude Code reads this README (the brief), writes and edits the board file (React/TSX), and runs the check ladder; it reads the errors and hints and iterates until the design is clean. The layout and circuit rules are read by URL from `agentic-pcb/example-base`, they are not copied into projects.

```mermaid
flowchart TD
    you(["You: fill in Requirements in README.md"]) --> claude

    claude["<b>Claude Code</b><br/>follows CLAUDE.md + tscircuit skill<br/>chooses parts, computes values"]
    rules[("<b>LAYOUT_RULES.md</b><br/>CIRCUIT_RULES.md<br/>(read by URL from example-base)")]
    parts[("<b>jlcsearch</b><br/>basic / Economic JLCPCB parts")]
    board["<b>index.circuit.tsx</b><br/>tscircuit React/TSX board<br/>supplierPartNumbers = BOM"]
    readme["<b>README.md</b><br/>status, decisions, rule audits"]

    subgraph loop ["check ladder (each stage gates the next)"]
        direction TB
        wiring["<b>npm run check:wiring</b><br/>tsc, netlist, schematic-placement"]
        place["<b>tsci check placement</b><br/>+ routing-difficulty"]
        full["<b>npm run check:full</b><br/>tsci build, check:vias, check shorts"]
        wiring --> place --> full
    end

    images[("schematic SVG snapshot<br/>docs/images/pcb.png, 3d.png")]
    gerbers[("dist/gerbers.zip<br/>Gerbers, BOM, pick and place")]
    fab(["JLCPCB order"])

    rules -. "rules" .-> claude
    parts -. "part numbers" .-> claude
    claude -- "writes / edits" --> board
    claude -- "keeps current" --> readme
    board --> wiring
    full --> images
    full -- "npm run export:gerbers,<br/>before ordering only" --> gerbers --> fab
    wiring -. "errors, hints" .-> claude
    place -. "errors, hints" .-> claude
    full -. "errors, renders" .-> claude
```

Solid arrows are data flow, dashed arrows are inputs and feedback to Claude. The `*.circuit.tsx` board files (and the helper modules they import) are what Claude edits; the `tsci` checks and `npm run` scripts are fixed runners.

## Status

Template: placeholder example only, no real design yet.

## Project map

What Claude needs to know before touching this project. `CLAUDE.md` is the shared template, identical in every project; everything specific to this project is in this README.

- **Boards:** `index.circuit.tsx` (the `mainEntrypoint`), currently the template placeholder.
- **Scripts:** the plain names (`check:fast`, `check:wiring`, `check:vias`, `check:full`, `export:images`, `export:gerbers`); no project-specific script.
- **README images:** `__snapshots__/index.circuit-schematic.snap.svg`, `docs/images/pcb.png`, `docs/images/3d.png`.
- **Tooling:** no formatter or linter.
- **Rules:** `LAYOUT_RULES.md` and `CIRCUIT_RULES.md` apply to the whole board. No audit yet: add a "Layout rules audit" and a "Circuit rules audit" table once the board exists.
- **Helpers and gotchas of this board:** none yet.

## Requirements

Fill in everything marked `TODO` before designing. Delete a bullet only if it clearly does not apply.

- **Purpose:** TODO (what the board does, in one or two sentences, with the key numbers: timing, current, frequency, ...)
- **Board size / form factor:** TODO (outline in mm). Two copper layers, top and bottom: fixed by the template (`LAYOUT_RULES.md` 64), not 1 and not 4 or more; write here only if this project really needs another count. Parts on the top side unless stated here.
- **Power sources and rails:** TODO (input voltage and connector, rails the design needs, current budget)
- **I/O (connectors, headers, mounting holes):** TODO (connector type/pitch/pin labels, mounting hole count/size/position, buttons, LEDs, test points)
- **Mechanical constraints:** TODO (enclosure, keep-outs, height limits, or "none")
- **Manufacturer and constraints:** JLCPCB; 2-layer board; vias 0.6 mm pad / 0.3 mm hole (JLCPCB's no-extra-charge size, set by `pcbStyle` on the board); all resistors/capacitors 0603; basic parts where one exists; Economic assembly (only parts marked "PCBA Type: Economic and Standard", never "Standard Only"). Change if this project differs.

## Design notes

Calculations and the reasoning behind part values, footprints, grounding, trace widths, routing. Record why, not only what.

Layout rules: see [LAYOUT_RULES.md](https://raw.githubusercontent.com/agentic-pcb/example-base/main/LAYOUT_RULES.md); part, value and wiring rules: see [CIRCUIT_RULES.md](https://raw.githubusercontent.com/agentic-pcb/example-base/main/CIRCUIT_RULES.md).

## Finding JLCPCB parts

Query the [jlcsearch](https://jlcsearch.tscircuit.com/) JSON API. Prefer basic parts (`is_basic=true`) and pick the highest stock. Example for 22k 0603 resistors:

`https://jlcsearch.tscircuit.com/resistors/list.json?package=0603&is_basic=true&is_preferred=&resistance=22000`

Then open the part page (`https://jlcpcb.com/partdetail/C<number>`) and confirm it says `PCBA Type: Economic and Standard`; jlcsearch does not expose this flag. Record the chosen part as `supplierPartNumbers={{ jlcpcb: ["C..."] }}` in `index.circuit.tsx`. Only fall back to non-basic (extended) parts if no basic one fits.

Also browse [tscircuit datasheets](https://tscircuit.com/datasheets) to discover elements.

## Setup

Requires Node and [Bun](https://bun.sh) (`tsci` runs under Bun; make sure `~/.bun/bin` is on PATH).

```bash
npm install
npm start           # tsci dev: interactive preview
npx tsci build      # compile and validate, output in dist/
npx tsci snapshot -u   # regenerate the schematic SVG snapshot (__snapshots__/index.circuit-schematic.snap.svg, embedded at the top of this README)
npm run export:images    # rebuild and refresh docs/images/{pcb,3d}.png (embedded at the top of this README)
npm run update:skill   # re-install the latest tscircuit AI skill into .claude/skills/tscircuit/ (review with git diff, commit with skills-lock.json)
```

Before sharing or fabricating, work through the checks in order: `tsci check netlist`, `schematic-placement`, `placement`, `routing-difficulty`, then `tsci build`, then `tsci check shorts`. See `.claude/skills/tscircuit/CHECKLIST.md` for the pre-fab checklist.

## References

- [tscircuit docs](https://docs.tscircuit.com/); the full docs are also available as one text file at https://docs.tscircuit.com/llms.txt
- [LAYOUT_RULES.md](https://raw.githubusercontent.com/agentic-pcb/example-base/main/LAYOUT_RULES.md): PCB alignment, routing, mounting, schematic, placement, part-specific layout, manufacturing and layer and via rules (every board is 2-layer), with `Don't:` counter-examples
- [CIRCUIT_RULES.md](https://raw.githubusercontent.com/agentic-pcb/example-base/main/CIRCUIT_RULES.md): part, value and wiring rules, each with its source and `Don't:` counter-examples
- [tscircuit datasheets](https://tscircuit.com/datasheets)
- [jlcsearch](https://jlcsearch.tscircuit.com/)
- AI skill: [tscircuit/skill](https://github.com/tscircuit/skill), installed in `.claude/skills/tscircuit/`

## Open questions / TODO

Things still to verify or decide (e.g. human review of routing/silkscreen in `tsci dev`, component rotations in JLCPCB's assembly preview before ordering).

## Decisions

Choices made and the alternatives rejected, so they are not re-litigated.
