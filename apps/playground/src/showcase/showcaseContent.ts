import type { AudioCatalogId } from "./audioCatalog";

export interface ShowcaseCategory {
  readonly description: string;
  readonly id: string;
  readonly label: string;
}

export interface ShowcaseItem {
  readonly audioId: AudioCatalogId;
  readonly badge: string;
  readonly categoryId: string;
  readonly description: string;
  readonly id: string;
  readonly title: string;
}

export interface ShowcaseSection {
  readonly body: string;
  readonly id: string;
  readonly points: readonly string[];
  readonly title: string;
}

export interface ShowcaseVariant {
  readonly categories: readonly ShowcaseCategory[];
  readonly description: string;
  readonly headline: string;
  readonly highlights: readonly string[];
  readonly id: string;
  readonly items: readonly ShowcaseItem[];
  readonly label: string;
  readonly sections: readonly ShowcaseSection[];
  readonly eyebrow: string;
}

export const showcaseVariants = [
  {
    id: "streamer-mode",
    label: "Streamer Mode",
    eyebrow: "Featured Variant",
    headline: "Fast reactions, big hooks, and chat-first pacing.",
    description:
      "適合直播開場與高互動節奏，重點是讓觀眾快速聽到標誌性 cue 並立刻理解 soundboard 的使用情境。",
    highlights: [
      "Hero 區主打開場、反應與 chat cue",
      "Widget 先展示高辨識短音效與 reaction 類別",
      "強調可嵌入直播頁、導播台與互動 overlay",
    ],
    categories: [
      {
        id: "openers",
        label: "Openers",
        description: "用來建立直播節奏的開場與轉場聲音。",
      },
      {
        id: "chat-hype",
        label: "Chat Hype",
        description: "聊天室刷屏時最容易重複觸發的反應短音。",
      },
    ],
    items: [
      {
        id: "streamer-intro",
        title: "Meow Hello",
        description: "俐落的開場 cue，適合剛進場或切主畫面時播放。",
        categoryId: "openers",
        audioId: "meowHello",
        badge: "Intro",
      },
      {
        id: "streamer-alert-ding",
        title: "Alert Ding",
        description: "短促通知音，適合訂閱、追隨或任務完成提示。",
        categoryId: "openers",
        audioId: "alertDing",
        badge: "Alert",
      },
      {
        id: "streamer-omg",
        title: "OMG",
        description: "高反差 reaction，適合聊天室突發爆點。",
        categoryId: "chat-hype",
        audioId: "reactionOmg",
        badge: "Reaction",
      },
      {
        id: "streamer-wtf",
        title: "WTF",
        description: "更戲劇化的驚訝短音，可和其他 cue 疊加使用。",
        categoryId: "chat-hype",
        audioId: "wtfSting",
        badge: "Punch",
      },
    ],
    sections: [
      {
        id: "operator-notes",
        title: "Operator Notes",
        body: "把主畫面文案、展示卡片與 widget 播放內容收斂成同一份資料，才能真正驗證切 variant 時的同步行為。",
        points: [
          "Vue 與 Shadow DOM 展示都要一起切換",
          "預設展示可立即播放的短音效集合",
        ],
      },
      {
        id: "embed-context",
        title: "Embed Context",
        body: "這個 variant 強調直播情境中的高頻率觸發，適合拿來驗證 overlap 與 stop-all 等共享播放控制。",
        points: [
          "重點驗證單一 active 與 overlap 切換",
          "主視覺與內容區塊由 app page shell 承接",
        ],
      },
    ],
  },
  {
    id: "late-night-lab",
    label: "Late Night Lab",
    eyebrow: "Secondary Variant",
    headline: "Softer ambience, slower pacing, same reusable widget core.",
    description:
      "用較安靜的實驗室節奏展示同一顆 widget 如何承接另一種頁面故事與內容排列，而不改變 package 邊界。",
    highlights: [
      "Hero 區改成深夜實驗感與長時間陪伴情境",
      "分類會偏向 ambience 與低頻反應音",
      "同一頁面資料源仍能同步驅動兩種嵌入模式",
    ],
    categories: [
      {
        id: "ambient-bed",
        label: "Ambient Bed",
        description: "適合在較長段落中反覆觸發的陪伴型背景音。",
      },
      {
        id: "soft-reactions",
        label: "Soft Reactions",
        description: "比較收斂但仍有辨識度的短促互動音效。",
      },
    ],
    items: [
      {
        id: "lab-guh",
        title: "GUH",
        description: "短短一拍的無奈反應，適合失誤或實驗翻車時插入。",
        categoryId: "soft-reactions",
        audioId: "reactionGuh",
        badge: "Reaction",
      },
      {
        id: "lab-fq",
        title: "FQ",
        description: "更輕量的碎念音，可和較長 ambience 段落穿插。",
        categoryId: "soft-reactions",
        audioId: "chatFq",
        badge: "Chat",
      },
      {
        id: "lab-laugh-track",
        title: "Laugh Track",
        description: "溫和笑聲，適合收尾或回應聊天室互動。",
        categoryId: "ambient-bed",
        audioId: "laughTrack",
        badge: "Mood",
      },
      {
        id: "lab-alert-ding",
        title: "Night Shift Ding",
        description: "保留通知感，但比 streamer 版本更克制的節奏用音。",
        categoryId: "ambient-bed",
        audioId: "alertDing",
        badge: "Utility",
      },
    ],
    sections: [
      {
        id: "page-shell-boundary",
        title: "Page Shell Boundary",
        body: "頁面殼層保留在 playground，widget 只接收可重用的 soundboard 資料與播放控制需求。",
        points: [
          "不把 hero、介紹與故事節奏塞回 widget",
          "variant-specific 文案只存在於 app 端",
        ],
      },
      {
        id: "playback-focus",
        title: "Playback Focus",
        body: "這個 variant 特別適合驗證 loop、random 與 stop-all 是否都只作用在目前可見項目集合。",
        points: [
          "切換 category 時要清理不再可見的 active 音效",
          "random 只從目前 active category 的項目中挑選",
        ],
      },
    ],
  },
] as const satisfies readonly ShowcaseVariant[];
