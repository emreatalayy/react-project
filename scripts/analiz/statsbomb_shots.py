"""Download StatsBomb open-data events for selected men's competitions and keep only shots,
labelled with the same zone / assist vocabulary that Opta-style commentary uses."""
import json, sys, csv, urllib.request, concurrent.futures as cf
from pathlib import Path

OUT = Path(sys.argv[1])
BASE = "https://raw.githubusercontent.com/statsbomb/open-data/master/data"
COMPS = [(55, 282), (43, 106), (223, 282), (1267, 107), (9, 281), (7, 235), (7, 108)]

def get(url):
    with urllib.request.urlopen(url, timeout=120) as r:
        return json.loads(r.read().decode("utf-8"))

def zone(x, y):
    in_box = x >= 102 and 18 <= y <= 62
    if x >= 114 and 30 <= y <= 50:
        return "six_central" if 36 <= y <= 44 else "six_side"
    if in_box:
        if 30 <= y <= 50:
            return "box_centre"
        return "difficult_angle" if x >= 114 else "box_side"
    return "long_range" if x < 85 else "outside_box"

def shots_of(match_id):
    ev = get(f"{BASE}/events/{match_id}.json")
    by_id = {e["id"]: e for e in ev}
    rows = []
    for e in ev:
        if e["type"]["name"] != "Shot":
            continue
        s = e["shot"]
        if s["type"]["name"] == "Penalty":
            continue
        x, y = e["location"][:2]
        kp = by_id.get(s.get("key_pass_id")) if s.get("key_pass_id") else None
        p = (kp or {}).get("pass", {})
        rows.append({
            "match_id": match_id,
            "zone": zone(x, y),
            "x": x, "y": y,
            "header": int(s["body_part"]["name"] == "Head"),
            "assisted": int(kp is not None),
            "cross": int(bool(p.get("cross"))),
            "through": int(bool(p.get("through_ball")) or (p.get("technique", {}) or {}).get("name") == "Through Ball"),
            "fast_break": int(e["play_pattern"]["name"] == "From Counter"),
            "corner": int(e["play_pattern"]["name"] == "From Corner"),
            "free_kick_direct": int(s["type"]["name"] == "Free Kick"),
            "sb_xg": s.get("statsbomb_xg", 0.0),
            "goal": int(s["outcome"]["name"] == "Goal"),
        })
    return rows

match_ids = []
for c, s in COMPS:
    ms = get(f"{BASE}/matches/{c}/{s}.json")
    match_ids += [m["match_id"] for m in ms]
print("matches:", len(match_ids), flush=True)

all_rows = []
with cf.ThreadPoolExecutor(max_workers=10) as ex:
    for i, rows in enumerate(ex.map(shots_of, match_ids)):
        all_rows += rows
        if i % 50 == 0:
            print(i, len(all_rows), flush=True)

with OUT.open("w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=list(all_rows[0].keys()))
    w.writeheader(); w.writerows(all_rows)
print("shots:", len(all_rows), "goals:", sum(r["goal"] for r in all_rows))
