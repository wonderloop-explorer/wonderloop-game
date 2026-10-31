/* 원더룹 — 가리면 비쳐 보이기 (개미굴 occlude와 같은 방식)
   NPC 같은 움직이는 캐릭터가 카메라와 원더룹 사이에 서서 원더룹을 가리면, 그 캐릭터를 반투명하게(불투명도 30%) 해서 원더룹이 비쳐 보이게 한다.
   add(root, r, h): 가릴 수 있는 캐릭터와 크기 — 반지름 r, 키 h(발부터 머리까지 여러 높이에서 원더룹 쪽 시선과 r보다 가까우면 가린 것으로 본다). 구역을 떠날 때 clearOcclude()가 비운다.
   재질은 캐릭터마다 따로여야 한다(같이 쓰는 재질이면 다른 물체도 함께 투명해진다). 투명해지는 동안 깊이를 쓰지 않아 뒤의 원더룹이 보인다. */
import * as THREE from 'three';
let ctx=null;const LIST=[];
const _c=new THREE.Vector3(),_d=new THREE.Vector3(),_p=new THREE.Vector3(),_x=new THREE.Vector3();
function initOcclude(c){ctx=c;}
function add(root,r=.5,h=1){LIST.push({root,r,h,k:0});}
function setFade(o,k){o.root.traverse(m=>{if(!m.isMesh&&!m.isSprite)return;const ms=Array.isArray(m.material)?m.material:[m.material];
  ms.forEach(mt=>{if(!mt)return;const u=mt.userData;if(u.o0===undefined){u.o0=mt.opacity;u.t0=mt.transparent;u.d0=mt.depthWrite;}
    if(k>.02){if(!mt.transparent){mt.transparent=true;mt.needsUpdate=true;}mt.opacity=u.o0*(1-.7*k);mt.depthWrite=k<.5&&u.d0;}
    else{if(mt.transparent!==u.t0){mt.transparent=u.t0;mt.needsUpdate=true;}mt.opacity=u.o0;mt.depthWrite=u.d0;}});});}
function tickOcclude(dt){if(!ctx||!LIST.length)return;const cam=ctx.camera,W=ctx.WL;
  _c.copy(cam.position);_d.set(W.position.x,W.position.y+.75,W.position.z).sub(_c);const len=_d.length();if(len<.1)return;_d.divideScalar(len);
  LIST.forEach(o=>{let hit=false;if(o.root.visible!==false&&o.root.parent){o.root.getWorldPosition(_p);const y0=_p.y;
      for(let i=0;i<4&&!hit;i++){_p.y=y0+o.h*(.15+i*.25);const t=_x.copy(_p).sub(_c).dot(_d);if(t>.2&&t<len-.3)hit=_x.copy(_c).addScaledVector(_d,t).distanceTo(_p)<o.r;}}
    const k=o.k+((hit?1:0)-o.k)*Math.min(1,dt*12);if(k<.01&&o.k<.01)return;o.k=k<.01?0:k;setFade(o,o.k);});}
function clearOcclude(){LIST.length=0;}
export {add,clearOcclude,initOcclude,tickOcclude};
