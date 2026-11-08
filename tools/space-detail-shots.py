# -*- coding: utf-8 -*-
"""무한 우주 회색 정원 가까이 보기 (2026-11-08) — 촬영 서버(8000)가 떠 있을 때 저장소 루트에서:
   python3 tools/space-detail-shots.py --tag before|after [--out docs/compare/space-detail] [--phone]
   할아버지 집(문 정면·창문 옆), 보름 할아버지(정면·옆 — 지도를 펴지 않은 순간), 아기 토끼(정면·옆)를 같은 자리에서 찍고,
   안내 문구(설명 띠)가 떠 있는 화면(그늘 분화구 문구)을 찍어 둘레 단추(할 일·가방·메뉴)와 겹치는지 상자로 잰다.
   카메라는 view.hold(snap)로 정확한 자리에 두고, 찍는 순간은 게임을 멈춘다(배속 0에 가깝게). 소리 끔, 끝나면 닫음."""
import json, os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
a = sys.argv[1:]; PHONE = '--phone' in a
TAG = a[a.index('--tag') + 1] if '--tag' in a else 'run'
OUT = os.path.join(ROOT, a[a.index('--out') + 1] if '--out' in a else 'docs/compare/space-detail'); os.makedirs(OUT, exist_ok=True)
dev = 'phone' if PHONE else 'pc'; R = {'tag': TAG, 'dev': dev}
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'])
    o = dict(viewport={'width': 390, 'height': 844}, device_scale_factor=3, is_mobile=True, has_touch=True) if PHONE else dict(viewport={'width': 1280, 'height': 720})
    pg = b.new_page(**o); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    pg.goto('http://localhost:8000/?world=infinite-space&zone=space-garden&notitle' + ('&quality=mobile' if PHONE or os.environ.get('MQ') else '')); pg.evaluate('localStorage.clear()'); pg.reload()
    pg.wait_for_function('window.wlZone&&wlZone.cur&&wlZone.cur.spots', timeout=120000); pg.wait_for_timeout(2500)
    if not PHONE:
        # 원더룹은 멀리(비켜 서 있게), 카메라는 window._cam이 주는 자리 그대로(snap)
        # 작은 행성은 원더룹 자리를 중심으로 땅을 휘어 그린다 → 원더룹을 카메라 바로 뒤(화면 밖)에 두고, 보는 점은 휜 만큼(거리²/2R) 낮춘다
        pg.evaluate("""()=>{window._cam=null;const R=wlZone.cur.spots.R;window._put=c=>{if(!c)return null;const W=wlGame.mission.hero(),dx=c.from[0]-c.at[0],dz=c.from[2]-c.at[2],d=Math.hypot(dx,dz);
          W.position.x=c.from[0]+dx/d*.9;W.position.z=c.from[2]+dz/d*.9;const dd=d+.9;return {at:[c.at[0],c.at[1]-dd*dd/(2*R),c.at[2]],from:[c.from[0],c.from[1]-.81/(2*R),c.from[2]]};};
          wlGame.view.hold(()=>window._cam,{snap:true});}""")
        targets = pg.evaluate("""(()=>{const Z=wlZone.cur.root,bo=Z.getObjectByName('bobo');const T={};
          const hut=wlZone.cur.spots.hut;if(hut){const [x,z,y,f]=hut,fx=Math.sin(f),fz=Math.cos(f),sd=f-.62;
            T['house-front']={at:[x+fx*1.3,y+.7,z+fz*1.3],from:[x+fx*4.4,y+1.15,z+fz*4.4]};
            T['house-side']={at:[x+Math.sin(sd)*1.4,y+.75,z+Math.cos(sd)*1.4],from:[x+Math.sin(sd+.45)*4.2,y+1.0,z+Math.cos(sd+.45)*4.2]};}
          const p=bo.position,r=bo.rotation.y;T['bobo-front']={at:[p.x,p.y+.6,p.z],from:[p.x+Math.sin(r)*1.9,p.y+.75,p.z+Math.cos(r)*1.9]};
          T['bobo-side']={at:[p.x,p.y+.6,p.z],from:[p.x+Math.sin(r-1.2)*1.9,p.y+.75,p.z+Math.cos(r-1.2)*1.9]};return T;})()""")
        for name, cam in targets.items():
            pg.evaluate("c=>{window.wlTimeScale=1;window._cam=_put(c);}", cam); pg.wait_for_timeout(900)
            if name.startswith('bobo'):  # 지도를 펴지 않은 순간(배가 보이게)
                for _ in range(80):
                    if pg.evaluate("(()=>{const bo=wlZone.cur.root.getObjectByName('bobo');return !bo.children.some(c=>c.visible&&Math.abs(c.rotation.x+.5)<.01)})()"): break
                    pg.wait_for_timeout(100)
            pg.evaluate("window.wlTimeScale=1e-6"); pg.wait_for_timeout(300)
            pg.screenshot(path=os.path.join(OUT, f'{TAG}-{name}.png'))
        # 아기 토끼: 첫 번째 토끼 앞·옆(멈춘 채)
        pg.evaluate("window.wlTimeScale=1"); pg.wait_for_timeout(400); pg.evaluate("window.wlTimeScale=1e-6"); pg.wait_for_timeout(200)
        for name, yaw in [('bunny-front', 0), ('bunny-side', 1.1)]:
            pg.evaluate("""y=>{const Z=wlZone.cur.root;let bn=null;Z.traverse(o=>{if(!bn&&o.isGroup&&o.children.length===1&&o.scale.x>.8&&o.scale.x<.82)bn=o;});const p=bn.position,r=bn.rotation.y+y;
              window._cam=_put({at:[p.x,p.y+.45,p.z],from:[p.x+Math.sin(r)*1.5,p.y+.6,p.z+Math.cos(r)*1.5]});}""", yaw)
            pg.wait_for_timeout(400); pg.screenshot(path=os.path.join(OUT, f'{TAG}-{name}.png'))
        pg.evaluate("window.wlTimeScale=1;window._cam=null;wlGame.view.hold(null)"); pg.wait_for_timeout(800)
    # 안내 문구(설명 띠): 그늘 분화구 문구를 띄우고 둘레 단추와 겹치는지
    pg.evaluate("wlGame.ui.setQuest('➜보름 할아버지의 발자국을 따라 그늘 분화구로 가요')"); pg.wait_for_timeout(300)  # 할 일 안내가 떠 있는 실제 상황(휴대폰은 줄바꿈 → 단추 줄이 내려감)
    pg.evaluate("wlGame.ui.toast('햇빛이 안 드는 그늘 분화구는 영하 160도 — 서리가 그대로 얼어 있어요',30)"); pg.wait_for_timeout(700)
    R['toast'] = pg.evaluate("""(()=>{const box=id=>{const e=document.getElementById(id);if(!e)return null;const s=getComputedStyle(e);if(s.display==='none'||s.visibility==='hidden'||+s.opacity===0)return null;const r=e.getBoundingClientRect();return r.width&&r.height?[r.left,r.top,r.right,r.bottom].map(Math.round):null;};
      const t=box('wlToast'),o={toast:t,vw:innerWidth},hit=(a,b)=>a&&b&&a[0]<b[2]&&b[0]<a[2]&&a[1]<b[3]&&b[1]<a[3];o.overlap=[];
      for(const id of ['wlQuest','wlItems','wlMenu','wlTool','dbgBtn','wlPrompt']){const r=box(id);o[id]=r;if(hit(t,r))o.overlap.push(id);}
      o.offscreen=t?(t[0]<0||t[2]>innerWidth):null;return o;})()""")
    pg.screenshot(path=os.path.join(OUT, f'{TAG}-{dev}-toast.png'))
    R['오류'] = errs; b.close()
json.dump(R, open(os.path.join(OUT, f'{TAG}-{dev}.json'), 'w'), ensure_ascii=False, indent=1)
print(json.dumps(R, ensure_ascii=False, indent=1))
