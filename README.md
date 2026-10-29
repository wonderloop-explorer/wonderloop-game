# 원더룹 게임 (베이스캠프 기준 빌드)

**플레이 주소:** https://wonderloop-explorer.github.io/wonderloop-game/

원더룹 탐험 게임과 탐방 영상의 기준이 되는 3D 장면입니다. 파스텔 색연필 로우폴리 화풍의 베이스캠프 방과, 확정된 원더룹 캐릭터(지그재그 단발, 평상복/탐험복, 탈, 표정 6종, 동작 9종)가 들어 있습니다.

## 바로 실행하기

브라우저 보안 때문에 `index.html`을 더블클릭하면 스크립트(ES 모듈)가 열리지 않아요. 폴더에서 간단한 로컬 서버를 띄워 주세요.

```bash
cd wonderloop-game
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000 열기
```

## 저장소와 배포

- 저장소: https://github.com/wonderloop-explorer/wonderloop-game (원더룹 전용 조직 `wonderloop-explorer`)
- 배포: GitHub Pages (`main` 브랜치, `/ (root)`). `main`에 올리면 1~2분 뒤 자동으로 반영됩니다.
- 커밋 전에 `python3 tools/stamp.py`로 파일 버전 표시를 새로 합니다. 방문자 브라우저가 옛 파일을 섞어 쓰지 않게 하는 장치예요. 한 번 `git config core.hooksPath tools/hooks`를 해 두면 커밋할 때 저절로 됩니다.

## Claude Code로 이어서 작업하기

```bash
git clone https://github.com/wonderloop-explorer/wonderloop-game.git
cd wonderloop-game
claude
```

Claude Code는 시작할 때 `CLAUDE.md`를 읽고 프로젝트 규칙과 다음 작업 순서를 파악합니다. 첫 요청은 이렇게 하면 됩니다.

> CLAUDE.md의 로드맵 1번부터 진행해 줘. 작업 전에 계획을 먼저 보여 줘.

## 폴더 구성

| 경로 | 내용 |
|---|---|
| `index.html` | 페이지 뼈대, 화면 UI, 스크립트 불러오기 |
| `js/01-textures.js` ~ `js/08-main.js` | 장면 코드 (ES 모듈, `08-main.js`가 01~07을 번호 순서대로 import) |
| `js/09-capture.js` | 영상 캡처 모드 (`?shot&capture=…`일 때만 불러옴) |
| `js/game/` | 게임 공통 시스템: 대화·나레이션·이벤트·카드·결과 화면 |
| `tools/` | 촬영 서버, 기준 스크린샷 촬영 목록, 픽셀 비교 도구, 영상 캡처 견본 대본(`tools/capture/`), 애프터이펙트 변환 |
| `docs/baseline/` | 비교 기준 스크린샷과 드로우콜 통계 |
| `assets/sheets/` | 캐릭터 시트 v2, 표정·동작 세트, 어두운 곳 가독성 비교 |
| `assets/models/` | 확정 캐릭터 GLB (평상복, 탐험복, 탐험복+모자)와 뼈대 포함 GLB(`wonderloop-rigged*.glb`) |
| `CLAUDE.md` | 프로젝트 규칙과 다음 작업 로드맵 (Claude Code용) |

## 새 구역 추가하기

탐험지(세계)는 구역(zone) 단위로 만들어요. 베이스캠프가 첫 구역이고, `js/zones/`에 야외·실내 견본이 있어요. 견본 구역은 확인용이라 주소 끝에 `?zonetest`를 붙였을 때만 들어갈 수 있어요. 그때 구역을 차례로 바꾸는 단추가 나오고, `?zonetest&zone=sample-outdoor`처럼 붙이면 그 구역에서 시작해요. 실제 구역은 목록에 넣으면 일반 주소에서도 열려요.

1. 견본을 복사해 `js/zones/<이름>.js`를 만듭니다. 넓은 땅이면 `sample-outdoor.js`, 방 여러 개면 `sample-indoor.js`를 복사해요.
2. `js/02-zone.js`의 `ZONES` 목록에 한 줄 더합니다.

```js
'ant-tunnel':()=>import('./zones/ant-tunnel.js'),
```

3. `build()` 안에서 소품을 만들고, 끝에서 구역 정보를 돌려줍니다.
   - `spawn`: 원더룹이 처음 서는 자리
   - `areas`: 방마다 걸을 수 있는 범위·장애물·카메라. 실내는 방 여러 개, 야외는 하나
   - `doors`: 밟으면 다른 구역으로 넘어가는 자리
   - `sun`: 해 방향과 그림자 범위
   - `groundY`: (야외) 땅 높이
   - 난수는 `rng('<이름>:…')`처럼 이름을 붙여 씁니다. 그래야 다른 구역 그림이 바뀌지 않아요.
4. 다른 구역에서 들어오는 문을 만듭니다. 예를 들어 베이스캠프의 `doors`에 `{rect:[…], to:'<이름>'}`을 더해요.
5. 텍스처를 굽습니다(`tools/bake-textures.js`). 구역마다 `assets/textures/<이름>/` 묶음이 생겨요.
6. 기준 스크린샷을 찍어 `docs/baseline/<이름>/`에 남깁니다.

## 영상 캡처하기

탐방 영상은 게임을 직접 녹화하지 않고, 대본대로 게임을 한 프레임씩 진행하며 찍어요. 컴퓨터가 느려도 영상은 끊기지 않고, 몇 번을 찍어도 같은 그림이 나와요.

```bash
python3 tools/shot-server.py
```

1. 촬영 서버를 띄우고 크롬에서 `http://localhost:8000/?shot&zonetest&capture=tools/capture/sample-indoor.js`를 열어요(견본). 세계 대본은 `?shot&capture=/studio/santa/capture/opening.js`처럼 열어요. 촬영 서버가 저장소 옆 `wonderloop-studio` 폴더를 `/studio/`로 보여 줘요.
2. 왼쪽 위 패널에서 **16:9 녹화**, **9:16 녹화**, **둘 다 녹화** 중 하나를 눌러요. 화면비마다 새 페이지에서 처음부터 찍으니, 녹화가 끝날 때까지 탭을 그대로 두세요(견본 32초가 화면비마다 약 20초).
3. `captures/<세계>/`에 세 파일이 생겨요.
   - `<대본>-16x9.mp4`: 1920×1080, 30fps, 소리 없음. 9:16은 1080×1920.
   - `<대본>-16x9.cues.json`: 소리 시점 기록. 대사·나레이션·효과음·카드·타이틀·구간.
   - `<대본>-16x9.check.json`: 구간별 자동 확인표. 패널에도 표로 나와요.
4. 확인표 항목은 게임 표시 숨김, 카메라 가림, 타이틀과 원더룹 겹침, 원더룹이 잘 보이는지, 같은 장면 반복, 소리 끊김, 타이틀 3초 이상, 나레이션 뒤 3초 여운이에요. "고칠 것"이 나오면 대본의 카메라·동선·기다리는 시간을 고쳐서 다시 찍어요.

영상에는 3D 장면과 타이틀·엔딩 로고만 들어가요. 로고는 개미굴 게임 첫 화면 모양으로 영상에 직접 그려요. 대본에서 `burnTitles:false`로 끄면 마커로만 남아요(대본 전체, 구간마다, `c.title(…, {burn:false})` 한 번마다). 대화창·안내 카드·결과창·비밀 카드·말풍선·걷기 표시 같은 게임 안내는 그려지지 않고, 대신 마커로 남아 편집 때 자막·카드로 얹어요. 프레임 PNG가 필요하면 주소에 `&png`를 붙여요(`<대본>-16x9-png/`).

## 휴대폰 확인하기

구역 하나를 끝낼 때마다 휴대폰 확인을 해요. 먼저 컴퓨터에서 자동 확인을 돌리고, 그다음 아이폰으로 직접 봐요(순서는 CLAUDE.md "휴대폰 확인 순서").

1. 크롬 개발자 도구에서 기기 모드를 iPhone(390×844 세로)으로 두고 `http://localhost:8000/?shot&zone=<구역>`을 열어요.
2. 콘솔에서 `(await import('/tools/phone-check.js')).run()`을 실행하면 표가 나와요. 원더룹 크기, 대화창·카드 가림, 빛 번짐(하얗게 날아간 화소), 소리 설정이 들어 있어요.
3. 아이폰에서는 세로 화면 가림, 빛 번짐(밝기 최대), 무음 모드 소리를 직접 확인해요.

## 애프터이펙트로 소리 배치하기

영상 캡처 모드는 영상과 함께 소리 시점 기록(`<대본>-16x9.cues.json`, `<대본>-9x16.cues.json`)을 남겨요. 나레이션·대사·효과음이 몇 초에, 얼마 동안, 누구의 어떤 대사로 나왔는지 적힌 파일이에요. 이걸 애프터이펙트 스크립트로 바꾸면 소리를 손으로 맞출 필요가 없어요.

```bash
python3 tools/cues-to-ae.py captures/santa/opening-16x9.cues.json captures/santa/opening-9x16.cues.json --sounds assets/sounds/santa
```

1. 위 명령이 cues.json 옆에 `opening.jsx`를 만들어요.
2. 애프터이펙트에서 **파일 → 스크립트 → 스크립트 파일 실행**으로 `opening.jsx`를 열어요.
3. 화면비마다 컴포지션이 하나씩 생겨요(16:9, 9:16). 맨 아래에 녹화 영상이 깔리고, 나레이션(초록)·대사(주황)·효과음(노랑) 파일이 기록된 시점에 레이어로 놓여요.
4. 대사·나레이션마다 마커에 "말한 이: 대사"가 적혀 있고, 마커 길이가 대사 길이예요. 아직 녹음하지 않은 대사는 영상 레이어에 마커만 있어요.
5. 타이틀과 안내 카드는 영상 레이어 마커("타이틀: …", "카드 · 미션: 제목 / 설명")로, 구간은 컴포지션 마커(▶ 구간 이름)로 놓여요.
6. 못 찾은 파일이 있으면 마지막에 목록을 알려 줘요. 폴더째 옮겨도 `.jsx` 기준 같은 자리(예: 옆의 `sounds/`)나 `.jsx` 옆의 같은 이름에서 찾아요.

영상·소리 시점 기록·`.jsx`는 공개 저장소에 올리지 않아요(`captures/`는 `.gitignore`). 보관은 비공개 저장소 `wonderloop-studio`나 PC에 해요.

## 텍스처를 포토샵으로 고치는 방법

색연필 텍스처는 `assets/textures/<묶음>/`(캐릭터는 `character`, 베이스캠프는 `basecamp`)에 WebP 파일로 구워져 있어요. 어떤 파일이 어떤 텍스처인지는 `docs/bake/texture-index.jpg`에서 볼 수 있어요.

1. 고칠 파일을 포토샵(23.2 이상, WebP 지원)으로 엽니다. 색 모드는 RGB 8비트, 작업 색공간은 sRGB 그대로 둡니다.
2. 이미지 크기는 바꾸지 않습니다. 특히 캐릭터 텍스처는 256×256이어야 해요(방 텍스처는 바꿔도 됩니다).
3. 덧칠합니다. 반복해서 깔리는 텍스처라 가장자리가 반대쪽과 이어져야 해요. 가장자리를 칠할 때는 **필터 → 기타 → 오프셋**(가로·세로 절반, 둘러싸기)으로 이음매를 가운데로 옮겨 확인하세요.
4. **파일 → 다른 이름으로 저장 → WebP**, **무손실(Lossless)** 을 골라 같은 이름으로 덮어씁니다. PNG로 저장해도 되는데, 그때는 같은 폴더 `textures.json`에서 그 텍스처 줄의 `"file"`을 `.png` 이름으로 고쳐 주세요.
5. `textures.json`의 그 줄에 `"hand": true`를 넣습니다. 굽기 도구를 다시 돌려도 손으로 고친 파일은 덮어쓰지 않아요. 깜빡해도 굽기 도구가 파일이 바뀐 걸 알아채고 저절로 붙여요.
6. 로컬 서버로 열어 확인한 뒤 커밋합니다. 커밋 훅(`git config core.hooksPath tools/hooks`)을 켜 두면 파일 버전 표시가 저절로 새로 붙고, 아니면 `python3 tools/stamp.py`를 먼저 돌려요.

원래 그림으로 되돌리려면 그 파일을 지우고 `textures.json`에서 `"hand": true`를 지운 뒤, 굽기 도구(`tools/bake-textures.js`)를 다시 돌립니다.

## 뼈대 포함 모델을 블렌더에서 열기

`assets/models/`의 뼈대 포함 GLB는 게임 속 원더룹과 같은 뼈 이름(`hips`, `spine`, `thigh.L`, `forearm.R`, `neck`, `head` …)을 씁니다.

| 파일 | 모습 |
|---|---|
| `wonderloop-rigged.glb` | 평상복 |
| `wonderloop-rigged-explorer.glb` | 탐험복 (배낭 나침반 키링 뼈 `charm` 포함) |
| `wonderloop-rigged-explorer-hat.glb` | 탐험복 + 모자 |

1. 블렌더에서 **File → Import → glTF 2.0 (.glb/.gltf)** 로 파일을 엽니다.
2. 아웃라이너에서 `wonderloop` 아마추어를 고르고 **Ctrl+Tab**(Pose Mode)으로 바꿉니다.
3. 뼈를 하나 골라 **R**로 돌려 봅니다. 예를 들어 `upperarm.R`을 돌리면 오른팔이, `neck`을 돌리면 고개가 따라 움직입니다. 부품은 모두 뼈 하나에 100% 붙어 있어 관절에서 휘지 않고 통째로 돌아갑니다.
4. 뼈가 메시에 가려 안 보이면 아마추어의 **Object Data → Viewport Display → In Front**를 켭니다.

가져올 때 생기는 `Icosphere`는 블렌더 glTF 가져오기가 뼈 모양 표시용으로 만드는 것이라 지워도 됩니다. 모델을 다시 만들려면 `python3 tools/shot-server.py`를 띄우고 `http://localhost:8000/?shot`의 콘솔에서 `(await import('/tools/export-glb.js')).run()`을 실행합니다.
