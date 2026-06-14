# Display Setup

This guide covers configuring dual HDMI displays on the CyberDeck. The setup script handles most of this automatically, but this document explains what's happening and how to make manual adjustments.

---

## Section 1: Boot Configuration (/boot/config.txt)

The Pi needs specific settings to reliably drive two small HDMI displays. These are added automatically by `setup.sh`, but you can verify or add them manually.

On **Pi 5** and recent Pi 4 images, the config file is at `/boot/firmware/config.txt`.
On older Pi 4 images, it may be at `/boot/config.txt`.

The setup script detects which path exists and writes to the correct one. If you want to add these manually, add the lines from `software/display/boot_config_additions.txt` to the end of your config file:

```bash
sudo nano /boot/firmware/config.txt
# Paste the contents of software/display/boot_config_additions.txt at the end
```

Key settings that are added:
- `hdmi_force_hotplug=1` — forces HDMI output even if no display is detected at boot
- `config_hdmi_boost=4` — boosts signal strength for small screens and longer cables
- Resolution settings for 800×480 displays on both ports
- `disable_overscan=1` — removes black borders around the screen

After editing config.txt, a reboot is required for changes to take effect.

---

## Section 2: Running setup_displays.sh

After rebooting with the new config, run the display setup script to configure the layout:

```bash
sudo /opt/cyberdeck/display/setup_displays.sh
```

The script:
1. Detects which display outputs are connected (using `xrandr`)
2. Shows you a menu to choose your layout
3. Applies the layout immediately via `xrandr`
4. Saves the command to `~/.config/cyberdeck/display.conf`
5. Adds an autostart entry so the layout is applied on every login

You can re-run this script any time to change the layout.

---

## Section 3: Manual xrandr Commands

If you want to configure displays manually without the script, here are the common layouts.

First, see what displays are connected:
```bash
xrandr
```
Look for lines ending in `connected`. Common output names are `HDMI-1`, `HDMI-2`, `HDMI-A-1`, `HDMI-A-2`.

**Side by side (both landscape):**
```bash
xrandr --output HDMI-1 --primary --auto --output HDMI-2 --right-of HDMI-1 --auto
```

**Portrait secondary (right screen rotated):**
```bash
xrandr --output HDMI-1 --primary --auto --output HDMI-2 --right-of HDMI-1 --auto --rotate left
```

**Mirror both screens:**
```bash
xrandr --output HDMI-1 --primary --auto --output HDMI-2 --same-as HDMI-1 --auto
```

**Single screen (disable secondary):**
```bash
xrandr --output HDMI-1 --primary --auto --output HDMI-2 --off
```

**Set a specific resolution manually:**
```bash
xrandr --output HDMI-1 --mode 800x480 --rate 60
```

---

## Section 4: Making It Persistent

The `setup_displays.sh` script saves your chosen layout to two places:

**Config file** — `~/.config/cyberdeck/display.conf`
Contains the exact `xrandr` command. Edit this file directly to adjust the layout without re-running the script.

**Autostart entry** — `~/.config/autostart/cyberdeck-displays.desktop`
A standard `.desktop` file that runs the xrandr command on every desktop session start. This ensures the layout is applied after every login.

To make a permanent manual change:
```bash
# Edit the saved command
nano ~/.config/cyberdeck/display.conf

# The autostart entry references this — it re-reads on next login
```

Or regenerate both by running `setup_displays.sh` again.

---

## Section 5: Touchscreen Calibration

If your 5" screens are touchscreens, you may need to calibrate the touch input after changing the display layout, especially if one screen is rotated.

Install the calibration tool if not already present:
```bash
sudo apt install xinput-calibrator
```

Run calibration:
```bash
DISPLAY=:0 xinput_calibrator
```

Follow the on-screen crosshair prompts. The tool outputs calibration values — add them to `/etc/X11/xorg.conf.d/99-calibration.conf` as instructed by the tool output.

For a rotated screen, you may also need to set the touch matrix:
```bash
# Find your touch device ID
xinput list

# Apply rotation matrix for a left-rotated screen (--rotate left)
xinput set-prop <device-id> "Coordinate Transformation Matrix" 0 -1 1 1 0 0 0 0 1
```

---

## Troubleshooting

**No signal on one or both screens at boot:**
- Verify `hdmi_force_hotplug=1` is in config.txt (for the right port: also `hdmi_force_hotplug:1=1`)
- Try a different micro-HDMI cable — these connectors are fragile and the most common failure point
- Run `xrandr` from the terminal — if the display appears in the output but is "off," run the setup script again

**Wrong resolution (overscan, stretched, or fuzzy):**
- Verify the `hdmi_cvt` line in config.txt matches your screen's actual resolution
- Add `hdmi_ignore_edid=0xa5000080` if the Pi is ignoring the screen's EDID (resolution info)
- For 800×480 screens: `hdmi_cvt=800 480 60 6 0 0 0`
- For 1024×600 screens: `hdmi_cvt=1024 600 60 6 0 0 0`

**Screens appear swapped (Screen 2 is primary):**
- Run xrandr and check which output is labeled which way
- Swap the micro-HDMI cables, or explicitly set `--primary` on the correct output in the xrandr command

**Portrait screen shows desktop rotated incorrectly:**
- Re-run `setup_displays.sh` and choose option 2
- Or manually: `xrandr --output HDMI-2 --rotate left` (try `right` if `left` is wrong)
