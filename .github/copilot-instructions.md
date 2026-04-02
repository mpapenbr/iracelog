# iracelog Project Guidelines

## Build and Test

Use **pnpm** for all package management:

```bash
pnpm install        # Install dependencies
pnpm start          # Dev server (Vite, port 3000)
pnpm build          # Production build
pnpm test           # Run tests (Vitest)
pnpm test:coverage  # Run tests with coverage
```

Release process (see [README-dev.md](README-dev.md)):

```bash
pnpm release:patch|minor|major  # Auto-runs tests, creates git tags
```

## Architecture

**Tech Stack:** React 19 + TypeScript (strict) + Redux Toolkit + Vite + Ant Design  
**APIs:** gRPC (ConnectRPC) + GraphQL (Apollo Client)  
**Charts:** Multiple libraries (Nivo, Recharts, Ant Design Plots)

**Key Separation:**

- **Components** (`src/components/`) — Presentational, domain-grouped (auth/, live/, nivo/)
- **Containers** (`src/container/`) — Redux-connected smart components (suffix "Container")
- **Pages** (`src/pages/`) — Route-level components (suffix "Page")
- **Stores** (`src/stores/grpc/`) — Redux Toolkit slices with typed actions
- **Utils** (`src/utils/`) — Pure functions, no React dependencies

## Code Style

**TypeScript:** Strict mode enabled, full type safety required  
**Formatting:** Prettier (100-120 char width) + ESLint with import/jsx-a11y rules

**Naming Conventions:**

- Components: PascalCase (`RaceGraphContainer.tsx`)
- Props interfaces: `<ComponentName>Props`
- Utilities: camelCase
- Redux slices: camelCase with typed exports

**File Organization Examples:**

- [src/stores/grpc/slices/carEntrySlice.ts](src/stores/grpc/slices/carEntrySlice.ts) — Redux Toolkit slice pattern
- [src/container/RaceGraphContainer.tsx](src/container/RaceGraphContainer.tsx) — Container pattern with Redux hooks
- [src/components/globalSettingsControl.tsx](src/components/globalSettingsControl.tsx) — Component with global state

## Conventions

**Redux Pattern** (follow existing slices):

```typescript
export const slice = createSlice({ name, initialState, reducers });
export const { action } = slice.actions;
export default slice.reducer;
```

**Component Structure:**

1. Smart containers handle Redux state/dispatch
2. Dumb components receive props, no direct store access
3. Pages compose containers and handle routing

**Backend Integration:**

- Protocol buffers from buf.build (code-generated)
- Runtime config switching via `/config.json`
- See [README.md](README.md) for Docker deployment customization

**Dependencies:** Use pnpm, maintain version lockfile. Known issue with d3-color resolved via package resolutions.
