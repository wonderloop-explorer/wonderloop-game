# -*- coding: utf-8 -*-
"""원더룹 앤트빌리지 차림 확인 촬영 (2026-11-04) — 촬영 서버(8000)가 떠 있을 때 저장소 루트에서:
   python3 tools/ant-look-shots.py [--out docs/compare/ant-look] [--ant <antvillage index.html 경로>]
   - 개미굴 원본(antvillage 게임 탐험 준비 화면, 원더룹이 도는 각도를 앞·옆·뒤로 멈춰)과 이 저장소 원더룹(촬영 모드, 앤트빌리지 차림 + 개미탈)을
     앞·옆·뒤 전신으로 같은 구도에 찍어 나란히 붙인다(side-*.png).
   - 확대: 앞머리·탈 경계(정면·3/4 가까이), 신발 뒤꿈치(뒤에서, 걷는 중 여러 순간 — 달리기·점프·돌기 포함).
   - 옷 조합 4개를 입힌 정면 넷(combos.png).
   소리는 끄고(--mute-audio) 끝나면 브라우저를 닫는다. 원본 경로가 없으면 이 저장소 쪽만 찍는다."""
import os, sys, base64, io, tempfile
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
args = sys.argv[1:]
OUT = os.path.join(ROOT, args[args.index('--out') + 1] if '--out' in args else 'docs/compare/ant-look')
ANT = args[args.index('--ant') + 1] if '--ant' in args else os.path.join(ROOT, '..', 'antvillage', 'index.html')
os.makedirs(OUT, exist_ok=True)
try: FONT = ImageFont.truetype('/System/Library/Fonts/AppleSDGothicNeo.ttc', 26)
except Exception: FONT = ImageFont.load_default()
VIEWS = [('앞', 0.0), ('옆', 1.5708), ('뒤', 3.1416)]
W, H = 640, 800

def png(data_url): return Image.open(io.BytesIO(base64.b64decode(data_url.split(',', 1)[1]))).convert('RGB')
def label(im, t):
    d = ImageDraw.Draw(im); d.rectangle([0, 0, im.width, 38], fill='white'); d.text((10, 5), t, fill='black', font=FONT); return im
def row(ims, path):
    w = sum(i.width for i in ims) + 10 * (len(ims) - 1); h = max(i.height for i in ims)
    o = Image.new('RGB', (w, h), 'white'); x = 0
    for i in ims: o.paste(i, (x, 0)); x += i.width + 10
    o.save(path); return path

with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio'])
    # ── 이 저장소 원더룹 (촬영 모드 — 정해진 시간·구운 텍스처)
    c = b.new_context(viewport={'width': W, 'height': H}); pg = c.new_page()
    pg.goto('http://localhost:8000/?shot'); pg.wait_for_function('window.wlShot', timeout=120000); pg.wait_for_timeout(500)
    # 베이스캠프 방은 두 벽이 막혀 있어, 카메라가 늘 방의 열린 쪽(방 카메라 처음 각도 OPEN)에 오도록 원더룹을 돌려 세운다
    pg.evaluate("""()=>{const S=wlShot,U=S.WL.userData;S.size(640,800);U.setOutfit('ant');U.setHood('ant');U.setTint('hood',null);U.setCombo(0);
      window.OPEN=Object.values(wlZone.cur.areas)[0].camera.start[0];S.place(0,1.6,OPEN);S.step(30);}""")
    def ours(az, pol=1.47, dist=7.0, ty=None):
        return png(pg.evaluate("([az,pol,dist,ty])=>{wlShot.WL.rotation.y=OPEN-az;wlShot.view({az,pol,dist,ty});wlShot.step(2);return wlShot.capture()}", [az, pol, dist, ty]))
    mine = {n: ours(a) for n, a in VIEWS}
    # 확대: 앞머리·탈 경계
    close = [label(ours(0, 1.5, 2.4, 1.72), '앞머리·탈 경계 (정면)'), label(ours(.7, 1.45, 2.4, 1.72), '앞머리·탈 경계 (3/4)'), label(ours(1.3, 1.45, 2.6, 1.7), '탈 경계 (옆)')]
    row(close, os.path.join(OUT, 'close-face.png'))
    # 신발 뒤꿈치: 뒤에서, 걷기·달리기·점프·돌기
    heels = []
    BACK = "()=>{const W=wlShot.WL;wlShot.view({az:Math.PI+(OPEN-Math.PI-W.rotation.y),pol:1.5,dist:2.1,ty:.22});return wlShot.capture()}"
    pg.evaluate("()=>{wlShot.place(.6,2.2,OPEN+Math.PI);wlShot.setup({walk:[.6-Math.sin(OPEN)*3,2.2-Math.cos(OPEN)*3]});}")
    for i, n in enumerate([6, 10, 14]):
        pg.evaluate("(n)=>wlShot.step(n)", n); heels.append(label(png(pg.evaluate(BACK)), f'걷는 중 뒤 {i+1}'))
    pg.evaluate("()=>{wlShot.place(.6,2.2,OPEN+Math.PI);wlShot.setup({action:'뛰기'});}"); pg.evaluate("()=>wlShot.step(12)")
    heels.append(label(png(pg.evaluate(BACK)), '달리기 동작 뒤'))
    pg.evaluate("()=>{wlShot.setup({action:'서기'});wlShot.place(.6,2.2,OPEN+Math.PI);wlShot.step(10);wlShot.setup({hop:true});}"); pg.evaluate("()=>wlShot.step(9)")
    heels.append(label(png(pg.evaluate("()=>{const W=wlShot.WL;wlShot.view({az:Math.PI+(OPEN-Math.PI-W.rotation.y),pol:1.5,dist:2.3,ty:.4});return wlShot.capture()}")), '점프 뒤'))
    pg.evaluate("()=>{wlShot.step(40);wlShot.place(.6,2.2,OPEN+Math.PI);wlShot.setup({walk:[.6+Math.cos(OPEN)*2.5,2.2-Math.sin(OPEN)*2.5]});}"); pg.evaluate("()=>wlShot.step(8)")
    heels.append(label(png(pg.evaluate("()=>{const W=wlShot.WL;wlShot.view({az:Math.PI*.8+(OPEN-Math.PI-W.rotation.y),pol:1.5,dist:2.1,ty:.22});return wlShot.capture()}")), '돌며 걷기'))
    row(heels[:3], os.path.join(OUT, 'heel-walk.png')); row(heels[3:], os.path.join(OUT, 'heel-run-jump-turn.png'))
    # 옷 조합 넷
    combos = []
    pg.evaluate("()=>{wlShot.place(0,1.6,OPEN);wlShot.step(40);}")
    names = pg.evaluate("wlShot.WL.userData.outfitCombos.map(c=>c.name)")
    for i, n in enumerate(names):
        combos.append(label(png(pg.evaluate("(i)=>{wlShot.WL.userData.setCombo(i);wlShot.WL.rotation.y=OPEN-.5;wlShot.view({az:.5,pol:1.47,dist:6.2});wlShot.step(2);return wlShot.capture()}", i)), n))
    row(combos, os.path.join(OUT, 'combos.png'))
    pg.evaluate("()=>wlShot.WL.userData.setCombo(0)"); c.close()
    # ── 개미굴 원본 (탐험 준비 화면에서 도는 각도를 멈춰 찍음)
    if os.path.exists(ANT):
        # 원본은 그대로 두고 임시 복사본에만 한 줄: 도는 각도(showAng)를 밖에서 정할 수 있게
        src = open(ANT, encoding='utf-8').read(); key = "let faceMode='normal',happyT=0,showAng=0"
        if key not in src: raise SystemExit('antvillage index.html에서 showAng 줄을 못 찾음')
        i = src.index('\n', src.index(key)) + 1
        src = src[:i] + "window.__wlAng={set ang(v){showAng=v+(typeof yaw==='number'?yaw:0);}};\n" + src[i:]
        tmp = os.path.join(tempfile.mkdtemp(), 'index.html'); open(tmp, 'w', encoding='utf-8').write(src)
        c = b.new_context(viewport={'width': W, 'height': H}); pg = c.new_page()
        pg.goto('file://' + tmp); pg.wait_for_function('window.__wlAng&&!document.getElementById("boot")', timeout=120000); pg.wait_for_timeout(1500)
        pg.click('#start'); pg.wait_for_timeout(2500)
        pg.evaluate("()=>{document.getElementById('show').style.visibility='hidden';}")
        orig = {}
        for n, a in VIEWS:
            pg.evaluate(f"()=>{{window.__wlAng.ang={a};}}"); pg.wait_for_timeout(30)
            orig[n] = Image.open(io.BytesIO(pg.screenshot())).convert('RGB')
        c.close()
        for n, _ in VIEWS:
            row([label(orig[n], f'개미굴 원본 — {n}'), label(mine[n], f'원더룹 공통(앤트빌리지 차림) — {n}')], os.path.join(OUT, f'side-{n}.png'))
    else:
        row([label(mine[n], n) for n, _ in VIEWS], os.path.join(OUT, 'side-mine.png'))
    b.close()
print('저장', os.path.relpath(OUT, ROOT), sorted(os.listdir(OUT)))
