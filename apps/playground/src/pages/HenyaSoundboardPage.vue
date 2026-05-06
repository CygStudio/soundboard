<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";

import {
  HENYA_ALL_CATEGORY_ID,
  henyaCategories,
  henyaSoundItems,
  type HenyaSoundItem,
} from "../showcase/henyaSoundboard";

interface ActivePlayback {
  readonly audio: HTMLAudioElement;
  readonly itemId: string;
}

const activeCategoryId = ref<string>(HENYA_ALL_CATEGORY_ID);
const allowOverlap = ref(false);
const loopEnabled = ref(false);
const isDarkMode = ref(false);
const playbacks = ref<readonly ActivePlayback[]>([]);
const progressByItemId = ref<Record<string, number>>({});
const currentTimeByItemId = ref<Record<string, number>>({});
const durationByItemId = ref<Record<string, number>>({});

const visibleItems = computed<readonly HenyaSoundItem[]>(() => {
  if (activeCategoryId.value === HENYA_ALL_CATEGORY_ID) {
    return henyaSoundItems;
  }
  return henyaSoundItems.filter((item) => item.categoryId === activeCategoryId.value);
});

const activeItemIds = computed(() => new Set(playbacks.value.map((entry) => entry.itemId)));
const canStopAll = computed(() => playbacks.value.length > 0);

function findItem(itemId: string): HenyaSoundItem {
  const item = henyaSoundItems.find((entry) => entry.id === itemId);
  if (item === undefined) {
    throw new Error(`Unknown henya sound item id: ${itemId}`);
  }
  return item;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }
  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remaining = totalSeconds % 60;
  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
}

function stopPlayback(itemId: string) {
  const entry = playbacks.value.find((playback) => playback.itemId === itemId);
  if (entry === undefined) {
    return;
  }
  entry.audio.pause();
  entry.audio.currentTime = 0;
  playbacks.value = playbacks.value.filter((playback) => playback.itemId !== itemId);
  delete progressByItemId.value[itemId];
  delete currentTimeByItemId.value[itemId];
}

function stopAllPlaybacks() {
  for (const entry of [...playbacks.value]) {
    entry.audio.pause();
    entry.audio.currentTime = 0;
  }
  playbacks.value = [];
  progressByItemId.value = {};
  currentTimeByItemId.value = {};
}

function attachAudioListeners(audio: HTMLAudioElement, item: HenyaSoundItem) {
  audio.loop = loopEnabled.value;
  audio.addEventListener("loadedmetadata", () => {
    durationByItemId.value = {
      ...durationByItemId.value,
      [item.id]: audio.duration,
    };
  });
  audio.addEventListener("timeupdate", () => {
    const duration = audio.duration;
    currentTimeByItemId.value = {
      ...currentTimeByItemId.value,
      [item.id]: audio.currentTime,
    };
    if (Number.isFinite(duration) && duration > 0) {
      progressByItemId.value = {
        ...progressByItemId.value,
        [item.id]: Math.min(1, audio.currentTime / duration),
      };
    }
  });
  audio.addEventListener("ended", () => {
    if (!audio.loop) {
      stopPlayback(item.id);
    }
  });
  audio.addEventListener("error", () => {
    stopPlayback(item.id);
  });
}

async function startPlayback(item: HenyaSoundItem) {
  if (!allowOverlap.value) {
    stopAllPlaybacks();
  }
  const audio = new Audio(item.audioUrl);
  attachAudioListeners(audio, item);
  playbacks.value = [...playbacks.value, { audio, itemId: item.id }];
  try {
    await audio.play();
  } catch (error) {
    console.error("Failed to play henya soundboard audio", error);
    stopPlayback(item.id);
  }
}

async function handleToggleSound(item: HenyaSoundItem) {
  if (activeItemIds.value.has(item.id)) {
    stopPlayback(item.id);
    return;
  }
  await startPlayback(item);
}

function handleSelectCategory(categoryId: string) {
  if (categoryId === activeCategoryId.value) {
    return;
  }
  activeCategoryId.value = categoryId;
  const visibleIds = new Set(
    (categoryId === HENYA_ALL_CATEGORY_ID
      ? henyaSoundItems
      : henyaSoundItems.filter((item) => item.categoryId === categoryId)
    ).map((item) => item.id),
  );
  for (const entry of [...playbacks.value]) {
    if (!visibleIds.has(entry.itemId)) {
      stopPlayback(entry.itemId);
    }
  }
}

function handleToggleOverlap() {
  allowOverlap.value = !allowOverlap.value;
  if (!allowOverlap.value && playbacks.value.length > 1) {
    const keep = playbacks.value[playbacks.value.length - 1];
    if (keep === undefined) {
      return;
    }
    for (const entry of playbacks.value) {
      if (entry.itemId !== keep.itemId) {
        stopPlayback(entry.itemId);
      }
    }
  }
}

function handleToggleLoop() {
  loopEnabled.value = !loopEnabled.value;
  for (const entry of playbacks.value) {
    entry.audio.loop = loopEnabled.value;
  }
}

async function handleShuffle() {
  if (visibleItems.value.length === 0) {
    return;
  }
  const randomIndex = Math.floor(Math.random() * visibleItems.value.length);
  const target = visibleItems.value[randomIndex];
  if (target === undefined) {
    return;
  }
  if (activeItemIds.value.has(target.id) && !allowOverlap.value) {
    return;
  }
  if (activeItemIds.value.has(target.id) && allowOverlap.value) {
    stopPlayback(target.id);
  }
  await startPlayback(target);
}

function handleStopAll() {
  stopAllPlaybacks();
}

function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value;
}

onBeforeUnmount(() => {
  stopAllPlaybacks();
});

function progressFor(itemId: string): number {
  return progressByItemId.value[itemId] ?? 0;
}

function timeLabelFor(item: HenyaSoundItem): string {
  if (activeItemIds.value.has(item.id)) {
    const current = currentTimeByItemId.value[item.id] ?? 0;
    const duration = durationByItemId.value[item.id];
    if (duration !== undefined && Number.isFinite(duration)) {
      return `${formatTime(current)} / ${formatTime(duration)}`;
    }
    return formatTime(current);
  }
  return item.durationLabel;
}
</script>

<template>
  <div
    :class="[
      'min-h-screen relative overflow-x-hidden transition-colors duration-300 font-henya-body',
      'selection:bg-henya-primary selection:text-white',
      isDarkMode
        ? 'dark bg-henya-bg-dark text-gray-100'
        : 'bg-henya-bg-light text-gray-800',
    ]"
  >
    <div class="fixed inset-0 pointer-events-none z-0 henya-diamond-pattern" :class="isDarkMode ? 'opacity-10' : 'opacity-40'" />
    <div class="fixed top-0 right-0 w-[500px] h-[500px] bg-henya-primary/20 rounded-full blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2" />
    <div class="fixed bottom-0 left-0 w-[400px] h-[400px] bg-henya-secondary/20 rounded-full blur-[100px] pointer-events-none -translate-x-1/3 translate-y-1/3" />

    <nav class="fixed top-0 w-full z-50 px-6 py-4">
      <div
        :class="[
          'max-w-7xl mx-auto henya-glass rounded-full px-6 py-3 flex justify-between items-center shadow-sm',
          isDarkMode
            ? 'bg-[rgba(30,20,40,0.8)] border border-white/10'
            : 'bg-white/80 border border-white/50',
        ]"
      >
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-full overflow-hidden border-2 border-henya-primary bg-gradient-to-br from-henya-primary to-henya-secondary flex items-center justify-center">
            <span class="text-white font-henya-display font-extrabold text-lg">H</span>
          </div>
          <span
            :class="[
              'font-henya-display font-bold text-xl tracking-wide',
              isDarkMode ? 'text-henya-primary' : 'text-henya-accent',
            ]"
          >
            Henya Sounds
          </span>
        </div>
        <div class="hidden md:flex items-center space-x-6">
          <a
            v-for="link in ['Home', 'About', 'Clips']"
            :key="link"
            :class="[
              'font-bold transition-colors hover:text-henya-primary',
              isDarkMode ? 'text-gray-300' : 'text-gray-600',
            ]"
            href="#"
          >
            {{ link }}
          </a>
        </div>
        <div class="flex items-center space-x-2">
          <button
            type="button"
            :class="[
              'p-2 rounded-full transition-colors',
              isDarkMode
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-600 hover:bg-gray-200',
            ]"
            aria-label="Settings"
          >
            <span class="material-icons-round text-xl">settings</span>
          </button>
          <button
            type="button"
            :class="[
              'p-2 rounded-full transition-colors',
              isDarkMode
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-600 hover:bg-gray-200',
            ]"
            :aria-label="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
            :aria-pressed="isDarkMode"
            @click="toggleDarkMode"
          >
            <span class="material-icons-round text-xl">
              {{ isDarkMode ? "light_mode" : "dark_mode" }}
            </span>
          </button>
        </div>
      </div>
    </nav>

    <header class="relative pt-32 pb-12 lg:pt-40 lg:pb-20 px-6 z-10">
      <div class="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
        <div class="lg:w-1/2 text-center lg:text-left space-y-6">
          <div
            :class="[
              'inline-flex items-center px-4 py-1.5 rounded-full bg-henya-secondary/20 text-sm font-bold mb-2',
              isDarkMode ? 'text-henya-secondary' : 'text-henya-accent',
            ]"
          >
            <span class="material-icons-round text-sm mr-2 animate-pulse">auto_awesome</span>
            Official Unofficial Soundboard
          </div>
          <h1
            :class="[
              'font-henya-display font-extrabold text-5xl lg:text-7xl leading-tight',
              'text-transparent bg-clip-text bg-gradient-to-r filter drop-shadow-sm',
              isDarkMode
                ? 'from-henya-primary to-henya-secondary'
                : 'from-henya-accent to-henya-primary',
            ]"
          >
            Henya's Sound<br />Archive!
          </h1>
          <p
            :class="[
              'text-lg max-w-lg mx-auto lg:mx-0',
              isDarkMode ? 'text-gray-300' : 'text-gray-600',
            ]"
          >
            A collection of the cutest noises, funniest reactions, and most iconic voice lines from everyone's favorite kettle.
          </p>
        </div>
        <div class="lg:w-1/2 relative flex justify-center">
          <div class="absolute inset-0 bg-gradient-to-tr from-henya-primary to-henya-secondary opacity-20 blur-[80px] rounded-full transform scale-75" :class="isDarkMode ? 'opacity-30' : 'opacity-20'" />
          <div class="relative z-10 w-[350px] lg:w-[450px] h-[400px] lg:h-[500px] rounded-3xl overflow-hidden bg-gradient-to-br from-henya-primary/30 to-henya-secondary/30 flex items-center justify-center shadow-2xl">
            <div class="text-9xl lg:text-[12rem] henya-animate-pulse-soft">
              🫖
            </div>
          </div>
          <div
            :class="[
              'absolute top-10 right-10 p-3 rounded-2xl shadow-xl rotate-12 animate-bounce hover:rotate-0 transition-all duration-300 cursor-pointer',
              isDarkMode ? 'bg-gray-800' : 'bg-white',
            ]"
          >
            <span class="text-2xl">🎮</span>
          </div>
          <div
            :class="[
              'absolute bottom-20 left-0 p-3 rounded-2xl shadow-xl -rotate-6 hover:rotate-0 transition-all duration-300 cursor-pointer',
              isDarkMode ? 'bg-gray-800' : 'bg-white',
            ]"
          >
            <span class="text-2xl">🥔</span>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 pb-32 z-10 relative">
      <div class="flex flex-wrap justify-center gap-3 mb-12">
        <button
          v-for="category in henyaCategories"
          :key="category.id"
          type="button"
          :aria-pressed="category.id === activeCategoryId"
          :class="[
            'px-6 py-2.5 rounded-2xl font-semibold transition-all',
            category.id === activeCategoryId
              ? 'bg-henya-primary text-white font-bold shadow-lg shadow-henya-primary/30 transform hover:scale-105'
              : [
                  'shadow-sm hover:shadow-md hover:bg-henya-secondary/10 border border-transparent hover:border-henya-secondary/30',
                  isDarkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-white text-gray-600',
                ],
          ]"
          @click="handleSelectCategory(category.id)"
        >
          {{ category.label }}
        </button>
      </div>

      <div
        v-if="visibleItems.length === 0"
        :class="[
          'rounded-2xl border border-dashed p-10 text-center',
          isDarkMode ? 'border-white/10 text-gray-400' : 'border-henya-primary/30 text-gray-500',
        ]"
      >
        No sounds in this category yet.
      </div>

      <div
        v-else
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
      >
        <button
          v-for="item in visibleItems"
          :key="item.id"
          type="button"
          :aria-pressed="activeItemIds.has(item.id)"
          :class="[
            'group relative backdrop-blur-md rounded-2xl p-4 henya-bounce-hover overflow-hidden text-left flex flex-col justify-between h-32',
            activeItemIds.has(item.id)
              ? [
                  'henya-playing-card border-2 border-henya-primary transform -translate-y-1',
                  isDarkMode ? 'bg-henya-primary/20' : 'bg-henya-primary/10',
                ]
              : [
                  'shadow-sm hover:shadow-xl hover:shadow-henya-primary/20 transition-all duration-300 border',
                  isDarkMode
                    ? 'bg-[rgba(30,20,40,0.7)] border-white/5'
                    : 'bg-white/70 border-white/50',
                ],
          ]"
          @click="handleToggleSound(item)"
        >
          <div
            v-if="!activeItemIds.has(item.id)"
            class="absolute inset-0 bg-gradient-to-br from-henya-primary/0 to-henya-primary/0 group-hover:from-henya-primary/10 group-hover:to-henya-secondary/10 transition-all duration-300"
          />
          <div
            v-else
            class="absolute inset-0 bg-gradient-to-br from-henya-primary/10 to-henya-secondary/10 transition-all duration-300"
          />
          <span
            :class="[
              'font-bold z-10 transition-colors',
              activeItemIds.has(item.id)
                ? isDarkMode
                  ? 'text-white'
                  : 'text-henya-primary'
                : [
                    'group-hover:text-henya-primary',
                    isDarkMode ? 'text-gray-100' : 'text-gray-800',
                  ],
            ]"
          >
            {{ item.title }}
          </span>
          <div class="flex justify-between items-end z-10 w-full">
            <span
              :class="[
                'text-xs font-mono',
                activeItemIds.has(item.id)
                  ? 'text-henya-primary font-bold'
                  : isDarkMode
                    ? 'text-gray-400'
                    : 'text-gray-500',
              ]"
            >
              {{ timeLabelFor(item) }}
            </span>
            <div
              v-if="activeItemIds.has(item.id)"
              class="bg-henya-primary w-10 h-10 flex items-center justify-center rounded-full text-white shadow-md shadow-henya-primary/30 transition-transform group-hover:scale-110"
            >
              <span class="material-icons-round text-base">stop</span>
            </div>
          </div>
          <div
            v-if="activeItemIds.has(item.id)"
            class="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-henya-primary to-henya-accent transition-all duration-100 ease-linear shadow-[0_0_8px_rgba(177,156,217,0.6)]"
            :class="loopEnabled && progressFor(item.id) === 0 ? 'animate-pulse w-full' : ''"
            :style="{ width: `${Math.max(progressFor(item.id) * 100, loopEnabled ? 100 : 4)}%` }"
          />
          <div
            v-else
            class="absolute bottom-0 left-0 h-1 bg-henya-primary w-0 group-hover:w-full transition-all duration-500 ease-out"
          />
        </button>
      </div>
    </main>

    <div class="fixed bottom-6 inset-x-0 z-50 px-4">
      <div
        :class="[
          'max-w-lg mx-auto henya-glass backdrop-blur-2xl rounded-3xl p-3 shadow-2xl shadow-henya-primary/10 border flex items-center justify-center gap-4 transition-all duration-300',
          isDarkMode ? 'bg-[rgba(17,24,39,0.95)] border-white/10' : 'bg-white/95 border-white/60',
        ]"
      >
        <button
          type="button"
          :aria-pressed="allowOverlap"
          :title="`Audio Overlap: ${allowOverlap ? 'On' : 'Off'}`"
          :class="[
            'group relative p-3 rounded-xl transition-all duration-200',
            allowOverlap
              ? 'bg-henya-primary/10 text-henya-primary border border-henya-primary/20 hover:bg-henya-primary/20'
              : isDarkMode
                ? 'hover:bg-gray-800 text-gray-500 hover:text-henya-primary'
                : 'hover:bg-gray-100 text-gray-400 hover:text-henya-primary',
          ]"
          @click="handleToggleOverlap"
        >
          <span class="material-icons-round text-2xl">layers</span>
          <span
            v-if="allowOverlap"
            :class="[
              'absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full shadow-sm ring-2',
              isDarkMode ? 'ring-gray-900' : 'ring-white',
            ]"
          />
          <span class="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Audio Overlap
          </span>
        </button>

        <button
          type="button"
          :aria-pressed="loopEnabled"
          :title="`Single Loop: ${loopEnabled ? 'On' : 'Off'}`"
          :class="[
            'group relative p-3 rounded-xl transition-all duration-200',
            loopEnabled
              ? 'bg-henya-primary/10 text-henya-primary border border-henya-primary/20 hover:bg-henya-primary/20'
              : isDarkMode
                ? 'hover:bg-gray-800 text-gray-500 hover:text-henya-primary'
                : 'hover:bg-gray-100 text-gray-400 hover:text-henya-primary',
          ]"
          @click="handleToggleLoop"
        >
          <span class="material-icons-round text-2xl">repeat_one</span>
          <span
            v-if="loopEnabled"
            :class="[
              'absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full shadow-sm ring-2',
              isDarkMode ? 'ring-gray-900' : 'ring-white',
            ]"
          />
          <span class="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Single Loop
          </span>
        </button>

        <button
          type="button"
          title="Shuffle Now"
          :class="[
            'group relative p-3 rounded-xl transition-all duration-200',
            isDarkMode
              ? 'hover:bg-gray-800 text-gray-300 hover:text-henya-primary'
              : 'hover:bg-gray-100 text-gray-600 hover:text-henya-primary',
          ]"
          @click="handleShuffle"
        >
          <span class="material-icons-round text-2xl">shuffle</span>
          <span class="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Shuffle Now
          </span>
        </button>

        <button
          type="button"
          title="Stop All"
          :disabled="!canStopAll"
          :class="[
            'group relative p-3 rounded-xl transition-all duration-200',
            canStopAll
              ? [
                  'text-red-500 hover:scale-105',
                  isDarkMode ? 'hover:bg-red-900/10' : 'hover:bg-red-50',
                ]
              : 'text-gray-400 opacity-50 cursor-not-allowed',
          ]"
          @click="handleStopAll"
        >
          <span class="material-icons-round text-2xl">stop_circle</span>
          <span class="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Stop All
          </span>
        </button>
      </div>
    </div>
  </div>
</template>
