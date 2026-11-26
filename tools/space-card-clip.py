# -*- coding: utf-8 -*-
"""발견·비밀 띠 카드 글이 잘리는지 + 화성 파란 노을 카드(나레이션 끝까지 떠 있는지) 확인 (2026-11-26) — 촬영 서버(8000)가 떠 있을 때 저장소 루트에서:
   python3 tools/space-card-clip.py [--pc] [--land] [--out docs/compare/card-clip]
   ① 구역 코드의 ui.secret 글을 모아 그 화면 크기에서 하나씩 띄워 본문이 잘렸는지(scrollHeight > clientHeight) 잼 ② 화성 노을 장면을 실제로 지나며 카드가 뜬 사진·카드가 떠 있던 초·목소리 길이. 소리 끔, 끝나면 닫음."""
import sys, os, re, json, glob
from playwright.sync_api import sync_playwright
A = sys.argv[1:]; PC = '--pc' in A; LAND = '--land' in A; OUT = A[A.index('--out') + 1] if '--out' in A else 'docs/compare/card-clip'; os.makedirs(OUT, exist_ok=True)
VW = (1280, 632) if PC else (844, 390) if LAND else (390, 844); TAG = 'pc' if PC else 'land' if LAND else 'phone'; W = 'infinite-space'
READY = 'window.wlZone&&wlZone.cur&&window.wlGame&&wlGame.mission.hero()'
def texts():
    out = []
    for f in sorted(glob.glob('js/zones/space/*.js')):
        s = open(f, encoding='utf-8').read()
        for m in re.finditer(r"ui\.secret\(\{[^\n]*?title:('[^']*'|[A-Za-z0-9_.]+),text:('[^']*'|[A-Za-z0-9_.]+)", s):
            def val(x):
                if x.startswith("'"): return x[1:-1]
                k = x.split('.')[-1]; mm = re.search(r"\b%s\s*[:=]\s*'([^']*)'" % re.escape(k), s); return mm.group(1) if mm else None
            t, x = val(m.group(1)), val(m.group(2)); ln = re.search(r"lines:(\d+)", s[m.start():m.start() + 900])
            if x: out.append({'file': os.path.basename(f), 'title': t or '', 'text': x.replace('[임시] ', ''), 'lines': int(ln.group(1)) if ln else None})
    return out
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio', '--autoplay-policy=no-user-gesture-required']); cx = b.new_context(viewport={'width': VW[0], 'height': VW[1]}, device_scale_factor=2, has_touch=not PC, is_mobile=not PC); pg = cx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    url = 'http://localhost:8000/?world=%s&zone=space-mars&notitle&quality=%s' % (W, 'high' if PC else 'mobile')
    pg.goto(url, wait_until='domcontentloaded'); pg.evaluate('localStorage.clear();localStorage.setItem("wl-help-seen","1")'); pg.reload(wait_until='domcontentloaded'); pg.wait_for_function(READY, timeout=120000); pg.wait_for_timeout(1500)
    pg.evaluate("(fl)=>{for(const k of fl)wlGame.state.setFlag(k,true);try{['pipi','dungdung'].forEach(i=>wlGame.profile.found&&wlGame.profile.found(i));}catch(e){}}", ['have:%s:necklace' % W, 'mars:met', 'mars:call', 'mars:recA', 'mars:recB', 'mars:told', 'meet:%s:pipi' % W, 'meet:%s:dungdung' % W, 'mars:bgm-intro']); pg.reload(wait_until='domcontentloaded'); pg.wait_for_function(READY, timeout=120000); pg.wait_for_timeout(2500)
    res = []
    for c in texts():
        pg.evaluate("c=>{window.__p=wlGame.ui.secret({kicker:'새 발견',title:c.title,text:c.text,count:'발견 1/3',sec:60,...(c.lines?{lines:c.lines}:{})});}", c); pg.wait_for_function("document.querySelector('#wlStrip.on')", timeout=20000); pg.wait_for_timeout(450)
        m = pg.evaluate("(()=>{const f=document.querySelector('#wlStrip .f'),r=document.getElementById('wlStrip').getBoundingClientRect();return {clip:f.scrollHeight-f.clientHeight,h:Math.round(r.height),top:Math.round(r.top),bottom:Math.round(r.bottom),left:Math.round(r.left),right:Math.round(r.right)}})()")
        res.append({'어디': c['file'], '제목': c['title'], '글자 수': len(c['text']), '잘린 화소': m['clip'], '카드 높이': m['h'], '화면 밖': m['top'] < 0 or m['bottom'] > VW[1] or m['left'] < 0 or m['right'] > VW[0]})
        if m['clip'] > 1 or len(c['text']) > 70: pg.screenshot(path='%s/%s-card-%d.png' % (OUT, TAG, len(res)))
        pg.keyboard.press('Escape'); pg.wait_for_function("!document.querySelector('#wlStrip.on')", timeout=20000); pg.wait_for_timeout(450)
    # 화성 노을 장면
    pg.mouse.click(VW[0] // 2, VW[1] // 3); pg.evaluate("(()=>{const W=wlGame.mission.hero();W.position.x=9.5;W.position.z=5.75;})()")
    dusk = {}
    try:
        t = 0
        while t < 150:
            on = pg.evaluate("(()=>{const s=document.querySelector('#wlStrip.on');return s?s.querySelector('.t').textContent:''})()")
            if '노을' in on: break
            if pg.evaluate("!!document.querySelector('#wlDlg.on,.wl-dlg.on')") or True: pg.keyboard.press('KeyE')
            pg.wait_for_timeout(700); t += .7
        t0 = pg.evaluate('wlGame.clock.t'); pg.wait_for_timeout(1200); pg.screenshot(path='%s/%s-dusk-card.png' % (OUT, TAG))
        m = pg.evaluate("(()=>{const f=document.querySelector('#wlStrip .f');return {clip:f.scrollHeight-f.clientHeight,text:f.textContent}})()")
        pg.wait_for_timeout(8000); pg.screenshot(path='%s/%s-dusk-card-9s.png' % (OUT, TAG)); still = pg.evaluate("!!document.querySelector('#wlStrip.on')")
        pg.wait_for_function("!document.querySelector('#wlStrip.on')", timeout=40000); t1 = pg.evaluate('wlGame.clock.t')
        vl = pg.evaluate("(wlGame.sound.voiceLog().log||wlGame.sound.voiceLog().plays||[]).filter(x=>x.id==='SPC-S2-035')")
        dusk = {'카드 글': m['text'], '잘린 화소': m['clip'], '카드가 떠 있던 초(게임)': round(t1 - t0, 1), '9초 뒤에도 떠 있음': still, '목소리': vl}
    except Exception as e: errs.append(str(e)[:200])
    print(json.dumps({'크기': '%dx%d' % VW, '카드': res, '화성 노을': dusk, '오류': errs[:4]}, ensure_ascii=False, indent=1)); b.close()
