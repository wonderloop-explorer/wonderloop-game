/* 무한 우주 ③ 구름 행성(금성) 주민·소품 (2026-11-18) — 원더룹 키 1.38m = 1 기준, 로우폴리 공 덩어리 + 색연필 결(martians lump — 툰 3단·정점 색)
   거꾸리 0.9(1.24m): 연보라 구름 솜뭉치 몸 + 작은 해시계 모자. 늘 뒷걸음질(얼굴은 원더룹 쪽, 등이 가는 방향) — 그리기 3(몸·팔 둘)
   뭉게 문지기 1.5(2.07m): 커다란 양털 구름 몸 + 졸린 눈. 코 골 때 몸이 부풀었다 꺼짐 — 그리기 3(몸·감은 눈·뜬 눈)
   또생일 0.6(0.83m): 작은 케이크 모양 고깔모자를 쓴 꼬마 — 그리기 1 / 케이크(초 셋) 2(케이크·불꽃)
   고리 얼음 배 1 · 구름 기둥·구름 둑은 구역(venus.js)이 한 덩어리로 */
import * as THREE from 'three';
import {lump,M4,sph} from './martians.js';
const PI=Math.PI;
/* 공(가운데 c·반지름 R·축 배율 k) 겉면의 한 점(위아래 el·좌우 az — 앞이 +z)에 납작한 무늬를 세워 붙임 */
function on(geo,R,c,el,az,roll=0,out=0,sc=[1,1,1],k=[1,1,1]){const n=new THREE.Vector3(Math.sin(az)*Math.cos(el),Math.sin(el),Math.cos(az)*Math.cos(el));
  const p=new THREE.Vector3(n.x*(R+out)*k[0]+c[0],n.y*(R+out)*k[1]+c[1],n.z*(R+out)*k[2]+c[2]),nn=new THREE.Vector3(n.x/k[0],n.y/k[1],n.z/k[2]).normalize();
  const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),nn).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),roll));
  return geo.applyMatrix4(new THREE.Matrix4().compose(p,q,new THREE.Vector3(...sc)));}
const puff=(r,x,y,z,s=[1,1,1])=>sph(r,10,8).applyMatrix4(M4([x,y,z],[0,0,0],s));
const DARK='#3a2c44';
/* ── 거꾸리 ── */
export function makeGeokkuri(){const root=new THREE.Group();root.name='geokkuri';const body=new THREE.Group();root.add(body);
  const A='#c9a6e0',B='#d9bfee',C='#b48fd2',L=[],R=.4,c=[0,.56,0],k=[1,.96,.9];
  L.push([sph(R,16,12).applyMatrix4(M4(c,[0,0,0],k)),A]);
  [[-.3,.36,-.05,.24,B],[.3,.36,-.05,.24,B],[0,.3,-.26,.27,C],[-.2,.74,-.2,.22,B],[.22,.76,-.16,.21,A],[0,.9,-.02,.25,B],[-.3,.62,.02,.2,A],[.3,.64,.0,.2,A],[.0,.3,.2,.22,B]]
    .forEach(([x,y,z,r,col])=>L.push([puff(r,x,y,z),col]));
  for(const s of [-1,1]){L.push([on(sph(1,10,7),R,c,.2,s*.36,0,-.004,[R*.1,R*.135,R*.04],k),DARK]);
    L.push([on(sph(1,6,5),R,c,.27,s*.36-s*.04,0,.03,[R*.035,R*.035,R*.02],k),'#ffffff']);
    L.push([on(sph(1,8,6),R,c,-.02,s*.66,0,0,[R*.12,R*.075,R*.03],k),'#f4a9c0']);
    L.push([puff(.1,s*.17,.07,.06,[1,.62,1.35]),C]);}
  L.push([on(new THREE.TorusGeometry(1,.2,5,12,PI),R,c,-.04,0,PI,.004,[R*.12,R*.085,R*.05],k),'#6a3a5a']);
  /* 해시계 모자: 크림 원판 + 갈색 삼각 바늘 + 시간 눈금 */
  const hy=1.12;L.push([new THREE.CylinderGeometry(.21,.21,.04,16).applyMatrix4(M4([0,hy,-.02],[.16,0,0])),'#f6ecd2']);
  L.push([new THREE.CylinderGeometry(.225,.225,.02,16).applyMatrix4(M4([0,hy-.022,-.02],[.16,0,0])),'#c9a56a']);
  L.push([new THREE.CylinderGeometry(.115,.115,.022,3).applyMatrix4(M4([0,hy+.085,-.045],[PI/2,0,PI/2])),'#8a5a3c']);
  for(let i=0;i<7;i++){const a=-PI/2+(i-3)*.42;L.push([new THREE.BoxGeometry(.014,.012,.05).applyMatrix4(M4([Math.sin(a+PI/2)*.16,hy+.024+Math.cos(a+PI/2)*.16*-.16,-.02+Math.cos(a+PI/2)*.16],[.16,a+PI/2,0])),'#8a5a3c']);}
  const me=lump(L,true,2.2);me.name='geokkuri-body';body.add(me);
  const arms=[-1,1].map(s=>{const g=new THREE.Group();g.position.set(s*.37,.56,.06);me.add(g);g.add(lump([[puff(.085,0,-.1,0,[1,1.5,1]),B],[puff(.075,0,-.22,.01),A]],true,2.2));g.rotation.z=s*.5;g.userData.s=s;return g;});
  const st={mode:'idle',pt:0};
  /* mode: idle · walk(뒷걸음 뒤뚱) · talk · point(오른팔로 가리킴) · sit */
  function tick(dt,t,mode){st.mode=mode||'idle';const w=st.mode==='walk',tk=st.mode==='talk';
    body.position.y=w?Math.abs(Math.sin(t*9))*.07:tk?Math.abs(Math.sin(t*6))*.03:Math.sin(t*2.2)*.012+(st.mode==='sit'?-.1:0);
    body.rotation.z=w?Math.sin(t*9)*.09:Math.sin(t*1.7)*.02;body.rotation.x=w?-.07:0;
    const sy=1+(tk?Math.sin(t*12)*.015:Math.sin(t*2.2)*.012);me.scale.set(1/Math.sqrt(sy),sy,1/Math.sqrt(sy));
    st.pt+=((st.mode==='point'?1:0)-st.pt)*Math.min(1,dt*8);
    arms.forEach(g=>{const s=g.userData.s,sw=w?Math.sin(t*9+(s>0?0:PI))*.35:Math.sin(t*2+s)*.06;g.rotation.z=s*(.5+(tk?.25+Math.sin(t*7+s)*.2:0))+(s>0?st.pt*1.25:0);g.rotation.x=sw-(s>0?st.pt*.5:0);});}
  return {root,body,mesh:me,tick,head:1.0};}
/* ── 뭉게 문지기 ── */
export function makeMunge(){const root=new THREE.Group();root.name='munge';const body=new THREE.Group();root.add(body);
  const A='#f6f1fb',B='#e9def5',C='#ddcdef',L=[],R=.86,c=[0,.86,0],k=[1.22,.94,1];
  L.push([sph(R,18,13).applyMatrix4(M4(c,[0,0,0],k)),A]);
  [[-.95,.5,.1,.5,B],[.95,.5,.1,.5,B],[-.6,.42,.55,.42,A],[.62,.4,.55,.42,A],[0,.36,.7,.4,B],[-.75,1.2,-.2,.48,A],[.72,1.24,-.15,.46,B],[0,1.52,-.05,.52,A],[-.4,1.62,.12,.34,B],[.42,1.6,.08,.36,A],
    [0,.6,-.7,.6,C],[-.8,.8,-.5,.5,C],[.8,.8,-.5,.5,C],[-1.25,.36,-.2,.34,C],[1.25,.36,-.2,.34,C]].forEach(([x,y,z,r,col])=>L.push([puff(r,x,y,z),col]));
  for(const s of [-1,1])L.push([on(sph(1,8,6),R,c,-.08,s*.52,0,0,[R*.13,R*.08,R*.03],k),'#f6b3c6']);
  L.push([on(sph(1,8,6),R,c,-.2,0,0,0,[R*.05,R*.06,R*.03],k),'#7a4a66']);
  const me=lump(L,true,1.6);me.name='munge-body';body.add(me);
  /* 감은 눈(아래로 둥근 선 — 졸림) · 뜬 눈(반쯤 → 크게) */
  const closed=lump([-1,1].map(s=>[on(new THREE.TorusGeometry(1,.17,5,12,PI),R,c,.1,s*.3,PI,.01,[R*.1,R*.06,R*.05],k),DARK]),false);me.add(closed);
  const open=lump([-1,1].flatMap(s=>[[on(sph(1,10,7),R,c,.1,s*.3,0,.004,[R*.085,R*.1,R*.035],k),DARK],[on(sph(1,6,5),R,c,.15,s*.3-s*.03,0,.04,[R*.03,R*.03,R*.02],k),'#ffffff']]),false);me.add(open);open.visible=false;
  const st={ph:0,puff:0,eye:0,wob:0};
  /* state: sleep(코 골며 부풀었다 꺼짐) · ask(뒤척이며 눈을 반쯤) · wake(눈을 크게, 몸이 푹 부풂). 돌려주는 값 = 들숨이 시작된 프레임이면 true(코골이 소리 박자) */
  function tick(dt,t,state){const sl=state==='sleep',ask=state==='ask',wk=state==='wake';let beat=false;
    const p0=st.ph;st.ph=(st.ph+dt/2.6)%1;if(sl&&st.ph<p0)beat=true;
    const br=sl?Math.max(0,Math.sin(st.ph*PI*2))**.8*.5+Math.max(0,Math.sin(st.ph*PI*2-.6))*.5:0;
    st.puff+=((wk?1:ask?.25:0)-st.puff)*Math.min(1,dt*7);st.eye+=((wk?1:ask?.55:0)-st.eye)*Math.min(1,dt*10);st.wob+=((ask?1:0)-st.wob)*Math.min(1,dt*5);
    const sy=1+br*.11+st.puff*.1,sx=1+br*.045+st.puff*.1;me.scale.set(sx,sy,sx);body.rotation.z=Math.sin(t*5.2)*.07*st.wob+Math.sin(t*.8)*.012;body.rotation.x=st.wob*.05;
    open.visible=st.eye>.12;closed.visible=!open.visible;if(open.visible)open.scale.set(1,1,1),open.scale.y=.45+.55*st.eye;return beat;}
  return {root,body,mesh:me,tick,head:1.75};}
/* ── 또생일 ── */
export function makeDdo(){const root=new THREE.Group();root.name='ddo';const body=new THREE.Group();root.add(body);
  const A='#fbe6f0',B='#f6d2e2',L=[],R=.19,c=[0,.44,0],k=[1,.97,.95];
  L.push([puff(.2,0,.2,0,[1,1.05,.95]),A]);[[-.15,.14,0,.11,B],[.15,.14,0,.11,B],[0,.14,-.13,.12,B],[0,.3,.1,.1,A]].forEach(([x,y,z,r,col])=>L.push([puff(r,x,y,z),col]));
  L.push([sph(R,14,10).applyMatrix4(M4(c,[0,0,0],k)),A]);
  for(const s of [-1,1]){L.push([on(sph(1,10,7),R,c,.08,s*.4,0,-.003,[R*.11,R*.14,R*.04],k),DARK]);L.push([on(sph(1,6,5),R,c,.16,s*.4-s*.05,0,.03,[R*.04,R*.04,R*.02],k),'#ffffff']);
    L.push([on(sph(1,8,6),R,c,-.16,s*.66,0,0,[R*.13,R*.08,R*.03],k),'#f59ab5']);L.push([puff(.06,s*.09,.04,.04,[1,.6,1.3]),B]);L.push([puff(.055,s*.2,.26,.03),A]);}
  L.push([on(sph(1,8,6),R,c,-.24,0,0,0,[R*.1,R*.12,R*.03],k),'#8a3a4a']);
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
  const CN=[[-.09,.03,'#8cc8ec'],[.0,-.07,'#9bd46b'],[.09,.04,'#ffd27a']];CN.forEach(([x,z,col])=>L.push([new THREE.CylinderGeometry(.013,.013,.14,6).applyMatrix4(M4([x,.31,z])),col]));
  for(let i=0;i<5;i++){const a=i/5*PI*2+.3;L.push([puff(.03,Math.cos(a)*.15,.262,Math.sin(a)*.15),'#e8556a']);}
  g.add(lump(L,true,3));
  const fm=new THREE.MeshBasicMaterial({color:'#ffd88a'});fm.userData.noStorybook=true;
  const fg=new THREE.BufferGeometry();{const gs=CN.map(([x,z])=>puff(.024,x,.405,z,[1,1.7,1]));const pos=[];gs.forEach(q=>{const n=q.toNonIndexed().attributes.position;for(let i=0;i<n.count;i++)pos.push(n.getX(i),n.getY(i),n.getZ(i));});fg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));}
  const flames=new THREE.Mesh(fg,fm);flames.name='venus-flames';g.add(flames);
  return {g,flames,tick(t){flames.scale.y=1+Math.sin(t*13)*.08+Math.sin(t*7.3)*.05;},lit(v){flames.visible=v;}};}
/* 토성 고리의 얼음 조각 배: 납작하고 길쭉한 얼음 덩어리(각진 면) + 뱃머리 얼음 뿔 */
export function makeIceBoat(){const g=new THREE.Group();g.name='ice-boat';const L=[];
  const hull=new THREE.IcosahedronGeometry(1,1);{const p=hull.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),kk=1+(Math.sin(x*7.1+z*3.3)*.5+Math.sin(y*5.7+x*2.1)*.5)*.1;p.setXYZ(i,x*kk*1.75,(y>0?y*.16:y*.42)*kk,z*kk*.88);}hull.computeVertexNormals();}
  L.push([hull,'#cfe6fb']);L.push([new THREE.ConeGeometry(.2,.7,5).applyMatrix4(M4([-1.5,.3,0],[0,0,.75])),'#e8f5ff']);L.push([new THREE.ConeGeometry(.12,.4,5).applyMatrix4(M4([-1.25,.24,.3],[.3,0,.6])),'#bcdaf6']);
  L.push([new THREE.ConeGeometry(.14,.36,5).applyMatrix4(M4([1.35,.2,-.1],[0,0,-.7])),'#bcdaf6']);
  const me=lump(L.map(([q,c])=>[q.index?q.toNonIndexed():q,c]),true,1.4);me.geometry.computeVertexNormals();g.add(me);return g;}
/* 구름 기둥 하나(높이 h — 아래가 넓고 위로 몽글몽글): lump 목록에 넣을 [geo, 색]들 */
export function pillarParts(x,z,gy,h=3.2,seed=0){const out=[],n=5,cols=['#b99ad8','#a987cd','#c6abe0','#9c7cc2']; /* 안개·땅(밝은 연보라)과 뚜렷이 구분되게 한 단계 진한 보라 — 위쪽 덩이만 밝게 */
  for(let i=0;i<n;i++){const u=i/(n-1),r=.82-.3*u+Math.sin(seed*3.1+i*1.7)*.07,ox=Math.sin(seed*2.3+i*2.1)*.2*(.3+u),oz=Math.cos(seed*1.7+i*1.3)*.2*(.3+u);out.push([puff(r,x+ox,gy+.35+u*(h-.8),z+oz,[1,.92,1]),i===n-1?'#e9dcf7':cols[(i+Math.abs(seed|0))%4]]);}
  out.push([puff(.5,x+.55,gy+.25,z+.2),cols[3]]);out.push([puff(.45,x-.5,gy+.22,z-.3),cols[1]]);return out;}
export {puff};
