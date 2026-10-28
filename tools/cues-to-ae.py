# -*- coding: utf-8 -*-
"""소리 시점 기록(cues.json) → 애프터이펙트 스크립트(.jsx)

사용:
  python3 tools/cues-to-ae.py captures/santa/opening-16x9.cues.json captures/santa/opening-9x16.cues.json
  python3 tools/cues-to-ae.py <cues.json …> -o captures/santa/opening.jsx --sounds assets/sounds

애프터이펙트에서 파일 → 스크립트 → 스크립트 파일 실행으로 .jsx를 열면:
  - 화면비마다 컴포지션 하나(16:9, 9:16)를 만들고, 녹화 영상을 맨 아래 레이어로 놓는다.
  - 나레이션·대사·효과음 파일을 기록된 시점(t)에 레이어로 놓는다. 끊긴 나레이션은 끊긴 곳에서 자른다.
  - 대사·나레이션마다 마커에 "말한 이: 대사"를 적는다(영상 레이어와 소리 레이어 둘 다, 마커 길이 = 대사 길이).
  - 타이틀·안내 카드는 영상에 그려지지 않으므로 영상 레이어 마커("타이틀: …", "카드 · 미션: 제목 / 설명")로 남긴다.
  - 구간(segments)은 컴포지션 마커로 놓는다(구간 이름, 길이).
  - 파일이 없는 대사(아직 녹음 전)는 마커만 놓고, 끝나면 못 찾은 파일 목록을 알려 준다.
  - 프로젝트 패널에 "원더룹 <대본>" 폴더를 만들어 영상·소리를 정리한다.

cues.json 모양 (영상 캡처 모드가 쓴다):
  {"world":"santa","script":"opening","aspect":"16x9","width":1920,"height":1080,"fps":30,"duration":12.5,
   "video":"opening-16x9.mp4",
   "cues":[{"t":1.2,"dur":2.4,"kind":"narration|dialogue|sfx|music","id":"n01","file":"assets/sounds/santa/n01.mp3","text":"…","who":"…","cut":null}]}
  video·file 경로는 cues.json이 있는 폴더 기준, 아니면 저장소 기준, 아니면 --sounds 폴더에서 파일 이름으로 찾는다.
  .jsx에는 찾은 파일의 절대 경로와 .jsx 기준 상대 경로를 적는다. 애프터이펙트에서 절대 경로에 없으면
  .jsx 기준 상대 경로, 그다음 .jsx 옆의 같은 이름 순서로 찾는다(폴더째 옮겨도 열리게).
"""
import argparse, json, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
LABEL = {'narration': 9, 'dialogue': 11, 'sfx': 2, 'music': 5}   # 애프터이펙트 라벨 색: 9 초록, 11 주황, 2 노랑, 5 라벤더
KIND_KO = {'narration': '나레이션', 'dialogue': '대사', 'sfx': '효과음', 'music': '음악', 'title': '타이틀', 'card': '카드'}


def js_ascii(s):
    """스크립트 전체를 ASCII로: 한글·이모지는 \\uXXXX(이모지는 두 개로 쪼갬) — 애프터이펙트가 파일 인코딩을 잘못 읽어도 글자가 깨지지 않게"""
    out = []
    for ch in s:
        o = ord(ch)
        if o < 128: out.append(ch)
        elif o < 0x10000: out.append('\\u%04x' % o)
        else: o -= 0x10000; out.append('\\u%04x\\u%04x' % (0xD800 + (o >> 10), 0xDC00 + (o & 0x3FF)))
    return ''.join(out)


def find(path, base, sounds):
    if not path:
        return None
    for cand in ([path] if os.path.isabs(path) else [os.path.join(base, path), os.path.join(ROOT, path)]) + \
                ([os.path.join(sounds, os.path.basename(path))] if sounds else []):
        if os.path.isfile(cand):
            return os.path.abspath(cand)
    return None


def load(path, sounds):
    doc = json.load(open(path, encoding='utf-8'))
    base = os.path.dirname(os.path.abspath(path))
    for k in ('width', 'height', 'fps'):
        if not doc.get(k):
            sys.exit(f'{path}: {k}가 없어요')
    doc['videoPath'] = find(doc.get('video'), base, sounds) or (os.path.join(base, doc['video']) if doc.get('video') else None)
    missing = []
    for c in doc.get('cues', []):
        c['path'] = find(c.get('file'), base, sounds)
        if c.get('file') and not c['path']:
            missing.append(c['file'])
    if not doc.get('duration'):
        doc['duration'] = max([c['t'] + (c.get('cut') or c.get('dur') or 0) for c in doc.get('cues', [])] + [1]) + 1
    return doc, missing


JSX = r'''// 원더룹 — 소리 시점 기록을 애프터이펙트에 놓는 스크립트 (tools/cues-to-ae.py가 만듦, 고치지 말고 다시 만드세요)
// 파일 → 스크립트 → 스크립트 파일 실행
(function () {
  var DATA = __DATA__;
  var here = new File($.fileName).parent;
  function pick(p) {                       // 적힌 경로 → .jsx 기준 상대 경로 → .jsx 옆의 같은 이름
    if (!p) return null;
    var f = new File(p.abs); if (f.exists) return f;
    if (p.rel) { var r = new File(here.fsName + "/" + p.rel); if (r.exists) return r; }
    var g = new File(here.fsName + "/" + f.name); return g.exists ? g : null;
  }
  var cache = {}, missing = [];
  function footage(p, bin) {
    if (cache[p.abs]) return cache[p.abs];
    var f = pick(p); if (!f) { missing.push(p.rel || p.abs); return null; }
    var it = app.project.importFile(new ImportOptions(f)); it.parentFolder = bin; cache[p.abs] = it; return it;
  }
  function mark(layer, time, c) {
    var t = c.kind === "title" ? c.kindKo + ": " + c.text + (c.sub ? " / " + c.sub : "")
          : c.kind === "card" ? c.kindKo + " \u00b7 " + (c.who ? c.who + ": " : "") + c.text + (c.sub ? " / " + c.sub : "")
          : (c.who || c.kindKo) + ": " + c.text;
    var m = new MarkerValue(t);
    m.duration = c.cut != null ? c.cut : c.dur;
    layer.property("Marker").setValueAtTime(time, m);
  }
  app.beginUndoGroup("원더룹 소리 배치");
  if (!app.project) app.newProject();
  var top = app.project.items.addFolder(DATA.title);
  var made = [];
  for (var i = 0; i < DATA.comps.length; i++) {
    var D = DATA.comps[i];
    var bin = app.project.items.addFolder(D.aspect + " 소리"); bin.parentFolder = top;
    var comp = app.project.items.addComp(D.name, D.width, D.height, 1, D.duration, D.fps);
    comp.parentFolder = top;
    var video = D.video ? footage(D.video, top) : null;
    var vl = video ? comp.layers.add(video) : comp.layers.addNull(D.duration);
    vl.name = video ? "녹화 영상" : "녹화 영상 (파일 없음 — 마커만)";
    var segMarks = comp.markerProperty || vl.property("Marker");   // 구간: 컴포지션 마커 (옛 버전은 영상 레이어)
    for (var s = 0; s < D.segments.length; s++) {
      var sm = new MarkerValue("\u25b6 " + D.segments[s].name); sm.duration = D.segments[s].dur; segMarks.setValueAtTime(D.segments[s].t, sm);
    }
    for (var k = 0; k < D.cues.length; k++) {
      var c = D.cues[k];
      if (c.kind === "dialogue" || c.kind === "narration" || c.kind === "title" || c.kind === "card") mark(vl, c.t, c);
      if (!c.path) continue;
      var it = footage(c.path, bin); if (!it) continue;
      var l = comp.layers.add(it);
      l.startTime = c.t;
      if (c.cut != null) l.outPoint = c.t + c.cut;
      l.name = c.kindKo + (c.who ? " · " + c.who : "") + (c.text ? " · " + c.text.substr(0, 24) : (c.id ? " · " + c.id : ""));
      l.label = c.label;
      if (c.kind === "dialogue" || c.kind === "narration") mark(l, c.t, c);
      l.moveBefore(vl);                   // 영상은 맨 아래
    }
    made.push(comp);
  }
  app.endUndoGroup();
  if (made.length) made[0].openInViewer();
  var msg = "원더룹: 컴포지션 " + made.length + "개를 만들었어요.";
  if (missing.length) msg += "\n못 찾은 파일 " + missing.length + "개:\n" + missing.join("\n");
  alert(msg);
})();
'''


def main():
    ap = argparse.ArgumentParser(description='소리 시점 기록(cues.json) → 애프터이펙트 스크립트(.jsx)')
    ap.add_argument('cues', nargs='+', help='화면비별 cues.json (16:9, 9:16 …)')
    ap.add_argument('-o', '--out', help='만들 .jsx (기본: 첫 cues.json 옆에 <대본>.jsx)')
    ap.add_argument('--sounds', help='소리 파일을 이름으로 찾을 폴더')
    a = ap.parse_args()
    comps, missing = [], []
    for p in a.cues:
        d, miss = load(p, a.sounds)
        missing += miss
        aspect = d.get('aspect') or f"{d['width']}x{d['height']}"
        comps.append({'name': f"원더룹 {d.get('script', '')} {aspect.replace('x', ':')}".strip(), 'aspect': aspect.replace('x', ':'),
                      'width': d['width'], 'height': d['height'], 'fps': d['fps'], 'duration': round(d['duration'], 4), 'video': d['videoPath'],
                      'cues': [{'t': c['t'], 'dur': c.get('dur') or 0, 'cut': c.get('cut'), 'kind': c.get('kind', 'sfx'), 'kindKo': KIND_KO.get(c.get('kind'), c.get('kind')),
                                'label': LABEL.get(c.get('kind'), 0), 'id': c.get('id') or '', 'text': c.get('text') or '', 'who': c.get('who') or '',
                                'sub': c.get('sub') or '', 'path': c['path']}
                               for c in sorted(d.get('cues', []), key=lambda c: c['t'])],
                      'segments': [{'name': s.get('name', ''), 't': s.get('t', 0), 'dur': s.get('dur', 0)} for s in d.get('segments', [])]})
    first = json.load(open(a.cues[0], encoding='utf-8'))
    title = f"원더룹 {first.get('world', '')} {first.get('script', '')}".strip()
    out = a.out or os.path.join(os.path.dirname(os.path.abspath(a.cues[0])), (first.get('script') or 'cues') + '.jsx')
    jdir = os.path.dirname(os.path.abspath(out))
    ref = lambda p: p and {'abs': p, 'rel': os.path.relpath(p, jdir).replace(os.sep, '/')}
    for c in comps:
        c['video'] = ref(c['video'])
        for q in c['cues']:
            q['path'] = ref(q['path'])
    data = json.dumps({'title': title, 'comps': comps}, ensure_ascii=True)   # 한글은 \uXXXX로 → 애프터이펙트 인코딩과 상관없이 안전
    # 따옴표 안 글자만 \\uXXXX로 (화면에 나오는 이름·대사가 애프터이펙트 인코딩과 상관없이 안전), 주석은 한국어 그대로 — UTF-8 BOM으로 저장
    src = re.sub(r'"(?:[^"\\\n]|\\.)*"', lambda m: js_ascii(m.group(0)), JSX.replace('__DATA__', data))
    with open(out, 'w', encoding='utf-8-sig') as f:
        f.write(src)
    n = sum(len(c['cues']) for c in comps)
    print(f'{out}: 컴포지션 {len(comps)}개, 소리 시점 {n}개' + (f', 못 찾은 파일 {len(set(missing))}개' if missing else ''))


if __name__ == '__main__':
    main()
