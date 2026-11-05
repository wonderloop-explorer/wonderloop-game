# -*- coding: utf-8 -*-
"""걷기 덜컹 시험 (2026-11-05 — 맥북 레티나에서 속도를 낮춰도 덜컹거림·뒤꿈치) — 촬영 서버(8000)가 떠 있을 때 저장소 루트에서:
   python3 tools/walk-smooth-test.py [--out docs/compare/walk-smooth] [--walk 2.0] [--mobile] [--noshots]
   견본 야외 구역(sample-outdoor)에서 D 키로 걷고 매 프레임 잰다:
   - 프레임 간격(08 wlFrameLog — 그린 프레임마다 ms, 쉬는 20프레임 여부), 게임 dt
   - 엉덩이(hips 뼈) 월드 높이: 들썩임 폭(cm)과 매끈함(높이의 2차 차분 최대 — 뾰족하게 꺾이면 큼)
   - 몸 방향: 뒤로 돌기(D → A)에 걸린 시간, 한 프레임에 돈 최대 각도
   - 화면 갱신 시뮬레이션: 60Hz·120Hz(±1ms 흔들림)에서 예전 문턱(목표−2ms)과 지금 문턱(목표−갱신 반 번)의 그린 간격
   그리고 발 확대 0.25배속(wlTimeScale=.25) 영상 — 뒤·옆·약간 아래 — 과 연속 장면 시트를 <out>/에. 소리는 끄고 끝나면 닫는다."""
import json, os, sys, glob, subprocess, random
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
a = sys.argv[1:]
OUT = os.path.join(ROOT, a[a.index('--out') + 1] if '--out' in a else 'docs/compare/walk-smooth'); os.makedirs(OUT, exist_ok=True)
WALK = float(a[a.index('--walk') + 1]) if '--walk' in a else 2.0
MOBILE = '--mobile' in a
SAMPLE = r"""(sec)=>new Promise(res=>{const W=wlGame.mission.hero(),hp=W.getObjectByName('spine'),v=new W.position.constructor(),out=[];const L=wlFrameLog.log;let n0=L.n;const t0=performance.now();
  const f=()=>{if(L.n!==n0){n0=L.n;const i=(L.n-1)%240;hp.getWorldPosition(v);out.push([performance.now()-t0,L.iv[i],L.dt[i],L.idle[i],v.y,W.rotation.y,W.position.x,W.position.z,W.userData.walkAmt||0]);}
    if(performance.now()-t0<sec*1000)requestAnimationFrame(f);else res(out);};f();})"""
PLACE = "()=>{const W=wlGame.mission.hero();const sp=wlZone.cur.spawn;W.position.set(sp.x,0,sp.z+3);W.rotation.y=Math.PI;}"

def stats(v):
    if not v: return None
    m = sum(v) / len(v); sd = (sum((x - m) ** 2 for x in v) / len(v)) ** .5
    return {'평균': round(m, 2), '흔들림_표준편차': round(sd, 2), '최소': round(min(v), 2), '최대': round(max(v), 2)}

def analyse(rows):
    walk = [r for r in rows if r[8] > .98]
    iv = [r[1] for r in rows if r[1] > 0]
    ys = [r[4] for r in walk]
    d2 = [abs(ys[i + 1] - 2 * ys[i] + ys[i - 1]) for i in range(1, len(ys) - 1)]
    return {'그린_프레임': len(rows), '프레임_간격_ms': stats(iv), '쉬는_20프레임_켜진_프레임': sum(r[3] for r in rows),
            '게임_dt_ms': stats([r[2] * 1000 for r in rows]),
            '엉덩이_들썩임_폭_cm': round((max(ys) - min(ys)) * 100, 2) if ys else None,
            '엉덩이_꺾임_2차차분_최대_mm': round(max(d2) * 1000, 2) if d2 else None}

def simulate():
    """requestAnimationFrame 시각을 흉내 내 프레임 제한 규칙 비교(흔들림 ±1ms·±3ms)"""
    random.seed(1); R = {}
    for jit in (1, 3):
     for hz in (60, 120):
        vs = 1000 / hz
        for tgt in (1000 / 30, 1000 / 60):
            if tgt < vs - .1: continue
            for rule in ('예전(목표-2ms 시간 문턱)', '지금(화면 갱신 세기)'):
                last, got, prev, cnt, lastNow = 0, [], None, 0, -1e9
                N = max(1, round(tgt / vs))
                for k in range(1, 2000):
                    now = k * vs + random.uniform(-jit, jit)
                    if rule.startswith('예전'):
                        if now - lastNow < tgt - 2: continue
                        lastNow = now
                    else:
                        cnt += ((round((now - prev) / vs) if now - prev > vs * 1.6 else 1) if prev is not None else 99); prev = now
                        if cnt < N: continue
                        cnt = 0
                    if last > 0: got.append((k - last) * vs)  # 실제로 화면에 나온 갱신 번호로 간격을 잰다(타임스탬프 흔들림 말고)
                    last = k
                bins = {}
                for g in got: b = round(g / vs); bins[f'{b * vs:.1f}ms'] = bins.get(f'{b * vs:.1f}ms', 0) + 1
                R[f'{hz}Hz 흔들림±{jit}ms 목표{1000 / tgt:.0f} {rule}'] = {k: f'{v / len(got) * 100:.1f}%' for k, v in sorted(bins.items())}
    return R

R = {'화면_갱신_시뮬레이션': simulate()}
q = '&quality=mobile' if MOBILE else ''
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'])
    c = b.new_context(viewport={'width': 1280, 'height': 720}, record_video_dir=os.path.join(OUT, 'vid'), record_video_size={'width': 1280, 'height': 720})
    pg = c.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto(f'http://localhost:8000/?notitle&weather=day&zonetest&zone=sample-outdoor{q}'); pg.evaluate("localStorage.removeItem('wl-speed');localStorage.setItem('wl-help-seen','1')")
    pg.reload(); pg.wait_for_function('window.wlGame&&window.wlGait&&window.wlFrameLog&&wlGame.mission.hero()', timeout=120000); pg.wait_for_timeout(2500)
    pg.evaluate('([w])=>wlGait.SPEED.set(w,null)', [WALK])
    R['속도'] = pg.evaluate('({walk:wlGait.DRV.walk,run:wlGait.DRV.run,단계:wlFrameLog.target()})')
    # 1) 걷기 3초 (옆 카메라)
    pg.evaluate(PLACE); pg.evaluate("()=>{const W=wlGame.mission.hero();wlGame.view.hold(()=>{const P=W.position;return {from:[P.x+4.2,P.y+.55,P.z+.4],at:[P.x,P.y+.5,P.z]};});}"); pg.wait_for_timeout(2500)
    pg.keyboard.down('KeyD'); rows = pg.evaluate(SAMPLE, 3.0); pg.keyboard.up('KeyD')
    R['걷기'] = analyse(rows)
    # 2) 달리기 2초
    pg.evaluate(PLACE); pg.wait_for_timeout(1500)
    pg.keyboard.down('ShiftLeft'); pg.keyboard.down('KeyD'); rows = pg.evaluate(SAMPLE, 2.0); pg.keyboard.up('KeyD'); pg.keyboard.up('ShiftLeft')
    R['달리기'] = analyse(rows)
    # 3) 서기 1.5초 → 쉬는 20프레임은 1초 뒤부터(휴대폰 단계)
    pg.wait_for_timeout(300); rows = pg.evaluate(SAMPLE, 2.0)
    R['멈춘_뒤_2초'] = {'쉬는_20프레임_켜진_프레임': sum(r[3] for r in rows), '처음_켜진_시각_ms': next((round(r[0]) for r in rows if r[3]), None)}
    # 4) 뒤로 돌기: D로 걷다가 A
    pg.evaluate(PLACE); pg.wait_for_timeout(1200)
    pg.keyboard.down('KeyD'); pg.wait_for_timeout(900); pg.keyboard.up('KeyD'); pg.keyboard.down('KeyA'); rows = pg.evaluate(SAMPLE, 1.0); pg.keyboard.up('KeyA')
    import math
    yaw = [r[5] for r in rows]; st = [abs(math.atan2(math.sin(yaw[i] - yaw[i - 1]), math.cos(yaw[i] - yaw[i - 1]))) for i in range(1, len(yaw))]
    tot, t_done = 0, None
    for i in range(1, len(yaw)):
        tot += st[i - 1]
        if t_done is None and tot > math.pi * .97: t_done = rows[i][0]
    R['뒤로_돌기'] = {'걸린_시간_ms': round(t_done) if t_done else None, '한_프레임_최대_도': round(max(st) * 180 / math.pi, 1),
                    '도는_동안_걸음_무게_최소': round(min(r[8] for r in rows[:max(2, len(rows) // 2)]), 2)}
    # 5) 발 확대 0.25배속: 뒤·옆·약간 아래
    if '--noshots' not in a:
        pg.evaluate("()=>{const W=wlGame.mission.hero();W.userData.setOutfit('ant');if(W.userData.setHood)W.userData.setHood(1);const c=wlGame.view.camera;c.userData.fov0=c.fov;c.fov=9;c.updateProjectionMatrix();document.querySelectorAll('body > *:not(canvas)').forEach(e=>{if(!e.contains(document.querySelector('canvas')))e.style.visibility='hidden';});window.wlTimeScale=.25;}")
        for name, off in (('뒤', [-1.5, 0.12, -3.3]), ('옆', [3.6, 0.3, 0]), ('아래', [1.8, 0.05, -3.1])):
            pg.evaluate(PLACE)
            pg.evaluate("(o)=>{const W=wlGame.mission.hero();wlGame.view.hold(()=>{const P=W.position,c=Math.cos(W.rotation.y),s=Math.sin(W.rotation.y);return {from:[P.x+o[0]*c+o[2]*s,P.y+o[1],P.z-o[0]*s+o[2]*c],at:[P.x,P.y+.12,P.z]};});}", off)
            pg.wait_for_timeout(1500); pg.keyboard.down('KeyD'); pg.wait_for_timeout(1800)
            for k in range(16):
                pg.screenshot(path=os.path.join(OUT, f'_f-{name}-{k:02d}.png')); pg.wait_for_timeout(45)
            pg.wait_for_timeout(800); pg.keyboard.up('KeyD'); pg.wait_for_timeout(1200)
        pg.evaluate('window.wlTimeScale=0')
    pg.evaluate("wlGame.view.hold(null)")
    R['오류'] = errs
    c.close(); b.close()
for name in ('뒤', '옆', '아래'):
    fs = sorted(glob.glob(os.path.join(OUT, f'_f-{name}-*.png')))
    if fs:
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '1', '-i', os.path.join(OUT, f'_f-{name}-%02d.png'), '-vf', 'crop=720:560:280:80,scale=300:-1,tile=8x2', '-frames:v', '1', '-update', '1', os.path.join(OUT, f'feet-{name}-0.25x.jpg')])
        import shutil; shutil.copy(fs[5], os.path.join(OUT, f'feet-{name}-one.png'))
        for f in fs: os.remove(f)
vids = sorted(glob.glob(os.path.join(OUT, 'vid', '*.webm')), key=os.path.getmtime)
if vids:
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', vids[-1], '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '23', os.path.join(OUT, 'walk-and-feet-0.25x.mp4')])
    for v in vids: os.remove(v)
json.dump(R, open(os.path.join(OUT, 'walk-smooth.json'), 'w'), ensure_ascii=False, indent=1)
print(json.dumps(R, ensure_ascii=False, indent=1))
