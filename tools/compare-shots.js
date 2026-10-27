/* 두 촬영 폴더를 픽셀 단위로 비교 — (await import('/tools/compare-shots.js')).compare('baseline/r128', 'compare/module-r128')
   결과: 장면마다 달라진 픽셀 비율·최대 차이, 차이가 있으면 <b>/diff-<이름>.png 저장 (달라진 곳을 빨갛게 표시) */
import { SHOTS } from './baseline-shots.js';

const load = src => new Promise((ok, err) => { const i = new Image(); i.onload = () => ok(i); i.onerror = err; i.src = src; });
function pixels(img) {
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const g = c.getContext('2d'); g.drawImage(img, 0, 0); return g.getImageData(0, 0, c.width, c.height);
}

export async function compare(a, b, thr = 8) {
  const out = {};
  for (const { name } of SHOTS) {
    const [A, B] = await Promise.all([a, b].map(d => load(`/docs/${d}/${name}.png?${Date.now()}`).then(pixels)));
    const D = new ImageData(A.width, A.height);
    let changed = 0, max = 0, sum = 0;
    for (let i = 0; i < A.data.length; i += 4) {
      const d = Math.max(Math.abs(A.data[i] - B.data[i]), Math.abs(A.data[i + 1] - B.data[i + 1]), Math.abs(A.data[i + 2] - B.data[i + 2]), Math.abs(A.data[i + 3] - B.data[i + 3]));
      sum += d; if (d > max) max = d;
      const g = (A.data[i] + A.data[i + 1] + A.data[i + 2]) / 3 * 0.35;
      if (d > thr) { changed++; D.data.set([255, 40, 40, 255], i); } else D.data.set([g, g, g, 255], i);
    }
    const n = A.width * A.height;
    out[name] = { changedPct: +(changed / n * 100).toFixed(3), maxDiff: max, meanDiff: +(sum / n).toFixed(3) };
    if (changed) {
      const c = document.createElement('canvas'); c.width = A.width; c.height = A.height; c.getContext('2d').putImageData(D, 0, 0);
      await fetch(`/save?path=${b}/diff-${name}.png`, { method: 'POST', body: c.toDataURL('image/png') });
    }
  }
  return out;
}
