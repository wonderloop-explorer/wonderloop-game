/* 원더룹 견본 구역: 요정의 숲 휴대폰 시험 장면 (?zonetest 전용, 세계 콘텐츠 아님)
   아이폰에서 색점·빛 번짐·프레임 저하가 없는지 요정의 숲(→ 산타 마을) 제작 전에 먼저 보는 곳. 한 장면에 넷을 모았다.
   - 반투명 잎맥 날개: 서 있는 큰 날개 견본 + 꼬마 요정 날개. 앞뒤가 다 보이는 양면, 깊이 쓰기 끔(반투명 정렬 문제 확인)
   - 버섯 등불 빛: 큰 버섯 등불 4개 + 도토리 등불 8개 — 엔진 공통 등불(game/lamps.js, 모바일 조명 규칙): 스스로 빛나는 주름 + 빛무리 + 바닥 빛 웅덩이,
     진짜 조명(점광원)은 원더룹 가까운 버섯 등불 하나에만. (처음엔 버섯마다 점광원이었는데 아이폰에서 프레임 시간 22.7ms 중 6ms를 써서 바꿈)
   - 낙엽·첫눈 파티클: 낙엽은 InstancedMesh(색 3가지), 첫눈은 Points — 원더룹 둘레 상자 안에서 돌고 돈다
   - 같은 모델 여러 개: 꼬마 요정 60(부품마다 InstancedMesh, 날갯짓·통통), 무당벌레 40(통나무 위 계단)
   - 진짜 점프·활공(07 높이 이동): 튀는 버섯을 밟으면 그루터기 위로, 그루터기에서 걸어 나가면 잎을 펼쳐 활공
   화면 왼쪽 위 시험판: 초당 프레임(평균·가장 느린 프레임), 드로우콜·삼각형, 항목마다 켜고 끄기, 낮/저녁/어두운 굴.
   "자동 측정": 모두 켬 → 항목을 하나씩 끔(날개·등불 빛·빛무리·낙엽·첫눈·요정·무당벌레·그림자) → 모두 끔 → 픽셀 비율 바꾸기를
   차례로 (조건마다 2.5초 준비 + 4초 측정) 재서 표로 보여 준다. 결과는 window.wlFx.results에도. 렌더러는 장면의 onBeforeRender로 받는다(03을 건드리지 않음).
   주소 옵션: &fx=-glow,-snow (처음부터 끌 항목), &leaves=300 &snow=800 &fairies=60 &bugs=40 (개수), &wing=blend|test (날개 투명 방식)
   원더룹 크기는 그대로, 숲 소품을 크게 만든다(요정의 숲 규칙). 난수는 rng('sample-fairy-fx:…').
   품질 단계(01 QUALITY): 휴대폰 단계는 진짜 그림자 대신 동그란 그림자(shadowBlob·blobMany), 시험판에서 그림자 단추·그림자 측정이 빠진다.
   휴대폰 단계를 컴퓨터에서 보려면 &quality=mobile. */
import * as THREE from 'three';
import {M,PI,QUALITY,add,blob,blobMany,cylAt,group,lin,rng,shadowBlob} from '../01-textures.js';
import * as G from '../game/index.js';
export function build({root}){
const Q=new URLSearchParams(location.search),num=(k,d)=>{const v=parseInt(Q.get(k),10);return Number.isFinite(v)&&v>=0?Math.min(v,5000):d;};
const OFF=new Set((Q.get('fx')||'').split(',').filter(s=>s[0]==='-').map(s=>s.slice(1)));
const WING_MODE=Q.get('wing')==='test'?'test':'blend';
const R=rng('sample-fairy-fx:props'),rnd=(a,b)=>a+(b-a)*R();
const SIZE=40;
// 숲 바닥: 낙엽 깔린 땅 + 가운데 빈터
const ground=add(new THREE.PlaneGeometry(SIZE,SIZE).rotateX(-PI/2),M('#c99a62','plain',{rep:[10,10]}),0,0,0,{cast:false,line:false});
const obstacles=[];
/* ---------- 캔버스 그림 (이 견본 전용, 굽지 않음) ---------- */
const canvasTex=(S,draw)=>{const cv=document.createElement('canvas');cv.width=cv.height=S;draw(cv.getContext('2d'),S);const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;return t;};
// 잎맥 날개: 가장자리가 진한 연둣빛 막 + 가운데 큰 맥 + 갈래 맥, 바깥은 투명
const WR_=rng('sample-fairy-fx:wing');
const wingTex=canvasTex(256,(g,S)=>{g.clearRect(0,0,S,S);
  g.beginPath();g.moveTo(S*.08,S*.92);g.bezierCurveTo(S*.02,S*.45,S*.38,S*.02,S*.62,S*.06);g.bezierCurveTo(S*.95,S*.12,S*.98,S*.48,S*.72,S*.7);g.bezierCurveTo(S*.5,S*.86,S*.25,S*.95,S*.08,S*.92);g.closePath();
  const gr=g.createRadialGradient(S*.2,S*.85,S*.05,S*.4,S*.5,S*.7);gr.addColorStop(0,'rgba(236,246,214,0.55)');gr.addColorStop(1,'rgba(206,232,190,0.30)');g.fillStyle=gr;g.fill();
  g.save();g.clip();g.strokeStyle='rgba(150,176,112,0.85)';g.lineCap='round';
  g.lineWidth=5;g.beginPath();g.moveTo(S*.08,S*.92);g.quadraticCurveTo(S*.4,S*.5,S*.78,S*.2);g.stroke();
  g.lineWidth=2.4;for(let i=1;i<=6;i++){const u=i/7,x=S*(.08+.7*u),y=S*(.92-.72*u)+Math.sin(u*3)*8;g.beginPath();g.moveTo(x,y);
    g.quadraticCurveTo(x+S*(.06+WR_()*.05),y-S*.2,x+S*(.12+WR_()*.06),y-S*(.28+WR_()*.08));g.stroke();g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+S*.14,y+S*.02,x+S*(.22+WR_()*.06),y-S*.04);g.stroke();}
  g.restore();g.lineWidth=3;g.strokeStyle='rgba(140,168,104,0.9)';g.stroke();});
wingTex.anisotropy=4;
const wingMat=new THREE.MeshStandardMaterial({map:wingTex,side:THREE.DoubleSide,roughness:0.8,metalness:0,
  ...(WING_MODE==='test'?{alphaTest:0.25,transparent:false}:{transparent:true,depthWrite:false})});
// 날개 한 장: 뿌리가 원점(어깨)에 오도록 옮긴 판
const wingGeo=new THREE.PlaneGeometry(1,1).translate(0.5,0.5,0);
// 빛무리: 가운데만 밝고 바깥으로 사라지는 둥근 점 (덧칠)
const snowTex=canvasTex(64,(g,S)=>{const gr=g.createRadialGradient(S/2,S/2,0,S/2,S/2,S/2);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(0.5,'rgba(255,255,255,0.8)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,S,S);});
const spotTex=canvasTex(128,(g,S)=>{g.fillStyle='#d8432f';g.fillRect(0,0,S,S);g.fillStyle='#2a1a18';g.fillRect(S*.49,0,S*.02,S);
  [[.25,.3],[.75,.3],[.2,.65],[.8,.65],[.4,.82],[.6,.82]].forEach(([x,y])=>{g.beginPath();g.arc(x*S,y*S,S*.08,0,PI*2);g.fill();});});
/* ---------- 1. 버섯 등불 (큰 버섯 4개, 점광원 4개) ---------- */
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
// 도토리 등불: 거꾸로 든 깍정이 안에 빛 (빛무리만, 점광원 없음)
const acornM=M('#9a6a3e','weave',{rep:[2,1]}),acornLit=new THREE.MeshStandardMaterial({color:lin('#fff4d6'),emissive:lin('#ffd08a'),emissiveIntensity:0.8,roughness:1});
for(let i=0;i<8;i++){const a=i/8*PI*2+0.2,d=6.2,x=Math.cos(a)*d,z=Math.sin(a)*d,g=group(x,0,z,0);
  cylAt(0.025,0.025,1.1,M('#7c5a3a','wood'),0,0,0,{parent:g,line:false});shadowBlob(x,z,0.22,0.22);
  add(new THREE.SphereGeometry(0.16,10,6,0,PI*2,PI*0.5,PI*0.5),acornM,0,1.28,0,{parent:g});
  add(new THREE.SphereGeometry(0.11,10,6),acornLit,0,1.24,0,{parent:g,line:false,cast:false});
  LS.add({x,y:1.24,z,glow:{y:1.24,size:0.9,op:0.55},pool:{r:0.9,op:0.3},emissive:[acornLit]});}
/* ---------- 2. 반투명 잎맥 날개 견본 (서 있는 큰 날개 한 쌍 — 가까이서 결·가장자리를 보는 곳) ---------- */
const wingShow=group(0,0,-5.2,0);
cylAt(0.05,0.07,1.2,M('#8a6244','wood'),0,0,0,{parent:wingShow});
[-1,1].forEach(sd=>{const w=new THREE.Mesh(wingGeo,wingMat);w.scale.set(sd*1.4,1.1,1);w.position.set(0,1.15,0);w.rotation.y=sd*0.35;w.castShadow=false;wingShow.add(w);
  const w2=new THREE.Mesh(wingGeo,wingMat);w2.scale.set(sd*0.9,0.7,1);w2.position.set(0,1.0,0.02);w2.rotation.set(0,sd*0.5,-sd*0.9);w2.castShadow=false;wingShow.add(w2);});
obstacles.push({c:[0,-5.2,0.4]});shadowBlob(0,-5.2,0.9,0.6,0.3);
/* ---------- 3. 꼬마 요정 무리 (부품마다 InstancedMesh) ---------- */
const NF=num('fairies',60),crowd=new THREE.Group();root.add(crowd);
const inst=(geo,mat,n,cast=true)=>{const m=new THREE.InstancedMesh(geo,mat,n);m.castShadow=cast;m.receiveShadow=true;m.frustumCulled=false;m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);crowd.add(m);return m;};
const fBody=inst(new THREE.CapsuleGeometry(0.11,0.14,4,10),M('#9cc08a','plain'),NF),fHead=inst(new THREE.SphereGeometry(0.13,12,10),M('#f3d9c0','plain'),NF),
  fHair=inst(new THREE.SphereGeometry(0.135,12,8,0,PI*2,0,PI*0.55),M('#f6f1e6','wool'),NF),fEar=inst(new THREE.SphereGeometry(0.04,8,6),M('#f0cfb4','plain'),NF*2),
  fWing=inst(wingGeo,wingMat,NF*2,false);
const fBlob=blobMany(NF,0.4); // 휴대폰 단계: 요정마다 발밑 동그란 그림자(뛰어오르면 작아짐)
const FAIRY=[];for(let i=0;i<NF;i++){const a=rnd(0,PI*2),d=rnd(2.2,8.5);FAIRY.push({x:Math.cos(a)*d,z:Math.sin(a)*d,ry:rnd(0,PI*2),ph:rnd(0,PI*2),sp:rnd(0.8,1.4),hov:R()<0.35});}
{const c=new THREE.Color();for(let i=0;i<NF;i++){c.set(['#9cc08a','#e3b25b','#d98a6a','#b7a3d4'][i%4]);fBody.setColorAt(i,c);}fBody.instanceColor.needsUpdate=true;}
/* ---------- 4. 무당벌레 계단 (통나무 위에 줄지어) ---------- */
const NB=num('bugs',40),bugs=new THREE.Group();root.add(bugs);
const logG=group(6.5,0,-0.5,-0.4);cylAt(0.7,0.8,6,M('#8a6244','wood',{rep:[3,1]}),0,0,0,{parent:logG,rx:PI/2,thr:40});obstacles.push({r:[5.6,7.4,-3.6,2.6]});shadowBlob(6.2,-0.5,1.5,3.4);
const bShell=new THREE.InstancedMesh(new THREE.SphereGeometry(0.16,14,8,0,PI*2,0,PI*0.5),new THREE.MeshStandardMaterial({map:spotTex,roughness:0.55}),NB),
  bHead=new THREE.InstancedMesh(new THREE.SphereGeometry(0.07,10,8),M('#2a1a18','plain'),NB);
[bShell,bHead].forEach(m=>{m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;bugs.add(m);});
{const o=new THREE.Object3D();for(let i=0;i<NB;i++){const u=i/Math.max(1,NB-1),row=i%2;
   // 통나무를 따라 오르는 빨간 계단 (반은 통나무 위, 반은 줄기 쪽으로 올라감)
   const x=6.5+(row?0.18:-0.18)+Math.sin(i*1.7)*0.05,y=0.8+u*2.2,z=-3+u*5.5;
   o.position.set(x,y,z);o.rotation.set(0,PI*0.5+rnd(-0.3,0.3),0);o.scale.setScalar(rnd(0.9,1.15));o.updateMatrix();bShell.setMatrixAt(i,o.matrix);
   o.translateZ(0.15);o.translateY(0.02);o.updateMatrix();bHead.setMatrixAt(i,o.matrix);}}
// 줄기 모양 기둥 (무당벌레 계단이 닿는 곳)
cylAt(0.9,1.2,7,M('#7a5a40','wood',{rep:[2,3]}),6.6,0,3.6,{thr:40});obstacles.push({c:[6.6,3.6,1.2]});shadowBlob(6.6,3.6,1.7,1.7,0.45);
/* ---------- 6. 튀는 버섯 · 높은 그루터기 (점프·활공 시험) ----------
   버섯 갓을 밟으면(누르면 걸어가서 밟음) 통통 튀어 그루터기 위에 내려앉는다. 그루터기 가장자리를 걸어 나가면
   마지막 잎을 머리 위로 펼쳐 천천히 내려온다(glide:true — 이번 편은 이 시험 구역에서만). */
const STUMP={x:1.8,z:5.0,r:1.0,top:1.8},BOUNCE={x:1.8,z:3.2,r:.5,top:.38};
const stumpG=group(STUMP.x,0,STUMP.z,0.3);cylAt(STUMP.r,STUMP.r*1.12,STUMP.top,M('#8a6244','wood',{rep:[3,1]}),0,0,0,{parent:stumpG,thr:40});
const stumpTop=add(new THREE.CircleGeometry(STUMP.r*.98,24).rotateX(-PI/2),M('#e1bf92','rings'),0,STUMP.top+.002,0,{parent:stumpG,cast:false,line:false});
shadowBlob(STUMP.x,STUMP.z,STUMP.r*1.5,STUMP.r*1.5,.45);
const bounceG=group(BOUNCE.x,0,BOUNCE.z,0);cylAt(.1,.13,.3,M('#f1e2c4','plain'),0,0,0,{parent:bounceG,line:false});
const bounceCap=add(new THREE.SphereGeometry(.56,16,8,0,PI*2,0,PI*.5),M('#d9573f','dots',{rep:[2,1]}),0,.28,0,{parent:bounceG,s:[1,.45,1],thr:30});
shadowBlob(BOUNCE.x,BOUNCE.z,.65,.65);
let squash=0; // 튈 때 갓이 출렁
/* ---------- 5. 낙엽 (InstancedMesh) · 첫눈 (Points) ---------- */
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
/* ---------- 시험판 (화면 왼쪽 위) ---------- */
const parts={wings:[wingShow,fWing],lamps:null,glow:null,leaves:[leaves],snow:[snow],crowd:[crowd,bugs,...(fBlob?[fBlob]:[])],shadow:null};
if(!QUALITY.shadows)delete parts.shadow; // 휴대폰 단계: 진짜 그림자가 없으니 그림자 단추·측정도 없음
const on={};Object.keys(parts).forEach(k=>on[k]=!OFF.has(k));
const NAMES={wings:'날개',lamps:'진짜 조명',glow:'빛무리·웅덩이',leaves:'낙엽',snow:'첫눈',crowd:'요정·무당벌레',shadow:'그림자'};
// 렌더러·해(그림자)는 장면에서 받는다: 그림 그리기 직전 장면의 onBeforeRender가 렌더러를 넘겨준다
let gl=null,sunL=null,scn=null,prevBR=null;
const hook=()=>{if(scn||!root.parent)return;scn=root.parent;prevBR=scn.onBeforeRender;scn.onBeforeRender=function(r,...a){gl=r;return prevBR.call(this,r,...a);};
  sunL=scn.children.find(o=>o.isDirectionalLight&&o.castShadow)||null;};
const apply=()=>{['wings','leaves','snow','crowd'].forEach(k=>parts[k].forEach(o=>o.visible=on[k]));lampOn.on=on.lamps;glowOn.on=on.glow;if(sunL)sunL.castShadow=on.shadow;
  btns.forEach(b=>{b.setAttribute('aria-pressed',on[b.dataset.k]);b.textContent=NAMES[b.dataset.k]+(on[b.dataset.k]?' 켜짐':' 꺼짐');});};
const panel=document.createElement('div');panel.id='fxPanel';panel.className='wlg';
panel.style.cssText='position:fixed;left:calc(env(safe-area-inset-left,0px) + 8px);top:calc(env(safe-area-inset-top,0px) + 8px);z-index:30;background:rgba(255,246,234,.92);border-radius:14px;padding:8px 10px;font:13px/1.4 "Gowun Dodum",sans-serif;color:#3e2834;max-width:calc(100vw - 32px);box-shadow:0 6px 20px rgba(30,14,36,.25)';
const stat=document.createElement('div');stat.style.cssText='font-variant-numeric:tabular-nums;margin-bottom:6px;white-space:pre';panel.appendChild(stat);
const row=document.createElement('div');row.style.cssText='display:flex;flex-wrap:wrap;gap:6px';panel.appendChild(row);
const mkBtn=(txt,fn)=>{const b=document.createElement('button');b.textContent=txt;b.style.cssText='all:unset;cursor:pointer;background:#3f9fa0;color:#fffaf2;border-radius:999px;padding:6px 10px;min-height:20px';b.addEventListener('click',fn);row.appendChild(b);return b;};
const btns=Object.keys(parts).map(k=>{const b=mkBtn('',()=>{on[k]=!on[k];apply();});b.dataset.k=k;return b;});
mkBtn('낮/저녁/굴',()=>{const d=document.getElementById('dayBtn');if(d)d.click();});
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
    stat.textContent=`초당 ${fps.toFixed(0)}프레임 · 가장 느린 ${fWorst.toFixed(0)}ms\n${el?el.textContent.replace(/^최적화 [^:]*: /,''):''}\n낙엽 ${NL} · 눈 ${NS} · 요정 ${NF} · 무당벌레 ${NB} · 날개 ${WING_MODE==='test'?'잘라내기':'반투명'}`;
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
  const db=document.getElementById('dayBtn'),stage=db?({'저녁으로 바꾸기':'낮','어두운 굴로 바꾸기':'저녁','낮으로 바꾸기':'어두운 굴'}[db.textContent]||''):'';
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
const o3=new THREE.Object3D(),o4=new THREE.Object3D(),R2=rng('sample-fairy-fx:respawn'),rnd2=(a,b)=>a+(b-a)*R2();let WL=null;
function update(dt,t){meter();hook();
  if(squash>0){squash=Math.max(0,squash-dt*2.5);const k=Math.sin(squash*PI*3)*squash*.35;bounceCap.scale.set(1+k*.6,.45*(1-k),1+k*.6);}
  // 원더룹(장면에 바로 붙은, 표정 함수를 가진 그룹) 둘레에서 낙엽·눈이 돈다
  if(!WL&&root.parent)WL=root.parent.children.find(o=>o.userData&&o.userData.setExpr)||null;const cx=WL?WL.position.x:0,cz=WL?WL.position.z:0;
  // 꼬마 요정: 통통 뛰거나 떠서 날갯짓
  if(on.crowd)for(let i=0;i<NF;i++){const f=FAIRY[i],ph=t*f.sp*2+f.ph,y=f.hov?0.45+Math.sin(ph*0.5)*0.12:Math.abs(Math.sin(ph))*0.18;
    if(fBlob)fBlob.set(i,f.x,0,f.z,0.24*(1-y*0.6));
    o3.position.set(f.x,y+0.18,f.z);o3.rotation.set(0,f.ry+Math.sin(ph*0.3)*0.4,0);o3.scale.setScalar(1);o3.updateMatrix();fBody.setMatrixAt(i,o3.matrix);
    o4.copy(o3);o4.translateY(0.27);o4.updateMatrix();fHead.setMatrixAt(i,o4.matrix);o4.translateY(0.02);o4.updateMatrix();fHair.setMatrixAt(i,o4.matrix);
    for(let s=0;s<2;s++){const sd=s?1:-1;o4.copy(o3);o4.translateY(0.27);o4.translateX(sd*0.13);o4.updateMatrix();fEar.setMatrixAt(i*2+s,o4.matrix);
      const flap=f.hov?Math.sin(t*22+f.ph)*0.5:0.25+Math.sin(t*3+f.ph)*0.1;
      o4.copy(o3);o4.translateY(0.12);o4.translateZ(-0.1);o4.rotateY(sd*(0.6+flap)+PI);o4.scale.set(sd*0.32,0.26,1);o4.updateMatrix();fWing.setMatrixAt(i*2+s,o4.matrix);}}
  if(on.crowd){[fBody,fHead,fHair,fEar,fWing].forEach(m=>m.instanceMatrix.needsUpdate=true);}
  // 낙엽: 흔들리며 떨어지고, 바닥에 닿으면 위로 (원더룹 둘레 상자)
  if(on.leaves&&NL){for(let i=0;i<NL;i++){const L=LEAF[i];L.y-=L.v*dt;if(L.y<0.02){L.y=BOX[1];L.x=cx+rnd2(-1,1)*BOX[0];L.z=cz+rnd2(-1,1)*BOX[2];}
      if(L.x-cx>BOX[0])L.x-=2*BOX[0];if(L.x-cx<-BOX[0])L.x+=2*BOX[0];if(L.z-cz>BOX[2])L.z-=2*BOX[2];if(L.z-cz<-BOX[2])L.z+=2*BOX[2];
      const sw=Math.sin(t*L.sp+L.ph);o3.position.set(L.x+sw*0.35,L.y,L.z+Math.cos(t*L.sp*0.7+L.ph)*0.2);o3.rotation.set(sw*1.1+L.ph,t*L.sp*0.5+L.ph,Math.cos(t*L.sp+L.ph)*0.8);o3.scale.setScalar(1);o3.updateMatrix();leaves.setMatrixAt(i,o3.matrix);}
    leaves.instanceMatrix.needsUpdate=true;}
  // 첫눈: 천천히 흩날림
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
  name:'요정의 숲 휴대폰 시험',kind:'outdoor',start:{compass:true},hood:'acorn', // 도토리 탈 날개도 아이폰에서 같이 본다
  spawn:{x:0,z:1.5,ry:PI},
  areas:{glade:{bounds:[-SIZE/2+2,SIZE/2-2,-SIZE/2+2,SIZE/2-2],obstacles,
    camera:{target:[0,1,0],dist:22,polar:[0.45,1.35],azimuth:null,start:[1.05,0.5],minDist:3,maxDist:40}}},
  doors:[],
  sun:{dir:new THREE.Vector3(5,-11,6).normalize(),shadow:10,follow:true},
  groundY:()=>0,ground:[ground,stumpTop,bounceCap],
  platforms:[{c:[STUMP.x,STUMP.z,STUMP.r],top:STUMP.top}],
  bouncers:[{c:[BOUNCE.x,BOUNCE.z,BOUNCE.r],top:BOUNCE.top,height:STUMP.top+1.1,to:[STUMP.x,STUMP.z-.25]}],
  bounce(){squash=1;},glide:true, // 활공은 시험 구역에서만(이번 편은 마지막 잎을 받기만 함)
  lights:LS.all,keepOut:[crowd,bugs,leaves,snow,wingShow,bounceG],
  update,light,
  dispose(){LS.dispose();panel.remove();if(scn)scn.onBeforeRender=prevBR;if(sunL)sunL.castShadow=true;if(gl&&measuring)gl.setPixelRatio(Math.min(window.devicePixelRatio||1,2));pageUi.forEach((e,i)=>e.style.display=uiShown[i]);delete window.wlFx;[wingTex,snowTex,spotTex].forEach(t=>t.dispose());},
};
}
