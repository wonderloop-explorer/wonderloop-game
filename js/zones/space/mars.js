/* 원더룹 무한 우주 ② 화성 — 임시 착지 자리 (2026-11-09)
   지금은 별똥별 꼬리 타기(meteor-ride.js)의 도착만: 회색 정원 출구에서 별똥별을 타고 오면(RIDE.pending) 하늘에서 내려와 원더룹을 놓아주고,
   화성 중력(약 38%)으로 천천히 떨어져 납작 → 통통 → 한 번 더 통통 → 붉은 먼지, 깜짝·갸웃·두리번 뒤 조작이 풀린다. 거기서 멈춤.
   STAGE 2 '붉은 모래 언덕' 내용(미션·주민·지형)은 기획서대로 따로 만든다 — 이 파일의 땅·바위는 그때 바꿀 임시 것.
   땅: 64m 판(휴대폰 1.8m·컴퓨터 1.3m 칸) + 파스텔 테라코타·살구 정점 색(밝은 모래 언덕 마루·어두운 돌 얼룩 — 색연필 결 툰 재질), 가운데 10m는 평평, 둥근 땅(bend k .008).
   하늘(2026-11-09 다듬기): 실제 화성 낮처럼 연한 버터스카치 → 지평선 쪽 먼지 낀 연분홍, 같은 분홍 안개 30~110m, 작고 흐린 해 + 작은 달 둘(포보스 크게·데이모스 작게 — 카메라를 따라다니는 하늘 판),
   먼 메사 실루엣(안개 속, noBend), 바람에 날리는 고운 먼지 알갱이. 바위 둥근 로우폴리(크기 여럿, 큰 것만 막힘). 그리기 수: 땅 1 · 바위(색 접기 병합) · 메사 1 · 하늘 1 · 해·달 3 · 먼지 2. */
import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {PI,QUALITY,rng} from '../../01-textures.js';
import * as G from '../../game/index.js';
import {sbMat} from '../../game/storybook.js';
import {RIDE,arrival,redDust} from './meteor-ride.js';
import SPACE from '../../worlds/infinite-space.js';
export function build({root}){
const MOB=QUALITY.tier==='mobile',R=rng('space-mars:props'),rnd=(a,b)=>a+(b-a)*R();
const SIZE=64,HALF=SIZE/2;
const groundY=(x,z)=>{const d=Math.hypot(x,z),f=Math.min(1,Math.max(0,(d-5)/10));
  const dune=Math.pow(Math.max(0,Math.sin(x*.16+Math.sin(z*.07)*2.2)),2)*.9; // 바람 쪽으로 길게 누운 모래 언덕
  return f*(Math.sin(x*.21)*Math.cos(z*.17)*.35+Math.sin((x-z)*.09)*.35+dune);};
/* 땅: 파스텔 테라코타·살구(개미굴·달과 같은 파스텔) — 밝은 모래 언덕(높은 곳·언덕 마루) + 어두운 돌 얼룩 + 테라코타 띠(정점 색) */
const N=MOB?36:48,gGeo=new THREE.PlaneGeometry(SIZE,SIZE,N,N);gGeo.rotateX(-PI/2);
{const p=gGeo.attributes.position,c=new Float32Array(p.count*3),A=new THREE.Color('#e8aa86'),SAND=new THREE.Color('#f5d0ab'),ROCK=new THREE.Color('#bf8a74'),TC=new THREE.Color('#dc9575'),t=new THREE.Color();
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),y=groundY(x,z);p.setY(i,y);const n1=Math.sin(x*.31+Math.sin(z*.23)*1.7)*Math.cos(z*.27-x*.11),n2=Math.sin((x+z)*.13)*Math.sin(x*.07-z*.19);
    t.copy(A).lerp(TC,Math.max(0,n2)*.55).lerp(SAND,Math.min(1,Math.max(0,y-.25)*1.1)).lerp(ROCK,Math.max(0,n1-.35)*.9);c.set([t.r,t.g,t.b],i*3);}
  gGeo.setAttribute('color',new THREE.BufferAttribute(c,3));gGeo.computeVertexNormals();}
const gMat=sbMat('#ffffff');gMat.vertexColors=true;
const ground=new THREE.Mesh(gGeo,gMat);ground.receiveShadow=true;ground.name='mars-ground';root.add(ground);
/* 바위: 둥근 로우폴리, 파스텔 흙빛(크기 여럿 — 큰 것만 막힘), 가운데 착지 자리 5m는 비움 */
const obstacles=[],keep=[ground];const RC=['#c99079','#b47d69','#dba489','#a9725f'];
for(let i=0;i<(MOB?34:52);i++){const a=rnd(0,PI*2),d=rnd(5.5,HALF-3),x=Math.cos(a)*d,z=Math.sin(a)*d,s=Math.pow(rnd(0,1),2)*1.6+.25;
  const m=new THREE.Mesh(new THREE.IcosahedronGeometry(s,s>1?1:0),sbMat(RC[(rnd(0,4)|0)%4]));m.position.set(x,groundY(x,z)+s*.25,z);m.scale.set(1,rnd(.55,.85),rnd(.85,1.15));m.rotation.y=rnd(0,PI);m.castShadow=!MOB;m.receiveShadow=true;root.add(m);
  if(s>.7)obstacles.push({c:[x,z,s*.85]});}
/* 먼 메사(꼭대기가 평평한 낮은 언덕) 실루엣: 땅 끝(지름 64m 판의 가장자리) 둘레에 고리로 — 둥근 땅이 같이 휘어 지평선 위로 꼭대기만 나옴,
   색은 안개(먼지 낀 분홍)에 가깝게 옅어 멀리 안개 속에 있는 것처럼(가까운 안개로는 흐려지지 않는 거리라 색으로). 그리기 1 */
{const mm=sbMat('#e8bcab');const geos=[];
  for(let i=0;i<(MOB?9:12);i++){const a=i/(MOB?9:12)*PI*2+rnd(-.18,.18),d=rnd(30.5,31.5),w=rnd(8,15),h=rnd(3.8,5.6),g=new THREE.CylinderGeometry(w*.84,w,h,8,4);g.scale(1,1,rnd(.35,.55));
    g.rotateY(-a+PI/2);g.translate(Math.cos(a)*d,groundY(Math.cos(a)*d,Math.sin(a)*d)+h/2-.6,Math.sin(a)*d);geos.push(g);}
  const me=new THREE.Mesh(mergeGeometries(geos),mm);me.name='mars-mesa';me.userData.noMerge=true;root.add(me);keep.push(me);}
/* 하늘: 실제 화성 낮 하늘처럼 연한 버터스카치(누런 살구빛) → 지평선 쪽 먼지 낀 연분홍, 안개도 같은 분홍(먼 메사가 흐려짐) */
const key={top:'#e3bd8f',horizon:'#efc4b4',hemi:'#f6dcc6',ground:'#c98d73',hemiI:.64,sun:'#fff0dc',sunI:.78,sunDir:[-4,-7,-6],fill:.24,fog:'#ecc3b3',fogNear:34,fogFar:125,stars:0,milky:0};
const SK=G.sky.sky({parent:root,keys:[key,key,key],t:0,nStars:20,starSize:2});
/* 작고 흐린 해 + 작은 달 둘(포보스가 조금 더 크게, 데이모스는 작게): 카메라를 따라다니는 하늘 판(그리기 3) — 도착 카메라(원더룹 앞쪽 3/4)가 보는 +x·+z 쪽 하늘에 */
const skyG=new THREE.Group();skyG.name='mars-sky';root.add(skyG);
const tex=(n,draw)=>{const c=document.createElement('canvas');c.width=c.height=n;draw(c.getContext('2d'),n);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;};
const disc=(texd,size,dir,add)=>{const m=new THREE.SpriteMaterial({map:texd,transparent:true,depthWrite:false,fog:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending});m.userData.noBend=true;
  const sp=new THREE.Sprite(m);sp.scale.setScalar(size);sp.position.copy(new THREE.Vector3(...dir).normalize().multiplyScalar(90));sp.renderOrder=-5;skyG.add(sp);return sp;};
disc(tex(128,(g,n)=>{const c=n/2,gr=g.createRadialGradient(c,c,0,c,c,c);gr.addColorStop(0,'rgba(255,252,240,1)');gr.addColorStop(.16,'rgba(255,246,228,.95)');gr.addColorStop(.3,'rgba(250,226,206,.32)');gr.addColorStop(1,'rgba(240,200,180,0)');g.fillStyle=gr;g.fillRect(0,0,n,n);}),
  9,[5,3.4,4.2],true); // 해: 지구에서보다 작고 흐리게(해가 비추는 방향의 반대쪽 하늘)
const moonTex=(seed)=>tex(96,(g,n)=>{const c=n/2;let s=seed;const r=()=>((s=(s*16807)%2147483647)/2147483647);g.beginPath();for(let i=0;i<=40;i++){const a=i/40*PI*2,k=1+.13*Math.sin(a*2+seed)+.07*Math.sin(a*5+seed*2);g.lineTo(c+Math.cos(a)*c*.78*k*(1+.25*Math.cos(a)),c+Math.sin(a)*c*.62*k);}g.closePath();
  g.fillStyle='#cdbcb4';g.fill();g.save();g.clip();const sh=g.createLinearGradient(0,0,n,n);sh.addColorStop(0,'rgba(255,248,240,.45)');sh.addColorStop(1,'rgba(120,90,90,.35)');g.fillStyle=sh;g.fillRect(0,0,n,n);
  for(let i=0;i<7;i++){g.beginPath();g.arc(n*(.25+r()*.5),n*(.3+r()*.4),n*(.04+r()*.06),0,PI*2);g.fillStyle='rgba(150,120,118,.35)';g.fill();}g.restore();});
disc(moonTex(11),4.2,[.9,.36,.28],false); // 포보스(조금 더 크게, 감자 모양)
disc(moonTex(29),2.4,[.25,.42,.9],false); // 데이모스(작게)
/* 바람에 날리는 고운 먼지 알갱이(원더룹 둘레 상자 안에서 바람 쪽으로 흘러감 — 그리기 1) */
const fineN=MOB?80:160,fine=(()=>{const pos=new Float32Array(fineN*3),ph=new Float32Array(fineN);for(let i=0;i<fineN;i++){pos.set([rnd(-12,12),rnd(.1,3.2),rnd(-12,12)],i*3);ph[i]=rnd(0,6);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const m=new THREE.PointsMaterial({color:new THREE.Color('#f8e2cc'),size:.07,transparent:true,opacity:.55,depthWrite:false,sizeAttenuation:true});const pts=new THREE.Points(geo,m);pts.frustumCulled=false;pts.userData.noMerge=true;root.add(pts);keep.push(pts);
  const base=new THREE.Vector3();return {tick(dt,t,P){const a=geo.attributes.position.array;for(let i=0;i<fineN;i++){let x=a[i*3]+dt*(1.3+.4*Math.sin(t+ph[i])),y=a[i*3+1]+Math.sin(t*1.7+ph[i])*dt*.25,z=a[i*3+2]+dt*.35;
      const lx=x-P.x,lz=z-P.z;if(lx>12)x-=24;if(lx<-12)x+=24;if(lz>12)z-=24;if(lz<-12)z+=24;if(y>3.4)y=.1;a[i*3]=x;a[i*3+1]=y;a[i*3+2]=z;}geo.attributes.position.needsUpdate=true;}};})();
const dust=redDust(root,MOB?70:120);keep.push(dust.pts);
/* 별똥별을 타고 왔으면: 도착 연출 */
if(SPACE.music)G.sound.songs({[SPACE.music.id]:SPACE.music.song});
const pend=RIDE.pending;RIDE.pending=null;let arr=null,started=false;
const U0=()=>G.mission.hero&&G.mission.hero();
function update(dt,t){const W=U0();if(!W)return;
  if(pend&&!started&&G.view.camera){started=true;arr=arrival({G,root,WL:W,groundY,mob:MOB,dust,onDone:()=>{G.ui.toast('붉은 화성에 도착했어요! 화성 중력은 지구의 약 38%예요',4.2);}});}
  if(arr)arr.tick(dt,t);dust.tick(dt);fine.tick(dt,t,W.position);const c=G.view.camera;if(c)skyG.position.copy(c.position);}
function lateUpdate(dt,t){if(arr)arr.late(dt,t);}
return {
  name:'붉은 모래 언덕(임시)',kind:'outdoor',start:{compass:true},world:null,
  spawn:{x:0,z:0,ry:PI},
  areas:{field:{bounds:[-HALF+3,HALF-3,-HALF+3,HALF-3],obstacles,camera:{target:[0,1,0],dist:9,polar:[.45,1.35],azimuth:null,start:[2.6,.95],minDist:3,maxDist:30}}},
  sun:{dir:new THREE.Vector3(-5,-6,-7).normalize(),shadow:12,follow:true},
  sky:SK,bend:{k:.008,d0:6},gravity:.38,jumpK:1.15,rim:.2,camRoom:{c:[0,0],r:HALF-4},
  groundY,ground:[ground],keepOut:keep,mergeColors:true,music:SPACE.music?{id:SPACE.music.id,fade:2}:null, // 세계 배경음을 이어받음(같은 곡이면 끊김 없이 — 별똥별로 왔으면 이동 테마 뒤에 game/travel이 서서히 올림)
  arrival:()=>arr, /* 시험 도구가 읽음 */
  update,lateUpdate,dispose(){if(arr){arr.dispose();arr=null;}},
};
}
