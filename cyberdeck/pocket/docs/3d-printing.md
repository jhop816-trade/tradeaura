# 3D Printing Specs — CyberDeck Pocket

Send this page to your printer contact. You don't need a printer yourself.

---

## What to Tell Them

> "I need 4 parts printed in PETG, 0.2mm layer height, 3 perimeter walls. Only the keyboard plate needs supports (for the 44 switch holes). Print in black or dark grey if possible — it's a handheld computer shell about the size of a thick smartphone."

Total print time is about 8 hours. Uses roughly 180–200g of filament. They can run it overnight.

---

## Parts to Print

| Part | Qty | Dimensions | Infill | Supports | Est. Print Time |
|------|-----|-----------|--------|----------|----------------|
| Bottom shell | 1 | 160 × 85 × 15mm | 20% | No | ~3.5 hrs |
| Top shell / screen bezel | 1 | 160 × 85 × 12mm | 15% | No | ~2.5 hrs |
| Keyboard plate | 1 | 140 × 38 × 8mm | 30% | Yes (switch holes) | ~1.5 hrs |
| Side button caps | 4 | 8 × 8 × 5mm | 30% | No | ~15 min total |

---

## Print Settings

| Setting | Value |
|---------|-------|
| Material | PETG (preferred) or PLA+ |
| Layer height | 0.2mm |
| Infill | 20% gyroid (30% for keyboard plate) |
| Perimeter walls | 3 |
| Nozzle temp — PETG | 235°C |
| Bed temp — PETG | 70°C |
| Nozzle temp — PLA+ | 215°C |
| Bed temp — PLA+ | 60°C |
| Fan cooling | 50% for PETG / 100% for PLA+ |
| Supports | Keyboard plate only |
| Total filament | ~180–200g |

---

## Design Constraints

Pass these to whoever is designing the STL files:

**Overall shell**
- Assembled outer dimensions: 160mm × 85mm × 25mm (bottom + top together)
- Wall thickness: 2.5mm minimum
- Internal cavity (bottom shell): 155mm × 80mm × 12mm

**Pi Zero 2 W mount**
- Board footprint: 65mm × 30mm
- Mounting holes: M2.5, 58mm × 23mm spacing (check Pi Zero 2 W datasheet)
- microSD slot must be accessible from the bottom edge of the enclosure

**Screen cutout (top shell)**
- Active area opening: 73mm × 49mm, centered in the upper half of the top shell
- Ribbon cable slot: 5mm × 2mm channel along the top/bottom shell joint

**Keyboard plate**
- Dimensions: 140mm × 38mm × 8mm
- 44 switch holes: 13mm × 13mm each, 4 rows × 11 columns
- Row spacing: 9mm center-to-center
- Column spacing: 13mm center-to-center
- Plate recesses into the bottom half of the shell below the screen

**Side buttons (right panel)**
- 4× cylindrical holes: 8mm diameter, 15mm apart vertically
- Centered on the right side panel

**Ports (right panel)**
- 1× charging port cutout: 10mm × 8mm for micro-USB or USB-C

**Ventilation**
- 3× vent slots on the bottom or back: 2mm × 10mm each for Pi heat dissipation

---

## Size Reference

| Device | Dimensions |
|--------|-----------|
| **CyberDeck Pocket** | 160 × 85 × 25mm |
| PSP Go | 128 × 69 × 16.5mm |
| PSP-1000 | 170 × 74 × 23mm |
| Game Boy Advance SP (folded) | 84 × 82 × 24mm |
| Large smartphone | ~160 × 76 × 8mm |

The extra width over PSP Go fits the full thumb keyboard. The extra depth fits the Pi + battery stack.

---

## Community Designs

Browse for PSP/handheld Pi inspiration:

- [Printables — "raspberry pi zero cyberdeck"](https://www.printables.com/search/models?q=raspberry+pi+zero+cyberdeck)
- [Printables — "pi zero handheld"](https://www.printables.com/search/models?q=pi+zero+handheld)
- [Thingiverse — "psp raspberry pi"](https://www.thingiverse.com/search?q=psp+raspberry+pi)
- [Thingiverse — "pi zero keyboard"](https://www.thingiverse.com/search?q=pi+zero+keyboard)
