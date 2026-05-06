<script setup lang="ts">
import {
  SoundboardWidget,
  mountSoundboardWidget,
  type MountedSoundboardWidget,
} from "@soundboard/widget";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

import PlaygroundHero from "./components/PlaygroundHero.vue";
import PlaygroundSection from "./components/PlaygroundSection.vue";
import VariantSelector from "./components/VariantSelector.vue";
import { showcaseVariants } from "./showcase/showcaseContent";
import { toSoundboardInput } from "./showcase/toSoundboardInput";

const mountTarget = ref<HTMLElement | null>(null);
const activeVariantId = ref<string>(showcaseVariants[0]?.id ?? "");

let mountedWidget: MountedSoundboardWidget | null = null;

const activeVariant = computed(() => {
  const variant = showcaseVariants.find((entry) => entry.id === activeVariantId.value);

  if (variant === undefined) {
    throw new Error(`Unknown playground variant id: ${activeVariantId.value}`);
  }

  return variant;
});

const activeSoundboard = computed(() => toSoundboardInput(activeVariant.value));

onMounted(() => {
  if (mountTarget.value === null) {
    throw new Error("Missing shadow widget mount target");
  }

  mountedWidget = mountSoundboardWidget(mountTarget.value, {
    soundboard: activeSoundboard.value,
  });
});

watch(activeSoundboard, (soundboard) => {
  mountedWidget?.update({ soundboard });
});

onBeforeUnmount(() => {
  mountedWidget?.unmount();
  mountedWidget = null;
});
</script>

<template>
  <main class="min-h-screen bg-slate-950 px-6 py-10 text-white">
    <div class="mx-auto max-w-7xl space-y-10">
      <header class="space-y-3">
        <p class="text-sm uppercase tracking-[0.24em] text-cyan-300">
          Playground
        </p>
        <h1 class="text-4xl font-semibold text-white">
          Expand the widget demo into a full variant-driven desktop experience.
        </h1>
        <p class="max-w-3xl text-base leading-7 text-slate-300">
          同一份 active variant 同步驅動頁面文案、Vue 元件入口與 Shadow
          DOM mount helper，讓 playground 變成真正可驗收的 showcase surface。
        </p>
      </header>

      <PlaygroundHero :variant="activeVariant" />

      <VariantSelector
        :active-variant-id="activeVariantId"
        :variants="showcaseVariants"
        @variant-change="activeVariantId = $event"
      />

      <section class="grid gap-6 xl:grid-cols-2">
        <PlaygroundSection
          v-for="section in activeVariant.sections"
          :key="section.id"
          :body="section.body"
          :points="section.points"
          :title="section.title"
        />
      </section>

      <section class="grid gap-8 xl:grid-cols-2">
        <div class="space-y-4 rounded-[32px] border border-white/10 bg-slate-900/60 p-6">
          <div class="space-y-2">
            <h2 class="text-xl font-semibold text-white">
              Vue component
            </h2>
            <p class="text-sm leading-6 text-slate-300">
              直接消費同一份 `activeVariant` 派生出的 widget input，驗證 Vue
              入口與 page shell 同步切換。
            </p>
          </div>

          <SoundboardWidget :soundboard="activeSoundboard" />
        </div>

        <div class="space-y-4 rounded-[32px] border border-white/10 bg-slate-900/60 p-6">
          <div class="space-y-2">
            <h2 class="text-xl font-semibold text-white">
              Shadow DOM mount helper
            </h2>
            <p class="text-sm leading-6 text-slate-300">
              透過同一份 `activeVariant` 驅動掛載版 widget，驗證宿主殼層與
              Shadow DOM 內部樣式仍維持解耦。
            </p>
          </div>

          <div
            ref="mountTarget"
            data-shadow-widget-host
            class="rounded-[28px] border border-dashed border-cyan-400/30 bg-slate-950/60 p-4"
          />
        </div>
      </section>
    </div>
  </main>
</template>
