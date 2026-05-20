import type { SoundboardCategory, SoundboardInput, SoundboardItem } from "@soundboard/core";

import { audioCatalog, type AudioCatalogId } from "./audioCatalog";

export interface CygSoundItem extends SoundboardItem {
  readonly durationLabel: string;
}

export const CYG_ALL_CATEGORY_ID = "all";

export const cygCategories: readonly SoundboardCategory[] = [
  { id: CYG_ALL_CATEGORY_ID, label: "All Sparks" },
  { id: "dragon-calls", label: "Dragon Calls" },
  { id: "party-bursts", label: "Party Bursts" },
  { id: "ritual-hype", label: "Ritual Hype" },
  { id: "ambient-glow", label: "Ambient Glow" },
];

interface CygSoundSeed {
  readonly id: string;
  readonly title: string;
  readonly categoryId: Exclude<(typeof cygCategories)[number]["id"], typeof CYG_ALL_CATEGORY_ID>;
  readonly audioId: AudioCatalogId;
  readonly durationLabel: string;
}

const cygSoundSeeds: readonly CygSoundSeed[] = [
  { id: "firecracker-roar", title: "Firecracker Roar", categoryId: "dragon-calls", audioId: "wtfSting", durationLabel: "0:04" },
  { id: "ruby-cheer", title: "Ruby Cheer", categoryId: "party-bursts", audioId: "reactionOmg", durationLabel: "0:01" },
  { id: "cake-spark", title: "Cake Spark", categoryId: "party-bursts", audioId: "alertDing", durationLabel: "0:08" },
  { id: "sky-lantern", title: "Sky Lantern", categoryId: "ambient-glow", audioId: "meowHello", durationLabel: "0:02" },
  { id: "scale-shimmer", title: "Scale Shimmer", categoryId: "ambient-glow", audioId: "chatFq", durationLabel: "0:03" },
  { id: "birthday-chant", title: "Birthday Chant", categoryId: "ritual-hype", audioId: "laughTrack", durationLabel: "0:06" },
  { id: "ember-drop", title: "Ember Drop", categoryId: "dragon-calls", audioId: "reactionGuh", durationLabel: "0:01" },
  { id: "neon-tail", title: "Neon Tail", categoryId: "party-bursts", audioId: "reactionOmg", durationLabel: "0:03" },
  { id: "wish-flame", title: "Wish Flame", categoryId: "ritual-hype", audioId: "alertDing", durationLabel: "0:03" },
  { id: "confetti-howl", title: "Confetti Howl", categoryId: "dragon-calls", audioId: "wtfSting", durationLabel: "0:04" },
];

export const cygSoundItems: readonly CygSoundItem[] = cygSoundSeeds.map((seed) => ({
  id: seed.id,
  title: seed.title,
  categoryId: seed.categoryId,
  audioUrl: audioCatalog[seed.audioId].path,
  durationLabel: seed.durationLabel,
}));

export const cygSoundboardInput: SoundboardInput = {
  categories: cygCategories.filter((category) => category.id !== CYG_ALL_CATEGORY_ID),
  items: cygSoundItems.map(({ durationLabel, ...item }) => {
    void durationLabel;
    return item;
  }),
};
