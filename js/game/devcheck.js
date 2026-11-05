/* 원더룹 — 시험 메뉴(톱니, ?debug) 세계 만들기 도구 (2026-11-04, 공통 틀 4단계 — docs/series-rules.md "공간 크기"·"경계"·"크기 규칙"을 눈으로 확인)
   ㉠ 경계 보기: 지금 구역 걷기 판정(02 blocked)을 0.2m 칸으로 훑어 바닥에 색으로 겹친다 — 걸을 수 있는 곳 연두, 경계(막힌 곳과 맞닿은 칸) 노랑, 막힌 곳 빨강.
      땅 높이를 따라 1m 칸 판에 붙인다(야외 언덕도). 그림만 겹칠 뿐 걷기·카메라는 그대로.
   ㉡ 걷는 시간 재기: 켜면 바닥 두 곳을 차례로 누른다 → 직선 거리와 장애물을 돌아가는 길(0.25m 칸 A* — 원더룹이 실제로 지나갈 수 있는 칸)을 그리고,
      원더룹 걸음(07 DRV.walk, 게임 3.15m/초)으로 몇 초인지 보여 준다. 세 번째 누르면 새로 시작.
   ㉢ 크기 확인: 지금 구역의 주민·생물(대화 상대 NPC + 구역이 userData.wlCreature='이름'을 붙인 물체)의 키를 원더룹 키(탈 더듬이를 뺀 머리 꼭대기까지 = 1) 대비 비율로 목록 —
      0.6보다 작거나 1.5보다 크면 '!' 표시. 배경·건물·식물 같은 공간 요소는 넣지 않는다(이름표를 붙이지 않으니 저절로 빠짐).
   ㉣ 굴러가는 물건 시험(2026-11-05, game/incident): 원더룹 앞에 바구니 하나와 공 셋 — 바구니가 덜컹(event-clunk) 하며 사건 순간 카메라(show, 1.1초)가 비추고,
      공이 서로 다른 쪽으로 천천히 굴러간다(scatter). 걸어가 닿으면 톡 하고 바구니로. 다 모으면 반짝임 + 2초 뒤 치움. 다시 누르면 처음부터.
   08이 initDevcheck({scene, camera, renderer, WL, blocked, groundY, walk:()=>[걷기, 대쉬], zone:()=>지금 구역}) — 촬영 모드에서는 부르지 않는다. 시험 도구 window.wlDev. */
import * as THREE from 'three';
import {npcList} from './dialog.js';
import {scatter,show} from './incident.js';
import {toast} from './ui.js';
import {sfx} from './sound.js';
let C=null,panel=null,overlay=null,meas=null,measOn=false,pts=[],line=null,marks=[];
const CELL=.2;
function initDevcheck(c){C=c;}
function box(){if(!panel){panel=document.createElement('div');panel.id='wlDev';panel.setAttribute('aria-live','polite');
  panel.style.cssText='position:fixed;right:calc(12px + env(safe-area-inset-right,0px));top:calc(56px + env(safe-area-inset-top,0px));z-index:16;max-width:min(22rem,calc(100vw - 24px));background:rgba(30,18,30,.82);color:#fff4e4;font:13px/1.5 "Gowun Dodum",sans-serif;border-radius:12px;padding:.6rem .8rem;white-space:pre-wrap;pointer-events:none';
  document.body.appendChild(panel);}return panel;}
function showPanel(){const parts=[];if(overlay)parts.push(overlay.userData.text);if(measOn)parts.push(meas||'걷는 시간 재기: 바닥 두 곳을 차례로 눌러요');if(sizeText)parts.push(sizeText);
  const p=box();p.textContent=parts.join('\n\n');p.style.display=parts.length?'block':'none';}
const Z=()=>C.zone();
function extent(){const z=Z();let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const k in z.areas){const b=z.areas[k].bounds;if(!b)continue;x0=Math.min(x0,b[0]);x1=Math.max(x1,b[1]);z0=Math.min(z0,b[2]);z1=Math.max(z1,b[3]);}
  if(x0>x1){x0=z0=-30;x1=z1=30;}const m=1.5;return [x0-m,x1+m,z0-m,z1+m];}
/* ㉠ 경계 보기 */
function toggleBounds(on=!overlay){if(overlay){overlay.removeFromParent();overlay.geometry.dispose();overlay.material.map.dispose();overlay.material.dispose();overlay=null;}
  if(on){const [x0,x1,z0,z1]=extent(),nx=Math.ceil((x1-x0)/CELL),nz=Math.ceil((z1-z0)/CELL),B=C.blocked;
    const open=new Uint8Array(nx*nz);let n=0;for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=x0+(i+.5)*CELL,z=z0+(j+.5)*CELL;if(!B(x,z)){open[j*nx+i]=1;n++;}}
    const cv=document.createElement('canvas');cv.width=nx;cv.height=nz;const g=cv.getContext('2d'),im=g.createImageData(nx,nz);let edge=0;
    for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const o=open[j*nx+i],k=(j*nx+i)*4;let e=false;
      if(o)for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const ii=i+a,jj=j+b;if(ii<0||jj<0||ii>=nx||jj>=nz||!open[jj*nx+ii]){e=true;break;}}
      if(e)edge++;const c=o?(e?[255,214,64,200]:[110,220,120,110]):[230,70,70,90];im.data.set(c,k);}
    g.putImageData(im,0,0);const tx=new THREE.CanvasTexture(cv);tx.magFilter=THREE.NearestFilter;tx.minFilter=THREE.NearestFilter;tx.colorSpace=THREE.SRGBColorSpace;
    const w=nx*CELL,h=nz*CELL,geo=new THREE.PlaneGeometry(w,h,Math.ceil(w),Math.ceil(h));geo.rotateX(-Math.PI/2);
    const P=geo.attributes.position;for(let i=0;i<P.count;i++){const x=P.getX(i)+x0+w/2,z=P.getZ(i)+z0+h/2;P.setXYZ(i,x,(C.groundY(x,z)||0)+.04,z);}geo.computeBoundingSphere();
    overlay=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false,fog:false,polygonOffset:true,polygonOffsetFactor:-2}));overlay.renderOrder=6;overlay.frustumCulled=false;
    const area=(n*CELL*CELL).toFixed(1),[wk]=C.walk();
    overlay.userData.text=`경계 보기 — 연두 걸을 수 있음 · 노랑 경계 · 빨강 막힘\n걸을 수 있는 넓이 ${area}㎡, 바깥 상자 ${(x1-x0-3).toFixed(1)}×${(z1-z0-3).toFixed(1)}m (긴 쪽 끝에서 끝까지 걸음으로 약 ${(Math.max(x1-x0,z1-z0)-3)/wk|0}초)`;
    C.scene.add(overlay);}
  showPanel();return !!overlay;}
/* ㉡ 걷는 시간 재기 */
function path(a,b){const [x0,x1,z0,z1]=extent(),G=.25,nx=Math.ceil((x1-x0)/G),nz=Math.ceil((z1-z0)/G),B=C.blocked;
  const id=(x,z)=>{const i=Math.floor((x-x0)/G),j=Math.floor((z-z0)/G);return i<0||j<0||i>=nx||j>=nz?-1:j*nx+i;},cx=k=>x0+(k%nx+.5)*G,cz=k=>z0+((k/nx|0)+.5)*G;
  const s=id(a.x,a.z),t=id(b.x,b.z);if(s<0||t<0)return null;const ok=new Int8Array(nx*nz).fill(-1),free=k=>{if(ok[k]<0)ok[k]=B(cx(k),cz(k))?0:1;return ok[k]===1;};
  if(!free(t))return null;const gs=new Float32Array(nx*nz).fill(1e9),from=new Int32Array(nx*nz).fill(-1),open=[s];gs[s]=0;const H=k=>Math.hypot(cx(k)-cx(t),cz(k)-cz(t));
  const D=[[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.414],[1,-1,1.414],[-1,1,1.414],[-1,-1,1.414]];let it=0;
  while(open.length&&it++<200000){let bi=0;for(let q=1;q<open.length;q++)if(gs[open[q]]+H(open[q])<gs[open[bi]]+H(open[bi]))bi=q;const k=open.splice(bi,1)[0];if(k===t)break;
    const i=k%nx,j=k/nx|0;for(const [a2,b2,c2] of D){const ii=i+a2,jj=j+b2;if(ii<0||jj<0||ii>=nx||jj>=nz)continue;const q=jj*nx+ii;if(!free(q))continue;
      if(a2&&b2&&(!free(j*nx+ii)||!free(jj*nx+i)))continue;const ng=gs[k]+c2*G;if(ng<gs[q]){if(gs[q]>=1e9)open.push(q);gs[q]=ng;from[q]=k;}}}
  if(from[t]<0&&s!==t)return null;const out=[];for(let k=t;k>=0;k=from[k]){out.push(new THREE.Vector3(cx(k),0,cz(k)));if(k===s)break;}out.reverse();out[0].set(a.x,0,a.z);out[out.length-1].set(b.x,0,b.z);
  return out;}
function clearMeas(){if(line){line.removeFromParent();line.geometry.dispose();line.material.dispose();line=null;}marks.forEach(m=>{m.removeFromParent();m.geometry.dispose();m.material.dispose();});marks=[];}
function mark(p,col){const m=new THREE.Mesh(new THREE.RingGeometry(.18,.3,24),new THREE.MeshBasicMaterial({color:col,depthTest:false,fog:false,side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.set(p.x,(C.groundY(p.x,p.z)||0)+.06,p.z);m.renderOrder=20;C.scene.add(m);marks.push(m);}
const _ray=new THREE.Raycaster(),_v=new THREE.Vector2(),_pl=new THREE.Plane(new THREE.Vector3(0,1,0),0),_hit=new THREE.Vector3();
function pick(e){if(!measOn||e.target!==C.renderer.domElement)return;e.stopImmediatePropagation();e.preventDefault();const r=C.renderer.domElement.getBoundingClientRect();
  _v.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);_ray.setFromCamera(_v,C.camera);_pl.constant=-(C.WL.position.y||0);if(!_ray.ray.intersectPlane(_pl,_hit))return;
  measure({x:_hit.x,z:_hit.z});}
function measure(p){if(pts.length>=2){pts=[];clearMeas();}pts.push(p);mark(p,pts.length===1?'#7fe6d8':'#ffd46a');
  if(pts.length===2){const [a,b]=pts,st=Math.hypot(b.x-a.x,b.z-a.z),P=path(a,b),[wk,rn]=C.walk();let L=null;
    if(P){L=0;for(let i=1;i<P.length;i++)L+=P[i].distanceTo(P[i-1]);const pos=P.map(v=>new THREE.Vector3(v.x,(C.groundY(v.x,v.z)||0)+.08,v.z));
      line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pos),new THREE.LineBasicMaterial({color:'#ffd46a',depthTest:false,fog:false}));line.renderOrder=20;C.scene.add(line);}
    meas=`걷는 시간 재기\n직선 ${st.toFixed(1)}m`+(L!=null?` · 돌아가는 길 ${L.toFixed(1)}m\n걷기 ${(L/wk).toFixed(1)}초 (원더룹 걸음 ${wk}m/초)`:'\n그 자리까지 걸어서 갈 수 없어요(막힌 곳)');}
  else meas='걷는 시간 재기: 두 번째 곳을 눌러요';showPanel();return meas;}
function toggleMeasure(on=!measOn){measOn=on;pts=[];clearMeas();meas=null;const el=C.renderer.domElement;
  if(on){el.addEventListener('pointerdown',pick,true);el.addEventListener('click',stopClick,true);}else{el.removeEventListener('pointerdown',pick,true);el.removeEventListener('click',stopClick,true);}showPanel();return measOn;}
function stopClick(e){if(measOn){e.stopImmediatePropagation();e.preventDefault();}}
/* ㉢ 크기 확인 */
let sizeText='';const _b=new THREE.Box3(),_t=new THREE.Box3();
function heightOf(o){_b.makeEmpty();o.updateWorldMatrix(true,true);o.traverse(c=>{if(!c.visible&&c!==o)return;if(c.isMesh&&!c.isSprite&&!c.userData.wlHint&&c.geometry){if(!c.geometry.boundingBox)c.geometry.computeBoundingBox();_t.copy(c.geometry.boundingBox).applyMatrix4(c.matrixWorld);_b.union(_t);}});
  return _b.isEmpty()?0:_b.max.y-_b.min.y;}
function wlHeight(){const W=C.WL,h=W.getObjectByName('head');if(!h)return 1.1;W.updateWorldMatrix(true,true);const p=new THREE.Vector3();h.getWorldPosition(p);
  return Math.max(.5,p.y-W.position.y+(W.userData.headTop||.42)*W.scale.y);} // 머리 뼈 + 머리 꼭대기(머리카락)까지 — 탈 더듬이는 뺌
function sizeList(){const WH=wlHeight(),seen=new Set(),L=[];
  for(const n of npcList()){if(!n.root||seen.has(n.root))continue;seen.add(n.root);L.push({name:n.name||'(이름 없음)',h:heightOf(n.root)});}
  const z=Z();if(z.root)z.root.traverse(o=>{if(o.userData&&o.userData.wlCreature&&!seen.has(o)){seen.add(o);L.push({name:o.userData.wlCreature,h:heightOf(o)});}});
  return {wl:WH,list:L.map(x=>({...x,r:x.h/WH,bad:x.h/WH<.6||x.h/WH>1.5}))};}
function toggleSize(on=!sizeText){if(!on){sizeText='';showPanel();return false;}const S=sizeList();
  sizeText=`크기 확인 — 원더룹 키 ${S.wl.toFixed(2)}m = 1 (주민·생물 0.6~1.5)\n`+(S.list.length?S.list.map(x=>`${x.bad?'! ':'  '}${x.name}  ${x.r.toFixed(2)}${x.bad?(x.r<.6?' — 너무 작아요':' — 너무 커요'):''}`).join('\n'):'이 구역에는 주민·생물이 없어요');
  showPanel();return S;}
/* ㉣ 굴러가는 물건 시험 */
let RT=null;
function endRoll(){if(!RT)return;if(RT.h)RT.h.stop();RT.g.removeFromParent();RT.g.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose();});clearTimeout(RT.tm);RT=null;}
function rollTest(){endRoll();const W=C.WL,P=W.position;let a=W.rotation.y,bx=0,bz=0;
  for(const da of [0,.6,-.6,1.2,-1.2,Math.PI]){const t=a+da,x=P.x+Math.sin(t)*1.6,z=P.z+Math.cos(t)*1.6;if(!C.blocked(x,z)&&!C.blocked(x+.4,z)&&!C.blocked(x-.4,z)&&!C.blocked(x,z+.4)&&!C.blocked(x,z-.4)){a=t;bx=x;bz=z;break;}}
  if(!bx&&!bz){toast('바구니를 놓을 빈자리가 없어요');return false;}
  const g=new THREE.Group(),y0=C.groundY(bx,bz)||0;g.position.set(bx,y0,bz);C.scene.add(g);
  const bs=new THREE.Mesh(new THREE.CylinderGeometry(.42,.32,.36,10,1,true),new THREE.MeshStandardMaterial({color:'#b98552',roughness:.9,side:THREE.DoubleSide,flatShading:true}));bs.position.y=.18;g.add(bs);
  const bt=new THREE.Mesh(new THREE.CircleGeometry(.32,10),new THREE.MeshStandardMaterial({color:'#8a5f3a',roughness:.9}));bt.rotation.x=-Math.PI/2;bt.position.y=.02;g.add(bt);
  const balls=['#e8705a','#f2c94c','#6fa8dc'].map((c,i)=>{const m=new THREE.Mesh(new THREE.IcosahedronGeometry(.22,1),new THREE.MeshStandardMaterial({color:c,roughness:.7,flatShading:true}));
    m.position.set((i-1)*.22,.42+(i===1?.12:0),i===1?-.05:.06);m.castShadow=true;g.add(m);return m;});
  RT={g,h:null,tm:0};const st=RT;let k=0;
  const away=Math.atan2(bx-P.x,bz-P.z); // 원더룹에서 바구니 쪽 = 굴러가는 쪽
  const wob=()=>{if(RT!==st)return;k++;g.rotation.z=Math.sin(k*1.9)*.12*(1-k/18);if(k<18)requestAnimationFrame(wob);else{g.rotation.z=0;go();}};
  const go=()=>{show({at:[bx,y0+.4,bz],dist:5.5,sec:1.1,sound:'event-clunk'});
    st.h=scatter({items:balls,center:[bx,bz],dir:away,spread:2.6,dist:[2.4,3.4],radius:.22,
      onBack:(i,n,N)=>toast(n<N?`공을 모아 줘요 (${n}/${N})`:'다 모았어요!'),
      onDone:()=>{sfx('event-sparkle');st.tm=setTimeout(()=>{if(RT===st)endRoll();},2000);}});
    toast('공이 굴러가요! 걸어가 닿으면 바구니로 돌아가요');};
  requestAnimationFrame(wob);return true;}
function clearDevcheck(){endRoll();if(overlay)toggleBounds(false);if(measOn){pts=[];clearMeas();meas=null;}if(sizeText)sizeText='';showPanel();} // 구역을 바꿀 때
window.wlDev={roll:rollTest,get rolling(){return RT&&RT.h?RT.h.left:null;},bounds:toggleBounds,measure:p=>{if(!measOn)toggleMeasure(true);return measure(p);},measureOn:toggleMeasure,size:toggleSize,sizeList,wlHeight};
export {rollTest,clearDevcheck,initDevcheck,toggleBounds,toggleMeasure,toggleSize};
