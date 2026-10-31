"""원더룹 촬영 서버 — 정적 파일 서버 + 캡처한 PNG·JSON을 docs/ 아래에, 내보낸 GLB를 assets/models/ 아래에 저장.

사용: python3 tools/shot-server.py  (저장소 루트에서, 기본 포트 8000)
페이지는 http://localhost:8000/?shot 으로 열고, 브라우저에서
  fetch('/save?path=baseline/r128/room-day.png', {method:'POST', body: wlShot.capture()})
처럼 data URL을 보내면 docs/baseline/r128/room-day.png 로 저장된다.
path가 ../assets/로 시작하면 assets/ 아래 정해진 곳에 저장한다 (models: .glb, rand: .json, textures: .webp·.json).
path가 ../captures/로 시작하면 저장소 captures/ 아래에 저장한다 (영상 캡처 모드: .mp4·.json·.png — 공개 저장소에 올리지 않는 폴더).
영상 캡처는 녹화하는 동안 &at=<바이트 위치>로 조각을 보낸다(&new면 새 파일, 그 밖에는 그 위치에 이어·덮어 씀) — 긴 영상도 브라우저 메모리에 쌓지 않는다.
/studio/ 주소는 비공개 저장소 wonderloop-studio(저장소 옆 폴더, 또는 환경 변수 WL_STUDIO)를 보여 준다 → 세계 대본 ?capture=/studio/santa/capture/opening.js
"""
import base64, http.server, os, sys, urllib.parse

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DOCS = os.path.join(ROOT, 'docs')
ASSETS = {os.path.join(ROOT, 'assets', d): ext for d, ext in {'models': ('.glb',), 'rand': ('.json',), 'textures': ('.webp', '.json')}.items()}
ASSETS[os.path.join(ROOT, 'captures')] = ('.mp4', '.json', '.png')
STUDIO = os.path.abspath(os.environ.get('WL_STUDIO') or os.path.join(ROOT, '..', 'wonderloop-studio'))


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def translate_path(self, path):
        p = urllib.parse.unquote(urllib.parse.urlparse(path).path)
        if p.startswith('/studio/') and os.path.isdir(STUDIO):
            dest = os.path.abspath(os.path.join(STUDIO, p[len('/studio/'):]))
            if dest.startswith(STUDIO + os.sep):
                return dest
        return super().translate_path(path)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def do_POST(self):
        u = urllib.parse.urlparse(self.path)
        rel = urllib.parse.parse_qs(u.query).get('path', [''])[0]
        dest = os.path.abspath(os.path.join(DOCS, rel))
        ok = (dest.startswith(DOCS + os.sep) and dest.endswith(('.png', '.json'))) or any(dest.startswith(d + os.sep) and dest.endswith(ext) for d, ext in ASSETS.items())
        if u.path != '/save' or not ok:
            self.send_error(400, 'bad path')
            return
        n = int(self.headers.get('Content-Length', 0))
        q = urllib.parse.parse_qs(u.query, keep_blank_values=True)
        at = q.get('at', [None])[0]   # 영상 조각: &at=<위치>에 이어 쓰기(이미 쓴 앞쪽을 고쳐 쓸 때도), &new면 빈 파일로 새로 시작
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        if at is None:
            body = self.rfile.read(n)
            data = base64.b64decode(body.split(b',', 1)[1]) if body.startswith(b'data:') else body
            with open(dest, 'wb') as f:
                f.write(data)
        else:
            with open(dest, 'r+b' if 'new' not in q and os.path.exists(dest) else 'wb') as f:
                f.seek(int(at))
                while n > 0:                                  # 16MB씩 읽어 쓴다 (한 번에 읽으면 2GB가 넘는 몸통에서 실패)
                    buf = self.rfile.read(min(n, 16 << 20))
                    if not buf:
                        break
                    f.write(buf)
                    n -= len(buf)
        self.send_response(204)
        self.end_headers()


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    # 연결 대기 줄을 넉넉히: 페이지가 구운 텍스처 수십 장을 한꺼번에 받으면 기본값(5)을 넘어 연결이 끊기고(ERR_CONNECTION_RESET),
    # 못 받은 텍스처를 대신 그려 촬영 그림이 1~4단계씩 달라진다(2026-10-31)
    class Server(http.server.ThreadingHTTPServer):
        request_queue_size = 128
        daemon_threads = True
    Server(('127.0.0.1', port), Handler).serve_forever()
