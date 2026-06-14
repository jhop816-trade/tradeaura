#!/usr/bin/env python3
"""CyberDeck Web Dashboard — Flask app on port 5000."""

import subprocess
import sys
from pathlib import Path

try:
    import psutil
    import yaml
    from flask import Flask, jsonify, render_template, request
except ImportError:
    print("Missing deps. Run: pip install flask psutil pyyaml")
    sys.exit(1)

app = Flask(__name__)

CONFIG_PATH = Path(__file__).parent.parent / "launcher" / "config.yaml"
BATTERY_FILE = Path("/tmp/battery.txt")
ALERT_FILE = Path("/tmp/cyberdeck_alert.txt")


def load_config():
    if CONFIG_PATH.exists():
        with open(CONFIG_PATH) as f:
            return yaml.safe_load(f)
    return {"apps": []}


def run_cmd(cmd, timeout=5):
    try:
        result = subprocess.run(
            cmd, shell=True, capture_output=True, text=True, timeout=timeout
        )
        return result.stdout.strip()
    except Exception:
        return ""


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/stats")
def stats():
    cpu = psutil.cpu_percent(interval=0.1)
    mem = psutil.virtual_memory()
    disk = psutil.disk_usage("/")
    uptime_secs = int(psutil.boot_time())

    temp = "N/A"
    try:
        sensors = psutil.sensors_temperatures()
        for key in ("cpu_thermal", "coretemp"):
            if key in sensors:
                temp = f"{sensors[key][0].current:.0f}°C"
                break
        if temp == "N/A":
            tp = Path("/sys/class/thermal/thermal_zone0/temp")
            if tp.exists():
                temp = f"{int(tp.read_text().strip()) / 1000:.0f}°C"
    except Exception:
        pass

    battery = "N/A"
    try:
        battery = BATTERY_FILE.read_text().strip()
    except Exception:
        pass

    alert = None
    try:
        alert = ALERT_FILE.read_text().strip()
    except Exception:
        pass

    import time
    uptime_delta = int(time.time()) - uptime_secs
    hours, rem = divmod(uptime_delta, 3600)
    minutes = rem // 60

    return jsonify({
        "cpu": round(cpu, 1),
        "ram": round(mem.percent, 1),
        "ram_used_gb": round(mem.used / 1e9, 1),
        "ram_total_gb": round(mem.total / 1e9, 1),
        "disk": round(disk.percent, 1),
        "disk_used_gb": round(disk.used / 1e9, 1),
        "disk_total_gb": round(disk.total / 1e9, 1),
        "temp": temp,
        "battery": battery,
        "alert": alert,
        "uptime": f"{hours}h {minutes}m",
    })


@app.route("/api/wifi")
def wifi_list():
    output = run_cmd("nmcli -t -f SSID,SIGNAL,SECURITY dev wifi list 2>/dev/null | head -20")
    networks = []
    for line in output.splitlines():
        if line.strip():
            parts = line.split(":")
            if len(parts) >= 2:
                networks.append({
                    "ssid": parts[0],
                    "signal": parts[1] if len(parts) > 1 else "?",
                    "security": parts[2] if len(parts) > 2 else "OPEN",
                })
    return jsonify(networks)


@app.route("/api/wifi/connect", methods=["POST"])
def wifi_connect():
    data = request.get_json()
    ssid = data.get("ssid", "")
    password = data.get("password", "")
    if not ssid:
        return jsonify({"error": "SSID required"}), 400
    if password:
        cmd = f"nmcli dev wifi connect '{ssid}' password '{password}'"
    else:
        cmd = f"nmcli dev wifi connect '{ssid}'"
    output = run_cmd(cmd, timeout=15)
    success = "successfully" in output.lower()
    return jsonify({"success": success, "output": output})


@app.route("/api/apps")
def get_apps():
    config = load_config()
    return jsonify(config.get("apps", []))


@app.route("/api/launch", methods=["POST"])
def launch_app():
    data = request.get_json()
    name = data.get("name", "")
    config = load_config()
    apps = config.get("apps", [])
    for app_cfg in apps:
        if app_cfg.get("name") == name:
            cmd = app_cfg.get("command", "")
            if cmd:
                subprocess.Popen(
                    f"DISPLAY=:0 {cmd}",
                    shell=True,
                    start_new_session=True,
                )
            return jsonify({"launched": name})
    return jsonify({"error": "App not found"}), 404


@app.route("/api/screenshot", methods=["POST"])
def screenshot():
    import time
    ts = time.strftime("%Y%m%d_%H%M%S")
    path = Path.home() / "screenshots" / f"{ts}.png"
    path.parent.mkdir(exist_ok=True)
    run_cmd(f"DISPLAY=:0 scrot '{path}'")
    return jsonify({"file": str(path)})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
