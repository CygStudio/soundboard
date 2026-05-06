<script setup lang="ts">
import { cn } from "@soundboard/ui";

import type { ShowcaseVariant } from "../showcase/showcaseContent";

defineOptions({
  name: "VariantSelector",
});

const props = defineProps<{
  activeVariantId: string;
  variants: readonly ShowcaseVariant[];
}>();

const emit = defineEmits<{
  (event: "variant-change", variantId: string): void;
}>();
</script>

<template>
  <section class="space-y-4">
    <div class="space-y-2">
      <p class="text-sm uppercase tracking-[0.24em] text-cyan-300">
        Variant Selector
      </p>
      <h2 class="text-2xl font-semibold text-white">
        One active variant drives the entire playground surface.
      </h2>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <button
        v-for="variant in props.variants"
        :key="variant.id"
        :aria-pressed="variant.id === props.activeVariantId"
        :class="
          cn(
            'space-y-3 rounded-[28px] border p-5 text-left transition-colors',
            variant.id === props.activeVariantId
              ? 'border-cyan-300 bg-cyan-400/10'
              : 'border-white/10 bg-slate-900/70 hover:border-white/20 hover:bg-slate-900/85',
          )
        "
        :data-variant-id="variant.id"
        type="button"
        @click="emit('variant-change', variant.id)"
      >
        <p class="text-xs uppercase tracking-[0.22em] text-cyan-300">
          {{ variant.eyebrow }}
        </p>
        <div class="space-y-2">
          <h3 class="text-xl font-semibold text-white">
            {{ variant.label }}
          </h3>
          <p class="text-sm leading-6 text-slate-300">
            {{ variant.description }}
          </p>
        </div>
      </button>
    </div>
  </section>
</template>
