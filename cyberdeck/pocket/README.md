# CyberDeck Pocket

**A PSP Go-sized portable hacker terminal — fits in your pocket.**

> All the power of the CyberDeck, sized to carry everywhere.

The CyberDeck Pocket is a compact handheld computer built around the Raspberry Pi Zero 2 W. Inspired by the PSP Go form factor, it fits in a jacket pocket while still running a full Linux desktop — Chromium, YouTube, WiFi, Python, the works. The thumb keyboard is built right in.

Runs the **exact same software** as the [standard CyberDeck](../README.md) — one setup script covers both.

---

## Features

- **PSP Go form factor** — ~160mm × 85mm × 25mm, fits in any pocket
- **Single 3.5" IPS screen** (480×320)
- **Built-in 44-key thumb keyboard** — 4-row QWERTY, BlackBerry-style
- **Raspberry Pi Zero 2 W** — WiFi + Bluetooth built in, no dongle needed
- **4–6 hour battery life** — single 18650 or PiSugar 2 (no-solder option)
- **4 side action buttons** — volume, screenshot, power
- **Full browser** — Chromium runs Google, YouTube, Reddit, everything
- **3D printed shell** — two-piece design, hand off the specs to any printer
- **~$80–115 to build** — about 1/3 the cost of the standard model

---

## Pocket vs Standard

| | CyberDeck Pocket | CyberDeck Standard |
|---|---|---|
| Size | 160 × 85 × 25mm | 220 × 140 × 35mm |
| SBC | Raspberry Pi Zero 2 W | Raspberry Pi 4 or 5 |
| Screens | 1× 3.5" (SPI) | 2× 5" (HDMI) |
| Keyboard | Built-in thumb keyboard | External 60% mechanical |
| Battery | 1× 18650 (~4–6 hrs) | 3× 18650 (~6–8 hrs) |
| Est. cost | ~$80–115 | ~$290–340 |
| Pocketable | ✅ Yes | ❌ No |
| Software | Same | Same |

---

## Quick Start

Software setup is identical to the main model:

```bash
git clone https://github.com/youruser/cyberdeck.git
cd cyberdeck/software
sudo bash setup.sh
```

The setup script works on Pi Zero 2 W running Raspberry Pi OS Bookworm (32-bit Lite recommended for Zero).

### Pi Zero 2 W vs CM4

- **Pi Zero 2 W** ($15) — recommended. Smallest size, lowest power draw, fits the PSP shell. Quad-core 1GHz, 512MB RAM. Great for browsing, terminal work, Python, SSH.
- **Raspberry Pi CM4** ($35+) — more RAM (1–8GB), faster CPU, but needs a carrier board. Use if you need heavier workloads. Enclosure would be ~170 × 90 × 28mm.

---

## Documentation

| Guide | Description |
|-------|-------------|
| [Assembly Guide](ASSEMBLY.md) | Step-by-step physical build |
| [Bill of Materials](docs/bill-of-materials.md) | Parts list (~$80–115) |
| [Wiring Diagram](docs/wiring-diagram.md) | GPIO pinout: screen, keyboard, buttons |
| [3D Printing Specs](docs/3d-printing.md) | Specs to send your printer contact |
| [3D Models](3d-models/README.md) | STL file info |

---

## Photos

> 📸 Build yours and submit a PR with photos!

---

## License

MIT — see [LICENSE](../LICENSE)
