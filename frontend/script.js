(() => {
  'use strict';

  const APP_VERSION = 28;
  let activeCampaignCacheKey = 'lobby';
  const keyFor = suffix => `arachne_v${APP_VERSION}_${activeCampaignCacheKey}_${suffix}`;
  const STORAGE = {
    get heroes(){ return keyFor('heroes'); },
    get notesPlayer(){ return keyFor('notes_player'); },
    get playerNotes(){ return keyFor('player_notes'); },
    get notesMaster(){ return keyFor('notes_master'); },
    get campaign(){ return keyFor('campaign'); },
    get campaignContent(){ return keyFor('campaign_content'); },
    get dice(){ return keyFor('dice'); },
    get challenge(){ return keyFor('challenge'); },
    get villains(){ return keyFor('villains'); },
    get scenario(){ return keyFor('scenario'); },
    get initiative(){ return keyFor('initiative'); }
  };
  const CAMPAIGN_LIBRARY_KEY = 'arachne_campaign_library';

  const ABILITIES = ['Melee', 'Agility', 'Resilience', 'Vigilance', 'Ego', 'Logic'];

  const CHARACTER_ART = {
    spider:{src:'assets/portraits/hero-spider.jpg', position:'center 18%'},
    wolverine:{src:'assets/portraits/hero-wolverine.jpg', position:'center 20%'},
    cap:{src:'assets/portraits/hero-cap.jpg', position:'center 26%'},
    'iron-man':{src:'assets/portraits/hero-iron-man.png', position:'center 20%'},
    thor:{src:'assets/portraits/hero-thor.png', position:'center 18%'},
    cyclops:{src:'assets/portraits/hero-cyclops.png', position:'center 22%'},
    storm:{src:'assets/portraits/hero-storm.png', position:'center 20%'},
    gambit:{src:'assets/portraits/hero-gambit.png', position:'center 20%'},
    octopus:{src:'assets/portraits/villain-octopus.jpg', position:'center 24%'},
    sabretooth:{src:'assets/portraits/villain-sabretooth.jpg', position:'center 24%'},
    crossbones:{src:'assets/portraits/villain-crossbones.jpg', position:'center 28%'},
    goblin:{src:'assets/portraits/villain-goblin.jpg', position:'center 24%'},
    'hydra-agent':{src:'assets/portraits/villain-hydra-agent.jpg', position:'center 22%'},
    'aim-agent':{src:'assets/portraits/villain-aim-agent.jpg', position:'center 28%'},
    sinister:{src:'assets/portraits/villain-sinister.jpg', position:'center 18%'},
    iceman:{src:'assets/portraits/hero-iceman.png', position:'center 22%'},
    'mr-fantastic':{src:'assets/portraits/hero-mr-fantastic.png', position:'center 22%'},
    'invisible-woman':{src:'assets/portraits/hero-invisible-woman.png', position:'center center'},
    'human-torch':{src:'assets/portraits/hero-human-torch.png', position:'center 18%'},
    thing:{src:'assets/portraits/hero-thing.png', position:'center 20%'},
    daredevil:{src:'assets/portraits/hero-daredevil.png', position:'center 18%'},
    'luke-cage':{src:'assets/portraits/hero-luke-cage.png', position:'center 18%'},
    deadpool:{src:'assets/portraits/hero-deadpool.png', position:'center 18%'},
    doom:{src:'assets/portraits/villain-doom.png', position:'center 16%'},
    loki:{src:'assets/portraits/villain-loki.png', position:'center 18%'},
    zemo:{src:'assets/portraits/villain-zemo.png', position:'center 16%'},
    abomination:{src:'assets/portraits/villain-abomination.png', position:'center center'},
    enchantress:{src:'assets/portraits/villain-enchantress.png', position:'center 16%'},
    apocalypse:{src:'assets/portraits/villain-apocalypse.png', position:'center 18%'},
    mystique:{src:'assets/portraits/villain-mystique.png', position:'center center'},
    juggernaut:{src:'assets/portraits/villain-juggernaut.png', position:'center center'},
    magneto:{src:'assets/portraits/villain-magneto.png', position:'center 18%'},
    annihilus:{src:'assets/portraits/villain-annihilus.png', position:'center center'},
    'super-skrull':{src:'assets/portraits/villain-super-skrull.png', position:'center center'},
    blastaar:{src:'assets/portraits/villain-blastaar.png', position:'center center'},
    'molecule-man':{src:'assets/portraits/villain-molecule-man.png', position:'center center'},
    kingpin:{src:'assets/portraits/villain-kingpin.png', position:'center center'},
    bullseye:{src:'assets/portraits/villain-bullseye.png', position:'center center'},
    ajax:{src:'assets/portraits/villain-ajax.png', position:'center center'},
    tombstone:{src:'assets/portraits/villain-tombstone.png', position:'center center'},
    madcap:{src:'assets/portraits/villain-madcap.png', position:'center center'},
    't-ray':{src:'assets/portraits/villain-t-ray.png', position:'center center'},
    elektra:{src:'assets/portraits/villain-elektra.png', position:'center center'},
    "black-panther":{src:"assets/portraits/hero-black-panther.png", position:'center center'},
    "captain-marvel":{src:"assets/portraits/hero-captain-marvel.png", position:'center center'},
    "doctor-strange":{src:"assets/portraits/hero-doctor-strange.png", position:'center center'},
    "hulk":{src:"assets/portraits/hero-hulk.png", position:'center center'},
    "hawkeye":{src:"assets/portraits/hero-hawkeye.png", position:'center center'},
    "scarlet-witch":{src:"assets/portraits/hero-scarlet-witch.png", position:'center center'},
    "shang-chi":{src:"assets/portraits/hero-shang-chi.png", position:'center center'},
    "she-hulk":{src:"assets/portraits/hero-she-hulk.png", position:'center center'},
    "vision":{src:"assets/portraits/hero-vision.png", position:'center center'},
    "war-machine":{src:"assets/portraits/hero-war-machine.png", position:'center center'},
  };

  const DEFAULT_HEROES = [
    {
      id:'spider', n:'Homem-Aranha', r:'Peter Parker', i:'🕷️', rank:4, tier:'HERÓI', pdf:'assets/pdfs/hero-homem-aranha.pdf',
      role:'Herói principal / investigador', hook:'Investiga os roubos científicos e as pistas ligadas ao Projeto Arachne.',
      maxHealth:90, maxFocus:90, currentHealth:90, currentFocus:90, karma:4, healthDR:'—', focusDR:'—', initiative:'+3E',
      speed:'Correr 6 · Escalar 6 · Nadar 3 · Pular 6 · Planar 12 · Balanço com teia 18', movement:{run:6,climb:6,swim:3,jump:6,glide:12,swingline:18}, occupation:'Fotógrafo / Estudante', origin:'Humano Alterado', teams:'Avengers, Fantastic Four, Web-Warriors', base:'Nova York',
      stats:[['Health',90],['Focus',90],['Karma',4]],
      abilities:{Melee:5,Agility:7,Resilience:3,Vigilance:3,Ego:0,Logic:4},
      traits:['Audience','Combat Reflexes','Connections: Sources','Free Running','Inventor','Pundit','Scientific Expertise','Weird'],
      tags:['Heroic','Obligation: Aunt May','Poor','Secret Identity'],
      powers:['Sentido Aranha','Escalar Paredes','Balanço com Teia','Agarrão com Teia','Golpe Brutal','Ataques Rápidos','Arremesso Rápido']
    },
    {
      id:'wolverine', n:'Wolverine', r:'James Howlett / Logan', i:'🗡️', rank:4, tier:'HERÓI', pdf:'assets/pdfs/hero-wolverine.pdf',
      role:'Herói principal / rastreador', hook:'A rivalidade com Dentes-de-Sabre coloca Logan no centro da caçada genética.',
      maxHealth:150, maxFocus:150, currentHealth:150, currentFocus:150, karma:4, healthDR:'—', focusDR:'—', initiative:'+4E',
      speed:'Correr 5 · Escalar 3 · Nadar 3 · Pular 3', movement:{run:5,climb:3,swim:3,jump:3}, occupation:'Aventureiro / X-Men', origin:'Mutante', teams:'X-Men, X-Force, Avengers', base:'Krakoa / móvel',
      stats:[['Health',150],['Focus',150],['Karma',4]],
      abilities:{Melee:7,Agility:2,Resilience:5,Vigilance:4,Ego:1,Logic:1},
      traits:['Battle Ready','Berserker','Combat Expert','Combat Reflexes','Connections: Military','Extraordinary Origin','Situational Awareness','Tech Reliance'],
      tags:['Extreme Appearance','Enemy: Sabretooth','Heroic','Hounded','Krakoan','Public Identity','X-Gene'],
      powers:['Garras de Adamantium','Fator de Cura','Sentidos Aguçados 1','Ataque Imparável','Ataques Furiosos','Bater e Correr','Frenesi Giratório','Pulo 1']
    },
    {
      id:'cap', n:'Capitão América', r:'Steve Rogers', i:'🛡️', rank:4, tier:'HERÓI', pdf:'assets/pdfs/hero-capitao-america.pdf',
      role:'Herói principal / líder tático', hook:'A Hydra e Ossos Cruzados estão diretamente ligados ao passado e aos ideais de Steve Rogers.',
      maxHealth:90, maxFocus:120, currentHealth:90, currentFocus:120, karma:4, healthDR:'—', focusDR:'—', initiative:'+2E',
      speed:'Correr 5 · Escalar 3 · Nadar 3 · Pular 3', movement:{run:5,climb:3,swim:3,jump:3}, occupation:'Soldado', origin:'Humano Aprimorado', teams:'Avengers, Invaders, S.H.I.E.L.D.', base:'Nova York / EUA',
      stats:[['Health',90],['Focus',120],['Karma',4]],
      abilities:{Melee:6,Agility:4,Resilience:3,Vigilance:3,Ego:2,Logic:2},
      traits:['Battle Ready','Beguiling','Combat Expert','Combat Reflexes','Connections: Military','Public Speaking','Situational Awareness','Weird'],
      tags:['Enemy: Hydra','Enemy: Red Skull','Heroic','Public Identity'],
      powers:['Escudo Ricochete','Bloqueio com Escudo','Liderança Inspiradora','Truque de Combate','Golpe Brutal','Arremesso Rápido','Poderoso 1']
    }
  ];

  const DEFAULT_VILLAINS = [
    {
      id:'octopus', n:'Doutor Octopus', r:'Otto Octavius', i:'🐙', rank:4, tier:'AMEAÇA', pdf:'assets/pdfs/villain-doutor-octopus.pdf',
      role:'Cientista / primeiro grande suspeito', hook:'Ligado à parte científica do Projeto Arachne.',
      maxHealth:90, maxFocus:60, currentHealth:90, currentFocus:60, karma:'—', healthDR:'—', focusDR:'—', initiative:'+2',
      speed:'Correr 5 · Escalar 5 · Nadar 3 · Pular 5', movement:{run:5,climb:5,swim:3,jump:5}, occupation:'Cientista', origin:'Alta Tecnologia, Ciência Bizarra', teams:'Masters of Evil, Sinister Six', base:'Nova York',
      abilities:{Melee:4,Agility:3,Resilience:3,Vigilance:2,Ego:4,Logic:5},
      traits:['Abrasivo','Origem Extraordinária','Inventor','Especialista Científico','Cético','Dependência Tecnológica','Estranho'],
      tags:['Acesso a Laboratório','Identidade Pública','Vilanesco'],
      powers:['Membro Adicional','Brilhantismo 2','Poderoso 2','Alcance Estendido 1','Esquiva Aracnídea','Escalar Paredes','Golpear Cabeças','Agarrão Esmagador','Golpe Brutal','Pulo 1','Arremesso Rápido','Telepatia com Máquinas']
    },
    {
      id:'sabretooth', n:'Dentes-de-Sabre', r:'Victor Creed', i:'🐯', rank:4, tier:'AMEAÇA', pdf:'assets/pdfs/villain-dentes-de-sabre.pdf',
      role:'Rival pessoal de Wolverine', hook:'Enviado para capturar Logan e estudar seu fator de cura.',
      maxHealth:180, maxFocus:150, currentHealth:180, currentFocus:150, karma:'—', healthDR:'-1', focusDR:'—', initiative:'+4E',
      speed:'Correr 5 · Escalar 3 · Nadar 3 · Pular 5', movement:{run:5,climb:3,swim:3,jump:5}, occupation:'Militar', origin:'Alta Tecnologia: Cibernética, Mutante', teams:'1959 Avengers, Brotherhood of Evil Mutants, Hand, Marauders, Team X, X-Factor', base:'Krakoa',
      abilities:{Melee:7,Agility:4,Resilience:6,Vigilance:4,Ego:0,Logic:0},
      traits:['Abrasivo','Pronto para Batalha','Berserker','Reflexos de Combate','Conexões: Militar','Origem Extraordinária','Consciência Situacional','Furtivo','Dependência Tecnológica'],
      tags:['Aparência Extrema','Caçado','Krakoano','Vilanesco','Gene-X'],
      powers:['Luta de Rua','Truque de Combate','Fator de Cura','Sentidos Aguçados 1','Poderoso 1','Esqueleto Reforçado','Explorar Fraqueza','Ataques Rápidos','Fúria Focada','Ataques Furiosos','Bater e Correr','Ripostar','Ataque Imparável','Ataque Cruel','Frenesi Giratório','Pulo 1']
    },
    {
      id:'crossbones', n:'Ossos Cruzados', r:'Brock Rumlow', i:'☠️', rank:3, tier:'AMEAÇA', pdf:'assets/pdfs/villain-ossos-cruzados.pdf',
      role:'Operação Hydra', hook:'Tenta roubar a amostra de Steve Rogers.',
      maxHealth:90, maxFocus:90, currentHealth:90, currentFocus:90, karma:'—', healthDR:'—', focusDR:'—', initiative:'+2E',
      speed:'Correr 6 · Escalar 3 · Nadar 3 · Pular 3', movement:{run:6,climb:3,swim:3,jump:3}, occupation:'Militar', origin:'Treinamento Especial', teams:'Hydra, Thunderbolts, Skeleton Crew', base:'Móvel',
      abilities:{Melee:4,Agility:5,Resilience:3,Vigilance:2,Ego:0,Logic:1},
      traits:['Pronto para Batalha','Sanguinário','Especialista em Combate','Conexões: Militar (Hydra)','Determinação','Pilotagem','Consciência Situacional'],
      tags:['Reforços','Identidade Pública','Vilanesco','Arma Característica: Submetralhadora'],
      powers:['Precisão 2','Esquiva em Câmera Lenta','Golpear Cabeças','Técnica de Agarrão','Dança da Morte','Tiro Duplo','Mãos Rápidas','Aparar à Queima-Roupa','Esquiva de Tiro em Câmera Lenta','Tiro Instantâneo','Poder de Parada','Armas em Chamas']
    },
    {
      id:'goblin', n:'Duende Verde', r:'Norman Osborn', i:'🎃', rank:4, tier:'AMEAÇA', pdf:'assets/pdfs/villain-duende-verde.pdf',
      role:'Vilão intermediário', hook:'Invade o projeto para roubar a tecnologia.',
      maxHealth:120, maxFocus:60, currentHealth:120, currentFocus:60, karma:'—', healthDR:'-1', focusDR:'—', initiative:'+2',
      speed:'Correr 6 · Escalar 3 · Nadar 3 · Voo 24', movement:{run:6,climb:3,swim:3,flight:24}, occupation:'Criminoso, Magnata', origin:'Ciência Bizarra', teams:'Dark Avengers, Goblin Nation, Sinister Six, Thunderbolts', base:'Nova York',
      abilities:{Melee:5,Agility:5,Resilience:4,Vigilance:2,Ego:1,Logic:3},
      traits:['Conexões: Celebridades','Conexões: Criminalidade','Negociador','Ocupação Extra','Famoso','Inventor','Dependência Tecnológica','Estranho'],
      tags:['Acesso ao Mercado Negro','Inimigo: Homem-Aranha','Quartel-General','Rico','Identidade Secreta','Conhecimento das Ruas','Vilanesco','Arma Característica: Bombas-Abóbora'],
      powers:['Precisão 1','Truque de Combate','Voo 2','Fator de Cura','Inspiração','Poderoso 2','Robusto 1','Rajada Elemental','Explosão Elemental','Golpear Cabeças','Golpe Brutal','Agarrão Esmagador','Arremesso Rápido','Plano de Batalha','Mudança de Planos']
    },
    {
      id:'hydra-agent', n:'Agente da Hydra', r:'Identidade variável', i:'🐍', rank:1, tier:'CAPANGA', pdf:'assets/pdfs/villain-agente-hydra.pdf',
      role:'Soldado / reforço da Hydra', hook:'Capanga para instalações da Hydra e para a Sessão 4.',
      maxHealth:30, maxFocus:60, currentHealth:30, currentFocus:60, karma:'—', healthDR:'—', focusDR:'—', initiative:'+1E',
      speed:'Correr 5 · Escalar 3 · Nadar 3 · Pular 3', movement:{run:5,climb:3,swim:3,jump:3}, occupation:'Militar', origin:'Treinamento Especial', teams:'Hydra', base:'Secreta',
      abilities:{Melee:1,Agility:1,Resilience:1,Vigilance:1,Ego:1,Logic:0},
      traits:['Pronto para Batalha','Reflexos de Combate','Conexões: Militares (Hydra)','Determinação','Consciência Situacional'],
      tags:['Identidade Secreta','Vilanesco'],
      powers:['Disparo Duplo','Disparo Instintivo','Fogo Supressivo','Armas em Rajada']
    },
    {
      id:'aim-agent', n:'Agente da I.M.A.', r:'Identidade variável', i:'🧪', rank:1, tier:'CAPANGA', pdf:'assets/pdfs/villain-agente-ima.pdf',
      role:'Cientista / suporte tecnológico', hook:'Unidade científica extra para laboratórios, escoltas e encontros tecnológicos.',
      maxHealth:10, maxFocus:60, currentHealth:10, currentFocus:60, karma:'—', healthDR:'—', focusDR:'—', initiative:'+1',
      speed:'Correr 5 · Escalar 3 · Nadar 3 · Pular 3', movement:{run:5,climb:3,swim:3,jump:3}, occupation:'Cientista', origin:'Alta Tecnologia', teams:'I.M.A.', base:'Q.G. da I.M.A.',
      abilities:{Melee:0,Agility:1,Resilience:0,Vigilance:1,Ego:1,Logic:3},
      traits:['Pronto para Batalha','Inventor','Dependência Tecnológica','Especialista Científico'],
      tags:['Acesso a Laboratório','Identidade Secreta','Vilanesco'],
      powers:['Precisão 1','Brilhantismo 1','Rajada Elemental']
    },
    {
      id:'sinister', n:'Senhor Sinistro', r:'Nathaniel Essex', i:'🧬', rank:5, tier:'CHEFE FINAL', pdf:'assets/pdfs/villain-senhor-sinistro.pdf',
      role:'VILÃO FINAL', hook:'O verdadeiro cérebro por trás da coleta genética.',
      maxHealth:180, maxFocus:120, currentHealth:180, currentFocus:120, karma:'—', healthDR:'-1', focusDR:'—', initiative:'+4E',
      speed:'Correr 5 · Escalar 3 · Nadar 3 · Voo 25', movement:{run:5,climb:3,swim:3,flight:25}, occupation:'Cientista, Criminoso', origin:'Ciência Bizarra', teams:'Marauders, Conselho Silencioso, Nasty Boys', base:'Laboratórios secretos',
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



  // Biblioteca privada de ameaças. Só é renderizada quando o perfil Mestre está ativo.
  const MINION_TEMPLATES = {
    'minion-melee': {id:'minion-melee', n:'Capanga · Curta distância', i:'◆', abilities:{Melee:2,Agility:1,Resilience:2,Vigilance:1,Ego:0,Logic:0}, movement:{run:5,climb:3,swim:3,jump:3}, initiative:'+1', damage:{Melee:[2,2],Agility:[1,1],Ego:[1,0],Logic:[1,0]}},
    'minion-ranged': {id:'minion-ranged', n:'Capanga · Longo alcance', i:'◇', abilities:{Melee:1,Agility:2,Resilience:1,Vigilance:2,Ego:0,Logic:0}, movement:{run:5,climb:3,swim:3,jump:3}, initiative:'+2', damage:{Melee:[1,1],Agility:[2,2],Ego:[1,0],Logic:[1,0]}},
    'minion-support': {id:'minion-support', n:'Capanga · Suporte', i:'✦', abilities:{Melee:0,Agility:1,Resilience:1,Vigilance:2,Ego:1,Logic:2}, movement:{run:5,climb:3,swim:3,jump:3}, initiative:'+2', damage:{Melee:[1,0],Agility:[1,1],Ego:[1,1],Logic:[2,2]}}
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
    preset:'empty', environment:'lab', width:20, height:14, baseTerrain:'floor', selectedTool:'select', selectedPiece:null, selectedMode:'run', zoom:1,
    obstacles:{}, terrain:{}, decor:{}, turnMovement:{}, movementSpent:{}, pieces:[
      {id:'hero-spider',kind:'hero',baseId:'spider',name:'Homem-Aranha',short:'HA',color:'#ef4444',x:2,y:11,movement:{run:6,climb:6,swim:3,jump:6,glide:12,swingline:18}},
      {id:'hero-wolverine',kind:'hero',baseId:'wolverine',name:'Wolverine',short:'W',color:'#facc15',x:4,y:12,movement:{run:5,climb:3,swim:3,jump:3}},
      {id:'hero-cap',kind:'hero',baseId:'cap',name:'Capitão América',short:'CA',color:'#3b82f6',x:2,y:12,movement:{run:5,climb:3,swim:3,jump:3}}
    ]
  };

  const $ = id => document.getElementById(id);
  const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clone = value => typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value));
  const escapeHTML = value => String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));

  function characterArt(id, custom = '') {
    return custom || CHARACTER_ART[id]?.src || '';
  }

  function characterArtPosition(id) {
    return CHARACTER_ART[id]?.position || 'center center';
  }

  function monogram(label='?') {
    return String(label||'?').split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]).join('').toUpperCase() || '?';
  }

  function characterArtMarkup(id, label, extraClass = '', custom = '') {
    const src = characterArt(id, custom);
    const pos = characterArtPosition(id);
    return src
      ? `<img class="character-art-image ${extraClass}" src="${escapeHTML(src)}" alt="${escapeHTML(label)}" loading="lazy" style="object-position:${escapeHTML(pos)}">`
      : `<span class="hero-glyph ${escapeHTML(extraClass)}"><b>${escapeHTML(monogram(label))}</b><small>${escapeHTML(label)}</small></span>`;
  }

  const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));
  const rand = sides => Math.floor(Math.random() * sides) + 1;
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let backendReady = false;
  let activeCampaign = null;
  let availableTemplates = [];
  let availableCharacters = {heroes:[],villains:[]};
  let createCampaignMode = 'template';
  let selectedTemplateId = 'arachne';
  let builderHeroIds = [];
  let builderVillainIds = [];

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : clone(fallback);
    } catch {
      return clone(fallback);
    }
  }
  function saveJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    if (backendReady && window.ArachneAPI) window.ArachneAPI.saveStorageKey(key, value);
  }

  // Migração automática de versões anteriores para a estrutura atual.
  const priorVersions = [18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3];
  const migrateJsonKey = (name, suffix = name) => {
    if (localStorage.getItem(STORAGE[name]) != null) return;
    const oldKey = priorVersions.map(v => `arachne_v${v}_${suffix}`).find(key => localStorage.getItem(key) != null);
    if (oldKey) localStorage.setItem(STORAGE[name], localStorage.getItem(oldKey));
  };
  migrateJsonKey('heroes');
  migrateJsonKey('villains');
  migrateJsonKey('campaign');
  migrateJsonKey('dice');
  migrateJsonKey('challenge');
  migrateJsonKey('scenario');
  migrateJsonKey('initiative');
  migrateJsonKey('notesPlayer','notes_player');
  migrateJsonKey('notesMaster','notes_master');
  migrateJsonKey('playerNotes','player_notes');
  if (!localStorage.getItem(STORAGE.notesPlayer)) {
    const legacy = localStorage.getItem('arachne_v3_notes') ?? localStorage.getItem('arachne_notes');
    if (legacy != null) localStorage.setItem(STORAGE.notesPlayer, legacy || '');
  }
  if (!localStorage.getItem(STORAGE.playerNotes)) localStorage.setItem(STORAGE.playerNotes, JSON.stringify({spider:'',wolverine:'',cap:''}));

  function normalizeHero(hero, fallback) {
    fallback = fallback || {
      id:hero?.id || `hero-${Date.now()}`, n:hero?.n || 'Novo Herói', r:hero?.r || '', i:'', rank:4, tier:'HERÓI', pdf:'', image:'', role:'Herói da campanha', hook:'',
      maxHealth:90,maxFocus:90,currentHealth:90,currentFocus:90,karma:4,healthDR:'—',focusDR:'—',initiative:'+0',speed:'Correr 5 · Escalar 3 · Nadar 3 · Pular 3',movement:{run:5,climb:3,swim:3,jump:3},occupation:'',origin:'',teams:'',base:'',stats:[['Health',90],['Focus',90],['Karma',4]],abilities:{Melee:0,Agility:0,Resilience:0,Vigilance:0,Ego:0,Logic:0},traits:[],tags:['Heroic'],powers:[]
    };
    const out = {...clone(fallback), ...(hero || {})};
    out.id = hero?.id || fallback.id;
    out.traits = Array.isArray(hero?.traits) ? hero.traits : clone(fallback.traits);
    out.tags = Array.isArray(hero?.tags) ? hero.tags : clone(fallback.tags);
    out.powers = Array.isArray(hero?.powers) ? hero.powers : clone(fallback.powers || []);
    out.abilities = {...fallback.abilities, ...(hero?.abilities || {})};
    out.movement = {...(fallback.movement||{}), ...(hero?.movement||{})};
    const rawHealth = Number(hero?.maxHealth ?? statValueRaw(hero,'Health') ?? fallback.maxHealth ?? statValueRaw(fallback,'Health') ?? 0);
    const rawFocus = Number(hero?.maxFocus ?? statValueRaw(hero,'Focus') ?? fallback.maxFocus ?? statValueRaw(fallback,'Focus') ?? 0);
    const rawKarma = Number(hero?.karma ?? statValueRaw(hero,'Karma') ?? fallback.karma ?? statValueRaw(fallback,'Karma') ?? 0);
    out.maxHealth = clamp(rawHealth,0,9999);
    out.maxFocus = clamp(rawFocus,0,9999);
    out.currentHealth = Math.min(clamp(hero?.currentHealth ?? out.maxHealth,0,9999), out.maxHealth);
    out.currentFocus = Math.min(clamp(hero?.currentFocus ?? out.maxFocus,0,9999), out.maxFocus);
    out.karma = clamp(rawKarma,0,99);
    out.tier = String(out.tier || fallback.tier || 'HERÓI');
    out.healthDR = out.healthDR || '—';
    out.focusDR = out.focusDR || '—';
    out.initiative = String(out.initiative || fallback.initiative || '+0');
    out.speed = out.speed || fallback.speed || '';
    out.occupation = out.occupation || fallback.occupation || '';
    out.origin = out.origin || fallback.origin || '';
    out.teams = out.teams || fallback.teams || '';
    out.base = out.base || fallback.base || '';
    out.role = out.role || fallback.role || '';
    out.hook = out.hook || fallback.hook || '';
    out.stats = [['Health',out.maxHealth],['Focus',out.maxFocus],['Karma',out.karma]];
    // Corrige apenas os valores-padrão errados da v3; valores personalizados permanecem intactos.
    if (out.id === 'spider' && statValueRaw(out,'Health') === 80 && statValueRaw(out,'Focus') === 100) {
      out.maxHealth = 90;
      out.maxFocus = 90;
      out.currentHealth = Math.min(out.currentHealth || 90, out.maxHealth);
      out.currentFocus = Math.min(out.currentFocus || 90, out.maxFocus);
      out.karma = out.karma || 4;
      out.stats = [['Health',90],['Focus',90],['Karma',out.karma]];
    }
    if (out.id === 'wolverine' && statValueRaw(out,'Health') === 100 && statValueRaw(out,'Focus') === 130) {
      out.maxHealth = 150;
      out.maxFocus = 150;
      out.currentHealth = Math.min(out.currentHealth || 150, out.maxHealth);
      out.currentFocus = Math.min(out.currentFocus || 150, out.maxFocus);
      out.karma = out.karma || 4;
      out.stats = [['Health',150],['Focus',150],['Karma',out.karma]];
    }
    return out;
  }
  function statValueRaw(hero, name) { return hero?.stats?.find(([key]) => key === name)?.[1] ?? 0; }

  function normalizeVillain(villain, fallback) {
    fallback = fallback || {
      id:villain?.id || `villain-${Date.now()}`, n:villain?.n || 'Novo Vilão', r:villain?.r || '', i:'', rank:4, tier:'AMEAÇA', pdf:'', image:'', role:'AMEAÇA', hook:'',maxHealth:90,maxFocus:60,currentHealth:90,currentFocus:60,karma:'—',healthDR:'—',focusDR:'—',initiative:'+0',speed:'Correr 5 · Escalar 3 · Nadar 3 · Pular 3',movement:{run:5,climb:3,swim:3,jump:3},occupation:'',origin:'',teams:'',base:'',abilities:{Melee:0,Agility:0,Resilience:0,Vigilance:0,Ego:0,Logic:0},traits:[],tags:['Villainous'],powers:[]
    };
    const out = {...clone(fallback), ...(villain || {})};
    out.id = villain?.id || fallback.id;
    out.abilities = {...fallback.abilities, ...(villain?.abilities || {})};
    out.movement = {...(fallback.movement||{}), ...(villain?.movement||{})};
    out.traits = Array.isArray(villain?.traits) ? villain.traits : clone(fallback.traits);
    out.tags = Array.isArray(villain?.tags) ? villain.tags : clone(fallback.tags);
    out.powers = Array.isArray(villain?.powers) ? villain.powers : clone(fallback.powers);
    out.maxHealth = clamp(out.maxHealth,0,9999);
    out.maxFocus = clamp(out.maxFocus,0,9999);
    out.currentHealth = Math.min(clamp(out.currentHealth,0,9999), out.maxHealth);
    out.currentFocus = Math.min(clamp(out.currentFocus,0,9999), out.maxFocus);
    return out;
  }

  function normalizeHeroList(list) {
    return (Array.isArray(list) ? list : []).map(item => normalizeHero(item, DEFAULT_HEROES.find(f => f.id === item?.id)));
  }

  function normalizeVillainList(list) {
    return (Array.isArray(list) ? list : []).map(item => normalizeVillain(item, DEFAULT_VILLAINS.find(f => f.id === item?.id)));
  }

  const loadedHeroes = loadJSON(STORAGE.heroes, DEFAULT_HEROES);
  const loadedVillains = loadJSON(STORAGE.villains, DEFAULT_VILLAINS);
  const DEFAULT_CAMPAIGN_CONTENT = {title:'Projeto Arachne',subtitle:'Conspiração genética em 8 sessões',summary:'Três heróis. Um experimento. Uma mente por trás de tudo.',rank:4,players:3,finalVillain:'Senhor Sinistro',accent:'#ef3340',sessions:clone(SESSIONS),documentMode:'pdf',campaignPdf:CAMPAIGN_PDF,editorText:'',templateId:'arachne',templateName:'Projeto Arachne'};
  const state = {
    role:'player', selectedHero:null, page:'home', diceMode:'d616', rolling:false, currentRoll:null,
    heroes: DEFAULT_HEROES.map((fallback, i) => normalizeHero((Array.isArray(loadedHeroes) ? loadedHeroes.find(item => item?.id === fallback.id) : null) || loadedHeroes[i] || fallback, fallback)),
    villains: DEFAULT_VILLAINS.map((fallback, i) => normalizeVillain((Array.isArray(loadedVillains) ? loadedVillains.find(item => item?.id === fallback.id) : null) || fallback, fallback)),
    campaign: loadJSON(STORAGE.campaign, Object.fromEntries(SESSIONS.map(s => [s.id, 'todo']))),
    campaignContent: {...clone(DEFAULT_CAMPAIGN_CONTENT), ...loadJSON(STORAGE.campaignContent, DEFAULT_CAMPAIGN_CONTENT)},
    diceHistory: loadJSON(STORAGE.dice, []),
    challenge: {...DEFAULT_CHALLENGE, ...loadJSON(STORAGE.challenge, DEFAULT_CHALLENGE)},
    scenario: {...clone(DEFAULT_SCENARIO), ...loadJSON(STORAGE.scenario, DEFAULT_SCENARIO)},
    initiativeParticipants: loadJSON(STORAGE.initiative, []),
    playerNotes: {...{spider:'',wolverine:'',cap:''}, ...loadJSON(STORAGE.playerNotes, {spider:'',wolverine:'',cap:''})}
  };
  saveJSON(STORAGE.heroes, state.heroes);
  saveJSON(STORAGE.villains, state.villains);

  function campaignCacheId(campaign) {
    return String(campaign?.id || campaign?.code || 'lobby').replace(/[^a-z0-9_-]/gi,'_').slice(0,80) || 'lobby';
  }

  function campaignLibrary() {
    try {
      const value = JSON.parse(localStorage.getItem(CAMPAIGN_LIBRARY_KEY) || '[]');
      return Array.isArray(value) ? value : [];
    } catch { return []; }
  }

  function rememberCampaign(campaign) {
    if (!campaign?.code) return;
    const next = [campaign, ...campaignLibrary().filter(item => item?.code !== campaign.code)].slice(0,12)
      .map(item => ({ id:item.id, code:item.code, name:item.name, template:item.template || 'arachne', lastOpened:Date.now() }));
    localStorage.setItem(CAMPAIGN_LIBRARY_KEY, JSON.stringify(next));
  }

  function resetCampaignState() {
    const localHeroes = loadJSON(STORAGE.heroes, DEFAULT_HEROES);
    const localVillains = loadJSON(STORAGE.villains, DEFAULT_VILLAINS);
    state.heroes = Array.isArray(localHeroes) ? normalizeHeroList(localHeroes) : normalizeHeroList(DEFAULT_HEROES);
    state.villains = Array.isArray(localVillains) ? normalizeVillainList(localVillains) : normalizeVillainList(DEFAULT_VILLAINS);
    state.campaign = loadJSON(STORAGE.campaign, Object.fromEntries(SESSIONS.map(s=>[s.id,'todo'])));
    state.campaignContent = {...clone(DEFAULT_CAMPAIGN_CONTENT), ...loadJSON(STORAGE.campaignContent, DEFAULT_CAMPAIGN_CONTENT)};
    state.diceHistory = loadJSON(STORAGE.dice, []);
    state.challenge = {...DEFAULT_CHALLENGE, ...loadJSON(STORAGE.challenge, DEFAULT_CHALLENGE)};
    state.scenario = {...clone(DEFAULT_SCENARIO), ...loadJSON(STORAGE.scenario, DEFAULT_SCENARIO)};
    state.initiativeParticipants = loadJSON(STORAGE.initiative, []);
    state.playerNotes = {...{spider:'',wolverine:'',cap:''}, ...loadJSON(STORAGE.playerNotes,{spider:'',wolverine:'',cap:''})};
    state.currentRoll = null;
  }

  function applyCampaignBranding() {
    const name = activeCampaign?.name || state.campaignContent?.title || 'Projeto Arachne';
    const code = activeCampaign?.code || 'ARACHNE';
    const brand = $('sidebar-campaign-name');
    if (brand) brand.innerHTML = escapeHTML(name).replace(/\s+/g,'<br>');
    if ($('sidebar-campaign-code')) $('sidebar-campaign-code').textContent = `CÓDIGO ${code}`;
    const bannerTitle = document.querySelector('#home .banner h2');
    if (bannerTitle) bannerTitle.textContent = name.toUpperCase();
    const bannerText = document.querySelector('#home .banner p');
    if (bannerText) bannerText.textContent = state.campaignContent?.summary || state.campaignContent?.subtitle || activeCampaign?.campaignContent?.subtitle || 'Mesa Marvel Multiverse RPG.';
    document.title = `${name} — Marvel Multiverse RPG`;
  }

  function selectCampaign(campaign) {
    if (!campaign) return;
    activeCampaign = campaign;
    activeCampaignCacheKey = campaignCacheId(campaign);
    // Migra automaticamente os dados locais antigos apenas para a campanha Arachne original.
    if (campaign.code === 'ARACHNE') {
      const legacy = {
        heroes:'heroes', villains:'villains', campaign:'campaign', dice:'dice', challenge:'challenge', scenario:'scenario', initiative:'initiative',
        playerNotes:'player_notes', notesPlayer:'notes_player', notesMaster:'notes_master'
      };
      for (const [name,suffix] of Object.entries(legacy)) {
        if (localStorage.getItem(STORAGE[name]) != null) continue;
        const old = localStorage.getItem(`arachne_v17_${suffix}`);
        if (old != null) localStorage.setItem(STORAGE[name], old);
      }
    }
    resetCampaignState();
    if(campaign.campaignContent) state.campaignContent={...state.campaignContent,...campaign.campaignContent,title:campaign.campaignContent.title||campaign.name};
    rememberCampaign(campaign);
    renderPlayerChoices(campaign.heroes || []);
    $('campaign-hub')?.classList.add('hidden');
    $('campaign-access')?.classList.remove('hidden');
    if ($('selected-campaign-code')) $('selected-campaign-code').textContent = `CÓDIGO ${campaign.code}`;
    if ($('selected-campaign-name')) $('selected-campaign-name').textContent = campaign.name;
    $('login-title').textContent = campaign.name.toUpperCase();
    $('campaign-error').textContent = '';
    applyCampaignBranding();
  }

  function returnToCampaignHub() {
    window.ArachneAPI?.clearSession?.();
    backendReady = false;
    activeCampaign = null;
    activeCampaignCacheKey = 'lobby';
    $('campaign-access')?.classList.add('hidden');
    $('player-select-area')?.classList.add('hidden');
    $('password-area')?.classList.add('hidden');
    qsa('.login-actions').forEach(el=>el.classList.remove('hidden'));
    $('campaign-hub')?.classList.remove('hidden');
    $('login-title').textContent = 'SUAS CAMPANHAS';
    renderCampaignLibrary();
  }

  async function renderCampaignLibrary() {
    const wrap = $('campaign-library');
    if (!wrap || !window.ArachneAPI) return;
    const saved = campaignLibrary();
    const codes = ['ARACHNE', ...saved.map(item=>item.code)].filter(Boolean);
    let campaigns = [];
    try { campaigns = await window.ArachneAPI.lookupCampaigns(codes); } catch {}
    const byCode = new Map(campaigns.map(item=>[item.code,item]));
    const ordered = [...new Set(codes)].map(code=>byCode.get(code)).filter(Boolean);
    wrap.innerHTML = ordered.length ? ordered.map(campaign=>`<button type="button" class="campaign-card" data-open-campaign="${escapeHTML(campaign.code)}"><span>${escapeHTML(campaign.code.slice(0,2))}</span><div><b>${escapeHTML(campaign.name)}</b><small>Código ${escapeHTML(campaign.code)}</small></div><i>→</i></button>`).join('') : '<div class="campaign-empty">Nenhuma campanha encontrada.</div>';
  }

  async function loadTemplateLibrary() {
    if (!window.ArachneAPI) return [];
    try { availableTemplates = await window.ArachneAPI.getTemplates(); } catch { availableTemplates = []; }
    try {
      const library = await window.ArachneAPI.getCharacters();
      availableCharacters = {
        heroes:Array.isArray(library?.heroes)?library.heroes:[],
        villains:Array.isArray(library?.villains)?library.villains:[]
      };
    } catch {
      availableCharacters = {heroes:[],villains:[]};
    }
    const preferred = availableTemplates.find(t=>t.id===selectedTemplateId) || availableTemplates[0] || null;
    if (preferred) {
      selectedTemplateId = preferred.id;
      if ($('new-campaign-name') && !$('new-campaign-name').value.trim() && createCampaignMode==='template') $('new-campaign-name').value = preferred.name;
    }
    syncBuilderRosterFromTemplate(true);
    renderTemplatePicker();
    renderTemplatePreview();
    renderBuilderCharacterLibrary();
    return availableTemplates;
  }

  function currentBuilderTemplate() {
    return availableTemplates.find(t=>t.id===selectedTemplateId) || availableTemplates[0] || null;
  }

  function syncBuilderRosterFromTemplate(force = false) {
    const template = currentBuilderTemplate();
    if (createCampaignMode === 'template' && template) {
      if (force || !builderHeroIds.length) builderHeroIds = (template.heroes || []).map(hero => hero.id);
      if (force || !builderVillainIds.length) builderVillainIds = (template.villains || []).map(villain => villain.id);
    } else if (force) {
      builderHeroIds = [];
      builderVillainIds = [];
    }
  }

  function renderTemplatePicker() {
    const wrap = $('template-picker');
    if (!wrap) return;
    wrap.innerHTML = availableTemplates.map(template => {
      const featured = (template.villains || []).find(item => item.image) || (template.heroes || []).find(item => item.image) || template.villains?.[0] || template.heroes?.[0];
      const art = featured ? characterArtMarkup(featured.id, featured.n, 'template-card-art-image', featured.image || '') : `<span class="hero-glyph template-card-art-image"><b>${escapeHTML(String(template.name||'C').slice(0,1).toUpperCase())}</b><small>CAMPANHA</small></span>`;
      return `<button type="button" class="template-card ${selectedTemplateId===template.id?'active':''}" data-template-id="${escapeHTML(template.id)}" style="--template-accent:${escapeHTML(template.accent||'#ef3340')}"><span class="template-card-art">${art}</span><div><small>${escapeHTML(template.players)} JOGADORES · RANK ${escapeHTML(template.rank)} · ${escapeHTML((template.sessions||[]).length)} SESSÕES</small><b>${escapeHTML(template.name)}</b><span>${escapeHTML(template.subtitle||template.summary||'')}</span></div><em>${escapeHTML(template.finalVillain||'')}</em></button>`;
    }).join('') || '<div class="campaign-empty">Nenhuma campanha pronta disponível.</div>';
  }

  function renderTemplatePreview() {
    const wrap = $('template-preview');
    if (!wrap) return;
    const template = currentBuilderTemplate();
    const heroes = allTemplateCharacters('hero').filter(item => builderHeroIds.includes(item.id));
    const villains = allTemplateCharacters('villain').filter(item => builderVillainIds.includes(item.id));
    if (createCampaignMode === 'template' && template) {
      const featured = villains.find(item=>item.image) || heroes.find(item=>item.image) || villains[0] || heroes[0];
      wrap.innerHTML = `<div class="template-preview-card" style="--template-accent:${escapeHTML(template.accent||'#ef3340')}"><div class="template-preview-art">${featured ? characterArtMarkup(featured.id, featured.n, 'template-preview-art-image', featured.image || '') : ''}<span class="template-preview-shade"></span><div class="template-preview-copy"><small>CAMPANHA BASE</small><b>${escapeHTML(template.name)}</b><span>${escapeHTML(template.summary || template.subtitle || '')}</span><div class="template-preview-meta"><span>${heroes.length} heróis</span><span>${villains.length} vilões</span><span>${(template.sessions||[]).length} sessões</span></div></div></div><div class="template-preview-roster"><div><small>HERÓIS SELECIONADOS</small><p>${heroes.map(item=>escapeHTML(item.n)).join(' · ') || 'Nenhum'}</p></div><div><small>VILÕES SELECIONADOS</small><p>${villains.map(item=>escapeHTML(item.n)).join(' · ') || 'Nenhum'}</p></div></div></div>`;
      return;
    }
    const label = createCampaignMode === 'pdf' ? 'CAMPANHA POR PDF' : 'CAMPANHA EM BRANCO';
    const description = createCampaignMode === 'pdf'
      ? 'Monte o elenco agora e envie o PDF da campanha. Depois você ainda pode editar sessões, fichas e anexos.'
      : 'Comece do zero, monte o elenco e personalize a história do jeito que quiser.';
    wrap.innerHTML = `<div class="template-preview-card is-generic"><div class="template-preview-generic"><small>${label}</small><b>${escapeHTML($('new-campaign-name')?.value.trim() || 'Nova Campanha')}</b><span>${description}</span><div class="template-preview-meta"><span>${builderHeroIds.length} heróis</span><span>${builderVillainIds.length} vilões</span><span>100% personalizável</span></div></div></div>`;
  }

  function renderBuilderCharacterLibrary() {
    const heroWrap = $('builder-hero-library');
    const villainWrap = $('builder-villain-library');
    const heroes = allTemplateCharacters('hero');
    const villains = allTemplateCharacters('villain');
    if ($('builder-hero-count')) $('builder-hero-count').textContent = String(builderHeroIds.length).padStart(2,'0');
    if ($('builder-villain-count')) $('builder-villain-count').textContent = String(builderVillainIds.length).padStart(2,'0');
    if (heroWrap) heroWrap.innerHTML = heroes.map(item => {
      const active = builderHeroIds.includes(item.id);
      return `<button type="button" class="builder-character-card ${active?'active':''}" data-builder-select="${escapeHTML(item.id)}" data-builder-kind="hero">${characterArtMarkup(item.id, item.n, 'builder-card-image', item.image || '')}<div><b>${escapeHTML(item.n)}</b><small>${escapeHTML(item.r || item.role || `Rank ${item.rank||4}`)}</small></div></button>`;
    }).join('') || '<div class="campaign-empty">Nenhum herói disponível.</div>';
    if (villainWrap) villainWrap.innerHTML = villains.map(item => {
      const active = builderVillainIds.includes(item.id);
      return `<button type="button" class="builder-character-card ${active?'active':''}" data-builder-select="${escapeHTML(item.id)}" data-builder-kind="villain">${characterArtMarkup(item.id, item.n, 'builder-card-image', item.image || '')}<div><b>${escapeHTML(item.n)}</b><small>${escapeHTML(item.tier || item.role || `Rank ${item.rank||4}`)}</small></div></button>`;
    }).join('') || '<div class="campaign-empty">Nenhum vilão disponível.</div>';
    renderTemplatePreview();
  }

  function toggleBuilderSelection(kind, id) {
    if (!id) return;
    const source = kind === 'hero' ? [...builderHeroIds] : [...builderVillainIds];
    const index = source.indexOf(id);
    if (index >= 0) source.splice(index, 1);
    else source.push(id);
    if (kind === 'hero') builderHeroIds = [...new Set(source)];
    else builderVillainIds = [...new Set(source)];
    renderBuilderCharacterLibrary();
  }

  function setCreateCampaignMode(mode) {
    createCampaignMode = ['template','blank','pdf'].includes(mode) ? mode : 'template';
    qsa('[data-create-mode]').forEach(btn => btn.classList.toggle('active',btn.dataset.createMode===createCampaignMode));
    $('template-picker-wrap')?.classList.toggle('hidden',createCampaignMode!=='template');
    $('pdf-create-wrap')?.classList.toggle('hidden',createCampaignMode!=='pdf');
    const rosterLabel = $('builder-roster-label');
    if (rosterLabel) rosterLabel.textContent = createCampaignMode === 'template' ? 'Elenco inicial da campanha' : 'Monte seu elenco';
    if (createCampaignMode === 'template') {
      const template = currentBuilderTemplate();
      if (template) {
        selectedTemplateId = template.id;
        if (!$('new-campaign-name').value.trim()) $('new-campaign-name').value = template.name;
      }
    }
    syncBuilderRosterFromTemplate(true);
    renderTemplatePicker();
    renderBuilderCharacterLibrary();
    renderTemplatePreview();
  }

  function renderPlayerChoices(heroes = activeCampaign?.heroes || []) {
    const wrap = $('player-choice-grid'); if(!wrap) return;
    const roster = Array.isArray(heroes) ? heroes : [];
    wrap.innerHTML = roster.length ? roster.map(hero => {
      const image = hero.image || CHARACTER_ART[hero.id]?.src || '';
      return `<button type="button" data-player-hero="${escapeHTML(hero.id)}">${image?`<span class="player-choice-thumb"><img src="${escapeHTML(image)}" alt="${escapeHTML(hero.n)}"></span>`:`<span class="player-choice-thumb player-choice-fallback">${escapeHTML((hero.n||'?').slice(0,2).toUpperCase())}</span>`}<b>${escapeHTML(hero.n||'Herói')}</b><small>${escapeHTML(hero.r||`Rank ${hero.rank||4}`)}</small></button>`;
    }).join('') : '<div class="campaign-empty-state"><b>Sem heróis jogáveis.</b><span>O Mestre precisa adicionar personagens antes dos jogadores entrarem.</span></div>';
  }

  function slugifyId(value,prefix='char') {
    const base=String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,56);
    return base || `${prefix}-${Date.now().toString(36)}`;
  }

  function allTemplateCharacters(kind='hero') {
    const map=new Map();
    const fullLibrary = kind==='hero' ? availableCharacters.heroes : availableCharacters.villains;
    for(const item of fullLibrary||[]){if(item?.id&&!map.has(item.id))map.set(item.id,item);}
    for(const template of availableTemplates){
      for(const item of (kind==='hero'?template.heroes:template.villains)||[]){if(item?.id&&!map.has(item.id))map.set(item.id,item);}
    }
    return [...map.values()].sort((a,b)=>String(a.n||'').localeCompare(String(b.n||''),'pt-BR'));
  }

  function renderCampaignManager() {
    if(state.role!=='master') return;
    const content=state.campaignContent||DEFAULT_CAMPAIGN_CONTENT;
    if($('campaign-edit-title')) $('campaign-edit-title').value=content.title||activeCampaign?.name||'';
    if($('campaign-edit-subtitle')) $('campaign-edit-subtitle').value=content.subtitle||'';
    if($('campaign-edit-summary')) $('campaign-edit-summary').value=content.summary||'';
    if($('campaign-edit-text')) $('campaign-edit-text').value=content.editorText||'';
    if($('campaign-hero-roster')) $('campaign-hero-roster').innerHTML=state.heroes.map((hero,index)=>`<div class="roster-item"><div>${hero.image?`<img src="${escapeHTML(hero.image)}" alt="">`:`<span>${escapeHTML((hero.n||'H').slice(0,2).toUpperCase())}</span>`}<p><b>${escapeHTML(hero.n)}</b><small>${escapeHTML(hero.r||`Rank ${hero.rank}`)}</small></p></div><div><button type="button" data-action="edit-hero" data-index="${index}">EDITAR</button><button type="button" data-roster-remove-hero="${escapeHTML(hero.id)}">REMOVER</button></div></div>`).join('')||'<div class="roster-empty">Nenhum herói adicionado.</div>';
    if($('campaign-villain-roster')) $('campaign-villain-roster').innerHTML=state.villains.map((villain,index)=>`<div class="roster-item"><div>${villain.image?`<img src="${escapeHTML(villain.image)}" alt="">`:`<span>${escapeHTML((villain.n||'V').slice(0,2).toUpperCase())}</span>`}<p><b>${escapeHTML(villain.n)}</b><small>${escapeHTML(villain.tier||`Rank ${villain.rank}`)}</small></p></div><div><button type="button" data-action="edit-villain" data-index="${index}">EDITAR</button><button type="button" data-roster-remove-villain="${escapeHTML(villain.id)}">REMOVER</button></div></div>`).join('')||'<div class="roster-empty">Nenhum vilão adicionado.</div>';
    if($('campaign-session-editor')) $('campaign-session-editor').innerHTML=activeSessions().map((session,index)=>`<div class="session-edit-row" data-session-edit="${index}"><input data-session-field="title" value="${escapeHTML(session.title||'')}" placeholder="Título da sessão"><textarea data-session-field="text" rows="2" placeholder="Resumo, objetivo e acontecimentos">${escapeHTML(session.text||'')}</textarea><button type="button" data-remove-session="${index}">×</button></div>`).join('')||'<div class="roster-empty">Nenhuma sessão. Adicione a primeira sessão.</div>';
  }

  function collectCampaignSessions() {
    return qsa('[data-session-edit]',$('campaign-session-editor')).map((row,index)=>({id:String(index+1).padStart(2,'0'),title:row.querySelector('[data-session-field="title"]')?.value.trim()||`Sessão ${index+1}`,text:row.querySelector('[data-session-field="text"]')?.value.trim()||''}));
  }

  async function saveCampaignManagerContent() {
    const sessions=collectCampaignSessions();
    const previous=state.campaign||{};const nextProgress={};sessions.forEach(s=>nextProgress[s.id]=previous[s.id]||'todo');
    state.campaignContent={...state.campaignContent,title:$('campaign-edit-title').value.trim()||activeCampaign?.name||'Campanha',subtitle:$('campaign-edit-subtitle').value.trim(),summary:$('campaign-edit-summary').value.trim(),editorText:$('campaign-edit-text').value,sessions,players:state.heroes.length,documentMode:state.campaignContent?.campaignPdf?'pdf':'editor'};
    state.campaign=nextProgress;
    localStorage.setItem(STORAGE.campaignContent,JSON.stringify(state.campaignContent));localStorage.setItem(STORAGE.campaign,JSON.stringify(state.campaign));
    if(backendReady&&window.ArachneAPI)await window.ArachneAPI.saveMany({campaignContent:state.campaignContent,campaign:state.campaign});
    renderCampaign();applyCampaignBranding();markSaved('Campanha salva');toast('Campanha atualizada');
  }

  function openAddCharacter(kind='hero') {
    const items=allTemplateCharacters(kind);const existing=new Set((kind==='hero'?state.heroes:state.villains).map(x=>x.id));
    openModal(`<h2 id="modal-title">Adicionar ${kind==='hero'?'herói':'vilão'}</h2><p class="muted">Escolha um personagem da biblioteca completa ou crie um cadastro novo.</p><div class="character-library-grid">${items.map(item=>`<button type="button" data-add-library-character="${escapeHTML(item.id)}" data-character-kind="${kind}" ${existing.has(item.id)?'disabled':''}>${item.image?`<img src="${escapeHTML(item.image)}" alt="">`:`<span>${escapeHTML((item.n||'?').slice(0,2).toUpperCase())}</span>`}<b>${escapeHTML(item.n)}</b><small>${escapeHTML(item.r||`Rank ${item.rank||4}`)}</small></button>`).join('')}</div><div class="editbuttons"><button class="savebtn" type="button" data-create-custom-character="${kind}">CRIAR DO ZERO</button></div>`);
  }

  async function addLibraryCharacter(kind,id) {
    const templateItem=allTemplateCharacters(kind).find(item=>item.id===id);if(!templateItem)return;
    const character=kind==='hero'?normalizeHero(templateItem):normalizeVillain(templateItem);
    if(kind==='hero'){
      if(state.heroes.some(h=>h.id===character.id))return;state.heroes.push(character);state.playerNotes[character.id]='';saveJSON(STORAGE.heroes,state.heroes);if(backendReady&&window.ArachneAPI)await window.ArachneAPI.saveHero(character);
    }else{if(state.villains.some(v=>v.id===character.id))return;state.villains.push(character);saveJSON(STORAGE.villains,state.villains);if(backendReady&&window.ArachneAPI)await window.ArachneAPI.saveVillain(character);}
    closeModal();renderAll();renderCampaignManager();toast('Personagem adicionado');
  }

  function createCustomCharacter(kind='hero') {
    closeModal();const id=`${kind}-${Date.now().toString(36)}`;
    if(kind==='hero'){const hero=normalizeHero({id,n:'Novo Herói',r:'',rank:4});state.heroes.push(hero);state.playerNotes[id]='';saveJSON(STORAGE.heroes,state.heroes);if(backendReady&&window.ArachneAPI)window.ArachneAPI.saveHero(hero);renderHeroes();editHero(state.heroes.length-1);}
    else{const villain=normalizeVillain({id,n:'Novo Vilão',r:'',rank:4,tier:'AMEAÇA'});state.villains.push(villain);saveJSON(STORAGE.villains,state.villains);if(backendReady&&window.ArachneAPI)window.ArachneAPI.saveVillain(villain);renderVillains();editVillain(state.villains.length-1);}
  }

  function backendSnapshot() {
    return {
      heroes: state.heroes,
      villains: state.villains,
      campaign: state.campaign,
      campaignContent: state.campaignContent,
      dice: state.diceHistory,
      challenge: state.challenge,
      scenario: state.scenario,
      initiative: state.initiativeParticipants,
      playerNotes: state.playerNotes,
      notesPlayer: localStorage.getItem(STORAGE.notesPlayer) || '',
      notesMaster: localStorage.getItem(STORAGE.notesMaster) || ''
    };
  }

  async function hydrateFromBackend() {
    if (!window.ArachneAPI) return false;
    const remote = await window.ArachneAPI.loadAll();
    if (remote === null) return false;

    if (!Object.keys(remote).length) {
      if (state.role === 'master') await window.ArachneAPI.saveMany(backendSnapshot());
      backendReady = true;
      markSaved('Pronto');
      return true;
    }

    if (Array.isArray(remote.heroes)) {
      state.heroes = normalizeHeroList(remote.heroes);
      localStorage.setItem(STORAGE.heroes, JSON.stringify(state.heroes));
    }
    if (Array.isArray(remote.villains) && state.role === 'master') {
      state.villains = normalizeVillainList(remote.villains);
      localStorage.setItem(STORAGE.villains, JSON.stringify(state.villains));
    }
    if (remote.campaign && typeof remote.campaign === 'object' && state.role === 'master') { state.campaign = remote.campaign; localStorage.setItem(STORAGE.campaign, JSON.stringify(remote.campaign)); }
    if (remote.campaignContent && typeof remote.campaignContent === 'object') { state.campaignContent = {...clone(DEFAULT_CAMPAIGN_CONTENT), ...remote.campaignContent}; localStorage.setItem(STORAGE.campaignContent, JSON.stringify(state.campaignContent)); }
    if (Array.isArray(remote.dice)) { state.diceHistory = remote.dice; localStorage.setItem(STORAGE.dice, JSON.stringify(remote.dice)); }
    if (remote.challenge && typeof remote.challenge === 'object') { state.challenge = {...DEFAULT_CHALLENGE, ...remote.challenge}; localStorage.setItem(STORAGE.challenge, JSON.stringify(state.challenge)); }
    if (remote.scenario && typeof remote.scenario === 'object') {
      const localZoom = state.scenario?.zoom || 1;
      state.scenario = {...clone(DEFAULT_SCENARIO), ...remote.scenario};
      if (state.role === 'player') state.scenario.zoom = localZoom;
      localStorage.setItem(STORAGE.scenario, JSON.stringify(state.scenario));
    }
    if (Array.isArray(remote.initiative)) { state.initiativeParticipants = remote.initiative; localStorage.setItem(STORAGE.initiative, JSON.stringify(remote.initiative)); }
    if (remote.playerNotes && typeof remote.playerNotes === 'object' && !Array.isArray(remote.playerNotes)) { state.playerNotes = {...state.playerNotes, ...remote.playerNotes}; localStorage.setItem(STORAGE.playerNotes, JSON.stringify(state.playerNotes)); }
    if (typeof remote.notesPlayer === 'string') localStorage.setItem(STORAGE.notesPlayer, remote.notesPlayer);
    if (typeof remote.notesMaster === 'string' && state.role === 'master') localStorage.setItem(STORAGE.notesMaster, remote.notesMaster);

    if (state.role === 'master') {
      const snapshot = backendSnapshot();
      const missing = Object.fromEntries(Object.entries(snapshot).filter(([key]) => !Object.prototype.hasOwnProperty.call(remote,key)));
      if (Object.keys(missing).length) await window.ArachneAPI.saveMany(missing);
    }

    backendReady = true;
    renderAll();
    loadNotesForRole();
    renderPlayerNotes();
    markSaved('Pronto');
    return true;
  }

  function applyRemoteState(event) {
    if (!event || event.type !== 'state') return;
    const { key, value } = event;
    if (key === 'heroes' && Array.isArray(value)) {
      state.heroes = normalizeHeroList(value);
      localStorage.setItem(STORAGE.heroes, JSON.stringify(state.heroes));
      renderHeroes();
      renderChallengeSummary();
    } else if (key === 'villains' && state.role === 'master' && Array.isArray(value)) {
      state.villains = normalizeVillainList(value);
      localStorage.setItem(STORAGE.villains, JSON.stringify(state.villains));
      renderVillains();
      renderActorOptions();
    } else if (key === 'campaign' && state.role === 'master' && value && typeof value === 'object') {
      state.campaign = value; localStorage.setItem(STORAGE.campaign, JSON.stringify(value)); renderCampaign();
    } else if (key === 'campaignContent' && value && typeof value === 'object') {
      state.campaignContent = {...clone(DEFAULT_CAMPAIGN_CONTENT), ...value}; localStorage.setItem(STORAGE.campaignContent, JSON.stringify(state.campaignContent)); renderCampaign(); applyCampaignBranding();
    } else if (key === 'dice' && Array.isArray(value)) {
      const previousAt = state.diceHistory?.[0]?.at;
      state.diceHistory = value; localStorage.setItem(STORAGE.dice, JSON.stringify(value)); renderDiceHistory(); renderHomeLiveRolls(); renderPlayerLiveDice();
      const latest = value[0];
      if (state.role === 'player' && latest && latest.at !== previousAt) {
        animatePlayerLiveDice(latest);
        toast(`Rolagem · ${latest.label}: ${latest.total}`);
      }
    } else if (key === 'challenge' && value && typeof value === 'object') {
      state.challenge = {...DEFAULT_CHALLENGE, ...value}; localStorage.setItem(STORAGE.challenge, JSON.stringify(state.challenge)); syncChallengeInputs(); renderChallengeSummary();
    } else if (key === 'scenario' && value && typeof value === 'object') {
      const localZoom = state.scenario?.zoom || 1;
      state.scenario = {...clone(DEFAULT_SCENARIO), ...value};
      if (state.role === 'player') state.scenario.zoom = localZoom;
      localStorage.setItem(STORAGE.scenario, JSON.stringify(state.scenario)); renderScenario();
    } else if (key === 'initiative' && Array.isArray(value)) {
      state.initiativeParticipants = value; localStorage.setItem(STORAGE.initiative, JSON.stringify(value)); renderInitiativeParticipants();
    } else if (key === 'playerNotes' && value && typeof value === 'object') {
      const heroId = value.heroId || event.heroId;
      if (heroId) {
        state.playerNotes[heroId] = String(value.note ?? '');
        localStorage.setItem(STORAGE.playerNotes, JSON.stringify(state.playerNotes));
        if (state.role === 'player' && state.selectedHero === heroId) renderPlayerNotes();
      }
    } else if (key === 'notesMaster' && state.role === 'master' && typeof value === 'string') {
      localStorage.setItem(STORAGE.notesMaster, value);
      if (state.page === 'notes' && document.activeElement !== $('notes-text')) { $('notes-text').value = value; updateNotesCount(); }
    }
    markSaved('Atualizado ao vivo');
  }

  function updateRealtimeStatus(status) {
    document.body.dataset.connection = status || '';
  }

  function updatePresence(presence) {
    if (!presence) return;
    document.body.dataset.connectedPlayers = String(Object.values(presence.players || {}).reduce((sum,n) => sum + Number(n || 0),0));
  }

  function connectRealtime() {
    if (!backendReady || !window.ArachneAPI) return;
    window.ArachneAPI.connectRealtime({
      onState:applyRemoteState,
      onPresence:updatePresence,
      onStatus:updateRealtimeStatus,
      onReady:()=>hydrateFromBackend(),
      onLiveRoll:startPlayerLiveRoll
    });
  }

  let toastTimer;
  let savedTimer;
  let playerNotesSaveTimer;
  let masterNotesSaveTimer;
  let lastFocusedElement = null;

  function toast(message) {
    const el = $('toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
  }

  function markSaved(message = 'Salvo') {
    const status = $('saved')?.querySelector('span');
    if (!status) return;
    status.textContent = message;
    clearTimeout(savedTimer);
    savedTimer = setTimeout(() => { if (status) status.textContent = 'Pronto'; }, 1700);
  }

  function statValue(hero, name) { return statValueRaw(hero, name); }
  function abilityValue(hero, ability) { return Number(hero?.abilities?.[ability] ?? 0); }
  function signed(value) { const n = Number(value) || 0; return n >= 0 ? `+${n}` : String(n); }
  function heroMaxHealth(hero) { return clamp(hero?.maxHealth ?? statValue(hero,'Health'), 0, 9999); }
  function heroMaxFocus(hero) { return clamp(hero?.maxFocus ?? statValue(hero,'Focus'), 0, 9999); }
  function heroCurrentHealth(hero) { return Math.min(clamp(hero?.currentHealth ?? heroMaxHealth(hero), 0, 9999), heroMaxHealth(hero)); }
  function heroCurrentFocus(hero) { return Math.min(clamp(hero?.currentFocus ?? heroMaxFocus(hero), 0, 9999), heroMaxFocus(hero)); }
  function heroKarma(hero) { return clamp(hero?.karma ?? statValue(hero,'Karma'), 0, 99); }

  function selectedHero() {
    return state.heroes.find(hero => hero.id === state.selectedHero) || null;
  }

  function canEditHero(heroId) {
    return state.role === 'master' || (state.role === 'player' && state.selectedHero === heroId);
  }

  function updateAccessLabels() {
    const hero = selectedHero();
    $('role-label').textContent = state.role === 'master' ? 'MESTRE' : hero ? `JOGADOR · ${hero.n.toUpperCase()}` : 'JOGADOR';
    $('home-role').textContent = state.role === 'master' ? 'MESTRE' : hero ? hero.n.toUpperCase() : 'JOGADOR';
  }

  async function enter(role, heroId = null, password = '') {
    const error = $('login-error');
    error.textContent = '';
    if (!activeCampaign?.code) { $('campaign-error').textContent = 'Escolha uma campanha primeiro.'; return false; }
    if (!window.ArachneAPI) { error.textContent = 'Não foi possível iniciar a sessão.'; return false; }
    try {
      const profile = await window.ArachneAPI.join(role, { campaignCode:activeCampaign.code, heroId, password });
      if(profile?.campaign){activeCampaign={...activeCampaign,...profile.campaign};rememberCampaign(activeCampaign);}
      state.role = role;
      state.selectedHero = role === 'player' ? heroId : null;
      document.body.dataset.role = role;
      try {
        if (state.selectedHero) sessionStorage.setItem('arachne_selected_hero', state.selectedHero);
        else sessionStorage.removeItem('arachne_selected_hero');
      } catch {}
      const hydrated = await hydrateFromBackend();
      if (!hydrated) throw new Error('Não foi possível carregar a sessão. Tente novamente em instantes.');
      if (role === 'player' && !selectedHero()) throw new Error('Esse personagem não está disponível nesta campanha.');
      $('login').classList.add('hidden');
      $('app').classList.remove('hidden');
      $('player-select-area').classList.add('hidden');
      $('password-area').classList.add('hidden');
      updateAccessLabels();
      applyCampaignBranding();
      qsa('[data-master]').forEach(el => el.classList.toggle('hidden', role !== 'master'));
      loadNotesForRole();
      renderAll();
      renderPlayerNotes();
      goToPage('home');
      connectRealtime();
      return true;
    } catch (err) {
      backendReady = false;
      window.ArachneAPI?.clearSession?.();
      error.textContent = err?.message || 'Não foi possível entrar na sessão.';
      return false;
    }
  }

  function logout() {
    window.ArachneAPI?.clearSession?.();
    backendReady = false;
    state.role = 'player';
    state.selectedHero = null;
    state.currentRoll = null;
    document.body.dataset.role = 'guest';
    try { sessionStorage.removeItem('arachne_selected_hero'); } catch {}
    $('app').classList.add('hidden');
    $('app').classList.remove('nav-open');
    $('login').classList.remove('hidden');
    $('player-select-area').classList.add('hidden');
    $('password-area').classList.add('hidden');
    qsa('.login-actions').forEach(el => el.classList.remove('hidden'));
    $('master-password').value = '';
    $('login-error').textContent = '';
    if (activeCampaign) {
      $('campaign-hub')?.classList.add('hidden');
      $('campaign-access')?.classList.remove('hidden');
      $('login-title').textContent = activeCampaign.name.toUpperCase();
    } else returnToCampaignHub();
  }

  function goToPage(id) {
    if ((id === 'villains' || id === 'campaign' || id === 'dice' || id === 'notes') && state.role !== 'master') id = 'heroes';
    state.page = id;
    qsa('.page').forEach(el => el.classList.remove('active'));
    $(id)?.classList.add('active');
    qsa('#nav button').forEach(el => el.classList.toggle('active', el.dataset.page === id));
    $('title').textContent = {home:'Central da Campanha',heroes:'Heróis',villains:'Vilões',campaign:state.campaignContent?.title||activeCampaign?.name||'Campanha',dice:'Dados do Mestre',scenario:'Cenário de Combate',notes:'Anotações do Mestre'}[id] || (activeCampaign?.name||'Campanha');
    closeNav();
    if(id==='scenario')requestAnimationFrame(()=>fitScenarioBoard());
    if(id==='heroes')renderPlayerNotes();
  }

  function openNav() { $('app').classList.add('nav-open'); $('menu-toggle').setAttribute('aria-expanded', 'true'); }
  function closeNav() { $('app').classList.remove('nav-open'); $('menu-toggle').setAttribute('aria-expanded', 'false'); }

  function renderHeroes() {
    $('hero-count').textContent = String(state.heroes.length).padStart(2, '0');
    const chosen = selectedHero();
    const badge = $('selected-player-badge');
    if (badge) {
      badge.classList.toggle('hidden', state.role !== 'player' || !chosen);
      badge.innerHTML = chosen ? `<span class="selected-player-thumb">${characterArtMarkup(chosen.id, chosen.n, 'selected-player-image', chosen.image||'')}</span><div><small>VOCÊ ESTÁ JOGANDO COMO</small><b>${escapeHTML(chosen.n)}</b><em>${escapeHTML(chosen.r)}</em></div>` : '';
    }
    $('heroes-grid').innerHTML = state.heroes.map((hero, index) => {
      const maxHealth = heroMaxHealth(hero);
      const currentHealth = heroCurrentHealth(hero);
      const maxFocus = heroMaxFocus(hero);
      const currentFocus = heroCurrentFocus(hero);
      const karma = heroKarma(hero);
      const hpPct = maxHealth ? Math.round((currentHealth / maxHealth) * 100) : 0;
      const fpPct = maxFocus ? Math.round((currentFocus / maxFocus) * 100) : 0;
      const mine = state.role === 'player' && state.selectedHero === hero.id;
      const headline = mine ? 'SEU PERSONAGEM' : hero.tags.includes('Heroic') ? 'HERÓI' : (hero.tier || 'OPERATIVO');
      const editButton = canEditHero(hero.id) ? `<button type="button" data-action="edit-hero" data-index="${index}">${mine ? 'EDITAR MINHA FICHA' : 'EDITAR'}</button>` : '';
      return `<article class="card villain-card hero-card ${mine ? 'owned-hero-card' : ''}" data-hero-card="${index}">
        <div class="art art-${escapeHTML(hero.id)}">${characterArtMarkup(hero.id, hero.n, '', hero.image||'')}<span class="art-shade"></span><span class="rank">RANK ${clamp(hero.rank,1,6)} · ${headline}</span></div>
        <div class="body"><h3>${escapeHTML(hero.n)}</h3><div class="muted">${escapeHTML(hero.r)}</div>
          <div class="resource-bars hero-resource-bars">
            <div class="resource-row"><span><small>HEALTH</small><b>${currentHealth}/${maxHealth}</b></span><i><u style="width:${hpPct}%"></u></i></div>
            <div class="resource-row focus"><span><small>FOCUS</small><b>${currentFocus}/${maxFocus}</b></span><i><u style="width:${fpPct}%"></u></i></div>
          </div>
          <div class="chips"><span class="chip">${escapeHTML(hero.role || hero.tier || 'HERÓI')}</span><span class="chip">Inic. ${escapeHTML(hero.initiative || '+0')}</span><span class="chip">Karma ${karma}</span></div>
          <div class="card-actions hero-card-actions"><button class="primary" type="button" data-action="view-hero" data-index="${index}">VER RESUMO</button>${editButton}<button class="sheet-button" type="button" data-action="view-hero-pdf" data-index="${index}">▣ VISUALIZAR FICHA COMPLETA</button></div>
        </div>
      </article>`;
    }).join('');
    renderActorOptions();
    renderPlayerNotes();
  }

  function renderVillains() {
    $('villains-grid').innerHTML = state.villains.map((villain, index) => {
      const hpPct = villain.maxHealth ? Math.round((villain.currentHealth / villain.maxHealth) * 100) : 0;
      const fpPct = villain.maxFocus ? Math.round((villain.currentFocus / villain.maxFocus) * 100) : 0;
      return `<article class="card villain-card ${villain.tier === 'CHEFE FINAL' ? 'boss-card' : ''}">
        <div class="art art-${escapeHTML(villain.id)}">${characterArtMarkup(villain.id, villain.n, '', villain.image||'')}<span class="art-shade"></span><span class="rank">RANK ${clamp(villain.rank,1,6)} · ${escapeHTML(villain.tier)}</span></div>
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

  function activeSessions() {
    return Array.isArray(state.campaignContent?.sessions) ? state.campaignContent.sessions : SESSIONS;
  }

  function campaignMetrics() {
    const sessions = activeSessions();
    const done = sessions.filter(s => state.campaign[s.id] === 'done').length;
    const current = sessions.findIndex(s => state.campaign[s.id] === 'current');
    return {done,current,percent:sessions.length?Math.round((done / sessions.length) * 100):0};
  }

  function renderCampaign() {
    const sessions = activeSessions();
    const metrics = campaignMetrics();
    [$('campaign-progress'), $('campaign-toolbar-progress')].forEach(el => { if (el) el.style.width = `${metrics.percent}%`; });
    $('campaign-percent').textContent = `${metrics.percent}%`;
    $('campaign-summary').textContent = `${metrics.done}/${sessions.length} sessões`;
    $('campaign-toolbar-percent').textContent = `${metrics.percent}%`;
    $('campaign-toolbar-summary').textContent = `${metrics.done} concluída${metrics.done === 1 ? '' : 's'}`;
    $('phase-label').textContent = metrics.done >= 7 ? 'FASE FINAL' : metrics.done >= 4 ? 'FASE 2' : 'FASE 1';

    if ($('campaign-page-title')) $('campaign-page-title').textContent = state.campaignContent?.title || activeCampaign?.name || 'Campanha';
    const introTitle = document.querySelector('#campaign .intro h2'); if (introTitle) introTitle.textContent = state.campaignContent?.title || activeCampaign?.name || 'Campanha';
    const docTitle = document.querySelector('.campaign-document strong'); if (docTitle) docTitle.textContent = state.campaignContent?.title || activeCampaign?.name || 'Campanha';
    const docBtn = document.querySelector('.campaign-document [data-action="view-campaign-pdf"]'); if (docBtn) docBtn.textContent = state.campaignContent?.campaignPdf ? 'VISUALIZAR PDF DA CAMPANHA →' : 'ABRIR CONTEÚDO DA CAMPANHA →';
    $('sessions').innerHTML = sessions.length ? sessions.map(session => {
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
    }).join('') : '<div class="campaign-empty-state"><b>Nenhuma sessão criada.</b><span>Abra “Configurar campanha” para escrever a campanha e adicionar sessões.</span></div>';

    $('home-session-list').innerHTML = sessions.map(session => {
      const key = state.campaign[session.id] || 'todo';
      const cls = key === 'done' ? 'done' : key === 'current' ? 'current' : '';
      return `<div class="mini-session ${cls}"><small>SESSÃO ${session.id}</small><b>${escapeHTML(session.title)}</b></div>`;
    }).join('');
    renderCampaignManager();
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
    if (/^assets\/pdfs\/[a-z0-9._-]+\.pdf$/i.test(value)) return value;
    if (/^\/uploads\/[a-z0-9_./-]+\.pdf$/i.test(value)) return value;
    if (/^https:\/\/[^\s]+\/storage\/v1\/object\/public\/[^\s]+\.pdf(?:\?.*)?$/i.test(value)) return value;
    return '';
  }

  function openPdfViewer(path, title, subtitle = '') {
    const pdf = safePdfPath(path);
    if (!pdf) { toast('PDF não configurado para esta ficha'); return; }
    const safeTitle = escapeHTML(title || 'Documento');
    const safeSubtitle = escapeHTML(subtitle || 'Visualizador de PDF');
    const src = `${pdf}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`;
    openModal(`<div class="pdf-viewer"><div class="pdf-viewer-head"><div><small>${safeSubtitle}</small><h2 id="modal-title">${safeTitle}</h2></div><div class="pdf-viewer-actions"><a href="${pdf}" target="_blank" rel="noopener">ABRIR EM NOVA GUIA</a><a href="${pdf}" download>BAIXAR PDF</a></div></div><div class="pdf-frame-wrap"><iframe class="pdf-frame" src="${src}" title="${safeTitle}"></iframe></div><p class="pdf-fallback">Se o navegador não exibir PDFs incorporados, use <b>Abrir em nova guia</b>. O arquivo continua incluído dentro do projeto e funciona também quando o site é hospedado.</p></div>`, 'pdf');
  }

  function heroAbilityCards(hero) {
    return ABILITIES.map(name => `<div><small>${name}</small><b>${signed(abilityValue(hero,name))}</b><span>Def. ${abilityValue(hero,name)+10}</span></div>`).join('');
  }

  function viewHero(index) {
    const hero = state.heroes[index];
    if (!hero) return;
    const canAdjust = canEditHero(hero.id);
    const healthButtons = canAdjust ? `<div><button type="button" data-action="adjust-hero" data-resource="health" data-delta="-10" data-index="${index}">−10</button><button type="button" data-action="adjust-hero" data-resource="health" data-delta="-5" data-index="${index}">−5</button><button type="button" data-action="adjust-hero" data-resource="health" data-delta="5" data-index="${index}">+5</button><button type="button" data-action="adjust-hero" data-resource="health" data-delta="10" data-index="${index}">+10</button></div>` : '';
    const focusButtons = canAdjust ? `<div><button type="button" data-action="adjust-hero" data-resource="focus" data-delta="-10" data-index="${index}">−10</button><button type="button" data-action="adjust-hero" data-resource="focus" data-delta="-5" data-index="${index}">−5</button><button type="button" data-action="adjust-hero" data-resource="focus" data-delta="5" data-index="${index}">+5</button><button type="button" data-action="adjust-hero" data-resource="focus" data-delta="10" data-index="${index}">+10</button></div>` : '';
    const edit = canAdjust ? `<button type="button" data-action="edit-hero" data-index="${index}">${state.role === 'player' ? 'EDITAR MINHA FICHA' : 'EDITAR DADOS'}</button>` : '';
    openModal(`<h2 id="modal-title">${escapeHTML(hero.n)}</h2><p class="muted">${escapeHTML(hero.r)} · Rank ${escapeHTML(hero.rank)} · ${escapeHTML(hero.tier || 'HERÓI')}</p>
      <div class="villain-resource-editor">
        <div><small>HEALTH ATUAL</small><b>${heroCurrentHealth(hero)} / ${heroMaxHealth(hero)}</b>${healthButtons}</div>
        <div><small>FOCUS ATUAL</small><b>${heroCurrentFocus(hero)} / ${heroMaxFocus(hero)}</b>${focusButtons}</div>
      </div>
      <div class="sheet villain-sheet">${heroAbilityCards(hero)}<div><small>RED. HEALTH</small><b>${escapeHTML(hero.healthDR || '—')}</b></div><div><small>RED. FOCUS</small><b>${escapeHTML(hero.focusDR || '—')}</b></div><div><small>INICIATIVA</small><b>${escapeHTML(hero.initiative || '+0')}</b></div><div><small>KARMA</small><b>${heroKarma(hero)}</b></div></div>
      <div class="dossier-grid"><div><h3>Perfil</h3><p><b>Ocupação:</b> ${escapeHTML(hero.occupation || '—')}</p><p><b>Origem:</b> ${escapeHTML(hero.origin || '—')}</p><p><b>Equipes:</b> ${escapeHTML(hero.teams || '—')}</p><p><b>Base:</b> ${escapeHTML(hero.base || '—')}</p></div><div><h3>Função na campanha</h3><p>${escapeHTML(hero.role || '—')}</p><p>${escapeHTML(hero.hook || '—')}</p><p><b>Velocidade:</b> ${escapeHTML(hero.speed || '—')}</p></div></div>
      <h3>Poderes</h3><div class="chips power-chips">${(hero.powers || []).map(item => `<span class="chip">${escapeHTML(item)}</span>`).join('')}</div>
      <div class="dossier-grid"><div><h3>Traits</h3><ul>${hero.traits.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul></div><div><h3>Tags</h3><ul>${hero.tags.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul></div></div>
      <div class="editbuttons"><button class="savebtn" type="button" data-action="view-hero-pdf" data-index="${index}">VISUALIZAR FICHA COMPLETA</button>${edit}</div>`);
  }

  function viewHeroPdf(index) {
    const hero = state.heroes[index];
    if (!hero) return;
    openPdfViewer(hero.pdf, `${hero.n} — Ficha Completa`, `${hero.r} · Rank ${hero.rank}`);
  }

  function editHero(index) {
    const hero = state.heroes[index];
    if (!hero) return;
    if (!canEditHero(hero.id)) { toast('Você só pode editar o personagem que escolheu'); return; }
    const abilityInputs = ABILITIES.map(name => `<label>${name}<input id="h-e-ability-${name}" type="number" min="-20" max="30" value="${escapeHTML(abilityValue(hero,name))}"></label>`).join('');
    openModal(`<h2 id="modal-title">Editar ${escapeHTML(hero.n)}</h2><div class="editgrid">
      <label>Nome<input id="h-e-name" value="${escapeHTML(hero.n)}" maxlength="60"></label><label>Identidade<input id="h-e-real" value="${escapeHTML(hero.r)}" maxlength="80"></label>
      <label>Rank<input id="h-e-rank" type="number" min="1" max="6" value="${escapeHTML(hero.rank)}"></label><label>Tier<input id="h-e-tier" value="${escapeHTML(hero.tier || 'HERÓI')}" maxlength="30"></label>
      <label>Health máximo<input id="h-e-health" type="number" min="0" max="9999" value="${escapeHTML(heroMaxHealth(hero))}"></label><label>Health atual<input id="h-e-current-health" type="number" min="0" max="9999" value="${escapeHTML(heroCurrentHealth(hero))}"></label>
      <label>Focus máximo<input id="h-e-focus" type="number" min="0" max="9999" value="${escapeHTML(heroMaxFocus(hero))}"></label><label>Focus atual<input id="h-e-current-focus" type="number" min="0" max="9999" value="${escapeHTML(heroCurrentFocus(hero))}"></label>
      <label>Karma<input id="h-e-karma" type="number" min="0" max="99" value="${escapeHTML(heroKarma(hero))}"></label><label>Iniciativa<input id="h-e-init" value="${escapeHTML(hero.initiative || '+0')}"></label>
      <label>Red. dano Health<input id="h-e-health-dr" value="${escapeHTML(hero.healthDR || '—')}"></label><label>Red. dano Focus<input id="h-e-focus-dr" value="${escapeHTML(hero.focusDR || '—')}"></label>
      <label>Velocidade<input id="h-e-speed" value="${escapeHTML(hero.speed || '')}"></label><label>Ocupação<input id="h-e-occupation" value="${escapeHTML(hero.occupation || '')}"></label>
      <label>Origem<input id="h-e-origin" value="${escapeHTML(hero.origin || '')}"></label><label>Equipes<input id="h-e-teams" value="${escapeHTML(hero.teams || '')}"></label>
      <label>Base<input id="h-e-base" value="${escapeHTML(hero.base || '')}"></label><label class="full">Função na campanha<input id="h-e-role" value="${escapeHTML(hero.role || '')}"></label>
      <label class="full">Gancho<input id="h-e-hook" value="${escapeHTML(hero.hook || '')}"></label>
      <div class="full ability-editor"><small>HABILIDADES (MARVEL)</small>${abilityInputs}</div>
      <label class="full">Poderes — separados por vírgula<textarea id="h-e-powers">${escapeHTML((hero.powers || []).join(', '))}</textarea></label>
      <label class="full">Traits — separados por vírgula<textarea id="h-e-traits">${escapeHTML(hero.traits.join(', '))}</textarea></label>
      <label class="full">Tags — separados por vírgula<textarea id="h-e-tags">${escapeHTML(hero.tags.join(', '))}</textarea></label>
      <label>Imagem do personagem<input id="h-e-image-file" type="file" accept="image/png,image/jpeg,image/webp"></label><label>Ficha em PDF<input id="h-e-pdf-file" type="file" accept="application/pdf"></label>
      </div><div class="editbuttons"><button class="savebtn" type="button" data-action="save-hero" data-index="${index}">SALVAR ALTERAÇÕES</button><button type="button" data-action="view-hero" data-index="${index}">CANCELAR</button></div>`);
  }

  async function saveHero(index) {
    const hero = state.heroes[index];
    if (!hero) return;
    if (!canEditHero(hero.id)) { toast('Edição não permitida para este personagem'); return; }
    hero.n = $('h-e-name').value.trim() || hero.n;
    hero.r = $('h-e-real').value.trim();
    hero.rank = clamp($('h-e-rank').value, 1, 6);
    hero.tier = $('h-e-tier').value.trim() || 'HERÓI';
    hero.maxHealth = clamp($('h-e-health').value,0,9999);
    hero.maxFocus = clamp($('h-e-focus').value,0,9999);
    hero.currentHealth = Math.min(clamp($('h-e-current-health').value,0,9999), hero.maxHealth);
    hero.currentFocus = Math.min(clamp($('h-e-current-focus').value,0,9999), hero.maxFocus);
    hero.karma = clamp($('h-e-karma').value,0,99);
    hero.stats = [['Health',hero.maxHealth],['Focus',hero.maxFocus],['Karma',hero.karma]];
    hero.healthDR = $('h-e-health-dr').value.trim() || '—';
    hero.focusDR = $('h-e-focus-dr').value.trim() || '—';
    hero.initiative = $('h-e-init').value.trim() || '+0';
    hero.speed = $('h-e-speed').value.trim();
    hero.occupation = $('h-e-occupation').value.trim();
    hero.origin = $('h-e-origin').value.trim();
    hero.teams = $('h-e-teams').value.trim();
    hero.base = $('h-e-base').value.trim();
    hero.role = $('h-e-role').value.trim();
    hero.hook = $('h-e-hook').value.trim();
    ABILITIES.forEach(name => { hero.abilities[name] = clamp($(`h-e-ability-${name}`).value,-20,30); });
    hero.powers = $('h-e-powers').value.split(',').map(x => x.trim()).filter(Boolean).slice(0,60);
    hero.traits = $('h-e-traits').value.split(',').map(x => x.trim()).filter(Boolean).slice(0,40);
    hero.tags = $('h-e-tags').value.split(',').map(x => x.trim()).filter(Boolean).slice(0,40);
    const imageFile=$('h-e-image-file')?.files?.[0],pdfFile=$('h-e-pdf-file')?.files?.[0];
    if(state.role==='master'&&backendReady&&window.ArachneAPI){
      try{if(imageFile){markSaved('Enviando imagem…');const asset=await window.ArachneAPI.uploadAsset(imageFile);if(asset?.url)hero.image=asset.url;}if(pdfFile){markSaved('Enviando PDF…');const asset=await window.ArachneAPI.uploadAsset(pdfFile);if(asset?.url)hero.pdf=asset.url;}}catch(error){toast(error.message||'Falha ao enviar arquivo');}
    }
    localStorage.setItem(STORAGE.heroes, JSON.stringify(state.heroes));
    if (backendReady && window.ArachneAPI) await window.ArachneAPI.saveHero(hero);
    renderHeroes();
    renderChallengeSummary();
    closeModal();
    markSaved('Herói salvo');
    toast('Ficha do herói atualizada');
  }

  function adjustHero(index, resource, delta) {
    const hero = state.heroes[index];
    if (!hero) return;
    if (!canEditHero(hero.id)) { toast('Edição não permitida para este personagem'); return; }
    const key = resource === 'focus' ? 'currentFocus' : 'currentHealth';
    const max = resource === 'focus' ? heroMaxFocus(hero) : heroMaxHealth(hero);
    hero[key] = Math.min(max, Math.max(0, Number(hero[key] || 0) + Number(delta || 0)));
    hero.stats = [['Health',heroMaxHealth(hero)],['Focus',heroMaxFocus(hero)],['Karma',heroKarma(hero)]];
    saveJSON(STORAGE.heroes, state.heroes);
    if (backendReady && window.ArachneAPI) window.ArachneAPI.saveHero(hero);
    renderHeroes();
    viewHero(index);
    markSaved(`${resource === 'focus' ? 'Focus' : 'Health'} atualizado`);
  }

  function viewVillain(index) {
    const villain = state.villains[index];
    if (!villain) return;
    const abilityCards = ABILITIES.map(name => `<div><small>${name}</small><b>${signed(abilityValue(villain,name))}</b><span>Def. ${abilityValue(villain,name)+10}</span></div>`).join('');
    openModal(`<h2 id="modal-title">${escapeHTML(villain.n)}</h2><p class="muted">${escapeHTML(villain.r)} · Rank ${escapeHTML(villain.rank)} · ${escapeHTML(villain.tier)}</p>
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
    const content=state.campaignContent||DEFAULT_CAMPAIGN_CONTENT;
    if(content.campaignPdf){openPdfViewer(content.campaignPdf, content.title||activeCampaign?.name||'Campanha', content.subtitle||'Livro da campanha');return;}
    openModal(`<h2 id="modal-title">${escapeHTML(content.title||activeCampaign?.name||'Campanha')}</h2><p class="muted">${escapeHTML(content.subtitle||'Campanha personalizada')}</p><div class="campaign-text-view">${escapeHTML(content.editorText||content.summary||'Nenhum texto da campanha foi escrito ainda.').replace(/\n/g,'<br>')}</div>`);
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
      <label>Imagem do vilão<input id="v-e-image-file" type="file" accept="image/png,image/jpeg,image/webp"></label><label>Ficha em PDF<input id="v-e-pdf-file" type="file" accept="application/pdf"></label>
      </div><div class="editbuttons"><button class="savebtn" type="button" data-action="save-villain" data-index="${index}">SALVAR ALTERAÇÕES</button><button type="button" data-action="view-villain" data-index="${index}">CANCELAR</button></div>`);
  }

  async function saveVillain(index) {
    const villain = state.villains[index];
    if (!villain) return;
    villain.n = $('v-e-name').value.trim() || villain.n; villain.r = $('v-e-real').value.trim(); villain.rank = clamp($('v-e-rank').value,1,6); villain.tier = $('v-e-tier').value.trim() || 'AMEAÇA';
    villain.maxHealth = clamp($('v-e-health').value,0,9999); villain.maxFocus = clamp($('v-e-focus').value,0,9999);
    villain.currentHealth = Math.min(clamp($('v-e-current-health').value,0,9999),villain.maxHealth); villain.currentFocus = Math.min(clamp($('v-e-current-focus').value,0,9999),villain.maxFocus);
    villain.healthDR = $('v-e-health-dr').value.trim() || '—'; villain.focusDR = $('v-e-focus-dr').value.trim() || '—'; villain.initiative = $('v-e-init').value.trim() || '+0'; villain.speed = $('v-e-speed').value.trim();
    villain.occupation = $('v-e-occupation').value.trim(); villain.origin = $('v-e-origin').value.trim(); villain.teams = $('v-e-teams').value.trim(); villain.base = $('v-e-base').value.trim(); villain.role = $('v-e-role').value.trim(); villain.hook = $('v-e-hook').value.trim();
    ABILITIES.forEach(name => { villain.abilities[name] = clamp($(`v-e-ability-${name}`).value,-20,30); });
    villain.powers = $('v-e-powers').value.split(',').map(x=>x.trim()).filter(Boolean).slice(0,60); villain.traits = $('v-e-traits').value.split(',').map(x=>x.trim()).filter(Boolean).slice(0,40); villain.tags = $('v-e-tags').value.split(',').map(x=>x.trim()).filter(Boolean).slice(0,40);
    const imageFile=$('v-e-image-file')?.files?.[0],pdfFile=$('v-e-pdf-file')?.files?.[0];
    if(backendReady&&window.ArachneAPI){try{if(imageFile){markSaved('Enviando imagem…');const asset=await window.ArachneAPI.uploadAsset(imageFile);if(asset?.url)villain.image=asset.url;}if(pdfFile){markSaved('Enviando PDF…');const asset=await window.ArachneAPI.uploadAsset(pdfFile);if(asset?.url)villain.pdf=asset.url;}}catch(error){toast(error.message||'Falha ao enviar arquivo');}}
    localStorage.setItem(STORAGE.villains,JSON.stringify(state.villains));if(backendReady&&window.ArachneAPI)await window.ArachneAPI.saveVillain(villain); renderVillains(); renderChallengeSummary(); renderDamageSelectors(); renderInitiativeThreatPicker(); renderScenarioThreatPicker(); closeModal(); markSaved('Vilão salvo'); toast('Ficha do vilão atualizada');
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
    if (backendReady && window.ArachneAPI) window.ArachneAPI.publishLiveRoll({type:'D616',dice:{kind:best===1?'marvel':'poly',count:1,sides:6}});
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
      source:state.challenge.source,
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
    if (backendReady && window.ArachneAPI) window.ArachneAPI.publishLiveRoll({type:'D616',dice:{kind:'d616',count:3,sides:6}});
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
    if (backendReady && window.ArachneAPI) window.ArachneAPI.publishLiveRoll({type:'D616',dice:{kind:index===1?'marvel':'poly',count:1,sides:6}});
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
      total:math.total, outcome:outcome.label, outcomeKey:outcome.key, at:Date.now(), visibility:roll.snapshot.source === 'hero' ? 'public' : 'masked',
      dice:{kind:'d616',values:[...roll.values]}
    });
    renderCurrentRoll();
  }

  function addHistory(entry) {
    state.diceHistory.unshift(entry);
    state.diceHistory = state.diceHistory.slice(0, 50);
    saveJSON(STORAGE.dice, state.diceHistory);
    renderDiceHistory(true);
    renderHomeLiveRolls();
    renderPlayerLiveDice();
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

  function renderHomeLiveRolls() {
    const wrap = $('home-live-rolls');
    if (!wrap) return;
    const rows = state.diceHistory.slice(0,6);
    if (!rows.length) {
      wrap.innerHTML = '<div class="history-empty">As rolagens da sessão aparecem aqui em tempo real.</div>';
      return;
    }
    wrap.innerHTML = rows.map(entry => `<div class="live-roll-card"><span>${entry.type === 'D616' ? 'A' : '⚄'}</span><div><b>${escapeHTML(entry.label || 'Rolagem')}</b><small>${escapeHTML(entry.outcome || entry.action || entry.detail || 'Resultado registrado')}</small></div><strong>${escapeHTML(entry.total ?? '—')}</strong></div>`).join('');
  }

  function liveDiceValue(value, marvel = false) {
    return marvel && Number(value) === 1 ? 'M' : String(value ?? '—');
  }

  function liveDiceMarkup(entry, rolling = false) {
    const dice = entry?.dice || {};
    const values = Array.isArray(dice.values) ? dice.values : [];
    const rollClass = rolling ? ' rolling' : '';
    if (dice.kind === 'd616' && values.length >= 3) {
      return values.slice(0,3).map((value,index) => `<span class="live-player-die d6 ${index===1?'marvel':''}${rollClass}" style="--delay:${index*70}ms"><b>${escapeHTML(liveDiceValue(value,index===1))}</b><small>${index===1?'MARVEL':'D6'}</small></span>`).join('');
    }
    if (dice.kind === 'marvel' && values.length) {
      return `<span class="live-player-die d6 marvel${rollClass}"><b>${escapeHTML(liveDiceValue(values[0],true))}</b><small>MARVEL</small></span>`;
    }
    if (dice.kind === 'initiative' && values.length) {
      return values.slice(0,10).map((value,index) => `<span class="live-player-die d6 marvel mini${rollClass}" style="--delay:${index*45}ms"><b>${escapeHTML(liveDiceValue(value,true))}</b><small>M</small></span>`).join('');
    }
    if (dice.kind === 'poly' && values.length) {
      const sides = Number(dice.sides || 6);
      return values.slice(0,12).map((value,index) => `<span class="live-player-die poly d${escapeHTML(sides)}${rollClass}" style="--delay:${index*45}ms"><b>${escapeHTML(value)}</b><small>D${escapeHTML(sides)}</small></span>`).join('');
    }
    return `<span class="live-player-die result-only${rollClass}"><b>${escapeHTML(entry?.total ?? '—')}</b><small>${escapeHTML(entry?.type || 'ROLL')}</small></span>`;
  }

  function renderPlayerLiveDice() {
    const panel = $('player-live-dice');
    if (!panel) return;
    const visible = state.role === 'player';
    panel.classList.toggle('hidden', !visible);
    if (!visible) return;
    const latest = state.diceHistory[0];
    const stage = $('player-live-dice-stage');
    const result = $('player-live-dice-result');
    const history = $('player-live-dice-history');
    if (!latest) {
      stage.innerHTML = '<div class="live-dice-empty">Aguardando a próxima rolagem.</div>';
      result.innerHTML = '<small>RESULTADO</small><strong>—</strong><span></span>';
      history.innerHTML = '<div class="history-empty">Nenhuma jogada registrada.</div>';
      return;
    }
    stage.innerHTML = liveDiceMarkup(latest,false);
    result.innerHTML = `<small>${escapeHTML(latest.type || 'ROLAGEM')}</small><strong>${escapeHTML(latest.total ?? '—')}</strong><span>${escapeHTML(latest.outcome || latest.action || latest.detail || '')}</span>`;
    const rows = state.diceHistory.slice(0,5);
    history.innerHTML = rows.map((entry,index) => `<div class="player-roll-history-row ${index===0?'latest':''}"><span>${escapeHTML(entry.type || 'ROLL')}</span><div><b>${escapeHTML(entry.label || 'Rolagem do Mestre')}</b><small>${escapeHTML(entry.outcome || entry.action || entry.detail || '')}</small></div><strong>${escapeHTML(entry.total ?? '—')}</strong></div>`).join('');
  }

  function startPlayerLiveRoll(event) {
    if (state.role !== 'player' || !event || !$('player-live-dice-stage')) return;
    const count = clamp(event?.dice?.count || 1,1,12);
    const kind = event?.dice?.kind || 'marvel';
    const sides = Number(event?.dice?.sides || 6);
    const preview = {
      type:event.type || 'ROLL', total:'…',
      dice:{kind,sides,values:Array.from({length:count},()=>'?')}
    };
    const stage = $('player-live-dice-stage');
    stage.innerHTML = liveDiceMarkup(preview,true);
    stage.classList.add('live-roll-flash');
    $('player-live-dice-result').innerHTML = `<small>${escapeHTML(event.type || 'ROLAGEM')}</small><strong>…</strong><span>Rolando agora</span>`;
  }

  async function animatePlayerLiveDice(entry) {
    if (state.role !== 'player' || !$('player-live-dice-stage')) return;
    renderPlayerLiveDice();
    const stage = $('player-live-dice-stage');
    stage.innerHTML = liveDiceMarkup(entry,true);
    stage.classList.remove('live-roll-flash');
    void stage.offsetWidth;
    stage.classList.add('live-roll-flash');
    await sleep(reducedMotion()?60:780);
    stage.innerHTML = liveDiceMarkup(entry,false);
    stage.classList.remove('live-roll-flash');
  }

  function polyDieHTML(sides, value = '?', rolling = false, index = 0) {
    const klass = `poly-die d${sides}${rolling ? ' rolling' : ''}`;
    const rx = 12 + ((index * 47 + sides) % 64), ry = -24 + ((index * 31 + sides) % 72), rz = -18 + ((index * 19 + sides) % 46);
    const tx1 = -55 + ((index * 37 + sides * 3) % 110), tx2 = -30 + ((index * 53 + sides) % 72), tx3 = -18 + ((index * 23 + sides) % 46);
    const lift = 72 + ((index * 17 + sides) % 48), spin = 540 + ((index * 83 + sides * 7) % 420);
    const label = sides === 100 ? 'd%' : `d${sides}`;
    return `<div class="poly-die-wrap" style="--delay:${index * 65}ms;--rx:${rx}deg;--ry:${ry}deg;--rz:${rz}deg;--tx1:${tx1}px;--tx2:${tx2}px;--tx3:${tx3}px;--lift:${lift}px;--spin:${spin}deg" aria-label="d${sides}: ${escapeHTML(value)}">
      <span class="poly-shadow"></span>
      <div class="${klass}">
        <span class="poly-facet facet-a"></span><span class="poly-facet facet-b"></span><span class="poly-facet facet-c"></span><span class="poly-facet facet-d"></span>
        <span class="poly-value">${escapeHTML(value)}</span><small>${label}</small><i class="poly-glint"></i>
      </div>
    </div>`;
  }

  async function rollGeneric() {
    const sides = clamp($('die').value,2,1000), quantity = clamp($('qty').value,1,12), modifier = clamp($('generic-mod').value,-99,99);$('qty').value=quantity;
    if (backendReady && window.ArachneAPI) window.ArachneAPI.publishLiveRoll({type:'GEN',dice:{kind:'poly',count:quantity,sides}});
    const stage=$('generic-dice-stage');stage.classList.add('tray-rolling');stage.innerHTML=Array.from({length:quantity},(_,i)=>polyDieHTML(sides,'?',true,i)).join('');
    $('generic-result').textContent='…';$('generic-detail').textContent=`${quantity}d${sides}${modifier?` ${signed(modifier)}`:''}`;
    const flick=setInterval(()=>qsa('.poly-value',stage).forEach(node=>node.textContent=String(rand(sides))),55);
    await sleep(reducedMotion()?60:1120+Math.min(quantity,8)*70);clearInterval(flick);
    const values=Array.from({length:quantity},()=>rand(sides));stage.classList.remove('tray-rolling');stage.innerHTML=values.map((value,i)=>polyDieHTML(sides,value,false,i)).join('');
    qsa('.poly-die-wrap',stage).forEach((wrap,i)=>{wrap.classList.add('landed');setTimeout(()=>wrap.classList.remove('landed'),720+i*55);});
    const raw=values.reduce((sum,value)=>sum+value,0),total=raw+modifier;$('generic-result').textContent=total;$('generic-detail').textContent=`[${values.join(', ')}]${modifier?` ${signed(modifier)}`:''}`;
    addHistory({type:'GEN',label:`${quantity}d${sides}`,detail:`[${values.join(', ')}]${modifier?` ${signed(modifier)}`:''}`,total,at:Date.now(),visibility:'public',dice:{kind:'poly',sides,values}});
  }

  // -------------------- Dano com Marvel Die --------------------
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
    if (backendReady && window.ArachneAPI) window.ArachneAPI.publishLiveRoll({type:'DMG',dice:{kind:'marvel',count:1,sides:6}});
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
    addHistory({type:'DMG',label:`Dano · ${entity?.n || 'Personalizado'}`,detail:$('damage-detail').textContent,total,at:Date.now(),visibility:$('damage-source').value === 'threat' ? 'masked' : 'public',dice:{kind:'marvel',values:[face]}});
  }

  // -------------------- v8 · Iniciativa com 1 Marvel Die --------------------
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
    if (backendReady && window.ArachneAPI) window.ArachneAPI.publishLiveRoll({type:'INIT',dice:{kind:'initiative',count:state.initiativeParticipants.length,sides:6}});
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
    saveInitiativeParticipants();
    addHistory({type:'INIT',label:'Iniciativa',detail:`${results.length} participante${results.length===1?'':'s'}`,total:top,at:Date.now(),visibility:'masked',dice:{kind:'initiative',values:results.map(r=>r.face)}});
    $('roll-initiative').disabled=false;
  }

  // -------------------- v9 · Montador tático --------------------
  const MOVE_META={
    run:{label:'Correr',abbr:'RUN'}, climb:{label:'Escalar',abbr:'CLIMB'}, swim:{label:'Nadar',abbr:'SWIM'}, jump:{label:'Pular',abbr:'JUMP'},
    flight:{label:'Voar',abbr:'FLIGHT'}, glide:{label:'Planar',abbr:'GLIDE'}, swingline:{label:'Balançar',abbr:'SWING'}
  };
  const ENVIRONMENTS={
    closed:{label:'Ambiente fechado',base:'floor',sizes:[[16,12],[18,12],[20,14]]},
    'small-room':{label:'Sala pequena',base:'floor',sizes:[[10,8],[12,9],[12,10]]},
    'large-room':{label:'Sala grande',base:'floor',sizes:[[18,12],[20,14],[22,14]]},
    lab:{label:'Laboratório',base:'labfloor',sizes:[[18,12],[20,14],[22,14]]},
    garage:{label:'Garagem / estacionamento',base:'parking',sizes:[[18,12],[20,14],[22,16]]},
    rooftop:{label:'Telhado de prédios',base:'roof',sizes:[[16,12],[18,14],[20,14]]},
    forest:{label:'Floresta',base:'grass',sizes:[[20,14],[22,16],[24,16]]},
    lumber:{label:'Madeireira / margem do rio',base:'grass',sizes:[[20,14],[22,16],[24,18]]},
    inn:{label:'Taverna / pousada',base:'wood',sizes:[[18,14],[20,14],[22,16]]},
    ruins:{label:'Ruínas / beco',base:'stone',sizes:[[18,14],[20,14],[22,16]]},
    city:{label:'Rua da cidade',base:'road',sizes:[[20,14],[22,16],[24,16]]}
  };
  const TERRAIN_META={
    floor:{label:'Piso',elevation:0,land:true}, labfloor:{label:'Piso técnico',elevation:0,land:true}, parking:{label:'Concreto',elevation:0,land:true}, roof:{label:'Telhado',elevation:0,land:true}, wood:{label:'Madeira',elevation:0,land:true}, stone:{label:'Pedra',elevation:0,land:true}, grass:{label:'Solo',elevation:0,land:true}, road:{label:'Asfalto',elevation:0,land:true},
    elev1:{label:'Elevação 1',elevation:1,land:true,raised:true,climbable:true}, elev2:{label:'Elevação 2',elevation:2,land:true,raised:true,climbable:true},
    ramp1:{label:'Rampa 1',elevation:1,land:true,ramp:true,climbable:true}, ramp2:{label:'Rampa 2',elevation:2,land:true,ramp:true,climbable:true},
    water:{label:'Água',elevation:0,water:true}, gap:{label:'Vão',elevation:-1,gap:true}
  };
  const TERRAIN_TOOLS=new Set(['elev1','elev2','ramp1','ramp2','water','gap']);
  const OBSTACLE_META={
    wall:{label:'Parede',block:true},crate:{label:'Caixa',block:true},terminal:{label:'Terminal',block:true},barrel:{label:'Barril',block:true},
    door:{label:'Porta',block:false},pillar:{label:'Pilar',block:true},cover:{label:'Cobertura',block:true},rubble:{label:'Entulho',block:false,cost:2},
    tree:{label:'Árvore',block:true},rock:{label:'Rocha',block:true},car:{label:'Veículo',block:true},
    table:{label:'Mesa',block:true},bed:{label:'Cama',block:true},counter:{label:'Balcão',block:true},shelf:{label:'Estante',block:true},
    dock:{label:'Cais',block:false},log:{label:'Tora',block:true},stump:{label:'Toco',block:true},campfire:{label:'Fogueira',block:false},
    booth:{label:'Cabine',block:true},statue:{label:'Estátua',block:true},fence:{label:'Grade',block:true}
  };
  const DECOR_META={
    lane:{label:'Faixa'}, hazard:{label:'Faixa de risco'}, lamp:{label:'Luz'}, stain:{label:'Marca'}, rug:{label:'Tapete'},
    books:{label:'Livros'}, shrub:{label:'Arbusto'}, pier:{label:'Passarela'}, debris:{label:'Destroços'}, tarp:{label:'Lona'}
  };
  const PIECE_COLORS={octopus:'#14b8a6',sabretooth:'#f97316',crossbones:'#94a3b8',goblin:'#22c55e',sinister:'#e11d8a','hydra-agent':'#16a34a','aim-agent':'#eab308','minion-melee':'#8b5cf6','minion-ranged':'#06b6d4','minion-support':'#ec4899'};
  const PIECE_LABELS={octopus:'DO',sabretooth:'DS',crossbones:'OC',goblin:'DV',sinister:'SS','hydra-agent':'HY','aim-agent':'IM','minion-melee':'CM','minion-ranged':'CL','minion-support':'CS'};
  const AUTO_COLORS=['#8b5cf6','#06b6d4','#ec4899','#f97316','#10b981','#ef4444','#6366f1','#84cc16','#d946ef','#0ea5e9','#f59e0b','#a855f7'];
  const SCENARIO_PRESETS={
    empty:{env:'large-room',w:18,h:12,obstacles:[],terrain:[],decor:[]},
    lab:{env:'lab',w:20,h:14,obstacles:[['wall',9,2],['wall',9,3],['wall',9,4],['door',9,5],['wall',9,6],['wall',9,7],['terminal',15,3],['terminal',16,3],['crate',13,9],['crate',14,9],['barrel',16,9],['pillar',4,4],['pillar',17,4],['shelf',2,2],['counter',3,10],['counter',4,10]],terrain:[['elev1',14,2],['elev1',15,2],['elev1',16,2],['ramp1',13,2]],decor:[['hazard',13,8],['hazard',14,8],['lamp',15,2],['lamp',16,2],['stain',10,10]]},
    hydra:{env:'closed',w:20,h:14,obstacles:[['wall',4,2],['wall',5,2],['wall',6,2],['door',7,2],['wall',8,2],['wall',9,2],['cover',8,8],['cover',9,8],['crate',4,10],['crate',5,10],['barrel',14,9],['terminal',17,3],['pillar',2,6],['pillar',17,11],['fence',12,4],['fence',12,5]],terrain:[['elev1',14,3],['elev1',15,3],['elev1',16,3],['ramp1',13,3]],decor:[['hazard',4,9],['hazard',5,9],['stain',15,8]]},
    rooftop:{env:'rooftop',w:18,h:14,obstacles:[['wall',1,1],['wall',2,1],['wall',3,1],['wall',14,1],['wall',15,1],['wall',16,1],['crate',8,6],['crate',9,6],['cover',12,8],['barrel',15,10],['rock',5,10]],terrain:[['gap',6,3],['gap',7,3],['gap',6,4],['gap',7,4],['elev1',11,3],['elev1',12,3],['elev1',11,4],['elev1',12,4],['ramp1',10,4]],decor:[['stain',13,10],['lamp',2,1],['lamp',15,1]]},
    madripoor:{env:'lab',w:20,h:14,obstacles:[['wall',7,2],['wall',7,3],['wall',7,4],['door',7,5],['wall',7,6],['wall',7,7],['terminal',15,2],['terminal',16,2],['crate',12,8],['crate',13,8],['barrel',15,8],['pillar',3,4],['pillar',17,4],['counter',4,11],['counter',5,11]],terrain:[['elev2',15,10],['elev2',16,10],['elev2',15,11],['elev2',16,11],['ramp1',14,11],['ramp2',14,10],['elev1',14,10]],decor:[['hazard',11,8],['lamp',3,3],['lamp',17,3]]},
    hangar:{env:'large-room',w:22,h:14,obstacles:[['wall',3,2],['wall',4,2],['wall',5,2],['door',6,2],['wall',7,2],['wall',8,2],['cover',7,8],['cover',8,8],['cover',14,8],['cover',15,8],['crate',11,6],['crate',12,6],['barrel',3,11],['barrel',18,11],['terminal',19,3],['pillar',2,7],['pillar',19,7]],terrain:[['elev1',16,2],['elev1',17,2],['elev1',18,2],['ramp1',15,2]],decor:[['hazard',11,5],['hazard',12,5],['stain',17,11]]},
    garage:{env:'garage',w:20,h:14,obstacles:[['car',4,3],['car',7,3],['car',10,3],['car',13,3],['car',4,8],['car',7,8],['car',10,8],['car',13,8],['booth',17,2],['crate',16,10],['barrel',17,10]],terrain:[['elev1',1,11],['elev1',2,11],['ramp1',3,11]],decor:[['lane',4,2],['lane',7,2],['lane',10,2],['lane',13,2],['hazard',16,3],['hazard',16,4],['stain',14,11]]},
    lumber:{env:'lumber',w:22,h:16,obstacles:[['dock',10,12],['dock',11,12],['dock',12,12],['dock',10,13],['dock',11,13],['dock',12,13],['log',6,5],['log',7,5],['log',15,6],['stump',8,3],['stump',13,3],['tree',3,2],['tree',18,2],['campfire',11,7],['rock',16,10]],terrain:[['water',9,14],['water',10,14],['water',11,14],['water',12,14],['water',13,14],['water',9,15],['water',10,15],['water',11,15],['water',12,15],['water',13,15]],decor:[['pier',9,13],['pier',13,13],['shrub',5,9],['shrub',16,8],['stain',10,7]]},
    inn:{env:'inn',w:20,h:14,obstacles:[['wall',6,2],['wall',6,3],['wall',6,4],['door',6,5],['wall',14,3],['wall',14,4],['counter',10,8],['counter',11,8],['counter',12,8],['table',3,4],['table',4,4],['table',4,10],['table',15,10],['bed',3,2],['bed',16,2],['shelf',9,10],['shelf',10,10]],terrain:[],decor:[['rug',9,4],['rug',10,4],['lamp',2,2],['lamp',17,2],['books',9,9],['books',10,9]]},
    ruins:{env:'ruins',w:20,h:14,obstacles:[['wall',3,3],['wall',4,3],['wall',5,3],['wall',14,4],['wall',15,4],['wall',16,4],['pillar',9,6],['statue',10,7],['cover',6,9],['rock',13,9],['rubble',8,8],['fence',2,11],['fence',3,11]],terrain:[['gap',11,2],['gap',12,2],['elev1',14,9],['elev1',15,9],['ramp1',13,9]],decor:[['stain',8,6],['debris',7,7],['debris',15,10],['lamp',10,2]]}
  };

  function boardSize(){return{w:clamp(state.scenario.width||18,8,30),h:clamp(state.scenario.height||12,7,24)};}
  function scenarioCellKey(x,y){return `${x},${y}`;}
  function inScenarioBounds(x,y){const{w,h}=boardSize();return x>=0&&y>=0&&x<w&&y<h;}
  function movementForEntity(entity){
    const base={...(entity?.movement||{})};const text=String(entity?.speed||'');
    const aliases={run:['Correr','Run'],climb:['Escalar','Climb'],swim:['Nadar','Swim'],jump:['Pular','Jump'],flight:['Voo','Flight'],glide:['Planar','Glide'],swingline:['Balançar','Swingline']};
    Object.entries(aliases).forEach(([key,names])=>{for(const name of names){const m=text.match(new RegExp(`${name}\\s*[:/]?\\s*(\\d+)`,'i'));if(m){base[key]=Number(m[1]);break;}}});
    return base;
  }
  function movementForPiece(piece){
    if(piece?.movement)return{...piece.movement};
    if(piece?.kind==='hero')return movementForEntity(state.heroes.find(h=>h.id===piece.baseId));
    return movementForEntity(resolveThreatById(piece?.baseId));
  }
  function resolveThreatById(id){return MINION_TEMPLATES[id]||state.villains.find(v=>v.id===id)||null;}
  function normalizeScenario(){
    if(!state.scenario||typeof state.scenario!=='object')state.scenario=clone(DEFAULT_SCENARIO);
    if(!Array.isArray(state.scenario.pieces))state.scenario.pieces=clone(DEFAULT_SCENARIO.pieces);
    if(!state.scenario.obstacles||typeof state.scenario.obstacles!=='object')state.scenario.obstacles={};
    if(!state.scenario.terrain||typeof state.scenario.terrain!=='object')state.scenario.terrain={};
    if(!state.scenario.decor||typeof state.scenario.decor!=='object')state.scenario.decor={};
    if(!state.scenario.turnMovement||typeof state.scenario.turnMovement!=='object')state.scenario.turnMovement={};
    if(!state.scenario.environment||!ENVIRONMENTS[state.scenario.environment])state.scenario.environment='lab';
    if(!state.scenario.baseTerrain)state.scenario.baseTerrain=ENVIRONMENTS[state.scenario.environment].base;
    state.scenario.width=clamp(state.scenario.width||24,8,30);state.scenario.height=clamp(state.scenario.height||18,7,24);
    if(!Number.isFinite(Number(state.scenario.zoom)))state.scenario.zoom=1;
    if(!state.scenario.selectedMode)state.scenario.selectedMode='run';
    if(!state.scenario.selectedTool)state.scenario.selectedTool='select';
    // migra movimento da v8 para o bloqueio de modo da v9
    if(state.scenario.movementSpent&&Object.keys(state.scenario.movementSpent).length&&!Object.keys(state.scenario.turnMovement).length){
      Object.entries(state.scenario.movementSpent).forEach(([id,modes])=>{const entry=Object.entries(modes||{}).find(([,v])=>Number(v)>0);if(entry)state.scenario.turnMovement[id]={mode:entry[0],spent:Number(entry[1])};});
    }
    // limpa formatos antigos que não pertencem ao ambiente atual
    Object.entries(state.scenario.obstacles).forEach(([key,type])=>{if(type==='water'){delete state.scenario.obstacles[key];if(state.scenario.environment==='forest')state.scenario.terrain[key]='water';}});
    const heroIds=new Set(state.scenario.pieces.filter(p=>p.kind==='hero').map(p=>p.id));
    DEFAULT_SCENARIO.pieces.forEach(h=>{if(!heroIds.has(h.id))state.scenario.pieces.push(clone(h));});
    const legacyHeroMap={'hero-spider':'spider','hero-wolverine':'wolverine','hero-cap':'cap'};const{w,h}=boardSize();
    state.scenario.pieces.forEach(p=>{if(!p.baseId&&legacyHeroMap[p.id])p.baseId=legacyHeroMap[p.id];if(!p.movement||!Object.keys(p.movement).length)p.movement=movementForPiece(p);if(p.kind==='enemy'&&PIECE_LABELS[p.baseId])p.short=PIECE_LABELS[p.baseId];p.x=clamp(p.x,0,w-1);p.y=clamp(p.y,0,h-1);});
  }
  function saveScenario(){
    localStorage.setItem(STORAGE.scenario, JSON.stringify(state.scenario));
    if(state.role==='master' && backendReady && window.ArachneAPI) window.ArachneAPI.saveStorageKey(STORAGE.scenario,state.scenario);
    markSaved('Cenário salvo');
  }
  function renderScenarioThreatPicker(){if(!$('scenario-threat-tier'))return;fillThreatSelect($('scenario-threat-choice'),$('scenario-threat-tier').value||'minion',$('scenario-threat-choice').value);}
  function scenarioPieceAt(x,y){return state.scenario.pieces.find(p=>p.x===x&&p.y===y);}
  function selectedScenarioPiece(){return state.scenario.pieces.find(p=>p.id===state.scenario.selectedPiece)||null;}
  function obstacleAt(x,y){return state.scenario.obstacles[scenarioCellKey(x,y)]||null;}
  function decorAt(x,y){return state.scenario.decor[scenarioCellKey(x,y)]||null;}
  function terrainAt(x,y){const type=state.scenario.terrain[scenarioCellKey(x,y)]||state.scenario.baseTerrain||'floor';return{type,...(TERRAIN_META[type]||TERRAIN_META.floor)};}
  function terrainElevation(x,y){return Number(terrainAt(x,y).elevation||0);}
  function destinationOccupied(x,y,piece){return state.scenario.pieces.some(p=>p.id!==piece?.id&&p.x===x&&p.y===y);}
  function destinationBlocked(x,y,piece){if(!inScenarioBounds(x,y)||destinationOccupied(x,y,piece))return true;return !!OBSTACLE_META[obstacleAt(x,y)]?.block;}
  function movementCostForCell(x,y,mode){if(mode==='run'&&obstacleAt(x,y)==='rubble')return 2;return 1;}
  function canRunTransition(fx,fy,tx,ty,piece){
    if(destinationBlocked(tx,ty,piece))return false;
    const from=terrainAt(fx,fy),to=terrainAt(tx,ty);if(from.water||from.gap||to.water||to.gap)return false;
    const diff=Math.abs((to.elevation||0)-(from.elevation||0));if(diff===0)return true;if(diff>1)return false;return !!(from.ramp||to.ramp);
  }
  function canSwimTransition(fx,fy,tx,ty,piece){
    if(destinationBlocked(tx,ty,piece))return false;const to=terrainAt(tx,ty),from=terrainAt(fx,fy);if(!to.water)return false;return from.water||(!from.water&&!from.gap);
  }
  function neighborCells(x,y){const out=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;out.push([x+dx,y+dy]);}return out;}
  function directMoveCost(piece,x,y){const horizontal=Math.max(Math.abs(x-piece.x),Math.abs(y-piece.y));return Math.max(horizontal,Math.abs(terrainElevation(x,y)-terrainElevation(piece.x,piece.y)));}
  function directDestinationAllowed(piece,x,y,mode){
    if(!inScenarioBounds(x,y)||destinationOccupied(x,y,piece))return false;const t=terrainAt(x,y),obs=OBSTACLE_META[obstacleAt(x,y)];
    if(obs?.block)return false;
    if(mode==='flight'||mode==='swingline')return true;
    if(mode==='glide')return !t.water&&!t.gap;
    if(mode==='jump')return !!t.land&&!t.water&&!t.gap;
    if(mode==='climb'){
      const from=terrainAt(piece.x,piece.y);const h=Math.max(Math.abs(x-piece.x),Math.abs(y-piece.y));
      return h<=1&&!from.water&&!from.gap&&!!t.land&&!!t.climbable&&t.elevation!==from.elevation;
    }
    return false;
  }
  function reachableCells(piece,mode,budget){
    const result=new Map();if(!piece||budget<=0)return result;
    if(['jump','flight','glide','swingline','climb'].includes(mode)){
      const{w,h}=boardSize();for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(x===piece.x&&y===piece.y)continue;if(!directDestinationAllowed(piece,x,y,mode))continue;const cost=directMoveCost(piece,x,y);if(cost>0&&cost<=budget)result.set(scenarioCellKey(x,y),cost);}return result;
    }
    if(mode==='run'&&terrainAt(piece.x,piece.y).water)return result;
    const q=[[piece.x,piece.y,0]],best=new Map([[scenarioCellKey(piece.x,piece.y),0]]);
    while(q.length){const[x,y,cost]=q.shift();for(const[nx,ny]of neighborCells(x,y)){if(!inScenarioBounds(nx,ny))continue;const ok=mode==='swim'?canSwimTransition(x,y,nx,ny,piece):canRunTransition(x,y,nx,ny,piece);if(!ok)continue;const ncost=cost+movementCostForCell(nx,ny,mode),key=scenarioCellKey(nx,ny);if(ncost>budget)continue;if(best.has(key)&&best.get(key)<=ncost)continue;best.set(key,ncost);q.push([nx,ny,ncost]);if(!(nx===piece.x&&ny===piece.y))result.set(key,ncost);}}
    return result;
  }
  function movementStatus(piece){
    const movement=movementForPiece(piece),valid=Object.entries(movement).filter(([,v])=>Number(v)>0),locked=state.scenario.turnMovement[piece.id]||null;
    let mode=locked?.mode||state.scenario.selectedMode;if(!valid.some(([k])=>k===mode))mode=valid[0]?.[0]||'run';if(!locked)state.scenario.selectedMode=mode;
    const max=Number(movement[mode]||0),spent=locked&&locked.mode===mode?Number(locked.spent||0):0;return{movement,valid,mode,max,spent,remaining:Math.max(0,max-spent),locked};
  }
  function obstacleHTML(type){const meta=OBSTACLE_META[type];if(!meta)return'';return `<span class="obstacle-object obj-${type}" title="${escapeHTML(meta.label)}"><i></i><b></b><em></em></span>`;}
  function decorHTML(type){const meta=DECOR_META[type];if(!meta)return'';return `<span class="decor-object decor-${type}" title="${escapeHTML(meta.label)}"><i></i><b></b><em></em></span>`;}
  function pieceHTML(piece){const tier=piece.kind==='hero'?'hero':piece.tier||'enemy';return `<span class="board-piece ${piece.kind==='hero'?'hero-piece':'enemy-piece'} tier-${escapeHTML(tier)}" style="--piece:${escapeHTML(piece.color)}" title="${escapeHTML(piece.name)}"><span>${escapeHTML(piece.short||'E')}</span><i></i></span>`;}
  function renderScenarioToolAvailability(){
    const env=state.scenario.environment;qsa('[data-obstacle]').forEach(button=>{const allowed=button.dataset.envs?button.dataset.envs.split(/\s+/).includes(env):true;button.disabled=!allowed;button.classList.toggle('tool-disabled',!allowed);});
    const active=qsa('[data-obstacle]').find(b=>b.dataset.obstacle===state.scenario.selectedTool);if(active?.disabled)state.scenario.selectedTool='select';
  }
  function renderScenarioMovementPanel(){
    const piece=selectedScenarioPiece(),panel=$('scenario-movement-panel');if(!panel)return;
    if(state.role!=='master'){panel.innerHTML='<div class="movement-empty"><b>VISUALIZAÇÃO</b><span>Somente leitura para jogadores. Apenas o mestre pode selecionar peças, mover e editar o cenário.</span></div>';return;}
    if(!piece){panel.innerHTML='<div class="movement-empty"><b>MOVIMENTO</b><span>Selecione uma peça.</span></div>';return;}
    const st=movementStatus(piece),opts=st.valid.map(([k,v])=>`<option value="${k}" ${k===st.mode?'selected':''} ${st.locked&&k!==st.mode?'disabled':''}>${MOVE_META[k]?.label||k} · ${v}</option>`).join('');
    const stats=st.valid.map(([k,v])=>`<span class="speed-chip ${k===st.mode?'active':''} ${st.locked&&k!==st.mode?'locked':''}"><small>${MOVE_META[k]?.abbr||k.toUpperCase()}</small><b>${v}</b></span>`).join('');
    panel.innerHTML=`<div class="speed-card"><div class="speed-card-title"><span>SPEED</span><b>${escapeHTML(piece.name)}</b></div><div class="speed-chips">${stats}</div><div class="movement-controls"><label>Modo<select id="scenario-move-mode">${opts}</select></label><div class="movement-budget"><small>RESTANTE</small><strong>${st.remaining}</strong><span>/ ${st.max}</span></div></div><div class="movement-meter"><i style="width:${st.max?Math.max(0,Math.min(100,st.remaining/st.max*100)):0}%"></i></div><div class="movement-actions"><button type="button" id="scenario-reset-piece-move">NOVO TURNO</button>${st.locked?`<b class="mode-lock">${escapeHTML(MOVE_META[st.mode]?.label||st.mode)}</b>`:''}</div></div>`;
    $('scenario-move-mode')?.addEventListener('change',e=>{if(st.locked&&e.target.value!==st.locked.mode){toast('O modo de movimento já foi usado neste turno');renderScenario();return;}state.scenario.selectedMode=e.target.value;saveScenario();renderScenario();});
    $('scenario-reset-piece-move')?.addEventListener('click',()=>{delete state.scenario.turnMovement[piece.id];saveScenario();renderScenario();toast(`${piece.name}: novo turno`);});
  }
  function renderScenario(){
    const board=$('scenario-board');if(!board)return;normalizeScenario();if(state.role==='master')renderScenarioToolAvailability();const{w,h}=boardSize();
    const selected=state.role==='master'?selectedScenarioPiece():null,st=selected?movementStatus(selected):null,reachable=selected&&state.role==='master'&&state.scenario.selectedTool==='select'?reachableCells(selected,st.mode,st.remaining):new Map();
    board.innerHTML='';board.style.setProperty('--board-zoom',String(state.scenario.zoom||1));board.style.gridTemplateColumns=`repeat(${w}, var(--cell))`;board.style.gridTemplateRows=`repeat(${h}, var(--cell))`;board.dataset.environment=state.scenario.environment;board.dataset.readonly=state.role==='master'?'false':'true';
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const t=terrainAt(x,y),cell=document.createElement('button');cell.type='button';cell.className=`scenario-cell ${(x+y)%2?'cell-dark':'cell-light'} base-${escapeHTML(state.scenario.baseTerrain)} terrain-${escapeHTML(t.type)} elevation-${Math.max(0,t.elevation||0)}`;cell.dataset.x=x;cell.dataset.y=y;cell.setAttribute('role','gridcell');cell.setAttribute('aria-readonly',state.role==='master'?'false':'true');cell.setAttribute('aria-label',`${x+1},${y+1} · ${t.label}${t.elevation>0?` · altura ${t.elevation}`:''}`);cell.title=t.label;
      const decor=decorAt(x,y),obs=obstacleAt(x,y),piece=scenarioPieceAt(x,y),key=scenarioCellKey(x,y);if(decor&&DECOR_META[decor]){cell.classList.add('has-decor',`decor-${decor}`);cell.innerHTML=decorHTML(decor);}if(obs&&OBSTACLE_META[obs]){cell.classList.add('has-obstacle',`obstacle-${obs}`);cell.innerHTML+=obstacleHTML(obs);}if(reachable.has(key)){cell.classList.add('reachable');cell.innerHTML+=`<span class="move-cost">${reachable.get(key)}</span>`;}if(piece){cell.classList.add('has-piece');cell.innerHTML+=pieceHTML(piece);if(state.role==='master'&&state.scenario.selectedPiece===piece.id)cell.classList.add('selected');}board.appendChild(cell);
    }
    $('scenario-count').textContent=`${state.scenario.pieces.length} peças · ${w}×${h}`;if($('scenario-preset'))$('scenario-preset').value=state.scenario.preset||'empty';if($('scenario-environment'))$('scenario-environment').value=state.scenario.environment||'lab';
    $('scenario-selection').textContent=state.role==='master'?(selected?`${selected.name} · ${MOVE_META[st.mode]?.label||st.mode} ${st.remaining}/${st.max}`:state.scenario.selectedTool!=='select'?`${TERRAIN_META[state.scenario.selectedTool]?.label||OBSTACLE_META[state.scenario.selectedTool]?.label||'Apagar'}`:'—'):'Somente visualização para jogadores';
    qsa('[data-obstacle]').forEach(b=>b.classList.toggle('active',b.dataset.obstacle===state.scenario.selectedTool));if($('scenario-zoom-value'))$('scenario-zoom-value').textContent=`${Math.round((state.scenario.zoom||1)*100)}%`;renderScenarioMovementPanel();
  }
  function setMapCore(env,w,h){state.scenario.environment=env;state.scenario.baseTerrain=ENVIRONMENTS[env]?.base||'floor';state.scenario.width=w;state.scenario.height=h;state.scenario.obstacles={};state.scenario.terrain={};state.scenario.decor={};state.scenario.turnMovement={};state.scenario.movementSpent={};state.scenario.selectedPiece=null;state.scenario.selectedTool='select';state.scenario.selectedMode='run';}
  function setObstacle(type,x,y){if(inScenarioBounds(x,y))state.scenario.obstacles[scenarioCellKey(x,y)]=type;}
  function setTerrain(type,x,y){if(inScenarioBounds(x,y))state.scenario.terrain[scenarioCellKey(x,y)]=type;}
  function setDecor(type,x,y){if(inScenarioBounds(x,y))state.scenario.decor[scenarioCellKey(x,y)]=type;}
  function clearCellArt(x,y){delete state.scenario.obstacles[scenarioCellKey(x,y)];delete state.scenario.terrain[scenarioCellKey(x,y)];delete state.scenario.decor[scenarioCellKey(x,y)];}
  function outerWalls(doors=1){const{w,h}=boardSize();for(let x=0;x<w;x++){setObstacle('wall',x,0);setObstacle('wall',x,h-1);}for(let y=0;y<h;y++){setObstacle('wall',0,y);setObstacle('wall',w-1,y);}for(let i=0;i<doors;i++){const side=i%2,dx=side?0:Math.floor(w/2)+(i%3)-1,dy=side?Math.floor(h/2)+(i%3)-1:0;delete state.scenario.obstacles[scenarioCellKey(dx,dy)];setObstacle('door',dx,dy);}}
  function terrainRect(type,x0,y0,rw,rh){for(let y=y0;y<y0+rh;y++)for(let x=x0;x<x0+rw;x++)setTerrain(type,x,y);}
  function decorRect(type,x0,y0,rw,rh){for(let y=y0;y<y0+rh;y++)for(let x=x0;x<x0+rw;x++)setDecor(type,x,y);}
  function obstacleRect(type,x0,y0,rw,rh){for(let y=y0;y<y0+rh;y++)for(let x=x0;x<x0+rw;x++)setObstacle(type,x,y);}
  function lineObstacle(type,x1,y1,x2,y2){if(x1===x2){const[from,to]=y1<y2?[y1,y2]:[y2,y1];for(let y=from;y<=to;y++)setObstacle(type,x1,y);}else if(y1===y2){const[from,to]=x1<x2?[x1,x2]:[x2,x1];for(let x=from;x<=to;x++)setObstacle(type,x,y1);}}
  function randomFreeCell(margin=1){const{w,h}=boardSize();for(let tries=0;tries<120;tries++){const x=margin+Math.floor(Math.random()*Math.max(1,w-margin*2)),y=margin+Math.floor(Math.random()*Math.max(1,h-margin*2));if(!obstacleAt(x,y)&&!scenarioPieceAt(x,y)&&!terrainAt(x,y).gap&&!terrainAt(x,y).water)return{x,y};}return null;}
  function scatterObstacles(types,count){for(let i=0;i<count;i++){const c=randomFreeCell(1);if(c)setObstacle(types[Math.floor(Math.random()*types.length)],c.x,c.y);}}
  function scatterDecor(types,count,margin=1){for(let i=0;i<count;i++){const c=randomFreeCell(margin);if(c&&!obstacleAt(c.x,c.y))setDecor(types[Math.floor(Math.random()*types.length)],c.x,c.y);}}
  function addRaisedPatch(level=1){const{w,h}=boardSize(),rw=Math.max(2,Math.min(5,Math.floor(w/4))),rh=Math.max(2,Math.min(4,Math.floor(h/4))),x=Math.max(2,Math.floor(Math.random()*(w-rw-3))+1),y=Math.max(2,Math.floor(Math.random()*(h-rh-3))+1),type=level===2?'elev2':'elev1';terrainRect(type,x,y,rw,rh);setTerrain(level===2?'ramp2':'ramp1',Math.max(1,x-1),y+rh-1);if(level===2)setTerrain('elev1',Math.max(1,x-1),Math.max(1,y+rh-2));}
  function addPartition(){const{w,h}=boardSize(),vertical=Math.random()>.5;if(vertical){const x=2+Math.floor(Math.random()*Math.max(1,w-4)),doorY=2+Math.floor(Math.random()*Math.max(1,h-4));for(let y=1;y<h-1;y++)setObstacle(y===doorY?'door':'wall',x,y);}else{const y=2+Math.floor(Math.random()*Math.max(1,h-4)),doorX=2+Math.floor(Math.random()*Math.max(1,w-4));for(let x=1;x<w-1;x++)setObstacle(x===doorX?'door':'wall',x,y);}}
  function addForestStream(){const{w,h}=boardSize(),vertical=Math.random()>.5;if(vertical){let x=Math.floor(w*.55);for(let y=0;y<h;y++){x=clamp(x+(Math.random()>.65?(Math.random()>.5?1:-1):0),1,w-2);setTerrain('water',x,y);if(Math.random()>.35)setTerrain('water',clamp(x+1,1,w-2),y);}}else{let y=Math.floor(h*.5);for(let x=0;x<w;x++){y=clamp(y+(Math.random()>.65?(Math.random()>.5?1:-1):0),1,h-2);setTerrain('water',x,y);if(Math.random()>.35)setTerrain('water',x,clamp(y+1,1,h-2));}}}
  function addCitySidewalks(){const{w,h}=boardSize();for(let x=0;x<w;x++){setTerrain('elev1',x,1);setTerrain('elev1',x,2);setTerrain('elev1',x,h-3);setTerrain('elev1',x,h-2);}const crossings=[Math.floor(w*.25),Math.floor(w*.7)];crossings.forEach(x=>{setTerrain('ramp1',x,2);setTerrain('ramp1',x,h-3);});}
  function addParkingRows(){const{w,h}=boardSize();for(let y=2;y<h-2;y+=5){for(let x=2;x<w-2;x+=3)setDecor('lane',x,y);}}
  function addTavernInterior(){const{w,h}=boardSize();outerWalls(2);const split=Math.floor(w*.62);lineObstacle('wall',split,1,split,h-4);setObstacle('door',split,Math.floor(h*.45));obstacleRect('counter',Math.max(2,split-4),h-4,4,1);for(let x=2;x<split-1;x+=4){if(x+1<split-1)setObstacle('table',x,3+(Math.floor(x/4)%2)*4);}setObstacle('bed',2,1);setObstacle('bed',Math.max(2,split+1),1);setObstacle('shelf',Math.max(2,split+1),h-5);setObstacle('shelf',Math.max(2,split+2),h-5);decorRect('rug',Math.floor(w*.35)-1,Math.floor(h*.45)-1,3,2);scatterDecor(['lamp','books'],6);}
  function addRuinsLayout(){const{w,h}=boardSize();for(let x=2;x<w-2;x+=6){lineObstacle('wall',x,2,x,Math.min(h-4,5+Math.floor(Math.random()*4)));}for(let y=4;y<h-3;y+=4){if(Math.random()>.35)lineObstacle('wall',2,y,Math.min(w-3,6+Math.floor(Math.random()*5)),y);}scatterObstacles(['pillar','statue','cover','rock','rubble'],Math.max(8,Math.floor(w*h/22)));terrainRect('gap',Math.floor(w*.55),2,2,2);addRaisedPatch(1);scatterDecor(['debris','stain','lamp'],10);}
  function addLumberCamp(){const{w,h}=boardSize();terrainRect('water',0,h-2,w,2);obstacleRect('dock',Math.floor(w*.38),h-3,4,1);obstacleRect('dock',Math.floor(w*.38)+1,h-4,2,1);scatterObstacles(['tree','tree','log','stump','rock'],Math.max(10,Math.floor(w*h/18)));setObstacle('campfire',Math.floor(w*.5),Math.floor(h*.45));scatterDecor(['pier','shrub'],8);}
  function addGarageLayout(){const{w,h}=boardSize();for(let y=2;y<h-2;y+=5){for(let x=3;x<w-3;x+=4){if(Math.random()>.28)setObstacle('car',x,y+1);setDecor('lane',x,y);}}setObstacle('booth',w-3,2);scatterObstacles(['crate','barrel','cover'],Math.max(5,Math.floor(w*h/28)));scatterDecor(['hazard','stain'],Math.max(8,Math.floor(w*h/26)));}
  function addLabComplex(){const{w,h}=boardSize();outerWalls(2);addPartition();if(Math.random()>.5)addPartition();scatterObstacles(['terminal','crate','pillar','cover','barrel','shelf'],Math.max(8,Math.floor(w*h/22)));obstacleRect('counter',Math.max(2,Math.floor(w*.18)),h-3,3,1);scatterDecor(['hazard','lamp','stain'],Math.max(7,Math.floor(w*h/26)));}
  function placePiecesSafely(){
    const{w,h}=boardSize(),occupied=new Set();const valid=(x,y,p)=>{if(!inScenarioBounds(x,y)||occupied.has(scenarioCellKey(x,y))||obstacleAt(x,y))return false;const t=terrainAt(x,y);if(t.water||t.gap)return false;return true;};
    const heroes=state.scenario.pieces.filter(p=>p.kind==='hero'),enemies=state.scenario.pieces.filter(p=>p.kind!=='hero');
    const placeGroup=(list,fromBottom)=>list.forEach((p,i)=>{let found=null;for(let yy=0;yy<h&&!found;yy++){const y=fromBottom?h-2-yy:1+yy;if(y<0||y>=h)continue;for(let xx=0;xx<w;xx++){const x=fromBottom?1+((xx+i*2)%Math.max(1,w-2)):w-2-((xx+i*2)%Math.max(1,w-2));if(valid(x,y,p)){found={x,y};break;}}}if(found){p.x=found.x;p.y=found.y;occupied.add(scenarioCellKey(found.x,found.y));}});
    placeGroup(heroes,true);placeGroup(enemies,false);
  }
  function generateRandomScenario(){
    const env=$('scenario-environment')?.value||'lab',def=ENVIRONMENTS[env]||ENVIRONMENTS.lab,size=def.sizes[Math.floor(Math.random()*def.sizes.length)];setMapCore(env,size[0],size[1]);state.scenario.preset='empty';
    const{w,h}=boardSize();
    if(['closed','small-room','large-room'].includes(env))outerWalls(env==='closed'?2:1);
    if(env==='closed'){addPartition();if(Math.random()>.35)addPartition();scatterObstacles(['crate','cover','pillar','rubble'],Math.max(5,Math.floor(w*h/28)));scatterDecor(['lamp','stain'],Math.max(4,Math.floor(w*h/40)));if(Math.random()>.4)addRaisedPatch(1);}
    if(env==='small-room'){outerWalls(1);scatterObstacles(['crate','pillar','table'],Math.max(2,Math.floor(w*h/36)));scatterDecor(['lamp','rug'],3);}
    if(env==='large-room'){scatterObstacles(['crate','cover','barrel','pillar','rubble'],Math.max(6,Math.floor(w*h/25)));scatterDecor(['lamp','stain'],Math.max(6,Math.floor(w*h/30)));addRaisedPatch(Math.random()>.75?2:1);}
    if(env==='lab')addLabComplex();
    if(env==='garage'){addGarageLayout();if(Math.random()>.55)addRaisedPatch(1);}
    if(env==='rooftop'){
      for(let x=0;x<w;x++){if(Math.random()>.22)setObstacle('wall',x,0);if(Math.random()>.22)setObstacle('wall',x,h-1);}for(let y=1;y<h-1;y++){if(Math.random()>.55)setObstacle('wall',0,y);if(Math.random()>.55)setObstacle('wall',w-1,y);}scatterObstacles(['crate','cover','barrel','rock','pillar'],Math.max(5,Math.floor(w*h/32)));scatterDecor(['lamp','stain'],Math.max(4,Math.floor(w*h/38)));addRaisedPatch(1);if(Math.random()>.45)addRaisedPatch(2);const gx=Math.floor(w*.42),gy=Math.floor(h*.35);terrainRect('gap',gx,gy,Math.max(2,Math.floor(w*.12)),Math.max(2,Math.floor(h*.2)));
    }
    if(env==='forest'){addRaisedPatch(1);if(Math.random()>.55)addRaisedPatch(2);addForestStream();scatterObstacles(['tree','tree','tree','rock','rubble','stump','log'],Math.max(12,Math.floor(w*h/16)));scatterDecor(['shrub','stain'],Math.max(8,Math.floor(w*h/22)));}
    if(env==='lumber'){addLumberCamp();if(Math.random()>.45)addRaisedPatch(1);}
    if(env==='inn'){addTavernInterior();}
    if(env==='ruins'){addRuinsLayout();}
    if(env==='city'){addCitySidewalks();scatterObstacles(['car','car','cover','rubble','booth'],Math.max(8,Math.floor(w*h/24)));for(let y=4;y<h-4;y+=5){if(Math.random()>.45){setObstacle('wall',1,y);setObstacle('wall',2,y);setObstacle('wall',w-2,y);}}scatterDecor(['lane','stain','lamp'],Math.max(10,Math.floor(w*h/22)));}
    placePiecesSafely();saveScenario();renderScenario();requestAnimationFrame(()=>fitScenarioBoard());toast('Mapa gerado');
  }
  function applyScenarioPreset(){
    const key=$('scenario-preset').value,preset=SCENARIO_PRESETS[key]||SCENARIO_PRESETS.empty;setMapCore(preset.env,preset.w,preset.h);state.scenario.preset=key;(preset.obstacles||[]).forEach(([type,x,y])=>setObstacle(type,x,y));(preset.terrain||[]).forEach(([type,x,y])=>setTerrain(type,x,y));(preset.decor||[]).forEach(([type,x,y])=>setDecor(type,x,y));placePiecesSafely();saveScenario();renderScenario();requestAnimationFrame(()=>fitScenarioBoard());toast('Modelo aplicado');
  }
  function firstFreeScenarioCell(seed=0){const{w,h}=boardSize(),spots=[];for(let y=0;y<h;y++)for(let x=0;x<w;x++){const t=terrainAt(x,y);if(!scenarioPieceAt(x,y)&&!obstacleAt(x,y)&&!t.water&&!t.gap)spots.push({x,y});}return spots.length?spots[Math.min(seed,spots.length-1)]:null;}
  function scenarioColorFor(entity,index){const fixed=PIECE_COLORS[entity.id],same=state.scenario.pieces.filter(p=>p.kind==='enemy'&&p.baseId===entity.id).length;if(fixed&&same+index===0)return fixed;const seed=[...String(entity.id)].reduce((a,c)=>a+c.charCodeAt(0),0);return AUTO_COLORS[(seed+same+index)%AUTO_COLORS.length];}
  function addScenarioEnemies(){
    const tier=$('scenario-threat-tier').value,choice=$('scenario-threat-choice').value,entity=resolveThreat(tier,choice),qty=clamp($('scenario-enemy-qty').value,1,30),short=PIECE_LABELS[entity.id]||(tier==='special'?'CE':'V');
    for(let i=0;i<qty;i++){const cell=firstFreeScenarioCell(Math.max(0,8+i*2));if(!cell)break;const id=`enemy-${Date.now()}-${i}-${Math.random().toString(36).slice(2,5)}`;state.scenario.pieces.push({id,kind:'enemy',tier,baseId:entity.id,name:qty>1?`${entity.n} ${i+1}`:entity.n,short,color:scenarioColorFor(entity,i),x:cell.x,y:cell.y,movement:movementForEntity(entity)});}saveScenario();renderScenario();toast(`${qty} inimigo${qty===1?'':'s'} adicionado${qty===1?'':'s'}`);
  }
  function handleScenarioCell(cell){
    if(state.role!=='master') return;
    const x=Number(cell.dataset.x),y=Number(cell.dataset.y),piece=scenarioPieceAt(x,y),tool=state.scenario.selectedTool||'select';
    if(tool!=='select'){
      if(tool==='erase'){clearCellArt(x,y);if(piece?.kind==='enemy'){state.scenario.pieces=state.scenario.pieces.filter(p=>p.id!==piece.id);delete state.scenario.turnMovement[piece.id];}}
      else if(!piece){if(TERRAIN_TOOLS.has(tool)){delete state.scenario.obstacles[scenarioCellKey(x,y)];delete state.scenario.decor[scenarioCellKey(x,y)];state.scenario.terrain[scenarioCellKey(x,y)]=tool;}else if(OBSTACLE_META[tool]){delete state.scenario.decor[scenarioCellKey(x,y)];state.scenario.obstacles[scenarioCellKey(x,y)]=tool;}}
      saveScenario();renderScenario();return;
    }
    if(piece){state.scenario.selectedPiece=state.scenario.selectedPiece===piece.id?null:piece.id;saveScenario();renderScenario();return;}
    const selected=selectedScenarioPiece();if(!selected)return;const st=movementStatus(selected),reachable=reachableCells(selected,st.mode,st.remaining),key=scenarioCellKey(x,y);if(!reachable.has(key)){toast('Casa indisponível para esse movimento');return;}
    const cost=reachable.get(key);selected.x=x;selected.y=y;if(!state.scenario.turnMovement[selected.id])state.scenario.turnMovement[selected.id]={mode:st.mode,spent:0};state.scenario.turnMovement[selected.id].mode=st.mode;state.scenario.turnMovement[selected.id].spent=Number(state.scenario.turnMovement[selected.id].spent||0)+cost;saveScenario();renderScenario();
  }
  function setScenarioZoom(delta){state.scenario.zoom=Math.max(.18,Math.min(1.7,Number(state.scenario.zoom||1)+delta));saveScenario();renderScenario();}
  function fitScenarioBoard(){
    const scroll=document.querySelector('.board-scroll');if(!scroll)return;const{w,h}=boardSize(),base=58,pad=28,availableW=Math.max(260,scroll.clientWidth-pad),availableH=Math.max(320,Math.min(window.innerHeight*0.78,860)-pad),fit=Math.min(1.32,availableW/(w*base),availableH/(h*base));state.scenario.zoom=Math.max(.18,Math.min(1.32,fit));saveScenario();renderScenario();scroll.scrollLeft=0;scroll.scrollTop=0;
  }
  function resetAllScenarioMovement(){state.scenario.turnMovement={};state.scenario.movementSpent={};saveScenario();renderScenario();toast('Nova rodada');}

  // -------------------- Notes / export --------------------
  function renderPlayerNotes() {
    const wrap = $('hero-player-notes');
    if (!wrap) return;
    const hero = selectedHero();
    const visible = state.role === 'player' && !!hero;
    wrap.classList.toggle('hidden', !visible);
    if (!visible) return;
    $('hero-notes-title').textContent = `${hero.n} — minhas anotações`;
    const textarea = $('hero-notes-text');
    if (document.activeElement !== textarea) textarea.value = state.playerNotes[hero.id] || '';
    updatePlayerNotesCount();
    $('hero-notes-status').textContent = 'Salvo';
  }

  function updatePlayerNotesCount() {
    const textarea = $('hero-notes-text');
    if (!textarea) return;
    const value = textarea.value || '';
    const words = value.trim() ? value.trim().split(/\s+/).length : 0;
    $('hero-notes-count').textContent = `${words} palavra${words === 1 ? '' : 's'} · ${value.length} caractere${value.length === 1 ? '' : 's'}`;
  }

  function savePlayerNotes() {
    const hero = selectedHero();
    if (!hero || state.role !== 'player') return;
    state.playerNotes[hero.id] = $('hero-notes-text').value;
    localStorage.setItem(STORAGE.playerNotes, JSON.stringify(state.playerNotes));
    clearTimeout(playerNotesSaveTimer);
    if (backendReady && window.ArachneAPI) {
      const heroId = hero.id;
      const note = state.playerNotes[heroId];
      playerNotesSaveTimer = setTimeout(async () => {
        const ok = await window.ArachneAPI.savePlayerNote(heroId, note);
        if (ok) {
          markSaved('Anotações salvas');
          $('hero-notes-status').textContent = 'Salvo';
        }
      }, 350);
    }
    updatePlayerNotesCount();
    markSaved(backendReady ? 'Salvando anotações…' : 'Anotações salvas');
    $('hero-notes-status').textContent = 'Salvando…';
  }

  function playerNotesMarkdown() {
    const hero = selectedHero();
    const date = new Date().toLocaleString('pt-BR');
    return `# Projeto Arachne — ${hero?.n || 'Jogador'}\n\n**Personagem:** ${hero?.n || ''}  \n**Identidade:** ${hero?.r || ''}  \n**Exportado em:** ${date}\n\n---\n\n${$('hero-notes-text').value || ''}\n`;
  }

  async function copyPlayerNotes() {
    const value = $('hero-notes-text').value || '';
    if (!value) return toast('Não há anotações para copiar');
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(value);
      else throw new Error('fallback');
    } catch {
      const temp = document.createElement('textarea');
      temp.value = value; temp.setAttribute('readonly',''); temp.style.position='absolute'; temp.style.left='-9999px';
      document.body.appendChild(temp); temp.select(); document.execCommand('copy'); temp.remove();
    }
    $('hero-notes-status').textContent = 'Copiado agora';
    toast('Anotações copiadas');
  }

  function exportPlayerNotes(format) {
    const hero = selectedHero();
    const value = $('hero-notes-text').value || '';
    if (!hero || !value) return toast('Não há anotações para exportar');
    const stamp = exportStamp();
    if (format === 'md') downloadText(`arachne-${hero.id}-anotacoes_${stamp}.md`, playerNotesMarkdown(), 'text/markdown;charset=utf-8');
    else downloadText(`arachne-${hero.id}-anotacoes_${stamp}.txt`, value, 'text/plain;charset=utf-8');
    $('hero-notes-status').textContent = `Exportado ${format.toUpperCase()}`;
    toast(`Anotações exportadas em .${format}`);
  }

  function activeNotesKey() { return STORAGE.notesMaster; }
  function loadNotesForRole() {
    if (!$('notes-text')) return;
    $('notes-text').value = localStorage.getItem(activeNotesKey()) || '';
    updateNotesCount();
    $('notes-export-status').textContent = 'Bloco privado do Mestre';
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
    const role = 'Mestre';
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
      notes:$('notes-text').value, playerNotes:state.playerNotes, heroes:state.heroes, villains:state.villains, campaign:state.campaign,
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
    renderHomeLiveRolls();
    renderPlayerLiveDice();
    updateNotesCount();
    clearCurrentRollVisual(true);
  }

  // Campanhas / Login
  $('join-campaign-toggle').addEventListener('click', () => {
    $('join-campaign-panel').classList.toggle('hidden');
    $('create-campaign-panel').classList.add('hidden');
    $('campaign-error').textContent = '';
    if (!$('join-campaign-panel').classList.contains('hidden')) $('campaign-code-input').focus();
  });
  $('create-campaign-toggle').addEventListener('click', () => {
    $('create-campaign-panel').classList.toggle('hidden');
    $('join-campaign-panel').classList.add('hidden');
    $('campaign-error').textContent = '';
    if (!$('create-campaign-panel').classList.contains('hidden')) { loadTemplateLibrary(); setCreateCampaignMode(createCampaignMode); $('new-campaign-name').focus(); }
  });
  qsa('[data-create-mode]').forEach(button=>button.addEventListener('click',()=>setCreateCampaignMode(button.dataset.createMode)));
  $('template-picker')?.addEventListener('click',event=>{const button=event.target.closest('[data-template-id]');if(!button)return;selectedTemplateId=button.dataset.templateId;const template=availableTemplates.find(t=>t.id===selectedTemplateId);if(template&&(!$('new-campaign-name').value.trim()||createCampaignMode==='template'))$('new-campaign-name').value=template.name;syncBuilderRosterFromTemplate(true);renderTemplatePicker();renderBuilderCharacterLibrary();renderTemplatePreview();});
  $('builder-hero-library')?.addEventListener('click',event=>{const button=event.target.closest('[data-builder-select][data-builder-kind="hero"]');if(!button)return;toggleBuilderSelection('hero',button.dataset.builderSelect);});
  $('builder-villain-library')?.addEventListener('click',event=>{const button=event.target.closest('[data-builder-select][data-builder-kind="villain"]');if(!button)return;toggleBuilderSelection('villain',button.dataset.builderSelect);});
  $('new-campaign-name')?.addEventListener('input',()=>renderTemplatePreview());
  $('campaign-library').addEventListener('click', async event => {
    const button = event.target.closest('[data-open-campaign]');
    if (!button) return;
    button.disabled = true;
    try {
      const campaign = await window.ArachneAPI.lookupCampaign(button.dataset.openCampaign);
      if (!campaign) throw new Error('Campanha não encontrada.');
      selectCampaign(campaign);
    } catch (error) { $('campaign-error').textContent = error.message; }
    button.disabled = false;
  });
  $('join-campaign-code').addEventListener('click', async () => {
    const code = $('campaign-code-input').value.trim();
    $('campaign-error').textContent = '';
    if (!code) { $('campaign-error').textContent = 'Digite o código da campanha.'; return; }
    const button = $('join-campaign-code'); button.disabled = true;
    try {
      const campaign = await window.ArachneAPI.lookupCampaign(code);
      if (!campaign) throw new Error('Campanha não encontrada. Confira o código.');
      selectCampaign(campaign);
    } catch (error) { $('campaign-error').textContent = error.message; }
    button.disabled = false;
  });
  $('campaign-code-input').addEventListener('keydown', event => { if (event.key === 'Enter') $('join-campaign-code').click(); });
  $('create-campaign').addEventListener('click', async () => {
    const name = $('new-campaign-name').value.trim(), password = $('new-campaign-password').value;
    const pdfFile = createCampaignMode==='pdf' ? $('new-campaign-pdf')?.files?.[0] : null;
    $('campaign-error').textContent = '';
    if(createCampaignMode==='template'&&!selectedTemplateId){$('campaign-error').textContent='Escolha uma campanha pronta.';return;}
    if(createCampaignMode==='pdf'&&!pdfFile){$('campaign-error').textContent='Escolha o PDF da campanha.';return;}
    if(!builderHeroIds.length){$('campaign-error').textContent='Selecione pelo menos um herói para a campanha.';return;}
    const button = $('create-campaign'); button.disabled = true;
    try {
      const campaign = await window.ArachneAPI.createCampaign({name,masterPassword:password,mode:createCampaignMode,templateId:createCampaignMode==='template'?selectedTemplateId:'',heroIds:[...new Set(builderHeroIds)],villainIds:[...new Set(builderVillainIds)]});
      selectCampaign(campaign);
      $('master-password').value = password;
      await enter('master', null, password);
      if(pdfFile&&backendReady){markSaved('Enviando PDF…');const asset=await window.ArachneAPI.uploadAsset(pdfFile);if(asset?.url){state.campaignContent={...state.campaignContent,campaignPdf:asset.url,documentMode:'pdf'};localStorage.setItem(STORAGE.campaignContent,JSON.stringify(state.campaignContent));await window.ArachneAPI.saveMany({campaignContent:state.campaignContent});renderCampaign();}}
      $('new-campaign-name').value = '';
      $('new-campaign-password').value = '';
      if($('new-campaign-pdf'))$('new-campaign-pdf').value='';
      syncBuilderRosterFromTemplate(true);
      renderBuilderCharacterLibrary();
      renderTemplatePreview();
    } catch (error) { $('campaign-error').textContent = error.message; }
    button.disabled = false;
  });
  $('back-campaigns').addEventListener('click', returnToCampaignHub);

  $('player-login').addEventListener('click', () => { qsa('.login-actions').forEach(el => el.classList.add('hidden')); $('password-area').classList.add('hidden'); renderPlayerChoices(activeCampaign?.heroes||[]); $('player-select-area').classList.remove('hidden'); $('login-error').textContent=''; });
  $('player-choice-grid')?.addEventListener('click',async event=>{const button=event.target.closest('[data-player-hero]');if(!button)return;button.disabled=true;await enter('player',button.dataset.playerHero);button.disabled=false;});
  $('back-login').addEventListener('click', () => { $('player-select-area').classList.add('hidden'); qsa('.login-actions').forEach(el => el.classList.remove('hidden')); });
  $('master-login').addEventListener('click', () => {
    $('password-area').classList.toggle('hidden');
    if (!$('password-area').classList.contains('hidden')) $('master-password').focus();
  });
  $('confirm-master').addEventListener('click', async () => {
    const button = $('confirm-master');
    button.disabled = true;
    await enter('master', null, $('master-password').value);
    button.disabled = false;
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

  $('open-campaign-manager')?.addEventListener('click',()=>{$('campaign-manager')?.classList.remove('hidden');renderCampaignManager();});
  $('close-campaign-manager')?.addEventListener('click',()=>$('campaign-manager')?.classList.add('hidden'));
  $('save-campaign-content')?.addEventListener('click',saveCampaignManagerContent);
  $('add-hero')?.addEventListener('click',()=>openAddCharacter('hero'));
  $('add-villain')?.addEventListener('click',()=>openAddCharacter('villain'));
  $('add-campaign-session')?.addEventListener('click',()=>{const sessions=collectCampaignSessions();sessions.push({id:String(sessions.length+1).padStart(2,'0'),title:`Sessão ${sessions.length+1}`,text:''});state.campaignContent={...state.campaignContent,sessions};renderCampaignManager();});
  $('campaign-pdf-upload')?.addEventListener('change',async event=>{const file=event.target.files?.[0];if(!file||!backendReady)return;try{markSaved('Enviando PDF…');const asset=await window.ArachneAPI.uploadAsset(file);if(asset?.url){state.campaignContent={...state.campaignContent,campaignPdf:asset.url,documentMode:'pdf'};localStorage.setItem(STORAGE.campaignContent,JSON.stringify(state.campaignContent));await window.ArachneAPI.saveMany({campaignContent:state.campaignContent});renderCampaign();toast('PDF da campanha atualizado');}}catch(error){toast(error.message||'Falha no upload');}finally{event.target.value='';}});

  document.addEventListener('click',async event=>{
    const add=event.target.closest('[data-add-library-character]');if(add){await addLibraryCharacter(add.dataset.characterKind,add.dataset.addLibraryCharacter);return;}
    const custom=event.target.closest('[data-create-custom-character]');if(custom){createCustomCharacter(custom.dataset.createCustomCharacter);return;}
    const removeSession=event.target.closest('[data-remove-session]');if(removeSession){const sessions=collectCampaignSessions();sessions.splice(Number(removeSession.dataset.removeSession),1);state.campaignContent={...state.campaignContent,sessions:sessions.map((s,i)=>({...s,id:String(i+1).padStart(2,'0')}))};renderCampaignManager();return;}
    const removeHero=event.target.closest('[data-roster-remove-hero]');if(removeHero){const id=removeHero.dataset.rosterRemoveHero,hero=state.heroes.find(h=>h.id===id);if(!hero||!confirm(`Remover ${hero.n} desta campanha?`))return;state.heroes=state.heroes.filter(h=>h.id!==id);delete state.playerNotes[id];state.scenario.pieces=(state.scenario.pieces||[]).filter(p=>p.baseId!==id);localStorage.setItem(STORAGE.heroes,JSON.stringify(state.heroes));localStorage.setItem(STORAGE.playerNotes,JSON.stringify(state.playerNotes));localStorage.setItem(STORAGE.scenario,JSON.stringify(state.scenario));if(backendReady&&window.ArachneAPI)await window.ArachneAPI.deleteHero(id);renderAll();renderCampaignManager();toast('Herói removido');return;}
    const removeVillain=event.target.closest('[data-roster-remove-villain]');if(removeVillain){const id=removeVillain.dataset.rosterRemoveVillain,villain=state.villains.find(v=>v.id===id);if(!villain||!confirm(`Remover ${villain.n} desta campanha?`))return;state.villains=state.villains.filter(v=>v.id!==id);localStorage.setItem(STORAGE.villains,JSON.stringify(state.villains));if(backendReady&&window.ArachneAPI)await window.ArachneAPI.deleteVillain(id);renderAll();renderCampaignManager();toast('Vilão removido');}
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
    if (action.dataset.action === 'adjust-hero') adjustHero(index, action.dataset.resource, Number(action.dataset.delta));
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
  $('generate-scenario-random').addEventListener('click', generateRandomScenario);
  $('apply-scenario-preset').addEventListener('click', applyScenarioPreset);
  $('scenario-add-enemies').addEventListener('click', addScenarioEnemies);
  qsa('[data-obstacle]').forEach(button => button.addEventListener('click', () => {if(button.disabled)return;state.scenario.selectedTool=button.dataset.obstacle;state.scenario.selectedPiece=null;saveScenario();renderScenario();}));
  $('scenario-board').addEventListener('click', event => {const cell=event.target.closest('.scenario-cell');if(cell)handleScenarioCell(cell);});
  $('scenario-zoom-in').addEventListener('click',()=>setScenarioZoom(.1));
  $('scenario-zoom-out').addEventListener('click',()=>setScenarioZoom(-.1));
  $('scenario-fit').addEventListener('click',fitScenarioBoard);
  $('scenario-reset-movement').addEventListener('click',resetAllScenarioMovement);
  $('scenario-reset').addEventListener('click', () => {if(!confirm('Resetar o cenário?'))return;state.scenario=clone(DEFAULT_SCENARIO);saveScenario();renderScenario();requestAnimationFrame(()=>fitScenarioBoard());toast('Cenário resetado');});


  // Notes
  loadNotesForRole();
  $('notes-text').addEventListener('input', () => {
    const key = activeNotesKey();
    const value = $('notes-text').value;
    localStorage.setItem(key, value);
    clearTimeout(masterNotesSaveTimer);
    if (backendReady && window.ArachneAPI) {
      masterNotesSaveTimer = setTimeout(() => window.ArachneAPI.saveStorageKey(key, value), 350);
    }
    updateNotesCount();
    markSaved(backendReady ? 'Salvando anotações…' : 'Anotações salvas');
    $('notes-export-status').textContent = 'Salvando…';
  });
  $('copy-notes').addEventListener('click', copyNotes);
  $('export-notes-md').addEventListener('click', () => exportNotes('md'));
  $('export-notes-txt').addEventListener('click', () => exportNotes('txt'));
  $('export-backup').addEventListener('click', exportBackup);
  $('clear-notes').addEventListener('click', () => {
    if (!$('notes-text').value || !confirm('Limpar todas as anotações?')) return;
    $('notes-text').value = '';
    const key = activeNotesKey();
    localStorage.setItem(key, '');
    if (backendReady && window.ArachneAPI) window.ArachneAPI.saveStorageKey(key, '');
    updateNotesCount();
    $('notes-export-status').textContent = 'Anotações limpas';
    toast('Anotações limpas');
  });

  $('hero-notes-text').addEventListener('input', savePlayerNotes);
  $('copy-hero-notes').addEventListener('click', copyPlayerNotes);
  $('export-hero-notes-md').addEventListener('click', () => exportPlayerNotes('md'));
  $('export-hero-notes-txt').addEventListener('click', () => exportPlayerNotes('txt'));
  $('clear-hero-notes').addEventListener('click', () => {
    const hero = selectedHero();
    if (!hero || !$('hero-notes-text').value || !confirm(`Limpar as anotações de ${hero.n}?`)) return;
    $('hero-notes-text').value = '';
    savePlayerNotes();
    $('hero-notes-status').textContent = 'Anotações limpas';
    toast('Anotações limpas');
  });

  renderAll();
  renderCampaignLibrary();
  document.body.dataset.role = 'guest';
})();
