import express from "express";
import cors from "cors";
import pg from "pg";
import bcrypt from "bcryptjs";
import Papa from "papaparse";
import fs from "fs";
import * as ort from "onnxruntime-node";

const { Pool } = pg;
const app = express();

// --- MIDDLEWARE ---
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json({ limit: "10mb" }));

// --- DATABASE CONNECTION ---
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "kmrl",
  password: "7410", // change if needed
  port: 5432,
});

// ------------------- INITIAL SETUP -------------------
// Automatically create the trains table if it doesn't exist
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS trains (
        train_id SERIAL PRIMARY KEY,
        trainset_id VARCHAR(20) NOT NULL,
        fitness_rs_days INT,
        fitness_sig_days INT,
        fitness_tel_days INT,
        job_card_status VARCHAR(50),
        branding_hours INT,
        mileage_km INT,
        cleaning_slots INT,
        stabling_score INT,
        decision VARCHAR(50),
        date DATE NOT NULL,
        UNIQUE (trainset_id, date)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        fullname VARCHAR(100) NOT NULL
      )
    `);

    console.log("✅ Tables ready");
  } catch (err) {
    console.error("DB setup error:", err);
  }
};

initDB();

// ------------------- AUTH ROUTES -------------------

// --- SIGNUP ---
app.post("/signup", async (req, res) => {
  const { userId, password, name } = req.body;
  if (!userId || !password || !name)
    return res.status(400).json({ message: "All fields required" });

  try {
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE username=$1",
      [userId]
    );
    if (existingUser.rows.length > 0)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (username, password, fullname) VALUES ($1, $2, $3)",
      [userId, hashedPassword, name]
    );

    res.json({ message: "Signup successful" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Signup failed" });
  }
});

// --- LOGIN ---
app.post("/login", async (req, res) => {
  const { userId, password } = req.body;
  if (!userId || !password)
    return res.status(400).json({ message: "All fields required" });

  try {
    const result = await pool.query("SELECT * FROM users WHERE username=$1", [
      userId,
    ]);
    if (result.rows.length === 0)
      return res.status(400).json({ message: "User not found" });

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect password" });

    res.json({ message: "Login successful", userId: user.username });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// --- CHANGE PASSWORD ---
app.post("/change-password", async (req, res) => {
  const { userId, newPassword } = req.body;
  if (!userId || !newPassword)
    return res
      .status(400)
      .json({ message: "User ID and new password required" });

  try {
    const result = await pool.query("SELECT * FROM users WHERE username=$1", [
      userId,
    ]);
    if (result.rows.length === 0)
      return res.status(400).json({ message: "User not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password=$1 WHERE username=$2", [
      hashedPassword,
      userId,
    ]);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Failed to change password" });
  }
});

// ------------------- CSV UPLOAD -------------------
// ------------------- CSV UPLOAD -------------------
// ------------------- CSV UPLOAD -------------------
app.post("/upload-csv", async (req, res) => {
  const { csv } = req.body;
  if (!csv) return res.status(400).json({ message: "No CSV data provided" });

  try {
    const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
    const rows = parsed.data;

    // 1. Insert/Update into DB
    const inserted = [];
    for (const row of rows) {
      const {
        trainset_id,
        fitness_rs_days,
        fitness_sig_days,
        fitness_tel_days,
        job_card_status,
        branding_hours,
        mileage_km,
        cleaning_slots,
        stabling_score,
        date,
      } = row;

      // normalize job card status
      const normalizedJobCard = (job_card_status || "").trim().toLowerCase();

      const query = `
        INSERT INTO trains 
          (trainset_id, fitness_rs_days, fitness_sig_days, fitness_tel_days, 
           job_card_status, branding_hours, mileage_km, cleaning_slots, 
           stabling_score, date)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        ON CONFLICT (trainset_id, date) DO UPDATE
        SET fitness_rs_days = EXCLUDED.fitness_rs_days,
            fitness_sig_days = EXCLUDED.fitness_sig_days,
            fitness_tel_days = EXCLUDED.fitness_tel_days,
            job_card_status = EXCLUDED.job_card_status,
            branding_hours = EXCLUDED.branding_hours,
            mileage_km = EXCLUDED.mileage_km,
            cleaning_slots = EXCLUDED.cleaning_slots,
            stabling_score = EXCLUDED.stabling_score
        RETURNING *;
      `;

      const result = await pool.query(query, [
        trainset_id,
        parseInt(fitness_rs_days) || 0,
        parseInt(fitness_sig_days) || 0,
        parseInt(fitness_tel_days) || 0,
        normalizedJobCard,
        parseInt(branding_hours) || 0,
        parseInt(mileage_km) || 0,
        parseInt(cleaning_slots) || 0,
        parseFloat(stabling_score) || 0,
        date,
      ]);

      inserted.push(result.rows[0]);
    }

    // 2. Load ONNX model
    const session = await ort.InferenceSession.create(
      "./train_fitness_model.onnx"
    );

    const inputNames = [
      "fitness_rs_days",
      "fitness_sig_days",
      "fitness_tel_days",
      "branding_hours",
      "mileage_km",
      "cleaning_slots",
      "stabling_score",
      "job_card_status",
    ];

    const features = inserted.map((row) => [
      row.fitness_rs_days,
      row.fitness_sig_days,
      row.fitness_tel_days,
      row.branding_hours,
      row.mileage_km,
      row.cleaning_slots,
      row.stabling_score,
      row.job_card_status?.trim().toLowerCase() === "open" ? 0 : 1, // encode categorical
    ]);

    const inputTensor = new ort.Tensor(
      "float32",
      Float32Array.from(features.flat()),
      [features.length, inputNames.length]
    );

    // ⚡️ FIX: use correct input name from session
    const inputName = session.inputNames[0];
    const results = await session.run({ [inputName]: inputTensor });

    const predictions = results[session.outputNames[0]].data;

    // 3. Business rules
    const trainsWithScores = inserted.map((row, idx) => {
      let score = predictions[idx];
      const normalized = (row.job_card_status || "").trim().toLowerCase();

      if (normalized === "open") score = -Infinity; // force maintenance

      return { ...row, predicted_score: score };
    });

    // Separate categories
    const maintenance = trainsWithScores.filter(
      (t) => t.predicted_score === -Infinity
    );
    const eligible = trainsWithScores.filter(
      (t) => t.predicted_score !== -Infinity
    );

    eligible.sort((a, b) => b.predicted_score - a.predicted_score);

    const revenue = eligible.slice(0, 15);
    const standby = eligible.slice(15);

    // 4. Update DB with final decision
    const updateDecision = async (trains, decision) => {
      for (const t of trains) {
        await pool.query("UPDATE trains SET decision=$1 WHERE train_id=$2", [
          decision,
          t.train_id,
        ]);
      }
    };

    await updateDecision(revenue, "Revenue");
    await updateDecision(standby, "Standby");
    await updateDecision(maintenance, "Maintenance");

    res.json({
      message: "CSV processed and trains ranked",
      summary: {
        revenue: revenue.length,
        standby: standby.length,
        maintenance: maintenance.length,
      },
      details: {
        revenue: revenue.map((t) => ({
          trainset_id: t.trainset_id,
          score: t.predicted_score,
        })),
        standby: standby.map((t) => ({
          trainset_id: t.trainset_id,
          score: t.predicted_score,
        })),
        maintenance: maintenance.map((t) => ({
          trainset_id: t.trainset_id,
          score: t.predicted_score,
        })),
      },
    });
  } catch (err) {
    console.error("CSV upload error:", err);
    res.status(500).json({ message: "Failed to process CSV" });
  }
});

// ------------------- FETCH TRAINS -------------------
app.get("/trains", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM trains ORDER BY train_id ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch trains error:", err);
    res.status(500).json({ message: "Failed to fetch trains" });
  }
});
// ------------------- FETCH DASHBOARD DATA -------------------
app.get("/api", async (req, res) => {
  try {
    // 1. Key Trends (example logic, adjust as per real fields)
    const mtbf = await pool.query(`
      SELECT AVG(mileage_km) as avg_mileage 
      FROM trains
    `);
    const uptime = await pool.query(`
      SELECT COUNT(*) FILTER (WHERE decision='Revenue')::int AS ready,
             COUNT(*) FILTER (WHERE decision='Standby')::int AS standby,
             COUNT(*) FILTER (WHERE decision='Maintenance')::int AS maintenance
      FROM trains
    `);

    const keyTrends = [
      {
        label: `${Math.round(mtbf.rows[0].avg_mileage || 0)} avg mileage (km)`,
        type: "positive",
      },
      {
        label: "Maintenance costs reduced vs last quarter",
        type: "info",
      },
      {
        label: `Fleet uptime ready: ${uptime.rows[0].ready} trains`,
        type: "positive",
      },
    ];

    // 2. Fleet Status Pie
    const fleetStatus = [
      { name: "Ready", value: uptime.rows[0].ready, color: "#16a34a" },
      { name: "Standby", value: uptime.rows[0].standby, color: "#f97316" },
      {
        name: "Needs Maintenance",
        value: uptime.rows[0].maintenance,
        color: "#dc2626",
      },
    ];

    // 3. Monthly Maintenance (group by month)
    const monthly = await pool.query(`
      SELECT TO_CHAR(date, 'Mon') as month, SUM(stabling_score) as cost
      FROM trains
      GROUP BY 1
      ORDER BY MIN(date)
    `);

    const monthlyMaintenance = monthly.rows.map((r) => ({
      month: r.month,
      cost: Number(r.cost),
    }));

    // 4. SLA Compliance (dummy from stabling_score threshold)
    const sla = await pool.query(`
      SELECT TO_CHAR(date, 'Mon') as month,
             ROUND(100.0 * SUM(CASE WHEN stabling_score > 50 THEN 1 ELSE 0 END)::numeric / COUNT(*), 2) as sla
      FROM trains
      GROUP BY 1
      ORDER BY MIN(date)
    `);

    const slaCompliance = sla.rows.map((r) => ({
      month: r.month,
      sla: Number(r.sla),
    }));

    // 5. MTBF by trainset
    const mtbfByTrain = await pool.query(`
      SELECT trainset_id as train,
             AVG(mileage_km) as actual,
             1000 as baseline
      FROM trains
      GROUP BY trainset_id
    `);

    res.json({
      trends: keyTrends,
      fleetStatus,
      monthlyMaintenance,
      slaCompliance,
      mtbf: mtbfByTrain.rows.map((r) => ({
        train: r.train,
        actual: Number(r.actual),
        baseline: Number(r.baseline),
      })),
    });
  } catch (err) {
    console.error("Dashboard fetch error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});
// Backend PUT route
app.put("/trains/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Map frontend status → DB decision
    let decisionValue;
    switch (status.toLowerCase()) {
      case "service":
        decisionValue = "maintenance";
        break;
      case "standby":
        decisionValue = "maintenance";
        break;
      case "maintenance":
        decisionValue = "maintenance";
        break;
      default:
        decisionValue = "maintenance"; // default fail-safe
    }

    await pool.query("UPDATE trains SET decision = $1 WHERE trainset_id = $2", [
      decisionValue,
      id,
    ]);

    res.json({ message: "Train updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update train" });
  }
});

// Promote standby → service when a service train goes to maintenance
// What-If: Move selected train → Maintenance, replace with one Standby
app.put("/whatif/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Move the selected Service train → Maintenance
    await pool.query(
      "UPDATE trains SET decision = 'ibl' WHERE trainset_id = $1",
      [id]
    );

    // 2. Pick the first available Standby train
    const standxby = await pool.query(
      "SELECT trainset_id FROM trains WHERE decision = 'standby' LIMIT 1"
    );

    if (standby.rows.length > 0) {
      const standbyId = standby.rows[0].trainset_id;

      // Promote this Standby train → Revenue
      await pool.query(
        "UPDATE trains SET decision = 'revenue' WHERE trainset_id = $1",
        [standbyId]
      );

      return res.json({
        message: `Train ${id} moved to Maintenance. Standby ${standbyId} promoted to Revenue.`,
        replaced: standbyId,
      });
    }

    // If no standby trains available
    res.json({
      message: `Train ${id} moved to Maintenance. No standby available to replace.`,
    });
  } catch (err) {
    console.error("What-If error:", err);
    res.status(500).json({ error: "Failed to update What-If plan" });
  }
});

// Get trains with history
app.get("/api/history", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM trains");
    res.json(result.rows); // ✅ always JSON
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ error: "Failed to fetch history" }); // ✅ JSON error
  }
});

// ------------------- START SERVER -------------------
app.listen(5000, () =>
  console.log("🚀 Server running on http://localhost:5000")
);
