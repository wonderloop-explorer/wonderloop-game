/* 기준 스크린샷 촬영 목록 — tools/shot-server.py 로 띄운 http://localhost:8000/?shot 에서
   (await import('/tools/baseline-shots.js')).run('baseline/r128')
   처럼 부르면 docs/<dir>/ 아래에 PNG와 stats.json을 저장한다. 순서까지 같아야 비교가 맞으므로 목록을 바꾸면 기준도 다시 찍는다. */
const Q = Math.PI / 4;
const VIEWS = [['front', 0], ['34', Q], ['side', 2 * Q], ['back', 4 * Q]];
const CHAR = { pol: 1.38, dist: 3.8 };
const ROOM = { room: true, az: 0.8, pol: 0.98, dist: 27 };

export const SHOTS = [
  ...['day', 'evening', 'cave'].map((n, i) => ({ name: `room-${n}`, setup: { light: i, follow: false, hood: 0, outfit: 0, action: '서기', view: ROOM }, steps: 240 })),
  ...[['casual', 0, 0], ['explorer-hat', 1, 2], ['explorer-ant', 1, 1]].flatMap(([look, outfit, hood]) =>
    VIEWS.map(([v, az]) => ({ name: `char-${look}-${v}`, setup: { light: 0, follow: true, outfit, hood, action: '서기', view: { ...CHAR, az } }, steps: 90 }))),
  { name: 'cave-explorer-hat-34', setup: { light: 2, follow: true, outfit: 1, hood: 2, action: '서기', view: { ...CHAR, az: Q } }, steps: 240 },
  { name: 'cave-explorer-ant-34', setup: { light: 2, follow: true, outfit: 1, hood: 1, action: '서기', view: { ...CHAR, az: Q } }, steps: 90 },
  ...['두리번', '들여다보기', '기어오르기', '멈칫', '나침반 보기', '손 흔들기'].map((a, i) =>
    ({ name: `act-${i + 1}`, label: a, setup: { light: 0, follow: true, outfit: 1, hood: 1, action: a, view: { ...CHAR, az: Q } }, steps: 75 })),
];

export async function run(dir, w = 1280, h = 800) {
  const s = window.wlShot;
  s.size(w, h);
  const stats = {};
  for (const shot of SHOTS) {
    s.setup(shot.setup);
    s.step(shot.steps);
    s.setup({ view: shot.setup.view });
    s.step(1);
    const png = s.capture();
    stats[shot.name] = { ...s.info(), label: shot.label };
    await fetch(`/save?path=${dir}/${shot.name}.png`, { method: 'POST', body: png });
  }
  stats._three = THREE_REVISION();
  await fetch(`/save?path=${dir}/stats.json`, { method: 'POST', body: JSON.stringify(stats, null, 2) });
  return stats;
}

function THREE_REVISION() {
  return window.wlShot.revision || (window.THREE && window.THREE.REVISION) || '?';
}
