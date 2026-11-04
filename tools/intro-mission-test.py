# -*- coding: utf-8 -*-
"""모험 시작 연출 + 첫 미션 흐름 시험 (2026-11-04, 공통 틀 4단계) — 촬영 서버(8000)가 떠 있을 때 저장소 루트에서:
   python3 tools/intro-mission-test.py [--out docs/compare/intro-mission] [--phone]
   기록을 지운 첫 방문으로: 타이틀 '새로 시작' → 탐험 준비 '모험 떠나기' → 이야기 소개 세 단계(단계마다 카메라가 도는지·글자가 써지는지·나레이션 파일을 받았는지)
   → '모험 시작' → (처음 조작법 창 닫기) → 미션 카드·할 일 안내·민트 빛기둥·동그라미 길 → 원더룹을 랜턴까지 걸려 보내 줍기 → 아이템 카드·손에 쥠·도구 단추.
   배경음이 탐험 준비부터 미션까지 끊기지 않는지(같은 곡이 계속 울리는지)도 본다. 단계마다 화면을 <out>/에 남기고 결과를 JSON으로. 소리는 끄고(--mute-audio) 끝나면 닫는다."""
import json, os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
args = sys.argv[1:]
PHONE = '--phone' in args
OUT = os.path.join(ROOT, args[args.index('--out') + 1] if '--out' in args else 'docs/compare/intro-mission')
os.makedirs(OUT, exist_ok=True)
pre = 'phone-' if PHONE else 'pc-'
R = {}
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio', '--autoplay-policy=no-user-gesture-required'])
    o = dict(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True) if PHONE else dict(viewport={'width': 1280, 'height': 800})
    c = b.new_context(**o); pg = c.new_page(); errs = []; vo = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    pg.on('request', lambda r: vo.append(r.url.split('/')[-1].split('?')[0]) if '/audio/antvillage/' in r.url else None)
    pg.goto('http://localhost:8000/'); pg.evaluate('localStorage.clear()'); pg.reload()
    pg.wait_for_selector('#wlTitle .go', timeout=120000); pg.wait_for_timeout(1800)
    shot = lambda n: pg.screenshot(path=os.path.join(OUT, pre + n + '.png'))
    bedid = "(()=>{const h=wlGame.sound.bedHandle();return h?1:0})()"
    pg.click('#wlTitle .go'); pg.wait_for_selector('#wlWard.on'); pg.wait_for_timeout(1200)
    R['탐험 준비 배경음'] = pg.evaluate(bedid)
    pg.click('#wlWard .done'); pg.wait_for_selector('#wlStory.on')
    steps = []
    for i in range(3):
        cam0 = pg.evaluate('[wlGame.view.camera.position.x,wlGame.view.camera.position.z]')
        pg.wait_for_timeout(700); t0 = pg.eval_on_selector('#wlStory .stext', 'e=>e.textContent.length')
        pg.wait_for_timeout(2600); t1 = pg.eval_on_selector('#wlStory .stext', 'e=>e.textContent.length')
        cam1 = pg.evaluate('[wlGame.view.camera.position.x,wlGame.view.camera.position.z]')
        nxt = pg.eval_on_selector('#wlStory .next', 'e=>e.textContent'); dots = pg.eval_on_selector_all('#wlStory .dots i', 'd=>d.findIndex(x=>x.className==="on")')
        shot(f'story-{i+1}')
        steps.append(dict(글자처음=t0, 글자나중=t1, 카메라움직임=round(((cam1[0]-cam0[0])**2 + (cam1[1]-cam0[1])**2) ** .5, 2), 단추=nxt, 점=dots, 배경음=pg.evaluate(bedid)))
        pg.click('#wlStory .next')
        if t1 < pg.evaluate('1') or True:
            pass
        if pg.eval_on_selector('#wlStory', 'e=>e.classList.contains("on")') and pg.eval_on_selector_all('#wlStory .dots i', 'd=>d.findIndex(x=>x.className==="on")') == dots:
            pg.click('#wlStory .next')  # 아직 써지는 중이었으면 첫 누름은 글자를 다 보이게
    R['이야기 소개'] = steps
    pg.wait_for_timeout(2200)
    if pg.evaluate("!document.getElementById('wlHelp').hidden"):
        pg.click('#wlHelp .close'); pg.wait_for_timeout(400)
    pg.wait_for_timeout(900); shot('mission-card')
    R['미션 카드'] = pg.evaluate("""()=>{const n=document.getElementById('wlNotice')||document.querySelector('.wl-notice,#wlNt');return n?n.innerText:null}""")
    R['할 일'] = pg.evaluate("document.getElementById('wlQuest').textContent")
    R['미션 상태'] = pg.evaluate('wlGame.mission.missionState()')
    pg.wait_for_timeout(6500); shot('mission-trail')
    # 랜턴까지 걸어감
    pg.evaluate("()=>{const W=wlGame.mission.hero(),m=wlGame.mission.missionState();W.userData.walkTo(m.at[0],m.at[1]);}")
    pg.wait_for_timeout(1500); shot('mission-walk')
    for _ in range(40):
        if pg.evaluate('wlGame.mission.missionState()?.got'): break
        pg.wait_for_timeout(250)
    pg.wait_for_timeout(500); shot('mission-got')
    R['얻음'] = pg.evaluate('wlGame.mission.missionState()')
    R['손에 쥠'] = pg.evaluate('!!wlGame.mission.hero().userData.heldObj')
    R['도구 단추'] = pg.evaluate("(()=>{const b=document.getElementById('wlTool');return b&&getComputedStyle(b).display!=='none'?b.textContent:null})()")
    R['미션 뒤 배경음'] = pg.evaluate(bedid)
    R['받은 나레이션 파일'] = sorted(set(vo)); R['오류'] = errs
    b.close()
print(json.dumps(R, ensure_ascii=False, indent=1))
