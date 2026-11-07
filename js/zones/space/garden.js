/* 무한 우주 ① 회색 정원 (달 + 수성) — 걸어서 한 바퀴 도는 작은 행성 (2026-11-07 1차 · 같은 날 '채우기')
   ─────────────────────────────────────────────────────────────────────────
   작은 행성 걷기(game/bend.js '작은 행성' — 확정): 판정·이동·충돌·카메라는 평평한 땅 그대로, 땅은 L = 2πR(약 106.8m) 간격으로 이어진다
   (08이 원더룹이 L/2 밖으로 나가면 L만큼 옮겨 이어 붙임 → 한 방향으로 곧게 걸으면 약 28초(걷기 3.78m/초)에 제자리).
   그릴 때만 원더룹 자리를 꼭대기로 반지름 R = 17m 공 위로 감는다 → 원더룹 둘레는 평평하고, 멀수록 지평선 아래로 넘어가 행성 모양.
   구역 물체는 평평한 자리로 화면 밖 판정을 하면 이어 붙인 쪽이 사라지므로 frustumCulled=false(update에서 한 번).
   이어 붙는 선(x·z = ±L/2) 가까이에는 장애물을 두지 않는다(충돌 판정은 이어 붙이지 않음). 높낮이·색 무늬는 L 주기(sin(2πk·x/L))로 이음매가 없게.
   이 행성의 진짜 사실: 공기가 거의 없어 낮에도 하늘이 까맣고 별이 보임 · 바람이 없어 발자국이 오래 남음(원더룹 발자국 + 보름 할아버지의 수십 년 된 발자국 길)
     · 햇빛 쪽은 따뜻하게 일렁임(수성 낮 430도) · 햇빛이 안 드는 그늘 분화구엔 서리·얼음 결(영하 160도) · 낮은 중력(둥실 뛰기 — gravity .38, jumpK 1.15: 높이 약 2.7m, 체공 약 2초).
   흐름: 이야기 소개 → 첫 미션 숨방울 목걸이(세계 설정 firstMission — 그늘 분화구) → 할아버지에게 돌아가면 둥실 뛰기 시범(바위 쪽으로 한 번 크게 — 카메라가 원더룹 뒤에서 할아버지를 따라 봄)
     → 원더룹이 높은 바위에 오르면 첫 빈칸(지도 조각) → 출구 빛기둥 → 'STAGE 1 완료'(별똥별 이동은 2차). 비밀: 그늘 분화구 깊은 곳 얼음 동굴(감탄 + 발견).
   채우기(2026-11-07, 개미굴처럼 어디를 봐도 볼거리 — docs/series-rules.md '화면 밀도'):
     · 색: 회색 바닥에 색연필 얼룩 — 그늘·분화구 안은 연보라(#A884C9 계열), 햇빛 쪽(+x 비탈·따뜻한 땅)은 크림빛. 분화구 안쪽 가장자리에 작게 빛나는 파스텔 수정(분홍·하늘·노랑),
       그늘 분화구 얼음은 은은한 푸른 빛 + 바닥 빛 웅덩이. 조명: 따뜻한 햇빛 + 연보라 보조광(구역 빛) + 원더룹 둘레 빛 테두리(구역 정보 rim → 08).
     · 보름 할아버지의 작은 마을(시작 지점): 둥근 돌집·작은 천문대 망원경·지도를 널어 말리는 빨랫줄·다녀온 곳마다 꽂은 색색의 깃발 핀·우편함·작은 탁자와 의자 둘·
       따뜻한 노란 줄 조명·구석의 떡방아 절구(숨은 재미 — 하얀 떡 셋). 크기는 원더룹 키 1.38m = 1 기준(의자 0.3m·탁자 0.5m·우편함 1m·망원경 1.7m).
     · 작은 생명: 둥실둥실 뛰어다니는 아기 토끼 셋(키 0.65 = 약 0.9m, 가까이 가면 한마디), 햇빛에 반짝이며 떠다니는 먼지 알갱이(원더룹 둘레), 가끔 하늘을 가로지르는 느린 별똥별.
     · 지형: 완만한 언덕(L 주기), 크기가 다양한 둥근 바위, 작은 돌무더기, 바위 아치 하나(첫 미션 길 위 — 지나갈 수 있음), 더 진한 할아버지 발자국.
     · 하늘은 카메라를 늦게 따라오는 '하늘 그림판'(anchor): 해(왼쪽 위)·토성(위 가운데)·커다란 목성(오른쪽, 반쯤 화면 밖)·성운·은하수 띠가 카메라를 돌려도 천천히 따라와
       늘 화면에 걸린다(작은 행성이라 지평선 위 하늘이 다음 목적지를 알려 줌). 햇빛 방향도 같은 그림판 기준(카메라 왼쪽 뒤 위 — 원더룹 등과 땅이 늘 밝음).
     · 카메라: 이 구역에 들어와 처음 조작을 넘겨받을 때 한 번 조금 낮춘다(지평선이 화면 위쪽 3분의 1쯤 — 그 뒤로는 플레이어 것).
     · 가림: 얼음 동굴·바위 아치·높은 바위는 물체마다 한 덩어리(game/occlude boxes)로 카메라와 원더룹 사이에 오면 부드럽게 흐려진다.
   그리기(휴대폰, 걷는 동안): 땅 1 · 소품 1 · 빛나는 수정·전구 1 · 빛 웅덩이 1 · 동굴·아치·높은 바위 3 · 발자국 2 · 반짝이 1 · 할아버지 5~6 · 아기 토끼 3 · 동그란 그림자 1 · 그림판 별 1 · 네 갈래 반짝이 1 · 종이 결 1
     · 하늘(지붕·별·낮은 별·해·목성·토성·성운·은하수·날씨) 8~9. */
import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {PI,QUALITY,rng,blobMany} from '../../01-textures.js';
import * as G from '../../game/index.js';
import {sbMat} from '../../game/storybook.js';
import {bentPos} from '../../game/bend.js';
import SPACE from '../../worlds/infinite-space.js';
const WID=SPACE.id,R=17,L=2*PI*R,HALF=L/2,MOB=QUALITY.tier==='mobile';
const wd=a=>((a%L)+1.5*L)%L-.5*L; // 이어지는 땅에서 가장 가까운 쪽 차이
const dist=(x,z,c)=>Math.hypot(wd(x-c[0]),wd(z-c[1]));
const ss=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x);};
const col=h=>new THREE.Color(h);
const W2=k=>2*PI*k/L; // L 주기 무늬 주파수(이음매 없음)
/* 자리 */
const SPAWN=[0,9.5],BOBO=[2.1,5.4],SHADE={c:[-5,-15],r:6,d:1.3,rim:.5},ROCK={c:[-11.8,-13.5],r:1.65},CAVE=[-5,-19.7],EXIT=[6,-35],WARM=[16,8];
const DEMO_LAND=[-2.8,-1.2]; // 둥실 뛰기 시범: 할아버지가 바위 쪽으로 한 번 크게 뛰어 내려앉는 곳(원더룹 뒤 카메라에 늘 들어오는 거리)
/* 마을(시작 지점 둘레) */
const VIL=[1.4,6.2],HUT=[5.4,3.0],SCOPE=[-3.0,4.6],LINE=[[3.8,9.2],[7.0,7.2]],TABLE=[-1.7,2.4],MAIL=[-1.8,8.4],MORTAR=[7.2,10.4],POLE=[-3.6,1.2];
/* 바위 아치: 첫 미션 길 위(지나가며 올려다봄) — 가운데·길 방향 */
const ARCH={c:[-1.6,-7.9],dir:[-.37,-.93],half:1.7,h:2.2};
const CRATERS=[SHADE,{c:[12,-4],r:4,d:.8,rim:.35},{c:[-14,6],r:3.5,d:.6,rim:.3},{c:[19,21],r:5,d:1,rim:.4},{c:[-26,-30],r:6,d:1,rim:.45},{c:[30,-28],r:4,d:.7,rim:.3},
  {c:[-30,24],r:5,d:.9,rim:.4},{c:[8,30],r:3,d:.5,rim:.25},{c:[40,10],r:4,d:.8,rim:.35},{c:[-40,-6],r:4.5,d:.8,rim:.35},{c:[-18,-40],r:3.2,d:.5,rim:.25},{c:[24,-44],r:3.6,d:.6,rim:.3}];
/* 완만한 언덕 [x,z,반지름,높이] — 마을·그늘 분화구·높은 바위·출구는 피함 */
const HILLS=[[15,15,9,1.3],[-19,-3,8,1.1],[22,-15,9,1.4],[-14,25,9,1.2],[6,-23,6,.7],[-33,-37,9,1.1],[35,37,9,1.2],[41,-40,8,1],[-41,41,8,1],[31,3,7,.9],[-6,31,7,.9],[-28,11,6,.8],[13,-48,7,.9],[-47,-20,7,1]];
function groundY(x,z){let y=.16*Math.sin(W2(3)*x+.7)*Math.sin(W2(2)*z+1.3)+.1*Math.sin(W2(5)*(x+z)); // 아주 잔잔한 물결(L 주기)
  {const v=Math.max(0,1-dist(x,z,VIL)/8);y*=1-v*v*(3-2*v);} // 마을 마당은 평평하게
  for(const [hx,hz,hr,hh] of HILLS){const t=dist(x,z,[hx,hz])/hr;if(t<1)y+=hh*.5*(1+Math.cos(PI*t));}
  for(const C of CRATERS){const t=dist(x,z,C.c)/C.r;if(t<1)y+=-C.d*(1-t*t)+C.rim*ss(.55,1,t);else if(t<1.7)y+=C.rim*(1-(t-1)/.7)**2;}return y;}
/* 할아버지의 오래된 발자국 길: 집 앞 → 그늘 분화구 → 행성을 크게 한 바퀴 → 출구 */
const TRAIL=[[2.4,4.6],[1.6,0],[-.6,-5.5],[-2.6,-10.6],[-3.4,-14.2],[-8,-20],[-16,-24],[-26,-20],[-34,-8],[-40,6],[-36,20],[-24,30],[-8,36],[10,40],[26,34],[36,20],[40,4],[34,-12],[22,-26],[10,-32],[6,-35]];
function trailPts(step){const out=[];for(let i=0;i<TRAIL.length-1;i++){const [ax,az]=TRAIL[i],[bx,bz]=TRAIL[i+1],P0=TRAIL[Math.max(0,i-1)],P3=TRAIL[Math.min(TRAIL.length-1,i+2)];
    const n=Math.ceil(Math.hypot(bx-ax,bz-az)/step);for(let k=0;k<n;k++){const t=k/n,t2=t*t,t3=t2*t,cr=(p0,p1,p2,p3)=>.5*(2*p1+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t2+(-p0+3*p1-3*p2+p3)*t3);
      out.push([cr(P0[0],ax,bx,P3[0]),cr(P0[1],az,bz,P3[1])]);}}return out;}
export function build({root}){
const rnd=(()=>{const r=rng('space-garden:props');return (a,b)=>a+(b-a)*r();})();
const rv=(()=>{const r=rng('space-garden:village');return (a,b)=>a+(b-a)*r();})(); // 채우기(마을·지형)는 새 이름 난수 — 앞 소품 자리는 그대로
const keep=[],obstacles=[];
/* ── 땅: L×L 한 장(1.1~1.3m 칸 — 꼭짓점마다 공 위로 감기므로 촘촘히), 정점 색, 크레용 결
   색연필 얼룩: 회색 바탕 + 연보라(그늘 쪽 비탈·분화구 안·얼룩) + 크림(햇빛 쪽 +x 비탈·따뜻한 땅·얼룩), 그늘 분화구는 푸른 서리 */
const SEG=MOB?84:100,gGeo=new THREE.PlaneGeometry(L,L,SEG,SEG);gGeo.rotateX(-PI/2);
{const p=gGeo.attributes.position,uv=gGeo.attributes.uv;for(let i=0;i<p.count;i++){p.setY(i,groundY(p.getX(i),p.getZ(i)));uv.setXY(i,uv.getX(i)*34,uv.getY(i)*34);}gGeo.computeVertexNormals();
  const nr=gGeo.attributes.normal,c=new Float32Array(p.count*3),base=col('#aeacb0'),dark=col('#928d9a'),lav=col('#a088c2'),lavD=col('#7f6ba3'),cream=col('#dccdb0'),frost=col('#c4d2ec'),cold=col('#6a6c9a'),warm=col('#dcc29e'),tmp=new THREE.Color();
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);
    const n1=Math.sin(W2(7)*x+Math.sin(W2(3)*z)*2)*Math.sin(W2(6)*z-W2(2)*x),n2=Math.sin(W2(9)*z+1.7+Math.sin(W2(4)*x)*1.5)*Math.sin(W2(8)*x+.4),n3=Math.sin(W2(17)*x+W2(13)*z)*Math.sin(W2(15)*z-W2(11)*x);
    tmp.copy(base).multiplyScalar(1+n3*.035);
    const sx=nr.getX(i),sz=nr.getZ(i),face=sx*.85-sz*.25; // +x(햇빛 쪽) 비탈은 크림, 반대 비탈은 연보라
    if(face<0)tmp.lerp(lav,Math.min(.5,-face*2.6));else tmp.lerp(cream,Math.min(.4,face*2.4));
    if(n1>.35)tmp.lerp(lav,(n1-.35)*.5);if(n2>.45)tmp.lerp(cream,(n2-.45)*.6); // 색연필 얼룩
    for(const C of CRATERS){const t=dist(x,z,C.c)/C.r;if(t<1){tmp.lerp(dark,.35*(1-t*t));tmp.lerp(lavD,.45*ss(1,.45,t));}}
    {const t=dist(x,z,SHADE.c)/SHADE.r;if(t<1.05){tmp.lerp(cold,.8*ss(1.05,.6,t));const f=Math.sin(x*2.1)*Math.sin(z*1.7)+Math.sin(x*.9+z*1.3);if(t<.95&&f>.6)tmp.lerp(frost,.75);}}
    {const t=dist(x,z,WARM)/10;if(t<1)tmp.lerp(warm,.6*(1-t)*(1-t));}
    {const t=dist(x,z,VIL)/7;if(t<1)tmp.lerp(cream,.22*(1-t));} // 마을 마당은 조금 따뜻하게
    c[i*3]=tmp.r;c[i*3+1]=tmp.g;c[i*3+2]=tmp.b;}
  gGeo.setAttribute('color',new THREE.BufferAttribute(c,3));}
/* 바닥 색연필 결: 공용 크레용 결보다 한 단계 또렷하게(획이 진하고 어두운 획이 조금 더 — 2026-11-07) */
const gMat=sbMat('#ffffff',{map:(()=>{const t=canvasTex(256,crayonGround);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t;})()});gMat.vertexColors=true;
const ground=new THREE.Mesh(gGeo,gMat);ground.receiveShadow=true;root.add(ground);keep.push(ground);
/* ── 정점 색 덩어리 만들기: put(geo, 색, 자리) → 목록에 쌓았다가 한 덩어리로 */
let parts=[];
function put(geo,color,{pos=[0,0,0],rot=[0,0,0],s=[1,1,1]}={},into=parts){let g=geo.index?geo.toNonIndexed():geo;for(const k of Object.keys(g.attributes))if(!['position','normal','uv'].includes(k))g.deleteAttribute(k);
  if(!g.attributes.uv)g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
  g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...pos),new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)),new THREE.Vector3(...s)));g.computeVertexNormals();
  const n=g.attributes.position.count,cc=new Float32Array(n*3),C=col(color);for(let i=0;i<n;i++){cc[i*3]=C.r;cc[i*3+1]=C.g;cc[i*3+2]=C.b;}g.setAttribute('color',new THREE.BufferAttribute(cc,3));
  const u=g.attributes.uv;for(let i=0;i<n;i++)u.setXY(i,u.getX(i)*2,u.getY(i)*2);into.push(g);return g;}
/* 두 점 사이 막대(줄·다리·끈) */
function rod(a,b,r,color,into=parts,n=6){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A),len=d.length();
  const geo=new THREE.CylinderGeometry(r,r,len,n);geo.translate(0,len/2,0);geo.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize()));geo.translate(A.x,A.y,A.z);return put(geo,color,{},into);}
const lumpy=(r,det=0,seed=0)=>{const g=new THREE.IcosahedronGeometry(r,det),p=g.attributes.position;for(let i=0;i<p.count;i++){const k=1+(Math.sin(p.getX(i)*9.1+p.getY(i)*3.7+seed)*.5+Math.sin(p.getZ(i)*7.3+seed*.7)*.5)*.16;p.setXYZ(i,p.getX(i)*k,p.getY(i)*k,p.getZ(i)*k);}return g;};
const nearTrail=trailPts(1.2);
const clearOf=(x,z,m)=>nearTrail.every(([a,b])=>Math.hypot(wd(x-a),wd(z-b))>m)&&[SPAWN,BOBO,ROCK.c,CAVE,EXIT,DEMO_LAND,[-3.2,-15.2]].every(c=>dist(x,z,c)>m+1.2)
  &&dist(x,z,VIL)>8+m*.3&&dist(x,z,ARCH.c)>3.2&&Math.abs(wd(x))<HALF-3&&Math.abs(wd(z))<HALF-3;
const rockCols=['#aeaaab','#a19ca3','#b7b2b1','#948f99','#a9a3b4'],warmCols=['#c9ae90','#bea183','#d3b899'];
function rock(x,z,s,{solid=true,warmK=0,round=false}={}){const y=groundY(x,z),c=warmK>.4?warmCols[(rnd(0,3)|0)%3]:rockCols[(rnd(0,5)|0)%5];
  put(lumpy(.5*s,s>1.6||round?1:0,s*3),c,{pos:[x,y+.18*s,z],rot:[rnd(0,PI),rnd(0,PI),0],s:[1,rnd(.55,.85),rnd(.85,1.15)]});if(solid&&s>.7)obstacles.push({c:[x,z,.42*s]});}
// 분화구 테두리 돌
for(const C of CRATERS){const n=Math.round(C.r*2.2);for(let i=0;i<n;i++){const a=i/n*PI*2+rnd(-.2,.2),d=C.r*rnd(.98,1.18),x=C.c[0]+Math.cos(a)*d,z=C.c[1]+Math.sin(a)*d;if(!clearOf(x,z,.9))continue;rock(x,z,rnd(.35,.8),{solid:false,warmK:dist(x,z,WARM)<10?1:0});}}
// 흩어진 바위(크기 규칙: 원더룹보다 커도 됨)
for(let i=0;i<70;i++){const x=rnd(-HALF+4,HALF-4),z=rnd(-HALF+4,HALF-4);if(!clearOf(x,z,1.8))continue;const big=rnd(0,1)<.18;rock(x,z,big?rnd(1.6,3):rnd(.5,1.2),{warmK:dist(x,z,WARM)<10?1:0});}
// 채우기: 크기가 다양한 둥근 바위(언덕 기슭·길 가장자리 — 카메라 앞쪽 겹)·작은 돌무더기
const RR=(a,b)=>rv(a,b);
for(let i=0;i<46;i++){const x=RR(-HALF+4,HALF-4),z=RR(-HALF+4,HALF-4);if(!clearOf(x,z,1.5))continue;const s=[RR(.4,.7),RR(.8,1.3),RR(1.4,2.4)][i%3];
  const y=groundY(x,z);put(lumpy(.5*s,1,i),rockCols[i%5],{pos:[x,y+.2*s,z],rot:[RR(0,PI),RR(0,PI),0],s:[1,RR(.7,.95),RR(.9,1.1)]});if(s>.7)obstacles.push({c:[x,z,.42*s]});
  if(i%2)put(lumpy(.17*s,0,i+.5),rockCols[(i+2)%5],{pos:[x+.45*s,groundY(x+.45*s,z+.2)+.06,z+.2*s]});}
// 길 가장자리 작은 돌(밟아도 되는 크기 — 충돌 없음): 발자국 길 양옆으로 드문드문
nearTrail.forEach(([x,z],i)=>{if(i%5)return;const sd=(i%10?1:-1)*RR(.9,1.6),a=RR(0,PI*2),X=x+Math.cos(a)*sd,Z=z+Math.sin(a)*sd;
  if(dist(X,Z,VIL)<5||dist(X,Z,ARCH.c)<2.4||dist(X,Z,SHADE.c)<SHADE.r)return;put(lumpy(RR(.1,.22),0,i),rockCols[i%5],{pos:[X,groundY(X,Z)+.05,Z],rot:[RR(0,PI),RR(0,PI),0],s:[1,.6,1]});});
function cairn(x,z,n,s=1){let y=groundY(x,z);for(let k=0;k<n;k++){const r=(.26-.035*k)*s*RR(.9,1.1);put(lumpy(r,1,k+x),rockCols[(k+3)%5],{pos:[x+RR(-.05,.05),y+r*.62,z+RR(-.05,.05)],rot:[0,RR(0,PI),0],s:[1,.62,1]});y+=r*1.12;}}
for(let i=0;i<16;i++){const x=RR(-HALF+5,HALF-5),z=RR(-HALF+5,HALF-5);if(!clearOf(x,z,1))continue;cairn(x,z,(RR(3,6)|0),RR(.8,1.25));for(let k=0;k<3;k++)put(lumpy(RR(.1,.18),0,k+i),rockCols[k],{pos:[x+RR(-.6,.6),groundY(x,z)+.05,z+RR(-.6,.6)],s:[1,.6,1]});}
cairn(-4.6,-2.6,5,1.1);cairn(4.6,-3.4,4,1);cairn(-6.2,-11.4,4,.9); // 길목 표지(카메라 앞쪽 겹)
// 그늘 분화구: 서리 판
for(let i=0;i<14;i++){const a=rnd(0,PI*2),d=rnd(0,SHADE.r*.85),x=SHADE.c[0]+Math.cos(a)*d,z=SHADE.c[1]+Math.sin(a)*d;
  put(new THREE.CircleGeometry(rnd(.35,.8),7),'#d4def0',{pos:[x,groundY(x,z)+.02,z],rot:[-PI/2,0,rnd(0,PI)]});}
/* 빛나는 덩어리(수정·얼음 결정·전구·창문·출구 돌): 툰 + 흰 발광 → 파스텔이 스스로 빛나 보임(그리기 1번). halos = 그 자리에 은은한 빛무리(반짝이 Points에 함께) */
const glow=[],halos=[];
const iceCols=['#a9cdec','#93bde2','#c6e2f6'],pastel=['#ffb3c8','#a8d8ff','#ffe59a','#d9b8ff'];
function crystals(x,z,n,s,cols,into=glow){const y=groundY(x,z);for(let i=0;i<n;i++){const h=rnd(.35,.9)*s,a=rnd(0,PI*2),d=rnd(0,.35*s);
  put(new THREE.ConeGeometry(rnd(.07,.14)*s,h,5),cols[i%cols.length],{pos:[x+Math.cos(a)*d,y+h*.42,z+Math.sin(a)*d],rot:[rnd(-.35,.35),rnd(0,PI),rnd(-.35,.35)]},into);}}
crystals(-2.4,-14.4,7,1.2,iceCols);crystals(-3.9,-16.6,5,1,iceCols);crystals(-7.6,-13.2,6,1.1,iceCols);crystals(-6.8,-17.4,4,.9,iceCols);crystals(-1.6,-17.2,4,.8,iceCols);
[[-2.4,-14.4],[-3.9,-16.6],[-7.6,-13.2],[-6.8,-17.4],[-1.6,-17.2]].forEach(([x,z])=>halos.push({x,z,y:groundY(x,z)+.45,c:'#9fd2ff',s:1.4}));
// 분화구 안쪽 가장자리 파스텔 수정(분홍·하늘·노랑) — 그늘 분화구 말고 모든 분화구에 2~4무더기
CRATERS.forEach((C,ci)=>{if(C===SHADE)return;const n=2+(ci%3);for(let k=0;k<n;k++){const a=RR(0,PI*2),x=C.c[0]+Math.cos(a)*C.r*RR(.72,.86),z=C.c[1]+Math.sin(a)*C.r*RR(.72,.86);
  const cc=pastel[(ci+k)%4];const y=groundY(x,z);for(let i=0;i<4;i++){const h=RR(.22,.5),aa=RR(0,PI*2),d=RR(0,.18);put(new THREE.OctahedronGeometry(RR(.06,.11),0),cc,{pos:[x+Math.cos(aa)*d,y+h*.5,z+Math.sin(aa)*d],rot:[RR(-.3,.3),RR(0,PI),RR(-.3,.3)],s:[1,h/.12,1]},glow);}
  halos.push({x,z,y:y+.32,c:cc,s:1});}});
// 출구 둘레 빛나는 돌
for(let i=0;i<8;i++){const a=i/8*PI*2+PI/8;put(new THREE.OctahedronGeometry(.13,0),'#fff1b8',{pos:[EXIT[0]+Math.cos(a)*1.75,groundY(...EXIT)+.42,EXIT[1]+Math.sin(a)*1.75]},glow);}
/* ── 얼음 동굴(비밀): 분화구 남쪽 깊은 곳 — 얼음 덩이를 둥글게 쌓은 굴, 입구는 분화구 가운데(북쪽)를 봄. 따로 한 덩어리(가리면 흐려짐) */
const caveParts=[],caveBoxes=[];
{const [cx,cz]=CAVE,y=groundY(cx,cz);for(let i=0;i<10;i++){const a=PI*.75+i/9*PI*1.5,x=cx+Math.cos(a)*1.5,z=cz+Math.sin(a)*1.5;
    put(lumpy(.46,1),iceCols[i%3],{pos:[x,y+.45,z],rot:[rnd(0,PI),rnd(0,PI),0],s:[1,1.7,1]},caveParts);obstacles.push({c:[x,z,.32]});caveBoxes.push(new THREE.Box3(new THREE.Vector3(x-.5,y-.1,z-.5),new THREE.Vector3(x+.5,y+1.25,z+.5)));}
  for(let i=0;i<6;i++){const a=PI*.78+i/5*PI*1.44,x=cx+Math.cos(a)*.95,z=cz+Math.sin(a)*.95;put(lumpy(.42,1),iceCols[(i+1)%3],{pos:[x,y+1.45,z],rot:[rnd(0,PI),0,rnd(0,PI)],s:[1.2,.7,1.2]},caveParts);
    caveBoxes.push(new THREE.Box3(new THREE.Vector3(x-.55,y+1.15,z-.55),new THREE.Vector3(x+.55,y+1.75,z+.55)));}
  put(new THREE.CircleGeometry(1.25,12),'#5a6f98',{pos:[cx,y+.025,cz],rot:[-PI/2,0,0]});crystals(cx-.5,cz-.6,5,.8,iceCols);crystals(cx+.6,cz-.4,4,.7,iceCols);halos.push({x:cx,z:cz,y:y+.6,c:'#a9d8ff',s:1.6});}
function occMesh(list,boxes,name){const m=sbMat('#ffffff');m.vertexColors=true;const me=new THREE.Mesh(mergeGeometries(list),m);me.name=name;me.castShadow=me.receiveShadow=true;root.add(me);keep.push(me);
  G.occlude.add(me,1.5,2.5,{near:true,speed:6,boxes});return me;}
occMesh(caveParts,caveBoxes,'icecave');
/* ── 높은 바위(분화구 끝 — 둥실 뛰기로만): 위가 평평한 큰 바위 + 꼭대기 판. 따로 한 덩어리(가리면 흐려짐) */
const ROCK_TOP=groundY(...ROCK.c)+1.85; // 둥실 뛰기(꼭대기 약 2.7m)로 넉넉히, 보통 점프(0.8m)로는 못 오름
{const rp=[],[x,z]=ROCK.c,y=groundY(x,z);put(new THREE.CylinderGeometry(ROCK.r*.95,ROCK.r*1.18,ROCK_TOP-y+.4,7,2),'#a5a0a8',{pos:[x,(ROCK_TOP+y-.4)/2,z],rot:[0,.3,0]},rp);
  put(new THREE.CylinderGeometry(ROCK.r*1.0,ROCK.r*.95,.14,7),'#c4bfbe',{pos:[x,ROCK_TOP-.02,z],rot:[0,.3,0]},rp);
  occMesh(rp,[new THREE.Box3(new THREE.Vector3(x-ROCK.r*1.15,y-.4,z-ROCK.r*1.15),new THREE.Vector3(x+ROCK.r*1.15,ROCK_TOP,z+ROCK.r*1.15))],'highrock');
  rock(x+1.3,z+.6,.7,{solid:false});rock(x-1.1,z-.9,.6,{solid:false});}
/* ── 바위 아치(첫 미션 길 위): 길 양옆 두 기둥(쌓은 둥근 돌) + 위로 휘는 돌 다리. 기둥만 막힘, 가운데는 지나감. 따로 한 덩어리(가리면 흐려짐) */
{const ap=[],ab=[],[ax,az]=ARCH.c,[dx,dz]=ARCH.dir,px=-dz,pz=dx,N=11;
  for(let k=0;k<=N;k++){const u=k/N,th=PI*u,sx=Math.cos(th)*ARCH.half,hy=Math.sin(th)*ARCH.h,x=ax+px*sx,z=az+pz*sx,y=groundY(ax,az)+hy+.35,r=k===0||k===N?.62:.5-.08*Math.sin(th);
    put(lumpy(r,1,k),rockCols[k%5],{pos:[x,y,z],rot:[RR(0,PI),RR(0,PI),RR(0,PI)],s:[1,.95,1.1]},ap);ab.push(new THREE.Box3(new THREE.Vector3(x-r,y-r,z-r),new THREE.Vector3(x+r,y+r,z+r)));}
  [-1,1].forEach(s=>{const x=ax+px*ARCH.half*s,z=az+pz*ARCH.half*s,y=groundY(x,z);for(let k=0;k<3;k++)put(lumpy(.66-.08*k,1,k*3+s),rockCols[(k+1)%5],{pos:[x,y+.3+k*.55,z],rot:[0,RR(0,PI),0],s:[1,.8,1]},ap);
    obstacles.push({c:[x,z,.6]});ab.push(new THREE.Box3(new THREE.Vector3(x-.7,y-.2,z-.7),new THREE.Vector3(x+.7,y+1.6,z+.7)));});
  occMesh(ap,ab,'arch');}
// 출구 받침(둥근 돌판 + 둘레 돌)
{const [x,z]=EXIT,y=groundY(x,z);put(new THREE.CylinderGeometry(1.5,1.65,.18,10),'#cdc8c6',{pos:[x,y+.07,z]});for(let i=0;i<8;i++){const a=i/8*PI*2;put(lumpy(.22,0),'#d9d3cf',{pos:[x+Math.cos(a)*1.75,y+.15,z+Math.sin(a)*1.75]});}}
/* ── 보름 할아버지의 작은 마을 (원더룹 키 1.38m = 1 기준 크기) */
const gy=(x,z)=>groundY(x,z),wood='#9a6a46',woodD='#6e4630',brass='#d8a24a',paper='#f3e4c4',ink='#a8603f';
// 둥근 돌집(할아버지 집): 낮은 돌담 둥근 벽 + 동그란 지붕 + 둥근 문(마을 쪽) + 동그란 창(따뜻한 불빛) + 지붕 위 작은 별 바람개비
{const [hx,hz]=HUT,y=gy(hx,hz),face=Math.atan2(VIL[0]-hx,VIL[1]-hz);
  put(new THREE.CylinderGeometry(1.45,1.55,1.3,14,1),'#d6d0d8',{pos:[hx,y+.62,hz]});
  put(new THREE.SphereGeometry(1.62,16,8,0,PI*2,0,PI/2),'#a993c9',{pos:[hx,y+1.22,hz],s:[1,.78,1]});
  put(new THREE.TorusGeometry(1.5,.08,6,24),'#8a74ad',{pos:[hx,y+1.24,hz],rot:[PI/2,0,0]});
  const fx=Math.sin(face),fz=Math.cos(face),at=(d,h,side=0)=>[hx+fx*d+Math.cos(face)*side,y+h,hz+fz*d-Math.sin(face)*side];
  put(new THREE.CylinderGeometry(.42,.42,.08,16,1,false,0,PI),woodD,{pos:at(1.5,.62),rot:[PI/2,face+PI/2,0],s:[1,1,1]});
  put(new THREE.BoxGeometry(.84,.6,.08),wood,{pos:at(1.5,.32),rot:[0,face,0]});
  put(new THREE.CylinderGeometry(.4,.4,.06,16,1,false,0,PI),wood,{pos:at(1.53,.62),rot:[PI/2,face+PI/2,0]});
  put(new THREE.SphereGeometry(.04,6,4),brass,{pos:at(1.6,.45,.24)});
  put(new THREE.CircleGeometry(.24,12),'#ffd98a',{pos:at(1.5,.85,-.95),rot:[0,face-.55,0]},glow);put(new THREE.TorusGeometry(.25,.035,5,14),woodD,{pos:at(1.51,.85,-.95),rot:[0,face-.55,0]});
  halos.push({x:at(1.6,.85,-.95)[0],z:at(1.6,.85,-.95)[2],y:y+.85,c:'#ffd98a',s:1.3});
  rod([hx,y+2.4,hz],[hx,y+3.1,hz],.025,woodD);put(new THREE.OctahedronGeometry(.16,0),'#ffe59a',{pos:[hx,y+3.2,hz],s:[1,1,.35]},glow);
  // 문 앞 디딤돌
  for(let k=0;k<3;k++)put(new THREE.CylinderGeometry(.24,.26,.06,8),'#c7c0c6',{pos:at(2.0+k*.6,.03,(k%2?.12:-.12))});
  obstacles.push({c:[hx,hz,1.55]});}
// 작은 천문대 망원경: 둥근 나무 단 + 세 다리 + 하늘을 향한 연보라 통(놋쇠 테) + 작은 접이 의자
{const [sx,sz]=SCOPE,y=gy(sx,sz);put(new THREE.CylinderGeometry(.95,1.0,.14,12),'#b88a62',{pos:[sx,y+.07,sz]});put(new THREE.TorusGeometry(.96,.04,5,24),woodD,{pos:[sx,y+.14,sz],rot:[PI/2,0,0]});
  const top=[sx,y+1.18,sz];for(let k=0;k<3;k++){const a=k/3*PI*2+.4;rod([sx+Math.cos(a)*.55,y+.14,sz+Math.sin(a)*.55],top,.03,woodD);}
  const dir=new THREE.Vector3(-.35,.62,-.7).normalize(),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),dir);
  const tube=(r1,r2,len,off,c)=>{const g=new THREE.CylinderGeometry(r1,r2,len,12);g.translate(0,off,0);g.applyQuaternion(q);g.translate(...top);put(g,c);};
  tube(.11,.14,1.1,.15,'#b9a3dc');tube(.155,.155,.1,.66,brass);tube(.15,.15,.08,-.3,brass);tube(.07,.09,.3,-.52,'#8a74ad');tube(.04,.04,.12,-.72,brass);
  put(new THREE.SphereGeometry(.07,8,6),brass,{pos:top});
  {const g=new THREE.CircleGeometry(.13,12);g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),dir));g.translate(top[0]+dir.x*.71,top[1]+dir.y*.71,top[2]+dir.z*.71);put(g,'#cfeaff',{},glow);}
  // 접이 의자(망원경 보는 자리)
  const cx=sx+.62,cz=sz+.5;put(new THREE.BoxGeometry(.3,.04,.26),wood,{pos:[cx,y+.42,cz]});rod([cx-.12,y+.14,cz-.1],[cx+.12,y+.42,cz+.1],.018,woodD);rod([cx+.12,y+.14,cz-.1],[cx-.12,y+.42,cz+.1],.018,woodD);
  obstacles.push({c:[sx,sz,.75]});}
// 지도를 널어 말리는 빨랫줄: 기둥 둘 + 처진 줄 + 지도 셋(집게)
{const [a,b]=LINE,ya=gy(...a),yb=gy(...b),H=1.62;rod([a[0],ya,a[1]],[a[0],ya+H+.1,a[1]],.045,wood);rod([b[0],yb,b[1]],[b[0],yb+H+.1,b[1]],.045,wood);
  put(new THREE.SphereGeometry(.07,8,6),woodD,{pos:[a[0],ya+H+.14,a[1]]});put(new THREE.SphereGeometry(.07,8,6),woodD,{pos:[b[0],yb+H+.14,b[1]]});
  const pt=u=>[a[0]+(b[0]-a[0])*u,ya+(yb-ya)*u+H-Math.sin(PI*u)*.22,a[1]+(b[1]-a[1])*u];for(let k=0;k<8;k++)rod(pt(k/8),pt((k+1)/8),.012,'#efe6d6');
  const ry=Math.atan2(b[0]-a[0],b[1]-a[1])+PI/2;
  [[.24,'#f3e4c4',.04],[.5,'#f6dccb',-.05],[.76,'#e8ecd2',.06]].forEach(([u,pc,tl],k)=>{const p=pt(u),w=.5,h=.4,cx=p[0],cy=p[1]-h/2-.02,cz=p[2];
    put(new THREE.BoxGeometry(w,h,.012),pc,{pos:[cx,cy,cz],rot:[0,ry,tl]});
    const ox=Math.cos(ry)*.008,oz=-Math.sin(ry)*.008;[[-.12,.06,.3,.3],[.06,-.06,.22,-.5],[.0,.1,.16,.9]].forEach(([dx,dy,len,rz],j)=>put(new THREE.BoxGeometry(len,.014,.004),j===2?'#7fb6e8':ink,{pos:[cx+Math.sin(ry)*dx+ox,cy+dy,cz+Math.cos(ry)*dx+oz],rot:[0,ry,rz+tl]}));
    put(new THREE.SphereGeometry(.035,6,5),['#9bd46b','#d9704a','#c9a6e0'][k],{pos:[cx+Math.sin(ry)*.13+ox,cy-.05,cz+Math.cos(ry)*.13+oz]});
    [-.18,.18].forEach(dx=>put(new THREE.BoxGeometry(.03,.09,.03),'#d9a066',{pos:[cx+Math.sin(ry)*dx,p[1]-.03,cz+Math.cos(ry)*dx],rot:[0,ry,0]}));});}
// 다녀온 곳마다 꽂은 색색의 작은 깃발 핀: 마을 둘레 반원(길은 비움) + 망원경 옆 몇
{const cols=['#ff9eb3','#7fb6e8','#ffe07a','#9bd46b','#c9a6e0','#ffb86b'];let k=0;
  const pin=(x,z,h)=>{const y=gy(x,z),c=cols[k++%cols.length];rod([x,y,z],[x,y+h,z],.016,'#f2ead8');put(new THREE.SphereGeometry(.035,6,5),c,{pos:[x,y+h+.02,z]});
    const g=new THREE.BufferGeometry(),v=new Float32Array([0,0,0, .24,-.06,0, 0,-.13,0, 0,0,0, 0,-.13,0, .24,-.06,0]);g.setAttribute('position',new THREE.BufferAttribute(v,3));
    put(g,c,{pos:[x+.016,y+h-.02,z],rot:[0,RR(-PI,PI),0]});};
  for(let i=0;i<15;i++){const a=-.6+i/14*(PI*1.55),r=RR(6.6,7.6),x=VIL[0]+Math.cos(a)*r,z=VIL[1]+Math.sin(a)*r;if(nearTrail.some(([p,q])=>Math.hypot(p-x,q-z)<1.1))continue;pin(x,z,RR(.5,.75));}
  [[-2.0,5.9],[-2.3,6.3],[-1.7,6.4]].forEach(([x,z])=>pin(x,z,RR(.45,.6)));}
// 우편함: 나무 기둥 + 둥근 지붕 함(빨강) + 노란 깃발
{const [x,z]=MAIL,y=gy(x,z);rod([x,y,z],[x,y+.78,z],.045,wood);put(new THREE.BoxGeometry(.34,.24,.46),'#d4554a',{pos:[x,y+.9,z]});
  put(new THREE.CylinderGeometry(.17,.17,.46,12,1,false,0,PI),'#d4554a',{pos:[x,y+1.02,z],rot:[PI/2,0,PI/2]});put(new THREE.BoxGeometry(.3,.2,.01),'#5a2a28',{pos:[x,y+.94,z+.235]});
  rod([x+.18,y+.86,z+.05],[x+.18,y+1.18,z+.05],.014,'#5a3826');put(new THREE.BoxGeometry(.01,.1,.16),'#ffd34e',{pos:[x+.19,y+1.12,z+.12]});
  put(new THREE.BoxGeometry(.2,.03,.14),paper,{pos:[x,y+1.0,z+.25],rot:[.3,0,0]});}
// 작은 탁자와 의자 둘: 둥근 상판(0.5m) + 가운데 다리, 찻잔 둘·말아 둔 지도, 낮은 의자(앉는 높이 0.3m)
{const [x,z]=TABLE,y=gy(x,z);put(new THREE.CylinderGeometry(.46,.46,.05,16),'#c99a6e',{pos:[x,y+.52,z]});put(new THREE.CylinderGeometry(.05,.07,.5,8),woodD,{pos:[x,y+.26,z]});put(new THREE.CylinderGeometry(.24,.26,.04,12),woodD,{pos:[x,y+.02,z]});
  [[.15,.1,'#f2ead8'],[-.17,.06,'#c9e2f2']].forEach(([dx,dz,c])=>{put(new THREE.CylinderGeometry(.05,.04,.08,10),c,{pos:[x+dx,y+.59,z+dz]});put(new THREE.TorusGeometry(.025,.008,4,8),c,{pos:[x+dx+.06,y+.59,z+dz]});});
  put(new THREE.CylinderGeometry(.035,.035,.34,8),paper,{pos:[x,y+.58,z-.2],rot:[0,0,PI/2]});
  [[-.8,.25,0],[.75,-.2,PI]].forEach(([dx,dz,f])=>{const cx=x+dx,cz=z+dz,ry=Math.atan2(x-cx,z-cz),sx=Math.cos(ry),sz=-Math.sin(ry),bx=-Math.sin(ry)*.15,bz=-Math.cos(ry)*.15;
    put(new THREE.BoxGeometry(.32,.05,.3),'#c99a6e',{pos:[cx,y+.3,cz],rot:[0,ry,0]});
    [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([a,b])=>rod([cx+sx*.12*a+(-bx)*.8*b,y,cz+sz*.12*a+(-bz)*.8*b],[cx+sx*.12*a+(-bx)*.8*b,y+.3,cz+sz*.12*a+(-bz)*.8*b],.02,woodD));
    put(new THREE.BoxGeometry(.32,.32,.04),'#c99a6e',{pos:[cx+bx,y+.48,cz+bz],rot:[-.12,ry,0]});});}
// 따뜻한 노란 줄 조명: 집 지붕 끝 → 마을 기둥(꼭대기 별), 처진 전선 + 전구 14
{const [px,pz]=POLE,py=gy(px,pz);rod([px,py,pz],[px,py+2.3,pz],.05,wood);put(new THREE.OctahedronGeometry(.13,0),'#ffe59a',{pos:[px,py+2.42,pz],s:[1,1,.4]},glow);
  const A=[HUT[0]-1.1,gy(...HUT)+2.05,HUT[1]-.6],B=[px,py+2.2,pz],pt=u=>[A[0]+(B[0]-A[0])*u,A[1]+(B[1]-A[1])*u-Math.sin(PI*u)*.55,A[2]+(B[2]-A[2])*u];
  for(let k=0;k<12;k++)rod(pt(k/12),pt((k+1)/12),.01,'#5a3826');
  for(let k=1;k<15;k++){const p=pt(k/15);put(new THREE.SphereGeometry(.065,8,6),k%3?'#ffd56a':'#ffb98a',{pos:[p[0],p[1]-.09,p[2]],s:[1,1.25,1]},glow);halos.push({x:p[0],z:p[2],y:p[1]-.09,c:'#ffd98a',s:.75,lamp:1});}
  // 두 번째 줄: 기둥 → 빨랫줄 기둥 쪽은 너무 멀어 집 → 망원경 단 위로 짧게
  const C2=[SCOPE[0]+.2,gy(...SCOPE)+1.9,SCOPE[1]+.9],pt2=u=>[B[0]+(C2[0]-B[0])*u,B[1]-.05+(C2[1]-B[1]+.05)*u-Math.sin(PI*u)*.35,B[2]+(C2[2]-B[2])*u];
  rod([C2[0],gy(...SCOPE)+.14,C2[2]],[C2[0],C2[1]+.05,C2[2]],.035,wood);for(let k=0;k<6;k++)rod(pt2(k/6),pt2((k+1)/6),.01,'#5a3826');
  for(let k=1;k<6;k++){const p=pt2(k/6);put(new THREE.SphereGeometry(.06,8,6),k%2?'#ffd56a':'#ffb98a',{pos:[p[0],p[1]-.08,p[2]],s:[1,1.25,1]},glow);halos.push({x:p[0],z:p[2],y:p[1]-.08,c:'#ffd98a',s:.7,lamp:1});}}
// 구석의 떡방아 절구(숨은 재미): 나무 절구 + 기대 세운 떡메 + 접시에 하얀 떡 셋
{const [x,z]=MORTAR,y=gy(x,z);put(new THREE.CylinderGeometry(.3,.26,.24,12),wood,{pos:[x,y+.36,z]});put(new THREE.CylinderGeometry(.22,.3,.26,12),wood,{pos:[x,y+.13,z]});
  put(new THREE.TorusGeometry(.28,.035,5,16),woodD,{pos:[x,y+.48,z],rot:[PI/2,0,0]});put(new THREE.CircleGeometry(.24,14),'#f6f1e6',{pos:[x,y+.47,z],rot:[-PI/2,0,0]});
  put(new THREE.SphereGeometry(.12,10,6,0,PI*2,0,PI/2),'#fbf8f0',{pos:[x,y+.46,z],s:[1,.5,1]});
  rod([x+.42,y,z+.18],[x+.2,y+.95,z+.1],.03,woodD);{const g=new THREE.CylinderGeometry(.09,.09,.34,10);g.rotateZ(PI/2);g.rotateY(.4);g.translate(x+.18,y+1.02,z+.1);put(g,wood);}
  const px=x-.62,pz=z+.22;put(new THREE.CylinderGeometry(.2,.17,.04,14),'#e8d6ea',{pos:[px,gy(px,pz)+.04,pz]});
  [[0,0],[.09,.06],[-.06,.08]].forEach(([dx,dz],k)=>put(new THREE.SphereGeometry(.07,10,6),k===1?'#f7e0e6':'#fbf8f0',{pos:[px+dx,gy(px,pz)+.1,pz+dz],s:[1,.7,1]}));}
// 마을 돌담 몇(둥근 돌 낮게 줄지어 — 앞쪽 겹)
[[[-4.4,9.6],[-4.8,7.2]],[[8.2,5.2],[8.4,2.6]],[[2.6,12.4],[5.4,12.0]]].forEach(([a,b],w)=>{for(let k=0;k<=5;k++){const u=k/5,x=a[0]+(b[0]-a[0])*u+RR(-.1,.1),z=a[1]+(b[1]-a[1])*u+RR(-.1,.1),s=RR(.26,.36);put(lumpy(s,1,k+w*7),rockCols[(k+w)%5],{pos:[x,gy(x,z)+s*.55,z],rot:[0,RR(0,PI),0],s:[1,.75,1]});}});
const pMat=sbMat('#ffffff');pMat.vertexColors=true;
const props=new THREE.Mesh(mergeGeometries(parts),pMat);props.castShadow=props.receiveShadow=true;root.add(props);keep.push(props);parts=[];
/* 빛나는 덩어리: 툰 + 흰 발광(파스텔이 스스로 빛나 보임) */
{const m=sbMat('#ffffff',{emissive:'#ffffff',ei:.5});m.vertexColors=true;const me=new THREE.Mesh(mergeGeometries(glow),m);root.add(me);keep.push(me);}
/* ── 빛 웅덩이(땅에 붙은 은은한 빛, 더하기 섞기 — 그리기 1번): 그늘 분화구 푸른 빛·마을 줄 조명 아래 따뜻한 빛·출구 노란 빛·망원경 단 */
const dotTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.3,'rgba(255,255,255,.7)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;})();
{const pools=[[SHADE.c[0],SHADE.c[1],5.6,'#3e6aa8',.85],[CAVE[0],CAVE[1],2.4,'#5d8ed0',.9],[ (HUT[0]+POLE[0])/2,(HUT[1]+POLE[1])/2+.4,4.8,'#8a5a1e',.9],[EXIT[0],EXIT[1],2.8,'#8a7420',.9],[SCOPE[0]+.2,SCOPE[1]+.9,1.6,'#7a4e18',.7]];
  const gs=pools.map(([x,z,r,c,k])=>{const g=new THREE.PlaneGeometry(2*r,2*r,8,8);g.rotateX(-PI/2);const p=g.attributes.position,cc=new Float32Array(p.count*3),C=col(c).multiplyScalar(k);
    for(let i=0;i<p.count;i++){const X=p.getX(i)+x,Z=p.getZ(i)+z;p.setXYZ(i,X,groundY(X,Z)+.04,Z);cc[i*3]=C.r;cc[i*3+1]=C.g;cc[i*3+2]=C.b;}g.setAttribute('color',new THREE.BufferAttribute(cc,3));return g;});
  const m=new THREE.MeshBasicMaterial({map:dotTex,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3});
  const me=new THREE.Mesh(mergeGeometries(gs),m);me.renderOrder=1;root.add(me);keep.push(me);}
/* ── 발자국: 보름 할아버지의 오래된 발자국 길(토끼 발 — 긴 타원 둘이 나란히, 바닥보다 또렷하게 진한 연보라 회색) + 원더룹 발자국(걸은 만큼 계속 남음, 최대 개수를 넘치면 가장 오래된 것부터 아주 천천히 흐려짐) */
const printGeo=new THREE.CircleGeometry(1,10);printGeo.rotateX(-PI/2);
const prMat=sbMat('#ffffff');prMat.polygonOffset=true;prMat.polygonOffsetFactor=-2;prMat.polygonOffsetUnits=-2;
const old=trailPts(.7),OLDN=old.length*2,oldIM=new THREE.InstancedMesh(printGeo,prMat,OLDN);
{const m=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),c=col('#6c6479');let k=0;
  old.forEach(([x,z],i)=>{const [nx,nz]=old[Math.min(old.length-1,i+1)],[px,pz]=old[Math.max(0,i-1)],a=Math.atan2(nx-px,nz-pz);
    [-1,1].forEach(s=>{const ox=Math.cos(a)*s*.095,oz=-Math.sin(a)*s*.095,X=x+ox,Z=z+oz;e.set(0,a,0);q.setFromEuler(e);
      m.compose(new THREE.Vector3(X,groundY(X,Z)+.015,Z),q,new THREE.Vector3(.068,1,.18));oldIM.setMatrixAt(k,m);oldIM.setColorAt(k,c.clone().multiplyScalar(.94+((i*7+s)%5)*.025));k++;});});}
oldIM.receiveShadow=true;root.add(oldIM);keep.push(oldIM);
const MAXP=MOB?160:320,myIM=new THREE.InstancedMesh(printGeo,prMat,MAXP);myIM.count=0;myIM.receiveShadow=true;root.add(myIM);keep.push(myIM);
const fp={head:0,n:0,last:null,side:1,tot:0,dark:col('#8a8590'),fade:col('#b9b6b7')};
{const c=new THREE.Color();for(let i=0;i<MAXP;i++)myIM.setColorAt(i,c.copy(fp.dark));}
function stepPrint(x,z,a){const s=fp.side;fp.side=-s;const ox=Math.cos(a)*s*.1,oz=-Math.sin(a)*s*.1,X=x+ox,Z=z+oz;
  const m=new THREE.Matrix4().compose(new THREE.Vector3(X,groundY(X,Z)+.014,Z),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,a,0)),new THREE.Vector3(.075,1,.13));
  myIM.setMatrixAt(fp.head,m);fp.head=(fp.head+1)%MAXP;fp.n=Math.min(MAXP,fp.n+1);myIM.count=fp.n;fp.tot++;myIM.instanceMatrix.needsUpdate=true;
  // 오래된 순서(0 = 방금): 개수의 60%를 넘은 것부터 끝까지 바닥색 쪽으로 천천히
  const c=new THREE.Color();for(let i=0;i<fp.n;i++){const rank=(fp.head-1-i+MAXP)%MAXP,f=fp.n<MAXP?0:ss(.6*MAXP,MAXP,rank);myIM.setColorAt(i,c.copy(fp.dark).lerp(fp.fade,f*.92));}
  myIM.instanceColor.needsUpdate=true;}
/* ── 반짝이(한 번에 — 그리기 1번): 그늘 분화구 서리(푸른 흰빛) · 햇빛 쪽 열기 일렁임(따뜻한 크림, 천천히 오름) · 얼음 동굴 안 · 수정·전구 빛무리(halos — 은은히 숨쉼)
   · 햇빛에 반짝이며 떠다니는 먼지 알갱이(원더룹 둘레 상자 안 — 원더룹을 따라 이어짐, 해 쪽에서 볼 때 반짝) */
const NF=MOB?26:44,NH=MOB?22:40,NC=MOB?10:16,NHL=halos.length,ND=MOB?30:56,NS=NF+NH+NC+NHL+ND;
const sp={pos:new Float32Array(NS*3),col:new Float32Array(NS*3),seed:[]};
for(let i=0;i<NS;i++){let x,z,kind,y0=0,c=null,s=1;if(i<NF){const a=rnd(0,PI*2),d=rnd(0,SHADE.r*.9);x=SHADE.c[0]+Math.cos(a)*d;z=SHADE.c[1]+Math.sin(a)*d;kind=0;}
  else if(i<NF+NH){const a=rnd(0,PI*2),d=rnd(0,8);x=WARM[0]+Math.cos(a)*d;z=WARM[1]+Math.sin(a)*d;kind=1;}else if(i<NF+NH+NC){const a=rnd(0,PI*2),d=rnd(0,1.1);x=CAVE[0]+Math.cos(a)*d;z=CAVE[1]+Math.sin(a)*d;kind=2;}
  else if(i<NF+NH+NC+NHL){const h=halos[i-NF-NH-NC];x=h.x;z=h.z;y0=h.y;c=col(h.c);s=h.s;kind=h.lamp?4:3;}
  else{x=RR(-9,9);z=RR(-9,9);y0=RR(.25,2.6);kind=5;}
  sp.seed.push({x,z,kind,ph:(kind===5?RR(0,10):rnd(0,10)),sp:(kind===5?RR(.6,1.4):rnd(.6,1.4)),y0:kind>=3?y0:groundY(x,z),c,s});}
const spGeo=new THREE.BufferGeometry();spGeo.setAttribute('position',new THREE.BufferAttribute(sp.pos,3));spGeo.setAttribute('color',new THREE.BufferAttribute(sp.col,3));
const spMat=new THREE.PointsMaterial({map:dotTex,size:.22,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
/* 빛무리는 반짝이보다 크게 — 점마다 크기(셰이더 조각: size 속성) */
{const sz=new Float32Array(NS);for(let i=0;i<NS;i++){const s=sp.seed[i];sz[i]=s.kind===3?.9*s.s:s.kind===4?.62*s.s:s.kind===5?.12:1;}spGeo.setAttribute('psize',new THREE.BufferAttribute(sz,1));
  spMat.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('uniform float size;','uniform float size;\nattribute float psize;').replace('gl_PointSize = size;','gl_PointSize = size * psize;');};spMat.customProgramCacheKey=()=>'wl-psize';}
const sparks=new THREE.Points(spGeo,spMat);sparks.frustumCulled=false;root.add(sparks);keep.push(sparks);
const _sd=new THREE.Vector3();
function tickSparks(t,P,cam){const cF=col('#cfe8ff'),cH=col('#ffd9a0'),cC=col('#a9d8ff'),cD=col('#fff0cf');
  // 먼지는 해 쪽(하늘 그림판의 해 방향)을 볼 때 더 반짝 — 역광의 먼지
  let sunK=1;if(cam){cam.getWorldDirection(_sd);sunK=.55+.45*Math.max(0,_sd.dot(sunView));}
  for(let i=0;i<NS;i++){const s=sp.seed[i];let x=s.x,y,z=s.z,k,c;
  if(s.kind===1){const u=((t*.25*s.sp+s.ph)%1);y=s.y0+.2+u*2.2;k=Math.sin(u*PI)*.55;c=cH;x+=Math.sin(t*1.7+s.ph)*.12;}
  else if(s.kind===3||s.kind===4){y=s.y0;k=s.kind===4?.5+.08*Math.sin(t*3+s.ph):.42+.2*Math.sin(t*1.3*s.sp+s.ph*6);c=s.c;}
  else if(s.kind===5){const bx=P?P.x:0,bz=P?P.z:0;x=bx+(((s.x+Math.sin(t*.13*s.sp+s.ph)*1.4-bx+9)%18+18)%18)-9;z=bz+(((s.z+Math.cos(t*.11*s.sp+s.ph)*1.4-bz+9)%18+18)%18)-9;
    y=groundY(x,z)+s.y0+Math.sin(t*.4*s.sp+s.ph)*.3;const w=Math.sin(t*1.6*s.sp+s.ph*5);k=(.22+.78*Math.max(0,w)**4)*.75*sunK;c=cD;}
  else{y=s.y0+(s.kind===2?.4+((s.ph*3)%1.2):.12+(s.ph%.5));const w=Math.sin(t*2.3*s.sp+s.ph*6);k=Math.max(0,w)**6*(s.kind===2?1:.9);c=s.kind===2?cC:cF;}
  sp.pos[i*3]=x;sp.pos[i*3+1]=y;sp.pos[i*3+2]=z;sp.col[i*3]=c.r*k;sp.col[i*3+1]=c.g*k;sp.col[i*3+2]=c.b*k;}
  spGeo.attributes.position.needsUpdate=true;spGeo.attributes.color.needsUpdate=true;}
/* ── 보름 할아버지(달토끼, 키 1.38m = 원더룹과 같음): 정점 색 덩어리 다섯(몸·머리·두 팔·펼친 지도) — 그리기 5번 */
const bobo=makeBobo();bobo.root.position.set(BOBO[0],groundY(...BOBO),BOBO[1]);bobo.root.rotation.y=Math.atan2(SPAWN[0]-BOBO[0],SPAWN[1]-BOBO[1]);root.add(bobo.root);keep.push(bobo.root);
const boboOb={c:[BOBO[0],BOBO[1],.38]};obstacles.push(boboOb);
/* ── 아기 토끼 이웃 셋(키 0.65 = 약 0.9m): 마을 둘레를 둥실둥실 뛰어다님(낮은 중력 — 한 번에 1.2~2.2m, 0.55m 높이, 1.1초), 원더룹이 2.4m 안이면 멈춰 바라봄, 가까이 가면 한마디 */
const BUN=[{id:'kongkong',name:'콩콩',fur:'#d8d8e0',scarf:'#ff9eb3',way:[[-.6,4.2],[1.0,1.8],[3.2,1.6],[2.6,3.4]],line:'할아버지 지도에 우리 집도 있어!'},
  {id:'mongsil',name:'몽실',fur:'#ece4d8',scarf:'#9bd46b',way:[[4.6,8.0],[6.0,9.6],[4.2,11.0],[2.8,9.6]],line:'여기선 톡 뛰면 한참 동안 떠 있어. 같이 뛰어 볼래?'},
  {id:'bosul',name:'보슬',fur:'#cdc6dc',scarf:'#7fb6e8',way:[[-3.4,7.2],[-1.0,6.0],[-2.4,3.0],[-4.4,4.4]],line:'할아버지 망원경으로 보면 목성 줄무늬가 다 보여!'}];
const bunBlob=blobMany(BUN.length+1);if(bunBlob){bunBlob.frustumCulled=false;root.add(bunBlob);keep.push(bunBlob);}
const bunnies=BUN.map((b,i)=>{const m=makeBunny(b.fur,b.scarf);const [x,z]=b.way[0];m.root.position.set(x,groundY(x,z),z);root.add(m.root);keep.push(m.root);
  const st={i:0,t:0,wait:RR(.5,2.5),from:[x,z],to:null,ry:0};
  G.dialog.npc({id:'bun-'+b.id,name:'아기 토끼 '+b.name,root:m.root,bubbleY:.92,talkR:2.0,lines:[b.line]});return {...b,m,st};});
function tickBunnies(dt,t,P){bunnies.forEach((b,i)=>{const s=b.st,r=b.m.root,near=P&&dist(P.x,P.z,[r.position.x,r.position.z])<2.4;
  if(!s.to){if(near){const a=Math.atan2(wd(P.x-r.position.x),wd(P.z-r.position.z));s.ry+=Math.atan2(Math.sin(a-s.ry),Math.cos(a-s.ry))*Math.min(1,dt*4);}
    else{s.wait-=dt;if(s.wait<0){s.i=(s.i+1)%b.way.length;const w=b.way[s.i],dx=w[0]-s.from[0],dz=w[1]-s.from[1],d=Math.hypot(dx,dz),n=Math.max(1,Math.ceil(d/2.1));
      s.to=[s.from[0]+dx/n,s.from[1]+dz/n];s.goal=w;s.t=0;s.ry=Math.atan2(dx,dz);}}
    r.position.set(s.from[0],groundY(...s.from)+Math.abs(Math.sin(t*2.2+i))*.02,s.from[1]);b.m.squash(0,t);}
  else{s.t+=dt;const u=Math.min(1,s.t/1.1),x=s.from[0]+(s.to[0]-s.from[0])*u,z=s.from[1]+(s.to[1]-s.from[1])*u;r.position.set(x,groundY(x,z)+Math.sin(u*PI)*.55,z);b.m.squash(u,t);
    if(u>=1){s.from=s.to;const g=s.goal,rem=Math.hypot(g[0]-s.from[0],g[1]-s.from[1]);if(rem>.2&&!near){const dx=g[0]-s.from[0],dz=g[1]-s.from[1],n=Math.max(1,Math.ceil(rem/2.1));s.to=[s.from[0]+dx/n,s.from[1]+dz/n];s.t=0;}else{s.to=null;s.wait=RR(1.2,3.4);}}}
  r.rotation.y=s.ry;if(bunBlob)bunBlob.set(i,r.position.x,groundY(r.position.x,r.position.z),r.position.z,.32);});
  if(bunBlob)bunBlob.set(BUN.length,bobo.root.position.x,groundY(bobo.root.position.x,bobo.root.position.z),bobo.root.position.z,.42);}
/* ── 하늘: 남보라 우주(공기가 없어 낮에도 까맣고 별) + 은하수, 하늘 그림판(anchor — 카메라를 늦게 따라오며 늘 화면에): 해·토성·큰 목성·성운·은하수 띠·별똥별 */
const key={top:'#151331',horizon:'#2b2560',hemi:'#c4c6e6',ground:'#56506e',hemiI:.52,sun:'#ffe8c4',sunI:.95,sunDir:[-6,-3.6,-9],fill:.24,fog:'#2e2a5c',fogNear:70,fogFar:150,stars:0,milky:1.1}; // 별은 아래 그림판 별(점 별·깜빡임·네 갈래 반짝이)이 맡는다 — 공용 하늘 별·첫별은 끔
const SK=G.sky.sky({parent:root,keys:[key,key,key],t:0,nStars:MOB?220:340,starSize:3,space:true});
const skyW=new THREE.Group();skyW.name='space-sky-world';root.add(skyW); // 원더룹을 따라다니는 세계 고정 하늘(낮은 별·오로라)
const anchor=new THREE.Group();anchor.name='space-sky-anchor';root.add(anchor); // 하늘 그림판(카메라 자리 + 늦게 따라오는 방향)
const D=90,aq=new THREE.Quaternion();let aqOn=false;
const bill=(tex,{op=1,add=false,order=-1,w=1,h=1}={})=>{const m=new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,depthTest:true,fog:false,opacity:op,blending:add?THREE.AdditiveBlending:THREE.NormalBlending});m.userData.noBend=true;
  const me=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);me.renderOrder=order;me.frustumCulled=false;me.userData.noMerge=true;anchor.add(me);return me;};
const sunM=bill(canvasTex(256,sunArt),{order:-4}); // 크림빛 해(손그림 — 고르지 않은 가장자리·색연필 빗금) + 살구빛 빛무리
const jup=bill(canvasTex(512,jupiterArt),{order:-5});
const sat=bill(canvasTex(256,saturnArt),{order:-5});
const neb=bill(canvasTex(512,nebulaArt),{add:true,order:-7,op:.8});
const milkyB=bill(canvasTex(512,milkyArt),{add:true,order:-7,op:.75,w:4,h:1});
/* 하늘 바탕 종이 결(아주 옅게): 그림판 뒤쪽 큰 판 — 화면의 약 4배(카메라를 빨리 돌려도 끝이 안 보이게), 밝은 섬유 + 어두운 티끌 */
const grain=(()=>{const t=canvasTex(256,paperArt);t.wrapS=t.wrapT=THREE.RepeatWrapping;const m=bill(t,{order:-9,op:MOB?.32:.28});m.userData.paper=true;return m;})();
/* 별(그림판 — 그리기 1번): 크기가 다른 점 별을 많이, 흰색 위주 + 연노랑·분홍·하늘, 별마다 다른 박자로 천천히 깜빡(셰이더 — 매 프레임 자바스크립트 일 없음).
   카메라 앞쪽 넓게(좌우 ±95°, 아래 −20°~위 70°) — 그림판이 늦게 따라와도 비지 않게 */
const STAR_N=MOB?2700:5400;
const starU={uT:{value:0},uPR:{value:Math.min(window.devicePixelRatio||1,MOB?1.25:2)}};
const stars=(()=>{const pos=new Float32Array(STAR_N*3),cc=new Float32Array(STAR_N*3),sz=new Float32Array(STAR_N),ph=new Float32Array(STAR_N*2),c=new THREE.Color();
  const sr=(()=>{const r=rng('space-garden:stars');return (a,b)=>a+(b-a)*r();})();
  const cols=['#ffffff','#ffffff','#ffffff','#fdfcf6','#fff2b8','#ffd0e0','#cfe6ff'];
  for(let i=0;i<STAR_N;i++){const az=sr(-1.66,1.66),el=Math.asin(sr(Math.sin(-.35),Math.sin(1.22)));pos.set([Math.sin(az)*Math.cos(el)*D*.99,Math.sin(el)*D*.99,-Math.cos(az)*Math.cos(el)*D*.99],i*3);
    c.set(cols[(sr(0,cols.length))|0]);cc.set([c.r,c.g,c.b],i*3);const q=sr(0,1);sz[i]=q<.6?sr(2,3):q<.88?sr(3.1,4.4):q<.98?sr(4.5,6):sr(6.2,8);ph.set([sr(0,PI*2),sr(.35,1.6)],i*2);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(cc,3));geo.setAttribute('psize',new THREE.BufferAttribute(sz,1));geo.setAttribute('tw',new THREE.BufferAttribute(ph,2));
  const m=new THREE.ShaderMaterial({uniforms:starU,transparent:true,depthWrite:false,fog:false,
    vertexShader:'uniform float uT,uPR;attribute float psize;attribute vec2 tw;attribute vec3 color;varying vec3 vC;varying float vA;void main(){float w=.5+.5*sin(uT*tw.y+tw.x);float big=step(3.2,psize);vA=mix(.35,1.,w*w)*(.8+.2*big);vC=color;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=psize*uPR*(.82+.3*w);}',
    fragmentShader:'varying vec3 vC;varying float vA;void main(){vec2 d=gl_PointCoord-.5;float r=length(d)*2.;float a=1.-smoothstep(.55,1.,r);if(a<.01)discard;gl_FragColor=vec4(vC*(1.+.35*smoothstep(.45,0.,r)),a*vA);}'});
  m.userData.noBend=true;const pts=new THREE.Points(geo,m);pts.frustumCulled=false;pts.renderOrder=-8;pts.userData.noMerge=true;anchor.add(pts);return pts;})();
/* 노란 네 갈래 반짝이(로딩 화면 반짝이와 같은 모양 ✦): 여기저기서 톡 반짝였다 사라짐 — 점마다 3~8초 주기, 반짝일 때마다 자리를 조금 옮김(셰이더 해시), 그리기 1번 */
const twinkles=(()=>{const n=MOB?10:18,pos=new Float32Array(n*3),pr=new Float32Array(n*3);const sr=(()=>{const r=rng('space-garden:twinkle');return (a,b)=>a+(b-a)*r();})();
  for(let i=0;i<n;i++){const az=sr(-.7,.7),el=sr(.12,.62);pos.set([Math.sin(az)*Math.cos(el)*D*.97,Math.sin(el)*D*.97,-Math.cos(az)*Math.cos(el)*D*.97],i*3);pr.set([sr(0,8),sr(3,8),sr(18,30)],i*3);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('tp',new THREE.BufferAttribute(pr,3));
  const tex=canvasTex(64,sparkArt);
  const m=new THREE.ShaderMaterial({uniforms:{uT:starU.uT,uPR:starU.uPR,uMap:{value:tex},uAsp:{value:1}},transparent:true,depthWrite:false,fog:false,blending:THREE.AdditiveBlending,
    vertexShader:'uniform float uT,uPR;attribute vec3 tp;varying float vK;float h(float n){return fract(sin(n*12.9898)*43758.5453);}void main(){float cyc=(uT+tp.x)/tp.y,ci=floor(cyc),u=fract(cyc)*tp.y;float k=u<.7?sin(3.14159*u/.7):0.;vK=k;'+
      'vec3 p=position+vec3((h(ci+tp.x)-.5)*30.,(h(ci*1.7+tp.x*3.1)-.5)*16.,0.);vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=tp.z*uPR*k;}',
    fragmentShader:'uniform sampler2D uMap;varying float vK;void main(){vec4 c=texture2D(uMap,gl_PointCoord);if(c.a<.01)discard;gl_FragColor=vec4(c.rgb*c.a*vK,1.);}'});
  m.userData.noBend=true;const pts=new THREE.Points(geo,m);pts.frustumCulled=false;pts.renderOrder=-3;pts.userData.noMerge=true;anchor.add(pts);return pts;})();
/* 그림판 자리(화면 좌표 ndc, 크기 = 화면 짧은 쪽 비율) — 세로 화면은 좁아서 가운데로 모음 */
const LAYOUT={sun:[sunM,-.76,.8,.3,-.5,.86,.42],sat:[sat,-.12,.8,.2,.05,.9,.3],jup:[jup,.98,.5,1.05,1.05,.66,.78],neb:[neb,-.35,.62,1.3,-.2,.66,1.4],milky:[milkyB,.05,.7,1.0,0,.72,1.0]};
const sunView=new THREE.Vector3(); // 해 방향(세계, 카메라에서) — 먼지 역광
function tickAnchor(dt,cam){if(!cam)return;anchor.position.copy(cam.position);if(!aqOn){aq.copy(cam.quaternion);aqOn=true;}else aq.slerp(cam.quaternion,1-Math.exp(-dt*1.4));anchor.quaternion.copy(aq);
  const tv=Math.tan(cam.fov*PI/360),th=tv*cam.aspect,u=Math.min(tv,th),port=cam.aspect<1;
  for(const k in LAYOUT){const [m,x0,y0,s0,x1,y1,s1]=LAYOUT[k],x=port?x1:x0,y=port?y1:y0,s=port?s1:s0;m.position.set(x*th*D,y*tv*D,-D);m.quaternion.identity();
    const sz=s*2*u*D;if(k==='milky'){m.scale.set(sz*1.0,sz*1.0,1);m.rotation.z=port?-.55:-.22;}else m.scale.set(sz,sz,1);}
  {const gs=2*D*.995*Math.max(tv,th)*4.2;grain.position.set(0,0,-D*1.0);grain.scale.set(gs,gs,1);grain.material.map.repeat.set(9,9);}
  sunView.copy(sunM.position).normalize().applyQuaternion(aq);}
const NEB0=.62;
// 날씨 그림: 별똥별(그림판 위쪽 하늘 — 유성우는 자주, 다른 날씨도 가끔 느리게 하나), 오로라(세계 고정)
const meteors=(()=>{const n=7,pos=new Float32Array(n*6),cc=new Float32Array(n*6),geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(cc,3));
  const m=new THREE.LineBasicMaterial({vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false});m.userData.noBend=true;const ls=new THREE.LineSegments(geo,m);ls.frustumCulled=false;ls.renderOrder=-3;ls.userData.noMerge=true;anchor.add(ls);
  const M=[];for(let i=0;i<n;i++)M.push({t:9,life:1,x:0,y:0,vx:0,vy:0,len:.2});return {ls,M,pos,cc,geo,amb:4};})();
const aurora=(()=>{const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false,uniforms:{uT:{value:0},uA:{value:0}},
    vertexShader:'varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'uniform float uT,uA;varying vec2 vU;void main(){float x=vU.x*18.;float w=.55+.45*sin(x+uT*.6)*sin(x*.37-uT*.4);float band=smoothstep(0.,.25,vU.y)*(1.-smoothstep(.35,1.,vU.y));float stripe=.6+.4*sin(x*3.1+sin(x*.7+uT)*2.);vec3 c=mix(vec3(.35,1.,.62),vec3(.95,.5,.9),smoothstep(.3,.95,vU.y));gl_FragColor=vec4(c*band*w*stripe*uA,1.);}'});
  m.userData.noBend=true;const g=new THREE.CylinderGeometry(80,80,34,64,1,true,-PI*.15,PI*.8);const me=new THREE.Mesh(g,m);me.position.y=10;me.frustumCulled=false;me.renderOrder=-1;me.userData.noMerge=true;skyW.add(me);return {me,m};})();
/* ── 빛: 따뜻한 햇빛(해 — 08이 구역 해 방향으로) + 연보라 보조광(구역 빛, 그림판 오른쪽 아래 앞에서) + 원더룹 빛 테두리(구역 정보 rim) */
const ZSUN={dir:new THREE.Vector3(-6,-3.6,-9).normalize(),shadow:14,follow:true};
const lav=new THREE.DirectionalLight(col('#b49be0'),0);lav.castShadow=false;root.add(lav);root.add(lav.target);
const _ld=new THREE.Vector3(),_lf=new THREE.Vector3();
function light(env,dt){/* 해: 그림판 기준 왼쪽 뒤 위에서(원더룹 등·땅이 밝게) — 그림판이 늦게 따라오니 그림자도 천천히 돎. 연보라: 오른쪽 앞 아래에서 */
  if(aqOn){_lf.set(-1,1.15,.75).normalize().applyQuaternion(aq);_lf.y=Math.max(.45,_lf.y);ZSUN.dir.copy(_lf.normalize()).negate();
    const W=U0();const P=W?W.position:new THREE.Vector3();_ld.set(1,-.25,-.8).normalize().applyQuaternion(aq);lav.position.set(P.x-_ld.x*10,P.y+4,P.z-_ld.z*10);lav.target.position.set(P.x,P.y,P.z);}
  lav.intensity=.34;}
/* ── 놓아두기·충돌 */
const areas={planet:{bounds:[-HALF-4,HALF+4,-HALF-4,HALF+4],obstacles,camera:{target:[0,1,0],dist:9,polar:[.45,1.35],azimuth:null,start:[2.6,.95],minDist:3,maxDist:30}}};
const platforms=[{c:[ROCK.c[0],ROCK.c[1],ROCK.r*.98],top:ROCK_TOP}];
/* ── 이야기 진행 */
const F=G.state.flags,HAVE='have:'+WID+':necklace',K={demo:'space:demo',rock:'space:rock',clear:'clear:space-garden',cave:'secret:'+WID+':icecave'};
G.profile.setup({world:WID,cards:{bobo:{name:'보름 할아버지',intro:'발자국으로 지도를 그리는 달토끼',likes:'아직 아무도 안 가 본 빈칸',quote:'여긴 바람이 없어서, 걸은 길이 아주 오래오래 남는단다.',bg:'#dfe1f2',portrait:{side:.5,lift:.1}}}});
const st={said:false,warm:false,cold:false,start:false,hop:null,lastQ:'',culled:false,demoSaid:false,cam:0};
if(F[K.demo])placeBobo(DEMO_LAND);
G.dialog.npc({id:'bobo',name:'보름 할아버지',root:bobo.root,bubbleY:1.62,talkR:2.4,
  repeatLine:'바람이 없어서 발자국이 오래오래 남는단다. 네 발자국도 그대로 있을 게야.',
  onDone:()=>G.profile.meet('bobo',bobo.root),
  variants:[
    {when:()=>!F[HAVE],lines:['어서 오렴, 작은 탐험가. 나는 이 회색 정원에 사는 보름 할아버지란다.','여긴 공기가 거의 없어서, 숨방울 하나는 꼭 챙겨야 한단다.','내 발자국을 따라가 보렴. 다 그대로 남아 있을 게야.']},
    {when:()=>F[HAVE]&&!F[K.rock],lines:['숨방울이 잘 어울리는구나!','자, 발끝에 힘을 주고 톡! 여긴 중력이 약해서 내려오기까지 한참 걸린단다.','저 높은 바위에 올라 보렴. 거기서 보면 지도의 첫 빈칸이 채워질 게야.']},
    {when:()=>F[K.rock]&&!F[K.clear],lines:['첫 빈칸을 채웠구나! 내 지도에 네 발자국도 그려 두마.','행성 끝, 빛기둥이 선 곳이 출구란다. 저 하늘의 큰 행성들이 다음 목적지를 알려 줄 게야.']},
    {when:()=>!!F[K.clear],lines:['또 오렴. 네 발자국은 여기 오래오래 남아 있을 테니.']}]});
function placeBobo(at){bobo.root.position.set(at[0],groundY(...at),at[1]);bobo.root.rotation.y=Math.atan2(ROCK.c[0]-at[0],ROCK.c[1]-at[1])+.9;boboOb.c[0]=at[0];boboOb.c[1]=at[1];}
function quest(q,goal){if(q!==st.lastQ){st.lastQ=q;G.ui.setQuest(q);}G.goal.set(goal||null);}
/* 둥실 뛰기 시범: 할아버지가 바위 쪽으로 한 번 크게 둥실(약 9m, 꼭대기 3.2m, 2.6초). 카메라는 원더룹 등 뒤 위에서 원더룹과 할아버지를 함께 — 할아버지를 따라 고개를 돌림(view.hold, 그려지는 자리 bentPos) */
function hopDemo(){const W=U0();st.hop={t:0,from:[bobo.root.position.x,bobo.root.position.z],y0:bobo.root.position.y,to:DEMO_LAND};G.state.setFlag(K.demo,true);
  const P=W.position,mid=[(st.hop.from[0]+DEMO_LAND[0])/2,(st.hop.from[1]+DEMO_LAND[1])/2],dx=wd(mid[0]-P.x),dz=wd(mid[1]-P.z),dl=Math.hypot(dx,dz)||1,ux=dx/dl,uz=dz/dl;
  const base={x:P.x-ux*5.5+uz*1.4,z:P.z-uz*5.5-ux*1.4};let tEnd=0;
  G.view.hold(()=>{const cam=G.view.camera,k=cam&&cam.aspect<1?1.7:1,b=bobo.root.position,Wp=W.position;
    if(!st.hop){tEnd+=1/60;if(tEnd>1.2)return null;}
    const at=bentPos({x:Wp.x*.35+b.x*.65,y:Math.max(Wp.y,b.y)*.65+1.1,z:Wp.z*.35+b.z*.65}),from=bentPos({x:Wp.x+(base.x-Wp.x)*k,y:Wp.y+3.4*k,z:Wp.z+(base.z-Wp.z)*k});
    return {at:[at.x,at.y,at.z],from:[from.x,from.y,from.z]};});}
let fpLast=null;
const U0=()=>G.view.camera&&G.mission.hero&&G.mission.hero();
function update(dt,t,env){const WL=U0();const cam=G.view.camera;tickAnchor(dt,cam);if(!WL)return;const U=WL.userData,P=WL.position;
  if(!st.culled){st.culled=true;root.traverse(o=>{o.frustumCulled=false;});U.wrapShift=wrapShift;}
  if(!F[K.cave]&&dist(P.x,P.z,CAVE)<1.5&&!G.ui.cardShown())caveSecret(); // 비밀: 얼음 동굴(놓쳐도 진행 영향 없음)
  bobo.tick(dt,t,st.hop);tickSparks(t,P,cam);tickBunnies(dt,t,P);
  skyW.position.set(P.x,0,P.z);tickWeather(dt,t,env&&env.weather);
  // 발자국: 땅을 밟고 걸을 때 0.42m마다 번갈아
  {const V=U.vert;if(V&&!V.air&&!U.riding){if(!fpLast)fpLast={x:P.x,z:P.z};const dx=wd(P.x-fpLast.x),dz=wd(P.z-fpLast.z),d=Math.hypot(dx,dz);if(d>.42&&d<3){stepPrint(P.x,P.z,Math.atan2(dx,dz));fpLast={x:P.x,z:P.z};}else if(d>=3)fpLast={x:P.x,z:P.z};}else fpLast=null;}
  if(!G.core||G.front.frontShown&&G.front.frontShown())return;
  /* 처음 조작을 넘겨받을 때 한 번: 카메라를 조금 낮춰 지평선이 화면 위쪽 3분의 1쯤(하늘 그림판이 원더룹 뒤로 보이게) — 1.2초에 걸쳐, 플레이어가 만지면 그만 */
  {const C=G.controls.input.cam;if(st.cam<1.2&&C&&C.on&&C.ready&&!G.view.aim&&!G.view.req){if(st.cam===0)st.camUser=C.user;if(C.user!==st.camUser)st.cam=9;else{st.cam+=dt;const goal=cam.aspect<1?.58:.5;C.pitch+=(goal-C.pitch)*Math.min(1,dt*3);}}}
  // 할아버지 둥실 건너뛰기(시범)
  if(st.hop){const h=st.hop;h.t+=dt;const T=2.6,u=Math.min(1,h.t/T),x=h.from[0]+(h.to[0]-h.from[0])*u,z=h.from[1]+(h.to[1]-h.from[1])*u,y0=h.y0+(groundY(...h.to)-h.y0)*u;
    bobo.root.position.set(x,y0+Math.sin(u*PI)*3.2,z);bobo.root.rotation.y=Math.atan2(h.to[0]-h.from[0],h.to[1]-h.from[1]);boboOb.c[0]=x;boboOb.c[1]=z;
    if(u>=1){st.hop=null;placeBobo(DEMO_LAND);G.sound.sfx('land');if(!st.demoSaid){st.demoSaid=true;setTimeout(()=>G.dialog.say('보름 할아버지','톡! 하고 뛰면 둥실 떠오른단다. 저 높은 바위 꼭대기까지 충분해.',4),500);}}}
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
function tickWeather(dt,t,w){const M=meteors,cam=G.view.camera;
  /* 별똥별: 그림판 좌표(화면 위쪽 하늘)에서 비스듬히 쉭 — 머리 반짝, 꼬리 어둡게. 유성우 날씨에만 */
  const tv=cam?Math.tan(cam.fov*PI/360):.27,th=cam?tv*cam.aspect:.48;
  const spawn=(slow)=>{const m=M.M.find(q=>q.t>=q.life);if(!m)return;m.t=0;m.life=slow?2.6:1.1;const dir=Math.random()<.5?1:-1;
    m.x=(Math.random()*1.4-.7)*th*D;m.y=(.55+Math.random()*.4)*tv*D;const sp=(slow?.55:1.3)*Math.max(th,tv)*D;m.vx=dir*sp*(.8+Math.random()*.3);m.vy=-sp*(.35+Math.random()*.2);m.len=slow?.32:.2;};
  if(w==='meteor'&&Math.random()<dt*2.4)spawn(false); // 별똥별은 유성우 날씨일 때만(다른 날씨의 느린 사선은 빗줄기처럼 보여 뺐다, 2026-11-07)
  starU.uT.value=t;
  let any=false;for(let i=0;i<M.M.length;i++){const m=M.M[i];m.t+=dt;if(m.t>=m.life){for(let k=0;k<6;k++)M.cc[i*6+k]=0;continue;}
    any=true;const u=m.t/m.life,hx=m.x+m.vx*m.t,hy=m.y+m.vy*m.t;M.pos.set([hx,hy,-D*.98,hx-m.vx*m.len,hy-m.vy*m.len,-D*.98],i*6);const k=Math.sin(u*PI);M.cc.set([k,k*.96,k*.85,0,0,0],i*6);}
  M.ls.visible=any;if(any){M.geo.attributes.position.needsUpdate=true;M.geo.attributes.color.needsUpdate=true;}
  const A=aurora.m.uniforms;A.uT.value=t;A.uA.value+=((w==='aurora'?.85:0)-A.uA.value)*Math.min(1,dt*.8);aurora.me.visible=A.uA.value>.01;
  neb.material.opacity+=((w==='nebula'?.95:NEB0)-neb.material.opacity)*Math.min(1,dt*.8);
  sunM.scale.multiplyScalar(1+.03*Math.sin(t*1.3));}
function wrapShift(k,sh){if(fpLast)fpLast[k]+=sh;
  // 아기 토끼·할아버지는 마을 자리 그대로(원더룹이 이어 붙는 선을 넘으면 같은 자리가 L만큼 옮겨진 쪽에 그려진다 — 평평한 좌표는 그대로 둬도 wd로 거리 계산)
}
return {
  name:'회색 정원',kind:'outdoor',start:{compass:true},world:null,
  spawn:{x:SPAWN[0],z:SPAWN[1],ry:PI},
  areas,platforms,
  sun:ZSUN,lights:[lav],light,rim:.32,
  sky:SK,bend:{sphere:R,wrap:L},gravity:.38,jumpK:1.15,
  groundY,ground:[ground],keepOut:keep,mergeColors:true,music:null,
  update,dispose(){const W=G.mission.hero&&G.mission.hero();if(W&&W.userData.wrapShift===wrapShift)W.userData.wrapShift=null;},
};
}
function canvasTex(n,draw,h=n){const c=document.createElement('canvas');c.width=n;c.height=h;draw(c.getContext('2d'),n,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
/* ── 하늘 행성 손그림(2026-11-07 — 매끈한 스티커처럼 보여 로우폴리 색연필 세계와 따로 놀았다): 살짝 고르지 않은 가장자리(wob), 색연필 빗금 결(hatch),
   은은한 입체 그림자(왼쪽 위 해 쪽 밝게, 반대쪽 어둡게 — shade), 목성 줄무늬는 경계가 번지게(화소마다 물결 + 부드러운 섞기) */
function srand(seed){let s=seed;return ()=>((s=(s*16807)%2147483647)/2147483647);}
function wob(g,cx,cy,r,seed,amp=.018){const R=srand(seed),p1=R()*6,p2=R()*6,p3=R()*6;g.beginPath();for(let i=0;i<=120;i++){const a=i/120*PI*2,k=1+amp*(Math.sin(a*5+p1)*.5+Math.sin(a*9+p2)*.3+Math.sin(a*17+p3)*.2);
  const x=cx+Math.cos(a)*r*k,y=cy+Math.sin(a)*r*k;i?g.lineTo(x,y):g.moveTo(x,y);}g.closePath();}
function hatch(g,x0,y0,w,h,n,cols,seed,{len=[10,22],ang=-.55,alpha=[.08,.2],lw=[1.4,2.6]}={}){const R=srand(seed);g.save();g.lineCap='round';
  for(let i=0;i<n;i++){const x=x0+R()*w,y=y0+R()*h,L=len[0]+R()*(len[1]-len[0]),a=ang+(R()-.5)*.3;g.globalAlpha=alpha[0]+R()*(alpha[1]-alpha[0]);g.strokeStyle=cols[(R()*cols.length)|0];g.lineWidth=lw[0]+R()*(lw[1]-lw[0]);
    g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*L,y+Math.sin(a)*L);g.stroke();}g.restore();}
function shade(g,cx,cy,r,{lit=.22,dark=.4}={}){const hl=g.createRadialGradient(cx-r*.42,cy-r*.42,0,cx-r*.42,cy-r*.42,r*.9);hl.addColorStop(0,`rgba(255,250,232,${lit})`);hl.addColorStop(1,'rgba(255,250,232,0)');g.fillStyle=hl;g.fillRect(cx-r*1.1,cy-r*1.1,r*2.2,r*2.2);
  const sh=g.createRadialGradient(cx-r*.3,cy-r*.3,r*.55,cx-r*.1,cy-r*.1,r*1.25);sh.addColorStop(0,'rgba(60,30,70,0)');sh.addColorStop(.7,`rgba(60,30,70,${dark*.45})`);sh.addColorStop(1,`rgba(50,22,60,${dark})`);g.fillStyle=sh;g.fillRect(cx-r*1.1,cy-r*1.1,r*2.2,r*2.2);}
/* 목성: 크림·황토·적갈색 줄무늬(경계 번짐) + 붉은 폭풍, 빗금 결, 입체 그림자, 고르지 않은 갈색 테두리 */
function jupiterArt(g,n){const r=n*.46,cx=n/2,cy=n/2;
  const bands=['#f3e3c4','#d9b48a','#f0dcb6','#c98d62','#ead2a8','#b8754e','#f2e0bc','#d4a67a','#efd9b0','#c58a60','#f3e3c4'].map(h=>new THREE.Color(h));
  const img=g.createImageData(n,n),d=img.data,bh=2*r/bands.length,R=srand(5);const nz=[];for(let i=0;i<64;i++)nz.push(R());
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){const dx=x-cx,dy=y-cy;if(dx*dx+dy*dy>(r*1.05)**2)continue;
    const yy=dy+r+Math.sin(x*.035+y*.004)*bh*.22+Math.sin(x*.11+nz[(y>>3)&63]*6)*bh*.06,bi=yy/bh,i0=Math.max(0,Math.min(bands.length-1,Math.floor(bi))),i1=Math.min(bands.length-1,i0+1),f=bi-i0;
    const t=f<.78?0:Math.min(1,(f-.78)/.22),tt=t*t*(3-2*t),a=bands[i0],b=bands[i1],j=(nz[(x*7+y*13)&63]-.5)*.035;const k=(y*n+x)*4;
    d[k]=Math.min(255,(a.r+(b.r-a.r)*tt+j)*255);d[k+1]=Math.min(255,(a.g+(b.g-a.g)*tt+j)*255);d[k+2]=Math.min(255,(a.b+(b.b-a.b)*tt+j)*255);d[k+3]=255;}
  const tmp=document.createElement('canvas');tmp.width=tmp.height=n;tmp.getContext('2d').putImageData(img,0,0);
  g.save();wob(g,cx,cy,r,3);g.clip();g.drawImage(tmp,0,0);
  hatch(g,cx-r,cy-r,2*r,2*r,650,['#fff6e6','#fbe8c8','#8a5a3a','#a8704a'],7,{len:[8,20],alpha:[.05,.12]});
  // 붉은 폭풍(손으로 칠한 듯: 두 겹 + 빗금)
  g.fillStyle='#c4523a';wob(g,0,0,1,11,.06);g.save();g.translate(cx-r*.22,cy+r*.3);g.scale(r*.2,r*.11);wob(g,0,0,1,11,.07);g.fill();g.restore();
  g.save();g.translate(cx-r*.22,cy+r*.3);g.scale(r*.12,r*.06);wob(g,0,0,1,13,.08);g.fillStyle='#e07a5a';g.fill();g.restore();
  hatch(g,cx-r*.45,cy+r*.18,r*.45,r*.24,60,['#f39a7a','#9a3a2a'],9,{len:[5,10],alpha:[.15,.3]});
  shade(g,cx,cy,r,{lit:.24,dark:.36});g.restore();
  g.strokeStyle='rgba(74,42,42,.62)';g.lineWidth=5;wob(g,cx,cy,r,3);g.stroke();g.strokeStyle='rgba(74,42,42,.25)';g.lineWidth=2;wob(g,cx,cy,r*1.006,17,.022);g.stroke();}
/* 해: 크림빛 원(고르지 않은 가장자리) + 노랑·살구 빗금 + 은은한 입체 + 살구빛 빛무리 */
function sunArt(g,n){const cx=n/2,cy=n/2,r=n*.19;const gr=g.createRadialGradient(cx,cy,0,cx,cy,n/2);gr.addColorStop(0,'rgba(255,236,190,.55)');gr.addColorStop(.42,'rgba(255,210,140,.28)');gr.addColorStop(1,'rgba(255,190,120,0)');g.fillStyle=gr;g.fillRect(0,0,n,n);
  g.save();wob(g,cx,cy,r,21,.03);g.fillStyle='#ffe4a0';g.fill();g.clip();hatch(g,cx-r,cy-r,2*r,2*r,260,['#fff6dc','#ffd27a','#ffbe6a','#fffbe8'],23,{len:[6,14],alpha:[.15,.35],lw:[1.2,2.2]});shade(g,cx,cy,r,{lit:.35,dark:.22});g.restore();
  g.strokeStyle='rgba(214,140,60,.75)';g.lineWidth=3;wob(g,cx,cy,r,21,.03);g.stroke();}
/* 토성: 금빛 몸통(빗금·입체) + 비스듬한 고리(뒤 반·앞 반, 색연필 결), 고르지 않은 갈색 테두리 */
function saturnArt(g,n){const cx=n/2,cy=n/2,r=n*.2;
  const ring=(front)=>{g.save();g.translate(cx,cy);g.rotate(-.18);g.scale(1,.32);g.beginPath();if(front)g.arc(0,0,n*.44,0,PI);else g.arc(0,0,n*.44,PI,PI*2);
    g.lineWidth=n*.085;g.strokeStyle='#5a3826';g.globalAlpha=.55;g.stroke();g.globalAlpha=1;g.lineWidth=n*.07;g.strokeStyle='#e9c97a';g.stroke();g.lineWidth=n*.022;g.strokeStyle='#b9944e';g.stroke();
    g.lineWidth=1.6;for(let i=0;i<40;i++){const a=(front?0:PI)+(i+.5)/40*PI;g.strokeStyle=i%3?'rgba(255,246,220,.5)':'rgba(140,100,50,.4)';g.beginPath();g.arc(0,0,n*(.405+(i%5)*.017),a,a+.05);g.stroke();}g.restore();};
  ring(false);g.save();wob(g,cx,cy,r,31,.025);g.fillStyle='#f0d49a';g.fill();g.clip();
  g.strokeStyle='#c99a4e';g.lineWidth=3;[-.35,.1,.45].forEach(k=>{g.beginPath();g.moveTo(cx-r*.95,cy+r*k);g.quadraticCurveTo(cx,cy+r*k+4,cx+r*.95,cy+r*k);g.stroke();});
  hatch(g,cx-r,cy-r,2*r,2*r,160,['#fff4d6','#b8863e'],33,{len:[5,11],alpha:[.12,.26],lw:[1,1.8]});shade(g,cx,cy,r,{lit:.3,dark:.5});g.restore();
  g.strokeStyle='rgba(90,56,38,.8)';g.lineWidth=2.6;wob(g,cx,cy,r,31,.025);g.stroke();ring(true);}
/* 바닥 크레용 결(storybook 크레용 결과 같은 그리기, 획 불투명도·어두운 색을 한 단계 올림) */
function crayonGround(g,size){const R=srand(20261107),rr=(a,b)=>a+R()*(b-a),cols=['#e6d6ca','#ffffff','#d2c0b4','#fff6ea','#c4b2a6','#b9a8b8'],pick=()=>cols[Math.floor(R()*cols.length)];
  g.fillStyle='#ffffff';g.fillRect(0,0,size,size);g.lineCap='round';
  for(let i=0;i<1300;i++){const x=R()*size,y=R()*size,len=rr(6,18),ang=R()*PI,w=rr(1.5,5);g.strokeStyle=pick();g.globalAlpha=rr(.16,.45);g.lineWidth=w;
    const dx=Math.cos(ang)*len,dy=Math.sin(ang)*len;for(let ox=-1;ox<=1;ox++)for(let oy=-1;oy<=1;oy++){g.beginPath();g.moveTo(x+ox*size,y+oy*size);g.lineTo(x+dx+ox*size,y+dy+oy*size);g.stroke();}}
  for(let i=0;i<1000;i++){g.globalAlpha=rr(.14,.4);g.fillStyle=pick();g.beginPath();g.arc(R()*size,R()*size,rr(.8,3),0,7);g.fill();}g.globalAlpha=1;}
/* 종이 결(하늘 바탕, 256 반복): 밝은 섬유 짧은 선 + 어두운 티끌 — 판 불투명도로 아주 옅게 */
function paperArt(g,n){const R=srand(41);g.clearRect(0,0,n,n);g.lineCap='round';
  for(let i=0;i<420;i++){const x=R()*n,y=R()*n,L=2+R()*5,a=R()*PI;g.globalAlpha=.04+R()*.07;g.strokeStyle=R()<.75?'#fff4e6':'#d9c8ff';g.lineWidth=.8+R()*1.4;
    for(let ox=-1;ox<=1;ox++)for(let oy=-1;oy<=1;oy++){g.beginPath();g.moveTo(x+ox*n,y+oy*n);g.lineTo(x+ox*n+Math.cos(a)*L,y+oy*n+Math.sin(a)*L);g.stroke();}}
  for(let i=0;i<700;i++){g.globalAlpha=.06+R()*.1;g.fillStyle=R()<.6?'#0c0820':'#fff8ee';g.fillRect(R()*n,R()*n,1.2,1.2);}g.globalAlpha=1;}
/* 네 갈래 반짝이 ✦(로딩 화면 반짝이와 같은 모양 — 노랑, 가운데 흰빛) */
function sparkArt(g,n){const c=n/2;const gr=g.createRadialGradient(c,c,0,c,c,c);gr.addColorStop(0,'rgba(255,240,170,.55)');gr.addColorStop(1,'rgba(255,230,140,0)');g.fillStyle=gr;g.fillRect(0,0,n,n);
  g.fillStyle='#ffe27a';g.beginPath();for(let k=0;k<8;k++){const a=k/8*PI*2-PI/2,r=k%2?n*.08:n*.46;const x=c+Math.cos(a)*r,y=c+Math.sin(a)*r;k?g.lineTo(x,y):g.moveTo(x,y);}g.closePath();g.fill();
  g.fillStyle='#fffbe6';g.beginPath();g.arc(c,c,n*.07,0,7);g.fill();}
/* 성운: 연보라·분홍 위주(+ 살구·하늘 조금) 구름 얼룩 */
function nebulaArt(g,n){let s=11;const R=()=>((s=(s*16807)%2147483647)/2147483647);const cols=['214,150,240','255,150,200','200,160,255','255,180,170','170,170,255'];
  for(let i=0;i<60;i++){const x=n*(.12+R()*.76),y=n*(.25+R()*.5),r=n*(.07+R()*.2),c=cols[i%5],gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(${c},.075)`);gr.addColorStop(1,`rgba(${c},0)`);g.fillStyle=gr;g.fillRect(0,0,n,n);}}
/* 은하수 띠(가로로 긴 그림 — 판은 4:1): 가운데가 밝은 연보라·분홍 띠 + 작은 별 알갱이 */
function milkyArt(g,n){const w=n,h=n;let s=23;const R=()=>((s=(s*16807)%2147483647)/2147483647);
  for(let i=0;i<70;i++){const x=w*R(),y=h*(.5+(R()-.5)*.36*Math.sin(x/w*PI)),r=h*(.08+R()*.16),c=['190,160,240','240,170,220','170,180,255'][i%3],gr=g.createRadialGradient(x,y,0,x,y,r);
    gr.addColorStop(0,`rgba(${c},.07)`);gr.addColorStop(1,`rgba(${c},0)`);g.fillStyle=gr;g.fillRect(0,0,w,h);}
  const fade=g.createLinearGradient(0,0,w,0);fade.addColorStop(0,'rgba(0,0,0,1)');fade.addColorStop(.15,'rgba(0,0,0,0)');fade.addColorStop(.85,'rgba(0,0,0,0)');fade.addColorStop(1,'rgba(0,0,0,1)');
  g.globalCompositeOperation='destination-out';g.fillStyle=fade;g.fillRect(0,0,w,h);const fv=g.createLinearGradient(0,0,0,h);fv.addColorStop(0,'rgba(0,0,0,1)');fv.addColorStop(.3,'rgba(0,0,0,0)');fv.addColorStop(.7,'rgba(0,0,0,0)');fv.addColorStop(1,'rgba(0,0,0,1)');g.fillStyle=fv;g.fillRect(0,0,w,h);g.globalCompositeOperation='source-over';}
/* 정점 색 덩어리 하나(부품 목록 → 한 메시) */
function lumpMesh(list){const gs=list.map(([geo,c,pos,rot,s])=>{let g=geo.index?geo.toNonIndexed():geo;for(const k of Object.keys(g.attributes))if(!['position','normal','uv'].includes(k))g.deleteAttribute(k);
    g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...(pos||[0,0,0])),new THREE.Quaternion().setFromEuler(new THREE.Euler(...(rot||[0,0,0]))),new THREE.Vector3(...(s||[1,1,1]))));
    const n=g.attributes.position.count,cc=new Float32Array(n*3),C=new THREE.Color(c);for(let i=0;i<n;i++){cc[i*3]=C.r;cc[i*3+1]=C.g;cc[i*3+2]=C.b;}g.setAttribute('color',new THREE.BufferAttribute(cc,3));return g;});
  const m=sbMat('#ffffff');m.vertexColors=true;const me=new THREE.Mesh(mergeGeometries(gs),m);me.castShadow=true;return me;}
/* 아기 토끼(키 약 0.9m — 원더룹의 0.65): 둥근 몸·큰 머리·쫑긋한 두 귀·목도리·흰 꼬리 — 한 덩어리(그리기 1번). squash(u): 뛰는 동안 늘었다 줄었다 */
function makeBunny(fur,scarf){const root=new THREE.Group();const S=(r,w=12,h=9)=>new THREE.SphereGeometry(r,w,h);
  const furD=new THREE.Color(fur).multiplyScalar(.86).getStyle(),cream='#f3ebe0',pink='#f2a7b4',dark='#2a2633';
  const me=lumpMesh([[S(.2),fur,[0,.24,0],0,[1,1.05,.95]],[S(.12),cream,[0,.22,.13],0,[1,1.2,.5]],[S(.08,8,6),fur,[-.1,.04,.06],0,[1,.55,1.5]],[S(.08,8,6),fur,[.1,.04,.06],0,[1,.55,1.5]],
    [S(.07,8,6),'#ffffff',[0,.18,-.19]],[new THREE.TorusGeometry(.13,.04,6,16),scarf,[0,.4,0],[PI/2,0,0],[1,1,.9]],[S(.05,8,6),scarf,[.06,.36,.14]],
    [S(.21),fur,[0,.6,0],0,[1.05,.95,1]],[S(.09,8,6),cream,[0,.53,.16],0,[1.3,.8,.7]],[S(.025,6,5),pink,[0,.58,.21]],
    [S(.032,6,5),dark,[-.08,.63,.18],0,[.8,1.2,.5]],[S(.032,6,5),dark,[.08,.63,.18],0,[.8,1.2,.5]],[S(.035,6,5),'#f6a0ac',[-.14,.55,.15],0,[1,.6,.4]],[S(.035,6,5),'#f6a0ac',[.14,.55,.15],0,[1,.6,.4]],
    [S(.055,8,6),fur,[-.08,.9,-.02],[0,0,.18],[1,2.9,.7]],[S(.032,6,5),pink,[-.08,.9,.012],[0,0,.18],[1,2.6,.5]],[S(.055,8,6),fur,[.08,.9,-.02],[0,0,-.18],[1,2.9,.7]],[S(.032,6,5),pink,[.08,.9,.012],[0,0,-.18],[1,2.6,.5]],
    [S(.05,8,6),furD,[-.15,.3,.06]],[S(.05,8,6),furD,[.15,.3,.06]]]);
  root.add(me);root.scale.setScalar(.81); // 키 약 0.86m(귀 끝까지) = 원더룹의 0.62 — 보름 할아버지(1.0)와 확실히 구분
  return {root,squash(u,t){const k=u>0?Math.sin(u*PI):0,sy=1+k*.12-(u>.9?(u-.9)*1.2:0),sx=1/Math.sqrt(sy);me.scale.set(sx,sy,sx);me.rotation.z=u>0?0:Math.sin(t*1.7)*.03;}};}
/* 보름 할아버지 모델 — 회색 달토끼: 달걀 몸·둥근 머리·한쪽 귀는 쫑긋, 한쪽은 반쯤 접힘·붉은 띠 작은 검은 신사모자·오른쪽 눈 망원경 안경(놋쇠 짧은 통)·등에 둘둘 만 지도·흰 꼬리
   부품을 덩어리마다 정점 색으로 합친다(몸·머리·왼팔·오른팔·펼친 지도). 대기 동작: 지도를 펼쳐 보기 ↔ 망원경 안경 고쳐 쓰기 */
function makeBobo(){const root=new THREE.Group();root.name='bobo';
  const lump=lumpMesh;
  const S=(r,w=14,h=10)=>new THREE.SphereGeometry(r,w,h),Cy=(a,b,h,n=12)=>new THREE.CylinderGeometry(a,b,h,n);
  const fur='#c3c4cc',cream='#efe6d6',pink='#f2a7b4',dark='#2a2633',red='#c8463c',brass='#d8a24a',paper='#f3e4c4',strap='#7a4e32';
  const body=lump([[S(.34),fur,[0,.42,0],0,[1,1.08,.92]],[S(.2),cream,[0,.4,.2],0,[1,1.2,.5]],[S(.13,10,8),fur,[-.15,.07,.08],0,[1,.55,1.5]],[S(.13,10,8),fur,[.15,.07,.08],0,[1,.55,1.5]],
    [S(.1,10,8),'#ffffff',[0,.3,-.31]],[Cy(.075,.075,.56),paper,[0,.62,-.3],[0,0,PI/2]],[Cy(.08,.08,.04),strap,[.12,.62,-.3],[0,0,PI/2]],[Cy(.08,.08,.04),strap,[-.12,.62,-.3],[0,0,PI/2]],
    [new THREE.TorusGeometry(.345,.024,6,28),strap,[0,.5,-.01],[PI/2,0,.75],[1,1,.9]]]); // 등의 지도를 맨 끈: 몸을 한 바퀴 감는 띠(예전 반 바퀴 끈은 끝이 허공에 떠 '검은 막대'처럼 보였다)
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
  map.position.set(0,.62,.36);map.rotation.x=-.5;map.scale.set(0,1,1);map.visible=false;root.add(map);
  /* 펼친 지도는 접혀 있을 때(폭 0) 숨긴다 — 폭 0으로 눌린 덩어리는 법선이 깨져 '검은 막대'처럼 보였다(2026-11-07 시범 장면).
     둥실 뛰기 시범에서는 오른손에 둘둘 만 지도(크림 종이 + 갈색 끈)를 들고 뛴다 */
  const scroll=lump([[Cy(.045,.045,.4,10),paper,[0,0,0],[0,0,PI/2]],[Cy(.05,.05,.03,10),strap,[.1,0,0],[0,0,PI/2]],[Cy(.05,.05,.03,10),strap,[-.1,0,0],[0,0,PI/2]],
    [Cy(.035,.035,.012,10),'#e6d2a8',[.205,0,0],[0,0,PI/2]],[Cy(.035,.035,.012,10),'#e6d2a8',[-.205,0,0],[0,0,PI/2]]]);
  scroll.position.set(0,-.33,.06);scroll.rotation.set(0,.5,.9);scroll.visible=false;armR.add(scroll);
  let mode=0,mt=0;
  function tick(dt,t,hop){mt+=dt;if(mt>6.5){mt=0;mode=(mode+1)%2;}
    const k=hop?0:ss(0,.6,mt)*ss(6.5,5.8,mt);// 동작 세기(들어갔다 나옴)
    head.rotation.z=Math.sin(t*.9)*.04;head.position.y=.84+Math.sin(t*1.8)*.008;earBent.rotation.z=Math.sin(t*1.3)*.08;
    scroll.visible=!!hop;
    if(hop){armL.rotation.set(0,0,-1.2);armR.rotation.set(-.5,0,1.0);map.scale.x=0;map.visible=false;return;}
    if(mode===0){// 지도 펼쳐 보기: 두 팔을 앞으로, 지도가 가운데서 양옆으로 펴짐, 고개를 숙여 봄
      armL.rotation.set(-1.1*k,0,.25*k);armR.rotation.set(-1.1*k,0,-.25*k);map.scale.x=Math.max(.001,ss(.3,.9,mt)*ss(6.3,5.6,mt));map.visible=map.scale.x>.04;head.rotation.x=.25*k;}
    else{// 망원경 안경 고쳐 쓰기: 오른팔을 들어 눈가에, 고개를 살짝 갸웃
      armL.rotation.set(0,0,0);armR.rotation.set(-2.2*k,0,-.35*k+Math.sin(t*6)*.04*k);map.scale.x=.001;map.visible=false;head.rotation.x=-.08*k;head.rotation.z+=.12*k;}}
  return {root,tick};}
