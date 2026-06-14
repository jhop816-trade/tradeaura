#!/usr/bin/env bash
set -euo pipefail

GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

log() { echo -e "${CYAN}[DISPLAY]${NC} $1"; }
ok()  { echo -e "${GREEN}[  OK  ]${NC} $1"; }

echo ""
log "CyberDeck Display Setup"
echo "────────────────────────"
echo ""

# Detect connected outputs
OUTPUTS=$(xrandr | grep " connected" | awk '{print $1}')
log "Detected displays: $OUTPUTS"
echo ""

# Layout choice
echo "  Choose display layout:"
echo "  [1] Side by side (both landscape)"
echo "  [2] Side by side, right screen rotated portrait (left)"
echo "  [3] Single display only"
echo ""
read -rp "  Layout [1]: " CHOICE
CHOICE="${CHOICE:-1}"

PRIMARY=$(echo "$OUTPUTS" | head -1)
SECONDARY=$(echo "$OUTPUTS" | tail -1)

CONFIG_DIR="$HOME/.config/cyberdeck"
mkdir -p "$CONFIG_DIR"

case "$CHOICE" in
  1)
    CMD="xrandr --output $PRIMARY --primary --auto --output $SECONDARY --right-of $PRIMARY --auto"
    ;;
  2)
    CMD="xrandr --output $PRIMARY --primary --auto --output $SECONDARY --right-of $PRIMARY --auto --rotate left"
    ;;
  3)
    CMD="xrandr --output $PRIMARY --primary --auto"
    [[ -n "$SECONDARY" ]] && CMD="$CMD --output $SECONDARY --off"
    ;;
  *)
    CMD="xrandr --output $PRIMARY --primary --auto"
    ;;
esac

log "Applying: $CMD"
eval "$CMD"
echo "$CMD" > "$CONFIG_DIR/display.conf"
ok "Display config saved to $CONFIG_DIR/display.conf"

# Add to autostart
AUTOSTART_DIR="$HOME/.config/autostart"
mkdir -p "$AUTOSTART_DIR"
cat > "$AUTOSTART_DIR/cyberdeck-displays.desktop" << DESKTOP
[Desktop Entry]
Type=Application
Name=CyberDeck Display Setup
Exec=$CMD
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
DESKTOP

ok "Display autostart configured"
echo ""
log "Done! Displays configured. Changes take effect immediately."
log "To re-run: bash /opt/cyberdeck/display/setup_displays.sh"
