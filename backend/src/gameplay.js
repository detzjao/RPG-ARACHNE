import crypto from 'node:crypto';

export const ABILITIES=['Melee','Agility','Resilience','Vigilance','Ego','Logic'];

// Multiplicadores que já existiam no antigo painel separado de dano.
// O bônus fixo daquele painel coincidia com o modificador da habilidade;
// por isso o servidor usa diretamente abilityMod na mesma rolagem D616.
const DAMAGE_MULTIPLIERS={
  spider:{Melee:5,Agility:4,Ego:4,Logic:5},
  wolverine:{Melee:5,Agility:5,Ego:4,Logic:4},
  cap:{Melee:5,Agility:5,Ego:4,Logic:4},
  octopus:{Melee:6,Agility:4,Ego:4,Logic:6},
  sabretooth:{Melee:5,Agility:4,Ego:4,Logic:4},
  crossbones:{Melee:3,Agility:5,Ego:3,Logic:3},
  goblin:{Melee:6,Agility:5,Ego:4,Logic:4},
  'hydra-agent':{Melee:1,Agility:1,Ego:1,Logic:1},
  'aim-agent':{Melee:1,Agility:2,Ego:1,Logic:2},
  sinister:{Melee:7,Agility:5,Ego:5,Logic:7},
  'minion-melee':{Melee:2,Agility:1,Ego:1,Logic:1},
  'minion-ranged':{Melee:1,Agility:2,Ego:1,Logic:1},
  'minion-support':{Melee:1,Agility:1,Ego:1,Logic:2}
};

export function dieScore(value,index){return index===1&&Number(value)===1?6:Number(value||0);}
export function qualityValue(value,index){const score=dieScore(value,index);return score*10+(index===1&&Number(value)===1?1:0);}
export function isFantastic(values){return Number(values?.[1])===1;}
export function isUltimate(values){return Number(values?.[0])===6&&Number(values?.[1])===1&&Number(values?.[2])===6;}
export function formatDie(value,index){return index===1&&Number(value)===1?'M':String(value);}
export function rollMath(roll){const dice=(roll.values||[]).reduce((sum,value,index)=>sum+dieScore(value,index),0);const abilityMod=Number(roll.snapshot?.abilityMod||0),extra=Number(roll.snapshot?.extra||0);return{dice,abilityMod,extra,total:dice+abilityMod+extra};}
export function evaluateRoll(roll){const total=rollMath(roll).total,tn=Number(roll.snapshot?.tn||0),fantastic=isFantastic(roll.values);if(fantastic)return{key:total>=tn?'fantastic-success':'fantastic-failure',label:total>=tn?'FANTASTIC SUCCESS':'FANTASTIC FAILURE',success:total>=tn,fantastic};return{key:total>=tn?'success':'failure',label:total>=tn?'SUCESSO':'FALHA',success:total>=tn,fantastic:false};}

export function damageMultiplierFor(actor,ability){
  const id=String(actor?.id||'');
  const value=DAMAGE_MULTIPLIERS[id]?.[ability];
  return Number.isFinite(Number(value))?Number(value):null;
}

export function damageFromRoll(roll){
  if(roll?.snapshot?.rollType!=='attack')return null;
  const outcome=evaluateRoll(roll),rawMarvelDie=Number(roll.values?.[1]||0),marvelDie=dieScore(rawMarvelDie,1);
  const rawMultiplier=roll.snapshot?.damageMultiplier;
  const configured=rawMultiplier!==null&&rawMultiplier!==''&&rawMultiplier!==undefined&&Number.isFinite(Number(rawMultiplier));
  const multiplier=configured?Math.max(0,Math.min(30,Number(rawMultiplier))):null;
  const reduction=Math.max(0,Math.min(20,Number(roll.snapshot?.damageReduction||0)));
  const effectiveMultiplier=multiplier===null?null:Math.max(0,multiplier-reduction);
  const abilityMod=Number(roll.snapshot?.abilityMod||0);
  const fantasticMultiplier=outcome.success&&outcome.fantastic?2:1;
  const baseDamage=effectiveMultiplier===null?null:Math.max(0,marvelDie*effectiveMultiplier+abilityMod);
  const total=outcome.success&&baseDamage!==null?baseDamage*fantasticMultiplier:null;
  return{configured,applied:outcome.success&&total!==null,success:outcome.success,rawMarvelDie,marvelDie,multiplier,reduction,effectiveMultiplier,abilityMod,fantasticMultiplier,baseDamage,total};
}

function d6(){return crypto.randomInt(1,7);}
export function startD616({actor,ability,challenge}){
  const edge=Math.max(0,Math.min(6,Number(challenge?.edge||0))),trouble=Math.max(0,Math.min(6,Number(challenge?.trouble||0))),cancelled=Math.min(edge,trouble),netEdge=edge-cancelled,netTrouble=trouble-cancelled;
  const initialValues=[d6(),d6(),d6()];
  const rollType=challenge?.rollType==='attack'?'attack':'test';
  const hasRequestedMultiplier=challenge?.damageMultiplier!==null&&challenge?.damageMultiplier!==''&&challenge?.damageMultiplier!==undefined;
  const requestedMultiplier=hasRequestedMultiplier?Number(challenge.damageMultiplier):NaN,profileMultiplier=damageMultiplierFor(actor,ability);
  const damageMultiplier=rollType==='attack'?(Number.isFinite(requestedMultiplier)?Math.max(0,Math.min(30,requestedMultiplier)):profileMultiplier):null;
  const roll={id:crypto.randomUUID(),values:[...initialValues],initialValues:[...initialValues],troubleSteps:[],snapshot:{action:String(challenge?.action||'Ação'),tn:Math.max(0,Math.min(99,Number(challenge?.tn||14))),edge,trouble,source:challenge?.source==='threat'?'threat':'hero',actorId:actor.id,actorName:actor.n||'Personagem',ability,abilityMod:Number(actor?.abilities?.[ability]||0),extra:Number(challenge?.extra||0),rollType,damageMultiplier,damageReduction:rollType==='attack'?Math.max(0,Math.min(20,Number(challenge?.damageReduction||0))):0,targetId:rollType==='attack'?String(challenge?.targetId||'').slice(0,80):'',targetKind:rollType==='attack'&&(challenge?.targetKind==='villain'?'villain':'hero'),targetName:rollType==='attack'?String(challenge?.targetName||'').slice(0,100):'',damageResource:rollType==='attack'&&challenge?.damageResource==='focus'?'focus':'health'},edgeRemaining:netEdge,troubleRemaining:netTrouble,logs:[],finalized:false,createdAt:Date.now()};
  if(isUltimate(roll.values)&&roll.troubleRemaining>0){roll.logs.push({kind:'fantastic',title:'Ultimate Fantastic',text:`6 · M · 6 ignora ${roll.troubleRemaining} Trouble.`});roll.troubleRemaining=0;}
  while(roll.troubleRemaining>0){let best=0;for(let i=1;i<3;i++)if(qualityValue(roll.values[i],i)>qualityValue(roll.values[best],best))best=i;const before=roll.values[best],rerolled=d6(),kept=qualityValue(rerolled,best)<qualityValue(before,best)?rerolled:before;roll.values[best]=kept;roll.troubleRemaining-=1;const step={index:best,before,rerolled,kept};roll.troubleSteps.push(step);roll.logs.push({kind:'trouble',title:`Trouble · dado ${best+1}`,text:`${formatDie(before,best)} → ${formatDie(rerolled,best)}; manteve o pior: ${formatDie(kept,best)}.`,...step});}
  if(isUltimate(roll.values))roll.edgeRemaining=0;
  return roll;
}
export function applyEdge(roll,index){index=Number(index);if(!roll||roll.finalized||roll.edgeRemaining<=0||![0,1,2].includes(index)||isUltimate(roll.values))throw new Error('Edge não disponível para essa rolagem.');const before=roll.values[index],rerolled=d6(),kept=qualityValue(rerolled,index)>qualityValue(before,index)?rerolled:before;roll.values[index]=kept;roll.edgeRemaining-=1;const step={index,before,rerolled,kept};roll.logs.push({kind:'edge',title:`Edge · dado ${index+1}`,text:`${formatDie(before,index)} → ${formatDie(rerolled,index)}; manteve o melhor: ${formatDie(kept,index)}.`,...step});if(isUltimate(roll.values))roll.edgeRemaining=0;return roll;}
export function publicRoll(roll){const math=rollMath(roll),outcome=evaluateRoll(roll),damage=damageFromRoll(roll);return{id:roll.id,values:[...roll.values],initialValues:[...(roll.initialValues||roll.values)],troubleSteps:(roll.troubleSteps||[]).map(step=>({...step})),snapshot:{...roll.snapshot},edgeRemaining:roll.edgeRemaining,logs:[...roll.logs],finalized:roll.finalized,math,outcome,damage,historyEntry:roll.historyEntry?{...roll.historyEntry}:null};}
export function historyFromRoll(roll){const math=rollMath(roll),outcome=evaluateRoll(roll),damage=damageFromRoll(roll),diceText=roll.values.map((v,i)=>formatDie(v,i)).join(' · ');const damageText=damage?(damage.applied?` | Marvel ${formatDie(damage.rawMarvelDie,1)} (${damage.marvelDie}) | Dano ${damage.total}`:` | Marvel ${formatDie(damage.rawMarvelDie,1)} (${damage.marvelDie}) | Dano —`):'';const targetText=roll.snapshot?.targetName?` | Alvo ${roll.snapshot.targetName}`:'';return{type:'D616',rollId:roll.id,label:`${roll.snapshot.actorName} · ${roll.snapshot.ability}`,actorId:roll.snapshot.actorId,actorName:roll.snapshot.actorName,ability:roll.snapshot.ability,abilityMod:Number(roll.snapshot.abilityMod||0),extra:Number(roll.snapshot.extra||0),action:roll.snapshot.action,rollType:roll.snapshot.rollType||'test',tn:roll.snapshot.tn,targetId:roll.snapshot.targetId||'',targetKind:roll.snapshot.targetKind||'',targetName:roll.snapshot.targetName||'',damageResource:roll.snapshot.damageResource||'health',damageMultiplier:roll.snapshot.damageMultiplier,damageReduction:roll.snapshot.damageReduction,detail:`${diceText} | ${roll.snapshot.abilityMod>=0?'+':''}${roll.snapshot.abilityMod} hab. | ${roll.snapshot.extra>=0?'+':''}${roll.snapshot.extra} extra | TN ${roll.snapshot.tn}${targetText}${damageText}`,total:math.total,outcome:outcome.label,outcomeKey:outcome.key,marvelDie:Number(roll.values?.[1]||0),damage,damageApplied:false,damageAppliedAt:null,at:Date.now(),visibility:roll.snapshot.source==='threat'?'masked':'public',dice:{kind:'d616',values:[...roll.values]}};}
