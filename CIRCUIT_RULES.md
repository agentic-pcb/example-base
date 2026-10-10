# Circuit rules

Generic electronics rules for choosing parts and values in any tscircuit board (`*.circuit.tsx`). `LAYOUT_RULES.md` says where parts and copper go (alignment, routing, placement, schematic layout, and the layout of specific part families); this file says which parts and values to use and how to wire them. A rule belongs here when it can be checked from the netlist and the BOM alone; a rule that needs coordinates, copper, layers or silkscreen is in `LAYOUT_RULES.md`, and this file only points to it. The datasheet of the actual part beats both files. Rule IDs carry a section prefix (G, C, R, Q, P, ESP, AVR, STM, RP, UART, PR, LED, FUSE, ISO, RLY, XTAL, LOGIC, OPTO, RF, IR) so they never collide with the numbers of `LAYOUT_RULES.md`; cite them as "CIRCUIT_RULES C3". An ID missing from its sequence (C7, P4, ESP-10, ...) moved to `LAYOUT_RULES.md` and is not reused.

Every rule carries a source tag `[S#]` (list at the end), read on 2026-10-06 and re-checked the same day against the primary documents (vendor datasheets, application notes, standards); a source still marked "(summary)" could not be opened and its figures are unverified. Where the sources disagree, the vendor document wins and the disagreement is noted. A rule with no tag is a project convention; "(convention)" marks a number that is common practice but not in any source read. Numbers marked "per datasheet" are not given here on purpose: use the value in the datasheet of the part you choose. A `Don't:` clause at the end of a rule is a counter-example: it names the mistake that breaks the rule, carries its own source tag and adds no rule ID; check a design against it as well (S42 onward were read on 2026-10-10). For tscircuit: record the chosen part in `supplierPartNumbers`, put the calculation in the README Design notes, and use only JLCPCB Economic parts (see `CLAUDE.md`).

## General

- **G1. Write the spec and a block diagram first:** list inputs and outputs, voltage, current, power, temperature and frequency range, board size and budget, then draw the blocks; the blocks become the schematic sections (`LAYOUT_RULES.md` 19). [S1]
- **G2. Start from the datasheet reference circuit** and its calculations; read the datasheet fully before choosing a part. [S1] Don't: trust a library symbol, footprint or pin order without the datasheet of the exact part number: the AMS1117 tab is VOUT (pin 2), not GND, and one transistor type can be numbered differently in SOT-23 by different makers (field report: a SOT-23 2N3904 assembled with base and emitter swapped). [S52]
- **G3. Derate 1.5-2x:** choose parts rated 1.5-2x above the real voltage, current and power (a resistor dissipates at most 50 % of its rating: a blog heuristic, not a datasheet rule); keep a power dissipation list per part. [S1]
- **G4. Use standard values and long-lived parts:** standard resistor/capacitor values are cheaper; avoid parts with long lead times; prefer parts available for 5-7 years. [S1]
- **G5. Use MCU peripherals** (timers, PWM, ADC, DAC, I2C, SPI) instead of extra parts where they fit. [S1]
- **G6. Fix every floating input:** a floating input sits between VIL and VIH, in an undefined region (for 0.3/0.7 VDD CMOS at 5 V: 1.5-3.5 V); add a pull-up or pull-down, after checking the MCU's internal pulls. [S1] Don't: leave an enable, reset, boot or chip-select input without a defined level (STM-7, ESP-3). [S1, S26]
- **G7. A 0 ohm resistor is a switch for the layout:** use it to make a circuit part optional, as a measuring point or a jumper on low-speed nets; not on high-speed lines (parasitic inductance). [S1]
- **G8. Document why:** record the reason for each part or value in the README Design notes. [S1]

## Capacitors

| Job | Type | Notes |
|---|---|---|
| Timing, crystal load, RF, filters, ADC reference | C0G/NP0 ceramic | 0 +/- 30 ppm/C, no DC-bias effect [S3, S4] |
| Decoupling, bypass, smoothing | X7R ceramic | +/-15 % over -55..125 C; DC bias applies [S2, S3] |
| Space-limited consumer boards | X5R ceramic | max +85 C [S3] |
| Never | Y5V / Z5U | Y5V +22/-82 %, Z5U +22/-56 % capacitance swing (EIA codes) [S2, S4] |
| Bulk, 10-100 uF at input or regulator | Aluminium electrolytic or polymer | polarized; electrolytic dries out and its life falls with temperature [S2, S4] |
| Compact bulk, low ESR, no DC bias | Polymer (Al or Ta) | ESR like ceramic, no microphonics, low leakage [S4] |
| Stable bulk, audio | Tantalum | polarized, ESR higher than ceramic, fails if overvoltaged or reversed (C4) [S4, S6] |
| Mains filters, snubbers, audio, high voltage | Film | non-polarized, large [S5] |
| Memory backup | Supercap | 1.5-5 V max [S4] |

- **C1. Use three tiers:** bulk 10-47 uF near the power input or regulator output; 100 nF for each IC power pin (10 nF additionally on high-speed parts); 1 uF beside the 100 nF on mixed-signal rails. [S2]
- **C2. One decoupling cap per power pin** (placement: `LAYOUT_RULES.md` 24). Exception: the datasheet says pins share an internal plane. [S2] Don't: let several power pins share one capacitor. [S2]
- **C3. Derate the capacitance of Class 2 ceramics for DC bias:** a 10 uF/10 V X7R may give about 4 uF at 5 V, and ceramics can lose 60-80 % near rated voltage (TI TPS7A25 datasheet: expect a decrease by as much as 50 %); use a 16/25/50 V rating on a 3.3/5 V rail, or buy more capacitance (22 uF to get 10 uF). C0G has no bias loss. [S2, S3, S18] Don't: take the capacitance from the part number: read the DC-bias curve at the rail voltage (AN-88: a Y5V loses 80 % at its rated voltage). [S42]
- **C4. Derate tantalum voltage:** MnO2 tantalum runs at 50-60 % of its rated voltage (Vishay: 3.3 V rail on a 6.3 V part, 5 V on 10 V, 12 V on 25 V); polymer tantalum at 80-90 % (10 % derating up to 10 V, 20 % above). Vishay's tables assume about 1 ohm of series resistance per volt: on low-impedance or hot-plug rails add series resistance, or use polymer or ceramic. [S6, S4] Don't: run an MnO2 tantalum near its rated voltage on a battery, hot-plug or other low-impedance input. [S6]
- **C5. Check every polarized cap for orientation** (silkscreen mark: `LAYOUT_RULES.md` 42). Reverse polarity makes electrolytics burst and tantalums burn. [S4]
- **C6. Regulator capacitors follow the regulator datasheet:** minimum capacitance and an ESR window (examples: TPS76050 2.2 uF with ESR 0.1-20 ohm; NCP1117 4.7 uF with ESR 0.033 (typical)-2.2 ohm); a ceramic with 5-10 mOhm ESR can break such an LDO (LP2951: add 0.1-2 ohm in series), while newer LDOs (e.g. TPS7A25) are made for ceramics. Re-check the value after DC-bias derating. [S18]
- **C8. MLCCs age:** about 2.5 % (X7R) and about 3-6 % (X5R) per decade of hours (Wuerth SN011); MLCCs are microphonic (avoid in sensitive audio paths). [S40, S4]
- **C9. Damp a hot-plugged input:** a live supply plugged into a board that has only ceramic input capacitors rings with the lead inductance and can easily reach twice the input voltage (AN-88, 24 V adapter: 57.2 V peak into 10 uF, 40.8 V into 22 uF). Add a capacitor with ESR in parallel (47 uF aluminium electrolytic, 0.44 ohm: 25 V peak) or a second ceramic with about 0.5 ohm in series (30 V); a TVS alone only clamped to 35 V. Don't: rate the input parts for the nominal supply voltage alone when the connector can be plugged in live. [S42]

Layout: `LAYOUT_RULES.md` 24 (decoupling at the pin), 42 (polarity mark), 45 (MLCC orientation at a board edge).

## Resistors

| Package | Rated power (70 C) | Max working voltage |
|---|---|---|
| 0402 | 0.063 W | 50 V |
| 0603 | 0.1 W | 75 V |
| 0805 | 0.125 W | 150 V |
| 1206 | 0.25 W | 200 V |

(Vishay D/CRCW standard mode, typical values; the part datasheet decides [S7])

- **R1. Size by package and derate:** rated power applies at the reference temperature only and falls linearly to zero at the maximum temperature; common practice is a load of 50 % of the rating at the worst ambient (2-3x margin). [S7, S8]
- **R2. Pick tolerance and TCR by function:** 1 % as default; tighter for dividers and references; +/-100 ppm/C drifts 1 % over 100 C. [S8]
- **R3. LED series resistor:** `R = (Vsupply - Vf) / I`, round up to the next standard value (less current, same look); check `P = I^2 * R`. See LED section. [S1, S30]
- **R4. Pull-ups:** I2C bus: `Rp(min) = (VDD(max) - VOL) / IOL` (VOL 0.4 V at 3 mA; for VDD at or below 2 V, 0.2 VDD at 2 mA) and `Rp(max) = tr / (0.8473 * Cb)`, with tr 1000 ns (100 kHz) or 300 ns (400 kHz) and Cb at most 400 pF. 4.7 kOhm suits 100 kHz up to about 250 pF; at 400 kHz it allows only about 75 pF and 2.2 kOhm about 160 pF. Check whether the modules on the bus already carry pull-ups. DHT22 data: about 5 kOhm (datasheet) to 10 kOhm to 3V3; 1-Wire (DS18B20): 4.7 kOhm to 3V3 (secondary). [S9, S24] Don't: pull the bus up to 5 V when a device on it is not 5 V tolerant (ESP-5, AVR-6), or add pull-ups without counting those on the modules (in parallel they can fall below Rp(min)). [S9]
- **R5. Gate drive:** 1 kOhm typical in series with a MOSFET gate (lower, e.g. 100-470 ohm, for fast switching, within the MCU pin current), and 100 kOhm gate pull-down on the MCU side of the series resistor, so the load is off while the MCU pin floats (placement: `LAYOUT_RULES.md` 44). [S10]
- **R6. Strapping and boot pins:** 1-10 kOhm in series when a peripheral shares a strapping pin. [S22]
- **R7. USB-C sink:** 5.1 kOhm from each CC pin to GND, one per CC pin (placement: `LAYOUT_RULES.md` 44). The Type-C spec allows +/-20 % but a +/-10 % (use 1 %) resistor is needed to detect 1.5 A/3 A current advertisement. [S38] Don't: tie CC1 and CC2 together on one resistor: with an e-marked cable (SuperSpeed or 5 A) a compliant charger then supplies 0 V (the Raspberry Pi 4 as launched); copy the sink figure of the Type-C specification, it is normative. [S47, S38]
- **R8. Pick resistors from the JLCPCB basic list** (`jlcsearch` query in `CLAUDE.md`).

## Transistors

| | BJT (NPN/PNP) | MOSFET |
|---|---|---|
| Control | base current, continuous | gate voltage, current only while charging the gate [S13] |
| On loss | `Vce(sat) * I`, linear in current | `I^2 * Rds(on)`, often much lower [S13] |
| Thermal | runaway risk (textbook, no source read) | positive temperature coefficient, self-balancing (textbook, no source read) |
| Use for | tiny currents, simplest and cheapest | most low-side switching from logic level [S13] |

- **Q1. Why a transistor:** a GPIO cannot drive coils, motors, strips or IR LEDs; the GPIO controls a small current and the transistor switches the big one from its own supply. [S14]
- **Q2. Low side: N-MOSFET (or NPN):** load between supply and drain, source to GND. Check Rds(on) at your gate voltage (3.3 V needs a careful datasheet look; a 5 V drive is easier; the DigiKey article warns that its 1 kOhm/DMN67D8L design is not viable at 3.3 V logic), and keep Rds(on) far below the load resistance (relay example: 1.8 ohm against a 720 ohm coil). [S10, S13] Don't: choose a MOSFET by its threshold voltage: VGS(th) is defined at a small test current for routine measurement, not as an operating point, and RDS(on) varies greatly with VGS and temperature; it is guaranteed only at the gate voltages the datasheet lists, so the part needs an RDS(on) figure at or below your drive voltage (a logic-level type). [S51]
- **Q3. BJT as a switch:** design for forced beta 10: `Ib = Ic / 10`, `Rb = (Vdrive - 0.7 V) / Ib`; Vce(sat) is quoted at 10:1 for e.g. BC817 and MMBT3904, but some families quote 20:1, so check the ratio in the datasheet. [S14]
- **Q4. Inductive loads (relay, solenoid, motor) need a flyback diode** across the load, cathode to the supply side, anode to the transistor (placement at the coil: `LAYOUT_RULES.md` 44). A 1N4148 fits a small coil (~17 mA), a 1N4001-class diode larger ones; reverse rating at least 10x the circuit voltage (2-3x acceptable at low voltage), forward current at least the coil current. Any diode across a relay coil slows the release; where release time matters add a series zener (Panasonic). Low-side switch ICs integrate this diode for motors, solenoids and relays. [S10, S11, S33] Don't: drive a coil straight from a GPIO (ESP-5) or leave the diode out. [S10]
- **Q5. High side or reverse-polarity protection: P-MOSFET in the positive line**, body diode pointing so a reversed supply is blocked, gate to GND through a 1 kOhm resistor; for supplies above about 15-20 V (the source gives "below about 20 V" for the basic circuit) add a zener (cathode on the gate, anode to GND) to hold Vgs inside its limit. Choose Rds(on) < 0.1 ohm up to 5 A. Drop: MOSFET 0.05-0.15 V against 0.6-0.8 V for a series diode (diode: 0.35 W at 500 mA/12 V, MOSFET 0.025 W). [S12]
- **Q6. Heat:** a MOSFET dissipates `I^2 * Rds(on)`; give it copper (`LAYOUT_RULES.md` 27). [S13]

## Power regulators

- **P1. LDO or switcher by dissipation:** an LDO burns `(Vin - Vout) * Iout` (5 V to 3.3 V at 300 mA: 0.51 W, 66 %; 12 V to 3.3 V at 1 A: 8.7 W, 27.5 %); use the maximum Vin. Starting points only, verify thermally: below about 0.5 W the thermal copper is usually enough, above 1 W test the assembly; if the loss is unacceptable or the step is above 2:1, consider a buck (about 90 %). [S15]
- **P2. Dropout and noise:** check the guaranteed (not typical) dropout at your current and temperature; check noise and PSRR in the bands you care about; the quiescent current matters most at light load (batteries). [S15]
- **P3. Buck plus LDO** for a noisy-sensitive rail: check headroom, rejection at the switching frequency, heat and start-up. [S15]
- **P6. Buck inductor:** check peak and RMS current at temperature (saturation current, DCR), not only the inductance; the output cap must meet the datasheet capacitance and ESR after tolerance, temperature, aging and DC bias. [S15]
- **P8. Power path order:** connector, fuse/protection, bulk cap, regulator, loads (`LAYOUT_RULES.md` 41). See Protection and Fuses.
- **P9. No reverse current into an LDO:** when the output is higher than the input plus the body-diode drop of the pass FET (e.g. the input is switched off or shorted while a battery, a second supply or a large capacitor holds the output), current flows backwards through that diode and can damage the part (heating, electromigration, latch-up). Use an LDO with reverse-current protection, a Schottky diode from OUT to IN, or a diode before the LDO (this raises the input voltage needed); the datasheet says whether the part needs it. Don't: feed a regulator's output from another supply (P10). [S43]
- **P10. Never join two supplies directly:** two sources on one rail (USB VBUS and an external 5 V, USB and a battery) each need a path that blocks back-powering: one Schottky diode per source (the higher voltage supplies the rail), or a P-MOSFET in place of the diode for a lower drop, with a threshold well below the minimum input voltage (Raspberry Pi Pico: VBUS reaches VSYS through a Schottky, a second source enters VSYS through another one). Don't: connect VBUS to the output of another supply. [S53]
- **P11. Ferrite bead in a supply rail:** a bead with a low-ESR ceramic behind it is an underdamped LC filter: the resonance is typically at 0.1-10 MHz and peaks by about 10-15 dB, so it can amplify the ripple of a switcher instead of removing it (ADI example: 10 dB gain at 2.5 MHz with 10 nF). Damp it with a large capacitor in series with a resistor across the load (1 uF + 2 ohm in that example). The impedance falls with DC current (at 50 % of the rated current the inductance drops by up to 90 %, and a 100 ohm bead measured 10 ohm at 100 MHz): run a bead at about 20 % of its rated current. Don't: combine a bead with high-Q decoupling capacitors without checking the resonance, or size it by its current rating alone. [S44]

Layout: `LAYOUT_RULES.md` 46 (LDO), 47 (buck), 48 (boost), 27 (heat).

## ESP32

- **ESP-1. Supply:** 3.3 V, at least 500 mA (datasheet Table 5-2); ESD diode plus at least 10 uF at the power entrance; 0.1 uF near VDD3P3_CPU (pin 37) and VDD3P3_RTC (pin 20); 10 uF on the RF supply (pins 3 and 4) plus an LC filter, which can share the entrance cap when it is close; 1 uF near VDD_SDIO; 10 nF +/-10 % on CAP1 (pin 48). [S19, S20]
- **ESP-2. Reset (CHIP_PU/EN):** RC delay of usually 10 kOhm and 1 uF, adjusted for the supply; the supply must be stable at least 50 us before EN rises (use a supervisor with a threshold around 3.0 V on a slow or unstable supply). The 1-10 uF range holds for the auto-reset circuit of ESP-8. [S19, S23]
- **ESP-3. Strapping pins (original ESP32):** GPIO0, GPIO2, GPIO5, GPIO12 (MTDI), GPIO15 (MTDO); GPIO0 low at reset means download mode, GPIO12 high at reset selects 1.8 V VDD_SDIO, wrong for a 3.3 V flash; add a pull-up on GPIO0 and no big capacitor on it (a boot button needs a strong pull-down, the internal pull is about 45 kOhm); do not hold strapping pins at the wrong level with loads or pull-ups. (One tutorial lists GPIO4; Espressif does not.) C3: GPIO2, 8, 9; S3: GPIO0, 3, 45, 46. [S19, S21, S22, S23] Don't: put a button, LED, pull-up or the output of another chip on a strapping pin where it holds the wrong level at reset (a pull-up on GPIO12 selects 1.8 V for a 3.3 V flash and the chip does not boot). [S19, S22]
- **ESP-4. Unusable and special pins:** GPIO6-11 (flash) and GPIO16 with in-package flash/PSRAM (needs a 10 kOhm pull-up there); GPIO34-39 are input-only and have no internal pull-up or pull-down (add external resistors); ADC2 cannot be used while Wi-Fi is on, use ADC1 (GPIO32-39) and 0.1 uF per ADC pin. [S19, S21] Don't: use GPIO34-39 as outputs or GPIO6-11 as I/O, or read an ADC2 pin while Wi-Fi runs. [S19, S21]
- **ESP-5. GPIO limits:** 3.3 V logic only (inputs are not 5 V tolerant, VIH max VDD + 0.3 V; divide 5 V signals, e.g. 1 kOhm/2 kOhm); a pin sources about 20 mA at the default drive strength and about 40 mA typical at the maximum setting (falling to about 29 mA as more pins source), sinks about 28 mA; the datasheet absolute maximum is 1200 mA cumulative, so do not rely on 40 mA: anything bigger than a few mA (relay coil 70-100 mA, buzzer, motor, servo, LED strip) gets a driver transistor and its own supply with a common ground. [S19, S21, S24]
- **ESP-6. Loads on their own supply:** motors, servos, relays and LED strips from a separate 5 V supply of 1-2 A (a servo start can exceed 1 A), all grounds joined, a bulk cap (500-1000 uF for addressable strips) for the load (placement: `LAYOUT_RULES.md` 44); a USB 2.0 port guarantees only 500 mA (100 mA until enumeration). [S24]
- **ESP-7. Serial lines:** 499 ohm in series on UART TX to damp harmonics; a series resistor, or a ferrite bead with a capacitor to ground, on the SPI clock (placement: `LAYOUT_RULES.md` 44). [S19]
- **ESP-8. Auto-download circuit:** DTR and RTS of the USB-UART bridge drive EN and GPIO0 through two transistors, so asserting both together does not reset the chip; copy an Espressif DevKit schematic and keep the 1-10 uF on EN. [S23]
- **ESP-9. Bare chip clock:** 40 MHz crystal, +/-10 ppm, load caps by the crystal's CL, more than 500 mV amplitude; optional 32.768 kHz crystal with ESR at most 70 kOhm; the checklist also wants a series 0 ohm/inductor position on XTAL_P and 5-10 MOhm across the 32 kHz crystal. [S19]
- **ESP-12. Pick the right variant:** C3, S3 and others differ in pins and strapping; read the guide and datasheet of the exact chip. [S19, S22]

Layout: `LAYOUT_RULES.md` 54 (antenna keep-out), 55 (bare-chip layout), 49 (crystal), 51 (RF trace).

## ATmega328P

- **AVR-1. Decoupling:** 0.1 uF at every VCC/AVCC pin pair (AVR042: one cap per pair of pins); a tantalum or ceramic bulk cap on the rail (10 uF is convention). [S25]
- **AVR-2. AVCC must be connected to VCC** even if the ADC is unused, and must stay within +/-0.3 V of VCC; with the ADC, feed AVCC through a low-pass filter: 10 uH from VCC and 100 nF to GND (datasheet figure 24-9). [S25]
- **AVR-3. AREF:** 100 nF to GND with the internal or AVCC reference; a fixed voltage on AREF shorts the internal references, so tie it to a voltage only when the firmware selects the external AREF reference. [S25]
- **AVR-4. RESET:** 10 kOhm pull-up to VCC (debugWIRE: not smaller than 10 kOhm; STK600: 4.7 kOhm or larger); no extra capacitor on RESET when debugWIRE is used; AVR042 recommends ESD/zener protection on RESET; auto-reset from DTR uses 0.1 uF in series with the pull-up forming the pulse (Arduino practice, convention). [S25]
- **AVR-5. Clock:** crystal across XTAL1/XTAL2 with two equal load caps, 12-22 pF as a starting point (datasheet Table 9-3), then from the crystal's CL (XTAL-1; placement: `LAYOUT_RULES.md` 49). [S25, S28]
- **AVR-6. Supply and speed:** 1.8-5.5 V; 4 MHz at 1.8 V, 10 MHz at 2.7 V, 20 MHz needs 4.5-5.5 V (the limit is linear between the points); absolute maximum 6.0 V; any pin except RESET is limited to VCC + 0.5 V (not 5 V tolerant on a 3.3 V board), RESET to 13 V; 40 mA per I/O pin. [S25]
- **AVR-8. Programming header:** put an ISP header (MISO, MOSI, SCK, RESET, VCC, GND) on the board.

Layout: `LAYOUT_RULES.md` 57 (analog ground of a precision ADC), 49 (crystal).

## STM32

Read the series' own hardware note before drawing (numbers differ per series): AN4488 (F4), AN4080 (F0), the G0 note (dm00443870), AN4555 (L4), AN5373 (U5), AN4938 (H7), AN5673 (C0), AN2867 (oscillators), AN4879 (USB). The values below come from AN4488 (F4) and AN4938 (H7), read in full; check them for your series. [S26]

- **STM-1. Decoupling:** every VDD/VSS pair gets a 100 nF ceramic at the pin, plus one 4.7-10 uF cap per package (4.7 uF minimum) (placement: `LAYOUT_RULES.md` 24); connect all supply and ground pins with low impedance. [S26]
- **STM-2. VDDA:** may come from VDD through a ferrite bead, with 100 nF + 1 uF to GND at the pin (resonance and DC bias of the bead: P11). [S26]
- **STM-3. VREF+:** with a separate reference voltage, 100 nF + 1 uF on the pin. F4: between VDDA - 1.2 V and VDDA, at least 1.7 V. H7: below VDDA, at least 2 V when VDDA is above 2 V and the ADC is used (else 1.62 V). Otherwise tie it to VDDA (a resistor of about 47 ohm is possible on H7). [S26]
- **STM-4. VBAT:** connect a battery (F4 1.65-3.6 V, H7 1.2-3.6 V) or tie it to VDD through 100 nF; the pin must be connected to a supply when no battery is used. [S26]
- **STM-5. VCAP pins** (internal LDO parts): use exactly the capacitor of the datasheet. F4: two 2.2 uF with ESR below 2 ohm on VCAP1 and VCAP2, or one 4.7 uF with ESR below 1 ohm when the package has only VCAP1. H7: 2.2 uF ceramic with ESR below 100 mOhm on VCAP1 and VCAP2 (4.7 uF on the VDDLDO pins together). This is not a supply for other loads. [S26]
- **STM-6. NRST:** add 100 nF to GND against parasitic resets (AN4488: only a pull-down capacitor is recommended, 10 nF to save power). [S26]
- **STM-7. BOOT0:** 10 kOhm typical to GND (a jumper or switch to 3V3 selects the system bootloader); a floating BOOT0 or BOOT1 can stop the MCU working. [S26]
- **STM-8. Programming:** an SWD header with SWDIO (PA13), SWCLK (PA14), NRST, 3V3 and GND. [S26]
- **STM-9. HSE crystal:** load caps from the crystal's CL and the stray capacitance Cs, which is the sum of both pin capacitances and the PCB (ST's example uses Cs = 5 pF in total: CL 15 pF gives 20 pF caps; the pin value is in the datasheet); see XTAL. [S26, S28]
- **STM-10. USB full speed** needs a precise 48 MHz clock (+/-0.25 %): an HSE crystal, or HSI48 with SOF synchronisation on parts with crystal-less USB; an uncalibrated RC is not enough. [S26, S29]

## RP2040

- **RP-1. Decoupling:** 100 nF at each IOVDD pin, each DVDD pin, USB_VDD and ADC_AVDD; 1 uF on VREG_VIN and on VREG_VOUT (the 1.1 V that feeds the DVDD pins). The Pico minimal design shares one 100 nF cap between pins 48 and 49 as a stated compromise. [S27]
- **RP-2. Clock:** crystal of 1-15 MHz (the USB bootloader requires 12 MHz); load caps from the datasheet equation (`CL = C2*C3/(C2+C3) + about 3 pF`); a 1 kOhm damping resistor in series on the XOUT side (tuned for 3.3 V IOVDD) so the crystal is not overdriven (placement: `LAYOUT_RULES.md` 49). [S27]
- **RP-3. USB:** 27 ohm series resistors on D+ and D- (placement: `LAYOUT_RULES.md` 44; pair routing: 50). [S27]
- **RP-4. Flash:** a 1 kOhm resistor between QSPI_SS and the USB_BOOT button/header, so the button can overdrive the pull-down; QSPI_SS low at reset enters the USB bootloader (placement: `LAYOUT_RULES.md` 44 and 56). [S27]
- **RP-5. RUN pin** is the reset input (low resets); VREG_VIN must be powered even when the on-chip regulator is unused (it feeds power-on reset and brown-out); in the reference design the 3.3 V comes from a regulator off the 5 V USB rail. [S27]

## USB-UART bridges

- **UART-1. Follow the bridge datasheet** for decoupling and the regulator capacitor (CP2102: 0.1 uF in parallel with 1 uF on REGIN, 4.7 uF at VDD if it powers other devices; built-in 3.3 V regulator (100 mA max, too weak for an ESP32) and clock, no crystal). I found no verified values for the CH340; use its datasheet. [S41]
- **UART-2. Auto-reset** of an AVR: 0.1 uF from DTR to RESET, with the RESET pull-up (Arduino practice). For ESP32 see ESP-8. [S23]

## Any new IC

- **NEW-1. Read before drawing:** decoupling table, reset and boot pins, unused-pin handling, exposed pad, reference layout (G2). [S1]

## Protection and interfaces

- **PR-1. ESD:** metal-oxide varistors, TVS diode arrays, clamp diodes or gas tubes at connectors, user buttons and communication interfaces, with a resistance of a few tens of ohms between the clamp and the IC. [S1]
- **PR-2. Reverse polarity:** a series diode (low power) or a P-MOSFET (Q5). [S1, S12]
- **PR-3. Overvoltage:** varistor, TVS diodes or diode clamps, used together with a fuse chip or a thermistor. [S1]
- **PR-4. Mains-side parts:** X capacitors (line to neutral) and Y capacitors (supply to ground) are safety-rated; galvanic isolation (ISO) for different ground potentials and high voltage. [S1]
- **PR-5. USB data lines:** low-capacitance bidirectional TVS (about 1 pF per line, typical); series resistors are device-dependent (27 ohm on RP2040, see the PHY datasheet) (placement: `LAYOUT_RULES.md` 44; pair routing: 50). [S27, S38]

## LEDs

- **LED-1. Resistor:** `R = (Vsupply - Vf) / I`; round up; check the resistor power. [S30] Don't: feed several LEDs in parallel from one resistor: the LED with the lowest Vf takes most of the current (a measured pair of one type differed almost 2:1) and different colours do not share at all; use one resistor per LED, or LEDs in series on one resistor. [S54]
- **LED-2. Vf by colour (indicator LEDs):** check the LED's datasheet; typical red/yellow about 1.8-2.4 V, InGaN green, blue and white about 2.8-3.6 V (traditional green is nearer 2.0-2.4 V); on 3.3 V rails blue and white leave almost no headroom. [S30]
- **LED-3. Current (convention):** 20 mA is the usual rating, indicator LEDs light at 1-5 mA with less brightness; power LEDs take 350 mA to over 1 A and need a constant-current driver, not a resistor (a resistor wastes power as heat and the output follows the supply voltage).
- **LED-4. Dimming:** PWM; flicker is visible below about 200 Hz, 1 kHz is a typical default. [S30]
- **LED-5. Addressable LEDs (WS2812B):** data input high level is 0.7 x VDD, so 3.3 V data is out of spec on a 5 V supply (3.5 V needed; at VDD 4.5 V the margin is only about 0.15 V); use a 74AHCT125/74HCT245 level shifter; the datasheet pulses are about 0.4/0.8 us within a 1.25 us bit (an I2C-type shifter is likely too slow); 300-500 ohm in series on DATA and 500-1000 uF (6.3 V or higher) across the strip power (placement: `LAYOUT_RULES.md` 44). [S39, S24] Don't: shift the data with a BSS138-type (I2C) MOSFET shifter: its rising edge through the pull-up is too slow for pulse margins of about 150 ns (field report). [S55]

Layout: `LAYOUT_RULES.md` 42 (polarity mark).

## Fuses and overcurrent protection

- **FUSE-1. Place at the power entry**, before the rest of the circuit (fuse, reverse/overvoltage protection, bulk cap, regulator) (convention).
- **FUSE-2. Size a one-time fuse:** load it to at most 75 % of its nominal rating at 25 C and derate for a hotter ambient; voltage rating at least the highest circuit voltage (right AC or DC rating); breaking capacity at least the maximum fault current. [S31]
- **FUSE-3. PTC (resettable):** hold current is the maximum without tripping; trip current is typically 1.7-2x the hold current (see the datasheet); hold current falls above 25 C and rises below, so use the manufacturer's re-rating curve; the voltage rating applies in the tripped state; max current is what it survives while tripped. [S31] Don't: size a PTC with the normal load at its trip current, or with the 25 C hold current in a hot enclosure. [S31]
- **FUSE-4. Alternatives:** electronic fuse chip, thermistor (S1); use a one-time fuse where a fault must stay off.

Layout: `LAYOUT_RULES.md` 14 (trace width at the fuse), 41 (power path).

## Signal isolation devices

- **ISO-1. When:** high voltage, ground loops, different ground potentials, noisy motors and relays, safety. Above about 30 Vrms / 42.4 Vpeak / 60 Vdc (SELV/ES1 limits of IEC 62368-1 and 61010-1, search summary) a circuit needs creepage, clearance and double or reinforced insulation toward SELV circuits. [S1]
- **ISO-2. Technology:**

| | Optocoupler | Digital isolator |
|---|---|---|
| Data rate | below about 1 Mbit/s typical (specialised up to 25-100 Mbit/s) | above 5 Mbit/s (150+ standard) |
| CMTI | 10-25 kV/us | 25-200 kV/us |
| Ageing | CTR drops (100 % to about 50 % after 20 000 h at max current and temperature) | no LED ageing; a rated insulation lifetime per datasheet |
| Cost per channel | USD 0.05-0.50 | USD 0.50-3.00 |

  Choose an optocoupler for SMPS feedback and relay drivers; a digital isolator above 5 Mbit/s, CMTI above 25 kV/us, tight power budget or many channels (distributor blog figures, not a vendor document). [S32]
- **ISO-3. Creepage and clearance:** clearance is the shortest air path, creepage the shortest path along the surface; their values come from working voltage, pollution degree, material group (CTI) and insulation class in IEC 60664-1 (reinforced creepage is twice basic creepage, as in IEC 61010-1); read the table in the standard or the isolator datasheet, no number is quoted here. [S32]
- **ISO-5. Isolated side needs its own supply** (isolated DC-DC or transformer) and its own ground. [S32]
- **ISO-6. Electrical safety stays the user's responsibility** (see `CLAUDE.md`). Mains-connected work needs certified parts and testing beyond this file. A 5 kV rating of an optocoupler such as the PC817 is a UL1577 test voltage, not a working voltage: for mains isolation use a part with an IEC 60747-17 working-voltage rating (VIORM) and keep the creepage and clearance of its datasheet. [S32]

Layout: `LAYOUT_RULES.md` 58 (isolation barrier on the board).

## Relays

- **RLY-1. Drive:** low-side N-MOSFET (or NPN), gate resistor and 100 kOhm gate pull-down, flyback diode at the coil (Q2, Q4, R5); a 12 V coil of 200 mW draws about 17 mA (720 ohm), coil time constant L/R about 3 ms. [S10]
- **RLY-2. Contact load:** select by load type: lamps have 10-15x inrush, motors 5-10x, capacitors 20-50x (Omron FAQ, snippet only; Panasonic says verify in the real circuit); arcing on inductive loads shortens contact life, so use the datasheet rating for that load type and a snubber where the datasheet advises it; check the DC rating for DC loads (far below the AC rating; automotive relays cannot switch AC). [S33]
- **RLY-3. Relay or SSR:** a mechanical contact drops `I * contact resistance` (datasheet); a triac/SCR SSR about 1-2 V and needs heat dissipation; a MOSFET SSR drops `I * Rds(on)`; SSRs derate hard at high ambient. [S33]

Layout: `LAYOUT_RULES.md` 59 (contact traces), 44 (flyback diode at the coil).

## Crystals and oscillators

- **XTAL-1. Load capacitors:** `CL = C1 * C2 / (C1 + C2) + Cstray`; for C1 = C2, `C = 2 * (CL - Cstray)` (CL 18 pF and Cstray 3 pF give 30 pF). Cstray includes the pin and PCB capacitance: typically 2-5 pF for the PCB alone, 5-10 pF per pin including the pin (AVR042); take the MCU vendor's value. Use C0G/NP0 caps; take CL from the crystal datasheet and check the MCU's load requirement. [S28] Don't: fit load capacitors equal to CL (two 18 pF caps with 3 pF stray load an 18 pF crystal with only 12 pF). [S28]
- **XTAL-2. Accuracy:** USB full speed needs +/-0.25 % (2500 ppm); ESP32 40 MHz +/-10 ppm. [S29, S19]
- **XTAL-5. Check ESR and drive level** of the crystal against the MCU datasheet (a 32.768 kHz crystal's maximum drive level is typically 0.5-1 uW; its frequency depends strongly on the load capacitance, about +/-15 ppm/pF pullability per AVR042). [S28]

Layout: `LAYOUT_RULES.md` 25 and 49.

## Logic ICs

- **LOGIC-1. Families:** 74HC 2-6 V, about +/-4 mA at 4.5 V, inputs not 5 V tolerant; 74AHC 2-5.5 V, +/-8 mA, 5 V-tolerant inputs; 74LVC 1.2-3.6 V (TI guarantees 1.65-3.6 V), +/-24 mA at 3 V, 5 V-tolerant inputs (usable as 5 V to 3.3 V translators). [S34]
- **LOGIC-2. Never leave an input floating:** tie it directly to VCC or GND, or through 1-10 kOhm if it may need to change. [S34]
- **LOGIC-3. Schmitt-trigger inputs** (74xx14) tolerate slow edges (buttons, RC filters). [S34]
- **LOGIC-4. Decouple each package:** 0.1 uF at each VCC pin (placement: `LAYOUT_RULES.md` 24); optionally 1 uF in parallel. [S34]
- **LOGIC-5. Level translation:** use a 5 V-tolerant LVC/AHC input where the 3.3 V high level is valid for the receiver, otherwise a translator; see LED-5 for a fast shifter. [S34]
- **LOGIC-6. Do not drive an unpowered IC:** a signal held high into a part whose VCC is at 0 V flows through the input clamp diode into its supply rail: tens of mA unless a series resistor limits it, which can damage the part and partly powers the dead rail. Where one side can be off while the other is on (a USB-powered bridge beside a self-powered MCU, two supplies), use parts with Ioff / partial-power-down protection (listed in the datasheet features; found in the LVC, LV-A, AUP and AVC families among others), series resistors, or one common supply. [S45]

## Optocouplers

- **OPTO-1. Output current:** `CTR = Ic / If`; PC817 rank C is 200-400 % (Ic 10-20 mA at If 5 mA, Vce 5 V), rank D 300-600 %, rank B 130-260 %; LED Vf is 1.2 V typical, 1.4 V maximum at 20 mA. [S35]
- **OPTO-2. Size for ageing:** CTR falls over the operating hours and its spread grows below If 1 mA, so choose If below the maximum and design with the minimum CTR over temperature and end of life (2x margin). [S32, S35] Don't: design with the typical CTR. [S32, S35]
- **OPTO-3. Wiring:** LED through a series resistor from the control signal; phototransistor as an open collector with a pull-up to the isolated supply, emitter to the isolated ground; the pull-up must let enough collector current flow for the CTR and the logic thresholds. [S35]
- **OPTO-4. Speed:** the PC817 reaches about 80 kHz with RL = 100 ohm (tr 4-18 us, tf 3-18 us); with kOhm pull-ups the bandwidth is much lower; faster links need a high-speed optocoupler or a digital isolator. [S35]

## RF

- **RF-1. Use a certified module** where possible and follow its datasheet; a bare-chip design needs a matching network (CLC/pi). [S20, S36]

Layout: `LAYOUT_RULES.md` 51 (RF trace), 52 (via fence), 53 (placement), 54 (antenna keep-out).

## IR

- **IR-1. IR LED driver:** a transistor or MOSFET switches the LED; the carrier is 38 kHz for common remotes. [S37]
- **IR-2. IR LED limits:** example TSAL6200 (940 nm): IF 100 mA continuous, IFM 200 mA (tp/T 0.5, tp 100 us), IFSM 1.5 A (100 us), Vf about 1.35 V (1.6 V max at 100 mA); its pulse curve allows about 6-7x the continuous current at 10 % duty (tp 100 us); other LEDs differ, check the datasheet. Resistor: `R = (Vs - Vf - Vds) / I`. [S37]
- **IR-3. IR receiver module** (TSOP38238/TSOP4838): 2.0-5.5 V supply in the current Vishay datasheets (older revisions 2.5-2.7 V); the datasheet recommends an optional supply filter R1/C1 against ripple and spikes (older TSOP4838 revision: R1 about 100 ohm, C1 about 0.1 uF; older TSOP382: R1 33 ohm-1 kOhm, C1 above 0.1 uF); the output is active low; a continuous carrier is muted by the AGC, so the protocol needs a pause after each burst (about 5x the burst length for short bursts, 15x for long ones). [S37]

Layout: `LAYOUT_RULES.md` 60 (receiver mounting).

## Review (after choosing parts and values)

- Spec and block diagram exist; derated 1.5-2x; standard values (G1, G3, G4).
- Every IC power pin has its decoupling cap; DC-bias derating checked; regulator caps match the datasheet (C1, C2, C3, C6).
- Every floating input fixed; pull-up values calculated (G6, R4); gate pull-down and flyback diode present (R5, Q4).
- Power path protected: fuse, reverse polarity, overvoltage (FUSE-1, PR-1..3, Q5).
- MCU: reset, boot and strapping pins, clock, analog supply and programming header done for the family (ESP, AVR, STM, RP sections).
- Isolation barrier, creepage and clearance checked against the standard (ISO-3, ISO-6; on the board: `LAYOUT_RULES.md` 58).
- Orientation of every polarized part checked (C5; silkscreen mark: `LAYOUT_RULES.md` 42).
- No `Don't:` of an applicable rule is on the board; hot-plug input damped, no reverse current into a regulator, no two supplies joined, no unpowered IC driven (C9, P9, P10, LOGIC-6).
- Layout rules of every part family on the board noted for the layout step (`LAYOUT_RULES.md` 44-60), and the manufacturing rules (61-63).

## Sources

Read 2026-10-06. Entries marked (summary) could not be opened here (blocked, 403/404 or unreadable PDF); the figures were taken from a search-result summary and are unverified. Where a primary document was read in full, it is named in the entry. The st.com PDFs refused download; web.archive.org copies of the same PDFs were read. The tagged rules of `LAYOUT_RULES.md` (16, 17, 24, 26, 37, 42 and 44-63) cite this list too, so keep the numbers stable. S42-S55 were read on 2026-10-10 for the `Don't:` clauses; "(secondary)" marks a field report (forum, blog) that is not a vendor document.

- S1 Proto Express, best electronic circuit design practices: https://www.protoexpress.com/blog/best-electronic-circuit-design-practices/
- S2 JLCPCB, decoupling capacitors guide: https://jlcpcb.com/blog/decoupling-capacitors-guide
- S3 NextPCB, X7R vs C0G vs X5R: https://www.nextpcb.com/blog/x7r-vs-c0g-vs-x5r-mlcc-dielectric-pcb
- S4 Altium, which capacitor type: https://resources.altium.com/p/which-type-capacitor-should-you-use
- S5 JLCPCB, capacitor types guide (summary): https://jlcpcb.com/blog/capacitor-types-guide
- S6 Vishay tantalum derating, document 40246 and white paper 40292 (read); Electronic Design article (summary): https://www.electronicdesign.com/technologies/analog/article/55316842/vishay-intertechnology-derating-guidelines-for-tantalum-capacitors
- S7 Vishay D/CRCW thick film chip resistors datasheet, document 20035 (read): https://www.vishay.com/doc?20035 ; ROHM, chip resistor specifications (summary): https://www.rohm.com/electronics-basics/resistors/chip-resistor-specifications
- S8 Ohmite (summary): https://ohmite.com/blog/2023/07/19/resistor-specifications-and-how-to-interpret-them ; DigiKey, power rating (summary): https://www.digikey.com/en/articles/power-rating-is-just-one-resistor-parameter-to-consider
- S9 TI SLVA689, I2C pull-up calculation (read): https://www.ti.com/lit/pdf/slva689 ; NXP UM10204 I2C-bus specification rev 7.0, section 7 (read): https://www.nxp.com/docs/en/user-guide/UM10204.pdf
- S10 DigiKey forum, MCU to relay with a MOSFET: https://forum.digikey.com/t/how-to-interface-a-microcontroller-with-a-relay-using-a-mosfet/41470
- S11 TI SLVA927A, low-side switches: https://ti.com/document-viewer/lit/html/SLVA927A/low-side-switches-t5090566-7
- S12 CircuitDigest, P-MOSFET reverse polarity protection: https://circuitdigest.com/electronic-circuits/reverse-polarity-protection-circuit-using-mosfet
- S13 Wilderness Labs, transistors (summary; it says nothing on thermal behaviour): https://developer.wildernesslabs.co/Hardware/Reference/Components/Common/Transistors/
- S14 BJT forced beta, All About Circuits (summary): https://forum.allaboutcircuits.com/threads/transistor-switch.43832/latest ; https://industrialmonitordirect.com/blogs/knowledgebase/transistor-saturation-with-ib1ma-icib10-rule-explained ; Nexperia BC817 and Diodes MMBT3904 datasheets (Vce(sat) at 10:1)
- S15 JLCPCB, LDO vs switching regulator: https://jlcpcb.com/blog/ldo-vs-switching-regulator-comparison-pcb-layout
- S16 Ultra Librarian, buck converter layout: https://www.ultralibrarian.com/2025/04/25/pcb-layout-buck-converter-important-design-guidelines-ulc/ ; TI SLYT614, buck layout (read)
- S17 TI SLVA773, boost converter layout (read): https://www.ti.com/document-viewer/lit/html/SLVA773/introduction-slvuam52816
- S18 TI SLVA115A, LP2951, TPS7A25 datasheets and onsemi NCP1117 datasheet (read), LDO output capacitor ESR: https://edgeworker.ti.com/lit/pdf/slva115 ; https://www.ti.com/document-viewer/LP2951/datasheet/application_and_implementation
- S19 Espressif hardware design guidelines, ESP32 schematic checklist; ESP32 (v5.3), ESP32-C3 and ESP32-S3 datasheets (read): https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32/schematic-checklist.html
- S20 Espressif hardware design guidelines, ESP32 PCB layout: https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32/pcb-layout-design.html
- S21 Random Nerd Tutorials, ESP32 pinout: https://randomnerdtutorials.com/esp32-pinout-reference-gpios/
- S22 espboards.dev, ESP32 strapping pins: https://www.espboards.dev/blog/esp32-strapping-pins/
- S23 Espressif esptool, boot mode selection (read): https://docs.espressif.com/projects/esptool/en/latest/advanced-topics/boot-mode-selection.html
- S24 Ampheo, ESP32 projects for beginners (filtered, secondary): https://www.ampheo.com/blog/esp32-projects-for-beginners-30-easy-ideas-with-code-and-circuit-diagrams
- S25 Microchip ATmega48A/PA/88A/PA/168A/PA/328/P datasheet DS40002061A and Microchip AVR042 hardware design considerations (Atmel-2521R) (read); secondary: Utmel, ATmega328P design guide: https://www.utmel.com/components/atmega328p-series-8-bit-avr-microcontroller-design-guide?id=7755
- S26 ST AN4488 rev 7 (F4), AN4938 rev 5 (H7), AN2867 rev 19 (oscillators), AN4879 (USB) (read in full): https://www.st.com/resource/en/application_note/an4488-getting-started-with-stm32f4xxxx-mcu-hardware-development-stmicroelectronics.pdf ; https://www.st.com/resource/en/application_note/an4938-getting-started-with-stm32h74xig-and-stm32h75xig-hardware-development-stmicroelectronics.pdf ; ST community, minimum wiring: https://community.st.com/t5/stm32-mcus-boards-and-hardware/minimum-wiring-stm32f446/td-p/169180
- S27 Raspberry Pi, Hardware design with RP2040 and the RP2040 datasheet (read): https://datasheets.raspberrypi.com/rp2040/hardware-design-with-rp2040.pdf ; DigiKey Maker, RP2040 schematic: https://www.digikey.com/es/maker/projects/hardware-design-with-the-rp2040-part-1-schematic/c4326f0fd813413698d617cf625125ee ; Embedded Computing, custom RP2040 board (third party, summary): https://embeddedcomputing.com/technology/open-source/development-kits/design-and-build-your-own-custom-rp2040-dev-board
- S28 Abracon crystal application notes (load capacitance, read); Microchip AVR042 (see S25); Suntsu (summary, 403): https://suntsu.com/suntsu-application-notes/crystal-load-capacitance ; Microchip AVR186 (summary, 403): https://www.insidegadgets.com/wp-content/uploads/2013/02/Best-Practices-for-the-PCB-layout-of-oscillators.pdf
- S29 ST community, USB crystal accuracy, quoting the USB 2.0 spec (summary; the spec itself was not opened): https://community.st.com/t5/stm32-mcus-embedded-software/crystal-accuracy-for-usb/td-p/426568
- S30 Wilderness Labs, LED forward voltage (page lists no numbers): https://developer.wildernesslabs.co/docs/api/Meadow.Foundation/Meadow.Foundation.Leds/TypicalForwardVoltage/ ; Build Electronic Circuits, current limiting resistor (summary): https://build-electronic-circuits.com/current-limiting-resistor ; OpenMV, LED dimming with PWM (read): https://docs.openmv.io/openmvcam/tutorial/hardware/pwm/led-dimming.html
- S31 Littelfuse Fuseology text (read via a Waytek-hosted copy): https://www.littelfuse.com/assetdocs/fuseology-selection-guide?assetguid=d812dff2-1c47-4dc3-bce7-07a4001ddc32 ; mbedded.ninja, PTC fuses (summary): https://blog.mbedded.ninja/electronics/components/ptc-resettable-fuses/ ; passive-components.eu, PPTC (summary): https://passive-components.eu/pptc-resettable-fuses-fundaments-and-applications/
- S32 LCSC, optocouplers vs digital isolators (read): https://www.lcsc.com/blog/optocouplers-vs-digital-isolators/ ; TI SLLA563, isolation and creepage (read): https://edgeworker.ti.com/lit/pdf/slla563
- S33 Panasonic automotive relay users guide ASCTB237E (read): https://industry.panasonic.com/global/en/products/control/relay/vehicle/usersguide ; Siemens, PCB high-voltage spacing (read): https://blogs.sw.siemens.com/electronic-systems-design/2025/04/29/pcb-high-voltage-spacing-what-every-engineer-should-know/ ; Omron FAQ faq02165 for inrush ratios (summary, 403) and industrialmonitordirect (summary, 403): https://industrialmonitordirect.com/blogs/knowledgebase/open-collector-relay-wont-disengage-back-emf-fix ; https://industrialmonitordirect.com/ar/blogs/knowledgebase/ssrs-vs-mechanical-relays-for-low-voltage-control-selection-guide
- S34 TI SN74HC00, SN74AHC00, SN74LVC00A datasheets and TI SCBA004E (read); Nexperia 74LVC74A, 74AHC74, 74HC74 datasheets (read): https://assets.nexperia.com/documents/data-sheet/74LVC74A.pdf , https://www.nexperia.com/group/74ahc74-74ahct74 ; TI e2e, unused inputs (summary, 403): https://e2e.ti.com/support/logic/f/logic-forum/885871/74ac16244-unused-inputs-pins
- S35 Sharp PC817X series datasheet (read); Learnabout Electronics, optocouplers (summary): https://learnabout-electronics.org/Semiconductors/opto_52.php
- S36 Analog Devices, PCB layout guidelines for RF and mixed-signal (summary, unreachable): https://www.analog.com/en/resources/technical-articles/pcbs-layout-guidelines-for-rf--mixedsignal.html
- S37 Vishay TSAL6200 rev 2.4 (read): https://www.vishay.com/doc/?81010= ; Vishay TSOP382/384 rev 2.1 (2025) and TSOP48 rev 2.4 (2025) (read); older revisions of TSOP382 (2010) and TSOP4838 (2011): https://www.vishay.com/docs/82491/tsop382.pdf ; https://datasheet.octopart.com/TSOP4838-Vishay-datasheet-10203384.pdf
- S38 USB Type-C Cable and Connector Specification R2.0, table 4-25 (read, usb.org); Microchip AN1953, section 3.2 (read); AISLER community thread on USB 2.0 with Type-C (404, unverified): https://community.aisler.net/t/implementing-usb-2-0-connectivity-with-a-type-c-connector/1511
- S39 WorldSemi WS2812B datasheet (VIH 0.7 VDD, pulse timing; read via a Vishay-format copy); Adafruit NeoPixel Uberguide (read): https://learn.adafruit.com/adafruit-neopixel-uberguide ; PJRC forum, WS2812 level shifting (summary): https://forum.pjrc.com/threads/71002-Launchpad-for-a-toddler?p=313353
- S40 Wuerth Elektronik SN011, ageing of MLCCs (read)
- S41 Silicon Labs CP2102 datasheet (read via an archive.org copy)
- S42 Linear Technology (Analog Devices) AN-88, Ceramic input capacitors can cause overvoltage transients (read via an archive.org copy; analog.com refused the download): https://www.analog.com/media/en/technical-documentation/application-notes/an88f.pdf
- S43 TI SSZT658, LDO basics: preventing reverse current (read): https://www.ti.com/lit/pdf/sszt658
- S44 Analog Devices, Analog Dialogue 50-02, Ferrite beads demystified (read via an archive.org copy): https://www.analog.com/en/resources/analog-dialogue/articles/ferrite-beads-demystified.html
- S45 TI SSZTAP0, Logic gates and switches with Ioff or powered-off protection (read): https://www.ti.com/lit/pdf/ssztap0
- S46 TI SLYT499, Grounding in mixed-signal systems demystified, part 1 (read): https://www.ti.com/lit/pdf/slyt499
- S47 B. Leung, How to design a proper USB-C power sink (Raspberry Pi 4 case; read, secondary; the specification is S38): https://people.kernel.org/bleung/how-to-design-a-proper-usb-c-power-sink-hint-not-the-way-raspberry-pi-4
- S48 JLCPCB, Terms and conditions of the assembly service, section 2 "Notes on DFM" and section 5 "Disclaimer" (read, page dated 2026-09-09): https://jlcpcb.com/help/article/61-Terms-and-Conditions-of-JLCPCB-Assembly-Service
- S49 Eurocircuits, PCB assembly guidelines: tombstoning (read): https://www.eurocircuits.com/pcb-assembly-guidelines-tombstoning/
- S50 Siemens EDA blog, 4 less obvious PCB DFM violations (read, secondary): https://blogs.sw.siemens.com/electronic-systems-design/2020/03/16/4-less-obvious-pcb-dfm-violations/
- S51 Nexperia AN11158 rev 7.0, Understanding power MOSFET data sheet parameters (RDSon and VGS(th) sections read): https://assets.nexperia.com/documents/application-note/AN11158.pdf
- S52 Advanced Monolithic Systems AMS1117 datasheet, pin connections (read): http://www.advanced-monolithic.com/pdf/ds1117.pdf ; KiCad forum, SOT-23 pin-out: base and emitter are inverted (read, secondary): https://forum.kicad.info/t/sot-23-pin-out-base-and-emitter-are-inverted/41831
- S53 Raspberry Pi Pico datasheet, powering Pico (read): https://datasheets.raspberrypi.com/pico/pico-datasheet.pdf
- S54 Pololu blog, More LEDs (read, secondary): https://www.pololu.com/blog/9
- S55 WLED forum, Do NOT use BSS138 for logic level shifting (read, secondary): https://wled.discourse.group/t/do-not-use-bss138-for-logic-level-shifting-too-slow/6054
