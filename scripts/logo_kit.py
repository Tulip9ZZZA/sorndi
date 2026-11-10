#!/usr/bin/env python3
"""SORNDI logo kit generator - final assets.

Mark: "Ledger S" - one continuous stroke forming an S with flat,
paper-tab terminals. Wordmark: monoline geometric capitals drawn as paths.

Outputs into /home/z/my-project/download/sorndi/assets/logo/
"""

import os

OUT = "/home/z/my-project/download/sorndi/assets/logo"
os.makedirs(OUT, exist_ok=True)

INK = "#1C1915"
PAPER = "#FAF9F6"
GREEN = "#1F6E4E"

# Final symbol: tightened square viewBox around the ink (see audit).
SYMBOL_VIEWBOX = "36 44 184 184"
SYMBOL_PATH = ("M196 74 H104 A32 32 0 0 0 104 138 H152 "
               "A32 32 0 0 1 152 202 H60")

def symbol(color, sw=44):
    return (f'<path d="{SYMBOL_PATH}" fill="none" stroke="{color}" '
            f'stroke-width="{sw}" stroke-linecap="butt"/>')

def svg_doc(viewbox, body, title="SORNDI logo"):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{viewbox}" '
            f'role="img" aria-label="{title}"><title>{title}</title>{body}</svg>')

# ---------------------------------------------------------------- wordmark
LS = 26        # letter stroke
TRACK = 30     # gap between letters
CAP_TOP, CAP_BOT = 48, 208

def wordmark_body(color):
    x = 13
    parts = []
    def pen(w):
        nonlocal x
        x0 = x
        x += w + TRACK
        return x0
    def path(d):
        parts.append(f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{LS}"/>')

    s = pen(78)
    path(f"M{s+65} 62 H{s+22} A22 22 0 0 0 {s+22} 106 H{s+45} "
         f"A22 22 0 0 1 {s+45} 150 H{s+2}")
    o = pen(92)
    parts.append(f'<rect x="{o}" y="48" width="92" height="160" rx="40" '
                 f'fill="none" stroke="{color}" stroke-width="{LS}"/>')
    r = pen(84)
    path(f"M{r+13} 208 V48 M{r+13} 61 H{r+38} A31 31 0 0 1 {r+38} 123 H{r+13}")
    path(f"M{r+40} 123 L{r+71} 208")
    n = pen(84)
    path(f"M{n+13} 208 V48 L{n+71} 208 V48")
    d = pen(92)
    path(f"M{d+13} 208 V48 M{d+13} 61 H{d+42} A59 59 0 0 1 {d+42} 195 H{d+13}")
    i = pen(26)
    path(f"M{i+13} 208 V48")
    width = x - TRACK + 13
    return "".join(parts), width

wm_body, WM_W = wordmark_body(INK)

# ---------------------------------------------------------------- files
MARK_H = 256
GAP = 64
LOCK_W = MARK_H + GAP + WM_W

files = {}

files["sorndi-symbol.svg"] = svg_doc(SYMBOL_VIEWBOX, symbol(INK), "SORNDI mark")
files["sorndi-symbol-white.svg"] = svg_doc(SYMBOL_VIEWBOX, symbol(PAPER), "SORNDI mark, white")
files["sorndi-symbol-green.svg"] = svg_doc(SYMBOL_VIEWBOX, symbol(GREEN), "SORNDI mark, green")

files["sorndi-wordmark.svg"] = svg_doc(f"0 0 {WM_W} 256", wm_body, "SORNDI wordmark")

inner_wm = wm_body.replace(f'stroke="{INK}"', 'stroke="{c}"')
files["sorndi-lockup-horizontal.svg"] = svg_doc(
    f"0 0 {LOCK_W} 256",
    f'<g transform="translate(0 0)">{symbol(INK)}</g>'
    f'<g transform="translate({MARK_H + GAP} 0)">{wm_body}</g>')

files["sorndi-lockup-horizontal-white.svg"] = svg_doc(
    f"0 0 {LOCK_W} 256",
    f'<g transform="translate(0 0)">{symbol(PAPER)}</g>'
    f'<g transform="translate({MARK_H + GAP} 0)">{wm_body.replace(chr(34)+INK+chr(34), chr(34)+PAPER+chr(34))}</g>')

# stacked lockup: mark centered above wordmark, wordmark scaled to 62% of mark width
SC = 0.62
scaled_w = WM_W * SC
stack_w = max(184, scaled_w)
stack_h = 184 + 48 + 256 * SC
files["sorndi-lockup-stacked.svg"] = svg_doc(
    f"0 0 {stack_w:.0f} {stack_h:.0f}",
    f'<g transform="translate({(stack_w - 184) / 2:.0f} 0)">{symbol(INK)}</g>'
    f'<g transform="translate({(stack_w - scaled_w) / 2:.0f} {184 + 48}) scale({SC})">{wm_body}</g>')

# favicon: mark only, thicker stroke for 16 px legibility
files["favicon.svg"] = svg_doc(SYMBOL_VIEWBOX, symbol(PAPER, sw=52), "SORNDI")

# app icon: ink rounded tile + paper mark (for light UIs); green tile variant
for name, bg, fg in [("sorndi-app-icon.svg", INK, PAPER),
                     ("sorndi-app-icon-green.svg", GREEN, PAPER)]:
    files[name] = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" '
                   f'role="img" aria-label="SORNDI app icon"><title>SORNDI app icon</title>'
                   f'<rect width="256" height="256" rx="56" fill="{bg}"/>'
                   f'<g transform="translate(18 16)">{symbol(fg, sw=44)}</g></svg>')

for name, content in files.items():
    with open(os.path.join(OUT, name), "w") as f:
        f.write(content)

print("written:", sorted(files))
print("wordmark width:", WM_W, "lockup width:", LOCK_W)
