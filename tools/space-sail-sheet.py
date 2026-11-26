# -*- coding: utf-8 -*-
"""tools/space-sail-rec.py가 찍은 장면을 한 장으로 모음: python3 tools/space-sail-sheet.py <pc|phone> [--out docs/compare/space-sail]"""
import sys, os
from PIL import Image
A = sys.argv[1:]; TAG = A[0]; OUT = A[A.index('--out') + 1] if '--out' in A else 'docs/compare/space-sail'
N = ['pre', 'u0.02', 'u0.06', 'u0.12', 'u0.2', 'u0.3', 'u0.355', 'map', 'u0.44', 'u0.5', 'u0.56', 'u0.62', 'u0.68', 'u0.74', 'u0.8', 'u0.86', 'u0.92', 'u0.97', 'u0.995', 'arr1', 'arr2', 'arr3']
ims = [Image.open('%s/%s-%s.png' % (OUT, TAG, n)).convert('RGB') for n in N if os.path.exists('%s/%s-%s.png' % (OUT, TAG, n))]
cols = 11 if TAG == 'phone' else 4; H = 420 if TAG == 'phone' else 300; ims = [i.resize((int(i.width * H / i.height), H)) for i in ims]; w = ims[0].width; rows = (len(ims) + cols - 1) // cols
S = Image.new('RGB', (cols * (w + 4), rows * (H + 4)), 'white')
for k, i in enumerate(ims): S.paste(i, ((k % cols) * (w + 4), (k // cols) * (H + 4)))
S.save('%s/%s-sheet.jpg' % (OUT, TAG), quality=88); print(S.size)
