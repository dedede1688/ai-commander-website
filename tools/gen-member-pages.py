# -*- coding: utf-8 -*-
"""兼容原入口：从 member-data.js 生成统一成员页面。"""
from pathlib import Path
import html
import json
import subprocess
import sys
SITE = str(Path(__file__).resolve().parent.parent)
SITE_URL = "https://www.ai-mmc.cn"
def esc(value):
    return html.escape(str(value), quote=True)
def load_people():
    raw = subprocess.check_output(["node", "-e", "process.stdout.write(JSON.stringify(require('./member-data.js')))"], cwd=SITE)
    data = json.loads(raw.decode("utf-8"))
    people = [{"slug":p["slug"],"n":p["name"],"s":p["seat"],"r":p["role"],"f":p["photo"],"b":p["bio"]} for p in data["members"]]
    return people, {p["name"]:p["group"] for p in data["members"]}
if __name__ == "__main__":
    sys.exit(subprocess.run(["node", "tools/generate-members.cjs", *sys.argv[1:]], cwd=SITE).returncode)
