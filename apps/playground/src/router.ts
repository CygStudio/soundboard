import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

import HenyaSoundboardPage from "./pages/HenyaSoundboardPage.vue";
import PlaygroundPage from "./pages/PlaygroundPage.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "playground",
    component: PlaygroundPage,
    meta: { label: "Playground" },
  },
  {
    path: "/demo/henya",
    name: "demo-henya",
    component: HenyaSoundboardPage,
    meta: { label: "Henya Soundboard" },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
