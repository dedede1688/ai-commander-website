# -*- coding: utf-8 -*-
"""检查成员页搜索信息、分享信息、链接与统一资料。"""
from pathlib import Path
import subprocess
import sys
site = Path(__file__).resolve().parent.parent
sys.exit(subprocess.run(["node", "tools/audit-members.cjs"], cwd=site).returncode)
