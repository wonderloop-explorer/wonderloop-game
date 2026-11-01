/* 요정의 숲 STAGE 01 — 이슬방울 선착장 (낮) · 설계 메모 "STAGE 01", 분위기 ref/mood/01-dock.png·00-village.png (색·빛·소품만, 배치는 자유)
   거대한 클로버와 연잎 사이로 흐르는 이슬 수로, 나무 선착장. 바람에 클로버 잎들이 뒤틀려 물길이 막혀 이슬배가 못 떠난다.
   흐름: ① 사공 요정과 이야기 → 미션 카드 ② 물가에서 클로버 셋을 손으로 돌려 맞춤(interact '돌리기') → 물길이 열리면 큰 이슬방울이 굴러와 이슬배를 채움
         ③ 이슬배 타기(game/ride — 수로를 따라 짧은 구경) → 건너편 ④ 사공이 민들레 솜털 우산을 줌(아이템 카드) → 바위에서 뛰어내리면 우산을 펼쳐 활공.
   실패·다시 하기 없음. 우산을 받기 전에는 활공하지 않는다(구역 정보 glide가 받은 뒤에만 참).
   요정: 사공(잎 모자·연파랑 옷·노, 파란 그릇 배 = 이슬배), 버섯 요정 주민 — fairies.js. 잎사귀 배·물방울은 풍경 소품.
   난수는 rng('fairy-dock:…'). 움직이는 것(클로버·이슬방울·배·요정·물방울)은 keepOut(병합 안 함). */
import * as THREE from 'three';
import {M,PI,QUALITY,add,blob,boxAt,cylAt,group,lathe,rng,shadowBlob} from '../../01-textures.js';
import * as G from '../../game/index.js';
import {FAIRY_SKY,FAIRY_WORLD,icon} from './world.js';
import {dewBoat,fairy} from './fairies.js';
export function build({root}){
const R=rng('fairy-dock:props'),rnd=(a,b)=>a+(b-a)*R();
const SIZE=48,RZ0=-2.4,RZ1=-7.6; // 수로: z가 RZ1~RZ0 (남쪽 물가 RZ0, 북쪽 물가 RZ1)
const keep=[],obstacles=[],tick=[];
/* ---------- 땅·수로 ---------- */
{const gm=M('#bdd283','plain',{rep:[10,5]}),S0=SIZE/2-RZ0,S1=SIZE/2+RZ1; // 이끼 풀밭: 수로 남쪽·북쪽 두 장(물이 보이게)
 add(new THREE.PlaneGeometry(SIZE,S0).rotateX(-PI/2),gm,0,0,RZ0+S0/2,{cast:false,line:false});add(new THREE.PlaneGeometry(SIZE,S1).rotateX(-PI/2),gm,0,0,RZ1-S1/2,{cast:false,line:false});
 add(new THREE.PlaneGeometry(SIZE,RZ0-RZ1).rotateX(-PI/2),M('#8a6a4a','plain'),0,-.5,(RZ0+RZ1)/2,{cast:false,line:false});} // 물 밑 바닥
// 흙길: 들어오는 자리에서 선착장까지, 납작한 디딤돌
{const path=new THREE.Shape();path.moveTo(-1.1,-12);path.bezierCurveTo(-1.6,-6,3,-2,3.6,2.2);path.lineTo(5.4,2.2);path.bezierCurveTo(5,-2.5,1.2,-6,1.1,-12);path.closePath(); // 모양 좌표 (x, -z)
 add(new THREE.ShapeGeometry(path,24).rotateX(-PI/2),M('#d9ae78','plain',{rep:[2,2]}),0,.012,0,{cast:false,line:false});
 [[0,10.6],[.2,8.7],[.8,6.9],[1.6,5.1],[2.6,3.4],[3.5,1.7],[4.2,.1]].forEach(([x,z],i)=>add(new THREE.CylinderGeometry(.42+(i%2)*.08,.46,.06,9),M('#d8cbb8','plain'),x,.03,z,{ry:i,line:false,cast:false}));}
// 물: 맑은 청록 (위로 살짝 빛나게), 물가 둑은 흙 + 이끼 띠
const water=add(new THREE.PlaneGeometry(SIZE,RZ0-RZ1,48,6).rotateX(-PI/2),M('#6fd0cf','plain',{emissive:'#3fa9b0',ei:.18}),0,-.06,(RZ0+RZ1)/2,{cast:false,line:false});
water.material.roughness=.35;
for(const z of [RZ0,RZ1]){boxAt(SIZE,.22,.36,M('#b8875a','plain'),0,-.18,z+(z===RZ0?.08:-.08),{line:false});boxAt(SIZE,.05,.3,M('#8fb85a','leaf'),0,.02,z+(z===RZ0?.22:-.22),{line:false,cast:false});}
obstacles.push({r:[-SIZE/2,3.5,RZ1,RZ0]},{r:[5.6,SIZE/2,RZ1,RZ0]},{r:[3.5,5.6,RZ1,-5.0]}); // 물에는 못 들어감(선착장만)
/* ---------- 선착장 ---------- */
const DOCK={x0:3.5,x1:5.6,z0:-5.0,z1:-2.0,top:.14};
boxAt(DOCK.x1-DOCK.x0,.1,DOCK.z1-DOCK.z0,M('#c08a58','planks',{rep:[2,3]}),(DOCK.x0+DOCK.x1)/2,DOCK.top-.1,(DOCK.z0+DOCK.z1)/2);
const post=(x,z,h=.75)=>{cylAt(.12,.13,h+.3,M('#8b5d3a','wood'),x,-.3,z);const r=add(new THREE.TorusGeometry(.13,.035,6,14),M('#d9b98a','plain'),x,h-.25,z,{rx:PI/2,line:false});r.scale.set(1,1,1.4);};
[[DOCK.x0,DOCK.z1],[DOCK.x1,DOCK.z1],[DOCK.x0,DOCK.z0],[DOCK.x1,DOCK.z0],[DOCK.x0,-3.5],[DOCK.x1,-3.5]].forEach(([x,z])=>post(x,z));
// 밧줄 난간 (양옆)
for(const x of [DOCK.x0,DOCK.x1]){const c=new THREE.CatmullRomCurve3([new THREE.Vector3(x,.6,DOCK.z1),new THREE.Vector3(x,.48,-2.75),new THREE.Vector3(x,.6,-3.5),new THREE.Vector3(x,.48,-4.25),new THREE.Vector3(x,.6,DOCK.z0)]);
  add(new THREE.TubeGeometry(c,24,.025,5),M('#d9b98a','plain'),0,0,0,{line:false});}
obstacles.push({r:[DOCK.x0-.15,DOCK.x0+.05,DOCK.z0,DOCK.z1]},{r:[DOCK.x1-.05,DOCK.x1+.15,DOCK.z0,DOCK.z1]});
/* ---------- 풍경: 거대한 클로버·잎·꽃 (둘레), 꽃지붕 집 (건너편 마을) ---------- */
const leafHeart=(s,mat)=>{const sh=new THREE.Shape();sh.moveTo(0,0);sh.bezierCurveTo(-.55*s,.25*s,-.62*s,.9*s,-.28*s,1*s);sh.bezierCurveTo(-.1*s,1.04*s,0,.9*s,0,.8*s);sh.bezierCurveTo(0,.9*s,.1*s,1.04*s,.28*s,1*s);sh.bezierCurveTo(.62*s,.9*s,.55*s,.25*s,0,0);
  return new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:.05*s,bevelEnabled:true,bevelSize:.03*s,bevelThickness:.03*s,bevelSegments:1,curveSegments:8}),mat);};
const cloverMat=M('#7fb453','leaf',{rep:[1,1]}),cloverDk=M('#6aa043','leaf');
const giantClover=(x,z,h,s,ry)=>{const g=group(x,0,z,ry);cylAt(.09*s,.13*s,h,M('#78a64c','plain'),0,0,0,{parent:g,line:false});
  for(let k=0;k<3;k++){const L=leafHeart(s,k%2?cloverMat:cloverDk);L.position.set(0,h,0);L.rotation.set(-PI/2+.35,k*PI*2/3,0,'YXZ');L.castShadow=true;g.add(L);}
  blob(x,z,.8*s,.8*s,.18);obstacles.push({c:[x,z,.25*s]});};
const daisy=(x,z,h,s)=>{const g=group(x,0,z,rnd(0,PI*2));cylAt(.07*s,.1*s,h,M('#86b058','plain'),0,0,0,{parent:g,line:false});const hd=new THREE.Group();hd.position.y=h;hd.rotation.x=rnd(.3,.6);g.add(hd);
  for(let k=0;k<12;k++){const p=add(new THREE.SphereGeometry(.5*s,8,5),M('#fbf3e6','suede'),0,0,0,{parent:hd,line:false});p.scale.set(.32,.07,1);p.position.set(Math.sin(k/12*PI*2)*.5*s,0,Math.cos(k/12*PI*2)*.5*s);p.rotation.y=k/12*PI*2;}
  add(new THREE.SphereGeometry(.24*s,10,6),M('#f2c34c','dots'),0,.04*s,0,{parent:hd,s:[1,.45,1],line:false});obstacles.push({c:[x,z,.2*s]});};
const bigLeaf=(x,z,s,ry,lean)=>{const g=group(x,0,z,ry);const L=leafHeart(s,M('#83b85a','leaf'));L.position.y=.05;L.rotation.set(-PI/2+lean,0,0);g.add(L);L.castShadow=true;};
const bell=(x,z,h,s)=>{const g=group(x,0,z,rnd(0,PI*2));const c=new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0),new THREE.Vector3(0,h*.7,0),new THREE.Vector3(.5*s,h,0),new THREE.Vector3(.9*s,h*.88,0)]);
  add(new THREE.TubeGeometry(c,16,.06*s,6),M('#7ea650','plain'),0,0,0,{parent:g,line:false});
  const b=add(lathe([[0,.02],[.18,0],[.32,-.2],[.4,-.5],[.5,-.6],[.42,-.62],[0,-.58]].map(q=>new THREE.Vector2(q[0]*s,q[1]*s)),10),M('#b49ae0','suede'),.9*s,h*.88,0,{parent:g,line:false});obstacles.push({c:[x,z,.15]});};
// 남쪽(들어오는 쪽) 둘레
[[-8,6,3.2,1.6,.4],[-12,1,4,2,1.1],[9,7,3.6,1.8,2],[12,1.5,4.4,2.2,.2],[-5,11,2.6,1.3,2.4],[7,12,3,1.5,1]].forEach(a=>giantClover(...a));
[[-10,9,4.6,1.4],[11,10,5,1.5],[-14,-1,5.4,1.6]].forEach(a=>daisy(...a));
[[-7,4,1.2,.4,.5],[7.5,4.5,1.3,1.8,.6],[-3.8,7.5,1,2.6,.55],[5.5,9,1.1,1,.5]].forEach(a=>bigLeaf(...a));
bell(-4,3.2,2.4,1);bell(8.5,-.5,2.8,1.2);
// 건너편(북쪽) 둘레와 꽃지붕 집 두 채
[[-10,-12,4,2,.8],[12,-11,4.4,2.1,2.4],[2,-15,5,2.4,1.5],[-16,-9,3.6,1.8,0]].forEach(a=>giantClover(...a));
[[8,-14,5.6,1.7],[-4,-16,5,1.6]].forEach(a=>daisy(...a));
const hut=(x,z,roof,ry)=>{const g=group(x,0,z,ry);cylAt(.9,1,1.3,M('#f1e2c8','plaster'),0,0,0,{parent:g});
  add(new THREE.BoxGeometry(.5,.8,.1),M('#9a6a42','wood'),0,.4,.96,{parent:g});add(new THREE.CircleGeometry(.18,12),M('#ffd27a','plain',{emissive:'#ffc860',ei:.6}),.45,.85,.9,{parent:g,line:false,ry:.45});
  for(let k=0;k<6;k++){const p=add(new THREE.SphereGeometry(.85,10,6),M(roof,'suede'),0,1.55,0,{parent:g,line:false});p.scale.set(.62,.28,1);p.position.set(Math.sin(k/6*PI*2)*.55,1.5,Math.cos(k/6*PI*2)*.55);p.rotation.set(-.55,k/6*PI*2,0,'YXZ');}
  add(new THREE.SphereGeometry(.25,8,6),M('#86b058','leaf'),0,2.05,0,{parent:g,line:false,s:[1,.6,1]});obstacles.push({c:[x,z,1.15]});blob(x,z,1.5,1.5,.25);};
hut(-3.2,-11.5,'#f4a9b6',.3);hut(6.5,-10.6,'#c4a6e6',-.4);
// 반짝이는 작은 버섯 (낮에도 은은하게 — 빛은 없고 스스로 빛나는 재질만)
for(let i=0;i<16;i++){const a=rnd(0,PI*2),d=rnd(3,14),x=Math.cos(a)*d,z=Math.sin(a)*d+2;if(z<RZ0+.6&&z>RZ1-.6)continue;
  const g=group(x,0,z,0);cylAt(.035,.045,.16,M('#f5ecdc','plain'),0,0,0,{parent:g,line:false,cast:false});add(new THREE.SphereGeometry(.1,8,5,0,PI*2,0,PI/2),M('#fff6dc','plain',{emissive:'#ffeab0',ei:.55}),0,.15,0,{parent:g,line:false,cast:false});}
// 작은 꽃·풀포기 (콘셉트 그림의 분홍·노랑·하양 꽃밭 느낌) — 같은 모양 여러 개는 무리(InstancedMesh)로 그리기 몇 번에
{const FL=[['#f5a8b8',70],['#f7d66a',50],['#fbf1e2',50],['#c9b2ee',30]];let fi=0;
 FL.forEach(([c,n])=>{const cr=G.fx.crowd({parent:root,n,parts:[{geo:new THREE.SphereGeometry(.09,7,4).scale(1,.35,1),mat:M(c,'suede'),at:[0,.13,0],cast:false},{geo:new THREE.CylinderGeometry(.012,.015,.13,4),mat:M('#7ea650','plain'),at:[0,.065,0],cast:false},{geo:new THREE.SphereGeometry(.035,5,3),mat:M('#f2c34c','plain'),at:[0,.15,0],cast:false}]});
   for(let i=0;i<n;i++){let x,z;do{x=rnd(-20,20);z=rnd(-20,20);}while((z<RZ0+.7&&z>RZ1-.7)||Math.hypot(x-2,z-3)<2.2);cr.set(i,x,0,z,rnd(0,PI*2),rnd(.8,1.5));}fi++;});
 const tuft=G.fx.crowd({parent:root,n:120,parts:[{geo:new THREE.ConeGeometry(.08,.32,4).translate(0,.16,0),mat:M('#8fbd5a','plain'),cast:false},{geo:new THREE.ConeGeometry(.06,.26,4).translate(.07,.13,.03).rotateZ(-.3),mat:M('#9cc866','plain'),cast:false},{geo:new THREE.ConeGeometry(.06,.24,4).translate(-.07,.12,-.02).rotateZ(.3),mat:M('#86b553','plain'),cast:false}]});
 for(let i=0;i<120;i++){let x,z;do{x=rnd(-21,21);z=rnd(-21,21);}while(z<RZ0+.4&&z>RZ1-.4);tuft.set(i,x,0,z,rnd(0,PI*2),rnd(.7,1.4));}
 // 물가를 따라 풀포기를 조금 더 촘촘히
}
// 연잎·잎사귀 배 (물 위 풍경)
const pad=(x,z,r)=>{const m=add(new THREE.CylinderGeometry(r,r,.04,14,1,false,.3,PI*2-.3),M('#7fb453','leaf'),x,-.02,z,{ry:rnd(0,PI*2),line:false,cast:false});keep.push(m);return m;};
const pads=[[-12,-3.4,.7],[-7.6,-6.6,.9],[-1.6,-6.8,.6],[9,-6.4,.8],[13,-3.6,.6],[-15,-6,.8]].map(a=>pad(...a));
const leafBoat=(x,z,ry)=>{const g=new THREE.Group();g.position.set(x,-.02,z);g.rotation.y=ry;root.add(g);
  const hull=add(lathe([[0,0],[.18,.02],[.26,.12],[.28,.24],[.24,.26],[.16,.1],[0,.08]].map(q=>new THREE.Vector2(q[0],q[1])),12),M('#86bc58','leaf'),0,0,0,{parent:g,line:false});hull.scale.set(1,1,3.2);
  const st=add(new THREE.TorusGeometry(.12,.03,5,10,PI),M('#6f9a44','plain'),0,.26,.86,{parent:g,line:false,ry:PI/2});keep.push(g);return g;};
const lboats=[leafBoat(-11,-5.2,.4),leafBoat(10.5,-4.4,-.3)];
// 떠다니는 이슬방울(풍경): 맑은 공 + 하이라이트
const dewMat=new THREE.MeshStandardMaterial({color:0xe9fbff,transparent:true,opacity:.42,roughness:.05,metalness:0,depthWrite:false});
const hiMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.85});
const dewBall=r=>{const g=new THREE.Group();const s=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),dewMat);s.renderOrder=2;g.add(s);const h=new THREE.Mesh(new THREE.SphereGeometry(r*.2,8,6),hiMat);h.position.set(-r*.38,r*.45,r*.55);h.scale.set(1,.6,.4);g.add(h);return g;};
const floaters=[[-9,-4.6,.22],[-5,-3.4,.16],[1,-6.2,.2],[7.5,-3.2,.18],[12,-5.6,.24],[-2.5,1.2,.14],[6,1.6,.12]].map(([x,z,r],i)=>{const b=dewBall(r);b.position.set(x,r+.15,z);b.userData.ph=i*1.3;root.add(b);keep.push(b);return b;});
/* ---------- 클로버 셋 (돌려 맞추기) — 물가 가까이 물 위에 누운 큰 클로버. 처음엔 뒤틀려(잎 하나가 들림) 물길을 막고 있다 ---------- */
const CLOVERS=[{x:-9.5},{x:-5.5},{x:-1.5}].map((c,i)=>{const g=new THREE.Group();g.position.set(c.x,.02,-3.55);root.add(g);keep.push(g);
  const spin=new THREE.Group();g.add(spin);
  for(let k=0;k<3;k++){const L=leafHeart(.95,k%2?cloverMat:cloverDk);L.rotation.set(-PI/2,k*PI*2/3,0,'YXZ');L.castShadow=true;spin.add(L);}
  add(new THREE.SphereGeometry(.12,8,6),M('#6a9a40','plain'),0,.06,0,{parent:spin,line:false});
  const twist=.95+i*.25;spin.rotation.y=twist;spin.rotation.z=.32*(i%2?1:-1); // 뒤틀림: 돌아가 있고 한쪽이 들려 있음
  return {g,spin,from:twist,to:0,tz:spin.rotation.z,u:-1,done:false};});
let fixed=0;
/* ---------- 요정 ---------- */
const boatman=fairy('boatman'),small=dewBoat(.62);
const bmG=new THREE.Group();bmG.position.set(6.4,-.04,-4.3);bmG.rotation.y=-.9;root.add(bmG);bmG.add(small);boatman.root.position.y=.1;bmG.add(boatman.root);keep.push(bmG);
const shroom=fairy('mushroom');shroom.root.position.set(-1.6,0,5.2);shroom.root.rotation.y=.7;root.add(shroom.root);keep.push(shroom.root);obstacles.push({c:[-1.6,5.2,.3]});
shadowBlob(-1.6,5.2,.35,.35);
G.occlude.add(shroom.root,.35,.9);
/* ---------- 이슬배 (원더룹이 타는 큰 그릇 배) + 굴러오는 큰 이슬방울 ---------- */
const boat=new THREE.Group();boat.position.set(4.55,-.06,-5.75);root.add(boat);keep.push(boat);boat.add(dewBoat(1.25));
const boatWater=new THREE.Mesh(new THREE.CircleGeometry(.62,20).rotateX(-PI/2),new THREE.MeshStandardMaterial({color:0xbff3f6,transparent:true,opacity:0,roughness:.1,depthWrite:false}));boatWater.position.y=.2;boat.add(boatWater);
const bigDrop=dewBall(.55);bigDrop.visible=false;root.add(bigDrop);keep.push(bigDrop);
const splash=G.fx.particles({parent:root,n:40,box:[.4,.2,.4],vel:[0,1.1,0],sway:.25,color:'#e8fbff',size:.09,life:[.5,1],additive:true,rate:0,seed:31,center:[4.55,.3,-5.75]});
let drop=null; // {t} 굴러오는 중
let boatReady=false,rode=false,gotUmbrella=false;
/* ---------- 민들레 솜털 우산 (활공 물건) ---------- */
function umbrella(){const g=new THREE.Group();g.position.set(-.42,-.5,.05);g.rotation.z=-.22; // 든 손(오른손) 쪽에서 비스듬히 — 손잡이가 꽃봉오리를 뚫지 않고 갓은 봉오리 위로
  const h=new THREE.CatmullRomCurve3([new THREE.Vector3(.08,-.06,0),new THREE.Vector3(.1,-.13,0),new THREE.Vector3(0,-.12,0),new THREE.Vector3(0,.2,0),new THREE.Vector3(0,1.15,0)]);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(h,16,.025,6),M('#8a5a36','wood')));
  const top=new THREE.Group();top.position.y=1.2;g.add(top);
  const can=new THREE.Mesh(lathe([[0,.2],[.18,.18],[.36,.1],[.48,0],[.5,-.04]].map(q=>new THREE.Vector2(q[0],q[1])),16),M('#f3e7c8','suede'));top.add(can);
  for(let k=0;k<16;k++){const a=k/16*PI*2,s=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,.42,4),M('#fffaf0','plain'));s.position.set(Math.sin(a)*.38,.2,Math.cos(a)*.38);s.rotation.set(Math.cos(a)*.9,0,-Math.sin(a)*.9);top.add(s);
    const t=new THREE.Mesh(new THREE.SphereGeometry(.03,6,4),M('#fffaf0','plain'));t.position.set(Math.sin(a)*.56,.36,Math.cos(a)*.56);top.add(t);}
  const c=new THREE.Mesh(new THREE.SphereGeometry(.07,10,8),M('#f5cf5a','plain',{emissive:'#f5c040',ei:.25}));c.position.y=.22;top.add(c);
  g.traverse(o=>{if(o.isMesh){o.castShadow=true;}});return g;}
/* 건너편 바위 두 개 (발판): 우산을 받은 뒤 뛰어올라 떨어지며 활공해 보는 곳 */
const ROCKS=[{c:[-6.5,-10.4,.75],top:.5},{c:[-8.4,-11.6,.8],top:1.0}];
ROCKS.forEach(r=>{const m=add(new THREE.CylinderGeometry(r.c[2]*.85,r.c[2],r.top,9),M('#c9b59a','plain'),r.c[0],r.top/2,r.c[1],{ry:r.c[0]});
  add(new THREE.CylinderGeometry(r.c[2]*.86,r.c[2]*.86,.06,9),M('#93bb5c','leaf'),r.c[0],r.top+.01,r.c[1],{line:false,cast:false});});
/* ---------- 이야기 ---------- */
const st={phase:'arrive'};
const q=t=>G.ui.setQuest(t);
q('선착장의 사공 요정에게 가 봐요');
G.dialog.npc({name:'버섯 요정',root:shroom.root,bubbleY:1.05,variants:[
  {when:()=>!gotUmbrella,lines:['어머, 꽃봉오리 손님이네! 오늘 밤 첫별 축제 보러 왔구나?','축제는 별꽃 전망대에서 열려. 사공 아저씨 배를 타야 갈 수 있지.']},
  {when:()=>gotUmbrella,lines:['우산 받았구나! 바위 위에서 뛰어내려 봐. 깃털처럼 내려올걸?']}]});
const boatNpc=G.dialog.npc({name:'사공 요정',root:boatman.root,bubbleY:1.3,talkR:.9,onDone:()=>afterBoatman(),variants:[
  {when:()=>st.phase==='arrive',lines:['어이쿠, 손님이구나! 첫별 축제 가는 길이지?','그런데 큰일이야. 아침 바람에 클로버 잎들이 뒤틀려서 물길을 꽉 막아 버렸어.','물길이 막히면 이슬방울이 못 굴러와. 이슬이 없으니 이슬배가 못 떠나고 있단다!','물가에 누운 클로버 셋을 손으로 돌려서 바로 놓아 줄 수 있겠니?']},
  {when:()=>st.phase==='clovers',lines:['클로버는 물가에 셋 있어. 가까이 가서 돌려 줘!']},
  {when:()=>st.phase==='boat',lines:['이슬배가 찰랑찰랑 찼어! 자, 타렴. 내가 노를 저어 줄게.']},
  {when:()=>st.phase==='done',lines:['우산은 뛰어내릴 때 저절로 펼쳐져. 다음은 민들레 공중정원이야!']}]});
function afterBoatman(){if(st.phase==='boat'){startRide();return;} // 배가 찼으면 사공과 이야기를 마치는 대로 함께 탄다(배 옆이라 E가 사공 대화를 먼저 잡는다)
  if(st.phase!=='arrive')return;st.phase='clovers';
  G.ui.notice({kicker:'미션',title:'클로버 잎을 돌려 주세요',text:'물가에 누운 클로버 셋을 손으로 돌려 바로 놓으면, 막힌 이슬 물길이 다시 이어져요.'});q('클로버 잎 돌리기 (0/3)');}
CLOVERS.forEach((c,i)=>G.interact.add({root:c.g,at:[c.g.position.x,RZ0+.55],face:[c.g.position.x,c.g.position.z],label:'돌리기',action:'돌리기',dur:1.5,once:true,near:2.6,
  when:()=>st.phase==='clovers',
  onStart:()=>{c.u=0;},
  onDone:()=>{c.done=true;fixed++;G.sound.sfx('chime');q(fixed<3?`클로버 잎 돌리기 (${fixed}/3)`:'물길이 열렸어요!');if(fixed===3)openChannel();}}));
function openChannel(){st.phase='rolling';G.dialog.say('사공 요정','물길이 열렸다! 저기 봐, 이슬방울이 굴러온다!',3);
  drop={t:0};bigDrop.visible=true;G.sound.sfx('whoosh');}
G.interact.add({root:boat,at:[4.55,-4.7],face:[4.55,-5.75],label:'타기',action:'서기',dur:.2,once:true,near:2.2,when:()=>st.phase==='boat',onDone:()=>startRide()});
function startRide(){st.phase='riding';q('');boatman.wave(false);
  // 사공은 이슬배로 옮겨 타고 함께 간다
  bmG.visible=false;const bm2=fairy('boatman');bm2.root.position.set(0,.12,-.42);bm2.root.scale.setScalar(.95);boat.add(bm2.root); // 사공은 배 뒤쪽(노 젓는 자리), 원더룹은 앞쪽(ride fwd)tick.push(bm2);
  G.ride.ride({vehicle:boat,seat:.18,fwd:.24,speed:1.15,path:[[4.55,-.06,-5.75],[3,-.06,-6.4],[-.5,-.06,-5.1],[-4.5,-.06,-5.9],[-6.6,-.06,-6.6],[-6.8,-.06,-7.9]],
    onEnd:()=>{rode=true;st.phase='gift';const P=boat.position;bmG.position.set(P.x+.9,-.04,P.z+.4);bmG.visible=true;boat.remove(bm2.root);tick.splice(tick.indexOf(bm2),1);
      G.dialog.say('사공 요정','도착! 물길을 열어 줘서 정말 고마워.',2.6).then(()=>G.dialog.say('사공 요정','이건 내 민들레 솜털 우산이야. 높은 데서 뛰어내릴 때 펼치면 사뿐히 내려올 수 있어!',4)).then(()=>{
        gotUmbrella=true;st.phase='done';WL().userData.setGlideProp(umbrella());
        G.ui.itemCard({title:'민들레 솜털 우산을 얻었어요!',text:'점프하거나 떨어질 때 펼쳐져요',icon:icon('umbrella')});
        q('바위에서 뛰어내려 우산을 펼쳐 봐요');});}});}
let wl=null;const WL=()=>wl||(wl=root.parent&&(()=>{let w=null;root.parent.traverse(o=>{if(!w&&o.userData&&o.userData.vert)w=o;});return w;})());
/* ---------- 매 프레임 ---------- */
const _v=new THREE.Vector3();
function update(dt,t){
  boatman.tick(dt,t);shroom.tick(dt,t);tick.forEach(f=>f.tick(dt,t));
  boatman.wave(st.phase==='arrive'||st.phase==='boat');
  bmG.position.y=-.04+Math.sin(t*1.4)*.025;bmG.rotation.z=Math.sin(t*1.1)*.03;
  if(st.phase!=='riding'){boat.position.y=-.06+Math.sin(t*1.2+1)*.02;boat.rotation.z=Math.sin(t*.9)*.02;}
  pads.forEach((p,i)=>p.position.y=-.02+Math.sin(t*.8+i)*.01);lboats.forEach((b,i)=>{b.position.y=-.02+Math.sin(t*1.1+i)*.02;b.rotation.z=Math.sin(t*.9+i)*.04;});
  floaters.forEach(b=>{b.position.y=b.children[0].geometry.parameters.radius+.15+Math.sin(t*1.3+b.userData.ph)*.06;});
  // 클로버: 돌리는 동안(원더룹 손 동작 1.5초) 천천히 바로 놓이고, 끝나면 살짝 출렁
  CLOVERS.forEach(c=>{if(c.u>=0&&c.u<1){c.u=Math.min(1,c.u+dt/1.5);const k=c.u*c.u*(3-2*c.u);c.spin.rotation.y=c.from+(c.to-c.from)*k;c.spin.rotation.z=c.tz*(1-k);}
    c.g.position.y=.02+Math.sin(t*1.5+c.g.position.x)*.012;});
  // 큰 이슬방울이 물길을 따라 굴러와 이슬배에 퐁 들어감
  if(drop){drop.t+=dt;const T=3.2,u=Math.min(1,drop.t/T),x=-14+(4.55+14)*u,z=-4.6+(-5.75+4.6)*u*u;
    bigDrop.position.set(x,.55+Math.abs(Math.sin(u*PI*3))*.25*(1-u),z);bigDrop.rotation.z=-x*1.8;
    if(u>=1){bigDrop.visible=false;drop=null;boatReady=true;st.phase='boat';boatWater.material.opacity=.55;splash.burst(36,{x:4.55,y:.35,z:-5.75});G.sound.sfx('pop');q('이슬배에 타요');}}
  // 우산을 펴고 활공하기 시작하면 안내 문구와 아이템 카드를 치운다(할 일을 해냈으니까)
  if(gotUmbrella&&!st.glided){const W=WL();if(W&&W.userData.vert.glide>.5){st.glided=true;q('');G.ui.closeItemCard();}}
  splash.update(dt);}
return {...FAIRY_WORLD,
  name:'이슬방울 선착장',kind:'outdoor',music:'fairy-dock',
  sky:G.sky.sky({parent:root,keys:FAIRY_SKY,t:0}),
  get glide(){return gotUmbrella;}, // 우산을 받은 뒤에만 활공(07은 구역 정보 glide를 매 프레임 읽는다)
  spawn:{x:0,z:11,ry:PI},
  platforms:[{r:[DOCK.x0,DOCK.x1,DOCK.z0,DOCK.z1],top:DOCK.top},...ROCKS],
  areas:{dock:{bounds:[-SIZE/2+3,SIZE/2-3,-SIZE/2+3,SIZE/2-3],obstacles,
    camera:{target:[0,1,0],dist:24,polar:[.45,1.3],azimuth:null,start:[1,.5],minDist:3,maxDist:44}}},
  doors:[{rect:[-1.2,1.2,-17.5,-16],to:'fairy-dandelion'}], // 다음 스테이지(아직 없음 → 저절로 닫혀 있음)
  sun:{dir:new THREE.Vector3(6,-11,5).normalize(),shadow:10,follow:true},
  keepOut:keep,update,
  dispose(){const U=WL()&&WL().userData;if(U&&U.setGlideProp)U.setGlideProp(null);splash.dispose();},
};
}
