import express from "express";
import mysql from "mysql2/promise";

// Load apps/stats/.env if present (Node 24 built-in), otherwise fall back to
// process env / Laragon defaults. This service reads the same MySQL database
// the Laravel API writes to — it does NOT call the Laravel API.
try {
  process.loadEnvFile(new URL(".env", import.meta.url));
} catch {
  // no .env file — rely on process.env and defaults below
}

const PORT = Number(process.env.STATS_PORT ?? 4000);

const pool = mysql.createPool({
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USERNAME ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_DATABASE ?? "Support_Ticket_System",
  connectionLimit: 5,
});

type StatusRow = { status: string; total: number };
type CountRow = { total: number };

const app = express();

app.get("/stats", async (_req, res) => {
  try {
    const [statusRows] = await pool.query<mysql.RowDataPacket[]>(
      "SELECT status, COUNT(*) AS total FROM tickets GROUP BY status",
    );
    const [[ticketCount]] = await pool.query<mysql.RowDataPacket[]>(
      "SELECT COUNT(*) AS total FROM tickets",
    );
    const [[responseCount]] = await pool.query<mysql.RowDataPacket[]>(
      "SELECT COUNT(*) AS total FROM ticket_responses",
    );

    const byStatus: Record<string, number> = {
      open: 0,
      in_progress: 0,
      resolved: 0,
    };
    for (const row of statusRows as StatusRow[]) {
      byStatus[row.status] = Number(row.total);
    }

    const total = Number((ticketCount as CountRow).total);
    const responses = Number((responseCount as CountRow).total);
    const avg = total === 0 ? 0 : Math.round((responses / total) * 100) / 100;

    res.json({
      total,
      by_status: byStatus,
      avg_responses_per_ticket: avg,
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to compute stats:", error);
    res.status(500).json({ error: "Failed to compute stats" });
  }
});

app.listen(PORT, () => {
  console.log(`Stats service listening on http://localhost:${PORT}/stats`);
});
