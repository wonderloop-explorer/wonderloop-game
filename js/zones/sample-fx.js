/* 원더룹 견본 구역: 휴대폰 성능 시험 장면 (?zonetest 전용, 세계 콘텐츠 아님)
   아이폰에서 색점·빛 번짐·프레임 저하가 없는지 새 세계를 만들기 전에 먼저 보는 곳. 한 장면에 모았다.
   - 반투명 판: 서 있는 큰 판 견본 + 무리마다 등에 단 작은 판. 앞뒤가 다 보이는 양면, 깊이 쓰기 끔(반투명 정렬 문제 확인)
   - 등불 빛: 큰 버섯 등불 4개 + 작은 기둥 등 8개 — 엔진 공통 등불(game/lamps.js, 모바일 조명 규칙): 스스로 빛나는 재질 + 빛무리 + 바닥 빛 웅덩이,
     진짜 조명(점광원)은 원더룹 가까운 등불 하나에만. (처음엔 등불마다 점광원이었는데 아이폰에서 프레임 시간 22.7ms 중 6ms를 써서 바꿈)
   - 낙엽·눈 파티클: 낙엽은 InstancedMesh(색 3가지), 눈은 Points — 원더룹 둘레 상자 안에서 돌고 돈다
   - 같은 모델 여러 개: 무리 60(몸·머리 InstancedMesh, 통통 뛰거나 떠 있음), 조약돌 40(통나무 위 줄)
   - 진짜 점프·활공(07 높이 이동): 튀는 버섯을 밟으면 그루터기 위로, 그루터기에서 걸어 나가면 시험용 활공 물건(둥근 천)을 펼쳐 활공(06 setGlideProp)
   - 남은 개수 카운터(game/hud) 견본: '하나 줄이기' 단추
   - 손으로 하는 상호작용(game/interact): 큰 바퀴를 눌러 손으로 돌리기, 물뿌리개를 집어 들고(오른손 setHeld) 새싹에 뿌리기, '머리 만져 보기' 단추
   - 바람길·통과 링(02 winds, game/course): 그루터기에서 활공해 나가면 바람이 앞으로 밀고 위로 띄워 준다. 링 세 개를 지나면 금빛으로. '바람 방향 바꾸기' 단추
   - 자라는 발판(02 platforms의 top을 바꿈): 물뿌리개로 새싹 계단 세 개에 물을 주면 차례로 자라 올라갈 수 있다
   - 탈것(game/ride): 둥근 배를 눌러 '타기' → 정해진 길로 건너편까지 태워 감
   - 따라오는 동행(game/companion): '동행 켜기' 단추 — 작은 빛이 원더룹 옆쪽 조금 앞에서 따라온다
   - 탈 모습 바뀌기(06 morphHood): '탈 바뀜' 단추 — 탐험 모자 ↔ 개미탈을 통 튀어나오며 바꾸고 빛 입자 터뜨림(두 모습 탈의 견본)
   - 꾸미기 칸(06 addBadge): '배지 달기' 단추 — 조끼 왼쪽 가슴과 배낭 덮개에 시험 배지
   - 화면 전환(game/ui transition): '화면 전환' 단추 — 서서히 덮였다가 원더룹을 처음 자리로 옮기고 밝아짐
   - 코드로 연주하는 배경음(game/music.js): '배경음' 단추로 요정의 숲 다섯 곡(선착장·공중정원·장터·수로·첫별 축제)을 차례로 → 끔, '축제 활짝'은 축제 곡을 바로 다 피움, '대사 견본'으로 배경음 줄이기
   - 하늘과 시간 흐름(game/sky): '시간' 단추로 낮 → 해 질 녘 → 밤(첫별)으로 천천히. 이 구역은 낮/저녁/굴 단추 대신 하늘 시간을 따른다
   - 떠오르는 빛 입자(game/fx particles): 원더룹 둘레에서 위로 떠오르는 빛, '빛 입자 터뜨리기' 단추로 한꺼번에(별꽃 개화 견본)
   화면 왼쪽 위 시험판: 초당 프레임(평균·가장 느린 프레임), 드로우콜·삼각형, 항목마다 켜고 끄기, 낮/저녁/어두운 굴.
   "자동 측정": 모두 켬 → 항목을 하나씩 끔(판·등불 빛·빛무리·낙엽·눈·무리·그림자) → 모두 끔 → 픽셀 비율 바꾸기를
   차례로 재서 표로 보여 준다. 결과는 window.wlFx.results에도. 렌더러는 장면의 onBeforeRender로 받는다(03을 건드리지 않음).
   주소 옵션: &fx=-glow,-snow (처음부터 끌 항목), &leaves=300 &snow=800 &crowd=60 &stones=40 (개수), &wing=blend|test (반투명 판 방식)
   난수는 rng('sample-fx:…').
   품질 단계(01 QUALITY): 휴대폰 단계는 진짜 그림자 대신 동그란 그림자(shadowBlob·blobMany), 시험판에서 그림자 단추·그림자 측정이 빠진다.
   휴대폰 단계를 컴퓨터에서 보려면 &quality=mobile. */
import * as THREE from 'three';
import {M,PI,QUALITY,add,blob,blobMany,cylAt,group,lin,rng,shadowBlob} from '../01-textures.js';
import * as G from '../game/index.js';
import {FAIRY_MUSIC,SONGS} from './fairy/music.js';
export function build({root}){
const Q=new URLSearchParams(location.search),num=(k,d)=>{const v=parseInt(Q.get(k),10);return Number.isFinite(v)&&v>=0?Math.min(v,5000):d;};
const OFF=new Set((Q.get('fx')||'').split(',').filter(s=>s[0]==='-').map(s=>s.slice(1)));
const WING_MODE=Q.get('wing')==='test'?'test':'blend';
const R=rng('sample-fx:props'),rnd=(a,b)=>a+(b-a)*R();
const SIZE=40;
// 바닥: 낙엽 깔린 땅
const ground=add(new THREE.PlaneGeometry(SIZE,SIZE).rotateX(-PI/2),M('#c99a62','plain',{rep:[10,10]}),0,0,0,{cast:false,line:false});
const obstacles=[];
/* ---------- 캔버스 그림 (이 견본 전용, 굽지 않음) ---------- */
const canvasTex=(S,draw)=>{const cv=document.createElement('canvas');cv.width=cv.height=S;draw(cv.getContext('2d'),S);const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;return t;};
// 반투명 판: 가장자리가 진한 연한 막 + 가는 테, 바깥은 투명 (둥근 모서리 판)
const wingTex=canvasTex(256,(g,S)=>{g.clearRect(0,0,S,S);
  const r=S*.18,x0=S*.06,y0=S*.06,x1=S*.94,y1=S*.94;g.beginPath();g.moveTo(x0+r,y0);g.lineTo(x1-r,y0);g.quadraticCurveTo(x1,y0,x1,y0+r);g.lineTo(x1,y1-r);g.quadraticCurveTo(x1,y1,x1-r,y1);
  g.lineTo(x0+r,y1);g.quadraticCurveTo(x0,y1,x0,y1-r);g.lineTo(x0,y0+r);g.quadraticCurveTo(x0,y0,x0+r,y0);g.closePath();
  const gr=g.createRadialGradient(S*.3,S*.7,S*.05,S*.5,S*.5,S*.7);gr.addColorStop(0,'rgba(236,244,240,0.55)');gr.addColorStop(1,'rgba(200,220,226,0.30)');g.fillStyle=gr;g.fill();
  g.lineWidth=5;g.strokeStyle='rgba(140,160,170,0.9)';g.stroke();});
wingTex.anisotropy=4;
const wingMat=new THREE.MeshStandardMaterial({map:wingTex,side:THREE.DoubleSide,roughness:0.8,metalness:0,
  ...(WING_MODE==='test'?{alphaTest:0.25,transparent:false}:{transparent:true,depthWrite:false})});
// 판 한 장: 한쪽 모서리가 원점에 오도록 옮긴 판
const wingGeo=new THREE.PlaneGeometry(1,1).translate(0.5,0.5,0);
// 빛무리: 가운데만 밝고 바깥으로 사라지는 둥근 점 (덧칠)
const snowTex=canvasTex(64,(g,S)=>{const gr=g.createRadialGradient(S/2,S/2,0,S/2,S/2,S/2);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(0.5,'rgba(255,255,255,0.8)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,S,S);});
/* ---------- 1. 버섯 등불 (큰 버섯 4개 — 진짜 조명은 가까운 하나만) ---------- */
const lampOn={on:!OFF.has('lamps')},glowOn={on:!OFF.has('glow')};
const LS=G.lamps.lampSet({parent:root,real:1}); // 진짜 조명 1개가 원더룹 가까운 등불로 옮겨 다님
const mushroomLamp=(x,z,s,cap)=>{const g=group(x,0,z,rnd(0,PI*2));
  cylAt(0.22*s,0.3*s,2.2*s,M('#f1e2c4','plain'),0,0,0,{parent:g});
  const capG=new THREE.SphereGeometry(1.15*s,14,8,0,PI*2,0,PI*0.5);add(capG,M(cap,'dots',{rep:[2,1]}),0,2.15*s,0,{parent:g,s:[1,0.62,1],thr:30});
  const gm=new THREE.MeshStandardMaterial({color:lin('#fff1cf'),emissive:lin('#ffcb7a'),emissiveIntensity:0.6,roughness:1,side:THREE.DoubleSide});
  add(new THREE.CircleGeometry(1.12*s,14),gm,0,2.14*s,0,{parent:g,rx:PI/2,line:false,cast:false});
  LS.add({x,y:1.7*s,z,reach:7*s,glow:{y:1.95*s,size:2.4*s,op:0.5},pool:{r:3.4*s,op:0.42},emissive:[gm]});
  blob(x,z,1.3*s,1.3*s,0.3);obstacles.push({c:[x,z,0.35*s]});};
mushroomLamp(-3.2,-2.6,1.25,'#d9573f');mushroomLamp(3.4,-3.4,1.4,'#c9733d');mushroomLamp(-4.4,2.8,1.05,'#e08a4c');mushroomLamp(4.2,2.4,1.1,'#cf5a44');
// 작은 기둥 등: 기둥 끝에 빛나는 공 (빛무리만, 점광원 없음)
const postLit=new THREE.MeshStandardMaterial({color:lin('#fff4d6'),emissive:lin('#ffd08a'),emissiveIntensity:0.8,roughness:1});
for(let i=0;i<8;i++){const a=i/8*PI*2+0.2,d=6.2,x=Math.cos(a)*d,z=Math.sin(a)*d,g=group(x,0,z,0);
  cylAt(0.025,0.025,1.1,M('#8a6244','wood',{rep:[3,1]}),0,0,0,{parent:g,line:false});shadowBlob(x,z,0.22,0.22);
  add(new THREE.SphereGeometry(0.13,10,8),postLit,0,1.22,0,{parent:g,line:false,cast:false});
  LS.add({x,y:1.22,z,glow:{y:1.22,size:0.9,op:0.55},pool:{r:0.9,op:0.3},emissive:[postLit]});}
/* ---------- 2. 반투명 판 견본 (서 있는 큰 판 — 가까이서 가장자리를 보는 곳) ---------- */
const wingShow=group(0,0,-5.2,0);
cylAt(0.05,0.07,1.2,M('#8a6244','wood'),0,0,0,{parent:wingShow});
[-1,1].forEach(sd=>{const w=new THREE.Mesh(wingGeo,wingMat);w.scale.set(sd*1.4,1.1,1);w.position.set(0,1.15,0);w.rotation.y=sd*0.35;w.castShadow=false;wingShow.add(w);
  const w2=new THREE.Mesh(wingGeo,wingMat);w2.scale.set(sd*0.9,0.7,1);w2.position.set(0,1.0,0.02);w2.rotation.set(0,sd*0.5,-sd*0.9);w2.castShadow=false;wingShow.add(w2);});
obstacles.push({c:[0,-5.2,0.4]});shadowBlob(0,-5.2,0.9,0.6,0.3);
/* ---------- 3. 무리 (엔진 무리 도우미 game/fx crowd — 몸·머리·등의 반투명 판마다 InstancedMesh) ---------- */
const NF=num('crowd',60);
const fBlob=blobMany(NF,0.4); // 휴대폰 단계: 무리마다 발밑 동그란 그림자(뛰어오르면 작아짐) — crowd가 함께 옮긴다
const CR=G.fx.crowd({parent:root,n:NF,blobs:fBlob,parts:[{geo:new THREE.CapsuleGeometry(0.11,0.14,4,10),mat:M('#f1e2c4','plain'),at:[0,0.18,0]},{geo:new THREE.SphereGeometry(0.13,12,10),mat:M('#f1e2c4','plain'),at:[0,0.45,0]}]});
const crowd=CR.group,[fBody,fHead]=CR.meshes;
const fWing=new THREE.InstancedMesh(wingGeo,wingMat,NF*2);fWing.castShadow=false;fWing.receiveShadow=true;fWing.frustumCulled=false;fWing.instanceMatrix.setUsage(THREE.DynamicDrawUsage);crowd.add(fWing);
const FAIRY=[];for(let i=0;i<NF;i++){const a=rnd(0,PI*2),d=rnd(2.2,8.5);FAIRY.push({x:Math.cos(a)*d,z:Math.sin(a)*d,ry:rnd(0,PI*2),ph:rnd(0,PI*2),sp:rnd(0.8,1.4),hov:R()<0.35});}
{const c=new THREE.Color();for(let i=0;i<NF;i++){c.set(['#9cc08a','#e3b25b','#d98a6a','#b7a3d4'][i%4]);fBody.setColorAt(i,c);}fBody.instanceColor.needsUpdate=true;}
/* ---------- 4. 조약돌 줄 (통나무 위에 줄지어) ---------- */
const NB=num('stones',40),bugs=new THREE.Group();root.add(bugs);
const logG=group(6.5,0,-0.5,-0.4);cylAt(0.7,0.8,6,M('#8a6244','wood',{rep:[3,1]}),0,0,0,{parent:logG,rx:PI/2,thr:40});obstacles.push({r:[5.6,7.4,-3.6,2.6]});shadowBlob(6.2,-0.5,1.5,3.4);
const bShell=new THREE.InstancedMesh(new THREE.SphereGeometry(0.16,14,8,0,PI*2,0,PI*0.5),M('#f1e2c4','plain'),NB);
bShell.castShadow=true;bShell.receiveShadow=true;bShell.frustumCulled=false;bugs.add(bShell);
{const o=new THREE.Object3D(),c=new THREE.Color();for(let i=0;i<NB;i++){const u=i/Math.max(1,NB-1),row=i%2;
   const x=6.5+(row?0.18:-0.18)+Math.sin(i*1.7)*0.05,y=0.8+u*2.2,z=-3+u*5.5;
   o.position.set(x,y,z);o.rotation.set(0,rnd(0,PI*2),0);o.scale.set(rnd(0.9,1.15),rnd(0.6,0.9),rnd(0.9,1.15));o.updateMatrix();bShell.setMatrixAt(i,o.matrix);
   c.set(['#b9aa98','#a39686','#c9bba8'][i%3]);bShell.setColorAt(i,c);}if(NB)bShell.instanceColor.needsUpdate=true;}
// 굵은 기둥 (조약돌 줄이 닿는 곳)
cylAt(0.9,1.2,7,M('#7a5a40','wood',{rep:[2,3]}),6.6,0,3.6,{thr:40});obstacles.push({c:[6.6,3.6,1.2]});shadowBlob(6.6,3.6,1.7,1.7,0.45);
/* ---------- 6. 튀는 버섯 · 높은 그루터기 (점프·활공 시험) ----------
   버섯 갓을 밟으면(누르면 걸어가서 밟음) 통통 튀어 그루터기 위에 내려앉는다. 그루터기 가장자리를 걸어 나가면
   시험용 활공 물건(둥근 천 지붕)을 머리 위로 펼쳐 천천히 내려온다(glide:true). 세계마다 펼치는 물건은 06 setGlideProp으로 바꾼다. */
const STUMP={x:1.8,z:5.0,r:1.0,top:1.8},BOUNCE={x:1.8,z:3.2,r:.5,top:.38};
const stumpG=group(STUMP.x,0,STUMP.z,0.3);cylAt(STUMP.r,STUMP.r*1.12,STUMP.top,M('#8a6244','wood',{rep:[3,1]}),0,0,0,{parent:stumpG,thr:40});
const stumpTop=add(new THREE.CircleGeometry(STUMP.r*.98,24).rotateX(-PI/2),M('#e1bf92','rings'),0,STUMP.top+.002,0,{parent:stumpG,cast:false,line:false});
shadowBlob(STUMP.x,STUMP.z,STUMP.r*1.5,STUMP.r*1.5,.45);
const bounceG=group(BOUNCE.x,0,BOUNCE.z,0);cylAt(.1,.13,.3,M('#f1e2c4','plain'),0,0,0,{parent:bounceG,line:false});
const bounceCap=add(new THREE.SphereGeometry(.56,16,8,0,PI*2,0,PI*.5),M('#d9573f','dots',{rep:[2,1]}),0,.28,0,{parent:bounceG,s:[1,.45,1],thr:30});
shadowBlob(BOUNCE.x,BOUNCE.z,.65,.65);
let squash=0; // 튈 때 갓이 출렁
// 시험용 활공 물건: 머리 위 둥근 천 지붕(가운데가 가장 높고 가장자리가 아래로 휨) — 세계 콘텐츠가 아닌 확인용 모양
const glideCloth=(()=>{const geo=new THREE.CircleGeometry(1,28);const p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);p.setXYZ(i,x*1.5,-(x*x*.5+y*y*.35),y);}
  geo.computeVertexNormals();const m=new THREE.Mesh(geo,M('#f1e2c4','plain'));m.material.side=THREE.DoubleSide;m.position.y=.05;m.castShadow=true;return m;})();
/* ---------- 5. 낙엽 (InstancedMesh) · 눈 (Points) ---------- */
const BOX=[14,6,14]; // 원더룹 둘레 x·y·z 범위
const NL=num('leaves',300),NS=num('snow',800);
const leafShape=new THREE.Shape();{const P=[[0,0],[.16,.22],[.42,.2],[.3,.42],[.46,.62],[.2,.6],[0,.95],[-.2,.6],[-.46,.62],[-.3,.42],[-.42,.2],[-.16,.22]];leafShape.moveTo(P[0][0],P[0][1]);P.slice(1).forEach(p=>leafShape.lineTo(p[0],p[1]));leafShape.closePath();}
const leafGeo=new THREE.ShapeGeometry(leafShape).translate(0,-.45,0).scale(0.22,0.22,0.22);
const leaves=new THREE.InstancedMesh(leafGeo,new THREE.MeshStandardMaterial({color:0xffffff,side:THREE.DoubleSide,roughness:0.9}),NL);
leaves.castShadow=false;leaves.receiveShadow=false;leaves.frustumCulled=false;leaves.instanceMatrix.setUsage(THREE.DynamicDrawUsage);root.add(leaves);
const LEAF=[];{const c=new THREE.Color(),cols=['#e2733f','#e9a43a','#c2463a','#d8893d'];for(let i=0;i<NL;i++){LEAF.push({x:rnd(-1,1)*BOX[0],y:rnd(0,BOX[1]),z:rnd(-1,1)*BOX[2],ph:rnd(0,PI*2),v:rnd(0.35,0.7),sp:rnd(1,3)});c.set(cols[i%cols.length]);leaves.setColorAt(i,c);}if(NL)leaves.instanceColor.needsUpdate=true;}
const snowGeo=new THREE.BufferGeometry(),snowPos=new Float32Array(NS*3),SNOW=[];
for(let i=0;i<NS;i++){SNOW.push({x:rnd(-1,1)*BOX[0],y:rnd(0,BOX[1]*1.5),z:rnd(-1,1)*BOX[2],ph:rnd(0,PI*2),v:rnd(0.25,0.5)});}
snowGeo.setAttribute('position',new THREE.BufferAttribute(snowPos,3).setUsage(THREE.DynamicDrawUsage));
const snowMat=new THREE.PointsMaterial({size:0.09,map:snowTex,color:0xffffff,transparent:true,opacity:0.9,depthWrite:false,sizeAttenuation:true});
const snow=new THREE.Points(snowGeo,snowMat);snow.frustumCulled=false;root.add(snow);
/* ---------- 8. 손으로 하는 상호작용 (돌리기 · 집어 들기 · 뿌리기) ---------- */
// 큰 바퀴: 누르면 원더룹이 앞에 가서 두 손으로 돌린다 → 바퀴가 90도 돌아간다(여러 번 가능)
const wheelG=group(-2.4,0,4.2,0);cylAt(.06,.08,.9,M('#8a6244','wood',{rep:[3,1]}),0,0,0,{parent:wheelG,line:false});
const wheel=new THREE.Group();wheel.position.set(0,.95,0);wheelG.add(wheel);
add(new THREE.TorusGeometry(.42,.05,8,20),M('#d9573f','plain'),0,0,0,{parent:wheel,line:false});
for(let k=0;k<4;k++)add(new THREE.BoxGeometry(.06,.84,.05),M('#f1e2c4','plain'),0,0,0,{parent:wheel,rz:k*PI/4,line:false});
obstacles.push({c:[-2.4,4.2,.3]});shadowBlob(-2.4,4.2,.5,.3);let wheelGoal=0;
G.interact.add({root:wheelG,at:[-2.4,3.45],face:[-2.4,4.2],label:'돌리기',action:'돌리기',dur:1.8,once:false,onDone:()=>{wheelGoal+=PI/2;}});
// 물뿌리개: 받침 위의 물뿌리개를 집어 들면(살펴보기 동작) 오른손에 쥔다 → 새싹 앞에서 뿌리기 → 새싹이 자란다
const canMesh=()=>{const g=new THREE.Group();const body=new THREE.Mesh(new THREE.CylinderGeometry(.075,.085,.13,12),M('#7fb2c9','plain'));body.position.set(0,-.02,.07);g.add(body);
  const sp=new THREE.Mesh(new THREE.CylinderGeometry(.012,.018,.16,6),M('#7fb2c9','plain'));sp.position.set(0,.02,.19);sp.rotation.x=1.0;g.add(sp);
  const hd=new THREE.Mesh(new THREE.TorusGeometry(.05,.012,6,12,PI),M('#5a8aa0','plain'));hd.position.set(0,.04,0);hd.rotation.y=PI/2;g.add(hd);return g;};
const standG=group(2.6,0,-1.4,0);cylAt(.18,.2,.5,M('#8a6244','wood',{rep:[3,1]}),0,0,0,{parent:standG,line:false});
const canOnStand=canMesh();canOnStand.position.set(0,.6,0);canOnStand.scale.setScalar(1.6);standG.add(canOnStand);obstacles.push({c:[2.6,-1.4,.25]});shadowBlob(2.6,-1.4,.3,.3);
let holding=false;
G.interact.add({root:standG,label:'집어 들기',action:'들여다보기',dur:.9,onDone:()=>{canOnStand.visible=false;holding=true;WL&&WL.userData.setHeld(canMesh());}});
const sproutG=group(3.4,0,1.2,0);const sprout=new THREE.Group();sproutG.add(sprout);
add(new THREE.CylinderGeometry(.02,.03,.3,6),M('#7fa65a','plain'),0,.15,0,{parent:sprout,line:false});
add(new THREE.SphereGeometry(.09,8,6),M('#9cc08a','plain'),0,.32,0,{parent:sprout,s:[1.4,.5,1],line:false});
let grow=0,growGoal=0;
const drops=G.fx.particles({parent:root,n:40,box:[.08,.05,.08],vel:[0,-1.2,0],sway:.03,color:'#bfe6ff',size:.05,life:[.4,.7],additive:false,rate:0.0001,seed:31});
G.interact.add({root:sproutG,label:'뿌리기',action:'뿌리기',dur:1.8,once:false,when:()=>!!(WL&&WL.userData.heldObj),
  onStart:()=>{sprinkle=1.6;},onDone:()=>{growGoal=Math.min(3,growGoal+1);}});
let sprinkle=0;
/* ---------- 9. 바람길 · 통과 링 · 자라는 계단 ---------- */
const WIND={r:[0.6,6.5,5.6,13.5],dir:[.35,.94],strength:1.4,up:.7,y:[.2,6]};
const streaks=G.fx.particles({parent:root,n:60,box:[2.6,1.4,3.6],center:[3.4,1.2,9.5],vel:[WIND.dir[0]*3,.2,WIND.dir[1]*3],sway:.05,color:'#f6f1e0',size:.07,life:[1,2],additive:false,seed:41});
const RINGS=[[2.0,1.7,7.2],[2.8,1.9,9.0],[3.5,2.0,10.8]].map(([x,y,z],i)=>{const m=add(new THREE.TorusGeometry(.75,.06,8,28),M('#e9dcc0','plain'),x,y,z,{line:false,cast:false});
  const R=G.course.ring({at:[x,y,z],ry:0,r:.75,onPass:()=>{m.material=M('#f2b63c','plain');motes.burst(30,{x,y,z});}});return {m,R};});
const STAIRS=[[-4.6,-2.0],[-4.6,-2.9],[-4.6,-3.8]].map(([x,z],i)=>{const g=group(x,0,z,0);const stem=add(new THREE.CylinderGeometry(.12,.16,1,10),M('#f1e2c4','plain'),0,.5,0,{parent:g,line:false});
  const cap=add(new THREE.SphereGeometry(.5,14,8,0,PI*2,0,PI*.5),M('#d9573f','dots',{rep:[2,1]}),0,1,0,{parent:g,s:[1,.4,1],thr:30});
  const P={c:[x,z,.5],top:.06},it={g,stem,cap,P,h:.06,goal:.06,k:i};
  G.interact.add({root:g,label:'뿌리기',action:'뿌리기',dur:1.6,when:()=>!!(WL&&WL.userData.heldObj)&&(i===0||STAIRS[i-1].goal>.06),onStart:()=>{sprinkle=1.4;},onDone:()=>{it.goal=.2*(i+1);}});return it;});
/* ---------- 10. 탈것 · 동행 ---------- */
// 둥근 배: 누르면 원더룹이 다가가 올라타고(들여다보기 동작 뒤) 길을 따라 건너편으로 → 내려 준다. 다시 누르면 돌아온다
const boat=new THREE.Group();boat.position.set(-7,0,6);root.add(boat);
add(new THREE.SphereGeometry(.75,16,10,0,PI*2,PI*.5,PI*.5),M('#bfe2ea','plain'),0,.55,0,{parent:boat,line:false});
add(new THREE.CircleGeometry(.72,16).rotateX(-PI/2),M('#e9f6f8','plain'),0,.54,0,{parent:boat,line:false,cast:false});
const ROUTE=[[-7,0,6],[-8.5,0,8],[-8,0,10.5],[-6,0,12]];let boatAt=0;
G.interact.add({root:boat,label:'타기',action:'들여다보기',dur:.6,once:false,when:()=>!G.ride.riding(),
  onDone:()=>{const path=boatAt?ROUTE.slice().reverse():ROUTE;G.ride.ride({vehicle:boat,path,speed:1.4,seat:.55,onEnd:()=>{boatAt=1-boatAt;const e=path[path.length-1],p=path[path.length-2];const dx=e[0]-p[0],dz=e[2]-p[2],d=Math.hypot(dx,dz)||1;WL&&WL.position.set(e[0]+dx/d*1.1,0,e[2]+dz/d*1.1);}});}});
// 동행: 작은 빛(발광 공 + 빛무리) — 반딧불 같은 견본
const fly=new THREE.Group();fly.add(new THREE.Mesh(new THREE.SphereGeometry(.06,10,8),new THREE.MeshBasicMaterial({color:0xfff2a8})));
{const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:snowTex,color:0xffe58a,transparent:true,opacity:.7,depthWrite:false,blending:THREE.AdditiveBlending}));sp.scale.setScalar(.45);fly.add(sp);}
const buddy=G.companion.companion({obj:fly,side:1,height:1.2});buddy.set(false);
/* ---------- 7. 하늘·시간 흐름(game/sky) · 떠오르는 빛 입자(game/fx) ---------- */
const SK=G.sky.sky({parent:root,t:0}),TN=['낮','해 질 녘','밤'];let ti=0;
const motes=G.fx.particles({parent:root,n:num('motes',160),box:[5,.4,5],vel:[0,.55,0],color:'#ffe6a0',size:.14,life:[3,6],seed:23});
/* ---------- 시험판 (화면 왼쪽 위) ---------- */
const parts={wings:[wingShow,fWing],lamps:null,glow:null,leaves:[leaves],snow:[snow],crowd:[crowd,bugs,...(fBlob?[fBlob]:[])],sky:[SK.group],motes:[motes.points],shadow:null};
if(!QUALITY.shadows)delete parts.shadow; // 휴대폰 단계: 진짜 그림자가 없으니 그림자 단추·측정도 없음
const on={};Object.keys(parts).forEach(k=>on[k]=!OFF.has(k));
const NAMES={wings:'반투명 판',lamps:'진짜 조명',glow:'빛무리·웅덩이',leaves:'낙엽',snow:'눈',crowd:'무리·조약돌',sky:'하늘',motes:'빛 입자',shadow:'그림자'};
// 렌더러·해(그림자)는 장면에서 받는다: 그림 그리기 직전 장면의 onBeforeRender가 렌더러를 넘겨준다
let gl=null,sunL=null,scn=null,prevBR=null;
const hook=()=>{if(scn||!root.parent)return;scn=root.parent;prevBR=scn.onBeforeRender;scn.onBeforeRender=function(r,...a){gl=r;return prevBR.call(this,r,...a);};
  sunL=scn.children.find(o=>o.isDirectionalLight&&o.castShadow)||null;};
const apply=()=>{['wings','leaves','snow','crowd','sky','motes'].forEach(k=>parts[k].forEach(o=>o.visible=on[k]));lampOn.on=on.lamps;glowOn.on=on.glow;if(sunL)sunL.castShadow=on.shadow;
  btns.forEach(b=>{b.setAttribute('aria-pressed',on[b.dataset.k]);b.textContent=NAMES[b.dataset.k]+(on[b.dataset.k]?' 켜짐':' 꺼짐');});};
const panel=document.createElement('div');panel.id='fxPanel';panel.className='wlg';
panel.style.cssText='position:fixed;left:calc(env(safe-area-inset-left,0px) + 8px);top:calc(env(safe-area-inset-top,0px) + 64px);z-index:30;background:rgba(255,246,234,.92);border-radius:14px;padding:8px 10px;font:13px/1.4 "Gowun Dodum",sans-serif;color:#3e2834;max-width:calc(100vw - 32px);box-shadow:0 6px 20px rgba(30,14,36,.25)';
const stat=document.createElement('div');stat.style.cssText='font-variant-numeric:tabular-nums;margin-bottom:6px;white-space:pre';panel.appendChild(stat);
const row=document.createElement('div');row.style.cssText='display:flex;flex-wrap:wrap;gap:6px';panel.appendChild(row);
const mkBtn=(txt,fn)=>{const b=document.createElement('button');b.textContent=txt;b.style.cssText='all:unset;cursor:pointer;background:#3f9fa0;color:#fffaf2;border-radius:999px;padding:6px 10px;min-height:20px';b.addEventListener('click',fn);row.appendChild(b);return b;};
const btns=Object.keys(parts).map(k=>{const b=mkBtn('',()=>{on[k]=!on[k];apply();});b.dataset.k=k;return b;});
// 시간: 낮 → 해 질 녘 → 밤(첫별) → 낮, 3초 동안 천천히 (이 구역은 낮/저녁/굴 단추 대신 하늘 시간을 따른다)
const timeBtn=mkBtn('시간: 낮',()=>{ti=(ti+1)%3;SK.to(ti,3);timeBtn.textContent='시간: '+TN[ti];});
// 코드로 연주하는 배경음 시험(game/music.js, 요정의 숲 다섯 곡): 단추를 누를 때마다 다음 곡 → 끔. 바꿀 때 크로스페이드. '대사 견본'으로 배경음 줄이기를 듣는다
G.sound.synth(FAIRY_MUSIC);const MUS=[null,...Object.keys(SONGS)];let mi=0;
const musBtn=mkBtn('배경음: 끔',()=>{mi=(mi+1)%MUS.length;const id=MUS[mi];G.sound.bed(id);musBtn.textContent='배경음: '+(id?SONGS[id].name:'끔');if(id)G.ui.toast('♪ '+SONGS[id].name);});
mkBtn('축제 활짝',()=>{const h=G.sound.bedHandle();if(h&&h.bloom)h.bloom();});
mkBtn('대사 견본',()=>G.dialog.say('토리','배경음이 작아지는지 들어 보세요. 말이 끝나면 다시 커져요.',3.5));
mkBtn('탈 바뀜',()=>{if(!WL)return;const U=WL.userData,to=U.hw===2?'ant':'hat';U.morphHood(to,{sec:1.2,onSwitch:()=>{const p=WL.position;motes.burst(50,{x:p.x,y:1.6,z:p.z});}});});
mkBtn('배지 달기',()=>{if(!WL)return;const U=WL.userData,mk=c=>{const m=new THREE.Mesh(new THREE.CircleGeometry(.045,14),new THREE.MeshStandardMaterial({color:c,roughness:.7}));return m;};
  U.addBadge({flag:'testBadge',obj:mk(0xf7a8c0),at:'vest'});U.addBadge({flag:'testBadge2',obj:mk(0xffd46a),at:'pack'});const on=!G.state.flags.testBadge;G.state.setFlag('testBadge',on);G.state.setFlag('testBadge2',on);});
mkBtn('화면 전환',()=>G.ui.transition(()=>{if(WL){WL.position.set(0,0,1.5);WL.userData.stopWalk();}}));
mkBtn('동행 켜기',function(){buddy.set(!buddy.on);this.textContent=buddy.on?'동행 끄기':'동행 켜기';});
mkBtn('바람 방향 바꾸기',()=>{WIND.dir=[-WIND.dir[0],WIND.dir[1]];});
mkBtn('머리 만져 보기',()=>{if(WL){WL.userData.action='머리 만져 보기';WL.userData.at=0;WL.userData.setExpr&&WL.userData.setExpr('놀람');}});
mkBtn('빛 입자 터뜨리기',()=>{const p=WL?WL.position:{x:0,z:0};motes.burst(80,{x:p.x,y:.4,z:p.z});});
// 남은 개수 카운터 견본(기본 그림): 단추를 누를 때마다 하나씩 떨어지고, 다 떨어지면 다시 다섯
const count5=G.hud.counter({id:'sample',max:5,value:5,label:'남은 개수'});
mkBtn('하나 줄이기',()=>count5.set(count5.value>0?count5.value-1:5));
// 휴대폰 세로 화면에서는 아래 단추 묶음이 장면 절반을 가린다 → 숨기고 장면만 보기
const pageUi=[...document.querySelectorAll('.bar,#stats,.hint')];const uiShown=pageUi.map(e=>e.style.display);let uiHidden=false;
const hideBtn=mkBtn('아래 단추 숨기기',()=>{uiHidden=!uiHidden;pageUi.forEach((e,i)=>e.style.display=uiHidden?'none':uiShown[i]);hideBtn.textContent=uiHidden?'아래 단추 보이기':'아래 단추 숨기기';});
const measBtn=mkBtn('자동 측정',()=>autoMeasure());measBtn.style.background='#c4683f';
const resEl=document.createElement('div');resEl.style.cssText='margin-top:6px;font-size:12px;font-variant-numeric:tabular-nums';panel.appendChild(resEl);
document.body.appendChild(panel);apply();
// 초당 프레임: 1초마다 평균과 가장 느린 프레임(ms)
let fN=0,fT=0,fWorst=0,last=performance.now();const fpsLog=[];let rec=null; // rec: 자동 측정 중 프레임 간격(ms) 모음
const meter=()=>{const now=performance.now(),d=now-last;last=now;fN++;fT+=d;fWorst=Math.max(fWorst,d);if(rec)rec.push(d);
  if(fT>=1000&&measuring){fN=0;fT=0;fWorst=0;} // 자동 측정 중에는 진행 문구를 덮지 않는다
  if(fT>=1000){const fps=fN*1000/fT;fpsLog.push(+fps.toFixed(1));if(fpsLog.length>60)fpsLog.shift();
    const el=document.getElementById('stats');
    stat.textContent=`초당 ${fps.toFixed(0)}프레임 · 가장 느린 ${fWorst.toFixed(0)}ms\n${el?el.textContent.replace(/^최적화 [^:]*: /,''):''}\n낙엽 ${NL} · 눈 ${NS} · 무리 ${NF} · 조약돌 ${NB} · 판 ${WING_MODE==='test'?'잘라내기':'반투명'}`;
    fN=0;fT=0;fWorst=0;}};
/* 자동 측정: 조건마다 준비(최근 30프레임에 튀는 프레임이 없을 때까지, 최대 12초) + 1초 + 4초 측정. 끝나면 처음 상태로 되돌린다.
   그림자·빛 개수가 바뀌면 셰이더를 모두 다시 만들어 휴대폰에서 몇 초 멈춘다 — 예전처럼 2.5초만 기다리면 그 멈춤이 측정에 섞였다
   (2026-10-30 아이폰 '픽셀 1.5' 13프레임·최악 3.7초: '모두 끔' 바로 뒤라 셰이더를 다시 만드는 중이었음). 준비가 3초를 넘은 조건은 * 표시.
   순서도 셰이더가 덜 바뀌게: 모두 켬 → 픽셀 비율들(셰이더 그대로) → 그림자 가볍게(지도 1024, 단순) → 항목 하나씩 끔 → 모두 끔.
   그림자 가볍게: '그림자 지도 1024' = 해 그림자 지도 2048→1024(그리는 양 1/4, 가장자리는 그대로 부드럽게),
   '그림자 단순' = 2048 그대로 PCF 대신 BasicShadowMap(가장자리 계산을 한 번만 — 계단이 보일 수 있음). 모바일 품질 단계(로드맵 6) 후보.
   표: 평균 프레임 간격(ms)·초당 프레임, 느린 5% 프레임(95번째 백분위 ms), 가장 느린 프레임, '모두 켬'보다 빨라진 ms.
   아이폰 사파리는 초당 60프레임(16.7ms)이 한계라, 60에 닿은 조건은 그 항목이 남은 부담을 모두 차지한다는 뜻. */
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let measuring=false;const results=[];
// 해 그림자 지도 크기·방식 바꾸기: 지도는 버려서 새 크기로 다시 만들고, 방식이 바뀌면 재질 셰이더도 다시 만든다
function setShadow({size,type}){if(!sunL||!gl)return;const sh=sunL.shadow;let typeCh=gl.shadowMap.type!==type;
  if(sh.mapSize.x!==size||typeCh){sh.mapSize.set(size,size);if(sh.map){sh.map.dispose();sh.map=null;}}
  if(typeCh){gl.shadowMap.type=type;scn.traverse(o=>{if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.needsUpdate=true);});}}
async function autoMeasure(){if(measuring)return;hook();if(!gl){stat.textContent='렌더러를 아직 못 받았어요. 잠시 뒤 다시 눌러 주세요.';return;}
  measuring=true;row.style.pointerEvents='none';row.style.opacity='.5';results.length=0;resEl.textContent='';
  const keep={...on},keepPr=gl.getPixelRatio(),keepSh={size:sunL?sunL.shadow.mapSize.x:2048,type:gl.shadowMap.type},dpr=window.devicePixelRatio||1,items=Object.keys(parts);
  const conds=[{name:'모두 켬'}],tail=[...items.map(k=>({name:NAMES[k]+' 끔',off:[k]})),{name:'모두 끔',off:items}];
  // 픽셀 비율: 지금 값(03이 기기 값을 2로 제한) 말고 1.5·1, 기기 값이 2보다 크면 제한을 푼 값도
  [...new Set([dpr>keepPr+.01?dpr:null,2,1.5,1].filter(v=>v&&Math.abs(v-keepPr)>.01&&v<=dpr+.01))].forEach(pr=>conds.push({name:'모두 켬, 픽셀 '+pr,pr}));
  if(sunL)conds.push({name:'그림자 지도 1024',sh:{size:1024,type:keepSh.type}},{name:'그림자 단순',sh:{size:keepSh.size,type:THREE.BasicShadowMap}});
  conds.push(...tail);
  const stage=TN[ti]+' 하늘';
  const head=`${QUALITY.tier==='mobile'?'휴대폰 단계(동그란 그림자)':'컴퓨터 단계(진짜 그림자)'} · ${stage} 조명 · 기기 픽셀 비율 ${dpr} · 지금 ${keepPr}${dpr>keepPr?' (2로 제한 중)':''} · 화면 ${innerWidth}×${innerHeight}`;
  try{for(let i=0;i<conds.length;i++){const c=conds[i];items.forEach(k=>on[k]=!(c.off||[]).includes(k));apply(); // 그 조건에서 끄는 항목만 빼고 모두 켬
      gl.setPixelRatio(c.pr||keepPr);setShadow(c.sh||keepSh);
      stat.textContent=`자동 측정 ${i+1}/${conds.length}: ${c.name}\n휴대폰을 건드리지 말고 기다려 주세요 (약 ${Math.ceil((conds.length-i)*6.5)}초 남음)`;
      // 안정: 최근 30프레임 중 튀는 프레임(그 30프레임 가운뎃값의 2.5배·50ms 넘는 것)이 없을 때 — 셰이더를 다시 만드는 멈춤은 수백 ms라 잡힌다
      const t0=performance.now();rec=[];let win=[];while(performance.now()-t0<12000){await sleep(100);win=win.concat(rec.splice(0)).slice(-30);
        if(win.length>=30){const m=win.slice().sort((x,y)=>x-y)[15];if(Math.max(...win)<Math.max(50,m*2.5))break;}}
      const prep=(performance.now()-t0)/1000;await sleep(1000);rec=[];await sleep(4000);const a=rec.slice().sort((x,y)=>x-y);rec=null;
      const avg=a.reduce((x,y)=>x+y,0)/Math.max(1,a.length);
      results.push({조건:c.name+(prep>3?' *':''),prep:+prep.toFixed(1),ms:+avg.toFixed(1),fps:+(1000/avg).toFixed(1),p95:+(a[Math.floor(a.length*.95)]||0).toFixed(1),worst:+(a[a.length-1]||0).toFixed(1),n:a.length});}}
  finally{Object.assign(on,keep);apply();gl.setPixelRatio(keepPr);setShadow(keepSh);rec=null;measuring=false;row.style.pointerEvents='';row.style.opacity='';}
  const b=results[0].ms;results.forEach(r=>r.빨라짐=+(b-r.ms).toFixed(1));
  // 휴대폰 세로 한 화면(390px)에 표 전체가 들어가게: 짧은 머리글, 숫자 칸은 오른쪽 맞춤
  const cell=(v,th,left)=>`<${th?'th':'td'} style="padding:2px 3px;text-align:${left?'left':'right'};${th?'border-bottom:1px solid #c9b8a8;font-weight:normal;color:#75565e':''}">${v}</${th?'th':'td'}>`;
  stat.textContent=`자동 측정 끝 (${new Date().toLocaleTimeString('ko-KR')}) — 이 화면을 스크린샷으로 남겨 주세요`;
  resEl.innerHTML=`<div style="margin-bottom:4px">${head}</div><table style="border-collapse:collapse;width:100%">`+
    '<tr>'+['조건','초당<br>프레임','평균<br>ms','느린5%<br>ms','최악<br>ms','빨라짐<br>ms'].map((h,j)=>cell(h,1,!j)).join('')+'</tr>'+
    results.map((r,i)=>`<tr style="${i===0?'font-weight:bold;':''}">`+[r.조건,r.fps,r.ms,r.p95,r.worst,i?(r.빨라짐>0?'+':'')+r.빨라짐:'—'].map((v,j)=>cell(v,0,!j)).join('')+'</tr>').join('')+'</table>'+
    '<div style="margin-top:4px;color:#75565e">빨라짐 = \'모두 켬\'보다 줄어든 한 프레임 시간. 60프레임 = 16.7ms'+
    (results.some(r=>r.prep>3)?'<br>* 셰이더를 다시 만드느라 준비가 오래 걸린 조건(측정에는 안 섞임): '+results.filter(r=>r.prep>3).map(r=>r.prep+'초').join(', '):'')+'</div>';
  console.table(results);}
window.wlFx={get fps(){return fpsLog.slice();},on,apply,autoMeasure,results,setShadow:o=>{hook();setShadow(o);}};
/* ---------- 움직임 ---------- */
const o3=new THREE.Object3D(),o4=new THREE.Object3D(),R2=rng('sample-fx:respawn'),rnd2=(a,b)=>a+(b-a)*R2();let WL=null;
function update(dt,t){meter();hook();
  if(squash>0){squash=Math.max(0,squash-dt*2.5);const k=Math.sin(squash*PI*3)*squash*.35;bounceCap.scale.set(1+k*.6,.45*(1-k),1+k*.6);}
  // 원더룹(장면에 바로 붙은, 표정 함수를 가진 그룹) 둘레에서 낙엽·눈이 돈다
  if(!WL&&root.parent){WL=root.parent.children.find(o=>o.userData&&o.userData.setExpr)||null;if(WL&&WL.userData.setGlideProp)WL.userData.setGlideProp(glideCloth);}const cx=WL?WL.position.x:0,cz=WL?WL.position.z:0;
  // 무리: 통통 뛰거나 떠서 등의 판을 흔듦
  if(on.crowd)for(let i=0;i<NF;i++){const f=FAIRY[i],ph=t*f.sp*2+f.ph,y=f.hov?0.45+Math.sin(ph*0.5)*0.12:Math.abs(Math.sin(ph))*0.18;
    const ry=f.ry+Math.sin(ph*0.3)*0.4;CR.set(i,f.x,y,f.z,ry);o3.position.set(f.x,y+0.18,f.z);o3.rotation.set(0,ry,0);o3.scale.setScalar(1);o3.updateMatrix();
    for(let s=0;s<2;s++){const sd=s?1:-1;
      const flap=f.hov?Math.sin(t*22+f.ph)*0.5:0.25+Math.sin(t*3+f.ph)*0.1;
      o4.copy(o3);o4.translateY(0.12);o4.translateZ(-0.1);o4.rotateY(sd*(0.6+flap)+PI);o4.scale.set(sd*0.32,0.26,1);o4.updateMatrix();fWing.setMatrixAt(i*2+s,o4.matrix);}}
  if(on.crowd)fWing.instanceMatrix.needsUpdate=true;
  // 낙엽: 흔들리며 떨어지고, 바닥에 닿으면 위로 (원더룹 둘레 상자)
  if(on.leaves&&NL){for(let i=0;i<NL;i++){const L=LEAF[i];L.y-=L.v*dt;if(L.y<0.02){L.y=BOX[1];L.x=cx+rnd2(-1,1)*BOX[0];L.z=cz+rnd2(-1,1)*BOX[2];}
      if(L.x-cx>BOX[0])L.x-=2*BOX[0];if(L.x-cx<-BOX[0])L.x+=2*BOX[0];if(L.z-cz>BOX[2])L.z-=2*BOX[2];if(L.z-cz<-BOX[2])L.z+=2*BOX[2];
      const sw=Math.sin(t*L.sp+L.ph);o3.position.set(L.x+sw*0.35,L.y,L.z+Math.cos(t*L.sp*0.7+L.ph)*0.2);o3.rotation.set(sw*1.1+L.ph,t*L.sp*0.5+L.ph,Math.cos(t*L.sp+L.ph)*0.8);o3.scale.setScalar(1);o3.updateMatrix();leaves.setMatrixAt(i,o3.matrix);}
    leaves.instanceMatrix.needsUpdate=true;}
  if(on.motes)motes.update(dt,WL?WL.position:null);
  // 손 상호작용 견본: 바퀴는 목표 각도로 천천히, 새싹은 뿌릴 때마다 한 단계씩 자람, 뿌리는 동안 물방울(물뿌리개 주둥이에서)
  wheel.rotation.z+=(wheelGoal-wheel.rotation.z)*Math.min(1,dt*3);
  grow+=(growGoal-grow)*Math.min(1,dt*2);sprout.scale.setScalar(1+grow*.8);
  if(sprinkle>0&&WL&&WL.userData.heldObj){sprinkle-=dt;const hp=new THREE.Vector3(0,.02,.28);WL.userData.heldObj.localToWorld(hp);drops.burst(2,{x:hp.x,y:hp.y,z:hp.z});}
  drops.update(dt);
  streaks.update(dt);
  // 자라는 계단: 물을 주면 목표 높이까지 천천히 자란다(발판 top을 함께 바꾼다 — 위에 서 있으면 같이 올라감)
  for(const S of STAIRS){S.h+=(S.goal-S.h)*Math.min(1,dt*1.5);S.P.top=S.h;S.stem.scale.y=Math.max(.05,S.h);S.stem.position.y=S.h/2;S.cap.position.y=S.h;}
  // 눈: 천천히 흩날림
  if(on.snow&&NS){for(let i=0;i<NS;i++){const s=SNOW[i];s.y-=s.v*dt;if(s.y<0){s.y=BOX[1]*1.5;s.x=cx+rnd2(-1,1)*BOX[0];s.z=cz+rnd2(-1,1)*BOX[2];}
      if(s.x-cx>BOX[0])s.x-=2*BOX[0];if(s.x-cx<-BOX[0])s.x+=2*BOX[0];if(s.z-cz>BOX[2])s.z-=2*BOX[2];if(s.z-cz<-BOX[2])s.z+=2*BOX[2];
      snowPos[i*3]=s.x+Math.sin(t*0.8+s.ph)*0.3;snowPos[i*3+1]=s.y;snowPos[i*3+2]=s.z+Math.cos(t*0.6+s.ph)*0.3;}
    snowGeo.attributes.position.needsUpdate=true;}}
function light(env){const n=env.night;
  // 시험판의 '진짜 조명' 끄기는 비용을 재려고 빛 개수에서 뺀다(visible) — 게임에서는 세기만 0으로(lamps.js 머리 주석)
  LS.lights.forEach(L=>L.visible=lampOn.on);
  LS.light(WL?WL.position:{x:0,z:0},{light:(0.5+0.9*n)*env.flick*(1-.6*env.cave),emissive:0.25+0.65*n,
    glow:glowOn.on?0.35+0.65*n:0,pool:glowOn.on?(0.12+0.88*n)*(1-.35*env.cave):0,ambient:1-.6*env.cave});} // 굴에서는 따뜻한 기운을 줄여 어두운 맛을 살린다
return {
  name:'휴대폰 성능 시험',kind:'outdoor',start:{compass:true},
  spawn:{x:0,z:1.5,ry:PI},
  areas:{glade:{bounds:[-SIZE/2+2,SIZE/2-2,-SIZE/2+2,SIZE/2-2],obstacles,
    camera:{target:[0,1,0],dist:22,polar:[0.45,1.35],azimuth:null,start:[1.05,0.5],minDist:3,maxDist:40}}},
  doors:[],
  sun:{dir:new THREE.Vector3(5,-11,6).normalize(),shadow:10,follow:true},
  groundY:()=>0,ground:[ground,stumpTop,bounceCap],
  platforms:[{c:[STUMP.x,STUMP.z,STUMP.r],top:STUMP.top},...STAIRS.map(S=>S.P)],winds:[WIND],
  bouncers:[{c:[BOUNCE.x,BOUNCE.z,BOUNCE.r],top:BOUNCE.top,height:STUMP.top+1.1,to:[STUMP.x,STUMP.z-.25]}],
  bounce(){squash=1;},glide:true, // 활공 시험(펼치는 물건은 아래 시험용 둥근 천)
  lights:LS.all,keepOut:[crowd,bugs,leaves,snow,wingShow,bounceG,wheelG,standG,sproutG,...STAIRS.map(S=>S.g),...RINGS.map(r=>r.m),boat],
  update,light,sky:SK,
  dispose(){LS.dispose();SK.dispose();if(WL&&WL.userData.setHeld)WL.userData.setHeld(null);panel.remove();count5.remove();if(WL&&WL.userData.setGlideProp)WL.userData.setGlideProp(null);glideCloth.geometry.dispose();if(scn)scn.onBeforeRender=prevBR;if(sunL)sunL.castShadow=true;if(gl&&measuring)gl.setPixelRatio(Math.min(window.devicePixelRatio||1,2));pageUi.forEach((e,i)=>e.style.display=uiShown[i]);delete window.wlFx;[wingTex,snowTex].forEach(t=>t.dispose());},
};
}
