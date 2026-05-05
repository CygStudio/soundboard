## ADDED Requirements

### Requirement: Monorepo workspace structure
The repository SHALL be organized as a `pnpm` workspace managed by `moon`, with application code under `apps/` and reusable packages under `packages/`.

#### Scenario: Standard workspace layout is present
- **WHEN** a developer inspects the repository structure
- **THEN** they find `apps/playground`, `packages/core`, `packages/ui`, and `packages/widget` as first-class workspace projects

### Requirement: Shared engineering toolchain
The workspace SHALL provide shared project automation for type-checking, linting, testing, development, and production builds using TypeScript, Vite 8, Vitest, Vue, Oxlint, and Rolldown.

#### Scenario: Workspace tasks are defined consistently
- **WHEN** a developer runs the standard workspace tasks through the repository toolchain
- **THEN** the workspace exposes consistent tasks for `dev`, `build`, `test`, `lint`, and `typecheck` across the relevant projects

### Requirement: Stable package boundaries
The workspace MUST separate domain logic, Vue presentation logic, and embeddable integration surfaces into distinct packages so that each layer can evolve independently.

#### Scenario: Package responsibilities are clear
- **WHEN** a developer reviews the package contracts
- **THEN** `packages/core` contains framework-agnostic soundboard logic, `packages/ui` contains reusable Vue UI primitives and compositions, and `packages/widget` contains the embeddable widget assembly and public entry points
