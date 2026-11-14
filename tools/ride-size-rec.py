# -*- coding: utf-8 -*-
"""이동 연출에서 (2026-11-14: 뒤통수만 보인 시간 — 머리 뼈 앞 방향과 카메라 쪽이 135° 넘게 벌어진 프레임 시간 합, --rides whirl만 고르기)
    원더룹이 화면에서 차지하는 높이 비교 (2026-11-13) — 촬영 서버(8000)가 떠 있을 때 저장소 루트에서:
     python3 tools/ride-size-rec.py [--tag 이름] [--pc] [--port 8000]
   같은 휴대폰 세로 크기(390×844, 기본 — --pc면 1280×720)로 두 이동을 차례로 녹화한다:
     달 → 화성(별똥별 꼬리 타기 — 회색 정원 출구로 걸어 들어가 화성에 내려앉아 조작이 풀릴 때까지)
     화성 → 금성(큰 회오리 — 화산 꼭대기에서 금성행 회오리로 걸어 들어가 금성에 내려앉아 조작이 풀릴 때까지)
   매 프레임 사진 모드 몸 범위(wlPhoto.body — 탈 꼭대기~발끝)를 화면에 비춘 높이(화면 높이에 대한 %)와 잘림(화면 밖 1% 넘게)을 적고(먼지구름·우주 지도가 덮은 동안은 뺌),
   0.8초마다 화면을 찍어 두 이동에서 고르게 여섯 장씩 골라 높이 %를 적은 나란히 비교 그림을 만든다.
   결과 docs/compare/ride-size/<tag>-<phone|pc>.json · -compare.jpg · 영상 <tag>-<phone|pc>-<meteor|whirl>.webm. 소리 끔, 끝나면 닫음."""
import json, os, shutil, statistics, sys, time
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); a = sys.argv[1:]
TAG = a[a.index('--tag') + 1] if '--tag' in a else 'after'; RIDES = (a[a.index('--rides') + 1] if '--rides' in a else 'meteor,whirl').split(','); PC = '--pc' in a; PORT = a[a.index('--port') + 1] if '--port' in a else '8000'
DEV = 'pc' if PC else 'phone'; OUT = os.path.join(ROOT, 'docs/compare/ride-size'); os.makedirs(OUT, exist_ok=True)
SIZE = """(()=>{window.__sz=[];const t0=performance.now();const L=()=>{try{const G=wlGame,W=G.mission.hero(),U=W.userData;
  if(U.riding&&!document.getElementById('wlDustVeil')&&!document.getElementById('wlTravelMap')&&window.wlPhoto){const b=wlPhoto.body(G.view.camera);if(b&&b.rect){const r=b.rect,h=r[3]-r[1],w=r[2]-r[0],
    ix=Math.max(0,Math.min(1,r[2])-Math.max(0,r[0])),iy=Math.max(0,Math.min(1,r[3])-Math.max(0,r[1])),out=w>0&&h>0?1-ix*iy/(w*h):0;const hd=W.getObjectByName('head')||W,hp=new W.position.constructor(),fw=new W.position.constructor();hd.getWorldPosition(hp);hd.getWorldDirection(fw);fw.y=0;fw.normalize();const cv=G.view.camera.position.clone().sub(hp).normalize();
    __sz.push([+((performance.now()-t0)/1000).toFixed(2),+h.toFixed(4),+out.toFixed(3),+(fw.x*cv.x+fw.z*cv.z).toFixed(3)]);}}}catch(e){}requestAnimationFrame(L);};L();})()"""
NOWH = "()=>{const s=window.__sz||[];return s.length?s[s.length-1][1]:null}"
FL_M = ['have:infinite-space:necklace', 'space:demo', 'space:rock', 'moon:bgm-intro']
FL_W = ['have:infinite-space:necklace', 'mars:met', 'mars:call', 'mars:recA', 'mars:recB', 'mars:told', 'clear:space-mars', 'item:infinite-space:bluesunset-glass', 'meet:infinite-space:pipi', 'meet:infinite-space:dungdung',
        'secret:infinite-space:marssound', 'secret:infinite-space:bluesunset', 'secret:infinite-space:volcano', 'mars:flag', 'mars:bgm-intro']
R = {}; SHOTS = {}
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio', '--autoplay-policy=no-user-gesture-required', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'])
    o = dict(viewport={'width': 1280, 'height': 720}) if PC else dict(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    for ride in RIDES:
        vd = os.path.join(OUT, 'vid-' + ride); c = b.new_context(**o, record_video_dir=vd, record_video_size=o['viewport']); pg = c.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
        zone = 'space-garden' if ride == 'meteor' else 'space-mars'
        pg.goto('http://localhost:%s/?world=infinite-space&zone=%s&notitle%s' % (PORT, zone, '' if PC else '&quality=mobile')); pg.wait_for_function('window.wlGame&&wlGame.state', timeout=120000); pg.wait_for_timeout(1500)
        pg.evaluate("([f,w])=>{localStorage.clear();localStorage.setItem('wl-help-seen','1');f.forEach(k=>wlGame.state.setFlag(k,true));if(w)wlGame.state.saveAfter('space-mars',{time:1,flag:true})}", [FL_M if ride == 'meteor' else FL_W, ride == 'whirl']); pg.reload()
        pg.wait_for_function('window.wlZone&&wlZone.cur&&wlZone.cur.spots&&window.wlPhoto', timeout=120000); pg.wait_for_timeout(3000)
        st = lambda: pg.evaluate('wlZone.cur.state?wlZone.cur.state():{}')
        if ride == 'meteor':
            ex = pg.evaluate('wlZone.cur.spots.exit'); pg.evaluate("([x,z])=>{const W=wlGame.mission.hero();W.position.x=x-3.2;W.position.z=z+.4;}", ex); pg.wait_for_timeout(1200)
            pg.evaluate(SIZE); pg.evaluate("([x,z])=>wlGame.mission.hero().userData.walkTo(x,z)", ex)
        else:
            for _ in range(60):
                s0 = st()
                if s0.get('ride') or s0.get('summit'): break
                w = s0['secretWhirl']; pg.evaluate("([x,z])=>{const W=wlGame.mission.hero(),P=W.position;if(Math.hypot(P.x-x,P.z-z)>6){P.x=x+3.5;P.z=z+1;}W.userData.walkTo(x,z)}", w); pg.wait_for_timeout(400)
            for _ in range(160):
                s0 = st()
                if s0.get('summit') and not s0.get('ride'): break
                pg.wait_for_timeout(250)
            pg.wait_for_timeout(1800); pg.evaluate(SIZE); pg.evaluate("([x,z])=>wlGame.mission.hero().userData.walkTo(x,z)", pg.evaluate('wlZone.cur.spots.bigTop'))
        t0 = time.time(); shots = []; started = None; k = 0
        while time.time() - t0 < 90:
            riding = pg.evaluate('!!wlGame.mission.hero().userData.riding')
            if riding and started is None: started = time.time()
            if started and not riding and time.time() - started > 4: break
            if started:
                f = os.path.join(OUT, '%s-%s-%s-%02d.png' % (TAG, DEV, ride, k)); pg.screenshot(path=f); shots.append([round(time.time() - started, 1), pg.evaluate(NOWH), f, pg.evaluate("!!(document.getElementById('wlDustVeil')||document.getElementById('wlTravelMap'))")]); k += 1
            pg.wait_for_timeout(800)
        sz = pg.evaluate('window.__sz||[]'); vid = pg.video.path(); c.close()
        shutil.move(vid, os.path.join(OUT, '%s-%s-%s.webm' % (TAG, DEV, ride))); shutil.rmtree(vd, ignore_errors=True)
        hs = [x[1] for x in sz if x[1] > 0]; bad = [x for x in sz if x[2] > .01]
        back = 0.0; runs = []; cur = 0.0
        for i in range(1, len(sz)):
            dtf = min(.1, sz[i][0] - sz[i - 1][0])
            if len(sz[i]) > 3 and sz[i][3] < -.707: back += dtf; cur += dtf
            else:
                if cur > 0: runs.append(round(cur, 2))
                cur = 0.0
        if cur > 0: runs.append(round(cur, 2))
        R[ride] = {'프레임': len(sz), '원더룹 높이 %(가운데값)': round(statistics.median(hs) * 100, 1) if hs else None,
                   '높이 % 10~90번째': [round(sorted(hs)[int(len(hs) * .1)] * 100, 1), round(sorted(hs)[int(len(hs) * .9)] * 100, 1)] if hs else None,
                   '25~35% 안 비율': round(sum(1 for h in hs if .25 <= h <= .35) / max(1, len(hs)) * 100, 1), '25% 넘는 비율': round(sum(1 for h in hs if h >= .25) / max(1, len(hs)) * 100, 1),
                   '잘린 프레임(1% 넘게)': len(bad), '뒤통수만 보인 시간(초)': round(back, 2), '뒤통수 한 번에 가장 길게(초)': max(runs) if runs else 0, '뒤통수 구간 수': len(runs), '오류': errs}
        SHOTS[ride] = [x for x in shots if x[1] and not x[3]]
    b.close()
# 나란히 비교 그림: 이동마다 고르게 여섯 장 + 높이 %
try:
    from PIL import Image, ImageDraw, ImageFont
    fnt = ImageFont.truetype('/System/Library/Fonts/AppleSDGothicNeo.ttc', 30)
    rows = []
    for ride, name in [x for x in (('meteor', '달 → 화성 (별똥별)'), ('whirl', '화성 → 금성 (큰 회오리)')) if x[0] in SHOTS]:
        L = SHOTS.get(ride) or []; pick = [L[int(i * (len(L) - 1) / 5)] for i in range(6)] if len(L) >= 6 else L
        ims = []
        for t, h, f, _ in pick:
            im = Image.open(f).convert('RGB'); im = im.resize((int(im.width * 520 / im.height), 520)); d = ImageDraw.Draw(im)
            d.rectangle([0, 0, im.width, 44], fill=(40, 26, 38)); d.text((10, 6), '%.1f초 · 높이 %d%%' % (t, round(h * 100)), font=fnt, fill=(255, 240, 220)); ims.append(im)
        W2 = sum(i.width for i in ims) + 260; row = Image.new('RGB', (W2, 520), (247, 240, 227)); dd = ImageDraw.Draw(row)
        dd.text((12, 200), name, font=ImageFont.truetype('/System/Library/Fonts/AppleSDGothicNeo.ttc', 26), fill=(62, 40, 52)); dd.text((12, 240), '가운데값 %s%%' % R[ride]['원더룹 높이 %(가운데값)'], font=fnt, fill=(62, 40, 52))
        x = 260
        for im in ims: row.paste(im, (x, 0)); x += im.width
        rows.append(row)
    Wm = max(r.width for r in rows); out = Image.new('RGB', (Wm, 520 * len(rows) + 10 * (len(rows) - 1)), (247, 240, 227)); y = 0
    for r in rows: out.paste(r, (0, y)); y += 530
    out.save(os.path.join(OUT, '%s-%s-compare.jpg' % (TAG, DEV)), quality=85); R['비교 그림'] = 'docs/compare/ride-size/%s-%s-compare.jpg' % (TAG, DEV)
except Exception as e:
    R['비교 그림 오류'] = str(e)
for ride in SHOTS:
    for x in SHOTS[ride]: pass
json.dump(R, open(os.path.join(OUT, '%s-%s.json' % (TAG, DEV)), 'w'), ensure_ascii=False, indent=1); print(json.dumps(R, ensure_ascii=False))
