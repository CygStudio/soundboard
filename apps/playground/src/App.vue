<script setup lang="ts">
import {
  SoundboardWidget,
  mountSoundboardWidget,
  type MountedSoundboardWidget,
} from "@soundboard/widget";
import { onBeforeUnmount, onMounted, ref } from "vue";

const soundboard = {
  categories: [
    { id: "ambient", label: "Ambient" },
    { id: "alerts", label: "Alerts" },
  ],
  items: [
    {
      id: "rain",
      categoryId: "ambient",
      title: "Rain",
      audioUrl: "https://example.com/rain.mp3",
    },
    {
      id: "ping",
      categoryId: "alerts",
      title: "Ping",
      audioUrl: "https://example.com/ping.mp3",
    },
  ],
};

const mountTarget = ref<HTMLElement | null>(null);

let mountedWidget: MountedSoundboardWidget | null = null;

onMounted(() => {
  if (mountTarget.value === null) {
    return;
  }

  mountedWidget = mountSoundboardWidget(mountTarget.value, {
    soundboard,
  });
});

onBeforeUnmount(() => {
  mountedWidget?.unmount();
  mountedWidget = null;
});
</script>

<template>
  <main class="min-h-screen bg-slate-950 px-6 py-10 text-white">
    <div class="mx-auto max-w-6xl space-y-8">
      <header class="space-y-3">
        <p class="text-sm uppercase tracking-[0.24em] text-cyan-300">
          Playground
        </p>
        <h1 class="text-4xl font-semibold text-white">
          Soundboard widget integration surface
        </h1>
        <p class="max-w-3xl text-base leading-7 text-slate-300">
          同一份資料同時展示 Vue 元件入口與 Shadow DOM mount helper，
          驗證 widget 可獨立嵌入而不依賴品牌殼層。
        </p>
      </header>

      <section class="grid gap-8 xl:grid-cols-2">
        <div class="space-y-4 rounded-[32px] border border-white/10 bg-slate-900/60 p-6">
          <div class="space-y-2">
            <h2 class="text-xl font-semibold text-white">
              Vue component
            </h2>
            <p class="text-sm leading-6 text-slate-300">
              宿主直接引入 `SoundboardWidget` 元件，由宿主自己的 Tailwind
              編譯流程負責樣式。
            </p>
          </div>

          <SoundboardWidget :soundboard="soundboard" />
        </div>

        <div class="space-y-4 rounded-[32px] border border-white/10 bg-slate-900/60 p-6">
          <div class="space-y-2">
            <h2 class="text-xl font-semibold text-white">
              Shadow DOM mount helper
            </h2>
            <p class="text-sm leading-6 text-slate-300">
              `mountSoundboardWidget()` 會把打包後的 widget 掛進目標 DOM，
              並把樣式限制在 Shadow DOM 內。
            </p>
          </div>

          <div
            ref="mountTarget"
            class="rounded-[28px] border border-dashed border-cyan-400/30 bg-slate-950/60 p-4"
          />
        </div>
      </section>
    </div>
  </main>
</template>
