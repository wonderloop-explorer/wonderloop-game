/* 무한 우주 ③ 구름 행성(금성) 주민·소품 (2026-11-18) — 원더룹 키 1.38m = 1 기준, 로우폴리 공 덩어리 + 색연필 결(martians lump — 툰 3단·정점 색)
   거꾸리 0.9(1.24m): 연보라 구름 솜뭉치 몸 + 작은 해시계 모자. 늘 뒷걸음질(얼굴은 원더룹 쪽, 등이 가는 방향) — 그리기 3(몸·팔 둘)
   뭉게 문지기 1.5(2.07m): 커다란 양털 구름 몸 + 졸린 눈. 코 골 때 몸이 부풀었다 꺼짐 — 그리기 3(몸·감은 눈·뜬 눈)
   또생일 0.6(0.83m): 작은 케이크 모양 고깔모자를 쓴 꼬마 — 그리기 1 / 케이크(초 셋) 2(케이크·불꽃)
   고리 얼음 배 1 · 구름 기둥·구름 둑은 구역(venus.js)이 한 덩어리로 */
import * as THREE from 'three';
import {lump,M4,sph,faceDecal,faceArc,NOWRAP} from './martians.js';
const PI=Math.PI;
/* 공(가운데 c·반지름 R·축 배율 k) 겉면의 한 점(위아래 el·좌우 az — 앞이 +z)에 납작한 무늬를 세워 붙임 */
function on(geo,R,c,el,az,roll=0,out=0,sc=[1,1,1],k=[1,1,1]){const n=new THREE.Vector3(Math.sin(az)*Math.cos(el),Math.sin(el),Math.cos(az)*Math.cos(el));
  const p=new THREE.Vector3(n.x*(R+out)*k[0]+c[0],n.y*(R+out)*k[1]+c[1],n.z*(R+out)*k[2]+c[2]),nn=new THREE.Vector3(n.x/k[0],n.y/k[1],n.z/k[2]).normalize();
  const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),nn).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),roll));
  return geo.applyMatrix4(new THREE.Matrix4().compose(p,q,new THREE.Vector3(...sc)));}
const puff=(r,x,y,z,s=[1,1,1])=>sph(r,10,8).applyMatrix4(M4([x,y,z],[0,0,0],s));
const DARK='#3a2c44';
/* 얼굴 무늬를 머리 겉면에 붙임(2026-11-25 — martians faceDecal·faceArc: 눈·별빛·볼·입이 납작한 조각이라 둥근 머리에서 떠 보였다, 별빛은 3cm 밖). R·c·k = 머리 공. ?nowrap = 예전 모습 */
const WRAP=!NOWRAP,fd=(R,c,k,el,az,roll,a,b,eps,nr=3,na=18)=>faceDecal(R,[R*k[0],R*k[1],R*k[2]],c,el,az,roll,a,b,eps,nr,na),fa=(R,c,k,el,az,roll,a,b,w,eps)=>faceArc(R,[R*k[0],R*k[1],R*k[2]],c,el,az,roll,a,b,w,eps);
/* ── 거꾸리 ── */
export function makeGeokkuri(){const root=new THREE.Group();root.name='geokkuri';const body=new THREE.Group();root.add(body);
  const A='#c9a6e0',B='#d9bfee',C='#b48fd2',L=[],R=.4,c=[0,.56,0],k=[1,.96,.9];
  L.push([sph(R,WRAP?32:16,WRAP?22:12).applyMatrix4(M4(c,[0,0,0],k)),A]);
  [[-.3,.36,-.05,.24,B],[.3,.36,-.05,.24,B],[0,.3,-.26,.27,C],[-.2,.74,-.2,.22,B],[.22,.76,-.16,.21,A],[0,.9,-.02,.25,B],[-.3,.62,.02,.2,A],[.3,.64,.0,.2,A],[.0,.3,.2,.22,B]]
    .forEach(([x,y,z,r,col])=>L.push([puff(r,x,y,z),col]));
  for(const s of [-1,1]){if(WRAP){L.push([fd(R,c,k,.2,s*.36,0,R*.1,R*.135,.008,4,20),DARK]);L.push([fd(R,c,k,.27,s*.36-s*.04,0,R*.035,R*.035,.016,2,10),'#ffffff']);L.push([fd(R,c,k,-.02,s*.66,0,R*.12,R*.075,.008),'#f4a9c0']);}
    else{L.push([on(sph(1,10,7),R,c,.2,s*.36,0,-.004,[R*.1,R*.135,R*.04],k),DARK]);
    L.push([on(sph(1,6,5),R,c,.27,s*.36-s*.04,0,.03,[R*.035,R*.035,R*.02],k),'#ffffff']);
    L.push([on(sph(1,8,6),R,c,-.02,s*.66,0,0,[R*.12,R*.075,R*.03],k),'#f4a9c0']);}
    L.push([puff(.1,s*.17,.07,.06,[1,.62,1.35]),C]);}
  L.push(WRAP?[fa(R,c,k,-.04,0,PI,R*.12,R*.085,.2,.008),'#6a3a5a']:[on(new THREE.TorusGeometry(1,.2,5,12,PI),R,c,-.04,0,PI,.004,[R*.12,R*.085,R*.05],k),'#6a3a5a']);
  /* 머리 장식 = 해시계(2026-11-19 — 납작한 접시처럼 보였다): 앞으로 기울인 금빛 둥근 판(테두리 진한 금) + 위로 솟은 세모 바늘 + 바늘의 작은 그림자. 숫자 눈금은 판 위에 붙이는 그림(dialTex — 반시계 방향) */
  /* 2026-11-20: 판이 낮고 많이 기울어 머리 꼭대기 구름이 판 가운데를 뚫고 나왔다 → 더 위(1.26)·덜 기울임(.24) + 판 밑 둥근 받침(모자처럼 얹힘, 머리와 안 겹침) */
  const hy=1.26,HT=.24,HM=M4([0,hy,.02],[HT,0,0]),hp=(g,c,p,r)=>L.push([g.applyMatrix4(M4(p||[0,0,0],r||[0,0,0])).applyMatrix4(HM),c]);
  hp(new THREE.CylinderGeometry(.13,.17,.11,14),'#c9973a',[0,-.075,0]);hp(new THREE.CylinderGeometry(.27,.27,.035,20),'#c9973a',[0,-.01,0]);hp(new THREE.CylinderGeometry(.245,.245,.04,20),'#f3cf6a',[0,.012,0]);
  hp(new THREE.CylinderGeometry(.13,.13,.022,3),'#8a5a3c',[0,.115,-.02],[PI/2,0,PI/2]);hp(new THREE.CylinderGeometry(.03,.03,.03,8),'#8a5a3c',[0,.04,0]);
  hp(new THREE.CylinderGeometry(.1,.1,.004,3),'#7a5a2a',[.1,.036,.03],[0,.5,0],);
  const me=lump(L,true,2.2);me.name='geokkuri-body';body.add(me);
  {const f=new THREE.Mesh(new THREE.CircleGeometry(.238,24).applyMatrix4(M4([0,.034,0],[-PI/2,0,0])).applyMatrix4(HM),dialMat());f.name='geokkuri-dial';me.add(f);}
  const arms=[-1,1].map(s=>{const g=new THREE.Group();g.position.set(s*.37,.56,.06);me.add(g);g.add(lump([[puff(.085,0,-.1,0,[1,1.5,1]),B],[puff(.075,0,-.22,.01),A]],true,2.2));g.rotation.z=s*.5;g.userData.s=s;return g;});
  const st={mode:'idle',pt:0};
  /* mode: idle · walk(뒷걸음 뒤뚱) · talk · point(오른팔로 가리킴) · sit · wave(오른팔을 높이 들어 흔듦 — 토성 쉼터 작별, 2026-11-24) */
  function tick(dt,t,mode){st.mode=mode||'idle';const w=st.mode==='walk',tk=st.mode==='talk';
    body.position.y=w?Math.abs(Math.sin(t*9))*.07:tk?Math.abs(Math.sin(t*6))*.03:Math.sin(t*2.2)*.012+(st.mode==='sit'?-.1:0);
    body.rotation.z=w?Math.sin(t*9)*.09:Math.sin(t*1.7)*.02;body.rotation.x=w?-.07:0;
    const sy=1+(tk?Math.sin(t*12)*.015:Math.sin(t*2.2)*.012);me.scale.set(1/Math.sqrt(sy),sy,1/Math.sqrt(sy));
    st.pt+=((st.mode==='point'?1:0)-st.pt)*Math.min(1,dt*8);st.wv=(st.wv||0)+((st.mode==='wave'?1:0)-(st.wv||0))*Math.min(1,dt*8);
    arms.forEach(g=>{const s=g.userData.s,sw=w?Math.sin(t*9+(s>0?0:PI))*.35:Math.sin(t*2+s)*.06;g.rotation.z=s*(.5+(tk?.25+Math.sin(t*7+s)*.2:0))+(s>0?st.pt*1.25+st.wv*(1.9+Math.sin(t*9)*.35):0);g.rotation.x=sw-(s>0?st.pt*.5:0);});}
  return {root,body,mesh:me,tick,head:1.0};}
/* ── 토링(토성 고리지기 — 임시 모델, 2026-11-26. 디자인은 나중에 확정): 고리 얼음 느낌의 반투명 하늘색 — 둥근 얼음 머리 + 작은 몸 + 허리에 비스듬히 걸친 얼음 고리(천천히 돎) + 머리 위 얼음 결정.
   거꾸리(연보라 구름)와 겹치지 않게 각진 얼음 조각·하늘색. 키 약 0.95m. 그리기 4(몸·팔 둘·고리). 눈·볼·입은 머리 겉면에 붙임(faceDecal) ── */
export function makeToring(){const root=new THREE.Group();root.name='toring';const body=new THREE.Group();root.add(body);
  const A='#a9dcf7',B='#d6f0ff',C='#7fc4ee',L=[],R=.34,c=[0,.66,0],k=[1,.95,.94];
  L.push([sph(R,32,22).applyMatrix4(M4(c,[0,0,0],k)),A]);
  L.push([new THREE.IcosahedronGeometry(.25,1).applyMatrix4(M4([0,.25,0],[0,.3,0],[1,1.05,.9])),C]); /* 작은 몸(각진 얼음) */
  for(const s of [-1,1])L.push([new THREE.IcosahedronGeometry(.085,0).applyMatrix4(M4([s*.12,.05,.05],[0,0,0],[1,.6,1.4])),C]); /* 발 */
  for(const s of [-1,1]){L.push([fd(R,c,k,.12,s*.36,0,R*.11,R*.145,.008,4,20),'#2c3e5a']);L.push([fd(R,c,k,.2,s*.36-s*.04,0,R*.04,R*.04,.016,2,10),'#ffffff']);L.push([fd(R,c,k,-.12,s*.68,0,R*.13,R*.08,.008),'#f7b9cf']);}
  L.push([fa(R,c,k,-.14,0,PI,R*.13,R*.09,.2,.008),'#3d5a80']);
  const me=lump(L.map(([q,cc])=>[q.index?q.toNonIndexed():q,cc]),true,2.2);me.name='toring-body';body.add(me); /* 2026-11-27: 불투명(얼음 하늘색 그대로)·머리 위 결정 장식 없음 */
  /* 허리 고리: 납작한 얼음 띠 둘(안쪽 밝게·바깥 옅게) — 비스듬히 걸치고 천천히 돎 */
  const ring=new THREE.Group();ring.position.set(0,1.16,0);ring.rotation.set(.32,0,.18);ring.scale.setScalar(.46);body.add(ring); /* 2026-11-27: 허리 고리 → 머리 위에 작게 떠 있는 고리(천사 고리처럼, 천천히 돎) */
  {const Lr=[];const mk=(r0,r1,col)=>{const g=new THREE.RingGeometry(r0,r1,28,1);g.rotateX(-PI/2);Lr.push([g.toNonIndexed(),col]);};mk(.4,.5,'#f2fbff');mk(.53,.6,'#bfe2f8');/* 고리 모양은 처음 디자인 그대로(납작한 얼음 띠 둘 + 작은 결정 다섯, 살짝 비침) — 도톰한 테는 뺌(2026-11-27 사용자 요청) */for(let i=0;i<5;i++){const a=i*1.257;Lr.push([new THREE.IcosahedronGeometry(.045,0).applyMatrix4(M4([Math.cos(a)*.56,.01,Math.sin(a)*.56])),'#ffffff']);}
    const rm=lump(Lr,true,1.4);rm.name='toring-ring';rm.material=rm.material.clone();rm.material.transparent=true;rm.material.opacity=.8;rm.material.side=THREE.DoubleSide;ring.add(rm);}
  const arms=[-1,1].map(s=>{const g=new THREE.Group();g.position.set(s*.27,.42,.03);body.add(g);const am=lump([[new THREE.IcosahedronGeometry(.07,0).applyMatrix4(M4([0,-.09,0],[0,0,0],[1,1.6,1])).toNonIndexed(),B],[new THREE.IcosahedronGeometry(.065,0).applyMatrix4(M4([0,-.2,.01])).toNonIndexed(),A]],true,2.2);am.material=me.material;g.add(am);g.rotation.z=s*.5;g.userData.s=s;return g;});
  const st={mode:'idle',pt:0,wv:0};
  /* mode: idle · walk(앞으로 통통) · talk · point(오른팔로 가리킴) · sit · wave(오른팔을 높이 들어 흔듦 — 마중·배웅) */
  function tick(dt,t,mode,sit){st.mode=mode||'idle';const w=st.mode==='walk',tk=st.mode==='talk';ring.position.y=1.16+Math.sin(t*1.6)*.02;
    body.position.y=(w?Math.abs(Math.sin(t*8))*.09:tk?Math.abs(Math.sin(t*6))*.03:Math.sin(t*2.2)*.015)+(st.mode==='sit'||sit?-.12:0);
    body.rotation.z=w?Math.sin(t*8)*.07:Math.sin(t*1.7)*.02;body.rotation.x=w?.06:0;ring.rotation.y+=dt*.7;
    st.pt+=((st.mode==='point'?1:0)-st.pt)*Math.min(1,dt*8);st.wv+=((st.mode==='wave'?1:0)-st.wv)*Math.min(1,dt*8);
    arms.forEach(g=>{const s=g.userData.s,sw=w?Math.sin(t*8+(s>0?0:PI))*.35:Math.sin(t*2+s)*.06;g.rotation.z=s*(.5+(tk?.25+Math.sin(t*7+s)*.2:0))+(s>0?st.pt*1.25+st.wv*(1.9+Math.sin(t*9)*.35):0);g.rotation.x=sw-(s>0?st.pt*.5:0);});}
  return {root,body,mesh:me,tick,head:1.2};}
/* ── 뭉게 문지기 ── */
export function makeMunge(){const root=new THREE.Group();root.name='munge';const body=new THREE.Group();root.add(body);
  const A='#f6f1fb',B='#e9def5',C='#ddcdef',L=[],R=.86,c=[0,.86,0],k=[1.22,.94,1];
  L.push([sph(R,WRAP?32:18,WRAP?22:13).applyMatrix4(M4(c,[0,0,0],k)),A]);
  [[-.95,.5,.1,.5,B],[.95,.5,.1,.5,B],[-.6,.42,.55,.42,A],[.62,.4,.55,.42,A],[0,.36,.7,.4,B],[-.75,1.2,-.2,.48,A],[.72,1.24,-.15,.46,B],[0,1.52,-.05,.52,A],[-.4,1.62,.12,.34,B],[.42,1.6,.08,.36,A],
    [0,.6,-.7,.6,C],[-.8,.8,-.5,.5,C],[.8,.8,-.5,.5,C],[-1.25,.36,-.2,.34,C],[1.25,.36,-.2,.34,C]].forEach(([x,y,z,r,col])=>L.push([puff(r,x,y,z),col]));
  for(const s of [-1,1])L.push(WRAP?[fd(R,c,k,-.08,s*.52,0,R*.13,R*.08,.006),'#f6b3c6']:[on(sph(1,8,6),R,c,-.08,s*.52,0,0,[R*.13,R*.08,R*.03],k),'#f6b3c6']);
  L.push(WRAP?[fd(R,c,k,-.2,0,0,R*.05,R*.06,.006),'#7a4a66']:[on(sph(1,8,6),R,c,-.2,0,0,0,[R*.05,R*.06,R*.03],k),'#7a4a66']);
  const me=lump(L,true,1.6);me.name='munge-body';body.add(me);
  /* 감은 눈(아래로 둥근 선 — 졸림) · 뜬 눈(반쯤 → 크게) */
  const closed=lump([-1,1].map(s=>WRAP?[fa(R,c,k,.1,s*.3,PI,R*.1,R*.06,.2,.007),DARK]:[on(new THREE.TorusGeometry(1,.17,5,12,PI),R,c,.1,s*.3,PI,.01,[R*.1,R*.06,R*.05],k),DARK]),false);me.add(closed);
  const open=lump([-1,1].flatMap(s=>WRAP?[[fd(R,c,k,.1,s*.3,0,R*.085,R*.1,.007,4,20),DARK],[fd(R,c,k,.15,s*.3-s*.03,0,R*.03,R*.03,.013,2,10),'#ffffff']]:[[on(sph(1,10,7),R,c,.1,s*.3,0,.004,[R*.085,R*.1,R*.035],k),DARK],[on(sph(1,6,5),R,c,.15,s*.3-s*.03,0,.04,[R*.03,R*.03,R*.02],k),'#ffffff']]),false);me.add(open);open.visible=false;
  const st={ph:0,puff:0,eye:0,wob:0};
  /* state: sleep(코 골며 부풀었다 꺼짐) · ask(뒤척이며 눈을 반쯤) · wake(눈을 크게, 몸이 푹 부풂). 돌려주는 값 = 들숨이 시작된 프레임이면 true(코골이 소리 박자) */
  function tick(dt,t,state){const sl=state==='sleep',ask=state==='ask',wk=state==='wake',wn=state==='warn';let beat=false; /* warn(2026-11-19): 눈뜨기 전 미리 알림 — 코골이가 멈추고 몸이 크게 들썩 */
    const p0=st.ph;st.ph=(st.ph+dt/2.6)%1;if(sl&&st.ph<p0)beat=true;
    const br=sl?Math.max(0,Math.sin(st.ph*PI*2))**.8*.5+Math.max(0,Math.sin(st.ph*PI*2-.6))*.5:0;
    st.puff+=((wk?1:ask?.25:wn?.45:0)-st.puff)*Math.min(1,dt*7);st.eye+=((wk?1:ask?.55:0)-st.eye)*Math.min(1,dt*10);st.wob+=((ask?1:wn?2.1:0)-st.wob)*Math.min(1,dt*(wn?9:5));
    st.br=(st.br||0)+(br-(st.br||0))*Math.min(1,dt*(sl?30:3)); /* 숨이 뚝 끊기면 얼굴이 내려앉았다(2026-11-20) → 천천히 */
    const sy=1+st.br*.11+st.puff*.03,sx=1+st.br*.045+st.puff*.1;me.scale.set(sx,sy,sx);body.rotation.z=Math.sin(t*5.2)*.07*st.wob+Math.sin(t*.8)*.012;body.rotation.x=st.wob*.05;
    open.visible=ask||wk;closed.visible=!open.visible;return beat;} /* 눈은 제자리에서 모양만 바로 바뀜(예전: 눈 높이를 줄였다 늘려 얼굴이 오르내려 보였다) */
  return {root,body,mesh:me,tick,head:1.75};}
/* ── 또생일 ── */
export function makeDdo(){const root=new THREE.Group();root.name='ddo';const body=new THREE.Group();root.add(body);
  const A='#fbe6f0',B='#f6d2e2',L=[],R=.19,c=[0,.44,0],k=[1,.97,.95];
  L.push([puff(.2,0,.2,0,[1,1.05,.95]),A]);[[-.15,.14,0,.11,B],[.15,.14,0,.11,B],[0,.14,-.13,.12,B],[0,.3,.1,.1,A]].forEach(([x,y,z,r,col])=>L.push([puff(r,x,y,z),col]));
  L.push([sph(R,WRAP?28:14,WRAP?20:10).applyMatrix4(M4(c,[0,0,0],k)),A]);
  for(const s of [-1,1]){if(WRAP){L.push([fd(R,c,k,.08,s*.4,0,R*.11,R*.14,.012,4,20),DARK]);L.push([fd(R,c,k,.16,s*.4-s*.05,0,R*.04,R*.04,.024,2,10),'#ffffff']);L.push([fd(R,c,k,-.16,s*.66,0,R*.13,R*.08,.012),'#f59ab5']);}
    else{L.push([on(sph(1,10,7),R,c,.08,s*.4,0,-.003,[R*.11,R*.14,R*.04],k),DARK]);L.push([on(sph(1,6,5),R,c,.16,s*.4-s*.05,0,.03,[R*.04,R*.04,R*.02],k),'#ffffff']);
    L.push([on(sph(1,8,6),R,c,-.16,s*.66,0,0,[R*.13,R*.08,R*.03],k),'#f59ab5']);}L.push([puff(.06,s*.09,.04,.04,[1,.6,1.3]),B]);L.push([puff(.055,s*.2,.26,.03),A]);}
  L.push(WRAP?[fd(R,c,k,-.24,0,0,R*.1,R*.12,.012),'#8a3a4a']:[on(sph(1,8,6),R,c,-.24,0,0,0,[R*.1,R*.12,R*.03],k),'#8a3a4a']);
  /* 케이크 고깔모자: 크림 고깔 + 분홍 크림 띠 둘 + 꼭대기 딸기 + 작은 초 */
  const hy=.6;L.push([new THREE.ConeGeometry(.14,.2,12).applyMatrix4(M4([0,hy+.1,-.01],[-.08,0,0])),'#fff3d6']);
  L.push([new THREE.TorusGeometry(.125,.03,6,14).applyMatrix4(M4([0,hy+.02,-.01],[PI/2-.08,0,0])),'#f59ab5']);
  L.push([new THREE.TorusGeometry(.075,.022,6,12).applyMatrix4(M4([0,hy+.1,-.018],[PI/2-.08,0,0])),'#ffd0de']);
  for(let i=0;i<6;i++){const a=i/6*PI*2;L.push([puff(.022,Math.cos(a)*.125,hy+.005,-.01+Math.sin(a)*.125),'#ffffff']);}
  L.push([puff(.035,0,hy+.205,-.03),'#e8556a']);L.push([new THREE.CylinderGeometry(.008,.008,.05,5).applyMatrix4(M4([0,hy+.25,-.034])),'#8cc8ec']);L.push([puff(.013,0,hy+.285,-.034,[1,1.5,1]),'#ffd27a']);
  const me=lump(L,true,3);me.name='ddo-body';body.add(me);
  function tick(dt,t,mode){const tk=mode==='talk',hp=Math.abs(Math.sin(t*(tk?7:4.2)));body.position.y=hp*(tk?.05:.09);body.rotation.z=Math.sin(t*4.2)*.1;const q=hp>.9?1-(hp-.9)*1.2:1;me.scale.set(1/Math.sqrt(q),q,1/Math.sqrt(q));}
  return {root,body,mesh:me,tick,head:.62};}
/* 케이크(초 셋) — 불꽃은 따로 한 덩어리(끄면 숨김) */
export function makeCake(){const g=new THREE.Group();g.name='venus-cake';const L=[];
  L.push([new THREE.CylinderGeometry(.3,.32,.05,16).applyMatrix4(M4([0,.025,0])),'#e9def5']);
  L.push([new THREE.CylinderGeometry(.22,.22,.17,16).applyMatrix4(M4([0,.135,0])),'#fff3d6']);L.push([new THREE.CylinderGeometry(.225,.225,.045,16).applyMatrix4(M4([0,.225,0])),'#f59ab5']);
  for(let i=0;i<10;i++){const a=i/10*PI*2;L.push([puff(.036,Math.cos(a)*.2,.215-(i%2)*.035,Math.sin(a)*.2,[1,1.4,1]),'#f59ab5']);}
  const CN=[[-.09,.03,'#8cc8ec'],[.0,-.07,'#9bd46b'],[.09,.04,'#ffd27a']],SL=CN.map(([x,z,col])=>[new THREE.CylinderGeometry(.013,.013,.14,6).applyMatrix4(M4([x,.31,z])),col]);
  for(let i=0;i<5;i++){const a=i/5*PI*2+.3;L.push([puff(.03,Math.cos(a)*.15,.262,Math.sin(a)*.15),'#e8556a']);}
  g.add(lump(L,true,3));const sticks=lump(SL,false,3);g.add(sticks);
  const fm=new THREE.MeshBasicMaterial({color:'#ffd88a'});fm.userData.noStorybook=true;
  const fg=new THREE.BufferGeometry();{const gs=CN.map(([x,z])=>puff(.024,x,.405,z,[1,1.7,1]));const pos=[];gs.forEach(q=>{const n=q.toNonIndexed().attributes.position;for(let i=0;i<n.count;i++)pos.push(n.getX(i),n.getY(i),n.getZ(i));});fg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));}
  const flames=new THREE.Mesh(fg,fm);flames.name='venus-flames';g.add(flames);
  return {g,flames,sticks,tick(t){flames.scale.y=1+Math.sin(t*13)*.08+Math.sin(t*7.3)*.05;},lit(v){flames.visible=v;},candles(v){sticks.visible=v;if(!v)flames.visible=false;}};}
/* 토성 고리의 얼음 조각 배: 납작하고 길쭉한 얼음 덩어리(각진 면) + 뱃머리 얼음 뿔 */
export function makeIceBoat(){const g=new THREE.Group();g.name='ice-boat';const L=[];
  const hull=new THREE.IcosahedronGeometry(1,1);{const p=hull.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),kk=1+(Math.sin(x*7.1+z*3.3)*.5+Math.sin(y*5.7+x*2.1)*.5)*.1;p.setXYZ(i,x*kk*1.75,(y>0?y*.16:y*.42)*kk,z*kk*.88);}hull.computeVertexNormals();}
  L.push([hull,'#cfe6fb']);L.push([new THREE.ConeGeometry(.2,.7,5).applyMatrix4(M4([-1.5,.3,0],[0,0,.75])),'#e8f5ff']);L.push([new THREE.ConeGeometry(.12,.4,5).applyMatrix4(M4([-1.25,.24,.3],[.3,0,.6])),'#bcdaf6']);
  L.push([new THREE.ConeGeometry(.14,.36,5).applyMatrix4(M4([1.35,.2,-.1],[0,0,-.7])),'#bcdaf6']);
  const me=lump(L.map(([q,c])=>[q.index?q.toNonIndexed():q,c]),true,1.4);me.geometry.computeVertexNormals();g.add(me);return g;}
/* 얼음 배 위에 서는 자리(2026-11-22): 배 좌표 (lx,lz)에서 내려다본 겉면 높이(한 번 계산해 기억)를 배의 지금 자리·기울기로 옮긴 세계 좌표 — 발이 배 바닥에 딱 붙는다.
   예전: 고정 높이(HSEAT)라 각진 겉면·기울기에 따라 발이 떠 보였다. 배는 구역 뿌리 바로 아래에 있어야 함(boat.matrix = 세계) */
export function boatStand(boat,lx,lz,out){const U=boat.userData,k=lx+','+lz;U.seat=U.seat||{};let y=U.seat[k];
  if(y==null){y=-9;const p=boat.children[0].geometry.attributes.position;for(let i=0;i<p.count;i+=3){const ax=p.getX(i),az=p.getZ(i),bx=p.getX(i+1),bz=p.getZ(i+1),cx=p.getX(i+2),cz=p.getZ(i+2),d=(bz-cz)*(ax-cx)+(cx-bx)*(az-cz);if(Math.abs(d)<1e-9)continue;
      const u=((bz-cz)*(lx-cx)+(cx-bx)*(lz-cz))/d,v=((cz-az)*(lx-cx)+(ax-cx)*(lz-cz))/d,w=1-u-v;if(u<0||v<0||w<0)continue;y=Math.max(y,u*p.getY(i)+v*p.getY(i+1)+w*p.getY(i+2));}if(y<-8)y=.12;U.seat[k]=y;}
  out=out||new THREE.Vector3();out.set(lx,y,lz);boat.updateMatrix();return out.applyMatrix4(boat.matrix);}
/* 입김(또생일이 촛불을 붊 — 2026-11-22: 예전 알갱이는 옅어지며 까맣게 보였다): 흰색·연분홍의 휘어지는 바람 줄기 셋 + 작은 반짝임 여섯이 입에서 촛불 쪽으로, 꺼진 뒤 가는 흰 연기 한 줄.
   한 덩어리(보일 때만 그리기 1) — 꼭짓점을 매 프레임 CPU로(약 120개). blow(입, 촛불, 시각) · smoke(촛불, 시각) · tick(시각, 카메라) */
export function makeBreath(mob){const WK=mob?1.9:1,LEN=mob?.56:.42 /* 휴대폰: 줄기 두께 1.9배·길이 1.3배(2026-11-22 — 작은 화면에서 너무 가늘었다) */,NR=4,NS=12,NSP=6,nv=NR*NS*2+NSP*4,pos=new Float32Array(nv*3),col=new Float32Array(nv*4),idx=[];
  for(let r=0;r<NR;r++)for(let i=0;i<NS-1;i++){const a=(r*NS+i)*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}
  for(let s=0;s<NSP;s++){const a=NR*NS*2+s*4;idx.push(a,a+1,a+2,a,a+2,a+3);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(col,4));geo.setIndex(idx);
  const mat=new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,depthWrite:false,side:THREE.DoubleSide,fog:false});mat.userData.noStorybook=true;
  const me=new THREE.Mesh(geo,mat);me.name='venus-breath';me.frustumCulled=false;me.visible=false;me.renderOrder=6;
  const RC=[[1,1,1],[1,.8,.9],[1,.96,.98],[1,1,1]],RS=[[-.24,.1],[.02,.26],[.25,.05]] /* 줄기마다 [옆으로 휘는 정도, 위로 휘는 정도] */,st={A:null,B:null,t0:-9,sB:null,s0:-9};
  const V=(i,x,y,z,c,a)=>{pos[i*3]=x;pos[i*3+1]=y;pos[i*3+2]=z;col[i*4]=c[0];col[i*4+1]=c[1];col[i*4+2]=c[2];col[i*4+3]=a;},_t=new THREE.Vector3(),_w=new THREE.Vector3(),_c=new THREE.Vector3(),_r=new THREE.Vector3(),_u=new THREE.Vector3();
  const pt=(r,u,t,o)=>{const A=st.A,B=st.B,dx=B[0]-A[0],dz=B[2]-A[2],L=Math.hypot(dx,dz)||1,sx=-dz/L,sz=dx/L,[sd,up]=RS[r],b=Math.sin(Math.PI*u),wv=Math.sin(u*9+r*2+t*5)*.018;
    o.set(A[0]+dx*u+sx*(sd*b+wv),A[1]+(B[1]-A[1])*u+up*b,A[2]+dz*u+sz*(sd*b+wv));return o;};
  return {me,blow(A,B,t){st.A=A;st.B=B;st.t0=t;},smoke(B,t){st.sB=B;st.s0=t;},
    tick(t,cam){const h=(t-st.t0)/(mob?.8:.72),sm=t-st.s0,onB=st.A&&h>=0&&h<1.7,onS=st.sB&&sm>=0&&sm<1.7;me.visible=!!(onB||onS);if(!me.visible)return;
      for(let r=0;r<3;r++)for(let i=0;i<NS;i++){const hh=h-r*.1,u=Math.min(1,Math.max(0,hh-LEN+LEN*i/(NS-1))),k=(r*NS+i)*2;let a=0,wd=0;
        if(onB){pt(r,u,t,_c);pt(r,Math.min(1,u+.03),t,_t).sub(_c);_w.copy(cam.position).sub(_c);_r.crossVectors(_t,_w).normalize();const e=Math.sin(Math.PI*i/(NS-1));wd=(.004+.015*e)*WK;a=(hh-LEN+LEN*i/(NS-1)>=0&&hh-LEN+LEN*i/(NS-1)<=1.02?1:0)*e*.9*(1-Math.min(1,Math.max(0,(hh-1.05)/.4)));
          V(k,_c.x+_r.x*wd,_c.y+_r.y*wd,_c.z+_r.z*wd,RC[r],a);V(k+1,_c.x-_r.x*wd,_c.y-_r.y*wd,_c.z-_r.z*wd,RC[r],a);}else{V(k,0,-99,0,RC[r],0);V(k+1,0,-99,0,RC[r],0);}}
      /* 꺼진 뒤 연기 한 줄(넷째 줄기): 촛불 자리에서 위로 가늘게 살랑이며 */
      {_r.set(1,0,0).applyQuaternion(cam.quaternion);for(let i=0;i<NS;i++){const u=i/(NS-1),k=(3*NS+i)*2;if(onS){const g=Math.min(1,sm/.6),y=st.sB[1]+u*.5*g+sm*.12,ox=Math.sin(u*7+sm*3)*.035*u,wd=.008+.012*u,a=(1-u)*.75*Math.sin(Math.PI*Math.min(1,u+.08))*(1-Math.min(1,Math.max(0,(sm-.9)/.8)));
          V(k,st.sB[0]+_r.x*(ox+wd),y,st.sB[2]+_r.z*(ox+wd),RC[3],a);V(k+1,st.sB[0]+_r.x*(ox-wd),y,st.sB[2]+_r.z*(ox-wd),RC[3],a);}else{V(k,0,-99,0,RC[3],0);V(k+1,0,-99,0,RC[3],0);}}}
      /* 작은 반짝임: 줄기 머리 가까이에서 깜빡이는 마름모 */
      {_r.set(1,0,0).applyQuaternion(cam.quaternion);_u.set(0,1,0).applyQuaternion(cam.quaternion);for(let s=0;s<NSP;s++){const k=NR*NS*2+s*4,u=h-.06-s*.11,ok=onB&&u>0&&u<1,sz=ok?.028*(mob?1.5:1)*(.45+.55*Math.abs(Math.sin(t*17+s*2.1))):0,c=s%2?RC[1]:RC[0];
          if(ok){pt(s%3,u,t,_c);_c.y+=.05*Math.sin(s*3.3);}else _c.set(0,-99,0);
          V(k,_c.x+_r.x*sz,_c.y+_r.y*sz,_c.z+_r.z*sz,c,ok?1:0);V(k+1,_c.x+_u.x*sz*1.5,_c.y+_u.y*sz*1.5,_c.z+_u.z*sz*1.5,c,ok?1:0);V(k+2,_c.x-_r.x*sz,_c.y-_r.y*sz,_c.z-_r.z*sz,c,ok?1:0);V(k+3,_c.x-_u.x*sz*1.5,_c.y-_u.y*sz*1.5,_c.z-_u.z*sz*1.5,c,ok?1:0);}}
      geo.attributes.position.needsUpdate=true;geo.attributes.color.needsUpdate=true;}};}
/* 구름 기둥 하나(높이 h — 아래가 넓고 위로 몽글몽글): lump 목록에 넣을 [geo, 색]들 */
export function pillarParts(x,z,gy,h=3.2,seed=0){const out=[],n=5,cols=['#b99ad8','#a987cd','#c6abe0','#9c7cc2']; /* 안개·땅(밝은 연보라)과 뚜렷이 구분되게 한 단계 진한 보라 — 위쪽 덩이만 밝게 */
  for(let i=0;i<n;i++){const u=i/(n-1),r=.82-.3*u+Math.sin(seed*3.1+i*1.7)*.07,ox=Math.sin(seed*2.3+i*2.1)*.2*(.3+u),oz=Math.cos(seed*1.7+i*1.3)*.2*(.3+u);out.push([puff(r,x+ox,gy+.35+u*(h-.8),z+oz,[1,.92,1]),i===n-1?'#e9dcf7':cols[(i+Math.abs(seed|0))%4]]);}
  out.push([puff(.5,x+.55,gy+.25,z+.2),cols[3]]);out.push([puff(.45,x-.5,gy+.22,z-.3),cols[1]]);return out;}
export {puff};
/* ── 해시계 마을 소품(2026-11-19 — '거꾸로' 소품은 모두 뺌: 금성이 반대로 돌아서 달라지는 건 해의 길·그림자·해시계 눈금 방향뿐) — lump 목록에 넣을 [geo, 색]들 ── */
const W4=(x,gy,z,ry,s=1)=>M4([x,gy,z],[0,ry||0,0],[s,s,s]);
const wpt=(l,x,gy,z,ry)=>[x+l[0]*Math.cos(ry)+l[2]*Math.sin(ry),gy+l[1],z-l[0]*Math.sin(ry)+l[2]*Math.cos(ry)];
/* 구름 집: 몸통 위에 지붕(네모뿔), 문은 앞 아래, 굴뚝은 지붕 위로(연기 자리 smoke), 앞 창문 자리 win(불 켜진 집은 win 색을 밝게), 지붕 꼭대기 자리 top(깃발·바람개비) */
export function houseParts(x,z,gy,ry,o={}){const out=[],W=o.w||2.5,RH=1.35,BH=1.9,wall=o.wall||'#f8ecd8',roof=o.roof||'#e59ab4',trim=o.trim||'#c9788f',win=o.win||'#fff0b8',m=W4(x,gy,z,ry);
  const P=(g,c,p,r,s)=>out.push([g.applyMatrix4(M4(p,r||[0,0,0],s||[1,1,1])).applyMatrix4(m),c]);
  P(new THREE.BoxGeometry(W,BH,W),wall,[0,BH/2-.05,0]);P(new THREE.BoxGeometry(W*1.28,.14,W*1.28),trim,[0,BH,0]);P(new THREE.ConeGeometry(W*.9,RH,4),roof,[0,BH+RH/2,0],[0,PI/4,0]);
  P(new THREE.BoxGeometry(.62,1.0,.08),'#9a6a4a',[.38,.5,W/2+.03]);P(sph(.05,6,5),'#ffd27a',[.2,.5,W/2+.09]);P(new THREE.BoxGeometry(.9,.09,.36),trim,[.38,.02,W/2+.2]);
  P(new THREE.BoxGeometry(.6,.6,.08),win,[-.62,1.12,W/2+.03]);P(new THREE.BoxGeometry(.68,.07,.1),trim,[-.62,1.12,W/2+.04]);P(new THREE.BoxGeometry(.07,.68,.1),trim,[-.62,1.12,W/2+.04]);
  P(new THREE.BoxGeometry(.08,.5,.5),win,[W/2+.03,1.15,.1]);P(new THREE.BoxGeometry(.08,.5,.5),win,[-W/2-.03,1.1,-.2]);
  P(new THREE.BoxGeometry(.3,.8,.3),trim,[-W*.26,BH+RH*.62,-W*.12]);P(new THREE.BoxGeometry(.4,.1,.4),wall,[-W*.26,BH+RH*.62+.42,-W*.12]);
  for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]])P(sph(.42,8,6),'#f3e9fc',[a*W*.52,.16,b*W*.52],[0,0,0],[1.2,.7,1.2]); /* 밑동 구름 */
  return {parts:out,smoke:wpt([-W*.26,BH+RH*.62+.55,-W*.12],x,gy,z,ry),win:wpt([-.62,1.12,W/2+.16],x,gy,z,ry),top:wpt([0,BH+RH,0],x,gy,z,ry),r:W*.72};}
/* 우산 나무(바로 선): 줄기 위에 우산 갓 + 가장자리 솜 방울 */
export function treeParts(x,z,gy,seed=0,s=1){const out=[],cols=['#9fd8c4','#b7a4ea','#f4b6cb','#a9d4f0'],c=cols[Math.abs(seed)%4],m=W4(x,gy,z,seed*1.3,s),P=(g,col,p,r)=>out.push([g.applyMatrix4(M4(p,r||[0,0,0])).applyMatrix4(m),col]);
  P(new THREE.CylinderGeometry(.11,.17,2.1,7),'#b58d6c',[0,1.05,0]);P(new THREE.ConeGeometry(1.35,.95,9),c,[0,2.5,0]);for(let i=0;i<9;i++){const a=i/9*PI*2;P(sph(.19,6,5),'#fbf6ff',[Math.cos(a)*1.3,2.06,Math.sin(a)*1.3]);}
  P(sph(.12,6,5),'#fbf6ff',[0,3.0,0]);return out;}
/* 우체통(바로 선) */
export function mailboxParts(x,z,gy,ry){const out=[],m=W4(x,gy,z,ry),P=(g,col,p,r)=>out.push([g.applyMatrix4(M4(p,r||[0,0,0])).applyMatrix4(m),col]);
  P(new THREE.CylinderGeometry(.035,.035,.95,6),'#f6ead8',[0,.47,0]);P(new THREE.CylinderGeometry(.17,.17,.05,10),'#c9a56a',[0,.03,0]);
  P(new THREE.BoxGeometry(.46,.3,.32),'#e8556a',[0,1.08,0]);P(new THREE.CylinderGeometry(.16,.16,.46,10).applyMatrix4(M4([0,0,0],[0,0,PI/2])),'#e8556a',[0,1.2,0]);P(new THREE.BoxGeometry(.24,.035,.03),'#fff6e6',[0,1.06,.165]);P(new THREE.BoxGeometry(.04,.2,.13),'#ffd27a',[.25,1.1,0]);return out;}
/* 깃대·바람개비 대(막대만 — 천·날개는 구역이 바람에 움직임) */
export function poleParts(x,z,gy,h=2.6){return [[new THREE.CylinderGeometry(.035,.05,h,6).applyMatrix4(M4([x,gy+h/2,z])),'#b58d6c'],[sph(.07,6,5).applyMatrix4(M4([x,gy+h,z])),'#f3cf6a']];}
/* 또생일 단상(구름 단 — 위가 평평) · 작은 식탁(천을 씌운 둥근 상) */
export function podiumParts(x,z,gy,h=.72){const out=[],P=(g,c)=>out.push([g,c]);
  P(new THREE.CylinderGeometry(.5,.56,.12,14).applyMatrix4(M4([x,gy+h-.06,z])),'#fff3d6');for(let i=0;i<7;i++){const a=i/7*PI*2;P(sph(.3,8,6).applyMatrix4(M4([x+Math.cos(a)*.42,gy+.22+(i%2)*.16,z+Math.sin(a)*.42],[0,0,0],[1,.9,1])),i%2?'#f6d2e2':'#fbe6f0');}
  P(sph(.46,10,8).applyMatrix4(M4([x,gy+.34,z],[0,0,0],[1,.9,1])),'#fbe6f0');return out;}
export function tableParts(x,z,gy,h=.78){const out=[],P=(g,c)=>out.push([g,c]);
  P(new THREE.CylinderGeometry(.06,.1,h,8).applyMatrix4(M4([x,gy+h/2,z])),'#b58d6c');P(new THREE.CylinderGeometry(.22,.26,.05,10).applyMatrix4(M4([x,gy+.03,z])),'#b58d6c');
  P(new THREE.CylinderGeometry(.5,.5,.05,16).applyMatrix4(M4([x,gy+h,z])),'#fff3d6');P(new THREE.CylinderGeometry(.52,.56,.2,16,1,true).applyMatrix4(M4([x,gy+h-.1,z])),'#f59ab5');return out;}
/* 해시계 그림(금빛 판 위 숫자 눈금 — 반시계 방향: 금성에선 그림자가 지구와 반대로 돈다) — 한 장을 모든 해시계가 같이 씀 */
let DIAL=null;
export function dialMat(){if(DIAL)return DIAL;const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');
  const gr=g.createRadialGradient(128,128,10,128,128,128);gr.addColorStop(0,'#fbe9a8');gr.addColorStop(.8,'#f3cf6a');gr.addColorStop(1,'#d9a94a');g.fillStyle=gr;g.beginPath();g.arc(128,128,127,0,PI*2);g.fill();
  g.strokeStyle='#8a5a2c';g.lineWidth=5;g.beginPath();g.arc(128,128,121,0,PI*2);g.stroke();g.lineWidth=2;g.beginPath();g.arc(128,128,78,0,PI*2);g.stroke();
  g.fillStyle='#6a4420';g.font='700 30px Jua,Gowun Dodum,sans-serif';g.textAlign='center';g.textBaseline='middle';
  for(let i=1;i<=12;i++){const a=-PI/2-i/12*PI*2; /* 반시계 방향 */g.fillText(String(i),128+Math.cos(a)*99,130+Math.sin(a)*99);g.save();g.translate(128+Math.cos(a)*78,128+Math.sin(a)*78);g.rotate(a);g.fillRect(-8,-2,10,4);g.restore();}
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;DIAL=new THREE.MeshBasicMaterial({map:t});DIAL.userData.noStorybook=true;return DIAL;}
/* 해시계: 받침 + 금빛 판(그림은 faces에 넣어 한 덩어리로) + 위로 솟은 세모 바늘. s = 크기(1 = 판 반지름 .5m) */
export function sundialParts(x,z,gy,s=1,faces=null,hk=1,o={}){const out=[],m=M4([x,gy,z],[0,0,0],[s,s*hk,s]),P=(g,col,p,r)=>out.push([g.applyMatrix4(M4(p,r||[0,0,0])).applyMatrix4(m),col]);
  P(new THREE.CylinderGeometry(.5,.62,.5,12),'#e6d6f6',[0,.25,0]);P(new THREE.CylinderGeometry(.56,.56,.06,20),'#c9973a',[0,.52,0]);
  /* o.pyr: 세모뿔 바늘(위에서 내려다봐도 시곗바늘처럼 한 숫자를 가리키지 않음 — 광장 큰 해시계) · o.wedge: 판 위 동쪽으로 뻗는 옅은 그림자(해뜨기 전 서쪽 하늘빛) · 판 그림은 6이 동쪽(+x)에 오게 돌림 */
  if(o.pyr)P(new THREE.ConeGeometry(.15,.52,4),'#ecd49a' /* 밝은 놋쇠빛(판과 비슷하게) — 짙은 갈색이면 위에서 볼 때 바늘이 그림자보다 먼저 눈에 띄었다 */,[0,.55+.26,0],[0,PI/4,0]);else P(new THREE.CylinderGeometry(.34,.34,.05,3),'#8a5a3c',[0,.78,0],[PI/2,0,PI/2]);
  if(o.wedge){const q=new THREE.CylinderGeometry(.3,.3,.008,3);q.scale(.42,1,1.25);P(q,'#b3883a',[.2,.588,0],[0,PI/2,0]);}
  if(faces)faces.push(new THREE.CircleGeometry(.52,24).applyMatrix4(M4([0,.556,0],[-PI/2,0,0])).applyMatrix4(M4([0,0,0],[0,PI/2,0])).applyMatrix4(m));return out;}
/* 파티 우산(바람 타기) — 원점 = 손잡이(두 손), 대가 위로 올라 머리 위에 갓 */
export const UMB_HAND=[-.5,.64,.02]; /* 07 '우산 잡기' 자세의 오른손 자리(원더룹 기준 — 재서 맞춘 값) */
export function makeUmbrella(){const g=new THREE.Group();g.name='venus-umbrella';const L=[],C=['#f59ab5','#fff3d6','#8fd6c2','#fff3d6'],HX=UMB_HAND[0],HY=UMB_HAND[1],HZ=UMB_HAND[2],RIM=1.63,TOP=2.08,R=1.16;
  /* 2026-11-21 두 번째: 원점 = 원더룹 발밑(타는 동안 원더룹 자리·방향 그대로 따라감). 곧은 우산대 — 옆 위로 쭉 뻗은 오른손(07 '우산 잡기' 손 자리 UMB_HAND)에서 탈 옆으로 똑바로 올라가 머리 위 우산 꼭지로.
     얼굴 앞을 지나지 않는다(예전: 가슴 앞에서 두 손으로 쥐는 휜 우산대 — 안 예뻤다). 우산 가운데는 손 위(머리에서 옆으로 약 0.5m) — 지붕이 넓어 머리를 다 덮음 */
  for(let i=0;i<8;i++){const a0=i/8*PI*2,a1=(i+1)/8*PI*2,ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute([HX,TOP,HZ,HX+Math.sin(a1)*R,RIM,HZ+Math.cos(a1)*R,HX+Math.sin(a0)*R,RIM,HZ+Math.cos(a0)*R,HX,TOP,HZ,HX+Math.sin(a0)*R,RIM,HZ+Math.cos(a0)*R,HX+Math.sin(a1)*R,RIM,HZ+Math.cos(a1)*R],3));ge.setAttribute('uv',new THREE.Float32BufferAttribute(new Array(12).fill(.5),2));ge.computeVertexNormals();L.push([ge,C[i%4]]);
    L.push([sph(.07,6,5).applyMatrix4(M4([HX+Math.sin(a0)*R,RIM-.02,HZ+Math.cos(a0)*R])),'#ffd27a']);}
  L.push([new THREE.CylinderGeometry(.024,.024,TOP-(HY-.1),6).applyMatrix4(M4([HX,(TOP+HY-.1)/2,HZ])),'#b58d6c']);
  L.push([sph(.05,6,5).applyMatrix4(M4([HX,HY-.11,HZ])),'#e8556a']);L.push([sph(.05,6,5).applyMatrix4(M4([HX,TOP+.04,HZ])),'#e8556a']);
  const me=lump(L.map(([q,c])=>[q.index?q.toNonIndexed():q,c]),false,2);me.frustumCulled=false;g.add(me);return g;}
/* 날아간 생일 초 하나(크게 — 멀리서도 보이게): 줄무늬 초 + 불꽃 */
export function makeCandle(col='#8cc8ec'){const g=new THREE.Group(),L=[];L.push([new THREE.CylinderGeometry(.07,.07,.5,8).applyMatrix4(M4([0,0,0])),col]);for(let i=0;i<3;i++)L.push([new THREE.TorusGeometry(.072,.014,4,10).applyMatrix4(M4([0,-.16+i*.16,0],[PI/2,0,0])),'#ffffff']);
  L.push([sph(.07,8,6).applyMatrix4(M4([0,.36,0],[0,0,0],[1,1.7,1])),'#ffd27a']);const me=lump(L,false,2);me.frustumCulled=false;g.add(me);return g;}
/* 조는 구름 양: 납작 엎드린 양털 구름 + 땅에 턱을 괸 얼굴 */
export function sheepParts(x,z,gy,ry,seed=0){const out=[],m=W4(x,gy,z,ry),P=(g,col,p,r,s)=>out.push([g.applyMatrix4(M4(p,r||[0,0,0],s||[1,1,1])).applyMatrix4(m),col]),A='#fbf6ff',B='#eee2f8',F='#75618c';
  P(sph(.4,10,8),A,[0,.3,0],[0,0,0],[1.3,.8,1]);[[-.3,.42,.1,.2],[.28,.44,-.08,.21],[0,.5,-.1,.22],[-.1,.36,.28,.17],[.2,.32,.26,.16],[-.42,.24,-.1,.17],[.44,.22,.05,.16]].forEach(([a,b,c,r],i)=>P(sph(r,7,5),i%2?B:A,[a,b,c]));
  P(sph(.17,9,7),F,[0,.17,.46],[0,0,0],[1,.86,1.1]);P(sph(.1,7,5),A,[0,.31,.4]);for(const s of [-1,1]){P(sph(.06,6,4),F,[s*.17,.2,.4],[0,0,s*.5],[1.5,.5,.8]);P(sph(.02,5,4),'#f6ead8',[s*.07,.2,.615],[0,0,0],[1.6,.5,.6]);}
  return out;}
/* 놀이용 구름 양(구름 양 몰기 — 2026-11-21, 흰 구름 바닥 위에서 위에서 내려다봐도 보이게): 크림 몸 + 위를 올려다보는 진한 얼굴(흰 눈·분홍 볼) + 짧은 다리 넷. 원점 = 발밑, 앞 = +z */
export function herdSheepParts(){const out=[],LY=.13,P=(g,col,p,r,s)=>out.push([g.applyMatrix4(M4([p[0],p[1]+LY,p[2]],r||[0,0,0],s||[1,1,1])),col]),A='#ffeec2',B='#f7dca0',F='#3a2850';
  P(sph(.4,10,8),A,[0,.3,0],[0,0,0],[1.3,.8,1]);[[-.3,.42,.1,.2],[.28,.44,-.08,.21],[0,.5,-.16,.22],[-.42,.24,-.1,.17],[.44,.22,.05,.16],[-.2,.3,.3,.15],[.22,.3,.3,.15],[0,.34,-.36,.16]].forEach(([a,b,c,r],i)=>P(sph(r,7,5),i%2?B:A,[a,b,c]));
  P(sph(.24,10,8),F,[0,.47,.3],[-.75,0,0],[1.05,.8,1]);P(sph(.11,7,5),A,[0,.66,.12]);
  for(const s of [-1,1]){P(sph(.075,6,4),F,[s*.27,.5,.2],[0,0,s*.6],[1.6,.5,.9]);P(sph(.052,7,5),'#ffffff',[s*.09,.635,.4],[-.75,0,0],[1,1,.5]);P(sph(.024,5,4),'#1d1230',[s*.09,.655,.425]);P(sph(.05,6,4),'#ff8fa8',[s*.165,.56,.47],[-.75,0,0],[1.1,.8,.4]);
    for(const f of [-1,1])P(new THREE.CylinderGeometry(.055,.05,.24,6),F,[s*.24,-.02,f*.2]);}
  P(sph(.035,5,4),'#ffb7c4',[0,.585,.5],[-.75,0,0],[1.3,.7,.5]);
  return out;}
/* 구름 양 울타리(둥근 펜스 — 문 쪽 gate±half 라디안은 넓게 비움): 말뚝 + 가로대 두 줄 + 문 양옆 큰 말뚝(구름 방울). lump 목록 [geo, 색] · 땅 높이는 gyAt(x,z) */
export function fenceParts(cx,cz,R,gate,half,gyAt){const out=[],N=22,WD='#c79a72',WD2='#b1835c',pts=[];
  for(let i=0;i<=N;i++){const a=gate+half+(PI*2-half*2)*i/N,x=cx+Math.cos(a)*R,z=cz+Math.sin(a)*R,gy=gyAt(x,z),end=i===0||i===N,h=end?1.05:.78;pts.push([x,gy,z]);
    out.push([new THREE.CylinderGeometry(end?.085:.06,end?.095:.07,h,6).applyMatrix4(M4([x,gy+h/2-.05,z])),i%2?WD:WD2]);out.push([sph(end?.15:.075,6,5).applyMatrix4(M4([x,gy+h-.03,z])),end?'#fff3d6':'#f6e7d2']);}
  for(let i=0;i<N;i++){const a=pts[i],b=pts[i+1],dx=b[0]-a[0],dz=b[2]-a[2],L=Math.hypot(dx,dz),ry=Math.atan2(-dz,dx);for(const y of [.3,.58])out.push([new THREE.BoxGeometry(L,.07,.045).applyMatrix4(M4([(a[0]+b[0])/2,(a[1]+b[1])/2+y,(a[2]+b[2])/2],[0,ry,0])),y>.4?WD:WD2]);}
  return out;}
/* 낡은 비행선(풍선형): 기운 자국이 있는 풍선 + 줄에 매달린 곤돌라 + 꼬리 날개 — 구름 바다 너머에 천천히 떠다님(그리기 1) */
/* 금성 비행선(2026-11-21 다시 — 예전: 통통한 공 + 녹색·분홍 덧댄 조각 무늬). 금성 구름 위 비행선 탐사 연구(NASA HAVOC 구상)의 생김새를 참고:
   매끈하고 길쭉한 유선형 몸통(앞은 둥글고 뒤로 갈수록 가늘게 — 크림·은빛, 가는 이음선 몇 줄) · 등 위에 길게 붙은 남색 태양전지판 띠(구름 위는 햇빛이 강해 태양광으로 난다)
   · 십자 꼬리날개 넷(끝만 포인트 색) · 아래 작은 곤돌라(창문) + 곤돌라 양옆 수평 팔 끝의 프로펠러 둘(둥근 테 안에서 천천히 돎) · 장식은 옆구리 띠 한 줄뿐.
   한 덩어리(그리기 1 그대로) — 프로펠러 날개는 맨 끝 꼭짓점들만 CPU로 돌림(userData.spin(t), 꼭짓점 약 170개). 앞 = +x */
export function makeAirship(){const g=new THREE.Group();g.name='venus-airship';const L=[],P=(geo,col,p,r,s)=>L.push([geo.applyMatrix4(M4(p||[0,0,0],r||[0,0,0],s||[1,1,1])),col]);
  const X0=-3.4,LEN=6.4,RM=1.15,hr=u=>{if(u>.6){const a=(u-.6)/.4;return RM*Math.sqrt(Math.max(0,1-a*a));}const a=(.6-u)/.6;return RM*(1-.88*Math.pow(a,1.7));},xs=u=>X0+LEN*u,
    HULL='#efe9da',SEAM='#cbc4b3',SOL=['#27345f','#31417a'],PT='#e0785e',GON='#dcd5c5';
  {const pts=[new THREE.Vector2(0,X0-.06)];for(let i=0;i<=16;i++){const u=i/16;pts.push(new THREE.Vector2(Math.max(.001,hr(u)),xs(u)));}P(new THREE.LatheGeometry(pts,16),HULL,[0,0,0],[0,0,-PI/2]);}
  for(const u of [.2,.38,.6,.8])P(new THREE.TorusGeometry(hr(u)+.004,.016,4,18),SEAM,[xs(u),0,0],[0,PI/2,0]); /* 가는 이음선 */
  /* 몸통 겉면을 따라 붙는 띠: 진행 u0~u1, 둘레 각도 ang(0 = 등 위) ± half, 겉면에서 off만큼 띄움 */
  const strip=(u0,u1,ang,half,off,n,cols)=>{for(let i=0;i<n;i++){const ua=u0+(u1-u0)*i/n,ub=u0+(u1-u0)*(i+1)/n-(cols.length>1?.006:0),pos=[],idx=[],J=3;
      for(const u of [ua,ub])for(let j=0;j<=J;j++){const an=ang+(j/J*2-1)*half,r=hr(u)+off;pos.push(xs(u),r*Math.cos(an),r*Math.sin(an));}
      for(let j=0;j<J;j++){const a0=j,b0=J+1+j,c0=J+2+j,d0=j+1;idx.push(a0,c0,b0,a0,d0,c0);}
      const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));ge.setAttribute('uv',new THREE.Float32BufferAttribute(pos.flatMap((_,k)=>k%3===0?[pos[k]*.3,pos[k+2]*.3]:[]),2));ge.setIndex(idx);ge.computeVertexNormals();L.push([ge,cols[i%cols.length]]);}};
  strip(.24,.86,0,.56,.024,9,SOL); /* 등 위 태양전지판 띠(칸마다 살짝 다른 남색) */
  strip(.2,.9,PI/2+.16,.055,.02,14,[PT]);strip(.2,.9,-PI/2-.16,.055,.02,14,[PT]); /* 옆구리 띠 한 줄씩 */
  /* 십자 꼬리날개 넷: 몸통 색, 끝만 포인트 색 */
  {const sh=(q)=>{const S=new THREE.Shape();S.moveTo(q[0][0],q[0][1]);for(let i=1;i<q.length;i++)S.lineTo(q[i][0],q[i][1]);S.closePath();return new THREE.ExtrudeGeometry(S,{depth:.06,bevelEnabled:false}).translate(0,0,-.03);};
    for(let k=0;k<4;k++){const r=[k*PI/2+PI/4*0,0,0];P(sh([[-1.95,.3],[-2.555,.98],[-3.263,.98],[-3.15,.3]]),HULL,[0,0,0],r);P(sh([[-2.555,.98],[-2.75,1.2],[-3.3,1.2],[-3.263,.98]]),PT,[0,0,0],r);}}
  /* 곤돌라(창문 넷씩) + 몸통에 잇는 짧은 기둥 */
  const GY=-1.43,GX=.35;P(new THREE.CapsuleGeometry(.34,1.15,4,10),GON,[GX,GY,0],[0,0,PI/2]);P(new THREE.BoxGeometry(1.2,.06,.5),SEAM,[GX,GY-.3,0]);
  for(const x of [-.35,.3])P(new THREE.CylinderGeometry(.05,.05,.3,5),SEAM,[GX+x,GY+.36,0]);
  for(const sg of [1,-1])for(let i=0;i<4;i++)P(new THREE.BoxGeometry(.17,.14,.03),'#ffdf9a',[GX-.5+i*.33,GY+.05,sg*.335]);
  /* 프로펠러 둘(2026-11-21 다시 — 예전: 정면을 보는 긴 날개가 옆에서 보면 곤돌라 아래로 매달린 막대 하나처럼 보였다): 곤돌라 양옆으로 수평 팔을 내고 그 끝에 둥근 테(덕트) 안의 짧은 날개 넷.
     회전축을 앞에서 바깥으로 약 70° 틀어(TOE — 거의 옆을 봄. 35°는 구름 끝 카메라에서 테가 딱 옆으로 서서 선 하나로 보였다) 옆에서 봐도 둥근 테와 도는 날개가 보인다. 날개는 곤돌라 높이 안(아래로 안 내려옴). 날개·가운데 꼭지는 맨 끝에 넣어 꼭짓점만 돌림 */
  const PZ=1.05,PX=GX-.05,PY=GY+.08,TOE=1.25,BR=.33;for(const sg of [1,-1]){const ry=-sg*TOE,c=[PX,PY,sg*PZ];
    P(new THREE.BoxGeometry(.14,.07,PZ-.3),SEAM,[PX-.06,PY,sg*(PZ+.3)/2]);
    L.push([new THREE.CapsuleGeometry(.09,.22,3,8).applyMatrix4(M4([-.16,0,0],[0,0,PI/2])).applyMatrix4(M4(c,[0,ry,0])),'#bdb6a6']);
    L.push([new THREE.TorusGeometry(BR+.05,.035,5,16).applyMatrix4(M4([0,0,0],[0,PI/2,0])).applyMatrix4(M4(c,[0,ry,0])),HULL]);}
  let nFix=0;for(const [ge] of L)nFix+=ge.index?ge.index.count:ge.attributes.position.count;
  const props=[];for(const sg of [1,-1]){const c=[PX,PY,sg*PZ],ry=-sg*TOE;let n0=0;const add=(ge,col)=>{ge.applyMatrix4(M4(c,[0,ry,0]));n0+=ge.index?ge.index.count:ge.attributes.position.count;L.push([ge,col]);};
    add(new THREE.ConeGeometry(.07,.14,6).applyMatrix4(M4([.06,0,0],[0,0,-PI/2])),PT);
    for(let b=0;b<4;b++)add(new THREE.BoxGeometry(.03,BR,.11).applyMatrix4(M4([0,BR/2,0],[0,.4,0])).applyMatrix4(M4([0,0,0],[b*PI/2,0,0])),'#5d627a');
    props.push({c,n:n0,sg,ax:[Math.cos(TOE),0,sg*Math.sin(TOE)]});}
  const me=lump(L,false,1.2);me.frustumCulled=false;g.add(me);
  {const pa=me.geometry.attributes.position,na=me.geometry.attributes.normal;let o=nFix;for(const q of props){q.o=o;q.p=pa.array.slice(o*3,(o+q.n)*3);q.nn=na.array.slice(o*3,(o+q.n)*3);o+=q.n;}
    /* 축 ax 둘레로 돌림(로드리게스): v' = v·cos + (ax×v)·sin + ax(ax·v)(1−cos) */
    const rot=(x,y,z,ax,cs,sn,out,w)=>{const d=(ax[0]*x+ax[1]*y+ax[2]*z)*(1-cs);out[w]=x*cs+(ax[1]*z-ax[2]*y)*sn+ax[0]*d;out[w+1]=y*cs+(ax[2]*x-ax[0]*z)*sn+ax[1]*d;out[w+2]=z*cs+(ax[0]*y-ax[1]*x)*sn+ax[2]*d;};
    g.userData.spin=t=>{for(const q of props){const a=t*2.4*q.sg,cs=Math.cos(a),sn=Math.sin(a),c=q.c;for(let i=0;i<q.n;i++){const k=i*3,w=(q.o+i)*3;rot(q.p[k]-c[0],q.p[k+1]-c[1],q.p[k+2]-c[2],q.ax,cs,sn,pa.array,w);pa.array[w]+=c[0];pa.array[w+1]+=c[1];pa.array[w+2]+=c[2];rot(q.nn[k],q.nn[k+1],q.nn[k+2],q.ax,cs,sn,na.array,w);}}pa.needsUpdate=true;na.needsUpdate=true;};}
  return g;}
