import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

function parseValue(raw) {
  try { return JSON.parse(raw); }
  catch { return raw; }
}

export function createSqliteRepository({ file }) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec(`
    CREATE TABLE IF NOT EXISTS campaigns (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT,
      template TEXT NOT NULL DEFAULT 'arachne',
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

  // Migração para bancos criados pelas versões anteriores.
  const columns = new Set(db.prepare(`PRAGMA table_info(campaigns)`).all().map(row => row.name));
  if (!columns.has('code')) db.exec(`ALTER TABLE campaigns ADD COLUMN code TEXT`);
  if (!columns.has('password_hash')) db.exec(`ALTER TABLE campaigns ADD COLUMN password_hash TEXT`);
  if (!columns.has('template')) db.exec(`ALTER TABLE campaigns ADD COLUMN template TEXT NOT NULL DEFAULT 'arachne'`);
  db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_campaigns_code ON campaigns(code)`);

  const getAllStmt = db.prepare(`SELECT state_key, state_value FROM app_state WHERE campaign_id = ?`);
  const getStmt = db.prepare(`SELECT state_value FROM app_state WHERE campaign_id = ? AND state_key = ?`);
  const putStmt = db.prepare(`
    INSERT INTO app_state (campaign_id, state_key, state_value, updated_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(campaign_id, state_key)
    DO UPDATE SET state_value = excluded.state_value, updated_at = CURRENT_TIMESTAMP
  `);
  const deleteStmt = db.prepare(`DELETE FROM app_state WHERE campaign_id = ? AND state_key = ?`);
  const campaignByCodeStmt = db.prepare(`SELECT id,code,name,password_hash,template,created_at,updated_at FROM campaigns WHERE upper(code)=upper(?) LIMIT 1`);
  const campaignByIdStmt = db.prepare(`SELECT id,code,name,password_hash,template,created_at,updated_at FROM campaigns WHERE id=? LIMIT 1`);
  const createCampaignStmt = db.prepare(`
    INSERT INTO campaigns (id,code,name,password_hash,template,created_at,updated_at)
    VALUES (?,?,?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
  `);
  const ensureCampaignStmt = db.prepare(`
    INSERT INTO campaigns (id,code,name,password_hash,template,created_at,updated_at)
    VALUES (?,?,?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      code=COALESCE(campaigns.code, excluded.code),
      password_hash=excluded.password_hash,
      template=COALESCE(campaigns.template, excluded.template),
      updated_at=CURRENT_TIMESTAMP
  `);

  return {
    provider:'sqlite',
    async ensureCampaign(campaign) {
      ensureCampaignStmt.run(campaign.id, campaign.code, campaign.name, campaign.passwordHash || null, campaign.template || 'arachne');
      return campaignByIdStmt.get(campaign.id);
    },
    async createCampaign(campaign) {
      createCampaignStmt.run(campaign.id, campaign.code, campaign.name, campaign.passwordHash || null, campaign.template || 'arachne');
      return campaignByIdStmt.get(campaign.id);
    },
    async getCampaignByCode(code) { return campaignByCodeStmt.get(String(code || '').trim()) || null; },
    async getCampaignById(id) { return campaignByIdStmt.get(id) || null; },
    async getCampaignsByCodes(codes = []) {
      const unique = [...new Set(codes.map(code => String(code || '').trim().toUpperCase()).filter(Boolean))].slice(0,30);
      const rows = [];
      for (const code of unique) {
        const row = campaignByCodeStmt.get(code);
        if (row) rows.push(row);
      }
      return rows;
    },
    async getAll(campaignId) {
      const rows = getAllStmt.all(campaignId);
      return Object.fromEntries(rows.map(row => [row.state_key, parseValue(row.state_value)]));
    },
    async get(campaignId, key) {
      const row = getStmt.get(campaignId, key);
      return row ? parseValue(row.state_value) : undefined;
    },
    async set(campaignId, key, value) {
      putStmt.run(campaignId, key, JSON.stringify(value));
      return value;
    },
    async setMany(campaignId, values) {
      db.exec('BEGIN');
      try {
        for (const [key,value] of Object.entries(values)) putStmt.run(campaignId, key, JSON.stringify(value));
        db.exec('COMMIT');
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
      return values;
    },
    async remove(campaignId, key) { deleteStmt.run(campaignId, key); }
  };
}
