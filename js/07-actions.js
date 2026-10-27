/* 원더룹 베이스캠프 — 어두운 곳 강조(림 라이트)·이동·동작 세트·포즈 */
import * as THREE from 'three';
import {PI,blobTex,lin,pencil,rnd,scene,softMat} from './01-textures.js';
import {HIP,SM,WL,WLS,antennae,arms,eyes,legs,neck,shirtU,skin,spine,wlBody} from './04-character.js';
/* 작은 부품은 그림자를 드리우지 않게 (그림자용으로 한 번 더 그리는 비용 절약) */
WL.updateMatrixWorld(true);{const sc=new THREE.Vector3();WL.traverse(o=>{if(!o.isMesh||!o.castShadow)return;o.geometry.computeBoundingSphere();o.getWorldScale(sc);if(o.geometry.boundingSphere.radius*Math.max(sc.x,sc.y,sc.z)<.1)o.castShadow=false;});}
/* 어두운 곳 가독성: 캐릭터 재질에 테두리 빛(림 라이트)과 약한 자체 밝기를 더함 — 주변이 어두울수록 강해짐 */
{const U=WL.userData;U.rimU={value:0};U.liftU={value:0};const rimCol={value:lin('#ffe6c4')};const seen=new Set();
 WL.traverse(o=>{if(!o.isMesh)return;(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{if(!m||!m.isMeshStandardMaterial||seen.has(m))return;seen.add(m);
   const prev=m.onBeforeCompile;m.onBeforeCompile=(sh,r)=>{if(prev)prev(sh,r);sh.uniforms.uRim=U.rimU;sh.uniforms.uLift=U.liftU;sh.uniforms.uRimCol=rimCol;
     sh.fragmentShader='uniform float uRim;uniform float uLift;uniform vec3 uRimCol;\n'+sh.fragmentShader.replace('#include <dithering_fragment>',
     'float wlFr=pow(1.0-clamp(dot(normalize(normal),normalize(vViewPosition)),0.0,1.0),2.2);gl_FragColor.rgb+=uRimCol*wlFr*uRim+diffuseColor.rgb*uLift;\n#include <dithering_fragment>');};
   m.customProgramCacheKey=()=> 'wlrim';});});}
const wlBlob=new THREE.Mesh(new THREE.PlaneGeometry(0.95,0.95),softMat(blobTex,0.45));wlBlob.rotation.x=-PI/2;scene.add(wlBlob);
const wlHit=[];WL.traverse(o=>{if(o.isMesh)wlHit.push(o);});
const marker=new THREE.Mesh(new THREE.RingGeometry(0.16,0.24,24),new THREE.MeshBasicMaterial({color:lin('#3fb5a8'),transparent:true,opacity:0,depthWrite:false}));marker.rotation.x=-PI/2;scene.add(marker);
let wlTarget=null,wlHop=0,wlPhase=0,blinkT=2.5,markerA=0;
const obstacles=[{r:[-4.95,-3.2,-3.65,-0.35]},{r:[-0.55,2.15,-4.9,-3.6]},{r:[-4.65,-3.45,2.8,4.0]},{c:[0.7,-3.12,0.5]},{c:[3.05,-3.65,0.65]},{c:[4.2,-1.75,0.6]},{c:[3.6,0.6,0.42]},{c:[0.55,0.75,0.78]},{c:[-3.85,1.4,0.6]},{c:[2.7,2.9,0.4]},{c:[3.85,3.55,0.48]},{c:[-3.4,3.75,0.35]},{c:[-4.3,2.35,0.2]}];
const WR=0.28;
function blocked(x,z){if(x<-4.65||x>4.75||z<-4.6||z>4.75)return true;
  for(const o of obstacles){if(o.r){if(x>o.r[0]-WR&&x<o.r[1]+WR&&z>o.r[2]-WR&&z<o.r[3]+WR)return true;}else{const dx=x-o.c[0],dz=z-o.c[1];if(dx*dx+dz*dz<(o.c[2]+WR)*(o.c[2]+WR))return true;}}
  return false;}
function hopWL(){if(wlHop<=0)wlHop=1;}
function setWalkTarget(x,z){wlTarget={x,z};marker.position.set(x,0.06,z);markerA=1;}
/* ---------- 동작 세트 ---------- */
const ACTIONS=['서기','걷기','뛰기','두리번','들여다보기','기어오르기','멈칫','나침반 보기','손 흔들기'];
const ACT_FACE={'뛰기':'신남','두리번':'궁금','들여다보기':'궁금','멈칫':'놀람','나침반 보기':'궁금','손 흔들기':'기쁨'};
function runPose(ph){const s=Math.sin(ph);return{kx0:Math.max(0,-s)*1.2+.15,kx1:Math.max(0,s)*1.2+.15,lx0:s*.85-.15,lx1:-s*.85-.15,ly0:.3+Math.max(0,s)*.13,ly1:.3+Math.max(0,-s)*.13,ax0:-s*1.1,ax1:s*1.1,az0:-.45,az1:.45,bx:.14,bz:s*.05,by:Math.abs(Math.cos(ph))*.09,hx:-.12,wy:Math.abs(s)*.05};}
function actionPose(A,t){
 if(A==='걷기'){const ph=t*8,s=Math.sin(ph);return{lx0:s*.5,lx1:-s*.5,ly0:.3+Math.max(0,s)*.08,ly1:.3+Math.max(0,-s)*.08,ax0:-s*.6,ax1:s*.6,az0:-.32,az1:.32,bx:.04,bz:s*.06,by:Math.abs(Math.cos(ph))*.05};}
 if(A==='뛰기')return runPose(t*13);
 if(A==='두리번'){const k=t*1.1,sk=Math.sin(k);return{hy:sk*.75*(.6+.4*Math.abs(Math.sin(k*.5))),hx:-.06,hz:sk*.06,bz:sk*.03,az0:-.38,az1:.38,ax0:.1*sk,ax1:-.1*sk};}
 if(A==='들여다보기'){const b=Math.sin(t*2)*.02;return{wy:-.12+b*.3,lx0:-1.2,lx1:-1.2,kx0:1.9,kx1:1.9,ly0:.3,ly1:.3,bx:.32,hx:.28+b,hy:Math.sin(t*.8)*.15,ax0:-.55,ax1:-.55,az0:-.16,az1:.16,ex0:-.75,ex1:-.75,by:0,bz:0};}
 if(A==='기어오르기'){const ph=t*3.2,s=Math.sin(ph);return{ax0:-1.75+s*.35,ax1:-1.75-s*.35,az0:-.62,az1:.62,ex0:-.25-Math.max(0,-s)*.35,ex1:-.25-Math.max(0,s)*.35,lx0:-.6-s*.55,lx1:-.6+s*.55,kx0:.9+s*.5,kx1:.9-s*.5,ly0:.3+Math.max(0,s)*.1,ly1:.3+Math.max(0,-s)*.1,bx:.08,hx:-.18,by:.02,wy:.03+Math.abs(s)*.02};}
 if(A==='멈칫'){const c=t%2.6,e=Math.min(1,c<.18?c/.18:Math.max(0,1-(c-1.6)/.8));return{wy:c<.3?.07*Math.sin(c/.3*PI):0,ax0:-.4*e,ax1:-.4*e,az0:-1.25*e-.32*(1-e),az1:1.25*e+.32*(1-e),bx:-.16*e,hx:-.18*e,lx0:-.15*e,lx1:.15*e};}
 if(A==='나침반 보기'){const b=Math.sin(t*1.5)*.03;return{ax0:-.75+b,ax1:-.75+b,az0:-.22,az1:.22,ex0:-1.15,ex1:-1.15,ez0:.7,ez1:-.7,hx:.38,hz:Math.sin(t*.7)*.05,bx:.06,by:0};}
 if(A==='손 흔들기')return{az0:-1.5,ex0:-.15,ez0:-.55+Math.sin(t*9)*.3,ax0:-.15,az1:.35,ax1:0,hz:-.14,hx:-.05,bz:-.04};
 return null;}
/* 손에 드는 더듬이 나침반 + 쥐는 손(엄지) */
{const U=WL.userData;const g=new THREE.Bone();g.name='prop';g.position.set(0,.47,.34);g.rotation.x=-1.15;g.scale.setScalar(.14);g.visible=false;wlBody.add(g);
 const gold=new THREE.MeshStandardMaterial({map:pencil('#ffd04a','plain',{hatch:.3}),roughness:.6,emissive:lin('#e8a020'),emissiveIntensity:.3});
 g.add(new THREE.Mesh(new THREE.TorusGeometry(.42,.07,10,32),gold));g.add(new THREE.Mesh(new THREE.CircleGeometry(.4,32),SM('#fff3d8')));
 const back=new THREE.Mesh(new THREE.CircleGeometry(.46,32),gold);back.position.z=-.04;back.rotation.y=PI;g.add(back);
 const nd=new THREE.Bone();nd.name='prop_needle';nd.position.z=.04;g.add(nd);const n1=new THREE.Mesh(new THREE.ConeGeometry(.07,.3,8),SM('#e85a5a'));n1.position.y=.15;nd.add(n1);
 const n2=new THREE.Mesh(new THREE.ConeGeometry(.07,.3,8),SM('#5a6a9a'));n2.position.y=-.15;n2.rotation.z=PI;nd.add(n2);
 const hub=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),gold);hub.position.z=.07;g.add(hub);
 const brn=SM('#7a4a32');[-1,1].forEach(s=>{g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(s*.12,.44,0),new THREE.Vector3(s*.2,.74,0),new THREE.Vector3(s*.42,.86,0)]),10,.026,5),brn));
   const tp=new THREE.Mesh(new THREE.SphereGeometry(.06,8,6),gold);tp.position.set(s*.42,.86,0);g.add(tp);});
 g.userData.nd=nd;U.cprop=g;
 U.thumbs=arms.map((ap,i)=>{const s=i?1:-1;const th=new THREE.Mesh(new THREE.SphereGeometry(.03,12,10),skin);th.scale.set(1,1.15,1);th.position.set(-s*.05,-.165,.045);th.visible=false;ap.userData.elbow.add(th);return th;});
 U.action='서기';U.at=0;
 const ab=document.getElementById('actBtn');let ai=0;ab.addEventListener('click',()=>{ai=(ai+1)%ACTIONS.length;U.action=ACTIONS[ai];U.at=0;ab.textContent='동작: '+U.action;
   const f=ACT_FACE[U.action]||'기본';if(U.setExpr){U.setExpr(f);document.getElementById('exprBtn').textContent='표정: '+f;}});}
/* ---------- 뼈대 ----------
   뼈 이름 (블렌더 규칙, 좌우 .L/.R은 원더룹 기준 — 왼쪽이 +x)
     hips 엉덩이(고정) ─ thigh.L/R 넓적다리(엉덩이 관절) ─ shin.L/R 정강이(무릎) ─ foot.L/R 발(발목)
                      └ spine 몸통(엉덩이 축으로 숙임) ─ upperarm.L/R 위팔(어깨) ─ forearm.L/R 아래팔(팔꿈치)
                                                     ├ neck 목 ─ head 머리 ─ eye.L/R 눈(깜빡임) · antenna.L/R 개미탈 더듬이
                                                     ├ charm 배낭 키링 ─ charm_needle 키링 바늘
                                                     └ prop 손에 든 나침반 ─ prop_needle 바늘
   동작 키 → 뼈 회전 (actionPose·runPose가 돌려주는 값, 0은 오른쪽 R·1은 왼쪽 L)
     lx 넓적다리 앞뒤 thigh.rotation.x · ly 넓적다리 높이 thigh.position.y · kx 무릎 shin.rotation.x (발목 foot은 자동)
     ax/az 어깨 앞뒤/옆 upperarm.rotation.x/z · ex/ez 팔꿈치 forearm.rotation.x/z
     bx/bz 몸 숙임/옆 기울임 spine.rotation.x/z · by 몸 높이 · hx/hy/hz 고개 neck.rotation.x/y/z · wy 몸 전체 높이 WL.position.y
   그리는 쪽: 부품 메시는 그대로 두고(보이지 않는 레이어 1), 재질이 같은 부품끼리 SkinnedMesh 하나로 합친다.
   부품 하나가 잎 뼈 하나 — 위 관절 뼈를 따라 움직이고, 표정·옷·탈 전환으로 숨긴 부품은 크기 0이 된다.
   그래서 setExpr·applyOutfit·pressHair 등은 지금처럼 부품을 다루면 된다. 머리카락은 pressHair가 정점을 고치므로 따로 그린다 */
const body=new THREE.Object3D(),_hv=new THREE.Vector3();
const rigSync=(()=>{
  const keep=new Set([...(WL.userData.hairMeshes||[]),...(WL.userData.noMerge||[])]);
  const parts=[];WL.traverse(o=>{if(o.isMesh&&!keep.has(o))parts.push(o);});
  const msig=m=>[m.type,m.map?m.map.uuid:'',m.color.getHexString(),m.roughness,m.metalness,m.side,m.transparent,m.opacity,m.emissive?m.emissive.getHexString()+m.emissiveIntensity:'',m.flatShading,m.customProgramCacheKey()].join('|');
  // 재질·그림자 설정이 같은 조각끼리 묶음 (재질 배열을 쓰는 부품은 그룹별로 나눔)
  const groups=new Map();
  parts.forEach((o,bi)=>{const g=o.geometry,ms=Array.isArray(o.material)?o.material:[o.material];
    const ranges=g.groups.length&&Array.isArray(o.material)?g.groups:[{start:0,count:g.index?g.index.count:g.attributes.position.count,materialIndex:0}];
    ranges.forEach(r=>{const k=msig(ms[r.materialIndex])+'#'+o.castShadow+'#'+o.receiveShadow;if(!groups.has(k))groups.set(k,[]);groups.get(k).push({o,bi,r,mi:r.materialIndex});});});
  const skel=new THREE.Skeleton(parts);
  const meshes=[];
  groups.forEach(list=>{const pos=[],nor=[],uv=[],si=[],sw=[],idx=[];let base=0;
    list.forEach(({o,bi,r})=>{const g=o.geometry,P=g.attributes.position,N=g.attributes.normal,U=g.attributes.uv;
      for(let i=0;i<P.count;i++){pos.push(P.getX(i),P.getY(i),P.getZ(i));if(N)nor.push(N.getX(i),N.getY(i),N.getZ(i));else nor.push(0,1,0);if(U)uv.push(U.getX(i),U.getY(i));else uv.push(0,0);si.push(bi,0,0,0);sw.push(1,0,0,0);}
      for(let i=r.start;i<r.start+r.count;i++)idx.push(base+(g.index?g.index.getX(i):i));base+=P.count;});
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
    g.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(si,4));g.setAttribute('skinWeight',new THREE.Float32BufferAttribute(sw,4));g.setIndex(idx);
    const f=list[0],m=new THREE.SkinnedMesh(g,Array.isArray(f.o.material)?f.o.material[f.mi]:f.o.material);
    m.name='wl:'+(m.material.name||meshes.length);m.castShadow=f.o.castShadow;m.receiveShadow=f.o.receiveShadow;m.frustumCulled=false;
    m.bindMode=THREE.DetachedBindMode;m.bind(skel,new THREE.Matrix4());m.userData.list=list;WL.add(m);meshes.push(m);});
  // 원래 부품은 화면·그림자에서 빼고(레이어 1) 클릭 판정에만 쓴다
  parts.forEach(o=>o.layers.set(1));
  // 잎 뼈 행렬 = 원더룹 기준 부품 행렬 (숨은 부품은 0) — 렌더러가 프레임마다 부른다
  const vis=new Uint8Array(parts.length),inv=new THREE.Matrix4(),tmp=new THREE.Matrix4(),Z=new Array(16).fill(0);
  skel.update=function(){inv.copy(WL.matrixWorld).invert();const bm=this.boneMatrices;
    for(let i=0;i<parts.length;i++){if(vis[i])tmp.multiplyMatrices(inv,parts[i].matrixWorld).toArray(bm,i*16);else bm.set(Z,i*16);}
    if(this.boneTexture)this.boneTexture.needsUpdate=true;};
  WL.userData.rig={skeleton:skel,meshes,parts};
  return()=>{for(let i=0;i<parts.length;i++){let o=parts[i],v=true;while(o&&o!==WL){if(!o.visible){v=false;break;}o=o.parent;}vis[i]=v;}
    meshes.forEach(m=>{const f=m.userData.list[0];m.material=Array.isArray(f.o.material)?f.o.material[f.mi]:f.o.material;m.visible=m.userData.list.some(e=>vis[e.bi]);});};})();
/* 스키닝 법선: three.js는 뼈 행렬을 법선에 그대로 곱한다. 부품 잎 뼈에는 납작하게 누른 크기가 들어 있어(귀·눈 등)
   보통 메시와 같은 역전치 행렬로 바꾼다 — 한 정점이 뼈 하나에만 붙어 있어 예전과 같은 법선이 나온다 */
{const c=THREE.ShaderChunk,from='objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;';
 if(c.skinnormal_vertex.includes(from))c.skinnormal_vertex=c.skinnormal_vertex.replace(from,'objectNormal = transpose( inverse( mat3( skinMatrix ) ) ) * objectNormal;');
 else console.warn('원더룹: 스키닝 법선 패치 실패');}
function updateWL(dt,t){
  shirtU.uInv.value.copy(wlBody.matrixWorld).invert();
  let moving=false;
  if(wlTarget){const dx=wlTarget.x-WL.position.x,dz=wlTarget.z-WL.position.z,d=Math.hypot(dx,dz);
    if(d<0.06)wlTarget=null;else{const st=Math.min(1.5*dt*(WL.userData.action==='뛰기'?1.9:1),d),nx=WL.position.x+dx/d*st,nz=WL.position.z+dz/d*st;
      let diff=Math.atan2(dx,dz)-WL.rotation.y;diff=Math.atan2(Math.sin(diff),Math.cos(diff));WL.rotation.y+=diff*Math.min(1,dt*10);
      if(!blocked(nx,nz)){WL.position.x=nx;WL.position.z=nz;moving=true;}
      else if(!blocked(nx,WL.position.z)){WL.position.x=nx;moving=true;}
      else if(!blocked(WL.position.x,nz)){WL.position.z=nz;moving=true;}
      else wlTarget=null;}}
  if(moving)wlPhase+=dt*11*(WL.userData.action==='뛰기'?1.6:1);
  const sw=moving?Math.sin(wlPhase):0;
  legs[0].position.y=0.3+Math.max(0,sw)*0.08;legs[1].position.y=0.3+Math.max(0,-sw)*0.08;
  legs[0].rotation.x=sw*0.5;legs[1].rotation.x=-sw*0.5;
  arms[0].rotation.x=-sw*0.6;arms[1].rotation.x=sw*0.6;
  body.rotation.z=sw*0.06;
  body.position.y=moving?Math.abs(Math.cos(wlPhase))*0.05:Math.sin(t*2.2)*0.012;
  let hopY=0,wave=0;if(wlHop>0){wlHop=Math.max(0,wlHop-dt*1.6);wave=Math.sin((1-wlHop)*PI);hopY=wave*0.4;}
  WL.position.y=hopY*WLS;arms[0].rotation.z=-0.32-wave*2.2;arms[1].rotation.z=0.32+wave*2.2;
  {const th=(moving?0:Math.sin(t*0.9)*0.05)+(WL.userData.headTilt||0);neck.rotation.z=th;}
  {const C=WL.userData.charm;if(C&&C.g.visible){const tx=moving?.25+Math.sin(wlPhase*2)*.35:Math.sin(t*1.3)*.05,tz=moving?Math.sin(wlPhase)*.4:Math.sin(t*.9)*.04;
    C.vx+=((tx-C.ax)*60-C.vx*5)*dt;C.vz+=((tz-C.az)*60-C.vz*5)*dt;if(wlHop>.95)C.vx+=6*dt*20;
    C.ax=Math.max(-.05,C.ax+C.vx*dt);C.az+=C.vz*dt;C.g.rotation.x=C.ax;C.g.rotation.z=C.az;const N=WL.userData.charmNeedle;if(N)N.rotation.z=Math.sin(t*1.7)*.25+Math.sin(t*23)*.05;}}
  antennae.forEach((a,i)=>{a.rotation.z=Math.sin(t*3+i)*0.15+(moving?Math.sin(wlPhase)*0.2:0);a.rotation.x=Math.sin(t*2.3+i*2)*0.1;});
  blinkT-=dt;if(blinkT<0)blinkT=rnd(2.5,5);const bl=blinkT<0.12?0.15:1;eyes.forEach(e=>e.scale.y=bl);
  wlBlob.position.set(WL.position.x,0.046,WL.position.z);wlBlob.scale.setScalar((1-hopY*0.8)*WLS*0.8);
  markerA=Math.max(0,markerA-dt*1.2);marker.material.opacity=markerA*0.9;marker.scale.setScalar(1+(1-markerA)*0.6);
  {const U=WL.userData,A=U.action||'서기';U.at=(U.at||0)+dt;const at=U.at;
   let T=null;if(moving){if(A==='뛰기')T=runPose(wlPhase);}else if(A!=='서기')T=actionPose(A,at);
   U.aw=Math.max(0,Math.min(1,(U.aw||0)+(T?1:-1)*dt*6));
   const base={ex0:-.12,ex1:-.12,ez0:0,ez1:0,kx0:0,kx1:0,lx0:legs[0].rotation.x,lx1:legs[1].rotation.x,ly0:legs[0].position.y,ly1:legs[1].position.y,ax0:arms[0].rotation.x,ax1:arms[1].rotation.x,az0:arms[0].rotation.z,az1:arms[1].rotation.z,bx:0,bz:body.rotation.z,by:body.position.y,hx:0,hy:0,hz:neck.rotation.z,wy:WL.position.y/WLS};
   if(!U.pc)U.pc=Object.assign({},base);const tg=T?Object.assign({},base,T):base;for(const k in tg)U.pc[k]+=(tg[k]-U.pc[k])*Math.min(1,dt*10);
   const w=U.aw;
   if(w>0){const P=U.pc,L=k=>base[k]+(P[k]-base[k])*w;
     legs[0].rotation.x=L('lx0');legs[1].rotation.x=L('lx1');legs.forEach((lg,i)=>{const k=L(i?'kx1':'kx0');lg.userData.knee.rotation.x=k;lg.userData.boot.rotation.x=-(lg.rotation.x+k)*.85;});legs[0].position.y=L('ly0');legs[1].position.y=L('ly1');
     arms[0].rotation.x=L('ax0');arms[1].rotation.x=L('ax1');arms[0].rotation.z=L('az0');arms[1].rotation.z=L('az1');arms.forEach((ap,i)=>ap.userData.elbow.rotation.set(L(i?'ex1':'ex0'),0,L(i?'ez1':'ez0')));
     {const bxv=L('bx');body.rotation.x=bxv;body.rotation.z=L('bz');body.position.y=L('by')+.3-.3*Math.cos(bxv);body.position.z=-.3*Math.sin(bxv);}
     neck.rotation.set(L('hx'),L('hy'),L('hz'));
     WL.position.y=L('wy')*WLS;}
   else{U.pc=Object.assign({},base);body.rotation.x=0;body.position.z=0;neck.rotation.x=0;neck.rotation.y=0;legs.forEach(lg=>{lg.userData.knee.rotation.x=0;lg.userData.boot.rotation.x=-lg.rotation.x*.6;});arms.forEach(ap=>ap.userData.elbow.rotation.set(-.12,0,0));}
   const hold=A==='나침반 보기'&&!moving;U.holdW=Math.max(0,Math.min(1,(U.holdW||0)+(hold?1:-1)*dt*5));
   if(U.cprop){U.cprop.visible=U.holdW>.5;U.cprop.userData.nd.rotation.z=Math.sin(at*1.7)*.3+Math.sin(at*23)*.06;}
   if(U.thumbs)U.thumbs.forEach(th=>th.visible=U.holdW>.5);
   if(U.charm)U.charm.g.visible=!!U.outfit&&!(U.holdW>.5);}
  // 몸통: 위 계산은 발바닥 기준 몸 원점의 위치·회전 → 엉덩이 축 뼈(spine)로 옮김 (spine·(0,-HIP,0) = 예전 몸 변환)
  spine.rotation.copy(body.rotation);spine.position.copy(body.position).add(_hv.set(0,HIP,0).applyEuler(body.rotation));spine.position.y-=HIP;
  rigSync();
}
export {hopWL,setWalkTarget,updateWL,wlHit};
