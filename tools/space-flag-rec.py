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
        pg.evaluate("([x,z,vx,vz])=>{const W=wlGame.mission.hero();W.userData.stopWalk&&W.userData.stopWalk();W.position.x=x;W.position.z=z;const a=Math.atan2(vx-x,vz-z);W.rotation.y=a;const I=wlGame.controls.input;I.cam.yaw=a+Math.PI+(innerWidth<innerHeight?.13:.3);I.cam.pitch=.12;I.cam.dist=9; /* 평소 카메라 그대로, 원더룹이 화산을 가리지 않게 옆으로 조금 */I.cam.user=(I.cam.user||0)+1;}", [at[0], at[1]] + S['volcano'][:2])
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
    MEAS = """async ()=>{const T=await import('three');const G=wlGame,Z=wlZone.cur,S=Z.spots,W=G.mission.hero();let sc=W;while(sc.parent)sc=sc.parent;const tg=[sc.getObjectByName('mars-summit'),sc.getObjectByName('mars-ground')].filter(Boolean);
      const rc=new T.Raycaster();const surf=(x,z)=>{rc.set(new T.Vector3(x,120,z),new T.Vector3(0,-1,0));const h=rc.intersectObjects(tg,false)[0];return h?h.point.y:null;};
      const v=S.volcano,pts=[];for(const r of [15.5,18,22,26,30,33])for(let i=0;i<8;i++){const a=i/8*6.283+r;pts.push([v[0]+Math.cos(a)*r,v[1]+Math.sin(a)*r]);}
      let mx=0,mn=0;for(const [x,z] of pts){const d=surf(x,z)-Z.groundY(x,z);mx=Math.max(mx,d);mn=Math.min(mn,d);}
      const at=(p,y)=>+(y-surf(p[0],p[1])).toFixed(3),f=sc.getObjectByName('wl-flag'),st=S.calderaStones||[],bur=st.map(q=>q[3]);
      const B=await import((performance.getEntriesByType('resource').find(e=>/js\\/game\\/bend\\.js/.test(e.name))||{}).name),b0=B.bentPos({x:W.position.x+20,y:38,z:W.position.z}),b1=B.bentPos({x:W.position.x+20,y:40,z:W.position.z});
      return {'땅 그림과 걷는 높이 차이(m, 고원 48곳)':[+mn.toFixed(3),+mx.toFixed(3)],'원더룹 발 — 땅 위로 뜬 높이(m)':at([W.position.x,W.position.z],W.position.y),'깃발 밑동 — 뜬 높이(m)':f&&f.visible?at([f.position.x,f.position.z],f.position.y):null,
        '회오리 자리 — 땅과 차이(m)':+(Z.groundY(...S.summitWhirl)-surf(...S.summitWhirl)).toFixed(3),'돌 턱 돌 — 묻힌 깊이(m, 최소~최대)':[Math.min(...bur),Math.max(...bur)],'돌 개수':st.length,
        '둥근 땅 — 같은 자리의 땅과 2m 위 물체가 내려가는 양 차이(m)':+((b0.y-38)-(b1.y-40)).toFixed(4),'둥근 땅 세기':+B.bendK().toFixed(6)};}"""
    R['접지(도착)'] = pg.evaluate(MEAS)
    R['할 일 안내'] = pg.evaluate("(document.getElementById('wlQuest')||{}).textContent||''")
    # 깃발 자리로 걸어감 → 꽂기
    fs = S['flagSpot']; pg.evaluate("([x,z,sx,sz])=>{const W=wlGame.mission.hero();let dx=sx-x,dz=sz-z;const l=Math.hypot(dx,dz)||1;W.userData.walkTo(x+dx/l*1.3,z+dz/l*1.3);}", fs + S['summit'])
    for _ in range(40):
        pg.wait_for_timeout(250)
        if not pg.evaluate('wlGame.mission.hero().userData.isWalking()'): break
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
    pg.evaluate("([x,z])=>wlGame.mission.hero().userData.walkTo(x,z)", S['volcano'][:2]); pg.wait_for_timeout(3500); R['분화구 가운데까지(m) — 돌 턱에서 멈춤'] = pg.evaluate("([x,z])=>{const P=wlGame.mission.hero().position;return +Math.hypot(P.x-x,P.z-z).toFixed(1)}", S['volcano'][:2]); shot('caldera-edge')
    R['접지(꽂은 뒤)'] = pg.evaluate(MEAS)
    pg.evaluate("(()=>{const I=wlGame.controls.input;I.cam.dist=4;I.cam.pitch=.3;I.cam.user=(I.cam.user||0)+1;})()"); pg.wait_for_timeout(1800); shot('zoom-stones')
    fs2 = S['flagSpot']; sm2 = S['summit']; pg.evaluate("([x,z])=>wlGame.mission.hero().userData.walkTo(x,z)", [fs2[0] + (sm2[0] - fs2[0]) * .3, fs2[1] + (sm2[1] - fs2[1]) * .3]); pg.wait_for_timeout(3000); shot('zoom-feet')
    pg.evaluate("(()=>{const I=wlGame.controls.input;I.cam.dist=9;I.cam.pitch=.5;})()")
    # 고원을 걸어 내려가는 회오리로
    for _ in range(80):
        s = st()
        if s['ride'] or not s['summit']: break
        pg.evaluate("([x,z])=>wlGame.mission.hero().userData.walkTo(x,z)", s['secretWhirl']); pg.wait_for_timeout(400)
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
