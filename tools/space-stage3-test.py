# -*- coding: utf-8 -*-
"""무한 우주 STAGE 3 구름 행성(금성) 처음부터 끝까지 (2026-11-19 흐름) — 촬영 서버(8000)가 떠 있을 때 저장소 루트에서:
   python3 tools/space-stage3-test.py [--out docs/compare/space-stage3] [--phone] [--wrong] [--clumsy] [--fast] [--wide]
   주소로 바로 열되 내려앉는 연출부터(?arrive): ① 도착 → ② 거꾸리 → ③ 또생일 부탁 → ④ 바람 타고 생일 초 잡기(조이스틱 대신 WASD로 초 쪽으로 조종) → ⑤ 케이크에 초 꽂기·촛불(발견 카드 3)
   → ⑥ 해시계 마을(걸으며 구경) → ⑦ 서쪽 해돋이 광장(발견 카드 1) → ⑧ 뭉게 문지기(코 골 때만 걷고 미리 알림이 오면 멈춤) → ⑨ 구름 끝(얼음 배 · 발견 카드 2 · 지도 카드 · STAGE 3 완료)
   → ⑩ 얼음 배 출발 → 토성 고리 임시 얼음 섬('다음 이야기 준비 중').
   처음 하는 사람처럼: 장면 대사는 넘기지 않고 기다림, 친구 카드는 2.5초 뒤 닫음. --fast: 망설임 없이.
   --wrong: 광장에서 동쪽·남쪽 출구로 한 번씩 틀림 + 바람 타기 첫 번째는 조종하지 않음(초를 놓쳐 다시 탐) / --clumsy: 문지기가 눈을 떠도 계속 걸음('!' 밀려남) / --wide: 마을 전경 두 장(시간 재기에는 쓰지 않음)
   단계 화면을 <out>/<phone|pc>-*.png, 결과 JSON <out>/<phone|pc>-result.json. 소리 끔, 끝나면 닫음."""
import json, os, re, sys, time
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
A = sys.argv[1:]; PHONE = '--phone' in A; WRONG = '--wrong' in A; CLUMSY = '--clumsy' in A; SECRET = '--secret' in A; WIDE = '--wide' in A; HES = 0 if '--fast' in A else 6  # --fast: 망설임 없이(가장 빠른 길)
OUT = os.path.join(ROOT, A[A.index('--out') + 1] if '--out' in A else 'docs/compare/space-stage3'); os.makedirs(OUT, exist_ok=True)
pre = ('phone-' if PHONE else 'pc-') + ('wrong-' if WRONG or CLUMSY else ''); R = {'dev': pre[:-1]}
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio', '--autoplay-policy=no-user-gesture-required', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'])
    o = dict(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True) if PHONE else dict(viewport={'width': 1280, 'height': 720})
    c = b.new_context(**o); c.route('**/*fonts.g*/**', lambda r: r.abort()); pg = c.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:300])); pg.on('console', lambda m: errs.append(m.text[:300]) if m.type == 'error' and 'Failed to load' not in m.text else None)
    if os.environ.get('WL_INIT'): c.add_init_script(open(os.path.join(ROOT, os.environ['WL_INIT'])).read())
    U = 'http://localhost:8000/?world=infinite-space&zone=space-venus&notitle&arrive' + ('&quality=mobile' if PHONE else '')
    pg.goto(U, wait_until='domcontentloaded', timeout=90000); pg.evaluate('localStorage.clear();localStorage.setItem("wl-help-seen","1")'); pg.reload(wait_until='domcontentloaded')
    pg.wait_for_function('window.wlZone&&wlZone.cur&&wlZone.cur.spots&&wlZone.cur.state', timeout=120000)
    S = pg.evaluate('wlZone.cur.spots'); st = lambda: pg.evaluate('wlZone.cur.state()'); shot = lambda n: pg.screenshot(path=os.path.join(OUT, pre + n + '.png'))
    hero = lambda: pg.evaluate("(()=>{const P=wlGame.mission.hero().position;return [P.x,P.z]})()")
    card = lambda: pg.evaluate('wlGame.ui.cardShown()||""'); dlg = lambda: pg.evaluate("(()=>{const d=document.getElementById('wlDlg');return d.style.display==='block'?d.querySelector('.who').textContent+'|'+d.querySelector('.line').textContent:''})()")
    lines = []; draws = []; byst = {}
    def note():
        t = dlg()
        if t and (not lines or lines[-1] != t): lines.append(t)
        m = re.search(r'드로우콜 (\d+)회.*?삼각형 ([\d,]+)개', pg.evaluate("(document.getElementById('stats')||{}).textContent||''"))
        if m:
            draws.append([int(m.group(1)), int(m.group(2).replace(',', ''))])
            try: sg = pg.evaluate("(()=>{const s=wlZone.cur.state();return s.sailing?'sail':s.ride?'ride':(s.stage||'saturn')})()")
            except Exception: sg = '?'
            byst[sg] = max(byst.get(sg, 0), int(m.group(1)))
    def idle(ms=250):
        note()
        if card() == 'profile': pg.wait_for_timeout(2500); pg.evaluate("(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.offsetParent&&b.textContent.includes('가방에 넣기'));if(b)b.click();})()"); pg.wait_for_timeout(600)
        pg.wait_for_timeout(ms)
    def until(js, sec=60):
        t = time.time()
        while time.time() - t < sec:
            if pg.evaluate(js): return True
            idle()
        return False
    free = "(()=>{const s=wlZone.cur.state();return !s.scene&&!s.carry&&!s.ride&&!wlGame.ui.cardShown()&&!wlGame.core.blocking()&&document.getElementById('wlDlg').style.display!=='block'})()"
    def look(dx, dz, pitch=.5): pg.evaluate("([dx,dz,p])=>{const C=wlGame.controls.input.cam;C.yaw=Math.atan2(-dx,-dz);C.pitch=p;}", [dx, dz, pitch])
    def walk(x, z, sec=30, near=.5):
        pg.evaluate("([x,z])=>wlGame.mission.hero().userData.walkTo(x,z)", [x, z]); t = time.time()
        while time.time() - t < sec:
            h = hero(); s = st()
            if ((h[0] - x) ** 2 + (h[1] - z) ** 2) ** .5 < near or s['scene'] or s['carry'] or s.get('ride'): break
            if not pg.evaluate('wlGame.mission.hero().userData.isWalking()'): pg.evaluate("([x,z])=>wlGame.mission.hero().userData.walkTo(x,z)", [x, z])
            idle(120)
    # ① 도착 → ② 거꾸리
    until("wlZone.cur.state().arrDone", 40); pg.wait_for_timeout(1500); shot('01-arrive')
    until("!!wlZone.cur.state().T.gg", 60); pg.wait_for_timeout(1600); shot('02-geokkuri-backward')
    until("(document.getElementById('wlDlg').style.display==='block')", 20); pg.wait_for_timeout(1500); shot('03-geokkuri-talk')
    until("wlZone.cur.state().met&&" + free, 80); pg.wait_for_timeout(600); shot('04-guide')
    # ③ 또생일 부탁(다가가면 저절로)
    walk(S['ddo0'][0] - 2.6, S['ddo0'][1] + 1.2, 20, .6); until("!!wlZone.cur.state().T.ask0", 8); pg.wait_for_timeout(1600); shot('05-ddo-ask')
    until("wlZone.cur.state().ddoFly", 30); pg.wait_for_timeout(900); shot('06-ddo-flies-ahead'); pg.wait_for_timeout(800); shot('06a-ddo-flies-ahead2')
    until("wlZone.cur.state().ask&&" + free, 40); pg.wait_for_timeout(500); shot('06b-umbrella-on-pad')
    # ④ 바람 타고 생일 초 잡기 — 다음 초 쪽으로 WASD(왼쪽·오른쪽·위·아래)
    KEYS = {'KeyA': False, 'KeyD': False, 'KeyW': False, 'KeyS': False}
    def key(k, on):
        if KEYS[k] != on: (pg.keyboard.down if on else pg.keyboard.up)(k); KEYS[k] = on
    rides = 0; shots = set()
    tries = 0
    while st()['cand'] < 3 and rides < 4 and tries < 8:
        tries += 1
        until(free, 20); pad = S['pad']; walk(pad[0] - 2.4, pad[1] - .6, 25, .5); walk(pad[0], pad[1], 25, .3)
        if not until("!!wlZone.cur.state().ride", 12): continue  # 아직 출발 전이면 다시(조종 없이 지나가 버리지 않게)
        rides += 1; steer = not (WRONG and rides == 1); t0 = time.time(); pg.evaluate('(v)=>wlZone.cur.dbgMiss(v)', not steer)  # --wrong 첫 비행: 초를 일부러 놓침(지금은 조종하지 않아도 거의 다 잡혀서)
        if rides == 1: pg.wait_for_timeout(450); shot('07-ride-spin'); pg.wait_for_timeout(1000); shot('07-ride-start')
        if rides == 2: pg.wait_for_timeout(450); shot('07b-retry-spin-front'); pg.wait_for_timeout(350); shot('07c-retry-spin2')
        marks = [.18, .4, .62, .8, .92, .985] if rides == 1 else []
        while time.time() - t0 < 40:
            s = st(); r = s['ride']
            if not r: break
            if steer and r['next'] >= 0 and r['du'] < .2:
                dl = r['need'][0] - r['lat']; du = r['need'][1] - r['up']
                key('KeyD', dl > .12); key('KeyA', dl < -.12); key('KeyW', du > .12); key('KeyS', du < -.12)
                if r['du'] < .075 and ('c%d' % r['next']) not in shots and steer: shots.add('c%d' % r['next']); shot('08-ride-candle%d' % (r['next'] + 1))
            else:
                for k in KEYS: key(k, False)
            if marks and r['u'] >= marks[0]: shot('08a-ride-u%02d' % round(marks.pop(0) * 100))
            if 'umb%d' % rides not in shots and r['u'] > .3 and not PHONE:  # 우산 쥔 모습: 카메라를 잠깐 앞·옆으로
                shots.add('umb%d' % rides)
                for nm, yw in (('front', 3.1416), ('front34', 2.4), ('side', 1.5708)):
                    pg.evaluate('([y,d])=>wlZone.cur.dbgCam(y,d)', [yw, 4.2]); pg.wait_for_timeout(420); shot('08u-umbrella-%s-%d' % (nm, rides)); R['우산(손-머리 축 거리·기울기·손 높이)'] = st().get('umb')
                pg.evaluate('wlZone.cur.dbgCam(0,0)')
            note(); pg.wait_for_timeout(60)
        for k in KEYS: key(k, False)
        pg.wait_for_timeout(260); shot('09-ride-turn%d' % rides); until("!wlZone.cur.state().ride", 5); pg.wait_for_timeout(450); shot('09-ride-end%d' % rides); pg.wait_for_timeout(450); shot('09-ride-end%d-b' % rides)
        if st()['cand'] < 3: until("wlZone.cur.state().carry", 6); pg.wait_for_timeout(1500); shot('09a-carry-back%d' % rides); until(free, 12)
    R['바람 타기 횟수'] = rides; R['잡은 초'] = st()['cand']
    # ⑤ 케이크에 초 꽂기 → 촛불 → 생일 노래 → 발견 카드
    until(free, 20); walk(S['cake'][0] - 1.0, S['cake'][1] + .75, 25, .5); pg.wait_for_timeout(500); shot('0a-ddo-table'); pg.keyboard.press('e'); until("!!wlZone.cur.state().T.cake", 8); pg.wait_for_timeout(420); shot('0b-candles-fly'); pg.wait_for_timeout(350); shot('0b-candles-fly2'); until("!!wlZone.cur.state().T.stuck", 8); pg.wait_for_timeout(1200); shot('0b-candles-lit'); until("!!wlZone.cur.state().T.blow", 12); pg.wait_for_timeout(250); shot('0b-ddo-blows')
    until("!!wlZone.cur.state().T.candle", 20); pg.wait_for_timeout(1200); shot('0c-candle-card'); until("wlZone.cur.state().day&&" + free, 25)
    # ⑥ 해시계 마을: 거꾸리를 따라 걸으며 구경(할 일 없음)
    def sheep_game():  # 구름 양 몰기: 아직 밖에 있는 양의 뒤(울타리 문 반대쪽)로 걸어가 문 쪽으로 몰기 — 다섯 마리
        pg.wait_for_timeout(1600); shot('15-sheep-intro'); until("wlZone.cur.state().sheep.on", 25); t0 = time.time(); seen = set(); gp = S['glade']['gate']; pen = S['glade']['pen']; cur = None
        while time.time() - t0 < 150:
            s = st(); g = s['sheep']; note()
            if g['done']: break
            if s['scene']: pg.wait_for_timeout(100); continue
            out = [q for q in g['list'] if not q[2]]
            if not out: pg.wait_for_timeout(100); continue
            h = hero()
            if cur is None or cur >= len(g['list']) or g['list'][cur][2]: cur = min(range(len(g['list'])), key=lambda i: 1e9 if g['list'][i][2] else (g['list'][i][0] - gp[0]) ** 2 + (g['list'][i][1] - gp[1]) ** 2)  # 문에서 가까운 양부터 한 마리씩
            x, z, _ = g['list'][cur]; dx = x - gp[0]; dz = z - gp[1]; d = (dx * dx + dz * dz) ** .5 or 1
            if d < 2.2: dx = x - pen[0]; dz = z - pen[1]; d = (dx * dx + dz * dz) ** .5 or 1  # 문 앞: 우리 가운데 반대쪽에서 밀기
            tx = x + dx / d * 1.5; tz = z + dz / d * 1.5
            pg.evaluate("([x,z])=>wlGame.mission.hero().userData.walkTo(x,z)", [tx, tz])
            el = time.time() - t0
            if 'a' not in seen and el > 1.2: seen.add('a'); shot('16-herd-start')
            if 'b' not in seen and ((h[0] - x) ** 2 + (h[1] - z) ** 2) ** .5 < 2.6 and el > 2: seen.add('b'); shot('16-herd-push')
            if 'c' not in seen and g['n'] >= 1: seen.add('c'); pg.wait_for_timeout(250); shot('17-herd-in1'); pg.wait_for_timeout(300); shot('17-herd-in1-b')
            if 'd' not in seen and g['n'] >= 3: seen.add('d'); pg.wait_for_timeout(200); shot('17-herd-in3')
            pg.wait_for_timeout(HES * 20 + 60)
        R['양 몰기(초 — 시작 대사 뒤 → 다섯 마리)'] = round(time.time() - t0, 1)
        pg.wait_for_timeout(700); shot('18-herd-done'); until("!!wlZone.cur.state().T.sheepEnd&&" + free, 20); pg.wait_for_timeout(300); shot('19-sheep-after')
    P = S['path']; walk(P[1][0], P[1][1] + 1.2, 20, .8); pg.wait_for_timeout(700); shot('10-town-gate')
    for q in range(1, 8):
        walk(P[q][0], P[q][1], 25, .8)
        g = st()['sheep']
        if g['started'] and not g['done']: sheep_game(); walk(P[q][0], P[q][1], 25, .8)
        if st()['scene']:  # 해시계 앞에서 한 번 멈춤(거꾸리 대사)
            pg.wait_for_timeout(1500); shot('1a-dial-stop'); until(free, 15); walk(P[q][0], P[q][1], 25, .8)
        if q in (2, 4, 6): pg.wait_for_timeout(300); shot('1%d-town' % q)
        if q in (3, 5) and WIDE:  # --wide: 마을 전경(보고용 — 카메라만 잠깐 뒤로 물러나 둘러봄, 찍고 되돌림)
            t = P[q + 2] if q == 3 else P[q - 2]; h = hero(); cam0 = pg.evaluate("(()=>{const C=wlGame.controls.input.cam;return [C.yaw,C.pitch,C.dist]})()")
            pg.evaluate("([dx,dz])=>{const C=wlGame.controls.input.cam;C.yaw=Math.atan2(-dx,-dz);C.pitch=.2;C.dist=13;}", [t[0] - h[0], t[1] - h[1]]); pg.wait_for_timeout(1300); shot('1%d-town-wide' % q)
            pg.evaluate("([y,p,d])=>{const C=wlGame.controls.input.cam;C.yaw=y;C.pitch=p;C.dist=d;}", cam0); pg.wait_for_timeout(500)
        if q == 3 and HES:
            pg.wait_for_timeout(HES * 500 if HES else 300)
            walk(P[3][0], P[3][1], 8, .8)
    R['마을 대사 자리'] = bool(st()['T'].get('town'))
    # ⑦ 서쪽 해돋이 광장(한가운데 큰 해시계)
    c = S['plaza']['c']; walk(c[0], c[1] + 3.4, 30, .6); until("!!wlZone.cur.state().T.sun0", 8); pg.wait_for_timeout(1500); shot('20-plaza-enter')
    pg.wait_for_timeout(2500); shot('20a-plaza-goal'); until("!!wlZone.cur.state().T.rise", 30); pg.wait_for_timeout(900); shot('21-sunrise-a'); pg.wait_for_timeout(1800); shot('22-sunrise-b'); R['해돋이 때 집 흐림(1 = 안 흐림)'] = st().get('pf'); pg.wait_for_timeout(2300); shot('23-sunrise-c')
    until("!!wlZone.cur.state().T.sun1", 10); pg.wait_for_timeout(1500); shot('24-sunrise-talk'); pg.wait_for_timeout(4600); shot('24b-geokkuri-leads'); until(free, 20); pg.wait_for_timeout(2200); shot('25-plaza-shadows')
    pg.wait_for_timeout(HES * 1000 if HES else 300)
    for k, wb in enumerate([x for x in S['plaza']['br'] if not x['ok']] if WRONG else []):
        if wb['d'][1] < 0: walk(c[0] + 3, c[1] - 1, 8, .5)  # 남쪽 출구: 가운데 해시계를 돌아서
        walk(c[0] + wb['d'][0] * 11, c[1] + wb['d'][1] * 11, 10, .4); pg.wait_for_timeout(500); shot('26-wrong%d' % (k + 1)); until(free, 20); pg.wait_for_timeout(400)
    walk(c[0] - .5, c[1] + 2.8, 10, .5); walk(c[0] - 11, c[1], 20, .5); until("wlZone.cur.state().plaza", 6); pg.wait_for_timeout(700); shot('27-plaza-right')
    until("document.getElementById('wlStrip').classList.contains('on')", 30); pg.wait_for_timeout(1300); shot('28-fog-lift-card1'); until("!!wlZone.cur.state().T.card1", 30); until(free, 20)
    R['틀린 횟수'] = st()['wrong']; R['도움말(S3-005)'] = bool(st()['T'].get('hint'))
    # ⑧ 뭉게 문지기: 코 골 때(오르골 반주)만 걷고, 미리 알림(코골이가 멈추고 들썩 + '?')이 오면 멈춤
    gs, gate = S['gs'], S['gate']; walk(gs[0] + .2, gs[1], 40, .5); until("wlZone.cur.state().gateSaid", 10); pg.wait_for_timeout(1100); shot('30-munge-zoom')
    t9 = time.time()
    while time.time() - t9 < 6 and card() != 'profile': pg.wait_for_timeout(100)
    pg.wait_for_timeout(900); shot('30a-munge-card'); until("(document.getElementById('wlDlg').style.display==='block')", 12); pg.wait_for_timeout(1400); shot('30b-gate-why'); until("!!wlZone.cur.state().T.gateGo&&" + free, 30); pg.wait_for_timeout(1200); shot('30c-gate-topdown')
    t0 = time.time(); shots = set(); clumsy = CLUMSY
    while time.time() - t0 < 90:
        s = st(); h = hero(); note()
        if s['stage'] != 'gate': break
        if s['scene'] or s['carry']: pg.wait_for_timeout(120); continue
        if s['gate'] == 'snore' or (clumsy and s['gate'] in ('warn', 'ask')):
            if not pg.evaluate('wlGame.mission.hero().userData.isWalking()'):
                if HES: pg.wait_for_timeout(350)
                pg.evaluate("([x,z])=>wlGame.mission.hero().userData.walkTo(x,z)", [gate[0] - 3, gate[1]])
            if s['gate'] == 'snore' and 'snore' not in shots and h[0] < gs[0] - 2: shots.add('snore'); shot('31-gate-snore')
        else:
            pg.evaluate('wlGame.mission.hero().userData.stopWalk()')
            if s['gate'] == 'warn' and 'warn' not in shots: shots.add('warn'); pg.wait_for_timeout(350); shot('32-gate-warn')
            elif s['gate'] == 'ask' and 'ask' not in shots: shots.add('ask'); pg.wait_for_timeout(450); shot('32-gate-ask')
        if s['caught'] and clumsy: clumsy = False; pg.wait_for_timeout(300); shot('33-gate-caught')
        pg.wait_for_timeout(70)
    s = st(); R["문지기 '?' 횟수"] = s['gateN']; R["'!' 밀려남"] = s['caught']; pg.wait_for_timeout(900); shot('34-gate-pass'); until(free, 20)
    # ⑨ 구름 끝 → ⑩ 얼음 배 출발 → 토성
    walk(S['end'][0] + 1.5, S['end'][1], 40, .6); until("!!wlZone.cur.state().T.end", 10); pg.wait_for_timeout(1500); shot('40-end-arrive')
    until("!!wlZone.cur.state().T.look", 40); shot('41-look-airship'); until("document.getElementById('wlStrip').classList.contains('on')", 10); pg.wait_for_timeout(1300); shot('41-card2-airship'); until("!!wlZone.cur.state().T.card2", 30); pg.wait_for_timeout(1500); shot('42-end-talk')  # 2026-11-21: 비행선·발견 카드 먼저, 그다음 거꾸리 대사
    until("wlZone.cur.state().clear", 30); pg.wait_for_timeout(1000); shot('43-clear-standing'); until("!!wlZone.cur.state().T.boat", 40); pg.wait_for_timeout(900); shot('44-wave-goodbye');  # 2026-11-26: 얼음 배 없이 거꾸리 배웅 → 리본 출발 until("!!wlZone.cur.state().T.sail", 20)
    s = st(); T = dict(s['T']); R['발견'] = s['disc']; R['완료'] = s['clear']; t0 = time.time(); sh = [(2.2, '45-boat-rise'), (4.6, '46-boat-fly0'), (6.2, '46-boat-fly1'), (8.2, '47-boat-fly2'), (10.0, '47-boat-fly3'), (11.5, '48-space-side'), (13.0, '48-space-back'), (14.2, '49-saturn-near'), (16.2, '4a-saturn-big'), (18.9, '4b-map'), (20.6, '4c-map-steps')]; back = 0; lastb = None
    while time.time() - t0 < 60:
        if pg.evaluate("!!(wlZone.cur&&wlZone.cur.spots&&wlZone.cur.spots.dock)"): break
        el = time.time() - t0
        if sh and el >= sh[0][0]: shot(sh.pop(0)[1])
        # 뒷모습 시간: 카메라가 원더룹 얼굴 방향에서 2.0라디안(약 115°)보다 뒤에 있는 동안(지도·덮개 전까지)
        try:
            bk = pg.evaluate("(()=>{const W=wlGame.mission.hero(),c=wlGame.view.camera;if(!W||!c||!wlZone.cur.state().sailing)return null;const a=Math.atan2(c.position.x-W.position.x,c.position.z-W.position.z);let d=a-W.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));return Math.abs(d)>2.0})()")
        except Exception: bk = None
        now = time.time()
        if bk and lastb is not None and el < 17.5: back += now - lastb
        lastb = now
        note(); pg.wait_for_timeout(60)
    R['얼음 배 비행 중 뒷모습(초)'] = round(back, 2); R['토성 도착'] = pg.evaluate("!!(wlZone.cur&&wlZone.cur.spots&&wlZone.cur.spots.dock)"); pg.wait_for_timeout(1500); shot('50-saturn-arrive'); pg.wait_for_timeout(1200); shot('50b-saturn-down'); until("!!wlZone.cur.state().T.land", 15); pg.wait_for_timeout(1150); shot('50c-saturn-hop')
    until("wlZone.cur.state().done", 30); pg.wait_for_timeout(600); shot('51-saturn-island'); until("wlZone.cur.state().carded", 10); pg.wait_for_timeout(1200); shot('52-saturn-card')
    T2 = pg.evaluate("wlZone.cur.state().T"); g = lambda k: T.get(k); R['시각(게임 초)'] = T; R['토성 시각(게임 초)'] = T2; R['대사'] = lines
    try:
        end = T2.get('free') or T2.get('land')
        R['걸린 시간(초)'] = round(end - g('start'), 1)
        R['단계별(초)'] = {'① 도착·나레이션': round(g('gg') - g('start'), 1), '② 거꾸리 첫 만남': round(g('met') - g('gg'), 1), '③ 또생일 부탁': round(g('ask') - g('met'), 1), '④ 바람 타고 초 잡기(부탁 끝 → 케이크)': round(g('cake') - g('ask'), 1),
                       '⑤ 촛불·발견 카드': round(g('candle') - g('cake'), 1), '⑥ 해시계 마을(→ 광장 도착)': round(g('sun0') - g('candle'), 1), '⑥-1 그 가운데 구름 양 재우기(빈터 들어섬 → 끝 대사)': round(g('sheepEnd') - g('sheep0'), 1), '⑥-2 그 가운데 양 재우는 동안(시작 대사 뒤 → 다섯 번째)': round(g('sheep1') - g('sheepGo'), 1), '⑦ 해돋이 광장(→ 발견 카드 1)': round(g('card1') - g('sun0'), 1), '⑧ 뭉게 문지기(→ 문 통과)': round(g('gate') - g('card1'), 1),
                       '⑨ 구름 끝(→ 배 출발)': round(g('sail') - g('gate'), 1), '⑩ 얼음 배 → 토성(출발 → 내려서 조작 풀림)': round(end - g('sail'), 1)}
    except Exception as e: R['시간 계산 오류'] = str(e)
    dd = [d for d in draws if d]; R['그리기'] = {'최대 드로우콜': max(d[0] for d in dd), '평균 드로우콜': round(sum(d[0] for d in dd) / len(dd), 1), '최대 삼각형': max(d[1] for d in dd)} if dd else None
    R['단계별 최대 드로우콜'] = byst; R['오류'] = errs
    if os.environ.get('WL_VOUT'):
        try: json.dump(pg.evaluate('window.__voice.report()'), open(os.environ['WL_VOUT'], 'w'), ensure_ascii=False, indent=1)
        except Exception as e: R['기록 오류'] = str(e)
    b.close()
json.dump(R, open(os.path.join(OUT, pre + 'result.json'), 'w'), ensure_ascii=False, indent=1); print(json.dumps(R, ensure_ascii=False, indent=1))
