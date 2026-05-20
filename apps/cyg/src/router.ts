import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

import CygSoundboardPage from "./pages/CygSoundboardPage.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "cyg",
    component: CygSoundboardPage,
    meta: { label: "Dragon Celebration System" },
  },
  {
    path: "/demo/cyg",
    name: "demo-cyg",
    component: CygSoundboardPage,
    meta: { label: "Dragon Celebration System" },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
