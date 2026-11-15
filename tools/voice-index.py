# -*- coding: utf-8 -*-
"""목소리 대본 목록 → 게임이 읽는 색인 (2026-11-15) — 저장소 루트에서:
     python3 tools/voice-index.py            # docs/voice/script.csv → docs/voice/script.md + assets/voice/<세계>/index.json
     python3 tools/voice-index.py --temp     # + 임시 목소리(맥 say)를 assets/voice-temp/<세계>/에 만들고 그쪽 색인도(.gitignore — 시험용, ?voiceTemp)
     python3 tools/voice-index.py --check    # 대본의 대사가 게임 코드에 그대로 있는지만 확인
   대본 목록이 기준이다: '파일 이름' 칸의 파일이 assets/voice/<세계>/에 있으면 색인에 has:1 → 게임이 그 줄에서 파일을 튼다. 없으면 자막만.
   tools/stamp.py가 커밋 때마다 이 도구를 불러, 파일만 넣고 커밋해도 색인이 맞는다.
   세계 폴더: 번호 앞머리로 정함(SPC → space). 새 세계는 WORLDS에 한 줄."""
import csv, json, os, re, subprocess, sys, hashlib
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); os.chdir(ROOT)
WORLDS = {'SPC': 'space'}
SRC = ['js/zones/space/garden.js', 'js/zones/space/mars.js', 'js/zones/space/venus.js', 'js/worlds/infinite-space.js', 'js/game/react.js']
TEMP_VOICE = {'나레이터': (175, 1.0), '보름 할아버지': (150, .8), '삐삐': (215, 1.25), '둥둥': (115, .72), '원더룹': (190, 1.12)}  # 임시 목소리(맥 say 유나 하나 — 다른 한국어 목소리는 안 깔린 맥이 많다): (빠르기, 높낮이 배율) — 사람마다 다르게 들리게만
def rows():
    with open('docs/voice/script.csv', encoding='utf-8-sig', newline='') as f: return list(csv.DictReader(f))
def base(who): return re.sub(r'\s*\(.*\)$', '', who or '').strip()
def has_file(d, name): return os.path.isfile(os.path.join(d, name)) and os.path.getsize(os.path.join(d, name)) > 200
def index(R, root='assets/voice'):
    out = {}
    for r in R:
        w = WORLDS.get(r['번호'].split('-')[0]);
        if not w: continue
        d = os.path.join(root, w); os.makedirs(d, exist_ok=True)
        st = r['번호'].split('-')[1]
        out.setdefault(w, []).append({'id': r['번호'], 'st': st, 'who': r['말하는 사람'], 'text': r['대사'], 'file': r['파일 이름'], 'has': 1 if has_file(d, r['파일 이름']) else 0,
                                     **({'fx': 1} if st == 'FX' else {}), **({'mute': 1} if r['상태'].startswith(('목소리 없음', '효과음')) else {})})
    for w, L in out.items():
        p = os.path.join(root, w, 'index.json'); s = json.dumps({'world': w, 'lines': L}, ensure_ascii=False, separators=(',', ':'))
        if not os.path.isfile(p) or open(p, encoding='utf-8').read() != s: open(p, 'w', encoding='utf-8').write(s)
    return out
def md(R):
    by = {}
    for r in R: by.setdefault(r['스테이지'], []).append(r)
    L = ['# 목소리 대본 목록', '', '`docs/voice/script.csv`와 같은 내용입니다(이 파일은 `python3 tools/voice-index.py`가 만듭니다 — 고칠 때는 csv를 고치세요).', '',
         '- 줄 수: 모두 %d줄 — ' % len(R) + ' · '.join('%s %d' % (k, len(v)) for k, v in by.items()),
         '- 말하는 사람별: ' + ' · '.join('%s %d' % (k, n) for k, n in sorted(count(R, '말하는 사람').items(), key=lambda x: -x[1])),
         '- 상태별: ' + ' · '.join('%s %d' % (k, n) for k, n in count(R, '상태').items()), '']
    for st, rs in by.items():
        L += ['## ' + st, '', '| 번호 | 장면 | 말하는 사람 | 듣는 사람 | 대사 | 감정 | 파일 이름 | 상태 | 비고 |', '|---|---|---|---|---|---|---|---|---|']
        for r in rs: L.append('| ' + ' | '.join((r[k] or '').replace('|', '\\|') for k in ['번호', '장면', '말하는 사람', '듣는 사람', '대사', '감정', '파일 이름', '상태', '비고']) + ' |')
        L.append('')
    open('docs/voice/script.md', 'w', encoding='utf-8').write('\n'.join(L))
def count(R, k):
    c = {}
    for r in R: c[r[k]] = c.get(r[k], 0) + 1
    return c
def check(R):
    src = '\n'.join(open(p, encoding='utf-8').read() for p in SRC if os.path.isfile(p)); bad = []
    for r in R:
        if r['번호'].split('-')[1] == 'FX': continue
        if r['대사'] not in src and r['대사'].replace("'", "\\'") not in src: bad.append(r['번호'])
    ids = [r['번호'] for r in R]; dup = sorted({i for i in ids if ids.count(i) > 1})
    return bad, dup
def temp(R):
    """임시 목소리: 맥 say → aiff → mp3(48kbps 모노). 몇 줄은 일부러 안 만든다(파일이 없는 줄 시험 — 번호 끝자리 7)."""
    n = 0
    for r in R:
        w = WORLDS.get(r['번호'].split('-')[0]); st = r['번호'].split('-')[1]
        if not w or st == 'FX' or r['상태'].startswith(('목소리 없음', '효과음')) or r['번호'].endswith('7'): continue
        d = os.path.join('assets/voice-temp', w); os.makedirs(d, exist_ok=True); out = os.path.join(d, r['파일 이름'])
        sig = hashlib.md5((r['말하는 사람'] + r['대사']).encode()).hexdigest()[:10]; mark = out + '.sig'
        if os.path.isfile(out) and os.path.isfile(mark) and open(mark).read() == sig: continue
        rate, pk = TEMP_VOICE.get(base(r['말하는 사람']), (220, 1.4) if '토끼' in r['말하는 사람'] else (180, 1.0))
        txt = re.sub(r'[()]', '', r['대사']).replace('…', ', ').replace('—', ', ')
        subprocess.run(['say', '-v', 'Yuna', '-r', str(rate), '-o', out + '.aiff', txt], check=True)
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', out + '.aiff', '-af', 'asetrate=22050*%s,aresample=44100,atempo=%s' % (pk, round(1 / pk, 3)), '-ac', '1', '-b:a', '64k', out], check=True); os.remove(out + '.aiff')
        if os.path.getsize(out) < 2000: raise SystemExit('임시 목소리가 비었음: ' + out)
        open(mark, 'w').write(sig); n += 1
    return n
if __name__ == '__main__':
    R = rows(); bad, dup = check(R)
    if '--check' not in sys.argv:
        md(R); I = index(R)
        if '--temp' in sys.argv: print('임시 목소리 새로 만든 줄', temp(R)); index(R, 'assets/voice-temp')
        for w, L in I.items(): print('색인 assets/voice/%s/index.json — %d줄, 파일 있는 줄 %d' % (w, len(L), sum(x['has'] for x in L)))
    if dup: print('번호가 겹침:', dup)
    if bad: print('게임 코드에 그대로 없는 대사(대본과 코드가 어긋남):', bad)
    sys.exit(1 if dup else 0)
