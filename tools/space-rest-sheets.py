# -*- coding: utf-8 -*-
"""토성 쉼터 촬영(tools/space-rest-test.py)을 장면별 한 장으로 모음: python3 tools/space-rest-sheets.py [pc|phone] [--out docs/compare/space-rest] → show-<크기>-<장면>.png"""
import subprocess, sys, os
A = sys.argv[1:]; TAG = 'phone' if 'phone' in A else 'pc'; OUT = A[A.index('--out') + 1] if '--out' in A else 'docs/compare/space-rest'; W = 360 if TAG == 'phone' else 640
def sheet(name, files, cols):
    files = [f for f in files if os.path.exists(os.path.join(OUT, '%s-%s.png' % (TAG, f)))]
    if not files: return
    while len(files) % cols: files.append(files[-1])
    ins = []; fc = ''
    for i, f in enumerate(files): ins += ['-i', os.path.join(OUT, '%s-%s.png' % (TAG, f))]; fc += '[%d]scale=%d:-1[a%d];' % (i, W, i)
    rows = len(files) // cols
    for r in range(rows): fc += ''.join('[a%d]' % (r * cols + j) for j in range(cols)) + ('hstack=inputs=%d[r%d];' % (cols, r) if cols > 1 else 'copy[r%d];' % r)
    fc += ''.join('[r%d]' % r for r in range(rows)) + ('vstack=inputs=%d[o]' % rows if rows > 1 else 'copy[o]')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error'] + ins + ['-filter_complex', fc, '-map', '[o]', os.path.join(OUT, 'show-%s-%s.png' % (TAG, name))], check=True)
C = 5 if TAG == 'phone' else 3
sheet('1-toss', ['01-toss-how', '01-toss-ready', '01-toss-gauge', '01-toss-hot', '01-toss-fly-1', '01-toss-clear'] if TAG == 'pc' else ['01-toss-how', '01-toss-ready', '01-toss-gauge', '01-toss-hot', '01-toss-hit-1'], C)
sheet('2-rest', ['02-rest-1a-two', '02-rest-1c-ring', '02-rest-2-field', '02-rest-3-bands', '02-rest-4-hexagon', '02-rest-5-enceladus', '02-rest-6-titan', '02-rest-7a-moons', '02-rest-7c-two'] if TAG == 'pc' else ['02-rest-1a-two', '02-rest-1c-ring', '02-rest-2-field', '02-rest-3-bands', '02-rest-4-hexagon', '02-rest-5-enceladus', '02-rest-6-titan', '02-rest-7a-moons', '02-rest-7b-down', '02-rest-7c-two'], C)
sheet('3-card', ['03-card-line', '03-card'], 2)
sheet('4-bye', ['04-bye-2-wave-side', '04-bye-4-hero-front', '04-done-hop', '04-done-card'], 4 if TAG == 'phone' else 2)
sheet('5-storm', ['05-storm-2-lift', '05-storm-3-down', '05-storm-4-side', '05-storm-5a-turn', '05-storm-5b-face', '05-storm-5c-far', '05-storm-5d-in', '05-storm-6-jupiter', '05-storm-8-jupiter'] if TAG == 'pc' else ['05-storm-2-lift', '05-storm-3-down', '05-storm-4-side', '05-storm-5a-turn', '05-storm-5b-face', '05-storm-5c-far', '05-storm-5d-in', '05-storm-6-jupiter', '05-storm-7-jupiter', '05-storm-8-jupiter'], C)
sheet('6-map', ['06-map', '06-map-2'], 2)
print('ok')
