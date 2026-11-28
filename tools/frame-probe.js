/* 대화 구도 재기 (2026-11-28, 세로 화면 대화 카메라 규칙 — docs/series-rules.md '세로 화면 대화 구도'): 시험이 페이지에 끼워 넣는다(WL_INIT=tools/frame-probe.js).
   대사 한 줄이 뜨고 1.4초 뒤: 원더룹(사진 모드 몸 범위 wlPhoto.body)과 그 줄의 상대(말하는 주민·듣는 주민 — dialog.lineInfo, 대화 카메라 상대 view.pair)의 화면 네모가
   - 화면 가로 안쪽 여백(8%) 밖으로 나간 비율(네모 너비 기준) `out`, 화면 밖으로 나간 비율 `off`
   - 원더룹 탈 너비(머리 뼈 둘레 반지름 0.55m)가 화면 가로에서 차지하는 비율 `hood`
   - 두 네모가 가로로 겹친 비율(작은 쪽 기준) `lap`
   을 재고, 그 순간의 3D 그림(+ 대화창 자리·여백 선)을 촬영 서버에 저장한다(주소 ?fpdir=<docs 아래 폴더> 또는 앞에 window.__fpdir='…' 한 줄 — 없으면 저장 안 함).
   나쁨 = 조작이 잠긴 대사(주민 대화·이야기 장면)에서 out > 0.03 이거나 hood > 0.45. 결과 window.__frame.report() → {lines, bad, list:[…]} — 끝나면 저절로 <fpdir>/report.json에도(3초마다 덮어씀) */
(()=>{
  let LOAD = 0, N0 = 0; try {LOAD = +(sessionStorage.fpl || 0) + 1; sessionStorage.fpl = LOAD; N0 = +(sessionStorage.fpn || 0);} catch (e) {} /* 시험이 페이지를 다시 열어도 번호가 이어지게 */
  const F = window.__frame = {L: new Map(), n: N0, bend: null}; const Q = new URLSearchParams(location.search), DIR = window.__fpdir || Q.get('fpdir'), M = .08;
  const gc = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, o) {if (/webgl/.test(t)) o = Object.assign({}, o, {preserveDrawingBuffer: true}); return gc.call(this, t, o);}; /* 그림을 읽어 오려면 */
  async function bend() {if (F.bend) return F.bend; const e = performance.getEntriesByType('resource').find(e => /js\/game\/bend\.js/.test(e.name)); if (!e) return null; try {F.bend = await import(e.name);} catch (err) {} return F.bend;}
  const shown = e => {if (!e) return false; const cs = getComputedStyle(e); return cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > .05;};
  function rootRect(root, headY, cam, B, V) {const p = new V(); root.getWorldPosition(p); const top = new V(p.x, p.y + headY + .15, p.z), mid = new V(p.x, p.y + headY * .5, p.z);
    const pr = v => {const b = B ? B.bentPos({x: v.x, y: v.y, z: v.z}) : v; const q = new V(b.x, b.y, b.z).project(cam); return q.z > 1 ? null : [(q.x + 1) / 2, (1 - q.y) / 2];};
    const a = pr(p), b = pr(top); if (!a || !b) return null; /* 몸 너비: 카메라 오른쪽으로 0.3m(머리 큰 주민은 머리 높이의 0.3배) 비춘 폭 */
    const r = new V(1, 0, 0).applyQuaternion(cam.quaternion).multiplyScalar(Math.max(.3, headY * .3)), c = pr(mid), d = pr(mid.clone().add(r)); const hw = c && d ? Math.abs(d[0] - c[0]) : .04, cx = (a[0] + b[0]) / 2;
    return [cx - hw, Math.min(a[1], b[1]), cx + hw, Math.max(a[1], b[1])];}
  const outOf = R => {const w = Math.max(1e-4, R[2] - R[0]); return [(Math.max(0, M - R[0]) + Math.max(0, R[2] - (1 - M))) / w, (Math.max(0, -R[0]) + Math.max(0, R[2] - 1)) / w];};
  async function snap(S, rects) {if (!DIR) return; try {const cv = [...document.querySelectorAll('canvas')].filter(c => c.width > 200 && c.getContext && !c.id).sort((a, b) => b.width * b.height - a.width * a.height)[0] || document.querySelector('canvas'); const W = innerWidth, H = innerHeight, o = document.createElement('canvas'); o.width = W; o.height = H; const g = o.getContext('2d');
      g.fillStyle = getComputedStyle(document.body).backgroundColor || '#ddd'; g.fillRect(0, 0, W, H); g.drawImage(cv, 0, 0, W, H);
      const d = document.getElementById('wlDlg'); if (shown(d)) {const r = d.getBoundingClientRect(); g.fillStyle = 'rgba(46,32,48,.9)'; g.fillRect(r.left, r.top, r.width, r.height); g.fillStyle = '#ffd95c'; g.font = '13px sans-serif'; g.fillText(d.querySelector('.who').textContent, r.left + 10, r.top + 18); g.fillStyle = '#fbe9d8'; const t = d.querySelector('.line').textContent; for (let i = 0; i * 26 < t.length && i < 4; i++) g.fillText(t.slice(i * 26, i * 26 + 26), r.left + 10, r.top + 38 + i * 17);}
      for (const s of ['#wlQuest', '#wlItems', '#wlMenu', '#wlStrip', '#wlNotice', '#wlGet', '#wlToast']) {const e = document.querySelector(s); if (shown(e)) {const r = e.getBoundingClientRect(); if (r.width > 2) {g.fillStyle = 'rgba(40,30,40,.55)'; g.fillRect(r.left, r.top, r.width, r.height);}}}
      g.strokeStyle = 'rgba(255,80,80,.7)'; g.setLineDash([6, 6]); g.beginPath(); g.moveTo(W * M, 0); g.lineTo(W * M, H); g.moveTo(W * (1 - M), 0); g.lineTo(W * (1 - M), H); g.stroke(); g.setLineDash([]);
      for (const [nm, R, bad] of rects) {g.strokeStyle = bad ? '#ff3b3b' : '#5cffb0'; g.lineWidth = 2; g.strokeRect(R[0] * W, R[1] * H, (R[2] - R[0]) * W, (R[3] - R[1]) * H);}
      g.fillStyle = S.bad ? '#ff3b3b' : '#1e8f5a'; g.fillRect(0, H - 22, W, 22); g.fillStyle = '#fff'; g.font = '12px sans-serif'; g.fillText((S.bad ? '나쁨 ' : '좋음 ') + 'out ' + S.out + ' hood ' + S.hood + ' lap ' + S.lap, 8, H - 7);
      const nm = String(S.i).padStart(3, '0') + (S.bad ? '-BAD' : '') + '.png'; S.file = nm; await fetch('/save?path=' + encodeURIComponent(DIR + '/' + nm), {method: 'POST', body: o.toDataURL('image/png')});} catch (e) {F.err = String(e);}}
  async function tick() {
    try {const G = window.wlGame; if (!G || !window.wlPhoto || !G.view.camera || !G.mission.hero()) return; const d = document.getElementById('wlDlg'); if (!shown(d)) return;
      const key = d.querySelector('.who').textContent + '|' + d.querySelector('.line').textContent; let S = F.L.get(key + '#' + (F.zone = (window.wlZone && wlZone.cur && wlZone.cur.id) || ''));
      if (!S) F.L.set(key + '#' + F.zone, S = {i: (sessionStorage.fpn = ++F.n, F.n), key: key.slice(0, 60), zone: F.zone, t: performance.now(), done: false}); if (S.done || performance.now() - S.t < 1400) return; S.done = true;
      const B = await bend(), cam = G.view.camera, W = G.mission.hero(), V = W.position.constructor; cam.updateMatrixWorld();
      const rects = [], hb = window.wlPhoto.body(cam); let hR = null; if (hb && hb.rect) {const q = hb.rect; hR = [q[0], 1 - q[3], q[2], 1 - q[1]];}
      const hd = W.getObjectByName('head'); let hood = 0; if (hd) {const p = new V(); hd.getWorldPosition(p); const b = B ? B.bentPos({x: p.x, y: p.y, z: p.z}) : p, c = new V(b.x, b.y, b.z), r = new V(1, 0, 0).applyQuaternion(cam.quaternion).multiplyScalar(.55), a0 = c.clone().project(cam), a1 = c.clone().add(r).project(cam); hood = Math.abs(a1.x - a0.x);} /* NDC 폭 2 = 화면 가로 → 지름 비율 = |Δ| */
      const who = new Map(), li = G.dialog.lineInfo && G.dialog.lineInfo(), sp = G.dialog.speaking && G.dialog.speaking(), pr = G.view.pair && G.view.pair();
      if (sp && sp.root) who.set(sp.root, [sp.name, sp.bubbleY || 1.4]); if (li && li.npc && li.npc.root) who.set(li.npc.root, [li.npc.name, li.npc.bubbleY || 1.4]); if (li && li.listener && li.listener.root) who.set(li.listener.root, [li.listener.name, li.listener.bubbleY || 1.4]); if (pr && pr.root && !who.has(pr.root)) who.set(pr.root, ['상대', pr.y || 1.4]);
      let out = 0, off = 0, lap = 0; const det = [];
      if (hR) {const [o1, o2] = outOf(hR); out = Math.max(out, o1); off = Math.max(off, o2); rects.push(['원더룹', hR, o1 > .03]); det.push(['원더룹', +o1.toFixed(2)]);}
      for (const [root, [nm, hy]] of who) {const R = rootRect(root, hy, cam, B, V); if (!R) {out = 1; off = 1; det.push([nm, 1]); continue;} const [o1, o2] = outOf(R); out = Math.max(out, o1); off = Math.max(off, o2); rects.push([nm, R, o1 > .03]); det.push([nm, +o1.toFixed(2)]);
        if (hR) lap = Math.max(lap, Math.max(0, Math.min(R[2], hR[2]) - Math.max(R[0], hR[0])) / Math.max(1e-4, Math.min(R[2] - R[0], hR[2] - hR[0])));}
      S.out = +out.toFixed(2); S.off = +off.toFixed(2); S.hood = +hood.toFixed(2); S.lap = +lap.toFixed(2); S.who = det; S.pair = who.size > 0; S.cam = pr ? 'pair' : (G.view.req ? 'hold' : 'follow'); S.lock = !!((G.dialog.talking && G.dialog.talking()) || W.userData.sceneLock); /* 걸으며 듣는 대사(조작이 안 잠김)는 두 사람 대화 구도가 아님 — 재기만 */ S.bad = S.pair && S.lock && (out > .03 || hood > .45);
      await snap(S, rects);
    } catch (e) {F.err = String(e);}
  }
  setInterval(tick, 150);
  F.report = () => {const L = [...F.L.values()].filter(s => s.done && s.pair), bad = L.filter(s => s.bad); return {size: innerWidth + 'x' + innerHeight, lines: L.length, bad: bad.length, err: F.err || null, list: L.map(s => ({i: s.i, zone: s.zone, key: s.key, out: s.out, off: s.off, hood: s.hood, lap: s.lap, cam: s.cam, lock: s.lock, who: s.who, bad: s.bad, file: s.file}))};};
  if (DIR) setInterval(() => {try {if (F.n) fetch('/save?path=' + encodeURIComponent(DIR + '/report-' + LOAD + '.json'), {method: 'POST', body: JSON.stringify(F.report())});} catch (e) {}}, 3000);
})();
