# -*- coding: utf-8 -*-
"""사진 모드 초점 범위 확인 (2026-11-08) — 촬영 서버(8000)가 떠 있을 때 저장소 루트에서:
   python3 tools/photo-focus-shots.py --tag before|after [--phone] [--out docs/compare/photo-focus]
   회색 정원 떡방아(아기 토끼들이 모인 뒤 게임을 멈춤)에서 가장 가까운 줌(1.8)·중간(5)·가장 먼 줌(18)을 4:5로 저장 →
   <tag>-<pc|phone>-near|mid|far.png. 원더룹 탈 꼭대기·발끝이 또렷한지 보는 용도. 소리 끔, 끝나면 닫음."""
import base64, json, os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
a = sys.argv[1:]; PHONE = '--phone' in a; TAG = a[a.index('--tag') + 1] if '--tag' in a else 'run'
OUT = os.path.join(ROOT, a[a.index('--out') + 1] if '--out' in a else 'docs/compare/photo-focus'); os.makedirs(OUT, exist_ok=True)
dev = 'phone' if PHONE else 'pc'; R = {'tag': TAG, 'dev': dev}
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'])
    o = dict(viewport={'width': 390, 'height': 844}, device_scale_factor=3, is_mobile=True, has_touch=True) if PHONE else dict(viewport={'width': 1280, 'height': 720})
    pg = b.new_context(accept_downloads=True, **o).new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    pg.goto('http://localhost:8000/?world=infinite-space&zone=space-garden&notitle' + ('&quality=mobile' if PHONE else '')); pg.evaluate('localStorage.clear()'); pg.reload()
    pg.wait_for_function('window.wlZone&&wlZone.cur&&wlZone.cur.spots&&window.wlPhoto', timeout=120000); pg.wait_for_timeout(2500)
    m = pg.evaluate('wlZone.cur.spots.mortar')
    pg.evaluate("([x,z])=>{const W=wlGame.mission.hero();W.position.x=x;W.position.z=z;}", [m[0] - 2.6, m[1] - 1.6]); pg.wait_for_timeout(1000)
    pg.evaluate("([x,z])=>wlGame.mission.hero().userData.walkTo(x,z)", m)
    for _ in range(100):
        if not pg.evaluate('wlGame.mission.hero().userData.isWalking()'): break
        pg.wait_for_timeout(200)
    for _ in range(40):
        if '찧기' in pg.evaluate('wlGame.interact.prompt()') and not pg.evaluate('wlGame.interact.busy()'): break
        pg.wait_for_timeout(200)
    pg.evaluate('wlGame.interact.act()'); pg.wait_for_timeout(2600)
    pg.evaluate('window.wlTimeScale=1e-6;wlPhoto.enter();wlPhoto.setRatio("4:5")'); pg.wait_for_timeout(300)
    for name, d, pitch, yo in [('near', 1.8, .22, .45), ('mid', 5, .4, .45), ('far', 18, .45, .45)]:
        pg.evaluate("([d,p,o])=>{const W=wlGame.mission.hero();wlPhoto.setAngle(W.rotation.y+o,p);wlPhoto.setZoom(d);}", [d, pitch, yo]); pg.wait_for_timeout(400)
        fn = os.path.join(OUT, f'{TAG}-{dev}-{name}.png')
        if not PHONE:
            with pg.expect_download() as dl: pg.evaluate('wlPhoto.shoot()')
            dl.value.save_as(fn)
        else:
            prev = pg.evaluate('wlPhoto.state.lastURL'); pg.evaluate('wlPhoto.shoot()')
            pg.wait_for_function('u=>wlPhoto.state.lastURL&&wlPhoto.state.lastURL!==u', arg=prev, timeout=30000)
            data = pg.evaluate("""async()=>{const bl=await (await fetch(wlPhoto.state.lastURL)).blob();const fr=new FileReader();return await new Promise(ok=>{fr.onload=()=>ok(fr.result.split(',')[1]);fr.readAsDataURL(bl);});}""")
            open(fn, 'wb').write(base64.b64decode(data))
        pg.screenshot(path=os.path.join(OUT, f'{TAG}-{dev}-{name}-screen.png')); pg.wait_for_timeout(300)
    R['오류'] = errs; b.close()
json.dump(R, open(os.path.join(OUT, f'{TAG}-{dev}.json'), 'w'), ensure_ascii=False, indent=1); print(R)
