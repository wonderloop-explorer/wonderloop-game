# -*- coding: utf-8 -*-
"""토성 쉼터(space-saturn) 처음부터 끝까지 자동 플레이 + 촬영 — 도착 대사 → 얼음 고리 던지기(진짜 단추를 눌렀다 뗌) → 앉아서 쉬기 → 발견 카드 → 거꾸리 인사 → 붉은 빛에 끌려 목성 → 지도 → 목성 임시 구역 카드.
   촬영 서버(8000)가 떠 있을 때 저장소 루트에서: python3 tools/space-rest-test.py [--phone] [--out docs/compare/space-rest] [--from toss|rest|card|bye|storm] [--noskip] [--miss]
   --from: 그 단계 앞까지 끝낸 것으로 하고 시작(빨리 찍을 때) · --miss: 첫 뿔을 일부러 두 번 놓침 · 쉬기 장면은 구간마다 찍은 뒤 끝까지 기다림. 소리 끔, 끝나면 닫음."""
import os, sys, time, json
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); A = sys.argv[1:]; PHONE = '--phone' in A
OUT = os.path.join(ROOT, A[A.index('--out') + 1] if '--out' in A else 'docs/compare/space-rest'); os.makedirs(OUT, exist_ok=True)
FROM = A[A.index('--from') + 1] if '--from' in A else None
VW = (390, 844) if PHONE else (1280, 632); TAG = 'phone' if PHONE else 'pc'; W = 'infinite-space'
READY = 'window.wlZone&&wlZone.cur&&window.wlGame&&wlGame.mission.hero()'
ORDER = ['toss', 'rest', 'card', 'bye', 'storm']; FL = {'toss': ['rest:met'], 'rest': ['rest:toss'], 'card': ['rest:sat'], 'bye': ['secret:%s:saturnfloat' % W], 'storm': ['clear:space-saturn']}
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio']); cx = b.new_context(viewport={'width': VW[0], 'height': VW[1]}, device_scale_factor=2, has_touch=PHONE, is_mobile=PHONE); pg = cx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append('console: ' + m.text[:300]) if m.type == 'error' and '404' not in m.text and 'Failed to load resource' not in m.text else None)
    url = 'http://localhost:8000/?world=infinite-space&zone=space-saturn&notitle&quality=%s' % ('mobile' if PHONE else 'high')
    pg.goto(url, wait_until='domcontentloaded'); pg.evaluate('localStorage.clear();localStorage.setItem("wl-help-seen","1")'); pg.reload(wait_until='domcontentloaded'); pg.wait_for_function(READY, timeout=120000); pg.wait_for_timeout(600)
    flags = ['have:%s:necklace' % W, 'meet:%s:geokkuri' % W]
    if FROM:
        for k in ORDER[:ORDER.index(FROM) + 1]: flags += FL[k]
    pg.evaluate("(fl)=>{for(const k of fl)wlGame.state.setFlag(k,true);}", flags); pg.wait_for_timeout(300)
    pg.reload(wait_until='domcontentloaded'); pg.wait_for_function(READY, timeout=120000); T0 = time.time()
    st = lambda: pg.evaluate('wlZone.cur.state()')
    def shot(n): pg.screenshot(path=os.path.join(OUT, '%s-%s.png' % (TAG, n)))
    def until(js, sec=60):
        t0 = time.time()
        while time.time() - t0 < sec:
            try:
                if pg.evaluate('!!(' + js + ')'): return True
            except Exception: pass
            pg.wait_for_timeout(40)
        print('시간 초과:', js[:80]); return False
    dlg = "document.getElementById('wlDlg')&&getComputedStyle(document.getElementById('wlDlg')).display!=='none'&&getComputedStyle(document.getElementById('wlDlg')).visibility!=='hidden'"
    draws = []
    def draw():
        try:
            import re; m = re.search(r'드로우콜 (\d+)회', pg.evaluate("(document.getElementById('stats')||{}).textContent||''")); draws.append(int(m.group(1)) if m else 0)
        except Exception: pass
    res = {'크기': '%dx%d' % VW}
    try:
        if not FROM:
            until("wlGame.dialog.talking&&document.body.innerText.includes('쉬었다 가자')", 30); pg.wait_for_timeout(900); shot('00-intro-line1'); res['첫 대사(초)'] = round(time.time() - T0, 1)
        if not FROM or FROM == 'toss':
            # ── 고리 던지기 ──
            # 놀이 설명 창(한 번) → 닫기(PC는 E, 휴대폰은 '알겠어요')
            until('wlZone.cur.state().how', 60); pg.wait_for_timeout(1900); shot('01-toss-how'); res['설명 창 글'] = pg.evaluate("document.querySelector('#wlTossHow p').textContent")
            if PHONE: pg.locator('#wlTossHow button').tap()
            else: pg.keyboard.press('KeyE')
            until('wlZone.cur.state().toss.on', 60); pg.wait_for_timeout(1200); shot('01-toss-ready'); tt0 = time.time()
            res['던지기 화면'] = pg.evaluate("(()=>{const v=id=>{const e=document.getElementById(id);if(!e)return null;const c=getComputedStyle(e),r=e.getBoundingClientRect();return c.display!=='none'&&c.visibility!=='hidden'?[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)]:false;};return {단추:v('wlToss'),게이지:v('wlTossBar'),조이스틱:v('wlJoy'),점프:v('wlJump'),대쉬:v('wlDash'),화면:[innerWidth,innerHeight]};})()")
            def press():
                if PHONE: pg.evaluate("()=>wlZone.cur.dbgDown()")
                else: pg.keyboard.down('KeyE')
            def release():
                if not PHONE: pg.keyboard.up('KeyE')
            n = 0; missLeft = 2 if '--miss' in A else 0; shots = set()
            while n < 14:
                s = st()['toss']
                if s['ph'] == 'done' or not s['on']: break
                if s['ph'] != 'ready': pg.wait_for_timeout(60); continue
                i = s['i']; lo, hi = s['band']; goal = (lo + hi) / 2 if not missLeft else min(1, hi + .22)
                if missLeft: missLeft -= 1
                press()
                if 'g' not in shots:  # 게이지가 차오르는 모습
                    until('wlZone.cur.state().toss.p>.25', 4); shots.add('g'); shot('01-toss-gauge')
                if 'hot%d' % i not in shots:  # 뿔마다: 게이지 칸이 동그란 표시 위에 온 순간
                    shots.add('hot%d' % i); until('wlZone.cur.state().hot', 5); shot('01-toss-hot-%d' % (i + 1)); res.setdefault('맞는 세기 범위(뿔마다)', []).append([round(v, 3) for v in s['band']])
                # 떼는 순간은 페이지 안에서(프레임마다 게이지를 보고) — 밖에서 값을 읽고 떼면 느린 헤드리스에서는 그사이 게이지가 지나간다
                pg.evaluate("""(goal)=>new Promise(r=>{const t0=performance.now(),f=()=>{const p=wlZone.cur.state().toss.p;if(Math.abs(p-goal)<.025||performance.now()-t0>9000){wlZone.cur.dbgUp();r();}else requestAnimationFrame(f);};f();})""", goal)
                release(); n += 1
                until("wlZone.cur.state().toss.ph==='fly'", 2); pg.wait_for_timeout(700)
                if 'f%d' % i not in shots: shots.add('f%d' % i); shot('01-toss-fly-%d' % (i + 1))
                until("['drop','slide','wait','ready','done'].includes(wlZone.cur.state().toss.ph)", 6); pg.wait_for_timeout(260)
                ph = st()['toss']['ph']
                if ph == 'drop' and 'h%d' % i not in shots: shots.add('h%d' % i); shot('01-toss-hit-%d' % (i + 1)); res.setdefault('걸린 순간 할 일 글', []).append(pg.evaluate("(document.getElementById('wlQuest')||{}).innerText||''"))
                if ph == 'slide' and 'm' not in shots: shots.add('m'); shot('01-toss-miss')
                until("['ready','done'].includes(wlZone.cur.state().toss.ph)", 6)
            s = st()['toss']; res['던지기'] = {'던진 횟수': s['n'], '놓침': s['miss'], '기록(뿔, 세기, 걸림)': s['log'], '걸린 시간(초)': round(time.time() - tt0, 1)}
            pg.wait_for_timeout(1500); shot('01-toss-clear'); until("document.body.innerText.includes('다 걸었다')", 20); pg.wait_for_timeout(700); shot('01-toss-line')
        if not FROM or FROM in ('toss', 'rest'):
            # ── 쉬기 ──
            until('wlZone.cur.state().rest.on', 60); tr0 = time.time(); ui = None
            for n, t in (('1a-two', 2), ('1b-saturn', 8), ('1c-ring', 13.5), ('2-field', 28), ('2b-field', 33), ('3-bands', 44), ('3b-bands', 48), ('4a-rise', 54), ('4-hexagon', 62), ('5-enceladus', 77), ('6-titan', 92), ('7a-moons', 104), ('7a2-moons', 108), ('7b-down', 112), ('7c-two', 115.4)):
                until('wlZone.cur.state().rest.t>=%s' % t, 200); shot('02-rest-%s' % n); draw()
                if t == 13.5:
                    if PHONE: pg.touchscreen.tap(200, 300)
                    else: pg.mouse.click(400, 300)
                    pg.wait_for_timeout(300); res['건너뛰기 단추(10초 뒤 누르면)'] = pg.evaluate("!!document.getElementById('wlRestSkip')")
                    if '--skip' in A: pg.evaluate("document.getElementById('wlRestSkip').click()"); break
                if ui is None: ui = pg.evaluate("(()=>{const v=id=>{const e=document.getElementById(id);if(!e)return null;const c=getComputedStyle(e);return c.display!=='none'&&c.visibility!=='hidden'&&+c.opacity>0.05;};return {joy:v('wlJoy'),act:v('wlAct'),quest:v('wlQuest'),hud:v('wlHud'),menu:v('wlMenu'),dlg:v('wlDlg'),toss:v('wlToss')};})()")
            res['쉬는 동안 보이는 화면 표시'] = ui
            res['나레이션 [번호, 시작 초]'] = st()['rest']['narr']
            until('!wlZone.cur.state().rest.on', 60); res['쉬기(초)'] = round(time.time() - tr0, 1)
        if not FROM or FROM in ('toss', 'rest', 'card'):
            until("document.body.innerText.includes('욕조에 넣으면')", 40); pg.wait_for_timeout(900); shot('03-card-line')
            until("document.body.innerText.includes('물보다 가벼워요')", 40); pg.wait_for_timeout(900); shot('03-card'); draw()
        if not FROM or FROM != 'storm':
            until("document.body.innerText.includes('거기서 또 만나')", 60); pg.wait_for_timeout(900); shot('04-bye-line')
            until('wlZone.cur.state().T.bye!=null', 30)
            for n, d in (('1-boat-in', 2.2), ('2-wave-side', 5.3), ('3-wave-far', 6.2), ('4-hero-front', 8.3)): # 게임 시계(헤드리스는 실제보다 느리게 돎)
                until('wlZone.cur.state().t-wlZone.cur.state().T.bye>=%s' % d, 60); shot('04-bye-%s' % n)
            until('wlZone.cur.state().T.clear!=null', 30); pg.wait_for_timeout(450); shot('04-done-hop'); until("document.body.innerText.includes('쉼터 완료')", 10); pg.wait_for_timeout(700); shot('04-done-card'); until('wlZone.cur.state().T.doneCard!=null', 30)
        else:
            pg.wait_for_timeout(2500); shot('05-portal'); pg.evaluate('wlZone.cur.dbgStorm()')
        # ── 붉은 빛 → 목성 ──
        until('wlZone.cur.state().dep!=null', 30); ts0 = time.time(); T = st()['T']; res['쉼터 단계 시각(게임 초)'] = T; res['쉼터 전체(게임 초 — 구역을 연 뒤 ~ 붉은 빛이 내려옴)'] = round(T.get('storm', 0) - T.get('start', 0), 1) if T.get('storm') else None; until('wlZone.cur.state().t-wlZone.cur.state().T.storm>=1.5', 30); shot('05-storm-0-come')
        until("wlZone.cur.state().dep==='pull'", 20); shot('05-storm-1-pull')
        for u, n in ((.05, '2-lift'), (.2, '3-down'), (.28, '3-down2'), (.46, '4-side'), (.6, '5a-turn'), (.66, '5b-face'), (.72, '5c-far'), (.8, '5d-in'), (.88, '6-jupiter'), (.95, '7-jupiter'), (.995, '8-jupiter')):
            until('wlZone.cur.state().sailU>=%s' % u, 40); shot('05-storm-%s' % n); draw()
        until("!!document.getElementById('wlTravelMap')", 20); c0 = pg.evaluate('performance.now()'); pg.wait_for_timeout(1500); shot('06-map'); pg.wait_for_timeout(1300); shot('06-map-2')  # 지도는 약 4초(실제 시간) — 발자국이 찍히는 중간과 다 찍힌 때
        until("wlZone.cur&&wlZone.cur.name==='붉은 폭풍'", 30); pg.wait_for_timeout(1700); shot('07-jupiter-arrive')
        until('wlZone.cur.state().carded', 40); pg.wait_for_timeout(1200); shot('07-jupiter-card'); res['붉은 빛 → 목성 카드(초)'] = round(time.time() - ts0, 1)
        try: res['이동 음악'] = pg.evaluate('(()=>{const l=wlGame.travel.log&&wlGame.travel.log();return l?{resolve:l.resolveAt,land:l.landAt,diff:l.diff,fix:l.fix}:null})()')
        except Exception: pass
    finally:
        res['전체(실제 초 — 헤드리스는 느림)'] = round(time.time() - T0, 1); res['그리기(찍은 때)'] = draws
        try: res['단계 시각'] = st().get('T')
        except Exception: pass
        res['오류'] = errs[:8]; print(json.dumps(res, ensure_ascii=False, indent=1))
        json.dump(res, open(os.path.join(OUT, '%s-result%s.json' % (TAG, '-' + FROM if FROM else '')), 'w', encoding='utf-8'), ensure_ascii=False, indent=1); b.close()
