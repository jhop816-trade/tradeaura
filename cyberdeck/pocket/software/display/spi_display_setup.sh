#!/usr/bin/env bash
set -euo pipefail

# ============================================================
#  CyberDeck Pocket — SPI Display Setup (ILI9486 / 3.5")
#  Configures the 3.5" SPI TFT display on Pi Zero 2 W
# ============================================================

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${CYAN}[DISPLAY]${NC} $1"; }
ok()   { echo -e "${GREEN}[  OK  ]${NC} $1"; }
warn() { echo -e "${YELLOW}[ WARN ]${NC} $1"; }

AUTO_MODE=false
[[ "${1:-}" == "--auto" ]] && AUTO_MODE=true

echo ""
log "CyberDeck Pocket — SPI Display Setup"
echo "──────────────────────────────────────"

# ── Detect boot config location ─────────────────────────────
if [[ -f /boot/firmware/config.txt ]]; then
    BOOT_CONFIG="/boot/firmware/config.txt"
else
    BOOT_CONFIG="/boot/config.txt"
fi

# ── Choose display type ──────────────────────────────────────
if [[ "$AUTO_MODE" == false ]]; then
    echo ""
    echo "  Select your 3.5\" SPI display model:"
    echo "  [1] Waveshare 3.5\" Type A  (most common, ILI9486)"
    echo "  [2] Waveshare 3.5\" Type B  (ILI9486)"
    echo "  [3] PiScreen 3.5\""
    echo "  [4] Generic SPI (rpi-display)"
    echo ""
    read -rp "  Choice [1]: " CHOICE
    CHOICE="${CHOICE:-1}"
else
    CHOICE="1"
    log "Auto mode — defaulting to Waveshare 3.5\" Type A"
fi

case "$CHOICE" in
    1) OVERLAY="waveshare35a" ; DISPLAY_NAME="Waveshare 3.5 Type A" ;;
    2) OVERLAY="waveshare35b" ; DISPLAY_NAME="Waveshare 3.5 Type B" ;;
    3) OVERLAY="piscreen"     ; DISPLAY_NAME="PiScreen 3.5" ;;
    4) OVERLAY="rpi-display"  ; DISPLAY_NAME="Generic SPI" ;;
    *) OVERLAY="waveshare35a" ; DISPLAY_NAME="Waveshare 3.5 Type A" ;;
esac

# ── Choose rotation ──────────────────────────────────────────
if [[ "$AUTO_MODE" == false ]]; then
    echo ""
    echo "  Screen rotation:"
    echo "  [0] Landscape (default)"
    echo "  [1] Portrait (screen top on left)"
    echo "  [2] Landscape flipped"
    echo "  [3] Portrait (screen top on right)"
    echo ""
    read -rp "  Rotation [0]: " ROTATION
    ROTATION="${ROTATION:-0}"
else
    ROTATION="0"
fi

# ── Apply configuration ──────────────────────────────────────
log "Applying ${DISPLAY_NAME} overlay..."

# Remove existing display overlay lines
sed -i '/^dtoverlay=waveshare/d' "${BOOT_CONFIG}"
sed -i '/^dtoverlay=piscreen/d' "${BOOT_CONFIG}"
sed -i '/^dtoverlay=rpi-display/d' "${BOOT_CONFIG}"
sed -i '/^display_rotate=/d' "${BOOT_CONFIG}"

# Add new config
echo "" >> "${BOOT_CONFIG}"
echo "# CyberDeck Pocket SPI display" >> "${BOOT_CONFIG}"
echo "dtoverlay=${OVERLAY}" >> "${BOOT_CONFIG}"
echo "display_rotate=${ROTATION}" >> "${BOOT_CONFIG}"
ok "Display overlay set: ${OVERLAY}, rotation: ${ROTATION}"

# ── Install fbcp-ili9341 for smooth framebuffer copy ────────
log "Checking for fbcp (framebuffer copy daemon)..."
if ! command -v fbcp &>/dev/null; then
    log "Installing fbcp for smooth display output..."
    apt-get install -y -qq cmake 2>/dev/null

    TMPDIR=$(mktemp -d)
    git clone --depth=1 https://github.com/juj/fbcp-ili9341.git "${TMPDIR}" 2>/dev/null || {
        warn "Could not clone fbcp — skipping. Display will still work via dtoverlay."
        rm -rf "${TMPDIR}"
    }

    if [[ -d "${TMPDIR}" ]]; then
        mkdir -p "${TMPDIR}/build"
        cd "${TMPDIR}/build"
        cmake -DWAVESHARE35A=ON -DSPI_BUS_CLOCK_DIVISOR=6 -DBACKLIGHT_CONTROL=ON .. 2>/dev/null
        make -j2 2>/dev/null
        cp fbcp /usr/local/bin/fbcp
        cd /
        rm -rf "${TMPDIR}"

        # Create systemd service for fbcp
        cat > /etc/systemd/system/cyberdeck-fbcp.service << 'SVC'
[Unit]
Description=CyberDeck framebuffer copy (SPI display)
After=multi-user.target

[Service]
Type=simple
ExecStart=/usr/local/bin/fbcp
Restart=on-failure

[Install]
WantedBy=multi-user.target
SVC
        systemctl daemon-reload
        systemctl enable cyberdeck-fbcp.service
        ok "fbcp installed and enabled as service"
    fi
else
    ok "fbcp already installed"
fi

# ── Touchscreen input (if screen has touch) ─────────────────
log "Setting up touchscreen input..."
apt-get install -y -qq evdev 2>/dev/null || true

XORG_CONF_DIR="/etc/X11/xorg.conf.d"
mkdir -p "${XORG_CONF_DIR}"
cat > "${XORG_CONF_DIR}/99-waveshare-touch.conf" << 'XORG'
Section "InputClass"
    Identifier "Touchscreen"
    MatchIsTouchscreen "on"
    Option "TransformationMatrix" "1 0 0 0 1 0 0 0 1"
EndSection
XORG
ok "Touchscreen input configured"

# ── Done ─────────────────────────────────────────────────────
echo ""
ok "SPI display setup complete!"
echo ""
echo "  Reboot to apply: sudo reboot"
echo ""
echo "  After reboot, if screen is blank:"
echo "  - Check dtoverlay line in ${BOOT_CONFIG}"
echo "  - Try a different overlay (waveshare35b, rpi-display)"
echo "  - Run: sudo systemctl status cyberdeck-fbcp"
echo ""
