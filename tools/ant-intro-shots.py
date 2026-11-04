# -*- coding: utf-8 -*-
"""개미굴 원본(antvillage) 모험 시작 연출·첫 미션 촬영 (2026-11-04, 공통 틀 4단계 비교용) — 저장소 루트에서:
   python3 tools/ant-intro-shots.py [--ant <antvillage index.html>] [--out docs/compare/intro-mission] [--phone]
   원본을 그대로 file://로 열어 시작 → 탐험가 소개 '모험 떠나기' → 이야기 세 단계 → '모험 시작' → 미션 카드 → 냄새 길을 찍는다(ant-*.png). 소리는 끄고 끝나면 닫는다."""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
args = sys.argv[1:]
ANT = args[args.index('--ant') + 1] if '--ant' in args else os.path.join(ROOT, '..', 'antvillage', 'index.html')
OUT = os.path.join(ROOT, args[args.index('--out') + 1] if '--out' in args else 'docs/compare/intro-mission')
PHONE = '--phone' in args; pre = 'ant-phone-' if PHONE else 'ant-pc-'
os.makedirs(OUT, exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio'])
    o = dict(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True) if PHONE else dict(viewport={'width': 1280, 'height': 800})
    pg = b.new_context(**o).new_page()
    pg.goto('file://' + os.path.abspath(ANT)); pg.wait_for_function('!document.getElementById("boot")', timeout=120000); pg.wait_for_timeout(1500)
    shot = lambda n: pg.screenshot(path=os.path.join(OUT, pre + n + '.png'))
    pg.click('#start'); pg.wait_for_timeout(1500); pg.click('#goBtn'); pg.wait_for_timeout(300)
    for i in range(3):
        pg.wait_for_timeout(3300); shot(f'story-{i+1}')
        pg.click('#nextBtn'); pg.wait_for_timeout(100)
        if i == 2 and pg.evaluate("!document.getElementById('story').hidden"): pg.click('#nextBtn')
        elif i < 2 and pg.eval_on_selector('#nextBtn', 'e=>e.textContent') == ('다음' if i == 0 else '모험 시작') and False: pass
    pg.wait_for_timeout(1200); shot('mission-card')
    pg.wait_for_timeout(6500); shot('mission-trail')
    b.close()
print('저장', OUT)
