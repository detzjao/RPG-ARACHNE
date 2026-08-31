import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, '..');

function loadEnvFile() {
  const file = path.join(backendRoot, '.env');
  if (!fs.existsSync(file)) return;
  for (const rawLine of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx < 1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadEnvFile();

export const config = {
  port: Number(process.env.PORT || 3000),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  dbProvider: (process.env.DB_PROVIDER || 'sqlite').toLowerCase(),
  sqliteFile: path.resolve(backendRoot, process.env.SQLITE_FILE || './data/arachne.sqlite'),
  campaignId: process.env.CAMPAIGN_ID || 'main',
  serveFrontend: String(process.env.SERVE_FRONTEND || 'true').toLowerCase() !== 'false',
  frontendDir: path.resolve(backendRoot, '../frontend'),
  supabaseUrl: (process.env.SUPABASE_URL || '').replace(/\/$/, ''),
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
};
