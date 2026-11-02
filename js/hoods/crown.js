/* 원더룹 탈: 꽃 화관 (요정의 숲, 2026-11-02 — 꽃봉오리 탈 대신. 꽃봉오리 탈 bud·bloom은 탈 목록에 그대로 두고 요정의 숲에서만 안 쓴다)
   머리카락(지그재그 단발)을 누르지 않고 그 위에 얹는다(profile 없음 → 06이 머리를 눌러 넣지 않는다). 고리는 머리 뼈 기준 높이 0.2 둘레,
   잰 머리카락 반지름(앞 0.39 · 옆 0.44 · 뒤 0.43)보다 1.6cm 바깥 — 굵은 덩굴(반지름 3.6cm)이 머리카락에 반쯤 묻혀 얹힌다(더 밖이면 옆이 떠 보였다). 전체 높이는 머리 크기의 1/4 이하(약 0.15).
   두 모습: build(false) 봉오리 화관 · build(true) 핀 화관 — 06 HOODS에 'crown'·'crownBloom' 두 칸, morphHood('crownBloom')이면
     animate(g,u): 별꽃 보석이 앞 가운데 꽃받침 자리에 쏙 들어가고(u 0~.3) → 봉오리가 앞에서부터 차례로 활짝 핀다(꽃잎 5장, 오목, 분홍 → 끝 연한 크림).
   봉오리 화관: 연두 잎과 가는 덩굴을 엮은 둥근 고리 + 작고 통통한 분홍 봉오리 7개(앞 가운데는 비운 꽃받침 자리 — 별꽃 보석 자리).
   핀 화관: 같은 고리 + 핀 꽃 7송이(가운데 살짝 빛남) + 앞 가운데 별꽃 보석(은은하게 빛남).
   별가루 tick(g,dt,t,U,on): 핀 화관을 쓰는 동안 화관 둘레(머리 위·옆 — 얼굴 앞 ±55°는 빼고)에서 작은 별·빛 알갱이가 떠올랐다 반짝이며 사라진다.
     월드 좌표에 남겨 원더룹이 움직이면 뒤로 꼬리처럼. 연노랑·크림·연분홍, 별 모양과 동그란 빛을 섞어 한 번에 그린다(드로우콜 1 — 점 하나에 모양 값).
     휴대폰 14개 · 컴퓨터 24개. 낮에도 보이고 해 질 녘·밤(U.nightK, 08이 하늘 시간에서 넣음)에는 더 크고 또렷하게.
   좌표는 머리(head 뼈) 기준, 앞 = +z. 재질 그림은 캔버스 256(아틀라스 교체 영역). 난수 없이 늘 같은 모양(별가루 흐름만 게임 시간 시드). */
import * as THREE from 'three';
import {PI,QUALITY,lathe,scene} from '../01-textures.js';
const Y0=.19; // 고리 높이(머리 뼈 기준)
const ringR=a=>{const c=Math.cos(a),f=c>0?c:0,b=c<0?-c:0;return .44+.016-(.44-.39)*f*f-(.44-.43)*b*b;}; // 각도 a(앞 0)의 고리 반지름 — 머리카락 + 1.6cm(굵은 덩굴이 머리카락에 반쯤 묻혀 얹힘 — 더 밖이면 옆이 떠 보였다)
const ringY=a=>Y0+.012*Math.cos(a); // 앞이 살짝 높게(이마 위로)
const at=(a,dr=0,dy=0)=>new THREE.Vector3(Math.sin(a)*(ringR(a)+dr),ringY(a)+dy,Math.cos(a)*(ringR(a)+dr));
const BUDS=[40,90,140,180,-140,-90,-40].map(d=>d*PI/180); // 앞 가운데(0)는 별꽃 보석 자리
let petalTex=null;
function petalCanvas(){const S=256,cv=document.createElement('canvas');cv.width=cv.height=S;const g=cv.getContext('2d');
  const gr=g.createLinearGradient(0,S,0,0);gr.addColorStop(0,'#f08aa6');gr.addColorStop(.45,'#f6a9bd');gr.addColorStop(.8,'#fbd9cf');gr.addColorStop(1,'#fdf1df');g.fillStyle=gr;g.fillRect(0,0,S,S); // 밑동 분홍 → 끝 연한 크림
  for(let i=0;i<56;i++){const x=(i*37)%S;g.strokeStyle=`rgba(255,255,255,${.05+((i*13)%7)*.012})`;g.lineWidth=1.2+(i%3)*.6;g.beginPath();g.moveTo(x,S);g.bezierCurveTo(x+5,S*.6,x-4,S*.3,x+2,0);g.stroke();}
  return cv;}
// 오목한 꽃잎 한 장(밑동 원점, +y 끝, +z 바깥 = 꽃 앞)
function cupPetal(w,L){const NU=6,NV=6,pos=[],uv=[],idx=[];
  for(let j=0;j<=NV;j++){const v=j/NV,hw=w/2*Math.sin(PI*(.12+.8*v))**.7;for(let i=0;i<=NU;i++){const u=i/NU*2-1;pos.push(u*hw,v*L,.28*w*u*u*Math.sin(PI*v)-.05*L*Math.sin(PI*v));uv.push(i/NU,v);}}
  for(let j=0;j<NV;j++)for(let i=0;i<NU;i++){const a=j*(NU+1)+i,b=a+NU+1;idx.push(a,a+1,b,a+1,b+1,b);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
function starGeo(r=.05,d=.022){const sh=new THREE.Shape();for(let i=0;i<10;i++){const a=i/10*PI*2+PI/2,rr=i%2?r*.45:r,x=Math.cos(a)*rr,y=Math.sin(a)*rr;i?sh.lineTo(x,y):sh.moveTo(x,y);}sh.closePath();
  return new THREE.ExtrudeGeometry(sh,{depth:d,bevelEnabled:true,bevelSize:d*.35,bevelThickness:d*.35,bevelSegments:1}).translate(0,0,-d/2);}
export function build({head,wm},open=false){
  const g=new THREE.Group();head.add(g);petalTex=petalTex||Object.assign(new THREE.CanvasTexture(petalCanvas()),{colorSpace:THREE.SRGBColorSpace});
  const vineM=new THREE.MeshStandardMaterial({color:0x7aa553,roughness:.9}),vine2M=new THREE.MeshStandardMaterial({color:0x9cc56d,roughness:.9}),
    leafM=new THREE.MeshStandardMaterial({color:0x8dbb5e,roughness:.85,side:THREE.DoubleSide}),leaf2M=new THREE.MeshStandardMaterial({color:0x6f9c48,roughness:.85,side:THREE.DoubleSide}),
    budM=new THREE.MeshStandardMaterial({color:0xf3a3b8,roughness:.8}),budTipM=new THREE.MeshStandardMaterial({color:0xf7c6cf,roughness:.8}),
    petM=new THREE.MeshStandardMaterial({map:petalTex,roughness:.8,side:THREE.DoubleSide}),
    eyeM=new THREE.MeshStandardMaterial({color:0xf6d36a,roughness:.6,emissive:0xf2c040,emissiveIntensity:.35}), // 핀 꽃 가운데: 살짝 빛남
    gemM=new THREE.MeshStandardMaterial({color:0xfff2b0,roughness:.35,emissive:0xffe27a,emissiveIntensity:.6}); // 별꽃 보석: 은은하게 빛남
  // 고리: 굵은 덩굴 하나 + 그 둘레를 감는 가는 덩굴
  {const N=64,P=[],Q=[];for(let i=0;i<N;i++){const a=i/N*PI*2;P.push(at(a));const w=a*7;Q.push(at(a,.034*Math.cos(w),.034*Math.sin(w)));}
   g.add(wm(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P,true),96,.036,7,true),vineM));
   g.add(wm(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Q,true),160,.012,4,true),vine2M));}
  // 잎: 고리를 따라 엇갈려(바깥·위로 비스듬히) — 앞 가운데 자리 둘레는 조금 비운다
  {const leafG=lathe([[0,0],[.03,.018],[.04,.05],[.028,.085],[0,.105]].map(q=>new THREE.Vector2(q[0],q[1])),6).scale(1,1,.25);
   for(let i=0;i<26;i++){const a=i/26*PI*2+.07;if(Math.abs(Math.atan2(Math.sin(a),Math.cos(a)))<.2)continue;const piv=new THREE.Group();piv.position.copy(at(a,.02,.004));piv.rotation.order='YXZ';piv.rotation.set(0,a+(i%2?.9:-.9),0);
     piv.rotateZ((i%2?-1:1)*1.15);piv.rotateX(i%3?.35:-.2);g.add(piv);piv.add(wm(leafG,i%2?leafM:leaf2M));}}
  // 앞 가운데 꽃받침 자리(작은 연두 컵)
  {const cup=wm(lathe([[0,-.016],[.03,-.01],[.046,.016],[.052,.038],[.042,.042],[.03,.02],[0,.012]].map(q=>new THREE.Vector2(q[0],q[1])),10),vineM);
   const piv=new THREE.Group();piv.position.copy(at(0,.03,.014));piv.rotation.x=1.2;g.add(piv);piv.add(cup);g.userData.slot=piv;}
  const flowers=[];
  BUDS.forEach(a=>{const piv=new THREE.Group();piv.position.copy(at(a,open?.03:.016,open?.012:.026));piv.rotation.order='YXZ';piv.rotation.set(open?1.0:.5,a,0);g.add(piv); // +y(꽃 앞)가 바깥·위로 비스듬히 — 핀 꽃은 화관 밖을 보고, 봉오리는 고리 위에 더 세워 얹는다(옆으로 삐져나오면 떠 보였다)
    if(!open){ // 작고 통통한 봉오리 + 꽃받침 셋
      piv.add(wm(lathe([[0,0],[.034,.01],[.05,.036],[.048,.064],[.03,.09],[0,.102]].map(q=>new THREE.Vector2(q[0],q[1])),10),budM));
      const tip=wm(lathe([[0,.07],[.02,.078],[.012,.097],[0,.105]].map(q=>new THREE.Vector2(q[0],q[1])),8),budTipM);piv.add(tip);
      for(let k=0;k<3;k++){const s=new THREE.Group();s.rotation.y=k/3*PI*2;piv.add(s);const l=wm(lathe([[0,0],[.017,.014],[.017,.034],[0,.05]].map(q=>new THREE.Vector2(q[0],q[1])),5).scale(1,1,.35),leaf2M);l.position.z=.03;l.rotation.x=.35;s.add(l);}}
    else{ // 핀 꽃: 오목한 꽃잎 5장 + 빛나는 가운데
      const pg=cupPetal(.085,.09),ps=[];for(let k=0;k<5;k++){const s=new THREE.Group();s.rotation.y=k/5*PI*2+.3;piv.add(s);const pv=new THREE.Group();pv.position.z=.012;s.add(pv);pv.add(wm(pg,petM));ps.push(pv);pv.rotation.x=1.25;}
      const eye=wm(new THREE.SphereGeometry(.026,10,6).scale(1,.6,1),eyeM);eye.position.y=.01;piv.add(eye);
      flowers.push({a,ps,eye,d:Math.abs(Math.atan2(Math.sin(a),Math.cos(a)))/PI});}});
  if(open){const gem=wm(starGeo(.065,.026),gemM);gem.position.set(0,.03,0);gem.rotation.x=-1.2;g.userData.slot.add(gem);g.userData.gem=gem;}
  g.userData.flowers=flowers;
  return {g,profile:null,top:.15};}
/* 피어나기: u 0→1 — 별꽃 보석이 꽃받침 자리에 쏙(위에서 내려와 통 커짐) → 앞에서부터 차례로 꽃잎이 펼쳐지고 가운데가 퐁 */
export function animate(g,u){const ease=x=>{x=Math.min(1,Math.max(0,x));const c=1.5;x-=1;return 1+(c+1)*x*x*x+c*x*x;},sm=x=>{x=Math.min(1,Math.max(0,x));return x*x*(3-2*x);};
  const gem=g.userData.gem;if(gem){const k=sm(u/.28);gem.position.y=.03+.18*(1-k);gem.scale.setScalar(Math.max(.001,ease(u/.3)));}
  for(const f of g.userData.flowers||[]){const k=ease((u-.3-f.d*.45)/.35);f.ps.forEach(p=>p.rotation.x=.05+1.2*k);f.eye.scale.setScalar(Math.max(.001,ease((u-.35-f.d*.45)/.3)));}}
/* 별가루 (핀 화관을 쓰는 동안) */
let dust=null;
function makeDust(){const N=QUALITY.tier==='mobile'?14:24,geo=new THREE.BufferGeometry();
  const pos=new Float32Array(N*3),col=new Float32Array(N*3),sz=new Float32Array(N),al=new Float32Array(N),sh=new Float32Array(N);
  for(const [k,a,n] of [['position',pos,3],['color',col,3],['aSize',sz,1],['aAlpha',al,1],['aShape',sh,1]])geo.setAttribute(k,new THREE.BufferAttribute(a,n).setUsage(THREE.DynamicDrawUsage));
  const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uScale:{value:500},uBright:{value:1}},vertexColors:true,
    vertexShader:`attribute float aSize;attribute float aAlpha;attribute float aShape;uniform float uScale;varying vec3 vC;varying float vA;varying float vS;
      void main(){vC=color;vA=aAlpha;vS=aShape;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=aSize*uScale/-mv.z;gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`uniform float uBright;varying vec3 vC;varying float vA;varying float vS;
      void main(){vec2 p=gl_PointCoord*2.-1.;float r=length(p),a;
        if(vS>.5){float t=atan(p.y,p.x),k=.42+.58*pow(abs(cos(2.5*t)),6.);a=1.-smoothstep(k*.55,k*.75,r);a=max(a,(1.-smoothstep(0.,.28,r))*.9);} // 다섯 갈래 별
        else{a=1.-smoothstep(.15,1.,r);a*=a;} // 동그란 빛 알갱이
        if(a*vA<.01)discard;gl_FragColor=vec4(mix(vC,vec3(1.),(1.-r)*.5)*uBright,a*vA);}`});
  mat.vertexColors=true;const pts=new THREE.Points(geo,mat);pts.frustumCulled=false;pts.renderOrder=4;pts.visible=false;scene.add(pts);
  const P=[...Array(N)].map((_,i)=>({life:0,age:1+i*.13,x:0,y:0,z:0,vx:0,vy:0,vz:0}));
  const COLS=[[1,.95,.62],[1,.97,.86],[1,.82,.88],[1,.9,.72]].map(c=>c.map(v=>v));let seed=7;const R=()=>(seed=(seed*16807)%2147483647)/2147483647;
  return {pts,geo,mat,P,N,COLS,R,pos,col,sz,al,sh};}
const _v=new THREE.Vector3();
export function tick(g,dt,t,U,on){if(!dust){if(!on)return;dust=makeDust();}const D=dust;D.pts.visible=on||D.P.some(p=>p.age<p.life);if(!D.pts.visible)return;
  const night=Math.min(1,Math.max(0,U.nightK||0));D.mat.uniforms.uBright.value=1+.25*night;{const cv=document.querySelector('#stage canvas');D.mat.uniforms.uScale.value=(cv?cv.height:innerHeight)*1.87;} // 점 크기(m) → 화소: 세로 시야 30°g.updateWorldMatrix(true,false);
  D.P.forEach((p,i)=>{p.age+=dt;if(p.age>=p.life){if(!on){D.al[i]=0;return;}
      let a;do{a=(D.R()*2-1)*PI;}while(Math.abs(a)<.95); // 얼굴 앞 ±55°에서는 나오지 않는다(머리 위·옆)
      _v.copy(at(a,.02,.02+D.R()*.06)).applyMatrix4(g.matrixWorld);p.x=_v.x;p.y=_v.y;p.z=_v.z;
      const ox=Math.sin(a),oz=Math.cos(a);_v.set(ox,0,oz).transformDirection(g.matrixWorld);p.vx=_v.x*.05+(D.R()-.5)*.04;p.vz=_v.z*.05+(D.R()-.5)*.04;p.vy=.12+D.R()*.14;
      p.life=1.6+D.R()*1.2;p.age=0;p.shape=D.R()<.45?1:0;p.size=(p.shape?.15:.1)*(.75+D.R()*.5);const c=D.COLS[Math.floor(D.R()*4)];D.col.set(c,i*3);p.ph=D.R()*7;}
    p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.vy*=1-.4*dt;const u=p.age/p.life,tw=.65+.35*Math.sin(t*9+p.ph);
    D.pos.set([p.x,p.y,p.z],i*3);D.sz[i]=p.size*(1+.5*night)*(u<.2?u/.2:1);D.al[i]=(u<.15?u/.15:1-Math.pow((u-.15)/.85,1.6))*tw*(.85+.15*night);D.sh[i]=p.shape;});
  for(const k of ['position','color','aSize','aAlpha','aShape'])D.geo.attributes[k].needsUpdate=true;}
// 06 HOODS에 넣는 두 모습: {key:'crown',mod:CROWN}, {key:'crownBloom',mod:CROWN_BLOOM} — morphHood('crownBloom')이면 animate가 보석·피어나기를 그리고, 그 뒤로 tick이 별가루
export const CROWN={build:o=>build(o,false)};
export const CROWN_BLOOM={build:o=>build(o,true),animate,tick};
