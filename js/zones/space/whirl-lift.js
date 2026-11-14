/* 원더룹 — 화성 → 금성 이동의 우주 구간·금성 도착(2026-11-12, 세계 규칙: 화성→금성은 먼지 회오리가 하늘 높이 들어 올림. 떠나는 순간은 mars.js bigLift가 이어서 함)
   이동 공통 틀(game/travel): 떠나는 순간 → 우주 지도 → 다음 행성 예고 → 도착. 플레이어는 조종하지 않고 카메라만(끌기·두 손가락·휠), 화면을 톡 누르면 다음 단계로.
   ── spaceBits(root): 우주에 떠 있는 그림(모두 판 그림 — 안개·둥근 땅 안 받음, 그리기 4번, 보일 때만) ──
      mars 아래로 작아지는 붉은 화성 · earth 스쳐 지나가는 작은 파란 점 · moon 그 옆 더 작은 회색 점 · venus 점점 커지는 연보라 금성(#C9A6E0)
   ── cloudArrival({G,root,WL,groundY,mob}): 금성 구름 속으로 쏙 — 화성 착지와 달리 구름이 걷히지 않는다. 연보라 안개 속을 천천히 내려와 푹신한 구름 땅에 사뿐
      (cloud-poof + 구름 알갱이) → 두리번 → 갸웃 → 조작·화면 UI 원래대로. 이동 테마 해결 화음은 구름에 들어서는 순간(화성 쪽에서 landIn) — 여기서는 음악 없이 바람 소리만 */
import * as THREE from 'three';
import {points,lockOn,lockOff,camHome} from './meteor-ride.js';
const PI=Math.PI,ss=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x);};
function discTex(n,draw){const c=document.createElement('canvas');c.width=c.height=n;draw(c.getContext('2d'),n);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
/* 둥근 행성 그림: 왼쪽 위가 밝고 반대쪽이 어두운 공 + 색연필 빗금 + 옅은 빛무리(가장자리 선 없음) */
function orbTex(n,base,light,dark,glow,deco){return discTex(n,(g,N)=>{const c=N/2,R=N*.36;
  const gl=g.createRadialGradient(c,c,R*.9,c,c,N*.5);gl.addColorStop(0,glow);gl.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gl;g.fillRect(0,0,N,N);
  g.save();g.beginPath();g.arc(c,c,R,0,7);g.clip();const gr=g.createRadialGradient(c-R*.35,c-R*.4,R*.1,c,c,R*1.1);gr.addColorStop(0,light);gr.addColorStop(.55,base);gr.addColorStop(1,dark);g.fillStyle=gr;g.fillRect(0,0,N,N);
  if(deco)deco(g,c,R);g.globalAlpha=.16;g.strokeStyle='#fff8ee';g.lineWidth=N/90;for(let i=-8;i<9;i++){g.beginPath();g.moveTo(c-R,c+i*R*.14-R*.2);g.lineTo(c+R,c+i*R*.14+R*.2);g.stroke();}g.restore();});}
export function spaceBits(root){const mk=(tex,add)=>{const m=new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,fog:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending});m.userData.noBend=true;const s=new THREE.Sprite(m);s.visible=false;s.renderOrder=4;s.frustumCulled=false;root.add(s);return s;};
  const mars=mk(orbTex(256,'#d9895f','#f2c19a','#a85c40','rgba(240,170,130,.35)',(g,c,R)=>{g.globalAlpha=.3;g.fillStyle='#b9694a';for(const [x,y,r] of [[-.3,.2,.3],[.35,-.1,.22],[.05,.5,.2]]){g.beginPath();g.ellipse(c+x*R,c+y*R,r*R*1.4,r*R,.3,0,7);g.fill();}g.globalAlpha=1;})),
    venus=mk(orbTex(256,'#c9a6e0','#efdcfb','#9a78bd','rgba(214,180,240,.45)',(g,c,R)=>{g.globalAlpha=.4;g.strokeStyle='#f3e6ff';g.lineWidth=R*.12;g.lineCap='round';for(let i=-3;i<4;i++){g.beginPath();g.moveTo(c-R,c+i*R*.26+R*.12);g.bezierCurveTo(c-R*.3,c+i*R*.26-R*.12,c+R*.3,c+i*R*.26+R*.16,c+R,c+i*R*.26-R*.08);g.stroke();}g.globalAlpha=1;}));
  const all=[mars,venus];
  return {mars,venus,hide(){all.forEach(s=>s.visible=false);},dispose(){all.forEach(s=>{s.removeFromParent();s.material.map.dispose();s.material.dispose();});}};}
/* 금성 구름 덮개 색(meteor-ride dustVeil 옵션) */
export const CLOUD_VEIL={blobs:['#e6d2f4','#d9c0ee','#f1e4fa','#cdb0e6','#e0c9f2'],bg:['#dcc6ef','#cfb4e6'],fade:'rgba(214,190,236,0)',tiles:[[250,240,255],[176,146,206]],dots:['252,244,255','198,170,226','226,206,242']};
export function cloudArrival(o){const {G,root,WL}=o,U=WL.userData;lockOn(G,WL);U.action='서기';U.at=0;if(U.setExpr)U.setExpr('기본');
  const P=WL.position.clone(),gy=o.groundY(P.x,P.z),face=WL.rotation.y;const puffs=points(root,o.mob?70:120,{map:discTex(64,(g,n)=>{const c=n/2,gr=g.createRadialGradient(c,c,0,c,c,c);gr.addColorStop(0,'rgba(255,255,255,.95)');gr.addColorStop(.6,'rgba(255,255,255,.35)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,n,n);}),add:false,size:.55,grav:-.05,drag:1.8});
  const st={t:0,done:false,cu:null,idle:9,landed:false,sq:1,sv:0};const D=3.1,H=4.6;
  G.travel.note('phase','arrive');G.travel.landIn(D); /* 이동 테마 해결 화음은 내려앉는 순간(별똥별 도착과 같은 자리 — 2026-11-14 행성 이동 공통 틀) */
  {const C=G.controls.input.cam;if(C){C.yaw=face+.7;C.pitch=.3;C.dist=6.4;st.cu=C.user;}U.riding.snap=true;}
  const puff=(n,sp)=>{for(let i=0;i<n;i++){const a=Math.random()*PI*2,r=.2+Math.random()*.5,v=sp*(.4+Math.random()*.7),k=.86+Math.random()*.12;puffs.emit(P.x+Math.cos(a)*r,gy+.1+Math.random()*.3,P.z+Math.sin(a)*r,Math.cos(a)*v,.25+Math.random()*.5,Math.sin(a)*v,1.6+Math.random()*1.4,[.93*k,.86*k,1*k]);}};
  function tick(dt,t){if(st.done)return;st.t+=dt;const T=st.t;puffs.tick(dt);
    if(!st.landed){const u=Math.min(1,T/D),e=1-Math.pow(1-u,2.2);WL.position.set(P.x+Math.sin(T*1.3)*.18*(1-u),gy+H*(1-e),P.z);U.riding.y=WL.position.y;WL.rotation.y=face+Math.sin(T*.9)*.25*(1-u);WL.rotation.z=Math.sin(T*1.7)*.06*(1-u);
      if(u>.3&&!st.p0){st.p0=1;puff(o.mob?8:14,.5);}
      if(u>=1){st.landed=true;st.landT=T;st.sv=-1.6;WL.position.set(P.x,gy,P.z);U.riding.y=gy;WL.rotation.z=0;G.sound.sfx('cloud-poof',{gain:1.1});G.sound.sfx('land',{gain:.45});puff(o.mob?22:36,1.1);G.travel.mark('land');}}
    else{const k=T-st.landT;if(k>.9&&!st.r1){st.r1=1;U.action='두리번';U.at=0;}if(k>3.1&&!st.r2){st.r2=1;U.action='서기';U.at=0;G.react.react('tilt');}
      if(k>4.9){st.done=true;lockOff(G,WL);WL.scale.set(1,1,1);G.travel.end();if(o.onDone)o.onDone();}}}
  function late(dt){if(st.done)return;const a=160*(1-st.sq)-9*st.sv;st.sv+=a*dt;st.sq+=st.sv*dt;const q=Math.max(.6,st.sq),w=1/Math.sqrt(q);WL.scale.set(w,q,w); /* 사뿐 — 살짝 눌렸다 돌아옴 */
    camHome(G,dt,face+.7,.3,st.landed?7:6.4,st,1.6);}
  return {tick,late,state:st,dispose(){puffs.dispose();puffs.pts.removeFromParent();}};}
