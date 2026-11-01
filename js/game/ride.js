/* 원더룹 — 탈것: 정해진 길을 따라 원더룹을 태워 옮긴다(이슬배·바람 타기 같은 짧은 구경 연출). 타는 동안 걷기·누르기 조작은 쉰다.
   ride({vehicle, path:[[x,y,z],…], speed:1.2, seat:.25, fwd:0, turn:true, onStart, onEnd}) → {stop(), get u()}
   - fwd: 원더룹이 탈것 가운데에서 진행 방향으로 얼마나 앞에 설지(뒤에 노 젓는 요정을 태울 때 겹치지 않게). 탈것은 진행 방향이 +z.
   - path: 지나갈 점들(곡선으로 이음). vehicle(3D 물체)이 길을 따라가고, 원더룹은 vehicle 위 seat 높이에 서서 진행 방향을 본다.
   - 카드·대화가 열리면 잠시 멈춘다(core blocking). 끝나면 원더룹을 길 끝 땅에 내려 주고 onEnd.
   - vehicle은 구역 뿌리에 붙여 두고, 탈것을 쓰는 구역은 keepOut에 넣는다(병합되면 움직이지 않는다). 07은 WL.userData.riding이 있는 동안 걷기·높이 계산을 쉰다. */
import * as THREE from 'three';
import {blocking} from './core.js';
let ctx=null,cur=null;const _t=new THREE.Vector3();
function ride({vehicle,path,speed=1.2,seat=.25,fwd=0,turn=true,onStart,onEnd}){if(cur)stop();
  const curve=new THREE.CatmullRomCurve3(path.map(p=>new THREE.Vector3(...p))),len=curve.getLength(),U=ctx.WL.userData;
  if(U.stopWalk)U.stopWalk();cur={curve,len,u:0,speed,seat,fwd,turn,vehicle,onEnd};U.riding={y:path[0][1]+seat};
  if(onStart)try{onStart();}catch(e){console.error(e);}place();
  return {stop,get u(){return cur?cur.u:1;}};}
function place(){const {curve,u,vehicle,seat,fwd,turn}=cur,p=curve.getPointAt(Math.min(1,u)),WL=ctx.WL;curve.getTangentAt(Math.min(.999,u),_t);
  if(vehicle){vehicle.position.copy(p);if(turn){curve.getTangentAt(Math.min(.999,u),_t);vehicle.rotation.y=Math.atan2(_t.x,_t.z);}}
  WL.position.set(p.x+_t.x*fwd,p.y+seat,p.z+_t.z*fwd);WL.userData.riding.y=p.y+seat;if(turn){curve.getTangentAt(Math.min(.999,u),_t);WL.rotation.y=Math.atan2(_t.x,_t.z);}}
function tickRide(dt){if(!cur||!ctx)return;if(blocking())return;cur.u+=cur.speed*dt/cur.len;place();if(cur.u>=1)stop(true);}
function stop(ended){if(!cur)return;const c=cur;cur=null;if(ctx)ctx.WL.userData.riding=null;if(ended&&c.onEnd)try{c.onEnd();}catch(e){console.error(e);}}
const riding=()=>!!cur;
function initRide(c){ctx=c;}
function clearRide(){stop();}
export {clearRide,initRide,ride,riding,stop,tickRide};
