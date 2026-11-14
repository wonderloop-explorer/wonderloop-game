# -*- coding: utf-8 -*-
"""이동 연출 녹화·재기 (2026-11-14) — 촬영 서버(8000)가 떠 있을 때 저장소 루트에서:
     python3 tools/travel-rec.py [--tag 이름] [--view 393x659] [--dpr 3] [--rides meteor,whirl] [--pc] [--port 8000]
   기본 크기 = 실제 아이폰 사파리 세로(주소창·아래 막대 포함 — iPhone 15/16·Pro 393×852 화면에서 보이는 칸 약 393×659, 기기 픽셀 비율 3, 휴대폰 단계).
   (예전 시험 크기 390×844는 주소창이 없는 크기 — --view 390x844로.)
   두 이동을 차례로: 달 → 화성(별똥별 — 회색 정원 출구로 걸어 들어가 화성에 내려앉아 조작이 풀릴 때까지),
                    화성 → 금성(큰 회오리 — 화산 꼭대기 금성행 회오리로 걸어 들어가 금성에 내려앉아 조작이 풀릴 때까지)
   매 프레임: 단계(travel 표시), 원더룹 화면 높이 %·화면 가운데 높이(사진 모드 몸 범위), 잘림, 뒤통수(머리 앞 방향과 카메라 쪽 135° 넘게),
             바쁜 시간(그 프레임 콜백 + gl.finish — GPU까지), 그리기 수, 프레임 간격.
   단계마다: 원더룹 높이 가운데값, 화면 위아래 흔들림 폭(머리 뼈의 화면 높이 − 0.6초 평균, 화면 높이 % — 95번째 × 2), 바쁜 시간 가운데값·95번째·최대, 가장 긴 프레임 간격, 그리기 수.
   화성 → 금성은 소리 시계로 닿아서 구름까지 걸린 시간·해결 화음 − 구름 진입. 비교 그림(두 이동 여섯 장씩 + 높이 %).
   결과 docs/compare/travel/<tag>-<크기>.json · -compare.jpg. 소리 끔, 끝나면 닫음."""
import json, os, shutil, statistics, sys, time
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); a = sys.argv[1:]
arg = lambda k, d: a[a.index(k) + 1] if k in a else d
TAG = arg('--tag', 'after'); PC = '--pc' in a; PORT = arg('--port', '8000'); RIDES = arg('--rides', 'meteor,whirl').split(',')
SWIFT = '--swift' in a  # 소프트웨어 그리기(SwiftShader) — GPU 일이 CPU 시간으로 드러나 단계별 그리기 무게를 견줄 수 있다(휴대폰 GPU 대신)
NOSHOT = '--noshot' in a  # 화면 찍기 없이(찍는 동안 페이지가 멈춰 게임 시계가 소리 시계보다 늦어진다 — 프레임·해결 화음 재기는 이것으로)
STRIP = '--strip' in a  # 1초마다 한 장 — 두 이동을 두 줄로(칸마다 초·장면 이름)
VW, VH = (1280, 720) if PC else map(int, arg('--view', '393x659').split('x')); DPR = float(arg('--dpr', '1' if PC else '3'))
DEV = ('pc' if PC else '%dx%d' % (VW, VH)) + ('-swift' if SWIFT else '') + ('-noshot' if NOSHOT else '') + ('-strip' if STRIP else ''); OUT = os.path.join(ROOT, 'docs/compare/travel'); os.makedirs(OUT, exist_ok=True)
PROBE = """(()=>{const S=window.__tp={rec:[],on:false,gl:null};const P=WebGL2RenderingContext.prototype;let calls=0;
 for(const k of ['drawElements','drawArrays','drawElementsInstanced','drawArraysInstanced']){const f=P[k];P[k]=function(){calls++;S.gl=this;return f.apply(this,arguments);};}
 const raf=window.requestAnimationFrame.bind(window);let last=0;const t00=performance.now();
 const ORD=['touch','lift','rise','space','fly','map','orb','cloud'],MO=['grab','pull','fly','down','land'];
 window.requestAnimationFrame=cb=>raf(t=>{const c0=calls,t0=performance.now();cb(t);if(!S.on||(calls<=c0&&!document.getElementById('wlTravelMap'))||t===S.lastT){if(S.pause)S.skip=1;return;}S.lastT=t;if(S.gl)S.gl.finish();const t1=performance.now();
   try{const G=wlGame,W=G.mission.hero(),U=W.userData;const L=G.travel.log?G.travel.log():{};let ph='-';for(const k of (S.ride==='whirl'?ORD:MO))if(L[k]!=null||(L.phase===k))ph=k;if(L.phase)ph=L.phase;
     const veil=!!(document.getElementById('wlDustVeil')||document.getElementById('wlTravelMap'));let h=0,cy=0,out=0,dot=1;
     if(window.wlPhoto&&!veil){const b=wlPhoto.body(G.view.camera);if(b&&b.rect){const r=b.rect;h=r[3]-r[1];const w=r[2]-r[0],ix=Math.max(0,Math.min(1,r[2])-Math.max(0,r[0])),iy=Math.max(0,Math.min(1,r[3])-Math.max(0,r[1]));out=w>0&&h>0?1-ix*iy/(w*h):0;}
       const hd=W.getObjectByName('head')||W,hp=new W.position.constructor(),fw=new W.position.constructor();hd.getWorldPosition(hp);{const q=hp.clone().project(G.view.camera);cy=(q.y+1)/2;}hd.getWorldDirection(fw);fw.y=0;fw.normalize();const cv=G.view.camera.position.clone().sub(hp).normalize();dot=fw.x*cv.x+fw.z*cv.z;}
     let fr=0;if(S.ride==='whirl'){try{const z=wlZone.cur.state?wlZone.cur.state():null;if(z&&z.pipi&&z.dung){const cam=G.view.camera,V=W.position.constructor;let n=0;for(const p of [z.pipi,z.dung]){const a=new V(p[0],p[1]+.6,p[2]).project(cam);if(a.z<1&&Math.abs(a.x)<.95&&Math.abs(a.y)<.95)n++;}fr=n;}}catch(e){}}
     S.rec.push([+((t0-t00)/1000).toFixed(3),ph,+h.toFixed(4),+cy.toFixed(4),+out.toFixed(3),+dot.toFixed(3),+(t1-t0).toFixed(2),calls-c0,last&&!S.skip&&!S.pause?+(t0-last).toFixed(1):0,veil?1:0,!!U.riding,fr]);}catch(e){S.err=String(e);}
   S.skip=0;last=t0;});})()"""
FL_M = ['have:infinite-space:necklace', 'space:demo', 'space:rock', 'moon:bgm-intro']
FL_W = ['have:infinite-space:necklace', 'mars:met', 'mars:call', 'mars:recA', 'mars:recB', 'mars:told', 'clear:space-mars', 'item:infinite-space:bluesunset-glass', 'meet:infinite-space:pipi', 'meet:infinite-space:dungdung',
        'secret:infinite-space:marssound', 'secret:infinite-space:bluesunset', 'secret:infinite-space:volcano', 'mars:flag', 'mars:bgm-intro']
LBN = {'come': '감쌈', 'grab': '감쌈', 'pull': '감쌈', 'rise': '떠오름', 'space': '우주', 'dest': '목적지', 'map': '지도', 'veil': '전환', 'arrive': '도착', 'fall': '도착', 'hop': '도착', 'stand': '도착', 'cloud': '도착'}
def LBL(ride, ph): n = LBN.get(ph, ph); return ('잡음' if n == '감쌈' and ride == 'meteor' else n)
def pct(v, q): v = sorted(v); return v[min(len(v) - 1, int(len(v) * q))] if v else None
R = {'크기': DEV, '기기 픽셀 비율': DPR}; SHOTS = {}
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio', '--autoplay-policy=no-user-gesture-required', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=' + ('swiftshader' if SWIFT else 'metal')])
    o = dict(viewport={'width': VW, 'height': VH}) if PC else dict(viewport={'width': VW, 'height': VH}, device_scale_factor=DPR, is_mobile=True, has_touch=True)
    for ride in RIDES:
        c = b.new_context(**o); c.add_init_script(PROBE); pg = c.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:200])); pg.on('console', lambda m: m.type == 'error' and errs.append(m.text[:200]))
        zone = 'space-garden' if ride == 'meteor' else 'space-mars'
        pg.goto('http://localhost:%s/?world=infinite-space&zone=%s&notitle%s' % (PORT, zone, '' if PC else '&quality=mobile')); pg.wait_for_function('window.wlGame&&wlGame.state', timeout=120000); pg.wait_for_timeout(1500)
        pg.evaluate("([f,w])=>{localStorage.clear();localStorage.setItem('wl-help-seen','1');f.forEach(k=>wlGame.state.setFlag(k,true));if(w)wlGame.state.saveAfter('space-mars',{time:1,flag:true})}", [FL_M if ride == 'meteor' else FL_W, ride == 'whirl']); pg.reload()
        pg.wait_for_function('window.wlZone&&wlZone.cur&&wlZone.cur.spots&&window.wlPhoto', timeout=120000); pg.wait_for_timeout(3000)
        st = lambda: pg.evaluate('wlZone.cur.state?wlZone.cur.state():{}')
        if ride == 'meteor':
            ex = pg.evaluate('wlZone.cur.spots.exit'); pg.evaluate("([x,z])=>{const W=wlGame.mission.hero();W.position.x=x-3.2;W.position.z=z+.4;}", ex); pg.wait_for_timeout(1200)
            pg.evaluate("r=>{window.__tp.ride=r;window.__tp.on=true}", ride); pg.evaluate("([x,z])=>wlGame.mission.hero().userData.walkTo(x,z)", ex)
        else:
            for _ in range(60):
                s0 = st()
                if s0.get('ride') or s0.get('summit'): break
                w = s0['secretWhirl']; pg.evaluate("([x,z])=>{const W=wlGame.mission.hero(),P=W.position;if(Math.hypot(P.x-x,P.z-z)>6){P.x=x+3.5;P.z=z+1;}W.userData.walkTo(x,z)}", w); pg.wait_for_timeout(400)
            for _ in range(160):
                s0 = st()
                if s0.get('summit') and not s0.get('ride'): break
                pg.wait_for_timeout(250)
            pg.wait_for_timeout(1800); pg.evaluate("r=>{window.__tp.ride=r;window.__tp.on=true}", ride); pg.evaluate("([x,z])=>wlGame.mission.hero().userData.walkTo(x,z)", pg.evaluate('wlZone.cur.spots.bigTop'))
        t0 = time.time(); shots = []; started = None; k = 0
        while time.time() - t0 < 90:
            riding = pg.evaluate('!!wlGame.mission.hero().userData.riding')
            if riding and started is None: started = time.time()
            if started and not riding and time.time() - started > 4: break
            if started and not NOSHOT:
                last = pg.evaluate('(()=>{const r=window.__tp.rec;return r.length?r[r.length-1]:null})()')
                if STRIP:  # 게임 시각(잡음·감쌈 시작부터)이 다음 정수 초를 지날 때마다 한 장(가볍게 — jpeg·css 크기)
                    T0s = pg.evaluate("(()=>{const r=window.__tp.rec;const a=r.find(x=>x[1]==='come'||x[1]==='grab');return a?a[0]:null})()")
                    if last and T0s is not None and last[0] - T0s >= k - .05:
                        f = os.path.join(OUT, '%s-%s-%s-%02d.jpg' % (TAG, DEV, ride, k)); pg.evaluate('window.__tp.pause=1'); pg.screenshot(path=f, type='jpeg', quality=70, scale='css'); pg.evaluate('window.__tp.pause=0;window.__tp.skip=1')
                        shots.append([k, last, f]); k += 1
                else:
                    f = os.path.join(OUT, '%s-%s-%s-%02d.png' % (TAG, DEV, ride, k)); pg.evaluate('window.__tp.pause=1'); pg.screenshot(path=f); pg.evaluate('window.__tp.pause=0;window.__tp.skip=1')
                    shots.append([round(time.time() - started, 1), last, f]); k += 1
            pg.wait_for_timeout(60 if STRIP else 800)
        rec = pg.evaluate('window.__tp.rec'); L = pg.evaluate('wlGame.travel.log?wlGame.travel.log():{}'); perr = pg.evaluate('window.__tp.err||null'); c.close()
        rec = [r for r in rec if r[10]]  # 타는 동안만
        out = {'프레임': len(rec), '오류': errs + ([perr] if perr else [])}
        vis = [r for r in rec if not r[9] and r[2] > 0]
        hs = [r[2] for r in vis]; out['원더룹 높이 %(가운데값)'] = round(statistics.median(hs) * 100, 1) if hs else None
        out['높이 % 10~90번째'] = [round(pct(hs, .1) * 100, 1), round(pct(hs, .9) * 100, 1)] if hs else None
        out['잘린 프레임(1% 넘게)'] = len([r for r in vis if r[4] > .01])
        back = 0.0; runs = []; cur = 0.0
        for i in range(1, len(vis)):
            dtf = min(.1, vis[i][0] - vis[i - 1][0])
            if vis[i][5] < -.707: back += dtf; cur += dtf
            else:
                if cur: runs.append(round(cur, 2))
                cur = 0.0
        if cur: runs.append(round(cur, 2))
        out['뒤통수만 보인 시간(초)'] = round(back, 2); out['뒤통수 한 번에 가장 길게(초)'] = max(runs) if runs else 0
        # 흔들림: 화면 가운데 높이 − 0.6초 이동 평균
        dev = []
        for i, r in enumerate(vis):
            win = [x[3] for x in vis if abs(x[0] - r[0]) <= .3]
            if len(win) > 4: dev.append((r[1], abs(r[3] - sum(win) / len(win))))
        PH = {}
        for r in rec:
            P = PH.setdefault(r[1], {'n': 0, 'busy': [], 'iv': [], 'calls': [], 'h': []}); P['n'] += 1; P['busy'].append(r[6]); P['calls'].append(r[7])
            if r[8] and r[8] < 500: P['iv'].append(r[8])
            if not r[9] and r[2] > 0: P['h'].append(r[2])
        ph = {}
        for k2, P in PH.items():
            dd = [d for (pp, d) in dev if pp == k2]
            ph[k2] = {'프레임': P['n'], '바쁜 ms 가운데값': round(statistics.median(P['busy']), 2), '바쁜 ms 95번째': round(pct(P['busy'], .95), 2), '바쁜 ms 최대': round(max(P['busy']), 2),
                      '프레임 간격 ms 가운데값': round(statistics.median(P['iv']), 1) if P['iv'] else None, '프레임 간격 ms 90번째': round(pct(P['iv'], .9), 1) if P['iv'] else None, '가장 긴 프레임 간격 ms': round(max(P['iv']), 1) if P['iv'] else None, '가장 낮은 초당 프레임': round(1000 / max(P['iv']), 1) if P['iv'] else None, '그리기 수 최대': max(P['calls']),
                      '원더룹 높이 %': round(statistics.median(P['h']) * 100, 1) if P['h'] else None, '위아래 흔들림 폭 %': round(pct(dd, .95) * 200, 2) if dd else None}
        out['단계'] = ph; out['위아래 흔들림 폭 %(전체, 95번째×2)'] = round(pct([d for _, d in dev], .95) * 200, 2) if dev else None
        dd2 = lambda x, y: round(L[y] - L[x], 2) if L.get(x) is not None and L.get(y) is not None else None
        out['해결 화음 − 화면 전환(초)'] = dd2('veil', 'resolve'); out['해결 화음 − 착지(초)'] = dd2('land', 'resolve')
        if ride == 'whirl':
            d = lambda x, y: round(L[y] - L[x], 2) if L.get(x) is not None and L.get(y) is not None else None
            out['닿아서 구름까지(초)'] = d('touch', 'cloud')
            out['단계 길이(초)'] = {'들림': d('lift', 'rise'), '감아올림': d('rise', 'space'), '우주': d('space', 'map'), '지도': d('map', 'orb'), '금성·덮개': d('orb', 'cloud')}
        json.dump(rec, open(os.path.join(OUT, '%s-%s-%s-raw.json' % (TAG, DEV, ride)), 'w'))
        NAME = {'come': '감쌈' if ride == 'whirl' else '잡음', 'grab': '감쌈' if ride == 'whirl' else '잡음', 'pull': '감쌈' if ride == 'whirl' else '잡음', 'rise': '떠오름', 'space': '우주', 'dest': '목적지', 'map': '지도', 'veil': '전환',
                'arrive': '도착', 'fall': '도착', 'hop': '도착', 'stand': '도착', 'cloud': '도착'}
        T0 = next((r[0] for r in rec if r[1] in ('come', 'grab')), rec[0][0] if rec else 0)
        tab = {}
        for r in rec:
            nm = NAME.get(r[1])
            if not nm: continue
            a2 = tab.setdefault(nm, [r[0] - T0, r[0] - T0]); a2[1] = r[0] - T0
        out['단계 시작·끝(초)'] = {k: [round(v[0], 1), round(v[1], 1)] for k, v in tab.items()}
        if ride == 'whirl':
            both = 0.0; one = 0.0
            for i in range(1, len(rec)):
                dtf = min(.1, rec[i][0] - rec[i - 1][0]); f = rec[i][11] if len(rec[i]) > 11 else 0
                if f >= 2: both += dtf
                if f >= 1: one += dtf
            out['삐삐·둥둥 둘 다 화면에(초)'] = round(both, 2); out['삐삐·둥둥 하나라도 화면에(초)'] = round(one, 2)
        out['_T0'] = T0
        R[ride] = out; SHOTS[ride] = [x for x in shots if x[1] and (STRIP or (not x[1][9] and x[1][2] > 0))]
        vid = None
    b.close()
try:
    from PIL import Image, ImageDraw, ImageFont
    fnt = ImageFont.truetype('/System/Library/Fonts/AppleSDGothicNeo.ttc', 20 if STRIP else 28)
    NM = (('meteor', '달 → 화성'), ('whirl', '화성 → 금성'))
    if STRIP:
        # 1초마다 한 장: 초(감쌈/잡음 시작 기준)마다 칸 하나, 8초씩 띠로 나눠 띠마다 두 줄(위 달 → 화성, 아래 화성 → 금성)
        HH = 300; cells = {}
        for ride, _ in NM:
            for t, r, f in SHOTS.get(ride, []):
                sec = int(t)
                if sec >= 0 and (ride, sec) not in cells: cells[(ride, sec)] = (r, f)
        mx = max([k[1] for k in cells] + [0]); W1 = None; bands = []
        for b0 in range(0, mx + 1, 8):
            rows = []
            for ride, name in NM:
                ims = []
                for sec in range(b0, b0 + 8):
                    c = cells.get((ride, sec))
                    if c:
                        r, f = c; im = Image.open(f).convert('RGB'); im = im.resize((int(im.width * HH / im.height), HH)); d = ImageDraw.Draw(im)
                        d.rectangle([0, 0, im.width, 30], fill=(40, 26, 38)); d.text((6, 3), '%d초 %s' % (sec, LBL(ride, r[1])), font=fnt, fill=(255, 240, 220))
                    else: im = Image.new('RGB', (W1 or 180, HH), (230, 222, 210))
                    W1 = W1 or im.width; ims.append(im)
                row = Image.new('RGB', (150 + sum(i.width + 4 for i in ims), HH), (247, 240, 227)); dd = ImageDraw.Draw(row); dd.text((8, HH // 2 - 12), name, font=fnt, fill=(62, 40, 52)); x = 150
                for im in ims: row.paste(im, (x, 0)); x += im.width + 4
                rows.append(row)
            band = Image.new('RGB', (max(r.width for r in rows), HH * 2 + 6), (247, 240, 227)); band.paste(rows[0], (0, 0)); band.paste(rows[1], (0, HH + 6)); bands.append(band)
        out = Image.new('RGB', (max(b.width for b in bands), sum(b.height + 24 for b in bands)), (247, 240, 227)); y = 0
        for b in bands: out.paste(b, (0, y)); y += b.height + 24
    else:
        rows = []
        for ride, name in [x for x in NM if x[0] in SHOTS]:
            L = SHOTS[ride]; pick = [L[int(i * (len(L) - 1) / 5)] for i in range(6)] if len(L) >= 6 else L; ims = []
            for t, r, f in pick:
                im = Image.open(f).convert('RGB'); im = im.resize((int(im.width * 560 / im.height), 560)); d = ImageDraw.Draw(im)
                d.rectangle([0, 0, im.width, 42], fill=(40, 26, 38)); d.text((8, 5), '%.0f초 %s %d%%' % (r[0] - R[ride]['_T0'], LBL(ride, r[1]), round(r[2] * 100)), font=fnt, fill=(255, 240, 220)); ims.append(im)
            row = Image.new('RGB', (sum(i.width for i in ims) + 250, 560), (247, 240, 227)); dd = ImageDraw.Draw(row)
            dd.text((10, 260), name, font=fnt, fill=(62, 40, 52)); x = 250
            for im in ims: row.paste(im, (x, 0)); x += im.width
            rows.append(row)
        out = Image.new('RGB', (max(r.width for r in rows), 570 * len(rows)), (247, 240, 227)); y = 0
        for r in rows: out.paste(r, (0, y)); y += 570
    out.save(os.path.join(OUT, '%s-%s-compare.jpg' % (TAG, DEV)), quality=85); R['비교 그림'] = 'docs/compare/travel/%s-%s-compare.jpg' % (TAG, DEV)
except Exception as e: R['그림 오류'] = str(e)
for ride in SHOTS:
    for x in SHOTS[ride]:
        pass
for f in os.listdir(OUT):
    if f.startswith('%s-%s-' % (TAG, DEV)) and (f.endswith('.png') or f.endswith('.jpg')) and 'compare' not in f: os.remove(os.path.join(OUT, f))
json.dump(R, open(os.path.join(OUT, '%s-%s.json' % (TAG, DEV)), 'w'), ensure_ascii=False, indent=1); print(json.dumps(R, ensure_ascii=False))
