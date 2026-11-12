# -*- coding: utf-8 -*-
"""대화 전·중·후 배경음 크기 재기 + 소리 포함 녹화 (2026-11-13) — 서버가 떠 있을 때 저장소 루트에서:
     python3 tools/duck-rec.py <1|2> [--phone] [--port 8000] [--tag 이름] [--ref]
   STAGE 1(회색 정원 — 보름 할아버지)·STAGE 2(화성 — 삐삐)를 열어 배경음이 도는 동안: 6초 그대로 → 주민에게 말 걸어 끝까지(줄마다 2.2초 읽고 넘김)
   → 0.8초 뒤 한 번 더 말 걸기(짧게 이어지는 대화 — 그 사이 배경음이 올라오면 안 됨) → 끝나고 8초.
   재는 것: (1) 배경음 묶음 값(game/sound duckState — 0.1초마다, 정확한 값) (2) 배경음만 녹음한 소리(sound.tap('bed'))의 구간 크기(RMS dB — 곡 자체가 오르내려 ±1dB쯤 흔들림)
   (3) 전체 소리 녹음(예전 코드도 같은 자로 — duckState·tap('bed')가 없으면 이것만).
   --ref: 같은 시간표로 말은 걸지 않고 녹음(먼저 돌린 결과 JSON의 시각을 씀) → 같은 구간 크기를 재서 '기준과의 차이'(곡 자체의 오르내림을 뺀 값)를 그 JSON에 더함.
   결과 docs/compare/duck/<tag>-s<1|2>-<pc|phone>.json · -sound.webm(화면+전체 소리) · -bed.wav. 스피커로는 안 냄, 끝나면 닫음."""
import base64, json, math, os, shutil, struct, subprocess, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
a = sys.argv[1:]; STG = a[0] if a and a[0] in ('1', '2') else '1'; PHONE = '--phone' in a
REF = '--ref' in a; PORT = a[a.index('--port') + 1] if '--port' in a else '8000'; TAG = a[a.index('--tag') + 1] if '--tag' in a else 'after'
OUT = os.path.join(ROOT, 'docs/compare/duck'); os.makedirs(OUT, exist_ok=True); pre = '%s-s%s-%s' % (TAG, STG, 'phone' if PHONE else 'pc')
REC = """async ()=>{const S=wlGame.sound,mk=s=>{const mr=new MediaRecorder(s,{mimeType:'audio/webm'}),o={mr,ch:[]};mr.ondataavailable=e=>o.ch.push(e.data);mr.start(500);return o;};
  window.__r={full:mk(S.tap()),bed:null,t0:performance.now(),log:[]};try{if(S.duckState){const b=S.tap('bed');if(b)__r.bed=mk(b);}}catch(e){}
  __r.iv=setInterval(()=>{const d=S.duckState?S.duckState():null;__r.log.push([+((performance.now()-__r.t0)/1000).toFixed(2),d?d.bus:null,d?d.st:null,wlGame.dialog.talking()?1:0]);},100);return !!__r.bed;}"""
STOP = """async ()=>{clearInterval(__r.iv);const fin=async o=>{if(!o)return null;await new Promise(r=>{o.mr.onstop=r;o.mr.stop();});const u=new Uint8Array(await new Blob(o.ch).arrayBuffer());let s='';for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return btoa(s);};
  return {full:await fin(__r.full),bed:await fin(__r.bed),log:__r.log};}"""
NOW = "()=>+((performance.now()-__r.t0)/1000).toFixed(2)"


def rms_db(wav, t0, t1):
    """f32 mono 22050 파일에서 구간 RMS(dB)"""
    sr = 22050; n0 = int(max(0, t0) * sr); n1 = int(t1 * sr)
    with open(wav, 'rb') as f:
        f.seek(n0 * 4); b = f.read(max(0, n1 - n0) * 4)
    n = len(b) // 4
    if n < 100: return None
    v = struct.unpack('<%df' % n, b[:n * 4]); return round(10 * math.log10(sum(x * x for x in v) / n + 1e-12), 1)


with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio', '--autoplay-policy=no-user-gesture-required', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'])
    o = dict(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True) if PHONE else dict(viewport={'width': 1280, 'height': 720})
    c = b.new_context(**o, record_video_dir=os.path.join(OUT, 'vid-' + pre), record_video_size=o['viewport']); pg = c.new_page()
    zone = 'space-garden' if STG == '1' else 'space-mars'
    U = 'http://localhost:%s/?world=infinite-space&zone=%s&notitle&weather=starlight' % (PORT, zone) + ('&quality=mobile' if PHONE else '')
    pg.goto(U); pg.wait_for_function('window.wlGame&&wlGame.state', timeout=120000); pg.wait_for_timeout(1500)
    fl = ['moon:bgm-intro', 'mars:bgm-intro'] + (['have:infinite-space:necklace', 'mars:met'] if STG == '2' else [])
    pg.evaluate("f=>{localStorage.clear();localStorage.setItem('wl-help-seen','1');f.forEach(k=>wlGame.state.setFlag(k,true));}", fl); pg.reload()
    pg.wait_for_function('window.wlZone&&wlZone.cur&&wlZone.cur.spots', timeout=120000); pg.wait_for_timeout(600)
    W, H = o['viewport']['width'], o['viewport']['height']; (pg.touchscreen.tap(W * .5, H * .4) if PHONE else pg.mouse.click(W * .5, H * .4)); pg.wait_for_timeout(5000)  # 소리 깨우고 배경음이 다 올라올 때까지
    # 말 걸 주민 옆으로(걸어가는 대신 옮김 — 소리만 재는 시험)
    if STG == '1': pg.evaluate("""()=>{const G=wlGame,n=G.dialog.npcList().find(x=>x.root&&x.lines)||G.dialog.npcList()[0],W=G.mission.hero(),p=n.root.position;W.position.x=p.x+1.6;W.position.z=p.z+.4;if(W.userData.stopWalk)W.userData.stopWalk();window.__n=n;}""")
    else:  # 화성: 들어올 때 나오는 대사가 끝나 배경음이 원래 크기로 돌아올 때까지 기다림(이야기 장면 대사 say로 잼 — 화성 장면이 쓰는 길)
        pg.wait_for_function("()=>{const S=wlGame.sound;if(!S.duckState)return performance.now()>20000;const d=S.duckState();if(d.st!=='up'){window.__up=0;return false;}window.__up=window.__up||performance.now();return performance.now()-window.__up>3000;}", timeout=90000, polling=200)
    pg.wait_for_timeout(1500); hasBed = pg.evaluate(REC); ev = {}
    pg.wait_for_timeout(6000)

    def talk(tag, limit=40):
        if STG == '2':
            L = ['어? 너도 우리랑 똑같이 생겼네! 새로 이사 왔어?', '나는 삐삐야. 내 언덕에 가자!'] if tag.startswith('대화1') else ['둥둥이가 저기 보여!']
            ev[tag + '시작'] = pg.evaluate(NOW); pg.evaluate("async L=>{for(const t of L){wlGame.sound.sfx('voice-mumble',{low:false,sec:1.6});await wlGame.dialog.say('삐삐',t,3);}}", L); ev[tag + '끝'] = pg.evaluate(NOW); return
        ev[tag + '시작'] = pg.evaluate(NOW); pg.evaluate("()=>wlGame.dialog.startTalk(__n)"); pg.wait_for_timeout(400)
        for _ in range(limit):
            if not pg.evaluate("()=>wlGame.dialog.talking()||!!document.querySelector('#wlDlg')&&getComputedStyle(document.querySelector('#wlDlg')).display==='block'"): break
            pg.wait_for_timeout(2200); pg.keyboard.press('e'); pg.wait_for_timeout(300)
        ev[tag + '끝'] = pg.evaluate(NOW)
    if REF:
        J = json.load(open(os.path.join(OUT, pre + '.json'))); ev = J['시각(초)']; pg.wait_for_timeout(int((J['길이'] - 6) * 1000))
    else:
      talk('대화1 '); pg.wait_for_timeout(800)
    # 소개 카드 같은 창이 뜨면 닫음
      pg.keyboard.press('Escape'); pg.wait_for_timeout(100)
      talk('대화2 '); pg.wait_for_timeout(8000)
    r = pg.evaluate(STOP); vid = pg.video.path(); c.close(); b.close()

af = os.path.join(OUT, pre + '-full.webm'); open(af, 'wb').write(base64.b64decode(r['full'])); vf = os.path.join(OUT, pre + '-video.webm'); shutil.move(vid, vf); shutil.rmtree(os.path.join(OUT, 'vid-' + pre), ignore_errors=True)
log = r['log']; T = J['길이'] if REF else log[-1][0]
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-sseof', '-%.1f' % (T + .3), '-i', vf, '-i', af, '-c:v', 'copy', '-c:a', 'libopus', '-shortest', os.path.join(OUT, pre + ('-ref' if REF else '') + '-sound.webm')]); os.remove(vf)
raw = {}
for k in ('full', 'bed'):
    if not r.get(k): continue
    src = os.path.join(OUT, pre + '-%s.webm' % k)
    if k == 'bed': open(src, 'wb').write(base64.b64decode(r[k]))
    raw[k] = os.path.join(OUT, pre + '-%s.f32' % k); subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-ac', '1', '-ar', '22050', '-f', 'f32le', raw[k]])
    if k == 'bed' and not REF: subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, os.path.join(OUT, pre + '-bed.wav')])
    os.remove(src)
s1, e1, s2, e2 = ev['대화1 시작'], ev['대화1 끝'], ev['대화2 시작'], ev['대화2 끝']
bus = lambda t0, t1: [x[1] for x in log if t0 <= x[0] <= t1 and x[1] is not None]
R = {'길이': T, '단계': STG, '화면': 'phone' if PHONE else 'pc', '시각(초)': ev, '묶음 값': None, '구간 크기(dB)': {}}
if hasBed and not REF:
    pre_v, mid = bus(1, s1 - .2), bus(s1 + 1.5, e1 - .2); gap = bus(e1, s2); post = bus(e2 + 5.5, T)
    rise = [x for x in log if x[0] > e2 and x[2] == 'rise']; up = [x for x in log if x[0] > e2 and x[2] == 'up']
    R['묶음 값'] = {'대화 전': pre_v[-1] if pre_v else None, '대화 중(가장 큼)': max(mid) if mid else None, '대화 사이(가장 큼)': max(gap) if gap else None, '대화 후': post[-1] if post else None,
                 '전후 차이': round(post[-1] - pre_v[-1], 4) if post and pre_v else None, '되돌리기 시작(대화 끝 뒤 초)': round(rise[0][0] - e2, 2) if rise else None,
                 '되돌리는 시간(초)': round(up[0][0] - rise[0][0], 2) if rise and up else None,
                 '되돌아오는 곡선': [[round(x[0] - e2, 1), x[1]] for x in log if e2 <= x[0] <= e2 + 4.2][::3]}
for k in raw:
    R['구간 크기(dB)'][k] = {'대화 전(4초)': rms_db(raw[k], s1 - 4.2, s1 - .2), '대화 중': rms_db(raw[k], s1 + 1.5, e1 - .2), '대화 후(4초)': rms_db(raw[k], T - 4.2, T - .2)}
    os.remove(raw[k])
if REF:
    D = {k: {w: (round(J['구간 크기(dB)'][k][w] - R['구간 크기(dB)'][k][w], 1) if k in J['구간 크기(dB)'] and R['구간 크기(dB)'][k][w] is not None else None) for w in R['구간 크기(dB)'][k]} for k in R['구간 크기(dB)']}
    J['기준(말 안 걸었을 때) 구간 크기(dB)'] = R['구간 크기(dB)']; J['기준과의 차이(dB)'] = D; R = J
json.dump(R, open(os.path.join(OUT, pre + '.json'), 'w'), ensure_ascii=False, indent=1); print(json.dumps({k: v for k, v in R.items() if k != '묶음 값' or not REF}, ensure_ascii=False))
