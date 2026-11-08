# -*- coding: utf-8 -*-
"""무한 우주 떡방아 녹화·각도 확인 (2026-11-08) — 촬영 서버(8000)가 떠 있을 때 저장소 루트에서:
   python3 tools/space-pound-rec.py --tag before|after [--phone] [--angles] [--out docs/compare/space-pound]
   ?world=infinite-space&zone=space-garden&notitle(기록 지움) → 시작 자리에서 절구까지 걸어가 '찧기' 세 번 → 달떡 받기·보름 할아버지 한마디까지.
   녹화는 게임 카메라 그대로(플레이어가 보는 화면) → <out>/<tag>-<pc|phone>.mp4 (ffmpeg, 걷기 시작부터).
   --angles: 찧는 자세 네 순간(잡기·들기·내려친 순간·멈춤)을 게임을 멈추고 정면 사선·옆·뒤·반대 사선에서 → <out>/<tag>-angles-*.png + 손·떡메 자리 JSON.
   결과 JSON: 오류, 찧기 횟수, 달떡, 떡메 머리가 떡에 닿은 높이 차이. 소리 끔, 끝나면 닫음."""
import json, os, sys, shutil, subprocess, time, glob
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
a = sys.argv[1:]; PHONE = '--phone' in a; ANG = '--angles' in a
TAG = a[a.index('--tag') + 1] if '--tag' in a else 'run'
OUT = os.path.join(ROOT, a[a.index('--out') + 1] if '--out' in a else 'docs/compare/space-pound'); os.makedirs(OUT, exist_ok=True)
dev = 'phone' if PHONE else 'pc'; R = {'tag': TAG, 'dev': dev}
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio', '--autoplay-policy=no-user-gesture-required', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'])
    o = dict(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True) if PHONE else dict(viewport={'width': 1280, 'height': 720})
    vd = os.path.join(OUT, '_vid'); shutil.rmtree(vd, ignore_errors=True)
    if not ANG: o['record_video_dir'] = vd; o['record_video_size'] = dict(o['viewport'])
    c = b.new_context(**o); V0 = time.time(); pg = c.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    pg.on('console', lambda m: m.type == 'error' and '404' not in m.text and errs.append(m.text[:300]))
    U = 'http://localhost:8000/?world=infinite-space&zone=space-garden&notitle' + ('&quality=mobile' if PHONE else '')
    pg.goto(U); pg.evaluate('localStorage.clear()'); pg.reload()
    pg.wait_for_function('window.wlZone&&wlZone.cur&&wlZone.cur.spots', timeout=120000); pg.wait_for_timeout(2500)
    S = pg.evaluate('wlZone.cur.spots')
    def walk(x, z, sec=20):
        pg.evaluate("([x,z])=>wlGame.mission.hero().userData.walkTo(x,z)", [x, z])
        for _ in range(int(sec * 5)):
            if not pg.evaluate("wlGame.mission.hero().userData.isWalking()"): break
            pg.wait_for_timeout(200)
    def act(word, wait=8):
        for _ in range(int(wait * 5)):
            if word in pg.evaluate('wlGame.interact.prompt()') and not pg.evaluate('wlGame.interact.busy()'): break
            pg.wait_for_timeout(200)
        pg.keyboard.press('e'); pg.wait_for_timeout(250)
        if not pg.evaluate('wlGame.interact.busy()') and word in pg.evaluate('wlGame.interact.prompt()'): pg.evaluate('wlGame.interact.act()')
    # 절구에서 3m 떨어진 곳(마을 쪽)으로 옮겨 서서 걸어 들어감 — 플레이어처럼
    m = S['mortar']; pg.evaluate("([x,z])=>{const W=wlGame.mission.hero();W.position.x=x;W.position.z=z;}", [m[0] - 2.6, m[1] - 1.6]); pg.wait_for_timeout(1500)
    t0 = time.time() - V0
    walk(*m); pg.wait_for_timeout(400)
    if ANG:
        # 각도 확인: 찧는 순간마다 게임을 멈추고(0에 가까운 배속) 카메라를 원더룹 둘레 네 자리로 옮겨 찍음
        R['angles'] = []
        act('찧기')
        for name, at in [('grip', .2), ('lift', .5), ('impact', .61), ('pause', .74)]:
            pg.evaluate("window.wlTimeScale=1")
            for _ in range(200):
                if pg.evaluate("(()=>{const U=wlGame.mission.hero().userData;return U.action!=='떡메 찧기'||U.at>=%f})()" % at): break
                pg.wait_for_timeout(5)
            pg.evaluate("window.wlTimeScale=1e-6"); pg.wait_for_timeout(250)
            info = pg.evaluate("wlZone.cur.poundInfo?wlZone.cur.poundInfo():null"); R['angles'].append({'name': name, 'info': info})
            for an, yaw in [('front45', .78), ('side', 1.57), ('back', 3.14), ('front-other', -.78)]:
                pg.evaluate("""([yaw])=>{const W=wlGame.mission.hero(),C=wlGame.view.camera,P=W.position,r=W.rotation.y+yaw,d=3.0;
                  C.position.set(P.x+Math.sin(r)*d,P.y+1.05,P.z+Math.cos(r)*d);C.lookAt(P.x+Math.sin(W.rotation.y)*.35,P.y+.62,P.z+Math.cos(W.rotation.y)*.35);}""", [yaw])
                pg.wait_for_timeout(180); pg.screenshot(path=os.path.join(OUT, f'{TAG}-{dev}-{name}-{an}.png'))
            pg.evaluate("window.wlTimeScale=1"); pg.wait_for_timeout(50)
        pg.wait_for_timeout(1500)
    else:
        for k in range(3):
            act('찧기'); pg.wait_for_timeout(1700 if k < 2 else 1400)
        for _ in range(60):
            if pg.evaluate("!!wlGame.state.flags['item:infinite-space:dalddeok']"): break
            pg.wait_for_timeout(200)
        pg.wait_for_timeout(5600)
        R['찧기'] = 3; R['달떡'] = pg.evaluate("!!wlGame.state.flags['item:infinite-space:dalddeok']")
        R['떡메 닿음'] = pg.evaluate("wlZone.cur.poundInfo?wlZone.cur.poundInfo().hits:null")
    R['오류'] = errs
    c.close(); b.close()
    if not ANG:
        v = glob.glob(os.path.join(vd, '*.webm'))
        if v:
            dst = os.path.join(OUT, f'{TAG}-{dev}.mp4')
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', f'{max(0, t0 - .3):.2f}', '-i', v[0], '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '23', '-movflags', '+faststart', dst], check=True)
            R['영상'] = os.path.relpath(dst, ROOT)
        shutil.rmtree(vd, ignore_errors=True)
json.dump(R, open(os.path.join(OUT, f'{TAG}-{dev}.json'), 'w'), ensure_ascii=False, indent=1)
print(json.dumps(R, ensure_ascii=False, indent=1))
