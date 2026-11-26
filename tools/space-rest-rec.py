# -*- coding: utf-8 -*-
"""토성 쉬기 장면을 처음부터 끝까지 소리와 함께 녹화 (2026-11-26) — 촬영 서버(8000)가 떠 있을 때 저장소 루트에서:
   python3 tools/space-rest-rec.py [--phone] [--out docs/compare/space-rest-rec]
   결과: <out>/<pc|phone>-rest.mp4(화면 + 게임 소리 — sound.tap()을 MediaRecorder로 받아 합침), 나레이션 시작 초·목소리 기록·배경음 줄임 값(1초마다)·달 구간 사진(해). 스피커로는 소리 안 남, 끝나면 닫음."""
import sys, os, json, glob, shutil, base64, subprocess, time
from playwright.sync_api import sync_playwright
A = sys.argv[1:]; PHONE = '--phone' in A; OUT = A[A.index('--out') + 1] if '--out' in A else 'docs/compare/space-rest-rec'; os.makedirs(OUT, exist_ok=True)
VW = (390, 844) if PHONE else (1280, 632); TAG = 'phone' if PHONE else 'pc'; W = 'infinite-space'
READY = 'window.wlZone&&wlZone.cur&&window.wlGame&&wlGame.mission.hero()'
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio', '--autoplay-policy=no-user-gesture-required', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'])
    cx = b.new_context(viewport={'width': VW[0], 'height': VW[1]}, device_scale_factor=2, has_touch=PHONE, is_mobile=PHONE, record_video_dir=OUT + '/_v', record_video_size={'width': VW[0], 'height': VW[1]}); pg = cx.new_page(); tv = time.time(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text[:300]) if m.type == 'error' and '404' not in m.text and 'Failed to load' not in m.text else None)
    url = 'http://localhost:8000/?world=%s&zone=space-saturn&notitle&quality=%s' % (W, 'mobile' if PHONE else 'high')
    pg.goto(url, wait_until='domcontentloaded'); pg.evaluate('localStorage.clear();localStorage.setItem("wl-help-seen","1")'); pg.reload(wait_until='domcontentloaded'); pg.wait_for_function(READY, timeout=120000); pg.wait_for_timeout(600)
    pg.evaluate("(fl)=>{for(const k of fl)wlGame.state.setFlag(k,true);}", ['have:%s:necklace' % W, 'meet:%s:geokkuri' % W, 'rest:met', 'rest:toss']); pg.reload(wait_until='domcontentloaded'); pg.wait_for_function(READY, timeout=120000)
    pg.mouse.click(VW[0] // 2, VW[1] // 3); pg.wait_for_timeout(300)
    pg.evaluate("""(()=>{const st=wlGame.sound.tap();const r=new MediaRecorder(st,{mimeType:'audio/webm;codecs=opus',audioBitsPerSecond:128000});window.__ach=[];r.ondataavailable=e=>__ach.push(e.data);r.start(500);window.__arec=r;})()"""); ta = time.time()
    pg.wait_for_function('wlZone.cur.state().rest.on', timeout=120000); t0 = time.time(); duck = []; shots = {76: 'enc', 81: 'enc2', 86.5: 'cut', 90: 'titan', 104: 'moons'}; done = set()
    while True:
        s = pg.evaluate('(()=>{const s=wlZone.cur.state(),d=wlGame.sound.duckState&&wlGame.sound.duckState();return [s.rest.on,s.rest.t,d?d.k:null,s.rest.narr]})()')
        if not s[0]: break
        duck.append([round(s[1], 1), s[2]])
        for k, n in shots.items():
            if s[1] >= k and k not in done: done.add(k); pg.screenshot(path='%s/%s-%s.png' % (OUT, TAG, n))
        narr = s[3]; pg.wait_for_timeout(1000)
        if time.time() - t0 > 400: errs.append('시간 넘김'); break
    t1 = time.time(); pg.wait_for_timeout(2500)
    vl = pg.evaluate('wlGame.sound.voiceLog?wlGame.sound.voiceLog():null')
    b64 = pg.evaluate("""new Promise(res=>{__arec.onstop=()=>{const fr=new FileReader();fr.onload=()=>res(fr.result.split(',')[1]);fr.readAsDataURL(new Blob(__ach,{type:'audio/webm'}));};__arec.stop();})""")
    cx.close(); b.close()
    aud = OUT + '/_a.webm'; open(aud, 'wb').write(base64.b64decode(b64)); v = glob.glob(OUT + '/_v/*.webm'); dst = '%s/%s-rest.mp4' % (OUT, TAG); ss0 = max(0, t0 - tv - 1.5)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', '%.2f' % ss0, '-i', v[0], '-ss', '%.2f' % max(0, ss0 - (ta - tv)), '-i', aud, '-map', '0:v', '-map', '1:a', '-t', '%.1f' % (t1 - t0 + 4), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '26', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', dst], check=True)
    os.remove(aud); shutil.rmtree(OUT + '/_v', ignore_errors=True)
    dk = [d[1] for d in duck if d[1] is not None]
    print(json.dumps({'크기': '%dx%d' % VW, '쉬기 실제 초': round(t1 - t0, 1), '나레이션 [번호, 시작 초]': narr, '배경음 줄임 값(최소·최대)': [min(dk), max(dk)] if dk else None, '배경음 줄임 [쉬기 초, 값] 일부': duck[8:40:3], '목소리 기록': vl if not isinstance(vl, list) else vl[-9:], '영상': dst, '오류': errs[:5]}, ensure_ascii=False, indent=1)[:3000])
