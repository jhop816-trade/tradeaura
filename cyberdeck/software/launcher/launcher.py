#!/usr/bin/env python3
"""CyberDeck TUI Launcher — cyberpunk terminal interface."""

import subprocess
import sys
import time
import os
from pathlib import Path
from datetime import datetime

try:
    import yaml
    from rich.console import Console
    from rich.layout import Layout
    from rich.panel import Panel
    from rich.table import Table
    from rich.text import Text
    from rich.live import Live
    from rich.columns import Columns
    import psutil
except ImportError:
    print("Missing deps. Run: pip install rich psutil pyyaml")
    sys.exit(1)

CONFIG_PATH = Path(__file__).parent / "config.yaml"
BATTERY_FILE = Path("/tmp/battery.txt")

console = Console()

def load_config():
    if CONFIG_PATH.exists():
        with open(CONFIG_PATH) as f:
            return yaml.safe_load(f)
    return {"apps": [], "settings": {"refresh_interval": 2}}

def read_battery():
    try:
        return BATTERY_FILE.read_text().strip()
    except Exception:
        return "N/A"

def get_ip():
    try:
        result = subprocess.run(
            ["hostname", "-I"], capture_output=True, text=True, timeout=2
        )
        return result.stdout.split()[0] if result.stdout.strip() else "No IP"
    except Exception:
        return "No IP"

def get_cpu_temp():
    try:
        temp = psutil.sensors_temperatures()
        if "cpu_thermal" in temp:
            return f"{temp['cpu_thermal'][0].current:.0f}°C"
        if "coretemp" in temp:
            return f"{temp['coretemp'][0].current:.0f}°C"
    except Exception:
        pass
    try:
        path = Path("/sys/class/thermal/thermal_zone0/temp")
        if path.exists():
            return f"{int(path.read_text().strip()) / 1000:.0f}°C"
    except Exception:
        pass
    return "N/A"

def make_stats_bar():
    now = datetime.now()
    cpu = psutil.cpu_percent(interval=None)
    mem = psutil.virtual_memory()
    battery = read_battery()
    ip = get_ip()
    temp = get_cpu_temp()

    t = Text()
    t.append(f" {now.strftime('%H:%M:%S')} ", style="bold bright_green")
    t.append("│", style="dim green")
    t.append(f" {now.strftime('%a %d %b')} ", style="green")
    t.append("│", style="dim green")
    t.append(f" CPU: {cpu:.0f}% ", style="bright_cyan")
    t.append("│", style="dim green")
    t.append(f" RAM: {mem.percent:.0f}% ", style="cyan")
    t.append("│", style="dim green")
    t.append(f" {temp} ", style="yellow")
    t.append("│", style="dim green")
    t.append(f" BAT: {battery} ", style="bright_green")
    t.append("│", style="dim green")
    t.append(f" {ip} ", style="dim cyan")
    return Panel(t, style="green", padding=(0, 1))

def make_app_grid(apps, selected=0):
    table = Table.grid(expand=True, padding=(1, 2))
    table.add_column(ratio=1)
    table.add_column(ratio=1)
    table.add_column(ratio=1)

    row = []
    for i, app in enumerate(apps):
        icon = app.get("icon", "?")
        name = app.get("name", "App")
        color = app.get("color", "green")
        num = i + 1

        if i == selected:
            cell = Text()
            cell.append(f"  [{num}] {icon} {name}  ", style=f"bold black on {color}")
        else:
            cell = Text()
            cell.append(f"  [{num}] {icon} {name}  ", style=f"bold {color}")

        row.append(Panel(cell, border_style=color if i == selected else "dim green"))

        if len(row) == 3:
            table.add_row(*row)
            row = []

    if row:
        while len(row) < 3:
            row.append("")
        table.add_row(*row)

    return Panel(table, title="[bold green]▸ APPS[/bold green]", border_style="green")

def make_button_legend(config):
    gpio = config.get("gpio_buttons", {})
    t = Text()
    t.append(" BUTTONS: ", style="dim green")
    for pin, info in gpio.items():
        label = info.get("label", "?")
        t.append(f"[{label}] ", style="bright_green")
    t.append("│ ", style="dim green")
    t.append("[Q] QUIT  [↑↓] NAVIGATE  [ENTER] LAUNCH", style="dim cyan")
    return Panel(t, style="dim green", padding=(0, 1))

def launch_app(app):
    cmd = app.get("command", "")
    if cmd:
        subprocess.Popen(cmd, shell=True, start_new_session=True)

def run():
    config = load_config()
    apps = config.get("apps", [])
    refresh = config.get("settings", {}).get("refresh_interval", 2)
    selected = 0

    import termios
    import tty

    def getch_nonblock():
        """Non-blocking single char read."""
        import select
        if select.select([sys.stdin], [], [], 0)[0]:
            return sys.stdin.read(1)
        return None

    old_settings = termios.tcgetattr(sys.stdin)
    tty.setraw(sys.stdin.fileno())

    try:
        with Live(auto_refresh=False, screen=True) as live:
            last_refresh = 0
            while True:
                now = time.time()
                ch = getch_nonblock()

                if ch:
                    if ch in ("q", "Q", "\x03"):
                        break
                    elif ch == "\x1b":
                        seq = getch_nonblock()
                        if seq == "[":
                            arrow = getch_nonblock()
                            if arrow == "A" and selected > 0:
                                selected -= 1
                            elif arrow == "B" and selected < len(apps) - 1:
                                selected += 1
                            elif arrow == "C" and selected < len(apps) - 1:
                                selected += 1
                            elif arrow == "D" and selected > 0:
                                selected -= 1
                    elif ch in "123456789":
                        idx = int(ch) - 1
                        if idx < len(apps):
                            selected = idx
                    elif ch in ("\r", "\n", " "):
                        if selected < len(apps):
                            launch_app(apps[selected])

                if now - last_refresh >= refresh:
                    layout = Layout()
                    layout.split_column(
                        Layout(make_stats_bar(), size=3),
                        Layout(make_app_grid(apps, selected)),
                        Layout(make_button_legend(config), size=3),
                    )
                    live.update(layout, refresh=True)
                    last_refresh = now

                time.sleep(0.05)
    finally:
        termios.tcsetattr(sys.stdin, termios.TCSADRAIN, old_settings)

if __name__ == "__main__":
    try:
        run()
    except KeyboardInterrupt:
        pass
    finally:
        console.clear()
        print("CyberDeck launcher exited.")
