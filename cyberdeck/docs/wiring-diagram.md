# Wiring Diagram

This document covers all electrical connections in the CyberDeck: GPIO buttons, UPS HAT I2C, and display cables.

Read this fully before soldering. The wiring is simple — six buttons and two I2C lines — but getting it right before closing the enclosure saves a lot of troubleshooting time.

---

## Raspberry Pi GPIO Header (40-pin)

The Pi's 40-pin GPIO header runs along the top edge of the board. Pin 1 is the corner closest to the SD card slot (marked with a small triangle or dot on the board).

```
                    Pi GPIO Header (40 pins)
                    Looking down at the board, header at top

        3V3  [1] [2]  5V
  (SDA) GPIO2 [3] [4]  5V
  (SCL) GPIO3 [5] [6]  GND  ←── connect button GND wires here
        GPIO4 [7] [8]  GPIO14 (TXD)
         GND  [9][10]  GPIO15 (RXD)
       GPIO17[11][12]  GPIO18
       GPIO27[13][14]  GND  ←── or here
       GPIO22[15][16]  GPIO23
        3V3 [17][18]  GPIO24
       GPIO10[19][20]  GND
        GPIO9[21][22]  GPIO25
       GPIO11[23][24]  GPIO8
         GND [25][26]  GPIO7
        GPIO0[27][28]  GPIO1
        GPIO5[29][30]  GND
        GPIO6[31][32]  GPIO12
       GPIO13[33][34]  GND
       GPIO19[35][36]  GPIO16
       GPIO26[37][38]  GPIO20
         GND [39][40]  GPIO21

  ↑ Pin 1              Pin 2 ↑
  (3V3)                (5V)
```

Any GND pin works for the button common ground. Pins 6, 9, 14, 25, 30, 34, and 39 are all GND.

---

## Button Wiring Table

Each button is a simple momentary switch. One leg connects to a GPIO pin, the other leg connects to any GND pin. The software enables the Pi's internal pull-up resistors, so no external resistors are needed.

| GPIO Pin | Physical Pin | Button | Action |
|----------|-------------|--------|--------|
| GPIO 17 | Pin 11 | Button 1 | Brightness Up |
| GPIO 27 | Pin 13 | Button 2 | Brightness Down |
| GPIO 22 | Pin 15 | Button 3 | Volume Toggle |
| GPIO 5  | Pin 29 | Button 4 | Launch App |
| GPIO 6  | Pin 31 | Button 5 | Screenshot |
| GPIO 13 | Pin 33 | Button 6 | Power (hold 2s = shutdown, tap = sleep) |
| GPIO 2  | Pin 3  | I2C SDA  | UPS HAT data line (HAT uses this via stacked header) |
| GPIO 3  | Pin 5  | I2C SCL  | UPS HAT clock line (HAT uses this via stacked header) |

---

## Button Wiring Method

```
  GPIO Pin (e.g. Pin 11 = GPIO 17)
       │
       │  (jumper wire)
       │
  ┌────┴────┐
  │ BUTTON  │   ← 12mm tactile switch
  └────┬────┘
       │
       │  (jumper wire)
       │
  GND Pin (e.g. Pin 14)
```

- The software uses `GPIO.PUD_UP` (internal pull-up). When the button is not pressed, the GPIO pin reads HIGH. When pressed (completing the circuit to GND), it reads LOW.
- No external resistors, capacitors, or other components needed.
- Button polarity does not matter — either leg can go to GPIO, either leg to GND.
- **Wire length:** Cut jumper wires to 15–20cm. Long enough to route through the enclosure, short enough to manage neatly.

---

## I2C Connections (UPS HAT)

The Waveshare UPS HAT (and PiSugar 3) connects via I2C through the 40-pin stacked header. If your HAT stacks directly on the GPIO header, no separate I2C wiring is needed — the SDA (GPIO 2 / Pin 3) and SCL (GPIO 3 / Pin 5) lines are connected automatically through the header.

If for any reason you need to connect I2C separately:

| Signal | GPIO | Physical Pin |
|--------|------|-------------|
| SDA (data) | GPIO 2 | Pin 3 |
| SCL (clock) | GPIO 3 | Pin 5 |
| GND | — | Pin 6 |
| 3.3V (if needed) | — | Pin 1 |

Verify I2C is enabled after setup:
```bash
sudo i2cdetect -y 1
```
You should see `0x36` (Waveshare MAX17040 fuel gauge) or `0x75` (PiSugar 3).

---

## Display Connections

| Screen | Port | Location on Pi 5 / Pi 4 |
|--------|------|--------------------------|
| Screen 1 (primary) | micro-HDMI port 0 | Closer to the USB-C power port |
| Screen 2 (secondary) | micro-HDMI port 1 | Second micro-HDMI port |

Use 30cm micro-HDMI cables for clean routing inside the enclosure. Longer cables can be hard to manage; shorter may not reach depending on your layout.

---

## Safety Notes

- **Power off the Pi** before connecting or disconnecting any GPIO wires.
- **Never connect 5V to a GPIO pin** — the Pi's GPIO pins are 3.3V logic. Applying 5V will permanently damage the SoC.
- **Check continuity** with a multimeter before powering on. A short between GPIO and 5V, or between GPIO pins, can damage the Pi.
- **Insulate all solder joints** with heat shrink before routing wires inside the enclosure.
- **18650 cells:** Handle with care. Short circuits can cause fire. Never put a loose 18650 cell in a pocket with metal objects. Install cells last, after all wiring is complete and checked.
