/* 원더룹 — 통과 링(체크포인트): 원더룹이 링 면을 지나가면 알린다. 놓쳐도 다시 하지 않는다(실패·재시작 없음).
   ring({at:[x,y,z], ry:0, r:.9, onPass(ring)}) → ring  — at 링 가운데, ry 링 면이 보는 방향(라디안, 0이면 +z를 보는 면), r 반지름.
   지난 프레임과 이번 프레임에 원더룹 몸 가운데(발 + 0.6)가 링 면의 양쪽에 있고, 지나간 자리가 링 안(반지름 + 0.25 여유)이면 통과.
   링 모양(3D)은 세계 쪽에서 그린다. passed가 참이면 더 알리지 않는다. 구역을 떠나면 비워진다(clearCourse). */
import * as THREE from 'three';
const RINGS=[];let ctx=null;const _w=new THREE.Vector3(),_l=new THREE.Vector3();
function ring(def){const r=Object.assign({ry:0,r:.9,passed:false},def);r.m=new THREE.Matrix4().makeRotationY(r.ry).setPosition(...r.at);r.inv=r.m.clone().invert();r.prev=null;RINGS.push(r);return r;}
function tickCourse(){if(!ctx)return;const P=ctx.WL.position;_w.set(P.x,P.y+.6,P.z);
  for(const r of RINGS){if(r.passed)continue;_l.copy(_w).applyMatrix4(r.inv);
    if(r.prev&&Math.sign(r.prev.z)!==Math.sign(_l.z)&&_l.z!==0){const u=r.prev.z/(r.prev.z-_l.z),x=r.prev.x+(_l.x-r.prev.x)*u,y=r.prev.y+(_l.y-r.prev.y)*u;
      if(Math.hypot(x,y)<r.r+.25){r.passed=true;if(r.onPass)try{r.onPass(r);}catch(e){console.error(e);}}}
    r.prev=(r.prev||new THREE.Vector3()).copy(_l);}}
const passedCount=()=>RINGS.filter(r=>r.passed).length;
function initCourse(c){ctx=c;}
function clearCourse(){RINGS.length=0;}
export {clearCourse,initCourse,passedCount,ring,tickCourse};
