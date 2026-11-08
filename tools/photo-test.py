# -*- coding: utf-8 -*-
"""사진 모드 확인 (2026-11-08, js/game/photo.js) — 촬영 서버(8000)가 떠 있을 때 저장소 루트에서:
   python3 tools/photo-test.py [--phone] [--world antvillage] [--out docs/compare/photo]
   1) 들어가기·나가기: 사진 단추(#wlCamBtn)와 C 키(컴퓨터)로 들어갔다 '✕ 닫기'·C로 나와서, 화면 UI(.wlg 아래 요소·톱니)의 보이기 상태가 들어가기 전과 똑같은지,
      사진 모드 동안은 #wlPhoto(와 휴대폰 조이스틱)만 보이는지.
   2) 떡방아(무한 우주 회색 정원만): 절구로 걸어가 '찧기' → 아기 토끼들이 모이면 게임을 멈추고 줌인·줌아웃 × 1:1·4:5·9:16 저장본 + 사진 모드 화면.
      컴퓨터는 PNG 내려받기를 받아 저장, 휴대폰은 미리보기 사진(blob)을 읽어 저장. 저장본 크기(가로 1080 이상)·드로우콜(사진 모드·흐림 켬)을 JSON에.
   --world antvillage: 앤트빌리지(베이스캠프) 들어가기·나가기·한 장 찍기만. 소리 끔, 끝나면 닫음."""
import base64, json, os, sys, struct
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
a = sys.argv[1:]; PHONE = '--phone' in a
WORLD = a[a.index('--world') + 1] if '--world' in a else 'infinite-space'
OUT = os.path.join(ROOT, a[a.index('--out') + 1] if '--out' in a else 'docs/compare/photo'); os.makedirs(OUT, exist_ok=True)
dev = 'phone' if PHONE else 'pc'; tag = f'{WORLD}-{dev}'; R = {'world': WORLD, 'dev': dev}
def png_size(path):
    with open(path, 'rb') as f: h = f.read(24)
    return struct.unpack('>II', h[16:24])
UI_JS = """(()=>{const out={};const list=[...document.querySelectorAll('.wlg>*'),...['dbgBtn','wlCamBtn','wlJoy'].map(i=>document.getElementById(i))].filter(Boolean);
  for(const e of list){const k=e.id||e.className||e.tagName;const s=getComputedStyle(e),r=e.getBoundingClientRect();out[k]=s.display!=='none'&&s.visibility!=='hidden'&&+s.opacity>0&&r.width>0&&r.height>0;}return out;})()"""
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio', '--autoplay-policy=no-user-gesture-required', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'])
    o = dict(viewport={'width': 390, 'height': 844}, device_scale_factor=3, is_mobile=True, has_touch=True) if PHONE else dict(viewport={'width': 1280, 'height': 720})
    c = b.new_context(accept_downloads=True, **o); pg = c.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    pg.on('console', lambda m: m.type == 'error' and '404' not in m.text and errs.append(m.text[:300]))
    q = f'world={WORLD}' + ('&zone=space-garden' if WORLD == 'infinite-space' else '') + '&notitle' + ('&quality=mobile' if PHONE else '')
    pg.goto('http://localhost:8000/?' + q); pg.evaluate('localStorage.clear()'); pg.reload()
    pg.wait_for_function('window.wlZone&&wlZone.cur&&window.wlPhoto&&document.getElementById("wlCamBtn")', timeout=120000); pg.wait_for_timeout(2500)
    pg.evaluate("wlGame.ui.setQuest('➜사진 모드 시험 — 할 일 안내');wlGame.ui.toast('설명 띠도 숨는지',30)"); pg.wait_for_timeout(500)
    # ---- 1) 들어가기·나가기 ----
    before = pg.evaluate(UI_JS); runs = []
    ways = [('단추', "document.getElementById('wlCamBtn').click()", "document.querySelector('#wlPhoto .x').click()")]
    if not PHONE: ways.append(('C 키', 'c', 'c'))
    for name, enter, leave in ways:
        if len(enter) == 1: pg.keyboard.press(enter)
        else: pg.evaluate(enter)
        pg.wait_for_timeout(700); inside = pg.evaluate(UI_JS); act = pg.evaluate('wlPhoto.active()')
        shown = sorted(k for k, v in inside.items() if v)
        pg.screenshot(path=os.path.join(OUT, f'{tag}-ui-inside-{len(runs)}.png'))
        if len(leave) == 1: pg.keyboard.press(leave)
        else: pg.evaluate(leave)
        pg.wait_for_timeout(700); after = pg.evaluate(UI_JS)
        diff = {k: [before.get(k), after.get(k)] for k in set(before) | set(after) if before.get(k) != after.get(k)}
        runs.append({'방법': name, '들어감': act, '사진 모드에서 보인 것': shown, '나온 뒤 달라진 것': diff, '나옴': not pg.evaluate('wlPhoto.active()')})
    pg.screenshot(path=os.path.join(OUT, f'{tag}-ui-after.png'))
    R['들어가기·나가기'] = runs
    # ---- 2) 찍기 ----
    def shoot(fname):
        if not PHONE:
            with pg.expect_download() as d: pg.evaluate('wlPhoto.shoot()')
            d.value.save_as(fname)
        else:
            prev = pg.evaluate('wlPhoto.state.lastURL'); pg.evaluate('wlPhoto.shoot()')
            pg.wait_for_function('u=>wlPhoto.state.lastURL&&wlPhoto.state.lastURL!==u', arg=prev, timeout=30000)
            data = pg.evaluate("""async()=>{const u=wlPhoto.state.lastURL;const bl=await (await fetch(u)).blob();const fr=new FileReader();return await new Promise(ok=>{fr.onload=()=>ok(fr.result.split(',')[1]);fr.readAsDataURL(bl);});}""")
            open(fname, 'wb').write(base64.b64decode(data))
        w, h = png_size(fname); return [w, h]
    shots = []
    def stats():
        t = pg.evaluate("document.getElementById('stats').textContent")
        import re; m = re.search(r'드로우콜 (\d+)회.*?삼각형 ([\d,]+)개', t); return [int(m.group(1)), int(m.group(2).replace(',', ''))] if m else None
    if WORLD == 'infinite-space':
        S = pg.evaluate('wlZone.cur.spots'); m = S['mortar']
        pg.evaluate("([x,z])=>{const W=wlGame.mission.hero();W.position.x=x;W.position.z=z;}", [m[0] - 2.6, m[1] - 1.6]); pg.wait_for_timeout(1200)
        pg.evaluate("([x,z])=>wlGame.mission.hero().userData.walkTo(x,z)", m)
        for _ in range(100):
            if not pg.evaluate('wlGame.mission.hero().userData.isWalking()'): break
            pg.wait_for_timeout(200)
        for _ in range(40):
            if '찧기' in pg.evaluate('wlGame.interact.prompt()') and not pg.evaluate('wlGame.interact.busy()'): break
            pg.wait_for_timeout(200)
        pg.keyboard.press('e') if not PHONE else pg.evaluate('wlGame.interact.act()')
        pg.wait_for_timeout(2600)  # 아기 토끼들이 절구 건너편으로 모임
        pg.evaluate('window.wlTimeScale=1e-6'); pg.wait_for_timeout(200); pound_before = pg.evaluate(UI_JS)
        pg.screenshot(path=os.path.join(OUT, f'{tag}-pound-before.png'))
        pg.evaluate("document.getElementById('wlCamBtn').click()"); pg.wait_for_timeout(300)
        # 원더룹 앞 비스듬히(토끼들이 원더룹 뒤로 보이게 — 절구 건너편): 원더룹이 보는 쪽 기준
        for zname, dist, pitch, yo in [('zoomin', 4.6, .5, .45), ('zoomout', 9, .4, .55)]:
            pg.evaluate("([d,p,o])=>{const W=wlGame.mission.hero();wlPhoto.setAngle(W.rotation.y+o,p);wlPhoto.setZoom(d);}", [dist, pitch, yo])
            for r in ['1:1', '4:5', '9:16']:
                pg.evaluate(f"wlPhoto.setRatio('{r}')"); pg.wait_for_timeout(350)
                rr = r.replace(':', 'x'); fn = os.path.join(OUT, f'{tag}-pound-{zname}-{rr}.png')
                shots.append({'파일': os.path.relpath(fn, ROOT), '크기': shoot(fn), '줌': dist, '비율': r})
                pg.wait_for_timeout(400)
            pg.screenshot(path=os.path.join(OUT, f'{tag}-pound-{zname}-screen.png'))
        pg.evaluate('wlPhoto.setBlur(true);wlPhoto.setMini(true);wlPhoto.setRatio("4:5")'); pg.wait_for_timeout(400)
        fn = os.path.join(OUT, f'{tag}-pound-mini-4x5.png'); shots.append({'파일': os.path.relpath(fn, ROOT), '크기': shoot(fn), '비율': '4:5', '미니어처': True})
        mid = before  # 떡방아 중 사진 모드에 들어가기 바로 앞의 화면과 비교(게임을 멈춘 채 나옴 — 그 사이 게임이 진행해 바뀐 것과 섞이지 않게)
        pg.evaluate('wlPhoto.setMini(false)'); pg.evaluate('wlPhoto.exit()'); pg.wait_for_timeout(500)
        R['떡방아 뒤 UI 그대로'] = {k: [pound_before.get(k), v] for k, v in pg.evaluate(UI_JS).items() if pound_before.get(k) != v}
        pg.evaluate('window.wlTimeScale=1'); pg.wait_for_timeout(1300); R['그리기(보통 화면)'] = stats()
        pg.evaluate('wlPhoto.enter();wlPhoto.setZoom(9)'); pg.wait_for_timeout(1300); R['그리기(사진 모드, 흐림 켬)'] = stats()
        pg.evaluate('wlPhoto.setBlur(false)'); pg.wait_for_timeout(1300); R['그리기(사진 모드, 흐림 끔)'] = stats()
        pg.evaluate('wlPhoto.setBlur(true);wlPhoto.exit()'); pg.wait_for_timeout(300)
    else:
        R['그리기(보통 화면)'] = stats()
        pg.evaluate("document.getElementById('wlCamBtn').click()"); pg.wait_for_timeout(800)
        fn = os.path.join(OUT, f'{tag}-shot-4x5.png'); shots.append({'파일': os.path.relpath(fn, ROOT), '크기': shoot(fn), '비율': '4:5'})
        pg.screenshot(path=os.path.join(OUT, f'{tag}-screen.png')); R['그리기(흐림 켬)'] = stats()
        pg.evaluate('wlPhoto.exit()'); pg.wait_for_timeout(600)
    R['저장본'] = shots; R['가로 1080 이상'] = all(s['크기'][0] >= 1080 for s in shots)
    R['오류'] = errs; c.close(); b.close()
json.dump(R, open(os.path.join(OUT, f'{tag}.json'), 'w'), ensure_ascii=False, indent=1)
print(json.dumps(R, ensure_ascii=False, indent=1))
