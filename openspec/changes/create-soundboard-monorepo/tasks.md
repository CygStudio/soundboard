## 1. 工作區基礎

- [ ] 1.1 建立 `pnpm` workspace 基礎檔案與 root package 設定
- [ ] 1.2 建立 `moon` 工作區與各專案的基礎設定
- [ ] 1.3 加入共享的 TypeScript 設定與 `typecheck` task
- [ ] 1.4 加入共享的 Oxlint、Vitest 設定與對應 task
- [ ] 1.5 為 `apps/playground` 建立 Vite 8 開發基礎
- [ ] 1.6 為可重用套件建立 Rolldown 建置基礎

## 2. Core soundboard 邏輯

- [ ] 2.1 在 `packages/core` 定義分類、音效項目與 widget 輸入資料的型別
- [ ] 2.2 在 `packages/core` 實作分類切換狀態
- [ ] 2.3 在 `packages/core` 實作單一 active 播放狀態與切換規則
- [ ] 2.4 為 `core` 補上分類切換與 active 播放的單元測試

## 3. UI 與 widget 組裝

- [ ] 3.1 在 `packages/ui` 建立分類控制元件
- [ ] 3.2 在 `packages/ui` 建立音效項目呈現與播放狀態元件
- [ ] 3.3 在 `packages/widget` 組裝公開的 widget 入口
- [ ] 3.4 為 widget 補上分類切換與播放互動測試

## 4. Playground 整合

- [ ] 4.1 在 `apps/playground` 建立範例資料與 widget 掛載頁面
- [ ] 4.2 確認 `playground` 掛載不依賴 hero、navigation 或其他品牌殼層元件
- [ ] 4.3 執行標準工作區驗證 task，並整理後續殼層 / 品牌相關待辦
