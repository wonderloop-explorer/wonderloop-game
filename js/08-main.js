/* 원더룹 베이스캠프 — 입력·조명 단계·카메라 따라가기·애니메이션 루프 */
import * as THREE from 'three';
import {PI,rawLin,scene} from './01-textures.js';
import {DUST,beamLen,beamMat2,beamStart,capMat,crateLight,dustGeo,dustMat,dustPos,dustSeed,glowMat,lampHit,lampLight,minute,perpA,perpB,poolMat,skyNight,steams,sunDir} from './02-room.js';
import {ROOM_T,camera,controls,fill,follow,hemi,optimized,renderer,statsEl,sun,ui} from './03-scene.js';
import {WL} from './04-character.js';
import './05-hair-headwear.js';
import './06-outfits.js';
import {hopWL,setWalkTarget,updateWL,wlHit} from './07-actions.js';
/* ---------- 상호작용 ---------- */
let cave=0,caveTarget=0,lightState=0,emph=true,night=0,nightTarget=0,lampOn=true,lampLevel=1,spin=false,spinDir=1;
const dayBtn=document.getElementById('dayBtn'),spinBtn=document.getElementById('spinBtn');
dayBtn.addEventListener('click',()=>{lightState=(lightState+1)%3;nightTarget=lightState>=1?1:0;caveTarget=lightState===2?1:0;dayBtn.textContent=['저녁으로 바꾸기','어두운 굴로 바꾸기','낮으로 바꾸기'][lightState];});
{const eb=document.getElementById('emphBtn');eb.addEventListener('click',()=>{emph=!emph;eb.textContent=emph?'캐릭터 강조: 켜짐':'캐릭터 강조: 꺼짐';});}
spinBtn.addEventListener('click',()=>{spin=!spin;spinBtn.textContent=spin?'멈추기':'천천히 둘러보기';});
const ray=new THREE.Raycaster(),ptr=new THREE.Vector2();let downAt=null;
renderer.domElement.addEventListener('pointerdown',e=>{downAt=[e.clientX,e.clientY];});
renderer.domElement.addEventListener('pointerup',e=>{
  if(!downAt)return;const moved=Math.hypot(e.clientX-downAt[0],e.clientY-downAt[1]);downAt=null;if(moved>6)return;
  const r=renderer.domElement.getBoundingClientRect();ptr.set(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);
  ray.setFromCamera(ptr,camera);
  if(ray.intersectObjects(lampHit,false).length){lampOn=!lampOn;return;}
  if(ray.intersectObjects(wlHit,false).length){hopWL();return;}
  const r0=ray.ray;if(r0.direction.y<-0.01){const tt=-r0.origin.y/r0.direction.y;setWalkTarget(r0.origin.x+r0.direction.x*tt,r0.origin.z+r0.direction.z*tt);}
});
const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 애니메이션 ---------- */
const cDaySky=rawLin(0xfff3dc),cNightSky=rawLin(0x8b92c8),cDayG=rawLin(0xd2ab88),cNightG=rawLin(0x5a4a5e);
const clock=new THREE.Timer();clock.connect(document);const tmp=new THREE.Vector3();
/* 촬영 모드(?shot): 고정 시간 간격으로 한 프레임씩 진행 — 기준 스크린샷·영상 캡처용 */
const SHOT=new URLSearchParams(location.search).has('shot');let shotT=0;
function tick(){
  let dt,t;if(SHOT){dt=1/60;shotT+=dt;t=shotT;}else{clock.update();dt=Math.min(clock.getDelta(),0.05);t=clock.getElapsed();}
  night+=(nightTarget-night)*Math.min(1,dt*2.2);
  lampLevel+=((lampOn?1:0)-lampLevel)*Math.min(1,dt*6);
  const n=night,flick=reduce?1:(1+Math.sin(t*7.3)*0.04+Math.sin(t*13.1)*0.03);
  hemi.intensity=0.62-0.4*n;poolMat.opacity=(0.08+0.32*n)*lampLevel;hemi.color.copy(cDaySky).lerp(cNightSky,n);hemi.groundColor.copy(cDayG).lerp(cNightG,n);
  sun.intensity=0.72*(1-n);fill.intensity=0.22-0.08*n;
  beamMat2.opacity=0.22*(1-n);dustMat.opacity=0.85*(1-n);skyNight.opacity=n;
  lampLight.intensity=(0.55+0.95*n)*lampLevel*flick;
  glowMat.emissiveIntensity=0.15+(0.55+0.6*n)*lampLevel;capMat.emissiveIntensity=0.05+0.3*n*lampLevel;
  crateLight.intensity=(0.25+0.6*n)*flick;
  cave+=(caveTarget-cave)*Math.min(1,dt*2.2);
  if(cave>0.001){hemi.intensity*=1-.75*cave;hemi.color.lerp(rawLin(0x6b4a3a),cave);hemi.groundColor.lerp(rawLin(0x2a1d16),cave);fill.intensity*=1-.75*cave;lampLight.intensity*=1-.85*cave;crateLight.intensity*=1-.5*cave;}
  {const dark=Math.min(1,Math.max(0,1-hemi.intensity/.62));const U=WL.userData;if(U.rimU){U.rimU.value=emph?.08+.45*dark:0;U.liftU.value=emph?.02+.17*dark:0;}}
  // 위 세기는 r128 옛 조명 단위 → 물리 단위로 (옛 방식은 셰이더에서 π를 곱했다)
  [hemi,sun,fill,lampLight,crateLight].forEach(l=>l.intensity*=PI);
  // 먼지
  for(let i=0;i<DUST;i++){const d=dustSeed[i];if(!reduce){d.t+=d.sp*dt;if(d.t>1)d.t-=1;}
    const wob=Math.sin(t*0.6+d.ph)*0.08;
    tmp.copy(beamStart).addScaledVector(sunDir,d.t*beamLen).addScaledVector(perpA,Math.cos(d.a)*d.r*(0.85+d.t*0.2)+wob).addScaledVector(perpB,Math.sin(d.a)*d.r*(0.85+d.t*0.2));
    dustPos[i*3]=tmp.x;dustPos[i*3+1]=tmp.y;dustPos[i*3+2]=tmp.z;}
  dustGeo.attributes.position.needsUpdate=true;
  // 김
  steams.forEach(s=>{const u=s.userData;const p=((t*0.28)+u.ph)%1;
    s.position.set(u.x+Math.sin(t*1.3+u.sw)*0.06*p,u.y+p*0.75,u.z+Math.cos(t*1.1+u.sw)*0.04*p);
    const sc=0.12+p*0.28;s.scale.set(sc,sc,sc);s.material.opacity=Math.sin(p*PI)*0.55*(reduce?0.6:1);});
  // 시계
  minute.rotation.x=-t*0.15;
  updateWL(dt,t);
  // 천천히 둘러보기
  if(spin){const off=camera.position.clone().sub(controls.target);const s=new THREE.Spherical().setFromVector3(off);
    s.theta+=spinDir*dt*0.18;if(s.theta>controls.maxAzimuthAngle-0.02){spinDir=-1;}if(s.theta<controls.minAzimuthAngle+0.02){spinDir=1;}
    camera.position.copy(new THREE.Vector3().setFromSpherical(s).add(controls.target));}
  {const tg=follow?new THREE.Vector3(WL.position.x,WL.position.y+.85,WL.position.z):ROOM_T;const k=Math.min(1,dt*3);const dv=tg.clone().sub(controls.target).multiplyScalar(k);controls.target.add(dv);camera.position.add(dv);
   if(ui.camGoal){const off=camera.position.clone().sub(controls.target);const L=off.length(),nl=L+(ui.camGoal-L)*Math.min(1,dt*3);off.setLength(nl);camera.position.copy(controls.target).add(off);if(Math.abs(nl-ui.camGoal)<.05)ui.camGoal=0;}}
  controls.update();renderer.render(scene,camera);
  ui.statT+=dt;if(ui.statT>0.5){ui.statT=0;const ri=renderer.info.render;statsEl.textContent=`${optimized?'최적화 켜짐':'최적화 꺼짐'}: 드로우콜 ${ri.calls}회(그림자 포함), 삼각형 ${ri.triangles.toLocaleString('ko-KR')}개`;}
  if(!SHOT)requestAnimationFrame(tick);
}
tick();
if(SHOT){
  /* 콘솔·자동화에서 쓰는 촬영 도구: wlShot.setup({...}) → wlShot.step(n) → wlShot.capture() */
  renderer.setPixelRatio(1);
  const clickUntil=(id,ok)=>{const b=document.getElementById(id);for(let i=0;i<12&&!ok();i++)b.click();};
  window.wlShot={
    revision:THREE.REVISION,scene,renderer,camera,WL,
    size(w,h){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();},
    setup(o){
      if(o.light!=null)clickUntil('dayBtn',()=>lightState===o.light);
      if(o.hood!=null)clickUntil('hoodBtn',()=>WL.userData.hw===o.hood);
      if(o.outfit!=null)clickUntil('outfitBtn',()=>!!WL.userData.outfit===!!o.outfit);
      if(o.action)clickUntil('actBtn',()=>WL.userData.action===o.action);
      if(o.expr)clickUntil('exprBtn',()=>document.getElementById('exprBtn').textContent==='표정: '+o.expr);
      if(o.follow!=null&&o.follow!==follow)document.getElementById('camBtn').click();
      if(o.view)this.view(o.view);
    },
    /* az: 원더룹이 보는 방향 기준 각도(0 정면, π/2 측면, π 뒷면), pol: 위에서 내려다보는 각, dist: 거리 */
    view(v){Object.assign(controls,{minAzimuthAngle:-Infinity,maxAzimuthAngle:Infinity,minPolarAngle:0,maxPolarAngle:PI,minDistance:0.5});ui.camGoal=0;
      const tg=v.room?ROOM_T.clone():new THREE.Vector3(WL.position.x,WL.position.y+.85,WL.position.z);if(v.ty!=null)tg.y=v.ty;
      controls.target.copy(tg);camera.position.copy(new THREE.Vector3().setFromSpherical(new THREE.Spherical(v.dist,v.pol,(v.room?0:WL.rotation.y)+v.az)).add(tg));controls.update();},
    step(n){for(let i=0;i<n;i++)tick();},
    capture(){renderer.render(scene,camera);return renderer.domElement.toDataURL('image/png');},
    info(){const ri=renderer.info.render;return{calls:ri.calls,triangles:ri.triangles};}
  };
}
