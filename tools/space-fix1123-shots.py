# -*- coding: utf-8 -*-
"""2026-11-23 두 번째 고침 확인 촬영 — 보름 할아버지 두 귀 · 또생일이 날아가는 장면과 파티장 · 우산이 발판으로 날아가는 장면 · 금성을 떠나 하늘로 · 토성에 다가감.
   촬영 서버(8000)가 떠 있을 때 저장소 루트에서: python3 tools/space-fix1123-shots.py [--pc] [--out docs/compare/fix1123b] <--bobo|--ddo|--sail>
   소리 끔, 끝나면 닫음."""
import os, sys, time
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); A = sys.argv[1:]; PC = '--pc' in A
OUT = os.path.join(ROOT, A[A.index('--out') + 1] if '--out' in A else 'docs/compare/fix1123b'); os.makedirs(OUT, exist_ok=True)
VW = (1280, 632) if PC else (390, 844); TAG = 'pc' if PC else 'phone'; W = 'infinite-space'
READY = 'window.wlZone&&wlZone.cur&&window.wlGame&&wlGame.mission.hero()'
def run(p, zone, flags, fn, q=''):
    url = 'http://localhost:8000/?world=infinite-space&zone=%s&notitle&quality=%s%s' % (zone, 'high' if PC else 'mobile', q)
    b = p.chromium.launch(args=['--mute-audio']); cx = b.new_context(viewport={'width': VW[0], 'height': VW[1]}, device_scale_factor=2, has_touch=not PC, is_mobile=not PC); pg = cx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(url, wait_until='domcontentloaded'); pg.evaluate('localStorage.clear();localStorage.setItem("wl-help-seen","1")'); pg.reload(wait_until='domcontentloaded'); pg.wait_for_function(READY, timeout=120000); pg.wait_for_timeout(2000)
    pg.evaluate("(fl)=>{for(const k of fl)wlGame.state.setFlag(k,true);try{['geokkuri','ddo','munge','bobo'].forEach(i=>wlGame.profile.found&&wlGame.profile.found(i));}catch(e){}}", flags); pg.wait_for_timeout(400)
    pg.reload(wait_until='domcontentloaded'); pg.wait_for_function(READY, timeout=120000); pg.wait_for_timeout(3500); pg.keyboard.press('ArrowLeft'); pg.wait_for_timeout(300)
    try: fn(pg)
    finally:
        if errs: print('오류', errs[:3])
        b.close()
def H(pg):
    st = lambda: pg.evaluate('wlZone.cur.state()')
    def shot(n): pg.screenshot(path=os.path.join(OUT, '%s-%s.png' % (TAG, n)))
    def until(js, sec=30):
        t0 = time.time()
        while time.time() - t0 < sec:
            try:
                if pg.evaluate('!!(' + js + ')'): return True
            except Exception: pass
            pg.wait_for_timeout(50)
        print('시간 초과:', js[:70]); return False
    def walk(x, z, sec=30, r=.6):
        t0 = time.time()
        while time.time() - t0 < sec:
            h = pg.evaluate('(()=>{const p=wlGame.mission.hero().position;return [p.x,p.z]})()')
            if ((h[0] - x) ** 2 + (h[1] - z) ** 2) ** .5 < r: return
            pg.evaluate('([x,z])=>wlGame.mission.hero().userData.walkTo(x,z)', [x, z]); pg.wait_for_timeout(200)
    def tp(x, z): pg.evaluate("([x,z])=>{const W=wlGame.mission.hero();W.position.set(x,0,z);}", [x, z]); pg.wait_for_timeout(900)
    return st, shot, until, walk, tp
def bobo(pg):
    """보름 할아버지 앞모습(두 귀) — 앞·살짝 옆 두 장"""
    st, shot, until, walk, tp = H(pg)
    for n, off in (('01-bobo-front', 0), ('01-bobo-front34', .5)):
        pg.evaluate("""(off)=>{let r=wlGame.mission.hero();while(r.parent)r=r.parent;let b=null;r.traverse(o=>{if(o.name==='bobo')b=o;});const p=b.position,a=b.rotation.y+off,W=wlGame.mission.hero();
          W.position.set(p.x-Math.cos(b.rotation.y)*1.6,0,p.z+Math.sin(b.rotation.y)*1.6);wlGame.ui.setHints(false);
          wlGame.view.hold(()=>({at:[p.x,p.y+1.05,p.z],from:[p.x+Math.sin(a)*3.1,p.y+1.25,p.z+Math.cos(a)*3.1]}),{snap:true});}""", off)
        pg.wait_for_timeout(1800); shot(n)
def ddo(pg):
    """또생일: 날아가는 장면 3장 · 우산이 발판으로 날아가는 3장 · 초를 다 잡고 파티장에 갔을 때"""
    st, shot, until, walk, tp = H(pg); S = pg.evaluate('wlZone.cur.spots'); d = S['ddo0']
    tp(d[0] - 5.5, d[1] + 3.2); walk(d[0] - 1.8, d[1] + 1.2, 12, .5)
    until('wlZone.cur.state().ddoFly', 90); k = 0; t0 = time.time()
    while st().get('ddoFly') and time.time() - t0 < 20:
        if k < 4: shot('02-ddo-fly-%d' % k); k += 1
        pg.wait_for_timeout(350)
    print('날아간 직후 또생일 자리', st().get('ddoAt'), '(파티장 단상', S['sec'], ')')
    for i, h in enumerate((.18, .5, .82)):
        until('wlZone.cur.state().umbHop>=%s' % h, 15); shot('03-umb-%d' % i)
    until('wlZone.cur.state().umbHop>=1', 10); pg.wait_for_timeout(500); shot('03-umb-3-landed'); print('우산 뒤 또생일 자리', st().get('ddoAt'))
    until("wlZone.cur.state().T.ask", 20)
    # 초 셋을 잡은 것으로 하고 파티장으로
    pg.evaluate("()=>{['venus:c1','venus:c2','venus:c3'].forEach(k=>wlGame.state.setFlag(k,true));}"); L = S['land']; tp(L[0] + 6, L[1] + 1.2); pg.wait_for_timeout(600); walk(L[0] + 1.6, L[1] + .4, 12, .5); pg.wait_for_timeout(1500)
    print('파티장에서 또생일 자리·보임', st().get('ddoAt')); shot('02-ddo-party')
def sail(pg):
    """끝낸 뒤 '얼음 배 타기'로 다시 떠남 → 금성을 떠나 하늘로(연속) → 토성에 다가감(연속)"""
    st, shot, until, walk, tp = H(pg); S = pg.evaluate('wlZone.cur.spots'); e = S['end']
    tp(e[0] + 3, e[1]); walk(e[0] - 1.0, e[1], 15, .5); pg.wait_for_timeout(800)
    pg.evaluate('wlZone.cur.dbgSail()')
    marks = [('pre', None, '04-leave-0-pre')] + [(u, None, n) for u, n in ((.05, '04-leave-1'), (.13, '04-leave-2'), (.2, '04-leave-3'), (.27, '04-leave-4'), (.33, '04-leave-5'), (.38, '04-leave-6'), (.44, '04-leave-7'), (.5, '05-saturn-0'), (.58, '05-pass-0'), (.64, '05-pass-1'), (.7, '05-pass-2'), (.78, '05-saturn-1'), (.86, '05-saturn-2'), (.92, '05-saturn-3'), (.97, '05-saturn-4'), (.995, '05-saturn-5'))]
    until('wlZone.cur.state().sailPre>.6', 60); shot(marks[0][2]); log = []
    for u, _, n in marks[1:]:
        if not until('wlZone.cur.state().sailU>=%s' % u, 60): break
        shot(n); s = st(); log.append((n, s.get('sailU')))
    print('찍은 때(이름, 진행)', log)
    pg.wait_for_timeout(2500); shot('06-map');
with sync_playwright() as p:
    if '--bobo' in A: run(p, 'space-garden', ['have:%s:necklace' % W, 'space:demo', 'meet:%s:bobo' % W], bobo, '&weather=starlight')
    if '--ddo' in A: run(p, 'space-venus', ['venus:met', 'meet:%s:geokkuri' % W, 'meet:%s:ddo' % W], ddo)
    if '--sail' in A: run(p, 'space-venus', ['venus:met', 'venus:ask', 'venus:c1', 'venus:c2', 'venus:c3', 'venus:ddo', 'secret:%s:venusday' % W, 'venus:town', 'venus:sheep', 'venus:sunrise', 'venus:plaza', 'secret:%s:venussun' % W, 'venus:gate', 'clear:space-venus', 'meet:%s:geokkuri' % W, 'meet:%s:ddo' % W, 'meet:%s:munge' % W], sail)
print('ok', OUT)
