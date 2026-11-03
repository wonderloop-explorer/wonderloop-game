/* 요정의 숲 STAGE 01 — 이슬방울 선착장 (낮) · 설계 메모 "STAGE 01", 분위기 ref/mood/01-dock.png·00-village.png (색·빛·소품만, 배치는 자유)
   거대한 클로버와 연잎 사이로 흐르는 이슬 수로, 나무 선착장. 바람에 클로버 잎들이 뒤틀려 물길이 막혀 이슬배가 못 떠난다.
   흐름: ① 사공 요정과 이야기 → 미션 카드 ② 물가에서 클로버 셋을 손으로 돌려 맞춤(interact '돌리기') → 물길이 열리면 큰 이슬방울이 굴러와 이슬배를 채움
         ③ 이슬배 타기(game/ride — 수로를 따라 짧은 구경) → 건너편 ④ 사공이 민들레 솜털 우산을 줌(아이템 카드) → 바위에서 뛰어내리면 우산을 펼쳐 활공.
   실패·다시 하기 없음. 우산을 받기 전에는 활공하지 않는다(구역 정보 glide가 받은 뒤에만 참).
   요정: 사공(잎 모자·연파랑 옷·노), 버섯 요정 주민 — fairies.js. 이슬배·빈 배는 길쭉한 나뭇잎배(fairies.js leafBoat, 2026-11-02 그릇 배 대신), 물방울은 풍경 소품. 처음 이야기한 뒤 소개 카드(world.js FAIRY_CARDS).
   화질 기준(2026-11-01, 요정의 숲 전체): 들판이 아니라 '야외에 있는 아늑한 방' — paint.js(개미굴 붓결 텍스처·툰 음영)
     · 크기감: 원더룹보다 2~5배 큰 풀잎·클로버 줄기·꽃줄기를 동선 가까이, 머리 위로 큰 잎 지붕(5~6.5m, 카메라와 원더룹 사이에 오면 비쳐 보임 — occlude)
     · 시야 막기: 둘레 13~19m에 키 큰 잎·줄기 벽(별꽃 전망대 꽃봉오리만 북쪽 틈으로), 가까운 안개
     · 바닥: 붓결 풀 텍스처 + 정점 색 얼룩(이끼·흙) + 떨어진 꽃잎·원더룹만 한 조약돌·나무뿌리·이끼 무더기
     · 수로: 부드럽게 휘는 물길(cz·hw)과 울퉁불퉁한 둑(땅 높이를 잡음으로 깎음), 둑에 이끼·돌·풀, 물은 잔물결 텍스처가 천천히 흐름
     · 소품은 길가·선착장·사공 주변에 모아서(크기·색·각도를 다르게), 공중에 꽃가루, 밤에는 반딧불
   시간(SK.t 0 낮 · 1 해 질 녘 · 2 밤): 버섯등은 해 질 녘부터 하나씩 켜지고(문턱이 등마다 다름), 밤에는 꽃·반딧불이 은은하게. 물 색도 같은 값(world.js WATER).
   난수는 rng('fairy-dock:…'). 움직이는 것(클로버·이슬방울·배·요정·물방울)과 정점 색·애니메이션 텍스처(땅·물)·비쳐 보이는 잎은 keepOut(병합 안 함). */
import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {PI,QUALITY,add,blob,blobMany,boxAt,cylAt,group,lathe,pencil,rng,shadowBlob} from '../../01-textures.js';
import * as G from '../../game/index.js';
import {FAIRY_BADGE,FAIRY_CARDS,FAIRY_SKY,FAIRY_WORLD,WATER,icon} from './world.js';
import {bakeFairy,clearFairyCache,dandelionPuff,fairy,ladybug,leafBoat as boatLeaf,strider,villager} from './fairies.js';
import {clearPaintCache,fbm,painted,toon} from './paint.js';
import {deepForest} from './forest.js';
export function build({root}){
const R=rng('fairy-dock:props'),rnd=(a,b)=>a+(b-a)*R();
const SIZE=48,keep=[],obstacles=[],tick=[],flat=[],SOLID=[]; // SOLID: 충돌은 없지만 요정·캐릭터가 서면 몸이 묻히는 소품 자리 [x,z,반지름] — openSpot이 피한다
const MOB=!QUALITY.shadows; // 휴대폰 단계 // flat: 발밑 높이의 판(땅·물·길·선착장) — 뚫어 보기에서 뺀다
const ss=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x);};
// 자리로 정하는 0~1 값(난수 순서를 건드리지 않고 무더기·줄기마다 조금씩 다르게)
const hsh=(x,z,k=0)=>{const v=Math.sin(x*12.9898+z*78.233+k*37.719)*43758.5453;return v-Math.floor(v);};
/* ---------- 물길 모양: 가운데 cz(x)·반폭 hw(x) — 남쪽 둑 zS, 북쪽 둑 zN ---------- */
const cz=x=>-5+.7*Math.sin(.21*x+.4)+.35*Math.sin(.53*x+1.3),hw=x=>2.5+.3*Math.sin(.37*x+2);
const zS=x=>cz(x)+hw(x),zN=x=>cz(x)-hw(x);
/* ---------- 재질: 개미굴 붓결 텍스처 + 툰 ---------- */
const TX={
  grass:painted('grass','#eef3cf',['#bcd681','#9fc366','#dbe8a6','#f6f7dc','#8cb35a','#cfe08f'],{n:1900,len:30,w:9,dots:700,rep:[9,9]}),
  dirt:painted('dirt','#f3d6a8',['#dcae72','#eac48e','#cd9a64','#f7e4c4','#bf8a5e'],{n:1400,len:26,w:8,rep:[2,2]}),
  leaf:painted('leaf','#ffffff',['#dbeec4','#bfdc9c','#f3f9e8','#a8cc86','#e8f4d6'],{n:900,len:42,w:10,size:256}),
  wood:painted('wood','#ffffff',['#ead6c0','#d8bea2','#f6ead8','#c9a888'],{n:800,len:48,w:6,size:256}),
  stone:painted('stone','#ffffff',['#e6ddd0','#f7f3ec','#d3c6b4','#c9bba6'],{n:700,len:16,w:7,dots:500,size:256}),
  petal:painted('petal','#ffffff',['#fde9ee','#ffffff','#f7dbe3','#fff3f0'],{n:700,len:30,w:7,size:256}),
  ripple:painted('ripple','#ffffff',['#e9fbf8','#ffffff','#cdf0ea','#b8e7e2'],{n:700,len:42,w:4,amin:.12,amax:.4,size:512,rep:[7,2.2],
    extra:(g,S,R)=>{g.lineCap='round';for(let i=0;i<70;i++){const x=R()*S,y=R()*S,w=12+R()*44;g.globalAlpha=.25+R()*.35;g.strokeStyle='#ffffff';g.lineWidth=1.5+R()*2;
      for(let ox=-1;ox<=1;ox++){g.beginPath();g.moveTo(x-w+ox*S,y);g.quadraticCurveTo(x+ox*S,y-4-R()*4,x+w+ox*S,y);g.stroke();}}}}), // 잔물결: 가로로 누운 짧은 호
};
const TMC={};const T=(c,k='crayon',o={})=>{const key=c+'|'+k+'|'+(o.e||'')+(o.side||'');if(TMC[key])return TMC[key];
  return TMC[key]=toon(c,{map:k==='crayon'?null:TX[k],emissive:o.e,ei:o.ei,side:o.side});};
/* ---------- 땅: 한 장(96칸) — 물길 자리는 잡음 섞인 둑으로 깎고, 정점 색으로 이끼·흙 얼룩 (2026-11-03 낮 연두를 아주 조금 부드럽게) ---------- */
const inWater=(x,z)=>Math.min(z-zN(x),zS(x)-z)+(fbm(x*.9+11,z*.9+3)-.5)*.7; // + 안쪽(물), 둑이 울퉁불퉁
{const N=96,g=new THREE.PlaneGeometry(SIZE,SIZE,N,N).rotateX(-PI/2),P=g.attributes.position,col=new Float32Array(P.count*3);
 const C=h=>new THREE.Color(h),moss=C('#abcb7b'),light=C('#d5e1a8'),deep=C('#90b968'),soil=C('#e3c58f'),bank=C('#b58b5f'),wet=C('#8f8a62'),tmp=new THREE.Color();
 for(let i=0;i<P.count;i++){const x=P.getX(i),z=P.getZ(i),w=inWater(x,z);const y=w>-.05?-.62*ss(-.05,.75,w):0;P.setY(i,y);
   const f=fbm(x*.16,z*.16),f2=fbm(x*.55+3,z*.55+7);tmp.copy(moss).lerp(light,ss(.35,.75,f));
   if(f2>.62)tmp.lerp(soil,ss(.62,.8,f2)*.85); // 흙 자국
   if(f2<.3)tmp.lerp(deep,ss(.3,.15,f2)*.8); // 이끼 얼룩(짙은 초록)
   if(w>-.7&&w<=-.05)tmp.lerp(deep,ss(-.7,-.05,w)*.6); // 물가 이끼 띠
   if(w>-.05)tmp.copy(bank).lerp(wet,ss(.1,.6,w)); // 둑 비탈·물 밑
   col.set([tmp.r,tmp.g,tmp.b],i*3);}
 g.setAttribute('color',new THREE.BufferAttribute(col,3));g.computeVertexNormals();
 const ground=new THREE.Mesh(g,toon('#ffffff',{map:TX.grass,vertexColors:true}));ground.receiveShadow=true;root.add(ground);keep.push(ground);flat.push(ground);}
// 흙길: 들어오는 자리에서 선착장까지, 납작한 디딤돌
{const path=new THREE.Shape();path.moveTo(-1.1,-12);path.bezierCurveTo(-1.6,-6,3,-2,3.6,1.9);path.lineTo(5.4,2.2);path.bezierCurveTo(5,-2.5,1.2,-6,1.1,-12);path.closePath(); // 모양 좌표 (x, -z)
 const pg=new THREE.ShapeGeometry(path,24).rotateX(-PI/2);{const U=pg.attributes.uv;for(let i=0;i<U.count;i++)U.setXY(i,U.getX(i)*.35,U.getY(i)*.35);}
 flat.push(add(pg,T('#ffffff','dirt'),0,.012,0,{cast:false,line:false}));
 [[0,10.6],[.2,8.7],[.8,6.9],[1.6,5.1],[2.6,3.4],[3.5,1.7],[4.2,.1]].forEach(([x,z],i)=>flat.push(add(new THREE.CylinderGeometry(.42+(i%2)*.08,.46,.07,9),T(['#e8ddd0','#ddd2c4','#efe6da'][i%3],'stone'),x,.03,z,{ry:i,line:false,cast:false})));}
// 물: 연한 파스텔 청록 + 잔물결(천천히 흐름). 시간마다 색이 바뀐다(WATER)
const waterMat=toon(WATER[0].c,{map:TX.ripple,emissive:WATER[0].e,ei:WATER[0].ei});
// 물은 1m 칸으로 나눈다 — 둥근 땅(game/bend)은 꼭짓점마다 휘어서, 네 귀퉁이뿐이면 물이 둑 밑으로 가라앉는다
const water=new THREE.Mesh(new THREE.PlaneGeometry(SIZE,13,48,13).rotateX(-PI/2),waterMat);water.position.set(0,-.1,-5.2);
/* 밤 물(2026-11-03): 한 가지 남색이 아니라 물가는 깊은 청록, 물길 가운데로 갈수록 남색(정점마다 가운데 정도 wlMid → 밤 정도 NIGHT만큼 물들임) */
{const P=water.geometry.attributes.position,mid=new Float32Array(P.count);for(let i=0;i<P.count;i++){const x=P.getX(i),z=P.getZ(i)-5.2;mid[i]=Math.max(0,1-Math.abs(z-cz(x))/hw(x));}
 water.geometry.setAttribute('wlMid',new THREE.BufferAttribute(mid,1));}
const NIGHT={value:0};
waterMat.onBeforeCompile=sh=>{sh.uniforms.wlNight=NIGHT;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float wlMid;varying float vMid;').replace('#include <begin_vertex>','#include <begin_vertex>\nvMid=wlMid;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float wlNight;varying float vMid;')
    .replace('#include <map_fragment>','#include <map_fragment>\ndiffuseColor.rgb*=mix(vec3(1.),mix(vec3(1.05,1.08,1.),vec3(.5,.52,.95),smoothstep(.15,.85,vMid)),wlNight);');};
waterMat.customProgramCacheKey=()=>'wl-water-night';water.receiveShadow=true;root.add(water);keep.push(water);flat.push(water);
const WC=WATER.map(w=>({c:new THREE.Color(w.c),e:new THREE.Color(w.e),ei:w.ei}));
// 물에는 못 들어감(선착장만): 0.5m 폭 띠마다 그 사이 물길을 막는다
for(let x=-SIZE/2;x<SIZE/2;x+=.5){const xs=[x,x+.25,x+.5],n=Math.min(...xs.map(zN))+.05,s=Math.max(...xs.map(zS))-.12;
  if(x>=3.5&&x+.5<=5.6)obstacles.push({r:[x,x+.5,n,-5.0]});else obstacles.push({r:[x,x+.5,n,s]});}
/* ---------- 선착장 ---------- */
const DOCK={x0:3.5,x1:5.6,z0:-5.0,z1:-1.75,top:.14};
flat.push(boxAt(DOCK.x1-DOCK.x0,.1,DOCK.z1-DOCK.z0,toon('#ffffff',{map:pencil('#c08a58','planks',{rep:[2,3]})}),(DOCK.x0+DOCK.x1)/2,DOCK.top-.1,(DOCK.z0+DOCK.z1)/2,{line:false}));
const post=(x,z,h=.75)=>{cylAt(.12,.13,h+.4,T('#9a6a44','wood'),x,-.4,z,{line:false});const r=add(new THREE.TorusGeometry(.13,.035,6,14),T('#e2c597'),x,h-.25,z,{rx:PI/2,line:false});r.scale.set(1,1,1.4);};
[[DOCK.x0,DOCK.z1],[DOCK.x1,DOCK.z1],[DOCK.x0,DOCK.z0],[DOCK.x1,DOCK.z0],[DOCK.x0,-3.4],[DOCK.x1,-3.4]].forEach(([x,z])=>post(x,z));
for(const x of [DOCK.x0,DOCK.x1]){const c=new THREE.CatmullRomCurve3([new THREE.Vector3(x,.6,DOCK.z1),new THREE.Vector3(x,.48,-2.6),new THREE.Vector3(x,.6,-3.4),new THREE.Vector3(x,.48,-4.2),new THREE.Vector3(x,.6,DOCK.z0)]);
  add(new THREE.TubeGeometry(c,24,.025,5),T('#e2c597'),0,0,0,{line:false});}
obstacles.push({r:[DOCK.x0-.15,DOCK.x0+.05,DOCK.z0,DOCK.z1-.3]},{r:[DOCK.x1-.05,DOCK.x1+.15,DOCK.z0,DOCK.z1-.3]});
/* ---------- 풍경 부품 ---------- */
const leafShape=s=>{const sh=new THREE.Shape();sh.moveTo(0,0);sh.bezierCurveTo(-.55*s,.25*s,-.62*s,.9*s,-.28*s,1*s);sh.bezierCurveTo(-.1*s,1.04*s,0,.9*s,0,.8*s);sh.bezierCurveTo(0,.9*s,.1*s,1.04*s,.28*s,1*s);sh.bezierCurveTo(.62*s,.9*s,.55*s,.25*s,0,0);return sh;};
const leafGeo=(s,seg=8)=>new THREE.ExtrudeGeometry(leafShape(s),{depth:.05*s,bevelEnabled:true,bevelSize:.03*s,bevelThickness:.03*s,bevelSegments:1,curveSegments:seg});
const leafHeart=(s,mat)=>new THREE.Mesh(leafGeo(s),mat);
const cloverMat=T('#86ba58','leaf'),cloverDk=T('#6fa646','leaf'),stemMat=T('#7fac52','leaf'),_tY=new THREE.Color('#b9b85a');
/* 동선 가까이 큰 풀·꽃: 카메라와 원더룹 사이에 오면 흐려진다.
   컴퓨터·휴대폰 같은 방식(2026-11-02 — 컴퓨터의 동그란 흐림·덧그리기·윤곽선이 원더룹을 까맣게 칠해서 휴대폰 방식으로 통일): 덧그리기 없이 그 물체 전체를 0.3 투명도로 0.2초에 걸쳐 흐림
   (game/occlude add — 재질을 물체마다 따로, 병합하지 않음). 카메라 바로 옆에 걸린 것도. 원더룹·탈은 늘 원래 색 */
const occ=(g,r,h,roof=null)=>{keep.push(g);G.occlude.add(g,r,h,{near:true,speed:6,boxes:bakeGroup(g),roof});}; // roof: 잎 지붕 높이 — 카메라가 그보다 위에서 내려다보며 사이에 오면 아예 숨김
/* 흐려지는 물체 하나(줄기·잎·꽃잎 여러 부품)를 텍스처마다 한 덩어리로 합친다 — 색은 정점 색, 재질은 이 물체 전용(흐릴 때 다른 물체가 같이 흐려지지 않게).
   부품마다 상자(월드 좌표)를 돌려준다 → occlude가 카메라~원더룹 시선이 상자를 지나는지로 가림을 본다(여러 겹이어도 하나하나 따로) */
/* 땅(높이 0)에 딱 붙은 밑면 정점은 4cm 묻는다 — 흐려지는(반투명) 물체의 밑면이 땅과 같은 높이면 겹쳐 그려져 깜빡인다(z-fighting) */
function buryBase(q){const P=q.attributes.position;for(let i=0;i<P.count;i++)if(Math.abs(P.getY(i))<.006)P.setY(i,-.04);P.needsUpdate=true;}
/* 곧은 꽃줄기·잎줄기가 다 같은 초록이라 똑같아 보였다(2026-11-03): 물체마다 밝기 ±9%·노란 기 조금 */
const _st=new THREE.Color();
function stemTint(m,g){const c=m.material.color;if(m.material!==stemMat)return c;const p=g.position,k=hsh(p.x,p.z,2),y=hsh(p.x,p.z,3);return _st.copy(c).multiplyScalar(.91+.18*k).lerp(_tY,.12*y);}
function bakeGroup(g){g.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(g.matrixWorld).invert(),B=new Map(),boxes=[],old=[],M4=new THREE.Matrix4();
  let big=null,bn=-1;g.traverse(m=>{if(m.isMesh&&m.geometry.attributes.position.count>bn){bn=m.geometry.attributes.position.count;big=m.material;}});
  g.traverse(m=>{if(!m.isMesh)return;old.push(m);const P=m.geometry.parameters;
    if(P&&P.path){const n=8;for(let j=0;j<n;j++){const b=new THREE.Box3();for(let q=0;q<=2;q++)b.expandByPoint(P.path.getPointAt((j+q/2)/n).applyMatrix4(m.matrixWorld));boxes.push(b.expandByScalar(P.radius));}} // 휜 줄기: 상자 하나면 빈 곳까지 덮으니 마디마다
    else boxes.push(new THREE.Box3().setFromObject(m));if(!B.has('all'))B.set('all',[]);B.get('all').push(m);}); // 텍스처가 달라도(줄기·꽃잎·꽃술) 가장 큰 부품의 붓결 하나로 — 모두 흰 바탕 붓결이라 휴대폰 크기에서는 차이가 안 보이고 그리기는 한 번

  B.forEach(list=>{const geos=list.map(m=>{const gg=(m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone());for(const a of Object.keys(gg.attributes))if(!['position','normal','uv'].includes(a))gg.deleteAttribute(a);gg.clearGroups();
      gg.applyMatrix4(M4.multiplyMatrices(inv,m.matrixWorld));buryBase(gg);const c=stemTint(m,g),n=gg.attributes.position.count,col=new Float32Array(n*3);for(let i=0;i<n;i++)col.set([c.r,c.g,c.b],i*3);gg.setAttribute('color',new THREE.BufferAttribute(col,3));return gg;});
    const mt=big.clone();mt.color.setRGB(1,1,1);mt.vertexColors=true;mt.side=list.some(m=>m.material.side===THREE.DoubleSide)?THREE.DoubleSide:big.side;const mm=new THREE.Mesh(mergeGeometries(geos),mt);mm.castShadow=list.some(m=>m.castShadow);mm.receiveShadow=true;g.add(mm);geos.forEach(x=>x.dispose());});
  old.forEach(m=>{m.parent.remove(m);m.geometry.dispose();});return boxes;}
const giantClover=(x,z,h,s,ry,o={})=>{const g=group(x,0,z,ry);const lean=o.lean||0;
  const top=new THREE.Vector3(Math.sin(lean)*h*.25,h,0),c=new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0),new THREE.Vector3(top.x*.3,h*.5,0),top]);
  add(new THREE.TubeGeometry(c,8,.08*s,6),stemMat,0,0,0,{parent:g,line:false});
  for(let k=0;k<3;k++){const L=leafHeart(s,k%2?cloverMat:cloverDk);L.position.copy(top);L.rotation.set(-PI/2+.35,k*PI*2/3,0,'YXZ');L.castShadow=true;g.add(L);}
  blob(x,z,.6*s,.6*s,.16);if(!o.noObs)obstacles.push({c:[x,z,.22*s]});if(o.occ)occ(g,s*.9,h);return g;};
const daisy=(x,z,h,s,col='#fbf3e6',o={})=>{const g=group(x,0,z,rnd(0,PI*2));cylAt(.07*s,.1*s,h,stemMat,0,0,0,{parent:g,line:false});const hd=new THREE.Group();hd.position.y=h;hd.rotation.x=rnd(.3,.6);g.add(hd);
  const pm=T(col,'petal');for(let k=0;k<10;k++){const p=add(new THREE.SphereGeometry(.5*s,7,4),pm,0,0,0,{parent:hd,line:false});p.scale.set(.32,.07,1);p.position.set(Math.sin(k/10*PI*2)*.5*s,0,Math.cos(k/10*PI*2)*.5*s);p.rotation.y=k/10*PI*2;}
  add(new THREE.SphereGeometry(.24*s,9,5),T('#f4c64e'),0,.04*s,0,{parent:hd,s:[1,.45,1],line:false});obstacles.push({c:[x,z,.2*s]});if(o.occ)occ(g,s*.8,h);return g;};
const bell=(x,z,h,s,col='#bda4e6',o={})=>{const g=group(x,0,z,rnd(0,PI*2));const c=new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0),new THREE.Vector3(0,h*.7,0),new THREE.Vector3(.5*s,h,0),new THREE.Vector3(.9*s,h*.88,0)]);
  add(new THREE.TubeGeometry(c,12,.06*s,6),stemMat,0,0,0,{parent:g,line:false});
  add(lathe([[0,.02],[.18,0],[.32,-.2],[.4,-.5],[.5,-.6],[.42,-.62],[0,-.58]].map(q=>new THREE.Vector2(q[0]*s,q[1]*s)),9),T(col,'petal'),.9*s,h*.88,0,{parent:g,line:false});obstacles.push({c:[x,z,.15]});if(o.occ)occ(g,s*.8,h);return g;};
/* 키 큰 풀잎 무더기: 휘어진 리본 잎 5장 한 덩어리(무리 — 색은 인스턴스마다) */
const bladeClump=(n,h0,h1,seed)=>{const r2=rng('fairy-dock:blade:'+seed),rr=(a,b)=>a+(b-a)*r2();const parts=[];
  for(let k=0;k<n;k++){const a=k/n*PI*2+rr(-.4,.4),h=rr(h0,h1),w=.16+h*.05,b=rr(.25,.6),seg=5,pos=[],uv=[],idx=[];const dx=Math.cos(a),dz=Math.sin(a),px=-dz,pz=dx,o=rr(.05,.2);
    for(let j=0;j<=seg;j++){const t=j/seg,y=h*t,hw2=Math.max(.012,w*.5*Math.pow(1-t,.7)),d=o+b*t*t*h*.35;pos.push(dx*d+px*hw2,y,dz*d+pz*hw2,dx*d-px*hw2,y,dz*d-pz*hw2);uv.push(0,t,1,t);
      if(j<seg){const q=j*2;idx.push(q,q+1,q+2,q+1,q+3,q+2);}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();parts.push(g);}
  return mergeGeometries(parts);};
const grassMat=toon('#ffffff',{map:TX.leaf,side:THREE.DoubleSide});
/* 키 큰 풀잎이 카메라와 원더룹 사이에 오면 고개를 숙인다(땅으로 웅크림) — 무리(인스턴스)라 반투명 대신 */
const BEND=[];
/* 똑같아 보이지 않게(2026-11-03): 무더기마다 키 0.82~1.18배·색 밝기 ±8% — 자리에서 만든 값(hsh)이라 난수 순서·다른 그림은 그대로 */
const _gm=new THREE.Object3D();
function grassAt(cr,i,x,z,ry,s,sy){_gm.position.set(x,0,z);_gm.rotation.set(0,ry,0);_gm.scale.set(s,s*sy,s);_gm.updateMatrix();cr.part(0).setMatrixAt(i,_gm.matrix);cr.part(0).instanceMatrix.needsUpdate=true;}
function tallGrass(list,seed,h0,h1,bend){const cr=G.fx.crowd({parent:root,n:list.length,parts:[{geo:bladeClump(5,h0,h1,seed),mat:grassMat}]});
  const cols=['#93c562','#a9d06e','#7fb553','#b5d67c'],tc=new THREE.Color();list.forEach(([x,z,s],i)=>{const ry=rnd(0,PI*2),sc=s||rnd(.8,1.2),sy=.82+.36*hsh(x,z);grassAt(cr,i,x,z,ry,sc,sy);
    tc.set(cols[(i+seed.length)%4]).multiplyScalar(.92+.16*hsh(x,z,1));cr.part(0).setColorAt(i,tc);cr.part(0).instanceColor.needsUpdate=true;
    if(bend)BEND.push({cr,i,x,z,ry,s:sc,sy,h:h1*sc*sy,k:0});});if(bend)keep.push(cr.group);return cr;} // 고개 숙이는 무리는 병합(휴대폰 색 접기)에서 빼기
/* 둘레 벽·꽃지붕 집은 한 덩어리로 그리되 부품마다 따로 흐려진다(fadeMerge — 아래). 벽 부품은 여기 모아 두었다가 맨 끝에 합친다 */
const FADEP=[];
/* ---------- 둘레 벽: 13~19m에 키 큰 클로버·데이지·풀잎·줄기 (먼 들판·지평선을 가리고, 별꽃 전망대만 북쪽 틈으로) ---------- */
{const wall=[];for(let i=0;i<34;i++){const a=i/34*PI*2+rnd(-.05,.05),rx=rnd(14,17.5),rz=rnd(14.5,18),x=-.5+Math.cos(a)*rx,z=Math.sin(a)*rz;
   if(Math.abs(x)<2.6&&z<-12)continue; // 북쪽 틈: 꽃봉오리가 잎 사이로
   const k=i%4;let piece;if(k===0)piece=giantClover(x,z,rnd(5,8),rnd(2.2,3),rnd(0,PI*2),{noObs:true});else if(k===1)piece=daisy(x,z,rnd(5.5,8),rnd(1.6,2.2),i%8===1?'#f9d4dc':'#fbf3e6');
   else if(k===2){const g=group(x,0,z,a+PI/2);const L=leafHeart(rnd(4,5.5),T('#86bb5a','leaf'));L.rotation.set(-PI/2+rnd(1.2,1.45),0,0);g.add(L);L.castShadow=true;piece=g;}
   else piece=bell(x,z,rnd(4.5,6.5),rnd(1.6,2),i%8===3?'#f2b6c6':'#bda4e6');
   FADEP.push({g:piece});
   wall.push([x*.92,z*.92,rnd(1.6,2.4)]);}
 tallGrass(wall,'wall',2.5,4.5,true);}
// 벽 뒤 깊은 숲: 실루엣 판 네 겹 + 머리 위 큰 잎 + 빛줄기 (forest.js) — 북쪽은 꽃봉오리가 보이게 비운다
const forest=deepForest({root,cx:-.5,cz:0,gaps:[Math.atan2(-30,.5)]});
// 멀리 북쪽 언덕 위 커다란 분홍 꽃봉오리(별꽃 전망대 — 이야기의 목적지가 잎 틈으로 보이게)
{const g=group(0,0,-30,0);add(new THREE.SphereGeometry(6,16,8,0,PI*2,0,PI/2),T('#a9c56f','leaf'),0,-1.5,0,{parent:g,line:false,cast:false,s:[1.6,.55,1]});
 for(let k=0;k<6;k++){const p=add(lathe([[0,0],[.9,.4],[1.3,1.6],[1.1,3],[.6,4],[0,4.6]].map(q=>new THREE.Vector2(q[0],q[1])),10),T('#f2a5b4','petal'),0,1.5,0,{parent:g,line:false,cast:false});p.scale.set(1,1,.45);p.rotation.set(-.32,k/6*PI*2,0,'YXZ');p.position.set(Math.sin(k/6*PI*2)*.9,1.5,Math.cos(k/6*PI*2)*.9);}
 for(let k=0;k<6;k++){const l=add(lathe([[0,0],[.5,.3],[.6,1],[.3,1.9],[0,2.3]].map(q=>new THREE.Vector2(q[0],q[1])),7),T('#86b058','leaf'),0,1.2,0,{parent:g,line:false,cast:false});l.scale.set(1,1,.35);l.rotation.set(-.9,k/6*PI*2+.5,0,'YXZ');l.position.set(Math.sin(k/6*PI*2+.5)*1.8,1.1,Math.cos(k/6*PI*2+.5)*1.8);}}
/* ---------- 동선 가까이: 원더룹보다 2~5배 큰 클로버·꽃줄기·풀잎 ---------- */
[[-3.4,9.6,3.2,1.5,.4],[3.6,8.6,2.6,1.3,2],[-4.6,4.4,3.8,1.7,1.1],[6.6,5.6,3.4,1.6,.2],[-3.3,1.3,2.8,1.3,2.4],[8.2,1.2,4.2,1.9,1],[-11.5,.4,4,1.8,.7],[10.6,-.6,3.6,1.6,2.2],
 [-10.6,-10.4,3.4,1.6,.8],[9.4,-11.6,4,1.8,2.4],[2.6,-12.4,4.4,2,1.5],[-5.2,-13,3.6,1.7,0],[-13.2,-8.6,4.2,2,1.2]].forEach(a=>giantClover(...a,{lean:.3,occ:true}));
const OC={occ:true};daisy(-6.6,8.4,4.2,1.3,undefined,OC);daisy(5.6,10.8,3.6,1.15,'#f9d4dc',OC);daisy(-9.2,3.6,4.6,1.4,undefined,OC);daisy(11,-9.4,5,1.5,undefined,OC);
bell(-3,6.6,2.6,1.05,undefined,OC);bell(7.4,-.2,3,1.15,'#f2b6c6',OC);bell(-8.6,-1,2.8,1.1,undefined,OC);bell(-12,-12.6,3.2,1.2,'#f2b6c6',OC);
/* 길가·선착장 앞 무더기 몇은 길에서 조금 물리고 낮춤(lo — 휴대폰 세로 화면에서 풍경보다 크게 보이던 곳, 2026-11-03). 난수는 예전 순서 그대로 꺼낸다 */
tallGrass([[-1.9,12.6],[2.3,12.2],[-2.9,8],[3.9,6.9,0,.7],[-2.2,4.4,0,.7],[5.9,4.2,0,.75],[.6,2.4,0,.65],[7,2.2],[-5.6,-.6,1.1],[-8.2,-.8],[-13,-.4],[1.4,-.9,.8,.75],[7.8,-1.6],[-11.4,-9.4],[-4.2,-9.8],[1.2,-9.6],[7.4,-9],[-9.4,-12.6],[4.4,-12.8],[-6.8,6.6],[7.6,8.8]].map(([x,z,s,lo])=>[x,z,(s||rnd(.75,1.15))*(lo||1)]),'near',1.8,3.4,true);
/* 머리 위 잎 지붕: 휘어진 긴 줄기 끝에 큰 잎을 거의 눕혀서(5~6.5m) — 들어오는 길 위 두 장은 길 왼쪽으로 조금 물림(2026-11-03, 휴대폰 세로 화면 위쪽을 덮었다) — 카메라와 원더룹 사이에 오면 반투명(occlude). 휴대폰은 진짜 그림자 대신 잎 그림자 얼룩 */
const canopy=[];
[[-5.6,10.6,-2.6,9.4,5.2,3.4],[8.8,7,4.4,5,5.6,3.8],[-7.4,3.6,-4,2.4,6,4],[10.2,-2.6,6.6,-2.6,6.2,3.4],[-12.2,-12.2,-8.4,-10.4,6,3.6],[3.4,-14.6,1.2,-10.8,6.6,3.6],[-12.6,6,-9,5.6,5.4,3.2]].forEach(([bx,bz,lx,lz,h,s],i)=>{
  const c=new THREE.CatmullRomCurve3([new THREE.Vector3(bx,0,bz),new THREE.Vector3(bx+(lx-bx)*.15,h*.6,bz+(lz-bz)*.15),new THREE.Vector3(bx+(lx-bx)*.55,h*1.02,bz+(lz-bz)*.55),new THREE.Vector3(lx,h*.96,lz)]);
  const sg=group(bx,0,bz,0);add(new THREE.TubeGeometry(c,14,.16,6),stemMat,-bx,0,-bz,{line:false,parent:sg});obstacles.push({c:[bx,bz,.3]});blob(bx,bz,.5,.5,.18);
  const lg=new THREE.Group();lg.position.set(lx-bx,h*.96,lz-bz);sg.add(lg); // 줄기와 잎은 한 물체(휴대폰은 한 번에 그리고 같이 흐려짐)
  const L=new THREE.Mesh(leafGeo(s,10),T(i%2?'#8cc25e':'#7fb653','leaf'));L.castShadow=true;L.receiveShadow=true; // 컴퓨터는 병합, 휴대폰은 잎마다 따로 흐림(아래 occ)
  const yaw=Math.atan2(lx-bx,lz-bz);L.rotation.set(-PI/2+.16,yaw+PI,0,'YXZ');L.position.set(Math.sin(yaw)*s*.45,0,Math.cos(yaw)*s*.45);lg.add(L);
  canopy.push(lg);occ(sg,.6,h,h*.96);shadowBlob(lx,lz,s*.55,s*.45);});
/* 잎 사이 햇빛 얼룩(낮): 바닥에 덧칠하는 부드러운 빛 조각(그리기 1회). 해 질 녘·밤에는 사라진다 */
const dapple=(()=>{const cv=document.createElement('canvas');cv.width=cv.height=256;const g=cv.getContext('2d'),r2=rng('fairy-dock:dapple');
  for(let i=0;i<16;i++){const x=30+r2()*196,y=30+r2()*196,r=10+r2()*22,gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(255,244,205,.95)');gr.addColorStop(.6,'rgba(255,236,180,.45)');gr.addColorStop(1,'rgba(255,230,170,0)');
    g.fillStyle=gr;g.beginPath();g.ellipse(x,y,r*1.3,r,r2()*PI,0,7);g.fill();}
  const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;
  const geos=[[-2.6,9.4,5],[3.6,4.8,6],[-3.6,2.2,6],[6.4,-1.4,5],[-8,-10,5],[1,-10.4,5],[-8.6,5.4,4.5]].map(([x,z,s],i)=>new THREE.PlaneGeometry(s,s,6,6).rotateX(-PI/2).rotateY(i).translate(x,.03,z)); // 6×6칸: 둥근 땅에서 멀리 있을 때 가운데가 땅 밑으로 꺼지지 않게
  const m=new THREE.Mesh(mergeGeometries(geos),new THREE.MeshBasicMaterial({map:t,transparent:true,opacity:.5,depthWrite:false,blending:THREE.AdditiveBlending,polygonOffset:true,polygonOffsetFactor:-2}));
  m.renderOrder=1;root.add(m);keep.push(m);return m;})();
/* ---------- 바닥 소품: 원더룹만 한 조약돌·떨어진 꽃잎·나무뿌리·이끼 무더기 (길가·선착장·사공 주변에 모아서) ---------- */
// 큰 조약돌 (원더룹 크기 0.5~1m) — 따로따로, 막힘
[[-2.2,11.6,.55],[2.6,10,.45],[-1.9,6.8,.4],[4.3,6,.6],[-.6,3.4,.35],[2.4,1.2,.5],[6.4,.4,.42],[2.6,-1.3,.38],[7.2,-2.2,.55],[-6.8,-.9,.6],[-12.6,-1.2,.7],[-3.4,-10.6,.5],[-9.6,-11.6,.55],[5.2,-11.4,.65],[-7.6,9.4,.6]].forEach(([x,z,s],i)=>{
  const m=add(new THREE.DodecahedronGeometry(s,0),T(['#e2d7c6','#d6c8b6','#ece3d4','#cdbfaf'][i%4],'stone'),x,s*.42,z,{ry:rnd(0,PI),line:false});m.scale.set(rnd(1,1.3),rnd(.62,.78),rnd(.9,1.15));m.rotation.z=rnd(-.2,.2);
  m.material.flatShading=true;obstacles.push({c:[x,z,s*.85]});});
const pick=(cx,cz2,r,n)=>{const out=[];for(let i=0;i<n;i++){let x,z,tries=0;do{const a=rnd(0,PI*2),d=Math.sqrt(R())*r;x=cx+Math.cos(a)*d;z=cz2+Math.sin(a)*d;tries++;}while(inWater(x,z)>-.3&&tries<12);if(inWater(x,z)<=-.3)out.push([x,z]);}return out;};
const HOT=[[0,10.5,3],[2,6.5,3],[3.4,2.2,3],[5.8,-.6,2.6],[2.4,-.8,2.2],[-5,-.9,3],[-9.8,-1,2.6],[-7.4,-10.8,3],[-1.6,-11,2.6],[6.4,-10.6,2.8],[-3.4,-11.8,2]]; // 카메라가 자주 보는 곳
const around=n=>HOT.flatMap(([x,z,r])=>pick(x,z,r,n));
{// 작은 돌 (무리, 색·크기 제각각)
 const st=around(5),cr=G.fx.crowd({parent:root,n:st.length,parts:[{geo:new THREE.DodecahedronGeometry(.16,0).scale(1.2,.6,1),mat:T('#ffffff','stone'),at:[0,.06,0]}]});
 st.forEach(([x,z],i)=>{cr.set(i,x,0,z,rnd(0,PI*2),rnd(.5,1.4));cr.color(0,i,['#e4dacb','#d4c7b5','#c9bfb4','#efe7da'][i%4]);});
 // 떨어진 꽃잎 (분홍·하양·연보라)
 const pt=around(7),pc=G.fx.crowd({parent:root,n:pt.length,parts:[{geo:new THREE.CircleGeometry(.13,7).scale(.55,1,1).rotateX(-PI/2).rotateZ(.12),mat:T('#ffffff','petal',{side:THREE.DoubleSide}),at:[0,.025,0],cast:false}]});
 pt.forEach(([x,z],i)=>{pc.set(i,x,0,z,rnd(0,PI*2),rnd(.8,1.6));pc.color(0,i,['#f7b6c6','#fbeee4','#d7c2f2','#f9cdd6','#ffffff'][i%5]);});
 // 이끼 무더기 (둑과 줄기 밑)
 const ms=[];for(let x=-21;x<21;x+=1.1){for(const side of [1,-1]){const z=side>0?zS(x)+rnd(.1,.6):zN(x)-rnd(.1,.6);if(x>3.2&&x<5.9&&side>0)continue;ms.push([x+rnd(-.3,.3),z]);}}
 const mc=G.fx.crowd({parent:root,n:ms.length,parts:[{geo:new THREE.SphereGeometry(.32,7,3,0,PI*2,0,PI/2).scale(1.3,.55,1),mat:T('#ffffff','leaf'),cast:false}]});
 ms.forEach(([x,z],i)=>{mc.set(i,x,-.03,z,rnd(0,PI*2),rnd(.6,1.4));mc.color(0,i,['#8cbf5c','#9fcb68','#7cb251','#b0d47a'][i%4]);});
 // 둑의 작은 돌
 const bs=[];for(let x=-21;x<21;x+=.9){const side=R()<.5?1:-1;if(x>3.2&&x<5.9&&side>0)continue;bs.push([x+rnd(-.3,.3),(side>0?zS(x):zN(x))-side*rnd(-.1,.25)]);}
 const bc=G.fx.crowd({parent:root,n:bs.length,parts:[{geo:new THREE.DodecahedronGeometry(.14,0).scale(1.3,.7,1),mat:T('#ffffff','stone'),at:[0,0,0]}]});
 bs.forEach(([x,z],i)=>{bc.set(i,x,-.04,z,rnd(0,PI*2),rnd(.7,1.8));bc.color(0,i,['#d8cdbd','#c4b6a4','#e6dccd'][i%3]);});
 // 풀포기(발목 높이) — 고르게 뿌리지 않고 둑·길가에만
 const tf=[...ms.filter((_,i)=>i%2===0).map(([x,z])=>[x+rnd(-.4,.4),z]),...around(2)],tc=G.fx.crowd({parent:root,n:tf.length,parts:[{geo:bladeClump(4,.3,.6,'tuft'),mat:grassMat,cast:false}]});
 tf.forEach(([x,z],i)=>{tc.set(i,x,0,z,rnd(0,PI*2),rnd(.8,1.3));tc.color(0,i,['#93c562','#a9d06e','#7fb553'][i%3]);});}
// 나무뿌리: 큰 줄기 밑에서 땅 위로 구불구불
{const rm=T('#a07450','wood');[[-3.4,9.6],[-4.6,4.4],[6.6,5.6],[8.2,1.2],[-11.5,.4],[9.4,-11.6],[-10.6,-10.4],[-5.6,10.6],[8.8,7],[-7.4,3.6]].forEach(([x,z],k)=>{
  for(let j=0;j<3;j++){const a=rnd(0,PI*2),L=rnd(.9,1.8),pts=[];for(let s=0;s<=4;s++){const t=s/4;pts.push(new THREE.Vector3(x+Math.cos(a+t*.6)*L*t,.1*Math.sin(t*PI)+.02-.08*t*t,z+Math.sin(a+t*.6)*L*t));}
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),8,.07*(1+(j===0)),5),rm,0,0,0,{line:false,cast:false});}});}
/* ---------- 아기자기한 소품 모음: 선착장·사공 주변·들어오는 길 ----------
   충돌(2026-11-02 끼임): 원더룹보다 작은 도토리·자루·이정표는 막지 않고(지나가면 겹쳐 보일 뿐), 바구니·실패만 둥근 기둥으로 막는다 — 소품 사이 좁은 틈에 끼지 않게 */
const acorn=(x,z,s,ry)=>{SOLID.push([x,z,.3*s]);const g=group(x,0,z,ry);add(lathe([[0,0],[.22,.03],[.3,.18],[.28,.36],[.2,.46],[0,.5]].map(q=>new THREE.Vector2(q[0]*s,q[1]*s)),10),T('#c9935c','wood'),0,0,0,{parent:g,line:false});
  add(lathe([[0,.62],[.16,.6],[.3,.5],[.33,.42],[.28,.4],[0,.42]].map(q=>new THREE.Vector2(q[0]*s,q[1]*s)),10),T('#8a6040','stone'),0,0,0,{parent:g,line:false});
  add(new THREE.CylinderGeometry(.025*s,.03*s,.12*s,5),T('#6e4c34'),0,.66*s,0,{parent:g,line:false});};
const basket=(x,z,ry,cols)=>{SOLID.push([x,z,.36]);const g=group(x,0,z,ry);add(new THREE.CylinderGeometry(.34,.28,.28,10,1,true),T('#c89a64','wood',{side:THREE.DoubleSide}),0,.14,0,{parent:g,line:false});
  add(new THREE.CylinderGeometry(.28,.28,.02,10),T('#9a7048','wood'),0,.02,0,{parent:g,line:false});add(new THREE.TorusGeometry(.34,.03,4,12),T('#a87b4e','wood'),0,.28,0,{parent:g,line:false,rx:PI/2});
  for(let k=0;k<7;k++){const a=k/7*PI*2;add(new THREE.SphereGeometry(.1,7,5),T(cols[k%cols.length]),Math.cos(a)*.17*(k?1:0),.27+(k?0:.06),Math.sin(a)*.17*(k?1:0),{parent:g,line:false});}obstacles.push({c:[x,z,.36]});};
const spool=(x,z,ry,col)=>{SOLID.push([x,z,.32]);const g=group(x,0,z,ry);add(new THREE.CylinderGeometry(.3,.3,.08,12),T('#d9b98a','wood'),0,.04,0,{parent:g,line:false});add(new THREE.CylinderGeometry(.24,.24,.36,12),T(col),0,.26,0,{parent:g,line:false});
  add(new THREE.CylinderGeometry(.3,.3,.08,12),T('#d9b98a','wood'),0,.48,0,{parent:g,line:false});obstacles.push({c:[x,z,.32]});};
const sack=(x,z,s,ry)=>{SOLID.push([x,z,.32*s]);const g=group(x,0,z,ry);add(lathe([[0,0],[.26,.02],[.32,.2],[.28,.42],[.14,.52],[.1,.6],[.16,.68],[0,.7]].map(q=>new THREE.Vector2(q[0]*s,q[1]*s)),9),T('#e8d6b4','petal'),0,0,0,{parent:g,line:false});
  add(new THREE.TorusGeometry(.11*s,.025*s,4,10),T('#b7865a'),0,.56*s,0,{parent:g,line:false,rx:PI/2});};
const sign=(x,z,ry,col)=>{SOLID.push([x,z,.3]);const g=group(x,0,z,ry);cylAt(.05,.06,1.1,T('#9a6a44','wood'),0,0,0,{parent:g,line:false});const L=leafHeart(.7,T(col,'leaf'));L.position.set(0,.68,.05);L.rotation.set(0,0,PI);L.scale.set(1,.7,1);g.add(L);
  add(new THREE.BoxGeometry(.5,.18,.04),T('#f3e3c3','wood'),0,.92,.1,{parent:g,line:false});};
const coil=(x,y,z)=>{for(let k=0;k<3;k++)add(new THREE.TorusGeometry(.2-k*.04,.035,5,14),T('#e2c597'),x,y+.035+k*.06,z,{rx:PI/2,line:false});};
// 들어오는 길: 이정표 + 씨앗 자루 + 도토리
sign(-1.6,9.4,.5,'#9ccb6a');sack(1.9,10.4,1,.4);sack(2.4,10.9,.8,1.6);acorn(-2.2,7.6,1,.3);
// 선착장 앞: 도토리 통·열매 바구니·실패 의자·밧줄
acorn(2.7,-1.1,1.1,.4);acorn(2.2,-.5,.85,2.1);basket(6.5,-1.2,.3,['#e86f86','#f2b33c','#9a7ce0','#ef8fb0']);spool(7.7,-.2,.6,'#f2a7b8');basket(1.9,.3,1.2,['#7ab8e8','#f2b33c','#e86f86']);
coil(5.2,DOCK.top,-4.6);coil(3.9,DOCK.top,-2.3);
// 사공 주변 물가: 노 하나 기대어 두고, 씨앗 자루
{const oar=add(new THREE.CylinderGeometry(.035,.035,1.5,6),T('#b07a4c','wood'),7.1,.7,-1.9,{line:false,rz:.35,rx:-.2});const bl=add(new THREE.SphereGeometry(.22,8,4),T('#c48a56','wood'),7.35,.12,-2,{line:false});bl.scale.set(.5,1,.14);}
sack(8.2,-1.4,.9,2.4);acorn(8.8,-.6,.9,1);
// 건너편 마을 앞: 바구니·실패·자루
basket(-2.2,-10,.8,['#f2b33c','#e86f86','#9a7ce0']);spool(5,-9.6,1.1,'#bba6ea');sack(-5.2,-11.2,1,.2);acorn(7.6,-10,1,.7);
/* 꽃지붕 집 두 채 (건너편 마을) — 창문은 등불(시간 따라 켜짐) */
const winMats=[];
const hut=(x,z,roof,ry)=>{const g=group(x,0,z,ry);cylAt(.9,1,1.36,T('#f3e6cf','petal'),0,-.06,0,{parent:g,line:false}); // 땅에 6cm 묻는다(바닥 면이 땅과 같은 높이면 흐려질 때 겹쳐 깜빡였다)
  add(new THREE.BoxGeometry(.5,.8,.1),T('#9a6a42','wood'),0,.4,.96,{parent:g,line:false});const wm=toon('#ffd98a',{emissive:'#ffc860',ei:.4});winMats.push(wm);add(new THREE.CircleGeometry(.18,12),wm,.45,.85,.9,{parent:g,line:false,ry:.45});keep.push(g);
  for(let k=0;k<6;k++){const p=add(new THREE.SphereGeometry(.85,9,5),T(roof,'petal'),0,1.55,0,{parent:g,line:false});p.scale.set(.62,.28,1);p.position.set(Math.sin(k/6*PI*2)*.55,1.5,Math.cos(k/6*PI*2)*.55);p.rotation.set(-.55,k/6*PI*2,0,'YXZ');}
  add(new THREE.SphereGeometry(.25,8,5),T('#86b058','leaf'),0,2.05,0,{parent:g,line:false,s:[1,.6,1]});obstacles.push({c:[x,z,1.15]});blob(x,z,1.5,1.5,.25);
  FADEP.push({g,skip:m=>m.material===wm,onFade:a=>{g.children.forEach(m=>{if(m.material===wm)m.visible=a>.5;});}});}; // 창문(시간 따라 켜지는 등불)은 따로 두고 집이 흐려지면 숨긴다
hut(-3.2,-11.5,'#f4a9b6',.3);hut(6.5,-10.6,'#c4a6e6',-.4);
/* 꽃 무리 (분홍·노랑·하양·연보라) — 길가·물가·마을 앞에 모아서. 밤에는 은은하게 빛난다 */
const flowerMats=[];
{const FL=[['#f5a8b8',3],['#f7d66a',2],['#fbf1e2',2],['#c9b2ee',2]],all=[];
 FL.forEach(([c,k])=>around(k).forEach(([x,z])=>all.push([x,z,c,rnd(0,PI*2),rnd(.9,1.8)]))); // 난수 순서는 예전(색마다 자리 → 각도·크기) 그대로
 // 네 가지 색을 무리 하나로(인스턴스 색) — 밤 발광도 꽃잎 색으로(스스로 빛나는 색 × 인스턴스 색), 휴대폰 드로우콜을 줄이려고 2026-11-02 합침
 const fm=toon('#ffffff',{map:TX.petal,emissive:'#ffffff',ei:0});fm.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('vec3 totalEmissiveRadiance = emissive;','vec3 totalEmissiveRadiance = emissive * vColor.rgb;');};flowerMats.push(fm);
 const cr=G.fx.crowd({parent:root,n:all.length,parts:[{geo:new THREE.SphereGeometry(.11,7,3).scale(1,.35,1),mat:fm,at:[0,.2,0],cast:false},{geo:new THREE.CylinderGeometry(.014,.018,.2,4),mat:stemMat,at:[0,.1,0],cast:false},{geo:new THREE.SphereGeometry(.04,5,3),mat:T('#f2c34c'),at:[0,.22,0],cast:false}]});
 all.forEach(([x,z,c,ry,sc],i)=>{cr.set(i,x,0,z,ry,sc);cr.color(0,i,c);});}
/* ---------- 버섯등: 길가 울타리 기둥 위 + 들판의 작은 빛나는 버섯 — 해 질 녘부터 하나씩 켜진다 ---------- */
const L=G.lamps.lampSet({parent:root,real:1,color:0xffc070,glowColor:0xffd690,warm:.18});
const LAMPS=[],POOLS=[];const lampMat=()=>{const m=toon('#fff2d2',{emissive:'#ffe2a0',ei:.2});return m;};
{const pts=[[-1.9,11.5],[-2.1,9],[-1.6,6.6],[-.4,4.4],[1.3,2.5],[2.7,.7]],pts2=[[2.1,11.5],[2.2,9],[2.7,6.8],[3.6,4.8],[4.9,2.8],[6,1]];let n=0;
 for(const P of [pts,pts2]){P.forEach(([x,z],i)=>{SOLID.push([x,z,.12]);cylAt(.07,.08,.62,T('#8b5d3a','wood'),x,0,z,{line:false});const m=lampMat();add(new THREE.SphereGeometry(.14,10,5,0,PI*2,0,PI/2),m,x,.62,z,{line:false,cast:false});
   const lp=L.add({x,y:.75,z,reach:4.5,glow:{y:.74,size:1.1,op:.55}}),th=.72+((n*5)%9)*.07;LAMPS.push({m,lp,th});POOLS.push({x,z,r:1.5,op:.5,th});n++;
   if(i)add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(P[i-1][0],.45,P[i-1][1]),new THREE.Vector3((x+P[i-1][0])/2,.36,(z+P[i-1][1])/2),new THREE.Vector3(x,.45,z)]),8,.02,4),T('#e2c597'),0,0,0,{line:false,cast:false});});}}
// 선착장 등불: 갈고리 기둥에 매단 둥근 등
{cylAt(.08,.09,1.9,T('#8b5d3a','wood'),3.1,0,-1.4,{line:false});add(new THREE.BoxGeometry(.6,.07,.07),T('#8b5d3a','wood'),3.35,1.85,-1.4,{line:false});
 const m=lampMat();add(new THREE.SphereGeometry(.17,12,8),m,3.6,1.55,-1.4,{line:false,cast:false});add(new THREE.CylinderGeometry(.01,.01,.22,4),T('#6e4c34'),3.6,1.72,-1.4,{line:false,cast:false});
 const lp=L.add({x:3.6,y:1.55,z:-1.4,reach:5,glow:{y:1.55,size:1.4,op:.6}});LAMPS.push({m,lp,th:.7});POOLS.push({x:3.6,z:-1.4,r:2,op:.55,th:.7});obstacles.push({c:[3.1,-1.4,.15]});}
// 들판의 작은 빛나는 버섯 (모여서 핀다)
{const ms=[[-3.6,8.6],[-3.2,8.9],[-3,8.4],[5.1,6.4],[5.4,6.1],[-6,-.2],[-5.7,.1],[8.8,-1.2],[-8,-11.4],[-7.6,-11.7],[2.2,-11.6],[2.5,-11.9]];
 const groups=[0,1,2,3].map(()=>lampMat());ms.forEach(([x,z],i)=>{const g=group(x,0,z,0),s=rnd(.8,1.4);cylAt(.035*s,.045*s,.16*s,T('#f5ecdc'),0,0,0,{parent:g,line:false,cast:false});
   add(new THREE.SphereGeometry(.1*s,8,4,0,PI*2,0,PI/2),groups[i%4],0,.15*s,0,{parent:g,line:false,cast:false});});
 groups.forEach((m,k)=>LAMPS.push({m,lp:null,th:.85+k*.12}));
 [[0,3],[3,5],[5,7],[7,8],[8,10],[10,12]].forEach(([a,b])=>{const c=ms.slice(a,b);POOLS.push({x:c.reduce((q,p)=>q+p[0],0)/c.length,z:c.reduce((q,p)=>q+p[1],0)/c.length,r:1,op:.4,th:.85+(a%4)*.12});});} // 버섯 무리 밑에도 작은 웅덩이
/* 등불 아래 빛 웅덩이(2026-11-03, 해 질 녘부터 등마다 켜지는 때에 맞춰, 밤에 진하게): 노란 가운데 → 주황 가장자리, 땅에 붙인 덧칠 판을 모두 한 덩어리로(그리기 1회 — 예전엔 등마다 1회씩 일곱).
   등마다 밝기는 정점 알파로. 둥근 땅에서도 땅을 따라 휘게 4×4칸 */
const pools=(()=>{const cv=document.createElement('canvas');cv.width=cv.height=128;const g=cv.getContext('2d'),gr=g.createRadialGradient(64,64,0,64,64,64);
  gr.addColorStop(0,'rgba(255,214,140,1)');gr.addColorStop(.45,'rgba(255,170,90,.5)');gr.addColorStop(1,'rgba(255,150,70,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);
  const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;
  const geos=POOLS.map(p=>{const q=new THREE.PlaneGeometry(p.r*2,p.r*2,4,4).rotateX(-PI/2).translate(p.x,.035,p.z);const n=q.attributes.position.count,c=new Float32Array(n*4);for(let i=0;i<n;i++)c.set([1,.64,.36,0],i*4);
    q.setAttribute('color',new THREE.BufferAttribute(c,4));p.n=n;return q;});
  const m=new THREE.Mesh(mergeGeometries(geos),new THREE.MeshBasicMaterial({map:t,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,polygonOffset:true,polygonOffsetFactor:-3}));
  m.renderOrder=1;m.visible=false;root.add(m);keep.push(m);return m;})();
/* 물에 비친 불빛(밤): 선착장 등·꽃지붕 집 창문·물가 등 아래로 길게 일렁이는 빛 줄기 — 한 덩어리(그리기 1회), 줄기마다 밝기는 정점 알파 */
const REFL=[[3.2,-2.7,2.4,.8,.7],[-3,-7.6,2.2,.75,.95],[6.4,-6.7,2,.75,1.1],[6,-2.6,1.8,.4,.9],[-5.9,-3.7,1.8,.35,1]]; // x, 물가 z, 길이, 세기, 켜지는 때
const refl=(()=>{const cv=document.createElement('canvas');cv.width=32;cv.height=128;const g=cv.getContext('2d'),r2=rng('fairy-dock:refl');
  for(let y=0;y<128;y+=3){const w=6+r2()*20,a=.35+r2()*.65; // 끝으로 갈수록 옅어지는 건 정점 알파(무늬만 흐른다)
    g.fillStyle=`rgba(255,${200+r2()*40|0},${120+r2()*60|0},${a})`;g.fillRect(16-w/2+(r2()-.5)*6,y,w,1.6);}
  const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;t.wrapT=THREE.RepeatWrapping;
  const geos=REFL.map(([x,z0,len])=>{const dir=Math.sign(cz(x)-z0),q=new THREE.PlaneGeometry(.5,len,1,6).rotateX(-PI/2);if(dir<0)q.rotateY(PI);q.translate(x,-.07,z0+dir*len/2);
    const n=q.attributes.position.count,c=new Float32Array(n*4);q.setAttribute('color',new THREE.BufferAttribute(c,4));return q;});
  const m=new THREE.Mesh(mergeGeometries(geos),new THREE.MeshBasicMaterial({map:t,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
  m.renderOrder=1;m.visible=false;root.add(m);keep.push(m);return m;})();
/* 잔물결 반짝임(밤): 물 위 작은 점들이 하나씩 짧게 반짝 — 점마다 때가 다름, 한 번에 그림(그리기 1회). 둥근 땅에 맞춰 wlBent(game/bend) */
const glints=(()=>{const N=MOB?36:70,pos=[],ph=[],r2=rng('fairy-dock:glint');for(let i=0;i<N*6&&pos.length<N*3;i++){const x=-16+r2()*32,z=cz(x)+(r2()*2-1)*hw(x)*.85;pos.push(x,-.07,z);ph.push(r2()*40);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('ph',new THREE.Float32BufferAttribute(ph,1));
  const U={uT:{value:0},uOp:{value:0},uH:{value:800}};
  const m=new THREE.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    vertexShader:'#include <common>\nattribute float ph;uniform float uT;uniform float uH;varying float vA;void main(){vec4 mv=viewMatrix*wlBent(modelMatrix*vec4(position,1.));float s=sin(uT*1.7+ph);vA=pow(max(0.,s),14.);gl_PointSize=.09*uH/max(.5,-mv.z)*(.6+.6*vA);gl_Position=projectionMatrix*mv;}',
    fragmentShader:'uniform float uOp;varying float vA;void main(){vec2 d=gl_PointCoord-.5;float r=length(d);float a=smoothstep(.5,.0,r);float x=max(0.,1.-abs(d.x)*9.)*max(0.,1.-abs(d.y)*2.2)+max(0.,1.-abs(d.y)*9.)*max(0.,1.-abs(d.x)*2.2);gl_FragColor=vec4(vec3(1.,.95,.82)*(a*.6+x),uOp*vA);}'});
  const p=new THREE.Points(g,m);p.frustumCulled=false;p.visible=false;p.renderOrder=2;
  p.onBeforeRender=(r,sc,cam)=>{U.uH.value=r.getDrawingBufferSize(_gs).y*cam.projectionMatrix.elements[5]*.5;};root.add(p);keep.push(p);return {p,U};})();
/* 공중 꽃가루(늘) · 반딧불(밤) — 원더룹 둘레를 따라다니는 빛 입자. 휴대폰 단계는 절반 아래로(발열) */
const pollen=G.fx.particles({parent:root,n:MOB?28:70,box:[9,3.2,9],vel:[.05,.07,.02],sway:.5,color:'#fff2bf',size:.07,life:[5,9],additive:true,seed:41});
const flies=G.fx.particles({parent:root,n:MOB?22:50,box:[10,2.2,10],vel:[0,.025,0],sway:.6,color:'#e6ff9a',size:.16,life:[5,9],additive:true,seed:43}); // 밤 반딧불: 2026-11-03 조금 더 많이, 천천히(오래 떠 있다 사라짐)
/* 연잎·잎사귀 배 (물 위 풍경) */
const pad=(x,dz,r)=>{const m=add(new THREE.CylinderGeometry(r,r,.04,13,1,false,.3,PI*2-.3),T('#86ba58','leaf'),x,-.08,cz(x)+dz,{ry:rnd(0,PI*2),line:false,cast:false});keep.push(m);return m;};
const pads=[[-12,1.3,.7],[-7.6,-1.2,.9],[-1.6,-1.8,.6],[9,-1.3,.8],[13,1.2,.6],[-15,-.9,.8],[11.2,.4,.5],[-10.4,-1.8,.55]].map(a=>pad(...a));
const leafBoat=(x,dz,ry)=>{const g=boatLeaf(1.1,.5);g.position.set(x,-.09,cz(x)+dz);g.rotation.y=ry;root.add(g);keep.push(g);return g;}; // 물 위에 떠 있는 빈 나뭇잎배(이슬배와 같은 모양)
const lboats=[leafBoat(-11,-.2,.4),leafBoat(10.5,.4,-.3)];
/* 떠다니는 이슬방울(풍경): 맑은 공 + 하이라이트 */
const dewMat=new THREE.MeshStandardMaterial({color:0xe9fbff,transparent:true,opacity:.42,roughness:.05,metalness:0,depthWrite:false});
const hiMat=new THREE.MeshBasicMaterial({color:0xfff4dc,transparent:true,opacity:.85}); // 하이라이트는 순백 대신 따뜻한 크림색(2026-11-03)
const dewBall=r=>{const g=new THREE.Group();const s=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),dewMat);s.renderOrder=2;g.add(s);const h=new THREE.Mesh(new THREE.SphereGeometry(r*.2,8,6),hiMat);h.position.set(-r*.38,r*.45,r*.55);h.scale.set(1,.6,.4);g.add(h);return g;};
const floaters=[[-9,.6,.22],[-5,1.6,.16],[1,-1.2,.2],[7.5,1.4,.18],[12,-.6,.24]].map(([x,dz,r],i)=>{const b=dewBall(r);b.position.set(x,r+.05,cz(x)+dz);b.userData.ph=i*1.3;root.add(b);keep.push(b);return b;});
/* ---------- 클로버 셋 (돌려 맞추기) — 남쪽 물가에서 물 위로 누운 큰 클로버. 처음엔 뒤틀려(잎 하나가 들림) 물길을 막고 있다 ---------- */
const CLOVERS=[-9.5,-5.5,-1.5].map((x,i)=>{const g=new THREE.Group();g.position.set(x,-.06,zS(x)-1.15);root.add(g);keep.push(g);
  const spin=new THREE.Group();g.add(spin);
  for(let k=0;k<3;k++){const L2=leafHeart(.95,k%2?cloverMat:cloverDk);L2.rotation.set(-PI/2,k*PI*2/3,0,'YXZ');L2.castShadow=true;spin.add(L2);}
  add(new THREE.SphereGeometry(.12,8,6),T('#6a9a40'),0,.06,0,{parent:spin,line:false});
  const twist=.95+i*.25;spin.rotation.y=twist;spin.rotation.z=.32*(i%2?1:-1); // 뒤틀림: 돌아가 있고 한쪽이 들려 있음
  // 미션 중 아직 안 돌린 클로버: 바람에 살랑이고 작은 반짝이가 위로 올라온다(돌리면 멈춤 — 몇 개 남았는지 보이게)
  const glint=G.fx.particles({parent:root,n:9,box:[.9,.1,.9],vel:[0,.55,0],sway:.3,color:'#fff6c8',size:.11,life:[.9,1.6],additive:true,seed:61+i,center:[x,.15,zS(x)-1.15]});glint.points.visible=false;
  return {g,spin,from:twist,to:0,tz:spin.rotation.z,u:-1,done:false,x,glint,sway:0};});
let fixed=0;
/* ---------- 요정 ---------- */
const boatman=fairy('boatman'),small=boatLeaf(1.5,.72); // 사공이 기다리는 작은 나뭇잎배
const bmG=new THREE.Group();bmG.position.set(6.4,-.06,-4.3);bmG.rotation.y=-.9;root.add(bmG);bmG.add(small);boatman.root.position.y=.01;bmG.add(boatman.root);keep.push(bmG);
const SHROOM=[-2.3,5.5];const shroom=fairy('mushroom');if(MOB)bakeFairy(shroom,{into:shroom.body});if(MOB)bakeFairy(boatman);shroom.root.position.set(SHROOM[0],0,SHROOM[1]);shroom.root.rotation.y=.85;root.add(shroom.root);keep.push(shroom.root);obstacles.push({c:[SHROOM[0],SHROOM[1],.3]}); // 왼쪽 울타리 바깥, 길을 보고 선다 — 길 한가운데면 시작 카메라 바로 앞에 갓이 걸렸다
shadowBlob(SHROOM[0],SHROOM[1],.35,.35);
G.occlude.add(shroom.root,.35,.9);
G.profile.setup({world:FAIRY_WORLD.world,cards:FAIRY_CARDS}); // 처음 이야기한 뒤 소개 카드 한 번 (도감 대신)
/* ---------- 숨겨진 비밀: 아기 소금쟁이 (2026-11-03 — 개미굴 비밀 장면처럼 표시 없이, 가까이 가면 금빛 반짝임만) ----------
   서쪽 강가 연잎 그늘(길에서 벗어난 곳)에서 물 위 걷기를 연습하는 아기. 6.5m 안이면 위에 ✦ 반짝임(안내 표시), 물가 1.7m 안이면 비밀 카드(금빛) → 탐험 가방 '숨겨진 비밀'에.
   찾은 기록은 flags['meet:fairy-forest:strider'](profile.found) — 다시 열면 아기는 그대로 있고 반짝임·카드는 없다 */
/* 숨겨진 비밀 둘(2026-11-03): 아기 소금쟁이(서쪽 강가 연잎 그늘) · 낮잠 자는 무당벌레(강 건너 동쪽 클로버 그늘). 표시 없이 가까이(6.5m) 가면 위에 금빛 ✦만, 닿으면(at 1.6m) 금빛 비밀 카드 */
const starTex=(()=>{const cv=document.createElement('canvas');cv.width=cv.height=128;const g=cv.getContext('2d');const gr=g.createRadialGradient(64,64,0,64,64,60);gr.addColorStop(0,'rgba(255,248,214,1)');gr.addColorStop(.25,'rgba(255,214,110,.75)');gr.addColorStop(1,'rgba(255,214,110,0)');
  g.fillStyle=gr;g.fillRect(0,0,128,128);g.fillStyle='#fffbe6';g.beginPath();[[64,6],[73,55],[122,64],[73,73],[64,122],[55,73],[6,64],[55,55]].forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.fill();
  const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;return t;})();
const zW=zS(-11.3);
const SECRETS=[
  {id:'strider',make:strider,pos:[-11.3,-.085,zW-.75],ry:PI*.8,at:[-11.3,zW+.55],title:'물 위를 걷는 아기 소금쟁이',text:'연잎 그늘에서 아기 소금쟁이가 물 위 걷기를 연습하고 있어요. 다리 끝의 가는 털이 물을 밀어내서 가라앉지 않는대요.'},
  {id:'ladybug',make:ladybug,pos:[11.2,0,-10.6],ry:-.6,at:[11.2,-10.6],title:'클로버 그늘에서 낮잠 자는 무당벌레',text:'축제 전에 한숨 자 두려는 무당벌레예요. 빨간 등딱지 아래에는 얇은 날개가 곱게 접혀 있어서, 깨면 바로 날아갈 수 있대요.'}];
SECRETS.forEach(S=>{S.m=S.make();S.m.root.position.set(...S.pos);S.m.root.rotation.y=S.ry;root.add(S.m.root);keep.push(S.m.root);
  S.star=new THREE.Sprite(new THREE.SpriteMaterial({map:starTex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,color:'#ffe08a',fog:false}));S.star.position.set(S.pos[0],Math.max(0,S.pos[1])+.5,S.pos[2]);S.star.visible=false;root.add(S.star);G.ui.hint(S.star);});
const secN=()=>SECRETS.filter(S=>G.profile.seen(S.id)).length;
function secretTick(t){const W=WL(),cam=G.view.camera;SECRETS.forEach((S,j)=>{S.m.tick(1/60,t);if(MOB&&cam)S.m.root.visible=Math.hypot(cam.position.x-S.pos[0],cam.position.z-S.pos[2])<13;if(!W||G.profile.seen(S.id)){S.star.visible=false;return;}const p=S.m.root.position,d=Math.hypot(W.position.x-p.x,W.position.z-p.z);
  S.star.visible=d<6.5&&G.ui.hintsVisible();if(S.star.visible){const k=.5+.5*Math.sin(t*3.1+j),sc=.35+.35*k*k;S.star.scale.set(sc,sc,1);S.star.material.rotation=t*.6;S.star.material.opacity=.45+.55*k;}
  if(Math.hypot(W.position.x-S.at[0],W.position.z-S.at[1])<1.6&&!G.core.blocking()&&!G.ui.cardShown()&&!(W.userData.vert&&W.userData.vert.air)){
    const img=G.profile.found(S.id,S.m.root);G.sound.sfx('dex');
    G.ui.secret({kicker:'숨겨진 비밀 발견!',title:S.title,text:S.text,icon:img,count:`발견한 비밀 ${secN()}/${SECRETS.length}`,button:'가방에 넣기'});}});}
/* ---------- 이슬배 (원더룹이 타는 길쭉한 나뭇잎배, 2026-11-02 그릇 배 대신) + 굴러오는 큰 이슬방울 ----------
   원더룹은 앞쪽에 앉고(ride pose '앉기'), 사공은 뒤쪽 끝에 서서 배 옆 바깥으로 노를 젓는다(노 끝이 물에 닿는 곳에 작은 물결). 굴러온 이슬방울은 배 가운데에 담겨 반짝인다 */
const BOAT0=[4.55,-.06,-5.75],BL=2.7;
const boat=new THREE.Group();boat.position.set(...BOAT0);boat.rotation.y=-PI/2;root.add(boat);keep.push(boat);const hull=boatLeaf(BL,1.2);boat.add(hull); // 배는 선착장 끝 옆면에 나란히(뱃머리가 갈 쪽 -x) — 배 끝이 선착장 밑으로 들어가지 않게(2026-11-02, 예전엔 선착장 쪽을 향해 바닥을 뚫었다)
const boatDew=dewBall(.24);boatDew.position.set(0,hull.userData.floor(-.08)+.22,-.08*BL/2);boatDew.visible=false;boat.add(boatDew); // 배에 담긴 이슬방울(반짝임은 update)
const bigDrop=dewBall(.55);bigDrop.visible=false;root.add(bigDrop);keep.push(bigDrop);
const splash=G.fx.particles({parent:root,n:40,box:[.4,.2,.4],vel:[0,1.1,0],sway:.25,color:'#e8fbff',size:.09,life:[.5,1],additive:true,rate:0,seed:31,center:[4.55,.3,-5.75]});
let drop=null; // {t} 굴러오는 중
let boatReady=false,rode=false;
const hasUmb=()=>G.items.has('umbrella'); // 민들레 솜털 우산: 공통 아이템(game/items, flags.umbrella — 저장, 다음 스테이지에서도 활공)
/* ---------- 민들레 솜털 우산 (활공 물건) — 민들레 홀씨 공(fairies.js dandelionPuff). 07이 원더룹 오른손에 줄기를 쥐여 머리 위로 들고, 활공하는 동안 솜털이 살랑인다(update) ---------- */
let umb=null;
function umbrella(){umb=dandelionPuff({stem:1.9,reach:.36});return umb;} // 오른손(몸 가운데에서 약 0.36m 옆)에서 머리 위 가운데로
// 우산을 가지고 있으면 활공할 때 펼쳐 드는 모양을 단다(활공 여부는 07이 아이템으로 — 이 구역은 모양만). 받는 순간(flags.umbrella)에도
function syncUmbrella(){const W=WL();if(W&&hasUmb()&&!umb)W.userData.setGlideProp(umbrella());}
const offUmb=G.state.onFlag(k=>{if(k==='umbrella')syncUmbrella();});
/* 건너편 바위 두 개 (발판): 우산을 받은 뒤 뛰어올라 떨어지며 활공해 보는 곳 */
const ROCKS=[{c:[-6.5,-10.4,.75],top:.5},{c:[-8.4,-11.6,.8],top:1.0}];
ROCKS.forEach(r=>{SOLID.push([r.c[0],r.c[1],r.c[2]]);add(new THREE.CylinderGeometry(r.c[2]*.85,r.c[2],r.top,9),T('#d8c8ae','stone'),r.c[0],r.top/2,r.c[1],{ry:r.c[0],line:false});
  add(new THREE.CylinderGeometry(r.c[2]*.86,r.c[2]*.86,.06,9),T('#93bb5c','leaf'),r.c[0],r.top+.01,r.c[1],{line:false,cast:false});});
/* ---------- 마을 주민 요정 (2026-11-03 — 개미굴 마을처럼 북적이게) ----------
   꽃·바람·작은 버섯 요정 여덟. 걷기(a↔b를 오가며 끝에서 잠깐 쉼)·수다(둘이 마주 보고)·물가 구경. 원더룹이 2m 안에 오면 멈춰 원더룹을 본다.
   모두 말을 걸 수 있다(한두 마디 — 첫별 축제 준비·물길 이야기). 강 이쪽 주민 둘과 이야기하면 사공 요정에게 가라는 할 일로 넘어간다.
   주민 하나 = 그리기 1번(흰 천 결 한 장 + 색 → bakeFairy into body), 휴대폰은 동그란 그림자 무리 하나(blobMany) */
const VILL=[
  {kind:'flower',name:'꽃 요정',o:{petal:'#f4a7b9'},a:[-7,1.4],b:[-2.2,2.3],side:'S',lines:['오늘 밤이 첫별 축제래! 꽃잎 바구니 나르느라 날개가 없어도 바빠.','꽃잎은 가볍지만, 백 장이면 이야기가 달라.']},
  {kind:'flower',name:'꽃 요정',o:{petal:'#f7c08a',dress:'#fbe7a8'},a:[6.3,3.4],face:[7.4,4.2],side:'S',lines:['바람아, 오늘은 제발 축제 장식 날리지 마.','지난번엔 내 꽃잎 리본을 연못까지 날려 보냈거든.']},
  {kind:'wind',name:'바람 요정',o:{dress:'#a9d8b0'},a:[7.4,4.2],face:[6.3,3.4],side:'S',lines:['나 아니야! …아마도.','클로버를 뒤튼 것도 내가 아니야. 아침 바람이 조금 신이 났을 뿐이지.']},
  {kind:'mushroom',name:'꼬마 버섯 요정',o:{cap:'#b99ae0'},a:[2.6,6.4],b:[6.2,6.9],side:'S',lines:['비 온 다음 날엔 내 키가 한 뼘씩 자라.','어른들이 그러는데, 진짜 우리는 땅속에서 서로 손을 잡고 있대.']},
  {kind:'flower',name:'꽃 요정',o:{petal:'#fbf1e2',hem:'#c9b2ee'},a:[9.6,-.7],face:[9.6,-3],side:'S',lines:['이슬배가 안 떠서 강 건너 친구를 못 보고 있어.','물길만 열리면 금방인데…']},
  {kind:'wind',name:'바람 요정',o:{dress:'#c7e6f2',hair:'#6e4a33'},a:[-11.5,3.2],b:[-7.5,4.6],side:'S',lines:['후~ 나는 바람으로 길 안내를 해. 오늘은 별꽃 전망대 쪽으로 불고 있어.']},
  {kind:'flower',name:'꽃 요정',o:{petal:'#c9b2ee'},a:[-6,-9.2],b:[-1,-9.2],side:'N',lines:['강을 건너왔구나! 이 길로 조금만 더 가면 민들레 공중정원이야. 문은 축제 전에 열린대.']},
  {kind:'mushroom',name:'꼬마 버섯 요정',o:{cap:'#e2493c'},a:[-10.5,-9.4],face:[-8.4,-11.6],side:'N',lines:['여긴 민들레 공중정원 가는 길이야. 문은 아직 닫혀 있지만, 축제 전엔 열릴 거야.']}];
const vShadow=blobMany(VILL.length,.6);if(vShadow)root.add(vShadow);
const villagers=VILL.map((d,i)=>{const v=villager(d.kind,d.o);bakeFairy(v,{into:v.body});v.root.position.set(d.a[0],0,d.a[1]);
  const f=d.face||d.b;if(f)v.root.rotation.y=Math.atan2(f[0]-d.a[0],f[1]-d.a[1]);root.add(v.root);keep.push(v.root);G.occlude.add(v.root,.3,.8);
  const st={d,v,i,u:(i*.37)%1,dir:1,wait:0,talked:false};
  st.npc=G.dialog.npc({name:d.name,root:v.root,bubbleY:d.kind==='mushroom'?.75:.95,variants:[{when:()=>true,lines:d.lines}],onDone:()=>{if(!st.talked){st.talked=true;villTalked();}}});
  return st;});
let talkedN=0;
function villTalked(){talkedN++;if(st.phase==='arrive'&&talkedN<=2){q(talkedN<2?`마을 요정들과 이야기해요 (${talkedN}/2)`:'선착장의 사공 요정에게 가 봐요');if(talkedN===2)G.sound.sfx('chime');}}
function tickVillagers(dt,t){const W=WL(),cam=G.view.camera;villagers.forEach(s=>{const {d,v}=s,p=v.root.position;let moving=false;
  const near=W&&Math.hypot(W.position.x-p.x,W.position.z-p.z)<2;
  if(near){const ty=Math.atan2(W.position.x-p.x,W.position.z-p.z);v.root.rotation.y+=Math.atan2(Math.sin(ty-v.root.rotation.y),Math.cos(ty-v.root.rotation.y))*Math.min(1,dt*6);}
  else if(d.b){if(s.wait>0)s.wait-=dt;else{const L=Math.hypot(d.b[0]-d.a[0],d.b[1]-d.a[1]);s.u+=s.dir*dt*.65/L;if(s.u>=1||s.u<=0){s.u=Math.max(0,Math.min(1,s.u));s.dir*=-1;s.wait=1.2+((s.i*.7)%1.3);}
    const x=d.a[0]+(d.b[0]-d.a[0])*s.u,z=d.a[1]+(d.b[1]-d.a[1])*s.u;p.x=x;p.z=z;moving=s.wait<=0;
    const ty=Math.atan2((d.b[0]-d.a[0])*s.dir,(d.b[1]-d.a[1])*s.dir);v.root.rotation.y+=Math.atan2(Math.sin(ty-v.root.rotation.y),Math.cos(ty-v.root.rotation.y))*Math.min(1,dt*8);}}
  else if(d.face){const ty=Math.atan2(d.face[0]-p.x,d.face[1]-p.z);v.root.rotation.y+=Math.atan2(Math.sin(ty-v.root.rotation.y),Math.cos(ty-v.root.rotation.y))*Math.min(1,dt*3);}
  v.tick(dt,t,moving);if(vShadow)vShadow.set(s.i,p.x,.02,p.z,.32);
  if(MOB&&cam){const far=Math.hypot(cam.position.x-p.x,cam.position.z-p.z)>13;v.root.visible=!far;}});} // 휴대폰: 카메라에서 13m 밖 주민은 그리지 않는다(안개 속 — 스테이지 예산)
/* ---------- 이야기 ---------- */
const st={phase:'arrive'};
const q=t=>G.ui.setQuest(t);
q('마을 요정들과 이야기해요 (0/2)');
let shroomTalked=false;
G.dialog.npc({name:'버섯 요정',root:shroom.root,bubbleY:1.05,onDone:()=>{if(!shroomTalked){shroomTalked=true;villTalked();}return G.profile.meet('mushroom',shroom.root);},variants:[ // 소개 카드는 끝까지 들었을 때만(onDone — game/dialog)
  {when:()=>!hasUmb(),lines:['어머, 꽃봉오리 손님이네! 오늘 밤 첫별 축제 보러 왔구나?','축제는 별꽃 전망대에서 열려. 사공 아저씨 배를 타야 갈 수 있지.']},
  {when:()=>hasUmb(),lines:['우산 받았구나! 민들레 공중정원에선 그걸 펴고 바람을 탄대. 부럽다~']}]});
const boatNpc=G.dialog.npc({name:'사공 요정',root:boatman.root,bubbleY:1.3,talkR:.9,onDone:()=>afterBoatman(),variants:[
  {when:()=>st.phase==='arrive',lines:['어이쿠, 손님이구나! 첫별 축제 가는 길이지?','그런데 큰일이야. 아침 바람에 클로버 잎들이 뒤틀려서 물길을 꽉 막아 버렸어.','물길이 막히면 이슬방울이 못 굴러와. 이슬이 없으니 이슬배가 못 떠나고 있단다!','저기 강가에 뒤틀린 클로버 잎 세 개 보이지? 손으로 돌려서 바로 놓아 줄 수 있겠니?']},
  {when:()=>st.phase==='clovers',lines:['클로버는 이쪽 강가를 따라 셋 있어. 살랑살랑 반짝이는 잎이야. 가까이 가서 돌려 줘!']},
  {when:()=>st.phase==='boat'&&!nearBoat(),lines:['이슬배가 찰랑찰랑 찼어! 자, 타렴. 내가 노를 저어 줄게.']}, // 배 앞에서는 사공 '말 걸기' 대신 '이슬배 타기'만(헷갈리지 않게 — 2026-11-03)
  {when:()=>st.phase==='done',lines:['우산은 민들레 공중정원에서 펼쳐 보렴. 그곳 바람은 아주 신나거든!']}]});
/* 사공 대화를 끝까지 들은 뒤(onDone). 처음(arrive): 미션 카드 → 카드를 닫으면 카메라가 클로버 셋을 1.8초 비춤(어디인지 몰라 헤매지 않게) → 돌아온 뒤 사공 소개 카드.
   앞의 것이 끝나야 다음이 나온다(G.steps — 2026-11-02, 셋이 한꺼번에 떠서 카드를 보는 사이 카메라 연출이 지나갔다) */
function afterBoatman(){const meet=()=>G.profile.meet('boatman',boatman.root);
  if(st.phase==='boat'){meet();startRide();return;} // 배가 찼으면 사공과 이야기를 마치는 대로 함께 탄다(배 옆이라 E가 사공 대화를 먼저 잡는다)
  if(st.phase!=='arrive'){meet();return;}st.phase='clovers';q('클로버 잎 돌리기 (0/3)');
  G.steps(()=>G.ui.notice({kicker:'미션',title:'클로버 잎을 돌려 주세요',text:'강가에 누운 클로버 셋을 손으로 돌려 바로 놓으면, 막힌 이슬 물길이 다시 이어져요.'}),
    ()=>G.view.focus({at:[-5.2,.2,zS(-5.2)-1.1],from:[2.2,4.6,zS(2.2)+3.4],sec:1.8}),meet);}
CLOVERS.forEach(c=>G.interact.add({root:c.g,at:[c.x,zS(c.x)+.55],face:[c.x,c.g.position.z],label:'돌리기',action:'돌리기',dur:1.5,once:true,near:2.6,
  when:()=>st.phase==='clovers',
  onStart:()=>{c.u=0;},
  onDone:()=>{c.done=true;fixed++;G.sound.sfx('chime');q(fixed<3?`클로버 잎 돌리기 (${fixed}/3)`:'물길이 열렸어요!');if(fixed===3)openChannel();}}));
function openChannel(){st.phase='rolling';G.dialog.say('사공 요정','물길이 열렸다! 저기 봐, 이슬방울이 굴러온다!',3);
  drop={t:0};bigDrop.visible=true;G.sound.sfx('whoosh');
  // 물길이 열리면 카메라가 원더룹 대신 굴러오는 이슬방울을 따라 비추고, 나뭇잎배에 퐁 들어간 뒤 0.8초 있다가 원더룹 쪽으로 돌아온다(2026-11-02)
  dropCam=-1;G.view.hold(()=>{if(dropCam===0)return null;const p=bigDrop.visible?bigDrop.position:boat.position;const asp=G.view.camera.aspect,K=asp<1.25?Math.min(1.6,(1.25/asp)**.6):1,fx=p.x+5.2*K;return {at:[p.x,.35,p.z],from:[fx,2.4,cz(fx)+.6]};});} // 물길 위(소품이 없는 곳)에서 굴러오는 쪽을 마주 보며
let dropCam=0; // -1 굴러오는 중, 양수 = 배에 들어간 뒤 남은 초
/* 이슬배 타기: 배가 찼을 때만. 선착장 끝(배 옆) 가까이 오면 '이슬배 타기' 단추 — 사공보다 먼저(위 사공 대화 nearBoat). 배 위로 클로버처럼 작은 반짝이가 올라온다(update) */
const BOARD=[4.55,-4.7],nearBoat=()=>{const W=WL();return !!W&&Math.hypot(W.position.x-BOARD[0],W.position.z-BOARD[1])<2.4;};
G.interact.add({root:boat,at:BOARD,face:[4.55,-5.75],label:'이슬배 타기',action:'서기',dur:.2,once:true,near:2.6,when:()=>st.phase==='boat',onDone:()=>startRide()});
const boatGlint=G.fx.particles({parent:root,n:12,box:[1.3,.1,.5],vel:[0,.55,0],sway:.3,color:'#fff6c8',size:.12,life:[.9,1.6],additive:true,seed:67,center:[BOAT0[0],.25,BOAT0[2]]});boatGlint.points.visible=false;
/* 요정·캐릭터가 설 빈 자리: (cx,cz) 둘레 d0~d1m에서 장애물·발판·소품(SOLID)·물·구역 밖을 피하고, prefer 방향에 가까운 곳(카메라에서 둘 다 보이게).
   r = 서는 몸 반지름 + 여유 */
function openSpot(cx,cz,{prefer=[1,0],d0=1,d1=1.5,r=.38,avoid=[]}={}){let best=null,bs=-1e9;const pa=Math.atan2(prefer[1],prefer[0]);
  const free=(x,z)=>{if(Math.abs(x+.5)>SIZE/2-3||Math.abs(z)>SIZE/2-3)return false;if(z>zN(x)-.35&&z<zS(x)+.35)return false; // 물 위
    for(const o of obstacles){if(o.r){if(x>o.r[0]-r&&x<o.r[1]+r&&z>o.r[2]-r&&z<o.r[3]+r)return false;}else if(Math.hypot(x-o.c[0],z-o.c[1])<o.c[2]+r)return false;}
    for(const q of [...SOLID,...avoid])if(Math.hypot(x-q[0],z-q[1])<q[2]+r)return false;return true;};
  for(let i=0;i<48;i++){const a=pa+(i%2?1:-1)*Math.ceil(i/2)*PI/24;for(const d of [d0,(d0+d1)/2,d1]){const x=cx+Math.cos(a)*d,z=cz+Math.sin(a)*d;if(!free(x,z))continue;
      const sc=-Math.abs(Math.atan2(Math.sin(a-pa),Math.cos(a-pa)))-Math.abs(d-1.2)*.3;if(sc>bs){bs=sc;best=[x,z];}}}
  return best;}
function startRide(){st.phase='riding';q('');boatman.wave(false);G.sound.sfx('pop');G.sound.sfx('whoosh',{minor:true}); // 탈 때 '퐁'(배에 올라탐) + 물 가르는 소리
  // 사공은 이슬배로 옮겨 타고 함께 간다
  bmG.visible=false;const bm2=fairy('boatman');bm2.root.position.set(0,hull.userData.floor(-.66),-.66*BL/2);bm2.root.scale.setScalar(.95);boat.add(bm2.root); // 사공은 배 뒤쪽 끝(노 젓는 자리), 원더룹은 앞쪽에 앉는다(ride fwd·pose)
  {const oar=bm2.root.userData.oar;bm2.arms[1].add(oar);oar.position.set(0,-.17,.03);}rower=bm2; // 배에서는 노를 왼손(+x, 마을 반대쪽 남쪽 강가)으로 — 카메라도 그쪽에서 봐서 마을 집·꽃지붕 속을 지나가지 않게
  {const c=boat.position,tx=-.5-c.x,tz=cz(-.5)-.2-c.z,tl=Math.hypot(tx,tz)||1,fx=tx/tl,fz=tz/tl,sx=-fz,sz=fx; // 처음 각도(배가 갈 쪽 기준 — 배는 출발한 뒤에야 돌아선다): 노 젓는 쪽(사공 왼쪽, 배의 +x — 남쪽 강가) 비스듬한 앞옆에서 둘 다 보이게. 그 뒤로는 플레이어가 마음대로 돌린다(카메라 규칙)
   G.view.start({at:[c.x,.85,c.z],from:[c.x-sx*6.2+fx*2.6,2.6,c.z-sz*6.2+fz*2.6]});}
  // 물길 가운데를 따라 건너편 둑까지(끝점은 둑에 살짝 올라 원더룹이 땅에 내린다)
  G.ride.ride({vehicle:boat,seat:hull.userData.floor(.46)+.005,fwd:.46*BL/2,pose:'앉기',speed:1.15,path:[BOAT0,[3,-.06,cz(3)-.9],[-.5,-.06,cz(-.5)-.2],[-4.5,-.06,cz(-4.5)-.6],[-6.6,-.06,zN(-6.6)+1],[-6.8,-.06,zN(-6.8)-.3]],
    onEnd:()=>{rode=true;st.phase='gift';boat.remove(bm2.root);rower=null;G.sound.sfx('land'); // 둑에 닿아 내림
      // 사공이 배 옆으로 한 걸음 나와(카메라에서 본 원더룹 옆쪽, 물가 땅) 원더룹을 보고 말한다 — 원더룹 뒤에 가려지지 않게
      {const cam=G.view.camera,f=new THREE.Vector3();cam.getWorldDirection(f);f.y=0;f.normalize();const W0=WL().position;
       // 원더룹 옆 1~1.5m 열린 땅(소품·그루터기·바위·물을 피해 — 예전엔 바위 속에 묻혀 머리만 보였다), 카메라에서 본 옆쪽을 먼저(둘 다 보이게)
       const sp=openSpot(W0.x,W0.z,{prefer:[-f.z,f.x],d0:1,d1:1.5,avoid:[[boat.position.x,boat.position.z,1.2]]})||[W0.x-f.z*1.05,W0.z+f.x*1.05];
       bmG.position.set(sp[0],0,sp[1]);small.visible=false;bmG.rotation.set(0,Math.atan2(W0.x-bmG.position.x,W0.z-bmG.position.z),0);bmG.visible=true;}
      G.dialog.say('사공 요정','도착! 물길을 열어 줘서 정말 고마워.',2.6).then(ok=>ok&&G.dialog.say('사공 요정','이건 내 민들레 솜털 우산이야. 민들레 공중정원에 가면 바람을 타고 날 때 꼭 필요할 거야!',4)).then(ok=>{
        if(!ok)return; // 구역을 바꿔 혼잣말이 지워졌으면 받지 않는다
        st.phase='done';G.items.give('umbrella');syncUmbrella(); // 공통 아이템으로 저장(flags.umbrella) — 펼쳐 드는 모양도
        {const W=WL();if(W){cheer.burst(28,{x:W.position.x,y:W.position.y+.9,z:W.position.z});cheerT=1.6;}} // 큰 보상: 개미굴 '여왕개미의 보물'처럼 가운데 큰 카드 + 반짝임
        q('');
        // 스테이지 끝(2026-11-03): 우산을 받는 것이 STAGE 01의 마지막 — 선물 카드를 닫으면 완료 배지 → 통과 결과창(우산은 다음 스테이지 민들레 공중정원에서 쓴다)
        G.ui.profileCard({kicker:'사공 요정의 선물',name:'민들레 솜털 우산을 받았어요!',intro:'바람을 타고 날 때 펼치는 우산이에요. 다음 목적지 민들레 공중정원에서 써 볼 수 있어요.',img:icon('umbrella'),bg:'#F3EAD6',button:'배낭에 달기'}).then(()=>stageClear());});}});}
/* ---------- 다시 열었을 때: 우산을 이미 받았으면 받은 뒤 모습으로(새로고침해도 우산은 flags.umbrella로 남는다) ----------
   클로버는 바로 놓였고, 이슬배는 건너편 둑에 닿아 있고, 사공은 그 옆 빈 땅에. 원더룹은 건너편(구역 정보 spawn)에서 시작 */
const CLEAR='clear:fairy-dock';
if(hasUmb()){st.phase='done';fixed=3;rode=true;CLOVERS.forEach(c=>{c.done=true;c.u=1;c.spin.rotation.set(0,0,0);});
  const a=[-6.6,zN(-6.6)+1],b=[-6.8,zN(-6.8)-.3];boat.position.set(a[0],-.06,a[1]);boat.rotation.y=Math.atan2(b[0]-a[0],b[1]-a[1]);
  const sp=openSpot(-6.6,-8.6,{prefer:[1,0],d0:1.1,d1:1.5,avoid:[[a[0],a[1],1.2]]})||[-5.4,-8.6];small.visible=false;bmG.position.set(sp[0],0,sp[1]);bmG.rotation.set(0,Math.atan2(-6.6-sp[0],-8.6-sp[1]),0);
  q('');if(!G.state.flags[CLEAR])G.state.setFlag(CLEAR,true);} // 예전 저장(우산만 받고 활공 전)도 완료로
/* ---------- 스테이지 완료: 우산 선물 카드를 닫으면 한 번(저장 flags['clear:fairy-dock']) — 반짝임 + 완료 배지 → 통과 결과창 ---------- */
const cheer=G.fx.particles({parent:root,n:28,box:[.45,.1,.45],vel:[0,1.2,0],sway:.5,color:'#ffe6a6',size:.13,life:[.7,1.3],additive:true,rate:0,seed:73});cheer.points.visible=false;let cheerT=0;
function stageClear(){G.state.setFlag(CLEAR,true);q('');const W=WL();if(W){cheer.burst(28,{x:W.position.x,y:W.position.y+.9,z:W.position.z});cheerT=1.6;}
  G.ui.stageBadge({...FAIRY_BADGE,stage:'이슬방울 선착장',next:'민들레 공중정원'});
  // 개미굴 '광장 통과!'처럼 결과창(배지 다음, 카드 자리 줄 서기): 한 줄 정리 + 발견한 비밀
  G.ui.result({title:'이슬방울 선착장 통과!',text:'마을 요정들과 인사하고 클로버 물길을 열어, 사공 요정의 이슬배로 강을 건넜어요. 선물받은 민들레 솜털 우산은 다음 목적지 민들레 공중정원에서 펼쳐 볼 수 있어요.',
    note:`✦ 발견한 비밀 ${secN()}/${SECRETS.length}`,buttons:[{label:'계속 둘러보기'}]});} // 스테이지 완료 배지(엔진 공통 ui.stageBadge — 2026-11-03 아이템 카드 모양 대신)
/* ---------- 나침반 시작 연출: 요정의 숲에 처음 들어오면 한 번(사공과 이미 이야기했으면 없음) — 진행을 막지 않는다 ----------
   배낭의 나침반 키링이 톡 흔들리며 반짝이고 바늘이 사공(선착장) 쪽을 가리킨다(07 charmPoint), 혼잣말 한 줄, 발밑에 선착장 쪽 빛 알갱이 줄(fx.guide, 2.6초).
   개미굴에서 받은 더듬이 나침반이 길 찾기에 실제로 쓰이게(2026-11-02). 그리기는 빛 줄 1회 + 반짝임 1회, 3초 안에 치운다 */
const INTRO='intro:fairy-compass';let intro=null;
if(!G.state.flags[INTRO]&&!G.state.flags['meet:'+FAIRY_WORLD.world+':boatman']&&st.phase==='arrive'){let t=0,line=null;const glow=G.fx.particles({parent:root,n:14,box:[.08,.05,.08],vel:[0,.35,0],sway:.15,color:'#fff0b0',size:.07,life:[.5,1],additive:true,rate:0,seed:79});glow.points.visible=false;
  intro={tick(dt){const W=WL();if(!W)return;t+=dt;
      if(t>1.2&&!line&&!G.core.blocking()&&G.state.flags.compass&&W.userData.charm&&W.userData.charm.g.visible){G.state.setFlag(INTRO,true);const P=new THREE.Vector3();bmG.getWorldPosition(P);
        W.userData.charmPoint={x:P.x,z:P.z,sec:3.2};G.sound.sfx('chime');
        W.userData.charm.g.getWorldPosition(P);glow.points.visible=true;glow.burst(14,P);
        line=G.fx.guide({parent:root,from:[W.position.x,W.position.z],to:[bmG.position.x,bmG.position.z],sec:2.8});G.ui.hint(line.points);
        G.dialog.say('원더룹','개미굴에서 받은 나침반이 어딘가를 가리키고 있어!',2.8);t=0;}
      if(line){if(glow.points.visible){glow.update(dt,null);if(t>1.4)glow.points.visible=false;}if(!line.tick(dt)&&!glow.points.visible)intro.end();}},
    end(){if(line)line.end();glow.dispose();intro=null;}};}
/* 노 젓기: 노를 물에 넣고(배 옆 바깥) 뒤로 당긴 뒤 들어 앞으로 — 되풀이. 노 끝이 물에 닿아 있는 동안 작은 물결이 퍼진다 */
let rower=null,ripT=0;const _gs=new THREE.Vector2();const _blade=new THREE.Vector3();
function row(dt,t){const bm=rower;bm.tick(dt,t);const p=t*2.4,s2=Math.sin(p),dip=Math.max(0,Math.cos(p)),arm=bm.arms[1],oar=bm.root.userData.oar;
  arm.rotation.set(-.85*s2,0,1.05-.32*(1-dip));oar.rotation.set(.3,0,-.42+.1*dip);oar.scale.set(1,1.5,1); // 당길 때(dip) 팔을 내려 노 끝이 배 옆 바깥 물에 잠기고, 앞으로 돌아갈 때는 들어 올린다(배에서는 긴 노)
  bm.arms[0].rotation.set(-.3-.25*s2,0,-.55);
  oar.localToWorld(_blade.set(0,-.78,0));ripT-=dt;if(_blade.y<-.08&&ripT<=0){ripT=.28;ripple(_blade.x,_blade.z);}}
const RIPS=[...Array(6)].map(()=>{const m=new THREE.Mesh(new THREE.RingGeometry(.07,.1,20).rotateX(-PI/2),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,depthWrite:false}));m.visible=false;m.userData.t=1;root.add(m);keep.push(m);return m;});
function ripple(x,z){const m=RIPS.find(r=>r.userData.t>=1)||RIPS[0];m.position.set(x,-.085,z);m.userData.t=0;m.visible=true;}
function tickRipples(dt){for(const m of RIPS){if(m.userData.t>=1)continue;const u=m.userData.t=Math.min(1,m.userData.t+dt/.9);m.scale.setScalar(1+u*3.2);m.material.opacity=.7*(1-u);m.visible=u<1;}}
let wl=null;const WL=()=>wl||(wl=root.parent&&(()=>{let w=null;root.parent.traverse(o=>{if(!w&&o.userData&&o.userData.vert)w=o;});return w;})());
const _bo=new THREE.Object3D(),_c=new THREE.Vector3(),_d=new THREE.Vector3(),_p=new THREE.Vector3();
function bendGrass(dt){const cam=G.view.camera,W=WL();if(!cam||!W)return;_c.copy(cam.position);_d.set(W.position.x,W.position.y+.75,W.position.z).sub(_c);const len=_d.length();if(len<.1)return;_d.divideScalar(len);
  for(const b of BEND){let hit=Math.hypot(b.x-_c.x,b.z-_c.z)<2.2+b.s;for(let j=0;j<3&&!hit;j++){_p.set(b.x,b.h*(.3+j*.3),b.z);const t=_p.clone().sub(_c).dot(_d);if(t>-.5&&t<len-.4)hit=_c.clone().addScaledVector(_d,t).distanceTo(_p)<1.6*b.s+.4;}
    const k=b.k+((hit?1:0)-b.k)*Math.min(1,dt*6);if(Math.abs(k-b.k)<1e-4&&k<.001)continue;b.k=k<.001?0:k;
    _bo.position.set(b.x,0,b.z);_bo.rotation.set(0,b.ry,0);_bo.scale.set(b.s*(1-.7*k),b.s*b.sy*(1-.97*k),b.s*(1-.7*k));_bo.updateMatrix();b.cr.part(0).setMatrixAt(b.i,_bo.matrix);b.cr.part(0).instanceMatrix.needsUpdate=true;}} // 땅으로 웅크린다(옆으로 넓히면 납작한 흰 판처럼 보였다)
/* '부품마다 흐려지는 한 덩어리'(fadeMerge, 2026-11-02 — 둘레 벽·꽃지붕 집처럼 아주 큰 것도 흐려지게, 드로우콜은 늘리지 않고):
   부품(벽 조각·집 한 채)마다 번호를 정점에 적고 붓결 두 가지(잎·꽃잎)로 나눠 한 덩어리씩 합친다. 셰이더가 번호로 불투명도 표(wlFade)를 읽어
   불투명한 덩어리에서는 흐려지는 부품을 버리고, 같은 모양의 반투명 덩어리(흐려지는 부품이 있을 때만 그림)가 그 부품만 흐리게 그린다.
   가림 판정은 game/occlude가 부품 상자마다(set 콜백) — 카메라와 원더룹 사이 0.3, 카메라 바로 앞이면 완전히 숨김 */
function fadeMerge(pieces){const N=pieces.length,fade={value:new Float32Array(64).fill(1)},B={leaf:[],petal:[]},M4=new THREE.Matrix4();
  RT.updateMatrixWorld(true);const IM=new THREE.Matrix4(),WM=new THREE.Matrix4(),IC=new THREE.Color(); // 합치기 전에 모든 물체의 월드 행렬을 맞춘다(안 맞추면 소품이 원점에 쌓인다)
  pieces.forEach((p,i)=>{const boxes=[],gone=[],list=[];if(p.g){p.g.updateMatrixWorld(true);p.g.traverse(m=>{if(m.isMesh&&!(p.skip&&p.skip(m)))list.push(m);});}else list.push(...p.meshes);
    for(const m of list){if(!p.fixed)boxes.push(new THREE.Box3().setFromObject(m));gone.push(m);const n0=m.isInstancedMesh?m.count:1;
      for(let j=0;j<n0;j++){if(m.isInstancedMesh){m.getMatrixAt(j,IM);WM.multiplyMatrices(m.matrixWorld,IM);if(m.instanceColor)m.getColorAt(j,IC);else IC.setRGB(1,1,1);}else{WM.copy(m.matrixWorld);IC.setRGB(1,1,1);}
      const q=(m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone());for(const a of Object.keys(q.attributes))if(!['position','normal','uv'].includes(a))q.deleteAttribute(a);q.clearGroups();
      q.applyMatrix4(WM);buryBase(q);const n=q.attributes.position.count,c=p.g?stemTint(m,p.g):m.material.color,col=new Float32Array(n*3),pc=new Float32Array(n).fill(p.fixed?63:i);for(let k=0;k<n;k++)col.set([c.r*IC.r,c.g*IC.g,c.b*IC.b],k*3);
      q.setAttribute('color',new THREE.BufferAttribute(col,3));q.setAttribute('wlPiece',new THREE.BufferAttribute(pc,1));const bk=m.material.map===TX.leaf?'leaf':'petal';B[bk].push(q);(p.rng=p.rng||{})[bk]=(p.rng[bk]||0)+n;}}
    gone.forEach(m=>{m.parent.remove(m);if(!m.isInstancedMesh)m.geometry.dispose();});p.boxes=boxes;});
  const patch=(mt,T)=>{mt.onBeforeCompile=sh=>{sh.uniforms.wlFade=fade;
      sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float wlPiece;uniform float wlFade[64];varying float vFade;').replace('#include <begin_vertex>','#include <begin_vertex>\nvFade=wlFade[int(wlPiece+.5)];');
      sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vFade;').replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\n'+(T?'if(vFade>=.98)discard;':'if(vFade<.98)discard;'))
        .replace('#include <dithering_fragment>','#include <dithering_fragment>\n'+(T?'gl_FragColor.a*=vFade;':''));};mt.customProgramCacheKey=()=>'wlfade'+(T?1:0);return mt;};
  let root=null;
  for(const k of ['leaf','petal']){if(!B[k].length)continue;const geo=mergeGeometries(B[k]);B[k].forEach(q=>q.dispose());
    const mo=patch(toon('#ffffff',{map:TX[k],vertexColors:true,side:THREE.DoubleSide}),false),mt=patch(toon('#ffffff',{map:TX[k],vertexColors:true,side:THREE.DoubleSide,opacity:1}),true);
    const o=new THREE.Mesh(geo,mo);o.frustumCulled=false;o.castShadow=!MOB;o.receiveShadow=true;root=root||o;RT.add(o);keep.push(o);
    let at=0;pieces.forEach(p=>{const n=(p.rng&&p.rng[k])||0;if(n&&!p.fixed){ // 반투명 덩어리는 부품마다(같은 정점 버퍼의 그 부품 구간만) — 흐려지는 부품만 그린다
      const gv=new THREE.BufferGeometry();for(const a in geo.attributes)gv.setAttribute(a,geo.attributes[a]);gv.setDrawRange(at,n);gv.boundingSphere=new THREE.Sphere();p.boxes.reduce((b,x)=>b.union(x),new THREE.Box3()).getBoundingSphere(gv.boundingSphere);
      const t=new THREE.Mesh(gv,mt);t.visible=false;t.renderOrder=2;RT.add(t);keep.push(t);t.userData.pre=G.occlude.prepass(t);(p.trans=p.trans||[]).push(t);}at+=n;});} // 깊이만 먼저(game/occlude prepass — 부품 안에서 겹친 면이 진한 막이 되지 않게)
  pieces.forEach((p,i)=>!p.fixed&&G.occlude.add(root,1,1,{near:true,speed:6,boxes:p.boxes,set:(k,f,a)=>{fade.value[i]=a;(p.trans||[]).forEach(t=>{t.visible=a<.98&&a>.03;t.userData.pre.visible=t.visible;});if(p.onFade)p.onFade(a);}}));
  return {tick(){}};}
const RT=root;
/* 같은 두 붓결(잎·꽃잎)을 쓰는 다른 고정 소품·무리도 같은 덩어리에(흐려지지 않는 칸 63) — 03 색 접기가 따로 만들던 두 덩어리를 줄인다 */
const statics=()=>{const keepSet=new Set();keep.forEach(k=>k.traverse(o=>keepSet.add(o)));FADEP.forEach(p=>p.g.traverse(o=>keepSet.add(o)));const out=[];
  root.traverse(o=>{if(!o.isMesh||keepSet.has(o)||o.userData.noMerge)return;const t=o.material;if(!t||!t.isMeshToonMaterial||t.transparent||t.vertexColors||(t.emissive&&t.emissive.getHex()))return;
    if(t.map===TX.leaf||t.map===TX.petal)out.push(o);});return out;};
const faded=FADEP.length?fadeMerge([...FADEP,{meshes:statics(),fixed:true}]):null;
/* ---------- 매 프레임 ---------- */
const SK=G.sky.sky({parent:root,keys:FAIRY_SKY,t:0,starSize:4}); // 잎 사이로 별이 또렷하게(3 → 4화소)
const _wc=new THREE.Color(),_we=new THREE.Color();
function update(dt,t){
  boatman.tick(dt,t);shroom.tick(dt,t);tick.forEach(f=>f.tick(dt,t));
  boatman.wave(st.phase==='arrive'||st.phase==='boat');
  if(small.visible){bmG.position.y=-.04+Math.sin(t*1.4)*.025;bmG.rotation.z=Math.sin(t*1.1)*.03;}else{bmG.position.y=-.1;bmG.rotation.z=0;} // 땅에 내려서면 흔들리지 않게
  if(st.phase!=='riding'){boat.position.y=-.06+Math.sin(t*1.2+1)*.02;boat.rotation.z=Math.sin(t*.9)*.02;}
  pads.forEach((p,i)=>p.position.y=-.08+Math.sin(t*.8+i)*.01);lboats.forEach((b,i)=>{b.position.y=-.08+Math.sin(t*1.1+i)*.02;b.rotation.z=Math.sin(t*.9+i)*.04;});
  floaters.forEach(b=>{b.position.y=b.children[0].geometry.parameters.radius+.05+Math.sin(t*1.3+b.userData.ph)*.06;});
  TX.ripple.offset.set((t*.018)%1,(t*.006)%1); // 물이 천천히 흐른다
  // 클로버: 돌리는 동안(원더룹 손 동작 1.5초) 천천히 바로 놓이고, 끝나면 살짝 출렁
  {const W=WL();CLOVERS.forEach(c=>{if(c.u>=0&&c.u<1){c.u=Math.min(1,c.u+dt/1.5);const k=c.u*c.u*(3-2*c.u);c.spin.rotation.y=c.from+(c.to-c.from)*k;c.spin.rotation.z=c.tz*(1-k);}
    c.g.position.y=-.06+Math.sin(t*1.5+c.x)*.012;
    const live=st.phase==='clovers'&&!c.done&&c.u<0,near=live&&W&&Math.hypot(W.position.x-c.x,W.position.z-c.g.position.z)<2.6; // 가까이 가면 조금 더 크게(손 상호작용 '돌리기' 단추도 이때 뜬다)
    c.sway+=((live?(near?1:.45):0)-c.sway)*Math.min(1,dt*3);c.g.rotation.set(Math.sin(t*2.3+c.x)*.09*c.sway,Math.sin(t*1.7+c.x*2)*.12*c.sway,Math.sin(t*2.9+c.x)*.07*c.sway);
    c.glint.points.visible=live;if(live)c.glint.update(dt,null);});}
  // 큰 이슬방울이 물길을 따라 굴러와 이슬배에 퐁 들어감
  if(drop){drop.t+=dt;const T2=3.2,u=Math.min(1,drop.t/T2),x=-14+(BOAT0[0]+14)*u,z=cz(x)-.3+(BOAT0[2]-(cz(BOAT0[0])-.3))*u*u;
    bigDrop.position.set(x,.5+Math.abs(Math.sin(u*PI*3))*.25*(1-u),z);bigDrop.rotation.z=-x*1.8;
    if(u>=1){dropCam=.8;bigDrop.visible=false;drop=null;boatReady=true;st.phase='boat';boatDew.visible=true;dewPop=0;splash.burst(36,{x:BOAT0[0],y:.35,z:BOAT0[2]});splashT=1.4;G.sound.sfx('pop');q('이슬배를 타고 강을 건너요');
      G.ui.notice({kicker:'알림',title:'이슬배가 준비됐어요!',text:'이슬방울이 배 안으로 쏙 들어갔어요. 이제 이슬배를 타고 강을 건너요.'});}} // 아무 키(Enter)·화면 아무 곳 누르기로 닫힘(ui.notice)
  // 우산을 펴고 활공하기 시작하면 안내 문구와 아이템 카드를 치운다(할 일을 해냈으니까)
  if(hasUmb()&&!st.glided){const W=WL();if(W&&W.userData.vert.air&&W.userData.vert.vy<-.3&&W.userData.vert.glide>.05){st.glided=true;q('');G.ui.closeItemCard();}} // 우산이 펴지기 시작할 때(배에서 둑으로 내려설 때의 작은 낙하는 빼고) // 우산이 펴지기 직전(떨어지기 시작할 때) 치워 펴지는 순간에는 카드가 없다
  // 스테이지 완료: 우산을 펼쳐(활공) 처음 땅에 내려앉으면 한 번 — 짧은 안내, 저장(flags)
  if(intro)intro.tick(dt);
  goalTick();secretTick(t);tickVillagers(dt,t);
  if(cheerT>0){cheerT-=dt;cheer.points.visible=cheerT>0;cheer.update(dt,null);}
  if(!umb&&hasUmb())syncUmbrella(); // 처음 열 때(WL이 장면에 붙은 뒤) 이미 가진 우산 모양을 단다
  // 시간(0 낮 · 1 해 질 녘 · 2 밤): 물 색, 햇빛 얼룩, 버섯등(등마다 켜지는 때가 다름), 꽃·반딧불
  const k=SK.t,i0=Math.min(1,Math.floor(k)),u0=k-i0,day=1-ss(0,1,k),nite=ss(1,2,k);
  _wc.copy(WC[i0].c).lerp(WC[i0+1].c,u0);_we.copy(WC[i0].e).lerp(WC[i0+1].e,u0);waterMat.color.copy(_wc);waterMat.emissive.copy(_we);waterMat.emissiveIntensity=WC[i0].ei+(WC[i0+1].ei-WC[i0].ei)*u0;
  dapple.material.opacity=.3*day;dapple.visible=day>.01;
  // 장면 전체 따뜻한 주변광은 밤에 줄인다(초록이 올리브빛으로 탁해졌다) — 따뜻한 빛은 등 아래 웅덩이·물에 비친 불빛이
  const W=WL();if(W)L.light(W.position,{light:1.15*ss(1,1.8,k),glow:1,pool:1,ambient:1-.65*nite,dt});
  NIGHT.value=nite;
  {const C=pools.geometry.attributes.color;let at=0,any=false;for(const p of POOLS){const a=p.op*ss(p.th,p.th+.18,k)*(.35+.65*nite);any=any||a>.005;for(let i=0;i<p.n;i++)C.array[(at+i)*4+3]=a;at+=p.n;}C.needsUpdate=true;pools.visible=any;}
  {const C=refl.geometry.attributes.color,per=C.count/REFL.length;let any=false;REFL.forEach(([,,,w,th],j)=>{const a=w*ss(th,th+.25,k)*(.3+.7*nite);any=any||a>.005;for(let i=0;i<per;i++){const q=(j*per+i)*4;C.array[q]=1;C.array[q+1]=.9;C.array[q+2]=.7;C.array[q+3]=a*(1-.85*Math.floor(i/2)/6);}});
   C.needsUpdate=true;refl.visible=any;refl.material.map.offset.y=(t*.07)%1;}
  glints.U.uT.value=t;glints.U.uOp.value=nite;glints.p.visible=nite>.02;
  LAMPS.forEach(o=>{const on=ss(o.th,o.th+.18,k);o.m.emissiveIntensity=.2+on*1.1+nite*.3;if(o.lp){if(o.lp.glow){o.lp.glow.material.opacity=o.lp.glowOp*on;o.lp.glow.visible=on>.01;}
    if(o.lp.pool){o.lp.pool.material.opacity=o.lp.poolOp*on*(.4+.6*nite);o.lp.pool.visible=on>.01;}}});
  winMats.forEach((m,i)=>m.emissiveIntensity=.4+ss(.8+i*.15,1.1+i*.15,k)*1.2);
  flowerMats.forEach(m=>m.emissiveIntensity=.22*nite);
  flies.points.material.opacity=nite;flies.points.visible=nite>.01&&qLevel<1;pollen.points.material.opacity=1-.6*nite;
  // 휴대폰 단계: 꽃가루·반딧불·풀 숙이기는 두 프레임에 한 번(30프레임이라 초당 15번), 자동 화질 1단계부터 공중 입자 끔
  slow+=dt;const go=!MOB||(++fno&1)===0;
  if(W&&go&&qLevel<1){pollen.update(slow,W.position);if(nite>.01)flies.update(slow,W.position);}
  if(go){bendGrass(slow);slow=0;}
  forest.update(G.view.camera,SK);splashT=Math.max(0,splashT-dt);splash.points.visible=splashT>0;if(splashT>0)splash.update(dt);
  if(boatDew.visible){dewPop=Math.min(1,dewPop+dt*3);const k=dewPop<1?1+Math.sin(dewPop*PI)*.35:1;boatDew.scale.setScalar(k*(1+Math.sin(t*2.2)*.03));const h=boatDew.children[1];h.scale.set(1+Math.sin(t*3.1)*.25,.6,.4);hiMat.opacity=.6+.4*Math.max(0,Math.sin(t*2.7));} // 퐁 들어오고 반짝반짝
  if(rower)row(dt,t);tickRipples(dt);if(faded)faded.tick();
  boatGlint.points.visible=st.phase==='boat';if(st.phase==='boat')boatGlint.update(dt,null);
  if(dropCam>0){dropCam-=dt;if(dropCam<=0){dropCam=0;G.view.hold(null);}}
  if(umb){const W=WL(),k=W?W.userData.vert.glide:0;umb.userData.sway(t,.25+.75*k);}}
/* 목표 안내(game/goal — 빛 기둥·이름표·발밑 동그라미 길·할 일 화살표, 2026-11-03): 지금 할 일의 자리. 연출(물길·이슬배 타기·우산 받기) 동안은 숨김 */
let goalKey='';
function goalTick(){const W=WL();let g=null;
  // 빛 기둥·이름표는 미션 목적지에만(2026-11-03): 마을 주민과 이야기하기·클로버(살랑이는 반짝임이 대신)에는 넣지 않는다
  if(st.phase==='arrive'&&talkedN>=2)g={key:'boatman',at:()=>[bmG.position.x,bmG.position.z],label:'사공 요정',h:2.2};
  else if(st.phase==='boat')g={key:'boat',at:BOARD,y:DOCK.top,label:'이슬배 타기',h:2.4};
  const k=g?g.key:'';if(k!==goalKey){goalKey=k;G.goal.set(g);}}
let slow=0,fno=0,qLevel=0,splashT=0,dewPop=1; // splashT: 물보라가 남아 있는 동안만 그린다
function quality(L){qLevel=L;pollen.points.visible=L<1;if(L>=1)flies.points.visible=false;forest.setLevel(L);} // 08 자동 화질 조절
return {...FAIRY_WORLD,
  name:'이슬방울 선착장',kind:'outdoor',music:'fairy-dock',
  sky:SK,mergeColors:MOB, // 휴대폰: 움직이지 않는 소품·무리를 텍스처마다 한 덩어리로(03 색 접기)
  // 활공은 구역 정보 glide 없이 아이템으로(민들레 솜털 우산을 가졌을 때 — 07, game/items canGlide)
  spawn:hasUmb()?{x:-6.6,z:-8.6,ry:PI}:{x:.2,z:8.6,ry:PI}, // 우산을 이미 받았으면 건너편(이슬배에서 내린 자리)에서 // 길 입구 조금 안쪽 — 숲 방(camRoom) 가장자리면 휴대폰 카메라가 원더룹에 바짝 붙는다
  titleView:{from:[-1.5,2.6,-5.1],r:9,y:.7,speed:.05,a0:.15},
  storyView:[{from:[0,4.3,13.5],at:[1.5,.6,-4.5]},{from:[-9,3,7],at:[-1,.8,0]},{from:[-2,2.8,-4.5],at:[5,.5,-2.5]}], // 이야기 소개 카메라: 마을 전체 → 마을 길 → 선착장(game/front) — 잎 지붕(5~6.5m) 아래에서(위에서 내려다보면 잎만 보였다) // 게임 첫 화면 뒤 배경: 선착장 둘레를 천천히 도는 카메라(game/front)
  camRoom:{c:[-.5,0],r:MOB?15:19.5}, // 따라가기 카메라가 머무는 방 — 휴대폰은 둘레 벽(합쳐 그린 큰 잎, 흐려지지 않음, 14m부터) 언저리까지(더 줄이면 세로 화면 카메라가 원더룹에 바짝 붙는다), 컴퓨터는 흐려 보기가 있어 벽 바깥까지
  platforms:[{r:[DOCK.x0,DOCK.x1,DOCK.z0,DOCK.z1],top:DOCK.top},...ROCKS],
  walkLinks:[[-6.8,zN(-6.8)-.35]], // 이슬배에서 내리는 자리(끼임 자동 시험이 건너편 마을도 걸어서 닿는 곳으로 본다)
  areas:{dock:{bounds:[-15,14,-15,14],obstacles,
    camera:{target:[0,1,0],dist:24,polar:[.45,1.3],azimuth:null,start:[1,.5],minDist:3,maxDist:44}}},
  doors:[{rect:[-1.2,1.2,-15,-14],to:'fairy-dandelion'}], // 다음 스테이지(아직 없음 → 저절로 닫혀 있음)
  sun:{dir:new THREE.Vector3(6,-11,5).normalize(),shadow:10,follow:true},
  lights:L.all,keepOut:keep,update,quality,
  test:{ // 확인 촬영용 지름길(대화를 건너뛰고 그 장면으로) — 게임에서는 쓰지 않는다
    mission(){st.phase='arrive';afterBoatman();},
    channel(){fixed=3;CLOVERS.forEach(c=>{c.done=true;c.u=1;c.spin.rotation.set(0,0,0);});openChannel();},
    ride(){fixed=3;st.phase='boat';boatReady=true;boatDew.visible=true;startRide();},
    umbrella(){st.phase='done';G.items.give('umbrella');syncUmbrella();}},
  dispose(){offUmb();if(intro)intro.end();cheer.dispose();const U=WL()&&WL().userData;if(U&&U.setGlideProp)U.setGlideProp(null);CLOVERS.forEach(c=>c.glint.dispose());boatGlint.dispose();splash.dispose();pollen.dispose();flies.dispose();L.dispose();forest.dispose();clearPaintCache();clearFairyCache();}, // 텍스처·재질 캐시까지 비운다(휴대폰 스테이지당 예산 — 다음 스테이지로 넘어가면 이 스테이지 것은 메모리에 남지 않게)
};
}
