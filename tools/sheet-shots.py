# -*- coding: utf-8 -*-
"""캐릭터 시트용 투명 컷 촬영 (2026-11-27) — 촬영 서버(8000)가 떠 있을 때 저장소 루트에서:
   python3 tools/sheet-shots.py [--only wl|friends] [--match 이름 일부] [--out assets/sheets/cuts]
   게임 속 실제 모델을 베이스캠프 기준 촬영과 같은 밝은 낮 조명(?shot) 아래에서 방(구역 메시)만 숨기고 찍는다.
   투명 배경: 같은 장면을 검은 바탕·흰 바탕으로 두 번 그려 알파를 계산(반투명·더하기 섞기인 숨방울 막도 그대로).
   모든 전신 컷은 같은 배율(PPM 화소/m)·같은 카메라(시야 14°·위로 0.08라디안)라 크기를 그대로 견줄 수 있다.
   결과: <out>/<이름>-<방향>.png(둘레를 잘라 냄) + <out>/cuts.json(컷마다 배율·발밑 선 자리 — 시트 조립 tools/sheet-build.py가 읽음). 소리 끔, 끝나면 닫음."""
import sys, os, io, json, base64
from PIL import Image, ImageChops, ImageMath
from playwright.sync_api import sync_playwright
A = sys.argv[1:]; arg = lambda k, d=None: A[A.index(k) + 1] if k in A else d
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); OUT = os.path.join(ROOT, arg('--out', 'assets/sheets/cuts')); os.makedirs(OUT, exist_ok=True)
ONLY = arg('--only'); MATCH = arg('--match'); PPM = 520; PI = 3.14159265
VIEWS = [('front', 0), ('34', .7), ('side', PI / 2), ('back', PI)]
JS = r"""
window.SH=(()=>{const S=wlShot,sc=S.scene,cam=S.camera,R=S.renderer,WL=S.WL,U=WL.userData;let T,AZ0,P0,cur=WL,world,mods={},extra=[];const made={};
  const inWL=o=>{for(let p=o;p;p=p.parent)if(p===WL)return true;return false;};
  return {
  async init(){T=await import('three');world=(await import('./js/worlds/infinite-space.js')).default;
    mods.mars=await import('./js/zones/space/martians.js');mods.cloud=await import('./js/zones/space/cloudfolk.js');mods.garden=await import('./js/zones/space/garden.js');
    AZ0=Object.values(wlZone.cur.areas)[0].camera.start[0];S.place(0,1.6,AZ0);
    U.setOutfit('ant');U.setHood('alien');U.setTint('hood',[world.talColors[0][1],world.talColors[0][2]]);U.setCombo(0);S.step(30);P0=WL.position.clone();
    sc.traverse(o=>{if((o.isMesh||o.isPoints||o.isSprite||o.isLine)&&!inWL(o))o.visible=false;}); /* 방·소품·표시는 숨기고 빛은 그대로 */
    return {combos:U.outfitCombos,tal:world.talColors,exprs:U.exprNames,items:world.items.map(i=>({id:i.id,name:i.name,icon:i.icon()})),neckIcon:world.firstMission.item.icon()};},
  wear(){world.firstMission.item.wear(WL,T);},
  bubble(on){const b=U.breathBubble;if(b){b.bubble.visible=b.rim.visible=on;}},
  wl(o){cur=WL;WL.visible=true;extra.forEach(e=>e.visible=false);if(o.combo!=null)U.setCombo(o.combo);if(o.tal!=null)U.setTint('hood',[world.talColors[o.tal][1],world.talColors[o.tal][2]]);
    U.riding=o.lift!=null?{y:P0.y+o.lift}:null;if(o.lift==null)WL.position.copy(P0);
    if(o.action){U.action=o.action;U.at=0;}if(o.jump)U.jumpReq=true;if(o.react)S.game.react.react(o.react,{sound:null,face:false,punch:false});
    S.step(o.steps||40);if(o.at!=null){U.at=o.at;S.step(1);}if(o.expr)U.setExpr(o.expr);if(o.prop)this.prop(o.prop,o);return {y:WL.position.y-P0.y};},
  prop(name,o){let g=made[name];if(!g){if(name==='umbrella')g=mods.cloud.makeUmbrella();else if(name==='boat')g=mods.cloud.makeIceBoat();g.traverse(m=>{m.frustumCulled=false;});sc.add(g);made[name]=g;extra.push(g);}
    g.visible=true;g.position.copy(WL.position);if(name==='boat'){g.position.y=P0.y+(o.boatY||0);}g.userData.follow=true;},
  reset(){U.riding=null;U.action='서기';U.at=0;U.setExpr('기본');WL.position.copy(P0);S.step(30);},
  friend(key,o={}){WL.visible=false;extra.forEach(e=>e.visible=false);let f=made[key];
    if(!f){const M=mods.mars,C=mods.cloud,Gd=mods.garden,lumpOf=parts=>{const g=new T.Group();g.add(M.lump(parts,true,3));return {root:g};};
      const BUN={kongkong:['#d8d8e0','#ff9eb3'],mongsil:['#e2d3bd','#9bd46b'],bosul:['#cdc6dc','#7fb6e8']};
      f=key==='bobo'?Gd.makeBobo():BUN[key]?Gd.makeBunny(...BUN[key]):key==='pipi'?M.makePipi():key==='dungdung'?M.makeDungdung():key==='geokkuri'?C.makeGeokkuri():key==='ddo'?C.makeDdo():key==='munge'?C.makeMunge():key==='toring'?C.makeToring():
        key==='sheep'?lumpOf(C.sheepParts(0,0,0,0,1)):key==='herdsheep'?lumpOf(C.herdSheepParts()):null;
      f.root.traverse(m=>{m.frustumCulled=false;});sc.add(f.root);made[key]=f;extra.push(f.root);}
    f.root.visible=true;f.root.position.copy(P0);cur=f.root;
    const dt=1/60;let t=o.t0||0;const run=(n,...a)=>{for(let i=0;i<n;i++){t+=dt;if(f.tick)f.tick(dt,t,...a);}};
    if(key==='bobo'){if(!f._n){f._n=1;}if(o.mode==='map'){f.tick(3-(f._mt||0)>0?3-(f._mt||0):0,3);f._mt=3;}else if(o.mode==='glass'){f.tick(6.6-(f._mt||0),7);f._mt=0;f.tick(3,10);f._mt2=1;}else f.tick(0,0);}
    else if(f.squash)f.squash(0,0);
    else if(f.tick){if(o.mode)run(o.steps||50,...[].concat(o.mode));else{f.tick(0,0,o.idle||'idle');for(let i=0;i<40;i++)f.tick(dt,0,o.idle||'idle');}}
    S.step(2);const bl=sc.children.find(m=>m.isMesh&&m.visible&&m.geometry&&m.geometry.type==='PlaneGeometry'&&!extra.includes(m));if(bl)bl.scale.multiplyScalar(({kongkong:.62,mongsil:.62,bosul:.62,pipi:.5,dungdung:.7,geokkuri:.95,ddo:.62,munge:2.0,toring:.8,sheep:.9,herdsheep:.8})[key]||1);return true;},
  /* 그리기: wm×hm 미터를 ppm 배율로. cy = 발밑에서 화면 가운데까지 높이, cx = 화면 가로로 옮김(미터). 검은 바탕·흰 바탕 두 장 */
  shot({az=0,el=.08,wm,hm,ppm,cy,cx=0,yaw0=0}){const w=Math.round(wm*ppm),h=Math.round(hm*ppm);R.setSize(w,h,false);const fov=14;cam.fov=fov;cam.aspect=w/h;cam.near=.1;cam.far=300;
    const d=hm/2/Math.tan(fov*Math.PI/360),dir=new T.Vector3(Math.sin(AZ0)*Math.cos(el),Math.sin(el),Math.cos(AZ0)*Math.cos(el)),right=new T.Vector3(Math.cos(AZ0),0,-Math.sin(AZ0));
    const tg=new T.Vector3(P0.x,P0.y+cy,P0.z).addScaledVector(right,cx);cam.position.copy(tg).addScaledVector(dir,d);cam.up.set(0,1,0);cam.lookAt(tg);cam.updateProjectionMatrix();cam.updateMatrixWorld(true);
    cur.rotation.y=AZ0-az+yaw0;extra.forEach(e=>{if(e.visible&&e.userData.follow)e.rotation.y=cur.rotation.y;});
    const out=[];for(const c of ['#000000','#ffffff']){sc.background=new T.Color(c);S.render();out.push(R.domElement.toDataURL('image/png'));}sc.background=null;return out;}
  };})();
"""
def img(u): return Image.open(io.BytesIO(base64.b64decode(u.split(',', 1)[1]))).convert('RGB')
def matte(b, w):
    d = ImageChops.subtract(w, b).split(); a = ImageChops.invert(ImageChops.lighter(ImageChops.lighter(d[0], d[1]), d[2]))
    ch = [ImageMath.lambda_eval(lambda _: _['convert'](_['min'](_['c'] * 255 / _['max'](_['a'], 1), 255), 'L'), c=c, a=a) for c in b.split()]
    return Image.merge('RGBA', ch + [a])
MAN = {}; mp = os.path.join(OUT, 'cuts.json')
if os.path.exists(mp): MAN = json.load(open(mp, encoding='utf-8'))
def save(pg, name, o, note=None):
    if MATCH and MATCH not in name: return
    hm = o['hm']; ppm = o.get('ppm', PPM); base = o.get('base', .14); o2 = dict(o, ppm=ppm, cy=o.get('cy', hm / 2 - base)); b, w = pg.evaluate('o=>SH.shot(o)', o2)
    im = matte(img(b), img(w)); bb = im.getchannel('A').point(lambda v: 255 if v > 6 else 0).getbbox()
    if not bb: print('빈 그림', name); return
    pad = 6; x0, y0, x1, y1 = max(0, bb[0] - pad), max(0, bb[1] - pad), min(im.width, bb[2] + pad), min(im.height, bb[3] + pad)
    edge = [k for k, v in zip('왼위오아', [bb[0] <= 0, bb[1] <= 0, bb[2] >= im.width, bb[3] >= im.height]) if v]
    ground = im.height / 2 + o2['cy'] * ppm  # 발밑 선(잘라 내기 전 화소) — 카메라가 조금 위에서 봐 정확히는 가운데 깊이 기준
    im.crop((x0, y0, x1, y1)).save(os.path.join(OUT, name + '.png'))
    MAN[name] = {'ppm': ppm, 'w': x1 - x0, 'h': y1 - y0, 'ground': round(ground - y0, 1), 'cx': round(im.width / 2 - o2.get('cx', 0) * ppm - x0, 1), 'top_m': round((ground - bb[1]) / ppm, 3), 'cut': edge, 'note': note or ''}
    if edge: print('  잘림!', name, edge)
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio']); pg = b.new_context(viewport={'width': 800, 'height': 800}).new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    pg.goto('http://localhost:8000/?shot'); pg.wait_for_function('window.wlShot', timeout=120000); pg.wait_for_timeout(600); pg.evaluate(JS); info = pg.evaluate('SH.init()')
    json.dump(info, open(os.path.join(OUT, 'info.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    FULL = dict(wm=2.0, hm=2.2)
    if ONLY != 'friends':
        W = lambda o: pg.evaluate('o=>SH.wl(o)', o)
        # 숨방울을 받기 전(탈만) — 탈 색·옷 조합 비교는 받은 뒤 모습으로 찍으므로 여기서는 한 장만
        W({}); save(pg, 'wonderloop-space-nobubble-front', dict(FULL, az=0), '숨방울 목걸이를 받기 전')
        pg.evaluate('SH.wear()'); W({})
        for v, az in VIEWS: save(pg, 'wonderloop-space-' + v, dict(FULL, az=az))
        for i, c in enumerate(info['combos']):
            W({'combo': i}); save(pg, 'wonderloop-space-combo%d-front' % (i + 1), dict(FULL, az=0), c['name']); save(pg, 'wonderloop-space-combo%d-34' % (i + 1), dict(FULL, az=.7), c['name'])
        W({'combo': 0})
        for i, t in enumerate(info['tal']):
            W({'tal': i}); save(pg, 'wonderloop-space-tal%d-34' % (i + 1), dict(FULL, az=.7), t[0])
            save(pg, 'wonderloop-space-tal%d-close' % (i + 1), dict(wm=1.9, hm=1.5, ppm=900, az=.32, cy=1.02, el=.04), t[0] + ' 탈 확대')
        W({'tal': 0})
        save(pg, 'wonderloop-space-necklace-close', dict(wm=1.0, hm=.9, ppm=1500, az=.25, cy=.5, el=.05), '숨방울 목걸이')
        save(pg, 'wonderloop-space-pack-close', dict(wm=1.1, hm=1.0, ppm=1300, az=PI, cy=.5, el=.05), '배낭과 나침반 키링')
        pg.evaluate('SH.bubble(false)'); save(pg, 'wonderloop-space-hood-nobubble-close', dict(wm=1.9, hm=1.5, ppm=900, az=.32, cy=1.02, el=.04), '숨방울 막 끔'); pg.evaluate('SH.bubble(true)')
        for e in info['exprs']:
            W({'expr': e, 'steps': 4}); save(pg, 'wonderloop-space-expr-' + e.replace(' ', ''), dict(wm=1.5, hm=1.45, ppm=760, az=.22, cy=.98, el=.03), e)
        pg.evaluate('SH.reset()')
        ACTS = [('jump', '둥실 뛰기', {'jump': 1, 'steps': 22}, '기본', dict(wm=2.0, hm=3.4)),
                ('tail', '별똥별 꼬리 잡기', {'action': '꼬리 잡기', 'lift': .7, 'steps': 50}, '반짝 신남', dict(wm=2.0, hm=3.0)),
                ('arms', '두 팔 벌리고 떠다니기', {'action': '팔 벌리기', 'lift': .7, 'steps': 50}, '반짝 신남', dict(wm=2.4, hm=3.0)),
                ('float', '둥실 헤엄치기', {'action': '둥실', 'lift': .7, 'steps': 60}, '반짝 신남', dict(wm=2.4, hm=3.0)),
                ('pound-up', '떡메 찧기 — 들기', {'action': '떡메 찧기', 'steps': 26}, '기본', dict(wm=2.2, hm=2.4)),
                ('pound-down', '떡메 찧기 — 내려치기', {'action': '떡메 찧기', 'steps': 37}, '기본', dict(wm=2.2, hm=2.4)),
                ('toss', '고리 던지기', {'action': '뿌리기', 'steps': 75}, '기본', dict(wm=2.2, hm=2.4)),
                ('umbrella', '우산 들고 내려오기', {'action': '우산 잡기', 'lift': .7, 'steps': 50, 'prop': 'umbrella'}, '기본', dict(wm=3.4, hm=3.6)),
                ('hop', '폴짝', {'react': 'hop', 'steps': 14}, '신남', dict(wm=2.2, hm=3.0)),
                ('wave', '손 흔들기', {'action': '손 흔들기', 'steps': 50}, '기쁨', dict(wm=2.2, hm=2.4)),
                ('sit', '앉기', {'action': '앉기', 'steps': 50}, '기본', dict(wm=2.4, hm=2.2))]
        for key, nm, o, ex, fr in ACTS:
            pg.evaluate('SH.reset()'); r = W(dict(o, expr=ex)); save(pg, 'wonderloop-space-act-%s' % key, dict(fr, az=.55), '%s|표정: %s|떠 있는 높이 %.2fm' % (nm, ex, r['y']))
        pg.evaluate('SH.reset()'); W({}); save(pg, 'wonderloop-space-lineup', dict(FULL, az=0), '키 비교용 정면')
    if ONLY != 'wl':
        if ONLY == 'friends': pg.evaluate('SH.wear()')
        F = lambda k, o=None: pg.evaluate('([k,o])=>SH.friend(k,o||{})', [k, o])
        BIG = dict(wm=2.6, hm=2.7); FR = lambda k: dict(wm=4.4, hm=3.0, base=.5) if k == 'munge' else BIG  # 뭉게 문지기는 폭 3m 넘는 구름 덩어리 — 아래 덩이는 땅(구름)에 조금 묻혀 있음
        for k in ['bobo', 'kongkong', 'mongsil', 'bosul', 'pipi', 'dungdung', 'geokkuri', 'ddo', 'munge', 'toring']:
            F(k, {'idle': 'sleep'} if k == 'munge' else None)
            for v, az in VIEWS: save(pg, '%s-%s' % (k, v), dict(FR(k), az=az))
        VAR = [('bobo', 'map', {'mode': 'map'}, '지도 펼쳐 보기', .5), ('bobo', 'glass', {'mode': 'glass'}, '망원경 안경 고쳐 쓰기', .5),
               ('pipi', 'call', {'mode': 'call'}, '부르기', .5), ('pipi', 'give', {'mode': 'give'}, '두 손으로 내밀기', .5), ('pipi', 'wave', {'mode': 'wave', 'steps': 46}, '손 흔들기', .4),
               ('dungdung', 'wave', {'mode': 'wave', 'steps': 46}, '손 흔들기', .4), ('dungdung', 'talk', {'mode': 'talk'}, '말하기', .4),
               ('geokkuri', 'wave', {'mode': 'wave'}, '손 흔들기', .4), ('geokkuri', 'walk', {'mode': 'walk', 'steps': 33}, '뒷걸음 걷기', .5),
               ('munge', 'awake', {'mode': 'ask'}, '뜬 눈(눈뜸)', 0), ('munge', 'warn', {'mode': 'warn', 'steps': 30}, '미리 알림(들썩)', 0),
               ('toring', 'wave', {'mode': 'wave'}, '손 흔들기', .4), ('toring', 'point', {'mode': 'point'}, '가리키기', .4), ('toring', 'sit', {'mode': 'sit'}, '앉기', .4),
               ('ddo', 'talk', {'mode': 'talk', 'steps': 13}, '통통 뛰며 말하기', .4)]
        for k, v, o, nm, az in VAR: F(k, o); save(pg, '%s-%s' % (k, v), dict(FR(k), az=az), nm)
        F('dungdung'); save(pg, 'dungdung-face', dict(wm=1.3, hm=1.2, ppm=1000, az=.3, cy=1.45, el=.03), '늘 내려온 눈꺼풀')
        F('pipi'); save(pg, 'pipi-face', dict(wm=1.0, hm=.9, ppm=1300, az=.3, cy=.72, el=.03), '아몬드 눈·별빛')
        F('toring'); save(pg, 'toring-ring', dict(wm=1.3, hm=1.1, ppm=1100, az=.4, cy=1.0, el=.22), '머리 위 얼음 고리')
        F('geokkuri'); save(pg, 'geokkuri-hat', dict(wm=1.3, hm=1.1, ppm=1100, az=.4, cy=1.0, el=.3), '해시계 모자')
        F('munge', {'idle': 'sleep'}); save(pg, 'munge-face-sleep', dict(wm=3.2, hm=2.0, ppm=640, az=.1, cy=1.05, el=.03), '감은 눈')
        F('munge', {'mode': 'ask'}); save(pg, 'munge-face-awake', dict(wm=3.2, hm=2.0, ppm=640, az=.1, cy=1.05, el=.03), '뜬 눈')
        for k in ['sheep', 'herdsheep']:
            F(k)
            for v, az in VIEWS: save(pg, '%s-%s' % (k, v), dict(wm=1.8, hm=1.6, az=az))
    json.dump(MAN, open(mp, 'w', encoding='utf-8'), ensure_ascii=False, indent=1, sort_keys=True)
    print('컷', len(MAN), '오류', errs[:5]); b.close()
