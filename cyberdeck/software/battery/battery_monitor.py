#!/usr/bin/env python3
"""CyberDeck battery monitor — supports Waveshare UPS HAT and PiSugar 3."""

import logging
import struct
import sys
import time
from pathlib import Path

BATTERY_FILE = Path("/tmp/battery.txt")
ALERT_FILE = Path("/tmp/cyberdeck_alert.txt")
LOG_FILE = "/var/log/cyberdeck-battery.log"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [BAT] %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE, mode="a"),
        logging.StreamHandler(),
    ],
)
log = logging.getLogger(__name__)


def detect_hat():
    """Try to detect which UPS HAT is connected."""
    try:
        import smbus2
        bus = smbus2.SMBus(1)

        # Try Waveshare UPS HAT B (MAX17040 fuel gauge at 0x36)
        try:
            bus.read_byte_data(0x36, 0x02)
            log.info("Detected: Waveshare UPS HAT (MAX17040)")
            return ("waveshare", bus)
        except Exception:
            pass

        # Try PiSugar 3 (at 0x75)
        try:
            bus.read_byte_data(0x75, 0x2A)
            log.info("Detected: PiSugar 3")
            return ("pisugar3", bus)
        except Exception:
            pass

        bus.close()
    except ImportError:
        log.warning("smbus2 not installed")
    except Exception as e:
        log.warning(f"I2C error: {e}")

    log.warning("No battery HAT detected — writing N/A")
    return (None, None)


def read_waveshare(bus):
    """Read battery % from MAX17040 (Waveshare UPS HAT B)."""
    try:
        raw = bus.read_i2c_block_data(0x36, 0x04, 2)
        percent = (raw[0] << 8 | raw[1]) / 256.0
        return min(100.0, max(0.0, percent))
    except Exception as e:
        log.error(f"Waveshare read error: {e}")
        return None


def read_pisugar3(bus):
    """Read battery % from PiSugar 3."""
    try:
        raw = bus.read_byte_data(0x75, 0x2A)
        return float(raw & 0x7F)
    except Exception as e:
        log.error(f"PiSugar3 read error: {e}")
        return None


def check_low_battery(percent):
    if percent is None:
        return
    if percent <= 5:
        ALERT_FILE.write_text("CRITICAL")
        log.critical(f"Battery CRITICAL at {percent:.0f}% — initiating shutdown")
        import subprocess
        subprocess.run(["sudo", "shutdown", "-h", "now"], check=False)
    elif percent <= 20:
        ALERT_FILE.write_text(f"LOW:{percent:.0f}")
        log.warning(f"Battery LOW at {percent:.0f}%")
    else:
        ALERT_FILE.unlink(missing_ok=True)


def main():
    log.info("CyberDeck battery monitor starting...")
    hat_type, bus = detect_hat()

    while True:
        percent = None

        if hat_type == "waveshare" and bus:
            percent = read_waveshare(bus)
        elif hat_type == "pisugar3" and bus:
            percent = read_pisugar3(bus)

        if percent is not None:
            display = f"{percent:.0f}%"
            log.info(f"Battery: {display}")
            check_low_battery(percent)
        else:
            display = "N/A"

        BATTERY_FILE.write_text(display)
        time.sleep(30)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        log.info("Battery monitor stopped")
