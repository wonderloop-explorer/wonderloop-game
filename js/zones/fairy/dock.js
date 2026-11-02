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
import {PI,QUALITY,add,blob,boxAt,cylAt,group,lathe,pencil,rng,shadowBlob} from '../../01-textures.js';
import * as G from '../../game/index.js';
import {FAIRY_CARDS,FAIRY_SKY,FAIRY_WORLD,WATER,icon} from './world.js';
import {bakeFairy,clearFairyCache,dandelionPuff,fairy,leafBoat as boatLeaf} from './fairies.js';
import {clearPaintCache,fbm,painted,toon} from './paint.js';
import {deepForest} from './forest.js';
export function build({root}){
const R=rng('fairy-dock:props'),rnd=(a,b)=>a+(b-a)*R();
const SIZE=48,keep=[],obstacles=[],tick=[],flat=[];
const MOB=!QUALITY.shadows; // 휴대폰 단계 // flat: 발밑 높이의 판(땅·물·길·선착장) — 뚫어 보기에서 뺀다
const ss=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x);};
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
/* ---------- 땅: 한 장(96칸) — 물길 자리는 잡음 섞인 둑으로 깎고, 정점 색으로 이끼·흙 얼룩 ---------- */
const inWater=(x,z)=>Math.min(z-zN(x),zS(x)-z)+(fbm(x*.9+11,z*.9+3)-.5)*.7; // + 안쪽(물), 둑이 울퉁불퉁
{const N=96,g=new THREE.PlaneGeometry(SIZE,SIZE,N,N).rotateX(-PI/2),P=g.attributes.position,col=new Float32Array(P.count*3);
 const C=h=>new THREE.Color(h),moss=C('#a8cf73'),light=C('#d3e49e'),deep=C('#8dbd60'),soil=C('#e3c58f'),bank=C('#b58b5f'),wet=C('#8f8a62'),tmp=new THREE.Color();
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
const water=new THREE.Mesh(new THREE.PlaneGeometry(SIZE,13,1,1).rotateX(-PI/2),waterMat);water.position.set(0,-.1,-5.2);water.receiveShadow=true;root.add(water);keep.push(water);flat.push(water);
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
const cloverMat=T('#86ba58','leaf'),cloverDk=T('#6fa646','leaf'),stemMat=T('#7fac52','leaf');
/* 동선 가까이 큰 풀·꽃: 카메라와 원더룹 사이에 오면 흐려진다.
   컴퓨터: 흐려 보기(game/occlude cut — 구역 전체에 한 번에, 재질을 같이 쓰고 병합된다).
   휴대폰(2026-11-02): 덧그리기 없이 그 물체 전체를 0.3 투명도로 0.2초에 걸쳐 흐림(game/occlude add — 재질을 물체마다 따로, 병합하지 않음). 카메라 바로 옆에 걸린 것도 */
const occ=(g,r,h)=>{if(!MOB)return;keep.push(g);G.occlude.add(g,r,h,{near:true,speed:6,boxes:bakeGroup(g)});};
/* 휴대폰: 흐려지는 물체 하나(줄기·잎·꽃잎 여러 부품)를 텍스처마다 한 덩어리로 합친다 — 색은 정점 색, 재질은 이 물체 전용(흐릴 때 다른 물체가 같이 흐려지지 않게).
   부품마다 상자(월드 좌표)를 돌려준다 → occlude가 카메라~원더룹 시선이 상자를 지나는지로 가림을 본다(여러 겹이어도 하나하나 따로) */
function bakeGroup(g){g.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(g.matrixWorld).invert(),B=new Map(),boxes=[],old=[],M4=new THREE.Matrix4();
  let big=null,bn=-1;g.traverse(m=>{if(m.isMesh&&m.geometry.attributes.position.count>bn){bn=m.geometry.attributes.position.count;big=m.material;}});
  g.traverse(m=>{if(!m.isMesh)return;old.push(m);const P=m.geometry.parameters;
    if(P&&P.path){const n=8;for(let j=0;j<n;j++){const b=new THREE.Box3();for(let q=0;q<=2;q++)b.expandByPoint(P.path.getPointAt((j+q/2)/n).applyMatrix4(m.matrixWorld));boxes.push(b.expandByScalar(P.radius));}} // 휜 줄기: 상자 하나면 빈 곳까지 덮으니 마디마다
    else boxes.push(new THREE.Box3().setFromObject(m));if(!B.has('all'))B.set('all',[]);B.get('all').push(m);}); // 텍스처가 달라도(줄기·꽃잎·꽃술) 가장 큰 부품의 붓결 하나로 — 모두 흰 바탕 붓결이라 휴대폰 크기에서는 차이가 안 보이고 그리기는 한 번

  B.forEach(list=>{const geos=list.map(m=>{const gg=(m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone());for(const a of Object.keys(gg.attributes))if(!['position','normal','uv'].includes(a))gg.deleteAttribute(a);gg.clearGroups();
      gg.applyMatrix4(M4.multiplyMatrices(inv,m.matrixWorld));const c=m.material.color,n=gg.attributes.position.count,col=new Float32Array(n*3);for(let i=0;i<n;i++)col.set([c.r,c.g,c.b],i*3);gg.setAttribute('color',new THREE.BufferAttribute(col,3));return gg;});
    const mt=big.clone();mt.color.setRGB(1,1,1);mt.vertexColors=true;mt.side=list.some(m=>m.material.side===THREE.DoubleSide)?THREE.DoubleSide:big.side;const mm=new THREE.Mesh(mergeGeometries(geos),mt);mm.castShadow=list.some(m=>m.castShadow);g.add(mm);geos.forEach(x=>x.dispose());});
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
function tallGrass(list,seed,h0,h1,bend){const cr=G.fx.crowd({parent:root,n:list.length,parts:[{geo:bladeClump(5,h0,h1,seed),mat:grassMat}]});
  const cols=['#93c562','#a9d06e','#7fb553','#b5d67c'];list.forEach(([x,z,s],i)=>{const ry=rnd(0,PI*2),sc=s||rnd(.8,1.2);cr.set(i,x,0,z,ry,sc);cr.color(0,i,cols[(i+seed.length)%4]);
    if(bend)BEND.push({cr,i,x,z,ry,s:sc,h:h1*sc,k:0});});if(bend)keep.push(cr.group);return cr;} // 고개 숙이는 무리는 병합(휴대폰 색 접기)에서 빼기
/* 휴대폰 카메라 막이(구역 정보 camBlock — 08 따라가기 카메라가 이 공들 앞에서 팔을 멈춘다): 둘레 벽은 한 덩어리로 합쳐 그려 흐려지지 않으니,
   카메라가 벽의 꽃머리·잎 속으로 들어가 화면이 한 색으로 덮이지 않게(2026-11-02). 부품마다 상자를 감싸는 공 하나 */
const camBlock=[];
function camBlockOf(g){g.updateMatrixWorld(true);g.traverse(m=>{if(!m.isMesh)return;const b=new THREE.Box3().setFromObject(m),c=b.getCenter(new THREE.Vector3()),sz=b.getSize(new THREE.Vector3());
  if(sz.y>2.5&&sz.x<1&&sz.z<1)return; // 가는 줄기는 빼기(카메라를 너무 자주 당긴다)
  camBlock.push([c.x,c.y,c.z,Math.max(sz.x,sz.y,sz.z)*.5]);});}
/* ---------- 둘레 벽: 13~19m에 키 큰 클로버·데이지·풀잎·줄기 (먼 들판·지평선을 가리고, 별꽃 전망대만 북쪽 틈으로) ---------- */
{const wall=[];for(let i=0;i<34;i++){const a=i/34*PI*2+rnd(-.05,.05),rx=rnd(14,17.5),rz=rnd(14.5,18),x=-.5+Math.cos(a)*rx,z=Math.sin(a)*rz;
   if(Math.abs(x)<2.6&&z<-12)continue; // 북쪽 틈: 꽃봉오리가 잎 사이로
   const k=i%4;let piece;if(k===0)piece=giantClover(x,z,rnd(5,8),rnd(2.2,3),rnd(0,PI*2),{noObs:true});else if(k===1)piece=daisy(x,z,rnd(5.5,8),rnd(1.6,2.2),i%8===1?'#f9d4dc':'#fbf3e6');
   else if(k===2){const g=group(x,0,z,a+PI/2);const L=leafHeart(rnd(4,5.5),T('#86bb5a','leaf'));L.rotation.set(-PI/2+rnd(1.2,1.45),0,0);g.add(L);L.castShadow=true;piece=g;}
   else piece=bell(x,z,rnd(4.5,6.5),rnd(1.6,2),i%8===3?'#f2b6c6':'#bda4e6');
   if(MOB)camBlockOf(piece);
   wall.push([x*.92,z*.92,rnd(1.6,2.4)]);}
 tallGrass(wall,'wall',2.5,4.5,true);}
// 벽 뒤 깊은 숲: 실루엣 판 네 겹 + 머리 위 큰 잎 + 빛줄기 (forest.js) — 북쪽은 꽃봉오리가 보이게 비운다
const forest=deepForest({root,cx:-.5,cz:0,gaps:[Math.atan2(-30,.5)]});
// 멀리 북쪽 언덕 위 커다란 분홍 꽃봉오리(별꽃 전망대 — 이야기의 목적지가 잎 틈으로 보이게)
{const g=group(0,0,-30,0);add(new THREE.SphereGeometry(6,16,8,0,PI*2,0,PI/2),T('#a9c56f','leaf'),0,-1.5,0,{parent:g,line:false,cast:false,s:[1.6,.55,1]});
 for(let k=0;k<6;k++){const p=add(lathe([[0,0],[.9,.4],[1.3,1.6],[1.1,3],[.6,4],[0,4.6]].map(q=>new THREE.Vector2(q[0],q[1])),10),T('#f2a5b4','petal'),0,1.5,0,{parent:g,line:false,cast:false});p.scale.set(1,1,.45);p.rotation.set(-.32,k/6*PI*2,0,'YXZ');p.position.set(Math.sin(k/6*PI*2)*.9,1.5,Math.cos(k/6*PI*2)*.9);}
 for(let k=0;k<6;k++){const l=add(lathe([[0,0],[.5,.3],[.6,1],[.3,1.9],[0,2.3]].map(q=>new THREE.Vector2(q[0],q[1])),7),T('#86b058','leaf'),0,1.2,0,{parent:g,line:false,cast:false});l.scale.set(1,1,.35);l.rotation.set(-.9,k/6*PI*2+.5,0,'YXZ');l.position.set(Math.sin(k/6*PI*2+.5)*1.8,1.1,Math.cos(k/6*PI*2+.5)*1.8);}}
/* ---------- 동선 가까이: 원더룹보다 2~5배 큰 클로버·꽃줄기·풀잎 ---------- */
[[-3.4,9.6,3.2,1.5,.4],[3.6,8.6,2.6,1.3,2],[-4.6,4.4,3.8,1.7,1.1],[6.6,5.6,3.4,1.6,.2],[-2.6,1.6,2.8,1.3,2.4],[8.2,1.2,4.2,1.9,1],[-11.5,.4,4,1.8,.7],[10.6,-.6,3.6,1.6,2.2],
 [-10.6,-10.4,3.4,1.6,.8],[9.4,-11.6,4,1.8,2.4],[2.6,-12.4,4.4,2,1.5],[-5.2,-13,3.6,1.7,0],[-13.2,-8.6,4.2,2,1.2]].forEach(a=>giantClover(...a,{lean:.3,occ:true}));
const OC={occ:true};daisy(-6.6,8.4,4.2,1.3,undefined,OC);daisy(5.6,10.8,3.6,1.15,'#f9d4dc',OC);daisy(-9.2,3.6,4.6,1.4,undefined,OC);daisy(11,-9.4,5,1.5,undefined,OC);
bell(-2.4,6.4,2.6,1.05,undefined,OC);bell(7.4,-.2,3,1.15,'#f2b6c6',OC);bell(-8.6,-1,2.8,1.1,undefined,OC);bell(-12,-12.6,3.2,1.2,'#f2b6c6',OC);
tallGrass([[-1.9,12.6],[2.3,12.2],[-2.9,8],[3.3,6.6],[-1.6,4.6],[5.4,4],[1.2,2.6],[6.6,2],[-5.6,-.6,1.1],[-8.2,-.8],[-13,-.4],[1.6,-.7,.8],[7.8,-1.6],[-11.4,-9.4],[-4.2,-9.8],[1.2,-9.6],[7.4,-9],[-9.4,-12.6],[4.4,-12.8],[-6.8,6.6],[7.6,8.8]].map(([x,z,s])=>[x,z,s||rnd(.75,1.15)]),'near',1.8,3.4,true);
/* 머리 위 잎 지붕: 휘어진 긴 줄기 끝에 큰 잎을 거의 눕혀서(5~6.5m) — 카메라와 원더룹 사이에 오면 반투명(occlude). 휴대폰은 진짜 그림자 대신 잎 그림자 얼룩 */
const canopy=[];
[[-5.6,10.6,-1.4,8.4,5.2,3.4],[8.8,7,4.4,5,5.6,3.8],[-7.4,3.6,-3,2.6,6,4],[10.2,-2.6,6.6,-2.6,6.2,3.4],[-12.2,-12.2,-8.4,-10.4,6,3.6],[3.4,-14.6,1.2,-10.8,6.6,3.6],[-12.6,6,-9,5.6,5.4,3.2]].forEach(([bx,bz,lx,lz,h,s],i)=>{
  const c=new THREE.CatmullRomCurve3([new THREE.Vector3(bx,0,bz),new THREE.Vector3(bx+(lx-bx)*.15,h*.6,bz+(lz-bz)*.15),new THREE.Vector3(bx+(lx-bx)*.55,h*1.02,bz+(lz-bz)*.55),new THREE.Vector3(lx,h*.96,lz)]);
  const sg=group(bx,0,bz,0);add(new THREE.TubeGeometry(c,14,.16,6),stemMat,-bx,0,-bz,{line:false,parent:sg});obstacles.push({c:[bx,bz,.3]});blob(bx,bz,.5,.5,.18);
  const lg=new THREE.Group();lg.position.set(lx-bx,h*.96,lz-bz);sg.add(lg); // 줄기와 잎은 한 물체(휴대폰은 한 번에 그리고 같이 흐려짐)
  const L=new THREE.Mesh(leafGeo(s,10),T(i%2?'#8cc25e':'#7fb653','leaf'));L.castShadow=true;L.receiveShadow=true; // 컴퓨터는 병합, 휴대폰은 잎마다 따로 흐림(아래 occ)
  const yaw=Math.atan2(lx-bx,lz-bz);L.rotation.set(-PI/2+.16,yaw+PI,0,'YXZ');L.position.set(Math.sin(yaw)*s*.45,0,Math.cos(yaw)*s*.45);lg.add(L);
  canopy.push(lg);occ(sg,.6,h);shadowBlob(lx,lz,s*.55,s*.45);});
/* 잎 사이 햇빛 얼룩(낮): 바닥에 덧칠하는 부드러운 빛 조각(그리기 1회). 해 질 녘·밤에는 사라진다 */
const dapple=(()=>{const cv=document.createElement('canvas');cv.width=cv.height=256;const g=cv.getContext('2d'),r2=rng('fairy-dock:dapple');
  for(let i=0;i<16;i++){const x=30+r2()*196,y=30+r2()*196,r=10+r2()*22,gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(255,244,205,.95)');gr.addColorStop(.6,'rgba(255,236,180,.45)');gr.addColorStop(1,'rgba(255,230,170,0)');
    g.fillStyle=gr;g.beginPath();g.ellipse(x,y,r*1.3,r,r2()*PI,0,7);g.fill();}
  const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;
  const geos=[[-1.4,8.4,5],[3.6,4.8,6],[-2.6,2.4,6],[6.4,-1.4,5],[-8,-10,5],[1,-10.4,5],[-8.6,5.4,4.5]].map(([x,z,s],i)=>new THREE.PlaneGeometry(s,s).rotateX(-PI/2).rotateY(i).translate(x,.03,z));
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
const acorn=(x,z,s,ry)=>{const g=group(x,0,z,ry);add(lathe([[0,0],[.22,.03],[.3,.18],[.28,.36],[.2,.46],[0,.5]].map(q=>new THREE.Vector2(q[0]*s,q[1]*s)),10),T('#c9935c','wood'),0,0,0,{parent:g,line:false});
  add(lathe([[0,.62],[.16,.6],[.3,.5],[.33,.42],[.28,.4],[0,.42]].map(q=>new THREE.Vector2(q[0]*s,q[1]*s)),10),T('#8a6040','stone'),0,0,0,{parent:g,line:false});
  add(new THREE.CylinderGeometry(.025*s,.03*s,.12*s,5),T('#6e4c34'),0,.66*s,0,{parent:g,line:false});};
const basket=(x,z,ry,cols)=>{const g=group(x,0,z,ry);add(new THREE.CylinderGeometry(.34,.28,.28,10,1,true),T('#c89a64','wood',{side:THREE.DoubleSide}),0,.14,0,{parent:g,line:false});
  add(new THREE.CylinderGeometry(.28,.28,.02,10),T('#9a7048','wood'),0,.02,0,{parent:g,line:false});add(new THREE.TorusGeometry(.34,.03,4,12),T('#a87b4e','wood'),0,.28,0,{parent:g,line:false,rx:PI/2});
  for(let k=0;k<7;k++){const a=k/7*PI*2;add(new THREE.SphereGeometry(.1,7,5),T(cols[k%cols.length]),Math.cos(a)*.17*(k?1:0),.27+(k?0:.06),Math.sin(a)*.17*(k?1:0),{parent:g,line:false});}obstacles.push({c:[x,z,.36]});};
const spool=(x,z,ry,col)=>{const g=group(x,0,z,ry);add(new THREE.CylinderGeometry(.3,.3,.08,12),T('#d9b98a','wood'),0,.04,0,{parent:g,line:false});add(new THREE.CylinderGeometry(.24,.24,.36,12),T(col),0,.26,0,{parent:g,line:false});
  add(new THREE.CylinderGeometry(.3,.3,.08,12),T('#d9b98a','wood'),0,.48,0,{parent:g,line:false});obstacles.push({c:[x,z,.32]});};
const sack=(x,z,s,ry)=>{const g=group(x,0,z,ry);add(lathe([[0,0],[.26,.02],[.32,.2],[.28,.42],[.14,.52],[.1,.6],[.16,.68],[0,.7]].map(q=>new THREE.Vector2(q[0]*s,q[1]*s)),9),T('#e8d6b4','petal'),0,0,0,{parent:g,line:false});
  add(new THREE.TorusGeometry(.11*s,.025*s,4,10),T('#b7865a'),0,.56*s,0,{parent:g,line:false,rx:PI/2});};
const sign=(x,z,ry,col)=>{const g=group(x,0,z,ry);cylAt(.05,.06,1.1,T('#9a6a44','wood'),0,0,0,{parent:g,line:false});const L=leafHeart(.7,T(col,'leaf'));L.position.set(0,.68,.05);L.rotation.set(0,0,PI);L.scale.set(1,.7,1);g.add(L);
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
const hut=(x,z,roof,ry)=>{const g=group(x,0,z,ry);cylAt(.9,1,1.3,T('#f3e6cf','petal'),0,0,0,{parent:g,line:false});
  add(new THREE.BoxGeometry(.5,.8,.1),T('#9a6a42','wood'),0,.4,.96,{parent:g,line:false});const wm=toon('#ffd98a',{emissive:'#ffc860',ei:.4});winMats.push(wm);add(new THREE.CircleGeometry(.18,12),wm,.45,.85,.9,{parent:g,line:false,ry:.45});keep.push(g);
  for(let k=0;k<6;k++){const p=add(new THREE.SphereGeometry(.85,9,5),T(roof,'petal'),0,1.55,0,{parent:g,line:false});p.scale.set(.62,.28,1);p.position.set(Math.sin(k/6*PI*2)*.55,1.5,Math.cos(k/6*PI*2)*.55);p.rotation.set(-.55,k/6*PI*2,0,'YXZ');}
  add(new THREE.SphereGeometry(.25,8,5),T('#86b058','leaf'),0,2.05,0,{parent:g,line:false,s:[1,.6,1]});obstacles.push({c:[x,z,1.15]});blob(x,z,1.5,1.5,.25);};
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
const LAMPS=[];const lampMat=()=>{const m=toon('#fff2d2',{emissive:'#ffe2a0',ei:.2});return m;};
{const pts=[[-1.9,11.5],[-2.1,9],[-1.6,6.6],[-.4,4.4],[1.3,2.5],[2.7,.7]],pts2=[[2.1,11.5],[2.2,9],[2.7,6.8],[3.6,4.8],[4.9,2.8],[6,1]];let n=0;
 for(const P of [pts,pts2]){P.forEach(([x,z],i)=>{cylAt(.07,.08,.62,T('#8b5d3a','wood'),x,0,z,{line:false});const m=lampMat();add(new THREE.SphereGeometry(.14,10,5,0,PI*2,0,PI/2),m,x,.62,z,{line:false,cast:false});
   const lp=L.add({x,y:.75,z,reach:4.5,glow:{y:.74,size:1.1,op:.55},pool:n%2?null:{r:1.6,op:.4}});LAMPS.push({m,lp,th:.72+((n*5)%9)*.07});n++;
   if(i)add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(P[i-1][0],.45,P[i-1][1]),new THREE.Vector3((x+P[i-1][0])/2,.36,(z+P[i-1][1])/2),new THREE.Vector3(x,.45,z)]),8,.02,4),T('#e2c597'),0,0,0,{line:false,cast:false});});}}
// 선착장 등불: 갈고리 기둥에 매단 둥근 등
{cylAt(.08,.09,1.9,T('#8b5d3a','wood'),3.1,0,-1.4,{line:false});add(new THREE.BoxGeometry(.6,.07,.07),T('#8b5d3a','wood'),3.35,1.85,-1.4,{line:false});
 const m=lampMat();add(new THREE.SphereGeometry(.17,12,8),m,3.6,1.55,-1.4,{line:false,cast:false});add(new THREE.CylinderGeometry(.01,.01,.22,4),T('#6e4c34'),3.6,1.72,-1.4,{line:false,cast:false});
 const lp=L.add({x:3.6,y:1.55,z:-1.4,reach:5,glow:{y:1.55,size:1.4,op:.6},pool:{r:2,op:.4}});LAMPS.push({m,lp,th:.7});obstacles.push({c:[3.1,-1.4,.15]});}
// 들판의 작은 빛나는 버섯 (모여서 핀다)
{const ms=[[-3.6,8.6],[-3.2,8.9],[-3,8.4],[5.1,6.4],[5.4,6.1],[-6,-.2],[-5.7,.1],[8.8,-1.2],[-8,-11.4],[-7.6,-11.7],[2.2,-11.6],[2.5,-11.9]];
 const groups=[0,1,2,3].map(()=>lampMat());ms.forEach(([x,z],i)=>{const g=group(x,0,z,0),s=rnd(.8,1.4);cylAt(.035*s,.045*s,.16*s,T('#f5ecdc'),0,0,0,{parent:g,line:false,cast:false});
   add(new THREE.SphereGeometry(.1*s,8,4,0,PI*2,0,PI/2),groups[i%4],0,.15*s,0,{parent:g,line:false,cast:false});});
 groups.forEach((m,k)=>LAMPS.push({m,lp:null,th:.85+k*.12}));}
/* 공중 꽃가루(늘) · 반딧불(밤) — 원더룹 둘레를 따라다니는 빛 입자. 휴대폰 단계는 절반 아래로(발열) */
const pollen=G.fx.particles({parent:root,n:MOB?28:70,box:[9,3.2,9],vel:[.05,.07,.02],sway:.5,color:'#fff2bf',size:.07,life:[5,9],additive:true,seed:41});
const flies=G.fx.particles({parent:root,n:MOB?16:36,box:[10,2.2,10],vel:[0,.04,0],sway:.8,color:'#e6ff9a',size:.16,life:[3,6],additive:true,seed:43});
/* 연잎·잎사귀 배 (물 위 풍경) */
const pad=(x,dz,r)=>{const m=add(new THREE.CylinderGeometry(r,r,.04,13,1,false,.3,PI*2-.3),T('#86ba58','leaf'),x,-.08,cz(x)+dz,{ry:rnd(0,PI*2),line:false,cast:false});keep.push(m);return m;};
const pads=[[-12,1.3,.7],[-7.6,-1.2,.9],[-1.6,-1.8,.6],[9,-1.3,.8],[13,1.2,.6],[-15,-.9,.8],[11.2,.4,.5],[-10.4,-1.8,.55]].map(a=>pad(...a));
const leafBoat=(x,dz,ry)=>{const g=boatLeaf(1.1,.5);g.position.set(x,-.09,cz(x)+dz);g.rotation.y=ry;root.add(g);keep.push(g);return g;}; // 물 위에 떠 있는 빈 나뭇잎배(이슬배와 같은 모양)
const lboats=[leafBoat(-11,-.2,.4),leafBoat(10.5,.4,-.3)];
/* 떠다니는 이슬방울(풍경): 맑은 공 + 하이라이트 */
const dewMat=new THREE.MeshStandardMaterial({color:0xe9fbff,transparent:true,opacity:.42,roughness:.05,metalness:0,depthWrite:false});
const hiMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.85});
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
/* ---------- 이슬배 (원더룹이 타는 길쭉한 나뭇잎배, 2026-11-02 그릇 배 대신) + 굴러오는 큰 이슬방울 ----------
   원더룹은 앞쪽에 앉고(ride pose '앉기'), 사공은 뒤쪽 끝에 서서 배 옆 바깥으로 노를 젓는다(노 끝이 물에 닿는 곳에 작은 물결). 굴러온 이슬방울은 배 가운데에 담겨 반짝인다 */
const BOAT0=[4.55,-.06,-5.75],BL=2.7;
const boat=new THREE.Group();boat.position.set(...BOAT0);root.add(boat);keep.push(boat);const hull=boatLeaf(BL,1.2);boat.add(hull);
const boatDew=dewBall(.24);boatDew.position.set(0,hull.userData.floor(-.08)+.22,-.08*BL/2);boatDew.visible=false;boat.add(boatDew); // 배에 담긴 이슬방울(반짝임은 update)
const bigDrop=dewBall(.55);bigDrop.visible=false;root.add(bigDrop);keep.push(bigDrop);
const splash=G.fx.particles({parent:root,n:40,box:[.4,.2,.4],vel:[0,1.1,0],sway:.25,color:'#e8fbff',size:.09,life:[.5,1],additive:true,rate:0,seed:31,center:[4.55,.3,-5.75]});
let drop=null; // {t} 굴러오는 중
let boatReady=false,rode=false,gotUmbrella=false;
/* ---------- 민들레 솜털 우산 (활공 물건) — 민들레 홀씨 공(fairies.js dandelionPuff). 07이 원더룹 오른손에 줄기를 쥐여 머리 위로 들고, 활공하는 동안 솜털이 살랑인다(update) ---------- */
let umb=null;
function umbrella(){umb=dandelionPuff({stem:1.9,reach:.36});return umb;} // 오른손(몸 가운데에서 약 0.36m 옆)에서 머리 위 가운데로
/* 건너편 바위 두 개 (발판): 우산을 받은 뒤 뛰어올라 떨어지며 활공해 보는 곳 */
const ROCKS=[{c:[-6.5,-10.4,.75],top:.5},{c:[-8.4,-11.6,.8],top:1.0}];
ROCKS.forEach(r=>{add(new THREE.CylinderGeometry(r.c[2]*.85,r.c[2],r.top,9),T('#d8c8ae','stone'),r.c[0],r.top/2,r.c[1],{ry:r.c[0],line:false});
  add(new THREE.CylinderGeometry(r.c[2]*.86,r.c[2]*.86,.06,9),T('#93bb5c','leaf'),r.c[0],r.top+.01,r.c[1],{line:false,cast:false});});
/* ---------- 이야기 ---------- */
const st={phase:'arrive'};
const q=t=>G.ui.setQuest(t);
q('선착장의 사공 요정에게 가 봐요');
G.dialog.npc({name:'버섯 요정',root:shroom.root,bubbleY:1.05,onDone:()=>G.profile.meet('mushroom',shroom.root),variants:[
  {when:()=>!gotUmbrella,lines:['어머, 꽃봉오리 손님이네! 오늘 밤 첫별 축제 보러 왔구나?','축제는 별꽃 전망대에서 열려. 사공 아저씨 배를 타야 갈 수 있지.']},
  {when:()=>gotUmbrella,lines:['우산 받았구나! 바위 위에서 뛰어내려 봐. 깃털처럼 내려올걸?']}]});
const boatNpc=G.dialog.npc({name:'사공 요정',root:boatman.root,bubbleY:1.3,talkR:.9,onDone:()=>{G.profile.meet('boatman',boatman.root);afterBoatman();},variants:[
  {when:()=>st.phase==='arrive',lines:['어이쿠, 손님이구나! 첫별 축제 가는 길이지?','그런데 큰일이야. 아침 바람에 클로버 잎들이 뒤틀려서 물길을 꽉 막아 버렸어.','물길이 막히면 이슬방울이 못 굴러와. 이슬이 없으니 이슬배가 못 떠나고 있단다!','저기 강가에 뒤틀린 클로버 잎 세 개 보이지? 손으로 돌려서 바로 놓아 줄 수 있겠니?']},
  {when:()=>st.phase==='clovers',lines:['클로버는 이쪽 강가를 따라 셋 있어. 살랑살랑 반짝이는 잎이야. 가까이 가서 돌려 줘!']},
  {when:()=>st.phase==='boat',lines:['이슬배가 찰랑찰랑 찼어! 자, 타렴. 내가 노를 저어 줄게.']},
  {when:()=>st.phase==='done',lines:['우산은 뛰어내릴 때 저절로 펼쳐져. 다음은 민들레 공중정원이야!']}]});
function afterBoatman(){if(st.phase==='boat'){startRide();return;} // 배가 찼으면 사공과 이야기를 마치는 대로 함께 탄다(배 옆이라 E가 사공 대화를 먼저 잡는다)
  if(st.phase!=='arrive')return;st.phase='clovers';
  G.ui.notice({kicker:'미션',title:'클로버 잎을 돌려 주세요',text:'강가에 누운 클로버 셋을 손으로 돌려 바로 놓으면, 막힌 이슬 물길이 다시 이어져요.'});q('클로버 잎 돌리기 (0/3)');
  G.view.focus({at:[-5.2,.2,zS(-5.2)-1.1],from:[2.2,4.6,zS(2.2)+3.4],sec:1.8});} // 미션을 줄 때 카메라가 1.8초 동안 강가의 클로버 셋을 비췄다가 돌아온다(어디인지 몰라 헤매지 않게, 2026-11-02)
CLOVERS.forEach(c=>G.interact.add({root:c.g,at:[c.x,zS(c.x)+.55],face:[c.x,c.g.position.z],label:'돌리기',action:'돌리기',dur:1.5,once:true,near:2.6,
  when:()=>st.phase==='clovers',
  onStart:()=>{c.u=0;},
  onDone:()=>{c.done=true;fixed++;G.sound.sfx('chime');q(fixed<3?`클로버 잎 돌리기 (${fixed}/3)`:'물길이 열렸어요!');if(fixed===3)openChannel();}}));
function openChannel(){st.phase='rolling';G.dialog.say('사공 요정','물길이 열렸다! 저기 봐, 이슬방울이 굴러온다!',3);
  drop={t:0};bigDrop.visible=true;G.sound.sfx('whoosh');}
G.interact.add({root:boat,at:[4.55,-4.7],face:[4.55,-5.75],label:'타기',action:'서기',dur:.2,once:true,near:2.2,when:()=>st.phase==='boat',onDone:()=>startRide()});
function startRide(){st.phase='riding';q('');boatman.wave(false);
  // 사공은 이슬배로 옮겨 타고 함께 간다
  bmG.visible=false;const bm2=fairy('boatman');bm2.root.position.set(0,hull.userData.floor(-.66),-.66*BL/2);bm2.root.scale.setScalar(.95);boat.add(bm2.root); // 사공은 배 뒤쪽 끝(노 젓는 자리), 원더룹은 앞쪽에 앉는다(ride fwd·pose)
  rower=bm2;
  G.view.hold(()=>{const a=boat.rotation.y,fx=Math.sin(a),fz=Math.cos(a),sx=-fz,sz=fx,c=boat.position; // 노 젓는 쪽(사공 오른쪽) 비스듬한 앞옆에서 둘 다 보이게
    return {at:[c.x+fx*.1,.5,c.z+fz*.1],from:[c.x+sx*6.2+fx*2.6,2.6,c.z+sz*6.2+fz*2.6]};});
  // 물길 가운데를 따라 건너편 둑까지(끝점은 둑에 살짝 올라 원더룹이 땅에 내린다)
  G.ride.ride({vehicle:boat,seat:hull.userData.floor(.46)+.005,fwd:.46*BL/2,pose:'앉기',speed:1.15,path:[BOAT0,[3,-.06,cz(3)-.9],[-.5,-.06,cz(-.5)-.2],[-4.5,-.06,cz(-4.5)-.6],[-6.6,-.06,zN(-6.6)+1],[-6.8,-.06,zN(-6.8)-.3]],
    onEnd:()=>{rode=true;st.phase='gift';boat.remove(bm2.root);rower=null;G.view.hold(null);
      // 사공이 배 옆으로 한 걸음 나와(카메라에서 본 원더룹 옆쪽, 물가 땅) 원더룹을 보고 말한다 — 원더룹 뒤에 가려지지 않게
      {const cam=G.view.camera,f=new THREE.Vector3();cam.getWorldDirection(f);f.y=0;f.normalize();const rx=-f.z,rz=f.x;const W0=WL().position;
       const bx=W0.x+rx*1.05;bmG.position.set(bx,0,Math.min(zN(bx)-.35,W0.z+rz*1.05));small.visible=false;bmG.rotation.set(0,Math.atan2(W0.x-bmG.position.x,W0.z-bmG.position.z),0);bmG.visible=true;}
      G.dialog.say('사공 요정','도착! 물길을 열어 줘서 정말 고마워.',2.6).then(()=>G.dialog.say('사공 요정','이건 내 민들레 솜털 우산이야. 높은 데서 뛰어내릴 때 펼치면 사뿐히 내려올 수 있어!',4)).then(()=>{
        gotUmbrella=true;st.phase='done';WL().userData.setGlideProp(umbrella());
        G.ui.itemCard({title:'민들레 솜털 우산을 얻었어요!',text:'점프하거나 떨어질 때 펼쳐져요',icon:icon('umbrella')});
        q('바위에서 뛰어내려 우산을 펼쳐 봐요');});}});}
/* 노 젓기: 노를 물에 넣고(배 옆 바깥) 뒤로 당긴 뒤 들어 앞으로 — 되풀이. 노 끝이 물에 닿아 있는 동안 작은 물결이 퍼진다 */
let rower=null,ripT=0;const _blade=new THREE.Vector3();
function row(dt,t){const bm=rower;bm.tick(dt,t);const p=t*2.4,s2=Math.sin(p),dip=Math.max(0,Math.cos(p)),arm=bm.arms[0],oar=bm.root.userData.oar;
  arm.rotation.set(-.85*s2,0,-1.05+.32*(1-dip));oar.rotation.set(.3,0,.42-.1*dip);oar.scale.set(1,1.5,1); // 당길 때(dip) 팔을 내려 노 끝이 배 옆 바깥 물에 잠기고, 앞으로 돌아갈 때는 들어 올린다(배에서는 긴 노)
  bm.arms[1].rotation.set(-.3-.25*s2,0,.55);
  oar.localToWorld(_blade.set(0,-.78,0));ripT-=dt;if(_blade.y<-.08&&ripT<=0){ripT=.28;ripple(_blade.x,_blade.z);}}
const RIPS=[...Array(6)].map(()=>{const m=new THREE.Mesh(new THREE.RingGeometry(.07,.1,20).rotateX(-PI/2),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,depthWrite:false}));m.visible=false;m.userData.t=1;root.add(m);keep.push(m);return m;});
function ripple(x,z){const m=RIPS.find(r=>r.userData.t>=1)||RIPS[0];m.position.set(x,-.085,z);m.userData.t=0;m.visible=true;}
function tickRipples(dt){for(const m of RIPS){if(m.userData.t>=1)continue;const u=m.userData.t=Math.min(1,m.userData.t+dt/.9);m.scale.setScalar(1+u*3.2);m.material.opacity=.7*(1-u);m.visible=u<1;}}
let wl=null;const WL=()=>wl||(wl=root.parent&&(()=>{let w=null;root.parent.traverse(o=>{if(!w&&o.userData&&o.userData.vert)w=o;});return w;})());
const _bo=new THREE.Object3D(),_c=new THREE.Vector3(),_d=new THREE.Vector3(),_p=new THREE.Vector3();
function bendGrass(dt){const cam=G.view.camera,W=WL();if(!cam||!W)return;_c.copy(cam.position);_d.set(W.position.x,W.position.y+.75,W.position.z).sub(_c);const len=_d.length();if(len<.1)return;_d.divideScalar(len);
  for(const b of BEND){let hit=Math.hypot(b.x-_c.x,b.z-_c.z)<2.2+b.s;for(let j=0;j<3&&!hit;j++){_p.set(b.x,b.h*(.3+j*.3),b.z);const t=_p.clone().sub(_c).dot(_d);if(t>-.5&&t<len-.4)hit=_c.clone().addScaledVector(_d,t).distanceTo(_p)<1.6*b.s+.4;}
    const k=b.k+((hit?1:0)-b.k)*Math.min(1,dt*6);if(Math.abs(k-b.k)<1e-4&&k<.001)continue;b.k=k<.001?0:k;
    _bo.position.set(b.x,0,b.z);_bo.rotation.set(0,b.ry,0);_bo.scale.set(b.s*(1-.7*k),b.s*(1-.97*k),b.s*(1-.7*k));_bo.updateMatrix();b.cr.part(0).setMatrixAt(b.i,_bo.matrix);b.cr.part(0).instanceMatrix.needsUpdate=true;}} // 땅으로 웅크린다(옆으로 넓히면 납작한 흰 판처럼 보였다)
/* ---------- 매 프레임 ---------- */
const SK=G.sky.sky({parent:root,keys:FAIRY_SKY,t:0});
if(!MOB)G.occlude.cut(root,{skip:flat}); // 컴퓨터: 카메라와 원더룹 사이에 오는 것은 모두 부드럽게 흐려 보기(휴대폰은 위 occ — 물체 전체 0.3)
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
    if(u>=1){bigDrop.visible=false;drop=null;boatReady=true;st.phase='boat';boatDew.visible=true;dewPop=0;splash.burst(36,{x:BOAT0[0],y:.35,z:BOAT0[2]});splashT=1.4;G.sound.sfx('pop');q('이슬배에 타요');}}
  // 우산을 펴고 활공하기 시작하면 안내 문구와 아이템 카드를 치운다(할 일을 해냈으니까)
  if(gotUmbrella&&!st.glided){const W=WL();if(W&&W.userData.vert.air&&W.userData.vert.vy<-.3){st.glided=true;q('');G.ui.closeItemCard();}} // 우산이 펴지기 직전(떨어지기 시작할 때) 치워 펴지는 순간에는 카드가 없다
  // 시간(0 낮 · 1 해 질 녘 · 2 밤): 물 색, 햇빛 얼룩, 버섯등(등마다 켜지는 때가 다름), 꽃·반딧불
  const k=SK.t,i0=Math.min(1,Math.floor(k)),u0=k-i0,day=1-ss(0,1,k),nite=ss(1,2,k);
  _wc.copy(WC[i0].c).lerp(WC[i0+1].c,u0);_we.copy(WC[i0].e).lerp(WC[i0+1].e,u0);waterMat.color.copy(_wc);waterMat.emissive.copy(_we);waterMat.emissiveIntensity=WC[i0].ei+(WC[i0+1].ei-WC[i0].ei)*u0;
  dapple.material.opacity=.3*day;dapple.visible=day>.01;
  const W=WL();if(W)L.light(W.position,{light:1.15*ss(1,1.8,k),glow:1,pool:1,ambient:1,dt});
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
  if(rower)row(dt,t);tickRipples(dt);
  if(umb){const W=WL(),k=W?W.userData.vert.glide:0;umb.userData.sway(t,.25+.75*k);}}
let slow=0,fno=0,qLevel=0,splashT=0,dewPop=1; // splashT: 물보라가 남아 있는 동안만 그린다
function quality(L){qLevel=L;pollen.points.visible=L<1;if(L>=1)flies.points.visible=false;forest.setLevel(L);} // 08 자동 화질 조절
return {...FAIRY_WORLD,
  name:'이슬방울 선착장',kind:'outdoor',music:'fairy-dock',
  sky:SK,mergeColors:MOB, // 휴대폰: 움직이지 않는 소품·무리를 텍스처마다 한 덩어리로(03 색 접기)
  get glide(){return gotUmbrella;}, // 우산을 받은 뒤에만 활공(07은 구역 정보 glide를 매 프레임 읽는다)
  spawn:{x:.2,z:8.6,ry:PI}, // 길 입구 조금 안쪽 — 숲 방(camRoom) 가장자리면 휴대폰 카메라가 원더룹에 바짝 붙는다
  camRoom:{c:[-.5,0],r:MOB?15:19.5}, // 따라가기 카메라가 머무는 방 — 휴대폰은 둘레 벽(합쳐 그린 큰 잎, 흐려지지 않음, 14m부터) 언저리까지(더 줄이면 세로 화면 카메라가 원더룹에 바짝 붙는다), 컴퓨터는 흐려 보기가 있어 벽 바깥까지
  platforms:[{r:[DOCK.x0,DOCK.x1,DOCK.z0,DOCK.z1],top:DOCK.top},...ROCKS],
  walkLinks:[[-6.8,zN(-6.8)-.35]],camBlock, // 이슬배에서 내리는 자리(끼임 자동 시험이 건너편 마을도 걸어서 닿는 곳으로 본다)
  areas:{dock:{bounds:[-15,14,-15,14],obstacles,
    camera:{target:[0,1,0],dist:24,polar:[.45,1.3],azimuth:null,start:[1,.5],minDist:3,maxDist:44}}},
  doors:[{rect:[-1.2,1.2,-15,-14],to:'fairy-dandelion'}], // 다음 스테이지(아직 없음 → 저절로 닫혀 있음)
  sun:{dir:new THREE.Vector3(6,-11,5).normalize(),shadow:10,follow:true},
  lights:L.all,keepOut:keep,update,quality,
  test:{ // 확인 촬영용 지름길(대화를 건너뛰고 그 장면으로) — 게임에서는 쓰지 않는다
    mission(){st.phase='arrive';afterBoatman();},
    ride(){fixed=3;st.phase='boat';boatReady=true;boatDew.visible=true;startRide();},
    umbrella(){gotUmbrella=true;st.phase='done';WL().userData.setGlideProp(umbrella());}},
  dispose(){const U=WL()&&WL().userData;if(U&&U.setGlideProp)U.setGlideProp(null);CLOVERS.forEach(c=>c.glint.dispose());splash.dispose();pollen.dispose();flies.dispose();L.dispose();forest.dispose();clearPaintCache();clearFairyCache();}, // 텍스처·재질 캐시까지 비운다(휴대폰 스테이지당 예산 — 다음 스테이지로 넘어가면 이 스테이지 것은 메모리에 남지 않게)
};
}
