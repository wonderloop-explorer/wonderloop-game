/* 원더룹 탈 — 외계인 탈 (무한 우주 탐방, 2026-11-07)
   개미탈(04)과 같은 동그란 탈: 같은 구(반지름 .5)·같은 얼굴 구멍(04 WL.userData.faceHole)·같은 구멍 테 → 탈 아래 앞머리(05)가 그대로 맞는다.
   다른 점: 더듬이 없음, 탈 위쪽에 바깥으로 살짝 올라간 커다란 검은 아몬드 눈(탈 면에 그려 넣은 평평한 무늬 — 구 위로 촘촘히 펴서 탈 면을 따라 휜다)
   + 눈 안에 작은 네 갈래 별 하이라이트(크림빛) 하나·작은 점 하나.
   색: 탈 겉·테 재질은 개미탈 재질(04 hoodMats)을 같이 쓴다 → 06 setTint('hood')·세계 설정 talColors가 그대로 칠한다(연두·연보라·하늘·회색).
   06 HOODS 'alien'(번호는 끝에 붙음). 얼굴 구멍 탈이라 05 applyLook이 안쪽 머리를 숨기고 탈 아래 앞머리를 보인다(WL.userData.faceHoods). */
import * as THREE from 'three';
import {lin} from '../01-textures.js';
import {WL} from '../04-character.js';
const H={ax:.74,ay:.68,cy:-.22}; // 04 개미탈 얼굴 구멍과 같은 값
function shell(){const g=new THREE.SphereGeometry(.5,80,60),p=g.attributes.position,ix=g.index.array,keep=[];
  const inHole=i=>{const x=p.getX(i)*2,y=p.getY(i)*2,z=p.getZ(i)*2;return z>0&&(x/H.ax)**2+((y-H.cy)/H.ay)**2<1;};
  for(let t=0;t<ix.length;t+=3){const a=ix[t],b=ix[t+1],c=ix[t+2];if(inHole(a)&&inHole(b)&&inHole(c))continue;keep.push(a,b,c);}
  const used=new Set(keep);for(const i of used){if(!inHole(i))continue;const x=p.getX(i)*2,y=p.getY(i)*2,ex=x/H.ax,ey=(y-H.cy)/H.ay,d=Math.hypot(ex,ey)||1e-6;
    const nx=H.ax*ex/d,ny=H.cy+H.ay*ey/d,nz=Math.sqrt(Math.max(0,1-nx*nx-ny*ny));p.setXYZ(i,nx*.5,ny*.5,nz*.5);}
  g.setIndex(keep);g.computeVertexNormals();return g;}
/* 구 위 무늬: 접평면 좌표 (a,b)를 dir 둘레에서 구 반지름 r로 편다. rot = 접평면 안 회전(라디안) */
function onSphere(g,dir,r,rot){const T=new THREE.Vector3(1,0,0).addScaledVector(dir,-dir.x).normalize(),B=dir.clone().cross(T).normalize() /* T = 탈 면 위 가로(세계 x를 접평면에 비춤 — 위·0·dir로 만들면 위쪽 눈의 긴 축이 앞뒤로 누웠다) */,p=g.attributes.position,v=new THREE.Vector3(),c=Math.cos(rot),s=Math.sin(rot);
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),a=x*c-y*s,b=x*s+y*c;v.copy(dir).addScaledVector(T,a).addScaledVector(B,b).normalize().multiplyScalar(r);p.setXYZ(i,v.x,v.y,v.z);}
  g.computeVertexNormals();return g;}
/* 아몬드: 원판(RingGeometry — 안쪽까지 촘촘)을 두 원호가 만나는 렌즈 모양으로 눌러 양끝이 뾰족하게. 바깥 끝(+x)을 조금 더 통통하게 */
function almond(w,h){const NX=28,NY=6,R=1.25,c=.75,pos=[],idx=[];
  for(let i=0;i<=NX;i++){const x=-1+2*i/NX,lens=Math.max(0,Math.sqrt(R*R-x*x)-c)/(R-c),fat=1-.2*x;
    for(let j=0;j<=NY;j++){const t=-1+2*j/NY;pos.push(x*w,t*lens*h*fat,0);}}
  for(let i=0;i<NX;i++)for(let j=0;j<NY;j++){const a=i*(NY+1)+j,b=a+NY+1;idx.push(a,b,a+1,b,b+1,a+1);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(new Array(pos.length/3*2).fill(0),2));g.setIndex(idx);return g;}
function star(s){const sh=new THREE.Shape();for(let k=0;k<8;k++){const a=k/8*Math.PI*2+Math.PI/2,r=k%2?s*.32:s;const x=Math.cos(a)*r,y=Math.sin(a)*r;k?sh.lineTo(x,y):sh.moveTo(x,y);}sh.closePath();
  return new THREE.ShapeGeometry(sh);}
function circle(s){return new THREE.CircleGeometry(s,14);}
function build({head,wm}){const [hoodM,hoodD]=WL.userData.hoodMats;
  const g=new THREE.Group();g.name='hood:alien';
  /* 탈 크기·자리(1.12·1·.96, 0·.04·−.1)는 메시 변환이 아니라 형태에 굽는다 — 자식 무늬에 배율이 두 번 곱해져 눈 안쪽이 탈 속에 묻혔다(아틀라스 병합) */
  const MX=new THREE.Matrix4().compose(new THREE.Vector3(0,.04,-.1),new THREE.Quaternion(),new THREE.Vector3(1.12,1,.96)),put=geo=>{geo.applyMatrix4(MX);return geo;};
  const hood=g;g.add(wm(put(shell()),hoodM));
  {const pts=[];for(let i=0;i<72;i++){const th=i/72*Math.PI*2;const x=H.ax*Math.cos(th),y=H.cy+H.ay*Math.sin(th),z=Math.sqrt(Math.max(0,1-x*x-y*y));pts.push(new THREE.Vector3(x,y,z).multiplyScalar(.5*.985));}
    hood.add(wm(put(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,true),180,.032,12,true)),hoodD));}
  const eyeM=new THREE.MeshStandardMaterial({color:lin('#17131f'),roughness:.55,metalness:0}),hiM=new THREE.MeshStandardMaterial({color:lin('#fff6dc'),roughness:.6,metalness:0,emissive:lin('#fff1c8'),emissiveIntensity:.35});
  [-1,1].forEach(s=>{const dir=new THREE.Vector3(s*.42,.62,.66).normalize(),rot=-s*.4; // 바깥 끝이 위로(바깥으로 살짝 올라간 눈)
    // 접평면 x를 원더룹 바깥쪽(+s)으로: almond의 +x(통통한 끝)가 바깥
    const eg=almond(.27,.14);if(s<0){const p=eg.attributes.position;for(let i=0;i<p.count;i++)p.setX(i,-p.getX(i));eg.index&&eg.index.array.reverse();}
    hood.add(wm(put(onSphere(eg,dir,.507,rot)),eyeM));
    const hd=dir.clone(),T=new THREE.Vector3(1,0,0).addScaledVector(dir,-dir.x).normalize(),B=dir.clone().cross(T).normalize();
    hood.add(wm(put(onSphere(star(.05),hd.clone().addScaledVector(T,-s*.05).addScaledVector(B,.035).normalize(),.5095,0)),hiM)); // 별 하이라이트(눈 안쪽 위)
    hood.add(wm(put(onSphere(circle(.017),hd.clone().addScaledVector(T,s*.07).addScaledVector(B,-.02).normalize(),.5095,0)),hiM));});
  head.add(g);return {g};}
export const ALIEN={build};
