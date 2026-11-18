# -*- coding: utf-8 -*-
"""무한 우주 STAGE 3 구름 행성(금성) 처음부터 끝까지 (2026-11-18) — 촬영 서버(8000)가 떠 있을 때 저장소 루트에서:
   python3 tools/space-stage3-test.py [--out docs/compare/space-stage3] [--phone] [--wrong] [--clumsy] [--secret]
   주소로 바로 열되 내려앉는 연출부터(?arrive): ① 도착 알림 → S3-001 → 3초 → ② 거꾸리 등장·대화 → ③ 거꾸로 마을(걸으며 구경) → ④ 서쪽 해돋이 광장(해돋이 → 서쪽 출구) → 발견 카드 1
   → ⑤ 뭉게 문지기(코 골 때만 걷고 '?'면 멈춤) → ⑥ 구름 끝(얼음 조각 배 · 발견 카드 2 · 지도 카드 · STAGE 3 완료).
   처음 하는 사람처럼: 장면 대사는 넘기지 않고 저절로 넘어가길 기다림(읽는 시간), 친구 카드는 2.5초 뒤 닫음, 주민 대화는 줄마다 3초.
   --wrong: 광장에서 동쪽·남쪽 출구로 한 번씩 틀림(되돌림·도움말 S3-005 확인) / --clumsy: 첫 '?'에 계속 걸음('!' 밀려남 확인) / --secret: 또생일에게 들름(촛불·발견 카드 3) / --wide: 마을 전경 두 장(카메라만 잠깐 물러남 — 시간 재기에는 쓰지 않음)
   단계 화면을 <out>/<phone|pc>-*.png, 결과 JSON <out>/<phone|pc>-result.json. 소리 끔, 끝나면 닫음."""
import json, os, re, sys, time
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
A = sys.argv[1:]; PHONE = '--phone' in A; WRONG = '--wrong' in A; CLUMSY = '--clumsy' in A; SECRET = '--secret' in A; WIDE = '--wide' in A; HES = 0 if '--fast' in A else 6  # --fast: 망설임 없이(가장 빠른 길)
OUT = os.path.join(ROOT, A[A.index('--out') + 1] if '--out' in A else 'docs/compare/space-stage3'); os.makedirs(OUT, exist_ok=True)
pre = ('phone-' if PHONE else 'pc-') + ('wrong-' if WRONG or CLUMSY else '') + ('secret-' if SECRET else ''); R = {'dev': pre[:-1]}
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
    lines = []; draws = []
    def note():
        t = dlg()
        if t and (not lines or lines[-1] != t): lines.append(t)
        m = re.search(r'드로우콜 (\d+)회.*?삼각형 ([\d,]+)개', pg.evaluate("(document.getElementById('stats')||{}).textContent||''"))
        if m: draws.append([int(m.group(1)), int(m.group(2).replace(',', ''))])
    def idle(ms=250):
        note()
        if card() == 'profile': pg.wait_for_timeout(2500); pg.keyboard.press('e')
        pg.wait_for_timeout(ms)
    def until(js, sec=60):
        t = time.time()
        while time.time() - t < sec:
            if pg.evaluate(js): return True
            idle()
        return False
    free = "(()=>{const s=wlZone.cur.state();return !s.scene&&!s.carry&&!wlGame.ui.cardShown()&&!wlGame.core.blocking()&&document.getElementById('wlDlg').style.display!=='block'})()"
    def look(dx, dz, pitch=.5): pg.evaluate("([dx,dz,p])=>{const C=wlGame.controls.input.cam;C.yaw=Math.atan2(-dx,-dz);C.pitch=p;}", [dx, dz, pitch])
    def walk(x, z, sec=30, near=.5):
        pg.evaluate("([x,z])=>wlGame.mission.hero().userData.walkTo(x,z)", [x, z]); t = time.time()
        while time.time() - t < sec:
            h = hero(); s = st()
            if ((h[0] - x) ** 2 + (h[1] - z) ** 2) ** .5 < near or s['scene'] or s['carry']: break
            if not pg.evaluate('wlGame.mission.hero().userData.isWalking()'): pg.evaluate("([x,z])=>wlGame.mission.hero().userData.walkTo(x,z)", [x, z])
            idle(120)
    # ① 도착 → ② 거꾸리
    until("wlZone.cur.state().arrDone", 40); pg.wait_for_timeout(1500); shot('01-arrive')
    until("!!wlZone.cur.state().T.gg", 60); pg.wait_for_timeout(1600); shot('02-geokkuri-backward')
    until("(document.getElementById('wlDlg').style.display==='block')", 20); pg.wait_for_timeout(1500); shot('03-geokkuri-talk')
    until("wlZone.cur.state().met&&" + free, 80); pg.wait_for_timeout(600); shot('04-guide')
    # ③ 거꾸로 마을: 거꾸리를 따라 걸으며 구경(할 일 없음) — 입구 대사 자리, 집·나무·양
    P = S['path']; walk(P[1][0], P[1][1] + 1.2, 20, .8); pg.wait_for_timeout(700); shot('10-town-gate')
    # 비밀: 또생일네 집(마을 입구 동쪽 샛길)
    if SECRET:
        walk(S['sec'][0] - 1.4, S['sec'][1] + .2, 25, .6); pg.wait_for_timeout(600); shot('s1-ddo-near')
        pg.keyboard.press('e'); pg.wait_for_timeout(1200); note(); shot('s2-ddo-talk'); pg.wait_for_timeout(1800); pg.keyboard.press('e'); pg.wait_for_timeout(3000); note(); pg.keyboard.press('e')
        until("wlGame.ui.cardShown()==='profile'", 6); pg.wait_for_timeout(1200); shot('s3-ddo-card'); until(free, 12)
        walk(S['cake'][0] - .9, S['cake'][1] + .7, 10, .5); pg.wait_for_timeout(500); pg.keyboard.press('e'); until("!!wlZone.cur.state().T.candle", 12); pg.wait_for_timeout(1200); shot('s4-candle-card'); until(free, 14)
        R['비밀 발견(촛불)'] = bool(st()['T'].get('candle')); walk(0, -10.5)
    for q in range(1, 11):
        walk(P[q][0], P[q][1], 25, .8)
        if q in (2, 5, 8): pg.wait_for_timeout(300); shot('1%d-town' % q)
        if q in (3, 6) and WIDE:  # --wide: 마을 전경(보고용 — 카메라만 잠깐 뒤로 물러나 둘러봄, 찍고 되돌림)
            t = P[q + 2] if q == 3 else P[q - 3]; h = hero(); cam0 = pg.evaluate("(()=>{const C=wlGame.controls.input.cam;return [C.yaw,C.pitch,C.dist]})()")
            pg.evaluate("([dx,dz])=>{const C=wlGame.controls.input.cam;C.yaw=Math.atan2(-dx,-dz);C.pitch=.2;C.dist=13;}", [t[0] - h[0], t[1] - h[1]]); pg.wait_for_timeout(1300); shot('1%d-town-wide' % q)
            pg.evaluate("([y,p,d])=>{const C=wlGame.controls.input.cam;C.yaw=y;C.pitch=p;C.dist=d;}", cam0); pg.wait_for_timeout(500)
        if q == 4:  # 처음 하는 사람: 조는 구름 양·거꾸로 집을 구경하는 시간 + 마을 전경(카메라만 잠깐 멀리·위로 — 보고용)
            if S['sheep']: walk(S['sheep'][1][0] + 1.6, S['sheep'][1][1] + .6, 8, .5); pg.wait_for_timeout(700); shot('14-sheep-z')
            pg.wait_for_timeout(HES * 500 if HES else 300)
            walk(P[4][0], P[4][1], 8, .8)
    R['마을 대사 자리'] = bool(st()['T'].get('town'))
    # ④ 서쪽 해돋이 광장
    c = S['plaza']['c']; walk(c[0], c[1] + 3, 30, .6); until("!!wlZone.cur.state().T.sun0", 8); pg.wait_for_timeout(1500); shot('20-plaza-enter')
    until("!!wlZone.cur.state().T.rise", 12); pg.wait_for_timeout(900); shot('21-sunrise-a'); pg.wait_for_timeout(1800); shot('22-sunrise-b'); pg.wait_for_timeout(2300); shot('23-sunrise-c')
    until("!!wlZone.cur.state().T.sun1", 10); pg.wait_for_timeout(1500); shot('24-sunrise-talk'); until(free, 20); pg.wait_for_timeout(2200); shot('25-plaza-shadows')
    pg.wait_for_timeout(HES * 1000 if HES else 300)  # 처음 하는 사람: 그림자를 살피는 시간
    for k, wb in enumerate([x for x in S['plaza']['br'] if not x['ok']] if WRONG else []):
        walk(c[0] + wb['d'][0] * 11, c[1] + wb['d'][1] * 11, 10, .4); pg.wait_for_timeout(500); shot('26-wrong%d' % (k + 1)); until(free, 20); pg.wait_for_timeout(400)
    walk(c[0] - 11, c[1], 20, .5); until("wlZone.cur.state().plaza", 6); pg.wait_for_timeout(700); shot('27-plaza-right')
    until("document.getElementById('wlStrip').classList.contains('on')", 30); pg.wait_for_timeout(1300); shot('28-fog-lift-card1'); until("!!wlZone.cur.state().T.card1", 30); until(free, 20)
    R['틀린 횟수'] = st()['wrong']; R['도움말(S3-005)'] = bool(st()['T'].get('hint'))
    # ④ 뭉게 문지기
    gs, gate = S['gs'], S['gate']; walk(gs[0] + .2, gs[1], 40, .5); until("wlZone.cur.state().gateSaid", 10); pg.wait_for_timeout(1500); shot('30-gate-shh'); until(free, 15)
    t0 = time.time(); shots = set(); clumsy = CLUMSY
    while time.time() - t0 < 90:
        s = st(); h = hero(); note()
        if s['stage'] != 'gate': break
        if s['scene'] or s['carry']: pg.wait_for_timeout(120); continue
        if s['gate'] == 'snore' or (clumsy and s['gate'] == 'ask'):
            if not pg.evaluate('wlGame.mission.hero().userData.isWalking()'):
                if HES: pg.wait_for_timeout(350)  # 다시 걷기 시작하는 반응 시간
                pg.evaluate("([x,z])=>wlGame.mission.hero().userData.walkTo(x,z)", [gate[0] - 3, gate[1]])
            if s['gate'] == 'snore' and 'snore' not in shots and h[0] < gs[0] - 2: shots.add('snore'); shot('31-gate-snore')
        else:
            pg.evaluate('wlGame.mission.hero().userData.stopWalk()')
            if 'ask' not in shots:
                shots.add('ask'); pg.wait_for_timeout(450); shot('32-gate-ask')
            elif 'ask2' not in shots and s['gateN'] >= 2:  # 뭉게 문지기 가까이(보고용 — 카메라만 잠깐)
                shots.add('ask2'); pg.wait_for_timeout(450); shot('32-gate-ask2')
        if s['caught'] and clumsy: clumsy = False; shot('33-gate-caught')
        pg.wait_for_timeout(90)
    s = st(); R["문지기 '?' 횟수"] = s['gateN']; R["'!' 밀려남"] = s['caught']; pg.wait_for_timeout(900); shot('34-gate-pass'); until(free, 20)
    # ⑤ 구름 끝
    walk(S['end'][0] + 1.5, S['end'][1], 40, .6); until("!!wlZone.cur.state().T.end", 10); pg.wait_for_timeout(2000); shot('40-end-talk')
    until("wlZone.cur.state().aboard", 40); pg.wait_for_timeout(700); shot('41-boat'); until("document.getElementById('wlStrip').classList.contains('on')", 10); pg.wait_for_timeout(1300); shot('41-card2-airship'); until("!!wlZone.cur.state().T.map", 40); shot('42-map-card')
    until("wlZone.cur.state().clear", 30); pg.wait_for_timeout(1000); shot('43-clear'); until("!!wlZone.cur.state().T.done&&" + free, 40); pg.wait_for_timeout(800); shot('44-after')
    s = st(); T = s['T']; g = lambda k: T.get(k)
    R['완료'] = s['clear']; R['발견'] = s['disc']; R['시각(게임 초)'] = T; R['대사'] = lines
    if g('done') and g('start') is not None:
        R['걸린 시간(초)'] = round(g('done') - g('start'), 1)
        R['단계별(초)'] = {'① 도착·나레이션(시작 → 거꾸리 등장)': round(g('gg') - g('start'), 1), '② 거꾸리 첫 만남(등장 → 대화 끝)': round(g('met') - g('gg'), 1), '③ 거꾸로 마을(대화 끝 → 광장 도착)': round(g('sun0') - g('met'), 1),
                       '④ 해돋이 광장(광장 도착 → 발견 카드 1)': round(g('card1') - g('sun0'), 1), '⑤ 뭉게 문지기(발견 카드 1 → 문 통과)': round(g('gate') - g('card1'), 1), '⑥ 구름 끝(문 통과 → 끝)': round(g('done') - g('gate'), 1)}
    dd = [d for d in draws if d]; R['그리기'] = {'최대 드로우콜': max(d[0] for d in dd), '평균 드로우콜': round(sum(d[0] for d in dd) / len(dd), 1), '최대 삼각형': max(d[1] for d in dd)} if dd else None
    R['오류'] = errs
    if os.environ.get('WL_VOUT'):
        try: json.dump(pg.evaluate('window.__voice.report()'), open(os.environ['WL_VOUT'], 'w'), ensure_ascii=False, indent=1)
        except Exception as e: R['기록 오류'] = str(e)
    b.close()
json.dump(R, open(os.path.join(OUT, pre + 'result.json'), 'w'), ensure_ascii=False, indent=1); print(json.dumps(R, ensure_ascii=False, indent=1))
