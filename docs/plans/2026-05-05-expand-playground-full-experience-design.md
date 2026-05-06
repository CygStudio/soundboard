# expand-playground-full-experience design

## Summary

This design upgrades `apps/playground` from a minimal integration surface into a full desktop experience that can switch between existing Stitch variants on one page. The page shell remains in `apps/playground`, while `packages/widget` continues to own the reusable soundboard experience for both the Vue component entry and the Shadow DOM mount entry.

## Goals

- Keep all currently available Stitch variants in scope for this change.
- Present variants on a single playground page with selector-based switching.
- Drive page content and widget content from one shared variant-aware data source.
- Replace placeholder audio URLs with real local sample audio assets.
- Add shared playback controls inside the widget for both embedding modes.

## Non-goals

- Do not move hero, page shell, or variant-specific marketing content into `packages/widget`.
- Do not add backend, CMS, upload, or remote media management.
- Do not introduce cross-page coordination outside the widget currently being viewed.

## Architecture

### Page structure

`apps/playground` will stay as a single route. The route renders:

1. A page shell aligned to the Stitch experience.
2. A variant selector that switches the active showcase variant.
3. Variant-specific content sections.
4. A shared soundboard showcase area that renders both:
   - the Vue component widget
   - the Shadow DOM mounted widget

The page shell and variant-specific narrative content remain app-only responsibilities.

### Data model boundary

`apps/playground` will define a variant-aware showcase model that includes:

- page copy
- hero and support sections
- selected sound categories and items
- references to local audio assets
- variant metadata used to render controls and content

This model will be transformed into widget-facing input through an explicit mapper. The widget and core packages will only receive reusable soundboard data and display metadata needed for sound cards and playback controls.

## Widget design

### Shared playback controls

The widget UI will expose the same playback control bar for both entry modes:

- overlap playback toggle, default `off`
- loop playback toggle, default `off`
- random playback action
- stop-all action, disabled when nothing is playing

### Playback behavior

- When overlap is off, starting a new sound stops currently playing sounds first.
- When overlap is on, multiple sounds may play together.
- When loop is on, newly started sounds repeat until stopped or the loop mode changes according to implementation rules.
- Random playback picks one available sound and starts playback once.
- Stop-all stops every active sound and clears active playback state.

## Audio assets

Sample audio files will be committed as local static assets under a stable path that works in dev and build output. A catalog layer will map asset metadata to the variant-aware showcase data so the page and widget can share the same references without embedding path logic in playback code.

## Error handling

- Invalid or missing item references should fail through typed mapping or explicit runtime errors instead of silent fallbacks.
- Audio playback failures should clear the relevant active state and never leave the UI in a false playing state.
- Stop-all and random controls should respect the currently visible sound set for the active variant state.

## Testing

1. Showcase data and mapper tests for variant switching and widget input derivation.
2. Widget interaction tests for overlap, loop, random, stop-all, category changes, and playback reset behavior.
3. Asset integration checks that verify sample audio references resolve in both dev and build flows.

## Follow-up polish backlog

- Add more Stitch-inspired variants once additional approved layouts or narrative directions are ready.
- Introduce richer card visuals (cover art, thumbnails, accent treatments) if the shared widget metadata contract needs them.
- Refine hero illustration and supporting decorative treatments without moving page-shell concerns into shared packages.
- Explore multi-widget or cross-surface playback coordination only as a separate follow-up change.

## Implementation notes

- Prefer extending existing `packages/core`, `packages/ui`, and `packages/widget` types and components rather than introducing a second playback system in `apps/playground`.
- Keep shared widget logic reusable across Vue and Shadow DOM entry points.
- Keep variant-specific layout code local to `apps/playground`.
