## Context

The current repository has design exploration under `openspec/`, but no implementation workspace yet. The Stitch design established two different product surfaces: a reusable soundboard interaction area and a more decorative landing-page shell. This change focuses on the reusable surface first so the project can validate its architecture, package boundaries, and playback behavior before broader site-specific composition work begins.

The first delivery needs to satisfy two concerns at once:

1. Establish a monorepo foundation that can scale across packages and apps without reworking the toolchain later.
2. Deliver a usable soundboard widget that can run inside a playground app and later be embedded in other hosts.

Key constraints:

- Package management must use `pnpm`.
- Workspace orchestration must use `moon`.
- The primary stack includes TypeScript, Vue, Vite 8, Vitest, Oxlint, and Rolldown.
- The initial widget must stay independent from landing-page hero, top navigation, and other brand-shell concerns.

## Goals / Non-Goals

**Goals:**

- Create a predictable monorepo layout with `apps/playground`, `packages/core`, `packages/ui`, and `packages/widget`.
- Define shared workspace conventions for development, linting, type-checking, testing, and builds.
- Keep soundboard state and playback rules in a framework-agnostic core layer.
- Provide a reusable widget assembly that the playground can mount with sample data.
- Keep the first implementation small enough to validate the design without prematurely committing to full site-shell requirements.

**Non-Goals:**

- Recreate the full Stitch landing page, hero section, or decorative brand chrome in this change.
- Design a CMS, remote API, persistence layer, or content authoring workflow.
- Solve cross-widget synchronization across multiple mounted widget instances.
- Introduce SSR, backend rendering, or deployment infrastructure beyond what the playground needs.

## Decisions

### Decision: Use `moon` on top of a `pnpm` workspace

The workspace will use `pnpm` for package management and linking, with `moon` defining task graphs and project-level orchestration.

- **Why:** `pnpm` gives efficient workspace dependency management, while `moon` adds explicit project definitions, shared tasks, and execution control as the repo grows.
- **Alternative considered:** Use only `pnpm` workspaces with hand-written root scripts. This is simpler initially, but it makes task coordination and per-project pipeline rules more implicit.

### Decision: Split the codebase into `core`, `ui`, `widget`, and `playground`

The repository will separate domain logic, reusable Vue presentation, embeddable composition, and app-level validation into distinct projects.

- **Why:** This mirrors the actual product boundaries found during exploration. `core` owns pure soundboard behavior, `ui` owns reusable Vue-facing presentation pieces, `widget` owns the embeddable integration surface, and `playground` validates the assembled experience.
- **Alternative considered:** Put everything in one app first and extract later. This would move faster at the beginning, but it would blur the widget boundary and make reuse harder once more screens are added.

### Decision: Keep playback state rules in `packages/core`

Playback selection, active item tracking, and category/data transformations will live in `core`, exposed through typed APIs that higher layers consume.

- **Why:** The widget behavior is a product rule, not a rendering concern. Keeping it in `core` allows logic to be tested without Vue or DOM dependencies and keeps the public widget surface thinner.
- **Alternative considered:** Manage all state directly inside Vue components. This lowers short-term setup cost, but it couples behavioral rules to a specific UI implementation.

### Decision: Use `packages/ui` only for reusable widget-facing presentation pieces

`ui` will host the Vue components and styling primitives that belong to the widget itself, but not the brand-heavy landing-page shell.

- **Why:** The Stitch exploration showed that the hero/banner/navigation layer is app-shell composition, not intrinsic widget UI. Excluding it keeps `ui` focused on reusable soundboard primitives.
- **Alternative considered:** Move all current design fragments into `ui`. That would speed up visual reconstruction, but it would pollute the reusable layer with page-specific composition concerns.

### Decision: Use Vite 8 for app development and Rolldown for package bundling

`apps/playground` will run through Vite 8 for fast local iteration, while publishable packages will be bundled with Rolldown.

- **Why:** This matches the intended toolchain and keeps app and library concerns separate. The playground needs quick dev feedback; packages need explicit library outputs.
- **Alternative considered:** Use Vite library mode for every package. This reduces tool diversity, but it couples package output strategy more tightly to app tooling and weakens the distinction between apps and libraries.

### Decision: Make the first widget data-driven and host-mounted

The widget will consume typed soundboard data supplied by the host app instead of baking in content or relying on landing-page composition.

- **Why:** A host-provided data model makes the widget embeddable, testable in the playground, and ready for future integration points without redesigning the public API.
- **Alternative considered:** Build the widget as a hardcoded project-specific page fragment. That would help reproduce the current mockup quickly, but it would fail the reuse goal.

## Risks / Trade-offs

- **Risk:** The initial package split may feel heavier than a single-app start. → **Mitigation:** Keep the first capability set intentionally narrow and use the playground as the single integration target.
- **Risk:** Toolchain sprawl can slow early setup. → **Mitigation:** Standardize only the required stack now and defer extra tooling until a concrete need appears.
- **Risk:** A too-generic widget API could overfit imagined future hosts. → **Mitigation:** Design the first widget contract around the real playground use case and keep extension points minimal.
- **Risk:** Visual drift from the Stitch mockup if brand-shell pieces are excluded. → **Mitigation:** Explicitly treat the widget as the reusable interaction core and defer shell fidelity to a later change.

## Migration Plan

1. Initialize the `pnpm` workspace and `moon` project graph.
2. Add shared workspace configuration for TypeScript, Oxlint, Vitest, and common task definitions.
3. Scaffold `packages/core`, `packages/ui`, `packages/widget`, and `apps/playground`.
4. Implement typed soundboard data contracts and playback logic in `core`.
5. Implement reusable category and sound item UI in `ui`.
6. Assemble and export the first widget package in `widget`.
7. Mount the widget with sample data in `playground`.
8. Validate the standard workspace tasks and widget behavior before extending the surface area.

Rollback is straightforward because this change introduces new workspace structure rather than migrating an existing implementation. If needed, the repository can revert the added workspace files and packages as a single unit.

## Open Questions

- Should the first widget public API expose a simple Vue component only, or both a Vue component and a programmatic mount helper?
- Should audio asset loading be modeled as plain URLs from day one, or should the first delivery allow adapter hooks for future asset providers?
- How much of the visual token setup belongs in `ui` now versus a later dedicated design-system change?
