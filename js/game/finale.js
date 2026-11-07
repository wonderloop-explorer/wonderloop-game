/* 원더룹 — 세계의 끝: 큰 획득 → 귀환 비행 → 미니어처 하이라이트 → 엔딩 화면 (2026-11-06, 공통 틀 8단계 — 규칙 docs/series-rules.md '엔딩')
   세계 설정 finale(형식은 js/worlds/antvillage.js 맨 위 주석)으로 채운다. 개미굴 원본(antvillage) 여왕개미 나침반·날개개미 비행·엔딩 화면에서 옮긴 것.
   ① bigGet({from|giver, model, card, to, onDone}) 큰 획득 — 일반 획득(game/itemget)보다 길게(약 5.6초) · 화면을 누르면 다음 단계로:
      빛기둥(0.7초) → 선물이 통 튀어나와(0.9초, 원본 나침반 크기 튐 1+2.7(k−1)³+1.7(k−1)²) 떠올라 천천히 돌며 반짝임(1초 — 뒤에 빛살 14갈래가 돌고 빛무리가 숨쉼, 바늘이 있으면 빙글)
      → 원더룹 앞으로 포물선을 그리며 내려옴(1.9초, 원본) → 닿는 순간 반짝이 22개·big-get 소리·짧은 흔들림, 원더룹 기쁨 + 얼굴 클로즈업 → 1.1초 뒤 큰 획득 창(원본 여왕개미의 보물 창 — 도감 카드 모양).
      창을 닫으면 선물이 원더룹 쪽으로 작아지며 들어가고(to: 'hand' 손에 쥠 held() · 'bag'·'charm' 배낭) onDone.
      카메라: 원본처럼 원더룹 뒤 비스듬히에서 원더룹과 선물을 함께 잡는다(원본 QCAM). 원본은 나침반이 여왕개미 얼굴에 반쯤 가렸다 →
        선물이 처음 뜨는 자리를 카메라에서 레이캐스트로 확인해 가리는 물체가 있으면 주는 주민 위로 더 높이 → 옆으로 옮겨 띄운다(가려지지 않는 자리를 고름).
   ② flight({vehicle, path, speed, seat, onEnd}) 귀환 비행 — 탈것에 앉아 정해진 길로 날아오른다(game/ride). 카메라는 처음 각도만 잡아 주고 플레이어가 돌리고 확대한다(원본 그대로).
      vehicle.userData.tick(dt)이 있으면 매 프레임(날갯짓).
   ③ miniature({keys, fov, onEnd}) 미니어처 하이라이트 — 세계를 작은 디오라마처럼 내려다보며(좁은 시야 + 위아래 흐림 = 틸트 시프트) 네 스테이지와 쉼터를 차례로 천천히 지나감.
      keys: [{label, at:[x,y,z] 보는 점, from:[x,y,z] 카메라, sec}] — 사이는 부드러운 곡선. 세계 음악과 공간음 그대로, '건너뛰기'나 화면 누르기로 끝. 1분 안팎(sec 합).
      miniaturePath(keys,{fps}) = 같은 카메라 길을 프레임마다 [{t, from, at, fov}]로 — 유튜브 앰비언스 영상(09 영상 캡처 대본)에 그대로 쓴다. 톱니 메뉴 '미니어처 경로 저장'이 JSON으로 내려받음.
   ④ ending(W) 엔딩 화면 — 원본 #ending 레이아웃·디자인 그대로(아래 그라데이션, 리본, 큰 제목, 행진 줄, 문구 2.2초 뒤, 단추 7초 뒤):
      리본 '탐험가 원더룹의 대모험'(시작 타이틀과 같게), 큰 제목 '{세계 name} 탐방 끝'(세계 letterColors·titleDeco·parade — 시작 타이틀과 같은 그리기), '다음 이야기에서 만나요',
      'YouTube @wonderloop_world', 단추 '▶ 원더룹 채널 보러 가기'(새 창)·'인증서 보기'(세계 cert가 있을 때)·'처음부터 다시 하기' + '가방 보기'(모은 아이템·카드 다시 구경 — game/front 가방).
      배경은 세계 finale.endBackdrop(없으면 backdrop)을 시작 타이틀처럼 천천히 도는 카메라 루프. 조작·화면 구석 표시는 숨긴다.
   흐름(엔딩 순서): bigGet → flight → miniature → ending. 시험: 톱니 메뉴 '큰 획득 시험'·'귀환 비행 시험'·'미니어처 시험'·'엔딩 화면 시험'·'엔딩 순서 시험'(game/devstory). */
import {storybook} from './storybook.js';
import * as THREE from 'three';
import {block,cue} from './core.js';
import {sfx,zoneMusic,songs} from './sound.js';
import {itemCard} from './ui.js';
import {react} from './react.js';
import {ride} from './ride.js';
import {backdropAt,glyphize,RIBBON} from './titlescreen.js';
import {openBag,playerName} from './front.js';
import {resetAll} from './state.js';
let C=null,BG=null,MINI=null,END=null,STAR=null,RAYS=null,HALO=null;
const _v=new THREE.Vector3(),_w=new THREE.Vector3();
const narrowK=()=>{const a=C&&C.camera&&C.camera.aspect||1.6;return a<1.25?Math.min(2,1.25/a):1;};
function initFinale(c){C=c;}
const SHOT=/[?&]shot(?=&|=|$)/.test(location.search);
function canvasTex(f,n=128){const c=document.createElement('canvas');c.width=c.height=n;f(c.getContext('2d'),n);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
function texs(){if(STAR)return;
  STAR=canvasTex((g)=>{g.fillStyle='#fff3c0';g.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,r=i%2?7:30;g.lineTo(32+Math.cos(a)*r,32+Math.sin(a)*r);}g.fill();},64);
  RAYS=canvasTex((g,n)=>{g.translate(n/2,n/2);for(let i=0;i<14;i++){g.rotate(Math.PI*2/14);const gr=g.createLinearGradient(0,0,0,-n/2);gr.addColorStop(0,'rgba(255,236,160,.9)');gr.addColorStop(1,'rgba(255,236,160,0)');g.fillStyle=gr;g.beginPath();g.moveTo(-9,0);g.lineTo(0,-n/2);g.lineTo(9,0);g.fill();}},256); // 원본 RAY_TEX
  HALO=canvasTex((g,n)=>{const gr=g.createRadialGradient(n/2,n/2,0,n/2,n/2,n/2);gr.addColorStop(0,'rgba(255,224,138,.9)');gr.addColorStop(.4,'rgba(255,224,138,.35)');gr.addColorStop(1,'rgba(255,224,138,0)');g.fillStyle=gr;g.fillRect(0,0,n,n);});}
const add=(m)=>new THREE.SpriteMaterial({map:m,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false});
let seed=4242;const rnd=()=>((seed=(seed*1103515245+12345)&0x7fffffff)/0x7fffffff),rr=(a,b)=>a+(b-a)*rnd();
/* ---------- ① 큰 획득 ---------- */
let BG_CSS=false;
function revealCard({kicker='',title='',text='',img=null,btn='받았어요'}){if(!BG_CSS){BG_CSS=true;const st=document.createElement('style');st.textContent=`
#wlReveal{position:fixed;inset:0;display:grid;place-items:center;padding:1.2rem;box-sizing:border-box;background:rgba(30,14,36,.5);z-index:34}
#wlReveal .dcard{background:var(--panel,rgba(255,246,234,.95));color:var(--ink,#3e2834);border-radius:22px;padding:1.4rem 1.4rem 1.2rem;width:min(22rem,100%);max-height:calc(100vh - 2.4rem);overflow:auto;box-sizing:border-box;text-align:center;box-shadow:0 18px 50px rgba(30,14,36,.5);animation:wlRvRise .45s cubic-bezier(.2,1.4,.4,1)}
#wlReveal .k2{display:inline-block;margin:0;background:#f2b63c;color:#3e2834;border-radius:999px;padding:.15rem .7rem;font-size:.85rem;font-family:"Jua",sans-serif}
#wlReveal img{width:62%;height:auto;aspect-ratio:1;object-fit:contain;display:block;margin:.6rem auto 0}#wlReveal img:not([src]){display:none}
#wlReveal h2{margin:.5rem 0 .4rem;font-size:1.6rem;font-weight:400;font-family:"Jua",sans-serif}#wlReveal .fact{margin:0;font-size:1.05rem;line-height:1.7;word-break:keep-all;font-family:"Gowun Dodum",sans-serif}
#wlReveal button{display:block;width:100%;margin-top:.9rem;border:0;border-radius:14px;background:#3f9fa0;color:#fffaf2;font:inherit;font-family:"Jua",sans-serif;font-size:1.05rem;padding:.75rem 1.2rem;cursor:pointer}
#wlReveal button:focus-visible{outline:3px solid #3e2834;outline-offset:3px}
@keyframes wlRvRise{from{opacity:0;transform:translateY(24px) scale(.94)}}@media (prefers-reduced-motion: reduce){#wlReveal .dcard{animation:none}}`;document.head.appendChild(st);}
  return new Promise(res=>{const el=document.createElement('div');el.id='wlReveal';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');
    el.innerHTML='<div class="dcard"><p class="k2"></p><img alt=""><h2></h2><p class="fact"></p><button type="button"></button></div>';
    el.querySelector('.k2').textContent=kicker;if(img)el.querySelector('img').src=img;el.querySelector('h2').textContent=title;el.querySelector('.fact').textContent=text;
    const b=el.querySelector('button');b.textContent=btn;const done=()=>{el.remove();sfx('ui-click');cue({kind:'card',who:'큰 획득',text:'닫힘',dur:0});res();};b.addEventListener('click',done);
    (document.querySelector('.wlg')||document.body).appendChild(el);b.focus({preventScroll:true});sfx('item-get');cue({kind:'card',who:'큰 획득',text:title,sub:text,dur:0});
    if(SHOT)setTimeout(done,3500);});}
function clearView(cam,p,skip){const objs=[];C.scene.traverse(o=>{if(o.isMesh&&o.visible&&!o.userData.wlHint&&!(o.material&&o.material.transparent&&o.material.depthWrite===false)){for(let q=o;q;q=q.parent)if(q===skip||q===C.WL)return;objs.push(o);}});
  // 양쪽으로 쏜다: 방 벽은 한쪽 면이라 벽 밖 카메라에서 안으로 쏘면 뒷면이라 안 맞는다(세로 화면에서 물러난 카메라가 방 밖으로 나가 까맣게 보였다)
  const hit=(a,b)=>{const d=new THREE.Vector3().subVectors(b,a),L=d.length(),ray=new THREE.Raycaster(a,d.normalize(),.3,Math.max(.31,L-.3));ray.layers.enableAll();return ray.intersectObjects(objs,false).length>0;};
  return !hit(cam,p)&&!hit(p,cam);}
const PH=[.7,1.6,2.6,4.5,5.6]; // 빛기둥 · 튀어나옴 · 떠올라 돌기 · 내려옴 · 머묾 → 창
function bigGet({from=null,giver=null,giverH=1.6,model,card={},to='bag',held=null,onDone=null}){if(!C)return Promise.resolve(false);if(BG)endBig();texs();
  const W=C.WL,P=W.position,U=W.userData;if(U.stopWalk)U.stopWalk();block('bigget',true);
  // 선물이 뜰 자리: 주는 주민 위(없으면 from) — 카메라(원더룹 뒤 비스듬히)에서 가리는 물체가 있으면 더 높이 → 옆으로
  let base;if(from)base=new THREE.Vector3(...from);else if(giver){giver.getWorldPosition(_w);base=new THREE.Vector3(_w.x,_w.y+giverH+.5,_w.z);}else{base=new THREE.Vector3(P.x+Math.sin(W.rotation.y)*3,P.y+2.4,P.z+Math.cos(W.rotation.y)*3);}
  W.rotation.y=Math.atan2(base.x-P.x,base.z-P.z); // 원본: 선물 쪽을 본다
  const ry=W.rotation.y,fx=Math.sin(ry),fz=Math.cos(ry),rx=Math.cos(ry),rz=-Math.sin(ry);
  // 카메라: 원본 QCAM처럼 원더룹 뒤 비스듬히(뒤 0.5 : 옆 1) — 원더룹 머리와 선물 사이 거리에 맞춰 물러나 둘 다 화면 안에(원본 거리 그대로면 선물이 위로 잘렸다)
  // 세로 화면(휴대폰)은 따라가기 카메라와 같은 배율(1.25/화면비, 최대 2)로 물러난다 — 가로 기준 거리 그대로면 주는 이와 선물이 반쯤 잘렸다(2026-11-06 아이폰)
  const camFor=(q,m=narrowK())=>{const h=new THREE.Vector3(P.x,P.y+1.1,P.z),mid=h.clone().add(q).multiplyScalar(.5),D=h.distanceTo(q),k=(D*1.15+2.2)*m;return new THREE.Vector3(mid.x+(-fx*.45+rx)*k,mid.y+.35+D*.15,mid.z+(-fz*.45+rz)*k);};
  let spot=base.clone(),cam=camFor(spot);
  const head=new THREE.Vector3(P.x,P.y+1.1,P.z),nk=narrowK(),ms=[...new Set([nk,(nk+1)/2,1])]; // 세로 화면에서 물러나다 벽에 막히면 덜 물러남
  find:for(const m of ms)for(const o of [[0,0,0],[0,.7,0],[rx*1.3,.3,rz*1.3],[-rx*1.3,.3,-rz*1.3],[0,1.4,0],[rx*2.2,.9,rz*2.2]]){const q=base.clone().add(new THREE.Vector3(...o)),c=camFor(q,m);if(clearView(c,q,giver)&&clearView(c,head,giver)){spot=q;cam=c;break find;}}
  const g=storybook(model(THREE));g.scale.multiplyScalar(.01);C.scene.add(g);const s0=g.scale.clone().multiplyScalar(100);
  const rays=new THREE.Sprite(add(RAYS));rays.material.opacity=0;rays.scale.setScalar(2.6);rays.renderOrder=-1;g.add(rays);rays.position.z=-.1;
  const halo=new THREE.Sprite(add(HALO));halo.scale.setScalar(1.6);g.add(halo);
  const beam=new THREE.Mesh(new THREE.CylinderGeometry(.55,.75,8,24,1,true),new THREE.MeshBasicMaterial({color:'#ffe9a0',transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false}));
  beam.position.set(spot.x,spot.y-1,spot.z);C.scene.add(beam);
  const sp=[];for(let i=0;i<22;i++){const s=new THREE.Sprite(add(STAR));s.material.color.set(i%2?'#ffe08a':'#ffffff');s.visible=false;C.scene.add(s);sp.push({s,v:new THREE.Vector3(),life:0});}
  const front=()=>new THREE.Vector3(P.x+fx*.8-rx*.62,P.y+1.4,P.z+fz*.8-rz*.62); // 원본 cmpB(앞 1.15·위 1.45) — 얼굴 클로즈업(카메라는 얼굴 앞 조금 오른쪽)을 가리지 않게 얼굴 왼쪽 위에 뜬다
  sfx('item-get');cue({kind:'bigget',who:'큰 획득',text:card.title||'',dur:PH[4]});
  return new Promise(res=>{BG={g,s0,rays,halo,beam,sp,spot,front,t:0,res,card,to,held,onDone,stage:0,cam};
    const fn=()=>{if(!BG)return null;const B=BG,mid=new THREE.Vector3().addVectors(new THREE.Vector3(P.x,P.y+1.1,P.z),B.g.position).multiplyScalar(.5);return {from:B.cam.toArray(),at:mid.toArray()};};
    BG.fn=fn;if(C.view)C.view.hold(fn);
    BG.tap=e=>{if(!BG||BG.t>=PH[4])return;const nx=PH.find(x=>x>BG.t+.05);if(nx!=null)BG.t=nx-.001;};setTimeout(()=>{if(BG)addEventListener('pointerdown',BG.tap,true);},150);});}
function burst(B,at){B.sp.forEach(o=>{o.s.visible=true;o.s.position.copy(at);o.v.set(rr(-1,1),rr(-.4,1.2),rr(-1,1)).normalize().multiplyScalar(rr(1.6,3.4));o.life=rr(.8,1.4);o.s.scale.setScalar(rr(.18,.36));});}
function tickBig(dt){const B=BG;if(!B)return;const t=B.t+=dt,g=B.g,P=C.WL.position;
  B.sp.forEach(o=>{if(o.life<=0){o.s.visible=false;return;}o.life-=dt;o.s.position.addScaledVector(o.v,dt);o.v.y-=dt*3;o.v.multiplyScalar(1-dt*1.5);o.s.material.opacity=Math.min(1,o.life*1.5);o.s.material.rotation+=dt*4;});
  B.beam.material.opacity=t<PH[0]?.5*t/PH[0]:Math.max(0,.5-(t-PH[0])*.35);B.beam.scale.y=Math.min(1,.2+t*1.4);
  const nd=g.userData.needle;
  if(t<PH[0]){g.position.copy(B.spot);g.scale.copy(B.s0).multiplyScalar(.01);}
  else if(t<PH[1]){const k=(t-PH[0])/(PH[1]-PH[0]),ob=1+2.7*Math.pow(k-1,3)+1.7*Math.pow(k-1,2);g.position.copy(B.spot);g.scale.copy(B.s0).multiplyScalar(Math.max(.01,ob*1.7));if(!B.st1){B.st1=1;sfx('event-sparkle');}}
  else if(t<PH[2]){const k=(t-PH[1])/(PH[2]-PH[1]);g.position.copy(B.spot);g.position.y+=.35*Math.sin(k*Math.PI*.5);g.scale.copy(B.s0).multiplyScalar(1.7);sparkle(B,dt);}
  else if(t<PH[3]){if(!B.top)B.top=g.position.clone();const k=(t-PH[2])/(PH[3]-PH[2]),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;g.position.lerpVectors(B.top,B.front(),e);g.position.y+=Math.sin(Math.PI*e)*.9;g.scale.copy(B.s0).multiplyScalar(1.7-.6*e);sparkle(B,dt);}
  else{const f=B.front();g.position.copy(f);g.position.y+=Math.sin(t*3)*.05;g.scale.copy(B.s0).multiplyScalar(1.1);
    if(!B.arrived){B.arrived=1;burst(B,f);sfx('big-get');react('shake',{sec:.25,amp:.05,sound:null,vib:[30,40,90]});react('joy',{sec:2.6,bounce:false,sound:null,closeup:true,closeSec:1.1});}
    if(t>=PH[4]&&!B.revealed){B.revealed=1;removeEventListener('pointerdown',B.tap,true);revealCard(B.card).then(()=>stow(B));}}
  if(B.stow){const k=Math.min(1,(t-B.stow)/.45);const to=B.to==='hand'&&C.WL.userData.heldBone?C.WL.userData.heldBone.getWorldPosition(_w):C.WL.localToWorld(_w.set(0,.75,-.3));
    g.position.lerp(to,k);g.scale.copy(B.s0).multiplyScalar(1.1*(1-k*.95));if(k>=1)endBig(true);}
  g.lookAt(C.camera.position);if(nd)nd.rotation.z=t<PH[3]?t*10:Math.sin(t*16)*.3*Math.max(0,1-(t-PH[3])*.8); // 원본: 내려오는 동안 바늘이 빙글, 닿으면 파르르 잦아듦
  B.rays.material.rotation+=dt*.8;B.rays.material.opacity=t<PH[0]?0:Math.min(.85,(t-PH[0])*1.2);B.halo.material.opacity=.6+.3*Math.sin(t*6);}
function sparkle(B,dt){if(rnd()<dt*12){const o=B.sp.find(q=>q.life<=0);if(o){o.s.visible=true;o.s.position.copy(B.g.position);o.v.set(rr(-.5,.5),rr(-.5,.5),rr(-.5,.5));o.life=.6;o.s.scale.setScalar(.2);}}}
function stow(B){if(BG!==B)return;B.stow=B.t;sfx('event-pop');}
function endBig(ok=false){const B=BG;if(!B)return;BG=null;removeEventListener('pointerdown',B.tap,true);if(C.view&&C.view.req&&C.view.req.fn===B.fn)C.view.hold(null);
  [B.g,B.beam,...B.sp.map(o=>o.s)].forEach(o=>{o.removeFromParent();o.traverse(c=>{if(c.geometry)c.geometry.dispose();if(c.material)[].concat(c.material).forEach(m=>m.dispose());});});
  block('bigget',false);if(ok&&B.to==='hand'&&B.held){const h=B.held();if(h&&C.WL.userData.setHeld)C.WL.userData.setHeld(h);}
  if(B.onDone)try{B.onDone(ok);}catch(e){console.error(e);}B.res(ok);}
/* ---------- ② 귀환 비행 ---------- */
let FL=null;
function flight({vehicle,path,speed=3,seat=.35,onEnd=null,view=null}){if(!C)return Promise.resolve(false);
  if(FL){const f=FL;FL=null;f.res(false);} // 앞 비행이 끝나기 전에 새로 타면 앞 비행을 끝냄(부른 쪽이 그 탈것을 치움 — 시험 단추를 거듭 누르면 날개개미가 쌓였다)
  storybook(vehicle);if(!vehicle.parent)C.scene.add(vehicle);sfx('event-whoosh');cue({kind:'flight',who:'귀환 비행',text:'',dur:0});
  if(C.view){const p=path[0],q=path[Math.min(2,path.length-1)],dx=q[0]-p[0],dz=q[2]-p[2],L=Math.hypot(dx,dz)||1;C.view.start(view||{from:[p[0]-dz/L*6-dx/L*3,p[1]+3,p[2]+dx/L*6-dz/L*3]});} // 처음 각도만(옆 비스듬히) — 그 뒤는 플레이어 카메라
  return new Promise(res=>{FL={vehicle,res,onEnd};ride({vehicle,path,speed,seat,pose:'앉기',onEnd:()=>{const f=FL;FL=null;sfx('land');if(f&&f.onEnd)try{f.onEnd();}catch(e){console.error(e);}res(true);}});});}
function tickFlight(dt){if(FL&&FL.vehicle.userData.tick)FL.vehicle.userData.tick(dt);}
/* ---------- ③ 미니어처 하이라이트 ---------- */
function curveOf(keys){const fr=new THREE.CatmullRomCurve3(keys.map(k=>new THREE.Vector3(...k.from)),false,'centripetal'),at=new THREE.CatmullRomCurve3(keys.map(k=>new THREE.Vector3(...k.at)),false,'centripetal');
  const T=[0];keys.forEach((k,i)=>{if(i)T.push(T[i-1]+(keys[i-1].sec||12));});const total=T[T.length-1]+(keys[keys.length-1].sec||12)*.5;return {fr,at,T,total};}
function miniatureAt(keys,t,cv=curveOf(keys)){const {T,total}=cv,n=keys.length;let i=0;while(i<n-1&&t>=T[i+1])i++;const seg=i<n-1?(t-T[i])/(T[i+1]-T[i]):Math.min(1,(t-T[n-1])/((cv.total-T[n-1])||1));
  const s=x=>x*x*(3-2*x),u=i<n-1?(i+s(Math.min(1,Math.max(0,seg))))/(n-1):1;const f=cv.fr.getPoint(u),a=cv.at.getPoint(u);return {from:f.toArray(),at:a.toArray(),key:i,label:keys[i].label||''};}
function miniaturePath(keys,{fps=24,fov=20}={}){const cv=curveOf(keys),out=[];for(let f=0;f<=cv.total*fps;f++){const t=f/fps,m=miniatureAt(keys,t,cv);out.push({t:+t.toFixed(4),from:m.from.map(v=>+v.toFixed(3)),at:m.at.map(v=>+v.toFixed(3)),fov,label:m.label});}return {fps,fov,duration:+cv.total.toFixed(2),frames:out};}
let MINI_CSS=false;
function miniature({keys,fov=20,music=null,onEnd=null}){if(!C||!keys||!keys.length)return Promise.resolve(false);if(MINI)endMini();
  if(!MINI_CSS){MINI_CSS=true;const st=document.createElement('style');st.textContent=`
#wlMini{position:fixed;inset:0;z-index:29;pointer-events:none}
#wlMini .ts{position:absolute;left:0;right:0;height:30%;-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px)}
#wlMini .ts.t{top:0;-webkit-mask-image:linear-gradient(#000,transparent);mask-image:linear-gradient(#000,transparent)}#wlMini .ts.b{bottom:0;-webkit-mask-image:linear-gradient(transparent,#000);mask-image:linear-gradient(transparent,#000)}
#wlMini .lab{position:absolute;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 9vh);transform:translateX(-50%);background:rgba(46,28,44,.66);color:#fff4e4;border-radius:999px;padding:.4rem 1.1rem;font-family:"Jua",sans-serif;font-size:1.05rem;transition:opacity .6s;white-space:nowrap}
#wlMini .skip{position:absolute;right:calc(env(safe-area-inset-right,0px) + 14px);bottom:calc(env(safe-area-inset-bottom,0px) + 16px);pointer-events:auto;border:0;border-radius:999px;background:rgba(46,28,44,.66);color:#fff4e4;font-family:"Jua",sans-serif;font-size:.95rem;padding:.5rem 1rem;cursor:pointer}
#wlMini .skip:focus-visible{outline:3px solid #fff4e4;outline-offset:3px}`;document.head.appendChild(st);}
  const el=document.createElement('div');el.id='wlMini';el.innerHTML='<div class="ts t"></div><div class="ts b"></div><p class="lab"></p><button type="button" class="skip">건너뛰기 ▸</button>';document.body.appendChild(el);
  block('finale',true);document.body.classList.add('wl-finale');if(music)playSong(music);
  const cv=curveOf(keys),cam=C.camera,fov0=cam.fov;cue({kind:'miniature',who:'미니어처',text:'',dur:+cv.total.toFixed(2)});
  return new Promise(res=>{let t=0,last=performance.now(),lab='';MINI={el,res,onEnd,fov0};
    const fn=()=>{if(!MINI)return null;const now=performance.now();t+=Math.min(.1,(now-last)/1000)*(SHOT?0:1)+(SHOT?1/60:0);last=now;if(t>=cv.total){setTimeout(()=>endMini(true),0);return null;}
      const m=miniatureAt(keys,t,cv);cam.fov=fov;cam.updateProjectionMatrix();if(m.label!==lab){lab=m.label;const L=el.querySelector('.lab');L.style.opacity=0;setTimeout(()=>{if(L.isConnected){L.textContent=lab;L.style.opacity=lab?1:0;}},400);}return {from:m.from,at:m.at};};
    MINI.fn=fn;C.view.hold(fn,{snap:true});
    const skip=()=>endMini(true);el.querySelector('.skip').addEventListener('click',skip);MINI.tap=e=>{if(e.target.closest&&e.target.closest('#wlMini .skip'))return;skip();};setTimeout(()=>{if(MINI)addEventListener('pointerdown',MINI.tap,true);},300);});}
function endMini(ok=false){const M=MINI;if(!M)return;MINI=null;removeEventListener('pointerdown',M.tap,true);M.el.remove();C.camera.fov=M.fov0;C.camera.updateProjectionMatrix();
  if(C.view.req&&C.view.req.fn===M.fn)C.view.hold(null);block('finale',false);document.body.classList.remove('wl-finale');if(M.onEnd)try{M.onEnd(ok);}catch(e){console.error(e);}M.res(ok);}
function playSong(m){try{if(m.song)songs({[m.id]:m.song});zoneMusic(m.id);}catch(e){console.error(e);}}
/* ---------- ④ 엔딩 화면 ---------- */
const YT='https://www.youtube.com/@wonderloop_world',HANDLE='YouTube @wonderloop_world';
let END_CSS=false;
const ENDCSS=`
body.wl-ending #wlHud,body.wl-ending #wlQuest,body.wl-ending #wlPrompt,body.wl-ending #wlAct,body.wl-ending #wlJoy,body.wl-ending #wlJump,body.wl-ending #wlDash,body.wl-ending #wlTool,
body.wl-ending #wlDlg,body.wl-ending #wlItems,body.wl-ending #wlMenu,body.wl-ending #wlToast,body.wl-ending header,body.wl-finale #wlHud,body.wl-finale #wlQuest,body.wl-finale #wlPrompt,body.wl-finale #wlAct,
body.wl-finale #wlJoy,body.wl-finale #wlJump,body.wl-finale #wlDash,body.wl-finale #wlTool,body.wl-finale #wlDlg,body.wl-finale #wlItems,body.wl-finale #wlMenu,body.wl-finale header{display:none!important}
#wlEnding{position:fixed;inset:0;z-index:28;pointer-events:none;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;text-align:center;font-family:"Gowun Dodum",sans-serif;
  padding:0 1.2rem calc(env(safe-area-inset-bottom,0px) + 9vh);color:#fff8ec;background:linear-gradient(180deg,rgba(30,14,36,0) 45%,rgba(30,14,36,.45) 100%);text-shadow:0 2px 14px rgba(20,10,20,.7),0 1px 3px rgba(20,10,20,.6)}
#wlEnding .ribbon{display:inline-block;position:relative;margin:0 0 .3rem;text-shadow:none;animation:wtDrop .6s cubic-bezier(.2,1.5,.4,1) both}
#wlEnding .ribbon span{display:inline-block;background:#ffb86b;color:#3e2834;font-size:.95rem;padding:.38rem 1.6rem;clip-path:polygon(0 0,100% 0,94% 50%,100% 100%,0 100%,6% 50%);box-shadow:0 3px 0 #a8603f}
#wlEnding .logo2{position:relative;display:flex;justify-content:center;width:max-content;max-width:100%;margin:.5rem auto .1rem;font-family:"Jua","Gowun Dodum",sans-serif;font-weight:400;font-size:clamp(2.5rem,10.5vw,5.4rem);line-height:1.08;white-space:nowrap}
#wlEnding .logo2>span{display:inline-block;color:var(--c);transform:rotate(var(--r));
  text-shadow:.045em 0 #4a2a2a,-.045em 0 #4a2a2a,0 .045em #4a2a2a,0 -.045em #4a2a2a,.032em .032em #4a2a2a,-.032em .032em #4a2a2a,.032em -.032em #4a2a2a,-.032em -.032em #4a2a2a,
    0 .085em 0 #4a2a2a,.03em .1em 0 #4a2a2a,-.03em .1em 0 #4a2a2a,0 .13em 0 #4a2a2a,0 .2em .28em rgba(30,14,36,.55);
  animation:wtPop .75s cubic-bezier(.2,1.7,.4,1) both,wtWave 3.6s ease-in-out infinite;animation-delay:calc(var(--i)*90ms + .25s),calc(var(--i)*.2s + 1.4s)}
#wlEnding .logo2>span.gap{margin-left:.28em}
#wlEnding .wt-deco{position:absolute;left:var(--dx,0);top:0;width:0;height:0;pointer-events:none}
#wlEnding .trail{width:min(26rem,86vw);height:26px;margin:.2rem auto .9rem;overflow:hidden;position:relative;-webkit-mask-image:linear-gradient(90deg,transparent,#000 15%,#000 85%,transparent);mask-image:linear-gradient(90deg,transparent,#000 15%,#000 85%,transparent)}
#wlEnding .trail::before{content:"";position:absolute;left:0;right:0;top:19px;border-top:3px dotted rgba(255,233,194,.45)}
#wlEnding .march{display:flex;gap:var(--gap);width:max-content;animation:wtMarch var(--sec) linear infinite;color:var(--pc)}
#wlEnding .march i{display:block;width:var(--w);height:var(--h);animation:wtStep var(--hop) steps(2) infinite}#wlEnding .march svg,#wlEnding .march img{width:100%;height:100%;display:block}
#wlEnding .es{margin:0 0 1.6rem;font-size:1.15rem;letter-spacing:.04em;opacity:0;animation:endIn 2.4s ease 2.2s forwards}
#wlEnding .eh{display:block;margin-top:.35rem;font-size:.9rem;letter-spacing:.06em;opacity:.85}
#wlEnding .eb{display:grid;grid-template-columns:1fr 1fr;gap:.6rem;width:min(22rem,calc(100vw - 40px));margin:0 auto;opacity:0;animation:endIn 1.6s ease 7s forwards} /* 단추 정렬(2026-11-07): 채널 단추는 한 줄 전체, 나머지는 같은 너비 두 칸 — 홀수로 남은 마지막 단추도 한 줄 전체 */
#wlEnding .eb>*{box-sizing:border-box;width:100%;text-align:center;white-space:nowrap;box-shadow:none;margin:0}#wlEnding .eb>.pri,#wlEnding .eb>:last-child:nth-child(even){grid-column:1/-1}
#wlEnding .eb button{pointer-events:auto;border:0;border-radius:999px;padding:.6rem 1.2rem;font:inherit;font-size:.95rem;cursor:pointer;background:rgba(30,18,30,.55);color:#fff4e4;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
#wlEnding .eb a{pointer-events:auto;border-radius:999px;padding:.6rem 1.2rem;font-size:.95rem;text-decoration:none;text-shadow:none;background:#f2b63c;color:#1e1418;font-weight:700}
#wlEnding .eb button:focus-visible,#wlEnding .eb a:focus-visible{outline:3px solid #fff4e4;outline-offset:3px}
@keyframes endIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes wtPop{from{opacity:0;transform:translateY(.7em) scale(.2) rotate(var(--r))}to{opacity:1;transform:translateY(0) scale(1) rotate(var(--r))}}
@keyframes wtWave{0%,100%{transform:translateY(0) rotate(var(--r))}50%{transform:translateY(-.07em) rotate(calc(var(--r) * -1))}}
@keyframes wtDrop{from{opacity:0;transform:translateY(-14px) scale(.8)}}@keyframes wtMarch{from{transform:translateX(-50%)}to{transform:translateX(0)}}@keyframes wtStep{50%{transform:translateY(-2px)}}
@media (prefers-reduced-motion:reduce){#wlEnding *{animation-duration:.01s!important;animation-iteration-count:1!important}}
#wlCert{position:fixed;inset:0;z-index:35;display:grid;place-items:center;padding:1rem;box-sizing:border-box;background:rgba(30,14,36,.55);overflow:hidden;font-family:"Gowun Dodum",sans-serif}
#wlCert .ccard{position:relative;width:min(25rem,100%);background:#fff8e8;color:#4a2a2a;border-radius:20px;padding:1.6rem 1.4rem 1.3rem;text-align:center;box-sizing:border-box;
  box-shadow:0 18px 50px rgba(30,14,36,.5),inset 0 0 0 6px #f2c14e,inset 0 0 0 9px #fff8e8,inset 0 0 0 11px #c88a56;animation:wlRvRise .5s cubic-bezier(.2,1.4,.4,1) both}
#wlCert .ck{margin:0;font-size:.85rem;letter-spacing:.15em;color:#a8603f}#wlCert h2{margin:.3rem 0 .2rem;font-family:"Jua","Gowun Dodum",sans-serif;font-weight:400;font-size:2rem;color:#7a3a2a}
#wlCert .cn{margin:.5rem 0;font-size:1.25rem}#wlCert .cb{margin:0;line-height:1.7;font-size:.98rem;word-break:keep-all}
#wlCert .cg{margin:.8rem 0 0;padding:.55rem .7rem;border-radius:12px;background:rgba(242,193,78,.25);font-size:.92rem}#wlCert .cd{margin:.8rem 0 0;font-size:.8rem;color:#a07a6a}
#wlCert button{border:0;border-radius:14px;background:#3f9fa0;color:#fffaf2;font:inherit;font-size:1.05rem;padding:.8rem 1.4rem;width:100%;margin-top:1rem;cursor:pointer}
#wlCert .confetti{position:absolute;top:-20px;width:10px;height:14px;border-radius:3px;animation:wlFall linear forwards}@keyframes wlFall{to{transform:translateY(110vh) rotate(720deg)}}
@keyframes wlRvRise{from{opacity:0;transform:translateY(24px) scale(.94)}}@media (prefers-reduced-motion: reduce){#wlCert .confetti{display:none}#wlCert .ccard{animation:none}}`;
const TILT=[-6,4,-3,5,-4];
function endLogo(W,text){const h=document.createElement('h2');h.className='logo2';h.setAttribute('aria-label',text);const cols=W.letterColors&&W.letterColors.length?W.letterColors:['#ffd46a'];
  let ci=0,gap=false;const spans=[];for(const ch of [...text]){if(ch===' '){gap=true;continue;}const s=document.createElement('span');s.setAttribute('aria-hidden','true');s.textContent=ch;
    s.style.cssText=`--i:${ci};--c:${cols[ci%cols.length]};--r:${TILT[ci%TILT.length]}deg`;if(gap)s.className='gap';gap=false;h.appendChild(s);spans.push(s);ci++;}
  glyphize(spans,W.titleGlyph); // 세계 글자 그림(무한 우주 '우'의 ㅇ = 토성) — 시작 타이틀과 같게
  if(W.titleDeco&&W.titleDeco.svg){const d=document.createElement('div');d.className='wt-deco';d.setAttribute('aria-hidden','true');d.innerHTML=W.titleDeco.svg;h.insertBefore(d,h.firstChild);
    const at=Math.max(0,Math.min(spans.length-1,W.titleDeco.at|0)),place=()=>d.style.setProperty('--dx',spans[at].offsetLeft+'px');requestAnimationFrame(place);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(place);}
  return h;}
function ending(W,{bag=true}={}){if(!C)return;closeEnding();if(!END_CSS){END_CSS=true;const st=document.createElement('style');st.textContent=ENDCSS+(W.titleDeco&&W.titleDeco.css?W.titleDeco.css.replaceAll('#wlTitle','#wlEnding'):'');document.head.appendChild(st);}
  const F=W.finale||{},name=W.name||W.title,el=document.createElement('div');el.id='wlEnding';el.setAttribute('role','region');el.setAttribute('aria-label',name+' 탐방 끝');
  const rb=document.createElement('div');rb.className='ribbon';rb.innerHTML='<span></span>';rb.firstChild.textContent=RIBBON;el.appendChild(rb);el.appendChild(endLogo(W,name+' 탐방 끝'));
  if(W.parade&&W.parade.svg){const P=W.parade,t=document.createElement('div');t.className='trail';t.setAttribute('aria-hidden','true');const m=document.createElement('div');m.className='march';
    m.style.cssText=`--gap:${P.gap||'2.6rem'};--sec:${P.sec||9}s;--pc:${P.color||'#ffe9c2'};--w:${P.w||30}px;--h:${P.h||17}px;--hop:${P.hop||.35}s`;for(let i=0;i<(P.n||6);i++){const it=document.createElement('i');it.innerHTML=P.svg;m.appendChild(it);}t.appendChild(m);el.appendChild(t);}
  const es=document.createElement('p');es.className='es';es.append('다음 이야기에서 만나요');const eh=document.createElement('span');eh.className='eh';eh.textContent=HANDLE;es.appendChild(eh);el.appendChild(es);
  const eb=document.createElement('div');eb.className='eb';const a=document.createElement('a');a.className='pri';a.href=YT;a.target='_blank';a.rel='noopener';a.textContent='▶ 원더룹 채널 보러 가기';eb.appendChild(a);
  const b=(txt,f)=>{const x=document.createElement('button');x.type='button';x.textContent=txt;x.addEventListener('click',()=>{sfx('ui-click');f();});eb.appendChild(x);return x;};
  if(W.cert&&(!W.cert.when||W.cert.when()))b('인증서 보기',()=>cert(W));
  if(bag)b('가방 보기',()=>openBag());
  b('처음부터 다시 하기',()=>{try{resetAll();}catch(e){}location.reload();});
  el.appendChild(eb);document.body.appendChild(el);document.body.classList.add('wl-ending');block('finale',true);
  const B=F.endBackdrop||W.backdrop;let t=0,last=performance.now();const fn=()=>{const now=performance.now();t+=Math.min(.1,(now-last)/1000);last=now;return backdropAt(B,t);};
  END={el,fn};if(C.view)C.view.hold(fn);if(W.music)playSong(W.music);cue({kind:'ending',who:'엔딩',text:name+' 탐방 끝',dur:0});}
function closeEnding(){if(!END)return;END.el.remove();if(C.view&&C.view.req&&C.view.req.fn===END.fn)C.view.hold(null);END=null;document.body.classList.remove('wl-ending');block('finale',false);}
function cert(W){const c=W.cert||{},el=document.createElement('div');el.id='wlCert';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label',c.title||'');
  el.innerHTML='<div class="ccard"><p class="ck"></p><h2></h2><p class="cn"></p><p class="cb"></p><p class="cg"></p><p class="cd"></p><button type="button">고마워요!</button></div>';
  const q=s=>el.querySelector(s);q('.ck').textContent=c.kicker||'';q('h2').textContent=c.title||'';q('.cn').textContent='탐험가 '+(playerName?playerName():'원더룹');q('.cb').textContent=c.body||'';
  if(c.gift)q('.cg').innerHTML=c.gift;else q('.cg').remove();const d=new Date();q('.cd').textContent=d.getFullYear()+'년 '+(d.getMonth()+1)+'월 '+d.getDate()+'일 · '+(W.title||'');
  const cols=['#f2c14e','#ef8fae','#7fe0d8','#8f7fd8','#ff9f5a'];for(let i=0;i<40;i++){const f=document.createElement('i');f.className='confetti';f.style.left=Math.random()*100+'%';f.style.background=cols[i%5];f.style.animationDuration=(2.2+Math.random()*2)+'s';f.style.animationDelay=(Math.random()*.8)+'s';el.appendChild(f);}
  q('button').addEventListener('click',()=>{sfx('ui-click');el.remove();});(document.querySelector('.wlg')||document.body).appendChild(el);sfx('mission-clear');q('button').focus({preventScroll:true});}
function tickFinale(dt){tickBig(dt);tickFlight(dt);}
function clearFinale(){endBig(false);endMini(false);closeEnding();if(FL){const f=FL;FL=null;f.res(false);}}
const finaleState=()=>({big:BG?{t:+BG.t.toFixed(2),revealed:!!BG.revealed}:null,mini:!!MINI,ending:!!END,flight:!!FL});
export {bigGet,cert,clearFinale,closeEnding,ending,finaleState,flight,initFinale,miniature,miniatureAt,miniaturePath,tickFinale};
