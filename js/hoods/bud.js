/* 원더룹 탈: 꽃봉오리 (요정의 숲) — 기준 그림 wonderloop-studio/fairy-forest/ref/match/bud-hood-sheet.png (닫힘 정면·옆, 핌 정면·옆)
   머리 윗부분을 연둣빛 꽃받침 모자가 덮고, 이마 높이 둘레에 뾰족한 꽃받침 잎이 왕관처럼 둘러선다. 그 위로 분홍 꽃잎 봉오리.
   꽃잎은 아래가 크림빛, 끝으로 갈수록 진한 분홍. 귀는 밖에 둔다(둥근 귀가 드러남). 머리카락은 꽃받침 모자 안쪽만 눌러 넣는다(06 pressHair) → 지그재그 앞머리가 잎 아래로 보인다.
   두 모습: build(false) 닫힌 봉오리 · build(true) 활짝 핀 꽃 — 06 HOODS에 'bud'·'bloom' 두 칸. 꽃받침 모자·잎은 같고 꽃잎만 다르다.
   핀 꽃(2026-11-01 다시 만듦, 시트의 핀 모습 기준): 정리된 연꽃 — 꽃잎 세 겹(안쪽 6 · 가운데 8 · 바깥 10장), 겹마다 같은 꽃잎을 같은 간격으로 빙 둘러 놓고 겹끼리 엇갈리게.
     안쪽은 거의 세우고 바깥으로 갈수록 눕혀 사발 모양, 꽃잎은 안으로 오목하고 끝은 살짝 바깥으로 휜다. 겹마다 꽃잎 폭을 그 높이의 둘레 간격보다 좁게 잡아 서로 뚫지 않는다.
     앞쪽(얼굴 쪽) 꽃잎은 각도를 이어지게 조금만 더 눕혀 이마 위로(정면 눈높이에서 얼굴을 가리지 않게). 핀 꽃에는 초록 꽃받침(띠·잎)이 없고 머리에 닿는 밑동도 꽃잎 색(닫힌 봉오리는 그대로). 색은 아래 크림·연분홍 → 끝 진분홍, 안팎 같은 색.
     가운데는 연두빛 둥근 연밥(위에 씨앗 구멍) 하나와 그 둘레 노란 꽃술 한 줄.
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
// 핀 꽃 세 겹: n 장수, r 밑동 반지름, y 밑동 높이, open 눕힘(앞쪽은 +front만큼 더), w 꽃잎 폭, L 길이, off 돌림(겹끼리 엇갈림), d 피어나는 차례(바깥 먼저)
//   바깥 겹 밑동은 모자 가장자리(띠)에 붙여 띠를 덮는다(밑동 모자는 꽃잎 분홍 — 핀 꽃에서는 띠가 보이지 않게)
//   폭은 꽃잎이 가장 넓은 높이의 둘레 간격(2π·반지름/장수)보다 좁게 — 같은 겹 꽃잎끼리 뚫지 않는다. 겹끼리는 밑동이 바깥일수록 낮고 더 눕혀 서로 닿지 않는다
const B_RINGS=[
  {n:10,r:.44,y:.05,open:.98,front:.16,w:.36,L:.7,off:0,closed:-.5,d:0},
  {n:8,r:.33,y:.17,open:.6,front:.12,w:.3,L:.64,off:PI/8,closed:-.32,d:.15},
  {n:6,r:.2,y:.26,open:.24,front:.1,w:.19,L:.54,off:PI/6,closed:-.1,d:.3}];
// 연꽃 꽃잎: 회전체를 납작하게 → 안쪽(-z)으로 오목하게 → 끝(위 30%)은 바깥(+z)으로 살짝 휜다. 밑동이 원점, +y가 끝, +z가 바깥
function lotusPetal(w,L){const P=[[0,0],[.1,.05],[.2,.16],[.25,.3],[.25,.45],[.2,.58],[.11,.68],[0,.74]];
  const g=lathe(P.map(q=>new THREE.Vector2(q[0],q[1])),14).scale(w/.5,L/.74,.2),pos=g.attributes.position;
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i),v=y/L,xn=x/(w/2);
    pos.setZ(i,pos.getZ(i)-.09*w*xn*xn*Math.sqrt(Math.sin(PI*Math.min(1,v)))+.07*L*Math.pow(Math.max(0,(v-.62)/.38),2));}
  g.computeVertexNormals();return g;}
export function build({head,wm,SM},open=false){
  const g=new THREE.Group();g.position.set(0,.15,-.025);g.rotation.x=-.1;g.scale.set(1,1,.9);head.add(g);
  petalTex=petalTex||tex(petalCanvas());sepalTex=sepalTex||tex(sepalCanvas());
  const sepM=new THREE.MeshStandardMaterial({map:sepalTex,roughness:.9,metalness:0});
  const petM=new THREE.MeshStandardMaterial({map:petalTex,roughness:.8,metalness:0});
  const bloomM=open?new THREE.MeshStandardMaterial({map:bloomTex||(bloomTex=tex(petalCanvas(true))),roughness:.8,metalness:0}):null;
  const capM=open?new THREE.MeshStandardMaterial({color:0xf4b9c2,roughness:.85,metalness:0}):sepM; // 핀 꽃: 머리에 닿는 밑동(모자·뒤통수 덮개)도 꽃잎 색 — 초록 꽃받침이 보이지 않게(2026-11-02)
  // 꽃받침 모자
  g.add(wm(lathe(PROF.map(q=>new THREE.Vector2(q[0]*1.01,q[1])),40),capM));
  // 뒤통수 덮개: 꽃받침 모자 아래로 뒷머리 위쪽을 감싼다(시트처럼 머리 뒤가 초록) — 옆·앞은 열어 귀·얼굴이 보이게
  {const back=wm(new THREE.SphereGeometry(.47,24,10,PI*1.12,PI*.76,PI*.5,PI*.22),capM);back.scale.set(1.01,1,1.01);g.add(back);}
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
  else{ // 핀 꽃: 세 겹 연꽃
    const petM2=bloomM;
    for(const P of B_RINGS){const geo=lotusPetal(P.w,P.L);for(let i=0;i<P.n;i++){const a=i/P.n*PI*2+P.off,piv=new THREE.Group();
      piv.position.set(Math.sin(a)*P.r,P.y,Math.cos(a)*P.r);piv.rotation.order='YXZ';piv.rotation.y=a;g.add(piv);piv.add(wm(geo,petM2)); // YXZ: 꽃잎 자신 기준으로 바깥으로 눕힘(기본 XYZ면 머리 기준 앞으로만 기울어 뒤쪽 꽃잎이 머리 안으로 눕던 것 — 예전 핀 꽃이 두서없어 보인 까닭)
      const op=P.open+P.front*Math.pow(Math.max(0,Math.cos(a)),3); // 앞쪽으로 갈수록 이어지게 더 눕힘(이웃 꽃잎과 각도가 갑자기 달라 부딪치지 않게)
      petals.push({piv,closed:P.closed,open:op,d:P.d});piv.rotation.x=op;}}
    // 꽃잎 밑동 안쪽 그릇(꽃잎과 같은 색): 꽃잎은 밑동이 좁아 사이가 벌어지는데, 그 틈으로 속이 비쳐 보이지 않게 받친다
    g.add(wm(lathe([[0,.27],[.13,.28],[.18,.34],[.2,.42],[.205,.48]].map(q=>new THREE.Vector2(q[0],q[1])),18),petM2));
    // 가운데 연밥(연두빛 둥근 꽃받침, 위에 씨앗 구멍) + 둘레 노란 꽃술 한 줄
    stamen=new THREE.Group();stamen.position.y=.36;g.add(stamen);
    const podM=new THREE.MeshStandardMaterial({color:0xb7d27a,roughness:.85}),seedM=new THREE.MeshStandardMaterial({color:0x7f9c4c,roughness:.9});
    stamen.add(wm(lathe([[0,0],[.09,.01],[.12,.06],[.125,.12],[.11,.15],[0,.155]].map(q=>new THREE.Vector2(q[0],q[1])),16),podM));
    for(let k=0;k<7;k++){const a=k/6*PI*2,rr=k<6?.065:0,sd=wm(new THREE.CylinderGeometry(.017,.017,.012,8),seedM);sd.position.set(Math.sin(a)*rr,.155,Math.cos(a)*rr);stamen.add(sd);}
    const yM=new THREE.MeshStandardMaterial({color:0xf3c544,roughness:.7,emissive:0x8a5a00,emissiveIntensity:.15}),fM=new THREE.MeshStandardMaterial({color:0xf6df8e,roughness:.8});
    const fil=new THREE.CylinderGeometry(.008,.01,.1,4).translate(0,.05,0),tipG=new THREE.SphereGeometry(.018,6,4);
    for(let k=0;k<18;k++){const a=k/18*PI*2,piv=new THREE.Group();piv.position.set(Math.sin(a)*.14,.02,Math.cos(a)*.14);piv.rotation.set(0,a,0);piv.rotateX(.35);stamen.add(piv);
      piv.add(wm(fil,fM));const tp=wm(tipG,yM);tp.position.y=.1;piv.add(tp);}}
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
