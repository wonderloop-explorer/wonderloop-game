# -*- coding: utf-8 -*-
"""팝업·패널 손가락 스크롤 시험 (2026-11-04 — 아이폰 사파리에서 조작법·탐험가 소개 창이 손가락으로 안 밀리던 것)
   촬영 서버(8000)가 떠 있을 때 저장소 루트에서: python3 tools/popup-touch-test.py [주소] [--out docs/touch]
   휴대폰 크기(390×844, 3배, 터치) + 진짜 터치 끌기(CDP Input.dispatchTouchEvent — 마우스 휠로는 이 문제가 안 잡힌다)로 차례로:
     ① 타이틀 조작법 창: 끝까지 밀어 내림 → 바깥 어두운 곳 누르면 닫힘 → 다시 열어 '알겠어요'
     ② 게임 중 조작법 창(처음 시작할 때 저절로 열림): 끝까지 밀어 내림, 열린 동안 조이스틱·점프·대쉬·메뉴가 숨고 조이스틱 자리를 끌어도 반응 없음 → '알겠어요'
     ③ 탐험가 소개 창(새로 시작): 끝까지 밀어 내려 옷 조합·장식·모험 지도가 보이는지 → '모험 떠나기'
     ④ 게임 중 옷 갈아입기: 끝까지 밀어 내림 → '다 골랐어요'
   그리고 터치 기기에서 조작법 표가 '터치' 먼저인지, 이름 입력칸 글자가 16px 이상인지. 끝까지 내린 화면을 <out>/①…④.png로 남기고
   --break: 고친 부분(스크롤 영역 touch-action:pan-y)만 꺼서 시험이 이 문제를 잡는지 본다(실패해야 맞다).
   결과를 JSON으로 출력한다(run-checks.py --only touch가 부른다). 시험 브라우저는 소리를 끄고 끝나면 닫는다. 하나라도 실패하면 종료 코드 1."""
import json, os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
args = sys.argv[1:]
URL = next((a for a in args if a.startswith('http')), 'http://localhost:8000/')
OUT = os.path.join(ROOT, args[args.index('--out') + 1] if '--out' in args else 'docs/touch')
os.makedirs(OUT, exist_ok=True)
R = {}

def run():
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--mute-audio'])
        ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=3, is_mobile=True, has_touch=True,
                            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1')
        if '--break' in args:  # 시험이 문제를 잡는지 확인용: 팝업 스크롤 풀기만 끈다(예전 모습) → 실패해야 맞다
            ctx.add_init_script("addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent='.wl-pop-body,.wl-pop-body *{touch-action:none!important}';document.head.appendChild(s);})")
        pg = ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
        cdp = ctx.new_cdp_session(pg)

        def touch(kind, x, y):
            pts = [] if kind == 'touchEnd' else [{'x': x, 'y': y, 'id': 1}]
            cdp.send('Input.dispatchTouchEvent', {'type': kind, 'touchPoints': pts})

        def swipe(x, y0, y1, steps=12):
            touch('touchStart', x, y0)
            for i in range(1, steps + 1):
                touch('touchMove', x, y0 + (y1 - y0) * i / steps); pg.wait_for_timeout(16)
            touch('touchEnd', x, y1); pg.wait_for_timeout(250)

        def tap(sel):
            r = pg.eval_on_selector(sel, "e=>{const b=e.getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2]}")
            touch('touchStart', *r); pg.wait_for_timeout(40); touch('touchEnd', *r); pg.wait_for_timeout(350)

        def scroll_to_end(sel, tries=30, watch=None):
            """그 칸 위에서 손가락으로 위로 밀기를 되풀이 — 끝까지 내려가면 True"""
            st = None
            for _ in range(tries):
                st = pg.eval_on_selector(sel, "e=>{const b=e.getBoundingClientRect();return {t:e.scrollTop,max:e.scrollHeight-e.clientHeight,x:b.left+b.width/2,top:b.top,bot:b.bottom}}")
                if watch: watch()
                if st['max'] <= 1 or st['t'] >= st['max'] - 2: return True, st
                y0 = min(st['bot'] - 20, st['top'] + (st['bot'] - st['top']) * .8); y1 = st['top'] + 20
                swipe(st['x'], y0, y1)
            st = pg.eval_on_selector(sel, "e=>({t:e.scrollTop,max:e.scrollHeight-e.clientHeight})")
            return st['t'] >= st['max'] - 2, st

        def visible_in(sel_box, sel_item):
            """sel_item이 sel_box 안 보이는 칸(스크롤 영역) 안에 들어와 있는지 — 글자로 찾는다"""
            return pg.evaluate("""([box,txt])=>{const B=document.querySelector(box).getBoundingClientRect();
              const e=[...document.querySelectorAll(box+' .lab')].find(x=>x.textContent===txt);if(!e)return false;const r=e.getBoundingClientRect();return r.top>=B.top-1&&r.bottom<=B.bottom+1}""", [sel_box, sel_item])

        def on_screen(sel):
            return pg.eval_on_selector(sel, "e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth&&getComputedStyle(e).visibility!=='hidden'}")

        pg.goto(URL); pg.evaluate("localStorage.clear()"); pg.reload()
        pg.wait_for_selector('#wlTitle .go', timeout=120000); pg.wait_for_timeout(1500)
        # ① 타이틀 조작법
        tap('#wlTitle .ghost:not(.small)'); pg.wait_for_selector('#wlHelp:not([hidden])', timeout=5000)
        order = pg.eval_on_selector_all('#wlHelp .cols h3', "h=>h.map(x=>x.textContent)")
        ok, st = scroll_to_end('#wlHelp .hsc'); pg.screenshot(path=os.path.join(OUT, '①-title-help.png'))
        close_vis = on_screen('#wlHelp .close')
        # 바깥 어두운 곳(창 위 여백) 누르기 → 닫힘
        card = pg.eval_on_selector('#wlHelp .hcard', "e=>{const b=e.getBoundingClientRect();return [b.left,b.top,b.bottom]}")
        bx, by = 195, max(4, card[1] / 2) if card[1] > 8 else card[2] + (844 - card[2]) / 2
        touch('touchStart', bx, by); pg.wait_for_timeout(40); touch('touchEnd', bx, by); pg.wait_for_timeout(350)
        back_closed = pg.evaluate("document.getElementById('wlHelp').hidden")
        tap('#wlTitle .ghost:not(.small)'); pg.wait_for_selector('#wlHelp:not([hidden])', timeout=5000); tap('#wlHelp .close')
        R['① 타이틀 조작법'] = dict(ok=ok and close_vis and back_closed and order[:1] == ['터치'] and pg.evaluate("document.getElementById('wlHelp').hidden"),
                                  끝까지=ok, 스크롤=st, 닫기단추보임=close_vis, 바깥눌러닫힘=back_closed, 표순서=order)
        # ③ 탐험가 소개 (새로 시작)
        tap('#wlTitle .go'); pg.wait_for_selector('#wlWard.on', timeout=5000); pg.wait_for_timeout(800)
        fs = pg.eval_on_selector('#wlWard input', "e=>parseFloat(getComputedStyle(e).fontSize)")
        seen = {t: False for t in ('개미탈', '옷 조합', '장식', '모험 지도')}
        def watch():  # 밀어 내리는 동안 한 번이라도 보이는 칸 안에 들어왔는지
            for t in seen: seen[t] = seen[t] or visible_in('#wlWard .body', t)
        ok3, st3 = scroll_to_end('#wlWard .body', watch=watch); watch(); pg.screenshot(path=os.path.join(OUT, '③-explorer-start.png'))
        labs = pg.evaluate("""()=>{const B=document.querySelector('#wlWard .body');return [...B.querySelectorAll('.lab')].map(e=>e.textContent)}""")
        done_vis = on_screen('#wlWard .done'); joy_hidden = pg.evaluate("getComputedStyle(document.getElementById('wlJoy')).visibility==='hidden'||getComputedStyle(document.getElementById('wlJoy')).display==='none'")
        tap('#wlWard .done')
        R['③ 탐험가 소개'] = dict(ok=ok3 and done_vis and all(seen.values()) and all(t in labs for t in ('개미탈', '옷 조합', '장식', '모험 지도')) and fs >= 16,
                                끝까지=ok3, 스크롤=st3, 밀며보임=seen, 항목=labs, 단추보임=done_vis, 이름칸글자=fs)
        # (4단계부터 '모험 떠나기' 뒤 이야기 소개 세 단계 — 건너뛰기)
        pg.wait_for_selector('#wlStory.on', timeout=5000); pg.wait_for_timeout(300); tap('#wlStory .skip')
        # ② 게임 중 조작법 (처음 시작하면 저절로)
        pg.wait_for_selector('#wlHelp:not([hidden])', timeout=8000); pg.wait_for_timeout(400)
        hidden = pg.evaluate("""['wlJoy','wlJump','wlDash','wlHud'].map(id=>{const e=document.getElementById(id);return !e||getComputedStyle(e).visibility==='hidden'||getComputedStyle(e).display==='none'})""")
        swipe(80, 760, 700)  # 조이스틱 자리(왼쪽 아래)를 끌어 봄
        jx = pg.evaluate("[wlGame.controls.input.jx,wlGame.controls.input.jy]")
        ok2, st2 = scroll_to_end('#wlHelp .hsc'); pg.screenshot(path=os.path.join(OUT, '②-game-help.png'))
        close2 = on_screen('#wlHelp .close'); tap('#wlHelp .close')
        R['② 게임 중 조작법'] = dict(ok=ok2 and close2 and all(hidden) and jx == [0, 0] and pg.evaluate("document.getElementById('wlHelp').hidden"),
                                  끝까지=ok2, 스크롤=st2, 닫기단추보임=close2, 게임단추숨김=hidden, 조이스틱입력=jx)
        # ④ 게임 중 옷 갈아입기
        pg.wait_for_timeout(600); tap('#wlMenu > button'); pg.wait_for_timeout(250)
        pg.evaluate("[...document.querySelectorAll('#wlMenu .wl-chip')].find(b=>b.textContent==='옷 갈아입기').setAttribute('data-t','ward')")
        tap('#wlMenu [data-t=ward]'); pg.wait_for_selector('#wlWard.on', timeout=5000); pg.wait_for_timeout(800)
        ok4, st4 = scroll_to_end('#wlWard .body'); pg.screenshot(path=os.path.join(OUT, '④-wardrobe-game.png'))
        done4 = on_screen('#wlWard .done'); txt4 = pg.eval_on_selector('#wlWard .done', "e=>e.textContent"); tap('#wlWard .done')
        R['④ 게임 중 옷 갈아입기'] = dict(ok=ok4 and done4 and txt4 == '다 골랐어요' and not pg.evaluate("document.getElementById('wlWard').classList.contains('on')"),
                                     끝까지=ok4, 스크롤=st4, 단추보임=done4, 단추=txt4)
        R['오류'] = errs
        b.close()

run()
print(json.dumps(R, ensure_ascii=False, indent=1))
bad = [k for k, v in R.items() if isinstance(v, dict) and not v.get('ok')]
print('실패:', bad if bad else '없음')
sys.exit(1 if bad or R.get('오류') else 0)
