# -*- coding: utf-8 -*-
"""토성 쉬기 장면 달 구간에서 하늘 그림판(해·별)이 카메라에서 어긋난 거리와 해의 화면 자리 흔들림 재기 (2026-11-26) — 촬영 서버(8000)가 떠 있을 때 저장소 루트에서:
   python3 tools/space-sun-jitter.py [--phone] [--t 75,90,104]
   그린 직후(scene.onAfterRender) 프레임마다: 그림판 뿌리 − 카메라 거리(m), 해의 화면 자리(화소). 화면 자리는 2차 차분(가속)으로 떨림을 봄. 소리 끔, 끝나면 닫음."""
import sys, json
from playwright.sync_api import sync_playwright
A = sys.argv[1:]; PHONE = '--phone' in A; times = [float(x) for x in (A[A.index('--t') + 1] if '--t' in A else '75,90,104').split(',')]
VW = (390, 844) if PHONE else (1280, 632)
READY = 'window.wlZone&&wlZone.cur&&window.wlGame&&wlGame.mission.hero()'
JS = """(sec)=>new Promise(res=>{let sc=wlZone.cur.root;while(sc.parent)sc=sc.parent;const prev=sc.onAfterRender,out=[],t0=performance.now();let bd=null,sun=null;sc.traverse(o=>{if(o.name==='space-sky-board')bd=o;});
  if(bd)bd.traverse(o=>{if(!sun&&o.isMesh&&o.renderOrder===-4)sun=o;});
  sc.onAfterRender=function(r,s,cam){if(r.getRenderTarget&&r.getRenderTarget())return;const e=bd.matrixWorld.elements,d=Math.hypot(e[12]-cam.position.x,e[13]-cam.position.y,e[14]-cam.position.z);
    const m=sun.matrixWorld.elements,v=cam.position.clone().set(m[12],m[13],m[14]).project(cam);out.push([d,(v.x*.5+.5)*innerWidth,(.5-v.y*.5)*innerHeight]);
    if(performance.now()-t0>sec*1000){sc.onAfterRender=prev;res(out);}};})"""
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio']); cx = b.new_context(viewport={'width': VW[0], 'height': VW[1]}, device_scale_factor=2, has_touch=PHONE, is_mobile=PHONE); pg = cx.new_page()
    pg.goto('http://localhost:8000/?world=infinite-space&zone=space-saturn&notitle&quality=%s' % ('mobile' if PHONE else 'high'), wait_until='domcontentloaded'); pg.evaluate('localStorage.clear();localStorage.setItem("wl-help-seen","1")'); pg.reload(wait_until='domcontentloaded'); pg.wait_for_function(READY, timeout=120000); pg.wait_for_timeout(600)
    pg.evaluate("(fl)=>{for(const k of fl)wlGame.state.setFlag(k,true);}", ['have:infinite-space:necklace', 'meet:infinite-space:geokkuri', 'rest:met', 'rest:toss']); pg.reload(wait_until='domcontentloaded'); pg.wait_for_function(READY, timeout=120000)
    pg.wait_for_function('wlZone.cur.state().rest.on', timeout=120000); pg.wait_for_timeout(1500); res = {}
    for t in times:
        pg.evaluate('t=>wlZone.cur.dbgRest(t)', t); pg.wait_for_timeout(1500); o = pg.evaluate(JS, 2.5)
        d = [x[0] for x in o]; acc = [((o[i + 1][1] - 2 * o[i][1] + o[i - 1][1]) ** 2 + (o[i + 1][2] - 2 * o[i][2] + o[i - 1][2]) ** 2) ** .5 for i in range(1, len(o) - 1)]
        res[str(t)] = {'프레임': len(o), '그림판-카메라 어긋남 m(평균·최대)': [round(sum(d) / len(d), 3), round(max(d), 3)], '해 화면 자리 떨림 화소(2차 차분 평균·최대)': [round(sum(acc) / max(1, len(acc)), 2), round(max(acc or [0]), 2)]}
    print(json.dumps(res, ensure_ascii=False, indent=1)); b.close()
