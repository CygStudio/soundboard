<script setup lang="ts">
import {
  createSoundboardState,
  selectSoundboardCategory,
  toggleActiveSound,
} from "@soundboard/core";
import { CategoryTabs, SoundItemCard, cn } from "@soundboard/ui";
import { computed, onBeforeUnmount, ref, watch } from "vue";

import type { SoundboardItem } from "@soundboard/core";
import type { SoundboardWidgetProps } from "./types";

defineOptions({
  name: "SoundboardWidget",
});

const props = withDefaults(defineProps<SoundboardWidgetProps>(), {
  className: "",
});

const state = ref(createSoundboardState(props.soundboard));

let activeAudio: HTMLAudioElement | null = null;

const categories = computed(() => props.soundboard.categories);
const visibleItems = computed(() => state.value.visibleItems);

function disposeAudio() {
  if (activeAudio === null) {
    return;
  }

  activeAudio.pause();
  activeAudio.currentTime = 0;
  activeAudio = null;
}

function clearActiveItem() {
  state.value = {
    ...state.value,
    activeItemId: null,
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
  if (state.value.activeItemId === itemId) {
    clearActiveItem();
  }

  activeAudio = null;
}

function handleCategoryChange(categoryId: string) {
  if (categoryId === state.value.activeCategoryId) {
    return;
  }

  disposeAudio();
  state.value = selectSoundboardCategory(props.soundboard, state.value, categoryId);
}

async function handleTogglePlay(item: SoundboardItem) {
  const nextState = toggleActiveSound(props.soundboard, state.value, item.id);

  if (nextState.activeItemId === null) {
    disposeAudio();
    state.value = nextState;
    return;
  }

  disposeAudio();
  state.value = nextState;

  const nextAudio = new Audio(item.audioUrl);
  nextAudio.addEventListener("ended", () => {
    handlePlaybackSettled(item.id);
  });
  nextAudio.addEventListener("error", () => {
    handlePlaybackSettled(item.id);
  });

  activeAudio = nextAudio;

  try {
    await nextAudio.play();
  } catch {
    disposeAudio();
    clearActiveItem();
  }
}

watch(
  () => props.soundboard,
  () => {
    disposeAudio();
    state.value = createSoundboardState(props.soundboard);
  },
  { deep: true },
);

onBeforeUnmount(() => {
  disposeAudio();
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

    <div class="grid gap-4 md:grid-cols-2">
      <SoundItemCard
        v-for="item in visibleItems"
        :key="item.id"
        :is-active="item.id === state.activeItemId"
        :item="item"
        @toggle-play="handleTogglePlay(findItem($event))"
      />
    </div>
  </section>
</template>
