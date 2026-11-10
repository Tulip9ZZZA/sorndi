#!/usr/bin/env python3
"""Build the single-file SornDi app (repo-local).

Fuses scripts/app_src/*.js + styles + the ESM domain library into one
self-contained index.html at the repo root. Also syntax-checks each module
with node --check when node is available.
"""

import os
import re
import subprocess
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "index.html")


def read(p):
    with open(p, encoding="utf-8") as f:
        return f.read()


core = read(os.path.join(ROOT, "lib", "sorndi-core.mjs"))
core = re.sub(r"^export (const|function)", r"\1", core, flags=re.M)
names = ["ATTENDANCE_STATUSES", "LESSON_TEMPLATES", "uid", "scoreIsNumber",
         "assessmentStats", "weightedTotal", "weightSumOf", "attendanceSummary",
         "attendanceRate", "templateStages", "planTotalMinutes", "planWarnings",
         "csvEscape", "toCSV", "todayISO", "weekdayIndex"]
core += "\nwindow.SorndiCore = { " + ", ".join(names) + " };\n"

css = read(os.path.join(HERE, "app_src", "styles.css"))
app = "\n".join(read(os.path.join(HERE, "app_src", n)) for n in [
    "app-core.js", "app-views1.js", "app-views2.js", "app-views3.js", "app-views4.js"])

shell = read(os.path.join(HERE, "app_src", "shell.html"))
html = shell.replace("{{CSS}}", css).replace("{{CORE}}", core).replace("{{APP}}", app)

with open(OUT, "w", encoding="utf-8") as f:
    f.write(html)

for name in ["app-core.js", "app-views1.js", "app-views2.js", "app-views3.js", "app-views4.js"]:
    code = read(os.path.join(HERE, "app_src", name))
    with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as tf:
        tf.write(code)
        path = tf.name
    r = subprocess.run(["node", "--check", path], capture_output=True, text=True)
    os.unlink(path)
    print(f"{name}: {'OK' if r.returncode == 0 else 'FAIL'}")
    if r.returncode != 0:
        print(r.stderr[:2000])
        raise SystemExit(1)

print(f"built {OUT} ({len(html)} bytes)")
