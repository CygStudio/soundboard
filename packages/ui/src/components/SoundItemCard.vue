<script setup lang="ts">
import type { SoundboardItem } from "@soundboard/core";

import { cn } from "../lib/cn";

defineOptions({
  name: "SoundItemCard",
});

const props = withDefaults(
  defineProps<{
    className?: string;
    isActive: boolean;
    item: SoundboardItem;
  }>(),
  {
    className: "",
  },
);

const emit = defineEmits<{
  (event: "toggle-play", itemId: string): void;
}>();
</script>

<template>
  <article
    :class="
      cn(
        'rounded-2xl border p-4 transition-colors',
        props.isActive
          ? 'border-cyan-300 bg-cyan-400/10'
          : 'border-white/10 bg-slate-900/70',
        props.className,
      )
    "
    >
      <div class="flex items-start justify-between gap-4">
        <div class="space-y-2">
          <p
            v-if="props.item.badge"
            class="text-xs font-medium uppercase tracking-[0.22em] text-cyan-300"
          >
            {{ props.item.badge }}
          </p>
          <h3 class="text-base font-semibold text-white">
            {{ props.item.title }}
          </h3>
          <p
            v-if="props.item.description"
          class="text-sm leading-6 text-slate-300"
        >
          {{ props.item.description }}
        </p>
      </div>

      <button
        :aria-pressed="props.isActive"
        :class="
          cn(
            'min-w-20 rounded-full px-4 py-2 text-sm font-medium transition-colors',
            props.isActive
              ? 'bg-cyan-400 text-slate-950'
              : 'bg-slate-800 text-slate-100 hover:bg-slate-700',
          )
        "
        :data-sound-id="props.item.id"
        type="button"
        @click="emit('toggle-play', props.item.id)"
      >
        {{ props.isActive ? "Pause" : "Play" }}
      </button>
    </div>
  </article>
</template>
