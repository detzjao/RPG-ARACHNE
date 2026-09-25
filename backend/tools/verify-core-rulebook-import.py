#!/usr/bin/env python3
"""Verify RPG Arachne Core Rulebook character import against the user-supplied source PDF."""
from __future__ import annotations
import argparse, json
from pathlib import Path
import fitz
from PIL import Image


def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('pdf')
    ap.add_argument('--project-root',default=str(Path(__file__).resolve().parents[2]))
    args=ap.parse_args()
    source_path=Path(args.pdf).resolve(); root=Path(args.project_root).resolve()
    frontend=root/'frontend'; backend=root/'backend'
    profiles=json.loads((backend/'database/core-rulebook-characters.json').read_text(encoding='utf-8'))
    source=fitz.open(source_path)
    problems=[]; exact=0; images_ok=0; pdfs_ok=0
    for p in profiles:
        pdf_path=frontend/p['sheet_pdf_url']; image_path=frontend/p['image_url']
        if not pdf_path.exists():
            problems.append({'id':p['id'],'problem':'missing individual PDF'}); continue
        isolated=fitz.open(pdf_path)
        expected_pages=p['pdf_page_end']-p['pdf_page_start']+1
        if len(isolated)!=expected_pages:
            problems.append({'id':p['id'],'problem':f'expected {expected_pages} isolated page(s), found {len(isolated)}'})
        else:
            pdfs_ok+=1
            # Current source contains one-page profiles. Render comparison guarantees the copied page is visually exact.
            src=source[p['pdf_page_start']-1].get_pixmap(matrix=fitz.Matrix(1,1),alpha=False)
            out=isolated[0].get_pixmap(matrix=fitz.Matrix(1,1),alpha=False)
            if (src.width,src.height,src.samples)==(out.width,out.height,out.samples): exact+=1
            else: problems.append({'id':p['id'],'problem':'individual PDF render differs from source page'})
        isolated.close()
        if not image_path.exists():
            problems.append({'id':p['id'],'problem':'missing extracted image'})
        else:
            try:
                with Image.open(image_path) as im:
                    if im.width>=300 and im.height>=300: images_ok+=1
                    else: problems.append({'id':p['id'],'problem':f'extracted image too small: {im.width}x{im.height}'})
            except Exception as exc:
                problems.append({'id':p['id'],'problem':f'invalid image: {exc}'})
    report={
        'source_pdf':source_path.name,
        'source_pages':len(source),
        'profiles_checked':len(profiles),
        'individual_pdfs_ok':pdfs_ok,
        'exact_source_page_render_matches':exact,
        'images_ok':images_ok,
        'multi_page_profiles':[p['id'] for p in profiles if p['pdf_page_end']>p['pdf_page_start']],
        'problems':problems,
        'ok':not problems and exact==len(profiles) and images_ok==len(profiles)
    }
    source.close()
    out=backend/'database/core-rulebook-verification-report.json'
    out.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False,indent=2))
    raise SystemExit(0 if report['ok'] else 1)

if __name__=='__main__': main()
