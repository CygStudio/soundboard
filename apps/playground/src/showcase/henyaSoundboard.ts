import type { SoundboardCategory, SoundboardInput, SoundboardItem } from "@soundboard/core";

import { audioCatalog, type AudioCatalogId } from "./audioCatalog";

export interface HenyaSoundItem extends SoundboardItem {
  readonly durationLabel: string;
}

export const HENYA_ALL_CATEGORY_ID = "all";

export const henyaCategories: readonly SoundboardCategory[] = [
  { id: HENYA_ALL_CATEGORY_ID, label: "All Sounds" },
  { id: "voice-clips", label: "Voice Clips" },
  { id: "cute-noises", label: "Cute Noises" },
  { id: "screams", label: "Screams" },
  { id: "bgm", label: "BGM" },
];

interface HenyaSoundSeed {
  readonly id: string;
  readonly title: string;
  readonly categoryId: Exclude<(typeof henyaCategories)[number]["id"], typeof HENYA_ALL_CATEGORY_ID>;
  readonly audioId: AudioCatalogId;
  readonly durationLabel: string;
}

const henyaSoundSeeds: readonly HenyaSoundSeed[] = [
  { id: "dayo", title: "Dayo!", categoryId: "voice-clips", audioId: "meowHello", durationLabel: "0:02" },
  { id: "kettle-noises", title: "Kettle Noises", categoryId: "cute-noises", audioId: "chatFq", durationLabel: "0:03" },
  { id: "listen", title: "Listen!", categoryId: "voice-clips", audioId: "reactionOmg", durationLabel: "0:01" },
  { id: "panic-scream", title: "Panic Scream", categoryId: "screams", audioId: "wtfSting", durationLabel: "0:04" },
  { id: "dummy", title: "Dummy!", categoryId: "voice-clips", audioId: "reactionGuh", durationLabel: "0:01" },
  { id: "start-stream", title: "Start Stream", categoryId: "bgm", audioId: "alertDing", durationLabel: "0:08" },
  { id: "sheeeesh", title: "Sheeeesh", categoryId: "voice-clips", audioId: "reactionOmg", durationLabel: "0:03" },
  { id: "konhenya", title: "Konhenya!", categoryId: "voice-clips", audioId: "meowHello", durationLabel: "0:02" },
  { id: "laughing", title: "Laughing", categoryId: "cute-noises", audioId: "laughTrack", durationLabel: "0:06" },
  { id: "otsuhenya", title: "Otsuhenya!", categoryId: "voice-clips", audioId: "alertDing", durationLabel: "0:03" },
];

export const henyaSoundItems: readonly HenyaSoundItem[] = henyaSoundSeeds.map((seed) => ({
  id: seed.id,
  title: seed.title,
  categoryId: seed.categoryId,
  audioUrl: audioCatalog[seed.audioId].path,
  durationLabel: seed.durationLabel,
}));

export const henyaSoundboardInput: SoundboardInput = {
  categories: henyaCategories.filter((category) => category.id !== HENYA_ALL_CATEGORY_ID),
  items: henyaSoundItems.map(({ durationLabel, ...item }) => {
    void durationLabel;
    return item;
  }),
};
