<script setup lang="ts">
import type { SoundboardCategory } from "@soundboard/core";

import { cn } from "../lib/cn";

defineOptions({
  name: "CategoryTabs",
});

const props = withDefaults(
  defineProps<{
    activeCategoryId: string | null;
    categories: SoundboardCategory[];
    className?: string;
  }>(),
  {
    className: "",
  },
);

const emit = defineEmits<{
  (event: "category-change", categoryId: string): void;
}>();
</script>

<template>
  <div
    :class="
      cn(
        'flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-slate-900/70 p-2',
        props.className,
      )
    "
  >
    <button
      v-for="category in props.categories"
      :key="category.id"
      :aria-pressed="category.id === props.activeCategoryId"
      :data-category-id="category.id"
      :class="
        cn(
          'rounded-xl px-4 py-2 text-sm font-medium transition-colors',
          category.id === props.activeCategoryId
            ? 'bg-cyan-400 text-slate-950'
            : 'bg-slate-800 text-slate-200 hover:bg-slate-700',
        )
      "
      type="button"
      @click="emit('category-change', category.id)"
    >
      {{ category.label }}
    </button>
  </div>
</template>
