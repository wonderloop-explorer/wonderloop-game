/* 무한 우주 ② 화성 — 모델·연출 부품 (2026-11-09, STAGE 2 '붉은 모래 언덕')
   ── 화성 친구(makeMartian) ── 기획서 주민 키 비교 그림(wonderloop-studio/infinite-space/character-lineup-v2)대로:
     원더룹의 외계인 탈처럼 큰 동그란 머리 + 바깥 끝이 살짝 올라간 검은 아몬드 눈(눈 안 작은 흰 별빛) + 가늘고 마른 몸·팔다리 + 동그란 손.
     삐삐 키 0.7(약 0.97m, 밝은 살구 #E8946A, 작은 'o' 입), 둥둥 키 1.3(약 1.79m, 진한 녹슨 주황 #C2633F, 길쭉한 몸, 눈꺼풀이 살짝 내려온 느긋한 눈, 웃는 입).
     로우폴리 + 크레용 결(storybook sbMat), 정점 색 덩어리 셋(머리·몸 · 왼팔 · 오른팔 — 그리기 3번). 팔은 어깨를 축으로 돈다(부르기·손 흔들기).
     원더룹 키 1.38m = 1 기준. 대기 동작: 고개 살랑·몸 들썩, 걸을 때 통통(다리는 몸과 한 덩어리 — 동화책 인형처럼 몸 전체가 콩콩).
   ── 먼지 회오리(makeWhirl) ── 아래가 좁고 위가 넓은 꼬인 깔때기 두 겹(한 덩어리, 반투명 결이 위로 돌며 흐름 — 셰이더, 둥근 땅 휘어짐 포함) — 그리기 1번.
     setBase(x,y,z)·setHeight(h)로 밑동 자리와 키를 바꿈(협곡 위를 건널 때는 협곡 바닥부터 원더룹 발밑까지 길게).
   ── 카세트(makeCassette) ── 원더룹이 늘 배낭에 넣고 다니는 녹음되는 카세트(시리즈 상징 소지품): 크림 몸통 + 화성 주황 띠 + 창 안 릴 둘(돌아감) + 빨간 녹음 불.
     오른손 held 뼈에 쥠(원점 = 쥐는 자리), userData.carry로 팔을 앞으로 내밀어 듦(07). rec(on)·run(on)으로 불·릴.
   ── 파란 노을 유리 조각(makeGlass) ── 노을빛 하늘색(#7FB6E8) 반투명 결정 조각.
   ── 뒤죽박죽 말풍선(jumbleBubble) ── 협곡 건너 부르는 소리가 엇갈려 도착할 때: 머리 위 HTML 말풍선의 글자가 계속 섞이고 흔들림(안내 표시 — ui.hint). */
import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {sbMat} from '../../game/storybook.js';
import {bentY} from '../../game/bend.js';
const PI=Math.PI;
const ss=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x);};
/* 정점 색 덩어리: [geometry(이미 자리 잡은 것), 색] 목록 → 메시 하나 */
function lump(list,cast=true,uvK=1){const gs=list.map(([geo,c])=>{let g=geo.index?geo.toNonIndexed():geo;for(const k of Object.keys(g.attributes))if(!['position','normal','uv'].includes(k))g.deleteAttribute(k);
  const n=g.attributes.position.count,cc=new Float32Array(n*3),C=new THREE.Color(c);for(let i=0;i<n;i++){cc[i*3]=C.r;cc[i*3+1]=C.g;cc[i*3+2]=C.b;}g.setAttribute('color',new THREE.BufferAttribute(cc,3));return g;});
  const m=sbMat('#ffffff');m.vertexColors=true;const mg=mergeGeometries(gs);{const u=mg.attributes.uv;if(u)for(let i=0;i<u.count;i++)u.setXY(i,u.getX(i)*uvK,u.getY(i)*uvK);} /* uvK: 색연필 결을 촘촘히(작은 몸에서도 결이 보이게) */
  const me=new THREE.Mesh(mg,m);me.castShadow=cast;me.receiveShadow=true;return me;}
const M4=(pos=[0,0,0],rot=[0,0,0],s=[1,1,1])=>new THREE.Matrix4().compose(new THREE.Vector3(...pos),new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)),new THREE.Vector3(...s));
const sph=(r,w=12,h=9)=>new THREE.SphereGeometry(r,w,h);
/* 공 겉면 한 점(머리 가운데 기준, 위아래 각 el·좌우 각 az)에 붙는 무늬: 모양을 겉면 방향으로 세우고 roll만큼 돌림 */
function onHead(geo,R,c,el,az,roll,out=0,sc=[1,1,1]){const n=new THREE.Vector3(Math.sin(az)*Math.cos(el),Math.sin(el),Math.cos(az)*Math.cos(el));
  const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),n).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),roll));
  const m=new THREE.Matrix4().compose(n.clone().multiplyScalar(R+out).add(new THREE.Vector3(...c)),q,new THREE.Vector3(...sc));return geo.applyMatrix4(m);}
/* 화성 친구 하나 */
export function makeMartian({skin,height,headR,torso,legs,armLen,lids=false,mouth='o',name='martian'}){
  const root=new THREE.Group();root.name=name;const body=new THREE.Group();root.add(body);
  const dark='#2a2230',skinD=new THREE.Color(skin).multiplyScalar(.82).getStyle(),cheek='#f0a08e';
  const hc=[0,height-headR*.98,0],R=headR;
  const L=[];
  /* 머리: 아래가 살짝 갸름한 공(외계인 탈처럼) */
  L.push([sph(R,16,12).applyMatrix4(M4(hc,[0,0,0],[1,.97,.96])),skin]);
  /* 아몬드 눈: 납작한 타원 공을 겉면에 세워 바깥 끝이 올라가게(roll), 눈 안 흰 별빛 */
  for(const s of [-1,1]){const el=.08,az=s*.43,roll=s*.42;
    L.push([onHead(sph(1,14,8),R,hc,el,az,roll,-.006,[R*.34,R*.155,R*.05]),dark]);
    L.push([onHead(sph(1,8,6),R,hc,el+.06,az-s*.08,0,.03,[R*.055,R*.055,R*.03]),'#ffffff']);
    L.push([onHead(sph(1,6,5),R,hc,el-.05,az+s*.07,0,.03,[R*.022,R*.022,R*.02]),'#ffffff']);
    if(lids)L.push([onHead(sph(1,14,8),R,hc,el+.085,az,roll,.004,[R*.37,R*.12,R*.06]),skinD]); /* 둥둥: 눈꺼풀이 위 절반을 덮어 느긋한 눈 */
    L.push([onHead(sph(1,8,6),R,hc,-.2,s*.6,0,0,[R*.1,R*.06,R*.03]),cheek]);}
  if(mouth==='o')L.push([onHead(sph(1,8,6),R,hc,-.3,0,0,0,[R*.06,R*.085,R*.03]),'#7a2f2a']);
  else L.push([onHead(new THREE.TorusGeometry(1,.16,5,12,PI),R,hc,-.27,0,PI,0,[R*.13,R*.09,R*.06]),'#6a2a24']); /* 둥둥: 웃는 입(아래로 둥근 반 고리) */
  /* 목·몸통(가늘고 마른 — 위가 조금 넓은 원통)·다리(가는 둘) */
  const tTop=hc[1]-R*.82,tBot=legs;
  /* 2026-11-10: 가는 막대 몸이라 막대 사탕처럼 보였다 → 몸통은 아래가 살짝 도톰한 달걀꼴 기둥, 다리·팔도 도톰하게, 손발 끝은 동그랗게(생김새·키는 그대로) */
  L.push([new THREE.CylinderGeometry(torso*.6,torso*.7,R*.4,10).applyMatrix4(M4([0,tTop+R*.12,0])),skin]);
  L.push([new THREE.CylinderGeometry(torso*.82,torso*1.08,tTop-tBot,12).applyMatrix4(M4([0,(tTop+tBot)/2,0])),skin]);
  L.push([sph(torso*.84,12,8).applyMatrix4(M4([0,tTop,0],[0,0,0],[1,.7,1])),skin]);
  L.push([sph(torso*1.1,12,8).applyMatrix4(M4([0,tBot+torso*.15,0],[0,0,0],[1,.8,1])),skin]);
  for(const s of [-1,1]){L.push([new THREE.CylinderGeometry(torso*.42,torso*.38,legs,8).applyMatrix4(M4([s*torso*.52,legs/2+torso*.1,0],[0,0,s*.08])),skinD]);
    L.push([sph(torso*.52,10,7).applyMatrix4(M4([s*torso*.6,torso*.3,torso*.2],[0,0,0],[1,.62,1.35])),skinD]);}
  const bodyMesh=lump(L,true,3);bodyMesh.name=name+'-body';body.add(bodyMesh);
  /* 팔: 어깨를 축으로(아래로 늘어진 가는 원통 + 동그란 손) */
  const arms=[-1,1].map(s=>{const g=new THREE.Group();g.position.set(s*torso*1.02,tTop-.02,0);body.add(g);
    const me=lump([[new THREE.CylinderGeometry(torso*.36,torso*.33,armLen,8).applyMatrix4(M4([0,-armLen/2,0])),skin],[sph(torso*.36,8,6),skin],[sph(torso*.56,10,7).applyMatrix4(M4([0,-armLen,0])),skin]],true,3);g.add(me);
    g.rotation.z=s*.32;g.userData.s=s;return g;});
  const st={mode:'idle',t:Math.random()*5,walk:0,head:0};
  /* mode: idle 서서 살랑 · walk 걷기(콩콩) · call 두 손을 입가로 모아 부르기 · wave 한 손 흔들기 · talk 고개 끄덕 · spin 회오리에 실려 빙글 · sit 나란히 앉아 노을 보기 */
  function tick(dt,t,mode){st.t+=dt;const m=mode||st.mode,T=st.t;let ax=[0,0],az=[.32,.32],bob=0,tilt=0,nod=0;
    if(m==='walk'){st.walk+=dt*9;bob=Math.abs(Math.sin(st.walk))*.07;tilt=Math.sin(st.walk)*.08;ax=[Math.sin(st.walk)*.5,-Math.sin(st.walk)*.5];}
    else if(m==='call'){const k=.5+.5*Math.sin(T*6);ax=[-1.9,-1.9];az=[-.55,-.55];nod=-.12-.06*k;bob=.02*k;}
    else if(m==='wave'){ax=[0,-2.6+Math.sin(T*8)*.35];az=[.32,.5+Math.sin(T*8)*.25];bob=Math.abs(Math.sin(T*4))*.03;}
    else if(m==='talk'){nod=Math.sin(T*7)*.06;ax=[Math.sin(T*3)*.25,-.4+Math.sin(T*3.4)*.25];}
    else if(m==='spin'){az=[1.3,1.3];bob=Math.sin(T*5)*.05;}
    else if(m==='hop'){bob=Math.abs(Math.sin(T*6))*.16;ax=[-2.4,-2.4];az=[.4,.4];}
    else {bob=Math.sin(T*1.6)*.012;tilt=Math.sin(T*.7)*.04;nod=Math.sin(T*.9)*.03;}
    body.position.y+=(bob-body.position.y)*Math.min(1,dt*14);body.rotation.z+=(tilt-body.rotation.z)*Math.min(1,dt*8);
    arms.forEach((a,i)=>{const s=a.userData.s;a.rotation.x+=(ax[i]-a.rotation.x)*Math.min(1,dt*9);a.rotation.z+=(s*az[i]-a.rotation.z)*Math.min(1,dt*9);});
    bodyMesh.rotation.x+=(nod-bodyMesh.rotation.x)*Math.min(1,dt*8);}
  return {root,body,arms,st,tick,height,headY:hc[1],
    set mode(v){st.mode=v;},get mode(){return st.mode;},
    dispose(){root.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});}};}
export const makePipi=()=>makeMartian({name:'pipi',skin:'#E8946A',height:.966,headR:.25,torso:.105,legs:.17,armLen:.27,mouth:'o'});
export const makeDungdung=()=>makeMartian({name:'dungdung',skin:'#C2633F',height:1.79,headR:.34,torso:.14,legs:.24,armLen:.66,lids:true,mouth:'smile'});
/* ── 먼지 회오리 ── */
export function makeWhirl(root,{radius=1.9,height=6,seed=0,big=false}={}){
  const RS=20,HS=14,pos=[],uv=[],idx=[];
  for(const layer of [0,1]){const o=pos.length/3,rk=layer?.62:1;
    for(let j=0;j<=HS;j++){const v=j/HS;for(let i=0;i<=RS;i++){const u=i/RS,a=u*PI*2+v*2.2*(layer?-1:1),r=(.18+radius*Math.pow(v,1.35))*rk;pos.push(Math.cos(a)*r,v,Math.sin(a)*r);uv.push(u,v);}}
    for(let j=0;j<HS;j++)for(let i=0;i<RS;i++){const a=o+j*(RS+1)+i,b=a+1,c=a+RS+1,d=c+1;idx.push(a,c,b,b,c,d);}}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);
  const U={uT:{value:0},uH:{value:height},uA:{value:big?1:.92},uSeed:{value:seed}};
  const mat=new THREE.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,side:THREE.DoubleSide,
    vertexShader:'#include <common>\nuniform float uH;varying vec2 vU;void main(){vU=uv;vec3 p=position;p.y*=uH;vec4 w=modelMatrix*vec4(p,1.);gl_Position=projectionMatrix*(wlBend.x>0.?viewMatrix*wlBent(w):viewMatrix*w);}',
    /* 크레용 결처럼 비스듬한 먼지 자락이 위로 돌며 흐름(살구·크림·테라코타), 위·아래 끝은 옅게 */
    /* 2026-11-10: 크림빛 반투명 자락이 하얀 연기 줄기처럼 보였다 → 모래색(살구·테라코타·짙은 흙빛)의 또렷한 먼지 띠가 비스듬히 감기며 빠르게 돌고, 띠 사이는 비침. 밝은 크림은 띠 가장자리에만 조금 */
    fragmentShader:'uniform float uT;uniform float uA;uniform float uSeed;varying vec2 vU;float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}'+
      'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}'+
      'void main(){float v=vU.y;float sw=vU.x*5.+v*2.6-uT*.55+uSeed;vec2 q=vec2(sw*1.6,v*7.-uT*1.3);float s=n(q)*.55+n(q*2.7+5.)*.3+n(q*6.+11.)*.15;'+
      'float band=smoothstep(.3,.5,s)*(.7+.3*smoothstep(.2,.8,fract(sw*.5+s*.6)));float edge=smoothstep(0.,.1,v)*(1.-smoothstep(.7,1.,v));float al=band*edge*uA;'+
      'vec3 c=mix(vec3(.66,.40,.29),vec3(.87,.63,.46),smoothstep(.35,.8,s));c=mix(c,vec3(.95,.80,.64),smoothstep(.72,.95,s)*.55);c*=.9+.2*n(vec2(vU.x*40.,v*60.-uT*3.));c=pow(c,vec3(2.2));gl_FragColor=vec4(c,al);\n#include <colorspace_fragment>\n}'});
  mat.userData.noStorybook=true;
  const me=new THREE.Mesh(geo,mat);me.frustumCulled=false;me.userData.noMerge=true;me.renderOrder=3;root.add(me);
  /* 날리는 알갱이: 깔때기 겉을 따라 나선으로 올라가며 도는 모래 알갱이(점 묶음 — 자리는 셰이더가 시간으로 계산, 그리기 1) */
  const NG=big?90:54,sd=new Float32Array(NG*3),pp=new Float32Array(NG*3);for(let i=0;i<NG;i++){sd[i*3]=Math.random();sd[i*3+1]=Math.random();sd[i*3+2]=Math.random();}
  const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.BufferAttribute(pp,3));gg.setAttribute('seed',new THREE.BufferAttribute(sd,3));
  const gm=new THREE.ShaderMaterial({uniforms:{uT:U.uT,uH:U.uH,uR:{value:radius},uS:{value:big?26:20}},transparent:true,depthWrite:false,
    vertexShader:'#include <common>\nattribute vec3 seed;uniform float uT;uniform float uH;uniform float uR;uniform float uS;varying float vA;varying float vK;void main(){float v=fract(seed.x+uT*(.16+.14*seed.y));float a=seed.z*6.2832+uT*(3.2-1.6*v)+v*5.;'+
      'float r=(.25+uR*pow(v,1.35))*(.85+.4*seed.y);vec4 w=modelMatrix*vec4(0.,0.,0.,1.);w.xyz+=vec3(cos(a)*r,v*uH,sin(a)*r);vA=smoothstep(0.,.08,v)*(1.-smoothstep(.75,1.,v));vK=seed.y;'+
      'vec4 mv=wlBend.x>0.?viewMatrix*wlBent(w):viewMatrix*w;gl_Position=projectionMatrix*mv;gl_PointSize=uS*(.6+.9*seed.z)*projectionMatrix[1][1]/max(.1,-mv.z);}',
    fragmentShader:'varying float vA;varying float vK;void main(){vec2 d=gl_PointCoord-.5;float k=1.-smoothstep(.2,.5,length(d));vec3 c=pow(mix(vec3(.72,.46,.33),vec3(.95,.78,.6),vK),vec3(2.2));gl_FragColor=vec4(c,k*vA*.9);\n#include <colorspace_fragment>\n}'});
  gm.userData.noStorybook=true;const grains=new THREE.Points(gg,gm);grains.frustumCulled=false;grains.userData.noMerge=true;grains.renderOrder=4;me.add(grains);
  let H=height;
  return {me,mat,
    setBase(x,y,z){me.position.set(x,y,z);},setHeight(h){H=h;U.uH.value=h;},get height(){return H;},
    tick(dt){U.uT.value+=dt;me.rotation.y-=dt*(big?2.6:3.6);grains.rotation.y=-me.rotation.y;},
    show(v){me.visible=v;},dispose(){geo.dispose();mat.dispose();gg.dispose();gm.dispose();me.removeFromParent();}};}
/* ── 카세트 ── */
export function makeCassette(){const g=new THREE.Group();g.name='cassette';const b=new THREE.Group();g.add(b);b.position.set(0,.03,.07);b.rotation.x=-.35;
  const W=.17,H=.11,D=.05;
  const body=lump([[new THREE.BoxGeometry(W,H,D),'#f3e4c4'],[new THREE.BoxGeometry(W*1.002,H*.22,D*1.02).applyMatrix4(M4([0,-H*.3,0])),'#D9704A'],
    [new THREE.BoxGeometry(W*.62,H*.36,.006).applyMatrix4(M4([0,H*.12,D/2+.002])),'#3b2c35'],[new THREE.BoxGeometry(W*.16,H*.12,.02).applyMatrix4(M4([-W*.3,H/2+.006,0])),'#7a4e32'],
    [new THREE.BoxGeometry(W*.12,H*.12,.02).applyMatrix4(M4([-W*.1,H/2+.006,0])),'#7a4e32'],[new THREE.CylinderGeometry(.012,.012,.012,8).applyMatrix4(M4([W*.36,H*.34,D/2],[PI/2,0,0])),'#5a3826']],false);
  b.add(body);
  const reels=[-1,1].map(s=>{const r=lump([[new THREE.CylinderGeometry(.018,.018,.004,10),'#fff6e6'],[new THREE.BoxGeometry(.03,.006,.005),'#5a3826'],[new THREE.BoxGeometry(.006,.03,.005),'#5a3826']],false);
    r.rotation.x=PI/2;r.position.set(s*W*.15,H*.12,D/2+.006);b.add(r);return r;});
  const lamp=new THREE.Mesh(new THREE.SphereGeometry(.011,10,8),new THREE.MeshBasicMaterial({color:new THREE.Color('#5a2222')}));lamp.material.userData.noStorybook=true;lamp.position.set(W*.36,H*.34,D/2+.01);b.add(lamp);
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({color:new THREE.Color('#ff4a3a'),transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,map:dotTex()}));glow.scale.setScalar(.09);lamp.add(glow);
  g.userData.carry={ax:-1.15,az:-.28,ex:-.45};
  const st={rec:false,run:false,t:0};
  return {g,rec(on){st.rec=on;lamp.material.color.set(on?'#ff3b30':'#5a2222');},run(on){st.run=on;},
    tick(dt){st.t+=dt;if(st.run)reels.forEach((r,i)=>{r.rotation.y+=dt*(i?7:6);});glow.material.opacity=st.rec?.55+.35*Math.sin(st.t*7):0;},
    dispose(){g.traverse(o=>{if(o.isMesh||o.isSprite){o.geometry&&o.geometry.dispose();o.material.dispose();}});}};}
let DOT=null;function dotTex(){if(DOT)return DOT;const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.35,'rgba(255,255,255,.6)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);DOT=new THREE.CanvasTexture(c);DOT.colorSpace=THREE.SRGBColorSpace;return DOT;}
export {dotTex};
/* ── 파란 노을 유리 조각 ── 원점 = 밑 */
export function makeGlass(){const g=new THREE.Group();g.name='bluesunset-glass';
  const geo=new THREE.OctahedronGeometry(.13,0);geo.scale(.8,1.35,.45);geo.rotateZ(.25);geo.translate(0,.17,0);
  const m=sbMat('#7FB6E8',{emissive:'#7FB6E8',ei:.45,opacity:.82,transparent:true});m.depthWrite=true;const me=new THREE.Mesh(geo,m);g.add(me);
  const geo2=new THREE.OctahedronGeometry(.07,0);geo2.scale(.7,1.2,.4);geo2.rotateZ(-.5);geo2.translate(.09,.1,.02);const me2=new THREE.Mesh(geo2,sbMat('#a9d2f4',{emissive:'#a9d2f4',ei:.5,opacity:.8,transparent:true}));g.add(me2);
  const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:dotTex(),color:new THREE.Color('#9cc8f2'),transparent:true,opacity:.6,depthWrite:false,blending:THREE.AdditiveBlending}));halo.scale.setScalar(.55);halo.position.y=.17;g.add(halo);
  return g;}
/* 가방·카드 아이콘: 파란 노을 유리 조각 */
let GLI=null;export function glassIcon(){if(GLI)return GLI;const c=document.createElement('canvas');c.width=c.height=96;const g=c.getContext('2d');
  const gr=g.createRadialGradient(48,50,4,48,50,40);gr.addColorStop(0,'rgba(190,225,255,.9)');gr.addColorStop(1,'rgba(127,182,232,0)');g.fillStyle=gr;g.fillRect(0,0,96,96);
  g.strokeStyle='#3c5f86';g.lineWidth=3;g.lineJoin='round';g.fillStyle='#7FB6E8';g.beginPath();g.moveTo(44,12);g.lineTo(66,40);g.lineTo(56,84);g.lineTo(30,70);g.lineTo(28,34);g.closePath();g.fill();g.stroke();
  g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.moveTo(42,22);g.lineTo(52,36);g.lineTo(40,52);g.closePath();g.fill();
  g.fillStyle='#f2b58e';g.beginPath();g.arc(62,66,5,0,7);g.fill();
  return GLI=c.toDataURL();}
/* 카세트 아이콘(대화창 옆·카드) */
let CSI=null;export function cassetteIcon(){if(CSI)return CSI;const c=document.createElement('canvas');c.width=c.height=96;const g=c.getContext('2d');g.lineWidth=3;g.strokeStyle='#5a3826';
  g.fillStyle='#f3e4c4';g.beginPath();g.roundRect(10,22,76,52,8);g.fill();g.stroke();g.fillStyle='#D9704A';g.fillRect(12,58,72,14);g.fillStyle='#3b2c35';g.beginPath();g.roundRect(24,30,48,20,5);g.fill();
  for(const x of [36,60]){g.fillStyle='#fff6e6';g.beginPath();g.arc(x,40,6,0,7);g.fill();}g.fillStyle='#ff3b30';g.beginPath();g.arc(78,30,4,0,7);g.fill();return CSI=c.toDataURL();}
/* ── 뒤죽박죽 말풍선(협곡 건너 엇갈린 소리) ── 머리 위 HTML, 글자가 계속 섞이고 흔들림. obj 머리 높이 y. hint로 등록(영상에는 안 나옴) */
export function jumbleBubble({camera,obj,y,text,tone='hi',hint}){const el=document.createElement('div');el.className='mars-jumble '+tone;el.setAttribute('aria-hidden','true');
  if(!document.getElementById('marsJumbleCss')){const s=document.createElement('style');s.id='marsJumbleCss';s.textContent=
    '.mars-jumble{position:fixed;left:0;top:0;z-index:30;pointer-events:none;transform:translate(-50%,-100%);background:#fff6e6;color:#4a2a2a;border:2.5px solid #5a3826;border-radius:18px;padding:.32rem .7rem;font-family:"Jua","Gowun Dodum",sans-serif;font-size:clamp(15px,2.6vh,22px);white-space:nowrap;box-shadow:0 3px 0 rgba(90,56,38,.45);opacity:0;transition:opacity .25s}'+
    '.mars-jumble.on{opacity:1}.mars-jumble:after{content:"";position:absolute;left:50%;bottom:-10px;margin-left:-8px;border:8px solid transparent;border-top-color:#5a3826;border-bottom:0}'+
    '.mars-jumble.lo{background:#f6dfcf;font-size:clamp(17px,3vh,26px)}.mars-jumble span{display:inline-block}'+
    '@media (prefers-reduced-motion:reduce){.mars-jumble span{transform:none!important}}';document.head.appendChild(s);}
  (document.querySelector('.wlg')||document.body).appendChild(el);if(hint)hint(el);
  const chars=[...text];let order=chars.map((_,i)=>i),last=0,t=0;const v=new THREE.Vector3();
  function render(){el.innerHTML=order.map(i=>`<span>${chars[i]===' '?'&nbsp;':chars[i]}</span>`).join('');}
  render();requestAnimationFrame(()=>el.classList.add('on'));
  return {tick(dt){t+=dt;if(t-last>.16){last=t;for(let k=0;k<2;k++){const a=Math.floor(Math.random()*order.length),b=Math.floor(Math.random()*order.length);[order[a],order[b]]=[order[b],order[a]];}render();}
      [...el.children].forEach((s,i)=>{s.style.transform=`translate(${Math.sin(t*9+i*1.7)*2.5}px,${Math.sin(t*11+i)*3.5}px) rotate(${Math.sin(t*6+i*2.3)*9}deg)`;});
      obj.getWorldPosition(v);v.y+=y;v.y=bentY(v.x,v.z,v.y);v.project(camera);const vis=v.z<1&&Math.abs(v.x)<1.2&&Math.abs(v.y)<1.2;el.style.display=vis?'':'none';
      el.style.left=((v.x+1)/2*innerWidth)+'px';el.style.top=((1-v.y)/2*innerHeight-6)+'px';},
    remove(){el.classList.remove('on');setTimeout(()=>el.remove(),300);}};}
export {lump,M4,sph};
