/* 원더룹 — 가리면 비쳐 보이기 (개미굴 occlude와 같은 방식)
   NPC 같은 움직이는 캐릭터가 카메라와 원더룹 사이에 서서 원더룹을 가리면, 그 캐릭터를 반투명하게(불투명도 30%) 해서 원더룹이 비쳐 보이게 한다.
   add(root, r, h): 가릴 수 있는 캐릭터와 크기 — 반지름 r, 키 h(발부터 머리까지 여러 높이에서 원더룹 쪽 시선과 r보다 가까우면 가린 것으로 본다). 구역을 떠날 때 clearOcclude()가 비운다.
   재질은 캐릭터마다 따로여야 한다(같이 쓰는 재질이면 다른 물체도 함께 투명해진다). 투명해지는 동안 깊이를 쓰지 않아 뒤의 원더룹이 보인다.
   뚫어 보기 cut(root, {skip}) (요정의 숲부터): 구역의 모든 물체(잎·줄기·꽃·버섯·바위·소품·NPC) 가운데 카메라와 원더룹 사이에 오는 부분을,
     원더룹 둘레 동그라미 안에서만 촘촘한 점무늬로 비워(4×4 점 배열, 가운데 약 75%) 반투명처럼 보이게 한다. 재질에 셰이더 조각을 더하는 방식이라
     물체를 하나로 합친 뒤(03 병합·무리)에도 그대로 되고 재질을 따로 둘 필요가 없다(드로우콜이 늘지 않음). 원더룹보다 0.3m 넘게 앞에 있는 조각만 —
     카메라 바로 앞(1.4~3.4m 안)에 걸린 잎·갓은 동그라미 밖이어도 같이 비운다(화면을 덮지 않게).
     발밑 땅·물·길은 skip에 넣는다. 동그라미 자리·크기·깊이는 08이 그리기 직전에 prepCut()으로 맞춘다(카메라가 움직인 뒤).
   윤곽 비치기 xray(on): 그래도 가린 부분은 원더룹 윤곽(가장자리가 진한 크림색 빛)이 비쳐 보인다 — 원더룹 메시를 같은 뼈대로 한 번 더,
     깊이가 '뒤'일 때만 그린다. 원더룹 자신(팔이 몸 뒤로 갈 때 등)에는 그리지 않도록 원더룹이 그린 화소는 스텐실 1로 표시해 둔다.
     08 zoneLook이 세계 구역(구역 정보 world)에서 켠다 — 베이스캠프(기준 화면)는 그대로. */
import * as THREE from 'three';
let ctx=null;const LIST=[];
const _c=new THREE.Vector3(),_d=new THREE.Vector3(),_p=new THREE.Vector3(),_x=new THREE.Vector3();
function initOcclude(c){ctx=c;}
function add(root,r=.5,h=1){LIST.push({root,r,h,k:0});}
function setFade(o,k){o.root.traverse(m=>{if(!m.isMesh&&!m.isSprite)return;const ms=Array.isArray(m.material)?m.material:[m.material];
  ms.forEach(mt=>{if(!mt)return;const u=mt.userData;if(u.o0===undefined){u.o0=mt.opacity;u.t0=mt.transparent;u.d0=mt.depthWrite;}
    if(k>.02){if(!mt.transparent){mt.transparent=true;mt.needsUpdate=true;}mt.opacity=u.o0*(1-.7*k);mt.depthWrite=k<.5&&u.d0;}
    else{if(mt.transparent!==u.t0){mt.transparent=u.t0;mt.needsUpdate=true;}mt.opacity=u.o0;mt.depthWrite=u.d0;}});});}
function tickOcclude(dt){tickXray(dt);if(!ctx||!LIST.length)return;const cam=ctx.camera,W=ctx.WL;
  _c.copy(cam.position);_d.set(W.position.x,W.position.y+.75,W.position.z).sub(_c);const len=_d.length();if(len<.1)return;_d.divideScalar(len);
  LIST.forEach(o=>{let hit=false;if(o.root.visible!==false&&o.root.parent){o.root.getWorldPosition(_p);const y0=_p.y;
      for(let i=0;i<4&&!hit;i++){_p.y=y0+o.h*(.15+i*.25);const t=_x.copy(_p).sub(_c).dot(_d);if(t>.2&&t<len-.3)hit=_x.copy(_c).addScaledVector(_d,t).distanceTo(_p)<o.r;}}
    const k=o.k+((hit?1:0)-o.k)*Math.min(1,dt*12);if(k<.01&&o.k<.01)return;o.k=k<.01?0:k;setFade(o,o.k);});}
/* ---------- 뚫어 보기 (점무늬로 비우기) ---------- */
const CUT={value:new THREE.Vector4(0,0,1,0)}; // xy 그리기 화소 자리(아래가 0), z 반지름(화소), w 원더룹까지 깊이(0이면 꺼짐)
let cutOn=false;
const CUT_FRAG=`uniform vec4 wlCut;
const float WL_B[16]=float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.);`;
const CUT_MAIN=`
	if(wlCut.w>0.){float wd=length(gl_FragCoord.xy-wlCut.xy)/wlCut.z;float wk=(1.-smoothstep(.6,1.,wd))*smoothstep(.3,1.1,wlCut.w-vViewPosition.z);
		wk=max(wk,(1.-smoothstep(1.4,3.4,vViewPosition.z))*step(vViewPosition.z,wlCut.w-.5));
		ivec2 wq=ivec2(mod(floor(gl_FragCoord.xy),4.));if((WL_B[wq.x+wq.y*4]+.5)/16.<wk*.78)discard;}`;
function patchCut(mt){if(!mt||mt.userData.wlCut||!(mt.isMeshToonMaterial||mt.isMeshStandardMaterial||mt.isMeshLambertMaterial||mt.isMeshPhongMaterial))return;
  mt.userData.wlCut=true;const prev=mt.onBeforeCompile,key=mt.customProgramCacheKey;
  mt.onBeforeCompile=(sh,r)=>{if(prev)prev.call(mt,sh,r);sh.uniforms.wlCut=CUT;sh.fragmentShader=CUT_FRAG+'\n'+sh.fragmentShader.replace(/void main\(\)\s*\{/,m=>m+CUT_MAIN);};
  mt.customProgramCacheKey=()=>(key?key.call(mt):'')+'|wlcut';mt.needsUpdate=true;}
function cut(root,{skip=[]}={}){const no=new Set();skip.forEach(o=>o&&o.traverse(m=>no.add(m)));
  root.traverse(m=>{if((m.isMesh||m.isInstancedMesh)&&!no.has(m))[].concat(m.material).forEach(patchCut);});cutOn=true;}
const _s=new THREE.Vector3(),_t=new THREE.Vector3(),_sz=new THREE.Vector2();
function prepCut(){if(!ctx)return;if(!cutOn){CUT.value.w=0;return;}const cam=ctx.camera,W=ctx.WL,r=ctx.renderer;
  r.getDrawingBufferSize(_sz);_s.set(W.position.x,W.position.y+.6,W.position.z);_t.copy(_s).applyMatrix4(cam.matrixWorldInverse);const depth=-_t.z;
  if(depth<.2){CUT.value.w=0;return;}_s.project(cam);_t.set(W.position.x,W.position.y+1.35,W.position.z).project(cam);
  const x=(_s.x*.5+.5)*_sz.x,y=(_s.y*.5+.5)*_sz.y,rad=Math.hypot((_t.x-_s.x)*.5*_sz.x,(_t.y-_s.y)*.5*_sz.y)*1.1;
  CUT.value.set(x,y,Math.max(8,rad),depth);}
/* ---------- 윤곽 비치기 ---------- */
let xrOn=false,xrMat=null,xrT=1;
function rimTex(){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),gr=g.createRadialGradient(64,64,0,64,64,64);
  gr.addColorStop(0,'rgba(255,246,226,.1)');gr.addColorStop(.62,'rgba(255,246,226,.22)');gr.addColorStop(.86,'rgba(255,240,210,.85)');gr.addColorStop(1,'rgba(255,236,200,1)');
  g.fillStyle=gr;g.fillRect(0,0,128,128);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
function xrBuild(){const W=ctx.WL;if(!xrMat)xrMat=new THREE.MeshMatcapMaterial({matcap:rimTex(),transparent:true,depthWrite:false,depthFunc:THREE.GreaterDepth,
    stencilWrite:true,stencilRef:1,stencilFunc:THREE.NotEqualStencilFunc,stencilFail:THREE.KeepStencilOp,stencilZFail:THREE.KeepStencilOp,stencilZPass:THREE.KeepStencilOp});
  const add=[];W.traverse(m=>{if(!m.isMesh||m.userData.xr||m.userData.isXr||!(m.layers.mask&1))return;const ms=[].concat(m.material);if(ms.some(t=>!t||t.isMeshBasicMaterial||t.isSpriteMaterial))return;add.push(m);});
  add.forEach(m=>{m.userData.xr=true;[].concat(m.material).forEach(t=>{t.stencilWrite=true;t.stencilRef=1;t.stencilFunc=THREE.AlwaysStencilFunc;t.stencilZPass=THREE.ReplaceStencilOp;});
    const o=m.isSkinnedMesh?new THREE.SkinnedMesh(m.geometry,xrMat):new THREE.Mesh(m.geometry,xrMat);if(m.isSkinnedMesh){o.bindMode=m.bindMode;o.bind(m.skeleton,m.bindMatrix);}
    o.userData.isXr=true;o.renderOrder=30;o.frustumCulled=false;o.castShadow=o.receiveShadow=false;o.visible=xrOn;o.raycast=()=>{};m.add(o);});}
function xray(on){if(!ctx)return;xrOn=!!on;if(xrOn)xrBuild();ctx.WL.traverse(m=>{if(m.userData.isXr)m.visible=xrOn;});}
function tickXray(dt){if(!xrOn)return;xrT+=dt;if(xrT>1){xrT=0;xrBuild();}} // 탈·물건이 새로 붙으면 1초 안에 윤곽도
/* 잠깐 끄기(소개 카드 전신 찍기 등): const resume=cutPaused(true); … resume(); */
function cutPaused(){const w=CUT.value.w;CUT.value.w=0;return()=>{CUT.value.w=w;};}
function clearOcclude(){LIST.length=0;cutOn=false;CUT.value.w=0;}
export {add,clearOcclude,cut,cutPaused,initOcclude,prepCut,tickOcclude,xray};
