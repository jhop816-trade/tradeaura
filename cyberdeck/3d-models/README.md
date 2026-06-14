# 3D Models

The STL files for the CyberDeck enclosure are hosted on the [Releases page](https://github.com/youruser/cyberdeck/releases) because their file sizes exceed GitHub's 100MB file limit.

**Download the latest release:** [github.com/youruser/cyberdeck/releases/latest](https://github.com/youruser/cyberdeck/releases/latest)

Also available on [Printables.com](https://www.printables.com) — search "CyberDeck RPi".

---

## Part Descriptions

| File | Dimensions (mm) | Weight (g) | Est. Print Time | Notes |
|------|-----------------|-----------|----------------|-------|
| `main-body.stl` | 340 × 220 × 45 | ~180g | 18h | Largest part; print flat, bottom down |
| `display-bezel-left.stl` | 165 × 120 × 8 | ~28g | 3h | Holds left 7" display panel |
| `display-bezel-right.stl` | 165 × 120 × 8 | ~28g | 3h | Mirror of left — print using slicer mirror |
| `keyboard-tray.stl` | 200 × 85 × 12 | ~45g | 4h | Sliding tray; print slide face-down |
| `battery-bay.stl` | 95 × 60 × 30 | ~22g | 2h | Snap-in battery compartment insert |
| `hinge-left.stl` | 35 × 25 × 20 | ~8g | 40m | Requires 3mm × 25mm steel pin |
| `hinge-right.stl` | 35 × 25 × 20 | ~8g | 40m | Mirror of left |
| `port-cover.stl` | 40 × 20 × 6 | ~4g | 15m | Removable cover for external USB port |

**Total filament:** ~323g (approximately 1/3 of a 1kg spool)

---

## Print Orientation

For each part, orient as follows in your slicer:

- **main-body.stl** — flat side down (the interior faces up). No brim needed if bed is well-leveled; add 5mm brim if you see corner lifting.
- **display-bezel-left/right.stl** — face-side down (the visible surface). This gives the smoothest finish on the part you'll look at.
- **keyboard-tray.stl** — slide rails face-down. The top surface (where the keyboard rests) faces up and will have the best quality.
- **battery-bay.stl** — open side up.
- **hinge-left/right.stl** — pivot axis horizontal. Supports required for the pin channel.
- **port-cover.stl** — flat side down, no supports needed.

---

## Assembly Order for Printed Parts

Print and assemble in this order to catch fit issues early:

1. **port-cover** — test-fit in the main body port opening before printing the body
2. **hinge-left + hinge-right** — install steel pins, test pivot action
3. **battery-bay** — test snap-fit in the main body slot
4. **display-bezel-left + display-bezel-right** — attach to hinges, test hinge range
5. **keyboard-tray** — test slide action in the main body slot
6. **main-body** — the final big print; all other parts should fit before you start this 18-hour print

---

## Hardware Required Per Part

| Part | Hardware |
|------|---------|
| main-body | 14× M3×4mm heat-set inserts, 4× M3×10mm standoffs (for Pi) |
| display-bezel-left | 4× M3×4mm heat-set inserts |
| display-bezel-right | 4× M3×4mm heat-set inserts |
| hinge-left + right | 2× 3mm diameter steel rod, cut to 25mm |
| keyboard-tray | None (snap/slide fit) |
| battery-bay | None (snap fit), optional 2× hook-and-loop straps |
| port-cover | None (friction fit) |

---

## Version History

| Version | Changes |
|---------|---------|
| v1.0 | Initial release — all 8 parts |
| v1.1 | Increased hinge pin channel diameter by 0.2mm for easier fit |
| v1.2 | Added 2mm cable routing channels to main body interior walls |

---

## Contributing Models

Remixes and improvements are welcome. Please open a pull request with:
- Source files (Fusion 360 .f3d or FreeCAD .FCStd preferred)
- Updated STL
- A brief description of what changed and why
