## 1. Workspace foundation

- [ ] 1.1 Initialize the `pnpm` workspace and `moon` project graph for `apps/playground`, `packages/core`, `packages/ui`, and `packages/widget`
- [ ] 1.2 Add shared TypeScript, Oxlint, Vitest, and common workspace task configuration for `dev`, `build`, `test`, `lint`, and `typecheck`
- [ ] 1.3 Configure Vite 8 for the playground app and Rolldown-based library builds for the reusable packages

## 2. Core soundboard logic

- [ ] 2.1 Define typed soundboard domain models for categories, sound items, and widget input data in `packages/core`
- [ ] 2.2 Implement framework-agnostic state and playback logic that enforces a single active sound item per widget instance
- [ ] 2.3 Add tests for category switching, active item updates, and core data behavior

## 3. UI and widget assembly

- [ ] 3.1 Build reusable Vue UI pieces in `packages/ui` for category controls, sound item rendering, and playback state presentation
- [ ] 3.2 Assemble the embeddable widget package in `packages/widget` using `core` and `ui` with a host-facing public entry point
- [ ] 3.3 Add widget-level tests covering category changes and playback interaction behavior

## 4. Playground integration

- [ ] 4.1 Create the playground app surface that mounts the widget with representative sample data
- [ ] 4.2 Verify the playground integration does not depend on landing-page hero, navigation, or other brand-shell components
- [ ] 4.3 Run the standard workspace validation tasks and document any remaining follow-up needed for future shell/branding work
