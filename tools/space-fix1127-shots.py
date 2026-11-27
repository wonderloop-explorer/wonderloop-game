# -*- coding: utf-8 -*-
"""2026-11-27 고침 확인 촬영 — 촬영 서버(8000)가 떠 있을 때 저장소 루트에서:
   python3 tools/space-fix1127-shots.py <title|bubble|mars-stone|mars-flag|venus-umb|toring> [--pc]
   title 시작 화면 네 가지(스위치 켬 / ?devopen=0: 기록 없음·하다 만 기록·다 마침) · bubble 말풍선 '…'(가까이·멀리·말 건 뒤 다시) ·
   mars-stone 징검다리 표시 → 둥둥 표시·화산 회오리 보임 여부 · mars-flag 깃발 뒤 카드·사진 타임·하늘 회오리 · venus-umb 우산 출발·거꾸리 말풍선 · toring 토링 앞·옆.
   결과 docs/compare/fix1127/<pc|phone>-*.png + 값(JSON). 소리 끔, 끝나면 닫음."""
import sys, os, json, time
from playwright.sync_api import sync_playwright
A = sys.argv[1:]; WHAT = A[0]; PC = '--pc' in A; OUT = 'docs/compare/fix1127'; os.makedirs(OUT, exist_ok=True)
VW = (1280, 632) if PC else (390, 844); TAG = 'pc' if PC else 'phone'; W = 'infinite-space'; Q = 'high' if PC else 'mobile'
N = lambda *k: [x if x.split(':')[0] not in ('have', 'secret', 'meet', 'item') else x.replace(':', ':%s:' % W, 1) for x in k]
MOON = N('have:necklace', 'space:demo', 'moon:bgm-intro', 'meet:bobo'); MOOND = MOON + N('space:rock', 'secret:icecave', 'secret:telescope', 'clear:space-garden', 'visit:space-garden')
ALL = MOOND + ['clear:space-mars', 'clear:space-venus', 'clear:space-saturn', 'visit:space-jupiter']
MARS = N('have:necklace', 'mars:met', 'mars:call', 'mars:recA', 'meet:pipi', 'mars:bgm-intro')
MARSD = MARS + N('mars:recB', 'mars:told', 'clear:space-mars', 'item:bluesunset-glass', 'meet:dungdung', 'secret:marssound', 'secret:bluesunset')
VEN = N('have:necklace', 'venus:met', 'venus:ask', 'meet:geokkuri', 'meet:ddo')
R = {}
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal']); cx = b.new_context(viewport={'width': VW[0], 'height': VW[1]}, device_scale_factor=2, has_touch=not PC, is_mobile=not PC); pg = cx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:300])); pg.on('console', lambda m: errs.append(m.text[:300]) if m.type == 'error' and '404' not in m.text and 'Failed to load' not in m.text else None)
    shot = lambda n: pg.screenshot(path='%s/%s-%s.png' % (OUT, TAG, n))
    def store(flags, last=None, extra=None): pg.evaluate("([fl,last,ex])=>{localStorage.clear();const f={};fl.forEach(k=>f[k]=true);localStorage.setItem('wl-state',JSON.stringify(Object.assign({flags:f,order:fl,after:{},last},ex||{})));localStorage.setItem('wl-help-seen','1')}", [flags, last, extra])
    TITLE = "document.querySelectorAll('#wlTitle .tbtns button').length"; READY = 'window.wlZone&&wlZone.cur&&window.wlGame&&wlGame.mission.hero()'
    def title(q, flags=None, last=None):
        url = 'http://localhost:8000/?world=%s&quality=%s%s' % (W, Q, q); pg.goto(url, wait_until='domcontentloaded'); pg.wait_for_function(TITLE, timeout=120000); pg.wait_for_timeout(1500)
        if flags is None: pg.evaluate('localStorage.clear();localStorage.setItem("wl-help-seen","1")')
        else: store(flags, last)
        pg.reload(wait_until='domcontentloaded'); pg.wait_for_function(TITLE, timeout=120000); pg.wait_for_timeout(2600)
        return pg.evaluate("[...document.querySelectorAll('#wlTitle .tbtns button')].map(b=>b.textContent)")
    def zone(z, flags, extra=None, q=''):
        pg.goto('http://localhost:8000/?world=%s&zone=%s&notitle&quality=%s%s' % (W, z, Q, q), wait_until='domcontentloaded'); pg.wait_for_function(READY, timeout=120000); pg.wait_for_timeout(600); store(flags, z, extra)
        pg.reload(wait_until='domcontentloaded'); pg.wait_for_function(READY, timeout=120000); pg.wait_for_timeout(3000)
    H = 'wlGame.mission.hero()'; st = lambda: pg.evaluate('wlZone.cur.state?wlZone.cur.state():{}')
    tp = lambda x, z: pg.evaluate("([x,z])=>{const W=%s;if(W.userData.stopWalk)W.userData.stopWalk();W.position.x=x;W.position.z=z;}" % H, [x, z])
    bub = lambda: pg.evaluate("(()=>{let n=0;const sc=wlGame.view.camera.parent||null;wlZone.cur.root.parent.traverse(o=>{if(o.isSprite&&o.visible&&o.material&&o.material.map&&o.material.map.image&&o.material.map.image.width===128&&o.material.map.image.height===96)n++;});return n})()")
    if WHAT == 'title':
        R['스위치 켬 · 기록 없음'] = title(''); shot('title-dev-none')
        R['스위치 켬 · 기록 있음'] = title('', MOON, 'space-garden'); shot('title-dev-progress')
        R['스위치 끔 · 기록 없음'] = title('&devopen=0'); shot('title-off-none')
        R['스위치 끔 · 하다 만 기록'] = title('&devopen=0', MOOND, 'space-garden'); shot('title-off-partial')
        R['스위치 끔 · 다 마침'] = title('&devopen=0', ALL, 'space-garden'); shot('title-off-done')
        pg.evaluate("[...document.querySelectorAll('#wlTitle .tbtns button')].find(b=>b.textContent.includes('장소')).click()"); pg.wait_for_timeout(600); shot('title-off-done-map')
        title('&devopen=0', MOOND, 'space-garden'); pg.goto('http://localhost:8000/?world=%s&quality=%s&reset' % (W, Q)); pg.wait_for_function(TITLE, timeout=120000); pg.wait_for_timeout(1500)
        R['?reset 뒤'] = {'주소': pg.url.split('8000')[1], '단추': pg.evaluate("[...document.querySelectorAll('#wlTitle .tbtns button')].map(b=>b.textContent)"), '남은 wl- 기록': pg.evaluate("Object.keys(localStorage).filter(k=>k.startsWith('wl-'))")}
    elif WHAT == 'bubble':
        zone('space-garden', MOON); bo = pg.evaluate('wlZone.cur.spots.bobo'); tp(bo[0] + 9, bo[1] + 2); pg.wait_for_timeout(1200); R['멀리(9m) 말풍선 수'] = bub(); R['멀리 안내 글'] = pg.evaluate("(document.getElementById('wlPrompt')||{}).textContent||''"); shot('bubble-far')
        tp(bo[0] + 2.2, bo[1] + .6); pg.wait_for_timeout(1500); R['가까이 말풍선 수'] = bub(); R["가까이 'E 말 걸기' 글자"] = pg.evaluate("(()=>{const e=document.getElementById('wlPrompt');return e&&getComputedStyle(e).display!=='none'?e.textContent:''})()"); R['휴대폰 말 걸기 단추'] = pg.evaluate("(()=>{const e=document.getElementById('wlAct');return e&&getComputedStyle(e).display!=='none'?e.textContent:''})()"); shot('bubble-near')
        pg.keyboard.press('KeyE'); pg.wait_for_timeout(1500); R['말 걸기 → 대화창'] = pg.evaluate("getComputedStyle(document.getElementById('wlDlg')).display!=='none'"); shot('bubble-talk')
        for _ in range(4):
            pg.keyboard.press('KeyE'); pg.wait_for_timeout(900)
            if pg.evaluate("getComputedStyle(document.getElementById('wlDlg')).display==='none'"): break
        pg.wait_for_timeout(2500); R['말 건 뒤 다시 가까이 말풍선 수'] = bub(); shot('bubble-again')
    elif WHAT == 'mars-stone':
        zone('space-mars', MARS); S = pg.evaluate('wlZone.cur.spots'); tp(S['landE'][0], S['landE'][1]); pg.wait_for_timeout(2500); R['동쪽에 내린 뒤 목표'] = pg.evaluate('wlGame.goal.shown&&wlGame.goal.shown()'); R['화산 회오리 보임(완료 전)'] = st().get('swVis'); shot('stone-1-mark')
        s0 = S['stones'][0]; pg.evaluate("([x,z,y])=>{const W=%s;W.position.set(x,y,z);}" % H, [s0[0], s0[1], s0[2]]); pg.wait_for_timeout(1800); R['첫 바위에 올라선 뒤 목표'] = pg.evaluate('wlGame.goal.shown&&wlGame.goal.shown()'); shot('stone-2-dung')
        zone('space-mars', MARSD, {'after': {'space-mars': {'time': 1}}}); pg.wait_for_timeout(1500); R['화산 회오리 보임(완료 뒤)'] = st().get('swVis'); shot('whirl-after-clear')
    elif WHAT == 'mars-flag':
        zone('space-mars', MARSD, {'after': {'space-mars': {'time': 1}}})
        for _ in range(60):
            s0 = st()
            if s0.get('ride') or s0.get('summit'): break
            w = s0['secretWhirl']; pg.evaluate("([x,z])=>{const W=%s,P=W.position;if(Math.hypot(P.x-x,P.z-z)>6){P.x=x+3.5;P.z=z+1;}W.userData.walkTo(x,z)}" % H, w); pg.wait_for_timeout(400)
        for _ in range(240):
            s0 = st()
            if s0.get('summit') and not s0.get('ride'): break
            pg.wait_for_timeout(250)
        pg.wait_for_timeout(1500); R['꼭대기 도착 때 큰 회오리'] = st().get('big'); shot('flag-0-summit')
        fs = pg.evaluate('wlZone.cur.spots.flagSpot'); pg.evaluate("([x,z])=>%s.userData.walkTo(x+.6,z+.6)" % H, fs); pg.wait_for_timeout(3500)
        pg.keyboard.press('KeyE'); t0 = time.time(); log = []
        for i in range(34):
            pg.wait_for_timeout(700); el = round(time.time() - t0, 1)
            v = pg.evaluate("({card:document.getElementById('wlStrip').classList.contains('on'),toast:(()=>{const e=document.getElementById('wlToast');return e&&e.classList.contains('on')?e.textContent.slice(0,14):''})(),quest:(document.getElementById('wlQuest')||{}).textContent||'',big:(wlZone.cur.state().bigOn)})")
            log.append([el, v['card'], v['toast'], v['quest'][:14], v['big']])
            if i in (4, 9, 14) or (v['toast'] and 'photo' not in R) or (('큰 회오리' in v['quest'] and v['big']) and 'q' not in R):
                if v['toast'] and 'photo' not in R: R['photo'] = el; shot('flag-2-photo')
                elif ('큰 회오리' in v['quest'] and v['big']) and 'q' not in R: R['q'] = el; pg.wait_for_timeout(1500); shot('flag-3-whirl')
                else: shot('flag-1-card-%d' % i)
            if 'q' in R: break
        R['깃발 뒤 [초, 카드, 안내, 할 일, 큰 회오리]'] = log
    elif WHAT == 'venus-umb':
        zone('space-venus', VEN); S = pg.evaluate('wlZone.cur.spots'); pad = S.get('pad') or [44, -2]; g0 = st().get('gg')
        if g0: tp(g0[0] + 1.6, g0[1] + .8); pg.wait_for_timeout(2500); R['거꾸리 가까이 말풍선 수'] = bub(); shot('venus-gg-bubble')
        tp(pad[0] + 1.6, pad[1]); pg.wait_for_timeout(600); pg.evaluate("([x,z])=>%s.userData.walkTo(x,z)" % H, pad); t0 = time.time()
        for i in range(9): pg.wait_for_timeout(450); shot('venus-umb-%d' % i)
        R['놀이 동안 배경음'] = st().get('mus')
    elif WHAT == 'toring':
        zone('space-saturn', N('have:necklace', 'rest:met', 'rest:sat', 'rest:toss', 'secret:saturnfloat', 'clear:space-saturn', 'meet:toring')); pg.wait_for_timeout(1500); pg.evaluate("(()=>{const W=wlGame.mission.hero(),g=wlZone.cur.state().ggAt;W.position.x=g[0]+2.6;W.position.z=g[1]+2.2;})()"); pg.wait_for_timeout(1200)
        for nm, a in (('front', 0), ('side', 1.45), ('back34', 2.5)):
            pg.evaluate("(a)=>{const G=wlGame,g=wlZone.cur.state().ggAt,fn=()=>({at:[g[0],.75,g[1]],from:[g[0]+Math.sin(%s+a+.5)*5.4,1.3,g[1]+Math.cos(%s+a+.5)*3.1]});window.__c=fn;G.view.hold(fn,{snap:true});}".replace('%s', '(Math.atan2(wlGame.mission.hero().position.x-g[0],wlGame.mission.hero().position.z-g[1]))'), a); pg.wait_for_timeout(1200); shot('toring-' + nm)
    R['오류'] = errs[:6]; print(json.dumps(R, ensure_ascii=False, indent=1)); json.dump(R, open('%s/%s-%s.json' % (OUT, TAG, WHAT), 'w', encoding='utf-8'), ensure_ascii=False, indent=1); b.close()
