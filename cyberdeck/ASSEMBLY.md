# CyberDeck Assembly Guide

This guide walks you through building your CyberDeck from parts to a working portable computer. Read through all steps before you start.

---

## Before You Begin

### Tools You'll Need

- **Phillips screwdriver** (PH0 and PH1) — for standoffs, screen brackets, and enclosure screws
- **Soldering iron + solder** — for attaching GPIO button wires
- **Heat shrink tubing** — to insulate solder joints (apply with a lighter or heat gun)
- **Multimeter** — for checking continuity and verifying wiring before powering on
- **Wire stripper** — for preparing jumper wire ends
- **Hot glue gun** — for securing loose cables inside the enclosure
- **SD card reader** — for flashing the OS to your microSD

### Before You Start

- Read the [Wiring Diagram](docs/wiring-diagram.md) fully before soldering anything.
- Have the [Bill of Materials](docs/bill-of-materials.md) open so you can check off parts.
- Do a dry fit of everything outside the enclosure before final assembly.
- Never connect the UPS HAT to the Pi while the battery cells are installed and the Pi is powered. Connect order: install cells, then attach HAT to Pi GPIO.

---

## Step 1: Get the Enclosure Printed

You don't need a 3D printer — send the specs to your contact with one.

Open [docs/3d-printing.md](docs/3d-printing.md) and forward that file (or copy the "What to Tell Your Printer" section) to your printer contact. The specs are there: PETG, 0.2mm layer height, 20% gyroid infill, supports only on the main body button holes.

**Turnaround is typically 1-2 days.** Order early — you can assemble everything else while you wait.

Parts to request:
- Main body (bottom shell) — 1×
- Top lid — 1×
- Screen bezel — 2×
- Button caps — 6×

Use this wait time to flash your SD card (Step 7) and test your Pi outside the enclosure.

---

## Step 2: Prepare the Raspberry Pi

**Apply heatsinks before doing anything else.** The Pi 5 runs hot under load.

1. Clean the top of each chip with isopropyl alcohol and let it dry.
2. Apply the heatsink(s) from your heatsink kit — at least one on the main SoC, optionally one on the RAM and USB controller.
3. If you have an active cooling fan (recommended for Pi 5), attach it to the heatsink now.
4. Insert your microSD card (flashed per Step 7, or flash it now if you want to test early).
5. Connect a monitor via micro-HDMI, plug in a USB keyboard, and power the Pi via USB-C.
6. Verify it boots to the Raspberry Pi OS desktop. Log in, confirm WiFi works, and shut down cleanly.

This confirms your Pi is healthy before it goes into the enclosure.

---

## Step 3: Mount the Screens

**Parts needed:** 2× 5" HDMI screens, 2× screen bezels (printed), 2× micro-HDMI to HDMI cables.

1. Place each screen face-down on a soft surface to avoid scratching.
2. Test each screen individually: connect to Pi via micro-HDMI, power Pi, confirm display works.
3. Slide each screen into its printed bezel. The bezel lip should grip the screen perimeter firmly. Add a small dot of hot glue at each corner of the back side to secure.
4. Route the micro-HDMI cables through the cable channels in the bezel.
5. The two bezels will mount into the top lid in Step 6. For now, set them aside.

**Screen 1** (primary, left or top) connects to the micro-HDMI port closer to the USB-C power port.
**Screen 2** (secondary, right or portrait) connects to the second micro-HDMI port.

See [docs/display-setup.md](docs/display-setup.md) for software configuration after assembly.

---

## Step 4: Wire the GPIO Buttons

**Parts needed:** 6× 12mm tactile push buttons, jumper wires (female-female, 20cm), soldering iron, heat shrink.

The buttons use the Pi's internal pull-up resistors — no external resistors needed. Each button connects its GPIO pin to any GND pin.

Full pin assignments are in [docs/wiring-diagram.md](docs/wiring-diagram.md). Summary:

| Button | GPIO | Physical Pin | Action |
|--------|------|-------------|--------|
| 1 | GPIO 17 | Pin 11 | Brightness Up |
| 2 | GPIO 27 | Pin 13 | Brightness Down |
| 3 | GPIO 22 | Pin 15 | Volume Toggle |
| 4 | GPIO 5  | Pin 29 | Launch App |
| 5 | GPIO 6  | Pin 31 | Screenshot |
| 6 | GPIO 13 | Pin 33 | Power (hold 2s = shutdown) |

**Wiring each button:**
1. Cut two jumper wires per button to a comfortable length for routing inside the enclosure.
2. Solder one wire to each leg of the tactile button. Buttons are not polarized — either leg works for either wire.
3. Slide heat shrink over each joint before soldering, then shrink it down after.
4. Label each wire with a small piece of tape while you work (GPIO pin number).
5. Use a multimeter in continuity mode to verify each button: press it and confirm the two wires connect.

**Before connecting to the Pi:** verify all wires are insulated and no bare conductors can short.

---

## Step 5: Install the UPS HAT

**Parts needed:** Waveshare UPS HAT (B), 3× 18650 cells (charged to at least 50%).

1. **Do not install cells yet.** Handle the HAT with the cells out.
2. Align the UPS HAT with the Pi's 40-pin GPIO header. The HAT stacks on top of the Pi.
3. Press down firmly and evenly until it's fully seated. All 40 pins should be engaged.
4. Use the M2.5 standoffs from your kit to secure the HAT to the Pi — standoffs at each corner.
5. Now insert the 18650 cells into the HAT holders, observing polarity (+ and - marked on the holder).
6. Connect the HAT's I2C pins (SDA → GPIO 2 / Pin 3, SCL → GPIO 3 / Pin 5) — the HAT usually handles this via the stacked header, but verify with the Waveshare documentation for your specific model.

Check the Waveshare UPS HAT documentation for your exact model if the header layout differs.

---

## Step 6: Final Assembly

With all components tested, it's time to put everything in the enclosure.

1. **Place the Pi + HAT assembly** into the main body. Line up the mounting holes with the M2.5 standoffs in the enclosure floor. Screw down with M2.5 screws (do not overtighten — snug is enough).
2. **Route cables:** Thread the micro-HDMI cables up through the enclosure toward the lid. Route GPIO button wires to the right-side panel cutouts.
3. **Mount the screens:** Snap the screen bezels into the top lid cutouts. The screens should sit flush. A thin bead of hot glue around the bezel perimeter holds them securely once you've confirmed alignment.
4. **Connect GPIO button wires** to the Pi's GPIO pins per the wiring diagram. Female jumper connectors press directly onto the GPIO pins.
5. **Insert buttons into their panel cutouts.** Press each button cap onto its switch. Secure with hot glue from inside if needed.
6. **Connect the micro-HDMI cables** to the Pi's two micro-HDMI ports.
7. **Cable management:** Use hot glue or small zip tie points inside the enclosure to keep cables from pinching when the lid closes.
8. **Close the lid:** Line up the top lid with the main body. Insert M3 screws at all four corners. Do not fully tighten until you've confirmed the lid sits flat without binding any cables.
9. Final tighten all screws.

---

## Step 7: Flash the SD Card

1. Download **Raspberry Pi Imager** from [raspberrypi.com/software](https://www.raspberrypi.com/software/) and install it on your laptop.
2. Open the Imager. Under "Choose OS," select: **Raspberry Pi OS (other) → Raspberry Pi OS Bookworm (64-bit)**.
3. Under "Choose Storage," select your microSD card.
4. Click the **gear icon** (advanced options) before writing:
   - Enable SSH
   - Set username and password (default `pi` works, but choose a strong password)
   - Set your WiFi SSID and password so the Pi connects automatically on first boot
   - Set your locale/timezone
5. Click **Write** and wait for it to finish (5–10 minutes).
6. Insert the SD card into the Pi (it's accessible from the bottom of the enclosure — leave the card slot accessible before final screw-down).

---

## Step 8: Run setup.sh

1. Power on the CyberDeck via the USB-C port on the UPS HAT.
2. Wait 30–60 seconds for the Pi to boot.
3. Either:
   - Connect via SSH: `ssh pi@<pi-ip-address>` from your laptop (check your router for the IP), or
   - Use the physical keyboard connected to one of the Pi's USB ports
4. Clone the repo (or copy the files) to the Pi:
   ```bash
   git clone https://github.com/yourusername/cyberdeck.git
   cd cyberdeck
   ```
5. Run the setup script:
   ```bash
   chmod +x software/setup.sh
   sudo ./software/setup.sh
   ```
6. The script takes 10–15 minutes. It installs packages, sets up Python, installs systemd services, and configures the display.
7. When it finishes, you'll see the green "CyberDeck setup complete!" banner.

---

## Step 9: Configure Displays

After setup.sh completes, run the display configuration script:

```bash
sudo ./software/display/setup_displays.sh
```

This detects your connected screens and lets you choose a layout:
- **Option 1** — Side by side, both landscape
- **Option 2** — Side by side, right screen rotated to portrait
- **Option 3** — Single display

For a cyberdeck, Option 2 is popular: primary landscape screen for your main work, portrait secondary for a terminal or status panel.

The choice is saved and applied on every boot. See [docs/display-setup.md](docs/display-setup.md) for manual xrandr commands and troubleshooting.

Then reboot:

```bash
sudo reboot
```

---

## Testing Your Build

Run through this checklist after your first full boot:

- [ ] Both screens power on and show the desktop
- [ ] Screen 1 is primary (taskbar appears here)
- [ ] Screen 2 is positioned correctly (side by side or portrait)
- [ ] All 6 GPIO buttons respond (test with `python3 -c "import RPi.GPIO as GPIO; GPIO.setmode(GPIO.BCM); GPIO.setup(17, GPIO.IN, pull_up_down=GPIO.PUD_UP); print(GPIO.input(17))"` — press Button 1, value should change)
- [ ] Battery shows a percentage in `/tmp/battery.txt` — `cat /tmp/battery.txt`
- [ ] UPS HAT charges when USB-C is connected
- [ ] Launcher starts when you log in to TTY1 (switch with Ctrl+Alt+F1)
- [ ] Web dashboard loads at `http://localhost:5000`
- [ ] Screenshot button (GPIO 6) saves a file to `~/screenshots/`
- [ ] Power button held 2s triggers a clean shutdown

---

## Troubleshooting

**Blank screen / no signal on one or both displays**
- Verify the micro-HDMI cable is fully seated (they can be finicky)
- Check that `hdmi_force_hotplug=1` and `hdmi_force_hotplug:1=1` are in `/boot/firmware/config.txt`
- Try swapping the cable or screen to isolate which component is at fault
- Run `xrandr` to see if the display is detected but just off — if so, run the display setup script again

**GPIO buttons not working**
- Run `sudo i2cdetect -y 1` — if UPS HAT is detected that confirms I2C is working
- Check the GPIO daemon: `sudo systemctl status cyberdeck-gpio.service`
- Verify wiring with multimeter continuity test (button pressed = continuity between GPIO pin and GND)
- Check logs: `sudo journalctl -u cyberdeck-gpio.service -n 50`

**Battery not detected / `/tmp/battery.txt` shows N/A**
- Confirm the UPS HAT is fully seated on the GPIO header — reseat it
- Check I2C: `sudo i2cdetect -y 1` — you should see address `0x36` (Waveshare) or `0x75` (PiSugar)
- Check battery service: `sudo systemctl status cyberdeck-battery.service`
- Verify I2C is enabled: `sudo raspi-config` → Interface Options → I2C → Enable

**Launcher won't start on login**
- The launcher starts on TTY1 (not the desktop). Switch with Ctrl+Alt+F1
- Check that `/etc/profile.d/cyberdeck-launcher.sh` exists
- Test manually: `/opt/cyberdeck/venv/bin/python3 /opt/cyberdeck/launcher/launcher.py`
- Check for Python errors in that manual run

**Web dashboard not loading on port 5000**
- Check: `sudo systemctl status cyberdeck-dashboard.service`
- Restart: `sudo systemctl restart cyberdeck-dashboard.service`
- Check logs: `sudo journalctl -u cyberdeck-dashboard.service -n 30`
- Verify Flask is installed in the venv: `/opt/cyberdeck/venv/bin/pip list | grep Flask`
