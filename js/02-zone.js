/* 원더룹 — 구역(zone) 구조
   구역 하나 = js/zones/<이름>.js 모듈 하나. 지금 구역만 장면에 올리고, 떠날 때 메시·재질·텍스처를 GPU에서 비운다.
   구역 모듈은 build({root,id})를 내보낸다. 그 안에서 add·boxAt·group 등으로 소품을 만들면 구역 뿌리(root)에 붙고,
   끝에 아래 "구역 정보"를 돌려준다. 원더룹(04~07)과 해·하늘빛·카메라(03)는 구역이 바뀌어도 그대로다.

   구역 정보 (js/zones/basecamp.js, sample-outdoor.js, sample-indoor.js 참고)
     name, kind: 'indoor'(실내) | 'outdoor'(야외)
     spawn: {x,z,ry}                     처음 들어올 때 원더룹 자리·방향
     areas: {이름: {bounds, obstacles, camera}}
       실내는 방마다 하나, 야외는 보통 하나. bounds [x0,x1,z0,z1] 걸을 수 있는 범위(방끼리 겹치는 곳이 문간),
       obstacles [{r:[x0,x1,z0,z1]} | {c:[x,z,반지름]}], camera {target, dist, polar, azimuth(없으면 한 바퀴), start, minDist, maxDist}
     doors: [{rect:[x0,x1,z0,z1], to, spawn}]  밟으면 다른 구역(to)으로 (spawn이 있으면 그 자리로)
     sun: {dir, shadow, follow}           해 방향, 그림자 범위(반지름), follow: 그림자 범위가 원더룹을 따라감(넓은 야외)
     groundY(x,z), ground: [메시]          (선택) 땅 높이, 클릭해서 걸을 때 맞힐 땅
     lights: [점광원]  light(env,dt)  update(dt,t,env)  click(ray)  keepOut: [병합에서 뺄 것]  dispose()
   새 구역 추가: README "새 구역 추가하기". */
import * as THREE from 'three';
import {BUILD,loadBaked,scene} from './01-textures.js';
// 구역 목록 — 새 구역은 여기에 한 줄 더한다
const ZONES={
  basecamp:()=>import('./zones/basecamp.js'),
};
// 견본 구역(확인용, 하늘 없음)은 주소에 ?zonetest 를 붙였을 때만 목록에 들어간다 — 일반 주소에서는 문·wlZone.go·?zone= 어느 길로도 못 간다
const ZONETEST=new URLSearchParams(location.search).has('zonetest');
if(ZONETEST)Object.assign(ZONES,{
  'sample-outdoor':()=>import('./zones/sample-outdoor.js'),
  'sample-indoor':()=>import('./zones/sample-indoor.js'),
});
const zone={cur:null,area:null}; // 지금 구역과 원더룹이 있는 방(영역) — 03·07·08이 읽는다
async function loadZone(id){
  if(!ZONES[id])throw new Error('원더룹: 없는 구역 '+id);
  const [mod]=await Promise.all([ZONES[id](),loadBaked(id)]); // 구역 코드와 그 구역의 구운 텍스처
  const root=new THREE.Group();root.name='zone:'+id;scene.add(root);
  BUILD.root=root;BUILD.zone=id;let z;try{z=mod.build({root,id});}finally{BUILD.root=null;BUILD.zone=null;}
  Object.assign(z,{id,root});z.lights=z.lights||[];z.keepOut=z.keepOut||[];
  z.doors=(z.doors||[]).filter(d=>ZONES[d.to]); // 목록에 없는 구역으로 가는 문은 없앤다
  for(const a of Object.values(z.areas))a.obstacles=a.obstacles||[];
  return z;}
function unloadZone(z){
  scene.remove(z.root);const seen=new Set();
  z.root.traverse(o=>{if(o.geometry)o.geometry.dispose();
    (Array.isArray(o.material)?o.material:o.material?[o.material]:[]).forEach(m=>{if(seen.has(m))return;seen.add(m);
      for(const k in m){const v=m[k];if(v&&v.isTexture)v.dispose();}m.dispose();});});
  if(z.dispose)z.dispose();}
/* 걷기: 어느 방(영역) 안이어야 하고 장애물에 닿지 않아야 한다 (WR: 원더룹 몸 반지름) */
const WR=0.28;
const inRect=(r,x,z)=>x>=r[0]&&x<=r[1]&&z>=r[2]&&z<=r[3];
function areaAt(x,z){for(const k in zone.cur.areas)if(inRect(zone.cur.areas[k].bounds,x,z))return k;return null;}
function blocked(x,z){if(!areaAt(x,z))return true;
  for(const k in zone.cur.areas)for(const o of zone.cur.areas[k].obstacles){
    if(o.r){if(x>o.r[0]-WR&&x<o.r[1]+WR&&z>o.r[2]-WR&&z<o.r[3]+WR)return true;}
    else{const dx=x-o.c[0],dz=z-o.c[1];if(dx*dx+dz*dz<(o.c[2]+WR)*(o.c[2]+WR))return true;}}
  return false;}
const groundY=(x,z)=>zone.cur.groundY?zone.cur.groundY(x,z):0;
const doorAt=(x,z)=>zone.cur.doors.find(d=>inRect(d.rect,x,z))||null;
// 처음 구역: 보통 베이스캠프, 주소에 ?zone=이름 을 붙이면 그 구역에서 시작
{const want=new URLSearchParams(location.search).get('zone');zone.cur=await loadZone(ZONES[want]?want:'basecamp');}
zone.area=areaAt(zone.cur.spawn.x,zone.cur.spawn.z)||Object.keys(zone.cur.areas)[0];
export {WR,ZONES,ZONETEST,areaAt,blocked,doorAt,groundY,loadZone,unloadZone,zone};
