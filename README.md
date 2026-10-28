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
| `tools/` | 촬영 서버, 기준 스크린샷 촬영 목록, 픽셀 비교 도구 |
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

## 애프터이펙트로 소리 배치하기

영상 캡처 모드는 영상과 함께 소리 시점 기록(`<대본>-16x9.cues.json`, `<대본>-9x16.cues.json`)을 남겨요. 나레이션·대사·효과음이 몇 초에, 얼마 동안, 누구의 어떤 대사로 나왔는지 적힌 파일이에요. 이걸 애프터이펙트 스크립트로 바꾸면 소리를 손으로 맞출 필요가 없어요.

```bash
python3 tools/cues-to-ae.py captures/santa/opening-16x9.cues.json captures/santa/opening-9x16.cues.json --sounds assets/sounds/santa
```

1. 위 명령이 cues.json 옆에 `opening.jsx`를 만들어요.
2. 애프터이펙트에서 **파일 → 스크립트 → 스크립트 파일 실행**으로 `opening.jsx`를 열어요.
3. 화면비마다 컴포지션이 하나씩 생겨요(16:9, 9:16). 맨 아래에 녹화 영상이 깔리고, 나레이션(초록)·대사(주황)·효과음(노랑) 파일이 기록된 시점에 레이어로 놓여요.
4. 대사·나레이션마다 마커에 "말한 이: 대사"가 적혀 있고, 마커 길이가 대사 길이예요. 아직 녹음하지 않은 대사는 영상 레이어에 마커만 있어요.
5. 못 찾은 파일이 있으면 마지막에 목록을 알려 줘요. 영상·소리를 다른 곳으로 옮겼다면 `.jsx` 옆에 같은 이름으로 두면 찾아요.

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
