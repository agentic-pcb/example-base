# Design rules

Generic schematic and PCB rules for any tscircuit board (`*.circuit.tsx`). This file is the single source of truth, referenced by URL; it is not copied into projects. Rules: alignment (1-13), routing (14-17 and 39-40), mounting (18), schematic (19-20 and 29-36), placement (21-27, 37-38 and 41-42), silkscreen groups (43) and outline (28). Schematic rules change layout only (positions, rotation, pin side and order, sheet size, trace labels), never the netlist or the parts, so they can always be met in the `*.circuit.tsx`. A board whose geometry is fixed by its parts (e.g. an LED matrix) may be exempt; say so in the project README, together with every other exception. Where two rules pull against each other the electrical one wins (decoupling, rule 24, over via avoidance, rule 15, and over equal spacing, rules 10 and 11); on the schematic a correct, readable connection wins over compactness.

## Alignment rules

1. **Share baselines:** Put pin rows of neighboring modules, headers, and connectors on one common top, bottom, or center line; do the same for small parts (a row of resistors or caps shares one center line).
2. **Keep margins equal:** Give the left and right edges the same margin, and the top and bottom edges the same margin.
3. **Place on a grid:** Put every part on one grid, such as 1.27 mm or 2.54 mm.
4. **Use one orientation per part type:** Face all resistors, caps, and ICs the same way, and rotate parts only by 0° and 90°.
5. **Keep pitch constant:** Space equal parts and pads evenly, and use one pitch per connector row.
6. **Use one pad size per function:** Give all connector pads one diameter and one drill, and all header pads one diameter and one drill.
7. **Print labels on one baseline:** Use one text size and one baseline for pad labels, and one smaller size for designators, on the same side of every part. Text reads horizontally; where space forces a turn, turn all such text the same way (bottom to top), never mix. Module names are horizontal too unless the module is narrower than its name.
8. **Place labels next to their parts:** Put each label directly beside its part, clear of pads, outlines, and vias. Put designators above their parts; one moves only when the courtyard forbids it, and then every designator of that cluster moves.
9. **Label every pad:** Give each pad and connector a short, unambiguous pin label, and each pad group a group label (rule 43).
10. **Space blocks equally:** Keep the same gap between modules and between groups of parts.
11. **Distribute space evenly:** Spread the parts across the board, or shrink the board until the free space is balanced.
12. **Inset mounting holes equally:** Place all four the same distance from the corners, with clearance from pads.
13. **Align edge parts to one line:** Place parts near an edge at one shared distance from it, and put edge connectors flush with the edge on purpose.

## Routing rules

14. **Double width for power lines:** Draw every power line (any voltage net such as 5V, 3V3, VCC, VDD, VIN, VBUS) and GND at least twice as wide as the standard (signal) trace.
15. **Avoid vias on power lines:** Try not to use vias on any power line (5V, 3V3, VCC, VDD, VIN, VBUS, every supply net other than GND); route them on one layer where possible. A via on a power line at a decoupling capacitor or a regulator is accepted when the alternative is a longer path (rule 24 wins).
16. **Pour GND copper:** Try to fill the free area of the bottom layer of the board with a GND copper pour; do not pour on the top layer. Connect top-layer GND pads to the bottom pour with GND vias. Keep the pour clear of the board edge (rule 26) and of any antenna or keep-out area.
17. **Avoid 90 degree corners:** Try not to turn a trace by 90 degrees; make every corner two 45 degree bends instead. A T junction (a trace joining another one) is allowed. A short cut (down to 0.3 mm) where a pad is close, or a bend inside a pad, is accepted. For hand-routed copper (`<trace pcbPath>`) write a small helper that cuts each corner; check autorouted copper in the render and fix any 90 degree corner with an explicit `pcbPath`.

## Mounting rules

18. **Keep the screw head area free:** Around every mounting hole keep a free circle of twice the screw head width: 3.5 mm hole, 3 mm screw (5.5 mm head), 6 mm free diameter, concentric with the hole. Place no component, pad or silkscreen text inside it, as far as the board allows. Traces and the copper pour may run through it.

## Schematic rules

19. **Group by function:** Give every functional block (e.g. MCU, power, outputs, input) its own `<schematicsection>` (`schSectionName`) on the one sheet and keep its parts clustered by `schX`/`schY`, with a clear gap between blocks. The installed `tsci` draws no section title or frame (`<schematictext>`, `<schematicrect>` and `<schematicbox>` do not render), so the clustering and the gap are the only visible grouping. Add a second sheet only when a block no longer fits on one.
20. **Draw the signal path left to right:** Put the inputs (power in, buttons) on the left, the core (MCU, IC) in the middle and the outputs (drivers, connectors) on the right, so the circuit reads from left to right. Keep the pins of one function on one side of a symbol (inputs left, outputs right, supply on top, GND below), and order them as the parts they connect to, so wires do not cross.

## Placement rules

21. **Place the fixed parts first:** Connectors, module headers and the power input (their positions come from the case and the pin rows) go first; then the power parts, then the small parts around them.
22. **Keep a function block together on the board:** Put the parts of one block next to each other (the whole power supply, the whole level shifter section). A block may only split when a pin position forces it.
23. **Separate analog, digital and power:** Keep analog parts (audio, sensors, lines with current peaks), the digital side (MCU, logic, data lines) and the power parts in their own areas; no digital line runs alongside a sensitive or high-current analog line, and the supply parts sit on the supply path.
24. **Decouple at the pin:** Put the decoupling capacitor of every IC within 3 mm (pad centre to pad centre) of its power pin, or as close as physically possible, joined by a short, wide trace (at least the width of rule 14 for 5V and GND). This rule is a must. Modules that carry their own capacitors are exempt.
25. **Keep crystals close:** A crystal sits within 5 mm of the MCU or clock chip, and its clock traces are short, straight and of equal length.
26. **Keep the board edge free:** Keep every part body (measure the 3D body or courtyard, not only the pads: a tabbed part such as a SOT-223 lies fully inside the outline), pad and silkscreen text at least 1.27 mm (0.05 in) from the board edge, so nothing is damaged when the board is separated from a panel (5 mm if the board is cut from a panel by routed tabs; say in the README if a panel is used). Deliberate edge parts (rule 13) are the exception.
27. **Handle heat:** Put high-heat parts (regulators, MOSFETs, power resistors) in the airflow and give them copper to spread the heat: a dedicated pour on their tab, thermal vias, and wide traces.

## Outline rules

28. **Round the board corners:** Give every outer corner of the board a 2 mm radius (`<board borderRadius={2}>`), also for a board cut from a panel. Keep part bodies, pads and silkscreen text clear of the rounded corner; the edge clearance of rule 26 is measured from the curve.

## Schematic readability rules

Each rule names the prop that meets it. Render the schematic (`tsci export -f schematic-svg`, `rsvg-convert -w 4000`) and check it against the review list below.

29. **Group unused pins:** On a module or MCU, list the used pins first, grouped by function on the side facing their block, and put the unused pins together on the remaining side or at the end of one side (`schPinArrangement`, gaps with `schPinStyle`). Never put an unused pin between used ones. The pins stay; hiding them would change the part.
30. **Keep every part at its pin:** Draw a decoupling or bulk cap, a pull-up and a series resistor right next to the pin or rail it serves (`schX`/`schY`), close enough that the auto wire joins them (`schMaxTraceDistance`). No part floats far from its block with only supply stubs.
31. **Short, straight wires:** Put `schX`/`schY` on a 0.5 unit grid and align the pins of connected parts on one line, so the auto wire is straight; a wire has at most one bend. The router bends are not settable, so straightness comes from the placement. A connection that cannot be short becomes a label pair (rule 32).
32. **One connection style per net, with real labels:** Wire all pins of a net the same way: pin to pin, or all via `net.X`. Give every trace that draws a stub or a flag a meaningful `name` or `schDisplayLabel` (`DISCH`, `V5`), never the default `T8`, `T20`. A stub is never left without a label, and a label never sits mid-wire. Do not add `<netlabel>`: it draws a second label next to the trace one.
33. **Keep text horizontal:** Put supply pins on the top and bottom side of a symbol and signal pins on the left and right side, so stubs and their labels run horizontally. Rotate parts by 0 and 180 degrees only, except two-pin passives on a vertical path (90, 270). Never turn a connector sideways.
34. **Face connectors toward the core:** A connector at the left edge has its pins on its right side, one at the right edge has them on its left, one pin row each, pin 1 on top. Connectors of one edge share one `schX` (or `schY`).
35. **Space wires and blocks evenly:** Wires of different nets that run side by side are at least 1 unit apart; otherwise use labels. Gaps between blocks are equal (6-8 units or more), margins to the sheet frame are equal and the drawing is centred (`<schematicsheet sheetWidth sheetHeight>`). A large empty area means move the blocks closer or shrink the sheet.
36. **Put the core in the middle:** The MCU or main IC sits at the centre and each block that talks to it on the side its pins face, at a similar distance. Power block lower left, inputs left, outputs and analog (audio) right.

### Schematic review (after every render)

- No part floats away from its block (30); no unused pin between used ones (29).
- No wire with more than one bend or running past a symbol (31); no unlabelled stub, no default `T8` names, one style per net (32).
- No sideways text, no connector turned sideways, connectors face the core (33, 34).
- Equal gaps and margins, centred, no large empty area (35, 36).

## Placement and routing rules, continued

37. **Keep clearance between parts:** Keep at least 0.5 mm between the courtyards of two parts and at least 1 mm between a part and the outline of a module or header. No courtyard overlap and no pad under another part's body. `tsci check placement` reports courtyard and pad overlaps; the 0.5 mm gap itself is checked in the render.
38. **Put small parts on lines:** Place the passives of a cluster in a row or column on one center line with one pitch (rule 5), designators on one side (rule 8). The parts around an IC use the same offset from it, and are rotated by 0 or 90 degrees only (rule 4).
39. **Route a pair together:** Run the two lines of one signal pair (speaker +/-, differential pair) side by side on one layer with a constant gap (twice the trace width) and equal length, and let them leave the area together. Compare lengths with `tsci check trace-length <pin>`.
40. **No dangling copper:** Start and end every trace on a pad or via. No stubs, no open ends, no copper islands (remove a pour that cannot connect).
41. **Follow the power path:** Place the input connector, its bulk cap, the regulator and the loads in that order along the supply path: the bulk cap within 10 mm of the input connector, the regulator caps at the regulator (rule 24). Do not run the supply across the board and back (rules 21, 23).
42. **Mark pin 1 and polarity:** Show pin 1 of every IC and module, and the polarity of every polarized part (electrolytic or tantalum cap, LED, diode), on the silkscreen, where the part body does not cover it.

## Silkscreen group rule

43. **Label every pad group:** Besides the pin label on each pad (rule 9), give each connector or header group one group label that names its function: `Power` for 5V+GND, `Speaker` for SPK-+SPK+, `I2C` for 5V+GND+SCL+SDA. Print it with `<silkscreentext>`, centered on the group, on the same side as the pin labels but about 1.5 mm further from the pads, in one size for all groups (larger than the pin labels), and draw a thin `<silkscreenline>` along the group, from its first to its last pad, so the extent is clear. Use short one-word names in Title case, the same as the schematic sections (rule 19). A group of one pad needs no group label.

### PCB review (after every layout change)

- All bodies, tabs included, inside the outline (26); no courtyard closer than 0.5 mm (37).
- Small parts on lines, designators on one side, text horizontal (1, 7, 8, 38).
- Pairs parallel and equal (39); no stubs (40); supply path short (41).
- Pin 1 and polarity marked (42); every pad group has a group label (43).
