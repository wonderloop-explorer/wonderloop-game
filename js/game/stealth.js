/* 원더룹 — 지나가는 큰 존재 · 제자리 경비 영역 · 숨을 곳 · 알아차림 (2026-11-06, 공통 틀 8단계 — 규칙은 docs/series-rules.md '방해는 공간의 성격')
   개미굴 원본 꿀 저장소 경비개미(updatePatrol)·보육실 보모개미·지네 동굴(HIDES·CENTI)에서 옮긴 것. 실패는 없다 — 들키면 살짝 안전한 곳으로 옮겨질 뿐.
   ① hide({obj|at:[x,z], r}) 숨을 곳 — 원더룹이 r 안에 있거나, 지켜보는 눈과 원더룹 사이를 가리면(시선이 둥근 기둥 r×0.8을 지나면) 알아차림이 오르지 않는다.
      obj가 있으면 매 프레임 그 물체 자리를 읽는다 → 움직이는 숨을 곳(원본 몸을 만 공벌레처럼).
   ② pass({model, path:[[x,z]…], speed, wait, loop, y, range, cone, safe, lines}) 지나가는 큰 존재 — 정해진 길을 천천히 오가며(끝에서 wait초 쉼, loop면 한 바퀴씩) 지켜본다.
      model.userData.tick(dt, 걷는 중)이 있으면 매 프레임 부른다(다리·몸마디 움직임).
   ③ guard({obj, at:[x,z], heading, range, cone, safe, lines}) 제자리 경비 영역 — 한자리를 지키는 주민. 영역 = 알아차림 거리 range(원본 경비개미 7.5m), 시야각 cone(원본 ±0.58라디안 — null이면 둘레 모두).
   알아차림 단계(원본 그대로 — 보이면 sus += dt·(1.4 + 2.2·(1 − 거리/range))·rate, 안 보이면 −dt·0.7):
      처음 보이면 머리 위 '?'(크림색 동그라미, 크기 0.35+0.35·sus) + guard-notice(작게) → sus가 1이 되면 '!'(노란 동그라미) + guard-alert + 원더룹 후덜덜(얼굴빛 하얗게)
      → 0.35초 guard-windup(덤비기 전) → 0.55초 뒤 guard-caught + 짧은 흔들림 + 화면 전환(0.35초 어두워졌다 0.5초에 밝아짐 — 뚝 끊기지 않게)과 함께 safe 자리로.
      '?' 단계에서 멀어지거나 숨으면 sus가 줄어 원래대로. 원본은 '!' 뒤 쫓아와 잡았지만 시리즈는 달리지 않으니 쫓지 않고 바로 옮긴다(원본과 다른 점).
   safe: [x,z,바라볼 각도] 또는 ()=>[x,z,ry] (세계 설정에서 채움 — 입구 쪽). lines: {notice:['…'], alert:['거기 누구냐!'], back:['…']} — 그 단계에서 한 줄(game/dialog say — notice·alert는 그 존재가, back은 원더룹 혼잣말).
   소리 이름은 효과음 공통 묶음(guard-notice·guard-alert·guard-windup·guard-caught) — 개미굴은 세계 설정 sfx로 원본 ant-alert·ant-windup·ant-caught를 끼운다.
   세계 설정 stages[구역 id].stealth = {hides:[…], pass:[…], guards:[…]} (모델은 함수 — (THREE)=>Object3D)도 08이 구역에 들어올 때 setStealthZone이 만든다.
   alertLevel() = 가장 높은 알아차림(0~1) — game/stage 긴장 구역 카메라 떨림이 그만큼 커진다(원본 보육실). 시험: 톱니 메뉴 '지나가는 큰 존재 시험'·'경비 영역 시험'(game/devstory). */
import {storybook} from './storybook.js';
import * as THREE from 'three';
import {block,blocking,cue} from './core.js';
import {sfx} from './sound.js';
import {hint,transition} from './ui.js';
import {react} from './react.js';
import {say} from './dialog.js';
let C=null,HIDES=[],EYES=[],busy=null,TQ=null,TA=null;
const _a=new THREE.Vector3();
function tex(ch,bg){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'); // 원본 Q_TEX·ALERT_TEX 그대로
  g.fillStyle=bg;g.beginPath();g.arc(32,32,28,0,7);g.fill();g.fillStyle='#3e2834';g.font='bold 40px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(ch,32,35);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
function initStealth(c){C=c;}
function hide(h){const o={r:1.2,...h};HIDES.push(o);return o;}
const hidePos=h=>{if(h.obj){h.obj.getWorldPosition(_a);return [_a.x,_a.z];}return h.at;};
function hiddenFrom(ex,ez){const P=C.WL.position;for(const h of HIDES){const [hx,hz]=hidePos(h);if(Math.hypot(P.x-hx,P.z-hz)<h.r)return true;
    // 시선(눈 → 원더룹)이 숨을 곳 기둥(r×0.8)을 지나면 가려짐(원본 씨앗더미)
    const dx=P.x-ex,dz=P.z-ez,L2=dx*dx+dz*dz;if(L2<1e-6)continue;const u=Math.max(0,Math.min(1,((hx-ex)*dx+(hz-ez)*dz)/L2)),qx=ex+dx*u-hx,qz=ez+dz*u-hz;if(u>.05&&u<.95&&qx*qx+qz*qz<(h.r*.8)**2)return true;}
  return false;}
function mark(e){if(!TQ){TQ=tex('?','#fff6e6');TA=tex('!','#ffd23f');}const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:TQ,depthTest:false,transparent:true}));sp.renderOrder=20;sp.visible=false;C.scene.add(sp);hint(sp);e.sp=sp;}
function eye(o){const e={range:7.5,cone:.58,rate:1,height:1.6,sus:0,st:'calm',...o};mark(e);EYES.push(e);return e;}
function guard(o){const e=eye({kind:'guard',...o});if(e.obj&&e.heading==null)e.heading=e.obj.rotation.y;return e;}
function pass(o){const e=eye({kind:'pass',speed:1.1,wait:1.5,loop:false,y:0,cone:null,range:4.5,...o});e.i=0;e.dir=1;e.wt=0;const p=e.path[0];e.pos=[p[0],p[1]];
  if(e.model){e.model.position.set(p[0],(C.ground?C.ground(p[0],p[1]):0)+e.y,p[1]);if(!e.model.parent)C.scene.add(e.model);}return e;}
const eyePos=e=>{if(e.kind==='pass')return e.pos;if(e.obj){e.obj.getWorldPosition(_a);return [_a.x,_a.z];}return e.at;};
function walk(e,dt){if(e.wt>0){e.wt-=dt;return false;}const n=e.path.length;let j=e.i+e.dir;
  if(j>=n||j<0){if(e.loop){j=(j+n)%n;}else{e.dir*=-1;j=e.i+e.dir;e.wt=e.wait;return false;}}
  const q=e.path[j],dx=q[0]-e.pos[0],dz=q[1]-e.pos[1],d=Math.hypot(dx,dz),st=e.speed*dt;
  if(d<=st){e.pos=[q[0],q[1]];e.i=j;}else{e.pos[0]+=dx/d*st;e.pos[1]+=dz/d*st;}
  e.heading=Math.atan2(dx,dz);if(e.model){const m=e.model;m.position.set(e.pos[0],(C.ground?C.ground(e.pos[0],e.pos[1]):0)+e.y,e.pos[1]);
    let a=e.heading-m.rotation.y;a=Math.atan2(Math.sin(a),Math.cos(a));m.rotation.y+=a*Math.min(1,dt*4);}return true;}
function sees(e){const P=C.WL.position,[x,z]=eyePos(e),dx=P.x-x,dz=P.z-z,d=Math.hypot(dx,dz);if(d>e.range)return 0;
  if(e.cone!=null&&d>1.6){let a=Math.atan2(dx,dz)-(e.heading||0);a=Math.atan2(Math.sin(a),Math.cos(a));if(Math.abs(a)>e.cone)return 0;}
  if(hiddenFrom(x,z))return 0;return 1+2.2/1.4*(1-d/e.range);}
const pick=a=>a&&a.length?a[Math.floor(Math.random()*a.length)]:null;
function who(e){return e.who||(e.kind==='pass'?'큰 존재':'경비');}
function caught(e){if(busy)return;busy=e;block('caught',true);const U=C.WL.userData;if(U.stopWalk)U.stopWalk();
  e.st='alert';e.sp.material.map=TA;e.sp.material.needsUpdate=true;sfx('guard-alert');react('shiver',{sec:1.4,pale:true,sound:null});cue({kind:'stealth',who:who(e),text:'들킴',dur:1.2});
  const l=pick(e.lines&&e.lines.alert);if(l)say(who(e),l,1.4);
  setTimeout(()=>{if(busy===e)sfx('guard-windup');},350);
  setTimeout(()=>{if(busy!==e)return;sfx('guard-caught');react('shake',{preset:'caught',sound:null});
    transition(()=>{const s=typeof e.safe==='function'?e.safe():e.safe;if(s){const W=C.WL;W.position.set(s[0],C.ground?C.ground(s[0],s[1]):W.position.y,s[1]);if(s[2]!=null)W.rotation.y=s[2];}
      EYES.forEach(x=>{x.sus=0;x.st='calm';x.sp.visible=false;});},{out:.35,hold:.15,in:.5}).then(()=>{block('caught',false);busy=null;const b=pick(e.lines&&e.lines.back);if(b)say('원더룹',b,2);});},900);}
function tickStealth(dt){if(!C)return;const P=C.WL.position;
  for(const e of EYES){const moving=e.kind==='pass'&&!busy&&!blocking('talk')?walk(e,dt):false;if(e.model&&e.model.userData.tick)e.model.userData.tick(dt,moving);
    if(e.st==='alert')continue;const v=busy||blocking('itemget')||blocking('front')?0:sees(e);
    if(v){e.sus+=dt*1.4*v*(e.rate||1);if(e.st==='calm'){e.st='sus';sfx('guard-notice',{gain:.5});const l=pick(e.lines&&e.lines.notice);if(l)say(who(e),l,1.4);}
      if(e.kind==='guard'&&e.obj){const [x,z]=eyePos(e);const a=Math.atan2(P.x-x,P.z-z);let d=a-e.heading;d=Math.atan2(Math.sin(d),Math.cos(d));e.heading+=d*Math.min(1,dt*3);} // 원본: 알아차리면 그쪽으로 고개를 돌림
      if(e.sus>=1){e.sus=1;caught(e);}}
    else if(e.st==='sus'){e.sus-=dt*.7;if(e.sus<=0){e.sus=0;e.st='calm';}}
    const sp=e.sp;sp.visible=e.st!=='calm';if(sp.visible){if(e.st==='sus'&&sp.material.map!==TQ){sp.material.map=TQ;sp.material.needsUpdate=true;}
      const [x,z]=eyePos(e);sp.position.set(x,(C.ground?C.ground(x,z):0)+e.height+(e.y||0),z);sp.scale.setScalar(e.st==='alert'?.7:.35+.35*Math.min(1,e.sus));}}}
const alertLevel=()=>EYES.reduce((m,e)=>Math.max(m,e.st==='alert'?1:e.sus),0);
const hidden=()=>{const P=C.WL.position;return HIDES.some(h=>{const [x,z]=hidePos(h);return Math.hypot(P.x-x,P.z-z)<h.r;});};
function remove(o){HIDES=HIDES.filter(h=>h!==o);EYES=EYES.filter(e=>{if(e!==o)return true;e.sp.removeFromParent();e.sp.material.dispose();if(e.kind==='pass'&&e.model&&e.ownModel)e.model.removeFromParent();return false;});}
/* 세계 설정 stages[구역].stealth로 만들기 (08 구역에 들어올 때) */
function setStealthZone(z,W){clearStealth();const s=(z&&z.stealth)||(W&&W.stages&&z&&W.stages[z.id]&&W.stages[z.id].stealth);if(!s)return;
  (s.hides||[]).forEach(h=>hide({...h,obj:h.model?addModel(h.model,h.at):h.obj}));
  (s.pass||[]).forEach(p=>pass({...p,model:p.model?storybook(p.model(THREE)):null,ownModel:true}));
  (s.guards||[]).forEach(g=>guard({...g,obj:g.model?addModel(g.model,g.at,g.heading):g.obj}));}
function addModel(f,at,ry=0){const m=storybook(f(THREE));m.position.set(at[0],C.ground?C.ground(at[0],at[1]):0,at[1]);m.rotation.y=ry;C.scene.add(m);return m;}
function clearStealth(){EYES.forEach(e=>{e.sp.removeFromParent();e.sp.material.dispose();if(e.ownModel&&e.model)e.model.removeFromParent();});EYES=[];HIDES=[];if(busy){block('caught',false);busy=null;}}
const stealthState=()=>EYES.map(e=>({kind:e.kind,st:e.st,sus:+e.sus.toFixed(2),pos:eyePos(e).map(v=>+(+v).toFixed(2))}));
export {alertLevel,clearStealth,guard,hidden,hide,initStealth,pass,remove,setStealthZone,stealthState,tickStealth};
