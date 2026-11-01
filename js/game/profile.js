/* 원더룹 — 캐릭터 소개 카드 (도감을 넣지 않는 세계에서 도감 대신 — 요정의 숲부터)
   setup({world, cards:{id:{name, intro, likes, quote, img, portrait:{y, dist, side}}}}) — 세계(구역)마다 한 번.
   meet(id, root) — 그 주민과 처음 이야기를 마쳤을 때(dialog.npc onDone) 부른다 → 처음 한 번만 소개 카드(ui.profileCard). 다시 말을 걸면 안 뜬다.
     본 기록은 state flags['meet:<세계>:<id>'](저장, 촬영 모드는 저장 안 함). 모으기·개수 표시·결과 집계는 없다.
   그림 자리: cards[id].img(2D 그림 경로)가 있으면 그것을 쓰고, 없으면 게임 안에서 그 캐릭터의 얼굴·어깨를 렌더링(portrait)해 쓴다
     → 나중에 그림이 생기면 img만 채우면 된다. portrait.y 얼굴 높이(발바닥 기준, 캐릭터 크기 배율 전), dist 카메라 거리, side 옆으로 돌린 각도(라디안).
   렌더링: 256×256 렌더 타깃에 한 번(원더룹·말풍선·안내 표시는 그동안 숨김) → 캔버스 그림 주소. 카드가 열릴 때만이라 플레이 중 비용은 없다. */
import * as THREE from 'three';
import {flags,setFlag} from './state.js';
import {profileCard} from './ui.js';
let ctx=null,W='',CARDS={};
function initProfile(c){ctx=c;}
function setup({world,cards}){W=world||'';CARDS=cards||{};}
const seen=id=>!!flags['meet:'+W+':'+id];
function portrait(root,{y=.6,dist=1.2,side=.35,size=256}={}){if(!ctx||!ctx.renderer)return null;const {renderer,scene,WL}=ctx;
  root.updateMatrixWorld(true);const s=root.getWorldScale(new THREE.Vector3()).y,head=new THREE.Vector3(0,y,0).applyMatrix4(root.matrixWorld);
  const q=root.getWorldQuaternion(new THREE.Quaternion()),f=new THREE.Vector3(Math.sin(side),.12,Math.cos(side)).applyQuaternion(q).normalize();
  const cam=new THREE.PerspectiveCamera(28,1,dist*s*.6,120);cam.position.copy(head).addScaledVector(f,dist*s);cam.lookAt(head.x,head.y-.06*s,head.z); // 가까운 면을 카메라와 얼굴 사이에서 잘라 앞을 가리는 풀·잎이 안 찍히게
  const rt=new THREE.WebGLRenderTarget(size,size,{samples:4});rt.texture.colorSpace=THREE.SRGBColorSpace;
  const hid=[];const hide=o=>{if(o&&o.visible){o.visible=false;hid.push(o);}};hide(WL);scene.traverse(o=>{if(o.isSprite||o.userData.wlHint)hide(o);});
  const op=[];root.traverse(m=>{if(!m.isMesh)return;[].concat(m.material).forEach(mt=>{const u=mt&&mt.userData;if(u&&u.o0!==undefined){op.push([mt,mt.opacity,mt.depthWrite]);mt.opacity=u.o0;mt.depthWrite=u.d0;}});}); // 비쳐 보이기(occlude)로 반투명해진 채 찍히지 않게
  const prev=renderer.getRenderTarget();let url=null;
  try{renderer.setRenderTarget(rt);renderer.clear();renderer.render(scene,cam);const px=new Uint8Array(size*size*4);renderer.readRenderTargetPixels(rt,0,0,size,size,px);
    const cv=document.createElement('canvas');cv.width=cv.height=size;const g=cv.getContext('2d'),im=g.createImageData(size,size);
    for(let r=0;r<size;r++)im.data.set(px.subarray((size-1-r)*size*4,(size-r)*size*4),r*size*4); // 렌더 타깃은 아래부터 → 뒤집기
    g.putImageData(im,0,0);url=cv.toDataURL('image/png');}
  catch(e){console.warn('원더룹: 소개 카드 초상 렌더링 실패',e);}
  finally{renderer.setRenderTarget(prev);hid.forEach(o=>o.visible=true);op.forEach(([mt,o,d])=>{mt.opacity=o;mt.depthWrite=d;});rt.dispose();}
  return url;}
function meet(id,root){const c=CARDS[id];if(!c||seen(id))return Promise.resolve(false);setFlag('meet:'+W+':'+id,true);
  const img=c.img||(root?portrait(root,c.portrait):null);
  return profileCard({name:c.name,intro:c.intro,likes:c.likes,quote:c.quote,img}).then(()=>true);}
const clearProfile=()=>{CARDS={};};
export {clearProfile,initProfile,meet,portrait,seen,setup};
