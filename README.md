# 원더룹 게임 (베이스캠프 기준 빌드)

원더룹 탐험 게임과 탐방 영상의 기준이 되는 3D 장면입니다. 파스텔 색연필 로우폴리 화풍의 베이스캠프 방과, 확정된 원더룹 캐릭터(지그재그 단발, 평상복/탐험복, 탈, 표정 6종, 동작 9종)가 들어 있습니다.

## 바로 실행하기

브라우저 보안 때문에 `index.html`을 더블클릭하면 스크립트가 안 열릴 수 있어요. 폴더에서 간단한 로컬 서버를 띄워 주세요.

```bash
cd wonderloop-game
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000 열기
```

## GitHub Pages로 올리기

1. GitHub에서 새 저장소를 만듭니다 (예: `wonderloop-game`).
2. 이 폴더의 파일을 모두 올립니다 (`index.html`이 저장소 맨 위에 있어야 해요).
3. 저장소 **Settings → Pages**에서 Source를 `main` 브랜치 `/ (root)`로 지정합니다.
4. 1~2분 뒤 `https://<아이디>.github.io/wonderloop-game/`에서 열립니다.

## Claude Code로 이어서 작업하기

```bash
cd wonderloop-game
claude
```

Claude Code는 시작할 때 `CLAUDE.md`를 읽고 프로젝트 규칙과 다음 작업 순서를 파악합니다. 첫 요청은 이렇게 하면 됩니다.

> CLAUDE.md의 로드맵 1번부터 진행해 줘. 작업 전에 계획을 먼저 보여 줘.

## 폴더 구성

| 경로 | 내용 |
|---|---|
| `index.html` | 페이지 뼈대, 화면 UI, 스크립트 불러오기 |
| `js/01-textures.js` ~ `js/08-main.js` | 장면 코드 (번호 순서대로 불러옴) |
| `assets/sheets/` | 캐릭터 시트 v2, 표정·동작 세트, 어두운 곳 가독성 비교 |
| `assets/models/` | 확정 캐릭터 GLB (평상복, 탐험복, 탐험복+모자) |
| `CLAUDE.md` | 프로젝트 규칙과 다음 작업 로드맵 (Claude Code용) |
