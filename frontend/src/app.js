(() => {
  'use strict';
  const React = window.React;
  const ReactDOM = window.ReactDOM;
  const API = window.ArachneAPI2;
  const h = React.createElement;
  const ABILITIES = ['Melee','Agility','Resilience','Vigilance','Ego','Logic'];
  const COMBAT = {
    Melee:{label:'Corpo a corpo',short:'MELEE'},
    Agility:{label:'À distância',short:'AGILITY'},
    Ego:{label:'Ataque de Ego',short:'EGO'},
    Logic:{label:'Ataque de Logic',short:'LOGIC'}
  };
  const MINIONS = {
    'minion-melee':{id:'minion-melee',n:'Capanga · Curta distância',tier:'CAPANGA',maxHealth:40,currentHealth:40,maxFocus:30,currentFocus:30,initiative:'+1',abilities:{Melee:2,Agility:1,Resilience:2,Vigilance:1,Ego:0,Logic:0},movement:{run:5,climb:3,swim:3,jump:3}},
    'minion-ranged':{id:'minion-ranged',n:'Capanga · Longo alcance',tier:'CAPANGA',maxHealth:30,currentHealth:30,maxFocus:30,currentFocus:30,initiative:'+2',abilities:{Melee:1,Agility:2,Resilience:1,Vigilance:2,Ego:0,Logic:0},movement:{run:5,climb:3,swim:3,jump:3}},
    'minion-support':{id:'minion-support',n:'Capanga · Suporte',tier:'CAPANGA',maxHealth:30,currentHealth:30,maxFocus:40,currentFocus:40,initiative:'+2',abilities:{Melee:0,Agility:1,Resilience:1,Vigilance:2,Ego:1,Logic:2},movement:{run:5,climb:3,swim:3,jump:3}}
  };
  const MOVE_LABEL = {run:'Correr',climb:'Escalar',swim:'Nadar',jump:'Pular',flight:'Voar',glide:'Planar',swingline:'Balanço',mounted:'Montado'};
  const NAV = [
    ['central','⌂','Central'], ['heroes','♙','Heróis'], ['villains','☠','Vilões'], ['campaign','▣','Campanha'], ['scenario','▦','Cenário'], ['rules','?','Regras'], ['notes','✎','Anotações']
  ];
  const DEFAULT_DATA = {heroes:[],villains:[],campaignContent:{},challenge:{tn:14},scenario:{width:20,height:14,pieces:[],obstacles:{},terrain:{},movementSpent:{},turnMovement:{},minionVitals:{}},initiative:[],combat:{active:false,round:0,order:[]},actionHistory:[],dice:[],playerNotes:{},notesMaster:''};

  const cx = (...parts) => parts.filter(Boolean).join(' ');
  const clamp = (v,a,b) => Math.max(a,Math.min(b,Number(v)||0));
  const signed = n => `${Number(n)>=0?'+':''}${Number(n)||0}`;
  const monogram = name => String(name||'?').split(/\s+/).filter(Boolean).slice(0,2).map(p=>p[0]).join('').toUpperCase();
  const thumb = src => { const value=String(src||''); return value.includes('/portraits/')&&!value.includes('/thumbs/') ? value.replace('/portraits/','/portraits/thumbs/').replace(/\.(png|jpe?g|webp)$/i,'.webp') : value; };
  const fmtClock = at => { try { return new Date(Number(at)||Date.now()).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}); } catch { return ''; } };
  const rollValues = roll => Array.isArray(roll?.values) ? roll.values : Array.isArray(roll?.dice?.values) ? roll.dice.values : [];
  const rollDisplay = values => values.map((v,i)=>i===1&&Number(v)===1?'M':v).join(' · ');
  const campaignStoreKey = 'arachne_campaign_library_react';
  function savedCodes(){ try { return JSON.parse(localStorage.getItem(campaignStoreKey)||'[]').filter(Boolean); } catch { return []; } }
  function rememberCampaign(c){ if(!c?.code)return; try { const next=[c.code,...savedCodes().filter(x=>x!==c.code)].slice(0,20);localStorage.setItem(campaignStoreKey,JSON.stringify(next)); } catch{} }

  const ROTATIONS = {1:'rotateX(0deg) rotateY(0deg) rotateZ(0deg)',2:'rotateX(-90deg) rotateY(0deg) rotateZ(0deg)',3:'rotateX(0deg) rotateY(-90deg) rotateZ(0deg)',4:'rotateX(0deg) rotateY(90deg) rotateZ(0deg)',5:'rotateX(90deg) rotateY(0deg) rotateZ(0deg)',6:'rotateX(0deg) rotateY(180deg) rotateZ(0deg)'};
  function reducedMotion(){ return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
  async function animateDiceStage(root, values){
    if(!root||!Array.isArray(values)||values.length<3)return;
    const cubes=[...root.querySelectorAll('.cube')];
    const msBase=reducedMotion()?60:650;
    await Promise.all(cubes.slice(0,3).map(async(cube,i)=>{
      cube.style.setProperty('--spin-x',`${720+(i+2)*360}deg`);
      cube.style.setProperty('--spin-y',`${1080+(i+1)*360}deg`);
      cube.style.setProperty('--spin-z',`${i*180}deg`);
      cube.style.setProperty('--roll-duration',`${msBase+i*70}ms`);
      cube.classList.remove('rolling'); void cube.offsetWidth; cube.classList.add('rolling'); await sleep(msBase+i*70); cube.classList.remove('rolling');
    }));
    cubes.slice(0,3).forEach((cube,i)=>{ cube.dataset.value=values[i]; cube.style.transform=ROTATIONS[values[i]]||ROTATIONS[1]; });
  }

  function Card(props){ return h('article',{className:cx('rounded-2xl border border-white/10 bg-[#10151d] shadow-[0_18px_60px_rgba(0,0,0,.18)]',props.className)},props.children); }
  function Button({primary=false,danger=false,className='',children,...rest}){ return h('button',{...rest,className:cx('min-h-11 rounded-xl border border-white/10 bg-[#171d27] px-4 py-2 text-xs font-black tracking-wide text-white transition hover:border-white/20 hover:bg-[#1c2430] disabled:cursor-not-allowed disabled:opacity-40',primary&&'border-[#ef3340] bg-[#ef3340] hover:bg-[#ff4351]',danger&&'border-red-900/60 bg-red-950/30 text-red-200',className)},children); }
  function TinyLabel({children,className}){ return h('small',{className:cx('text-[10px] font-black uppercase tracking-[.16em] text-[#8f99a8]',className)},children); }
  function Portrait({entity,size='md',full=false}){
    const src=entity?.image||''; const cls=size==='sm'?'h-10 w-10':size==='lg'?'h-24 w-24':'h-14 w-14';
    return h('span',{className:cx(cls,'shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#090c11] grid place-items-center font-black text-[#a7afbc]')},src?h('img',{src:full?src:thumb(src),alt:'',loading:'lazy',decoding:'async',className:'h-full w-full object-cover'}):monogram(entity?.n));
  }
  function ResourceControl({label,current,max,onDelta,onSet,disabled}){
    return h('div',{className:'rounded-xl border border-white/10 bg-[#0b0f15] p-3'},[
      h(TinyLabel,{key:'l'},label),
      h('div',{key:'r',className:'mt-2 flex items-center gap-2'},[
        h(Button,{key:'m',disabled,onClick:()=>onDelta(-5),className:'min-h-10 px-3'},'-5'),
        h('input',{key:'i',disabled,type:'number',value:current,onChange:e=>onSet(Number(e.target.value)),className:'h-10 w-20 rounded-lg border border-white/10 bg-black/30 px-2 text-center font-black outline-none focus:border-[#ef3340]'}),
        h('span',{key:'x',className:'text-xs text-[#7e8898]'},`/ ${max}`),
        h(Button,{key:'p',disabled,onClick:()=>onDelta(5),className:'ml-auto min-h-10 px-3'},'+5')
      ])
    ]);
  }

  function DiceStage({roll,animating,onEdge,domId,compact=false}){
    const values=rollValues(roll); const edge=Boolean(roll?.edgeRemaining>0&&!roll?.finalized&&!animating);
    const die=(idx,marvel)=>h('button',{key:idx,type:'button',disabled:!edge,onClick:()=>edge&&onEdge&&onEdge(idx),className:cx('die-select',marvel&&'marvel-die',edge&&'edge-ready'),'data-die-index':idx},[
      h('span',{key:'l',className:'die-label'},marvel?'MARVEL DIE':'D6'),
      h('span',{key:'w',className:'cube-wrap'},h('span',{className:cx('cube',marvel&&'marvel-cube'),'data-cube-index':idx,style:{transform:ROTATIONS[values[idx]||1]}},[1,2,3,4,5,6].map(v=>h('i',{key:v,className:`face f${v}`},marvel&&v===1?'M':v))))
    ]);
    return h('div',{id:domId,className:cx('dice-stage-3d action-dice-stage',compact&&'compact-dice-stage')},[die(0,false),h('span',{key:'p1',className:'plus'},'+'),die(1,true),h('span',{key:'p2',className:'plus'},'+'),die(2,false)]);
  }

  function RollResult({roll,animating,onEdge,onFinalize}){
    if(!roll)return h('div',{className:'border-t border-white/5 py-10 text-center text-sm text-[#687282]'},'Escolha uma ação para rolar a D616.');
    const damage=roll.damage; const damageText=animating?'…':damage ? (damage.applied&&Number.isFinite(Number(damage.total))?String(damage.total):damage.success?'—':'0') : null;
    return h('div',{className:'mt-5 border-t border-white/5 pt-4'},[
      h('div',{key:'meta',className:'flex flex-wrap items-end justify-between gap-4'},[
        h('div',{key:'a'},[h(TinyLabel,{key:'l'},'RESULTADO'),h('div',{key:'x',className:'mt-1 flex items-baseline gap-3'},[h('strong',{key:'t',className:'text-3xl'},animating?'…':roll.math?.total??'—'),h('b',{key:'o',className:cx('text-sm',roll.outcome?.success?'text-emerald-400':'text-red-400')},animating?'ROLANDO':roll.outcome?.label||'RESULTADO')])]),
        h('div',{key:'b',className:'text-right text-xs text-[#8b95a2]'},`${roll.snapshot?.ability||''} ${signed(roll.snapshot?.abilityMod||0)} · TN ${roll.snapshot?.tn??'—'}${Number(roll.snapshot?.edge||0)>0?` · EDGE ${roll.snapshot.edge}`:''}${Number(roll.snapshot?.trouble||0)>0?` · TROUBLE ${roll.snapshot.trouble}`:''}`)
      ]),
      h(DiceStage,{key:'dice',roll,animating,onEdge,domId:'central-dice-stage'}),
      damageText!==null?h('div',{key:'d',className:'mx-auto mt-3 max-w-sm rounded-xl border border-[#ef3340]/20 bg-[#ef3340]/5 p-3 text-center'},[h(TinyLabel,{key:'l',className:'text-[#ff7c86]'},'DANO DO ATAQUE'),h('strong',{key:'v',className:'mt-1 block text-2xl'},damageText)]):null,
      roll.edgeRemaining>0&&!roll.finalized&&!animating?h('div',{key:'e',className:'mt-3 flex flex-wrap items-center justify-center gap-3 text-xs text-[#8b95a2]'},['Edge disponível: clique em um dado para rerrolar.',h(Button,{key:'f',onClick:onFinalize,className:'min-h-9 py-1'},'USAR RESULTADO')]):null
    ]);
  }

  function SheetModal({entity,kind,onClose}){
    if(!entity)return null;
    const abilities=entity.abilities||{};
    return h('div',{className:'fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3',onMouseDown:e=>{if(e.target===e.currentTarget)onClose();}},h('div',{className:'max-h-[92vh] w-full max-w-4xl overflow-auto rounded-2xl border border-white/10 bg-[#0d1118] p-5 shadow-2xl'},[
      h('div',{key:'head',className:'flex items-start gap-4'},[
        h(Portrait,{key:'p',entity,size:'lg',full:true}),
        h('div',{key:'c',className:'min-w-0 flex-1'},[h(TinyLabel,{key:'k'},kind==='hero'?'HERÓI':'AMEAÇA'),h('h2',{key:'n',className:'mt-1 text-2xl font-black'},entity.n),h('p',{key:'r',className:'text-sm text-[#8c95a3]'},entity.r||entity.role||''),h('div',{key:'tags',className:'mt-3 flex flex-wrap gap-2'},[entity.rank&&h('span',{key:'rank',className:'rounded-lg border border-white/10 px-2 py-1 text-xs'},`RANK ${entity.rank}`),entity.tier&&h('span',{key:'tier',className:'rounded-lg border border-white/10 px-2 py-1 text-xs'},entity.tier),entity.origin&&h('span',{key:'origin',className:'rounded-lg border border-white/10 px-2 py-1 text-xs'},entity.origin)])]),
        h(Button,{key:'x',onClick:onClose,className:'px-3'},'×')
      ]),
      h('div',{key:'vitals',className:'mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'},[
        ['Health',`${entity.currentHealth??entity.maxHealth??'—'} / ${entity.maxHealth??'—'}`],['Focus',`${entity.currentFocus??entity.maxFocus??'—'} / ${entity.maxFocus??'—'}`],['Initiative',entity.initiative||'—'],['Movimento',entity.speed||'—']
      ].map((x,i)=>h('div',{key:i,className:'rounded-xl border border-white/10 bg-black/20 p-3'},[h(TinyLabel,{key:'l'},x[0]),h('b',{key:'v',className:'mt-1 block text-sm'},x[1])]))),
      h('div',{key:'ab',className:'mt-5'},[h(TinyLabel,{key:'l'},'ABILITIES'),h('div',{key:'g',className:'mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6'},ABILITIES.map(a=>h('div',{key:a,className:'rounded-xl border border-white/10 bg-[#111722] p-3'},[h('small',{key:'l',className:'text-[10px] text-[#8993a1]'},a.toUpperCase()),h('strong',{key:'v',className:'mt-1 block text-xl'},abilities[a]??0),h('span',{key:'d',className:'text-[10px] text-[#697382]'},`DEF ${10+Number(abilities[a]||0)}`)]))) ]),
      (entity.powers||[]).length?h('div',{key:'pw',className:'mt-5'},[h(TinyLabel,{key:'l'},'PODERES'),h('div',{key:'g',className:'mt-2 flex flex-wrap gap-2'},entity.powers.map((p,i)=>h('span',{key:i,className:'rounded-lg border border-white/10 bg-white/[.03] px-3 py-2 text-xs'},p))) ]):null,
      (entity.traits||[]).length?h('div',{key:'tr',className:'mt-5'},[h(TinyLabel,{key:'l'},'TRAITS'),h('p',{key:'p',className:'mt-2 text-sm leading-6 text-[#a5adba]'},entity.traits.join(' · '))]):null,
      (entity.tags||[]).length?h('div',{key:'tg',className:'mt-4'},[h(TinyLabel,{key:'l'},'TAGS'),h('p',{key:'p',className:'mt-2 text-sm leading-6 text-[#a5adba]'},entity.tags.join(' · '))]):null,
      entity.pdf?h('a',{key:'pdf',href:entity.pdf,target:'_blank',rel:'noopener',className:'mt-5 inline-flex min-h-11 items-center rounded-xl border border-[#ef3340]/40 bg-[#ef3340]/10 px-4 text-xs font-black text-white'},'ABRIR PDF DA FICHA'):null
    ]));
  }

  function CharacterStrip({items,selectedKey,onSelect,mode='villain'}){
    return h('div',{className:'scrollbar-thin flex gap-2 overflow-x-auto pb-2'},items.map(item=>h('button',{key:item.key,onClick:()=>onSelect(item.key),className:cx('min-w-[132px] rounded-xl border bg-[#111720] p-2 text-left transition',selectedKey===item.key?'border-[#ef3340] bg-[#2a1117]':'border-white/10 hover:border-white/20')},[
      h(Portrait,{key:'p',entity:item.entity,size:'sm'}),
      h('b',{key:'n',className:'mt-2 block truncate text-xs'},item.label||item.entity.n),
      h('small',{key:'k',className:'text-[9px] font-bold text-[#788291]'},item.kind==='hero'?'HERÓI':item.kind==='other'?'CAPANGA':mode==='hero'?'HERÓI':'VILÃO')
    ])));
  }

  function TNControl({tn,onChange}){
    return h('label',{className:'flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2'},[h('span',{key:'l',className:'text-xs font-black text-[#929baa]'},'TN'),h('input',{key:'i',type:'number',min:1,max:99,value:tn,onChange:e=>onChange(clamp(e.target.value,1,99)),className:'w-14 bg-transparent text-center text-lg font-black outline-none'})]);
  }

  function RollModifierControl({label,value,onChange,tone}){
    const isEdge=tone==='edge';
    return h('div',{className:cx('flex items-center gap-2 rounded-xl border bg-black/20 px-2 py-2',isEdge?'border-emerald-900/50':'border-red-900/50')},[
      h('span',{key:'l',className:cx('text-[10px] font-black uppercase',isEdge?'text-emerald-400':'text-red-300')},label),
      h(Button,{key:'m',type:'button',disabled:value<=0,onClick:()=>onChange(clamp(value-1,0,6)),className:'min-h-9 px-3 py-1'},'−'),
      h('strong',{key:'v',className:'w-6 text-center text-sm'},value),
      h(Button,{key:'p',type:'button',disabled:value>=6,onClick:()=>onChange(clamp(value+1,0,6)),className:'min-h-9 px-3 py-1'},'+')
    ]);
  }

  function ActionCenter({entity,category,onCategory,onRoll,roll,animating,onEdge,onFinalize,tn,onTN,power,onPower,edge,trouble,onEdgeChange,onTroubleChange}){
    if(!entity)return h(Card,{className:'p-5'},h('p',{className:'text-sm text-[#7d8796]'},'Selecione um personagem.'));
    let options=[];
    if(category==='combat') options=Object.entries(COMBAT).map(([ability,meta])=>h('button',{key:ability,onClick:()=>onRoll(ability,true),disabled:animating,className:'rounded-xl border border-white/10 bg-[#121923] p-4 text-left transition hover:border-[#ef3340]/50 hover:bg-[#181a22] disabled:opacity-40'},[h(TinyLabel,{key:'s'},meta.short),h('div',{key:'r',className:'mt-2 flex items-end justify-between gap-3'},[h('b',{key:'l',className:'text-sm'},meta.label),h('strong',{key:'v',className:'text-xl'},signed(entity.abilities?.[ability]||0))]),h('span',{key:'x',className:'mt-3 block text-xs font-black text-[#8d96a4]'},'ROLAR D616')]));
    if(category==='test') options=ABILITIES.map(ability=>h('button',{key:ability,onClick:()=>onRoll(ability,false),disabled:animating,className:'rounded-xl border border-white/10 bg-[#121923] p-4 text-left hover:border-white/20 disabled:opacity-40'},[h(TinyLabel,{key:'s'},ability),h('strong',{key:'v',className:'mt-2 block text-2xl'},signed(entity.abilities?.[ability]||0)),h('span',{key:'x',className:'mt-2 block text-xs text-[#7f8998]'},'ROLAR')]));
    if(category==='powers') {
      const powers=entity.powers||[];
      options=h('div',{className:'space-y-3'},[
        h('div',{key:'p',className:'flex flex-wrap gap-2'},powers.length?powers.map((p,i)=>h('button',{key:i,onClick:()=>onPower(p),className:cx('rounded-lg border px-3 py-2 text-xs font-bold',power===p?'border-[#ef3340] bg-[#ef3340]/10':'border-white/10 bg-[#111720]')},p)):h('span',{className:'text-sm text-[#707a89]'},'Nenhum poder cadastrado.')),
        power?h('div',{key:'a',className:'grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6'},ABILITIES.map(ability=>h('button',{key:ability,onClick:()=>onRoll(ability,false),className:'rounded-xl border border-white/10 bg-[#121923] p-3 text-left'},[h(TinyLabel,{key:'l'},ability),h('strong',{key:'v',className:'mt-1 block text-xl'},signed(entity.abilities?.[ability]||0))]))):null
      ]);
    }
    if(category==='movement') options=h('div',{className:'grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6'},Object.entries(entity.movement||{}).map(([mode,value])=>h('div',{key:mode,className:'rounded-xl border border-white/10 bg-[#121923] p-4'},[h(TinyLabel,{key:'l'},MOVE_LABEL[mode]||mode),h('strong',{key:'v',className:'mt-2 block text-2xl'},value)])));
    return h(Card,{className:'p-4 sm:p-5'},[
      h('div',{key:'head',className:'flex flex-wrap items-center justify-between gap-3'},[
        h('div',{key:'t'},[h(TinyLabel,{key:'s'},'CENTRAL DE AÇÕES'),h('h2',{key:'h',className:'mt-1 text-xl font-black'},'O que você quer rolar?')]),
        h('div',{key:'controls',className:'flex flex-wrap items-center gap-2'},[
          h(TNControl,{key:'tn',tn,onChange:onTN}),
          category!=='movement'?h(RollModifierControl,{key:'edge',label:'EDGE',value:edge,onChange:onEdgeChange,tone:'edge'}):null,
          category!=='movement'?h(RollModifierControl,{key:'trouble',label:'TROUBLE',value:trouble,onChange:onTroubleChange,tone:'trouble'}):null
        ])
      ]),
      h('div',{key:'tabs',className:'mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4'},[['combat','⚔','COMBATE'],['test','◉','TESTES'],['powers','✦','PODERES'],['movement','↗','MOVIMENTO']].map(x=>h('button',{key:x[0],onClick:()=>onCategory(x[0]),className:cx('min-h-12 rounded-xl border text-xs font-black',category===x[0]?'border-[#ef3340] bg-[#ef3340]/10 text-white':'border-white/10 bg-[#0f141b] text-[#8d96a4]')},`${x[1]} ${x[2]}`))),
      h('div',{key:'label',className:'mt-5'},h(TinyLabel,null,category==='movement'?'MOVIMENTOS':'ESCOLHA A AÇÃO')),
      h('div',{key:'opts',className:category==='combat'?'mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4':category==='test'?'mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6':'mt-3'},options),
      category!=='movement'?h(RollResult,{key:'r',roll,animating,onEdge,onFinalize}):null
    ]);
  }

  function InitiativePanel({initiative,choices,onAdd,onRemove,onRoll,onRollAll,lastRoll,animating}){
    const pending=(initiative||[]).filter(x=>x.result===null||x.result===''||!Number.isFinite(Number(x.result)));
    return h(Card,{className:'p-4 sm:p-5'},[
      h('div',{key:'h'},[h(TinyLabel,{key:'s'},'INICIATIVA'),h('h2',{key:'t',className:'mt-1 text-xl font-black'},'Ordem inicial')]),
      h('div',{key:'add',className:'mt-4 flex flex-col gap-2 sm:flex-row'},[
        h('select',{key:'s',id:'initiative-choice',className:'min-h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-[#0b0f15] px-3 text-sm outline-none'},choices.map(c=>h('option',{key:c.id,value:c.id},c.n))),
        h(Button,{key:'b',primary:true,onClick:()=>{const el=document.getElementById('initiative-choice');onAdd(el&&el.value);}},'ADICIONAR')
      ]),
      h('div',{key:'rows',className:'mt-4 space-y-2'},initiative?.length?initiative.map((item,index)=>h('div',{key:item.id,className:'grid grid-cols-[28px_1fr_auto_auto] items-center gap-2 rounded-xl border border-white/10 bg-[#111720] p-2 sm:grid-cols-[28px_1fr_130px_auto_auto]'},[
        h('span',{key:'i',className:'text-center text-xs font-black text-[#697383]'},index+1),
        h('div',{key:'n',className:'min-w-0'},[h('b',{key:'b',className:'block truncate text-xs'},item.name),h('small',{key:'s',className:'text-[9px] text-[#727c8a]'},`${signed(item.modifier||0)} iniciativa`)]),
        h('div',{key:'v',className:'hidden text-right sm:block'},[h('small',{key:'l',className:'block text-[8px] text-[#6c7584]'},item.result!=null?'RESULTADO':'AGUARDANDO'),h('b',{key:'x'},item.result??'—')]),
        h(Button,{key:'r',disabled:animating||item.result!=null,onClick:()=>onRoll(item.id),className:'min-h-9 px-3 py-1'},item.result!=null?'OK':'ROLAR'),
        h(Button,{key:'x',disabled:animating,onClick:()=>onRemove(item.id),danger:true,className:'min-h-9 px-3 py-1'},'×')
      ])):h('div',{className:'rounded-xl border border-dashed border-white/10 p-6 text-center text-xs text-[#717b89]'},'Adicione os participantes da cena.') ),
      h('div',{key:'sum',className:'mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-3'},[h('span',{key:'s',className:'text-xs text-[#7d8795]'},`${initiative?.length||0} participantes · ${pending.length} pendentes`),h(Button,{key:'b',disabled:animating||!pending.length,onClick:onRollAll},'ROLAR PENDENTES')]),
      h('div',{key:'dice',className:'mt-3 rounded-xl border border-white/5 bg-black/15 p-2'},[h(DiceStage,{key:'d',roll:lastRoll,animating,domId:'initiative-dice-stage',compact:true}),h('div',{key:'t',className:'text-center'},[h(TinyLabel,{key:'l'},'D616 DE INICIATIVA'),h('b',{key:'v',className:'mt-1 block text-sm'},lastRoll?.snapshot?.actorName?`${lastRoll.snapshot.actorName} · ${lastRoll.math?.total??'—'}`:'Pronto para rolar')])])
    ]);
  }

  function RollHistory({rows}){
    return h(Card,{className:'p-4 sm:p-5'},[
      h('div',{key:'h'},[h(TinyLabel,{key:'s'},'HISTÓRICO DA SESSÃO'),h('h2',{key:'t',className:'mt-1 text-xl font-black'},'Todas as rolagens')]),
      h('div',{key:'list',className:'mt-4 divide-y divide-white/5'},rows?.length?rows.slice().reverse().map((entry,i)=>h('div',{key:entry.rollId||`${entry.at}-${i}`,className:'grid grid-cols-[1fr_auto] gap-3 py-3 sm:grid-cols-[1fr_auto_auto]'},[
        h('div',{key:'a',className:'min-w-0'},[h('b',{key:'b',className:'block truncate text-xs'},entry.actorName||entry.label||'Rolagem'),h('small',{key:'s',className:'mt-1 block text-[10px] text-[#788290]'},`${entry.ability||entry.action||entry.type||'D616'} · D616 ${rollDisplay(entry.dice?.values||[])} · TN ${entry.tn??'—'}`)]),
        h('div',{key:'b',className:'text-right'},[h('strong',{key:'t',className:'text-lg'},entry.total??'—'),h('small',{key:'o',className:cx('block text-[9px]',String(entry.outcome||'').includes('SUCESSO')?'text-emerald-400':'text-[#8a94a2]')},entry.outcome||'')]),
        h('time',{key:'c',className:'hidden self-center text-[9px] text-[#687281] sm:block'},fmtClock(entry.at))
      ])):h('div',{className:'py-10 text-center text-xs text-[#6e7887]'},'Nenhuma rolagem registrada ainda.'))
    ]);
  }

  function Board({scenario,heroes,villains,role,heroId,selected,onSelect,onMove,zoom,onZoom,onReset}){
    const width=Math.max(4,Number(scenario?.width)||20),height=Math.max(4,Number(scenario?.height)||14),pieces=Array.isArray(scenario?.pieces)?scenario.pieces:[];
    const chars=[...(heroes||[]),...(villains||[])]; const getChar=p=>chars.find(c=>c.id===(p.characterId||p.baseId))||MINIONS[p.baseId]||null;
    const canSelect=p=>role==='master'||(p.kind==='hero'&&String(p.characterId||p.baseId)===String(heroId||''));
    const cellSize=40;
    const cells=[];
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){
      const key=`${x},${y}`,ob=scenario?.obstacles?.[key],terrain=scenario?.terrain?.[key],piece=pieces.find(p=>Number(p.x)===x&&Number(p.y)===y);
      const entity=piece?getChar(piece):null;
      cells.push(h('button',{key,type:'button',onClick:()=>{if(piece&&canSelect(piece))onSelect(piece.id);else if(!piece&&selected)onMove(x,y);},className:cx('board-cell',terrain&&`terrain-${terrain}`,ob&&'has-obstacle',piece&&'has-piece',selected&&piece?.id===selected&&'selected-piece'),'data-x':x,'data-y':y},[
        ob?h('span',{key:'o',className:'obstacle-mark'},String(ob).slice(0,1).toUpperCase()):null,
        piece?h('span',{key:'p',className:cx('board-token',canSelect(piece)&&'movable'),title:piece.name||entity?.n||''},(entity?.image||piece.image)?h('img',{src:thumb(entity?.image||piece.image),alt:'',loading:'lazy'}):h('b',null,piece.short||monogram(piece.name||entity?.n))):null
      ]));
    }
    return h(Card,{className:'overflow-hidden'},[
      h('div',{key:'h',className:'flex flex-wrap items-center justify-between gap-3 p-4'},[
        h('div',{key:'t'},[h(TinyLabel,{key:'s'},'CENÁRIO'),h('h2',{key:'h',className:'mt-1 text-xl font-black'},role==='master'?'Controle das peças':'Seu movimento')]),
        h('div',{key:'c',className:'flex items-center gap-2'},[h(Button,{key:'m',onClick:()=>onZoom(Math.max(.45,zoom-.08)),className:'px-3'},'−'),h('span',{key:'z',className:'w-14 text-center text-xs font-black'},`${Math.round(zoom*100)}%`),h(Button,{key:'p',onClick:()=>onZoom(Math.min(1.35,zoom+.08)),className:'px-3'},'+'),h(Button,{key:'r',onClick:onReset},role==='master'?'NOVA RODADA':'REINICIAR')])
      ]),
      h('div',{key:'hint',className:'mx-4 rounded-xl border border-dashed border-white/10 px-3 py-2 text-xs text-[#7c8695]'},role==='master'?'Selecione qualquer peça e depois clique no destino.':'Selecione sua peça e depois clique no destino.'),
      h('div',{key:'scroll',className:'board-scroll mt-3 overflow-auto bg-[#070a0e] p-4'},h('div',{className:'board-grid',style:{gridTemplateColumns:`repeat(${width}, ${cellSize}px)`,gridTemplateRows:`repeat(${height}, ${cellSize}px)`,transform:`scale(${zoom})`,transformOrigin:'top left',width:`${width*cellSize}px`,height:`${height*cellSize}px`}},cells))
    ]);
  }

  function Sidebar({page,onPage,profile,campaign,onLogout,open,onClose}){
    const role=profile?.role||'player',solo=profile?.campaign?.campaignContent?.mode==='solo';
    return h('aside',{className:cx('fixed inset-y-0 left-0 z-40 w-[250px] border-r border-white/10 bg-[#0b0f14] p-4 transition-transform lg:translate-x-0',open?'translate-x-0':'-translate-x-full')},[
      h('div',{key:'b',className:'flex items-center gap-3 px-1 py-2'},[h('div',{key:'a',className:'grid h-12 w-12 place-items-center border border-[#ef3340] text-xl font-black'},'A'),h('div',{key:'t'},[h('b',{key:'n',className:'block text-sm tracking-[.08em]'},'Projeto Arachne'),h('small',{key:'c',className:'text-[8px] tracking-[.15em] text-[#707a88]'},campaign?.code?`CÓDIGO ${campaign.code}`:'MARVEL MULTIVERSE RPG')])]),
      h('div',{key:'r',className:'mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-[#171d26] px-3 py-3'},[h('span',{key:'l',className:'text-[10px] font-black tracking-[.12em] text-[#ff7a84]'},role==='master'?(solo?'SOLO':'MESTRE'):'JOGADOR'),h('button',{key:'x',onClick:onLogout,className:'text-[10px] font-bold text-[#8b95a3]'},'Sair')]),
      h('nav',{key:'n',className:'mt-4 space-y-1'},NAV.filter(x=>!(role!=='master'&&['villains','campaign','notes'].includes(x[0]))).map(x=>h('button',{key:x[0],onClick:()=>{onPage(x[0]);onClose();},className:cx('flex min-h-12 w-full items-center gap-3 rounded-xl border px-3 text-left text-sm font-bold',page===x[0]?'border-white/10 bg-[#1a202a] text-white':'border-transparent text-[#8e97a5] hover:bg-white/[.03]')},[h('span',{key:'i',className:'w-6 text-center'},x[1]),h('span',{key:'t'},x[2])]))),
      h('div',{key:'f',className:'absolute bottom-5 left-5 text-[9px] text-[#5f6876]'},'MARVEL MULTIVERSE RPG')
    ]);
  }

  class ArachneApp extends React.Component {
    constructor(props){
      super(props);
      this.state={screen:'loading',campaigns:[],templates:[],characters:{heroes:[],villains:[]},selectedCampaign:null,accessMode:'',joinCode:'',masterPassword:'',createOpen:false,createTemplate:'',createName:'',createPassword:'',profile:null,data:{...DEFAULT_DATA},page:'central',navOpen:false,actorKey:'',category:'combat',power:'',roll:null,rollAnimating:false,initiativeRoll:null,initiativeAnimating:false,tn:14,edge:0,trouble:0,selectedPiece:null,zoom:.72,sheet:null,status:'offline',toast:'',error:''};
      this.toastTimer=null; this.tnTimer=null;
    }
    componentDidMount(){ this.bootstrap(); }
    componentDidUpdate(prev){
      if(this.state.rollAnimating && this.state.roll!==prev.roll) this.animateCurrentRoll();
      if(this.state.initiativeAnimating && this.state.initiativeRoll!==prev.initiativeRoll) this.animateInitiativeRoll();
    }
    componentWillUnmount(){ API.disconnectRealtime(); clearTimeout(this.toastTimer); clearTimeout(this.tnTimer); }
    toast(message){ clearTimeout(this.toastTimer); this.setState({toast:String(message||'')}); this.toastTimer=setTimeout(()=>this.setState({toast:''}),2600); }
    async bootstrap(){
      try{
        const health=await API.health();
        if(!health.ok){ this.setState({screen:'login',error:`Backend não conectado: ${health.error||'falha de conexão'}`}); return; }
        const [templates,characters]=await Promise.all([API.getTemplates(),API.getCharacters()]);
        if(API.token&&API.profile){
          try{const profile=await API.profileSession(); const data=await API.loadAll(); this.enterApp(profile,data,templates,characters); return;}catch{API.clearSession();}
        }
        const codes=['ARACHNE',...savedCodes()]; const campaigns=await API.lookupCampaigns([...new Set(codes)]);
        this.setState({screen:'login',campaigns,templates,characters,error:''});
      }catch(error){ this.setState({screen:'login',error:error.message||'Falha ao iniciar o Arachne.'}); }
    }
    enterApp(profile,data,templates=this.state.templates,characters=this.state.characters){
      const merged={...DEFAULT_DATA,...data,challenge:{...DEFAULT_DATA.challenge,...(data.challenge||{})},scenario:{...DEFAULT_DATA.scenario,...(data.scenario||{})}};
      const tn=clamp(merged.challenge?.tn||14,1,99); const campaign=profile.campaign; rememberCampaign(campaign);
      this.setState({screen:'app',profile,data:merged,templates,characters,selectedCampaign:campaign,tn,edge:0,trouble:0,page:'central',actorKey:'',roll:null,category:'combat',power:'',error:''},()=>{this.ensureActor();this.connectRealtime();});
    }
    connectRealtime(){ API.connectRealtime({onStatus:status=>this.setState({status}),onState:event=>{if(!event?.key)return;this.setState(prev=>({data:{...prev.data,[event.key]:event.value},tn:event.key==='challenge'?clamp(event.value?.tn||prev.tn,1,99):prev.tn}),()=>this.ensureActor());}}); }
    ensureActor(){
      if(this.state.profile?.role!=='master')return;
      const list=this.masterActors(); if(!list.length)return;
      if(!list.some(x=>x.key===this.state.actorKey))this.setState({actorKey:list[0].key,roll:null,power:''});
    }
    masterActors(){
      const d=this.state.data,solo=d.campaignContent?.mode==='solo'; const out=[];
      if(solo)(d.heroes||[]).forEach(e=>out.push({key:`hero|${e.id}`,kind:'hero',entity:e,label:e.n}));
      (d.villains||[]).forEach(e=>out.push({key:`villain|${e.id}`,kind:'villain',entity:e,label:e.n}));
      Object.values(MINIONS).forEach(base=>{const vit=d.scenario?.minionVitals?.[base.id]||{};out.push({key:`other|${base.id}`,kind:'other',entity:{...base,...vit},label:base.n});});
      return out;
    }
    currentEntity(){
      if(this.state.profile?.role==='player')return (this.state.data.heroes||[]).find(h=>h.id===this.state.profile.heroId)||null;
      return this.masterActors().find(x=>x.key===this.state.actorKey)?.entity||null;
    }
    currentKind(){ if(this.state.profile?.role==='player')return'hero'; return this.masterActors().find(x=>x.key===this.state.actorKey)?.kind||'villain'; }
    async openCampaign(code){ try{const c=await API.lookupCampaign(code);if(!c)throw new Error('Campanha não encontrada.');this.setState({selectedCampaign:c,accessMode:'',masterPassword:'',error:''});}catch(e){this.setState({error:e.message});} }
    async joinSelected(role,heroId){
      const c=this.state.selectedCampaign;if(!c)return;
      try{
        const solo=c.campaignContent?.mode==='solo'; const actualRole=solo?'master':role;
        const profile=await API.join(actualRole,{campaignCode:c.code,heroId:actualRole==='player'?heroId:null,password:actualRole==='master'?this.state.masterPassword:''});
        const data=await API.loadAll(); this.enterApp(profile,data);
      }catch(e){this.setState({error:e.message||'Não foi possível entrar.'});}
    }
    async createCampaign(){
      const t=this.state.templates.find(x=>x.id===this.state.createTemplate); const name=(this.state.createName||t?.name||'').trim();
      try{const c=await API.createCampaign({name,masterPassword:this.state.createPassword,mode:'template',templateId:t?.id||'',heroIds:(t?.heroes||[]).map(x=>x.id),villainIds:(t?.villains||[]).map(x=>x.id)});rememberCampaign(c);this.setState(prev=>({campaigns:[c,...prev.campaigns.filter(x=>x.code!==c.code)],selectedCampaign:c,createOpen:false,error:''}));this.toast(`Mesa criada: ${c.code}`);}catch(e){this.setState({error:e.message});}
    }
    logout(){API.clearSession();this.setState({screen:'login',profile:null,data:{...DEFAULT_DATA},selectedCampaign:null,page:'central',roll:null});this.bootstrap();}
    setPage(page){this.setState({page});}
    updateTN(tn){this.setState({tn});clearTimeout(this.tnTimer);this.tnTimer=setTimeout(async()=>{try{await API.setChallengeTN(tn);}catch(e){this.toast(e.message);}},350);}
    async adjustResource(deltaOrValue,resource,absolute=false){
      const entity=this.currentEntity(),kind=this.currentKind();if(!entity)return;
      const maxKey=resource==='health'?'maxHealth':'maxFocus',curKey=resource==='health'?'currentHealth':'currentFocus';const max=Number(entity[maxKey]||0),current=Number(entity[curKey]??max);const next=clamp(absolute?deltaOrValue:current+deltaOrValue,0,max);
      try{
        if(kind==='other'){
          const scenario={...this.state.data.scenario,minionVitals:{...(this.state.data.scenario?.minionVitals||{}),[entity.id]:{...(this.state.data.scenario?.minionVitals?.[entity.id]||{}),[maxKey]:max,[curKey]:next}}};
          await API.saveState('scenario',scenario); this.setState(prev=>({data:{...prev.data,scenario}}));
        }else{
          const values={};values[curKey]=next;const updated=await API.adjustResources(kind,entity.id,values); const key=kind==='hero'?'heroes':'villains';this.setState(prev=>({data:{...prev.data,[key]:(prev.data[key]||[]).map(x=>x.id===updated.id?updated:x)}}));
        }
      }catch(e){this.toast(e.message||'Falha ao alterar recurso.');}
    }
    async runAction(ability,isCombat){
      const entity=this.currentEntity(),kind=this.currentKind();if(!entity||this.state.rollAnimating)return;
      const category=this.state.category; const action=isCombat?`Combate · ${ability}`:category==='powers'?`${this.state.power||'Poder'} · ${ability}`:`Teste · ${ability}`;
      try{
        const payload={ability,action,tn:this.state.tn,edge:this.state.edge,trouble:this.state.trouble};
        if(this.state.profile.role==='player')payload.attack=isCombat;
        else Object.assign(payload,{actorId:entity.id,kind:kind==='hero'?'hero':'villain',source:kind==='hero'?'hero':'threat',rollType:isCombat?'attack':'test',deferFinalize:true,actor:kind==='other'?{id:entity.id,n:entity.n,abilities:entity.abilities}:undefined});
        const roll=await API.startActionRoll(payload);this.setState({roll,rollAnimating:true});
      }catch(e){this.toast(e.message||'Não foi possível rolar.');}
    }
    async animateCurrentRoll(){ const root=document.getElementById('central-dice-stage'); const roll=this.state.roll;if(!root||!roll)return;await animateDiceStage(root,roll.initialValues||roll.values);this.setState({rollAnimating:false},async()=>{if(this.state.profile.role==='master'&&this.state.roll?.edgeRemaining===0&&!this.state.roll?.finalized){try{const done=await API.finalizeActionRoll(this.state.roll.id);this.setState({roll:done});}catch{}}}); }
    async useEdge(index){ const roll=this.state.roll;if(!roll?.id||this.state.rollAnimating||roll.finalized)return;try{const next=await API.useActionEdge(roll.id,index);this.setState({roll:next,rollAnimating:true},async()=>{const root=document.getElementById('central-dice-stage');await animateDiceStage(root,next.values);this.setState({rollAnimating:false});});}catch(e){this.toast(e.message);}}
    async finalizeRoll(){const roll=this.state.roll;if(!roll?.id)return;try{this.setState({roll:await API.finalizeActionRoll(roll.id)});}catch(e){this.toast(e.message);}}
    async initAdd(baseId){if(!baseId)return;try{const data=await API.addInitiativeParticipant(baseId);this.setState(prev=>({data:{...prev.data,initiative:data.initiative||[]}}));}catch(e){this.toast(e.message);}}
    async initRemove(id){try{const data=await API.removeInitiativeParticipant(id);this.setState(prev=>({data:{...prev.data,initiative:data.initiative||[],scenario:data.scenario||prev.data.scenario}}));}catch(e){this.toast(e.message);}}
    async initRoll(id){if(this.state.initiativeAnimating)return;try{const data=await API.rollInitiativeParticipant(id);const roll=data.roll||data;this.setState(prev=>({data:{...prev.data,initiative:data.initiative||prev.data.initiative},initiativeRoll:roll,initiativeAnimating:true}));}catch(e){this.toast(e.message);}}
    async animateInitiativeRoll(){const root=document.getElementById('initiative-dice-stage'),roll=this.state.initiativeRoll;if(root&&roll)await animateDiceStage(root,roll.initialValues||roll.values);this.setState({initiativeAnimating:false});}
    async initRollAll(){const pending=(this.state.data.initiative||[]).filter(x=>x.result==null||x.result===''||!Number.isFinite(Number(x.result)));for(const item of pending){await this.initRoll(item.id);while(this.state.initiativeAnimating)await sleep(50);} }
    async movePiece(x,y){const pieceId=this.state.selectedPiece;if(!pieceId)return;const piece=(this.state.data.scenario?.pieces||[]).find(p=>p.id===pieceId);if(!piece)return;try{const result=await API.moveScenarioPiece({pieceId,x,y,mode:'run',from:{x:piece.x,y:piece.y}});this.setState(prev=>({data:{...prev.data,scenario:result.scenario||prev.data.scenario}}));}catch(e){this.toast(e.message);}}
    async resetMovement(){try{const values=this.state.profile.role==='master'?{all:true}:{pieceId:this.state.selectedPiece};const result=await API.resetScenarioMovement(values);this.setState(prev=>({data:{...prev.data,scenario:result.scenario||result?.data?.scenario||prev.data.scenario}}));}catch(e){this.toast(e.message);}}
    openSheet(entity,kind){this.setState({sheet:{entity,kind}});}

    renderLogin(){
      const s=this.state,selected=s.selectedCampaign,solo=selected?.campaignContent?.mode==='solo';
      if(selected){
        return h('div',{className:'min-h-screen bg-[#080b10] text-white grid place-items-center p-4'},h('div',{className:'w-full max-w-3xl'},[
          h('button',{key:'back',onClick:()=>this.setState({selectedCampaign:null,accessMode:'',error:''}),className:'mb-4 text-xs font-bold text-[#8d96a3]'},'← VOLTAR ÀS CAMPANHAS'),
          h(Card,{key:'card',className:'p-5 sm:p-7'},[
            h(TinyLabel,{key:'c'},`CÓDIGO ${selected.code}`),h('h1',{key:'n',className:'mt-2 text-3xl font-black'},selected.name),h('p',{key:'s',className:'mt-2 text-sm text-[#8d96a4]'},selected.campaignContent?.subtitle||''),
            solo?h('div',{key:'solo',className:'mt-6'},[h('input',{key:'p',type:'password',placeholder:'Senha da campanha solo',value:s.masterPassword,onChange:e=>this.setState({masterPassword:e.target.value}),className:'min-h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 outline-none focus:border-[#ef3340]'}),h(Button,{key:'b',primary:true,onClick:()=>this.joinSelected('master'),className:'mt-3 w-full'},'ENTRAR NA CAMPANHA SOLO')]):h('div',{key:'group',className:'mt-6 grid gap-4 md:grid-cols-2'},[
              h('div',{key:'p',className:'rounded-xl border border-white/10 p-4'},[h(TinyLabel,{key:'l'},'JOGADOR'),h('div',{key:'g',className:'mt-3 grid gap-2'},(selected.heroes||[]).map(hero=>h('button',{key:hero.id,onClick:()=>this.joinSelected('player',hero.id),className:'flex items-center gap-3 rounded-xl border border-white/10 bg-[#111720] p-2 text-left hover:border-[#ef3340]/50'},[h(Portrait,{key:'p',entity:hero,size:'sm'}),h('div',{key:'t'},[h('b',{key:'n',className:'block text-xs'},hero.n),h('small',{key:'r',className:'text-[9px] text-[#737d8b]'},`RANK ${hero.rank||'—'}`)])])))]),
              h('div',{key:'m',className:'rounded-xl border border-white/10 p-4'},[h(TinyLabel,{key:'l'},'MESTRE'),h('input',{key:'i',type:'password',placeholder:'Senha do Mestre',value:s.masterPassword,onChange:e=>this.setState({masterPassword:e.target.value}),className:'mt-3 min-h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 outline-none focus:border-[#ef3340]'}),h(Button,{key:'b',primary:true,onClick:()=>this.joinSelected('master'),className:'mt-3 w-full'},'ENTRAR COMO MESTRE')])
            ]),
            s.error?h('p',{key:'e',className:'mt-4 text-sm text-red-400'},s.error):null
          ])
        ]));
      }
      const selectedTemplate=s.templates.find(t=>t.id===s.createTemplate);
      return h('div',{className:'min-h-screen bg-[radial-gradient(circle_at_70%_20%,rgba(239,51,64,.12),transparent_35%),#080b10] p-4 text-white'},h('div',{className:'mx-auto max-w-5xl py-8 sm:py-14'},[
        h('div',{key:'head',className:'mb-8'},[h(TinyLabel,{key:'s',className:'text-[#ff6a75]'},'MARVEL MULTIVERSE RPG'),h('h1',{key:'t',className:'mt-2 text-4xl font-black tracking-tight sm:text-5xl'},'Projeto Arachne'),h('p',{key:'p',className:'mt-2 text-sm text-[#8b95a3]'},'Escolha a campanha e entre. O restante fica na mesa.')]),
        s.error?h('div',{key:'err',className:'mb-4 rounded-xl border border-red-900/50 bg-red-950/20 p-3 text-sm text-red-300'},s.error):null,
        h('div',{key:'campaigns',className:'grid gap-3 md:grid-cols-2'},s.campaigns.length?s.campaigns.map(c=>h('button',{key:c.code,onClick:()=>this.openCampaign(c.code),className:'flex items-center gap-4 rounded-2xl border border-white/10 bg-[#10151d] p-4 text-left transition hover:-translate-y-0.5 hover:border-[#ef3340]/50'},[h('span',{key:'a',className:'grid h-12 w-12 place-items-center rounded-xl border border-[#ef3340]/50 bg-[#ef3340]/10 font-black'},c.code.slice(0,2)),h('div',{key:'t',className:'min-w-0 flex-1'},[h('b',{key:'n',className:'block truncate'},c.name),h('small',{key:'c',className:'text-[10px] text-[#788291]'},`CÓDIGO ${c.code}`)]),h('span',{key:'x'},'→')])):h(Card,{className:'p-6 text-sm text-[#798392]'},'Nenhuma campanha encontrada. Crie uma a partir de um modelo abaixo.')),
        h('div',{key:'actions',className:'mt-5 flex flex-wrap gap-2'},[h(Button,{key:'join',onClick:()=>this.setState({accessMode:s.accessMode==='join'?'':'join'})},'ENTRAR COM CÓDIGO'),h(Button,{key:'create',primary:true,onClick:()=>this.setState({createOpen:!s.createOpen})},'CRIAR CAMPANHA')]),
        s.accessMode==='join'?h('div',{key:'join',className:'mt-3 flex gap-2'},[h('input',{key:'i',value:s.joinCode,onChange:e=>this.setState({joinCode:e.target.value.toUpperCase()}),placeholder:'CÓDIGO',className:'min-h-11 flex-1 rounded-xl border border-white/10 bg-[#0d1219] px-4 outline-none'},null),h(Button,{key:'b',onClick:()=>this.openCampaign(s.joinCode)},'ABRIR')]):null,
        s.createOpen?h(Card,{key:'createbox',className:'mt-5 p-4 sm:p-5'},[
          h(TinyLabel,{key:'l'},'CAMPANHAS PRONTAS'),
          h('div',{key:'templates',className:'mt-3 grid gap-2 md:grid-cols-2'},s.templates.map(t=>h('button',{key:t.id,onClick:()=>this.setState({createTemplate:t.id,createName:t.name}),className:cx('rounded-xl border p-3 text-left',s.createTemplate===t.id?'border-[#ef3340] bg-[#ef3340]/10':'border-white/10 bg-[#10161e]')},[h('small',{key:'m',className:'text-[9px] font-black text-[#7e8795]'},`${t.mode==='solo'?'SOLO':`${t.players} JOGADORES`} · RANK ${t.rank}`),h('b',{key:'n',className:'mt-1 block text-sm'},t.name),h('span',{key:'s',className:'mt-1 block text-[10px] leading-4 text-[#7b8593]'},t.subtitle||t.summary)]))),
          selectedTemplate?h('div',{key:'form',className:'mt-4 grid gap-3 sm:grid-cols-2'},[h('input',{key:'n',value:s.createName,onChange:e=>this.setState({createName:e.target.value}),placeholder:'Nome da campanha',className:'min-h-11 rounded-xl border border-white/10 bg-black/20 px-3 outline-none'}),h('input',{key:'p',type:'password',value:s.createPassword,onChange:e=>this.setState({createPassword:e.target.value}),placeholder:'Senha do Mestre',className:'min-h-11 rounded-xl border border-white/10 bg-black/20 px-3 outline-none'}),h(Button,{key:'b',primary:true,onClick:()=>this.createCampaign(),className:'sm:col-span-2'},'CRIAR MESA')]):null
        ]):null
      ]));
    }

    renderCentral(){
      const s=this.state,d=s.data,entity=this.currentEntity(),kind=this.currentKind(),isMaster=s.profile.role==='master';
      const actorItem=isMaster?this.masterActors().find(x=>x.key===s.actorKey):{entity,kind:'hero'};
      let identityPanel=null;
      if(isMaster){
        identityPanel=h(Card,{key:'actors',className:'p-4 sm:p-5'},[
          h(TinyLabel,{key:'l'},'QUEM ESTÁ AGINDO?'),
          h('div',{key:'x',className:'mt-3'},h(CharacterStrip,{items:this.masterActors(),selectedKey:s.actorKey,onSelect:key=>this.setState({actorKey:key,roll:null,power:''})})),
          entity?h('div',{key:'res',className:'mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_auto]'},[
            h(ResourceControl,{key:'h',label:'HEALTH',current:entity.currentHealth??entity.maxHealth??0,max:entity.maxHealth??0,onDelta:v=>this.adjustResource(v,'health'),onSet:v=>this.adjustResource(v,'health',true)}),
            h(ResourceControl,{key:'f',label:'FOCUS',current:entity.currentFocus??entity.maxFocus??0,max:entity.maxFocus??0,onDelta:v=>this.adjustResource(v,'focus'),onSet:v=>this.adjustResource(v,'focus',true)}),
            h(Button,{key:'s',onClick:()=>this.openSheet(entity,kind),className:'self-stretch lg:min-w-28'},'VER FICHA')
          ]):null
        ]);
      } else {
        identityPanel=h(Card,{key:'hero',className:'p-4 sm:p-5'},h('div',{className:'grid gap-4 lg:grid-cols-[1fr_1.1fr] lg:items-center'},[
          h('div',{key:'id',className:'flex items-center gap-4'},[
            h(Portrait,{key:'p',entity,size:'md'}),
            h('div',{key:'t'},[h(TinyLabel,{key:'l'},'PERSONAGEM'),h('b',{key:'n',className:'mt-1 block text-lg'},entity?.n||'Personagem'),h('span',{key:'r',className:'text-sm text-[#7e8896]'},entity?.r||'')])
          ]),
          h('div',{key:'res',className:'grid gap-3 sm:grid-cols-2'},[
            h(ResourceControl,{key:'h',label:'HEALTH',current:entity?.currentHealth??entity?.maxHealth??0,max:entity?.maxHealth??0,onDelta:v=>this.adjustResource(v,'health'),onSet:v=>this.adjustResource(v,'health',true)}),
            h(ResourceControl,{key:'f',label:'FOCUS',current:entity?.currentFocus??entity?.maxFocus??0,max:entity?.maxFocus??0,onDelta:v=>this.adjustResource(v,'focus'),onSet:v=>this.adjustResource(v,'focus',true)}),
            h(Button,{key:'s',onClick:()=>this.openSheet(entity,'hero'),className:'sm:col-span-2'},'VER FICHA')
          ])
        ]));
      }
      return h('div',{className:'space-y-4'},[
        isMaster?h('section',{key:'mh'},[
          h(TinyLabel,{key:'s'},d.campaignContent?.mode==='solo'?'CENTRAL SOLO':'CENTRAL DO MESTRE'),
          h('h1',{key:'h',className:'mt-1 text-2xl font-black sm:text-3xl'},d.campaignContent?.title||s.selectedCampaign?.name||'Campanha'),
          h('p',{key:'p',className:'mt-1 text-sm text-[#7f8997]'},'Iniciativa, rolagens, recursos e cenário. Só o necessário para apoiar a mesa.')
        ]):h('section',{key:'ph'},[
          h(TinyLabel,{key:'s'},d.campaignContent?.title||'CAMPANHA'),
          h('h1',{key:'h',className:'mt-1 text-3xl font-black'},entity?.n||'Personagem'),
          h('p',{key:'p',className:'mt-1 text-sm text-[#7f8997]'},'Rolagens e controle rápido do seu personagem.')
        ]),
        isMaster?h(InitiativePanel,{key:'init',initiative:d.initiative||[],choices:[...(d.heroes||[]),...(d.villains||[]),...Object.values(MINIONS)],onAdd:id=>this.initAdd(id),onRemove:id=>this.initRemove(id),onRoll:id=>this.initRoll(id),onRollAll:()=>this.initRollAll(),lastRoll:s.initiativeRoll,animating:s.initiativeAnimating}):null,
        identityPanel,
        h(ActionCenter,{key:'act',entity:actorItem?.entity||entity,category:s.category,onCategory:category=>this.setState({category,power:'',roll:null}),onRoll:(a,c)=>this.runAction(a,c),roll:s.roll,animating:s.rollAnimating,onEdge:i=>this.useEdge(i),onFinalize:()=>this.finalizeRoll(),tn:s.tn,onTN:tn=>this.updateTN(tn),power:s.power,onPower:power=>this.setState({power,roll:null}),edge:s.edge,trouble:s.trouble,onEdgeChange:edge=>this.setState({edge}),onTroubleChange:trouble=>this.setState({trouble})}),
        h('div',{key:'board'},h(Board,{scenario:d.scenario,heroes:d.heroes,villains:d.villains,role:s.profile.role,heroId:s.profile.heroId,selected:s.selectedPiece,onSelect:id=>this.setState({selectedPiece:id}),onMove:(x,y)=>this.movePiece(x,y),zoom:s.zoom,onZoom:zoom=>this.setState({zoom}),onReset:()=>this.resetMovement()})),
        isMaster?h(RollHistory,{key:'hist',rows:d.actionHistory||[]}):null
      ]);
    }

    renderRoster(kind){
      const items=kind==='hero'?this.state.data.heroes:this.state.data.villains;
      return h('div',null,[h(TinyLabel,{key:'s'},kind==='hero'?'DOSSIÊS':'AMEAÇAS'),h('h1',{key:'h',className:'mt-1 text-3xl font-black'},kind==='hero'?'Heróis':'Vilões'),h('div',{key:'g',className:'mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3'},items.map(entity=>h(Card,{key:entity.id,className:'overflow-hidden'},h('button',{onClick:()=>this.openSheet(entity,kind),className:'flex w-full items-center gap-4 p-4 text-left'},[h(Portrait,{key:'p',entity,size:'md'}),h('div',{key:'t',className:'min-w-0 flex-1'},[h(TinyLabel,{key:'l'},kind==='hero'?'HERÓI':entity.tier||'VILÃO'),h('b',{key:'n',className:'mt-1 block truncate text-base'},entity.n),h('span',{key:'r',className:'block truncate text-xs text-[#7c8694]'},entity.r||entity.role||''),h('small',{key:'v',className:'mt-2 block text-[10px] text-[#8c95a2]'},`HP ${entity.currentHealth??entity.maxHealth}/${entity.maxHealth} · FO ${entity.currentFocus??entity.maxFocus}/${entity.maxFocus}`)])]))))]);
    }
    renderCampaign(){ const c=this.state.data.campaignContent||{};const sessions=c.sessions||[];return h('div',null,[h(TinyLabel,{key:'s'},'CAMPANHA'),h('h1',{key:'h',className:'mt-1 text-3xl font-black'},c.title||this.state.selectedCampaign?.name||'Campanha'),h('p',{key:'p',className:'mt-2 max-w-3xl text-sm leading-6 text-[#8b95a3]'},c.summary||c.subtitle||''),h('div',{key:'m',className:'mt-4 flex flex-wrap gap-2'},[c.rank&&h('span',{key:'r',className:'rounded-lg border border-white/10 px-3 py-2 text-xs'},`RANK ${c.rank}`),c.mode&&h('span',{key:'o',className:'rounded-lg border border-white/10 px-3 py-2 text-xs'},c.mode==='solo'?'SOLO':'GRUPO'),c.campaignPdf&&h('a',{key:'pdf',href:c.campaignPdf,target:'_blank',rel:'noopener',className:'rounded-lg border border-[#ef3340]/40 bg-[#ef3340]/10 px-3 py-2 text-xs font-black'},'ABRIR PDF')]),h('div',{key:'list',className:'mt-6 space-y-2'},sessions.map((session,i)=>h(Card,{key:session.id||i,className:'p-4'},[h(TinyLabel,{key:'i'},session.id||String(i+1).padStart(2,'0')),h('b',{key:'t',className:'mt-1 block'},session.title),h('p',{key:'p',className:'mt-2 text-sm leading-6 text-[#858f9d]'},session.text)]))) ]); }
    renderRules(){return h('div',null,[h(TinyLabel,{key:'s'},'REFERÊNCIA RÁPIDA'),h('h1',{key:'h',className:'mt-1 text-3xl font-black'},'Regras'),h('div',{key:'g',className:'mt-5 grid gap-3 md:grid-cols-2'},[
      ['D616','Role dois D6 comuns e o Marvel Die. Some os dados, tratando M como 6, e acrescente o modificador da habilidade.'],['Fantastic','Se o Marvel Die mostra M, o resultado é Fantastic. O resultado total ainda é comparado ao TN.'],['Edge','Quando houver Edge, rerrole um dos dados e mantenha o melhor resultado.'],['Trouble','Quando houver Trouble, um dado é rerrolado e o pior resultado é mantido. Edge e Trouble se anulam um a um.'],['Central','O Arachne é apoio de mesa: as rolagens informam resultado e dano da ficha, sem escolher alvo nem aplicar dano automaticamente.']
    ].map((x,i)=>h(Card,{key:i,className:'p-4'},[h('b',{key:'b'},x[0]),h('p',{key:'p',className:'mt-2 text-sm leading-6 text-[#858f9d]'},x[1])])))]);}
    renderNotes(){const value=this.state.data.notesMaster||'';return h('div',null,[h(TinyLabel,{key:'s'},'MESTRE'),h('h1',{key:'h',className:'mt-1 text-3xl font-black'},'Anotações'),h('textarea',{key:'t',value,onChange:e=>this.setState(prev=>({data:{...prev.data,notesMaster:e.target.value}})),onBlur:async e=>{try{await API.saveState('notesMaster',e.target.value);this.toast('Anotações salvas.');}catch(err){this.toast(err.message);}},placeholder:'Anotações da sessão...',className:'mt-5 min-h-[55vh] w-full rounded-2xl border border-white/10 bg-[#0e131a] p-4 text-sm leading-6 outline-none focus:border-[#ef3340]/60'})]);}
    renderPage(){switch(this.state.page){case'heroes':return this.renderRoster('hero');case'villains':return this.renderRoster('villain');case'campaign':return this.renderCampaign();case'scenario':return h(Board,{scenario:this.state.data.scenario,heroes:this.state.data.heroes,villains:this.state.data.villains,role:this.state.profile.role,heroId:this.state.profile.heroId,selected:this.state.selectedPiece,onSelect:id=>this.setState({selectedPiece:id}),onMove:(x,y)=>this.movePiece(x,y),zoom:this.state.zoom,onZoom:zoom=>this.setState({zoom}),onReset:()=>this.resetMovement()});case'rules':return this.renderRules();case'notes':return this.renderNotes();default:return this.renderCentral();}}
    renderApp(){const s=this.state,campaign=s.profile?.campaign||s.selectedCampaign;return h('div',{className:'min-h-screen bg-[#080b10] text-white'},[
      h(Sidebar,{key:'side',page:s.page,onPage:p=>this.setPage(p),profile:s.profile,campaign,onLogout:()=>this.logout(),open:s.navOpen,onClose:()=>this.setState({navOpen:false})}),
      s.navOpen?h('button',{key:'back',onClick:()=>this.setState({navOpen:false}),className:'fixed inset-0 z-30 bg-black/70 lg:hidden','aria-label':'Fechar menu'}):null,
      h('main',{key:'main',className:'min-w-0 lg:pl-[250px]'},[
        h('header',{key:'head',className:'sticky top-0 z-20 flex min-h-16 items-center justify-between border-b border-white/5 bg-[#080b10]/90 px-4 backdrop-blur sm:px-6'},[h('div',{key:'l',className:'flex items-center gap-3'},[h('button',{key:'m',onClick:()=>this.setState({navOpen:true}),className:'grid h-10 w-10 place-items-center rounded-xl border border-white/10 lg:hidden'},'☰'),h('div',{key:'t'},[h(TinyLabel,{key:'s'},'ARQUIVO CONFIDENCIAL'),h('b',{key:'n',className:'block text-sm'},campaign?.name||'Projeto Arachne')])]),h('span',{key:'st',className:cx('rounded-full border px-2 py-1 text-[9px] font-black',s.status==='online'?'border-emerald-900/50 text-emerald-400':'border-white/10 text-[#7f8997]')},s.status==='online'?'ONLINE':'CONECTANDO')]),
        h('div',{key:'content',className:'mx-auto max-w-[1500px] p-4 sm:p-6'},this.renderPage())
      ]),
      s.sheet?h(SheetModal,{key:'sheet',entity:s.sheet.entity,kind:s.sheet.kind,onClose:()=>this.setState({sheet:null})}):null,
      s.toast?h('div',{key:'toast',className:'fixed bottom-5 right-5 z-[60] max-w-sm rounded-xl border border-white/10 bg-[#151b24] px-4 py-3 text-sm shadow-2xl'},s.toast):null
    ]);}
    render(){if(this.state.screen==='loading')return h('div',{className:'min-h-screen bg-[#080b10] text-white grid place-items-center'},h('div',{className:'text-center'},[h('div',{key:'a',className:'mx-auto grid h-14 w-14 place-items-center border border-[#ef3340] text-2xl font-black'},'A'),h('p',{key:'p',className:'mt-4 text-sm text-[#7d8795]'},'Carregando Arachne…')]));return this.state.screen==='login'?this.renderLogin():this.renderApp();}
  }

  ReactDOM.render(h(ArachneApp),document.getElementById('root'));
})();
