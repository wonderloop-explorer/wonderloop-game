/* 공통 시스템(js/game/) 규칙 자동 시험 — http://localhost:8000/?shot&zonetest&zone=sample-indoor 에서 (페이지가 다 뜬 뒤)
   (await import('/tools/game-tests.js')).run()  →  [{규칙, 통과, 내용}]
   촬영 모드라 게임 시간은 wlShot.step(n)으로만 흐른다(1/60초씩) → 매번 같은 결과. 견본 실내의 NPC·이벤트·먼지 뭉치를 쓴다. */
const STEP = 1 / 60;
export async function run() {
  const s = window.wlShot, G = s.game, Z = window.wlZone.cur, WL = s.WL, out = [];
  const ok = (rule, pass, note) => out.push({ 규칙: rule, 통과: !!pass, 내용: note });
  const sec = t => s.step(Math.round(t / STEP));
  const press = () => { for (const ty of ['keydown', 'keyup']) window.dispatchEvent(new KeyboardEvent(ty, { code: 'KeyE' })); };
  const stand = (o, dx = .9) => { const w = o.getWorldPosition(WL.position.clone()); WL.position.set(w.x + dx, 0, w.z); sec(.1); };
  const flush = async () => { await Promise.resolve(); await Promise.resolve(); };
  const reset = async () => { G.dialog.endTalk(); G.ui.closeNotice(); sec(.5); await flush(); };
  s.setup({ outfit: 1 }); sec(.5);

  // 1. 대사 묶음이 비어 있어도 멈추지 않는다
  { stand(Z.quiet); let err = null; try { press(); sec(.3); } catch (e) { err = e; }
    ok('대사 묶음이 비어 있는 NPC에게 말 걸기', !err && !G.dialog.talking(), err ? String(err) : '대화가 열리지 않고 그대로 진행 (말 걸 상대로 고르지 않음)'); }

  // 2. 대화 중에는 혼잣말이 끼어들지 않는다
  { await reset(); stand(Z.guest); press(); sec(.2); const who = () => document.querySelector('#wlDlg .who').textContent;
    let said = false; G.dialog.say('먼지 뭉치', '콜록콜록!', 1.5).then(() => said = true); sec(2);
    const during = who(); press(); sec(.3); press(); sec(.3); const after = G.dialog.talking(); sec(.2); const shown = who(); sec(3); await flush();
    ok('대화 중 혼잣말 끼어들지 않기', during === '견본 손님' && !after && shown === '먼지 뭉치' && said, `대화 중 화면: ${during} → 대화 끝난 뒤: ${shown}`); }

  // 3. 동시에 일어난 이벤트는 줄을 서서 하나씩
  { await reset(); const log = []; const ev = (id, p, d) => ({ id, priority: p, run: async e => { log.push(id + ' 시작'); await e.wait(d); log.push(id + ' 끝'); } });
    G.events.queue(ev('가', 0, .5)); G.events.queue(ev('나', 0, .3)); G.events.queue(ev('다(급함)', 5, .2)); G.events.queue(ev('가', 0, .5));
    for (let i = 0; i < 120; i++) { sec(STEP); await flush(); }
    const want = ['다(급함) 시작', '다(급함) 끝', '가 시작', '가 끝', '나 시작', '나 끝'];
    ok('동시에 일어난 이벤트 줄 세우기', JSON.stringify(log) === JSON.stringify(want), log.join(' → ') + ' (같은 이벤트 두 번째는 줄에 안 들어감)'); }

  // 4. 대화·카드가 열려 있으면 위협은 멈춘다
  { await reset(); const x0 = () => Z.dust.position.x; sec(.5); const a = x0(); sec(.5); const moving = x0() !== a;
    stand(Z.guest); press(); const b = x0(); sec(2); const stopTalk = x0() === b; G.dialog.endTalk(); sec(.1);
    G.ui.notice({ title: '시험 카드', text: '' }); const c = x0(); sec(2); const stopCard = x0() === c; G.ui.closeNotice(); sec(.5); const resumed = x0() !== c;
    ok('대화·카드 중 위협 멈춤', moving && stopTalk && stopCard && resumed, `평소 움직임 ${moving}, 대화 중 멈춤 ${stopTalk}, 카드 중 멈춤 ${stopCard}, 닫은 뒤 다시 움직임 ${resumed}`); }

  // 5. 끊긴 나레이션은 다시 들려준다
  { await reset(); const n0 = G.cues.length; let done = false; const text = '나레이션 다시 듣기 시험 문장이에요. 조금 길게 이어집니다.';
    G.sound.narrate({ text }).then(() => done = true); sec(1); G.ui.notice({ title: '끼어든 카드', text: '' }); sec(1.5); const cutWhileOpen = !done; G.ui.closeNotice();
    for (let i = 0; i < 10 * 60 && !done; i++) { sec(STEP); await flush(); }
    const plays = G.cues.slice(n0).filter(c => c.kind === 'narration' && c.text === text);
    ok('끊긴 나레이션 다시 들려주기', plays.length === 2 && plays[0].cut != null && plays[1].cut == null && cutWhileOpen && done,
      `재생 ${plays.length}번: 첫 번째 ${plays[0] && plays[0].t}초 시작·${plays[0] && plays[0].cut}초에서 끊김, 두 번째 ${plays[1] && plays[1].t}초에 처음부터 다시`); }

  // 6. 카드가 열려 있을 때 시작한 나레이션은 닫힐 때까지 기다린다
  { await reset(); G.ui.notice({ title: '먼저 열린 카드', text: '' }); const n0 = G.cues.length; G.sound.narrate({ text: '카드가 닫히면 들려요.' }); sec(1);
    const before = G.cues.slice(n0).filter(c => c.kind === 'narration').length; G.ui.closeNotice(); sec(.2);
    const after = G.cues.slice(n0).filter(c => c.kind === 'narration').length; sec(3); await flush();
    ok('막혀 있을 때 나레이션은 기다렸다 시작', before === 0 && after === 1, `카드 열린 동안 ${before}번, 닫은 뒤 ${after}번 시작`); }

  // 7. 프레임 안 오류가 나도 멈추지 않는다
  { await reset(); const u = Z.update; let n = 0; Z.update = (...a) => { if (n++ === 0) throw new Error('시험 오류'); return u.apply(Z, a); };
    const t0 = G.clock.t; let err = null; try { sec(1); } catch (e) { err = e; } Z.update = u;
    ok('프레임 오류 안전장치', !err && G.clock.t > t0 + .9, err ? String(err) : '오류는 콘솔에 한 번 남고 시간이 계속 흐름'); }

  // 8. 안내 표시를 한 번에 숨기기 (영상 캡처용)
  { await reset(); stand(Z.guest, 1.2); sec(.2); const shown = G.ui.hintObjs.size > 0 && [...G.ui.hintObjs].some(o => o.visible);
    G.ui.setHints(false); sec(.2); const hidden = [...G.ui.hintObjs].every(o => !o.visible) && getComputedStyle(document.getElementById('wlPrompt')).visibility === 'hidden';
    G.ui.setHints(true); sec(.2);
    ok('안내 표시 한 번에 숨기기', shown && hidden, `말풍선 보임 ${shown} → 숨김 ${hidden}`); }

  // 9. 나침반 키링: 받은 뒤에만 보인다
  { await reset(); const ch = WL.userData.charm.g; G.state.setFlag('compass', false); sec(.1); const off = !ch.visible; G.state.setFlag('compass', true); sec(.1); const on = ch.visible;
    ok('나침반 키링은 받은 뒤에만', off && on, `받기 전 숨김 ${off}, 받은 뒤 보임 ${on} (탐험복)`); }

  // 10. 이벤트 트리거(영역) → 나레이션 → 안내 카드
  { await reset(); const n0 = G.cues.length; WL.position.set(-3, 0, 1); for (let i = 0; i < 8 * 60 && !G.ui.noticeShown(); i++) { sec(STEP); await flush(); }
    const nar = G.cues.slice(n0).find(c => c.kind === 'narration'); const card = G.ui.noticeShown(); G.ui.closeNotice(); sec(.2); await flush();
    ok('영역 트리거 → 나레이션 → 카드', !!nar && card && document.getElementById('wlQuest').textContent.includes('견본 손님'), `나레이션 ${nar ? nar.t + '초' : '없음'}, 카드 ${card}, 할 일 문구 바뀜`); }
  return out;
}
