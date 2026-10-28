/* 영상 캡처 견본 대본 — 견본 실내 (엔진 시험용, 세계 대본은 wonderloop-studio/<세계>/capture/ 에 둔다)
   http://localhost:8000/?shot&zonetest&capture=tools/capture/sample-indoor.js  (python3 tools/shot-server.py 로 띄운 뒤)
   구간마다 run(c)가 끝나면 다음 구간. c의 기능은 js/09-capture.js 맨 위 주석. */
export default {
  world: 'sample', script: '견본실내', zone: 'sample-indoor',
  setup: { outfit: 1, light: 0 }, flags: { compass: true },
  segments: [
    { name: '거실 도착', async run(c) {
      c.place(-4.6, 2.6, Math.PI * .9); c.camera('follow');
      await c.wait(1);
      await c.walk(-3, 1);          // 거실 한가운데 → 나레이션 → 안내 카드 (카드는 읽을 시간 뒤 저절로 닫힘)
      await c.settle(3);            // 나레이션·카드가 끝나고 3초 여운
    } },
    { name: '서재 손님', async run(c) {
      await c.talk('견본 손님');     // 손님 앞까지 걸어가서 말 걸기, 대사는 목소리 길이만큼 보여 주고 넘김
      await c.settle(1.5);
    } },
    { name: '방 전체', async run(c) {
      c.camera('room'); c.set({ action: '손 흔들기' });
      await c.title('견본 실내 탐방', { sec: 3.5 });   // 영상에 그려 넣음 (대본 burnTitles 기본 켜짐)
      await c.narrate('여기까지가 영상 캡처 견본이에요.');
      await c.settle(3);
      c.set({ action: '서기' });
    } },
    { name: '엔딩', burnTitles: true, async run(c) {   // 구간마다 burnTitles:false로 끄면 마커로만 남는다
      await c.ending('견본 탐험 끝', { sub: '다음 세계에서 만나요', sub2: '@wonderloop_explorer' });
    } },
  ],
};
