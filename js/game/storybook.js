/* 원더룹 — 동화책 손그림 재질 (시리즈 공통 규칙, 2026-11-06 사용자 요청 — 규칙은 docs/series-rules.md '오브젝트 그림')
   원더룹 세계의 오브젝트는 늘 동화책 손그림처럼 보인다: 반짝이는 3D 금속·매끈한 플라스틱 느낌이 아니라 개미굴 원본 그대로
   ① 툰 음영 3단(0.55·0.82·1 — 그림자 면이 한 덩어리로 또렷, 2D 그림 같은 느낌) ② 모든 면에 크레용 결(CRAYON — 흰 바탕에 옅은 크림 획·점, 색은 재질 색을 곱함).
   (요정의 숲 zones/fairy/paint.js toon()·CRAYON과 같은 값 — 그쪽은 구역 전용 캐시라 놓아 두고, 세계 설정 모델·연출 물건은 이 파일을 쓴다)
   storybook(obj): obj 안 메시의 재질(Standard·Lambert·Phong·Basic·Toon)을 같은 색·발광·양면·투명도의 툰 + 크레용 결 재질로 바꾼다(같은 재질은 한 번만 바꿈).
     바꾼 재질은 원래 재질 userData.sb에 남는다 — 모델이 원래 재질을 잡아 두고 값을 바꾸는 경우(랜턴 켜고 끄기)는 (m.userData.sb||m)에.
     스프라이트(빛무리·반짝이)·직접 쓴 셰이더(ShaderMaterial)·userData.noStorybook 재질은 그대로.
   부르는 곳: 세계 설정 모델을 만드는 game/finale(큰 획득 선물·귀환 탈것)·game/mission(첫 미션 물건)·game/stealth(지나가는 존재·숨을 곳)·game/devstory(시험 모형).
   새 오브젝트를 만들 때는 처음부터 sbMat(색,{emissive,ei,side,opacity})을 쓰거나 다 만든 뒤 storybook(g). */
import * as THREE from 'three';
let CR=null,GRAD=null;
function crayon(){if(CR)return CR;let s=20261106;const R=()=>((s=(s*1103515245+12345)&0x7fffffff)/0x7fffffff),rr=(a,b)=>a+R()*(b-a);
  const size=256,cols=['#efe2d6','#ffffff','#e2d2c6','#fff6ea','#d8c8bc'],pick=()=>cols[Math.floor(R()*cols.length)];
  const c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d');g.fillStyle='#ffffff';g.fillRect(0,0,size,size);g.lineCap='round';
  for(let i=0;i<1100;i++){const x=R()*size,y=R()*size,len=rr(6,18),ang=R()*Math.PI,w=rr(1.5,5);g.strokeStyle=pick();g.globalAlpha=rr(.1,.32);g.lineWidth=w;
    const dx=Math.cos(ang)*len,dy=Math.sin(ang)*len;for(let ox=-1;ox<=1;ox++)for(let oy=-1;oy<=1;oy++){g.beginPath();g.moveTo(x+ox*size,y+oy*size);g.lineTo(x+dx+ox*size,y+dy+oy*size);g.stroke();}}
  for(let i=0;i<900;i++){g.globalAlpha=rr(.1,.3);g.fillStyle=pick();g.beginPath();g.arc(R()*size,R()*size,rr(.8,3),0,7);g.fill();}
  g.globalAlpha=1;CR=new THREE.CanvasTexture(c);CR.wrapS=CR.wrapT=THREE.RepeatWrapping;CR.colorSpace=THREE.SRGBColorSpace;CR.anisotropy=4;return CR;}
function grad(){if(GRAD)return GRAD;const d=new Uint8Array([.549,.82,1].map(v=>Math.round(Math.pow(v,2.2)*255)).flatMap(v=>[v,v,v,255]));
  GRAD=new THREE.DataTexture(d,3,1,THREE.RGBAFormat);GRAD.minFilter=GRAD.magFilter=THREE.NearestFilter;GRAD.generateMipmaps=false;GRAD.needsUpdate=true;return GRAD;}
/* 새 재질: 색은 16진수(sRGB) 또는 THREE.Color */
function sbMat(color,o={}){const m=new THREE.MeshToonMaterial({color:color instanceof THREE.Color?color.clone():new THREE.Color(color),gradientMap:grad(),map:o.map||crayon()});
  if(o.emissive){m.emissive=o.emissive instanceof THREE.Color?o.emissive.clone():new THREE.Color(o.emissive);m.emissiveIntensity=o.ei??1;}
  if(o.side)m.side=o.side;if(o.opacity!=null&&o.opacity<1||o.transparent){m.transparent=true;m.opacity=o.opacity??1;m.depthWrite=o.depthWrite??false;}
  if(o.flat)m.flatShading=true;return m;}
const KINDS=new Set(['MeshStandardMaterial','MeshPhysicalMaterial','MeshLambertMaterial','MeshPhongMaterial','MeshBasicMaterial','MeshToonMaterial']);
function conv(m){if(!m||!KINDS.has(m.type)||m.userData.noStorybook)return m;if(m.userData.sbOf)return m;if(m.userData.sb)return m.userData.sb;
  if(m.type==='MeshToonMaterial'){if(!m.map)m.map=crayon();if(!m.gradientMap)m.gradientMap=grad();m.needsUpdate=true;m.userData.sbOf=m;return m;}
  const t=sbMat(m.color||'#ffffff',{map:m.map||null,side:m.side});
  if(m.emissive&&m.type!=='MeshBasicMaterial'){t.emissive.copy(m.emissive);t.emissiveIntensity=m.emissiveIntensity;}
  if(m.type==='MeshBasicMaterial'){t.emissive.copy(m.color);t.emissiveIntensity=.55;} // 빛을 안 받던 재질은 어두운 면에서도 밝게(툰 1단만큼)
  if(m.transparent){t.transparent=true;t.opacity=m.opacity;t.depthWrite=m.depthWrite;}if(m.vertexColors)t.vertexColors=true;t.visible=m.visible;
  t.userData.sbOf=m;m.userData.sb=t;return t;}
function storybook(obj){if(!obj)return obj;const old=new Set();
  obj.traverse(o=>{if(!o.isMesh||o.isSprite)return;const a=Array.isArray(o.material)?o.material:[o.material];const b=a.map(m=>{const n=conv(m);if(n!==m)old.add(m);return n;});o.material=Array.isArray(o.material)?b:b[0];});
  return obj;}
export {crayon,sbMat,storybook};
