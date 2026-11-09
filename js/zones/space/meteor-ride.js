/* 원더룹 — 별똥별 꼬리 타기 (무한 우주 세계 규칙: 달 → 화성은 별똥별 꼬리를 타고 간다, 2026-11-09)
   플레이어는 원더룹을 조종하지 않고 카메라 각도만 돌리며 구경하는 연출. 회색 정원(garden.js)이 출발·비행을, 화성(mars.js)이 도착을 부른다.
   ── 모양(그리기 4번: 머리 · 빛무리 · 꼬리 · 반짝이 가루) ──
   머리 = 크림빛 노란 별(발광 — 스스로 빛남) + 더하기 섞기 빛무리(천천히 숨쉼) + 네 갈래 반짝이 ✦(돌며 깜빡).
   꼬리 = 머리에서 원더룹 두 손까지 휘는 관(꼭짓점 직접 고침 — 매 프레임 새로 만들지 않음): 머리 쪽 굵고 노랗게 → 끝은 가늘고 연분홍, 끝 0.35m는 손으로 쥘 만큼 단단한 크림색.
   반짝이 가루 = 점 묶음 하나(휴대폰 140·컴퓨터 260개) — 꼬리를 따라 뿌려져 제자리에 2~3초 남으며 사라짐(더하기 섞기). 같은 점 묶음으로 화성 붉은 먼지(보통 섞기)도.
   꼬리 끝은 07 뼈가 움직인 뒤(구역 lateUpdate) 두 손 가운데(forearm.L·R 끝)에 맞춘다 → 손이 꼬리에 실제로 닿음.
   ── 출발(departure) ── 0~2.4초 하늘에서 별똥별이 반짝이며 원더룹 앞 낮게 내려와 맴돎(event-sparkle) → 2.4초 원더룹이 꼬리 끝을 두 손으로 잡음(07 '꼬리 잡기') →
   3.3초 별똥별이 당김: 몸이 위로 쭉 늘어남(용수철 — tech-lab squishy-test, 세기 160·감쇠 7, 늘이면 옆은 1/√) → 3.75초 확 끌려 올라감(event-whoosh) →
   비행 FLY초(구역이 준 길 path(u) — 머리 자리) 원더룹은 꼬리에 매달려 늦게 따라오며 살짝 흔들림, 목도리 끝이 아래로 휘날림 → 끝나면 onEnd(화성으로).
   ── 도착(arrival) ── 화성 하늘에서 별똥별이 내려와 원더룹을 놓아줌 → 화성 중력(약 38%, 초당 3.7m)으로 천천히 떨어져 납작 → 튀어 오름 → 한 번 더 통통 → 섬,
   착지마다 붉은 먼지(event-pop · land · event-dust) → 깜짝·갸웃·두리번 → 조작이 풀림.
   ── 공통 ── 조작 잠금(WL.userData.riding — 07이 걷기·높이 계산을 쉼, core.block('meteor')), 화면 UI 숨김(ui.setHints(false) — 끝나면 원래대로),
   카메라는 따라가기 카메라 그대로(플레이어가 끌어 둘레를 돌고 거리를 바꿈) — 손을 뗀 지 1.6초가 지나면 기본 각도(원더룹 뒤 비스듬히 위)로 천천히 돌아옴(사용자 요청).
   사진 모드는 그대로 쓸 수 있다(C 키 · 연출 동안 오른쪽 위 '사진' 단추 — 메뉴가 숨으므로 따로). */
import * as THREE from 'three';
import {sbMat} from '../../game/storybook.js';
/* 회색 정원 → 화성으로 넘길 때 남기는 표시(구역을 바꿔도 모듈은 그대로) */
export const RIDE={pending:null,hid:false};
const PI=Math.PI,ss=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x);};
function canvasTex(n,draw){const c=document.createElement('canvas');c.width=c.height=n;draw(c.getContext('2d'),n);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
const glowTex=()=>canvasTex(128,(g,n)=>{const c=n/2,gr=g.createRadialGradient(c,c,0,c,c,c);gr.addColorStop(0,'rgba(255,248,214,1)');gr.addColorStop(.25,'rgba(255,226,150,.55)');gr.addColorStop(.6,'rgba(255,190,150,.14)');gr.addColorStop(1,'rgba(255,170,150,0)');g.fillStyle=gr;g.fillRect(0,0,n,n);});
const sparkTex=()=>canvasTex(64,(g,n)=>{const c=n/2;g.translate(c,c);const gr=g.createRadialGradient(0,0,0,0,0,c);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.2,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=gr;g.beginPath();for(let i=0;i<8;i++){const a=i/8*PI*2,r=i%2?c*.18:c*.98;g.lineTo(Math.cos(a)*r,Math.sin(a)*r);}g.closePath();g.fill();});
const dustTex=()=>canvasTex(64,(g,n)=>{const c=n/2,gr=g.createRadialGradient(c,c,0,c,c,c);gr.addColorStop(0,'rgba(255,255,255,.9)');gr.addColorStop(.55,'rgba(255,255,255,.4)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,n,n);});
const SEG=30,RAD=7;
/* ── 별똥별 모양 ── */
export function makeMeteor(root,{mob=false}={}){
  const g=new THREE.Group();g.name='meteor';root.add(g);
  const head=new THREE.Mesh(new THREE.IcosahedronGeometry(.3,1),new THREE.MeshBasicMaterial({color:new THREE.Color('#fff3b8')}));head.userData.noMerge=true;g.add(head);
  const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,color:new THREE.Color('#ffe7a8')}));halo.scale.setScalar(2.6);head.add(halo);
  const star=new THREE.Sprite(new THREE.SpriteMaterial({map:sparkTex(),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,color:new THREE.Color('#fff6c8')}));star.scale.setScalar(1.7);head.add(star);
  // 꼬리: 관 꼭짓점(SEG+1 마디 × RAD 둘레), 정점 색(머리 노랑 → 연분홍 → 끝 0.35m 크림)
  const pos=new Float32Array((SEG+1)*RAD*3),colA=new Float32Array((SEG+1)*RAD*3),idx=[];
  const cH=new THREE.Color('#ffe48a'),cM=new THREE.Color('#ffb8c8'),cE=new THREE.Color('#fff1d8'),tc=new THREE.Color();
  for(let i=0;i<=SEG;i++){const s=i/SEG;if(s<.82)tc.copy(cH).lerp(cM,ss(0,.82,s));else tc.copy(cM).lerp(cE,ss(.82,.9,s));for(let j=0;j<RAD;j++)colA.set([tc.r,tc.g,tc.b],(i*RAD+j)*3);}
  for(let i=0;i<SEG;i++)for(let j=0;j<RAD;j++){const a=i*RAD+j,b=i*RAD+(j+1)%RAD,c=a+RAD,d=b+RAD;idx.push(a,c,b,b,c,d);}
  const tg=new THREE.BufferGeometry();tg.setAttribute('position',new THREE.BufferAttribute(pos,3));tg.setAttribute('color',new THREE.BufferAttribute(colA,3));tg.setIndex(idx);
  const tail=new THREE.Mesh(tg,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide}));tail.frustumCulled=false;tail.userData.noMerge=true;root.add(tail);
  // 반짝이 가루·먼지 점 묶음(그리기 1번씩)
  const dust=points(root,mob?140:260,{map:sparkTex(),add:true,size:.26});
  const P0=new THREE.Vector3(),P1=new THREE.Vector3(),C=new THREE.Vector3(),_a=new THREE.Vector3(),_b=new THREE.Vector3(),_t=new THREE.Vector3(),_n=new THREE.Vector3(),_m=new THREE.Vector3(),UP=new THREE.Vector3(0,1,0);
  const bez=(o,u)=>{const v=1-u;return o.set(P0.x*v*v+2*C.x*v*u+P1.x*u*u,P0.y*v*v+2*C.y*v*u+P1.y*u*u,P0.z*v*v+2*C.z*v*u+P1.z*u*u);};
  /* 꼬리를 머리 h에서 끝 e까지, 조절점 c로(휘는 정도) — t: 시간(살랑임) */
  function setTail(h,e,c,t){P0.copy(h);P1.copy(e);C.copy(c);
    for(let i=0;i<=SEG;i++){const s=i/SEG;bez(_a,s);bez(_b,Math.min(1,s+.02)).sub(_a);if(_b.lengthSq()<1e-10)_b.set(0,-1,0);_t.copy(_b).normalize();
      _n.copy(_t).cross(UP);if(_n.lengthSq()<1e-6)_n.set(1,0,0);_n.normalize();_m.copy(_n).cross(_t).normalize();
      const wob=Math.sin(t*9-s*10)*.035*s*(1-s)*4;_a.addScaledVector(_n,wob);
      const r=s<.8?.13-(.13-.055)*ss(0,.8,s):.055-.008*ss(.8,1,s); // 머리 쪽 굵게 → 손에 쥐는 끝 가늘게(지름 약 10cm)
      for(let j=0;j<RAD;j++){const a=j/RAD*PI*2,ca=Math.cos(a)*r,sa=Math.sin(a)*r;pos.set([_a.x+_n.x*ca+_m.x*sa,_a.y+_n.y*ca+_m.y*sa,_a.z+_n.z*ca+_m.z*sa],(i*RAD+j)*3);}}
    tg.attributes.position.needsUpdate=true;}
  let emitAcc=0;
  function tick(dt,t,{emit=0}={}){star.material.rotation=t*.8;const k=.85+.15*Math.sin(t*5.3);star.scale.setScalar(1.5+.5*k);halo.scale.setScalar(2.4+.3*Math.sin(t*2.1));
    if(emit>0){emitAcc+=dt*emit;while(emitAcc>=1){emitAcc-=1;const s=.05+Math.random()*.85;bez(_a,s);dust.emit(_a.x+(Math.random()-.5)*.25,_a.y+(Math.random()-.5)*.25,_a.z+(Math.random()-.5)*.25,
      (Math.random()-.5)*.25,(Math.random()-.5)*.25,(Math.random()-.5)*.25,1.6+Math.random()*1.4,Math.random()<.5?[1,.93,.6]:Math.random()<.5?[1,.75,.85]:[.85,.9,1]);}}
    dust.tick(dt);}
  function show(v){g.visible=tail.visible=v;}
  function dispose(){[head.geometry,head.material,halo.material,star.material,tg,tail.material].forEach(o=>o.dispose());dust.dispose();}
  return {g,head,tail,dust,setTail,tick,show,dispose};}
/* 점 묶음(반짝이 가루·붉은 먼지): emit(x,y,z,vx,vy,vz,life,[r,g,b]) — 점마다 수명 동안 색이 옅어짐(더하기 섞기면 어두워지는 게 곧 사라짐) */
export function points(root,n,{map,add=true,size=.25,grav=0,drag=.6}={}){
  const pos=new Float32Array(n*3),col=new Float32Array(n*3),P=[];for(let i=0;i<n;i++){P.push({t:0,life:0,v:[0,0,0],c:[1,1,1]});pos[i*3+1]=-999;}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(col,3));
  const m=new THREE.PointsMaterial({size,map,vertexColors:true,transparent:true,depthWrite:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending,sizeAttenuation:true,opacity:add?1:.85});
  const pts=new THREE.Points(geo,m);pts.frustumCulled=false;pts.userData.noMerge=true;pts.renderOrder=2;root.add(pts);let k=0;
  function emit(x,y,z,vx,vy,vz,life,c){const i=k++%n,p=P[i];p.t=0;p.life=life;p.v=[vx,vy,vz];p.c=c;pos.set([x,y,z],i*3);}
  function tick(dt){let any=false;for(let i=0;i<n;i++){const p=P[i];if(p.life<=0)continue;p.t+=dt;if(p.t>=p.life){p.life=0;pos[i*3+1]=-999;col.set([0,0,0],i*3);continue;}any=true;
      const f=Math.exp(-drag*dt);p.v[0]*=f;p.v[2]*=f;p.v[1]=p.v[1]*f-grav*dt;pos[i*3]+=p.v[0]*dt;pos[i*3+1]+=p.v[1]*dt;pos[i*3+2]+=p.v[2]*dt;
      const u=p.t/p.life,a=add?Math.min(1,p.t*6)*(1-u)*(1-u):1;col.set([p.c[0]*a,p.c[1]*a,p.c[2]*a],i*3);}
    pts.visible=any;geo.attributes.position.needsUpdate=true;geo.attributes.color.needsUpdate=true;}
  function shift(kk,sh){for(let i=0;i<n;i++)pos[i*3+(kk==='x'?0:2)]+=sh;}
  return {pts,emit,tick,shift,dispose(){geo.dispose();m.dispose();}};}
/* 화성 대기 먼지구름(구역이 바뀌는 순간 — 2026-11-09): 화면 전체를 파스텔 살구·분홍 먼지가 덮었다 걷힘(어두운 화면이 한 장도 안 보이게).
   HTML 캔버스 하나(3D 그리기 0), 덩어리 구름 열여섯이 천천히 흘러가며 겹침, 덮을 때 바탕도 같은 색으로 채워 틈이 없게. cover(초)·clear(초)는 Promise.
   다시(2026-11-09): 다 덮은 순간이 평평한 살구색이라 비어 보였다 → 이어지는 잡음 결(타일 한 장, 크림·테라코타 두 겹)이 화면 가운데를 축으로 서로 반대로 돌며 흘러가고(소용돌이),
   먼지 알갱이가 가운데에서 화면 밖으로 날아감(깊이가 있는 점 — 가까워질수록 크고 길게 = 먼지 속을 지나가는 느낌). 덮고 걷히는 시간은 그대로 */
function noiseTile(N,seed,rgb){const c=document.createElement('canvas');c.width=c.height=N;const x=c.getContext('2d'),im=x.createImageData(N,N),D=im.data;
  const h=(i,j,o)=>{const v=Math.sin((((i%o)+o)%o)*127.1+(((j%o)+o)%o)*311.7+seed*74.7)*43758.5453;return v-Math.floor(v);},sm=t=>t*t*(3-2*t);
  for(let y=0;y<N;y++)for(let x0=0;x0<N;x0++){let v=0,a=.5;for(let o=6;o<=48;o*=2){const fx=x0/N*o,fy=y/N*o,i=Math.floor(fx),j=Math.floor(fy),u=sm(fx-i),w=sm(fy-j);
      v+=a*((h(i,j,o)*(1-u)+h(i+1,j,o)*u)*(1-w)+(h(i,j+1,o)*(1-u)+h(i+1,j+1,o)*u)*w);a*=.5;}
    const r=1-Math.abs(v/.94*2-1),k=(y*N+x0)*4,al=Math.max(0,Math.min(1,(r-.45)*2.6)); /* 능선 잡음 = 가는 먼지 자락 */D[k]=rgb[0];D[k+1]=rgb[1];D[k+2]=rgb[2];D[k+3]=al*al*255;}
  x.putImageData(im,0,0);return c;}
export function dustVeil(){const cv=document.createElement('canvas');cv.id='wlDustVeil';cv.setAttribute('aria-hidden','true');
  cv.style.cssText='position:fixed;inset:0;width:100%;height:100%;z-index:60;pointer-events:none;opacity:0';document.body.appendChild(cv);
  const g=cv.getContext('2d'),C=['#f3cfae','#ecb9a2','#f7dcc4','#e9a891','#f0c3a6'],B=[];for(let i=0;i<16;i++)B.push({x:Math.random(),y:Math.random(),r:.25+Math.random()*.35,c:C[i%C.length],v:.03+Math.random()*.05,p:Math.random()*6});
  const T1=noiseTile(128,1,[255,240,222]),T2=noiseTile(128,2,[205,128,104]),P1=g.createPattern(T1,'repeat'),P2=g.createPattern(T2,'repeat');
  const NP=110,Q=[];const reset=(q,z)=>{const a=Math.random()*PI*2,r=.05+Math.random()*.9;q.x=Math.cos(a)*r;q.y=Math.sin(a)*r;q.z=z??(.35+Math.random()*1.65);q.s=.5+Math.random()*1.1;q.c=Math.random()<.6?'255,244,228':Math.random()<.5?'214,140,112':'236,184,160';};
  for(let i=0;i<NP;i++){const q={};reset(q);Q.push(q);}
  let k=0,goal=0,rate=1,t0=performance.now(),last=t0,on=true,done=null;
  function draw(now){if(!on)return;const dt=Math.min(.05,(now-last)/1000);last=now;const t=(now-t0)/1000;k+=Math.sign(goal-k)*Math.min(Math.abs(goal-k),dt*rate);
    const w=cv.width=Math.round(innerWidth*.5),h=cv.height=Math.round(innerHeight*.5),m=Math.max(w,h),cx=w/2,cy=h/2;g.globalAlpha=1;
    const bg=g.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#f1caa9');bg.addColorStop(1,'#eab09c');g.fillStyle=bg;g.globalAlpha=Math.min(1,Math.max(0,(k-.35)/.5));g.fillRect(0,0,w,h);
    for(const b of B){const x=((b.x+t*b.v)%1.4-.2)*w,y=(b.y+Math.sin(t*.6+b.p)*.04)*h,r=b.r*m*(.8+.5*k),gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,b.c);gr.addColorStop(1,'rgba(240,200,170,0)');
      g.globalAlpha=Math.min(1,k*1.4);g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);}
    /* 소용돌이 결: 세 겹이 가운데를 축으로 서로 반대로 돌며 흘러감(살짝 숨쉬듯 늘었다 줄었다) */
    const ka=Math.min(1,Math.max(0,(k-.15)/.6));
    for(const [P,rot,sc,op,dr] of [[P2,.32,1.6,.5,.07],[P1,-.45,1.2,.75,-.05],[P2,.6,2.6,.3,.11]]){if(ka<=0)break;const z=sc*m/128;
      g.save();g.globalAlpha=op*ka;g.translate(cx,cy);g.rotate(t*rot);g.scale(z*(1+.12*Math.sin(t*.7)),z);g.translate(t*dr*128,t*dr*60);g.fillStyle=P;g.fillRect(-256,-256,512,512);g.restore();}
    /* 날리는 먼지 알갱이: 가운데에서 바깥으로(깊이 z가 줄며 커지고 길어짐) */
    if(ka>0){g.lineCap='round';for(const q of Q){const z0=q.z;q.z-=dt*(.75+.4*q.s);if(q.z<.12){reset(q,1.6+Math.random()*.4);continue;}
        const sx=cx+q.x/q.z*m*.5,sy=cy+q.y/q.z*m*.5,px=cx+q.x/z0*m*.5,py=cy+q.y/z0*m*.5,rr=Math.min(3.2,Math.max(.6,q.s*1.5/q.z));
        g.globalAlpha=ka*Math.min(1,(2-q.z)*1.2)*Math.min(.85,q.z*1.6);g.strokeStyle='rgba('+q.c+',1)';g.lineWidth=rr;g.beginPath();g.moveTo(px-(sx-px)*.8,py-(sy-py)*.8);g.lineTo(sx,sy);g.stroke();}}
    cv.style.opacity=String(Math.min(1,k*1.25));if(Math.abs(goal-k)<1e-3&&done){const d=done;done=null;d();}
    if(goal===0&&k<=0&&!done){on=false;cv.remove();return;}requestAnimationFrame(draw);}
  requestAnimationFrame(draw);
  return {cover(sec=.8){goal=1;rate=1/sec;return new Promise(r=>{done=r;});},clear(sec=1.4){goal=0;rate=1/sec;return new Promise(r=>{done=r;});}};}
/* 붉은 먼지(화성 착지): 보통 섞기 둥근 점, 천천히 가라앉음 */
export function redDust(root,n){return points(root,n,{map:dustTex(),add:false,size:.42,grav:.5,drag:1.6});}
/* ── 목도리 끝 휘날림(연출 동안만): 목도리 매듭(06 앤트빌리지 차림 — 매듭 공)에서 두 가닥이 아래·앞쪽 바깥으로 펄럭(몸을 뚫지 않게 매듭에서 바깥쪽으로) ── */
function makeScarf(WL){const U=WL.userData,M=U.antMats&&U.antMats.scarf;let knot=null;
  knot=WL.getObjectByName('ant-scarf-knot'); // 06 앤트빌리지 차림의 목도리 매듭(옷 조합 색으로 바뀐 재질 그대로)
  const col=knot&&knot.material&&knot.material.color?knot.material.color.clone():M?M.color.clone():new THREE.Color('#36aaa0');const mat=sbMat(col);mat.side=THREE.DoubleSide;
  const N=8,strips=[],g=new THREE.Group();g.name='ride-scarf';
  for(const side of [-1,1]){const geo=new THREE.PlaneGeometry(.06,.36,1,N);geo.translate(0,-.18,0);const me=new THREE.Mesh(geo,mat);me.userData.noMerge=true;me.frustumCulled=false;g.add(me);strips.push({me,geo,side,base:geo.attributes.position.array.slice()});}
  g.visible=false;(WL.parent||WL).add(g);
  const _k=new THREE.Vector3(),_f=new THREE.Vector3(),_q=new THREE.Quaternion();
  function tick(t,on,wind=1){g.visible=!!on&&!!knot;if(!g.visible)return;knot.getWorldPosition(_k);WL.getWorldQuaternion(_q);g.position.copy(_k);g.quaternion.copy(_q);
    g.scale.set(WL.scale.x,WL.scale.y,WL.scale.z);
    for(const s of strips){const a=s.geo.attributes.position.array,b=s.base;for(let i=0;i<a.length;i+=3){const v=-b[i+1]/.36; // 0 매듭 → 1 끝
        const fl=Math.sin(t*15*wind-v*6+s.side)*.06*v*wind,out=.07*v+.18*v*v*wind;a[i]=b[i]+s.side*(.02+.05*v)+fl*.4;a[i+1]=b[i+1]*(1-.15*wind*v)+fl*.3;a[i+2]=out+fl;}
      s.geo.attributes.position.needsUpdate=true;s.me.rotation.set(-.18,0,s.side*.12);}}
  function dispose(){g.removeFromParent();strips.forEach(s=>s.geo.dispose());mat.dispose();}
  return {tick,dispose,found:!!knot};}
/* ── 공통: 손·UI·카메라 ── */
const _hr=new THREE.Vector3(),_hl=new THREE.Vector3();
function handsMid(WL,out){const R=WL.getObjectByName('forearm.R'),L=WL.getObjectByName('forearm.L');WL.updateMatrixWorld(true);R.localToWorld(_hr.set(0,-.19,.03));L.localToWorld(_hl.set(0,-.19,.03));return out.copy(_hr).add(_hl).multiplyScalar(.5);}
function camChip(G){const root=document.querySelector('.wlg')||document.body;let b=document.getElementById('wlRideCam');if(b)return b;
  b=document.createElement('button');b.type='button';b.id='wlRideCam';b.className='wl-chip';b.setAttribute('aria-label','사진 찍기 모드');
  b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" style="width:20px;height:20px"><path d="M8.5 5.5 9.8 3.8h4.4l1.3 1.7H19a2.5 2.5 0 0 1 2.5 2.5v9A2.5 2.5 0 0 1 19 19.5H5A2.5 2.5 0 0 1 2.5 17V8A2.5 2.5 0 0 1 5 5.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="12.4" r="3.7" fill="none" stroke="currentColor" stroke-width="2"/></svg><span>사진</span>';
  b.style.cssText='position:fixed;right:calc(env(safe-area-inset-right,0px) + 14px);top:calc(env(safe-area-inset-top,0px) + 14px);z-index:41;display:inline-flex;align-items:center;gap:.35rem;min-height:40px;box-sizing:border-box;background:rgba(46,28,44,.66);color:#fff4e4;border-radius:999px;padding:.4rem .95rem;font-family:"Jua","Gowun Dodum",sans-serif;font-size:.98rem;cursor:pointer;-webkit-tap-highlight-color:transparent';
  b.addEventListener('click',()=>{b.blur();if(window.wlPhoto)window.wlPhoto.enter();});root.appendChild(b);return b;}
/* 연출 시작·끝: 조작 잠금 + 화면 UI 숨김 */
export function lockOn(G,WL){const U=WL.userData;if(U.stopWalk)U.stopWalk();U.riding={y:WL.position.y,carry:true};G.core.block('meteor',true);
  if(!RIDE.hid){RIDE.hid=true;RIDE.hints=G.ui.hintsVisible();G.ui.setHints(false);}camChip(G);G.goal.set(null);G.ui.setQuest('');}
export function lockOff(G,WL){const U=WL.userData;U.riding=null;WL.scale.set(1,1,1);G.core.block('meteor',false);
  if(RIDE.hid){RIDE.hid=false;G.ui.setHints(RIDE.hints!==false);}const b=document.getElementById('wlRideCam');if(b)b.remove();if(U.action==='꼬리 잡기'){U.action='서기';U.at=0;}if(U.setExpr)U.setExpr('기본');}
/* 카메라: 따라가기 카메라를 그대로 쓰되(끌기·두 손가락·휠로 둘레·거리), 손을 뗀 지 1.6초 지나면 기본 각도로 천천히 */
function camHome(G,dt,yaw,pitch,dist,st,rate=.9){const C=G.controls.input.cam;if(!C||!C.on)return;if(st.cu!==C.user){st.cu=C.user;st.idle=0;return;}st.idle+=dt;if(st.idle<1.6)return;
  const k=1-Math.exp(-dt*rate);let dy=yaw-C.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));C.yaw+=dy*k;C.pitch+=(pitch-C.pitch)*k;C.dist+=(dist-C.dist)*k;}
/* 비행 카메라 기본 각도 키: [u, 원더룹이 보는 쪽 기준 방향(0 = 정면), 위아래(라디안), 거리(m)] */
const CAMK=[[0,.95,.02,5.6],[.1,.95,.02,5.6],[.15,PI+.4,.92,9],[.31,PI+.4,.92,9],[.37,PI/2,.08,6.8],[.56,PI/2,.08,6.8],[.62,PI+.78,.2,5.2],[.74,PI+.78,.2,5.2],[.82,.55,.06,4.6],[1,.55,.06,4.6]]; // 어깨 너머는 옆으로 조금(얼굴 옆선이 살짝), 마지막 얼굴 정면은 비행 끝 약 2.3초
/* 용수철(늘어남·눌림): squishy-test 값 */
function spring(){return {x:1,v:0,step(dt,to,k=160,c=7){const a=k*(to-this.x)-c*this.v;this.v+=a*dt;this.x+=this.v*dt;return this.x;}};}
function applySquish(WL,s){const q=Math.max(.45,s),w=1/Math.sqrt(q);WL.scale.set(w,q,w);}
/* ── 출발 + 비행 ──
   o: {G,root,WL,groundY(x,z),path(u)→{x,y,z} 머리 자리(비행 0~1), fly 초, mob, onWave(on) 마을 손 흔들기, onFly(u) 하늘 그림판(행성 스쳐 지나감·화성), onEnd()} */
export function departure(o){const {G,root,WL}=o,FLY=o.fly||13;const M=makeMeteor(root,{mob:o.mob}),SC=makeScarf(WL),S=spring();
  const P=WL.position.clone(),yaw0=WL.rotation.y,fx=Math.sin(yaw0),fz=Math.cos(yaw0);
  const hover=new THREE.Vector3(P.x+fx*1.9,P.y+2.45,P.z+fz*1.9),hi=new THREE.Vector3(P.x+fx*7-fz*4,P.y+17,P.z+fz*7+fx*4);
  const head=new THREE.Vector3().copy(hi),endP=new THREE.Vector3(),ctrl=new THREE.Vector3(),mid=new THREE.Vector3(),hangV=new THREE.Vector3(),lastH=new THREE.Vector3(),vel=new THREE.Vector3(0,1,0);
  const wp=P.clone(); // 원더룹 자리(이 연출이 정함 — 07은 riding.y에 자세 높이 wy를 더해 그리므로 WL.position에서 다시 읽으면 쌓인다)
  const st={endP:null,t:0,phase:'come',grab:0,liftY:P.y,cu:null,idle:9,wave:false,face:yaw0,end:false};lockOn(G,WL);
  G.sound.sfx('event-sparkle',{gain:1.15});G.travel.begin({id:'meteor'}); /* 스테이지 이동 공통 틀(game/travel): 배경음 줄이고 이동 테마 */let t0=null;
  function tick(dt,t){if(st.end)return;st.t+=dt;const T=st.t,U=WL.userData;
    if(T<2.4){const u=ss(0,2.2,T),a=hi.clone().lerp(hover,u);a.y+=Math.sin(u*PI)*1.2;a.x+=-fz*Math.sin(u*PI)*1.5;a.z+=fx*Math.sin(u*PI)*1.5;head.copy(a);if(T>2.2){const w=(T-2.2)*3;head.x+=Math.cos(w)*.25;head.z+=Math.sin(w)*.25;}}
    else if(T<3.3){const w=(T-2.2)*3;head.copy(hover);head.x+=Math.cos(w)*.25*(1-ss(2.4,3.2,T));head.z+=Math.sin(w)*.25*(1-ss(2.4,3.2,T));head.y+=Math.sin(T*3)*.06;
      if(st.phase==='come'){st.phase='grab';U.action='꼬리 잡기';U.at=0;if(U.setExpr)U.setExpr('반짝 신남');WL.rotation.y=Math.atan2(hover.x-P.x,hover.z-P.z);st.face=WL.rotation.y;}}
    else if(T<3.75){if(st.phase!=='pull'){st.phase='pull';G.sound.sfx('event-whoosh',{gain:.85});}head.copy(hover);head.y+=ss(3.3,3.75,T)*.55;}
    else{if(st.phase!=='fly'){st.phase='fly';st.liftT=T;G.travel.depart();S.v+=2.2;lastH.copy(head);}
      const u=Math.min(1,(T-3.75)/FLY),p=o.path(u);head.set(p.x,p.y,p.z);
      if(o.onFly)o.onFly(u);if(!st.wave&&u>.12){st.wave=true;if(o.onWave)o.onWave(true);}
      G.travel.tick(dt,'fly'); // 잔잔한 바람 + 꼬리 반짝이(작게)
      if(u>=1&&!st.end){st.end=true;if(o.onEnd)o.onEnd();}}
    // 몸 늘어남: 당기는 동안 1.38까지, 끌려 올라가면 1로(넘쳤다 돌아옴)
    S.step(dt,st.phase==='pull'?1.38:1);
    // 원더룹 자리: 땅(당기기 전까지) → 머리 아래 매달림(늦게 따라오며 흔들림)
    if(st.phase==='fly'){if(dt>0)vel.lerp(_v.copy(head).sub(lastH).divideScalar(Math.max(dt,1e-3)),1-Math.exp(-dt*3));lastH.copy(head);
      const hv=Math.hypot(vel.x,vel.z);if(hv>.3)st.face+=Math.atan2(Math.sin(Math.atan2(vel.x,vel.z)-st.face),Math.cos(Math.atan2(vel.x,vel.z)-st.face))*Math.min(1,dt*2);
      const fx2=Math.sin(st.face),fz2=Math.cos(st.face),sw=Math.sin(T*1.7)*.18;
      hangV.set(head.x-fx2*1.9+fz2*sw,head.y-2.45-.58*(S.x-1),head.z-fz2*1.9-fx2*sw);if(!t0){t0=1;}
      const ly=Math.min(1,(T-st.liftT)/.35);wp.lerp(hangV,ly<1?ly*ly:1-Math.exp(-dt*7));}
    WL.position.copy(wp);U.riding.y=wp.y;st.sx=S.x;st.hy=head.y;st.wy=wp.y;
    M.tick(dt,t,{emit:st.phase==='fly'?(o.mob?32:60):st.phase==='come'?(o.mob?14:24):6});}
  const _v=new THREE.Vector3();
  /* 07 뒤(구역 lateUpdate): 원더룹 자세·늘어남 → 손 자리 → 꼬리 끝 */
  function late(dt,t){if(!M)return;const T=st.t;
    if(st.phase==='fly'){WL.rotation.y=st.face;WL.rotation.z=Math.sin(T*1.7)*.07;WL.rotation.x=Math.sin(T*1.1)*.05;}
    applySquish(WL,S.x);handsMid(WL,mid);
    /* 꼬리: 손(가슴 앞)에서 앞으로 나가 위로 — 약 2등신이라 손을 머리 위로 못 올려, 꼬리가 위에서 곧게 내려오면 얼굴·탈을 지나간다.
       잡기 전 꼬리 끝은 손 앞 0.6m에 떠 있다가 0.45초에 걸쳐 손으로 */
    const grabK=st.phase==='come'?0:ss(0,.45,T-2.4),f1=Math.sin(st.face),f2=Math.cos(st.face);
    endP.set(mid.x+f1*.6,mid.y+.1,mid.z+f2*.6).lerp(mid,grabK);
    ctrl.set(endP.x+f1*1.05,endP.y+.2+Math.sin(t*2.3)*.06,endP.z+f2*1.05);
    st.endP=endP;st.head=head;    M.g.position.copy(head);M.setTail(head,endP,ctrl,t);SC.tick(t,st.phase==='fly',1);
    /* 기본 각도(손을 뗀 지 1.6초 뒤 이쪽으로 — 2026-11-09 다듬기: 등 뒤 위만 보면 초록 탈만 보이고 휴대폰에선 꼬리가 탈에 붙은 풍선 같았다):
       내려와 잡을 때까지 옆 앞 → 끌려 올라간 직후 앞옆 낮게(얼굴·꼬리 잡은 손·멀어지는 달) → 마을 내려다보기(짧게) → 옆모습(목성·토성이 뒤로 스쳐 감)
       → 어깨 너머로 다가오는 화성 → 마지막 얼굴 정면(반짝 신남). 키: [비행 진행 u, 원더룹 기준 방향, 위아래, 거리] */
    {const u=st.phase==='fly'?Math.min(1,(T-st.liftT)/FLY):-1,K=CAMK;let a,p,d;
     if(u<0){a=1.15;p=.22;d=6.5;}else{let i=0;while(i<K.length-2&&u>K[i+1][0])i++;const A=K[i],B=K[i+1],w=ss(A[0],B[0],u);let dy=B[1]-A[1];dy=Math.atan2(Math.sin(dy),Math.cos(dy));a=A[1]+dy*w;p=A[2]+(B[2]-A[2])*w;d=A[3]+(B[3]-A[3])*w;}
     camHome(G,dt,st.face+a,p,d,st,2.2);}}
  function stop(){M.show(false);SC.tick(0,false);}
  function dispose(){M.dispose();M.g.removeFromParent();M.tail.removeFromParent();M.dust.pts.removeFromParent();SC.dispose();}
  function shift(k,sh){wp[k]+=sh;head[k]+=sh;lastH[k]+=sh;hover[k]+=sh;hi[k]+=sh;M.dust.shift(k,sh);}
  return {tick,late,stop,dispose,shift,state:st,meteor:M};}
/* ── 도착 ── o: {G,root,WL,groundY,mob,dust(points 붉은 먼지),onDone()} — WL은 이미 착지 자리 위(xz)에 있다 */
export function arrival(o){const {G,root,WL}=o;const M=makeMeteor(root,{mob:o.mob}),SC=makeScarf(WL),S=spring();lockOn(G,WL);const U=WL.userData;U.action='꼬리 잡기';U.at=0;if(U.setExpr)U.setExpr('반짝 신남');
  const P=WL.position.clone(),gy=o.groundY(P.x,P.z),face=WL.rotation.y,fx=Math.sin(face),fz=Math.cos(face);
  const head=new THREE.Vector3(),endP=new THREE.Vector3(),ctrl=new THREE.Vector3(),mid=new THREE.Vector3(),away=new THREE.Vector3(fx*9,7,fz*9);
  const st={t:0,phase:'down',y:gy+6,vy:0,bounce:0,cu:null,idle:9,done:false,rel:null};
  /* 내려오는 동안(먼지구름이 걷히는 때부터 착지까지): 앞옆 3/4 조금 위에서 — 내려오는 얼굴과 화성 땅이 함께(2026-11-09 다시: 예전엔 비행 끝 카메라를 이어 받고 1.6초를 기다려 등 뒤 탈만 보였다).
     화면이 덮인 동안 그 각도로 바로 놓고(riding.snap), 착지 뒤에는 리액션 각도(아래 late)로 천천히 */
  const DOWN=[face+.85,.38,6.2];{const C=G.controls.input.cam;if(C){C.yaw=DOWN[0];C.pitch=DOWN[1];C.dist=DOWN[2];st.cu=C.user;}U.riding.snap=true;}
  const G2=3.7; // 화성 중력(지구의 약 38%) m/초²
  function puff(n,sp){const x=WL.position.x,z=WL.position.z;for(let i=0;i<n;i++){const a=Math.random()*PI*2,r=Math.random()*.35,v=sp*(.5+Math.random()*.7);
    o.dust.emit(x+Math.cos(a)*r,gy+.05,z+Math.sin(a)*r,Math.cos(a)*v,.35+Math.random()*.6,Math.sin(a)*v,1.4+Math.random()*1.2,Math.random()<.5?[.86,.58,.46]:[.93,.7,.56]);}}
  function land(k,first){S.v-=k;puff(o.mob?16:28,1.2*Math.min(1,k/5));G.sound.sfx('land',{gain:first?1.3:1});G.sound.sfx('event-pop',{gain:first?1.15:.6});G.sound.sfx('event-dust',{gain:first?1.2:1});}
  G.sound.sfx('event-sparkle');
  function tick(dt,t){if(st.done)return;st.t+=dt;const T=st.t;
    if(st.phase==='down'){const u=ss(0,1.8,T);head.set(P.x+fx*1.9,gy+11-5*u+Math.sin(T*3)*.08,P.z+fz*1.9);st.y=head.y-2.45;
      if(T>=1.9){st.phase='fall';st.vy=0;U.action='서기';U.at=0;G.sound.sfx('event-whoosh',{gain:.8});st.rel=head.clone();G.react.react('startle',{sound:null});G.travel.landIn(Math.sqrt(2*Math.max(0,st.y-gy)/G2));} /* 놓아준 순간 착지 시각을 알림 → 이동 테마 해결 화음이 착지에 */}
    else{if(st.rel){const k=T-1.9;head.copy(st.rel).addScaledVector(away,k*(.5+k*.6));if(k>3){M.show(false);}}
      if(st.phase==='fall'||st.phase==='hop'){st.vy-=G2*dt;st.y+=st.vy*dt;if(st.y<=gy){st.y=gy;const v=-st.vy;
          if(st.bounce===0){st.bounce=1;st.phase='hop';st.vy=2.5;land(v*1.6,true);st.landT=T;G.travel.mark('land');}else if(st.bounce===1){st.bounce=2;st.vy=1.05;land(v*1.3);}else{st.phase='stand';st.standT=T;land(v);}}}
      if(st.phase==='stand'){const k=T-st.standT;
        if(k>.9&&!st.r1){st.r1=1;G.react.react('startle');}
        if(k>2.1&&!st.r2){st.r2=1;G.react.react('tilt');}
        if(k>3.5&&!st.r3){st.r3=1;U.action='두리번';U.at=0;}
        if(k>5.6){st.done=true;U.action='서기';U.at=0;M.show(false);SC.tick(0,false);lockOff(G,WL);G.travel.end();if(o.onDone)o.onDone();}}}
    WL.position.y=st.y;U.riding&&(U.riding.y=st.y);
    M.tick(dt,t,{emit:st.phase==='down'?(o.mob?20:36):(st.rel&&T-1.9<2.5?(o.mob?14:26):0)});}
  function late(dt,t){if(st.done)return;const T=st.t;applySquish(WL,S.step(dt,1,180,8));handsMid(WL,mid);
    if(st.phase==='down'){endP.copy(mid);WL.rotation.z=Math.sin(T*1.7)*.06;ctrl.set(mid.x+fx*1.05,mid.y+.2,mid.z+fz*1.05);}
    else{endP.copy(head);endP.y-=1.9;endP.x-=fx*1.2;endP.z-=fz*1.2;ctrl.copy(head).lerp(endP,.5);ctrl.y+=.3;} /* 놓아준 뒤: 꼬리가 별똥별을 따라감 */
    st.endP=endP;M.g.position.copy(head);M.setTail(head,endP,ctrl,t);SC.tick(t,st.phase==='down'||st.phase==='fall',st.phase==='down'?.6:1);
    if(st.phase==='down'||st.phase==='fall')camHome(G,dt,DOWN[0],DOWN[1],DOWN[2],st,2.2);else camHome(G,dt,face+.75,.28,7,st,1.6);} // 착지 뒤: 얼굴이 보이는 앞쪽 3/4(깜짝·갸웃·두리번이 보이게)
  function dispose(){M.dispose();M.g.removeFromParent();M.tail.removeFromParent();M.dust.pts.removeFromParent();SC.dispose();}
  return {tick,late,dispose,state:st};}
