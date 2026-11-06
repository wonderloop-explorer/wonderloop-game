/* 원더룹 — 아이템 획득 공통 연출 (2026-11-05 — 개미굴 원본 꿀방울 얻기 startItemGet·updateItem을 그대로 옮김, 규칙은 docs/series-rules.md '아이템')
   itemGet({obj, to:'hand'|'bag', held:()=>손에 쥘 물체, card:{title,text,icon}, scale, top, onDone}) → Promise(끝나면)
   ① 날아오기 0.85초: obj(장면에 있는 물체 — 떠 있던 물건, 주는 주민 배 등)가 지금 자리에서 원더룹 머리 위(top, 기본 발밑 + 1.95m — 물건 원점이 밑이면 더듬이 바로 위)로 포물선(높이 1.6)을 그리며 빙글빙글(초당 7)
      — 시작에 item-pickup 소리. 원더룹은 멈춰 선다(조작 잠금 core 'itemget' — 원본 ctrlLock).
   ② 들어 보이기 1.9초: 머리 위에서 위아래로 살랑(초당 4·0.08)·천천히 돌고(초당 2.5)·숨쉬듯 커졌다 작아짐(scale × (1 + sin·0.065), 원본 1.55 ± 0.1),
      도착 순간 반짝이 열넷이 흩어지고(원본 burstSparkles — 별 그림, 더하기 섞기) 아래 획득 카드(ui.itemCard — 아이콘·제목·한 줄, item-get 소리).
      원더룹은 카메라 쪽으로 돌아서서 웃는다(game/react 'joy' — 몸통 통통 없이, 원본 hold: 카메라 방향으로 초당 8 + happy 얼굴).
   ③ 넣기 0.38초: to='bag'이면 배낭 쪽으로 작아지며 들어가 사라지고(원본 stow), to='hand'면 오른손 자리로 내려오며 작아져 held()가 만든 물체를 쥔다(07 setHeld).
   카메라: 지금 방향 그대로 원더룹 쪽으로 살짝 다가간다(zoom, 기본 켜짐 — 거리 ×0.7, 최소 2.7m, 방 소품이 가리면 좌우로 조금(최대 ±0.9라디안) 돌며, 보는 점은 가슴 → 머리 위 물건 사이, 0.6초에 들어가 넣기가 끝나면 — 손에 쥐면 쥔 모습을 1.3초 더 보여 주고 — 0.6초에 돌아옴).
   예전 버섯 랜턴은 카메라가 원더룹 둘레를 돌아 앞으로 갔는데 휴대폰에서 버벅였다(2026-11-05) → 다가가기만 한다(2026-11-06 — 휴대폰에서 랜턴 드는 동작이 작아 잘 안 보였다).
   촬영 모드에서도 같은 순서(게임 시간). 구역을 떠나면 clearItemGet(). */
import * as THREE from 'three';
import {block,cue} from './core.js';
import {sfx} from './sound.js';
import {itemCard} from './ui.js';
import {react} from './react.js';
let C=null,cur=null,STAR=null;
const _v=new THREE.Vector3(),_w=new THREE.Vector3();
function initItemGet(c){C=c;}
function star(){if(STAR)return STAR;const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.fillStyle='#fff3c0';g.beginPath(); // 원본 STAR 그대로
  for(let i=0;i<8;i++){const a=i*Math.PI/4,r=i%2?7:30;g.lineTo(32+Math.cos(a)*r,32+Math.sin(a)*r);}g.fill();STAR=new THREE.CanvasTexture(c);STAR.colorSpace=THREE.SRGBColorSpace;return STAR;}
let seed=777;const rnd=()=>((seed=(seed*1103515245+12345)&0x7fffffff)/0x7fffffff),rr=(a,b)=>a+(b-a)*rnd();
function itemGet({obj,to='bag',held=null,card=null,scale=1.55,top=1.95,onDone=null,zoom=true}){if(!C||!obj)return Promise.resolve(false);clearItemGet();
  const U=C.WL.userData;if(U.stopWalk)U.stopWalk();block('itemget',true);
  obj.updateWorldMatrix(true,false);const from=obj.getWorldPosition(new THREE.Vector3());C.scene.attach(obj);
  const s0=obj.scale.clone();sfx('item-pickup');cue({kind:'itemget',who:'아이템',text:card&&card.title||'',dur:3.13});
  return new Promise(res=>{cur={obj,to,held,card,scale,top,onDone,res,ph:'fly',t:0,from,s0,sp:[]};if(zoom)dolly(cur);});}
/* 살짝 다가가기: 지금 카메라 방향 그대로 거리만 줄인다(돌지 않음 — 머리를 뚫지 않고 휴대폰도 가볍다). 끝(R.zoomOut)이면 0.6초에 돌아간 뒤 놓아 준다 */
function dolly(R){const V=C.view;if(!V||!V.hold)return;const W=C.WL,P=W.position,c=C.camera.position,y0=.85,yT=R.top*.75;
  const a0=Math.atan2(c.x-P.x,c.z-P.z),h0=Math.hypot(c.x-P.x,c.z-P.z),v0=c.y-P.y-y0;if(h0<.5)return;const e=k=>k*k*(3-2*k);let t=0,last=performance.now();
  // 다가간 자리에서 원더룹 머리·물건이 가리지 않는 자리: 지금 방향부터 좌우로 조금씩(최대 ±0.9라디안) — 방 소품(지구본 등) 뒤면 옆으로 살짝 돌며 다가간다. 다 막히면 그대로
  const pos=(a,h,v)=>new THREE.Vector3(P.x+Math.sin(a)*h,P.y+y0+v+(yT-y0),P.z+Math.cos(a)*h);let pick=null;
  for(const da of [0,.35,-.35,.7,-.7,.9,-.9]){for(const r of [.7,.8,.9,1]){const h=Math.max(2.7,Math.min(h0,h0*r)),v=v0*h/h0,cp=pos(a0+da,h,v);
      if([.55,.9,1.2,R.top].every(y=>seen(cp,new THREE.Vector3(P.x,P.y+y,P.z),R.obj))){pick={a:a0+da,h,v};break;}}if(pick)break;} // 가슴·얼굴·탈·물건이 모두 보이는 자리
  if(!pick||(Math.abs(pick.a-a0)<.01&&pick.h>=h0-.05))return;
  const fn=()=>{const now=performance.now();t+=Math.min(.1,(now-last)/1000);last=now;let k=e(Math.min(1,t/.6));
    if(R.zoomOut!=null){const u=Math.min(1,(t-R.zoomOut)/.6);k*=1-e(u);if(u>=1){setTimeout(()=>{if(V.req&&V.req.fn===fn)V.hold(null);},0);return null;}}
    const a=a0+(pick.a-a0)*k,h=h0+(pick.h-h0)*k,v=v0+(pick.v-v0)*k,ay=y0+(yT-y0)*k;
    return {from:[P.x+Math.sin(a)*h,P.y+ay+v,P.z+Math.cos(a)*h],at:[P.x,P.y+ay,P.z]};};
  R.zoomFn=fn;R.zoomT=()=>t;V.hold(fn,{snap:true});}
function burst(p){const tx=star();for(let i=0;i<14;i++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));
  sp.position.copy(p);const a=rnd()*6.28,e=rr(-.3,1),life=rr(.6,1.1);C.scene.add(sp);cur.sp.push({sp,t:life,life,v:new THREE.Vector3(Math.cos(a)*rr(1,2.2),e*1.8+.6,Math.sin(a)*rr(1,2.2))});}}
function tickItemGet(dt){if(!cur)return;const R=cur,o=R.obj,W=C.WL,P=W.position;R.t+=dt;
  for(let i=R.sp.length-1;i>=0;i--){const s=R.sp[i];s.t-=dt;s.sp.position.addScaledVector(s.v,dt);s.v.y-=2*dt;const k=Math.max(0,s.t/s.life);s.sp.material.opacity=k;s.sp.scale.setScalar(.35*k+.1);s.sp.material.rotation+=dt*3;
    if(s.t<=0){s.sp.removeFromParent();s.sp.material.dispose();R.sp.splice(i,1);}}
  if(R.ph==='done'){if(!R.sp.length)cur=null;return;}
  _v.set(P.x,P.y+R.top,P.z);
  if(R.ph==='fly'){const k=Math.min(1,R.t/.85);o.position.lerpVectors(R.from,_v,k);o.position.y+=Math.sin(k*Math.PI)*1.6;o.rotation.y+=dt*7;
    if(k>=1){R.ph='hold';R.t=0;burst(o.position);react('joy',{sec:2.3,sound:null,punch:false,bounce:false});
      if(R.card)itemCard({title:R.card.title||'',text:R.card.text||'',icon:R.card.icon||null,sec:R.card.sec||2.8,who:'아이템'});}}
  else if(R.ph==='hold'){o.position.copy(_v);o.position.y+=Math.sin(R.t*4)*.08;o.rotation.y+=dt*2.5;o.scale.copy(R.s0).multiplyScalar(R.scale*(1+Math.sin(R.t*7)*.065));
    if(R.t>1.9){R.ph='stow';R.t=0;R.top0=o.position.clone();}}
  else if(R.ph==='stow'){const k=Math.min(1,R.t/.38);
    if(R.to==='hand'){W.updateWorldMatrix(true,true);U_hand(_w);}else W.localToWorld(_w.set(0,.75,-.3)); // 손(07 held 뼈) 또는 배낭
    o.position.lerpVectors(R.top0,_w,k);o.scale.copy(R.s0).multiplyScalar(R.scale*(1-k*(R.to==='hand'?.6:.94)));o.rotation.y+=dt*2.5;
    if(k>=1)finish(true);}}
function seen(cam,p,skip){const ray=new THREE.Raycaster(),d=p.clone().sub(cam),L=d.length();ray.set(cam,d.normalize());ray.far=Math.max(.1,L-.35);ray.layers.enableAll();
  const objs=[];C.scene.traverse(o=>{if(o.isMesh&&o.visible&&!o.userData.wlHint&&!(o.material&&o.material.transparent&&o.material.depthWrite===false)){for(let q=o;q;q=q.parent)if(q===skip||q===C.WL)return;objs.push(o);}});
  return !ray.intersectObjects(objs,false).length;}
function U_hand(v){const U=C.WL.userData;if(U.heldBone)U.heldBone.getWorldPosition(v);else C.WL.localToWorld(v.set(-.3,.6,.2));return v;}
function finish(ok){const R=cur;if(!R||R.ph==='done')return;R.ph='done';block('itemget',false);
  if(R.zoomFn){if(ok)R.zoomOut=R.zoomT()+(R.to==='hand'?1.3:.3);else if(C.view&&C.view.req&&C.view.req.fn===R.zoomFn)C.view.hold(null);}
  R.obj.removeFromParent();R.obj.traverse(c=>{if(c.geometry)c.geometry.dispose();if(c.material)[].concat(c.material).forEach(m=>{if(m.map&&m.map!==STAR)m.map.dispose();m.dispose();});});
  if(R.to==='hand'&&R.held){const U=C.WL.userData;const h=R.held();if(h&&U.setHeld)U.setHeld(h);}
  if(R.onDone)try{R.onDone(ok);}catch(e){console.error(e);}R.res(ok);}
function clearItemGet(){if(!cur)return;finish(false);cur.sp.forEach(s=>{s.sp.removeFromParent();s.sp.material.dispose();});cur=null;}
const itemGetting=()=>!!cur&&cur.ph!=='done';
export {clearItemGet,initItemGet,itemGet,itemGetting,tickItemGet};
