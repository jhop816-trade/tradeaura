# CyberDeck

> A fully open-source, hand-built portable computer powered by Raspberry Pi

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

Built for makers who want a real portable Linux box — not a toy, not an emulation station, but a full Linux machine you can carry in a bag and use anywhere.

---

## Features

- **Dual HDMI screens** — two 3.5" displays, one landscape, one portrait
- **Mechanical keyboard** — 65% or 60% layout, USB, low-profile preferred
- **UPS battery** — Waveshare UPS HAT with 2x 18650 cells, ~4-6 hours runtime
- **GPIO buttons** — 6 tactile buttons: brightness, volume, screenshot, launcher, shutdown
- **Python TUI launcher** — full-screen cyberpunk terminal launcher using `rich`
- **Web dashboard** — Flask app on port 5000, accessible from any device on the network
- **3D-printed enclosure** — PETG shell, ~250mm x 185mm x 48mm footprint
- **Fully open source** — MIT licensed, every line of code and every doc included

---

## Hardware Overview

| Component | Recommended | Notes |
|-----------|-------------|-------|
| Single-board computer | Raspberry Pi 4 Model B (4GB/8GB) | Pi 5 also works |
| Displays | 2x 3.5" HDMI (800x480) | Waveshare or generic |
| Keyboard | 65% or 60% mechanical | Low-profile preferred |
| Battery HAT | Waveshare UPS HAT (C) | Supports 2x 18650 cells |
| Battery cells | 2x 18650 Li-ion (3000mAh) | Samsung 30Q recommended |
| Storage | MicroSD 32GB+ Class 10/A1 | Or USB SSD via USB 3.0 |
| Enclosure | 3D-printed PETG | See `3d-models/README.md` |
| GPIO buttons | 6x 6mm tactile switches | See `docs/wiring-diagram.md` |

---

## Quick Start

```bash
# 1. Flash Raspberry Pi OS Bookworm (64-bit) to SD card
# 2. Boot, connect to WiFi, open a terminal

git clone https://github.com/youruser/cyberdeck.git
cd cyberdeck/software
sudo bash setup.sh

# 3. Reboot
sudo reboot
```

Setup installs all dependencies, configures I2C/SPI, creates a Python virtualenv at `/opt/cyberdeck/venv`, and enables the GPIO and battery monitor systemd services. After reboot the TUI launcher starts automatically.

---

## Project Structure

```
cyberdeck/
├── README.md
├── LICENSE
├── ASSEMBLY.md
├── docs/
│   ├── bill-of-materials.md
│   ├── wiring-diagram.md
│   ├── display-setup.md
│   └── 3d-printing.md
├── software/
│   ├── setup.sh
│   ├── launcher/
│   │   ├── launcher.py
│   │   ├── requirements.txt
│   │   └── config.yaml
│   ├── gpio/
│   │   ├── gpio_buttons.py
│   │   └── cyberdeck-gpio.service
│   ├── display/
│   │   ├── setup_displays.sh
│   │   └── boot_config_additions.txt
│   ├── battery/
│   │   ├── battery_monitor.py
│   │   └── cyberdeck-battery.service
│   └── dashboard/
│       ├── app.py
│       ├── templates/
│       │   └── index.html
│       └── static/
│           └── style.css
└── 3d-models/
    └── README.md
```

---

## Hardware

See [docs/bill-of-materials.md](docs/bill-of-materials.md) for the full parts list with prices and sources (~$210-$310 total).

See [docs/wiring-diagram.md](docs/wiring-diagram.md) for GPIO pinout and button wiring.

---

## Software

| Component | Location | Description |
|-----------|----------|-------------|
| Setup script | `software/setup.sh` | One-shot installer |
| TUI Launcher | `software/launcher/` | Full-screen app launcher |
| GPIO Daemon | `software/gpio/` | Hardware button handler |
| Battery Monitor | `software/battery/` | I2C UPS HAT monitor |
| Web Dashboard | `software/dashboard/` | Flask dashboard on :5000 |
| Display Setup | `software/display/` | Dual HDMI configuration |

---

## Assembly

See [ASSEMBLY.md](ASSEMBLY.md) for the full step-by-step build guide covering printing, wiring, and software setup.

---

## Contributing

Pull requests welcome. Please open an issue first to discuss major changes.

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-thing`)
3. Commit your changes
4. Push and open a PR

---

## License

MIT — see [LICENSE](LICENSE).
