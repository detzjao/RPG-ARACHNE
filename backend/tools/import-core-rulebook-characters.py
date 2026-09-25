#!/usr/bin/env python3
"""Import the 128 Core Rulebook character profiles into RPG Arachne.

Usage:
  python backend/tools/import-core-rulebook-characters.py /path/to/Marvel_Multiverse_RPG_Todos_Personagens.pdf

The importer does not ship or expose the source book. It creates one-page profile PDFs,
portrait crops taken from each original profile page, and a generated JS module consumed
by the existing Arachne character library.
"""
from __future__ import annotations
import argparse, csv, json, re, unicodedata, shutil
from pathlib import Path
import fitz
import cv2
import numpy as np
from PIL import Image

MISSING_TITLES = {
    3:'ABOMINATION (EMIL BLONSKY)', 12:'BEAST (HANK MCCOY)', 15:'BLACK WIDOW (NATASHA ROMANOFF)',
    18:'BRAWN (AMADEUS CHO)', 20:'CAPTAIN AMERICA (STEVE ROGERS)', 21:'CAPTAIN MARVEL (CAROL DANVERS)',
    30:'DOCTOR OCTOPUS (OTTO OCTAVIUS)', 43:'GIANT-MAN (RAZ MALHOTRA)', 45:'GREEN GOBLIN (NORMAN OSBORN)',
    58:'IRON MAN (TONY STARK)', 60:'JUGGERNAUT', 80:'MS. MARVEL (KAMALA KHAN)', 81:'MYSTERIO',
    89:'PROFESSOR X', 91:'QUICKSILVER', 92:'RED SKULL', 97:'SABRETOOTH',
    105:'SPIDER-MAN (MILES MORALES)', 107:'SPIDER-MAN 2099', 108:'SQUIRREL GIRL', 116:'THOR (JANE FOSTER)',
    117:'THOR', 125:'WASP', 126:'WHITE TIGER', 128:'WOLVERINE (LAURA KINNEY)',
    129:'WOLVERINE'
}
TITLE_FIXES = {
    'DEAD POOL':'DEADPOOL', 'GAM ORA':'GAMORA', 'I KARIS':'IKARIS', 'MALE KITH':'MALEKITH',
    'MAXIM US':'MAXIMUS', 'MORBI US':'MORBIUS', 'GHOST RIDER (ROBBIE REVES)':'GHOST RIDER (ROBBIE REYES)'
}
EXISTING_ID_MAP = {
    'ABOMINATION (EMIL BLONSKY)':'abomination','A.I.M. AGENT':'aim-agent','BARON ZEMO (HELMUT ZEMO)':'zemo',
    "BLACK PANTHER (T'CHALLA)":'black-panther','BULLSEYE':'bullseye','CAPTAIN AMERICA (STEVE ROGERS)':'cap',
    'CAPTAIN MARVEL (CAROL DANVERS)':'captain-marvel','CROSSBONES':'crossbones','CYCLOPS':'cyclops','DAREDEVIL':'daredevil',
    'DEADPOOL':'deadpool','DOCTOR DOOM':'doom','DOCTOR OCTOPUS (OTTO OCTAVIUS)':'octopus','DOCTOR STRANGE':'doctor-strange',
    'ELEKTRA':'elektra','ENCHANTRESS':'enchantress','GHOST RIDER (ROBBIE REYES)':'ghost-rider-robbie-reyes','GREEN GOBLIN (NORMAN OSBORN)':'goblin',
    'HAND NINJA':'hand-ninja','HAWKEYE (CLINT BARTON)':'hawkeye','HULK (BRUCE BANNER)':'hulk',
    'HUMAN TORCH (JOHNNY STORM)':'human-torch','HYDRA AGENT':'hydra-agent','ICEMAN':'iceman','INVISIBLE WOMAN':'invisible-woman',
    'IRON MAN (TONY STARK)':'iron-man','JUGGERNAUT':'juggernaut','KINGPIN (WILSON FISK)':'kingpin','LOKI':'loki','LUKE CAGE':'luke-cage',
    'MAGNETO':'magneto','MISTER FANTASTIC':'mr-fantastic','MYSTIQUE':'mystique','SABRETOOTH':'sabretooth',
    'SCARLET WITCH':'scarlet-witch','SHANG-CHI':'shang-chi','SHE-HULK':'she-hulk','S.H.I.E.L.D. AGENT':'shield-agent',
    'SPIDER-MAN (PETER PARKER)':'spider','STORM':'storm','THING':'thing','THOR':'thor','THOR (JANE FOSTER)':'thor-jane-foster','VENOM (EDDIE BROCK)':'venom',
    'VISION':'vision','WAR MACHINE':'war-machine','WOLVERINE':'wolverine','WOLVERINE (LAURA KINNEY)':'wolverine-laura-kinney'
}
GENERIC_MINIONS = {
    'A.I.M. AGENT','AVERAGE CIVILIAN','DORA MILAJE WARRIOR','HAND NINJA','HYDRA AGENT','S.H.I.E.L.D. AGENT','SKRULL','VAMPIRE'
}
ANTI_HEROES = {'DEADPOOL','ELEKTRA','MORBIUS','VENOM (EDDIE BROCK)','NAMOR','SUB-MARINER (NAMOR)'}
ABILITY_ROWS = [('Melee',319),('Agility',357),('Resilience',395),('Vigilance',433),('Ego',471),('Logic',509)]


def slugify(s:str)->str:
    s=unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower()
    s=re.sub(r"\([^)]*\)","",s)
    s=s.replace('&',' and ')
    s=re.sub(r'[^a-z0-9]+','-',s).strip('-')
    return s or 'character'


def detect_title(page, page_no:int)->str:
    if page_no in MISSING_TITLES: return MISSING_TITLES[page_no]
    words=page.get_text('words')
    ws=[w for w in words if 20<=w[1]<=75 and w[0]<250]
    clusters=[]
    for w in sorted(ws,key=lambda z:(z[1],z[0])):
        for c in clusters:
            if abs(c[0][1]-w[1])<4:
                c.append(w); break
        else: clusters.append([w])
    for c in clusters:
        txt=' '.join(w[4] for w in sorted(c,key=lambda z:z[0])).strip()
        if txt and any(ch.isalpha() for ch in txt) and txt.upper()==txt and len(txt)>=3 and 'V////' not in txt:
            return TITLE_FIXES.get(txt,txt)
    raise RuntimeError(f'Unable to identify title on PDF page {page_no}')


def page_text(page)->str:
    return page.get_text('text', sort=True).replace('\u00ad','')


def line_value(text:str,label:str,next_labels:list[str])->str:
    # Works on OCR text for top biography metadata; handles one continuation line conservatively.
    lines=[re.sub(r'\s+',' ',x).strip() for x in text.splitlines() if x.strip()]
    for i,line in enumerate(lines):
        pos=line.find(label)
        if pos>=0:
            value=line[pos+len(label):].strip()
            # stop if another label appears in same line
            for stop in next_labels:
                j=value.find(stop)
                if j>=0: value=value[:j].strip()
            if value: return value
            if i+1<len(lines): return lines[i+1]
    return ''


def biography_value(page,label,stop_labels=()):
    """Read a metadata field from the BIOGRAPHY block using visual line order."""
    words=[w for w in page.get_text('words') if w[1] < 250 and w[0] > 340]
    lines=[]
    for w in sorted(words,key=lambda z:(z[1],z[0])):
        for line in lines:
            if abs(line['y']-w[1])<2.2:
                line['words'].append(w); line['y']=sum(x[1] for x in line['words'])/len(line['words']); break
        else:
            lines.append({'y':w[1],'words':[w]})
    lines.sort(key=lambda x:x['y'])
    all_stops=list(stop_labels)+['Real Name:','Height:','Weight:','Gender:','Eyes:','Hair:','Size:','Distinguishing Features:','Occupation:','Origin:','Teams:','Base:','HISTORY']
    for i,line in enumerate(lines):
        txt=' '.join(w[4] for w in sorted(line['words'],key=lambda z:z[0]))
        if label not in txt: continue
        value=txt.split(label,1)[1].strip()
        for stop in all_stops:
            if stop==label: continue
            j=value.find(stop)
            if j>=0:value=value[:j].strip()
        # Continue wrapped metadata lines, but stop before a new known field/history.
        j=i+1
        while j<len(lines) and lines[j]['y']-lines[j-1]['y']<14:
            nxt=' '.join(w[4] for w in sorted(lines[j]['words'],key=lambda z:z[0])).strip()
            if any(x in nxt for x in all_stops): break
            # Biography/history prose starts farther right but may follow immediately; only accept short wrapped fragments.
            if len(nxt)>80: break
            if nxt and lines[j]['y']<165:
                value=(value+' '+nxt).strip()
            j+=1
        return re.sub(r'\s+',' ',value).strip()
    return ''


def nearest_numeric(words,label,pattern=r'-?\d+',x_pad=(-20,55),y_pad=(0,55)):
    matches=[]
    for w in words:
        if w[4]==label:
            x0,y0=w[0],w[1]
            for q in words:
                if x0+x_pad[0] <= q[0] <= x0+x_pad[1] and y0+y_pad[0] <= q[1] <= y0+y_pad[1] and re.fullmatch(pattern,q[4]):
                    matches.append((abs(q[0]-x0)+abs(q[1]-y0),q[4]))
            if matches: return sorted(matches)[0][1]
    return None


def resource_value(words,label):
    labels=[w for w in words if w[4]==label]
    if not labels:return None
    lab=labels[0]
    c=[]
    for q in words:
        if lab[0]-15 <= q[0] <= lab[0]+45 and lab[1] <= q[1] <= lab[1]+55 and re.fullmatch(r'\d+',q[4]):
            c.append((q[1],q[4]))
    return int(sorted(c)[0][1]) if c else None


def initiative_value(words):
    labs=[w for w in words if w[4]=='MODIFIER']
    if not labs:return '+0'
    lab=labs[0]
    c=[]
    for q in words:
        if lab[0]-10<=q[0]<=lab[0]+55 and lab[1]<=q[1]<=lab[1]+45 and re.fullmatch(r'[+-]\d+E?',q[4]):
            c.append((q[1],q[4]))
    return sorted(c)[0][1] if c else '+0'


def reduction_values(words):
    labs=sorted([w for w in words if w[4]=='REDUCTION'],key=lambda w:w[1])[:2]
    out=[]
    for lab in labs:
        c=[]
        for q in words:
            if lab[0]-25<=q[0]<=lab[0]+55 and lab[1]-12<=q[1]<=lab[1]+45 and re.fullmatch(r'-\d+',q[4]):
                c.append((abs(q[1]-lab[1]),q[4]))
        out.append(sorted(c)[0][1] if c else '—')
    while len(out)<2:out.append('—')
    return out[0],out[1]


def parse_abilities(words,page_no:int):
    score_x=75 if page_no%2==0 else 57
    defense_x=121 if page_no%2==0 else 103
    out={}; defenses={}
    for name,y in ABILITY_ROWS:
        def pick(x,allow_signed=False):
            c=[]
            pat=r'-?\d+' if allow_signed else r'\d+'
            for w in words:
                if x-13<=w[0]<=x+16 and y-7<=w[1]<=y+26 and re.fullmatch(pat,w[4]):
                    c.append((abs(w[0]-x)+abs(w[1]-y),int(w[4])))
            return sorted(c)[0][1] if c else None
        s=pick(score_x,True); d=pick(defense_x,False)
        if s is None and d is not None:s=d-10
        if d is None and s is not None:d=10+s
        out[name]=int(s or 0); defenses[name]=int(d if d is not None else 10+out[name])
    return out,defenses


def bullet_items(page,x0,x1,y0,y1):
    """Read bullet lists from one or more visual columns without merging adjacent columns."""
    words=[w for w in page.get_text('words') if x0<=w[0]<x1 and y0<=w[1]<y1]
    bullets=sorted([w for w in words if w[4] in {'•','+','-'}],key=lambda w:(w[0],w[1]))
    if not bullets:return []
    # Cluster bullet x positions into visual columns.
    cols=[]
    for b in bullets:
        for col in cols:
            if abs(col['x']-b[0])<28:
                col['items'].append(b); col['x']=sum(x[0] for x in col['items'])/len(col['items']); break
        else:
            cols.append({'x':b[0],'items':[b]})
    cols.sort(key=lambda c:c['x'])
    items=[]
    for ci,col in enumerate(cols):
        lo=x0 if ci==0 else (cols[ci-1]['x']+col['x'])/2
        hi=x1 if ci==len(cols)-1 else (col['x']+cols[ci+1]['x'])/2
        bs=sorted(col['items'],key=lambda w:w[1])
        for j,b in enumerate(bs):
            end=bs[j+1][1]-0.5 if j+1<len(bs) else y1
            chunk=[w for w in words if lo<=w[0]<hi and w[0]>=b[0]+3 and b[1]-1<=w[1]<end and w[4] not in {'•','+','-'}]
            chunk=sorted(chunk,key=lambda w:(round(w[1],1),w[0]))
            txt=' '.join(w[4] for w in chunk)
            txt=re.sub(r'\s+',' ',txt).strip()
            txt=re.sub(r'^(BASIC|MARTIAL ARTS|TACTICS|RANGED WEAPONS|MELEE WEAPONS(?: \([^)]*\))?|SUPER-STRENGTH|TELEPATHY|TELEKINESIS|MAGIC(?: \([^)]*\))?|ELEMENTAL CONTROL(?: \([^)]*\))?|RESIZE|SPIDER-POWERS|POWER CONTROL|SUPER-SPEED|PLASTICITY|PHASING|OMNIVERSAL TRAVEL|SHIELD BEARER)\s+','',txt,flags=re.I)
            txt=txt.rstrip(' /').strip()
            txt=re.sub(r'\b(Accuracy|Brilliance|Discipline|Flight|Mighty|Sturdy|Uncanny|Grow|Shrink|Jump|Speed Run|Heightened Senses|Elemental Protection)\s*Z\b',r'\1 2',txt,flags=re.I)
            if txt and len(txt)<700: items.append(txt)
    seen=set(); out=[]
    for item in items:
        key=item.lower()
        if key not in seen:
            seen.add(key); out.append(item)
    return out

def section_y(page,label='POWERS'):
    ys=[w[1] for w in page.get_text('words') if w[4].startswith(label)]
    return min(ys) if ys else 430


def rank_mask(doc,page_index,page_no):
    p=doc[page_index]
    x0=230 if page_no%2==0 else 212
    pix=p.get_pixmap(matrix=fitz.Matrix(3,3),clip=fitz.Rect(x0,40,x0+70,115),alpha=False)
    arr=np.frombuffer(pix.samples,dtype=np.uint8).reshape(pix.height,pix.width,pix.n)[:,:,:3]
    gray=cv2.cvtColor(arr,cv2.COLOR_RGB2GRAY)
    # lower center contains the large rank digit. Keep dark components only.
    roi=gray[75:210,65:190]
    bw=(roi<90).astype(np.uint8)*255
    contours,_=cv2.findContours(bw,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
    contours=[c for c in contours if cv2.contourArea(c)>80]
    if not contours: raise RuntimeError(f'Rank digit not found on page {page_no}')
    c=max(contours,key=cv2.contourArea)
    return c


def build_rank_refs(doc):
    # Known visually verified profiles: A.I.M Agent 1, Daredevil 2, Zemo 3, Deadpool 4, Abomination 5, Blue Marvel 6.
    refs={1:7,2:26,3:11,4:27,5:3,6:17}
    return {r:rank_mask(doc,p-1,p) for r,p in refs.items()}


def classify_rank(doc,page_index,page_no,refs):
    c=rank_mask(doc,page_index,page_no)
    scored=[(cv2.matchShapes(c,ref,cv2.CONTOURS_MATCH_I1,0.0),r) for r,ref in refs.items()]
    return min(scored)[1]



def score_digit_contours(doc,page_no):
    """Return the six large ability-score glyph contours from a profile page."""
    page=doc[page_no-1]; shift=18 if page_no%2==0 else 0
    pix=page.get_pixmap(matrix=fitz.Matrix(4,4),clip=fitz.Rect(45+shift,300,100+shift,550),alpha=False)
    arr=np.frombuffer(pix.samples,dtype=np.uint8).reshape(pix.height,pix.width,pix.n)[:,:,:3]
    gray=cv2.cvtColor(arr,cv2.COLOR_RGB2GRAY); bw=(gray<80).astype(np.uint8)*255
    contours,_=cv2.findContours(bw,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
    found=[]
    for c in contours:
        x,y,w,h=cv2.boundingRect(c); area=cv2.contourArea(c)
        if 22<h<85 and 5<w<70 and area>80: found.append((x,y,w,h,area,c))
    return [e[-1] for e in sorted(found,key=lambda e:e[1])[:6]]


def build_damage_digit_refs(doc):
    # Visually verified ability-score glyphs for digits 0-9. Same typeface is used in DAMAGE multipliers.
    refs={0:(9,0),1:(26,3),2:(26,0),3:(26,1),4:(27,1),5:(27,0),6:(42,1),7:(14,0),8:(3,0),9:(17,0)}
    out={}
    for digit,(page_no,row) in refs.items():
        contours=score_digit_contours(doc,page_no)
        if len(contours)!=6: raise RuntimeError(f'Could not build damage digit reference {digit} from page {page_no}')
        out[digit]=contours[row]
    return out


def classify_damage_digit(contour,refs):
    score,digit=min((cv2.matchShapes(contour,ref,cv2.CONTOURS_MATCH_I1,0.0),digit) for digit,ref in refs.items())
    return score,digit


def damage_panel_values(doc,page_no,refs,fallback):
    """Read the four printed DAMAGE multipliers from the original raster sheet."""
    page=doc[page_no-1]; shift=18 if page_no%2==0 else 0
    pix=page.get_pixmap(matrix=fitz.Matrix(4,4),clip=fitz.Rect(75+shift,545,150+shift,735),alpha=False)
    arr=np.frombuffer(pix.samples,dtype=np.uint8).reshape(pix.height,pix.width,pix.n)[:,:,:3]
    gray=cv2.cvtColor(arr,cv2.COLOR_RGB2GRAY); bw=(gray<80).astype(np.uint8)*255
    contours,_=cv2.findContours(bw,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
    candidates=[]
    for c in contours:
        x,y,w,h=cv2.boundingRect(c); area=cv2.contourArea(c)
        if 22<h<85 and 5<w<65 and area>80 and x>33:
            score,digit=classify_damage_digit(c,refs)
            if score<0.50: candidates.append((x,y,w,h,digit,score))
    groups=[]
    for item in sorted(candidates,key=lambda e:(e[1],e[0])):
        for g in groups:
            if abs(g[0][1]-item[1])<34:
                g.append(item); break
        else: groups.append([item])
    groups=sorted(groups,key=lambda g:min(x[1] for x in g))[:4]
    keys=['Melee','Agility','Ego','Logic']; values={}; variants={}
    for i,key in enumerate(keys):
        if i>=len(groups):
            values[key]=fallback[key]; variants[key]=str(fallback[key]); continue
        g=sorted(groups[i],key=lambda e:e[0])
        digits=[e[4] for e in g]
        if len(digits)==1:
            value=digits[0]; variant=str(value)
        elif len(digits)>=2:
            first,last=g[0],g[-1]; gap=last[0]-first[0]
            if gap>50:
                variant=f'{digits[0]}/{digits[-1]}'; value=digits[0]
            else:
                variant=''.join(str(x) for x in digits[:2]); value=int(variant)
        values[key]=value; variants[key]=variant
    return values,variants

def power_level(text,key):
    # OCR occasionally reads 2 as Z in these small labels.
    m=re.search(rf'\b{re.escape(key)}\s*([1-4Z])\b',text,re.I)
    if not m:return 0
    v=m.group(1).upper(); return 2 if v=='Z' else int(v)


def category(title,text):
    if title in GENERIC_MINIONS:return 'minion',('hero' if re.search(r'\bHeroic\b',text,re.I) else 'villain')
    if re.search(r'\bVillainous\b',text,re.I):return 'villain','villain'
    if re.search(r'\bHeroic\b',text,re.I):return 'hero','hero'
    if title in ANTI_HEROES:return 'antihero','hero'
    return 'neutral','hero'


def parse_profile(doc,page_index,rank_refs,damage_digit_refs):
    page=doc[page_index]; page_no=page_index+1; title=detect_title(page,page_no); text=page_text(page); words=page.get_text('words')
    rank=classify_rank(doc,page_index,page_no,rank_refs)
    abilities,defenses=parse_abilities(words,page_no)
    health=resource_value(words,'HEALTH') or max(30,abilities['Resilience']*30)
    focus=resource_value(words,'FOCUS') or max(30,abilities['Vigilance']*30)
    health_dr,focus_dr=reduction_values(words)
    powers_y=section_y(page)
    shift=18 if page_no%2==0 else 0
    traits=bullet_items(page,200+shift,278+shift,330,powers_y)
    tags=bullet_items(page,278+shift,358+shift,330,powers_y)
    powers=bullet_items(page,195+shift,570+shift,powers_y+10,760)
    ptype,libkind=category(title,text)
    real=biography_value(page,'Real Name:',['Height:']) or line_value(text,'Real Name:',['Height:'])
    occ=biography_value(page,'Occupation:',['Origin:','Teams:','Gender:','Size:']) or line_value(text,'Occupation:',['Origin:','Teams:','Gender:','Size:'])
    origin=biography_value(page,'Origin:',['Teams:','Base:']) or line_value(text,'Origin:',['Teams:','Base:'])
    teams=biography_value(page,'Teams:',['Base:','HISTORY']) or line_value(text,'Teams:',['Base:','HISTORY'])
    teams=re.sub(r'\s+\d+\s+-\d+\s*$','',teams).strip()
    base=biography_value(page,'Base:',['HISTORY']) or line_value(text,'Base:',['HISTORY'])
    # Core damage panel formula: rank plus the matching basic power bonus.
    damage_fallback={
      'Melee':rank+power_level(text,'Mighty'),
      'Agility':rank+power_level(text,'Accuracy'),
      'Ego':rank+power_level(text,'Discipline'),
      'Logic':rank+power_level(text,'Brilliance')
    }
    damage,damage_variants=damage_panel_values(doc,page_no,damage_digit_refs,damage_fallback)
    sid=EXISTING_ID_MAP.get(title,slugify(title))
    alignment='antihero' if ptype=='antihero' else ('wildcard' if ptype=='neutral' else '')
    printed=page_no+131
    asset_type='minions' if ptype=='minion' else ('villains' if libkind=='villain' else 'heroes')
    relbase=f'assets/characters/{asset_type}/{sid}'
    return {
      'id':sid,'n':title.title().replace('A.i.m.','A.I.M.').replace('S.h.i.e.l.d.','S.H.I.E.L.D.').replace('M.o.d.o.k.','M.O.D.O.K.'),
      'sourceName':title,'r':real,'rank':rank,'type':ptype,'libraryKind':libkind,'alignment':alignment or None,
      'tier':('LACAIO' if ptype=='minion' else 'ANTI-HERÓI' if ptype=='antihero' else 'WILDCARD' if ptype=='neutral' else 'HERÓI' if ptype=='hero' else 'AMEAÇA'),
      'image':f'{relbase}/image.webp','image_url':f'{relbase}/image.webp','pdf':f'{relbase}/character-sheet.pdf',
      'sheet_pdf_url':f'{relbase}/character-sheet.pdf','pdf_page_start':page_no,'pdf_page_end':page_no,
      'book_page_start':printed,'book_page_end':printed,'sourcePdf':'Marvel_Multiverse_RPG_Todos_Personagens.pdf',
      'maxHealth':health,'currentHealth':health,'maxFocus':focus,'currentFocus':focus,'karma':rank if re.search(r'\bHeroic\b',text,re.I) else '—',
      'healthDR':health_dr,'focusDR':focus_dr,'initiative':initiative_value(words),'occupation':occ,'origin':origin,'teams':teams,'base':base,
      'abilities':abilities,'defenses':defenses,'damageMultipliers':damage,'damageMultiplierVariants':damage_variants,'traits':traits,'tags':tags,'powers':powers,
      'stats':[['Health',health],['Focus',focus],['Karma',rank if re.search(r'\bHeroic\b',text,re.I) else '—']],
      'speed':'Ver ficha original','movement':{'run':5,'climb':3,'swim':3,'jump':3},'movementSource':'fallback-default',
      'role':'Perfil oficial do Core Rulebook','hook':'','libraryRevision':6,
      'sourceProfileText':re.sub(r'\s+',' ',text).strip()[:12000]
    }


def save_assets(doc,profile,page_index,frontend:Path):
    asset_dir=frontend / Path(profile['image']).parent
    asset_dir.mkdir(parents=True,exist_ok=True)
    # exact source page as a standalone PDF
    out_pdf=fitz.open(); out_pdf.insert_pdf(doc,from_page=page_index,to_page=page_index)
    pdf_path=frontend/Path(profile['pdf'])
    pdf_path.parent.mkdir(parents=True,exist_ok=True); out_pdf.save(pdf_path,garbage=0,deflate=False); out_pdf.close()
    # card portrait is a crop of the original profile artwork; no external image source.
    page_no=page_index+1; x0=55 if page_no%2==0 else 37
    clip=fitz.Rect(x0,65,x0+195,285)
    pix=doc[page_index].get_pixmap(matrix=fitz.Matrix(3,3),clip=clip,alpha=False)
    im=Image.frombytes('RGB',(pix.width,pix.height),pix.samples)
    # trim a small credit/border strip while keeping original art intact
    im=im.crop((18,0,im.width,im.height))
    image_path=frontend/Path(profile['image']); image_path.parent.mkdir(parents=True,exist_ok=True)
    im.save(image_path,'WEBP',quality=92,method=6)


def js_module(profiles):
    raw=json.dumps(profiles,ensure_ascii=False,indent=2)
    return f"// AUTO-GENERATED by backend/tools/import-core-rulebook-characters.py\n// Source book is not bundled; each profile points only to its isolated original page.\nexport const CORE_RULEBOOK_REVISION = 1;\nexport const CORE_RULEBOOK_CHARACTERS = {raw};\n"


def main():
    ap=argparse.ArgumentParser(); ap.add_argument('pdf'); ap.add_argument('--project-root',default=str(Path(__file__).resolve().parents[2]))
    args=ap.parse_args(); pdf=Path(args.pdf).resolve(); root=Path(args.project_root).resolve(); frontend=root/'frontend'; backend=root/'backend'
    doc=fitz.open(pdf); assert len(doc)==130, f'Expected 130 PDF pages, got {len(doc)}'
    refs=build_rank_refs(doc); damage_digit_refs=build_damage_digit_refs(doc); profiles=[]
    for idx in range(2,len(doc)):
        p=parse_profile(doc,idx,refs,damage_digit_refs); save_assets(doc,p,idx,frontend); profiles.append(p)
    (backend/'database'/'core-rulebook-characters.json').write_text(json.dumps(profiles,ensure_ascii=False,indent=2),encoding='utf-8')
    with (backend/'database'/'core-rulebook-page-map.csv').open('w',encoding='utf-8',newline='') as fh:
        writer=csv.DictWriter(fh,fieldnames=['id','name','type','library_kind','pdf_page_start','pdf_page_end','book_page_start','book_page_end','image_url','sheet_pdf_url'])
        writer.writeheader()
        for profile in profiles:
            writer.writerow({
                'id':profile['id'],'name':profile['n'],'type':profile['type'],'library_kind':profile['libraryKind'],
                'pdf_page_start':profile['pdf_page_start'],'pdf_page_end':profile['pdf_page_end'],
                'book_page_start':profile['book_page_start'],'book_page_end':profile['book_page_end'],
                'image_url':profile['image_url'],'sheet_pdf_url':profile['sheet_pdf_url']
            })
    (backend/'src'/'core-rulebook-library.js').write_text(js_module(profiles),encoding='utf-8')
    problems=[]
    for profile in profiles:
        isolated=frontend/Path(profile['pdf']); image=frontend/Path(profile['image'])
        if not isolated.exists(): problems.append({'id':profile['id'],'problem':'missing individual PDF'})
        else:
            check=fitz.open(isolated)
            if len(check)!=(profile['pdf_page_end']-profile['pdf_page_start']+1): problems.append({'id':profile['id'],'problem':f'individual PDF has {len(check)} page(s)'})
            check.close()
        if not image.exists(): problems.append({'id':profile['id'],'problem':'missing extracted image'})
    summary={
      'total_found':len(profiles),'total_imported':len(profiles),'heroes':sum(p['type']=='hero' for p in profiles),'villains':sum(p['type']=='villain' for p in profiles),
      'minions':sum(p['type']=='minion' for p in profiles),'antiheroes':sum(p['type']=='antihero' for p in profiles),
      'neutral':sum(p['type']=='neutral' for p in profiles),'individual_pdfs':len(profiles),'images_extracted':len(profiles),
      'multi_page_profiles':[],'characters_with_problems':problems,'first_pdf_page':3,'last_pdf_page':130,'book_page_offset':131
    }
    (backend/'database'/'core-rulebook-import-report.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(summary,ensure_ascii=False,indent=2))

if __name__=='__main__':main()
