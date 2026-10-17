"""Parse ESPN (Opta-style) commentary of one match into shots, score them with the zone xG model,
and compute every number the analysis page shows."""
import sys, json, re, math
import numpy as np

summary = json.load(open(sys.argv[1], encoding="utf-8"))
model = json.load(open(sys.argv[2]))
out_path = sys.argv[3]

teams = {t["team"]["displayName"]: t for t in summary["boxscore"]["teams"]}
comp = summary["header"]["competitions"][0]
home = next(c for c in comp["competitors"] if c["homeAway"] == "home")["team"]["displayName"]
away = next(c for c in comp["competitors"] if c["homeAway"] == "away")["team"]["displayName"]


def minute_of(c):
    v = c.get("time", {}).get("displayValue", "")
    m = re.match(r"(\d+)'(?:\+(\d+)')?", v)
    if not m:
        return None, None
    return int(m.group(1)), int(m.group(2) or 0)


ZONE_RULES = [
    ("very close range", "six_central", "centre"),
    ("centre of the six yard box", "six_central", "centre"),
    ("left side of the six yard box", "six_side", "left"),
    ("right side of the six yard box", "six_side", "right"),
    ("centre of the box", "box_centre", "centre"),
    ("left side of the box", "box_side", "left"),
    ("right side of the box", "box_side", "right"),
    ("difficult angle on the left", "difficult_angle", "left"),
    ("difficult angle on the right", "difficult_angle", "right"),
    ("long range", "long_range", "centre"),
    ("more than 35 yards", "long_range", "centre"),
    ("outside the box", "outside_box", "centre"),
]
FLAGS = ["header", "assisted", "cross", "through", "fast_break", "corner", "free_kick_direct"]


def xg(feat):
    c = model["coef"]
    z = model["intercept"] + c["z_" + feat["zone"]]
    for f in FLAGS:
        z += c[f] * feat[f]
    z += c["header_in_six"] * feat["header"] * (feat["zone"] in ("six_central", "six_side"))
    return 1 / (1 + math.exp(-z))


shots, offsides, fouls, cards, subs, corners, freekicks = [], [], [], [], [], [], []
for c in summary["commentary"]:
    text = c.get("text", "")
    base, extra = minute_of(c)
    if base is None:
        continue
    # Ordering key: second half restarts at 45', so added time of the first half must sort before it.
    half = 2 if (c.get("period", {}) or {}).get("number") == 2 else 1
    t = base + extra / 10 + (0.5 if half == 2 and base == 45 else 0)
    if "GOAL OVERTURNED" in text:
        continue
    m_goal = re.match(r"Goal! [^.]+\. (.+?) \(([^)]+)\) (.+)", text)
    m_att = re.match(r"(Attempt saved|Attempt missed|Attempt blocked)\. (.+?) \(([^)]+)\) (.+)", text)
    if m_goal or m_att:
        if m_goal:
            player, team, rest = m_goal.groups()
            outcome = "goal"
        else:
            kind, player, team, rest = m_att.groups()
            outcome = {"Attempt saved": "saved", "Attempt missed": "missed", "Attempt blocked": "blocked"}[kind]
        zone, side = next(((z, s) for k, z, s in ZONE_RULES if k in rest), ("box_centre", "centre"))
        assist = re.search(r"Assisted by (.+?)(?: with| following|\.$|$)", rest)
        feat = {
            "zone": zone,
            "header": int(rest.startswith("header")),
            "assisted": int(assist is not None),
            "cross": int("with a cross" in rest),
            "through": int("through ball" in rest),
            "fast_break": int("fast break" in rest),
            "corner": int("following a corner" in rest),
            "free_kick_direct": int("free kick" in rest and "Assisted" not in rest),
        }
        body = "header" if feat["header"] else ("left" if rest.startswith("left footed") else "right" if rest.startswith("right footed") else "other")
        shots.append({
            "minute": base, "extra": extra, "t": t, "team": team.strip(), "player": player.strip(),
            "outcome": outcome, "side": side, "assist": assist.group(1).strip() if assist else None,
            "body": body, **feat, "xg": round(xg(feat), 4), "text": text,
        })
    elif text.startswith("Corner,"):
        mk = re.match(r"Corner, ([^.]+)\.", text)
        corners.append({"t": t, "minute": base, "extra": extra, "team": mk.group(1)})
    elif "wins a free kick" in text:
        mw = re.match(r"(.+?) \(([^)]+)\) wins a free kick (in the defensive half|in the attacking half|on the left wing|on the right wing)", text)
        if mw:
            zone_fk = {"in the defensive half": "own_half", "in the attacking half": "opp_half",
                       "on the left wing": "left_wing", "on the right wing": "right_wing"}[mw.group(3)]
            freekicks.append({"t": t, "minute": base, "extra": extra, "team": mw.group(2), "player": mw.group(1), "zone": zone_fk})
    elif text.startswith("Offside,"):
        mo = re.match(r"Offside, ([^.]+)\. (.+?) is caught offside", text)
        offsides.append({"t": t, "minute": base, "team": mo.group(1), "player": mo.group(2)})
    elif text.startswith("Foul by"):
        mf = re.match(r"Foul by (.+?) \(([^)]+)\)", text)
        fouls.append({"t": t, "minute": base, "team": mf.group(2), "player": mf.group(1)})
    elif "is shown the" in text:
        mc = re.match(r"(.+?) \(([^)]+)\) is shown the (yellow|red) card", text)
        cards.append({"t": t, "minute": base, "team": mc.group(2), "player": mc.group(1), "card": mc.group(3)})
    elif text.startswith("Substitution,"):
        ms = re.match(r"Substitution, ([^.]+)\. (.+?) replaces (.+?)(?: because.*)?\.$", text)
        subs.append({"t": t, "minute": base, "team": ms.group(1), "in": ms.group(2), "out": ms.group(3), "injury": "injury" in text})

var_goal = next((c for c in summary["commentary"] if "GOAL OVERTURNED" in c.get("text", "")), None)


def added_time(prefix):
    """Stoppage time of a half, read from the clock on its 'First/Second Half ends' line."""
    line = next((c for c in summary["commentary"] if c.get("text", "").startswith(prefix)), None)
    return minute_of(line)[1] if line else 0


periods = {"first_half_added": added_time("First Half ends"), "second_half_added": added_time("Second Half ends")}


def state_at(t):
    hg = sum(1 for s in shots if s["outcome"] == "goal" and s["team"] == home and s["t"] < t)
    ag = sum(1 for s in shots if s["outcome"] == "goal" and s["team"] == away and s["t"] < t)
    return "level" if hg == ag else ("home_lead" if hg > ag else "away_lead")


for s in shots:
    s["state"] = state_at(s["t"])


def team_sum(team, cond=lambda s: True):
    ss = [s for s in shots if s["team"] == team and cond(s)]
    return {"shots": len(ss), "on_target": sum(s["outcome"] in ("goal", "saved") for s in ss),
            "goals": sum(s["outcome"] == "goal" for s in ss), "xg": round(sum(s["xg"] for s in ss), 3)}


def lead_state(t):
    return "home_lead" if t == home else "away_lead"


def trail_state(t):
    return "away_lead" if t == home else "home_lead"


team_block = {}
for tm in (home, away):
    team_block[tm] = {
        "all": team_sum(tm),
        "h1": team_sum(tm, lambda s: s["t"] < 45.5),
        "h2": team_sum(tm, lambda s: s["t"] >= 45.5),
        "level": team_sum(tm, lambda s: s["state"] == "level"),
        "leading": team_sum(tm, lambda s, tm=tm: s["state"] == lead_state(tm)),
        "trailing": team_sum(tm, lambda s, tm=tm: s["state"] == trail_state(tm)),
        "in_box": team_sum(tm, lambda s: s["zone"] not in ("outside_box", "long_range")),
        "outside": team_sum(tm, lambda s: s["zone"] in ("outside_box", "long_range")),
    }

# Monte Carlo: each shot is an independent Bernoulli(xG)
rng = np.random.default_rng(13)
N = 100_000


def sim(team):
    p = np.array([s["xg"] for s in shots if s["team"] == team])
    return (rng.random((N, len(p))) < p).sum(axis=1)


hg, ag = sim(home), sim(away)
grid = [[float(np.mean((np.minimum(hg, 5) == i) & (np.minimum(ag, 5) == j))) for j in range(6)] for i in range(6)]
best = max(((grid[i][j], i, j) for i in range(6) for j in range(6)))
simres = {
    "n": N,
    "home_win": float(np.mean(hg > ag)), "draw": float(np.mean(hg == ag)), "away_win": float(np.mean(hg < ag)),
    "grid": [[round(v, 4) for v in row] for row in grid],
    "p_away_by_3_plus": float(np.mean(ag - hg >= 3)),
    "p_away_4_plus": float(np.mean(ag >= 4)),
    "home_xpts": float(3 * np.mean(hg > ag) + np.mean(hg == ag)),
    "away_xpts": float(3 * np.mean(hg < ag) + np.mean(hg == ag)),
    "most_likely": {"home": best[1], "away": best[2], "p": best[0]},
    "home_goal_dist": [float(np.mean(hg == k)) for k in range(6)],
    "away_goal_dist": [float(np.mean(ag == k)) for k in range(8)],
}

players = {}


def P(name, team):
    return players.setdefault(name, {"player": name, "team": team, "shots": 0, "xg": 0.0, "goals": 0,
                                     "key_passes": 0, "xa": 0.0, "assists": 0})


for s in shots:
    p = P(s["player"], s["team"])
    p["shots"] += 1
    p["xg"] += s["xg"]
    p["goals"] += s["outcome"] == "goal"
    if s["assist"]:
        a = P(s["assist"], s["team"])
        a["key_passes"] += 1
        a["xa"] += s["xg"]
        a["assists"] += s["outcome"] == "goal"
for p in players.values():
    p["xg"] = round(p["xg"], 3)
    p["xa"] = round(p["xa"], 3)

box = {tm: {s["name"]: s["displayValue"] for s in teams[tm]["statistics"]} for tm in (home, away)}

out = {
    "match": {"id": summary["header"]["id"], "home": home, "away": away, "date": comp["date"],
              "venue": summary["gameInfo"]["venue"]["fullName"], "attendance": summary["gameInfo"].get("attendance"),
              "competition": summary["header"]["season"]["name"],
              "formations": {r["team"]["displayName"]: r.get("formation") for r in summary["rosters"]}},
    "shots": shots, "offsides": offsides, "fouls": fouls, "cards": cards, "subs": subs,
    "corners": corners, "freekicks": freekicks,
    "lineups": {r["team"]["displayName"]: [{"name": p["athlete"]["displayName"], "pos": (p.get("position") or {}).get("abbreviation"),
                                             "place": p.get("formationPlace"), "starter": p.get("starter", False),
                                             "subIn": p.get("subbedIn", False), "subOut": p.get("subbedOut", False),
                                             "jersey": p.get("jersey")} for p in r["roster"]]
                for r in summary["rosters"]},
    "market": (lambda o: {"home": o["homeTeamOdds"]["moneyLine"], "draw": o["drawOdds"]["moneyLine"], "away": o["awayTeamOdds"]["moneyLine"]})(summary["odds"][0]) if summary.get("odds") else None,
    "var_goal": {"minute": minute_of(var_goal)[0], "text": var_goal["text"]} if var_goal else None,
    "periods": periods,
    "team": team_block, "box": box, "sim": simres,
    "players": sorted(players.values(), key=lambda p: -(p["xg"] + p["xa"])),
    "model": {k: model[k] for k in ("n_shots", "n_goals", "n_matches", "zone_model", "statsbomb_xg", "constant",
                                    "corr_with_sb_xg", "calibration", "zones", "coef", "intercept")},
    "last_five": {t["team"]["displayName"]: [{"r": e["gameResult"], "score": e["score"], "opp": e["opponent"]["displayName"],
                                              "comp": e.get("leagueAbbreviation"), "date": e["gameDate"][:10],
                                              "atVs": e.get("atVs")} for e in t["events"]]
                  for t in summary["lastFiveGames"]},
}
json.dump(out, open(out_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

# ASCII-only summary so it prints on any console encoding
print(f"{len(shots)} shots, xG home {team_block[home]['all']['xg']} / away {team_block[away]['all']['xg']}, "
      f"goals {[s['minute'] for s in shots if s['outcome'] == 'goal']} -> {out_path}")
