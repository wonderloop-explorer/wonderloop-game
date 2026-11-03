/* 가림 시험 — 큰 잎·줄기·집 벽 뒤의 원더룹(핀 화관)이 까맣게 나오지 않는지 (2026-11-02 — 컴퓨터의 덧그리기·윤곽선이 원더룹을 까맣게 칠한 일이 있었다)
   tools/shot-server.py 로 띄운 http://localhost:8000/?shot&zone=fairy-dock (휴대폰 단계는 &quality=mobile) 에서
   (await import('/tools/occlude-test.js')).run('occlude/pc')   // docs/occlude/pc/ 아래에 장면 PNG와 result.json, 결과를 돌려준다
   장면마다 세 번 그린다: A 그대로 · B 구역을 숨기고 원더룹만 · C 원더룹도 숨김. B와 C가 다른 화소 = 원더룹 자리.
   그 자리에서 B(원더룹 본래 색)보다 A가 절반 넘게 어두운 화소가 5%를 넘거나, A의 평균 밝기가 B의 45%보다 어두우면 실패.
   가리는 물체가 실제로 흐려지지 않은 장면(game/occlude 목록에 흐림 0.5 넘는 것이 없음)도 실패 — 시험이 헛돌지 않게.
   막 시험(wash, 2026-11-03 — 머리 위 잎 지붕·꽃지붕 집이 흐려지면 화면에 뿌연 연두·분홍 막이 씌워졌다): 큰 물체가 화면을 크게 덮는 장면에서
   흐려진 물체를 아예 숨긴 화면(D)과 비교해 화면 전체 평균 색 차이(washDiff, 0~1)가 WASH_MAX를 넘으면 실패. */
const SCENES = [
  { name: 'big-leaf', place: [-4.4, 6.6, Math.PI], view: { az: Math.PI, pol: .85, dist: 8 } },
  { name: 'stem', place: [-7.4, 2.4, 0], view: { az: 0, pol: 1.35, dist: 6 } },
  { name: 'house-wall', place: [-3.2, -12.9, 0], view: { az: 0, pol: 1.35, dist: 6 } },
  { name: 'canopy-above', place: [-3.0, 2.6, Math.PI], view: { az: Math.PI, pol: .55, dist: 8 }, wash: true },
  { name: 'house-close', place: [-3.2, -12.9, 0], view: { az: 0, pol: 1.25, dist: 6 }, wash: true },
  { name: 'layers', place: [-4.4, 6.6, Math.PI], view: { az: Math.PI, pol: .85, dist: 8 }, wash: true },
];
const WASH_MAX = .025;
const lum = (d, i) => (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;
async function pixels(url) {
  const img = new Image(); img.src = url; await img.decode();
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const g = c.getContext('2d'); g.drawImage(img, 0, 0); return g.getImageData(0, 0, c.width, c.height).data;
}
export async function run(dir = null, { scenes = SCENES } = {}) {
  const s = window.wlShot, out = [];
  s.WL.userData.setHood('crownBloom'); s.step(30);
  for (const sc of scenes) {
    s.place(...sc.place); s.view(sc.view); s.step(45); s.view(sc.view); s.step(1);
    const faded = s.game.occlude.list().filter(o => o.k > .5 || o.f > .5).length;
    const A = s.capture();
    let D = null; if (sc.wash) { const back = s.game.occlude.hideFaded(); D = s.capture(); back(); }
    const vis = [];
    s.scene.children.forEach(o => { if (o !== s.WL && o.visible && !o.isLight) { vis.push(o); o.visible = false; } });
    const B = s.capture();
    s.WL.visible = false; const C = s.capture(); s.WL.visible = true;
    vis.forEach(o => { o.visible = true; });
    const [a, b, c] = await Promise.all([pixels(A), pixels(B), pixels(C)]);
    let n = 0, dark = 0, sa = 0, sb = 0;
    for (let i = 0; i < a.length; i += 4) {
      if (Math.abs(b[i] - c[i]) + Math.abs(b[i + 1] - c[i + 1]) + Math.abs(b[i + 2] - c[i + 2]) < 24) continue;
      const la = lum(a, i), lb = lum(b, i); n++; sa += la; sb += lb;
      if (lb > .2 && la < .55 * lb) dark++; // 원더룹 본래 색보다 절반 넘게 어두워진 화소(반투명 0.3 물체가 덮어도 이만큼 어두워지지는 않는다)
    }
    const darkFrac = n ? dark / n : 0, ratio = sb ? sa / sb : 1;
    let wash = null;
    if (D) { const d = await pixels(D); let sum = 0; for (let i = 0; i < a.length; i += 4) sum += Math.abs(a[i] - d[i]) + Math.abs(a[i + 1] - d[i + 1]) + Math.abs(a[i + 2] - d[i + 2]); wash = sum / (a.length / 4) / 3 / 255; }
    const ok = faded > 0 && n > 500 && darkFrac <= .05 && ratio >= .45 && (wash == null || wash <= WASH_MAX);
    out.push({ name: sc.name, ok, faded, wlPixels: n, darkFrac: +darkFrac.toFixed(4), brightRatio: +ratio.toFixed(3), ...(wash != null ? { washDiff: +wash.toFixed(4) } : {}) });
    if (dir) await fetch(`/save?path=${dir}/${sc.name}.png`, { method: 'POST', body: A });
  }
  const res = { quality: new URLSearchParams(location.search).get('quality') || 'high', pass: out.every(r => r.ok), scenes: out };
  if (dir) await fetch(`/save?path=${dir}/result.json`, { method: 'POST', body: JSON.stringify(res, null, 1) });
  return res;
}
