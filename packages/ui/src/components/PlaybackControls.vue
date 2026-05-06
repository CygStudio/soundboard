<script setup lang="ts">
import { cn } from "../lib/cn";

defineOptions({
  name: "PlaybackControls",
});

const props = withDefaults(
  defineProps<{
    allowOverlap: boolean;
    canStopAll: boolean;
    className?: string;
    loopEnabled: boolean;
  }>(),
  {
    className: "",
  },
);

const emit = defineEmits<{
  (event: "play-random"): void;
  (event: "stop-all"): void;
  (event: "toggle-loop"): void;
  (event: "toggle-overlap"): void;
}>();
</script>

<template>
  <div
    :class="
      cn(
        'flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/70 p-2',
        props.className,
      )
    "
  >
    <button
      :aria-pressed="props.allowOverlap"
      :class="
        cn(
          'rounded-xl px-4 py-2 text-sm font-medium transition-colors',
          props.allowOverlap
            ? 'bg-cyan-400 text-slate-950'
            : 'bg-slate-800 text-slate-100 hover:bg-slate-700',
        )
      "
      data-action="toggle-overlap"
      type="button"
      @click="emit('toggle-overlap')"
    >
      Overlap
    </button>

    <button
      :aria-pressed="props.loopEnabled"
      :class="
        cn(
          'rounded-xl px-4 py-2 text-sm font-medium transition-colors',
          props.loopEnabled
            ? 'bg-cyan-400 text-slate-950'
            : 'bg-slate-800 text-slate-100 hover:bg-slate-700',
        )
      "
      data-action="toggle-loop"
      type="button"
      @click="emit('toggle-loop')"
    >
      Loop
    </button>

    <button
      class="rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition-colors hover:bg-slate-700"
      data-action="play-random"
      type="button"
      @click="emit('play-random')"
    >
      Random
    </button>

    <button
      :disabled="!props.canStopAll"
      class="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors enabled:hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
      data-action="stop-all"
      type="button"
      @click="emit('stop-all')"
    >
      Stop all
    </button>
  </div>
</template>
