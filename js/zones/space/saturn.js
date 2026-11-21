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
const HSEAT=.15,GSEAT=.14 /* 배 위에 서는 높이(금성 venus.js와 같은 값) */,DOCKB=[-3.3,0] /* 배가 닿는 자리: 섬의 토성 쪽 — 둘이 카메라(동쪽) 쪽으로 걸어 내림 */,BSIDE=.42,HX=.45,GX=.55,HERO=[.4,.5],GGAT=[1.1,-1.5],BY=.42 /* 배 밑이 얼음 섬 위에 얹히는 높이(예전 -.15는 배가 섬 속으로 들어가 사라졌다) */,SR=250,SD=600,SC=[-SD,-.9,-70] /* 토성 구 가운데(고리 면 높이) */;
const ss=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x);},lerp=(a,b,t)=>a+(b-a)*t;
export function build({root}){const st0={};const MOB=QUALITY.tier==='mobile',keep=[],R0=rng('space-saturn:ice'),RR=(a,b)=>a+R0()*(b-a),obstacles=[];
  G.profile.setup({world:SPACE.id,cards:SPACE.cards});
  const add=o=>{root.add(o);keep.push(o);return o;};
  const KEY={top:'#151331',horizon:'#2b2560',hemi:'#e6dcff',ground:'#7c6aa8',hemiI:.84,sun:'#fff1d6',sunI:.72,sunDir:[6,-4,3],fill:.32,fog:'#2b2560',fogNear:220,fogFar:900,stars:0,milky:1.1};
  const SK=G.sky.sky({parent:root,keys:[KEY,KEY,KEY],t:0,nStars:0,space:true});
  const board=makeSkyBoard(root,{mob:MOB,seed:'space-saturn:sky'});
  /* 토성: 고리 면에 반쯤 잠긴 커다란 구(불투명) — 그 앞으로 발밑에서부터 고리 판이 깔림 */
  const oSat=makeOrb(root,{map:canvasTex(512,saturnMap,256),rep:[9,5],ring:false,seg:MOB?[48,28]:[72,40]});oSat.g.position.set(...SC);oSat.g.scale.setScalar(SR);oSat.g.rotation.z=.06;oSat.g.name='saturn-planet';oSat.U.uL.value.set(.55,.6,.45).normalize();if(oSat.halo)oSat.halo.visible=false;oSat.g.traverse(o=>{o.frustumCulled=false;});oSat.body.material.transparent=true;oSat.body.renderOrder=-3; /* 하늘 그림판(별·성운 — 카메라 앞 90m의 반투명 판)보다 뒤에 그려야 그 판에 덮이지 않는다: 반투명 차례로 옮겨 그림판 다음에(불투명도는 1 그대로, 고리 판·얼음은 깊이로 앞을 가림) */keep.push(oSat.g);
  {/* 고리 = 얼음 들판(2026-11-21 다시 — 예전 불투명한 베이지 고리 판은 지평선까지 한 색으로 칠해져 벽처럼 서 보였다. 실제 고리는 두께 수십 m ~ 1km로 아주 얇고, 그 안에서 보면 흩어진 얼음 조각들이다):
       발밑 높이의 납작한 판 한 장을 화소마다 계산 — 가까운 곳은 드문드문 흩어진 얼음 조각(칸마다 무작위 — 사이로 우주가 비침), 멀어질수록 옅어지며 지평선으로 이어지고,
       토성을 중심으로 한 동심원 띠(밝은 얼음 띠·어두운 틈)가 멀리 토성 쪽에 가는 빛 띠 몇 줄로 보인다. 반투명(깊이 안 씀) — 섬·얼음 조각·토성 구가 깊이로 가림. 그리기 1 */
    const geo=new THREE.PlaneGeometry(1500,1500,1,1);geo.rotateX(-PI/2);
    const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:false,side:THREE.DoubleSide,uniforms:{uSC:{value:new THREE.Vector2(SC[0],SC[2])},uR0:{value:SR*1.02},uIce:{value:new THREE.Color('#dfeafb')},uWarm:{value:new THREE.Color('#f7eeda')},uT:{value:0}},
      vertexShader:'varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
      fragmentShader:`precision highp float;varying vec3 vW;uniform vec2 uSC;uniform float uR0,uT;uniform vec3 uIce,uWarm;
        float h2(vec2 p){p=fract(p*vec2(.1031,.1030));p+=dot(p,p.yx+33.33);return fract((p.x+p.y)*p.y);}
        float chunks(vec2 p,float cell,float fill){vec2 c=floor(p/cell),f=fract(p/cell)-.5;float h=h2(c),k=h2(c+7.3);vec2 o=(vec2(h2(c+1.7),h2(c+4.1))-.5)*.5;float r=.16+.26*k;return step(1.-fill,h)*smoothstep(r,r*.55,length((f-o)*vec2(1.,.8+.6*k)));}
        float band(float r,float c,float w){return smoothstep(w,0.,abs(r-c));}
        void main(){vec2 p=vW.xz;float d=length(p),rs=length(p-uSC);
          float near=chunks(p,1.5,.34)*smoothstep(70.,14.,d)+chunks(p+31.,3.1,.36)*smoothstep(190.,40.,d)*smoothstep(8.,30.,d)*.8;
          float haze=mix(.06,.2,smoothstep(10.,120.,d))*smoothstep(520.,260.,d);
          float b=band(rs,318.,14.)+.8*band(rs,372.,9.)+band(rs,455.,20.)*.9+.6*band(rs,520.,8.);
          float gap=band(rs,410.,12.);
          float far=b*smoothstep(60.,170.,d)*.62;
          float a=clamp(near*.82+haze*(1.-gap*.8)+far,0.,.92);
          a*=smoothstep(uR0,uR0+26.,rs)*smoothstep(720.,560.,d);
          vec3 col=mix(uIce,uWarm,clamp(far*1.4+.25*h2(floor(p/1.5)),0.,1.));col*=.86+.14*near+.1*sin(uT*.7+h2(floor(p/1.5))*40.)*near;
          if(a<.004)discard;gl_FragColor=vec4(col,a);
          #include <colorspace_fragment>
        }`});
    m.userData.noBend=true;m.userData.noStorybook=true;const ring=new THREE.Mesh(geo,m);ring.position.y=-.92;ring.name='saturn-ring';ring.frustumCulled=false;ring.renderOrder=-2;ring.userData.noMerge=true;add(ring);st0.ring=m;}
  /* 얼음 섬(위가 평평한 얼음 덩어리 — 각진 면) + 가장자리 얼음 뿔 + 고리의 얼음 조각 띠 */
  const L=[],ICE=['#dcecfb','#cfe4f8','#eaf4ff','#c2d9f2','#f4efdc'];
  {const g=new THREE.CylinderGeometry(8.6,6.4,2.2,11,1).toNonIndexed(),p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=1+Math.sin(x*1.7+z*2.3)*.05;p.setXYZ(i,x*k,y>0?0:y-1.1+Math.sin(x*.9)*.4,z*k);}g.computeVertexNormals();L.push([g,'#e6f1fc']);}
  for(let i=0;i<9;i++){const a=i/9*PI*2+RR(-.2,.2),r=8.0+RR(-.3,.3),h=RR(.9,2.4),x=Math.cos(a)*r,z=Math.sin(a)*r;if(Math.hypot(x-7.8,z)<4.6||Math.hypot(x+7.8,z)<3.6)continue; /* 카메라 쪽(동쪽)과 배가 내려오는 쪽은 비움 */L.push([new THREE.ConeGeometry(RR(.35,.7),h,5).applyMatrix4(M4([x,h/2-.1,z],[RR(-.2,.2),RR(0,3),RR(-.2,.2)])),ICE[i%4]]);obstacles.push({c:[x,z,.6]});}
  /* 가까운 얼음 들판: 고리 면 높이에 납작하게 깔린 작은 얼음 조각(섬 둘레 12~75m — 섬과 한 덩어리) */
  for(let i=0,n=MOB?80:130;i<n;i++){const a=RR(0,PI*2),d=12+63*Math.pow(R0(),1.5),r=RR(.18,.75);L.push([new THREE.IcosahedronGeometry(r,0).applyMatrix4(M4([Math.cos(a)*d,-.95+RR(-.12,.2),Math.sin(a)*d],[RR(0,3),RR(0,3),RR(0,3)],[1,RR(.3,.6),1])),ICE[i%5]]);}
  for(let i=0,n=MOB?70:110;i<n;i++){const x=RR(-120,120),z=RR(-95,95),r=RR(.35,2.3);if(Math.hypot(x,z)<11.5)continue;const g=new THREE.IcosahedronGeometry(r,0).applyMatrix4(M4([x,RR(-1.6,.4),z],[RR(0,3),RR(0,3),RR(0,3)],[1,RR(.5,.9),1]));L.push([g,ICE[i%5]]);}
  const island=lump(L.map(([q,c])=>[q.index?q.toNonIndexed():q,c]),true,1.2);island.geometry.computeVertexNormals();island.name='saturn-ice';island.frustumCulled=false;island.receiveShadow=true;add(island);
  const gg=makeGeokkuri(),boat=makeIceBoat();[gg.root,boat].forEach(o=>{add(o);markChar(o);});
  const pend=RIDE.pending&&RIDE.pending.boat?RIDE.pending:null;if(pend)RIDE.pending=null;
  const st={t:0,arr:pend?{t:0,ph:'down',cu:null,idle:9}:null,done:!pend,carded:false,T:{}},B={x:DOCKB[0],y:BY,z:DOCKB[1]};
  const U0=()=>G.view.camera&&G.mission.hero&&G.mission.hero(),mark=k=>{if(st.T[k]==null)st.T[k]=+G.clock.t.toFixed(2);};
  gg.root.position.set(GGAT[0],0,GGAT[1]);gg.root.rotation.y=PI/2;boat.position.set(B.x,B.y,B.z);if(!pend)boat.visible=false;
  G.dialog.npc({id:'geokkuri',name:'거꾸리',root:gg.root,bubbleY:gg.head+.32,talkR:1.3,bubbleR:4.5,variants:[{when:()=>true,lines:[]},{when:()=>st.done,lines:[TMP.gg]}]});
  const hop=(from,to,sec,fn)=>{const t0=G.clock.t;return G.core.until(()=>{const u=Math.min(1,(G.clock.t-t0)/sec),e=u*u*(3-2*u);fn(lerp(from[0],to[0],e),lerp(from[1],to[1],e)+Math.sin(u*PI)*.8,lerp(from[2],to[2],e));return u>=1;},sec+1);};
  const card=()=>{if(st.carded)return;st.carded=true;mark('card');G.ui.notice({kicker:'토성 고리',title:'다음 이야기 준비 중',text:TMP.card,icon:SPACE.icons.map()});};
  /* 도착: 배가 내려와 닿음 → 둘이 내림 */
  const ur=G.travel.untilResolve(),D=ur!=null&&isFinite(ur)&&ur>0?Math.min(4.4,Math.max(2.2,ur)):3.1,FROM=[-8,8.5,4]; /* 토성 쪽 하늘에서 내려옴 */let ggMode='idle',started=false;
  async function land(W,U){mark('land');G.travel.mark('land');G.ui.toast(TMP.land,5.2);G.sound.sfx('land',{gain:.5});G.sound.sfx('event-pop',{gain:.6});
    await G.core.wait(.7);ggMode='walk';G.sound.sfx('jump',{gain:.6});{const r=gg.root.position;await hop([r.x,r.y,r.z],[GGAT[0],0,GGAT[1]],.7,(x,y,z)=>gg.root.position.set(x,y,z));}ggMode='idle';gg.root.rotation.y=PI/2;
    U.action='서기';U.at=0;G.sound.sfx('jump');{const p=W.position;await hop([p.x,p.y,p.z],[HERO[0],0,HERO[1]],.8,(x,y,z)=>{W.position.set(x,y,z);U.riding.y=y;});}G.sound.sfx('land',{gain:.5});
    st.arr=null;lockOff(G,W);W.scale.set(1,1,1);G.travel.end();mark('free');await G.core.wait(.5);st.turn={t:0}; /* 카메라 쪽을 보며 내린 뒤, 돌아서서 커다란 토성을 올려다봄 */G.react.react('awe',{sound:null});
    await G.core.wait(.6);st.boatGo={t:0};G.sound.sfx('event-sparkle',{gain:.5}); /* 둘이 다 내린 뒤에 배가 스르륵 떠올라 고리 너머로 작아지며 사라짐 */await G.core.wait(4.8);st.done=true;card();}
  function update(dt,t){const W=U0();if(!W)return;const U=W.userData,cam=G.view.camera;st.t+=dt;mark('start');
    board.tick(dt,t,cam);{const pt=cam.aspect<1;board.place(board.sunGlow,pt?-.5:-.7,pt?.86:.8,pt?1:.8);board.place(board.sun,pt?-.5:-.7,pt?.86:.8,pt?.5:.4);}
    boat.rotation.set(Math.sin(t*1.3)*.02,0,Math.sin(t*1.1)*.03);if(st0.ring)st0.ring.uniforms.uT.value=t;
    if(st.turn){const q=st.turn;q.t+=dt;if(q.t>.9||(U.drive&&(U.drive.x||U.drive.z)))st.turn=null;else W.rotation.y+=Math.atan2(Math.sin(-PI/2-W.rotation.y),Math.cos(-PI/2-W.rotation.y))*Math.min(1,dt*6);}
    if(st.boatGo){const b=st.boatGo;b.t+=dt;const u=Math.min(1,b.t/2.6),e=u*u;boat.position.set(B.x-9*e,B.y+3.2*e+Math.sin(t*1.7)*.05,B.z+5*e);boat.scale.setScalar(Math.max(.001,1-ss(.35,1,u)));if(u>=1){boat.visible=false;st.boatGo=null;}}
    const a=st.arr;if(a){if(!started){started=true;lockOn(G,W);U.action='서기';U.at=0;if(U.setExpr)U.setExpr('반짝 신남');G.travel.note('phase','arrive');G.travel.landIn(D);const C=G.controls.input.cam;if(C){C.yaw=PI/2-.42;C.pitch=.03;C.dist=9;a.cu=C.user;}U.riding.snap=true;}
      if(a.ph==='down'){a.t+=dt;const u=Math.min(1,a.t/D),e=1-Math.pow(1-u,2.2);B.x=lerp(DOCKB[0]+FROM[0],DOCKB[0],e);B.y=lerp(FROM[1],BY,e)+Math.sin(t*1.7)*.05*(1-u);B.z=lerp(FROM[2],DOCKB[1],e);
        boat.position.set(B.x,B.y,B.z);W.position.set(B.x+HX,B.y+HSEAT,B.z-BSIDE);U.riding.lookOff=[-(HX+GX)/2,BSIDE];U.riding.y=W.position.y;W.rotation.y=PI/2;gg.root.position.set(B.x-GX,B.y+GSEAT,B.z+BSIDE);gg.root.rotation.y=PI/2;ggMode='idle'; /* 금성에서 탄 그대로: 둘 다 뒤(동쪽 = 카메라 쪽)를 보고 섬 — 원더룹이 앞, 거꾸리가 그 뒤. 얼굴이 보이는 채로 내려와 카메라 쪽으로 걸어 내림 */
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
