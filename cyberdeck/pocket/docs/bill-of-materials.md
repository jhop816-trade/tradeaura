# Bill of Materials — CyberDeck Pocket

Total estimated cost: **~$97–115** (PiSugar 2 option) or **~$80** (DIY 18650 option)

About 1/3 the cost of the standard CyberDeck. Prices are approximate as of 2025.

---

## Parts List

| Part | Qty | Notes | Est. Cost |
|------|-----|-------|-----------|
| Raspberry Pi Zero 2 W | 1 | Quad-core 1GHz, 512MB RAM, WiFi + BT built in | $15 |
| 2×20 GPIO header (40-pin) | 1 | Needs to be soldered onto Pi Zero 2 W | $2 |
| 3.5" SPI TFT Display (ILI9486, 480×320) | 1 | Plugs directly onto GPIO header | $12 |
| PiSugar 2 | 1 | **Recommended** — no-solder battery for Pi Zero, 1200mAh, I2C reporting | $25 |
| — OR — | | | |
| 18650 Li-ion cell (3000mAh) | 1 | DIY power option — requires soldering | $5 |
| TP4056 charging module (with protection) | 1 | Li-ion charger | $2 |
| MT3608 boost converter | 1 | Steps 3.7V up to 5V for the Pi | $2 |
| 6×6mm tactile switches | 44 | For custom thumb keyboard matrix | $5 |
| MCP23017 I2C GPIO expander | 1 | Adds 16 GPIO pins for key matrix | $3 |
| — OR instead of key matrix — | | | |
| USB keyboard module (BB-style HID) | 1 | Plug-and-play alternative to matrix, ~$12 on AliExpress | $12 |
| 6mm tactile side buttons | 4 | Volume, screenshot, power | $2 |
| 3.5mm audio jack breakout | 1 | Optional — for headphones | $3 |
| Micro-USB OTG adapter | 1 | For USB keyboard option | $2 |
| 28AWG wire (multicolor, 1m) | 1 | For keyboard matrix and button wiring | $4 |
| Heat shrink tubing | 1 | Assorted sizes | $3 |
| M2 screws + standoffs (set) | 1 | For Pi mounting and enclosure | $5 |
| microSD card (64GB, A2) | 1 | Smaller is fine for Pi Zero | $10 |
| PETG filament (~200g) | 1 | For 3D printed shell | $5 |
| Small heatsink (15×15mm) | 1 | For Pi Zero 2 W SoC chip | $2 |
| **Total (with PiSugar 2 + USB keyboard)** | | | **~$97–115** |
| **Total (DIY 18650 + key matrix)** | | | **~$80–93** |

---

## Where to Buy

| Store | Best for |
|-------|---------|
| [Adafruit](https://www.adafruit.com) / [PiShop.us](https://www.pishop.us) | Pi Zero 2 W, reliable US stock |
| [PiSugar shop](https://pisugar.com) | PiSugar 2 directly from the maker |
| [AliExpress](https://www.aliexpress.com) | Tactile switches, MCP23017, USB keyboard modules (longer shipping) |
| [Amazon](https://www.amazon.com) | microSD, heatsinks, wire, screws — fast delivery |

---

## Notes

- **Pi Zero 2 W availability:** Can sell out fast — check Adafruit, PiShop, and Vilros. Official MSRP is $15.
- **PiSugar 2 vs DIY:** PiSugar 2 is worth the extra money — no soldering, sits flush under the Pi, and the software auto-detects it. The DIY 18650 route saves ~$20 but adds complexity.
- **Keyboard:** Start with a USB keyboard module if you're new to electronics. You can always upgrade to a custom key matrix later.
- **Screen:** The ILI9486-based 3.5" SPI screens are widely available on Amazon and AliExpress for ~$10–15. Make sure it's SPI (not DSI or HDMI) for the Pi Zero 2 W.
