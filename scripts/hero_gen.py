#!/usr/bin/env python3
"""README hero SVG for SornDi - project-native, pure SVG, system fonts."""

OUT = "/home/z/my-project/download/sorndi/assets/readme"

def hero(theme):
    if theme == "dark":
        paper, subtle, raised = "#14120F", "#1B1915", "#201D18"
        ink, ink2, ink3 = "#F4F2ED", "#B5AFA4", "#8B8478"
        line = "#2E2B25"
        accent, accent_ink, accent_tint = "#2E7D58", "#4FB084", "#1D2B24"
        red_t, red_ink = "#2A1D1B", "#C96B62"
        amber_t, amber_ink = "#2A241A", "#C09450"
        accent_t = accent_tint
    else:
        paper, subtle, raised = "#FAF9F6", "#F2F0EB", "#FFFFFF"
        ink, ink2, ink3 = "#1C1915", "#57534B", "#7A7468"
        line = "#E6E3DC"
        accent, accent_ink, accent_tint = "#1F6E4E", "#175A3E", "#EAF2EE"
        red_t, red_ink = "#F7ECEB", "#B3403A"
        amber_t, amber_ink = "#F6F0E2", "#9A6B15"
        accent_t = accent_tint

    W, H = 1200, 600
    s = []
    s.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" font-family="-apple-system,Segoe UI,Roboto,Noto Sans,sans-serif" role="img">')
    s.append(f'<title>SornDi - Plan less. Teach better. The local-first teacher OS: one connected record for lessons, attendance, quizzes and scores in a single HTML file.</title>')
    s.append(f'<rect width="{W}" height="{H}" fill="{paper}"/>')
    for y in range(100, H, 100):
        s.append(f'<line x1="0" y1="{y}" x2="{W}" y2="{y}" stroke="{line}" stroke-width="1"/>')

    # brand row: mark + wordmark
    s.append(f'<g transform="translate(72 60) scale(0.42)">'
             f'<path d="M196 74 H104 A32 32 0 0 0 104 138 H152 A32 32 0 0 1 152 202 H60" '
             f'fill="none" stroke="{accent}" stroke-width="44"/></g>')
    s.append(f'<text x="192" y="118" font-size="30" font-weight="600" letter-spacing="7" fill="{ink}">SORNDI</text>')
    s.append(f'<text x="194" y="146" font-size="13" fill="{ink3}" font-family="ui-monospace,Menlo,monospace">TEACHER OS · v2.0</text>')

    # headline + body
    s.append(f'<text x="72" y="272" font-size="54" font-weight="600" letter-spacing="-1" fill="{ink}">Plan less.</text>')
    s.append(f'<text x="72" y="334" font-size="54" font-weight="600" letter-spacing="-1" fill="{accent_ink}">Teach better.</text>')
    s.append(f'<text x="72" y="384" font-size="19" fill="{ink2}">The local-first teacher OS: one connected record for</text>')
    s.append(f'<text x="72" y="412" font-size="19" fill="{ink2}">lessons, attendance, quizzes and scores - one</text>')
    s.append(f'<text x="72" y="440" font-size="19" fill="{ink2}">HTML file, no account, no server, no lock-in.</text>')

    # ledger tabs
    s.append(f'<g transform="translate(72 486)">'
             f'<rect x="0" y="0" width="88" height="30" rx="4" fill="{accent}"/>'
             f'<text x="44" y="20" font-size="13" fill="#FFFFFF" text-anchor="middle" font-weight="500">Today</text>'
             f'<rect x="96" y="0" width="112" height="30" rx="4" fill="{subtle}" stroke="{line}"/>'
             f'<text x="152" y="20" font-size="13" fill="{ink2}" text-anchor="middle">Classrooms</text>'
             f'<rect x="216" y="0" width="76" height="30" rx="4" fill="{subtle}" stroke="{line}"/>'
             f'<text x="254" y="20" font-size="13" fill="{ink2}" text-anchor="middle">Studio</text>'
             f'<rect x="300" y="0" width="96" height="30" rx="4" fill="{subtle}" stroke="{line}"/>'
             f'<text x="348" y="20" font-size="13" fill="{ink2}" text-anchor="middle">Exports</text>'
             f'</g>')

    # product card
    s.append(f'<g transform="translate(620 70)">')
    s.append(f'<rect x="0" y="0" width="520" height="462" rx="16" fill="{raised}" stroke="{line}"/>')
    s.append(f'<path d="M0 16 a16 16 0 0 1 16-16 h488 a16 16 0 0 1 16 16 v28 h-520 z" fill="{subtle}"/>')
    s.append(f'<rect x="20" y="12" width="12" height="14" rx="2" fill="{accent}"/>')
    s.append(f'<text x="44" y="32" font-size="14" fill="{ink}" font-weight="500">M.2 Science - Room 204</text>')
    s.append(f'<text x="500" y="32" font-size="12" fill="{ink3}" text-anchor="end">Mon 08:30</text>')

    s.append(f'<text x="24" y="76" font-size="15" font-weight="500" fill="{ink}">Energy transfer in circuits</text>')
    s.append(f'<text x="24" y="98" font-size="12.5" fill="{ink3}">Objective: explain how energy transforms</text>')

    names = [("1  Arisa W.", "Present", accent_t, accent_ink),
             ("2  Chokchai N.", "Present", accent_t, accent_ink),
             ("3  Dawid K.", "Late", amber_t, amber_ink),
             ("4  Fahsai B.", "Present", accent_t, accent_ink),
             ("5  Kanokwan S.", "Sick", red_t, red_ink),
             ("6  Napat C.", "Not set", subtle, ink3)]
    y = 116
    for name, st, bg, fg in names:
        s.append(f'<rect x="24" y="{y}" width="268" height="26" rx="6" fill="none" stroke="{line}"/>')
        s.append(f'<text x="36" y="{y+17.5}" font-size="12.5" fill="{ink}">{name}</text>')
        s.append(f'<rect x="216" y="{y+4}" width="64" height="18" rx="5" fill="{bg}"/>')
        s.append(f'<text x="248" y="{y+16.5}" font-size="10" fill="{fg}" text-anchor="middle">{st}</text>')
        y += 34
    s.append(f'<text x="24" y="{y+8}" font-size="11" fill="{ink3}">13 present · 1 late · 1 sick · untouched rows stay "not recorded"</text>')

    fy = y + 24
    s.append(f'<rect x="24" y="{fy}" width="472" height="84" rx="10" fill="{subtle}" stroke="{line}"/>')
    s.append(f'<text x="40" y="{fy+24}" font-size="11" fill="{ink2}" font-weight="500" letter-spacing="1">WEIGHTED TOTAL - THE MATH IS ON THE PAGE</text>')
    s.append(f'<text x="40" y="{fy+48}" font-family="ui-monospace,Menlo,monospace" font-size="13.5" fill="{ink}">total = (70% × w2 + 90% × w1) / (w2 + w1)</text>')
    s.append(f'<text x="40" y="{fy+70}" font-family="ui-monospace,Menlo,monospace" font-size="13.5" fill="{accent_ink}">      = 76.7%    missing ≠ 0 · excused ≠ 0</text>')

    s.append('</g>')
    s.append('</svg>')
    return "\n".join(s)

import os
os.makedirs(OUT, exist_ok=True)
with open(f"{OUT}/hero-light.svg", "w") as f:
    f.write(hero("light"))
with open(f"{OUT}/hero-dark.svg", "w") as f:
    f.write(hero("dark"))
print("heroes written")
