<script setup lang="ts">
import {
  activateRandomSound,
  createSoundboardState,
  selectSoundboardCategory,
  stopAllSounds,
  toggleLoopPlayback,
  toggleOverlapPlayback,
  toggleActiveSound,
} from "@soundboard/core";
import { CategoryTabs, PlaybackControls, SoundItemCard, cn } from "@soundboard/ui";
import { computed, onBeforeUnmount, ref, watch } from "vue";

import type { SoundboardItem, SoundboardState } from "@soundboard/core";
import type { SoundboardWidgetProps } from "./types";

defineOptions({
  name: "SoundboardWidget",
});

const props = withDefaults(defineProps<SoundboardWidgetProps>(), {
  className: "",
});

const state = ref(createSoundboardState(props.soundboard));
const activeAudioByItemId = new Map<string, HTMLAudioElement>();

const categories = computed(() => props.soundboard.categories);
const canStopAll = computed(() => state.value.activeItemIds.length > 0);
const visibleItems = computed(() => state.value.visibleItems);

function stopAudio(itemId: string) {
  const audio = activeAudioByItemId.get(itemId);

  if (audio === undefined) {
    return;
  }

  audio.pause();
  audio.currentTime = 0;
  activeAudioByItemId.delete(itemId);
}

function stopAudioSet(itemIds: readonly string[]) {
  for (const itemId of itemIds) {
    stopAudio(itemId);
  }
}

function stopAllPlayback() {
  stopAudioSet([...activeAudioByItemId.keys()]);
}

function clearActiveItem(itemId: string) {
  state.value = {
    ...state.value,
    activeItemIds: state.value.activeItemIds.filter((activeItemId) => activeItemId !== itemId),
  };
}

function findItem(itemId: string) {
  const item = props.soundboard.items.find((entry) => entry.id === itemId);

  if (item === undefined) {
    throw new Error(`Unknown sound item id: ${itemId}`);
  }

  return item;
}

function handlePlaybackSettled(itemId: string) {
  activeAudioByItemId.delete(itemId);

  if (state.value.activeItemIds.includes(itemId)) {
    clearActiveItem(itemId);
  }
}

function syncLoopState(loopEnabled: boolean) {
  for (const audio of activeAudioByItemId.values()) {
    audio.loop = loopEnabled;
  }
}

async function startAudio(item: SoundboardItem, loopEnabled: boolean) {
  const nextAudio = new Audio(item.audioUrl);

  nextAudio.loop = loopEnabled;
  nextAudio.addEventListener("ended", () => {
    handlePlaybackSettled(item.id);
  });
  nextAudio.addEventListener("error", () => {
    handlePlaybackSettled(item.id);
  });

  activeAudioByItemId.set(item.id, nextAudio);

  try {
    await nextAudio.play();
  } catch (error) {
    console.error("Failed to play soundboard audio", error);
    stopAudio(item.id);
    clearActiveItem(item.id);
  }
}

async function applyStateTransition(nextState: SoundboardState) {
  const previousActiveItemIds = new Set(state.value.activeItemIds);
  const nextActiveItemIds = new Set(nextState.activeItemIds);

  stopAudioSet(
    state.value.activeItemIds.filter((itemId) => !nextActiveItemIds.has(itemId)),
  );

  state.value = nextState;
  syncLoopState(state.value.loopEnabled);

  for (const itemId of nextState.activeItemIds) {
    if (previousActiveItemIds.has(itemId)) {
      continue;
    }

    await startAudio(findItem(itemId), state.value.loopEnabled);
  }
}

async function handleCategoryChange(categoryId: string) {
  if (categoryId === state.value.activeCategoryId) {
    return;
  }

  await applyStateTransition(
    selectSoundboardCategory(props.soundboard, state.value, categoryId),
  );
}

async function handleTogglePlay(item: SoundboardItem) {
  await applyStateTransition(toggleActiveSound(props.soundboard, state.value, item.id));
}

async function handleToggleOverlap() {
  await applyStateTransition(toggleOverlapPlayback(state.value));
}

async function handleToggleLoop() {
  await applyStateTransition(toggleLoopPlayback(state.value));
}

async function handlePlayRandom() {
  await applyStateTransition(activateRandomSound(props.soundboard, state.value));
}

async function handleStopAll() {
  await applyStateTransition(stopAllSounds(state.value));
}

watch(
  () => props.soundboard,
  () => {
    stopAllPlayback();
    state.value = createSoundboardState(props.soundboard);
  },
  { deep: true },
);

onBeforeUnmount(() => {
  stopAllPlayback();
});
</script>

<template>
  <section
    :class="
      cn(
        'space-y-6 rounded-[28px] border border-white/10 bg-slate-950/95 p-6 text-white shadow-2xl shadow-slate-950/40',
        props.className,
      )
    "
  >
    <div class="space-y-2">
      <p class="text-sm uppercase tracking-[0.24em] text-cyan-300">
        Soundboard
      </p>
      <h2 class="text-2xl font-semibold text-white">
        Trigger category-based sounds in one embeddable widget.
      </h2>
    </div>

    <CategoryTabs
      :active-category-id="state.activeCategoryId"
      :categories="categories"
      @category-change="handleCategoryChange"
    />

    <PlaybackControls
      :allow-overlap="state.allowOverlap"
      :can-stop-all="canStopAll"
      :loop-enabled="state.loopEnabled"
      @play-random="handlePlayRandom"
      @stop-all="handleStopAll"
      @toggle-loop="handleToggleLoop"
      @toggle-overlap="handleToggleOverlap"
    />

    <div class="grid gap-4 md:grid-cols-2">
      <SoundItemCard
        v-for="item in visibleItems"
        :key="item.id"
        :is-active="state.activeItemIds.includes(item.id)"
        :item="item"
        @toggle-play="handleTogglePlay(findItem($event))"
      />
    </div>
  </section>
</template>
