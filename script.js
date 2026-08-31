(() => {
  'use strict';

  const APP_VERSION = 7;
  const STORAGE = {
    heroes: `arachne_v${APP_VERSION}_heroes`,
    notesPlayer: `arachne_v${APP_VERSION}_notes_player`,
    notesMaster: `arachne_v${APP_VERSION}_notes_master`,
    campaign: `arachne_v${APP_VERSION}_campaign`,
    dice: `arachne_v${APP_VERSION}_dice`,
    challenge: `arachne_v${APP_VERSION}_challenge`,
    villains: `arachne_v${APP_VERSION}_villains`,
    scenario: `arachne_v${APP_VERSION}_scenario`,
    initiative: `arachne_v${APP_VERSION}_initiative`
  };

  const ABILITIES = ['Melee', 'Agility', 'Resilience', 'Vigilance', 'Ego', 'Logic'];
  const DEFAULT_HEROES = [
    {
      id:'spider', n:'Homem-Aranha', r:'Peter Parker', i:'🕷️', rank:4, pdf:'assets/pdfs/hero-homem-aranha.pdf',
      stats:[['Health',90],['Focus',90],['Karma',4]],
      abilities:{Melee:5,Agility:7,Resilience:3,Vigilance:3,Ego:0,Logic:4},
      traits:['Audience','Combat Reflexes','Connections: Sources','Free Running','Inventor','Pundit','Scientific Expertise','Weird'],
      tags:['Heroic','Obligation: Aunt May','Poor','Secret Identity']
    },
    {
      id:'wolverine', n:'Wolverine', r:'James Howlett / Logan', i:'🗡️', rank:4, pdf:'assets/pdfs/hero-wolverine.pdf',
      stats:[['Health',150],['Focus',150],['Karma',4]],
      abilities:{Melee:7,Agility:2,Resilience:5,Vigilance:4,Ego:1,Logic:1},
      traits:['Battle Ready','Berserker','Combat Expert','Combat Reflexes','Connections: Military','Extraordinary Origin','Situational Awareness','Tech Reliance'],
      tags:['Extreme Appearance','Enemy: Sabretooth','Heroic','Hounded','Krakoan','Public Identity','X-Gene']
    },
    {
      id:'cap', n:'Capitão América', r:'Steve Rogers', i:'🛡️', rank:4, pdf:'assets/pdfs/hero-capitao-america.pdf',
      stats:[['Health',90],['Focus',120],['Karma',4]],
      abilities:{Melee:6,Agility:4,Resilience:3,Vigilance:3,Ego:2,Logic:2},
      traits:['Battle Ready','Beguiling','Combat Expert','Combat Reflexes','Connections: Military','Public Speaking','Situational Awareness','Weird'],
      tags:['Enemy: Hydra','Enemy: Red Skull','Heroic','Public Identity']
    }
  ];

  const DEFAULT_VILLAINS = [
    {
      id:'octopus', n:'Doutor Octopus', r:'Otto Octavius', i:'🐙', rank:4, tier:'AMEAÇA', pdf:'assets/pdfs/villain-doutor-octopus.pdf',
      role:'Cientista / primeiro grande suspeito', hook:'Ligado à parte científica do Projeto Arachne.',
      maxHealth:90, maxFocus:60, currentHealth:90, currentFocus:60, karma:'—', healthDR:'—', focusDR:'—', initiative:'+2',
      speed:'Correr 5 · Escalar 5 · Nadar 3 · Pular 5', occupation:'Cientista', origin:'Alta Tecnologia, Ciência Bizarra', teams:'Masters of Evil, Sinister Six', base:'Nova York',
      abilities:{Melee:4,Agility:3,Resilience:3,Vigilance:2,Ego:4,Logic:5},
      traits:['Abrasivo','Origem Extraordinária','Inventor','Especialista Científico','Cético','Dependência Tecnológica','Estranho'],
      tags:['Acesso a Laboratório','Identidade Pública','Vilanesco'],
      powers:['Membro Adicional','Brilhantismo 2','Poderoso 2','Alcance Estendido 1','Esquiva Aracnídea','Escalar Paredes','Golpear Cabeças','Agarrão Esmagador','Golpe Brutal','Pulo 1','Arremesso Rápido','Telepatia com Máquinas']
    },
    {
      id:'sabretooth', n:'Dentes-de-Sabre', r:'Victor Creed', i:'🐯', rank:4, tier:'AMEAÇA', pdf:'assets/pdfs/villain-dentes-de-sabre.pdf',
      role:'Rival pessoal de Wolverine', hook:'Enviado para capturar Logan e estudar seu fator de cura.',
      maxHealth:180, maxFocus:150, currentHealth:180, currentFocus:150, karma:'—', healthDR:'-1', focusDR:'—', initiative:'+4E',
      speed:'Correr 5 · Escalar 3 · Nadar 3 · Pular 5', occupation:'Militar', origin:'Alta Tecnologia: Cibernética, Mutante', teams:'1959 Avengers, Brotherhood of Evil Mutants, Hand, Marauders, Team X, X-Factor', base:'Krakoa',
      abilities:{Melee:7,Agility:4,Resilience:6,Vigilance:4,Ego:0,Logic:0},
      traits:['Abrasivo','Pronto para Batalha','Berserker','Reflexos de Combate','Conexões: Militar','Origem Extraordinária','Consciência Situacional','Furtivo','Dependência Tecnológica'],
      tags:['Aparência Extrema','Caçado','Krakoano','Vilanesco','Gene-X'],
      powers:['Luta de Rua','Truque de Combate','Fator de Cura','Sentidos Aguçados 1','Poderoso 1','Esqueleto Reforçado','Explorar Fraqueza','Ataques Rápidos','Fúria Focada','Ataques Furiosos','Bater e Correr','Ripostar','Ataque Imparável','Ataque Cruel','Frenesi Giratório','Pulo 1']
    },
    {
      id:'crossbones', n:'Ossos Cruzados', r:'Brock Rumlow', i:'☠️', rank:3, tier:'AMEAÇA', pdf:'assets/pdfs/villain-ossos-cruzados.pdf',
      role:'Operação Hydra', hook:'Tenta roubar a amostra de Steve Rogers.',
      maxHealth:90, maxFocus:90, currentHealth:90, currentFocus:90, karma:'—', healthDR:'—', focusDR:'—', initiative:'+2E',
      speed:'Correr 6 · Escalar 3 · Nadar 3 · Pular 3', occupation:'Militar', origin:'Treinamento Especial', teams:'Hydra, Thunderbolts, Skeleton Crew', base:'Móvel',
      abilities:{Melee:4,Agility:5,Resilience:3,Vigilance:2,Ego:0,Logic:1},
      traits:['Pronto para Batalha','Sanguinário','Especialista em Combate','Conexões: Militar (Hydra)','Determinação','Pilotagem','Consciência Situacional'],
      tags:['Reforços','Identidade Pública','Vilanesco','Arma Característica: Submetralhadora'],
      powers:['Precisão 2','Esquiva em Câmera Lenta','Golpear Cabeças','Técnica de Agarrão','Dança da Morte','Tiro Duplo','Mãos Rápidas','Aparar à Queima-Roupa','Esquiva de Tiro em Câmera Lenta','Tiro Instantâneo','Poder de Parada','Armas em Chamas']
    },
    {
      id:'goblin', n:'Duende Verde', r:'Norman Osborn', i:'🎃', rank:4, tier:'AMEAÇA', pdf:'assets/pdfs/villain-duende-verde.pdf',
      role:'Vilão intermediário', hook:'Invade o projeto para roubar a tecnologia.',
      maxHealth:120, maxFocus:60, currentHealth:120, currentFocus:60, karma:'—', healthDR:'-1', focusDR:'—', initiative:'+2',
      speed:'Correr 6 · Escalar 3 · Nadar 3 · Voo 24', occupation:'Criminoso, Magnata', origin:'Ciência Bizarra', teams:'Dark Avengers, Goblin Nation, Sinister Six, Thunderbolts', base:'Nova York',
      abilities:{Melee:5,Agility:5,Resilience:4,Vigilance:2,Ego:1,Logic:3},
      traits:['Conexões: Celebridades','Conexões: Criminalidade','Negociador','Ocupação Extra','Famoso','Inventor','Dependência Tecnológica','Estranho'],
      tags:['Acesso ao Mercado Negro','Inimigo: Homem-Aranha','Quartel-General','Rico','Identidade Secreta','Conhecimento das Ruas','Vilanesco','Arma Característica: Bombas-Abóbora'],
      powers:['Precisão 1','Truque de Combate','Voo 2','Fator de Cura','Inspiração','Poderoso 2','Robusto 1','Rajada Elemental','Explosão Elemental','Golpear Cabeças','Golpe Brutal','Agarrão Esmagador','Arremesso Rápido','Plano de Batalha','Mudança de Planos']
    },
    {
      id:'hydra-agent', n:'Agente da Hydra', r:'Identidade variável', i:'🐍', rank:1, tier:'CAPANGA', pdf:'assets/pdfs/villain-agente-hydra.pdf',
      role:'Soldado / reforço da Hydra', hook:'Capanga para instalações da Hydra e para a Sessão 4.',
      maxHealth:30, maxFocus:60, currentHealth:30, currentFocus:60, karma:'—', healthDR:'—', focusDR:'—', initiative:'+1E',
      speed:'Correr 5 · Escalar 3 · Nadar 3 · Pular 3', occupation:'Militar', origin:'Treinamento Especial', teams:'Hydra', base:'Secreta',
      abilities:{Melee:1,Agility:1,Resilience:1,Vigilance:1,Ego:1,Logic:0},
      traits:['Pronto para Batalha','Reflexos de Combate','Conexões: Militares (Hydra)','Determinação','Consciência Situacional'],
      tags:['Identidade Secreta','Vilanesco'],
      powers:['Disparo Duplo','Disparo Instintivo','Fogo Supressivo','Armas em Rajada']
    },
    {
      id:'aim-agent', n:'Agente da I.M.A.', r:'Identidade variável', i:'🧪', rank:1, tier:'CAPANGA', pdf:'assets/pdfs/villain-agente-ima.pdf',
      role:'Cientista / suporte tecnológico', hook:'Unidade científica extra para laboratórios, escoltas e encontros tecnológicos.',
      maxHealth:10, maxFocus:60, currentHealth:10, currentFocus:60, karma:'—', healthDR:'—', focusDR:'—', initiative:'+1',
      speed:'Correr 5 · Escalar 3 · Nadar 3 · Pular 3', occupation:'Cientista', origin:'Alta Tecnologia', teams:'I.M.A.', base:'Q.G. da I.M.A.',
      abilities:{Melee:0,Agility:1,Resilience:0,Vigilance:1,Ego:1,Logic:3},
      traits:['Pronto para Batalha','Inventor','Dependência Tecnológica','Especialista Científico'],
      tags:['Acesso a Laboratório','Identidade Secreta','Vilanesco'],
      powers:['Precisão 1','Brilhantismo 1','Rajada Elemental']
    },
    {
      id:'sinister', n:'Senhor Sinistro', r:'Nathaniel Essex', i:'🧬', rank:5, tier:'CHEFE FINAL', pdf:'assets/pdfs/villain-senhor-sinistro.pdf',
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

  const CAMPAIGN_PDF = 'assets/pdfs/campanha-projeto-arachne.pdf';

  const DEFAULT_CHALLENGE = {
    action:'Ação sem título', tn:14, edge:0, trouble:0,
    source:'hero', actor:'spider', threatTier:'minion', threatChoice:'minion-melee', ability:'Agility', extra:0
  };



  // v7 — biblioteca privada de ameaças. Só é renderizada quando o perfil Mestre está ativo.
  const MINION_TEMPLATES = {
    'minion-melee': {id:'minion-melee', n:'Capanga · Curta distância', i:'◆', abilities:{Melee:2,Agility:1,Resilience:2,Vigilance:1,Ego:0,Logic:0}, initiative:'+1', damage:{Melee:[2,2],Agility:[1,1],Ego:[1,0],Logic:[1,0]}},
    'minion-ranged': {id:'minion-ranged', n:'Capanga · Longo alcance', i:'◇', abilities:{Melee:1,Agility:2,Resilience:1,Vigilance:2,Ego:0,Logic:0}, initiative:'+2', damage:{Melee:[1,1],Agility:[2,2],Ego:[1,0],Logic:[1,0]}},
    'minion-support': {id:'minion-support', n:'Capanga · Suporte', i:'✦', abilities:{Melee:0,Agility:1,Resilience:1,Vigilance:2,Ego:1,Logic:2}, initiative:'+2', damage:{Melee:[1,0],Agility:[1,1],Ego:[1,1],Logic:[2,2]}}
  };

  const DAMAGE_PROFILES = {
    spider:{Melee:[5,5],Agility:[4,7],Ego:[4,0],Logic:[5,4]},
    wolverine:{Melee:[5,7],Agility:[5,2],Ego:[4,1],Logic:[4,1]},
    cap:{Melee:[5,6],Agility:[5,4],Ego:[4,2],Logic:[4,2]},
    octopus:{Melee:[6,4],Agility:[4,3],Ego:[4,4],Logic:[6,5]},
    sabretooth:{Melee:[5,7],Agility:[4,4],Ego:[4,0],Logic:[4,0]},
    crossbones:{Melee:[3,4],Agility:[5,5],Ego:[3,0],Logic:[3,1]},
    goblin:{Melee:[6,5],Agility:[5,5],Ego:[4,1],Logic:[4,3]},
    'hydra-agent':{Melee:[1,1],Agility:[1,1],Ego:[1,1],Logic:[1,0]},
    'aim-agent':{Melee:[1,0],Agility:[2,1],Ego:[1,1],Logic:[2,3]},
    sinister:{Melee:[7,3],Agility:[5,3],Ego:[5,2],Logic:[7,7]}
  };

  const DEFAULT_SCENARIO = {
    preset:'empty', selectedTool:'select', selectedPiece:null, obstacles:{}, pieces:[
      {id:'hero-spider',kind:'hero',name:'Homem-Aranha',short:'HA',color:'#ef4444',x:2,y:7},
      {id:'hero-wolverine',kind:'hero',name:'Wolverine',short:'W',color:'#facc15',x:3,y:8},
      {id:'hero-cap',kind:'hero',name:'Capitão América',short:'CA',color:'#3b82f6',x:1,y:8}
    ]
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

  // Migração v6 -> v7 (com fallbacks anteriores). Não sobrescreve dados existentes na v7.
  const migrationCandidates = {
    heroes:['arachne_v6_heroes','arachne_v5_heroes','arachne_v4_heroes','arachne_v3_heroes'],
    campaign:['arachne_v6_campaign','arachne_v5_campaign','arachne_v4_campaign','arachne_v3_campaign'],
    dice:['arachne_v6_dice','arachne_v5_dice','arachne_v4_dice','arachne_v3_dice'],
    challenge:['arachne_v6_challenge','arachne_v5_challenge','arachne_v4_challenge']
  };
  Object.entries(migrationCandidates).forEach(([name, keys]) => {
    if (localStorage.getItem(STORAGE[name])) return;
    const oldKey = keys.find(key => localStorage.getItem(key) != null);
    if (oldKey) localStorage.setItem(STORAGE[name], localStorage.getItem(oldKey));
  });
  if (!localStorage.getItem(STORAGE.villains) && localStorage.getItem('arachne_v6_villains') != null) localStorage.setItem(STORAGE.villains, localStorage.getItem('arachne_v6_villains'));
  if (!localStorage.getItem(STORAGE.notesPlayer)) {
    const oldNotes = localStorage.getItem('arachne_v6_notes_player') ?? localStorage.getItem('arachne_v5_notes_player') ?? localStorage.getItem('arachne_v4_notes_player') ?? localStorage.getItem('arachne_v3_notes') ?? localStorage.getItem('arachne_notes');
    if (oldNotes != null) localStorage.setItem(STORAGE.notesPlayer, oldNotes || '');
  }
  if (!localStorage.getItem(STORAGE.notesMaster)) {
    const oldNotes = localStorage.getItem('arachne_v6_notes_master') ?? localStorage.getItem('arachne_v5_notes_master') ?? localStorage.getItem('arachne_v4_notes_master');
    if (oldNotes != null) localStorage.setItem(STORAGE.notesMaster, oldNotes || '');
  }
  if (!localStorage.getItem(STORAGE.scenario) && localStorage.getItem('arachne_v6_scenario') != null) localStorage.setItem(STORAGE.scenario, localStorage.getItem('arachne_v6_scenario'));
  if (!localStorage.getItem(STORAGE.initiative) && localStorage.getItem('arachne_v6_initiative') != null) localStorage.setItem(STORAGE.initiative, localStorage.getItem('arachne_v6_initiative'));

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
    heroes: DEFAULT_HEROES.map((fallback, i) => normalizeHero((Array.isArray(loadedHeroes) ? loadedHeroes.find(item => item?.id === fallback.id) : null) || loadedHeroes[i] || fallback, fallback)),
    villains: DEFAULT_VILLAINS.map((fallback, i) => normalizeVillain((Array.isArray(loadedVillains) ? loadedVillains.find(item => item?.id === fallback.id) : null) || fallback, fallback)),
    campaign: loadJSON(STORAGE.campaign, Object.fromEntries(SESSIONS.map(s => [s.id, 'todo']))),
    diceHistory: loadJSON(STORAGE.dice, []),
    challenge: {...DEFAULT_CHALLENGE, ...loadJSON(STORAGE.challenge, DEFAULT_CHALLENGE)},
    scenario: {...clone(DEFAULT_SCENARIO), ...loadJSON(STORAGE.scenario, DEFAULT_SCENARIO)},
    initiativeParticipants: loadJSON(STORAGE.initiative, [])
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
    if ((id === 'home' || id === 'villains' || id === 'campaign' || id === 'dice' || id === 'scenario') && state.role !== 'master') id = 'heroes';
    state.page = id;
    qsa('.page').forEach(el => el.classList.remove('active'));
    $(id)?.classList.add('active');
    qsa('#nav button').forEach(el => el.classList.toggle('active', el.dataset.page === id));
    $('title').textContent = {home:'Central da Campanha',heroes:'Heróis',villains:'Vilões',campaign:'Projeto Arachne',dice:'Dados do Mestre',scenario:'Montador de Cenário',notes:'Anotações'}[id] || 'Projeto Arachne';
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
          <div class="card-actions"><button class="primary" type="button" data-action="view-hero" data-index="${index}">VER RESUMO</button><button type="button" data-action="edit-hero" data-index="${index}">EDITAR</button><button class="sheet-button" type="button" data-action="view-hero-pdf" data-index="${index}">▣ VISUALIZAR FICHA COMPLETA</button></div>
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
          <div class="card-actions"><button class="primary" type="button" data-action="view-villain" data-index="${index}">VER RESUMO</button><button type="button" data-action="edit-villain" data-index="${index}">EDITAR</button><button class="sheet-button" type="button" data-action="view-villain-pdf" data-index="${index}">▣ VISUALIZAR FICHA COMPLETA</button></div>
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

  function openModal(html, mode = 'default') {
    lastFocusedElement = document.activeElement;
    $('modalbody').innerHTML = html;
    $('modal').querySelector('.modalbox')?.classList.toggle('pdf-modalbox', mode === 'pdf');
    $('modal').classList.remove('hidden');
    $('close').focus();
  }
  function closeModal() {
    $('modal').classList.add('hidden');
    $('modal').querySelector('.modalbox')?.classList.remove('pdf-modalbox');
    $('modalbody').innerHTML = '';
    lastFocusedElement?.focus?.();
  }

  function safePdfPath(path) {
    const value = String(path || '');
    return /^assets\/pdfs\/[a-z0-9._-]+\.pdf$/i.test(value) ? value : '';
  }

  function openPdfViewer(path, title, subtitle = '') {
    const pdf = safePdfPath(path);
    if (!pdf) { toast('PDF não configurado para esta ficha'); return; }
    const safeTitle = escapeHTML(title || 'Documento');
    const safeSubtitle = escapeHTML(subtitle || 'Visualizador de PDF');
    const src = `${pdf}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`;
    openModal(`<div class="pdf-viewer"><div class="pdf-viewer-head"><div><small>${safeSubtitle}</small><h2 id="modal-title">${safeTitle}</h2></div><div class="pdf-viewer-actions"><a href="${pdf}" target="_blank" rel="noopener">ABRIR EM NOVA GUIA</a><a href="${pdf}" download>BAIXAR PDF</a></div></div><div class="pdf-frame-wrap"><iframe class="pdf-frame" src="${src}" title="${safeTitle}"></iframe></div><p class="pdf-fallback">Se o navegador não exibir PDFs incorporados, use <b>Abrir em nova guia</b>. O arquivo continua incluído dentro do projeto e funciona também quando o site é hospedado.</p></div>`, 'pdf');
  }

  function viewHero(index) {
    const hero = state.heroes[index];
    if (!hero) return;
    const abilityCards = ABILITIES.map(name => `<div><small>${name}</small><b>${signed(abilityValue(hero,name))}</b></div>`).join('');
    openModal(`<h2 id="modal-title">${escapeHTML(hero.i)} ${escapeHTML(hero.n)}</h2><p class="muted">${escapeHTML(hero.r)} · Rank ${escapeHTML(hero.rank)}</p><div class="sheet">${hero.stats.map(([name,value]) => `<div><small>${escapeHTML(name)}</small><b>${escapeHTML(value)}</b></div>`).join('')}${abilityCards}</div><h3>Traits</h3><ul>${hero.traits.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul><h3>Tags</h3><div class="chips">${hero.tags.map(item => `<span class="chip">${escapeHTML(item)}</span>`).join('')}</div><div class="editbuttons"><button class="savebtn" type="button" data-action="view-hero-pdf" data-index="${index}">VISUALIZAR FICHA COMPLETA</button><button type="button" data-action="edit-hero" data-index="${index}">EDITAR DADOS RÁPIDOS</button></div>`);
  }

  function viewHeroPdf(index) {
    const hero = state.heroes[index];
    if (!hero) return;
    openPdfViewer(hero.pdf, `${hero.n} — Ficha Completa`, `${hero.r} · Rank ${hero.rank}`);
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
      <div class="editbuttons"><button class="savebtn" type="button" data-action="view-villain-pdf" data-index="${index}">VISUALIZAR FICHA COMPLETA</button><button type="button" data-action="edit-villain" data-index="${index}">EDITAR DADOS</button><button type="button" data-action="roll-with-villain" data-index="${index}">ROLAR COM ESTE VILÃO</button></div>`);
  }

  function viewVillainPdf(index) {
    const villain = state.villains[index];
    if (!villain) return;
    openPdfViewer(villain.pdf, `${villain.n} — Ficha Completa`, `${villain.r} · Rank ${villain.rank} · ${villain.tier}`);
  }

  function viewCampaignPdf() {
    openPdfViewer(CAMPAIGN_PDF, 'Projeto Arachne — Campanha Completa', '24 páginas · livro da campanha');
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
    saveJSON(STORAGE.villains,state.villains); renderVillains(); renderChallengeSummary(); renderDamageSelectors(); renderInitiativeThreatPicker(); renderScenarioThreatPicker(); closeModal(); markSaved('Vilão salvo'); toast('Ficha do vilão atualizada');
  }

  function adjustVillain(index, resource, delta) {
    const villain = state.villains[index]; if (!villain) return;
    const key = resource === 'focus' ? 'currentFocus' : 'currentHealth'; const maxKey = resource === 'focus' ? 'maxFocus' : 'maxHealth';
    villain[key] = Math.min(villain[maxKey], Math.max(0, Number(villain[key] || 0) + Number(delta || 0)));
    saveJSON(STORAGE.villains,state.villains); renderVillains(); viewVillain(index); markSaved(`${resource === 'focus' ? 'Focus' : 'Health'} atualizado`);
  }

  function rollWithVillain(index) {
    const villain = state.villains[index]; if (!villain) return;
    state.challenge.source = 'threat';
    state.challenge.threatTier = ['hydra-agent','aim-agent'].includes(villain.id) ? 'special' : 'main';
    state.challenge.threatChoice = villain.id;
    state.challenge.ability = 'Melee';
    saveJSON(STORAGE.challenge, state.challenge);
    closeModal(); syncChallengeInputs(); setMasterDiceTab('d616'); goToPage('dice');
  }

  // -------------------- D616

  // -------------------- D616 --------------------
  function threatOptions(tier) {
    if (tier === 'minion') return Object.values(MINION_TEMPLATES);
    if (tier === 'special') return state.villains.filter(v => ['hydra-agent','aim-agent'].includes(v.id));
    return state.villains.filter(v => !['hydra-agent','aim-agent'].includes(v.id));
  }

  function resolveThreat(tier, id) {
    if (tier === 'minion') return MINION_TEMPLATES[id] || MINION_TEMPLATES['minion-melee'];
    return state.villains.find(v => v.id === id) || threatOptions(tier)[0] || MINION_TEMPLATES['minion-melee'];
  }

  function fillThreatSelect(select, tier, current) {
    if (!select) return '';
    const options = threatOptions(tier);
    select.innerHTML = options.map(item => `<option value="${escapeHTML(item.id)}">${escapeHTML(item.n)}</option>`).join('');
    const valid = options.some(item => item.id === current) ? current : (options[0]?.id || '');
    select.value = valid;
    return valid;
  }

  function renderActorOptions() {
    const select = $('roll-actor');
    if (!select) return;
    const current = state.challenge.actor;
    select.innerHTML = state.heroes.map(hero => `<option value="${escapeHTML(hero.id)}">${escapeHTML(hero.n)}</option>`).join('');
    if (state.heroes.some(h => h.id === current)) select.value = current;
    else { state.challenge.actor = state.heroes[0]?.id || ''; select.value = state.challenge.actor; }
  }

  function activeHero() { return state.heroes.find(hero => hero.id === state.challenge.actor) || state.heroes[0]; }
  function activeRollEntity() {
    if (state.challenge.source === 'threat') return resolveThreat(state.challenge.threatTier, state.challenge.threatChoice);
    return activeHero();
  }

  function syncThreatPicker(prefix, tier, choice) {
    const tierEl = $(`${prefix}-threat-tier`);
    const choiceEl = $(`${prefix}-threat-choice`);
    if (tierEl) tierEl.value = tier;
    return fillThreatSelect(choiceEl, tier, choice);
  }

  function syncChallengeInputs() {
    renderActorOptions();
    state.challenge.source = state.challenge.source === 'threat' ? 'threat' : 'hero';
    state.challenge.threatTier = ['minion','special','main'].includes(state.challenge.threatTier) ? state.challenge.threatTier : 'minion';
    $('action-name').value = state.challenge.action || 'Ação sem título';
    $('target-number').value = clamp(state.challenge.tn,1,99);
    $('roll-source').value = state.challenge.source;
    $('threat-tier').value = state.challenge.threatTier;
    state.challenge.threatChoice = fillThreatSelect($('threat-choice'), state.challenge.threatTier, state.challenge.threatChoice);
    $('roll-ability').value = ABILITIES.includes(state.challenge.ability) ? state.challenge.ability : 'Agility';
    $('extra-modifier').value = clamp(state.challenge.extra,-30,30);
    $('edge-count').value = clamp(state.challenge.edge,0,6);
    $('trouble-count').value = clamp(state.challenge.trouble,0,6);
    toggleChallengeSourceFields();
    renderChallengeSummary();
  }

  function toggleChallengeSourceFields() {
    const threat = state.challenge.source === 'threat';
    $('hero-roll-field')?.classList.toggle('hidden', threat);
    $('threat-tier-field')?.classList.toggle('hidden', !threat);
    $('threat-choice-field')?.classList.toggle('hidden', !threat);
  }

  function effectiveAdvantage() {
    const edge = clamp(state.challenge.edge,0,6);
    const trouble = clamp(state.challenge.trouble,0,6);
    return {edge,trouble,netEdge:Math.max(edge-trouble,0),netTrouble:Math.max(trouble-edge,0),cancelled:Math.min(edge,trouble)};
  }

  function renderChallengeSummary() {
    const actor = activeRollEntity();
    const ability = ABILITIES.includes(state.challenge.ability) ? state.challenge.ability : 'Agility';
    const mod = abilityValue(actor, ability);
    const adv = effectiveAdvantage();
    $('challenge-title').textContent = state.challenge.action || 'Ação sem título';
    $('challenge-badge').textContent = `TN ${clamp(state.challenge.tn,1,99)}`;
    $('ability-modifier').textContent = signed(mod);
    $('challenge-actor').textContent = `${actor?.n || 'Personagem'} · ${ability} ${signed(mod)} · extra ${signed(state.challenge.extra)}`;
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
    state.challenge.source = $('roll-source').value === 'threat' ? 'threat' : 'hero';
    state.challenge.actor = $('roll-actor').value;
    state.challenge.threatTier = $('threat-tier').value;
    state.challenge.threatChoice = $('threat-choice').value;
    state.challenge.ability = $('roll-ability').value;
    state.challenge.extra = clamp($('extra-modifier').value,-30,30);
    state.challenge.edge = clamp($('edge-count').value,0,6);
    state.challenge.trouble = clamp($('trouble-count').value,0,6);
    saveJSON(STORAGE.challenge, state.challenge);
    toggleChallengeSourceFields();
    renderChallengeSummary();
    markSaved('Desafio salvo');
    clearCurrentRollVisual(false);
  }

  function setMasterDiceTab(mode) {
    const allowed = ['d616','generic','damage','initiative'];
    const next = allowed.includes(mode) ? mode : 'd616';
    state.diceMode = next;
    qsa('[data-master-dice-tab]').forEach(button => {
      const active = button.dataset.masterDiceTab === next;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    allowed.forEach(name => $(`master-dice-${name}`)?.classList.toggle('active', name === next));
  }

  // Compatibilidade com a v6: chamadas antigas passam a abrir as quatro abas novas.
  function setDiceMode(mode) { setMasterDiceTab(mode === 'generic' ? 'generic' : 'd616'); }

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
    const actor = activeRollEntity();
    const adv = effectiveAdvantage();
    const snapshot = {
      action:state.challenge.action, tn:state.challenge.tn, edge:state.challenge.edge, trouble:state.challenge.trouble,
      actorId:actor?.id || '', actorName:actor?.n || 'Personagem', ability:state.challenge.ability,
      abilityMod:abilityValue(actor,state.challenge.ability), extra:state.challenge.extra,
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

  function polyDieHTML(sides, value = '?', rolling = false, index = 0) {
    const klass = `poly-die d${sides}${rolling ? ' rolling' : ''}`;
    return `<div class="${klass}" style="--delay:${index * 55}ms" aria-label="d${sides}: ${escapeHTML(value)}"><span>${escapeHTML(value)}</span><small>d${sides}</small></div>`;
  }

  async function rollGeneric() {
    const sides = clamp($('die').value,2,1000);
    const quantity = clamp($('qty').value,1,12);
    const modifier = clamp($('generic-mod').value,-99,99);
    $('qty').value = quantity;
    const stage = $('generic-dice-stage');
    stage.innerHTML = Array.from({length:quantity},(_,i)=>polyDieHTML(sides,'?',true,i)).join('');
    $('generic-result').textContent = '…';
    $('generic-detail').textContent = `Rolando ${quantity}d${sides}${modifier ? ` ${signed(modifier)}` : ''}...`;
    await sleep(reducedMotion() ? 50 : 720 + Math.min(quantity,8)*55);
    const values = Array.from({length:quantity},() => rand(sides));
    stage.innerHTML = values.map((value,i)=>polyDieHTML(sides,value,false,i)).join('');
    const raw = values.reduce((sum,value)=>sum+value,0);
    const total = raw + modifier;
    $('generic-result').textContent = total;
    $('generic-detail').textContent = `${quantity}d${sides} → [${values.join(', ')}]${modifier ? ` ${signed(modifier)} mod.` : ''} = ${total}`;
    addHistory({type:'GEN',label:`${quantity}d${sides}`,detail:`[${values.join(', ')}]${modifier ? ` ${signed(modifier)}` : ''}`,total,at:Date.now()});
  }

  // -------------------- v7 · Dano com Marvel Die --------------------
  function renderDamageSelectors() {
    if (!$('damage-hero')) return;
    $('damage-hero').innerHTML = state.heroes.map(h=>`<option value="${escapeHTML(h.id)}">${escapeHTML(h.n)}</option>`).join('');
    if (!$('damage-hero').value) $('damage-hero').value = state.heroes[0]?.id || '';
    syncThreatPicker('damage', $('damage-threat-tier').value || 'minion', $('damage-threat-choice').value || 'minion-melee');
    toggleDamageSourceFields();
    applyDamageProfile(false);
  }

  function toggleDamageSourceFields() {
    const source = $('damage-source')?.value || 'hero';
    $('damage-hero-field')?.classList.toggle('hidden', source !== 'hero');
    $('damage-threat-tier-field')?.classList.toggle('hidden', source !== 'threat');
    $('damage-threat-choice-field')?.classList.toggle('hidden', source !== 'threat');
  }

  function damageEntity() {
    const source = $('damage-source')?.value || 'hero';
    if (source === 'hero') return state.heroes.find(h=>h.id===$('damage-hero').value) || state.heroes[0];
    if (source === 'threat') return resolveThreat($('damage-threat-tier').value, $('damage-threat-choice').value);
    return null;
  }

  function damageProfileFor(entity, profile) {
    if (!entity) return null;
    if (MINION_TEMPLATES[entity.id]?.damage?.[profile]) return MINION_TEMPLATES[entity.id].damage[profile];
    return DAMAGE_PROFILES[entity.id]?.[profile] || null;
  }

  function applyDamageProfile(showToast = true) {
    if (!$('damage-multiplier')) return;
    const entity = damageEntity();
    const profile = $('damage-profile').value;
    const values = damageProfileFor(entity, profile);
    if (!values) {
      if (showToast) toast('Esse perfil não tem dano pré-configurado. Ajuste manualmente.');
      updateDamageFormula();
      return;
    }
    $('damage-multiplier').value = values[0];
    $('damage-bonus').value = values[1];
    updateDamageFormula();
    if (showToast) toast(`Dano de ${entity.n} carregado`);
  }

  function updateDamageFormula() {
    if (!$('damage-formula')) return;
    const mult = clamp($('damage-multiplier').value,0,30);
    const bonus = clamp($('damage-bonus').value,-99,99);
    const reduction = clamp($('damage-reduction').value,0,20);
    const mode = $('damage-mode').value;
    const effective = Math.max(0,mult-reduction);
    $('damage-formula').textContent = `Marvel × ${mult}${bonus ? ` ${signed(bonus)}` : ' + 0'}${reduction ? ` · RED ${reduction} → ×${effective}` : ''}${mode==='fantastic'?' · ×2 Fantastic':''}`;
  }

  function setStandaloneCubeValue(cube, value) {
    if (!cube) return;
    cube.dataset.value = value;
    cube.style.transform = ROTATIONS[value] || ROTATIONS[1];
  }

  async function animateStandaloneCube(cube, duration=760) {
    if (!cube) return;
    const ms = reducedMotion()?60:duration;
    cube.style.setProperty('--spin-x',`${720+rand(4)*360}deg`);
    cube.style.setProperty('--spin-y',`${720+rand(5)*360}deg`);
    cube.style.setProperty('--spin-z',`${rand(3)*180}deg`);
    cube.style.setProperty('--roll-duration',`${ms}ms`);
    cube.classList.remove('rolling'); void cube.offsetWidth; cube.classList.add('rolling');
    await sleep(ms); cube.classList.remove('rolling');
  }

  async function rollDamage() {
    const cube = $('damage-cube');
    $('roll-damage').disabled = true;
    await animateStandaloneCube(cube,820);
    const face = rand(6);
    setStandaloneCubeValue(cube,face);
    const marvel = face === 1 ? 6 : face;
    const mult = clamp($('damage-multiplier').value,0,30);
    const bonus = clamp($('damage-bonus').value,-99,99);
    const reduction = clamp($('damage-reduction').value,0,20);
    const effectiveMult = Math.max(0,mult-reduction);
    let total = marvel * effectiveMult + bonus;
    if ($('damage-mode').value === 'fantastic') total *= 2;
    total = Math.max(0,total);
    const entity = damageEntity();
    $('damage-total').textContent = total;
    $('damage-detail').textContent = `${face===1?'M (vale 6)':face} × ${effectiveMult} ${bonus?signed(bonus):'+0'}${$('damage-mode').value==='fantastic'?' · dobrado':''} = ${total}${entity?` · ${entity.n}`:''}`;
    $('roll-damage').disabled = false;
    addHistory({type:'DMG',label:`Dano · ${entity?.n || 'Personalizado'}`,detail:$('damage-detail').textContent,total,at:Date.now()});
  }

  // -------------------- v7 · Iniciativa com 1 Marvel Die --------------------
  function initModifierFromEntity(entity) {
    if (!entity) return 0;
    const raw = String(entity.initiative ?? entity.abilities?.Vigilance ?? 0);
    const match = raw.match(/[+-]?\d+/);
    return match ? Number(match[0]) : Number(entity.abilities?.Vigilance || 0);
  }

  function saveInitiativeParticipants() { saveJSON(STORAGE.initiative,state.initiativeParticipants); }

  function renderInitiativeThreatPicker() {
    if (!$('init-threat-tier')) return;
    fillThreatSelect($('init-threat-choice'),$('init-threat-tier').value||'minion',$('init-threat-choice').value);
  }

  function addInitiativeParticipant(entity, nameOverride='') {
    if (!entity) return;
    const baseName = nameOverride || entity.n || 'Participante';
    const sameCount = state.initiativeParticipants.filter(p=>p.baseId===entity.id).length;
    state.initiativeParticipants.push({id:`init-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,baseId:entity.id,name:sameCount?`${baseName} ${sameCount+1}`:baseName,modifier:initModifierFromEntity(entity),result:null,face:null});
    saveInitiativeParticipants(); renderInitiativeParticipants();
  }

  function renderInitiativeParticipants() {
    const wrap=$('initiative-participants'); if(!wrap)return;
    if(!state.initiativeParticipants.length){wrap.innerHTML='<div class="history-empty">Nenhum participante adicionado.</div>';return;}
    wrap.innerHTML=state.initiativeParticipants.map((p,i)=>`<div class="initiative-row"><span class="initiative-index">${i+1}</span><input data-init-name="${i}" value="${escapeHTML(p.name)}" maxlength="50" aria-label="Nome do participante"><label>MOD <input data-init-mod="${i}" type="number" min="-20" max="30" value="${escapeHTML(p.modifier)}"></label><span class="initiative-last">${p.result==null?'—':`${p.face===1?'M':p.face} ${signed(p.modifier)} = ${p.result}`}</span><button type="button" data-init-remove="${i}" aria-label="Remover ${escapeHTML(p.name)}">×</button></div>`).join('');
  }

  async function rollInitiative() {
    if(!state.initiativeParticipants.length)return toast('Adicione pelo menos um participante');
    const cube=$('initiative-cube'); $('roll-initiative').disabled=true;
    const results=[];
    for(let i=0;i<state.initiativeParticipants.length;i++){
      const p=state.initiativeParticipants[i];
      $('initiative-current').textContent=`Rolando para ${p.name}...`;
      await animateStandaloneCube(cube,reducedMotion()?50:430);
      const face=rand(6); setStandaloneCubeValue(cube,face);
      const score=(face===1?6:face)+Number(p.modifier||0);
      p.face=face;p.result=score;results.push({...p});
      renderInitiativeParticipants();
      if(!reducedMotion())await sleep(100);
    }
    results.sort((a,b)=>b.result-a.result || b.modifier-a.modifier || a.name.localeCompare(b.name));
    const top=results[0]?.result;
    const tied=results.filter(r=>r.result===top).length>1;
    $('initiative-current').textContent=tied?`Empate no topo: ${top}`:`${results[0].name} começa com ${top}`;
    $('initiative-order').innerHTML=results.map((r,i)=>`<div class="initiative-order-row ${i===0?'winner':''}"><span>${i+1}</span><div><b>${escapeHTML(r.name)}</b><small>${r.face===1?'Marvel M = 6':`Marvel ${r.face}`} ${signed(r.modifier)}</small></div><strong>${r.result}</strong></div>`).join('')+(tied?'<p class="initiative-tie">Empate no topo: ajuste um modificador ou role novamente para desempatar.</p>':'');
    saveInitiativeParticipants(); $('roll-initiative').disabled=false;
  }

  // -------------------- v7 · Montador de cenário --------------------
  const BOARD_W=12, BOARD_H=10;
  const OBSTACLE_META={wall:{icon:'▰',label:'Parede'},crate:{icon:'▣',label:'Caixa'},terminal:{icon:'⌨',label:'Terminal'},barrel:{icon:'●',label:'Barril'},door:{icon:'▯',label:'Porta'}};
  const SCENARIO_PRESETS={
    empty:[],
    lab:[['wall',5,1],['wall',5,2],['wall',5,3],['door',5,4],['wall',5,5],['terminal',8,2],['terminal',9,2],['crate',8,6],['crate',9,6],['barrel',7,6]],
    hydra:[['wall',3,2],['wall',4,2],['wall',5,2],['door',6,2],['wall',7,2],['wall',8,2],['crate',3,6],['crate',4,6],['crate',8,5],['barrel',9,5],['terminal',10,2]],
    rooftop:[['wall',1,1],['wall',2,1],['wall',3,1],['wall',8,1],['wall',9,1],['wall',10,1],['crate',5,4],['crate',6,4],['barrel',10,7],['door',0,8]],
    madripoor:[['wall',4,1],['wall',4,2],['wall',4,3],['door',4,4],['wall',4,5],['wall',4,6],['terminal',8,1],['terminal',9,1],['crate',7,5],['crate',8,5],['barrel',9,5],['wall',10,7]]
  };

  function scenarioCellKey(x,y){return `${x},${y}`;}
  function normalizeScenario(){
    if(!state.scenario||typeof state.scenario!=='object')state.scenario=clone(DEFAULT_SCENARIO);
    if(!Array.isArray(state.scenario.pieces))state.scenario.pieces=clone(DEFAULT_SCENARIO.pieces);
    if(!state.scenario.obstacles||typeof state.scenario.obstacles!=='object')state.scenario.obstacles={};
    const heroIds=new Set(state.scenario.pieces.filter(p=>p.kind==='hero').map(p=>p.id));
    DEFAULT_SCENARIO.pieces.forEach(h=>{if(!heroIds.has(h.id))state.scenario.pieces.push(clone(h));});
  }
  function saveScenario(){saveJSON(STORAGE.scenario,state.scenario);markSaved('Cenário salvo');}
  function renderScenarioThreatPicker(){if(!$('scenario-threat-tier'))return;fillThreatSelect($('scenario-threat-choice'),$('scenario-threat-tier').value||'minion',$('scenario-threat-choice').value);}
  function scenarioPieceAt(x,y){return state.scenario.pieces.find(p=>p.x===x&&p.y===y);}
  function renderScenario(){
    const board=$('scenario-board');if(!board)return;normalizeScenario();
    board.innerHTML='';
    for(let y=0;y<BOARD_H;y++)for(let x=0;x<BOARD_W;x++){
      const cell=document.createElement('button');cell.type='button';cell.className=`scenario-cell ${(x+y)%2?'cell-dark':'cell-light'}`;cell.dataset.x=x;cell.dataset.y=y;cell.setAttribute('role','gridcell');
      const obs=state.scenario.obstacles[scenarioCellKey(x,y)];const piece=scenarioPieceAt(x,y);
      if(obs&&OBSTACLE_META[obs]){cell.classList.add('has-obstacle',`obstacle-${obs}`);cell.innerHTML=`<span class="obstacle-token" title="${OBSTACLE_META[obs].label}">${OBSTACLE_META[obs].icon}</span>`;}
      if(piece){cell.classList.add('has-piece');cell.innerHTML+=`<span class="board-piece ${piece.kind==='hero'?'hero-piece':'enemy-piece'}" style="--piece:${escapeHTML(piece.color)}" title="${escapeHTML(piece.name)}">${escapeHTML(piece.short||'E')}</span>`;if(state.scenario.selectedPiece===piece.id)cell.classList.add('selected');}
      board.appendChild(cell);
    }
    $('scenario-count').textContent=`${state.scenario.pieces.length} peças`;
    if ($('scenario-preset')) $('scenario-preset').value = state.scenario.preset || 'empty';
    const selected=state.scenario.pieces.find(p=>p.id===state.scenario.selectedPiece);
    $('scenario-selection').textContent=selected?`Selecionado: ${selected.name}. Clique em uma casa livre para mover.`:state.scenario.selectedTool!=='select'?`Ferramenta: ${OBSTACLE_META[state.scenario.selectedTool]?.label||'Apagar'}. Clique na grade.`:'Selecione uma peça ou ferramenta.';
    qsa('[data-obstacle]').forEach(b=>b.classList.toggle('active',b.dataset.obstacle===state.scenario.selectedTool));
  }
  function applyScenarioPreset(){
    const preset=$('scenario-preset').value;state.scenario.preset=preset;state.scenario.obstacles={};
    (SCENARIO_PRESETS[preset]||[]).forEach(([type,x,y])=>state.scenario.obstacles[scenarioCellKey(x,y)]=type);
    // reposiciona somente heróis, preservando inimigos para não destruir o encontro já montado.
    const heroPos={spider:[1,8],wolverine:[2,8],cap:[1,7]};
    state.scenario.pieces.forEach(p=>{if(p.id==='hero-spider')[p.x,p.y]=heroPos.spider;else if(p.id==='hero-wolverine')[p.x,p.y]=heroPos.wolverine;else if(p.id==='hero-cap')[p.x,p.y]=heroPos.cap;});
    saveScenario();renderScenario();toast('Modelo de cenário aplicado');
  }
  function firstFreeScenarioCell(seed=0){
    const spots=[];for(let y=0;y<BOARD_H;y++)for(let x=0;x<BOARD_W;x++)if(!scenarioPieceAt(x,y)&&!state.scenario.obstacles[scenarioCellKey(x,y)])spots.push({x,y});
    return spots.length?spots[Math.min(seed,spots.length-1)]:null;
  }
  function addScenarioEnemies(){
    const tier=$('scenario-threat-tier').value,choice=$('scenario-threat-choice').value,entity=resolveThreat(tier,choice),qty=clamp($('scenario-enemy-qty').value,1,30),color=$('scenario-enemy-color').value||'#7c3aed';
    for(let i=0;i<qty;i++){const cell=firstFreeScenarioCell(Math.max(0,20-i));if(!cell)break;state.scenario.pieces.push({id:`enemy-${Date.now()}-${i}-${Math.random().toString(36).slice(2,5)}`,kind:'enemy',baseId:entity.id,name:qty>1?`${entity.n} ${i+1}`:entity.n,short:tier==='main'?'V':tier==='special'?'CE':'E',color,x:cell.x,y:cell.y});}
    saveScenario();renderScenario();toast(`${qty} inimigo${qty===1?'':'s'} adicionado${qty===1?'':'s'}`);
  }
  function handleScenarioCell(cell){
    const x=Number(cell.dataset.x),y=Number(cell.dataset.y),piece=scenarioPieceAt(x,y),tool=state.scenario.selectedTool||'select';
    if(tool!=='select'){
      if(tool==='erase'){delete state.scenario.obstacles[scenarioCellKey(x,y)];if(piece?.kind==='enemy')state.scenario.pieces=state.scenario.pieces.filter(p=>p.id!==piece.id);}
      else if(!piece)state.scenario.obstacles[scenarioCellKey(x,y)]=tool;
      saveScenario();renderScenario();return;
    }
    if(piece){state.scenario.selectedPiece=state.scenario.selectedPiece===piece.id?null:piece.id;renderScenario();return;}
    if(state.scenario.selectedPiece&&!state.scenario.obstacles[scenarioCellKey(x,y)]){const selected=state.scenario.pieces.find(p=>p.id===state.scenario.selectedPiece);if(selected){selected.x=x;selected.y=y;state.scenario.selectedPiece=null;saveScenario();renderScenario();}}
  }



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
      challenge:state.challenge, diceHistory:state.diceHistory, scenario:state.scenario, initiativeParticipants:state.initiativeParticipants
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
    syncChallengeInputs();
    renderDamageSelectors();
    renderInitiativeThreatPicker();
    renderInitiativeParticipants();
    renderScenarioThreatPicker();
    renderScenario();
    updateNotesCount();
    clearCurrentRollVisual(true);
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
    if (action.dataset.action === 'view-hero-pdf') viewHeroPdf(index);
    if (action.dataset.action === 'edit-hero') editHero(index);
    if (action.dataset.action === 'save-hero') saveHero(index);
    if (action.dataset.action === 'view-villain') viewVillain(index);
    if (action.dataset.action === 'view-villain-pdf') viewVillainPdf(index);
    if (action.dataset.action === 'view-campaign-pdf') viewCampaignPdf();
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

  // Dados do Mestre — D616 / outros dados / dano / iniciativa
  ['action-name','target-number','roll-source','roll-actor','threat-tier','threat-choice','roll-ability','extra-modifier','edge-count','trouble-count'].forEach(id => {
    $(id).addEventListener(id === 'action-name' ? 'input' : 'change', () => {
      if (id === 'threat-tier') state.challenge.threatChoice = fillThreatSelect($('threat-choice'),$('threat-tier').value,'');
      saveChallengeFromControls();
    });
  });
  qsa('[data-master-dice-tab]').forEach(button => button.addEventListener('click', () => setMasterDiceTab(button.dataset.masterDiceTab)));
  $('roll-d616').addEventListener('click', rollD616);
  $('finalize-roll').addEventListener('click', finalizeCurrentRoll);
  qsa('.die-select', $('dice')).forEach(button => button.addEventListener('click', () => useEdge(Number(button.dataset.dieIndex))));
  $('roll-generic').addEventListener('click', rollGeneric);
  $('clear-history').addEventListener('click', () => { state.diceHistory=[]; saveJSON(STORAGE.dice,[]); renderDiceHistory(); toast('Histórico limpo'); });

  ['damage-source','damage-hero','damage-threat-tier','damage-threat-choice','damage-profile'].forEach(id => $(id).addEventListener('change', () => {
    if (id === 'damage-source') toggleDamageSourceFields();
    if (id === 'damage-threat-tier') fillThreatSelect($('damage-threat-choice'),$('damage-threat-tier').value,'');
    applyDamageProfile(false);
  }));
  ['damage-multiplier','damage-bonus','damage-reduction','damage-mode'].forEach(id => $(id).addEventListener(id === 'damage-mode' ? 'change' : 'input', updateDamageFormula));
  $('apply-damage-profile').addEventListener('click', () => applyDamageProfile(true));
  $('roll-damage').addEventListener('click', rollDamage);

  qsa('[data-init-add-hero]').forEach(button => button.addEventListener('click', () => addInitiativeParticipant(state.heroes.find(h=>h.id===button.dataset.initAddHero))));
  $('init-threat-tier').addEventListener('change', renderInitiativeThreatPicker);
  $('init-add-threat').addEventListener('click', () => {
    const tier=$('init-threat-tier').value, entity=resolveThreat(tier,$('init-threat-choice').value), qty=clamp($('init-threat-qty').value,1,20);
    for(let i=0;i<qty;i++) addInitiativeParticipant(entity, qty>1?`${entity.n} ${i+1}`:entity.n);
  });
  $('initiative-participants').addEventListener('input', event => {
    const nameIndex=event.target.dataset.initName, modIndex=event.target.dataset.initMod;
    if(nameIndex!=null){state.initiativeParticipants[Number(nameIndex)].name=event.target.value.slice(0,50);saveInitiativeParticipants();}
    if(modIndex!=null){state.initiativeParticipants[Number(modIndex)].modifier=clamp(event.target.value,-20,30);saveInitiativeParticipants();}
  });
  $('initiative-participants').addEventListener('click', event => {
    const button=event.target.closest('[data-init-remove]'); if(!button)return;
    state.initiativeParticipants.splice(Number(button.dataset.initRemove),1);saveInitiativeParticipants();renderInitiativeParticipants();
  });
  $('roll-initiative').addEventListener('click', rollInitiative);
  $('clear-initiative').addEventListener('click', () => {state.initiativeParticipants=[];saveInitiativeParticipants();renderInitiativeParticipants();$('initiative-order').innerHTML='<div class="history-empty">Adicione participantes para montar a ordem.</div>';$('initiative-current').textContent='Aguardando rolagem';});

  // Montador de cenário
  $('scenario-threat-tier').addEventListener('change', renderScenarioThreatPicker);
  $('apply-scenario-preset').addEventListener('click', applyScenarioPreset);
  $('scenario-add-enemies').addEventListener('click', addScenarioEnemies);
  qsa('[data-obstacle]').forEach(button => button.addEventListener('click', () => {state.scenario.selectedTool=button.dataset.obstacle;state.scenario.selectedPiece=null;renderScenario();}));
  $('scenario-board').addEventListener('click', event => {const cell=event.target.closest('.scenario-cell');if(cell)handleScenarioCell(cell);});
  $('scenario-reset').addEventListener('click', () => {if(!confirm('Resetar peças e obstáculos do cenário?'))return;state.scenario=clone(DEFAULT_SCENARIO);saveScenario();renderScenario();toast('Cenário resetado');});


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
