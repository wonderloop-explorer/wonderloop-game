# -*- coding: utf-8 -*-
"""목표 이름표 잘림 확인 (2026-11-13) — 서버가 떠 있을 때 저장소 루트에서:  python3 tools/goal-tag-shots.py --tag before|after [--port 8000]
   화성을 끝낸 뒤(깃발 전) '화산 회오리' 이름표를 (밀어 넣기 전 자리 기준) 가운데·오른쪽 끝·왼쪽 끝에 오게 카메라를 돌려 찍고(컴퓨터 1280×720·휴대폰 세로 390×844),
   이름표 스프라이트의 화면 네모(왼쪽·오른쪽)를 잰다. 결과 docs/compare/goal-tag/<tag>-<pc|phone>-<center|right|left>.png · <tag>.json"""
import json, os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); a = sys.argv[1:]
TAG = a[a.index('--tag') + 1] if '--tag' in a else 'after'; PORT = a[a.index('--port') + 1] if '--port' in a else '8000'
OUT = os.path.join(ROOT, 'docs/compare/goal-tag'); os.makedirs(OUT, exist_ok=True)
FL = ['have:infinite-space:necklace', 'mars:met', 'mars:call', 'mars:recA', 'mars:recB', 'mars:told', 'clear:space-mars', 'item:infinite-space:bluesunset-glass', 'mars:bgm-intro', 'secret:infinite-space:marssound', 'secret:infinite-space:bluesunset']
RECT = """()=>{const W=wlGame.mission.hero();let sc=W;while(sc.parent)sc=sc.parent;const g=sc.getObjectByName('wl-goal');if(!g||!g.visible)return null;const t=g.children[1],c=wlGame.view.camera;
  c.updateMatrixWorld();const bm=g.children[3].visible?g.children[3]:g.children[0],raw=bm.position.clone();raw.y=t.position.y;const rv=raw.project(c);const p=t.position.clone(),v=p.clone().project(c),d=c.position.distanceTo(p),ppm=innerHeight/(2*Math.tan(c.fov*Math.PI/360)*d),cx=(v.x+1)/2*innerWidth,cy=(1-v.y)/2*innerHeight;
  return {rawcx:+((rv.x+1)/2).toFixed(3),left:Math.round(cx-t.scale.x*ppm/2),right:Math.round(cx+t.scale.x*ppm/2),top:Math.round(cy-t.scale.y*.88*ppm),W:innerWidth,label:(document.getElementById('wlQuest')||{}).textContent||''};}"""
R = {}
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'])
    for dev, o in [('pc', dict(viewport={'width': 1280, 'height': 720})), ('phone', dict(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True))]:
        pg = b.new_context(**o).new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:150]))
        pg.goto('http://localhost:%s/?world=infinite-space&zone=space-mars&notitle%s' % (PORT, '&quality=mobile' if dev == 'phone' else '')); pg.wait_for_function('window.wlGame&&wlGame.state', timeout=120000); pg.wait_for_timeout(1500)
        pg.evaluate("f=>{localStorage.clear();localStorage.setItem('wl-help-seen','1');f.forEach(k=>wlGame.state.setFlag(k,true));}", FL); pg.reload()
        pg.wait_for_function('window.wlZone&&wlZone.cur&&wlZone.cur.spots', timeout=120000); pg.wait_for_timeout(3000)
        pg.evaluate("()=>{const s=wlZone.cur.state(),w=s.secretWhirl,W=wlGame.mission.hero();W.position.x=w[0]+9;W.position.z=w[1]+4;W.userData.stopWalk&&W.userData.stopWalk();}"); pg.wait_for_timeout(1500)
        res = {}
        for side, goal in [('center', .5), ('right', .97), ('left', .03)]:
            # 카메라 방향(yaw)을 할선법으로 맞춤 — 따라가기 카메라가 늦게 따라오므로 한 번 바꿀 때마다 0.45초 기다림
            def raw():
                for _ in range(20):
                    r = pg.evaluate(RECT)
                    if r: return r['rawcx']
                    pg.wait_for_timeout(100)
                return None
            def yaw(d): pg.evaluate("d=>{wlGame.controls.input.cam.yaw+=d;}", d); pg.wait_for_timeout(450)
            x0 = raw(); yaw(.05); x1 = raw(); slope = (x1 - x0) / .05 if x0 is not None and x1 is not None and abs(x1 - x0) > 1e-4 else -1
            for _ in range(14):
                if x1 is None or abs(x1 - goal) < .012: break
                step = max(-.35, min(.35, (goal - x1) / slope)); yaw(step); x2 = raw()
                if x2 is not None and abs(x2 - x1) > 1e-4: slope = (x2 - x1) / step
                x1 = x2
            pg.wait_for_timeout(500); r = pg.evaluate(RECT); pg.screenshot(path=os.path.join(OUT, '%s-%s-%s.png' % (TAG, dev, side)))
            if r: r['잘림'] = r['left'] < 0 or r['right'] > r['W'] or r['top'] < 0
            res[side] = r
        res['오류'] = errs; R[dev] = res; pg.close()
    b.close()
json.dump(R, open(os.path.join(OUT, TAG + '.json'), 'w'), ensure_ascii=False, indent=1); print(json.dumps(R, ensure_ascii=False))
