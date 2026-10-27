/* 뼈대화 확인용 촬영 목록 — http://localhost:8000/?shot 에서
   (await import('/tools/rig-shots.js')).run('compare/rig-before')
   동작 9가지 × 시각 3개 × 4각도(모자·개미탈), 평상복 동작, 표정 6가지·깜빡임, 깡충, 걷기·뛰기(키링), 어두운 굴 림 라이트.
   촬영 순서가 곧 시간 흐름이라(동작 전환·깜빡임 난수) 목록을 바꾸면 전후를 둘 다 다시 찍는다.
   찍을 때마다 부품 월드 행렬(04의 wmList)을 matrices.json에, 걷는 동안 키링 각도를 charm.json에 남긴다. */
import { wmList, eyes } from '../js/04-character.js';

const Q = Math.PI / 4;
const VIEWS = { front: 0, 34: Q, side: 2 * Q, back: 4 * Q };
const ACTIONS = ['서기', '걷기', '뛰기', '두리번', '들여다보기', '기어오르기', '멈칫', '나침반 보기', '손 흔들기'];
const EXPRS = ['기본', '기쁨', '놀람', '궁금', '걱정', '신남'];
const LOOKS = { hat: { outfit: 1, hood: 2 }, ant: { outfit: 1, hood: 1 }, casual: { outfit: 0, hood: 0 } };
const CHAR = { pol: 1.38, dist: 3.8 }, FACE = { pol: 1.45, dist: 1.7, ty: 1.02 };

function matrices() {
  const out = [];
  for (const o of [...wmList, ...eyes]) { if (!o.parent) continue; o.updateWorldMatrix(true, false); out.push(Array.from(o.matrixWorld.elements, v => +v.toFixed(5))); }
  return out;
}

export async function run(dir, w = 800, h = 500) {
  const s = window.wlShot, saved = [], mats = {}, charm = [];
  s.size(w, h);
  const shot = async (name, view) => {
    s.view(view);
    await fetch(`/save?path=${dir}/${name}.png`, { method: 'POST', body: s.capture() });
    saved.push(name);
  };
  const views = async (name, list, base = CHAR) => {
    mats[name] = matrices();
    for (const v of list) await shot(`${name}-${v}`, { ...base, az: VIEWS[v] });
  };
  s.setup({ light: 0, follow: true, hood: 0, outfit: 0, action: '서기', expr: '기본' });
  s.step(60);
  // 동작: 모자·개미탈은 3시각 × 4각도, 평상복은 1시각 × 2각도
  for (const [look, L] of Object.entries(LOOKS)) {
    for (const [i, a] of ACTIONS.entries()) {
      s.setup({ ...L, action: '서기' }); s.step(20);
      s.setup({ action: a });
      const times = look === 'casual' ? [70] : [30, 70, 110];
      let t = 0;
      for (const tt of times) {
        s.step(tt - t); t = tt;
        await views(`act-${look}-${i}-${tt}`, look === 'casual' ? ['front', '34'] : ['front', '34', 'side', 'back']);
      }
    }
  }
  // 표정: 평상복 6가지 정면·3/4, 개미탈 6가지 정면
  s.setup({ ...LOOKS.casual, action: '서기' }); s.step(30);
  for (const [i, e] of EXPRS.entries()) { s.setup({ expr: e }); s.step(20); await views(`expr-casual-${i}`, ['front', '34'], FACE); }
  s.setup({ ...LOOKS.ant }); s.step(10);
  for (const [i, e] of EXPRS.entries()) { s.setup({ expr: e }); s.step(20); await views(`expr-ant-${i}`, ['front'], FACE); }
  // 깜빡임: 눈 그룹이 접히는 프레임까지 진행
  s.setup({ ...LOOKS.casual, expr: '기본' });
  for (let i = 0; i < 900 && eyes[0].scale.y === 1; i++) s.step(1);
  await views('blink', ['front'], FACE);
  // 깡충
  s.setup({ ...LOOKS.hat, hop: true }); s.step(18);
  await views('hop', ['front', '34']);
  // 걷기·뛰기: 키링 흔들림(뒤·측면)과 각도 기록
  const C = s.WL.userData.charm, rec = n => { for (let i = 0; i < n; i++) { s.step(1); charm.push([+C.ax.toFixed(5), +C.az.toFixed(5)]); } };
  s.setup({ action: '서기' }); s.step(20);
  s.setup({ walk: [-2, 2.5] });
  for (const k of [20, 40, 60]) { rec(20); await views(`walk-${k}`, ['back', 'side', '34']); }
  s.setup({ action: '뛰기' }); s.step(10);
  s.setup({ walk: [1.1, 2.5] });
  for (const k of [15, 30, 45]) { rec(15); await views(`run-${k}`, ['back', 'side', '34']); }
  rec(90);
  // 어두운 굴: 림 라이트
  s.setup({ light: 2, action: '서기' }); s.step(240);
  for (const look of ['hat', 'ant', 'casual']) { s.setup(LOOKS[look]); s.step(20); await views(`cave-${look}`, ['front', '34', 'back']); }
  s.setup({ light: 0 }); s.step(240);
  await fetch(`/save?path=${dir}/matrices.json`, { method: 'POST', body: JSON.stringify(mats) });
  await fetch(`/save?path=${dir}/charm.json`, { method: 'POST', body: JSON.stringify(charm) });
  return { shots: saved.length, revision: s.revision };
}
