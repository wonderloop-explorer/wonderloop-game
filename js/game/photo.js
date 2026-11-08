/* 원더룹 — 사진 모드 (시리즈 공통, 2026-11-08 — 모든 세계가 같이 쓴다: 앤트빌리지·무한 우주·요정의 숲)
   귀여운 순간(떡방아 때 모여드는 아기 토끼들 같은)을 찍어 남기는 기능.
   ── 들어가고 나가기 ──
   오른쪽 위 '☰ 메뉴' 바로 아래 '사진' 단추(#wlCamBtn — #wlMenu 안, 게임 중에만) · 컴퓨터 C 키. 다시 누르거나 '✕ 닫기'·Esc로 원래대로.
   사진 모드에서는 화면 UI(할 일 안내·가방·메뉴·설명 띠·대화창·카드·말풍선·목표 안내 기둥 = ui.setHints(false))를 숨기고 사진 단추만.
   세상은 멈추지 않는다(토끼·떡 가루·반딧불 그대로). 원더룹도 걷는다 — 컴퓨터 WASD, 휴대폰 조이스틱(사진 모드에서도 보임). 점프·대쉬·말 걸기는 쉰다
   (Space는 셔터). 첫 화면·옷장·가방·조작법 창·결과창·그림 컷이 열려 있으면 들어가지 않는다.
   ── 카메라(따라가기) ──
   사진 카메라는 원더룹 둘레 yaw·pitch·거리(PH.d) — 들어갈 때 지금 카메라 자리에서 이어 받는다(튀지 않게). 보는 점은 원더룹 몸 가운데 → 4.8m 안으로 들어올수록 얼굴(머리 뼈) 쪽,
   초당 8로 부드럽게 따라간다. 끌기 = 둘레 돌기(위아래 -0.35~1.4, 땅 0.25m 위까지만 — 땅 밑으로 안 감), 휠·두 손가락·오른쪽 줌 막대·-/+ 키 = 거리 1.8~18m(가로 화면 기준 — 세로 화면은 따라가기처럼 최대 2배 멀리)
   (1.8m = 얼굴이 화면을 채움, 18m = 주변 풍경). 카메라 방(구역 camRoom) 밖으로는 안 나간다. 카메라 가까이 오는 집·바위·큰 잎은 지금 가림 처리(game/occlude)가 그대로 흐린다
   (가림 처리는 늘 실제 카메라를 보므로 사진 카메라에도 저절로). 가까이 갈 때만 카메라 앞면(near)을 (원더룹까지 거리 − 0.9) × 0.5로 당긴다(최소 0.15, 멀면 원래 1 — 나올 때 원래 값).
   짧은 카메라 연출(view.hold — 떡방아 45° 카메라 등)은 사진 모드 동안 밑에서 그대로 흐르고, 나오면 그 자리로 돌아간다(사진 모드는 연출을 끝내지 않는다).
   ── 초점(배경 흐림) ──
   한 번 그린 화면 + 깊이(DepthTexture)를 한 장짜리 후처리 셰이더가 흐린다(그리기 +1번): 초점은 한 점이 아니라 원더룹 몸 전체를 감싸는 깊이 범위(뼈 자리 공들 — 탈 꼭대기·발끝·손·더듬이, 2026-11-08)
   — 그 안은 또렷, 밖은 벗어난 거리 × K/z(K = 2.6·초점거리^-0.6, 줌인할수록 셈). 같은 깊이라도 원더룹 화면 자리 밖(옆 토끼 등)은 살짝(uSoft).
   점마다 자기 흐림 반지름이 그 거리를 덮을 때만 섞어서 또렷한 원더룹이 뒤 배경으로 번지지 않는다. 하늘(깊이 끝)은 가장 흐림.
   '배경 흐림' 단추로 켜고 끔(기본 켬). 휴대폰은 가벼운 방식 — 표본 12개(컴퓨터 24, 저장 40), 다중 표본(MSAA) 없이.
   '미니어처' 필터(tech-lab/squishy-test.html 틸트시프트 그대로): 원더룹 높이의 가로 띠만 또렷, 위아래로 갈수록 흐림 + 장난감처럼 색을 진하게·가장자리 살짝 어둡게.
   ── 찍기와 저장 ──
   셔터(아래 가운데 둥근 단추 · 컴퓨터 Space): 하얀 번쩍임 + 찰칵(효과음 'photo-shutter') + 오른쪽 아래 작은 미리보기(누르면 크게 보기·휴대폰은 저장).
   비율 1:1 · 4:5 · 9:16 — 화면에 안내 틀(바깥은 어둡게)을 보이고 그 틀 그대로 저장(카메라 setViewOffset — 틀이 가운데가 아니어도 똑같이).
   저장 크기 1:1 1440×1440 · 4:5 1296×1620 · 9:16 1080×1920(가로 1080 이상, 화면과 상관없이 따로 그림: 다중 표본 4 + 표본 40 흐림).
   오른쪽 아래 구석에 작은 '원더룹 ✦' 로고(Jua, 은은하게). 하늘 없는 구역(투명 캔버스 — 페이지 배경이 비치던 곳)은 페이지 배경 색(--bg·--bg2 둥근 그러데이션)을 깔고.
   컴퓨터: PNG 내려받기(wonderloop-날짜-시각.png). 휴대폰: 미리보기를 누르면 공유 창(navigator.share — '이미지 저장'으로 사진 앱에),
   공유가 안 되는 브라우저면 사진을 화면 가득 띄우고 '길게 눌러 저장' 안내(그 사진만 길게 누르기 허용 — 게임 화면은 모두 touch-callout:none).
   ── 성능 ── 사진 모드에서만: 화면 크기 렌더 타깃 하나 + 깊이 + 후처리 한 장(그리기 +1). 흐림·미니어처를 둘 다 끄면 예전처럼 바로 그린다. 촬영 모드(?shot)에는 없다.
   08 연결: initPhoto(ctx) · 매 프레임 따라가기 카메라 뒤 cameraTick(dt) · renderFrame에서 render(renderer,scene,camera)(그렸으면 true) · 작은 행성 이어 붙이기 shift(k,sh). */
import * as THREE from 'three';
import {controlHooks,input} from './controls.js';
import {hintsVisible,setHints} from './ui.js';
import {sfx} from './sound.js';
const SHOT=/[?&]shot(?=&|=|$)/.test(location.search);
const touchDev=()=>matchMedia('(pointer:coarse)').matches||navigator.maxTouchPoints>0;
const RATIOS={'1:1':[1440,1440],'4:5':[1296,1620],'9:16':[1080,1920]};
const D_MIN=1.8,D_MAX=18,P_MIN=-.35,P_MAX=1.4;
let ctx=null,on=false,mobile=false,el=null,btn=null,frameEl=null,thumb=null,viewer=null,zoomIn=null;
const PH={yaw:0,pitch:.3,d:6,dGoal:6,tgt:new THREE.Vector3(),ready:false,blur:true,mini:false,ratio:'4:5',near:1,prevHints:true,last:null,lastURL:null,lastFile:null,thumbT:0,shooting:false};
const _v=new THREE.Vector3(),_h=new THREE.Vector3(),_p=new THREE.Vector3();
/* ---------- 후처리 셰이더(배경 흐림 + 미니어처) ---------- */
const VS=`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
const FS=`varying vec2 vUv;uniform sampler2D tCol,tDep;uniform vec2 uRes;uniform float uNear,uFar,uK,uMax,uDof,uMini,uMiniY,uSoft;uniform vec2 uZr;uniform vec4 uRect;
float vz(vec2 uv){float d=texture2D(tDep,uv).x*2.-1.;return 2.*uNear*uFar/(uFar+uNear-d*(uFar-uNear));}
/* 초점 범위 = 원더룹 몸 전체(탈 꼭대기~발끝, 앞뒤 두께)를 감싸는 깊이 [uZr.x, uZr.y] — 그 안은 흐림 0, 밖은 벗어난 거리만큼(렌즈처럼 /z).
   같은 깊이라도 원더룹 화면 자리(uRect, 가장자리 부드럽게) 밖이면 uSoft만큼 살짝(옆에 선 토끼 등 — 원더룹이 가장 또렷하게) */
float coc(float z,vec2 uv){float d=max(max(uZr.x-z,z-uZr.y),0.);vec2 o=max(uRect.xy-uv,uv-uRect.zw);float inR=1.-smoothstep(0.,.035,max(o.x,o.y));
  return uDof*clamp(max(uK*d/z,uSoft*(1.-inR)),0.,1.);}
/* 물체가 있는 곳(깊이 < 1)은 불투명(1) — 그린 화면의 알파가 1보다 작은 곳이 있어(베이스캠프) 페이지 배경이 비쳐 뿌옜다. 빈 배경(하늘 없는 구역)은 (0,0,0,0)이라 섞어도 미리 곱한 알파 그대로 */
vec4 col(vec2 uv){vec4 c=texture2D(tCol,uv);if(texture2D(tDep,uv).x<.99999)c.a=1.;return c;}
void main(){float z=vz(vUv),tilt=uMini*smoothstep(.07,.42,abs(vUv.y-uMiniY));float r0=max(coc(z,vUv),tilt)*uMax;vec4 c=col(vUv);
  if(r0>.6){vec4 acc=c;float ws=1.;for(int i=0;i<TAPS;i++){float fi=float(i),rr=sqrt(fi+.5)/sqrt(float(TAPS))*r0,a=fi*2.39996;vec2 uv=clamp(vUv+vec2(cos(a),sin(a))*rr/uRes,vec2(.0005),vec2(.9995));
    float zt=vz(uv),rt=max(coc(zt,uv),tilt)*uMax,w=clamp(rt-rr+1.,0.,1.);if(zt<z-.3)w=max(w,clamp(rt-rr+1.,0.,1.));acc+=col(uv)*w;ws+=w;}c=acc/ws;}
  if(uMini>0.){float l=dot(c.rgb,vec3(.299,.587,.114));c.rgb=mix(vec3(l),c.rgb,1.+.32*uMini);c.rgb=(c.rgb-.5)*(1.+.08*uMini)+.5+.02*uMini;
    float vg=smoothstep(1.2,.4,length(vUv-.5)*1.4);c.rgb*=mix(1.,.86+.14*vg,uMini);}
  gl_FragColor=c;
}`;
function postMat(taps){return new THREE.ShaderMaterial({defines:{TAPS:taps},uniforms:{tCol:{value:null},tDep:{value:null},uRes:{value:new THREE.Vector2(1,1)},uNear:{value:1},uFar:{value:100},
  uZr:{value:new THREE.Vector2(4,6)},uRect:{value:new THREE.Vector4(.4,.3,.6,.7)},uSoft:{value:.1},uK:{value:1},uMax:{value:10},uDof:{value:1},uMini:{value:0},uMiniY:{value:.45}},vertexShader:VS,fragmentShader:FS,depthTest:false,depthWrite:false,transparent:true,blending:THREE.NoBlending});}
let live=null,shotMat=null,quad=null,qScene=null,qCam=null;const RT={rt:null,w:0,h:0};
/* 장면을 담는 렌더 타깃: 캔버스와 똑같이 그려지게 — 재질 셰이더가 sRGB로 바꾼 뒤 섞기(반투명 빛기둥·빛 웅덩이 등이 캔버스처럼 sRGB 값 위에서 섞임).
   three는 보통 렌더 타깃에 선형으로 그려 섞기가 선형 공간에서 일어나 베이스캠프 화면이 뿌옇게 밝아졌다 → texture.colorSpace sRGB + isXRRenderTarget(출력 색 공간을 타깃 것으로 쓰게 하는 three의 표시 — r186 WebGLPrograms·getOutputColorSpace만 봄),
   HalfFloat라 하드웨어 sRGB 변환 없음. 후처리는 이미 sRGB인 값을 그대로 내보낸다(colorspace_fragment 없음) */
function makeRT(w,h,samples){const t=new THREE.WebGLRenderTarget(w,h,{samples,type:THREE.HalfFloatType,depthTexture:new THREE.DepthTexture(w,h)});t.depthTexture.type=THREE.UnsignedIntType;t.texture.colorSpace=THREE.SRGBColorSpace;t.isXRRenderTarget=true;return t;}
function ensurePost(){if(quad)return;live=postMat(mobile?12:24);shotMat=postMat(40);qScene=new THREE.Scene();qCam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),live);quad.frustumCulled=false;qScene.add(quad);}
/* 초점 값: 초점 거리 zf가 짧을수록(줌인) 세게 — 렌즈처럼 1/zf에 가깝게, 멀 때 여유(또렷한 깊이)를 조금 넓힘 */
/* 원더룹 몸을 감싸는 공 몇 개(뼈 자리 + 반지름 — 탈은 크다, 개미탈 더듬이도): 카메라 깊이 범위와 화면 자리를 그때그때 잰다.
   (스키닝 메시의 경계 상자는 묶은 자세라 맞지 않아 뼈로) */
const BODY=[['head',.64,.1],['spine',.42,0],['hips',.36,0],['foot.L',.2,0],['foot.R',.2,0],['forearm.L',.3,0],['forearm.R',.3,0],['antenna.L',.16,.1],['antenna.R',.16,.1]];let bones=null;
const _c=new THREE.Vector3(),_r=new THREE.Vector3(),_u=new THREE.Vector3(),_q=new THREE.Vector3();
function bodyRange(cam){if(!bones)bones=BODY.map(([n,r,up])=>[ctx.WL.getObjectByName(n),r,up]).filter(b=>b[0]);cam.updateMatrixWorld();
  _r.setFromMatrixColumn(cam.matrixWorld,0);_u.setFromMatrixColumn(cam.matrixWorld,1);let z0=1e9,z1=-1e9,x0=1,y0=1,x1=-1,y1=-1;
  for(const [b,r,up] of bones){let v=b;let vis=true;while(v&&v!==ctx.WL){if(!v.visible){vis=false;break;}v=v.parent;}if(!vis)continue;
    b.getWorldPosition(_c);_c.y+=up;_q.copy(_c).applyMatrix4(cam.matrixWorldInverse);const z=-_q.z;z0=Math.min(z0,z-r);z1=Math.max(z1,z+r);
    for(const [ax,s] of [[_r,1],[_r,-1],[_u,1],[_u,-1]]){_q.copy(_c).addScaledVector(ax,r*s).project(cam);x0=Math.min(x0,_q.x);x1=Math.max(x1,_q.x);y0=Math.min(y0,_q.y);y1=Math.max(y1,_q.y);}}
  if(z1<z0){const d=cam.position.distanceTo(focusPt(_p));z0=d-.6;z1=d+.6;x0=y0=-.2;x1=y1=.2;}
  return {z0:Math.max(.05,z0-.08),z1:z1+.08,rect:[(x0+1)/2-.015,(y0+1)/2-.015,(x1+1)/2+.015,(y1+1)/2+.015]};}
function setFocus(m,cam,W,H){const U=m.uniforms,B=bodyRange(cam),zf=Math.max(.5,(B.z0+B.z1)/2);U.uNear.value=cam.near;U.uFar.value=cam.far;
  U.uZr.value.set(B.z0,B.z1);U.uRect.value.set(...B.rect);U.uK.value=2.6*Math.pow(zf,-.6);U.uSoft.value=.12*Math.min(1,U.uK.value);U.uMax.value=.022*H;U.uRes.value.set(W,H);U.uDof.value=PH.blur?1:0;U.uMini.value=PH.mini?1:0;
  _v.copy(focusPt(_p));_v.project(cam);U.uMiniY.value=Math.min(.8,Math.max(.2,(_v.y+1)/2));}
const focusPt=v=>{const W=ctx.WL;return v.set(W.position.x,W.position.y+.7,W.position.z);};
/* ---------- 입장·퇴장 ---------- */
function blockedNow(){const b=document.body.classList;if(b.contains('wl-front-on')||b.contains('wl-pop-on')||b.contains('wl-ward-on')||b.contains('wl-bag-on'))return true;
  const hud=document.getElementById('wlHud');if(hud&&!hud.classList.contains('on'))return true;
  const sh=ctx.ui&&ctx.ui.cardShown&&ctx.ui.cardShown();return sh==='result'||sh==='cut';}
function enter(){if(on||!ctx||SHOT||blockedNow())return false;build();on=true;const cam=ctx.camera,W=ctx.WL;
  PH.near=cam.near;
  headPt(PH.tgt);const ox=cam.position.x-PH.tgt.x,oy=cam.position.y-PH.tgt.y,oz=cam.position.z-PH.tgt.z,L=Math.hypot(ox,oy,oz)||6;
  PH.yaw=Math.atan2(ox,oz);PH.pitch=Math.min(P_MAX,Math.max(P_MIN,Math.asin(oy/L)));PH.d=PH.dGoal=Math.min(D_MAX,Math.max(D_MIN,L/fk()));PH.ready=true;
  PH.prevHints=hintsVisible();setHints(false);document.body.classList.add('wl-photo-on');el.hidden=false;if(ctx.controls)ctx.controls.enabled=false;
  input.cam.photo=true;syncZoom();layout();sfx('ui-click');setTimeout(()=>{const s=el.querySelector('.shut');if(s&&!touchDev())s.focus({preventScroll:true});},0);return true;}
function exit(){if(!on)return;on=false;const cam=ctx.camera;cam.near=PH.near;cam.updateProjectionMatrix();setHints(PH.prevHints);document.body.classList.remove('wl-photo-on');
  el.hidden=true;closeViewer();if(ctx.controls)ctx.controls.enabled=true;input.cam.photo=false;sfx('ui-click');
  if(btn&&!touchDev())btn.focus({preventScroll:true});} // 휴대폰은 초점 테두리를 남기지 않게
function toggle(){if(on)exit();else enter();}
/* 보는 점: 멀면 몸 가운데(0.75m), 가까우면 얼굴(머리 뼈) — 4.8m 안으로 들어오며 부드럽게 */
function headPt(v){const W=ctx.WL,hb=ctx.head;const t=1-Math.min(1,Math.max(0,(PH.d-1.8)/3)),s=t*t*(3-2*t);v.set(W.position.x,W.position.y+.75,W.position.z);
  if(hb&&s>0){hb.getWorldPosition(_h);v.lerp(_h,s);}return v;}
/* ---------- 매 프레임 카메라 ---------- */
function cameraTick(dt){if(!on)return;const cam=ctx.camera,k=input.keys||{};
  if(k.ArrowLeft)PH.yaw+=dt*2.3;if(k.ArrowRight)PH.yaw-=dt*2.3;if(k.ArrowUp)PH.pitch=Math.max(P_MIN,PH.pitch-dt*1.3);if(k.ArrowDown)PH.pitch=Math.min(P_MAX,PH.pitch+dt*1.3);
  if(k.Minus||k.NumpadSubtract)setD(PH.dGoal*(1+dt*1.4));if(k.Equal||k.NumpadAdd)setD(PH.dGoal/(1+dt*1.4));
  PH.d+=(PH.dGoal-PH.d)*(1-Math.exp(-dt*10));headPt(_v);PH.tgt.lerp(_v,1-Math.exp(-dt*8));
  const T=PH.tgt,cp=Math.cos(PH.pitch),D=PH.d*fk();let x=T.x+Math.sin(PH.yaw)*cp*D,y=T.y+Math.sin(PH.pitch)*D,z=T.z+Math.cos(PH.yaw)*cp*D;
  const Z=ctx.zone&&ctx.zone();if(Z&&Z.camRoom){const [rx,rz]=Z.camRoom.c,rr=Z.camRoom.r-.3,dx=x-rx,dz=z-rz,dd=Math.hypot(dx,dz);if(dd>rr){x=rx+dx/dd*rr;z=rz+dz/dd*rr;}}
  if(Z&&Z.camBox){const B=Z.camBox;if(B.x)x=Math.min(B.x[1],Math.max(B.x[0],x));if(B.z)z=Math.min(B.z[1],Math.max(B.z[0],z));if(B.y)y=Math.min(B.y[1],Math.max(B.y[0],y));}
  y=Math.max(y,ctx.groundY(x,z)+.25);cam.position.set(x,y,z);if(ctx.controls)ctx.controls.target.copy(T);cam.lookAt(T);
  {const n=Math.min(PH.near,Math.max(.15,(Math.hypot(x-T.x,y-T.y,z-T.z)-.9)*.5));if(Math.abs(n-cam.near)>.01){cam.near=n;cam.updateProjectionMatrix();}} // 가까이 갈 때만 앞면을 당김(늘 0.08이면 베이스캠프에서 카메라 1m 안 천장 판이 비쳐 화면이 뿌옜다)
  if(PH.thumbT>0){PH.thumbT-=dt;if(PH.thumbT<=0&&thumb)thumb.classList.remove('on');}}
function shift(k,sh){PH.tgt[k]+=sh;}
/* 세로 화면은 시야가 좁아 같은 거리면 너무 가깝다 — 따라가기 카메라와 같은 배율(1.25/화면비, 최대 2)로 멀리. PH.d·줌 막대는 가로 화면 기준 거리 */
const fk=()=>{const a=ctx.camera.aspect;return a<1.25?Math.min(a<1?2:2.1,1.25/a):1;};
function setD(d){PH.dGoal=Math.min(D_MAX,Math.max(D_MIN,d));syncZoom();}
/* 줌 막대는 거리의 로그(가까이 = 위) */
const dToS=d=>1-Math.log(d/D_MIN)/Math.log(D_MAX/D_MIN),sToD=s=>D_MIN*Math.pow(D_MAX/D_MIN,1-s);
function syncZoom(){if(zoomIn)zoomIn.value=String(Math.round(dToS(PH.dGoal)*1000));}
/* ---------- 그리기(08 renderFrame) ---------- */
function render(renderer,scene,camera){if(!on||!(PH.blur||PH.mini))return false;ensurePost();
  const s=renderer.getDrawingBufferSize(_p),w=s.x|0,h=s.y|0;if(!RT.rt||RT.w!==w||RT.h!==h){if(RT.rt){RT.rt.depthTexture.dispose();RT.rt.dispose();}RT.rt=makeRT(w,h,mobile?0:4);RT.w=w;RT.h=h;}
  renderer.setRenderTarget(RT.rt);renderer.clear();renderer.render(scene,camera);renderer.setRenderTarget(null);
  quad.material=live;live.uniforms.tCol.value=RT.rt.texture;live.uniforms.tDep.value=RT.rt.depthTexture;setFocus(live,camera,w,h);
  const ac=renderer.autoClear;renderer.autoClear=true;renderer.render(qScene,qCam);renderer.autoClear=ac;return true;}
/* ---------- 안내 틀 ---------- */
function frameRect(){const vw=innerWidth,vh=innerHeight,[W,H]=RATIOS[PH.ratio],r=W/H;
  const top=(el&&el.querySelector('.top').getBoundingClientRect().bottom||60)+8,bot=vh-((el&&el.querySelector('.shut').getBoundingClientRect().top)||vh-100)+10;
  const zr=(el&&el.querySelector('.zoom').getBoundingClientRect().left)||vw,x0=8,x1=Math.min(vw-8,zr-8); // 오른쪽 줌 막대에 틀이 걸리지 않게(좁은 화면에서만 틀이 왼쪽으로 조금)
  const aw=x1-x0,ah=Math.max(120,vh-top-bot);let fw=aw,fh=aw/r;if(fh>ah){fh=ah;fw=ah*r;}let x=(vw-fw)/2;if(x+fw>x1)x=x1-fw;if(x<x0)x=x0;return {x,y:top+(ah-fh)/2,w:fw,h:fh,vw,vh};}
function layout(){if(!el||!on)return;const f=frameRect();Object.assign(frameEl.style,{left:f.x+'px',top:f.y+'px',width:f.w+'px',height:f.h+'px'});
  el.querySelectorAll('.ratio button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.r===PH.ratio?'true':'false'));
  const bl=el.querySelector('.blur'),mi=el.querySelector('.mini');bl.setAttribute('aria-pressed',PH.blur?'true':'false');bl.textContent=PH.blur?'배경 흐림 켬':'배경 흐림 끔';mi.setAttribute('aria-pressed',PH.mini?'true':'false');}
/* ---------- 찍기 ---------- */
async function shoot(){if(!on||PH.shooting)return;PH.shooting=true;const fl=el.querySelector('.flash');fl.classList.remove('go');void fl.offsetWidth;fl.classList.add('go');sfx('photo-shutter');
  try{const blob=await capture();const name='wonderloop-'+stamp()+'.png';PH.lastFile=new File([blob],name,{type:'image/png'});if(PH.lastURL)URL.revokeObjectURL(PH.lastURL);PH.lastURL=URL.createObjectURL(blob);
    thumb.querySelector('img').src=PH.lastURL;thumb.classList.add('on');PH.thumbT=touchDev()?7:4;thumb.querySelector('span').textContent=touchDev()?'눌러서 저장':'저장했어요';
    if(!touchDev())download(PH.lastURL,name);window.wlPhotoLast={name,size:blob.size,ratio:PH.ratio};}
  catch(e){console.error('원더룹: 사진 찍기 실패',e);}PH.shooting=false;}
const stamp=()=>{const d=new Date(),p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;};
function download(url,name){const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();}
/* 틀대로 따로 그리기: 같은 카메라 자리·방향, setViewOffset으로 화면 속 틀 부분만 → 저장 크기 렌더 타깃(다중 표본 4) → 후처리(표본 40) → 화소 읽기 → 2D 캔버스(배경·로고) → PNG */
async function capture(){const {renderer,scene,camera}=ctx,[W,H]=RATIOS[PH.ratio],f=frameRect();ensurePost();
  const cam=camera.clone();cam.setViewOffset(f.vw,f.vh,f.x,f.y,f.w,f.h);cam.updateProjectionMatrix();
  const rt=makeRT(W,H,4),out=new THREE.WebGLRenderTarget(W,H,{type:THREE.UnsignedByteType}); // 후처리 결과(이미 sRGB 값)를 그대로 담음
  const prev=renderer.getRenderTarget(),ac=renderer.autoClear;
  try{if(ctx.prerender)ctx.prerender(cam);renderer.setRenderTarget(rt);renderer.autoClear=true;renderer.clear();renderer.render(scene,cam);
    quad.material=shotMat;shotMat.uniforms.tCol.value=rt.texture;shotMat.uniforms.tDep.value=rt.depthTexture;setFocus(shotMat,cam,W,H);
    const keepBlur=PH.blur,keepMini=PH.mini;shotMat.uniforms.uDof.value=keepBlur?1:0;shotMat.uniforms.uMini.value=keepMini?1:0;
    renderer.setRenderTarget(out);renderer.render(qScene,qCam);
    const px=new Uint8Array(W*H*4);renderer.readRenderTargetPixels(out,0,0,W,H,px);
    const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d'),id=g.createImageData(W,H),row=W*4;
    for(let y=0;y<H;y++)id.data.set(px.subarray((H-1-y)*row,(H-y)*row),y*row); // GL은 아래부터
    let see=false;for(let i=3;i<px.length;i+=4)if(px[i]<255){see=true;break;}
    if(see){paintBg(g,W,H);const bg=g.getImageData(0,0,W,H),B=bg.data,D=id.data;for(let i=0;i<D.length;i+=4){const k=1-D[i+3]/255;B[i]=Math.min(255,D[i]+B[i]*k);B[i+1]=Math.min(255,D[i+1]+B[i+1]*k);B[i+2]=Math.min(255,D[i+2]+B[i+2]*k);B[i+3]=255;}g.putImageData(bg,0,0);} // 빈 배경이 비치는 곳만 페이지 배경과 합침(미리 곱한 알파)
    else g.putImageData(id,0,0);await logo(g,W,H);
    return await new Promise((ok,no)=>c.toBlob(b=>b?ok(b):no(new Error('toBlob')),'image/png'));}
  finally{renderer.setRenderTarget(prev);renderer.autoClear=ac;rt.depthTexture.dispose();rt.dispose();out.dispose();}}
/* 하늘 없는 구역은 캔버스가 투명(페이지 배경이 비침) — 저장 사진에는 그 배경을 깐다 */
function paintBg(g,W,H){const cs=getComputedStyle(document.body),a=cs.getPropertyValue('--bg').trim()||'#f3e7d3',b=cs.getPropertyValue('--bg2').trim()||a;
  const gr=g.createRadialGradient(W*.5,H*.4,0,W*.5,H*.4,Math.hypot(W,H)*.6);gr.addColorStop(0,a);gr.addColorStop(1,b);g.fillStyle=gr;g.fillRect(0,0,W,H);}
/* 오른쪽 아래 작은 로고 '원더룹 ✦' — 개미굴 로고 글꼴(Jua)·진갈색 테두리, 은은하게 */
async function logo(g,W,H){const s=Math.round(Math.min(W,H)*.042);try{await document.fonts.load(`${s}px Jua`);}catch(e){}
  g.save();g.globalAlpha=.78;g.font=`${s}px "Jua","Gowun Dodum",sans-serif`;g.textAlign='right';g.textBaseline='alphabetic';const m=Math.round(s*.7),x=W-m,y=H-m;
  g.lineJoin='round';g.lineWidth=s*.16;g.strokeStyle='#4a2a2a';const sw=g.measureText('✦').width,tx=x-sw-s*.18;
  g.strokeText('원더룹',tx,y);g.fillStyle='#fff4e4';g.fillText('원더룹',tx,y);g.font=`${Math.round(s*.8)}px sans-serif`;g.lineWidth=s*.12;g.strokeText('✦',x,y-s*.08);g.fillStyle='#ffd84a';g.fillText('✦',x,y-s*.08);g.restore();}
/* 휴대폰 저장: 공유 창 → 안 되면 크게 띄워 길게 눌러 저장 */
async function save(){if(!PH.lastFile)return;const f=PH.lastFile;
  if(touchDev()&&navigator.canShare&&navigator.share){try{if(navigator.canShare({files:[f]})){await navigator.share({files:[f],title:'원더룹 사진'});return;}}catch(e){if(e&&e.name==='AbortError')return;}}
  openViewer();}
function openViewer(){if(!PH.lastURL)return;viewer.querySelector('img').src=PH.lastURL;viewer.querySelector('p').textContent=touchDev()?'사진을 길게 눌러 ‘사진 앱에 저장’(이미지 저장)을 골라 주세요.':'내려받은 사진이에요. 다시 받으려면 아래 단추를 눌러 주세요.';
  viewer.querySelector('.dl').hidden=touchDev();viewer.hidden=false;}
function closeViewer(){if(viewer)viewer.hidden=true;}
/* ---------- 화면 ---------- */
const CSS=`
/* 사진 모드: 화면 UI는 숨기고(사진 단추만) 휴대폰 조이스틱은 남김(걸을 수 있게) */
body.wl-photo-on .wlg>*:not(#wlPhoto):not(#wlJoy),body.wl-photo-on #dbgBtn,body.wl-photo-on .bar,body.wl-photo-on header,body.wl-photo-on #wlJump,body.wl-photo-on #wlDash{visibility:hidden!important}
body.wl-photo-on #wlJoy{visibility:visible!important}
#wlCamBtn svg{width:20px;height:20px}
#wlPhoto{position:fixed;inset:0;z-index:45;pointer-events:none;font-family:"Jua","Gowun Dodum",sans-serif;color:#fff4e4}
#wlPhoto[hidden]{display:none}
#wlPhoto .frame{position:fixed;border:2px solid rgba(255,244,228,.9);border-radius:6px;box-shadow:0 0 0 200vmax rgba(20,10,24,.38);pointer-events:none;box-sizing:border-box}
#wlPhoto .frame::before,#wlPhoto .frame::after{content:"";position:absolute;inset:33.33% 0;border-top:1px solid rgba(255,244,228,.28);border-bottom:1px solid rgba(255,244,228,.28)}
#wlPhoto .frame::after{inset:0 33.33%;border:0;border-left:1px solid rgba(255,244,228,.28);border-right:1px solid rgba(255,244,228,.28)}
#wlPhoto .flash{position:fixed;inset:0;background:#fff;opacity:0;pointer-events:none}
#wlPhoto .flash.go{animation:wlFlash .45s ease-out}
@keyframes wlFlash{0%{opacity:.95}100%{opacity:0}}
#wlPhoto .top{position:fixed;left:0;right:0;top:calc(env(safe-area-inset-top,0px) + 12px);display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:.5rem;padding:0 calc(env(safe-area-inset-right,0px) + 12px) 0 calc(env(safe-area-inset-left,0px) + 12px)}
#wlPhoto button{pointer-events:auto;-webkit-tap-highlight-color:transparent}
#wlPhoto .chip{display:inline-flex;align-items:center;justify-content:center;min-height:42px;min-width:42px;box-sizing:border-box;padding:.4rem .95rem;border-radius:999px;background:rgba(46,28,44,.66);color:#fff4e4;font-size:.98rem;white-space:nowrap}
#wlPhoto .chip[aria-pressed="true"]{background:#f2b63c;color:#3e2834}
#wlPhoto .x{margin-right:auto}
#wlPhoto .ratio{display:inline-flex;gap:3px;background:rgba(46,28,44,.66);border-radius:999px;padding:3px}
#wlPhoto .ratio button{min-height:36px;min-width:48px;padding:0 .6rem;border-radius:999px;display:inline-grid;place-items:center;font-size:.95rem}
#wlPhoto .ratio button[aria-pressed="true"]{background:#fff4e4;color:#3e2834}
#wlPhoto .opts{display:inline-flex;gap:.4rem;margin-left:auto}
#wlPhoto .zoom{position:fixed;right:calc(env(safe-area-inset-right,0px) + 12px);top:50%;transform:translateY(-50%);display:flex;flex-direction:column;align-items:center;gap:.3rem;
  background:rgba(46,28,44,.55);border-radius:999px;padding:.55rem .35rem;pointer-events:auto}
#wlPhoto .zoom b{font-weight:400;font-size:1.15rem;line-height:1;width:34px;height:30px;display:grid;place-items:center;cursor:pointer}
#wlPhoto .zoom input{writing-mode:vertical-lr;direction:rtl;width:30px;height:min(34vh,220px);margin:0;accent-color:#f2b63c;touch-action:none!important;cursor:pointer}
#wlPhoto .shut{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 22px);transform:translateX(-50%);width:76px;height:76px;border-radius:50%;
  background:#fff4e4;box-shadow:0 0 0 5px rgba(46,28,44,.66),0 6px 18px rgba(20,10,24,.35);display:grid;place-items:center}
#wlPhoto .shut::after{content:"";width:58px;height:58px;border-radius:50%;border:3px solid #3e2834;box-sizing:border-box}
#wlPhoto .shut:active{transform:translateX(-50%) scale(.93)}
#wlPhoto .thumb{position:fixed;right:calc(env(safe-area-inset-right,0px) + 14px);bottom:calc(env(safe-area-inset-bottom,0px) + 22px);display:flex;flex-direction:column;align-items:center;gap:.25rem;
  opacity:0;transform:translateY(12px) scale(.85);transition:opacity .25s,transform .3s cubic-bezier(.2,1.5,.4,1);pointer-events:none}
#wlPhoto .thumb.on{opacity:1;transform:none;pointer-events:auto}
#wlPhoto .thumb img{width:64px;height:64px;object-fit:cover;border-radius:12px;border:3px solid #fff4e4;box-shadow:0 6px 16px rgba(20,10,24,.4);background:#3e2834}
#wlPhoto .thumb span{font-size:.8rem;background:rgba(46,28,44,.66);border-radius:999px;padding:.1rem .55rem}
#wlPhoto .viewer{position:fixed;inset:0;background:rgba(20,10,24,.88);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.8rem;padding:calc(env(safe-area-inset-top,0px) + 16px) 16px calc(env(safe-area-inset-bottom,0px) + 16px);box-sizing:border-box;pointer-events:auto}
#wlPhoto .viewer[hidden]{display:none}
#wlPhoto .viewer img{max-width:100%;max-height:calc(100dvh - 190px);border-radius:10px;-webkit-touch-callout:default!important;-webkit-user-select:auto!important;user-select:auto!important;touch-action:auto!important;pointer-events:auto}
#wlPhoto .viewer p{margin:0;font-family:"Gowun Dodum",sans-serif;font-size:1rem;text-align:center;line-height:1.5;max-width:26rem}
#wlPhoto .viewer .row{display:flex;gap:.6rem}
#wlPhoto button:focus-visible{outline:3px solid #f2b63c;outline-offset:3px}
@media (max-width:560px){#wlPhoto .top{row-gap:.45rem}#wlPhoto .opts{margin-left:0;flex-basis:100%;justify-content:center}#wlPhoto .x{margin-right:0}#wlPhoto .ratio{margin-left:auto}}
@media (prefers-reduced-motion: reduce){#wlPhoto .flash.go{animation-duration:.2s}#wlPhoto .thumb{transition:opacity .2s}}`;
const CAM_SVG='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 5.5 9.8 3.8h4.4l1.3 1.7H19a2.5 2.5 0 0 1 2.5 2.5v9A2.5 2.5 0 0 1 19 19.5H5A2.5 2.5 0 0 1 2.5 17V8A2.5 2.5 0 0 1 5 5.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="12.4" r="3.7" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
function build(){if(el)return;const root=document.querySelector('.wlg')||document.body;const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  el=document.createElement('div');el.id='wlPhoto';el.hidden=true;el.setAttribute('role','dialog');el.setAttribute('aria-label','사진 모드');
  el.innerHTML=`<div class="frame"></div><div class="flash"></div>
<div class="top"><button type="button" class="chip x">✕ 닫기</button><div class="ratio" role="group" aria-label="사진 비율">${Object.keys(RATIOS).map(r=>`<button type="button" data-r="${r}">${r}</button>`).join('')}</div>
<div class="opts"><button type="button" class="chip blur" aria-pressed="true">배경 흐림 켬</button><button type="button" class="chip mini" aria-pressed="false">미니어처</button></div></div>
<div class="zoom" aria-label="줌"><b class="zi" role="button" aria-label="가까이">+</b><input type="range" min="0" max="1000" step="1" aria-label="줌(가까이·멀리)"><b class="zo" role="button" aria-label="멀리">−</b></div>
<button type="button" class="shut" aria-label="사진 찍기"></button>
<button type="button" class="thumb" aria-label="방금 찍은 사진"><img alt="방금 찍은 사진"><span></span></button>
<div class="viewer" hidden role="dialog" aria-label="찍은 사진"><img alt="찍은 사진"><p></p><div class="row"><button type="button" class="chip dl">다시 내려받기</button><button type="button" class="chip cl">닫기</button></div></div>`;
  root.appendChild(el);frameEl=el.querySelector('.frame');thumb=el.querySelector('.thumb');viewer=el.querySelector('.viewer');zoomIn=el.querySelector('input');
  const q=s=>el.querySelector(s),stop=e=>e.stopPropagation();
  el.addEventListener('pointerdown',e=>{if(e.target.closest('button,input,.zoom,.viewer'))e.stopPropagation();});
  q('.x').addEventListener('click',exit);q('.shut').addEventListener('click',shoot);
  el.querySelectorAll('.ratio button').forEach(b=>b.addEventListener('click',()=>{PH.ratio=b.dataset.r;sfx('ui-click');layout();}));
  q('.blur').addEventListener('click',()=>{PH.blur=!PH.blur;sfx('ui-click');layout();});q('.mini').addEventListener('click',()=>{PH.mini=!PH.mini;sfx('ui-click');layout();});
  zoomIn.addEventListener('input',()=>{PH.dGoal=sToD(+zoomIn.value/1000);});['pointerdown','pointermove','touchmove','touchstart'].forEach(ev=>zoomIn.addEventListener(ev,stop,{passive:true}));
  q('.zi').addEventListener('click',()=>setD(PH.dGoal/1.35));q('.zo').addEventListener('click',()=>setD(PH.dGoal*1.35));
  thumb.addEventListener('click',()=>{if(touchDev())save();else openViewer();});q('.cl').addEventListener('click',closeViewer);q('.dl').addEventListener('click',()=>{if(PH.lastURL)download(PH.lastURL,PH.lastFile.name);});
  viewer.addEventListener('pointerdown',e=>{if(e.target===viewer)closeViewer();});
  window.addEventListener('resize',()=>{layout();});
  /* 끌기 = 둘레 돌기, 두 손가락 = 거리, 휠 = 거리 (따라가기 카메라의 끌기는 사진 모드 동안 쉰다 — 08이 cam.on을 끔) */
  const cv=ctx.renderer.domElement,pts=new Map();let pinch=null;
  cv.addEventListener('pointerdown',e=>{if(!on)return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pts.size===2){const [a,b]=[...pts.values()];pinch={s:Math.hypot(a.x-b.x,a.y-b.y),d:PH.dGoal};}});
  cv.addEventListener('pointermove',e=>{if(!on)return;const p=pts.get(e.pointerId);if(!p)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
    if(pinch&&pts.size>=2){const [a,b]=[...pts.values()],s=Math.hypot(a.x-b.x,a.y-b.y);if(s>10)setD(pinch.d*pinch.s/s);return;}
    if(pts.size===1){PH.yaw-=dx*.006;PH.pitch=Math.min(P_MAX,Math.max(P_MIN,PH.pitch+dy*.004));}});
  const end=e=>{pts.delete(e.pointerId);if(pts.size<2)pinch=null;};cv.addEventListener('pointerup',end);cv.addEventListener('pointercancel',end);
  cv.addEventListener('wheel',e=>{if(!on)return;e.preventDefault();setD(PH.dGoal*Math.exp(e.deltaY*.0015));},{passive:false});}
/* 게임 중 오른쪽 위 메뉴 바로 아래 '사진' 단추 — 메뉴(#wlMenu, game/front)가 생긴 뒤에 끼워 넣는다 */
function placeBtn(){if(btn&&btn.isConnected)return;const menu=document.getElementById('wlMenu');if(!menu)return;
  if(!btn){btn=document.createElement('button');btn.type='button';btn.id='wlCamBtn';btn.className='wl-chip';btn.innerHTML=CAM_SVG+'<span>사진</span>';btn.setAttribute('aria-label','사진 찍기 모드');
    btn.addEventListener('click',()=>{btn.blur();enter();});}
  menu.insertBefore(btn,menu.children[1]||null);}
/* 사진 모드 키(game/controls가 먼저 물어봄): 소비했으면 true */
function key(e){if(e.code==='KeyC'){if(!e.repeat)toggle();return true;}if(!on)return false;
  if(!viewer.hidden&&(e.code==='Escape'||e.code==='Space')){closeViewer();return true;}
  if(e.code==='Escape'){exit();return true;}if(e.code==='Space'){if(!e.repeat)shoot();return true;}
  if(['KeyE','KeyF','KeyB','KeyH','KeyO','ShiftLeft','ShiftRight','Enter'].includes(e.code))return true; // 사진 모드에서는 말 걸기·도구·가방·도움말·대쉬를 쉰다
  return false;}
function tick(){if(SHOT)return;placeBtn();}
function initPhoto(c){if(SHOT)return;ctx=c;mobile=c.mobile;controlHooks.photoKey=key;build();setInterval(tick,500);tick();
  window.wlPhoto={enter,exit,shoot,state:PH,active:()=>on,setRatio:r=>{PH.ratio=r;layout();},setZoom:d=>{setD(d);PH.d=PH.dGoal;headPt(PH.tgt);},setAngle:(y,p)=>{PH.yaw=y;PH.pitch=p;},setBlur:b=>{PH.blur=!!b;layout();},setMini:b=>{PH.mini=!!b;layout();}};}
const active=()=>on;
export {active,cameraTick,enter,exit,initPhoto,render,shift,shoot,toggle};
