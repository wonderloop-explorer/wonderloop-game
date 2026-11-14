/* 화면 가림 재기 (2026-11-10, 화면 가림 규칙 — docs/series-rules.md): 시험이 페이지에 끼워 넣는다(게임 코드는 고치지 않음 → 바꾸기 전 코드도 같은 자로 잼).
   0.2초마다: 대화창·카드·횟수 표시가 떠 있는 '화면'(= 대사 한 줄, 카드 한 장, 횟수 표시 한 번)마다 원더룹과 말하는 상대가 글상자·카드·단추에 얼마나 덮였는지.
   - 원더룹 몸 = 사진 모드 몸 범위(wlPhoto.body — 뼈마다 공을 화면에 비춘 네모, 세로는 아래가 0이라 뒤집어 씀), 얼굴 = 그 위쪽 55%(큰 탈). 상대 = 발 ~ 머리 위(bubbleY)를 화면에 비춘 네모(둥근 땅은 휜 자리), 얼굴 = 위쪽 절반.
   - 덮는 것: 대화창·미션 카드·획득 카드·띠 카드·비밀 카드·결과창·완료 배지·안내 문구·횟수 표시·조이스틱·점프·대쉬·말 걸기·도구 단추·맨 위 단추 줄(할 일·가방·메뉴·사진).
     새 친구 소개 카드(화면 가운데, 일부러 멈춰서 보는 카드)는 따로 셈(modal).
   - 한 화면이 '가려짐' = 그 화면이 떠 있던 표본(뜬 뒤 0.6초부터)의 절반 넘게에서 얼굴이 10% 넘게 또는 몸이 25% 넘게 덮임.
   결과 window.__cover.report() → {screens, covered, list:[{key, who, face, body, by}]} */
(()=>{
  const C = window.__cover = {S: new Map(), bend: null, t0: performance.now()};
  const UI = ['#wlDlg', '#wlNotice', '#wlGet', '#wlStrip', '#wlSecret .card', '#wlResult .card', '#wlBadge', '#wlToast', '#wlCount', '.wl-fcnt', '#wlJoy', '#wlJump', '#wlDash', '#wlAct', '#wlTool', '#wlQuest', '#wlItems', '#wlMenu', '#wlCamBtn', '#wlPrompt'];
  const vis = e => {for (let q = e; q && q !== document.documentElement; q = q.parentElement) {const cs = getComputedStyle(q); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < .05) return false;} const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2;};
  const rectOf = e => {const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom];};
  function cover(R, boxes) { /* R 안을 16×16 칸으로 — 덮인 칸 비율과 덮은 것 이름 */
    const W = innerWidth, H = innerHeight, x0 = Math.max(0, R[0]), y0 = Math.max(0, R[1]), x1 = Math.min(W, R[2]), y1 = Math.min(H, R[3]); if (x1 - x0 < 2 || y1 - y0 < 2) return {f: 0, by: []};
    let n = 0; const by = new Set();
    for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) {const x = x0 + (x1 - x0) * (i + .5) / 16, y = y0 + (y1 - y0) * (j + .5) / 16; let hit = false;
      for (const b of boxes) if (x > b.r[0] && x < b.r[2] && y > b.r[1] && y < b.r[3]) {hit = true; by.add(b.id);} if (hit) n++;}
    return {f: n / 256, by: [...by]};
  }
  async function bend() {if (C.bend) return C.bend; const e = performance.getEntriesByType('resource').find(e => /js\/game\/bend\.js/.test(e.name)); if (!e) return null; try {C.bend = await import(e.name);} catch (err) {} return C.bend;}
  function npcRect(n, cam, B, V) {
    const p = new V(); n.root.getWorldPosition(p); const top = new V(p.x, p.y + (n.bubbleY || 1.4), p.z);
    const pr = v => {const b = B ? B.bentPos({x: v.x, y: v.y, z: v.z}) : v; const q = new V(b.x, b.y, b.z).project(cam); return q.z > 1 ? null : [(q.x + 1) / 2 * innerWidth, (1 - q.y) / 2 * innerHeight];};
    const a = pr(p), b = pr(top); if (!a || !b) return null; const h = Math.abs(a[1] - b[1]), w = Math.max(h * .5, 20), cx = (a[0] + b[0]) / 2; return [cx - w / 2, Math.min(a[1], b[1]), cx + w / 2, Math.max(a[1], b[1])];
  }
  async function tick() {
    try {
      const G = window.wlGame; if (!G || !window.wlPhoto || !G.view.camera) return; const B = await bend(), cam = G.view.camera, W = G.mission.hero(), V = W.position.constructor;
      const boxes = []; for (const s of UI) document.querySelectorAll(s).forEach(e => {if (vis(e)) boxes.push({id: s.replace(/^[#.]/, ''), r: rectOf(e), e});});
      /* 목표 이름표가 카드·띠·안내 문구에 가려졌는지(2026-11-14 — 화산 꼭대기 '금성행 회오리'): 이름표 네모가 15% 넘게 덮인 표본 */
      if (G.goal.tagRect) {const tg = G.goal.tagRect(); if (tg) {const cb = boxes.filter(b => ['wlDlg', 'wlNotice', 'wlGet', 'wlStrip', 'wlToast', 'wlCount', 'wlSecret .card', 'wlResult .card', 'wlBadge'].includes(b.id)); const cv = cover(tg.r, cb);
        const L = C.L || (C.L = {n: 0, bad: 0, max: 0, list: {}}); L.n++; L.max = Math.max(L.max, cv.f); if (cv.f > .15) {L.bad++; const k = tg.label + '|' + cv.by.join(','); L.list[k] = (L.list[k] || 0) + 1;}}}
      const pf = document.getElementById('wlProf'), modal = pf && vis(pf);
      const has = id => boxes.find(b => b.id === id);
      let key = null; const d = has('wlDlg');
      if (d) key = 'dlg|' + d.e.querySelector('.who').textContent + '|' + d.e.querySelector('.line').textContent.slice(0, 40);
      else {const c = has('wlNotice') || has('wlGet') || has('wlStrip') || has('wlSecret .card') || has('wlResult .card') || has('wlBadge') || has('wl-fcnt') || has('wlCount');
        if (c) key = c.id + '|' + (c.e.querySelector('.t,h2,span') || c.e).textContent.slice(0, 30) + (c.id === 'wl-fcnt' || c.id === 'wlCount' ? c.e.textContent.slice(-3) : '');}
      if (!key) return; if (modal) key = 'modal|' + key;
      let S = C.S.get(key); if (!S) C.S.set(key, S = {key, t: performance.now(), n: 0, bad: 0, face: 0, body: 0, by: new Set(), who: new Set(), modal});
      if (performance.now() - S.t < 600) return; S.n++;
      const chars = []; const hb = window.wlPhoto.body(cam); if (hb && hb.rect) {const q = hb.rect; chars.push(['원더룹', [q[0] * innerWidth, (1 - q[3]) * innerHeight, q[2] * innerWidth, (1 - q[1]) * innerHeight], .55]);} /* rect는 아래가 0(화면 좌표와 위아래 반대) */
      const sp = G.dialog.speaking && G.dialog.speaking(); if (sp && sp.root) {const r = npcRect(sp, cam, B, V); if (r) chars.push([sp.name, r, .5]);}
      let bad = false;
      for (const [name, R, fk] of chars) {const body = cover(R, boxes), face = cover([R[0], R[1], R[2], R[1] + (R[3] - R[1]) * fk], boxes);
        if (face.f > .1 || body.f > .25) {bad = true; S.who.add(name); face.by.concat(body.by).forEach(x => S.by.add(x));} S.face = Math.max(S.face, face.f); S.body = Math.max(S.body, body.f);}
      if (bad) S.bad++;
    } catch (e) {C.err = String(e);}
  }
  setInterval(tick, 200);
  C.report = () => {const L = [...C.S.values()].filter(s => s.n >= 2 && !s.modal), cov = L.filter(s => s.bad / s.n > .5);
    return {label: C.L ? {표본: C.L.n, 가려진표본: C.L.bad, 최대: +C.L.max.toFixed(2), 목록: C.L.list} : null, screens: L.length, covered: cov.length, modal: [...C.S.values()].filter(s => s.modal).length, err: C.err || null,
      list: cov.map(s => ({key: s.key, who: [...s.who], face: +s.face.toFixed(2), body: +s.body.toFixed(2), by: [...s.by], n: s.n}))};};
})();
