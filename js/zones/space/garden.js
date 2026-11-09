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
import {popShown} from '../../game/popup.js';
import SPACE from '../../worlds/infinite-space.js';
import {RIDE,departure,dustVeil} from './meteor-ride.js'; // 출구 → 별똥별 꼬리 타고 화성으로(2026-11-09)
/* 행성 크기(2026-11-08 — 17m → 24m): 걷기 속도는 그대로 두고 행성을 키워 땅이 도는 속도를 약 30% 늦춤(땅 회전만 따로 늦추면 발이 미끄러져 보여서). 한 바퀴 2πR/3.78 ≈ 40초.
   ?debug 톱니 메뉴 '행성 반지름' 막대(localStorage 'wl-space-R', 12~40 — 바꾸면 다시 연다) 또는 ?planetR=로 맞춰 볼 수 있다.
   배치는 17m 때 자리를 기준으로 S = R/17배 펼친다: 멀리 있는 것(분화구·언덕·발자국 길·출구·따뜻한 땅·그늘 분화구 자리)은 S배,
   마을(시작 지점 둘레)과 그늘 분화구 안쪽(얼음 결정·동굴·목걸이·높은 바위 — 분화구 가운데 기준)은 크기 그대로 */
const WID=SPACE.id,R0=17,R=(()=>{try{const q=new URLSearchParams(location.search),v=+(q.get('planetR')||localStorage.getItem('wl-space-R')||0);return v>=12&&v<=40?v:24;}catch(e){return 24;}})(),S=R/R0;
const L=2*PI*R,HALF=L/2,MOB=QUALITY.tier==='mobile';
const wd=a=>((a%L)+1.5*L)%L-.5*L; // 이어지는 땅에서 가장 가까운 쪽 차이
const dist=(x,z,c)=>Math.hypot(wd(x-c[0]),wd(z-c[1]));
const ss=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x);};
const col=h=>new THREE.Color(h);
const W2=k=>2*PI*k/L; // L 주기 무늬 주파수(이음매 없음)
const sc=p=>[p[0]*S,p[1]*S]; // 17m 때 자리 → 지금 크기
/* 자리 */
const SPAWN=[0,9.5],BOBO=[2.1,5.4],SHADE={c:sc([-5,-15]),r:6,d:1.3,rim:.5},EXIT=sc([6,-35]),WARM=sc([16,8]);
const shd=(x,z)=>[x+5+SHADE.c[0],z+15+SHADE.c[1]]; // 그늘 분화구 둘레 자리(17m 때 좌표 → 분화구 가운데 기준으로 옮김)
const ROCK={c:shd(-11.8,-13.5),r:1.65},CAVE=shd(-5,-19.7),NECK=shd(-3.2,-15.2);
SPACE.firstMission.item.at=NECK; // 첫 미션 목걸이 자리(세계 설정)도 새 크기에 맞춤
/* 둥실 뛰기 시범: 할아버지가 바위 쪽으로 한 번 크게 뛰어(약 9m) 내려앉는 곳(원더룹 뒤 카메라에 늘 들어오는 거리) */
const DEMO_LAND=(()=>{const dx=ROCK.c[0]-BOBO[0],dz=ROCK.c[1]-BOBO[1],d=Math.hypot(dx,dz);return [BOBO[0]+dx/d*9,BOBO[1]+dz/d*9];})();
/* 마을(시작 지점 둘레) */
const VIL=[1.4,6.2],HUT=[5.4,3.0],SCOPE=[-3.0,4.6],LINE=[[3.8,9.2],[7.0,7.2]],TABLE=[-1.7,2.4],MAIL=[-1.8,8.4],MORTAR=[7.2,10.4],POLE=[-3.6,1.2];
/* 바위 아치: 첫 미션 길 위(지나가며 올려다봄) — 가운데·길 방향 */
const ARCH={c:sc([-1.6,-7.9]),dir:[-.37,-.93],half:1.7,h:2.2};
const CRATERS=[SHADE,...[{c:[12,-4],r:4,d:.8,rim:.35},{c:[-14,6],r:3.5,d:.6,rim:.3},{c:[19,21],r:5,d:1,rim:.4},{c:[-26,-30],r:6,d:1,rim:.45},{c:[30,-28],r:4,d:.7,rim:.3},
  {c:[-30,24],r:5,d:.9,rim:.4},{c:[8,30],r:3,d:.5,rim:.25},{c:[40,10],r:4,d:.8,rim:.35},{c:[-40,-6],r:4.5,d:.8,rim:.35},{c:[-18,-40],r:3.2,d:.5,rim:.25},{c:[24,-44],r:3.6,d:.6,rim:.3}].map(C=>({...C,c:sc(C.c)})),
  // 넓어진 땅에 몇 개 더(17m 좌표 — 같이 펼침)
  ...[{c:[0,-44],r:3.4,d:.6,rim:.3},{c:[42,-14],r:3.8,d:.7,rim:.32},{c:[-42,22],r:3.2,d:.55,rim:.28},{c:[33,40],r:3.6,d:.6,rim:.3},{c:[-14,42],r:3,d:.5,rim:.25}].map(C=>({...C,c:sc(C.c)}))].filter(C=>Math.abs(C.c[0])<HALF-4&&Math.abs(C.c[1])<HALF-4);
/* 완만한 언덕 [x,z,반지름,높이] — 마을·그늘 분화구·높은 바위·출구는 피함 (자리 S배, 반지름 √S배) */
const HILLS=[[15,15,9,1.3],[-19,-3,8,1.1],[22,-15,9,1.4],[-14,25,9,1.2],[6,-23,6,.7],[-33,-37,9,1.1],[35,37,9,1.2],[41,-40,8,1],[-41,41,8,1],[31,3,7,.9],[-6,31,7,.9],[-28,11,6,.8],[13,-48,7,.9],[-47,-20,7,1]]
  .map(([x,z,r,h])=>[x*S,z*S,r*Math.sqrt(S),h]).filter(([x,z])=>Math.abs(x)<HALF-6&&Math.abs(z)<HALF-6);
function groundY(x,z){let y=.16*Math.sin(W2(3)*x+.7)*Math.sin(W2(2)*z+1.3)+.1*Math.sin(W2(5)*(x+z)); // 아주 잔잔한 물결(L 주기)
  {const v=Math.max(0,1-dist(x,z,VIL)/8);y*=1-v*v*(3-2*v);} // 마을 마당은 평평하게
  for(const [hx,hz,hr,hh] of HILLS){const t=dist(x,z,[hx,hz])/hr;if(t<1)y+=hh*.5*(1+Math.cos(PI*t));}
  for(const C of CRATERS){const t=dist(x,z,C.c)/C.r;if(t<1)y+=-C.d*(1-t*t)+C.rim*ss(.55,1,t);else if(t<1.7)y+=C.rim*(1-(t-1)/.7)**2;}return y;}
/* 할아버지의 오래된 발자국 길: 집 앞 → 그늘 분화구 → 행성을 크게 한 바퀴 → 출구 */
const TRAIL=[[2.4,4.6],[1.6,0],...[[-.6,-5.5],[-2.6,-10.6]].map(sc),shd(-3.4,-14.2),...[[-8,-20],[-16,-24],[-26,-20],[-34,-8],[-40,6],[-36,20],[-24,30],[-8,36],[10,40],[26,34],[36,20],[40,4],[34,-12],[22,-26],[10,-32],[6,-35]].map(sc)]; // 마을 앞 두 점은 그대로, 분화구 안 한 점은 분화구 기준, 나머지는 S배
function trailPts(step){const out=[];for(let i=0;i<TRAIL.length-1;i++){const [ax,az]=TRAIL[i],[bx,bz]=TRAIL[i+1],P0=TRAIL[Math.max(0,i-1)],P3=TRAIL[Math.min(TRAIL.length-1,i+2)];
    const n=Math.ceil(Math.hypot(bx-ax,bz-az)/step);for(let k=0;k<n;k++){const t=k/n,t2=t*t,t3=t2*t,cr=(p0,p1,p2,p3)=>.5*(2*p1+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t2+(-p0+3*p1-3*p2+p3)*t3);
      out.push([cr(P0[0],ax,bx,P3[0]),cr(P0[1],az,bz,P3[1])]);}}return out;}
export function build({root}){
const rnd=(()=>{const r=rng('space-garden:props');return (a,b)=>a+(b-a)*r();})();
const rv=(()=>{const r=rng('space-garden:village');return (a,b)=>a+(b-a)*r();})(); // 채우기(마을·지형)는 새 이름 난수 — 앞 소품 자리는 그대로
const keep=[],obstacles=[];
/* ── 땅: L×L 한 장(1.1~1.3m 칸 — 꼭짓점마다 공 위로 감기므로 촘촘히), 정점 색, 크레용 결
   색연필 얼룩: 회색 바탕 + 연보라(그늘 쪽 비탈·분화구 안·얼룩) + 크림(햇빛 쪽 +x 비탈·따뜻한 땅·얼룩), 그늘 분화구는 푸른 서리 */
const SEG=Math.ceil(L/(MOB?1.35:1.15)),gGeo=new THREE.PlaneGeometry(L,L,SEG,SEG);gGeo.rotateX(-PI/2);
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
function put(geo,color,{pos=[0,0,0],rot=[0,0,0],s=[1,1,1],smooth=false}={},into=parts){ /* smooth: 원래 매끈한 법선 그대로(집 벽·지붕 — 면마다 평평하면 판 단위로 밝기가 끊겼다) */let g=geo.index?geo.toNonIndexed():geo;for(const k of Object.keys(g.attributes))if(!['position','normal','uv'].includes(k))g.deleteAttribute(k);
  if(!g.attributes.uv)g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
  g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...pos),new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)),new THREE.Vector3(...s)));if(!smooth)g.computeVertexNormals();
  const n=g.attributes.position.count,cc=new Float32Array(n*3),C=col(color);for(let i=0;i<n;i++){cc[i*3]=C.r;cc[i*3+1]=C.g;cc[i*3+2]=C.b;}g.setAttribute('color',new THREE.BufferAttribute(cc,3));
  const u=g.attributes.uv;for(let i=0;i<n;i++)u.setXY(i,u.getX(i)*2,u.getY(i)*2);into.push(g);return g;}
/* 두 점 사이 막대(줄·다리·끈) */
function rod(a,b,r,color,into=parts,n=6){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A),len=d.length();
  const geo=new THREE.CylinderGeometry(r,r,len,n);geo.translate(0,len/2,0);geo.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize()));geo.translate(A.x,A.y,A.z);return put(geo,color,{},into);}
const lumpy=(r,det=0,seed=0)=>{const g=new THREE.IcosahedronGeometry(r,det),p=g.attributes.position;for(let i=0;i<p.count;i++){const k=1+(Math.sin(p.getX(i)*9.1+p.getY(i)*3.7+seed)*.5+Math.sin(p.getZ(i)*7.3+seed*.7)*.5)*.16;p.setXYZ(i,p.getX(i)*k,p.getY(i)*k,p.getZ(i)*k);}return g;};
const nearTrail=trailPts(1.2);
const clearOf=(x,z,m)=>nearTrail.every(([a,b])=>Math.hypot(wd(x-a),wd(z-b))>m)&&[SPAWN,BOBO,ROCK.c,CAVE,EXIT,DEMO_LAND,NECK].every(c=>dist(x,z,c)>m+1.2)
  &&dist(x,z,VIL)>8+m*.3&&dist(x,z,ARCH.c)>3.2&&Math.abs(wd(x))<HALF-3&&Math.abs(wd(z))<HALF-3;
const rockCols=['#aeaaab','#a19ca3','#b7b2b1','#948f99','#a9a3b4'],warmCols=['#c9ae90','#bea183','#d3b899'];
function rock(x,z,s,{solid=true,warmK=0,round=false}={}){const y=groundY(x,z),c=warmK>.4?warmCols[(rnd(0,3)|0)%3]:rockCols[(rnd(0,5)|0)%5];
  put(lumpy(.5*s,s>1.6||round?1:0,s*3),c,{pos:[x,y+.18*s,z],rot:[rnd(0,PI),rnd(0,PI),0],s:[1,rnd(.55,.85),rnd(.85,1.15)]});if(solid&&s>.7)obstacles.push({c:[x,z,.42*s]});}
// 분화구 테두리 돌
for(const C of CRATERS){const n=Math.round(C.r*2.2);for(let i=0;i<n;i++){const a=i/n*PI*2+rnd(-.2,.2),d=C.r*rnd(.98,1.18),x=C.c[0]+Math.cos(a)*d,z=C.c[1]+Math.sin(a)*d;if(!clearOf(x,z,.9))continue;rock(x,z,rnd(.35,.8),{solid:false,warmK:dist(x,z,WARM)<10?1:0});}}
// 흩어진 바위(크기 규칙: 원더룹보다 커도 됨)
for(let i=0;i<Math.round(70*S*S);i++){const x=rnd(-HALF+4,HALF-4),z=rnd(-HALF+4,HALF-4);if(!clearOf(x,z,1.8))continue;const big=rnd(0,1)<.18;rock(x,z,big?rnd(1.6,3):rnd(.5,1.2),{warmK:dist(x,z,WARM)<10?1:0});}
// 채우기: 크기가 다양한 둥근 바위(언덕 기슭·길 가장자리 — 카메라 앞쪽 겹)·작은 돌무더기
const RR=(a,b)=>rv(a,b);
for(let i=0;i<Math.round(46*S*S);i++){const x=RR(-HALF+4,HALF-4),z=RR(-HALF+4,HALF-4);if(!clearOf(x,z,1.5))continue;const s=[RR(.4,.7),RR(.8,1.3),RR(1.4,2.4)][i%3];
  const y=groundY(x,z);put(lumpy(.5*s,1,i),rockCols[i%5],{pos:[x,y+.2*s,z],rot:[RR(0,PI),RR(0,PI),0],s:[1,RR(.7,.95),RR(.9,1.1)]});if(s>.7)obstacles.push({c:[x,z,.42*s]});
  if(i%2)put(lumpy(.17*s,0,i+.5),rockCols[(i+2)%5],{pos:[x+.45*s,groundY(x+.45*s,z+.2)+.06,z+.2*s]});}
// 길 가장자리 작은 돌(밟아도 되는 크기 — 충돌 없음): 발자국 길 양옆으로 드문드문
nearTrail.forEach(([x,z],i)=>{if(i%5)return;const sd=(i%10?1:-1)*RR(.9,1.6),a=RR(0,PI*2),X=x+Math.cos(a)*sd,Z=z+Math.sin(a)*sd;
  if(dist(X,Z,VIL)<5||dist(X,Z,ARCH.c)<2.4||dist(X,Z,SHADE.c)<SHADE.r)return;put(lumpy(RR(.1,.22),0,i),rockCols[i%5],{pos:[X,groundY(X,Z)+.05,Z],rot:[RR(0,PI),RR(0,PI),0],s:[1,.6,1]});});
function cairn(x,z,n,s=1){let y=groundY(x,z);for(let k=0;k<n;k++){const r=(.26-.035*k)*s*RR(.9,1.1);put(lumpy(r,1,k+x),rockCols[(k+3)%5],{pos:[x+RR(-.05,.05),y+r*.62,z+RR(-.05,.05)],rot:[0,RR(0,PI),0],s:[1,.62,1]});y+=r*1.12;}}
for(let i=0;i<Math.round(16*S*S);i++){const x=RR(-HALF+5,HALF-5),z=RR(-HALF+5,HALF-5);if(!clearOf(x,z,1))continue;cairn(x,z,(RR(3,6)|0),RR(.8,1.25));for(let k=0;k<3;k++)put(lumpy(RR(.1,.18),0,k+i),rockCols[k],{pos:[x+RR(-.6,.6),groundY(x,z)+.05,z+RR(-.6,.6)],s:[1,.6,1]});}
cairn(-4.6,-2.6,5,1.1);cairn(4.6,-3.4,4,1);cairn(...shd(-6.2,-11.4),4,.9); // 길목 표지(카메라 앞쪽 겹)
// 그늘 분화구: 서리 판
for(let i=0;i<14;i++){const a=rnd(0,PI*2),d=rnd(0,SHADE.r*.85),x=SHADE.c[0]+Math.cos(a)*d,z=SHADE.c[1]+Math.sin(a)*d;
  put(new THREE.CircleGeometry(rnd(.35,.8),7),'#d4def0',{pos:[x,groundY(x,z)+.02,z],rot:[-PI/2,0,rnd(0,PI)]});}
/* 빛나는 덩어리(수정·얼음 결정·전구·창문·출구 돌): 툰 + 흰 발광 → 파스텔이 스스로 빛나 보임(그리기 1번). halos = 그 자리에 은은한 빛무리(반짝이 Points에 함께) */
const glow=[],halos=[];
const iceCols=['#a9cdec','#93bde2','#c6e2f6'],pastel=['#ffb3c8','#a8d8ff','#ffe59a','#d9b8ff'];
function crystals(x,z,n,s,cols,into=glow){const y=groundY(x,z);for(let i=0;i<n;i++){const h=rnd(.35,.9)*s,a=rnd(0,PI*2),d=rnd(0,.35*s);
  put(new THREE.ConeGeometry(rnd(.07,.14)*s,h,5),cols[i%cols.length],{pos:[x+Math.cos(a)*d,y+h*.42,z+Math.sin(a)*d],rot:[rnd(-.35,.35),rnd(0,PI),rnd(-.35,.35)]},into);}}
const ICE=[[-2.4,-14.4,7,1.2],[-3.9,-16.6,5,1],[-7.6,-13.2,6,1.1],[-6.8,-17.4,4,.9],[-1.6,-17.2,4,.8]].map(([x,z,n,s])=>[...shd(x,z),n,s]);ICE.forEach(([x,z,n,s])=>crystals(x,z,n,s,iceCols));
ICE.forEach(([x,z])=>halos.push({x,z,y:groundY(x,z)+.45,c:'#9fd2ff',s:1.4}));
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
function occMesh(list,boxes,name,strict=false){const m=sbMat('#ffffff');m.vertexColors=true;const me=new THREE.Mesh(mergeGeometries(list),m);me.name=name;me.castShadow=me.receiveShadow=true;root.add(me);keep.push(me);
  G.occlude.add(me,1.5,2.5,{near:true,speed:6,boxes,strict});return me;}
occMesh(caveParts,caveBoxes,'icecave');
/* ── 높은 바위(분화구 끝 — 둥실 뛰기로만): 위가 평평한 큰 바위 + 꼭대기 판. 따로 한 덩어리(가리면 흐려짐) */
const ROCK_TOP=groundY(...ROCK.c)+1.85; // 둥실 뛰기(꼭대기 약 2.7m)로 넉넉히, 보통 점프(0.8m)로는 못 오름
{const rp=[],[x,z]=ROCK.c,y=groundY(x,z);put(new THREE.CylinderGeometry(ROCK.r*.95,ROCK.r*1.18,ROCK_TOP-y+.4,7,2),'#a5a0a8',{pos:[x,(ROCK_TOP+y-.4)/2,z],rot:[0,.3,0]},rp);
  put(new THREE.CylinderGeometry(ROCK.r*1.0,ROCK.r*.95,.14,7),'#c4bfbe',{pos:[x,ROCK_TOP-.02,z],rot:[0,.3,0]},rp);
  occMesh(rp,[new THREE.Box3(new THREE.Vector3(x-ROCK.r*1.15,y-.4,z-ROCK.r*1.15),new THREE.Vector3(x+ROCK.r*1.15,ROCK_TOP-.3,z+ROCK.r*1.15))],'highrock',true); // 미션 목표(높은 바위): 실제로 원더룹 앞을 가릴 때만 흐려짐(strict), 위에 서 있으면 안 흐려지게 상자 꼭대기를 낮춤
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
  /* 벽(2026-11-08 다시): 매끈한 법선(면마다 평평하면 판 단위로 밝기가 끊겨 보였다), 원기둥의 시작·끝 이음매는 문 반대쪽 뒤로(WALL_T0 — 문이 벽 한 면 가운데),
     밑동은 땅 속 15cm까지(땅에 깔끔하게 박힘), 위·아래 뚜껑 없음(지붕이 덮음). 지붕·지붕 테두리도 매끈한 법선 */
  const WALL_T0=face-15*PI/14,wallGeo=()=>new THREE.CylinderGeometry(1.45,1.5592,1.42,14,10,true,WALL_T0,PI*2); /* 높이 10칸: 처마 밑 어두운 띠를 정점 색으로 */ /* 아래 반지름 = 예전 기울기 그대로 15cm 더 내림 */
  /* 벽은 따로 한 덩어리: 그림자를 받지도 드리우지도 않음 — 둥근 벽의 그림자 지도 자국(벽 면이 빛과 나란한 곳)이 컴퓨터에서 가는 세로선으로 보였다(입체감은 툰 음영이 맡음).
     땅에 지는 집 그림자는 벽보다 12cm 작은 보이지 않는 기둥이 대신(컴퓨터만 — 휴대폰은 진짜 그림자가 없음) */
  {const wl=[];put(wallGeo(),'#d6d0d8',{pos:[hx,y+.56,hz],smooth:true},wl);
   /* 처마 그림자 느낌(2026-11-08): 그림자 계산 없이 처마 바로 아래 벽을 정점 색으로 은은하게 — 맨 위 24% 어둡게, 아래로 45cm에 걸쳐 옅어짐(컴퓨터·휴대폰 같음) */
   {const g=wl[0],P=g.attributes.position,C=g.attributes.color,top=y+1.27;for(let i=0;i<P.count;i++){const d=top-P.getY(i),k=1-.24*(1-ss(0,.45,d));C.setXYZ(i,C.getX(i)*k,C.getY(i)*k,C.getZ(i)*k);}}const wm=new THREE.Mesh(mergeGeometries(wl),pMatW());wm.receiveShadow=false;wm.castShadow=false;wm.name='hut-wall';root.add(wm);keep.push(wm);
   if(!MOB){const sc=new THREE.Mesh(new THREE.CylinderGeometry(1.33,1.44,1.4,14,1).translate(hx,y+.56,hz),new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:false}));sc.castShadow=true;sc.name='hut-shadow';root.add(sc);keep.push(sc);}}
  put(new THREE.SphereGeometry(1.62,16,8,face+PI,PI*2,0,PI/2),'#a993c9',{pos:[hx,y+1.22,hz],s:[1,.78,1],smooth:true});
  put(new THREE.TorusGeometry(1.5,.08,6,24),'#8a74ad',{pos:[hx,y+1.24,hz],rot:[PI/2,0,0],smooth:true});
  const fx=Math.sin(face),fz=Math.cos(face),at=(d,h,side=0)=>[hx+fx*d+Math.cos(face)*side,y+h,hz+fz*d-Math.sin(face)*side];
  /* 문·창(2026-11-08 다시): 둥근 벽(14각 기둥)의 실제 겉면에 쏘아 붙인 판 — 벽이 꺾이는 대로 따라 휘고 겉면에서 1.5cm만 띄움(겹쳐 깜빡이지 않게).
     예전 평평한 문판은 벽 모서리가 뚫고 나와 아래 가운데가 V로 파여 보였고, 반원 조각이 따로 돌아가 부채꼴처럼 붙어 있었다. 창은 벽에서 떠 있었다.
     문 = 위가 둥근 아치 하나(네모 + 위 반원) + 테두리 한 줄 + 놋쇠 손잡이, 창 = 동그란 불빛 창 + 테두리 */
  const wallG=wallGeo().translate(hx,y+.56,hz),onWall=th=>(u,v)=>{const a=th+u/1.5;return [[hx+Math.sin(a)*3,y+v,hz+Math.cos(a)*3],[-Math.sin(a),0,-Math.cos(a)]];};
  {const DW=.78,DH=.5,f=onWall(face);put(wrapOn(wallG,archShape(DW,DH,.0),f,.04),wood,{}); /* 판도 4cm — 테두리 관(2.2~7.8cm) 두께 안이라 비스듬히 봐도 사이로 벽이 비치지 않음 */
    put(rimTube(wallG,f,archLine(DW,DH,.005,.014),.028,false,.05),woodD,{}); /* 관 가운데를 벽에서 5cm — 벽이 꺾이는 모서리에서도 관이 벽에 먹히지 않게 */ /* 문틀 = 문판과 같은 윤곽을 관 반지름 절반만큼 바깥으로 — 관이 문판 가장자리를 살짝 덮어 사이로 벽이 비치지 않음, 바닥까지 */
    put(new THREE.SphereGeometry(.045,8,6),brass,{pos:wallPt(wallG,f,.24,.4,.05)});}
  {const WA=face-2*PI/14,f=onWall(WA),WR=.23,WY=.85;put(wrapOn(wallG,ellipseShape(0,WY,WR,WR),f,.04),'#ffd98a',{},glow); /* 창은 문 옆 벽 한 면의 가운데(예전엔 벽이 꺾이는 모서리에 걸쳐 비스듬히 보면 테두리 한쪽이 벽에 먹혔다) */
    put(rimTube(wallG,f,circleLine(0,WY,WR+.016),.032,true,.05),woodD,{});
    const hp=wallPt(wallG,f,0,WY,.1);halos.push({x:hp[0],z:hp[2],y:hp[1],c:'#ffd98a',s:1.3});}
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
  const px=x-.62,pz=z+.22;put(new THREE.CylinderGeometry(.2,.17,.04,14),'#e8d6ea',{pos:[px,gy(px,pz)+.04,pz]});
  [[0,0],[.09,.06],[-.06,.08]].forEach(([dx,dz],k)=>put(new THREE.SphereGeometry(.07,10,6),k===1?'#f7e0e6':'#fbf8f0',{pos:[px+dx,gy(px,pz)+.1,pz+dz],s:[1,.7,1]}));}
// 마을 돌담 몇(둥근 돌 낮게 줄지어 — 앞쪽 겹)
[[[-4.4,9.6],[-4.8,7.2]],[[8.2,5.2],[8.4,2.6]],[[2.6,12.4],[5.4,12.0]]].forEach(([a,b],w)=>{for(let k=0;k<=5;k++){const u=k/5,x=a[0]+(b[0]-a[0])*u+RR(-.1,.1),z=a[1]+(b[1]-a[1])*u+RR(-.1,.1),s=RR(.26,.36);put(lumpy(s,1,k+w*7),rockCols[(k+w)%5],{pos:[x,gy(x,z)+s*.55,z],rot:[0,RR(0,PI),0],s:[1,.75,1]});}});
const pMat=pMatW();
const props=new THREE.Mesh(mergeGeometries(parts),pMat);props.castShadow=props.receiveShadow=true;root.add(props);keep.push(props);parts=[];
/* 빛나는 덩어리: 툰 + 흰 발광(파스텔이 스스로 빛나 보임) */
{const m=sbMat('#ffffff',{emissive:'#ffffff',ei:.5});m.vertexColors=true;const me=new THREE.Mesh(mergeGeometries(glow),m);root.add(me);keep.push(me);}
/* ── 빛 웅덩이(땅에 붙은 은은한 빛, 더하기 섞기 — 그리기 1번): 그늘 분화구 푸른 빛·마을 줄 조명 아래 따뜻한 빛·출구 노란 빛·망원경 단 */
const dotTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.3,'rgba(255,255,255,.7)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;})();
{const pools=[[SHADE.c[0],SHADE.c[1],5.6,'#3e6aa8',.85],[CAVE[0],CAVE[1],2.4,'#5d8ed0',.9],[ (HUT[0]+POLE[0])/2,(HUT[1]+POLE[1])/2+.4,4.8,'#8a5a1e',.9],[EXIT[0],EXIT[1],2.8,'#8a7420',.9],[SCOPE[0]+.2,SCOPE[1]+.9,1.6,'#7a4e18',.7]];
  const gs=pools.map(([x,z,r,c,k])=>{const g=new THREE.PlaneGeometry(2*r,2*r,24,24);g.rotateX(-PI/2);const p=g.attributes.position,cc=new Float32Array(p.count*3),C=col(c).multiplyScalar(k);
    for(let i=0;i<p.count;i++){const X=p.getX(i)+x,Z=p.getZ(i)+z,hk=ss(1.6,2.3,dist(X,Z,HUT));p.setXYZ(i,X,groundY(X,Z)+.04,Z);cc[i*3]=C.r*hk;cc[i*3+1]=C.g*hk;cc[i*3+2]=C.b*hk;} /* 집 벽 둘레는 비움(hk) — 땅 위 4cm 더하기 판이 벽 밑동을 밝게 칠해 띠가 튀어나와 보였다 */g.setAttribute('color',new THREE.BufferAttribute(cc,3));return g;});
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
const GATHER={on:false,until:0,spots:[[MORTAR[0]+.55,MORTAR[1]+1.05],[MORTAR[0]+1.2,MORTAR[1]-.15],[MORTAR[0]+.95,MORTAR[1]+.75]]}; /* 절구 건너편(원더룹 맞은편) — 찧는 동안 사선 카메라 앞을 가리지 않게 */
const BUN=[{id:'kongkong',name:'콩콩',fur:'#d8d8e0',scarf:'#ff9eb3',way:[[-.6,4.2],[1.0,1.8],[3.2,1.6],[2.6,3.4]],line:'할아버지 지도에 우리 집도 있어!'},
  {id:'mongsil',name:'몽실',fur:'#ece4d8',scarf:'#9bd46b',way:[[3.0,11.8],[1.2,13.0],[-.6,12.0],[1.8,10.9]],line:'여기선 톡 뛰면 한참 동안 떠 있어. 같이 뛰어 볼래?'},
  {id:'bosul',name:'보슬',fur:'#cdc6dc',scarf:'#7fb6e8',way:[[-5.6,8.6],[-4.2,10.8],[-1.8,12.2],[-6.4,11.2]],line:'할아버지 망원경으로 보면 목성 줄무늬가 다 보여!'}];
const bunBlob=blobMany(BUN.length+1);if(bunBlob){bunBlob.frustumCulled=false;root.add(bunBlob);keep.push(bunBlob);}
const bunnies=BUN.map((b,i)=>{const m=makeBunny(b.fur,b.scarf);const [x,z]=b.way[0];m.root.position.set(x,groundY(x,z),z);root.add(m.root);keep.push(m.root);
  const st={i:0,t:0,wait:RR(.5,2.5),from:[x,z],to:null,ry:0};
  G.dialog.npc({id:'bun-'+b.id,name:'아기 토끼 '+b.name,root:m.root,bubbleY:.92,talkR:1.4,variants:[{when:()=>!GATHER.on,lines:[b.line]}]}); /* 망원경·절구에서 조금 떨어져 뛰놀고(가까우면 E가 '말 걸기'로 먼저 가서 체험이 안 됐다), 떡방아 구경 중엔 말 걸 상대가 아님 */return {...b,m,st};});
function tickBunnies(dt,t,P){
  if(WAVE.on&&P){bunnies.forEach((b,i)=>{const r=b.m.root,a=i*2.1+.6,x=BOBO[0]+Math.cos(a)*1.5,z=BOBO[1]+Math.sin(a)*1.5,hop=Math.abs(Math.sin(t*4.2+i*1.7)); // 별똥별 타고 가는 원더룹에게: 할아버지 둘레에서 통통 뛰며 몸을 좌우로 흔듦(손 흔들기 — 토끼는 팔이 따로 없다)
      r.position.set(x,groundY(x,z)+hop*.45,z);const ry=Math.atan2(wd(P.x-x),wd(P.z-z));b.st.ry+=Math.atan2(Math.sin(ry-b.st.ry),Math.cos(ry-b.st.ry))*Math.min(1,dt*4);r.rotation.y=b.st.ry;
      b.m.squash(hop>.92?(hop-.92)/.08*.5:0,t);r.rotation.z=Math.sin(t*6+i)*.18;b.st.from=[x,z];b.st.to=null;});return;}
  bunnies.forEach((b,i)=>{const s=b.st,r=b.m.root,gs=GATHER.on&&GATHER.spots[i],near=!gs&&P&&dist(P.x,P.z,[r.position.x,r.position.z])<2.4;
  if(!s.to&&gs){const dx=gs[0]-s.from[0],dz=gs[1]-s.from[1],d=Math.hypot(dx,dz); // 떡방아 구경: 절구 둘레 자리로 둥실둥실 모여 절구를 봄
    if(d>.3){const n=Math.max(1,Math.ceil(d/2.1));s.to=[s.from[0]+dx/n,s.from[1]+dz/n];s.goal=gs;s.t=0;s.ry=Math.atan2(dx,dz);}
    else{const a=Math.atan2(MORTAR[0]-s.from[0],MORTAR[1]-s.from[1]);s.ry+=Math.atan2(Math.sin(a-s.ry),Math.cos(a-s.ry))*Math.min(1,dt*4);r.position.set(s.from[0],groundY(...s.from)+Math.abs(Math.sin(t*5+i))*.06,s.from[1]);b.m.squash(0,t);}}
  else if(!s.to){if(near){const a=Math.atan2(wd(P.x-r.position.x),wd(P.z-r.position.z));s.ry+=Math.atan2(Math.sin(a-s.ry),Math.cos(a-s.ry))*Math.min(1,dt*4);}
    else{s.wait-=dt;if(s.wait<0){s.i=(s.i+1)%b.way.length;const w=b.way[s.i],dx=w[0]-s.from[0],dz=w[1]-s.from[1],d=Math.hypot(dx,dz),n=Math.max(1,Math.ceil(d/2.1));
      s.to=[s.from[0]+dx/n,s.from[1]+dz/n];s.goal=w;s.t=0;s.ry=Math.atan2(dx,dz);}}
    r.position.set(s.from[0],groundY(...s.from)+Math.abs(Math.sin(t*2.2+i))*.02,s.from[1]);b.m.squash(0,t);}
  else{s.t+=dt;const u=Math.min(1,s.t/1.1),x=s.from[0]+(s.to[0]-s.from[0])*u,z=s.from[1]+(s.to[1]-s.from[1])*u;r.position.set(x,groundY(x,z)+Math.sin(u*PI)*.55,z);b.m.squash(u,t);
    if(u>=1){s.from=s.to;const g=s.goal,rem=Math.hypot(g[0]-s.from[0],g[1]-s.from[1]);if(rem>.2&&!near){const dx=g[0]-s.from[0],dz=g[1]-s.from[1],n=Math.max(1,Math.ceil(rem/2.1));s.to=[s.from[0]+dx/n,s.from[1]+dz/n];s.t=0;}else{s.to=null;s.wait=RR(1.2,3.4);}}}
  r.rotation.y=s.ry;if(bunBlob)bunBlob.set(i,r.position.x,groundY(r.position.x,r.position.z),r.position.z,.32);});
  if(bunBlob)bunBlob.set(BUN.length,bobo.root.position.x,groundY(bobo.root.position.x,bobo.root.position.z),bobo.root.position.z,.42);}
/* ── 톱니 메뉴 '행성 반지름' 막대(?debug·한 파일 개발자판 — 걷기 속도 막대 옆, 2026-11-08): 12~40m, 놓으면 이 기기에 기억('wl-space-R')하고 다시 연다(배치를 새 크기로 다시 펼침).
   한 바퀴 걸리는 시간(걷기 3.78m/초)을 같이 보여 줌 */
const radBox=(()=>{const after=document.getElementById('spdBox');if(!after)return null;const d=document.createElement('div');d.className='spdBox';d.id='planetRBox';
  d.innerHTML='<label>행성 반지름 <input type="range" min="12" max="40" step="1"></label><output></output><button type="button">기본값</button>';
  const inp=d.querySelector('input'),out=d.querySelector('output'),show=v=>{out.textContent=`${v}m · 한 바퀴 약 ${Math.round(2*PI*v/3.78)}초`;};inp.value=R;show(R);
  const go=v=>{try{if(v==null)localStorage.removeItem('wl-space-R');else localStorage.setItem('wl-space-R',String(v));}catch(e){}location.reload();};
  inp.addEventListener('input',()=>show(+inp.value));inp.addEventListener('change',()=>go(+inp.value));d.querySelector('button').addEventListener('click',()=>go(null));
  after.after(d);return d;})();
/* ── 망원경 체험(마을의 작은 천문대 망원경, 2026-11-08): 망원경 앞에서 '살펴보기' → 화면이 동그란 망원경 시야로(HTML 캔버스 — 3D 그리기 0회),
   목성이 크게: 줄무늬 그림(하늘 목성과 같은 jupiterMap)을 구처럼 감아 천천히 돌림(줄무늬가 흐름), 붉은 폭풍이 보이게 시작. 보름 할아버지 한마디(STAGE 4 복선).
   화면을 누르거나 아무 키나 누르면 바로 나옴. 처음 한 번 보면 발견 +1(비밀 카드 — 지식 한 줄), 다시 볼 수 있음 */
const SCOPE_EYE=[SCOPE[0]+.25,SCOPE[1]+.5];
const scopeMark=new THREE.Object3D();scopeMark.position.set(SCOPE_EYE[0],groundY(...SCOPE_EYE)+.8,SCOPE_EYE[1]);root.add(scopeMark);
const DISC={cave:'secret:'+WID+':icecave',scope:'secret:'+WID+':telescope'},discN=()=>Object.values(DISC).filter(k=>F[k]).length,DISC_TOTAL=Object.keys(DISC).length;
let scopeEl=null;
function scopeOpen(){if(scopeEl)return;const C=G.view.camera;G.core.block('scope',true);popShown('scope',true);G.sound.sfx('ui-open');
  const el=document.createElement('div');el.id='wlScope';el.setAttribute('role','dialog');el.setAttribute('aria-label','망원경으로 본 목성');
  el.innerHTML='<div class="lens"><canvas></canvas></div><div class="say"><b>보름 할아버지</b><p></p></div><p class="tip">화면을 누르면 망원경에서 나와요</p>';
  if(!document.querySelector('style[data-wl="scope"]')){const st=document.createElement('style');st.dataset.wl='scope';st.textContent=`
#wlScope{position:fixed;inset:0;z-index:40;background:radial-gradient(circle at 50% 46%,#120c26 0,#07050f 70%);display:grid;place-items:center;animation:wlScIn .5s ease both;touch-action:none;cursor:pointer}
#wlScope .lens{width:min(84vw,70vh);aspect-ratio:1;border-radius:50%;overflow:hidden;box-shadow:0 0 0 10px #b8893e,0 0 0 16px #6e4630,0 0 60px 10px rgba(150,120,255,.25),inset 0 0 40px 18px rgba(8,4,20,.85);animation:wlScLens .7s cubic-bezier(.2,1.2,.4,1) both}
#wlScope canvas{width:100%;height:100%;display:block}
#wlScope .say{position:absolute;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 3.2rem);transform:translateX(-50%);width:min(92vw,560px);background:rgba(46,32,48,.96);color:#fbe9d8;border-radius:16px;padding:.9rem 1.1rem .8rem;font-family:"Gowun Dodum",sans-serif;font-size:1.02rem;line-height:1.5;box-sizing:border-box;word-break:keep-all}
#wlScope .say b{position:absolute;top:-.8rem;left:1rem;background:#f2b63c;color:#3e2834;font-family:"Jua",sans-serif;font-weight:400;padding:.12rem .7rem;border-radius:999px;font-size:.92rem}
#wlScope .say p{margin:.15rem 0 0}
#wlScope .tip{position:absolute;bottom:calc(env(safe-area-inset-bottom,0px) + .8rem);left:0;right:0;text-align:center;color:rgba(251,233,216,.6);font:.85rem "Gowun Dodum",sans-serif;margin:0}
@keyframes wlScIn{from{opacity:0}}@keyframes wlScLens{from{transform:scale(.6);opacity:0}}
@media (prefers-reduced-motion: reduce){#wlScope,#wlScope .lens{animation:none}}`;document.head.appendChild(st);}
  document.body.appendChild(el);scopeEl=el;const line='저 줄무늬 행성 보이지? 저기가 우리가 마지막에 갈 곳이란다.';
  {const pEl=el.querySelector('.say p');let i=0;const iv=setInterval(()=>{i++;pEl.textContent=line.slice(0,i);if(i>=line.length)clearInterval(iv);},36);el._iv=iv;G.core.cue&&G.core.cue({kind:'line',who:'보름 할아버지',text:line,dur:4});}
  const cv=el.querySelector('canvas'),g=cv.getContext('2d'),src=jup.U.uMap.value.image,stars=[];{const r=srand(77);for(let i=0;i<90;i++)stars.push([r(),r(),.4+r()*1.4,r()]);}
  let u0=-.03,last=performance.now(),open=performance.now(); // 붉은 폭풍(그림 u .17)이 가운데 조금 왼쪽에서 시작
  const draw=now=>{if(!scopeEl)return;const dt=Math.min(.05,(now-last)/1000);last=now;u0-=dt*.0045; // 천천히 돌아 줄무늬가 흐름
    const W=cv.clientWidth*Math.min(2,devicePixelRatio||1)|0;if(cv.width!==W){cv.width=cv.height=W;}const n=cv.width,cx=n/2,cy=n/2,r=n*.43;
    g.fillStyle='#0d0920';g.fillRect(0,0,n,n);stars.forEach(([x,y,s,ph])=>{g.globalAlpha=.35+.35*Math.sin(now/900+ph*9);g.fillStyle='#fff6e6';g.fillRect(x*n,y*n,s*n/400,s*n/400);});g.globalAlpha=1;
    // 구처럼 감기: 줄마다(위도) 반폭을 줄이고, 경도 칸마다 그림을 sin으로 눌러 붙임
    const SW=src.width,SH=src.height,rows=Math.max(80,r|0),cols=16;
    for(let k=0;k<rows;k++){const y0=-r+2*r*k/rows,y1=-r+2*r*(k+1)/rows,ym=(y0+y1)/2,w=Math.sqrt(Math.max(0,r*r-ym*ym));if(w<1)continue;
      const lat=Math.asin(Math.max(-1,Math.min(1,ym/r))),sy=(lat/PI+.5)*SH;
      for(let c=0;c<cols;c++){const l0=-PI/2+PI*c/cols,l1=l0+PI/cols,x0=w*Math.sin(l0),x1=w*Math.sin(l1);let su=((u0+(l0+PI/2)/(2*PI))%1+1)%1*SW;const sw=SW/(2*cols);
        if(su+sw>SW)su=SW-sw;g.drawImage(src,su,Math.max(0,Math.min(SH-1,sy-.5)),sw,1,cx+x0,cy+y0,x1-x0+.6,y1-y0+.6);}}
    // 입체: 왼쪽 위 해 쪽 밝게, 가장자리 어둡게, 하늘과 만나는 경계 연보라(하늘 목성과 같은 원칙)
    const hl=g.createRadialGradient(cx-r*.35,cy-r*.4,r*.1,cx-r*.2,cy-r*.2,r*1.15);hl.addColorStop(0,'rgba(255,248,230,.18)');hl.addColorStop(.55,'rgba(255,248,230,0)');hl.addColorStop(.85,'rgba(60,30,90,.22)');hl.addColorStop(1,'rgba(40,20,70,.55)');
    g.fillStyle=hl;g.beginPath();g.arc(cx,cy,r,0,PI*2);g.fill();
    g.strokeStyle='#0d0920';g.lineWidth=Math.max(3,n*.008);g.beginPath();g.arc(cx,cy,r+g.lineWidth*.45,0,PI*2);g.stroke(); // 줄마다 그린 가장자리 계단을 덮음
    const rim=g.createRadialGradient(cx,cy,r*.92,cx,cy,r*1.12);rim.addColorStop(0,'rgba(190,170,255,0)');rim.addColorStop(.4,'rgba(190,170,255,.35)');rim.addColorStop(1,'rgba(190,170,255,0)');g.fillStyle=rim;g.fillRect(0,0,n,n);
    requestAnimationFrame(draw);};
  requestAnimationFrame(draw);
  const close=e=>{if(performance.now()-open<350)return;if(e&&e.type==='keydown'&&e.repeat)return;scopeClose();};el.addEventListener('pointerdown',close);addEventListener('keydown',close,true);el._close=close;}
function scopeClose(){const el=scopeEl;if(!el)return;scopeEl=null;clearInterval(el._iv);removeEventListener('keydown',el._close,true);el.remove();popShown('scope',false);G.core.block('scope',false);G.sound.sfx('ui-click');
  if(!F[DISC.scope]){G.state.setFlag(DISC.scope,true);G.react.react('awe',{sound:'card-secret'});
    G.ui.secret({kicker:'새 발견',title:'망원경으로 본 목성',text:'목성의 붉은 폭풍은 지구보다 커요. 그런데 조금씩 작아지고 있대요.',count:`발견한 비밀 ${discN()}/${DISC_TOTAL}`});}}
G.interact.add({root:scopeMark,at:[SCOPE_EYE[0]+.35,SCOPE_EYE[1]+.75],face:SCOPE_EYE,label:'살펴보기',action:'들여다보기',dur:.9,near:1.8,once:false,onDone:()=>scopeOpen()});
/* ── 떡방아 체험(마을 구석 절구, 2026-11-08): 절구 앞에서 '찧기' → 원더룹이 두 손으로 떡메를 작게 들어 각도로 내려침(아래 '떡메 찧기'), 맞으면 떡이 말랑하게 눌렸다 출렁, 세 번 찧으면 떡 완성.
   찧을 때마다 떡 조각·가루가 둥실 떠올랐다가 아주 천천히 내려옴(낮은 중력 — 위로 0.8~1.4m/초, 중력 0.2m/초²: 몇 초 동안 떠 있음).
   아기 토끼들이 절구 둘레로 모여 구경하고 한마디씩. 완성되면 가방에 '달떡'(세계 items — bagOnly), 보름 할아버지 한마디. 실패·서두름 없음, 다시 찧을 수 있음(달떡은 한 번) */
/* 떡메 찧기(2026-11-08 다시 — 두 손으로 작게 들어 각도로 내려침): 원더룹 동작은 07 '떡메 찧기'(잡기 → 짧게 들기 → 빠르게 내려침 → 잠깐 멈춤 → 원래 자세),
   떡메는 매 프레임 원더룹 뼈가 움직인 뒤(lateUpdate) 두 손 자리에 맞춤: 원점 = 오른손(자루 끝), 자루 방향 = 오른손 → 왼손.
   떡메 머리는 자루에 비스듬히 붙어 있어(PHI) 내려친 순간(자루가 약 20° 위로) 머리 아랫면이 떡을 위에서 똑바로 누름. 원더룹이 선 자리 POUND_D = 그 순간 머리가 떡 위에 오는 거리.
   찧기 사이에는 잡은 채 기다림(07 '떡메 들기'), 2.4초 쉬거나 걸으면 내려놓음(절구 옆에 기대 세움). 찧는 동안 카메라는 원더룹 앞쪽 45° 사선(view.hold) → 끝나면 원래 카메라 */
const POUND_LH=.56,POUND_PHI=Math.asin((.63-.44)/.56),POUND_D=.17+.56*Math.cos(POUND_PHI); /* 07 POUND H2: 오른손 높이 .44 · 앞 .17, 머리 가운데 높이 .63(떡 꼭대기 .52 + 머리 반 .12 − 눌림 .01) */
const CAKE_KEY='item:'+WID+':dalddeok',MSTAND=(()=>{const dx=-.78,dz=-.32,l=Math.hypot(dx,dz);return [MORTAR[0]+dx/l*POUND_D,MORTAR[1]+dz/l*POUND_D];})();
const HEAD_AX=new THREE.Vector3(0,Math.sin(POUND_PHI),Math.cos(POUND_PHI)),HEAD_C=new THREE.Vector3(0,POUND_LH,0);
const pestle=new THREE.Group();{const m=sbMat('#ffffff');m.vertexColors=true;const ps=[];
  put(new THREE.CylinderGeometry(.022,.026,POUND_LH+.08,8).translate(0,(POUND_LH-.08)/2,0),woodD,{},ps);
  put(new THREE.CylinderGeometry(.075,.075,.24,12).rotateX(PI/2-POUND_PHI).translate(0,POUND_LH,0),wood,{},ps);
  [-.105,.105].forEach(e=>put(new THREE.TorusGeometry(.075,.011,5,14).rotateX(-POUND_PHI).translate(0,POUND_LH+e*HEAD_AX.y,e*HEAD_AX.z),woodD,{},ps));
  const me=new THREE.Mesh(mergeGeometries(ps),m);me.castShadow=true;pestle.add(me);root.add(pestle);keep.push(pestle);}
/* 절구 속 떡: 따로 한 덩어리 — 맞으면 말랑하게 눌렸다가 출렁이며 돌아옴(용수철, tech-lab squishy-test 방식: 세기 160·감쇠 7, 눌리면 옆으로 퍼짐 xz = 1/√y) */
const CAKE_Y=groundY(...MORTAR)+.46,CAKE_TOP=CAKE_Y+.06;
const cake=new THREE.Mesh(new THREE.SphereGeometry(.12,12,7,0,PI*2,0,PI/2),sbMat('#fbf8f0'));cake.position.set(MORTAR[0],CAKE_Y,MORTAR[1]);cake.scale.set(1,.5,1);cake.castShadow=cake.receiveShadow=true;root.add(cake);keep.push(cake);
const CSQ={x:0,v:0,k:160,c:7,tx:0,tv:0,tz:0,tzv:0};
function tickCakeSquish(dt){for(let s=0;s<2;s++){const h=dt/2;CSQ.v+=(-CSQ.k*CSQ.x-CSQ.c*CSQ.v)*h;CSQ.x+=CSQ.v*h;CSQ.tv+=(-90*CSQ.tx-5*CSQ.tv)*h;CSQ.tx+=CSQ.tv*h;CSQ.tzv+=(-90*CSQ.tz-5*CSQ.tzv)*h;CSQ.tz+=CSQ.tzv*h;}
  const q=Math.max(-.35,Math.min(.45,CSQ.x)),y=1-q,xz=1/Math.sqrt(Math.max(.3,y));cake.scale.set(xz,.5*y,xz);cake.rotation.set(CSQ.tz,0,-CSQ.tx);}
const PEST={rest:{p:new THREE.Vector3(MORTAR[0]+.42,groundY(...MORTAR),MORTAR[1]+.18),d:new THREE.Vector3(-.22,.95,-.08).normalize()},k:0,hit:false,n:0,idle:9,hits:[],last:null};
PEST.rest.q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),PEST.rest.d);PEST.rest.o=PEST.rest.p.clone().addScaledVector(PEST.rest.d,.08); /* 자루 끝이 땅에 닿게 */
const _hR=new THREE.Vector3(),_hL=new THREE.Vector3(),_px=new THREE.Vector3(),_py=new THREE.Vector3(),_pz=new THREE.Vector3(),_pm=new THREE.Matrix4(),_pqH=new THREE.Quaternion(),_ph=new THREE.Vector3(),_up=new THREE.Vector3(0,1,0);
let foreR=null,foreL=null;
function poundingNow(W){const A=W&&W.userData.action;return A==='떡메 찧기'||A==='떡메 들기';}
function lateUpdate(dt,t){const W=U0();if(!W)return;const U=W.userData;if(ride)ride.late(dt,t);
  if(!foreR){foreR=W.getObjectByName('forearm.R');foreL=W.getObjectByName('forearm.L');}
  PEST.idle+=dt;
  // 찧기 사이 잡고 기다리다가 — 2.4초 쉬거나 걷기 시작하면 내려놓음
  if(U.action==='떡메 들기'){const P=W.position,lp=PEST.last;if(PEST.idle>2.4||(lp&&Math.hypot(P.x-lp.x,P.z-lp.z)>.02)||(U.isWalking&&U.isWalking())){U.action='서기';U.at=0;}}
  if(PEST.last)PEST.last.copy(W.position);else PEST.last=W.position.clone();
  const on=poundingNow(W);PEST.k+=((on?1:0)-PEST.k)*Math.min(1,dt*(on?9:7));const k=PEST.k;
  if(k>.001&&foreR){W.updateMatrixWorld(true);foreR.localToWorld(_hR.set(0,-.19,.03));foreL.localToWorld(_hL.set(0,-.19,.03));
    _py.subVectors(_hL,_hR).normalize();_pz.copy(_up).addScaledVector(_py,-_py.dot(_up)).normalize();_px.crossVectors(_py,_pz);_pm.makeBasis(_px,_py,_pz);_pqH.setFromRotationMatrix(_pm);
    pestle.position.copy(PEST.rest.o).lerp(_hR,k);pestle.quaternion.copy(PEST.rest.q).slerp(_pqH,k);}
  else{pestle.position.copy(PEST.rest.o);pestle.quaternion.copy(PEST.rest.q);}
  // 내려친 순간: 떡메 머리 아랫면이 떡 꼭대기에 닿으면(또는 동작이 그 순간을 지나면) 한 번 — 떡이 눌리고 조각·가루가 둥실
  if(U.action==='떡메 찧기'&&!PEST.hit&&U.at>.5&&U.at<.95&&k>.9){pestle.updateMatrixWorld(true);_ph.copy(HEAD_C).addScaledVector(HEAD_AX,-.12);pestle.localToWorld(_ph);
    if(_ph.y<=CAKE_TOP+.012||U.at>.68){PEST.hit=true;PEST.hits.push({dy:+(_ph.y-CAKE_TOP).toFixed(3),dxz:+Math.hypot(_ph.x-MORTAR[0],_ph.z-MORTAR[1]).toFixed(3),at:+U.at.toFixed(2)});
      CSQ.v+=4.2;CSQ.tv+=(Math.random()-.5)*1.2;CSQ.tzv+=(Math.random()-.5)*1.2;pound();}}
  tickCakeSquish(dt);}
/* 찧는 동안 카메라: 원더룹 앞쪽 45° 사선(지금 카메라에 가까운 쪽)으로 부드럽게 — 원더룹 얼굴 3/4와 떡메·절구가 함께 보임. 찧기를 마치고 떡메를 내려놓으면 원래 카메라로(view.hold — 화면을 만지면 바로 플레이어 것) */
let poundCam=null;
function poundCamStart(){const W=U0(),cam=G.view.camera;if(!W||!cam)return;if(poundCam&&G.view.req&&G.view.req.fn===poundCam.fn)return;
  const P=W.position,ry=W.rotation.y,cp=cam.position,side=[1,-1].map(s=>{const a=ry+s*PI/4;return {a,d:Math.hypot(P.x+Math.sin(a)*3-cp.x,P.z+Math.cos(a)*3-cp.z)};}).sort((p,q)=>p.d-q.d)[0];
  const pc={a:side.a,end:0};pc.fn=()=>{const W=U0();if(!W)return null;if(!poundingNow(W)){pc.end+=1/60;if(pc.end>.1){if(poundCam===pc)poundCam=null;return null;}}else pc.end=0;
    const k=cam.aspect<1?Math.min(2,1.25/cam.aspect):1,P=W.position,mx=(P.x+MORTAR[0])/2,mz=(P.z+MORTAR[1])/2,d=3.5*k;
    const at=bentPos({x:mx*.7+P.x*.3,y:P.y+.68-.32*(k-1),z:mz*.7+P.z*.3}) /* 세로 화면은 보는 점을 낮춰 원더룹·절구를 화면 위쪽에(아래는 대사창·조이스틱) */,from=bentPos({x:P.x+Math.sin(pc.a)*d,y:P.y+1.3+.4*(k-1),z:P.z+Math.cos(pc.a)*d});
    return {at:[at.x,at.y,at.z],from:[from.x,from.y,from.z]};};
  poundCam=pc;G.view.hold(pc.fn);}
/* 떡 조각(인스턴스 하나)·가루(점 하나): 찧을 때만 보임 */
const BITS=14,FL=MOB?28:44;
const bitIM=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.055,1),(()=>{const m=sbMat('#ffffff');return m;})(),BITS);bitIM.count=BITS;bitIM.visible=false;bitIM.frustumCulled=false;root.add(bitIM);keep.push(bitIM);
{const c=new THREE.Color();for(let i=0;i<BITS;i++)bitIM.setColorAt(i,c.set(i%4===0?'#f7dbe4':i%5===0?'#e2efcf':'#fbf8f0'));}
const flGeo=new THREE.BufferGeometry(),flPos=new Float32Array(FL*3),flCol=new Float32Array(FL*3);flGeo.setAttribute('position',new THREE.BufferAttribute(flPos,3));flGeo.setAttribute('color',new THREE.BufferAttribute(flCol,3));
const flour=new THREE.Points(flGeo,new THREE.PointsMaterial({size:.13,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,map:dotTex})); /* 더하기 섞기 + 동그란 점: 옅어지면 그냥 사라짐(보통 섞기는 까만 네모가 됐다) */
flour.visible=false;flour.frustumCulled=false;root.add(flour);keep.push(flour);
const BIT=[],FLO=[];let bitHead=0,floHead=0;for(let i=0;i<BITS;i++)BIT.push({p:new THREE.Vector3(0,-9,0),v:new THREE.Vector3(),a:0,s:1,r:0});for(let i=0;i<FL;i++)FLO.push({p:new THREE.Vector3(0,-9,0),v:new THREE.Vector3(),a:0});
function pound(){const my=groundY(...MORTAR),o=new THREE.Vector3(MORTAR[0],my+.5,MORTAR[1]);G.sound.sfx('event-tok');G.sound.sfx('step');
  for(let k=0;k<5;k++){const b=BIT[bitHead++%BITS],a=Math.random()*PI*2,sp=.15+Math.random()*.35;b.p.copy(o);b.v.set(Math.cos(a)*sp,.8+Math.random()*.6,Math.sin(a)*sp);b.a=1;b.s=.7+Math.random()*.7;b.r=Math.random()*6;}
  for(let k=0;k<(MOB?12:18);k++){const f=FLO[floHead++%FL],a=Math.random()*PI*2,sp=.1+Math.random()*.45;f.p.copy(o);f.v.set(Math.cos(a)*sp,.5+Math.random()*.7,Math.sin(a)*sp);f.a=1;}}
const _bm=new THREE.Matrix4(),_bq=new THREE.Quaternion(),_be=new THREE.Euler(),_bs=new THREE.Vector3();
function tickBits(dt){let any=false;const GR=.2; // 낮은 중력(지구 9.8의 약 2%) — 아주 천천히 내려옴
  BIT.forEach((b,i)=>{if(b.a>0){b.v.y-=GR*dt;b.p.addScaledVector(b.v,dt);b.r+=dt*1.2;const gy=groundY(b.p.x,b.p.z)+.04;if(b.p.y<gy){b.p.y=gy;b.v.set(0,0,0);b.a-=dt*.5;}any=true;}
    _be.set(b.r,b.r*.7,0);_bq.setFromEuler(_be);_bs.setScalar(b.a>0?b.s:0);_bm.compose(b.p,_bq,_bs);bitIM.setMatrixAt(i,_bm);});
  FLO.forEach((f,i)=>{if(f.a>0){f.v.y-=GR*.6*dt;f.v.multiplyScalar(1-dt*.15);f.p.addScaledVector(f.v,dt);f.a-=dt*.11;if(f.p.y<groundY(f.p.x,f.p.z)+.03)f.a=0;any=true;}
    flPos.set([f.p.x,f.p.y,f.p.z],i*3);const k=Math.max(0,f.a);flCol.set([k,k*.98,k*.94],i*3);});
  bitIM.visible=flour.visible=any;if(any){bitIM.instanceMatrix.needsUpdate=true;flGeo.attributes.position.needsUpdate=true;flGeo.attributes.color.needsUpdate=true;}}
const mortarMark=new THREE.Object3D();mortarMark.position.set(MORTAR[0],groundY(...MORTAR)+.5,MORTAR[1]);root.add(mortarMark);
const BUN_SAY=[['콩콩','와, 떡이 날아다녀!'],['몽실','천천히 떨어져서 받아먹을 수도 있겠다!'],['보슬','콩! 하고 찧으니까 둥실 올라가!']];
const mortarIt=G.interact.add({root:mortarMark,at:MSTAND,face:MORTAR,label:'찧기',action:'떡메 찧기',dur:1.25,near:1.9,once:false,
  onStart:()=>{PEST.hit=false;PEST.idle=0;GATHER.on=true;GATHER.until=1e9;poundCamStart();},
  onDone:()=>{PEST.idle=0;PEST.n++;{const W=U0();if(W){W.userData.action='떡메 들기';W.userData.at=0;}} /* 다음 찧기까지 잡은 채 기다림 */const n=PEST.n;const say=BUN_SAY[(n-1)%3];G.dialog.say('아기 토끼 '+say[0],say[1],2.6);
    if(n<3){mortarIt.label=`찧기 (${n}/3)`;return;}
    mortarIt.label='찧기';PEST.n=0;st.cakeT=2.4;}});
function tickCake(dt){if(st.cakeT==null)return;st.cakeT-=dt;if(st.cakeT>0)return;st.cakeT=null;
  if(!F[CAKE_KEY]){G.state.setFlag(CAKE_KEY,true);G.react.react('joy');const it=(SPACE.items||[]).find(i=>i.id==='dalddeok');
    G.ui.itemCard({title:'달떡을 얻었어요!',text:'낮은 중력에서 찧은 쫀득한 달떡 — 가방에 넣었어요',icon:it&&it.icon?it.icon():null,sec:4,sound:'item-get'});}
  setTimeout(()=>G.dialog.say('보름 할아버지','옛날엔 나도 이걸로 떡을 찧었단다. 여기선 떡도 둥실둥실 날아다니지.',5),F[CAKE_KEY]?400:4200);
  setTimeout(()=>{GATHER.on=false;},9000);}
/* ── 하늘: 남보라 우주(공기가 없어 낮에도 까맣고 별) + 은하수, 하늘 그림판(anchor — 카메라를 늦게 따라오며 늘 화면에): 해·토성·큰 목성·성운·은하수 띠·별똥별 */
const key={top:'#151331',horizon:'#2b2560',hemi:'#c4c6e6',ground:'#56506e',hemiI:.52,sun:'#ffe8c4',sunI:.95,sunDir:[-6,-3.6,-9],fill:.24,fog:'#2e2a5c',fogNear:70,fogFar:150,stars:0,milky:1.1}; // 별은 아래 그림판 별(점 별·깜빡임·네 갈래 반짝이)이 맡는다 — 공용 하늘 별·첫별은 끔
const SK=G.sky.sky({parent:root,keys:[key,key,key],t:0,nStars:MOB?220:340,starSize:3,space:true});
const skyW=new THREE.Group();skyW.name='space-sky-world';root.add(skyW); // 원더룹을 따라다니는 세계 고정 하늘(낮은 별·오로라)
const anchor=new THREE.Group();anchor.name='space-sky-anchor';root.add(anchor); // 하늘 그림판(카메라 자리 + 늦게 따라오는 방향)
const D=90,aq=new THREE.Quaternion();let aqOn=false;
const bill=(tex,{op=1,add=false,order=-1,w=1,h=1}={})=>{const m=new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,depthTest:true,fog:false,opacity:op,blending:add?THREE.AdditiveBlending:THREE.NormalBlending});m.userData.noBend=true;
  const me=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);me.renderOrder=order;me.frustumCulled=false;me.userData.noMerge=true;anchor.add(me);return me;};
const sunG=bill(canvasTex(128,sunGlowArt),{add:true,order:-4.5,op:.85}); // 해 빛무리(더하기 섞기 — 보라 하늘 위로 은은하게 번짐)
const sunM=bill(canvasTex(256,sunArt),{order:-4}); // 크림빛 해(손그림 — 고르지 않은 가장자리·색연필 빗금) + 살구빛 빛무리
/* 목성·토성 = 로우폴리 구(2026-11-08 — 원판 그림은 진한 테두리 선 때문에 오려 붙인 스티커처럼 튀었다. 이 세계엔 선이 있는 물체가 없다):
   낮은 면 수의 구(면이 살짝 보이게 — 매끈한 법선과 면 법선을 섞음) + 줄무늬 그림(equirect) × 크레용 결(땅 위 물체와 같은 결),
   툰 3단 명암(해 쪽 밝게 — 그림자 면은 하늘 연보라로 물듦), 둘레로 갈수록 살짝 어둡게(가장자리 어두움), 해를 바라보는 쪽 가장자리에 아주 얇은 밝은 테,
   멀리 있는 느낌(하늘 보라 20% 섞고 대비를 조금 낮춤 — 앞쪽 바닥보다 한 단계 흐리게), 하늘과 만나는 경계엔 옅은 연보라 빛무리(더하기 섞기 판, 구가 가리는 안쪽은 안 보임).
   토성 고리: 몸통보다 살짝 어둡고 반투명한 여러 줄 띠(진짜 3D 고리 — 몸통 뒤로 지나가는 부분은 깊이로 가려짐), 고리가 몸통에 가는 그림자를 드리움(셰이더에서 해 쪽으로 고리 면을 비춰 봄).
   그리기: 목성 2(구·빛무리) · 토성 3(구·고리·빛무리). 크기·자리는 그림판 LAYOUT(예전 원판과 같은 화면 자리·크기) */
const SKYC=new THREE.Color('#6b5fb4');
const ORB_GLSL='float ringA(float r){if(r<1.32||r>2.3)return 0.;float u=(r-1.32)/.98;float a=u<.46?.55:u<.53?.08:u<.88?.82:u<.91?.1:.35;a*=.9+.1*sin(u*31.);return a*smoothstep(0.,.03,u)*smoothstep(1.,.95,u);}\n'; // 넓은 띠 셋(안쪽·가운데 진한 띠·옅은 바깥) + 틈 둘
const crayTex=(()=>{const m=sbMat('#ffffff');return m.map;})();
function orb({map,rep=[5,3],ring=false}){const g=new THREE.Group();anchor.add(g);g.frustumCulled=false;
  const U={uMap:{value:map},uCray:{value:crayTex},uRep:{value:new THREE.Vector2(...rep)},uL:{value:new THREE.Vector3(-1,.5,.6).normalize()},uSky:{value:SKYC},uRim:{value:new THREE.Color('#fff1cf')},
    uRn:{value:new THREE.Vector3(0,1,0)},uRing:{value:ring?1:0}};
  const body=new THREE.Mesh(new THREE.SphereGeometry(1,20,14),new THREE.ShaderMaterial({uniforms:U,fog:false,
    vertexShader:'varying vec3 vW,vN,vP;varying vec2 vUv;void main(){vUv=uv;vP=position;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vN=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*w;}',
    fragmentShader:'uniform sampler2D uMap,uCray;uniform vec2 uRep;uniform vec3 uL,uSky,uRim,uRn;uniform float uRing;varying vec3 vW,vN,vP;varying vec2 vUv;'+ORB_GLSL+
      'void main(){vec3 Nf=normalize(cross(dFdx(vW),dFdy(vW)));vec3 N=normalize(mix(normalize(vN),Nf,.32));vec3 V=normalize(cameraPosition-vW);'+
      'float d=dot(N,uL);float k=mix(.56,.8,smoothstep(-.14,0.,d));k=mix(k,1.,smoothstep(.36,.5,d));'+
      'vec3 base=texture2D(uMap,vUv).rgb*dot(texture2D(uCray,vUv*uRep).rgb,vec3(.3333));vec3 col=base*k+uSky*(1.-k)*.45;'+
      'if(uRing>0.){float dn=dot(uL,uRn);if(abs(dn)>.02){float t=-dot(vP,uRn)/dn;if(t>0.){float a=ringA(length(vP+uL*t));col*=1.-a*.5;}}}'+ // 고리 그림자(해 쪽으로 고리 면을 비춰 봄)
      'float nv=max(dot(N,V),0.);col*=mix(.8,1.,pow(nv,.4));'+ // 가장자리 어두움
      'col=mix(col,uSky*1.3,smoothstep(.26,0.,nv)*.3);'+ // 하늘과 만나는 경계로 갈수록 연보라
      'col+=uRim*smoothstep(.16,.02,nv)*smoothstep(.05,.45,d)*.5;'+ // 해를 바라보는 쪽 가장자리 아주 얇은 밝은 테
      'float l=dot(col,vec3(.3,.59,.11));col=mix(vec3(l),col,.9);col=mix(col,uSky,.15);'+ // 멀리 있는 느낌: 하늘 보라 20%, 대비 조금 낮춤
      'gl_FragColor=vec4(col,1.);\n#include <colorspace_fragment>\n}'}));
  body.material.userData.noBend=true;body.frustumCulled=false;body.renderOrder=-6;body.userData.noMerge=true;g.add(body);
  const halo=new THREE.Mesh(new THREE.PlaneGeometry(2.6,2.6),new THREE.MeshBasicMaterial({map:haloTex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,opacity:.7}));
  halo.material.userData.noBend=true;halo.frustumCulled=false;halo.renderOrder=-4;halo.userData.noMerge=true;g.add(halo);
  let rg=null;if(ring){rg=new THREE.Mesh(new THREE.RingGeometry(1.32,2.3,96,1),new THREE.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,side:THREE.DoubleSide,fog:false,
      vertexShader:'varying vec3 vP,vW;void main(){vP=position;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
      fragmentShader:'uniform sampler2D uCray;uniform vec3 uL,uSky,uRn;varying vec3 vP,vW;'+ORB_GLSL+
        'void main(){float r=length(vP.xy);float a=ringA(r);if(a<.01)discard;float u=(r-1.32)/.98;'+
        'vec3 c=mix(vec3(.6,.44,.22),vec3(.7,.54,.3),smoothstep(.4,.7,u))*(.94+.06*sin(u*23.));c*=dot(texture2D(uCray,vP.xy*1.7).rgb,vec3(.3333));'+ // 몸통보다 살짝 어두운 금빛 띠 + 크레용 결
        'float lit=.85+.15*abs(dot(uRn,uL));c=c*lit;float l=dot(c,vec3(.3,.59,.11));c=mix(vec3(l),c,.9);c=mix(c,uSky,.22);'+
        'gl_FragColor=vec4(c,min(1.,a*1.15));\n#include <colorspace_fragment>\n}'}));
    rg.material.userData.noBend=true;rg.frustumCulled=false;rg.renderOrder=-5;rg.userData.noMerge=true;g.add(rg);}
  return {g,body,halo,ring:rg,U};}
const haloTex=canvasTex(128,(g,n)=>{const c=n/2,gr=g.createRadialGradient(c,c,0,c,c,c);gr.addColorStop(0,'rgba(190,170,255,0)');gr.addColorStop(.72,'rgba(190,170,255,0)');gr.addColorStop(.78,'rgba(196,178,255,.3)');gr.addColorStop(.9,'rgba(180,160,250,.12)');gr.addColorStop(1,'rgba(170,150,240,0)');g.fillStyle=gr;g.fillRect(0,0,n,n);});
const jup=orb({map:canvasTex(512,jupiterMap,256),rep:[6,3]});
const sat=orb({map:canvasTex(256,saturnMap,128),rep:[4,2],ring:true});
/* 화성(별똥별 비행 끝에만 — 점점 커짐): 같은 로우폴리 구 + 녹슨 주황 그림(어두운 무늬·흰 극관) */
const mars=orb({map:canvasTex(256,marsMap,128),rep:[4,2]});mars.g.visible=false;
/* 토성 고리 기울기(그림판 자리 기준 — 화면에서 비스듬한 타원): 고리 면의 법선 */
{const n=new THREE.Vector3(.16,.88,.45).normalize();sat.ring.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),n);sat.U.uRn.value.copy(n);}
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
const LAYOUT={sunG:[sunG,-.76,.8,.62,-.5,.86,.86],sun:[sunM,-.76,.8,.3,-.5,.86,.42],sat:[sat.g,-.12,.8,.2,.05,.9,.3],jup:[jup.g,.98,.5,1.05,1.05,.66,.78],neb:[neb,-.35,.62,1.3,-.2,.66,1.4],milky:[milkyB,.05,.7,1.0,0,.72,1.0]};
const sunView=new THREE.Vector3(),_od=new THREE.Vector3(); // 해 방향(세계, 카메라에서) — 먼지 역광
function tickAnchor(dt,cam){if(!cam)return;anchor.position.copy(cam.position);if(!aqOn){aq.copy(cam.quaternion);aqOn=true;}else aq.slerp(cam.quaternion,1-Math.exp(-dt*1.4));anchor.quaternion.copy(aq);
  const tv=Math.tan(cam.fov*PI/360),th=tv*cam.aspect,u=Math.min(tv,th),port=cam.aspect<1;
  for(const k in LAYOUT){const [m,x0,y0,s0,x1,y1,s1]=LAYOUT[k],x=port?x1:x0,y=port?y1:y0,s=port?s1:s0;m.position.set(x*th*D,y*tv*D,-D);m.quaternion.identity();
    const sz=s*2*u*D;if(k==='milky'){m.scale.set(sz*1.0,sz*1.0,1);m.rotation.z=port?-.55:-.22;}else if(k==='jup')m.scale.setScalar(sz*.46);else if(k==='sat')m.scale.setScalar(sz*.2);else m.scale.set(sz,sz,1);}
  /* 행성 빛 방향(세계): 그림판의 해 쪽(왼쪽 위) + 카메라 쪽을 조금 섞음 — 해가 거의 같은 거리에 있어 옆에서만 비추면 반쪽이 어두워 대비가 셌다 */
  for(const o of [jup,sat,mars]){_od.copy(sunM.position).sub(o.g.position).normalize();_od.z+=.85;o.U.uL.value.copy(_od.normalize()).applyQuaternion(aq);}
  sat.U.uRn.value.set(.16,.88,.45).normalize().applyQuaternion(aq);
  /* 별똥별 비행(FLY.k 0~1): 토성·목성이 커지며 옆으로 스쳐 지나가고(앞으로 갈 곳 미리 보기), 끝에 붉은 화성이 가운데 위에서 점점 커짐 */
  if(FLY.k>0){const k=FLY.k,e1=ss(.28,.82,k),e2=ss(.16,.7,k),put=(m,x,y,f)=>{m.position.set(x*th*D,y*tv*D,-D);m.scale.multiplyScalar(f);};
    {const Ls=LAYOUT.sat,x=port?Ls[4]:Ls[1],y=port?Ls[5]:Ls[2];put(sat.g,x+((port?-1.6:-1.5)-x)*e1,y+(.05-y)*e1,1+2.4*e1);}
    {const Lj=LAYOUT.jup,x=port?Lj[4]:Lj[1],y=port?Lj[5]:Lj[2];put(jup.g,x+((port?1.9:2.1)-x)*e2,y+(-.5-y)*e2,1+.6*e2);}
    const em=ss(.55,1,k);mars.g.visible=k>.52;if(mars.g.visible){mars.g.position.set(0,(.5-.38*em)*tv*D,-D*.95);mars.g.scale.setScalar(2*u*D*(.035+.62*em*em+1.1*ss(.9,1,k))*.46);}}
  else mars.g.visible=false;
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
const W0=P=>P; // 손 흔들기: 원더룹 자리(할아버지·토끼가 바라볼 곳)
function update(dt,t,env){const WL=U0();const cam=G.view.camera;tickAnchor(dt,cam);if(!WL)return;const U=WL.userData,P=WL.position;
  if(!st.culled){st.culled=true;root.traverse(o=>{o.frustumCulled=false;});U.wrapShift=wrapShift;}
  if(!F[K.cave]&&dist(P.x,P.z,CAVE)<1.5&&!G.ui.cardShown())caveSecret(); // 비밀: 얼음 동굴(놓쳐도 진행 영향 없음)
  bobo.tick(dt,t,st.hop,WAVE.on&&W0(P));tickSparks(t,P,cam);tickBunnies(dt,t,P);if(ride){ride.tick(dt,t);return;}tickBits(dt);tickCake(dt);
  skyW.position.set(P.x,0,P.z);tickWeather(dt,t,env&&env.weather);
  // 발자국: 땅을 밟고 걸을 때 0.42m마다 번갈아
  {const V=U.vert;if(V&&!V.air&&!U.riding){if(!fpLast)fpLast={x:P.x,z:P.z};const dx=wd(P.x-fpLast.x),dz=wd(P.z-fpLast.z),d=Math.hypot(dx,dz);if(d>.42&&d<3){stepPrint(P.x,P.z,Math.atan2(dx,dz));fpLast={x:P.x,z:P.z};}else if(d>=3)fpLast={x:P.x,z:P.z};}else fpLast=null;}
  if(!G.core||G.front.frontShown&&G.front.frontShown())return;
  /* 처음 조작을 넘겨받을 때 한 번: 카메라를 조금 낮춰 지평선이 화면 위쪽 3분의 1쯤(하늘 그림판이 원더룹 뒤로 보이게) — 1.2초에 걸쳐, 플레이어가 만지면 그만 */
  {const C=G.controls.input.cam;if(st.cam<1.2&&C&&C.on&&C.ready&&!G.view.aim&&!G.view.req){if(st.cam===0)st.camUser=C.user;if(C.user!==st.camUser)st.cam=9;else{st.cam+=dt;const goal=(cam.aspect<1?.58:.5)-(S-1)*.2; /* 지평선이 화면 위쪽 3분의 1(행성이 클수록 지평선이 덜 떨어져 조금 덜 내려다봄 — 24m: .42·세로 .5) */C.pitch+=(goal-C.pitch)*Math.min(1,dt*3);}}}
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
    if(dist(P.x,P.z,EXIT)<1.7){G.state.setFlag(K.clear,true);quest('',null);startRide(true);}}
  else{quest('',null);if(dist(P.x,P.z,EXIT)>3)st.exitOut=true;else if(st.exitOut&&dist(P.x,P.z,EXIT)<1.5&&!G.ui.cardShown())startRide(false);}} // 다시 들어서면 또 타고 감(화성으로)
/* ── 출구 → 별똥별 꼬리 타기(meteor-ride.js 맨 위 주석): 처음이면 'STAGE 1 완료!' 카드(그동안 서 있음) 뒤 연출.
   비행 길(별똥별 머리 자리): 출구 → 마을 위(약 17m — 보름 할아버지·아기 토끼가 손 흔듦) → 계속 오르며 행성이 작아짐(작은 행성 그림이 원더룹 높이만큼 아래로 — 위로 70m),
   하늘 그림판의 토성·목성이 옆으로 스쳐 지나가고(FLY.k), 끝에 붉은 화성이 커짐 → 화면 전환으로 화성(space-mars) */
let ride=null;const FLY={k:0},WAVE={on:false};
G.travel.prepare(SPACE.travel); // 이동 테마 파일을 미리 불러 둠(휴대폰에서 연출 시작이 늦지 않게)
function startRide(first){const W=U0();if(!W||ride||st.rideWait)return;const U=W.userData;st.exitOut=false;if(U.stopWalk)U.stopWalk();U.riding={y:W.position.y};st.rideWait=true;
  const go=()=>{st.rideWait=false;const P=W.position;
    // 마을 쪽을 보고 서서 시작(별똥별이 앞에서 내려옴)
    const vx=wd(VIL[0]-P.x),vz=wd(VIL[1]-P.z),vl=Math.hypot(vx,vz)||1,ux=vx/vl,uz=vz/vl;W.rotation.y=Math.atan2(ux,uz);
    const sx=P.x+ux*1.25,sz=P.z+uz*1.25,sy=P.y+2.9,y0=P.y;
    ride=departure({G,root,WL:W,groundY,mob:MOB,fly:13,
      path:u=>{const e1=ss(0,.5,u),e2=ss(.5,1,u),d=vl*1.15*e1+26*e2;return {x:sx+ux*d,y:y0+2.9+14*ss(0,.45,u)+56*Math.pow(ss(.4,1,u),1.3),z:sz+uz*d};},
      onWave:on=>{WAVE.on=on;if(on)placeBobo(BOBO);},
      onFly:u=>{FLY.k=u;if(u>.3&&!st.marsPre){st.marsPre=true;import('./mars.js').catch(()=>{});}}, // 화성 구역을 비행 중에 미리 불러 둠(넘어갈 때 기다리지 않게)
      /* 비행 끝: 우주 지도 장면(game/travel 공통 — 달 → 화성 발자국 점선·발견한 것·예고 한 줄, 약 3.6초) → 화성 대기로 들어섬(낮은 우웅 + 먼지구름 휙) →
         파스텔 먼지구름이 화면을 덮었다 걷힘(어두운 화면 없이 — 예전 ui.transition은 1초쯤 어두웠다) */
      onEnd:async()=>{RIDE.pending={from:'space-garden',scarf:true};const mp=await G.travel.mapFor(SPACE,'space-garden','space-mars',F);
        G.travel.arrive();const veil=dustVeil();await veil.cover(.75);
        try{if(window.wlZone)await window.wlZone.go('space-mars');}catch(e){console.error(e);}mp.remove();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));veil.clear(1.5);}});};
  if(first){G.react.react('hop');Promise.race([G.ui.itemCard({title:'STAGE 1 완료!',text:'회색 정원 탐험 완료 · 다음 목적지: 붉은 모래 언덕',icon:ICON_MAP(),sec:3.2,sound:'mission-clear',who:'완료'}),new Promise(r=>setTimeout(r,3600))]).then(()=>setTimeout(go,250));}
  else go();}
const ICON_MAP=()=>SPACE.icons.map();
// 비밀: 얼음 동굴(놓쳐도 진행 영향 없음)
function caveSecret(){G.state.setFlag(K.cave,true);G.react.react('awe',{sound:'card-secret'});
  G.ui.secret({kicker:'숨겨진 비밀',title:'그늘 분화구의 얼음 동굴',text:'햇빛이 한 줄기도 들지 않아 얼음이 녹지 않고 아주 오래오래 그대로 남은 곳이에요. 차갑게 반짝이는 얼음 결이 천장까지 자랐어요.',count:`발견한 비밀 ${discN()}/${DISC_TOTAL}`});}
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
  sunG.scale.multiplyScalar(1+.05*Math.sin(t*1.3));} // 빛무리가 천천히 숨쉼
function wrapShift(k,sh){if(fpLast)fpLast[k]+=sh;if(ride)ride.shift(k,sh);
  // 아기 토끼·할아버지는 마을 자리 그대로(원더룹이 이어 붙는 선을 넘으면 같은 자리가 L만큼 옮겨진 쪽에 그려진다 — 평평한 좌표는 그대로 둬도 wd로 거리 계산)
}
return {
  name:'회색 정원',kind:'outdoor',
  spots:{neck:NECK,rock:ROCK.c,rockR:ROCK.r,rockTop:ROCK_TOP,cave:CAVE,exit:EXIT,shade:SHADE.c,scope:[SCOPE_EYE[0]+.35,SCOPE_EYE[1]+.75],mortar:MSTAND,bobo:BOBO,R,hut:[HUT[0],HUT[1],groundY(...HUT),Math.atan2(VIL[0]-HUT[0],VIL[1]-HUT[1])],win:Math.atan2(VIL[0]-HUT[0],VIL[1]-HUT[1])-2*PI/14},
  ride:()=>ride,flyK:()=>FLY.k, /* 별똥별 꼬리 타기 확인(tools/space-meteor-rec.py) */
  poundInfo:()=>({hits:PEST.hits,stand:MSTAND,d:+POUND_D.toFixed(3),cakeTop:+CAKE_TOP.toFixed(3),squish:+CSQ.x.toFixed(3),head:(()=>{pestle.updateMatrixWorld(true);const h=HEAD_C.clone().addScaledVector(HEAD_AX,-.12);pestle.localToWorld(h);return h.toArray().map(n=>+n.toFixed(3));})()}), /* 떡방아 확인(tools/space-pound-rec.py) */ // 시험 도구가 읽는 자리(tools/space-stage1-test.py)
start:{compass:true},world:null,
  spawn:{x:SPAWN[0],z:SPAWN[1],ry:PI},
  areas,platforms,
  sun:ZSUN,lights:[lav],light,rim:.32,
  sky:SK,bend:{sphere:R,wrap:L},gravity:.38,jumpK:1.15,
  groundY,ground:[ground],keepOut:keep,mergeColors:true,music:null,
  update,lateUpdate,dispose(){scopeClose();if(ride){ride.dispose();ride=null;}if(radBox)radBox.remove();const W=G.mission.hero&&G.mission.hero();if(W&&W.userData.wrapShift===wrapShift)W.userData.wrapShift=null;},
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
/* 목성 줄무늬 그림(구에 감는 equirect 2:1): 밝은 크림 + 연한 주황 줄무늬(물결 경계·번짐) + 옅은 빗금. 붉은 폭풍은 광택 없는 산호빛 다홍 —
   또렷한 가장자리(선 없이 한 단계 진한 산호 띠) + 안쪽 소용돌이 빗금. 자리는 구에서 카메라를 보는 쪽 아래 왼쪽(u .17·위도 남쪽) */
function jupiterMap(g,w,h){const bands=['#f6ead2','#f2cba4','#f5e6cb','#edbd92','#f4e2c4','#eab48a','#f6e8cd','#f0c79f','#f5e4c6','#ecba90','#f6ead2'].map(c=>{const n=parseInt(c.slice(1),16),k=v=>Math.pow(v/255,1.45);return {r:k(n>>16&255),g:k(n>>8&255),b:k(n&255)};}); // 밝은 크림 + 연한 주황 — 지난번 확정한 색(선형 값을 화소에 쓴 진한 주황)과 sRGB 그대로(너무 옅음)의 사이 // 하늘 보라를 섞으면 분홍으로 기울어 조금 더 노랗게
  const img=g.createImageData(w,h),d=img.data,bh=h/bands.length,R=srand(5);const nz=[];for(let i=0;i<64;i++)nz.push(R());
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const xx=x/w*PI*2,yy=y+Math.sin(xx*3+y*.01)*bh*.2+Math.sin(xx*11+nz[(y>>2)&63]*6)*bh*.05,bi=yy/bh,i0=Math.max(0,Math.min(bands.length-1,Math.floor(bi))),i1=Math.min(bands.length-1,i0+1),f=bi-i0;
    const t=f<.78?0:Math.min(1,(f-.78)/.22),tt=t*t*(3-2*t),A=bands[i0],B=bands[i1],j=(nz[(x*7+y*13)&63]-.5)*.03,k=(y*w+x)*4;
    d[k]=Math.min(255,(A.r+(B.r-A.r)*tt+j)*255);d[k+1]=Math.min(255,(A.g+(B.g-A.g)*tt+j)*255);d[k+2]=Math.min(255,(A.b+(B.b-A.b)*tt+j)*255);d[k+3]=255;}
  g.putImageData(img,0,0);
  hatch(g,0,0,w,h,700,['#fffaf0','#fdeed6','#f3c9a2','#e8b088'],7,{len:[6,16],alpha:[.06,.14]});
  // 붉은 폭풍: 산호빛 다홍, 광택 없음, 또렷한 가장자리(한 단계 진한 산호 띠 — 검은 선 없음), 안쪽 소용돌이 빗금
  const sx=w*.17,sy=h*.6,rx=w*.034,ry=h*.038; // 예전 원판 그림의 폭풍과 같은 크기(구 둘레의 약 7%)
  g.beginPath();g.ellipse(sx,sy,rx*1.08,ry*1.1,0,0,PI*2);g.fillStyle='#d9614a';g.fill();
  g.beginPath();g.ellipse(sx,sy,rx,ry,0,0,PI*2);g.fillStyle='#e8775c';g.fill();
  g.save();g.beginPath();g.ellipse(sx,sy,rx,ry,0,0,PI*2);g.clip();g.lineCap='round';
  for(let i=0;i<16;i++){const k=i/16,a0=k*PI*2.6,rr=.25+.7*k;g.strokeStyle=i%2?'rgba(255,190,160,.45)':'rgba(196,78,58,.45)';g.lineWidth=1.6;g.beginPath();
    g.ellipse(sx,sy,rx*rr,ry*rr,0,a0,a0+1.6);g.stroke();}
  g.restore();}
/* 화성 그림(equirect): 녹슨 주황 + 어두운 무늬(손그림 얼룩) + 밝은 모래빛 + 위아래 흰 극관 + 빗금 */
function marsMap(g,w,h){g.fillStyle='#cf6a45';g.fillRect(0,0,w,h);const R=srand(23);
  for(let i=0;i<46;i++){const x=R()*w,y=h*(.2+R()*.6),r=w*(.02+R()*.07);g.globalAlpha=.25+R()*.3;g.fillStyle=R()<.6?'#9c4430':'#e4925f';g.beginPath();g.ellipse(x,y,r*1.6,r*.7,R()*.6-.3,0,PI*2);g.fill();}
  g.globalAlpha=1;g.fillStyle='#f6ece2';g.fillRect(0,0,w,h*.07);g.fillRect(0,h*.95,w,h*.05);
  hatch(g,0,0,w,h,420,['#f0a074','#b04e34','#fbe0c8'],31,{len:[5,13],alpha:[.07,.16]});}
/* 토성 줄무늬 그림(equirect): 금빛 몸통 + 옅은 줄무늬 + 빗금 */
function saturnMap(g,w,h){g.fillStyle='#efc979';g.fillRect(0,0,w,h);const R=srand(31);
  [[.28,'#e2bc78',5],[.42,'#f6e0ae',4],[.55,'#ddb26a',6],[.68,'#f3dba6',3],[.8,'#d9ad66',4]].forEach(([y,c,lw])=>{g.strokeStyle=c;g.lineWidth=lw;g.beginPath();for(let x=0;x<=w;x+=4){const yy=y*h+Math.sin(x/w*PI*6+y*9)*1.6;x?g.lineTo(x,yy):g.moveTo(x,yy);}g.stroke();});
  hatch(g,0,0,w,h,260,['#fff4d6','#c99a52'],33,{len:[4,10],alpha:[.08,.18],lw:[1,1.6]});}
/* 해: 크림빛 원(고르지 않은 가장자리 — 선 없음) + 노랑·살구 빗금 + 은은한 입체(빛무리는 sunGlowArt 판) */
function sunArt(g,n){const cx=n/2,cy=n/2,r=n*.19; // 원만(빛무리는 sunGlowArt — 더하기 섞기 판으로 따로, 손그림 결은 원 안쪽에만)
  g.save();wob(g,cx,cy,r,21,.03);g.fillStyle='#ffe9b0';g.fill();g.clip();hatch(g,cx-r,cy-r,2*r,2*r,240,['#fffbe8','#fff2c8','#ffd98a','#ffcf7a'],23,{len:[6,14],alpha:[.14,.3],lw:[1.2,2.2]});shade(g,cx,cy,r,{lit:.4,dark:.08});g.restore();
  // 테두리 선 없음(2026-11-08) — 가장자리는 둘레로 갈수록 살짝 진한 살구빛이 원 안쪽에서 번지듯
  {const e=g.createRadialGradient(cx,cy,r*.72,cx,cy,r*1.04);e.addColorStop(0,'rgba(255,214,140,0)');e.addColorStop(.8,'rgba(255,200,120,.35)');e.addColorStop(1,'rgba(255,200,120,0)');g.fillStyle=e;g.beginPath();g.arc(cx,cy,r*1.04,0,PI*2);g.fill();}}
/* 해 빛무리: 은은하게 번지는 살구빛(가운데 크림 → 바깥으로 사라짐) */
function sunGlowArt(g,n){const c=n/2,gr=g.createRadialGradient(c,c,0,c,c,c);gr.addColorStop(0,'rgba(255,240,200,.85)');gr.addColorStop(.18,'rgba(255,226,170,.6)');gr.addColorStop(.42,'rgba(255,200,130,.24)');gr.addColorStop(.7,'rgba(255,180,120,.08)');gr.addColorStop(1,'rgba(255,170,120,0)');g.fillStyle=gr;g.fillRect(0,0,n,n);}
/* 바닥 크레용 결(storybook 크레용 결과 같은 그리기): 획은 연보라·크림 위주(진한 갈색 획은 휴대폰에서 지저분한 얼룩처럼 보였다), 진하기는 공용 결과 한 단계 진한 결의 중간 — 파스텔 색연필 */
function crayonGround(g,size){const R=srand(20261107),rr=(a,b)=>a+R()*(b-a),cols=['#ffffff','#fff4e2','#f2e4cc','#e6daf2','#d8c8ec','#f4ecfa','#e9dcc8'],pick=()=>cols[Math.floor(R()*cols.length)];
  g.fillStyle='#ffffff';g.fillRect(0,0,size,size);g.lineCap='round';
  for(let i=0;i<1300;i++){const x=R()*size,y=R()*size,len=rr(6,18),ang=R()*PI,w=rr(1.5,5);g.strokeStyle=pick();g.globalAlpha=rr(.13,.38);g.lineWidth=w;
    const dx=Math.cos(ang)*len,dy=Math.sin(ang)*len;for(let ox=-1;ox<=1;ox++)for(let oy=-1;oy<=1;oy++){g.beginPath();g.moveTo(x+ox*size,y+oy*size);g.lineTo(x+dx+ox*size,y+dy+oy*size);g.stroke();}}
  for(let i=0;i<1000;i++){g.globalAlpha=rr(.12,.34);g.fillStyle=pick();g.beginPath();g.arc(R()*size,R()*size,rr(.8,3),0,7);g.fill();}g.globalAlpha=1;}
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
  for(let i=0;i<60;i++){const x=n*(.12+R()*.76),y=n*(.25+R()*.5),r=n*(.07+R()*.2),c=cols[i%5],gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(${c},.075)`);gr.addColorStop(1,`rgba(${c},0)`);g.fillStyle=gr;g.fillRect(0,0,n,n);}
  /* 판 가장자리로 갈수록 0까지(2026-11-08 — 가장자리에서 잘린 구름 얼룩이 하늘에 밝기가 다른 세로 이음매로 보였다) */
  const m=g.createRadialGradient(n/2,n/2,n*.22,n/2,n/2,n*.5);m.addColorStop(0,'rgba(0,0,0,1)');m.addColorStop(1,'rgba(0,0,0,0)');g.globalCompositeOperation='destination-in';g.fillStyle=m;g.fillRect(0,0,n,n);g.globalCompositeOperation='source-over';}
/* 은하수 띠(가로로 긴 그림 — 판은 4:1): 가운데가 밝은 연보라·분홍 띠 + 작은 별 알갱이 */
function milkyArt(g,n){const w=n,h=n;let s=23;const R=()=>((s=(s*16807)%2147483647)/2147483647);
  for(let i=0;i<70;i++){const x=w*R(),y=h*(.5+(R()-.5)*.36*Math.sin(x/w*PI)),r=h*(.08+R()*.16),c=['190,160,240','240,170,220','170,180,255'][i%3],gr=g.createRadialGradient(x,y,0,x,y,r);
    gr.addColorStop(0,`rgba(${c},.07)`);gr.addColorStop(1,`rgba(${c},0)`);g.fillStyle=gr;g.fillRect(0,0,w,h);}
  const fade=g.createLinearGradient(0,0,w,0);fade.addColorStop(0,'rgba(0,0,0,1)');fade.addColorStop(.15,'rgba(0,0,0,0)');fade.addColorStop(.85,'rgba(0,0,0,0)');fade.addColorStop(1,'rgba(0,0,0,1)');
  g.globalCompositeOperation='destination-out';g.fillStyle=fade;g.fillRect(0,0,w,h);const fv=g.createLinearGradient(0,0,0,h);fv.addColorStop(0,'rgba(0,0,0,1)');fv.addColorStop(.3,'rgba(0,0,0,0)');fv.addColorStop(.7,'rgba(0,0,0,0)');fv.addColorStop(1,'rgba(0,0,0,1)');g.fillStyle=fv;g.fillRect(0,0,w,h);g.globalCompositeOperation='source-over';}
/* 겉면에 딱 붙는 무늬·문·창(2026-11-08): 2D 모양(u,v)의 점마다 frame(u,v) → [원점, 겉면 쪽 방향]으로 실제 겉면(로우폴리 그대로)에 쏘아 맞은 자리에 붙이고 eps만큼 바깥으로 띄움.
   경계는 모양 그대로 매끈한 선, 겉면이 꺾이면 같이 꺾임(겹쳐 깜빡이지 않음). bulge: 가운데로 갈수록 더 볼록(점의 세 번째 값 w — 가운데 1, 가장자리 0) */
/* (함수 선언만 — 구역 코드 위쪽(집)에서 먼저 불러도 되게) */
function FRONT(u,v){return [[u,v,5],[0,0,-1]];}
function surfHit(target,frame,u,v,off){const T=surfHit.T||(surfHit.T={rc:new THREE.Raycaster(),o:new THREE.Vector3(),d:new THREE.Vector3(),m:new THREE.MeshBasicMaterial({side:THREE.DoubleSide})});
  const [O,D]=frame(u,v);T.o.set(...O);T.d.set(...D).normalize();T.rc.set(T.o,T.d);const h=T.rc.intersectObject(target.userData.rm||(target.userData.rm=new THREE.Mesh(target,T.m)),false)[0];
  const p=h?h.point.clone():T.o.clone().addScaledVector(T.d,5);return p.addScaledVector(T.d,-off);}
function wrapOn(target,shape,frame,eps=.004,bulge=0,ell=null){const pos=[],nr=[];for(const [u,v,w=0] of shape.pts){const p=surfHit(target,frame,u,v,eps+bulge*w);pos.push(p.x,p.y,p.z);
    if(ell){const [cx,cy,cz,a,b,c]=ell,n=new THREE.Vector3((p.x-cx)/(a*a),(p.y-cy)/(b*b),(p.z-cz)/(c*c)).normalize();nr.push(n.x,n.y,n.z);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(shape.idx);
  if(ell)g.setAttribute('normal',new THREE.Float32BufferAttribute(nr,3));else g.computeVertexNormals(); /* ell = 몸 타원(가운데·반지름): 그 매끈한 법선 — 면에 맞은 자리로 계산하면 툰 음영이 얼룩졌다 */
  g.setAttribute('uv',new THREE.Float32BufferAttribute(shape.pts.flatMap(([u,v])=>[u*3,v*3]),2));return g;} /* uv = 모양 자리 — 크레용 결이 몸처럼 보이게 */
function wallPt(target,frame,u,v,off){return surfHit(target,frame,u,v,off).toArray();}
/* 테두리: 2D 선을 겉면에 붙여 그 위로 관(tube) */
function rimTube(target,frame,line,r,closed,off){const pts=line.map(([u,v])=>surfHit(target,frame,u,v,off));return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,closed,'centripetal'),Math.max(closed?48:56,pts.length*2),r,6,closed);}
/* 2D 모양: 타원(가운데 + 고리), 아치(네모 격자 + 위 반원 — 맞닿는 줄의 점을 맞춤) */
function ellipseShape(cx,cy,rx,ry,rings=7,seg=40){const pts=[[cx,cy,1]],idx=[];for(let r=1;r<=rings;r++){const f=r/rings;for(let s=0;s<seg;s++){const a=s/seg*PI*2;pts.push([cx+Math.cos(a)*rx*f,cy+Math.sin(a)*ry*f,1-f*f]);}}
  for(let s=0;s<seg;s++)idx.push(0,1+s,1+(s+1)%seg);
  for(let r=1;r<rings;r++){const b0=1+(r-1)*seg,b1=1+r*seg;for(let s=0;s<seg;s++){const s1=(s+1)%seg;idx.push(b0+s,b1+s,b1+s1,b0+s,b1+s1,b0+s1);}}return {pts,idx};}
function archShape(w,hs,v0=0,rings=6,ny=6,seg=20){const nx=rings*2,pts=[],idx=[];
  for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++)pts.push([-w/2+w*i/nx,v0+hs*j/ny]);
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+1,c=a+nx+2,d=a+nx+1;idx.push(a,b,c,a,c,d);}
  const C=pts.length;pts.push([0,v0+hs]);for(let r=1;r<=rings;r++)for(let s=0;s<=seg;s++){const a=s/seg*PI,f=r/rings*w/2;pts.push([Math.cos(a)*f,v0+hs+Math.sin(a)*f]);}
  for(let s=0;s<seg;s++)idx.push(C,C+1+s,C+2+s);
  for(let r=1;r<rings;r++){const b0=C+1+(r-1)*(seg+1),b1=C+1+r*(seg+1);for(let s=0;s<seg;s++)idx.push(b0+s,b1+s,b1+s+1,b0+s,b1+s+1,b0+s+1);}return {pts,idx};}
function archLine(w,hs,v0,out=0){const r=w/2+out,L=[],n=Math.ceil((hs-v0)/.02); /* 점을 2cm마다 촘촘히 — 듬성하면 곡선이 옆선을 안쪽으로 휘게 했다 */
  for(let k=0;k<n;k++)L.push([-r,v0+(hs-v0)*k/n]);for(let s=0;s<=40;s++){const a=PI-s/40*PI;L.push([Math.cos(a)*r,hs+Math.sin(a)*r]);}for(let k=n-1;k>=0;k--)L.push([r,v0+(hs-v0)*k/n]);return L;}
function circleLine(cx,cy,r){return Array.from({length:48},(_,s)=>[cx+Math.cos(s/48*PI*2)*r,cy+Math.sin(s/48*PI*2)*r]);}
function pMatW(){if(pMatW.m)return pMatW.m;const m=sbMat('#ffffff');m.vertexColors=true;return pMatW.m=m;} /* 소품 공용 재질(정점 색) — 집 벽 덩어리도 같이 */
/* 정점 색 덩어리 하나(부품 목록 → 한 메시) */
function lumpMesh(list){const gs=list.map(([geo,c,pos,rot,s])=>{let g=geo.index?geo.toNonIndexed():geo;for(const k of Object.keys(g.attributes))if(!['position','normal','uv'].includes(k))g.deleteAttribute(k);
    g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...(pos||[0,0,0])),new THREE.Quaternion().setFromEuler(new THREE.Euler(...(rot||[0,0,0]))),new THREE.Vector3(...(s||[1,1,1]))));
    const n=g.attributes.position.count,cc=new Float32Array(n*3),C=new THREE.Color(c);for(let i=0;i<n;i++){cc[i*3]=C.r;cc[i*3+1]=C.g;cc[i*3+2]=C.b;}g.setAttribute('color',new THREE.BufferAttribute(cc,3));return g;});
  const m=sbMat('#ffffff');m.vertexColors=true;const me=new THREE.Mesh(mergeGeometries(gs),m);me.castShadow=true;return me;}
/* 아기 토끼(키 약 0.9m — 원더룹의 0.65): 둥근 몸·큰 머리·쫑긋한 두 귀·목도리·흰 꼬리 — 한 덩어리(그리기 1번). squash(u): 뛰는 동안 늘었다 줄었다 */
function makeBunny(fur,scarf){const root=new THREE.Group();const S=(r,w=12,h=9)=>new THREE.SphereGeometry(r,w,h);
  const furD=new THREE.Color(fur).multiplyScalar(.86).getStyle(),cream='#f3ebe0',pink='#f2a7b4',dark='#2a2633';
  const bodyG=S(.2).applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(0,.24,0),new THREE.Quaternion(),new THREE.Vector3(1,1.05,.95))),headG=S(.21).applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(0,.6,0),new THREE.Quaternion(),new THREE.Vector3(1.05,.95,1)));
  const me=lumpMesh([[S(.2),fur,[0,.24,0],0,[1,1.05,.95]],[wrapOn(bodyG,ellipseShape(0,.21,.095,.125),FRONT,.003,.004,[0,.24,0,.2,.21,.19]),cream],[S(.08,8,6),fur,[-.1,.04,.06],0,[1,.55,1.5]],[S(.08,8,6),fur,[.1,.04,.06],0,[1,.55,1.5]],
    [S(.07,8,6),'#ffffff',[0,.18,-.19]],[new THREE.TorusGeometry(.13,.04,6,16),scarf,[0,.4,0],[PI/2,0,0],[1,1,.9]],[S(.05,8,6),scarf,[.06,.36,.14]],
    [S(.21),fur,[0,.6,0],0,[1.05,.95,1]],[wrapOn(headG,ellipseShape(0,.535,.105,.06),FRONT,.003,.02,[0,.6,0,.2205,.1995,.21]),cream],[S(.025,6,5),pink,[0,.58,.21]],
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
  const bodyG=S(.34).applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(0,.42,0),new THREE.Quaternion(),new THREE.Vector3(1,1.08,.92))),headG=S(.29).applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(0,.12,0),new THREE.Quaternion(),new THREE.Vector3(1.05,.95,1)));
  /* 배·입 둘레 크림 무늬(2026-11-08 다시): 몸·머리 겉면에 붙인 매끈한 타원 하나(wrapOn — 예전엔 크림 구를 몸에 박아 넣어 로우폴리 두 구가 만나는 경계가 들쭉날쭉했다) */
  const body=lump([[S(.34),fur,[0,.42,0],0,[1,1.08,.92]],[wrapOn(bodyG,ellipseShape(0,.4,.155,.2),FRONT,.004,.006,[0,.42,0,.34,.3672,.3128]),cream],[S(.13,10,8),fur,[-.15,.07,.08],0,[1,.55,1.5]],[S(.13,10,8),fur,[.15,.07,.08],0,[1,.55,1.5]],
    [S(.1,10,8),'#ffffff',[0,.3,-.31]],[Cy(.075,.075,.56),paper,[0,.62,-.3],[0,0,PI/2]],[Cy(.08,.08,.04),strap,[.12,.62,-.3],[0,0,PI/2]],[Cy(.08,.08,.04),strap,[-.12,.62,-.3],[0,0,PI/2]],
    [new THREE.TorusGeometry(.345,.024,6,28),strap,[0,.5,-.01],[PI/2,0,.75],[1,1,.9]]]); // 등의 지도를 맨 끈: 몸을 한 바퀴 감는 띠(예전 반 바퀴 끈은 끝이 허공에 떠 '검은 막대'처럼 보였다)
  root.add(body);
  const head=new THREE.Group();head.position.set(0,.84,0);root.add(head);
  const earBent=new THREE.Group();
  head.add(lump([[S(.29),fur,[0,.12,0],0,[1.05,.95,1]],[wrapOn(headG,ellipseShape(0,.02,.15,.085),FRONT,.004,.03,[0,.12,0,.3045,.2755,.29]),cream],[S(.035,8,6),pink,[0,.08,.29]],
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
  function tick(dt,t,hop,wave){mt+=dt;if(mt>6.5){mt=0;mode=(mode+1)%2;}
    if(wave){const P=wave,dx=P.x-root.position.x,dz=P.z-root.position.z;root.rotation.y+=Math.atan2(Math.sin(Math.atan2(dx,dz)-root.rotation.y),Math.cos(Math.atan2(dx,dz)-root.rotation.y))*Math.min(1,dt*3); // 별똥별 타고 가는 원더룹에게 두 팔 번쩍 손 흔들기
      armR.rotation.set(-2.5,0,-.25+Math.sin(t*8)*.45);armL.rotation.set(-2.5,0,.25-Math.sin(t*8+1.3)*.45);head.rotation.x=-.4;head.rotation.z=Math.sin(t*1.6)*.05;map.scale.x=.001;map.visible=false;scroll.visible=false;return;}
    const k=hop?0:ss(0,.6,mt)*ss(6.5,5.8,mt);// 동작 세기(들어갔다 나옴)
    head.rotation.z=Math.sin(t*.9)*.04;head.position.y=.84+Math.sin(t*1.8)*.008;earBent.rotation.z=Math.sin(t*1.3)*.08;
    scroll.visible=!!hop;
    if(hop){armL.rotation.set(0,0,-1.2);armR.rotation.set(-.5,0,1.0);map.scale.x=0;map.visible=false;return;}
    if(mode===0){// 지도 펼쳐 보기: 두 팔을 앞으로, 지도가 가운데서 양옆으로 펴짐, 고개를 숙여 봄
      armL.rotation.set(-1.1*k,0,.25*k);armR.rotation.set(-1.1*k,0,-.25*k);map.scale.x=Math.max(.001,ss(.3,.9,mt)*ss(6.3,5.6,mt));map.visible=map.scale.x>.04;head.rotation.x=.25*k;}
    else{// 망원경 안경 고쳐 쓰기: 오른팔을 들어 눈가에, 고개를 살짝 갸웃
      armL.rotation.set(0,0,0);armR.rotation.set(-2.2*k,0,-.35*k+Math.sin(t*6)*.04*k);map.scale.x=.001;map.visible=false;head.rotation.x=-.08*k;head.rotation.z+=.12*k;}}
  return {root,tick};}
