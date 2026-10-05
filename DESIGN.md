# Design rules

PCB alignment and routing rules for the board layout (`index.circuit.tsx`). A board whose geometry is fixed by its parts (e.g. an LED matrix) may be exempt; say so in the README.

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

14. **Double width for power lines:** Draw the power lines (5V, GND) twice as wide as the standard (signal) trace.
15. **Avoid vias on power lines:** Try not to use vias on the power lines (5V, GND); route them on one layer where possible.

## Project status

Record here which rules the current layout meets and where it deviates (and why), once a real design replaces the placeholder.
