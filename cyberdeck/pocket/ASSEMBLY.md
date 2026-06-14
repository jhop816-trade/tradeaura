# CyberDeck Pocket — Assembly Guide

**Estimated build time:** 3–5 hours (not including print time)

This guide covers the pocket-specific steps. For software setup, see `../software/setup.sh` — it works identically on the Pi Zero 2 W.

---

## Before You Begin

### Tools

- Soldering iron + solder (finer tip helps — smaller components)
- Wire stripper
- Multimeter
- Phillips head screwdriver (#0 and #1)
- Hot glue gun
- Tweezers
- SD card reader

> The pocket build involves more precise soldering than the standard model. If you've never soldered before, practice on a scrap PCB first — or pick the USB keyboard module option in Step 4 (no matrix wiring needed).

---

## Step 1: Get the Shell Printed

Send the specs from [`docs/3d-printing.md`](docs/3d-printing.md) to your printer contact. Three pieces to print: bottom shell, top shell/screen bezel, keyboard plate, and 4× side button caps. Total print time is about 8 hours — they can run it overnight.

**What to tell them:**
> "I need 4 parts printed in PETG, 0.2mm layers, 3 walls. The keyboard plate needs supports for the switch holes. Black or dark grey if possible."

While it's printing, continue with Steps 2–6.

---

## Step 2: Prepare the Pi Zero 2 W

1. **Solder the GPIO header.** The Pi Zero 2 W ships without headers — solder a 2×20 pin header yourself. Tin the pads, place the header, solder each pin. Take your time — 40 pins total.
2. Attach a small heatsink (15×15mm) to the SoC chip (square chip in the center)
3. **Test before assembly:** connect a micro-HDMI adapter, plug into a monitor, boot with a fresh SD card to confirm the Pi works before putting it in the enclosure

---

## Step 3: Install the Screen

The 3.5" IPS SPI display (ILI9486) connects directly via the GPIO header:

1. Plug the display onto the GPIO header — it sits on top of the Pi
2. Enable SPI: `sudo raspi-config` → Interface Options → SPI → Enable
3. Install the display driver (follow your screen's manufacturer instructions — usually a one-line install script)
4. Test that the display shows output before installing in the enclosure
5. Set rotation via the driver config to match your enclosure orientation

---

## Step 4: Build the Thumb Keyboard

**Option A — Custom key matrix (satisfying, more work):**

1. Press 44× tactile switches into the keyboard plate holes (4 rows × 11 columns)
2. Wire rows: solder one leg of each key in a row together
3. Wire columns: solder the other leg of each key in a column together
4. Connect row wires (4) → MCP23017 GPA0–GPA3
5. Connect column wires (11) → MCP23017 GPA4–GPA7 + GPB0–GPB2
6. Connect MCP23017 SDA → Pi GPIO 2, SCL → Pi GPIO 3
7. See `docs/wiring-diagram.md` for full details

**Option B — USB keyboard module (easiest, plug-and-play):**

1. Buy a compact USB HID keyboard module (BlackBerry-style, ~$12 on AliExpress)
2. Connect its USB cable to the Pi's micro-USB OTG port via adapter
3. Linux detects it automatically — no driver needed

---

## Step 5: Battery and Power

**Option A — PiSugar 2 (recommended, no soldering):**

1. Attach the PiSugar 2 to the back of the Pi Zero 2 W via the pogo pins — snaps on magnetically
2. The PiSugar 2 charges via micro-USB and reports battery % over I2C
3. The battery monitor software auto-detects it at address 0x75

**Option B — DIY 18650 (cheaper, requires soldering):**

1. Wire: 18650 cell → TP4056 (B+/B−) → MT3608 boost converter → Pi 5V/GND pins
2. USB-C/micro-USB charging port from TP4056 routes to the side panel cutout
3. Check boost converter output with a multimeter — must read 5.0–5.2V before connecting to Pi

---

## Step 6: Side Buttons

1. Solder 4× 6mm tactile buttons into the right side panel holes
2. Connect: GPIO 17 (Vol Up), GPIO 27 (Vol Down), GPIO 22 (Screenshot), GPIO 13 (Power)
3. Other leg of each button → GND
4. See `docs/wiring-diagram.md` for the exact pinout

---

## Step 7: Final Assembly

1. Place Pi (with screen on top) into the bottom shell — align M2.5 mounting holes
2. Secure Pi with M2 screws through the bottom
3. Route screen ribbon cable through the slot in the shell
4. Route charging port to the side panel cutout
5. Press keyboard plate into the front recess — friction fit
6. Seat the top shell and secure with M2 screws at the four corners
7. Press button caps into the side holes

---

## Step 8: Software Setup

1. Flash **Raspberry Pi OS Bookworm Lite (32-bit)** to a 64GB microSD
2. Use Raspberry Pi Imager advanced options: hostname `cyberdeck-pocket`, enable SSH, set username/password, configure WiFi
3. Insert SD, power on, SSH in (or use keyboard directly)
4. Run:
   ```bash
   git clone https://github.com/youruser/cyberdeck.git
   cd cyberdeck/software
   sudo bash setup.sh
   ```
5. Enable SPI for the screen if not already done

---

## Testing Checklist

- [ ] Screen shows the desktop or launcher
- [ ] Thumb keyboard types characters correctly
- [ ] WiFi connects — open Chromium and load a website
- [ ] YouTube plays video
- [ ] All 4 side buttons respond
- [ ] Battery charges when plugged in
- [ ] Battery % shows in the launcher status bar
- [ ] Screenshot button saves to ~/screenshots/
- [ ] Power button (hold 2s) shuts down cleanly

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Screen blank | Confirm SPI is enabled; check screen driver install |
| Keyboard not working (matrix) | `sudo i2cdetect -y 1` should show 0x20; check SDA/SCL wires |
| USB keyboard not detected | Try `lsusb`; ensure OTG mode is enabled in `/boot/config.txt` |
| Pi won't power on | Check boost converter output (5V); check polarity on power wires |
| Battery not detected | `i2cdetect -y 1` should show 0x75 (PiSugar 2) — check pogo pin contact |
| Overheating | Ensure heatsink is attached; add small vent holes to the top shell |
