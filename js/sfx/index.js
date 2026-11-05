/* 원더룹 — 효과음 묶음 목록 (2026-11-05): 공통 묶음 + 세계 전용 묶음(세계 id → 묶음). 새 세계 전용 소리 = js/sfx/<세계>.js를 만들고 여기 한 줄. */
import * as common from './common.js';
import * as antvillage from './antvillage.js';
const WORLD_SFX={antvillage};
export {common,WORLD_SFX};
