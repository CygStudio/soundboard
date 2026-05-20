<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";

import {
  CYG_ALL_CATEGORY_ID,
  cygCategoryOptions,
  cygSoundItems,
  cygSummary,
  cygTopCategories,
  type CygSoundItem,
} from "../showcase/cygSoundboard";

interface ActivePlayback {
  readonly id: number;
  readonly audio: HTMLAudioElement;
  readonly itemId: string;
}

interface FestiveAccent {
  readonly id: string;
  readonly label: string;
  readonly className: string;
  readonly style: string;
}

interface HeroStat {
  readonly label: string;
  readonly value: string;
}

let nextPlaybackId = 0;

const activeCategoryId = ref<string>(CYG_ALL_CATEGORY_ID);
const allowOverlap = ref(false);
const loopEnabled = ref(false);
const isDarkMode = ref(true);
const searchQuery = ref("");
const playbacks = ref<readonly ActivePlayback[]>([]);
const progressByItemId = ref<Record<string, number>>({});
const currentTimeByItemId = ref<Record<string, number>>({});
const durationByItemId = ref<Record<string, number>>({});
const latestPlaybackIdByItemId = ref<Record<string, number>>({});

const festiveAccents: readonly FestiveAccent[] = [
  {
    id: "gold-left",
    label: "✦",
    className: "left-[8%] top-[18%] bg-[#ffd166] text-cyg-on-secondary shadow-[0_0_24px_rgba(255,209,102,0.38)]",
    style: "--cyg-rotate: -12deg; animation-delay: -0.5s",
  },
  {
    id: "blue-right",
    label: "●",
    className: "right-[9%] top-[28%] bg-[#57c7ff] text-cyg-on-secondary shadow-[0_0_24px_rgba(87,199,255,0.34)]",
    style: "--cyg-rotate: 8deg; animation-delay: -1.8s",
  },
  {
    id: "pink-low",
    label: "◆",
    className: "right-[17%] bottom-[24%] bg-cyg-tertiary text-cyg-on-tertiary shadow-[0_0_28px_rgba(255,176,208,0.36)]",
    style: "--cyg-rotate: 18deg; animation-delay: -2.6s",
  },
  {
    id: "ruby-low",
    label: "✹",
    className: "left-[15%] bottom-[18%] bg-cyg-primary-container text-cyg-on-primary-container shadow-[0_0_30px_rgba(209,31,55,0.42)]",
    style: "--cyg-rotate: -22deg; animation-delay: -3.2s",
  },
];

const normalizedSearchQuery = computed(() => searchQuery.value.trim().toLocaleLowerCase());

const heroStats = computed<readonly HeroStat[]>(() => [
  { label: "音效總數", value: `${cygSummary.totalItems}` },
  { label: "分類", value: `${cygSummary.totalCategories}` },
  // { label: "有子標籤", value: `${cygSummary.taggedItems}` },
]);

const activeCategoryLabel = computed(() => {
  return cygCategoryOptions.find((category) => category.id === activeCategoryId.value)?.label ?? "全部音效";
});

function matchesSearch(item: CygSoundItem, query: string): boolean {
  if (query.length === 0) {
    return true;
  }

  return [item.title, item.subcategory ?? "", item.filename, item.id].some((value) =>
    value.toLocaleLowerCase().includes(query),
  );
}

const visibleItems = computed<readonly CygSoundItem[]>(() => {
  const categoryFiltered =
    activeCategoryId.value === CYG_ALL_CATEGORY_ID
      ? cygSoundItems
      : cygSoundItems.filter((item) => item.categoryId === activeCategoryId.value);

  return categoryFiltered.filter((item) => matchesSearch(item, normalizedSearchQuery.value));
});

const activeItemIds = computed(() => new Set(playbacks.value.map((entry) => entry.itemId)));
const canStopAll = computed(() => playbacks.value.length > 0);
const visibleSummaryLabel = computed(() => {
  const prefix = activeCategoryId.value === CYG_ALL_CATEGORY_ID ? "全部片段" : activeCategoryLabel.value;
  return `${prefix} · ${visibleItems.value.length} / ${cygSummary.totalItems}`;
});

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }
  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remaining = totalSeconds % 60;
  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
}

function removeNumberKey(source: Record<string, number>, key: string): Record<string, number> {
  const next = { ...source };
  delete next[key];
  return next;
}

function resetItemState(itemId: string) {
  progressByItemId.value = removeNumberKey(progressByItemId.value, itemId);
  currentTimeByItemId.value = removeNumberKey(currentTimeByItemId.value, itemId);
  latestPlaybackIdByItemId.value = removeNumberKey(latestPlaybackIdByItemId.value, itemId);
}

function syncItemPlaybackState(itemId: string) {
  const remaining = playbacks.value.filter((playback) => playback.itemId === itemId);
  const latest = remaining[remaining.length - 1];

  if (latest === undefined) {
    resetItemState(itemId);
    return;
  }

  latestPlaybackIdByItemId.value = {
    ...latestPlaybackIdByItemId.value,
    [itemId]: latest.id,
  };
  currentTimeByItemId.value = {
    ...currentTimeByItemId.value,
    [itemId]: latest.audio.currentTime,
  };

  const duration = latest.audio.duration;
  if (Number.isFinite(duration) && duration > 0) {
    progressByItemId.value = {
      ...progressByItemId.value,
      [itemId]: Math.min(1, latest.audio.currentTime / duration),
    };
  }
}

function stopPlayback(playbackId: number) {
  const entry = playbacks.value.find((playback) => playback.id === playbackId);
  if (entry === undefined) {
    return;
  }
  entry.audio.pause();
  entry.audio.currentTime = 0;
  playbacks.value = playbacks.value.filter((playback) => playback.id !== playbackId);
  syncItemPlaybackState(entry.itemId);
}

function stopItemPlaybacks(itemId: string) {
  const matchingEntries = playbacks.value.filter((playback) => playback.itemId === itemId);
  for (const entry of matchingEntries) {
    entry.audio.pause();
    entry.audio.currentTime = 0;
  }
  playbacks.value = playbacks.value.filter((playback) => playback.itemId !== itemId);
  resetItemState(itemId);
}

function stopAllPlaybacks() {
  for (const entry of [...playbacks.value]) {
    entry.audio.pause();
    entry.audio.currentTime = 0;
  }
  playbacks.value = [];
  progressByItemId.value = {};
  currentTimeByItemId.value = {};
  latestPlaybackIdByItemId.value = {};
}

function attachAudioListeners(audio: HTMLAudioElement, item: CygSoundItem, playbackId: number) {
  audio.loop = loopEnabled.value;
  audio.addEventListener("loadedmetadata", () => {
    durationByItemId.value = {
      ...durationByItemId.value,
      [item.id]: audio.duration,
    };
  });
  audio.addEventListener("timeupdate", () => {
    if (latestPlaybackIdByItemId.value[item.id] !== playbackId) {
      return;
    }
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
      stopPlayback(playbackId);
    }
  });
  audio.addEventListener("error", () => {
    stopPlayback(playbackId);
  });
}

async function startPlayback(item: CygSoundItem) {
  if (!allowOverlap.value) {
    stopAllPlaybacks();
  }
  const playbackId = nextPlaybackId;
  nextPlaybackId += 1;
  const audio = new Audio(item.audioUrl);
  attachAudioListeners(audio, item, playbackId);
  latestPlaybackIdByItemId.value = {
    ...latestPlaybackIdByItemId.value,
    [item.id]: playbackId,
  };
  currentTimeByItemId.value = {
    ...currentTimeByItemId.value,
    [item.id]: 0,
  };
  progressByItemId.value = {
    ...progressByItemId.value,
    [item.id]: 0,
  };
  playbacks.value = [...playbacks.value, { id: playbackId, audio, itemId: item.id }];
  try {
    await audio.play();
  } catch (error) {
    console.error("Failed to play cyg soundboard audio", error);
    stopPlayback(playbackId);
  }
}

async function handlePlaySound(item: CygSoundItem) {
  await startPlayback(item);
}

function handleStopSound(itemId: string) {
  stopItemPlaybacks(itemId);
}

function handleSelectCategory(categoryId: string) {
  if (categoryId === activeCategoryId.value) {
    return;
  }
  activeCategoryId.value = categoryId;
}

function handleToggleOverlap() {
  allowOverlap.value = !allowOverlap.value;
  if (!allowOverlap.value && playbacks.value.length > 1) {
    const keep = playbacks.value[playbacks.value.length - 1];
    if (keep === undefined) {
      return;
    }
    for (const entry of [...playbacks.value]) {
      if (entry.id !== keep.id) {
        stopPlayback(entry.id);
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
  await startPlayback(target);
}

function handleStopAll() {
  stopAllPlaybacks();
}

function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value;
}

function clearSearch() {
  searchQuery.value = "";
}

onBeforeUnmount(() => {
  stopAllPlaybacks();
});

watch(visibleItems, (items) => {
  const visibleIds = new Set(items.map((item) => item.id));
  for (const entry of [...playbacks.value]) {
    if (!visibleIds.has(entry.itemId)) {
      stopItemPlaybacks(entry.itemId);
    }
  }
});

function progressFor(itemId: string): number {
  return progressByItemId.value[itemId] ?? 0;
}

function metaLabelFor(item: CygSoundItem): string {
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
      'min-h-screen relative overflow-x-hidden transition-colors duration-300 font-cyg-body',
      'selection:bg-cyg-primary selection:text-cyg-on-primary',
      isDarkMode
        ? 'dark bg-cyg-background text-cyg-on-background'
        : 'bg-cyg-inverse-surface text-cyg-inverse-on-surface',
    ]"
  >
    <div class="fixed inset-0 pointer-events-none z-0 cyg-confetti-pattern" :class="isDarkMode ? 'opacity-80' : 'opacity-35'" />
    <div class="fixed top-0 right-0 w-[540px] h-[540px] bg-cyg-primary-container/30 rounded-full blur-[110px] pointer-events-none translate-x-1/2 -translate-y-1/2" />
    <div class="fixed bottom-0 left-0 w-[460px] h-[460px] bg-cyg-tertiary-container/30 rounded-full blur-[120px] pointer-events-none -translate-x-1/3 translate-y-1/3" />
    <div class="fixed top-1/2 left-1/2 w-[520px] h-[220px] -translate-x-1/2 -translate-y-1/2 rotate-[-14deg] rounded-full bg-[#57c7ff]/10 blur-[130px] pointer-events-none" />

    <span
      v-for="accent in festiveAccents"
      :key="accent.id"
      :class="[
        'fixed z-[1] hidden h-10 w-10 pointer-events-none select-none items-center justify-center rounded-full text-sm font-bold md:flex cyg-float',
        accent.className,
      ]"
      :style="accent.style"
      aria-hidden="true"
    >
      {{ accent.label }}
    </span>

    <nav class="fixed top-0 w-full z-50 px-6 py-4">
      <div
        :class="[
          'max-w-7xl mx-auto cyg-glass rounded-full px-6 py-3 flex justify-between items-center shadow-sm',
          isDarkMode
            ? 'bg-cyg-surface-container-low/80 border border-cyg-primary/20 shadow-cyg-primary-container/20'
            : 'bg-cyg-inverse-surface/85 border border-cyg-outline/30 shadow-cyg-outline/10',
        ]"
      >
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-full overflow-hidden  border-cyg-primary bg-gradient-to-br from-cyg-primary-container via-cyg-tertiary-container to-cyg-surface-container-high flex items-center justify-center shadow-lg shadow-cyg-primary-container/30">
            <!-- <span class="text-cyg-on-primary-container font-cyg-display font-extrabold text-lg">D</span> -->
             <img src="https://cyg.sid.tw/images/icon.webp" alt="">
          </div>
          <div class="flex flex-col">
            <span
              :class="[
                'font-cyg-display font-extrabold text-xl tracking-[-0.02em]',
                isDarkMode ? 'text-cyg-primary' : 'text-cyg-inverse-primary',
              ]"
            >
              熙歌音效版
            </span>
            <span
              :class="[
                'text-[11px] tracking-[0.18em] uppercase',
                isDarkMode ? 'text-cyg-on-surface-variant' : 'text-cyg-inverse-on-surface/60',
              ]"
            >
              CYG Soundboard
            </span>
          </div>
        </div>
        <div class="hidden md:flex items-center space-x-6">
          <!-- <span
            v-for="category in cygTopCategories"
            :key="category.id"
            :class="[
              'rounded-full px-3 py-1 text-xs font-bold border',
              isDarkMode
                ? 'border-cyg-primary/20 bg-cyg-surface-container-high/70 text-cyg-on-surface-variant'
                : 'border-cyg-outline/20 bg-cyg-outline/8 text-cyg-inverse-on-surface/75',
            ]"
          >
            {{ category.label }} · {{ category.itemCount }}
          </span> -->
        </div>
        <div class="flex items-center space-x-2">
          <!-- <button
            type="button"
            :class="[
              'p-2 rounded-full transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-cyg-primary/40',
              isDarkMode
                ? 'text-cyg-on-surface-variant hover:bg-cyg-surface-container-high'
                : 'text-cyg-inverse-on-surface hover:bg-cyg-outline/15',
            ]"
            aria-label="Settings"
          >
            <span class="material-icons-round text-xl">settings</span>
          </button>
          <button
            type="button"
            :class="[
              'p-2 rounded-full transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-cyg-primary/40',
              isDarkMode
                ? 'text-cyg-on-surface-variant hover:bg-cyg-surface-container-high'
                : 'text-cyg-inverse-on-surface hover:bg-cyg-outline/15',
            ]"
            :aria-label="isDarkMode ? '切換為亮色模式' : '切換為慶典夜色模式'"
            :aria-pressed="isDarkMode"
            @click="toggleDarkMode"
          >
            <span class="material-icons-round text-xl">
              {{ isDarkMode ? "light_mode" : "dark_mode" }}
            </span>
          </button> -->
        </div>
      </div>
    </nav>

    <header class="relative pt-32 pb-10 lg:pt-40 lg:pb-16 px-6 z-10">
      <div class="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
        <div class="lg:w-1/2 text-center lg:text-left space-y-6">
          <div
            :class="[
              'inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold mb-2 border cyg-glass',
              isDarkMode
                ? 'bg-cyg-tertiary-container/20 text-cyg-tertiary border-cyg-tertiary/30'
                : 'bg-cyg-tertiary-fixed/75 text-cyg-on-tertiary-fixed border-cyg-tertiary/30',
            ]"
          >
            <span class="material-icons-round text-sm mr-2 animate-pulse">auto_awesome</span>
            581 段片段
          </div>
          <!-- <h1
            :class="[
              'font-cyg-display font-extrabold text-5xl lg:text-7xl leading-[1.1] tracking-[-0.02em]',
              'text-transparent bg-clip-text bg-gradient-to-r filter drop-shadow-sm',
              isDarkMode
                ? 'from-cyg-primary via-cyg-tertiary to-cyg-on-primary-container'
                : 'from-cyg-inverse-primary via-cyg-tertiary-container to-cyg-on-primary-fixed',
            ]"
          >
            熙歌音效版
          </h1> -->
          <p
            :class="[
              'text-lg max-w-xl mx-auto lg:mx-0 leading-[1.6]',
              isDarkMode ? 'text-cyg-on-surface-variant' : 'text-cyg-inverse-on-surface/75',
            ]"
          >
            把日常、叫聲、暴言到福利全部收錄在這裡，讓我們一起 088 ！
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div
              v-for="stat in heroStats"
              :key="stat.label"
              :class="[
                'rounded-[1.5rem] border px-4 py-4 cyg-glass text-left',
                isDarkMode
                  ? 'border-cyg-primary/15 bg-cyg-surface-container/65'
                  : 'border-cyg-outline/20 bg-cyg-inverse-surface/70',
              ]"
            >
              <div class="text-2xl font-cyg-display font-extrabold text-cyg-primary">
                {{ stat.value }}
              </div>
              <div
                :class="[
                  'mt-1 text-sm',
                  isDarkMode ? 'text-cyg-on-surface-variant' : 'text-cyg-inverse-on-surface/65',
                ]"
              >
                {{ stat.label }}
              </div>
            </div>
          </div>
        </div>

        <div class="lg:w-1/2 relative flex justify-center">
          <div class="absolute inset-0 bg-gradient-to-tr from-cyg-primary-container to-cyg-tertiary-container opacity-30 blur-[90px] rounded-full transform scale-75" />
          <div
            :class="[
              'relative z-10 w-[350px] lg:w-[450px] rounded-[2rem] overflow-hidden flex flex-col justify-between p-8 shadow-2xl cyg-glass cyg-dragon-scale',
              isDarkMode
                ? 'bg-cyg-surface-container/70 border border-cyg-primary/20 shadow-cyg-primary-container/30'
                : 'bg-cyg-primary-fixed/50 border border-cyg-outline/30 shadow-cyg-outline/20',
            ]"
          >
            <!-- <div class="flex items-start justify-between">
              <span
                :class="[
                  'rounded-full px-3 py-1 text-xs font-bold tracking-[0.14em] uppercase border',
                  isDarkMode
                    ? 'bg-cyg-primary-container/25 border-cyg-primary/20 text-cyg-primary'
                    : 'bg-cyg-primary/10 border-cyg-inverse-primary/15 text-cyg-inverse-primary',
                ]"
              >
                Live data
              </span>
              <span class="text-5xl cyg-animate-pulse-soft">🐉</span>
            </div> -->

            <div class="space-y-3">
              <div
                v-for="(category, index) in cygTopCategories"
                :key="category.id"
                :class="[
                  'rounded-[1.25rem] px-4 py-3 border flex items-center justify-between',
                  isDarkMode
                    ? 'bg-cyg-surface-container-low/70 border-cyg-primary/12'
                    : 'bg-cyg-inverse-surface/70 border-cyg-outline/18',
                ]"
              >
                <div class="font-bold" v-if="index === 0">
                  企劃發起：<br/>
                  DJ DÄZEE
                </div>
                <div class="font-bold" v-if="index === 1">
                  技術負責、音訊處理：<br/>排氣管管、DJ DÄZEE
                </div>
                <div class="font-bold" v-if="index === 2">
                  片段收集：<br/>維、Eden、シュ婚叫セン、歐咖吶哋島油
                </div>
                <!-- <div>
                  <div class="font-bold">
                    {{ category.label }}
                  </div>
                  <div
                    :class="[
                      'text-sm',
                      isDarkMode ? 'text-cyg-on-surface-variant' : 'text-cyg-inverse-on-surface/65',
                    ]"
                  >
                    主要分類片段
                  </div>
                </div>
                <div class="text-2xl font-cyg-display font-extrabold text-cyg-primary">
                  {{ category.itemCount }}
                </div> -->
              </div>
            </div>
          </div>

          <div
            :class="[
              'absolute top-10 right-10 p-3 rounded-2xl shadow-xl rotate-12 animate-bounce hover:rotate-0 transition-all duration-300 cursor-pointer',
              isDarkMode ? 'bg-cyg-surface-container-high text-cyg-primary' : 'bg-cyg-secondary-fixed text-cyg-on-secondary-fixed',
            ]"
          >
            <span class="text-2xl">🎂</span>
          </div>
          <div
            :class="[
              'absolute bottom-20 left-0 p-3 rounded-2xl shadow-xl -rotate-6 hover:rotate-0 transition-all duration-300 cursor-pointer',
              isDarkMode ? 'bg-cyg-surface-container-high text-cyg-tertiary' : 'bg-cyg-tertiary-fixed text-cyg-on-tertiary-fixed',
            ]"
          >
            <span class="text-2xl">🎊</span>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 pb-32 z-10 relative">
      <section
        :class="[
          'mb-8 rounded-[2rem] border p-5 cyg-glass',
          isDarkMode
            ? 'border-cyg-primary/15 bg-cyg-surface-container-low/60'
            : 'border-cyg-outline/20 bg-cyg-inverse-surface/75',
        ]"
      >
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div class="space-y-1">
            <div class="font-cyg-display text-2xl font-extrabold">
              搜尋真實片段
            </div>
            <div
              :class="[
                'text-sm',
                isDarkMode ? 'text-cyg-on-surface-variant' : 'text-cyg-inverse-on-surface/65',
              ]"
            >
              可搜尋標題、子分類、檔名與片段 ID。
            </div>
          </div>

          <div class="w-full lg:max-w-xl">
            <label class="relative block">
              <span class="sr-only">搜尋 CYG soundboard</span>
              <span class="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-cyg-primary">
                search
              </span>
              <input
                v-model="searchQuery"
                data-cyg-search-input
                type="text"
                placeholder="例如：大長腿、真香"
                :class="[
                  'w-full rounded-full border pl-12 pr-12 py-3 outline-none transition-colors',
                  isDarkMode
                    ? 'border-cyg-primary/16 bg-cyg-surface-container-high/80 text-cyg-on-surface placeholder:text-cyg-outline focus:border-cyg-tertiary'
                    : 'border-cyg-outline/25 bg-cyg-inverse-surface text-cyg-inverse-on-surface placeholder:text-cyg-inverse-on-surface/45 focus:border-cyg-tertiary-container',
                ]"
              />
              <button
                v-if="searchQuery.length > 0"
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-cyg-primary transition-colors hover:bg-cyg-primary/10"
                aria-label="清除搜尋"
                @click="clearSearch"
              >
                <span class="material-icons-round text-base">close</span>
              </button>
            </label>
          </div>
        </div>

        <div class="mt-4 flex flex-wrap items-center gap-3">
          <span
            :class="[
              'rounded-full px-3 py-1 text-xs font-bold border',
              isDarkMode
                ? 'border-cyg-primary/15 bg-cyg-primary/8 text-cyg-primary'
                : 'border-cyg-outline/18 bg-cyg-primary/8 text-cyg-inverse-primary',
            ]"
          >
            {{ visibleSummaryLabel }}
          </span>
          <span
            v-if="searchQuery.length > 0"
            :class="[
              'rounded-full px-3 py-1 text-xs border',
              isDarkMode
                ? 'border-cyg-tertiary/20 bg-cyg-tertiary/10 text-cyg-tertiary'
                : 'border-cyg-tertiary-container/20 bg-cyg-tertiary/10 text-cyg-tertiary-container',
            ]"
          >
            搜尋中：{{ searchQuery }}
          </span>
        </div>
      </section>

      <div class="flex flex-wrap justify-center gap-3 mb-10">
        <button
          v-for="category in cygCategoryOptions"
          :key="category.id"
          type="button"
          :aria-pressed="category.id === activeCategoryId"
          :class="[
            'px-5 py-2.5 rounded-full font-semibold transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-cyg-primary/40',
            category.id === activeCategoryId
              ? 'bg-cyg-primary-container text-cyg-on-primary-container font-bold shadow-lg shadow-cyg-primary-container/30 transform hover:scale-105'
              : [
                  'shadow-sm hover:shadow-md hover:bg-cyg-tertiary/10 border border-transparent hover:border-cyg-tertiary/30',
                  isDarkMode
                    ? 'bg-cyg-surface-container-high/80 text-cyg-on-surface-variant hover:bg-cyg-surface-container-highest'
                    : 'bg-cyg-inverse-surface/85 text-cyg-inverse-on-surface/70',
                ],
          ]"
          @click="handleSelectCategory(category.id)"
        >
          <span>{{ category.label }}</span>
          <span class="ml-2 text-xs opacity-75">{{ category.itemCount }}</span>
        </button>
      </div>

      <div
        v-if="visibleItems.length === 0"
        :class="[
          'rounded-3xl border border-dashed p-10 text-center',
          isDarkMode ? 'border-cyg-outline-variant text-cyg-on-surface-variant' : 'border-cyg-outline text-cyg-inverse-on-surface/60',
        ]"
      >
        目前篩選條件沒有對應片段。
      </div>

      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <article
          v-for="item in visibleItems"
          :key="item.id"
          :data-cyg-sound-id="item.id"
          :class="[
            'group relative cyg-glass rounded-[1.75rem] p-5 cyg-bounce-hover overflow-hidden text-left flex flex-col justify-between min-h-[11rem]',
            activeItemIds.has(item.id)
              ? [
                  'cyg-playing-card border-2 border-cyg-primary transform -translate-y-1',
                  isDarkMode ? 'bg-cyg-primary-container/20' : 'bg-cyg-primary-fixed/70',
                ]
              : [
                  'shadow-sm hover:shadow-xl hover:shadow-cyg-primary-container/20 transition-all duration-300 border',
                  isDarkMode
                    ? 'bg-cyg-surface-container-low/70 border-cyg-primary/10'
                    : 'bg-cyg-inverse-surface/75 border-cyg-outline/20',
                ],
          ]"
        >
          <button
            type="button"
            :aria-label="`Play ${item.title}`"
            :aria-pressed="activeItemIds.has(item.id)"
            :data-cyg-play-id="item.id"
            class="absolute inset-0 z-20 cursor-pointer rounded-[1.75rem] border-0 bg-transparent p-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-cyg-primary/40"
            @click="handlePlaySound(item)"
          />
          <div
            v-if="!activeItemIds.has(item.id)"
            class="absolute inset-0 bg-gradient-to-br from-cyg-primary/0 to-cyg-tertiary/0 group-hover:from-cyg-primary/10 group-hover:to-cyg-tertiary/10 transition-all duration-300"
          />
          <div
            v-else
            class="absolute inset-0 bg-gradient-to-br from-cyg-primary/10 to-cyg-tertiary/10 transition-all duration-300"
          />

          <div class="relative z-10 flex items-start justify-between gap-3">
            <span
              :class="[
                'inline-flex rounded-full px-3 py-1 text-[11px] font-bold border',
                activeItemIds.has(item.id)
                  ? 'bg-cyg-primary/14 border-cyg-primary/20 text-cyg-primary'
                  : isDarkMode
                    ? 'bg-cyg-surface-container-high border-cyg-primary/10 text-cyg-on-surface-variant'
                    : 'bg-cyg-outline/8 border-cyg-outline/20 text-cyg-inverse-on-surface/70',
              ]"
            >
              {{ item.badge }}
            </span>
            <span
              :class="[
                'text-[10px] font-bold tracking-[0.14em] uppercase',
                isDarkMode ? 'text-cyg-outline' : 'text-cyg-inverse-on-surface/45',
              ]"
            >
              <!-- {{ item.id }} -->
            </span>
          </div>

          <div class="relative z-10 mt-4 space-y-2">
            <div
              :class="[
                'font-bold leading-snug max-h-[3.2rem] overflow-hidden',
                activeItemIds.has(item.id)
                  ? isDarkMode
                    ? 'text-cyg-on-primary-container'
                    : 'text-cyg-inverse-primary'
                  : [
                      'group-hover:text-cyg-primary',
                      isDarkMode ? 'text-cyg-on-surface' : 'text-cyg-inverse-on-surface',
                    ],
              ]"
            >
              {{ item.title }}
            </div>
            <div
              :class="[
                'text-[11px]',
                isDarkMode ? 'text-cyg-on-surface-variant' : 'text-cyg-inverse-on-surface/55',
              ]"
            >
              <!-- {{ item.filename }} -->
            </div>
          </div>

          <div class="relative z-10 mt-4 flex justify-between items-end gap-3">
            <!-- <span
              :class="[
                'text-xs font-mono',
                activeItemIds.has(item.id)
                  ? 'text-cyg-primary font-bold'
                  : isDarkMode
                    ? 'text-cyg-on-surface-variant'
                    : 'text-cyg-inverse-on-surface/55',
              ]"
            >
              {{ metaLabelFor(item) }}
            </span>
            <button
              v-if="activeItemIds.has(item.id)"
              type="button"
              :aria-label="`Stop ${item.title}`"
              :data-cyg-stop-id="item.id"
              class="relative z-30 bg-cyg-primary-container w-10 h-10 flex items-center justify-center rounded-full text-cyg-on-primary-container shadow-md shadow-cyg-primary-container/30 transition-transform group-hover:scale-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-cyg-primary/40"
              @click="handleStopSound(item.id)"
            >
              <span class="material-icons-round text-base">stop</span>
            </button> -->
          </div>

          <div
            v-if="activeItemIds.has(item.id)"
            class="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-cyg-primary-container via-cyg-tertiary to-cyg-primary transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(255,179,178,0.72)]"
            :class="loopEnabled && progressFor(item.id) === 0 ? 'animate-pulse w-full' : ''"
            :style="{ width: `${Math.max(progressFor(item.id) * 100, loopEnabled ? 100 : 4)}%` }"
          />
          <div
            v-else
            class="absolute bottom-0 left-0 h-1 bg-cyg-primary-container w-0 group-hover:w-full transition-all duration-500 ease-out"
          />
        </article>
      </div>
    </main>

    <div class="fixed bottom-6 inset-x-0 z-50 px-4">
      <div
        :class="[
          'max-w-lg mx-auto cyg-glass rounded-3xl p-3 shadow-2xl shadow-cyg-primary-container/10 border flex items-center justify-center gap-4 transition-all duration-300',
          isDarkMode ? 'bg-cyg-surface-container-low/95 border-cyg-primary/20' : 'bg-cyg-inverse-surface/95 border-cyg-outline/30',
        ]"
      >
        <button
          type="button"
          :aria-pressed="allowOverlap"
          :title="`Audio Overlap: ${allowOverlap ? 'On' : 'Off'}`"
          :class="[
            'group relative p-3 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-cyg-primary/40',
            allowOverlap
              ? 'bg-cyg-primary/10 text-cyg-primary border border-cyg-primary/20 hover:bg-cyg-primary/20'
              : isDarkMode
                ? 'hover:bg-cyg-surface-container-high text-cyg-outline hover:text-cyg-primary'
                : 'hover:bg-cyg-outline/10 text-cyg-inverse-on-surface/50 hover:text-cyg-inverse-primary',
          ]"
          @click="handleToggleOverlap"
        >
          <span class="material-icons-round text-2xl">layers</span>
          <span
            v-if="allowOverlap"
            :class="[
              'absolute top-2 right-2 w-2 h-2 bg-[#57c7ff] rounded-full shadow-sm ring-2',
              isDarkMode ? 'ring-cyg-surface-container-low' : 'ring-cyg-inverse-surface',
            ]"
          />
          <span class="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-cyg-surface-container-highest text-cyg-on-surface text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Audio Overlap
          </span>
        </button>

        <button
          type="button"
          :aria-pressed="loopEnabled"
          :title="`Single Loop: ${loopEnabled ? 'On' : 'Off'}`"
          :class="[
            'group relative p-3 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-cyg-primary/40',
            loopEnabled
              ? 'bg-cyg-primary/10 text-cyg-primary border border-cyg-primary/20 hover:bg-cyg-primary/20'
              : isDarkMode
                ? 'hover:bg-cyg-surface-container-high text-cyg-outline hover:text-cyg-primary'
                : 'hover:bg-cyg-outline/10 text-cyg-inverse-on-surface/50 hover:text-cyg-inverse-primary',
          ]"
          @click="handleToggleLoop"
        >
          <span class="material-icons-round text-2xl">repeat_one</span>
          <span
            v-if="loopEnabled"
            :class="[
              'absolute top-2 right-2 w-2 h-2 bg-[#ffd166] rounded-full shadow-sm ring-2',
              isDarkMode ? 'ring-cyg-surface-container-low' : 'ring-cyg-inverse-surface',
            ]"
          />
          <span class="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-cyg-surface-container-highest text-cyg-on-surface text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Single Loop
          </span>
        </button>

        <button
          type="button"
          title="Shuffle Now"
          :class="[
            'group relative p-3 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-cyg-primary/40',
            isDarkMode
              ? 'hover:bg-cyg-surface-container-high text-cyg-on-surface-variant hover:text-cyg-primary'
              : 'hover:bg-cyg-outline/10 text-cyg-inverse-on-surface/70 hover:text-cyg-inverse-primary',
          ]"
          @click="handleShuffle"
        >
          <span class="material-icons-round text-2xl">shuffle</span>
          <span class="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-cyg-surface-container-highest text-cyg-on-surface text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Shuffle Now
          </span>
        </button>

        <button
          type="button"
          title="Stop All"
          :disabled="!canStopAll"
          :class="[
            'group relative p-3 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-cyg-error/40',
            canStopAll
              ? [
                  'text-cyg-error hover:scale-105',
                  isDarkMode ? 'hover:bg-cyg-error-container/10' : 'hover:bg-cyg-error/10',
                ]
              : 'text-cyg-outline opacity-50 cursor-not-allowed',
          ]"
          @click="handleStopAll"
        >
          <span class="material-icons-round text-2xl">stop_circle</span>
          <span class="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-cyg-surface-container-highest text-cyg-on-surface text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Stop All
          </span>
        </button>
      </div>
    </div>
  </div>
</template>
