# -*- coding: utf-8 -*-
"""외계인 탈 확인 촬영 (무한 우주, 2026-11-07) — 촬영 서버(8000)가 떠 있을 때 저장소 루트에서: python3 tools/alien-hood-shots.py
   앤트빌리지 차림 + 외계인 탈(연두)을 앞·3/4·옆·뒤 전신, 얼굴 가까이(앞·3/4), 탈 색 넷 → docs/compare/alien-hood/. 소리 끔, 끝나면 닫음."""
import os, base64, io
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); OUT = os.path.join(ROOT, os.environ.get('OUTDIR', 'docs/compare/alien-hood')); os.makedirs(OUT, exist_ok=True)
try: FONT = ImageFont.truetype('/System/Library/Fonts/AppleSDGothicNeo.ttc', 26)
except Exception: FONT = ImageFont.load_default()
def png(u): return Image.open(io.BytesIO(base64.b64decode(u.split(',', 1)[1]))).convert('RGB')
def label(im, t): d = ImageDraw.Draw(im); d.rectangle([0, 0, im.width, 38], fill='white'); d.text((10, 5), t, fill='black', font=FONT); return im
def row(ims, path):
    w = sum(i.width for i in ims) + 10 * (len(ims) - 1); h = max(i.height for i in ims); o = Image.new('RGB', (w, h), 'white'); x = 0
    for i in ims: o.paste(i, (x, 0)); x += i.width + 10
    o.save(path); return path
COL = [('연두', '#9bd46b', '#6f9e48'), ('연보라', '#c9a6e0', '#9a78b4'), ('하늘', '#8cc8ec', '#5f9cc4'), ('회색', '#b8bcc6', '#868a96')]
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio']); pg = b.new_context(viewport={'width': 640, 'height': 800}).new_page()
    pg.goto('http://localhost:8000/?shot'); pg.wait_for_function('window.wlShot', timeout=120000); pg.wait_for_timeout(500)
    pg.evaluate("""()=>{const S=wlShot,U=S.WL.userData;S.size(640,800);U.setOutfit('ant');U.setHood('alien');U.setTint('hood',['#9bd46b','#6f9e48']);U.setCombo(0);
      window.OPEN=Object.values(wlZone.cur.areas)[0].camera.start[0];S.place(0,1.6,OPEN);S.step(30);}""")
    def shot(az, pol=1.47, dist=7.0, ty=None):
        return png(pg.evaluate("([az,pol,dist,ty])=>{wlShot.WL.rotation.y=OPEN-az;wlShot.view({az,pol,dist,ty});wlShot.step(2);return wlShot.capture()}", [az, pol, dist, ty]))
    row([label(shot(a), n) for n, a in [('앞', 0), ('3/4', .75), ('옆', 1.5708), ('뒤', 3.1416)]], os.path.join(OUT, 'views.png'))
    row([label(shot(0, 1.5, 2.4, 1.72), '얼굴 정면'), label(shot(.7, 1.45, 2.4, 1.72), '얼굴 3/4'), label(shot(1.3, 1.3, 2.6, 1.8), '위 옆')], os.path.join(OUT, 'close.png'))
    cs = []
    for n, c, d in COL:
        pg.evaluate("([c,d])=>{wlShot.WL.userData.setTint('hood',[c,d]);wlShot.step(2);}", [c, d]); cs.append(label(shot(.35, 1.47, 4.2, 1.2), n))
    row(cs, os.path.join(OUT, 'colors.png'))
    # 뒤 가까이(탈 색 넷) — 구의 시작·끝이 만나는 이음매(뒤쪽 세로줄)가 보이지 않는지 (2026-11-08)
    bs = []
    for n, c, d in COL:
        pg.evaluate("([c,d])=>{wlShot.WL.userData.setTint('hood',[c,d]);wlShot.step(2);}", [c, d])
        for az in (2.2, 3.1416, -2.2, 1.5708, -1.5708): bs.append(label(shot(az, 1.52, 2.2, 1.55), f'{n} {az:+.1f}'))
    [row(bs[i:i+5], os.path.join(OUT, os.environ.get('BACK', 'back-colors') + f'-{i//5}.png')) for i in range(0, len(bs), 5)]
    print(pg.evaluate("()=>wlShot.WL.userData.hw"))
    b.close()
print('ok', OUT)
