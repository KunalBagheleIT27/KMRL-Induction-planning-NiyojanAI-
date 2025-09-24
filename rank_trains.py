import sys
import json
import pandas as pd
import joblib
import numpy as np

# Load trained model
model = joblib.load("train_fitness_model.pkl")

def rank_trains(today_df):
    today_df = today_df.copy()
    today_df["job_card_status"] = today_df["job_card_status"].map({"open": 0, "closed": 1})

    X_today = today_df[
        [
            "fitness_rs_days",
            "fitness_sig_days",
            "fitness_tel_days",
            "branding_hours",
            "mileage_km",
            "cleaning_slots",
            "stabling_score",
            "job_card_status",
        ]
    ]
    today_df["predicted_score"] = model.predict(X_today)

    # Force Maintenance for open job cards
    today_df.loc[today_df["job_card_status"] == 0, "predicted_score"] = -np.inf

    # Split groups
    maintenance = today_df[today_df["predicted_score"] == -np.inf].copy()

    eligible = today_df[today_df["predicted_score"] != -np.inf].copy()
    eligible = eligible.sort_values(by="predicted_score", ascending=False).reset_index(drop=True)

    revenue = eligible.head(15)
    standby = eligible.iloc[15:]

    revenue["decision"] = "Revenue"
    standby["decision"] = "Standby"
    maintenance["decision"] = "Maintanice"

    return pd.concat([revenue, standby, maintenance])

if __name__ == "__main__":
    # Get JSON input from Node
    raw = sys.stdin.read()
    data = json.loads(raw)
    df = pd.DataFrame(data)
    ranked = rank_trains(df)

    # Send JSON back
    print(ranked.to_json(orient="records"))
