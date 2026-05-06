<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";

const route = useRoute();

interface NavLink {
  readonly to: string;
  readonly label: string;
}

const navLinks: readonly NavLink[] = [
  { to: "/", label: "Playground" },
  { to: "/demo/henya", label: "Henya Demo" },
];

const showFloatingNav = computed(() => route.path !== "/demo/henya");
</script>

<template>
  <div>
    <nav
      v-if="showFloatingNav"
      class="fixed top-4 right-4 z-[60] flex gap-2 rounded-full border border-white/10 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-200 backdrop-blur"
    >
      <RouterLink
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        class="rounded-full px-3 py-1 transition-colors"
        active-class="bg-cyan-400 text-slate-950"
      >
        {{ link.label }}
      </RouterLink>
    </nav>

    <RouterView />
  </div>
</template>
