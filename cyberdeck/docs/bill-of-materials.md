# Bill of Materials

Full parts list for the CyberDeck build. All prices are estimates in USD as of 2025 — check current prices before ordering.

---

## Parts List

| Part | Qty | Notes | Est. Cost |
|------|-----|-------|-----------|
| Raspberry Pi 5 (8GB) | 1 | Recommended. Pi 4 (4GB) also works at ~$55 | $80 |
| 5" HDMI Display 800×480 | 2 | Any small HDMI screen works. 1024×600 versions are also compatible | $25 each |
| Waveshare UPS HAT (B) | 1 | Stacks directly on Pi GPIO header. PiSugar 3 is an alternative | $30 |
| 18650 Li-ion Cell 3000mAh+ | 3 | Samsung 30Q or LG HG2 recommended — avoid no-name cells | $5 each |
| 60% Mechanical Keyboard (USB) | 1 | Any compact USB keyboard works. Wireless is fine too | $45 |
| 12mm Tactile Push Button | 6 | Standard momentary switches. Any "12mm tactile switch" on Amazon works | $1 each |
| Micro HDMI to HDMI Cable | 2 | 30cm length ideal for inside the enclosure. Male micro-HDMI to female HDMI | $8 each |
| Jumper Wires (Female-Female, 20cm) | 1 pack | For GPIO button connections to Pi header | $5 |
| M2.5 Standoff Set | 1 | For mounting Pi in enclosure. Brass M2.5 standoff kit | $8 |
| M3 Screw Set | 1 | For enclosure assembly (lid to body). M3×8mm pan head | $5 |
| USB-C PD 65W Charger | 1 | For charging the UPS HAT. Any 65W USB-C PD charger works | $20 |
| 256GB microSD A2 Rated | 1 | Samsung Pro Endurance or SanDisk Extreme recommended. A2 rating matters for OS performance | $20 |
| PETG Filament 1kg | 1 | For the 3D printed enclosure. PLA+ works but PETG is more durable | $22 |
| Heat Shrink Tubing Assortment | 1 | For insulating button solder joints | $7 |
| **Total estimate** | | Budget build (Pi 4): ~$260. Recommended (Pi 5): **~$290–340** | |

---

## Where to Buy

| Retailer | Good For |
|----------|----------|
| **Adafruit** (adafruit.com) | Pi accessories, HATs, buttons, standoffs — ships fast, reliable |
| **PiShop.us** | Raspberry Pi boards (authorized reseller), good stock |
| **Amazon** | Keyboards, cables, standoffs, heat shrink — Prime shipping |
| **AliExpress** | Budget option for screens, buttons, and standoffs — 2-4 week shipping |
| **Digikey / Mouser** | Buttons, heat shrink, electronic components — good for bulk |
| **Printables.com / local makerspace** | 3D printing — see [3d-printing.md](3d-printing.md) |

---

## Notes

- **18650 cells:** Do not buy unbranded "high capacity" cells from unknown sellers. Samsung 30Q and LG HG2 are well-tested. Buy from a reputable battery retailer (18650batterystore.com, Illumn.com, or Amazon from verified sellers).
- **microSD card:** The A2 (Application Performance Class 2) rating is important — it dramatically improves OS responsiveness on a Pi. A1-rated cards will work but feel sluggish. Buy genuine Samsung or SanDisk, not counterfeits.
- **UPS HAT:** The Waveshare UPS HAT (B) is the recommended choice because the battery_monitor.py script supports it natively. If you use a PiSugar 3 instead, the script also supports it — just a different I2C address.
- **Filament:** You only need filament if you're printing yourself. If you're handing specs to someone with a printer, you don't need to buy any.
