/* 우주 하늘 공통(2026-11-14 — 달 → 화성 별똥별 이동의 하늘을 다른 행성 이동도 그대로 쓰게): 손그림 행성 그림(목성·토성·화성·금성·해·성운·은하수·종이 결·반짝이),
   로우폴리 행성 구 makeOrb(parent,{map,rep,ring}) — 회색 정원(garden.js)이 쓰던 것 그대로 옮김, 그리고 하늘 그림판 makeSkyBoard(root,{mob,seed}):
   카메라 자리에 붙어 방향만 늦게(초당 1.4) 따라오는 판 — 별(점 묶음 1)·네 갈래 반짝이(1)·성운(1)·은하수 띠(1)·종이 결(1)·해(2) + 행성 구는 쓰는 쪽이 add()로.
   setAlpha(a)로 서서히 나타남(노을 하늘 → 우주), place(obj, x, y, size) = 화면 좌표(-1~1)·크기(화면 짧은 쪽 비율)로 그림판 위에 놓기. 회색 정원은 자기 그림판을 그대로 쓴다(구·그림만 여기서). */
import * as THREE from 'three';
import {rng} from '../../01-textures.js';
import {sbMat} from '../../game/storybook.js';
const PI=Math.PI;
export function canvasTex(n,draw,h=n){const c=document.createElement('canvas');c.width=n;c.height=h;draw(c.getContext('2d'),n,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
/* ── 하늘 행성 손그림(2026-11-07 — 매끈한 스티커처럼 보여 로우폴리 색연필 세계와 따로 놀았다): 살짝 고르지 않은 가장자리(wob), 색연필 빗금 결(hatch),
   은은한 입체 그림자(왼쪽 위 해 쪽 밝게, 반대쪽 어둡게 — shade), 목성 줄무늬는 경계가 번지게(화소마다 물결 + 부드러운 섞기) */
export function srand(seed){let s=seed;return ()=>((s=(s*16807)%2147483647)/2147483647);}
export function wob(g,cx,cy,r,seed,amp=.018){const R=srand(seed),p1=R()*6,p2=R()*6,p3=R()*6;g.beginPath();for(let i=0;i<=120;i++){const a=i/120*PI*2,k=1+amp*(Math.sin(a*5+p1)*.5+Math.sin(a*9+p2)*.3+Math.sin(a*17+p3)*.2);
  const x=cx+Math.cos(a)*r*k,y=cy+Math.sin(a)*r*k;i?g.lineTo(x,y):g.moveTo(x,y);}g.closePath();}
export function hatch(g,x0,y0,w,h,n,cols,seed,{len=[10,22],ang=-.55,alpha=[.08,.2],lw=[1.4,2.6]}={}){const R=srand(seed);g.save();g.lineCap='round';
  for(let i=0;i<n;i++){const x=x0+R()*w,y=y0+R()*h,L=len[0]+R()*(len[1]-len[0]),a=ang+(R()-.5)*.3;g.globalAlpha=alpha[0]+R()*(alpha[1]-alpha[0]);g.strokeStyle=cols[(R()*cols.length)|0];g.lineWidth=lw[0]+R()*(lw[1]-lw[0]);
    g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*L,y+Math.sin(a)*L);g.stroke();}g.restore();}
export function shade(g,cx,cy,r,{lit=.22,dark=.4}={}){const hl=g.createRadialGradient(cx-r*.42,cy-r*.42,0,cx-r*.42,cy-r*.42,r*.9);hl.addColorStop(0,`rgba(255,250,232,${lit})`);hl.addColorStop(1,'rgba(255,250,232,0)');g.fillStyle=hl;g.fillRect(cx-r*1.1,cy-r*1.1,r*2.2,r*2.2);
  const sh=g.createRadialGradient(cx-r*.3,cy-r*.3,r*.55,cx-r*.1,cy-r*.1,r*1.25);sh.addColorStop(0,'rgba(60,30,70,0)');sh.addColorStop(.7,`rgba(60,30,70,${dark*.45})`);sh.addColorStop(1,`rgba(50,22,60,${dark})`);g.fillStyle=sh;g.fillRect(cx-r*1.1,cy-r*1.1,r*2.2,r*2.2);}
/* 목성 줄무늬 그림(구에 감는 equirect 2:1): 밝은 크림 + 연한 주황 줄무늬(물결 경계·번짐) + 옅은 빗금. 붉은 폭풍은 광택 없는 산호빛 다홍 —
   또렷한 가장자리(선 없이 한 단계 진한 산호 띠) + 안쪽 소용돌이 빗금. 자리는 구에서 카메라를 보는 쪽 아래 왼쪽(u .17·위도 남쪽) */
export function jupiterMap(g,w,h){const bands=['#f6ead2','#f2cba4','#f5e6cb','#edbd92','#f4e2c4','#eab48a','#f6e8cd','#f0c79f','#f5e4c6','#ecba90','#f6ead2'].map(c=>{const n=parseInt(c.slice(1),16),k=v=>Math.pow(v/255,1.45);return {r:k(n>>16&255),g:k(n>>8&255),b:k(n&255)};}); // 밝은 크림 + 연한 주황 — 지난번 확정한 색(선형 값을 화소에 쓴 진한 주황)과 sRGB 그대로(너무 옅음)의 사이 // 하늘 보라를 섞으면 분홍으로 기울어 조금 더 노랗게
  const img=g.createImageData(w,h),d=img.data,bh=h/bands.length,R=srand(5);const nz=[];for(let i=0;i<64;i++)nz.push(R());
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const xx=x/w*PI*2,yy=y+Math.sin(xx*3+y*.01)*bh*.2+Math.sin(xx*11+nz[(y>>2)&63]*6)*bh*.05,bi=yy/bh,i0=Math.max(0,Math.min(bands.length-1,Math.floor(bi))),i1=Math.min(bands.length-1,i0+1),f=bi-i0;
    const t=f<.78?0:Math.min(1,(f-.78)/.22),tt=t*t*(3-2*t),A=bands[i0],B=bands[i1],j=(nz[(x*7+y*13)&63]-.5)*.03,k=(y*w+x)*4;
    d[k]=Math.min(255,(A.r+(B.r-A.r)*tt+j)*255);d[k+1]=Math.min(255,(A.g+(B.g-A.g)*tt+j)*255);d[k+2]=Math.min(255,(A.b+(B.b-A.b)*tt+j)*255);d[k+3]=255;}
  g.putImageData(img,0,0);
  hatch(g,0,0,w,h,700,['#fffaf0','#fdeed6','#f3c9a2','#e8b088'],7,{len:[6,16],alpha:[.06,.14]});
  // 붉은 폭풍: 산호빛 다홍, 광택 없음, 또렷한 가장자리(한 단계 진한 산호 띠 — 검은 선 없음), 안쪽 소용돌이 빗금
  const sx=w*.17,sy=h*.6,rx=w*.034,ry=h*.038; // 예전 원판 그림의 폭풍과 같은 크기(구 둘레의 약 7%)
  g.beginPath();g.ellipse(sx,sy,rx*1.08,ry*1.1,0,0,PI*2);g.fillStyle='#d9614a';g.fill();
  g.beginPath();g.ellipse(sx,sy,rx,ry,0,0,PI*2);g.fillStyle='#e8775c';g.fill();
  g.save();g.beginPath();g.ellipse(sx,sy,rx,ry,0,0,PI*2);g.clip();g.lineCap='round';
  for(let i=0;i<16;i++){const k=i/16,a0=k*PI*2.6,rr=.25+.7*k;g.strokeStyle=i%2?'rgba(255,190,160,.45)':'rgba(196,78,58,.45)';g.lineWidth=1.6;g.beginPath();
    g.ellipse(sx,sy,rx*rr,ry*rr,0,a0,a0+1.6);g.stroke();}
  g.restore();}
/* 화성 그림(equirect): 녹슨 주황 + 어두운 무늬(손그림 얼룩) + 밝은 모래빛 + 위아래 흰 극관 + 빗금 */
export function marsMap(g,w,h){g.fillStyle='#cf6a45';g.fillRect(0,0,w,h);const R=srand(23);
  for(let i=0;i<46;i++){const x=R()*w,y=h*(.2+R()*.6),r=w*(.02+R()*.07);g.globalAlpha=.25+R()*.3;g.fillStyle=R()<.6?'#9c4430':'#e4925f';g.beginPath();g.ellipse(x,y,r*1.6,r*.7,R()*.6-.3,0,PI*2);g.fill();}
  g.globalAlpha=1;g.fillStyle='#f6ece2';g.fillRect(0,0,w,h*.07);g.fillRect(0,h*.95,w,h*.05);
  hatch(g,0,0,w,h,420,['#f0a074','#b04e34','#fbe0c8'],31,{len:[5,13],alpha:[.07,.16]});}
/* 토성 줄무늬 그림(equirect): 금빛 몸통 + 옅은 줄무늬 + 빗금 */
export function saturnMap(g,w,h){g.fillStyle='#efc979';g.fillRect(0,0,w,h);const R=srand(31);
  [[.28,'#e2bc78',5],[.42,'#f6e0ae',4],[.55,'#ddb26a',6],[.68,'#f3dba6',3],[.8,'#d9ad66',4]].forEach(([y,c,lw])=>{g.strokeStyle=c;g.lineWidth=lw;g.beginPath();for(let x=0;x<=w;x+=4){const yy=y*h+Math.sin(x/w*PI*6+y*9)*1.6;x?g.lineTo(x,yy):g.moveTo(x,yy);}g.stroke();});
  hatch(g,0,0,w,h,260,['#fff4d6','#c99a52'],33,{len:[4,10],alpha:[.08,.18],lw:[1,1.6]});}
/* 해: 크림빛 원(고르지 않은 가장자리 — 선 없음) + 노랑·살구 빗금 + 은은한 입체(빛무리는 sunGlowArt 판) */
export function sunArt(g,n){const cx=n/2,cy=n/2,r=n*.19; // 원만(빛무리는 sunGlowArt — 더하기 섞기 판으로 따로, 손그림 결은 원 안쪽에만)
  g.save();wob(g,cx,cy,r,21,.03);g.fillStyle='#ffe9b0';g.fill();g.clip();hatch(g,cx-r,cy-r,2*r,2*r,240,['#fffbe8','#fff2c8','#ffd98a','#ffcf7a'],23,{len:[6,14],alpha:[.14,.3],lw:[1.2,2.2]});shade(g,cx,cy,r,{lit:.4,dark:.08});g.restore();
  // 테두리 선 없음(2026-11-08) — 가장자리는 둘레로 갈수록 살짝 진한 살구빛이 원 안쪽에서 번지듯
  {const e=g.createRadialGradient(cx,cy,r*.72,cx,cy,r*1.04);e.addColorStop(0,'rgba(255,214,140,0)');e.addColorStop(.8,'rgba(255,200,120,.35)');e.addColorStop(1,'rgba(255,200,120,0)');g.fillStyle=e;g.beginPath();g.arc(cx,cy,r*1.04,0,PI*2);g.fill();}}
/* 해 빛무리: 은은하게 번지는 살구빛(가운데 크림 → 바깥으로 사라짐) */
export function sunGlowArt(g,n){const c=n/2,gr=g.createRadialGradient(c,c,0,c,c,c);gr.addColorStop(0,'rgba(255,240,200,.85)');gr.addColorStop(.18,'rgba(255,226,170,.6)');gr.addColorStop(.42,'rgba(255,200,130,.24)');gr.addColorStop(.7,'rgba(255,180,120,.08)');gr.addColorStop(1,'rgba(255,170,120,0)');g.fillStyle=gr;g.fillRect(0,0,n,n);}
/* 종이 결(하늘 바탕, 256 반복): 밝은 섬유 짧은 선 + 어두운 티끌 — 판 불투명도로 아주 옅게 */
export function paperArt(g,n){const R=srand(41);g.clearRect(0,0,n,n);g.lineCap='round';
  for(let i=0;i<420;i++){const x=R()*n,y=R()*n,L=2+R()*5,a=R()*PI;g.globalAlpha=.04+R()*.07;g.strokeStyle=R()<.75?'#fff4e6':'#d9c8ff';g.lineWidth=.8+R()*1.4;
    for(let ox=-1;ox<=1;ox++)for(let oy=-1;oy<=1;oy++){g.beginPath();g.moveTo(x+ox*n,y+oy*n);g.lineTo(x+ox*n+Math.cos(a)*L,y+oy*n+Math.sin(a)*L);g.stroke();}}
  for(let i=0;i<700;i++){g.globalAlpha=.06+R()*.1;g.fillStyle=R()<.6?'#0c0820':'#fff8ee';g.fillRect(R()*n,R()*n,1.2,1.2);}g.globalAlpha=1;}
/* 네 갈래 반짝이 ✦(로딩 화면 반짝이와 같은 모양 — 노랑, 가운데 흰빛) */
export function sparkArt(g,n){const c=n/2;const gr=g.createRadialGradient(c,c,0,c,c,c);gr.addColorStop(0,'rgba(255,240,170,.55)');gr.addColorStop(1,'rgba(255,230,140,0)');g.fillStyle=gr;g.fillRect(0,0,n,n);
  g.fillStyle='#ffe27a';g.beginPath();for(let k=0;k<8;k++){const a=k/8*PI*2-PI/2,r=k%2?n*.08:n*.46;const x=c+Math.cos(a)*r,y=c+Math.sin(a)*r;k?g.lineTo(x,y):g.moveTo(x,y);}g.closePath();g.fill();
  g.fillStyle='#fffbe6';g.beginPath();g.arc(c,c,n*.07,0,7);g.fill();}
/* 성운: 연보라·분홍 위주(+ 살구·하늘 조금) 구름 얼룩 */
export function nebulaArt(g,n){let s=11;const R=()=>((s=(s*16807)%2147483647)/2147483647);const cols=['214,150,240','255,150,200','200,160,255','255,180,170','170,170,255'];
  for(let i=0;i<60;i++){const x=n*(.12+R()*.76),y=n*(.25+R()*.5),r=n*(.07+R()*.2),c=cols[i%5],gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(${c},.075)`);gr.addColorStop(1,`rgba(${c},0)`);g.fillStyle=gr;g.fillRect(0,0,n,n);}
  /* 판 가장자리로 갈수록 0까지(2026-11-08 — 가장자리에서 잘린 구름 얼룩이 하늘에 밝기가 다른 세로 이음매로 보였다) */
  const m=g.createRadialGradient(n/2,n/2,n*.22,n/2,n/2,n*.5);m.addColorStop(0,'rgba(0,0,0,1)');m.addColorStop(1,'rgba(0,0,0,0)');g.globalCompositeOperation='destination-in';g.fillStyle=m;g.fillRect(0,0,n,n);g.globalCompositeOperation='source-over';}
/* 은하수 띠(가로로 긴 그림 — 판은 4:1): 가운데가 밝은 연보라·분홍 띠 + 작은 별 알갱이 */
export function milkyArt(g,n){const w=n,h=n;let s=23;const R=()=>((s=(s*16807)%2147483647)/2147483647);
  for(let i=0;i<70;i++){const x=w*R(),y=h*(.5+(R()-.5)*.36*Math.sin(x/w*PI)),r=h*(.08+R()*.16),c=['190,160,240','240,170,220','170,180,255'][i%3],gr=g.createRadialGradient(x,y,0,x,y,r);
    gr.addColorStop(0,`rgba(${c},.07)`);gr.addColorStop(1,`rgba(${c},0)`);g.fillStyle=gr;g.fillRect(0,0,w,h);}
  const fade=g.createLinearGradient(0,0,w,0);fade.addColorStop(0,'rgba(0,0,0,1)');fade.addColorStop(.15,'rgba(0,0,0,0)');fade.addColorStop(.85,'rgba(0,0,0,0)');fade.addColorStop(1,'rgba(0,0,0,1)');
  g.globalCompositeOperation='destination-out';g.fillStyle=fade;g.fillRect(0,0,w,h);const fv=g.createLinearGradient(0,0,0,h);fv.addColorStop(0,'rgba(0,0,0,1)');fv.addColorStop(.3,'rgba(0,0,0,0)');fv.addColorStop(.7,'rgba(0,0,0,0)');fv.addColorStop(1,'rgba(0,0,0,1)');g.fillStyle=fv;g.fillRect(0,0,w,h);g.globalCompositeOperation='source-over';}
/* 금성 그림(equirect): 연보라 구름 띠(물결) + 크림 줄 + 빗금 */
export function venusMap(g,w,h){g.fillStyle='#d7bcee';g.fillRect(0,0,w,h);const R=srand(57);
  for(let i=0;i<9;i++){const y0=h*(.06+i*.105),amp=h*.03,ph=R()*6,th=h*(.03+R()*.035);g.fillStyle=i%2?'rgba(246,234,252,.75)':'rgba(190,156,222,.6)';g.beginPath();
    for(let x=0;x<=w;x+=4)g.lineTo(x,y0+Math.sin(x/w*PI*4+ph)*amp);for(let x=w;x>=0;x-=4)g.lineTo(x,y0+th+Math.sin(x/w*PI*4+ph+.6)*amp);g.closePath();g.fill();}
  hatch(g,0,0,w,h,90,['#ffffff','#f3e6ff','#b895d8'],58,{len:[10,24],alpha:[.06,.16]});}
const SKYC=new THREE.Color('#6b5fb4');
const ORB_GLSL='float ringA(float r){if(r<1.32||r>2.3)return 0.;float u=(r-1.32)/.98;float a=u<.46?.55:u<.53?.08:u<.88?.82:u<.91?.1:.35;a*=.9+.1*sin(u*31.);return a*smoothstep(0.,.03,u)*smoothstep(1.,.95,u);}\n'; // 넓은 띠 셋(안쪽·가운데 진한 띠·옅은 바깥) + 틈 둘
const crayTex=(()=>{const m=sbMat('#ffffff');return m.map;})();
export function makeOrb(parent,{map,rep=[5,3],ring=false}){const g=new THREE.Group();parent.add(g);g.frustumCulled=false;
  const U={uMap:{value:map},uCray:{value:crayTex},uRep:{value:new THREE.Vector2(...rep)},uL:{value:new THREE.Vector3(-1,.5,.6).normalize()},uSky:{value:SKYC},uRim:{value:new THREE.Color('#fff1cf')},
    uRn:{value:new THREE.Vector3(0,1,0)},uRing:{value:ring?1:0}};
  const body=new THREE.Mesh(new THREE.SphereGeometry(1,20,14),new THREE.ShaderMaterial({uniforms:U,fog:false,
    vertexShader:'varying vec3 vW,vN,vP;varying vec2 vUv;void main(){vUv=uv;vP=position;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vN=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*w;}',
    fragmentShader:'uniform sampler2D uMap,uCray;uniform vec2 uRep;uniform vec3 uL,uSky,uRim,uRn;uniform float uRing;varying vec3 vW,vN,vP;varying vec2 vUv;'+ORB_GLSL+
      'void main(){vec3 Nf=normalize(cross(dFdx(vW),dFdy(vW)));vec3 N=normalize(mix(normalize(vN),Nf,.32));vec3 V=normalize(cameraPosition-vW);'+
      'float d=dot(N,uL);float k=mix(.56,.8,smoothstep(-.14,0.,d));k=mix(k,1.,smoothstep(.36,.5,d));'+
      'vec3 base=texture2D(uMap,vUv).rgb*dot(texture2D(uCray,vUv*uRep).rgb,vec3(.3333));vec3 col=base*k+uSky*(1.-k)*.45;'+
      'if(uRing>0.){float dn=dot(uL,uRn);if(abs(dn)>.02){float t=-dot(vP,uRn)/dn;if(t>0.){float a=ringA(length(vP+uL*t));col*=1.-a*.5;}}}'+ // 고리 그림자(해 쪽으로 고리 면을 비춰 봄)
      'float nv=max(dot(N,V),0.);col*=mix(.8,1.,pow(nv,.4));'+ // 가장자리 어두움
      'col=mix(col,uSky*1.3,smoothstep(.26,0.,nv)*.3);'+ // 하늘과 만나는 경계로 갈수록 연보라
      'col+=uRim*smoothstep(.16,.02,nv)*smoothstep(.05,.45,d)*.5;'+ // 해를 바라보는 쪽 가장자리 아주 얇은 밝은 테
      'float l=dot(col,vec3(.3,.59,.11));col=mix(vec3(l),col,.9);col=mix(col,uSky,.15);'+ // 멀리 있는 느낌: 하늘 보라 20%, 대비 조금 낮춤
      'gl_FragColor=vec4(col,1.);\n#include <colorspace_fragment>\n}'}));
  body.material.userData.noBend=true;body.frustumCulled=false;body.renderOrder=-6;body.userData.noMerge=true;g.add(body);
  const halo=new THREE.Mesh(new THREE.PlaneGeometry(2.6,2.6),new THREE.MeshBasicMaterial({map:haloTex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,opacity:.7}));
  halo.material.userData.noBend=true;halo.frustumCulled=false;halo.renderOrder=-4;halo.userData.noMerge=true;g.add(halo);
  let rg=null;if(ring){rg=new THREE.Mesh(new THREE.RingGeometry(1.32,2.3,96,1),new THREE.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,side:THREE.DoubleSide,fog:false,
      vertexShader:'varying vec3 vP,vW;void main(){vP=position;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
      fragmentShader:'uniform sampler2D uCray;uniform vec3 uL,uSky,uRn;varying vec3 vP,vW;'+ORB_GLSL+
        'void main(){float r=length(vP.xy);float a=ringA(r);if(a<.01)discard;float u=(r-1.32)/.98;'+
        'vec3 c=mix(vec3(.6,.44,.22),vec3(.7,.54,.3),smoothstep(.4,.7,u))*(.94+.06*sin(u*23.));c*=dot(texture2D(uCray,vP.xy*1.7).rgb,vec3(.3333));'+ // 몸통보다 살짝 어두운 금빛 띠 + 크레용 결
        'float lit=.85+.15*abs(dot(uRn,uL));c=c*lit;float l=dot(c,vec3(.3,.59,.11));c=mix(vec3(l),c,.9);c=mix(c,uSky,.22);'+
        'gl_FragColor=vec4(c,min(1.,a*1.15));\n#include <colorspace_fragment>\n}'}));
    rg.material.userData.noBend=true;rg.frustumCulled=false;rg.renderOrder=-5;rg.userData.noMerge=true;g.add(rg);}
  return {g,body,halo,ring:rg,U};}
const haloTex=canvasTex(128,(g,n)=>{const c=n/2,gr=g.createRadialGradient(c,c,0,c,c,c);gr.addColorStop(0,'rgba(190,170,255,0)');gr.addColorStop(.72,'rgba(190,170,255,0)');gr.addColorStop(.78,'rgba(196,178,255,.3)');gr.addColorStop(.9,'rgba(180,160,250,.12)');gr.addColorStop(1,'rgba(170,150,240,0)');g.fillStyle=gr;g.fillRect(0,0,n,n);});
/* ── 하늘 그림판 ── */
export function makeSkyBoard(root,{mob=false,seed='space-travel'}={}){const anchor=new THREE.Group();anchor.name='space-sky-board';root.add(anchor);const D=90,aq=new THREE.Quaternion(),aq2=new THREE.Quaternion();let aqOn=false,A=1;
  /* 행성·해는 따로 빨리 따라오는 판(near — 초당 6: 이동 카메라가 뒤·옆·앞으로 크게 돌아도 정한 화면 자리 가까이에), 별·성운·은하수는 늦게(초당 1.4 — 카메라가 돌면 별이 흘러 원근감) */
  const near=new THREE.Group();near.name='space-sky-near';anchor.add(near);
  const fades=[];const bill=(tex,{op=1,add=false,order=-1,w=1,h=1}={})=>{const m=new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,depthTest:true,fog:false,opacity:op,blending:add?THREE.AdditiveBlending:THREE.NormalBlending});m.userData.noBend=true;m.userData.op0=op;
    const me=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);me.renderOrder=order;me.frustumCulled=false;me.userData.noMerge=true;anchor.add(me);fades.push(m);return me;};
  const sunG=bill(canvasTex(128,sunGlowArt),{add:true,order:-4.5,op:.85}),sunM=bill(canvasTex(256,sunArt),{order:-4});near.add(sunG,sunM);
  const neb=bill(canvasTex(512,nebulaArt),{add:true,order:-7,op:.62}),milkyB=bill(canvasTex(512,milkyArt),{add:true,order:-7,op:.75,w:4,h:1});
  const grain=(()=>{const t=canvasTex(256,paperArt);t.wrapS=t.wrapT=THREE.RepeatWrapping;return bill(t,{order:-9,op:mob?.32:.28});})();
  const N=mob?3400:6400,starU={uT:{value:0},uPR:{value:Math.min(window.devicePixelRatio||1,mob?1.25:2)},uA:{value:1}};
  const stars=(()=>{const pos=new Float32Array(N*3),cc=new Float32Array(N*3),sz=new Float32Array(N),ph=new Float32Array(N*2),c=new THREE.Color();const r=rng(seed+':stars'),sr=(a,b)=>a+(b-a)*r();
    const cols=['#ffffff','#ffffff','#ffffff','#fdfcf6','#fff2b8','#ffd0e0','#cfe6ff'];
    for(let i=0;i<N;i++){const az=sr(-PI,PI),el=Math.asin(sr(Math.sin(-1.2),Math.sin(1.3)));pos.set([Math.sin(az)*Math.cos(el)*D*.99,Math.sin(el)*D*.99,-Math.cos(az)*Math.cos(el)*D*.99],i*3); /* 온 하늘(이동 카메라는 사방으로 돎) */
      c.set(cols[(sr(0,cols.length))|0]);cc.set([c.r,c.g,c.b],i*3);const q=sr(0,1);sz[i]=q<.6?sr(2,3):q<.88?sr(3.1,4.4):q<.98?sr(4.5,6):sr(6.2,8);ph.set([sr(0,PI*2),sr(.35,1.6)],i*2);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(cc,3));geo.setAttribute('psize',new THREE.BufferAttribute(sz,1));geo.setAttribute('tw',new THREE.BufferAttribute(ph,2));
    const m=new THREE.ShaderMaterial({uniforms:starU,transparent:true,depthWrite:false,fog:false,
      vertexShader:'uniform float uT,uPR;attribute float psize;attribute vec2 tw;attribute vec3 color;varying vec3 vC;varying float vA;void main(){float w=.5+.5*sin(uT*tw.y+tw.x);float big=step(3.2,psize);vA=mix(.35,1.,w*w)*(.8+.2*big);vC=color;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=psize*uPR*(.82+.3*w);}',
      fragmentShader:'uniform float uA;varying vec3 vC;varying float vA;void main(){vec2 d=gl_PointCoord-.5;float r=length(d)*2.;float a=1.-smoothstep(.55,1.,r);if(a<.01)discard;gl_FragColor=vec4(vC*(1.+.35*smoothstep(.45,0.,r)),a*vA*uA);}'});
    m.userData.noBend=true;const pts=new THREE.Points(geo,m);pts.frustumCulled=false;pts.renderOrder=-8;pts.userData.noMerge=true;anchor.add(pts);return pts;})();
  const twinkles=(()=>{const n=mob?10:18,pos=new Float32Array(n*3),pr=new Float32Array(n*3);const r=rng(seed+':twinkle'),sr=(a,b)=>a+(b-a)*r();
    for(let i=0;i<n;i++){const az=sr(-.9,.9),el=sr(-.3,.62);pos.set([Math.sin(az)*Math.cos(el)*D*.97,Math.sin(el)*D*.97,-Math.cos(az)*Math.cos(el)*D*.97],i*3);pr.set([sr(0,8),sr(3,8),sr(18,30)],i*3);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('tp',new THREE.BufferAttribute(pr,3));
    const m=new THREE.ShaderMaterial({uniforms:{uT:starU.uT,uPR:starU.uPR,uA:starU.uA,uMap:{value:canvasTex(64,sparkArt)}},transparent:true,depthWrite:false,fog:false,blending:THREE.AdditiveBlending,
      vertexShader:'uniform float uT,uPR;attribute vec3 tp;varying float vK;float h(float n){return fract(sin(n*12.9898)*43758.5453);}void main(){float cyc=(uT+tp.x)/tp.y,ci=floor(cyc),u=fract(cyc)*tp.y;float k=u<.7?sin(3.14159*u/.7):0.;vK=k;'+
        'vec3 p=position+vec3((h(ci+tp.x)-.5)*30.,(h(ci*1.7+tp.x*3.1)-.5)*16.,0.);vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=tp.z*uPR*k;}',
      fragmentShader:'uniform sampler2D uMap;uniform float uA;varying float vK;void main(){vec4 c=texture2D(uMap,gl_PointCoord);if(c.a<.01)discard;gl_FragColor=vec4(c.rgb*c.a*vK*uA,1.);}'});
    m.userData.noBend=true;const pts=new THREE.Points(geo,m);pts.frustumCulled=false;pts.renderOrder=-3;pts.userData.noMerge=true;anchor.add(pts);return pts;})();
  const orbs=[];let tv=.4,th=.4,u=.4,port=false;
  /* 화면 좌표(x,y: -1~1)·크기(화면 짧은 쪽 비율 s)로 그림판 위에 놓기. 구(orb)는 반지름 = s×짧은 쪽 */
  function place(o,x,y,s,dk=1){const g=o.g||o;g.position.set(x*th*D*dk,y*tv*D*dk,-D*dk);g.quaternion.identity();const sz=s*2*u*D*dk;if(o.g)g.scale.setScalar(sz*.5);else g.scale.set(sz,sz,1);}
  function tick(dt,t,cam){if(!cam)return;anchor.position.copy(cam.position);if(!aqOn){aq.copy(cam.quaternion);aq2.copy(aq);aqOn=true;}else{aq.slerp(cam.quaternion,1-Math.exp(-dt*1.4));aq2.slerp(cam.quaternion,1-Math.exp(-dt*6));}anchor.quaternion.copy(aq);near.quaternion.copy(aq).invert().multiply(aq2);
    tv=Math.tan(cam.fov*PI/360);th=tv*cam.aspect;u=Math.min(tv,th);port=cam.aspect<1;starU.uT.value=t;
    place(neb,port?-.2:-.35,port?.66:.62,port?1.4:1.3);place(milkyB,port?0:.05,port?.72:.7,1);milkyB.rotation.z=port?-.55:-.22;
    {const gs=2*D*.995*Math.max(tv,th)*4.2;grain.position.set(0,0,-D);grain.scale.set(gs,gs,1);grain.material.map.repeat.set(9,9);}
    for(const o of orbs){_od.copy(sunM.position).sub(o.g.position).normalize();_od.z+=.85;o.U.uL.value.copy(_od.normalize()).applyQuaternion(aq2);if(o.ring)o.U.uRn.value.set(.16,.88,.45).normalize().applyQuaternion(aq2);}}
  const _od=new THREE.Vector3();
  function setAlpha(a){A=a;starU.uA.value=a;for(const m of fades)m.opacity=m.userData.op0*a;}
  function add(opts){const o=makeOrb(near,opts);if(o.ring){const n=new THREE.Vector3(.16,.88,.45).normalize();o.ring.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),n);o.U.uRn.value.copy(n);}orbs.push(o);return o;}
  function dispose(){anchor.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){if(o.material.map)o.material.map.dispose();o.material.dispose();}});for(const o of orbs)if(o.U.uMap.value)o.U.uMap.value.dispose();anchor.removeFromParent();}
  return {anchor,D,sun:sunM,sunGlow:sunG,place,tick,setAlpha,add,dispose,get port(){return port;},get alpha(){return A;}};}
