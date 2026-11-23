# -*- coding: utf-8 -*-
"""STAGE 1 회색 정원 — 장면만 빠르게 확인(2026-11-23): 저장을 맞춰 열고 그 장면으로 바로 감.
   촬영 서버(8000)가 떠 있을 때 저장소 루트에서: python3 tools/space-stage1-shots.py [--pc] [--out docs/compare/space-stage1-shots] <장면…>
   장면: --mortar 떡방아를 끝낸 뒤 다시 다가감 · --cave 얼음 동굴 안 · --clear 출구 → STAGE 1 완료 → 별똥별 비행(토성·빛줄기) 연속 촬영 · --sky 하늘(해·토성 자리)
   소리 끔, 끝나면 닫음."""
import os, sys, time, json
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); A = sys.argv[1:]; PC = '--pc' in A
OUT = os.path.join(ROOT, A[A.index('--out') + 1] if '--out' in A else 'docs/compare/space-stage1-shots'); os.makedirs(OUT, exist_ok=True)
VW = (1280, 632) if PC else (390, 844); TAG = 'pc' if PC else 'phone'; W = 'infinite-space'
URL = 'http://localhost:8000/?world=infinite-space&zone=space-garden&notitle&weather=starlight&quality=%s' % ('high' if PC else 'mobile')
BASE = ['have:%s:necklace' % W, 'space:demo', 'meet:%s:bobo' % W]
DONE = BASE + ['item:%s:dalddeok' % W, 'secret:%s:telescope' % W, 'space:rock']
def run(p, flags, fn):
    b = p.chromium.launch(args=['--mute-audio']); cx = b.new_context(viewport={'width': VW[0], 'height': VW[1]}, device_scale_factor=2, has_touch=not PC, is_mobile=not PC); pg = cx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    ready = 'window.wlZone&&wlZone.cur&&window.wlGame&&wlGame.mission.hero()'
    pg.goto(URL, wait_until='domcontentloaded'); pg.evaluate('localStorage.clear();localStorage.setItem("wl-help-seen","1")'); pg.reload(wait_until='domcontentloaded'); pg.wait_for_function(ready, timeout=120000); pg.wait_for_timeout(2000)
    pg.evaluate("(fl)=>{for(const k of fl)wlGame.state.setFlag(k,true);}", flags); pg.wait_for_timeout(400); pg.reload(wait_until='domcontentloaded'); pg.wait_for_function(ready, timeout=120000); pg.wait_for_timeout(3500)
    pg.keyboard.press('ArrowLeft'); pg.wait_for_timeout(300)
    try: fn(pg)
    finally:
        if errs: print('오류', errs[:3])
        b.close()
def H(pg):
    def shot(n): pg.screenshot(path=os.path.join(OUT, '%s-%s.png' % (TAG, n)))
    def tp(x, z): pg.evaluate("([x,z])=>{const W=wlGame.mission.hero();W.position.set(x,0,z);}", [x, z]); pg.wait_for_timeout(900)
    def walk(x, z, sec=25, r=.5):
        t0 = time.time()
        while time.time() - t0 < sec:
            h = pg.evaluate('(()=>{const p=wlGame.mission.hero().position;return [p.x,p.z]})()')
            if ((h[0] - x) ** 2 + (h[1] - z) ** 2) ** .5 < r: return
            pg.evaluate('([x,z])=>wlGame.mission.hero().userData.walkTo(x,z)', [x, z]); pg.wait_for_timeout(200)
    return shot, tp, walk, pg.evaluate('wlZone.cur.spots')
def mortar(pg):
    shot, tp, walk, S = H(pg); m = S['mortar']; tp(m[0] - 2.4, m[1] - 1.6); walk(m[0], m[1], 12, .35); pg.wait_for_timeout(1500); shot('01-mortar-done')
    print('떡방아 끝난 뒤: 단추', pg.evaluate("(()=>{const e=document.getElementById('wlAct');return e&&getComputedStyle(e).display!=='none'?e.textContent:null})()"), '· 횟수 표시', pg.evaluate("(()=>{const e=document.getElementById('wlCount');return !!(e&&e.classList.contains('on'))})()"))
def cave(pg):
    shot, tp, walk, S = H(pg); c = S['cave']; tp(c[0] + .3, c[1] + 4.2); shot('02-cave-out'); walk(c[0], c[1] + .1, 12, .3); pg.wait_for_timeout(2600); shot('02-cave-in'); pg.wait_for_timeout(5200); shot('02-cave-in2')
def clear(pg):
    shot, tp, walk, S = H(pg); e = S['exit']; tp(e[0] + 3.2, e[1] + 2.2); pg.wait_for_timeout(600); pg.evaluate('([x,z])=>wlGame.mission.hero().userData.walkTo(x,z)', e)
    t0 = time.time()
    while time.time() - t0 < 15 and not pg.evaluate("!!wlGame.state.flags['clear:space-garden']"): pg.wait_for_timeout(60)
    pg.wait_for_timeout(450); shot('03-clear-0'); pg.wait_for_timeout(500); shot('03-clear-1')
    t0 = time.time(); k = 0
    while time.time() - t0 < 26 and pg.evaluate("!!(wlZone.cur&&wlZone.cur.name==='회색 정원')"):
        pg.wait_for_timeout(900); shot('04-ride-%02d' % k); k += 1
def sky(pg):
    shot, tp, walk, S = H(pg); pg.wait_for_timeout(1200); shot('05-sky')
with sync_playwright() as p:
    if '--mortar' in A: run(p, DONE, mortar)
    if '--cave' in A: run(p, DONE, cave)
    if '--clear' in A: run(p, DONE + ['secret:%s:icecave' % W], clear)
    if '--sky' in A: run(p, BASE, sky)
print('ok', OUT)
