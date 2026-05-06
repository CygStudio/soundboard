<script setup lang="ts">
defineOptions({
  name: "PlaygroundSection",
});

const props = defineProps<{
  body: string;
  points: readonly string[];
  title: string;
}>();
</script>

<template>
  <article class="rounded-[28px] border border-white/10 bg-slate-900/70 p-6">
    <div class="space-y-3">
      <h3 class="text-xl font-semibold text-white">
        {{ props.title }}
      </h3>
      <p class="text-sm leading-7 text-slate-300">
        {{ props.body }}
      </p>
    </div>

    <ul class="mt-5 space-y-3 text-sm leading-6 text-slate-200">
      <li
        v-for="point in props.points"
        :key="point"
        class="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
      >
        {{ point }}
      </li>
    </ul>
  </article>
</template>
