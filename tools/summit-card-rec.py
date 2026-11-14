# -*- coding: utf-8 -*-
"""화산 꼭대기 카드 순서·이름표 가림 + 화산 회오리 원더룹 크기 + 금성 안개 전후 (2026-11-14) — 촬영 서버(8000)가 떠 있을 때 저장소 루트에서:
     python3 tools/summit-card-rec.py [--pc] [--port 8000]
   ① 금성 구름(space-venus)에 바로 서서 캐릭터 안개 배율 1(예전) · 구역 값(지금 .12)을 같은 자리에서 찍어 나란히(venus-fog.jpg)
   ② 화성(STAGE 2 완료 · 깃발 전)에서 북서쪽 회오리를 타고 화산 꼭대기로 — 타는 동안 매 프레임 원더룹 화면 높이 %(사진 모드 몸 범위)·잘린 프레임
   ③ 꼭대기에서 '깃발 꽂기' → 0.2초마다 발견 띠 카드(#wlStrip)·안내 문구(#wlToast)가 떠 있는지, 둘이 함께 뜬 표본 수, 순서,
      목표 이름표('금성행 회오리')가 카드·띠·안내 문구에 15% 넘게 덮인 표본(tools/cover-probe.js) — 0.6초마다 찍어 카드 순서 그림(summit-cards.jpg)
   결과 docs/compare/summit-card/<phone|pc>.json · 그림. 소리 끔, 끝나면 닫음."""
import json, os, statistics, sys
from playwright.sync_api import sync_playwright
TAG = sys.argv[sys.argv.index('--tag') + 1] if '--tag' in sys.argv else ''
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); a = sys.argv[1:]
PC = '--pc' in a; PORT = a[a.index('--port') + 1] if '--port' in a else '8000'; DEV = ('pc' if PC else 'phone') + ('-' + TAG if '--tag' in sys.argv else '')
OUT = os.path.join(ROOT, 'docs/compare/summit-card'); os.makedirs(OUT, exist_ok=True)
PROBE = open(os.path.join(ROOT, 'tools/cover-probe.js')).read()
SIZE = """(()=>{window.__sz=[];const t0=performance.now();const L=()=>{try{const G=wlGame,W=G.mission.hero(),U=W.userData;
  if(U.riding&&window.wlPhoto){const b=wlPhoto.body(G.view.camera);if(b&&b.rect){const r=b.rect,h=r[3]-r[1],w=r[2]-r[0],
    ix=Math.max(0,Math.min(1,r[2])-Math.max(0,r[0])),iy=Math.max(0,Math.min(1,r[3])-Math.max(0,r[1])),out=w>0&&h>0?1-ix*iy/(w*h):0;const hd=W.getObjectByName('head')||W,hp=new W.position.constructor(),fw=new W.position.constructor();hd.getWorldPosition(hp);hd.getWorldDirection(fw);fw.y=0;fw.normalize();const cv=G.view.camera.position.clone().sub(hp).normalize();__sz.push([+((performance.now()-t0)/1000).toFixed(2),+h.toFixed(4),+out.toFixed(3),+(fw.x*cv.x+fw.z*cv.z).toFixed(3),W.rotation.y]);}}}catch(e){}if(!window.__szStop)requestAnimationFrame(L);};L();})()"""
VIS = """(id=>{const e=document.getElementById(id);if(!e)return false;for(let q=e;q&&q!==document.documentElement;q=q.parentElement){const c=getComputedStyle(q);if(c.display==='none'||c.visibility==='hidden'||+c.opacity<.05)return false;}const r=e.getBoundingClientRect();return r.width>2&&r.height>2;})"""
FL = ['have:infinite-space:necklace', 'mars:met', 'mars:call', 'mars:recA', 'mars:recB', 'mars:told', 'clear:space-mars', 'item:infinite-space:bluesunset-glass', 'meet:infinite-space:pipi', 'meet:infinite-space:dungdung',
      'secret:infinite-space:marssound', 'secret:infinite-space:bluesunset', 'mars:bgm-intro']
R = {}
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio', '--autoplay-policy=no-user-gesture-required', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'])
    o = dict(viewport={'width': 1280, 'height': 720}) if PC else dict(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    q = '' if PC else '&quality=mobile'
    # ① 금성 안개
    c = b.new_context(**o); pg = c.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto('http://localhost:%s/?world=infinite-space&zone=space-venus&notitle%s' % (PORT, q)); pg.wait_for_function('window.wlZone&&wlZone.cur', timeout=120000); pg.wait_for_timeout(3500)
    fogk = pg.evaluate('wlZone.cur.charFog') or 1; HASF = pg.evaluate('!!window.wlCharFog')
    if HASF: pg.evaluate('wlCharFog(1)'); pg.wait_for_timeout(500); pg.screenshot(path=os.path.join(OUT, DEV + '-venus-before.png'))
    HASF and pg.evaluate('k=>wlCharFog(k)', fogk); pg.wait_for_timeout(500); pg.screenshot(path=os.path.join(OUT, DEV + '-venus-after.png'))
    R['금성 캐릭터 안개 배율'] = fogk; R['금성 오류'] = errs; c.close()
    try:
        from PIL import Image, ImageDraw, ImageFont
        fnt = ImageFont.truetype('/System/Library/Fonts/AppleSDGothicNeo.ttc', 30); ims = []
        for k, lab in (('before', '고치기 전 (안개 그대로)'), ('after', '고친 뒤 (캐릭터 안개 %.2f배)' % fogk)):
            im = Image.open(os.path.join(OUT, '%s-venus-%s.png' % (DEV, k))).convert('RGB'); im = im.resize((int(im.width * 900 / im.height), 900)); d = ImageDraw.Draw(im)
            d.rectangle([0, 0, im.width, 50], fill=(40, 26, 38)); d.text((12, 8), lab, font=fnt, fill=(255, 240, 220)); ims.append(im)
        out = Image.new('RGB', (sum(i.width for i in ims) + 10, 900), (247, 240, 227)); x = 0
        for im in ims: out.paste(im, (x, 0)); x += im.width + 10
        out.save(os.path.join(OUT, DEV + '-venus-fog.jpg'), quality=86)
    except Exception as e: R['금성 그림 오류'] = str(e)
    # ② 화산 회오리 + ③ 깃발 카드
    c = b.new_context(**o); pg = c.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto('http://localhost:%s/?world=infinite-space&zone=space-mars&notitle%s' % (PORT, q)); pg.wait_for_function('window.wlGame&&wlGame.state', timeout=120000); pg.wait_for_timeout(1500)
    pg.evaluate("f=>{localStorage.clear();localStorage.setItem('wl-help-seen','1');f.forEach(k=>wlGame.state.setFlag(k,true));wlGame.state.saveAfter('space-mars',{time:1})}", FL); pg.reload()
    pg.wait_for_function('window.wlZone&&wlZone.cur&&wlZone.cur.spots&&window.wlPhoto', timeout=120000); pg.wait_for_timeout(3000)
    st = lambda: pg.evaluate('wlZone.cur.state?wlZone.cur.state():{}')
    pg.evaluate(SIZE)
    for _ in range(60):
        s0 = st()
        if s0.get('ride'): break
        w = s0['secretWhirl']; pg.evaluate("([x,z])=>{const W=wlGame.mission.hero(),P=W.position;if(Math.hypot(P.x-x,P.z-z)>6){P.x=x+3.5;P.z=z+1;}W.userData.walkTo(x,z)}", w); pg.wait_for_timeout(400)
    k = 0
    for i in range(160):
        s0 = st()
        if s0.get('summit') and not s0.get('ride'): break
        if i % 8 == 4 and k < 4: pg.screenshot(path=os.path.join(OUT, '%s-volride-%d.png' % (DEV, k))); k += 1
        pg.wait_for_timeout(250)
    pg.evaluate('window.__szStop=true'); sz = pg.evaluate('window.__sz||[]'); hs = [x[1] for x in sz if x[1] > 0]
    R['화산 회오리'] = {'프레임': len(sz), '원더룹 높이 %(가운데값)': round(statistics.median(hs) * 100, 1) if hs else None,
                    '높이 % 10~90번째': [round(sorted(hs)[int(len(hs) * .1)] * 100, 1), round(sorted(hs)[int(len(hs) * .9)] * 100, 1)] if hs else None,
                    '20~30% 안 비율': round(sum(1 for h in hs if .2 <= h <= .3) / max(1, len(hs)) * 100, 1), '잘린 프레임(1% 넘게)': len([x for x in sz if x[2] > .01]), '얼굴 쪽(앞 ~ 옆) 비율 %': round(sum(1 for x in sz if len(x) > 3 and x[3] > 0) / max(1, len(sz)) * 100, 1), '뒤통수만 보인 비율 %': round(sum(1 for x in sz if len(x) > 3 and x[3] < -.707) / max(1, len(sz)) * 100, 1), '평균 회전 속도(°/초)': round(abs(sz[-1][4] - sz[0][4]) / max(.1, sz[-1][0] - sz[0][0]) * 57.3, 1) if len(sz) > 2 else None}
    pg.wait_for_timeout(1500)
    S = pg.evaluate('wlZone.cur.spots'); fsp = S['flagSpot']; sm = S['summit']
    pg.evaluate("([x,z])=>wlGame.mission.hero().userData.walkTo(x,z)", [fsp[0] + (sm[0] - fsp[0]) * .22, fsp[1] + (sm[1] - fsp[1]) * .22]); pg.wait_for_timeout(5000)
    pg.add_script_tag(content=PROBE)
    for _ in range(50):
        if '깃발' in pg.evaluate('wlGame.interact.prompt()'): break
        pg.wait_for_timeout(200)
    pg.evaluate('wlGame.interact.act()')
    seq = []; both = 0; n = 0; k = 0; t = 0.0; shots = []
    while t < 34:
        s, tt = pg.evaluate(VIS + "('wlStrip')"), pg.evaluate(VIS + "('wlToast')")
        n += 1; both += 1 if (s and tt) else 0
        cur = '띠 카드' if s and not tt else '안내 문구' if tt and not s else '둘 다' if s and tt else None
        if cur and (not seq or seq[-1] != cur): seq.append(cur)
        if (s or tt) and k < 40 and n % 3 == 0:
            f = os.path.join(OUT, '%s-card-%02d.png' % (DEV, k)); pg.screenshot(path=f); shots.append((round(t, 1), cur, f)); k += 1
        pg.wait_for_timeout(200); t += .2
        if t > 8 and not s and not tt and '안내 문구' in seq and (st().get('bigOn') or t > 26): break
    rep = pg.evaluate('window.__cover.report()')
    R['꼭대기 카드'] = {'표본': n, '띠 카드·안내 문구 함께 뜬 표본': both, '뜬 순서': seq, '이름표 가림': rep.get('label'), '가려진 화면(대사·카드)': rep.get('covered'), '깃발': st().get('flag'), '큰 회오리': st().get('bigOn')}
    R['오류'] = errs; c.close(); b.close()
try:
    from PIL import Image, ImageDraw, ImageFont
    fnt = ImageFont.truetype('/System/Library/Fonts/AppleSDGothicNeo.ttc', 26)
    pick = []
    for lab in ('띠 카드', '안내 문구'):
        L = [x for x in shots if x[1] == lab]
        if L: pick += [L[0], L[len(L) // 2]]
    ims = []
    for t, lab, f in pick:
        im = Image.open(f).convert('RGB'); im = im.resize((int(im.width * 640 / im.height), 640)); d = ImageDraw.Draw(im)
        d.rectangle([0, im.height - 44, im.width, im.height], fill=(40, 26, 38)); d.text((10, im.height - 38), '%.1f초 · %s' % (t, lab), font=fnt, fill=(255, 240, 220)); ims.append(im)
    vr = [Image.open(os.path.join(OUT, '%s-volride-%d.png' % (DEV, i))).convert('RGB') for i in range(4) if os.path.exists(os.path.join(OUT, '%s-volride-%d.png' % (DEV, i)))]
    for i, im in enumerate(vr):
        im = im.resize((int(im.width * 640 / im.height), 640)); d = ImageDraw.Draw(im); d.rectangle([0, im.height - 44, im.width, im.height], fill=(40, 26, 38)); d.text((10, im.height - 38), '화산 회오리 %d' % (i + 1), font=fnt, fill=(255, 240, 220)); vr[i] = im
    for name, L in (('summit-cards', ims), ('volride', vr)):
        if not L: continue
        out = Image.new('RGB', (sum(i.width for i in L) + 8 * (len(L) - 1), 640), (247, 240, 227)); x = 0
        for im in L: out.paste(im, (x, 0)); x += im.width + 8
        out.save(os.path.join(OUT, '%s-%s.jpg' % (DEV, name)), quality=85)
except Exception as e: R['그림 오류'] = str(e)
json.dump(R, open(os.path.join(OUT, DEV + '.json'), 'w'), ensure_ascii=False, indent=1); print(json.dumps(R, ensure_ascii=False))
