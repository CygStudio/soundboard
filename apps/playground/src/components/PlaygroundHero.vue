<script setup lang="ts">
import type { ShowcaseVariant } from "../showcase/showcaseContent";

defineOptions({
  name: "PlaygroundHero",
});

const props = defineProps<{
  variant: ShowcaseVariant;
}>();
</script>

<template>
  <section
    class="grid gap-6 rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_rgba(15,23,42,0.92)_55%)] p-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]"
  >
    <div class="space-y-5">
      <div class="space-y-3">
        <p class="text-sm uppercase tracking-[0.24em] text-cyan-300">
          {{ props.variant.eyebrow }}
        </p>
        <h1 class="text-4xl font-semibold leading-tight text-white lg:text-5xl">
          {{ props.variant.label }}
        </h1>
        <p class="max-w-3xl text-lg leading-8 text-slate-200">
          {{ props.variant.headline }}
        </p>
      </div>

      <p class="max-w-3xl text-base leading-7 text-slate-300">
        {{ props.variant.description }}
      </p>
    </div>

    <div class="rounded-[28px] border border-white/10 bg-slate-950/50 p-6">
      <p class="text-sm uppercase tracking-[0.22em] text-cyan-300">
        Experience Focus
      </p>
      <ul class="mt-4 space-y-3 text-sm leading-6 text-slate-200">
        <li
          v-for="highlight in props.variant.highlights"
          :key="highlight"
          class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
        >
          {{ highlight }}
        </li>
      </ul>
    </div>
  </section>
</template>
