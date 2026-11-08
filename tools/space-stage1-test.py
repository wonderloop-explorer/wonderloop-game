# -*- coding: utf-8 -*-
"""무한 우주 STAGE 1 회색 정원 처음부터 끝까지 (2026-11-07, 2026-11-08 망원경·떡방아·행성 24m) — 촬영 서버(8000)가 떠 있을 때 저장소 루트에서:
   python3 tools/space-stage1-test.py [--out docs/compare/space-stage1] [--phone] [--video] [--real]
   기록을 지운 첫 방문 ?world=infinite-space: 타이틀 '새로 시작' → 탐험 준비 '모험 떠나기' → 이야기 소개 세 단계 → 미션(숨방울 목걸이) →
   망원경 '살펴보기'(시야·발견) → 떡방아 '찧기' 세 번(달떡) → 목걸이까지 걸어감 → 얻음·목에 걺 → 얼음 동굴(비밀) → 할아버지에게 돌아감 → 둥실 뛰기 시범 →
   높은 바위로 둥실 뛰어 오름 → 첫 빈칸 → 출구 → STAGE 1 완료. 자리는 구역이 알려 줌(wlZone.cur.spots — 행성 크기가 바뀌어도 그대로).
   --real: 사람처럼 읽는 시간을 둠(카드·대사마다 약 3초, 이야기 소개는 글자가 다 써질 때까지, 망원경 6초) → '처음부터 끝까지 걸린 시간'을 잴 때.
   단계마다 화면을 <out>/에, 결과 JSON(단계별 시각 포함), --video면 녹화(webm → <out>/<pc|phone>-stage1.webm, 단계 시각은 영상 시작 기준). 소리 끔, 끝나면 닫음."""
import json, os, sys, shutil, time
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
args = sys.argv[1:]; PHONE = '--phone' in args; VIDEO = '--video' in args; REAL = '--real' in args
OUT = os.path.join(ROOT, args[args.index('--out') + 1] if '--out' in args else 'docs/compare/space-stage1'); os.makedirs(OUT, exist_ok=True)
pre = 'phone-' if PHONE else 'pc-'; R = {}; T = {}
READ = 3.0 if REAL else 0.4
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio', '--autoplay-policy=no-user-gesture-required', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'])
    o = dict(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True) if PHONE else dict(viewport={'width': 1280, 'height': 720})
    if VIDEO: o['record_video_dir'] = os.path.join(OUT, 'vid'); o['record_video_size'] = {'width': o['viewport']['width'], 'height': o['viewport']['height']}
    c = b.new_context(**o); V0 = time.time(); pg = c.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    pg.on('console', lambda m: m.type == 'error' and '404' not in m.text and errs.append(m.text[:300]))
    mark = lambda k: T.__setitem__(k, round(time.time() - V0, 1))
    pg.goto('http://localhost:8000/?world=infinite-space'); pg.evaluate('localStorage.clear()'); pg.reload()
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
    R['할 일'] = pg.evaluate("document.getElementById('wlQuest').textContent")
    def hero(js): return pg.evaluate("(()=>{const W=wlGame.mission.hero(),P=W.position,U=W.userData;return (" + js + ")})()")
    def readAll():
        for _ in range(30):
            if pg.evaluate('wlGame.ui.dialogShown()'):
                pg.wait_for_timeout(int(READ * 1000)); pg.keyboard.press('e'); pg.wait_for_timeout(250); continue
            if pg.evaluate('wlGame.ui.cardShown()'):
                pg.wait_for_timeout(int(READ * 1000)); pg.mouse.click(640 if not PHONE else 195, 300); pg.wait_for_timeout(400); continue
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
    readAll(); pg.wait_for_timeout(4000 if REAL else 1500); readAll()
    # 망원경
    walk(*S['scope']); act('살펴보기'); pg.wait_for_timeout(2600); mark('망원경 시야'); pg.wait_for_timeout(3000); shot('telescope')
    R['망원경 시야'] = pg.evaluate("!!document.getElementById('wlScope')"); pg.wait_for_timeout(int((6 if REAL else 1) * 1000))
    pg.mouse.click(640 if not PHONE else 195, 300); pg.wait_for_timeout(800); readAll(); R['망원경 발견'] = pg.evaluate("!!wlGame.state.flags['secret:infinite-space:telescope']")
    # 떡방아
    walk(*S['mortar'])
    pg.evaluate("()=>{const C=wlGame.controls.input.cam;C.user=(C.user||0)+1;C.yaw=-.5;C.pitch=.32;}")
    for k in range(3):
        act('찧기'); pg.wait_for_timeout(1250)
        if k == 0: mark('떡방아 첫 찧기'); pg.wait_for_timeout(700); shot('ricecake')
        pg.wait_for_timeout(1200); readAll()
    pg.wait_for_timeout(3000); readAll(); pg.wait_for_timeout(4500); readAll()
    R['달떡'] = pg.evaluate("!!wlGame.state.flags['item:infinite-space:dalddeok']")
    # 목걸이
    mark('목걸이로 출발'); walk(*S['neck'], 60)
    for _ in range(40):
        if pg.evaluate('wlGame.mission.missionState()?.got'): break
        pg.wait_for_timeout(250)
    pg.wait_for_timeout(1200); shot('necklace-get')
    for _ in range(30):
        if not pg.evaluate("wlGame.itemget.itemGetting()"): break
        pg.wait_for_timeout(200)
    pg.wait_for_timeout(600); readAll(); R['목걸이'] = hero('!!U.breathBubble')
    # 비밀: 얼음 동굴(입구는 분화구 가운데 쪽)
    cv = S['cave']; walk(cv[0], cv[1] + 2.3); walk(cv[0], cv[1] + .2, 8); pg.wait_for_timeout(1500); shot('icecave'); R['비밀'] = pg.evaluate("!!wlGame.state.flags['secret:infinite-space:icecave']"); readAll()
    walk(cv[0], cv[1] + 3.5)
    # 할아버지에게 돌아감 → 시범
    bo = S['bobo']; walk(bo[0] - .8, bo[1] - 2.6, 60); pg.wait_for_timeout(1400); shot('demo-say'); pg.wait_for_timeout(2400); shot('demo-hop'); pg.wait_for_timeout(2600)
    R['시범'] = pg.evaluate("!!wlGame.state.flags['space:demo']"); readAll()
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
    pg.wait_for_timeout(700); shot('first-blank'); R['첫 빈칸'] = pg.evaluate("!!wlGame.state.flags['space:rock']"); readAll()
    # 바위에서 내려와 바위 뒤쪽(원더룹 앞에 바위가 보이게)에서 한 장 — PC에서 바위가 또렷한지
    walk(edge[0] + (edge[0] - rc[0]) * .3, edge[1] + (edge[1] - rc[1]) * .3, 10)
    pg.evaluate("(c)=>{const P=wlGame.mission.hero().position,C=wlGame.controls.input.cam,dx=c[0]-P.x,dz=c[1]-P.z;C.yaw=Math.atan2(-dx,-dz);C.pitch=.3;C.user=(C.user||0)+1;}", rc); pg.wait_for_timeout(1500); shot('rock-clear')
    R['바위 흐림(0이면 또렷)'] = pg.evaluate("(()=>{let k=null;const sc=wlGame.mission.hero().parent;sc.traverse(o=>{if(o.name==='highrock')k=o.material.opacity;});return k==null?null:+(1-k).toFixed(2)})()")
    # 출구: 곧게 가 보고, 막히면 옆으로 돌아서
    ex = S['exit']; mark('출구로 출발')
    sh = S['shade']; walk(rc[0] - .5, sh[1] - 9.5, 40) # 그늘 분화구·얼음 동굴 서쪽으로 돌아서
    for k in range(6):
        d = walk(*ex, 60)
        if d < 1.7 or pg.evaluate("!!wlGame.state.flags['clear:space-garden']"): break
        P = hero('[P.x,P.z]'); walk(P[0] + (3 if k % 2 else -3), P[1] + 2, 6)
    pg.wait_for_timeout(1500); shot('stage-clear'); R['완료'] = pg.evaluate("!!wlGame.state.flags['clear:space-garden']"); mark('STAGE 1 완료')
    R['처음부터 끝까지(초)'] = round(time.time() - t_start, 1); R['읽는 시간 넣음'] = REAL
    pg.wait_for_timeout(3000)
    pg.evaluate("()=>{const C=wlGame.controls.input.cam;C.pitch=.75;C.dist=11;C.user=(C.user||0)+1;}"); pg.wait_for_timeout(1500); shot('footprints')
    R['오류'] = errs; R['영상 시각(초)'] = T
    vid = pg.video.path() if VIDEO else None
    c.close(); b.close()
    if vid: shutil.move(vid, os.path.join(OUT, pre + 'stage1.webm')); shutil.rmtree(os.path.join(OUT, 'vid'), ignore_errors=True)
json.dump(R, open(os.path.join(OUT, pre + 'result.json'), 'w'), ensure_ascii=False, indent=1)
print(json.dumps(R, ensure_ascii=False, indent=1))
