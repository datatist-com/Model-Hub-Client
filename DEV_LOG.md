# Development Log

---

## 2026-03-10

### 09:00

**Goal**
Project initialization — scaffold a complete React + Go full-stack application with dark-theme glassmorphism UI, i18n, and CI/CD.

**Implementation**
- Initialized frontend with React 19 + Vite 7 + TypeScript 5.9 + Ant Design 5.29.
- Created all core pages: `LoginPage`, `DashboardPage`, `DataSourcesPage`, `FeatureManagementPage`, `UserPortraitPage`, `TargetManagementPage`, `ModelManagementPage`, `ScoringGenerationPage`, `OperationListOutputPage`, `UsersPage`, `LogViewerPage`, `ProfilePage`.
- Implemented `AppLayout.tsx` with sidebar navigation, session tab system, and keep-alive routing (`KeepAliveOutlet`).
- Built Go 1.22 backend server (`server/main.go`) with daemon mode (`start`/`stop`/`restart`), static file serving, and cross-platform process management.
- Set up GitHub Actions CI/CD for 6-platform cross-compilation (darwin/linux/windows × amd64/arm64).

**Technical Details**
- Dark theme with glassmorphism effects (`backdrop-filter`, radial gradients, glass borders) applied globally via `src/styles.css`.
- Light theme supported via `data-ui-theme-effective` attribute on `<html>`, toggled by `src/theme/uiTheme.ts`.
- i18n via `react-i18next` with `src/locales/en-US.ts` and `src/locales/zh-CN.ts`.
- Environment guard (`src/platform/environmentGuard.ts`) blocks unsupported browsers/viewports with a graceful fallback page (`UnsupportedEnvironmentPage`).
- Role-based access control (`src/auth/roles.ts`) filters menu visibility per user role.

**Issues & Fixes**
- `@ant-design/v5-patch-for-react-19` was required to resolve React 19 compatibility with Ant Design 5.
- Replaced all static `message`/`Modal.confirm` calls with `App.useApp()` for proper theme-aware rendering.

**Next Steps**
- Add sub-pages for model detail, model training, scoring lists, operation list create/detail.
- Implement Hive/DuckDB table management pages.

---

### 14:00

**Goal**
Implement sub-pages for model workflow, Hive/DuckDB data management, and feature period management.

**Implementation**
- Created `ModelDetailPage`, `ModelTrainPage`, `ModelListDetailPage`, `ModelScoringListPage`.
- Created `OperationListCreatePage`, `OperationListDetailPage`.
- Created `HiveDatabasesPage`, `HiveTablesPage`, `DuckDBTablesPage`, `IngestJobsPage`, `SqlConsolePage`.
- Created `PortraitPeriodPage`, `TargetPeriodPage`, `FeatureFieldDetailPage`.
- Updated `src/router/index.tsx` with all new routes.

**Technical Details**
- DuckDB table management includes field count column with modal, upload modal with local/remote tabs.
- Feature field detail page uses collapsible cards with `grid-template-rows` animation.
- RBAC role permissions filter extended for data engineer / project manager partial access.

**Issues & Fixes**
- CI build errors due to missing type exports — fixed in commit `23533a6`.
- `i18next` count type mismatch resolved in commit `a6100e7`.

**Next Steps**
- Code quality optimization — extract shared hooks and constants.

---

## 2026-03-14

### 10:00

**Goal**
Deep code optimization Round 2 — eliminate duplication, extract shared logic, fix latent bugs. Zero functional changes.

**Implementation**
- Extracted shared hooks: `useRefreshingSet` → `src/hooks/useRefreshingSet.ts`, `usePeriodOptions` → `src/hooks/usePeriodOptions.ts`.
- Extracted shared constants: `src/constants/mockMaps.ts` (source maps, `MockModel` type, `MOCK_MODELS` array, `MODEL_NAME_MAP`).
- Extracted route config: `src/constants/routeConfig.ts` (`ROUTE_LABEL_KEY_MAP`, `TAB_IDENTITY_PARAMS_MAP`, `ROUTE_TO_MENU_KEY`).
- Extracted shared utilities: `src/utils/liftData.ts`.
- Unified `UiThemePreference` type — `src/auth/token.ts` now re-exports from `src/theme/uiTheme.ts`.
- Exported `EFFECTIVE_ATTR` constant from `uiTheme.ts`, imported in `main.tsx` replacing 3 magic strings.

**Technical Details**
- `MOCK_MODELS` shared array replaced per-page `MODEL_MAP` duplicates in `ModelDetailPage`, `ModelManagementPage`, `ScoringGenerationPage`, `OperationListCreatePage`.
- `MODEL_NAME_MAP` derived via `Object.fromEntries()` from `MOCK_MODELS`.
- `AppLayout.tsx` reduced by ~60 lines after route config extraction.

**Issues & Fixes**
- **P0 bug**: `usePeriodOptions()` destructuring in `ModelScoringListPage`, `PortraitPeriodPage`, `TargetPeriodPage` was missing `maxYear`/`defaultMonth` — caused `undefined` runtime errors. Fixed by adding the missing destructured properties.
- **Critical discovery**: `tsc --noEmit` (root tsconfig) showed 0 errors but `tsc -p tsconfig.app.json --noEmit` showed 6 errors. Root tsconfig had different scope. Lesson: always use the app-specific tsconfig for validation.

**Next Steps**
- Fix Windows cross-compilation failure in Go server.

---

## 2026-03-15

### 11:00

**Goal**
Fix Windows cross-compilation CI failure — `unknown field Setsid in struct literal of type syscall.SysProcAttr`.

**Implementation**
- Created `server/proc_unix.go` (build tag `//go:build !windows`) — exports `setSysProcAttr()`, `stopSignal()`, `processAlive()` using `syscall.Setsid`, `syscall.SIGTERM`, `syscall.Signal(0)`.
- Created `server/proc_windows.go` (build tag `//go:build windows`) — Windows-compatible implementations using `os.Kill` and `os.FindProcess`.
- Modified `server/main.go` — removed `syscall` import, calls cross-platform functions.

**Technical Details**
- Go build tags (`//go:build !windows` / `//go:build windows`) ensure platform-specific code compiles only on the target OS.
- Windows lacks `Setsid` and `SIGTERM`; replaced with `os.Kill` for stop and `FindProcess`+`Release` for alive check.

**Issues & Fixes**
- CI failed on `GOOS=windows GOARCH=amd64 go build` due to Unix-only `syscall.SysProcAttr{Setsid: true}`.
- Verified cross-compilation: `GOOS=darwin`, `GOOS=windows`, `GOOS=linux` all pass.

**Next Steps**
- Compatibility and responsive adaptation for multi-device support.

---

## 2026-03-16

### 15:00

**Goal**
Comprehensive compatibility and responsive adaptation — support desktop browsers (Chrome/Edge/Safari/Firefox), tablets, and mobile devices without breaking existing desktop experience.

**Implementation**
- Modified `src/styles.css` (+300 lines):
  - `.app-root`: added `100dvh` fallback alongside `100vh` for mobile viewport compatibility.
  - Added `-webkit-backdrop-filter` prefix to all 11 `backdrop-filter` declarations for Safari support.
  - New `.app-sider-toggle` hamburger button (hidden on desktop via `display: none`).
  - New `.app-sider-overlay` semi-transparent backdrop for drawer mode.
  - Tablet breakpoint `@media (max-width: 1024px)`: sidebar becomes fixed-position drawer with `translateX` animation, shell removes border-radius/border, content padding reduced, profile grid → single column, tables get horizontal scroll.
  - Mobile breakpoint `@media (max-width: 640px)`: iOS `safe-area-inset` padding, compact header/footer, smaller session pills, card padding/radius reduced, tables forced `min-width: 600px` + horizontal scroll, enlarged touch targets for menu items (44px height).
  - Light theme tablet overrides.
- Modified `src/layouts/AppLayout.tsx` (+15 lines):
  - Added `MenuOutlined` icon import.
  - Added `siderOpen` state for drawer toggle.
  - Hamburger button in `app-header-inner` (CSS-hidden on desktop, visible ≤1024px).
  - Sider receives conditional `app-sider-open` class.
  - Menu click auto-closes sidebar drawer.
  - Overlay `div` renders when `siderOpen === true`.
- Modified `src/platform/environmentGuard.ts`:
  - `MIN_WIDTH`: 1180 → 768 (allow tablets).
  - `MIN_HEIGHT`: 700 → 500.
  - `MOBILE_RATIO_THRESHOLD`: 0.8 → 0.65 (more lenient mobile detection).
  - `MOBILE_LIKE_MAX_WIDTH`: 900 → 480 (only block very small screens).

**Technical Details**
- All responsive rules are isolated behind `@media` queries — desktop experience completely unchanged.
- Sidebar drawer uses CSS `transform: translateX(-100%)` → `translateX(0)` with `cubic-bezier(0.2, 0.8, 0.2, 1)` easing for smooth native-feel animation.
- `100dvh` is a progressive enhancement — browsers that don't support it fall back to `100vh` (the preceding declaration).
- `-webkit-backdrop-filter` is required for Safari ≤14 and all current iOS Safari versions.

**Issues & Fixes**
- Environment guard `MIN_WIDTH=1180` was blocking all tablets and many laptop browsers in split-screen mode. Relaxed to 768px to match iPad portrait width.
- `backdrop-filter` without `-webkit-` prefix caused glassmorphism effects to silently fail on Safari, showing opaque fallback backgrounds instead.

**Next Steps**
- Complete i18n audit — fix hardcoded Chinese strings in `UsersPage`, `DataSourcesPage`, Hive/DuckDB/Ingest pages.
- Fix Dashboard AUC Hub data inconsistencies.
- Overhaul 6 empty mock pages with meaningful content.

---

## 2026-03-17

### 09:00

**Goal**
Internationalization (i18n) audit and bug fix round — replace all remaining hardcoded strings with i18n keys, fix data inconsistencies, and enhance mock pages. Currently in progress.

**Implementation** *(in progress)*
- Auditing `src/locales/zh-CN.ts` and `src/locales/en-US.ts` for missing translation keys.
- Reviewing `UsersPage`, `DataSourcesPage`, `HiveDatabasesPage`, `HiveTablesPage`, `DuckDBTablesPage`, `IngestJobsPage` for hardcoded Chinese strings.
- Identified Dashboard AUC Hub data inconsistency for investigation.
- Planning overhaul of 6 empty/minimal mock pages.

**Technical Details**
- i18n architecture uses `react-i18next` with flat key namespacing (e.g., `usersPage.columnName`).
- All Ant Design `columns` definitions, `Modal.confirm` messages, `message.success/warning` calls, and `placeholder` strings must reference `t()`.

**Issues & Fixes**
*(In progress — issues will be documented as encountered.)*

**Next Steps**
- Complete i18n key additions for all identified pages.
- Fix AppLayout duplicate code and menu highlight edge cases.
- Validate with `tsc` and `vite build` after all changes.

---

### 16:00

**Goal**
Performance optimization — eliminate repeat renders, stabilize memo-sensitive props, prevent KeepAlive cascades.

**Implementation**
- `src/router/KeepAliveOutlet.tsx`: Stopped treating the `outlet` node as a dependency by capturing it in a ref so the cache effect only runs when route keys change.
- `src/layouts/AppLayout.tsx`: Memoized menu filtering, tab title map, dropdown config, and memoized handlers (including `handleUserMenuClick`); extracted the `KEEP_ALIVE_EXCLUDE` constant.
- Tables on `ProfilePage`, `DataSourcesPage`, `UsersPage`, and `FeatureManagementPage` now memoize their `columns` definitions to keep Antd from rebuilding column metadata on every render.
- `ModelDetailPage` moved lift data generation into `useMemo` and memoized chart data/columns so that intensive calculations run on mount instead of module initialization.
- Dashboard hub options are memoized and the login card’s mousemove handler is throttled via `requestAnimationFrame`, preventing 200-500 synchronous DOM writes per second.
- `OperationListCreatePage` replaces the module-level `conditionIdCounter` with a `useRef` counter so IDs stay stable across KeepAlive remounts.

**Technical Details**
- Including the ReactNode from `useOutlet()` in the effect dependencies caused KeepAlive to refresh caches on every header/interior state update; the ref change narrows the effect’s dependencies to `activeKey`, `pathname`, and the `exclude` set.
- Ant Design tables only shallow-compare `columns`, so recreating render callbacks triggered full table reconciliation (cells/rows) whenever `AppLayout` rerendered. Memoizing keeps objects stable unless translation strings change.
- `generateLiftData` previously ran `Math.random()` 1,110 times during module load, blocking Vite’s chunk parsing. Moving it into `useMemo` defers the work and keeps StrictMode renders deterministic.
- The login page mouse effect now batches updates per animation frame instead of per mousemove, eliminating layout thrash on high-refresh displays.
- Memoized menu/tab metadata avoids repeated URL splitting and object creation inside the high-frequency `AppLayout` render path.

**Performance Impact**
- KeepAlive now only rebuilds when active tabs or paths change, preventing cascade rerenders when the layout header updates (sidebar filters, license modal, etc.).
- Antd tables on Profile/DataSources/Users/FeatureManagement no longer re-render due to new column references, making navigation between tabs smoother.
- Deferred lift data/math work reduces initial chunk evaluation cost for `ModelDetailPage` and keeps data identical under StrictMode.
- Login mousemove DOM writes are capped at ~60 fps, keeping browser load low on modern high-refresh monitors.
- Memoized menu/tab/dropdown helpers keep the layout shell fast even as modal/dialog state changes.

**Issues & Fixes**
- Removed the redundant `handleUserMenuClick` definition once the memoized version was introduced.
- Ensured `outletRef.current` is assigned synchronously during render so the keep-alive cache effect never sees an undefined outlet value.

**Next Steps**
- Extract the license and password modals into discrete components so their state updates stop rerendering the entire layout shell.
- Evaluate memoization for other Antd tables (ModelManagement, ScoringGeneration, ScoringHistory, etc.) if column churn persists.
- Assess bundling strategies for `styles.css` and `ModelDetailPage` to address the large chunk warning from `vite build`.

---

### 12:57

**Goal**
Second performance hardening pass — reduce avoidable rerenders in card/table heavy pages and trim repeated allocations inside KeepAlive/render loops.

**Implementation**
- `src/router/KeepAliveOutlet.tsx`
  - Replaced `excludePathnames.join('|')` memo dependency with stable array-reference dependency.
  - Hoisted active/hidden panel style objects to module constants to stop per-render style object allocation.
- `src/pages/ModelManagementPage.tsx`
  - Introduced memoized `ModelCardItem` to isolate card rerenders from parent modal/form state updates.
  - Added stable callbacks for detail/train/delete/create actions.
  - Memoized translated card labels, so card content updates only on language changes.
- `src/pages/ScoringGenerationPage.tsx`
  - Introduced memoized `ScoringCardItem` and stable detail/list callbacks.
  - Moved published model filtering into component-level `useMemo`.
  - Memoized shared translated labels used by all cards.
- `src/pages/UserPortraitPage.tsx`
  - Memoized table columns and datasource options.
  - Stabilized navigation/edit/delete handlers used inside column renders.
- `src/pages/PortraitPeriodPage.tsx`
  - Memoized columns plus year/month option arrays.
- `src/pages/TargetPeriodPage.tsx`
  - Memoized columns plus year/month option arrays.
- `src/pages/FeatureFieldDetailPage.tsx`
  - Memoized table columns.
  - Reworked `fieldGroups` derivation to precompute per-category counts once in `useMemo`, removing repeated `features.filter(...)` calls during render.

**Technical Details**
- In card-grid pages, parent state changes (open/close modal, form value updates) previously recreated all card action nodes and inline handlers. Splitting cards into `React.memo` subcomponents plus stable callbacks narrows update scope to cards whose props actually change.
- Antd `Table` responds to column reference churn. Wrapping column definitions in `useMemo` prevents unnecessary table reconciliation when unrelated local state changes.
- KeepAlive cache panel rendering created a new inline style object for each cached tab on every render. Hoisting styles removes repeated object allocation and reduces minor GC pressure during rapid tab switching.
- Feature detail cards were recalculating category counts with four `filter()` passes per field group during render. Precomputing counts in the grouped memo avoids repeated iteration for unchanged data.

**Performance Impact**
- Reduced rerender propagation in `ModelManagementPage` and `ScoringGenerationPage` when modal/form state updates.
- Lower table rerender churn across user portrait and period pages by stabilizing column and option references.
- Reduced repeated allocations in KeepAlive panel rendering path.
- Reduced per-render CPU work in feature detail expansion sections by removing repeated category filtering in render.
- Validation passed: `npx tsc -p tsconfig.app.json --noEmit` and `npx vite build` both succeeded after changes.

**Issues & Fixes**
- Needed to keep optimization scope behavior-neutral: all callback extraction kept original navigation/state side effects unchanged.
- Existing Vite warning about large chunks remains expected; no risky bundler chunking rewrite was applied in this pass.

**Next Steps**
- Apply route/component-level lazy loading for the heaviest remaining chunk contributors (`ModelDetailPage`, shared table/editor chunks) only where navigation boundaries are clear.
- Consider isolating layout-wide modal states (license/password) into memoized leaf components to further reduce `AppLayout` subtree updates.
- Introduce targeted virtualization for truly large data tables once real dataset size exceeds current mock scale.

---

### 13:04

**Goal**
High-risk bundle and startup optimization — aggressively reduce oversized route/page chunks and defer non-critical modules from initial load.

**Implementation**
- `src/router/index.tsx`
  - Converted `AppLayout` to route-level lazy import and wrapped authenticated root element with `Suspense` fallback.
- `src/layouts/AppLayout.tsx`
  - Converted `LicenseCenterModal` to lazy import.
  - Rendered license modal only when opened (`licenseOpen`) so modal code is not loaded on initial layout render.
- `src/pages/ModelDetailPage.tsx`
  - Removed direct `recharts`/lift modal rendering from the page shell.
  - Added lazy boundary for lift chart section with local fallback card.
- `src/pages/modelDetail/ModelLiftSection.tsx` (new)
  - New split feature module containing lift chart + lift modal tables (`recharts` + related UI).
  - Keeps heavy charting code out of the core `ModelDetailPage` chunk.
- `vite.config.ts`
  - Introduced manual chunking for stable vendor boundaries: `vendor-react`, `vendor-router`, `vendor-i18n`, `vendor-charts`.
  - Avoided fragile Antd sub-chunk forcing after detecting circular-chunk warnings during validation.

**Technical Details**
- The previous build showed a very large shared chunk (~1 MB class). Root causes included heavy shared imports and chart dependencies mixing into broader chunks.
- Splitting `ModelLiftSection` moved chart stack loading to an async boundary. `ModelDetailPage` now loads a lightweight shell first and pulls chart code only when that section resolves.
- Lazy-loading `AppLayout` and on-demand loading `LicenseCenterModal` move non-critical dashboard shell and modal code out of login/boot path.
- Manual chunking was tuned iteratively: an aggressive Antd sub-split caused circular chunk warnings and was rolled back to a safer strategy while retaining stable high-value splits.

**Verification**
- Build:
  - Ran `npm run build` multiple times during tuning.
  - Final build succeeded with no circular chunk warnings.
- Type checks:
  - Ran `npx tsc -p tsconfig.app.json --noEmit` after each meaningful refactor and at final state; all passed.
- Lint:
  - `npm run lint` attempted; repository currently has no lint script.
- Regression review (code-level):
  - Verified router auth branch still wraps `RequireAuth` and preserves original route tree.
  - Verified lazy boundaries include fallback UI and preserve original navigation/state behavior.
  - Verified `ModelDetailPage` keeps publish/unpublish and feature ranking behavior unchanged while delegating only lift section rendering.
- Bundle/chunk comparison (from build output):
  - Before this pass: largest shared chunk around `index-*.js` ≈ 1012.79 kB; `ModelDetailPage` ≈ 361.94 kB.
  - After this pass: largest shared chunk `index-7iUtuv89.js` ≈ 552.90 kB; `ModelDetailPage` ≈ 4.53 kB; new deferred `ModelLiftSection` ≈ 3.03 kB + `vendor-charts` ≈ 358.63 kB.

**Performance Impact**
- Significant reduction in main shared chunk pressure (about 45% reduction vs earlier 1 MB-class shared chunk).
- Model detail route shell now becomes fast-to-interactive while heavy charting is deferred to async chunk load.
- Non-critical modal code (license center) no longer contributes to initial layout chunk.
- Startup path now has clearer separation between core app runtime and heavy analytics/charting dependencies.

**Risks Remaining**
- Lazy chunk fetch failures (network/intermittent CDN) can delay lift section rendering; fallback exists but should be monitored.
- Additional route boundary introduces potential brief spinner/loading flash when first entering authenticated shell.
- Largest shared chunk still >500 kB; further reduction likely requires broader Antd usage strategy or UI primitive decomposition.

**Next Steps**
- Add route-level error boundaries or retry UX for lazy-loaded feature chunks (especially model detail chart section).
- Evaluate splitting additional low-frequency heavy panels (IngestJobs upload workflows, OperationListCreate advanced editor flows).
- Consider selective Antd component strategy and import-graph flattening to shrink the remaining 500k+ shared chunk.

---

### 13:11

**Goal**
Fix three UX/performance pain points under weak network: slow first authenticated entry, non-smooth first LicenseCenterModal open, and poor lazy chunk failure experience.

**Implementation**
- `src/components/lazy/LazyLoadGuard.tsx` (new)
  - Added reusable lazy-load guard that combines `Suspense` with an error boundary.
  - Added chunk-failure fallback UI with:
    - offline detection (`online`/`offline` events),
    - `Retry` action (re-mount lazy boundary),
    - `Reload App` action for stale/deployed chunk mismatch recovery.
- `src/components/lazy/AppShellFallback.tsx` (new)
  - Added layout-like skeleton fallback for authenticated shell loading.
- `src/router/preload.ts` (new)
  - Added reusable preload helpers: `loadAppLayout`, `loadDashboardPage`, `loadLicenseCenterModal`, `warmupAuthEntry()`.
- `src/router/index.tsx`
  - Replaced raw `Suspense` wrappers with `LazyLoadGuard` across lazy routes.
  - Added explicit feature names for route-level failure UX.
  - Added richer fallback for authenticated entry (`AppShellFallback`) instead of plain spinner.
  - Switched `AppLayout` lazy loader to shared preload function for deduped warmup.
- `src/pages/LoginPage.tsx`
  - Added early warmup on login page mount (`warmupAuthEntry()` + `loadLicenseCenterModal()`), reducing first authenticated transition latency.
  - Triggered auth warmup again on successful submit to improve hit rate under weak network.
  - Reduced artificial transition delay (`520ms` -> `280ms`) for faster visible entry after successful login.
  - Converted login `LicenseCenterModal` to lazy + suspense modal shell fallback and hover prefetch.
- `src/layouts/AppLayout.tsx`
  - Added idle-ish preload (`setTimeout`) for `LicenseCenterModal` chunk soon after entering workspace.
  - Added hover/focus prefetch on license trigger to smooth first open.
  - Wrapped lazy license modal with `LazyLoadGuard` for chunk failure recovery UX.
- `src/pages/ModelDetailPage.tsx`
  - Wrapped lazy `ModelLiftSection` with `LazyLoadGuard` to provide retry/reload UX when chart chunk fails.

**Technical Details**
- Root issue was not only chunk size, but weak-network first-hit latency and missing error recovery at lazy boundaries.
- Preloading uses dynamic imports that share module cache with subsequent lazy resolution, so first open/entry becomes faster without changing runtime behavior.
- Route-level fallback moved from generic spinner to shell-like placeholder to improve perceived readiness during authenticated-area cold starts.
- Error boundary captures dynamic import failures and provides actionable recovery paths; offline state is surfaced explicitly for better UX.

**Verification**
- Type checks:
  - Ran `npx tsc -p tsconfig.app.json --noEmit` (pass).
- Build checks:
  - Ran `npm run build` (pass).
  - Verified output still emits split lazy chunks (`AppLayout`, `LicenseCenterModal`, `ModelLiftSection`, vendor chunks).
- Lint checks:
  - Ran `npm run lint`; repository has no lint script (missing script).
- Targeted diagnostics:
  - Ran editor diagnostics on updated critical files (`router/index.tsx`, `AppLayout.tsx`, `LoginPage.tsx`, `ModelDetailPage.tsx`, `LazyLoadGuard.tsx`) — no file errors.
- Functional regression review (code-level):
  - Verified auth guard flow (`RequireAuth`/redirect) unchanged.
  - Verified license modal behavior preserved while adding preload and fallback shell.
  - Verified lazy module failures now have retry/reload/offline-friendly UX instead of silent/broken loading.

**Performance Impact**
- Faster perceived first authenticated entry via:
  - preloaded app shell/dashboard chunks,
  - reduced login transition hold time,
  - shell-like fallback during cold lazy load.
- Smoother first license modal open via mount warmup + hover prefetch + immediate fallback shell.
- Better resilience under weak network/offline with explicit recovery UI for lazy chunk failures.

**Risks Remaining**
- Additional preload requests may increase background bandwidth on very constrained networks.
- Retry UX depends on network recovery timing; some CDN cache mismatch cases still require full reload.
- Largest shared chunk warning remains and may still affect very low-end devices.

**Next Steps**
- Add optional exponential-backoff auto-retry for chunk fetch on reconnect.
- Add route-specific telemetry for lazy load failures and retry success rates.
- Continue shrinking large shared chunk by isolating remaining heavy common imports where safe.

---

### 13:16

**Goal**
Improve perceived UX under weak network for authenticated entry, first LicenseCenterModal open, and lazy chunk loading by distinguishing loading / slow-loading / failure states with contextual feedback.

**Implementation**
- `src/components/lazy/LazyLoadGuard.tsx`
  - Upgraded to layered loading state model:
    - delayed fallback display (`delayMs`) to avoid fast-load flicker,
    - slow-load threshold (`slowThresholdMs`) to infer degraded loading,
    - online/offline + network hint detection (`navigator.onLine`, connection metadata when available).
  - `loadingFallback` now supports dynamic rendering based on loading state.
  - Preserved chunk-failure error boundary with retry + full reload recovery actions.
- `src/components/lazy/RoutePageFallback.tsx` (new)
  - Added contextual skeleton page fallback with slow-network/offline hints.
- `src/components/lazy/AppShellFallback.tsx`
  - Enhanced authenticated shell fallback with slow-loading alert and non-blocking status text.
- `src/components/license/LicenseCenterModalFallback.tsx` (new)
  - Added immediate modal shell + skeleton content + slow/offline hints for first-open lazy wait.
- `src/router/index.tsx`
  - Replaced generic spinner-oriented route fallbacks with contextual skeleton fallbacks (`RoutePageFallback`, `AppShellFallback`).
  - Kept lazy failure handling uniformly via `LazyLoadGuard` for all lazy routes.
- `src/layouts/AppLayout.tsx`
  - License modal lazy boundary now shows `LicenseCenterModalFallback` instead of blank fallback.
  - Ensures first click opens shell immediately while heavy content chunk resolves.
- `src/pages/LoginPage.tsx`
  - Replaced modal `Spin` fallback with `LicenseCenterModalFallback` via `LazyLoadGuard`.
  - Keeps first-open license interaction responsive while lazy chunk loads.
- `src/pages/ModelDetailPage.tsx`
  - Lift analytics lazy section fallback upgraded with slow/offline hints inside card context.

**Technical Details**
- Previous behavior had two UX gaps under weak network:
  - generic spinners with little context,
  - occasional blank/near-blank waiting zones before lazy module readiness.
- New loading pipeline is state-aware:
  - fast loads avoid flashing fallback via delayed display,
  - delayed loads switch to “slow loading” guidance and network hints,
  - load failures enter retryable error UI with offline-friendly messaging.
- Modal flow now follows shell-first strategy: container appears immediately, heavy body content hydrates as async chunk arrives.

**Verification**
- Type checks:
  - `npx tsc -p tsconfig.app.json --noEmit` passed.
- Build checks:
  - `npm run build` passed and emitted lazy chunk outputs (`LicenseCenterModal`, `LicenseCenterModalFallback`, route/page chunks) as expected.
- Lint checks:
  - `npm run lint` attempted; repository has no lint script.
- Editor diagnostics:
  - Checked updated files (`LazyLoadGuard`, router, login, app layout, fallback components) — no file errors.

**Performance Impact**
- Faster perceived auth-area entry under weak network via immediate shell skeleton and clearer progress messaging.
- Smoother first-open LicenseCenterModal by showing modal shell instantly with in-modal skeleton content.
- Better lazy-loading resilience with explicit loading vs slow-loading vs failure states and actionable recovery.
- Reduced UX freeze perception by keeping feedback localized to route/modal context instead of global blocking indicators.

**Risks Remaining**
- `navigator.connection` support varies by browser; network hint gracefully degrades to unknown where unavailable.
- Additional fallback components increase UI surface area and require visual consistency checks across themes.
- Large shared bundle warning still exists and can still impact extreme low-end devices.

**Next Steps**
- Add user-visible countdown/backoff on repeated chunk retries under flaky networks.
- Add telemetry for slow-loading duration and retry success rate by route/module.
- Continue reducing remaining large shared chunk through targeted dependency boundary optimization.
