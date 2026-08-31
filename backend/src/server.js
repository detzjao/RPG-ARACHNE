import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.js';
import { createRepository } from './db/index.js';

const repo = createRepository();
const allowedKeys = new Set(['heroes','villains','campaign','dice','challenge','scenario','initiative','notesPlayer','notesMaster']);
const MIME = {
  '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8',
  '.json':'application/json; charset=utf-8', '.pdf':'application/pdf', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.svg':'image/svg+xml'
};

function send(res, status, body, headers = {}) {
  const isObject = body !== null && typeof body === 'object' && !Buffer.isBuffer(body);
  const payload = isObject ? Buffer.from(JSON.stringify(body)) : Buffer.isBuffer(body) ? body : Buffer.from(String(body ?? ''));
  res.writeHead(status, { 'Content-Type': isObject ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8', 'Content-Length': payload.length, ...headers });
  res.end(payload);
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': config.corsOrigin,
    'Access-Control-Allow-Methods': 'GET,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

async function readJson(req, maxBytes = 20 * 1024 * 1024) {
  return await new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', chunk => {
      size += chunk.length;
      if (size > maxBytes) { reject(new Error('Payload muito grande.')); req.destroy(); return; }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); }
      catch { reject(new Error('JSON inválido.')); }
    });
    req.on('error', reject);
  });
}

function safeStaticPath(urlPath) {
  const pathname = decodeURIComponent(urlPath.split('?')[0]);
  const rel = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const target = path.resolve(config.frontendDir, rel);
  return target.startsWith(config.frontendDir + path.sep) || target === path.join(config.frontendDir, 'index.html') ? target : null;
}

async function handleApi(req, res, url) {
  const headers = corsHeaders();
  if (req.method === 'OPTIONS') return send(res, 204, '', headers);
  if (url.pathname === '/api/health' && req.method === 'GET') return send(res, 200, { ok:true, app:'Projeto Arachne API', provider:repo.provider, campaignId:config.campaignId }, headers);
  if (url.pathname === '/api/state' && req.method === 'GET') return send(res, 200, { ok:true, data:await repo.getAll() }, headers);
  if (url.pathname === '/api/state' && req.method === 'PUT') {
    const body = await readJson(req);
    const values = body?.values;
    if (!values || typeof values !== 'object' || Array.isArray(values)) return send(res, 400, { ok:false, error:'Envie { values: {...} }.' }, headers);
    const sanitized = Object.fromEntries(Object.entries(values).filter(([key]) => allowedKeys.has(key)));
    await repo.setMany(sanitized);
    return send(res, 200, { ok:true, saved:Object.keys(sanitized) }, headers);
  }
  const match = url.pathname.match(/^\/api\/state\/([^/]+)$/);
  if (match) {
    const key = decodeURIComponent(match[1]);
    if (!allowedKeys.has(key)) return send(res, 400, { ok:false, error:'Chave inválida.' }, headers);
    if (req.method === 'GET') {
      const value = await repo.get(key);
      return value === undefined ? send(res, 404, { ok:false, error:'Não encontrado.' }, headers) : send(res, 200, { ok:true, data:value }, headers);
    }
    if (req.method === 'PUT') {
      const body = await readJson(req);
      if (!Object.prototype.hasOwnProperty.call(body, 'value')) return send(res, 400, { ok:false, error:'Envie { value: ... }.' }, headers);
      await repo.set(key, body.value);
      return send(res, 200, { ok:true }, headers);
    }
    if (req.method === 'DELETE') {
      await repo.remove(key);
      return send(res, 200, { ok:true }, headers);
    }
  }
  return send(res, 404, { ok:false, error:'Rota não encontrada.' }, headers);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (url.pathname.startsWith('/api/')) return await handleApi(req, res, url);

    if (!config.serveFrontend) return send(res, 404, 'Frontend desativado.');
    const file = safeStaticPath(url.pathname);
    if (!file || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return send(res, 404, 'Arquivo não encontrado.');
    const data = fs.readFileSync(file);
    const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': data.length });
    res.end(data);
  } catch (error) {
    console.error(error);
    send(res, 500, { ok:false, error:error?.message || 'Erro interno.' }, corsHeaders());
  }
});

server.listen(config.port, () => {
  console.log(`[Arachne] http://localhost:${config.port}`);
  console.log(`[Arachne] banco: ${repo.provider}`);
  console.log(`[Arachne] frontend: ${config.serveFrontend ? 'servido pelo backend' : 'separado'}`);
});
