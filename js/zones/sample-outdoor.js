/* 원더룹 견본 구역: 야외 (넓은 땅) — 새 야외 구역을 만들 때 복사해서 쓰는 본보기.
   - 높낮이 있는 땅: groundY(x,z)로 높이를 정하고, 같은 함수로 땅 메시를 만든다(원더룹이 땅 위를 걷는다).
   - 그림자: 범위(shadow)를 넓게 잡지 않고 follow로 원더룹을 따라가게 해 그림자가 흐려지지 않게.
   - 카메라: 돌려 볼 수 있는 각도 제한 없음(azimuth 없음), 따라가기 기본.
   - 난수는 rng('sample-outdoor:…') — 이름이 다르면 다른 구역·소품 그림을 바꾸지 않는다.
   - 문: 작은 오두막 앞을 밟으면 견본 실내로. */
import * as THREE from 'three';
import {C,M,PI,add,blob,boxAt,cylAt,group,rng} from '../01-textures.js';
export function build({root}){
const R=rng('sample-outdoor:props'),rnd=(a,b)=>a+(b-a)*R();
const SIZE=80;
// 땅 높이: 낮은 언덕 몇 개 (원더룹이 있는 가운데는 평평하게)
const groundY=(x,z)=>{const d=Math.hypot(x,z);const flat=Math.min(1,Math.max(0,(d-6)/8));
  return flat*(Math.sin(x*0.13)*Math.cos(z*0.11)*1.1+Math.sin((x+z)*0.07)*0.6);};
const gGeo=new THREE.PlaneGeometry(SIZE,SIZE,80,80);gGeo.rotateX(-PI/2);
{const p=gGeo.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,groundY(p.getX(i),p.getZ(i)));gGeo.computeVertexNormals();}
const ground=add(gGeo,M('#a8cf80','plain',{rep:[14,14]}),0,0,0,{cast:false,line:false});
// 나무·바위 (장애물로도 쓴다)
const obstacles=[];
const tree=(x,z,s)=>{const g=group(x,groundY(x,z),z,rnd(0,PI*2));
  cylAt(0.12*s,0.16*s,1.1*s,M('#8a6244','wood'),0,0,0,{parent:g});
  add(new THREE.IcosahedronGeometry(0.75*s,0),M('#6fae5c','plain'),0,1.5*s,0,{parent:g,thr:20});
  add(new THREE.IcosahedronGeometry(0.55*s,0),M('#86c26a','plain'),0.2*s,2.1*s,0.1*s,{parent:g,thr:20});
  blob(x,z,0.9*s,0.9*s,0.25);obstacles.push({c:[x,z,0.25*s]});};
const rock=(x,z,s)=>{add(new THREE.DodecahedronGeometry(0.4*s,0),M('#b7ab9a','plain'),x,groundY(x,z)+0.2*s,z,{ry:rnd(0,PI),s:[1,0.7,1.1]});obstacles.push({c:[x,z,0.4*s]});};
for(let i=0;i<46;i++){const a=rnd(0,PI*2),d=rnd(7,34);tree(Math.cos(a)*d,Math.sin(a)*d,rnd(0.8,1.4));}
for(let i=0;i<24;i++){const a=rnd(0,PI*2),d=rnd(4,30);rock(Math.cos(a)*d,Math.sin(a)*d,rnd(0.6,1.6));}
// 작은 오두막 (문 → 견본 실내)
{const hx=-4,hz=-5,g=group(hx,0,hz,0.3);
  boxAt(2.4,1.8,2,M('#d9b48a','planks',{rep:[1,1]}),0,0,0,{parent:g});
  add(C(0,1.9,1.1,4),M('#c46a52','plain'),0,2.35,0,{parent:g,ry:PI/4,s:[1,1,0.85]});
  boxAt(0.6,1.1,0.06,M('#7a4a32','wood'),0,0,1.02,{parent:g});
  obstacles.push({r:[hx-1.5,hx+1.5,hz-1.3,hz+1.1]});}
return {
  name:'견본 야외',kind:'outdoor',start:{compass:true},
  spawn:{x:0,z:3,ry:PI},
  areas:{field:{bounds:[-SIZE/2+2,SIZE/2-2,-SIZE/2+2,SIZE/2-2],obstacles,
    camera:{target:[0,1,0],dist:42,polar:[0.45,1.3],azimuth:null,start:[0.95,0.7],minDist:3,maxDist:70}}},
  doors:[{rect:[-4.6,-3.2,-3.9,-3.3],to:'sample-indoor'}],
  sun:{dir:new THREE.Vector3(4,-12,7).normalize(),shadow:10,follow:true},
  groundY,ground:[ground],
};
}
