import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export function createSqliteRepository({ file, campaignId }) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec(`
    CREATE TABLE IF NOT EXISTS campaigns (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS app_state (
      campaign_id TEXT NOT NULL,
      state_key TEXT NOT NULL,
      state_value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (campaign_id, state_key),
      FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_app_state_campaign ON app_state(campaign_id);
  `);

  db.prepare(`INSERT INTO campaigns (id, name) VALUES (?, ?) ON CONFLICT(id) DO NOTHING`).run(campaignId, 'Projeto Arachne');

  const getAllStmt = db.prepare(`SELECT state_key, state_value FROM app_state WHERE campaign_id = ?`);
  const getStmt = db.prepare(`SELECT state_value FROM app_state WHERE campaign_id = ? AND state_key = ?`);
  const putStmt = db.prepare(`
    INSERT INTO app_state (campaign_id, state_key, state_value, updated_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(campaign_id, state_key)
    DO UPDATE SET state_value = excluded.state_value, updated_at = CURRENT_TIMESTAMP
  `);
  const deleteStmt = db.prepare(`DELETE FROM app_state WHERE campaign_id = ? AND state_key = ?`);

  return {
    provider: 'sqlite',
    async getAll() {
      const rows = getAllStmt.all(campaignId);
      return Object.fromEntries(rows.map(row => {
        try { return [row.state_key, JSON.parse(row.state_value)]; }
        catch { return [row.state_key, row.state_value]; }
      }));
    },
    async get(key) {
      const row = getStmt.get(campaignId, key);
      if (!row) return undefined;
      try { return JSON.parse(row.state_value); }
      catch { return row.state_value; }
    },
    async set(key, value) {
      putStmt.run(campaignId, key, JSON.stringify(value));
      return value;
    },
    async setMany(values) {
      db.exec('BEGIN');
      try {
        for (const [key, value] of Object.entries(values)) putStmt.run(campaignId, key, JSON.stringify(value));
        db.exec('COMMIT');
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
      return values;
    },
    async remove(key) {
      deleteStmt.run(campaignId, key);
    }
  };
}
