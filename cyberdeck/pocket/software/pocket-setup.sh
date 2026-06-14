#!/usr/bin/env bash
set -euo pipefail

# ============================================================
#  CyberDeck Pocket Setup Script
#  Raspberry Pi Zero 2 W — Raspberry Pi OS Bookworm Lite (32-bit)
#  Usage: sudo bash pocket-setup.sh
# ============================================================

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${CYAN}[POCKET]${NC} $1"; }
ok()   { echo -e "${GREEN}[  OK  ]${NC} $1"; }
warn() { echo -e "${YELLOW}[ WARN ]${NC} $1"; }
err()  { echo -e "${RED}[ FAIL ]${NC} $1"; exit 1; }

echo ""
echo -e "${GREEN}"
cat << 'BANNER'
  ██████╗  ██████╗  ██████╗██╗  ██╗███████╗████████╗
  ██╔══██╗██╔═══██╗██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝
  ██████╔╝██║   ██║██║     █████╔╝ █████╗     ██║
  ██╔═══╝ ██║   ██║██║     ██╔═██╗ ██╔══╝     ██║
  ██║     ╚██████╔╝╚██████╗██║  ██╗███████╗   ██║
  ╚═╝      ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝
BANNER
echo -e "${NC}"
echo "  CyberDeck Pocket — Pi Zero 2 W Setup"
echo "  ─────────────────────────────────────"
echo ""

[[ $EUID -ne 0 ]] && err "Run as root: sudo bash pocket-setup.sh"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_SOFTWARE="$(cd "${SCRIPT_DIR}/../../software" && pwd)"
INSTALL_DIR="/opt/cyberdeck"
SUDO_USER="${SUDO_USER:-pi}"
HOME_DIR="/home/${SUDO_USER}"

# ── 1. Run base setup ────────────────────────────────────────
log "Running base CyberDeck setup first..."
if [[ -f "${ROOT_SOFTWARE}/setup.sh" ]]; then
    bash "${ROOT_SOFTWARE}/setup.sh"
    ok "Base setup complete"
else
    warn "Base setup.sh not found at ${ROOT_SOFTWARE} — continuing with pocket-only setup"
fi

# ── 2. Pi Zero 2 W specific packages ────────────────────────
log "Installing Pi Zero 2 W specific packages..."
DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
    python3-spidev python3-pil \
    fbset \
    evtest \
    2>/dev/null
ok "Additional packages installed"

# ── 3. Enable SPI and I2C ────────────────────────────────────
log "Enabling SPI interface..."
raspi-config nonint do_spi 0
ok "SPI enabled"

log "Enabling I2C interface..."
raspi-config nonint do_i2c 0
ok "I2C enabled"

# ── 4. Boot config for Pi Zero 2 W ──────────────────────────
log "Applying pocket boot configuration..."
if [[ -f /boot/firmware/config.txt ]]; then
    BOOT_CONFIG="/boot/firmware/config.txt"
else
    BOOT_CONFIG="/boot/config.txt"
fi

if ! grep -q "CyberDeck Pocket" "${BOOT_CONFIG}" 2>/dev/null; then
    echo "" >> "${BOOT_CONFIG}"
    cat "${SCRIPT_DIR}/display/boot_config_pocket.txt" >> "${BOOT_CONFIG}"
    ok "Pocket boot config applied to ${BOOT_CONFIG}"
else
    ok "Pocket boot config already present — skipping"
fi

# ── 5. Enable USB OTG (for USB keyboard option) ──────────────
log "Enabling USB OTG mode..."
if ! grep -q "dtoverlay=dwc2" "${BOOT_CONFIG}"; then
    echo "dtoverlay=dwc2" >> "${BOOT_CONFIG}"
fi

CMDLINE="/boot/cmdline.txt"
[[ -f /boot/firmware/cmdline.txt ]] && CMDLINE="/boot/firmware/cmdline.txt"
if ! grep -q "modules-load=dwc2" "${CMDLINE}" 2>/dev/null; then
    sed -i 's/$/ modules-load=dwc2/' "${CMDLINE}"
fi
ok "USB OTG enabled (for USB keyboard)"

# ── 6. Install SPI display driver ────────────────────────────
log "Installing SPI display driver (ILI9486)..."
chmod +x "${SCRIPT_DIR}/display/spi_display_setup.sh"
bash "${SCRIPT_DIR}/display/spi_display_setup.sh" --auto
ok "SPI display driver installed"

# ── 7. Install keyboard files ────────────────────────────────
log "Installing keyboard driver..."
mkdir -p "${INSTALL_DIR}/keyboard"
cp "${SCRIPT_DIR}/keyboard/mcp23017_keyboard.py" "${INSTALL_DIR}/keyboard/"
cp "${SCRIPT_DIR}/keyboard/key_mapping.yaml" "${INSTALL_DIR}/keyboard/"
cp "${SCRIPT_DIR}/keyboard/cyberdeck-keyboard.service" /etc/systemd/system/

sed -i "s/User=pi/User=${SUDO_USER}/g" /etc/systemd/system/cyberdeck-keyboard.service

systemctl daemon-reload
systemctl enable cyberdeck-keyboard.service
ok "Keyboard driver installed and enabled"

# ── 8. Pocket launcher config ────────────────────────────────
log "Installing pocket launcher config..."
cp "${SCRIPT_DIR}/launcher/config.yaml" "${INSTALL_DIR}/launcher/config.yaml"
ok "Pocket launcher config applied"

# ── 9. GPU memory for Pi Zero ────────────────────────────────
log "Optimizing GPU memory for Pi Zero 2 W..."
if ! grep -q "^gpu_mem=64" "${BOOT_CONFIG}"; then
    # Remove any existing gpu_mem line first
    sed -i '/^gpu_mem=/d' "${BOOT_CONFIG}"
    echo "gpu_mem=64" >> "${BOOT_CONFIG}"
fi
ok "GPU memory set to 64MB (optimal for Pi Zero)"

# ── 10. Swap size (Pi Zero has 512MB RAM) ───────────────────
log "Increasing swap for Pi Zero 2 W..."
if [[ -f /etc/dphys-swapfile ]]; then
    sed -i 's/CONF_SWAPSIZE=.*/CONF_SWAPSIZE=512/' /etc/dphys-swapfile
    dphys-swapfile setup 2>/dev/null || true
    dphys-swapfile swapon 2>/dev/null || true
    ok "Swap set to 512MB"
fi

# ── Done ─────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗"
echo -e "║  CyberDeck Pocket setup complete! 🎮    ║"
echo -e "╚══════════════════════════════════════════╝${NC}"
echo ""
echo "  Next steps:"
echo "  1. Reboot:              sudo reboot"
echo "  2. Screen calibration:  run spi_display_setup.sh after reboot if needed"
echo "  3. Test keyboard:       run 'sudo evtest' to verify key presses"
echo "  4. Web dashboard:       http://$(hostname -I 2>/dev/null | awk '{print $1}' || echo 'cyberdeck-pocket.local'):5000"
echo ""
echo "  If using USB keyboard instead of matrix:"
echo "  Connect via micro-USB OTG adapter — Linux detects it automatically."
echo ""
