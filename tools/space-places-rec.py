# -*- coding: utf-8 -*-
"""탐험 지도(장소 고르기)·잠금·이어서 하기 확인 + 녹화 (2026-11-26) — 촬영 서버(8000)가 떠 있을 때 저장소 루트에서:
   python3 tools/space-places-rec.py [--pc] [--out docs/compare/space-places] [--novideo]
   ① 처음(기록 없음): 시작 화면 단추 ② 달만 시작한 기록: 장소 고르기 → 가운데 행성 잠김 ③ 달을 끝낸 기록: 가운데 행성 열림·목성 구름
   → 금성을 골라 감(구름 화면 → 반짝이 착지) → 게임 중 메뉴 '탐험 지도' → 화성으로 → 다시 열어 '이어서 하기'(화성에서 시작) ④ 모두 다녀온 기록: 목성 열림 ⑤ 옷 고르기의 '모험 지도' ⑥ '처음부터' 확인 창.
   결과: 화면 사진·<pc|phone>-places.mp4·상태 JSON. 소리 끔, 끝나면 닫음."""
import sys, os, json, glob, shutil, time, subprocess
from playwright.sync_api import sync_playwright
A = sys.argv[1:]; arg = lambda k, d=None: A[A.index(k) + 1] if k in A else d
PC = '--pc' in A; OUT = arg('--out', 'docs/compare/space-places'); os.makedirs(OUT, exist_ok=True)
VW = (1280, 632) if PC else (390, 844); TAG = 'pc' if PC else 'phone'; W = 'infinite-space'
URL = 'http://localhost:8000/?world=%s&quality=%s' % (W, 'high' if PC else 'mobile')
MOON = ['have:%s:necklace' % W, 'space:demo', 'moon:bgm-intro']
MOON_DONE = MOON + ['space:rock', 'secret:%s:icecave' % W, 'secret:%s:telescope' % W, 'clear:space-garden', 'visit:space-garden']
ALL = MOON_DONE + ['clear:space-mars', 'clear:space-venus', 'clear:space-saturn', 'mars:met', 'venus:met', 'rest:met', 'rest:sat', 'rest:toss', 'secret:%s:saturnfloat' % W, 'secret:%s:bluesunset' % W]
R = {'크기': '%dx%d' % VW}
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal']); kw = dict(viewport={'width': VW[0], 'height': VW[1]}, device_scale_factor=2, has_touch=not PC, is_mobile=not PC)
    if '--novideo' not in A: kw.update(record_video_dir=OUT + '/_v', record_video_size={'width': VW[0], 'height': VW[1]})
    cx = b.new_context(**kw); pg = cx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:300])); pg.on('console', lambda m: errs.append(m.text[:300]) if m.type == 'error' and '404' not in m.text and 'Failed to load' not in m.text else None)
    shot = lambda n: pg.screenshot(path='%s/%s-%s.png' % (OUT, TAG, n))
    TITLE = "document.getElementById('wlTitle')&&document.querySelectorAll('#wlTitle .tbtns button').length"
    def load(flags=None, last=None, clear=False):
        pg.goto(URL, wait_until='domcontentloaded')
        if clear: pg.evaluate('localStorage.clear();localStorage.setItem("wl-help-seen","1")')
        if flags is not None: pg.evaluate("([fl,last])=>{const f={};fl.forEach(k=>f[k]=true);localStorage.setItem('wl-state',JSON.stringify({flags:f,order:fl,after:{},last}));localStorage.setItem('wl-help-seen','1')}", [flags, last])
        if clear or flags is not None: pg.reload(wait_until='domcontentloaded')
        pg.wait_for_function(TITLE, timeout=120000); pg.wait_for_timeout(2600)
    btns = lambda: pg.evaluate("[...document.querySelectorAll('#wlTitle .tbtns button')].map(b=>b.textContent)")
    places = lambda: pg.evaluate("[...document.querySelectorAll('#wlPlaces .pl')].map(b=>({글:b.innerText.replace(/\\n+/g,' · '),잠김:b.disabled}))")
    def click(sel, text): pg.evaluate("([s,t])=>{const b=[...document.querySelectorAll(s)].find(x=>x.textContent.includes(t));if(!b)throw new Error('단추 없음: '+t);b.click();}", [sel, text])
    zone = lambda: pg.evaluate("wlZone.cur&&wlZone.cur.root.name")
    def landed(z, sec=40):
        pg.wait_for_function("wlZone.cur&&wlZone.cur.root.name==='zone:%s'" % z, timeout=sec * 1000); pg.wait_for_function("!wlGame.mission.hero().userData.riding", timeout=sec * 1000)
    # ① 기록 없음
    load(clear=True); R['① 처음 단추'] = btns(); shot('1-title-new')
    # ② 달만 시작
    load(MOON, 'space-garden'); R['② 기록 있음 단추'] = btns(); shot('2-title-continue'); click('#wlTitle .tbtns button', '장소 고르기'); pg.wait_for_selector('#wlPlaces'); pg.wait_for_timeout(500); R['② 달을 끝내기 전 지도'] = places(); shot('2-map-moon-only')
    click('#wlPlaces button', '처음부터'); pg.wait_for_timeout(300); shot('2-map-reset-ask'); click('#wlPlaces .ask button', '아니요'); click('#wlPlaces .close', '닫기')
    # ③ 달을 끝냄 → 금성으로
    load(MOON_DONE, 'space-garden'); click('#wlTitle .tbtns button', '장소 고르기'); pg.wait_for_selector('#wlPlaces'); pg.wait_for_timeout(500); R['③ 달을 끝낸 뒤 지도'] = places(); shot('3-map-open')
    t0 = time.time(); click('#wlPlaces .pl', '구름 행성'); pg.wait_for_timeout(900); shot('3-veil'); landed('space-venus'); R['③ 금성 도착(초)'] = round(time.time() - t0, 1); pg.wait_for_timeout(1500); shot('3-venus-landed')
    R['③ 저장된 마지막 자리'] = pg.evaluate("JSON.parse(localStorage.getItem('wl-state')).last")
    # 게임 중 메뉴 → 탐험 지도 → 화성
    pg.wait_for_timeout(9000)  # 도착 나레이션·거꾸리 첫 만남 전(이야기 장면이면 못 떠남 안내)
    pg.evaluate("document.querySelector('#wlMenu button').click()"); pg.wait_for_timeout(400); shot('4-menu'); click('#wlMenu .ls button', '탐험 지도'); pg.wait_for_timeout(600); R['④ 게임 중 지도'] = places() if pg.evaluate("!!document.getElementById('wlPlaces')") else None; shot('4-map-ingame')
    if R['④ 게임 중 지도']:
        click('#wlPlaces .pl', '붉은 모래 언덕'); pg.wait_for_timeout(1200); R['④ 안내(못 떠날 때)'] = pg.evaluate("(document.getElementById('wlToast')||{}).textContent||''"); shot('4-after-pick')
        try: landed('space-mars', 30); pg.wait_for_timeout(1200); shot('4-mars-landed'); R['④ 화성 도착'] = True
        except Exception: R['④ 화성 도착'] = False
    R['④ 마지막 자리'] = pg.evaluate("JSON.parse(localStorage.getItem('wl-state')).last")
    # 다시 열어 이어서 하기
    load(); R['⑤ 다시 연 단추'] = btns(); t0 = time.time(); click('#wlTitle .tbtns button', '이어서 하기'); pg.wait_for_timeout(1000); shot('5-continue-veil')
    try: landed(R['④ 마지막 자리'] or 'space-venus', 40); R['⑤ 이어서 하기 → 구역'] = zone(); R['⑤ 걸린 시간(초)'] = round(time.time() - t0, 1); pg.wait_for_timeout(1200); shot('5-continue-landed')
    except Exception as e: R['⑤ 이어서 하기 → 구역'] = '실패 ' + str(zone())
    # ⑥ 모두 다녀옴: 목성 열림 + 옷 고르기의 모험 지도
    load(ALL, 'space-saturn'); click('#wlTitle .tbtns button', '장소 고르기'); pg.wait_for_selector('#wlPlaces'); pg.wait_for_timeout(500); R['⑥ 모두 다녀온 뒤 지도'] = places(); shot('6-map-all'); click('#wlPlaces .close', '닫기')
    R['오류'] = errs[:6]; print(json.dumps(R, ensure_ascii=False, indent=1)); json.dump(R, open('%s/%s-result.json' % (OUT, TAG), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    cx.close(); b.close()
    for f in glob.glob(OUT + '/_v/*.webm'): subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '26', '-movflags', '+faststart', '%s/%s-places.mp4' % (OUT, TAG)], check=False)
    shutil.rmtree(OUT + '/_v', ignore_errors=True)
