/* 원더룹 베이스캠프 — 어두운 곳 강조(림 라이트)·이동·동작 세트·포즈 */
import * as THREE from 'three';
import {PI,QUALITY,blobTex,footTex,lin,pencil,rng,scene,softMat} from './01-textures.js';
const blinkR=rng('blink',{afterLoad:true}); // 깜빡임 간격 (예전엔 로딩 뒤 첫 난수를 이어 썼다)
import {blocked,groundY} from './02-zone.js';
import {flags} from './game/state.js';
import {hint} from './game/ui.js';
import {HIP,SM,WL,WLS,antennae,arms,eyes,hoodParts,legs,neck,shirtU,skin,spine,wlBody} from './04-character.js';
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
// 걸을 수 있는 곳·장애물·땅 높이는 지금 구역이 정한다 (02 blocked·groundY)
function hopWL(){if(wlHop<=0)wlHop=1;}
function stopWalk(){wlTarget=null;markerA=0;} // 구역을 옮길 때
function setWalkTarget(x,z){wlTarget={x,z};marker.position.set(x,groundY(x,z)+0.06,z);markerA=1;}
/* ---------- 동작 세트 ---------- */
const ACTIONS=['서기','걷기','뛰기','두리번','들여다보기','기어오르기','멈칫','나침반 보기','손 흔들기'];
const ACT_FACE={'뛰기':'신남','두리번':'궁금','들여다보기':'궁금','멈칫':'놀람','나침반 보기':'궁금','손 흔들기':'기쁨'};
function runPose(ph){const s=Math.sin(ph);return{kx0:Math.max(0,-s)*1.2+.15,kx1:Math.max(0,s)*1.2+.15,lx0:s*.85-.15,lx1:-s*.85-.15,ly0:.3+Math.max(0,s)*.13,ly1:.3+Math.max(0,-s)*.13,ax0:-s*1.1,ax1:s*1.1,az0:-.45,az1:.45,bx:.14,bz:s*.05,by:Math.abs(Math.cos(ph))*.09,hx:-.12,wy:Math.abs(s)*.05};}
function actionPose(A,t){
 if(A==='걷기'){const ph=t*8,s=Math.sin(ph);return{lx0:s*.5,lx1:-s*.5,ly0:.3+Math.max(0,s)*.08,ly1:.3+Math.max(0,-s)*.08,ax0:-s*.6,ax1:s*.6,az0:-.32,az1:.32,bx:.04,bz:s*.06,by:Math.abs(Math.cos(ph))*.05};}
 if(A==='뛰기')return runPose(t*13);
 if(A==='두리번'){const k=t*1.1,sk=Math.sin(k);return{hy:sk*.75*(.6+.4*Math.abs(Math.sin(k*.5))),hx:-.06,hz:sk*.06,bz:sk*.03,az0:-.38,az1:.38,ax0:.1*sk,ax1:-.1*sk};}
 if(A==='들여다보기'){const b=Math.sin(t*2)*.02;return{wy:-.12+b*.3,lx0:-1.2,lx1:-1.2,kx0:1.9,kx1:1.9,ly0:.3,ly1:.3,bx:.32,hx:.28+b,hy:Math.sin(t*.8)*.15,ax0:-.55,ax1:-.55,az0:-.16,az1:.16,ex0:-.75,ex1:-.75,by:0,bz:0};}
 if(A==='기어오르기'){const ph=t*3.2,s=Math.sin(ph);return{ax0:-1.75+s*.35,ax1:-1.75-s*.35,az0:-.62,az1:.62,ex0:-.25-Math.max(0,-s)*.35,ex1:-.25-Math.max(0,s)*.35,lx0:-.6-s*.55,lx1:-.6+s*.55,kx0:.9+s*.5,kx1:.9-s*.5,ly0:.3+Math.max(0,s)*.1,ly1:.3+Math.max(0,-s)*.1,bx:.08,hx:-.18,by:.02,wy:.03+Math.abs(s)*.02};}
 if(A==='멈칫'){const c=t%2.6,e=Math.min(1,c<.18?c/.18:Math.max(0,1-(c-1.6)/.8));return{wy:c<.3?.07*Math.sin(c/.3*PI):0,ax0:-.4*e,ax1:-.4*e,az0:-1.25*e-.32*(1-e),az1:1.25*e+.32*(1-e),bx:-.16*e,hx:-.18*e,lx0:-.15*e,lx1:.15*e};}
 if(A==='나침반 보기'){const b=Math.sin(t*1.5)*.03;return{ax0:-.75+b,ax1:-.75+b,az0:-.22,az1:.22,ex0:-1.15,ex1:-1.15,ez0:.7,ez1:-.7,hx:.38,hz:Math.sin(t*.7)*.05,bx:.06,by:0};}
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
 U.action='서기';U.at=0;
 const ab=document.getElementById('actBtn');let ai=0;ab.addEventListener('click',()=>{ai=(ai+1)%ACTIONS.length;U.action=ACTIONS[ai];U.at=0;ab.textContent='동작: '+U.action;
   const f=ACT_FACE[U.action]||'기본';if(U.setExpr){U.setExpr(f);document.getElementById('exprBtn').textContent='표정: '+f;}});}
/* ---------- 뼈대 ----------
   뼈 이름 (블렌더 규칙, 좌우 .L/.R은 원더룹 기준 — 왼쪽이 +x)
     hips 엉덩이(고정) ─ thigh.L/R 넓적다리(엉덩이 관절) ─ shin.L/R 정강이(무릎) ─ foot.L/R 발(발목)
                      └ spine 몸통(엉덩이 축으로 숙임) ─ upperarm.L/R 위팔(어깨) ─ forearm.L/R 아래팔(팔꿈치)
                                                     ├ neck 목 ─ head 머리 ─ eye.L/R 눈(깜빡임) · antenna.L/R 개미탈 더듬이
                                                     ├ charm 배낭 키링 ─ charm_needle 키링 바늘
                                                     └ prop 손에 든 나침반 ─ prop_needle 바늘
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
    rd.drawImage(img,0,0);const src=rd.getImageData(0,0,S,S).data,dst=tex.image.data,row=S*4;
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
        sh.fragmentShader.replace('#include <map_fragment>','diffuseColor*=vWlCol;diffuseColor*=texture(uWlAtlas,vec3(vWlUv,vWlAtl.x));')
          .replace('#include <roughnessmap_fragment>','float roughnessFactor=vWlAtl.w;')
          .replace('#include <emissivemap_fragment>','totalEmissiveRadiance=vWlExt.xyz;')
          .replace('#include <lights_fragment_begin>','bool wlRecv=receiveShadow&&vWlRecv>.5;\n'+lfb)
          .replace('#include <dithering_fragment>','float wlFr=pow(1.0-clamp(dot(normalize(normal),normalize(vViewPosition)),0.0,1.0),2.2);gl_FragColor.rgb+=(uRimCol*wlFr*uRim+diffuseColor.rgb*uLift)*vWlExt.w;\n#include <dithering_fragment>');};
    m.customProgramCacheKey=()=>'wlatlas';return cache[k]=m;};})();
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
  shirtU.uInv.value.copy(wlBody.matrixWorld).invert();
  let moving=false;
  if(wlTarget){const dx=wlTarget.x-WL.position.x,dz=wlTarget.z-WL.position.z,d=Math.hypot(dx,dz);
    if(d<0.06)wlTarget=null;else{const st=Math.min(1.5*dt*(WL.userData.action==='뛰기'?1.9:1),d),nx=WL.position.x+dx/d*st,nz=WL.position.z+dz/d*st;
      let diff=Math.atan2(dx,dz)-WL.rotation.y;diff=Math.atan2(Math.sin(diff),Math.cos(diff));WL.rotation.y+=diff*Math.min(1,dt*10);
      if(!blocked(nx,nz)){WL.position.x=nx;WL.position.z=nz;moving=true;}
      else if(!blocked(nx,WL.position.z)){WL.position.x=nx;moving=true;}
      else if(!blocked(WL.position.x,nz)){WL.position.z=nz;moving=true;}
      else wlTarget=null;}}
  const GY=groundY(WL.position.x,WL.position.z); // 땅 높이 (평평한 방은 0)
  if(moving)wlPhase+=dt*11*(WL.userData.action==='뛰기'?1.6:1);
  const sw=moving?Math.sin(wlPhase):0;
  legs[0].position.y=0.3+Math.max(0,sw)*0.08;legs[1].position.y=0.3+Math.max(0,-sw)*0.08;
  legs[0].rotation.x=sw*0.5;legs[1].rotation.x=-sw*0.5;
  arms[0].rotation.x=-sw*0.6;arms[1].rotation.x=sw*0.6;
  body.rotation.z=sw*0.06;
  body.position.y=moving?Math.abs(Math.cos(wlPhase))*0.05:Math.sin(t*2.2)*0.012;
  let hopY=0,wave=0;if(wlHop>0){wlHop=Math.max(0,wlHop-dt*1.6);wave=Math.sin((1-wlHop)*PI);hopY=wave*0.4;}
  WL.position.y=GY+hopY*WLS;arms[0].rotation.z=-0.32-wave*2.2;arms[1].rotation.z=0.32+wave*2.2;
  {const th=(moving?0:Math.sin(t*0.9)*0.05)+(WL.userData.headTilt||0);neck.rotation.z=th;}
  {const C=WL.userData.charm;if(C&&C.g.visible){const tx=moving?.25+Math.sin(wlPhase*2)*.35:Math.sin(t*1.3)*.05,tz=moving?Math.sin(wlPhase)*.4:Math.sin(t*.9)*.04;
    C.vx+=((tx-C.ax)*60-C.vx*5)*dt;C.vz+=((tz-C.az)*60-C.vz*5)*dt;if(wlHop>.95)C.vx+=6*dt*20;
    C.ax=Math.max(-.05,C.ax+C.vx*dt);C.az+=C.vz*dt;C.g.rotation.x=C.ax;C.g.rotation.z=C.az;const N=WL.userData.charmNeedle;if(N)N.rotation.z=Math.sin(t*1.7)*.25+Math.sin(t*23)*.05;}}
  antennae.forEach((a,i)=>{a.rotation.z=Math.sin(t*3+i)*0.15+(moving?Math.sin(wlPhase)*0.2:0);a.rotation.x=Math.sin(t*2.3+i*2)*0.1;});
  blinkT-=dt;if(blinkT<0)blinkT=2.5+2.5*blinkR();const bl=blinkT<0.12?0.15:1;eyes.forEach(e=>e.scale.y=bl);
  wlBlob.position.set(WL.position.x,GY+0.046,WL.position.z);wlBlob.scale.setScalar((1-hopY*0.8)*WLS*0.8);
  markerA=Math.max(0,markerA-dt*1.2);marker.material.opacity=markerA*0.9;marker.scale.setScalar(1+(1-markerA)*0.6);
  {const U=WL.userData,A=U.action||'서기';U.at=(U.at||0)+dt;const at=U.at;
   let T=null;if(moving){if(A==='뛰기')T=runPose(wlPhase);}else if(A!=='서기')T=actionPose(A,at);
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
   else{U.pc=Object.assign({},base);body.rotation.x=0;body.position.z=0;neck.rotation.x=0;neck.rotation.y=0;legs.forEach(lg=>{lg.userData.knee.rotation.x=0;lg.userData.boot.rotation.x=-lg.rotation.x*.6;});arms.forEach(ap=>ap.userData.elbow.rotation.set(-.12,0,0));}
   const hold=A==='나침반 보기'&&!moving;U.holdW=Math.max(0,Math.min(1,(U.holdW||0)+(hold?1:-1)*dt*5));
   if(U.cprop){U.cprop.visible=U.holdW>.5;U.cprop.userData.nd.rotation.z=Math.sin(at*1.7)*.3+Math.sin(at*23)*.06;}
   if(U.thumbs)U.thumbs.forEach(th=>th.visible=U.holdW>.5);
   if(U.charm)U.charm.g.visible=!!U.outfit&&!(U.holdW>.5)&&flags.compass;} // 키링은 탐험복 + 나침반을 받은 뒤에만
  // 몸통: 위 계산은 발바닥 기준 몸 원점의 위치·회전 → 엉덩이 축 뼈(spine)로 옮김 (spine·(0,-HIP,0) = 예전 몸 변환)
  spine.rotation.copy(body.rotation);spine.position.copy(body.position).add(_hv.set(0,HIP,0).applyEuler(body.rotation));spine.position.y-=HIP;
  rigSync();
}
const walking=()=>!!wlTarget; // 영상 캡처: 걸어가서 도착했는지
export {hopWL,setWalkTarget,stopWalk,updateWL,walking,wlHit};
