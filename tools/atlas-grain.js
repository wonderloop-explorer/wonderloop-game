/* 아틀라스 결 비교 — tools/shot-server.py로 띄운 http://localhost:8000/?shot 에서
   (await import('/tools/atlas-grain.js')).run('compare/atlas-grain')
   아틀라스의 층마다, 원래 텍스처(반복 포함)와 아틀라스 층을 같은 사각형에 그려 픽셀을 비교한다.
   사각형은 반복 칸으로 -0.15~1.15칸을 보여 줘 반복 이음매를 지나간다. 크기는 1:1(텍셀 하나 = 픽셀 하나), 1/2, 1/4, 1/8(밉맵 단계),
   그리고 비스듬히(가로 1:1·세로 1/6, 비등방 필터). 결과: <dir>/grain.json(층별 차이), <dir>/<층>-<크기>-o|a.png(원래|아틀라스).
   id(): 층마다 다른 단색으로 바꿔 캐릭터를 찍는다(층 번호가 부품마다 맞게 잡혔는지 보는 용도) → <dir>/id-*.png */
import * as THREE from 'three';

const CASES = [['1', 1, 1], ['2', 1 / 2, 1 / 2], ['4', 1 / 4, 1 / 4], ['8', 1 / 8, 1 / 8], ['tilt', 1, 1 / 6]];
const T0 = -.15, T1 = 1.15, S = 256;

async function save(path, cv) {
  const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
  await fetch(`/save?path=${path}`, { method: 'POST', body: blob });
}
function toCanvas(px, w, h) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d'), im = g.createImageData(w, h);
  for (let y = 0; y < h; y++) im.data.set(px.subarray((h - 1 - y) * w * 4, (h - y) * w * 4), y * w * 4); // 렌더 타깃은 아래에서 위로
  g.putImageData(im, 0, 0); return cv;
}
// 원래 재질 텍스처: 부품·탐험복 재질에서 캔버스 → 텍스처
function originals(WL) {
  const m = new Map(), add = mat => { if (mat && mat.map && !m.has(mat.map.image)) m.set(mat.map.image, mat.map); };
  WL.userData.rig.parts.forEach(o => (Array.isArray(o.material) ? o.material : [o.material]).forEach(add));
  (WL.userData.outfitMats || []).forEach(add);
  return m;
}

export async function run(dir = 'compare/atlas-grain') {
  window.wlShot.setup({ outfit: 0, hood: 0 }); // 평상복 재질은 평상복일 때만 부품에 붙어 있다 (탐험복 재질은 outfitMats)
  const { renderer, WL } = window.wlShot, A = WL.userData.atlas, orig = originals(WL);
  const scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(0, 1, 1, 0, -1, 1);
  const geo = new THREE.PlaneGeometry(1, 1).translate(.5, .5, 0);
  const quad = new THREE.Mesh(geo); scene.add(quad);
  const basic = new THREE.MeshBasicMaterial();
  const arr = new THREE.MeshBasicMaterial();
  const U = { uArr: { value: A.tex }, uLayer: { value: 0 }, uRep: { value: new THREE.Vector2(1, 1) } };
  arr.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = 'uniform vec2 uRep;varying vec2 vWlUv;\n' + sh.vertexShader.replace('#include <uv_vertex>', '#include <uv_vertex>\nvWlUv=uv*uRep;');
    sh.fragmentShader = 'uniform highp sampler2DArray uArr;uniform float uLayer;varying vec2 vWlUv;\n' + sh.fragmentShader.replace('#include <map_fragment>', 'diffuseColor*=texture(uArr,vec3(vWlUv,uLayer));');
  };
  arr.customProgramCacheKey = () => 'wlgrain';
  const uv = geo.attributes.uv, rt = new THREE.WebGLRenderTarget(8, 8);
  rt.texture.colorSpace = THREE.SRGBColorSpace;
  const shoot = (mat, w, h) => {
    quad.material = mat; rt.setSize(w, h); renderer.setRenderTarget(rt); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(scene, cam);
    const px = new Uint8Array(w * h * 4); renderer.readRenderTargetPixels(rt, 0, 0, w, h, px); renderer.setRenderTarget(null); return px;
  };
  const prevClear = renderer.getClearColor(new THREE.Color()), prevA = renderer.getClearAlpha();
  const rows = [];
  for (let i = 1; i < A.order.length; i++) {
    const img = A.order[i]; if (!img) continue;
    const t = orig.get(img); if (!t) { rows.push({ layer: i, missing: true }); continue; }
    const rx = t.repeat.x, ry = t.repeat.y;
    // 반복 칸 기준 T0~T1 → 원래 uv(반복 곱하기 전)
    for (let k = 0; k < 4; k++) uv.setXY(k, [T0, T1][k % 2] / rx, [T1, T0][k >> 1] / ry);
    uv.needsUpdate = true;
    basic.map = t; basic.needsUpdate = true; U.uLayer.value = i; U.uRep.value.set(rx, ry);
    const row = { layer: i, region: A.region(i), rep: [rx, ry], key: (t.userData && t.userData.key) || '', cases: {} };
    for (const [name, sx, sy] of CASES) {
      const w = Math.round((T1 - T0) * S * sx), h = Math.round((T1 - T0) * S * sy);
      const a = shoot(basic, w, h), b = shoot(arr, w, h);
      let max = 0, n0 = 0, n2 = 0, n8 = 0, sum = 0;
      for (let p = 0; p < a.length; p += 4) {
        const d = Math.max(Math.abs(a[p] - b[p]), Math.abs(a[p + 1] - b[p + 1]), Math.abs(a[p + 2] - b[p + 2]));
        if (d > max) max = d; if (d > 0) n0++; if (d > 2) n2++; if (d > 8) n8++; sum += d;
      }
      const n = a.length / 4;
      row.cases[name] = { w, h, max, pct0: +(100 * n0 / n).toFixed(4), pct2: +(100 * n2 / n).toFixed(4), pct8: +(100 * n8 / n).toFixed(4), mean: +(sum / n).toFixed(4) };
      if (name === '1' || name === '8' || name === 'tilt') { await save(`${dir}/${i}-${name}-o.png`, toCanvas(a, w, h)); await save(`${dir}/${i}-${name}-a.png`, toCanvas(b, w, h)); }
    }
    rows.push(row);
  }
  renderer.setClearColor(prevClear, prevA); rt.dispose();
  await fetch(`/save?path=${dir}/grain.json`, { method: 'POST', body: JSON.stringify(rows, null, 1) });
  return rows.map(r => [r.layer, r.region, r.rep && r.rep.join('x'), r.cases && Object.values(r.cases).map(c => c.max).join('/')].join(' '));
}

/* 층 번호 확인: 층마다 다른 단색을 채워(0번 흰 층은 그대로) 찍고, 끝나면 원래대로 되돌린다 */
const AZ = { front: 0, 34: Math.PI / 4, back: Math.PI };
export async function id(dir = 'compare/atlas-grain', views = ['front', '34', 'back']) {
  const s = window.wlShot; s.size(800, 500);
  const A = s.WL.userData.atlas, d = A.tex.image.data, keep = d.slice(), L = S * S * 4, c = new THREE.Color();
  for (let i = 1; i < A.tex.image.depth; i++) {
    c.setHSL((i * .618) % 1, .85, i % 2 ? .45 : .62); const r = c.r * 255 | 0, g = c.g * 255 | 0, b = c.b * 255 | 0;
    for (let p = i * L; p < (i + 1) * L; p += 4) { d[p] = r; d[p + 1] = g; d[p + 2] = b; }
  }
  A.tex.needsUpdate = true;
  const out = [];
  for (const [look, o] of Object.entries({ casual: { outfit: 0, hood: 0 }, hat: { outfit: 1, hood: 2 }, ant: { outfit: 1, hood: 1 } })) {
    s.setup({ ...o, action: '서기', expr: '기본' }); s.step(4);
    for (const v of views) { s.view({ pol: 1.38, dist: 3.8, az: AZ[v] }); await fetch(`/save?path=${dir}/id-${look}-${v}.png`, { method: 'POST', body: s.capture() }); out.push(`id-${look}-${v}`); }
  }
  d.set(keep); A.tex.needsUpdate = true;
  return out;
}
