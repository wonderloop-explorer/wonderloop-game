/* 무한 우주 ③ 금성 구름 — 임시 구역(2026-11-12): 화성 → 금성 이동 연출이 내려앉는 곳. 사방이 연보라(#C9A6E0) 안개인 푹신한 구름 땅뿐이다.
   도착하면 조작이 풀리는 데까지만 — STAGE 3 본편('도착하자마자 두꺼운 구름이 덮쳐 길을 잃음'으로 시작)은 기획서대로 따로 만든다.
   - 구름이 걷히지 않음: 안개가 가깝고 짙다(3~24m), 하늘도 같은 연보라. 음악 없음(공간음 바람만).
   - 땅: 완만하게 울룩불룩한 구름 결(정점 색 연보라·크림, 1.5m 칸 한 장 — 그리기 1), 걷는 범위 ±34m(끝은 안개에 묻힘)
   - 이동으로 들어오면(meteor-ride RIDE.pending.cloud) whirl-lift cloudArrival이 내려앉힘, 주소로 바로 열면 그냥 서 있음 */
import * as THREE from 'three';
import {PI,QUALITY} from '../../01-textures.js';
import * as G from '../../game/index.js';
import {sbMat} from '../../game/storybook.js';
import {RIDE} from './meteor-ride.js';
import {cloudArrival} from './whirl-lift.js';
const B=34;
function groundY(x,z){return .22*Math.sin(x*.21+Math.sin(z*.13)*1.4)*Math.cos(z*.19)+.14*Math.sin((x+z)*.37)+.1*Math.sin(x*.61-z*.47);}
export function build({root}){const MOB=QUALITY.tier==='mobile',keep=[];
  const N=Math.round(2*(B+26)/1.5),S=2*(B+26),pos=[],col=[],uv=[],idx=[],A=new THREE.Color('#e3d0f3'),C2=new THREE.Color('#c9a6e0'),C3=new THREE.Color('#f6ecfd'),t=new THREE.Color();
  for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){const x=-S/2+S*i/N,z=-S/2+S*j/N,y=groundY(x,z);pos.push(x,y,z);uv.push(x/4,z/4);t.copy(A).lerp(C3,Math.max(0,y*2.2)).lerp(C2,Math.max(0,-y*2.6));col.push(t.r,t.g,t.b);}
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+1,c=a+N+1,d=c+1;idx.push(a,c,b,b,c,d);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();
  const mat=sbMat('#ffffff');mat.vertexColors=true;const ground=new THREE.Mesh(geo,mat);ground.name='venus-cloud';ground.receiveShadow=true;ground.frustumCulled=false;root.add(ground);keep.push(ground);
  const KEY={top:'#cdb2e6',horizon:'#dcc8ee',hemi:'#f1e6fb',ground:'#b99ad6',hemiI:.82,sun:'#fff4e6',sunI:.42,sunDir:[5,-9,3],fill:.3,fog:'#d6c0ea',fogNear:3,fogFar:24,stars:0,milky:0};
  const SK=G.sky.sky({parent:root,keys:[KEY,KEY,KEY],t:0,nStars:0});
  const pend=RIDE.pending&&RIDE.pending.cloud?RIDE.pending:null;if(pend)RIDE.pending=null;let arr=null,started=false;const st={arrDone:!pend};
  const U0=()=>G.view.camera&&G.mission.hero&&G.mission.hero();
  function update(dt,t){const W=U0();if(!W)return;if(pend&&!started){started=true;arr=cloudArrival({G,root,WL:W,groundY,mob:MOB,onDone:()=>{st.arrDone=true;}});}if(arr)arr.tick(dt,t);}
  function lateUpdate(dt,t){if(arr)arr.late(dt,t);}
  return {name:'금성 구름',kind:'outdoor',start:{compass:true},world:null,
    spawn:{x:0,z:0,ry:PI*.8},
    areas:{field:{bounds:[-B,B,-B,B],obstacles:[],camera:{target:[0,1,0],dist:9,polar:[.45,1.35],azimuth:null,start:[2.6,.95],minDist:3,maxDist:30}}},
    sun:{dir:new THREE.Vector3(...KEY.sunDir).normalize(),shadow:14,follow:true},
    sky:SK,far:60,ambience:'wind',charFog:.12, /* 캐릭터는 안개를 아주 약하게(game/bend markChar — 배경 안개는 그대로) */groundY,ground:[ground],keepOut:keep,
    arrival:()=>arr,state:()=>({arrDone:st.arrDone,landed:!!(arr&&arr.state.landed)}),spots:{spawn:[0,0]},
    update,lateUpdate,dispose(){if(arr){arr.dispose();arr=null;}const W=U0();if(W){W.scale.set(1,1,1);}}};}
