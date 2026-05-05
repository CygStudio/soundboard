## 語系

所有回應跟思考過程都用 zh-TW 正體中文顯示

## 需求釐清

在計劃與執行過程中有任何需要我確認的問題，都使用 ask user tool 來進行反問
反問過程以選擇題為主，但**一定要包涵開放式選項**讓我在需要時可以補充說明

## 驗證

- typescript 使用嚴格模式，tsc 驗證除非必要盡可能排除使用 any 如果使用要額外說明原因
- 修復後需要重新執行驗證，確認最終修復

## 專案中的 Vue 檔結構

script 都使用 `setup` `lang=ts`

有自動 import 的項目就不要再次新增 import

## 命名規範

### Vue 組件命名

- 組件檔案: PascalCase (如: `ButtonPrimary.vue`)
- 組件名稱: PascalCase (如: `ButtonPrimary`)
- Props: camelCase (如: `buttonType`)
- Events: kebab-case (如: `@button-click`)

## 暫存資料目錄

**需要暫存資料的時候，不准使用外部目錄，一率存到 ./tmp.local 目錄下！**

## Git worktree 路徑規範

- 專案已經統一使用 pnpm 沒有依賴項重複佔用空間的問題
- Git worktree 一律建立在專案目錄外，不可放在目前 repo 內或其子目錄中。
- 預設路徑使用 `~/worktrees/<repo>/<branch>`。
- 若不同 owner 下可能有同名 repo，改用 `~/worktrees/<owner>/<repo>/<branch>`。  

範例：

- `~/worktrees/face-studio-web/feature-xxx`
- `~/worktrees/LCT/face-studio-web/feature-xxx`  

目的：

- 避免 worktree 被專案內的 lint、test、watcher、glob 誤掃描
- 保持 repo 目錄乾淨
- 讓 worktree 位置更直觀、容易管理
