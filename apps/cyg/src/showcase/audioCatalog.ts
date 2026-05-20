export interface AudioCatalogEntry {
  readonly label: string;
  readonly path: `/audio/${string}`;
  readonly sourceFile: string;
}

export const audioCatalog = {
  alertDing: {
    label: "Alert Ding",
    path: "/audio/alert-ding.mp3",
    sourceFile: "docs/sounds/ding.mp3",
  },
  chatFq: {
    label: "Chat FQ",
    path: "/audio/chat-fq.mp3",
    sourceFile: "docs/sounds/FQ.mp3",
  },
  laughTrack: {
    label: "Laugh Track",
    path: "/audio/laugh-track.mp3",
    sourceFile: "docs/sounds/熙歌笑.mp3",
  },
  meowHello: {
    label: "Meow Hello",
    path: "/audio/meow-hello.ogg",
    sourceFile: "docs/sounds/喵哈囉.ogg",
  },
  reactionGuh: {
    label: "Reaction GUH",
    path: "/audio/reaction-guh.mp3",
    sourceFile: "docs/sounds/GUH.mp3",
  },
  reactionOmg: {
    label: "Reaction OMG",
    path: "/audio/reaction-omg.mp3",
    sourceFile: "docs/sounds/omg.mp3",
  },
  wtfSting: {
    label: "WTF Sting",
    path: "/audio/wtf-sting.mp3",
    sourceFile: "docs/sounds/WTF.mp3",
  },
} as const satisfies Record<string, AudioCatalogEntry>;

export type AudioCatalogId = keyof typeof audioCatalog;
