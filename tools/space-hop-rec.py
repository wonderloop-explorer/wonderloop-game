# -*- coding: utf-8 -*-
"""행성 사이 이동(공통 틀 — 반짝이 리본 비행 → 지도 → 구름 화면 → 반짝이 착지)을 구간마다 녹화 (2026-11-26) — 촬영 서버(8000)가 떠 있을 때 저장소 루트에서:
   python3 tools/space-hop-rec.py --leg moon|mars|venus|saturn|pick:<구역 id>[@<여는 구역>] [--pc] [--out docs/compare/space-hop] [--novideo]
   moon 달 → 화성(출구) · mars 화성 → 금성(화산 꼭대기 큰 회오리 → 리본) · venus 금성 → 토성(거꾸리 배웅 → 리본) · saturn 토성 → 목성(붉은 빛 → 리본) ·
   pick:space-venus 지도에서 골라 갈 때의 공통 전환(window.wlHop — 구름 화면 → 반짝이 착지만).
   결과: <out>/<pc|phone>-<leg>.mp4, 1.3초마다 찍은 장면 모음 <…>-sheet.jpg, 오류·이동 기록. 소리 끔, 끝나면 닫음(헤드리스는 실제보다 느릴 수 있음)."""
import sys, os, json, glob, shutil, time, subprocess
from playwright.sync_api import sync_playwright
A = sys.argv[1:]; arg = lambda k, d=None: A[A.index(k) + 1] if k in A else d
PC = '--pc' in A; OUT = arg('--out', 'docs/compare/space-hop'); LEG = arg('--leg', 'moon'); os.makedirs(OUT, exist_ok=True)
VW = (1280, 632) if PC else (390, 844); TAG = ('pc' if PC else 'phone') + '-' + LEG.replace(':', '-').replace('@', '-'); W = 'infinite-space'
N = lambda *k: ['%s' % x if ':' in x and not x.startswith(('have', 'secret', 'meet', 'item')) else x.replace(':', ':%s:' % W, 1) for x in k]
FL = {'moon': N('have:necklace', 'space:demo', 'space:rock', 'secret:icecave', 'moon:bgm-intro'),
      'mars': N('have:necklace', 'mars:met', 'mars:call', 'mars:recA', 'mars:recB', 'mars:told', 'clear:space-mars', 'item:bluesunset-glass', 'meet:pipi', 'meet:dungdung', 'secret:marssound', 'secret:bluesunset', 'secret:volcano', 'mars:flag', 'mars:bgm-intro'),
      'venus': N('have:necklace', 'venus:met', 'venus:ask', 'venus:c1', 'venus:c2', 'venus:c3', 'venus:ddo', 'secret:venusday', 'venus:town', 'venus:sheep', 'venus:sunrise', 'venus:plaza', 'secret:venussun', 'venus:gate', 'clear:space-venus', 'meet:geokkuri', 'meet:ddo', 'meet:munge', 'secret:venusair'),
      'saturn': N('have:necklace', 'rest:met', 'rest:toss', 'rest:sat', 'secret:saturnfloat', 'clear:space-saturn')}
ZONE = {'moon': 'space-garden', 'mars': 'space-mars', 'venus': 'space-venus', 'saturn': 'space-saturn'}; NEXT = {'moon': 'space-mars', 'mars': 'space-venus', 'venus': 'space-saturn', 'saturn': 'space-jupiter'}
pick = LEG.startswith('pick:'); to = LEG[5:].split('@')[0] if pick else NEXT[LEG]; zone = (LEG.split('@')[1] if '@' in LEG else 'space-garden') if pick else ZONE[LEG]
READY = 'window.wlZone&&wlZone.cur&&window.wlGame&&wlGame.mission.hero()'
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal']); kw = dict(viewport={'width': VW[0], 'height': VW[1]}, device_scale_factor=2, has_touch=not PC, is_mobile=not PC)
    if '--novideo' not in A: kw.update(record_video_dir=OUT + '/_v', record_video_size={'width': VW[0], 'height': VW[1]})
    cx = b.new_context(**kw); pg = cx.new_page(); tV = time.time(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:300])); pg.on('console', lambda m: errs.append(m.text[:300]) if m.type == 'error' and '404' not in m.text and 'Failed to load' not in m.text else None)
    url = 'http://localhost:8000/?world=%s&zone=%s&notitle&quality=%s' % (W, zone, 'high' if PC else 'mobile')
    pg.goto(url, wait_until='domcontentloaded'); pg.evaluate('localStorage.clear();localStorage.setItem("wl-help-seen","1")'); pg.reload(wait_until='domcontentloaded'); pg.wait_for_function(READY, timeout=120000); pg.wait_for_timeout(800)
    fl = sum(FL.values(), []) if pick else FL[LEG]
    pg.evaluate("([fl,mars])=>{for(const k of fl)wlGame.state.setFlag(k,true);if(mars)wlGame.state.saveAfter('space-mars',{time:1,flag:true});}", [fl, pick or LEG == 'mars']); pg.reload(wait_until='domcontentloaded'); pg.wait_for_function(READY, timeout=120000); pg.wait_for_timeout(3000)
    st = lambda: pg.evaluate('wlZone.cur.state?wlZone.cur.state():{}'); hero = "wlGame.mission.hero()"
    if pick: pg.evaluate("z=>{window.wlHop(z)}", to)
    elif LEG == 'moon':
        ex = pg.evaluate('wlZone.cur.spots.exit'); pg.evaluate("([x,z])=>{const W=%s;W.position.x=x-3.2;W.position.z=z+.4;}" % hero, ex); pg.wait_for_timeout(1000); pg.evaluate("([x,z])=>%s.userData.walkTo(x,z)" % hero, ex)
    elif LEG == 'mars':
        for _ in range(60):
            s0 = st()
            if s0.get('ride') or s0.get('summit'): break
            w = s0['secretWhirl']; pg.evaluate("([x,z])=>{const W=%s,P=W.position;if(Math.hypot(P.x-x,P.z-z)>6){P.x=x+3.5;P.z=z+1;}W.userData.walkTo(x,z)}" % hero, w); pg.wait_for_timeout(400)
        for _ in range(200):
            s0 = st()
            if s0.get('summit') and not s0.get('ride'): break
            pg.wait_for_timeout(250)
        pg.wait_for_timeout(1800); pg.evaluate("([x,z])=>%s.userData.walkTo(x,z)" % hero, pg.evaluate('wlZone.cur.spots.bigTop'))
    elif LEG == 'venus': pg.evaluate('wlZone.cur.dbgSail()')
    elif LEG == 'saturn': pg.wait_for_timeout(1500); pg.evaluate('wlZone.cur.dbgStorm()')
    tS = time.time(); shots = []; k = 0; arrived = None; os.makedirs(OUT + '/_s', exist_ok=True)
    while time.time() - tS < 75:
        f = '%s/_s/%s-%03d.png' % (OUT, TAG, k); pg.screenshot(path=f); shots.append(f); k += 1
        on = pg.evaluate("wlZone.cur&&wlZone.cur.root.name")
        if on == 'zone:' + to and arrived is None: arrived = time.time()
        if arrived and time.time() - arrived > 8.5: break
        pg.wait_for_timeout(1050)
    info = pg.evaluate("(()=>{const W=%s,U=W.userData;return {zone:wlZone.cur.root.name,riding:!!U.riding,y:+W.position.y.toFixed(2),blocked:!!(wlGame.core.blocked&&wlGame.core.blocked()),hints:wlGame.ui.hintsVisible&&wlGame.ui.hintsVisible(),log:wlGame.travel.log&&wlGame.travel.log()}})()" % hero)
    print(json.dumps({'구간': LEG, '크기': '%dx%d' % VW, '도착까지(초 — 벽시계)': round(arrived - tS, 1) if arrived else None, '끝 상태': info, '오류': errs[:6]}, ensure_ascii=False, indent=1)[:2400])
    cx.close(); b.close()
    cols = 8 if PC else 12; sel = shots[:cols * 5]
    if sel:
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-pattern_type', 'glob', '-i', '%s/_s/%s-*.png' % (OUT, TAG), '-vf', 'scale=%d:-1,tile=%dx%d' % (320 if PC else 200, cols, (len(shots) + cols - 1) // cols), '-frames:v', '1', '-q:v', '3', '%s/%s-sheet.jpg' % (OUT, TAG)], check=False)
    for f in glob.glob(OUT + '/_v/*.webm'): subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', '%.1f' % max(0, tS - tV - 1.5), '-i', f, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '25', '-movflags', '+faststart', '%s/%s.mp4' % (OUT, TAG)], check=True)
    shutil.rmtree(OUT + '/_v', ignore_errors=True); shutil.rmtree(OUT + '/_s', ignore_errors=True)
