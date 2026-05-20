import type { SoundboardCategory, SoundboardInput, SoundboardItem } from "@soundboard/core";

import soundboardData from "../../../../assets/soundboard-data.json";

interface CygSourceSoundItem {
  readonly id: string;
  readonly categoryId: string;
  readonly title: string;
  readonly subcategory: string | null;
  readonly filename: string;
  readonly audioUrl: string;
}

interface CygSourceData {
  readonly categories: readonly SoundboardCategory[];
  readonly items: readonly CygSourceSoundItem[];
}

export interface CygSoundItem extends SoundboardItem {
  readonly subcategory: string | null;
  readonly filename: string;
  readonly durationLabel: string;
  readonly audioUrl: string;
}

export interface CygCategoryOption extends SoundboardCategory {
  readonly itemCount: number;
}

const cygSourceData = soundboardData satisfies CygSourceData;

export const CYG_ALL_CATEGORY_ID = "all";

export const cygBaseCategories = cygSourceData.categories.map((category) => ({ ...category }));

export const cygCategoryOptions: readonly CygCategoryOption[] = [
  {
    id: CYG_ALL_CATEGORY_ID,
    label: "全部龍焰",
    itemCount: cygSourceData.items.length,
  },
  ...cygBaseCategories.map((category) => ({
    ...category,
    itemCount: cygSourceData.items.filter((item) => item.categoryId === category.id).length,
  })),
];

export const cygCategories: readonly SoundboardCategory[] = cygCategoryOptions.map(
  ({ itemCount, ...category }) => {
    void itemCount;
    return category;
  },
);

export const cygSoundItems: readonly CygSoundItem[] = cygSourceData.items.map((item) => ({
  ...item,
  badge: item.subcategory ?? item.categoryId,
  description: `${item.id} · ${item.filename}`,
  durationLabel: item.subcategory ?? item.id,
}));

export const cygTopCategories = [...cygCategoryOptions]
  .filter((category) => category.id !== CYG_ALL_CATEGORY_ID)
  .sort((left, right) => right.itemCount - left.itemCount)
  .slice(0, 3);

export const cygSummary = {
  totalCategories: cygBaseCategories.length,
  totalItems: cygSoundItems.length,
  taggedItems: cygSoundItems.filter((item) => item.subcategory !== null).length,
} as const;

export const cygSoundboardInput: SoundboardInput = {
  categories: cygBaseCategories.map((category) => ({ ...category })),
  items: cygSoundItems.map(({ durationLabel, filename, subcategory, ...item }) => {
    void durationLabel;
    void filename;
    void subcategory;
    return item;
  }),
  initialCategoryId: cygBaseCategories[0]?.id,
};
