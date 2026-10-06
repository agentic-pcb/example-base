# Circuit rules

Generic electronics rules for choosing parts and values in any tscircuit board (`*.circuit.tsx`). `DESIGN.md` says where parts go (alignment, routing, placement, schematic layout); this file says which parts and values to use and how to wire them. The datasheet of the actual part beats both files. Rule IDs carry a section prefix (G, C, R, Q, P, ESP, AVR, STM, RP, UART, PR, LED, FUSE, ISO, RLY, XTAL, LOGIC, OPTO, RF, IR) so they never collide with the numbers of `DESIGN.md`; cite them as "CIRCUIT_RULES C3".

Every rule carries a source tag `[S#]` (list at the end), read on 2026-10-06. Where the sources disagree, the vendor document wins and the disagreement is noted. A rule with no tag is a project convention. Numbers marked "per datasheet" are not given here on purpose: use the value in the datasheet of the part you choose. For tscircuit: record the chosen part in `supplierPartNumbers`, put the calculation in the README Design notes, and use only JLCPCB Economic parts (see `CLAUDE.md`).

## General

- **G1. Write the spec and a block diagram first:** list inputs and outputs, voltage, current, power, temperature and frequency range, board size and budget, then draw the blocks; the blocks become the schematic sections (`DESIGN.md` 19). [S1]
- **G2. Start from the datasheet reference circuit** and its calculations; read the datasheet fully before choosing a part. [S1]
- **G3. Derate 1.5-2x:** choose parts rated 1.5-2x above the real voltage, current and power (a resistor dissipates at most 50 % of its rating); keep a power dissipation list per part. [S1]
- **G4. Use standard values and long-lived parts:** standard resistor/capacitor values are cheaper; avoid parts with long lead times; prefer parts available for 5-7 years. [S1]
- **G5. Use MCU peripherals** (timers, PWM, ADC, DAC, I2C, SPI) instead of extra parts where they fit. [S1]
- **G6. Fix every floating input:** a floating input sits at an undefined voltage (0.9-2.7 V on a 5 V logic input); add a pull-up or pull-down, after checking the MCU's internal pulls. [S1]
- **G7. A 0 ohm resistor is a switch for the layout:** use it to make a circuit part optional, as a measuring point or a jumper on low-speed nets; not on high-speed lines (parasitic inductance). [S1]
- **G8. Document why:** record the reason for each part or value in the README Design notes. [S1]

## Capacitors

| Job | Type | Notes |
|---|---|---|
| Timing, crystal load, RF, filters, ADC reference | C0G/NP0 ceramic | 0 +/- 30 ppm/C, no DC-bias effect [S3, S4] |
| Decoupling, bypass, smoothing | X7R ceramic | +/-15 % over -55..125 C; DC bias applies [S2, S3] |
| Space-limited consumer boards | X5R ceramic | max +85 C [S3] |
| Never | Y5V / Z5U | +22/-82 % capacitance swing [S2, S4] |
| Bulk, 10-100 uF at input or regulator | Aluminium electrolytic or polymer | polarized; electrolytic dries out and its life falls with temperature [S2, S4] |
| Compact bulk, low ESR, no DC bias | Polymer (Al or Ta) | ESR like ceramic, no microphonics, no leakage [S4] |
| Stable bulk, audio | Tantalum | polarized, ESR higher than ceramic, fails in thermal runaway if overvoltaged or reversed [S4] |
| Mains filters, snubbers, audio, high voltage | Film | non-polarized, large [S5] |
| Memory backup | Supercap | 1.5-5 V max, leakage moderate, not for long-term storage [S4] |

- **C1. Use three tiers:** bulk 10-47 uF (up to 100 uF) near the power input or regulator output; 100 nF for each IC power pin (10 nF additionally on high-speed parts); 1 uF beside the 100 nF on mixed-signal rails. [S2]
- **C2. One decoupling cap per power pin**, within a few millimetres, on the same side as the IC (a via adds 1-2 nH), with short direct traces and its own ground via; the 3 mm rule of `DESIGN.md` 24 applies. Exception: the datasheet says pins share an internal plane. [S2]
- **C3. Derate the capacitance of Class 2 ceramics for DC bias:** a 10 uF/10 V X7R may give about 4 uF at 5 V, and ceramics can lose 60-80 % near rated voltage; use a 16/25/50 V rating on a 3.3/5 V rail, or buy more capacitance (22 uF to get 10 uF). C0G has no bias loss. [S2, S3]
- **C4. Tantalum runs at 50 % of its rated voltage** (a 10 V part on 5 V at best); prefer polymer or ceramic where possible. [S6, S4]
- **C5. Check every polarized cap for orientation and mark it** on the silkscreen (`DESIGN.md` 42). Reverse polarity makes electrolytics burst and tantalums burn. [S4]
- **C6. Regulator capacitors follow the regulator datasheet:** minimum capacitance and an ESR window (examples: TPS76050 2.2 uF with ESR 0.1-20 ohm; NCP1117 4.7 uF with ESR 0.033-2.2 ohm); a ceramic with 5-10 mOhm ESR can break such an LDO (add 0.1-2 ohm in series), while newer LDOs (e.g. TPS7A25) are made for ceramics. Re-check the value after DC-bias derating. [S18]
- **C7. Mount MLCCs parallel to the nearest board edge** (flex cracking when the board is cut, worst for 0805 and larger). [S3]
- **C8. MLCCs age:** X7R/X5R lose about 2-3 % per decade of hours; MLCCs are microphonic (avoid in sensitive audio paths). [S3, S4]

## Resistors

| Package | Rated power (70 C) | Max working voltage |
|---|---|---|
| 0402 | 0.063 W | not found |
| 0603 | 0.1 W | 75 V |
| 0805 | 0.125 W | 150 V |
| 1206 | 0.25 W | 200 V |

(power: [S7]; voltage: [S7], typical values, the part datasheet decides)

- **R1. Size by package and derate:** rated power applies at the reference temperature only and falls linearly to zero at the maximum temperature; load a resistor to 50 % of its power at the worst ambient (2-3x rating margin). [S7, S8]
- **R2. Pick tolerance and TCR by function:** 1 % as default; tighter for dividers and references; +/-100 ppm/C drifts 1 % over 100 C. [S8]
- **R3. LED series resistor:** `R = (Vsupply - Vf) / I`, round up to the next standard value (less current, same look); check `P = I^2 * R`. See LED section. [S1, S30]
- **R4. Pull-ups:** I2C bus: `Rp(min) = (VCC - VOL) / IOL` (VOL 0.4 V at 3 mA) and `Rp(max) = tr / (0.8473 * Cb)`, with tr 1000 ns (100 kHz) or 300 ns (400 kHz) and Cb at most 400 pF; 4.7 kOhm is the common choice, 2.2 kOhm for fast mode on busier buses. Check whether the modules on the bus already carry pull-ups. DHT22 data: 10 kOhm to 3V3; 1-Wire (DS18B20): 4.7 kOhm to 3V3. [S9, S24]
- **R5. Gate drive:** 100 ohm-1 kOhm in series with a MOSFET gate (close to the MOSFET) and 100 kOhm gate pull-down on the MCU side of the series resistor, so the load is off while the MCU pin floats. [S10]
- **R6. Strapping and boot pins:** 1-10 kOhm in series when a peripheral shares a strapping pin. [S22]
- **R7. USB-C sink:** 5.1 kOhm (+/-10 %) from each CC pin to GND, one per CC pin near the connector. [S38]
- **R8. Pick resistors from the JLCPCB basic list** (`jlcsearch` query in `CLAUDE.md`).

## Transistors

| | BJT (NPN/PNP) | MOSFET |
|---|---|---|
| Control | base current, continuous | gate voltage, current only while charging the gate [S13] |
| On loss | `Vce(sat) * I`, linear in current | `I^2 * Rds(on)`, often much lower [S13] |
| Thermal | runaway risk | positive temperature coefficient, self-balancing [S13] |
| Use for | tiny currents, simplest and cheapest | most low-side switching from logic level [S13] |

- **Q1. Why a transistor:** a GPIO cannot drive coils, motors, strips or IR LEDs; the GPIO controls a small current and the transistor switches the big one from its own supply. [S14]
- **Q2. Low side: N-MOSFET (or NPN):** load between supply and drain, source to GND. Check Rds(on) at your gate voltage (3.3 V needs a careful datasheet look; a 5 V drive is easier), and keep Rds(on) far below the load resistance (relay example: 1.8 ohm against a 720 ohm coil). [S10, S13]
- **Q3. BJT as a switch:** design for forced beta 10: `Ib = Ic / 10`, `Rb = (Vdrive - 0.7 V) / Ib`; datasheet Vce(sat) is quoted at that ratio. [S14]
- **Q4. Inductive loads (relay, solenoid, motor) need a flyback diode** across the load, cathode to the supply side, anode to the transistor; mount it at the coil. A 1N4148 fits a coil of ~17 mA, 1N4001/1N4004 larger ones, a Schottky (1N5819) is faster; low-side switch ICs integrate this diode for motors, solenoids and relays. [S10, S11, S33]
- **Q5. High side or reverse-polarity protection: P-MOSFET in the positive line**, body diode pointing so a reversed supply is blocked, gate to GND through a 1 kOhm resistor; above about 15-20 V add a zener (cathode on the gate, anode to GND) to hold Vgs inside its limit. Choose Rds(on) < 0.1 ohm up to 5 A. Drop: MOSFET 0.05-0.15 V against 0.6-0.8 V for a series diode (diode: 0.35 W at 500 mA/12 V, MOSFET 0.025 W). [S12]
- **Q6. Heat:** a MOSFET dissipates `I^2 * Rds(on)`; give it copper (`DESIGN.md` 27). [S13]

## Power regulators

- **P1. LDO or switcher by dissipation:** an LDO burns `(Vin - Vout) * Iout` (5 V to 3.3 V at 300 mA: 0.51 W, 66 %; 12 V to 3.3 V at 1 A: 8.7 W, 27.5 %); use the maximum Vin. Below about 0.5 W the thermal copper is usually enough, above 1 W test the assembly; if the loss is unacceptable or the step is above 2:1, use a buck (about 90 %). [S15]
- **P2. Dropout and noise:** check the guaranteed (not typical) dropout at your current and temperature; check noise and PSRR in the bands you care about; the quiescent current dominates below about 10 mA load (matters for batteries). [S15]
- **P3. Buck plus LDO** for a noisy-sensitive rail: check headroom, rejection at the switching frequency, heat and start-up. [S15]
- **P4. LDO layout:** input cap directly across Vin and GND (short, low impedance); follow the manufacturer's layout and exposed-pad via instructions; take the sense line of an adjustable LDO from the intended measuring point, away from noisy copper. [S15]
- **P5. Buck layout:** the hot loop is input cap + switching FETs: put a ceramic input cap across Vin and PGND with the shortest path, on the same side as the IC; a 0.1-0.47 uF X5R/X7R bypass within about 2 cm of the input cap if needed; keep switch-node copper small (no wider than the inductor pads); put the output cap on the inductor's Vout side, away from the input cap; route feedback on the reverse side, never under or beside the inductor or switch pour; use a via array under the thermal pad; do not split the reference plane. [S15, S16]
- **P6. Buck inductor:** check peak and RMS current at temperature (saturation current, DCR), not only the inductance; the output cap must meet the datasheet capacitance and ESR after tolerance, temperature, aging and DC bias. [S15]
- **P7. Boost layout:** the output cap is the most important: close to the IC with short wide traces, several small caps in parallel; input-cap ground at the IC power ground; bulk input cap near the inductor; small switch node; separate control ground and power ground, joined at the IC GND pin. [S17]
- **P8. Power path order:** connector, fuse/protection, bulk cap, regulator, loads (`DESIGN.md` 41). See Protection and Fuses.

## ESP32

- **ESP-1. Supply:** 3.3 V, at least 500 mA; ESD diode plus 10 uF at the power entrance; 0.1 uF near VDD3P3_CPU (pin 37) and VDD3P3_RTC (pin 20); 10 uF per RF supply pin plus an LC filter. [S19, S20]
- **ESP-2. Reset (CHIP_PU/EN):** RC delay of 10 kOhm and 1 uF (1-10 uF works); the supply must be stable at least 50 us before EN rises. [S19, S23]
- **ESP-3. Strapping pins (original ESP32):** GPIO0, GPIO2, GPIO5, GPIO12 (MTDI), GPIO15 (MTDO); GPIO0 low at reset means download mode, GPIO12 high at reset selects the wrong flash voltage; add a pull-up on GPIO0 and no big capacitor on it; do not hold strapping pins at the wrong level with loads or pull-ups. (One tutorial lists GPIO4; Espressif does not.) C3: GPIO2, 8, 9; S3: GPIO0, 3, 45, 46. [S19, S21, S22]
- **ESP-4. Unusable and special pins:** GPIO6-11 (flash) and GPIO16 with in-package flash/PSRAM; GPIO34-39 are input-only and have no internal pull-up or pull-down (add external resistors); ADC2 cannot be used while Wi-Fi is on, use ADC1 (GPIO32-39) and 0.1 uF per ADC pin. [S19, S21]
- **ESP-5. GPIO limits:** 3.3 V logic only (divide 5 V signals, e.g. 1 kOhm/2 kOhm); 40 mA is the absolute maximum per GPIO, so anything bigger (relay coil 70-100 mA, buzzer, motor, servo, LED strip) gets a driver transistor and its own supply with a common ground. [S21, S24]
- **ESP-6. Loads on their own supply:** motors, servos, relays and LED strips from a separate 5 V supply of 1-2 A (a servo start can exceed 1 A), all grounds joined, a bulk cap (1000 uF for addressable strips) at the load connector; USB alone browns out above about 500 mA. [S24]
- **ESP-7. Serial lines:** 499 ohm in series on UART TX to damp harmonics; a series resistor, or a ferrite bead with a capacitor to ground, on the SPI clock; place them at the chip pins. [S19]
- **ESP-8. Auto-download circuit:** DTR and RTS of the USB-UART bridge drive EN and GPIO0 through two transistors, so asserting both together does not reset the chip; copy an Espressif DevKit schematic (10 kOhm pull-ups) and keep the 1-10 uF on EN. [S23]
- **ESP-9. Bare chip clock:** 40 MHz crystal, +/-10 ppm, load caps by the crystal's CL, more than 500 mV amplitude; optional 32.768 kHz crystal with ESR at most 70 kOhm. [S19]
- **ESP-10. Antenna (module or chip):** antenna outside the base board with its feed point near the edge, 15 mm clear in all directions in the housing, no copper, GND pour or parts in the keep-out, base board cut away on both sides and below the antenna; USB and UART lines far from the antenna. [S20]
- **ESP-11. Chip layout (bare chip):** 4-layer: layer 2 is a full GND plane; 2-layer: a continuous reference ground under chip, RF and crystal; thermal pad to GND with at least 9 vias; main power traces at least 25 mil, VDD3P3 at least 20 mil, others 12-15 mil, surrounded by ground copper; crystal at least 2.7 mm from the clock pin, no vias on the clock traces; RF trace 50 ohm +/-10 %, outer layer only, no layer change, 135 degree bends or arcs. [S20]
- **ESP-12. Pick the right variant:** C3, S3 and others differ in pins and strapping; read the guide of the exact chip. [S19, S22]

## ATmega328P

- **AVR-1. Decoupling:** 0.1 uF at every VCC and AVCC pin; a 10 uF bulk cap on the rail. [S25]
- **AVR-2. AVCC must be connected to VCC** even if the ADC is unused; with the ADC, feed AVCC through a low-pass filter: 10 uH from VCC and 100 nF to GND (datasheet figure 24-9). [S25]
- **AVR-3. AREF:** 100 nF to GND with the internal reference; do not tie it to VCC directly unless you choose that reference. [S25]
- **AVR-4. RESET:** 10 kOhm pull-up to VCC (debugWIRE needs at least 10 kOhm; the programmer wants at least 4.7 kOhm); an extra capacitor to ground only if debugWIRE/PDI is not used; auto-reset from DTR uses 0.1 uF in series with the 10 kOhm pull-up forming the pulse. [S25]
- **AVR-5. Clock:** crystal across XTAL1/XTAL2 with two load caps (typically 18-22 pF) as close to the pins as possible. [S25, S28]
- **AVR-6. Supply and speed:** 1.8-5.5 V; 20 MHz needs 4.5-5.5 V; around 1.8 V the clock is limited to about 4 MHz; absolute maximum 6.0 V. [S25]
- **AVR-7. Precision ADC:** separate analog and digital ground and join them at one star point only when the ADC accuracy needs it. [S25]
- **AVR-8. Programming header:** put an ISP header (MISO, MOSI, SCK, RESET, VCC, GND) on the board.

## STM32

Read the series' own hardware note before drawing (numbers differ per series): AN4488 (F4), AN4080 (F0), the G0 note (dm00443870), AN4555 (L4), AN5373 (U5), AN4938 (H7), AN5673 (C0), AN2867 (oscillators). The values below come from AN4488 (F4) and AN4938 (H7) as quoted in the sources; check them for your series. [S26]

- **STM-1. Decoupling:** every VDD/VSS pair gets a 100 nF ceramic at the pin, plus one 4.7-10 uF cap in parallel per supply rail, as close to the pins as possible or on the underside; connect all supply and ground pins with low impedance. [S26]
- **STM-2. VDDA:** may come from VDD through a ferrite bead, with 100 nF + 1 uF to GND at the pin. [S26]
- **STM-3. VREF+:** with a separate reference voltage, 100 nF + 1 uF on the pin; the voltage lies between VDDA - 1.2 V and VDDA, at least 1.7 V (F4); otherwise tie it to VDDA. [S26]
- **STM-4. VBAT:** connect a battery (1.2-3.6 V) or tie it to VDD through 100 nF; on variants without the VBAT function connect it to VDD. [S26]
- **STM-5. VCAP pins** (internal LDO parts): use exactly the capacitor of the datasheet (examples: H7 2.2 uF per pin; F4 one capacitor with ESR below 1 ohm); this is not a supply for other loads. [S26]
- **STM-6. NRST:** internal pull-up, add 100 nF to GND against parasitic resets. [S26]
- **STM-7. BOOT0:** 10 kOhm to GND (a jumper or switch to 3V3 selects the system bootloader). [S26]
- **STM-8. Programming:** an SWD header with SWDIO (PA13), SWCLK (PA14), NRST, 3V3 and GND. [S26]
- **STM-9. HSE crystal:** load caps from the crystal's CL and the stray capacitance (the pin capacitance is about 5 pF per pin); see XTAL. [S26, S28]
- **STM-10. USB full speed** needs a +/-0.25 % clock, so use a crystal. [S29]

## RP2040

- **RP-1. Decoupling:** 100 nF at each IOVDD pin, each DVDD pin and ADC_AVDD; 1 uF on VREG_VIN and on the 1.1 V output (DVDD). [S27]
- **RP-2. Clock:** 12 MHz crystal (needed for the PLL and USB); load caps from the datasheet equation, very close to the crystal; keep XIN/XOUT away from fast signals; no copper pour around the crystal. [S27]
- **RP-3. USB:** 27 ohm series resistors on D+ and D-. [S27]
- **RP-4. Flash:** QSPI traces as short as possible (at most 20 mm, 0.15 mm wide), flash next to the chip; 1 kOhm in series with QSPI_SS and USB_BOOT, close to the flash; QSPI_SS low at reset enters the USB bootloader. [S27]
- **RP-5. RUN pin** is the reset input (low resets); the 3.3 V comes from a regulator off the 5 V USB rail. [S27]

## USB-UART bridges

- **UART-1. Follow the bridge datasheet** for decoupling and the regulator capacitor (CP2102: a few decoupling caps, built-in 3.3 V regulator and clock, no crystal). I found no verified values for the CH340; use its datasheet. [S25]
- **UART-2. Auto-reset** of an AVR: 0.1 uF from DTR to RESET, with the RESET pull-up. For ESP32 see ESP-8. [S25, S23]

## Any new IC

- **NEW-1. Read before drawing:** decoupling table, reset and boot pins, unused-pin handling, exposed pad, reference layout (G2). [S1]

## Protection and interfaces

- **PR-1. ESD:** metal-oxide varistors, TVS diode arrays, clamp diodes or gas tubes at connectors, user buttons and communication interfaces, with a resistance of a few tens of ohms between the clamp and the IC. [S1]
- **PR-2. Reverse polarity:** a series diode (low power) or a P-MOSFET (Q5). [S1, S12]
- **PR-3. Overvoltage:** varistor, TVS diodes or diode clamps, an electronic fuse chip, or a thermistor. [S1]
- **PR-4. Mains-side parts:** X capacitors (line to neutral) and Y capacitors (supply to ground) are safety-rated; galvanic isolation (ISO) for high voltage. [S1]
- **PR-5. USB data lines:** low-capacitance bidirectional TVS (about 1 pF per line) as close as possible to the connector; D+/D- as a differential pair, parallel, equal length, 90 ohm differential impedance, on a continuous ground plane, with few vias; 1-10 ohm series resistors are optional (see the PHY datasheet). [S38]

## LEDs

- **LED-1. Resistor:** `R = (Vsupply - Vf) / I`; round up; check the resistor power. [S30]
- **LED-2. Vf by colour (indicator LEDs):** red 1.8-2.4 V, green 2.8-3.4 V, blue 2.8-3.4 V (white about 3-3.6 V); on 3.3 V rails blue and white leave almost no headroom. [S30]
- **LED-3. Current:** 20 mA is the usual rating, indicator LEDs light at 1-5 mA with less brightness; power LEDs take 350 mA to over 1 A and need a constant-current driver, not a resistor (a resistor wastes power as heat and the output follows the supply voltage). [S30]
- **LED-4. Dimming:** PWM; flicker is visible below about 200 Hz, 1 kHz is a typical safe default. [S30]
- **LED-5. Addressable LEDs (WS2812):** data input high level is 0.7 x VDD (3.3 V is marginal on a 5 V supply); use a fast single-direction level shifter (74HCT245, 74AHCT125) or power the first LED at 4.5 V; I2C-type shifters are too slow; 300-500 ohm in series on DATA and 1000 uF across the strip power. [S39, S24]
- **LED-6. Mark polarity** on the silkscreen (`DESIGN.md` 42).

## Fuses and overcurrent protection

- **FUSE-1. Place at the power entry**, before the rest of the circuit (fuse, reverse/overvoltage protection, bulk cap, regulator). [S1]
- **FUSE-2. Size a one-time fuse:** load it to at most 75 % of its nominal rating at 25 C and derate for a hotter ambient; voltage rating at least the highest circuit voltage (right AC or DC rating); breaking capacity at least the maximum fault current. [S31]
- **FUSE-3. PTC (resettable):** hold current is the maximum without tripping; trip current is about twice the hold current; trip time 8 ms-90 s; hold current falls above 25 C and rises below, so use the manufacturer's re-rating curve; the voltage rating applies in the tripped state; max current is what it survives while tripped. [S31]
- **FUSE-4. Alternatives:** electronic fuse chip, thermistor (S1); use a one-time fuse where a fault must stay off.
- **FUSE-5. Trace width** at the fuse must carry the current (`DESIGN.md` 14).

## Signal isolation devices

- **ISO-1. When:** high voltage, ground loops, different ground potentials, noisy motors and relays, safety. Circuits above 30 VAC must be separated from SELV circuits by creepage and clearance. [S1, S32]
- **ISO-2. Technology:**

| | Optocoupler | Digital isolator |
|---|---|---|
| Data rate | below about 1 Mbit/s typical (specialised up to 25-100 Mbit/s) | above 5 Mbit/s (150+ standard) |
| CMTI | 10-25 kV/us | 25-200 kV/us |
| Ageing | CTR drops (100 % to about 50 % after 20 000 h at max current and temperature) | no wear-out |
| Cost per channel | USD 0.05-0.50 | USD 0.50-3.00 |

  Choose an optocoupler for SMPS feedback and relay drivers; a digital isolator above 5 Mbit/s, CMTI above 25 kV/us, tight power budget or many channels. [S32]
- **ISO-3. Creepage and clearance:** clearance is the shortest air path, creepage the shortest path along the surface; their values come from working voltage, pollution degree, material group (CTI) and insulation class in IEC 60664-1 (reinforced creepage is twice basic creepage); read the table in the standard or the isolator datasheet, no number is quoted here. [S32]
- **ISO-4. Layout:** keep the isolator pads from shrinking the creepage; slots or grooves in the board increase creepage; separate high-voltage and low-voltage circuits physically and electrically; round corners on high-voltage traces; conformal coating allows shorter distances. [S32, S33]
- **ISO-5. Isolated side needs its own supply** (isolated DC-DC or transformer) and its own ground. [S32]
- **ISO-6. Electrical safety stays the user's responsibility** (see `CLAUDE.md`).

## Relays

- **RLY-1. Drive:** low-side N-MOSFET (or NPN), 100 ohm-1 kOhm gate resistor, 100 kOhm gate pull-down, flyback diode at the coil (Q2, Q4, R5); a 12 V coil of 200 mW draws about 17 mA (720 ohm), coil time constant L/R about 3 ms. [S10]
- **RLY-2. Contact load:** select by load type: lamps have 10-15x inrush, motors 5-10x, capacitors 20-50x; arcing on inductive loads shortens contact life, so use the datasheet rating for that load type and a snubber where the datasheet advises it. [S33]
- **RLY-3. Relay or SSR:** mechanical contacts drop 0.1-0.3 V at rated current; an SSR drops 1.0-2.5 V and needs heat dissipation; SSRs derate hard at high ambient. [S33]
- **RLY-4. Layout:** put the flyback diode at the coil; keep high-voltage contact traces and low-voltage coil/logic apart with the creepage of ISO-3. [S33]

## Crystals and oscillators

- **XTAL-1. Load capacitors:** `CL = C1 * C2 / (C1 + C2) + Cstray`, with Cstray 2-5 pF; for C1 = C2, `C = 2 * (CL - Cstray)` (CL 18 pF and Cstray 3 pF give 30 pF). Use C0G/NP0 caps; take CL from the crystal datasheet and check the MCU's load requirement. [S28]
- **XTAL-2. Accuracy:** USB full speed needs +/-0.25 % (2500 ppm), low speed +/-1.5 %; ESP32 40 MHz +/-10 ppm. [S29, S19]
- **XTAL-3. Layout:** crystal within 5 mm of the MCU (`DESIGN.md` 25); load caps close, the XTALIN cap first and nearest; short traces, few vias (none on the ESP32 clock traces); no other signals under or beside the crystal; a guard ring at least 0.5 mm from the clock traces (single-layer); ground under the crystal for multilayer boards. [S28, S20]
- **XTAL-4. Disagreement:** the RP2040 guide says no copper pour around the crystal, Microchip AVR186 recommends a ground area under it; follow the guide of your MCU. [S27, S28]
- **XTAL-5. Check ESR and drive level** of the crystal against the MCU datasheet (a 32.768 kHz oscillator runs far below 1 uW and its frequency depends strongly on the load capacitance). [S28]

## Logic ICs

- **LOGIC-1. Families:** 74HC 2-6 V, about +/-4 mA at 5 V; 74AHC 2-5.5 V, +/-8 mA, 5 V-tolerant inputs; 74LVC 1.2-3.6 V, +/-24 mA, 5 V-tolerant inputs (usable as 5 V to 3.3 V translators). [S34]
- **LOGIC-2. Tie every unused input to VCC or GND**; a resistor is not needed for CMOS because of the high input impedance. [S34]
- **LOGIC-3. Schmitt-trigger inputs** (74xx14) tolerate slow edges (buttons, RC filters). [S34]
- **LOGIC-4. Decouple each package:** 0.1 uF at each VCC pin, as short as possible; 10 uF as a low-frequency bypass. [S34]
- **LOGIC-5. Level translation:** use a 5 V-tolerant LVC/AHC input where the 3.3 V high level is valid for the receiver, otherwise a translator; see LED-5 for a fast shifter. [S34]

## Optocouplers

- **OPTO-1. Output current:** `CTR = Ic / If`; PC817 class C has 200-400 % at If 5 mA, Vce 5 V; LED Vf is 1.2 V typical, 1.4 V maximum at 20 mA. [S35]
- **OPTO-2. Size for ageing:** CTR falls over the operating hours, so choose If below the maximum and design with the minimum CTR over temperature and end of life (2x margin). [S32, S35]
- **OPTO-3. Wiring:** LED through a series resistor from the control signal; phototransistor as an open collector with a pull-up to the isolated supply, emitter to the isolated ground; the pull-up must let enough collector current flow for the CTR and the logic thresholds. [S35]
- **OPTO-4. Speed:** the PC817 reaches about 80 kHz (tr 4-18 us, tf 3-18 us); faster links need a high-speed optocoupler or a digital isolator. [S35]

## RF

- **RF-1. Use a certified module** where possible; for the antenna keep-out follow ESP-10 and the module datasheet. [S20]
- **RF-2. 50 ohm +/-10 %:** microstrip over an unbroken ground plane or coplanar waveguide with ground vias on both sides; trace width from the stackup, not by guess; outer layer, no layer changes, 135 degree bends or arcs. [S20, S36]
- **RF-3. Via fence:** CPW ground vias at lambda/20 or less; ground vias around RF cavities at less than lambda/10. [S36]
- **RF-4. Place parts for the shortest RF path;** no parallel RF traces; keep USB, UART and clocks away from the antenna; a matching network (CLC/pi) near the chip. [S20, S36]

## IR

- **IR-1. IR LED driver:** a transistor or MOSFET switches the LED; the carrier is 38 kHz for common remotes. [S37]
- **IR-2. IR LED limits:** example TSAL6200 (940 nm): IF 100 mA continuous, IFM 200 mA (tp/T 0.5, tp 100 us), IFSM 1.5 A (100 us), Vf about 1.35 V; many 940 nm LEDs take 3-10x the continuous current when pulsed at 10 % duty or less (check the datasheet). Resistor: `R = (Vs - Vf - Vds) / I`. [S37]
- **IR-3. IR receiver module** (TSOP38238/TSOP4838): 2.5-5.5 V supply; an optional supply filter against ripple and electrical overstress: TSOP48xx R1 = 100 ohm, C1 = 4.7 uF; TSOP382xx R1 33 ohm-1 kOhm, C1 above 0.1 uF; the output is active low; a continuous carrier is muted by the AGC, so the protocol needs pauses. [S37]
- **IR-4. Mount** the receiver where the window and viewing angle fit the case, away from switching noise (Convention).

## Review (after choosing parts and values)

- Spec and block diagram exist; derated 1.5-2x; standard values (G1, G3, G4).
- Every IC pin decoupled at the pin; DC-bias derating checked; regulator caps match the datasheet (C1, C2, C3, C6).
- Every floating input fixed; pull-up values calculated (G6, R4); gate pull-down and flyback diode present (R5, Q4).
- Power path protected: fuse, reverse polarity, overvoltage (FUSE-1, PR-1..3, Q5).
- MCU: reset, boot and strapping pins, clock, analog supply and programming header done for the family (ESP, AVR, STM, RP sections).
- Isolation barrier, creepage and clearance checked against the standard (ISO-3, ISO-4).
- Polarity of every polarized part marked (C5, LED-6, `DESIGN.md` 42).

## Sources

Read 2026-10-06. Entries marked (summary) were available only as a search-result summary, because the PDF could not be converted here; the figures were taken from that summary.

- S1 Proto Express, best electronic circuit design practices: https://www.protoexpress.com/blog/best-electronic-circuit-design-practices/
- S2 JLCPCB, decoupling capacitors guide: https://jlcpcb.com/blog/decoupling-capacitors-guide
- S3 NextPCB, X7R vs C0G vs X5R: https://www.nextpcb.com/blog/x7r-vs-c0g-vs-x5r-mlcc-dielectric-pcb
- S4 Altium, which capacitor type: https://resources.altium.com/p/which-type-capacitor-should-you-use
- S5 JLCPCB, capacitor types guide (summary): https://jlcpcb.com/blog/capacitor-types-guide
- S6 Vishay on tantalum derating, Electronic Design (summary): https://www.electronicdesign.com/technologies/analog/article/55316842/vishay-intertechnology-derating-guidelines-for-tantalum-capacitors
- S7 ROHM, chip resistor specifications (summary): https://www.rohm.com/electronics-basics/resistors/chip-resistor-specifications
- S8 Ohmite (summary): https://ohmite.com/blog/2023/07/19/resistor-specifications-and-how-to-interpret-them ; DigiKey, power rating (summary): https://www.digikey.com/en/articles/power-rating-is-just-one-resistor-parameter-to-consider
- S9 TI SLVA689, I2C pull-up calculation (summary): https://www.ti.com/lit/pdf/slva689 ; NextPCB (summary): https://www.nextpcb.com/blog/i2c-pull-up-resistor-calculation
- S10 DigiKey forum, MCU to relay with a MOSFET: https://forum.digikey.com/t/how-to-interface-a-microcontroller-with-a-relay-using-a-mosfet/41470
- S11 TI SLVA927A, low-side switches: https://ti.com/document-viewer/lit/html/SLVA927A/low-side-switches-t5090566-7
- S12 CircuitDigest, P-MOSFET reverse polarity protection: https://circuitdigest.com/electronic-circuits/reverse-polarity-protection-circuit-using-mosfet
- S13 Wilderness Labs, transistors (summary): https://developer.wildernesslabs.co/Hardware/Reference/Components/Common/Transistors/
- S14 BJT forced beta, All About Circuits (summary): https://forum.allaboutcircuits.com/threads/transistor-switch.43832/latest ; https://industrialmonitordirect.com/blogs/knowledgebase/transistor-saturation-with-ib1ma-icib10-rule-explained
- S15 JLCPCB, LDO vs switching regulator: https://jlcpcb.com/blog/ldo-vs-switching-regulator-comparison-pcb-layout
- S16 Ultra Librarian, buck converter layout: https://www.ultralibrarian.com/2025/04/25/pcb-layout-buck-converter-important-design-guidelines-ulc/
- S17 TI SLVA773, boost converter layout (summary): https://www.ti.com/document-viewer/lit/html/SLVA773/introduction-slvuam52816
- S18 TI SLVA115 and LP2951 datasheet, LDO output capacitor ESR (summary): https://edgeworker.ti.com/lit/pdf/slva115 ; https://www.ti.com/document-viewer/LP2951/datasheet/application_and_implementation
- S19 Espressif hardware design guidelines, ESP32 schematic checklist: https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32/schematic-checklist.html
- S20 Espressif hardware design guidelines, ESP32 PCB layout: https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32/pcb-layout-design.html
- S21 Random Nerd Tutorials, ESP32 pinout: https://randomnerdtutorials.com/esp32-pinout-reference-gpios/
- S22 espboards.dev, ESP32 strapping pins: https://www.espboards.dev/blog/esp32-strapping-pins/
- S23 Espressif esptool, boot mode selection (summary): https://docs.espressif.com/projects/esptool/en/latest/advanced-topics/boot-mode-selection.html
- S24 Ampheo, ESP32 projects for beginners (filtered): https://www.ampheo.com/blog/esp32-projects-for-beginners-30-easy-ideas-with-code-and-circuit-diagrams
- S25 Utmel, ATmega328P design guide: https://www.utmel.com/components/atmega328p-series-8-bit-avr-microcontroller-design-guide?id=7755 ; Microchip, RESET pin on AVR (summary): https://onlinedocs.microchip.com/oxy/GUID-F626284A-58F0-4C25-A6F3-0EA5054F3E2B-en-US-6/GUID-B80B25FF-E9D7-4766-B562-DA197B8B938C.html ; ATmega328P datasheet (summary): https://www.logosfoundation.org/instrum_gwr/Arduino/Atmel-7810-Automotive-Microcontrollers-ATmega328P_Datasheet.pdf
- S26 ST AN4488 and related notes (summary): https://www.st.com/resource/en/application_note/an4488-getting-started-with-stm32f4xxxx-mcu-hardware-development-stmicroelectronics.pdf ; AN4938 (H7): https://www.st.com/resource/en/application_note/an4938-getting-started-with-stm32h74xig-and-stm32h75xig-hardware-development-stmicroelectronics.pdf ; ST community, minimum wiring: https://community.st.com/t5/stm32-mcus-boards-and-hardware/minimum-wiring-stm32f446/td-p/169180
- S27 DigiKey Maker, RP2040 schematic: https://www.digikey.com/es/maker/projects/hardware-design-with-the-rp2040-part-1-schematic/c4326f0fd813413698d617cf625125ee ; Embedded Computing, custom RP2040 board (summary): https://embeddedcomputing.com/technology/open-source/development-kits/design-and-build-your-own-custom-rp2040-dev-board
- S28 Suntsu, crystal load capacitance (summary): https://suntsu.com/suntsu-application-notes/crystal-load-capacitance ; Microchip AVR186 (summary): https://www.insidegadgets.com/wp-content/uploads/2013/02/Best-Practices-for-the-PCB-layout-of-oscillators.pdf
- S29 ST community, USB crystal accuracy (summary): https://community.st.com/t5/stm32-mcus-embedded-software/crystal-accuracy-for-usb/td-p/426568
- S30 Wilderness Labs, LED forward voltage: https://developer.wildernesslabs.co/docs/api/Meadow.Foundation/Meadow.Foundation.Leds/TypicalForwardVoltage/ ; Build Electronic Circuits, current limiting resistor (summary): https://build-electronic-circuits.com/current-limiting-resistor ; OpenMV, LED dimming with PWM (summary): https://docs.openmv.io/openmvcam/tutorial/hardware/pwm/led-dimming.html
- S31 Littelfuse Fuseology (summary): https://www.littelfuse.com/assetdocs/fuseology-selection-guide?assetguid=d812dff2-1c47-4dc3-bce7-07a4001ddc32 ; mbedded.ninja, PTC fuses (summary): https://blog.mbedded.ninja/electronics/components/ptc-resettable-fuses/ ; passive-components.eu, PPTC (summary): https://passive-components.eu/pptc-resettable-fuses-fundaments-and-applications/
- S32 LCSC, optocouplers vs digital isolators: https://www.lcsc.com/blog/optocouplers-vs-digital-isolators/ ; TI, isolation and creepage (summary): https://edgeworker.ti.com/lit/pdf/slla563
- S33 Relay sources (summary): https://industrialmonitordirect.com/blogs/knowledgebase/open-collector-relay-wont-disengage-back-emf-fix ; https://industry.panasonic.com/global/en/products/control/relay/vehicle/usersguide ; https://industrialmonitordirect.com/ar/blogs/knowledgebase/ssrs-vs-mechanical-relays-for-low-voltage-control-selection-guide ; https://blogs.sw.siemens.com/electronic-systems-design/2025/04/29/pcb-high-voltage-spacing-what-every-engineer-should-know/
- S34 Logic: TI e2e, unused inputs: https://e2e.ti.com/support/logic/f/logic-forum/885871/74ac16244-unused-inputs-pins ; family data from vendor datasheets (summary): https://www.ti.com/product/es-mx/SN74LVC74A , https://assets.nexperia.com/documents/data-sheet/74LVC74A.pdf , https://www.nexperia.com/group/74ahc74-74ahct74
- S35 PC817 design tutorial (summary): https://zbotic.in/optocoupler-pc817-isolation-circuit-design-tutorial-for-beginners/ ; Learnabout Electronics, optocouplers (summary): https://learnabout-electronics.org/Semiconductors/opto_52.php
- S36 Analog Devices, PCB layout guidelines for RF and mixed-signal (summary): https://www.analog.com/en/resources/technical-articles/pcbs-layout-guidelines-for-rf--mixedsignal.html
- S37 Vishay TSAL6200 (summary): https://www.vishay.com/doc/?81010= ; Vishay TSOP4838 (summary): https://datasheet.octopart.com/TSOP4838-Vishay-datasheet-10203384.pdf ; TSOP382 (summary): https://www.vishay.com/docs/82491/tsop382.pdf
- S38 AISLER community, USB 2.0 with a Type-C connector (summary): https://community.aisler.net/t/implementing-usb-2-0-connectivity-with-a-type-c-connector/1511
- S39 PJRC forum, WS2812 level shifting (summary): https://forum.pjrc.com/threads/71002-Launchpad-for-a-toddler?p=313353
