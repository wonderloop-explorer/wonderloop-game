/* 휴대폰 확인 (구역 하나가 끝날 때마다) — 컴퓨터에서 미리 잡을 수 있는 것을 자동으로 본다. 기기에서만 알 수 있는 것은 CLAUDE.md "휴대폰 확인 순서".
   크롬 개발자 도구의 기기 모드(iPhone 14, 390×844 세로) 또는 헤드리스 390×844에서
   http://localhost:8000/?shot&zone=<구역>  (견본은 &zonetest) 페이지가 다 뜬 뒤
   (await import('/tools/phone-check.js')).run({x, z})  →  [{항목, 결과, 내용}]   (x, z: 원더룹을 세워 볼 자리, 없으면 시작 자리)
   1. 세로 화면 카드 가림: 대화창(두 줄 대사)·안내 카드·비밀 카드·결과창을 하나씩 띄워, 화면 밖으로 넘치는지와 원더룹(머리·몸)을 얼마나 가리는지
   2. 빛 번짐: 낮·저녁·어두운 굴에서 하얗게 날아간 화소(세 색 모두 250 이상) 비율 — 2% 넘으면 고칠 것(아이폰 화면은 더 밝게 보인다)
   3. 소리: 소리 깨우기·무음 모드 대응(audioSession) 설정 확인 — 실제 무음 모드 소리는 아이폰에서 손으로 확인 */
const OK = '통과', WARN = '주의', FIX = '고칠 것';
export async function run(o = {}) {
  const s = window.wlShot, G = s.game, WL = s.WL, out = [], add = (항목, 결과, 내용) => out.push({ 항목, 결과, 내용 });
  const W = innerWidth, H = innerHeight, cv = s.renderer.domElement;
  s.size(Math.round(W), Math.round(H));
  if (o.x != null) s.place(o.x, o.z, o.ry); s.setup({ outfit: 1, follow: true }); s.step(240);
  // 원더룹 화면 위치 (CSS 픽셀)
  const bones = []; WL.traverse(b => { if (b.isBone) bones.push(b); });
  const wlRect = (only) => { WL.updateMatrixWorld(true); s.camera.updateMatrixWorld(); const r = cv.getBoundingClientRect(); let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const b of bones) { if (only && !only.test(b.name)) continue; const p = b.getWorldPosition(b.position.clone()).project(s.camera); const x = r.left + (p.x + 1) / 2 * r.width, y = r.top + (1 - p.y) / 2 * r.height;
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    const pad = Math.max(8, (y1 - y0) * .25); return { left: x0 - pad, right: x1 + pad, top: y0 - pad * 1.4, bottom: y1 + pad * .5 }; };
  const cover = (a, b) => { const w = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)), h = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    return w * h / Math.max(1, (a.right - a.left) * (a.bottom - a.top)); };
  const fits = r => r.left >= 8 && r.right <= W - 8 && r.top >= 0 && r.bottom <= H;
  const flush = async () => { for (let i = 0; i < 3; i++) await new Promise(r => requestAnimationFrame(r)); };
  // 1. 세로 화면 카드 가림
  const wl = wlRect(), body = wlRect(/^(hips|spine|thigh|shin|foot|upperarm|forearm)/);   // 원더룹 전체·몸(머리 빼고)
  { const h = (wl.bottom - wl.top) / H; add('세로 화면 · 원더룹 크기', h > .6 ? WARN : h < .08 ? WARN : OK, `화면 높이의 ${Math.round(h * 100)}%${h > .6 ? ' — 카메라가 너무 가까움' : h < .08 ? ' — 너무 작음' : ''}`); }
  const cards = [
    ['대화창', () => G.ui.showDialog('견본 손님', '어서 와! 여기는 세로 화면에서 대화창이 원더룹을 가리는지 보는 두 줄짜리 대사예요.', 'E로 계속'), () => G.ui.hideDialog(), '#wlDlg'],
    ['안내 카드', () => { G.ui.notice({ title: '서재로 가 봐요', text: '문간을 지나면 카메라가 서재를 비춰요. 서재의 견본 손님에게 말을 걸어 보세요.' }); }, () => G.ui.closeNotice(), '#wlNotice'],
    ['비밀 카드', () => { G.ui.secret({ title: '숨겨진 비밀', text: '세로 화면에서 비밀 카드가 넘치지 않는지 보는 문장이에요. 두세 줄 정도 됩니다.', count: '✦ 발견한 비밀 1/5' }); }, () => G.ui.closeSecret(), '#wlSecret .card'],
    ['결과창', () => { G.ui.result({ title: '탐험 성공', text: '결과창 문장이 세로 화면에 들어가는지 봐요.', buttons: [{ label: '계속' }, { label: '다시 하기' }] }); }, () => G.ui.chooseResult(0), '#wlResult .card'],
  ];
  for (const [name, open, close, sel] of cards) {
    open(); s.step(2); await flush(); const r = document.querySelector(sel).getBoundingClientRect();
    const cv2 = Math.max(cover(wl, r), cover(body, r)), fit = fits(r), modal = name === '비밀 카드' || name === '결과창';
    const res = !fit ? FIX : modal ? OK : cv2 > .25 ? FIX : cv2 > .05 ? WARN : OK;
    add(`세로 화면 · ${name}`, res, `${fit ? '화면 안' : '화면 밖으로 넘침'}, 원더룹(전체·몸 중 큰 쪽)을 ${Math.round(cv2 * 100)}% 가림${modal ? ' (가운데 창 — 가림 허용)' : ''} · 카드 ${Math.round(r.width)}×${Math.round(r.height)} (${Math.round(r.top)}~${Math.round(r.bottom)})`);
    close(); s.step(2); await flush();
  }
  // 2. 빛 번짐: 조명 단계마다 하얗게 날아간 화소
  const tmp = document.createElement('canvas'); tmp.width = 200; tmp.height = Math.round(200 * H / W); const g = tmp.getContext('2d', { willReadFrequently: true });
  for (const [light, name] of [[0, '낮'], [1, '저녁'], [2, '어두운 굴']]) {
    s.setup({ light }); s.step(240); s.capture(); g.clearRect(0, 0, tmp.width, tmp.height); g.drawImage(cv, 0, 0, tmp.width, tmp.height);
    const d = g.getImageData(0, 0, tmp.width, tmp.height).data; let n = 0, hot = 0, sum = 0;
    for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 10) continue; n++; const m = Math.min(d[i], d[i + 1], d[i + 2]); if (m >= 250) hot++; sum += (d[i] + d[i + 1] + d[i + 2]) / 3; }
    const pct = hot / Math.max(1, n) * 100;
    add(`빛 번짐 · ${name}`, pct > 2 ? FIX : pct > .5 ? WARN : OK, `하얗게 날아간 화소 ${pct.toFixed(2)}%, 평균 밝기 ${Math.round(sum / Math.max(1, n))}`);
  }
  s.setup({ light: 0 }); s.step(120);
  // 3. 소리
  { const S = G.sound.soundSettings, aus = 'audioSession' in navigator;
    add('소리 설정', S.muted ? WARN : OK, `음소거 ${S.muted ? '켜짐' : '꺼짐'}, 첫 터치에 소리 깨우기 있음, 무음 모드 대응(audioSession.type='playback') ${aus ? '이 브라우저 지원' : '이 브라우저 미지원(사파리 17+에서 동작)'} — 실제 무음 모드 소리는 아이폰에서 확인`); }
  return out;
}
