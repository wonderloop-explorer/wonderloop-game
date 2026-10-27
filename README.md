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
