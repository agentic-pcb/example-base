# Design rules

Schematic and PCB rules for the board (`index.circuit.tsx`): alignment (1-13), routing (14-15), mounting (16), schematic (17-18) and placement (19-25). A board whose geometry is fixed by its parts (e.g. an LED matrix) may be exempt; say so in the README. Where two rules pull against each other the electrical one wins (decoupling, rule 22, over via avoidance, rule 15, and over equal spacing, rules 10 and 11); the status table at the end records every such exception.

## Alignment rules

1. **Share baselines:** Put pin rows of neighboring modules, headers, and connectors on one common top, bottom, or center line.
2. **Keep margins equal:** Give the left and right edges the same margin, and the top and bottom edges the same margin.
3. **Place on a grid:** Put every part on one grid, such as 1.27 mm or 2.54 mm.
4. **Use one orientation per part type:** Face all resistors, caps, and ICs the same way, and rotate parts only by 0° and 90°.
5. **Keep pitch constant:** Space equal parts and pads evenly, and use one pitch per connector row.
6. **Use one pad size per function:** Give all connector pads one diameter and one drill, and all header pads one diameter and one drill.
7. **Print labels on one baseline:** Use one text size and one baseline for pad labels, and one smaller size for designators.
8. **Place labels next to their parts:** Put each label directly beside its part, on the same side for every part, clear of pads, outlines, and vias.
9. **Label every pad:** Give each pad and connector a short, unambiguous label.
10. **Space blocks equally:** Keep the same gap between modules and between groups of parts.
11. **Distribute space evenly:** Spread the parts across the board, or shrink the board until the free space is balanced.
12. **Inset mounting holes equally:** Place all four the same distance from the corners, with clearance from pads.
13. **Align edge parts to one line:** Place parts near an edge at one shared distance from it, and put edge connectors flush with the edge on purpose.

## Routing rules

14. **Double width for power lines:** Draw the power lines (5V, GND) at least twice as wide as the standard (signal) trace.
15. **Avoid vias on power lines:** Try not to use vias on the power lines (5V, GND); route them on one layer where possible. A via at the GND pad of a decoupling capacitor or of a regulator is accepted when the alternative is a longer path (rule 22 wins).

## Mounting rules

16. **Keep the screw head area free:** Around every mounting hole keep a free circle of twice the screw head width: 3.5 mm hole, 3 mm screw (5.5 mm head), 6 mm free diameter, concentric with the hole. Place no component, pad or silkscreen text inside it, as far as the board allows. Traces and the copper pour may run through it.

## Schematic rules

17. **Group by function:** Give every functional block (e.g. MCU, power, outputs, input) its own `<schematicsection>` (`schSectionName`) on the one sheet and keep its parts clustered by `schX`/`schY`, with a clear gap between blocks. Add a second sheet only when a block no longer fits on one.
18. **Draw the signal path left to right:** Put the inputs (power in, buttons) on the left, the core (MCU, IC) in the middle and the outputs (drivers, connectors) on the right, so the circuit reads from left to right. Keep the pins of one function on one side of a symbol (inputs left, outputs right, supply on top, GND below).

## Placement rules

19. **Place the fixed parts first:** Connectors, module headers and the power input (their positions come from the case and the pin rows) go first; then the power parts, then the small parts around them.
20. **Keep a function block together:** Put the parts of one block next to each other (the whole power supply, the whole level shifter section). A block may only split when a pin position forces it.
21. **Separate analog, digital and power:** Keep analog parts (audio, sensors, lines with current peaks), the digital side (MCU, logic, data lines) and the power parts in their own areas; no digital line runs alongside a sensitive or high-current analog line, and the supply parts sit on the supply path.
22. **Decouple at the pin:** Put the decoupling capacitor of every IC within 3 mm (pad centre to pad centre) of its power pin, or as close as physically possible, joined by a short, wide trace (at least the width of rule 14 for 5V and GND). This rule is a must. Modules that carry their own capacitors are exempt.
23. **Keep crystals close:** A crystal sits within 5 mm of the MCU or clock chip, and its clock traces are short, straight and of equal length.
24. **Keep the board edge free:** Keep every part body, pad and silkscreen text at least 1.27 mm (0.05 in) from the board edge, so nothing is damaged when the board is separated from a panel (5 mm if the board is cut from a panel by routed tabs; say in the README if a panel is used). Deliberate edge parts (rule 13) are the exception.
25. **Handle heat:** Put high-heat parts (regulators, MOSFETs, power resistors) in the airflow and give them copper to spread the heat: a dedicated pour on their tab, thermal vias, and wide traces.

## Project status

Audit the layout against rules 1..25 once a real design replaces the placeholder: board size, grid origin (board centre) and grid step, with numbers measured from `dist/<name>/circuit.json`. One row per rule: `pass`, `exception` (say what and why, including every rule-22 / rule-15 trade-off) or `n/a`.

| # | Status | How |
| --- | --- | --- |

Placeholder (20 x 10 mm, one resistor, one LED, one trace): audited against all 25 rules; rule 3 was the only miss (parts at ±4 mm, now ±3.81 mm = 3 x 1.27 mm); everything else holds or is n/a (no connectors, holes, ICs or power nets).
