/* 원더룹 — 목표 안내 (엔진 공통, 2026-11-03 — 개미굴 편 lampMark·goalG·냄새 길과 같은 모양)
   set({at:[x,z], y, label, color}) — 목표 자리에 빛 기둥 + 바닥 고리, 기둥 위쪽에 이름표(크림색 알약 글자)와 노란 세모가 통통,
     원더룹 발밑부터 목표 쪽으로 반짝이는 동그라미 길(가까운 8m만, 앞쪽이 크고 밝게 — 물결처럼 차례로 커졌다 작아짐),
     위 가운데 할 일 안내(ui.setQuest) 앞에 가야 할 쪽 화살표(카메라 기준으로 돈다). set(null)이면 모두 숨김.
     at은 함수여도 된다(움직이는 요정 등 — 매 프레임 [x,z] 또는 [x,y,z]).
   그리기: 기둥+고리 한 덩어리(정점 색 알파) 1회, 이름표+세모 스프라이트 1회, 동그라미 길 인스턴스 1회 — 모두 안내 표시(ui.hint)라 영상 캡처에는 안 나온다.
   ground(x,z): 동그라미를 놓을 땅 높이(08이 02 groundY를 넘겨준다). 구역을 떠나면 game/index가 clearGoal(). */
import * as THREE from 'three';
import {hint,hintsVisible} from './ui.js';
let ctx=null,G=null,beam=null,tag=null,dots=null,cur=null,tagKey='',arrow=null,t0=0;
const N=8,GAP=1.05,_m=new THREE.Matrix4(),_q=new THREE.Quaternion(),_s=new THREE.Vector3(),_p=new THREE.Vector3(),_up=new THREE.Vector3(0,1,0);
function initGoal(c){ctx=c;}
function geoBeam(r,h,col){const c=new THREE.Color(col),pos=[],cl=[],idx=[];const S=28,HS=6;
  for(let j=0;j<=HS;j++)for(let i=0;i<=S;i++){const a=i/S*Math.PI*2,y=j/HS*h;pos.push(Math.cos(a)*r,y,Math.sin(a)*r);const al=.34*(1-j/HS)**1.2;cl.push(c.r,c.g,c.b,al);}
  for(let j=0;j<HS;j++)for(let i=0;i<S;i++){const a=j*(S+1)+i,b=a+S+1;idx.push(a,b,a+1,b,b+1,a+1);}
  const o=pos.length/3,ri=r*.9,ro=r*1.18,w=new THREE.Color('#fff4c8'); // 바닥 고리(진하게)
  for(let i=0;i<=S;i++){const a=i/S*Math.PI*2;pos.push(Math.cos(a)*ri,.06,Math.sin(a)*ri,Math.cos(a)*ro,.06,Math.sin(a)*ro);cl.push(w.r,w.g,w.b,.85,w.r,w.g,w.b,.85);}
  for(let i=0;i<S;i++){const a=o+i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(cl,4));g.setIndex(idx);return g;}
function geoDot(){const pos=[],cl=[],idx=[],S=20,A=new THREE.Color('#5cc4b9'),B=new THREE.Color('#e9fff9');
  pos.push(0,0,0);cl.push(B.r,B.g,B.b);for(let i=0;i<=S;i++){const a=i/S*Math.PI*2;pos.push(Math.cos(a)*.11,0,Math.sin(a)*.11);cl.push(B.r,B.g,B.b);}
  for(let i=0;i<S;i++)idx.push(0,i+2,i+1);
  const o=pos.length/3;for(let i=0;i<=S;i++){const a=i/S*Math.PI*2;pos.push(Math.cos(a)*.13,0,Math.sin(a)*.13,Math.cos(a)*.24,0,Math.sin(a)*.24);cl.push(A.r,A.g,A.b,A.r,A.g,A.b);}
  for(let i=0;i<S;i++){const a=o+i*2;idx.push(a,a+2,a+1,a+1,a+2,a+3);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(cl,3));g.setIndex(idx);return g;}
function drawTag(label){const cv=document.createElement('canvas');cv.width=512;cv.height=320;const g=cv.getContext('2d');
  g.font='64px "Jua","Gowun Dodum",sans-serif';const w=Math.min(492,Math.max(220,g.measureText(label).width+90)),x=(512-w)/2;
  g.fillStyle='rgba(62,40,52,.28)';g.beginPath();g.roundRect(x+3,22,w,112,56);g.fill();
  g.fillStyle='#fff6e6';g.beginPath();g.roundRect(x,16,w,112,56);g.fill();
  g.fillStyle='#3e2834';g.textAlign='center';g.textBaseline='middle';g.fillText(label,256,74);
  g.fillStyle='#ffd23f';g.strokeStyle='#c98a1c';g.lineWidth=5;g.lineJoin='round';g.beginPath();g.moveTo(214,182);g.lineTo(298,182);g.lineTo(256,256);g.closePath();g.fill();g.stroke();
  const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;return t;}
function build(){if(G||!ctx)return;G=new THREE.Group();G.name='wl-goal';
  beam=new THREE.Mesh(geoBeam(.55,5,'#ffe7a0'),new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,depthWrite:false,side:THREE.DoubleSide,fog:false})); // 낮에도 보이게 보통 섞기(더하기 섞기는 밝은 낮에 사라졌다)
  beam.renderOrder=5;beam.frustumCulled=false;
  tag=new THREE.Sprite(new THREE.SpriteMaterial({transparent:true,depthTest:false,depthWrite:false,fog:false}));tag.scale.set(2.3,1.44,1);tag.center.set(.5,.12);tag.renderOrder=12;
  dots=new THREE.InstancedMesh(geoDot(),new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.92,depthWrite:false,fog:false}),N);dots.frustumCulled=false;dots.renderOrder=4;
  G.add(beam,tag,dots);ctx.scene.add(G);hint(G);G.visible=false;}
function set(o){build();cur=o||null;if(!G)return;G.visible=!!cur;if(!cur){setArrow(null);return;}
  if(cur.label!==tagKey){tagKey=cur.label||'';if(tag.material.map)tag.material.map.dispose();tag.material.map=drawTag(tagKey);tag.material.needsUpdate=true;tag.visible=!!tagKey;
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{if(cur&&cur.label===tagKey&&tag.material.map){tag.material.map.dispose();tag.material.map=drawTag(tagKey);}});}
  beam.material.color.set(cur.color||'#ffffff');}
const clearGoal=()=>set(null);
const where=()=>{const a=typeof cur.at==='function'?cur.at():cur.at;if(!a)return null;return a.length===3?{x:a[0],y:a[1],z:a[2]}:{x:a[0],y:null,z:a[1]};};
/* 할 일 안내 화살표: #wlQuest 맨 앞에 붙은 span — 글자를 바꿔도(setQuest) 살아남도록 매 프레임 확인 */
function setArrow(ang){const q=document.getElementById('wlQuest');if(!q)return;if(ang===null){if(arrow&&arrow.parentNode)arrow.remove();return;}
  if(!arrow){arrow=document.createElement('span');arrow.className='wl-arrow';arrow.setAttribute('aria-hidden','true');arrow.textContent='➜';}
  if(arrow.parentNode!==q&&q.textContent)q.prepend(arrow);arrow.style.transform=`rotate(${ang}rad)`;}
function tickGoal(dt){if(!G||!cur)return;const P=where(),W=ctx.WL;if(!P||!W||!hintsVisible()){G.visible=false;setArrow(null);return;}G.visible=true;t0+=dt;
  const gy=P.y??cur.y??(ctx.ground?ctx.ground(P.x,P.z):0);beam.position.set(P.x,gy,P.z);tag.position.set(P.x,gy+(cur.h||2.7)+Math.sin(t0*3)*.08,P.z);
  // 동그라미 길: 원더룹 앞 0.9m부터 목표 쪽으로 GAP마다, 목표 1.1m 앞까지(가까운 N개만)
  const w=W.position,dx=P.x-w.x,dz=P.z-w.z,L=Math.hypot(dx,dz),ux=dx/(L||1),uz=dz/(L||1);let n=0;
  for(let i=0;i<N;i++){const d=.9+i*GAP;if(d>L-1.1)break;const x=w.x+ux*d,z=w.z+uz*d,y=Math.max(ctx.ground?ctx.ground(x,z):0,-.05)+.03;
    const wave=.5+.5*Math.sin(t0*4-i*.9),s=(1-i/N*.45)*(.85+.25*wave);_p.set(x,y,z);_q.setFromAxisAngle(_up,0);_s.set(s,1,s);_m.compose(_p,_q,_s);dots.setMatrixAt(n++,_m);}
  dots.count=n;dots.instanceMatrix.needsUpdate=true;dots.visible=n>0;
  // 화살표: 카메라가 보는 쪽(앞)을 위로 — 오른쪽이면 오른쪽으로
  const cam=ctx.camera;cam.getWorldDirection(_p);_p.y=0;_p.normalize();const f=dx*_p.x+dz*_p.z,r=dx*-_p.z+dz*_p.x;
  setArrow(L<1.6?null:Math.atan2(f,r)*-1);}
export {clearGoal,initGoal,set,tickGoal};
