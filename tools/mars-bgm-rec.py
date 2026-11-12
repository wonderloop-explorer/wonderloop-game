# -*- coding: utf-8 -*-
"""화성 배경음 루프 이음매 녹화(소리 포함) (2026-11-12) — 서버가 떠 있을 때 저장소 루트에서:  python3 tools/mars-bgm-rec.py [--phone] [--intro] [--dusk]
   화성을 열어 배경음이 도는 동안 소리(sound.tap → MediaRecorder)와 화면을 함께 녹화한다. 기본은 루프 구간(0:17.97~0:53.72)에서 시작해 이음매(시작 약 36초 뒤)를 지나 46초,
   --intro는 처음 들어온 것처럼 도입(0초)부터 60초(도입 → 루프로 넘어감 → 첫 이음매 53.7초), --dusk는 노을(조금 작게·높은 소리 덜).
   결과 docs/compare/mars-bgm/<pc|phone>[-intro][-dusk]-sound.webm + 소리만 .wav. 스피커로는 안 냄, 끝나면 닫음."""
import base64, os, shutil, subprocess, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
a = sys.argv[1:]; PHONE = '--phone' in a; INTRO = '--intro' in a; DUSK = '--dusk' in a
OUT = os.path.join(ROOT, 'docs/compare/mars-bgm'); os.makedirs(OUT, exist_ok=True); pre = ('phone' if PHONE else 'pc') + ('-intro' if INTRO else '') + ('-dusk' if DUSK else '')
REC = """async ()=>{const s=wlGame.sound.tap&&wlGame.sound.tap();if(!s)return false;const mr=new MediaRecorder(s,{mimeType:'audio/webm'});window.__au=[];mr.ondataavailable=e=>window.__au.push(e.data);mr.start(500);window.__mr=mr;return true;}"""
STOP = """async ()=>{const mr=window.__mr;await new Promise(r=>{mr.onstop=r;mr.stop();});const b=new Blob(window.__au,{type:'audio/webm'});const u=new Uint8Array(await b.arrayBuffer());let s='';for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return btoa(s);}"""
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio', '--autoplay-policy=no-user-gesture-required', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'])
    o = dict(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True) if PHONE else dict(viewport={'width': 1280, 'height': 720})
    c = b.new_context(**o, record_video_dir=os.path.join(OUT, 'vid-' + pre), record_video_size=o['viewport']); pg = c.new_page()
    U = 'http://localhost:8000/?world=infinite-space&zone=space-mars&notitle' + ('&quality=mobile' if PHONE else '')
    pg.goto(U); pg.wait_for_function('window.wlGame&&wlGame.state', timeout=120000); pg.wait_for_timeout(1500); pg.wait_for_function('window.wlGame&&wlGame.state', timeout=120000)
    fl = ['have:infinite-space:necklace', 'mars:met'] + ([] if INTRO else ['mars:bgm-intro']) + (['mars:call', 'mars:recA', 'mars:recB', 'mars:told', 'clear:space-mars'] if DUSK else [])
    pg.evaluate("([f,d])=>{localStorage.clear();localStorage.setItem('wl-help-seen','1');f.forEach(k=>wlGame.state.setFlag(k,true));if(d)wlGame.state.saveAfter('space-mars',{time:1})}", [fl, DUSK]); pg.reload()
    pg.wait_for_function('window.wlZone&&wlZone.cur&&wlZone.cur.spots', timeout=120000); pg.wait_for_timeout(600)
    W, H = o['viewport']['width'], o['viewport']['height']; (pg.touchscreen.tap(W * .5, H * .5) if PHONE else pg.mouse.click(W * .5, H * .5)); pg.wait_for_timeout(300)
    print('녹음', pg.evaluate(REC)); pg.wait_for_timeout(62000 if INTRO else 46000)
    au = pg.evaluate(STOP); vid = pg.video.path(); c.close(); b.close()
    af = os.path.join(OUT, pre + '-audio.webm'); open(af, 'wb').write(base64.b64decode(au)); vf = os.path.join(OUT, pre + '-video.webm'); shutil.move(vid, vf); shutil.rmtree(os.path.join(OUT, 'vid-' + pre), ignore_errors=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', af, os.path.join(OUT, pre + '-sound.wav')]); subprocess.run(['ffmpeg', '-v', 'error', '-y', '-sseof', '-%d' % (60 if INTRO else 44), '-i', vf, '-i', af, '-c:v', 'copy', '-c:a', 'libopus', '-shortest', os.path.join(OUT, pre + '-sound.webm')])
    os.remove(vf)
print('저장', pre)
