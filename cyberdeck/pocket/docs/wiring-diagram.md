# Wiring Diagram — CyberDeck Pocket

All connections for the Pi Zero 2 W build.

---

## Pi Zero 2 W GPIO Header (40-pin)

```
       3.3V [ 1] [ 2] 5V
   I2C SDA  [ 3] [ 4] 5V
   I2C SCL  [ 5] [ 6] GND
            [ 7] [ 8]
        GND [ 9] [10]
     GPIO17 [11] [12]         ← Side Button 1 (Vol Up)
     GPIO27 [13] [14] GND     ← Side Button 2 (Vol Down)
     GPIO22 [15] [16]         ← Side Button 3 (Screenshot)
       3.3V [17] [18] GPIO24  ← Screen RST
 SPI0 MOSI [19] [20] GND
 SPI0 MISO [21] [22] GPIO25  ← Screen DC
 SPI0 SCLK [23] [24] GPIO8   ← Screen CS (CE0)
        GND [25] [26]
            [27] [28]
            [29] [30] GND
            [31] [32]
     GPIO13 [33] [34] GND     ← Side Button 4 (Power — hold 2s = shutdown)
            [35] [36]
            [37] [38]
        GND [39] [40]
```

---

## 3.5" SPI Screen (ILI9486)

| Screen Pin | Pi Physical Pin | GPIO |
|-----------|----------------|------|
| VCC | Pin 17 | 3.3V |
| GND | Pin 20 | GND |
| MOSI | Pin 19 | GPIO 10 |
| MISO | Pin 21 | GPIO 9 |
| SCLK | Pin 23 | GPIO 11 |
| CS | Pin 24 | GPIO 8 (CE0) |
| DC | Pin 22 | GPIO 25 |
| RST | Pin 18 | GPIO 24 |

Enable SPI after flashing: `sudo raspi-config` → Interface Options → SPI → Yes

For display rotation, edit `/boot/config.txt`:
```
dtoverlay=waveshare35a      # use your screen's specific overlay name
display_rotate=1            # 0=normal, 1=90°, 2=180°, 3=270°
```

---

## Thumb Keyboard — MCP23017 I2C Expander (Custom Matrix)

| MCP23017 Pin | Connects to | Notes |
|-------------|------------|-------|
| VCC | Pi Pin 17 | 3.3V |
| GND | Pi Pin 6 | GND |
| SDA | Pi Pin 3 | GPIO 2 |
| SCL | Pi Pin 5 | GPIO 3 |
| A0 | GND | Sets I2C address to 0x20 |
| A1 | GND | |
| A2 | GND | |
| GPA0–GPA3 | Keyboard rows (4 wires) | One wire runs across all keys in that row |
| GPA4–GPA7, GPB0–GPB2 | Keyboard columns (11 wires) | One wire runs down all keys in that column |

**How the matrix works:** Each key sits at the intersection of one row and one column wire. One leg of the switch connects to the row wire, the other to the column wire. The MCP23017 scans rows and reads which columns register a press.

Verify I2C detection after wiring:
```bash
sudo i2cdetect -y 1
# Should show 0x20 for MCP23017
```

**USB keyboard alternative:** Connect any USB HID keyboard to Pi's micro-USB OTG port. Enable OTG in `/boot/config.txt`:
```
dtoverlay=dwc2
```

---

## Side Buttons

| GPIO (BCM) | Physical Pin | Button | Action |
|-----------|-------------|--------|--------|
| GPIO 17 | Pin 11 | Button 1 | Volume Up |
| GPIO 27 | Pin 13 | Button 2 | Volume Down |
| GPIO 22 | Pin 15 | Button 3 | Screenshot |
| GPIO 13 | Pin 33 | Button 4 | Power (hold 2s = shutdown) |

Wiring: one leg → GPIO pin, other leg → GND. The software uses internal pull-up resistors — **no external resistors needed**.

---

## Battery

**PiSugar 2 (recommended):**
- Attaches via magnetic pogo pins to the back of the Pi Zero 2 W — no soldering
- Charges via micro-USB port on the PiSugar board
- I2C battery reporting at address `0x75` — auto-detected by the battery monitor software

Verify detection:
```bash
sudo i2cdetect -y 1
# Should show 0x75 for PiSugar 2
```

**DIY 18650 power chain:**
```
18650 cell  →  TP4056 (B+ / B−)  →  MT3608 boost input  →  Pi 5V pin (pin 2 or 4) + GND (pin 6)
                    ↑
         Charging port routes to enclosure side panel
```

Check MT3608 output with a multimeter before connecting to the Pi — must read **5.0–5.2V**.

---

## Safety Notes

- Pi Zero 2 W GPIO is **3.3V tolerant only** — never connect 5V to GPIO pins
- Always verify GND connections before powering on
- Check 18650 battery polarity (+ and −) before soldering
- The Pi Zero 2 W has no reverse-polarity protection on the 5V power pins
