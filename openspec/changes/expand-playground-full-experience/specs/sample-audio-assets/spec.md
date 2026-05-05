## ADDED Requirements

### Requirement: Playground 使用可提交且可實際播放的範例音檔
系統 SHALL 提供一組隨專案版本控制的範例音檔，供 playground 與 widget 播放，且不得使用程式化合成音源或不可用的 placeholder URL 取代。

#### Scenario: 使用者在 playground 觸發音效播放
- **WHEN** 使用者點擊任一音效項目
- **THEN** 系統會播放對應的實際音訊檔案，而不是播放程式化模擬音訊或連到不存在的外部資源

### Requirement: 範例音檔資產必須有穩定的資料契約與引用方式
系統 SHALL 為每個範例音檔提供穩定的檔名、路徑與對應 metadata，讓頁面展示資料與 widget 輸入都能可靠引用。

#### Scenario: 開發者替換或新增範例音檔
- **WHEN** 開發者更新範例音檔集合
- **THEN** 可以透過明確資料欄位與靜態路徑完成替換，而不需要修改播放核心邏輯

### Requirement: 範例音檔集合應控制在展示所需的最小範圍
系統 MUST 只提交支撐設計稿與 playground 展示所需的最小音檔集合，以降低 repo 體積與維護負擔。

#### Scenario: 檢查範例音檔內容
- **WHEN** 開發者檢視專案中的範例音檔
- **THEN** 音檔數量與長度會以展示需求為上限，而不是收納大型素材庫

### Requirement: 真實音檔資產需能在 dev 與 build 後輸出中一致使用
系統 SHALL 讓範例音檔在本機開發與正式 build 產物中都能以相同邏輯被頁面與 widget 使用。

#### Scenario: 開發者執行 playground dev 或 build
- **WHEN** 應用程式在開發模式或 build 後被載入
- **THEN** 範例音檔都能維持可解析、可載入且可播放的狀態
