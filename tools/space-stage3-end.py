# -*- coding: utf-8 -*-
"""STAGE 3 끝부분만 빠르게 확인(2026-11-21) — 문지기까지 끝난 것으로 저장을 맞춰 열고: 구름 끝(비행선·발견 카드 → 대사 → 얼음 배) → 비행 → 우주 지도 → 토성 도착.
   촬영 서버(8000)가 떠 있을 때 저장소 루트에서: python3 tools/space-stage3-end.py [--pc] [--out docs/compare/space-stage3-end] [--plaza]
   --plaza: 광장 서쪽 출구 발견 카드와 초 꽂기 구도도(해돋이까지 끝난 저장 / 초 셋을 잡은 저장으로 따로 열어서). 결과: 촬영 + 뒷모습 시간(초). 소리 끔, 끝나면 닫음."""
import os, sys, time, json
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); A = sys.argv[1:]; PC = '--pc' in A
OUT = os.path.join(ROOT, A[A.index('--out') + 1] if '--out' in A else 'docs/compare/space-stage3-end'); os.makedirs(OUT, exist_ok=True)
VW = (1280, 632) if PC else (390, 844); TAG = 'pc' if PC else 'phone'
URL = 'http://localhost:8000/?world=infinite-space&zone=space-venus&notitle&quality=%s' % ('high' if PC else 'mobile')
ALL = ['venus:met', 'venus:ask', 'venus:c1', 'venus:c2', 'venus:c3', 'venus:ddo', 'secret:infinite-space:venusday', 'venus:town', 'venus:sheep', 'venus:sunrise', 'venus:plaza', 'secret:infinite-space:venussun', 'venus:gate']
def run(p, flags, fn):
    b = p.chromium.launch(args=['--mute-audio']); cx = b.new_context(viewport={'width': VW[0], 'height': VW[1]}, device_scale_factor=2, has_touch=not PC, is_mobile=not PC); pg = cx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL, wait_until='domcontentloaded'); pg.evaluate('localStorage.clear();localStorage.setItem("wl-help-seen","1")'); pg.reload(wait_until='domcontentloaded')
    pg.wait_for_function('window.wlZone&&wlZone.cur&&window.wlGame&&wlGame.mission.hero()', timeout=120000); pg.wait_for_timeout(2500)
    pg.evaluate("async(fl)=>{for(const k of ['meet:infinite-space:geokkuri','meet:infinite-space:ddo','meet:infinite-space:munge',...fl])wlGame.state.setFlag(k,true);try{wlGame.profile.found&&['geokkuri','ddo','munge'].forEach(i=>wlGame.profile.found(i));}catch(e){}}", flags); pg.wait_for_timeout(400); pg.reload(wait_until='domcontentloaded'); pg.wait_for_function('window.wlZone&&wlZone.cur&&window.wlGame&&wlGame.mission.hero()', timeout=120000); pg.wait_for_timeout(3000)  # 저장한 뒤 다시 열어 그 상태로 구역을 만듦
    try: fn(pg)
    finally:
        if errs: print('오류', errs[:3])
        b.close()
def helpers(pg):
    st = lambda: pg.evaluate('wlZone.cur.state()')
    def shot(n): pg.screenshot(path=os.path.join(OUT, '%s-%s.png' % (TAG, n)))
    def until(js, sec=30):
        t0 = time.time()
        while time.time() - t0 < sec:
            try:
                if pg.evaluate('!!(' + js + ')'): return True
            except Exception: pass
            pg.wait_for_timeout(80)
        print('시간 초과:', js[:60]); return False
    def walk(x, z, sec=30, r=.7):
        t0 = time.time()
        while time.time() - t0 < sec:
            h = pg.evaluate('(()=>{const p=wlGame.mission.hero().position;return [p.x,p.z]})()')
            if ((h[0] - x) ** 2 + (h[1] - z) ** 2) ** .5 < r or st().get('scene'): return
            pg.evaluate('([x,z])=>wlGame.mission.hero().userData.walkTo(x,z)', [x, z]); pg.wait_for_timeout(200)
    return st, shot, until, walk
def end(pg):
    st, shot, until, walk = helpers(pg); S = pg.evaluate('wlZone.cur.spots'); R = {}
    walk(S['end'][0] + 1.5, S['end'][1], 60, .6); until('wlZone.cur.state().T.end', 20)
    until('wlZone.cur.state().T.look', 40); shot('41-look-airship'); until("document.getElementById('wlStrip').classList.contains('on')", 10); pg.wait_for_timeout(1300); shot('41-card2-airship')
    until('wlZone.cur.state().T.card2', 30); pg.wait_for_timeout(1500); shot('42-end-talk'); until('wlZone.cur.state().clear', 40); pg.wait_for_timeout(900); shot('43-clear')
    until('wlZone.cur.state().aboard', 40); pg.wait_for_timeout(900); shot('44-boat-aboard'); until('wlZone.cur.state().T.sail', 20)
    t0 = time.time(); sh = [(2.2, '45-boat-rise'), (4.6, '46-fly0'), (6.2, '46-fly1'), (8.2, '47-fly2'), (10.0, '47-fly3'), (11.5, '48-fly4'), (13.0, '48-fly5'), (14.2, '49-fly6'), (16.2, '4a-saturn-big'), (18.9, '4b-map'), (20.6, '4c-map-steps')]; back = 0; lastb = None; hid = 0; n = 0
    while time.time() - t0 < 60:
        if pg.evaluate('!!(wlZone.cur&&wlZone.cur.spots&&wlZone.cur.spots.dock)'): break
        el = time.time() - t0
        if sh and el >= sh[0][0]: shot(sh.pop(0)[1])
        try: bk = pg.evaluate("(()=>{const W=wlGame.mission.hero(),c=wlGame.view.camera;if(!W||!c||!wlZone.cur.state().sailing)return null;const a=Math.atan2(c.position.x-W.position.x,c.position.z-W.position.z);let d=a-W.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));return Math.abs(d)>2.0})()")
        except Exception: bk = None
        now = time.time()
        if bk and lastb is not None and el < 17.5: back += now - lastb
        lastb = now; pg.wait_for_timeout(60)
    R['얼음 배 비행 중 뒷모습(초)'] = round(back, 2); R['카메라 마디(비행 진행)'] = None
    pg.wait_for_timeout(1500); shot('50-saturn-arrive'); pg.wait_for_timeout(1200); shot('50b-saturn-down'); until('wlZone.cur.state().T.land', 15); pg.wait_for_timeout(1150); shot('50c-saturn-hop')
    until('wlZone.cur.state().T.free', 15); pg.wait_for_timeout(1400); shot('51-saturn-look'); until('wlZone.cur.state().done', 30); pg.wait_for_timeout(600); shot('52-saturn-field')
    try: R['이동 기록'] = {k: v for k, v in pg.evaluate('wlGame.travel.log()').items() if k in ('err', 'ahead', 'fix', 'resolveMinusLand')}
    except Exception: pass
    print(json.dumps(R, ensure_ascii=False, indent=1))
def plaza(pg):
    st, shot, until, walk = helpers(pg); S = pg.evaluate('wlZone.cur.spots'); c = S['plaza']['c']
    pg.wait_for_timeout(800); walk(c[0] - .5, c[1] + 2.8, 20, .5); walk(c[0] - 11, c[1], 20, .5); until('wlZone.cur.state().plaza', 8)
    until("document.getElementById('wlStrip').classList.contains('on')", 30); pg.wait_for_timeout(1300); shot('28-plaza-card')
def cake(pg):
    st, shot, until, walk = helpers(pg); S = pg.evaluate('wlZone.cur.spots')
    pg.evaluate("([x,z])=>{const W=wlGame.mission.hero();W.position.set(x,0,z);}", [S['cake'][0] - 3, S['cake'][1] + 1.5]); pg.wait_for_timeout(600)
    walk(S['cake'][0] - 1.0, S['cake'][1] + .75, 25, .5); pg.wait_for_timeout(500)
    if PC: pg.keyboard.press('e')
    else: pg.evaluate("document.getElementById('wlAct')&&document.getElementById('wlAct').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}))"); pg.keyboard.press('e')
    until('wlZone.cur.state().T.stuck', 12); pg.wait_for_timeout(1300); shot('0b-three'); until('wlZone.cur.state().T.candle', 20); pg.wait_for_timeout(1300); shot('0c-candle-card')
with sync_playwright() as p:
    if '--plaza' in A:
        run(p, ALL[:6], cake); run(p, ALL[:10], plaza)
    else: run(p, ALL, end)
print('ok', OUT)
