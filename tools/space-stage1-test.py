# -*- coding: utf-8 -*-
"""무한 우주 STAGE 1 회색 정원 처음부터 끝까지 (2026-11-07, 2026-11-08 망원경·떡방아·행성 24m) — 촬영 서버(8000)가 떠 있을 때 저장소 루트에서:
   python3 tools/space-stage1-test.py [--out docs/compare/space-stage1] [--phone] [--video] [--real]
   2026-11-17 새 흐름: 타이틀 '새로 시작' → 탐험 준비 → 이야기 소개 → 바로 목걸이 → 할아버지가 다가와 이어지는 대화(점프 안내에서 Space)
   → 떡방아 → 망원경 → 높은 바위 → 얼음 동굴 → 출구 한가운데 → 별똥별 → 화성(삐삐가 말을 검). 아래는 예전 설명.
   기록을 지운 첫 방문 ?world=infinite-space: 타이틀 '새로 시작' → 탐험 준비 '모험 떠나기' → 이야기 소개 세 단계 → 미션(숨방울 목걸이) →
   망원경 '살펴보기'(시야·발견) → 떡방아 '찧기' 세 번(달떡) → 목걸이까지 걸어감 → 얻음·목에 걺 → 얼음 동굴(비밀) → 할아버지에게 돌아감 → 둥실 뛰기 시범 →
   높은 바위로 둥실 뛰어 오름 → 첫 빈칸 → 출구 → STAGE 1 완료 → 별똥별 꼬리 타기 → 화성 착지(조작 풀림·화면 UI 돌아옴·걸음). 자리는 구역이 알려 줌(wlZone.cur.spots — 행성 크기가 바뀌어도 그대로).
   --real: 사람처럼 읽는 시간을 둠(카드·대사마다 약 3초, 이야기 소개는 글자가 다 써질 때까지, 망원경 6초) → '처음부터 끝까지 걸린 시간'을 잴 때.
   단계마다 화면을 <out>/에, 결과 JSON(단계별 시각 포함), --video면 녹화(webm → <out>/<pc|phone>-stage1.webm, 단계 시각은 영상 시작 기준). 소리 끔, 끝나면 닫음."""
import json, os, sys, shutil, time
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
args = sys.argv[1:]; PHONE = '--phone' in args; VIDEO = '--video' in args; REAL = '--real' in args
VIEW = args[args.index('--view') + 1] if '--view' in args else None  # --view 844x390t (끝에 t = 터치 기기) — 화면 가림 재기용 크기
PORT = args[args.index('--port') + 1] if '--port' in args else '8000'; COVER = '--cover' in args  # --cover: tools/cover-probe.js를 끼워 넣어 가려진 화면 수를 <out>/<크기>-cover.json에
if VIEW: PHONE = VIEW.endswith('t')
OUT = os.path.join(ROOT, args[args.index('--out') + 1] if '--out' in args else 'docs/compare/space-stage1'); os.makedirs(OUT, exist_ok=True)
pre = 'phone-' if PHONE else 'pc-'; pre = (VIEW + '-' + pre) if VIEW else pre; R = {}; T = {}
READ = 3.0 if REAL else 0.4
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio', '--autoplay-policy=no-user-gesture-required', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'])
    o = dict(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True) if PHONE else dict(viewport={'width': 1280, 'height': 720})
    if VIDEO: o['record_video_dir'] = os.path.join(OUT, 'vid'); o['record_video_size'] = {'width': o['viewport']['width'], 'height': o['viewport']['height']}
    if VIEW:
        vw, vh = [int(x) for x in VIEW.rstrip('t').split('x')]; o['viewport'] = {'width': vw, 'height': vh}
    CX = o['viewport']['width'] // 2
    c = b.new_context(**o)
    if COVER: c.add_init_script(open(os.path.join(ROOT, 'tools/cover-probe.js')).read())
    if os.environ.get('WL_INIT'): c.add_init_script(open(os.path.join(ROOT, os.environ['WL_INIT'])).read())  # 덧붙일 측정 스크립트(목소리 시험 tools/voice-probe.js — WL_Q는 주소 뒤에 붙일 글)
    c.add_init_script(open(os.path.join(ROOT, 'tools/face-probe.js')).read())  # 마주 보기 전수 검사(대사 한 줄마다 서로를 향한 각도) — 늘 잼
    FACE = []
    def faceDump():
        try: FACE.extend(pg.evaluate('window.__face?window.__face.report().list:[]'))
        except Exception: pass
    V0 = time.time(); pg = c.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    pg.on('console', lambda m: m.type == 'error' and '404' not in m.text and errs.append(m.text[:300]))
    mark = lambda k: T.__setitem__(k, round(time.time() - V0, 1))
    pg.goto('http://localhost:' + PORT + '/?world=infinite-space' + os.environ.get('WL_Q', '')); pg.evaluate('localStorage.clear()'); pg.reload()
    pg.wait_for_selector('#wlTitle .go', timeout=120000); pg.wait_for_timeout(2500)
    shot = lambda n: pg.screenshot(path=os.path.join(OUT, pre + n + '.png'))
    shot('title')
    pg.click('#wlTitle .go'); t_start = time.time(); mark('새로 시작'); pg.wait_for_selector('#wlWard.on'); pg.wait_for_timeout(int(1000 + READ * 800)); shot('explorer')
    pg.click('#wlWard .done'); pg.wait_for_selector('#wlStory.on')
    for i in range(3):
        pg.wait_for_timeout(3200 if not REAL else 5200); shot(f'story-{i+1}')
        d0 = pg.eval_on_selector_all('#wlStory .dots i', 'd=>d.findIndex(x=>x.className==="on")'); pg.click('#wlStory .next')
        if pg.eval_on_selector('#wlStory', 'e=>e.classList.contains("on")') and pg.eval_on_selector_all('#wlStory .dots i', 'd=>d.findIndex(x=>x.className==="on")') == d0: pg.click('#wlStory .next')
    pg.wait_for_timeout(2200)
    if pg.evaluate("!document.getElementById('wlHelp').hidden"): pg.wait_for_timeout(int(READ * 1000)); pg.click('#wlHelp .close'); pg.wait_for_timeout(400)
    pg.wait_for_timeout(1200); shot('mission-card'); mark('미션 시작')
    S = pg.evaluate('wlZone.cur.spots'); R['행성 반지름'] = S['R']
    def hero(js): return pg.evaluate("(()=>{const W=wlGame.mission.hero(),P=W.position,U=W.userData;return (" + js + ")})()")
    def readAll():
        for _ in range(30):
            if pg.evaluate('wlGame.ui.dialogShown()'):
                pg.wait_for_timeout(int(READ * 1000)); pg.keyboard.press('e'); pg.wait_for_timeout(250); continue
            if pg.evaluate("wlGame.ui.cardShown()==='profile'"):  # 친구 카드는 단추로 닫음
                pg.wait_for_timeout(int(READ * 1000)); pg.evaluate("document.querySelector('#wlProf button').click()"); pg.wait_for_timeout(400); continue
            if pg.evaluate('wlGame.ui.cardShown()'):
                pg.wait_for_timeout(int(READ * 1000)); pg.mouse.click(CX, 300); pg.wait_for_timeout(400); continue
            break
    def walk(x, z, sec=40):
        pg.evaluate("([x,z])=>wlGame.mission.hero().userData.walkTo(x,z)", [x, z])
        for _ in range(int(sec * 4)):
            if pg.evaluate("([x,z])=>{const P=wlGame.mission.hero().position;return Math.hypot(P.x-x,P.z-z)<.6||!wlGame.mission.hero().userData.isWalking()}", [x, z]): break
            pg.wait_for_timeout(250)
        return pg.evaluate("([x,z])=>{const P=wlGame.mission.hero().position;return Math.hypot(P.x-x,P.z-z)}", [x, z])
    def act(word, wait=8):
        for _ in range(int(wait * 5)):
            if word in pg.evaluate('wlGame.interact.prompt()') and not pg.evaluate('wlGame.interact.busy()'): break
            pg.wait_for_timeout(200)
        pg.keyboard.press('e'); pg.wait_for_timeout(300)
        if not pg.evaluate('wlGame.interact.busy()') and word in pg.evaluate('wlGame.interact.prompt()'): pg.evaluate('wlGame.interact.act()')
    def waitSay(sec=60):  # 장면 대사(누르지 않아도 넘어감)가 끝날 때까지
        for _ in range(int(sec * 5)):
            if not pg.evaluate('wlGame.ui.dialogShown()'): break
            pg.wait_for_timeout(200)
    # 2026-11-17 새 흐름: 시작하면 바로 목걸이 → 할아버지가 다가와 이어지는 대화 → 점프 → 떡방아 → 망원경 → 높은 바위 → 얼음 동굴 → 출구
    for _ in range(60):
        if pg.evaluate('wlGame.mission.missionState()?.got'): break
        pg.wait_for_timeout(250)
    mark('목걸이 얻음'); pg.wait_for_timeout(1200); shot('necklace-get')
    for _ in range(40):
        if not pg.evaluate("wlGame.itemget.itemGetting()"): break
        pg.wait_for_timeout(200)
    R['목걸이'] = hero('!!U.breathBubble')
    said = []; tip = False
    for _ in range(600):  # 이어지는 대화: 대사를 모으다가 '점프 버튼' 안내가 뜨면 뜀
        if pg.evaluate("wlGame.ui.cardShown()==='profile'"):  # 2026-11-21: 친구 카드는 처음 만나는 순간(첫 대사 앞)에 뜬다 — 대사가 하나도 나오기 전이어야 함
            R['친구 카드가 첫 대사 앞에'] = not said; pg.wait_for_timeout(1000); shot('friend-card-first'); pg.evaluate("document.querySelector('#wlProf button').click()"); pg.wait_for_timeout(400); continue
        tx = pg.evaluate("wlGame.ui.dialogShown()?document.querySelector('#wlDlg .line').textContent:''")
        if tx and (not said or said[-1] != tx):
            said.append(tx)
            if len(said) == 1: mark('첫 만남 대화'); pg.wait_for_timeout(900); shot('intro-talk')
        if '점프' in tx and '눌러' in tx:
            tip = True; pg.wait_for_timeout(700); shot('jump-tip'); pg.wait_for_timeout(int((1.5 if REAL else .2) * 1000)); pg.keyboard.press('Space'); mark('점프'); break
        pg.wait_for_timeout(100)
    R['점프 안내'] = tip
    for _ in range(200):
        tx = pg.evaluate("wlGame.ui.dialogShown()?document.querySelector('#wlDlg .line').textContent:''")
        if tx and said[-1] != tx: said.append(tx)
        if pg.evaluate("!!wlGame.state.flags['space:demo']"): break
        pg.wait_for_timeout(100)
    R['첫 만남 대사'] = said; R['시범'] = pg.evaluate("!!wlGame.state.flags['space:demo']"); pg.wait_for_timeout(900); shot('friend-card'); readAll(); mark('첫 만남 끝')
    pg.wait_for_timeout(600); shot('todo'); R['할 일'] = pg.evaluate("document.getElementById('wlQuest').textContent"); R['할 일 표시'] = pg.evaluate("(document.getElementById('wlTodo')||{}).textContent||''")
    # 떡방아
    walk(*S['mortar'])
    pg.evaluate("()=>{const C=wlGame.controls.input.cam;C.user=(C.user||0)+1;C.yaw=-.5;C.pitch=.32;}")
    for k in range(3):
        act('찧기'); pg.wait_for_timeout(1250)
        if k == 0: mark('떡방아 첫 찧기'); pg.wait_for_timeout(700); shot('ricecake')
        pg.wait_for_timeout(int((1.2 if REAL else .5) * 1000))
    pg.wait_for_timeout(3200); shot('ricecake-card'); pg.wait_for_timeout(2600); shot('ricecake-nar'); pg.wait_for_timeout(int((2.5 if REAL else 1.2) * 1000))
    R['달떡'] = pg.evaluate("!!wlGame.state.flags['item:infinite-space:dalddeok']"); R['할 일(떡방아 뒤)'] = pg.evaluate("document.getElementById('wlQuest').textContent")
    # 망원경
    walk(*S['scope']); act('살펴보기'); pg.wait_for_timeout(2600); mark('망원경 시야'); pg.wait_for_timeout(2000); shot('telescope')
    R['망원경 시야'] = pg.evaluate("!!document.getElementById('wlScope')"); R['망원경 자막'] = pg.evaluate("(document.querySelector('#wlScope .say')||{}).textContent||''"); pg.wait_for_timeout(int((4 if REAL else .6) * 1000))
    pg.mouse.click(CX, 300); pg.wait_for_timeout(1200); shot('telescope-card'); pg.wait_for_timeout(int((3 if REAL else .4) * 1000)); R['망원경 발견'] = pg.evaluate("!!wlGame.state.flags['secret:infinite-space:telescope']")
    R['할 일(망원경 뒤)'] = pg.evaluate("document.getElementById('wlQuest').textContent"); R['할 일 표시(망원경 뒤)'] = pg.evaluate("(document.getElementById('wlTodo')||{}).innerHTML||''").count('class="d"')
    bo = S['bobo']
    # 높은 바위: 할아버지 쪽 가장자리 → 바위 쪽으로 W를 누른 채 Space, 가운데 위에 오면 W를 뗌
    rc, rr = S['rock'], S['rockR']; dx, dz = bo[0] - rc[0], bo[1] - rc[1]; dl = (dx * dx + dz * dz) ** .5; edge = [rc[0] + dx / dl * (rr + 1.3), rc[1] + dz / dl * (rr + 1.3)]
    walk(*edge, 60); mark('바위 앞')
    for k in range(6):
        if k: walk(*edge, 8)
        for _ in range(40):
            if not pg.evaluate('wlGame.ui.dialogShown()'): break
            pg.wait_for_timeout(250)
        pg.evaluate("(c)=>{const P=wlGame.mission.hero().position,C=wlGame.controls.input.cam,dx=c[0]-P.x,dz=c[1]-P.z;C.yaw=Math.atan2(-dx,-dz);C.pitch=.35;C.user=(C.user||0)+1;}", rc)
        pg.keyboard.down('w'); pg.wait_for_timeout(80); pg.keyboard.press('Space')
        if k == 0: pg.wait_for_timeout(500); shot('hop-up')
        for _ in range(40):
            if pg.evaluate("(c)=>{const P=wlGame.mission.hero().position;return Math.hypot(c[0]-P.x,c[1]-P.z)<.5}", rc): break
            pg.wait_for_timeout(25)
        pg.keyboard.up('w'); pg.wait_for_timeout(2200)
        if hero('U.vert.y') > S['rockTop'] - .3: break
    R['바위 위 높이'] = hero('U.vert.y'); pg.wait_for_timeout(800); shot('rock-top')
    pg.wait_for_timeout(700); shot('first-blank'); R['첫 빈칸'] = pg.evaluate("!!wlGame.state.flags['space:rock']"); readAll(); pg.wait_for_timeout(900); shot('after-map')
    # 바위에서 내려와 바위 뒤쪽(원더룹 앞에 바위가 보이게)에서 한 장 — PC에서 바위가 또렷한지
    walk(edge[0] + (edge[0] - rc[0]) * .3, edge[1] + (edge[1] - rc[1]) * .3, 10)
    pg.evaluate("(c)=>{const P=wlGame.mission.hero().position,C=wlGame.controls.input.cam,dx=c[0]-P.x,dz=c[1]-P.z;C.yaw=Math.atan2(-dx,-dz);C.pitch=.3;C.user=(C.user||0)+1;}", rc); pg.wait_for_timeout(1500); shot('rock-clear')
    R['바위 흐림(0이면 또렷)'] = pg.evaluate("(()=>{let k=null;const sc=wlGame.mission.hero().parent;sc.traverse(o=>{if(o.name==='highrock')k=o.material.opacity;});return k==null?null:+(1-k).toFixed(2)})()")
    R['바위 뒤 안내'] = pg.evaluate("document.getElementById('wlToast').textContent"); pg.wait_for_timeout(int((3 if REAL else .3) * 1000))
    # 얼음 동굴(입구는 분화구 가운데 쪽) → 출구 한가운데
    mark('얼음 동굴로'); R['할 일(바위 뒤)'] = pg.evaluate("document.getElementById('wlQuest').textContent")
    R['할 일 표시(바위 뒤)'] = pg.evaluate("(document.getElementById('wlTodo')||{}).textContent||''")
    if not REAL:  # 2026-11-17: 얼음 동굴을 안 지나고 출구에 서면 끝나지 않고 안내만(자리만 잠깐 옮겨 봄 — 걸린 시간을 잴 때는 건너뜀)
        P0 = hero('[P.x,P.y,P.z]'); ex0 = S['exit']
        pg.evaluate("(e)=>{const W=wlGame.mission.hero();if(W.userData.stopWalk)W.userData.stopWalk();W.position.x=e[0];W.position.z=e[1];}", ex0); pg.wait_for_timeout(900)
        R['동굴 전 출구에서 완료'] = pg.evaluate("!!wlGame.state.flags['clear:space-garden']"); R['동굴 전 출구 안내'] = pg.evaluate("document.getElementById('wlToast').textContent"); shot('exit-before-cave')
        pg.evaluate("(p)=>{const W=wlGame.mission.hero();W.position.x=p[0];W.position.z=p[2];}", P0); pg.wait_for_timeout(600)
    cv = S['cave']; walk(cv[0], cv[1] + 2.3); walk(cv[0], cv[1] + .2, 8); pg.wait_for_timeout(1500); shot('icecave'); R['비밀'] = pg.evaluate("!!wlGame.state.flags['secret:infinite-space:icecave']"); pg.wait_for_timeout(int((3 if REAL else .3) * 1000))
    walk(cv[0], cv[1] + 3.5); R['할 일(동굴 뒤)'] = pg.evaluate("document.getElementById('wlQuest').textContent")
    ex = S['exit']; mark('출구로 출발')
    sh = S['shade']; walk(rc[0] - .5, sh[1] - 9.5, 40) # 그늘 분화구·얼음 동굴 서쪽으로 돌아서
    walk(ex[0] - 1.45, ex[1], 60); pg.wait_for_timeout(700); R['출구 가장자리(1.45m)에서 완료'] = pg.evaluate("!!wlGame.state.flags['clear:space-garden']"); shot('exit-edge')
    for k in range(6):
        d = walk(*ex, 20)
        if pg.evaluate("!!wlGame.state.flags['clear:space-garden']"): break
        P = hero('[P.x,P.z]'); walk(P[0] + (3 if k % 2 else -3), P[1] + 2, 6)
    pg.wait_for_timeout(1500); shot('stage-clear'); R['완료'] = pg.evaluate("!!wlGame.state.flags['clear:space-garden']"); mark('STAGE 1 완료')
    R['처음부터 끝까지(초)'] = round(time.time() - t_start, 1); R['읽는 시간 넣음'] = REAL
    # 별똥별 꼬리 타기(2026-11-09): 카드 뒤 별똥별이 내려와 → 비행 → 화성 착지 → 조작이 풀리고 화면 UI가 돌아옴
    for _ in range(240):
        if pg.evaluate("!!(wlZone.cur.ride&&wlZone.cur.ride()&&wlZone.cur.ride().state.phase==='fly')"): break
        pg.wait_for_timeout(250)
    mark('별똥별 출발'); pg.wait_for_timeout(5000); shot('meteor-flight')
    for _ in range(240):
        if pg.evaluate("wlZone.cur&&wlZone.cur.arrival&&wlZone.cur.arrival()&&wlZone.cur.arrival().state.done"): break
        pg.wait_for_timeout(250)
    pg.wait_for_timeout(800); shot('mars-landed'); mark('화성 착지')
    R['화성 착지'] = pg.evaluate("!!(wlZone.cur.arrival&&wlZone.cur.arrival()&&wlZone.cur.arrival().state.done)")
    R['조작 풀림'] = pg.evaluate("!wlGame.mission.hero().userData.riding&&!wlGame.core.blocking('meteor')")
    R['화면 UI 돌아옴'] = pg.evaluate("wlGame.ui.hintsVisible()&&!document.getElementById('wlRideCam')&&getComputedStyle(document.getElementById('wlHud')).visibility!=='hidden'")
    for _ in range(160):  # 2026-11-17: 착지하면 곧(도착 나레이션 + 2초 뒤) 삐삐가 달려와 말을 검(조작은 그 장면이 끝난 뒤)
        if pg.evaluate('wlGame.ui.dialogShown()'): break
        pg.wait_for_timeout(100)
    R['화성: 삐삐가 말을 검'] = pg.evaluate('wlGame.ui.dialogShown()'); shot('mars-pipi')
    R['오류'] = errs; R['영상 시각(초)'] = T
    vid = pg.video.path() if VIDEO else None
    if COVER:
        cv = pg.evaluate('window.__cover.report()'); R['가림'] = {'화면': cv['screens'], '가려짐': cv['covered']}; json.dump(cv, open(os.path.join(OUT, pre + 'cover.json'), 'w'), ensure_ascii=False, indent=1)
    faceDump(); bad = [x for x in FACE if x['flag'] == '어긋남']; R['마주 보기'] = {'대사': len(FACE), '45도 넘게 어긋남': len(bad), '예외(보는 곳 표시)': sum(1 for x in FACE if x['flag'].startswith('예외')), '어긋난 줄': [x['who'] + ': ' + x['text'][:22] for x in bad]}
    json.dump(FACE, open(os.path.join(OUT, pre + 'face-s1-' + (args[args.index('--face') + 1] if '--face' in args else 'after') + '.json'), 'w'), ensure_ascii=False, indent=1)
    if os.environ.get('WL_VOUT'):
        try: json.dump(pg.evaluate('window.__voice.report()'), open(os.environ['WL_VOUT'], 'w'), ensure_ascii=False, indent=1)
        except Exception as e: print('목소리 기록 실패', e)
    c.close(); b.close()
    if vid: shutil.move(vid, os.path.join(OUT, pre + 'stage1.webm')); shutil.rmtree(os.path.join(OUT, 'vid'), ignore_errors=True)
json.dump(R, open(os.path.join(OUT, pre + 'result.json'), 'w'), ensure_ascii=False, indent=1)
print(json.dumps(R, ensure_ascii=False, indent=1))
