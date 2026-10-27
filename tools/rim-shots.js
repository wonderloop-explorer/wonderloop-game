/* 림 라이트 확인용 촬영 — http://localhost:8000/?shot 에서 (페이지가 다 뜬 뒤, 새로 연 페이지에서)
   (await import('/tools/rim-shots.js')).run('compare/rim-before')
   어두운 굴에서 탐험복(모자·개미탈)·평상복 × 서기·나침반 보기 × 4각도. 탐험복 셔츠·바지·롤업 단과 손 나침반의 림 라이트를 본다. */
const Q = Math.PI / 4;
const VIEWS = { front: 0, 34: Q, side: 2 * Q, back: 4 * Q };
const LOOKS = { hat: { outfit: 1, hood: 2 }, ant: { outfit: 1, hood: 1 }, casual: { outfit: 0, hood: 0 } };
const ACTS = { stand: '서기', compass: '나침반 보기' };

export async function run(dir) {
  const s = window.wlShot, saved = [];
  s.size(800, 500);
  s.setup({ light: 2, action: '서기', expr: '기본' }); s.step(240);
  for (const [look, o] of Object.entries(LOOKS)) for (const [a, act] of Object.entries(ACTS)) {
    s.setup({ ...o, action: act }); s.step(70);
    for (const [v, az] of Object.entries(VIEWS)) {
      s.view({ pol: 1.38, dist: 3.8, az });
      await fetch(`/save?path=${dir}/${look}-${a}-${v}.png`, { method: 'POST', body: s.capture() }); saved.push(`${look}-${a}-${v}`);
    }
  }
  s.setup({ light: 0 }); s.step(240);
  return { shots: saved.length };
}
