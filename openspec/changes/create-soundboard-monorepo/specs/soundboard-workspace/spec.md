## ADDED Requirements

### Requirement: Monorepo 工作區結構
儲存庫 SHALL 以 `pnpm` workspace 形式組織，並由 `moon` 管理，將應用程式程式碼放在 `apps/`，可重用套件放在 `packages/`。

#### Scenario: 存在標準工作區佈局
- **WHEN** 開發者檢查儲存庫結構
- **THEN** 可以看到 `apps/playground`、`packages/core`、`packages/ui` 與 `packages/widget` 這些一級 workspace 專案

### Requirement: 共享工程工具鏈
工作區 SHALL 提供共享的 typecheck、lint、測試、開發與正式建置流程，並使用 TypeScript、Vite 8、Vitest、Vue、Oxlint 與 Rolldown。

#### Scenario: 工作區 task 定義一致
- **WHEN** 開發者透過儲存庫工具鏈執行標準工作區 task
- **THEN** 各相關專案都會提供一致的 `dev`、`build`、`test`、`lint` 與 `typecheck` task

### Requirement: 穩定的 package 邊界
工作區 MUST 將 domain logic、Vue 呈現邏輯與 embeddable 整合表面拆成不同 package，讓各層能獨立演進。

#### Scenario: Package 責任清楚
- **WHEN** 開發者檢視 package 契約
- **THEN** `packages/core` 只包含與框架無關的 soundboard 邏輯，`packages/ui` 包含可重用的 Vue UI primitives 與 compositions，`packages/widget` 包含 embeddable widget 的組裝與公開入口
