## Why

The design work has clarified two separate needs: a reusable soundboard widget and a stable monorepo foundation to build it on. Creating both together now lets the project validate its package boundaries, toolchain, and embed model before more app-specific UI work accumulates around a temporary structure.

## What Changes

- Create a `moon` + `pnpm` monorepo for the project with shared TypeScript, lint, test, and build workflows.
- Introduce package boundaries for `core`, `ui`, and `widget`, plus an `apps/playground` app for local development and design validation.
- Define and deliver a first working soundboard widget that supports category filtering, rendering sound items, and basic playback interactions.
- Keep brand-heavy landing-page chrome out of the widget boundary so the widget can be embedded independently inside the playground and future hosts.
- Standardize the initial toolchain around TypeScript, Vite 8, Vitest, Vue, Oxlint, and Rolldown.

## Capabilities

### New Capabilities
- `soundboard-workspace`: Defines the monorepo layout, shared toolchain, and package/app responsibilities for the soundboard project.
- `soundboard-widget`: Defines the first reusable widget surface, including category navigation, sound item presentation, and playback behavior.

### Modified Capabilities
- None.

## Impact

- Adds a new multi-package repository structure under `packages/` and `apps/`.
- Introduces workspace-level configuration for `moon`, `pnpm`, TypeScript, Vite, Vitest, Oxlint, and Rolldown.
- Establishes the initial public boundaries between domain logic, Vue UI components, and embeddable widget entry points.
- Creates the baseline contract for later app-shell and branding work without requiring those concerns in the first widget delivery.
