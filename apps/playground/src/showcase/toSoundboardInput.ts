import type { SoundboardInput } from "@soundboard/core";

import { audioCatalog } from "./audioCatalog";
import type { ShowcaseVariant } from "./showcaseContent";

export function toSoundboardInput(variant: ShowcaseVariant): SoundboardInput {
  return {
    categories: variant.categories.map((category) => ({
      id: category.id,
      label: category.label,
    })),
    items: variant.items.map((item) => {
      const audio = audioCatalog[item.audioId];

      if (audio === undefined) {
        throw new Error(`Unknown audio catalog entry: ${item.audioId}`);
      }

      return {
        id: item.id,
        badge: item.badge,
        categoryId: item.categoryId,
        title: item.title,
        description: item.description,
        audioUrl: audio.path,
      };
    }),
  };
}
