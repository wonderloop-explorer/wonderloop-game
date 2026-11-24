# -*- coding: utf-8 -*-
"""주민 얼굴이 머리 겉면에 붙었는지 앞·3/4·옆에서 가까이 찍기 (2026-11-25) — 서버가 떠 있을 때 저장소 루트에서:
   python3 tools/face-wrap-shots.py [--who 삐삐] [--zone space-mars] [--tag after|before] [--phone]
   --tag before 면 주소에 &nowrap(예전 얼굴). 결과 docs/compare/face-wrap/<tag>-<pc|phone>-<이름>-<front|q|side>.png. 소리 끔, 끝나면 닫음."""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
a = sys.argv[1:]; arg = lambda k, d: a[a.index(k) + 1] if k in a else d
WHO = arg('--who', '삐삐'); ZONE = arg('--zone', 'space-mars'); TAG = arg('--tag', 'after'); PORT = arg('--port', '8000'); PHONE = '--phone' in a
OUT = os.path.join(ROOT, 'docs/compare/face-wrap'); os.makedirs(OUT, exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'])
    o = dict(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True) if PHONE else dict(viewport={'width': 1280, 'height': 720})
    c = b.new_context(**o); pg = c.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    u = 'http://localhost:%s/?world=infinite-space&notitle&zone=%s%s%s' % (PORT, ZONE, '&quality=mobile' if PHONE else '', '&nowrap' if TAG == 'before' else '')
    pg.goto(u); pg.wait_for_function('window.wlGame&&wlGame.state', timeout=120000); pg.wait_for_timeout(1200); pg.wait_for_function('window.wlGame&&wlGame.state', timeout=120000)
    pg.evaluate("localStorage.setItem('wl-help-seen','1');['mars:met','mars:call','mars:recA','mars:told','clear:space-mars','space:demo','venus:met','rest:met'].forEach(k=>wlGame.state.setFlag(k,true))"); pg.reload(); pg.wait_for_function('window.wlZone&&wlZone.cur&&window.wlGame&&wlGame.mission.hero()', timeout=120000); pg.wait_for_timeout(3000)
    for _ in range(5):
        if pg.evaluate('!!wlGame.ui.cardShown()||wlGame.dialog.talking()'): pg.keyboard.press('Escape'); pg.evaluate('wlGame.dialog.act()'); pg.wait_for_timeout(700)
    for nm, ang in (('front', 0), ('q', .75), ('side', 1.5)):
        pg.evaluate("""([who,ang])=>{const G=wlGame,n=G.dialog.findNPC(who),r=n.root,h=(n.bubbleY||1.2)-.52;window.__fc=()=>{const dx=G.view.camera.position.x-r.position.x;window.__y0=window.__y0??r.rotation.y;const y=window.__y0+ang,P=r.position,d=1.5;return {at:[P.x,P.y+h,P.z],from:[P.x+Math.sin(y)*d,P.y+h+.08,P.z+Math.cos(y)*d]};};G.mission.hero().userData.sceneLock=true;G.view.hold(window.__fc,{snap:true});G.ui.setHints(false);}""", [WHO, ang])
        pg.wait_for_timeout(900); pg.evaluate("wlGame.view.hold(window.__fc,{snap:true})"); pg.wait_for_timeout(500)
        pg.screenshot(path=os.path.join(OUT, '%s-%s-%s-%s.png' % (TAG, 'phone' if PHONE else 'pc', WHO, nm)))
    print('오류', errs); b.close()
