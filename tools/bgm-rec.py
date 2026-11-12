# -*- coding: utf-8 -*-
"""배경음 루프 이음매 녹음 + 체감 크기 재기 (2026-11-13) — 서버가 떠 있을 때 저장소 루트에서:  python3 tools/bgm-rec.py <moon|mars|travel> [--phone] [--intro] [--sec 초]
   moon 회색 정원(되풀이 14.44~87.04초 — 이음매는 시작 약 72.6초 뒤) · mars 화성(17.97~53.72) · travel 이동 테마(화성에서 테마만 틀어 봄 13~37초).
   --intro는 처음 들어온 것처럼 도입(0초)부터. 화면 + 전체 소리(sound.tap)와, 배경음만(tap('bed'|'travel') — 전체 크기 0.85 앞)을 따로 녹음해 체감 크기(LUFS, ffmpeg ebur128)를 잰다.
   결과 docs/compare/bgm/<곡>-<pc|phone>[-intro]-sound.webm · -bed.wav · .json. 스피커로는 안 냄, 끝나면 닫음."""
import base64, json, os, re, shutil, subprocess, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
a = sys.argv[1:]; SONG = a[0]; PHONE = '--phone' in a; INTRO = '--intro' in a
CFG = {'moon': ('space-garden', 72.6, 14.44), 'mars': ('space-mars', 35.75, 17.97), 'travel': ('space-mars', 24, 0)}[SONG]
SEC = float(a[a.index('--sec') + 1]) if '--sec' in a else (CFG[1] + (CFG[2] if INTRO else 0) + 10 if SONG != 'travel' else 26)
OUT = os.path.join(ROOT, 'docs/compare/bgm'); os.makedirs(OUT, exist_ok=True); pre = SONG + ('-phone' if PHONE else '-pc') + ('-intro' if INTRO else '')
REC = """async w=>{const S=wlGame.sound,mk=s=>{const mr=new MediaRecorder(s,{mimeType:'audio/webm'}),o={mr,ch:[]};mr.ondataavailable=e=>o.ch.push(e.data);mr.start(500);return o;};window.__r={full:mk(S.tap()),bed:mk(S.tap(w))};return true;}"""
STOP = """async ()=>{const fin=async o=>{await new Promise(r=>{o.mr.onstop=r;o.mr.stop();});const u=new Uint8Array(await new Blob(o.ch).arrayBuffer());let s='';for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return btoa(s);};return {full:await fin(__r.full),bed:await fin(__r.bed)};}"""
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio', '--autoplay-policy=no-user-gesture-required', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'])
    o = dict(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True) if PHONE else dict(viewport={'width': 1280, 'height': 720})
    c = b.new_context(**o, record_video_dir=os.path.join(OUT, 'vid-' + pre), record_video_size=o['viewport']); pg = c.new_page()
    pg.goto('http://localhost:8000/?world=infinite-space&zone=%s&notitle&weather=starlight' % CFG[0] + ('&quality=mobile' if PHONE else '')); pg.wait_for_function('window.wlGame&&wlGame.state', timeout=120000); pg.wait_for_timeout(1500)
    fl = ['have:infinite-space:necklace', 'mars:met'] + ([] if INTRO else ['moon:bgm-intro', 'mars:bgm-intro'])
    pg.evaluate("f=>{localStorage.clear();localStorage.setItem('wl-help-seen','1');f.forEach(k=>wlGame.state.setFlag(k,true));}", fl); pg.reload()
    pg.wait_for_function('window.wlZone&&wlZone.cur&&wlZone.cur.spots', timeout=120000); pg.wait_for_timeout(300)
    W, H = o['viewport']['width'], o['viewport']['height']; (pg.touchscreen.tap(W * .5, H * .4) if PHONE else pg.mouse.click(W * .5, H * .4)); pg.wait_for_timeout(200)
    pg.evaluate(REC, 'travel' if SONG == 'travel' else 'bed')
    if SONG == 'travel': pg.evaluate("()=>{wlGame.travel.begin({id:'test'});}")
    pg.wait_for_timeout(int(SEC * 1000)); r = pg.evaluate(STOP); vid = pg.video.path(); c.close(); b.close()
af = os.path.join(OUT, pre + '-full.webm'); open(af, 'wb').write(base64.b64decode(r['full'])); bf = os.path.join(OUT, pre + '-bed.webm'); open(bf, 'wb').write(base64.b64decode(r['bed']))
vf = os.path.join(OUT, pre + '-video.webm'); shutil.move(vid, vf); shutil.rmtree(os.path.join(OUT, 'vid-' + pre), ignore_errors=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-sseof', '-%.1f' % (SEC + .2), '-i', vf, '-i', af, '-c:v', 'copy', '-c:a', 'libopus', '-shortest', os.path.join(OUT, pre + '-sound.webm')])
wav = os.path.join(OUT, pre + '-bed.wav'); subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', bf, wav]); os.remove(vf); os.remove(af); os.remove(bf)
# 체감 크기: 곡이 다 올라온 뒤(앞 3초 빼고)
e = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-ss', '3', '-i', wav, '-af', 'ebur128=framelog=quiet', '-f', 'null', '-'], capture_output=True, text=True).stderr
I = re.findall(r'I:\s+(-?[\d.]+) LUFS', e); R = {'곡': SONG, '화면': 'phone' if PHONE else 'pc', '도입부터': INTRO, '녹음(초)': SEC, '배경음만 체감 크기(LUFS)': float(I[-1]) if I else None}
json.dump(R, open(os.path.join(OUT, pre + '.json'), 'w'), ensure_ascii=False, indent=1); print(json.dumps(R, ensure_ascii=False))
