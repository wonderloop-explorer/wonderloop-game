/* 텍스처 굽기 — tools/shot-server.py로 띄운 http://localhost:8000/?shot&nobake&zonetest 에서 (페이지가 다 뜬 뒤, 견본 구역까지 구우려면 zonetest)
   (await import('/tools/bake-textures.js')).run()
   그린 색연필 텍스처를 묶음별로 assets/textures/<묶음>/ 에 손실 없는 WebP로 굽고, 목록 textures.json을 쓴다.
   묶음: character(원더룹 재질 — 옷 전환·탈 포함)와 구역마다 하나(basecamp, sample-outdoor…). 굽기 전에 모든 구역을 한 번씩 들러 텍스처를 모은다.

   손으로 고친 파일 지키기:
   - 목록에서 "hand": true 인 텍스처는 건드리지 않는다.
   - 표시가 없어도, 파일의 픽셀이 지난번 구울 때 적어 둔 해시(px)와 다르면 손으로 고친 것으로 보고 건드리지 않은 채 hand: true를 붙인다.
   - 파일 이름을 .png로 바꿔 저장했다면 목록의 file도 그 이름으로 고쳐 둔다(굽기 도구는 그 줄을 그대로 둔다).
   돌려주는 값: 텍스처마다 [묶음, 파일, 크기, 원래 그림과 구운 파일의 픽셀 최대 차이, 상태] — 차이는 0이어야 한다. */

async function pxHash(data) {
  const d = new Uint8Array(await crypto.subtle.digest('SHA-1', data));
  return Array.from(d.slice(0, 8), b => b.toString(16).padStart(2, '0')).join('');
}
async function decode(blob) {
  const bm = await createImageBitmap(blob, { colorSpaceConversion: 'none', premultiplyAlpha: 'none' });
  const c = document.createElement('canvas'); c.width = bm.width; c.height = bm.height;
  const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(bm, 0, 0); bm.close();
  return g.getImageData(0, 0, c.width, c.height).data;
}
const pixels = cv => cv.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, cv.width, cv.height).data;
// 읽기 쉬운 파일 이름: 종류-색(-반복)-짧은 해시 / 하늘
function fileName(key, used) {
  let name;
  if (key.startsWith('sky|')) name = key.endsWith('1') ? 'sky-night' : 'sky-day';
  else {
    const [, color, kind, opts] = key.split('|'); const o = JSON.parse(opts);
    let h = 0; for (const ch of key) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
    name = `${kind}-${color.slice(1)}${o.rep ? '-r' + o.rep.join('x') : ''}-${h.toString(16).slice(0, 4)}`;
  }
  let n = name, i = 2; while (used.has(n)) n = `${name}-${i++}`; used.add(n);
  return n + '.webp';
}

export async function run() {
  if (!new URLSearchParams(location.search).has('nobake')) throw new Error('?shot&nobake 로 열어야 새로 그린 텍스처로 굽는다');
  const { TEXREG, TEXSET } = await import('/js/01-textures.js');
  const Z = window.wlZone, start = Z.cur.id;
  for (const id of Z.list) if (id !== start) await Z.go(id);
  await Z.go(start);
  const WL = window.wlShot.WL, charCanvas = new Set();
  const addMat = m => { if (m && m.map && m.map.image) charCanvas.add(m.map.image); };
  WL.traverse(o => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(addMat); });
  (WL.userData.outfitMats || []).forEach(addMat);
  const setOf = (key, cv) => charCanvas.has(cv) ? 'character' : TEXSET.get(key);
  const SETS = ['character', ...Z.list];
  const out = [];
  for (const set of SETS) {
    const dir = `/assets/textures/${set}/`;
    const old = await fetch(dir + 'textures.json', { cache: 'no-store' }).then(r => r.ok ? r.json() : { textures: [] }).catch(() => ({ textures: [] }));
    const byKey = new Map(old.textures.map(e => [e.key, e])), used = new Set(old.textures.map(e => e.file.replace(/\.\w+$/, '')));
    const list = [];
    for (const [key, cv] of TEXREG) {
      if (setOf(key, cv) !== set) continue;
      const prev = byKey.get(key);
      const e = prev ? { ...prev } : { key, file: fileName(key, used), w: cv.width, h: cv.height };
      const src = pixels(cv);
      if (prev) {
        const cur = await fetch(dir + prev.file, { cache: 'no-store' }).then(r => r.ok ? r.blob() : null);
        if (cur && !e.hand && prev.px && await pxHash(await decode(cur)) !== prev.px) { e.hand = true; }
        if (e.hand) { list.push(e); out.push([set, e.file, `${e.w}x${e.h}`, '-', '손으로 고침 — 그대로 둠']); continue; }
      }
      const blob = await new Promise(r => cv.toBlob(r, 'image/webp', 1));
      const back = await decode(blob);
      let max = 0; for (let i = 0; i < src.length; i++) { const d = Math.abs(src[i] - back[i]); if (d > max) max = d; }
      if (max) throw new Error(`손실 없이 구워지지 않음: ${key} (최대 차이 ${max})`);
      e.w = cv.width; e.h = cv.height; e.px = await pxHash(back); e.bytes = blob.size; delete e.hand;
      await fetch(`/save?path=../assets/textures/${set}/${e.file}`, { method: 'POST', body: blob });
      list.push(e); out.push([set, e.file, `${e.w}x${e.h}`, max, prev ? '다시 구움' : '새로 구움']);
    }
    // 목록에는 있지만 지금 안 쓰이는 텍스처(손으로 고친 것만 남김)
    for (const e of old.textures) if (!list.find(x => x.key === e.key) && e.hand) { list.push(e); out.push([set, e.file, '', '-', '안 쓰임 (손으로 고침이라 목록에 남김)']); }
    const doc = { note: '원더룹 구운 텍스처 목록 — tools/bake-textures.js가 쓴다. hand: true = 손으로 고친 파일(다시 구워도 덮어쓰지 않음). key는 텍스처를 찾는 열쇠라 고치지 않는다.', textures: list };
    await fetch(`/save?path=../assets/textures/${set}/textures.json`, { method: 'POST', body: JSON.stringify(doc, null, 1) });
  }
  return out;
}
