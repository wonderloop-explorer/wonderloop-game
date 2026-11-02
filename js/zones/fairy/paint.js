/* 요정의 숲 — 붓결 텍스처와 재질 (개미굴 편 antvillage/index.html의 painted()·toon()·CRAYON을 그대로 옮김)
   개미굴이 더 좋아 보이는 까닭(2026-11-01 비교): ① 모든 면에 굵은 붓결 텍스처(512, 짧은 획 1300개 + 점)가 보일 만큼 진하게 깔림
   ② 툰 음영 3단(그림자 면이 한 덩어리로 또렷) ③ 땅은 정점 색으로 얼룩(흙·이끼)을 칠함 ④ 카메라 가까이 큰 벽·소품이 화면을 채움 ⑤ 안개로 먼 곳을 흐림.
   이 파일은 ①②③의 도구. 난수는 텍스처 이름마다 rng('fairy-paint:<이름>')라 늘 같은 그림(구운 텍스처 목록에는 넣지 않음 — 요정의 숲 전용).
   painted(이름, 바탕색, [획 색…], {size, n, len, w, dots, amin, amax, rep}) → 반복 텍스처
   toon(색, {map, emissive, ei, side, flat, vertexColors, opacity}) → 개미굴 툰 재질(3단 음영 + 기본 붓결 CRAYON). 색은 16진수(sRGB).
   개미굴은 r128(색 관리 없음)이라 3단 밝기(0.55·0.82·1)가 화면 값 그대로였다 → 여기서는 선형으로 바꿔(제곱 2.2) 같은 화면 밝기가 되게 한다. */
import * as THREE from 'three';
import {rng} from '../../01-textures.js';
const cache={};
export function painted(name,base,cols,opt={}){
  const key=name+(opt.rep?'@'+opt.rep:'');if(cache[key])return cache[key];
  const R=rng('fairy-paint:'+name),rr=(a,b)=>a+R()*(b-a),pick=a=>a[Math.floor(R()*a.length)];
  const size=opt.size||512,n=opt.n||1300,c=document.createElement('canvas');c.width=c.height=size;
  const g=c.getContext('2d');g.fillStyle=base;g.fillRect(0,0,size,size);g.lineCap='round';
  for(let i=0;i<n;i++){const x=R()*size,y=R()*size,len=rr(6,opt.len||38),ang=R()*Math.PI,w=rr(1.5,opt.w||11);
    g.strokeStyle=pick(cols);g.globalAlpha=rr(opt.amin||.06,opt.amax||.24);g.lineWidth=w;const dx=Math.cos(ang)*len,dy=Math.sin(ang)*len;
    for(let ox=-1;ox<=1;ox++)for(let oy=-1;oy<=1;oy++){g.beginPath();g.moveTo(x+ox*size,y+oy*size);g.lineTo(x+dx+ox*size,y+dy+oy*size);g.stroke();}} // 이음매 없이 반복되게 아홉 칸에 같이
  for(let i=0;i<(opt.dots||350);i++){g.globalAlpha=rr(.1,.3);g.fillStyle=pick(cols);g.beginPath();g.arc(R()*size,R()*size,rr(.8,3),0,7);g.fill();}
  if(opt.extra)opt.extra(g,size,R);
  g.globalAlpha=1;const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;
  if(opt.rep)t.repeat.set(opt.rep[0],opt.rep[1]);
  return cache[key]=t;}
/* 구역을 떠날 때(구역 dispose): 그려 둔 붓결 캔버스를 모두 놓는다 — GPU 쪽은 02 unloadZone이 비우고, 여기서는 자바스크립트 메모리(캔버스)까지(휴대폰 스테이지당 예산) */
export function clearPaintCache(){for(const k in cache){cache[k].dispose();delete cache[k];}GRAD&&GRAD.dispose();GRAD=null;}
/* 개미굴 CRAYON: 흰 바탕에 옅은 크림 획 — 모든 툰 재질의 기본 결 */
export const CRAYON=()=>painted('crayon','#ffffff',['#efe2d6','#ffffff','#e2d2c6','#fff6ea','#d8c8bc'],{n:1100,len:18,w:5,dots:900,amin:.1,amax:.32,size:256});
let GRAD=null;
const grad=()=>{if(GRAD)return GRAD;const d=new Uint8Array([.549,.82,1].map(v=>Math.round(Math.pow(v,2.2)*255)).flatMap(v=>[v,v,v,255]));
  GRAD=new THREE.DataTexture(d,3,1,THREE.RGBAFormat);GRAD.minFilter=GRAD.magFilter=THREE.NearestFilter;GRAD.generateMipmaps=false;GRAD.needsUpdate=true;return GRAD;};
export function toon(color,o={}){
  const m=new THREE.MeshToonMaterial({color:new THREE.Color(color),gradientMap:grad(),map:o.map||CRAYON()});
  if(o.emissive){m.emissive=new THREE.Color(o.emissive);m.emissiveIntensity=o.ei??1;}
  if(o.side)m.side=o.side;if(o.vertexColors)m.vertexColors=true;
  if(o.opacity!=null){m.transparent=true;m.opacity=o.opacity;m.depthWrite=false;}
  if(o.flat)m.flatShading=true;
  return m;}
/* 값 잡음 (개미굴 vnoise·fbm 그대로) — 땅 얼룩·물가 울퉁불퉁에 */
const hash=(x,z)=>{const s=Math.sin(x*127.1+z*311.7)*43758.5453;return s-Math.floor(s);};
export function vnoise(x,z){const xi=Math.floor(x),zi=Math.floor(z),xf=x-xi,zf=z-zi;const u=xf*xf*(3-2*xf),v=zf*zf*(3-2*zf);
  const a=hash(xi,zi),b=hash(xi+1,zi),c=hash(xi,zi+1),d=hash(xi+1,zi+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
export const fbm=(x,z)=>vnoise(x,z)*.6+vnoise(x*2.1+5,z*2.1+3)*.3+vnoise(x*4.3+9,z*4.3+1)*.1;
