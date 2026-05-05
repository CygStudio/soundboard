## Context

目前 `apps/playground` 已能同時展示 Vue 元件入口與 Shadow DOM mount helper，但整體仍偏向工程驗證頁：版面簡化、內容仍是 placeholder、互動表面只覆蓋最小 widget 播放流程，且音效來源是不可用的示意 URL。相較之下，Stitch 設計稿中的 `VTuber Soundboard` 已經是一個完整 desktop 展示頁面，包含更完整的內容節奏、視覺層次、場景敘事與 soundboard 體驗承接。

這次 change 的目標不是把 playground 變成正式營運網站，而是讓它成為對齊設計稿的完整體驗頁：一方面能展示 soundboard widget 在更真實情境中的呈現，另一方面能用專案內可提交、可播放的真實範例音檔取代假資料。實作仍需遵守目前 monorepo 的邊界：`packages/core` 保持框架無關邏輯、`packages/widget` 維持可嵌入入口、`apps/playground` 負責頁面層組裝與展示。

主要約束如下：

- `apps/playground` 目前是 Vite + Vue + Tailwind 的 desktop playground，不應為了頁面層體驗破壞既有 widget 嵌入模型。
- 真實範例音檔必須能直接提交到 repo、可在本機播放，且不能以程式化產生的合成波形取代。
- 設計稿是頁面體驗的重要來源，但仍需保留工程上可維護的資料驅動與 package 邊界。
- Shadow DOM mount helper 的隔離特性必須持續保留，避免 playground 完整化後又把樣式耦合回宿主。

## Goals / Non-Goals

**Goals:**

- 將 `apps/playground` 升級為對齊 Stitch 設計稿的完整 desktop 體驗頁。
- 在頁面中同時保留 Vue 元件入口與 Shadow DOM mount helper 的可見展示情境。
- 建立一組可提交、可播放、具穩定命名與資料對應的範例真實音檔。
- 讓 soundboard 資料模型足以承接設計稿中的展示資訊，例如封面、描述、分類文案或重點標籤。
- 以測試與明確資產約束確保日後更換視覺或內容時不會破壞播放流程。

**Non-Goals:**

- 不處理正式上線站點的後端、SEO、追蹤碼與部署配置。
- 不建立音檔上傳系統、素材後台或遠端內容同步機制。
- 不追求完整品牌 design system 或所有 Stitch 畫面變體一次到位。
- 不引入跨 widget instance 的播放協調或全域媒體控制中心。

## Decisions

### 決策：`apps/playground` 採「完整頁面殼 + 既有 widget 嵌入」模式

`apps/playground` 會負責實作設計稿所需的頁面層區塊，例如 hero、介紹、soundboard 展示區與補充資訊區；真正的播放互動核心仍由 `packages/widget` 提供。這讓 playground 能對齊設計稿，同時不把頁面殼層反向塞回 widget package。

- **原因：** 設計稿描述的是完整體驗頁，不只是單一 widget 卡片；但 widget 本身仍需維持可重用。
- **替代方案：** 直接把更多 hero / page shell 元件移入 `packages/ui` 或 `packages/widget`。這會讓可重用邊界被 landing-page 專屬視覺污染。

### 決策：新增「playground 專用展示資料層」，承接頁面內容與 widget 資料

`apps/playground` 會有一份明確的展示資料定義，包含頁面文案、區塊內容、分類、音效卡片 metadata 與對應音檔路徑。widget 仍只吃自己需要的 soundboard 資料，但 playground 會從較完整的頁面模型派生 widget 輸入。

- **原因：** 設計稿中的內容表面比現有 `SoundboardInput` 更豐富，若直接把所有頁面資訊硬塞進 widget 資料契約，會破壞 package 邊界。
- **替代方案：** 讓 `packages/core` 直接承載完整頁面模型。這會讓 core 從 widget domain 膨脹成頁面 CMS 模型。

### 決策：範例音檔以 repo 內靜態資產管理，優先使用專案自製或可明確再散布的錄音

範例音檔會以靜態檔案形式提交，放在 `apps/playground/public/` 或共用但可被 app 直接引用的靜態資產目錄，並由展示資料顯式引用。這些音檔必須是實際錄製 / 匯出的音訊檔，不接受執行時程式化生成。

- **原因：** 這最符合「真實音檔」需求，也能讓本機與 build 後輸出行為一致。
- **替代方案：** 以 data URL、Web Audio API、或測試期間動態生成音源。這違反了需求，也不利於設計稿體驗驗收。

### 決策：播放流程維持 widget 單一 active 規則，但補強頁面層展示資訊

`packages/widget` 仍沿用單一 active item 的播放模型，但可能擴充 item 顯示所需的 metadata（例如縮圖、狀態文案、分類說明），以支援設計稿中的更完整卡片呈現。頁面層則可額外顯示目前分類、推薦內容、使用說明等輔助資訊。

- **原因：** 既有行為規則已足夠承接第一版設計稿互動，真正欠缺的是展示資訊與內容層次。
- **替代方案：** 重新設計為多重播放、混音器或播放佇列。這超出目前需求，也會大幅拉高 UI 與測試複雜度。

### 決策：保留 Shadow DOM mount helper 展示，但在 playground 中讓它成為完整頁面的一部分

playground 不再只把 Shadow DOM mount helper 放在一個空框內示意，而是把它嵌入完整頁面展示區，和 Vue 入口版本一起形成可比較、可驗證的展示表面。

- **原因：** 這能同時驗證設計稿頁面與嵌入模型，不必在完整體驗與技術展示之間二選一。
- **替代方案：** 完整頁面只保留 Vue 入口，另外做獨立 route 展示 Shadow DOM。這會讓驗收與比較分散。

## Risks / Trade-offs

- **頁面資料層與 widget 資料層分離後，可能出現同步遺漏** → 以明確轉換函式與型別約束管理頁面資料到 widget 輸入的映射。
- **真實音檔提交到 repo 會增加體積** → 控制檔案數量與長度，優先使用短秒數、壓縮後仍可接受的格式，僅保留展示所需最小集合。
- **設計稿視覺若過度複雜，可能讓 playground 淪為 hardcoded marketing page** → 僅實作支撐互動驗證與展示需要的頁面區塊，避免引入純裝飾性區段。
- **Shadow DOM 與 Vue 入口同頁展示可能產生體驗不一致** → 以同一份展示資料驅動兩個入口，將差異收斂在掛載方式與樣式封裝，不複製業務邏輯。

## Migration Plan

1. 盤點 Stitch 主畫面需要承接的頁面區塊與互動，整理成 playground 展示資料模型。
2. 擴充 widget / UI 所需的顯示 metadata 與對應測試。
3. 準備並提交範例真實音檔，建立穩定的靜態資產引用方式。
4. 重構 `apps/playground` 版面，使其對齊設計稿完整體驗，同時保留 Vue 與 Shadow DOM 兩種入口。
5. 補上驗證，確認頁面、資產與播放流程在 dev / build 後都可運作。

若需要回退，可先保留新增的資料模型與資產檔案，再把 `apps/playground` 還原到最小展示頁；因為這次 change 不涉及資料遷移或外部服務，rollback 風險相對低。

## Open Questions

- Stitch 其他 screen variants 是否代表未來還要加入更多互動狀態（例如 hover / playing / empty state），或本次只需以主畫面為準。
- 範例音檔是否需要在 repo 內同時保留原始未壓縮版本，還是只提交展示用輸出格式即可。
