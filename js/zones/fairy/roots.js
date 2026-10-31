/* 원더룹 요정의 숲 ① 뿌리 우체국 (땅속, 힐링) — 설계 메모 wonderloop-studio fairy-forest/wonderloop_fairy-forest_design.md
   기준 그림: "BG_단풍으로 물든 뿌리 우체국"(늦가을), "오프닝_뿌리우체국_도토리봉인편지"(2026-10-31).
   공간(앞이 열린 인형의 집처럼 카메라 쪽은 비움): 뒤쪽을 둘러싼 흙벽과 얽힌 굵은 뿌리(뒤 가운데 뿌리 아치), 왼쪽 우편 선반, 가운데 통나무 창구와 초록 잎 무늬 천,
   오른쪽 도토리 깍정이 의자·그루터기 탁자·땋은 둥근 깔개, 버섯 등불(lampSet — 진짜 조명은 가까운 하나), 뒤 뿌리를 타고 위 빛 구멍까지 오르는 하얀 실 우편길,
   늦가을 소품(마른 참나무 잎·도토리·밤·작은 버섯), 우체국 요정 둘(초록·회갈 모자).
   흐름: 들어오면 빛 하나가 앞장서 실패(실 감개) 쪽으로 → 창구 앞에 오면 오프닝 편지 클로즈업 그림 컷(ui.cut) → 엉킨 실 앞에서 허둥대는 토리(대사 두 줄, 도감 '토리')
     → 손 높이 실 위의 빛나는 매듭 세 곳에 차례로 다가가면 원더룹이 카메라 쪽을 보고 서서 두 손으로 잡아당겨 풀고(시점 기록 sfx 'knot') → 실이 아래부터 위로 환하게 켜지고 빛이 빛 구멍으로 올라감(도감 '하얀 실 우편길')
     → 토리가 같이 가자고 손짓, 이후 원더룹을 따라다님. 우편길 아래 뿌리 아치가 ② 버섯 마을로 가는 문(구역이 생기면 저절로 열린다 — 02 문 거르기).
   이야기 시계: 남은 잎 5장(hud.counter)을 화면 오른쪽 위에 — 이 구역에서는 줄지 않는다(② 등불 뒤 4).
   숨겨진 비밀: 우편 선반 왼쪽 끝 맨 아래 칸 뒤 — 반송 편지 더미 위에서 조는 늙은 우체부 요정.
   원더룹 크기는 그대로, 소품을 요정 크기에 맞춰 크게(토리 키 약 0.7). 난수 rng('fairy-roots:…'). 휴대폰 단계는 큰 소품마다 shadowBlob. */
import * as THREE from 'three';
import {M,PI,add,blob,boxAt,cylAt,group,lathe,lin,rng,shadowBlob} from '../../01-textures.js';
import * as G from '../../game/index.js';
import {FAIRY_CODEX,FAIRY_WORLD} from './world.js';
import {fairy,tori as makeTori} from './fairies.js';
export function build({root}){
const R=rng('fairy-roots:props'),rnd=(a,b)=>a+(b-a)*R();
const obstacles=[];
G.codex.setup(FAIRY_CODEX());
/* ---------- 바닥·흙벽 ---------- */
const floor=add(new THREE.CircleGeometry(11,40).rotateX(-PI/2),M('#d9ae80','plain',{rep:[8,8]}),0,0,-1,{cast:false,line:false});
// 흙벽: 뒤쪽 반을 둘러싼 타원 벽(안쪽 면), 앞쪽은 열어 둔다
const WA=9.5,WB=6.2,WH=10;
{const g=new THREE.CylinderGeometry(1,1,WH,48,4,true,PI/2-.02,PI+.04);g.scale(WA,1,WB);
 add(g,new THREE.MeshStandardMaterial({map:M('#c99a70','bark',{rep:[10,3]}).map,side:THREE.BackSide,roughness:1}),0,WH/2,0,{cast:false,line:false});}
/* ---------- 굵은 뿌리: 굽은 관(굵기가 끝으로 갈수록 가늘어짐) ---------- */
const barkM=M('#dcb58e','bark',{rep:[6,1]}),barkD=M('#c99f78','bark',{rep:[6,1]});
const rootCurves=[];
function rootTube(pts,r0,r1,mat=barkM,seg=40){const c=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p)));if(r0>.4)rootCurves.push({c,r0,r1});
  const g=new THREE.TubeGeometry(c,seg,1,9,false),P=g.attributes.position,v=new THREE.Vector3();
  for(let i=0;i<=seg;i++){const u=i/seg,ctr=c.getPointAt(u),r=r0+(r1-r0)*Math.pow(u,.8);for(let j=0;j<=9;j++){const k=i*10+j;v.fromBufferAttribute(P,k).sub(ctr).multiplyScalar(r).add(ctr);P.setXYZ(k,v.x,v.y,v.z);}}
  g.computeVertexNormals();return add(g,mat,0,0,0,{line:false});}
// 양옆 기둥 뿌리 (바닥에서 솟아 뒤 천장으로)
rootTube([[-7.6,-.3,-.6],[-6.9,1.8,-2.2],[-6.4,4.6,-4.2],[-4.6,7,-5.4],[-1.4,8.6,-5.9]],1.05,.45);
rootTube([[7.8,-.3,-.9],[7.1,2,-2.6],[6.3,4.8,-4.4],[4.2,7.2,-5.5],[1.2,8.4,-6]],1.1,.45);
// 뒤 가운데 뿌리 아치 (우편길이 그 아래로 지나 위로 오른다)
rootTube([[-2.4,-.3,-4.7],[-2.1,2.2,-5],[-1,3.9,-5.2],[.6,4.3,-5.3],[1.9,3,-5.1],[2.5,-.3,-4.8]],.62,.55);
rootTube([[-1.6,-.3,-5.6],[-.4,2.2,-5.8],[1.4,5.6,-5.9],[.2,7.6,-6]],.5,.3,barkD);
// 뒤 벽을 타고 오르는 뿌리들
[[[-4.6,-.2,-4.6],[-3.6,2.6,-5.4],[-2.4,5.2,-5.8],[-3.4,7.6,-5.8]],[[4.4,-.2,-4.7],[3.6,2.4,-5.5],[2.8,5,-5.9],[3.9,7.8,-5.7]],
 [[-6.2,3,-3.8],[-3.2,4.2,-5.4],[-.4,5,-6]],[[6,3.4,-4],[3.2,5.4,-5.5],[.8,6.6,-6]],[[-5.4,6.4,-4.4],[-2,6,-5.8],[1.8,7,-5.9],[5,6.2,-4.6]]]
 .forEach((p,i)=>rootTube(p,.42-i*.03,.2,i%2?barkD:barkM,30));
// 바닥을 기는 낮은 뿌리 (방 가장자리 — 걸어서 못 넘음)
[[[-7.4,.05,1.6],[-6.4,.25,.2],[-6.6,.1,-1.2]],[[7.4,.05,1.2],[6.6,.3,-.2],[6.9,.1,-1.6]],[[-3,.05,-5],[-3.8,.2,-4.6],[-4.6,.05,-4.9]]].forEach(p=>rootTube(p,.32,.18,barkD,20));
obstacles.push({c:[-6.4,.2,.9]},{c:[6.6,-.2,.9]},{c:[-6.6,-1.2,.7]},{c:[6.9,-1.6,.7]},{c:[-7.4,-.5,1.2]},{c:[7.6,-.9,1.2]},
  {c:[-2.3,-4.7,.75]},{c:[2.4,-4.8,.75]},{c:[-3.8,-4.6,.5]});
/* ---------- 버섯 등불 (가짜 빛 — 진짜 조명은 원더룹 가까운 하나) ---------- */
const LS=G.lamps.lampSet({parent:root,real:1,warm:.16});
function mushroomLamp(x,z,s,cap,y0=0){const g=group(x,y0,z,rnd(0,PI*2));
  cylAt(.2*s,.3*s,2.1*s,M('#f3e3c6','plain'),0,0,0,{parent:g});
  add(new THREE.SphereGeometry(1.1*s,14,8,0,PI*2,0,PI*.5),M(cap,'suede'),0,2.05*s,0,{parent:g,s:[1,.6,1],thr:30});
  const gm=new THREE.MeshStandardMaterial({color:lin('#fff1cf'),emissive:lin('#ffc372'),emissiveIntensity:.7,roughness:1,side:THREE.DoubleSide});
  add(new THREE.CircleGeometry(1.07*s,14),gm,0,2.04*s,0,{parent:g,rx:PI/2,line:false,cast:false});
  LS.add({x,y:y0+1.7*s,z,reach:7*s,glow:{y:y0+1.9*s,size:2.6*s,op:.55},pool:y0?null:{r:3.2*s,op:.4},emissive:[gm]});
  if(!y0){blob(x,z,1.2*s,1.2*s,.3);shadowBlob(x,z,.5*s,.5*s);obstacles.push({c:[x,z,.32*s]});}}
mushroomLamp(-6.1,-1.9,1.05,'#df7a42');mushroomLamp(6.0,-3.3,1.1,'#d9733e');mushroomLamp(-1.9,-4.3,.6,'#e5904f');mushroomLamp(6.3,1.7,.45,'#df7a42');mushroomLamp(-5.7,1.2,.4,'#e5904f');
/* ---------- 우편 선반 (왼쪽 뒤) ---------- */
const woodM=M('#a8744a','wood',{rep:[1,2]}),woodL=M('#bf8c5c','wood');
const SH={x:-4.05,z:-4.15,w:3.4,h:2.7,d:.55,cols:6,rows:5,ry:.22};
const shelf=group(SH.x,0,SH.z,SH.ry);
boxAt(SH.w,SH.h,.08,woodM,0,0,-SH.d/2,{parent:shelf});
for(let c=0;c<=SH.cols;c++)boxAt(.07,SH.h,SH.d,woodL,-SH.w/2+c*SH.w/SH.cols,0,0,{parent:shelf});
for(let r=0;r<=SH.rows;r++)boxAt(SH.w,.06,SH.d,woodL,0,r*(SH.h-.06)/SH.rows,0,{parent:shelf});
{// 칸마다 편지 묶음 (같은 상자를 여러 개 — InstancedMesh)
 const n=SH.cols*SH.rows*2,m=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),M('#f3e6cc','paper'),n),o=new THREE.Object3D(),cw=SH.w/SH.cols,ch=(SH.h-.06)/SH.rows;let k=0;
 for(let r=0;r<SH.rows;r++)for(let c=0;c<SH.cols;c++)for(let q=0;q<2;q++){if(R()<.18){o.scale.setScalar(0);}else{const h=rnd(.12,.32);
     o.position.set(-SH.w/2+(c+.5)*cw+(q?.11:-.1)+rnd(-.03,.03),r*ch+.06+h/2,rnd(-.05,.06));o.rotation.set(0,rnd(-.12,.12),R()<.2?rnd(-.3,.3):0);o.scale.set(rnd(.18,.24),h,rnd(.3,.4));}
   o.updateMatrix();m.setMatrixAt(k++,o.matrix);}
 m.castShadow=true;m.receiveShadow=true;shelf.add(m);
 // 묶음마다 노끈 (몇 개만)
 for(let i=0;i<9;i++){const c=Math.floor(R()*SH.cols),r=Math.floor(R()*SH.rows);boxAt(.25,.012,.42,M('#b9875a','plain'),-SH.w/2+(c+.5)*cw,r*ch+.2,0,{parent:shelf,line:false,cast:false});}}
obstacles.push({r:[-5.9,-2.2,-4.9,-3.55]});shadowBlob(SH.x,SH.z+.2,1.9,.5);
// 사다리 의자
{const st=group(-2.3,0,-3.1,.4);cylAt(.32,.32,.07,woodL,0,.6,0,{parent:st});[[-.2,-.2],[.2,-.2],[-.2,.2],[.2,.2]].forEach(([a,b])=>cylAt(.035,.04,.6,woodM,a,0,b,{parent:st,line:false}));obstacles.push({c:[-2.3,-3.1,.36]});shadowBlob(-2.3,-3.1,.4,.4);}
/* ---------- 숨겨진 비밀: 선반 왼쪽 끝 뒤, 반송 편지 더미 위에서 조는 늙은 우체부 요정 ---------- */
const secretG=group(-6.25,0,-4.55,.9);
for(let i=0;i<16;i++){const a=rnd(0,PI*2),d=rnd(0,.42),h=rnd(.03,.05);boxAt(rnd(.2,.26),h,rnd(.13,.17),M(R()<.5?'#efe2c6':'#e6d3b0','paper'),Math.cos(a)*d,i*.022*(1-d),Math.sin(a)*d,{parent:secretG,ry:rnd(0,PI),line:false});}
const elder=fairy({x:0,z:0,cap:'#8d7f70',letter:false,bag:false,scale:.95});secretG.add(elder.root);elder.root.position.set(0,.3,0);elder.root.rotation.set(-1.25,0,.25);elder.setExpr('안도');
add(new THREE.SphereGeometry(.07,10,8),M('#f8f3ea','wool'),0,.36,.15,{parent:elder.body,s:[1,.7,.7],line:false}); // 하얀 수염
G.codex.spot({id:'return-letters',pos:[-6.25,.3,-4.55]});
/* ---------- 창구 (통나무 책상 + 초록 잎 무늬 천) ---------- */
const DK={x:-.4,z:-2.3,w:2.8,d:.95,h:.78};
const desk=group(DK.x,0,DK.z,0);
boxAt(DK.w,DK.h-.1,DK.d,M('#b5824f','boards',{rep:[2,1]}),0,0,0,{parent:desk});
boxAt(DK.w+.16,.1,DK.d+.14,M('#c9955f','wood',{rep:[2,1]}),0,DK.h-.1,0,{parent:desk});
{// 앞에 늘어뜨린 천: 아래가 뾰족한 오각형 + 크림 잎 무늬
 const s=new THREE.Shape();s.moveTo(-.55,0);s.lineTo(.55,0);s.lineTo(.5,-.45);s.lineTo(0,-.66);s.lineTo(-.5,-.45);s.closePath();
 add(new THREE.ShapeGeometry(s),M('#9aa47a','linen',{rep:[2,2]}),0,DK.h,DK.d/2+.075,{parent:desk,line:false,cast:false});
 const lf=new THREE.Shape();const P=[[0,.16],[.05,.09],[.1,.08],[.06,.03],[.09,-.03],[.03,-.02],[0,-.12],[-.03,-.02],[-.09,-.03],[-.06,.03],[-.1,.08],[-.05,.09]];lf.moveTo(...P[0]);P.slice(1).forEach(p=>lf.lineTo(...p));lf.closePath();
 add(new THREE.ShapeGeometry(lf),M('#ece2c4','plain'),0,DK.h-.3,DK.d/2+.08,{parent:desk,line:false,cast:false});}
// 창구 위: 편지 더미·도토리 봉인 편지(오프닝 편지)·종·도토리
const paperM=M('#f3e6cc','paper');
[[-1.05,.0],[-.7,.15],[.95,-.1]].forEach(([x,z],i)=>{for(let k=0;k<3+i;k++)boxAt(.32,.035,.22,paperM,x+rnd(-.02,.02),DK.h+k*.035,z,{parent:desk,ry:rnd(-.2,.2),line:false});});
const envelope=new THREE.Group();envelope.position.set(.15,DK.h+.012,.12);envelope.rotation.y=-.18;desk.add(envelope);
{add(new THREE.BoxGeometry(.46,.02,.3),M('#f6ead2','paper'),0,0,0,{parent:envelope,thr:20});
 const fl=new THREE.Shape();fl.moveTo(-.23,-.15);fl.lineTo(.23,-.15);fl.lineTo(0,.04);fl.closePath();
 add(new THREE.ShapeGeometry(fl),M('#ecdcc0','paper'),0,.011,0,{parent:envelope,rx:-PI/2,line:false,cast:false});
 add(new THREE.CylinderGeometry(.055,.06,.014,14),M('#a5532e','plain'),0,.016,.02,{parent:envelope,line:false}); // 붉은 밀랍
 add(new THREE.SphereGeometry(.03,10,8),M('#b8703c','plain'),0,.03,.03,{parent:envelope,s:[1,.6,1.3],line:false});      // 밀랍 위 도토리
 add(new THREE.SphereGeometry(.026,10,6,0,PI*2,0,PI*.5),M('#8a5634','scales',{rows:3,cols:3}),0,.032,.0,{parent:envelope,rx:-PI/2,s:[1,1,.6],line:false});
 const lf=new THREE.Shape();[[0,.06],[.02,.03],[.04,.03],[.025,0],[.035,-.025],[.01,-.015],[0,-.05],[-.01,-.015],[-.035,-.025],[-.025,0],[-.04,.03],[-.02,.03]].forEach((p,i)=>i?lf.lineTo(...p):lf.moveTo(...p));
 add(new THREE.ShapeGeometry(lf),M('#e0874a','plain'),.15,.0115,.08,{parent:envelope,rx:-PI/2,rz:.6,line:false,cast:false});}
{const bell=lathe([[0,0],[.07,0],[.06,.05],[.035,.1],[.01,.13],[0,.14]].map(p=>new THREE.Vector2(...p)),14);add(bell,M('#d9a94e','plain'),.75,DK.h,.18,{parent:desk,line:false});}
obstacles.push({r:[DK.x-DK.w/2-.08,DK.x+DK.w/2+.08,DK.z-DK.d/2-.07,DK.z+DK.d/2+.07]});shadowBlob(DK.x,DK.z,1.6,.6);
// 창구 위 작은 버섯 등불
mushroomLamp(DK.x-1.1,DK.z-.25,.22,'#df7a42',DK.h);
/* ---------- 실패(실 감개)와 하얀 실 우편길 ---------- */
const SP={x:2.1,z:-3.15};
const spool=group(SP.x,0,SP.z,.3);
cylAt(.34,.34,.08,woodL,0,0,0,{parent:spool});cylAt(.22,.22,.42,M('#f4efe4','wool'),0,.08,0,{parent:spool,line:false});cylAt(.34,.34,.08,woodL,0,.5,0,{parent:spool});
obstacles.push({c:[SP.x,SP.z,.42]});shadowBlob(SP.x,SP.z,.45,.45);
const silkCol=lin('#fff8e8'),silkGlow=lin('#fff1c8');
const silkPts=[[SP.x,.55,SP.z],[1.6,.5,-3.9],[.7,.35,-4.7],[.3,1.3,-5.25],[-.5,2.6,-5.45],[.2,3.7,-5.5],[1.2,4.6,-5.6],[.4,5.6,-5.75],[-.3,6.5,-5.85],[.5,7.3,-5.9]].map(p=>new THREE.Vector3(...p));
const silkCurve=new THREE.CatmullRomCurve3(silkPts);
const NSEG=10,silkSegs=[];
for(let i=0;i<NSEG;i++){const pts=[];for(let k=0;k<=8;k++)pts.push(silkCurve.getPointAt((i+k/8)/NSEG));
  const mat=new THREE.MeshStandardMaterial({color:silkCol,emissive:silkGlow,emissiveIntensity:.15,roughness:.6});
  silkSegs.push(add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),12,.035,6,false),mat,0,0,0,{line:false,cast:false}));}
// 실을 따라 반짝이는 작은 구슬 (덧칠 점)
const dotTex=(()=>{const cv=document.createElement('canvas');cv.width=cv.height=64;const g=cv.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.4,'rgba(255,240,200,.6)');gr.addColorStop(1,'rgba(255,220,160,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;return t;})();
const NB=70,beadPos=new Float32Array(NB*3);for(let i=0;i<NB;i++){const p=silkCurve.getPointAt(i/(NB-1));beadPos.set([p.x,p.y,p.z],i*3);}
const beadGeo=new THREE.BufferGeometry();beadGeo.setAttribute('position',new THREE.BufferAttribute(beadPos,3));
const beadMat=new THREE.PointsMaterial({map:dotTex,size:.34,transparent:true,opacity:.0,depthWrite:false,blending:THREE.AdditiveBlending,color:lin('#ffe9b8')});
const beads=new THREE.Points(beadGeo,beadMat);beads.frustumCulled=false;root.add(beads);
// 빛 구멍 (뿌리 사이 위쪽 — 출구 암시): 밝은 원판 + 빛무리
const hole=add(new THREE.CircleGeometry(.75,20),new THREE.MeshBasicMaterial({color:lin('#fff3d2')}),.5,7.6,-6.05,{line:false,cast:false});
const holeGlow=new THREE.Sprite(new THREE.SpriteMaterial({map:dotTex,color:lin('#ffe2a8'),transparent:true,opacity:.5,depthWrite:false,blending:THREE.AdditiveBlending}));
holeGlow.position.set(.5,7.6,-5.8);holeGlow.scale.setScalar(4);root.add(holeGlow);
// 아치 아래 어두운 통로 (② 버섯 마을로 — 우편길을 따라 위로)
add(new THREE.CircleGeometry(1.5,20,0,PI),new THREE.MeshBasicMaterial({color:lin('#5a3a2a')}),.1,0,-5.55,{line:false,cast:false,s:[1,1.6,1]});
/* ---------- 엉킨 실과 매듭 세 곳 ----------
   매듭은 원더룹 손 높이(KY)의 실 위에 걸려 있다: 실패 위에서 매듭을 지나 바닥으로 늘어진 실 한 가닥마다 매듭 하나.
   다가가면 원더룹이 매듭 너머(카메라에서 35° 비껴, 0.32)에 카메라 쪽을 보고 서서 두 손으로 잡아당겨 푼다(07 동작 '매듭 풀기') — 뒷모습이 아니라 얼굴이 보이게. */
const KN=[{x:1.15,z:-1.2},{x:2.75,z:-1.55},{x:2.3,z:-.15}],KY=.52;
KN.forEach(K=>{const dx=K.x-SP.x,dz=K.z-SP.z,d=Math.hypot(dx,dz);K.ax=dx/d;K.az=dz/d;K.sx=K.x+K.ax*.32;K.sz=K.z+K.az*.32;});
const snarlM=new THREE.MeshStandardMaterial({color:silkCol,emissive:silkGlow,emissiveIntensity:.3,roughness:.6});
const snarl=new THREE.Group();root.add(snarl);
const strands=[];
{const RS=rng('fairy-roots:snarl'),r2=(a,b)=>a+(b-a)*RS();
 const tube=(pts,closed,parent=snarl)=>parent.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,closed),closed?60:40,.018,5,closed),snarlM));
 KN.forEach(K=>{for(let l=0;l<3;l++){const n=7,a0=r2(0,PI*2),rr=r2(.22,.5),pts=[];
   for(let k=0;k<n;k++){const a=a0+k/n*PI*2,r=rr*r2(.6,1.3);pts.push(new THREE.Vector3(K.x+Math.cos(a)*r,.03+r2(0,.12),K.z+Math.sin(a)*r*r2(.6,1)));}tube(pts,true);}
   // 실패 위 → 매듭(손 높이) → 옆 바닥으로 늘어진 실 한 가닥 (풀리면 사라진다)
   const g=new THREE.Group();root.add(g);strands.push(g);const px=-K.az,pz=K.ax;
   tube([new THREE.Vector3(SP.x+K.ax*.3,.62,SP.z+K.az*.3),new THREE.Vector3((SP.x+K.x)/2,KY+.06,(SP.z+K.z)/2),new THREE.Vector3(K.x,KY,K.z),
     new THREE.Vector3(K.x+px*.3,KY*.55,K.z+pz*.3),new THREE.Vector3(K.x+px*.55,.03,K.z+pz*.55)],false,g);});
 tube(KN.map(K=>new THREE.Vector3(K.x+r2(-.2,.2),.06,K.z+r2(-.2,.2))).concat([new THREE.Vector3(KN[0].x,.05,KN[0].z+.3)]),false);}
const knotGeo=new THREE.TorusKnotGeometry(.11,.03,72,8,2,3);
const knots=KN.map((k,i)=>{const m=new THREE.Mesh(knotGeo,new THREE.MeshStandardMaterial({color:silkCol,emissive:silkGlow,emissiveIntensity:.4,roughness:.5}));
  m.position.set(k.x,KY,k.z);root.add(m);const gl=new THREE.Sprite(new THREE.SpriteMaterial({map:dotTex,color:lin('#ffe9b8'),transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));
  gl.position.set(k.x,KY,k.z);gl.scale.setScalar(.9);root.add(gl);return {m,gl,...k,done:0,undo:0};}); // 빛무리 아래 끝이 바닥 위(KY-.45)라 바닥에 잘리지 않는다
/* ---------- 앞장서는 빛 하나 ---------- */
const mote=new THREE.Sprite(new THREE.SpriteMaterial({map:dotTex,color:lin('#fff2c8'),transparent:true,opacity:.95,depthWrite:false,blending:THREE.AdditiveBlending}));
mote.scale.setScalar(.45);mote.position.set(-3.2,1,2);root.add(mote);
const moteCore=add(new THREE.SphereGeometry(.045,8,6),new THREE.MeshBasicMaterial({color:lin('#fffaf0')}),0,0,0,{line:false,cast:false});mote.add(moteCore);moteCore.scale.setScalar(1/.45);
const moteLead=new THREE.CatmullRomCurve3([[-3.4,1.1,2.2],[-2,1.2,1.2],[-.4,1.1,.2],[1.2,.9,-.8],[SP.x-.2,.95,SP.z+.55]].map(p=>new THREE.Vector3(...p)));
/* ---------- 오른쪽 아늑한 자리: 땋은 둥근 깔개, 도토리 깍정이 의자, 그루터기 탁자 ---------- */
{const RG={x:4.7,z:-.7};add(new THREE.CircleGeometry(1.7,32).rotateX(-PI/2),M('#ead6b2','linen',{rep:[3,3]}),RG.x,.012,RG.z,{cast:false,line:false});
 [['#b9654a',1.62],['#d9b48a',1.42],['#8f9a6a',1.22],['#c98a5a',1.02]].forEach(([c,r])=>add(new THREE.TorusGeometry(r,.075,5,48),M(c,'wool'),RG.x,.03,RG.z,{rx:PI/2,s:[1,1,.35],cast:false,line:false}));
 const lf=new THREE.Shape();[[0,.75],[.22,.4],[.42,.38],[.28,.12],[.38,-.12],[.12,-.08],[0,-.55],[-.12,-.08],[-.38,-.12],[-.28,.12],[-.42,.38],[-.22,.4]].forEach((p,i)=>i?lf.lineTo(...p):lf.moveTo(...p));
 add(new THREE.ShapeGeometry(lf),M('#9aa47a','linen'),RG.x,.035,RG.z,{rx:-PI/2,rz:.5,cast:false,line:false});}
const cupM=M('#a8673e','scales',{rep:[7,1],rows:3,cols:4}),cushM=M('#f6efe2','wool');
[[4.2,-2.2,.5],[5.9,-.1,-1.9]].forEach(([x,z,ry])=>{const g=group(x,0,z,ry);
  add(lathe([[.0,0],[.3,0],[.5,.08],[.6,.28],[.62,.5],[.56,.56],[.5,.5]].map(p=>new THREE.Vector2(...p)),18),cupM,0,0,0,{parent:g});
  add(new THREE.SphereGeometry(.5,16,8),cushM,0,.42,0,{parent:g,s:[1,.32,1],line:false});
  obstacles.push({c:[x,z,.62]});shadowBlob(x,z,.7,.7);});
{const t=group(5.1,0,-1.25,.4);cylAt(.42,.48,.55,M('#9a6a44','bark',{rep:[2,1]}),0,0,0,{parent:t});add(new THREE.CircleGeometry(.41,18).rotateX(-PI/2),M('#e1bf92','rings'),0,.552,0,{parent:t,cast:false,line:false});
 add(new THREE.SphereGeometry(.09,10,8),M('#a26a3e','plain'),.1,.6,.05,{parent:t,s:[1,.8,1],line:false});obstacles.push({c:[5.1,-1.25,.5]});shadowBlob(5.1,-1.25,.55,.55);}
// 편지 꾸러미 바구니 (창구 옆)
{const b=group(1.35,0,-1.85+0,0);add(lathe([[0,0],[.26,0],[.32,.12],[.34,.3],[.3,.32]].map(p=>new THREE.Vector2(...p)),14),M('#b07a48','weave',{rep:[4,1]}),0,0,0,{parent:b});
 for(let i=0;i<3;i++)boxAt(.16,.26,.04,paperM,-.08+i*.08,.18,rnd(-.05,.05),{parent:b,rz:rnd(-.2,.2),line:false});obstacles.push({c:[1.35,-1.85,.34]});}
/* ---------- 늦가을 소품: 마른 참나무 잎·도토리·밤·작은 버섯 (같은 모델 여러 개) ---------- */
const scatter=(n,fn)=>{for(let i=0;i<n;i++)fn(i);};
const spotAt=(rIn,rOut)=>{for(let t=0;t<20;t++){const a=rnd(-PI*.05,PI*1.05)+PI,d=rnd(rIn,rOut),x=Math.cos(a)*d*WA/WB,z=Math.sin(a)*d*.95;if(Math.hypot(x/WA,z/WB)<.97)return [x,z];}return [0,-4];};
{// 마른 잎: 방 가장자리에 많이, 가운데는 듬성듬성
 const lf=new THREE.Shape(),wd=t=>.5*Math.pow(Math.sin(PI*Math.min(1,t*1.05)),.7)*(.6+.4*Math.abs(Math.sin(4*PI*t+.4))),NP=20;lf.moveTo(0,0);
 for(let i=1;i<NP;i++)lf.lineTo(-wd(i/NP)*.75,i/NP);lf.lineTo(0,1);for(let i=NP-1;i>0;i--)lf.lineTo(wd(i/NP)*.75,i/NP);lf.closePath();
 const geo=new THREE.ShapeGeometry(lf).translate(0,-.5,0).rotateX(-PI/2).scale(.3,.3,.3),N=170;
 const m=new THREE.InstancedMesh(geo,new THREE.MeshStandardMaterial({color:0xffffff,side:THREE.DoubleSide,roughness:.95}),N),o=new THREE.Object3D(),c=new THREE.Color(),c2=new THREE.Color(),cols=['#d8733c','#e09a48','#b9563a','#c98a4c','#a8683e'];
 scatter(N,i=>{const [x,z]=i<120?spotAt(4.2,6.2):[rnd(-5,5),rnd(-3.6,3.2)];o.position.set(x,.02+i*.0001,z);o.rotation.set(rnd(-.2,.2),rnd(0,PI*2),rnd(-.2,.2));o.scale.setScalar(rnd(.7,1.35));o.updateMatrix();m.setMatrixAt(i,o.matrix);m.setColorAt(i,c.set(cols[i%cols.length]));});
 m.receiveShadow=true;root.add(m);
 // 뿌리 위에 걸린 마른 잎 (기준 그림처럼 굵은 뿌리 등을 따라 군데군데)
 const NR=rootCurves.length*14,mr=new THREE.InstancedMesh(geo,m.material,NR);let k=0;
 rootCurves.forEach(({c,r0,r1})=>{for(let q=0;q<14;q++){const u=rnd(.05,.95),p=c.getPointAt(u),r=r0+(r1-r0)*Math.pow(u,.8);
   o.position.set(p.x+rnd(-.2,.2)*r,p.y+r*rnd(.7,.95),p.z+r*rnd(.1,.6));o.rotation.set(rnd(-.6,.6),rnd(0,PI*2),rnd(-.6,.6));o.scale.setScalar(rnd(.9,1.6));o.updateMatrix();mr.setMatrixAt(k,o.matrix);mr.setColorAt(k,c2.set(cols[k%cols.length]));k++;}});
 mr.receiveShadow=true;root.add(mr);}
{// 도토리 (열매 + 깍정이)
 const N=30,nut=new THREE.InstancedMesh(new THREE.SphereGeometry(.07,10,8).scale(1,1.25,1),M('#b8763e','plain'),N),cap=new THREE.InstancedMesh(new THREE.SphereGeometry(.072,10,6,0,PI*2,0,PI*.5),M('#7d5232','scales',{rows:3,cols:4}),N),o=new THREE.Object3D();
 scatter(N,i=>{const [x,z]=spotAt(3.6,6.1);o.position.set(x,.07,z);o.rotation.set(R()<.6?PI/2:0,rnd(0,PI*2),0);o.scale.setScalar(rnd(.9,1.3));o.updateMatrix();nut.setMatrixAt(i,o.matrix);o.translateY(.045);o.updateMatrix();cap.setMatrixAt(i,o.matrix);});
 [nut,cap].forEach(m=>{m.castShadow=true;m.receiveShadow=true;root.add(m);});}
{// 밤 (윤기 나는 갈색, 아래가 넓적)
 const N=16,m=new THREE.InstancedMesh(new THREE.SphereGeometry(.1,12,8).scale(1.1,.85,1),M('#7e4428','plain'),N),o=new THREE.Object3D();
 scatter(N,i=>{const [x,z]=spotAt(3.4,6);o.position.set(x,.08,z);o.rotation.set(0,rnd(0,PI*2),0);o.scale.setScalar(rnd(.85,1.2));o.updateMatrix();m.setMatrixAt(i,o.matrix);});m.castShadow=true;m.receiveShadow=true;root.add(m);}
{// 작은 버섯 무리 (갓 + 대)
 const N=22,cap=new THREE.InstancedMesh(new THREE.SphereGeometry(.12,10,6,0,PI*2,0,PI*.5).scale(1,.7,1),M('#c9683e','plain'),N),st=new THREE.InstancedMesh(new THREE.CylinderGeometry(.03,.04,.16,6),M('#f1e2c4','plain'),N),o=new THREE.Object3D();
 for(let g=0;g<7;g++){const [cx,cz]=spotAt(4,5.8);for(let k=0;k<3+(g%2);k++){const i=g*3+k;if(i>=N)break;const s=rnd(.6,1.3);o.position.set(cx+rnd(-.25,.25),.08*s,cz+rnd(-.25,.25));o.rotation.set(0,rnd(0,PI),rnd(-.15,.15));o.scale.setScalar(s);o.updateMatrix();st.setMatrixAt(i,o.matrix);o.translateY(.08);o.updateMatrix();cap.setMatrixAt(i,o.matrix);}}
 [cap,st].forEach(m=>{m.castShadow=true;m.receiveShadow=true;root.add(m);});}
/* ---------- 요정들: 토리, 우체국 요정 둘 ---------- */
const T=makeTori({x:3.2,z:-2.5,ry:-.6,scale:1.35});
const clerk=fairy({x:-2.95,z:-3.55,ry:-2.6,cap:'#8f9a64',letter:true,bag:false,scale:1.25});      // 선반에 편지를 꽂는 요정
const porter=fairy({x:-1.2,z:-3.4,ry:1.4,cap:'#a49580',letter:false,bag:true,scale:1.25});         // 편지 묶음을 나르는 요정
{const pile=new THREE.Group();pile.position.set(0,.23,.12);porter.body.add(pile);for(let k=0;k<4;k++)boxAt(.2,.035,.14,paperM,0,k*.036,0,{parent:pile,line:false});}
[T,clerk,porter].forEach(f=>{f.shadow=shadowBlob(f.root.position.x,f.root.position.z,.22,.22);});
[T,clerk,porter].forEach(f=>G.occlude.add(f.root,.4,.95)); // 원더룹을 가리면 반투명하게
obstacles.push({c:[-2.95,-3.55,.25]});
/* ---------- 이야기: 이야기 시계(남은 잎), 할 일, 이벤트 ---------- */
const leaves=G.hud.counter({id:'leaves',max:5,value:5,label:'남은 잎'});
const st={phase:'arrive',k:0,open:-1,lift:0,snap:null};
G.ui.setQuest('빛을 따라가 봐요');
let WL=null;const findWL=()=>{if(!WL&&root.parent)WL=root.parent.children.find(o=>o.userData&&o.userData.setExpr)||null;return WL;};
const act=(a)=>{const w=findWL();if(w){w.userData.action=a;w.userData.at=0;}};
G.dialog.npc({name:'토리',root:T.root,bubbleY:1.22,lines:['으아, 실이 엉켰어! 오늘은 안 되는데!'],
  variants:[{when:()=>st.phase==='open',lines:['할아버지 잎이 다 떨어지면 겨울잠에 드신단 말이야. 그 전에 전해야 해!']}]});
G.events.area({rect:[-2,4,-2.6,3.4],event:{id:'roots-arrive',run:async e=>{e.hold();
  await e.cut({src:'assets/textures/fairy/opening-letter.jpg?v='+(window.WL_V||''),alt:'도토리 봉인이 찍힌 크림색 편지',sec:4.5,id:'opening-letter'});
  st.phase='tangle';T.mode='panic';T.setExpr('호들갑');e.release();
  await e.say('토리','으아, 실이 엉켰어! 오늘은 안 되는데!');
  await e.say('토리','할아버지 잎이 다 떨어지면 겨울잠에 드신단 말이야. 그 전에 전해야 해!');
  G.codex.meet('tori');G.ui.setQuest('빛나는 매듭을 차례로 풀어요 (0/3)');}}});
KN.forEach((k,i)=>G.events.when({test:()=>st.phase==='tangle'&&st.k===i&&WL&&Math.hypot(WL.position.x-k.x,WL.position.z-k.z)<.75,
  event:{id:'knot'+i,run:async e=>{e.hold();const w=findWL();if(w&&w.userData.stopWalk)w.userData.stopWalk();
    // 매듭 앞에 서서 두 손을 뻗는다 — 카메라 쪽을 보며 서게(매듭 너머, 카메라에서 35° 비껴) 얼굴이 보인다
    {const cam=G.view.camera;let cx=k.x-k.ax,cz=k.z-k.az;if(cam){cx=cam.position.x-k.x;cz=cam.position.z-k.z;}const L=Math.hypot(cx,cz)||1;cx/=L;cz/=L;
     const pick=[.6,-.6,1,-1,0].map(a=>{const x=cx*Math.cos(a)-cz*Math.sin(a),z=cx*Math.sin(a)+cz*Math.cos(a);return {x:k.x-x*.32,z:k.z-z*.32,ry:Math.atan2(x,z)};}).find(p=>free(p.x,p.z));
     st.snap=pick||{x:k.sx,z:k.sz,ry:Math.atan2(-k.ax,-k.az)};}
    await e.wait(.3);act('매듭 풀기');
    await e.wait(.55);G.sound.sfx('knot');await e.wait(.9);knots[i].undo=1e-6;await e.wait(.5);st.snap=null;act('서기');st.k++;e.release();
    if(st.k<3){G.ui.setQuest(`빛나는 매듭을 차례로 풀어요 (${st.k}/3)`);return;}
    // 다 풀었다: 실이 아래부터 위로 켜지고, 빛이 빛 구멍으로 올라간다
    G.ui.setQuest('');T.setExpr('안도');T.mode='idle';e.hold();st.phase='opening';st.open=0;G.sound.sfx('silk-open');
    await e.until(()=>st.open>=1,10);st.phase='open';e.release();
    T.setExpr('기쁨');T.mode='beckon';G.codex.meet('silk-post');
    await e.wait(2.4);T.mode='follow';T.setExpr('기본');G.ui.setQuest('토리와 함께 우편길을 따라 올라가요');}}}));
/* ---------- 움직임 ---------- */
const v3=new THREE.Vector3();
// 토리가 설 수 있는 곳: 방 안, 장애물에서 조금 떨어진 곳
const free=(x,z)=>x>-6.7&&x<6.7&&z>-4.3&&z<3.7&&!obstacles.some(o=>o.r?(x>o.r[0]-.2&&x<o.r[1]+.2&&z>o.r[2]-.2&&z<o.r[3]+.2):Math.hypot(x-o.c[0],z-o.c[1])<o.c[2]+.2);
function update(dt,t){const w=findWL();
  [T,clerk,porter,elder].forEach(f=>f.update(dt,t,{wl:w,cam:G.view.camera,free}));
  [T,clerk,porter].forEach(f=>{if(f.shadow)f.shadow.position.set(f.root.position.x,.045,f.root.position.z);});
  porter.root.position.x=-1.2+Math.sin(t*.35)*.9;porter.root.rotation.y=Math.cos(t*.35)>0?1.4:-1.7;
  clerk.body.rotation.z=Math.sin(t*1.7)*.05;
  // 매듭: 지금 차례인 매듭만 금빛으로 숨 쉬듯, 풀리면 작아지며 사라짐
  knots.forEach((k,i)=>{k.m.rotation.y+=dt*(i===st.k?1.4:.4);const on=st.phase==='tangle'&&i===st.k;
    k.gl.material.opacity+=((on?.55+.25*Math.sin(t*4):0)-k.gl.material.opacity)*Math.min(1,dt*6);
    k.m.material.emissiveIntensity=on?.9+.4*Math.sin(t*4):.35;
    if(k.undo){k.undo=Math.min(1,k.undo+dt*1.6);const s=1-k.undo;k.m.scale.setScalar(s);k.m.rotation.x+=dt*8;k.gl.scale.setScalar(.9+k.undo*.15);k.m.visible=s>.01;}});
  if(st.snap&&w){const f=Math.min(1,dt*10);w.position.x+=(st.snap.x-w.position.x)*f;w.position.z+=(st.snap.z-w.position.z)*f;
    let da=st.snap.ry-w.rotation.y;da=Math.atan2(Math.sin(da),Math.cos(da));w.rotation.y+=da*f;}
  strands.forEach((g,i)=>{g.visible=knots[i].undo<1;}); // 풀린 매듭의 실 가닥은 사라진다
  const solved=knots.filter(k=>k.undo>=1).length;snarl.scale.setScalar(Math.max(.001,1-solved/3*.92));snarl.visible=solved<3||st.open<.3;
  // 우편길이 켜짐: 아래 마디부터 차례로
  if(st.open>=0&&st.open<1)st.open=Math.min(1,st.open+dt/2.6);
  const lit=Math.max(0,st.open);silkSegs.forEach((m,i)=>{const f=Math.min(1,Math.max(0,lit*NSEG*1.15-i));m.material.emissiveIntensity=.15+f*(1.1+.15*Math.sin(t*3+i));});
  beadMat.opacity=lit*(.7+.2*Math.sin(t*2.3));holeGlow.material.opacity=.45+lit*.4;
  // 앞장서는 빛: 들어올 때는 원더룹 조금 앞에서 실패 쪽으로, 길이 열리면 실을 타고 빛 구멍까지
  if(st.phase==='opening'||st.phase==='open'){v3.copy(silkCurve.getPointAt(Math.min(1,st.open*1.05)));v3.y+=.15;mote.position.lerp(v3,Math.min(1,dt*8));}
  else{const px=w?w.position.x:-4.2,u=Math.min(1,Math.max(0,(px+4.6)/6.2+.22));v3.copy(moteLead.getPointAt(u));v3.y+=Math.sin(t*2.2)*.12;mote.position.lerp(v3,Math.min(1,dt*1.6));}
  mote.material.opacity=(st.phase==='open'&&st.open>=1)?Math.max(0,mote.material.opacity-dt*.6):.95;}
function light(env){const n=env.night;const w=findWL();
  LS.light(w?w.position:{x:0,z:0},{light:(1.25+.45*n)*env.flick*(1-.35*env.cave),emissive:.85+.35*n,glow:.95+.3*n,pool:(.7+.4*n)*(1-.25*env.cave),ambient:1.2-.5*env.cave});}
return {
  ...FAIRY_WORLD,
  name:'뿌리 우체국',kind:'indoor',
  spawn:{x:-4.2,z:2.6,ry:PI*.75},
  areas:{office:{bounds:[-6.9,6.9,-4.5,3.9],obstacles:[...obstacles,{c:[-8.4,-5.4,2.6]},{c:[8.4,-5.4,2.6]}],
    camera:{target:[0,1.3,-1.4],dist:16,polar:[.7,1.38],azimuth:[-.8,.8],start:[1.08,0],minDist:3,maxDist:22}}},
  doors:[{rect:[-.6,.9,-4.5,-4.2],to:'fairy-village'}], // ② 버섯 마을 — 구역이 생기면 열린다(지금은 02가 거른다)
  sun:{dir:new THREE.Vector3(2,-10,6).normalize(),shadow:10,follow:false},
  mood:{hemi:.42,sun:.3,fill:.7,sky:0xffb070,ground:0x8a5434,tint:.7}, // 땅속: 하늘빛을 줄이고 호박색으로 — 버섯 등불이 주인공
  ground:[floor],
  lights:LS.all,keepOut:[T.root,clerk.root,porter.root,secretG,mote,beads,snarl,...strands,...knots.flatMap(k=>[k.m,k.gl]),...silkSegs],
  update,light,
  tori:T,state:st,knots:KN, // 시험·촬영 도구용
  dispose(){LS.dispose();leaves.remove();dotTex.dispose();knotGeo.dispose();},
};
}
