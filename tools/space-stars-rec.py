# -*- coding: utf-8 -*-
"""무한 우주 회색 정원 — 별 깜빡임 짧은 녹화 + 보름 할아버지 가까이 + 엔딩 큰 글자 (2026-11-07). 촬영 서버(8000)가 떠 있을 때 저장소 루트에서:
   python3 tools/space-stars-rec.py [--out docs/compare/space-hand]
   ① 맑은 별빛 날씨, 시작 지점에서 카메라를 조금 들어 하늘이 넓게 보이게 8초 녹화(webm → <out>/stars.webm — 점 별이 저마다 다른 박자로 깜빡이고 노란 네 갈래 반짝이가 톡톡)
   ② 보름 할아버지 앞모습 가까이(대기 동작 — 지도 끈·펼친 지도) ③ 엔딩 화면(game/finale ending — '무한 우주 탐방 끝'의 '우'). 화면 글자는 숨김(①②). 소리 끔, 끝나면 닫음."""
import os, sys, shutil
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
args = sys.argv[1:]
OUT = os.path.join(ROOT, args[args.index('--out') + 1] if '--out' in args else 'docs/compare/space-hand'); os.makedirs(OUT, exist_ok=True)
HIDE = """()=>{const cv=document.querySelector('canvas');for(const e of document.body.children){if(e===cv||e.contains(cv))continue;e.style.visibility='hidden';}}"""
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'])
    c = b.new_context(viewport={'width': 1280, 'height': 720}, record_video_dir=os.path.join(OUT, 'vid'), record_video_size={'width': 1280, 'height': 720})
    pg = c.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    pg.goto('http://localhost:8000/?world=infinite-space&notitle&weather=starlight&debug'); pg.wait_for_function('window.wlGame&&wlGame.mission.hero&&wlGame.mission.hero()', timeout=120000)
    pg.wait_for_timeout(4000); pg.evaluate(HIDE)
    pg.evaluate("()=>{const C=wlGame.controls.input.cam;C.user=(C.user||0)+1;C.pitch=.12;C.yaw=0;}"); pg.wait_for_timeout(8000)
    pg.screenshot(path=os.path.join(OUT, 'stars-still.png'))
    # 할아버지 앞모습
    pg.evaluate("""()=>{const W=wlGame.mission.hero(),V=W.userData.vert,x=2.1,z=7.4,gy=wlZone.cur.groundY(x,z);W.position.set(x,gy,z);if(V){V.y=gy;V.px=x;V.pz=z;}W.rotation.y=Math.PI;
      const C=wlGame.controls.input.cam;C.user=(C.user||0)+1;C.yaw=Math.PI+.35;C.pitch=.25;C.dist=4;}"""); pg.wait_for_timeout(3500)
    pg.screenshot(path=os.path.join(OUT, 'bobo-front.png'))
    vid = pg.video.path()
    # 엔딩
    pg.evaluate("()=>{for(const e of document.body.children)e.style.visibility='';}")
    has = pg.evaluate("!!(window.wlStory&&wlStory.ending)")
    if has: pg.evaluate("wlStory.ending()"); pg.wait_for_timeout(3500); pg.screenshot(path=os.path.join(OUT, 'ending.png'))
    print('엔딩 시험 단추', has, '오류', errs)
    c.close(); b.close()
    shutil.move(vid, os.path.join(OUT, 'stars.webm')); shutil.rmtree(os.path.join(OUT, 'vid'), ignore_errors=True)
