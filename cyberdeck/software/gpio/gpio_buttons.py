#!/usr/bin/env python3
"""CyberDeck GPIO button daemon."""

import logging
import os
import subprocess
import sys
import time
from pathlib import Path

try:
    import yaml
    import RPi.GPIO as GPIO
except ImportError:
    print("Missing: pip install RPi.GPIO pyyaml")
    sys.exit(1)

LOG_FILE = "/var/log/cyberdeck-gpio.log"
CONFIG_PATH = Path(__file__).parent.parent / "launcher" / "config.yaml"
BRIGHTNESS_FILE = Path("/tmp/cyberdeck_brightness.txt")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [GPIO] %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE, mode="a"),
        logging.StreamHandler(),
    ],
)
log = logging.getLogger(__name__)


def load_config():
    if CONFIG_PATH.exists():
        with open(CONFIG_PATH) as f:
            return yaml.safe_load(f)
    return {}


def run_cmd(cmd, timeout=5):
    try:
        subprocess.run(cmd, shell=True, timeout=timeout, check=False)
    except Exception as e:
        log.error(f"Command failed: {cmd} — {e}")


def get_brightness():
    try:
        return float(BRIGHTNESS_FILE.read_text().strip())
    except Exception:
        return 1.0


def set_brightness(val):
    val = max(0.2, min(1.0, val))
    BRIGHTNESS_FILE.write_text(str(val))
    run_cmd(f"xrandr --output HDMI-1 --brightness {val:.1f}")
    run_cmd(f"xrandr --output HDMI-2 --brightness {val:.1f}")
    log.info(f"Brightness set to {val:.1f}")


class ButtonHandler:
    def __init__(self, config):
        self.config = config
        self.button_map = config.get("gpio_buttons", {})
        self.press_times = {}

        GPIO.setmode(GPIO.BCM)
        GPIO.setwarnings(False)

        for pin in self.button_map:
            GPIO.setup(int(pin), GPIO.IN, pull_up_down=GPIO.PUD_UP)
            GPIO.add_event_detect(
                int(pin),
                GPIO.BOTH,
                callback=self._callback,
                bouncetime=50,
            )
            log.info(f"GPIO {pin} configured for {self.button_map[pin]['action']}")

    def _callback(self, channel):
        pin = str(channel)
        info = self.button_map.get(pin, self.button_map.get(int(pin)))
        if not info:
            return

        state = GPIO.input(channel)
        action = info.get("action", "")

        if state == GPIO.LOW:  # pressed
            self.press_times[channel] = time.time()
        else:  # released
            press_duration = time.time() - self.press_times.get(channel, time.time())
            self._handle_action(action, press_duration)

    def _handle_action(self, action, duration):
        log.info(f"Action: {action} (held {duration:.2f}s)")

        if action == "brightness_up":
            set_brightness(get_brightness() + 0.1)

        elif action == "brightness_down":
            set_brightness(get_brightness() - 0.1)

        elif action == "volume_toggle":
            run_cmd("amixer set Master toggle")

        elif action == "screenshot":
            ts = time.strftime("%Y%m%d_%H%M%S")
            path = Path(os.path.expanduser("~/screenshots")) / f"{ts}.png"
            run_cmd(f"DISPLAY=:0 scrot '{path}'")
            log.info(f"Screenshot saved: {path}")

        elif action == "app_launch":
            Path("/tmp/cyberdeck_signal.txt").write_text("launch")

        elif action == "power":
            if duration >= 2.0:
                log.info("Long press detected — shutting down")
                run_cmd("sudo shutdown -h now")
            else:
                run_cmd("DISPLAY=:0 xset dpms force off")  # blank screens


def main():
    log.info("CyberDeck GPIO daemon starting...")
    config = load_config()
    handler = ButtonHandler(config)

    try:
        log.info("Listening for button presses. Press Ctrl+C to stop.")
        while True:
            time.sleep(0.1)
    except KeyboardInterrupt:
        log.info("Shutting down GPIO daemon")
    finally:
        GPIO.cleanup()


if __name__ == "__main__":
    main()
