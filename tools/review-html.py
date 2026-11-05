# -*- coding: utf-8 -*-
"""GPT 교차 검증 자료 만들기 — 브라우저로 열고 GPT에 그대로 올릴 수 있는 HTML 파일 하나(외부 링크·스크립트 없음).
사용: python3 tools/review-html.py            (저장소 루트에서) → docs/review/fairy-forest-review.html
  - 1 검토 요청서 · 2 인덱스(파일 지도·main 대비 바뀐 것·핵심 흐름·규칙·시험·한계) · 3 코드(줄 번호)
  - 이미지·모델·사운드·기준 촬영은 넣지 않는다. 코드와 CLAUDE.md만.
  - 민감한 값(개인 경로·내부 IP·전자우편)은 지운다. 9MB를 넘으면 코드만 2~3개 파일로 나눈다(-part2.html …).
  - 핵심 흐름의 '파일:줄'은 만들 때마다 코드에서 다시 찾는다(정규식) — 코드가 바뀌어도 줄 번호가 맞는다."""
import html, os, re, subprocess, sys, datetime

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
OUT = os.path.join(ROOT, 'docs', 'review', 'fairy-forest-review.html')
BRANCH, BASE = 'world/fairy-forest', 'main'
LIMIT = 9 * 1024 * 1024


def git(*a):
    return subprocess.run(['git', *a], cwd=ROOT, capture_output=True, text=True).stdout


# ---------- 넣을 코드 (영역별) ----------
AREAS = [
    ('engine', '엔진 코어 (번호 모듈 01~09, 첫 페이지)', ['index.html', 'js/01-textures.js', 'js/02-zone.js', 'js/03-scene.js', 'js/04-character.js',
                                                  'js/05-hair-headwear.js', 'js/06-outfits.js', 'js/07-actions.js', 'js/08-main.js', 'js/09-capture.js']),
    ('game', '게임 공통 시스템 (js/game)', None),
    ('hoods', '탈 (js/hoods)', None),
    ('fairy', '요정의 숲 전용 (js/zones/fairy)', None),
    ('zones', '다른 구역 — 베이스캠프·견본·휴대폰 시험 장면 (js/zones)', ['js/zones/basecamp.js', 'js/zones/sample-indoor.js', 'js/zones/sample-outdoor.js', 'js/zones/sample-fx.js']),
    ('tools', '시험·제작 도구 (tools)', None),
    ('config', '설정과 규칙 문서', ['CLAUDE.md', '.claude/launch.json', 'version.json']),
]
SKIP = {'tools/review-html.py'}
tracked = [f for f in git('ls-files').split('\n') if f]
def listdir(prefix, exts=('.js', '.py')):
    return sorted(f for f in tracked if f.startswith(prefix) and (f.endswith(exts) or f.startswith('tools/hooks/')) and f not in SKIP)
for i, (k, t, fs) in enumerate(AREAS):
    if fs is None:
        AREAS[i] = (k, t, {'game': listdir('js/game/'), 'hoods': listdir('js/hoods/'), 'fairy': listdir('js/zones/fairy/'), 'tools': listdir('tools/')}[k])

DESC = {
    'index.html': '첫 페이지 — importmap(three r186, 파일마다 ?v= 버전), 버전 확인 스크립트(wl-vercheck), 시험 단추·성능 상자, 08만 불러옴',
    'js/01-textures.js': '색연필 텍스처 pencil()·재질 헬퍼 M/SM/TM/BM·구운 텍스처 불러오기·용도별 시드 난수 rng()·품질 단계 QUALITY·동그란 그림자 blob/shadowBlob/blobMany',
    'js/02-zone.js': '구역 목록·loadZone/unloadZone(GPU 메모리 비우기)·걷기 판정 blocked/overlap/groundY/floorAt·발판·튀는 발판·바람·처음 구역(START_ZONE)',
    'js/03-scene.js': '렌더러·조명·카메라·픽셀 비율 상한·방 카메라 setAreaCamera·followDist·정적 병합 mergeStatic(휴대폰 색 접기)·r128 화면 유지 패치',
    'js/04-character.js': '원더룹 몸·얼굴·표정 setExpr·개미탈',
    'js/05-hair-headwear.js': '머리카락(지그재그 단발)·탈 아래 앞머리·applyLook(탈 번호별 보이기)',
    'js/06-outfits.js': '옷(평상복/탐험복)·캐릭터 병합·탈 목록 HOODS·setHood·pressHair·나침반·아이템 키링 addCharm·활공 물건 setGlideProp',
    'js/07-actions.js': '뼈대·아틀라스(텍스처 배열)·림 라이트·이동·높이 이동(점프·활공·발판)·동작 세트·탈 바뀜 morphHood·갇힘 안전장치 canGo/unstick',
    'js/08-main.js': '입력·조명 단계·하늘 시간·따라가기 카메라(당김·연출·카메라 규칙)·구역 오가기·zoneLook·자동 화질 조절 PERF·프레임 제한·촬영 모드 wlShot',
    'js/09-capture.js': '영상 캡처 모드(?shot&capture=) — 16:9·9:16 MP4, 시점 기록 cues.json, 구간별 자동 확인표',
    'js/game/index.js': '게임 공통 묶음 — initGame/updateGame, 구역 떠날 때 clearZoneGame, 카메라 요청 view(start/focus/hold)',
    'js/game/core.js': '게임 시간·막힘(대화·카드)·소리 시점 기록',
    'js/game/state.js': '진행 상태 flags(localStorage, 촬영 모드는 안 씀)',
    'js/game/controls.js': '조작(WASD·방향키·점프·대쉬·E·조이스틱·끌기/두 손가락/휠 카메라, 사파리 확대 막기, cam.user 카메라 손댐 세기)',
    'js/game/dialog.js': 'NPC 대화·혼잣말·말풍선(가장 가까운 아직 말 안 건 인물 하나)',
    'js/game/events.js': '이벤트 줄·영역·조건 트리거, 이벤트 공통 규칙',
    'js/game/ui.js': '대화창·미션 카드·아이템 카드·비밀 카드·결과창·소개 카드·안내 문구·화면 전환·카드 자리 줄 세우기',
    'js/game/sound.js': '효과음·대사·나레이션·배경음 크로스페이드·소리 깨우기(아이폰 audioSession)',
    'js/game/synth.js': '합성 소리 도구',
    'js/sfx/common.js': '효과음 공통 묶음(종류 이름 — 개미굴 원본 소리 그대로 + 새 6개)',
    'js/sfx/antvillage.js': '개미굴 전용 효과음 7개',
    'js/game/react.js': '원더룹 리액션 모음(후덜덜·화면 흔들림·기쁨·깜짝 놀람·갸웃·폴짝·한숨)',
    'js/game/itemget.js': '아이템 획득 공통 연출(머리 위에 떠 있다가 손·배낭으로, 원더룹은 카메라 보며 웃음)',
    'js/game/incident.js': '사건 연출 공통 처리(사건 순간 카메라·굴러가는 물건)',
    'js/game/music.js': '코드로 연주하는 배경음 엔진(마디·선율·parts·층 쌓기)',
    'js/game/codex.js': '도감·숨겨진 비밀·엔딩',
    'js/game/profile.js': '캐릭터 소개 카드(처음 이야기한 뒤 한 번), 게임 안 초상 렌더링 portrait',
    'js/game/occlude.js': '가리면 비쳐 보이기 — 물체 전체 0.3 흐림(add·boxes·set), 여유 두기. 동그란 흐림 cut·덧그리기·윤곽선 xray는 지금 쓰지 않음',
    'js/game/interact.js': '손으로 하는 상호작용(걸어가 마주 보고 손 동작 → onDone)',
    'js/game/course.js': '통과 링',
    'js/game/ride.js': '탈것 — 정해진 곡선 길로 태워 옮김(fwd·seat·pose)',
    'js/game/companion.js': '따라오는 동행',
    'js/game/fx.js': '빛 입자 particles·burst, 같은 모델 여러 개 crowd(InstancedMesh, 인스턴스 색)',
    'js/game/hud.js': '이야기 시계(남은 개수 카운터)',
    'js/game/items.js': '아이템 받기(flags, 세계를 넘어 남음)',
    'js/game/lamps.js': '등불 가짜 빛 lampSet(빛무리·웅덩이, 진짜 조명 1개가 옮겨 다님)',
    'js/game/sky.js': '하늘 지붕·별·시간 흐름(낮 0 · 해 질 녘 1 · 밤 2)',
    'js/game/title.js': '타이틀·엔딩 로고(영상용 캔버스·게임 화면 HTML)',
    'js/hoods/crown.js': '꽃 화관(봉오리 crown·핀 crownBloom) — 팔레트 한 장·덩어리 합치기, 보석·피어나기 animate, 별가루 tick(Points 셰이더)',
    'js/zones/fairy/world.js': '요정의 숲 세계 기본값(옷·탈·아이템), 하늘 색, 물 색, 소개 카드 문구, 아이콘·카드 그림 주소',
    'js/zones/fairy/paint.js': '개미굴 붓결 텍스처 painted()·툰 재질 toon()·잡음 fbm, 캐시 비우기',
    'js/zones/fairy/fairies.js': '요정 모델(사공·버섯), 나뭇잎배 leafBoat, 민들레 홀씨 우산 dandelionPuff, 부품 굽기 bakeFairy',
    'js/zones/fairy/forest.js': '깊은 숲 배경 deepForest — 실루엣 판 네 겹·머리 위 큰 잎·빛줄기',
    'js/zones/fairy/music.js': '요정의 숲 배경음 다섯 곡',
    'js/zones/fairy/dock.js': 'STAGE 01 이슬방울 선착장 — 땅·물길·선착장·풍경·가림(bakeGroup·fadeMerge)·이야기(사공 → 클로버 → 이슬방울 → 이슬배 → 우산 → 활공)·매 프레임 update',
    'js/zones/basecamp.js': '베이스캠프(기준 화면 방)',
    'js/zones/sample-indoor.js': '견본 실내(방 여러 개·시험용 NPC·도감·비밀) — 규칙 시험 장소',
    'js/zones/sample-outdoor.js': '견본 야외',
    'js/zones/sample-fx.js': '휴대폰 성능 시험 장면(효과 견본 모음·자동 측정)',
    'tools/game-tests.js': '규칙 자동 시험 13개(이벤트 공통 규칙·카드 줄 세우기·도감·비밀·엔딩·손 상호작용)',
    'tools/baseline-shots.js': '기준 스크린샷 23장 촬영 목록',
    'tools/compare-shots.js': '기준 스크린샷 픽셀 비교',
    'tools/rig-shots.js': '캐릭터 동작·각도·표정 282장 + 부품 행렬 JSON',
    'tools/rim-shots.js': '어두운 굴 림 라이트 확인',
    'tools/atlas-grain.js': '아틀라스 층마다 원래 텍스처와 픽셀 비교',
    'tools/atlas-shots.js': '옷감 가까이·휴대폰 폭 멀리 촬영',
    'tools/phone-check.js': '휴대폰 세로 자동 확인(카드·대화창 가림, 빛 번짐, 소리 설정)',
    'tools/stuck-test.js': '갇힘 자동 시험(0.2m 칸마다 막힌 섬·끼이는 칸·빠져나오기)',
    'tools/cam-walk-test.js': '카메라 거리 그래프(집·바위·큰 잎 옆을 걸으며 당김 확인)',
    'tools/occlude-test.js': '가림 시험(큰 잎·줄기·집 벽 뒤 원더룹이 까맣게 되지 않는지, PC·휴대폰 단계)',
    'tools/bake-textures.js': '색연필 텍스처 굽기(픽셀 일치 확인)',
    'tools/export-glb.js': '뼈대 포함 GLB 내보내기',
    'tools/side-by-side.js': '전후 비교 시트',
    'tools/capture/sample-indoor.js': '영상 캡처 견본 대본',
    'tools/cues-to-ae.py': '시점 기록 → 애프터이펙트 스크립트',
    'tools/shot-server.py': '촬영 서버(캐시 금지, PNG·영상 조각 저장, /studio/)',
    'tools/stamp.py': '버전 표시 — 파일 해시를 importmap ?v=·WL_V·version.json에',
    'tools/hooks/pre-commit': '커밋 때 stamp 자동 실행',
    'CLAUDE.md': '프로젝트 규칙·구조·예산·로드맵(검토 기준)',
    '.claude/launch.json': '미리보기 서버 설정',
    'version.json': '지금 버전(wl-vercheck가 캐시 없이 읽음)',
}

# main 대비 바뀐 파일의 바뀐 내용(새 파일은 위 설명으로)
CHANGED = {
    'index.html': '버전 확인 스크립트 wl-vercheck(옛 index.html을 기억하는 사파리 대비), 성능 상자·시험 단추 숨김(톱니), 휴대폰 터치 확대 막기',
    'CLAUDE.md': '요정의 숲·가림·카메라 규칙·휴대폰 예산·화관·여유 두기·빈 자리 찾기 등 규칙 추가',
    'js/01-textures.js': '품질 단계 QUALITY(휴대폰은 진짜 그림자 대신 동그란 그림자), shadowBlob·blobMany, 구운 텍스처 불러오기 방식',
    'js/02-zone.js': '발판·튀는 발판·바람·floorAt·overlap(갇힘), START_ZONE(zone 없으면 선착장), 구역 dispose',
    'js/03-scene.js': '픽셀 비율 상한(휴대폰 1.25)·setPixelCap, 색 접기 mergeColors, 하늘 구역 먼 거리 당기기',
    'js/05-hair-headwear.js': '탈 번호 hw별 보이기(교체 영역 탈)',
    'js/06-outfits.js': '탈 목록 확장(crown·crownBloom), 모자형 탈 profile, 아이템 키링·활공 물건·배지·손에 든 물건',
    'js/07-actions.js': '높이 이동(점프·활공·발판·바람), 움직임 효과(개미굴), 탈것 타기, 탈 바뀜 morphHood·탈 tick, 갇힘 안전장치 canGo/unstick, 발밑 그림자',
    'js/08-main.js': '하늘 시간 단추, 따라가기 카메라(camRoom·땅만 당김·연출 focus/hold/start·손대면 연출 끝), 자동 화질 PERF·applyQuality, 쉴 때 20fps, 버전 표시, 덧그리기·윤곽선 제거',
    'js/09-capture.js': '말풍선·소개 카드 영상 처리',
    'js/game/codex.js': 'meet(다시 플레이할 때 카드), 비밀 자리',
    'js/game/core.js': '막힘 종류 추가',
    'js/game/dialog.js': '말풍선 규칙(가장 가까운 한 명, 말을 건 뒤 다시 안 뜸, bubbleY)',
    'js/game/events.js': '이벤트 공통 규칙 보강',
    'js/game/sound.js': '개미굴 효과음·크기 묶음, 배경음 bed·크로스페이드, 대사 중 배경음 40%, 소리 깨우기',
    'js/game/state.js': '아이템 플래그',
    'js/game/ui.js': '개미굴 대화창·카드 모양, 아이템 카드·소개 카드·그림 컷·화면 전환, 카드 줄 세우기',
    'js/zones/basecamp.js': '휴대폰 단계 동그란 그림자',
    'tools/game-tests.js': '규칙 시험 추가(손 상호작용 등, 13개)',
    'tools/phone-check.js': '세계 구역(하늘 시간) 빛 번짐 확인',
    'tools/shot-server.py': '캐시 금지 헤더, /studio/ 경로, 연결 대기 줄',
    'tools/stamp.py': 'version.json·wl-vercheck 쓰기, --check',
    'tools/hooks/pre-commit': 'version.json도 함께 더하기',
    '.claude/launch.json': '미리보기 서버',
}

# 핵심 흐름: (설명, [(파일, 정규식, 이름)])
FLOWS = [
    ('STAGE 01 이야기 흐름 (이슬방울 선착장)', '단계 st.phase: arrive(사공에게 가기) → clovers(클로버 셋 손으로 돌리기, 카메라가 1.8초 클로버를 비춤) → rolling(물길이 열려 이슬방울이 굴러옴, 카메라가 따라감) → boat(배에 이슬방울, 타기) → riding(이슬배 타고 건너감) → gift(사공이 원더룹 옆 빈 땅으로 내려 우산을 줌) → done(바위에서 활공).', [
        ('js/zones/fairy/dock.js', r"const st=\{phase:'arrive'\}", '진행 상태 st'),
        ('js/zones/fairy/dock.js', r'function afterBoatman', '사공 대화 뒤 → 클로버 미션'),
        ('js/zones/fairy/dock.js', r'function openChannel', '물길 열기·이슬방울 굴리기·이슬방울 카메라(view.hold)'),
        ('js/zones/fairy/dock.js', r'function startRide', '이슬배 타기(view.start 처음 각도, ride.ride)'),
        ('js/zones/fairy/dock.js', r'function openSpot', '도착 뒤 사공 빈 자리'),
        ('js/zones/fairy/dock.js', r'^function update', '매 프레임(이슬방울 굴러옴·배 흔들림·물 색·등)'),
        ('js/game/ride.js', r'function ride|export', '탈것 진행'),
        ('js/game/interact.js', r'function add', '손 상호작용 등록'),
    ]),
    ('가림 (카메라와 원더룹 사이 물체)', '컴퓨터·휴대폰 같은 방식: 가리는 물체 전체가 0.3 투명도로 약 0.2초에 걸쳐 흐려진다. 동선 가까이 큰 풀·잎은 bakeGroup으로 물체마다 한 덩어리 + 부품 상자, 둘레 벽·꽃지붕 집은 fadeMerge로 한 덩어리 안에서 부품 번호별 불투명도 표(wlFade). 판정은 카메라 → 원더룹 발·허리·가슴·머리 네 시선이 상자를 지나는지, 카메라 0.9m 안·보는 쪽 1m 앞이면 완전히 숨김. 여유 두기(돌아오는 경계가 더 멀고 0.35초 유지). 밑면은 땅에 4cm 묻음(z-fighting).', [
        ('js/game/occlude.js', r'^function add', 'occlude.add'),
        ('js/game/occlude.js', r'^function boxHit', 'boxHit(여유 두기)'),
        ('js/game/occlude.js', r'^function tickOcclude', 'tickOcclude(매 프레임)'),
        ('js/zones/fairy/dock.js', r'^function bakeGroup', 'bakeGroup'),
        ('js/zones/fairy/dock.js', r'^function fadeMerge', 'fadeMerge'),
        ('js/zones/fairy/dock.js', r'^function buryBase', 'buryBase'),
        ('js/zones/fairy/dock.js', r'^function bendGrass', '키 큰 풀 무리 웅크리기'),
    ]),
    ('카메라 규칙', '카메라는 플레이어 것. 끌기·두 손가락·휠로 늘 바꿀 수 있고 손을 떼도 그 각도를 지킨다. 탈것은 처음 각도만(view.start, 0.8초). 저절로 움직이는 건 짧은 연출(view.focus 클로버, view.hold 이슬방울)뿐이고 손대면(controls cam.user) 08이 연출을 끝낸다. 당기는 건 둘레 벽 camRoom과 땅뿐 — 흐려지는 물체는 당기지 않는다.', [
        ('js/game/index.js', r'start\(\{from', 'view.start / focus / hold'),
        ('js/game/controls.js', r'input\.cam\.user=', '손댐 세기 cam.user'),
        ('js/08-main.js', r'C\.user', '연출 끝내기·처음 각도 섞기·당김'),
        ('js/03-scene.js', r'^function followDist|followDist', '세로 화면 거리 배율'),
    ]),
    ('충돌·갇힘 안전장치', '장애물 속이면 덜 파고드는 쪽으로는 걸을 수 있고, 3초 넘게 제자리면 4m 안 열린 곳이나 마지막 안전한 자리(0.5초마다 기억)로 부드럽게 밀어낸다. 작은 소품은 충돌을 빼고, 서는 자리는 SOLID 목록으로 피한다.', [
        ('js/02-zone.js', r'^function blocked', 'blocked'),
        ('js/02-zone.js', r'^function overlap', 'overlap'),
        ('js/07-actions.js', r'^function canGo', 'canGo'),
        ('js/07-actions.js', r'^function unstick', 'unstick'),
        ('tools/stuck-test.js', r'.', '자동 시험'),
    ]),
    ('휴대폰 성능 단계', '게임을 열 때 한 번 정함(QUALITY — ?quality=, 촬영 모드 high, 손가락 기기 mobile). 휴대폰: 진짜 그림자 끔 → 동그란 그림자, 30fps(쉴 때 20), 픽셀 비율 1.25, 색 접기 병합, 입자 절반. 자동 화질은 느릴 때나 10·20분마다 한 단계씩 내려가고 다시 올리지 않는다. 예산: 화면 드로우콜 60 이하·삼각형 15만 이하.', [
        ('js/01-textures.js', r'^const QUALITY', 'QUALITY'),
        ('js/08-main.js', r'^const PERF', 'PERF·applyQuality'),
        ('js/08-main.js', r'^function frame', '프레임 제한·쉴 때'),
        ('js/03-scene.js', r'^function setPixelCap', '픽셀 비율 상한'),
        ('js/03-scene.js', r'^function mergeStatic', '정적 병합·색 접기'),
    ]),
    ('스테이지 이동 시 메모리 비우기', '구역을 떠나면 02 unloadZone이 기하·재질·텍스처를 dispose하고, 구역 dispose()가 붓결·요정 재질 캐시(clearPaintCache·clearFairyCache)·입자·등불·배경을 놓는다. 게임 공통은 clearZoneGame이 NPC·트리거·카메라 요청을 비운다. 08이 아틀라스 교체 영역을 비운다(atlas.clear(\'swap\')).', [
        ('js/02-zone.js', r'^function unloadZone', 'unloadZone'),
        ('js/zones/fairy/dock.js', r'dispose\(\)\{', '선착장 dispose'),
        ('js/game/index.js', r'^function clearZoneGame', 'clearZoneGame'),
        ('js/08-main.js', r"atlas\.clear\('swap'\)", '아틀라스 교체 영역'),
    ]),
    ('화관·별가루', '봉오리 화관 crown → 별꽃 보석 → 핀 화관 crownBloom(morphHood, 앞에서부터 8조각씩 피어남). 색은 256 팔레트 한 장, 모양 몇 가지를 덩어리로 합쳐 아틀라스가 양면끼리 한 번에 그림. 별가루는 Points 셰이더 하나(휴대폰 72·컴퓨터 150개, 더하기 섞기), 07이 매 프레임 탈 모듈 tick을 부름.', [
        ('js/hoods/crown.js', r'^export function build', 'build'),
        ('js/hoods/crown.js', r'^export function animate', 'animate(피어나기)'),
        ('js/hoods/crown.js', r'^export function tick', 'tick(별가루)'),
        ('js/06-outfits.js', r'HOODS', '탈 목록 HOODS'),
        ('js/07-actions.js', r'morphHood', '탈 바뀜 morphHood'),
    ]),
    ('캐릭터 소개 카드', 'NPC와 처음 이야기한 뒤 한 번(flags meet:<세계>:<id>). 2D 그림이 있으면 그것, 없으면 그 캐릭터만 따로 찍은 초상. 크림색 카드, 화면 위 가운데, 막지 않음, 12초 뒤 저절로.', [
        ('js/game/profile.js', r'^function meet', 'meet'),
        ('js/game/profile.js', r'^function portrait', 'portrait'),
        ('js/game/ui.js', r'profileCard', 'ui.profileCard'),
        ('js/zones/fairy/world.js', r'FAIRY_CARDS', '카드 문구'),
    ]),
]

RULES = [
    '화면 기준은 r128 시절 화면 — 색 관리·조명 단위·점광원 감쇠 패치(03, 임시 호환). 기준 스크린샷과 바이트 비교로 지킨다.',
    '01~08은 ES 모듈, 08만 불러오고 앞 번호에서만 import. import한 변수는 다시 넣을 수 없어 객체·함수로.',
    '난수는 용도별 시드(rng(이름)) — 기존 이름에서 난수를 더 꺼내지 않는다(기록 파일과 어긋남).',
    '구역 = js/zones/<이름>.js build({root}). 03·07·08은 구역을 이름으로 알지 않는다. 구역 전용 조명·효과는 구역 안에.',
    '이벤트 공통 규칙 ①~⑦(엔진이 보장): 카드가 열리면 위협 멈춤, 끊긴 나레이션 처음부터, 대화 중 혼잣말 줄 서기, 하나씩, 빈 NPC 안 고름, 프레임 오류 계속, 카드 자리 하나.',
    '안내 표시는 반드시 ui.hint()로(영상 캡처가 한 번에 숨김).',
    '원더룹은 무언가를 할 때 손으로 한다(발로 밟아 해결하지 않기).',
    '가림: 컴퓨터·휴대폰 같은 방식(물체 전체 0.3), 원더룹·탈은 늘 원래 색. 덧그리기·윤곽선 쓰지 않음.',
    '카메라 규칙: 붙박지 않기, 연출은 짧게·손대면 끝, 당기는 건 둘레 벽과 땅뿐.',
    '모바일 품질 단계는 열 때 한 번만 — 빛·그림자 개수를 바꾸지 않는다(셰이더 다시 만들기로 몇 초 멈춤). 세기만 0으로.',
    '모바일 조명: 점광원은 구역마다 2개 이하, 등불은 lampSet 가짜 빛.',
    '예산 — 데스크톱 드로우콜 1,000 이하. 휴대폰 스테이지당 화면 드로우콜 60 이하(걷는 동안 평균), 삼각형 15만 이하, GPU 메모리는 그 스테이지 것만.',
    '휴대폰: 30fps(쉴 때 20), 픽셀 비율 1.25, 그리기 상한 2560×1440, 진짜 그림자 대신 동그란 그림자, 자동 화질 4단계.',
    '커밋 전 stamp.py(버전 해시) — 새로 fetch하는 주소에는 ?v=WL_V.',
    '영상 제작 결과물은 공개 저장소에 넣지 않는다.',
    '아트: 파스텔 색연필 + 로우폴리, 약 2등신, 안광 없는 눈, 손가락 없는 손, 탈만 교체, 탈을 쓰면 안쪽 머리는 눌려 뚫고 나오지 않는다.',
]

TESTS = [
    ('tools/game-tests.js', '?shot&zonetest&zone=sample-indoor', '이벤트 공통 규칙 ①~⑦, 카드 줄 세우기, 도감·비밀·엔딩, 손 상호작용 — 13개'),
    ('tools/baseline-shots.js + compare-shots.js', '?shot', '기준 스크린샷 23장(방 낮·저녁·굴, 옷·탈 4각도, 동작) 픽셀 비교 — 화면 기준이 바뀌는지'),
    ('tools/rig-shots.js', '?shot', '동작 9가지 × 3시각 × 4각도 × 모자·개미탈 등 282장 + 부품 행렬 — 뼈대·팔다리 뚫림'),
    ('tools/rim-shots.js', '?shot', '어두운 굴 림 라이트'),
    ('tools/atlas-grain.js · atlas-shots.js', '?shot', '아틀라스 층과 원래 텍스처 결 비교'),
    ('tools/phone-check.js', '390×844, ?shot&zone=<구역>', '휴대폰 세로 — 카드·대화창이 화면 안·원더룹 가림, 낮·해 질 녘·밤 빛 번짐, 소리 설정'),
    ('tools/stuck-test.js', '?shot&zone=<구역>', '0.2m 칸마다 막힌 섬·끼이는 칸·장애물 속에서 못 나옴·실제 안전장치(위에서 본 지도)'),
    ('tools/cam-walk-test.js', '보통 주소', '집·바위·큰 잎 옆을 걸으며 카메라 거리 그래프 — 당겼다 물러났다 하지 않는지'),
    ('tools/occlude-test.js', '?shot&zone=fairy-dock (&quality=mobile)', '큰 잎·줄기·집 벽 뒤 원더룹(핀 화관)이 까맣게 되지 않는지, 가리는 물체가 실제로 흐려지는지'),
    ('tools/stamp.py --check', '저장소', '버전 해시·version.json이 최신인지'),
    ('tools/bake-textures.js', '?shot&nobake&zonetest', '구운 텍스처와 그린 텍스처 픽셀 일치'),
    ('sample-fx "자동 측정"', '?zonetest&zone=sample-fx', '효과별·픽셀 비율별 프레임 시간(아이폰에서)'),
    ('09 영상 캡처 확인표', '?shot&capture=…', '게임 표시 숨김, 타이틀 겹침, 카메라 가림, 원더룹 보임, 같은 장면 반복, 소리 끊김'),
]

LIMITS = [
    '아이폰 실기 확인이 남았다: 꽃지붕 집 깜빡임이 사라졌는지(자동 걷기 시험으로는 다시 만들지 못해 바닥 겹침을 주원인으로 보고 고침), 휴대폰 확인 순서 2~4(안전 영역·빛 번짐·무음 모드).',
    'world/fairy-forest는 main에 합치지 않았다 → GitHub Pages(main)에서는 베이스캠프만 보인다. START_ZONE=\'fairy-dock\'은 이 브랜치 전용 — 합칠 때 정해야 한다.',
    '다음 구역 문(fairy-dandelion)은 아직 없어 닫혀 있다. STAGE 02~04 미제작.',
    'game/occlude.js의 동그란 흐림 cut·덧그리기 overlayPass·윤곽선 xray 코드가 남아 있지만 지금 어느 구역도 쓰지 않는다(죽은 코드 — 지울지 결정 필요). 08 renderFrame은 아직 overlayPass를 부른다(cutOn이 거짓이라 바로 돌아옴).',
    'occlude boxHit은 매 프레임 흐려질 수 있는 모든 물체의 모든 부품 상자에 광선 네 개 — 스테이지가 커지면 CPU 비용(공간 나누기·거리로 미리 거르기 없음).',
    'fadeMerge 불투명도 표는 64칸(63 = 흐려지지 않는 고정 칸) — 둘레 벽 부품이 63개를 넘으면 깨진다(검사 없음).',
    'SOLID·openSpot·bakeGroup·fadeMerge·buryBase가 dock.js 안에 있다 → 다음 스테이지에서 공통 모듈로 옮겨야 한다.',
    '화관 별가루 Points는 처음 쓸 때 장면에 붙고 해제하지 않는다(재사용, 구역 이동과 무관).',
    'r128 화면 유지 패치는 임시 호환 — 새 세계 색감을 잡을 때 걷어낼 예정.',
    '영상 캡처 견본 대본의 문간 "카메라 가림 1.1초"는 아직 고치지 않았다(문간 카메라로 정함).',
    '로드맵 5(영상 캡처)·6(모바일 품질 단계) 진행 중, 7(앤트빌리지 이식)은 맨 뒤.',
    '구운 텍스처 불러오기 BAKE_LOAD는 \'hand\'(휴대폰 첫 방문 속도 우선) — 다시 방문·느린 CPU에는 불리.',
]

ASK = [
    ('버그 가능성', ['가림 판정(game/occlude.js boxHit·tickOcclude, dock.js bakeGroup·fadeMerge) — 흐려져야 할 때 안 흐려지거나 깜빡이는 경우, 카메라가 상자 안일 때, 여러 겹일 때',
                  '카메라 당김과 연출(08 따라가기 카메라, game/index.js view.start/focus/hold, controls cam.user) — 연출이 안 끝나거나 손댄 뒤 튀는 경우, 세로 화면, 구역 이동 중',
                  '충돌·갇힘(02 blocked/overlap, 07 canGo/unstick, dock.js openSpot·SOLID) — 빠져나오지 못하는 자리, 밀어내기가 물·발판 위로 보내는 경우',
                  '이야기 진행 상태 전환(dock.js st.phase, afterBoatman·openChannel·startRide·update, ride.onEnd) — 순서가 꼬이거나 두 번 일어나는 경우, 카드·대화가 열린 동안, 다시 플레이·저장된 진행(flags)']),
    ('휴대폰 성능·발열에 불리한 코드', ['매 프레임 하는 계산 중 줄일 수 있는 것(new 객체 만들기, traverse, 광선 검사, 재질 needsUpdate)',
                               '메모리 누수 — 구역을 오갈 때 해제되지 않는 기하·재질·텍스처·렌더 타깃·이벤트 리스너',
                               '셰이더를 다시 만들게 하는 것(재질 transparent 전환, 빛·그림자 개수 변화, onBeforeCompile 키)']),
    ('스테이지가 늘어날 때 구조상 문제', ['dock.js 한 파일에 몰린 것 중 공통으로 옮겨야 할 것', '구역 사이 상태(flags·탈·아이템) 넘기기', '부품 수·상자 수 한도(fadeMerge 64칸 등)']),
    ('CLAUDE.md 규칙과 실제 코드가 어긋나는 곳', ['규칙에 적힌 값(거리·시간·개수·예산)이 코드와 다른 곳', '규칙에 "하지 않는다"고 적힌 것을 코드가 하는 곳(예: 빛 개수 바꾸기, 안내 표시를 ui.hint 없이)', '규칙에 없는데 코드에만 있는 중요한 약속']),
]


def scrub(s):
    n = 0
    for pat, rep in [(r'/Users/[^/\s\'"`)]+', '~'), (r'\b192\.168\.\d+\.\d+\b', '<내부 IP>'), (r'\b[A-Za-z][\w.+-]*@[A-Za-z][\w-]*\.[A-Za-z]{2,}(?:\.[A-Za-z]{2,})?\b', '<전자우편>'),
                     (r'~/Downloads/Ref/\*-skills-bundle', '(로컬 스킬 묶음 폴더)'), (r'~/\.claude/skills/', '(로컬 스킬 폴더)'),
                     (r'(?i)\b(sk|xi)-[A-Za-z0-9]{16,}', '<토큰>')]:
        s, k = re.subn(pat, rep, s); n += k
    return s, n


def read(f):
    with open(os.path.join(ROOT, f), encoding='utf-8') as fh:
        return fh.read()


def lineof(f, pat):
    try:
        for i, l in enumerate(read(f).split('\n'), 1):
            if re.search(pat, l):
                return i
    except FileNotFoundError:
        return None
    return None


def aid(f):
    return 'f-' + re.sub(r'[^A-Za-z0-9]+', '-', f).strip('-')


def flink(f, line=None, label=None):
    t = html.escape(label or (f + (f':{line}' if line else '')))
    return f'<a href="#{aid(f)}{f"-L{line}" if line else ""}"><code>{t}</code></a>'


CSS = """
:root{--bg:#fbf8f2;--ink:#2d2620;--mut:#6f6357;--line:#e4dccf;--card:#fff;--acc:#7a5a2e;--code:#f6f1e8;--ln:#a8998a;--hl:#fff3cf}
@media (prefers-color-scheme:dark){:root{--bg:#1d1a17;--ink:#ece4d8;--mut:#a89c8f;--line:#3a342d;--card:#25211d;--acc:#e0b878;--code:#211e1a;--ln:#7d7166;--hl:#3b3220}}
*{box-sizing:border-box}html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.65 -apple-system,"Apple SD Gothic Neo","Noto Sans KR",system-ui,sans-serif;word-break:keep-all}
main{max-width:1100px;margin:0 auto;padding:24px 16px 80px}
h1{font-size:1.6rem;margin:.2rem 0 .3rem}h2{font-size:1.3rem;margin:2.4rem 0 .6rem;padding-top:.6rem;border-top:2px solid var(--line)}
h3{font-size:1.05rem;margin:1.6rem 0 .4rem}h4{margin:1rem 0 .3rem;font-size:.98rem}
.meta{color:var(--mut);font-size:.9rem}a{color:var(--acc)}code{font:13px/1.5 ui-monospace,Menlo,monospace;background:var(--code);padding:0 .25em;border-radius:3px}
nav.toc{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:12px 18px;margin:16px 0}
nav.toc ol{margin:.2rem 0;padding-left:1.3rem}nav.toc li{margin:.1rem 0}
table{border-collapse:collapse;width:100%;margin:.4rem 0;font-size:.92rem}th,td{border:1px solid var(--line);padding:5px 8px;text-align:left;vertical-align:top}
th{background:var(--code)}td.n{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
.box{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:12px 16px;margin:.6rem 0}
.file{margin:1.6rem 0;border:1px solid var(--line);border-radius:8px;background:var(--card);overflow:hidden}
.file h4{margin:0;padding:8px 12px;background:var(--code);border-bottom:1px solid var(--line);font:600 14px/1.4 ui-monospace,Menlo,monospace;position:sticky;top:0}
.file h4 span{font-weight:400;color:var(--mut);font-family:-apple-system,sans-serif;font-size:.85rem;margin-left:.6em}
pre.src{margin:0;padding:8px 0;font:12.5px/1.5 ui-monospace,Menlo,monospace;white-space:pre-wrap;word-break:break-all;overflow-wrap:anywhere}
pre.src .l{display:block;padding:0 12px 0 0}pre.src .l:target{background:var(--hl)}
pre.src .n{display:inline-block;width:4.2em;padding-right:.8em;text-align:right;color:var(--ln);user-select:none}
.top{font-size:.85rem;float:right}
"""


def page(title, body):
    return f'<!doctype html>\n<html lang="ko"><head><meta charset="utf-8"><meta name="robots" content="noindex, nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(title)}</title><style>{CSS}</style></head><body><main id="top">{body}</main></body></html>\n'


def code_block(f):
    src, n = scrub(read(f))
    lines = src.split('\n')
    if lines and lines[-1] == '':
        lines.pop()
    w = len(str(len(lines)))
    rows = ''.join(f'<span class="l" id="{aid(f)}-L{i}"><span class="n">{i:>{w}}</span>{html.escape(l)}</span>' for i, l in enumerate(lines, 1))
    head = f'<h4 id="{aid(f)}">{html.escape(f)}<span>{len(lines)}줄 · {html.escape(DESC.get(f, ""))}</span></h4>'
    return f'<section class="file">{head}<pre class="src">{rows}</pre></section>', n, len(lines)


def main():
    head_rev = git('rev-parse', '--short', 'HEAD').strip()
    import json
    ver = json.loads(read('version.json'))['v']
    today = datetime.date.today().isoformat()
    numstat = {}
    for l in git('diff', '--numstat', f'{BASE}...{BRANCH}', '--', '.', ':!assets', ':!docs').strip().split('\n'):
        if l:
            a, d, f = l.split('\t'); numstat[f] = (a, d)
    status = {}
    for l in git('diff', '--name-status', f'{BASE}...{BRANCH}', '--', '.', ':!assets', ':!docs').strip().split('\n'):
        if l:
            s, f = l.split('\t')[0], l.split('\t')[-1]; status[f] = s
    commits = [l for l in git('log', '--format=%h %s', f'{BASE}..{BRANCH}').split('\n') if l]

    # ---------- 코드 묶음 (크기에 따라 나누기) ----------
    blocks, scrubbed, nlines = [], 0, {}
    for k, t, fs in AREAS:
        items = []
        for f in fs:
            b, n, L = code_block(f); scrubbed += n; nlines[f] = L; items.append((f, b))
        blocks.append((k, t, items))

    # ---------- 1 검토 요청서 ----------
    ask = '<h2 id="s1">1. 검토 요청서 <a class="top" href="#top">↑ 목차</a></h2>'
    ask += ('<div class="box"><p>이 파일은 브라우저 게임 <b>원더룹</b>의 <code>world/fairy-forest</code> 브랜치(요정의 숲 STAGE 01) 코드 전체와 프로젝트 규칙(CLAUDE.md)입니다. '
            'Claude Code가 만든 코드를 다른 눈으로 교차 검증해 주세요. 2번 인덱스에 구조·흐름·규칙·시험·알려진 한계를 정리했고, 3번에 줄 번호가 붙은 코드 전체가 있습니다.</p>'
            '<p><b>봐 주실 것</b></p><ol>')
    for t, items in ASK:
        ask += f'<li><b>{html.escape(t)}</b><ul>' + ''.join(f'<li>{html.escape(x)}</li>' for x in items) + '</ul></li>'
    ask += ('</ol><p><b>답하는 형식</b> — 찾은 것마다 한 줄씩 목록으로:</p>'
            '<pre class="src" style="padding:8px 12px;background:var(--code);border-radius:6px">[심각|보통|사소] 파일:줄 (함수) — 무엇이 문제인지 · 어떤 상황에서 생기는지 · 고치는 방향</pre>'
            '<ul><li><b>심각</b>: 진행이 막히거나(갇힘·이야기 멈춤), 화면이 깨지거나, 휴대폰이 멈추거나 뜨거워지는 것, 메모리가 계속 늘어나는 것</li>'
            '<li><b>보통</b>: 특정 조건에서만 생기는 버그, 눈에 띄는 성능 낭비, 다음 스테이지에서 문제가 될 구조, 규칙과 코드가 어긋나는 곳</li>'
            '<li><b>사소</b>: 읽기 어려움, 죽은 코드, 작은 정리</li></ul>'
            '<p>확실하지 않은 것은 "추측"이라고 붙여 주세요. 2번 "알려진 한계"에 이미 적힌 것은 다시 적지 않아도 되지만, 우선순위 의견은 환영합니다. '
            '이 파일의 코드는 한 줄이 아주 긴 압축된 문체입니다(빌드 도구 없이 손으로 쓴 ES 모듈) — 문체 자체는 지적하지 않아도 됩니다.</p></div>')

    # ---------- 2 인덱스 ----------
    ix = '<h2 id="s2">2. 인덱스 <a class="top" href="#top">↑ 목차</a></h2>'
    ix += ('<h3 id="s2-1">2.1 프로젝트와 기술 구성</h3><div class="box">'
           '<p><b>원더룹</b> — 작은 탐험가 원더룹이 여러 상상 세계(개미굴 → 요정의 숲 → … → 우주)를 탐험하는 브라우저 3D 게임이자, 같은 엔진으로 찍는 탐방 영상 시리즈(어른 시청자 대상). '
           '이 저장소는 화풍·캐릭터의 기준 빌드이고, 지금 브랜치는 두 번째 세계 <b>요정의 숲</b>의 첫 스테이지 <b>이슬방울 선착장</b>입니다.</p><ul>'
           '<li>three.js <b>r186 (0.186.1)</b> ES 모듈, <code>index.html</code> importmap으로 jsDelivr에서 불러옴(+ OrbitControls·BufferGeometryUtils). 빌드 도구 없음.</li>'
           '<li>번호 모듈 <code>js/01~08</code>: <code>index.html</code>은 <code>08-main.js</code>만 불러오고 08이 01~07을 순서대로 import, 각 파일은 앞 번호에서만 import. 게임 공통 <code>js/game/</code>, 탈 <code>js/hoods/</code>, 구역 <code>js/zones/</code>.</li>'
           '<li>실행: 저장소 루트에서 <code>python3 tools/shot-server.py</code>(캐시 금지, 시험 촬영 저장) 또는 <code>python3 -m http.server 8000</code> → <code>http://localhost:8000/</code>. 모듈이라 file://로는 안 열림.</li>'
           '<li>주소 파라미터: <code>?zone=&lt;구역&gt;</code> 시작 구역(없으면 이 브랜치는 <code>fairy-dock</code>) · <code>?shot</code> 촬영 모드(고정 1/60초, <code>window.wlShot</code>, 늘 베이스캠프에서 시작) · '
           '<code>?quality=mobile|high</code> 품질 단계 · <code>?zonetest</code> 견본 구역 열기 · <code>?debug</code> 시험 단추·성능 상자 · <code>?capture=&lt;대본&gt;</code> 영상 캡처 · <code>?pr=</code> 픽셀 비율 비교.</li>'
           f'<li>이 자료: 브랜치 <code>{BRANCH}</code> 커밋 <code>{head_rev}</code>, 버전 <code>{html.escape(ver)}</code>, 만든 날 {today}.</li></ul></div>')

    ix += '<h3 id="s2-2">2.2 파일 지도</h3>'
    for k, t, items in blocks:
        ix += f'<h4>{html.escape(t)}</h4><table><tr><th style="width:30%">파일</th><th style="width:8%">줄</th><th>하는 일</th></tr>'
        for f, _ in items:
            ix += f'<tr><td>{flink(f)}</td><td class="n">{nlines[f]}</td><td>{html.escape(DESC.get(f, ""))}</td></tr>'
        ix += '</table>'

    ix += f'<h3 id="s2-3">2.3 main 대비 {BRANCH}에서 바뀐 것</h3>'
    ix += '<details class="box"><summary>이 브랜치의 커밋 ' + str(len(commits)) + '개 (최근 것부터)</summary><ul>' + ''.join(f'<li><code>{html.escape(c[:7])}</code> {html.escape(c[8:])}</li>' for c in commits) + '</ul></details>'
    ix += '<table><tr><th style="width:28%">파일</th><th style="width:7%">상태</th><th style="width:9%">+ / −</th><th>바뀐 내용</th></tr>'
    for f in sorted(status, key=lambda x: (status[x] != 'A', x)):
        s = {'A': '새 파일', 'M': '바뀜', 'D': '지움'}.get(status[f], status[f])
        a, d = numstat.get(f, ('', ''))
        what = CHANGED.get(f) if status[f] != 'A' else DESC.get(f, '')
        link = flink(f) if f in nlines else f'<code>{html.escape(f)}</code>'
        ix += f'<tr><td>{link}</td><td>{s}</td><td class="n">+{a} / −{d}</td><td>{html.escape(what or "")}</td></tr>'
    ix += '</table>'

    ix += '<h3 id="s2-4">2.4 핵심 흐름</h3>'
    for t, desc, refs in FLOWS:
        ix += f'<h4>{html.escape(t)}</h4><div class="box"><p>{html.escape(desc)}</p><ul>'
        for f, pat, label in refs:
            ln = lineof(f, pat)
            ix += f'<li>{flink(f, ln)} — {html.escape(label)}</li>'
        ix += '</ul></div>'

    ix += '<h3 id="s2-5">2.5 규칙과 예산 요약 (CLAUDE.md)</h3><div class="box"><ul>' + ''.join(f'<li>{html.escape(r)}</li>' for r in RULES) + f'</ul><p>전체 규칙: {flink("CLAUDE.md")}</p></div>'
    ix += '<h3 id="s2-6">2.6 자동 시험</h3><table><tr><th style="width:28%">시험</th><th style="width:24%">여는 곳</th><th>잡는 것</th></tr>'
    for f, where, what in TESTS:
        first = f.split(' ')[0]
        link = flink(first, label=f) if first in nlines else f'<code>{html.escape(f)}</code>'
        ix += f'<tr><td>{link}</td><td><code>{html.escape(where)}</code></td><td>{html.escape(what)}</td></tr>'
    ix += ('</table><p class="meta">이번 커밋 기준 결과: 규칙 13/13 통과, 기준 23장·동작 282장 이전과 바이트까지 같음, 휴대폰 확인 모두 통과, '
           '가림 시험 PC·휴대폰 단계 6장면 통과(고치기 전 코드는 집 벽 장면에서 원더룹 화소 29%가 어두워져 실패).</p>')
    ix += '<h3 id="s2-7">2.7 알려진 한계와 남은 일</h3><div class="box"><ul>' + ''.join(f'<li>{html.escape(x)}</li>' for x in LIMITS) + '</ul></div>'

    # ---------- 목차 ----------
    def toc(code_parts):
        t = '<nav class="toc"><b>목차</b><ol><li><a href="#s1">검토 요청서</a></li><li><a href="#s2">인덱스</a><ol>'
        t += ''.join(f'<li><a href="#s2-{i}">{n}</a></li>' for i, n in enumerate(['프로젝트와 기술 구성', '파일 지도', 'main 대비 바뀐 것', '핵심 흐름', '규칙과 예산 요약', '자동 시험', '알려진 한계와 남은 일'], 1))
        t += '</ol></li><li><a href="#s3">코드</a><ol>'
        for part, (k, ttl, items) in code_parts:
            href = '' if part == 1 else os.path.basename(OUT).replace('.html', f'-part{part}.html')
            t += f'<li><a href="{href}#a-{k}">{html.escape(ttl)}</a>{"" if part == 1 else f" <span class=meta>(파일 {part})</span>"} — ' + ', '.join(
                f'<a href="{href}#{aid(f)}">{html.escape(os.path.basename(f))}</a>' for f, _ in items) + '</li>'
        return t + '</ol></li></ol></nav>'

    # 나누기: 첫 파일 = 1·2 + 코드, 넘치면 영역 단위로 다음 파일
    parts, cur, size = [[]], 0, len(ask) + len(ix) + 60000
    for blk in blocks:
        bs = sum(len(b) for _, b in blk[2])
        if parts[cur] and size + bs > LIMIT:
            parts.append([]); cur += 1; size = 20000
        parts[cur].append(blk); size += bs
    code_parts = [(i + 1, blk) for i, p in enumerate(parts) for blk in p]

    title = '원더룹 요정의 숲 — GPT 교차 검증 자료'
    intro = (f'<h1>{title}</h1><p class="meta">브랜치 <code>{BRANCH}</code> · 커밋 <code>{head_rev}</code> · 버전 <code>{html.escape(ver)}</code> · {today} · '
             f'코드 {len(nlines)}개 파일 {sum(nlines.values()):,}줄 · 이미지·모델·사운드·기준 촬영 제외 · 민감한 값 {scrubbed}곳 지움'
             + (f' · 전체 {len(parts)}개 파일 중 1' if len(parts) > 1 else '') + '</p>')
    outs = []
    for i, p in enumerate(parts, 1):
        body = (intro + toc(code_parts) + ask + ix) if i == 1 else (f'<h1>{title} — 코드 {i}/{len(parts)}</h1><p class="meta">1·2번(검토 요청서·인덱스)은 첫 파일에 있습니다.</p>' + toc(code_parts))
        body += f'<h2 id="s3">3. 코드{"" if len(parts) == 1 else f" ({i}/{len(parts)})"} <a class="top" href="#top">↑ 목차</a></h2>'
        for k, t, items in p:
            body += f'<h3 id="a-{k}">{html.escape(t)}</h3>' + ''.join(b for _, b in items)
        path = OUT if i == 1 else OUT.replace('.html', f'-part{i}.html')
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, 'w', encoding='utf-8') as fh:
            fh.write(page(title, body))
        outs.append(path)
    for p in outs:
        print(os.path.relpath(p, ROOT), f'{os.path.getsize(p) / 1024 / 1024:.2f} MB')
    print('민감한 값 지움:', scrubbed, '· 파일', len(nlines), '· 줄', sum(nlines.values()))


if __name__ == '__main__':
    main()
