## ADDED Requirements

### Requirement: Playground 提供對齊設計稿的完整 desktop 體驗頁
`apps/playground` SHALL 提供與 Stitch 主畫面對齊的完整 desktop 頁面體驗，並在單一頁面中承接本次納入的 variants，而不是僅顯示最小 widget 掛載示範。

#### Scenario: 使用者開啟 playground 首頁
- **WHEN** 使用者載入 `apps/playground`
- **THEN** 頁面會顯示完整的版面結構、內容區塊、variant 切換表面與 soundboard 展示區，而不是只有簡化的技術 demo 容器

### Requirement: Playground 在單一頁面切換既有 variants
`apps/playground` SHALL 讓使用者在不離開目前頁面的前提下，切換本次納入的 Stitch variants，並以同一個 active variant 同步更新頁面內容與兩種 widget 展示。

#### Scenario: 使用者切換 variant
- **WHEN** 使用者在 playground 啟用另一個 variant
- **THEN** hero、內容區塊、Vue 元件版 widget 與 Shadow DOM 掛載版 widget 都會切換到相同的 active variant 資料

### Requirement: Playground 同時展示兩種 widget 消費模式
`apps/playground` SHALL 在完整頁面中同時展示 Vue 元件入口與 Shadow DOM mount helper 入口，並使用一致的 active variant 展示資料。

#### Scenario: 使用者瀏覽 soundboard 展示區
- **WHEN** 頁面載入完成
- **THEN** 使用者可以在同一個 playground 中看到 Vue 元件版與 Shadow DOM 掛載版的 soundboard 展示

### Requirement: Playground 頁面內容與 widget 資料必須由同一份展示資料驅動
系統 SHALL 以同一份資料來源驅動頁面層內容與 widget 所需輸入，避免兩套內容彼此漂移。

#### Scenario: 更新展示分類與音效項目內容
- **WHEN** 開發者調整 playground 展示資料
- **THEN** 頁面文案、variant-specific 區塊、卡片內容與 widget 顯示結果會同步反映相同資料集

### Requirement: Playground 不得把完整頁面殼層責任回灌到 widget package
系統 MUST 將 hero、介紹區、內容說明與其他頁面殼層保留在 `apps/playground`，而不是把這些頁面專屬元素移入 widget package。

#### Scenario: 開發者檢視頁面層與 widget 邊界
- **WHEN** 開發者檢查相關程式碼結構
- **THEN** 完整頁面區塊實作位於 `apps/playground`，而 widget package 仍只負責可重用的 soundboard 體驗
