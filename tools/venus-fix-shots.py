# -*- coding: utf-8 -*-
"""화성 → 금성 이동 확인 캡처 (2026-11-14) — 촬영 서버(8000)가 떠 있을 때 저장소 루트에서:
     python3 tools/venus-fix-shots.py [--tag 이름] [--phone] [--port 8000]
   화산 꼭대기 금성행 회오리로 걸어 들어가 금성 구름에 들어갈 때까지, 정한 순간마다 캡처:
     wrap-*   회오리가 감싸는 순간 ~ 떠난 직후(원더룹 발과 땅)
     wave-*   삐삐·둥둥 손 흔들기(위에서 내려다본 것 + 둘 가까이 오려 낸 것)
     seam-*   화성 땅 → 우주로 이어지는 구간 0.5초 간격
     venus-*  지도로 넘어가기 직전의 금성
     map-*    지도 시작(0 · 0.2 · 0.45 · 0.9초 — 앞 장면 위에 지도 글자가 비치지 않는지)
   매 프레임: 원더룹 발 높이 − 그 자리에서 그려지는 땅 높이(위에서 쏜 레이캐스트) → 가장 낮은 값, 삐삐·둥둥 어깨와 팔 축 사이 거리.
   결과 docs/compare/venus-fix/<tag>-<크기>-*.jpg · .json. 소리 끔, 끝나면 닫음."""
import json, os, sys, time
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); a = sys.argv[1:]
arg = lambda k, d: a[a.index(k) + 1] if k in a else d
TAG = arg('--tag', 'after'); PH = '--phone' in a; PORT = arg('--port', '8000')
VW, VH = (393, 659) if PH else (1280, 632); DEV = '%dx%d' % (VW, VH); OUT = os.path.join(ROOT, 'docs/compare/venus-fix'); os.makedirs(OUT, exist_ok=True)
FL = ['have:infinite-space:necklace', 'mars:met', 'mars:call', 'mars:recA', 'mars:recB', 'mars:told', 'clear:space-mars', 'item:infinite-space:bluesunset-glass', 'meet:infinite-space:pipi', 'meet:infinite-space:dungdung',
      'secret:infinite-space:marssound', 'secret:infinite-space:bluesunset', 'secret:infinite-space:volcano', 'mars:flag', 'mars:bgm-intro']
PROBE = """(async()=>{const T=await import('three');const S=window.__vf={min:9,minT:0,arm:0,n:0,t0:0,rc:new T.Raycaster(),log:[]};const V=T.Vector3;
 const tick=()=>{requestAnimationFrame(tick);try{const G=wlGame,W=G.mission.hero();if(!W.userData.riding||!wlZone.cur.dbgBoard)return;if(!S.t0)S.t0=performance.now();const t=(performance.now()-S.t0)/1000;
   const d=wlZone.cur.dbgBoard();S.u=d?d.u:0;S.drop=d?d.drop:0;
   let sc=W;while(sc.parent)sc=sc.parent;const list=[];sc.traverse(o=>{if(o.isMesh&&o.visible&&/^mars-(ground|summit|tops)/.test(o.name||''))list.push(o)});
   if(t<9&&list.length&&!(S.drop>0)){let fy=1e9;for(const n of ['foot.L','foot.R']){const f=W.getObjectByName(n);if(f){const p=new V();f.getWorldPosition(p);fy=Math.min(fy,p.y);}}
     S.rc.set(new V(W.position.x,W.position.y+40,W.position.z),new V(0,-1,0));const h=S.rc.intersectObjects(list,false);if(h.length){const c=fy-.08-h[0].point.y;S.log.push([+t.toFixed(2),+c.toFixed(2)]);if(c<S.min){S.min=c;S.minT=t;}}}
   for(const nm of ['pipi-body','dungdung-body']){const b=sc.getObjectByName(nm);if(b){for(const g of b.children){if(g.isGroup){const p=new V();g.getWorldPosition(p);const q=g.position.clone();b.localToWorld(q);S.arm=Math.max(S.arm,p.distanceTo(q));S.n++;}}}}
 }catch(e){S.err=String(e);}};tick();})()"""
R = {'크기': DEV}
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio', '--autoplay-policy=no-user-gesture-required', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'])
    o = dict(viewport={'width': VW, 'height': VH}, device_scale_factor=2, is_mobile=True, has_touch=True) if PH else dict(viewport={'width': VW, 'height': VH}, device_scale_factor=2)
    c = b.new_context(**o); pg = c.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200])); pg.on('console', lambda m: m.type == 'error' and errs.append(m.text[:200]))
    pg.goto('http://localhost:%s/?world=infinite-space&zone=space-mars&notitle%s' % (PORT, '&quality=mobile' if PH else '')); pg.wait_for_function('window.wlGame&&wlGame.state', timeout=120000); pg.wait_for_timeout(1500)
    pg.evaluate("f=>{localStorage.clear();localStorage.setItem('wl-help-seen','1');f.forEach(k=>wlGame.state.setFlag(k,true));wlGame.state.saveAfter('space-mars',{time:1,flag:true})}", FL); pg.reload()
    pg.wait_for_function('window.wlZone&&wlZone.cur&&wlZone.cur.spots&&window.wlPhoto', timeout=120000); pg.wait_for_timeout(3000)
    st = lambda: pg.evaluate('wlZone.cur.state?wlZone.cur.state():{}')
    for _ in range(60):
        s0 = st()
        if s0.get('ride') or s0.get('summit'): break
        w = s0['secretWhirl']; pg.evaluate("([x,z])=>{const W=wlGame.mission.hero(),P=W.position;if(Math.hypot(P.x-x,P.z-z)>6){P.x=x+3.5;P.z=z+1;}W.userData.walkTo(x,z)}", w); pg.wait_for_timeout(400)
    for _ in range(160):
        s0 = st()
        if s0.get('summit') and not s0.get('ride'): break
        pg.wait_for_timeout(250)
    pg.wait_for_timeout(1800); pg.evaluate(PROBE); pg.wait_for_timeout(300)
    pg.evaluate("([x,z])=>wlGame.mission.hero().userData.walkTo(x,z)", pg.evaluate('wlZone.cur.spots.bigTop'))
    shot = lambda n: pg.screenshot(path=os.path.join(OUT, '%s-%s-%s.jpg' % (TAG, DEV, n)), type='jpeg', quality=82)
    vf = lambda k: pg.evaluate('window.__vf&&window.__vf.%s' % k)
    def wait(cond, to=40):
        t = time.time()
        while time.time() - t < to:
            if pg.evaluate(cond): return True
            pg.wait_for_timeout(25)
        return False
    wait('!!wlGame.mission.hero().userData.riding'); t0 = time.time()
    for n, tt in [('wrap-1', 2.0), ('wrap-2', 2.7), ('wrap-3', 3.5)]:
        while time.time() - t0 < tt: pg.wait_for_timeout(20)
        shot(n)
    seq = [('wrap-4', .012), ('wrap-5', .035), ('wrap-6', .07), ('wave-1', .19), ('wave-2', .235), ('wave-3', .27)] + [('seam-%02d' % i, .27 + i * .0385) for i in range(1, 9)] + [('venus-1', .84), ('venus-2', .9), ('venus-3', .95), ('venus-4', .992)]
    for n, u in seq:
        wait('window.__vf.u>=%s' % u); shot(n)
        if n.startswith('wave'):
            sc = st().get('scr') or {}; R.setdefault('둘 화면 자리', []).append(sc.get('pipi'))
            pp = pg.evaluate("(()=>{const c=wlGame.view.camera;let sc=wlGame.mission.hero();while(sc.parent)sc=sc.parent;const o=[];for(const nm of ['pipi-body','dungdung-body']){const b=sc.getObjectByName(nm);if(!b)continue;const v=b.getWorldPosition(new c.position.constructor());v.y+=.7;v.project(c);o.push([(v.x+1)/2*innerWidth,(1-v.y)/2*innerHeight]);}return o})()")
            if len(pp) == 2:
                cx, cy = (pp[0][0] + pp[1][0]) / 2, (pp[0][1] + pp[1][1]) / 2; w = 220 if not PH else 150
                x0, y0 = max(0, min(VW - w, cx - w / 2)), max(0, min(VH - w, cy - w / 2))
                pg.screenshot(path=os.path.join(OUT, '%s-%s-%s-close.jpg' % (TAG, DEV, n)), type='jpeg', quality=88, clip={'x': x0, 'y': y0, 'width': w, 'height': w})
    wait("!!document.getElementById('wlTravelMap')", 20); tm = time.time(); shot('map-0')
    for n, tt in [('map-1', .2), ('map-2', .45), ('map-3', .9), ('map-4', 2.6)]:
        while time.time() - tm < tt: pg.wait_for_timeout(15)
        shot(n)
    wait("wlZone.cur&&wlZone.cur.id==='space-venus'||location.search.includes('venus')", 12); pg.wait_for_timeout(2500); shot('venus-land')
    R['발 − 땅 가장 낮은 값(m)'] = vf('min'); R['그때(초)'] = vf('minT'); R['어깨 − 팔 축 가장 큰 거리(m)'] = vf('arm'); R['팔 잰 횟수'] = vf('n'); R['발 − 땅 기록'] = (vf('log') or [])[::6]; R['오류'] = errs; R['probe 오류'] = vf('err')
    json.dump(R, open(os.path.join(OUT, '%s-%s.json' % (TAG, DEV)), 'w'), ensure_ascii=False, indent=1); b.close()
print(json.dumps({k: v for k, v in R.items() if k != '발 − 땅 기록'}, ensure_ascii=False))
