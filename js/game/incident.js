/* 원더룹 — 사건 연출 공통 처리 (2026-11-05, 공통 틀 6단계 — 규칙은 docs/series-rules.md '이벤트 설계')
   개미굴 원본 꿀단지 이벤트(짐수레가 미끄러져 꿀단지가 쏟아지고, 닿으면 톡 하고 수레로 돌아감)의 움직임을 새 세계에서 쓰게 공통으로 만든 것.
   원본 이벤트는 건드리지 않는다. 원본과 다른 점: 단지가 서로 다른 방향으로 천천히 구르고(원본은 한쪽으로 3.4m/초), 굴러가는 거리에 한계가 있다(원더룹은 달리지 않으니 걸어서 따라잡게).
   ① show({at:[x,y,z], from?, dist=6, sec=1.1, sound}) — 사건 순간 카메라: 사건이 일어난 곳을 sec초(1초 안팎) 비춘 뒤 원더룹 시점으로 부드럽게 돌아온다
      from이 없으면 지금 카메라가 보는 방향 그대로 사건 쪽으로 옮겨 가(dist 거리, 비스듬히 위) — 원더룹을 가로지르지 않는다.
      (game view.focus — 들어갈 때·돌아올 때 0.45초씩 섞음, 플레이어가 화면을 만지면 바로 끝남). sound가 있으면 그 순간 효과음. Promise(돌아오면 끝).
   ② scatter({items, center:[x,z], dir, spread, dist:[가까이,멀리], speed, radius, lift, touchR, sound, onBack(i,모은 수,전체), onDone}) — 굴러가는 물건
      items(이미 장면에 있는 물체들)가 제자리에서 톡 튀어나와(0.7초, 원본 그대로) 서로 다른 방향으로 천천히 구르다 멈춘다.
        방향: dir(라디안, 0 = +z) 둘레로 spread(부채꼴 전체 각도, 없으면 한 바퀴를 고르게). 거리: dist 사이(최대 5m로 자름). 처음 빠르기 speed(기본 1.1m/초 — 걷기 3.15의 1/3)에서 점점 느려짐.
        벽·막힌 곳(02 blocked)에 닿으면 옆으로 꺾고, 그래도 막히면 그 자리에 선다. 대화·카드가 열려 있으면 멈춰 기다린다.
      원더룹이 touchR(원본 1.4) 안에 오면 sound('event-tok' = 원본 줍기 소리)와 함께 포물선을 그리며 제자리(처음 부모 안 그 자리)로 날아간다(0.6초, 원본 그대로).
      멈춘 물건 둘레에는 노란 고리(원본 #ffe08a, 안내 표시 — 영상에서는 숨김). 실패·시간 제한 없음 — 다 모을 때까지 기다린다. 다 모으면 onDone.
      → 손잡이 {left, stop()}. 구역을 떠나면 비워진다(clearIncident). 시험: 톱니 메뉴 '굴러가는 물건 시험'(game/devcheck — 베이스캠프에서 공 셋). */
import * as THREE from 'three';
import {blocking,cue} from './core.js';
import {sfx} from './sound.js';
import {hint} from './ui.js';
let ctx=null;const RUN=new Set();
const _v=new THREE.Vector3(),_q=new THREE.Quaternion(),_ax=new THREE.Vector3();
function initIncident(c){ctx=c;}
function show({at,from=null,dist=6,sec=1.1,sound=null}){if(sound)sfx(sound);cue({kind:'camera',who:'사건',text:'',dur:sec});if(!ctx||!ctx.view)return Promise.resolve();
  if(!from){const c=ctx.view.camera.position,P=ctx.WL.position;let dx=c.x-P.x,dz=c.z-P.z;const L=Math.hypot(dx,dz)||1;dx/=L;dz/=L; // 지금 카메라가 보는 방향 그대로 사건 쪽으로 옮겨 감
    from=[at[0]+dx*dist*.82,at[1]+dist*.58,at[2]+dz*dist*.82];} // (원더룹 너머에서 보면 카메라가 원더룹 머리를 지나갔다 — view.focus 기본 자리)
  return ctx.view.focus({at,from,dist,sec});}
const gy=(x,z)=>ctx.ground?ctx.ground(x,z)||0:0;
const free=(x,z,r)=>!ctx.blocked||!ctx.blocked(x,z)&&!ctx.blocked(x+r,z)&&!ctx.blocked(x-r,z)&&!ctx.blocked(x,z+r)&&!ctx.blocked(x,z-r);
function scatter({items,center,dir=0,spread=null,dist=[2.2,3.4],speed=1.1,radius=.22,lift=0,touchR=1.4,sound='event-tok',ring=true,onBack=null,onDone=null}){
  const n=items.length,root=ctx.scene;let got=0;const maxD=Math.min(5,dist[1]);
  const S=items.map((m,i)=>{m.updateWorldMatrix(true,false);const home={parent:m.parent,p:m.position.clone(),q:m.quaternion.clone(),s:m.scale.clone()};
    const from=m.getWorldPosition(new THREE.Vector3());root.attach(m);
    const a=dir+(spread==null?i*2*Math.PI/n+.35:(n>1?(i/(n-1)-.5)*spread:0)),dx=Math.sin(a),dz=Math.cos(a);
    const d=Math.min(maxD,dist[0]+(dist[1]-dist[0])*((i*.618+.2)%1)); // 물건마다 다른 거리(되풀이해도 같게)
    let tx=center[0]+dx*.7,tz=center[1]+dz*.7;if(!free(tx,tz,radius)){tx=center[0];tz=center[1];}
    let rg=null;if(ring){rg=new THREE.Mesh(new THREE.RingGeometry(.4,.52,22),new THREE.MeshBasicMaterial({color:'#ffe08a',transparent:true,opacity:.7,depthWrite:false}));rg.rotation.x=-Math.PI/2;rg.visible=false;root.add(rg);hint(rg);}
    return {m,home,from,to:new THREE.Vector3(tx,gy(tx,tz)+radius+lift,tz),dx,dz,d,s:0,st:'pop',t:0,rg};});
  const h={get left(){return n-got;},stop(){RUN.delete(h);S.forEach(o=>{if(o.st!=='home')putHome(o);dropRing(o);});}};
  function dropRing(o){if(o.rg){root.remove(o.rg);o.rg.geometry.dispose();o.rg.material.dispose();o.rg=null;}}
  function putHome(o){const H=o.home;(H.parent||root).add(o.m);o.m.position.copy(H.p);o.m.quaternion.copy(H.q);o.m.scale.copy(H.s);o.st='home';}
  function roll(o,dt){const k=1-o.s/o.d,v=Math.max(.12,speed*Math.sqrt(Math.max(0,k)));let step=Math.min(v*dt,o.d-o.s);if(step<=1e-4){o.st='rest';return;}
    const p=o.m.position;let nx=p.x+o.dx*step,nz=p.z+o.dz*step;
    if(!free(nx+o.dx*.06,nz+o.dz*.06,radius)){let ok=false;for(const t of [.7,-.7,1.4,-1.4]){const c=Math.cos(t),s=Math.sin(t),dx=o.dx*c+o.dz*s,dz=-o.dx*s+o.dz*c;
        if(free(p.x+dx*(step+.06),p.z+dz*(step+.06),radius)){o.dx=dx;o.dz=dz;nx=p.x+dx*step;nz=p.z+dz*step;ok=true;break;}}
      if(!ok){o.st='rest';return;}}
    p.x=nx;p.z=nz;p.y=gy(nx,nz)+radius+lift;o.s+=step;
    _ax.set(o.dz,0,-o.dx).normalize();_q.setFromAxisAngle(_ax,step/radius);o.m.quaternion.premultiply(_q); // 구르는 쪽으로 굴러감
    if(o.s>=o.d-1e-3)o.st='rest';}
  h.tick=dt=>{if(blocking())return;const P=ctx.WL.position;
    for(const o of S){const p=o.m.position;
      if(o.st==='pop'){o.t+=dt/.7;const u=Math.min(1,o.t);p.lerpVectors(o.from,o.to,u);p.y+=Math.sin(u*Math.PI)*1.2;_ax.set(o.dz,0,-o.dx).normalize();_q.setFromAxisAngle(_ax,dt*8);o.m.quaternion.premultiply(_q);if(u>=1)o.st='roll';}
      else if(o.st==='roll')roll(o,dt);
      if(o.st==='roll'||o.st==='rest'){if(o.rg){o.rg.visible=true;o.rg.position.set(p.x,gy(p.x,p.z)+.05,p.z);o.rg.material.opacity=.4+.3*Math.sin(performance.now()/200);}
        if(Math.hypot(P.x-p.x,P.z-p.z)<touchR){o.st='back';o.t=0;o.from=p.clone();if(o.rg)o.rg.visible=false;got++;if(sound)sfx(sound);if(onBack)try{onBack(S.indexOf(o),got,n);}catch(e){console.error(e);}}}
      else if(o.st==='back'){o.t+=dt/.6;const u=Math.min(1,o.t),H=o.home;if(H.parent)H.parent.updateWorldMatrix(true,false);_v.copy(H.p);if(H.parent)_v.applyMatrix4(H.parent.matrixWorld);
        p.lerpVectors(o.from,_v,u);p.y+=Math.sin(u*Math.PI)*1.4;o.m.quaternion.slerp(H.parent?H.parent.getWorldQuaternion(_q).multiply(H.q):H.q,Math.min(1,dt*8));
        if(u>=1){putHome(o);dropRing(o);}}}
    if(S.every(o=>o.st==='home')){RUN.delete(h);if(onDone)try{onDone();}catch(e){console.error(e);}}};
  RUN.add(h);return h;}
function tickIncident(dt){RUN.forEach(h=>h.tick(dt));}
function clearIncident(){[...RUN].forEach(h=>h.stop());RUN.clear();}
export {clearIncident,initIncident,scatter,show,tickIncident};
