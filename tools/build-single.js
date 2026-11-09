/* 스테이지 한 파일 빌드 — 개발 구조(여러 파일·ES 모듈)는 그대로 두고, 서버 없이 더블클릭으로 열리는 HTML 파일 하나로 묶는다.
   사용(저장소 루트에서):  node tools/build-single.js                → 기본 스테이지(fairy-dock)
                           node tools/build-single.js fairy-dock     → dist/fairy-forest-stage01.html
   새 스테이지는 아래 STAGES에 한 줄(구역 이름·결과 파일·제목·넣을 그림 폴더)을 더한다.

   묶는 방법(코드는 줄이거나 바꾸지 않는다 — GPT가 그대로 읽을 수 있게):
   - js/ 아래 모든 모듈과 three.js(r186 three.module.js·three.core.js, 쓰는 부록 둘)를 원본 그대로
     <script type="text/x-wl-module" data-path="원본 경로"> 칸에 하나씩 넣는다(맨 위에 원본 경로 주석). 이 칸은 브라우저가 실행하지 않는 글 상자다.
   - 맨 끝의 시작 스크립트가 칸마다 import 경로('./01-textures.js', 'three', 'three/addons/…', import('./zones/…'))를 풀어
     다른 칸의 blob: 주소로 바꿔 끼우고(의존하는 칸부터 — 모듈 사이에 순환이 없다), import.meta.url은 원래 자리(파일 옆 js/…) 주소로 바꾼 뒤 08-main을 불러온다.
     file://에서는 모듈 파일을 불러올 수 없어서(브라우저가 막음) 이렇게 한다.
   - 그림·아이콘·카드 그림·텍스처 목록·난수 기록·소리는 data URI로 WL_FILES에 넣고, fetch와 <img>.src가 'assets/…' 주소를 찾으면 그것을 돌려준다
     (없는 파일은 서버처럼 404 — 개발판과 같은 대신 그리기로 넘어간다).
   - 글꼴은 개미굴처럼 Google Fonts 연결만(연결이 안 되면 CSS의 기본 글꼴).
   - 개발판의 버전 확인(wl-vercheck — version.json을 읽어 새로 고침)과 importmap은 뺀다. 톱니 메뉴 성능 상자 맨 위에 버전·커밋.
   - three.js는 .cache/three-<버전>/에 받아 두고 쓴다(없으면 jsDelivr에서 받음, .cache는 저장소에 넣지 않는다).
   크기가 15MB를 넘으면 멈추고 줄이는 방법을 알려 준다. */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), https = require('https');
const ROOT = path.resolve(__dirname, '..');
const THREE_V = '0.186.1';
const THREE_FILES = ['build/three.module.js', 'build/three.core.js', 'examples/jsm/controls/OrbitControls.js', 'examples/jsm/utils/BufferGeometryUtils.js'];
const LIMIT = 15 * 1024 * 1024;

const STAGES = {
  // 시리즈 공통 틀(2026-11-04): 지금 세계 설정(js/worlds CURRENT — 개미굴)의 타이틀 화면 + 시작 공간(backdrop.zone — 이식 전까지 베이스캠프)
  'basecamp': {
    out: 'dist/wonderloop-frame.html',
    copy: 'wonderloop-frame.html', // 게임 폴더(저장소 맨 위)에도 한 부 — 컴퓨터에서 더블클릭해 바로 열기(.gitignore, 2026-11-04)
    title: '원더룹 — 시리즈 공통 틀 (개미굴 설정)',
    assets: ['assets/rand/recorded.json', 'assets/textures/*/textures.json', 'assets/audio/antvillage/*', 'assets/audio/travel-theme.mp3'], // 개미굴 나레이션(모험 시작 연출·첫 미션), 스테이지 이동 테마(무한 우주)
  },
  'fairy-dock': {
    out: 'dist/fairy-forest-stage01.html',
    title: '원더룹 요정의 숲 — STAGE 01 이슬방울 선착장',
    // 넣을 파일(저장소 기준, * 한 칸). 텍스처 목록(textures.json)은 넣고, 그 안의 그림은 개발판이 실제로 읽는 것만(BAKE_LOAD 'hand' — 손으로 고친 것)
    assets: ['assets/rand/recorded.json', 'assets/textures/*/textures.json', 'assets/icons/fairy/*', 'assets/cards/fairy/*', 'assets/titles/fairy/*', 'assets/ui/fairy/*', 'assets/audio/fairy*'],
  },
};

const sh = c => cp.execSync(c, { cwd: ROOT, encoding: 'utf8' }).trim();
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const glob = pat => { const d = path.dirname(pat), b = path.basename(pat); const segs = d.split('/');
  const dirs = segs.reduce((acc, s) => acc.flatMap(a => s === '*' ? (fs.existsSync(path.join(ROOT, a)) ? fs.readdirSync(path.join(ROOT, a)).filter(n => fs.statSync(path.join(ROOT, a, n)).isDirectory()).map(n => a + '/' + n) : []) : [a ? a + '/' + s : s]), ['']);
  const re = new RegExp('^' + b.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
  return dirs.flatMap(dd => fs.existsSync(path.join(ROOT, dd)) ? fs.readdirSync(path.join(ROOT, dd)).filter(n => re.test(n) && fs.statSync(path.join(ROOT, dd, n)).isFile()).map(n => dd + '/' + n) : []).sort(); };
const MIME = { '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav', '.svg': 'image/svg+xml' };

function get(url) {
  return new Promise((ok, no) => https.get(url, r => { if (r.statusCode !== 200) return no(new Error(url + ' ' + r.statusCode)); const b = []; r.on('data', x => b.push(x)); r.on('end', () => ok(Buffer.concat(b))); }).on('error', no));
}
async function three() {
  const dir = path.join(ROOT, '.cache', 'three-' + THREE_V), out = {};
  for (const f of THREE_FILES) {
    const p = path.join(dir, f);
    if (!fs.existsSync(p)) { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, await get(`https://cdn.jsdelivr.net/npm/three@${THREE_V}/${f}`)); }
    out['three/' + f] = fs.readFileSync(p, 'utf8');
  }
  return out;
}

// 시작 스크립트 — 결과 파일 맨 끝에 그대로 들어간다(읽을 수 있게)
const BOOT = `/* ===== 시작 스크립트 (tools/build-single.js가 넣음) =====
   1) fetch와 <img>.src가 'assets/…' 주소를 찾으면 WL_FILES의 data URI를 돌려준다(없는 파일은 404).
   2) 위 text/x-wl-module 칸(원본 경로별 모듈)의 import 경로를 다른 칸의 blob: 주소로 바꿔 모듈로 만든다(의존하는 칸부터).
      import.meta.url은 이 HTML 옆의 원래 자리(js/…) 주소로 — 원본 코드가 new URL('../assets/…', import.meta.url)로 파일 주소를 만든다.
   3) js/08-main.js를 불러온다(08이 01~07과 게임 공통·구역을 불러오는 것은 개발판과 같다). */
(function () {
  'use strict';
  var FILES = window.WL_FILES || {};
  function key(u) {
    u = String(u && u.url ? u.url : u);
    var m = u.match(/(?:^|\\/)(assets\\/[^?#]*)/);
    return m ? decodeURIComponent(m[1]) : null;
  }
  var fetch0 = window.fetch.bind(window);
  window.fetch = function (u, o) {
    var k = key(u);
    if (!k) return fetch0(u, o);
    if (FILES[k]) return fetch0(FILES[k]);
    return Promise.resolve(new Response(null, { status: 404, statusText: 'not in single file' }));
  };
  var srcD = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
  Object.defineProperty(HTMLImageElement.prototype, 'src', {
    configurable: true, enumerable: srcD.enumerable,
    get: function () { return srcD.get.call(this); },
    set: function (v) { var k = key(v); srcD.set.call(this, k && FILES[k] ? FILES[k] : v); }
  });

  var MODS = {}, URLS = {};
  document.querySelectorAll('script[type="text/x-wl-module"]').forEach(function (s) { MODS[s.dataset.path] = s.textContent; });
  function resolve(from, spec) {
    if (spec === 'three') return 'three/build/three.module.js';
    if (spec.indexOf('three/addons/') === 0) return 'three/examples/jsm/' + spec.slice(13);
    if (spec[0] !== '.') return null;
    var base = from.split('/').slice(0, -1);
    spec.split('/').forEach(function (p) { if (p === '.' || p === '') return; if (p === '..') base.pop(); else base.push(p); });
    return base.join('/');
  }
  var RE = /(\\bfrom\\s*|\\bimport\\s*\\(\\s*|\\bimport\\s+)(['"])([^'"\\n]+)\\2/g;
  function moduleUrl(p, stack) {
    if (URLS[p]) return URLS[p];
    if (stack.indexOf(p) >= 0) throw new Error('원더룹 한 파일: 모듈 순환 ' + stack.concat(p).join(' → '));
    var src = MODS[p].replace(RE, function (m, a, q, spec) {
      var id = resolve(p, spec);
      if (!id || id === p || !(id in MODS)) return m; // 모르는 경로·주석 속 예시(자기 자신)는 그대로
      return a + q + moduleUrl(id, stack.concat(p)) + q;
    }).replace(/\\bimport\\.meta\\.url\\b/g, JSON.stringify(new URL(p, document.baseURI).href));
    return URLS[p] = URL.createObjectURL(new Blob([src + '\\n//# sourceURL=wl-single/' + p], { type: 'text/javascript' }));
  }
  import(moduleUrl('js/08-main.js', [])).catch(function (e) {
    console.error('원더룹 한 파일: 시작 실패', e);
    var d = document.createElement('pre'); d.textContent = '시작하지 못했어요: ' + e; d.style.cssText = 'position:fixed;left:8px;bottom:8px;right:8px;white-space:pre-wrap;background:#fff;color:#a00;padding:8px;z-index:99';
    document.body.appendChild(d);
  });
})();`;

async function main() {
  const name = process.argv[2] || 'fairy-dock', S = STAGES[name];
  if (!S) { console.error('모르는 스테이지:', name, '— 있는 것:', Object.keys(STAGES).join(', ')); process.exit(1); }
  const head = sh('git rev-parse --short HEAD'), dirty = sh('git status --porcelain -- js assets index.html') ? '+수정' : '';
  const ver = JSON.parse(rd('version.json')).v, date = new Date().toISOString().slice(0, 10);

  // 모듈: js/ 아래 모든 .js(번호 순서 → 게임 공통 → 탈 → 구역) + three
  const jsFiles = sh('git ls-files js').split('\n').filter(f => f.endsWith('.js')).sort((a, b) => (a.split('/').length - b.split('/').length) || a.localeCompare(b));
  const mods = {};
  for (const f of jsFiles) mods[f] = rd(f);
  Object.assign(mods, await three());

  // 파일: data URI (텍스처 목록 안의 손으로 고친 그림도)
  const files = {};
  const addFile = f => { const b = fs.readFileSync(path.join(ROOT, f)); files[f] = `data:${MIME[path.extname(f).toLowerCase()] || 'application/octet-stream'};base64,${b.toString('base64')}`; };
  for (const pat of S.assets) for (const f of glob(pat)) addFile(f);
  for (const f of Object.keys(files).filter(f => f.endsWith('/textures.json'))) {
    const L = JSON.parse(rd(f)), list = Array.isArray(L) ? L : L.textures || [];
    for (const e of list) if (e.hand && e.file) { const g = path.posix.join(path.posix.dirname(f), e.file); if (fs.existsSync(path.join(ROOT, g))) addFile(g); }
  }

  // HTML: 개발판 index.html에서 버전 확인·importmap·모듈 시작 줄을 빼고, 스테이지 설정·파일·모듈·시작 스크립트를 넣는다
  let h = rd('index.html');
  const cut = (re, what) => { const n = h.length; h = h.replace(re, ''); if (h.length === n) throw new Error('index.html에서 못 찾음: ' + what); };
  cut(/<script id="wl-vercheck">[\s\S]*?<\/script>\n?/, 'wl-vercheck');
  cut(/<script>window\.WL_V=[^<]*<\/script>\n?/, 'WL_V');
  cut(/<script id="wl-vguard">[\s\S]*?<\/script>\n?/, 'wl-vguard'); // 버전 붙이기 안전망 — 한 파일은 모든 파일이 안에 있어 필요 없다
  cut(/<script type="importmap">[\s\S]*?<\/script>\n?/, 'importmap');
  cut(/<!-- 08-main\.js가[^\n]*-->\n?/, '모듈 주석');
  cut(/<script type="module" src="js\/08-main\.js[^"]*"><\/script>\n?/, '모듈 시작');
  if (!/window\.WL_BOOT_IMG="data:image/.test(h)) throw new Error('index.html에 로딩 화면 행성 그림(WL_BOOT_IMG)이 없다 → python3 tools/stamp.py');
  h = h.replace(/<title>[^<]*<\/title>/, () => `<title>${S.title}</title>`); // 바꿀 글은 늘 함수로($' 같은 특수 문자가 코드에 있다)
  const esc = s => s.replace(/<\/(script)/gi, '<\\/$1').replace(/<!--/g, '<\\!--');
  const note = `<!-- ${S.title}
     한 파일 빌드: node tools/build-single.js ${name} (원본 저장소 wonderloop-game, 커밋 ${head}${dirty}, 버전 ${ver}, ${date})
     서버 없이 이 파일을 더블클릭하면 열린다. 구조: 맨 끝 시작 스크립트가 아래 text/x-wl-module 칸(원본 경로별 모듈, 코드는 원본 그대로)을
     이어 붙여 실행하고, WL_FILES(data URI)로 그림·목록을 돌려준다. 자세한 것은 시작 스크립트 주석. -->\n`;
  h = h.replace('<head>\n', () => '<head>\n' + note);
  const cfg = `<script>/* 스테이지 설정 (tools/build-single.js) */
window.WL_V=${JSON.stringify(ver)};
window.WL_BUILD=${JSON.stringify({ commit: head + dirty, date, stage: name })};
window.WL_START_ZONE=${JSON.stringify(name)};
</script>\n`;
  const modTags = Object.keys(mods).map(p => `<script type="text/x-wl-module" data-path="${p}">\n/* ===== 원본: ${p.startsWith('three/') ? 'three.js ' + THREE_V + ' (' + p.slice(6) + ')' : p} ===== */\n${esc(mods[p])}\n</script>\n`).join('');
  const fileTag = `<script>/* 그림·목록 파일 (data URI, 원본 경로 → 내용) — 시작 스크립트의 fetch·<img>가 쓴다 */\nwindow.WL_FILES={\n${Object.entries(files).map(([k, v]) => `${JSON.stringify(k)}:${JSON.stringify(v)}`).join(',\n')}\n};</script>\n`;
  h = h.replace('</body>', () => cfg + modTags + fileTag + `<script>\n${esc(BOOT)}\n</script>\n</body>`);
  // 글꼴: Jua(단추·안내·이름표·제목 — game/felt)는 게임 코드에 나오는 글자만 골라(서브셋 woff2) 이 파일 안에 넣는다 → 인터넷이 없어도 Jua로 보인다.
  // 글자 목록은 빌드할 때마다 모든 모듈의 한글·영문·숫자·기호에서 저절로 모은다. 받기에 실패하면 넣지 않고(Google Fonts 연결 → 그것도 안 되면 기본 글꼴) 알린다.
  let juaSize = 0;
  try {
    // 주석은 빼고(한글 주석이 많아 글자가 수천 개로 는다) 문자열 안의 글자만 — 화면에 나오는 글은 모두 문자열이다
    const chars = new Set('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!?.,:;()~·…\'"%+-/ ');
    for (const p of Object.keys(mods)) { if (p.startsWith('three/')) continue;
      const src = mods[p].replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/[^\n]*/g, '$1');
      for (const m of src.matchAll(/'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g)) for (const c of (m[1] ?? m[2] ?? m[3] ?? '')) if (/[\uac00-\ud7a3\u3131-\u318e]/.test(c)) chars.add(c); }
    for (const c of (h.match(/<div id="wlBoot"[\s\S]*?<\/div><\/div>/) || [''])[0]) if (/[\uac00-\ud7a3]/.test(c)) chars.add(c); // 로딩 화면 제목
    const UA = { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36' };
    const css = await (await fetch('https://fonts.googleapis.com/css2?family=Jua&text=' + encodeURIComponent([...chars].sort().join('')), { headers: UA })).text();
    const urls = [...css.matchAll(/url\((https:[^)]+)\)/g)].map(m => m[1]);if (!urls.length) throw new Error('글꼴 주소 없음');
    const faces = [];for (const u of urls) { const b = Buffer.from(await (await fetch(u)).arrayBuffer());juaSize += b.length;faces.push(`@font-face{font-family:'Jua';font-style:normal;font-weight:400;font-display:swap;src:url(data:font/woff2;base64,${b.toString('base64')}) format('woff2')}`); }
    h = h.replace('</head>', () => `<style>/* Jua 서브셋 ${chars.size}자 (tools/build-single.js — 게임 코드의 글자만, SIL OFL 1.1) */\n${faces.join('\n')}\n</style>\n</head>`);
  } catch (e) { console.warn('Jua 서브셋을 넣지 못했어요(Google Fonts 연결로 불러옴):', e.message); }

  // 새 버전 확인(2026-11-04 — 사파리가 옛 한 파일 HTML을 기억): 파일 내용 해시를 넣고, Pages에서 열면 옆 dist/build.json을 캐시 없이 읽어
  // 이 파일의 해시가 다르면 주소에 ?_b=새해시를 붙여 다시 연다(주소가 달라 사파리도 새 파일을 받는다). 더블클릭(file://)이면 읽기에 실패해 그냥 연다.
  const bh = require('crypto').createHash('sha1').update(h).digest('hex').slice(0, 10), base = path.basename(S.out);
  h = h.replace('<head>\n', () => `<head>\n<script id="wl-buildcheck">window.WL_SINGLE=${JSON.stringify(bh)};if(/^https?:/.test(location.protocol))fetch('build.json?t='+Date.now(),{cache:'no-store'}).then(r=>r.json()).then(j=>{const v=j[${JSON.stringify(base)}];if(v&&v!==window.WL_SINGLE){const u=new URL(location.href);if(u.searchParams.get('_b')!==v){u.searchParams.set('_b',v);location.replace(u);}}}).catch(()=>{});</script>\n`);
  const out = path.join(ROOT, S.out);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, h);
  { const bj = path.join(path.dirname(out), 'build.json'); let J = {}; try { J = JSON.parse(fs.readFileSync(bj, 'utf8')); } catch (e) {} J[base] = bh; fs.writeFileSync(bj, JSON.stringify(J, null, 1) + '\n'); }
  if (S.copy) { const cp = path.join(ROOT, S.copy); fs.copyFileSync(out, cp); console.log('게임 폴더에도:', S.copy, '(컴퓨터에서 더블클릭 — 저장소에는 안 올림)'); }
  const size = fs.statSync(out).size, mb = x => (x / 1024 / 1024).toFixed(2) + 'MB';
  if (juaSize) console.log(`Jua 서브셋 ${(juaSize / 1024).toFixed(0)}KB(woff2) 넣음`);
  const codeSize = Object.values(mods).reduce((a, s) => a + Buffer.byteLength(s), 0), fileSize = Object.values(files).reduce((a, s) => a + s.length, 0);
  console.log(`${S.out} ${mb(size)} — 모듈 ${Object.keys(mods).length}개 ${mb(codeSize)}(three ${THREE_V} 포함), 파일 ${Object.keys(files).length}개 ${mb(fileSize)}(data URI), 커밋 ${head}${dirty}, 버전 ${ver}`);
  if (size > LIMIT) {
    console.error(`15MB를 넘었다(${mb(size)}). 줄이는 방법: ① 텍스처 묶음을 256→128px로 굽거나 WebP 손실 압축(품질 80) ② 카드·아이콘을 WebP로 ③ 소리를 mp3 96kbps·모노로 ④ 이 스테이지에서 안 쓰는 assets 줄을 STAGES에서 빼기`);
    process.exit(2);
  }
}
main().catch(e => { console.error(e); process.exit(1); });
