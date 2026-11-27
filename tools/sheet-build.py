# -*- coding: utf-8 -*-
"""캐릭터 시트 조립 (2026-11-27) — tools/sheet-shots.py로 컷을 찍은 뒤, 촬영 서버(8000)가 떠 있을 때 저장소 루트에서:
   python3 tools/sheet-build.py [wl|friends]
   assets/sheets/cuts/의 투명 컷과 cuts.json(배율·발밑 선)을 읽어 v2 시트 형식(종이색 바탕·큰 제목·줄마다 소제목과 밑줄·컷 아래 이름표·오른쪽 색표와 규칙)의
   HTML을 만들고 가로 3200px로 찍는다 → assets/sheets/wonderloop-space-sheet.png · space-friends-sheet.png. 글꼴 Noto Sans KR(v2와 같음, 구글 글꼴).
   글(이름·소개·좋아하는 것·한마디)은 세계 설정 js/worlds/infinite-space.js의 cards, 목소리는 docs/voice/README.md 그대로 — 바뀌면 여기 FRIENDS도 같이."""
import sys, os, json, html
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); CUTS = os.path.join(ROOT, 'assets/sheets/cuts')
MAN = json.load(open(os.path.join(CUTS, 'cuts.json'), encoding='utf-8')); INFO = json.load(open(os.path.join(CUTS, 'info.json'), encoding='utf-8'))
WHICH = sys.argv[1] if len(sys.argv) > 1 else 'both'; E = html.escape; WLH = 1.38
CSS = """
*{box-sizing:border-box;margin:0;padding:0}
body{background:#f6eee2;color:#4a3328;font-family:'Noto Sans KR',sans-serif;width:1600px;padding:36px 40px 56px;word-break:keep-all}
h1{font-size:42px;font-weight:900;letter-spacing:-.5px;line-height:1.15}
.sub{font-size:16.5px;color:#7a6455;margin:2px 0 22px}
.wrap{display:grid;grid-template-columns:1200px 1fr;gap:56px}
h2{font-size:20px;font-weight:700;border-bottom:2px solid #d9c9ae;padding-bottom:3px;margin:22px 0 12px}
h2 small{font-size:13px;font-weight:400;color:#8a7566;margin-left:10px}
.row{display:flex;align-items:flex-end;justify-content:space-around;flex-wrap:wrap;row-gap:18px}
.cut{display:flex;flex-direction:column;align-items:center;text-align:center}
.cut .im{display:flex;align-items:flex-end;justify-content:center}
.cut b{font-size:15px;font-weight:700;margin-top:6px;display:block}
.cut i{font-style:normal;font-size:11.5px;color:#8a7566;display:block;line-height:1.35}
.note{font-size:14px;line-height:1.7;color:#5c4636}.note li{list-style:none;padding-left:16px;position:relative}.note li:before{content:'';position:absolute;left:0;top:.62em;width:7px;height:7px;border-radius:50%;background:#ec8b7d}
.sw{display:flex;align-items:center;gap:11px;margin-bottom:9px}.sw s{width:34px;height:34px;border-radius:7px;border:1px solid rgba(74,51,40,.18);flex:none;text-decoration:none}
.sw b{font-size:14.5px;display:block;line-height:1.2}.sw i{font-style:normal;font-size:11px;color:#8a7566}
.sw .two{display:flex;flex:none}.sw .two s{width:22px;border-radius:7px 0 0 7px}.sw .two s+s{border-radius:0;margin-left:-1px}.sw .two s:last-child{border-radius:0 7px 7px 0}
.dark{background:#3b3558;border-radius:14px;padding:10px 14px}
.icon{width:74px;height:74px;border-radius:50%;background:#f3ead6;border:1.5px solid #c9b596;display:flex;align-items:center;justify-content:center}.icon img{width:56px;height:56px}
.box{background:#fbf5ea;border:1.5px dashed #d9c9ae;border-radius:14px;padding:14px 18px}
/* 친구들 */
.fr{display:grid;grid-template-columns:1fr 250px 400px;gap:26px;align-items:start;padding-bottom:6px}
.fr>div{min-width:0}
.fr .views{display:flex;align-items:flex-end;justify-content:space-around}
.vars{display:flex;align-items:flex-end;gap:26px;margin-top:14px;padding:10px 16px;background:#fbf5ea;border-radius:14px;flex-wrap:wrap}
.vars .t{font-size:12px;font-weight:700;color:#8a7566;align-self:center;writing-mode:vertical-rl;letter-spacing:2px}
.cmp{position:relative;border-bottom:2px solid #b9a488;margin-top:8px}
.cmp .sil{position:absolute;bottom:0;-webkit-mask-size:100% 100%;-webkit-mask-repeat:no-repeat}
.cmp .tick{position:absolute;left:0;right:0;border-top:1px dashed #d9c9ae;font-size:10px;color:#a08b78}.cmp .tick span{position:absolute;right:0;top:-13px}
.cmpc{font-size:11.5px;color:#8a7566;text-align:center;margin-top:5px;line-height:1.4}
.info{font-size:13.5px;line-height:1.55}.info dl{display:grid;grid-template-columns:76px 1fr;gap:3px 10px}.info dt{font-weight:700;color:#8a6a55}.info dd{color:#4a3328}
.chips{display:flex;gap:6px;flex-wrap:wrap}.chips span{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;color:#6a5446}.chips s{width:16px;height:16px;border-radius:4px;border:1px solid rgba(74,51,40,.2);text-decoration:none}
.quote{background:#fff9ee;border-radius:10px;padding:5px 10px;display:inline-block}
.line{position:relative;margin-top:26px}
.line .g{position:absolute;left:0;right:0;border-top:1px dashed #d4c3a8;font-size:11px;color:#a08b78}.line .g span{position:absolute;left:0;top:-15px}
.line .ppl{display:flex;align-items:flex-end;justify-content:space-between;border-bottom:3px solid #b9a488;padding-left:44px;position:relative}
.line .nm{display:flex;justify-content:space-between;padding-left:44px;margin-top:8px}.line .nm div{text-align:center;font-size:12.5px;font-weight:700;line-height:1.3}.line .nm i{font-style:normal;font-weight:400;font-size:11px;color:#8a7566;display:block}
"""
def img(name, h=None, w=None):
    m = MAN[name]; k = (h / m['h']) if h else (w / m['w']); return '<img src="/assets/sheets/cuts/%s.png" width="%d" height="%d" alt="">' % (name, round(m['w'] * k), round(m['h'] * k))
def cut(name, label, small='', h=300, w=None, cls=''): return '<div class="cut %s"><div class="im">%s</div><b>%s</b>%s</div>' % (cls, img(name, h, w), E(label), ('<i>%s</i>' % small) if small else '')
def scaled(name, pxm):  # 같은 배율(화소/m)로 — 키를 견줄 때
    m = MAN[name]; k = pxm / m['ppm']; return m, round(m['w'] * k), round(m['h'] * k), round((m['h'] - m['ground']) * k)
def sw(c, name, small): return '<div class="sw"><s style="background:%s"></s><div><b>%s</b><i>%s</i></div></div>' % (c, E(name), E(small))
def sw2(cs, name, small): return '<div class="sw"><div class="two">%s</div><div><b>%s</b><i>%s</i></div></div>' % (''.join('<s style="background:%s"></s>' % c for c in cs), E(name), E(small))
def page(title, body): return '<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>%s</title><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=block" rel="stylesheet"><style>%s</style></head><body>%s</body></html>' % (title, CSS, body)

def sheet_wl():
    V = [('front', '정면'), ('34', '3/4'), ('side', '측면'), ('back', '뒷면')]; P = 'wonderloop-space-'; L = []
    L.append('<h2>기본 차림 <small>연두 외계인 탈 + 숨방울 목걸이·숨방울 막 + 기본 옷 조합(파랑 옷·노랑 목도리)</small></h2><div class="row">%s</div>' % ''.join(cut(P + k, n, h=360) for k, n in V))
    L.append('<h2>옷 조합 4가지 <small>윗옷·바지 색 + 목도리 색 — 탐험 준비 화면 ‘옷 조합’</small></h2><div class="row">%s</div>' % ''.join(
        '<div class="cut"><div class="im" style="gap:4px">%s%s</div><b>%s</b><i>정면 · 3/4</i></div>' % (img(P + 'combo%d-front' % (i + 1), 172), img(P + 'combo%d-34' % (i + 1), 172), E(c['name'])) for i, c in enumerate(INFO['combos'])))
    L.append('<h2>외계인 탈 색 4가지 <small>3/4 전신 + 탈 확대 — 아몬드 눈·별빛, 탈 아래 지그재그 앞머리</small></h2><div class="row">%s</div>' % ''.join(
        '<div class="cut"><div class="im" style="gap:2px">%s%s</div><b>%s</b><i>%s</i></div>' % (img(P + 'tal%d-34' % (i + 1), 150), img(P + 'tal%d-close' % (i + 1), 150), E(t[0].replace(' 외계인', '')), t[1]) for i, t in enumerate(INFO['tal'])))
    L.append('<h2>탐험 준비 화면의 나머지 탈·장식</h2><div class="box note"><ul><li>이 세계의 탐험 준비 화면에서 고를 수 있는 것은 <b>외계인 탈 색 4가지 · 옷 조합 4가지 · 장식 ‘없음’ 한 칸</b>이 전부예요. 다른 탈과 다는 장식은 아직 없어서 넣지 않았어요.</li>'
             '<li>달떡·파란 노을 유리 조각은 가방에만 들어가는 물건이라 장식 목록에 나오지 않아요(아래 줄).</li></ul></div>')
    icons = [('숨방울 목걸이', INFO['neckIcon'], '회색 정원에 도착하자마자 · 목에 참')] + [(x['name'], x['icon'], '가방에만 · 몸에는 안 보임') for x in INFO['items']]
    L.append('<h2>몸에 다는 것 · 가방 <small>우주에서 얻는 물건</small></h2><div class="row">%s%s%s%s</div>' % (
        cut(P + 'necklace-close', '숨방울 목걸이', '은빛 끈 고리 + 투명한 숨방울(안에 빛 알갱이)', h=215),
        '<div class="cut"><div class="im dark" style="gap:10px">%s%s</div><b>숨방울 막</b><i>왼쪽 막 있음 · 오른쪽 막 없음(어두운 바탕에서만 테두리 빛이 보임)</i></div>' % (img(P + 'tal1-close', 190), img(P + 'hood-nobubble-close', 190)),
        cut(P + 'pack-close', '배낭 · 더듬이 나침반 키링', '개미굴에서 받은 것 — 우주 물건은 배낭에 달리지 않음', h=215),
        '<div class="cut"><div class="im" style="gap:14px">%s</div><b>가방 속 그림</b><i>목걸이 · 달떡(회색 정원 떡방아) · 파란 노을 유리 조각(붉은 모래 언덕)</i></div>' % ''.join('<div class="icon"><img src="%s" alt=""></div>' % u for _, u, _ in icons)))
    EX = {'기본': '의지 있는 눈썹', '기쁨': '눈웃음 · 벌린 입', '놀람': '커진 눈 · 오 입', '궁금': '한쪽 눈썹 · 갸웃', '걱정': '처진 눈썹 · 식은땀', '신남': '반짝이는 눈 · 웃는 입', '반짝 신남': '반짝이는 눈 · 벌린 입(이동 연출)'}
    L.append('<h2>표정 <small>지금 쓰는 일곱 가지 — 외계인 탈을 쓴 얼굴</small></h2><div class="row">%s</div>' % ''.join(cut(P + 'expr-' + e.replace(' ', ''), e, EX.get(e, ''), h=150) for e in INFO['exprs']))
    ACT = [('jump', '점프 한 번 — 달에서는 중력 0.38배라 높이 떠서 천천히'), ('tail', '달 → 화성. 두 손을 가슴 앞으로 모아 꼬리를 잡음'), ('arms', '행성 사이 이동·도착 때'), ('float', '우주에서 팔다리를 번갈아 저음'),
           ('pound-up', '달 떡방아 — 짧게 들기'), ('pound-down', '달 떡방아 — 숙이며 내려침'), ('toss', '토성 — 손을 앞으로 내밀어 던짐'), ('umbrella', '금성 바람 타기 — 오른손을 옆 위로 뻗어 우산대를 쥠'),
           ('hop', '기뻐서 두 번 폴짝'), ('wave', '배웅·인사'), ('sit', '토성 얼음 배 위에서 쉬기')]
    cs = []
    for k, d in ACT:
        nm, ex, _ = MAN[P + 'act-' + k]['note'].split('|'); m, w, h, _g = scaled(P + 'act-' + k, 150)
        cs.append('<div class="cut" style="width:%dpx"><div class="im"><img src="/assets/sheets/cuts/%sact-%s.png" width="%d" height="%d" alt=""></div><b>%s</b><i>%s<br>%s</i></div>' % (max(w + 10, 190), P, k, w, h, E(nm), E(ex), E(d)))
    L.append('<h2>우주 동작 <small>같은 배율 · 소품은 우산만 함께(별똥별 꼬리·떡메·고리는 구역 소품이라 빠짐)</small></h2><div class="row" style="justify-content:flex-start;column-gap:14px">%s</div>' % ''.join(cs))
    R = ['<h2 style="margin-top:0">키</h2><div class="note"><ul><li>몸 키 <b>1.38m = 1</b>(주민 크기의 기준)</li><li>외계인 탈 꼭대기까지 약 1.52m</li><li>숨방울 막 바깥 테두리까지 약 1.76m(거의 안 보임)</li></ul></div>', '<h2>색상 · 재질</h2>']
    for t in INFO['tal']: R.append(sw2([t[1], t[2]], t[0].replace(' 외계인', '') + ' 탈', '%s · 안쪽 테 %s' % (t[1], t[2])))
    R.append(sw('#1b1626', '탈의 아몬드 눈', '검정 + 흰 별빛 · 탈 면에 붙은 평평한 무늬'))
    for c in INFO['combos']: R.append(sw2([c['top'], c['pants'], c['scarf']], c['name'], '윗옷 %s · 바지 %s · 목도리 %s' % (c['top'], c['pants'], c['scarf'])))
    R += [sw('#bfeaff', '숨방울', '#bfeaff 반투명 0.72 · 안의 빛 #fff3c0'), sw('#c9ccd8', '목걸이 끈', '#c9ccd8 은빛'), sw('#bfe8ff', '숨방울 막', '#bfe8ff 불투명도 0.018 + 테두리 빛'),
          sw('#ffc9a0', '피부', '#ffc9a0 (v2와 같음)'), sw('#7e4c33', '머리', '#7e4c33 탈 아래 지그재그 앞머리'), sw('#b8743f', '벨트 · 배낭', '#b8743f 가죽 (v2와 같음)'), sw('#ffd04a', '나침반 키링', '#ffd04a 금빛')]
    R.append('<h2>우주판 규칙</h2><div class="note"><ul>%s</ul></div>' % ''.join('<li>%s</li>' % x for x in [
        '차림은 시리즈 공통 원더룹(파랑 긴팔·반바지·목도리·둥근 장화) 그대로, 세계마다 탈만 바꿈',
        '외계인 탈은 더듬이 없음 · 바깥 끝이 올라간 검은 아몬드 눈 + 별빛 · 얼굴 구멍 테', '탈 아래로 지그재그 앞머리만 빼꼼',
        '숨방울 목걸이는 손에 쥐지 않고 몸에 참(도착하자마자)', '숨방울 막은 거의 안 보이게 — 불투명도 0.018, 테두리 빛만 은은히',
        '달리지 않음 — 걷기 + 대쉬만', '달에서는 점프가 둥실 뛰기(중력 0.38배)',
        '별똥별 꼬리(리본) 잡기는 달 → 화성만. 나머지 이동은 탈것이 띄워 주고 두 팔 벌려 둥실', '행성 이동·도착 때 펄럭이는 목도리 가닥(리본) 없음',
        '약 2등신이라 손이 머리 위로 못 올라감 — 꼬리는 가슴 앞, 우산은 탈 옆에서 쥠', '가방 물건(달떡·유리 조각)은 몸에 달지 않음', '반짝이는 눈은 신남·반짝 신남 표정에만']))
    body = '<h1>원더룹 Wonderloop <span style="font-weight:700;font-size:30px">· 무한 우주 탐방판</span></h1><div class="sub">캐릭터 시트 · 게임 속 실제 모델 촬영 (2026-11-27) · 외계인 탈 · 숨방울 목걸이 · 옷 조합 · 표정 · 우주 동작</div><div class="wrap"><div>%s</div><div>%s</div></div>' % (''.join(L), ''.join(R))
    return page('원더룹 무한 우주 탐방판', body)

FRIENDS = [
 dict(key='bobo', name='보름 할아버지', where='회색 정원 (달 · 첫 번째 행성)', cols=[('#c3c4cc', '털'), ('#efe6d6', '배·주둥이'), ('#2a2633', '모자'), ('#c8463c', '모자 띠'), ('#d8a24a', '망원경 안경')],
      intro='발자국으로 지도를 그리는 달토끼', likes='아직 아무도 안 가 본 빈칸', quote='여긴 바람이 없어서, 걸은 길이 아주 오래오래 남는단다.', voice='무한우주_보름 할아버지 — 변조 없음', idle='지도 펼쳐 보기 ↔ 망원경 안경 고쳐 쓰기(6.5초마다 번갈아)',
      vars=[('bobo-map', '지도 펼쳐 보기'), ('bobo-glass', '망원경 안경 고쳐 쓰기')]),
 dict(key='kongkong', name='아기 토끼 콩콩', where='회색 정원 (달) · 보름 할아버지 마을', cols=[('#d8d8e0', '털'), ('#ff9eb3', '목도리')], intro='보름 할아버지 마을에서 둥실둥실 뛰노는 콩콩·몽실·보슬 (카드는 셋이 한 장 ‘아기 토끼들’)', likes='떡방아 구경',
      quote='할아버지 지도에 우리 집도 있어!', voice='무한우주_아기 토끼 콩콩(셋이 한 목소리 공용) — 변조 없음 · 지금 게임에서는 글자만', idle='마을 둘레를 둥실둥실 뛰어다님', h=190),
 dict(key='mongsil', name='아기 토끼 몽실', where='회색 정원 (달) · 보름 할아버지 마을', cols=[('#e2d3bd', '털'), ('#9bd46b', '목도리')], intro='느긋하고 몽글몽글한 아기 토끼', likes='떡방아 구경',
      quote='여기선 톡 뛰면 한참 동안 떠 있어. 같이 뛰어 볼래?', voice='무한우주_아기 토끼 몽실(공용) — 변조 없음 · 글자만', idle='마을 둘레를 둥실둥실 뛰어다님', h=190),
 dict(key='bosul', name='아기 토끼 보슬', where='회색 정원 (달) · 보름 할아버지 마을', cols=[('#cdc6dc', '털'), ('#7fb6e8', '목도리')], intro='신기한 걸 보면 감탄부터 하는 아기 토끼', likes='떡방아 구경',
      quote='할아버지 망원경으로 보면 목성 줄무늬가 다 보여!', voice='무한우주_아기 토끼 보슬(공용) — 변조 없음 · 글자만', idle='마을 둘레를 둥실둥실 뛰어다님', h=190),
 dict(key='pipi', name='삐삐', where='붉은 모래 언덕 (화성 · 두 번째 행성)', cols=[('#E8946A', '몸')], intro='말이 먼저 도착하는 작은 화성 친구', likes='파란 노을', quote='둥둥아! …둥둥아? 내 말 들려?', voice='무한우주_삐삐 — 로봇 변조(45Hz 링 변조 + 플랜저)', idle='살짝 까딱이며 서 있음',
      vars=[('pipi-face', '아몬드 눈 · 별빛'), ('pipi-call', '부르기'), ('pipi-give', '두 손으로 내밀기'), ('pipi-wave', '손 흔들기')], h=210),
 dict(key='dungdung', name='둥둥', where='붉은 모래 언덕 (화성 · 두 번째 행성)', cols=[('#C2633F', '몸')], intro='말이 늦게 도착하는 키 큰 화성 친구', likes='삐삐와 보는 노을', quote='내 대답은 늘 조금 늦게 도착해.', voice='무한우주_둥둥(Jusen) — 로봇 변조', idle='느긋하게 서서 고개를 천천히 까딱',
      vars=[('dungdung-face', '눈꺼풀 — 늘 반쯤 내려와 있음(바뀌지 않음)'), ('dungdung-talk', '말하기'), ('dungdung-wave', '손 흔들기')]),
 dict(key='geokkuri', name='거꾸리', where='구름 행성 (금성 · 세 번째 행성)', cols=[('#c9a6e0', '구름 몸'), ('#d9bfee', '밝은 덩이'), ('#b48fd2', '그늘 덩이'), ('#e8c35a', '해시계 모자')], intro='해가 서쪽에서 뜨는 곳의 길잡이', likes='저녁에 뜨는 해', quote='녕안! 그림자 반대쪽이 앞이야.',
      voice='원더룹 거꾸리(보이스 디자인) — 변조 없음', idle='늘 뒷걸음질 — 얼굴은 원더룹 쪽, 등이 가는 방향', vars=[('geokkuri-hat', '해시계 모자(반시계 숫자)'), ('geokkuri-walk', '뒷걸음 걷기'), ('geokkuri-wave', '손 흔들기')]),
 dict(key='ddo', name='또생일', where='구름 행성 (금성 · 세 번째 행성)', cols=[('#fbe6f0', '몸'), ('#f6d2e2', '그늘'), ('#f59ab5', '케이크 모자 띠')], intro='늘 생일인 꼬마', likes='초 불기', quote='오늘 생일이야! 하루가 다 가기 전에 1년이 지나 버렸거든!',
      voice='원더룹 또생일(보이스 디자인) — 변조 없음', idle='제자리에서 통통 뛰기', vars=[('ddo-talk', '통통 뛰며 말하기')], h=210),
 dict(key='munge', name='뭉게 문지기', where='구름 행성 (금성 · 세 번째 행성) · 구름 문', cols=[('#f6f1fb', '양털 구름'), ('#e9def5', '덩이'), ('#ddcdef', '그늘 덩이'), ('#f6b3c6', '볼')], intro='구름 문을 지키는 잠꾸러기', likes='긴 낮잠', quote='드르륵… 음? 누구야…?',
      voice='원더룹 뭉게 문지기(보이스 디자인) — 변조 없음', idle='코 골며 몸이 부풀었다 꺼짐(감은 눈) — 오르골 가락이 끝나면 눈을 뜸', vars=[('munge-face-sleep', '감은 눈(코골이)'), ('munge-face-awake', '뜬 눈(눈뜸)'), ('munge-warn', '눈뜨기 전 들썩')], h=135, vh=120),
 dict(key='toring', name='토링', where='토성 고리 쉼터 (번호 없는 쉼터)', cols=[('#a9dcf7', '얼음 몸'), ('#d6f0ff', '밝은 얼음'), ('#7fc4ee', '그늘'), ('#f7b9cf', '볼')], intro='토성 고리를 돌보는 고리지기', likes='얼음 배 타고 고리 한 바퀴', quote='내 배 타고 쉬었다 가!',
      voice='무한우주_토링(보이스 디자인) — 변조 없음', idle='머리 위 얼음 고리가 천천히 돌며 살짝 오르내림 · 모델은 임시(디자인 확정 전)', vars=[('toring-ring', '머리 위 고리 — 납작한 얼음 띠 둘 + 작은 결정 다섯', 1), ('toring-wave', '손 흔들기'), ('toring-point', '가리키기'), ('toring-sit', '앉기')]),
]
WLCUT = 'wonderloop-space-nobubble-front'
HN = {'bobo': '귀·모자 끝까지', 'kongkong': '귀 끝까지', 'mongsil': '귀 끝까지', 'bosul': '귀 끝까지', 'geokkuri': '해시계 모자 바늘 끝까지 · 몸만 약 1.24m', 'ddo': '케이크 모자 초 끝까지', 'munge': '구름 꼭대기까지 · 폭 약 3.2m', 'toring': '머리 위 고리까지'}
def compare(key, pxm=92):
    pxm = min(pxm, 205 / (MAN[key + '-front']['w'] / MAN[key + '-front']['ppm'] + MAN[WLCUT]['w'] / MAN[WLCUT]['ppm']))  # 폭이 넓은 친구(뭉게 문지기)는 배율을 줄여 칸 안에
    m, w, h, g = scaled(key + '-front', pxm); m2, w2, h2, g2 = scaled(WLCUT, pxm); top = max(m['top_m'], 1.52); H = round(top * pxm) + 22; gap = 14; W = w + w2 + gap
    ticks = ''.join('<div class="tick" style="bottom:%dpx"><span>%sm</span></div>' % (round(v * pxm), ('%g' % v)) for v in [.5, 1, 1.5, 2] if v * pxm < H)
    f = lambda nm, ww, hh, gg, x, c: '<div class="sil" style="left:%dpx;bottom:%dpx;width:%dpx;height:%dpx;background:%s;-webkit-mask-image:url(/assets/sheets/cuts/%s.png)"></div>' % (x, -gg, ww, hh, c, nm)
    return '<div class="cmp" style="height:%dpx;width:%dpx;margin-left:auto;margin-right:auto">%s%s%s</div><div class="cmpc">%s <b>%.2fm</b> = 원더룹의 %.2f배<br><span style="color:#a08b78">장식 끝까지 · 원더룹 몸 키 1.38m(탈 꼭대기 1.52m)</span></div>' % (
        H, W + 30, ticks, f(WLCUT, w2, h2, g2, 0, '#8a9a6a'), f(key + '-front', w, h, g, w2 + gap, '#b98a6a'), '', m['top_m'], m['top_m'] / WLH)
def sheet_friends():
    V = [('front', '정면'), ('34', '3/4'), ('side', '측면'), ('back', '뒷면')]; L = []
    for f in FRIENDS:
        k = f['key']; h = f.get('h', 250); vs = ''.join(cut('%s-%s' % (k, v), n, h=h) for v, n in V)
        vr = ''
        if f.get('vars'): vr = '<div class="vars"><span class="t">변형</span>%s</div>' % ''.join(('<div class="cut"><div class="im dark">%s</div><b style="font-size:12.5px">%s</b></div>' % (img(x[0], f.get('vh', 150)), E(x[1]))) if len(x) > 2 else cut(x[0], x[1], h=f.get('vh', 150)).replace('<b>', '<b style="font-size:12.5px">') for x in f['vars'])
        m = MAN[k + '-front']
        info = '<div class="info"><dl><dt>사는 곳</dt><dd>%s</dd><dt>키</dt><dd>%.2fm · 원더룹(1.38m)의 %.2f배 <span style="color:#8a7566">(%s)</span></dd><dt>대표 색</dt><dd><div class="chips">%s</div></dd><dt>소개</dt><dd>%s</dd><dt>좋아하는 것</dt><dd>%s</dd><dt>한마디</dt><dd><span class="quote">“%s”</span></dd><dt>목소리</dt><dd>%s</dd><dt>대기 동작</dt><dd>%s</dd></dl></div>' % (
            E(f['where']), m['top_m'], m['top_m'] / WLH, E(HN.get(k, '머리 끝까지')), ''.join('<span><s style="background:%s"></s>%s %s</span>' % (c, E(n), c) for c, n in f['cols']), E(f['intro']), E(f['likes']), E(f['quote']), E(f['voice']), E(f['idle']))
        L.append('<h2>%s</h2><div class="fr"><div><div class="views">%s</div>%s</div><div>%s</div>%s</div>' % (E(f['name']), vs, vr, compare(k), info))
    # 구름 양(배경 주민)
    L.append('<h2>구름 양 <small>구름 행성의 배경 주민 — 친구 카드·대사 없음, 소리는 효과음 ‘음매’</small></h2><div class="fr" style="grid-template-columns:1fr 250px 400px"><div><div class="views">%s</div><div class="views" style="margin-top:14px">%s</div></div><div>%s</div>'
             '<div class="info"><dl><dt>사는 곳</dt><dd>구름 행성 (금성) · 해시계 마을 길</dd><dt>키</dt><dd>몰이 양 %.2fm · 조는 양 %.2fm</dd><dt>대표 색</dt><dd><div class="chips"><span><s style="background:#ffeec2"></s>몰이 양 털 #ffeec2</span><span><s style="background:#3a2850"></s>얼굴 #3a2850</span><span><s style="background:#fbf6ff"></s>조는 양 털 #fbf6ff</span><span><s style="background:#75618c"></s>얼굴 #75618c</span></div></dd>'
             '<dt>모습</dt><dd>윗줄 = 양 몰기 놀이의 탈출한 양 다섯(크림 털·진한 얼굴), 아랫줄 = 길가에서 조는 양 셋(흰 구름 털)</dd><dt>대기 동작</dt><dd>몰이 양: 원더룹이 3.5m 안으로 오면 반대쪽으로 도망 · 조는 양: 엎드려 ‘z z’</dd></dl></div></div>' % (
                 ''.join(cut('herdsheep-' + v, n, h=150) for v, n in V), ''.join(cut('sheep-' + v, n, h=120) for v, n in V), compare('herdsheep'), MAN['herdsheep-front']['top_m'], MAN['sheep-front']['top_m']))
    L.append('<div class="box note" style="margin-top:18px"><ul><li>화성의 ‘붉은 막대 친구들’은 따로 없어요 — 화성 주민은 삐삐와 둥둥 둘뿐이에요.</li><li>토링은 임시 모델이에요(디자인 확정 전). 머리 위 고리는 흰빛 반투명이라 밝은 바탕에서는 옅게 보여요.</li><li>키는 모두 같은 카메라·같은 배율로 찍은 정면 컷에서 잰 값(장식 끝까지)이에요.</li></ul></div>')
    # 전원 키 순서
    ALL = [(WLCUT, '원더룹', None)] + [(f['key'] + '-front', f['name'].replace('아기 토끼 ', ''), None) for f in FRIENDS] + [('herdsheep-front', '구름 양', None)]
    ALL.sort(key=lambda a: (1.38 if a[0] == WLCUT else MAN[a[0]]['top_m'])); pxm = 104; tot = sum(MAN[a[0]]['w'] / MAN[a[0]]['ppm'] for a in ALL)
    ppl = []; nm = []
    for name, lab, _ in ALL:
        m, w, h, g = scaled(name, pxm); top = 1.38 if name == WLCUT else m['top_m']
        ppl.append('<div style="width:%dpx;height:%dpx;position:relative"><img src="/assets/sheets/cuts/%s.png" width="%d" height="%d" style="position:absolute;left:0;bottom:%dpx" alt=""></div>' % (w, h - g, name, w, h, -g))
        nm.append('<div style="width:%dpx">%s<i>%.2fm%s</i></div>' % (w, E(lab), top, ' (몸 키)' if name == WLCUT else ''))
    grid = ''.join('<div class="g" style="bottom:%dpx"><span>%sm</span></div>' % (round(v * pxm) + 3, '%g' % v) for v in [.5, 1, 1.5, 2])
    L.append('<h2>전원 키 순서 <small>같은 배율 · 바닥선과 눈금(m) · 작은 순 — 원더룹은 몸 키 1.38m 기준(탈 꼭대기 1.52m)</small></h2><div class="line"><div style="position:relative;height:%dpx">%s<div class="ppl" style="position:absolute;left:0;right:0;bottom:0">%s</div></div><div class="nm">%s</div></div>' % (round(2.4 * pxm), grid, ''.join(ppl), ''.join(nm)))
    body = '<h1>무한 우주 친구들 <span style="font-weight:700;font-size:30px">· Wonderloop Infinite Space</span></h1><div class="sub">주민 시트 · 게임 속 실제 모델 촬영 (2026-11-27) · 정면 · 3/4 · 측면 · 뒷면 + 원더룹과 키 비교 · 글은 친구 카드·세계 설정 그대로</div>%s' % ''.join(L)
    return page('무한 우주 친구들', body)

with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_context(viewport={'width': 1600, 'height': 1200}, device_scale_factor=2).new_page()
    for key, fn, out in [('wl', sheet_wl, 'wonderloop-space-sheet.png'), ('friends', sheet_friends, 'space-friends-sheet.png')]:
        if WHICH not in ('both', key): continue
        pg.goto('http://localhost:8000/tools/hooks/', wait_until='domcontentloaded'); pg.set_content(fn(), wait_until='networkidle'); pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(500)
        bad = pg.evaluate("[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)"); over = pg.evaluate("document.documentElement.scrollWidth")
        pg.screenshot(path=os.path.join(ROOT, 'assets/sheets', out), full_page=True); print(out, '못 읽은 그림', bad, '가로', over, '글꼴', pg.evaluate("document.fonts.check('700 16px \"Noto Sans KR\"')"))
    b.close()
