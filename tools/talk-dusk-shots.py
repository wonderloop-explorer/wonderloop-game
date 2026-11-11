# -*- coding: utf-8 -*-
"""주민 대화 카메라 · 노을 뒤 화성 안개 전후 캡처 (2026-11-11) — 서버가 떠 있을 때 저장소 루트에서:
   python3 tools/talk-dusk-shots.py --tag before|after [--port 8000] [--only pc,phone,632]
   크기 셋(PC 1280×720 · 휴대폰 세로 390×844 터치 · 1280×632)마다:
   - 대화: 삐삐·둥둥(화성), 아기 토끼 콩콩·보름 할아버지(회색 정원) — 원더룹이 상대 쪽으로 걸어가(카메라가 등 뒤에 옴) 실제 입력(E 키 / 말 걸기 단추 터치)으로 말을 걸고
     1.6초 뒤 한 장, 화면을 눌러(조금 떨리는 손가락·마우스 — 3화소 움직임) 다음 대사로 넘긴 뒤 한 장. 그때 원더룹 얼굴이 카메라 쪽으로 얼마나 보이는지(얼굴 방향·카메라 방향 내적)와
     두 사람 몸이 화면 안에 다 들어왔는지도 잰다.
   - 노을: STAGE 2를 끝낸 상태(노을)에서 네 자리에 서서 한 장씩 + 화면 평균 색·명암 차이(표준편차 — 안개에 묻히면 작아짐).
   결과 docs/compare/talk-dusk/<tag>-<크기>-….png, <tag>.json. 소리 끔, 끝나면 닫음."""
import json, os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
a = sys.argv[1:]; arg = lambda k, d: a[a.index(k) + 1] if k in a else d
TAG = arg('--tag', 'after'); PORT = arg('--port', '8000'); ONLY = arg('--only', 'pc,phone,632').split(',')
OUT = os.path.join(ROOT, 'docs/compare/talk-dusk'); os.makedirs(OUT, exist_ok=True)
VIEWS = {'pc': dict(viewport={'width': 1280, 'height': 720}), '632': dict(viewport={'width': 1280, 'height': 632}),
         'phone': dict(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)}
MEASURE = """(name)=>{const G=wlGame,W=G.mission.hero(),cam=G.view.camera,V=W.position.constructor,n=G.dialog.findNPC(name),B=window.__bend;
 const pr=(x,y,z)=>{const b=B?B.bentPos({x,y,z}):{x,y,z};const q=new V(b.x,b.y,b.z).project(cam);return [+(((q.x+1)/2)).toFixed(3),+(((1-q.y)/2)).toFixed(3)];};
 const P=W.position,np=new V();n.root.getWorldPosition(np);const fx=Math.sin(W.rotation.y),fz=Math.cos(W.rotation.y);let cx=cam.position.x-P.x,cz=cam.position.z-P.z;const cl=Math.hypot(cx,cz)||1;
 const pts=[pr(P.x,P.y,P.z),pr(P.x,P.y+1.6,P.z),pr(np.x,np.y,np.z),pr(np.x,np.y+(n.bubbleY||1.4),np.z)];
 const hb=wlPhoto.body(cam);const r=hb&&hb.rect;
 return {face:+((fx*cx+fz*cz)/cl).toFixed(2),dist:+cam.position.distanceTo(P).toFixed(1),inside:pts.every(p=>p[0]>.02&&p[0]<.98&&p[1]>.02&&p[1]<.98),pts,heroW:r?+(r[2]-r[0]).toFixed(2):null,heroH:r?+(r[3]-r[1]).toFixed(2):null,talking:G.dialog.talking()};}"""
FOGSTAT = """()=>{const c=document.querySelector('canvas');const t=document.createElement('canvas');t.width=64;t.height=64;const x=t.getContext('2d');x.drawImage(c,0,0,64,64);const d=x.getImageData(0,32,64,32).data;
 let s=[0,0,0],n=0,L=[];for(let i=0;i<d.length;i+=4){s[0]+=d[i];s[1]+=d[i+1];s[2]+=d[i+2];L.push(.3*d[i]+.59*d[i+1]+.11*d[i+2]);n++;}const m=L.reduce((a,b)=>a+b)/n;const sd=Math.sqrt(L.reduce((a,b)=>a+(b-m)*(b-m),0)/n);
 return {avg:s.map(v=>Math.round(v/n)),contrast:+sd.toFixed(1)};}"""
def stat(fn):
    """화면 가운데 띠(지평선 둘레 — 위 30%~65%)의 평균 색과 명암 차이(밝기 표준편차 — 안개에 묻히면 작아짐)"""
    from PIL import Image, ImageStat
    im = Image.open(fn).convert('RGB'); w, h = im.size; im = im.crop((0, int(h * .3), w, int(h * .65))); st = ImageStat.Stat(im.convert('L'))
    return {'avg': [round(v) for v in ImageStat.Stat(im).mean], 'contrast': round(st.stddev[0], 1)}
R = {}
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'])
    for vk in ONLY:
        o = VIEWS[vk]; touch = bool(o.get('has_touch')); c = b.new_context(**o); pg = c.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
        base = 'http://localhost:' + PORT + '/?world=infinite-space&notitle&time=0' + ('&quality=mobile' if touch else '')
        ready = lambda: (pg.wait_for_function('window.wlZone&&wlZone.cur&&wlZone.cur.spots&&window.wlPhoto', timeout=120000),
                         pg.evaluate("(async()=>{const e=performance.getEntriesByType('resource').find(e=>/js\\/game\\/bend\\.js/.test(e.name));if(e)window.__bend=await import(e.name);})()"))
        def boot(zone, flags):
            # 화성은 시간을 고정하지 않는다(고정하면 노을이 낮으로 열림)
            u = (base if zone != 'space-mars' else base.replace('&time=0', '')) + '&zone=' + zone; pg.goto(u); pg.wait_for_function('window.wlGame&&wlGame.state', timeout=120000); pg.wait_for_timeout(1200); pg.wait_for_function('window.wlGame&&wlGame.state', timeout=120000)  # 버전 확인이 한 번 다시 열 수 있음
            pg.evaluate("f=>{localStorage.setItem('wl-help-seen','1');f.forEach(k=>wlGame.state.setFlag(k,true))}", flags); pg.reload(); ready(); pg.wait_for_timeout(2500)
            for _ in range(6):
                if pg.evaluate('wlGame.ui.cardShown()') or pg.evaluate('wlGame.dialog.talking()'): pg.keyboard.press('Escape'); pg.evaluate('wlGame.dialog.act()'); pg.wait_for_timeout(700)
        def shot(name): pg.screenshot(path=os.path.join(OUT, '%s-%s-%s.png' % (TAG, vk, name)))
        def tapNext():
            w, h = o['viewport']['width'], o['viewport']['height']; x, y = w * .5, h * .45
            if touch:
                cdp = c.new_cdp_session(pg)
                cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x, 'y': y}]})
                cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': x + 3, 'y': y + 2}]})
                cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
            else: pg.mouse.move(x, y); pg.mouse.down(); pg.mouse.move(x + 3, y + 2); pg.mouse.up()
        def talk(name, key):
            pos = pg.evaluate("n=>{const m=wlGame.dialog.findNPC(n),W=wlGame.mission.hero(),v=new (W.position.constructor)();m.root.getWorldPosition(v);return [v.x,v.z]}", name)
            # 상대에게서 4.5m 떨어진 곳에 세웠다가 걸어가 1.3m 앞에서 멈춤 → 따라가기 카메라가 등 뒤에 옴
            pg.evaluate("([x,z,n])=>{const W=wlGame.mission.hero(),P=W.position;let dx=P.x-x,dz=P.z-z;const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;if(l>6||l<3){P.x=x+dx*4.5;P.z=z+dz*4.5;}W.userData.walkTo(x+dx*1.3,z+dz*1.3);}", pos + [name])
            for _ in range(40):
                pg.wait_for_timeout(250)
                if not pg.evaluate('wlGame.mission.hero().userData.isWalking()'): break
            pg.wait_for_timeout(1200)
            if touch:
                try: pg.locator('#wlAct').tap(timeout=1500)
                except Exception: pg.evaluate('wlGame.dialog.act()')
            else: pg.keyboard.press('e')
            pg.wait_for_timeout(400)
            if not pg.evaluate('wlGame.dialog.talking()'): pg.evaluate("n=>wlGame.dialog.startTalk(wlGame.dialog.findNPC(n))", name)
            pg.wait_for_timeout(1700); shot(key + '-1'); m1 = pg.evaluate(MEASURE, name)
            tapNext(); pg.wait_for_timeout(1400); shot(key + '-2'); m2 = pg.evaluate(MEASURE, name)
            for _ in range(12):
                if not pg.evaluate('wlGame.dialog.talking()') and not pg.evaluate('wlGame.ui.cardShown()'): break
                pg.keyboard.press('Escape'); pg.evaluate('wlGame.dialog.act()'); pg.wait_for_timeout(500)
            pg.evaluate("(()=>{const b=[...document.querySelectorAll('.wlg button')].find(b=>getComputedStyle(b).visibility!=='hidden'&&b.getClientRects().length&&/좋아요|가방에|넣기|확인|닫기|반가워/.test(b.textContent));if(b)b.click();})()")
            pg.wait_for_timeout(900); R.setdefault(vk, {})[key] = {'말 건 뒤': m1, '눌러 넘긴 뒤': m2}
        boot('space-garden', ['have:infinite-space:necklace', 'space:demo'])
        talk('아기 토끼 콩콩', 'bunny'); talk('보름 할아버지', 'bobo')
        boot('space-mars', ['have:infinite-space:necklace', 'mars:met', 'mars:call', 'mars:recA', 'mars:recB', 'mars:told', 'clear:space-mars'])
        talk('삐삐', 'pipi'); talk('둥둥', 'dung')
        pg.evaluate('wlZone.cur.sky.set(1);0'); pg.wait_for_timeout(600)  # 다시 열면 날씨가 낮으로 되돌리므로 노을(끝낸 직후 상태)로 맞춤
        S = pg.evaluate('wlZone.cur.spots'); fog = {}
        for i, (nm, at, yaw) in enumerate([('sunset', S['sunsetWL'], None), ('hill', S['hill'], 1.2), ('spawn', S['spawn'], 0.4), ('land', S['landW'], 2.6)]):
            pg.evaluate("([x,z,yaw])=>{const W=wlGame.mission.hero();W.position.x=x;W.position.z=z;if(yaw!=null){W.rotation.y=yaw;const I=wlGame.controls.input;I.cam.yaw=yaw+Math.PI;}const I=wlGame.controls.input;I.cam.pitch=.2;I.cam.dist=9;}", [at[0], at[1], yaw])
            pg.wait_for_timeout(2600); shot('dusk-' + nm); fog[nm] = stat(os.path.join(OUT, '%s-%s-dusk-%s.png' % (TAG, vk, nm)))
        R[vk]['노을'] = fog; R[vk]['오류'] = errs[:5]; c.close()
    b.close()
json.dump(R, open(os.path.join(OUT, TAG + '.json'), 'w'), ensure_ascii=False, indent=1)
print(json.dumps(R, ensure_ascii=False))
