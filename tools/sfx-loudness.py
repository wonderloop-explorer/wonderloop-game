# -*- coding: utf-8 -*-
"""효과음 크기 재기 (2026-11-05, 공통 틀 6단계) — 촬영 서버(8000)가 떠 있을 때 저장소 루트에서:
   python3 tools/sfx-loudness.py [--out docs/sfx-loudness.json]
   공통 묶음(js/sfx/common.js)과 세계 전용 묶음(js/sfx/<세계>.js)의 소리를 하나씩 OfflineAudioContext(48kHz)로 그려
   최고값(dBFS)·가장 큰 50ms 구간 RMS(dBFS, '크기')·길이를 잰다(무작위가 섞인 소리라 6번 평균). 묶음 버스(효과음 0.9·전체 0.85)는 빼고 소리 자체만.
   새 소리는 같은 묶음 원본 소리와 '크기' 차이가 3dB 안이 되게 맞춘다(docs/sfx-list.md). 소리는 밖으로 나오지 않는다(그리기만)."""
import json, os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
a = sys.argv[1:]
OUT = os.path.join(ROOT, a[a.index('--out') + 1] if '--out' in a else 'docs/sfx-loudness.json')
JS = r"""async()=>{const C=await import('/js/sfx/common.js'),A=await import('/js/sfx/index.js');const out={};
  const packs=[['공통',C.KINDS,C.SOUNDS],...Object.entries(A.WORLD_SFX).map(([w,m])=>[w,m.KINDS,m.SOUNDS])];
  for(const [pack,K,S] of packs)for(const k in K){const s=S[k];let pk=0,ld=0;const N=6;
    for(let r=0;r<N;r++){const sr=48000,len=Math.ceil((s.dur+.4)*sr),c=new OfflineAudioContext(1,len,sr);s.play(c,c.destination);const b=await c.startRendering(),d=b.getChannelData(0);
      let p=0;for(let i=0;i<d.length;i++)p=Math.max(p,Math.abs(d[i]));const W=sr*.05;let best=0;for(let i=0;i+W<=d.length;i+=W/2){let q=0;for(let j=i;j<i+W;j++)q+=d[j]*d[j];best=Math.max(best,q/W);}
      pk+=p/N;ld+=Math.sqrt(best)/N;}
    const db=v=>v>0?+(20*Math.log10(v)).toFixed(1):-120;out[k]={묶음:K[k][0],모음:pack,소리:K[k][1],설명:K[k][2],길이_초:s.dur,최고_dBFS:db(pk),크기_dBFS:db(ld)};}
  return out;}"""
with sync_playwright() as p:
    b = p.chromium.launch(args=['--mute-audio'])
    pg = b.new_page(); pg.goto('http://localhost:8000/version.json')
    R = pg.evaluate(JS); b.close()
json.dump(R, open(OUT, 'w'), ensure_ascii=False, indent=1)
for k, v in R.items(): print(f"{v['모음']:<10} {v['묶음']:<4} {k:<16} {v['소리']:<12} {v['길이_초']:>5}s  최고 {v['최고_dBFS']:>6}  크기 {v['크기_dBFS']:>6}")
