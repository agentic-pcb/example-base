// Placeholder example: one resistor and one LED joined by a single trace. Replace with the real design (see README.md).
// R1 is an example value: (5 V - 2 V) / 330 ohm = about 9 mA (CIRCUIT_RULES LED-1).
// pcbStyle sets the size of every via (LAYOUT_RULES 66): the tscircuit default, 0.3 mm pad / 0.2 mm hole, costs extra at JLCPCB.
export default () => (
  <board width="20mm" height="10mm" thickness="1.6mm" layers={2} borderRadius={2} pcbStyle={{ viaPadDiameter: 0.6, viaHoleDiameter: 0.3 }}>

    <schematicsheet name="Main" displayName="Example" sheetIndex={0} sheetWidth="70mm" sheetHeight="50mm" />

    <resistor name="R1" schSheetName="Main" schX={-2} schY={0} resistance="330" footprint="0603" pcbX={-3.81} pcbY={0} />
    <led name="D1" schSheetName="Main" schX={2} schY={0} color="red" footprint="0603" pcbX={3.81} pcbY={0} />

    <trace name="LED_A" from="R1.pin2" to="D1.anode" />
  </board>
)
