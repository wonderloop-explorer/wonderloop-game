/* 원더룹 베이스캠프 — 원더룹 몸·얼굴·표정·개미탈 */
import * as THREE from 'three';
import {PI,lathe,lin,pencil,scene} from './01-textures.js';
/* ---------- 원더룹 (탐험가) ---------- */
const WLS=1;const WL=new THREE.Group();WL.position.set(1.1,0,2.5);WL.rotation.y=0.8;WL.scale.setScalar(WLS);scene.add(WL);
/* 뼈대: 블렌더 이름 규칙(좌우 .L/.R, 원더룹 기준 왼쪽이 +x). 부품 좌표는 발바닥 기준으로 적혀 있어,
   엉덩이(hips) 아래에 엉덩이 높이만큼 내린 자리(wlBase·wlBody)를 두고 그 안에 붙인다 */
const HIP=.3;const hips=new THREE.Bone();hips.name='hips';hips.position.y=HIP;WL.add(hips);
const wlBase=new THREE.Group();wlBase.position.y=-HIP;hips.add(wlBase);
const spine=new THREE.Bone();spine.name='spine';hips.add(spine);
const wlBody=new THREE.Group();wlBody.position.y=-HIP;spine.add(wlBody);
const side=s=>s>0?'L':'R';
/* 게임(앤트빌리지)에서 확정한 원더룹 모델을 그대로 옮김 — 재질만 색연필 결로 */
function TM(c,kind,o,side){return new THREE.MeshStandardMaterial({map:pencil(c,kind,o||{}),roughness:.9,metalness:0,side:side||THREE.FrontSide});}
function SM(c,o){o=o||{};const m=new THREE.MeshStandardMaterial({map:pencil(c,'plain',{hatch:0.45}),roughness:0.9,metalness:0,side:o.side||THREE.FrontSide});return m;}
function BM(c,o){return new THREE.MeshStandardMaterial(Object.assign({color:lin(c),roughness:.75,metalness:0},o||{}));}
const wmList=[];function wm(g,m){const x=new THREE.Mesh(g,m);x.castShadow=true;x.receiveShadow=true;wmList.push(x);return x;}
function roundBox(sx,sy,sz,e){const g=new THREE.SphereGeometry(1,30,22);const p=g.attributes.position;const f=v=>Math.sign(v)*Math.pow(Math.abs(v),e);
  for(let i=0;i<p.count;i++)p.setXYZ(i,f(p.getX(i))*sx,f(p.getY(i))*sy,f(p.getZ(i))*sz);g.computeVertexNormals();return g;}
const shirtU={uInv:{value:new THREE.Matrix4()}};
function shirtMat(){const m=new THREE.MeshStandardMaterial({map:pencil('#8cc07a','plain',{hatch:.45}),roughness:.9});
  m.onBeforeCompile=sh=>{sh.uniforms.uInv=shirtU.uInv;
    sh.vertexShader='uniform mat4 uInv;\nvarying vec3 vBP;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nvBP=(uInv*modelMatrix*vec4(transformed,1.0)).xyz;');
    sh.fragmentShader='varying vec3 vBP;\n'+sh.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\nfloat fa=fract(atan(vBP.x,vBP.z)*7.0/6.2831853+.5);float st=smoothstep(0.0,0.025,fa)-smoothstep(0.225,0.25,fa);diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(3.42,1.5,2.15),st);');};
  return m;}
const skin=SM('#ffc9a0'),hairA=SM('#4e2e22'),scarfM=SM('#36aaa0'),tunic=TM('#f3ead6','jersey',{rep:[3,3]}),shorts=TM('#4a68b0','denim',{rep:[2,3],grain:.35}),
      bootM=TM('#7a4a32','suede',{rep:[2,2],grain:.4}),soleM=SM('#4e2e22'),beltM=SM('#7a4a32'),buckM=SM('#f2b63c');
const eyeM=BM('#2a1a24'),whiteM=BM('#ffffff');
const legs=[],arms=[],eyes=[],antennae=[],hoodParts=[],hairParts=[];
[-1,1].forEach(s=>{const pv=new THREE.Bone();pv.name='thigh.'+side(s);pv.position.set(s*.11,.3,0);wlBase.add(pv);
  pv.add(wm(new THREE.CylinderGeometry(.058,.061,.135,14).translate(0,-.0675,0),skin));
  const kn=new THREE.Bone();kn.name='shin.'+side(s);kn.position.y=-.125;pv.add(kn);pv.userData.knee=kn;
  kn.add(wm(new THREE.SphereGeometry(.061,14,10),skin));kn.add(wm(new THREE.CylinderGeometry(.061,.064,.13,14).translate(0,-.065,0),skin));
  const boot=new THREE.Bone();boot.name='foot.'+side(s);boot.position.set(0,-.075,.02);kn.add(boot);pv.userData.boot=boot;
  const up=wm(new THREE.SphereGeometry(.08,22,14),bootM);up.scale.set(1,.55,1.5);up.position.set(0,-.052,.03);boot.add(up);
  const sole=wm(new THREE.SphereGeometry(.08,22,14),TM('#f3ead6','rubber',{grain:.3}));sole.scale.set(1.08,.32,1.56);sole.position.set(0,-.08,.03);boot.add(sole);
  legs.push(pv);});
{const body=wlBody;
  const sh=wm(new THREE.SphereGeometry(.11,18,12),shorts);sh.scale.set(1.25,.7,.85);sh.position.y=.3;body.add(sh);
  const torso=wm(lathe([[0,.31],[.2,.31],[.205,.36],[.207,.45],[.2,.52],[.186,.565],[.155,.605],[.11,.632],[0,.64]].map(q=>new THREE.Vector2(q[0],q[1])),30),tunic);torso.scale.set(1.1,1,1.1);body.add(torso);
  const neck=wm(new THREE.TorusGeometry(.112,.022,10,28),TM('#d9cdb3','jersey',{rep:[6,1]}));neck.rotation.x=PI/2;neck.position.set(0,.628,0);body.add(neck);
  [-1,1].forEach(s=>{const ap=new THREE.Bone();ap.name='upperarm.'+side(s);ap.position.set(s*.2,.555,0);ap.rotation.z=s*.32;body.add(ap);
    ap.add(wm(new THREE.SphereGeometry(.082,18,14),tunic));
    ap.add(wm(new THREE.CylinderGeometry(.08,.074,.12,16).translate(0,-.06,0),tunic));
    const eb=new THREE.Bone();eb.name='forearm.'+side(s);eb.position.y=-.12;ap.add(eb);ap.userData.elbow=eb;
    ap.add(wm(new THREE.CylinderGeometry(.052,.05,.08,12).translate(0,-.08,0),skin));eb.add(wm(new THREE.SphereGeometry(.05,12,10),skin));eb.add(wm(new THREE.CylinderGeometry(.05,.046,.15,12).translate(0,-.075,0),skin));
    const hd=wm(new THREE.SphereGeometry(.068,12,10),skin);hd.position.y=-.18;eb.add(hd);arms.push(ap);});
}
/* 턱과 턱선: 얼굴 아래쪽을 앞·옆으로 둥글게 채워 입에서 목까지 매끄럽게 이어지게 */
function WL_CHIN(yw,xw,zw){const r=Math.hypot(xw,zw)||1e-6,w=.5+.5*zw/r,q=(yw+.2)/.19;return 1+.085*Math.exp(-q*q)*w*w;}
/* 고개는 목(neck)을 축으로 기울인다 */
const neck=new THREE.Bone();neck.name='neck';neck.position.y=.59;wlBody.add(neck);
const head=new THREE.Bone();head.name='head';head.position.y=.38;neck.add(head);
{const skG=new THREE.SphereGeometry(.41,56,42);
  {const p=skG.attributes.position;for(let i=0;i<p.count;i++){const m=WL_CHIN(p.getY(i)*.98,p.getX(i)*1.04,p.getZ(i)*.9);p.setX(i,p.getX(i)*m);p.setZ(i,p.getZ(i)*m);}skG.computeVertexNormals();}
  const skull=wm(skG,skin);skull.scale.set(1.04,.98,.9);head.add(skull);
  [-1,1].forEach(s=>{const ear=wm(new THREE.SphereGeometry(.105,20,16),skin);ear.scale.set(.42,.95,.78);ear.position.set(s*.425,-.085,0);ear.rotation.set(0,s*.35,-s*.32);head.add(ear);
    const eg=new THREE.Bone();eg.name='eye.'+side(s);eg.position.set(s*.115,-.055,.346);eg.rotation.y=s*.28;head.add(eg);
    const e=new THREE.Mesh(new THREE.SphereGeometry(.068,14,12),BM('#4a2e24'));e.scale.set(.74,1.15,.28);eg.add(e);eyes.push(eg);
    const br=new THREE.Mesh(new THREE.BoxGeometry(.078,.02,.014),hairA);br.position.set(s*.12,.048,.35);br.rotation.z=s*.15;head.add(br);(WL.userData.brows=WL.userData.brows||[]).push(br);});
  const nose=new THREE.Mesh(new THREE.SphereGeometry(.019,8,6),SM('#f2a27e'));nose.position.set(0,-.115,.36);head.add(nose);
  const mouth=new THREE.Mesh(new THREE.SphereGeometry(.026,8,6),BM('#a8505a'));mouth.scale.set(1.5,.5,.35);mouth.position.set(0,-.188,.329);head.add(mouth);WL.userData.mouth=mouth;
  const hoodM=SM('#a8603f'),hoodD=SM('#7e4229');hoodM.side=THREE.DoubleSide;
  const hoodG=new THREE.SphereGeometry(.5,80,60);
  // 얼굴 구멍을 실제로 뚫고(얼굴과 탈이 서로 파고들지 않게), 구멍 테두리는 둥근 테로 깔끔하게 마감
  {const p=hoodG.attributes.position,ix=hoodG.index.array,keep=[];
    const inHole=i=>{const x=p.getX(i)*2,y=p.getY(i)*2,z=p.getZ(i)*2;return z>0&&(x/.74)*(x/.74)+((y+.22)/.68)*((y+.22)/.68)<1;};
    for(let t=0;t<ix.length;t+=3){const a=ix[t],b=ix[t+1],c=ix[t+2];if(inHole(a)&&inHole(b)&&inHole(c))continue;keep.push(a,b,c);}
    hoodG.setIndex(keep);hoodG.computeVertexNormals();}
  const hood=wm(hoodG,hoodM);hood.scale.set(1.12,1.0,.96);hood.position.set(0,.04,-.1);head.add(hood);hoodParts.push(hood);
  {const pts=[];for(let i=0;i<72;i++){const th=i/72*PI*2;const x=.74*Math.cos(th),y=-.22+.68*Math.sin(th),z=Math.sqrt(Math.max(0,1-x*x-y*y));pts.push(new THREE.Vector3(x,y,z).multiplyScalar(.5*.985));}
   hood.add(wm(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,true),180,.032,12,true),hoodD));}
  function decal(dir,ex,ey,ox,oy,r,mat){const T=new THREE.Vector3(0,1,0).cross(dir).normalize(),B=dir.clone().cross(T).normalize();
    const g=new THREE.RingGeometry(.0001,1,40,8);const p=g.attributes.position,v=new THREE.Vector3();
    for(let i=0;i<p.count;i++){const a=p.getX(i)*ex+ox,b=p.getY(i)*ey+oy;v.copy(dir).addScaledVector(T,a).addScaledVector(B,b).normalize().multiplyScalar(r);p.setXYZ(i,v.x,v.y,v.z);}
    g.computeVertexNormals();return new THREE.Mesh(g,mat);}
  const blushM=BM('#f6a0ac',{transparent:true,opacity:.85});
  [-1,1].forEach(s=>{const b=new THREE.Mesh(new THREE.SphereGeometry(.06,12,8),blushM);b.scale.set(1.15,.6,.3);b.position.set(s*.235,-.125,.284);b.rotation.y=s*.6;head.add(b);(WL.userData.blush=WL.userData.blush||[]).push(b);});
  [-1,1].forEach(s=>{
    const dir=new THREE.Vector3(s*.38,.64,.7).normalize();
    hood.add(decal(dir,.18,.21,0,0,.506,eyeM));
    hood.add(decal(dir,.062,.062,-.065,.09,.509,whiteM));
    hood.add(decal(dir,.028,.028,.075,-.09,.509,whiteM));
    const base=new THREE.Vector3(s*.13,.5,-.02);const ag=new THREE.Bone();ag.name='antenna.'+side(s);ag.position.copy(base);head.add(ag);
    const pts=[base,new THREE.Vector3(s*.2,.9,.05),new THREE.Vector3(s*.38,1.02,.2),new THREE.Vector3(s*.5,.98,.34)].map(v=>v.clone().sub(base));
    ag.add(wm(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),16,.022,6),hoodD));
    const tip=wm(new THREE.SphereGeometry(.055,10,8),hoodM);tip.position.copy(pts[3]);ag.add(tip);antennae.push(ag);hoodParts.push(ag);
  });
}
head.children.forEach(c=>{if(c.position.z>.2&&c.position.y<.1){const m=WL_CHIN(c.position.y,c.position.x,c.position.z);c.position.x*=m;c.position.z*=m;}});
/* 표정 세트: 기본·기쁨·놀람·궁금·걱정·신남 (눈 모양, 눈썹 높이·기울기, 입 모양, 볼터치, 고개 기울기) */
{const U=WL.userData,mouth=U.mouth,brows=U.brows,blush=U.blush;
 const dk=BM('#4a2e24'),mr=BM('#8a3a40'),tg=BM('#e8828a'),wh=BM('#ffffff');
 const mg=new THREE.Group();mg.position.copy(mouth.position);mg.rotation.x=.45;head.add(mg);
 const M={};
 M.o=new THREE.Mesh(new THREE.CircleGeometry(.028,20),mr);M.o.scale.set(1,1.2,1);
 M.open=new THREE.Group();{const a=new THREE.Mesh(new THREE.CircleGeometry(.045,20,PI,PI),mr);const t=new THREE.Mesh(new THREE.CircleGeometry(.022,14,PI,PI),tg);t.position.set(0,-.018,.001);M.open.add(a,t);}
 M.smile=new THREE.Mesh(new THREE.TorusGeometry(.032,.008,6,16,PI),mr);M.smile.rotation.z=PI;
 M.side=new THREE.Mesh(new THREE.TorusGeometry(.022,.007,6,12,PI),mr);M.side.rotation.z=PI+.35;M.side.position.x=.015;
 {const pts=[];for(let i=0;i<=24;i++){const u=i/24;pts.push(new THREE.Vector3((u-.5)*.075,Math.sin(u*PI*3)*.007,0));}M.wavy=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),40,.006,6),mr);}
 Object.values(M).forEach(m=>{m.position.z+=.006;m.visible=false;mg.add(m);});
 const arcs=[],spark=[];
 eyes.forEach(eg=>{const a=new THREE.Mesh(new THREE.TorusGeometry(.045,.012,6,16,PI),dk);a.position.set(0,-.01,.022);a.visible=false;eg.add(a);arcs.push(a);
   const s1=new THREE.Mesh(new THREE.CircleGeometry(.016,12),wh);s1.position.set(-.012,.03,.021);const s2=new THREE.Mesh(new THREE.CircleGeometry(.008,10),wh);s2.position.set(.014,-.02,.021);s1.visible=s2.visible=false;eg.add(s1,s2);spark.push(s1,s2);});
 const sweat=new THREE.Mesh(new THREE.SphereGeometry(.03,12,10),BM('#a9daf2'));sweat.scale.set(1,1.45,.5);sweat.position.set(.335,.04,.235);sweat.visible=false;head.add(sweat);
 const base=brows.map(b=>({y:b.position.y}));const blushBase=blush.map(b=>b.scale.clone());
 const E={'기본':{},'기쁨':{arc:1,brow:[.015,-.05],mouth:'open',blush:1.25},'놀람':{eye:[1.12,1.22],brow:[.035,-.08],mouth:'o'},
   '궁금':{browEach:[[.03,-.12],[-.004,.15]],mouth:'side',tilt:.16},'걱정':{eye:[.9,.92],brow:[.012,-.3],mouth:'wavy',sweat:1,blush:.85},
   '신남':{eye:[1.06,1.1],spark:1,brow:[.02,0],mouth:'smile',blush:1.2}};
 const NAMES=Object.keys(E);
 function setExpr(n){const e=E[n];U.exprName=n;
   eyes.forEach(eg=>{const m=eg.children[0];m.visible=!e.arc;const s=e.eye||[1,1];m.scale.set(.74*s[0],1.15*s[1],.28);});
   arcs.forEach(a=>a.visible=!!e.arc);spark.forEach(x=>x.visible=!!e.spark);
   brows.forEach((b,i)=>{const sd=i?1:-1;const p=e.browEach?e.browEach[i]:(e.brow||[0,.15]);b.position.y=base[i].y+p[0];b.rotation.z=sd*p[1];});
   mouth.visible=!e.mouth;Object.entries(M).forEach(([k,m])=>m.visible=e.mouth===k);
   sweat.visible=!!e.sweat;blush.forEach((b,i)=>b.scale.copy(blushBase[i]).multiplyScalar(e.blush||1));U.headTilt=e.tilt||0;}
 U.setExpr=setExpr;U.exprNames=NAMES;setExpr('기본');
 const btn=document.getElementById('exprBtn');let ei=0;btn.addEventListener('click',()=>{ei=(ei+1)%NAMES.length;setExpr(NAMES[ei]);btn.textContent='표정: '+NAMES[ei];});}
export {HIP,SM,TM,WL,WLS,antennae,arms,eyes,hairParts,head,hips,hoodParts,legs,neck,roundBox,shirtU,shorts,skin,spine,tunic,wlBase,wlBody,wm,wmList};
