/* 원더룹 — 하늘과 시간 흐름 (야외 구역): 낮 → 해 질 녘 → 밤(첫별)
   쓰는 법(구역 build 안): const SK=G.sky.sky({parent:root, keys, t:0}); 구역 정보에 sky:SK 를 둔다 → 08이 매 프레임 조명·안개·하늘을 맞춘다
     (하늘이 있는 구역은 낮/저녁/굴 단추 대신 시간 값을 따른다. 하늘이 없는 구역은 예전 그대로).
   시간 t: 0 낮 · 1 해 질 녘 · 2 밤. SK.set(t) 바로, SK.to(t, 초) 천천히(게임 시간 — 촬영 모드에서도 같은 길이). SK.night = 밤 정도(0~1, 등불이 쓰는 env.night).
   keys: [낮, 해 질 녘, 밤] 세 개. 빠진 값은 기본값(DEFAULT_KEYS). 색은 16진수(sRGB), 세기는 03의 옛 조명 단위(08이 끝에서 π를 곱함).
     top·horizon 하늘 위·지평선 색, hemi·ground 하늘빛·땅 반사빛 색, hemiI 하늘빛 세기, sun·sunI 해 색·세기, sunDir 해가 비추는 방향,
     fill 보조광 세기, fog 안개 색(보통 지평선 색), fogNear·fogFar 안개 거리, stars 별 보임(0~1).
   별: 밤으로 갈수록 나타난다. 첫별(firstStar, 하늘 한 점)이 먼저 뜨고(t 1.55~1.8) 나머지가 뒤따른다(1.75~2). SK.firstStar 로 자리를 옮길 수 있다.
   비용: 하늘 둥근 지붕 1회 + 별 1회 그리기. 안개는 08이 처음부터 늘 켜 두고(멀리 밀어 둠) 값만 바꾼다 — 안개를 켜고 끄면 셰이더를 모두 다시 만들어 휴대폰이 멈춘다. */
import * as THREE from 'three';
const DEFAULT_KEYS=[
  {top:'#9cc8e8',horizon:'#f4ead2',hemi:'#fff3dc',ground:'#d2ab88',hemiI:.62,sun:'#ffe0b0',sunI:.72,sunDir:[5,-11,6],fill:.22,fog:'#f1e6cf',fogNear:28,fogFar:90,stars:0},
  {top:'#7f8fc4',horizon:'#f6b98a',hemi:'#f7c9a6',ground:'#a7787a',hemiI:.42,sun:'#ff9f6a',sunI:.5,sunDir:[11,-4,3],fill:.16,fog:'#e9b494',fogNear:22,fogFar:80,stars:0},
  {top:'#1c2350',horizon:'#4a4778',hemi:'#8b92c8',ground:'#4a3e58',hemiI:.2,sun:'#9fb0e8',sunI:.08,sunDir:[-4,-11,2],fill:.1,fog:'#30325a',fogNear:18,fogFar:70,stars:1},
];
const CKEYS=['top','horizon','hemi','ground','sun','fog'],NKEYS=['hemiI','sunI','fill','fogNear','fogFar','stars'];
const ss=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x);};
function sky({parent,keys=[],t=0,radius=100,nStars=260,seed=7}={}){
  const K=DEFAULT_KEYS.map((d,i)=>Object.assign({},d,keys[i]||{}));
  const KC=K.map(k=>{const o={};CKEYS.forEach(c=>o[c]=new THREE.Color(k[c]));o.dir=new THREE.Vector3(...k.sunDir).normalize();return o;});
  // 하늘 둥근 지붕: 지평선 → 위로 색이 바뀐다(땅 아래는 지평선 색). 카메라를 따라다닌다
  const uni={top:{value:new THREE.Color()},horizon:{value:new THREE.Color()}};
  const mat=new THREE.ShaderMaterial({uniforms:uni,side:THREE.BackSide,depthWrite:false,fog:false,
    vertexShader:'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'uniform vec3 top;uniform vec3 horizon;varying vec3 vP;void main(){float h=normalize(vP).y;float k=smoothstep(-.02,.55,h);gl_FragColor=vec4(mix(horizon,top,pow(k,.8)),1.);\n#include <colorspace_fragment>\n}'});
  const dome=new THREE.Mesh(new THREE.SphereGeometry(radius,24,12),mat);dome.renderOrder=-10;dome.frustumCulled=false;dome.name='sky';dome.userData.noMerge=true; // 정적 병합에 묶이면 처음 자리에 붙박여 카메라 먼 거리 밖으로 잘린다(휴대폰에서 하늘이 검게 보이던 원인)
  // 별: 위쪽 하늘에 고르게(지평선 근처는 드물게). 첫별은 따로 크게
  let r=seed;const R=()=>(r=(r*16807)%2147483647)/2147483647;
  const P=new Float32Array(nStars*3);for(let i=0;i<nStars;i++){const a=R()*Math.PI*2,y=.12+.88*Math.sqrt(R()),c=Math.sqrt(1-y*y);P.set([Math.cos(a)*c*radius*.9,y*radius*.9,Math.sin(a)*c*radius*.9],i*3);}
  const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(P,3));
  const dot=(()=>{const cv=document.createElement('canvas');cv.width=cv.height=32;const g=cv.getContext('2d'),gr=g.createRadialGradient(16,16,0,16,16,16);
    gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.35,'rgba(255,250,230,.8)');gr.addColorStop(1,'rgba(255,250,230,0)');g.fillStyle=gr;g.fillRect(0,0,32,32);const tx=new THREE.CanvasTexture(cv);tx.colorSpace=THREE.SRGBColorSpace;return tx;})();
  const smat=new THREE.PointsMaterial({map:dot,size:3,sizeAttenuation:false,transparent:true,opacity:0,depthWrite:false,fog:false,color:0xfff6dc});
  const stars=new THREE.Points(sg,smat);stars.renderOrder=-9;stars.frustumCulled=false;
  const fmat=new THREE.PointsMaterial({map:dot,size:9,sizeAttenuation:false,transparent:true,opacity:0,depthWrite:false,fog:false,color:0xfff2c8});
  const first=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(new Float32Array([radius*.35,radius*.55,-radius*.6]),3)),fmat);
  first.renderOrder=-9;first.frustumCulled=false;
  const g=new THREE.Group();g.name='sky';g.add(dome,stars,first);(parent||null)&&parent.add(g);
  const cur={};CKEYS.forEach(c=>cur[c]=new THREE.Color());cur.dir=new THREE.Vector3();
  const S={group:g,t,goal:null,dur:0,from:0,tw:0,clk:0,
    get night(){return ss(.6,2,S.t);},
    set(v){S.t=Math.max(0,Math.min(2,v));S.goal=null;},
    to(v,sec=4){S.from=S.t;S.goal=Math.max(0,Math.min(2,v));S.dur=Math.max(.01,sec);S.tw=0;},
    firstStar(x,y,z){const p=first.geometry.attributes.position;p.setXYZ(0,x,y,z);p.needsUpdate=true;},
    /* 08이 매 프레임: 시간 진행 → 조명·안개·하늘 색. L={hemi,sun,fill,fog}, sunDirOut: 구역 sun.dir(그림자 방향)에 복사 */
    light(L,camera,dt,sunDirOut){
      if(S.goal!=null){S.tw+=dt;const k=ss(0,1,S.tw/S.dur);S.t=S.from+(S.goal-S.from)*k;if(S.tw>=S.dur){S.t=S.goal;S.goal=null;}}
      const i=Math.min(1,Math.floor(S.t)),u=S.t-i,a=KC[i],b=KC[i+1],ka=K[i],kb=K[i+1];
      CKEYS.forEach(c=>cur[c].copy(a[c]).lerp(b[c],u));const num=n=>ka[n]+(kb[n]-ka[n])*u;
      uni.top.value.copy(cur.top);uni.horizon.value.copy(cur.horizon);
      L.hemi.color.copy(cur.hemi);L.hemi.groundColor.copy(cur.ground);L.hemi.intensity=num('hemiI');
      L.sun.color.copy(cur.sun);L.sun.intensity=num('sunI');L.fill.intensity=num('fill');
      if(L.fog){L.fog.color.copy(cur.fog);L.fog.near=num('fogNear');L.fog.far=num('fogFar');}
      if(sunDirOut)sunDirOut.copy(cur.dir.copy(a.dir).lerp(b.dir,u).normalize());
      S.clk=(S.clk||0)+dt;const st=num('stars'),tw=.88+.12*Math.sin(S.clk*4); // 첫별 반짝임은 게임 시간으로(촬영 모드에서도 같은 그림)
      smat.opacity=st*ss(1.75,2,S.t);fmat.opacity=ss(1.55,1.8,S.t)*tw;stars.visible=smat.opacity>.003;first.visible=fmat.opacity>.003; // 안 보일 때는 그리지 않는다(드로우콜)
      if(camera){g.position.copy(camera.position);g.scale.setScalar(Math.min(1,camera.far*.9/radius));}},  // 08이 카메라 먼 거리를 안개 끝으로 당기면 하늘도 그 안으로
    dispose(){dot.dispose();}};
  return S;}
export {DEFAULT_KEYS,sky};
