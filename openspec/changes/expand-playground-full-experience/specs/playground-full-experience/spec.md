## ADDED Requirements

### Requirement: Playground 提供對齊設計稿的完整 desktop 體驗頁
`apps/playground` SHALL 提供與 Stitch 主畫面對齊的完整 desktop 頁面體驗，而不是僅顯示最小 widget 掛載示範。

#### Scenario: 使用者開啟 playground 首頁
- **WHEN** 使用者載入 `apps/playground`
- **THEN** 頁面會顯示完整的版面結構、內容區塊與 soundboard 展示區，而不是只有簡化的技術 demo 容器

### Requirement: Playground 同時展示兩種 widget 消費模式
`apps/playground` SHALL 在完整頁面中同時展示 Vue 元件入口與 Shadow DOM mount helper 入口，並使用一致的展示資料。

#### Scenario: 使用者瀏覽 soundboard 展示區
- **WHEN** 頁面載入完成
- **THEN** 使用者可以在同一個 playground 中看到 Vue 元件版與 Shadow DOM 掛載版的 soundboard 展示

### Requirement: Playground 頁面內容與 widget 資料必須由同一份展示資料驅動
系統 SHALL 以同一份資料來源驅動頁面層內容與 widget 所需輸入，避免兩套內容彼此漂移。

#### Scenario: 更新展示分類與音效項目內容
- **WHEN** 開發者調整 playground 展示資料
- **THEN** 頁面文案、卡片內容與 widget 顯示結果會同步反映相同資料集

### Requirement: Playground 不得把完整頁面殼層責任回灌到 widget package
系統 MUST 將 hero、介紹區、內容說明與其他頁面殼層保留在 `apps/playground`，而不是把這些頁面專屬元素移入 widget package。

#### Scenario: 開發者檢視頁面層與 widget 邊界
- **WHEN** 開發者檢查相關程式碼結構
- **THEN** 完整頁面區塊實作位於 `apps/playground`，而 widget package 仍只負責可重用的 soundboard 體驗
