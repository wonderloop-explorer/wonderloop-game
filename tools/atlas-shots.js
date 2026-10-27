/* 아틀라스 확인용 촬영 — http://localhost:8000/?shot 에서 (페이지가 다 뜬 뒤)
   (await import('/tools/atlas-shots.js')).run('compare/atlas-before')
   결이 잘 보이는 옷감 가까이(청바지·리넨 셔츠·캔버스 조끼·가죽 띠·스웨이드 장화·머리카락·개미탈)와
   휴대폰 폭(375×667)에서 멀리 본 모습(밉맵이 작게 줄어드는 거리). 전후를 같은 순서로 찍어 tools 밖에서 비교한다. */
const Q = Math.PI / 4;
const CLOSE = [
  ['denim', { outfit: 0, hood: 0 }, { pol: 1.5, dist: .75, ty: .32, az: 0 }],
  ['jersey', { outfit: 0, hood: 0 }, { pol: 1.45, dist: .8, ty: .5, az: Q }],
  ['linen', { outfit: 1, hood: 2 }, { pol: 1.45, dist: .7, ty: .55, az: -Q / 2 }],
  ['canvas', { outfit: 1, hood: 2 }, { pol: 1.5, dist: .7, ty: .45, az: Q * 1.6 }],
  ['leather', { outfit: 1, hood: 2 }, { pol: 1.45, dist: .8, ty: .45, az: Q * 4 }],
  ['twill', { outfit: 1, hood: 2 }, { pol: 1.5, dist: .7, ty: .25, az: Q / 2 }],
  ['suede', { outfit: 1, hood: 2 }, { pol: 1.2, dist: .7, ty: .05, az: Q / 2 }],
  ['hair', { outfit: 0, hood: 0 }, { pol: 1.3, dist: .8, ty: 1.2, az: Q * 3 }],
  ['hat', { outfit: 1, hood: 2 }, { pol: 1.2, dist: .9, ty: 1.25, az: Q }],
  ['ant', { outfit: 1, hood: 1 }, { pol: 1.35, dist: 1, ty: 1.1, az: Q }],
];
const LOOKS = { casual: { outfit: 0, hood: 0 }, hat: { outfit: 1, hood: 2 }, ant: { outfit: 1, hood: 1 } };

export async function run(dir) {
  const s = window.wlShot, saved = [];
  const shot = async (name, view) => { s.view(view); await fetch(`/save?path=${dir}/${name}.png`, { method: 'POST', body: s.capture() }); saved.push(name); };
  s.size(800, 500);
  for (const [name, look, view] of CLOSE) { s.setup({ ...look, action: '서기', expr: '기본' }); s.step(4); await shot(`close-${name}`, view); }
  s.size(375, 667);
  for (const [look, o] of Object.entries(LOOKS)) {
    s.setup({ ...o, action: '서기', expr: '기본' }); s.step(4);
    for (const d of [5, 9]) await shot(`phone-${look}-${d}`, { pol: 1.2, dist: d, az: Q });
  }
  s.size(800, 500);
  return { shots: saved.length };
}
