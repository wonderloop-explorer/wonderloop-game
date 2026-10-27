/* 원더룹 베이스캠프 — 조명·렌더러·카메라·방 최적화(병합) */
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {scene} from './01-textures.js';
import {ML,minute,sunDir} from './02-room.js';
/* ---------- 조명 ---------- */
const hemi=new THREE.HemisphereLight(0xfff3dc,0xd2ab88,0.62);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffe0b0,0.72);
sun.position.copy(new THREE.Vector3(0,0,0).sub(sunDir.clone().multiplyScalar(16)));
sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-8,right:8,top:8,bottom:-8,near:1,far:40});
sun.shadow.bias=-0.0006;sun.shadow.normalBias=0.03;scene.add(sun);
const fill=new THREE.DirectionalLight(0xe2e9ff,0.22);fill.position.set(10,6,9);scene.add(fill);

/* ---------- 렌더러 / 카메라 ---------- */
const stage=document.getElementById('stage');
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
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
