/* 원더룹 — 손으로 하는 상호작용: 원더룹은 무언가를 할 때 손으로 한다(발로 밟아 해결하지 않기).
   add({root, at:[x,z], face:[x,z], label:'돌리기', action:'돌리기', dur:1.6, near:1.6, when:()=>참, onStart(it), onDone(it), once:true}) → it
   - root(3D 물체)를 누르거나, 가까이(near) 와서 E·터치 단추(label)를 누르면 → 원더룹이 at으로 걸어가 face 쪽을 보고 action 동작(07)을 dur초 하고 → onDone.
     at이 없으면 root 자리에서 0.75 떨어진 원더룹 쪽, face가 없으면 root 자리를 본다.
   - 가까운 것 하나만 고른다. 말 걸 상대가 가까우면 대화가 먼저(dialog). 대화·카드가 열려 있으면 기다린다.
   - 하는 동안 바닥을 눌러 다른 데로 걸어가면 그만둔다(다시 누르면 처음부터). once:false면 여러 번 할 수 있다.
   - it.enabled=false로 잠시 끄고, remove(it)로 뺀다. 구역을 떠나면 비워진다(clearInteract).
   동작 이름: '돌리기'(두 손으로 돌림), '뿌리기'(오른손에 든 물건 기울이기 — WL.userData.setHeld), '매듭 풀기', '들여다보기' 등 07 동작. */
import * as THREE from 'three';
import {blocking,clock} from './core.js';
const coarse=matchMedia('(pointer:coarse)').matches;
const ITEMS=[];let ctx=null,near=null,doing=null;const _p=new THREE.Vector3();
function add(def){const it=Object.assign({label:'살펴보기',action:'들여다보기',dur:1.4,near:1.6,once:true,enabled:true,done:false},def);ITEMS.push(it);return it;}
function remove(it){const i=ITEMS.indexOf(it);if(i>=0)ITEMS.splice(i,1);if(doing&&doing.it===it)stop();}
const usable=it=>it.enabled&&!it.done&&(!it.when||it.when());
function spot(it){it.root.getWorldPosition(_p);const P=ctx.WL.position;
  if(it.at)return {x:it.at[0],z:it.at[1],fx:it.face?it.face[0]:_p.x,fz:it.face?it.face[1]:_p.z};
  const dx=P.x-_p.x,dz=P.z-_p.z,d=Math.hypot(dx,dz)||1;return {x:_p.x+dx/d*.75,z:_p.z+dz/d*.75,fx:_p.x,fz:_p.z};}
function start(it){if(!usable(it)||blocking())return false;const s=spot(it),U=ctx.WL.userData;
  doing={it,s,phase:'go',t0:0};U.walkTo(s.x,s.z);return true;}
function stop(){if(!doing)return;const U=ctx.WL.userData;if(doing.phase==='do'&&U.action===doing.it.action){U.action='서기';U.at=0;}doing=null;}
function tickInteract(){if(!ctx)return;const WL=ctx.WL,U=WL.userData,P=WL.position;
  if(doing){const {it,s}=doing;
    if(doing.phase==='go'){if(!U.isWalking()){if(Math.hypot(P.x-s.x,P.z-s.z)<.3){doing.phase='do';doing.t0=clock.t;WL.rotation.y=Math.atan2(s.fx-P.x,s.fz-P.z);U.action=it.action;U.at=0;
          if(it.onStart)try{it.onStart(it);}catch(e){console.error(e);}}else doing=null;}} // 막혀서 못 갔으면 그만둔다
    else if(doing.phase==='do'){if(U.isWalking()){stop();}
      else if(clock.t-doing.t0>=it.dur){U.action='서기';U.at=0;if(it.once)it.done=true;doing=null;if(it.onDone)try{it.onDone(it);}catch(e){console.error(e);}}}}
  near=null;let nd=Infinity;if(!doing&&!blocking())for(const it of ITEMS){if(!usable(it))continue;it.root.getWorldPosition(_p);const d=Math.hypot(_p.x-P.x,_p.z-P.z);if(d<it.near&&d<nd){nd=d;near=it;}}}
/* dialog가 말 걸 상대가 없을 때 넘겨주는 자리: 안내 문구와 E·터치 단추 */
const prompt=()=>near?(coarse?near.label:'E '+near.label):'';
const act=()=>near?start(near):false;
function click(ray){const L=ITEMS.filter(usable);if(!L.length)return false;const hits=ray.intersectObjects(L.map(i=>i.root),true);if(!hits.length)return false;
  const o=hits[0].object,it=L.find(i=>{let q=o;while(q){if(q===i.root)return true;q=q.parent;}return false;});return it?start(it):false;}
function initInteract(c){ctx=c;}
function clearInteract(){doing=null;near=null;ITEMS.length=0;}
const busy=()=>!!doing;
export {act,add,busy,clearInteract,click,initInteract,prompt,remove,start,tickInteract};
