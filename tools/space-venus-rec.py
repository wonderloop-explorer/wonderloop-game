# -*- coding: utf-8 -*-
"""화성 → 금성 이동 연출 녹화·확인 (2026-11-12) — 서버가 떠 있을 때 저장소 루트에서:
   python3 tools/space-venus-rec.py [--phone] [--rotate] [--audio] [--port 8000]
   STAGE 2를 끝낸 상태(노을)로 화성을 열어 → 기다리는 큰 회오리에 닿음 → 감아올림 → 우주(지구·달) → 우주 지도 → 금성 구름 → 내려앉아 조작이 풀릴 때까지 녹화.
   --tap: 눌러 넘기기 시험 — 감아올림 1.5초·우주 1.2초·지도 1초 때 화면을 톡 눌러 다음 단계로(단계가 바로 넘어가는지, 해결 화음이 여전히 구름 진입에 맞는지).
   --rotate: 연출 동안 화면을 끌어 카메라를 돌림. --audio: 소리 포함(sound.tap → MediaRecorder, 영상과 합침).
   재는 것: 매 프레임 원더룹 몸(wlPhoto.body)이 화면 밖으로 1% 넘게 나간 프레임 수(구름 덮개·지도가 덮은 동안 뺌), 영상의 가장 어두운 프레임 밝기(ffmpeg signalstats),
   단계 시각, 지구가 화면에 잡힌 캡처, 금성 착지·조작 풀림, 그리기 수. 결과 docs/compare/space-venus/<pc|phone>[-rot]-….  소리 끔(--audio도 스피커로는 안 냄), 끝나면 닫음."""
import base64, json, os, re, shutil, subprocess, sys, time
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
a = sys.argv[1:]; PHONE = '--phone' in a; ROT = '--rotate' in a; TAP = '--tap' in a; AUDIO = '--audio' in a; PORT = a[a.index('--port') + 1] if '--port' in a else '8000'
OUT = os.path.join(ROOT, 'docs/compare/space-venus'); os.makedirs(OUT, exist_ok=True); pre = ('phone' if PHONE else 'pc') + ('-tap' if TAP else '') + ('-rot' if ROT else '') + '-'; R = {}; T = {}
FLAGS = ['have:infinite-space:necklace', 'mars:met', 'mars:call', 'mars:recA', 'mars:recB', 'mars:told', 'clear:space-mars', 'item:infinite-space:bluesunset-glass', 'meet:infinite-space:pipi', 'meet:infinite-space:dungdung',
         'secret:infinite-space:marssound', 'secret:infinite-space:bluesunset', 'secret:infinite-space:volcano', 'mars:flag', 'mars:bgm-intro']
CLIP = """(()=>{window.__clip=[];const L=()=>{try{const Z=wlZone.cur,G=wlGame;if(Z&&window.wlPhoto&&G.mission.hero().userData.riding){const cover=document.getElementById('wlDustVeil')||document.getElementById('wlTravelMap');
   if(!cover){const b=wlPhoto.body(G.view.camera);if(b&&b.rect){const r=b.rect,w=r[2]-r[0],h=r[3]-r[1],ix=Math.max(0,Math.min(1,r[2])-Math.max(0,r[0])),iy=Math.max(0,Math.min(1,r[3])-Math.max(0,r[1]));__clip.push([+(performance.now()/1000).toFixed(2),+(1-(ix*iy)/(w*h||1)).toFixed(3),Z.name]);}}}}catch(e){}requestAnimationFrame(L);};L();})()"""
REC = """async ()=>{const s=wlGame.sound.tap&&wlGame.sound.tap();if(!s)return false;const mr=new MediaRecorder(s,{mimeType:'audio/webm'});window.__au=[];mr.ondataavailable=e=>window.__au.push(e.data);mr.start(500);window.__mr=mr;window.__auT=performance.now();return true;}"""
STOP = """async ()=>{const mr=window.__mr;if(!mr)return null;await new Promise(r=>{mr.onstop=r;mr.stop();});const b=new Blob(window.__au,{type:'audio/webm'});const u=new Uint8Array(await b.arrayBuffer());let s='';for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return btoa(s);}"""
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio', '--autoplay-policy=no-user-gesture-required', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'])
    o = dict(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True) if PHONE else dict(viewport={'width': 1280, 'height': 720})
    c = b.new_context(**o, record_video_dir=os.path.join(OUT, 'vid-' + pre[:-1]), record_video_size=o['viewport']); V0 = time.time(); pg = c.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:300])); mark = lambda k: T.__setitem__(k, round(time.time() - V0, 1))
    U = 'http://localhost:' + PORT + '/?world=infinite-space&zone=space-mars&notitle' + ('&quality=mobile' if PHONE else '')
    pg.goto(U); pg.wait_for_function('window.wlGame&&wlGame.state', timeout=120000); pg.wait_for_timeout(1500); pg.wait_for_function('window.wlGame&&wlGame.state', timeout=120000)
    pg.evaluate("f=>{localStorage.clear();localStorage.setItem('wl-help-seen','1');f.forEach(k=>wlGame.state.setFlag(k,true));wlGame.state.saveAfter&&wlGame.state.saveAfter('space-mars',{time:1,flag:true})}", FLAGS); pg.reload()
    pg.wait_for_function('window.wlZone&&wlZone.cur&&wlZone.cur.spots&&window.wlPhoto', timeout=120000); pg.wait_for_timeout(2500); pg.evaluate(CLIP)
    W, H = o['viewport']['width'], o['viewport']['height']; pg.mouse.click(W * .5, H * .6) if not PHONE else pg.touchscreen.tap(W * .5, H * .6); pg.wait_for_timeout(800)
    shot = lambda n: pg.screenshot(path=os.path.join(OUT, pre + n + '.png')); st = lambda: pg.evaluate('wlZone.cur.state?wlZone.cur.state():{}'); zn = lambda: pg.evaluate('wlZone.cur.name')
    def stats():
        m = re.search(r'드로우콜 (\d+)회.*?삼각형 ([\d,]+)개', pg.evaluate("(document.getElementById('stats')||{}).textContent||''")); return [int(m.group(1)), int(m.group(2).replace(',', ''))] if m else None
    perf = []; R['하늘(시작)'] = st().get('sky'); R['할 일 안내'] = pg.evaluate("(document.getElementById('wlQuest')||{}).textContent||''"); shot('before')
    if AUDIO: R['소리 녹음'] = pg.evaluate(REC)
    q = pg.evaluate("(document.getElementById('wlQuest')||{}).textContent"); s = pg.evaluate('wlZone.cur.spots.sunsetWL')
    pg.evaluate("([x,z])=>{const W=wlGame.mission.hero();W.position.x=x+6;W.position.z=z+6;W.userData.walkTo(x+10,z+9)}", s); mark('출발')
    def drag():
        x, y = W * .5, H * .45
        if PHONE:
            cdp = c.new_cdp_session(pg); cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x, 'y': y}]})
            for i in range(1, 9): cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': x + i * 12, 'y': y + i * 2}]}); pg.wait_for_timeout(30)
            cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
        else:
            pg.mouse.move(x, y); pg.mouse.down(); pg.mouse.move(x + 140, y + 20, steps=8); pg.mouse.up()
    seen = set(); last = 0; taps = {}
    def poke(key, mark_name, after):
        # 눌러 넘기기: 그 단계가 시작되고 after초 뒤 한 번 톡
        if not TAP or key in taps: return
        L = pg.evaluate("(()=>{const l=wlGame.travel.log(),c=wlGame.sound.audioNow?wlGame.sound.audioNow():null;return [l['%s']??null,c]})()" % mark_name) if mark_name else None
        if mark_name and (L[0] is None or L[1] is None or L[1] - L[0] < after): return
        if not mark_name:
            if not pg.evaluate("!!document.getElementById('wlTravelMap')"): return
            taps.setdefault(key + '0', time.time())
            if time.time() - taps[key + '0'] < after: return
        (pg.touchscreen.tap(W * .5, H * .3) if PHONE else pg.mouse.click(W * .5, H * .3)); taps[key] = round(time.time() - V0, 1)
    for i in range(700):
        z = zn(); s = st() if z != '금성 구름' else {}
        if 'venus' not in seen and 'lift' in seen:
            poke('우주', 'space', 1.2) if '감아올림' in taps else None; poke('감아올림', 'rise', 1.5); poke('지도', None, 1.0)
        if s.get('big') and 'lift' not in seen: seen.add('lift'); mark('큰 회오리')
        if s.get('big') and s.get('sky', 0) > 1.2 and 'sky' not in seen: seen.add('sky'); mark('하늘이 우주로'); shot('rise-space-sky')
        if s.get('big') and 'r1' not in seen and 'lift' in seen and time.time() - V0 - T['큰 회오리'] > 4.4: seen.add('r1'); shot('rise-1'); perf.append(stats())
        if s.get('big') and 'r2' not in seen and 'lift' in seen and time.time() - V0 - T['큰 회오리'] > 6.0: seen.add('r2'); shot('rise-2')
        if s.get('big') and 'r3' not in seen and 'lift' in seen and time.time() - V0 - T['큰 회오리'] > 7.7: seen.add('r3'); shot('rise-3')
        if s.get('earth') and 'earth' not in seen: seen.add('earth'); mark('지구'); pg.wait_for_timeout(1500); shot('earth-1'); pg.wait_for_timeout(1000); shot('earth-2'); perf.append(stats())
        if pg.evaluate("!!document.getElementById('wlTravelMap')") and 'map' not in seen: seen.add('map'); mark('우주 지도'); pg.wait_for_timeout(1000 if TAP else 2600); shot('map'); poke('지도', None, 0)
        if s.get('venusOrb') and 'orb' not in seen: seen.add('orb'); mark('금성이 커짐'); pg.wait_for_timeout(900); shot('venus-orb')
        if z == '금성 구름' and 'venus' not in seen: seen.add('venus'); mark('금성 구역'); pg.wait_for_timeout(1500); shot('cloud-descend'); perf.append(stats())
        if z == '금성 구름':
            v = pg.evaluate('wlZone.cur.state()')
            if v.get('landed') and 'land' not in seen: seen.add('land'); mark('내려앉음'); pg.wait_for_timeout(1200); shot('cloud-landed')
            if v.get('arrDone'): mark('조작 풀림'); break
        if ROT and 'lift' in seen and time.time() - last > 2.2 and z != '금성 구름' and not pg.evaluate("!!document.getElementById('wlTravelMap')"): last = time.time(); drag()
        pg.wait_for_timeout(200)
    pg.wait_for_timeout(1200); shot('venus-free'); perf.append(stats())
    R['금성 착지'] = zn() == '금성 구름'; R['조작 풀림'] = pg.evaluate('!wlGame.mission.hero().userData.riding&&!wlGame.core.blocking()')
    P0 = pg.evaluate('(()=>{const P=wlGame.mission.hero().position;return [P.x,P.z]})()'); pg.keyboard.down('w'); pg.wait_for_timeout(900); pg.keyboard.up('w'); P1 = pg.evaluate('(()=>{const P=wlGame.mission.hero().position;return [P.x,P.z]})()')
    R['금성에서 걸음(m)'] = round(((P1[0]-P0[0])**2 + (P1[1]-P0[1])**2) ** .5, 2); R['화면 UI'] = pg.evaluate('wlGame.ui.hintsVisible()'); R['배경음(금성)'] = pg.evaluate("(()=>{const h=wlGame.sound.bedHandle&&wlGame.sound.bedHandle();return !!h})()")
    cl = pg.evaluate('window.__clip||[]'); R['잘림 기록 프레임'] = len(cl); bad = [x for x in cl if x[1] > .01]; R['잘린 프레임(1% 넘게)'] = len(bad); R['잘림 최대'] = max([x[1] for x in cl] or [0]); R['잘린 때'] = [bad[0][0], bad[-1][0], bad[0][2]] if bad else None; R['페이지 시각 기준'] = pg.evaluate('performance.now()/1000')
    P = [x for x in perf if x]; R['그리기'] = {'최대 드로우콜': max(x[0] for x in P), '최대 삼각형': max(x[1] for x in P)} if P else None
    R['시각(초)'] = T; R['출발부터 조작 풀림까지(초)'] = round(T.get('조작 풀림', 0) - T.get('큰 회오리', 0), 1); R['여행 기록'] = pg.evaluate('wlGame.travel.log?wlGame.travel.log():null');
    L = R['여행 기록'] or {}; d = lambda x, y: round(L[y] - L[x], 2) if L.get(x) is not None and L.get(y) is not None else None
    R['단계 길이(초, 소리 시계)'] = {'다가와 감쌈': d('touch', 'lift'), '들림(완료 카드)': d('lift', 'rise'), '감아올림': d('rise', 'space'), '우주(지구·달)': d('space', 'map'), '우주 지도': d('map', 'orb'), '금성이 커져 구름에 덮임': d('orb', 'cloud'),
                        '닿아서 구름까지': d('touch', 'cloud'), '지구가 화면에 있던 시간': L.get('earthSec'), '해결 화음 − 구름 진입': d('cloud', 'resolve'), '눌러 넘긴 때(영상 초)': {k: v for k, v in taps.items() if not k.endswith('0')} or None}; R['오류'] = errs
    au = pg.evaluate(STOP) if AUDIO else None; auT = pg.evaluate('window.__auT||0') if AUDIO else 0
    vid = pg.video.path(); c.close(); b.close()
    vf = os.path.join(OUT, pre + 'venus.webm'); shutil.move(vid, vf); shutil.rmtree(os.path.join(OUT, 'vid-' + pre[:-1]), ignore_errors=True)
    r = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(T.get('큰 회오리', 0)), '-i', vf, '-vf', 'signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-', '-f', 'null', '-'], capture_output=True, text=True)
    ys = [float(x.split('=')[1]) for x in r.stdout.split('\n') if 'YAVG' in x]; R['가장 어두운 프레임 밝기(0~255)'] = round(min(ys), 1) if ys else None; R['밝기 40 아래 프레임'] = sum(1 for y in ys if y < 40)
    if au:
        af = os.path.join(OUT, pre + 'audio.webm'); open(af, 'wb').write(base64.b64decode(au))
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', vf, '-itsoffset', str(max(0, auT / 1000)), '-i', af, '-c:v', 'copy', '-c:a', 'libopus', '-shortest', os.path.join(OUT, pre + 'venus-sound.webm')])
json.dump(R, open(os.path.join(OUT, pre + 'result.json'), 'w'), ensure_ascii=False, indent=1)
print(json.dumps(R, ensure_ascii=False, indent=1))
