# -*- coding: utf-8 -*-
"""걸음 시험 (2026-11-04 — 발이 미끄러지거나 떠 보이던 문제) — 촬영 서버(8000)가 떠 있을 때 저장소 루트에서:
   python3 tools/gait-test.py [--out docs/compare/gait] [--walk 4.0 --run 6.4]
   견본 야외 구역(sample-outdoor — 트인 땅, 방 카메라 각도 제한 없음)에서 옆에서 보는 카메라로 걷기(D 키)·달리기(Shift+D)를 하며 매 프레임 발목 뼈 자리를 잰다.
   - 미끄러짐: 한 발이 땅에 붙어 있는 동안(발목 높이가 가장 낮은 높이 + 4mm 안) 그 발의 바닥 위 자리가 움직인 거리 — 디딜 때마다 최대값
   - 뜸: 디딘 발의 장화 바닥 높이(발목 뼈 - 0.082)
   - 걸음 수(초당)·이동 속도. 옆 화면 녹화(webm → mp4, 그리고 0.25배속)도 <out>/에 남긴다. 소리는 끄고(--mute-audio) 끝나면 닫는다."""
import json, os, sys, glob, subprocess
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
a = sys.argv[1:]
OUT = os.path.join(ROOT, a[a.index('--out') + 1] if '--out' in a else 'docs/compare/gait'); os.makedirs(OUT, exist_ok=True)
WALK = float(a[a.index('--walk') + 1]) if '--walk' in a else None
RUN = float(a[a.index('--run') + 1]) if '--run' in a else None
SAMPLE = r"""(sec)=>new Promise(res=>{const W=wlGame.mission.hero(),fl=W.getObjectByName('foot.L'),fr=W.getObjectByName('foot.R'),v=new W.position.constructor(),out=[];const t0=performance.now();
  const f=()=>{const a=fl.getWorldPosition(v.clone()),b=fr.getWorldPosition(v.clone());out.push([performance.now()-t0,W.position.x,W.position.z,a.x,a.y,a.z,b.x,b.y,b.z,wlGait.gait.f,wlGait.gait.w]);
    if(performance.now()-t0<sec*1000)requestAnimationFrame(f);else res(out);};f();})"""
CAM = r"""()=>{const W=wlGame.mission.hero();wlGame.view.hold(()=>{const P=W.position;return {from:[P.x+4.2,P.y+.55,P.z+.4],at:[P.x,P.y+.5,P.z]};});}"""
def analyse(rows, name):
    res = {'이름': name}
    if len(rows) < 10: return res
    dt = [(rows[i][0] - rows[i - 1][0]) / 1000 for i in range(1, len(rows))]
    sp = [((rows[i][1] - rows[i - 1][1]) ** 2 + (rows[i][2] - rows[i - 1][2]) ** 2) ** .5 / max(1e-4, dt[i - 1]) for i in range(1, len(rows))]
    mid = [r for r in rows if r[0] > 300]  # 처음 0.3초(출발)는 빼고
    T = (mid[-1][0] - mid[0][0]) / 1000
    res['이동_속도'] = round(((mid[-1][1] - mid[0][1]) ** 2 + (mid[-1][2] - mid[0][2]) ** 2) ** .5 / max(1e-3, T), 2)
    res['걸음_수_초당'] = round(sum(r[9] for r in mid) / len(mid), 2)
    for side, (ix, iy, iz) in (('왼발', (3, 4, 5)), ('오른발', (6, 7, 8))):
        ys = [r[iy] for r in mid]; low = min(ys)
        slides, soles, cur = [], [], None
        for r in mid:
            c = r[iy] < low + .004
            if c:
                soles.append(r[iy] - .082)
                if cur is None: cur = [r[ix], r[iz], 0]
                else: cur[2] = max(cur[2], ((r[ix] - cur[0]) ** 2 + (r[iz] - cur[1]) ** 2) ** .5)
            elif cur is not None: slides.append(cur[2]); cur = None
        res[side] = {'디딤_횟수': len(slides), '디딘_동안_미끄러짐_최대_cm': round(max(slides) * 100, 1) if slides else None,
                     '디딘_동안_미끄러짐_평균_cm': round(sum(slides) / len(slides) * 100, 2) if slides else None,
                     '장화_바닥_높이_cm': round(sum(soles) / len(soles) * 100, 2) if soles else None,
                     '들림_최대_cm': round((max(ys) - low) * 100, 1)}
    return res
R = {}
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'])
    c = b.new_context(viewport={'width': 1280, 'height': 720}, record_video_dir=os.path.join(OUT, 'vid'), record_video_size={'width': 1280, 'height': 720})
    pg = c.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto('http://localhost:8000/?notitle&weather=day&zonetest&zone=sample-outdoor'); pg.evaluate("localStorage.removeItem('wl-speed');localStorage.setItem('wl-help-seen','1')")
    pg.reload(); pg.wait_for_function('window.wlGame&&window.wlGait&&wlGame.mission.hero()', timeout=120000); pg.wait_for_timeout(2500)
    if WALK or RUN: pg.evaluate('([w,r])=>wlGait.SPEED.set(w,r)', [WALK, RUN])
    R['속도_설정'] = pg.evaluate('({walk:wlGait.DRV.walk,run:wlGait.DRV.run})')
    for name, keys, sec in (('걷기', ['KeyD'], 1.05), ('달리기', ['ShiftLeft', 'KeyD'], .72)):
        pg.evaluate("()=>{const W=wlGame.mission.hero();const sp=wlZone.cur.spawn;W.position.set(sp.x,wlZone.cur.groundY?wlZone.cur.groundY(sp.x,sp.z):0,sp.z+3);W.rotation.y=Math.PI;}"); pg.evaluate(CAM); pg.wait_for_timeout(3200)
        for k in keys: pg.keyboard.down(k)
        rows = pg.evaluate(SAMPLE, sec)
        for k in reversed(keys): pg.keyboard.up(k)
        pg.wait_for_timeout(800)
        R[name] = analyse(rows, name)
    pg.evaluate("wlGame.view.hold(null)")
    R['오류'] = errs
    c.close(); b.close()
vids = sorted(glob.glob(os.path.join(OUT, 'vid', '*.webm')), key=os.path.getmtime)
if vids:
    v = vids[-1]
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', v, '-ss', '3', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '22', os.path.join(OUT, 'side.mp4')])
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', os.path.join(OUT, 'side.mp4'), '-vf', 'setpts=4*PTS', '-r', '30', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '22', os.path.join(OUT, 'side-0.25x.mp4')])
json.dump(R, open(os.path.join(OUT, 'gait.json'), 'w'), ensure_ascii=False, indent=1)
print(json.dumps(R, ensure_ascii=False, indent=1))
