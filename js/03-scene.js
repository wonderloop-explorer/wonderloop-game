/* 원더룹 베이스캠프 — 조명·렌더러·카메라·방 최적화(병합) */
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {PI,rawLin,scene} from './01-textures.js';
import {ML,minute,sunDir} from './02-room.js';
/* ---------- 조명 ---------- */
const hemi=new THREE.HemisphereLight(rawLin(0xfff3dc),rawLin(0xd2ab88),0.62);scene.add(hemi);
const sun=new THREE.DirectionalLight(rawLin(0xffe0b0),0.72);
sun.position.copy(new THREE.Vector3(0,0,0).sub(sunDir.clone().multiplyScalar(16)));
sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-8,right:8,top:8,bottom:-8,near:1,far:40});
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
const target=new THREE.Vector3(0,1.5,-0.2);
const controls=new OrbitControls(camera,renderer.domElement);
controls.target.copy(target);controls.enableDamping=true;controls.dampingFactor=0.08;controls.enablePan=false;
controls.minDistance=3;controls.maxDistance=48;controls.minPolarAngle=0.55;controls.maxPolarAngle=1.32;
controls.minAzimuthAngle=0.12;controls.maxAzimuthAngle=1.45;
function placeCamera(){
  const w=stage.clientWidth,h=stage.clientHeight;const asp=w/h;
  camera.aspect=asp;camera.updateProjectionMatrix();renderer.setSize(w,h,false);
  return asp;
}
const asp0=placeCamera();
let dist=27*(asp0<1.25?Math.min(2.1,1.25/asp0):1);
const ROOM_T=new THREE.Vector3(0,1.5,-0.2);let follow=true;const ui={camGoal:7.5,statT:1};
{const cb=document.getElementById('camBtn');cb.addEventListener('click',()=>{follow=!follow;ui.camGoal=follow?7.5:dist;cb.textContent=follow?'카메라: 따라가기':'카메라: 방 전체';});}
const sph=new THREE.Spherical(dist,0.98,0.8);
camera.position.copy(new THREE.Vector3().setFromSpherical(sph).add(target));
controls.update();
window.addEventListener('resize',placeCamera);

/* ---------- 최적화: 정적 메쉬 병합 + 외곽선 통합 ---------- */
scene.updateMatrixWorld(true);
const keepOut=new Set();ML.traverse(o=>keepOut.add(o));keepOut.add(minute);
function sig(m){const t=m.material;return [t.type,t.map?t.map.uuid:'',t.color?t.color.getHexString():'',t.transparent,t.opacity,t.side,t.emissive?t.emissive.getHexString()+t.emissiveIntensity:'',t.flatShading,t.polygonOffset,t.blending,t.depthWrite,m.castShadow,m.receiveShadow].join('|');}
const buckets=new Map(),originals=[],origSet=new Set();
scene.traverse(o=>{
  if(!o.isMesh||keepOut.has(o))return;const t=o.material;
  const ok=!t.transparent||(t.isMeshBasicMaterial&&t.polygonOffset&&t.blending===THREE.NormalBlending);
  if(!ok)return;const k=sig(o);if(!buckets.has(k))buckets.set(k,[]);buckets.get(k).push(o);originals.push(o);origSet.add(o);
});
const lineSrc=[];scene.traverse(o=>{if(o.isLineSegments&&origSet.has(o.parent))lineSrc.push(o);});
const mergedRoot=new THREE.Group();scene.add(mergedRoot);
const _v=new THREE.Vector3(),_nm=new THREE.Matrix3();
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
let optimized=true;
function setOpt(on){optimized=on;originals.forEach(o=>o.visible=!on);mergedRoot.visible=on;}
setOpt(true);
const optBtn=document.getElementById('optBtn'),statsEl=document.getElementById('stats');
optBtn.addEventListener('click',()=>{setOpt(!optimized);optBtn.textContent=optimized?'최적화 끄기':'최적화 켜기';ui.statT=1;});
export {ROOM_T,camera,controls,fill,follow,hemi,optimized,renderer,statsEl,sun,ui};
