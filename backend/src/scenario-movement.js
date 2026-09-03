const TERRAIN_META={
  floor:{elevation:0,land:true},labfloor:{elevation:0,land:true},parking:{elevation:0,land:true},roof:{elevation:0,land:true},wood:{elevation:0,land:true},stone:{elevation:0,land:true},grass:{elevation:0,land:true},road:{elevation:0,land:true},
  elev1:{elevation:1,land:true,raised:true,climbable:true},elev2:{elevation:2,land:true,raised:true,climbable:true},
  ramp1:{elevation:1,land:true,ramp:true,climbable:true},ramp2:{elevation:2,land:true,ramp:true,climbable:true},
  water:{elevation:0,water:true},gap:{elevation:-1,gap:true}
};
const OBSTACLE_META={
  wall:{block:true},crate:{block:true},terminal:{block:true},barrel:{block:true},door:{block:false},pillar:{block:true},cover:{block:true},rubble:{block:false,cost:2},tree:{block:true},rock:{block:true},car:{block:true},table:{block:true},bed:{block:true},counter:{block:true},shelf:{block:true},dock:{block:false},log:{block:true},stump:{block:true},campfire:{block:false},booth:{block:true},statue:{block:true},fence:{block:true}
};
const DIRECT_MODES=new Set(['jump','flight','glide','swingline','climb']);

function clamp(value,min,max){const n=Number(value)||0;return Math.min(max,Math.max(min,n));}
function cellKey(x,y){return `${x},${y}`;}
function boardSize(scenario){return{w:clamp(scenario?.width||18,8,30),h:clamp(scenario?.height||12,7,24)};}
function inBounds(scenario,x,y){const{w,h}=boardSize(scenario);return x>=0&&y>=0&&x<w&&y<h;}
function terrainAt(scenario,x,y){const type=scenario?.terrain?.[cellKey(x,y)]||scenario?.baseTerrain||'floor';return{type,...(TERRAIN_META[type]||TERRAIN_META.floor)};}
function obstacleAt(scenario,x,y){return scenario?.obstacles?.[cellKey(x,y)]||null;}
function occupied(scenario,x,y,piece){return (scenario?.pieces||[]).some(item=>item?.id!==piece?.id&&Number(item?.x)===x&&Number(item?.y)===y);}
function blocked(scenario,x,y,piece){if(!inBounds(scenario,x,y)||occupied(scenario,x,y,piece))return true;return !!OBSTACLE_META[obstacleAt(scenario,x,y)]?.block;}
function cellCost(scenario,x,y,mode){return mode==='run'&&obstacleAt(scenario,x,y)==='rubble'?2:1;}
function canRun(scenario,fx,fy,tx,ty,piece){
  if(blocked(scenario,tx,ty,piece))return false;
  const from=terrainAt(scenario,fx,fy),to=terrainAt(scenario,tx,ty);if(from.water||from.gap||to.water||to.gap)return false;
  const diff=Math.abs((to.elevation||0)-(from.elevation||0));if(diff===0)return true;if(diff>1)return false;return !!(from.ramp||to.ramp);
}
function canSwim(scenario,fx,fy,tx,ty,piece){if(blocked(scenario,tx,ty,piece))return false;const to=terrainAt(scenario,tx,ty),from=terrainAt(scenario,fx,fy);if(!to.water)return false;return from.water||(!from.water&&!from.gap);}
function neighbors(x,y){const out=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;out.push([x+dx,y+dy]);}return out;}
function elevation(scenario,x,y){return Number(terrainAt(scenario,x,y).elevation||0);}
function directCost(scenario,piece,x,y){const horizontal=Math.max(Math.abs(x-Number(piece.x)),Math.abs(y-Number(piece.y)));return Math.max(horizontal,Math.abs(elevation(scenario,x,y)-elevation(scenario,Number(piece.x),Number(piece.y))));}
function directAllowed(scenario,piece,x,y,mode){
  if(!inBounds(scenario,x,y)||occupied(scenario,x,y,piece))return false;const terrain=terrainAt(scenario,x,y),obs=OBSTACLE_META[obstacleAt(scenario,x,y)];if(obs?.block)return false;
  if(mode==='flight'||mode==='swingline')return true;
  if(mode==='glide')return !terrain.water&&!terrain.gap;
  if(mode==='jump')return !!terrain.land&&!terrain.water&&!terrain.gap;
  if(mode==='climb'){const from=terrainAt(scenario,Number(piece.x),Number(piece.y)),horizontal=Math.max(Math.abs(x-Number(piece.x)),Math.abs(y-Number(piece.y)));return horizontal<=1&&!from.water&&!from.gap&&!!terrain.land&&!!terrain.climbable&&terrain.elevation!==from.elevation;}
  return false;
}
export function reachableScenarioCells(scenario,piece,mode,budget){
  const result=new Map(),limit=Number(budget||0);if(!piece||limit<=0)return result;
  if(DIRECT_MODES.has(mode)){
    const{w,h}=boardSize(scenario);for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(x===Number(piece.x)&&y===Number(piece.y))continue;if(!directAllowed(scenario,piece,x,y,mode))continue;const cost=directCost(scenario,piece,x,y);if(cost>0&&cost<=limit)result.set(cellKey(x,y),cost);}return result;
  }
  if(mode==='run'&&terrainAt(scenario,Number(piece.x),Number(piece.y)).water)return result;
  const q=[[Number(piece.x),Number(piece.y),0]],best=new Map([[cellKey(Number(piece.x),Number(piece.y)),0]]);
  while(q.length){const[x,y,cost]=q.shift();for(const[nx,ny]of neighbors(x,y)){if(!inBounds(scenario,nx,ny))continue;const ok=mode==='swim'?canSwim(scenario,x,y,nx,ny,piece):canRun(scenario,x,y,nx,ny,piece);if(!ok)continue;const nextCost=cost+cellCost(scenario,nx,ny,mode),key=cellKey(nx,ny);if(nextCost>limit)continue;if(best.has(key)&&best.get(key)<=nextCost)continue;best.set(key,nextCost);q.push([nx,ny,nextCost]);if(!(nx===Number(piece.x)&&ny===Number(piece.y)))result.set(key,nextCost);}}
  return result;
}
export function movementStatusForPiece(scenario,piece,requestedMode=''){
  const movement=piece?.movement&&typeof piece.movement==='object'?piece.movement:{},valid=Object.entries(movement).filter(([,value])=>Number(value)>0),locked=scenario?.turnMovement?.[piece?.id]||null;
  let mode=locked?.mode||String(requestedMode||'');if(!valid.some(([key])=>key===mode))mode=valid[0]?.[0]||'run';
  const max=Number(movement[mode]||0),spent=locked&&locked.mode===mode?Number(locked.spent||0):0;return{movement,valid,mode,max,spent,remaining:Math.max(0,max-spent),locked};
}
export function moveScenarioPiece({scenario,pieceId,toX,toY,mode='',expectedX,expectedY}){
  if(!scenario||typeof scenario!=='object'||!Array.isArray(scenario.pieces))throw Object.assign(new Error('Cenário indisponível.'),{status:409});
  const piece=scenario.pieces.find(item=>String(item?.id)===String(pieceId||''));if(!piece)throw Object.assign(new Error('Personagem não está posicionado no cenário.'),{status:404});
  const x=Number(toX),y=Number(toY);if(!Number.isInteger(x)||!Number.isInteger(y))throw Object.assign(new Error('Destino inválido.'),{status:400});
  if(expectedX!==undefined&&expectedY!==undefined&&(Number(piece.x)!==Number(expectedX)||Number(piece.y)!==Number(expectedY)))throw Object.assign(new Error('A posição do personagem mudou. Atualize o cenário e tente novamente.'),{status:409});
  if(Number(piece.x)===x&&Number(piece.y)===y)throw Object.assign(new Error('Escolha uma casa diferente para movimentar.'),{status:400});
  const status=movementStatusForPiece(scenario,piece,mode);if(!status.valid.length||status.max<=0)throw Object.assign(new Error('Este personagem não possui movimento disponível.'),{status:409});
  if(status.locked&&mode&&status.locked.mode!==mode)throw Object.assign(new Error('O modo de movimento já foi definido neste turno.'),{status:409});
  if(status.remaining<=0)throw Object.assign(new Error('O movimento deste personagem já foi utilizado neste turno.'),{status:409});
  const reachable=reachableScenarioCells(scenario,piece,status.mode,status.remaining),cost=reachable.get(cellKey(x,y));if(!Number.isFinite(cost))throw Object.assign(new Error('Casa indisponível para esse movimento.'),{status:409});
  const next={...scenario,pieces:scenario.pieces.map(item=>item?.id===piece.id?{...item,x,y}:item),turnMovement:{...(scenario.turnMovement||{})}};
  const previous=next.turnMovement[piece.id]||{mode:status.mode,spent:0};next.turnMovement[piece.id]={mode:status.mode,spent:Number(previous.spent||0)+cost};
  return{scenario:next,piece:{...piece,x,y},cost,mode:status.mode,remaining:Math.max(0,status.remaining-cost)};
}
