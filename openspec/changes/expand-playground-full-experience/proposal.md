## Why

目前的 `apps/playground` 只驗證最小的 widget 掛載能力，還沒有承接設計稿中的完整頁面層互動、內容編排與展示情境，也仍使用範例 URL 而非實際可播放的音檔。現在補齊這一層，才能把 playground 從工程驗證頁升級成對齊設計稿、可真實展示產品體驗的開發與驗收表面。

## What Changes

- 擴充 `apps/playground`，使其支援設計稿中的完整 desktop 體驗，而不只是一個 widget 掛載示範區。
- 將頁面內容從最小技術 demo 提升為完整 showcase，包含對應的版面結構、內容區塊、互動流程與 widget 嵌入情境。
- 新增一組可隨專案一起管理的範例實際音檔，供 playground 與 widget 播放，不再使用程式化音頻模擬或不可用的 placeholder URL。
- 定義範例音檔的來源、格式、命名、載入方式與版權/使用約束，讓本機開發與後續展示有穩定素材。
- 補齊必要的驗證與文件，確保 playground 的完整體驗與真實音檔資產能穩定整合進現有 monorepo。

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

- 無。

## Impact

- 主要影響 `apps/playground` 的頁面組裝、內容資料、靜態資產與開發體驗。
- 可能需要調整 `packages/core`、`packages/widget` 的資料模型與播放整合表面，以承接更完整的展示需求。
- 會新增可提交到 repo 的範例音檔與相關 metadata / 引用方式。
- 需要持續對齊 Stitch 設計稿，必要時使用 Stitch MCP 讀取畫面內容與結構。
