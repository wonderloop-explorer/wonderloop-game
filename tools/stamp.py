"""원더룹 버전 표시 — index.html이 불러오는 파일에 버전(?v=…)을 붙여, Pages에 새로 올리면 방문자가 늘 새 파일을 받게 한다.

사용: python3 tools/stamp.py          (index.html을 고침)
      python3 tools/stamp.py --check  (고칠 게 있으면 실패 — 커밋 전 확인용)
커밋할 때 저절로 돌게 하려면 한 번만: git config core.hooksPath tools/hooks

버전은 js/와 assets/ 안 실행용 파일(.js .json .webp .png .jpg .glb) 내용 전체의 해시 10자리다. 하나라도 바뀌면 버전이 바뀐다.
- importmap에 js 파일마다 "./js/x.js": "./js/x.js?v=버전"을 넣는다 → 모듈끼리의 import, 도구의 import도 모두 같은 버전 주소로 간다.
- 시작 모듈 <script src="js/08-main.js?v=버전">, window.WL_V='버전' (fetch로 읽는 json·텍스처 주소에 붙인다).
index.html 자체는 Pages가 최대 10분 캐시하고, 사파리는 로컬 서버(http.server)의 index.html을 더 오래 기억하기도 한다(2026-11-02, 아이폰에서 화관이 안 보였다).
그래서 version.json({"v":버전})도 쓰고, index.html 맨 앞 작은 스크립트가 이것을 캐시 없이 읽어 버전이 다르면 주소에 &_v=새버전을 붙여 다시 연다
(주소가 달라 사파리도 새 index.html을 받는다). 톱니 메뉴 성능 상자 맨 위에 '버전 …'이 보인다.
"""
import base64, hashlib, json, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
INDEX = os.path.join(ROOT, 'index.html')
EXT = ('.js', '.json', '.webp', '.png', '.glb', '.jpg')


def files():
    out = []
    for top in ('js', 'assets'):
        for d, _, fs in os.walk(os.path.join(ROOT, top)):
            out += [os.path.join(d, f) for f in fs if f.endswith(EXT)]
    return sorted(out)


def version():
    h = hashlib.sha1()
    for p in files():
        h.update(os.path.relpath(p, ROOT).replace(os.sep, '/').encode()); h.update(b'\0')
        with open(p, 'rb') as f:
            h.update(f.read())
    return h.hexdigest()[:10]


def stamp(html, v):
    m = re.search(r'(<script type="importmap">)(.*?)(</script>)', html, re.S)
    im = json.loads(m.group(2))
    imports = {k: val for k, val in im['imports'].items() if not k.startswith('./js/')}
    for p in files():
        rel = os.path.relpath(p, ROOT).replace(os.sep, '/')
        if rel.startswith('js/') and rel.endswith('.js'):
            imports['./' + rel] = f'./{rel}?v={v}'
    im['imports'] = imports
    html = html[:m.start(2)] + '\n' + json.dumps(im, indent=2, ensure_ascii=False) + '\n' + html[m.end(2):]
    html = re.sub(r'<script>window\.WL_V=.*?</script>\n', '', html)
    html = html.replace('<script type="importmap">', f"<script>window.WL_V='{v}';</script>\n<script type=\"importmap\">", 1)
    if 'wl-vercheck' not in html:  # 사파리가 옛 index.html을 기억해도 새 버전으로 다시 연다(맨 위 설명)
        html = html.replace('<script type="importmap">', "<script id=\"wl-vercheck\">fetch('version.json?t='+Date.now(),{cache:'no-store'}).then(r=>r.json()).then(j=>{if(j.v&&j.v!==window.WL_V){const u=new URL(location.href);if(u.searchParams.get('_v')!==j.v){u.searchParams.set('_v',j.v);location.replace(u);}}}).catch(()=>{});</script>\n<script type=\"importmap\">", 1)
    html = re.sub(r'src="js/08-main\.js(\?v=[0-9a-f]*)?"', f'src="js/08-main.js?v={v}"', html)
    # 공통 로딩 화면의 행성 그림(assets/common/loading-planet.webp)을 index.html 안에 data URI로 — 네트워크를 기다리지 않고
    # 발자국·별과 한꺼번에 나오게(아이폰에서 행성만 늦게 나왔다, 2026-11-04). 그림을 바꾸면 이 스크립트가 다시 넣는다.
    with open(os.path.join(ROOT, 'assets/common/loading-planet.webp'), 'rb') as f:
        uri = 'data:image/webp;base64,' + base64.b64encode(f.read()).decode()
    html, n = re.subn(r'<script>window\.WL_BOOT_IMG="[^"]*";</script>', lambda m: f'<script>window.WL_BOOT_IMG="{uri}";</script>', html)
    if n != 1:
        sys.exit('index.html에서 window.WL_BOOT_IMG 줄을 못 찾음(공통 로딩 화면)')
    return html


if __name__ == '__main__':
    with open(INDEX, encoding='utf-8') as f:
        old = f.read()
    v = version(); new = stamp(old, v)
    if '--check' in sys.argv:
        if new != old:
            sys.exit(f'index.html 버전 표시가 낡았다 → python3 tools/stamp.py (버전 {v})')
        try:
            with open(os.path.join(ROOT, 'version.json'), encoding='utf-8') as f:
                if json.load(f).get('v') != v:
                    sys.exit(f'version.json 버전이 낡았다 → python3 tools/stamp.py (버전 {v})')
        except FileNotFoundError:
            sys.exit('version.json이 없다 → python3 tools/stamp.py')
        print('버전 표시 최신', v)
    else:
        if new != old:
            with open(INDEX, 'w', encoding='utf-8') as f:
                f.write(new)
        with open(os.path.join(ROOT, 'version.json'), 'w', encoding='utf-8') as f:
            f.write(json.dumps({'v': v}) + '\n')
        print('버전', v)
