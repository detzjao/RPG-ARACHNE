import { config } from '../config.js';
import { createSqliteRepository } from './sqlite.js';
import { createSupabaseRepository } from './supabase.js';

export function createRepository() {
  if (config.dbProvider === 'supabase') {
    return createSupabaseRepository({ url:config.supabaseUrl, serviceRoleKey:config.supabaseServiceRoleKey });
  }
  return createSqliteRepository({ file:config.sqliteFile });
}
