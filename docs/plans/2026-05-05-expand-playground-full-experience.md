# Expand Playground Full Experience Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expand `apps/playground` into a full multi-variant desktop showcase with real local audio assets and richer shared widget playback controls.

**Architecture:** Keep all page-shell and variant-specific storytelling in `apps/playground`, add a variant-aware showcase data layer there, and map it into reusable widget input. Extend `packages/core`, `packages/ui`, and `packages/widget` only where reusable soundboard metadata and playback behavior are required, so Vue and Shadow DOM entries stay feature-parity without absorbing playground-only layout concerns.

**Tech Stack:** pnpm workspace, TypeScript, Vue 3, Vite, Vitest, Tailwind CSS, Shadow DOM mount helper

---

### Task 1: Create an isolated worktree and capture the baseline

**Files:**
- Modify: `openspec/changes/expand-playground-full-experience/tasks.md`
- Reference: `docs/plans/2026-05-05-expand-playground-full-experience-design.md`

**Step 1: Create the worktree**

```bash
git worktree add ~/worktrees/soundboard/expand-playground-full-experience -b expand-playground-full-experience
```

**Step 2: Enter the worktree and confirm the branch**

```bash
cd ~/worktrees/soundboard/expand-playground-full-experience
git status --short --branch
```

Expected: branch `expand-playground-full-experience` with a clean working tree.

**Step 3: Run the current workspace checks once**

```bash
pnpm test && pnpm typecheck
```

Expected: current baseline behavior is known before feature work starts.

**Step 4: Mark Task 1.1 in OpenSpec only after you have reviewed the design and current files**

```md
- [x] 1.1 盤點 Stitch 主畫面需要承接的頁面區塊、視覺重點與展示文案
```

**Step 5: Commit the planning baseline**

```bash
git add docs/plans/2026-05-05-expand-playground-full-experience-design.md docs/plans/2026-05-05-expand-playground-full-experience.md
git commit -m "docs: add implementation plan for playground experience"
```

### Task 2: Extend core state for overlap, loop, random, and stop-all behavior

**Files:**
- Modify: `packages/core/src/soundboard.ts`
- Modify: `packages/core/src/index.ts`
- Test: `packages/core/test/soundboard-state.test.ts`
- Modify: `openspec/changes/expand-playground-full-experience/tasks.md`

**Step 1: Write the failing tests for the new playback state model**

```ts
test("defaults overlap and loop to off", () => {
  const state = createSoundboardState(soundboard);
  expect(state.allowOverlap).toBe(false);
  expect(state.loopEnabled).toBe(false);
  expect(state.activeItemIds).toEqual([]);
});

test("keeps multiple active sounds when overlap is enabled", () => {
  const initial = toggleOverlapPlayback(createSoundboardState(soundboard));
  const first = toggleSoundPlayback(soundboard, initial, "rain");
  const second = toggleSoundPlayback(soundboard, first, "wind");
  expect(second.activeItemIds).toEqual(["rain", "wind"]);
});
```

**Step 2: Run the focused core test**

```bash
pnpm --filter @soundboard/core test -- test/soundboard-state.test.ts
```

Expected: FAIL because the new state fields and helpers do not exist yet.

**Step 3: Implement the minimal reusable core model**

```ts
export interface SoundboardState {
  activeCategoryId: string | null;
  activeItemIds: string[];
  visibleItems: SoundboardItem[];
  allowOverlap: boolean;
  loopEnabled: boolean;
}

export function toggleOverlapPlayback(state: SoundboardState): SoundboardState {
  return { ...state, allowOverlap: !state.allowOverlap };
}
```

Also add helpers for loop toggling, random item selection from `visibleItems`, and stop-all state reset.

**Step 4: Re-run the focused core test**

```bash
pnpm --filter @soundboard/core test -- test/soundboard-state.test.ts
```

Expected: PASS for the new core state behavior.

**Step 5: Update the OpenSpec checklist**

```md
- [x] 3.1 擴充 `packages/core` / `packages/widget` 所需的顯示 metadata 與型別
```

**Step 6: Commit**

```bash
git add packages/core/src/soundboard.ts packages/core/src/index.ts packages/core/test/soundboard-state.test.ts openspec/changes/expand-playground-full-experience/tasks.md
git commit -m "feat: add reusable playback state controls"
```

### Task 3: Add reusable UI surfaces for richer sound cards and playback controls

**Files:**
- Create: `packages/ui/src/components/PlaybackControls.vue`
- Modify: `packages/ui/src/components/SoundItemCard.vue`
- Modify: `packages/ui/src/index.ts`
- Test: `packages/ui/test/playback-controls.test.ts`
- Modify: `openspec/changes/expand-playground-full-experience/tasks.md`

**Step 1: Write the failing UI test for the control bar**

```ts
test("renders overlap, loop, random, and stop-all controls", () => {
  const wrapper = mount(PlaybackControls, {
    props: {
      allowOverlap: false,
      loopEnabled: false,
      canStopAll: false,
    },
  });
  expect(wrapper.text()).toContain("Overlap");
  expect(wrapper.text()).toContain("Loop");
  expect(wrapper.get('button[data-action="stop-all"]').attributes("disabled")).toBeDefined();
});
```

**Step 2: Run the focused UI test**

```bash
pnpm --filter @soundboard/ui test -- test/playback-controls.test.ts
```

Expected: FAIL because the control component is missing.

**Step 3: Implement the control bar and expand card metadata rendering**

```vue
<PlaybackControls
  :allow-overlap="allowOverlap"
  :can-stop-all="canStopAll"
  :loop-enabled="loopEnabled"
  @toggle-overlap="emit('toggle-overlap')"
  @toggle-loop="emit('toggle-loop')"
  @play-random="emit('play-random')"
  @stop-all="emit('stop-all')"
/>
```

Update `SoundItemCard.vue` to render the richer reusable fields needed by the design, such as label/tag copy, supporting description, and thumbnail/visual slot if the chosen metadata requires it.

**Step 4: Re-run the focused UI test**

```bash
pnpm --filter @soundboard/ui test -- test/playback-controls.test.ts
```

Expected: PASS.

**Step 5: Update the OpenSpec checklist**

```md
- [x] 3.2 擴充 `packages/ui` 與 `packages/widget` 的呈現，支援設計稿需要的完整 soundboard 卡片資訊
```

**Step 6: Commit**

```bash
git add packages/ui/src/components/PlaybackControls.vue packages/ui/src/components/SoundItemCard.vue packages/ui/src/index.ts packages/ui/test/playback-controls.test.ts openspec/changes/expand-playground-full-experience/tasks.md
git commit -m "feat: add playback controls and richer sound cards"
```

### Task 4: Wire the widget to the new playback engine and shared controls

**Files:**
- Modify: `packages/widget/src/SoundboardWidget.vue`
- Modify: `packages/widget/src/types.ts`
- Modify: `packages/widget/src/index.ts`
- Test: `packages/widget/test/widget.test.ts`
- Modify: `openspec/changes/expand-playground-full-experience/tasks.md`

**Step 1: Write the failing widget tests for overlap, loop, random, and stop-all**

```ts
test("plays multiple sounds when overlap is enabled", async () => {
  const wrapper = mount(SoundboardWidget, { props: { soundboard } });
  await wrapper.get('[data-action="toggle-overlap"]').trigger("click");
  await wrapper.get('[data-sound-id="rain"]').trigger("click");
  await wrapper.get('[data-sound-id="wind"]').trigger("click");
  expect(wrapper.findAll('[aria-pressed="true"][data-sound-id]').length).toBe(2);
});
```

Add companion tests for loop forwarding to `Audio.loop`, random selection from visible items, and stop-all disabling when no sound is active.

**Step 2: Run the focused widget test**

```bash
pnpm --filter @soundboard/widget test -- test/widget.test.ts
```

Expected: FAIL because the widget only supports one active sound today.

**Step 3: Implement the minimal widget changes**

```ts
const activeAudios = new Map<string, HTMLAudioElement>();

function stopAllPlayback() {
  for (const audio of activeAudios.values()) {
    audio.pause();
    audio.currentTime = 0;
  }
  activeAudios.clear();
}
```

Update `SoundboardWidget.vue` to:
- consume the new core helpers
- render `PlaybackControls`
- support overlap and loop
- handle random playback from the visible category
- keep Vue and Shadow DOM entries in parity through the same props and render tree

**Step 4: Re-run the focused widget test**

```bash
pnpm --filter @soundboard/widget test -- test/widget.test.ts
```

Expected: PASS.

**Step 5: Update the OpenSpec checklist**

```md
- [x] 3.1 擴充 `packages/core` / `packages/widget` 所需的顯示 metadata 與型別
- [x] 3.2 擴充 `packages/ui` 與 `packages/widget` 的呈現，支援設計稿需要的完整 soundboard 卡片資訊
```

**Step 6: Commit**

```bash
git add packages/widget/src/SoundboardWidget.vue packages/widget/src/types.ts packages/widget/src/index.ts packages/widget/test/widget.test.ts openspec/changes/expand-playground-full-experience/tasks.md
git commit -m "feat: add advanced widget playback controls"
```

### Task 5: Add real sample audio assets, metadata, and showcase mapping

**Files:**
- Create: `apps/playground/public/audio/stream-intro.mp3`
- Create: `apps/playground/public/audio/chat-alert.mp3`
- Create: `apps/playground/public/audio/hype-burst.mp3`
- Create: `apps/playground/public/audio/soft-ambience.mp3`
- Create: `apps/playground/src/showcase/audioCatalog.ts`
- Create: `apps/playground/src/showcase/showcaseContent.ts`
- Create: `apps/playground/src/showcase/toSoundboardInput.ts`
- Test: `apps/playground/test/showcase-data.test.ts`
- Modify: `openspec/changes/expand-playground-full-experience/tasks.md`

**Step 1: Write the failing showcase data test**

```ts
test("maps the selected variant into widget-ready soundboard input", () => {
  const variant = showcaseVariants[0];
  const soundboard = toSoundboardInput(variant);
  expect(soundboard.items.every((item) => item.audioUrl.startsWith("/audio/"))).toBe(true);
});
```

**Step 2: Run the focused playground test**

```bash
pnpm --filter @soundboard/playground test -- test/showcase-data.test.ts
```

Expected: FAIL because the showcase data modules do not exist yet.

**Step 3: Add the real assets and the typed metadata catalog**

```ts
export const audioCatalog = {
  streamIntro: { path: "/audio/stream-intro.mp3", title: "Stream Intro" },
  chatAlert: { path: "/audio/chat-alert.mp3", title: "Chat Alert" },
} as const;
```

Create the variant-aware showcase content in `showcaseContent.ts`, then implement `toSoundboardInput.ts` so both page copy and widget props come from the same source of truth.

**Step 4: Re-run the focused playground test**

```bash
pnpm --filter @soundboard/playground test -- test/showcase-data.test.ts
```

Expected: PASS.

**Step 5: Update the OpenSpec checklist**

```md
- [x] 1.2 在 `apps/playground` 建立完整頁面所需的展示資料模型與靜態內容定義
- [x] 1.3 建立從 playground 展示資料派生 widget 輸入的轉換邏輯
- [x] 2.1 準備一組可提交且可合法使用的真實範例音檔
- [x] 2.2 將範例音檔放入穩定的靜態資產路徑並建立對應 metadata
- [x] 2.3 讓 playground 與 widget 都改用本地範例音檔而非 placeholder URL
```

**Step 6: Commit**

```bash
git add apps/playground/public/audio apps/playground/src/showcase/audioCatalog.ts apps/playground/src/showcase/showcaseContent.ts apps/playground/src/showcase/toSoundboardInput.ts apps/playground/test/showcase-data.test.ts openspec/changes/expand-playground-full-experience/tasks.md
git commit -m "feat: add showcase data and local sample audio"
```

### Task 6: Rebuild `apps/playground` into the full variant-switching experience page

**Files:**
- Create: `apps/playground/src/components/VariantSelector.vue`
- Create: `apps/playground/src/components/PlaygroundHero.vue`
- Create: `apps/playground/src/components/PlaygroundSection.vue`
- Modify: `apps/playground/src/App.vue`
- Modify: `apps/playground/src/styles.css`
- Test: `apps/playground/test/app.test.ts`
- Modify: `openspec/changes/expand-playground-full-experience/tasks.md`

**Step 1: Write the failing app-level test**

```ts
test("switches variants and keeps Vue and Shadow DOM widgets in sync", async () => {
  const wrapper = mount(App);
  await wrapper.get('[data-variant-id="secondary"]').trigger("click");
  expect(wrapper.text()).toContain("Shadow DOM");
  expect(wrapper.text()).toContain("Vue component");
});
```

**Step 2: Run the focused app test**

```bash
pnpm --filter @soundboard/playground test -- test/app.test.ts
```

Expected: FAIL because the full-page variant UI does not exist yet.

**Step 3: Implement the page shell with a shared active variant**

```vue
<VariantSelector
  :active-variant-id="activeVariantId"
  :variants="showcaseVariants"
  @variant-change="activeVariantId = $event"
/>

<SoundboardWidget :soundboard="activeSoundboard" />
<div ref="mountTarget" />
```

Refactor `App.vue` so:
- both widget entries consume the same derived `activeSoundboard`
- variant-specific page copy comes from the same showcase module
- page-shell sections stay local to `apps/playground`

**Step 4: Re-run the focused app test**

```bash
pnpm --filter @soundboard/playground test -- test/app.test.ts
```

Expected: PASS.

**Step 5: Update the OpenSpec checklist**

```md
- [x] 3.3 重構 `apps/playground` 為完整 desktop 體驗頁，保留 Vue 與 Shadow DOM 兩種 widget 展示
- [x] 3.4 確認完整頁面殼層責任仍留在 `apps/playground`，不回灌到 widget package
```

**Step 6: Commit**

```bash
git add apps/playground/src/components/VariantSelector.vue apps/playground/src/components/PlaygroundHero.vue apps/playground/src/components/PlaygroundSection.vue apps/playground/src/App.vue apps/playground/src/styles.css apps/playground/test/app.test.ts openspec/changes/expand-playground-full-experience/tasks.md
git commit -m "feat: build the full playground experience page"
```

### Task 7: Final verification, asset checks, and OpenSpec completion

**Files:**
- Modify: `openspec/changes/expand-playground-full-experience/tasks.md`
- Modify: `docs/plans/2026-05-05-expand-playground-full-experience-design.md`

**Step 1: Run the focused package checks**

```bash
pnpm --filter @soundboard/core test
pnpm --filter @soundboard/ui test
pnpm --filter @soundboard/widget test
pnpm --filter @soundboard/playground test
```

Expected: PASS for all targeted tests.

**Step 2: Run build and typecheck**

```bash
pnpm build
pnpm typecheck
```

Expected: workspace build artifacts emit successfully and TypeScript stays clean.

**Step 3: Verify sample audio resolution in dev and build**

```bash
pnpm --filter @soundboard/playground build
pnpm --filter @soundboard/playground dev
```

Expected: built assets reference `/audio/*.mp3` correctly, and manual browser verification confirms play, overlap toggle, loop toggle, random, and stop-all behavior.

**Step 4: Close out the OpenSpec checklist**

```md
- [x] 4.1 補上展示資料、widget 互動與音檔引用的測試
- [x] 4.2 驗證範例音檔在 dev 與 build 後輸出中都能正常載入與播放
- [x] 4.3 執行標準 workspace 驗證 task，整理未納入本次 change 的後續畫面變體待辦
```

Also append a short note describing any remaining variant polish intentionally left out of this change.

**Step 5: Commit**

```bash
git add openspec/changes/expand-playground-full-experience/tasks.md docs/plans/2026-05-05-expand-playground-full-experience-design.md
git commit -m "chore: finish playground experience change"
```
