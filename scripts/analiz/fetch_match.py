"""Download one match summary (stats, lineups, minute-by-minute commentary) from ESPN's public JSON.

Usage: python fetch_match.py <league> <event_id> <out.json>
  league   ESPN league code, e.g. uefa.champions, tur.1, eng.1
  event_id ESPN game id, the number in espn.com/soccer/match/_/gameId/<id>
"""
import json
import sys
import urllib.request

league, event_id, out_path = sys.argv[1], sys.argv[2], sys.argv[3]
url = f"https://site.web.api.espn.com/apis/site/v2/sports/soccer/{league}/summary?event={event_id}"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (mac-analizi)"})
with urllib.request.urlopen(req, timeout=60) as r:
    data = json.loads(r.read().decode("utf-8"))

if not data.get("commentary"):
    sys.exit("No commentary in this summary; shot parsing needs ESPN's commentary feed.")
json.dump(data, open(out_path, "w", encoding="utf-8"), ensure_ascii=False)
teams = [c["team"]["displayName"] for c in data["header"]["competitions"][0]["competitors"]]
print(f"saved {out_path}: {' vs '.join(teams)}, {len(data['commentary'])} commentary lines")
