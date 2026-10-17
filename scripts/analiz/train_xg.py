"""Train a commentary-vocabulary xG model on StatsBomb shots and report how good it is."""
import sys, json
import numpy as np, pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GroupKFold
from sklearn.metrics import roc_auc_score, brier_score_loss, log_loss

df = pd.read_csv(sys.argv[1])
ZONES = ["six_central", "six_side", "box_centre", "box_side", "difficult_angle", "outside_box", "long_range"]
FLAGS = ["header", "assisted", "cross", "through", "fast_break", "corner", "free_kick_direct"]

def features(d):
    X = pd.DataFrame({f"z_{z}": (d["zone"] == z).astype(int) for z in ZONES})
    for f in FLAGS:
        X[f] = d[f]
    X["header_in_six"] = d["header"] * d["zone"].isin(["six_central", "six_side"]).astype(int)
    return X

X, y, groups = features(df), df["goal"].values, df["match_id"].values
oof = np.zeros(len(df))
for tr, te in GroupKFold(n_splits=5).split(X, y, groups):
    m = LogisticRegression(C=1.0, max_iter=2000).fit(X.iloc[tr], y[tr])
    oof[te] = m.predict_proba(X.iloc[te])[:, 1]

base = np.full(len(df), y.mean())
report = {
    "n_shots": int(len(df)), "n_goals": int(y.sum()), "n_matches": int(df["match_id"].nunique()),
    "zone_model": {"auc": roc_auc_score(y, oof), "brier": brier_score_loss(y, oof), "logloss": log_loss(y, oof)},
    "statsbomb_xg": {"auc": roc_auc_score(y, df["sb_xg"]), "brier": brier_score_loss(y, df["sb_xg"]), "logloss": log_loss(y, df["sb_xg"].clip(1e-6, 1 - 1e-6))},
    "constant": {"brier": brier_score_loss(y, base), "logloss": log_loss(y, base)},
    "corr_with_sb_xg": float(np.corrcoef(oof, df["sb_xg"])[0, 1]),
}

# Calibration: deciles of predicted xG
df["oof"] = oof
df["bin"] = pd.qcut(df["oof"], 10, duplicates="drop")
calib = df.groupby("bin", observed=True).agg(pred=("oof", "mean"), actual=("goal", "mean"), n=("goal", "size")).reset_index(drop=True)
report["calibration"] = calib.round(4).to_dict(orient="records")

# Zone table (empirical)
zt = df.groupby("zone").agg(shots=("goal", "size"), goals=("goal", "sum"), conv=("goal", "mean"), sb_xg=("sb_xg", "mean")).reindex(ZONES)
report["zones"] = zt.round(4).reset_index().to_dict(orient="records")
hz = df[df.header == 1].groupby("zone").agg(shots=("goal", "size"), conv=("goal", "mean")).reindex(ZONES)
report["header_zones"] = hz.round(4).reset_index().fillna(0).to_dict(orient="records")

final = LogisticRegression(C=1.0, max_iter=2000).fit(X, y)
report["coef"] = dict(zip(X.columns, np.round(final.coef_[0], 3).tolist()))
report["intercept"] = float(final.intercept_[0])
json.dump(report, open(sys.argv[2], "w"), indent=1, default=float)
print(json.dumps({k: v for k, v in report.items() if k not in ("calibration",)}, indent=1, default=float))
print("calibration:"); print(calib.round(3).to_string())
