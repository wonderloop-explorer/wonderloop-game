/* 원더룹 탈: 꽃 화관 (요정의 숲 — 꽃봉오리 탈 대신. 꽃봉오리 탈 bud·bloom은 탈 목록에 그대로 두고 요정의 숲에서만 안 쓴다)
   기준 그림: wonderloop-studio fairy-forest/ref/match/crown-ref.png(화관) · crown-sparkle-ref.png(별가루), 2026-11-02 다시 만듦.
   정수리 쪽에 얹힌 풍성한 화관: 머리 뼈 기준 높이 0.30 둘레(잰 머리카락 반지름 앞 0.345 · 옆 0.367 · 뒤 0.358)에 갈색 덩굴 고리를 반쯤 묻고,
   그 위로 작은 꽃(다섯 장, 분홍·진분홍·흰색·연노랑, 크기 셋)·작은 둥근 봉오리·올리브빛 잎을 빽빽하게 엮어 머리카락 위로 도톰하게 올라오게.
   profile 없음 → 06이 머리를 눌러 넣지 않는다(지그재그 단발이 화관 아래로 그대로 보인다).
   두 모습: build(false) 봉오리 화관(꽃 자리마다 통통한 분홍·크림 봉오리 — 핀 화관과 같은 배치·풍성함, 앞 가운데는 빈 꽃받침 자리)
            build(true) 핀 화관(앞 가운데 꽃받침에 작은 별꽃 보석이 꽃 사이에 묻혀 살짝, 꽃 몇 송이는 은은하게 빛남).
   06 HOODS 'crown'·'crownBloom' — morphHood('crownBloom')이면 animate(g,u): 보석이 꽃받침에 쏙(u 0~.3) → 앞에서부터 구역(8조각)마다 봉오리가 꽃으로 퐁.
   가볍게: 배치는 rng('crown') 한 번(두 모습이 같은 자리), 색은 256 팔레트 그림 한 장(칸 16개, 칸마다 밑동 → 끝 그러데이션)에 UV로 가리켜
     재질 셋(보통·빛남·보석)만 쓴다. 꽃·잎·봉오리는 모양 몇 가지를 되풀이해 덩어리로 합친다 — 부품(아틀라스 잎 뼈) 봉오리 화관 2개 · 핀 화관 26개,
     아틀라스가 양면 재질끼리 한 번에 그리므로 드로우콜은 늘지 않는다.
   별가루 tick(g,dt,t,U,on): 핀 화관을 쓰는 동안 — 아래 설명. 좌표는 머리(head 뼈) 기준, 앞 = +z */
import * as THREE from 'three';
import {PI,QUALITY,lathe,rng,scene} from '../01-textures.js';
const Y0=.30;
const ringR=a=>{const c=Math.cos(a),f=c>0?c:0,b=c<0?-c:0;return .367+.006-(.367-.345)*f*f-(.367-.358)*b*b;}; // 머리카락 + 0.6cm — 덩굴(반지름 2.6cm)이 반쯤 묻혀 얹힌다
const ringY=a=>Y0+.012*Math.cos(a); // 앞이 살짝 높게
const OUT=a=>new THREE.Vector3(Math.sin(a),0,Math.cos(a)),TAN=a=>new THREE.Vector3(Math.cos(a),0,-Math.sin(a)),UPV=new THREE.Vector3(0,1,0);
const at=(a,dr=0,dy=0)=>new THREE.Vector3(Math.sin(a)*(ringR(a)+dr),ringY(a)+dy,Math.cos(a)*(ringR(a)+dr));
/* 팔레트: 4×4칸(64px), 칸마다 아래(밑동, v=0) → 위(끝, v=1) 그러데이션 + 옅은 색연필 결 */
const CELLS=[['#86643f','#9d7b50'],['#7a8a4c','#97a463'],['#7d9457','#a9bb7e'],['#6b8246','#8ea262'], // 0 덩굴 갈색 · 1 가는 덩굴 올리브 · 2 잎 세이지 · 3 잎 진올리브
  ['#e8879a','#f8c2ca'],['#d9677f','#f2a0ae'],['#f1e2c2','#fffaf1'],['#efd486','#fbf0c4'], // 4 분홍 꽃잎 · 5 진분홍 · 6 흰 꽃잎(밑동 크림) · 7 연노랑
  ['#eeb23a','#f9d65e'],['#dc7189','#f5b5c2'],['#e7d3a6','#fbf1da'],['#7c9a52','#a3bd70'], // 8 꽃 가운데 노랑 · 9 분홍 봉오리 · 10 크림 봉오리 · 11 꽃받침
  ['#c8cc78','#e8e4a2'],['#ffe9a6','#fffbe8'],['#8ca85c','#accb7c'],['#ffffff','#ffffff']]; // 12 연두 알봉오리 · 13 별꽃 보석 · 14 꽃받침 자리 · 15 흰색
let palTex=null;
function palette(){const S=256,cv=document.createElement('canvas');cv.width=cv.height=S;const g=cv.getContext('2d');
  CELLS.forEach(([a,b],c)=>{const x=(c%4)*64,y=S-(Math.floor(c/4)+1)*64,gr=g.createLinearGradient(0,y+64,0,y);gr.addColorStop(0,a);gr.addColorStop(.25,a);gr.addColorStop(1,b);g.fillStyle=gr;g.fillRect(x,y,64,64);
    for(let i=0;i<9;i++){g.strokeStyle=`rgba(255,255,255,${.05+(i%3)*.03})`;g.lineWidth=1.5;g.beginPath();const sx=x+6+i*6;g.moveTo(sx,y+62);g.bezierCurveTo(sx+3,y+40,sx-3,y+22,sx+1,y+2);g.stroke();}});
  return cv;}
const cellUV=(c,u,v)=>[((c%4)+.18+.64*Math.min(1,Math.max(0,u)))/4,(Math.floor(c/4)+.18+.64*Math.min(1,Math.max(0,v)))/4];
/* 합치기: 모양(geo)을 행렬로 옮겨 칸(cell) 색을 붙여 쌓는다 */
class Batch{constructor(){this.p=[];this.n=[];this.uv=[];this.i=[];}
  add(geo,m,cell){const P=geo.attributes.position,N=geo.attributes.normal,U=geo.attributes.uv,b=this.p.length/3,nm=new THREE.Matrix3().getNormalMatrix(m),v=new THREE.Vector3();
    for(let k=0;k<P.count;k++){v.fromBufferAttribute(P,k).applyMatrix4(m);this.p.push(v.x,v.y,v.z);v.fromBufferAttribute(N,k).applyMatrix3(nm).normalize();this.n.push(v.x,v.y,v.z);this.uv.push(...cellUV(cell,U?U.getX(k):.5,U?U.getY(k):.5));}
    if(geo.index)for(let k=0;k<geo.index.count;k++)this.i.push(b+geo.index.getX(k));else for(let k=0;k<P.count;k++)this.i.push(b+k);}
  get empty(){return !this.i.length;}
  geo(o){const g=new THREE.BufferGeometry(),p=this.p.slice();if(o)for(let k=0;k<p.length;k+=3){p[k]-=o.x;p[k+1]-=o.y;p[k+2]-=o.z;}
    g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(this.n,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(this.uv,2));g.setIndex(this.i);return g;}}
/* 모양 몇 가지 (되풀이해 쓴다) */
function grid(NU,NV,f){const pos=[],uv=[],idx=[];for(let j=0;j<=NV;j++)for(let i=0;i<=NU;i++){const u=i/NU,v=j/NV;pos.push(...f(u*2-1,v));uv.push(u,v);}
  for(let j=0;j<NV;j++)for(let i=0;i<NU;i++){const a=j*(NU+1)+i,b=a+NU+1;idx.push(a,a+1,b,a+1,b+1,b);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
let SH=null;
function shapes(){if(SH)return SH;
  // 꽃잎(밑동 원점, +z로 뻗고 +y가 꽃 앞 — 오목하게 위로 휨, 끝이 둥근 다섯 장 꽃잎)
  const petal=grid(4,3,(u,v)=>{const hw=.5*Math.sin(PI*(.12+.82*v))**.55;return [u*hw,.22*u*u*Math.sin(PI*v)+.18*v*v,v];});
  const leaf=grid(2,4,(u,v)=>{const hw=.5*Math.sin(PI*v)**.8*(1-.25*v);return [u*hw*.42,.22*Math.abs(u)*hw-.12*v*v,v];}); // 가운데 잎맥이 접힌 잎(+z로 뻗음, 끝이 살짝 처짐)
  const center=new THREE.SphereGeometry(1,8,5,0,PI*2,0,PI/2).scale(1,.55,1);
  const bud=lathe([[0,0],[.4,.1],[.55,.38],[.5,.66],[.3,.88],[0,1]].map(q=>new THREE.Vector2(q[0],q[1])),8);
  const ball=new THREE.SphereGeometry(1,6,4);
  return SH={petal,leaf,center,bud,ball};}
/* 배치(한 번만, 두 모습이 같은 자리): 꽃 32(바깥 아래 줄·위 줄 엇갈림, 지름 12~20cm) · 알봉오리 30 · 잎 52 */
let LAY=null;
function layout(){if(LAY)return LAY;const R=rng('crown'),F=[],T=[],L=[];
  const NF=32;for(let i=0;i<NF;i++){let a=(i+.5)/NF*PI*2-PI+(R()-.5)*.1;if(Math.abs(a)<.14)a=Math.sign(a||1)*.17; // 앞 가운데는 보석 자리
    const row=i%2,z=R(),sz=z<.3?.098:z<.7?.078:.06,cz=R(),col=cz<.42?4:cz<.62?5:cz<.84?6:7;
    F.push({a,r:sz,col,dr:row?-.005:.05,dy:row?.085:.03,tilt:row?1.0+R()*.3:.35+R()*.3,spin:R()*PI,glow:R()<.3});}
  for(let i=0;i<30;i++){const a=(i+R()*.6)/30*PI*2-PI;if(Math.abs(a)<.08)continue;const z=R();T.push({a,r:.02+R()*.012,col:z<.4?12:z<.7?9:10,dr:-.01+R()*.06,dy:.07+R()*.08});}
  for(let i=0;i<52;i++){const a=i/52*PI*2-PI+R()*.05;L.push({a,len:.17+R()*.07,s:i%2?1:-1,o:.7+R()*.8,u:-.2+R()*.45,col:R()<.55?2:3});}
  return LAY={F,T,L};}
const _m=new THREE.Matrix4(),_x=new THREE.Vector3(),_y=new THREE.Vector3(),_z=new THREE.Vector3();
// 모양의 +y가 n, +z가 d를 보도록 놓는 행렬(크기 s)
function frame(pos,n,d,s){_y.copy(n).normalize();_z.copy(d).addScaledVector(_y,-d.dot(_y)).normalize();_x.crossVectors(_y,_z);return _m.makeBasis(_x,_y,_z).scale(new THREE.Vector3(s,s,s)).setPosition(pos).clone();}
function flowerInto(B,f,S){const n=OUT(f.a).multiplyScalar(Math.cos(f.tilt)).addScaledVector(UPV,Math.sin(f.tilt)),c=at(f.a,f.dr,f.dy);
  const side=TAN(f.a).applyAxisAngle(n.clone().normalize(),f.spin);
  for(let k=0;k<5;k++){const d=side.clone().applyAxisAngle(n.clone().normalize(),k/5*PI*2);const m=frame(c.clone().addScaledVector(n,-.004),n,d,1);
    B.add(S.petal,m.multiply(new THREE.Matrix4().makeScale(f.r*.95,f.r*.55,f.r)),f.col);}
  B.add(S.center,frame(c,n,side,1).multiply(new THREE.Matrix4().makeScale(f.r*.3,f.r*.3,f.r*.3)),8);
  return c;}
function budInto(B,f,S){const t=Math.min(1.2,f.tilt+.15),n=OUT(f.a).multiplyScalar(Math.cos(t)).addScaledVector(UPV,Math.sin(t)),c=at(f.a,f.dr*.6,f.dy*.7-.006),side=TAN(f.a);
  B.add(S.bud,frame(c,n,side,1).multiply(new THREE.Matrix4().makeScale(f.r*.95,f.r*1.3,f.r*.95)),f.col<6?9:10); // 통통하고 둥근 봉오리(길쭉하면 불꽃처럼 보였다)
  for(let k=0;k<3;k++){const d=side.clone().applyAxisAngle(n.clone().normalize(),k/3*PI*2+.4),dd=d.clone().multiplyScalar(.55).addScaledVector(n,.85);
    B.add(S.leaf,frame(c.clone().addScaledVector(d,f.r*.15),d.clone().multiplyScalar(-1).addScaledVector(n,.3),dd,f.r*.9),11);}
  return c;}
export function build({head,wm},open=false){
  const g=new THREE.Group();head.add(g);palTex=palTex||Object.assign(new THREE.CanvasTexture(palette()),{colorSpace:THREE.SRGBColorSpace});
  const palM=new THREE.MeshStandardMaterial({map:palTex,roughness:.85,side:THREE.DoubleSide}),
    glowM=new THREE.MeshStandardMaterial({map:palTex,roughness:.8,side:THREE.DoubleSide,emissive:0xffe2b0,emissiveIntensity:.3}), // 꽃 몇 송이: 은은하게 빛남
    gemM=new THREE.MeshStandardMaterial({map:palTex,roughness:.4,side:THREE.DoubleSide,emissive:0xffdf86,emissiveIntensity:.75}); // 별꽃 보석
  const S=shapes(),{F,T,L}=layout(),W=new Batch();
  // 고리: 갈색 덩굴 + 감는 가는 올리브 덩굴
  {const N=64,P=[],Q=[];for(let i=0;i<N;i++){const a=i/N*PI*2;P.push(at(a));const w=a*9;Q.push(at(a,.026*Math.cos(w),.026*Math.sin(w)));}
   W.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P,true),80,.032,6,true),new THREE.Matrix4(),0);
   W.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Q,true),120,.009,3,true),new THREE.Matrix4(),1);}
  // 잎: 덩굴을 따라 누운 올리브빛 잎(앞뒤로 엇갈려 바깥·위로)
  for(const l of L){const d=TAN(l.a).multiplyScalar(l.s).addScaledVector(OUT(l.a),l.o).addScaledVector(UPV,l.u),n=OUT(l.a).multiplyScalar(.7).addScaledVector(UPV,.7);
    W.add(S.leaf,frame(at(l.a,.03,.012),n,d,l.len),l.col);} // 잎끝이 꽃 사이로 바깥에 삐죽 나오게
  // 작은 알봉오리(연두·분홍·크림)
  for(const b of T)W.add(S.ball,new THREE.Matrix4().makeScale(b.r,b.r*1.2,b.r).setPosition(at(b.a,b.dr,b.dy)),b.col);
  // 앞 가운데 꽃받침 자리(작은 컵 — 핀 화관에서 보석이 들어간다)
  const slotP=at(0,.012,.03),slotN=OUT(0).multiplyScalar(.45).addScaledVector(UPV,.9);
  W.add(lathe([[0,-.3],[.6,-.15],[.9,.35],[1,.75],[.8,.8],[.55,.35],[0,.2]].map(q=>new THREE.Vector2(q[0],q[1])),8),frame(slotP,slotN,TAN(0),.034),14);
  if(!open){for(const f of F)budInto(W,f,S);g.add(wm(W.geo(),palM));g.userData.flowers=[];return {g,profile:null,top:.13};}
  g.add(wm(W.geo(),palM));
  // 핀 화관: 8조각 — 조각마다 봉오리(피기 전, 평소엔 숨김)·꽃·빛나는 꽃 덩어리, 피어나기 때 조각 가운데를 축으로 커진다
  const secs=[];for(let k=0;k<8;k++){const a0=-PI+k/8*PI*2,fs=F.filter(f=>f.a>=a0&&f.a<a0+PI/4);if(!fs.length)continue;
    const o=new THREE.Vector3();fs.forEach(f=>o.add(at(f.a,f.dr,f.dy)));o.divideScalar(fs.length);
    const Bb=new Batch(),Bf=new Batch(),Bg=new Batch();fs.forEach(f=>{budInto(Bb,f,S);flowerInto(f.glow?Bg:Bf,f,S);});
    const s={d:Math.abs(a0+PI/8)/PI,parts:[]},mk=(B,m,kind)=>{if(B.empty)return;const piv=new THREE.Group();piv.position.copy(o);g.add(piv);piv.add(wm(B.geo(o),m));s.parts.push({piv,kind});};
    mk(Bb,palM,'bud');mk(Bf,palM,'flower');mk(Bg,glowM,'flower');secs.push(s);}
  secs.forEach(s=>s.parts.forEach(p=>p.piv.visible=p.kind==='flower'));g.userData.flowers=secs;
  // 별꽃 보석: 꽃받침 자리에 작게(꽃 사이에 묻혀 살짝)
  {const sh=new THREE.Shape();for(let i=0;i<10;i++){const a=i/10*PI*2+PI/2,rr=i%2?.42:1,x=Math.cos(a)*rr,y=Math.sin(a)*rr;i?sh.lineTo(x,y):sh.moveTo(x,y);}sh.closePath();
   const sg=new THREE.ExtrudeGeometry(sh,{depth:.35,bevelEnabled:true,bevelSize:.14,bevelThickness:.14,bevelSegments:1}).translate(0,0,-.17);
   const uv=sg.attributes.uv;for(let k=0;k<uv.count;k++)uv.setXY(k,.5,.6);
   const B=new Batch();B.add(sg,new THREE.Matrix4(),13);const piv=new THREE.Group();piv.position.copy(slotP).addScaledVector(slotN,.026);g.add(piv);
   const gem=wm(B.geo(),gemM);gem.scale.setScalar(.036);gem.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),slotN.clone().add(OUT(0)).normalize());piv.add(gem);g.userData.gem=piv;}
  return {g,profile:null,top:.13};}
/* 피어나기: u 0→1 — 별꽃 보석이 꽃받침에 쏙(위에서 내려와 통 커짐) → 앞에서부터 조각마다 봉오리가 줄고 꽃이 퐁 */
export function animate(g,u){const ease=x=>{x=Math.min(1,Math.max(0,x));const c=1.6;x-=1;return 1+(c+1)*x*x*x+c*x*x;},sm=x=>{x=Math.min(1,Math.max(0,x));return x*x*(3-2*x);};
  const gem=g.userData.gem;if(gem){gem.position.y=at(0,.012,.03).y+.18*(1-sm(u/.28));gem.scale.setScalar(Math.max(.001,ease(u/.3)));}
  for(const s of g.userData.flowers||[]){const k=(u-.28-s.d*.4)/.3;
    for(const p of s.parts){if(p.kind==='bud'){p.piv.visible=k<.45;p.piv.scale.setScalar(Math.max(.001,1-sm(k/.45)));}
      else{p.piv.visible=k>0;p.piv.scale.setScalar(Math.max(.001,ease(k)));}}}}
/* 별가루 (핀 화관을 쓰는 동안, 기준 crown-sparkle-ref.png): 아주 작은 빛 알갱이 + 작은 네 갈래 반짝이(✦).
   반짝이는 짧게 커졌다 작아지며 깜빡이고, 알갱이는 은은하게. 금빛·따뜻한 크림 위주에 분홍·연민트 조금, 더하기 섞기(겹치면 밝아짐).
   화관 둘레에서 나와 고리를 따라 한쪽으로 흐르며 바깥·위로 천천히 떠올라 사라진다(얼굴 앞 ±40°에서는 나오지 않음). 월드 좌표라 움직이면 뒤로 꼬리처럼.
   낮에도 보이게 반짝이를 또렷하게, 해 질 녘·밤(U.nightK, 08이 하늘 시간에서 넣음)에는 더 크고 밝게. 점 하나에 모양 값 — 드로우콜 1.
   휴대폰 72개 · 컴퓨터 150개 */
let dust=null;
function makeDust(){const N=QUALITY.tier==='mobile'?72:150,geo=new THREE.BufferGeometry();
  const pos=new Float32Array(N*3),col=new Float32Array(N*3),sz=new Float32Array(N),al=new Float32Array(N),sh=new Float32Array(N);
  for(const [k,a,n] of [['position',pos,3],['color',col,3],['aSize',sz,1],['aAlpha',al,1],['aShape',sh,1]])geo.setAttribute(k,new THREE.BufferAttribute(a,n).setUsage(THREE.DynamicDrawUsage));
  const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uScale:{value:500},uBright:{value:1}},vertexColors:true,
    vertexShader:`#include <common>
      attribute float aSize;attribute float aAlpha;attribute float aShape;uniform float uScale;varying vec3 vC;varying float vA;varying float vS;
      void main(){vC=color;vA=aAlpha;vS=aShape;vec4 mv=wlBend.x>0.?viewMatrix*wlBent(modelMatrix*vec4(position,1.)):modelViewMatrix*vec4(position,1.); /* 둥근 땅(game/bend)도 같은 만큼 */gl_PointSize=max(1.5,aSize*uScale/-mv.z);gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`uniform float uBright;varying vec3 vC;varying float vA;varying float vS;
      void main(){vec2 p=gl_PointCoord*2.-1.;float r=length(p),a;
        if(vS>.5){vec2 q=abs(p);a=(1.-q.y)*exp(-q.x*13.)+(1.-q.x)*exp(-q.y*13.);a=a*.85+exp(-r*r*22.)*1.1;a*=1.-smoothstep(.75,1.,r);} // 네 갈래 반짝이 ✦
        else{a=exp(-r*r*9.);a*=1.-smoothstep(.6,1.,r);} // 작은 빛 알갱이
        a*=vA;if(a<.004)discard;gl_FragColor=vec4(mix(vC,vec3(1.),clamp(a-.6,0.,1.)*.6)*uBright,min(1.,a));}`});
  mat.vertexColors=true;const pts=new THREE.Points(geo,mat);pts.frustumCulled=false;pts.renderOrder=4;pts.visible=false;scene.add(pts);
  const _s=new THREE.Vector2();pts.onBeforeRender=(r,sc,cam)=>{mat.uniforms.uScale.value=r.getDrawingBufferSize(_s).y*cam.projectionMatrix.elements[5]/2;}; // 점 크기(m) → 화소: 그리는 크기·시야에서 바로(캔버스를 찾아 읽던 값이 틀려 별가루가 작게 나왔다)
  const P=[...Array(N)].map((_,i)=>({life:0,age:1+i*.05,x:0,y:0,z:0,vx:0,vy:0,vz:0}));
  const COLS=[[1,.8,.42],[1,.86,.5],[1,.93,.74],[1,.95,.82],[1,.7,.78],[.72,1,.86]];let seed=7;const R=()=>(seed=(seed*16807)%2147483647)/2147483647;
  return {pts,geo,mat,P,N,COLS,R,pos,col,sz,al,sh};}
const _v=new THREE.Vector3();
export function tick(g,dt,t,U,on){if(!dust){if(!on)return;dust=makeDust();}const D=dust;D.pts.visible=on||D.P.some(p=>p.age<p.life);if(!D.pts.visible)return;
  const night=Math.min(1,Math.max(0,U.nightK||0));D.mat.uniforms.uBright.value=1.5-.2*night; // 낮에는 밝은 풀 위라 더하기 섞기가 묻혀서 더 밝게
  g.updateWorldMatrix(true,false);
  D.P.forEach((p,i)=>{p.age+=dt;if(p.age>=p.life){if(!on){D.al[i]=0;return;}
      let a;do{a=(D.R()*2-1)*PI;}while(Math.abs(a)<.7);
      const stay=D.R()<.25; // 넷 중 하나는 화관 꽃 위에 앉은 채 반짝인다
      _v.copy(at(a,.02+D.R()*.16,.02+D.R()*.14)).applyMatrix4(g.matrixWorld);p.x=_v.x;p.y=_v.y;p.z=_v.z;
      const tg=TAN(a).multiplyScalar(-.14-D.R()*.1).addScaledVector(OUT(a),.05+D.R()*.05).transformDirection(g.matrixWorld).multiplyScalar(stay?.0:.17); // 고리를 따라 한쪽으로 흐르며 바깥으로
      p.vx=tg.x;p.vz=tg.z;p.vy=stay?.01:.07+D.R()*.1;
      p.life=stay?.9+D.R()*.8:2+D.R()*1.8;p.age=0;p.shape=stay||D.R()<.35?1:0;p.size=p.shape?.09+D.R()*.07:.026+D.R()*.022;
      const z=D.R(),c=D.COLS[z<.3?0:z<.5?1:z<.68?2:z<.82?3:z<.92?4:5];D.col.set(c,i*3);p.ph=D.R()*7;p.w=5+D.R()*5;}
    p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;const dm=1-.5*dt;p.vx*=dm;p.vz*=dm;p.vy*=1-.15*dt;const u=p.age/p.life,fade=(u<.12?u/.12:1)*(1-Math.pow(u,2.2));
    let s=1,b=1;if(p.shape){const f=Math.pow(Math.max(0,Math.sin(t*p.w+p.ph)),5);s=.3+.85*f;b=.35+.75*f;}else b=.7+.3*Math.sin(t*3+p.ph); // 반짝이: 짧게 커졌다 작아지며 깜빡 · 알갱이: 은은하게
    D.pos.set([p.x,p.y,p.z],i*3);D.sz[i]=p.size*s*(1+.3*night);D.al[i]=fade*b*(1+.3*night);D.sh[i]=p.shape;});
  for(const k of ['position','color','aSize','aAlpha','aShape'])D.geo.attributes[k].needsUpdate=true;}
// 06 HOODS에 넣는 두 모습: {key:'crown',mod:CROWN}, {key:'crownBloom',mod:CROWN_BLOOM} — morphHood('crownBloom')이면 animate가 보석·피어나기를 그리고, 그 뒤로 tick이 별가루
export const CROWN={build:o=>build(o,false)};
export const CROWN_BLOOM={build:o=>build(o,true),animate,tick};
