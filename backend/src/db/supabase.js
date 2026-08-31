function makeHeaders(serviceRoleKey, extra = {}) {
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
    ...extra
  };
}

export function createSupabaseRepository({ url, serviceRoleKey, campaignId }) {
  if (!url || !serviceRoleKey) throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios quando DB_PROVIDER=supabase.');
  const rest = `${url}/rest/v1`;

  async function call(path, options = {}) {
    const response = await fetch(`${rest}${path}`, {
      ...options,
      headers: makeHeaders(serviceRoleKey, options.headers)
    });
    const text = await response.text();
    if (!response.ok) throw new Error(text || `Supabase HTTP ${response.status}`);
    return text ? JSON.parse(text) : null;
  }

  async function ensureCampaign() {
    await call('/campaigns?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify([{ id: campaignId, name: 'Projeto Arachne' }])
    });
  }

  return {
    provider: 'supabase',
    async getAll() {
      await ensureCampaign();
      const rows = await call(`/app_state?campaign_id=eq.${encodeURIComponent(campaignId)}&select=state_key,state_value`) || [];
      return Object.fromEntries(rows.map(row => [row.state_key, row.state_value]));
    },
    async get(key) {
      await ensureCampaign();
      const rows = await call(`/app_state?campaign_id=eq.${encodeURIComponent(campaignId)}&state_key=eq.${encodeURIComponent(key)}&select=state_value&limit=1`) || [];
      return rows[0]?.state_value;
    },
    async set(key, value) {
      await ensureCampaign();
      await call('/app_state?on_conflict=campaign_id,state_key', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify([{ campaign_id: campaignId, state_key: key, state_value: value, updated_at: new Date().toISOString() }])
      });
      return value;
    },
    async setMany(values) {
      await ensureCampaign();
      const rows = Object.entries(values).map(([state_key, state_value]) => ({ campaign_id: campaignId, state_key, state_value, updated_at: new Date().toISOString() }));
      if (rows.length) {
        await call('/app_state?on_conflict=campaign_id,state_key', {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
          body: JSON.stringify(rows)
        });
      }
      return values;
    },
    async remove(key) {
      await call(`/app_state?campaign_id=eq.${encodeURIComponent(campaignId)}&state_key=eq.${encodeURIComponent(key)}`, { method: 'DELETE' });
    }
  };
}
