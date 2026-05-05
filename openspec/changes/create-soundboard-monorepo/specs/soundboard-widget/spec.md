## ADDED Requirements

### Requirement: Widget renders categories and sound items
The widget SHALL accept structured soundboard data and render category navigation together with the sound items for the active category.

#### Scenario: Initial widget render
- **WHEN** the widget is mounted with at least one category and one sound item
- **THEN** the active category is visible and the corresponding sound items are rendered in the widget view

### Requirement: Widget supports category switching
The widget SHALL let the user switch between available categories without leaving the current widget context.

#### Scenario: User selects another category
- **WHEN** the user activates a different category control
- **THEN** the widget updates the active category and refreshes the visible sound item list for that category

### Requirement: Widget supports single active playback
The widget MUST provide basic playback controls for sound items and only one sound item may be active at a time within a widget instance.

#### Scenario: User plays a sound item
- **WHEN** the user starts playback for a sound item
- **THEN** the widget exposes that item as active and presents its playback state through the item control

#### Scenario: User starts another sound item
- **WHEN** a different sound item is started while one is already active
- **THEN** the previously active item is no longer active and the new item becomes the only active playback target

### Requirement: Widget is hostable inside the playground app
The first widget delivery SHALL be consumable by `apps/playground` without requiring landing-page-specific layout or branding dependencies.

#### Scenario: Playground mounts the widget
- **WHEN** the playground app integrates the widget package
- **THEN** it can render the widget using sample data without importing app-shell hero or navigation components
