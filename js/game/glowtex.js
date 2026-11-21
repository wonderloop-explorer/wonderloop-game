/* 빛무리·부드러운 그러데이션 텍스처 — 화소마다 직접 계산(시리즈 공통, 2026-11-21. 설명 docs/green-dots.md)
   왜: 캔버스 그러데이션(createRadialGradient·createLinearGradient)으로 만든 반투명 빛 그림은 아이폰에서 색 있는 점 무리가 된다.
     ① 아이폰 사파리는 캔버스 그러데이션에 색 잡음(디더링)을 섞는다
     ② 캔버스는 색을 알파에 곱한 8비트로 들고 있어 알파가 낮은 화소는 색이 몇 단계뿐 — 텍스처로 올릴 때 다시 나누면 빨강·파랑이 깎여 녹색·노란 점이 된다
   개미굴(antvillage) 지네 동굴 버섯 조명에서 같은 일이 있었고 그때 빛무리 그림 HALO를 화소마다 계산한 DataTexture로 바꿔 고쳤다 — 같은 방법.
   쓰는 법: 빛무리·해·빛 띠·부드러운 점처럼 "투명으로 옅어지는" 그림은 캔버스 그러데이션 대신 여기 함수로.
     radialTex(n, [[자리 0~1, r, g, b, 알파 0~1], …], {w, h})  가운데에서 바깥으로(w·h가 다르면 타원)
     gradTex(w, h, (u, v) => [r, g, b, 알파])                 마음대로(u·v 0~1, v는 아래가 0)
   색은 알파에 곱하지 않은 값 그대로 — 알파 0인 곳도 색은 옆 화소와 같게(가장자리에 어두운·엉뚱한 색이 번지지 않음). */
import * as THREE from 'three';
export function gradTex(w, h, fn) {
  const d = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const c = fn((x + .5) / w, (y + .5) / h), i = (y * w + x) * 4;
    d[i] = Math.round(c[0]); d[i + 1] = Math.round(c[1]); d[i + 2] = Math.round(c[2]); d[i + 3] = Math.round(Math.max(0, Math.min(1, c[3])) * 255); }
  const t = new THREE.DataTexture(d, w, h, THREE.RGBAFormat); t.colorSpace = THREE.SRGBColorSpace;
  t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true; t.needsUpdate = true; return t;
}
/* 자리 순서대로 적은 색 목록에서 r(0~1) 자리의 색 */
export function stopAt(stops, r) {
  if (r <= stops[0][0]) return stops[0].slice(1); const L = stops[stops.length - 1]; if (r >= L[0]) return L.slice(1);
  for (let i = 1; i < stops.length; i++) { const a = stops[i - 1], b = stops[i]; if (r <= b[0]) { const k = (r - a[0]) / Math.max(1e-6, b[0] - a[0]); return [1, 2, 3, 4].map(j => a[j] + (b[j] - a[j]) * k); } }
  return L.slice(1);
}
export function radialTex(n, stops, { w = n, h = n } = {}) {
  return gradTex(w, h, (u, v) => { const c = stopAt(stops, Math.hypot(u - .5, v - .5) * 2); if (Math.hypot(u - .5, v - .5) * 2 >= 1) c[3] = 0; return c; });
}
