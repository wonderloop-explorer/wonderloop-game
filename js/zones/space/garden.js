/* 무한 우주 ① 회색 정원 (달 + 수성) — 걸어서 한 바퀴 도는 작은 행성 (2026-11-07 1차)
   ─────────────────────────────────────────────────────────────────────────
   작은 행성 걷기(game/bend.js '작은 행성'): 판정·이동·충돌·카메라는 평평한 땅 그대로, 땅은 L = 2πR(약 106.8m) 간격으로 이어진다
   (08이 원더룹이 L/2 밖으로 나가면 L만큼 옮겨 이어 붙임 → 한 방향으로 곧게 걸으면 약 28초(걷기 3.78m/초)에 제자리).
   그릴 때만 원더룹 자리를 꼭대기로 반지름 R = 17m 공 위로 감는다 → 원더룹 둘레는 평평하고, 멀수록 지평선 아래로 넘어가 행성 모양,
   카메라 위쪽은 늘 원더룹이 선 자리의 표면 방향. 하늘(우주·행성·해)은 원더룹을 따라 늘 같은 자리에 보인다(다음 목적지를 말없이 알려 줌).
   구역 물체는 평평한 자리로 화면 밖 판정을 하면 이어 붙인 쪽이 사라지므로 frustumCulled=false(update에서 한 번).
   이어 붙는 선(x·z = ±L/2) 가까이에는 장애물을 두지 않는다(충돌 판정은 이어 붙이지 않음).
   이 행성의 진짜 사실: 공기가 거의 없어 낮에도 하늘이 까맣고 별이 보임 · 바람이 없어 발자국이 오래 남음(원더룹 발자국 + 보름 할아버지의 수십 년 된 발자국 길)
     · 햇빛 쪽은 따뜻하게 일렁임(수성 낮 430도) · 햇빛이 안 드는 그늘 분화구엔 서리·얼음 결(영하 160도) · 낮은 중력(둥실 뛰기 — gravity .38, jumpK 1.15: 높이 약 2.7m, 체공 약 2초).
   흐름: 이야기 소개 → 첫 미션 숨방울 목걸이(세계 설정 firstMission — 그늘 분화구) → 할아버지에게 돌아가면 둥실 뛰기 시범(분화구 끝으로 둥실 건너뜀)
     → 원더룹이 높은 바위에 오르면 첫 빈칸(지도 조각) → 출구 빛기둥 → 'STAGE 1 완료'(별똥별 이동은 2차). 비밀: 그늘 분화구 깊은 곳 얼음 동굴(감탄 + 발견).
   그리기(휴대폰): 땅 1 · 소품(정점 색 한 덩어리) 1 · 빛나는 돌 1 · 발자국 2 · 반짝이 1 · 할아버지 5 · 하늘(지붕·별·해·목성·토성·날씨) 6~7. */
import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {PI,QUALITY,rng} from '../../01-textures.js';
import * as G from '../../game/index.js';
import {sbMat} from '../../game/storybook.js';
import {bentPos} from '../../game/bend.js';
import SPACE from '../../worlds/infinite-space.js';
const WID=SPACE.id,R=17,L=2*PI*R,HALF=L/2,MOB=QUALITY.tier==='mobile';
const wd=a=>((a%L)+1.5*L)%L-.5*L; // 이어지는 땅에서 가장 가까운 쪽 차이
const dist=(x,z,c)=>Math.hypot(wd(x-c[0]),wd(z-c[1]));
const ss=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x);};
const col=h=>new THREE.Color(h);
/* 자리 */
const SPAWN=[0,9.5],BOBO=[2.1,5.4],SHADE={c:[-5,-15],r:6,d:1.3,rim:.5},ROCK={c:[-11.8,-13.5],r:1.65},HOP=[-9.9,-11.4],CAVE=[-5,-19.7],EXIT=[6,-35],WARM=[16,8];
const CRATERS=[SHADE,{c:[12,-4],r:4,d:.8,rim:.35},{c:[-14,6],r:3.5,d:.6,rim:.3},{c:[19,21],r:5,d:1,rim:.4},{c:[-26,-30],r:6,d:1,rim:.45},{c:[30,-28],r:4,d:.7,rim:.3},
  {c:[-30,24],r:5,d:.9,rim:.4},{c:[8,30],r:3,d:.5,rim:.25},{c:[40,10],r:4,d:.8,rim:.35},{c:[-40,-6],r:4.5,d:.8,rim:.35},{c:[-18,-40],r:3.2,d:.5,rim:.25},{c:[24,-44],r:3.6,d:.6,rim:.3}];
function groundY(x,z){let y=0;for(const C of CRATERS){const t=dist(x,z,C.c)/C.r;if(t<1)y+=-C.d*(1-t*t)+C.rim*ss(.55,1,t);else if(t<1.7)y+=C.rim*(1-(t-1)/.7)**2;}return y;}
/* 할아버지의 오래된 발자국 길: 집 앞 → 그늘 분화구 → 행성을 크게 한 바퀴 → 출구 */
const TRAIL=[[2.4,4.6],[1.6,0],[-.6,-5.5],[-2.6,-10.6],[-3.4,-14.2],[-8,-20],[-16,-24],[-26,-20],[-34,-8],[-40,6],[-36,20],[-24,30],[-8,36],[10,40],[26,34],[36,20],[40,4],[34,-12],[22,-26],[10,-32],[6,-35]];
function trailPts(step){const out=[];for(let i=0;i<TRAIL.length-1;i++){const [ax,az]=TRAIL[i],[bx,bz]=TRAIL[i+1],P0=TRAIL[Math.max(0,i-1)],P3=TRAIL[Math.min(TRAIL.length-1,i+2)];
    const n=Math.ceil(Math.hypot(bx-ax,bz-az)/step);for(let k=0;k<n;k++){const t=k/n,t2=t*t,t3=t2*t,cr=(p0,p1,p2,p3)=>.5*(2*p1+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t2+(-p0+3*p1-3*p2+p3)*t3);
      out.push([cr(P0[0],ax,bx,P3[0]),cr(P0[1],az,bz,P3[1])]);}}return out;}
export function build({root}){
const rnd=(()=>{const r=rng('space-garden:props');return (a,b)=>a+(b-a)*r();})();
const keep=[],obstacles=[],tickers=[];
/* ── 땅: L×L 한 장(1.1m 칸 — 꼭짓점마다 공 위로 감기므로 촘촘히), 정점 색(회색 먼지·분화구 바닥·그늘 분화구 푸른 서리·햇빛 쪽 따뜻한 빛), 크레용 결 */
const SEG=MOB?84:100,gGeo=new THREE.PlaneGeometry(L,L,SEG,SEG);gGeo.rotateX(-PI/2);
{const p=gGeo.attributes.position,uv=gGeo.attributes.uv,c=new Float32Array(p.count*3),base=col('#b9b7b4'),dark=col('#94918f'),frost=col('#b9c8dc'),cold=col('#5e6987'),warm=col('#d4bc9c'),tmp=new THREE.Color();
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),y=groundY(x,z);p.setY(i,y);uv.setXY(i,uv.getX(i)*34,uv.getY(i)*34);
    const n=Math.sin(x*.37+Math.sin(z*.21)*2)*.5+Math.sin(z*.53-x*.17)*.5;tmp.copy(base).multiplyScalar(1+n*.05);
    for(const C of CRATERS){const t=dist(x,z,C.c)/C.r;if(t<1)tmp.lerp(dark,.55*(1-t*t));}
    {const t=dist(x,z,SHADE.c)/SHADE.r;if(t<1.05){tmp.lerp(cold,.8*ss(1.05,.6,t));const f=Math.sin(x*2.1)*Math.sin(z*1.7)+Math.sin(x*.9+z*1.3);if(t<.95&&f>.6)tmp.lerp(frost,.75);}}
    {const t=dist(x,z,WARM)/10;if(t<1)tmp.lerp(warm,.6*(1-t)*(1-t));}
    c[i*3]=tmp.r;c[i*3+1]=tmp.g;c[i*3+2]=tmp.b;}
  gGeo.setAttribute('color',new THREE.BufferAttribute(c,3));gGeo.computeVertexNormals();}
const gMat=sbMat('#ffffff');gMat.vertexColors=true;
const ground=new THREE.Mesh(gGeo,gMat);ground.receiveShadow=true;root.add(ground);keep.push(ground);
/* ── 소품 한 덩어리(정점 색): 바위·분화구 테두리 돌·서리 판·얼음 결정·얼음 동굴·높은 바위·출구 받침 */
const parts=[];
function put(geo,color,{pos=[0,0,0],rot=[0,0,0],s=[1,1,1]}={}){let g=geo.index?geo.toNonIndexed():geo;for(const k of Object.keys(g.attributes))if(!['position','normal','uv'].includes(k))g.deleteAttribute(k);
  if(!g.attributes.uv)g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
  g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...pos),new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)),new THREE.Vector3(...s)));g.computeVertexNormals();
  const n=g.attributes.position.count,cc=new Float32Array(n*3),C=col(color);for(let i=0;i<n;i++){cc[i*3]=C.r;cc[i*3+1]=C.g;cc[i*3+2]=C.b;}g.setAttribute('color',new THREE.BufferAttribute(cc,3));
  const u=g.attributes.uv;for(let i=0;i<n;i++)u.setXY(i,u.getX(i)*2,u.getY(i)*2);parts.push(g);return g;}
const lumpy=(r,det=0)=>{const g=new THREE.IcosahedronGeometry(r,det),p=g.attributes.position;for(let i=0;i<p.count;i++){const k=1+(Math.sin(p.getX(i)*9.1+p.getY(i)*3.7)*.5+Math.sin(p.getZ(i)*7.3)*.5)*.16;p.setXYZ(i,p.getX(i)*k,p.getY(i)*k,p.getZ(i)*k);}return g;};
const nearTrail=trailPts(1.2);const clearOf=(x,z,m)=>nearTrail.every(([a,b])=>Math.hypot(wd(x-a),wd(z-b))>m)&&[SPAWN,BOBO,ROCK.c,CAVE,EXIT,HOP,[-3.2,-15.2]].every(c=>dist(x,z,c)>m+1.2)&&Math.abs(wd(x))<HALF-3&&Math.abs(wd(z))<HALF-3;
const rockCols=['#a9a6a3','#9c9997','#b3b0ac','#8e8b8a'],warmCols=['#c4a98a','#b99c7e','#cfb394'];
function rock(x,z,s,{solid=true,warmK=0}={}){const y=groundY(x,z),c=warmK>.4?warmCols[(rnd(0,3)|0)%3]:rockCols[(rnd(0,4)|0)%4];
  put(lumpy(.5*s,s>1.6?1:0),c,{pos:[x,y+.18*s,z],rot:[rnd(0,PI),rnd(0,PI),0],s:[1,rnd(.55,.85),rnd(.85,1.15)]});if(solid&&s>.7)obstacles.push({c:[x,z,.42*s]});}
// 분화구 테두리 돌
for(const C of CRATERS){const n=Math.round(C.r*2.2);for(let i=0;i<n;i++){const a=i/n*PI*2+rnd(-.2,.2),d=C.r*rnd(.98,1.18),x=C.c[0]+Math.cos(a)*d,z=C.c[1]+Math.sin(a)*d;if(!clearOf(x,z,.9))continue;rock(x,z,rnd(.35,.8),{solid:false,warmK:dist(x,z,WARM)<10?1:0});}}
// 흩어진 바위(크기 규칙: 원더룹보다 커도 됨)
for(let i=0;i<70;i++){const x=rnd(-HALF+4,HALF-4),z=rnd(-HALF+4,HALF-4);if(!clearOf(x,z,1.8))continue;const big=rnd(0,1)<.18;rock(x,z,big?rnd(1.6,3):rnd(.5,1.2),{warmK:dist(x,z,WARM)<10?1:0});}
// 그늘 분화구: 서리 판·얼음 결정(푸른 흰빛 뾰족 결정 무리)
for(let i=0;i<14;i++){const a=rnd(0,PI*2),d=rnd(0,SHADE.r*.85),x=SHADE.c[0]+Math.cos(a)*d,z=SHADE.c[1]+Math.sin(a)*d;
  put(new THREE.CircleGeometry(rnd(.35,.8),7),'#cfdcec',{pos:[x,groundY(x,z)+.02,z],rot:[-PI/2,0,rnd(0,PI)]});}
const iceCols=['#a9cdec','#93bde2','#c6e2f6'];
function crystals(x,z,n,s){const y=groundY(x,z);for(let i=0;i<n;i++){const h=rnd(.35,.9)*s,a=rnd(0,PI*2),d=rnd(0,.35*s);
  put(new THREE.ConeGeometry(rnd(.07,.14)*s,h,5),iceCols[i%3],{pos:[x+Math.cos(a)*d,y+h*.42,z+Math.sin(a)*d],rot:[rnd(-.35,.35),rnd(0,PI),rnd(-.35,.35)]});}}
crystals(-2.4,-14.4,7,1.2);crystals(-3.9,-16.6,5,1);crystals(-7.6,-13.2,6,1.1);crystals(-6.8,-17.4,4,.9);crystals(-1.6,-17.2,4,.8);
// 얼음 동굴(비밀): 분화구 남쪽 깊은 곳 — 얼음 덩이를 둥글게 쌓은 굴, 입구는 분화구 가운데(북쪽)를 봄
{const [cx,cz]=CAVE,y=groundY(cx,cz);for(let i=0;i<10;i++){const a=PI*.75+i/9*PI*1.5,x=cx+Math.cos(a)*1.5,z=cz+Math.sin(a)*1.5;
    put(lumpy(.46,1),iceCols[i%3],{pos:[x,y+.45,z],rot:[rnd(0,PI),rnd(0,PI),0],s:[1,1.7,1]});obstacles.push({c:[x,z,.32]});}
  for(let i=0;i<6;i++){const a=PI*.78+i/5*PI*1.44;put(lumpy(.42,1),iceCols[(i+1)%3],{pos:[cx+Math.cos(a)*.95,y+1.45,cz+Math.sin(a)*.95],rot:[rnd(0,PI),0,rnd(0,PI)],s:[1.2,.7,1.2]});}
  put(new THREE.CircleGeometry(1.25,12),'#5a6f98',{pos:[cx,y+.025,cz],rot:[-PI/2,0,0]});crystals(cx-.5,cz-.6,5,.8);crystals(cx+.6,cz-.4,4,.7);}
// 높은 바위(분화구 끝 — 둥실 뛰기로만): 위가 평평한 큰 바위 + 꼭대기 판
const ROCK_TOP=groundY(...ROCK.c)+1.85; // 둥실 뛰기(꼭대기 약 2.7m)로 넉넉히, 보통 점프(0.8m)로는 못 오름
{const [x,z]=ROCK.c,y=groundY(x,z);put(new THREE.CylinderGeometry(ROCK.r*.95,ROCK.r*1.18,ROCK_TOP-y+.4,7,2),'#a29f9c',{pos:[x,(ROCK_TOP+y-.4)/2,z],rot:[0,.3,0]});
  put(new THREE.CylinderGeometry(ROCK.r*1.0,ROCK.r*.95,.14,7),'#bdbab6',{pos:[x,ROCK_TOP-.02,z],rot:[0,.3,0]});
  rock(x+1.3,z+.6,.7,{solid:false});rock(x-1.1,z-.9,.6,{solid:false});}
// 출구 받침(둥근 돌판 + 둘레 돌)
{const [x,z]=EXIT,y=groundY(x,z);put(new THREE.CylinderGeometry(1.5,1.65,.18,10),'#c9c6c2',{pos:[x,y+.07,z]});for(let i=0;i<8;i++){const a=i/8*PI*2;put(lumpy(.22,0),'#d6d2cc',{pos:[x+Math.cos(a)*1.75,y+.15,z+Math.sin(a)*1.75]});}}
const pMat=sbMat('#ffffff');pMat.vertexColors=true;
const props=new THREE.Mesh(mergeGeometries(parts),pMat);props.castShadow=props.receiveShadow=true;root.add(props);keep.push(props);parts.length=0;
/* 출구 둘레 빛나는 돌(따로 — 스스로 빛남) */
{const g=[];for(let i=0;i<8;i++){const a=i/8*PI*2+PI/8,s=new THREE.OctahedronGeometry(.13,0);s.translate(EXIT[0]+Math.cos(a)*1.75,groundY(...EXIT)+.42,EXIT[1]+Math.sin(a)*1.75);g.push(s);}
  const m=new THREE.Mesh(mergeGeometries(g),sbMat('#fff1b8',{emissive:'#ffd36a',ei:.9}));root.add(m);keep.push(m);}
/* ── 발자국: 보름 할아버지의 오래된 발자국 길(토끼 발 — 긴 타원 둘이 나란히) + 원더룹 발자국(걸은 만큼 계속 남음, 최대 개수를 넘치면 가장 오래된 것부터 아주 천천히 흐려짐) */
const printGeo=new THREE.CircleGeometry(1,10);printGeo.rotateX(-PI/2);
const prMat=sbMat('#ffffff');prMat.polygonOffset=true;prMat.polygonOffsetFactor=-2;prMat.polygonOffsetUnits=-2;
const old=trailPts(.72),OLDN=old.length*2,oldIM=new THREE.InstancedMesh(printGeo,prMat,OLDN);
{const m=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),c=col('#7f7c7a');let k=0;
  old.forEach(([x,z],i)=>{const [nx,nz]=old[Math.min(old.length-1,i+1)],[px,pz]=old[Math.max(0,i-1)],a=Math.atan2(nx-px,nz-pz);
    [-1,1].forEach(s=>{const ox=Math.cos(a)*s*.085,oz=-Math.sin(a)*s*.085,X=x+ox,Z=z+oz;e.set(0,a,0);q.setFromEuler(e);
      m.compose(new THREE.Vector3(X,groundY(X,Z)+.015,Z),q,new THREE.Vector3(.055,1,.15));oldIM.setMatrixAt(k,m);oldIM.setColorAt(k,c.clone().multiplyScalar(.96+((i*7+s)%5)*.02));k++;});});}
oldIM.receiveShadow=true;root.add(oldIM);keep.push(oldIM);
const MAXP=MOB?160:320,myIM=new THREE.InstancedMesh(printGeo,prMat,MAXP);myIM.count=0;myIM.receiveShadow=true;root.add(myIM);keep.push(myIM);
const fp={head:0,n:0,last:null,side:1,tot:0,dark:col('#8a8784'),fade:col('#b5b3b0')};
{const c=new THREE.Color();for(let i=0;i<MAXP;i++)myIM.setColorAt(i,c.copy(fp.dark));}
function stepPrint(x,z,a){const s=fp.side;fp.side=-s;const ox=Math.cos(a)*s*.1,oz=-Math.sin(a)*s*.1,X=x+ox,Z=z+oz;
  const m=new THREE.Matrix4().compose(new THREE.Vector3(X,groundY(X,Z)+.014,Z),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,a,0)),new THREE.Vector3(.075,1,.13));
  myIM.setMatrixAt(fp.head,m);fp.head=(fp.head+1)%MAXP;fp.n=Math.min(MAXP,fp.n+1);myIM.count=fp.n;fp.tot++;myIM.instanceMatrix.needsUpdate=true;
  // 오래된 순서(0 = 방금): 개수의 60%를 넘은 것부터 끝까지 바닥색 쪽으로 천천히
  const c=new THREE.Color();for(let i=0;i<fp.n;i++){const rank=(fp.head-1-i+MAXP)%MAXP,f=fp.n<MAXP?0:ss(.6*MAXP,MAXP,rank);myIM.setColorAt(i,c.copy(fp.dark).lerp(fp.fade,f*.92));}
  myIM.instanceColor.needsUpdate=true;}
/* ── 반짝이(한 번에): 그늘 분화구 서리 반짝임(푸른 흰빛) + 햇빛 쪽 열기 일렁임(따뜻한 크림, 천천히 오르며) + 얼음 동굴 안 반짝임 */
const NF=MOB?26:44,NH=MOB?22:40,NC=MOB?10:16,NS=NF+NH+NC;
const sp={pos:new Float32Array(NS*3),col:new Float32Array(NS*3),seed:[]};
for(let i=0;i<NS;i++){let x,z,kind;if(i<NF){const a=rnd(0,PI*2),d=rnd(0,SHADE.r*.9);x=SHADE.c[0]+Math.cos(a)*d;z=SHADE.c[1]+Math.sin(a)*d;kind=0;}
  else if(i<NF+NH){const a=rnd(0,PI*2),d=rnd(0,8);x=WARM[0]+Math.cos(a)*d;z=WARM[1]+Math.sin(a)*d;kind=1;}else{const a=rnd(0,PI*2),d=rnd(0,1.1);x=CAVE[0]+Math.cos(a)*d;z=CAVE[1]+Math.sin(a)*d;kind=2;}
  sp.seed.push({x,z,kind,ph:rnd(0,10),sp:rnd(.6,1.4),y0:groundY(x,z)});}
const spGeo=new THREE.BufferGeometry();spGeo.setAttribute('position',new THREE.BufferAttribute(sp.pos,3));spGeo.setAttribute('color',new THREE.BufferAttribute(sp.col,3));
const dotTex=(()=>{const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d'),gr=g.createRadialGradient(16,16,0,16,16,16);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.3,'rgba(255,255,255,.7)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,32,32);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;})();
const spMat=new THREE.PointsMaterial({map:dotTex,size:.22,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
const sparks=new THREE.Points(spGeo,spMat);sparks.frustumCulled=false;root.add(sparks);keep.push(sparks);
function tickSparks(t){const cF=col('#cfe8ff'),cH=col('#ffd9a0'),cC=col('#a9d8ff');for(let i=0;i<NS;i++){const s=sp.seed[i];let y,k,c;
  if(s.kind===1){const u=((t*.25*s.sp+s.ph)%1);y=s.y0+.2+u*2.2;k=Math.sin(u*PI)*.55;c=cH;}else{y=s.y0+(s.kind===2?.4+((s.ph*3)%1.2):.12+(s.ph%.5));const w=Math.sin(t*2.3*s.sp+s.ph*6);k=Math.max(0,w)**6*(s.kind===2?1:.9);c=s.kind===2?cC:cF;}
  sp.pos[i*3]=s.x+(s.kind===1?Math.sin(t*1.7+s.ph)*.12:0);sp.pos[i*3+1]=y;sp.pos[i*3+2]=s.z;sp.col[i*3]=c.r*k;sp.col[i*3+1]=c.g*k;sp.col[i*3+2]=c.b*k;}
  spGeo.attributes.position.needsUpdate=true;spGeo.attributes.color.needsUpdate=true;}
/* ── 보름 할아버지(달토끼, 키 1.38m = 원더룹과 같음): 정점 색 덩어리 다섯(몸·머리·두 팔·펼친 지도) — 그리기 5번 */
const bobo=makeBobo();bobo.root.position.set(BOBO[0],groundY(...BOBO),BOBO[1]);bobo.root.rotation.y=Math.atan2(SPAWN[0]-BOBO[0],SPAWN[1]-BOBO[1]);root.add(bobo.root);keep.push(bobo.root);
const boboOb={c:[BOBO[0],BOBO[1],.38]};obstacles.push(boboOb);
/* ── 하늘: 남보라 우주(공기가 없어 낮에도 까맣고 별) + 은하수, 멀리 해(크림빛 원 + 빛무리), 화면을 넘칠 만큼 큰 목성(줄무늬 + 붉은 폭풍), 작은 토성과 고리, 날씨(유성·오로라·성운) */
const SUNDIR=new THREE.Vector3(-6,-3.6,-9).normalize();
const key={top:'#151331',horizon:'#29245a',hemi:'#c4c6e6',ground:'#56506e',hemiI:.52,sun:'#fff3dc',sunI:.95,sunDir:SUNDIR.toArray(),fill:.24,fog:'#2e2a5c',fogNear:70,fogFar:150,stars:1,milky:.9};
const SK=G.sky.sky({parent:root,keys:[key,key,key],t:0,nStars:MOB?220:340,starSize:3,space:true});
const skyG=new THREE.Group();skyG.name='space-sky';root.add(skyG);
const bill=(tex,size,dir,dist,{op=1,add=false,order=-1}={})=>{const m=new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,fog:false,opacity:op,blending:add?THREE.AdditiveBlending:THREE.NormalBlending});m.userData.noBend=true;
  const me=new THREE.Mesh(new THREE.PlaneGeometry(size,size),m);me.position.copy(dir).normalize().multiplyScalar(dist);me.renderOrder=order;me.frustumCulled=false;me.userData.noMerge=true;skyG.add(me);return me;};
const sunM=bill(canvasTex(256,g=>{const gr=g.createRadialGradient(128,128,0,128,128,128);gr.addColorStop(0,'rgba(255,252,236,1)');gr.addColorStop(.17,'rgba(255,246,214,1)');gr.addColorStop(.2,'rgba(255,232,180,.6)');gr.addColorStop(.45,'rgba(255,214,150,.18)');gr.addColorStop(1,'rgba(255,200,140,0)');g.fillStyle=gr;g.fillRect(0,0,256,256);}),30,new THREE.Vector3(-SUNDIR.x,.06,-SUNDIR.z),88,{add:true,order:-2});
const jup=bill(canvasTex(512,jupiterArt),84,new THREE.Vector3(.72,-.1,.6),92,{order:-3});
const sat=bill(canvasTex(256,saturnArt),18,new THREE.Vector3(-.8,.02,.3),86,{order:-3});
// 날씨 그림
const meteors=(()=>{const n=7,pos=new Float32Array(n*6),cc=new Float32Array(n*6),geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(cc,3));
  const m=new THREE.LineBasicMaterial({vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false});m.userData.noBend=true;const ls=new THREE.LineSegments(geo,m);ls.frustumCulled=false;ls.renderOrder=-1;ls.userData.noMerge=true;skyG.add(ls);
  const M=[];for(let i=0;i<n;i++)M.push({t:-rnd(0,6),d:new THREE.Vector3(),v:new THREE.Vector3()});return {ls,M,pos,cc,geo};})();
const aurora=(()=>{const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false,uniforms:{uT:{value:0},uA:{value:0}},
    vertexShader:'varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'uniform float uT,uA;varying vec2 vU;void main(){float x=vU.x*18.;float w=.55+.45*sin(x+uT*.6)*sin(x*.37-uT*.4);float band=smoothstep(0.,.25,vU.y)*(1.-smoothstep(.35,1.,vU.y));float stripe=.6+.4*sin(x*3.1+sin(x*.7+uT)*2.);vec3 c=mix(vec3(.35,1.,.62),vec3(.95,.5,.9),smoothstep(.3,.95,vU.y));gl_FragColor=vec4(c*band*w*stripe*uA,1.);}'});
  m.userData.noBend=true;const g=new THREE.CylinderGeometry(80,80,34,64,1,true,-PI*.15,PI*.8);const me=new THREE.Mesh(g,m);me.position.y=10;me.frustumCulled=false;me.renderOrder=-1;me.userData.noMerge=true;skyG.add(me);return {me,m};})();
const nebula=bill(canvasTex(512,nebulaArt),120,new THREE.Vector3(-.2,.16,-1),84,{add:true,order:-2,op:0});
const SKY_OBJ=[sunM,jup,sat,nebula];
/* 지평선 가까이 별(공용 하늘의 별은 위쪽에 모여 있어, 따라가기 카메라가 보는 낮은 하늘에도 별이 총총) — 그리기 1번 */
{const n=MOB?160:260,pos=new Float32Array(n*3),cc=new Float32Array(n*3),c=new THREE.Color();for(let i=0;i<n;i++){const a=rnd(0,PI*2),el=Math.asin(rnd(-.05,.75)),d=84;
    pos.set([Math.cos(a)*Math.cos(el)*d,Math.sin(el)*d,Math.sin(a)*Math.cos(el)*d],i*3);c.set(['#fff6dc','#dfe6ff','#ffe2c4','#ffffff'][i%4]).multiplyScalar(rnd(.45,1));cc.set([c.r,c.g,c.b],i*3);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(cc,3));
  const m=new THREE.PointsMaterial({map:dotTex,size:MOB?3.4:4,sizeAttenuation:false,vertexColors:true,transparent:true,depthWrite:false,fog:false});m.userData.noBend=true;
  const pts=new THREE.Points(geo,m);pts.frustumCulled=false;pts.renderOrder=-8;pts.userData.noMerge=true;skyG.add(pts);}
/* ── 놓아두기·충돌 */
const areas={planet:{bounds:[-HALF-4,HALF+4,-HALF-4,HALF+4],obstacles,camera:{target:[0,1,0],dist:9,polar:[.45,1.35],azimuth:null,start:[2.6,.95],minDist:3,maxDist:30}}};
const platforms=[{c:[ROCK.c[0],ROCK.c[1],ROCK.r*.98],top:ROCK_TOP}];
/* ── 이야기 진행 */
const F=G.state.flags,HAVE='have:'+WID+':necklace',K={demo:'space:demo',rock:'space:rock',clear:'clear:space-garden',cave:'secret:'+WID+':icecave'};
G.profile.setup({world:WID,cards:{bobo:{name:'보름 할아버지',intro:'발자국으로 지도를 그리는 달토끼',likes:'아직 아무도 안 가 본 빈칸',quote:'여긴 바람이 없어서, 걸은 길이 아주 오래오래 남는단다.',bg:'#dfe1f2',portrait:{side:.5,lift:.1}}}});
const st={said:false,warm:false,cold:false,start:false,hop:null,lastQ:'',culled:false,demoSaid:false};
if(F[K.demo])placeBobo(HOP,ROCK.c);
G.dialog.npc({id:'bobo',name:'보름 할아버지',root:bobo.root,bubbleY:1.62,talkR:2.4,
  repeatLine:'바람이 없어서 발자국이 오래오래 남는단다. 네 발자국도 그대로 있을 게야.',
  onDone:()=>G.profile.meet('bobo',bobo.root),
  variants:[
    {when:()=>!F[HAVE],lines:['어서 오렴, 작은 탐험가. 나는 이 회색 정원에 사는 보름 할아버지란다.','여긴 공기가 거의 없어서, 숨방울 하나는 꼭 챙겨야 한단다.','내 발자국을 따라가 보렴. 다 그대로 남아 있을 게야.']},
    {when:()=>F[HAVE]&&!F[K.rock],lines:['숨방울이 잘 어울리는구나!','자, 발끝에 힘을 주고 톡! 여긴 중력이 약해서 내려오기까지 한참 걸린단다.','저 높은 바위에 올라 보렴. 거기서 보면 지도의 첫 빈칸이 채워질 게야.']},
    {when:()=>F[K.rock]&&!F[K.clear],lines:['첫 빈칸을 채웠구나! 내 지도에 네 발자국도 그려 두마.','행성 끝, 빛기둥이 선 곳이 출구란다. 저 하늘의 큰 행성들이 다음 목적지를 알려 줄 게야.']},
    {when:()=>!!F[K.clear],lines:['또 오렴. 네 발자국은 여기 오래오래 남아 있을 테니.']}]});
function placeBobo(at,look){bobo.root.position.set(at[0],groundY(...at),at[1]);bobo.root.rotation.y=Math.atan2(SPAWN[0]-at[0],SPAWN[1]-at[1]);boboOb.c[0]=at[0];boboOb.c[1]=at[1];}
function quest(q,goal){if(q!==st.lastQ){st.lastQ=q;G.ui.setQuest(q);}G.goal.set(goal||null);}
function hopDemo(){st.hop={t:0,from:[bobo.root.position.x,bobo.root.position.z],y0:bobo.root.position.y,to:HOP};G.state.setFlag(K.demo,true);
  /* 카메라 연출 자리는 그려지는 자리(공 위로 감긴 자리)로 — 평평한 자리를 그대로 주면 멀리 있는 곳은 지평선 아래라 빈 하늘만 보였다 */
  const mid=[(st.hop.from[0]+HOP[0])/2,(st.hop.from[1]+HOP[1])/2],a=bentPos({x:mid[0],y:1.6,z:mid[1]}),P=G.mission.hero().position,f=bentPos({x:P.x+(P.x-mid[0])*.15,y:4.5,z:P.z+(P.z-mid[1])*.15});
  G.view.focus({at:[a.x,a.y,a.z],from:[f.x,f.y,f.z],sec:3.2});}
let fpLast=null;
const U0=()=>G.view.camera&&G.mission.hero&&G.mission.hero();
function update(dt,t,env){const WL=U0();if(!WL)return;const U=WL.userData,P=WL.position;
  if(!st.culled){st.culled=true;root.traverse(o=>{o.frustumCulled=false;});U.wrapShift=wrapShift;}
  if(!F[K.cave]&&dist(P.x,P.z,CAVE)<1.5&&!G.ui.cardShown())caveSecret(); // 비밀: 얼음 동굴(놓쳐도 진행 영향 없음)
  bobo.tick(dt,t,st.hop);tickSparks(t);
  // 하늘: 원더룹을 따라(그림에서 원더룹은 늘 꼭대기) — 카메라 쪽을 보게
  {const cam=G.view.camera;skyG.position.set(P.x,0,P.z);for(const m of SKY_OBJ)m.lookAt(cam.position);sat.rotateZ(.35);
   tickWeather(dt,t,env&&env.weather);}
  // 발자국: 땅을 밟고 걸을 때 0.42m마다 번갈아
  {const V=U.vert;if(V&&!V.air&&!U.riding){if(!fpLast)fpLast={x:P.x,z:P.z};const dx=wd(P.x-fpLast.x),dz=wd(P.z-fpLast.z),d=Math.hypot(dx,dz);if(d>.42&&d<3){stepPrint(P.x,P.z,Math.atan2(dx,dz));fpLast={x:P.x,z:P.z};}else if(d>=3)fpLast={x:P.x,z:P.z};}else fpLast=null;}
  if(!G.core||G.front.frontShown&&G.front.frontShown())return;
  // 할아버지 둥실 건너뛰기(시범)
  if(st.hop){const h=st.hop;h.t+=dt;const T=2.6,u=Math.min(1,h.t/T),x=h.from[0]+(h.to[0]-h.from[0])*u,z=h.from[1]+(h.to[1]-h.from[1])*u,y0=h.y0+(groundY(...h.to)-h.y0)*u;
    bobo.root.position.set(x,y0+Math.sin(u*PI)*3.2,z);bobo.root.rotation.y=Math.atan2(h.to[0]-h.from[0],h.to[1]-h.from[1]);
    if(u>=1){st.hop=null;placeBobo(HOP,ROCK.c);G.sound.sfx('land');}}
  const ms=G.mission.missionState();
  // 사실 안내(처음 한 번씩)
  if(!st.start&&ms){st.start=true;setTimeout(()=>G.ui.toast('공기가 거의 없어서 낮인데도 하늘이 까맣고 별이 보여요',4.2),9000);}
  if(!st.warm&&dist(P.x,P.z,WARM)<9){st.warm=true;G.ui.toast('햇빛이 닿는 땅은 뜨겁게 일렁여요 — 수성은 낮에 430도까지 올라요',4.2);}
  if(!st.cold&&dist(P.x,P.z,SHADE.c)<SHADE.r){st.cold=true;G.ui.toast('햇빛이 안 드는 그늘 분화구는 영하 160도 — 서리가 그대로 얼어 있어요',4.2);}
  // 첫 미션 동안: 할아버지 한마디(미션 카드 뒤)
  if(ms&&!ms.got&&!st.said&&!G.ui.cardShown()){st.said=true;G.dialog.say('보름 할아버지','여긴 공기가 거의 없어서, 숨방울 하나는 꼭 챙겨야 한단다.',4).then(ok=>ok&&G.dialog.say('보름 할아버지','내 발자국을 따라가 보렴. 다 그대로 남아 있을 게야.',4));}
  if(!F[HAVE])return;
  // 둥실 뛰기 익히기
  if(!F[K.demo]){quest('보름 할아버지에게 돌아가요',{at:[bobo.root.position.x,bobo.root.position.z],label:'보름 할아버지',style:'ant',h:3});
    if(!st.demoQ&&dist(P.x,P.z,[bobo.root.position.x,bobo.root.position.z])<4.2&&!G.ui.cardShown()&&!st.hop){st.demoQ=true;U.stopWalk&&U.stopWalk();
      G.dialog.say('보름 할아버지','자, 발끝에 힘을 주고 톡! 여긴 중력이 약해서 내려오기까지 한참 걸린단다.',4.5);setTimeout(hopDemo,900);}return;}
  if(!F[K.rock]){if(!st.hop)quest('할아버지처럼 둥실 뛰어 높은 바위에 올라요 (점프)',{at:ROCK.c,label:'높은 바위',style:'ant',h:ROCK_TOP+2.4});
    if(!st.hop&&!st.demoSaid&&dist(P.x,P.z,HOP)<6){st.demoSaid=true;G.dialog.say('보름 할아버지','톡! 하고 뛰면 둥실 떠오른단다. 바위 꼭대기까지 충분해.',4);}
    const V=U.vert;if(V&&V.y>ROCK_TOP-.2&&dist(P.x,P.z,ROCK.c)<ROCK.r+.2){G.state.setFlag(K.rock,true);G.react.react('joy');
      G.ui.notice({kicker:'우주 지도',title:'첫 빈칸을 채웠어요!',text:'바람이 없는 곳에선 발자국이 아주 오래 남아요. 보름 할아버지의 지도에 회색 정원이 그려졌어요.',icon:ICON_MAP()});}return;}
  if(!F[K.clear]){quest('행성 끝 출구 빛기둥까지 가요',{at:EXIT,label:'출구',style:'ant',h:4});
    if(dist(P.x,P.z,EXIT)<1.7){G.state.setFlag(K.clear,true);quest('',null);G.react.react('hop');
      G.ui.itemCard({title:'STAGE 1 완료!',text:'회색 정원 탐험 완료 · 다음 목적지: 붉은 모래 언덕',icon:ICON_MAP(),sec:4.5,sound:'mission-clear',who:'완료'});}}
  else quest('',null);}
const ICON_MAP=()=>SPACE.icons.map();
// 비밀: 얼음 동굴(놓쳐도 진행 영향 없음)
function caveSecret(){G.state.setFlag(K.cave,true);G.react.react('awe',{sound:'card-secret'});
  G.ui.secret({kicker:'숨겨진 비밀',title:'그늘 분화구의 얼음 동굴',text:'햇빛이 한 줄기도 들지 않아 얼음이 녹지 않고 아주 오래오래 그대로 남은 곳이에요. 차갑게 반짝이는 얼음 결이 천장까지 자랐어요.',count:'발견한 비밀 1/1'});}
function tickWeather(dt,t,w){const M=meteors;
  // 유성우: 하늘 위쪽에서 비스듬히 쉭 — 머리 반짝, 꼬리 어둡게(더하기 섞기)
  const on=w==='meteor'?1:w==='starlight'?.15:0;let any=false;
  for(let i=0;i<M.M.length;i++){const m=M.M[i];m.t+=dt;if(m.t>1.1){if(Math.random()<on*dt*1.6*7/M.M.length*3){m.t=0;const a=Math.random()*PI*2,el=.35+Math.random()*.5;m.d.set(Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)).multiplyScalar(78);const b=a+(Math.random()<.5?1:-1)*(.5+Math.random()*.5);m.v.set(Math.cos(b)*.6,-.55,Math.sin(b)*.6).normalize().multiplyScalar(38);}else{for(let k=0;k<6;k++)M.cc[i*6+k]=0;continue;}}
    any=true;const u=m.t/1.1,hx=m.d.x+m.v.x*m.t,hy=m.d.y+m.v.y*m.t,hz=m.d.z+m.v.z*m.t,L=.22;M.pos.set([hx,hy,hz,hx-m.v.x*L,hy-m.v.y*L,hz-m.v.z*L],i*6);const k=Math.sin(u*PI);M.cc.set([k,k*.96,k*.85,0,0,0],i*6);}
  M.ls.visible=any;if(any){M.geo.attributes.position.needsUpdate=true;M.geo.attributes.color.needsUpdate=true;}
  const A=aurora.m.uniforms;A.uT.value=t;A.uA.value+=((w==='aurora'?.85:0)-A.uA.value)*Math.min(1,dt*.8);aurora.me.visible=A.uA.value>.01;
  nebula.material.opacity+=((w==='nebula'?.9:0)-nebula.material.opacity)*Math.min(1,dt*.8);nebula.visible=nebula.material.opacity>.01;
  sunM.scale.setScalar(1+.03*Math.sin(t*1.3));}
function wrapShift(k,sh){if(fpLast)fpLast[k]+=sh;}
return {
  name:'회색 정원',kind:'outdoor',start:{compass:true},world:null,
  spawn:{x:SPAWN[0],z:SPAWN[1],ry:PI},
  areas,platforms,
  sun:{dir:SUNDIR.clone(),shadow:14,follow:true},
  sky:SK,bend:{sphere:R,wrap:L},gravity:.38,jumpK:1.15,
  groundY,ground:[ground],keepOut:keep,mergeColors:true,music:null,
  update,dispose(){const W=G.mission.hero&&G.mission.hero();if(W&&W.userData.wrapShift===wrapShift)W.userData.wrapShift=null;},
};
}
function canvasTex(n,draw){const c=document.createElement('canvas');c.width=c.height=n;draw(c.getContext('2d'),n);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
/* 목성: 크림·황토·적갈색 줄무늬 + 붉은 폭풍(큰 붉은 점), 색연필 빗금 결, 가장자리 살짝 어둡게 */
function jupiterArt(g,n){const r=n*.47,cx=n/2,cy=n/2;g.save();g.beginPath();g.arc(cx,cy,r,0,PI*2);g.clip();
  const bands=['#f3e3c4','#d9b48a','#f0dcb6','#c98d62','#ead2a8','#b8754e','#f2e0bc','#d4a67a','#efd9b0','#c58a60','#f3e3c4'];const bh=2*r/bands.length;
  bands.forEach((c,i)=>{g.fillStyle=c;g.beginPath();const y0=cy-r+i*bh;g.moveTo(cx-r,y0);for(let x=0;x<=2*r;x+=8)g.lineTo(cx-r+x,y0+Math.sin(x*.03+i)*bh*.18);g.lineTo(cx+r,y0+bh*1.3);g.lineTo(cx-r,y0+bh*1.3);g.fill();});
  let s=7;const R=()=>((s=(s*16807)%2147483647)/2147483647);g.globalAlpha=.16;g.lineWidth=2;for(let i=0;i<500;i++){const x=cx-r+R()*2*r,y=cy-r+R()*2*r;g.strokeStyle=R()<.5?'#fff6e6':'#8a5a3a';g.beginPath();g.moveTo(x,y);g.lineTo(x+8+R()*14,y+(R()-.5)*3);g.stroke();}
  g.globalAlpha=1;g.fillStyle='#c4523a';g.beginPath();g.ellipse(cx+r*.28,cy+r*.3,r*.2,r*.11,0,0,PI*2);g.fill();g.fillStyle='#e07a5a';g.beginPath();g.ellipse(cx+r*.28,cy+r*.3,r*.12,r*.06,0,0,PI*2);g.fill();
  const sh=g.createRadialGradient(cx-r*.25,cy-r*.25,r*.4,cx,cy,r*1.02);sh.addColorStop(0,'rgba(0,0,0,0)');sh.addColorStop(.8,'rgba(20,10,40,.15)');sh.addColorStop(1,'rgba(20,10,40,.55)');g.fillStyle=sh;g.fillRect(0,0,n,n);g.restore();
  g.strokeStyle='rgba(74,42,42,.55)';g.lineWidth=4;g.beginPath();g.arc(cx,cy,r,0,PI*2);g.stroke();}
function saturnArt(g,n){const cx=n/2,cy=n/2,r=n*.2;const ring=(front)=>{g.save();g.translate(cx,cy);g.scale(1,.32);g.beginPath();if(front)g.arc(0,0,n*.44,0,PI);else g.arc(0,0,n*.44,PI,PI*2);g.lineWidth=n*.07;g.strokeStyle='#e9c97a';g.stroke();g.lineWidth=n*.02;g.strokeStyle='#b9944e';g.stroke();g.restore();};
  ring(false);g.fillStyle='#f0d49a';g.beginPath();g.arc(cx,cy,r,0,PI*2);g.fill();g.strokeStyle='#c99a4e';g.lineWidth=3;[-.35,.1,.45].forEach(k=>{g.beginPath();g.moveTo(cx-r*.95,cy+r*k);g.quadraticCurveTo(cx,cy+r*k+4,cx+r*.95,cy+r*k);g.stroke();});ring(true);}
function nebulaArt(g,n){let s=11;const R=()=>((s=(s*16807)%2147483647)/2147483647);const cols=['255,160,170','255,190,130','200,160,240','150,190,255'];
  for(let i=0;i<46;i++){const x=n*(.15+R()*.7),y=n*(.3+R()*.45),r=n*(.08+R()*.18),c=cols[i%4],gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(${c},.16)`);gr.addColorStop(1,`rgba(${c},0)`);g.fillStyle=gr;g.fillRect(0,0,n,n);}}
/* 보름 할아버지 모델 — 회색 달토끼: 달걀 몸·둥근 머리·한쪽 귀는 쫑긋, 한쪽은 반쯤 접힘·붉은 띠 작은 검은 신사모자·오른쪽 눈 망원경 안경(놋쇠 짧은 통)·등에 둘둘 만 지도·흰 꼬리
   부품을 덩어리마다 정점 색으로 합친다(몸·머리·왼팔·오른팔·펼친 지도). 대기 동작: 지도를 펼쳐 보기 ↔ 망원경 안경 고쳐 쓰기 */
function makeBobo(){const root=new THREE.Group();root.name='bobo';
  const lump=(list)=>{const gs=list.map(([geo,c,pos,rot,s])=>{let g=geo.index?geo.toNonIndexed():geo;for(const k of Object.keys(g.attributes))if(!['position','normal','uv'].includes(k))g.deleteAttribute(k);
      g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...(pos||[0,0,0])),new THREE.Quaternion().setFromEuler(new THREE.Euler(...(rot||[0,0,0]))),new THREE.Vector3(...(s||[1,1,1]))));
      const n=g.attributes.position.count,cc=new Float32Array(n*3),C=new THREE.Color(c);for(let i=0;i<n;i++){cc[i*3]=C.r;cc[i*3+1]=C.g;cc[i*3+2]=C.b;}g.setAttribute('color',new THREE.BufferAttribute(cc,3));return g;});
    const m=sbMat('#ffffff');m.vertexColors=true;const me=new THREE.Mesh(mergeGeometries(gs),m);me.castShadow=true;return me;};
  const S=(r,w=14,h=10)=>new THREE.SphereGeometry(r,w,h),Cy=(a,b,h,n=12)=>new THREE.CylinderGeometry(a,b,h,n);
  const fur='#c3c4cc',furD='#a7a8b2',cream='#efe6d6',pink='#f2a7b4',dark='#2a2633',red='#c8463c',brass='#d8a24a',paper='#f3e4c4',strap='#7a4e32';
  const body=lump([[S(.34),fur,[0,.42,0],0,[1,1.08,.92]],[S(.2),cream,[0,.4,.2],0,[1,1.2,.5]],[S(.13,10,8),fur,[-.15,.07,.08],0,[1,.55,1.5]],[S(.13,10,8),fur,[.15,.07,.08],0,[1,.55,1.5]],
    [S(.1,10,8),'#ffffff',[0,.3,-.31]],[Cy(.075,.075,.56),paper,[0,.62,-.3],[0,0,PI/2]],[Cy(.08,.08,.04),strap,[.12,.62,-.3],[0,0,PI/2]],[Cy(.08,.08,.04),strap,[-.12,.62,-.3],[0,0,PI/2]],
    [new THREE.TorusGeometry(.32,.018,6,20,PI*.9),strap,[0,.56,0],[PI/2+.25,0,.9],[1,1,.85]]]);
  root.add(body);
  const head=new THREE.Group();head.position.set(0,.84,0);root.add(head);
  const earBent=new THREE.Group();
  head.add(lump([[S(.29),fur,[0,.12,0],0,[1.05,.95,1]],[S(.13,10,8),cream,[0,.03,.22],0,[1.25,.8,.7]],[S(.035,8,6),pink,[0,.08,.29]],
    [S(.04,8,6),dark,[-.1,.15,.25],0,[.8,1.2,.5]],[S(.045,8,6),'#f6a0ac',[-.18,.04,.21],0,[1,.6,.4]],[S(.045,8,6),'#f6a0ac',[.18,.04,.21],0,[1,.6,.4]],
    // 오른쪽 눈(원더룹을 보는 쪽 +x) 망원경 안경: 놋쇠 테 + 짧은 통 + 렌즈
    [new THREE.TorusGeometry(.06,.014,6,16),brass,[.1,.15,.27]],[Cy(.045,.05,.12,10),brass,[.1,.15,.33],[PI/2,0,0]],[Cy(.04,.04,.01,10),'#bfe0f0',[.1,.15,.395],[PI/2,0,0]],[S(.02,6,5),dark,[.1,.15,.25]],
    // 쫑긋한 왼귀(−x)
    [S(.075,10,8),fur,[-.12,.55,-.02],[0,0,.12],[1,3.4,.7]],[S(.045,8,6),pink,[-.12,.55,.025],[0,0,.12],[1,3,.5]],
    // 모자: 챙 + 몸통 + 붉은 띠
    [Cy(.2,.2,.025,16),dark,[.04,.39,0],[0,0,-.12]],[Cy(.12,.13,.2,14),dark,[.05,.5,0],[0,0,-.12]],[Cy(.133,.137,.05,14),red,[.045,.43,0],[0,0,-.12]]]));
  // 반쯤 접힌 오른귀(+x): 아랫마디는 서고 윗마디가 바깥으로 꺾여 내려옴
  earBent.position.set(.14,.36,-.02);head.add(earBent);
  earBent.add(lump([[S(.07,10,8),fur,[0,.12,0],[0,0,-.1],[1,2,.7]],[S(.065,10,8),fur,[.13,.26,0],[0,0,-1.2],[1,1.9,.65]],[S(.04,8,6),pink,[.13,.26,.03],[0,0,-1.2],[1,1.7,.5]]]));
  const arm=(s)=>{const g=new THREE.Group();g.position.set(s*.3,.6,.04);g.add(lump([[S(.07,10,8),fur,[0,-.13,0],0,[1,2.1,1]],[S(.065,10,8),cream,[0,-.27,.01]]]));root.add(g);return g;};
  const armL=arm(-1),armR=arm(1);
  const map=lump([[new THREE.BoxGeometry(.5,.32,.012),paper,[0,0,0]],[Cy(.03,.03,.34,8),paper,[-.26,0,0]],[Cy(.03,.03,.34,8),paper,[.26,0,0]],
    [new THREE.BoxGeometry(.3,.012,.004),'#a8603f',[-.02,.05,.008],[0,0,.3]],[new THREE.BoxGeometry(.2,.012,.004),'#a8603f',[.08,-.06,.008],[0,0,-.4]],[S(.03,6,5),'#9bd46b',[.15,.04,.01]],[S(.025,6,5),'#bfc3cc',[-.15,-.07,.01]]]);
  map.position.set(0,.62,.36);map.rotation.x=-.5;map.scale.set(0,1,1);root.add(map);
  let mode=0,mt=0;
  function tick(dt,t,hop){mt+=dt;if(mt>6.5){mt=0;mode=(mode+1)%2;}
    const k=hop?0:ss(0,.6,mt)*ss(6.5,5.8,mt);// 동작 세기(들어갔다 나옴)
    head.rotation.z=Math.sin(t*.9)*.04;head.position.y=.84+Math.sin(t*1.8)*.008;earBent.rotation.z=Math.sin(t*1.3)*.08;
    if(hop){armL.rotation.set(0,0,-1.2);armR.rotation.set(0,0,1.2);map.scale.x=0;return;}
    if(mode===0){// 지도 펼쳐 보기: 두 팔을 앞으로, 지도가 가운데서 양옆으로 펴짐, 고개를 숙여 봄
      armL.rotation.set(-1.1*k,0,.25*k);armR.rotation.set(-1.1*k,0,-.25*k);map.scale.x=Math.max(.001,ss(.3,.9,mt)*ss(6.3,5.6,mt));head.rotation.x=.25*k;}
    else{// 망원경 안경 고쳐 쓰기: 오른팔을 들어 눈가에, 고개를 살짝 갸웃
      armL.rotation.set(0,0,0);armR.rotation.set(-2.2*k,0,-.35*k+Math.sin(t*6)*.04*k);map.scale.x=.001;head.rotation.x=-.08*k;head.rotation.z+=.12*k;}}
  return {root,tick};}
