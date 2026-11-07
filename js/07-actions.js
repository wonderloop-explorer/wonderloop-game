/* 원더룹 베이스캠프 — 어두운 곳 강조(림 라이트)·이동·동작 세트·포즈 */
import * as THREE from 'three';
import {PI,QUALITY,blobTex,footTex,lin,pencil,rng,scene,softMat} from './01-textures.js';
const blinkR=rng('blink',{afterLoad:true}); // 깜빡임 간격 (예전엔 로딩 뒤 첫 난수를 이어 썼다)
import {blocked,bouncerAt,floorAt,groundY,hasHeights,overlap,windAt,zone} from './02-zone.js';
import {flags} from './game/state.js';
import {canGlide} from './game/items.js'; // 활공: 구역 정보 glide(true 늘·false 안 함), 없으면 활공 아이템(민들레 솜털 우산)을 가졌을 때
import {hint} from './game/ui.js';
import {sfx} from './game/sound.js'; // 걸음·뛰어오름·내려앉음 소리 (개미굴 step·jump·land)
import {HIP,SM,WL,WLS,antennae,arms,eyes,hips,hoodParts,legs,neck,shirtU,skin,spine,wlBody} from './04-character.js';
/* 작은 부품은 그림자를 드리우지 않게 (그림자용으로 한 번 더 그리는 비용 절약) */
WL.updateMatrixWorld(true);{const sc=new THREE.Vector3();WL.traverse(o=>{if(!o.isMesh||!o.castShadow)return;o.geometry.computeBoundingSphere();o.getWorldScale(sc);if(o.geometry.boundingSphere.radius*Math.max(sc.x,sc.y,sc.z)<.1)o.castShadow=false;});}
/* 어두운 곳 가독성: 캐릭터 재질에 테두리 빛(림 라이트)과 약한 자체 밝기를 더함 — 주변이 어두울수록 강해짐 */
{const U=WL.userData;U.rimU={value:0};U.liftU={value:0};const rimCol={value:lin('#ffe6c4')};U.rimCol=rimCol;const seen=new Set();
 WL.traverse(o=>{if(!o.isMesh)return;(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{if(!m||!m.isMeshStandardMaterial||seen.has(m))return;seen.add(m);
   const prev=m.onBeforeCompile;m.onBeforeCompile=(sh,r)=>{if(prev)prev(sh,r);sh.uniforms.uRim=U.rimU;sh.uniforms.uLift=U.liftU;sh.uniforms.uRimCol=rimCol;
     sh.fragmentShader='uniform float uRim;uniform float uLift;uniform vec3 uRimCol;\n'+sh.fragmentShader.replace('#include <dithering_fragment>',
     'float wlFr=pow(1.0-clamp(dot(normalize(normal),normalize(vViewPosition)),0.0,1.0),2.2);gl_FragColor.rgb+=uRimCol*wlFr*uRim+diffuseColor.rgb*uLift;\n#include <dithering_fragment>');};
   m.customProgramCacheKey=()=> 'wlrim';});});}
// 발밑 동그란 그림자: 휴대폰 단계(진짜 그림자 없음)에서는 조금 크고 진하게 — 원더룹이 땅에 서 있어 보이게
const wlBlob=new THREE.Mesh(new THREE.PlaneGeometry(0.95,0.95),softMat(QUALITY.shadows?blobTex:footTex,QUALITY.shadows?0.45:0.9));if(!QUALITY.shadows)wlBlob.geometry.scale(1.35,1.35,1);wlBlob.rotation.x=-PI/2;scene.add(wlBlob);
const wlHit=[];WL.traverse(o=>{if(o.isMesh)wlHit.push(o);});
const marker=new THREE.Mesh(new THREE.RingGeometry(0.16,0.24,24),new THREE.MeshBasicMaterial({color:lin('#3fb5a8'),transparent:true,opacity:0,depthWrite:false}));marker.rotation.x=-PI/2;scene.add(marker);hint(marker); // 걷기 목표 표시 = 안내 표시(영상에서는 숨김)
let wlTarget=null,wlHop=0,wlPhase=0,blinkT=2.5,markerA=0;
/* 높이 이동 (구역에 platforms·bouncers가 있을 때만 — 없으면 예전처럼 땅 높이만):
   y 발 높이, vy 위아래 속도, air 공중, jump 튀는 발판이 정한 날아가기(가로 속도), glide 활공 정도(0~1).
   튀는 발판(버섯 갓)을 밟으면 정해진 꼭대기(top+height)까지 튀어 to에 내려앉는다 — 조작은 밟기만(어렵지 않게).
   발판 가장자리를 걸어 나가면 떨어지고, 구역 정보 glide:true인 곳에서는 떨어질 때 활공 물건(06 setGlideProp, 세계마다)을 머리 위로 펼쳐 천천히 내려온다. */
const GRAV=14,GLIDE=.9,V={y:0,vy:0,air:false,jump:null,lastB:null,glide:0,px:0,pz:0,sw:0,swX:0};WL.userData.vert=V;
function launch(b){const x=WL.position.x,z=WL.position.z,apex=b.top+b.height,vy0=Math.sqrt(2*GRAV*Math.max(.2,apex-V.y));
  V.lastB=b;V.vy=vy0;V.air=true;V.jump={vx:0,vz:0};wlTarget=null;markerA=0;sfx('jump');
  if(b.to){const yl=floorAt(b.to[0],b.to[1]),T=(vy0+Math.sqrt(2*GRAV*Math.max(0,apex-yl)))/GRAV;V.jump.vx=(b.to[0]-x)/T;V.jump.vz=(b.to[1]-z)/T;if(Math.hypot(V.jump.vx,V.jump.vz)>.01)WL.rotation.y=Math.atan2(V.jump.vx,V.jump.vz);}
  if(zone.cur.bounce)zone.cur.bounce(b);}
// 걸을 수 있는 곳·장애물·땅 높이는 지금 구역이 정한다 (02 blocked·groundY)
function hopWL(){if(wlHop<=0)wlHop=1;}
function stopWalk(){wlTarget=null;markerA=0;D.spd=0;D.dashT=0;} // 구역을 옮길 때·연출이 멈춰 세울 때 (직접 조작 속도도)
WL.userData.stopWalk=stopWalk; // 구역 연출이 원더룹을 멈춰 세울 때 (예: 매듭 앞에 서기)
/* 직접 조작 (개미굴 편 조작 그대로 — 키보드 WASD·방향키, 휴대폰 조이스틱. 08이 game/controls 입력을 카메라 방향으로 바꿔 매 프레임 넣는다):
   U.drive={x,z,run} 가고 싶은 방향(길이 0이면 멈춤) — 누르는 동안 바로 그쪽으로 걷고(눌러서 걷기 목표는 취소), 떼면 서서히 멈춘다.
   U.jumpReq 뛰어오르기(땅에 있을 때만), U.dashReq 대쉬(0.24초 앞으로 휙, 0.75초 동안 다시 못 함).
   빠르기는 개미굴 비율 그대로 원더룹 걸음에 맞춤: 걷기 · 대쉬 17(Shift·대쉬 단추). 원더룹은 달리지 않는다(2026-11-05 — 시리즈 규칙, 기준·동작 촬영의 shotDrive 달리기 ×8/5만 그대로). 속도는 초당 8로 따라가고 몸은 초당 10으로 돈다.
   점프는 개미굴과 같은 체공 시간(약 0.67초)에 키의 2/3쯤 — 높이 구역이 아니어도 뛴다. 촬영 모드는 직접 조작을 쓰지 않는다(기준 화면 그대로).
   움직임 효과(개미굴 그대로): 대쉬 — 몸을 0.45 앞으로 숙이고(초당 14로), 땅에 있으면 0.035초마다 발밑 먼지(0.5초 동안 커지며 흐려지고 떠오름), 더듬이는 뒤로 ·
     공중 — 두 팔을 들고 다리를 앞뒤로(-0.6·0.4), 올라갈 때 세로 1.08·가로 0.95로 늘고 내려올 때 1.02·0.99 · 착지 — 0.22초 동안 세로 0.84·가로 1.09까지 찌그러졌다 돌아옴.
     크기는 초당 22로 따라간다. 모두 원더룹이 뛰거나 대쉬할 때만이라 기준 화면에는 나오지 않는다. */
/* 걷기 빠르기(2026-11-03 — 개미굴 편 영상만큼: 개미굴 걷기 5·달리기 8을 키 비율로 줄여 3.4). 기준·동작 촬영(?shot, 영상 캡처 빼고)은 예전 1.5 그대로(기준 화면이 바뀌지 않게) */
const SHOTM=(()=>{const q=new URLSearchParams(location.search);return q.has('shot')&&!q.has('capture');})(),WALK=SHOTM?1.5:3.78; // 걷기 속도(설정값 — 아래 SPEED). 기본 3.78 = 개미굴 원본 걷기(초당 5)의 0.76배(2026-11-05 0.9배 4.5 → 30% 줄여 3.15 → 2026-11-07 느리다고 해서 20% 빠르게). 기준·동작 촬영은 예전 1.5
const DRV={walk:WALK,run:WALK*8/5,dash:SHOTM?WALK*17/5:17,dashT:.24,dashCd:.75,jumpVy:4.7},D={spd:0,dashT:0,cd:0,dx:0,dz:1,landT:0,lean:0,puffT:0,sy:1,sxz:1};
const LEG_A=SHOTM?.5:.75; // (기준·동작 촬영의 예전 걷기 — 다리를 엉덩이에서 흔들기만)
/* 걷기 속도 설정값(2026-11-05, 2026-11-07 고침): 걷기 = 3.78(개미굴 원본 5의 0.76배 — 처음 0.9배 4.5에서 30% 줄여 3.15, 다시 20% 빠르게), 대쉬 = 원본 17 그대로, 달리기 없음(DRV.run은 촬영 모드 shotDrive용). 톱니 메뉴 막대로 바로 바꾸고 이 기기에 기억('wl-speed4' —
   예전 'wl-speed'·'wl-speed2'에 남은 막대 값은 쓰지 않는다).
   기준·동작 촬영(SHOTM)은 예전 1.5 그대로 */
const SPEED={def:{walk:3.78},H:1.38,
  set(w){if(SHOTM)return;if(w)DRV.walk=+w;try{localStorage.setItem('wl-speed4',JSON.stringify({walk:DRV.walk}));}catch(e){}},
  reset(){SPEED.set(SPEED.def.walk);try{localStorage.removeItem('wl-speed4');}catch(e){}}};
if(!SHOTM)try{const o=JSON.parse(localStorage.getItem('wl-speed4')||'null');if(o&&o.walk)DRV.walk=+o.walk;}catch(e){}
const GT={f:0,w:0,DROP:.018}; // (시험 도구 호환 — 걸음 계산은 없음)
if(!SHOTM)hips.position.y=HIP-GT.DROP; // 서 있을 때 장화 바닥이 바닥에 닿게(2026-11-04 — 예전엔 1.8cm 떠 있었다)
/* 대쉬 먼지 (개미굴 puffs: 16개를 돌려 씀, 부드러운 둥근 빛 #f6e2cc) — 원더룹 크기에 맞춰 개미굴의 0.6배 */
const PUFF_S=.6,puffTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.5,'rgba(255,255,255,.5)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;})();
const puffs=[];let puffI=0;
function spawnPuff(x,y,z){if(!puffs.length)for(let i=0;i<16;i++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:puffTex,color:lin('#f6e2cc'),transparent:true,opacity:0,depthWrite:false}));sp.visible=false;puffs.push({sp,t:0});}
  const q=puffs[puffI++%puffs.length];q.t=.5;q.sp.position.set(x+(Math.random()-.5)*.3*PUFF_S,y+.18*PUFF_S,z+(Math.random()-.5)*.3*PUFF_S);q.sp.visible=true;if(!q.sp.parent)scene.add(q.sp);}
function tickPuffs(dt){for(const q of puffs){if(q.t<=0)continue;q.t-=dt;const k=1-q.t/.5;q.sp.scale.setScalar((.35+k*1.1)*PUFF_S);q.sp.material.opacity=.75*(1-k);q.sp.position.y+=dt*.5*PUFF_S;if(q.t<=0){q.sp.visible=false;scene.remove(q.sp);}}}
WL.userData.dashCool=()=>D.cd>0;
WL.userData.walkTo=(x,z)=>setWalkTarget(x,z);WL.userData.isWalking=()=>!!wlTarget||!!V.jump||D.spd>.3; // 게임 공통(game/interact)이 원더룹을 물건 앞으로 걸어가게 할 때
function setWalkTarget(x,z){wlTarget={x,z};marker.position.set(x,groundY(x,z)+0.06,z);markerA=1;}
function steerWalk(x,z){wlTarget={x,z};} // 키보드 이동: 목표 표시 없이 바로 앞을 목표로 (08이 매 프레임 갱신)
/* ---------- 동작 세트 ---------- */
const ACTIONS=['서기','걷기','뛰기','두리번','들여다보기','기어오르기','멈칫','나침반 보기','손 흔들기'];
const ACT_FACE={'뛰기':'신남','두리번':'궁금','들여다보기':'궁금','멈칫':'놀람','나침반 보기':'궁금','손 흔들기':'기쁨','머리 만져 보기':'놀람'};
function runPose(ph){const s=Math.sin(ph);return{kx0:Math.max(0,-s)*1.2+.15,kx1:Math.max(0,s)*1.2+.15,lx0:s*.85-.15,lx1:-s*.85-.15,ly0:.3+Math.max(0,s)*.13,ly1:.3+Math.max(0,-s)*.13,ax0:-s*1.1,ax1:s*1.1,az0:-.45,az1:.45,bx:.14,bz:s*.05,by:Math.abs(Math.cos(ph))*.09,hx:-.12,wy:Math.abs(s)*.05};}
function actionPose(A,t){
 if(A==='걷기'){const ph=t*8,s=Math.sin(ph);return{lx0:s*.5,lx1:-s*.5,ly0:.3+Math.max(0,s)*.08,ly1:.3+Math.max(0,-s)*.08,ax0:-s*.6,ax1:s*.6,az0:-.32,az1:.32,bx:.04,bz:s*.06,by:Math.abs(Math.cos(ph))*.05};}
 if(A==='뛰기')return runPose(t*13);
 if(A==='두리번'){const k=t*1.1,sk=Math.sin(k);return{hy:sk*.75*(.6+.4*Math.abs(Math.sin(k*.5))),hx:-.06,hz:sk*.06,bz:sk*.03,az0:-.38,az1:.38,ax0:.1*sk,ax1:-.1*sk};}
 if(A==='들여다보기'){const b=Math.sin(t*2)*.02;return{wy:-.12+b*.3,lx0:-1.2,lx1:-1.2,kx0:1.9,kx1:1.9,ly0:.3,ly1:.3,bx:.32,hx:.28+b,hy:Math.sin(t*.8)*.15,ax0:-.55,ax1:-.55,az0:-.16,az1:.16,ex0:-.75,ex1:-.75,by:0,bz:0};}
 if(A==='기어오르기'){const ph=t*3.2,s=Math.sin(ph);return{ax0:-1.75+s*.35,ax1:-1.75-s*.35,az0:-.62,az1:.62,ex0:-.25-Math.max(0,-s)*.35,ex1:-.25-Math.max(0,s)*.35,lx0:-.6-s*.55,lx1:-.6+s*.55,kx0:.9+s*.5,kx1:.9-s*.5,ly0:.3+Math.max(0,s)*.1,ly1:.3+Math.max(0,-s)*.1,bx:.08,hx:-.18,by:.02,wy:.03+Math.abs(s)*.02};}
 if(A==='멈칫'){const c=t%2.6,e=Math.min(1,c<.18?c/.18:Math.max(0,1-(c-1.6)/.8));return{wy:c<.3?.07*Math.sin(c/.3*PI):0,ax0:-.4*e,ax1:-.4*e,az0:-1.25*e-.32*(1-e),az1:1.25*e+.32*(1-e),bx:-.16*e,hx:-.18*e,lx0:-.15*e,lx1:.15*e};}
 if(A==='나침반 보기'){const b=Math.sin(t*1.5)*.03;return{ax0:-.75+b,ax1:-.75+b,az0:-.22,az1:.22,ex0:-1.15,ex1:-1.15,ez0:.7,ez1:-.7,hx:.38,hz:Math.sin(t*.7)*.05,bx:.06,by:0};}
 // 매듭 풀기(게임 로직 전용, 단추 목록 밖): 두 손을 앞으로 뻗어 손 높이의 매듭을 잡고(0.45초) 두어 번 잡아당긴다
 if(A==='매듭 풀기'){const r=Math.min(1,t/.45),c=Math.max(0,t-.45),tug=Math.abs(Math.sin(c*6.5))*Math.min(1,c*3);
   return{ax0:-1.3*r+tug*.3,ax1:-1.3*r+tug*.3,az0:-.1,az1:.1,ex0:-.2*r-tug*.6,ex1:-.2*r-tug*.6,ez0:.25*r,ez1:-.25*r,bx:.1*r-tug*.14,hx:.2,lx0:-tug*.12,lx1:-tug*.12};}
 // 게임 로직 전용 동작(단추 목록 밖 — 기준 촬영 그대로): 손으로 하는 상호작용(game/interact)이 부른다
 // 돌리기: 두 손을 가슴 앞으로 뻗어 큰 잎·손잡이를 잡고(0.4초) 한쪽으로 크게 돌린다(손이 원을 그림)
 if(A==='돌리기'){const r=Math.min(1,t/.4),c=Math.max(0,t-.4),w=Math.sin(c*3.2)*Math.min(1,c*2);
   return{ax0:-1.15*r+w*.25,ax1:-1.15*r-w*.25,az0:-.18*r+w*.12,az1:.18*r+w*.12,ex0:-.45*r,ex1:-.45*r,ez0:.3*r,ez1:-.3*r,bx:.08*r,bz:w*.06,hx:.14*r,hz:-w*.05};}
 // 뿌리기: 오른손에 든 물건(물뿌리개 등, 06·07 setHeld)을 앞으로 내밀어 기울였다 세웠다, 왼손은 허리께
 if(A==='뿌리기'){const r=Math.min(1,t/.35),c=Math.max(0,t-.35),tilt=(.5+.5*Math.sin(c*4.5))*Math.min(1,c*2);
   return{ax0:-.8*r-tilt*.12,az0:-.28*r,ex0:-.15*r-tilt*.35,ez0:.1*r,ax1:-.1,az1:.45,ex1:-.6,bx:.1*r,hx:.3*r,hy:-.12*r};}
 // 머리 만져 보기: 깜짝 놀라 두 손을 얼굴 옆(탈 테두리 아래)까지 올려 톡톡 만져 보며 위를 올려다본다(탈이 바뀌었을 때).
 // 약 2등신이라 팔이 정수리까지 닿지 않는다 — 손은 볼·탈 아래 테두리 높이가 한계(더 올리면 팔이 머리 뒤로 숨는다)
 if(A==='머리 만져 보기'){const r=Math.min(1,t/.5),pat=Math.sin(Math.max(0,t-.5)*8)*Math.min(1,Math.max(0,t-.5)*2);
   return{ax0:-2.35*r,ax1:-2.35*r,az0:-.9*r,az1:.9*r,ex0:-.35*r+pat*.12,ex1:-.35*r-pat*.12,ez0:1.25*r,ez1:-1.25*r,hx:-.1*r,hz:pat*.04,bx:-.04*r,wy:t<.3?.04*Math.sin(t/.3*PI):0};}
 // 앉기(게임 로직 전용 — 탈것 바닥에 앉음, game/ride pose): 다리를 앞으로 쭉 펴고 엉덩이를 바닥에, 두 손은 무릎 옆에
 if(A==='앉기'){const b=Math.sin(t*1.6)*.015;return{lx0:-1.45,lx1:-1.45,kx0:.12,kx1:.12,ly0:.3,ly1:.3,wy:-.235,bx:-.06+b,ax0:-.55,ax1:-.55,az0:-.42,az1:.42,ex0:-.35,ex1:-.35,hx:-.04,hz:Math.sin(t*.7)*.04};}
 if(A==='손 흔들기')return{az0:-1.5,ex0:-.15,ez0:-.55+Math.sin(t*9)*.3,ax0:-.15,az1:.35,ax1:0,hz:-.14,hx:-.05,bz:-.04};
 return null;}
/* 손에 드는 더듬이 나침반 + 쥐는 손(엄지) */
{const U=WL.userData;const g=new THREE.Bone();g.name='prop';g.position.set(0,.47,.34);g.rotation.x=-1.15;g.scale.setScalar(.14);g.visible=false;wlBody.add(g);
 const gold=new THREE.MeshStandardMaterial({map:pencil('#ffd04a','plain',{hatch:.3}),roughness:.6,emissive:lin('#e8a020'),emissiveIntensity:.3});
 g.add(new THREE.Mesh(new THREE.TorusGeometry(.42,.07,10,32),gold));g.add(new THREE.Mesh(new THREE.CircleGeometry(.4,32),SM('#fff3d8')));
 const back=new THREE.Mesh(new THREE.CircleGeometry(.46,32),gold);back.position.z=-.04;back.rotation.y=PI;g.add(back);
 const nd=new THREE.Bone();nd.name='prop_needle';nd.position.z=.04;g.add(nd);const n1=new THREE.Mesh(new THREE.ConeGeometry(.07,.3,8),SM('#e85a5a'));n1.position.y=.15;nd.add(n1);
 const n2=new THREE.Mesh(new THREE.ConeGeometry(.07,.3,8),SM('#5a6a9a'));n2.position.y=-.15;n2.rotation.z=PI;nd.add(n2);
 const hub=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),gold);hub.position.z=.07;g.add(hub);
 const brn=SM('#7a4a32');[-1,1].forEach(s=>{g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(s*.12,.44,0),new THREE.Vector3(s*.2,.74,0),new THREE.Vector3(s*.42,.86,0)]),10,.026,5),brn));
   const tp=new THREE.Mesh(new THREE.SphereGeometry(.06,8,6),gold);tp.position.set(s*.42,.86,0);g.add(tp);});
 g.userData.nd=nd;U.cprop=g;
 U.thumbs=arms.map((ap,i)=>{const s=i?1:-1;const th=new THREE.Mesh(new THREE.SphereGeometry(.03,12,10),skin);th.scale.set(1,1.15,1);th.position.set(-s*.05,-.165,.045);th.visible=false;ap.userData.elbow.add(th);return th;});
 /* 손에 든 물건 칸(오른손, 뼈 held): 세계 코드가 WL.userData.setHeld(obj)로 쥐여 준다(obj 원점 = 손잡이, +y가 위, +z가 앞). null이면 빈손.
    쥐고 있는 동안 오른손 엄지가 보인다. 아틀라스 밖에서 그리는 보통 메시. 들고 걸을 수 있다 */
 {const hb=new THREE.Bone();hb.name='held';hb.position.set(0,-.19,.03);arms[0].userData.elbow.add(hb);U.heldBone=hb;U.heldObj=null;
  U.setHeld=obj=>{hb.clear();U.heldObj=obj||null;if(obj)hb.add(obj);};}
 U.action='서기';U.at=0;
 const ab=document.getElementById('actBtn');let ai=0;ab.addEventListener('click',()=>{ai=(ai+1)%ACTIONS.length;U.action=ACTIONS[ai];U.at=0;ab.textContent='동작: '+U.action;
   const f=ACT_FACE[U.action]||'기본';if(U.setExpr){U.setExpr(f);document.getElementById('exprBtn').textContent='표정: '+f;}});}
/* ---------- 뼈대 ----------
   뼈 이름 (블렌더 규칙, 좌우 .L/.R은 원더룹 기준 — 왼쪽이 +x)
     hips 엉덩이(고정) ─ thigh.L/R 넓적다리(엉덩이 관절) ─ shin.L/R 정강이(무릎) ─ foot.L/R 발(발목)
                      └ spine 몸통(엉덩이 축으로 숙임) ─ upperarm.L/R 위팔(어깨) ─ forearm.L/R 아래팔(팔꿈치)
                                                     ├ neck 목 ─ head 머리 ─ eye.L/R 눈(깜빡임) · antenna.L/R 개미탈 더듬이
                                                     ├ charm 배낭 키링 ─ charm_needle 키링 바늘
                                                     ├ charm_<flag> 받은 아이템 키링(06 addCharm, 받은 뒤에만)
                                                     ├ glide_prop 활공할 때 머리 위로 펼치는 물건(06 setGlideProp)
                                                     └ prop 손에 든 나침반 ─ prop_needle 바늘
                         forearm.R ─ held 오른손에 든 물건(setHeld)
   동작 키 → 뼈 회전 (actionPose·runPose가 돌려주는 값, 0은 오른쪽 R·1은 왼쪽 L)
     lx 넓적다리 앞뒤 thigh.rotation.x · ly 넓적다리 높이 thigh.position.y · kx 무릎 shin.rotation.x (발목 foot은 자동)
     ax/az 어깨 앞뒤/옆 upperarm.rotation.x/z · ex/ez 팔꿈치 forearm.rotation.x/z
     bx/bz 몸 숙임/옆 기울임 spine.rotation.x/z · by 몸 높이 · hx/hy/hz 고개 neck.rotation.x/y/z · wy 몸 전체 높이 WL.position.y
   그리는 쪽: 부품 메시는 그대로 두고(보이지 않는 레이어 1), 재질이 같은 부품끼리 SkinnedMesh 하나로 합친다.
   부품 하나가 잎 뼈 하나 — 위 관절 뼈를 따라 움직이고, 표정·옷·탈 전환으로 숨긴 부품은 크기 0이 된다.
   그래서 setExpr·applyOutfit·pressHair 등은 지금처럼 부품을 다루면 된다. 머리카락은 pressHair가 정점을 고치므로 따로 그린다 */
const body=new THREE.Object3D(),_hv=new THREE.Vector3();
/* 텍스처 묶음(아틀라스): 캐릭터 색연필 텍스처(256×256)를 층으로 쌓은 텍스처 배열(DataArrayTexture) 한 장에 모은다.
   층마다 반복(RepeatWrapping)·밉맵·비등방 필터가 원래 텍스처와 똑같이 동작해 결과 이음매가 그대로 나온다
   (2D 한 장을 칸으로 나누면 반복할 때 칸 경계가 번지고 먼 거리에서 이웃 칸 색이 섞인다). 0번 층은 흰색(텍스처 없는 색 재질).
   층 영역: 기본(몸·옷·얼굴·모자·소품) 1~base-1 + 여유, 교체(세계마다 바뀌는 탈·소품) base~. 지금 교체 영역의 기본값은 개미탈.
   새 탈·소품: 부품을 붙이고 재질은 지금처럼 TM/SM/BM으로 만든 뒤, 처음 그릴 때 저절로 층이 잡힌다(탈은 hoodParts에 넣으면 교체 영역).
   세계를 바꿀 때 atlas.clear('swap') → 새 탈 부품을 보이게 하면 비운 층에 다시 채운다. 크기가 256이 아닌 텍스처는 넣지 않고 경고 */
const atlas=(()=>{
  const S=256,SPARE=4,SWAP=12,layer=new Map(),order=[];let tex=null,base=1,next={},end={};
  const A={S,layer,order,ver:0,get tex(){return tex;},get count(){return tex?tex.image.depth:0;}};
  const ok=img=>img&&img.width===S&&img.height===S;
  // 캔버스 → 층 (CanvasTexture는 위아래를 뒤집어 올리므로 줄 순서를 뒤집어 넣는다)
  let rd=null;function put(i,img){if(!rd){const c=document.createElement('canvas');c.width=c.height=S;rd=c.getContext('2d',{willReadFrequently:true});}
    rd.clearRect(0,0,S,S);rd.drawImage(img,0,0);const src=rd.getImageData(0,0,S,S).data,dst=tex.image.data,row=S*4;
    // 투명한 곳(알파 0)은 캔버스가 검정으로 남긴다 → 멀리서 작아지면(밉맵) 날개 가장자리가 검게 번진다. 보이는 곳의 평균 색으로 채운다(불투명 텍스처는 그대로)
    {let r=0,g=0,b=0,n=0,z=0;for(let k=0;k<src.length;k+=4){if(src[k+3]){r+=src[k];g+=src[k+1];b+=src[k+2];n++;}else z++;}
     if(z&&n){r=Math.round(r/n);g=Math.round(g/n);b=Math.round(b/n);for(let k=0;k<src.length;k+=4)if(!src[k+3]){src[k]=r;src[k+1]=g;src[k+2]=b;}}}
    for(let y=0;y<S;y++)dst.set(src.subarray((S-1-y)*row,(S-y)*row),(i*S+y)*row);order[i]=img;tex.needsUpdate=true;}
  A.build=(baseImgs,swapImgs)=>{base=1+baseImgs.length+SPARE;const n=base+SWAP;
    tex=new THREE.DataArrayTexture(new Uint8Array(S*S*4*n).fill(255,0,S*S*4),S,S,n);
    Object.assign(tex,{format:THREE.RGBAFormat,type:THREE.UnsignedByteType,colorSpace:THREE.SRGBColorSpace,wrapS:THREE.RepeatWrapping,wrapT:THREE.RepeatWrapping,
      magFilter:THREE.LinearFilter,minFilter:THREE.LinearMipmapLinearFilter,generateMipmaps:true,anisotropy:4});
    next={base:1,swap:base};end={base,swap:n};baseImgs.forEach(img=>A.add(img,'base'));swapImgs.forEach(img=>A.add(img,'swap'));};
  A.add=(img,region='base')=>{if(!img)return 0;if(layer.has(img))return layer.get(img);
    if(!ok(img)){console.warn('원더룹: 아틀라스에 넣을 수 없는 텍스처(256×256 캔버스만)',img);return 0;}
    if(next[region]>=end[region]){console.warn('원더룹: 아틀라스 '+region+' 영역이 가득 참');return 0;}
    const i=next[region]++;put(i,img);layer.set(img,i);return i;};
  A.clear=region=>{layer.forEach((i,img)=>{if(i>=(region==='swap'?base:1)&&i<end[region]){layer.delete(img);order[i]=null;}});next[region]=region==='swap'?base:1;A.ver++;};
  A.region=i=>i===0?'white':i<base?'base':'swap';
  return A;})();
WL.userData.atlas=atlas;
/* 재질 → 정점 값: 층·반복·거칠기(wlAtl), 색·불투명도(wlCol), 발광·림 라이트(wlExt). 원래 재질에서 그대로 읽으므로 옷을 바꿔도 같은 값이 나온다.
   림 라이트는 캐릭터 부품 모두에 켠다 — 예전엔 07 림 셰이더를 붙일 때 원더룹에 없던 재질(탐험복 셔츠·바지·롤업 단, 손 나침반)이 빠져 있었다 */
const minfo=new Map();
function matInfo(m,region){let r=minfo.get(m);if(r)return r;
  if(!m.isMeshStandardMaterial||m.metalness||m.flatShading||m.vertexColors||m.normalMap||m.alphaTest||(m.map&&(m.map.offset.x||m.map.offset.y||m.map.rotation)))console.warn('원더룹: 아틀라스가 다루지 않는 재질 설정',m);
  const L=m.map?atlas.add(m.map.image,region):0,rx=m.map?m.map.repeat.x:1,ry=m.map?m.map.repeat.y:1,e=m.emissive.clone().multiplyScalar(m.emissiveIntensity);
  r={L,atl:[L,rx,ry,m.roughness],col:[m.color.r,m.color.g,m.color.b,m.transparent?m.opacity:1],ext:[e.r,e.g,e.b,1],cls:m.side+(m.transparent?'t':''),side:m.side,transparent:m.transparent};
  minfo.set(m,r);return r;}
/* 아틀라스 재질: 앞면 불투명 / 양면 불투명 / 반투명(볼 터치) — 셰이더 계산은 원래 재질과 같은 순서라 같은 색이 나온다 */
const atlasMat=(()=>{const U=WL.userData,C=THREE.ShaderChunk,cache={};
  const lfb=C.lights_fragment_begin.replaceAll('( directLight.visible && receiveShadow )','( directLight.visible && wlRecv )');
  return(side,transparent)=>{const k=side+(transparent?'t':'');if(cache[k])return cache[k];
    const m=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,metalness:0,side,transparent});m.name='wl-atlas-'+k;
    m.onBeforeCompile=sh=>{sh.uniforms.uWlAtlas={value:atlas.tex};sh.uniforms.uRim=U.rimU;sh.uniforms.uLift=U.liftU;sh.uniforms.uRimCol=U.rimCol;
      sh.vertexShader='attribute vec4 wlCol;attribute vec4 wlAtl;attribute vec4 wlExt;attribute vec2 wlSh;\nvarying vec2 vWlUv;flat varying vec4 vWlCol;flat varying vec4 vWlAtl;flat varying vec4 vWlExt;flat varying float vWlRecv;\n'+
        sh.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\nvWlUv=uv*wlAtl.yz;vWlCol=wlCol;vWlAtl=wlAtl;vWlExt=wlExt;vWlRecv=wlSh.x;');
      sh.fragmentShader='uniform highp sampler2DArray uWlAtlas;uniform float uRim;uniform float uLift;uniform vec3 uRimCol;\nvarying vec2 vWlUv;flat varying vec4 vWlCol;flat varying vec4 vWlAtl;flat varying vec4 vWlExt;flat varying float vWlRecv;\n'+
        sh.fragmentShader.replace('#include <map_fragment>','diffuseColor*=vWlCol;diffuseColor*=texture(uWlAtlas,vec3(vWlUv,vWlAtl.x));if(diffuseColor.a<.004)discard;')
          .replace('#include <roughnessmap_fragment>','float roughnessFactor=vWlAtl.w;')
          .replace('#include <emissivemap_fragment>','totalEmissiveRadiance=vWlExt.xyz;')
          .replace('#include <lights_fragment_begin>','bool wlRecv=receiveShadow&&vWlRecv>.5;\n'+lfb)
          .replace('#include <dithering_fragment>','float wlFr=pow(1.0-clamp(dot(normalize(normal),normalize(vViewPosition)),0.0,1.0),2.2);gl_FragColor.rgb+=(uRimCol*wlFr*uRim+diffuseColor.rgb*uLift)*vWlExt.w;\n#include <dithering_fragment>');};
    m.customProgramCacheKey=()=>'wlatlas';return cache[k]=m;};})(); // 완전히 투명한 곳(탈 장식 텍스처의 투명한 둘레)은 버린다 — 깊이를 써서 뒤의 빛무리를 네모로 가리지 않게
// 그림자: 그림자를 드리우지 않는 부품은 그림자 패스에서만 크기 0으로 접는다
const atlasDepth=new THREE.MeshDepthMaterial();atlasDepth.onBeforeCompile=sh=>{sh.vertexShader='attribute vec2 wlSh;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed*=wlSh.y;');};
atlasDepth.customProgramCacheKey=()=>'wlatlasdepth';
const rigSync=(()=>{
  const keep=new Set([...(WL.userData.hairMeshes||[]),...(WL.userData.noMerge||[])]);
  const parts=[];WL.traverse(o=>{if(o.isMesh&&!keep.has(o))parts.push(o);});
  const inHood=o=>{for(let q=o;q&&q!==WL;q=q.parent)if(hoodParts.includes(q))return true;return false;};
  const mats=o=>Array.isArray(o.material)?o.material:[o.material];
  // 층 순서: 기본 영역(부품 순서 → 탐험복 재질), 교체 영역(개미탈) — 순서가 정해져 있어 굽기(로드맵 4)에서 그대로 쓴다
  const baseI=new Set(),swapI=new Set(),img=m=>m&&m.map&&m.map.image;
  parts.forEach(o=>{if(!inHood(o))mats(o).forEach(m=>img(m)&&baseI.add(img(m)));});(WL.userData.outfitMats||[]).forEach(m=>img(m)&&baseI.add(img(m)));
  parts.forEach(o=>{if(inHood(o))mats(o).forEach(m=>img(m)&&!baseI.has(img(m))&&swapI.add(img(m)));});
  atlas.build([...baseI],[...swapI]);
  const region=o=>inHood(o)?'swap':'base';
  // 재질 종류(앞면·양면·반투명)별로 부품 조각을 묶음 (재질 배열을 쓰는 부품은 그룹별로 나눔)
  const groups=new Map();
  parts.forEach((o,bi)=>{const g=o.geometry,ms=mats(o);
    const ranges=g.groups.length&&Array.isArray(o.material)?g.groups:[{start:0,count:g.index?g.index.count:g.attributes.position.count,materialIndex:0}];
    ranges.forEach(r=>{const k=matInfo(ms[r.materialIndex],region(o)).cls;if(!groups.has(k))groups.set(k,[]);groups.get(k).push({o,bi,r,mi:r.materialIndex});});});
  const skel=new THREE.Skeleton(parts);
  const meshes=[],entries=[];
  groups.forEach((list,cls)=>{const pos=[],nor=[],uv=[],si=[],sw=[],idx=[];let base=0;
    list.forEach(e=>{const g=e.o.geometry,P=g.attributes.position,N=g.attributes.normal,U=g.attributes.uv;e.v0=base;e.n=P.count;
      for(let i=0;i<P.count;i++){pos.push(P.getX(i),P.getY(i),P.getZ(i));if(N)nor.push(N.getX(i),N.getY(i),N.getZ(i));else nor.push(0,1,0);if(U)uv.push(U.getX(i),U.getY(i));else uv.push(0,0);si.push(e.bi,0,0,0);sw.push(1,0,0,0);}
      e.i0=idx.length;for(let i=e.r.start;i<e.r.start+e.r.count;i++)idx.push(base+(g.index?g.index.getX(i):i));e.ic=idx.length-e.i0;base+=P.count;});
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
    g.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(si,4));g.setAttribute('skinWeight',new THREE.Float32BufferAttribute(sw,4));
    g.userData.idx=base>65535?new Uint32Array(idx):new Uint16Array(idx);g.setIndex(new THREE.BufferAttribute(g.userData.idx.slice(),1));
    ['wlCol','wlAtl','wlExt'].forEach(a=>g.setAttribute(a,new THREE.Float32BufferAttribute(new Float32Array(base*4),4)));g.setAttribute('wlSh',new THREE.Float32BufferAttribute(new Float32Array(base*2),2));
    const f=matInfo(mats(list[0].o)[list[0].mi]),m=new THREE.SkinnedMesh(g,atlasMat(f.side,f.transparent));
    m.name='wl:'+m.material.name;m.castShadow=list.some(e=>e.o.castShadow);m.receiveShadow=true;m.customDepthMaterial=atlasDepth;m.frustumCulled=false;
    m.bindMode=THREE.DetachedBindMode;m.bind(skel,new THREE.Matrix4());m.userData.list=list;list.forEach(e=>{e.mesh=m;e.cls=cls;entries.push(e);});WL.add(m);meshes.push(m);});
  // 원래 부품은 화면·그림자에서 빼고(레이어 1) 클릭 판정에만 쓴다
  parts.forEach(o=>o.layers.set(1));
  // 잎 뼈 행렬 = 원더룹 기준 부품 행렬 (숨은 부품은 0) — 렌더러가 프레임마다 부른다
  const vis=new Uint8Array(parts.length),inv=new THREE.Matrix4(),tmp=new THREE.Matrix4(),Z=new Array(16).fill(0);
  skel.update=function(){inv.copy(WL.matrixWorld).invert();const bm=this.boneMatrices;
    for(let i=0;i<parts.length;i++){if(vis[i])tmp.multiplyMatrices(inv,parts[i].matrixWorld).toArray(bm,i*16);else bm.set(Z,i*16);}
    if(this.boneTexture)this.boneTexture.needsUpdate=true;};
  // 부품 재질이 바뀌면(옷 전환·탈 교체) 그 부품 정점의 재질 값만 다시 쓴다
  const write=e=>{const m=mats(e.o)[e.mi],f=matInfo(m,region(e.o));e.mat=m;e.ver=atlas.ver;
    if(f.cls!==e.cls){console.warn('원더룹: 부품 재질 종류(앞면·양면·반투명)가 바뀌어 아틀라스로 못 그림',e.o,m);return;}
    if(!f.L&&m.map){minfo.delete(m);return;}
    const a=e.mesh.geometry.attributes;for(let i=e.v0;i<e.v0+e.n;i++){a.wlCol.array.set(f.col,i*4);a.wlAtl.array.set(f.atl,i*4);a.wlExt.array.set(f.ext,i*4);a.wlSh.array.set([e.o.receiveShadow?1:0,e.o.castShadow?1:0],i*2);}
    ['wlCol','wlAtl','wlExt','wlSh'].forEach(k=>a[k].needsUpdate=true);};
  // 보이는 부품의 삼각형만 그리도록 인덱스를 앞으로 모은다 (보이는 부품이 바뀔 때만 — 옷·탈·표정 전환)
  const pack=m=>{const g=m.geometry,src=g.userData.idx,I=g.index;let n=0;for(const e of m.userData.list)if(vis[e.bi]){I.array.set(src.subarray(e.i0,e.i0+e.ic),n);n+=e.ic;}
    g.setDrawRange(0,n);I.clearUpdateRanges();I.addUpdateRange(0,n);I.needsUpdate=true;m.visible=n>0;};
  WL.userData.rig={skeleton:skel,meshes,parts,entries};
  return()=>{let changed=false;for(let i=0;i<parts.length;i++){let o=parts[i],v=1;while(o&&o!==WL){if(!o.visible){v=0;break;}o=o.parent;}if(vis[i]!==v){vis[i]=v;changed=true;}}
    if(atlas.ver!==entries.ver){minfo.clear();entries.ver=atlas.ver;}
    for(const e of entries)if(vis[e.bi]&&(e.mat!==mats(e.o)[e.mi]||e.ver!==atlas.ver))write(e);
    if(changed)meshes.forEach(pack);};})();
/* 스키닝 법선: three.js는 뼈 행렬을 법선에 그대로 곱한다. 부품 잎 뼈에는 납작하게 누른 크기가 들어 있어(귀·눈 등)
   보통 메시와 같은 역전치 행렬로 바꾼다 — 한 정점이 뼈 하나에만 붙어 있어 예전과 같은 법선이 나온다 */
{const c=THREE.ShaderChunk,from='objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;';
 if(c.skinnormal_vertex.includes(from))c.skinnormal_vertex=c.skinnormal_vertex.replace(from,'objectNormal = transpose( inverse( mat3( skinMatrix ) ) ) * objectNormal;');
 else console.warn('원더룹: 스키닝 법선 패치 실패');}
function updateWL(dt,t){
  shirtU.uInv.value.copy(wlBody.matrixWorld).invert();const PX0=WL.position.x,PZ0=WL.position.z;
  let moving=false;const H=hasHeights();
  {const U=WL.userData,dv=U.riding?null:U.drive,ml=dv?Math.hypot(dv.x,dv.z):0;if(D.cd>0)D.cd-=dt;if(SL.t>0)SL.t-=dt; // 직접 조작 (위 "직접 조작")
   let mx=Math.sin(WL.rotation.y),mz=Math.cos(WL.rotation.y);if(ml>.08){mx=dv.x/ml;mz=dv.z/ml;wlTarget=null;markerA=0;}
   if(U.dashReq){U.dashReq=false;if(D.cd<=0&&!U.riding&&!V.jump){sfx('dash');D.dashT=DRV.dashT;D.cd=DRV.dashCd;D.dx=mx;D.dz=mz;WL.rotation.y=Math.atan2(mx,mz);wlTarget=null;}}
   if(U.jumpReq){U.jumpReq=false;if(!V.air&&!V.jump&&!U.riding){V.vy=DRV.jumpVy;V.air=true;V.jumpT=0;sfx('jump');}}
   if(!wlTarget){D.spd+=((ml>.08?(SHOTM&&dv.run?DRV.run:DRV.walk*(dv.k??1)):0)-D.spd)*Math.min(1,dt*8); // 조이스틱은 미는 만큼 걷기(dv.k, controls JOY)
     if(ml>.08){let diff=Math.atan2(mx,mz)-WL.rotation.y;diff=Math.atan2(Math.sin(diff),Math.cos(diff));WL.rotation.y+=diff*Math.min(1,dt*10);}
     if(D.dashT>0){D.dashT-=dt;mx=D.dx;mz=D.dz;D.spd=DRV.dash;if(D.dashT<=0)D.spd=ml>.08?(SHOTM?DRV.run:DRV.walk):(SHOTM?DRV.walk*.4:2);}
     if(D.spd>.05&&!V.jump){const st=D.spd*dt,nx=WL.position.x+mx*st,nz=WL.position.z+mz*st,fy=H?V.y:undefined;
       if(slideGo(mx,mz,st,fy))moving=true;}}
   else D.spd=0;}
  if(V.jump){WL.position.x+=V.jump.vx*dt;WL.position.z+=V.jump.vz*dt;} // 튀어 날아가는 중: 걷기 대신
  else if(wlTarget&&!WL.userData.riding){const dx=wlTarget.x-WL.position.x,dz=wlTarget.z-WL.position.z,d=Math.hypot(dx,dz);
    if(d<0.06)wlTarget=null;else{const st=Math.min(DRV.walk*dt*(WL.userData.action==='뛰기'?1.9:1),d),nx=WL.position.x+dx/d*st,nz=WL.position.z+dz/d*st;
      let diff=Math.atan2(dx,dz)-WL.rotation.y;diff=Math.atan2(Math.sin(diff),Math.cos(diff));WL.rotation.y+=diff*Math.min(1,dt*10);
      const fy=H?V.y:undefined; // 높이가 있는 구역: 발보다 높은 발판 옆면은 막힘
      if(canGo(nx,nz,fy)){WL.position.x=nx;WL.position.z=nz;moving=true;}
      else if(canGo(nx,WL.position.z,fy)){WL.position.x=nx;moving=true;}
      else if(canGo(WL.position.x,nz,fy)){WL.position.z=nz;moving=true;}
      else if(slideGo(dx/d,dz/d,st,fy,true))moving=true;
      else wlTarget=null;}}
  let GY;const X=WL.position.x,Z=WL.position.z;
  if(WL.userData.riding){GY=WL.userData.riding.y;V.y=GY;V.vy=0;V.air=false;V.jump=null;V.glide=0;V.swX=0;WL.rotation.z=0;wlTarget=null;} // 탈것(game/ride)이 자리를 정하는 동안: 걷기·높이 계산 쉼
  else if(!H){GY=groundY(X,Z);if(V.air){V.vy-=GRAV*dt;V.y+=V.vy*dt;if(V.y<=GY){V.y=GY;V.air=false;V.vy=0;sfx('land');D.landT=.22;}GY=V.y;}else{V.y=GY;V.vy=0;} // 땅 높이 (평평한 방은 0), 점프 중이면 떨어지는 중
    V.jump=null;V.glide=0;if(V.swX){V.swX=0;WL.rotation.z=0;}}
  else{if(Math.hypot(X-V.px,Z-V.pz)>.5&&!V.jump){V.y=floorAt(X,Z);V.air=false;V.vy=0;} // 자리를 옮겼으면(구역 오가기·촬영) 그 자리 가장 높은 바닥에
    if(!V.air){const f=floorAt(X,Z,V.y);if(V.y-f>.3){V.air=true;V.vy=0;}else V.y=f; // 가장자리를 걸어 나가면 떨어짐
      const b=!V.air&&bouncerAt(X,Z);if(b&&b!==V.lastB)launch(b);else if(!b)V.lastB=null;}
    if(V.air){const prev=V.y;V.vy-=GRAV*dt;const w=windAt(X,Z,V.y);const gl=(zone.cur.glide===true||(zone.cur.glide!==false&&canGlide()))&&!V.jump&&(V.vy<-.5||(!!w&&!!w.up&&V.glide>.4));V.glide+=((gl?1:0)-V.glide)*Math.min(1,dt*8);
      if(gl){V.sw+=dt*2.6;V.vy=Math.max(V.vy,-GLIDE*(1+.45*Math.sin(V.sw*2)));} // 활공: 떨어지는 속도를 GLIDE(초당 0.9) 언저리로 — 둥실둥실 빨라졌다 느려졌다
      // 바람 구역(02 winds): 공중에서 dir 쪽으로 밀고(활공 중이면 온 힘, 아니면 절반), 바람길(up)은 활공 중 위로 띄운다. 막힌 곳으로는 밀지 않는다
      if(w&&!V.jump){const k=w.strength*(gl?1:.5)*dt,nx=WL.position.x+w.dir[0]*k,nz=WL.position.z+w.dir[1]*k;if(!blocked(nx,nz,V.y)){WL.position.x=nx;WL.position.z=nz;}
        if(w.up&&gl)V.vy+=(w.up-V.vy)*Math.min(1,dt*2);V.windT=(V.windT||0)+dt;}
      V.y+=V.vy*dt;const f=floorAt(X,Z,prev);if(V.vy<=0&&V.y<=f){V.y=f;V.air=false;V.vy=0;V.jump=null;sfx('land');D.landT=.22;}}
    else V.glide=Math.max(0,V.glide-dt*8);
    // 활공하는 동안 낙엽처럼 양옆으로 왔다 갔다(옆으로 실제로 움직이고, 움직이는 쪽으로 몸을 기울임)
    // 옆으로 움직이는 건 공중에서만 — 내려앉으면 그 자리에 서고(흔들린 만큼 되돌아 미끄러지지 않게) 몸 기울기만 풀린다
    if(V.air){const sx=Math.sin(V.sw)*.5*V.glide,d=sx-V.swX;V.swX=sx;if(d){const c=Math.cos(WL.rotation.y),sn=Math.sin(WL.rotation.y),nx=WL.position.x+c*d,nz=WL.position.z-sn*d;if(canGo(nx,nz,V.y)){WL.position.x=nx;WL.position.z=nz;}}} // 흔들려도 장애물 속으로는 들어가지 않게
    else V.swX=0;
    WL.rotation.z=-Math.cos(V.sw)*.28*V.glide;
    GY=V.y;}
  unstick(dt,H);
  V.px=X;V.pz=Z;
  if(moving){const s0=Math.floor(wlPhase/PI);
    // 발걸음(2026-11-04 — 발이 미끄러져 보이지 않게): 걷기는 다리를 ±0.75라디안 흔들어 한 걸음 2·0.3·sin(0.75)=0.41m, 위상 속도 = π·속도/한 걸음.
    // 달리기는 공중에 뜨는 구간이 있어 한 걸음 0.45×1.5. 기준·동작 촬영(SHOTM)은 예전 값(11, ±0.5) 그대로
    const sp0=D.spd>.05&&!wlTarget?D.spd:(WL.userData.action==='뛰기'?DRV.walk*1.9:DRV.walk),W0=SPEED.def.walk,sp=sp0<W0?Math.sqrt(sp0*W0):sp0; // 걷기보다 느리면(조이스틱 조금·서고 걷기 사이) 걸음 빠르기·다리 흔들기 둘 다 √(속도÷걷기)배 — 한 걸음 길이와 흔들기 폭이 함께 줄어 발이 안 미끄러짐
    wlPhase+=dt*(SHOTM?11*(D.spd>.05&&!wlTarget?Math.min(1.8,D.spd/DRV.walk):(WL.userData.action==='뛰기'?1.6:1)):sp*3.2); /* 촬영 모드가 아니면 개미굴 원본 그대로: 걸음 위상 = 속도 × 3.2(속도 0.9배면 걸음도 0.9배 — 발이 안 미끄러짐) */if(Math.floor(wlPhase/PI)!==s0&&!V.air&&!WL.userData.riding)sfx('step',{cue:false,minor:true});} // 발이 땅에 닿을 때마다 (개미굴 step)
  /* 걷기·달리기 (2026-11-05 — 개미굴 원본 그대로로 되돌림: antvillage 주인공 걷기 줄을 옮김). 다리 ±0.8·팔 ±0.7 × 세기(amt = 속도 ÷ 기본 걷기 속도, 최대 1 — 원본 '속도 ÷ 5'를 걷기 속도에 맞춤. 걸음 빠르기는 속도에 비례해 발이 미끄러지지 않음),
     무릎·발목은 굽히지 않고(장화는 다리와 한 덩어리), 다리를 들어 올리지 않고, 몸 들썩임 없이(원본은 몸 높이를 매 프레임 되돌려 들썩임이 화면에 안 나왔다) 고개만 좌우로 0.05.
     속도가 줄면 세기도 함께 줄어 서기로 이어진다. 촬영 모드(SHOTM)는 예전 걷기(1.5, 다리 흔들기 0.5) 그대로 */
  const amt=SHOTM?1:Math.min(1,Math.sqrt(D.spd>.05&&!wlTarget?D.spd/SPEED.def.walk:(wlTarget?DRV.walk/SPEED.def.walk:0)));WL.userData.walkAmt=moving?amt:0;
  const sw=moving?Math.sin(wlPhase):0;
  if(SHOTM){legs[0].position.y=0.3+Math.max(0,sw)*0.08;legs[1].position.y=0.3+Math.max(0,-sw)*0.08;
  legs[0].rotation.x=sw*LEG_A;legs[1].rotation.x=-sw*LEG_A;
  arms[0].rotation.x=-sw*0.6;arms[1].rotation.x=sw*0.6;
  body.rotation.z=sw*0.06;
  body.position.y=moving?Math.abs(Math.cos(wlPhase))*0.05:Math.sin(t*2.2)*0.012;}
  else{const a=moving?amt:0;legs[0].position.y=legs[1].position.y=0.3;legs[0].rotation.x=sw*.8*a;legs[1].rotation.x=-sw*.8*a;
  arms[0].rotation.x=-sw*.7*a;arms[1].rotation.x=sw*.7*a;body.rotation.z=0;body.position.y=Math.sin(t*2.2)*0.012*(1-a);}
  let hopY=0,wave=0;if(wlHop>0){wlHop=Math.max(0,wlHop-dt*1.6);wave=Math.sin((1-wlHop)*PI);hopY=wave*0.4;}
  if(H||V.air||WL.userData.airW>.001){const U=WL.userData;U.airW=(U.airW||0)+((V.air?1:0)-(U.airW||0))*Math.min(1,dt*10);wave=Math.max(wave,U.airW*.55,V.glide); // 공중에서는 팔을 들고(개미굴: 다리 앞뒤로), 활공은 두 팔로 물건을 받침
    if(U.airW>.001&&V.glide<.3){const a=U.airW;legs[0].rotation.x+=(-.6-legs[0].rotation.x)*a;legs[1].rotation.x+=(.4-legs[1].rotation.x)*a;}
    if(U.glideProp)U.glideProp.visible=V.glide>.4;}
  WL.position.y=GY+hopY*WLS;arms[0].rotation.z=-0.32-wave*2.2;arms[1].rotation.z=0.32+wave*2.2;
  {const th=(moving?(SHOTM?0:Math.sin(wlPhase)*.05*amt):Math.sin(t*0.9)*0.05)+(WL.userData.headTilt||0);neck.rotation.z=th;} // 원본: 걸을 때 고개 좌우 0.05
  // 배낭 키링(나침반·받은 아이템): 걸을 때 달랑달랑. 나침반 계산은 예전 그대로, 다른 키링도 같은 식으로 따로 흔들린다
  for(const C of WL.userData.charms||[WL.userData.charm]){if(C&&C.g.visible){const tx=moving?.25+Math.sin(wlPhase*2)*.35:Math.sin(t*1.3)*.05,tz=moving?Math.sin(wlPhase)*.4:Math.sin(t*.9)*.04;
    C.vx+=((tx-C.ax)*60-C.vx*5)*dt;C.vz+=((tz-C.az)*60-C.vz*5)*dt;if(wlHop>.95)C.vx+=6*dt*20;
    C.ax=Math.max(-.05,C.ax+C.vx*dt);C.az+=C.vz*dt;C.g.rotation.x=C.ax;C.g.rotation.z=C.az;const N=C===WL.userData.charm&&WL.userData.charmNeedle;
    /* 나침반이 어딘가를 가리킴(WL.userData.charmPoint={x,z,sec} — 세계 연출, 2026-11-02): 키링이 톡 흔들리고 바늘이 그쪽으로 돌아 떨다가 sec초 뒤 평소대로 */
    const CP=C===WL.userData.charm&&WL.userData.charmPoint;if(CP){if(!CP.t){CP.t=0;C.vx+=5;C.vz+=3.5;}CP.t+=dt;if(CP.t>CP.sec)WL.userData.charmPoint=null;}
    if(N){const free=Math.sin(t*1.7)*.25+Math.sin(t*23)*.05;if(CP){const a=Math.atan2(CP.x-WL.position.x,CP.z-WL.position.z)-WL.rotation.y,goal=Math.atan2(Math.sin(a),Math.cos(a))+Math.sin(t*19)*.06*Math.max(0,1-CP.t);
      const k=Math.min(1,CP.t/.35)*Math.min(1,Math.max(0,(CP.sec-CP.t)/.4));N.rotation.z=free+(goal-free)*k;}else N.rotation.z=free;}}}
  antennae.forEach((a,i)=>{a.rotation.z=Math.sin(t*3+i)*0.15+(moving?Math.sin(wlPhase)*0.2:0);a.rotation.x=Math.sin(t*2.3+i*2)*0.1+(D.dashT>0&&WL.userData.hw===1?.3:0);}); // 대쉬 중에는 더듬이가 뒤로(개미굴) — 더듬이가 있는 개미탈일 때만
  blinkT-=dt;if(blinkT<0)blinkT=2.5+2.5*blinkR();const bl=blinkT<0.12?0.15:1;eyes.forEach(e=>e.scale.y=bl);
  wlBlob.visible=!WL.userData.riding; // 탈것 위에서는 발밑 그림자 대신 탈것 그림자
  if(!H){wlBlob.position.set(WL.position.x,GY+0.046,WL.position.z);wlBlob.scale.setScalar((1-hopY*0.8)*WLS*0.8);}
  else{const f=floorAt(X,Z,V.y);wlBlob.position.set(X,f+0.046,Z);wlBlob.scale.setScalar((1-hopY*0.8-Math.min(.55,(V.y-f)*.18))*WLS*0.8);} // 발밑 그림자는 아래 바닥에, 높을수록 작게
  markerA=Math.max(0,markerA-dt*1.2);marker.material.opacity=markerA*0.9;marker.scale.setScalar(1+(1-markerA)*0.6);
  {const U=WL.userData,A=U.action||'서기';U.at=(U.at||0)+dt;const at=U.at;
   let T=null;if(moving){if(SHOTM&&(A==='뛰기'||(!wlTarget&&D.spd>DRV.walk*1.2)))T=runPose(wlPhase);}else if(A!=='서기')T=actionPose(A,at); /* 촬영 모드가 아니면 걷기·달리기는 아래 gait */
   U.aw=Math.max(0,Math.min(1,(U.aw||0)+(T?1:-1)*dt*6));
   const base={ex0:-.12,ex1:-.12,ez0:0,ez1:0,kx0:0,kx1:0,lx0:legs[0].rotation.x,lx1:legs[1].rotation.x,ly0:legs[0].position.y,ly1:legs[1].position.y,ax0:arms[0].rotation.x,ax1:arms[1].rotation.x,az0:arms[0].rotation.z,az1:arms[1].rotation.z,bx:0,bz:body.rotation.z,by:body.position.y,hx:0,hy:0,hz:neck.rotation.z,wy:WL.position.y/WLS};
   if(!U.pc)U.pc=Object.assign({},base);const tg=T?Object.assign({},base,T):base;for(const k in tg)U.pc[k]+=(tg[k]-U.pc[k])*Math.min(1,dt*10);
   const w=U.aw;
   if(w>0){const P=U.pc,L=k=>base[k]+(P[k]-base[k])*w;
     legs[0].rotation.x=L('lx0');legs[1].rotation.x=L('lx1');legs.forEach((lg,i)=>{const k=L(i?'kx1':'kx0');lg.userData.knee.rotation.x=k;lg.userData.boot.rotation.x=-(lg.rotation.x+k)*.85;});legs[0].position.y=L('ly0');legs[1].position.y=L('ly1');
     arms[0].rotation.x=L('ax0');arms[1].rotation.x=L('ax1');arms[0].rotation.z=L('az0');arms[1].rotation.z=L('az1');arms.forEach((ap,i)=>ap.userData.elbow.rotation.set(L(i?'ex1':'ex0'),0,L(i?'ez1':'ez0')));
     {const bxv=L('bx');body.rotation.x=bxv;body.rotation.z=L('bz');body.position.y=L('by')+.3-.3*Math.cos(bxv);body.position.z=-.3*Math.sin(bxv);}
     neck.rotation.set(L('hx'),L('hy'),L('hz'));
     WL.position.y=GY+L('wy')*WLS;}
   else{U.pc=Object.assign({},base);body.rotation.x=0;body.position.z=0;neck.rotation.x=0;neck.rotation.y=0;legs.forEach(lg=>{lg.userData.knee.rotation.x=0;lg.userData.boot.rotation.x=SHOTM?-lg.rotation.x*.6:0;});arms.forEach(ap=>ap.userData.elbow.rotation.set(-.12,0,0));}
   /* (2026-11-04~05의 '발을 디디는 걸음' gait·legIK는 2026-11-05 사용자 요청으로 빼고 개미굴 원본 걷기로 되돌림 — 위 '걷기·달리기') */
   const hold=A==='나침반 보기'&&!moving;U.holdW=Math.max(0,Math.min(1,(U.holdW||0)+(hold?1:-1)*dt*5));
   if(U.cprop){U.cprop.visible=U.holdW>.5;U.cprop.userData.nd.rotation.z=Math.sin(at*1.7)*.3+Math.sin(at*23)*.06;}
   if(U.thumbs)U.thumbs.forEach((th,i)=>th.visible=U.holdW>.5||(A==='매듭 풀기'&&!moving&&at>.35)||(A==='돌리기'&&!moving&&at>.3)||(i===0&&(!!U.heldObj||!!(U.glideProp&&U.glideProp.visible)))); // 쥘 때만 엄지(오른손은 물건을 들고 있는 동안 — 활공 물건도)
   /* 들고 다니는 물건(2026-11-04 — 버섯 랜턴): setHeld 물건에 userData.carry={ax,az,ex}가 있으면 서 있거나 걸을 때 오른팔을 그 각도로(앞으로 내밀어 듦, 걸으면 살짝 흔들림),
      userData.hang이면 물건이 팔 각도와 상관없이 늘 똑바로(손잡이에 매달린 채) — 다른 동작 중에는 그 동작 팔 그대로 */
   {const H=U.heldObj;if(U.showT>0)U.showT-=dt;const c=H&&(U.showT>0&&H.userData.show||H.userData.carry); // showT: 얻는 순간 번쩍 들어 보이기(game/mission — 물건 userData.show 자세)
  if(c&&(A==='서기'||moving)&&!WL.userData.riding){U.carryW=Math.min(1,(U.carryW||0)+dt*4);}else U.carryW=Math.max(0,(U.carryW||0)-dt*4);
    if(c&&U.carryW>0){const w=U.carryW,sw=moving?Math.sin(wlPhase)*.12:0,e=arms[0].userData.elbow;arms[0].rotation.x+=(c.ax+sw-arms[0].rotation.x)*w;arms[0].rotation.z+=(c.az-arms[0].rotation.z)*w;e.rotation.x+=(c.ex-e.rotation.x)*w;}
    if(H&&H.userData.hang){H.parent.getWorldQuaternion(_hq).invert();WL.getWorldQuaternion(_hq2);H.quaternion.copy(_hq).multiply(_hq2);
    const L=H.userData.showLift||0;U.liftW=(U.liftW||0)+((U.showT>0?1:0)-(U.liftW||0))*Math.min(1,dt*8);if(L){const v=_hv.set(0,L*U.liftW/(H.parent.getWorldScale(_hs).y||1),0).applyQuaternion(_hq);H.position.copy(v);}} /* 들어 보일 때는 손 위로 들어 올림(월드 위쪽으로 showLift) */}
   if(U.charm)U.charm.g.visible=!(U.holdW>.5)&&flags.compass; // 키링은 나침반을 받은 뒤에만(평상복·탐험복 모두 배낭에)
   (U.charms||[]).forEach(C=>{if(C.flag)C.g.visible=!!flags[C.flag];}); // 받은 아이템 키링은 받은 뒤에만 (game/items, 06 addCharm)
   (U.badges||[]).forEach(B=>B.g.visible=!!flags[B.flag]); // 꾸미기(배지)도 받은 뒤에만 (06 addBadge)
   if(U.hoodMorph)U.hoodMorph.tick(dt); // 탈 모습 바뀌기 연출 (06 morphHood)
   for(let i=0;i<(U.hoods||[]).length;i++){const H=U.hoods[i];if(H.mod&&H.mod.tick&&H.press)H.mod.tick(H.press.g,dt,t,U,U.hw===i&&!U.hoodMorph);}} // 탈의 매 프레임 효과(핀 화관 별가루 — 쓰고 있을 때만 새로 나오고, 벗으면 남은 것만 사라짐)
  // 개미굴 움직임 효과: 대쉬 숙임·먼지, 공중 늘어남, 착지 찌그러짐 (위 "움직임 효과")
  D.lean+=((D.dashT>0?.45:0)-D.lean)*Math.min(1,dt*14);if(D.lean>.001)body.rotation.x=Math.max(body.rotation.x,D.lean); // 달리기 자세의 숙임과 겹치지 않게 — 모두 합쳐 개미굴처럼 0.45
  if(D.dashT>0&&!V.air){D.puffT-=dt;if(D.puffT<=0){spawnPuff(WL.position.x,GY,WL.position.z);D.puffT=.035;}}if(puffs.length)tickPuffs(dt);
  {let sy=1,sxz=1;if(D.landT>0){D.landT-=dt;const k=Math.sin(Math.max(0,D.landT)/.22*PI);sy=1-.16*k;sxz=1+.09*k;}else if(V.air&&V.glide<.3){sy=V.vy>0?1.08:1.02;sxz=V.vy>0?.95:.99;}
   if(sy!==1||Math.abs(D.sy-1)>1e-4||Math.abs(D.sxz-1)>1e-4){D.sy+=(sy-D.sy)*Math.min(1,dt*22);D.sxz+=(sxz-D.sxz)*Math.min(1,dt*22);if(Math.abs(D.sy-1)<1e-4&&sy===1){D.sy=1;D.sxz=1;}WL.scale.set(WLS*D.sxz,WLS*D.sy,WLS*D.sxz);}}
  // 몸통: 위 계산은 발바닥 기준 몸 원점의 위치·회전 → 엉덩이 축 뼈(spine)로 옮김 (spine·(0,-HIP,0) = 예전 몸 변환)
  spine.rotation.copy(body.rotation);spine.position.copy(body.position).add(_hv.set(0,HIP,0).applyEuler(body.rotation));spine.position.y-=HIP;
  // 활공 물건은 오른손에 쥔다(2026-11-02): 물건 원점(줄기 아래 끝)을 오른손 자리에, 몸과 같은 방향으로 곧게 — 머리 위로 오는 모양은 물건 쪽(민들레는 줄기가 휘어 머리 위로)
  {const U=WL.userData,G=U.glideProp;if(G&&G.visible&&U.heldBone){WL.updateMatrixWorld(true);U.heldBone.getWorldPosition(_gp);G.parent.worldToLocal(_gp);G.position.copy(_gp);G.quaternion.identity();}}
  rigSync();
}
/* 갇힘 안전장치(2026-11-02): 장애물 속에 들어가 있으면 덜 파고드는 쪽으로는 걸을 수 있다(canGo).
   그래도 3초 넘게 움직이려는데(조이스틱·키) 제자리면 가까운 열린 곳으로 부드럽게 밀어내고, 가까이 없으면 마지막으로 서 있던 안전한 자리로 옮긴다.
   안전한 자리 = 땅(또는 발판) 위에 서 있고, 장애물에 닿지 않고, 사방 0.35m도 열려 있는 곳(0.5초마다 기억) */
/* 경계 미끄러짐(2026-11-04, 시리즈 공통 — 경계에 닿아도 툭 멈추거나 떨지 않고 벽·기둥을 따라 비켜 간다, 안내 글 없음):
   가려는 쪽이 막히면 15°씩 꺾어(최대 75°) 열린 쪽으로, 빠르기는 꺾은 만큼 줄여(cos) 벽을 따라 미끄러지듯. 꺾는 쪽은 처음 막힌 곳의 기울기(덜 파고드는 쪽)로 정하고
   닿아 있는 동안 기억해 좌우로 번갈아 떨지 않게. 직접 조작(조이스틱·WASD)은 이것만, 눌러서 걷기(walkTo)는 예전 축 미끄러짐 뒤에 이것(기준 촬영 그대로) */
const SL={side:0,t:0},_hq=new THREE.Quaternion(),_hq2=new THREE.Quaternion(),_hs=new THREE.Vector3();
function slideGo(mx,mz,st,fy,only=false){const x=WL.position.x,z=WL.position.z;
  if(!only&&canGo(x+mx*st,z+mz*st,fy)){WL.position.x=x+mx*st;WL.position.z=z+mz*st;SL.t=0;return true;}
  if(SL.t<=0||!SL.side){const e=.06,tx=x+mx*st*3,tz=z+mz*st*3,gx=overlap(tx+e,tz,fy)-overlap(tx-e,tz,fy),gz=overlap(tx,tz+e,fy)-overlap(tx,tz-e,fy); // 막힌 곳의 기울기 → 덜 파고드는 쪽
    SL.side=(mx*gz-mz*gx)>=0?1:-1;}
  SL.t=.35;
  for(let i=1;i<=5;i++)for(const sd of [SL.side,-SL.side]){const a=i*.2618*sd,c=Math.cos(a),sn=Math.sin(a),vx=mx*c-mz*sn,vz=mx*sn+mz*c,k=st*c,nx=x+vx*k,nz=z+vz*k;
    if(canGo(nx,nz,fy)){WL.position.x=nx;WL.position.z=nz;SL.side=sd;return true;}}
  return false;}
function canGo(nx,nz,fy){if(!blocked(nx,nz,fy))return true;const c=overlap(WL.position.x,WL.position.z,fy);return c>0&&overlap(nx,nz,fy)<c-1e-4;}
const ST={t:0,ax:0,az:0,safe:null,safeT:0,push:null};
const openAt=(x,z,y)=>!blocked(x,z,y)&&[[.35,0],[-.35,0],[0,.35],[0,-.35]].every(([a,b])=>!blocked(x+a,z+b,y));
function unstick(dt,H){const U=WL.userData,X=WL.position.x,Z=WL.position.z,fy=H?V.y:undefined;
  if(ST.push){const p=ST.push,k=Math.min(1,dt*7);WL.position.x+=(p.x-X)*k;WL.position.z+=(p.z-Z)*k;if(Math.hypot(p.x-WL.position.x,p.z-WL.position.z)<.02)ST.push=null;return;}
  if(!V.air&&!U.riding){ST.safeT+=dt;if(ST.safeT>.5){ST.safeT=0;if(openAt(X,Z,fy))ST.safe={x:X,z:Z};}}
  const dv=U.riding?null:U.drive,want=!!dv&&Math.hypot(dv.x,dv.z)>.08&&!V.air;
  if(!want||Math.hypot(X-ST.ax,Z-ST.az)>.25){ST.t=0;ST.ax=X;ST.az=Z;return;}
  ST.t+=dt;if(ST.t<3)return;ST.t=0;
  let best=null;for(let r=.3;r<=4&&!best;r+=.2)for(let i=0;i<16;i++){const a=i/16*PI*2,x=X+Math.cos(a)*r,z=Z+Math.sin(a)*r;if(openAt(x,z,fy)){best={x,z};break;}}
  if(best)ST.push=best;else if(ST.safe){WL.position.x=ST.safe.x;WL.position.z=ST.safe.z;}}
const _gp=new THREE.Vector3();
const walking=()=>!!wlTarget; // 영상 캡처: 걸어가서 도착했는지
export {DRV,SPEED,GT as GAIT,hopWL,setWalkTarget,steerWalk,stopWalk,updateWL,walking,wlHit};
