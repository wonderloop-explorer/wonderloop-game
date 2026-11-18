/* 무한 우주 STAGE 3 구름 행성(금성) 본편 (2026-11-18 세 번째 — 구조 다시: 갈림길 셋 대신 '거꾸로 마을' + '서쪽 해돋이 광장'). 성격은 '살피기'(조용히 관찰). 자동 플레이 약 2분 40초·처음 하는 사람 약 3분 20초.
   흐름·대사 자리 목록은 docs/space-stage3-flow.md(대본 만들 때 볼 것). '[임시] …' 글은 대사 자리 표시 — docs/voice/script.csv에는 아직 없다.
   땅: 구름 바다(SEA) 위에 뜬 구름 섬(가장자리는 둥글게 가라앉음) + 둘레에 높이가 다른 구름 섬·멀리 겹겹이 솟은 구름 탑. 해는 서쪽(-x): 해돋이 전에는 서쪽 지평선의 금빛·살구빛 띠만, 광장에서 떠오름.
   길(PATH): 시작 [0,0] → 마을 입구 [0,-10] → 굽이굽이 마을 길(약 90m) → 광장 [-42,-20](반지름 7 — 북쪽으로 들어서고 출구는 서·동·남) → 문 구역 시작 [-56,-20] → 구름 문 [-72,-20] → 구름 끝 [-87,-20]. 비밀 = 마을 입구 동쪽 또생일네 집 [12.9,-13.4].
   ① 도착(whirl-lift cloudArrival): 도착 알림 + TR-004 → S3-001 나레이션 → 3초 조용히
   ② 거꾸리: 안개 속에서 뒷걸음으로 나와 돌아섬 → S3-002 → '[임시] 따라와, 마을을 지나가자' → 친구 카드. 그 뒤 5.5m 앞 길 옆에서 뒷걸음 길잡이
   ③ 거꾸로 마을(할 일 없음 — 걸으며 구경): 입구에서 '[임시] 마을 소개'(멈추지 않음). 거꾸로 집 넷(지붕이 땅에·문이 위에·굴뚝 연기가 아래로) + 거꾸로 선 우산 나무·물구나무 우체통 + 조는 구름 양 넷(가까이 가면 작은 z).
      또생일네 집(창문 촛불 빛 + 생일 노래)은 입구 동쪽 샛길 끝 — 안 들러도 됨.
   ④ 서쪽 해돋이 광장(퍼즐은 여기 한 번): 들어서면 '[임시] 해가 뜬다, 어느 쪽인지 봐' → 조작 잠금·카메라가 서쪽 지평선 → 해가 5.8초에 걸쳐 떠오름(하늘·빛이 금빛·살구빛으로, 기둥 그림자가 동쪽으로 나타남, 안개 물러남)
      → '[임시] 해가 서쪽에서 떠, 그림자 반대쪽이 앞' → 조작 풀림(카메라가 위로 올라가 출구 셋과 그림자를 보여 줌 — zoneCam). 서쪽 출구 = 정답: 안개가 걷히고 발견 카드 1(S3-007).
      동·남 출구 = 구름이 광장 가운데로 되돌림(실패 아님), 두 번 틀리면 거꾸리가 그림자를 가리키며 도움 대사(S3-005).
   ⑤ 뭉게 문지기: 그대로(S3-008 → 코 골 때만 걷기, '?'면 멈춤, '!'면 밀려남 → 문을 지나면 S3-011 + 친구 카드)
   ⑥ 구름 끝: S3-012 → 013 → 얼음 조각 배 → 둘이 탐 → 발견 카드 2(S3-014 — 배 너머 구름 바다 위에 낡은 비행선) → 지도 카드(S3-018) → 출발 → 'STAGE 3 완료!' → 돌아와 내려 줌(쉼터가 생기면 이동 연출로)
   비밀: 또생일 — 말 걸면 S3-015 → 016 → 친구 카드 → '촛불 불기' → 발견 카드 3(S3-017).
   저장: flags venus:met · venus:town · venus:sunrise · venus:plaza · venus:gate · venus:ddo · clear:space-venus(예전 venus:f3 = 광장까지 끝낸 것으로), 발견 secret:<세계>:venussun · venusair · venusday.
   하늘: 칸 [해돋이 전, 해돋이 뒤, 해돋이 뒤] — 날씨 무작위 대신 after()로 고정. 안개: 도착 3~24m → 마을 6~54 → 해돋이 11~108 → 광장을 나서면 29~239.
   그리기(구역 것): 땅·바다 1 · 기둥·문·둔덕·먼 섬·탑 1 · 마을(집·나무·소품·양) 1 · 그림자 1 · 서쪽 빛 띠 1 · 해 1 · 거꾸리 3 · 뭉게 3 · 또생일 1 · 케이크 2 · 창문 빛 1 · 배 1 · 비행선 1 · 구름 알갱이 1 (+ 휴대폰 동그란 그림자 1). 시험 tools/space-stage3-test.py */
import * as THREE from 'three';
import {PI,QUALITY,rng,blobMany} from '../../01-textures.js';
import * as G from '../../game/index.js';
import {sbMat} from '../../game/storybook.js';
import {markChar} from '../../game/bend.js';
import {RIDE,points} from './meteor-ride.js';
import {cloudArrival} from './whirl-lift.js';
import {lump} from './martians.js';
import {makeGeokkuri,makeMunge,makeDdo,makeCake,makeIceBoat,pillarParts,puff,houseParts,treeParts,mailboxParts,sheepParts,sundialParts,makeAirship} from './cloudfolk.js';
import SPACE from '../../worlds/infinite-space.js';
const WID=SPACE.id,ZID='space-venus';
const K={met:'venus:met',town:'venus:town',sun:'venus:sunrise',plaza:'venus:plaza',gate:'venus:gate',ddo:'venus:ddo',clear:'clear:'+ZID};
const DISC={sun:'secret:'+WID+':venussun',air:'secret:'+WID+':venusair',day:'secret:'+WID+':venusday'},DISC_TOTAL=3;
/* 대사(docs/voice/script.csv SPC-S3-… 와 글자가 같아야 목소리를 찾는다) */
const T={n1:'구름이 너무 두꺼워서 한 치 앞도 안 보여요. 어디로 가야 할까요?',g2:"녕안! 아, 여기 말로 '안녕'이야. 나는 거꾸리, 뭐든 거꾸로 하지!",g3:'여기선 해가 서쪽에서 떠. 그래서 그림자도 반대로 읽어야 해.',g4:'그림자 반대쪽이 앞이야! 갈림길에서 그림자를 잘 보고 따라와.',
  g5:'그림자가 가리키는 쪽 말고, 그 반대쪽!',g6:'봐, 구름이 걷히잖아! 서쪽에서 뜬 해가 길을 비춰 줘.',n7:'금성은 다른 행성과 거꾸로 돌아서, 해가 서쪽에서 뜨고 동쪽으로 져요.',g8:'쉿, 뭉게 문지기가 자고 있어. 코를 골 때만 살금살금 걸어.',
  m9:'음? 누구야?',m10:'어이쿠, 누가 깨웠어?',m11:'드르렁, 더 자야지.',g12:'다 왔다! 여기가 구름 끝이야. 토성 고리에서 날아온 얼음 조각으로 배를 띄워 줄게.',g13:'나도 같이 갈래! 거꾸로 타면 더 재밌거든.',
  n14:'금성 땅은 아주 뜨겁지만, 구름 위 높은 곳은 기압과 온도가 지구와 비슷해요.',d15:'오늘 생일이야! 하루가 다 가기 전에 1년이 지나 버렸거든!',d16:'케이크 한 조각 먹고 가! 초는 네가 불어도 돼.',
  n17:'금성은 한 바퀴 도는 데 243일, 해를 한 바퀴 도는 데 225일이 걸려요. 하루가 1년보다 길어요.',n18:'보름 할아버지의 지도에 구름 행성이 그려졌어요.',g19:'그림자 반대쪽이 앞이야!'};
/* 대사 자리(임시 글 — 마지막에 한꺼번에 다듬음. script.csv에 아직 없음 → 글자만) */
const TMP={go:'[임시] 따라와, 마을을 지나가자',town:'[임시] 마을 소개',rise:'[임시] 해가 뜬다, 어느 쪽인지 봐',west:'[임시] 해가 서쪽에서 떠, 그림자 반대쪽이 앞',again:'[임시] 다시 말 걸기(해돋이 전)'};
const BX=[-90,17,-36,14]; // 걷는 범위
function groundY(x,z){return .22*Math.sin(x*.21+Math.sin(z*.13)*1.4)*Math.cos(z*.19)+.14*Math.sin((x+z)*.37)+.1*Math.sin(x*.61-z*.47);}
const PATH=[[0,0],[0,-12],[-3,-20],[-10,-24],[-18,-22],[-22,-14],[-22,-4],[-26,3],[-33,5],[-39,2],[-42,-5],[-42,-20],[-56,-20],[-72,-20],[-87,-20]];
/* 광장: 북쪽(+z)에서 들어섬(inc = 들어오는 방향), 출구 셋 — 서쪽(해 쪽)이 맞는 길, 동쪽(그림자가 뻗는 쪽)·남쪽이 틀린 길. wait = 거꾸리가 기다리는 자리(가운데 기준) */
const PLZ={c:[-42,-20],R:7,inc:[0,-1],wait:[2.7,4.4],br:[{d:[-1,0],ok:true,n:'서쪽'},{d:[1,0],n:'동쪽'},{d:[0,-1],n:'남쪽'}]};
const GS=[-56,-20],GATE=[-72,-20],END=[-87,-20],SEC=[9.6,-11.4],CAKE=[10.7,-10.5],DHOUSE=[12.9,-13.4],MUNGE=[-70.3,-22.5],SPUR=[[0,-10.5],SEC],SEA=-1.1,DOCK=[-92.7,-20];
const SHD=[1,0]; // 그림자가 뻗는 쪽(동쪽 — 해 반대)
const SHIP=[DOCK[0]-.612*58,1.5,DOCK[1]-.791*58]; // 낡은 비행선(구름 끝에서 배를 비추는 카메라가 보는 쪽 구름 바다 위)
const ss=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x);},lerp=(a,b,t)=>a+(b-a)*t;
/* 길 계산: 누적 길이·한 점을 길 위로 내린 자리 */
const SEG=PATH.slice(1).map((p,i)=>Math.hypot(p[0]-PATH[i][0],p[1]-PATH[i][1])),ACC=[0];SEG.forEach(l=>ACC.push(ACC[ACC.length-1]+l));const SLEN=ACC[ACC.length-1];
function pointAt(s){s=Math.min(SLEN,Math.max(0,s));for(let i=0;i<SEG.length;i++)if(s<=ACC[i+1]||i===SEG.length-1){const u=(s-ACC[i])/SEG[i];return [lerp(PATH[i][0],PATH[i+1][0],u),lerp(PATH[i][1],PATH[i+1][1],u)];}}
function segD(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1,u=Math.min(1,Math.max(0,((x-a[0])*dx+(z-a[1])*dz)/l2)),px=a[0]+dx*u,pz=a[1]+dz*u;return {d:Math.hypot(x-px,z-pz),u,pt:[px,pz]};}
function proj(x,z){let best=null;for(let i=0;i<SEG.length;i++){const q=segD(x,z,PATH[i],PATH[i+1]);if(!best||q.d<best.d)best={d:q.d,s:ACC[i]+q.u*SEG[i],pt:q.pt};}return best;}
const sOf=p=>proj(p[0],p[1]).s,S_TOWN=9,S_PIN=sOf([PLZ.c[0],PLZ.c[1]+PLZ.R+1]),S_PLZ=sOf(PLZ.c),S_GS=sOf(GS),S_GATE=sOf(GATE),S_END=sOf(END);
export function build({root}){const MOB=QUALITY.tier==='mobile',keep=[],F=G.state.flags,R0=rng('space-venus:decor'),RR=(a,b)=>a+R0()*(b-a),obstacles=[],floats=[];
  G.profile.setup({world:WID,cards:SPACE.cards});
  if(F['venus:f3']&&!F[K.plaza]){G.state.setFlag(K.sun,true);G.state.setFlag(K.plaza,true);} /* 예전 저장(갈림길 셋) */
  const add=o=>{root.add(o);keep.push(o);return o;};
  const c0=PLZ.c[0],c1=PLZ.c[1],dPlz=(x,z)=>Math.hypot(x-c0,z-c1);
  const stubs=PLZ.br.filter(b=>!b.ok).map(b=>[PLZ.c,[c0+b.d[0]*11,c1+b.d[1]*11]]);
  const pathD=(x,z)=>{let d=proj(x,z).d;for(const [a,b] of stubs)d=Math.min(d,segD(x,z,a,b).d);return Math.min(d,segD(x,z,SPUR[0],SPUR[1]).d+.8,Math.max(0,dPlz(x,z)-PLZ.R+1.2));};
  /* ── 땅: 구름 바다 위에 뜬 구름 섬 한 장(정점 색) — 걷는 범위 밖은 둥글게 가라앉아 바다(SEA, 잔물결)와 만나고, 그 밖으로 아주 먼 바다 판 ── */
  const sea=(x,z)=>SEA+.34*Math.sin(x*.13+Math.sin(z*.09)*1.3)*Math.cos(z*.11)+.2*Math.sin((x-z)*.21);
  const edge=(x,z)=>{const e=Math.max(0,1.2+1.2*Math.sin(x*.31)+1.2*Math.sin(z*.27));return Math.max((BX[0]-.5)-x,Math.max(x-(BX[1]+5),(BX[2]-5)-z,z-(BX[3]+5))-e,0);};
  const X0=-128,X1=36,Z0=-56,Z1=34,CELL=MOB?1.9:1.5,NX=Math.round((X1-X0)/CELL),NZ=Math.round((Z1-Z0)/CELL);
  {const pos=[],col=[],uv=[],idx=[],A=new THREE.Color('#e3d0f3'),C2=new THREE.Color('#c9a6e0'),C3=new THREE.Color('#f6ecfd'),CP=new THREE.Color('#fdf8ff'),CS=new THREE.Color('#c2a6dc'),CS2=new THREE.Color('#dfcef2'),t=new THREE.Color(),t2=new THREE.Color();
    for(let j=0;j<=NZ;j++)for(let i=0;i<=NX;i++){const x=X0+(X1-X0)*i/NX,z=Z0+(Z1-Z0)*j/NZ,g0=groundY(x,z),off=edge(x,z),yl=g0-(off*off*.35+off*.5),ys=sea(x,z);pos.push(x,Math.max(yl,ys),z);uv.push(x/4,z/4);
      t.copy(A).lerp(C3,Math.max(0,g0*2.2)).lerp(C2,Math.max(0,-g0*2.6)).lerp(CP,.82*ss(2.3,.9,pathD(x,z))).lerp(C2,Math.min(.6,off*.12));
      if(yl<ys+.6)t.lerp(t2.copy(CS).lerp(CS2,Math.min(1,Math.max(0,(ys-SEA)*1.5+.45))),ss(ys+.6,ys-.1,yl));col.push(t.r,t.g,t.b);}
    for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){const a=j*(NX+1)+i,b=a+1,c=a+NX+1,d=c+1;idx.push(a,c,b,b,c,d);}
    {const b=pos.length/3,I=[[X0+2,Z0+2],[X1-2,Z0+2],[X1-2,Z1-2],[X0+2,Z1-2]],O=[[-900,-900],[900,-900],[900,900],[-900,900]];[...I,...O].forEach(([x,z])=>{pos.push(x,SEA-.35,z);uv.push(x/4,z/4);col.push(CS.r,CS.g,CS.b);});
      for(let k=0;k<4;k++){const a=b+k,a2=b+(k+1)%4,o=b+4+k,o2=b+4+(k+1)%4;idx.push(a,a2,o,a2,o2,o);}}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();
    const mat=sbMat('#ffffff');mat.vertexColors=true;var ground=new THREE.Mesh(geo,mat);ground.name='venus-cloud';ground.receiveShadow=true;ground.frustumCulled=false;add(ground);}
  /* ── 하늘·안개: 위쪽은 보라, 지평선은 연보라(해돋이 뒤에는 살구빛) + 서쪽 지평선의 금빛·살구빛 띠(아래 band). 안개는 진행에 따라(fogWant → SK.fogPush) ── */
  const PRE={top:'#a386d6',horizon:'#dcc6ec',hemi:'#ecdefa',ground:'#b294d4',hemiI:.82,sun:'#ffe8d2',sunI:.34,sunDir:[9,-3.0,0],fill:.3,fog:'#d5bee9',fogNear:3,fogFar:24,stars:0,milky:0},
    POST={...PRE,top:'#a88ede',horizon:'#f3cdb4',hemi:'#fbe9de',ground:'#c3a2d2',hemiI:.8,sun:'#ffd29a',sunI:.56,fog:'#e9c6c8'};
  const SK=G.sky.sky({parent:root,keys:[PRE,POST,POST],t:F[K.sun]?1:0,nStars:0});
  const fogWant=()=>!F[K.met]?[0,0]:!F[K.sun]?[3,30]:!F[K.plaza]?[8,84]:[26,215];
  /* ── 물체: A = 구름 기둥·문·둔덕·먼 구름 섬·구름 탑(그림자 안 드리움 — 기둥은 그림자 판) / V = 마을(집·나무·우체통·양·해시계 — 컴퓨터는 진짜 그림자) ── */
  const A=[],V=[],shadows=[],placed=[[c0,c1,PLZ.R+2.6],[SEC[0],SEC[1],1.2],[CAKE[0],CAKE[1],.8],[0,0,3],[MUNGE[0],MUNGE[1],2]],bl=[],smokes=[],houses=[],sheep=[];
  const freeAt=(x,z,r)=>placed.every(p=>Math.hypot(x-p[0],z-p[1])>r+p[2]+.4);
  const nrm=s=>{const a=pointAt(s-.5),b=pointAt(s+.5),l=Math.hypot(b[0]-a[0],b[1]-a[1])||1;return [(b[1]-a[1])/l,-(b[0]-a[0])/l];};
  /* 길 s 자리에서 옆(side)으로 off만큼 — 길(모든 구간)에서 r+clear 넘게 떨어지고 다른 것과 안 겹치는 첫 자리 */
  const along=(s,side,off,r,clear)=>{for(const o of [off,off+1.3,off+2.6])for(const sd of [side,-side]){const p=pointAt(s),n=nrm(s),x=p[0]+n[0]*sd*o,z=p[1]+n[1]*sd*o;
    if(pathD(x,z)>=r+clear&&freeAt(x,z,r)&&x>BX[0]+2&&x<BX[1]-2&&z>BX[2]+2&&z<BX[3]-2){placed.push([x,z,r]);return [x,z];}}return null;};
  const toPath=p=>{const n=proj(p[0],p[1]).pt;return Math.atan2(n[0]-p[0],n[1]-p[1]);};
  const pillar=(x,z,h,seed,sl=6.2,sw=1.5)=>{A.push(...pillarParts(x,z,groundY(x,z),h,seed));obstacles.push({c:[x,z,.78]});shadows.push([x,z,sl,sw]);};
  /* 또생일네 집(비밀 — 마을 입구 동쪽) */
  const dh=houseParts(DHOUSE[0],DHOUSE[1],groundY(...DHOUSE),Math.atan2(SEC[0]-DHOUSE[0],SEC[1]-DHOUSE[1]),{wall:'#fde6f0',roof:'#f59ab5',trim:'#d9708f',win:'#ffd27a'});V.push(...dh.parts);obstacles.push({c:[DHOUSE[0],DHOUSE[1],1.75]});placed.push([DHOUSE[0],DHOUSE[1],1.9]);smokes.push(dh.smoke);bl.push([DHOUSE[0],DHOUSE[1],1.3]);
  /* 거꾸로 집 넷: 길 양옆에 번갈아(문이 길 쪽) */
  const HC=[{wall:'#f8ecd8',roof:'#e59ab4',trim:'#c9788f'},{wall:'#ece4fb',roof:'#9a86d6',trim:'#7c69b8'},{wall:'#e4f4ec',roof:'#7fc4b0',trim:'#5fa693'},{wall:'#fdeed6',roof:'#f0b072',trim:'#d18f52'}];
  [[17,1],[34,-1],[54,1],[74,-1]].forEach(([s,sd],i)=>{const p=along(s,sd,5,1.9,1.7);if(!p)return;const h=houseParts(p[0],p[1],groundY(...p),toPath(p),HC[i]);V.push(...h.parts);obstacles.push({c:[p[0],p[1],1.75]});smokes.push(h.smoke);houses.push(p);bl.push([p[0],p[1],1.3]);});
  /* 조는 구름 양 넷 · 물구나무 우체통 둘 · 거꾸로 선 우산 나무(길 양옆) */
  [[26,-1],[45,1],[64,-1],[85,1]].forEach(([s,sd],i)=>{const p=along(s,sd,2.9,.5,2.1);if(!p)return;const gy=groundY(...p);V.push(...sheepParts(p[0],p[1],gy,toPath(p)+(i%2?1:-1)*.9,i));obstacles.push({c:[p[0],p[1],.42]});sheep.push(p);bl.push([p[0],p[1],.55]);});
  [[11.5,-1],[61,1]].forEach(([s,sd])=>{const p=along(s,sd,2.6,.3,2);if(p)V.push(...mailboxParts(p[0],p[1],groundY(...p),toPath(p)));});
  {let k=0;for(let s=12.5;s<S_PIN-2;s+=5.7,k++){const p=along(s,k%2?1:-1,3.5,1.2,1.9);if(!p)continue;V.push(...treeParts(p[0],p[1],groundY(...p),k,.9+.25*((k*7)%5)/4));obstacles.push({c:[p[0],p[1],1.2]});bl.push([p[0],p[1],.95]);}}
  /* 광장: 출구 넷(들어오는 북쪽 포함) 양옆 구름 기둥 여덟(긴 그림자가 동쪽으로) + 사이사이 우산 나무 넷 + 해시계 */
  for(let k=0;k<4;k++){for(const sg of [-1,1]){const a=k*PI/2+sg*.37;pillar(c0+Math.cos(a)*7.5,c1+Math.sin(a)*7.5,3.6,30+k*2+sg,9.4,1.7);}
    const a=k*PI/2+PI/4,x=c0+Math.cos(a)*8.4,z=c1+Math.sin(a)*8.4;V.push(...treeParts(x,z,groundY(x,z),k+1,1.15));obstacles.push({c:[x,z,1.4]});placed.push([x,z,1.4]);bl.push([x,z,1]);}
  {const x=c0+2.5,z=c1-2.7;V.push(...sundialParts(x,z,groundY(x,z)));obstacles.push({c:[x,z,.75]});shadows.push([x+.2,z,2.6,.7]);bl.push([x,z,.8]);}
  /* 구름 문: 큰 기둥 둘 + 위를 잇는 구름 아치 + 양옆 구름 둑(돌아갈 수 없게) */
  for(const s of [-1,1]){pillar(GATE[0],GATE[1]+s*2.6,4.2,20+s,7.5,2);for(let i=0;i<7;i++){const a=i/6*PI,y=groundY(...GATE)+3.5+Math.sin(a)*.9;if(s>0)A.push([puff(.62+Math.sin(i*2.3)*.08,GATE[0]+Math.sin(i*1.9)*.12,y,GATE[1]+Math.cos(a)*2.6),['#f1e6fb','#e6d6f6','#f8f1fd'][i%3]]);}
    for(let k=0;k<5;k++){const z=GATE[1]+s*(4.5+k*1.9),x=GATE[0]+Math.sin(k*1.7+s)*.5,r=1.25-k*.06;A.push([puff(r,x,groundY(x,z)+r*.55,z,[1,.85,1]),['#e6d6f6','#f1e6fb','#dccaf0'][k%3]]);obstacles.push({c:[x,z,r*.9]});}}
  /* 길가 구름 둔덕(막지 않음) */
  for(let i=0;i<(MOB?24:36);i++){const x=RR(BX[0]+2,BX[1]-1),z=RR(BX[2]+1,BX[3]-1),d=pathD(x,z),r=RR(.5,1.15);if(d<3.4||d>10||!freeAt(x,z,r))continue;
    A.push([puff(r,x,groundY(x,z)+r*.3,z,[1.25,.6,1.1]),['#efe4fa','#e3d2f4','#f6eefd'][i%3]]);if(i%3===0)A.push([puff(r*.55,x+r*.8,groundY(x,z)+r*.2,z+r*.3,[1.2,.6,1]),'#e3d2f4']);}
  /* 먼 배경: 걷는 땅 밖에 높이가 다른 구름 섬 + 멀리 겹겹이 솟은 구름 탑(안개가 걷힐수록 멀리까지 보임). 서쪽 해 자리(±0.3라디안)와 구름 끝 앞바다는 비움 */
  {const RF=rng('space-venus:far'),rf=(a,b)=>a+RF()*(b-a),lo=(r,x,y,z,s)=>new THREE.SphereGeometry(r,7,5).applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion(),new THREE.Vector3(...(s||[1,1,1])))),IC=['#eadcf8','#dccaf0','#f3e9fc','#d2bdea'];
    const shipWay=(x,z,r)=>{const ax=x-DOCK[0],az=z-DOCK[1],al=ax*-.612+az*-.791,pp=Math.abs(ax*-.791-az*-.612);return al>-6&&pp<al*.42+14+r;};
    for(let i=0,n=0;i<120&&n<(MOB?12:17);i++){const x=rf(-150,66),z=rf(-98,66),r0=rf(5,10);if((x>BX[0]-15&&x<BX[1]+15&&z>BX[2]-15&&z<BX[3]+15)||shipWay(x,z,r0))continue;n++;
      const r=r0,y=rf(-.4,7.5);A.push([lo(r,x,y,z,[1.35,.3,1.05]),IC[n%4]]);for(let k=0;k<3;k++){const a=rf(0,PI*2),q=r*rf(.45,.7);A.push([lo(q,x+Math.cos(a)*r*.8,y+rf(-.4,.5),z+Math.sin(a)*r*.7,[1.2,.36,1]),IC[(n+k+1)%4]]);}
      if(n%3===0){let yy=y+r*.25,q=r*.34;for(let k=0;k<3;k++){A.push([lo(q,x+rf(-1,1),yy+q*.7,z+rf(-1,1)),IC[(n+k)%4]]);yy+=q*1.1;q*=.74;}}}
    const NT=MOB?11:15;for(let i=0;i<NT;i++){const a=i/NT*PI*2+rf(-.12,.12);if(Math.abs(Math.atan2(Math.sin(a-PI),Math.cos(a-PI)))<.3)continue;const d=rf(100,185),x=-45+Math.cos(a)*d,z=-12+Math.sin(a)*d;let y=SEA-2,r=rf(9,13.5);if(shipWay(x,z,r))continue;
      for(let k=0;k<6;k++){A.push([lo(r,x+rf(-2.2,2.2),y+r*.6,z+rf(-2.2,2.2),[1,.92,1]),k>3?'#f1e6fb':['#c6aee4','#d2bdea','#bda2de'][k%3]]);y+=r*1.05;r*=.8;}}}
  {const m=lump(A,false,.6);m.name='venus-pillars';m.frustumCulled=false;add(m);}
  {const m=lump(V,true,.6);m.name='venus-town';m.frustumCulled=false;m.receiveShadow=false;add(m);}
  /* 그림자 판(기둥 — 해돋이 전에는 안 보이고 해가 뜨면 동쪽으로 길게 나타남) */
  let shMat,shMesh;
  {const c=document.createElement('canvas');c.width=128;c.height=32;const g=c.getContext('2d'),gr=g.createLinearGradient(0,0,128,0);gr.addColorStop(0,'rgba(92,62,140,.74)');gr.addColorStop(.7,'rgba(92,62,140,.6)');gr.addColorStop(1,'rgba(92,62,140,0)');g.fillStyle=gr;g.fillRect(0,0,128,32);
    g.globalCompositeOperation='destination-in';const gv=g.createLinearGradient(0,0,0,32);gv.addColorStop(0,'rgba(0,0,0,0)');gv.addColorStop(.22,'#000');gv.addColorStop(.78,'#000');gv.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gv;g.fillRect(0,0,128,32);
    const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const pos=[],uv=[],idx=[],N=7;
    shadows.forEach(([x,z,L,W])=>{const b=pos.length/3,px=-SHD[1],pz=SHD[0];for(let i=0;i<=N;i++){const u=i/N,w=W*(1-.25*u)/2;for(const s of [-1,1]){const X=x+SHD[0]*L*u+px*w*s,Z=z+SHD[1]*L*u+pz*w*s;pos.push(X,groundY(X,Z)+.05,Z);uv.push(u,s>0?1:0);}}
      for(let i=0;i<N;i++){const a=b+i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}});
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);
    shMat=new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});shMat.userData.noStorybook=true;
    shMesh=new THREE.Mesh(geo,shMat);shMesh.name='venus-shadows';shMesh.frustumCulled=false;shMesh.renderOrder=1;shMesh.userData.noMerge=true;add(shMesh);}
  /* 서쪽 지평선의 금빛·살구빛 띠 + 해(둘 다 카메라를 따라다니는 빛 판 — 안개 끝 바로 안쪽에 두어 가까운 물체에는 가려짐) */
  const mkTex=(w,h,fn)=>{const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'));const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;};
  const glowTex=mkTex(128,128,g=>{const gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,250,236,1)');gr.addColorStop(.18,'rgba(255,240,214,.7)');gr.addColorStop(.5,'rgba(255,226,204,.22)');gr.addColorStop(1,'rgba(255,226,204,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);});
  const sunTex=mkTex(128,128,g=>{const gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,246,200,1)');gr.addColorStop(.19,'rgba(255,232,150,1)');gr.addColorStop(.24,'rgba(255,206,120,.7)');gr.addColorStop(.5,'rgba(255,190,130,.26)');gr.addColorStop(1,'rgba(255,180,140,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);});
  const bandTex=mkTex(256,128,g=>{g.translate(128,64);g.scale(2,1);const gr=g.createRadialGradient(0,0,0,0,0,64);gr.addColorStop(0,'rgba(255,214,130,.95)');gr.addColorStop(.3,'rgba(255,190,140,.6)');gr.addColorStop(.65,'rgba(246,170,170,.22)');gr.addColorStop(1,'rgba(246,170,170,0)');g.fillStyle=gr;g.fillRect(-64,-64,128,128);});
  const spr=(tex,name)=>{const m=new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,fog:false,opacity:.5});m.userData.noBend=true;m.userData.noStorybook=true;const s=new THREE.Sprite(m);s.name=name;s.userData.noMerge=true;s.frustumCulled=false;add(s);return s;};
  const band=spr(bandTex,'venus-westglow'),glow=spr(sunTex,'venus-sun');
  /* ── 주민·배·비행선 ── */
  const gg=makeGeokkuri(),munge=makeMunge(),ddo=makeDdo(),cake=makeCake(),boat=makeIceBoat(),ship=makeAirship();
  [gg.root,munge.root,ddo.root,cake.g,boat].forEach(o=>{add(o);markChar(o);});boat.visible=false;gg.root.visible=false;add(ship);ship.scale.setScalar(.85);
  munge.root.position.set(MUNGE[0],groundY(...MUNGE),MUNGE[1]);munge.root.rotation.y=Math.atan2(GS[0]-MUNGE[0],GS[1]+1.5-MUNGE[1]);obstacles.push({c:[MUNGE[0],MUNGE[1],1.25]});
  ddo.root.position.set(SEC[0],groundY(...SEC),SEC[1]);ddo.root.rotation.y=Math.atan2(SPUR[0][0]-SEC[0],SPUR[0][1]-SEC[1]);obstacles.push({c:[SEC[0],SEC[1],.3]});
  cake.g.position.set(CAKE[0],groundY(...CAKE),CAKE[1]);obstacles.push({c:[CAKE[0],CAKE[1],.34]});cake.lit(!F[DISC.day]);
  /* 또생일네 창문으로 새어 나오는 촛불 빛(안개 속에서도 보이는 따뜻한 빛 판 — 촛불을 불면 옅어짐) */
  const candle=(()=>{const m=new THREE.SpriteMaterial({map:glowTex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false});m.color=new THREE.Color('#ffc66e');m.opacity=F[DISC.day]?.2:.6;m.userData.noBend=true;m.userData.noStorybook=true;const s=new THREE.Sprite(m);s.position.set(dh.win[0],dh.win[1],dh.win[2]);s.scale.setScalar(3);s.userData.noMerge=true;add(s);return s;})();
  const blobs=blobMany(3+bl.length);if(blobs){blobs.frustumCulled=false;add(blobs);bl.forEach((b,i)=>blobs.set(3+i,b[0],groundY(b[0],b[1])+.03,b[1],b[2]));}
  const puffs=points(root,MOB?90:150,{map:glowTex,add:false,size:.6,grav:-.04,drag:1.6});keep.push(puffs.pts);
  const puffAt=(x,z,n,sp=.9,col=[.95,.9,1])=>{const y=groundY(x,z);for(let i=0;i<n;i++){const a=Math.random()*PI*2,r=.2+Math.random()*.6,v=sp*(.4+Math.random()*.7),k=.88+Math.random()*.12;puffs.emit(x+Math.cos(a)*r,y+.15+Math.random()*.5,z+Math.sin(a)*r,Math.cos(a)*v,.3+Math.random()*.6,Math.sin(a)*v,1.3+Math.random()*1.2,[col[0]*k,col[1]*k,col[2]*k]);}};
  /* 뭉게 머리 위 '?'·'!' · 조는 양 위 작은 z(화면 표시 — 그리기 0) */
  if(!document.getElementById('vnMarkCss')){const s=document.createElement('style');s.id='vnMarkCss';s.textContent='.vn-mark{font:700 2.3rem/1 Jua,sans-serif;color:#3e2834;background:#fff6e0;border:3px solid #4a2a2a;border-radius:999px;width:3.2rem;height:3.2rem;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 0 rgba(74,42,42,.35)}.vn-mark.al{background:#ffd66b}.vn-z{font:700 1.5rem/1 Jua,sans-serif;color:#6a5a8a;text-shadow:0 1px 0 #fff,0 0 6px #fff}.vn-z i{display:inline-block;font-style:normal;animation:vnz 2.4s ease-in-out infinite}.vn-z i+i{font-size:.8em;animation-delay:.5s;margin-left:.15em}@keyframes vnz{0%,100%{transform:translateY(0);opacity:.5}50%{transform:translateY(-6px);opacity:1}}@media (prefers-reduced-motion:reduce){.vn-z i{animation:none}}';document.head.appendChild(s);}
  const qmark=G.float.add({root:munge.root,y:2.3,cls:'vn-mark',text:'?',far:40,prio:3,clamp:true});qmark.show(false);
  sheep.forEach(p=>floats.push(G.float.add({at:[p[0],groundY(...p),p[1]],y:.95,cls:'vn-z',html:'<i>z</i><i>z</i>',far:4.2,prio:0})));
  /* ── 상태 ── */
  const pend=RIDE.pending&&RIDE.pending.cloud?RIDE.pending:(/[?&]arrive\b/.test(location.search)&&!F[K.met]?{cloud:true}:null);if(RIDE.pending&&RIDE.pending.cloud)RIDE.pending=null; /* ?arrive: 시험용 — 주소로 바로 열어도 내려앉는 연출부터 */
  let arr=null,started=false;
  const st={arrDone:!pend,scene:false,lastQ:null,fog:[...fogWant()],wrong:0,fv:0,zc:null,zcOff:null,carry:null,intro:0,ggOn:!!F[K.met],ggMode:'idle',rise:F[K.sun]?1:0,riseGo:false,townSaid:!!F[K.town],gate:{ph:'snore',t:1.8,in:false,said:false,grace:0,n:0,caught:0},mState:'sleep',spd:0,lastP:null,songT:0,songK:0,T:{}};
  const U0=()=>G.view.camera&&G.mission.hero&&G.mission.hero();
  const say=(who,text,sec,o)=>G.dialog.say(who,text,sec,undefined,o),wait=s=>G.core.wait(s);
  const pk=()=>{const c=G.view.camera;return c&&c.aspect<1.25?Math.min(2,1.25/c.aspect):1;};
  const mark=k=>{if(st.T[k]==null)st.T[k]=+G.clock.t.toFixed(2);};
  const stage=()=>!st.arrDone?'arrive':!F[K.met]?'meet':!F[K.sun]?'town':!F[K.plaza]?'plaza':!F[K.gate]?'gate':!F[K.clear]?'end':'done';
  function quest(q){if(q!==st.lastQ){st.lastQ=q;G.ui.setQuest(q);G.goal.set(null);}}
  const ggPlace=(x,z)=>{gg.root.position.set(x,groundY(x,z),z);};
  const faceTo=(o,x,z,dt)=>{const ry=Math.atan2(x-o.position.x,z-o.position.z);if(dt==null){o.rotation.y=ry;return;}o.rotation.y+=Math.atan2(Math.sin(ry-o.rotation.y),Math.cos(ry-o.rotation.y))*Math.min(1,dt*7);};
  if(st.ggOn){const s=F[K.clear]?S_END-1.2:Math.min(sOf(spawnAt())+3,S_END-1.2),p=pointAt(s);ggPlace(p[0],p[1]);gg.root.visible=true;}
  function spawnAt(){return F[K.clear]?[END[0]+2.6,END[1]]:F[K.gate]?[GATE[0]-3,GATE[1]]:F[K.plaza]?[c0-9.5,c1]:F[K.sun]?[c0,c1+3]:F[K.met]?[0,-3]:[0,0];}
  /* 이야기 장면 감싸기(화성과 같은 방식): 원더룹은 서 있고(sceneLock — 조이스틱·화면 누르기·점프 모두 잠김), who를 주면 대화 카메라 */
  async function scene(fn,who){if(st.scene)return;const W=U0();if(!W)return;st.scene=true;const U=W.userData;if(U.stopWalk)U.stopWalk();U.sceneLock=true;
    let pc=null;if(who){W.rotation.y=Math.atan2(who.root.position.x-W.position.x,who.root.position.z-W.position.z);pc=G.view.pairCam(who.root,who.head);if(pc)G.view.hold(pc);}
    try{await fn(W,U);}catch(e){console.error(e);}finally{if(pc&&G.view.req&&G.view.req.fn===pc)G.view.hold(null);U.sceneLock=false;st.scene=false;st.lastQ=null;}}
  /* 구름이 둥실 되돌려 보냄(틀린 갈래·길 밖·문지기) — 살짝 떠서 미끄러지듯, 화면은 그대로 */
  function carryBack(W,to,sec=1.15){const U=W.userData,P=W.position,a=[P.x,P.z];if(U.stopWalk)U.stopWalk();U.sceneLock=true;U.riding={y:P.y,carry:false};U.action='서기';U.at=0;G.sound.sfx('cloud-poof',{gain:.9});puffAt(P.x,P.z,MOB?10:16,.8);
    return new Promise(res=>{st.carry={t:0,sec,a,to,res,W};});}
  function tickCarry(dt){const c=st.carry;if(!c)return;c.t+=dt;const u=Math.min(1,c.t/c.sec),e=u*u*(3-2*u),W=c.W,U=W.userData,x=lerp(c.a[0],c.to[0],e),z=lerp(c.a[1],c.to[1],e),y=groundY(x,z)+Math.sin(u*PI)*.55;
    W.position.set(x,y,z);if(U.riding)U.riding.y=y;if(Math.random()<dt*14)puffAt(x,z,1,.4);
    if(u>=1){st.carry=null;W.position.y=groundY(x,z);U.riding=null;puffAt(x,z,MOB?8:12,.7);G.sound.sfx('land',{gain:.4});if(c.to[2]!=null)W.rotation.y=c.to[2];if(!st.scene)U.sceneLock=false;st.lastP=null;c.res();}}
  /* ── ① 도착 뒤 나레이션 → 3초 조용히 → ② 거꾸리 등장 ── */
  async function intro(W,U){if(st.intro)return;st.intro=1;
    await G.core.until(()=>!document.getElementById('wlToast')?.classList.contains('on')&&!G.sound.voiceBusy(),12);await wait(.4);mark('nar');
    G.ui.toast(T.n1,5.2,T.n1);await wait(1);await G.core.until(()=>!document.getElementById('wlToast')?.classList.contains('on')&&!G.sound.voiceBusy(),14);
    await wait(3);await G.core.until(()=>!G.core.blocking()&&!G.ui.cardShown()&&!st.carry&&!(U.vert&&U.vert.air),20);mark('gg');
    await scene(async()=>{const P=W.position,s0=proj(P.x,P.z).s,far=pointAt(s0+12),dx=far[0]-P.x,dz=far[1]-P.z,d=Math.hypot(dx,dz)||1,to=[P.x+dx/d*1.9,P.z+dz/d*1.9];
      ggPlace(far[0],far[1]);gg.root.visible=true;st.ggOn=true;gg.root.rotation.y=Math.atan2(dx,dz); /* 등이 원더룹 쪽(뒷걸음으로 다가옴) */
      /* 카메라: 원더룹 등 뒤 위에서 거꾸리가 나오는 안개 쪽을(도착 카메라는 원더룹 앞쪽이라 등 뒤에서 오는 거꾸리가 안 보였다) — 만지면 플레이어 것 */
      const ec=()=>{const k=pk(),g=gg.root.position;return {at:[lerp(P.x,g.x,.45),1.0,lerp(P.z,g.z,.45)],from:[P.x-dx/d*4.6*k+dz/d*1.6,2.5+.9*(k-1),P.z-dz/d*4.6*k-dx/d*1.6]};};G.view.hold(ec);
      U.action='두리번';U.at=0;const t0=G.clock.t,len=Math.hypot(to[0]-far[0],to[1]-far[1]),TT=Math.max(1.6,len/3.4);st.ggMode='walk';let stp=0;
      await G.core.until(()=>{const u=Math.min(1,(G.clock.t-t0)/TT);ggPlace(lerp(far[0],to[0],u),lerp(far[1],to[1],u));if(u>.35){if(U.action==='두리번'){U.action='서기';U.at=0;}W.rotation.y+=Math.atan2(Math.sin(Math.atan2(dx,dz)-W.rotation.y),Math.cos(Math.atan2(dx,dz)-W.rotation.y))*.15;}
        if(Math.floor((G.clock.t-t0)*4.5)!==stp){stp=Math.floor((G.clock.t-t0)*4.5);G.sound.sfx('step',{gain:.7});}return u>=1;},TT+1);
      st.ggMode='idle';U.action='서기';U.at=0;G.react.react('startle',{sound:null});G.sound.sfx('event-pop',{gain:.6});
      {const t1=G.clock.t,r0=gg.root.rotation.y;await G.core.until(()=>{const u=Math.min(1,(G.clock.t-t1)/.45);gg.root.rotation.y=r0+PI*u*u*(3-2*u);return u>=1;},1);} /* 빙글 돌아서 원더룹을 봄 */
      W.rotation.y=Math.atan2(gg.root.position.x-P.x,gg.root.position.z-P.z);const pc=G.view.pairCam(gg.root,gg.head);if(pc)G.view.hold(pc);else if(G.view.req&&G.view.req.fn===ec)G.view.hold(null);
      try{st.ggMode='talk';await say('거꾸리',T.g2,4.6);await say('거꾸리',TMP.go,3.2);st.ggMode='idle';}finally{if(pc&&G.view.req&&G.view.req.fn===pc)G.view.hold(null);}
      G.state.setFlag(K.met,true);mark('met');U.sceneLock=false;await G.profile.meet('geokkuri',gg.root);});}
  /* ── ④ 서쪽 해돋이 광장 ── */
  const exitHere=P=>{const dx=P.x-c0,dz=P.z-c1;for(const b of PLZ.br){const a=dx*b.d[0]+dz*b.d[1],pp=Math.abs(dx*b.d[1]-dz*b.d[0]);if(a>PLZ.R+1.6&&a<PLZ.R+7&&pp<3.2)return b;}return null;};
  async function sunrise(W,U){mark('sun0');
    await scene(async()=>{const P=W.position;faceTo(gg.root,P.x,P.z);W.rotation.y=Math.atan2(gg.root.position.x-P.x,gg.root.position.z-P.z);
      st.ggMode='talk';const ln=say('거꾸리',TMP.rise,3.2);
      /* 대사하는 동안 원더룹은 광장 가운데로(해가 서쪽 출구 너머로 똑바로 보이는 자리), 거꾸리는 그 옆으로 */
      {const a=[P.x,P.z],to=[c0,c1],L=Math.hypot(to[0]-a[0],to[1]-a[1]),TT=Math.max(.6,L/3.6),t0=G.clock.t;await wait(.9);const t1=G.clock.t;U.action='걷기';U.at=0;W.rotation.y=Math.atan2(to[0]-a[0],to[1]-a[1]);st.ggTo=[c0-.5,c1+1.7];
        await G.core.until(()=>{const u=Math.min(1,(G.clock.t-t1)/TT),x=lerp(a[0],to[0],u),z=lerp(a[1],to[1],u);W.position.set(x,groundY(x,z),z);return u>=1;},TT+1);U.action='서기';U.at=0;st.lastP=null;}
      await ln;st.ggTo=null;
      /* 조작은 잠긴 채(sceneLock) 카메라가 원더룹 뒤(동쪽)에서 서쪽 지평선을 — 해가 올라오는 만큼 조금 올려다봄 */
      st.ggMode='point';faceTo(gg.root,c0-30,c1);st.faceW=true;const cam=()=>{const k=pk();return {at:[c0-18,1.5+2.9*st.rise,c1],from:[c0+7.3*k,1.75+.5*(k-1),c1+.8]};};G.view.hold(cam);
      G.state.setFlag(K.sun,true);SK.to(1,5.8);st.riseGo=true;G.sound.sfx('event-sparkle');mark('rise');
      await wait(2.8);G.react.react('awe',{sound:null});await wait(3.2);G.sound.sfx('event-open',{gain:.8});mark('sun1');
      st.faceW=false;st.ggMode='talk';faceTo(gg.root,P.x,P.z);await say('거꾸리',TMP.west,4.2,{look:'해'});st.ggMode='idle';
      if(G.view.req&&G.view.req.fn===cam)G.view.hold(null);},null);}
  async function plazaRight(W,U){G.state.setFlag(K.plaza,true);mark('plaza');G.sound.sfx('event-open',{gain:.9});puffAt(W.position.x,W.position.z,MOB?8:14,1.2,[1,.97,.86]);
    await G.core.until(()=>!G.core.blocking()&&!(U.vert&&U.vert.air),6);
    await scene(async()=>{G.sound.sfx('event-sparkle');G.react.react('awe',{sound:null});await wait(1.3);
      G.state.setFlag(DISC.sun,true);G.react.react('joy',{sound:'card-secret',bounce:false});
      await G.ui.secret({kicker:'새 발견',title:'해가 서쪽에서 떠요',text:T.n7,vo:T.n7,count:`발견 ${discN()}/${DISC_TOTAL}`,at:innerHeight>innerWidth?'bottom':null}); /* 세로 화면: 위에 뜨면 서쪽 하늘의 해를 가림 */
      mark('card1');});}
  async function plazaWrong(W,U,b,count){if(count){st.wrong++;mark('wrong'+st.wrong);}await carryBack(W,[c0,c1+1.3,Math.atan2(PLZ.inc[0],PLZ.inc[1])]);
    if(count&&st.wrong>=2&&st.wrong%2===0)await scene(async()=>{const sx=c0-PLZ.R+4,sz=c1+2.7;faceTo(gg.root,sx,sz);st.ggMode='point';
      await say('거꾸리',T.g5,3.6,{look:{at:[sx,sz],name:'그림자'}});st.ggMode='idle';mark('hint');});}
  const discN=()=>Object.values(DISC).filter(k=>F[k]).length;
  /* ── ④ 뭉게 문지기 ── */
  function gateTick(dt,W,U,P){const g=st.gate,inZone=P.x<GS[0]+.6&&P.x>GATE[0]-1.3&&Math.abs(P.z-GATE[1])<8;
    if(F[K.gate]){st.mState='sleep';qmark.show(false);return;}
    if(P.x<=GATE[0]-1.3&&Math.abs(P.z-GATE[1])<3.2){G.state.setFlag(K.gate,true);mark('gate');qmark.show(false);st.mState='sleep';G.sound.sfx('event-open',{gain:.7});
      say('뭉게 문지기',T.m11,2.6,{hear:'혼잣말',look:'잠꼬대',pin:'bottom'}).then(ok=>ok&&G.profile.meet('munge',munge.root));return;}
    if(!inZone||st.scene||st.carry){if(!st.carry&&g.ph!=='wake'){if(g.ph==='ask'){g.ph='snore';g.t=2.2;}st.mState='sleep';qmark.show(false);}return;}
    if(!g.said){g.said=true;mark('gateIn');scene(async()=>{faceTo(gg.root,P.x,P.z);st.ggMode='talk';await say('거꾸리',T.g8,4.4);st.ggMode='idle';g.ph='snore';g.t=1.8;},null);return;}
    quest('코 골 때만 살금살금 걸어요');
    const loud=!!(U.vert&&U.vert.air)||st.spd>8;
    if(g.ph==='snore'){st.mState='sleep';g.t-=dt;if(g.t<=0||loud){g.ph='ask';g.t=1.5;g.grace=loud?.6:.45;g.n++;qmark.set('?');qmark.el.classList.remove('al');qmark.show(true);G.sound.sfx('guard-notice',{gain:.9});say('뭉게 문지기',T.m9,1.3,{hear:'혼잣말',look:'뒤척임',pin:'bottom'});mark('ask'+g.n);}}
    else if(g.ph==='ask'){st.mState='ask';g.t-=dt;g.grace-=dt;
      if(g.grace<=0&&(st.spd>.6||(U.vert&&U.vert.air))){g.ph='wake';g.caught++;qmark.set('!');qmark.el.classList.add('al');st.mState='wake';G.sound.sfx('guard-alert');mark('caught'+g.caught);
        scene(async()=>{G.react.react('startle',{sound:null});const s=say('뭉게 문지기',T.m10,2.4,{hear:'혼잣말',look:'깜짝',pin:'bottom'});await wait(.45);await carryBack(W,[GS[0]+1.2,GS[1],-PI/2],1.3);await s;qmark.show(false);st.mState='sleep';g.ph='snore';g.t=2.2;},null);}
      else if(g.t<=0){g.ph='snore';g.t=2.4;qmark.show(false);}}}
  /* ── ⑤ 구름 끝: 얼음 조각 배 ── */
  const BY=SEA+.55;
  async function ending(W,U){const P=W.position;faceTo(gg.root,P.x,P.z);W.rotation.y=Math.atan2(gg.root.position.x-P.x,gg.root.position.z-P.z);mark('end');
    {const pc=G.view.pairCam(gg.root,gg.head);if(pc)G.view.hold(pc);st.ggMode='talk';await say('거꾸리',T.g12,5.2);await say('거꾸리',T.g13,3.6);st.ggMode='idle';if(pc&&G.view.req&&G.view.req.fn===pc)G.view.hold(null);}
    /* 배가 떠 옴 */
    const B={x:-107,z:-27,ry:.5};boat.visible=true;const setBoat=t=>{boat.position.set(B.x,BY+Math.sin(t*1.7)*.05,B.z);boat.rotation.set(Math.sin(t*1.3)*.03,B.ry,Math.sin(t*1.1)*.04);};st.boat={B,setBoat};
    const cam=()=>{const k=pk();return {at:[B.x+.4,BY+1.5,B.z],from:[B.x+5.2*k,BY+2.9+.9*(k-1),B.z+6.2*k]};};
    faceTo(gg.root,-107,-27);W.rotation.y=Math.atan2(-107-P.x,-27-P.z);st.ggMode='point';G.sound.sfx('event-sparkle');
    {const t0=G.clock.t,a=[B.x,B.z];await G.core.until(()=>{const u=Math.min(1,(G.clock.t-t0)/3.2),e=1-Math.pow(1-u,2.4);B.x=lerp(a[0],DOCK[0],e);B.z=lerp(a[1],DOCK[1],e);B.ry=lerp(.5,0,e);return u>=1;},4.5);}
    st.ggMode='idle';G.sound.sfx('cloud-poof',{gain:.7});G.view.hold(cam);
    /* 둘이 올라탐: 거꾸리가 먼저(뱃머리 쪽, 거꾸로 앉음 — 원더룹을 봄), 원더룹이 뒤따라 */
    const hop=(from,to,sec,fn)=>{const t0=G.clock.t;return G.core.until(()=>{const u=Math.min(1,(G.clock.t-t0)/sec),e=u*u*(3-2*u);fn(lerp(from[0],to[0],e),lerp(from[1],to[1],e)+Math.sin(u*PI)*.8,lerp(from[2],to[2],e));return u>=1;},sec+1);};
    {const r=gg.root.position;G.sound.sfx('jump',{gain:.6});await hop([r.x,r.y,r.z],[DOCK[0]-.75,BY+.14,DOCK[1]],.7,(x,y,z)=>gg.root.position.set(x,y,z));gg.root.rotation.y=PI/2;st.ggSit=true;G.sound.sfx('event-pop',{gain:.5});}
    {U.riding={y:P.y,carry:false};G.sound.sfx('jump');await hop([P.x,P.y,P.z],[DOCK[0]+.55,BY+.3,DOCK[1]],.8,(x,y,z)=>{W.position.set(x,y,z);U.riding.y=y;});W.rotation.y=-PI/2;U.action='앉기';U.at=0;st.aboard=true;G.sound.sfx('event-pop');G.react.react('joy',{sound:null,bounce:false});}
    mark('boat');await wait(.9);
    G.state.setFlag(DISC.air,true);G.sound.sfx('card-secret');
    await G.ui.secret({kicker:'새 발견',title:'구름 위는 지구와 비슷해요',text:T.n14,vo:T.n14,count:`발견 ${discN()}/${DISC_TOTAL}`,at:innerHeight>innerWidth?'bottom':null}); /* 세로 화면: 위에 뜨면 구름 바다 너머 비행선을 가림 */await wait(.4);
    await G.ui.notice({kicker:'우주 지도',title:'구름 행성을 그렸어요!',text:T.n18,vo:T.n18,icon:SPACE.icons.map()});mark('map');
    /* 출발 → 완료 카드 → (쉼터가 생길 때까지) 구름 끝으로 돌아와 내려 줌 */
    G.sound.sfx('travel-depart',{gain:.7});{const t0=G.clock.t;await G.core.until(()=>{const u=Math.min(1,(G.clock.t-t0)/3.4),e=u*u;B.x=lerp(DOCK[0],DOCK[0]-9.5,e);B.z=lerp(DOCK[1],DOCK[1]+2.2,e);B.ry=lerp(0,-.22,e);return u>=1;},5);}
    G.sound.sfx('mission-clear');G.state.setFlag(K.clear,true);mark('clear');G.state.saveAfter(ZID,{time:0});
    await Promise.race([G.ui.itemCard({title:'STAGE 3 완료!',text:'구름 행성 탐험 완료 · 다음 목적지: 토성 쉼터',icon:SPACE.icons.map(),sec:3.2,sound:null,who:'완료'}),wait(3.8)]);
    {const t0=G.clock.t,a=[B.x,B.z,B.ry];await G.core.until(()=>{const u=Math.min(1,(G.clock.t-t0)/2.6),e=u*u*(3-2*u);B.x=lerp(a[0],DOCK[0],e);B.z=lerp(a[1],DOCK[1],e);B.ry=lerp(a[2],0,e);return u>=1;},4);}
    st.aboard=false;U.action='서기';U.at=0;G.sound.sfx('jump');{const p=W.position,to=[END[0]-1.3,groundY(END[0]-1.3,END[1]),END[1]];await hop([p.x,p.y,p.z],to,.8,(x,y,z)=>{W.position.set(x,y,z);U.riding.y=y;});U.riding=null;W.rotation.y=PI/2;G.sound.sfx('land',{gain:.5});puffAt(to[0],to[2],8,.6);}
    st.ggSit=false;{const r=gg.root.position,to=[END[0]-1.6,groundY(END[0]-1.6,END[1]-1.7),END[1]-1.7];await hop([r.x,r.y,r.z],to,.7,(x,y,z)=>gg.root.position.set(x,y,z));}
    if(G.view.req&&G.view.req.fn===cam)G.view.hold(null);st.boat=null;st.ggHome=[END[0]-1.6,END[1]-1.7];mark('done');}
  /* ── 비밀: 또생일 ── */
  G.dialog.npc({id:'geokkuri',name:'거꾸리',root:gg.root,bubbleY:gg.head+.32,talkR:.9,bubbleR:4.5,variants:[{when:()=>true,lines:[]},{when:()=>!!F[K.met]&&!F[K.sun]&&!st.scene&&!st.carry&&gg.root.visible&&(st.ggWait||G.dialog.talking()),lines:[TMP.again]},
    {when:()=>!!F[K.sun]&&!st.scene&&!st.carry&&st.gate.ph==='snore'&&gg.root.visible&&(st.ggWait||G.dialog.talking()),lines:[T.g19]}]}); /* 뒤에 있는 맞는 묶음이 이김(dialog rawLines) — 빈 묶음을 맨 앞에 */
  G.dialog.npc({id:'munge',name:'뭉게 문지기',root:munge.root,bubbleY:2.3,talkR:1.4,bubbleR:.01,variants:[{when:()=>true,lines:[]}]}); /* 말 걸 상대가 아님(자는 중) — 대사 줄에서 이름으로 찾을 수 있게만 */
  G.dialog.npc({id:'ddo',name:'또생일',root:ddo.root,bubbleY:1.0,talkR:1.0,bubbleR:4.5,onDone:()=>{if(!F[K.ddo]){G.state.setFlag(K.ddo,true);mark('ddo');G.profile.meet('ddo',ddo.root);}},
    variants:[{when:()=>true,lines:[]},{when:()=>!F[K.ddo]&&!st.scene,lines:[T.d15,T.d16]},{when:()=>!!F[DISC.day]&&!st.scene,lines:[T.d15]}]});
  const cakeMark=new THREE.Object3D();cakeMark.position.set(CAKE[0],groundY(...CAKE)+.3,CAKE[1]);add(cakeMark);
  G.interact.add({root:cakeMark,at:[CAKE[0]-.75,CAKE[1]+.55],face:CAKE,label:'촛불 불기',action:'들여다보기',dur:.9,near:2.1,once:false,when:()=>!!F[K.ddo]&&!F[DISC.day]&&!st.scene&&!G.ui.cardShown(),
    onDone:()=>scene(async(W)=>{cake.lit(false);candle.material.opacity=.2;G.sound.sfx('event-sparkle');puffAt(CAKE[0],CAKE[1],MOB?14:24,1.5,[1,.9,.55]);G.react.react('joy',{sound:null});st.ddoHop=1.6;await wait(1.1);
      G.state.setFlag(DISC.day,true);G.sound.sfx('card-secret');mark('candle');await G.ui.secret({kicker:'숨겨진 비밀',title:'하루가 1년보다 길어요',text:T.n17,vo:T.n17,count:`발견 ${discN()}/${DISC_TOTAL}`});},null)});
  /* ── 구역 카메라: 해돋이를 본 뒤 광장 안에서는(나갈 길을 찾을 때까지) 위로 올라가 출구 셋과 동쪽으로 뻗는 그림자를 한 화면에 — 가로 화면은 북쪽 위에서(동서 출구가 화면 가로로), 세로 화면은 동쪽 높이에서 서쪽을(맞는 길이 위, 그림자는 아래로).
       문 구역에서는 원더룹과 뭉게 문지기가 한 화면에 들어오는 거리(둘 사이가 멀수록 물러남). 벗어나면 원래 카메라, 플레이어가 카메라를 만지면 그 구역을 나갈 때까지 플레이어 것. 카메라 시야각이 30°라 멀리 물러나야 다 보인다 */
  function zoneCam(dt,W,P){let want=null;const pt=pk()>1.3;
    if(F[K.sun]&&!F[K.plaza]&&!st.boat&&(!st.scene||(st.zc&&st.zc.id==='plz'))&&dPlz(P.x,P.z)<PLZ.R+(st.zc&&st.zc.id==='plz'?2.2:.6))want={id:'plz',fog:1,fn:()=>pk()>1.3
      ?{at:[c0-1,0,c1],from:[c0+27,35,c1]}
      :{at:[c0,0,c1-1.4],from:[c0,21,c1+20.5]}};
    if(!want&&stage()==='gate'&&st.gate.said&&P.x<GS[0]+1.6&&P.x>GATE[0]-1.3&&Math.abs(P.z-GATE[1])<8)want={id:'gate',fog:0,fn:()=>{const p2=pk()>1.3,Q2=W.position,dx=Q2.x-MUNGE[0],dz=Q2.z-MUNGE[1],d=Math.hypot(dx,dz)||1,ax=lerp(Q2.x,MUNGE[0],.5),az=lerp(Q2.z,MUNGE[1],.5),D=(9.5+d*.7)*(p2?1.5:1.18),
      a=Math.atan2(dz,dx)+.28,hx=Math.cos(a),hz=Math.sin(a); /* 문지기 → 원더룹 방향에서 남쪽으로 조금 돌아간 쪽 뒤 위: 둘이 화면 가운데 세로로 나란히(멀수록 물러남) */
      return {at:[ax,p2?-2.2:-1.1,az],from:[ax+hx*D*.84,1.5+D*.5,az+hz*D*.84]};}};
    if(want){if(!st.zc||st.zc.id!==want.id){if(st.zcOff!==want.id){if(st.zc&&G.view.req&&G.view.req.fn===st.zc.fn)G.view.hold(null);st.zc={...want,t:0};G.view.hold(want.fn);}}
      else{st.zc.t+=dt;if(st.zc.t>.3&&!st.scene&&!(G.view.req&&G.view.req.fn===st.zc.fn)){st.zcOff=st.zc.id;st.zc=null;}}} /* 만져서 풀렸으면 이 구역에서는 다시 잡지 않음 */
    else{if(st.zc){if(G.view.req&&G.view.req.fn===st.zc.fn)G.view.hold(null);st.zc=null;}st.zcOff=null;}
    st.fv+=((st.zc&&st.zc.fog?1:0)-st.fv)*Math.min(1,dt*2.6);}
  /* ── 매 프레임 ── */
  function update(dt,t){const W=U0();if(!W)return;const U=W.userData,P=W.position,cam=G.view.camera;
    mark('start');if(pend&&!started){started=true;arr=cloudArrival({G,root,WL:W,groundY,mob:MOB,onDone:()=>{st.arrDone=true;mark('land');G.ui.toast('구름 행성 금성에 도착했어요! 금성은 온통 두꺼운 구름에 덮여 있어요',4.2,'구름 행성 금성에 도착했어요!');}});}
    if(arr)arr.tick(dt,t);puffs.tick(dt);tickCarry(dt);
    /* 해돋이(st.rise 0 → 1): 서쪽 빛 띠가 밝아지고 해가 지평선 아래(-3°)에서 +8.5°로, 기둥 그림자가 나타남. 안개는 진행에 따라 천천히 */
    if(st.riseGo){st.rise=Math.min(1,st.rise+dt/5.8);if(st.rise>=1)st.riseGo=false;}
    if(st.faceW)W.rotation.y+=Math.atan2(Math.sin(-PI/2-W.rotation.y),Math.cos(-PI/2-W.rotation.y))*Math.min(1,dt*4);
    {const g=fogWant();st.fog[0]+=(g[0]-st.fog[0])*Math.min(1,dt*.9);st.fog[1]+=(g[1]-st.fog[1])*Math.min(1,dt*.9);zoneCam(dt,W,P);const pt=pk()>1.3,fp=[st.fog[0]+st.fv*(pt?34:12),st.fog[1]+st.fv*(pt?40:14)];SK.fogPush=fp; /* 위에서 보는 카메라가 멀리 있어 그동안만 안개를 더 밀어냄 */
      const r=st.rise,e=r*r*(3-2*r),d=(PRE.fogFar+fp[1])*.86,el=(-3.2+11.7*e)*PI/180,C=cam.position;
      band.position.set(C.x-d,C.y+d*.02,C.z);band.scale.set(d*2.1,d*(.5+.2*e),1);band.material.opacity=(F[K.met]?.5:.3)+.35*e;
      glow.visible=r>.03;glow.position.set(C.x-Math.cos(el)*d*.98,C.y+Math.sin(el)*d*.98,C.z);glow.scale.setScalar(d*.42);glow.material.opacity=ss(.04,.5,r);
      shMesh.visible=r>.02;shMat.opacity=e;}
    /* 원더룹 빠르기(문지기 판정) */
    {if(st.lastP&&dt>0){const v=Math.hypot(P.x-st.lastP[0],P.z-st.lastP[1])/dt;st.spd+=(v-st.spd)*Math.min(1,dt*18);}st.lastP=[P.x,P.z];}
    /* 주민 움직임 */
    const beat=munge.tick(dt,t,st.mState);if(beat&&Math.hypot(P.x-MUNGE[0],P.z-MUNGE[1])<20&&!F[K.clear])G.sound.sfx('event-snore',{gain:Math.max(.25,1-Math.hypot(P.x-MUNGE[0],P.z-MUNGE[1])/22)});
    ddo.tick(dt,t,st.ddoHop>0?'talk':'idle');if(st.ddoHop>0)st.ddoHop-=dt;if(!st.scene)faceTo(ddo.root,P.x,P.z,Math.hypot(P.x-SEC[0],P.z-SEC[1])<5?dt:0);cake.tick(t);
    if(Math.hypot(P.x-SEC[0],P.z-SEC[1])<18&&!st.scene&&!G.dialog.talking()){st.songT-=dt;if(st.songT<=0){st.songT=3.3;G.sound.sfx('tune-birthday',{phrase:st.songK++,gain:Math.max(.12,.75*(1-Math.hypot(P.x-SEC[0],P.z-SEC[1])/18))});}}
    /* 굴뚝 연기: 아래로 흘러내려 땅에 깔림(가까운 집만) · 비행선: 구름 바다 위를 천천히 */
    for(const s of smokes)if(Math.abs(s[0]-P.x)+Math.abs(s[2]-P.z)<36&&Math.random()<dt*4){const k=.82+Math.random()*.14;puffs.emit(s[0],s[1],s[2],(Math.random()-.5)*.7,-1.0,(Math.random()-.5)*.7,2.4+Math.random()*1.2,[.84*k,.78*k,.92*k]);}
    if(st.ggTo&&st.scene){const r=gg.root.position,dx=st.ggTo[0]-r.x,dz=st.ggTo[1]-r.z,d=Math.hypot(dx,dz);if(d>.08){const v=Math.min(d,4.6*dt);ggPlace(r.x+dx/d*v,r.z+dz/d*v);}}
    {const a=t*.07,o=Math.sin(a)*3-(pk()>1.3?0:20); /* 가로 화면에서는 왼쪽으로 비켜서(위 가운데 발견 카드에 가리지 않게) */ship.position.set(SHIP[0]+o*.79,SHIP[1]+Math.sin(t*.4)*.35,SHIP[2]-o*.61);ship.rotation.set(Math.sin(t*.5)*.03,.55+Math.sin(a)*.22,Math.sin(t*.33)*.03);}
    if(st.boat)st.boat.setBoat(t);if(st.aboard){const B=st.boat.B;W.position.set(B.x+.55,boat.position.y+.6,B.z);U.riding.y=W.position.y;}
    if(st.ggSit&&st.boat){const B=st.boat.B;gg.root.position.set(B.x-.75,boat.position.y+.44,B.z);}
    /* 거꾸리 길잡이: 원더룹보다 5.5m 앞, 길 한쪽 옆(1.25m)에서 뒷걸음. 광장을 풀기 전에는 광장 안 기다리는 자리(PLZ.wait)에서 멈춤(답을 먼저 가지 않음).
       걷는 동안은 말 걸 상대가 아님('말 걸기'·'…' 없음) — 멈춰 기다릴 때(광장·문 앞뒤·구름 끝)만 st.ggWait */
    let gm=st.ggMode;st.ggWait=false;if(st.ggOn&&!st.scene&&!st.boat&&!G.dialog.talking()){const r=gg.root.position;let tx,tz,hold=false;
      const side=s=>{const a=pointAt(s-.4),b=pointAt(s+.4),l=Math.hypot(b[0]-a[0],b[1]-a[1])||1;return [(b[1]-a[1])/l,-(b[0]-a[0])/l];};
      if(st.ggHome){[tx,tz]=st.ggHome;hold=true;}else{const pz=!F[K.plaza],cap=pz?S_PIN:F[K.gate]?S_END-1.2:st.gate.said?S_GATE+3.2:S_GS-1.6,s=proj(P.x,P.z).s+5.5;
        if(s>=cap){hold=true;if(pz){tx=c0+PLZ.wait[0];tz=c1+PLZ.wait[1];}else{const p=pointAt(cap),q=side(cap);tx=p[0]+q[0]*1.5;tz=p[1]+q[1]*1.5;}}
        else{const p=pointAt(s),q=side(s);tx=p[0]+q[0]*1.25;tz=p[1]+q[1]*1.25;}}
      const dx=tx-r.x,dz=tz-r.z,d=Math.hypot(dx,dz);if(d>.12){const v=Math.min(5.6,d*5),s=Math.min(d,v*dt);ggPlace(r.x+dx/d*s,r.z+dz/d*s);gm=v>.5?'walk':'idle';}else{gm='idle';st.ggWait=hold;}
      faceTo(gg.root,P.x,P.z,dt);}
    else if(st.ggOn&&G.dialog.talking()){faceTo(gg.root,P.x,P.z,dt);gm='talk';}
    gg.tick(dt,t,st.ggSit?'sit':gm);
    if(blobs){const b=(i,o,r,on)=>blobs.set(i,o.position.x,groundY(o.position.x,o.position.z)+.03,o.position.z,on?r:0);b(0,gg.root,.42,gg.root.visible&&!st.ggSit);b(1,munge.root,1.25,true);b(2,ddo.root,.26,true);blobs.instanceMatrix.needsUpdate=true;}
    if(!st.arrDone||(G.front.frontShown&&G.front.frontShown()))return;
    if(st.scene||st.carry||U.riding)return;
    const sg=stage();
    if(sg==='meet'){quest('');intro(W,U);}
    else if(sg==='town'){quest('거꾸리를 따라 마을을 지나가요');
      /* 마을에 들어설 때 한 번: 따라가기 카메라를 낮춰 집·나무와 먼 구름 탑이 화면에 들어오게(1.2초 — 그 뒤로는 플레이어 것, 만지면 그만) */
      const C=G.controls.input.cam;if(C&&st.camLow==null){st.camLow=0;st.camU=C.user;st.camP=C.pitch;}if(C&&st.camLow<1&&C.user===st.camU&&!G.ui.cardShown()){st.camLow=Math.min(1,st.camLow+dt/1.2);const e=st.camLow*st.camLow*(3-2*st.camLow);C.pitch=lerp(st.camP,Math.min(st.camP,.2),e);}}
    else if(sg==='plaza')quest('해를 보고 길을 찾아요');
    else if(sg==='gate'){if(!st.gate.said||P.x>GS[0]+.6)quest('거꾸리를 따라가요');}
    else if(sg==='end')quest('구름 끝으로 가요');else quest('');
    if(G.core.blocking()||G.ui.cardShown()||G.dialog.talking())return;
    const air=!!(U.vert&&U.vert.air),q=proj(P.x,P.z),dp=dPlz(P.x,P.z);
    /* ③ 마을 입구 대사 자리(멈추지 않음) · ④ 광장에 들어서면 해돋이 */
    if(sg==='town'&&!st.townSaid&&q.s>S_TOWN&&q.d<4&&!air){st.townSaid=true;G.state.setFlag(K.town,true);mark('town');say('거꾸리',TMP.town,3.6);return;}
    if(sg==='town'&&dp<5.8&&!air){sunrise(W,U);return;}
    /* 광장 출구: 서쪽 = 맞는 길, 동쪽·남쪽 = 구름이 되돌림 */
    if(F[K.sun]&&!air){const b=exitHere(P);if(b){if(b.ok){if(!F[K.plaza]){plazaRight(W,U);return;}}else{plazaWrong(W,U,b,!F[K.plaza]);return;}}}
    /* 길에서 멀리 벗어나면 구름이 길로 되돌림(광장 안·또생일네 집과 샛길은 괜찮음) */
    if(!air){const inSec=Math.hypot(P.x-SEC[0],P.z-SEC[1])<6.5||segD(P.x,P.z,SPUR[0],SPUR[1]).d<4,inP=dp<PLZ.R+2.4;if(q.d>6&&!inSec&&!inP){carryBack(W,[q.pt[0],q.pt[1]]);return;}
      if(!F[K.plaza]&&q.s>S_PLZ+PLZ.R+3&&!inP){carryBack(W,[c0,c1+1.3]);return;}}
    if(sg==='gate')gateTick(dt,W,U,P);
    if(sg==='end'&&P.x<END[0]+3.2&&!air)scene(ending,null);}
  function lateUpdate(dt,t){if(arr)arr.late(dt,t);}
  const sp=spawnAt();
  return {name:'구름 행성',kind:'outdoor',start:{compass:true},world:null,
    spawn:{x:sp[0],z:sp[1],ry:sp[0]<-40?-PI/2:PI},
    areas:{field:{bounds:BX,obstacles,camera:{target:[0,1,0],dist:9,polar:[.45,1.35],azimuth:null,start:[2.6,.95],minDist:3,maxDist:30}}},
    sun:{dir:new THREE.Vector3(...PRE.sunDir).normalize(),shadow:16,follow:true},
    sky:SK,after:()=>({time:F[K.sun]?1:0}),far:280,ambience:'wind',charFog:.12, /* 캐릭터는 안개를 아주 약하게(game/bend markChar — 주민·배도, 배경 안개는 그대로) */groundY,ground:[ground],keepOut:keep,
    arrival:()=>arr,
    state:()=>({arrDone:st.arrDone,landed:!!(arr&&arr.state.landed),stage:stage(),scene:st.scene,carry:!!st.carry,sun:!!F[K.sun],plaza:!!F[K.plaza],rise:+st.rise.toFixed(2),wrong:st.wrong,gate:st.gate.ph,gateN:st.gate.n,caught:st.gate.caught,gateSaid:st.gate.said,quest:st.lastQ||'',fog:st.fog.map(v=>+v.toFixed(1)),
      ggWait:!!st.ggWait,zc:st.zc?st.zc.id:null,gg:[+gg.root.position.x.toFixed(2),+gg.root.position.z.toFixed(2),+gg.root.rotation.y.toFixed(2),gg.root.visible],spd:+st.spd.toFixed(2),aboard:!!st.aboard,boat:st.boat?[+st.boat.B.x.toFixed(1),+st.boat.B.z.toFixed(1)]:null,T:{...st.T},t:+G.clock.t.toFixed(2),disc:discN(),met:!!F[K.met],clear:!!F[K.clear]}),
    spots:{spawn:[0,0],path:PATH,plaza:{c:PLZ.c,R:PLZ.R,inc:PLZ.inc,br:PLZ.br.map(b=>({d:b.d,ok:!!b.ok,n:b.n}))},pin:pointAt(S_PIN),town:pointAt(S_TOWN),houses,sheep,dhouse:DHOUSE,gs:GS,gate:GATE,end:END,sec:SEC,cake:CAKE,munge:MUNGE,shd:SHD,ship:SHIP},
    update,lateUpdate,dispose(){if(arr){arr.dispose();arr=null;}qmark.remove();floats.forEach(f=>f.remove());puffs.dispose();const W=U0();if(W){W.scale.set(1,1,1);W.userData.sceneLock=false;if(st.carry||st.aboard)W.userData.riding=null;}}};}
