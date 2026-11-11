# -*- coding: utf-8 -*-
"""아기 토끼(키 작은 상대) 대화 카메라 전후 캡처 (2026-11-11) — 서버가 떠 있을 때 저장소 루트에서:
   python3 tools/bunny-talk-shots.py --tag before|after [--port 8000] [--only pc,phone,632]
   크기 셋(PC 1280×720 · 휴대폰 세로 390×844 터치 · 1280×632)마다 아기 토끼 셋(콩콩·몽실·보슬)에게 실제 입력(E 키 / 말 걸기 단추)으로 말을 걸고 1.8초 뒤 한 장.
   잰 것: 두 사람 발~머리 위가 화면 안인지(inside), 가로 가운데 70% 안인지(mid70 — 화면 가로 0.15~0.85), 원더룹 화면 높이(heroH), 원더룹 얼굴이 카메라 쪽으로 보이는 정도(face), 카메라 거리.
   결과 docs/compare/bunny-talk/<tag>-<크기>-<토끼>.png, <tag>.json. 소리 끔, 끝나면 닫음."""
import json, os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
a = sys.argv[1:]; arg = lambda k, d: a[a.index(k) + 1] if k in a else d
TAG = arg('--tag', 'after'); PORT = arg('--port', '8000'); ONLY = arg('--only', 'pc,phone,632').split(',')
OUT = os.path.join(ROOT, 'docs/compare/bunny-talk'); os.makedirs(OUT, exist_ok=True)
VIEWS = {'pc': dict(viewport={'width': 1280, 'height': 720}), '632': dict(viewport={'width': 1280, 'height': 632}),
         'phone': dict(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)}
MEASURE = """(name)=>{const G=wlGame,W=G.mission.hero(),cam=G.view.camera,V=W.position.constructor,n=G.dialog.findNPC(name),B=window.__bend;
 const pr=(x,y,z)=>{const b=B?B.bentPos({x,y,z}):{x,y,z};const q=new V(b.x,b.y,b.z).project(cam);return [+(((q.x+1)/2)).toFixed(3),+(((1-q.y)/2)).toFixed(3)];};
 const P=W.position,np=new V();n.root.getWorldPosition(np);const fx=Math.sin(W.rotation.y),fz=Math.cos(W.rotation.y);let cx=cam.position.x-P.x,cz=cam.position.z-P.z;const cl=Math.hypot(cx,cz)||1;
 const pts=[pr(P.x,P.y,P.z),pr(P.x,P.y+1.6,P.z),pr(np.x,np.y,np.z),pr(np.x,np.y+(n.bubbleY||1.4),np.z)];
 const hb=wlPhoto.body(cam);const r=hb&&hb.rect;
 return {face:+((fx*cx+fz*cz)/cl).toFixed(2),dist:+cam.position.distanceTo(P).toFixed(1),inside:pts.every(p=>p[0]>.02&&p[0]<.98&&p[1]>.02&&p[1]<.98),pts,heroW:r?+(r[2]-r[0]).toFixed(2):null,heroH:r?+(r[3]-r[1]).toFixed(2):null,talking:G.dialog.talking()};}"""
R = {}
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'])
    for vk in ONLY:
        o = VIEWS[vk]; touch = bool(o.get('has_touch')); c = b.new_context(**o); pg = c.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
        base = 'http://localhost:' + PORT + '/?world=infinite-space&notitle&time=0&zone=space-garden' + ('&quality=mobile' if touch else '')
        pg.goto(base); pg.wait_for_function('window.wlGame&&wlGame.state', timeout=120000); pg.wait_for_timeout(1200); pg.wait_for_function('window.wlGame&&wlGame.state', timeout=120000)
        pg.evaluate("f=>{localStorage.setItem('wl-help-seen','1');f.forEach(k=>wlGame.state.setFlag(k,true))}", ['have:infinite-space:necklace', 'space:demo', 'meet:infinite-space:bunnies']); pg.reload()
        pg.wait_for_function('window.wlZone&&wlZone.cur&&wlZone.cur.spots&&window.wlPhoto', timeout=120000)
        pg.evaluate("(async()=>{const e=performance.getEntriesByType('resource').find(e=>/js\\/game\\/bend\\.js/.test(e.name));if(e)window.__bend=await import(e.name);})()"); pg.wait_for_timeout(2500)
        for _ in range(6):
            if pg.evaluate('wlGame.ui.cardShown()') or pg.evaluate('wlGame.dialog.talking()'): pg.keyboard.press('Escape'); pg.evaluate('wlGame.dialog.act()'); pg.wait_for_timeout(700)
        R[vk] = {}
        for key, name in [('kongkong', '아기 토끼 콩콩'), ('mongsil', '아기 토끼 몽실'), ('bosul', '아기 토끼 보슬')]:
            # 토끼 쪽으로 걸어가 멈출 때까지(토끼가 뛰어 달아나면 다시) — 1.2m 안에 서면 말 걸기
            for _ in range(8):
                pos = pg.evaluate("n=>{const m=wlGame.dialog.findNPC(n),W=wlGame.mission.hero(),v=new (W.position.constructor)();m.root.getWorldPosition(v);const P=W.position;let dx=P.x-v.x,dz=P.z-v.z;const l=Math.hypot(dx,dz)||1;if(l>7){P.x=v.x+dx/l*5;P.z=v.z+dz/l*5;}W.userData.walkTo(v.x+dx/l*1.05,v.z+dz/l*1.05);return l}", name)
                pg.wait_for_timeout(900)
                if pg.evaluate("n=>{const m=wlGame.dialog.findNPC(n),W=wlGame.mission.hero(),v=new (W.position.constructor)();m.root.getWorldPosition(v);return Math.hypot(W.position.x-v.x,W.position.z-v.z)<1.3&&!W.userData.isWalking()}", name): break
            pg.wait_for_timeout(900)
            if touch:
                try: pg.locator('#wlAct').tap(timeout=1500)
                except Exception: pg.evaluate('wlGame.dialog.act()')
            else: pg.keyboard.press('e')
            pg.wait_for_timeout(1900); pg.screenshot(path=os.path.join(OUT, '%s-%s-%s.png' % (TAG, vk, key))); m = pg.evaluate(MEASURE, name)
            m['mid70'] = all(.15 <= q[0] <= .85 for q in m['pts']); R[vk][key] = m
            for _ in range(8):
                if not pg.evaluate('wlGame.dialog.talking()') and not pg.evaluate('wlGame.ui.cardShown()'): break
                pg.keyboard.press('Escape'); pg.evaluate('wlGame.dialog.act()'); pg.wait_for_timeout(500)
            pg.wait_for_timeout(1200)
        R[vk]['오류'] = errs[:5]; c.close()
    b.close()
json.dump(R, open(os.path.join(OUT, TAG + '.json'), 'w'), ensure_ascii=False, indent=1)
for vk, r in R.items():
    for k, m in r.items():
        if k != '오류': print(vk, k, '대화중', m['talking'], '안', m['inside'], '가운데70', m['mid70'], '원더룹 높이', m['heroH'], '얼굴', m['face'], '거리', m['dist'], m['pts'])
    print(vk, '오류', r['오류'])
