# -*- coding: utf-8 -*-
"""무한 우주 STAGE 3 구름 행성(금성) 처음부터 끝까지 (2026-11-18) — 촬영 서버(8000)가 떠 있을 때 저장소 루트에서:
   python3 tools/space-stage3-test.py [--out docs/compare/space-stage3] [--phone] [--wrong] [--clumsy] [--secret]
   주소로 바로 열되 내려앉는 연출부터(?arrive): ① 도착 알림 → S3-001 → 3초 → ② 거꾸리 등장·대화 → ③ 갈림길 셋(그림자 반대쪽 = 서쪽) → 발견 카드 1
   → ④ 뭉게 문지기(코 골 때만 걷고 '?'면 멈춤) → ⑤ 구름 끝(얼음 조각 배 · 발견 카드 2 · 지도 카드 · STAGE 3 완료).
   처음 하는 사람처럼: 장면 대사는 넘기지 않고 저절로 넘어가길 기다림(읽는 시간), 친구 카드는 2.5초 뒤 닫음, 주민 대화는 줄마다 3초.
   --wrong: 갈림길 1에서 두 번·갈림길 2에서 한 번 틀림(되돌림·도움말 S3-005 확인) / --clumsy: 첫 '?'에 계속 걸음('!' 밀려남 확인) / --secret: 또생일에게 들름(촛불·발견 카드 3)
   단계 화면을 <out>/<phone|pc>-*.png, 결과 JSON <out>/<phone|pc>-result.json. 소리 끔, 끝나면 닫음."""
import json, os, re, sys, time
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
A = sys.argv[1:]; PHONE = '--phone' in A; WRONG = '--wrong' in A; CLUMSY = '--clumsy' in A; SECRET = '--secret' in A; HES = 0 if '--fast' in A else 6  # --fast: 망설임 없이(가장 빠른 길)
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
    # 비밀: 또생일
    if SECRET:
        walk(0, -6.5); walk(S['sec'][0] - 1.3, S['sec'][1] - .5, 20, .6); pg.wait_for_timeout(600); shot('s1-ddo-near')
        pg.keyboard.press('e'); pg.wait_for_timeout(1200); note(); shot('s2-ddo-talk'); pg.wait_for_timeout(1800); pg.keyboard.press('e'); pg.wait_for_timeout(3000); note(); pg.keyboard.press('e')
        until("wlGame.ui.cardShown()==='profile'", 6); pg.wait_for_timeout(1200); shot('s3-ddo-card'); until(free, 12)
        walk(S['cake'][0] - .9, S['cake'][1] + .7, 10, .5); pg.wait_for_timeout(500); pg.keyboard.press('e'); until("!!wlZone.cur.state().T.candle", 12); pg.wait_for_timeout(1200); shot('s4-candle-card'); until(free, 14)
        R['비밀 발견(촛불)'] = bool(st()['T'].get('candle')); walk(0, -6.5)
    # ③ 갈림길 셋
    inc = [[0, -1], [-1, 0], [0, 1]]
    for i, f in enumerate(S['forks']):
        cx, cz = f['c']
        if i == 2:
            for q in [S['path'][3], S['path'][5]]: walk(q[0], q[1], 20, .8)
        walk(cx - inc[i][0] * 2.6, cz - inc[i][1] * 2.6, 40, .6); look(inc[i][0], inc[i][1], .8); pg.wait_for_timeout(HES * 1000 if HES else 1300); shot('1%d-fork%d' % (i, i + 1))
        # 위에서 본 갈림길(기둥·그림자가 한 화면에 — 보고용)
        pg.evaluate("()=>{const C=wlGame.controls.input.cam;window.__d0=C.dist;C.dist=13;C.pitch=1.02;}"); pg.wait_for_timeout(1500); shot('1%d-fork%d-top' % (i, i + 1)); pg.evaluate("()=>{const C=wlGame.controls.input.cam;C.dist=window.__d0;C.pitch=.6;}"); pg.wait_for_timeout(500)
        nw = (2 if i == 0 else 1 if i == 1 else 0) if WRONG else 0
        for k in range(nw):
            wb = [b for b in f['br'] if not b['ok']][0]; walk(cx + wb['d'][0] * 6, cz + wb['d'][1] * 6, 10, .4); pg.wait_for_timeout(500); shot('1%d-fork%d-wrong%d' % (i, i + 1, k + 1)); until(free, 20); pg.wait_for_timeout(400)
        ok = [b for b in f['br'] if b['ok']][0]; n0 = st()['solved']; walk(cx + ok['d'][0] * 6.5, cz + ok['d'][1] * 6.5, 20, .5)
        until("wlZone.cur.state().solved>%d" % n0, 6); pg.wait_for_timeout(700); shot('1%d-fork%d-right' % (i, i + 1))
    until("document.getElementById('wlStrip').classList.contains('on')", 30); pg.wait_for_timeout(1300); shot('20-fog-lift-card1'); until("!!wlZone.cur.state().T.card1", 30); until(free, 20)
    R['틀린 횟수'] = st()['wrong']; R['도움말(S3-005)'] = [k for k in st()['T'] if k.startswith('hint')]
    # ④ 뭉게 문지기
    gs, gate = S['gs'], S['gate']; look(-1, 0, .5); walk(gs[0] + .2, gs[1], 40, .5); until("wlZone.cur.state().gateSaid", 10); pg.wait_for_timeout(1500); shot('30-gate-shh'); until(free, 15)
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
                shots.add('ask'); pg.wait_for_timeout(350); shot('32-gate-ask')
            elif 'ask2' not in shots and s['gateN'] >= 2:  # 뭉게 문지기 가까이(보고용 — 카메라만 잠깐)
                shots.add('ask2'); pg.evaluate("(([x,z])=>{window.__mc=()=>({at:[x,1.1,z],from:[x+5.2,1.9,z+2.6]});wlGame.view.hold(window.__mc)})(wlZone.cur.spots.munge)"); pg.wait_for_timeout(600); shot('32-munge-ask-close'); pg.evaluate('wlGame.view.hold(null)')
        if s['caught'] and clumsy: clumsy = False; shot('33-gate-caught')
        pg.wait_for_timeout(90)
    s = st(); R["문지기 '?' 횟수"] = s['gateN']; R["'!' 밀려남"] = s['caught']; pg.wait_for_timeout(900); shot('34-gate-pass'); until(free, 20)
    # ⑤ 구름 끝
    walk(S['end'][0] + 1.5, S['end'][1], 40, .6); until("!!wlZone.cur.state().T.end", 10); pg.wait_for_timeout(2000); shot('40-end-talk')
    until("wlZone.cur.state().aboard", 40); pg.wait_for_timeout(1500); shot('41-boat'); until("!!wlZone.cur.state().T.map", 40); shot('42-map-card')
    until("wlZone.cur.state().clear", 30); pg.wait_for_timeout(1000); shot('43-clear'); until("!!wlZone.cur.state().T.done&&" + free, 40); pg.wait_for_timeout(800); shot('44-after')
    s = st(); T = s['T']; g = lambda k: T.get(k)
    R['완료'] = s['clear']; R['발견'] = s['disc']; R['시각(게임 초)'] = T; R['대사'] = lines
    if g('done') and g('start') is not None:
        R['걸린 시간(초)'] = round(g('done') - g('start'), 1)
        R['단계별(초)'] = {'① 도착·나레이션(시작 → 거꾸리 등장)': round(g('gg') - g('start'), 1), '② 거꾸리 첫 만남(등장 → 대화 끝)': round(g('met') - g('gg'), 1), '③ 그림자 길 찾기(대화 끝 → 발견 카드 1)': round(g('card1') - g('met'), 1),
                       '④ 뭉게 문지기(발견 카드 1 → 문 통과)': round(g('gate') - g('card1'), 1), '⑤ 구름 끝(문 통과 → 끝)': round(g('done') - g('gate'), 1)}
    dd = [d for d in draws if d]; R['그리기'] = {'최대 드로우콜': max(d[0] for d in dd), '평균 드로우콜': round(sum(d[0] for d in dd) / len(dd), 1), '최대 삼각형': max(d[1] for d in dd)} if dd else None
    R['오류'] = errs
    if os.environ.get('WL_VOUT'):
        try: json.dump(pg.evaluate('window.__voice.report()'), open(os.environ['WL_VOUT'], 'w'), ensure_ascii=False, indent=1)
        except Exception as e: R['기록 오류'] = str(e)
    b.close()
json.dump(R, open(os.path.join(OUT, pre + 'result.json'), 'w'), ensure_ascii=False, indent=1); print(json.dumps(R, ensure_ascii=False, indent=1))
