/* 원더룹 — 따라오는 동행(반딧불 같은 작은 친구): 원더룹 옆쪽 조금 앞에서 늘 보이게 따라온다.
   companion({obj, side:1, height:1.25, ahead:.35, spread:.65, bob:.08, speed:3}) → {set(on), remove(), obj}
   - 자리는 화면 기준: 원더룹에서 카메라 오른쪽(side 1)·왼쪽(-1)으로 spread, 카메라 쪽으로 ahead만큼 → 원더룹 몸에 가려지지 않는다.
   - 높이 height(원더룹 발 기준)에서 둥실(bob). 부드럽게 따라가고(speed), 움직이는 쪽을 본다.
   - obj는 장면에 바로 붙인다(구역을 떠나면 clearCompanions가 뗀다). 빛은 세계 쪽에서(lamps·발광 재질). */
import * as THREE from 'three';
const LIST=[];let ctx=null,clk=0;const _r=new THREE.Vector3(),_b=new THREE.Vector3(),_g=new THREE.Vector3(),_up=new THREE.Vector3(0,1,0);
function companion(def){const c=Object.assign({side:1,height:1.25,ahead:.35,spread:.65,bob:.08,speed:3,on:true,ph:LIST.length*1.7},def); // ph: 둥실 박자(촬영 모드에서도 같은 그림)
  if(ctx&&c.obj&&!c.obj.parent)ctx.scene.add(c.obj);c.placed=false;LIST.push(c);
  c.set=on=>{c.on=on;c.obj.visible=on;c.placed=false;};c.remove=()=>{const i=LIST.indexOf(c);if(i>=0)LIST.splice(i,1);c.obj.removeFromParent();};return c;}
function tickCompanions(dt){if(!ctx||!LIST.length)return;clk+=dt;const cam=ctx.camera,P=ctx.WL.position;
  cam.getWorldDirection(_b);_b.y=0;if(_b.lengthSq()<1e-6)_b.set(0,0,-1);_b.normalize();_r.crossVectors(_b,_up).normalize();
  for(const c of LIST){if(!c.on)continue;_g.copy(P).addScaledVector(_r,c.spread*c.side).addScaledVector(_b,-c.ahead);_g.y=P.y+c.height+Math.sin(clk*2.2+c.ph)*c.bob;
    const o=c.obj;if(!c.placed){o.position.copy(_g);c.placed=true;continue;}const k=Math.min(1,dt*c.speed),dx=_g.x-o.position.x,dz=_g.z-o.position.z;
    o.position.lerp(_g,k);if(dx*dx+dz*dz>1e-4){let d=Math.atan2(dx,dz)-o.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));o.rotation.y+=d*k;}}}
function initCompanions(c){ctx=c;LIST.forEach(x=>{if(!x.obj.parent)c.scene.add(x.obj);});}
function clearCompanions(){LIST.slice().forEach(c=>c.remove());}
export {clearCompanions,companion,initCompanions,tickCompanions};
