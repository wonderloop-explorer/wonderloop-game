"""원더룹 촬영 서버 — 정적 파일 서버 + 캡처한 PNG·JSON을 docs/ 아래에, 내보낸 GLB를 assets/models/ 아래에 저장.

사용: python3 tools/shot-server.py  (저장소 루트에서, 기본 포트 8000)
페이지는 http://localhost:8000/?shot 으로 열고, 브라우저에서
  fetch('/save?path=baseline/r128/room-day.png', {method:'POST', body: wlShot.capture()})
처럼 data URL을 보내면 docs/baseline/r128/room-day.png 로 저장된다.
"""
import base64, http.server, os, sys, urllib.parse

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DOCS = os.path.join(ROOT, 'docs')
MODELS = os.path.join(ROOT, 'assets', 'models')


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def do_POST(self):
        u = urllib.parse.urlparse(self.path)
        rel = urllib.parse.parse_qs(u.query).get('path', [''])[0]
        dest = os.path.abspath(os.path.join(DOCS, rel))
        ok = (dest.startswith(DOCS + os.sep) and dest.endswith(('.png', '.json'))) or (dest.startswith(MODELS + os.sep) and dest.endswith('.glb'))
        if u.path != '/save' or not ok:
            self.send_error(400, 'bad path')
            return
        body = self.rfile.read(int(self.headers.get('Content-Length', 0)))
        data = base64.b64decode(body.split(b',', 1)[1]) if body.startswith(b'data:') else body
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        with open(dest, 'wb') as f:
            f.write(data)
        self.send_response(204)
        self.end_headers()


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    http.server.ThreadingHTTPServer(('127.0.0.1', port), Handler).serve_forever()
