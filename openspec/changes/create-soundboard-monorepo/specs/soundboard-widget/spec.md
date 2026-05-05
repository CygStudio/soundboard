## ADDED Requirements

### Requirement: Widget 呈現分類與音效項目
widget SHALL 接受結構化 soundboard 資料，並呈現分類導覽與目前分類下的音效項目。

#### Scenario: widget 初次渲染
- **WHEN** widget 掛載時至少有一個分類與一個音效項目
- **THEN** 畫面上會顯示目前 active 分類，並渲染對應的音效項目列表

### Requirement: Widget 支援分類切換
widget SHALL 讓使用者在目前 widget 內容中切換可用分類，而不需要離開當前上下文。

#### Scenario: 使用者選擇其他分類
- **WHEN** 使用者啟用另一個分類控制項
- **THEN** widget 會更新 active 分類，並刷新該分類對應的音效項目列表

### Requirement: Widget 支援單一 active 播放
widget MUST 為音效項目提供基礎播放控制，且同一個 widget instance 在任一時間只能有一個 active 音效項目。

#### Scenario: 使用者播放音效項目
- **WHEN** 使用者開始播放某個音效項目
- **THEN** widget 會把該項目標記為 active，並透過項目控制項呈現其播放狀態

#### Scenario: 使用者播放另一個音效項目
- **WHEN** 在已有 active 音效項目時，使用者又啟動另一個音效項目
- **THEN** 原本的 active 項目不再是 active，新的項目成為唯一的 active 播放目標

### Requirement: Widget 可由 playground 應用程式掛載
第一版 widget 交付物 SHALL 能被 `apps/playground` 消費，且不依賴 landing page 專屬版型或品牌殼層。

#### Scenario: Playground 掛載 widget
- **WHEN** `playground` 應用程式整合 widget package
- **THEN** 它可以只靠範例資料渲染 widget，而不需匯入 app shell 的 hero 或 navigation 元件
