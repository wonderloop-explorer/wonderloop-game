# 다시 찾은 탐방 확인 촬영: python3 rev.py <moon|mars|venus|saturn> [--pc]
import sys, json, os
from playwright.sync_api import sync_playwright
A=sys.argv[1:]; WHO=A[0]; PC='--pc' in A; W='infinite-space'; OUT='docs/compare/revisit'; os.makedirs(OUT,exist_ok=True)
VW=(1280,632) if PC else (390,844); TAG=('pc' if PC else 'phone')+'-'+WHO
N=lambda *k:[x.replace(':',':%s:'%W,1) if x.startswith(('have','secret','meet','item')) else x for x in k]
ALL=N('have:necklace','space:demo','space:rock','secret:icecave','secret:telescope','moon:bgm-intro','item:dalddeok','clear:space-garden','visit:space-garden',
 'mars:met','mars:call','mars:recA','mars:recB','mars:told','clear:space-mars','item:bluesunset-glass','meet:pipi','meet:dungdung','meet:bobo','meet:bunnies','secret:marssound','secret:bluesunset','secret:volcano','mars:flag','mars:bgm-intro',
 'venus:met','venus:ask','venus:c1','venus:c2','venus:c3','venus:ddo','secret:venusday','venus:town','venus:sheep','venus:sunrise','venus:plaza','secret:venussun','venus:gate','clear:space-venus','meet:geokkuri','meet:ddo','meet:munge','secret:venusair',
 'rest:met','rest:toss','rest:sat','secret:saturnfloat','clear:space-saturn','meet:toring')
ZONE={'moon':'space-garden','mars':'space-mars','venus':'space-venus','saturn':'space-saturn'}[WHO]
R={}
with sync_playwright() as p:
    b=p.chromium.launch(args=['--mute-audio','--enable-gpu','--ignore-gpu-blocklist','--use-angle=metal'])
    cx=b.new_context(viewport={'width':VW[0],'height':VW[1]},device_scale_factor=2,has_touch=not PC,is_mobile=not PC); pg=cx.new_page(); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)[:300])); pg.on('console',lambda m:errs.append(m.text[:300]) if m.type=='error' and '404' not in m.text and 'Failed to load' not in m.text else None)
    READY='window.wlZone&&wlZone.cur&&window.wlGame&&wlGame.mission.hero()'
    pg.goto('http://localhost:8000/?world=%s&zone=space-garden&notitle&quality=%s'%(W,'high' if PC else 'mobile'),wait_until='domcontentloaded')
    pg.evaluate("([fl])=>{const f={};fl.forEach(k=>f[k]=true);localStorage.setItem('wl-state',JSON.stringify({flags:f,order:fl,after:{'space-mars':{time:1,flag:true},'space-venus':{time:1},'space-saturn':{time:0}},last:'space-garden'}));localStorage.setItem('wl-help-seen','1')}",[ALL])
    pg.reload(wait_until='domcontentloaded'); pg.wait_for_function(READY,timeout=120000); pg.wait_for_timeout(2500)
    shot=lambda n:pg.screenshot(path='%s/%s-%s.png'%(OUT,TAG,n))
    H="wlGame.mission.hero()"
    info=lambda:pg.evaluate("(()=>{const g=wlGame.goal.shown&&wlGame.goal.shown();return {quest:(document.getElementById('wlQuest')||{}).textContent||'',goal:g||null,todo:!!(document.getElementById('wlTodo')&&document.getElementById('wlTodo').offsetParent),voice:JSON.stringify(wlGame.sound.voiceLog?wlGame.sound.voiceLog():null).slice(0,300)}})()")
    tp=lambda x,z:pg.evaluate("([x,z])=>{const W=%s;W.position.x=x;W.position.z=z;}"%H,[x,z])
    if WHO!='moon':
        pg.evaluate("z=>window.wlHop(z)",ZONE); pg.wait_for_function("wlZone.cur&&wlZone.cur.root.name==='zone:%s'"%ZONE,timeout=60000); pg.wait_for_timeout(1200); shot('1-arriving')
        pg.wait_for_function("!%s.userData.riding"%H,timeout=60000); pg.wait_for_timeout(1500)
    shot('2-arrived'); R['도착 뒤']=info()
    if WHO=='moon':
        S=pg.evaluate('wlZone.cur.spots'); R['spots']=list(S.keys())
        # 떡방아
        m=S.get('mortar'); 
        if m:
            tp(m[0]+1.6,m[1]+1.2); pg.wait_for_timeout(900); shot('3-mortar-near')
            for i in range(5):
                pg.keyboard.press('e') if PC else pg.evaluate("document.getElementById('wlAct')&&document.getElementById('wlAct').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}))"); pg.wait_for_timeout(1500)
                if i==1: shot('3-mortar-pounding')
            R['찧는 중']=pg.evaluate("({act:%s.userData.action,count:!!(document.getElementById('wlCount')&&document.getElementById('wlCount').offsetParent)})"%H); shot('3-mortar-5times')
            pg.wait_for_timeout(3200); R['쉰 뒤 동작']=pg.evaluate("%s.userData.action"%H); shot('3-mortar-putdown')
        # 할아버지
        bp=pg.evaluate("(()=>{const n=wlZone.cur.root.getObjectByName('bobo')||null;return n?[n.position.x,n.position.z]:null})()")
        R['bobo']=bp
        e=S.get('exit'); tr=S.get('trail') or []; R['trailN']=len(tr); q=tr[-9] if len(tr)>12 else [e[0]-5,e[1]+2]; tp(q[0],q[1])
        pg.evaluate("([ex,ez])=>{const W=%s,C=wlGame.controls.input.cam;C.yaw=Math.atan2(W.position.x-ex,W.position.z-ez);C.pitch=.34;C.user++;}"%H,e); pg.wait_for_timeout(1800); shot('4-exit-beam'); R['출구 근처']=info()
    if WHO=='mars':
        st=pg.evaluate('wlZone.cur.state()'); R['state']={k:st.get(k) for k in ('bigOn','swVis','swFaded')}
        pg.wait_for_timeout(2500); shot('3-ground'); R['땅']=info()
        sw=pg.evaluate('wlZone.cur.state().secretWhirl'); R['sw']=sw
        if sw:
            tp(sw[0]+7,sw[1]+4); pg.evaluate("([ex,ez])=>{const W=%s,C=wlGame.controls.input.cam;C.yaw=Math.atan2(W.position.x-ex,W.position.z-ez);C.pitch=.3;C.user++;}"%H,sw); pg.wait_for_timeout(2500); shot('4-exit-whirl'); R['회오리 앞']=info()
    if WHO=='venus':
        st=pg.evaluate('wlZone.cur.state()'); R['gg']=st.get('gg'); R['boat']=st.get('boat')
        e=pg.evaluate('wlZone.cur.spots.end'); tp(e[0]+9,e[1]+.6); pg.evaluate("()=>{const C=wlGame.controls.input.cam;C.yaw=Math.PI/2+.35;C.pitch=.3;C.user++;}"); pg.wait_for_timeout(2500); shot('3-cloud-end'); R['구름 끝']=info()
        g=pg.evaluate('wlZone.cur.state().gg'); tp(g[0]+1.6,g[1]+1.0); pg.wait_for_timeout(1500); shot('4-gg-bubble')
        pg.keyboard.press('e') if PC else pg.evaluate("document.getElementById('wlAct')&&document.getElementById('wlAct').click()"); pg.wait_for_timeout(1200); shot('5-gg-talk'); R['거꾸리 대사']=pg.evaluate("(document.querySelector('#wlDialog .txt,#wlDlg .txt,#wlDialog')||{}).textContent||''")[:80]
    if WHO=='saturn':
        pg.wait_for_timeout(1800); shot('3-greet'); R['말풍선']=pg.evaluate("[...document.querySelectorAll('.wl-fbub,.wlf-bubble,[class*=bub]')].filter(e=>e.offsetParent).map(e=>e.textContent).slice(0,4)")
        pg.wait_for_timeout(5000); shot('4-after'); R['뒤']=info()
        R['자리']=pg.evaluate("(()=>{const s=wlZone.cur.spots,W=%s;return {hero:[+W.position.x.toFixed(1),+W.position.z.toFixed(1)],port:s.port}})()"%H)
    R['오류']=errs[:6]; print(json.dumps(R,ensure_ascii=False,indent=1)); cx.close(); b.close()
