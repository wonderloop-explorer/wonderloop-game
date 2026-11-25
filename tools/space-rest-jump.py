# -*- coding: utf-8 -*-
"""토성 쉼터 쉬기 장면의 정한 시각으로 건너뛰어 구도만 빨리 찍기 (2026-11-25) — 촬영 서버(8000)가 떠 있을 때 저장소 루트에서:
   python3 tools/space-rest-jump.py --t 12,44,92,105 [--phone] [--wait 밀리초] [--out docs/compare/space-rest-jump]
   자막은 건너뛴 시각과 안 맞을 수 있다(차례대로 나오므로) — 자막 시각은 space-rest-test.py로. 소리 끔, 끝나면 닫음."""
import sys, os
from playwright.sync_api import sync_playwright
A = sys.argv[1:]; PHONE = '--phone' in A; times = [float(x) for x in A[A.index('--t') + 1].split(',')]
OUT = A[A.index('--out') + 1] if '--out' in A else 'docs/compare/space-rest-jump'; os.makedirs(OUT, exist_ok=True)
WAIT = int(A[A.index('--wait') + 1]) if '--wait' in A else 1600
VW = (390, 844) if PHONE else (1280, 632); TAG = 'phone' if PHONE else 'pc'
READY = 'window.wlZone&&wlZone.cur&&window.wlGame&&wlGame.mission.hero()'
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio']); cx = b.new_context(viewport={'width': VW[0], 'height': VW[1]}, device_scale_factor=2, has_touch=PHONE, is_mobile=PHONE); pg = cx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text[:300]) if m.type == 'error' and '404' not in m.text and 'Failed to load' not in m.text else None)
    url = 'http://localhost:8000/?world=infinite-space&zone=space-saturn&notitle&quality=%s' % ('mobile' if PHONE else 'high')
    pg.goto(url, wait_until='domcontentloaded'); pg.evaluate('localStorage.clear();localStorage.setItem("wl-help-seen","1")'); pg.reload(wait_until='domcontentloaded'); pg.wait_for_function(READY, timeout=120000); pg.wait_for_timeout(600)
    pg.evaluate("(fl)=>{for(const k of fl)wlGame.state.setFlag(k,true);}", ['have:infinite-space:necklace', 'meet:infinite-space:geokkuri', 'rest:met', 'rest:toss']); pg.reload(wait_until='domcontentloaded'); pg.wait_for_function(READY, timeout=120000)
    pg.wait_for_function('wlZone.cur.state().rest.on', timeout=120000); pg.wait_for_timeout(1500)
    for t in times:
        pg.evaluate('t=>wlZone.cur.dbgRest(t)', t); pg.wait_for_timeout(WAIT); pg.screenshot(path=os.path.join(OUT, '%s-jump-%s.png' % (TAG, t)))
    print('오류', errs[:4]); b.close()
