# -*- coding: utf-8 -*-
"""무한 우주 회색 정원 '채우기' 전후 같은 자리 비교 (2026-11-07) — 촬영 서버(8000)가 떠 있을 때 저장소 루트에서:
   python3 tools/space-fill-shots.py <태그(before|after)> [--phone] [--out docs/compare/space-fill]
   플레이 화면(촬영 모드 아님, ?notitle — 따라가기 카메라 그대로)에서 원더룹을 자리마다 옮겨 세우고 카메라 각도를 맞춰 찍는다:
   마을(시작 지점) · 분화구(그늘 분화구 쪽) · 바위 언덕(높은 바위 쪽) · 하늘(기본 카메라 그대로 — 목성·해·토성이 보이는지) · 바위 아치(첫 미션 길) + 타이틀 화면.
   화면 글자·단추는 숨기고 3D만. 자리마다 톱니 메뉴 성능 상자의 드로우콜·삼각형을 읽어 <out>/<태그>-<pc|phone>.json에. 소리 끔, 끝나면 닫음."""
import json, os, sys, re
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
args = sys.argv[1:]; TAG = args[0]; PHONE = '--phone' in args
OUT = os.path.join(ROOT, args[args.index('--out') + 1] if '--out' in args else 'docs/compare/space-fill'); os.makedirs(OUT, exist_ok=True)
pre = f'{TAG}-{"phone" if PHONE else "pc"}-'
# 자리: (이름, 원더룹 x, z, 원더룹이 보는 쪽 ry, 카메라 yaw(None = 원더룹 등 뒤), pitch(None = 기본 그대로))
SPOTS = [('village', 0, 9.5, 3.14159, None, None), ('crater', -2.2, -9.6, 3.5, .38, None), ('rock', -7.6, -9.4, 3.9, .76, None), ('sky', 0, 9.5, 3.14159, None, None), ('arch', -.9, -2.4, 3.5, None, None)]
R = {}
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio', '--autoplay-policy=no-user-gesture-required', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'])
    o = dict(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True) if PHONE else dict(viewport={'width': 1280, 'height': 720})
    c = b.new_context(**o); pg = c.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    q = '&quality=mobile' if PHONE else ''
    # 타이틀
    pg.goto(f'http://localhost:8000/?world=infinite-space&weather=starlight{q}'); pg.evaluate('localStorage.clear()'); pg.reload()
    pg.wait_for_selector('#wlTitle .go', timeout=120000); pg.wait_for_timeout(4000)
    pg.screenshot(path=os.path.join(OUT, pre + 'title.png'))
    # 플레이 화면
    pg.goto(f'http://localhost:8000/?world=infinite-space&notitle&weather=starlight&debug{q}'); pg.wait_for_function('window.wlGame&&wlGame.mission&&wlGame.mission.hero&&wlGame.mission.hero()', timeout=120000)
    pg.wait_for_timeout(5000)
    hide = """()=>{const cv=document.querySelector('canvas');for(const e of document.body.querySelectorAll('*')){if(e===cv||e.contains(cv)||cv.contains(e))continue;if(e.parentElement&&e.parentElement.contains(cv)||e.parentElement===document.body)e.style.visibility='hidden';}}"""
    for name, x, z, ry, yaw, pitch in SPOTS:
        pg.evaluate("""([x,z,ry,yaw,pitch])=>{const W=wlGame.mission.hero(),V=W.userData.vert,gy=wlZone.cur.groundY(x,z);W.userData.stopWalk&&W.userData.stopWalk();
          W.position.set(x,gy,z);W.rotation.y=ry;if(V){V.y=gy;V.vy=0;V.px=x;V.pz=z;}const C=wlGame.controls.input.cam;
          C.yaw=yaw==null?ry+Math.PI:yaw;if(pitch!=null)C.pitch=pitch;}""", [x, z, ry, yaw, pitch])
        # 열려 있는 카드·대화는 닫는다
        for _ in range(6):
            if not pg.evaluate('wlGame.ui.cardShown()||wlGame.ui.dialogShown()'): break
            pg.keyboard.press('Escape'); pg.wait_for_timeout(300)
        pg.wait_for_timeout(2500); pg.evaluate(hide)
        pg.screenshot(path=os.path.join(OUT, pre + name + '.png'))
        st = pg.evaluate("document.getElementById('stats').textContent")
        m = re.search(r'드로우콜 (\d+)회.*?삼각형 ([\d,]+)개', st)
        R[name] = dict(드로우콜=int(m.group(1)), 삼각형=int(m.group(2).replace(',', ''))) if m else st
        pg.evaluate("()=>{for(const e of document.body.querySelectorAll('*'))if(e.style.visibility==='hidden')e.style.visibility='';}")
    R['오류'] = errs
    c.close(); b.close()
json.dump(R, open(os.path.join(OUT, pre + 'result.json'), 'w'), ensure_ascii=False, indent=1)
print(json.dumps(R, ensure_ascii=False, indent=1))
