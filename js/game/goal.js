/* 원더룹 — 목표 안내 (엔진 공통, 2026-11-03 — 개미굴 편 lampMark·goalG·냄새 길과 같은 모양)
   set({at:[x,z], y, label, color}) — 목표 자리에 빛 기둥 + 바닥 고리, 기둥 위쪽에 이름표(크림색 알약 글자)와 노란 세모가 통통,
     원더룹 발밑부터 목표 쪽으로 반짝이는 동그라미 길(가까운 8m만, 앞쪽이 크고 밝게 — 물결처럼 차례로 커졌다 작아짐),
     위 가운데 할 일 안내(ui.setQuest) 앞에 가야 할 쪽 화살표(카메라 기준으로 돈다). set(null)이면 모두 숨김.
     at은 함수여도 된다(움직이는 요정 등 — 매 프레임 [x,z] 또는 [x,y,z]).
   그리기: 기둥+고리 한 덩어리(정점 색 알파) 1회, 이름표+세모 스프라이트 1회, 동그라미 길 인스턴스 1회 — 모두 안내 표시(ui.hint)라 영상 캡처에는 안 나온다.
   style:'ant'(2026-11-04, 시리즈 공통 첫 미션 — 개미굴 lampMark·냄새 길 그대로): 민트 빛기둥(반지름 1.1·높이 7, #8ff0e2) + 민트 고리(#bff7ee),
     동그라미 길은 원더룹 발밑부터 목표 앞까지 1.15m마다 끝까지(최대 30개, 바깥 #2fb8ab 0.27·안 #eafffb 0.13, 앞에서부터 물결처럼 커짐 0.85~1.4배, 처음 셋은 작게 나타남).
   ground(x,z): 동그라미를 놓을 땅 높이(08이 02 groundY를 넘겨준다). 구역을 떠나면 game/index가 clearGoal(). */
import * as THREE from 'three';
import {hint,hintsVisible} from './ui.js';
let tagA=1,ctx=null,G=null,beam=null,tag=null,dots=null,beamA=null,dotsA=null,cur=null,tagKey='',arrow=null,t0=0;
const N=8,GAP=1.05,NA=30,GAPA=1.15,_m=new THREE.Matrix4(),_q=new THREE.Quaternion(),_s=new THREE.Vector3(),_p=new THREE.Vector3(),_up=new THREE.Vector3(0,1,0);
function initGoal(c){ctx=c;}
function geoBeam(r,h,col,ringCol='#fff4c8'){const c=new THREE.Color(col),pos=[],cl=[],idx=[];const S=28,HS=6;
  for(let j=0;j<=HS;j++)for(let i=0;i<=S;i++){const a=i/S*Math.PI*2,y=j/HS*h;pos.push(Math.cos(a)*r,y,Math.sin(a)*r);const al=.34*(1-j/HS)**1.2;cl.push(c.r,c.g,c.b,al);}
  for(let j=0;j<HS;j++)for(let i=0;i<S;i++){const a=j*(S+1)+i,b=a+S+1;idx.push(a,b,a+1,b,b+1,a+1);}
  const o=pos.length/3,ri=r*.9,ro=r*1.18,w=new THREE.Color(ringCol); // 바닥 고리(진하게)
  for(let i=0;i<=S;i++){const a=i/S*Math.PI*2;pos.push(Math.cos(a)*ri,.06,Math.sin(a)*ri,Math.cos(a)*ro,.06,Math.sin(a)*ro);cl.push(w.r,w.g,w.b,.85,w.r,w.g,w.b,.85);}
  for(let i=0;i<S;i++){const a=o+i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(cl,4));g.setIndex(idx);return g;}
function geoDot(ant=false){const pos=[],cl=[],idx=[],S=20,A=new THREE.Color(ant?'#2fb8ab':'#5cc4b9'),B=new THREE.Color(ant?'#eafffb':'#e9fff9'),ri=ant?.13:.11,r1=ant?.13:.13,r2=ant?.27:.24;
  pos.push(0,0,0);cl.push(B.r,B.g,B.b);for(let i=0;i<=S;i++){const a=i/S*Math.PI*2;pos.push(Math.cos(a)*ri,0,Math.sin(a)*ri);cl.push(B.r,B.g,B.b);}
  for(let i=0;i<S;i++)idx.push(0,i+2,i+1);
  const o=pos.length/3;for(let i=0;i<=S;i++){const a=i/S*Math.PI*2;pos.push(Math.cos(a)*r1,0,Math.sin(a)*r1,Math.cos(a)*r2,0,Math.sin(a)*r2);cl.push(A.r,A.g,A.b,A.r,A.g,A.b);}
  for(let i=0;i<S;i++){const a=o+i*2;idx.push(a,a+2,a+1,a+1,a+2,a+3);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(cl,3));g.setIndex(idx);return g;}
/* 이름표 상자는 글자 길이에 맞춰 늘어난다(2026-11-13 — 예전엔 492에서 잘려 긴 이름표 글자가 상자 밖으로 잘렸다): 캔버스 폭도 함께 늘리고 스프라이트 가로 배율 tagW로 */
let tagW=1;
function drawTag(label){const cv=document.createElement('canvas');cv.width=512;cv.height=320;let g=cv.getContext('2d');
  g.font='64px "Jua","Gowun Dodum",sans-serif';const w=Math.max(220,Math.ceil(g.measureText(label).width)+90),CW=Math.max(512,w+20),x=(CW-w)/2,cx=CW/2;cv.width=CW;g=cv.getContext('2d');g.font='64px "Jua","Gowun Dodum",sans-serif';tagW=CW/512;
  g.fillStyle='rgba(62,40,52,.28)';g.beginPath();g.roundRect(x+3,22,w,112,56);g.fill();
  g.fillStyle='#fff6e6';g.beginPath();g.roundRect(x,16,w,112,56);g.fill();
  g.fillStyle='#3e2834';g.textAlign='center';g.textBaseline='middle';g.fillText(label,cx,74);
  g.fillStyle='#ffd23f';g.strokeStyle='#c98a1c';g.lineWidth=5;g.lineJoin='round';g.beginPath();g.moveTo(cx-42,182);g.lineTo(cx+42,182);g.lineTo(cx,256);g.closePath();g.fill();g.stroke();
  const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;return t;}
function build(){if(G||!ctx)return;G=new THREE.Group();G.name='wl-goal';
  beam=new THREE.Mesh(geoBeam(.55,5,'#ffe7a0'),new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,depthWrite:false,side:THREE.DoubleSide,fog:false})); // 낮에도 보이게 보통 섞기(더하기 섞기는 밝은 낮에 사라졌다)
  beam.renderOrder=5;beam.frustumCulled=false;
  tag=new THREE.Sprite(new THREE.SpriteMaterial({transparent:true,depthTest:false,depthWrite:false,fog:false}));tag.scale.set(2.3,1.44,1);tag.center.set(.5,.12);tag.renderOrder=12;
  dots=new THREE.InstancedMesh(geoDot(),new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.92,depthWrite:false,fog:false}),N);dots.frustumCulled=false;dots.renderOrder=4;
  beamA=new THREE.Mesh(geoBeam(1.1,7,'#8ff0e2','#bff7ee'),beam.material.clone());beamA.renderOrder=5;beamA.frustumCulled=false;beamA.material.color.set('#ffffff');
  dotsA=new THREE.InstancedMesh(geoDot(true),dots.material.clone(),NA);dotsA.frustumCulled=false;dotsA.renderOrder=4;
  G.add(beam,tag,dots,beamA,dotsA);ctx.scene.add(G);hint(G);G.visible=false;}
function set(o){build();cur=o||null;if(!G)return;G.visible=!!cur;if(!cur){setArrow(null);return;}
  if(cur.label!==tagKey){tagKey=cur.label||'';if(tag.material.map)tag.material.map.dispose();tag.material.map=drawTag(tagKey);tag.material.needsUpdate=true;tag.visible=!!tagKey;
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{if(cur&&cur.label===tagKey&&tag.material.map){tag.material.map.dispose();tag.material.map=drawTag(tagKey);}});}
  const ant=cur.style==='ant';beam.visible=dots.visible=!ant;beamA.visible=dotsA.visible=ant;
  beam.material.color.set(cur.color||'#ffffff');}
const clearGoal=()=>set(null);
const where=()=>{const a=typeof cur.at==='function'?cur.at():cur.at;if(!a)return null;return a.length===3?{x:a[0],y:a[1],z:a[2]}:{x:a[0],y:null,z:a[1]};};
/* 할 일 안내 화살표: #wlQuest 맨 앞에 붙은 span — 글자를 바꿔도(setQuest) 살아남도록 매 프레임 확인 */
function setArrow(ang){const q=document.getElementById('wlQuest');if(!q)return;if(ang===null){if(arrow&&arrow.parentNode)arrow.remove();return;}
  if(!arrow){arrow=document.createElement('span');arrow.className='wl-arrow';arrow.setAttribute('aria-hidden','true');arrow.textContent='➜';}
  if(arrow.parentNode!==q&&q.textContent)q.prepend(arrow);arrow.style.transform=`rotate(${ang}rad)`;}
/* 이름표가 화면 위 안내 글(할 일 안내·가방·메뉴·안내 문구)과 겹치면 기둥을 따라 아래로 비켜 내림(2026-11-04 — 개미굴 원본에서 '버섯 랜턴' 이름표와 할 일 안내가 겹쳐 잘렸다). 기둥 밑동 1.2m 위보다 낮게는 안 내린다 */
const _v=new THREE.Vector3(),_b=new THREE.Vector3();let tagDrop=0;
function hudRects(){const R=[];for(const id of ['wlQuest','wlItems','wlMenu','wlToast','wlPrompt']){const e=document.getElementById(id);if(!e||!e.offsetParent&&getComputedStyle(e).position!=='fixed')continue;const r=e.getBoundingClientRect();if(r.width>2&&r.height>2&&getComputedStyle(e).visibility!=='hidden'&&+getComputedStyle(e).opacity>.05)R.push(r);}return R;}
function avoidHud(gy,dt){const cam=ctx.camera;if(!cam||!cam.isPerspectiveCamera){tagDrop=0;return;}const W=innerWidth,H=innerHeight;
  const base=tag.position.y;_v.copy(tag.position);_v.y+=tag.scale.y*(1-tag.center.y);_v.project(cam);if(_v.z>1){tagDrop=0;return;}
  const depth=cam.position.distanceTo(tag.position),ppm=H/(2*Math.tan(cam.fov*Math.PI/360)*depth),top=(1-_v.y)/2*H,cx=(_v.x+1)/2*W,hw=tag.scale.x*.5*ppm*.75;
  let need=0;for(const r of hudRects()){if(cx+hw<r.left||cx-hw>r.right||top>r.bottom+6||top+tag.scale.y*ppm<r.top)continue;need=Math.max(need,(r.bottom+8-top)/ppm);}
  need=Math.min(need,Math.max(0,base-gy-1.2));tagDrop+=(need-tagDrop)*Math.min(1,dt*6);tag.position.y=base-tagDrop;}
function tickGoal(dt){if(!G||!cur)return;const P=where(),W=ctx.WL;if(!P||!W||!hintsVisible()){G.visible=false;setArrow(null);return;}G.visible=true;t0+=dt;
  const gy=P.y??cur.y??(ctx.ground?ctx.ground(P.x,P.z):0);beam.position.set(P.x,gy,P.z);beamA.position.set(P.x,gy,P.z);tag.position.set(P.x,gy+(cur.h||2.7)+Math.sin(t0*3)*.08,P.z);
  /* 이름표·노란 세모 크기 상한(2026-11-07 — 카메라 가까이 오면 화면을 크게 가렸다): 화면 높이의 11%(최대 96px)보다 커지지 않게 줄이고,
     원더룹이 목표 1.6m 안이면 0.3초에 걸쳐 숨김(2.6m부터 옅어짐) */
  {const cam=ctx.camera;let k=1;if(cam&&cam.isPerspectiveCamera){const depth=Math.max(.1,cam.position.distanceTo(tag.position)),ppm=innerHeight/(2*Math.tan(cam.fov*Math.PI/360)*depth),cap=Math.min(96,innerHeight*.11);k=Math.min(1,cap/(1.44*ppm),(innerWidth-16)/(2.3*tagW*ppm));} /* 화면 폭보다 넓어지지도 않게 */
   tag.scale.set(2.3*k*tagW,1.44*k,1);const W0=ctx.WL,dl=W0?Math.hypot(P.x-W0.position.x,P.z-W0.position.z):9,want=Math.min(1,Math.max(0,(dl-1.6)/1));
   tagA+=(want-tagA)*Math.min(1,dt*6);tag.material.opacity=tagA;}
  avoidHud(gy,dt);
  /* 화면 가장자리에 걸리면 안쪽으로 밀어 넣음(2026-11-13 — 모든 세계 공통: 휴대폰에서 '먼지 회오리' 이름표가 화면 끝에서 잘렸다): 화면에서 좌우 8px 안에 들도록 카메라 오른쪽 방향으로 옮김 */
  /* 카메라 공간에서 옮김(화면 좌표로 미터를 어림하면 화면 옆쪽 멀리서 넘쳐 반대편으로 튀었다): 이름표 일부가 화면 밖에 걸릴 때만 — 아예 화면 밖이면 그대로 */
  /* 순서: 먼저 위아래(빛기둥이 높아 화면 위로 넘어가면 기둥을 따라 내려 위쪽 칩들 아래로 — 바닥 고리 0.55m 위까지, 기둥 밑동이 화면 안일 때만), 그다음 좌우(내린 높이에서 재야 한다 — 높은 자리에서 재면 '화면 밖'으로 보여 안 밀었다) */
  {const cam=ctx.camera;if(cam&&cam.isPerspectiveCamera){const tf=Math.tan(cam.fov*Math.PI/360),W2=innerWidth/2,up=cam.matrixWorld.elements[5];
    _b.set(P.x,gy,P.z).applyMatrix4(cam.matrixWorldInverse);const bd=-_b.z,bOn=bd>cam.near&&Math.abs(_b.y)<bd*tf&&Math.abs(_b.x)<bd*tf*cam.aspect*1.15;
    _v.copy(tag.position).applyMatrix4(cam.matrixWorldInverse);let depth=-_v.z;
    if(bOn&&up>.2&&depth>cam.near+.2){const half=depth*tf*cam.aspect,hv=depth*tf,hw=tag.scale.x*.5,cxp=W2+Math.max(-1,Math.min(1,_v.x/half))*W2,hwp=hw/half*W2;let topPx=64;
      for(const r of hudRects())if(!(cxp+hwp<r.left||cxp-hwp>r.right)&&r.top<innerHeight*.3)topPx=Math.max(topPx,r.bottom+8);
      const limV=hv*(1-2*topPx/innerHeight),over=_v.y+tag.scale.y*.88-limV;if(over>0)tag.position.y=Math.max(gy+.55,tag.position.y-over/up);}
    _v.copy(tag.position).applyMatrix4(cam.matrixWorldInverse);depth=-_v.z;
    if(depth>cam.near+.2){const half=depth*tf*cam.aspect,hw=tag.scale.x*.5,lim=half*(1-16/innerWidth)-hw,ax=Math.abs(_v.x);
      if(lim>0&&ax>lim&&ax<half+hw){_v.x=Math.sign(_v.x)*lim;tag.position.copy(_v.applyMatrix4(cam.matrixWorld));}}}}
  // 동그라미 길: 원더룹 앞 0.9m부터 목표 쪽으로 GAP마다, 목표 1.1m 앞까지(가까운 N개만)
  const w=W.position,dx=P.x-w.x,dz=P.z-w.z,L=Math.hypot(dx,dz),ux=dx/(L||1),uz=dz/(L||1);let n=0;
  for(let i=0;i<N;i++){const d=.9+i*GAP;if(d>L-1.1)break;const x=w.x+ux*d,z=w.z+uz*d,y=Math.max(ctx.ground?ctx.ground(x,z):0,-.05)+.03;
    const wave=.5+.5*Math.sin(t0*4-i*.9),s=(1-i/N*.45)*(.85+.25*wave);_p.set(x,y,z);_q.setFromAxisAngle(_up,0);_s.set(s,1,s);_m.compose(_p,_q,_s);dots.setMatrixAt(n++,_m);}
  if(cur.style==='ant'){n=0;let k=0;for(let d=1.1;k<NA;d+=GAPA,k++){if(d>L-.9)break;const x=w.x+ux*d,z=w.z+uz*d,y=Math.max(ctx.ground?ctx.ground(x,z):0,-.05)+.06;
      const wv=Math.max(0,Math.sin(k*.55-t0*5)),s=(.85+wv*.55)*Math.min(1,(k+1)/3);_p.set(x,y,z);_q.setFromAxisAngle(_up,0);_s.set(s,1,s);_m.compose(_p,_q,_s);dotsA.setMatrixAt(n++,_m);}
    dotsA.count=n;dotsA.instanceMatrix.needsUpdate=true;dotsA.visible=n>0;dots.visible=false;}
  else{dots.count=n;dots.instanceMatrix.needsUpdate=true;dots.visible=n>0;}
  // 화살표: 카메라가 보는 쪽(앞)을 위로 — 오른쪽이면 오른쪽으로
  const cam=ctx.camera;cam.getWorldDirection(_p);_p.y=0;_p.normalize();const f=dx*_p.x+dz*_p.z,r=dx*-_p.z+dz*_p.x;
  setArrow(L<1.6?null:Math.atan2(f,r)*-1);}
export {clearGoal,initGoal,set,tickGoal};
