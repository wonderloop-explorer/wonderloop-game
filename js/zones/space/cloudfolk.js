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
  /* 머리 장식 = 해시계(2026-11-19 — 납작한 접시처럼 보였다): 앞으로 기울인 금빛 둥근 판(테두리 진한 금) + 위로 솟은 세모 바늘 + 바늘의 작은 그림자. 숫자 눈금은 판 위에 붙이는 그림(dialTex — 반시계 방향) */
  const hy=1.1,HT=.5,HM=M4([0,hy,.02],[HT,0,0]),hp=(g,c,p,r)=>L.push([g.applyMatrix4(M4(p||[0,0,0],r||[0,0,0])).applyMatrix4(HM),c]);
  hp(new THREE.CylinderGeometry(.27,.27,.035,20),'#c9973a',[0,-.01,0]);hp(new THREE.CylinderGeometry(.245,.245,.04,20),'#f3cf6a',[0,.012,0]);
  hp(new THREE.CylinderGeometry(.13,.13,.022,3),'#8a5a3c',[0,.115,-.02],[PI/2,0,PI/2]);hp(new THREE.CylinderGeometry(.03,.03,.03,8),'#8a5a3c',[0,.04,0]);
  hp(new THREE.CylinderGeometry(.1,.1,.004,3),'#7a5a2a',[.1,.036,.03],[0,.5,0],);
  const me=lump(L,true,2.2);me.name='geokkuri-body';body.add(me);
  {const f=new THREE.Mesh(new THREE.CircleGeometry(.238,24).applyMatrix4(M4([0,.034,0],[-PI/2,0,0])).applyMatrix4(HM),dialMat());f.name='geokkuri-dial';me.add(f);}
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
  function tick(dt,t,state){const sl=state==='sleep',ask=state==='ask',wk=state==='wake',wn=state==='warn';let beat=false; /* warn(2026-11-19): 눈뜨기 전 미리 알림 — 코골이가 멈추고 몸이 크게 들썩 */
    const p0=st.ph;st.ph=(st.ph+dt/2.6)%1;if(sl&&st.ph<p0)beat=true;
    const br=sl?Math.max(0,Math.sin(st.ph*PI*2))**.8*.5+Math.max(0,Math.sin(st.ph*PI*2-.6))*.5:0;
    st.puff+=((wk?1:ask?.25:wn?.45:0)-st.puff)*Math.min(1,dt*7);st.eye+=((wk?1:ask?.55:0)-st.eye)*Math.min(1,dt*10);st.wob+=((ask?1:wn?2.1:0)-st.wob)*Math.min(1,dt*(wn?9:5));
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
export function sundialParts(x,z,gy,s=1,faces=null,hk=1){const out=[],m=M4([x,gy,z],[0,0,0],[s,s*hk,s]),P=(g,col,p,r)=>out.push([g.applyMatrix4(M4(p,r||[0,0,0])).applyMatrix4(m),col]);
  P(new THREE.CylinderGeometry(.5,.62,.5,12),'#e6d6f6',[0,.25,0]);P(new THREE.CylinderGeometry(.56,.56,.06,20),'#c9973a',[0,.52,0]);
  P(new THREE.CylinderGeometry(.34,.34,.05,3),'#8a5a3c',[0,.78,0],[PI/2,0,PI/2]);
  if(faces)faces.push(new THREE.CircleGeometry(.52,24).applyMatrix4(M4([0,.556,0],[-PI/2,0,0])).applyMatrix4(m));return out;}
/* 파티 우산(바람 타기) — 원점 = 손잡이(두 손), 대가 위로 올라 머리 위에 갓 */
export function makeUmbrella(){const g=new THREE.Group();g.name='venus-umbrella';const L=[],C=['#f59ab5','#fff3d6','#8fd6c2','#fff3d6'];
  for(let i=0;i<8;i++){const a0=i/8*PI*2,a1=(i+1)/8*PI*2,R=1.05,ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute([0,1.72,0,Math.sin(a1)*R,1.32,Math.cos(a1)*R,Math.sin(a0)*R,1.32,Math.cos(a0)*R,0,1.72,0,Math.sin(a0)*R,1.32,Math.cos(a0)*R,Math.sin(a1)*R,1.32,Math.cos(a1)*R],3));ge.setAttribute('uv',new THREE.Float32BufferAttribute(new Array(12).fill(.5),2));ge.computeVertexNormals();L.push([ge,C[i%4]]);
    L.push([sph(.07,6,5).applyMatrix4(M4([Math.sin(a0)*R,1.3,Math.cos(a0)*R])),'#ffd27a']);}
  L.push([new THREE.CylinderGeometry(.022,.022,1.75,6).applyMatrix4(M4([0,.86,0])),'#b58d6c']);L.push([new THREE.TorusGeometry(.07,.022,5,10,PI).applyMatrix4(M4([.07,0,0],[0,0,PI])),'#e8556a']);L.push([sph(.05,6,5).applyMatrix4(M4([0,1.76,0])),'#e8556a']);
  const me=lump(L,false,2);me.frustumCulled=false;g.add(me);return g;}
/* 날아간 생일 초 하나(크게 — 멀리서도 보이게): 줄무늬 초 + 불꽃 */
export function makeCandle(col='#8cc8ec'){const g=new THREE.Group(),L=[];L.push([new THREE.CylinderGeometry(.07,.07,.5,8).applyMatrix4(M4([0,0,0])),col]);for(let i=0;i<3;i++)L.push([new THREE.TorusGeometry(.072,.014,4,10).applyMatrix4(M4([0,-.16+i*.16,0],[PI/2,0,0])),'#ffffff']);
  L.push([sph(.07,8,6).applyMatrix4(M4([0,.36,0],[0,0,0],[1,1.7,1])),'#ffd27a']);const me=lump(L,false,2);me.frustumCulled=false;g.add(me);return g;}
/* 조는 구름 양: 납작 엎드린 양털 구름 + 땅에 턱을 괸 얼굴 */
export function sheepParts(x,z,gy,ry,seed=0){const out=[],m=W4(x,gy,z,ry),P=(g,col,p,r,s)=>out.push([g.applyMatrix4(M4(p,r||[0,0,0],s||[1,1,1])).applyMatrix4(m),col]),A='#fbf6ff',B='#eee2f8',F='#75618c';
  P(sph(.4,10,8),A,[0,.3,0],[0,0,0],[1.3,.8,1]);[[-.3,.42,.1,.2],[.28,.44,-.08,.21],[0,.5,-.1,.22],[-.1,.36,.28,.17],[.2,.32,.26,.16],[-.42,.24,-.1,.17],[.44,.22,.05,.16]].forEach(([a,b,c,r],i)=>P(sph(r,7,5),i%2?B:A,[a,b,c]));
  P(sph(.17,9,7),F,[0,.17,.46],[0,0,0],[1,.86,1.1]);P(sph(.1,7,5),A,[0,.31,.4]);for(const s of [-1,1]){P(sph(.06,6,4),F,[s*.17,.2,.4],[0,0,s*.5],[1.5,.5,.8]);P(sph(.02,5,4),'#f6ead8',[s*.07,.2,.615],[0,0,0],[1.6,.5,.6]);}
  return out;}
/* 낡은 비행선(풍선형): 기운 자국이 있는 풍선 + 줄에 매달린 곤돌라 + 꼬리 날개 — 구름 바다 너머에 천천히 떠다님(그리기 1) */
export function makeAirship(){const g=new THREE.Group();g.name='venus-airship';const L=[],P=(geo,col,p,r,s)=>L.push([geo.applyMatrix4(M4(p||[0,0,0],r||[0,0,0],s||[1,1,1])),col]);
  P(sph(1,14,10),'#ecd3a8',[0,0,0],[0,0,0],[3.1,1.2,1.2]);P(new THREE.TorusGeometry(1.13,.07,5,16),'#c98f7a',[.9,0,0],[0,PI/2,0]);P(new THREE.TorusGeometry(1.13,.07,5,16),'#c98f7a',[-.9,0,0],[0,PI/2,0]);
  P(sph(1,8,6),'#9fb7c9',[1.7,.62,.5],[.5,0,-.3],[.5,.1,.42]);P(sph(1,8,6),'#d9a0a0',[-.4,.95,.52],[.5,0,0],[.46,.1,.4]);P(sph(1,8,6),'#b9c79a',[-1.8,.2,.86],[1.2,0,.2],[.4,.1,.36]);P(sph(1,8,6),'#9fb7c9',[.3,-.2,-1.12],[PI/2,0,0],[.5,.1,.4]);
  P(new THREE.ConeGeometry(.3,.6,8),'#c98f7a',[3.2,0,0],[0,0,-PI/2]);
  P(new THREE.BoxGeometry(1.1,1.5,.06),'#c98f7a',[-2.9,.55,0],[0,0,.5]);P(new THREE.BoxGeometry(1.1,1.2,.06),'#c98f7a',[-2.9,-.5,0],[0,0,-.5]);P(new THREE.BoxGeometry(1.1,.06,2.0),'#d9a98a',[-2.9,0,0]);
  P(new THREE.BoxGeometry(1.5,.5,.7),'#8a5a3c',[.1,-1.95,0]);P(new THREE.BoxGeometry(1.6,.08,.8),'#b58d6c',[.1,-1.68,0]);for(const [a,b] of [[-.55,-.3],[-.55,.3],[.75,-.3],[.75,.3]])P(new THREE.CylinderGeometry(.02,.02,.8,4),'#6a4a36',[a,-1.3,b]);
  P(new THREE.BoxGeometry(.06,.9,.12),'#6a4a36',[-.75,-1.95,0],[.6,0,0]);P(new THREE.BoxGeometry(.3,.2,.04),'#ffe9a8',[.3,-1.92,.36]);
  const me=lump(L,false,1.2);me.frustumCulled=false;g.add(me);return g;}
