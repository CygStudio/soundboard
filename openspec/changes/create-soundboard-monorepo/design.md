## 背景

目前儲存庫只有 `openspec/` 下的設計探索，還沒有實際的實作工作區。從 Stitch 設計稿可以看出兩種不同的產品表面：一種是可重用的 soundboard 互動區，另一種是偏品牌展示的 landing page 殼層。這次 change 先聚焦在可重用的互動核心，讓專案能在擴大頁面層需求之前，先驗證架構、package 邊界與播放行為。

第一波交付需要同時滿足兩件事：

1. 建立可隨 package 與 app 成長的 monorepo 基礎，避免之後再重做工具鏈。
2. 交付可在 `apps/playground` 內運作、未來也能嵌入其他宿主的 soundboard widget。

主要限制如下：

- package 管理必須使用 `pnpm`。
- workspace 編排必須使用 `moon`。
- 主要技術棧包含 TypeScript、Vue、Vite 8、Vitest、Oxlint 與 Rolldown。
- 第一版 widget 必須獨立於首頁 hero、top navigation 與其他品牌殼層。

## 目標 / 非目標

**目標：**

- 建立可預測的 monorepo 佈局，包含 `apps/playground`、`packages/core`、`packages/ui` 與 `packages/widget`。
- 定義共享的工作區慣例，用於開發、lint、typecheck、測試與建置。
- 將 soundboard 狀態與播放規則保留在與框架無關的 `core` 層。
- 提供可由 `playground` 以範例資料掛載的可重用 widget 組裝成果。
- 讓第一版實作範圍夠小，能驗證設計方向，但不提前承擔完整站點殼層需求。

**非目標：**

- 不在這次 change 中重建完整 Stitch 首頁、hero 區塊或其他品牌視覺殼層。
- 不設計 CMS、遠端 API、持久化儲存或內容編輯流程。
- 不處理多個 widget instance 之間的同步播放協調。
- 不引入超出 `playground` 所需範圍的 SSR、後端渲染或部署基礎設施。

## 決策

### 決策：以 `pnpm` workspace 為基礎，並由 `moon` 負責專案編排

工作區將以 `pnpm` 處理 package 管理與 linking，再由 `moon` 定義 task graph 與各專案的執行規則。

- **原因：** `pnpm` 能有效管理 workspace 相依性，而 `moon` 能在儲存庫成長時提供清楚的專案定義、共享 task 與執行控制。
- **考慮過的替代方案：** 只使用 `pnpm` workspace 搭配手寫 root scripts。這樣起步較簡單，但專案間 task 協調會更隱晦。

### 決策：將程式碼拆分為 `core`、`ui`、`widget` 與 `playground`

儲存庫會把 domain logic、可重用 Vue 呈現層、embeddable 組裝層與 app 驗證層分成不同專案。

- **原因：** 這種切法最符合前面探索出的產品邊界。`core` 負責純 soundboard 行為，`ui` 負責可重用 Vue 元件與組合邏輯，`widget` 負責 embeddable 入口，`playground` 負責整體組裝驗證。
- **考慮過的替代方案：** 先全部放進單一 app，之後再抽離。這會讓一開始比較快，但 widget 邊界會模糊，之後擴充畫面時也更難重用。

### 決策：將播放狀態規則放在 `packages/core`

播放選取、active item 追蹤與分類 / 資料轉換會放在 `core`，並對上層提供型別化 API。

- **原因：** widget 的播放行為是產品規則，不是純 UI 呈現細節。放在 `core` 可以在沒有 Vue 或 DOM 的情況下測試，也能讓 widget 的公開介面更薄。
- **考慮過的替代方案：** 將所有狀態直接寫在 Vue 元件裡。這樣短期 setup 成本較低，但會把行為規則綁死在單一 UI 實作上。

### 決策：`packages/ui` 只放 widget 可重用的呈現元件

`ui` 只收納屬於 widget 本體的 Vue 元件與樣式 primitives，不納入品牌感較重的 landing page 殼層。

- **原因：** Stitch 探索已顯示 hero / banner / navigation 屬於 app shell 組裝，不是 widget 內建的一部分。排除這些內容，能讓 `ui` 更聚焦在可重用的 soundboard primitives。
- **考慮過的替代方案：** 把目前設計稿中的所有視覺片段都移入 `ui`。這樣較快還原畫面，但會讓可重用層混入頁面專屬組裝責任。

### 決策：`apps/playground` 使用 Vite 8，套件建置使用 Rolldown

`apps/playground` 會透過 Vite 8 提供快速本機開發回饋；需要輸出的套件則使用 Rolldown 打包。

- **原因：** 這與既定工具鏈一致，也能清楚區分 app 與 library 的需求。`playground` 需要快的開發體驗，套件則需要明確的 library 輸出。
- **考慮過的替代方案：** 所有 package 都使用 Vite library mode。這樣工具較少，但會讓套件輸出策略過度綁定 app 工具。

### 決策：第一版 widget 採資料驅動並由宿主掛載

widget 會吃宿主傳入的型別化 soundboard 資料，而不是把內容硬編碼在元件內，也不依賴 landing page 的頁面組裝。

- **原因：** 由宿主提供資料，能讓 widget 真正可嵌入、可在 `playground` 驗證，也比較容易接到未來其他整合點，而不需要重新設計公開 API。
- **考慮過的替代方案：** 先把 widget 做成專案專屬頁面片段。這樣雖然可以更快重現目前 mockup，但會直接違背可重用目標。

## 風險 / 取捨

- **風險：** 一開始就拆 package 可能讓 setup 顯得偏重。→ **緩解方式：** 將第一版能力刻意收斂，並只以 `playground` 作為整合目標。
- **風險：** 工具鏈變多會拖慢初期建置。→ **緩解方式：** 先只標準化當前確定需要的工具，其他需求延後到真的出現再加。
- **風險：** widget API 若設計得太通用，可能過度預測未來需求。→ **緩解方式：** 第一版以真實的 `playground` 使用情境為主，保留最少必要延展點。
- **風險：** 排除品牌殼層後，畫面可能與 Stitch 稿有落差。→ **緩解方式：** 明確把 widget 視為可重用互動核心，殼層視覺留到後續 change 處理。

## Migration Plan

1. 初始化 `pnpm` workspace 與 `moon` 專案圖。
2. 加入共享的 TypeScript、Oxlint、Vitest 與通用 task 設定。
3. 建立 `packages/core`、`packages/ui`、`packages/widget` 與 `apps/playground`。
4. 在 `core` 內實作型別化 soundboard 資料契約與播放邏輯。
5. 在 `ui` 內實作可重用的分類與音效項目 UI。
6. 在 `widget` 內組裝並匯出第一版 widget 套件。
7. 在 `playground` 內以範例資料掛載 widget。
8. 驗證標準工作區 task 與 widget 行為，再決定是否擴充表面積。

由於這次 change 是新增工作區結構，而不是遷移既有實作，因此 rollback 相對直接；若需要回退，可以把新增的工作區檔案與 package 一次性還原。

## Open Questions

- 第一版 widget 的公開 API 應該只提供 Vue 元件，還是同時提供程式化 mount helper？
- 音效資產載入是否應該先以單純 URL 為主，還是第一版就預留 adapter hooks？
- 視覺 token 的建立要在這次 change 先做到多少，哪些應留到未來獨立的 design-system change？
