(() => {
  'use strict';

  const APP_VERSION = 5;
  const STORAGE = {
    heroes: `arachne_v${APP_VERSION}_heroes`,
    notesPlayer: `arachne_v${APP_VERSION}_notes_player`,
    notesMaster: `arachne_v${APP_VERSION}_notes_master`,
    campaign: `arachne_v${APP_VERSION}_campaign`,
    dice: `arachne_v${APP_VERSION}_dice`,
    challenge: `arachne_v${APP_VERSION}_challenge`,
    villains: `arachne_v${APP_VERSION}_villains`,
    villainDice: `arachne_v${APP_VERSION}_villain_dice`,
    villainChallenge: `arachne_v${APP_VERSION}_villain_challenge`
  };

  const ABILITIES = ['Melee', 'Agility', 'Resilience', 'Vigilance', 'Ego', 'Logic'];
  const DEFAULT_HEROES = [
    {
      id:'spider', n:'Homem-Aranha', r:'Peter Parker', i:'🕷️', rank:4,
      stats:[['Health',90],['Focus',90],['Karma',4]],
      abilities:{Melee:5,Agility:7,Resilience:3,Vigilance:3,Ego:0,Logic:4},
      traits:['Audience','Combat Reflexes','Connections: Sources','Free Running','Inventor','Pundit','Scientific Expertise','Weird'],
      tags:['Heroic','Obligation: Aunt May','Poor','Secret Identity']
    },
    {
      id:'wolverine', n:'Wolverine', r:'James Howlett / Logan', i:'🗡️', rank:4,
      stats:[['Health',150],['Focus',150],['Karma',4]],
      abilities:{Melee:7,Agility:2,Resilience:5,Vigilance:4,Ego:1,Logic:1},
      traits:['Battle Ready','Berserker','Combat Expert','Combat Reflexes','Connections: Military','Extraordinary Origin','Situational Awareness','Tech Reliance'],
      tags:['Extreme Appearance','Enemy: Sabretooth','Heroic','Hounded','Krakoan','Public Identity','X-Gene']
    },
    {
      id:'cap', n:'Capitão América', r:'Steve Rogers', i:'🛡️', rank:4,
      stats:[['Health',90],['Focus',120],['Karma',4]],
      abilities:{Melee:6,Agility:4,Resilience:3,Vigilance:3,Ego:2,Logic:2},
      traits:['Battle Ready','Beguiling','Combat Expert','Combat Reflexes','Connections: Military','Public Speaking','Situational Awareness','Weird'],
      tags:['Enemy: Hydra','Enemy: Red Skull','Heroic','Public Identity']
    }
  ];

  const DEFAULT_VILLAINS = [
    {
      id:'octopus', n:'Doutor Octopus', r:'Otto Octavius', i:'🐙', rank:4, tier:'AMEAÇA',
      role:'Cientista / primeiro grande suspeito', hook:'Ligado à parte científica do Projeto Arachne.',
      maxHealth:90, maxFocus:60, currentHealth:90, currentFocus:60, karma:'—', healthDR:'—', focusDR:'—', initiative:'+2',
      speed:'Correr 5 · Escalar 5 · Nadar 3 · Pular 5', occupation:'Cientista', origin:'Alta Tecnologia, Ciência Bizarra', teams:'Masters of Evil, Sinister Six', base:'Nova York',
      abilities:{Melee:4,Agility:3,Resilience:3,Vigilance:2,Ego:4,Logic:5},
      traits:['Abrasivo','Origem Extraordinária','Inventor','Especialista Científico','Cético','Dependência Tecnológica','Estranho'],
      tags:['Acesso a Laboratório','Identidade Pública','Vilanesco'],
      powers:['Membro Adicional','Brilhantismo 2','Poderoso 2','Alcance Estendido 1','Esquiva Aracnídea','Escalar Paredes','Golpear Cabeças','Agarrão Esmagador','Golpe Brutal','Pulo 1','Arremesso Rápido','Telepatia com Máquinas']
    },
    {
      id:'sabretooth', n:'Dentes-de-Sabre', r:'Victor Creed', i:'🐯', rank:4, tier:'AMEAÇA',
      role:'Rival pessoal de Wolverine', hook:'Enviado para capturar Logan e estudar seu fator de cura.',
      maxHealth:180, maxFocus:150, currentHealth:180, currentFocus:150, karma:'—', healthDR:'-1', focusDR:'—', initiative:'+4E',
      speed:'Correr 5 · Escalar 3 · Nadar 3 · Pular 5', occupation:'Militar', origin:'Alta Tecnologia: Cibernética, Mutante', teams:'1959 Avengers, Brotherhood of Evil Mutants, Hand, Marauders, Team X, X-Factor', base:'Krakoa',
      abilities:{Melee:7,Agility:4,Resilience:6,Vigilance:4,Ego:0,Logic:0},
      traits:['Abrasivo','Pronto para Batalha','Berserker','Reflexos de Combate','Conexões: Militar','Origem Extraordinária','Consciência Situacional','Furtivo','Dependência Tecnológica'],
      tags:['Aparência Extrema','Caçado','Krakoano','Vilanesco','Gene-X'],
      powers:['Luta de Rua','Truque de Combate','Fator de Cura','Sentidos Aguçados 1','Poderoso 1','Esqueleto Reforçado','Explorar Fraqueza','Ataques Rápidos','Fúria Focada','Ataques Furiosos','Bater e Correr','Ripostar','Ataque Imparável','Ataque Cruel','Frenesi Giratório','Pulo 1']
    },
    {
      id:'crossbones', n:'Ossos Cruzados', r:'Brock Rumlow', i:'☠️', rank:3, tier:'AMEAÇA',
      role:'Operação Hydra', hook:'Tenta roubar a amostra de Steve Rogers.',
      maxHealth:90, maxFocus:90, currentHealth:90, currentFocus:90, karma:'—', healthDR:'—', focusDR:'—', initiative:'+2E',
      speed:'Correr 6 · Escalar 3 · Nadar 3 · Pular 3', occupation:'Militar', origin:'Treinamento Especial', teams:'Hydra, Thunderbolts, Skeleton Crew', base:'Móvel',
      abilities:{Melee:4,Agility:5,Resilience:3,Vigilance:2,Ego:0,Logic:1},
      traits:['Pronto para Batalha','Sanguinário','Especialista em Combate','Conexões: Militar (Hydra)','Determinação','Pilotagem','Consciência Situacional'],
      tags:['Reforços','Identidade Pública','Vilanesco','Arma Característica: Submetralhadora'],
      powers:['Precisão 2','Esquiva em Câmera Lenta','Golpear Cabeças','Técnica de Agarrão','Dança da Morte','Tiro Duplo','Mãos Rápidas','Aparar à Queima-Roupa','Esquiva de Tiro em Câmera Lenta','Tiro Instantâneo','Poder de Parada','Armas em Chamas']
    },
    {
      id:'goblin', n:'Duende Verde', r:'Norman Osborn', i:'🎃', rank:4, tier:'AMEAÇA',
      role:'Vilão intermediário', hook:'Invade o projeto para roubar a tecnologia.',
      maxHealth:120, maxFocus:60, currentHealth:120, currentFocus:60, karma:'—', healthDR:'-1', focusDR:'—', initiative:'+2',
      speed:'Correr 6 · Escalar 3 · Nadar 3 · Voo 24', occupation:'Criminoso, Magnata', origin:'Ciência Bizarra', teams:'Dark Avengers, Goblin Nation, Sinister Six, Thunderbolts', base:'Nova York',
      abilities:{Melee:5,Agility:5,Resilience:4,Vigilance:2,Ego:1,Logic:3},
      traits:['Conexões: Celebridades','Conexões: Criminalidade','Negociador','Ocupação Extra','Famoso','Inventor','Dependência Tecnológica','Estranho'],
      tags:['Acesso ao Mercado Negro','Inimigo: Homem-Aranha','Quartel-General','Rico','Identidade Secreta','Conhecimento das Ruas','Vilanesco','Arma Característica: Bombas-Abóbora'],
      powers:['Precisão 1','Truque de Combate','Voo 2','Fator de Cura','Inspiração','Poderoso 2','Robusto 1','Rajada Elemental','Explosão Elemental','Golpear Cabeças','Golpe Brutal','Agarrão Esmagador','Arremesso Rápido','Plano de Batalha','Mudança de Planos']
    },
    {
      id:'sinister', n:'Senhor Sinistro', r:'Nathaniel Essex', i:'🧬', rank:5, tier:'CHEFE FINAL',
      role:'VILÃO FINAL', hook:'O verdadeiro cérebro por trás da coleta genética.',
      maxHealth:180, maxFocus:120, currentHealth:180, currentFocus:120, karma:'—', healthDR:'-1', focusDR:'—', initiative:'+4E',
      speed:'Correr 5 · Escalar 3 · Nadar 3 · Voo 25', occupation:'Cientista, Criminoso', origin:'Ciência Bizarra', teams:'Marauders, Conselho Silencioso, Nasty Boys', base:'Laboratórios secretos',
      abilities:{Melee:3,Agility:3,Resilience:6,Vigilance:4,Ego:2,Logic:7},
      traits:['Abrasivo','Conexões: Criminalidade','Negociador','Origem Extraordinária','Inventor','Especialista Científico','Cético','Dependência Tecnológica','Estranho'],
      tags:['Mercado Negro','Inimigo: X-Men','Quartel-General','Laboratório','Rico','Identidade Secreta','Vilanesco'],
      powers:['Brilhantismo 2','Voo 1','Fator de Cura','Poderoso 2','Robusto 1','Manipulação Telecinética','Ataque Telecinético','Agarrão Telecinético','Barreira Telecinética','Proteção Telecinética 2','Elo Telepático','Leitura Mental','Rajada Telepática','Copiar Habilidade','Copiar Poder','Clonar Poderes','Amortecer Poder']
    }
  ];

  const SESSIONS = [
    {id:'01',title:'O Roubo',text:'Os três heróis investigam roubos diferentes e chegam ao mesmo laboratório. A pista aponta para E. Octavius.'},
    {id:'02',title:'Doutor Octopus',text:'Otto transporta uma amostra. Documentos apontam para Essex.'},
    {id:'03',title:'O Caçador',text:'Dentes-de-Sabre aparece para Logan. Depois surge a pista da Essex Genetics.'},
    {id:'04',title:'Hydra',text:'Crossbones e soldados da Hydra atacam uma instalação.'},
    {id:'05',title:'Duende Verde',text:'Norman Osborn invade o projeto. A investigação revela o financiamento de S. Essex.'},
    {id:'06',title:'Essex',text:'Os heróis descobrem Nathaniel Essex e o plano maior.'},
    {id:'07',title:'Madripoor',text:'A equipe segue o laboratório final. Investigação e uma nova aparição de Dentes-de-Sabre.'},
    {id:'08',title:'Projeto Arachne',text:'Senhor Sinistro revela o plano. Combate final com o laboratório entrando em colapso.'}
  ];

  const DEFAULT_CHALLENGE = {
    action:'Ação sem título', tn:14, edge:0, trouble:0,
    actor:'spider', ability:'Agility', extra:0
  };
  const DEFAULT_VILLAIN_CHALLENGE = {
    action:'Ação do vilão', tn:14, edge:0, trouble:0,
    actor:'octopus', ability:'Melee', extra:0
  };

  const MASTER_PASSWORD = 'ARACHNE';
  const $ = id => document.getElementById(id);
  const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clone = value => typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value));
  const escapeHTML = value => String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));
  const rand = sides => Math.floor(Math.random() * sides) + 1;
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : clone(fallback);
    } catch {
      return clone(fallback);
    }
  }
  function saveJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

  // Migração v4 -> v5 (com fallback v3). Não sobrescreve dados existentes na v5.
  const migrationCandidates = {
    heroes:['arachne_v4_heroes','arachne_v3_heroes'],
    campaign:['arachne_v4_campaign','arachne_v3_campaign'],
    dice:['arachne_v4_dice','arachne_v3_dice'],
    challenge:['arachne_v4_challenge']
  };
  Object.entries(migrationCandidates).forEach(([name, keys]) => {
    if (localStorage.getItem(STORAGE[name])) return;
    const oldKey = keys.find(key => localStorage.getItem(key) != null);
    if (oldKey) localStorage.setItem(STORAGE[name], localStorage.getItem(oldKey));
  });
  if (!localStorage.getItem(STORAGE.notesPlayer)) {
    const oldNotes = localStorage.getItem('arachne_v4_notes_player') ?? localStorage.getItem('arachne_v3_notes') ?? localStorage.getItem('arachne_notes');
    if (oldNotes != null) localStorage.setItem(STORAGE.notesPlayer, oldNotes || '');
  }
  if (!localStorage.getItem(STORAGE.notesMaster)) {
    const oldNotes = localStorage.getItem('arachne_v4_notes_master');
    if (oldNotes != null) localStorage.setItem(STORAGE.notesMaster, oldNotes || '');
  }

  function normalizeHero(hero, fallback) {
    const out = {...clone(fallback), ...hero};
    out.id = hero?.id || fallback.id;
    out.stats = Array.isArray(hero?.stats) ? hero.stats : clone(fallback.stats);
    out.traits = Array.isArray(hero?.traits) ? hero.traits : clone(fallback.traits);
    out.tags = Array.isArray(hero?.tags) ? hero.tags : clone(fallback.tags);
    out.abilities = {...fallback.abilities, ...(hero?.abilities || {})};
    // Corrige apenas os valores-padrão errados da v3; valores personalizados permanecem intactos.
    if (out.id === 'spider' && statValueRaw(out,'Health') === 80 && statValueRaw(out,'Focus') === 100) {
      out.stats = [['Health',90],['Focus',90],['Karma',statValueRaw(out,'Karma') || 4]];
    }
    if (out.id === 'wolverine' && statValueRaw(out,'Health') === 100 && statValueRaw(out,'Focus') === 130) {
      out.stats = [['Health',150],['Focus',150],['Karma',statValueRaw(out,'Karma') || 4]];
    }
    return out;
  }
  function statValueRaw(hero, name) { return hero?.stats?.find(([key]) => key === name)?.[1] ?? 0; }

  function normalizeVillain(villain, fallback) {
    const out = {...clone(fallback), ...(villain || {})};
    out.id = villain?.id || fallback.id;
    out.abilities = {...fallback.abilities, ...(villain?.abilities || {})};
    out.traits = Array.isArray(villain?.traits) ? villain.traits : clone(fallback.traits);
    out.tags = Array.isArray(villain?.tags) ? villain.tags : clone(fallback.tags);
    out.powers = Array.isArray(villain?.powers) ? villain.powers : clone(fallback.powers);
    out.maxHealth = clamp(out.maxHealth,0,9999);
    out.maxFocus = clamp(out.maxFocus,0,9999);
    out.currentHealth = Math.min(clamp(out.currentHealth,0,9999), out.maxHealth);
    out.currentFocus = Math.min(clamp(out.currentFocus,0,9999), out.maxFocus);
    return out;
  }

  const loadedHeroes = loadJSON(STORAGE.heroes, DEFAULT_HEROES);
  const loadedVillains = loadJSON(STORAGE.villains, DEFAULT_VILLAINS);
  const state = {
    role:'player', page:'home', diceMode:'d616', rolling:false, currentRoll:null,
    villainRolling:false, villainCurrentRoll:null,
    heroes: DEFAULT_HEROES.map((fallback, i) => normalizeHero(loadedHeroes[i] || fallback, fallback)),
    villains: DEFAULT_VILLAINS.map((fallback, i) => normalizeVillain(loadedVillains[i] || fallback, fallback)),
    campaign: loadJSON(STORAGE.campaign, Object.fromEntries(SESSIONS.map(s => [s.id, 'todo']))),
    diceHistory: loadJSON(STORAGE.dice, []),
    villainDiceHistory: loadJSON(STORAGE.villainDice, []),
    challenge: {...DEFAULT_CHALLENGE, ...loadJSON(STORAGE.challenge, DEFAULT_CHALLENGE)},
    villainChallenge: {...DEFAULT_VILLAIN_CHALLENGE, ...loadJSON(STORAGE.villainChallenge, DEFAULT_VILLAIN_CHALLENGE)}
  };
  saveJSON(STORAGE.heroes, state.heroes);
  saveJSON(STORAGE.villains, state.villains);

  let toastTimer;
  let savedTimer;
  let lastFocusedElement = null;

  function toast(message) {
    const el = $('toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
  }

  function markSaved(message = 'Salvo localmente') {
    $('saved').querySelector('span').textContent = message;
    clearTimeout(savedTimer);
    savedTimer = setTimeout(() => $('saved').querySelector('span').textContent = 'Salvo localmente', 1700);
  }

  function statValue(hero, name) { return statValueRaw(hero, name); }
  function abilityValue(hero, ability) { return Number(hero?.abilities?.[ability] ?? 0); }
  function signed(value) { const n = Number(value) || 0; return n >= 0 ? `+${n}` : String(n); }

  function enter(role) {
    state.role = role;
    $('login').classList.add('hidden');
    $('app').classList.remove('hidden');
    $('role-label').textContent = role === 'master' ? 'MESTRE' : 'JOGADOR';
    $('home-role').textContent = role === 'master' ? 'MESTRE' : 'JOGADOR';
    qsa('[data-master]').forEach(el => el.classList.toggle('hidden', role !== 'master'));
    loadNotesForRole();
    goToPage(role === 'master' ? 'home' : 'heroes');
    renderAll();
  }

  function logout() {
    state.role = 'player';
    state.currentRoll = null;
    $('app').classList.add('hidden');
    $('app').classList.remove('nav-open');
    $('login').classList.remove('hidden');
    $('master-password').value = '';
    $('login-error').textContent = '';
  }

  function goToPage(id) {
    if ((id === 'home' || id === 'villains' || id === 'villain-dice' || id === 'campaign') && state.role !== 'master') id = 'heroes';
    state.page = id;
    qsa('.page').forEach(el => el.classList.remove('active'));
    $(id)?.classList.add('active');
    qsa('#nav button').forEach(el => el.classList.toggle('active', el.dataset.page === id));
    $('title').textContent = {home:'Central da Campanha',heroes:'Heróis',villains:'Vilões',campaign:'Projeto Arachne',dice:'Dados dos Heróis','villain-dice':'Dados dos Vilões',notes:'Anotações'}[id] || 'Projeto Arachne';
    closeNav();
  }

  function openNav() { $('app').classList.add('nav-open'); $('menu-toggle').setAttribute('aria-expanded', 'true'); }
  function closeNav() { $('app').classList.remove('nav-open'); $('menu-toggle').setAttribute('aria-expanded', 'false'); }

  function renderHeroes() {
    $('hero-count').textContent = String(state.heroes.length).padStart(2, '0');
    $('heroes-grid').innerHTML = state.heroes.map((hero, index) => `
      <article class="card" data-hero-card="${index}">
        <div class="art">${escapeHTML(hero.i)}<span class="rank">RANK ${clamp(hero.rank,1,6)}</span></div>
        <div class="body">
          <h3>${escapeHTML(hero.n)}</h3><div class="muted">${escapeHTML(hero.r)}</div>
          <div class="card-statline">
            <span><small>Health</small><b>${escapeHTML(statValue(hero,'Health'))}</b></span>
            <span><small>Focus</small><b>${escapeHTML(statValue(hero,'Focus'))}</b></span>
            <span><small>Karma</small><b>${escapeHTML(statValue(hero,'Karma'))}</b></span>
          </div>
          <div class="chips">${hero.tags.slice(0,4).map(tag => `<span class="chip">${escapeHTML(tag)}</span>`).join('')}</div>
          <div class="card-actions"><button class="primary" type="button" data-action="view-hero" data-index="${index}">VER FICHA</button><button type="button" data-action="edit-hero" data-index="${index}">EDITAR</button></div>
        </div>
      </article>`).join('');
    renderActorOptions();
  }

  function renderVillains() {
    $('villains-grid').innerHTML = state.villains.map((villain, index) => {
      const hpPct = villain.maxHealth ? Math.round((villain.currentHealth / villain.maxHealth) * 100) : 0;
      const fpPct = villain.maxFocus ? Math.round((villain.currentFocus / villain.maxFocus) * 100) : 0;
      return `<article class="card villain-card ${villain.tier === 'CHEFE FINAL' ? 'boss-card' : ''}">
        <div class="art">${escapeHTML(villain.i)}<span class="rank">RANK ${clamp(villain.rank,1,6)} · ${escapeHTML(villain.tier)}</span></div>
        <div class="body"><h3>${escapeHTML(villain.n)}</h3><div class="muted">${escapeHTML(villain.r)}</div>
          <div class="resource-bars">
            <div class="resource-row"><span><small>HEALTH</small><b>${villain.currentHealth}/${villain.maxHealth}</b></span><i><u style="width:${hpPct}%"></u></i></div>
            <div class="resource-row focus"><span><small>FOCUS</small><b>${villain.currentFocus}/${villain.maxFocus}</b></span><i><u style="width:${fpPct}%"></u></i></div>
          </div>
          <div class="chips"><span class="chip">${escapeHTML(villain.role)}</span><span class="chip">Inic. ${escapeHTML(villain.initiative)}</span></div>
          <div class="card-actions"><button class="primary" type="button" data-action="view-villain" data-index="${index}">ABRIR FICHA</button><button type="button" data-action="edit-villain" data-index="${index}">EDITAR</button></div>
        </div>
      </article>`;
    }).join('');
  }

  const STATUS = {
    todo:{label:'NÃO INICIADA',className:''}, current:{label:'EM ANDAMENTO',className:'current'}, done:{label:'CONCLUÍDA',className:'done'}
  };

  function campaignMetrics() {
    const done = SESSIONS.filter(s => state.campaign[s.id] === 'done').length;
    const current = SESSIONS.findIndex(s => state.campaign[s.id] === 'current');
    return {done,current,percent:Math.round((done / SESSIONS.length) * 100)};
  }

  function renderCampaign() {
    const metrics = campaignMetrics();
    [$('campaign-progress'), $('campaign-toolbar-progress')].forEach(el => { if (el) el.style.width = `${metrics.percent}%`; });
    $('campaign-percent').textContent = `${metrics.percent}%`;
    $('campaign-summary').textContent = `${metrics.done}/${SESSIONS.length} sessões`;
    $('campaign-toolbar-percent').textContent = `${metrics.percent}%`;
    $('campaign-toolbar-summary').textContent = `${metrics.done} concluída${metrics.done === 1 ? '' : 's'}`;
    $('phase-label').textContent = metrics.done >= 7 ? 'FASE FINAL' : metrics.done >= 4 ? 'FASE 2' : 'FASE 1';

    $('sessions').innerHTML = SESSIONS.map(session => {
      const statusKey = state.campaign[session.id] || 'todo';
      const status = STATUS[statusKey];
      return `<article class="session status-${status.className || 'todo'}" data-session="${session.id}">
        <div class="sessionhead">
          <div class="num">${session.id}</div>
          <button class="sessiontoggle" type="button" data-action="toggle-session" data-session-id="${session.id}" aria-expanded="false"><h3>${escapeHTML(session.title)}</h3></button>
          <span class="status-pill ${status.className}">${status.label}</span>
          <button class="status-cycle" type="button" data-action="cycle-session" data-session-id="${session.id}" title="Alterar status">ALTERAR</button>
          <span class="chevron">+</span>
        </div><div class="sessionbody"><div><p>${escapeHTML(session.text)}</p></div></div>
      </article>`;
    }).join('');

    $('home-session-list').innerHTML = SESSIONS.map(session => {
      const key = state.campaign[session.id] || 'todo';
      const cls = key === 'done' ? 'done' : key === 'current' ? 'current' : '';
      return `<div class="mini-session ${cls}"><small>SESSÃO ${session.id}</small><b>${escapeHTML(session.title)}</b></div>`;
    }).join('');
  }

  function cycleSession(id) {
    const order = ['todo','current','done'];
    const next = order[(order.indexOf(state.campaign[id] || 'todo') + 1) % order.length];
    if (next === 'current') Object.keys(state.campaign).forEach(key => { if (state.campaign[key] === 'current') state.campaign[key] = 'todo'; });
    state.campaign[id] = next;
    saveJSON(STORAGE.campaign, state.campaign);
    renderCampaign();
    markSaved('Progresso salvo');
  }

  function openModal(html) {
    lastFocusedElement = document.activeElement;
    $('modalbody').innerHTML = html;
    $('modal').classList.remove('hidden');
    $('close').focus();
  }
  function closeModal() {
    $('modal').classList.add('hidden');
    $('modalbody').innerHTML = '';
    lastFocusedElement?.focus?.();
  }

  function viewHero(index) {
    const hero = state.heroes[index];
    if (!hero) return;
    const abilityCards = ABILITIES.map(name => `<div><small>${name}</small><b>${signed(abilityValue(hero,name))}</b></div>`).join('');
    openModal(`<h2 id="modal-title">${escapeHTML(hero.i)} ${escapeHTML(hero.n)}</h2><p class="muted">${escapeHTML(hero.r)} · Rank ${escapeHTML(hero.rank)}</p><div class="sheet">${hero.stats.map(([name,value]) => `<div><small>${escapeHTML(name)}</small><b>${escapeHTML(value)}</b></div>`).join('')}${abilityCards}</div><h3>Traits</h3><ul>${hero.traits.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul><h3>Tags</h3><div class="chips">${hero.tags.map(item => `<span class="chip">${escapeHTML(item)}</span>`).join('')}</div><div class="editbuttons"><button class="savebtn" type="button" data-action="edit-hero" data-index="${index}">EDITAR FICHA</button></div>`);
  }

  function editHero(index) {
    const hero = state.heroes[index];
    if (!hero) return;
    const abilityInputs = ABILITIES.map(name => `<label>${name}<input id="e-ability-${name}" type="number" min="-20" max="30" value="${escapeHTML(abilityValue(hero,name))}"></label>`).join('');
    openModal(`<h2 id="modal-title">Editar ${escapeHTML(hero.n)}</h2><div class="editgrid">
      <label>Nome<input id="e-name" value="${escapeHTML(hero.n)}" maxlength="60"></label><label>Identidade<input id="e-real" value="${escapeHTML(hero.r)}" maxlength="80"></label>
      <label>Rank<input id="e-rank" type="number" min="1" max="6" value="${escapeHTML(hero.rank)}"></label><label>Health<input id="e-health" type="number" min="0" max="9999" value="${escapeHTML(statValue(hero,'Health'))}"></label>
      <label>Focus<input id="e-focus" type="number" min="0" max="9999" value="${escapeHTML(statValue(hero,'Focus'))}"></label><label>Karma<input id="e-karma" type="number" min="0" max="99" value="${escapeHTML(statValue(hero,'Karma'))}"></label>
      <div class="full ability-editor"><small>HABILIDADES (MARVEL)</small>${abilityInputs}</div>
      <label class="full">Traits — separados por vírgula<textarea id="e-traits">${escapeHTML(hero.traits.join(', '))}</textarea></label>
      <label class="full">Tags — separados por vírgula<textarea id="e-tags">${escapeHTML(hero.tags.join(', '))}</textarea></label>
      </div><div class="editbuttons"><button class="savebtn" type="button" data-action="save-hero" data-index="${index}">SALVAR ALTERAÇÕES</button><button type="button" data-action="view-hero" data-index="${index}">CANCELAR</button></div>`);
  }

  function saveHero(index) {
    const hero = state.heroes[index];
    if (!hero) return;
    hero.n = $('e-name').value.trim() || hero.n;
    hero.r = $('e-real').value.trim();
    hero.rank = clamp($('e-rank').value, 1, 6);
    hero.stats = [['Health',clamp($('e-health').value,0,9999)],['Focus',clamp($('e-focus').value,0,9999)],['Karma',clamp($('e-karma').value,0,99)]];
    ABILITIES.forEach(name => { hero.abilities[name] = clamp($(`e-ability-${name}`).value,-20,30); });
    hero.traits = $('e-traits').value.split(',').map(x => x.trim()).filter(Boolean).slice(0,30);
    hero.tags = $('e-tags').value.split(',').map(x => x.trim()).filter(Boolean).slice(0,30);
    saveJSON(STORAGE.heroes, state.heroes);
    renderHeroes();
    renderChallengeSummary();
    closeModal();
    markSaved('Herói salvo');
    toast('Ficha atualizada');
  }

  function viewVillain(index) {
    const villain = state.villains[index];
    if (!villain) return;
    const abilityCards = ABILITIES.map(name => `<div><small>${name}</small><b>${signed(abilityValue(villain,name))}</b><span>Def. ${abilityValue(villain,name)+10}</span></div>`).join('');
    openModal(`<h2 id="modal-title">${escapeHTML(villain.i)} ${escapeHTML(villain.n)}</h2><p class="muted">${escapeHTML(villain.r)} · Rank ${escapeHTML(villain.rank)} · ${escapeHTML(villain.tier)}</p>
      <div class="villain-resource-editor">
        <div><small>HEALTH ATUAL</small><b>${villain.currentHealth} / ${villain.maxHealth}</b><div><button type="button" data-action="adjust-villain" data-resource="health" data-delta="-10" data-index="${index}">−10</button><button type="button" data-action="adjust-villain" data-resource="health" data-delta="-5" data-index="${index}">−5</button><button type="button" data-action="adjust-villain" data-resource="health" data-delta="5" data-index="${index}">+5</button><button type="button" data-action="adjust-villain" data-resource="health" data-delta="10" data-index="${index}">+10</button></div></div>
        <div><small>FOCUS ATUAL</small><b>${villain.currentFocus} / ${villain.maxFocus}</b><div><button type="button" data-action="adjust-villain" data-resource="focus" data-delta="-10" data-index="${index}">−10</button><button type="button" data-action="adjust-villain" data-resource="focus" data-delta="-5" data-index="${index}">−5</button><button type="button" data-action="adjust-villain" data-resource="focus" data-delta="5" data-index="${index}">+5</button><button type="button" data-action="adjust-villain" data-resource="focus" data-delta="10" data-index="${index}">+10</button></div></div>
      </div>
      <div class="sheet villain-sheet">${abilityCards}<div><small>RED. HEALTH</small><b>${escapeHTML(villain.healthDR)}</b></div><div><small>RED. FOCUS</small><b>${escapeHTML(villain.focusDR)}</b></div><div><small>INICIATIVA</small><b>${escapeHTML(villain.initiative)}</b></div></div>
      <div class="dossier-grid"><div><h3>Perfil</h3><p><b>Ocupação:</b> ${escapeHTML(villain.occupation)}</p><p><b>Origem:</b> ${escapeHTML(villain.origin)}</p><p><b>Equipes:</b> ${escapeHTML(villain.teams)}</p><p><b>Base:</b> ${escapeHTML(villain.base)}</p></div><div><h3>Função na campanha</h3><p>${escapeHTML(villain.role)}</p><p>${escapeHTML(villain.hook)}</p><p><b>Velocidade:</b> ${escapeHTML(villain.speed)}</p></div></div>
      <h3>Poderes</h3><div class="chips power-chips">${villain.powers.map(item => `<span class="chip">${escapeHTML(item)}</span>`).join('')}</div>
      <div class="dossier-grid"><div><h3>Traits</h3><ul>${villain.traits.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul></div><div><h3>Tags</h3><ul>${villain.tags.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul></div></div>
      <div class="editbuttons"><button class="savebtn" type="button" data-action="edit-villain" data-index="${index}">EDITAR FICHA</button><button type="button" data-action="roll-with-villain" data-index="${index}">ROLAR COM ESTE VILÃO</button></div>`);
  }

  function editVillain(index) {
    const villain = state.villains[index];
    if (!villain) return;
    const abilityInputs = ABILITIES.map(name => `<label>${name}<input id="v-e-ability-${name}" type="number" min="-20" max="30" value="${escapeHTML(abilityValue(villain,name))}"></label>`).join('');
    openModal(`<h2 id="modal-title">Editar ${escapeHTML(villain.n)}</h2><div class="editgrid">
      <label>Nome<input id="v-e-name" value="${escapeHTML(villain.n)}" maxlength="60"></label><label>Identidade<input id="v-e-real" value="${escapeHTML(villain.r)}" maxlength="80"></label>
      <label>Rank<input id="v-e-rank" type="number" min="1" max="6" value="${escapeHTML(villain.rank)}"></label><label>Tier<input id="v-e-tier" value="${escapeHTML(villain.tier)}" maxlength="30"></label>
      <label>Health máximo<input id="v-e-health" type="number" min="0" max="9999" value="${escapeHTML(villain.maxHealth)}"></label><label>Health atual<input id="v-e-current-health" type="number" min="0" max="9999" value="${escapeHTML(villain.currentHealth)}"></label>
      <label>Focus máximo<input id="v-e-focus" type="number" min="0" max="9999" value="${escapeHTML(villain.maxFocus)}"></label><label>Focus atual<input id="v-e-current-focus" type="number" min="0" max="9999" value="${escapeHTML(villain.currentFocus)}"></label>
      <label>Red. dano Health<input id="v-e-health-dr" value="${escapeHTML(villain.healthDR)}"></label><label>Red. dano Focus<input id="v-e-focus-dr" value="${escapeHTML(villain.focusDR)}"></label>
      <label>Iniciativa<input id="v-e-init" value="${escapeHTML(villain.initiative)}"></label><label>Velocidade<input id="v-e-speed" value="${escapeHTML(villain.speed)}"></label>
      <label>Ocupação<input id="v-e-occupation" value="${escapeHTML(villain.occupation)}"></label><label>Origem<input id="v-e-origin" value="${escapeHTML(villain.origin)}"></label>
      <label>Equipes<input id="v-e-teams" value="${escapeHTML(villain.teams)}"></label><label>Base<input id="v-e-base" value="${escapeHTML(villain.base)}"></label>
      <label class="full">Função na campanha<input id="v-e-role" value="${escapeHTML(villain.role)}"></label><label class="full">Gancho<input id="v-e-hook" value="${escapeHTML(villain.hook)}"></label>
      <div class="full ability-editor"><small>HABILIDADES (MARVEL)</small>${abilityInputs}</div>
      <label class="full">Poderes — separados por vírgula<textarea id="v-e-powers">${escapeHTML(villain.powers.join(', '))}</textarea></label>
      <label class="full">Traits — separados por vírgula<textarea id="v-e-traits">${escapeHTML(villain.traits.join(', '))}</textarea></label>
      <label class="full">Tags — separados por vírgula<textarea id="v-e-tags">${escapeHTML(villain.tags.join(', '))}</textarea></label>
      </div><div class="editbuttons"><button class="savebtn" type="button" data-action="save-villain" data-index="${index}">SALVAR ALTERAÇÕES</button><button type="button" data-action="view-villain" data-index="${index}">CANCELAR</button></div>`);
  }

  function saveVillain(index) {
    const villain = state.villains[index];
    if (!villain) return;
    villain.n = $('v-e-name').value.trim() || villain.n; villain.r = $('v-e-real').value.trim(); villain.rank = clamp($('v-e-rank').value,1,6); villain.tier = $('v-e-tier').value.trim() || 'AMEAÇA';
    villain.maxHealth = clamp($('v-e-health').value,0,9999); villain.maxFocus = clamp($('v-e-focus').value,0,9999);
    villain.currentHealth = Math.min(clamp($('v-e-current-health').value,0,9999),villain.maxHealth); villain.currentFocus = Math.min(clamp($('v-e-current-focus').value,0,9999),villain.maxFocus);
    villain.healthDR = $('v-e-health-dr').value.trim() || '—'; villain.focusDR = $('v-e-focus-dr').value.trim() || '—'; villain.initiative = $('v-e-init').value.trim() || '+0'; villain.speed = $('v-e-speed').value.trim();
    villain.occupation = $('v-e-occupation').value.trim(); villain.origin = $('v-e-origin').value.trim(); villain.teams = $('v-e-teams').value.trim(); villain.base = $('v-e-base').value.trim(); villain.role = $('v-e-role').value.trim(); villain.hook = $('v-e-hook').value.trim();
    ABILITIES.forEach(name => { villain.abilities[name] = clamp($(`v-e-ability-${name}`).value,-20,30); });
    villain.powers = $('v-e-powers').value.split(',').map(x=>x.trim()).filter(Boolean).slice(0,60); villain.traits = $('v-e-traits').value.split(',').map(x=>x.trim()).filter(Boolean).slice(0,40); villain.tags = $('v-e-tags').value.split(',').map(x=>x.trim()).filter(Boolean).slice(0,40);
    saveJSON(STORAGE.villains,state.villains); renderVillains(); syncVillainChallengeInputs(); closeModal(); markSaved('Vilão salvo'); toast('Ficha do vilão atualizada');
  }

  function adjustVillain(index, resource, delta) {
    const villain = state.villains[index]; if (!villain) return;
    const key = resource === 'focus' ? 'currentFocus' : 'currentHealth'; const maxKey = resource === 'focus' ? 'maxFocus' : 'maxHealth';
    villain[key] = Math.min(villain[maxKey], Math.max(0, Number(villain[key] || 0) + Number(delta || 0)));
    saveJSON(STORAGE.villains,state.villains); renderVillains(); viewVillain(index); markSaved(`${resource === 'focus' ? 'Focus' : 'Health'} atualizado`);
  }

  function rollWithVillain(index) {
    const villain = state.villains[index]; if (!villain) return;
    state.villainChallenge.actor = villain.id;
    saveJSON(STORAGE.villainChallenge, state.villainChallenge);
    closeModal(); syncVillainChallengeInputs(); goToPage('villain-dice');
  }

  // -------------------- D616

  // -------------------- D616 --------------------
  function renderActorOptions() {
    const select = $('roll-actor');
    if (!select) return;
    const current = state.challenge.actor;
    select.innerHTML = state.heroes.map(hero => `<option value="${escapeHTML(hero.id)}">${escapeHTML(hero.n)}</option>`).join('');
    if (state.heroes.some(h => h.id === current)) select.value = current;
    else {
      state.challenge.actor = state.heroes[0]?.id || '';
      select.value = state.challenge.actor;
    }
  }

  function activeHero() { return state.heroes.find(hero => hero.id === state.challenge.actor) || state.heroes[0]; }

  function syncChallengeInputs() {
    renderActorOptions();
    $('action-name').value = state.challenge.action || 'Ação sem título';
    $('target-number').value = clamp(state.challenge.tn,1,99);
    $('roll-ability').value = ABILITIES.includes(state.challenge.ability) ? state.challenge.ability : 'Agility';
    $('extra-modifier').value = clamp(state.challenge.extra,-30,30);
    $('edge-count').value = clamp(state.challenge.edge,0,6);
    $('trouble-count').value = clamp(state.challenge.trouble,0,6);
    renderChallengeSummary();
  }

  function effectiveAdvantage() {
    const edge = clamp(state.challenge.edge,0,6);
    const trouble = clamp(state.challenge.trouble,0,6);
    return {edge,trouble,netEdge:Math.max(edge-trouble,0),netTrouble:Math.max(trouble-edge,0),cancelled:Math.min(edge,trouble)};
  }

  function renderChallengeSummary() {
    const hero = activeHero();
    const ability = ABILITIES.includes(state.challenge.ability) ? state.challenge.ability : 'Agility';
    const mod = abilityValue(hero, ability);
    const adv = effectiveAdvantage();
    $('challenge-title').textContent = state.challenge.action || 'Ação sem título';
    $('challenge-badge').textContent = `TN ${clamp(state.challenge.tn,1,99)}`;
    $('ability-modifier').textContent = signed(mod);
    $('challenge-actor').textContent = `${hero?.n || 'Personagem'} · ${ability} ${signed(mod)} · extra ${signed(state.challenge.extra)}`;
    const status = adv.netEdge ? `EDGE ×${adv.netEdge}` : adv.netTrouble ? `TROUBLE ×${adv.netTrouble}` : 'SEM EDGE / TROUBLE';
    $('advantage-state').textContent = status;
    $('advantage-state').className = adv.netEdge ? 'edge' : adv.netTrouble ? 'trouble' : '';
    if (adv.cancelled) $('advantage-explain').textContent = `${adv.edge} Edge e ${adv.trouble} Trouble se cancelam; resta ${adv.netEdge ? `${adv.netEdge} Edge` : adv.netTrouble ? `${adv.netTrouble} Trouble` : 'nenhum'}.`;
    else if (adv.netEdge) $('advantage-explain').textContent = `Após a rolagem, escolha um dado para rerrolar e mantenha o melhor. Repita ${adv.netEdge} vez${adv.netEdge === 1 ? '' : 'es'}.`;
    else if (adv.netTrouble) $('advantage-explain').textContent = `O melhor dado será rerrolado automaticamente e o pior resultado será mantido, ${adv.netTrouble} vez${adv.netTrouble === 1 ? '' : 'es'}.`;
    else $('advantage-explain').textContent = 'Nenhum modificador de circunstância.';
  }

  function saveChallengeFromControls() {
    state.challenge.action = $('action-name').value.trim() || 'Ação sem título';
    state.challenge.tn = clamp($('target-number').value,1,99);
    state.challenge.actor = $('roll-actor').value;
    state.challenge.ability = $('roll-ability').value;
    state.challenge.extra = clamp($('extra-modifier').value,-30,30);
    state.challenge.edge = clamp($('edge-count').value,0,6);
    state.challenge.trouble = clamp($('trouble-count').value,0,6);
    saveJSON(STORAGE.challenge, state.challenge);
    renderChallengeSummary();
    markSaved('Desafio salvo');
    clearCurrentRollVisual(false);
  }

  function setDiceMode(mode) {
    state.diceMode = mode;
    qsa('[data-dice-mode]').forEach(button => {
      const active = button.dataset.diceMode === mode;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    $('d616-panel').classList.toggle('active', mode === 'd616');
    $('generic-panel').classList.toggle('active', mode === 'generic');
  }

  const ROTATIONS = {
    1:'rotateX(0deg) rotateY(0deg) rotateZ(0deg)',
    2:'rotateX(-90deg) rotateY(0deg) rotateZ(0deg)',
    3:'rotateX(0deg) rotateY(-90deg) rotateZ(0deg)',
    4:'rotateX(0deg) rotateY(90deg) rotateZ(0deg)',
    5:'rotateX(90deg) rotateY(0deg) rotateZ(0deg)',
    6:'rotateX(0deg) rotateY(180deg) rotateZ(0deg)'
  };

  function cubeAt(index) { return $('dice').querySelector(`.cube[data-cube-index="${index}"]`); }
  function dieButtonAt(index) { return $('dice').querySelector(`.die-select[data-die-index="${index}"]`); }
  function dieName(index) { return index === 1 ? 'Marvel Die' : index === 0 ? 'D6 esquerdo' : 'D6 direito'; }
  function formatDie(value,index) { return index === 1 && value === 1 ? 'M' : String(value); }
  function scoringValue(value,index) { return index === 1 && value === 1 ? 6 : value; }
  function qualityValue(value,index) { return index === 1 && value === 1 ? 7 : value; }
  function isFantastic(values) { return values?.[1] === 1; }
  function isUltimate(values) { return values?.[0] === 6 && values?.[1] === 1 && values?.[2] === 6; }

  function setCubeValue(index,value) {
    const cube = cubeAt(index);
    if (!cube) return;
    cube.dataset.value = value;
    cube.style.transform = ROTATIONS[value] || ROTATIONS[1];
    dieButtonAt(index)?.setAttribute('aria-label', `${dieName(index)}: ${formatDie(value,index)}`);
  }

  function setDiceInteraction(enabled) {
    qsa('.die-select', $('dice')).forEach(button => {
      button.classList.toggle('edge-ready', enabled);
      button.disabled = !enabled;
    });
  }

  async function animateCube(index, duration = 700) {
    const cube = cubeAt(index);
    if (!cube) return;
    const ms = reducedMotion() ? 60 : duration;
    cube.style.setProperty('--spin-x', `${720 + rand(4)*360}deg`);
    cube.style.setProperty('--spin-y', `${720 + rand(5)*360}deg`);
    cube.style.setProperty('--spin-z', `${rand(3)*180}deg`);
    cube.style.setProperty('--roll-duration', `${ms}ms`);
    cube.classList.remove('rolling');
    void cube.offsetWidth;
    cube.classList.add('rolling');
    await sleep(ms);
    cube.classList.remove('rolling');
  }

  async function animateAllDice(values) {
    state.rolling = true;
    $('roll-d616').disabled = true;
    $('finalize-roll').disabled = true;
    setDiceInteraction(false);
    $('roll-guidance').textContent = 'Rolando D616...';
    await Promise.all(values.map((_,i) => animateCube(i, 820 + i*70)));
    values.forEach((value,index) => setCubeValue(index,value));
    state.rolling = false;
    $('roll-d616').disabled = false;
    $('finalize-roll').disabled = false;
  }

  function rollMath(roll) {
    const diceTotal = roll.values.reduce((sum,value,index) => sum + scoringValue(value,index),0);
    const ability = Number(roll.snapshot.abilityMod) || 0;
    const extra = Number(roll.snapshot.extra) || 0;
    return {diceTotal,ability,extra,total:diceTotal+ability+extra};
  }

  function evaluateRoll(roll) {
    const math = rollMath(roll);
    const tn = clamp(roll.snapshot.tn,1,99);
    if (isUltimate(roll.values)) return {key:'ultimate',label:'ULTIMATE FANTASTIC SUCCESS',success:true,fantastic:true,detail:'6 · M · 6: sucesso automático, independentemente do TN.'};
    if (isFantastic(roll.values)) {
      return math.total >= tn
        ? {key:'fantastic-success',label:'FANTASTIC SUCCESS',success:true,fantastic:true,detail:`Resultado ${math.total} alcançou o TN ${tn}.`}
        : {key:'fantastic-failure',label:'FANTASTIC FAILURE',success:false,fantastic:true,detail:`Resultado ${math.total} ficou abaixo do TN ${tn}, mas o Marvel Die gerou um resultado Fantastic.`};
    }
    return math.total >= tn
      ? {key:'success',label:'SUCESSO',success:true,fantastic:false,detail:`Resultado ${math.total} alcançou o TN ${tn}.`}
      : {key:'failure',label:'FALHA',success:false,fantastic:false,detail:`Resultado ${math.total} ficou abaixo do TN ${tn}.`};
  }

  function rollDetail(roll) {
    const dice = roll.values.map((value,index) => formatDie(value,index)).join(' + ');
    const marvelNote = roll.values[1] === 1 ? 'M=6' : `Marvel=${roll.values[1]}`;
    return `${dice} (${marvelNote}) ${signed(roll.snapshot.abilityMod)} habilidade ${signed(roll.snapshot.extra)} extra`;
  }

  function renderCurrentRoll() {
    const roll = state.currentRoll;
    if (!roll) return clearCurrentRollVisual(false);
    roll.values.forEach((value,index) => setCubeValue(index,value));
    const math = rollMath(roll);
    const outcome = evaluateRoll(roll);
    $('d616-total').textContent = math.total;
    $('d616-detail').textContent = `${rollDetail(roll)} = ${math.total}`;
    const out = $('roll-outcome');
    out.className = `roll-outcome ${outcome.key}${roll.finalized ? '' : ' provisional'}`;
    out.querySelector('b').textContent = roll.finalized ? outcome.label : `${outcome.label} · PROVISÓRIO`;
    $('roll-outcome-detail').textContent = outcome.detail;
    $('reroll-log').innerHTML = roll.logs.map(item => `<div class="reroll-event ${item.kind}"><b>${escapeHTML(item.title)}</b><span>${escapeHTML(item.text)}</span></div>`).join('');

    if (!roll.finalized && roll.edgeRemaining > 0 && !isUltimate(roll.values)) {
      $('roll-guidance').textContent = `Edge restante: ${roll.edgeRemaining}. Clique em qualquer dado para rerrolá-lo e manter o melhor resultado — ou finalize sem gastar todos.`;
      $('finalize-roll').classList.remove('hidden');
      setDiceInteraction(!state.rolling);
    } else {
      $('finalize-roll').classList.add('hidden');
      setDiceInteraction(false);
      $('roll-guidance').textContent = roll.finalized ? 'Rolagem finalizada e registrada no histórico.' : 'Processando rolagem...';
    }
  }

  function clearCurrentRollVisual(resetCubes = true) {
    state.currentRoll = null;
    $('d616-total').textContent = '—';
    $('d616-detail').textContent = 'D616 + habilidade + modificadores';
    $('roll-outcome').className = 'roll-outcome neutral';
    $('roll-outcome').querySelector('b').textContent = 'AGUARDANDO ROLAGEM';
    $('roll-outcome-detail').textContent = 'O resultado será comparado ao TN configurado.';
    $('roll-guidance').textContent = 'Configure a ação e role os dados.';
    $('reroll-log').innerHTML = '';
    $('finalize-roll').classList.add('hidden');
    setDiceInteraction(false);
    if (resetCubes) [1,1,1].forEach((value,index) => setCubeValue(index,value));
  }

  async function applyTroubleOnce(roll) {
    let best = 0;
    for (let i=1;i<3;i++) if (qualityValue(roll.values[i],i) > qualityValue(roll.values[best],best)) best = i;
    const before = roll.values[best];
    const rerolled = rand(6);
    await animateCube(best, 520);
    const kept = qualityValue(rerolled,best) < qualityValue(before,best) ? rerolled : before;
    roll.values[best] = kept;
    setCubeValue(best,kept);
    roll.logs.push({kind:'trouble',title:`Trouble · ${dieName(best)}`,text:`${formatDie(before,best)} → ${formatDie(rerolled,best)}; manteve o pior: ${formatDie(kept,best)}.`});
    renderCurrentRoll();
  }

  async function rollD616() {
    if (state.rolling) return;
    saveChallengeFromControls();
    const hero = activeHero();
    const adv = effectiveAdvantage();
    const snapshot = {
      action:state.challenge.action, tn:state.challenge.tn, edge:state.challenge.edge, trouble:state.challenge.trouble,
      actorId:hero?.id || '', actorName:hero?.n || 'Personagem', ability:state.challenge.ability,
      abilityMod:abilityValue(hero,state.challenge.ability), extra:state.challenge.extra,
      netEdge:adv.netEdge, netTrouble:adv.netTrouble
    };
    const roll = {
      id:Date.now(), values:[rand(6),rand(6),rand(6)], snapshot,
      edgeRemaining:adv.netEdge, troubleRemaining:adv.netTrouble, logs:[], finalized:false
    };
    state.currentRoll = roll;
    $('reroll-log').innerHTML = '';
    await animateAllDice(roll.values);

    if (roll.troubleRemaining > 0) {
      state.rolling = true;
      $('roll-d616').disabled = true;
      $('finalize-roll').disabled = true;
    }
    if (isUltimate(roll.values) && roll.troubleRemaining > 0) {
      roll.logs.push({kind:'fantastic',title:'Ultimate Fantastic',text:`6 · M · 6 ignora ${roll.troubleRemaining} Trouble.`});
      roll.troubleRemaining = 0;
    } else {
      while (roll.troubleRemaining > 0) {
        roll.troubleRemaining -= 1;
        await applyTroubleOnce(roll);
      }
    }
    state.rolling = false;
    $('roll-d616').disabled = false;
    $('finalize-roll').disabled = false;
    renderCurrentRoll();
    if (roll.edgeRemaining === 0 || isUltimate(roll.values)) finalizeCurrentRoll();
  }

  async function useEdge(index) {
    const roll = state.currentRoll;
    if (!roll || roll.finalized || roll.edgeRemaining <= 0 || state.rolling || isUltimate(roll.values)) return;
    state.rolling = true;
    setDiceInteraction(false);
    $('roll-d616').disabled = true;
    $('finalize-roll').disabled = true;
    const before = roll.values[index];
    const rerolled = rand(6);
    await animateCube(index, 540);
    const kept = qualityValue(rerolled,index) > qualityValue(before,index) ? rerolled : before;
    roll.values[index] = kept;
    roll.edgeRemaining -= 1;
    roll.logs.push({kind:'edge',title:`Edge · ${dieName(index)}`,text:`${formatDie(before,index)} → ${formatDie(rerolled,index)}; manteve o melhor: ${formatDie(kept,index)}.`});
    setCubeValue(index,kept);
    state.rolling = false;
    $('roll-d616').disabled = false;
    $('finalize-roll').disabled = false;
    renderCurrentRoll();
    if (roll.edgeRemaining === 0 || isUltimate(roll.values)) finalizeCurrentRoll();
  }

  function finalizeCurrentRoll() {
    const roll = state.currentRoll;
    if (!roll || roll.finalized) return;
    roll.finalized = true;
    const outcome = evaluateRoll(roll);
    const math = rollMath(roll);
    addHistory({
      type:'D616', label:`${roll.snapshot.actorName} · ${roll.snapshot.ability}`,
      action:roll.snapshot.action, tn:roll.snapshot.tn,
      detail:`${roll.values.map((v,i)=>formatDie(v,i)).join(' · ')} | ${signed(roll.snapshot.abilityMod)} hab. | ${signed(roll.snapshot.extra)} extra | TN ${roll.snapshot.tn}`,
      total:math.total, outcome:outcome.label, outcomeKey:outcome.key, at:Date.now()
    });
    renderCurrentRoll();
  }

  function addHistory(entry) {
    state.diceHistory.unshift(entry);
    state.diceHistory = state.diceHistory.slice(0, 50);
    saveJSON(STORAGE.dice, state.diceHistory);
    renderDiceHistory(true);
  }

  function renderDiceHistory(markNewest = false) {
    if (!state.diceHistory.length) {
      $('history').innerHTML = '<div class="history-empty">Nenhuma rolagem registrada ainda.</div>';
      return;
    }
    $('history').innerHTML = state.diceHistory.map((entry,index) => {
      const resultClass = entry.outcomeKey || '';
      const action = entry.action ? `<small>${escapeHTML(entry.action)} · ${escapeHTML(entry.detail || '')}</small>` : `<small>${escapeHTML(entry.detail || '')}</small>`;
      const outcome = entry.outcome ? `<span class="history-outcome ${escapeHTML(resultClass)}">${escapeHTML(entry.outcome)}</span>` : '';
      return `<div class="historyrow ${markNewest && index === 0 ? 'new' : ''}"><span class="history-icon">${entry.type === 'D616' ? 'A' : '⚄'}</span><div><b>${escapeHTML(entry.label)}</b>${action}${outcome}</div><strong>${escapeHTML(entry.total)}</strong></div>`;
    }).join('');
  }

  function rollGeneric() {
    const sides = clamp($('die').value,2,1000);
    const quantity = clamp($('qty').value,1,20);
    $('qty').value = quantity;
    const values = Array.from({length:quantity},() => rand(sides));
    const total = values.reduce((sum,value)=>sum+value,0);
    const result = $('generic-result');
    const totalEl = result.querySelector('strong');
    totalEl.textContent = '…';
    result.classList.add('pulse');
    setTimeout(() => {
      totalEl.textContent = total;
      $('generic-detail').textContent = `${quantity}d${sides} → [${values.join(', ')}]`;
      result.classList.remove('pulse');
      addHistory({type:'GEN',label:`${quantity}d${sides}`,detail:`[${values.join(', ')}]`,total,at:Date.now()});
    }, reducedMotion() ? 10 : 180);
  }


  // -------------------- D616 dos vilões --------------------
  function activeVillain() { return state.villains.find(v => v.id === state.villainChallenge.actor) || state.villains[0]; }
  function renderVillainActorOptions() {
    const select = $('v-roll-actor'); if (!select) return; const current = state.villainChallenge.actor;
    select.innerHTML = state.villains.map(v => `<option value="${escapeHTML(v.id)}">${escapeHTML(v.n)}</option>`).join('');
    if (state.villains.some(v=>v.id===current)) select.value=current; else { state.villainChallenge.actor=state.villains[0]?.id||''; select.value=state.villainChallenge.actor; }
  }
  function villainAdvantage() {
    const edge=clamp(state.villainChallenge.edge,0,6), trouble=clamp(state.villainChallenge.trouble,0,6);
    return {edge,trouble,netEdge:Math.max(edge-trouble,0),netTrouble:Math.max(trouble-edge,0),cancelled:Math.min(edge,trouble)};
  }
  function syncVillainChallengeInputs() {
    if (!$('v-roll-actor')) return; renderVillainActorOptions();
    $('v-action-name').value=state.villainChallenge.action||'Ação do vilão'; $('v-target-number').value=clamp(state.villainChallenge.tn,1,99);
    $('v-roll-ability').value=ABILITIES.includes(state.villainChallenge.ability)?state.villainChallenge.ability:'Melee'; $('v-extra-modifier').value=clamp(state.villainChallenge.extra,-30,30); $('v-edge-count').value=clamp(state.villainChallenge.edge,0,6); $('v-trouble-count').value=clamp(state.villainChallenge.trouble,0,6); renderVillainChallengeSummary();
  }
  function renderVillainChallengeSummary() {
    if (!$('v-challenge-title')) return; const villain=activeVillain(), ability=ABILITIES.includes(state.villainChallenge.ability)?state.villainChallenge.ability:'Melee', mod=abilityValue(villain,ability), adv=villainAdvantage();
    $('v-challenge-title').textContent=state.villainChallenge.action||'Ação do vilão'; $('v-challenge-badge').textContent=`TN ${clamp(state.villainChallenge.tn,1,99)}`; $('v-ability-modifier').textContent=signed(mod); $('v-challenge-actor').textContent=`${villain?.n||'Vilão'} · ${ability} ${signed(mod)} · extra ${signed(state.villainChallenge.extra)}`;
    const status=adv.netEdge?`EDGE ×${adv.netEdge}`:adv.netTrouble?`TROUBLE ×${adv.netTrouble}`:'SEM EDGE / TROUBLE'; $('v-advantage-state').textContent=status; $('v-advantage-state').className=adv.netEdge?'edge':adv.netTrouble?'trouble':'';
    if(adv.cancelled)$('v-advantage-explain').textContent=`${adv.edge} Edge e ${adv.trouble} Trouble se cancelam; resta ${adv.netEdge?`${adv.netEdge} Edge`:adv.netTrouble?`${adv.netTrouble} Trouble`:'nenhum'}.`;
    else if(adv.netEdge)$('v-advantage-explain').textContent=`Após a rolagem, escolha um dado para rerrolar e mantenha o melhor. Repita ${adv.netEdge} vez${adv.netEdge===1?'':'es'}.`;
    else if(adv.netTrouble)$('v-advantage-explain').textContent=`O melhor dado será rerrolado automaticamente e o pior resultado será mantido, ${adv.netTrouble} vez${adv.netTrouble===1?'':'es'}.`;
    else $('v-advantage-explain').textContent='Nenhum modificador de circunstância.';
  }
  function saveVillainChallengeFromControls() {
    state.villainChallenge.action=$('v-action-name').value.trim()||'Ação do vilão'; state.villainChallenge.tn=clamp($('v-target-number').value,1,99); state.villainChallenge.actor=$('v-roll-actor').value; state.villainChallenge.ability=$('v-roll-ability').value; state.villainChallenge.extra=clamp($('v-extra-modifier').value,-30,30); state.villainChallenge.edge=clamp($('v-edge-count').value,0,6); state.villainChallenge.trouble=clamp($('v-trouble-count').value,0,6); saveJSON(STORAGE.villainChallenge,state.villainChallenge); renderVillainChallengeSummary(); markSaved('Rolagem do vilão salva'); clearCurrentVillainRollVisual(false);
  }
  function vCubeAt(index){return $('villain-dice').querySelector(`.cube[data-v-cube-index="${index}"]`)}
  function vDieButtonAt(index){return $('villain-dice').querySelector(`.die-select[data-v-die-index="${index}"]`)}
  function setVillainCubeValue(index,value){const cube=vCubeAt(index);if(!cube)return;cube.dataset.value=value;cube.style.transform=ROTATIONS[value]||ROTATIONS[1];vDieButtonAt(index)?.setAttribute('aria-label',`${dieName(index)}: ${formatDie(value,index)}`)}
  function setVillainDiceInteraction(enabled){qsa('.die-select',$('villain-dice')).forEach(button=>{button.classList.toggle('edge-ready',enabled);button.disabled=!enabled})}
  async function animateVillainCube(index,duration=700){const cube=vCubeAt(index);if(!cube)return;const ms=reducedMotion()?60:duration;cube.style.setProperty('--spin-x',`${720+rand(4)*360}deg`);cube.style.setProperty('--spin-y',`${720+rand(5)*360}deg`);cube.style.setProperty('--spin-z',`${rand(3)*180}deg`);cube.style.setProperty('--roll-duration',`${ms}ms`);cube.classList.remove('rolling');void cube.offsetWidth;cube.classList.add('rolling');await sleep(ms);cube.classList.remove('rolling')}
  async function animateAllVillainDice(values){state.villainRolling=true;$('v-roll-d616').disabled=true;$('v-finalize-roll').disabled=true;setVillainDiceInteraction(false);$('v-roll-guidance').textContent='Rolando D616 do vilão...';await Promise.all(values.map((_,i)=>animateVillainCube(i,820+i*70)));values.forEach((v,i)=>setVillainCubeValue(i,v));state.villainRolling=false;$('v-roll-d616').disabled=false;$('v-finalize-roll').disabled=false}
  function villainRollMath(roll){const diceTotal=roll.values.reduce((sum,value,index)=>sum+scoringValue(value,index),0),ability=Number(roll.snapshot.abilityMod)||0,extra=Number(roll.snapshot.extra)||0;return{diceTotal,ability,extra,total:diceTotal+ability+extra}}
  function evaluateVillainRoll(roll){const math=villainRollMath(roll),tn=clamp(roll.snapshot.tn,1,99);if(isUltimate(roll.values))return{key:'ultimate',label:'ULTIMATE FANTASTIC SUCCESS',success:true,fantastic:true,detail:'6 · M · 6: sucesso automático, independentemente do TN.'};if(isFantastic(roll.values))return math.total>=tn?{key:'fantastic-success',label:'FANTASTIC SUCCESS',success:true,fantastic:true,detail:`Resultado ${math.total} alcançou o TN ${tn}.`}:{key:'fantastic-failure',label:'FANTASTIC FAILURE',success:false,fantastic:true,detail:`Resultado ${math.total} ficou abaixo do TN ${tn}, mas o Marvel Die gerou um resultado Fantastic.`};return math.total>=tn?{key:'success',label:'SUCESSO',success:true,fantastic:false,detail:`Resultado ${math.total} alcançou o TN ${tn}.`}:{key:'failure',label:'FALHA',success:false,fantastic:false,detail:`Resultado ${math.total} ficou abaixo do TN ${tn}.`}}
  function villainRollDetail(roll){const dice=roll.values.map((v,i)=>formatDie(v,i)).join(' + '),marvelNote=roll.values[1]===1?'M=6':`Marvel=${roll.values[1]}`;return`${dice} (${marvelNote}) ${signed(roll.snapshot.abilityMod)} habilidade ${signed(roll.snapshot.extra)} extra`}
  function renderCurrentVillainRoll(){const roll=state.villainCurrentRoll;if(!roll)return clearCurrentVillainRollVisual(false);roll.values.forEach((v,i)=>setVillainCubeValue(i,v));const math=villainRollMath(roll),outcome=evaluateVillainRoll(roll);$('v-d616-total').textContent=math.total;$('v-d616-detail').textContent=`${villainRollDetail(roll)} = ${math.total}`;const out=$('v-roll-outcome');out.className=`roll-outcome ${outcome.key}${roll.finalized?'':' provisional'}`;out.querySelector('b').textContent=roll.finalized?outcome.label:`${outcome.label} · PROVISÓRIO`;$('v-roll-outcome-detail').textContent=outcome.detail;$('v-reroll-log').innerHTML=roll.logs.map(item=>`<div class="reroll-event ${item.kind}"><b>${escapeHTML(item.title)}</b><span>${escapeHTML(item.text)}</span></div>`).join('');if(!roll.finalized&&roll.edgeRemaining>0&&!isUltimate(roll.values)){$('v-roll-guidance').textContent=`Edge restante: ${roll.edgeRemaining}. Clique em qualquer dado para rerrolá-lo e manter o melhor resultado — ou finalize sem gastar todos.`;$('v-finalize-roll').classList.remove('hidden');setVillainDiceInteraction(!state.villainRolling)}else{$('v-finalize-roll').classList.add('hidden');setVillainDiceInteraction(false);$('v-roll-guidance').textContent=roll.finalized?'Rolagem do vilão finalizada e registrada.':'Processando rolagem...'}}
  function clearCurrentVillainRollVisual(resetCubes=true){state.villainCurrentRoll=null;if(!$('v-d616-total'))return;$('v-d616-total').textContent='—';$('v-d616-detail').textContent='D616 + habilidade + modificadores';$('v-roll-outcome').className='roll-outcome neutral';$('v-roll-outcome').querySelector('b').textContent='AGUARDANDO ROLAGEM';$('v-roll-outcome-detail').textContent='O resultado será comparado ao TN configurado.';$('v-roll-guidance').textContent='Configure a ação do vilão e role os dados.';$('v-reroll-log').innerHTML='';$('v-finalize-roll').classList.add('hidden');setVillainDiceInteraction(false);if(resetCubes)[1,1,1].forEach((v,i)=>setVillainCubeValue(i,v))}
  async function applyVillainTroubleOnce(roll){let best=0;for(let i=1;i<3;i++)if(qualityValue(roll.values[i],i)>qualityValue(roll.values[best],best))best=i;const before=roll.values[best],rerolled=rand(6);await animateVillainCube(best,520);const kept=qualityValue(rerolled,best)<qualityValue(before,best)?rerolled:before;roll.values[best]=kept;setVillainCubeValue(best,kept);roll.logs.push({kind:'trouble',title:`Trouble · ${dieName(best)}`,text:`${formatDie(before,best)} → ${formatDie(rerolled,best)}; manteve o pior: ${formatDie(kept,best)}.`});renderCurrentVillainRoll()}
  async function rollVillainD616(){if(state.villainRolling)return;saveVillainChallengeFromControls();const villain=activeVillain(),adv=villainAdvantage(),snapshot={action:state.villainChallenge.action,tn:state.villainChallenge.tn,edge:state.villainChallenge.edge,trouble:state.villainChallenge.trouble,actorId:villain?.id||'',actorName:villain?.n||'Vilão',ability:state.villainChallenge.ability,abilityMod:abilityValue(villain,state.villainChallenge.ability),extra:state.villainChallenge.extra,netEdge:adv.netEdge,netTrouble:adv.netTrouble},roll={id:Date.now(),values:[rand(6),rand(6),rand(6)],snapshot,edgeRemaining:adv.netEdge,troubleRemaining:adv.netTrouble,logs:[],finalized:false};state.villainCurrentRoll=roll;$('v-reroll-log').innerHTML='';await animateAllVillainDice(roll.values);if(roll.troubleRemaining>0){state.villainRolling=true;$('v-roll-d616').disabled=true;$('v-finalize-roll').disabled=true}if(isUltimate(roll.values)&&roll.troubleRemaining>0){roll.logs.push({kind:'fantastic',title:'Ultimate Fantastic',text:`6 · M · 6 ignora ${roll.troubleRemaining} Trouble.`});roll.troubleRemaining=0}else while(roll.troubleRemaining>0){roll.troubleRemaining-=1;await applyVillainTroubleOnce(roll)}state.villainRolling=false;$('v-roll-d616').disabled=false;$('v-finalize-roll').disabled=false;renderCurrentVillainRoll();if(roll.edgeRemaining===0||isUltimate(roll.values))finalizeCurrentVillainRoll()}
  async function useVillainEdge(index){const roll=state.villainCurrentRoll;if(!roll||roll.finalized||roll.edgeRemaining<=0||state.villainRolling||isUltimate(roll.values))return;state.villainRolling=true;setVillainDiceInteraction(false);$('v-roll-d616').disabled=true;$('v-finalize-roll').disabled=true;const before=roll.values[index],rerolled=rand(6);await animateVillainCube(index,540);const kept=qualityValue(rerolled,index)>qualityValue(before,index)?rerolled:before;roll.values[index]=kept;roll.edgeRemaining-=1;roll.logs.push({kind:'edge',title:`Edge · ${dieName(index)}`,text:`${formatDie(before,index)} → ${formatDie(rerolled,index)}; manteve o melhor: ${formatDie(kept,index)}.`});setVillainCubeValue(index,kept);state.villainRolling=false;$('v-roll-d616').disabled=false;$('v-finalize-roll').disabled=false;renderCurrentVillainRoll();if(roll.edgeRemaining===0||isUltimate(roll.values))finalizeCurrentVillainRoll()}
  function finalizeCurrentVillainRoll(){const roll=state.villainCurrentRoll;if(!roll||roll.finalized)return;roll.finalized=true;const outcome=evaluateVillainRoll(roll),math=villainRollMath(roll);state.villainDiceHistory.unshift({type:'D616',label:`${roll.snapshot.actorName} · ${roll.snapshot.ability}`,action:roll.snapshot.action,tn:roll.snapshot.tn,detail:`${roll.values.map((v,i)=>formatDie(v,i)).join(' · ')} | ${signed(roll.snapshot.abilityMod)} hab. | ${signed(roll.snapshot.extra)} extra | TN ${roll.snapshot.tn}`,total:math.total,outcome:outcome.label,outcomeKey:outcome.key,at:Date.now()});state.villainDiceHistory=state.villainDiceHistory.slice(0,50);saveJSON(STORAGE.villainDice,state.villainDiceHistory);renderVillainDiceHistory(true);renderCurrentVillainRoll()}
  function renderVillainDiceHistory(markNewest=false){if(!$('v-history'))return;if(!state.villainDiceHistory.length){$('v-history').innerHTML='<div class="history-empty">Nenhuma rolagem de vilão registrada ainda.</div>';return}$('v-history').innerHTML=state.villainDiceHistory.map((entry,index)=>{const resultClass=entry.outcomeKey||'',action=entry.action?`<small>${escapeHTML(entry.action)} · ${escapeHTML(entry.detail||'')}</small>`:`<small>${escapeHTML(entry.detail||'')}</small>`,outcome=entry.outcome?`<span class="history-outcome ${escapeHTML(resultClass)}">${escapeHTML(entry.outcome)}</span>`:'';return`<div class="historyrow ${markNewest&&index===0?'new':''}"><span class="history-icon">☠</span><div><b>${escapeHTML(entry.label)}</b>${action}${outcome}</div><strong>${escapeHTML(entry.total)}</strong></div>`}).join('')}

  // -------------------- Notes / export --------------------
  function activeNotesKey() { return state.role === 'master' ? STORAGE.notesMaster : STORAGE.notesPlayer; }
  function loadNotesForRole() {
    if (!$('notes-text')) return;
    $('notes-text').value = localStorage.getItem(activeNotesKey()) || '';
    updateNotesCount();
    $('notes-export-status').textContent = state.role === 'master' ? 'Bloco privado do Mestre' : 'Bloco do Jogador';
  }

  function updateNotesCount() {
    const text = $('notes-text').value;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    $('notes-count').textContent = `${words} palavra${words === 1 ? '' : 's'} · ${text.length} caractere${text.length === 1 ? '' : 's'}`;
  }

  function exportStamp() {
    const now = new Date();
    const z = n => String(n).padStart(2,'0');
    return `${now.getFullYear()}-${z(now.getMonth()+1)}-${z(now.getDate())}_${z(now.getHours())}-${z(now.getMinutes())}`;
  }

  function downloadText(filename, content, type='text/plain;charset=utf-8') {
    const blob = new Blob([content], {type});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function copyNotes() {
    const text = $('notes-text').value;
    if (!text) return toast('Não há anotações para copiar');
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
      else throw new Error('fallback');
    } catch {
      const temp = document.createElement('textarea');
      temp.value = text;
      temp.setAttribute('readonly','');
      temp.style.position = 'absolute';
      temp.style.left = '-9999px';
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      temp.remove();
    }
    $('notes-export-status').textContent = 'Copiado agora';
    toast('Todas as anotações foram copiadas');
  }

  function notesMarkdown() {
    const role = state.role === 'master' ? 'Mestre' : 'Jogador';
    const date = new Date().toLocaleString('pt-BR');
    return `# Projeto Arachne — Anotações\n\n**Perfil:** ${role}  \n**Exportado em:** ${date}\n\n---\n\n${$('notes-text').value || ''}\n`;
  }

  function exportNotes(format) {
    const text = $('notes-text').value;
    if (!text) return toast('Não há anotações para exportar');
    const stamp = exportStamp();
    if (format === 'md') downloadText(`projeto-arachne-anotacoes_${stamp}.md`, notesMarkdown(), 'text/markdown;charset=utf-8');
    else downloadText(`projeto-arachne-anotacoes_${stamp}.txt`, text, 'text/plain;charset=utf-8');
    $('notes-export-status').textContent = `Exportado ${format.toUpperCase()}`;
    toast(`Anotações exportadas em .${format}`);
  }

  function exportBackup() {
    const backup = {
      app:'Projeto Arachne', version:APP_VERSION, exportedAt:new Date().toISOString(), role:state.role,
      notes:$('notes-text').value, heroes:state.heroes, villains:state.villains, campaign:state.campaign,
      challenge:state.challenge, diceHistory:state.diceHistory, villainChallenge:state.villainChallenge, villainDiceHistory:state.villainDiceHistory
    };
    downloadText(`projeto-arachne-backup_${exportStamp()}.json`, JSON.stringify(backup,null,2), 'application/json;charset=utf-8');
    $('notes-export-status').textContent = 'Backup completo exportado';
    toast('Backup JSON exportado');
  }

  function renderAll() {
    renderHeroes();
    renderVillains();
    renderCampaign();
    renderDiceHistory();
    renderVillainDiceHistory();
    syncChallengeInputs();
    syncVillainChallengeInputs();
    updateNotesCount();
    clearCurrentRollVisual(true);
    clearCurrentVillainRollVisual(true);
  }

  // Login
  $('player-login').addEventListener('click', () => enter('player'));
  $('master-login').addEventListener('click', () => {
    $('password-area').classList.toggle('hidden');
    if (!$('password-area').classList.contains('hidden')) $('master-password').focus();
  });
  $('confirm-master').addEventListener('click', () => {
    if ($('master-password').value === MASTER_PASSWORD) enter('master');
    else $('login-error').textContent = 'Senha incorreta.';
  });
  $('master-password').addEventListener('keydown', event => { if (event.key === 'Enter') $('confirm-master').click(); });
  $('logout').addEventListener('click', logout);

  // Navigation
  $('menu-toggle').addEventListener('click', () => $('app').classList.contains('nav-open') ? closeNav() : openNav());
  $('sidebar-backdrop').addEventListener('click', closeNav);
  $('nav').addEventListener('click', event => {
    const button = event.target.closest('button[data-page]');
    if (button) goToPage(button.dataset.page);
  });
  document.addEventListener('click', event => {
    const go = event.target.closest('[data-go]');
    if (go) goToPage(go.dataset.go);
  });

  // Delegated actions
  document.addEventListener('click', event => {
    const action = event.target.closest('[data-action]');
    if (!action) return;
    const index = Number(action.dataset.index);
    if (action.dataset.action === 'view-hero') viewHero(index);
    if (action.dataset.action === 'edit-hero') editHero(index);
    if (action.dataset.action === 'save-hero') saveHero(index);
    if (action.dataset.action === 'view-villain') viewVillain(index);
    if (action.dataset.action === 'edit-villain') editVillain(index);
    if (action.dataset.action === 'save-villain') saveVillain(index);
    if (action.dataset.action === 'adjust-villain') adjustVillain(index, action.dataset.resource, Number(action.dataset.delta));
    if (action.dataset.action === 'roll-with-villain') rollWithVillain(index);
    if (action.dataset.action === 'close-modal') closeModal();
    if (action.dataset.action === 'toggle-session') {
      const article = action.closest('.session');
      article.classList.toggle('open');
      action.setAttribute('aria-expanded', String(article.classList.contains('open')));
    }
    if (action.dataset.action === 'cycle-session') cycleSession(action.dataset.sessionId);
  });

  // Modal
  $('close').addEventListener('click', closeModal);
  $('modal').addEventListener('click', event => { if (event.target === $('modal')) closeModal(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !$('modal').classList.contains('hidden')) closeModal();
    else if (event.key === 'Escape') closeNav();
  });

  // Challenge / dice
  ['action-name','target-number','roll-actor','roll-ability','extra-modifier','edge-count','trouble-count'].forEach(id => {
    $(id).addEventListener(id === 'action-name' ? 'input' : 'change', saveChallengeFromControls);
  });
  qsa('[data-dice-mode]').forEach(button => button.addEventListener('click', () => setDiceMode(button.dataset.diceMode)));
  $('roll-d616').addEventListener('click', rollD616);
  $('finalize-roll').addEventListener('click', finalizeCurrentRoll);
  qsa('.die-select', $('dice')).forEach(button => button.addEventListener('click', () => useEdge(Number(button.dataset.dieIndex))));
  $('roll-generic').addEventListener('click', rollGeneric);
  $('clear-history').addEventListener('click', () => {
    state.diceHistory = [];
    saveJSON(STORAGE.dice, []);
    renderDiceHistory();
    toast('Histórico limpo');
  });

  // Rolagens dos vilões (exclusivas do Mestre e persistidas separadamente).
  ['v-action-name','v-target-number','v-roll-actor','v-roll-ability','v-extra-modifier','v-edge-count','v-trouble-count'].forEach(id => {
    $(id).addEventListener(id === 'v-action-name' ? 'input' : 'change', saveVillainChallengeFromControls);
  });
  $('v-roll-d616').addEventListener('click', rollVillainD616);
  $('v-finalize-roll').addEventListener('click', finalizeCurrentVillainRoll);
  qsa('.die-select', $('villain-dice')).forEach(button => button.addEventListener('click', () => useVillainEdge(Number(button.dataset.vDieIndex))));
  $('v-clear-history').addEventListener('click', () => { state.villainDiceHistory=[]; saveJSON(STORAGE.villainDice,[]); renderVillainDiceHistory(); toast('Histórico dos vilões limpo'); });

  // Notes
  loadNotesForRole();
  $('notes-text').addEventListener('input', () => {
    localStorage.setItem(activeNotesKey(), $('notes-text').value);
    updateNotesCount();
    markSaved('Anotações salvas');
    $('notes-export-status').textContent = 'Alterações salvas localmente';
  });
  $('copy-notes').addEventListener('click', copyNotes);
  $('export-notes-md').addEventListener('click', () => exportNotes('md'));
  $('export-notes-txt').addEventListener('click', () => exportNotes('txt'));
  $('export-backup').addEventListener('click', exportBackup);
  $('clear-notes').addEventListener('click', () => {
    if (!$('notes-text').value || !confirm('Limpar todas as anotações locais?')) return;
    $('notes-text').value = '';
    localStorage.setItem(activeNotesKey(), '');
    updateNotesCount();
    $('notes-export-status').textContent = 'Anotações limpas';
    toast('Anotações limpas');
  });

  renderAll();
})();
