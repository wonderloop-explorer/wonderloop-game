/* 무한 우주 쉼터 자리(토성 고리) — 임시 구역(2026-11-19). 금성 구름 끝에서 얼음 배를 타고 오면(venus.js sail → RIDE.pending.boat)
   토성 고리 위 작은 얼음 섬에 내려 주고 '다음 이야기 준비 중' 카드로 끝난다. 쉼터 본편은 기획서대로 따로 만든다(이 파일을 바꿔 끼움).
   땅: 반지름 약 8.5m 얼음 섬(위가 평평) + 둘레에 흩어진 얼음 조각(한 덩어리). 하늘: 우주 하늘 그림판(별·해).
   토성과 고리(2026-11-21 — 크기·모양 바로잡기): 우리는 고리 위에 서 있다 → 고리는 하늘의 둥근 띠가 아니라 발밑에서 토성 쪽으로 쭉 깔린 납작한 얼음 들판(토성 가운데를 중심으로 한 넓은 고리 판 — 동심원 줄무늬, 불투명에 가깝게),
   토성은 고리 면에 반쯤 잠긴 커다란 둥근 지붕처럼 서쪽 하늘의 절반 가까이를 덮는다(진짜 구 — 반지름 SR, 거리 SD: 올려다보는 각 약 25° — 원더룹 뒤 카메라에서 화면 위쪽까지 둥근 윤곽이 다 보임, 불투명).
   도착: 얼음 배가 3.1초에 걸쳐 내려와 섬 가장자리에 닿음(이동 테마 해결 화음 = 닿는 순간) → 거꾸리·원더룹이 차례로 내림 → 조작이 풀리고 안내 카드.
   그리기(구역 것): 섬·얼음 조각 1 · 고리 판 1 · 하늘 그림판(별·반짝이·해 등) · 토성 구·고리 · 거꾸리 3(+ 해시계 판 1) · 배 1 */
import * as THREE from 'three';
import {PI,QUALITY,rng} from '../../01-textures.js';
import * as G from '../../game/index.js';
import {markChar} from '../../game/bend.js';
import {RIDE,lockOn,lockOff,camHome} from './meteor-ride.js';
import {lump,M4,sph} from './martians.js';
import {makeGeokkuri,makeIceBoat} from './cloudfolk.js';
import {makeSkyBoard,makeOrb,canvasTex,saturnMap} from './skyboard.js';
import SPACE from '../../worlds/infinite-space.js';
const ZID='space-saturn',TMP={land:'[임시] 저 커다란 게 바로 토성이에요. 토성은 디딜 땅이 없는 가스 행성이라 고리의 얼음 위에 내렸어요.',card:'[임시] 고리 위 쉼터 이야기는 다음에 이어져요.',gg:'[임시] 쉼터는 아직 준비 중(거꾸리 한마디)'};
const HSEAT=.15,GSEAT=.14 /* 배 위에 서는 높이(금성 venus.js와 같은 값) */,DOCKB=[3.3,0],HERO=[.2,.5],GGAT=[.9,-1.4],BY=.42 /* 배 밑이 얼음 섬 위에 얹히는 높이(예전 -.15는 배가 섬 속으로 들어가 사라졌다) */,SR=250,SD=600,SC=[-SD,-.9,-70] /* 토성 구 가운데(고리 면 높이) */;
const ss=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x);},lerp=(a,b,t)=>a+(b-a)*t;
export function build({root}){const MOB=QUALITY.tier==='mobile',keep=[],R0=rng('space-saturn:ice'),RR=(a,b)=>a+R0()*(b-a),obstacles=[];
  G.profile.setup({world:SPACE.id,cards:SPACE.cards});
  const add=o=>{root.add(o);keep.push(o);return o;};
  const KEY={top:'#151331',horizon:'#2b2560',hemi:'#e6dcff',ground:'#7c6aa8',hemiI:.84,sun:'#fff1d6',sunI:.72,sunDir:[6,-4,3],fill:.32,fog:'#2b2560',fogNear:220,fogFar:900,stars:0,milky:1.1};
  const SK=G.sky.sky({parent:root,keys:[KEY,KEY,KEY],t:0,nStars:0,space:true});
  const board=makeSkyBoard(root,{mob:MOB,seed:'space-saturn:sky'});
  /* 토성: 고리 면에 반쯤 잠긴 커다란 구(불투명) — 그 앞으로 발밑에서부터 고리 판이 깔림 */
  const oSat=makeOrb(root,{map:canvasTex(512,saturnMap,256),rep:[9,5],ring:false,seg:MOB?[48,28]:[72,40]});oSat.g.position.set(...SC);oSat.g.scale.setScalar(SR);oSat.g.rotation.z=.06;oSat.g.name='saturn-planet';oSat.U.uL.value.set(.55,.6,.45).normalize();if(oSat.halo)oSat.halo.visible=false;oSat.g.traverse(o=>{o.frustumCulled=false;});oSat.body.material.transparent=true;oSat.body.renderOrder=-3; /* 하늘 그림판(별·성운 — 카메라 앞 90m의 반투명 판)보다 뒤에 그려야 그 판에 덮이지 않는다: 반투명 차례로 옮겨 그림판 다음에(불투명도는 1 그대로, 고리 판·얼음은 깊이로 앞을 가림) */keep.push(oSat.g);
  {/* 고리 판: 토성 가운데를 중심으로 한 넓은 고리(안쪽 SR×1.16 ~ 바깥 SD+190) — 반지름 방향 줄무늬(밝은 얼음 띠·어두운 틈)를 정점 색으로 */
    const R0=SR*1.16,R1=SD+190,NR=40,NA=MOB?120:180,pos=[],col=[],idx=[],c=new THREE.Color(),A=new THREE.Color('#e9dcc0'),B2=new THREE.Color('#cdbf9f'),Cc=new THREE.Color('#f6eedb'),Dk=new THREE.Color('#6f6890');
    for(let j=0;j<=NR;j++){const u=j/NR,r=R0+(R1-R0)*u,band=.5+.5*Math.sin(u*46+Math.sin(u*9)*2.2),gap=Math.max(ss(.455,.47,u)*ss(.5,.485,u),ss(.9,.91,u)*ss(.93,.92,u))*.85+ss(.06,0,u)*.5;c.copy(A).lerp(B2,band*.6).lerp(Cc,.45*Math.max(0,Math.sin(u*17+1)))  .lerp(Dk,gap);
      for(let i=0;i<=NA;i++){const a=i/NA*PI*2;pos.push(SC[0]+Math.cos(a)*r,-.92,SC[2]+Math.sin(a)*r);col.push(c.r,c.g,c.b);}}
    for(let j=0;j<NR;j++)for(let i=0;i<NA;i++){const a=j*(NA+1)+i,b=a+1,d=a+NA+1,e=d+1;idx.push(a,b,d,b,e,d);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));geo.setIndex(idx);
    const m=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide,fog:false});m.userData.noStorybook=true;const ring=new THREE.Mesh(geo,m);ring.name='saturn-ring';ring.frustumCulled=false;ring.userData.noMerge=true;add(ring);}
  /* 얼음 섬(위가 평평한 얼음 덩어리 — 각진 면) + 가장자리 얼음 뿔 + 고리의 얼음 조각 띠 */
  const L=[],ICE=['#dcecfb','#cfe4f8','#eaf4ff','#c2d9f2','#f4efdc'];
  {const g=new THREE.CylinderGeometry(8.6,6.4,2.2,11,1).toNonIndexed(),p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=1+Math.sin(x*1.7+z*2.3)*.05;p.setXYZ(i,x*k,y>0?0:y-1.1+Math.sin(x*.9)*.4,z*k);}g.computeVertexNormals();L.push([g,'#e6f1fc']);}
  for(let i=0;i<9;i++){const a=i/9*PI*2+RR(-.2,.2),r=8.0+RR(-.3,.3),h=RR(.9,2.4),x=Math.cos(a)*r,z=Math.sin(a)*r;if(Math.hypot(x-DOCKB[0]-4.5,z)<4.2)continue;L.push([new THREE.ConeGeometry(RR(.35,.7),h,5).applyMatrix4(M4([x,h/2-.1,z],[RR(-.2,.2),RR(0,3),RR(-.2,.2)])),ICE[i%4]]);obstacles.push({c:[x,z,.6]});}
  for(let i=0,n=MOB?70:110;i<n;i++){const x=RR(-120,120),z=RR(-95,95),r=RR(.35,2.3);if(Math.hypot(x,z)<11.5)continue;const g=new THREE.IcosahedronGeometry(r,0).applyMatrix4(M4([x,RR(-1.6,.4),z],[RR(0,3),RR(0,3),RR(0,3)],[1,RR(.5,.9),1]));L.push([g,ICE[i%5]]);}
  const island=lump(L.map(([q,c])=>[q.index?q.toNonIndexed():q,c]),true,1.2);island.geometry.computeVertexNormals();island.name='saturn-ice';island.frustumCulled=false;island.receiveShadow=true;add(island);
  const gg=makeGeokkuri(),boat=makeIceBoat();[gg.root,boat].forEach(o=>{add(o);markChar(o);});
  const pend=RIDE.pending&&RIDE.pending.boat?RIDE.pending:null;if(pend)RIDE.pending=null;
  const st={t:0,arr:pend?{t:0,ph:'down',cu:null,idle:9}:null,done:!pend,carded:false,T:{}},B={x:DOCKB[0],y:BY,z:DOCKB[1]};
  const U0=()=>G.view.camera&&G.mission.hero&&G.mission.hero(),mark=k=>{if(st.T[k]==null)st.T[k]=+G.clock.t.toFixed(2);};
  gg.root.position.set(GGAT[0],0,GGAT[1]);gg.root.rotation.y=-PI/2;boat.position.set(B.x,B.y,B.z);if(!pend)boat.visible=false;
  G.dialog.npc({id:'geokkuri',name:'거꾸리',root:gg.root,bubbleY:gg.head+.32,talkR:1.3,bubbleR:4.5,variants:[{when:()=>true,lines:[]},{when:()=>st.done,lines:[TMP.gg]}]});
  const hop=(from,to,sec,fn)=>{const t0=G.clock.t;return G.core.until(()=>{const u=Math.min(1,(G.clock.t-t0)/sec),e=u*u*(3-2*u);fn(lerp(from[0],to[0],e),lerp(from[1],to[1],e)+Math.sin(u*PI)*.8,lerp(from[2],to[2],e));return u>=1;},sec+1);};
  const card=()=>{if(st.carded)return;st.carded=true;mark('card');G.ui.notice({kicker:'토성 고리',title:'다음 이야기 준비 중',text:TMP.card,icon:SPACE.icons.map()});};
  /* 도착: 배가 내려와 닿음 → 둘이 내림 */
  const ur=G.travel.untilResolve(),D=ur!=null&&isFinite(ur)&&ur>0?Math.min(4.4,Math.max(2.2,ur)):3.1,FROM=[17,8.5,5];let ggMode='idle',started=false;
  async function land(W,U){mark('land');G.travel.mark('land');G.ui.toast(TMP.land,5.2);G.sound.sfx('land',{gain:.5});G.sound.sfx('event-pop',{gain:.6});
    await G.core.wait(.7);ggMode='walk';G.sound.sfx('jump',{gain:.6});{const r=gg.root.position;await hop([r.x,r.y,r.z],[GGAT[0],0,GGAT[1]],.7,(x,y,z)=>gg.root.position.set(x,y,z));}ggMode='idle';gg.root.rotation.y=Math.atan2(HERO[0]-GGAT[0],HERO[1]-GGAT[1]);
    U.action='서기';U.at=0;G.sound.sfx('jump');{const p=W.position;await hop([p.x,p.y,p.z],[HERO[0],0,HERO[1]],.8,(x,y,z)=>{W.position.set(x,y,z);U.riding.y=y;});}G.sound.sfx('land',{gain:.5});
    st.arr=null;lockOff(G,W);W.scale.set(1,1,1);W.rotation.y=-PI/2;G.travel.end();G.react.react('awe',{sound:null});mark('free');
    await G.core.wait(.6);st.boatGo={t:0};G.sound.sfx('event-sparkle',{gain:.5}); /* 둘이 다 내린 뒤에 배가 스르륵 떠올라 고리 너머로 작아지며 사라짐 */await G.core.wait(4.8);st.done=true;card();}
  function update(dt,t){const W=U0();if(!W)return;const U=W.userData,cam=G.view.camera;st.t+=dt;mark('start');
    board.tick(dt,t,cam);{const pt=cam.aspect<1;board.place(board.sunGlow,pt?-.5:-.7,pt?.86:.8,pt?1:.8);board.place(board.sun,pt?-.5:-.7,pt?.86:.8,pt?.5:.4);}
    boat.rotation.set(Math.sin(t*1.3)*.02,0,Math.sin(t*1.1)*.03);
    if(st.boatGo){const b=st.boatGo;b.t+=dt;const u=Math.min(1,b.t/2.6),e=u*u;boat.position.set(B.x+9*e,B.y+3.2*e+Math.sin(t*1.7)*.05,B.z+5*e);boat.scale.setScalar(Math.max(.001,1-ss(.35,1,u)));if(u>=1){boat.visible=false;st.boatGo=null;}}
    const a=st.arr;if(a){if(!started){started=true;lockOn(G,W);U.action='서기';U.at=0;if(U.setExpr)U.setExpr('반짝 신남');G.travel.note('phase','arrive');G.travel.landIn(D);const C=G.controls.input.cam;if(C){C.yaw=PI/2-.42;C.pitch=.03;C.dist=9;a.cu=C.user;}U.riding.snap=true;}
      if(a.ph==='down'){a.t+=dt;const u=Math.min(1,a.t/D),e=1-Math.pow(1-u,2.2);B.x=lerp(DOCKB[0]+FROM[0],DOCKB[0],e);B.y=lerp(FROM[1],BY,e)+Math.sin(t*1.7)*.05*(1-u);B.z=lerp(FROM[2],DOCKB[1],e);
        boat.position.set(B.x,B.y,B.z);W.position.set(B.x+.55,B.y+HSEAT,B.z-.34);U.riding.y=W.position.y;W.rotation.y=-PI/2;gg.root.position.set(B.x-.75,B.y+GSEAT,B.z+.34);gg.root.rotation.y=-PI/2;ggMode='idle'; /* 둘 다 서서 가는 쪽(토성 쪽)을 봄 — 거꾸리가 앞 */
        if(u>=1){a.ph='off';land(W,U);}}}
    else if(!st.done&&!started){st.done=true;}
    gg.tick(dt,t,ggMode);if(st.done&&!G.dialog.talking()){const P=W.position,ry=Math.atan2(P.x-gg.root.position.x,P.z-gg.root.position.z);gg.root.rotation.y+=Math.atan2(Math.sin(ry-gg.root.rotation.y),Math.cos(ry-gg.root.rotation.y))*Math.min(1,dt*6);}
    if(st.done&&!st.carded&&st.t>1.5&&!(G.front.frontShown&&G.front.frontShown()))card();}
  function lateUpdate(dt){const a=st.arr;if(a&&started)camHome(G,dt,PI/2-.42,.03,a.ph==='down'?9:9.5,a,1.6); /* 원더룹 뒤 옆에서 토성 쪽을(낮게 — 커다란 토성과 발밑 고리 들판이 한 화면에) */}
  return {name:'토성 고리',kind:'outdoor',start:{compass:true},world:null,
    spawn:{x:HERO[0],z:HERO[1],ry:-PI/2},
    areas:{field:{bounds:[-6.6,6.6,-6.6,6.6],obstacles,camera:{target:[0,1,0],dist:9,polar:[.45,1.35],azimuth:null,start:[2.6,.95],minDist:3,maxDist:30}}},
    sun:{dir:new THREE.Vector3(...KEY.sunDir).normalize(),shadow:14,follow:true},
    sky:SK,far:2400,ambience:'space',rim:.2,groundY:()=>0,ground:[island],keepOut:keep,
    state:()=>({arr:st.arr?st.arr.ph:null,done:st.done,carded:st.carded,T:{...st.T},t:+G.clock.t.toFixed(2)}),spots:{hero:HERO,gg:GGAT,dock:DOCKB},
    update,lateUpdate,dispose(){board.dispose&&board.dispose();const W=U0();if(W){W.scale.set(1,1,1);if(st.arr){try{lockOff(G,W);}catch(e){}}}}};}
