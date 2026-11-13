# -*- coding: utf-8 -*-
"""무한 우주 STAGE 2 붉은 모래 언덕(화성) 처음부터 'STAGE 2 완료!'까지 (2026-11-09, js/zones/space/mars.js) — 촬영 서버(8000)가 떠 있을 때 저장소 루트에서:
   python3 tools/space-stage2-test.py [--phone] [--secret] [--real] [--video] [--out docs/compare/space-stage2]
   회색 정원 출구(미션·바위는 받은 걸로)에서 별똥별을 타고 화성에 착지 → 삐삐가 다가와 착각 → 삐삐 언덕 → 협곡 건너 부르기(엇갈림) → 녹음 → 회오리 타고 건넘 →
   징검다리 높이 뛰기 → 둥둥에게 틀어 주고 대답 녹음 → 바위에서 내려와 회오리로 돌아옴 → 삐삐에게 틀어 줌 → 둥둥이 건너옴 → 노을 → 유리 조각 → 큰 회오리 → STAGE 2 완료.
   --secret: 삐삐를 만난 뒤 북서쪽 회오리를 타고 화산 꼭대기(비밀)에 갔다 옴. --real: 사람처럼 읽는 시간(대사·카드마다 약 3초) → 착지부터 완료까지 걸린 시간.
   --video: 녹화(webm). 늘: 회오리 타기·둥둥 건너옴·노을·큰 회오리 동안 매 프레임 원더룹 몸 범위(사진 모드 wlPhoto.body)가 화면 밖으로 1% 넘게 나간 프레임 수,
   휴대폰 예산(드로우콜·삼각형 — 걷는 동안·회오리·노을 최대·평균). 단계마다 화면을 <out>/에, 결과 JSON. 소리 끔, 끝나면 닫음."""
import json, os, sys, shutil, time, re
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
a = sys.argv[1:]; PHONE = '--phone' in a; SECRET = '--secret' in a; REAL = '--real' in a; VIDEO = '--video' in a
VIEW = a[a.index('--view') + 1] if '--view' in a else None  # --view 844x390t (끝에 t = 터치 기기) — 화면 가림 재기용 크기
PORT = a[a.index('--port') + 1] if '--port' in a else '8000'; COVER = '--cover' in a  # --cover: tools/cover-probe.js를 끼워 넣어 가려진 화면 수를 <out>/<크기>-cover.json에
if VIEW: PHONE = VIEW.endswith('t')
OUT = os.path.join(ROOT, a[a.index('--out') + 1] if '--out' in a else 'docs/compare/space-stage2'); os.makedirs(OUT, exist_ok=True)
pre = ('phone' if PHONE else 'pc') + ('-secret' if SECRET else '') + ('-real' if REAL else '') + '-'; pre = (VIEW + '-' + pre) if VIEW else pre; R = {'dev': pre[:-1]}; T = {}
READ = 3.0 if REAL else 0.3
CLIP = """(()=>{window.__clip=[];const L=()=>{try{const Z=wlZone.cur;if(Z&&Z.state){const s=Z.state();const on=s.ride||s.cross||s.big||(s.stage==='finale'&&s.scene);
  if(on&&wlPhoto&&wlPhoto.body){const B=wlPhoto.body(wlGame.view.camera),q=B.rect,m=.015,out=Math.max(m-q[0]-m*2,m-q[1]-m*2,q[2]-1-m,q[3]-1-m,0);
   __clip.push([s.ride?'ride':s.cross?'cross':s.big?'big':'sunset',+out.toFixed(3)]);}}}catch(e){}requestAnimationFrame(L);};L();})()"""
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio', '--autoplay-policy=no-user-gesture-required', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'])
    o = dict(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True) if PHONE else dict(viewport={'width': 1280, 'height': 720})
    if VIDEO: o['record_video_dir'] = os.path.join(OUT, 'vid-' + pre[:-1]); o['record_video_size'] = dict(o['viewport'])
    if VIEW:
        vw, vh = [int(x) for x in VIEW.rstrip('t').split('x')]; o['viewport'] = {'width': vw, 'height': vh}
    CX = o['viewport']['width'] // 2
    c = b.new_context(**o)
    if COVER: c.add_init_script(open(os.path.join(ROOT, 'tools/cover-probe.js')).read())
    c.add_init_script(open(os.path.join(ROOT, 'tools/face-probe.js')).read())  # 마주 보기 전수 검사(대사 한 줄마다 서로를 향한 각도) — 늘 잼
    FACE = []
    def faceDump():
        try: FACE.extend(pg.evaluate('window.__face?window.__face.report().list:[]'))
        except Exception: pass
    V0 = time.time(); pg = c.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    pg.on('console', lambda m: m.type == 'error' and '404' not in m.text and errs.append(m.text[:300]))
    mark = lambda k: T.__setitem__(k, round(time.time() - V0, 1))
    shot = lambda n: pg.screenshot(path=os.path.join(OUT, pre + n + '.png'))
    W0 = CX
    pg.goto('http://localhost:' + PORT + '/?world=infinite-space&zone=space-garden&notitle&time=0' + ('&quality=mobile' if PHONE else '')); pg.evaluate('localStorage.clear()'); pg.reload()
    pg.wait_for_function('window.wlZone&&wlZone.cur&&wlZone.cur.spots', timeout=120000); pg.wait_for_timeout(2500)
    pg.evaluate("['have:infinite-space:necklace','space:demo','space:rock'].forEach(k=>wlGame.state.setFlag(k,true))")
    ex = pg.evaluate('wlZone.cur.spots.exit')
    pg.evaluate("([x,z])=>{const W=wlGame.mission.hero();W.position.x=x-3.2;W.position.z=z+.4;}", ex); pg.wait_for_timeout(800)
    pg.evaluate("([x,z])=>wlGame.mission.hero().userData.walkTo(x,z)", ex)
    for _ in range(600):
        if pg.evaluate("wlZone.cur&&wlZone.cur.name==='붉은 모래 언덕'&&wlZone.cur.arrival&&wlZone.cur.arrival()&&wlZone.cur.arrival().state.done"): break
        if pg.evaluate('wlGame.ui.cardShown()==="item"'): pass
        pg.wait_for_timeout(250)
    mark('화성 착지'); t_land = time.time(); shot('landed'); pg.evaluate(CLIP)
    S = pg.evaluate('wlZone.cur.spots')
    perf = {'걷기': [], '회오리': [], '노을': []}
    def stats():
        m = re.search(r'드로우콜 (\d+)회.*?삼각형 ([\d,]+)개', pg.evaluate("(document.getElementById('stats')||{}).textContent||''"))
        return (int(m.group(1)), int(m.group(2).replace(',', ''))) if m else None
    def sample(k):
        s = stats()
        if s: perf[k].append(s)
    def st(): return pg.evaluate('wlZone.cur.state()')
    def hero(js): return pg.evaluate("(()=>{const W=wlGame.mission.hero(),P=W.position,U=W.userData;return (" + js + ")})()")
    def closeCard():
        pg.keyboard.press('Escape'); pg.wait_for_timeout(350)
        if pg.evaluate('wlGame.ui.cardShown()') not in (None, 'item'):
            pg.evaluate("(()=>{const b=[...document.querySelectorAll('.wlg button')].find(b=>b.offsetParent&&/좋아요|가방에|넣기|확인|닫기/.test(b.textContent));if(b)b.click();})()"); pg.wait_for_timeout(350)
        if pg.evaluate('wlGame.ui.cardShown()') not in (None, 'item'): pg.mouse.click(W0, 300); pg.wait_for_timeout(400)
    def readAll(until=None, maxn=80):
        for _ in range(maxn):
            if until and pg.evaluate(until): return
            if pg.evaluate('wlGame.ui.cardShown()'):
                k = pg.evaluate('wlGame.ui.cardShown()')
                if k in ('item',): pg.wait_for_timeout(500); continue
                pg.wait_for_timeout(int(READ * 1000) + 300); closeCard(); continue
            if pg.evaluate('wlGame.ui.dialogShown()') or pg.evaluate('wlZone.cur.state().scene'):
                pg.wait_for_timeout(400); continue
            break
    def walk(x, z, sec=40, near=.6):
        pg.evaluate("([x,z])=>wlGame.mission.hero().userData.walkTo(x,z)", [x, z])
        for i in range(int(sec * 4)):
            if pg.evaluate("([x,z,n])=>{const P=wlGame.mission.hero().position;return Math.hypot(P.x-x,P.z-z)<n||!wlGame.mission.hero().userData.isWalking()}", [x, z, near]): break
            if i % 4 == 0: sample('걷기')
            pg.wait_for_timeout(250)
        return pg.evaluate("([x,z])=>{const P=wlGame.mission.hero().position;return Math.hypot(P.x-x,P.z-z)}", [x, z])
    def act(word, wait=10):
        for _ in range(int(wait * 5)):
            if word in pg.evaluate('wlGame.interact.prompt()') and not pg.evaluate('wlGame.interact.busy()'): break
            pg.wait_for_timeout(200)
        pg.keyboard.press('e'); pg.wait_for_timeout(300)
        if not pg.evaluate('wlGame.interact.busy()') and word in pg.evaluate('wlGame.interact.prompt()'): pg.evaluate('wlGame.interact.act()')
    def rideWhirl(key='whirl'):
        for k in range(40):
            s = st()
            if s['ride']: break
            w = s[key]; walk(w[0], w[1], 6, .3)
        mark('회오리 ' + key); pg.wait_for_timeout(2500); shot('ride-' + key + '-' + str(len([x for x in T if x.startswith('회오리')])))
        for _ in range(200):
            if not st()['ride']: break
            sample('회오리'); pg.wait_for_timeout(250)
        pg.wait_for_timeout(1500)
    def hop(c, top, frm=None):
        for k in range(6):
            if frm and k: walk(*frm, 8)
            pg.evaluate("(c)=>{const P=wlGame.mission.hero().position,C=wlGame.controls.input.cam,dx=c[0]-P.x,dz=c[1]-P.z;C.yaw=Math.atan2(-dx,-dz);}", c)  # 방향만(위아래는 구역이 징검다리 구간에서 내려다보게 맞춤 — 만지면 그만두므로 user는 올리지 않음)
            pg.keyboard.down('w'); pg.wait_for_timeout(80); pg.keyboard.press('Space')
            for _ in range(80):
                if pg.evaluate("(c)=>{const P=wlGame.mission.hero().position;return Math.hypot(c[0]-P.x,c[1]-P.z)<.45}", c): break
                pg.wait_for_timeout(25)
            pg.keyboard.up('w'); pg.wait_for_timeout(2300)
            if hero('U.vert.y') > top - .3: return True
        return False
    # ① 착각: 삐삐가 다가와 말을 검
    for _ in range(80):
        if st()['scene'] or st()['stage'] != 'meet': break
        pg.wait_for_timeout(250)
    pg.wait_for_timeout(1200); shot('meet'); mark('삐삐 만남')
    readAll(until="wlZone.cur.state().stage!=='meet'&&!wlZone.cur.state().scene"); readAll()
    R['삐삐 만남'] = pg.evaluate("!!wlGame.state.flags['mars:met']")
    if SECRET:
        rideWhirl('secretWhirl')  # 꼭대기: 깃발 꽂기(2026-11-12) → 리액션·한 바퀴 카메라·사진 안내·비밀 띠 카드 → '회오리 타고 내려가기'
        for _ in range(120):
            if st()['summit'] and not st()['ride']: break
            pg.wait_for_timeout(250)
        pg.wait_for_timeout(1500); shot('summit'); fsp = S['flagSpot']; sm = S['summit']; walk(fsp[0] + (sm[0] - fsp[0]) * .22, fsp[1] + (sm[1] - fsp[1]) * .22, 12, .4); act('깃발 꽂기'); pg.wait_for_timeout(3000); shot('summit-flag')
        for _ in range(120):
            if st()['flag'] and not st()['scene'] and not pg.evaluate('wlGame.ui.cardShown()'): break
            pg.wait_for_timeout(500)
        R['깃발 꽂음'] = st()['flag']
        for _ in range(60):  # 고원을 걸어 내려가는 회오리로
            s2 = st()
            if s2['ride'] or not s2['summit']: break
            w = s2['secretWhirl']; pg.evaluate("([x,z])=>wlGame.mission.hero().userData.walkTo(x,z)", w); pg.wait_for_timeout(400)
        for _ in range(200):
            s = st()
            if not s['ride'] and not s['scene'] and not s['summit']: break
            pg.wait_for_timeout(250)
        R['비밀 화산'] = pg.evaluate("!!wlGame.state.flags['secret:infinite-space:volcano']")
    # ② 언덕 → 부르기
    sp = S['pipiSpot']; walk(sp[0] - 2.4, sp[1] + .6, 60)
    for _ in range(80):
        if st()['scene']: break
        walk(sp[0] - 2.2, sp[1] + .4, 3); pg.wait_for_timeout(250)
    mark('부르기'); pg.wait_for_timeout(2600); shot('call-jumble')
    readAll(until="wlGame.state.flags['mars:call']&&!wlZone.cur.state().scene"); readAll()
    R['부르기·소리 발견'] = pg.evaluate("[!!wlGame.state.flags['mars:call'],!!wlGame.state.flags['secret:infinite-space:marssound']]")
    # ③ 녹음
    act('녹음하기'); pg.wait_for_timeout(1600); shot('record'); mark('녹음')
    readAll(until="wlGame.state.flags['mars:recA']&&!wlZone.cur.state().scene"); readAll()
    R['녹음'] = pg.evaluate("!!wlGame.state.flags['mars:recA']")
    # ④ 회오리 타고 건넘
    rideWhirl(); R['건넘'] = hero('P.x') > 36
    # ⑤ 징검다리
    stones = S['stones']; le = S['landE']; mark('징검다리')
    walk(stones[0][0] - 2.2, stones[0][1] - 1.2, 20)
    pg.wait_for_timeout(1500); shot('stones-start')
    ok = True; prev = [stones[0][0] - 2.2, stones[0][1] - 1.2]
    for s3 in stones:
        ok = hop(s3[:2], s3[2], prev) and ok; prev = s3[:2]
    rk = S['rock']; ok = hop([rk[0] - .4, rk[1] + .6], S['rockTop'], prev) and ok
    R['바위 위'] = ok; R['바위 위 높이'] = round(hero('U.vert.y'), 2); shot('rock-top'); mark('바위 위'); R['징검다리 구간(초)'] = round(T['바위 위'] - T['징검다리'], 1)
    # 둥둥에게 틀어 줌
    act('테이프 틀기'); pg.wait_for_timeout(2500); shot('dung-tape'); mark('둥둥 테이프')
    readAll(until="wlGame.state.flags['mars:recB']&&!wlZone.cur.state().scene", maxn=120); readAll()
    R['둥둥 녹음'] = pg.evaluate("!!wlGame.state.flags['mars:recB']")
    # 바위에서 내려옴 → 회오리 → 돌아옴
    walk(le[0] + 1.5, le[1] - 2, 20); rideWhirl(); R['돌아옴'] = hero('P.x') < 24
    # ⑥ 삐삐에게 틀어 줌 → 둥둥 건너옴 → ⑦ 노을 → ⑧ 큰 회오리
    pp = st()['pipi']; walk(pp[0] - 1.6, pp[2] + .4, 30)
    act('테이프 틀기'); mark('삐삐 테이프')
    for i in range(400):
        s = st()
        if s['cross'] and 'cross' not in T: mark('cross'); pg.wait_for_timeout(3000); shot('dung-cross')
        if s['stage'] == 'finale' and s['sky'] > .6 and 'sunset' not in T: mark('sunset'); shot('sunset')
        if s['stage'] == 'finale': sample('노을')
        if s['big'] and 'big' not in T: mark('big'); pg.wait_for_timeout(4000); shot('big-lift')
        if pg.evaluate("!!wlGame.state.flags['clear:space-mars']"): break  # 완료 카드가 닫히면 내려놓지 않고 금성으로 떠남(2026-11-12)
        if pg.evaluate('wlGame.ui.cardShown()') and pg.evaluate('wlGame.ui.cardShown()') != 'item':
            if 'sunset' in T and 'blueCard' not in T: mark('blueCard'); shot('blue-card')
            pg.wait_for_timeout(int(READ * 1000) + 300); closeCard()
        pg.wait_for_timeout(250)
    mark('STAGE 2 완료'); pg.wait_for_timeout(1500); shot('clear')
    R['완료'] = pg.evaluate("!!wlGame.state.flags['clear:space-mars']")
    R['유리 조각'] = pg.evaluate("!!wlGame.state.flags['item:infinite-space:bluesunset-glass']")
    R['발견'] = pg.evaluate("['marssound','bluesunset','volcano'].map(k=>!!wlGame.state.flags['secret:infinite-space:'+k])")
    R['착지부터 완료까지(초)'] = round(time.time() - t_land, 1); R['읽는 시간 넣음'] = REAL
    # 화성 → 금성(큰 회오리가 감아올림 → 우주(지구·달) → 우주 지도 → 금성 구름 속으로 → 내려앉아 조작이 풀림)
    for i in range(400):
        zn = pg.evaluate('wlZone.cur.name')
        if zn != '금성 구름':
            s3 = st()
            if s3.get('earth') and 'earth' not in T: mark('earth'); pg.wait_for_timeout(1500); shot('to-venus-earth')
            if pg.evaluate("!!document.getElementById('wlTravelMap')") and 'map2' not in T: mark('map2'); pg.wait_for_timeout(2600); shot('to-venus-map')
        else:
            if 'venus' not in T: mark('venus'); pg.wait_for_timeout(1500); shot('venus-descend')
            if pg.evaluate('wlZone.cur.state().arrDone'): mark('금성 조작 풀림'); break
        pg.wait_for_timeout(200)
    pg.wait_for_timeout(1000); shot('venus-free'); R['금성 착지'] = pg.evaluate('wlZone.cur.name') == '금성 구름'
    L = pg.evaluate('wlGame.travel.log?wlGame.travel.log():{}') or {}; d = lambda x, y: round(L[y] - L[x], 2) if L.get(x) is not None and L.get(y) is not None else None
    R['금성 이동 단계 길이(초)'] = {'다가와 감쌈': d('touch', 'lift'), '들림(완료 카드)': d('lift', 'rise'), '감아올림': d('rise', 'space'), '우주(지구·달)': d('space', 'map'), '우주 지도': d('map', 'orb'), '금성이 커져 구름에 덮임': d('orb', 'cloud'), '닿아서 구름까지': d('touch', 'cloud'), '지구가 화면에 있던 시간': L.get('earthSec'), '해결 화음 − 구름 진입': d('cloud', 'resolve')}
    R['조작 풀림'] = pg.evaluate("!wlGame.mission.hero().userData.riding&&!wlGame.mission.hero().userData.sceneLock&&!wlGame.core.blocking()")
    P0 = hero('[P.x,P.z]'); pg.keyboard.down('w'); pg.wait_for_timeout(900); pg.keyboard.up('w'); P1 = hero('[P.x,P.z]')
    R['금성에서 걸음(m)'] = round(((P1[0]-P0[0])**2 + (P1[1]-P0[1])**2) ** .5, 2)
    # 끝낸 뒤의 모습(2026-11-11): 게임을 다시 열어도 노을·삐삐·둥둥 마지막 자리 그대로인지 — 다시 연 직후(착지 자리)와 노을 언덕에서 한 장씩
    import re as _re
    u2 = pg.url; u2 = _re.sub(r'zone=[^&]*', 'zone=space-mars', u2) if 'zone=' in u2 else u2 + ('&' if '?' in u2 else '?') + 'zone=space-mars'; u2 = _re.sub(r'&time=\d', '', u2)
    faceDump(); CV0 = pg.evaluate('window.__cover?window.__cover.report():null') if COVER else None  # 다시 열면 재던 값이 지워지므로 그 전에 받아 둠
    pg.goto('about:blank'); pg.goto(u2); pg.wait_for_function('window.wlZone&&wlZone.cur&&wlZone.cur.spots&&wlZone.cur.spots.sunsetWL', timeout=120000); pg.wait_for_timeout(3500); shot('reopen-spawn')
    pg.evaluate("(()=>{const W=wlGame.mission.hero(),s=wlZone.cur.spots.sunsetWL;W.position.x=s[0]+3.2;W.position.z=s[1];W.rotation.y=-Math.PI/2;const I=wlGame.controls.input;I.cam.yaw=Math.PI/2;I.cam.pitch=.22;})()"); pg.wait_for_timeout(2500); shot('reopen-hill')
    hero("(W.position.x=wlZone.cur.spots.hill[0]-14,W.position.z=wlZone.cur.spots.hill[1]+8,0)"); pg.wait_for_timeout(800)
    # 노을 뒤 돌아다니기(2026-11-11 — 안개가 짙어 갈색 화면이 됐다): 네 방향을 보며 한 장씩 + 안개 값
    for i in range(4):
        pg.evaluate("i=>{wlGame.controls.input.cam.yaw+=Math.PI/2;}", i); pg.keyboard.down('w'); pg.wait_for_timeout(1600); pg.keyboard.up('w'); pg.wait_for_timeout(500); shot('dusk-walk%d' % i)
    R['노을 뒤 안개'] = pg.evaluate("(()=>{let s=wlGame.mission.hero();while(s.parent)s=s.parent;const f=s.fog,c=wlGame.view.camera;return {near:+f.near.toFixed(1),far:+f.far.toFixed(1),color:'#'+f.color.getHexString(),camFar:c.far,sky:wlZone.cur.state().sky}})()")
    R['다시 열기'] = pg.evaluate("(()=>{const s=wlZone.cur.state(),a=wlGame.state.afterOf('space-mars');let sc=wlGame.mission.hero();while(sc.parent)sc=sc.parent;return {sky:s.sky,pipi:s.pipi,dung:s.dung,after:a,fog:'#'+sc.fog.color.getHexString()}})()")
    cl = pg.evaluate('window.__clip||[]'); R['잘림 기록 프레임'] = len(cl)
    R['잘린 프레임(1% 넘게)'] = {k: sum(1 for x in cl if x[0] == k and x[1] > .01) for k in ('ride', 'cross', 'sunset', 'big')}
    R['잘림 최대'] = max([x[1] for x in cl] or [0])
    def agg(v): return {'최대 드로우콜': max(x[0] for x in v), '평균 드로우콜': round(sum(x[0] for x in v) / len(v), 1), '최대 삼각형': max(x[1] for x in v)} if v else None
    R['그리기'] = {k: agg(v) for k, v in perf.items()}
    R['오류'] = errs; R['시각(초)'] = T
    vid = pg.video.path() if VIDEO else None
    if COVER:
        cv = CV0 or pg.evaluate('window.__cover.report()'); R['가림'] = {'화면': cv['screens'], '가려짐': cv['covered']}; json.dump(cv, open(os.path.join(OUT, pre + 'cover.json'), 'w'), ensure_ascii=False, indent=1)
    faceDump(); bad = [x for x in FACE if x['flag'] == '어긋남']; R['마주 보기'] = {'대사': len(FACE), '45도 넘게 어긋남': len(bad), '예외(보는 곳 표시)': sum(1 for x in FACE if x['flag'].startswith('예외')), '어긋난 줄': [x['who'] + ': ' + x['text'][:22] for x in bad]}
    json.dump(FACE, open(os.path.join(OUT, pre + 'face-s2-' + (a[a.index('--face') + 1] if '--face' in a else 'after') + '.json'), 'w'), ensure_ascii=False, indent=1)
    c.close(); b.close()
    if vid: shutil.move(vid, os.path.join(OUT, pre + 'stage2.webm')); shutil.rmtree(os.path.join(OUT, 'vid-' + pre[:-1]), ignore_errors=True)
json.dump(R, open(os.path.join(OUT, pre + 'result.json'), 'w'), ensure_ascii=False, indent=1)
print(json.dumps(R, ensure_ascii=False, indent=1))
