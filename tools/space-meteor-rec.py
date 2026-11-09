# -*- coding: utf-8 -*-
"""무한 우주 별똥별 꼬리 타기(달 → 화성) 녹화·확인 (2026-11-09, js/zones/space/meteor-ride.js) — 촬영 서버(8000)가 떠 있을 때 저장소 루트에서:
   python3 tools/space-meteor-rec.py [--phone] [--rotate] [--angles] [--tag 이름] [--out docs/compare/space-meteor]
   회색 정원(미션·둥실 뛰기·높은 바위는 받은 걸로)에서 출구로 걸어 들어감 → STAGE 1 완료 카드 → 별똥별 → 비행 → 화성 착지까지.
   기본: 연출 전체를 게임 카메라 그대로 녹화(<tag>-<pc|phone>[-rotate].mp4). --rotate: 비행 중 화면을 두 번 끌어 카메라를 돌림(손을 떼면 기본 각도로 돌아오는지).
   --angles: 잡는 순간·당겨 늘어난 순간·비행 중·화성에서 내려오는 중을 게임을 멈추고 옆·앞·뒤에서 찍음 + 손과 꼬리 끝 거리, 꼬리와 탈(머리) 사이 거리.
   결과 JSON: 오류, 단계 시각, 그리기(드로우콜·삼각형 — 비행·착지 동안 최대·평균), 손-꼬리 거리, 꼬리-탈 거리, 착지 뒤 조작·UI. 소리 끔, 끝나면 닫음."""
import json, os, sys, re, glob, shutil, subprocess, time
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
a = sys.argv[1:]; PHONE = '--phone' in a; ROT = '--rotate' in a; ANG = '--angles' in a
TAG = a[a.index('--tag') + 1] if '--tag' in a else 'run'
OUT = os.path.join(ROOT, a[a.index('--out') + 1] if '--out' in a else 'docs/compare/space-meteor'); os.makedirs(OUT, exist_ok=True)
dev = ('phone' if PHONE else 'pc') + ('-rotate' if ROT else '') + ('-angles' if ANG else ''); R = {'tag': TAG, 'dev': dev}
# 잘림 기록(매 프레임): 사진 모드와 같은 몸 범위(탈 꼭대기·발끝 등 뼈 공)를 화면에 비춰, 화면 밖으로 1% 넘게 나간 프레임 — 먼지구름이 덮은 동안은 뺌
CLIPLOG = """(()=>{window.__clip=[];const L=()=>{try{const Z=wlZone.cur,r=Z.ride?Z.ride():null,ar=Z.arrival?Z.arrival():null,o=r&&!r.state.end?r:ar&&!ar.state.done?ar:null;
  const v=document.getElementById('wlDustVeil'),vo=v?+v.style.opacity:0;
  if(o&&wlPhoto&&wlPhoto.body){const B=wlPhoto.body(wlGame.view.camera),q=B.rect,m=.015,out=Math.max(m-q[0]-m*2,m-q[1]-m*2,q[2]-1-m,q[3]-1-m,0);
    const ph=(r&&o===r?'r:':'a:')+o.state.phase;const cm=wlGame.view.camera,W=wlGame.mission.hero();__clip.push([+o.state.t.toFixed(2),ph,+out.toFixed(3),vo>.5?1:0,q.map(x=>+x.toFixed(3)),+(cm.position.y-W.position.y).toFixed(2)]);}}catch(e){}requestAnimationFrame(L);};requestAnimationFrame(L);})()"""
MEAS = """(()=>{const Z=wlZone.cur,W=wlGame.mission.hero(),r=Z.ride?Z.ride():null,ar=Z.arrival?Z.arrival():null,o=r||ar;if(!o||!o.state.endP)return null;
  const V=W.position.constructor,hr=new V(),hl=new V(),hd=new V();W.updateMatrixWorld(true);W.getObjectByName('forearm.R').localToWorld(hr.set(0,-.19,.03));W.getObjectByName('forearm.L').localToWorld(hl.set(0,-.19,.03));
  W.getObjectByName('head').getWorldPosition(hd);const e=o.state.endP,g=(r?r.meteor:null);let minHood=1e9;
  if(g){const p=g.tail.geometry.attributes.position.array,SEG=30,RAD=7;for(let i=0;i<=SEG*.75;i++){let x=0,y=0,z=0;for(let j=0;j<RAD;j++){const k=(i*RAD+j)*3;x+=p[k];y+=p[k+1];z+=p[k+2];}x/=RAD;y/=RAD;z/=RAD;
    minHood=Math.min(minHood,Math.hypot(x-hd.x,y-(hd.y+.1),z-hd.z));}}
  return {phase:o.state.phase,t:+o.state.t.toFixed(2),handR:+e.distanceTo(hr).toFixed(3),handL:+e.distanceTo(hl).toFixed(3),tailToHoodCenter:+minHood.toFixed(3)};})()"""
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio', '--autoplay-policy=no-user-gesture-required', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'])
    o = dict(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True) if PHONE else dict(viewport={'width': 1280, 'height': 720})
    vd = os.path.join(OUT, '_vid'); shutil.rmtree(vd, ignore_errors=True)
    if not ANG: o['record_video_dir'] = vd; o['record_video_size'] = dict(o['viewport'])
    c = b.new_context(**o); V0 = time.time(); pg = c.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    pg.on('console', lambda m: m.type in ('error', 'warning') and '404' not in m.text and 'AudioContext' not in m.text and errs.append(m.text[:300]))
    pg.goto('http://localhost:8000/?world=infinite-space&zone=space-garden&notitle&time=0' + ('&quality=mobile' if PHONE else '')); pg.evaluate('localStorage.clear()'); pg.reload()
    pg.wait_for_function('window.wlZone&&wlZone.cur&&wlZone.cur.spots', timeout=120000); pg.wait_for_timeout(2500)
    pg.evaluate("['have:infinite-space:necklace','space:demo','space:rock'].forEach(k=>wlGame.state.setFlag(k,true))")
    ex = pg.evaluate('wlZone.cur.spots.exit')
    pg.evaluate(CLIPLOG)
    pg.evaluate("([x,z])=>{const W=wlGame.mission.hero();W.position.x=x-3.2;W.position.z=z+.4;}", ex); pg.wait_for_timeout(1200)
    t0 = time.time() - V0; tm = {}; perf = {'비행': [], '착지': []}
    def stats():
        m = re.search(r'드로우콜 (\d+)회.*?삼각형 ([\d,]+)개', pg.evaluate("document.getElementById('stats').textContent"))
        return (int(m.group(1)), int(m.group(2).replace(',', ''))) if m else None
    cdp = c.new_cdp_session(pg) if PHONE else None
    def drag(dx, dy=0, n=16):  # 진짜 입력으로 끌기(컴퓨터 마우스 · 휴대폰 손가락 — CDP 터치)
        W, H = o['viewport']['width'], o['viewport']['height']; x0, y0 = W * .5, H * .55
        if not PHONE:
            pg.mouse.move(x0, y0); pg.mouse.down()
            for i in range(1, n + 1): pg.mouse.move(x0 + dx * i / n, y0 + dy * i / n); pg.wait_for_timeout(25)
            pg.mouse.up(); return
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x0, 'y': y0}]})
        for i in range(1, n + 1): cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': x0 + dx * i / n, 'y': y0 + dy * i / n}]}); pg.wait_for_timeout(25)
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
    yawlog = []
    pg.evaluate("([x,z])=>wlGame.mission.hero().userData.walkTo(x,z)", ex)
    shots = []; meas = []; ang = 0
    def freeze_shots(name):
        pg.evaluate('window.wlTimeScale=1e-6'); pg.wait_for_timeout(250); m = pg.evaluate(MEAS); meas.append({'순간': name, **(m or {})})
        for an, yaw, pitch, d in [('side', 1.35, .25, 3.4), ('front', .2, .15, 3.6), ('back', 3.0, .3, 3.8)]:
            pg.evaluate("""([yaw,pitch,d])=>{const W=wlGame.mission.hero(),C=wlGame.view.camera,P=W.position,r=W.rotation.y+yaw,ty=P.y+1.35;
              C.position.set(P.x+Math.sin(r)*Math.cos(pitch)*d,ty+Math.sin(pitch)*d,P.z+Math.cos(r)*Math.cos(pitch)*d);C.lookAt(P.x,ty,P.z);}""", [yaw, pitch, d])
            pg.wait_for_timeout(200); f = os.path.join(OUT, f'{TAG}-{dev}-{name}-{an}.png'); pg.screenshot(path=f); shots.append(os.path.relpath(f, ROOT))
        pg.evaluate('window.wlTimeScale=1'); pg.wait_for_timeout(60)
    done = {}; rot = 0
    for i in range(900):
        pg.wait_for_timeout(100)
        s = pg.evaluate("(()=>{const Z=wlZone.cur,r=Z.ride?Z.ride():null,ar=Z.arrival?Z.arrival():null;return {z:Z.name,rp:r&&r.state.phase,rt:r&&r.state.t,ap:ar&&ar.state.phase,at:ar&&ar.state.t,ad:ar&&ar.state.done};})()")
        if s['rp'] and 'come' not in tm: tm['come'] = round(time.time() - V0 - t0, 2)
        if s['rp'] == 'fly' and 'fly' not in tm: tm['fly'] = round(time.time() - V0 - t0, 2)
        if s['ap'] and 'mars' not in tm: tm['mars'] = round(time.time() - V0 - t0, 2)
        if ANG:
            if s['rp'] == 'grab' and s['rt'] and s['rt'] > 3.05 and 'grab' not in done: done['grab'] = 1; freeze_shots('grab')
            if s['rp'] == 'pull' and s['rt'] and s['rt'] > 3.6 and 'pull' not in done: done['pull'] = 1; freeze_shots('pull')
            if s['rp'] == 'fly' and s['rt'] and s['rt'] > 7.5 and 'fly' not in done: done['fly'] = 1; freeze_shots('fly')
            if s['ap'] == 'down' and s['at'] and s['at'] > 1.2 and 'mars' not in done: done['mars'] = 1; freeze_shots('mars-down')
        if s['rp'] == 'fly' and i % 5 == 0:
            st = stats(); st and perf['비행'].append(st)
        if s['ap'] and i % 5 == 0:
            st = stats(); st and perf['착지'].append(st)
        if ROT and s['rp'] == 'fly' and s['rt']:
            if rot == 0 and s['rt'] > 6: rot = 1; drag(320, -60)
            elif rot == 1 and s['rt'] > 11: rot = 2; drag(-420, 40)
            if i % 3 == 0: yawlog.append(pg.evaluate("(()=>{const C=wlGame.controls.input.cam,r=wlZone.cur.ride(),st=r.state,u=Math.min(1,(st.t-st.liftT)/13),f=Math.min(1,Math.max(0,u/.12));const want=st.face+1.15+(Math.PI+.4-1.15)*(f*f*(3-2*f));let d=want-C.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));return [+st.t.toFixed(2),+Math.abs(d).toFixed(3)];})()"))
        if s['ad']: break
    pg.wait_for_timeout(1500)
    R['단계 시각(초, 출구로 걷기 시작부터)'] = tm
    R['착지 뒤 조작 풀림'] = pg.evaluate("!wlGame.mission.hero().userData.riding&&!wlGame.core.blocking('meteor')")
    R['착지 뒤 화면 UI'] = pg.evaluate("wlGame.ui.hintsVisible()&&!document.getElementById('wlRideCam')")
    for k, v in perf.items():
        if v: R[f'그리기({k})'] = {'드로우콜 최대': max(x[0] for x in v), '드로우콜 평균': round(sum(x[0] for x in v) / len(v), 1), '삼각형 최대': max(x[1] for x in v)}
    if yawlog: R['카메라 기본 각도와 차이(라디안, [연출 시각, 차이])'] = yawlog
    if meas: R['손·꼬리·탈 거리(m)'] = meas
    if shots: R['사진'] = shots
    cl = pg.evaluate('window.__clip||[]'); bad = [x for x in cl if x[2] > .01 and not x[3]]
    low = [x for x in cl if x[5] < .3 and not x[3] and x[1] == 'r:fly']
    R['비행 중 카메라가 원더룹 발보다 낮은 프레임(아래에서 올려다봄 — 발바닥·가방만)'] = {'프레임': len(low), '가장 낮음(m, 카메라 − 발)': min([x[5] for x in low], default=None), '시각': [x[0] for x in low][:: max(1, len(low) // 10)][:10]}
    R['잘림(화면 밖 1% 넘는 프레임, 먼지구름 덮은 동안 뺌)'] = {'전체 프레임': len(cl), '잘린 프레임': len(bad), '구간': sorted(set(x[1] for x in bad)), '가장 많이 나감': max([x[2] for x in bad], default=0), '예(시각·단계·나감·덮임·[x0,y0,x1,y1])': bad[:: max(1, len(bad) // 12)][:12]}
    R['오류'] = errs
    c.close(); b.close()
    if not ANG:
        v = glob.glob(os.path.join(vd, '*.webm'))
        if v:
            dst = os.path.join(OUT, f'{TAG}-{dev}.mp4')
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', f'{max(0, t0 - .3):.2f}', '-i', v[0], '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '24', '-movflags', '+faststart', dst], check=True)
            R['영상'] = os.path.relpath(dst, ROOT)
        shutil.rmtree(vd, ignore_errors=True)
json.dump(R, open(os.path.join(OUT, f'{TAG}-{dev}.json'), 'w'), ensure_ascii=False, indent=1)
print(json.dumps(R, ensure_ascii=False, indent=1))
