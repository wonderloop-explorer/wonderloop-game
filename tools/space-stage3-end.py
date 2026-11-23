# -*- coding: utf-8 -*-
"""STAGE 3 끝부분만 빠르게 확인(2026-11-21) — 문지기까지 끝난 것으로 저장을 맞춰 열고: 구름 끝(비행선·발견 카드 → 대사 → 얼음 배) → 비행 → 우주 지도 → 토성 도착.
   촬영 서버(8000)가 떠 있을 때 저장소 루트에서: python3 tools/space-stage3-end.py [--pc] [--out docs/compare/space-stage3-end] [--plaza]
   --sheep: 양 몰기 설명 대화 구도와 놀이 시작 구도만. --plaza: 광장 서쪽 출구 발견 카드와 초 꽂기 구도도(해돋이까지 끝난 저장 / 초 셋을 잡은 저장으로 따로 열어서). 결과: 촬영 + 뒷모습 시간(초). 소리 끔, 끝나면 닫음."""
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
    pg.keyboard.press('ArrowLeft'); pg.wait_for_timeout(300)  # 소리 깨우기(키 입력 — 카메라만 조금 돎)
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
    R['들어올 때 배경음'] = pg.evaluate("(()=>{const b=wlGame.sound.bedTime&&wlGame.sound.bedTime();return b?[b.id,+b.pos.toFixed(1)]:null})()")
    if '--ship' in A:  # 비행선 확대만: 구름 끝에 닿은 뒤 0.8초마다 여덟 장
        for i in range(8): pg.wait_for_timeout(800); shot('41-ship-%d' % i)
        return
    until('wlZone.cur.state().T.look', 40); shot('41-look-airship'); until("document.getElementById('wlStrip').classList.contains('on')", 10); pg.wait_for_timeout(1300); shot('41-card2-airship')
    until('wlZone.cur.state().T.card2', 30); pg.wait_for_timeout(1500); shot('42-end-talk'); until('wlZone.cur.state().clear', 40); pg.wait_for_timeout(900); shot('43-clear')
    until('wlZone.cur.state().aboard', 40); pg.wait_for_timeout(900); shot('44-boat-aboard'); until('wlZone.cur.state().T.sail', 20)
    t0 = time.time(); sh = [(2.2, '45-boat-rise'), (4.6, '46-fly0'), (6.2, '46-fly1'), (8.2, '47-fly2'), (10.0, '47-fly3'), (11.5, '48-fly4'), (13.0, '48-fly5'), (14.2, '49-fly6'), (16.2, '4a-saturn-big'), (18.9, '4b-map'), (20.6, '4c-map-steps')]; back = 0; lastb = None; hid = 0; n = 0
    while time.time() - t0 < 60:
        if pg.evaluate('!!(wlZone.cur&&wlZone.cur.spots&&wlZone.cur.spots.dock)'): break
        el = time.time() - t0
        try:
            m = pg.evaluate("(()=>{const d=wlGame.sound.duckState&&wlGame.sound.duckState(),b=wlGame.sound.bedTime&&wlGame.sound.bedTime();return [d?d.bed:null,b?b.id:null,b?+b.pos.toFixed(1):null]})()")
            if m[0] is not None and m[0] < .5 and 'bedHalf' not in R: R['배경음(해돋이 음악)이 절반으로 줄어든 때(배 출발 뒤 초)'] = round(el, 2); R['그때 곡·자리'] = m[1:]
            if m[0] is not None and m[0] < .03 and 'bedOff' not in R: R['bedOff'] = 1; R['배경음이 다 꺼진 때(배 출발 뒤 초)'] = round(el, 2)
            if m[0] is not None and m[0] < .5: R['bedHalf'] = 1
        except Exception: pass
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
    until('wlZone.cur.state().T.stuck', 12); pg.wait_for_timeout(1300); shot('0b-three')
    t0 = time.time(); i = 0  # 또생일이 촛불을 부는 순간(대사 뒤): 연속으로 찍어 바람 줄기·꺼진 뒤 연기를 잡음
    while time.time() - t0 < 14 and not st()['T'].get('blow'):
        if pg.evaluate("!!(wlZone.cur.dbgBlow&&wlZone.cur.dbgBlow())"): shot('0b-blow-%d' % i); i += 1
        else: pg.wait_for_timeout(60)
    for j in range(2): shot('0b-smoke-%d' % j)
    until('wlZone.cur.state().T.candle', 20); pg.wait_for_timeout(1300); shot('0c-candle-card')
def sheep(pg):
    st, shot, until, walk = helpers(pg); S = pg.evaluate('wlZone.cur.spots'); g = S['glade']
    dx, dz = g['gg'][0] - g['c'][0], g['gg'][1] - g['c'][1]; L = (dx * dx + dz * dz) ** .5  # 빈터 바깥(들어오는 길 쪽)에서 걸어 들어감 — 실제 플레이처럼 카메라가 등 뒤에
    pg.evaluate("([x,z,a])=>{const W=wlGame.mission.hero();W.position.set(x,0,z);W.rotation.y=a;}", [g['gg'][0] + dx / L * 6 + 1.2, g['gg'][1] + dz / L * 6, 0]); pg.wait_for_timeout(600)
    walk(g['gg'][0] + dx / L * 3 + 1.2, g['gg'][1] + dz / L * 3, 6, .5); pg.wait_for_timeout(1500)
    walk(g['c'][0], g['c'][1], 20, 1.0); until('wlZone.cur.state().T.sheep0', 10); pg.wait_for_timeout(2200); shot('1a-sheep-talk')
    until('wlZone.cur.state().T.sheepGo', 30); pg.wait_for_timeout(2200); shot('1b-sheep-top')
def dial(pg):
    st, shot, until, walk = helpers(pg); S = pg.evaluate('wlZone.cur.spots'); P = S['path']; d = S['dial']; print('dial', d, 'path', P[2:6])
    pg.evaluate("([x,z])=>{const W=wlGame.mission.hero();W.position.set(x,0,z);}", [P[4][0], P[4][1]]); pg.wait_for_timeout(800)
    for q in (5, 6):
        walk(P[q][0], P[q][1], 25, .8); print(q, sorted(st()['T'].keys()), pg.evaluate("(document.getElementById('wlDlg')||{}).innerText"))
        if st().get('scene'): pg.wait_for_timeout(1500); shot('1a-dial-stop'); until('!wlZone.cur.state().scene', 15)
def sunrise(pg):
    """해돋이 광장: 대사 구도 촬영 + 배경음 → 해돋이 음악 → 배경음으로 바뀌는 시점(게임 시계·소리 시계) 재기"""
    st, shot, until, walk = helpers(pg); S = pg.evaluate('wlZone.cur.spots'); c = S['plaza']['c']; R = S['plaza']['R']; log = []
    pg.evaluate("([x,z])=>{const W=wlGame.mission.hero();W.position.set(x,0,z);W.rotation.y=Math.PI;}", [c[0], c[1] + R + 5]); pg.wait_for_timeout(3500)
    samp = "(()=>{const b=wlGame.sound.bedTime&&wlGame.sound.bedTime(),s=wlZone.cur.state(),d=wlGame.sound.duckState&&wlGame.sound.duckState();return [+wlGame.clock.t.toFixed(2),b?b.id:null,b?+b.t.toFixed(2):null,s.rise,d?d.bus:null,(document.getElementById('wlDlg')||{}).innerText||'']})()"
    pg.evaluate('([x,z])=>wlGame.mission.hero().userData.walkTo(x,z)', [c[0], c[1] + 2]); t0 = time.time(); shots = {'034': False, '033': False, 'sun': False}
    while time.time() - t0 < 75:
        v = pg.evaluate(samp); log.append(v[:5]); T = st()['T']
        if not T.get('sun0') and time.time() - t0 < 12: pg.evaluate('([x,z])=>wlGame.mission.hero().userData.walkTo(x,z)', [c[0], c[1] + 2])
        if '안개 때문에' in v[5] and not shots['033'] and v[2] and v[2] > 4: shots['033'] = True; shot('2a-plaza-talk033')
        if '해가 뜬다' in v[5] and not shots['034']: shots['034'] = True; pg.wait_for_timeout(900); shot('2b-plaza-talk034')
        if v[3] >= 1 and not shots['sun']: shots['sun'] = True; shot('2c-plaza-sunup')
        if T.get('sunEnd') and v[1] == 'venus-bgm' and v[2] and v[2] > 4: break
        pg.wait_for_timeout(150)
    s = st(); T = s['T']; first = lambda f: next((x for x in log if f(x)), None)
    a = first(lambda x: x[1] == 'venus-sunrise'); full = first(lambda x: x[3] >= 1); back = first(lambda x: x[1] == 'venus-bgm' and T.get('sunEnd') and x[0] >= T['sunEnd'])
    R = {'음악 바뀜(게임 시계 초)': s['mus'], '장면 시작(sun0)': T.get('sun0'), '해돋이 음악 요청(rise)': T.get('rise'), '해돋이 음악이 실제로 울리기 시작(게임 시계)': a and round(a[0] - a[2], 2),
         '해가 다 뜬 때(게임 시계)': full and full[0], '그때 해돋이 곡 자리(초)': full and full[2], '해 구경 끝(sunEnd) = 배경음으로 돌아가기 시작': T.get('sunEnd'), '배경음이 다시 울리기 시작(게임 시계)': back and round(back[0] - back[2], 2)}
    print(json.dumps(R, ensure_ascii=False, indent=1)); json.dump({'결과': R, '표본[게임 시계, 곡, 곡 자리, 해 진행, 배경음 묶음]': log}, open(os.path.join(OUT, TAG + '-sunrise-music.json'), 'w'), ensure_ascii=False)
def fail(pg):
    """초 잡기 실패 → 구름이 발판 옆으로 되돌려 줄 때 구도"""
    st, shot, until, walk = helpers(pg); S = pg.evaluate('wlZone.cur.spots'); pad = S['pad']
    pg.evaluate("wlZone.cur.dbgMiss&&wlZone.cur.dbgMiss(true)")
    pg.evaluate("([x,z])=>{const W=wlGame.mission.hero();W.position.set(x,0,z);}", [pad[0] - 2.5, pad[1] - 1]); pg.wait_for_timeout(1200); walk(pad[0], pad[1], 15, .4)
    until('wlZone.cur.state().T.rideFail', 45); pg.wait_for_timeout(2600)
    for i in range(6): pg.wait_for_timeout(650); shot('0d-back-%d' % i)
def mapmv(pg):
    """화성 → 금성 우주 지도(발자국 크기·보폭)"""
    st, shot, until, walk = helpers(pg)
    pg.evaluate("(async()=>{const SP=(await import('/js/worlds/infinite-space.js')).default;window.__mp=await wlGame.travel.mapFor(SP,'space-mars','space-venus',wlGame.state.flags);})()")
    pg.wait_for_timeout(1500); shot('60-map-mars-venus-a'); pg.wait_for_timeout(1500); shot('60-map-mars-venus')
def ddo(pg):
    """또생일 부탁 대화 구도(거꾸리가 또생일 쪽을 보는지) · 대화 동안 우산이 가만히 있는지"""
    st, shot, until, walk = helpers(pg); S = pg.evaluate('wlZone.cur.spots'); d = S['ddo0']
    pg.evaluate("([x,z])=>{const W=wlGame.mission.hero();W.position.set(x,0,z);}", [d[0] - 5.5, d[1] + 3.2]); pg.wait_for_timeout(1500); walk(d[0] - 1.8, d[1] + 1.2, 12, .5)
    txt = "((document.getElementById('wlDlg')||{}).innerText||'')"; seen = set(); t0 = time.time(); umb = []
    while time.time() - t0 < 60 and not st()['T'].get('ask'):
        v = pg.evaluate(txt)
        try:
            u = pg.evaluate("(()=>{let o=null,r=wlGame.mission.hero();while(r.parent)r=r.parent;r.traverse(x=>{if(x.name==='venus-umbrella')o=x;});return o?[+o.position.x.toFixed(2),+o.position.y.toFixed(2),+o.position.z.toFixed(2)]:null})()")
            if u: umb.append(u + [1 if '또생일' in v else 0])
        except Exception: pass
        for k, n in (('내 생일이야', '05a-ddo-talk1'), ('초가 날아갔어', '05b-ddo-talk2'), ('파티장에서', '05c-ddo-talk3')):
            if k in v and k not in seen: seen.add(k); pg.wait_for_timeout(1100); shot(n)
        pg.wait_for_timeout(120)
    talk = [u[:3] for u in umb if u and u[3]]; print('대화 동안 우산 자리(처음·끝·움직인 거리)', talk[:1], talk[-1:], round(max([((a[0]-talk[0][0])**2+(a[2]-talk[0][2])**2)**.5 for a in talk] or [0]), 2))
with sync_playwright() as p:
    if '--ddo' in A: run(p, ALL[:1], ddo)
    elif '--fail' in A: run(p, ALL[:2], fail)
    elif '--map' in A: run(p, ALL + ['secret:infinite-space:marssound', 'secret:infinite-space:bluesunset'], mapmv)
    elif '--sunrise' in A: run(p, ALL[:9], sunrise)
    elif '--dial' in A: run(p, ALL[:9], dial)
    elif '--sheep' in A: run(p, ALL[:8], sheep)
    elif '--plaza' in A:
        run(p, ALL[:6], cake); run(p, ALL[:10], plaza)
    else: run(p, ALL, end)
print('ok', OUT)
