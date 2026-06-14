# CyberDeck Pocket — Quick Start Guide

Everything you need from unboxing parts to a working device.

---

## What You Ordered

| Part | Used for |
|------|---------|
| Raspberry Pi Zero 2 W | The brain |
| 2×20 GPIO header | Connects Pi to screen + buttons |
| 3.5" SPI display (ILI9486) | The screen |
| PiSugar 2 | Battery (snaps on, no wiring) |
| 6mm tactile buttons × 4 | Side action buttons |
| Heatsink 15×15mm | Keeps Pi cool |
| microSD 64GB | Storage |
| USB keyboard module OR 44× switches + MCP23017 | Thumb keyboard |
| M2 screws + standoffs | Holds it all together |
| 28AWG wire | Button wiring |

---

## Step 1 — Flash the SD Card (Do This Before Parts Even Arrive)

1. Download **Raspberry Pi Imager** → [raspberrypi.com/software](https://www.raspberrypi.com/software/)
2. Insert your 64GB microSD into your computer
3. In the Imager:
   - **Device:** Raspberry Pi Zero 2
   - **OS:** Raspberry Pi OS (32-bit) — pick the **Lite** version under "Raspberry Pi OS (other)"
   - **Storage:** your microSD
4. Click the **gear icon ⚙** → fill in:
   - Hostname: `cyberdeck-pocket`
   - Enable SSH ✅
   - Username: `pi` / Password: pick something you'll remember
   - WiFi: your home network name + password
   - Locale/timezone: set yours
5. Click **Save** → **Write** → confirm

Done. SD card is ready. Set it aside until your Pi arrives.

---

## Step 2 — Solder the GPIO Header

When your Pi Zero 2 W arrives, the first thing to do is solder the 40-pin header onto it.

1. Place the header into the Pi Zero 2 W's 40 holes (short pins go through the board, long pins face up)
2. Flip upside down and solder every pin from the back — work row by row
3. Let it cool completely before touching

If you've never soldered: watch a 5-min YouTube video on "how to solder through-hole headers" — it's easy once you see it done once.

---

## Step 3 — Attach Heatsink + PiSugar 2

1. Peel the adhesive off the 15×15mm heatsink and stick it to the large square chip on the Pi
2. Snap the PiSugar 2 onto the back of the Pi Zero 2 W via the pogo pins — it's magnetic, just align and press
3. Charge the PiSugar 2 via its micro-USB port for an hour before continuing

---

## Step 4 — Attach the Screen

The 3.5" SPI screen plugs directly onto the 40-pin GPIO header you just soldered:

1. Line up the screen's 26-pin connector with the first 26 pins of the Pi's header (from the corner)
2. Press down gently until it seats fully
3. The screen sits on top of the Pi, sandwiched above the header

---

## Step 5 — Wire the Side Buttons

Each button: one leg → GPIO pin, other leg → any GND pin.

| Button | GPIO Pin | Physical Pin |
|--------|---------|-------------|
| Vol Up | GPIO 17 | Pin 11 |
| Vol Down | GPIO 27 | Pin 13 |
| Screenshot | GPIO 22 | Pin 15 |
| Power | GPIO 13 | Pin 33 |

Use jumper wires (female on both ends) — no soldering needed for this step.

---

## Step 6 — Keyboard

**USB keyboard module (easy path):**
- Connect the module's USB cable to the Pi's micro-USB data port via a micro-USB OTG adapter
- The Pi recognizes it automatically as a USB keyboard

**Custom matrix (advanced):**
- Wire 44 tactile switches into the keyboard plate as described in `ASSEMBLY.md`
- Connect MCP23017 to GPIO 2 (SDA) and GPIO 3 (SCL)
- The keyboard driver handles the rest

---

## Step 7 — Insert SD Card and Power On

1. Insert the flashed microSD into the Pi Zero 2 W's card slot (bottom edge)
2. Power on via the PiSugar 2 (press its power button)
3. First boot takes ~90 seconds — wait for the green LED to stop flashing

---

## Step 8 — Run the Setup Script

SSH into the Pi from your laptop:
```bash
ssh pi@cyberdeck-pocket.local
# Enter your password when prompted
```

If `.local` doesn't work, find the IP address in your router's device list.

Then run:
```bash
# Clone the project
git clone https://github.com/jhop816-trade/tradeaura.git
cd tradeaura/cyberdeck/pocket/software

# Make scripts executable
chmod +x pocket-setup.sh display/spi_display_setup.sh

# Run the pocket setup (takes 10-15 min)
sudo bash pocket-setup.sh
```

---

## Step 9 — Reboot and Test

```bash
sudo reboot
```

After reboot:
- The SPI screen should show the desktop or terminal
- The launcher starts automatically when you log into TTY1
- Web dashboard is at `http://cyberdeck-pocket.local:5000`
- Test buttons with: `sudo evtest`
- Check battery: `cat /tmp/battery.txt`

---

## Step 10 — Put It in the Enclosure

Once everything is working on the open bench:

1. Follow `ASSEMBLY.md` for final enclosure steps
2. Secure the Pi with M2 screws
3. Route cables neatly
4. Close it up

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Pi won't boot | Check SD card is properly seated; try re-flashing |
| Can't SSH | Make sure Pi and laptop are on same WiFi; check hostname spelling |
| Screen blank after boot | Rerun `sudo bash display/spi_display_setup.sh` and reboot |
| Keyboard not working | For USB: check OTG adapter; for matrix: `sudo i2cdetect -y 1` should show 0x20 |
| Battery not detected | `sudo i2cdetect -y 1` should show 0x75; check pogo pin alignment |
| Pi running hot | Make sure heatsink is attached; check `vcgencmd measure_temp` |

---

## You're Done

Your CyberDeck Pocket runs full Linux. Open Chromium and go to YouTube — it works.
```bash
chromium-browser --disable-gpu https://youtube.com
```
