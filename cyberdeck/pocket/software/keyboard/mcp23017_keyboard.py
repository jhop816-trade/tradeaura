#!/usr/bin/env python3
"""
CyberDeck Pocket — MCP23017 Keyboard Matrix Driver

Reads a 4×11 key matrix wired through an MCP23017 I2C GPIO expander
and emits keystrokes to the Linux input subsystem via uinput.

Wiring:
  MCP23017 GPA0–GPA3  → Keyboard rows (4)
  MCP23017 GPA4–GPA7, GPB0–GPB2  → Keyboard columns (11)
  MCP23017 I2C address: 0x20 (A0/A1/A2 all to GND)
"""

import logging
import os
import sys
import time
from pathlib import Path

try:
    import smbus2
    import yaml
except ImportError:
    print("Missing deps. Run: pip install smbus2 pyyaml")
    sys.exit(1)

try:
    import uinput
    UINPUT_AVAILABLE = True
except ImportError:
    UINPUT_AVAILABLE = False

LOG_FILE = "/var/log/cyberdeck-keyboard.log"
CONFIG_PATH = Path(__file__).parent / "key_mapping.yaml"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [KBD] %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE, mode="a"),
        logging.StreamHandler(),
    ],
)
log = logging.getLogger(__name__)

# MCP23017 registers
MCP_IODIRA = 0x00   # I/O direction register A
MCP_IODIRB = 0x01   # I/O direction register B
MCP_GPPUA  = 0x0C   # Pull-up resistor register A
MCP_GPPUB  = 0x0D   # Pull-up resistor register B
MCP_GPIOA  = 0x12   # GPIO register A
MCP_GPIOB  = 0x13   # GPIO register B
MCP_OLATA  = 0x14   # Output latch register A

MCP_ADDR = 0x20     # I2C address with A0/A1/A2 → GND

# 4 rows × 11 columns
ROWS = 4
COLS = 11


def load_keymap() -> list[list[str]]:
    if CONFIG_PATH.exists():
        with open(CONFIG_PATH) as f:
            data = yaml.safe_load(f)
            return data.get("keymap", [])
    # Default QWERTY layout
    return [
        ["1","2","3","4","5","6","7","8","9","0","-"],
        ["q","w","e","r","t","y","u","i","o","p","BACKSPACE"],
        ["a","s","d","f","g","h","j","k","l",";","ENTER"],
        ["SHIFT","z","x","c","v","b","n","m",",",".","SPACE"],
    ]


class MCP23017:
    def __init__(self, bus: smbus2.SMBus, addr: int = MCP_ADDR) -> None:
        self.bus = bus
        self.addr = addr
        self._setup()

    def _setup(self) -> None:
        # GPA0–GPA3 (rows) = outputs, GPA4–GPA7 (col 0–3) = inputs
        # GPB0–GPB2 (col 7–10) = inputs, GPB3–GPB7 = unused inputs
        self.bus.write_byte_data(self.addr, MCP_IODIRA, 0xF0)  # GPA0-3 out, GPA4-7 in
        self.bus.write_byte_data(self.addr, MCP_IODIRB, 0xFF)  # all GPB inputs
        # Enable pull-ups on input pins
        self.bus.write_byte_data(self.addr, MCP_GPPUA, 0xF0)
        self.bus.write_byte_data(self.addr, MCP_GPPUB, 0x7F)
        log.info("MCP23017 initialized at 0x%02X", self.addr)

    def scan(self) -> list[list[bool]]:
        """Scan the key matrix. Returns ROWS×COLS bool grid (True = pressed)."""
        pressed = [[False] * COLS for _ in range(ROWS)]

        for row in range(ROWS):
            # Pull this row low, keep others high
            row_mask = (~(1 << row)) & 0x0F
            self.bus.write_byte_data(self.addr, MCP_OLATA, row_mask)
            time.sleep(0.001)  # settle time

            gpa = self.bus.read_byte_data(self.addr, MCP_GPIOA)
            gpb = self.bus.read_byte_data(self.addr, MCP_GPIOB)

            # Columns 0–3 on GPA bits 4–7 (active low with pull-up)
            for col in range(4):
                pressed[row][col] = not bool(gpa & (1 << (col + 4)))

            # Columns 4–10 on GPB bits 0–6
            for col in range(7):
                pressed[row][col + 4] = not bool(gpb & (1 << col))

        # Restore all rows high
        self.bus.write_byte_data(self.addr, MCP_OLATA, 0x0F)
        return pressed


class KeyboardDriver:
    def __init__(self) -> None:
        self.keymap = load_keymap()
        try:
            self.bus = smbus2.SMBus(1)
            self.mcp = MCP23017(self.bus)
        except Exception as exc:
            log.error("Could not init MCP23017: %s", exc)
            log.error("Is I2C enabled? Run: sudo raspi-config → Interface → I2C")
            sys.exit(1)

        self.prev_state = [[False] * COLS for _ in range(ROWS)]
        self.shift_held = False

        if UINPUT_AVAILABLE:
            self._setup_uinput()
        else:
            log.warning("python-uinput not available — printing keypresses to stdout only")
            log.warning("Install: pip install python-uinput (requires root)")

    def _setup_uinput(self) -> None:
        import uinput
        keys = [getattr(uinput, f"KEY_{k}", None)
                for row in self.keymap for k in row if k]
        keys = [k for k in keys if k is not None]
        keys += [uinput.KEY_SPACE, uinput.KEY_ENTER, uinput.KEY_BACKSPACE,
                 uinput.KEY_LEFTSHIFT, uinput.KEY_CAPSLOCK]
        self.device = uinput.Device(set(keys), name="cyberdeck-keyboard")
        log.info("uinput device created: cyberdeck-keyboard")

    def _emit_key(self, key_name: str, pressed: bool) -> None:
        if not UINPUT_AVAILABLE:
            if pressed:
                print(f"KEY: {key_name}")
            return

        import uinput
        key_map = {
            "SPACE": uinput.KEY_SPACE,
            "ENTER": uinput.KEY_ENTER,
            "BACKSPACE": uinput.KEY_BACKSPACE,
            "SHIFT": uinput.KEY_LEFTSHIFT,
            "TAB": uinput.KEY_TAB,
        }

        if key_name in key_map:
            uinput_key = key_map[key_name]
        else:
            attr = f"KEY_{key_name.upper()}"
            uinput_key = getattr(uinput, attr, None)
            if uinput_key is None:
                log.warning("Unknown key: %s", key_name)
                return

        self.device.emit(uinput_key, 1 if pressed else 0)

    def run(self) -> None:
        log.info("Keyboard matrix scanning started. Ctrl-C to stop.")
        try:
            while True:
                state = self.mcp.scan()

                for row in range(ROWS):
                    for col in range(COLS):
                        was = self.prev_state[row][col]
                        now = state[row][col]

                        if now != was:
                            key = self.keymap[row][col] if row < len(self.keymap) \
                                  and col < len(self.keymap[row]) else "?"
                            self._emit_key(key, now)

                            if key == "SHIFT":
                                self.shift_held = now

                self.prev_state = state
                time.sleep(0.01)  # 100Hz scan rate

        except KeyboardInterrupt:
            log.info("Keyboard driver stopped")
        finally:
            self.bus.close()


def main() -> None:
    log.info("CyberDeck Pocket keyboard driver starting (PID %d)", os.getpid())
    driver = KeyboardDriver()
    driver.run()


if __name__ == "__main__":
    main()
