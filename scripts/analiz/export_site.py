"""Write the compact JSON the site's analysis page reads (app/data/analiz/<slug>.json).

Usage: python export_site.py <analysis.json> <out.json> <home_short> <away_short> <home_color> <away_color>
  analysis.json  output of parse_match.py
  home_short     short code shown in badges, e.g. GS
  home_color     team colour on the dark site; validate it against the other team's before publishing
"""
import json
import math
import re
import sys

analysis = json.load(open(sys.argv[1], encoding="utf-8"))
out_path = sys.argv[2]
home_short, away_short, home_color, away_color = sys.argv[3:7]

# ESPN drops Turkish letters from some names; fix the ones we show.
NAMES = {
    "Ugurcan Çakir": "Uğurcan Çakır", "Baris Alper Yilmaz": "Barış Alper Yılmaz", "Eren Elmali": "Eren Elmalı",
    "Alexey Batrakov": "Aleksey Batrakov", "Ilkay Gündogan": "İlkay Gündoğan", "Abdülkerim Bardakçi": "Abdülkerim Bardakcı",
    "Gabriel Gomes": "Gabriel Sara", "Kasimpasa": "Kasımpaşa",
}
SHORT = {
    "Lamine Yamal": "Yamal", "Anthony Gordon": "Gordon", "Karim Adeyemi": "Adeyemi", "Rafael Leão": "Leão",
    "Aleksey Batrakov": "Batrakov", "Dani Olmo": "Olmo", "João Cancelo": "Cancelo", "Fermín López": "Fermín",
    "Victor Osimhen": "Osimhen", "Gabriel Sara": "Sara", "Lesley Ugochukwu": "Ugochukwu", "Leroy Sané": "Sané",
    "Barış Alper Yılmaz": "Barış Alper", "Gabriel Jesus": "Gabriel Jesus",
}
def fix(name):
    return NAMES.get(name, name) if name else name


def short(name):
    return SHORT.get(name, name.split(" ")[-1] if name else name)


home, away = analysis["match"]["home"], analysis["match"]["away"]
side = {home: "home", away: "away"}

FIRST_HALF_ADDED = analysis["periods"]["first_half_added"]
SECOND_HALF_ADDED = analysis["periods"]["second_half_added"]


def elapsed(t):
    """Continuous clock: first-half stoppage time pushes the second half to the right."""
    b = math.floor(t + 1e-9)
    e = round((t - b) * 10)
    if b >= 46:
        return b + FIRST_HALF_ADDED + e
    if b == 45 and (t - b) >= 0.45:
        return 45 + FIRST_HALF_ADDED
    return b + e


shots = [{
    "el": elapsed(s["t"]), "minute": s["minute"], "extra": s["extra"], "team": side[s["team"]],
    "player": fix(s["player"]), "short": short(fix(s["player"])), "xg": s["xg"], "outcome": s["outcome"],
} for s in analysis["shots"]]
shots.sort(key=lambda s: s["el"])

end = 90 + FIRST_HALF_ADDED + SECOND_HALF_ADDED
disallowed = []
if analysis.get("var_goal"):
    # "GOAL OVERTURNED BY VAR: Player Name (Team) scores but ..."
    text = analysis["var_goal"]["text"]
    who = re.search(r":\s*(.+?) \(([^)]+)\)", text)
    disallowed.append({
        "el": elapsed(analysis["var_goal"]["minute"]),
        "minute": analysis["var_goal"]["minute"],
        "team": side.get(who.group(2), "home") if who else "home",
        "player": fix(who.group(1)) if who else None,
    })


def american_to_prob(ml):
    ml = float(ml)
    return 100 / (ml + 100) if ml > 0 else -ml / (-ml + 100)


def fit_rates(target, minutes):
    """Pre-match Poisson goal rates whose win/draw/loss matches the de-vigged market."""
    def wdl(lh, la):
        ph = [math.exp(-lh) * lh ** k / math.factorial(k) for k in range(15)]
        pa = [math.exp(-la) * la ** k / math.factorial(k) for k in range(15)]
        w = sum(ph[i] * pa[j] for i in range(15) for j in range(15) if i > j)
        l = sum(ph[i] * pa[j] for i in range(15) for j in range(15) if i < j)
        return w, l
    def search(h_range, a_range):
        best = None
        for lh in h_range:
            for la in a_range:
                w, l = wdl(lh, la)
                err = (w - target[0]) ** 2 + (l - target[2]) ** 2
                if best is None or err < best[0]:
                    best = (err, lh, la)
        return best

    # coarse grid, then a fine one around the best point
    _, lh, la = search([x / 20 for x in range(4, 80)], [x / 20 for x in range(4, 80)])
    _, lh, la = search([lh + x / 200 for x in range(-10, 11)], [la + x / 200 for x in range(-10, 11)])
    return {"home": round(lh, 3), "away": round(la, 3)}


m = analysis["market"]
raw = [american_to_prob(m["home"]), american_to_prob(m["draw"]), american_to_prob(m["away"])]
market = [round(p / sum(raw), 4) for p in raw]

meta = analysis["match"]
out = {
    "id": meta["id"],
    "kickoff": meta["date"],
    "competition": meta["competition"],
    "venue": meta["venue"],
    "attendance": meta.get("attendance"),
    "teams": {
        "home": {"name": home, "short": home_short, "color": home_color, "formation": meta["formations"].get(home)},
        "away": {"name": away, "short": away_short, "color": away_color, "formation": meta["formations"].get(away)},
    },
    "firstHalfAdded": FIRST_HALF_ADDED,
    "end": end,
    "market": {"p": market, "rates": fit_rates(market, 95)},
    "shots": shots,
    "disallowed": disallowed,
    "model": {"nShots": analysis["model"]["n_shots"]},
}
json.dump(out, open(out_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"wrote {out_path}: {len(shots)} shots, end {end}, first-half added {FIRST_HALF_ADDED}, market {market}, rates {out['market']['rates']}")
