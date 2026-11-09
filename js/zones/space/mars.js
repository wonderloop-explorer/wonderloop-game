/* 원더룹 무한 우주 ② 화성 — 임시 착지 자리 (2026-11-09)
   지금은 별똥별 꼬리 타기(meteor-ride.js)의 도착만: 회색 정원 출구에서 별똥별을 타고 오면(RIDE.pending) 하늘에서 내려와 원더룹을 놓아주고,
   화성 중력(약 38%)으로 천천히 떨어져 납작 → 통통 → 한 번 더 통통 → 붉은 먼지, 깜짝·갸웃·두리번 뒤 조작이 풀린다. 거기서 멈춤.
   STAGE 2 '붉은 모래 언덕' 내용(미션·주민·지형)은 기획서대로 따로 만든다 — 이 파일의 땅·바위는 그때 바꿀 임시 것.
   땅: 64m 판(휴대폰 1.8m·컴퓨터 1.3m 칸) + 녹슨 주황 정점 색 얼룩(색연필 결 툰 재질), 가운데 10m는 평평, 둘레 낮은 언덕, 둥근 땅(bend k .012)으로 지평선이 내려감.
   하늘: 우주 하늘(낮에도 별) + 지평선 쪽 흙먼지 주황, 안개 55~150m(가까우면 하늘 지붕까지 덮여 하늘이 갈색 한 장이 됐다). 바위 둥근 로우폴리(크기 여럿, 큰 것만 막힘). 그리기 수: 땅 1 · 바위(색 접기 병합) · 하늘 · 먼지 1. */
import * as THREE from 'three';
import {PI,QUALITY,rng} from '../../01-textures.js';
import * as G from '../../game/index.js';
import {sbMat} from '../../game/storybook.js';
import {RIDE,arrival,redDust} from './meteor-ride.js';
export function build({root}){
const MOB=QUALITY.tier==='mobile',R=rng('space-mars:props'),rnd=(a,b)=>a+(b-a)*R();
const SIZE=64,HALF=SIZE/2;
const groundY=(x,z)=>{const d=Math.hypot(x,z),f=Math.min(1,Math.max(0,(d-5)/10));return f*(Math.sin(x*.21)*Math.cos(z*.17)*.6+Math.sin((x-z)*.09)*.5);};
/* 땅: 녹슨 주황 + 어두운 얼룩·밝은 모래 띠(정점 색) */
const N=MOB?36:48,gGeo=new THREE.PlaneGeometry(SIZE,SIZE,N,N);gGeo.rotateX(-PI/2);
{const p=gGeo.attributes.position,c=new Float32Array(p.count*3),A=new THREE.Color('#c96a46'),B=new THREE.Color('#a24e34'),Cc=new THREE.Color('#e3956a'),t=new THREE.Color();
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,groundY(x,z));const n1=Math.sin(x*.31+Math.sin(z*.23)*1.7)*Math.cos(z*.27-x*.11),n2=Math.sin((x+z)*.13)*Math.sin(x*.07-z*.19);
    t.copy(A).lerp(B,Math.max(0,n1)*.55).lerp(Cc,Math.max(0,n2)*.5);c.set([t.r,t.g,t.b],i*3);}
  gGeo.setAttribute('color',new THREE.BufferAttribute(c,3));gGeo.computeVertexNormals();}
const gMat=sbMat('#ffffff');gMat.vertexColors=true;
const ground=new THREE.Mesh(gGeo,gMat);ground.receiveShadow=true;ground.name='mars-ground';root.add(ground);
/* 바위: 둥근 로우폴리, 크기 여럿(큰 것만 막힘) — 가운데 착지 자리 5m는 비움 */
const obstacles=[],keep=[ground];const RC=['#9a4a33','#b55d3e','#86402d','#c8774f'];
for(let i=0;i<(MOB?34:52);i++){const a=rnd(0,PI*2),d=rnd(5.5,HALF-3),x=Math.cos(a)*d,z=Math.sin(a)*d,s=Math.pow(rnd(0,1),2)*1.6+.25;
  const m=new THREE.Mesh(new THREE.IcosahedronGeometry(s,s>1?1:0),sbMat(RC[(rnd(0,4)|0)%4]));m.position.set(x,groundY(x,z)+s*.25,z);m.scale.set(1,rnd(.55,.85),rnd(.85,1.15));m.rotation.y=rnd(0,PI);m.castShadow=!MOB;m.receiveShadow=true;root.add(m);
  if(s>.7)obstacles.push({c:[x,z,s*.85]});}
/* 하늘: 우주(낮에도 별) + 지평선 흙먼지 주황 */
const key={top:'#120c26',horizon:'#5b2c3c',hemi:'#f0cdb4',ground:'#7a3a2a',hemiI:.58,sun:'#ffe2c4',sunI:.95,sunDir:[-5,-6,-7],fill:.22,fog:'#3c2034',fogNear:55,fogFar:150,stars:1,milky:.7};
const SK=G.sky.sky({parent:root,keys:[key,key,key],t:0,nStars:MOB?200:320,starSize:3,space:true});
const dust=redDust(root,MOB?70:120);keep.push(dust.pts);
/* 별똥별을 타고 왔으면: 도착 연출 */
const pend=RIDE.pending;RIDE.pending=null;let arr=null,started=false;
const U0=()=>G.mission.hero&&G.mission.hero();
function update(dt,t){const W=U0();if(!W)return;
  if(pend&&!started&&G.view.camera){started=true;arr=arrival({G,root,WL:W,groundY,mob:MOB,dust,onDone:()=>{G.ui.toast('붉은 화성에 도착했어요! 화성 중력은 지구의 약 38%예요',4.2);}});}
  if(arr)arr.tick(dt,t);dust.tick(dt);}
function lateUpdate(dt,t){if(arr)arr.late(dt,t);}
return {
  name:'붉은 모래 언덕(임시)',kind:'outdoor',start:{compass:true},world:null,
  spawn:{x:0,z:0,ry:PI},
  areas:{field:{bounds:[-HALF+3,HALF-3,-HALF+3,HALF-3],obstacles,camera:{target:[0,1,0],dist:9,polar:[.45,1.35],azimuth:null,start:[2.6,.95],minDist:3,maxDist:30}}},
  sun:{dir:new THREE.Vector3(-5,-6,-7).normalize(),shadow:12,follow:true},
  sky:SK,bend:{k:.012,d0:6},gravity:.38,jumpK:1.15,rim:.2,camRoom:{c:[0,0],r:HALF-4},
  groundY,ground:[ground],keepOut:keep,mergeColors:true,music:null,
  arrival:()=>arr, /* 시험 도구가 읽음 */
  update,lateUpdate,dispose(){if(arr){arr.dispose();arr=null;}},
};
}
