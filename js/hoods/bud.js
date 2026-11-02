/* 원더룹 탈: 꽃봉오리 (요정의 숲) — 기준 그림 wonderloop-studio/fairy-forest/ref/match/bud-hood-sheet.png (닫힘 정면·옆, 핌 정면·옆)
   머리 윗부분을 연둣빛 꽃받침 모자가 덮고, 이마 높이 둘레에 뾰족한 꽃받침 잎이 왕관처럼 둘러선다. 그 위로 분홍 꽃잎 봉오리.
   꽃잎은 아래가 크림빛, 끝으로 갈수록 진한 분홍. 귀는 밖에 둔다(둥근 귀가 드러남). 머리카락은 꽃받침 모자 안쪽만 눌러 넣는다(06 pressHair) → 지그재그 앞머리가 잎 아래로 보인다.
   두 모습: build(false) 닫힌 봉오리 · build(true) 활짝 핀 꽃 — 06 HOODS에 'bud'·'bloom' 두 칸. 꽃받침 모자·잎은 같고 꽃잎만 다르다.
   핀 꽃(2026-11-02 장미처럼 다시 만듦 — 연꽃처럼 반구에 꽃잎을 하나씩 꽂은 느낌이던 것): 밑동 반구 없이 꽃잎만으로.
     꽃잎은 안쪽으로 오목한 숟가락 모양 한 장(rosePetal — 밑동이 좁고 위가 둥글게 넓음, 가로로 오목, 바깥 겹일수록 끝·가장자리가 바깥으로 말림).
     가운데에서 바깥으로 황금각(137.5°)씩 돌며 나선으로 놓아 꽃잎마다 앞 꽃잎을 반쯤 덮는다. 안쪽은 작고 꼭 오므리고, 바깥으로 갈수록 크고 벌어진다.
     밑동은 꽃잎을 촘촘히(28장) 겹쳐 머리 위를 덮고, 그래도 생기는 좁은 틈 아래에는 짙은 분홍 속꽃잎 그늘(작은 오목 그릇, 꽃잎 아래에 숨음)을 둬 머리가 비치지 않게.
     가운데 두 가지(주소 ?bloom=pod로 고름 — 기본은 rose): rose 꼭 오므린 속꽃잎 · pod 작은 연두 연밥과 노란 꽃술 한 줄.
     앞쪽(얼굴 쪽) 꽃잎은 더 눕혀 이마 위로(정면 눈높이에서 얼굴을 가리지 않게). 색은 아래 크림·연분홍 → 끝 진분홍.
   animate(g,u): 06 morphHood가 'bloom'으로 바뀔 때 u 0→1로 부른다 → 꽃잎이 닫힌 각도에서 핀 각도로 천천히 열린다(바깥 겹이 먼저, 안쪽이 뒤따라).
   좌표는 머리(head 뼈) 기준. 꽃잎 그림은 캔버스 256(아틀라스 교체 영역). 난수 없이 늘 같은 그림. */
import * as THREE from 'three';
import {PI,lathe} from '../01-textures.js';
// 꽃받침 모자 [반지름, 높이] — 탐험 모자·도토리처럼 정수리를 덮는 둥근 지붕(머리 눌림이 같은 값을 쓴다)
const PROF=[[.47,0],[.468,.06],[.452,.13],[.415,.2],[.355,.26],[.27,.305],[.16,.335],[0,.345]];
// 꽃잎 하나의 옆모양(회전체 → 납작하게): 아래는 좁고 가운데가 통통, 끝은 뾰족
const PETAL=[[0,0],[.12,.04],[.21,.14],[.25,.27],[.24,.41],[.19,.54],[.1,.65],[0,.72]].map(q=>new THREE.Vector2(q[0],q[1]));
let petalTex=null,sepalTex=null,bloomTex=null;
function petalCanvas(bloom=false){const S=256,cv=document.createElement('canvas');cv.width=cv.height=S;const g=cv.getContext('2d');
  // v(아래 → 위) = 캔버스 아래 → 위: 크림 → 연분홍 → 진분홍 끝
  const gr=g.createLinearGradient(0,S,0,0);gr.addColorStop(0,bloom?'#fae6d6':'#f8e6d2');gr.addColorStop(.35,bloom?'#f8cdd0':'#f6c9c6'); // 핀 꽃: 아래 크림·연분홍 → 끝 진분홍
  gr.addColorStop(.75,'#f19ab0');gr.addColorStop(1,bloom?'#e37096':'#e8799a');g.fillStyle=gr;g.fillRect(0,0,S,S);
  // 색연필 결: 위아래로 긋는 가는 줄(결정된 간격, 난수 없음)
  for(let i=0;i<64;i++){const x=(i*37)%S,a=.05+((i*13)%7)*.012;g.strokeStyle=`rgba(255,255,255,${a})`;g.lineWidth=1.2+(i%3)*.6;g.beginPath();g.moveTo(x,S);g.bezierCurveTo(x+6,S*.66,x-5,S*.33,x+3,0);g.stroke();}
  for(let i=0;i<40;i++){const x=(i*53+17)%S;g.strokeStyle=`rgba(214,96,130,${.04+(i%4)*.015})`;g.lineWidth=1;g.beginPath();g.moveTo(x,S*.55);g.lineTo(x+4,0);g.stroke();}
  return cv;}
function sepalCanvas(){const S=256,cv=document.createElement('canvas');cv.width=cv.height=S;const g=cv.getContext('2d');
  const gr=g.createLinearGradient(0,S,0,0);gr.addColorStop(0,'#6f8f4e');gr.addColorStop(1,'#93ad69');g.fillStyle=gr;g.fillRect(0,0,S,S);
  for(let i=0;i<70;i++){const x=(i*29)%S,y=(i*71)%S;g.strokeStyle=`rgba(${i%2?'230,240,200':'60,80,40'},${.06+(i%5)*.012})`;g.lineWidth=1.4;g.beginPath();g.moveTo(x,y);g.lineTo(x+10,y-22);g.stroke();}
  return cv;}
const tex=cv=>{const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;return t;};
// 꽃잎 각도: [기울기(+면 바깥으로 젖힘), 위치 반지름, 높이] — 닫힘·핌
const OUTER={n:5,r:.3,y:.2,closed:-.5,open:1.38,s:1};
const INNER={n:3,r:.1,y:.25,closed:-.16,open:.95,s:1.05};
// 핀 꽃(장미): 나선 꽃잎 — 안쪽부터 i번째 꽃잎은 황금각만큼 돌고, 밑동 반지름·크기·눕힘이 바깥으로 갈수록 커진다
const ROSE_N=34,GOLD=PI*(3-Math.sqrt(5)),BLOOM_CENTER=(typeof location!=='undefined'&&new URLSearchParams(location.search).get('bloom'))==='pod'?'pod':'rose';
/* 숟가락 꽃잎 한 장: 밑동이 원점, +y가 끝, +z가 바깥(꽃 밖), 안쪽(-z, 꽃 가운데)으로 오목. curl 0~1 = 끝·가장자리가 바깥으로 말리는 정도(바깥 겹) */
function rosePetal(w,L,curl){const NU=8,NV=9,pos=[],uv=[],idx=[];
  const hw=v=>w/2*(v<.6?.42+.58*Math.sqrt(Math.max(0,1-((v-.6)/.6)**2)):Math.max(0,1-((v-.6)/.4)**2)**.32); // 밑동은 좁지만 이웃과 겹칠 만큼, 6할 높이에서 가장 넓고, 끝은 넓고 둥글게(장미 꽃잎)
  for(let j=0;j<=NV;j++){const v=j/NV;for(let i=0;i<=NU;i++){const u=i/NU*2-1,x=u*hw(v),y=v*L;
    let z=-.32*w*u*u*Math.sin(PI*Math.min(1,v*.9+.1))**.6 // 가로로 오목(가장자리가 꽃 가운데 쪽으로)
      +.06*L*Math.sin(PI*v) // 세로로 등이 살짝 불룩(숟가락)
      +curl*(.22*L*Math.max(0,(v-.62)/.38)**2+.18*w*u**4*Math.max(0,(v-.45)/.55)); // 바깥 겹: 끝과 가장자리가 바깥으로 말림
    pos.push(x,y,z);uv.push(i/NU,v);}}
  for(let j=0;j<NV;j++)for(let i=0;i<NU;i++){const a=j*(NU+1)+i,b=a+NU+1;idx.push(a,a+1,b,a+1,b+1,b);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
export function build({head,wm,SM},open=false){
  const g=new THREE.Group();g.position.set(0,.15,-.025);g.rotation.x=-.1;g.scale.set(1,1,.9);head.add(g);
  petalTex=petalTex||tex(petalCanvas());sepalTex=sepalTex||tex(sepalCanvas());
  const sepM=new THREE.MeshStandardMaterial({map:sepalTex,roughness:.9,metalness:0});
  const petM=new THREE.MeshStandardMaterial({map:petalTex,roughness:.8,metalness:0});
  const bloomM=open?new THREE.MeshStandardMaterial({map:bloomTex||(bloomTex=tex(petalCanvas(true))),roughness:.8,metalness:0}):null;
  // 꽃받침 모자·뒤통수 덮개는 닫힌 봉오리만(핀 꽃은 꽃잎만으로 — 2026-11-02 장미)
  if(!open){g.add(wm(lathe(PROF.map(q=>new THREE.Vector2(q[0]*1.01,q[1])),40),sepM));
  // 뒤통수 덮개: 꽃받침 모자 아래로 뒷머리 위쪽을 감싼다(시트처럼 머리 뒤가 초록) — 옆·앞은 열어 귀·얼굴이 보이게
  {const back=wm(new THREE.SphereGeometry(.47,24,10,PI*1.12,PI*.76,PI*.5,PI*.22),sepM);back.scale.set(1.01,1,1.01);g.add(back);}}
  // 꽃받침 잎: 봉오리 아랫부분을 둘러 감싸는 넓적한 잎 7장(레퍼런스처럼 꽃을 받쳐 안는 모양) + 관자놀이 쪽 아래로 늘어진 잎 4장(귀 위를 덮지 않고 얼굴 둘레를 감쌈)
  const cupG=lathe([[0,0],[.1,.05],[.14,.15],[.12,.26],[.06,.34],[0,.38]].map(q=>new THREE.Vector2(q[0],q[1])),8).scale(1.25,1,.3);
  const sepals=[];
  if(!open)for(let i=0;i<7;i++){const a=i/7*PI*2+.2,piv=new THREE.Group();piv.position.set(Math.sin(a)*.37,.13,Math.cos(a)*.37);piv.rotation.y=a;g.add(piv);
    const L=wm(cupG,sepM);L.scale.setScalar(.9);piv.add(L);piv.rotation.x=open?.75:.24;sepals.push(piv);} // 꽃잎 바깥에 붙어(서로 파고들지 않게) 살짝 벌어짐 // 닫힘: 봉오리에 붙어 위로, 핌: 꽃잎과 함께 바깥으로
  const sideG=lathe([[0,0],[.08,.05],[.1,.14],[.07,.24],[0,.32]].map(q=>new THREE.Vector2(q[0],q[1])),6).scale(1.2,1,.32);
  if(!open)[[-1,.5],[-1,-.15],[1,.5],[1,-.15]].forEach(([sd,dz])=>{const a=sd*PI/2-sd*dz,L=wm(sideG,sepM);L.position.set(Math.sin(a)*.45,.02,Math.cos(a)*.45);L.rotation.set(0,a,0);L.rotateX(2.05);L.scale.setScalar(1.05);g.add(L);});
  const petals=[];let stamen=null;
  if(!open){ // 닫힌 봉오리: 바깥 다섯, 안쪽 셋
    const petG=lathe(PETAL,12).scale(1.3,1,.45);
    for(const P of [OUTER,INNER])for(let i=0;i<P.n;i++){const a=i/P.n*PI*2+(P===INNER?PI/P.n:0),piv=new THREE.Group(),outer=P===OUTER;
      const rr=P.r+(P===OUTER&&i%2?.025:0); // 이웃 꽃잎이 한 겹씩 엇갈려 겹치게(같은 자리에서 파고들어 지저분해 보이던 것)
      piv.position.set(Math.sin(a)*rr,P.y,Math.cos(a)*rr);piv.rotation.y=a;g.add(piv);
      const m=wm(petG,petM);m.scale.setScalar(P.s*(P===OUTER&&i%2?1.03:1));piv.add(m);
      petals.push({piv,closed:P.closed,open:P.open,d:outer?0:.25});piv.rotation.x=P.closed;}}
  else{ // 핀 꽃: 장미처럼 나선으로 감싸며 겹친 꽃잎
    const petM2=bloomM,petD=petM2.clone();petD.side=THREE.DoubleSide;
    const skip=BLOOM_CENTER==='pod'?8:0; // 연밥이 들어갈 가운데 꽃잎은 비운다
    const prof=r=>{for(let k=1;k<PROF.length;k++){const [r0,y0]=PROF[k-1],[r1,y1]=PROF[k];if(r>=r1)return y1+(y0-y1)*(r-r1)/(r0-r1);}return PROF[PROF.length-1][1];}; // 모자 윤곽(눌린 머리) 높이
    for(let i=skip;i<ROSE_N;i++){const t=i/(ROSE_N-1),a=i*GOLD,piv=new THREE.Group();
      // 밑동은 머리(눌린 정수리 윤곽) 위에 — 안쪽은 꼭대기 가운데, 바깥은 모자 가장자리. 바깥 꽃잎은 정수리를 감싸 올라가는 컵 벽, 가장 바깥 몇 장만 크게 벌어진다
      const r=.05+.42*t**.7,y=Math.max(-.02,prof(r)-.05-.06*t),w=.2+.3*t**.8,L=.28+.42*t**.7,curl=.25+.75*Math.max(0,(t-.4)/.6);
      piv.position.set(Math.sin(a)*r,y,Math.cos(a)*r);piv.rotation.order='YXZ';piv.rotation.y=a;g.add(piv);
      const m=wm(rosePetal(w,L,curl),petD);piv.add(m);
      const openK=Math.max(0,(t-.68)/.32)**1.3,op=-.34+.42*t+openK*(.55+.15*Math.pow(Math.max(0,Math.cos(a)),3)); // 안쪽은 안으로 오므려 감싸고(-), 바깥 꽃잎은 모자 가장자리에서 거의 곧게 서서 정수리를 감싸 올라가다 끝만 바깥으로 말린다(앞쪽은 조금 더 벌려 이마 위로)
      const op2=op+(skip?.62*(1-t):0); // 연밥 모양: 가운데 둘레 꽃잎을 벌려 연밥·꽃술이 보이게
      petals.push({piv,closed:-.3-.1*t,open:op2,d:(1-t)*.35});piv.rotation.x=op2;} // 피어나기: 바깥 꽃잎이 먼저
    // 속꽃잎 그늘: 꽃잎 아래 좁은 틈으로 머리가 비치지 않게 받치는 짙은 분홍 오목 그릇(꽃잎보다 안쪽·아래 — 겉에서는 보이지 않는다)
    g.add(wm(lathe([[0,.2],[.18,.2],[.3,.15],[.38,.08],[.42,.02]].map(q=>new THREE.Vector2(q[0],q[1])),24),new THREE.MeshStandardMaterial({color:0xd9788f,roughness:.9,metalness:0})));
    if(BLOOM_CENTER==='pod'){ // 가운데: 작은 연두 연밥 + 노란 꽃술 한 줄
      stamen=new THREE.Group();stamen.position.y=.34;stamen.scale.setScalar(.95);g.add(stamen);
      const podM=new THREE.MeshStandardMaterial({color:0xb7d27a,roughness:.85}),seedM=new THREE.MeshStandardMaterial({color:0x7f9c4c,roughness:.9});
      stamen.add(wm(lathe([[0,0],[.09,.01],[.12,.06],[.125,.12],[.11,.15],[0,.155]].map(q=>new THREE.Vector2(q[0],q[1])),16),podM));
      for(let k=0;k<7;k++){const a=k/6*PI*2,rr=k<6?.065:0,sd=wm(new THREE.CylinderGeometry(.017,.017,.012,8),seedM);sd.position.set(Math.sin(a)*rr,.155,Math.cos(a)*rr);stamen.add(sd);}
      const yM=new THREE.MeshStandardMaterial({color:0xf3c544,roughness:.7,emissive:0x8a5a00,emissiveIntensity:.15}),fM=new THREE.MeshStandardMaterial({color:0xf6df8e,roughness:.8});
      const fil=new THREE.CylinderGeometry(.008,.01,.1,4).translate(0,.05,0),tipG=new THREE.SphereGeometry(.018,6,4);
      for(let k=0;k<14;k++){const a=k/14*PI*2,piv=new THREE.Group();piv.position.set(Math.sin(a)*.14,.02,Math.cos(a)*.14);piv.rotation.set(0,a,0);piv.rotateX(.35);stamen.add(piv);
        piv.add(wm(fil,fM));const tp=wm(tipG,yM);tp.position.y=.1;piv.add(tp);}}}
  g.userData.petals=petals;g.userData.sepals=sepals;g.userData.stamen=stamen;
  return {g,profile:PROF,top:PROF[PROF.length-1][1]};}
// 피어나기: u 0→1 — 바깥 겹이 먼저, 안쪽 겹이 뒤따라(겹마다 d만큼 늦게). 끝에서 살짝 더 젖혔다 돌아와 탐스럽게
export function animate(g,u){const ease=x=>{x=Math.min(1,Math.max(0,x));const c=1.4;x-=1;return 1+(c+1)*x*x*x+c*x*x;};
  for(const p of g.userData.petals||[]){const k=ease((u-p.d)/.7);p.piv.rotation.x=p.closed+(p.open-p.closed)*k;}
  const ks=ease(u/.8);(g.userData.sepals||[]).forEach(s=>s.rotation.x=.08+(.75-.08)*ks);
  const st=g.userData.stamen;if(st)st.scale.setScalar(Math.max(.001,ease((u-.35)/.65)));} // 꽃술은 꽃잎이 벌어진 뒤 퐁
// 06 HOODS에 넣는 두 모습: {key:'bud',mod:BUD}, {key:'bloom',mod:BLOOM} — morphHood('bloom')이면 BLOOM.animate가 피어나기를 그린다
export const BUD={build:o=>build(o,false)};
export const BLOOM={build:o=>build(o,true),animate};
