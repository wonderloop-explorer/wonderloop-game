/* 두 촬영 폴더의 같은 장면을 나란히 붙인 비교 이미지 — (await import('/tools/side-by-side.js')).make('baseline/r128','compare/r186',['room-day'],'compare/sbs')
   차이가 큰 칸(격자 40px, 평균 차이 thr 이상)을 오른쪽 그림에 빨간 테두리로 표시한다. crop:[x,y,w,h]를 주면 그 부분만 확대해 붙인다. */
const load = src => new Promise((ok, err) => { const i = new Image(); i.onload = () => ok(i); i.onerror = err; i.src = src; });

export async function make(a, b, names, out, { labels = [a, b], thr = 6, crop = null, scale = 1, cell = 40 } = {}) {
  const saved = [];
  for (const name of names) {
    const [A, B] = await Promise.all([a, b].map(d => load(`/docs/${d}/${name}.png?${Date.now()}`)));
    const [x, y, w, h] = crop || [0, 0, A.width, A.height];
    const W = Math.round(w * scale), H = Math.round(h * scale), pad = 12, top = 40;
    const c = document.createElement('canvas'); c.width = W * 2 + pad * 3; c.height = H + top + pad;
    const g = c.getContext('2d');
    g.fillStyle = '#2a2420'; g.fillRect(0, 0, c.width, c.height);
    g.imageSmoothingEnabled = scale < 1;
    g.drawImage(A, x, y, w, h, pad, top, W, H);
    g.drawImage(B, x, y, w, h, pad * 2 + W, top, W, H);
    g.fillStyle = '#f2e5cf'; g.font = 'bold 22px sans-serif';
    g.fillText(`${labels[0]} — ${name}`, pad, 28); g.fillText(labels[1], pad * 2 + W, 28);
    // 차이 표시
    const pa = px(A, x, y, w, h), pb = px(B, x, y, w, h);
    g.strokeStyle = '#ff3b3b'; g.lineWidth = 2;
    let marked = 0;
    for (let cy = 0; cy < h; cy += cell) for (let cx = 0; cx < w; cx += cell) {
      let s = 0, n = 0;
      for (let yy = cy; yy < Math.min(h, cy + cell); yy++) for (let xx = cx; xx < Math.min(w, cx + cell); xx++) {
        const i = (yy * w + xx) * 4; s += (Math.abs(pa[i] - pb[i]) + Math.abs(pa[i + 1] - pb[i + 1]) + Math.abs(pa[i + 2] - pb[i + 2])) / 3; n++;
      }
      if (s / n >= thr) { marked++; g.strokeRect(pad * 2 + W + cx * scale, top + cy * scale, cell * scale, cell * scale); }
    }
    const file = `${out}/${name}${crop ? '-crop' : ''}.png`;
    await fetch(`/save?path=${file}`, { method: 'POST', body: c.toDataURL('image/png') });
    saved.push({ file, marked });
  }
  return saved;
}

function px(img, x, y, w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); g.drawImage(img, x, y, w, h, 0, 0, w, h); return g.getImageData(0, 0, w, h).data;
}
