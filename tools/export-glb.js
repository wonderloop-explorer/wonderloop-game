/* 뼈대 포함 GLB 내보내기 — tools/shot-server.py로 띄운 http://localhost:8000/?shot 에서
   (await import('/tools/export-glb.js')).run()
   → assets/models/wonderloop-rigged.glb(평상복), -explorer.glb(탐험복), -explorer-hat.glb(탐험복+모자)
   이름 붙은 뼈(hips·spine·thigh.L…)만 남기고, 보이는 부품은 가장 가까운 뼈에 100% 붙여 재질별 SkinnedMesh로 묶는다.
   자세는 '서기'의 기본 자세(팔은 옆으로 살짝, 팔꿈치 살짝 굽힘), 표정은 '기본'. */
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

const VARIANTS = [
  { file: 'wonderloop-rigged.glb', outfit: 0, hood: 0 },
  { file: 'wonderloop-rigged-explorer.glb', outfit: 1, hood: 0 },
  { file: 'wonderloop-rigged-explorer-hat.glb', outfit: 1, hood: 2 },
];
// 기본 자세 (07 updateWL이 가만히 서 있을 때 쓰는 값)
const REST = { 'upperarm.R': [0, 0, -.32], 'upperarm.L': [0, 0, .32], 'forearm.R': [-.12, 0, 0], 'forearm.L': [-.12, 0, 0] };

function restPose(WL) {
  const saved = [];
  WL.traverse(o => {
    if (!o.isBone) return;
    saved.push([o, o.position.clone(), o.quaternion.clone(), o.scale.clone()]);
    o.rotation.set(...(REST[o.name] || [0, 0, 0]));
    if (o.name.startsWith('thigh')) o.position.y = .3;
    if (o.name === 'spine') o.position.set(0, 0, 0);
    if (o.name.startsWith('eye')) o.scale.set(1, 1, 1);
  });
  return () => saved.forEach(([o, p, q, s]) => { o.position.copy(p); o.quaternion.copy(q); o.scale.copy(s); });
}

function build(WL) {
  WL.updateMatrixWorld(true);
  const toWL = new THREE.Matrix4().copy(WL.matrixWorld).invert();
  const visible = o => { for (let q = o; q && q !== WL; q = q.parent) if (!q.visible) return false; return true; };
  const ownerBone = o => { let q = o; while (q && !q.isBone) q = q.parent; return q; };
  const parts = [];
  WL.traverse(o => { if (o.isMesh && !o.isSkinnedMesh && visible(o)) parts.push(o); });
  // 쓰이는 뼈와 그 조상만 남김
  const used = new Set();
  parts.forEach(o => { for (let b = ownerBone(o); b; b = b.parent) if (b.isBone) used.add(b); });
  const src = [], copy = new Map();
  WL.traverse(o => { if (used.has(o)) src.push(o); });
  const root = new THREE.Group(); root.name = 'wonderloop';
  src.forEach(b => {
    const nb = new THREE.Bone(); nb.name = b.name; copy.set(b, nb);
    let p = b.parent; while (p && !used.has(p)) p = p.parent;
    const parentW = p ? p.matrixWorld : WL.matrixWorld;
    new THREE.Matrix4().copy(parentW).invert().multiply(b.matrixWorld).decompose(nb.position, nb.quaternion, nb.scale);
    (p ? copy.get(p) : root).add(nb);
  });
  root.updateMatrixWorld(true);
  const bones = src.map(b => copy.get(b)), skel = new THREE.Skeleton(bones);
  // 재질별로 정점을 원더룹 기준 좌표로 모음
  const groups = new Map(), nm = new THREE.Matrix3(), v = new THREE.Vector3(), M = new THREE.Matrix4();
  parts.forEach(o => {
    const g = o.geometry, ms = Array.isArray(o.material) ? o.material : [o.material], bi = bones.indexOf(copy.get(ownerBone(o)));
    const ranges = g.groups.length && Array.isArray(o.material) ? g.groups : [{ start: 0, count: g.index ? g.index.count : g.attributes.position.count, materialIndex: 0 }];
    M.multiplyMatrices(toWL, o.matrixWorld); nm.getNormalMatrix(M);
    ranges.forEach(r => {
      const mat = ms[r.materialIndex]; if (!groups.has(mat)) groups.set(mat, { pos: [], nor: [], uv: [], si: [], idx: [], n: 0 });
      const G = groups.get(mat), P = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv, used = new Map();
      for (let k = r.start; k < r.start + r.count; k++) {
        const i = g.index ? g.index.getX(k) : k;
        if (!used.has(i)) {
          used.set(i, G.n++);
          v.fromBufferAttribute(P, i).applyMatrix4(M); G.pos.push(v.x, v.y, v.z);
          if (N) v.fromBufferAttribute(N, i).applyMatrix3(nm).normalize(); else v.set(0, 1, 0); G.nor.push(v.x, v.y, v.z);
          G.uv.push(U ? U.getX(i) : 0, U ? U.getY(i) : 0); G.si.push(bi, 0, 0, 0);
        }
        G.idx.push(used.get(i));
      }
    });
  });
  let n = 0;
  groups.forEach((G, mat) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(G.pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(G.nor, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(G.uv, 2)); g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(G.si, 4));
    g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(G.si.map((_, i) => i % 4 ? 0 : 1), 4)); g.setIndex(G.idx);
    const m = mat.clone(); m.onBeforeCompile = () => {}; m.name = m.name || `wl-${String(++n).padStart(2, '0')}-${mat.color.getHexString()}`;
    const sm = new THREE.SkinnedMesh(g, m); sm.name = m.name; root.add(sm); sm.bind(skel, new THREE.Matrix4());
  });
  return { root, bones: bones.map(b => b.name), meshes: groups.size };
}

export async function run() {
  const s = window.wlShot, WL = s.WL, out = [];
  for (const V of VARIANTS) {
    s.setup({ outfit: V.outfit, hood: V.hood, action: '서기', expr: '기본' }); s.step(30);
    const undo = restPose(WL);
    const { root, bones, meshes } = build(WL);
    undo();
    const glb = await new GLTFExporter().parseAsync(root, { binary: true });
    await fetch(`/save?path=../assets/models/${V.file}`, { method: 'POST', body: glb });
    out.push({ file: V.file, bones, meshes, bytes: glb.byteLength });
  }
  return out;
}
