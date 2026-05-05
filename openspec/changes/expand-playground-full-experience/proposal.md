## Why

目前的 `apps/playground` 只驗證最小的 widget 掛載能力，還沒有承接設計稿中的完整頁面層互動、內容編排與多 variant 展示情境，也仍使用 placeholder URL 而非實際可播放的音檔。現在補齊這一層，才能把 playground 從工程驗證頁升級成對齊設計稿、可真實展示產品體驗的開發與驗收表面。

## What Changes

- 擴充 `apps/playground`，使其支援設計稿中的完整 desktop 體驗，並可在同一頁切換目前納入的 Stitch variants。
- 將頁面內容從最小技術 demo 提升為完整 showcase，包含對應的版面結構、內容區塊、互動流程，以及由同一份 variant-aware 資料驅動的 widget 嵌入情境。
- 擴充 `packages/core`、`packages/ui` 與 `packages/widget` 的共享播放控制，支援 overlap、loop、random 與 stop-all，並維持 Vue 元件入口與 Shadow DOM 掛載入口的功能對齊。
- 將 `docs/sounds/` 作為範例音檔的來源目錄，挑選本次需要的音檔後複製到 `apps/playground` 的穩定靜態資產路徑，供 playground 與 widget 播放。
- 補齊必要的驗證與文件，確保 playground 的完整體驗、共享播放控制與真實音檔資產能穩定整合進現有 monorepo。

## Non-goals

- 本次 change 不處理正式品牌官網上線、部署、SEO 或行銷追蹤。
- 本次 change 不處理 CMS、遠端音檔管理、使用者上傳或後台編輯流程。
- 本次 change 不處理正式商用音檔採購或大型素材庫整合；只交付專案可合法使用的範例音檔集合。
- 本次 change 不擴充多 widget instance 之間的跨頁同步播放協調。

## Capabilities

### New Capabilities
- `playground-full-experience`: 定義 `apps/playground` 必須提供與設計稿對齊的完整頁面層體驗、展示區塊與 widget 整合流程。
- `sample-audio-assets`: 定義專案內可實際播放的範例音檔資產、資料契約與載入限制。

### Modified Capabilities

- `soundboard-widget`: 擴充 widget 的共享播放控制與展示 metadata 承接能力，讓 Vue 與 Shadow DOM 兩種入口都能支援同一套進階播放互動。

## Impact

- 主要影響 `apps/playground` 的頁面組裝、variant-aware 展示資料、靜態資產與開發體驗。
- 需要調整 `packages/core`、`packages/ui`、`packages/widget` 的資料模型、呈現層與播放整合表面，以承接共享播放控制與更完整的展示需求。
- `docs/sounds/` 會成為範例音檔的來源集合，而 playground 會使用複製後的 app-local 靜態資產與相關 metadata / 引用方式。
- 需要持續對齊 Stitch 設計稿，必要時使用 Stitch MCP 讀取畫面內容與結構。
