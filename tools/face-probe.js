/* 마주 보기 전수 검사 (2026-11-11, docs/series-rules.md '마주 보기 검사'): 시험이 페이지에 끼워 넣는다(게임 코드는 고치지 않음 → 바꾸기 전 코드도 같은 자로 잼).
   대화창(#wlDlg)에 대사 한 줄이 뜰 때마다, 말하는 쪽과 듣는 쪽(원더룹)이 서로를 향한 각도(수평, 도)를 0.1초마다 잰다.
   - 말하는 주민: G.dialog.lineInfo()가 있으면 그 값(상대 npc·보는 곳 표시 look), 없으면(예전 코드) 이름으로 찾음. '원더룹' 줄의 상대는 lineInfo 값, 없으면 8초 안에 말한 8m 안 주민.
   - npc = 주민 몸 방향(그려지는 행렬에서 잰 값)과 원더룹 쪽의 차이, hero = 원더룹 몸 방향과 주민 쪽의 차이. 줄이 뜬 뒤 1.2초 때 값(그 전에 넘기면 마지막 값 — 0.9초도 안 떠 있던 줄은 '짧음' — 멈춰서 돌아보는 데 약 0.5초).
   - 어긋남 = 둘 중 하나라도 45도 넘음. 예외: 보는 곳 표시(look)가 달린 줄 · 상대가 없는 줄(혼잣말·카세트 소리만) · 걷는 중(플레이어가 조작 중이라 원더룹을 돌리지 않음 — 주민 쪽 각도만 봄).
   결과 window.__face.report() → {lines, bad, list:[{who,text,npc,hero,dist,flag}]} */
(()=>{
  const F = window.__face = {L: [], cur: null, last: null, err: null};
  const ang = (ry, dx, dz) => {const a = Math.atan2(dx, dz) - ry; return Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) * 180 / Math.PI;};
  const yaw = o => {o.updateWorldMatrix(true, false); const e = o.matrixWorld.elements; return Math.atan2(e[8], e[10]);}; /* 실제로 그려지는 방향(행렬에서) — rotation.y만 보면 오일러가 뒤집힌 주민을 놓친다 */
  const vis = e => {if (!e) return false; for (let q = e; q && q !== document.documentElement; q = q.parentElement) {const cs = getComputedStyle(q); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < .05) return false;} return e.getBoundingClientRect().height > 2;};
  const byName = (G, w) => (G.dialog.npcList ? G.dialog.npcList() : []).find(n => n.root && n.name && (w === n.name || w.startsWith(n.name + ' ') || n.name.endsWith(' ' + w) || n.name.endsWith(' ' + w.split(' (')[0]))) || null;
  function tick() {
    try {
      const G = window.wlGame; if (!G || !G.mission || !G.dialog) return; const W = G.mission.hero(); if (!W) return; const d = document.getElementById('wlDlg'), on = vis(d), now = performance.now();
      const who = on ? d.querySelector('.who').textContent : '', text = on ? d.querySelector('.line').textContent : '', key = who + '|' + text;
      if (!on || !F.cur || F.cur.key !== key) {if (F.cur) {F.cur.sec = +((now - F.cur.t0) / 1000).toFixed(1); F.cur = null;} if (!on || !text) return;
        F.cur = {key, who, text: text.slice(0, 44), t0: now, zone: (window.wlZone && wlZone.cur && wlZone.cur.id) || '', s: null, fixed: false}; F.L.push(F.cur);}
      const C = F.cur; if (C.fixed) return; const info = G.dialog.lineInfo ? G.dialog.lineInfo() : null; let n = null, look = null;
      if (info) {n = info.npc; look = info.look || null;}
      else if (who === '원더룹') {if (F.last && now - F.last.t < 8000) n = F.last.n;} else if (G.dialog.talking() && G.dialog.talkNPC) n = G.dialog.talkNPC(); else n = byName(G, who);
      const U = W.userData, P = W.position, walking = !!((U.isWalking && U.isWalking()) || (U.drive && Math.abs(U.drive.x) + Math.abs(U.drive.z) > .01));
      const s = {look, walking, riding: !!U.riding, t: +((now - C.t0) / 1000).toFixed(2)};
      if (n && n.root) {const p = new P.constructor(); n.root.getWorldPosition(p); const dx = p.x - P.x, dz = p.z - P.z; s.name = n.name; s.dist = +Math.hypot(dx, dz).toFixed(1);
        if (who === '원더룹' && s.dist > 8 && !info) {s.name = null;} else {s.npc = Math.round(ang(yaw(n.root), -dx, -dz)); s.hero = Math.round(ang(yaw(W), dx, dz)); if (who !== '원더룹') F.last = {n, t: now};}}
      C.s = s; if (s.t >= 1.2) C.fixed = true;
    } catch (e) {F.err = String(e);}
  }
  setInterval(tick, 100);
  F.report = () => {const list = F.L.filter(c => c.s).map(c => {const s = c.s; let flag = '';
      if (s.look) flag = '예외(보는 곳: ' + s.look + ')'; else if (s.name == null) flag = '상대 없음'; else if (s.t < .9) flag = '짧음';
      else if (s.riding) flag = (s.npc > 45 ? '어긋남' : '탈것');
      else if (s.walking) flag = (s.npc > 45 ? '어긋남' : s.hero > 45 ? '걷는 중' : '');
      else if (s.npc > 45 || s.hero > 45) flag = '어긋남';
      return {zone: c.zone, who: c.who, text: c.text, to: s.name || null, npc: s.npc ?? null, hero: s.hero ?? null, dist: s.dist ?? null, t: s.t, flag};});
    return {lines: list.length, bad: list.filter(x => x.flag === '어긋남').length, except: list.filter(x => x.flag.startsWith('예외')).length, err: F.err, list};};
})();
