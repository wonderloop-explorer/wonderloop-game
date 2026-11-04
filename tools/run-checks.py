# -*- coding: utf-8 -*-
"""원더룹 자동 시험 한 번에 — 촬영 서버(python3 tools/shot-server.py)가 8000에 떠 있을 때, 저장소 루트에서
   python3 tools/run-checks.py <이름> [--prev <앞 이름>] [--only base,rig,rules,phone,occlude,stuck,cam]
 - base·rig: 기준 스크린샷(tools/baseline-shots.js)·동작(tools/rig-shots.js)을 docs/compare/<이름>-base·-rig에 찍고(헤드리스 크롬 소프트웨어 그리기 —
   기준과 같은 방식), --prev가 있으면 docs/compare/<앞 이름>-base·-rig와 파일마다 바이트 비교
 - rules: 규칙 시험(tools/game-tests.js, 견본 실내) · phone: 휴대폰 확인(tools/phone-check.js, 390×844, 요정의 숲 선착장)
 - occlude: 가림 시험(tools/occlude-test.js, 컴퓨터·휴대폰 단계 → docs/occlude/pc·mobile) · stuck: 끼임 시험(tools/stuck-test.js, 선착장)
 - cam: 카메라 걷기 시험(tools/cam-walk-test.js, 보통 주소·휴대폰 세로)
 - touch: 팝업·패널 손가락 스크롤(tools/popup-touch-test.py — 조작법·탐험가 소개·옷 갈아입기를 진짜 터치로 끝까지 밀고 닫기)
 결과는 화면에 요약하고 docs/compare/<이름>-checks.json에 모두 남긴다. 시험 브라우저는 소리를 끄고(--mute-audio) 끝나면 닫는다."""
import json, os, sys, filecmp
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
U = 'http://localhost:8000/'
args = sys.argv[1:]
name = args[0] if args and not args[0].startswith('--') else 'now'
prev = args[args.index('--prev') + 1] if '--prev' in args else None
only = set(args[args.index('--only') + 1].split(',')) if '--only' in args else {'base', 'rig', 'rules', 'phone', 'occlude', 'stuck', 'cam', 'touch'}
OUT, R = {}, {}
SOFT = ['--mute-audio', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
GPU = ['--mute-audio', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist']

def page(b, url, vp=(1280, 800), mobile=False, dpr=1, shot=True):
    ctx = b.new_context(viewport={'width': vp[0], 'height': vp[1]}, device_scale_factor=dpr, is_mobile=mobile, has_touch=mobile)
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:300])); pg.on('console', lambda m: errs.append(m.text[:300]) if m.type == 'error' and '404' not in m.text else None)
    pg.goto(url, wait_until='commit', timeout=120000)
    pg.wait_for_function('window.wlShot' if shot else 'window.wlZone&&window.wlZone.cur', timeout=180000); pg.wait_for_timeout(1500)
    pg.set_default_timeout(3600000); return ctx, pg, errs

with sync_playwright() as p:
    if only & {'base', 'rig'}:
        b = p.chromium.launch(args=SOFT)
        for kind, mod in [('base', 'baseline-shots'), ('rig', 'rig-shots')]:
            if kind not in only: continue
            ctx, pg, errs = page(b, U + '?shot')
            pg.evaluate(f"(async()=>{{await (await import('/tools/{mod}.js')).run('compare/{name}-{kind}');return 1}})()")
            d = {'errors': errs}
            if prev:
                A, B = os.path.join(ROOT, 'docs/compare', f'{prev}-{kind}'), os.path.join(ROOT, 'docs/compare', f'{name}-{kind}')
                files = sorted(os.listdir(A)); diff = [f for f in files if not os.path.exists(os.path.join(B, f)) or not filecmp.cmp(os.path.join(A, f), os.path.join(B, f), shallow=False)]
                d.update(files=len(files), diff=diff)
            R[kind] = d; print(kind, '파일', d.get('files'), '다름', d.get('diff'), '오류', errs[:2], flush=True); ctx.close()
        b.close()
    b = p.chromium.launch(args=GPU)
    if 'rules' in only:
        ctx, pg, errs = page(b, U + '?shot&zonetest&zone=sample-indoor', (1280, 720))
        r = pg.evaluate("(async()=>await (await import('/tools/game-tests.js')).run())()")
        R['rules'] = {'pass': sum(1 for x in r if x['통과']), 'total': len(r), 'fail': [x for x in r if not x['통과']], 'errors': errs}
        print('규칙', R['rules']['pass'], '/', R['rules']['total'], [x['규칙'] for x in R['rules']['fail']], flush=True); ctx.close()
    if 'phone' in only:
        res = {}
        for q in ['', '&quality=mobile']:
            ctx, pg, errs = page(b, U + '?shot&zone=fairy-dock' + q, (390, 844), True, 2)
            r = pg.evaluate("(async()=>await (await import('/tools/phone-check.js')).run())()")
            res[q or 'high'] = {'pass': sum(1 for x in r if x['결과'] == '통과'), 'warn': [x for x in r if x['결과'] == '주의'], 'fix': [x for x in r if x['결과'] == '고칠 것'], 'errors': errs}; ctx.close()
        R['phone'] = res; print('휴대폰', {k: (v['pass'], len(v['warn']), len(v['fix'])) for k, v in res.items()}, flush=True)
    if 'occlude' in only:
        res = {}
        for tag, q, vp, mob, dpr in [('pc', '', (1280, 800), False, 1), ('mobile', '&quality=mobile', (390, 844), True, 2)]:
            ctx, pg, errs = page(b, U + '?shot&zone=fairy-dock' + q, vp, mob, dpr)
            res[tag] = pg.evaluate(f"(async()=>await (await import('/tools/occlude-test.js')).run('occlude/{tag}'))()"); res[tag]['errors'] = errs; ctx.close()
        R['occlude'] = res; print('가림', {k: (v['pass'], [(s['name'], s['ok']) for s in v['scenes']]) for k, v in res.items()}, flush=True)
    if 'stuck' in only:
        ctx, pg, errs = page(b, U + '?shot&zone=fairy-dock')
        r = pg.evaluate("(async()=>{const r=await (await import('/tools/stuck-test.js')).run();delete r.그림;return r})()")
        R['stuck'] = {'summary': r.get('요약'), 'errors': errs}; print('끼임', r.get('요약'), flush=True); ctx.close()
    if 'cam' in only:
        ctx, pg, errs = page(b, U + '?zone=fairy-dock&quality=mobile&notitle', (390, 844), True, 3, shot=False)
        pg.wait_for_timeout(3000)
        r = pg.evaluate("(async()=>{const r=await (await import('/tools/cam-walk-test.js')).run();delete r.그림;return r})()")
        R['cam'] = {'paths': [{'이름': x['이름'], '바뀜': x['바뀜']} for x in r['길']], 'errors': errs}; print('카메라 걷기', R['cam']['paths'], flush=True); ctx.close()
    b.close()
if 'touch' in only:  # 팝업·패널 손가락 스크롤(tools/popup-touch-test.py — 휴대폰 크기·진짜 터치 끌기, 끝까지 내린 화면은 docs/compare/<이름>-touch/)
    import subprocess
    pr = subprocess.run([sys.executable, os.path.join(ROOT, 'tools/popup-touch-test.py'), U, '--out', f'docs/compare/{name}-touch'], capture_output=True, text=True, cwd=ROOT)
    out = pr.stdout; j = out[:out.rfind('실패:')] if '실패:' in out else out
    try: R['touch'] = json.loads(j)
    except Exception: R['touch'] = {'raw': out[-2000:], 'stderr': pr.stderr[-2000:]}
    print('팝업 터치', out.strip().splitlines()[-1] if out.strip() else pr.stderr[-300:], flush=True)
os.makedirs(os.path.join(ROOT, 'docs/compare'), exist_ok=True)
json.dump(R, open(os.path.join(ROOT, 'docs/compare', f'{name}-checks.json'), 'w'), ensure_ascii=False, indent=1)
print('저장', f'docs/compare/{name}-checks.json')
