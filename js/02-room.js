/* 원더룹 베이스캠프 — 베이스캠프 방과 소품 */
import * as THREE from 'three';
import {B,C,M,PI,R,UP,add,aoPlane,blob,boxAt,cylAt,cylBetween,group,lin,rnd,scene,shade,skyTex} from './01-textures.js';
/* ---------- 방 ---------- */
// 바닥
add(new THREE.PlaneGeometry(10,10),M('#e6bd92','planks',{rep:[2.5,2.5]}),0,0,0,{rx:-PI/2,cast:false,line:false});
boxAt(10.4,0.5,10.4,M('#a9764b','wood'),0,-0.52,0,{cast:false});
// 벽
const plaster=M('#f5e6c9','plaster',{rep:[3,2]});
boxAt(10.4,5.6,0.3,plaster,0,0,-5.15,{cast:false});
boxAt(0.3,5.6,10.4,plaster,-5.15,0,0,{cast:false});
const beamMat=M('#a97a52','wood');
boxAt(10.7,0.25,0.5,beamMat,0,5.6,-5.15,{cast:false});
boxAt(0.48,0.27,10.7,beamMat,-5.15,5.6,0,{cast:false});
// 징두리 판벽
const wains=M('#bfdccf','boards',{rep:[6,1]});
boxAt(10,1.2,0.06,wains,0,0,-4.97,{cast:false});
boxAt(0.06,1.2,10,M('#bfdccf','boards',{rep:[6,1]}),-4.97,0,0,{cast:false});
boxAt(10,0.08,0.12,beamMat,0,1.2,-4.95,{cast:false});
boxAt(0.12,0.09,10,beamMat,-4.95,1.2,0,{cast:false});
// 기둥·가로보
[[-4.82,-4.82],[-1.35,-4.88],[2.45,-4.88]].forEach(p=>boxAt(p[0]===-4.82?0.34:0.26,5.6,0.24,beamMat,p[0],0,p[1],{cast:false}));
[0.2,2.6].forEach(z=>boxAt(0.24,5.6,0.26,beamMat,-4.88,0,z,{cast:false}));
boxAt(10,0.2,0.14,beamMat,0,4.6,-4.93,{cast:false});
boxAt(0.14,0.2,10,beamMat,-4.93,4.6,0,{cast:false});
// AO
aoPlane(10,0.9,g=>g.rotateX(-PI/2),[0,0.015,-4.5],0.35);
aoPlane(10,0.9,g=>{g.rotateX(-PI/2);g.rotateY(PI/2);},[-4.5,0.016,0],0.35);
aoPlane(10,0.7,g=>g.rotateZ(PI),[0,0.35,-4.93],0.22);
aoPlane(10,0.7,g=>{g.rotateZ(PI);g.rotateY(PI/2);},[-4.93,0.35,0],0.22);

/* ---------- 창문 ---------- */
const WX=0.8,WY=3.0,WZ=-4.97;
const skyDay=new THREE.MeshBasicMaterial({map:skyTex(false)});
const skyNight=new THREE.MeshBasicMaterial({map:skyTex(true),transparent:true,opacity:0});
add(new THREE.CircleGeometry(0.9,24),skyDay,WX,WY,WZ,{cast:false,line:false});
add(new THREE.CircleGeometry(0.9,24),skyNight,WX,WY,WZ+0.005,{cast:false,line:false});
const frameMat=M('#b88457','wood');
add(new THREE.TorusGeometry(0.95,0.09,6,22),frameMat,WX,WY,WZ+0.04,{thr:60});
boxAt(0.06,1.8,0.06,frameMat,WX,WY-0.9,WZ+0.04);boxAt(1.8,0.06,0.06,frameMat,WX,WY-0.03,WZ+0.04);
boxAt(2.3,0.12,0.38,frameMat,WX,1.9,-4.8);
// 창틀 화분
cylAt(0.12,0.09,0.2,M('#e48d6a','plain'),WX+0.65,2.02,-4.8);
for(let k=0;k<5;k++){add(new THREE.ConeGeometry(0.06,0.32,4),M('#7fb86a','plain'),WX+0.65+Math.cos(k*1.3)*0.05,2.36,-4.8+Math.sin(k*1.3)*0.05,{rz:Math.cos(k*1.3)*0.4,rx:Math.sin(k*1.3)*0.4,thr:40});}
cylAt(0.07,0.07,0.16,M('#cfeaf2','plain',{opacity:0.55}),WX-0.7,2.02,-4.78,{line:false});
// 커튼
boxAt(2.9,0.06,0.06,M('#8a6a4c','wood'),WX,4.05,-4.86);
const curtain=M('#f3b9a6','stripes',{stripes:['#f3b9a6','#fbe3d4'],n:6});
[-1.25,1.25].forEach((dx,i)=>{for(let k=0;k<3;k++)boxAt(0.17,2.25,0.1,curtain,WX+dx+(k-1)*0.15*(i?1:-1)*0.9,1.8,-4.82+(k%2)*0.05,{rz:(i?-1:1)*0.025*k});});
// 햇빛 기둥
const sunDir=new THREE.Vector3(3,-12,12).normalize();
const beamLen=4.4;
const beamTex=(()=>{const cv=document.createElement('canvas');cv.width=8;cv.height=128;const g=cv.getContext('2d');const gr=g.createLinearGradient(0,0,0,128);gr.addColorStop(0,'rgba(255,255,255,0.9)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,8,128);return new THREE.CanvasTexture(cv);})();
const beamMat2=new THREE.MeshBasicMaterial({map:beamTex,color:0xffe3a8,transparent:true,opacity:0.22,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
const beam=new THREE.Mesh(new THREE.CylinderGeometry(0.82,1.05,beamLen,20,1,true),beamMat2);
const beamStart=new THREE.Vector3(WX,WY,WZ+0.05);
beam.position.copy(beamStart.clone().add(sunDir.clone().multiplyScalar(beamLen/2)));
beam.quaternion.setFromUnitVectors(UP,sunDir.clone().negate());
scene.add(beam);
// 먼지
const DUST=110;const dustGeo=new THREE.BufferGeometry();const dustPos=new Float32Array(DUST*3);const dustSeed=[];
const perpA=new THREE.Vector3().crossVectors(sunDir,new THREE.Vector3(1,0,0)).normalize();const perpB=new THREE.Vector3().crossVectors(sunDir,perpA).normalize();
for(let i=0;i<DUST;i++)dustSeed.push({t:R(),a:rnd(0,PI*2),r:Math.sqrt(R())*0.8,sp:rnd(0.01,0.03),ph:rnd(0,9)});
dustGeo.setAttribute('position',new THREE.BufferAttribute(dustPos,3));
const dotTex=(()=>{const cv=document.createElement('canvas');cv.width=cv.height=32;const g=cv.getContext('2d');const gr=g.createRadialGradient(16,16,0,16,16,16);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,32,32);return new THREE.CanvasTexture(cv);})();
const dustMat=new THREE.PointsMaterial({size:0.07,map:dotTex,color:0xfff2cc,transparent:true,opacity:0.85,depthWrite:false,blending:THREE.AdditiveBlending});
scene.add(new THREE.Points(dustGeo,dustMat));

/* ---------- 책상 세트 ---------- */
const deskMat=M('#c88f5e','wood');
const DX=0.8,DZ=-4.25,DT=1.16;
boxAt(2.6,0.12,1.2,deskMat,DX,1.04,DZ);
[[-1.2,-0.5],[1.2,-0.5],[-1.2,0.5],[1.2,0.5]].forEach(p=>boxAt(0.12,1.04,0.12,deskMat,DX+p[0],0,DZ+p[1]));
boxAt(0.95,0.38,1.0,M('#d7a274','wood'),DX+0.7,0.62,DZ);
add(new THREE.IcosahedronGeometry(0.05,0),M('#e3c27a','plain'),DX+0.7,0.81,DZ+0.52);
boxAt(2.4,0.06,0.06,deskMat,DX,0.3,DZ+0.45);
// 지도
add(new THREE.PlaneGeometry(1.25,0.85),M('#f3e1b9','map',{size:512}),0.75,DT+0.006,-4.2,{rx:-PI/2,rz:0.12,cast:false,line:false});
// 돋보기 (원더룹 = 루페!)
const brass=M('#d8b36a','plain');
add(new THREE.TorusGeometry(0.14,0.025,6,18),brass,0.5,DT+0.03,-4.12,{rx:-PI/2,thr:60});
add(new THREE.CircleGeometry(0.14,18),new THREE.MeshStandardMaterial({color:lin('#d9f1ff'),transparent:true,opacity:0.45,roughness:0.2}),0.5,DT+0.03,-4.12,{rx:-PI/2,line:false,cast:false});
add(C(0.025,0.03,0.3,6),M('#7a4e34','wood'),0.72,DT+0.03,-3.93,{rz:PI/2,ry:-0.75,thr:50});
// 나침반
cylAt(0.15,0.15,0.05,brass,1.62,DT,-3.95);
add(new THREE.CircleGeometry(0.12,16),M('#fbf1dc','plain'),1.62,DT+0.052,-3.95,{rx:-PI/2,line:false,cast:false});
boxAt(0.02,0.012,0.2,M('#d45d5a','plain'),1.62,DT+0.055,-3.95,{ry:0.5,line:false});
// 연필통
cylAt(0.11,0.1,0.26,M('#6fc0b3','plain'),1.92,DT,-4.6);
[['#f2c14e',0.1,-0.04],['#e2725b',-0.05,0.04],['#8fb6e0',0.02,0.06]].forEach((p,i)=>{
  const g=group(1.92+p[1]*0.6,DT+0.2,-4.6+p[2],0);g.rotation.z=p[1]*1.4;g.rotation.x=p[2]*2;
  add(C(0.018,0.018,0.36,6),M(p[0],'plain'),0,0.18,0,{parent:g,thr:60});
  add(new THREE.ConeGeometry(0.018,0.06,6),M('#f2d7b0','plain'),0,0.39,0,{parent:g,thr:60});
});
// 책 더미
[['#7c9fcf',0.5,0.34,0.09],['#e8a39a',0.46,0.3,0.08],['#a8cf8e',0.42,0.32,0.07]].reduce((y,b,i)=>{boxAt(b[1],b[3],b[2],M(b[0],'plain'),-0.18,y,-4.52,{ry:(i-1)*0.15});return y+b[3];},DT);
// 머그 + 김
cylAt(0.1,0.09,0.18,M('#fbe9cf','plain'),-0.12,DT,-3.9);
add(new THREE.TorusGeometry(0.06,0.015,5,10,PI),M('#fbe9cf','plain'),-0.22,DT+0.09,-3.9,{rz:PI/2,ry:0,thr:60});
add(new THREE.CircleGeometry(0.085,12),M('#a0673f','plain'),-0.12,DT+0.17,-3.9,{rx:-PI/2,line:false,cast:false});
// 펼친 노트
const nb=group(1.45,DT+0.01,-4.55,0.3);
boxAt(0.32,0.02,0.42,M('#fff8ea','paper'),-0.16,0,0,{parent:nb,rz:0.06});
boxAt(0.32,0.02,0.42,M('#fff8ea','paper'),0.16,0,0,{parent:nb,rz:-0.06});
// 의자
const ch=group(0.7,0,-3.12,0.18);const chairMat=M('#b9855a','wood');
boxAt(0.85,0.09,0.8,chairMat,0,0.68,0,{parent:ch});
[[-0.36,-0.34],[0.36,-0.34],[-0.36,0.34],[0.36,0.34]].forEach(p=>boxAt(0.08,0.68,0.08,chairMat,p[0],0,p[1],{parent:ch}));
[-0.36,0.36].forEach(x=>boxAt(0.08,0.9,0.08,chairMat,x,0.77,0.34,{parent:ch}));
[1.15,1.42].forEach(y=>boxAt(0.8,0.1,0.06,chairMat,0,y,0.34,{parent:ch}));
boxAt(0.74,0.09,0.7,M('#f4c4c0','quilt',{pal:['#f4c4c0','#f8d9cf','#f0b2ae']}),0,0.77,0,{parent:ch});

/* ---------- 망원경 ---------- */
const tg=group(3.05,0,-3.65,0);const tMetal=M('#8b6a4a','wood');
for(let i=0;i<3;i++){const a=i*2*PI/3+0.4;cylBetween([Math.cos(a)*0.55,0,Math.sin(a)*0.55],[0,1.45,0],0.03,tMetal,tg);}
boxAt(0.18,0.12,0.18,brass,0,1.42,0,{parent:tg});
const tubeA=[0.42,1.32,0.15],tubeB=[-0.62,2.05,-0.32];
cylBetween(tubeA,tubeB,0.11,M('#6f8fb8','plain'),tg,10);
cylBetween([tubeB[0]+0.06,tubeB[1]-0.04,tubeB[2]+0.03],[tubeB[0]-0.04,tubeB[1]+0.03,tubeB[2]-0.02],0.14,brass,tg,10);
cylBetween([0.55,1.23,0.2],[0.38,1.35,0.13],0.05,brass,tg,8);
blob(3.05,-3.65,0.7,0.7,0.25);

/* ---------- 벽 선반 ---------- */
const shelfMat=M('#c69468','wood');const SX=-3.0;
[2.3,3.2].forEach(y=>{boxAt(2.5,0.08,0.45,shelfMat,SX,y,-4.76);[-1,1].forEach(s=>boxAt(0.06,0.3,0.3,shelfMat,SX+s*1.0,y-0.3,-4.82));});
// 위 칸: 유리병
[['#f2c14e',-0.95,0.36],['#e8a39a',-0.6,0.28],['#a8cf8e',-0.28,0.4]].forEach(j=>{
  const x=SX+j[1],h=j[2];
  cylAt(0.13,0.13,h,new THREE.MeshStandardMaterial({color:lin('#dff3f0'),transparent:true,opacity:0.4,roughness:0.2,depthWrite:false}),x,3.28,-4.74,{line:false,cast:false});
  cylAt(0.11,0.11,h*0.62,M(j[0],'plain'),x,3.29,-4.74);
  cylAt(0.14,0.14,0.05,M('#b88457','wood'),x,3.28+h,-4.74);
});
// 작은 다육 화분
cylAt(0.13,0.1,0.18,M('#9cc9e0','plain'),SX+0.3,3.28,-4.74);
add(new THREE.IcosahedronGeometry(0.13,0),M('#86c07a','plain'),SX+0.3,3.52,-4.74,{thr:40});
// 두루마리 지도
[0.65,0.85].forEach((dx,i)=>add(C(0.06,0.06,0.5,8),M(i?'#f3e1b9':'#efd3a8','plain'),SX+dx,3.34+i*0.1,-4.72+i*0.05,{rz:PI/2,ry:i*0.3,thr:50}));
// 아래 칸: 책
let bx=SX-1.1;[['#7c9fcf',0.55],['#e7b05a',0.62],['#d77f7a',0.5],['#9ccf9a',0.58],['#b6a0d6',0.52],['#f2d27b',0.6]].forEach((b,i)=>{
  const w=rnd(0.09,0.13);boxAt(w,b[1],0.34,M(b[0],'plain'),bx+w/2,2.38,-4.74,{rz:i===5?-0.3:0});bx+=w+0.012;
});
// 상자
boxAt(0.42,0.26,0.3,M('#e3b98c','crate'),SX+0.5,2.38,-4.74);
// 화석/돌멩이 표본
[[SX+0.95,0.09,'#cfc6b8'],[SX+0.78,0.07,'#e2a27a']].forEach(s=>add(new THREE.IcosahedronGeometry(s[1],0),M(s[2],'plain'),s[0],2.38+s[1],-4.7,{thr:40}));

/* ---------- 빨랫줄 엽서 ---------- */
const lineCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(-4.65,4.32,-4.85),new THREE.Vector3(-3.1,4.12,-4.85),new THREE.Vector3(-1.55,4.32,-4.85)]);
add(new THREE.TubeGeometry(lineCurve,20,0.012,4),M('#8a6a4c','plain'),0,0,0,{line:false,cast:false});
const cards=[['#fff8ea','antsketch'],['#cfe7f2','plain'],['#fde2c4','paper'],['#e7f2d0','plain'],['#fff8ea','paper']];
cards.forEach((c,i)=>{const t=(i+0.6)/cards.length;const p=lineCurve.getPoint(t);
  boxAt(0.42,0.52,0.015,M(c[0],c[1]),p.x,p.y-0.56,p.z+0.02,{rz:rnd(-0.08,0.08),cast:false});
  boxAt(0.06,0.1,0.04,M('#e3c27a','plain'),p.x,p.y-0.08,p.z+0.03,{line:false,cast:false});});
// 말린 잎 다발
[0.08,0.92].forEach(t=>{const p=lineCurve.getPoint(t);for(let k=0;k<4;k++)add(new THREE.ConeGeometry(0.06,0.4,4),M(['#e59a5a','#c9b05a','#9ab86a','#d4795c'][k],'plain'),p.x+(k-1.5)*0.06,p.y-0.25,p.z+0.04,{rx:PI,rz:(k-1.5)*0.15,thr:40,cast:false});});

/* ---------- 코르크 보드 ---------- */
const CBX=3.6,CBY=3.15;
boxAt(1.7,1.2,0.06,M('#d9a86e','cork'),CBX,CBY-0.6,-4.95,{cast:false});
[[0,0.62,1.8,0.08],[0,-0.62,1.8,0.08],[-0.87,0,0.08,1.3],[0.87,0,0.08,1.3]].forEach(f=>boxAt(f[2],f[3],0.09,frameMat,CBX+f[0],CBY+f[1]-f[3]/2,-4.94,{cast:false}));
[[-0.45,0.15,'#fff8ea','paper',0.05],[0.35,0.2,'#fde2c4','antsketch',-0.06],[0.05,-0.3,'#cfe7f2','paper',0.03],[0.55,-0.32,'#fff1a8','plain',-0.1],[-0.55,-0.32,'#f7c6d0','plain',0.12]].forEach(n=>{
  boxAt(0.42,0.38,0.012,M(n[2],n[3]),CBX+n[0],CBY+n[1]-0.19,-4.9,{rz:n[4],cast:false});
  add(new THREE.IcosahedronGeometry(0.035,0),M(['#d45d5a','#3fa89b','#e7b05a'][Math.floor(R()*3)],'plain'),CBX+n[0],CBY+n[1]+0.12,-4.88,{line:false,cast:false});});
// 빨간 실
add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(CBX-0.45,CBY+0.27,-4.885),new THREE.Vector3(CBX+0.05,CBY-0.18,-4.885),new THREE.Vector3(CBX+0.35,CBY+0.32,-4.885)]),12,0.008,3),M('#d45d5a','plain'),0,0,0,{line:false,cast:false});

/* ---------- 침대 ---------- */
const BX=-4.08,BZ=-2.0;const bedWood=M('#c28b5c','wood');
boxAt(1.72,0.42,3.2,bedWood,BX,0,BZ);
boxAt(1.72,1.25,0.14,bedWood,BX,0,BZ-1.62);
boxAt(1.72,0.7,0.14,bedWood,BX,0,BZ+1.62);
boxAt(1.6,0.3,3.0,M('#fbf4e6','plain'),BX,0.42,BZ);
boxAt(1.78,0.12,2.25,M('#f6d68b','quilt',{rep:[2,3]}),BX,0.72,BZ+0.42);
boxAt(0.05,0.38,2.25,M('#f6d68b','quilt',{rep:[2,1]}),BX+0.89,0.42,BZ+0.42,{cast:false});
add(new THREE.IcosahedronGeometry(0.5,1),M('#fbe9e2','stripes',{stripes:['#fbe9e2','#f6c9c0'],n:10}),BX,0.88,BZ-1.15,{s:[1.35,0.38,0.7],thr:60});
// 개미 인형
const ant=group(BX+0.3,0.84,BZ-0.45,-0.6);const antMat=M('#d98a62','plain');
[[0,0.18,0.24,0.2],[0,0.17,0,0.14],[0,0.24,-0.2,0.17]].forEach(s=>add(new THREE.IcosahedronGeometry(s[3],1),antMat,s[0],s[1],s[2],{parent:ant,thr:60}));
[[-0.06,0.32,-0.32],[0.06,0.32,-0.32]].forEach(e=>add(new THREE.IcosahedronGeometry(0.035,0),M('#3d2c22','plain'),e[0],e[1],e[2],{parent:ant,line:false}));
[[-0.07],[0.07]].forEach(a=>cylBetween([a[0],0.38,-0.24],[a[0]*2.6,0.62,-0.42],0.012,M('#7a4e34','plain'),ant,4));
add(new THREE.TorusGeometry(0.1,0.035,5,12),M('#3fb5a8','plain'),0,0.22,-0.1,{parent:ant,rx:PI/2,thr:60});
blob(BX,BZ,1.1,1.8,0.3);
// 벽시계
const CX=-4.94,CY=3.75,CZ=-2.0;
add(C(0.38,0.38,0.08,14),M('#8fc4b7','plain'),CX,CY,CZ,{rz:PI/2,thr:50});
add(new THREE.CircleGeometry(0.3,14),M('#fbf1dc','plain'),CX+0.045,CY,CZ,{ry:PI/2,line:false,cast:false});
boxAt(0.02,0.2,0.03,M('#4b3a2b','plain'),CX+0.05,CY,CZ,{line:false,cast:false});
const minute=add(B(0.02,0.26,0.025),M('#4b3a2b','plain'),CX+0.055,CY,CZ,{line:false,cast:false});
minute.geometry.translate(0,0.13,0);minute.position.y=CY;

/* ---------- 걸이 선반: 목도리·모자·밧줄 ---------- */
boxAt(0.06,0.16,1.7,M('#a97a52','wood'),-4.92,3.0,1.25,{cast:false});
[0.6,1.2,1.85].forEach(z=>add(C(0.03,0.03,0.22,6),M('#a97a52','wood'),-4.8,3.08,z,{rz:PI/2,thr:50}));
// 헝겊 주머니
cylBetween([-4.8,3.06,1.2],[-4.86,2.78,1.2],0.012,M('#8a6a4c','plain'),scene,4);
boxAt(0.14,0.42,0.38,M('#efe1c4','weave'),-4.86,2.36,1.2);
// 탐험 모자
add(C(0.2,0.25,0.22,10),M('#e9cf95','plain'),-4.75,2.95,0.6,{rz:-PI/2,thr:50});
add(C(0.38,0.38,0.03,12),M('#e9cf95','plain'),-4.86,2.95,0.6,{rz:-PI/2,thr:50});
add(C(0.255,0.255,0.06,10),M('#d77f7a','plain'),-4.79,2.95,0.6,{rz:-PI/2,thr:50});
// 밧줄 고리
for(let k=0;k<3;k++)add(new THREE.TorusGeometry(0.26-k*0.015,0.03,5,14),M('#d8bd8a','plain'),-4.83+k*0.03,2.78,1.85,{ry:PI/2,thr:60});

/* ---------- 배낭 ---------- */
const bp=group(-3.85,0,1.4,0.55);const lea=M('#b4744a','leather');const leaD=M('#8e5534','leather');
boxAt(0.82,0.88,0.5,lea,0,0,0,{parent:bp});
boxAt(0.86,0.12,0.54,leaD,0,0.88,0,{parent:bp});
boxAt(0.84,0.5,0.06,leaD,0,0.45,0.27,{parent:bp,rx:-0.06});
boxAt(0.55,0.36,0.14,lea,0,0.08,0.3,{parent:bp});
[-0.22,0.22].forEach(x=>{boxAt(0.08,0.62,0.03,leaD,x,0.3,0.33,{parent:bp});boxAt(0.12,0.08,0.05,brass,x,0.35,0.35,{parent:bp});});
boxAt(0.12,0.5,0.4,lea,0.47,0.05,0,{parent:bp});
// 침낭 롤
add(C(0.2,0.2,0.98,10),M('#8fc4b7','stripes',{stripes:['#8fc4b7','#f4d4a2','#e9a07c'],n:9}),0,1.17,0,{parent:bp,rz:PI/2,thr:50});
[-0.3,0.3].forEach(x=>add(new THREE.TorusGeometry(0.21,0.025,4,12),leaD,x,1.17,0,{parent:bp,ry:PI/2,thr:60}));
// 매달린 수통
add(C(0.13,0.13,0.08,12),M('#9cc9e0','plain'),-0.48,0.4,0,{parent:bp,rz:PI/2,thr:50});
blob(-3.85,1.4,0.7,0.6,0.38);

/* ---------- 나비채 ---------- */
cylBetween([-4.3,0,2.35],[-4.78,2.3,2.18],0.025,M('#c9a06e','wood'),scene,6);
add(new THREE.TorusGeometry(0.3,0.022,5,16),M('#c9a06e','wood'),-4.84,2.62,2.15,{rz:0.2,thr:60});
add(new THREE.ConeGeometry(0.28,0.55,10,1,true),new THREE.MeshStandardMaterial({color:lin('#ffffff'),transparent:true,opacity:0.5,side:THREE.DoubleSide,depthWrite:false,roughness:1}),-4.84,2.58,2.38,{rx:PI/2,line:false,cast:false});

/* ---------- 나무 상자 + 랜턴 ---------- */
boxAt(1.1,1.0,1.1,M('#d9ac7a','crate'),-4.05,0,3.4);
boxAt(0.75,0.6,0.75,M('#e3b98c','crate'),-4.1,1.0,3.3,{ry:0.35});
for(let k=0;k<3;k++)add(new THREE.TorusGeometry(0.3-k*0.02,0.035,5,14),M('#d8bd8a','plain'),-3.4,0.06+k*0.07,3.75,{rx:PI/2,thr:60});
const lantern=group(-4.08,1.6,3.3,0.3);
boxAt(0.3,0.04,0.3,M('#5f6f6a','plain'),0,0,0,{parent:lantern});
boxAt(0.24,0.36,0.24,new THREE.MeshStandardMaterial({color:lin('#fff1c8'),emissive:lin('#ffcf73'),emissiveIntensity:0.5,transparent:true,opacity:0.75,roughness:0.3}),0,0.04,0,{parent:lantern,line:false});
add(new THREE.ConeGeometry(0.22,0.16,4),M('#5f6f6a','plain'),0,0.48,0,{parent:lantern,ry:PI/4});
add(new THREE.TorusGeometry(0.08,0.015,4,10,PI),M('#5f6f6a','plain'),0,0.56,0,{parent:lantern,thr:60});
const crateLight=new THREE.PointLight(0xffb867,0.3,5,2);crateLight.position.set(-4.08,1.85,3.3);scene.add(crateLight);
blob(-4.05,3.4,0.85,0.85,0.4);

/* ---------- 러그 / 방석 / 낮은 탁자 ---------- */
add(new THREE.CircleGeometry(2.1,22),M('#e9a07c','rug',{size:512}),0.5,0.03,0.8,{rx:-PI/2,cast:false,line:false});
[[-0.75,1.45,'#c9b6e2'],[1.85,1.35,'#bcd893']].forEach(c=>{add(new THREE.IcosahedronGeometry(0.5,1),M(c[2],'quilt',{pal:[c[2],shade(c[2],0.08),shade(c[2],-0.06)]}),c[0],0.13,c[1],{s:[1,0.3,1],thr:60});blob(c[0],c[1],0.6,0.6,0.25);});
const tb=group(0.55,0,0.75,0);const tbMat=M('#d39a66','wood');
cylAt(0.72,0.72,0.08,tbMat,0,0.46,0,{parent:tb,seg:12});
for(let i=0;i<3;i++){const a=i*2*PI/3+0.3;cylAt(0.05,0.04,0.46,tbMat,Math.cos(a)*0.45,0,Math.sin(a)*0.45,{parent:tb,seg:6});}
blob(0.55,0.75,0.85,0.85,0.3);
// 찻주전자
const TT=0.54;const tp=group(0.3,TT,0.65,0.4);const tpMat=M('#9cc9e0','plain');
add(new THREE.IcosahedronGeometry(0.2,1),tpMat,0,0.17,0,{parent:tp,s:[1,0.85,1],thr:60});
cylAt(0.08,0.1,0.06,tpMat,0,0.32,0,{parent:tp});
add(new THREE.IcosahedronGeometry(0.035,0),M('#f2c14e','plain'),0,0.41,0,{parent:tp,line:false});
cylBetween([0.15,0.14,0],[0.33,0.3,0],0.035,tpMat,tp,6);
add(new THREE.TorusGeometry(0.1,0.025,5,10,PI),tpMat,-0.2,0.18,0,{parent:tp,rz:PI/2,thr:60});
// 컵·쿠키
[[0.95,0.45],[0.92,1.05]].forEach(c=>{cylAt(0.08,0.065,0.11,M('#fbe9cf','plain'),c[0],TT,c[1]);add(new THREE.CircleGeometry(0.07,10),M('#c98a5a','plain'),c[0],TT+0.1,c[1],{rx:-PI/2,line:false,cast:false});});
cylAt(0.22,0.18,0.03,M('#fbf1dc','plain'),0.18,TT,1.15,{seg:12});
[[0.1,1.1],[0.26,1.18],[0.16,1.25],[0.22,1.06]].forEach((k,i)=>cylAt(0.065,0.065,0.03,M(i%2?'#e7b05a':'#d9925a','plain'),k[0],TT+0.03+(i>2?0.03:0),k[1],{seg:8}));
// 탁자 위 펼친 책
const ob=group(0.75,TT+0.005,0.95,-0.4);
boxAt(0.3,0.03,0.4,M('#fff8ea','paper'),-0.15,0,0,{parent:ob,rz:0.08});boxAt(0.3,0.03,0.4,M('#fff8ea','paper'),0.15,0,0,{parent:ob,rz:-0.08});

/* ---------- 버섯 랜턴 (켜고 끄기) ---------- */
const ML=group(0.55,3.45,0.75,0);
cylBetween([0,0.45,0],[0,4,0],0.012,M('#5b4636','plain'),ML,4);
const capMat=M('#ec8b7d','plain',{emissive:'#ec8b7d',ei:0.05});
add(new THREE.SphereGeometry(0.55,12,6,0,PI*2,0,PI/2),capMat,0,0,0,{parent:ML,thr:40});
for(let k=0;k<7;k++){const th=k*0.9+0.3,ph=0.35+(k%3)*0.32;add(new THREE.IcosahedronGeometry(0.07,0),M('#fff4e2','plain'),Math.sin(ph)*Math.cos(th)*0.55,Math.cos(ph)*0.55,Math.sin(ph)*Math.sin(th)*0.55,{parent:ML,line:false});}
const glowMat=new THREE.MeshStandardMaterial({color:lin('#fff1cf'),emissive:lin('#ffd58a'),emissiveIntensity:0.6,roughness:1,side:THREE.DoubleSide});
add(new THREE.CircleGeometry(0.55,12),glowMat,0,-0.001,0,{parent:ML,rx:PI/2,line:false,cast:false});
add(C(0.12,0.15,0.3,8),glowMat,0,-0.15,0,{parent:ML,line:false,cast:false});
const lampLight=new THREE.PointLight(0xffb866,0.6,9,2);lampLight.position.set(0.55,3.1,0.75);scene.add(lampLight);
const lampHit=[];ML.traverse(o=>{if(o.isMesh){lampHit.push(o);o.castShadow=false;}});
const poolTex=(()=>{const cv=document.createElement('canvas');cv.width=cv.height=128;const g=cv.getContext('2d');const gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,214,140,0.9)');gr.addColorStop(1,'rgba(255,214,140,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(cv);})();
const poolMat=new THREE.MeshBasicMaterial({map:poolTex,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,polygonOffset:true,polygonOffsetFactor:-3});
const pool=new THREE.Mesh(new THREE.PlaneGeometry(4.6,4.6),poolMat);pool.rotation.x=-PI/2;pool.position.set(0.55,0.05,0.75);scene.add(pool);

/* ---------- 지구본 ---------- */
const gb=group(3.6,0,0.6,0);const gbWood=M('#a97a52','wood');
cylAt(0.36,0.4,0.08,gbWood,0,0,0,{parent:gb,seg:10});
cylAt(0.04,0.06,0.85,gbWood,0,0.08,0,{parent:gb,seg:6});
const globe=add(new THREE.IcosahedronGeometry(0.4,2),M('#86c5e0','globe'),0,1.32,0,{parent:gb,line:false});
globe.rotation.z=0.4;
add(new THREE.TorusGeometry(0.46,0.025,5,20,PI*1.3),brass,0,1.32,0,{parent:gb,rz:-0.4-0.15*PI,ry:0.0,thr:60});
blob(3.6,0.6,0.55,0.55,0.35);

/* ---------- 큰 화분 ---------- */
function leafGeo(L,W){
  const P=[[0,0,0],[-W,L*0.45,0],[0,L*0.45,W*0.35],[-W,L*0.45,0],[0,L,0],[0,L*0.45,W*0.35],[0,0,0],[0,L*0.45,W*0.35],[W,L*0.45,0],[0,L*0.45,W*0.35],[0,L,0],[W,L*0.45,0]];
  const pos=[],uv=[];P.forEach(p=>{pos.push(p[0],p[1],p[2]);uv.push(p[0]/(2*W)+0.5,p[1]/L);});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;
}
function leafMat(c){const m=M(c,'leaf');m.side=THREE.DoubleSide;return m;}
const PX=4.2,PZ=-1.75;
cylAt(0.52,0.48,0.05,M('#d9825f','plain'),PX,0,PZ,{seg:12});
cylAt(0.42,0.31,0.62,M('#e48d6a','plain'),PX,0.05,PZ,{seg:10});
cylAt(0.375,0.365,0.08,M('#8fc4b7','stripes',{stripes:['#8fc4b7','#f5ead2'],n:16}),PX,0.24,PZ,{seg:10});
cylAt(0.47,0.45,0.12,M('#eb9b74','plain'),PX,0.6,PZ,{seg:10});
add(new THREE.CircleGeometry(0.41,10),M('#7a5a3e','plaster'),PX,0.7,PZ,{rx:-PI/2,line:false,cast:false});
[['#e9dccb',0.12,0.05],['#bfb2a3',-0.15,0.1],['#d9c7ae',0.05,-0.18],['#cfd6c9',-0.1,-0.12],['#e9dccb',0.2,-0.05]].forEach(p=>add(new THREE.IcosahedronGeometry(0.045,0),M(p[0],'plain'),PX+p[1],0.72,PZ+p[2],{thr:40}));
const leafM=[leafMat('#5fa457'),leafMat('#78b863'),leafMat('#9ccd78')];const stemM=M('#7c9a55','plain');
[0.3,1.55,2.8,4.0,5.2].forEach((a,si)=>{
  const H=1.0+(si%3)*0.32;const ca=Math.cos(a),sa=Math.sin(a);
  const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(PX+ca*0.06,0.7,PZ+sa*0.06),new THREE.Vector3(PX+ca*0.22,0.7+H*0.5,PZ+sa*0.22),new THREE.Vector3(PX+ca*0.42,0.7+H,PZ+sa*0.42)]);
  add(new THREE.TubeGeometry(curve,10,0.028,5),stemM,0,0,0,{line:false});
  const N=5;for(let i=0;i<N;i++){
    const t=0.3+i/(N-1)*0.7;const p=curve.getPoint(t);
    const dir=a+(i%2?1.25:-1.25)+rnd(-0.25,0.25);
    const lg=new THREE.Group();lg.position.copy(p);lg.rotation.y=PI/2-dir;scene.add(lg);
    const top=i===N-1;const L=top?0.4:0.7-i*0.04,W=top?0.13:0.26-i*0.01;
    add(leafGeo(L,W),leafM[top?2:(i<2?0:(i%2?1:0))],0,0,0,{parent:lg,rx:top?0.35:1.3-t*0.5,ry:rnd(-0.2,0.2),thr:20});
  }
});
blob(PX,PZ,0.75,0.75,0.4);

/* ---------- 바닥 책 더미 + 바구니 ---------- */
[['#d77f7a',0.62,0.46],['#7c9fcf',0.56,0.42],['#e7b05a',0.6,0.44],['#b6a0d6',0.5,0.38]].reduce((y,b,i)=>{boxAt(b[1],0.12,b[2],M(b[0],'plain'),2.7,y,2.9,{ry:(i%2?0.2:-0.15)});return y+0.12;},0);
add(new THREE.IcosahedronGeometry(0.1,0),M('#f2c14e','plain'),2.65,0.58,2.88,{thr:40});
blob(2.7,2.9,0.5,0.45,0.35);
cylAt(0.42,0.34,0.5,M('#d8b57a','weave',{rep:[3,1]}),3.85,0,3.55,{seg:12});
[[0.1,0.05,'#f3e1b9'],[-0.12,0.08,'#efd3a8'],[0.05,-0.15,'#f6e6c4'],[-0.08,-0.05,'#e9cf95']].forEach((s,i)=>{const g=group(3.85+s[0],0.3,3.55+s[1],0);g.rotation.z=s[0]*1.5;g.rotation.x=s[1]*1.5;add(C(0.06,0.06,0.9,8),M(s[2],'plain'),0,0.3,0,{parent:g,thr:50});add(C(0.065,0.065,0.04,8),M('#d45d5a','plain'),0,0.5,0,{parent:g,thr:50});});
blob(3.85,3.55,0.6,0.6,0.35);

/* ---------- 김 ---------- */
const steamTex=(()=>{const cv=document.createElement('canvas');cv.width=cv.height=64;const g=cv.getContext('2d');const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,0.8)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(cv);})();
const steams=[];
function steamAt(x,y,z,n){for(let i=0;i<n;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:steamTex,transparent:true,depthWrite:false,opacity:0}));s.userData={x,y,z,ph:i/n,sw:rnd(0,9)};scene.add(s);steams.push(s);}}
steamAt(-0.12,DT+0.2,-3.9,5);
steamAt(0.3+Math.cos(-0.4)*0.33,TT+0.33,0.65-Math.sin(-0.4)*0.33,5);
export {DUST,ML,beamLen,beamMat2,beamStart,capMat,crateLight,dustGeo,dustMat,dustPos,dustSeed,glowMat,lampHit,lampLight,minute,perpA,perpB,poolMat,skyNight,steams,sunDir};
