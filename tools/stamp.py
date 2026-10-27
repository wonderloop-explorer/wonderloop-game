"""원더룹 버전 표시 — index.html이 불러오는 파일에 버전(?v=…)을 붙여, Pages에 새로 올리면 방문자가 늘 새 파일을 받게 한다.

사용: python3 tools/stamp.py          (index.html을 고침)
      python3 tools/stamp.py --check  (고칠 게 있으면 실패 — 커밋 전 확인용)
커밋할 때 저절로 돌게 하려면 한 번만: git config core.hooksPath tools/hooks

버전은 js/와 assets/ 안 실행용 파일(.js .json .webp .glb) 내용 전체의 해시 10자리다. 하나라도 바뀌면 버전이 바뀐다.
- importmap에 js 파일마다 "./js/x.js": "./js/x.js?v=버전"을 넣는다 → 모듈끼리의 import, 도구의 import도 모두 같은 버전 주소로 간다.
- 시작 모듈 <script src="js/08-main.js?v=버전">, window.WL_V='버전' (fetch로 읽는 json·텍스처 주소에 붙인다).
index.html 자체는 Pages가 최대 10분 캐시하지만, 옛 index.html은 옛 버전 주소만 가리키므로 옛 파일·새 파일이 섞이지 않는다.
"""
import hashlib, json, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
INDEX = os.path.join(ROOT, 'index.html')
EXT = ('.js', '.json', '.webp', '.glb')


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
    html = re.sub(r'src="js/08-main\.js(\?v=[0-9a-f]*)?"', f'src="js/08-main.js?v={v}"', html)
    return html


if __name__ == '__main__':
    with open(INDEX, encoding='utf-8') as f:
        old = f.read()
    v = version(); new = stamp(old, v)
    if '--check' in sys.argv:
        if new != old:
            sys.exit(f'index.html 버전 표시가 낡았다 → python3 tools/stamp.py (버전 {v})')
        print('버전 표시 최신', v)
    else:
        if new != old:
            with open(INDEX, 'w', encoding='utf-8') as f:
                f.write(new)
        print('버전', v)
