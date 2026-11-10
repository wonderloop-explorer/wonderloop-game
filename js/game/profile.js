/* 원더룹 — 캐릭터 소개 카드 (도감을 넣지 않는 세계에서 도감 대신 — 요정의 숲부터)
   setup({world, cards:{id:{name, intro, likes, quote, img, bg, portrait:{side, lift}}}}) — 세계(구역)마다 한 번.
   meet(id, root) — 그 주민과 처음 이야기를 마쳤을 때(dialog.npc onDone) 부른다 → 처음 한 번만 소개 카드(ui.profileCard). 다시 말을 걸면 안 뜬다.
     본 기록은 state flags['meet:<세계>:<id>'](저장, 촬영 모드는 저장 안 함). 모으기·개수 표시·결과 집계는 없다.
   그림 자리: cards[id].img(2D 그림 경로)가 있으면 그것을 쓰고, 없으면 게임 안에서 그 캐릭터 전신을 따로 찍어(portrait) 쓴다 → 나중에 그림이 생기면 img만 채우면 된다.
     bg 카드 왼쪽 둥근 배경판 색(캐릭터마다 다른 연한 파스텔). portrait.side 정면에서 돌린 각도(라디안, 기본 0.42 = 살짝 3/4), lift 내려다보는 정도.
   전신 찍기: 그 캐릭터만 잠깐 따로 만든 장면으로 옮겨(배경·안개·다른 물체 없이) 투명 배경에 찍고 제자리로 돌려놓는다.
     부드러운 정면 조명(하늘빛 + 카메라 쪽 앞빛), 비쳐 보이기(occlude)·뚫어 보기(cut)로 반투명해진 상태는 찍는 동안 되돌린다.
     몸 전체 상자에 맞춰 카메라 거리를 잡는다(위아래 여백 약 8%). 카드의 동그라미에 맞춰 512×512 렌더 타깃에 한 번 → 캔버스 그림 주소. 카드가 열릴 때만이라 플레이 중 비용은 없다. */
import * as THREE from 'three';
import {flags,setFlag} from './state.js';
import {profileCard} from './ui.js';
import {cutPaused} from './occlude.js';
import {bendPaused} from './bend.js';
let ctx=null,W='',CARDS={};const PICS={};
/* 초상 기억(2026-11-10): 게임 안에서 찍은 초상은 작게(160) 한 번 더 찍어 이 기기에 저장('wl-pics' — 세계:id) → 다시 열거나 다음 스테이지로 가도 탐험 가방 '만난 친구'에 그림이 나온다. 촬영 모드는 저장 안 함 */
const SHOT=new URLSearchParams(location.search).has('shot');let SAVED={};if(!SHOT)try{SAVED=JSON.parse(localStorage.getItem('wl-pics')||'{}')||{};}catch(e){}
function keep(id,root,c){if(SHOT||c.img||!root)return;const u=portrait(root,{...(c.portrait||{}),w:160,h:160});if(!u)return;SAVED[W+':'+id]=u;try{localStorage.setItem('wl-pics',JSON.stringify(SAVED));}catch(e){}}
function initProfile(c){ctx=c;}
function setup({world,cards}){W=world||'';CARDS=cards||{};}
const seen=id=>!!flags['meet:'+W+':'+id];
function portrait(root,{side=.42,lift=.12,w=512,h=512}={}){if(!ctx||!ctx.renderer)return null;const {renderer}=ctx;
  const par=root.parent,pos=root.position.clone(),quat=root.quaternion.clone(),scl=root.scale.clone();
  const stage=new THREE.Scene();stage.add(root);root.position.set(0,0,0);root.quaternion.identity();root.updateMatrixWorld(true); // 캐릭터만 따로(제자리 방향은 정면 = +z)
  const hid=[];root.traverse(o=>{if((o.isSprite||o.userData.wlHint)&&o.visible){o.visible=false;hid.push(o);}});
  const op=[];root.traverse(m=>{if(!m.isMesh)return;[].concat(m.material).forEach(mt=>{const u=mt&&mt.userData;if(u&&u.o0!==undefined){op.push([mt,mt.opacity,mt.depthWrite,mt.transparent]);mt.opacity=u.o0;mt.depthWrite=u.d0;mt.transparent=u.t0;}});});
  const box=new THREE.Box3().setFromObject(root),c=box.getCenter(new THREE.Vector3()),sz=box.getSize(new THREE.Vector3());
  const fov=24,asp=w/h,half=Math.max(sz.y/2,sz.x/2/asp*1.05)*1.08,dist=half/Math.tan(fov*Math.PI/360)+Math.max(sz.x,sz.z)/2;
  const dir=new THREE.Vector3(Math.sin(side),lift,Math.cos(side)).normalize(),cam=new THREE.PerspectiveCamera(fov,asp,.05,dist*4);
  cam.position.copy(c).addScaledVector(dir,dist);cam.lookAt(c);
  stage.add(new THREE.HemisphereLight(0xfff6ea,0xd9c2aa,1.6));const key=new THREE.DirectionalLight(0xfff2e0,2.3);key.position.copy(cam.position).add(new THREE.Vector3(-dist*.4,dist*.5,0));key.target.position.copy(c);stage.add(key,key.target);
  const rt=new THREE.WebGLRenderTarget(w,h,{samples:4});rt.texture.colorSpace=THREE.SRGBColorSpace;
  const prev=renderer.getRenderTarget(),cc=renderer.getClearColor(new THREE.Color()),ca=renderer.getClearAlpha();let url=null;const resume=cutPaused(true);
  const resumeBend=bendPaused(); // 초상은 둥근 땅을 끄고(평평하게) 찍는다
  try{renderer.setRenderTarget(rt);renderer.setClearColor(0x000000,0);renderer.clear();renderer.render(stage,cam);const px=new Uint8Array(w*h*4);renderer.readRenderTargetPixels(rt,0,0,w,h,px);
    const cv=document.createElement('canvas');cv.width=w;cv.height=h;const g=cv.getContext('2d'),im=g.createImageData(w,h);
    for(let r=0;r<h;r++)im.data.set(px.subarray((h-1-r)*w*4,(h-r)*w*4),r*w*4); // 렌더 타깃은 아래부터 → 뒤집기
    g.putImageData(im,0,0);url=cv.toDataURL('image/png');}
  catch(e){console.warn('원더룹: 소개 카드 초상 렌더링 실패',e);}
  finally{renderer.setRenderTarget(prev);renderer.setClearColor(cc,ca);resume();resumeBend();hid.forEach(o=>o.visible=true);op.forEach(([mt,o,d,t])=>{mt.opacity=o;mt.depthWrite=d;if(mt.transparent!==t){mt.transparent=t;mt.needsUpdate=true;}});rt.dispose();
    if(par)par.add(root);else stage.remove(root);root.position.copy(pos);root.quaternion.copy(quat);root.scale.copy(scl);root.updateMatrixWorld(true);}
  return url;}
/* 도는 물건 그림(2026-11-04 — 아이템 획득 창이 아이콘 대신 그 물건이 천천히 도는 모습): 물건만 따로 비춰 n장(한 바퀴)을 투명 배경 PNG로 — 한 번만 찍고 창이 차례로 보여 준다 */
function spinFrames(obj,{n=24,w=160,h=160,lift=.3}={}){if(!ctx||!ctx.renderer||!obj)return null;const {renderer}=ctx;const stage=new THREE.Scene(),pv=new THREE.Group();stage.add(pv);pv.add(obj);obj.traverse(o=>{if(o.isSprite)o.visible=false;});obj.updateMatrixWorld(true); // 빛무리(스프라이트)는 빼고 물건만
  const box=new THREE.Box3();obj.traverse(o=>{if(o.isMesh)box.expandByObject(o);});const _b=0,c=box.getCenter(new THREE.Vector3()),sz=box.getSize(new THREE.Vector3());obj.position.sub(c);
  const fov=26,half=Math.max(sz.y,Math.hypot(sz.x,sz.z))/2*1.15,dist=half/Math.tan(fov*Math.PI/360)+Math.hypot(sz.x,sz.z)/2,cam=new THREE.PerspectiveCamera(fov,w/h,.02,dist*4);
  cam.position.set(0,dist*Math.sin(lift),dist*Math.cos(lift));cam.lookAt(0,0,0);
  stage.add(new THREE.HemisphereLight(0xfff6ea,0xd9c2aa,1.7));const key=new THREE.DirectionalLight(0xfff2e0,2.4);key.position.set(-dist*.5,dist*.8,dist);stage.add(key);
  const rt=new THREE.WebGLRenderTarget(w,h,{samples:4});rt.texture.colorSpace=THREE.SRGBColorSpace;const prev=renderer.getRenderTarget(),cc=renderer.getClearColor(new THREE.Color()),ca=renderer.getClearAlpha();
  const resume=cutPaused(true),resumeBend=bendPaused(),out=[];const px=new Uint8Array(w*h*4),cv=document.createElement('canvas');cv.width=w;cv.height=h;const g=cv.getContext('2d'),im=g.createImageData(w,h);
  try{renderer.setClearColor(0x000000,0);for(let i=0;i<n;i++){pv.rotation.y=i/n*Math.PI*2;pv.updateMatrixWorld(true);renderer.setRenderTarget(rt);renderer.clear();renderer.render(stage,cam);renderer.readRenderTargetPixels(rt,0,0,w,h,px);
    for(let r=0;r<h;r++)im.data.set(px.subarray((h-1-r)*w*4,(h-r)*w*4),r*w*4);g.putImageData(im,0,0);out.push(cv.toDataURL('image/png'));}}
  catch(e){console.warn('원더룹: 도는 물건 그림 실패',e);}
  finally{renderer.setRenderTarget(prev);renderer.setClearColor(cc,ca);resume();resumeBend();rt.dispose();pv.remove(obj);}
  return out.length?out:null;}
function meet(id,root){const c=CARDS[id];if(!c||seen(id))return Promise.resolve(false);setFlag('meet:'+W+':'+id,true);
  const img=c.img||(root?portrait(root,c.portrait):null);if(img)PICS[id]=img;keep(id,root,c);
  const ids=Object.keys(CARDS).filter(k=>!CARDS[k].secret),n=ids.filter(seen).length; // 숨겨진 비밀 친구는 빼고(비밀이 몇인지 미리 알리지 않게) // 친구 수(개미굴 '자연 도감 8/11'처럼) — 탐험 가방의 '만난 친구'와 같은 수
  return profileCard({name:c.name,intro:c.intro,likes:c.likes,quote:c.quote,img,bg:c.bg,kicker:c.secret?'숨겨진 친구':'새 친구',count:`만난 친구 ${n}/${ids.length}`,button:'가방에 넣기'}).then(()=>true);}
/* 탐험 가방(game/front)이 그림을 다시 쓸 수 있게: 처음 만날 때 찍은 초상은 기억해 둔다 */
/* 비밀 장면처럼 카드 없이 '만났다'만 적을 때(숨겨진 비밀 카드가 대신 뜬다): 기록 + 초상을 찍어 돌려준다(탐험 가방 그림) */
function found(id,root){const c=CARDS[id];if(!c)return null;setFlag('meet:'+W+':'+id,true);const img=c.img||(root?portrait(root,c.portrait):null);if(img)PICS[id]=img;keep(id,root,c);return img;}
const clearProfile=()=>{CARDS={};};
const cards=()=>CARDS,pic=(id,w)=>PICS[id]||(CARDS[id]&&CARDS[id].img)||SAVED[(w||W)+':'+id]||null;
export {cards,clearProfile,found,initProfile,meet,pic,portrait,seen,setup,spinFrames};
