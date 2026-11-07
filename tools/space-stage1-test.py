# -*- coding: utf-8 -*-
"""무한 우주 STAGE 1 회색 정원 처음부터 끝까지 (2026-11-07) — 촬영 서버(8000)가 떠 있을 때 저장소 루트에서:
   python3 tools/space-stage1-test.py [--out docs/compare/space-stage1] [--phone] [--video]
   기록을 지운 첫 방문 ?world=infinite-space: 타이틀 '새로 시작' → 탐험 준비 '모험 떠나기' → 이야기 소개 세 단계 → 미션(숨방울 목걸이) →
   원더룹을 목걸이까지 걸려 보냄(발자국이 남는지) → 얻음·목에 걺 → 할아버지에게 돌아감 → 둥실 뛰기 시범 → 높은 바위로 둥실 뛰어 오름 → 첫 빈칸 →
   얼음 동굴(비밀) → 출구 → STAGE 1 완료. 단계마다 화면을 <out>/에, 결과 JSON, --video면 녹화(webm → <out>/stage1.webm). 소리 끔, 끝나면 닫음."""
import json, os, sys, glob, shutil
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
args = sys.argv[1:]; PHONE = '--phone' in args; VIDEO = '--video' in args
OUT = os.path.join(ROOT, args[args.index('--out') + 1] if '--out' in args else 'docs/compare/space-stage1'); os.makedirs(OUT, exist_ok=True)
pre = 'phone-' if PHONE else 'pc-'; R = {}
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio', '--autoplay-policy=no-user-gesture-required', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'])
    o = dict(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True) if PHONE else dict(viewport={'width': 1280, 'height': 720})
    if VIDEO: o['record_video_dir'] = os.path.join(OUT, 'vid'); o['record_video_size'] = {'width': o['viewport']['width'], 'height': o['viewport']['height']}
    c = b.new_context(**o); pg = c.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    pg.on('console', lambda m: m.type == 'error' and '404' not in m.text and errs.append(m.text[:300]))
    pg.goto('http://localhost:8000/?world=infinite-space'); pg.evaluate('localStorage.clear()'); pg.reload()
    pg.wait_for_selector('#wlTitle .go', timeout=120000); pg.wait_for_timeout(2500)
    shot = lambda n: pg.screenshot(path=os.path.join(OUT, pre + n + '.png'))
    shot('title')
    pg.click('#wlTitle .go'); pg.wait_for_selector('#wlWard.on'); pg.wait_for_timeout(2500); shot('explorer')
    pg.click('#wlWard .done'); pg.wait_for_selector('#wlStory.on')
    for i in range(3):
        pg.wait_for_timeout(3200); shot(f'story-{i+1}')
        d0 = pg.eval_on_selector_all('#wlStory .dots i', 'd=>d.findIndex(x=>x.className==="on")'); pg.click('#wlStory .next')
        if pg.eval_on_selector('#wlStory', 'e=>e.classList.contains("on")') and pg.eval_on_selector_all('#wlStory .dots i', 'd=>d.findIndex(x=>x.className==="on")') == d0: pg.click('#wlStory .next')
    pg.wait_for_timeout(2200)
    if pg.evaluate("!document.getElementById('wlHelp').hidden"): pg.click('#wlHelp .close'); pg.wait_for_timeout(400)
    pg.wait_for_timeout(1200); shot('mission-card')
    R['할 일'] = pg.evaluate("document.getElementById('wlQuest').textContent"); R['미션'] = pg.evaluate('wlGame.mission.missionState()')
    pg.wait_for_timeout(5000); shot('mission-trail')
    def walk(x, z, sec=30):
        pg.evaluate("([x,z])=>wlGame.mission.hero().userData.walkTo(x,z)", [x, z])
        for _ in range(int(sec * 4)):
            if pg.evaluate("([x,z])=>{const P=wlGame.mission.hero().position;return Math.hypot(P.x-x,P.z-z)<.6||!wlGame.mission.hero().userData.isWalking()}", [x, z]): break
            pg.wait_for_timeout(250)
    def closeCards():
        for _ in range(12):
            k = pg.evaluate("wlGame.ui.cardShown()")
            if not k: return
            pg.mouse.click(640 if not PHONE else 195, 300); pg.wait_for_timeout(500)
    closeCards()
    walk(-.6, -5.5); shot('walk-trail')
    walk(-2.6, -10.6); walk(-3.2, -15.2)
    for _ in range(40):
        if pg.evaluate('wlGame.mission.missionState()?.got'): break
        pg.wait_for_timeout(250)
    pg.wait_for_timeout(1200); shot('necklace-get')
    for _ in range(30):
        if not pg.evaluate("wlGame.itemget.itemGetting()"): break
        pg.wait_for_timeout(200)
    pg.wait_for_timeout(600); shot('necklace-worn'); closeCards()
    R['목걸이'] = pg.evaluate("!!wlGame.mission.hero().userData.breathBubble")
    R['원더룹 발자국 수'] = None
    # 비밀: 얼음 동굴
    walk(-5, -17.4); walk(-5, -19.5, 8); pg.wait_for_timeout(1500); shot('icecave'); R['비밀'] = pg.evaluate("!!wlGame.state.flags['secret:infinite-space:icecave']"); closeCards()
    walk(-5, -16)
    # 할아버지에게 돌아감 → 시범
    walk(-1.6, 0); walk(1.2, 3.6)
    pg.wait_for_timeout(1400); shot('demo-say'); pg.wait_for_timeout(2400); shot('demo-hop'); pg.wait_for_timeout(2600)
    R['시범'] = pg.evaluate("!!wlGame.state.flags['space:demo']")
    closeCards()
    # 높은 바위: 가장자리까지 걸어가 바위 쪽으로 걸으며 점프
    walk(-9.5, -12.4)
    # 플레이어처럼: 바위 쪽으로 W를 누른 채 Space, 바위 가운데 위에 오면 W를 뗌
    RC = "[-11.8,-13.5]"
    for k in range(6):
        if k: walk(-9.3, -12.2, 8)
        for _ in range(40):
            if not pg.evaluate('wlGame.ui.dialogShown()'): break
            pg.wait_for_timeout(250)
        pg.evaluate("(c)=>{const P=wlGame.mission.hero().position,C=wlGame.controls.input.cam,dx=c[0]-P.x,dz=c[1]-P.z;C.yaw=Math.atan2(-dx,-dz);C.pitch=.35;}", [-11.8, -13.5])
        pg.keyboard.down('w'); pg.wait_for_timeout(80); pg.keyboard.press('Space')
        if k == 0: pg.wait_for_timeout(500); shot('hop-up')
        for _ in range(40):
            if pg.evaluate("(()=>{const P=wlGame.mission.hero().position;return Math.hypot(-11.8-P.x,-13.5-P.z)<.5})()"): break
            pg.wait_for_timeout(25)
        pg.keyboard.up('w'); pg.wait_for_timeout(2200)
        if pg.evaluate("wlGame.mission.hero().userData.vert.y") > 1.5: break
    R['바위 위 높이'] = pg.evaluate("wlGame.mission.hero().userData.vert.y")
    pg.wait_for_timeout(1500); shot('first-blank'); R['첫 빈칸'] = pg.evaluate("!!wlGame.state.flags['space:rock']")
    closeCards()
    # 출구
    walk(-10, -17); walk(-10, -23); walk(-3, -28); walk(4, -32); walk(6, -35)
    pg.wait_for_timeout(1500); shot('stage-clear'); R['완료'] = pg.evaluate("!!wlGame.state.flags['clear:space-garden']")
    pg.wait_for_timeout(3000)
    # 걸어온 길 돌아보기(발자국)
    pg.evaluate("()=>{const C=wlGame.controls.input.cam;C.pitch=.75;C.dist=11;C.user=(C.user||0)+1;}"); pg.wait_for_timeout(1500); shot('footprints')
    R['오류'] = errs
    vid = pg.video.path() if VIDEO else None
    c.close(); b.close()
    if vid: shutil.move(vid, os.path.join(OUT, pre + 'stage1.webm')); shutil.rmtree(os.path.join(OUT, 'vid'), ignore_errors=True)
json.dump(R, open(os.path.join(OUT, pre + 'result.json'), 'w'), ensure_ascii=False, indent=1)
print(json.dumps(R, ensure_ascii=False, indent=1))
