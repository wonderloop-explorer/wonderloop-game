# -*- coding: utf-8 -*-
"""대화 카메라: 말하는 상대 얼굴이 보이는지 · 카메라 앞을 가리는 소품이 없는지 전후 캡처 (2026-11-11) — 서버가 떠 있을 때 저장소 루트에서:
   python3 tools/talk-face-shots.py --tag before|after [--port 8000] [--only pc,phone,632]
   크기 셋(PC 1280×720 · 휴대폰 세로 390×844 터치 · 1280×632)마다 아기 토끼 셋·보름 할아버지(회색 정원), 삐삐·둥둥(화성)에게
   실제 입력(E 키 / 말 걸기 단추)으로 말을 걸고 2초 뒤 한 장 + 잰 값:
   - 상대 얼굴(npcFace)·원더룹 얼굴(heroFace): 몸이 보는 방향과 카메라 방향의 내적(수평) — 1 정면 · 0.7 = 3/4 · 0 옆모습 · 음수 뒷모습
   - 가리는 것(block): 카메라에서 두 사람 몸(발목~머리, 세 줄씩 15점)으로 쏜 시선이 그 앞에서 다른 물체에 막힌 점의 비율(0~1)과 막은 물체 이름.
     흐려진 소품(정점 wlPiece 번호의 흐림 값이 0.5 아래)은 막은 것으로 세지 않음. 인물·땅·하늘·안내 표시는 뺌.
   - inside(두 사람 발~머리 위가 화면 안) · mid70(가로 0.15~0.85)
   결과 docs/compare/talk-face/<tag>-<크기>-<이름>.png, <tag>.json. 소리 끔, 끝나면 닫음."""
import json, os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
a = sys.argv[1:]; arg = lambda k, d: a[a.index(k) + 1] if k in a else d
TAG = arg('--tag', 'after'); PORT = arg('--port', '8000'); ONLY = arg('--only', 'pc,phone,632').split(',')
OUT = os.path.join(ROOT, 'docs/compare/talk-face'); os.makedirs(OUT, exist_ok=True)
VIEWS = {'pc': dict(viewport={'width': 1280, 'height': 720}), '632': dict(viewport={'width': 1280, 'height': 632}),
         'phone': dict(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)}
MEASURE = """async (name)=>{const T=await import('three');const G=wlGame,W=G.mission.hero(),cam=G.view.camera,n=G.dialog.findNPC(name),B=window.__bend;const V=T.Vector3;
 const pr=(x,y,z)=>{const b=B?B.bentPos({x,y,z}):{x,y,z};const q=new V(b.x,b.y,b.z).project(cam);return [+(((q.x+1)/2)).toFixed(3),+(((1-q.y)/2)).toFixed(3)];};
 const P=W.position,np=new V();n.root.getWorldPosition(np);
 const dot=(o,p)=>{const fx=Math.sin(o.rotation.y),fz=Math.cos(o.rotation.y);let cx=cam.position.x-p.x,cz=cam.position.z-p.z;const l=Math.hypot(cx,cz)||1;return +((fx*cx+fz*cz)/l).toFixed(2);};
 const hN=n.bubbleY||1.4,pts=[pr(P.x,P.y,P.z),pr(P.x,P.y+1.6,P.z),pr(np.x,np.y,np.z),pr(np.x,np.y+hN,np.z)];
 let scene=W;while(scene.parent)scene=scene.parent;const skip=o=>{for(let q=o;q;q=q.parent){if(q===W||q===n.root)return true;const nm=(q.name||'');if(/sky|star|ground|floor|blob|halo|glow-pool|goal|trail/i.test(nm))return true;}return false;};
 const rc=new T.Raycaster();rc.layers.set(0);rc.camera=cam;const right=new V().subVectors(np,P).cross(new V(0,1,0)).normalize();const blockers={};let tot=0,hitN=0;
 const cast=(c,h,w)=>{for(const u of [-1,0,1])for(const f of [.12,.35,.58,.8,.97]){const t=new V(c.x+right.x*w*u,c.y+h*f,c.z+right.z*w*u),d=new V().subVectors(t,cam.position),L=d.length();rc.set(cam.position,d.divideScalar(L));rc.far=L-.35;tot++;
   const hs=rc.intersectObjects(scene.children,true);for(const h of hs){const o=h.object;if(!o.visible||skip(o)||o.isSprite||o.isPoints||o.isLine)continue;let vis=true;for(let q=o;q;q=q.parent)if(q.visible===false)vis=false;if(!vis)continue;
     const m=Array.isArray(o.material)?o.material[0]:o.material;if(!m||m.opacity<.5||m.colorWrite===false||m.blending===T.AdditiveBlending)continue;if(Math.abs(h.point.y-(B?h.point.y:h.point.y))>9)continue;
     const pa=o.geometry.attributes.wlPiece,fd=o.userData.wlFade;if(pa&&fd&&h.face){const id=Math.round(pa.getX(h.face.a));if(id>0&&fd[id]<.5)continue;}
     if(h.face&&h.face.normal.y>.8&&h.point.y<Math.min(P.y,np.y)+.25)continue; /* 땅 */
     const nm=o.name||(o.parent&&o.parent.name)||o.type;blockers[nm]=(blockers[nm]||0)+1;hitN++;break;}}};
 cast(P,1.5,.3);cast(np,hN,.2);
 const hb=wlPhoto.body(cam),r=hb&&hb.rect;
 return {npcFace:dot(n.root,np),heroFace:dot(W,P),dist:+cam.position.distanceTo(P).toFixed(1),inside:pts.every(p=>p[0]>.02&&p[0]<.98&&p[1]>.02&&p[1]<.98),mid70:pts.every(p=>p[0]>=.15&&p[0]<=.85),block:+(hitN/tot).toFixed(2),by:blockers,heroH:r?+(r[3]-r[1]).toFixed(2):null,talking:G.dialog.talking()};}"""
WHO = [('space-garden', ['have:infinite-space:necklace', 'space:demo', 'meet:infinite-space:bunnies', 'meet:infinite-space:bobo'], [('kongkong', '아기 토끼 콩콩'), ('mongsil', '아기 토끼 몽실'), ('bosul', '아기 토끼 보슬'), ('bobo', '보름 할아버지')]),
       ('space-mars', ['have:infinite-space:necklace', 'mars:met', 'mars:call', 'mars:recA', 'mars:recB', 'mars:told', 'clear:space-mars'], [('pipi', '삐삐'), ('dung', '둥둥')])]
R = {}
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'])
    for vk in ONLY:
        o = VIEWS[vk]; touch = bool(o.get('has_touch')); c = b.new_context(**o); pg = c.new_page(); errs = []; R[vk] = {}
        pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
        for zone, flags, who in WHO:
            base = 'http://localhost:' + PORT + '/?world=infinite-space&notitle&zone=' + zone + ('&time=0' if zone != 'space-mars' else '') + ('&quality=mobile' if touch else '')
            pg.goto(base); pg.wait_for_function('window.wlGame&&wlGame.state', timeout=120000); pg.wait_for_timeout(1200); pg.wait_for_function('window.wlGame&&wlGame.state', timeout=120000)
            pg.evaluate("f=>{localStorage.setItem('wl-help-seen','1');f.forEach(k=>wlGame.state.setFlag(k,true))}", flags); pg.reload()
            pg.wait_for_function('window.wlZone&&wlZone.cur&&wlZone.cur.spots&&window.wlPhoto', timeout=120000)
            pg.evaluate("(async()=>{const e=performance.getEntriesByType('resource').find(e=>/js\\/game\\/bend\\.js/.test(e.name));if(e)window.__bend=await import(e.name);})()"); pg.wait_for_timeout(2500)
            for _ in range(6):
                if pg.evaluate('wlGame.ui.cardShown()') or pg.evaluate('wlGame.dialog.talking()'): pg.keyboard.press('Escape'); pg.evaluate('wlGame.dialog.act()'); pg.wait_for_timeout(700)
            for key, name in who:
                for _ in range(8):  # 상대 쪽으로 걸어가 1.1m 앞에 설 때까지(뛰어 달아나면 다시)
                    pg.evaluate("n=>{const m=wlGame.dialog.findNPC(n),W=wlGame.mission.hero(),v=new (W.position.constructor)();m.root.getWorldPosition(v);const P=W.position;let dx=P.x-v.x,dz=P.z-v.z;const l=Math.hypot(dx,dz)||1;if(l>7){P.x=v.x+dx/l*5;P.z=v.z+dz/l*5;}W.userData.walkTo(v.x+dx/l*1.1,v.z+dz/l*1.1);}", name)
                    pg.wait_for_timeout(900)
                    if pg.evaluate("n=>{const m=wlGame.dialog.findNPC(n),W=wlGame.mission.hero(),v=new (W.position.constructor)();m.root.getWorldPosition(v);return Math.hypot(W.position.x-v.x,W.position.z-v.z)<1.35&&!W.userData.isWalking()}", name): break
                pg.wait_for_timeout(900)
                if touch:
                    try: pg.locator('#wlAct').tap(timeout=1500)
                    except Exception: pg.evaluate('wlGame.dialog.act()')
                else: pg.keyboard.press('e')
                pg.wait_for_timeout(500)
                if not pg.evaluate('wlGame.dialog.talking()'): pg.evaluate("n=>{wlGame.dialog.startTalk(wlGame.dialog.findNPC(n));0}", name)
                pg.wait_for_timeout(2000); pg.screenshot(path=os.path.join(OUT, '%s-%s-%s.png' % (TAG, vk, key))); R[vk][key] = pg.evaluate(MEASURE, name)
                for _ in range(10):
                    if not pg.evaluate('wlGame.dialog.talking()') and not pg.evaluate('wlGame.ui.cardShown()'): break
                    pg.keyboard.press('Escape'); pg.evaluate('wlGame.dialog.act()'); pg.wait_for_timeout(500)
                pg.wait_for_timeout(1300)
        R[vk]['오류'] = errs[:5]; c.close()
    b.close()
json.dump(R, open(os.path.join(OUT, TAG + '.json'), 'w'), ensure_ascii=False, indent=1)
for vk, r in R.items():
    for k, m in r.items():
        if k != '오류': print(vk, k, '상대 얼굴', m['npcFace'], '원더룹 얼굴', m['heroFace'], '가림', m['block'], m['by'], '안', m['inside'], '가운데70', m['mid70'], '거리', m['dist'])
    print(vk, '오류', r['오류'])
