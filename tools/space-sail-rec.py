# -*- coding: utf-8 -*-
"""금성 → 토성 이동을 처음부터 도착까지 녹화 + 진행 값마다 장면 찍기 (2026-11-26) — 촬영 서버(8000)가 떠 있을 때 저장소 루트에서:
   python3 tools/space-sail-rec.py [--phone] [--out docs/compare/space-sail] [--novideo]
   끝낸 뒤 다시 타기(dbgSail)로 바로 시작. 결과: <out>/<pc|phone>-sail.mp4(화면 녹화 — 헤드리스는 실제보다 느릴 수 있음), <out>/<pc|phone>-u<진행>.png, 단계 시각·오류. 소리 끔, 끝나면 닫음."""
import sys, os, json, glob, shutil
from playwright.sync_api import sync_playwright
A = sys.argv[1:]; PHONE = '--phone' in A; OUT = A[A.index('--out') + 1] if '--out' in A else 'docs/compare/space-sail'; os.makedirs(OUT, exist_ok=True)
VW = (390, 844) if PHONE else (1280, 632); TAG = 'phone' if PHONE else 'pc'; W = 'infinite-space'
READY = 'window.wlZone&&wlZone.cur&&window.wlGame&&wlGame.mission.hero()'
FL = ['have:%s:necklace' % W, 'venus:met', 'venus:ask', 'venus:c1', 'venus:c2', 'venus:c3', 'venus:ddo', 'secret:%s:venusday' % W, 'venus:town', 'venus:sheep', 'venus:sunrise', 'venus:plaza', 'secret:%s:venussun' % W, 'venus:gate', 'clear:space-venus', 'meet:%s:geokkuri' % W, 'meet:%s:ddo' % W, 'meet:%s:munge' % W, 'secret:%s:venusair' % W]
US = [.02, .06, .12, .2, .3, .355, .44, .5, .56, .62, .68, .74, .8, .86, .92, .97, .995]
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal']); kw = dict(viewport={'width': VW[0], 'height': VW[1]}, device_scale_factor=2, has_touch=PHONE, is_mobile=PHONE)
    if '--novideo' not in A: kw.update(record_video_dir=OUT + '/_v', record_video_size={'width': VW[0], 'height': VW[1]})
    import time; cx = b.new_context(**kw); pg = cx.new_page(); tV = time.time(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text[:300]) if m.type == 'error' and '404' not in m.text and 'Failed to load' not in m.text else None)
    url = 'http://localhost:8000/?world=%s&zone=space-venus&notitle&quality=%s' % (W, 'mobile' if PHONE else 'high')
    pg.goto(url, wait_until='domcontentloaded'); pg.evaluate('localStorage.clear();localStorage.setItem("wl-help-seen","1")'); pg.reload(wait_until='domcontentloaded'); pg.wait_for_function(READY, timeout=120000); pg.wait_for_timeout(800)
    pg.evaluate("(fl)=>{for(const k of fl)wlGame.state.setFlag(k,true);try{['geokkuri','ddo','munge'].forEach(i=>wlGame.profile.found&&wlGame.profile.found(i));}catch(e){}}", FL); pg.reload(wait_until='domcontentloaded'); pg.wait_for_function(READY, timeout=120000); pg.wait_for_timeout(2500)
    st = lambda: pg.evaluate('wlZone.cur.state()'); pg.evaluate('wlZone.cur.dbgSail()'); tS = time.time(); marks = {}
    pg.wait_for_function('wlZone.cur.state().sailPre>.3', timeout=90000); pg.screenshot(path='%s/%s-pre.png' % (OUT, TAG)); t0 = pg.evaluate('wlGame.clock.t')
    for u in US:
        try: pg.wait_for_function('!wlZone.cur.state||wlZone.cur.state().sailU==null||wlZone.cur.state().sailU>=%s' % u, timeout=90000)
        except Exception: break
        marks[str(u)] = round(pg.evaluate('wlGame.clock.t') - t0, 2); pg.screenshot(path='%s/%s-u%s.png' % (OUT, TAG, u))
        if u == .355:
            pg.wait_for_timeout(1700); pg.screenshot(path='%s/%s-map.png' % (OUT, TAG))
    try:
        pg.wait_for_function("wlZone.cur.root.name==='zone:space-saturn'", timeout=60000); pg.wait_for_timeout(1200); pg.screenshot(path='%s/%s-arr1.png' % (OUT, TAG)); pg.wait_for_timeout(1500); pg.screenshot(path='%s/%s-arr2.png' % (OUT, TAG)); pg.wait_for_timeout(4000); pg.screenshot(path='%s/%s-arr3.png' % (OUT, TAG))
    except Exception as e: errs.append('도착 못 함 ' + str(e)[:80])
    log = pg.evaluate('wlGame.travel.log&&wlGame.travel.log()'); print(json.dumps({'크기': '%dx%d' % VW, '진행 값에 닿은 게임 초(뜨기 시작부터)': marks, '이동 기록': log, '오류': errs[:5]}, ensure_ascii=False, indent=1)[:2600])
    cx.close(); b.close()
    import subprocess
    for f in glob.glob(OUT + '/_v/*.webm'): subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', '%.1f' % max(0, tS - tV - 1), '-i', f, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '25', '-movflags', '+faststart', '%s/%s-sail.mp4' % (OUT, TAG)], check=True)
    shutil.rmtree(OUT + '/_v', ignore_errors=True)
