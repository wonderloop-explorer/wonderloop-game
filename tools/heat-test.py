# -*- coding: utf-8 -*-
"""발열 줄이기 측정 (2026-11-10): 무한 우주 STAGE 1 회색 정원 → STAGE 2 화성을 휴대폰 크기(390×844)로 이어서 돌리며
   '얼마나 자주, 얼마나 큰 화면을 그리는지'를 잰다 — 서버가 떠 있을 때 저장소 루트에서:
   python3 tools/heat-test.py [--min 10] [--port 8000] [--tag after] [--pc] [--eco] [--out docs/perf]
   같은 길(걷기 · 가만히 서 있기 · 주민과 대화 열어 두기 · 가방 열어 두기)을 같은 시간표로 돌므로 바꾸기 전·후(다른 포트의 예전 코드)를 그대로 비교할 수 있다.
   재는 법(게임 코드를 고치지 않고 시험이 끼워 넣음): requestAnimationFrame 콜백마다 그리기 호출(drawElements·drawArrays)이 있었으면 '그린 프레임' —
   콜백 시간 + gl.finish()(GPU가 그 프레임을 끝낼 때까지)를 '바쁜 시간'으로 더한다. GPU가 쉬는 비율 = 1 − 바쁜 시간 ÷ 전체 시간.
   결과: 그린 프레임 수·초당 프레임·평균 프레임 시간(간격)·프레임당 바쁜 시간·쉬는 비율·그리는 해상도·초당 그린 화소(백만)·드로우콜 평균, 구간별(걷기·서 있기·대화·가방)로도.
   --eco: 절전 모드를 켜고. 소리 끔, 끝나면 닫음."""
import json, os, sys, time
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
a = sys.argv[1:]; arg = lambda k, d: a[a.index(k) + 1] if k in a else d
MIN = float(arg('--min', '10')); PORT = arg('--port', '8000'); TAG = arg('--tag', 'after'); PC = '--pc' in a; ECO = '--eco' in a
OUT = os.path.join(ROOT, arg('--out', 'docs/perf')); os.makedirs(OUT, exist_ok=True)
PROBE = """(()=>{const S=window.__heat={seg:'load',by:{},gl:null};const P=WebGL2RenderingContext.prototype;let calls=0;
 for(const k of ['drawElements','drawArrays','drawElementsInstanced','drawArraysInstanced']){const f=P[k];P[k]=function(){calls++;S.gl=this;return f.apply(this,arguments);};}
 const raf=window.requestAnimationFrame.bind(window);let last=0;
 window.requestAnimationFrame=cb=>raf(t=>{const c0=calls,t0=performance.now();cb(t);const B=S.by[S.seg]||(S.by[S.seg]={t:0,frames:0,busy:0,px:0,calls:0,iv:0,ivn:0,w:0,h:0});
   if(calls>c0){if(S.gl)S.gl.finish();const t1=performance.now();B.frames++;B.busy+=t1-t0;B.calls+=calls-c0;const cv=S.gl&&S.gl.canvas;if(cv){B.px+=cv.width*cv.height;B.w=cv.width;B.h=cv.height;}
     if(last&&t0-last<500){B.iv+=t0-last;B.ivn++;}last=t0;}});
 let lt=performance.now();setInterval(()=>{const n=performance.now(),B=S.by[S.seg]||(S.by[S.seg]={t:0,frames:0,busy:0,px:0,calls:0,iv:0,ivn:0,w:0,h:0});B.t+=n-lt;lt=n;},100);})()"""
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio', '--autoplay-policy=no-user-gesture-required', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'])
    o = dict(viewport={'width': 1280, 'height': 720}) if PC else dict(viewport={'width': 390, 'height': 844}, device_scale_factor=3, is_mobile=True, has_touch=True)
    c = b.new_context(**o); c.add_init_script(PROBE); pg = c.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    base = 'http://localhost:' + PORT + '/?world=infinite-space&notitle&time=0' + ('' if PC else '&quality=mobile')
    seg = lambda s: pg.evaluate("s=>{window.__heat.seg=s}", s)
    H = {}
    def grab():
        """페이지를 다시 열면 기록이 새로 시작되므로 그 전에 모아 둔다"""
        for k, B in (pg.evaluate('window.__heat?window.__heat.by:{}') or {}).items():
            A = H.setdefault(k, dict(t=0, frames=0, busy=0, px=0, calls=0, iv=0, ivn=0, w=0, h=0))
            for q in A: A[q] = max(A[q], B.get(q, 0)) if q in ('w', 'h') else A[q] + B.get(q, 0)
        pg.evaluate('window.__heat&&(window.__heat.by={})')
    def settle(sec):
        """sec초 동안: 카드는 3초 읽고 닫고, 주민 대화는 3초마다 넘김(혼잣말 줄은 저절로)"""
        t = time.time()
        while time.time() - t < sec:
            k = pg.evaluate('wlGame.ui.cardShown()')
            if k and k != 'item':
                pg.wait_for_timeout(3000); pg.keyboard.press('Escape'); pg.wait_for_timeout(300)
                pg.evaluate("(()=>{const b=[...document.querySelectorAll('.wlg button')].find(b=>getComputedStyle(b).visibility!=='hidden'&&b.getClientRects().length&&/좋아요|가방에|넣기|확인|닫기|반가워/.test(b.textContent));if(b)b.click();})()")
            elif pg.evaluate('wlGame.dialog.talking()'): pg.wait_for_timeout(3000); pg.evaluate('wlGame.dialog.act()')
            else: pg.wait_for_timeout(250)
    def walk(x, z, sec=18):
        seg('걷기'); pg.evaluate("([x,z])=>wlGame.mission.hero().userData.walkTo(x,z)", [x, z]); t = time.time()
        while time.time() - t < sec:
            if pg.evaluate("([x,z])=>{const W=wlGame.mission.hero(),P=W.position;return Math.hypot(P.x-x,P.z-z)<.8||!W.userData.isWalking()}", [x, z]): break
            pg.wait_for_timeout(250)
    def stage(zone, pts, sec, flags, talkTo):
        grab(); pg.goto(base + '&zone=' + zone); pg.wait_for_function('window.wlZone&&wlZone.cur&&wlZone.cur.spots', timeout=120000)
        if flags:
            pg.evaluate("f=>f.forEach(k=>wlGame.state.setFlag(k,true))", flags); grab(); pg.reload(); pg.wait_for_function('window.wlZone&&wlZone.cur&&wlZone.cur.spots', timeout=120000)
        if ECO: pg.evaluate("window.wlEco&&wlEco.set(true)")
        seg('서 있기'); settle(8); t0 = time.time(); i = 0; did = set()
        while time.time() - t0 < sec:
            e = time.time() - t0
            if e > sec * .3 and 'talk' not in did:
                did.add('talk'); n = pg.evaluate("n=>{const m=wlGame.dialog.findNPC(n);if(!m)return null;const v=new (wlGame.mission.hero().position.constructor)();m.root.getWorldPosition(v);return [v.x,v.z]}", talkTo)
                if n:
                    walk(n[0] - 1.2, n[1] + .4, 25); seg('대화'); pg.keyboard.press('e'); pg.wait_for_timeout(400)
                    if not pg.evaluate('wlGame.dialog.talking()'): pg.evaluate('wlGame.dialog.act()')
                    pg.wait_for_timeout(15000); settle(14)
            elif e > sec * .6 and 'bag' not in did:
                did.add('bag'); seg('가방'); pg.keyboard.press('b'); pg.wait_for_timeout(15000); pg.keyboard.press('Escape'); pg.wait_for_timeout(500)
            elif i % 4 == 3: seg('서 있기'); settle(12)
            else: walk(*pts[i % len(pts)][:2]); seg('걷기'); settle(.5)
            i += 1
    half = MIN * 30
    pg.goto(base + '&zone=space-garden'); pg.evaluate('localStorage.clear()')
    pg.wait_for_function('window.wlZone&&wlZone.cur&&wlZone.cur.spots', timeout=120000); S = pg.evaluate('wlZone.cur.spots')
    stage('space-garden', [S['mortar'], S['neck'], S['shade'], S['scope'], S['rock'], S['bobo'], S['exit']], half, ['have:infinite-space:necklace', 'space:demo'], '보름 할아버지')
    grab(); pg.goto(base + '&zone=space-mars'); pg.wait_for_function('window.wlZone&&wlZone.cur&&wlZone.cur.spots', timeout=120000); M = pg.evaluate('wlZone.cur.spots')
    stage('space-mars', [M['pipiSpot'], M['hill'], M['landW'], M['spawn'], M['secret']], half, ['have:infinite-space:necklace', 'mars:met'], '삐삐')
    grab(); info = pg.evaluate("({dpr:devicePixelRatio,stats:(document.getElementById('stats')||{}).textContent||''})")
    c.close(); b.close()
R = {'tag': TAG, 'dev': 'pc' if PC else 'phone', 'eco': ECO, 'min': MIN, 'errors': errs[:5], 'stats': info['stats'][-400:], 'seg': {}}
tot = dict(t=0, frames=0, busy=0, px=0, calls=0, iv=0, ivn=0, w=0, h=0)
def row(B):
    f = max(1, B['frames']); T = max(1, B['t'])
    return {'초': round(B['t'] / 1000, 1), '그린 프레임': B['frames'], '초당 프레임': round(B['frames'] * 1000 / T, 1), '평균 프레임 간격(ms)': round(B['iv'] / max(1, B['ivn']), 1),
            '프레임당 바쁜 시간(ms)': round(B['busy'] / f, 2), 'GPU 쉬는 비율(%)': round(100 * (1 - B['busy'] / T), 1), '초당 그린 화소(백만)': round(B['px'] / T / 1000, 2),
            '그리는 크기': '%d×%d' % (B.get('w', 0), B.get('h', 0)), '드로우콜 평균': round(B['calls'] / f, 1)}
for k, B in H.items():
    if k == 'load': continue
    R['seg'][k] = row(B)
    for q in tot:
        if q in ('w', 'h'): tot[q] = max(tot[q], B.get(q, 0))
        else: tot[q] += B[q]
R['all'] = row(tot)
fn = os.path.join(OUT, 'heat-%s-%s%s.json' % (TAG, R['dev'], '-eco' if ECO else '')); json.dump(R, open(fn, 'w'), ensure_ascii=False, indent=1)
print(json.dumps(R, ensure_ascii=False, indent=1))
