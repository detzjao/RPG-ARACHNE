function makeHeaders(serviceRoleKey, extra = {}) {
  return { apikey:serviceRoleKey, Authorization:`Bearer ${serviceRoleKey}`, 'Content-Type':'application/json', ...extra };
}

export function createSupabaseRepository({ url, serviceRoleKey }) {
  if (!url || !serviceRoleKey) throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios quando DB_PROVIDER=supabase.');
  const rest = `${url}/rest/v1`;

  async function call(path, options = {}) {
    const response = await fetch(`${rest}${path}`, { ...options, headers:makeHeaders(serviceRoleKey, options.headers) });
    const text = await response.text();
    if (!response.ok) throw new Error(text || `Supabase HTTP ${response.status}`);
    return text ? JSON.parse(text) : null;
  }

  const mapCampaign = row => row ? ({
    id:row.id, code:row.code, name:row.name, password_hash:row.password_hash,
    template:row.template || 'arachne', created_at:row.created_at, updated_at:row.updated_at
  }) : null;

  return {
    provider:'supabase',
    async ensureCampaign(campaign) {
      await call('/campaigns?on_conflict=id', {
        method:'POST', headers:{ Prefer:'resolution=merge-duplicates,return=minimal' },
        body:JSON.stringify([{ id:campaign.id, code:campaign.code, name:campaign.name, password_hash:campaign.passwordHash || null, template:campaign.template || 'arachne', updated_at:new Date().toISOString() }])
      });
      return this.getCampaignById(campaign.id);
    },
    async createCampaign(campaign) {
      await call('/campaigns', {
        method:'POST', headers:{ Prefer:'return=minimal' },
        body:JSON.stringify([{ id:campaign.id, code:campaign.code, name:campaign.name, password_hash:campaign.passwordHash || null, template:campaign.template || 'arachne' }])
      });
      return this.getCampaignById(campaign.id);
    },
    async getCampaignByCode(code) {
      const rows = await call(`/campaigns?code=ilike.${encodeURIComponent(String(code || '').trim())}&select=id,code,name,password_hash,template,created_at,updated_at&limit=1`) || [];
      return mapCampaign(rows[0]);
    },
    async getCampaignById(id) {
      const rows = await call(`/campaigns?id=eq.${encodeURIComponent(id)}&select=id,code,name,password_hash,template,created_at,updated_at&limit=1`) || [];
      return mapCampaign(rows[0]);
    },
    async getCampaignsByCodes(codes = []) {
      const unique = [...new Set(codes.map(code=>String(code||'').trim().toUpperCase()).filter(Boolean))].slice(0,30);
      const out=[];
      for (const code of unique) { const row=await this.getCampaignByCode(code); if(row) out.push(row); }
      return out;
    },
    async getAll(campaignId) {
      const rows = await call(`/app_state?campaign_id=eq.${encodeURIComponent(campaignId)}&select=state_key,state_value`) || [];
      return Object.fromEntries(rows.map(row => [row.state_key,row.state_value]));
    },
    async get(campaignId,key) {
      const rows = await call(`/app_state?campaign_id=eq.${encodeURIComponent(campaignId)}&state_key=eq.${encodeURIComponent(key)}&select=state_value&limit=1`) || [];
      return rows[0]?.state_value;
    },
    async set(campaignId,key,value) {
      await call('/app_state?on_conflict=campaign_id,state_key', {
        method:'POST', headers:{ Prefer:'resolution=merge-duplicates,return=minimal' },
        body:JSON.stringify([{ campaign_id:campaignId, state_key:key, state_value:value, updated_at:new Date().toISOString() }])
      });
      return value;
    },
    async setMany(campaignId,values) {
      const rows=Object.entries(values).map(([state_key,state_value])=>({campaign_id:campaignId,state_key,state_value,updated_at:new Date().toISOString()}));
      if(rows.length) await call('/app_state?on_conflict=campaign_id,state_key',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(rows)});
      return values;
    },
    async remove(campaignId,key) {
      await call(`/app_state?campaign_id=eq.${encodeURIComponent(campaignId)}&state_key=eq.${encodeURIComponent(key)}`,{method:'DELETE'});
    }
  };
}
