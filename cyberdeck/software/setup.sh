#!/usr/bin/env bash
set -euo pipefail

# ============================================================
#  CyberDeck Setup Script
#  Raspberry Pi OS Bookworm (64-bit)
# ============================================================

GREEN='\033[0;32m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${CYAN}[CYBERDECK]${NC} $1"; }
ok()   { echo -e "${GREEN}[  OK  ]${NC} $1"; }
err()  { echo -e "${RED}[ FAIL ]${NC} $1"; exit 1; }

echo ""
echo -e "${GREEN}"
echo "  ██████╗██╗   ██╗██████╗ ███████╗██████╗ ██████╗ ███████╗ ██████╗██╗  ██╗"
echo "  ██╔════╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗██╔══██╗██╔════╝██╔════╝██║ ██╔╝"
echo "  ██║      ╚████╔╝ ██████╔╝█████╗  ██████╔╝██║  ██║█████╗  ██║     █████╔╝ "
echo "  ██║       ╚██╔╝  ██╔══██╗██╔══╝  ██╔══██╗██║  ██║██╔══╝  ██║     ██╔═██╗ "
echo "  ╚██████╗   ██║   ██████╔╝███████╗██║  ██║██████╔╝███████╗╚██████╗██║  ██╗"
echo "   ╚═════╝   ╚═╝   ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═════╝ ╚══════╝ ╚═════╝╚═╝  ╚═╝"
echo -e "${NC}"
echo "  CyberDeck Setup — Raspberry Pi OS Bookworm"
echo "  ─────────────────────────────────────────"
echo ""

[[ $EUID -ne 0 ]] && err "Run as root: sudo ./setup.sh"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTALL_DIR="/opt/cyberdeck"

# ── 1. System update & packages ──────────────────────────────
log "Updating package list..."
apt-get update -qq

log "Installing system packages..."
apt-get install -y -qq \
    python3-pip python3-venv python3-smbus \
    i2c-tools git curl \
    chromium-browser \
    lxterminal pcmanfm mousepad \
    network-manager \
    xdotool scrot \
    xinput \
    libgpiod2 python3-libgpiod
ok "Packages installed"

# ── 2. Enable I2C ────────────────────────────────────────────
log "Enabling I2C interface..."
raspi-config nonint do_i2c 0
ok "I2C enabled"

# ── 3. Create install directory ──────────────────────────────
log "Creating /opt/cyberdeck..."
mkdir -p "$INSTALL_DIR"
cp -r "$SCRIPT_DIR"/* "$INSTALL_DIR/"
ok "Files copied to $INSTALL_DIR"

# ── 4. Python virtual environment ────────────────────────────
log "Creating Python virtual environment..."
python3 -m venv "$INSTALL_DIR/venv"
"$INSTALL_DIR/venv/bin/pip" install --upgrade pip -q
"$INSTALL_DIR/venv/bin/pip" install \
    rich psutil pyyaml flask smbus2 RPi.GPIO -q
ok "Python environment ready"

# ── 5. Create screenshots directory ──────────────────────────
SUDO_USER="${SUDO_USER:-pi}"
HOME_DIR="/home/$SUDO_USER"
mkdir -p "$HOME_DIR/screenshots"
chown "$SUDO_USER:$SUDO_USER" "$HOME_DIR/screenshots"

# ── 6. Systemd services ──────────────────────────────────────
log "Installing systemd services..."
cp "$SCRIPT_DIR/gpio/cyberdeck-gpio.service" /etc/systemd/system/
cp "$SCRIPT_DIR/battery/cyberdeck-battery.service" /etc/systemd/system/

# Set correct user in service files
sed -i "s/User=pi/User=$SUDO_USER/g" /etc/systemd/system/cyberdeck-gpio.service
sed -i "s/User=pi/User=$SUDO_USER/g" /etc/systemd/system/cyberdeck-battery.service

systemctl daemon-reload
systemctl enable cyberdeck-gpio.service
systemctl enable cyberdeck-battery.service
ok "Services enabled"

# ── 7. Display setup ─────────────────────────────────────────
log "Adding display configuration..."
CONFIG_FILE="/boot/config.txt"
[[ -f /boot/firmware/config.txt ]] && CONFIG_FILE="/boot/firmware/config.txt"

if ! grep -q "CyberDeck dual display" "$CONFIG_FILE"; then
    echo "" >> "$CONFIG_FILE"
    cat "$SCRIPT_DIR/display/boot_config_additions.txt" >> "$CONFIG_FILE"
    ok "Display config added to $CONFIG_FILE"
else
    ok "Display config already present, skipping"
fi

chmod +x "$INSTALL_DIR/display/setup_displays.sh"

# ── 8. Auto-start launcher ───────────────────────────────────
log "Setting up auto-start launcher..."
PROFILE_SCRIPT="/etc/profile.d/cyberdeck-launcher.sh"
cat > "$PROFILE_SCRIPT" << 'PROFILE'
# CyberDeck launcher — starts TUI on interactive login
if [[ -z "$DISPLAY" ]] && [[ "$(tty)" == "/dev/tty1" ]]; then
    /opt/cyberdeck/venv/bin/python3 /opt/cyberdeck/launcher/launcher.py
fi
PROFILE
ok "Launcher auto-start configured for TTY1"

# ── 9. Web dashboard service ─────────────────────────────────
cat > /etc/systemd/system/cyberdeck-dashboard.service << SVCEOF
[Unit]
Description=CyberDeck Web Dashboard
After=network.target

[Service]
Type=simple
User=$SUDO_USER
WorkingDirectory=$INSTALL_DIR/dashboard
ExecStart=$INSTALL_DIR/venv/bin/python3 $INSTALL_DIR/dashboard/app.py
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
SVCEOF

systemctl daemon-reload
systemctl enable cyberdeck-dashboard.service
ok "Dashboard service enabled"

# ── Done ─────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   CyberDeck setup complete!          ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
echo ""
echo "  Next steps:"
echo "  1. Run: sudo ./software/display/setup_displays.sh"
echo "  2. Reboot: sudo reboot"
echo "  3. Login to TTY1 — launcher starts automatically"
echo "  4. Web dashboard: http://$(hostname -I | awk '{print $1}'):5000"
echo ""
