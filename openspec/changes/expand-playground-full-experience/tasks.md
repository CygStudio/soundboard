## 1. 設計稿對齊與展示資料基礎

- [ ] 1.1 盤點本次納入的 Stitch variants、主畫面區塊、視覺重點與展示文案
- [ ] 1.2 在 `apps/playground` 建立 variant-aware 的展示資料模型與靜態內容定義
- [ ] 1.3 建立從 active variant 展示資料派生 widget 輸入的轉換邏輯

## 2. 範例音檔資產

- [ ] 2.1 以 `docs/sounds/` 作為來源，盤點一組可提交且可合法使用的真實範例音檔
- [ ] 2.2 將本次使用的音檔複製到 `apps/playground` 的穩定靜態資產路徑並建立對應 metadata / catalog
- [ ] 2.3 讓 playground 與 widget 都改用複製後的本地範例音檔而非 placeholder URL

## 3. Widget 與頁面體驗擴充

- [ ] 3.1 擴充 `packages/core` / `packages/widget` 的播放狀態與型別，支援 overlap、loop、random、stop-all
- [ ] 3.2 擴充 `packages/ui` 與 `packages/widget` 的呈現，支援共享播放控制與設計稿需要的完整 soundboard 卡片資訊
- [ ] 3.3 重構 `apps/playground` 為可切換 variants 的完整 desktop 體驗頁，保留 Vue 與 Shadow DOM 兩種 widget 展示
- [ ] 3.4 確認完整頁面殼層責任仍留在 `apps/playground`，且兩種 widget 入口都由同一份 active variant 資料驅動

## 4. 驗證與收尾

- [ ] 4.1 補上展示資料、widget 互動、共享播放控制與音檔引用的測試
- [ ] 4.2 驗證從 `docs/sounds/` 複製出的範例音檔在 dev 與 build 後輸出中都能正常載入與播放
- [ ] 4.3 執行標準 workspace 驗證 task，整理未納入本次 change 的後續 variant / polish 待辦
