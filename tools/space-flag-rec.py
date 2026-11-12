# -*- coding: utf-8 -*-
"""화성 화산 꼭대기 '깃발 꽂기' 녹화·확인 (2026-11-12) — 서버가 떠 있을 때 저장소 루트에서:
   python3 tools/space-flag-rec.py [--phone] [--port 8000]
   삐삐를 만난 상태로 열어 → 비밀 회오리를 타고 꼭대기 → 깃발 자리로 걸어가 실제 입력(E / 단추)으로 꽂기 → 리액션 → 한 바퀴 카메라 → 사진 안내 → 비밀 띠 카드
   → 회오리로 내려옴 → 착지 자리·삐삐 언덕에서 화산 쪽 캡처(깃발이 보이는지 — 화면에 비친 깃발 높이 화소) → 다시 열어 같은 캡처 + 가방.
   결과 docs/compare/space-flag/<pc|phone>-….png·.webm·-result.json (그리기 수 포함). 소리 끔, 끝나면 닫음."""
import json, os, re, shutil, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
a = sys.argv[1:]; PHONE = '--phone' in a; PORT = a[a.index('--port') + 1] if '--port' in a else '8000'
OUT = os.path.join(ROOT, 'docs/compare/space-flag'); os.makedirs(OUT, exist_ok=True); pre = 'phone-' if PHONE else 'pc-'; R = {}
FLAGS = ['have:infinite-space:necklace', 'mars:met', 'mars:call', 'mars:recA', 'meet:infinite-space:pipi', 'secret:infinite-space:marssound']  # 삐삐 녹음까지 끝난 상태(언덕에 가도 장면이 시작되지 않게)
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'])
    o = dict(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True) if PHONE else dict(viewport={'width': 1280, 'height': 720})
    c = b.new_context(**o, record_video_dir=os.path.join(OUT, 'vid-' + pre[:-1]), record_video_size=o['viewport']); pg = c.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    U = 'http://localhost:' + PORT + '/?world=infinite-space&zone=space-mars&notitle' + ('&quality=mobile' if PHONE else '')
    def boot():
        pg.wait_for_function('window.wlZone&&wlZone.cur&&wlZone.cur.spots&&window.wlPhoto', timeout=120000); pg.wait_for_timeout(2500)
        for _ in range(5):
            if pg.evaluate('wlGame.ui.cardShown()') or pg.evaluate('wlGame.dialog.talking()'): pg.keyboard.press('Escape'); pg.wait_for_timeout(600)
    pg.goto(U); pg.wait_for_function('window.wlGame&&wlGame.state', timeout=120000); pg.wait_for_timeout(1500); pg.wait_for_function('window.wlGame&&wlGame.state', timeout=120000)
    pg.evaluate("f=>{localStorage.clear();localStorage.setItem('wl-help-seen','1');f.forEach(k=>wlGame.state.setFlag(k,true))}", FLAGS); pg.reload(); boot()
    S = pg.evaluate('wlZone.cur.spots'); st = lambda: pg.evaluate('wlZone.cur.state()')
    shot = lambda n: pg.screenshot(path=os.path.join(OUT, pre + n + '.png'))
    def stats():
        m = re.search(r'드로우콜 (\d+)회.*?삼각형 ([\d,]+)개', pg.evaluate("(document.getElementById('stats')||{}).textContent||''")); return [int(m.group(1)), int(m.group(2).replace(',', ''))] if m else None
    perf = []
    def flagPx():  # 깃발이 화면에서 차지하는 높이(화소)와 자리
        return pg.evaluate("""(()=>{const G=wlGame,c=G.view.camera;let sc=G.mission.hero();while(sc.parent)sc=sc.parent;const f=sc.getObjectByName('wl-flag');if(!f||!f.visible)return null;const V=f.position.constructor,a=f.position.clone().project(c),b=new V(f.position.x,f.position.y+1.5*f.scale.y,f.position.z).project(c);
          return {h:+(Math.abs(a.y-b.y)/2*innerHeight).toFixed(1),x:+((b.x+1)/2).toFixed(3),y:+((1-b.y)/2).toFixed(3),front:b.z<1,scale:+f.scale.y.toFixed(2)}})()""")
    def look(at, name):  # at에 서서 화산 쪽을 봄
        pg.evaluate("([x,z,vx,vz])=>{const W=wlGame.mission.hero();W.userData.stopWalk&&W.userData.stopWalk();W.position.x=x;W.position.z=z;const a=Math.atan2(vx-x,vz-z);W.rotation.y=a;const I=wlGame.controls.input;I.cam.yaw=a+Math.PI;I.cam.pitch=-.5;I.cam.dist=4.5; /* 플레이어가 할 수 있는 만큼: 가까이 당겨 올려다봄(멀리 두면 카메라가 땅에 걸려 꼭대기가 화면 위로 나감) */I.cam.user=(I.cam.user||0)+1;}", [at[0], at[1]] + S['volcano'][:2])
        pg.wait_for_timeout(2600); shot(name); return flagPx()
    # 비밀 회오리 → 꼭대기
    sw = st()['secretWhirl']; pg.evaluate("([x,z])=>{const W=wlGame.mission.hero();W.position.x=x+2.6;W.position.z=z;}", sw); pg.wait_for_timeout(600)
    for _ in range(40):
        s = st()
        if s['ride'] or s['summit']: break
        sw = s['secretWhirl']; pg.evaluate("([x,z])=>wlGame.mission.hero().userData.walkTo(x,z)", sw); pg.wait_for_timeout(400)
    for _ in range(120):
        if st()['summit'] and not st()['ride']: break
        pg.wait_for_timeout(250)
    R['꼭대기 도착'] = st()['summit']; pg.wait_for_timeout(3200); shot('summit-arrive'); perf.append(stats())
    R['할 일 안내'] = pg.evaluate("(document.getElementById('wlQuest')||{}).textContent||''")
    fs = S['flagSpot']
    pg.wait_for_timeout(500); R['단추 글자'] = pg.evaluate("(document.getElementById('wlPrompt')||{}).textContent||''") if not PHONE else pg.evaluate("(document.getElementById('wlAct')||{}).textContent||''")
    R['깃발 자리까지(m)'] = pg.evaluate("([x,z])=>{const P=wlGame.mission.hero().position;return +Math.hypot(P.x-x,P.z-z).toFixed(2)}", fs); R['막힘'] = pg.evaluate('[wlGame.core.blocking(),wlGame.ui.cardShown(),wlZone.cur.state().scene]')
    shot('flag-spot')
    if PHONE:
        try: pg.locator('#wlAct').tap(timeout=1500)
        except Exception: pg.keyboard.press('e')
    else: pg.keyboard.press('e')
    for i, (t, n) in enumerate([(900, 'plant-1'), (500, 'plant-2'), (1400, 'react'), (2600, 'orbit-1'), (2500, 'orbit-2'), (2500, 'orbit-3'), (2500, 'orbit-4')]):
        pg.wait_for_timeout(t); shot(n); perf.append(stats())
    pg.wait_for_timeout(2500); shot('photo-toast'); R['사진 안내'] = pg.evaluate("(document.getElementById('wlToast')||{}).textContent||''")
    pg.wait_for_timeout(2600); shot('secret-strip'); R['비밀 띠 카드'] = pg.evaluate("(()=>{const e=document.getElementById('wlStrip');return e&&e.classList.contains('on')?e.textContent.slice(0,40):''})()")
    s = st(); R['깃발 꽂음'] = s['flag']; R['깃발 자리'] = s['flagAt']
    for _ in range(40):
        if not pg.evaluate('wlGame.ui.cardShown()') and not st()['scene']: break
        pg.wait_for_timeout(500)
    pg.wait_for_timeout(600); R['꽂은 뒤 할 일 안내'] = pg.evaluate("(document.getElementById('wlQuest')||{}).textContent||''"); shot('after-plant')
    # 내려가기('회오리 타고 내려가기' 단추)
    R['내려가기 단추'] = pg.evaluate("(document.getElementById('wlPrompt')||{}).textContent||''") if not PHONE else pg.evaluate("(document.getElementById('wlAct')||{}).textContent||''")
    if PHONE:
        try: pg.locator('#wlAct').tap(timeout=1500)
        except Exception: pg.keyboard.press('e')
    else: pg.keyboard.press('e')
    for _ in range(120):
        s = st()
        if not s['ride'] and not s['summit']: break
        pg.wait_for_timeout(250)
    R['내려옴'] = not st()['summit']; pg.wait_for_timeout(1500)
    R['착지 자리에서 깃발'] = look(S['landW'], 'far-landing'); perf.append(stats())
    R['삐삐 언덕에서 깃발'] = look(S['hill'], 'far-hill'); perf.append(stats())
    R['시작 자리에서 깃발'] = look(S['spawn'], 'far-spawn')
    # 가방
    pg.keyboard.press('b'); pg.wait_for_timeout(900)
    R['가방 표시'] = pg.evaluate("[...document.querySelectorAll('#wlBag .dx .note')].map(e=>e.textContent)")
    pg.evaluate("(()=>{const n=document.querySelector('#wlBag .dx .note');if(n)n.scrollIntoView({block:'center'});})()"); pg.wait_for_timeout(400); shot('bag'); pg.keyboard.press('Escape'); pg.wait_for_timeout(500)
    # 다시 열기
    pg.goto('about:blank'); pg.goto(U); boot()
    R['다시 열기'] = {'깃발': st()['flag'], '자리': st()['flagAt'], '착지 자리에서': look(S['landW'], 'reopen-landing'), '삐삐 언덕에서': look(S['hill'], 'reopen-hill')}
    P = [x for x in perf if x]; R['그리기'] = {'최대 드로우콜': max(x[0] for x in P), '최대 삼각형': max(x[1] for x in P)} if P else None
    R['오류'] = errs; vid = pg.video.path(); c.close(); b.close()
    shutil.move(vid, os.path.join(OUT, pre + 'flag.webm')); shutil.rmtree(os.path.join(OUT, 'vid-' + pre[:-1]), ignore_errors=True)
json.dump(R, open(os.path.join(OUT, pre + 'result.json'), 'w'), ensure_ascii=False, indent=1)
print(json.dumps(R, ensure_ascii=False, indent=1))
