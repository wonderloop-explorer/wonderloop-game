/* 원더룹 — 입력·조명 단계·카메라 따라가기·구역 오가기·애니메이션 루프 */
import * as THREE from 'three';
import {PI,rawLin,rngLoaded,scene} from './01-textures.js';
import {ZONES,areaAt,doorAt,groundY,loadZone,unloadZone,zone} from './02-zone.js';
import {ROOM_T,camera,controls,fill,follow,followDist,hemi,optimized,renderer,setAreaCamera,setupView,statsEl,sun,ui} from './03-scene.js';
import {WL} from './04-character.js';
import './05-hair-headwear.js';
import './06-outfits.js';
import {hopWL,setWalkTarget,stopWalk,updateWL,walking,wlHit} from './07-actions.js';
import * as GAME from './game/index.js';
/* ---------- 상호작용 ---------- */
let cave=0,caveTarget=0,lightState=0,emph=true,night=0,nightTarget=0,spin=false,spinDir=1;
const dayBtn=document.getElementById('dayBtn'),spinBtn=document.getElementById('spinBtn');
dayBtn.addEventListener('click',()=>{lightState=(lightState+1)%3;nightTarget=lightState>=1?1:0;caveTarget=lightState===2?1:0;dayBtn.textContent=['저녁으로 바꾸기','어두운 굴로 바꾸기','낮으로 바꾸기'][lightState];});
{const eb=document.getElementById('emphBtn');eb.addEventListener('click',()=>{emph=!emph;eb.textContent=emph?'캐릭터 강조: 켜짐':'캐릭터 강조: 꺼짐';});}
spinBtn.addEventListener('click',()=>{spin=!spin;spinBtn.textContent=spin?'멈추기':'천천히 둘러보기';});
const ray=new THREE.Raycaster(),ptr=new THREE.Vector2();let downAt=null;ray.layers.enable(1); // 레이어 1: 원더룹 원래 부품(클릭 판정용, 화면엔 SkinnedMesh가 그려짐)
renderer.domElement.addEventListener('pointerdown',e=>{downAt=[e.clientX,e.clientY];});
renderer.domElement.addEventListener('pointerup',e=>{
  if(!downAt)return;const moved=Math.hypot(e.clientX-downAt[0],e.clientY-downAt[1]);downAt=null;if(moved>6)return;
  const r=renderer.domElement.getBoundingClientRect();ptr.set(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);
  ray.setFromCamera(ptr,camera);
  if(GAME.clickNPC(ray))return; // 대화 중이면 다음 대사, NPC를 누르면 말 걸기
  if(zone.cur.click&&zone.cur.click(ray))return; // 구역의 클릭할 것 (베이스캠프: 버섯 램프)
  if(ray.intersectObjects(wlHit,false).length){hopWL();return;}
  if(zone.cur.ground){const h=ray.intersectObjects(zone.cur.ground,false)[0];if(h)setWalkTarget(h.point.x,h.point.z);return;} // 높낮이 있는 땅
  const r0=ray.ray;if(r0.direction.y<-0.01){const tt=-r0.origin.y/r0.direction.y;setWalkTarget(r0.origin.x+r0.direction.x*tt,r0.origin.z+r0.direction.z*tt);}
});
/* ---------- 구역 오가기 ----------
   goZone(이름, 자리): 새 구역을 만들고 → 지금 구역을 비우고 → 원더룹을 자리에 세우고 → 해·카메라·병합을 맞춘다.
   문(doors)을 밟으면 저절로 부른다. 들어온 문 위에 서 있는 동안은 다시 넘어가지 않는다. 탈 교체 영역(아틀라스)은 새로 채운다 */
let zoneBusy=false,doorLock=true;
async function goZone(id,spawn){
  if(zoneBusy||!ZONES[id])return false;zoneBusy=true;
  try{const nz=await loadZone(id),old=zone.cur;unloadZone(old);zone.cur=nz;
    const sp=spawn||nz.spawn;stopWalk();WL.position.set(sp.x,groundY(sp.x,sp.z),sp.z);WL.rotation.y=sp.ry||0;
    zone.area=areaAt(sp.x,sp.z)||Object.keys(nz.areas)[0];setupView(nz,zone.area);
    WL.userData.atlas.clear('swap');zoneLook(nz);doorLock=true;
    const zb=document.getElementById('zoneBtn');if(zb)zb.textContent='구역: '+nz.name;
  }finally{zoneBusy=false;}
  return true;}
/* 세계의 옷·탈: 상상의 세계(구역 정보에 hood가 있는 곳)에 들어가면 탐험복 그대로 탈만 그 세계 것으로 바꿔 쓴다.
   outfit을 적으면 그 옷(예: 'casual'), 안 적으면 탐험복. hood가 없는 구역(베이스캠프 등)은 지금 차림 그대로 */
function zoneLook(z){const U=WL.userData;if(z.hood){U.setOutfit(z.outfit||'explorer');U.setHood(z.hood);}else if(z.outfit)U.setOutfit(z.outfit);}
zoneLook(zone.cur); // 처음 구역 (?zone=…로 바로 들어와도)
GAME.initGame({scene,camera,renderer,WL});window.wlGame=GAME; // 콘솔·시험 도구용
window.wlZone={go:goZone,get cur(){return zone.cur;},get area(){return zone.area;},list:Object.keys(ZONES)};
// 주소에 ?zonetest 를 붙이면 구역을 차례로 바꾸는 단추가 나온다 (견본 구역 시험용)
if(new URLSearchParams(location.search).has('zonetest')){const b=document.createElement('button');b.id='zoneBtn';b.textContent='구역: '+zone.cur.name;
  document.querySelector('.bar').appendChild(b);b.addEventListener('click',()=>{const L=Object.keys(ZONES);goZone(L[(L.indexOf(zone.cur.id)+1)%L.length]);});}
const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 애니메이션 ---------- */
const cDaySky=rawLin(0xfff3dc),cNightSky=rawLin(0x8b92c8),cDayG=rawLin(0xd2ab88),cNightG=rawLin(0x5a4a5e);
const clock=new THREE.Timer();clock.connect(document);const tmp=new THREE.Vector3();
/* 촬영 모드(?shot): 고정 시간 간격(기본 1/60초, 영상 캡처 중에는 wlShot.dt=1/72)으로 한 프레임씩 진행 — 기준 스크린샷·영상 캡처용 */
const SHOT=new URLSearchParams(location.search).has('shot');let shotT=0,shotDt=1/60;
/* 안전장치: 프레임 안에서 오류가 나도 멈추지 않게 — 콘솔에 한 번 남기고, 이번 화면은 그려 두고, 다음 프레임을 잇는다 */
const tickErrSeen=new Set();
function tick(){let ok=false;try{tickBody();ok=true;}catch(e){const k=String(e&&e.stack||e);if(!tickErrSeen.has(k)){tickErrSeen.add(k);console.error('원더룹: 프레임 오류 (계속 진행)',e);}
  try{renderer.render(scene,camera);}catch(e2){}}if(!ok&&!SHOT)requestAnimationFrame(tick);}
function tickBody(){
  let dt,t;if(SHOT){dt=shotDt;shotT+=dt;t=shotT;}else{clock.update();dt=Math.min(clock.getDelta(),0.05);t=clock.getElapsed();}
  night+=(nightTarget-night)*Math.min(1,dt*2.2);
  const n=night,flick=reduce?1:(1+Math.sin(t*7.3)*0.04+Math.sin(t*13.1)*0.03);
  hemi.intensity=0.62-0.4*n;hemi.color.copy(cDaySky).lerp(cNightSky,n);hemi.groundColor.copy(cDayG).lerp(cNightG,n);
  sun.intensity=0.72*(1-n);fill.intensity=0.22-0.08*n;
  cave+=(caveTarget-cave)*Math.min(1,dt*2.2);
  if(cave>0.001){hemi.intensity*=1-.75*cave;hemi.color.lerp(rawLin(0x6b4a3a),cave);hemi.groundColor.lerp(rawLin(0x2a1d16),cave);fill.intensity*=1-.75*cave;}
  const Z=zone.cur,env={night:n,cave,flick,reduce};
  if(Z.light)Z.light(env,dt); // 구역 조명(램프·등불 등)과 효과의 밝기
  {const dark=Math.min(1,Math.max(0,1-hemi.intensity/.62));const U=WL.userData;if(U.rimU){U.rimU.value=emph?.08+.45*dark:0;U.liftU.value=emph?.02+.17*dark:0;}}
  // 위 세기는 r128 옛 조명 단위 → 물리 단위로 (옛 방식은 셰이더에서 π를 곱했다)
  [hemi,sun,fill,...Z.lights].forEach(l=>l.intensity*=PI);
  if(Z.update)Z.update(dt,t,env); // 구역 움직임 (베이스캠프: 먼지·김·시계)
  updateWL(dt,t);
  GAME.updateGame(dt); // 대화·이벤트·나레이션 (게임 시간 = 촬영 모드에서는 1/60초씩, 영상 캡처 중에는 1/72초씩)
  // 방(영역)이 바뀌면 그 방 카메라로, 문을 밟으면 다른 구역으로
  {const a=areaAt(WL.position.x,WL.position.z);if(a&&a!==zone.area){zone.area=a;setAreaCamera(Z.areas[a].camera,false);}
   const d=doorAt(WL.position.x,WL.position.z);if(!d)doorLock=false;else if(!doorLock&&!zoneBusy){doorLock=true;goZone(d.to,d.spawn);}}
  // 넓은 야외: 그림자 범위가 원더룹을 따라감 (그림자 지도 한 칸 단위로 맞춰 떨림 없게)
  if(Z.sun.follow){const s=Z.sun.shadow,st=2*s/sun.shadow.mapSize.x,cx=Math.round(WL.position.x/st)*st,cz=Math.round(WL.position.z/st)*st;
    sun.target.position.set(cx,0,cz);sun.position.set(cx,0,cz).sub(tmp.copy(Z.sun.dir).multiplyScalar(16));}
  // 천천히 둘러보기
  if(spin){const off=camera.position.clone().sub(controls.target);const s=new THREE.Spherical().setFromVector3(off);
    s.theta+=spinDir*dt*0.18;if(s.theta>controls.maxAzimuthAngle-0.02){spinDir=-1;}if(s.theta<controls.minAzimuthAngle+0.02){spinDir=1;}
    camera.position.copy(new THREE.Vector3().setFromSpherical(s).add(controls.target));}
  {const tg=follow?new THREE.Vector3(WL.position.x,WL.position.y+.85,WL.position.z):ROOM_T;const k=Math.min(1,dt*3);const dv=tg.clone().sub(controls.target).multiplyScalar(k);controls.target.add(dv);camera.position.add(dv);
   if(ui.camGoal){const off=camera.position.clone().sub(controls.target);const L=off.length(),nl=L+(ui.camGoal-L)*Math.min(1,dt*3);off.setLength(nl);camera.position.copy(controls.target).add(off);if(Math.abs(nl-ui.camGoal)<.05)ui.camGoal=0;}}
  controls.update();renderer.render(scene,camera);
  if(!ui.firstFrame){ui.firstFrame=true;performance.mark('wl-frame');} // 첫 화면 (로딩 시간 측정용)
  ui.statT+=dt;if(ui.statT>0.5){ui.statT=0;const ri=renderer.info.render;statsEl.textContent=`${optimized?'최적화 켜짐':'최적화 꺼짐'}: 드로우콜 ${ri.calls}회(그림자 포함), 삼각형 ${ri.triangles.toLocaleString('ko-KR')}개`;}
  if(!SHOT)requestAnimationFrame(tick);
}
tick();
if(SHOT){
  /* 콘솔·자동화에서 쓰는 촬영 도구: wlShot.setup({...}) → wlShot.step(n) → wlShot.capture() */
  renderer.setPixelRatio(1);
  const clickUntil=(id,ok)=>{const b=document.getElementById(id);for(let i=0;i<12&&!ok();i++)b.click();};
  window.wlShot={
    revision:THREE.REVISION,scene,renderer,camera,WL,game:GAME,
    /* 한 걸음 시간(초). 기본 1/60(기준 스크린샷·규칙 시험), 영상 캡처는 1/72 × 3걸음 = 24fps 한 프레임 */
    get dt(){return shotDt;},set dt(v){shotDt=v;},
    /* 화면 크기(영상 캡처: 2560×1440, 1080×1920). 방 카메라·따라가기 거리도 새 화면비로 다시 잡는다(세로 화면은 멀리) */
    size(w,h){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();const A=zone.cur.areas[zone.area];if(A){setAreaCamera(A.camera,false);ui.camGoal=follow?followDist():ui.dist;}},
    /* 원더룹을 그 자리에 세운다 (영상 캡처 구간 시작) */
    place(x,z,ry){stopWalk();WL.position.set(x,groundY(x,z),z);if(ry!=null)WL.rotation.y=ry;const a=areaAt(x,z);if(a&&a!==zone.area){zone.area=a;setAreaCamera(zone.cur.areas[a].camera,false);}},
    walking,go:goZone,get follow(){return follow;},
    setup(o){
      if(o.light!=null)clickUntil('dayBtn',()=>lightState===o.light);
      if(o.hood!=null)clickUntil('hoodBtn',()=>WL.userData.hw===o.hood);
      if(o.outfit!=null)clickUntil('outfitBtn',()=>!!WL.userData.outfit===!!o.outfit);
      if(o.action)clickUntil('actBtn',()=>WL.userData.action===o.action);
      if(o.expr)clickUntil('exprBtn',()=>document.getElementById('exprBtn').textContent==='표정: '+o.expr);
      if(o.follow!=null&&o.follow!==follow)document.getElementById('camBtn').click();
      if(o.walk)setWalkTarget(o.walk[0],o.walk[1]);
      if(o.hop)hopWL();
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
rngLoaded(); // 로딩 끝 (난수 기록 모드면 여기서 기록을 저장)
// 영상 캡처 모드(?shot&capture=대본.js): 촬영 도구가 다 준비된 뒤에 불러온다 (09-capture.js)
if(SHOT&&new URLSearchParams(location.search).has('capture'))import('./09-capture.js');
