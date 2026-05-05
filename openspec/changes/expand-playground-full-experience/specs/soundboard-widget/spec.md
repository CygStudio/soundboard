## MODIFIED Requirements

### Requirement: Widget 支援單一 active 播放
widget MUST 預設維持單一 active 播放模型，並提供 overlap 開關，讓同一個 widget instance 在使用者明確啟用後可以同時維持多個 active 音效項目。

#### Scenario: widget 初次載入
- **WHEN** widget 首次掛載
- **THEN** overlap 與 loop 都預設為關閉，且 stop-all 在沒有 active 音效時不可用

#### Scenario: overlap 關閉時播放另一個音效項目
- **WHEN** 在 overlap 關閉且已有 active 音效項目時，使用者又啟動另一個音效項目
- **THEN** 原本的 active 項目不再是 active，新的項目成為唯一的 active 播放目標

#### Scenario: overlap 開啟時播放另一個音效項目
- **WHEN** 使用者啟用 overlap 後，再啟動另一個音效項目
- **THEN** widget 可以同時維持多個 active 音效項目

## ADDED Requirements

### Requirement: Widget 提供共享播放控制
widget SHALL 在 Vue 元件入口與 Shadow DOM mount helper 入口都提供一致的共享播放控制列，至少包含 overlap、loop、random 與 stop-all。

#### Scenario: 宿主使用任一 widget 入口
- **WHEN** playground 渲染 Vue 元件版或 Shadow DOM 掛載版 widget
- **THEN** 兩種入口都會顯示相同的共享播放控制表面

### Requirement: Widget 支援 loop、random 與 stop-all
widget MUST 讓使用者可切換 loop、從目前可見音效中隨機播放一個項目，並一次停止目前 widget instance 的所有播放。

#### Scenario: 使用者啟用 loop 後播放音效
- **WHEN** loop 已啟用且使用者開始播放音效項目
- **THEN** 新啟動的音效會以循環模式播放，直到被停止或 loop 設定改變

#### Scenario: 使用者觸發 random 播放
- **WHEN** 使用者啟用 random 動作
- **THEN** widget 會從目前可見音效項目中選取一個項目並開始播放

#### Scenario: 使用者觸發 stop-all
- **WHEN** 目前 widget instance 有至少一個 active 音效，且使用者啟用 stop-all
- **THEN** 所有 active 音效都會停止，且 active 播放狀態會被清空
