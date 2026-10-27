/* 원더룹 베이스캠프 — 어두운 곳 강조(림 라이트)·이동·동작 세트·포즈 */
import * as THREE from 'three';
import {PI,blobTex,lin,pencil,rnd,scene,softMat} from './01-textures.js';
import {SM,WL,WLS,antennae,arms,eyes,head,legs,shirtU,skin,wlBody} from './04-character.js';
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
{const U=WL.userData;const g=new THREE.Group();g.position.set(0,.47,.34);g.rotation.x=-1.15;g.scale.setScalar(.14);g.visible=false;wlBody.add(g);
 const gold=new THREE.MeshStandardMaterial({map:pencil('#ffd04a','plain',{hatch:.3}),roughness:.6,emissive:lin('#e8a020'),emissiveIntensity:.3});
 g.add(new THREE.Mesh(new THREE.TorusGeometry(.42,.07,10,32),gold));g.add(new THREE.Mesh(new THREE.CircleGeometry(.4,32),SM('#fff3d8')));
 const back=new THREE.Mesh(new THREE.CircleGeometry(.46,32),gold);back.position.z=-.04;back.rotation.y=PI;g.add(back);
 const nd=new THREE.Group();nd.position.z=.04;g.add(nd);const n1=new THREE.Mesh(new THREE.ConeGeometry(.07,.3,8),SM('#e85a5a'));n1.position.y=.15;nd.add(n1);
 const n2=new THREE.Mesh(new THREE.ConeGeometry(.07,.3,8),SM('#5a6a9a'));n2.position.y=-.15;n2.rotation.z=PI;nd.add(n2);
 const hub=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),gold);hub.position.z=.07;g.add(hub);
 const brn=SM('#7a4a32');[-1,1].forEach(s=>{g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(s*.12,.44,0),new THREE.Vector3(s*.2,.74,0),new THREE.Vector3(s*.42,.86,0)]),10,.026,5),brn));
   const tp=new THREE.Mesh(new THREE.SphereGeometry(.06,8,6),gold);tp.position.set(s*.42,.86,0);g.add(tp);});
 g.userData.nd=nd;U.cprop=g;
 U.thumbs=arms.map((ap,i)=>{const s=i?1:-1;const th=new THREE.Mesh(new THREE.SphereGeometry(.03,12,10),skin);th.scale.set(1,1.15,1);th.position.set(-s*.05,-.165,.045);th.visible=false;ap.userData.elbow.add(th);return th;});
 U.action='서기';U.at=0;
 const ab=document.getElementById('actBtn');let ai=0;ab.addEventListener('click',()=>{ai=(ai+1)%ACTIONS.length;U.action=ACTIONS[ai];U.at=0;ab.textContent='동작: '+U.action;
   const f=ACT_FACE[U.action]||'기본';if(U.setExpr){U.setExpr(f);document.getElementById('exprBtn').textContent='표정: '+f;}});}
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
  wlBody.rotation.z=sw*0.06;
  wlBody.position.y=moving?Math.abs(Math.cos(wlPhase))*0.05:Math.sin(t*2.2)*0.012;
  let hopY=0,wave=0;if(wlHop>0){wlHop=Math.max(0,wlHop-dt*1.6);wave=Math.sin((1-wlHop)*PI);hopY=wave*0.4;}
  WL.position.y=hopY*WLS;arms[0].rotation.z=-0.32-wave*2.2;arms[1].rotation.z=0.32+wave*2.2;
  {const th=(moving?0:Math.sin(t*0.9)*0.05)+(WL.userData.headTilt||0);head.rotation.z=th;head.position.x=-.38*Math.sin(th);head.position.y=.59+.38*Math.cos(th);}
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
   const base={ex0:-.12,ex1:-.12,ez0:0,ez1:0,kx0:0,kx1:0,lx0:legs[0].rotation.x,lx1:legs[1].rotation.x,ly0:legs[0].position.y,ly1:legs[1].position.y,ax0:arms[0].rotation.x,ax1:arms[1].rotation.x,az0:arms[0].rotation.z,az1:arms[1].rotation.z,bx:0,bz:wlBody.rotation.z,by:wlBody.position.y,hx:0,hy:0,hz:head.rotation.z,wy:WL.position.y/WLS};
   if(!U.pc)U.pc=Object.assign({},base);const tg=T?Object.assign({},base,T):base;for(const k in tg)U.pc[k]+=(tg[k]-U.pc[k])*Math.min(1,dt*10);
   const w=U.aw;
   if(w>0){const P=U.pc,L=k=>base[k]+(P[k]-base[k])*w;
     legs[0].rotation.x=L('lx0');legs[1].rotation.x=L('lx1');legs.forEach((lg,i)=>{const k=L(i?'kx1':'kx0');lg.userData.knee.rotation.x=k;lg.userData.boot.rotation.x=-(lg.rotation.x+k)*.85;});legs[0].position.y=L('ly0');legs[1].position.y=L('ly1');
     arms[0].rotation.x=L('ax0');arms[1].rotation.x=L('ax1');arms[0].rotation.z=L('az0');arms[1].rotation.z=L('az1');arms.forEach((ap,i)=>ap.userData.elbow.rotation.set(L(i?'ex1':'ex0'),0,L(i?'ez1':'ez0')));
     {const bxv=L('bx');wlBody.rotation.x=bxv;wlBody.rotation.z=L('bz');wlBody.position.y=L('by')+.3-.3*Math.cos(bxv);wlBody.position.z=-.3*Math.sin(bxv);}
     head.rotation.set(L('hx'),L('hy'),L('hz'));const hv=new THREE.Vector3(0,.38,0).applyEuler(head.rotation);head.position.set(hv.x,.59+hv.y,hv.z);
     WL.position.y=L('wy')*WLS;}
   else{U.pc=Object.assign({},base);wlBody.rotation.x=0;wlBody.position.z=0;head.rotation.x=0;head.rotation.y=0;legs.forEach(lg=>{lg.userData.knee.rotation.x=0;lg.userData.boot.rotation.x=-lg.rotation.x*.6;});arms.forEach(ap=>ap.userData.elbow.rotation.set(-.12,0,0));}
   const hold=A==='나침반 보기'&&!moving;U.holdW=Math.max(0,Math.min(1,(U.holdW||0)+(hold?1:-1)*dt*5));
   if(U.cprop){U.cprop.visible=U.holdW>.5;U.cprop.userData.nd.rotation.z=Math.sin(at*1.7)*.3+Math.sin(at*23)*.06;}
   if(U.thumbs)U.thumbs.forEach(th=>th.visible=U.holdW>.5);
   if(U.charm)U.charm.g.visible=!!U.outfit&&!(U.holdW>.5);}
}
export {hopWL,setWalkTarget,updateWL,wlHit};
