/* 원더룹 — 등불 (가짜 빛) · 모바일 조명 규칙
   등불·랜턴·창문 불빛은 진짜 조명(점광원) 대신 "빛나 보이게" 그린다: 스스로 빛나는 재질 + 빛무리(덧칠 스프라이트) + 바닥 빛 웅덩이(덧칠 판).
   진짜 조명은 원더룹 가까이의 등불 몇 개(real, 기본 1)에만 옮겨 다니며 켠다 → 등불이 몇 개든 빛 개수가 늘 같다.
   여러 등불이 장면 전체에 드리우던 따뜻한 기운은 따뜻한 주변광(AmbientLight, warm) 하나로 — 주변광은 재질마다 더하기 한 번이라 거의 공짜이고 셰이더도 다시 만들지 않는다.
   이유: 아이폰(요정의 숲 시험 장면, 2026-10-30)에서 점광원 4개가 프레임 시간 22.7ms 중 6ms — 점광원은 화면의 모든 재질 계산에 더해진다.
   빛 개수가 바뀌면(켜고 끄기) 모든 셰이더를 다시 만들어 휴대폰에서 몇 초 멈춘다 → 진짜 조명은 끄지 말고 세기만 0으로.

   쓰는 법 (구역 build 안에서):
     const L=G.lamps.lampSet({parent:root, real:1, groundY});
     L.add({x,y,z, reach:5, glow:{y:1.9,size:2.4,op:.5}, pool:{r:3,op:.35}, emissive:[주름 재질]});  // y = 빛이 나오는 높이
     구역 정보: lights:L.all  (진짜 조명 + 따뜻한 주변광. 08이 옛 단위 → 물리 단위로 바꾼다)
     light(env){ L.light(WL 위치, {light:점광원 세기, emissive:재질 발광, glow:빛무리 배율, pool:웅덩이 배율, ambient:주변광 배율, on}) }
   세기 값은 구역마다 낮·저녁·굴(env)에 맞춰 계산해서 넘긴다. 바닥이 울퉁불퉁하면 웅덩이 판이 땅에 묻히므로 pool을 끄거나 작게. */
import * as THREE from 'three';
const lin=hex=>new THREE.Color().setHex(hex,THREE.LinearSRGBColorSpace); // r128 때처럼 16진수를 선형 값 그대로 (조명·빛 색)
const radialTex=(stops)=>{const cv=document.createElement('canvas');cv.width=cv.height=128;const g=cv.getContext('2d');const gr=g.createRadialGradient(64,64,0,64,64,64);
  stops.forEach(([t,c])=>gr.addColorStop(t,c));g.fillStyle=gr;g.fillRect(0,0,128,128);const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;return t;};
function lampSet({parent,real=1,color=0xffb35a,glowColor=0xffc27a,warm=0.12,groundY=()=>0}){
  const glowTex=radialTex([[0,'rgba(255,236,190,1)'],[0.35,'rgba(255,196,120,0.45)'],[1,'rgba(255,170,90,0)']]);
  const poolTex=radialTex([[0,'rgba(255,214,140,0.9)'],[0.55,'rgba(255,200,120,0.35)'],[1,'rgba(255,190,110,0)']]);
  const lamps=[],lights=[],slots=[];
  const amb=new THREE.AmbientLight(lin(color),0);parent.add(amb); // 따뜻한 기운: 세기 = 점광원 세기 × warm × ambient
  for(let i=0;i<real;i++){const P=new THREE.PointLight(lin(color),0,6,2);P.castShadow=false;parent.add(P);lights.push(P);slots.push({lamp:null,w:0,next:null});}
  function add(o){const lamp={x:o.x,y:o.y,z:o.z,reach:o.reach||6,mats:o.emissive||[],glow:null,pool:null,glowOp:0,poolOp:0};
    if(o.glow){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:lin(glowColor),transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));
      sp.position.set(o.x,o.glow.y??o.y,o.z);sp.scale.setScalar(o.glow.size||2);parent.add(sp);lamp.glow=sp;lamp.glowOp=o.glow.op??.5;}
    if(o.pool){const m=new THREE.Mesh(new THREE.PlaneGeometry(o.pool.r*2,o.pool.r*2),new THREE.MeshBasicMaterial({map:poolTex,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,polygonOffset:true,polygonOffsetFactor:-3}));
      m.rotation.x=-Math.PI/2;m.position.set(o.x,groundY(o.x,o.z)+0.03,o.z);m.renderOrder=1;parent.add(m);lamp.pool=m;lamp.poolOp=o.pool.op??.35;}
    lamps.push(lamp);return lamp;}
  /* 매 프레임: 가까운 등불에 진짜 조명을 옮기고(바뀔 때는 꺼졌다 켜지며 0.4초), 재질·빛무리·웅덩이 밝기를 맞춘다.
     진짜 조명이 비추는 등불은 웅덩이를 덜 밝게(진짜 빛이 바닥을 이미 밝히므로 두 번 더하지 않게) */
  function light(focus,k){const on=k.on!==false,dt=k.dt??1/60;
    const near=lamps.map(l=>({l,d:Math.hypot(l.x-focus.x,l.z-focus.z)})).sort((a,b)=>a.d-b.d).slice(0,real).map(o=>o.l);
    slots.forEach((s,i)=>{const want=near.find(l=>!slots.some((t,j)=>j!==i&&t.lamp===l))||null;
      if(s.lamp!==want){s.w=Math.max(0,s.w-dt*2.5);if(s.w===0)s.lamp=want;}else s.w=Math.min(1,s.w+dt*2.5);
      const P=lights[i];if(s.lamp){P.position.set(s.lamp.x,s.lamp.y,s.lamp.z);P.distance=s.lamp.reach;}P.intensity=on&&s.lamp?(k.light||0)*s.w:0;});
    amb.intensity=on&&lamps.length?(k.light||0)*warm*(k.ambient??1):0;
    for(const l of lamps){const lit=slots.reduce((a,s)=>s.lamp===l?Math.max(a,s.w):a,0);
      l.mats.forEach(m=>m.emissiveIntensity=on?(k.emissive??1):(k.off??0.05));
      if(l.glow){l.glow.visible=on&&(k.glow??1)>0;l.glow.material.opacity=l.glowOp*(k.glow??1);}
      if(l.pool){l.pool.visible=on&&(k.pool??1)>0;l.pool.material.opacity=l.poolOp*(k.pool??1)*(1-.5*lit);}}}
  function dispose(){glowTex.dispose();poolTex.dispose();}
  return {add,light,lights,ambient:amb,all:[...lights,amb],lamps,dispose};}
export {lampSet};
