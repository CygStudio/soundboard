## 為什麼

目前的設計探索已經清楚分出兩個需求：一個是可重用的 soundboard widget，另一個是支撐後續開發的穩定 monorepo 基礎。現在一起處理，能先驗證 package 邊界、工具鏈與嵌入模型，避免後續把更多頁面層需求疊在暫時性的專案結構上。

## 變更內容

- 建立以 `pnpm` 管理、由 `moon` 編排的 monorepo，提供共享的 TypeScript、lint、test 與 build 流程。
- 明確拆出 `packages/core`、`packages/ui`、`packages/widget`，以及用於本機開發與設計驗證的 `apps/playground`。
- 定義並交付第一版可運作的 soundboard widget，支援分類切換、音效項目呈現與基礎播放互動。
- 將品牌感較重的 landing page 殼層排除在 widget 邊界外，讓 widget 能獨立嵌入 `playground` 與未來宿主。
- 將初始工具鏈標準化為 TypeScript、Vite 8、Vitest、Vue、Oxlint 與 Rolldown。

## Non-goals

- 本次 change 不處理完整 Stitch 首頁、hero 區塊、導覽列與其他品牌殼層還原。
- 本次 change 不處理 CMS、遠端 API、內容管理後台或音效資產上傳流程。
- 本次 change 不處理多個 widget instance 之間的同步播放或全域播放協調。
- 本次 change 不處理 SSR、部署流程或正式營運環境基礎設施。

## 能力範圍

### 新增能力
- `soundboard-workspace`：定義 soundboard 專案的 monorepo 佈局、共享工具鏈與 package / app 責任邊界。
- `soundboard-widget`：定義第一版可重用 widget 的介面，包括分類導覽、音效項目呈現與播放行為。

### 調整既有能力
- 無。

## 影響

- 新增 `packages/` 與 `apps/` 為主的多 package 儲存庫結構。
- 新增 `moon`、`pnpm`、TypeScript、Vite、Vitest、Oxlint、Rolldown 的 workspace 級設定。
- 明確建立 domain logic、Vue UI 元件與 embeddable widget 入口之間的公開邊界。
- 為後續 app shell 與品牌視覺工作建立基礎契約，但不將這些需求綁入第一版 widget 交付範圍。
