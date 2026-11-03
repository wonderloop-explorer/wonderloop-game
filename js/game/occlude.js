/* 원더룹 — 가리면 비쳐 보이기 (개미굴 occlude와 같은 방식)
   NPC 같은 움직이는 캐릭터가 카메라와 원더룹 사이에 서서 원더룹을 가리면, 그 캐릭터를 반투명하게(불투명도 30%) 해서 원더룹이 비쳐 보이게 한다.
   세계 구역은 큰 풀·잎·집도 이 방식(물체 전체 0.3, 덧그리기·윤곽선 없음 — 아이폰에서 덧그리기가 원더룹을 까맣게, 큰 잎을 삼각형 반투명 조각으로 보이게 했다, 2026-11-02).
   컴퓨터도 2026-11-02부터 같은 방식: 아래 흐려 보기 cut·윤곽선 xray는 지금 어느 구역도 쓰지 않는다(윤곽선 재질 matcap이 그림의 투명한 가운데를 무시해
   흐린 물체가 두 겹 넘게 겹치면 원더룹 전체를 진갈색으로 칠했다). 다시 쓰려면 tools/occlude-test.js가 컴퓨터·휴대폰 둘 다 통과해야 한다.
   add(root, r, h): 가릴 수 있는 캐릭터와 크기 — 반지름 r, 키 h(발부터 머리까지 여러 높이에서 원더룹 쪽 시선과 r보다 가까우면 가린 것으로 본다). 구역을 떠날 때 clearOcclude()가 비운다.
   재질은 캐릭터마다 따로여야 한다(같이 쓰는 재질이면 다른 물체도 함께 투명해진다). 투명해지는 동안 깊이를 쓰지 않아 뒤의 원더룹이 보인다.
   흐려 보기 cut(root, {skip}) (요정의 숲부터, 2026-11-02 점무늬 → 부드러운 흐림): 구역의 모든 물체(잎·줄기·꽃·버섯·바위·소품·NPC) 가운데
     카메라와 원더룹 사이에 오는 부분이 원더룹 둘레 동그라미 안에서 부드럽게 흐려진다(가운데 불투명도 약 0.28, 가장자리로 갈수록 그러데이션).
     두 번 그리기: ① 08의 보통 그리기에서는 그 조각을 비워(뒤의 원더룹·배경이 먼저 그려짐) ② overlayPass()가 그 조각만 다시 그려 반투명으로 덮는다
     (재질 상태만 잠깐 바꿈 — 섞기·깊이 쓰기·스텐실, 셰이더는 다시 만들지 않음). 재질에 셰이더 조각을 더하는 방식이라 물체를 하나로 합친 뒤(03 병합·무리)에도 그대로 되고,
     ②는 그 재질을 쓰는 메시만 레이어 5로 골라 그린다(조명도 레이어 5에 함께). 원더룹보다 0.3m 넘게 앞에 있는 조각만 —
     카메라 바로 앞(1.4~3.4m 안)에 걸린 잎·갓은 동그라미 밖이어도 같이 흐린다(화면을 덮지 않게).
     발밑 땅·물·길은 skip에 넣는다. 동그라미 자리·크기·깊이는 08이 그리기 직전에 prepCut()으로 맞춘다(카메라가 움직인 뒤).
   윤곽선 xray(on): 흐려진 물체가 두 겹 넘게 겹쳐 원더룹이 거의 다 가려질 때만, 원더룹 가장자리에 아주 옅은 진갈색 얇은 선(채운 실루엣 아님).
     ②에서 흐려진 조각을 그릴 때마다 스텐실을 1씩 올리고, 윤곽선은 스텐실 2 이상인 원더룹 화소에만 그린다.
     08 zoneLook이 세계 구역(구역 정보 world)에서 켠다 — 베이스캠프(기준 화면)는 그대로. */
import * as THREE from 'three';
let ctx=null;const LIST=[];
const _c=new THREE.Vector3(),_d=new THREE.Vector3(),_p=new THREE.Vector3(),_x=new THREE.Vector3();
function initOcclude(c){ctx=c;}
/* boxes(선택, 휴대폰 세계 구역의 큰 풀·잎 — 2026-11-02): 부품마다 월드 상자. 카메라에서 원더룹 발·허리·가슴·머리 네 점으로 가는 시선 가운데 하나라도 상자를 지나면 가린 것(여러 겹이면 겹마다 따로 흐려짐),
   카메라가 상자 안이나 0.9m 안, 또는 보는 쪽 1m 앞이 상자에 닿으면 '바로 앞'이라 완전히 흐려 숨긴다(화면 전체·반이 초록으로 덮이지 않게). 상자가 없으면 예전처럼 가운데 기둥(r·h)으로 본다 */
/* 흐림 정도(2026-11-03 — 머리 위 잎 지붕·아주 큰 잎·꽃지붕 집이 0.3으로 흐려지면 화면 절반 넘게 연두·분홍 막을 씌운 것처럼 보였다):
   화면에서 작게 보이는 물체는 0.3, 화면을 크게 덮거나(부품 상자를 화면에 비춘 넓이가 1/4 넘게) 카메라 가까이(3m 안) 있는 물체는 0.1까지(그 사이는 부드럽게 섞음).
   roof(잎 지붕 높이, 선택): 카메라가 그 높이보다 위에서 내려다보는데 사이에 오면 아예 숨긴다. 여러 겹이 함께 흐려지면 겹친 막이 한 겹(0.3)보다 진해지지 않게
   겹마다 더 옅게(n겹이면 1−0.7^(1/n)). 바뀌는 값은 모두 같은 빠르기로 부드럽게 따라가 깜빡이지 않는다 */
const A_SMALL=.3,A_BIG=.1;
function add(root,r=.5,h=1,{near=false,speed=12,boxes=null,set=null,roof=null}={}){LIST.push({root,r,h,k:0,f:0,near,speed,boxes,set,roof,hold:0,holdF:0,a:A_SMALL});}
// set(k,f,a): 재질을 직접 바꾸지 않고 구역 쪽이 흐림 값을 받는다(한 덩어리로 합쳐 그린 물체 — 부품마다 불투명도 표)
// near: 카메라 바로 옆(가로 r+1.2m 안)에 걸려도 흐림 · speed: 흐려지는 빠르기(6 ≈ 0.2초)
/* 한 겹만(2026-11-03): 흐려진 물체 안에서 앞면·뒷면·겹친 꽃잎이 0.3씩 여러 번 섞이면 한 물체가 진한 막이 된다(꽃지붕 집 — 벽 앞뒤 + 지붕 꽃잎 여섯).
   흐려지는 동안 같은 모양을 깊이만 먼저 그려(색은 안 씀) 가장 앞면 한 겹만 반투명으로 섞이게 — 흐려지는 물체마다 그리기 +1, 평소에는 0 */
const PRE=new THREE.MeshBasicMaterial({colorWrite:false,side:THREE.DoubleSide,transparent:true,depthWrite:true});
function prepass(m){const p=new THREE.Mesh(m.geometry,PRE);p.userData.isPre=true;p.renderOrder=1;p.castShadow=p.receiveShadow=false;p.frustumCulled=m.frustumCulled;p.raycast=()=>{};p.visible=false;m.add(p);return p;}
function setFade(o,k,f=0){const a=(1-(1-o.a)*k)*(1-f);if(o.set){o.set(k,f,a);return;}o.root.traverse(m=>{if(!m.isMesh&&!m.isSprite||m.userData.isPre)return;if(o.boxes){m.visible=a>.03;
    const on=k>.02||f>.02;if(on&&!m.userData.pre&&m.isMesh)m.userData.pre=prepass(m);if(m.userData.pre){m.userData.pre.visible=on;m.renderOrder=on?2:0;}}const ms=Array.isArray(m.material)?m.material:[m.material];
  ms.forEach(mt=>{if(!mt)return;const u=mt.userData;if(u.o0===undefined){u.o0=mt.opacity;u.t0=mt.transparent;u.d0=mt.depthWrite;}
    if(k>.02||f>.02){if(!mt.transparent){mt.transparent=true;mt.needsUpdate=true;}mt.opacity=u.o0*a;mt.depthWrite=k<.5&&f<.5&&u.d0;}
    else{if(mt.transparent!==u.t0){mt.transparent=u.t0;mt.needsUpdate=true;}mt.opacity=u.o0;mt.depthWrite=u.d0;}});});}
const _ray=new THREE.Ray(),_bx=new THREE.Box3(),_pts=[.1,.45,.75,1.05],_fw=new THREE.Vector3(),_q=new THREE.Vector3();
/* 여유 두기(2026-11-02 — 원더룹이 꽃지붕 집 벽에 붙어 서면 경계에 걸려 프레임마다 흐렸다 돌아왔다 깜빡였다): 이미 흐려진 물체는 더 넓게 봐서 돌아오는 경계를 흐려지기 시작하는 경계보다 멀리 둔다
   (몸 너비 0.22 → 0.42, 원더룹 앞 0.25 → 0.05, 바로 앞 0.9 → 1.3m), 마지막으로 걸린 뒤 0.35초는 그대로 흐림(tickOcclude) */
function boxHit(o,W){let near=false,hit=false;const was=o.k>.5,wasF=o.f>.5;ctx.camera.getWorldDirection(_fw);for(const b of o.boxes){_bx.copy(b).expandByScalar(.06);
    if(_bx.distanceToPoint(_c)<(wasF?1.3:.9)||_bx.distanceToPoint(_q.copy(_c).addScaledVector(_fw,1))<(wasF?.85:.55)){near=true;break;} // 카메라 안·바로 옆·바로 앞(보는 쪽 1m) — 그보다 먼 것은 사이에 걸릴 때만 0.3
    _bx.expandByScalar(was?.42:.22); // 시선은 원더룹 가운데 줄로만 보니, 몸 너비만큼 넓혀 가장자리에 걸친 줄기·잎도
    if(!hit)for(const y of _pts){_x.set(W.position.x,W.position.y+y,W.position.z).sub(_c);const L=_x.length();_ray.set(_c,_x.divideScalar(L));
      if(_ray.intersectBox(_bx,_p)){const t=_p.distanceTo(_c);if(t<L-(was?.05:.25)){hit=true;break;}}}}
  return near?2:hit?1:0;}
/* 화면을 얼마나 덮는지: 부품 상자마다 화면에 비춘 네모 넓이(화면 = 1)를 더한다 — 카메라 뒤로 넘어가는 상자는 화면을 다 덮는 것으로 */
const _v=new THREE.Vector3(),_pm=new THREE.Matrix4();
function cover(o){let sum=0;for(const b of o.boxes){let x0=1,x1=-1,y0=1,y1=-1,behind=false;
    for(let i=0;i<8;i++){_v.set(i&1?b.max.x:b.min.x,i&2?b.max.y:b.min.y,i&4?b.max.z:b.min.z).applyMatrix4(_pm);
      const w=_pm.elements[3]*(i&1?b.max.x:b.min.x)+_pm.elements[7]*(i&2?b.max.y:b.min.y)+_pm.elements[11]*(i&4?b.max.z:b.min.z)+_pm.elements[15];if(w<=.05){behind=true;break;}
      x0=Math.min(x0,_v.x);x1=Math.max(x1,_v.x);y0=Math.min(y0,_v.y);y1=Math.max(y1,_v.y);}
    if(behind)return 1;sum+=Math.max(0,Math.min(1,x1)-Math.max(-1,x0))*Math.max(0,Math.min(1,y1)-Math.max(-1,y0))/4;if(sum>=1)return 1;}
  return sum;}
const ss=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x);};
function tickOcclude(dt){tickXray(dt);if(!ctx||!LIST.length)return;const cam=ctx.camera,W=ctx.WL;
  _c.copy(cam.position);_d.set(W.position.x,W.position.y+.75,W.position.z).sub(_c);const len=_d.length();if(len<.1)return;_d.divideScalar(len);
  _pm.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);
  const hits=[];
  LIST.forEach(o=>{let hit=false,full=false;if(o.root.visible!==false&&o.root.parent){
      if(o.boxes){const r=boxHit(o,W);hit=r>0;full=r===2;if(hit&&!full&&o.roof!=null&&_c.y>o.roof-.3)full=true;} // 잎 지붕을 위에서 내려다보면 아예 숨김
      else{o.root.getWorldPosition(_p);const y0=_p.y;
      for(let i=0;i<4&&!hit;i++){_p.y=y0+o.h*(.15+i*.25);const t=_x.copy(_p).sub(_c).dot(_d);if(t>.2&&t<len-.3)hit=_x.copy(_c).addScaledVector(_d,t).distanceTo(_p)<o.r;}
      if(!hit&&o.near){_p.y=y0;hit=Math.hypot(_p.x-_c.x,_p.z-_c.z)<o.r+1.2&&_c.y<y0+o.h+1.5&&_c.y>y0-1;}}}
    if(o.boxes){o.hold=hit?.35:Math.max(0,o.hold-dt);o.holdF=full?.35:Math.max(0,o.holdF-dt);hit=hit||o.hold>0;full=full||o.holdF>0;}
    o.hit=hit;o.full=full;if(hit&&!full)hits.push(o);});
  const n=hits.length;
  LIST.forEach(o=>{const hit=o.hit,full=o.full,s=Math.min(1,dt*o.speed);
    // 흐릴 때 남길 불투명도: 크게 덮을수록·가까울수록 옅게, 여러 겹이면 겹친 막이 한 겹보다 진해지지 않게
    let at=o.a;if(hit&&!full&&o.boxes){let dmin=1e9;for(const b of o.boxes)dmin=Math.min(dmin,b.distanceToPoint(_c));
      const deep=Math.max(ss(.12,.28,cover(o)),ss(4,2.5,dmin));at=A_SMALL+(A_BIG-A_SMALL)*deep;if(n>1)at=1-Math.pow(1-at,1/n);}
    else if(!hit)at=o.a; // 돌아오는 동안은 그대로(흐림이 풀리는 길에 값이 바뀌어 번쩍이지 않게)
    const a=o.a+(at-o.a)*s,k=o.k+((hit?1:0)-o.k)*s,f=o.f+((full?1:0)-o.f)*s;
    if(k<.01&&o.k<.01&&f<.01&&o.f<.01){o.a=at;return;}o.a=a;o.k=k<.01?0:k;o.f=f<.01?0:f;setFade(o,o.k,o.f);});}
/* 시험용: 지금 흐려진 물체를 잠깐 다 숨긴다(가림 시험이 '막이 없을 때' 화면과 비교) → 되돌리는 함수 */
function hideFaded(){const L=LIST.filter(o=>o.k>.02||o.f>.02);L.forEach(o=>setFade(o,1,1));return()=>L.forEach(o=>setFade(o,o.k,o.f));}
/* ---------- 흐려 보기 ---------- */
const CUT={value:new THREE.Vector4(0,0,1,0)},PASS={value:0},LAYER=5; // CUT: xy 그리기 화소 자리(아래가 0), z 반지름(화소), w 원더룹까지 깊이(0이면 꺼짐) · PASS 0 보통 그리기, 1 흐린 조각 덧그리기
let cutOn=false,cutRoot=null,scanT=1;const CUT_MATS=new Set();
const CUT_FRAG=`uniform vec4 wlCut;uniform float wlPass;`;
const CUT_MAIN=`
	float wlK=0.;if(wlCut.w>0.){float wd=length(gl_FragCoord.xy-wlCut.xy)/wlCut.z;wlK=(1.-smoothstep(.55,1.,wd))*smoothstep(.3,1.1,wlCut.w-vViewPosition.z);
		wlK=max(wlK,(1.-smoothstep(1.4,3.4,vViewPosition.z))*step(vViewPosition.z,wlCut.w-.5));}
	if(wlPass<.5){if(wlK>.004)discard;}else if(wlK<=.004)discard;`;
const CUT_END=`
	if(wlPass>.5)gl_FragColor.a*=1.-.72*wlK;`;
function patchCut(mt){if(!mt||mt.userData.wlCut||!(mt.isMeshToonMaterial||mt.isMeshStandardMaterial||mt.isMeshLambertMaterial||mt.isMeshPhongMaterial))return;
  mt.userData.wlCut=true;CUT_MATS.add(mt);const prev=mt.onBeforeCompile,key=mt.customProgramCacheKey;
  mt.onBeforeCompile=(sh,r)=>{if(prev)prev.call(mt,sh,r);sh.uniforms.wlCut=CUT;sh.uniforms.wlPass=PASS;
    sh.fragmentShader=(CUT_FRAG+'\n'+sh.fragmentShader.replace(/void main\(\)\s*\{/,m=>m+CUT_MAIN)).replace('#include <dithering_fragment>',m=>m+CUT_END);};
  mt.customProgramCacheKey=()=>(key?key.call(mt):'')+'|wlcut2';mt.needsUpdate=true;}
// 작은 것(minSize m보다 작은 꽃·조약돌 무리·꽃잎·이끼 등 발목 높이 소품)은 원더룹을 가리지 않으니 빼서 덧그리기 부담을 던다
const _bs=new THREE.Sphere(),_ws=new THREE.Vector3();
function cut(root,{skip=[],minSize=.35}={}){const no=new Set();skip.forEach(o=>o&&o.traverse(m=>no.add(m)));root.updateMatrixWorld(true);
  root.traverse(m=>{if(!(m.isMesh||m.isInstancedMesh)||no.has(m))return;const g=m.geometry;if(!g.boundingSphere)g.computeBoundingSphere();
    m.getWorldScale(_ws);if(g.boundingSphere.radius*Math.max(_ws.x,_ws.y,_ws.z)<minSize)return;[].concat(m.material).forEach(patchCut);});cutOn=true;cutRoot=root;scanT=1;}
// 레이어 5: 흐린 조각을 덧그릴 메시(병합된 메시도 — 03이 build 뒤에 만든다)와 모든 조명, 윤곽선
function scan(){if(!ctx||!cutRoot)return;cutRoot.traverse(m=>{if((m.isMesh||m.isInstancedMesh)&&[].concat(m.material).some(t=>t&&t.userData.wlCut))m.layers.enable(LAYER);});
  ctx.scene.traverse(o=>{if(o.isLight)o.layers.enable(LAYER);});}
const _s=new THREE.Vector3(),_t=new THREE.Vector3(),_sz=new THREE.Vector2();
function prepCut(){if(!ctx)return;if(!cutOn){CUT.value.w=0;return;}const cam=ctx.camera,W=ctx.WL,r=ctx.renderer;
  r.getDrawingBufferSize(_sz);_s.set(W.position.x,W.position.y+.6,W.position.z);_t.copy(_s).applyMatrix4(cam.matrixWorldInverse);const depth=-_t.z;
  if(depth<.2){CUT.value.w=0;return;}_s.project(cam);_t.set(W.position.x,W.position.y+1.35,W.position.z).project(cam);
  const x=(_s.x*.5+.5)*_sz.x,y=(_s.y*.5+.5)*_sz.y,rad=Math.hypot((_t.x-_s.x)*.5*_sz.x,(_t.y-_s.y)*.5*_sz.y)*1.25;
  CUT.value.set(x,y,Math.max(8,rad),depth);}
/* ② 흐린 조각 덧그리기 — 08이 보통 그리기 바로 뒤에 부른다(촬영 모드·영상 캡처도 같은 함수) */
function overlayPass(renderer,scene,camera){if(!cutOn||CUT.value.w<=0)return;
  const mask=camera.layers.mask,ac=renderer.autoClear,su=renderer.shadowMap.autoUpdate;
  CUT_MATS.forEach(m=>{const u=m.userData;u.b0=[m.blending,m.depthWrite];m.blending=THREE.CustomBlending;m.blendSrc=THREE.SrcAlphaFactor;m.blendDst=THREE.OneMinusSrcAlphaFactor;
    m.blendSrcAlpha=THREE.ZeroFactor;m.blendDstAlpha=THREE.OneFactor;m.depthWrite=false; // 캔버스 알파는 그대로(페이지 배경이 비치지 않게)
    m.stencilWrite=true;m.stencilFunc=THREE.AlwaysStencilFunc;m.stencilZPass=THREE.IncrementStencilOp;});
  PASS.value=1;camera.layers.set(LAYER);renderer.autoClear=false;renderer.shadowMap.autoUpdate=false;
  try{renderer.render(scene,camera);}
  finally{PASS.value=0;camera.layers.mask=mask;renderer.autoClear=ac;renderer.shadowMap.autoUpdate=su;
    CUT_MATS.forEach(m=>{const u=m.userData;m.blending=u.b0[0];m.depthWrite=u.b0[1];m.stencilWrite=false;m.stencilZPass=THREE.KeepStencilOp;});}}
/* ---------- 윤곽선 (두 겹 넘게 가려질 때만, 옅은 진갈색 얇은 선) ---------- */
let xrOn=false,xrMat=null,xrT=1;
function rimTex(){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),gr=g.createRadialGradient(64,64,0,64,64,64);
  gr.addColorStop(0,'rgba(74,46,34,0)');gr.addColorStop(.8,'rgba(74,46,34,0)');gr.addColorStop(.92,'rgba(74,46,34,.45)');gr.addColorStop(1,'rgba(74,46,34,.6)');
  g.fillStyle=gr;g.fillRect(0,0,128,128);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
function xrBuild(){const W=ctx.WL;if(!xrMat)xrMat=new THREE.MeshMatcapMaterial({matcap:rimTex(),transparent:true,opacity:.7,depthWrite:false,depthFunc:THREE.LessEqualDepth,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1,
    stencilWrite:true,stencilRef:2,stencilFunc:THREE.LessEqualStencilFunc,stencilFail:THREE.KeepStencilOp,stencilZFail:THREE.KeepStencilOp,stencilZPass:THREE.KeepStencilOp}); // 2 ≤ 스텐실: 흐린 조각이 두 겹 넘게 덮은 곳만
  const add=[];W.traverse(m=>{if(!m.isMesh||m.userData.xr||m.userData.isXr||!(m.layers.mask&1))return;const ms=[].concat(m.material);if(ms.some(t=>!t||t.isMeshBasicMaterial||t.isSpriteMaterial))return;add.push(m);});
  add.forEach(m=>{m.userData.xr=true;
    const o=m.isSkinnedMesh?new THREE.SkinnedMesh(m.geometry,xrMat):new THREE.Mesh(m.geometry,xrMat);if(m.isSkinnedMesh){o.bindMode=m.bindMode;o.bind(m.skeleton,m.bindMatrix);}
    o.userData.isXr=true;o.layers.set(LAYER);o.renderOrder=30;o.frustumCulled=false;o.castShadow=o.receiveShadow=false;o.visible=xrOn;o.raycast=()=>{};m.add(o);});}
function xray(on){if(!ctx)return;xrOn=!!on;if(xrOn)xrBuild();ctx.WL.traverse(m=>{if(m.userData.isXr)m.visible=xrOn;});}
function tickXray(dt){xrT+=dt;scanT+=dt;if(xrOn&&xrT>1){xrT=0;xrBuild();}if(cutOn&&scanT>1){scanT=0;scan();}} // 탈·물건·병합 메시가 새로 붙으면 1초 안에
/* 잠깐 끄기(소개 카드 전신 찍기 등): const resume=cutPaused(true); … resume(); */
function cutPaused(){const w=CUT.value.w;CUT.value.w=0;return()=>{CUT.value.w=w;};}
function clearOcclude(){LIST.length=0;cutOn=false;cutRoot=null;CUT.value.w=0;CUT_MATS.clear();}
const list=()=>LIST; // 시험용: 지금 흐려진 물체 보기
export {add,clearOcclude,cut,cutPaused,hideFaded,prepass,initOcclude,list,overlayPass,prepCut,tickOcclude,xray};
