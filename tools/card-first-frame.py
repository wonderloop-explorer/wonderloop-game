# -*- coding: utf-8 -*-
"""카드·띠·대화창·진행 표시가 처음 보이는 프레임부터 제자리인지 (2026-11-11) — 서버가 떠 있을 때 저장소 루트에서:
   python3 tools/card-first-frame.py --tag before|after [--port 8000] [--only pc,phone,632] [--world infinite-space]
   기록을 지운 첫 방문으로 타이틀 '새로 시작' → '모험 떠나기' → 이야기 소개 → 조작법 닫기 → 첫 미션 카드가 뜨는 순간까지 실제 흐름으로 가고,
   그 뒤 안내 문구·횟수 표시·발견 띠·획득 카드·대화창을 하나씩 띄운다(원더룹이 화면 가운데 위에 있어 비켜 갈 일도 생기는 평소 카메라).
   재는 법(시험이 끼워 넣음 — 게임 코드는 그대로): 화면 갱신(requestAnimationFrame)마다 그 요소들의 불투명도와 가운데 자리(scale은 가운데 기준이라 가운데는 안 변함)를 적는다.
   '나타남' 하나마다: 처음 보인 프레임(불투명도 0.02 넘음)의 자리와 0.7초 뒤 자리의 차이(화소), 그 사이 가장 크게 벗어난 값, 화면 밖으로 나간 폭.
   처음 0.7초 안에 3화소 넘게 움직였으면 '옮겨 감'. 영상도 함께 저장(docs/compare/card-first/<tag>-<크기>.webm), 결과 <tag>.json. 소리 끔, 끝나면 닫음."""
import json, os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
a = sys.argv[1:]; arg = lambda k, d: a[a.index(k) + 1] if k in a else d
TAG = arg('--tag', 'after'); PORT = arg('--port', '8000'); ONLY = arg('--only', 'pc,phone,632').split(','); WORLD = arg('--world', 'infinite-space')
OUT = os.path.join(ROOT, 'docs/compare/card-first'); os.makedirs(OUT, exist_ok=True)
VIEWS = {'pc': dict(viewport={'width': 1280, 'height': 720}), '632': dict(viewport={'width': 1280, 'height': 632}),
         'phone': dict(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)}
LOG = """(()=>{const IDS=['wlNotice','wlStrip','wlGet','wlToast','wlCount','wlDlg'];const L=window.__cf={rows:[],open:{}};
 const step=()=>{const t=performance.now();for(const id of IDS){const e=document.getElementById(id);if(!e)continue;const cs=getComputedStyle(e);const op=cs.display==='none'||cs.visibility==='hidden'?0:+cs.opacity;
   let o=L.open[id];if(op>.02){const r=e.getBoundingClientRect();const p=[t,+((r.left+r.right)/2).toFixed(1),+((r.top+r.bottom)/2).toFixed(1),e.offsetWidth,e.offsetHeight,+op.toFixed(2)];
     if(!o){o=L.open[id]={id,text:(e.textContent||'').trim().slice(0,24),f:[]};L.rows.push(o);}if(o.f.length<400)o.f.push(p);}
   else if(o)delete L.open[id];}
  requestAnimationFrame(step);};requestAnimationFrame(step);})()"""
REPORT = """()=>window.__cf.rows.map(o=>{const f=o.f,a=f[0],W=innerWidth;const win=f.filter(p=>p[0]-a[0]<=700),end=win[win.length-1];let mx=0;for(const p of win)mx=Math.max(mx,Math.hypot(p[1]-end[1],p[2]-end[2]));
 const fin=f[f.length-1];let late=0;for(const p of f)late=Math.max(late,Math.hypot(p[1]-fin[1],p[2]-fin[2]));
 const off=Math.max(0,-(a[1]-a[3]/2),(a[1]+a[3]/2)-W);
 return {id:o.id,text:o.text,frames:f.length,first:[a[1],a[2]],after07:[end[1],end[2]],moveIn07:+mx.toFixed(1),moveAll:+late.toFixed(1),offscreen:+off.toFixed(1),firstOpacity:a[5]};})"""
R = {}
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'])
    for vk in ONLY:
        o = VIEWS[vk]; touch = bool(o.get('has_touch')); c = b.new_context(**o, record_video_dir=OUT, record_video_size=o['viewport']); c.add_init_script(LOG); pg = c.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
        url = 'http://localhost:' + PORT + '/?world=' + WORLD + ('&quality=mobile' if touch else '')
        pg.goto(url); pg.evaluate('localStorage.clear()'); pg.reload()
        pg.wait_for_selector('#wlTitle .go', timeout=120000); pg.wait_for_timeout(1500)
        pg.click('#wlTitle .go'); pg.wait_for_selector('#wlWard.on'); pg.wait_for_timeout(1200)
        pg.click('#wlWard .done'); pg.wait_for_selector('#wlStory.on')
        for _ in range(12):
            if not pg.evaluate("!!document.querySelector('#wlStory.on')"): break
            pg.click('#wlStory .next'); pg.wait_for_timeout(500)
        pg.wait_for_timeout(1500)
        if pg.evaluate("!!document.querySelector('#wlHelp.on, #wlHelp[style*=block]')") or pg.locator('#wlHelp .close').is_visible():
            pg.click('#wlHelp .close')
        pg.wait_for_function("document.getElementById('wlNotice')&&document.getElementById('wlNotice').classList.contains('on')", timeout=30000)
        pg.wait_for_timeout(1500); pg.screenshot(path=os.path.join(OUT, '%s-%s-mission.png' % (TAG, vk))); pg.wait_for_timeout(6500)
        # 다른 카드들: 하나씩
        pg.evaluate("wlGame.ui.toast('발자국을 따라가 봐요 — 안내 문구 시험',2.4);0"); pg.wait_for_timeout(3200)
        pg.evaluate("wlGame.ui.count({label:'떡 찧기',n:1,max:3});0"); pg.wait_for_timeout(1500); pg.evaluate("wlGame.ui.toast('횟수 아래 안내 문구',2);0"); pg.wait_for_timeout(2600); pg.evaluate("wlGame.ui.count(null);0"); pg.wait_for_timeout(600)
        pg.evaluate("wlGame.ui.secret({title:'시험 발견',text:'띠 카드가 처음부터 제자리인지 봅니다.',count:'1/2',sec:2.5});0"); pg.wait_for_timeout(3600)
        pg.evaluate("wlGame.ui.itemCard({title:'시험 물건',text:'획득 카드 시험',sec:2.2});0"); pg.wait_for_timeout(3400)
        pg.evaluate("wlGame.dialog.say('원더룹','혼잣말 대화창이 처음부터 제자리인지 보는 줄이에요.');0"); pg.wait_for_timeout(1500); pg.screenshot(path=os.path.join(OUT, '%s-%s-say.png' % (TAG, vk))); pg.wait_for_timeout(2500)
        rows = pg.evaluate(REPORT); bad = [r for r in rows if r['moveIn07'] > 3 or r['offscreen'] > 1]
        R[vk] = {'나타남': len(rows), '옮겨 감·잘림': len(bad), '목록': rows, '오류': errs[:5]}
        v = pg.video; c.close()
        try: os.replace(v.path(), os.path.join(OUT, '%s-%s.webm' % (TAG, vk)))
        except Exception: pass
    b.close()
json.dump(R, open(os.path.join(OUT, TAG + '.json'), 'w'), ensure_ascii=False, indent=1)
for vk, r in R.items():
    print(vk, '나타남', r['나타남'], '옮겨 감·잘림', r['옮겨 감·잘림'], r['오류'])
    for x in r['목록']: print('  ', x['id'], x['text'][:14], '처음', x['first'], '0.7초 뒤', x['after07'], '움직임', x['moveIn07'], '전체', x['moveAll'], '밖', x['offscreen'])
