/* 원더룹 견본 구역: 실내 (방 여러 개) — 새 실내 구역을 만들 때 복사해서 쓰는 본보기.
   - 방마다 영역(areas) 하나: 걸을 수 있는 범위(bounds)·장애물·카메라. 두 방의 범위가 문간에서 겹쳐 오갈 수 있다.
   - 원더룹이 다른 방으로 들어가면 카메라가 그 방 기준으로 바뀐다('방 전체' 카메라도 그 방을 본다).
   - 방 조명은 lights에 넣고 light(env)에서 밝기를 정한다(08이 옛 단위 → 물리 단위로 바꿈).
   - 문: 거실 왼쪽 앞 문 → 견본 야외, 서재 오른쪽 앞 문 → 베이스캠프. */
import * as THREE from 'three';
import {M,PI,add,blob,boxAt,cylAt,group,rawLin,rng} from '../01-textures.js';
export function build({root}){
const R=rng('sample-indoor:props'),rnd=(a,b)=>a+(b-a)*R();
const W=6,D=4,H=2.8; // 방 하나 가로 6, 깊이 ±4
const floorM=M('#e2c29a','planks',{rep:[2,2]}),wallM=M('#efe0c4','plaster',{rep:[2,1]}),wall2=M('#d7e6dc','plaster',{rep:[2,1]});
// 바닥·뒷벽 (인형의 집처럼 앞쪽 두 면은 열어 둔다)
add(new THREE.PlaneGeometry(W*2,D*2),floorM,0,0,0,{rx:-PI/2,cast:false,line:false});
boxAt(W*2+0.3,H,0.2,wallM,0,0,-D-0.1,{cast:false});
boxAt(0.2,H,D*2,wall2,-W-0.1,0,0,{cast:false});
// 가운데 칸막이벽 + 문간(z -1.1~1.1)
boxAt(0.24,H,D-1.1,wallM,0,0,-(D+1.1)/2,{cast:false});boxAt(0.24,H,D-1.1,wallM,0,0,(D+1.1)/2,{cast:false});
boxAt(0.24,0.5,2.2,wallM,0,H-0.5,0,{cast:false});
// 거실: 소파·탁자
const obsHall=[],obsStudy=[];
{const g=group(-3.4,0,-3.2,0);boxAt(2.4,0.45,0.9,M('#c98a6a','plain'),0,0,0,{parent:g});boxAt(2.4,0.6,0.25,M('#b57a5c','plain'),0,0.45,-0.33,{parent:g});obsHall.push({r:[-4.6,-2.2,-3.7,-2.7]});}
{cylAt(0.55,0.55,0.08,M('#c69468','wood'),-3,0.42,-0.6);cylAt(0.06,0.06,0.42,M('#a97a52','wood'),-3,0,-0.6);blob(-3,-0.6,0.7,0.7,0.25);obsHall.push({c:[-3,-0.6,0.55]});}
// 서재: 책상·책장·등
{boxAt(1.6,0.08,0.8,M('#c88f5e','wood'),3.2,0.72,-3.4);[[2.5,-3.7],[3.9,-3.7],[2.5,-3.1],[3.9,-3.1]].forEach(([x,z])=>boxAt(0.07,0.72,0.07,M('#a9764b','wood'),x,0,z));obsStudy.push({r:[2.3,4.1,-3.9,-2.9]});}
{const bs=group(5.6,0,-1,-PI/2);boxAt(2,2.2,0.4,M('#b88457','wood'),0,0,0,{parent:bs});
  for(let s=0;s<3;s++)for(let k=0;k<7;k++){const w=rnd(0.1,0.16),h=rnd(0.3,0.42);boxAt(w,h,0.28,M(['#d45d5a','#3fa89b','#e7b05a','#7d8bd0'][Math.floor(R()*4)],'plain'),-0.8+k*0.24,0.25+s*0.68,0.08,{parent:bs});}
  obsStudy.push({r:[5.2,6,-2.1,0.1]});}
const lamp=new THREE.PointLight(rawLin(0xffc27a),0.5,7,2);lamp.position.set(3.2,2.2,-2.6);root.add(lamp);
add(new THREE.SphereGeometry(0.16,12,8),new THREE.MeshStandardMaterial({color:0xfff1cf,emissive:0xffd58a,emissiveIntensity:0.6}),3.2,2.25,-2.6,{line:false,cast:false});
// 문틀 (밟는 자리 표시)
boxAt(0.9,2,0.08,M('#7a4a32','wood'),-5.3,0,D-0.1);boxAt(0.9,2,0.08,M('#7a4a32','wood'),5.3,0,D-0.1);
const cam=x=>({target:[x,1.2,-0.4],dist:19,polar:[0.55,1.32],azimuth:[0.12,1.45],start:[0.98,0.8],minDist:3,maxDist:34});
return {
  name:'견본 실내',kind:'indoor',
  spawn:{x:-4,z:2.6,ry:PI*0.9},
  areas:{
    hall:{bounds:[-W+0.35,0.4,-D+0.35,D-0.3],obstacles:[...obsHall,{r:[-0.12,0.12,-D,-1.1]},{r:[-0.12,0.12,1.1,D]}],camera:cam(-3)},
    study:{bounds:[-0.4,W-0.35,-D+0.35,D-0.3],obstacles:obsStudy,camera:cam(3)}},
  doors:[{rect:[-5.8,-4.8,3.2,3.7],to:'sample-outdoor',spawn:{x:-3.6,z:-2.6,ry:0.3}},{rect:[4.8,5.8,3.2,3.7],to:'basecamp'}],
  sun:{dir:new THREE.Vector3(3,-12,12).normalize(),shadow:9,follow:false},
  lights:[lamp],
  light(env){lamp.intensity=(0.35+0.9*env.night)*env.flick*(1-.6*env.cave);},
};
}
