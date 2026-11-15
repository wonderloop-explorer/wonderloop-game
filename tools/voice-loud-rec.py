# -*- coding: utf-8 -*-
"""목소리·배경음·효과음이 게임에서 실제로 나가는 크기 재기 (2026-11-15) — 촬영 서버(8000)가 떠 있을 때 저장소 루트에서:
     python3 tools/voice-loud-rec.py [--zone space-garden|space-mars] [--tag 이름] [--quick]
   게임 소리 묶음을 따로 녹음(sound.tap 'voice'·'bed'·'sfx' → MediaRecorder)해 ffmpeg ebur128로 체감 크기(LUFS)를 잰다.
   - 목소리: 말하는 사람마다 대본 목록의 줄을 차례로 틀어 그 구간의 크기(목소리 묶음 = 스피커로 나가는 값 그대로)
   - 배경음: 평소 6초, 목소리가 나오는 동안(줄이기 40%) — 배경음 묶음 값에 전체 크기 0.85(−1.4dB)를 더한 값
   - 효과음: 자주 나는 것들을 하나씩 — 가장 큰 순간값(momentary max), 전체 크기 0.85 반영
   결과 docs/compare/voice/loud-<tag>.json. 소리 끔(스피커로는 안 나감), 끝나면 닫음."""
import base64, csv, json, os, re, subprocess, sys, collections
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); a = sys.argv[1:]
arg = lambda k, d: a[a.index(k) + 1] if k in a else d
ZONE = arg('--zone', 'space-garden'); TAG = arg('--tag', 'after'); OUT = os.path.join(ROOT, 'docs/compare/voice'); os.makedirs(OUT, exist_ok=True)
R = [r for r in csv.DictReader(open(os.path.join(ROOT, 'docs/voice/script.csv'), encoding='utf-8-sig')) if r['상태'] == '녹음 필요']
G = collections.OrderedDict()
for r in R: G.setdefault('아기 토끼' if '토끼' in r['말하는 사람'] else r['말하는 사람'], []).append([r['말하는 사람'], r.get('나레이션 글') or r['대사']])
QUICK = '--quick' in a  # 말하는 사람마다 두 줄만(효과음·배경음만 다시 잴 때)
if QUICK: G = collections.OrderedDict((k, v[:2]) for k, v in G.items())
SFX = ['talk-next', 'talk-start', 'ui-click', 'item-get', 'jump', 'land', 'step', 'mission-start', 'event-pop', 'dash']
JS = """async ([groups,sfxs])=>{const S=wlGame.sound,sleep=ms=>new Promise(r=>setTimeout(r,ms));
 const rec=(kind)=>{const st=S.tap(kind),mr=new MediaRecorder(st,{mimeType:'audio/webm;codecs=opus',audioBitsPerSecond:192000}),ch=[];mr.ondataavailable=e=>ch.push(e.data);mr.start();
   return async()=>{await new Promise(r=>{mr.onstop=r;mr.stop();});const b=new Blob(ch),u=new Uint8Array(await b.arrayBuffer());let s='';for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return btoa(s);};};
 const out={};
 {const stop=rec('bed');await sleep(7000);out.bedFull=await stop();}
 for(const [name,lines] of groups){const sv=rec('voice'),sb=name==='나레이터'?rec('bed'):null;
   for(const [who,text] of lines){const h=S.voice({text,who,kind:'dialogue'});await sleep(150);for(let i=0;i<400&&h.live();i++)await sleep(50);await sleep(120);}
   out['v:'+name]=await sv();if(sb)out.bedDuck=await sb();}
 await sleep(4500);
 for(const k of sfxs){const stop=rec('sfx');await sleep(120);S.sfx(k);await sleep(1300);out['s:'+k]=await stop();}
 out.mix={...S.MIX};out.set=S.voiceLog().set;return out;}"""
def lufs(path):
    o = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    I = re.findall(r'I:\s+(-?[\d.]+) LUFS', o); M = [float(x) for x in re.findall(r' M:\s*(-?[\d.]+)', o)]; P = re.findall(r'Peak:\s+(-?[\d.]+) dBFS', o)
    return (float(I[-1]) if I else None, max(M) if M else None, float(P[-1]) if P else None)
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio', '--autoplay-policy=no-user-gesture-required']); pg = b.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto('http://localhost:8000/?world=infinite-space&zone=%s&notitle&time=0' % ZONE); pg.wait_for_function('window.wlGame&&wlGame.state&&window.wlZone&&wlZone.cur', timeout=120000); pg.wait_for_timeout(5000)
    pg.keyboard.press('Shift'); pg.mouse.click(400, 300); pg.wait_for_timeout(9000)  # 배경음이 다 커질 때까지
    D = pg.evaluate(JS, [list(G.items()), SFX]); b.close()
RES = {'구역': ZONE, 'MIX': D.pop('mix'), '목소리 설정': D.pop('set'), '오류': errs}; OUTDB = -1.41  # 전체 크기 0.85
for k, v in D.items():
    f = os.path.join(OUT, '_tmp.webm'); open(f, 'wb').write(base64.b64decode(v)); I, M, P = lufs(f); os.remove(f)
    if k.startswith('v:'): RES.setdefault('목소리(LUFS · 최고점 dBFS)', {})[k[2:]] = [I, P]
    elif k.startswith('s:'): RES.setdefault('효과음(가장 큰 순간값 LUFS · 최고점 dBFS, 전체 크기 반영 — 아주 짧은 소리는 순간값이 안 잡힘)', {})[k[2:]] = [None if M is None or M < -60 else round(M + OUTDB, 1), None if P is None else round(P + OUTDB, 1)]
    elif k == 'bedFull': RES['배경음 평소(LUFS, 전체 크기 반영)'] = round(I + OUTDB, 1) if I is not None else None
    elif k == 'bedDuck': RES['배경음 목소리 동안(LUFS, 전체 크기 반영)'] = round(I + OUTDB, 1) if I is not None else None
json.dump(RES, open(os.path.join(OUT, 'loud-%s.json' % TAG), 'w'), ensure_ascii=False, indent=1); print(json.dumps(RES, ensure_ascii=False, indent=1))
