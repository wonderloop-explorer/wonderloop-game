/* 요정의 숲 — 깊은 숲 배경 (어느 방향을 봐도 '숲 안'으로 보이게, 2026-11-01)
   deepForest({root, cx, cz, gaps}) → {group, update(camera, SK)}
   · 둘레 벽(13~19m) 뒤에 풀줄기·클로버·둥근 잎·꽃줄기 실루엣을 그린 판을 네 겹(21·26·31·36m) 원통으로 두른다.
     멀수록 키가 크고 진하고 푸른 녹색, 안개가 더 덮는다. 색연필 결은 실루엣 안에만(캔버스, 이름 시드 rng('fairy-forest:…')라 늘 같은 그림).
     판은 알파 잘라내기(반투명 섞기 없음) + 툰 음영. 법선을 위쪽으로 기울여 해 방향에 따라 한쪽만 시커멓게 되지 않게 했다.
     먼 두 겹은 카메라를 조금씩 따라온다(0.45·0.75) — 카메라가 구역 끝에 가도 판이 먼 거리 밖으로 잘리지 않고, 겹 사이에 깊이감(시차)이 남는다.
   · 머리 위: 큰 잎 실루엣 판(높이 15~21m)을 겹쳐 하늘을 거의 덮고, 틈으로만 하늘빛이 보인다.
   · 빛줄기: 겹 사이로 내려오는 희미한 빛 다섯 줄기(십자 판 한 묶음, 더하기 섞기). 낮 따뜻한 빛 · 해 질 녘 복숭아빛 · 밤 푸른 달빛으로 약하게(SK.t).
   · gaps: 비워 둘 방향(라디안, 중심에서 본 각) — 별꽃 전망대 꽃봉오리가 보이는 북쪽 틈. 가까운 두 겹만 비운다.
   그리기: 겹마다 1회 + 머리 위 1회 + 빛줄기 1회 = 6회. 그림자를 드리우지 않는다. 휴대폰 단계도 같은 모습(텍스처만 조금 작게). */
import * as THREE from 'three';
import {QUALITY,rng} from '../../01-textures.js';
import {CRAYON,toon} from './paint.js';
const MOB=!QUALITY.shadows;
/* 실루엣 판 그림: 바닥은 덤불로 꽉 채우고, 위로 풀잎·클로버·둥근 잎·꽃줄기. 좌우 끝이 이어지게(반복) 양옆에도 같이 그린다 */
function layerTex(name,{w,h,base,shades,flower,n,tall}){
  const R=rng('fairy-forest:'+name),rr=(a,b)=>a+R()*(b-a),pick=a=>a[Math.floor(R()*a.length)];
  const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.fillStyle=base;g.strokeStyle=base;g.lineCap='round';
  const wrap=f=>{for(const o of [-w,0,w]){g.save();g.translate(o,0);f();g.restore();}};
  // 바닥 덤불: 둥근 언덕을 촘촘히
  for(let i=0;i<40;i++){const x=rr(0,w),r=rr(h*.06,h*.14),y=h-rr(h*.1,h*.2);wrap(()=>{g.beginPath();g.arc(x,y,r,0,7);g.fill();});}
  g.fillRect(0,h*.84,w,h*.16);
  const heart=(x,y,s,a)=>{g.save();g.translate(x,y);g.rotate(a);g.beginPath();g.moveTo(0,0);g.bezierCurveTo(-.55*s,-.25*s,-.62*s,-.9*s,-.28*s,-s);g.bezierCurveTo(-.1*s,-1.04*s,0,-.9*s,0,-.8*s);
    g.bezierCurveTo(0,-.9*s,.1*s,-1.04*s,.28*s,-s);g.bezierCurveTo(.62*s,-.9*s,.55*s,-.25*s,0,0);g.fill();g.restore();};
  for(let i=0;i<n;i++){const x=rr(0,w),k=R(),top=h*(1-rr(tall[0],tall[1]));
    if(k<.42){const bw=rr(w*.008,w*.018),lean=rr(-w*.05,w*.05); // 풀잎: 아래가 넓고 끝이 뾰족하게 휜다
      wrap(()=>{g.beginPath();g.moveTo(x-bw,h);g.quadraticCurveTo(x-bw*.6+lean*.3,(h+top)/2,x+lean,top);g.quadraticCurveTo(x+bw*.6+lean*.3,(h+top)/2,x+bw,h);g.fill();});}
    else if(k<.62){const s=rr(h*.07,h*.13),lw=rr(2,4)*w/1024; // 클로버: 줄기 + 하트 잎 셋
      wrap(()=>{g.lineWidth=lw*3;g.beginPath();g.moveTo(x,h);g.quadraticCurveTo(x+s*.3,(h+top)/2,x,top);g.stroke();for(let j=0;j<3;j++)heart(x,top,s,(j-1)*2.1+rr(-.2,.2));});}
    else if(k<.82){const s=rr(h*.08,h*.15),a=rr(-.9,.9); // 둥근 잎(연잎처럼 기운)
      wrap(()=>{g.lineWidth=5*w/1024;g.beginPath();g.moveTo(x,h);g.quadraticCurveTo(x-a*s*.4,(h+top)/2,x,top);g.stroke();g.save();g.translate(x,top);g.rotate(a);g.beginPath();g.ellipse(0,-s*.35,s,s*.42,0,0,7);g.fill();g.restore();});}
    else{const s=rr(h*.025,h*.045); // 꽃줄기: 가는 줄기 + 꽃송이(밝은 색)
      wrap(()=>{g.lineWidth=3*w/1024;g.beginPath();g.moveTo(x,h);g.quadraticCurveTo(x+rr(-20,20),(h+top)/2,x,top);g.stroke();g.save();g.fillStyle=flower;g.beginPath();
        for(let p=0;p<6;p++){const a=p/6*Math.PI*2;g.ellipse(x+Math.cos(a)*s*.7,top+Math.sin(a)*s*.7,s*.55,s*.32,a,0,7);}g.fill();g.restore();});}}
  // 색연필 결: 실루엣 안에만 짧은 획(위아래로 긴 결)
  g.globalCompositeOperation='source-atop';
  for(let i=0;i<n*14;i++){const x=rr(0,w),y=rr(0,h),len=rr(8,30)*w/1024,a=Math.PI/2+rr(-.5,.5);g.globalAlpha=rr(.08,.24);g.strokeStyle=pick(shades);g.lineWidth=rr(1.5,5)*w/1024;
    g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*len,y+Math.sin(a)*len);g.stroke();}
  // 아래로 갈수록 살짝 어둡게(덤불 그늘)
  g.globalAlpha=1;const gr=g.createLinearGradient(0,h*.55,0,h);gr.addColorStop(0,'rgba(20,40,30,0)');gr.addColorStop(1,'rgba(20,40,30,.28)');g.fillStyle=gr;g.fillRect(0,0,w,h);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=THREE.RepeatWrapping;t.anisotropy=4;return t;}
/* 원통 띠: 반지름 r, 높이 H, 텍스처를 reps번 둘러 감는다. gaps 방향은 비운다 */
function ring(r,H,reps,seg,gaps,gw){const pos=[],nor=[],uv=[],idx=[];let v=0;
  for(let i=0;i<seg;i++){const a0=i/seg*Math.PI*2,a1=(i+1)/seg*Math.PI*2,am=(a0+a1)/2;
    if(gaps.some(gp=>Math.abs(Math.atan2(Math.sin(am-gp),Math.cos(am-gp)))<gw))continue;
    for(const [a,u] of [[a0,i/seg*reps],[a1,(i+1)/seg*reps]]){const x=Math.cos(a)*r,z=Math.sin(a)*r,n=new THREE.Vector3(-Math.cos(a)*.45,1,-Math.sin(a)*.45).normalize();
      pos.push(x,0,z,x,H,z);nor.push(n.x,n.y,n.z,n.x,n.y,n.z);uv.push(u,0,u,1);}
    idx.push(v,v+2,v+1,v+1,v+2,v+3);v+=4;}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);return g;}
const LAYERS=[ // 반지름·높이·감는 횟수·따라오기·색 — 멀수록 높고 진하고 푸르다
  {r:21,H:12,reps:7,follow:0,base:'#78ad55',shades:['#94c56a','#5f9447','#a9d27c','#6aa04c'],flower:'#f6d9e2',n:120,tall:[.45,.95]},
  {r:26,H:15.5,reps:7,follow:0,base:'#5e9550',shades:['#76aa5f','#4b7f44','#86b86c'],flower:'#e9d2ea',n:110,tall:[.5,.98]},
  {r:31,H:19,reps:6,follow:.45,base:'#4b8356',shades:['#5d9566','#3e7149','#6aa070'],flower:'#cfd9ea',n:100,tall:[.55,.98]},
  {r:36,H:23,reps:6,follow:.75,base:'#3f7461',shades:['#4f8670','#335f52','#5a8f7a'],flower:'#bccfe0',n:90,tall:[.6,.99]}];
function canopyTex(){const R=rng('fairy-forest:canopy'),rr=(a,b)=>a+R()*(b-a),S=MOB?512:1024,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d');
  g.fillStyle='#5d8f45';for(let i=0;i<9;i++){const x=rr(S*.15,S*.85),y=rr(S*.15,S*.85),s=rr(S*.18,S*.3),a=rr(0,7);g.save();g.translate(x,y);g.rotate(a);g.beginPath();g.ellipse(0,0,s,s*.62,0,0,7);g.fill();g.restore();}
  g.globalCompositeOperation='source-atop';for(let i=0;i<1600;i++){g.globalAlpha=rr(.08,.22);g.strokeStyle=['#79a95a','#4c7c3a','#8ab866','#6a9a4e'][i%4];g.lineWidth=rr(2,7)*S/1024;
    const x=rr(0,S),y=rr(0,S),a=rr(0,7),l=rr(10,40)*S/1024;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);g.stroke();}
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
function shaftTex(){const c=document.createElement('canvas');c.width=64;c.height=256;const g=c.getContext('2d');
  const v=g.createLinearGradient(0,0,0,256);v.addColorStop(0,'rgba(255,255,255,0)');v.addColorStop(.18,'rgba(255,255,255,.85)');v.addColorStop(.7,'rgba(255,255,255,.35)');v.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=v;g.fillRect(0,0,64,256);g.globalCompositeOperation='destination-in';const hz=g.createLinearGradient(0,0,64,0);hz.addColorStop(0,'rgba(0,0,0,0)');hz.addColorStop(.5,'rgba(0,0,0,1)');hz.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=hz;g.fillRect(0,0,64,256);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
const SHAFT_C=[new THREE.Color('#fff0c4'),new THREE.Color('#ffc7a6'),new THREE.Color('#9fb4ff')],SHAFT_O=[.3,.22,.09];
export function deepForest({root,cx=0,cz=0,gaps=[]}){
  const group=new THREE.Group();group.name='deepForest';group.position.set(cx,0,cz);root.add(group);const mats=[],movers=[];
  LAYERS.forEach((L,i)=>{const w=MOB&&i>1?512:1024,tex=layerTex('layer'+i,{w,h:w/2,...L});
    const m=toon('#ffffff',{map:tex,side:THREE.DoubleSide});m.alphaTest=.5;mats.push(m);
    const mesh=new THREE.Mesh(ring(L.r,L.H,L.reps,48,i<2?gaps:[],.17),m);mesh.castShadow=mesh.receiveShadow=false;mesh.userData.noMerge=true;
    const holder=new THREE.Group();holder.add(mesh);group.add(holder);if(L.follow)movers.push({holder,k:L.follow});});
  // 머리 위 큰 잎: 높이 15~21m, 하늘을 거의 덮고 틈으로만 빛
  {const R=rng('fairy-forest:roof'),rr=(a,b)=>a+R()*(b-a),geos=[];
   for(let i=0;i<16;i++){const a=i/16*Math.PI*2+rr(-.2,.2),d=i%2?rr(8,18):rr(20,32),s=rr(16,24),p=new THREE.PlaneGeometry(s,s).rotateX(Math.PI/2+rr(-.25,.25)).rotateY(rr(0,7)).translate(Math.cos(a)*d,rr(15,21),Math.sin(a)*d);geos.push(p);}
   const g=new THREE.BufferGeometry();{const P=[],N=[],U=[],I=[];let o=0;geos.forEach(q=>{const pa=q.attributes.position,ua=q.attributes.uv;for(let k=0;k<pa.count;k++){P.push(pa.getX(k),pa.getY(k),pa.getZ(k));N.push(0,-1,0);U.push(ua.getX(k),ua.getY(k));}
     q.index.array.forEach(ix=>I.push(ix+o));o+=pa.count;});g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.setIndex(I);}
   const m=toon('#ffffff',{map:canopyTex(),side:THREE.DoubleSide});m.alphaTest=.5;const mesh=new THREE.Mesh(g,m);mesh.castShadow=mesh.receiveShadow=false;mesh.userData.noMerge=true;group.add(mesh);mats.push(m);}
  // 빛줄기: 겹 사이로 비스듬히 내려오는 다섯 줄기(십자 판)
  const shaftMat=new THREE.MeshBasicMaterial({map:shaftTex(),transparent:true,opacity:.3,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,color:SHAFT_C[0]});
  {const R=rng('fairy-forest:shaft'),rr=(a,b)=>a+R()*(b-a),geos=[];
   [[.6,17],[1.9,23],[2.9,15],[4.1,22],[5.3,18]].forEach(([a,d])=>{const H=rr(14,18),W=rr(2.2,3.6),tilt=rr(.15,.3),ry=rr(0,7);
     for(const k of [0,Math.PI/2]){geos.push(new THREE.PlaneGeometry(W,H).translate(0,H/2,0).rotateZ(tilt).rotateY(ry+k).translate(Math.cos(a)*d,0,Math.sin(a)*d));}});
   const P=[],U=[],I=[];let o=0;geos.forEach(q=>{const pa=q.attributes.position,ua=q.attributes.uv;for(let k=0;k<pa.count;k++){P.push(pa.getX(k),pa.getY(k),pa.getZ(k));U.push(ua.getX(k),ua.getY(k));}q.index.array.forEach(ix=>I.push(ix+o));o+=pa.count;});
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.setIndex(I);
   const mesh=new THREE.Mesh(g,shaftMat);mesh.renderOrder=3;mesh.userData.noMerge=true;group.add(mesh);}
  const _c=new THREE.Color(),ss=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x);};
  return {group,
    update(camera,SK){if(camera)movers.forEach(o=>o.holder.position.set((camera.position.x-cx)*o.k,0,(camera.position.z-cz)*o.k));
      const t=SK?SK.t:0,i=Math.min(1,Math.floor(t)),u=ss(0,1,t-i);_c.copy(SHAFT_C[i]).lerp(SHAFT_C[i+1],u);shaftMat.color.copy(_c);shaftMat.opacity=SHAFT_O[i]+(SHAFT_O[i+1]-SHAFT_O[i])*u;},
    dispose(){mats.forEach(m=>{if(m.map&&m.map!==CRAYON())m.map.dispose();});shaftMat.map.dispose();}};}
