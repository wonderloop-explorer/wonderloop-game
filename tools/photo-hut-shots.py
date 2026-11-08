# -*- coding: utf-8 -*-
"""보름 할아버지 집 벽 밑동 까만 자국 확인 (2026-11-08) — 촬영 서버(8000)가 떠 있을 때 저장소 루트에서:
   python3 tools/photo-hut-shots.py --tag before|after [--phone] [--out docs/compare/photo-hut] [--js '<찍기 전 실행할 JS>']
   집 앞(할아버지가 보이는 쪽)에 원더룹을 세우고 게임을 멈춘 뒤 같은 자리를 ① 평소 화면 ② 사진 모드 흐림 끔 ③ 흐림 켬 ④ 미니어처로 —
   화면 캡처와 4:5 저장본. 까만 화소(밝기 < 12) 개수를 집 둘레 영역에서 세어 JSON에. 소리 끔, 끝나면 닫음."""
import base64, json, os, sys, io
from playwright.sync_api import sync_playwright
from PIL import Image
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
a = sys.argv[1:]; PHONE = '--phone' in a; TAG = a[a.index('--tag') + 1] if '--tag' in a else 'run'
PRE = a[a.index('--js') + 1] if '--js' in a else ''
OUT = os.path.join(ROOT, a[a.index('--out') + 1] if '--out' in a else 'docs/compare/photo-hut'); os.makedirs(OUT, exist_ok=True)
dev = 'phone' if PHONE else 'pc'; R = {'tag': TAG, 'dev': dev, 'js': PRE}
def blacks(path):
    im = Image.open(path).convert('L'); px = im.load(); w, h = im.size; n = 0
    for y in range(0, h):
        for x in range(0, w):
            if px[x, y] < 12: n += 1
    return n
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'])
    o = dict(viewport={'width': 390, 'height': 844}, device_scale_factor=3, is_mobile=True, has_touch=True) if PHONE else dict(viewport={'width': 1280, 'height': 720})
    pg = b.new_context(accept_downloads=True, **o).new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    pg.goto('http://localhost:8000/?world=infinite-space&zone=space-garden&notitle&time=0' + ('&quality=mobile' if PHONE else '')); pg.evaluate('localStorage.clear()'); pg.reload()
    pg.wait_for_function('window.wlZone&&wlZone.cur&&wlZone.cur.spots&&window.wlPhoto', timeout=120000); pg.wait_for_timeout(2500)
    if PRE: pg.evaluate(PRE); pg.wait_for_timeout(300)
    # 집 문 앞 2.6m에 원더룹(집을 등지고 비스듬히), 카메라는 원더룹 너머 집 벽 밑동이 보이게
    pg.evaluate("""(()=>{const [x,z,y,f]=wlZone.cur.spots.hut,W=wlGame.mission.hero(),a=f+.5;W.position.x=x+Math.sin(a)*2.7;W.position.z=z+Math.cos(a)*2.7;W.rotation.y=a;})()""")
    pg.wait_for_timeout(1500); pg.evaluate('window.wlTimeScale=1e-6'); pg.wait_for_timeout(300)
    shots = {}
    # 평소 화면: 따라가기 카메라를 원더룹 앞쪽(집 반대편)에서 집을 보게
    pg.evaluate("""(()=>{const W=wlGame.mission.hero(),C=wlGame.controls.input.cam;C.yaw=W.rotation.y+.35;C.pitch=.22;C.dist=6;})()"""); pg.evaluate('window.wlTimeScale=1'); pg.wait_for_timeout(1500); pg.evaluate('window.wlTimeScale=1e-6'); pg.wait_for_timeout(300)
    f = os.path.join(OUT, f'{TAG}-{dev}-normal.png'); pg.screenshot(path=f); shots['평소 화면'] = blacks(f)
    pg.evaluate('wlPhoto.enter();wlPhoto.setRatio("4:5")'); pg.wait_for_timeout(300)
    pg.evaluate("""(()=>{const W=wlGame.mission.hero();wlPhoto.setAngle(W.rotation.y+.35,.22);wlPhoto.setZoom(6);})()""")
    for name, js in [('blur-off', 'wlPhoto.setBlur(false);wlPhoto.setMini(false)'), ('blur-on', 'wlPhoto.setBlur(true);wlPhoto.setMini(false)'), ('mini', 'wlPhoto.setBlur(true);wlPhoto.setMini(true)')]:
        pg.evaluate(js); pg.wait_for_timeout(500)
        f = os.path.join(OUT, f'{TAG}-{dev}-{name}-screen.png'); pg.screenshot(path=f)
        fn = os.path.join(OUT, f'{TAG}-{dev}-{name}.png')
        if not PHONE:
            with pg.expect_download() as dl: pg.evaluate('wlPhoto.shoot()')
            dl.value.save_as(fn)
        else:
            prev = pg.evaluate('wlPhoto.state.lastURL'); pg.evaluate('wlPhoto.shoot()')
            pg.wait_for_function('u=>wlPhoto.state.lastURL&&wlPhoto.state.lastURL!==u', arg=prev, timeout=30000)
            data = pg.evaluate("""async()=>{const bl=await (await fetch(wlPhoto.state.lastURL)).blob();const fr=new FileReader();return await new Promise(ok=>{fr.onload=()=>ok(fr.result.split(',')[1]);fr.readAsDataURL(bl);});}""")
            open(fn, 'wb').write(base64.b64decode(data))
        shots[name] = {'화면': blacks(f), '저장본': blacks(fn)}; pg.wait_for_timeout(300)
    R['까만 화소(밝기<12)'] = shots; R['오류'] = errs; b.close()
json.dump(R, open(os.path.join(OUT, f'{TAG}-{dev}.json'), 'w'), ensure_ascii=False, indent=1); print(json.dumps(R, ensure_ascii=False))
