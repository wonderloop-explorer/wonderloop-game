/* 원더룹 탈: 꽃봉오리 (요정의 숲) — 기준 그림 wonderloop-studio/fairy-forest/ref/match/bud-hood-sheet.png (닫힘 정면·옆, 핌 정면·옆)
   머리 윗부분을 연둣빛 꽃받침 모자가 덮고, 이마 높이 둘레에 뾰족한 꽃받침 잎이 왕관처럼 둘러선다. 그 위로 분홍 꽃잎 봉오리.
   꽃잎은 아래가 크림빛, 끝으로 갈수록 진한 분홍. 귀는 밖에 둔다(둥근 귀가 드러남). 머리카락은 꽃받침 모자 안쪽만 눌러 넣는다(06 pressHair) → 지그재그 앞머리가 잎 아래로 보인다.
   두 모습: build(false) 닫힌 봉오리 · build(true) 활짝 핀 꽃 — 06 HOODS에 'bud'·'bloom' 두 칸. 꽃잎 각도만 다르고 나머지는 같다.
   animate(g,u): 06 morphHood가 'bloom'으로 바뀔 때 u 0→1로 부른다 → 꽃잎이 닫힌 각도에서 핀 각도로 천천히 열린다(바깥 꽃잎이 먼저, 안쪽이 뒤따라).
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
  const gr=g.createLinearGradient(0,S,0,0);gr.addColorStop(0,bloom?'#f5bcc4':'#f8e6d2');gr.addColorStop(.35,bloom?'#f3aab8':'#f6c9c6'); // 핀 꽃은 안쪽(아래)까지 분홍 — 뒤에서 희뿌옇게 보이지 않게
  gr.addColorStop(.75,'#f19ab0');gr.addColorStop(1,'#e8799a');g.fillStyle=gr;g.fillRect(0,0,S,S);
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
// 핀 꽃: 머리 둘레를 한 바퀴 두르는 두 겹 — 안쪽 겹은 세우고, 바깥 겹은 바깥으로 눕혀 어느 각도에서도 둥근 꽃. 앞쪽 바깥 꽃잎은 이마 위로 더 낮게 눕힌다
const B_IN={n:7,r:.16,y:.22,closed:-.42,open:.3,s:.82};
const B_OUT={n:10,r:.33,y:.15,closed:-.5,open:.98,s:1};
export function build({head,wm,SM},open=false){
  const g=new THREE.Group();g.position.set(0,.15,-.025);g.rotation.x=-.1;g.scale.set(1,1,.9);head.add(g);
  petalTex=petalTex||tex(petalCanvas());sepalTex=sepalTex||tex(sepalCanvas());
  const sepM=new THREE.MeshStandardMaterial({map:sepalTex,roughness:.9,metalness:0});
  const petM=new THREE.MeshStandardMaterial({map:petalTex,roughness:.8,metalness:0});
  // 꽃받침 모자
  g.add(wm(lathe(PROF.map(q=>new THREE.Vector2(q[0]*1.01,q[1])),40),sepM));
  // 뒤통수 덮개: 꽃받침 모자 아래로 뒷머리 위쪽을 감싼다(시트처럼 머리 뒤가 초록) — 옆·앞은 열어 귀·얼굴이 보이게
  {const back=wm(new THREE.SphereGeometry(.47,24,10,PI*1.12,PI*.76,PI*.5,PI*.22),sepM);back.scale.set(1.01,1,1.01);g.add(back);}
  // 꽃받침 잎: 봉오리 아랫부분을 둘러 감싸는 넓적한 잎 7장(레퍼런스처럼 꽃을 받쳐 안는 모양) + 관자놀이 쪽 아래로 늘어진 잎 4장(귀 위를 덮지 않고 얼굴 둘레를 감쌈)
  const cupG=lathe([[0,0],[.1,.05],[.14,.15],[.12,.26],[.06,.34],[0,.38]].map(q=>new THREE.Vector2(q[0],q[1])),8).scale(1.25,1,.3);
  const sepals=[];
  for(let i=0;i<7;i++){const a=i/7*PI*2+.2,piv=new THREE.Group();piv.position.set(Math.sin(a)*.37,.13,Math.cos(a)*.37);piv.rotation.y=a;g.add(piv);
    const L=wm(cupG,sepM);L.scale.setScalar(.9);piv.add(L);piv.rotation.x=open?.75:.24;sepals.push(piv);} // 꽃잎 바깥에 붙어(서로 파고들지 않게) 살짝 벌어짐 // 닫힘: 봉오리에 붙어 위로, 핌: 꽃잎과 함께 바깥으로
  const sideG=lathe([[0,0],[.08,.05],[.1,.14],[.07,.24],[0,.32]].map(q=>new THREE.Vector2(q[0],q[1])),6).scale(1.2,1,.32);
  [[-1,.5],[-1,-.15],[1,.5],[1,-.15]].forEach(([sd,dz])=>{const a=sd*PI/2-sd*dz,L=wm(sideG,sepM);L.position.set(Math.sin(a)*.45,.02,Math.cos(a)*.45);L.rotation.set(0,a,0);L.rotateX(2.05);L.scale.setScalar(1.05);g.add(L);});
  // 꽃잎: 바깥 다섯, 안쪽 셋 (핀 모습은 꽃잎이 더 크고 바깥으로 활짝)
  const petG=lathe(PETAL,12).scale(1.3,1,.45);const petals=[];const petM2=open?new THREE.MeshStandardMaterial({map:bloomTex||(bloomTex=tex(petalCanvas(true))),roughness:.8,metalness:0}):petM;
  const RINGS=open?[B_OUT,B_IN]:[OUTER,INNER];
  for(const P of RINGS)for(let i=0;i<P.n;i++){const a=i/P.n*PI*2+(P===INNER||P===B_IN?PI/P.n:0),piv=new THREE.Group(),outer=P===OUTER||P===B_OUT;
    const front=P===B_OUT&&Math.cos(a)>.75; // 핀 꽃의 앞쪽 바깥 꽃잎: 이마 위로 낮게
    const rr=P.r+(P===OUTER&&i%2?.025:0); // 닫힌 봉오리: 이웃 꽃잎이 한 겹씩 엇갈려 겹치게(같은 자리에서 파고들어 지저분해 보이던 것)
    piv.position.set(Math.sin(a)*rr,P.y,Math.cos(a)*rr);piv.rotation.y=a;g.add(piv);
    const m=wm(petG,petM2);m.scale.setScalar(P.s*(front?.82:1)*(P===OUTER&&i%2?1.03:1));piv.add(m);
    const op=front?1.32:P.open;petals.push({piv,closed:P.closed,open:op,outer});piv.rotation.x=open?op:P.closed;}
  // 노란 꽃술 (핀 모습만): 가운데 동그란 꽃술 + 둘레 작은 수술 끝
  let stamen=null;if(open){stamen=new THREE.Group();stamen.position.y=.66;g.add(stamen);const yM=new THREE.MeshStandardMaterial({color:0xf3c544,roughness:.7,emissive:0x8a5a00,emissiveIntensity:.15});
    const c=wm(new THREE.SphereGeometry(.11,12,8),yM);c.scale.y=.75;stamen.add(c);
    for(let k=0;k<10;k++){const a=k/10*PI*2,st=wm(new THREE.CylinderGeometry(.012,.012,.16,4),new THREE.MeshStandardMaterial({color:0xf6e3a0,roughness:.8}));st.position.set(Math.sin(a)*.1,.06,Math.cos(a)*.1);st.rotation.set(Math.cos(a)*.5,0,-Math.sin(a)*.5);stamen.add(st);
      const tip=wm(new THREE.SphereGeometry(.03,6,5),yM);tip.position.set(Math.sin(a)*.14,.13,Math.cos(a)*.14);stamen.add(tip);}}
  g.userData.petals=petals;g.userData.sepals=sepals;g.userData.stamen=stamen;
  return {g,profile:PROF,top:PROF[PROF.length-1][1]};}
// 피어나기: u 0→1 — 바깥 꽃잎이 먼저(0~0.75), 안쪽이 뒤따라(0.25~1). 끝에서 살짝 더 젖혔다 돌아와 탐스럽게
export function animate(g,u){const ease=x=>{x=Math.min(1,Math.max(0,x));const c=1.4;x-=1;return 1+(c+1)*x*x*x+c*x*x;};
  for(const p of g.userData.petals||[]){const k=p.outer?ease(u/.75):ease((u-.25)/.75);p.piv.rotation.x=p.closed+(p.open-p.closed)*k;}
  const ks=ease(u/.8);(g.userData.sepals||[]).forEach(s=>s.rotation.x=.08+(.75-.08)*ks);
  const st=g.userData.stamen;if(st)st.scale.setScalar(Math.max(.001,ease((u-.35)/.65)));} // 꽃술은 꽃잎이 벌어진 뒤 퐁
// 06 HOODS에 넣는 두 모습: {key:'bud',mod:BUD}, {key:'bloom',mod:BLOOM} — morphHood('bloom')이면 BLOOM.animate가 피어나기를 그린다
export const BUD={build:o=>build(o,false)};
export const BLOOM={build:o=>build(o,true),animate};
