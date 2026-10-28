/* 원더룹 — 조명·렌더러·카메라·구역 최적화(병합). 구역마다 다른 값(해 방향·그림자 범위·카메라)은 setupView(구역)이 맞춘다 */
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {PI,rawLin,scene} from './01-textures.js';
import {zone} from './02-zone.js';
/* ---------- 조명 ---------- */
const hemi=new THREE.HemisphereLight(rawLin(0xfff3dc),rawLin(0xd2ab88),0.62);scene.add(hemi);
const sun=new THREE.DirectionalLight(rawLin(0xffe0b0),0.72);
sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);scene.add(sun.target);
sun.shadow.bias=-0.0006;sun.shadow.normalBias=0.03;sun.shadow.radius=2;scene.add(sun); // radius 2: 없어진 PCFSoftShadowMap의 부드러운 그림자 가장자리에 가장 가깝다
const fill=new THREE.DirectionalLight(rawLin(0xe2e9ff),0.22);fill.position.set(10,6,9);scene.add(fill);
/* r128 화면 유지 패치 — 화풍 기준은 r128 화면이라, 그 뒤 three.js가 바꾼 조명 계산을 옛 방식으로 되돌린다.
   three.js를 올릴 때 경고가 뜨면 해당 셰이더 문구가 바뀐 것이니 다시 맞춘다. */
{const patch=(chunk,from,to)=>{const src=THREE.ShaderChunk[chunk];if(!(typeof from==='string'?src.includes(from):from.test(src))){console.warn('원더룹: r128 화면 유지 패치 실패 —',chunk,String(from));return;}THREE.ShaderChunk[chunk]=src.replace(from,to);};
 // 점광원(버섯 랜턴·상자 랜턴) 거리 감쇠: 새 물리 공식(1/거리²) 대신 옛 공식 — 빛 웅덩이 모양 유지
 patch('lights_pars_begin',/float getDistanceAttenuation\([\s\S]*?\n}\n/,'float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {\n\tif ( cutoffDistance > 0.0 && decayExponent > 0.0 ) return pow( saturate( - lightDistance / cutoffDistance + 1.0 ), decayExponent );\n\treturn 1.0;\n}\n');
 // 정반사로 나간 만큼 확산광을 덜어내는 계산(r15x 이후 추가) 빼기 — 그대로 두면 전체가 약 4% 어둡고 탁해진다
 patch('lights_physical_pars_fragment','reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );','reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );');
 patch('lights_physical_pars_fragment','vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );','vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );');
 patch('lights_physical_pars_fragment','reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;','reflectedLight.directSpecular += irradiance * specularBRDF;');}

/* ---------- 렌더러 / 카메라 ---------- */
const stage=document.getElementById('stage');
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
renderer.setClearColor(0x000000,0);
stage.appendChild(renderer.domElement);
const camera=new THREE.PerspectiveCamera(30,1,1,120);
const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;controls.dampingFactor=0.08;controls.enablePan=false;
function placeCamera(){
  const w=stage.clientWidth,h=stage.clientHeight;const asp=w/h;
  camera.aspect=asp;camera.updateProjectionMatrix();renderer.setSize(w,h,false);
  return asp;
}
placeCamera();window.addEventListener('resize',placeCamera);
// ROOM_T: '방 전체' 카메라가 바라보는 점 (구역·방마다 바뀜), ui.dist: 그때의 거리
// 따라가기 카메라 거리: 가로 화면은 7.5, 세로처럼 좁은 화면(화면비 1.25 미만)은 방 카메라와 같은 규칙으로 1.25/화면비배(최대 2.1배) 멀리
const followDist=()=>{const asp=camera.aspect;return 7.5*(asp<1.25?Math.min(2.1,1.25/asp):1);};
const ROOM_T=new THREE.Vector3();let follow=true;const ui={camGoal:followDist(),statT:1,dist:27};
{const cb=document.getElementById('camBtn');cb.addEventListener('click',()=>{follow=!follow;ui.camGoal=follow?followDist():ui.dist;cb.textContent=follow?'카메라: 따라가기':'카메라: 방 전체';});}
window.addEventListener('resize',()=>{if(follow)ui.camGoal=followDist();}); // 휴대폰을 돌리면 거리도 다시
/* 방(영역) 카메라: 바라보는 점·거리·돌려 볼 수 있는 각도. start가 있으면 그 각도로 카메라를 옮긴다 */
function setAreaCamera(c,place){
  const asp=camera.aspect;ui.dist=c.dist*(asp<1.25?Math.min(2.1,1.25/asp):1);ROOM_T.set(...c.target);
  controls.minDistance=c.minDist??3;controls.maxDistance=c.maxDist??48;controls.minPolarAngle=c.polar[0];controls.maxPolarAngle=c.polar[1];
  controls.minAzimuthAngle=c.azimuth?c.azimuth[0]:-Infinity;controls.maxAzimuthAngle=c.azimuth?c.azimuth[1]:Infinity;
  if(place){controls.target.copy(ROOM_T);camera.position.copy(new THREE.Vector3().setFromSpherical(new THREE.Spherical(ui.dist,c.start[0],c.start[1])).add(ROOM_T));controls.update();}}

/* ---------- 최적화: 구역 정적 메쉬 병합 + 외곽선 통합 ----------
   구역 뿌리 아래 움직이지 않는 메시를 재질별로 하나로 합친다 (원래 메시는 '최적화 끄기'로 다시 볼 수 있게 숨겨 둔다) */
const _v=new THREE.Vector3(),_nm=new THREE.Matrix3();
function sig(m){const t=m.material;return [t.type,t.map?t.map.uuid:'',t.color?t.color.getHexString():'',t.transparent,t.opacity,t.side,t.emissive?t.emissive.getHexString()+t.emissiveIntensity:'',t.flatShading,t.polygonOffset,t.blending,t.depthWrite,m.castShadow,m.receiveShadow].join('|');}
function mergeStatic(z){
  z.root.updateMatrixWorld(true);
  const keepOut=new Set();z.keepOut.forEach(k=>k.traverse(o=>keepOut.add(o)));
  const buckets=new Map(),originals=[],origSet=new Set();
  z.root.traverse(o=>{
    if(!o.isMesh||keepOut.has(o))return;const t=o.material;
    const ok=!t.transparent||(t.isMeshBasicMaterial&&t.polygonOffset&&t.blending===THREE.NormalBlending);
    if(!ok)return;const k=sig(o);if(!buckets.has(k))buckets.set(k,[]);buckets.get(k).push(o);originals.push(o);origSet.add(o);
  });
  const lineSrc=[];z.root.traverse(o=>{if(o.isLineSegments&&origSet.has(o.parent))lineSrc.push(o);});
  const mergedRoot=new THREE.Group();z.root.add(mergedRoot);
  buckets.forEach(list=>{
    const pos=[],nor=[],uv=[];
    list.forEach(m=>{const g=m.geometry.index?m.geometry.toNonIndexed():m.geometry;const P=g.attributes.position,N=g.attributes.normal,U=g.attributes.uv;_nm.getNormalMatrix(m.matrixWorld);
      for(let i=0;i<P.count;i++){_v.fromBufferAttribute(P,i).applyMatrix4(m.matrixWorld);pos.push(_v.x,_v.y,_v.z);
        if(N){_v.fromBufferAttribute(N,i).applyMatrix3(_nm).normalize();nor.push(_v.x,_v.y,_v.z);}else nor.push(0,1,0);
        if(U)uv.push(U.getX(i),U.getY(i));else uv.push(0,0);}
    });
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
    const mm=new THREE.Mesh(g,list[0].material);mm.castShadow=list[0].castShadow;mm.receiveShadow=list[0].receiveShadow;mergedRoot.add(mm);
  });
  {const lp=[],lc=[];lineSrc.forEach(l=>{const P=l.geometry.attributes.position,c=l.material.color;for(let i=0;i<P.count;i++){_v.fromBufferAttribute(P,i).applyMatrix4(l.matrixWorld);lp.push(_v.x,_v.y,_v.z);lc.push(c.r,c.g,c.b);}});
    const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(lp,3));lg.setAttribute('color',new THREE.Float32BufferAttribute(lc,3));
    mergedRoot.add(new THREE.LineSegments(lg,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:0.5})));}
  z.merged={root:mergedRoot,originals};}
let optimized=true;
function setOpt(on){optimized=on;const m=zone.cur.merged;if(!m)return;m.originals.forEach(o=>o.visible=!on);m.root.visible=on;}
const optBtn=document.getElementById('optBtn'),statsEl=document.getElementById('stats');
optBtn.addEventListener('click',()=>{setOpt(!optimized);optBtn.textContent=optimized?'최적화 끄기':'최적화 켜기';ui.statT=1;});
/* 구역에 맞추기: 해 방향·그림자 범위, 방 카메라, 정적 병합 */
function setupView(z,area){
  sun.position.copy(new THREE.Vector3(0,0,0).sub(z.sun.dir.clone().multiplyScalar(16)));sun.target.position.set(0,0,0);
  const s=z.sun.shadow;Object.assign(sun.shadow.camera,{left:-s,right:s,top:s,bottom:-s,near:1,far:Math.max(40,s*2+24)});sun.shadow.camera.updateProjectionMatrix();
  setAreaCamera(z.areas[area].camera,true);
  mergeStatic(z);setOpt(optimized);}
setupView(zone.cur,zone.area);
export {ROOM_T,camera,controls,fill,follow,followDist,hemi,optimized,renderer,setAreaCamera,setupView,statsEl,sun,ui};
