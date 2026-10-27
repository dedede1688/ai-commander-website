# -*- coding: utf-8 -*-
"""检查所有成员页的资料、图片、分享与访问路径。"""
from pathlib import Path
import subprocess
import sys
site = Path(__file__).resolve().parent.parent
sys.exit(subprocess.run(["node", "tools/audit-members.cjs"], cwd=site).returncode)
