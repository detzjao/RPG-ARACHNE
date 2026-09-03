const MAX_RESULTS=12;
const imageMime=new Set(['image/jpeg','image/png','image/webp']);

function cleanText(value,max=160){return String(value||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().slice(0,max);}
function scoreCandidate(item){
  let score=0;const host=(()=>{try{return new URL(item.sourceUrl||item.imageUrl).hostname.toLowerCase();}catch{return'';}})();
  if(host.endsWith('marvel.com'))score+=100;
  if(host.includes('wikimedia.org')||host.includes('wikipedia.org'))score+=35;
  if(item.provider==='Wikipedia')score+=20;
  if((item.width||0)>=900)score+=20;else if((item.width||0)>=600)score+=10;
  if((item.height||0)>=600)score+=10;
  if(/fan\s*art|cosplay/i.test(`${item.title} ${item.description}`))score-=35;
  return score;
}

async function searchCommons(query,limit=MAX_RESULTS){
  const params=new URLSearchParams({action:'query',format:'json',origin:'*',generator:'search',gsrnamespace:'6',gsrlimit:String(Math.min(24,limit*2)),gsrsearch:query,prop:'imageinfo',iiprop:'url|mime|size|extmetadata',iiurlwidth:'720'});
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),8000);
  try{
    const response=await fetch(`https://commons.wikimedia.org/w/api.php?${params}`,{signal:controller.signal,headers:{'User-Agent':'RPG-Arachne/31 image-search'}});if(!response.ok)return[];
    const data=await response.json();const pages=Object.values(data?.query?.pages||{});
    return pages.map(page=>{const ii=page?.imageinfo?.[0]||{},meta=ii.extmetadata||{};return{provider:'Wikimedia Commons',title:cleanText(page.title?.replace(/^File:/,'')),description:cleanText(meta.ImageDescription?.value||meta.ObjectName?.value||''),thumbnailUrl:ii.thumburl||ii.url||'',imageUrl:ii.url||'',sourceUrl:ii.descriptionurl||'',width:Number(ii.width||0),height:Number(ii.height||0),mime:ii.mime||'',license:cleanText(meta.LicenseShortName?.value||''),author:cleanText(meta.Artist?.value||'',120)};}).filter(item=>item.imageUrl&&imageMime.has(item.mime));
  }catch{return[];}finally{clearTimeout(timer);}
}

async function searchWikipedia(query,limit=MAX_RESULTS){
  const params=new URLSearchParams({action:'query',format:'json',origin:'*',generator:'search',gsrnamespace:'0',gsrlimit:String(Math.min(20,limit*2)),gsrsearch:query,prop:'pageimages|info',piprop:'thumbnail|original|name',pithumbsize:'720',inprop:'url'});
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),8000);
  try{
    const response=await fetch(`https://en.wikipedia.org/w/api.php?${params}`,{signal:controller.signal,headers:{'User-Agent':'RPG-Arachne/31 image-search'}});if(!response.ok)return[];
    const data=await response.json();const pages=Object.values(data?.query?.pages||{});
    return pages.map(page=>{const image=page?.original||page?.thumbnail||{},imageUrl=image.source||'',mime=/\.png(?:$|\?)/i.test(imageUrl)?'image/png':/\.webp(?:$|\?)/i.test(imageUrl)?'image/webp':'image/jpeg';return{provider:'Wikipedia',title:cleanText(page.title||'Imagem'),description:'Imagem da página enciclopédica do personagem.',thumbnailUrl:page?.thumbnail?.source||imageUrl,imageUrl,sourceUrl:page?.fullurl||'',width:Number(image.width||page?.thumbnail?.width||0),height:Number(image.height||page?.thumbnail?.height||0),mime,license:'Ver licença na página de origem',author:''};}).filter(item=>item.imageUrl);
  }catch{return[];}finally{clearTimeout(timer);}
}

async function searchOpenverse(query,limit=MAX_RESULTS){
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),8000);
  try{
    const response=await fetch(`https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&page_size=${Math.min(20,limit)}`,{signal:controller.signal,headers:{'User-Agent':'RPG-Arachne/31 image-search'}});if(!response.ok)return[];
    const data=await response.json();return (data?.results||[]).map(item=>({provider:'Openverse',title:cleanText(item.title||'Imagem'),description:'',thumbnailUrl:item.thumbnail||item.url||'',imageUrl:item.url||'',sourceUrl:item.foreign_landing_url||item.detail_url||'',width:Number(item.width||0),height:Number(item.height||0),mime:String(item.mime_type||''),license:cleanText(item.license||''),author:cleanText(item.creator||'',120)})).filter(item=>item.imageUrl&&(!item.mime||imageMime.has(item.mime)));
  }catch{return[];}finally{clearTimeout(timer);}
}

export async function searchCharacterImages({name,realName='',query='',limit=MAX_RESULTS}){
  const terms=cleanText(query||`${name} ${realName} Marvel comics`,120);if(terms.length<2)return[];
  const [commons,wikipedia,openverse]=await Promise.all([searchCommons(terms,limit),searchWikipedia(terms,limit),searchOpenverse(terms,limit)]);
  const seen=new Set(),merged=[];for(const item of [...commons,...wikipedia,...openverse]){const key=item.imageUrl;if(!key||seen.has(key))continue;seen.add(key);merged.push({...item,score:scoreCandidate(item)});}
  return merged.sort((a,b)=>b.score-a.score||((b.width*b.height)-(a.width*a.height))).slice(0,limit);
}
