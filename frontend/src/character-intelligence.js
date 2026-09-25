(() => {
  'use strict';

  const CATEGORY_ORDER=['hero','antihero','villain','minion'];
  const CATEGORY_LABELS={hero:'Heróis',antihero:'Anti-heróis',villain:'Vilões',minion:'Capangas'};
  const CATEGORY_SINGULAR={hero:'Herói',antihero:'Anti-herói',villain:'Vilão',minion:'Capanga'};
  const GROUP_LABELS={
    'Avengers':'Vingadores','Fantastic Four':'Quarteto Fantástico','Sinister Six':'Sexteto Sinistro','X-Men':'X-Men',
    'X-Force':'X-Force','X-Factor':'X-Factor','Champions':'Campeões','Defenders':'Defensores','Heroes for Hire':'Heróis de Aluguel',
    'Masters of Evil':'Mestres do Mal','Brotherhood':'Irmandade','Brotherhood of Evil Mutants':'Irmandade de Mutantes','Dark Avengers':'Vingadores Sombrios',
    'The Hand':'A Mão','Hydra':'Hydra','A.I.M.':'I.M.A.','S.H.I.E.L.D.':'S.H.I.E.L.D.','Thunderbolts':'Thunderbolts',
    'Marauders':'Carrascos','Asgard':'Asgard','Krakoa':'Krakoa','Império Skrull':'Império Skrull','Latvéria':'Latvéria',
    'Onda de Aniquilação':'Onda de Aniquilação','Zona Negativa':'Zona Negativa','Estrada dos Condenados':'Estrada dos Condenados',
    'Ordem da Última Cinza':'Ordem da Última Cinza','Akkaba':'Akkaba','Cavaleiros':'Cavaleiros do Apocalipse','Symbiote Hive':'Colmeia Simbionte',
    'Mercs for Money':'Mercenários por Dinheiro','Power Elite':'Elite do Poder','Fisk Industries':'Fisk Industries','Crime organizado':'Crime Organizado',
    'Independente':'Independente','Savage Avengers':'Vingadores Selvagens','Web-Warriors':'Guerreiros da Teia','Illuminati':'Illuminati',
    'Ultimates':'Ultimates','Agents of Wakanda':'Agentes de Wakanda','Agents of Atlas':'Agentes de Atlas'
  };

  const explicit={
    spider:['daredevil','human-torch','deadpool','venom','octopus','goblin','kingpin','bullseye','tombstone','kingpin-henchman','vulture-henchman','green-goblin-henchman','doctor-octopus-henchman','mysterio-henchman','symbiote'],
    daredevil:['spider','luke-cage','elektra','kingpin','bullseye','tombstone','hand-ninja','kingpin-henchman'],
    wolverine:['cyclops','storm','iceman','gambit','sabretooth','sinister','apocalypse','mystique','juggernaut','magneto','sentinel','reaver','morlock','sinister-follower','apocalypse-follower'],
    cyclops:['wolverine','storm','iceman','gambit','magneto','sinister','apocalypse','mystique','sentinel','reaver'],
    storm:['wolverine','cyclops','iceman','gambit','apocalypse','sinister','sentinel','morlock'],
    iceman:['wolverine','cyclops','storm','gambit','apocalypse','sinister','sentinel'],
    gambit:['wolverine','cyclops','storm','iceman','sinister','sabretooth','sentinel'],
    cap:['iron-man','thor','hawkeye','black-panther','war-machine','vision','crossbones','zemo','hydra-agent','doom'],
    'iron-man':['cap','thor','war-machine','vision','hawkeye','ultron-drone','doom','aim-agent','mercenary'],
    thor:['cap','iron-man','hulk','loki','enchantress','demon','doom'],
    hawkeye:['cap','iron-man','black-panther','vision','zemo','crossbones'],
    'black-panther':['cap','iron-man','shang-chi','storm','doom','mercenary'],
    'black-bolt':['maximus','captain-marvel'],
    maximus:['black-bolt'],
    'devil-dinosaur':['moon-girl'],
    'moon-girl':['devil-dinosaur'],
    'red-wolf':['cap'],
    titania:['she-hulk'],
    vision:['scarlet-witch','iron-man','cap','ultron-drone','doom'],
    'war-machine':['iron-man','cap','aim-agent','ultron-drone','mercenary'],
    'mr-fantastic':['invisible-woman','human-torch','thing','doom','annihilus','super-skrull','blastaar','molecule-man','skrull'],
    'invisible-woman':['mr-fantastic','human-torch','thing','doom','annihilus','super-skrull','skrull'],
    'human-torch':['mr-fantastic','invisible-woman','thing','spider','doom','annihilus','super-skrull','skrull'],
    thing:['mr-fantastic','invisible-woman','human-torch','doom','annihilus','blastaar','super-skrull'],
    deadpool:['spider','wolverine','elektra','ajax','t-ray','madcap','bullseye','mercenary','kingpin'],
    venom:['spider','symbiote','goblin','octopus','kingpin','super-skrull'],
    'doctor-strange':['scarlet-witch','ghost-rider','dormammu-cultist','demon','vampire','infernal-acolyte','hellhound','faceless-man'],
    'scarlet-witch':['vision','doctor-strange','magneto','mystique','apocalypse','demon'],
    hulk:['she-hulk','thor','abomination','mercenary','aim-agent'],
    'she-hulk':['hulk','mr-fantastic','invisible-woman','human-torch','thing','abomination'],
    'captain-marvel':['kree','skrull','super-skrull','shiar','chitauri','annihilus','war-machine','ronan-the-accuser'],
    'ronan-the-accuser':['captain-marvel','kree','skrull'],
    'shang-chi':['luke-cage','daredevil','elektra','hand-ninja','kingpin'],
    'luke-cage':['daredevil','spider','shang-chi','kingpin','tombstone','bullseye'],
    'ghost-rider':['doctor-strange','ghost-rider-robbie-reyes','ash-cultist','infernal-acolyte','hellhound','road-guardian','damned-rider','faceless-man','demon','vampire'],
    'ghost-rider-robbie-reyes':['ghost-rider','doctor-strange','demon','vampire'],
    elektra:['daredevil','deadpool','hand-ninja','kingpin','bullseye','shang-chi'],
    octopus:['spider','doctor-octopus-henchman','goblin','venom','kingpin'],
    goblin:['spider','green-goblin-henchman','octopus','venom','kingpin'],
    kingpin:['daredevil','spider','luke-cage','elektra','bullseye','tombstone','kingpin-henchman'],
    bullseye:['daredevil','elektra','kingpin','deadpool','kingpin-henchman'],
    sabretooth:['wolverine','sinister','mystique','reaver'],
    sinister:['wolverine','cyclops','sabretooth','sinister-follower','apocalypse','mystique'],
    apocalypse:['wolverine','cyclops','storm','sinister','apocalypse-follower','sentinel','magneto'],
    mystique:['wolverine','cyclops','magneto','sabretooth','sinister'],
    magneto:['scarlet-witch','cyclops','wolverine','mystique','juggernaut','sentinel'],
    juggernaut:['wolverine','cyclops','magneto','apocalypse'],
    doom:['mr-fantastic','invisible-woman','human-torch','thing','iron-man','cap','doombot','latveria-soldier'],
    loki:['thor','enchantress','cap'],
    enchantress:['thor','loki','zemo'],
    zemo:['cap','crossbones','hydra-agent','hawkeye'],
    abomination:['hulk','she-hulk'],
    annihilus:['mr-fantastic','invisible-woman','human-torch','thing','blastaar','super-skrull'],
    'super-skrull':['mr-fantastic','invisible-woman','human-torch','thing','skrull','captain-marvel'],
    blastaar:['annihilus','mr-fantastic','thing'],
    'molecule-man':['mr-fantastic','invisible-woman','doom'],
    ajax:['deadpool','mercenary'],
    madcap:['deadpool'],
    't-ray':['deadpool','ghost-rider'],
    crossbones:['cap','hydra-agent','zemo'],
    'hydra-agent':['crossbones','cap','zemo'],
    'aim-agent':['iron-man','war-machine','mercenary'],
    'hand-ninja':['elektra','daredevil','shang-chi'],
    'kingpin-henchman':['kingpin','daredevil','spider','bullseye'],
    'vulture-henchman':['spider'],
    'green-goblin-henchman':['goblin','spider'],
    'doctor-octopus-henchman':['octopus','spider'],
    'mysterio-henchman':['spider'],
    'sinister-follower':['sinister','wolverine','cyclops'],
    'apocalypse-follower':['apocalypse','wolverine','cyclops','storm'],
    'ultron-drone':['vision','iron-man','cap'],
    sentinel:['wolverine','cyclops','storm','iceman','gambit','magneto'],
    doombot:['doom','mr-fantastic','iron-man'],
    deathlok:['cap','war-machine','mercenary'],
    skrull:['super-skrull','captain-marvel','mr-fantastic'],
    kree:['captain-marvel','skrull','shiar'],
    chitauri:['captain-marvel','thor','iron-man','cap'],
    brood:['wolverine','cyclops','captain-marvel'],
    badoon:['captain-marvel','mr-fantastic'],
    shiar:['captain-marvel','cyclops','storm','kree'],
    symbiote:['venom','spider'],
    morlock:['storm','wolverine','cyclops'],
    reaver:['wolverine','cyclops','sentinel'],
    'latveria-soldier':['doom','doombot','mr-fantastic'],
    'kyln-guard':['captain-marvel','annihilus','skrull'],
    vampire:['doctor-strange','ghost-rider','demon'],
    werewolf:['ghost-rider','doctor-strange'],
    wendigo:['wolverine','hulk'],
    demon:['doctor-strange','ghost-rider','dormammu-cultist'],
    'dormammu-cultist':['doctor-strange','demon','ghost-rider'],
    'ash-cultist':['ghost-rider','infernal-acolyte','hellhound'],
    'infernal-acolyte':['ghost-rider','ash-cultist','demon'],
    hellhound:['ghost-rider','damned-rider','faceless-man'],
    'road-guardian':['ghost-rider','damned-rider','faceless-man'],
    'damned-rider':['ghost-rider','road-guardian','faceless-man'],
    'faceless-man':['ghost-rider','damned-rider','infernal-acolyte']
  };

  const affinity=[
    {name:'Núcleo Homem-Aranha',ids:['spider','daredevil','venom','octopus','goblin','kingpin','bullseye','tombstone','kingpin-henchman','vulture-henchman','green-goblin-henchman','doctor-octopus-henchman','mysterio-henchman','symbiote']},
    {name:'Núcleo Mutante',ids:['wolverine','cyclops','storm','iceman','gambit','scarlet-witch','magneto','mystique','sabretooth','sinister','apocalypse','juggernaut','sentinel','reaver','morlock','sinister-follower','apocalypse-follower']},
    {name:'Núcleo Vingadores',ids:['cap','iron-man','thor','hawkeye','black-panther','captain-marvel','hulk','she-hulk','vision','war-machine','scarlet-witch','ultron-drone','zemo','crossbones','loki','enchantress','abomination']},
    {name:'Núcleo Quarteto Fantástico',ids:['mr-fantastic','invisible-woman','human-torch','thing','doom','annihilus','super-skrull','blastaar','molecule-man','skrull','doombot','latveria-soldier']},
    {name:'Núcleo Urbano',ids:['daredevil','luke-cage','spider','deadpool','elektra','shang-chi','kingpin','bullseye','tombstone','hand-ninja','kingpin-henchman','mercenary']},
    {name:'Núcleo Cósmico',ids:['captain-marvel','thor','annihilus','super-skrull','blastaar','skrull','kree','chitauri','brood','badoon','shiar','kyln-guard']},
    {name:'Núcleo Místico',ids:['doctor-strange','scarlet-witch','ghost-rider','loki','enchantress','vampire','werewolf','wendigo','demon','dormammu-cultist','ash-cultist','infernal-acolyte','hellhound','road-guardian','damned-rider','faceless-man']},
    {name:'Núcleo Gama',ids:['hulk','she-hulk','abomination']}
  ];

  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim();
  const splitTeams=value=>String(value||'').split(',').map(x=>x.trim()).filter(Boolean);
  const labelGroup=g=>GROUP_LABELS[g]||g;
  function category(item){
    const alignment=norm(item?.alignment),tier=norm(item?.tier),role=norm(item?.role),tags=(item?.tags||[]).map(norm);
    if(alignment==='antihero'||tier==='anti-heroi'||role.includes('anti-heroi'))return'antihero';
    if(item?.generic===true||tier==='capanga'||tier==='lacaio'||tags.includes('capanga'))return'minion';
    if(item?.libraryKind==='hero'||tags.includes('heroic'))return'hero';
    return'villain';
  }
  function groups(item){
    const set=new Set(splitTeams(item?.teams));
    const id=String(item?.id||'');
    for(const family of affinity)if(family.ids.includes(id))set.add(family.name);
    return [...set];
  }
  function officialGroups(item){return splitTeams(item?.teams);}
  function relationSet(id){
    const set=new Set(explicit[id]||[]);
    for(const [other,links] of Object.entries(explicit))if(links.includes(id))set.add(other);
    return set;
  }
  function enemyNames(item){return(item?.tags||[]).filter(tag=>/^Enemy:/i.test(tag)).map(tag=>norm(tag.replace(/^Enemy:\s*/i,'')));}
  function sharedGroups(a,b){const A=new Set(groups(a));return groups(b).filter(x=>A.has(x));}
  function sameTemplate(idA,idB,templates=[]){return templates.some(t=>{const ids=[...(t.heroes||[]),...(t.villains||[])].map(x=>x.id);return ids.includes(idA)&&ids.includes(idB);});}
  function enemyMatch(a,b){const bNames=[norm(b?.n),norm(b?.r)].filter(Boolean);const aNames=[norm(a?.n),norm(a?.r)].filter(Boolean);return enemyNames(a).some(e=>bNames.some(n=>e&&n&&(e.includes(n)||n.includes(e))))||enemyNames(b).some(e=>aNames.some(n=>e&&n&&(e.includes(n)||n.includes(e))));}
  function relation(a,b,templates=[]){
    if(!a||!b||a.id===b.id)return{score:0,reasons:[]};
    let score=0;const reasons=[];
    const rel=relationSet(String(a.id||''));
    if(rel.has(String(b.id||''))){score+=320;reasons.push('Relação direta');}
    if(enemyMatch(a,b)){score+=280;reasons.push('Inimigo declarado');}
    const shared=sharedGroups(a,b);
    const officialShared=shared.filter(g=>!g.startsWith('Núcleo '));
    if(officialShared.length){score+=Math.min(220,150+officialShared.length*25);reasons.push(`Mesmo grupo: ${labelGroup(officialShared[0])}`);}
    else if(shared.length){score+=115;reasons.push(shared[0]);}
    if(sameTemplate(a.id,b.id,templates)){score+=90;reasons.push('Mesma campanha-base');}
    const ac=category(a),bc=category(b);
    if((ac==='hero'||ac==='antihero')&&(bc==='villain'||bc==='minion')&&rel.has(b.id)){score+=35;}
    if((ac==='villain'||ac==='minion')&&(bc==='hero'||bc==='antihero')&&rel.has(b.id)){score+=35;}
    return{score,reasons:[...new Set(reasons)].slice(0,3)};
  }
  function rankItems(items,{focusId='',selectedIds=[],templates=[]}={}){
    const map=new Map((items||[]).map(x=>[x.id,x]));
    const selected=[...new Set((selectedIds||[]).filter(Boolean))].map(id=>map.get(id)).filter(Boolean);
    const focus=map.get(focusId)||selected[selected.length-1]||null;
    return(items||[]).map(item=>{
      let score=0;const reasons=[];
      if(focus&&item.id===focus.id){score+=1200;reasons.push('Foco atual');}
      if(focus&&item.id!==focus.id){const rel=relation(focus,item,templates);score+=rel.score*1.35;reasons.push(...rel.reasons);}
      for(const source of selected){if(source.id===item.id)continue;const rel=relation(source,item,templates);score+=Math.min(220,rel.score*.42);if(!reasons.length&&rel.reasons.length)reasons.push(...rel.reasons);}
      if(selected.some(x=>x.id===item.id))score+=760;
      return{item,score:Math.round(score),reasons:[...new Set(reasons)].slice(0,2)};
    }).sort((a,b)=>b.score-a.score||String(a.item?.n||'').localeCompare(String(b.item?.n||''),'pt-BR'));
  }
  function collectGroups(items,{categoryKey=''}={}){
    const counts=new Map();
    for(const item of items||[]){if(categoryKey&&category(item)!==categoryKey)continue;for(const g of officialGroups(item)){counts.set(g,(counts.get(g)||0)+1);}}
    return[...counts.entries()].map(([id,count])=>({id,label:labelGroup(id),count})).sort((a,b)=>b.count-a.count||a.label.localeCompare(b.label,'pt-BR'));
  }
  function matchesGroup(item,group){if(!group)return true;return officialGroups(item).includes(group);}
  function describe(item){return{category:category(item),categoryLabel:CATEGORY_SINGULAR[category(item)],groups:groups(item),officialGroups:officialGroups(item)};}

  window.ArachneCharacterIntel={CATEGORY_ORDER,CATEGORY_LABELS,CATEGORY_SINGULAR,GROUP_LABELS,category,groups,officialGroups,labelGroup,relation,rankItems,collectGroups,matchesGroup,describe};
})();
