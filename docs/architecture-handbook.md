# LittleSteps — Architecture Handbook

> Generated from `blueprint.config` by `@kekkai/blueprint` — edit the blueprint, not this file.
Run `blueprint doctor --json` for the current-config adoption assessment; `blueprint inspect --json` supplies the architecture subset. Report executable gates, structural evidence (including baselined debt and non-blocking violations), reach, and semantic review separately. Green checks do not prove module ownership, layer placement, root responsibility, presentation responsibility, or topology correctness. Read `assessment`; `gateVerdict` is gate-only and `verdict` is its deprecated 4.2 alias. `ok` retains exit compatibility, so exit 0 does not mean all evidence was verified. Review module/layer/root responsibility explicitly; consumer counts are review signals, not proof of neutral ownership. A deliberate empty-module runway is declaratory. Current-config gates cannot discharge historical transformation or lifecycle obligations. These generated instructions contain no live assessment; rerun the commands against current source.

## Architecture

Code flows one way: each layer may import only from the layers below it. Upstream imports and same-module same-layer imports through the alias are barred.

```mermaid
flowchart TD
  subgraph m0["platform"]
    m0_l0["components"]
    m0_l1["hooks"]
    m0_l2["contexts"]
    m0_l3["services"]
    m0_l4["domain"]
    m0_l0 -.-> m0_l1
    m0_l1 -->|Context only · selfOnly| m0_l2
    m0_l1 --> m0_l3
    m0_l2 --> m0_l3
    m0_l3 -.-> m0_l4
  end
  subgraph m1["knowledge"]
    m1_l0["components"]
    m1_l1["hooks"]
    m1_l2["contexts"]
    m1_l3["services"]
    m1_l4["domain"]
    m1_l0 -.-> m1_l1
    m1_l1 -->|Context only · selfOnly| m1_l2
    m1_l1 --> m1_l3
    m1_l2 --> m1_l3
    m1_l3 -.-> m1_l4
  end
  subgraph m2["family"]
    m2_l0["components"]
    m2_l1["hooks"]
    m2_l2["contexts"]
    m2_l3["services"]
    m2_l4["domain"]
    m2_l0 -.-> m2_l1
    m2_l1 -->|Context only · selfOnly| m2_l2
    m2_l1 --> m2_l3
    m2_l2 --> m2_l3
    m2_l3 -.-> m2_l4
  end
  subgraph m3["portal"]
    m3_l0["components"]
    m3_l1["hooks"]
    m3_l2["contexts"]
    m3_l3["services"]
    m3_l4["domain"]
    m3_l0 -.-> m3_l1
    m3_l1 -->|Context only · selfOnly| m3_l2
    m3_l1 --> m3_l3
    m3_l2 --> m3_l3
    m3_l3 -.-> m3_l4
  end
  subgraph m4["account"]
    m4_l0["components"]
    m4_l1["hooks"]
    m4_l2["contexts"]
    m4_l3["services"]
    m4_l4["domain"]
    m4_l0 -.-> m4_l1
    m4_l1 -->|Context only · selfOnly| m4_l2
    m4_l1 --> m4_l3
    m4_l2 --> m4_l3
    m4_l3 -.-> m4_l4
  end
  subgraph m5["feedback"]
    m5_l0["components"]
    m5_l1["hooks"]
    m5_l2["contexts"]
    m5_l3["services"]
    m5_l4["domain"]
    m5_l0 -.-> m5_l1
    m5_l1 -->|Context only · selfOnly| m5_l2
    m5_l1 --> m5_l3
    m5_l2 --> m5_l3
    m5_l3 -.-> m5_l4
  end
  subgraph m6["littlesteps"]
    m6_l0["components"]
    m6_l1["hooks"]
    m6_l2["contexts"]
    m6_l3["services"]
    m6_l4["domain"]
    m6_l0 -.-> m6_l1
    m6_l1 -->|Context only · selfOnly| m6_l2
    m6_l1 --> m6_l3
    m6_l2 --> m6_l3
    m6_l3 -.-> m6_l4
  end
  subgraph m7["littlebloom"]
    m7_l0["components"]
    m7_l1["hooks"]
    m7_l2["contexts"]
    m7_l3["services"]
    m7_l4["domain"]
    m7_l0 -.-> m7_l1
    m7_l1 -->|Context only · selfOnly| m7_l2
    m7_l1 --> m7_l3
    m7_l2 --> m7_l3
    m7_l3 -.-> m7_l4
  end
  subgraph m8["littleexplorer"]
    m8_l0["components"]
    m8_l1["hooks"]
    m8_l2["contexts"]
    m8_l3["services"]
    m8_l4["domain"]
    m8_l0 -.-> m8_l1
    m8_l1 -->|Context only · selfOnly| m8_l2
    m8_l1 --> m8_l3
    m8_l2 --> m8_l3
    m8_l3 -.-> m8_l4
  end
  subgraph m9["babyoasis"]
    m9_l0["components"]
    m9_l1["hooks"]
    m9_l2["contexts"]
    m9_l3["services"]
    m9_l4["domain"]
    m9_l0 -.-> m9_l1
    m9_l1 -->|Context only · selfOnly| m9_l2
    m9_l1 --> m9_l3
    m9_l2 --> m9_l3
    m9_l3 -.-> m9_l4
  end
  subgraph m10["littleouting"]
    m10_l0["components"]
    m10_l1["hooks"]
    m10_l2["contexts"]
    m10_l3["services"]
    m10_l4["domain"]
    m10_l0 -.-> m10_l1
    m10_l1 -->|Context only · selfOnly| m10_l2
    m10_l1 --> m10_l3
    m10_l2 --> m10_l3
    m10_l3 -.-> m10_l4
  end
  subgraph m11["littleguard"]
    m11_l0["components"]
    m11_l1["hooks"]
    m11_l2["contexts"]
    m11_l3["services"]
    m11_l4["domain"]
    m11_l0 -.-> m11_l1
    m11_l1 -->|Context only · selfOnly| m11_l2
    m11_l1 --> m11_l3
    m11_l2 --> m11_l3
    m11_l3 -.-> m11_l4
  end
  m12["app · router composition"]
```

> **How to read the diagram**: a **solid** edge is a declared importer relation (its label carries the description and/or `selfOnly` — depend on it, never re-export it). A **dotted** edge only records declaration order: adjacent layers are not necessarily related. Reachability is transitive — a layer may import **any** layer below it in the flow, whether or not an edge is drawn, unless the target narrows its importers (`allowedImporters`).

### Modules

| Module | Responsibility | Direct dependencies |
| --- | --- | --- |
| `platform` | Product-neutral browser, Firebase client, session and presentation primitives. | — |
| `knowledge` | Parenting reference content and cross-stage knowledge search. | `platform` |
| `family` | Family profiles, pregnancy, shared child records and record access policy. | `knowledge`, `platform` |
| `portal` | Product catalogue, entry policy, navigation and public product metadata. | `family`, `knowledge`, `platform` |
| `account` | Account management and ordered account/data deletion. | `family`, `portal`, `platform` |
| `feedback` | User feedback and place correction submission. | `portal`, `platform` |
| `littlesteps` | Infant care tracking and guidance workflows. | `family`, `knowledge`, `platform`, `portal` |
| `littlebloom` | Pregnancy and prenatal care workflows. | `account`, `family`, `knowledge`, `platform`, `portal` |
| `littleexplorer` | Toddler development and daily care workflows. | `account`, `family`, `knowledge`, `platform`, `portal` |
| `babyoasis` | Nursing-room discovery and map interaction. | `account`, `feedback`, `knowledge`, `platform`, `portal` |
| `littleouting` | Family venue discovery and outing planning. | `account`, `feedback`, `platform`, `portal` |
| `littleguard` | Public disease radar exploration. | `account`, `family`, `platform`, `portal` |
| `app` | Application provider and route composition. | `littlesteps`, `littlebloom`, `littleexplorer`, `babyoasis`, `littleouting`, `littleguard`, `account`, `feedback`, `portal`, `family`, `platform` |

The optional reserved `app` module owns router composition recursively and uses the container position; it does not repeat the shared layers below.

Every other module reuses the shared layer contract below. Module dependencies are transitive: a module may import itself and every downstream module reachable through `dependsOn`; declaration order grants no permission. An absent layer folder is runway.

### Layers

| Layer | Responsibility | Must not | Owns |
| --- | --- | --- | --- |
| `components` | Presentation UI: renders or composes props, inputs, or a prepared view model; formats display and reports user intent through callbacks/events. Feature-private and single-consumer presenters are components. Ephemeral interaction state (open/closed, tabs, focus, input drafts) is allowed when it does not coordinate the application use case. Components do not perform application IO, sequence workflows, or decide application-level branches. Reuse informs shared/public promotion, not component classification. | call services [review only; no machine carrier]; touch the router [review only; no machine carrier]; own app state [review only; no machine carrier]; application-io-and-routing: Perform application network IO or direct navigation. [lint backed; available detectors; effective lint wiring must be verified separately; severity error] — {"capability":"network-io"}: available; limits: Unshadowed direct globals and navigator.sendBeacon only; local bindings do not match.; No delegated wrappers, dependency injection, application abstractions, runtime execution, or cross-file value flow are inferred. — {"capability":"routing"}: available; limits: Proven package-family references including subpaths and type-only references; runtime-dependent sources remain unverified.; No delegated wrappers, dependency injection, application abstractions, runtime execution, or cross-file value flow are inferred. — entry exemptions: (none) — checks use OR semantics; a passing detector is not proof of indirect semantic purity. Governed files: src/platform/components/**/*.{js,jsx,ts,tsx}, src/knowledge/components/**/*.{js,jsx,ts,tsx}, src/family/components/**/*.{js,jsx,ts,tsx}, src/portal/components/**/*.{js,jsx,ts,tsx}, src/account/components/**/*.{js,jsx,ts,tsx}, src/feedback/components/**/*.{js,jsx,ts,tsx}, src/littlesteps/components/**/*.{js,jsx,ts,tsx}, src/littlebloom/components/**/*.{js,jsx,ts,tsx}, src/littleexplorer/components/**/*.{js,jsx,ts,tsx}, src/babyoasis/components/**/*.{js,jsx,ts,tsx}, src/littleouting/components/**/*.{js,jsx,ts,tsx}, src/littleguard/components/**/*.{js,jsx,ts,tsx}; ignores: **/*.test.{js,jsx,ts,tsx,vue}, **/*.spec.{js,jsx,ts,tsx,vue}. Reach: unmeasured; empty positions are not behavioral protection; Inspect measures current reach. | — |
| `hooks` | Adapts server and shared state; the only layer that injects context or owns a store. | — | `react` → `useContext`, `zustand` |
| `contexts` | Defines and provides Context / Provider only. | — | `react` → `createContext` |
| `services` | Network primitives — the only layer that talks to the HTTP client or sockets. | — | `axios`, global `fetch`, global `WebSocket` |
| `domain` | Pure domain data, contracts and calculations without UI, browser effects or network IO. | presentation-and-effects: Render UI, use lifecycle/state, access browser DOM or perform network IO. [lint backed; available detectors; effective lint wiring must be verified separately; severity error] — {"capability":"render-ui"}: available; limits: Framework calls require proven imported bindings, including aliases and namespace members; unrelated names do not match.; JSX, renderable Vue template nodes, and render methods on proven React Component/PureComponent subclasses only.; No delegated wrappers, dependency injection, application abstractions, runtime execution, or cross-file value flow are inferred. — {"capability":"react-state"}: available; limits: Framework calls require proven imported bindings, including aliases and namespace members; unrelated names do not match.; Class state ownership and setState use require a proven React Component/PureComponent subclass.; No delegated wrappers, dependency injection, application abstractions, runtime execution, or cross-file value flow are inferred. — {"capability":"react-lifecycle"}: available; limits: Framework calls require proven imported bindings, including aliases and namespace members; unrelated names do not match.; Lifecycle method declarations require a proven React Component/PureComponent subclass.; No delegated wrappers, dependency injection, application abstractions, runtime execution, or cross-file value flow are inferred. — {"capability":"browser-dom"}: available; limits: Unshadowed direct global references only; declarations, keys, labels, and local bindings do not match.; No delegated wrappers, dependency injection, application abstractions, runtime execution, or cross-file value flow are inferred. — {"capability":"network-io"}: available; limits: Unshadowed direct globals and navigator.sendBeacon only; local bindings do not match.; No delegated wrappers, dependency injection, application abstractions, runtime execution, or cross-file value flow are inferred. — {"capability":"routing"}: available; limits: Proven package-family references including subpaths and type-only references; runtime-dependent sources remain unverified.; No delegated wrappers, dependency injection, application abstractions, runtime execution, or cross-file value flow are inferred. — {"package":"leaflet"}: available; limits: Exact package and slash-delimited subpaths; sibling package names do not match.; Static imports and re-exports, including type-only forms, proven CommonJS require and dynamic-import strings; runtime-dependent sources remain unverified. — {"package":"react-leaflet"}: available; limits: Exact package and slash-delimited subpaths; sibling package names do not match.; Static imports and re-exports, including type-only forms, proven CommonJS require and dynamic-import strings; runtime-dependent sources remain unverified. — {"package":"react-leaflet-cluster"}: available; limits: Exact package and slash-delimited subpaths; sibling package names do not match.; Static imports and re-exports, including type-only forms, proven CommonJS require and dynamic-import strings; runtime-dependent sources remain unverified. — {"call":"divIcon"}: available; limits: Project-declared syntactic call-name check, not semantic identity proof; unrelated terminal methods may match. No aliases, reassignment, wrappers, runtime-computed members, constructors, or Vue template-expression calls. — entry exemptions: (none) — checks use OR semantics; a passing detector is not proof of indirect semantic purity. Governed files: src/platform/domain/**/*.{js,jsx,ts,tsx}, src/knowledge/domain/**/*.{js,jsx,ts,tsx}, src/family/domain/**/*.{js,jsx,ts,tsx}, src/portal/domain/**/*.{js,jsx,ts,tsx}, src/account/domain/**/*.{js,jsx,ts,tsx}, src/feedback/domain/**/*.{js,jsx,ts,tsx}, src/littlesteps/domain/**/*.{js,jsx,ts,tsx}, src/littlebloom/domain/**/*.{js,jsx,ts,tsx}, src/littleexplorer/domain/**/*.{js,jsx,ts,tsx}, src/babyoasis/domain/**/*.{js,jsx,ts,tsx}, src/littleouting/domain/**/*.{js,jsx,ts,tsx}, src/littleguard/domain/**/*.{js,jsx,ts,tsx}; ignores: **/*.test.{js,jsx,ts,tsx,vue}, **/*.spec.{js,jsx,ts,tsx,vue}. Reach: unmeasured; empty positions are not behavioral protection; Inspect measures current reach. | — |

Error-severity executable matches are proven blocking violations (failed gate, affectsExit: true in the enforcing lint run). Warn-severity matches are visible non-blocking conformance observations (affectsExit: false), not failed gates. Partial or unavailable detectors yield unverified evidence and block adoption completion without inventing a violation or a new CLI exit policy. A proven missing, disabled, replaced, or mismatched required carrier is failed even at warn severity. Review-only prose remains the reviewer’s responsibility.

## Module growth protocol

The declared modules are the current domain authority; new domain boundaries come only from this protocol.

When owner-requested product work adds behavior, or materially reshapes behavior, that no declared module owns:

1. **Never derive a module from vocabulary.** A request noun, screen, route segment, hook, service, entity, or existing top-level folder is not a module by itself; one module per screen, hook, service, entity, or noun is the wrong decomposition.
2. **Project the behavior onto a temporary layer-first model, for reasoning only.** Trace route/page composition → the container/use-case responsibilities it composes → the components, hooks, contexts, services, and other units each responsibility needs. The projection is analysis, not topology: never describe this repository as layer-first, never write a layer-first config, and never run `blueprint init --topology` or a topology transformation to perform it.
3. **Treat each container/use-case responsibility as a module seed,** and associate every unit with the responsibility closures that use it.
4. **Merge related seeds; split only independent ones.** Several screens or use cases of one business responsibility are one module. Split a seed only where its responsibilities are genuinely independent.
5. **Keep domain-owned code with its owner.** Code with a clear domain owner stays in that module even when several modules consume it; they depend on it. Extract only genuinely neutral code, into a module named for what it is (for example `platform` or `ui`) — never a catch-all `shared`, `common`, or `core`.
6. **Materialize Module → Layer → Unit only after ownership is decided.** Declare each module in the config's `modules` (`architecture.modules`, or the `modules` option of `reactPreset` / `vuePreset`) with a precise `does`. Its root files take the container position — the role a layer-first container plays, never an inner `containers` layer — and may import, through unit entries, every inner layer of their own module and of modules reachable through `dependsOn`. Units go into the declared inner layers. Route/page composition belongs to the reserved `app` module once routes exist.
7. **Derive `dependsOn` from the resulting imports.** A module that imports another declares it as a direct dependency. Never add an edge only to make a boundary check pass, and never leave a real edge undeclared.
8. **Regenerate and verify.** Run `npx blueprint init` so lint, the handbook, and the agent contracts include the new module, then `npx blueprint inspect`.

Inner layers, rules, and thresholds are outside this protocol: changing them remains the owner's decision.

## External consumers

Declared `architecture.consumerFiles` patterns (relative to the Blueprint application root): `vite.config.ts`, `scripts/**/*.{ts,js,mjs,cjs}`, `e2e/**/*.ts`.

Only matching files outside `sourceRoot` are external consumers, outside the Module → Layer → Unit topology. They receive no module, layer, unit, container, ownership, or public-entry identity; their imports add no module `dependsOn` or architecture reach evidence. A pattern matching governed files does not exempt those files. With `sourceRoot: "."`, there is no outside-source set and this declaration has no effect.

Consumers may depend on governed source only in the application-scope sense: that edge does not establish uncovered application source. Governed source must not depend on consumers; declaring a consumer never repairs that reverse dependency. The declaration does not certify canonical aliases, target API correctness, public entries, or deep imports.

File globs are explicit owner authority, never inferred from tool or directory names. Keep patterns narrow: broad patterns can hide genuine outside-source mistakes. Mixed-role directories remain checked file by file. This role does not move or scaffold files, expand scan roots, or suppress other independently applicable findings.

`testFiles` retains its separate existing policy and takes precedence, exempting matching tests in both directions before consumer classification. `layerFilesIgnore` remains a lint/lint-backed exclusion and cannot hide application-scope evidence. Scanner exclusions, `additionalAliases`, and baselines retain their existing roles.

## Direct module synchronization

`dependsOn` declares direct dependencies and seeds transitive module permission. `blueprint deps` and `blueprint inspect` separately report direct source-observed coupling. A transitively permitted reference can still lack a direct declaration; observed edges never grant permission. Exact synchronization compares declared and observed direct edges without transitive reduction.

Scope: governed module source only; type-only references count. `testFiles` matches are excluded (`[]` exempts nothing); `layerFilesIgnore` does not hide dependencies. Generated-looking source counts; existing build/cache exclusions remain. Outside-source consumers have no module identity. This is bounded static analysis, not the complete runtime graph.

Static imports, exports/re-exports, proven require() and proven dynamic imports count. Runtime-dependent imports, parse failures and unresolved project references make the importer incomplete: unobserved declarations are unverified, not unused. Known drift remains drift even with uncertainty. Vacuous modules and an empty module runway are not evidence of populated coverage. Outside-scope completeness is independent.

Review the live report, resolve missing/unused declarations and uncertainty, then opt into `rules.moduleDependencySync` at the desired tier. This is an Inspect runtime gate, not ESLint; Doctor does not prove that CI runs Inspect. Resolve or explicitly baseline findings. `inspect --baseline` ratchets known debt and does not prove exact equality. Never automatically add, remove, sort or transitive-reduce `dependsOn`; the owner decides whether source or architecture should change. Equality does not prove domain ownership.

## Unit shape

A unit is the code item inside a layer. Folder units expose only their entry; file units are one file each.

| Layer | Unit layout | Entry |
| --- | --- | --- |
| `components` | `folder` | `index` |
| `hooks` | `folder` | `index` |
| `contexts` | `folder` | `index` |
| `services` | `folder` | `index` |
| `domain` | `folder` | `index` |

Each ordinary module with immediate governed root source is one root unit addressed by the module directory. Exactly one supported `index.*` is its external entry; direct siblings are private members, transitively reachable from that entry. A disconnected private cycle is orphaned. Import the bare module alias, never `/index` or a member path.
Declared inner-layer descendants remain separate units. A layer-only module needs no root entry or empty barrel. Inner layers cannot import upward to the module root. The reserved recursive `app` tree is exempt from root entry/private/orphan checks.

## Import discipline

These boundaries are emitted for ESLint, but their effective project-lint wiring remains unverified until `blueprint doctor` proves it:

- **Module reachability** — a module may import only itself and modules reachable through its declared `dependsOn` edges. The inner layer flow must also allow the import.
- **One-way only** — a layer imports only from the layers below it; upstream imports are errors.
- **Canonical boundary spelling** — use `~app`, the source-root alias, whenever an import crosses a declared layer or module boundary. Additional aliases are resolved for diagnosis, but rejected as alternate boundary spellings.
- **No same-module same-layer imports via the alias** — use a relative path. File units may reach sibling files; folder units may reach a sibling only through its entry. Extract shared logic down to a lower layer when neither unit owns it.
- **Entry-only** — import a folder unit through its `index`, never its internals.
- **Dynamic parity** — a dynamic import whose target reduces to a proven string follows the same alias, flow, and unit-entry rules. Runtime-dependent targets remain explicitly unverified; they are never invented as legal graph dependencies.
- **No redundant relative segments** (`./../`, `././`) that bypass the rules.
- **Ownership** — packages and globals are restricted to their owning layer (see the *Owns* column above).
- **selfOnly** — where a layer narrows its importers with `selfOnly`, that importer may depend on it but must never re-export it onward.

## Component shape — 7 orthogonal axes

A set, not a pipeline: each axis is an independent yes/no design decision — never infer
that one axis holds because another does. Numbering is identity, not order, and trivial
changes need not force the full pass. Lint is an entry point here, never a verdict.

### 1. Ownership Inversion — The unit that needs derived state owns the derivation.

Do not precompute in the parent and drill the result down — the child imports the hook and derives it itself. Field-tested: 17 props down to 7.

### 2. IO Shrinkage — Narrow the inputs, shrink the outputs.

Three moves: split a multi-concern unit; collapse parallel raw states carrying an invariant into one modeled state; merge symmetric twins into one object of the same shape. Count and size are weak signals — whether the state is modeled is the review call.

> Triage: `max-params` is the review entry point — the verdict stays with review.

### 3. SRP Decomposition — Split on responsibility boundaries, not on size.

Naming test: if you cannot name it without "and", it wants splitting; dissolving code into an existing home is also a split. Exception: writable state that must stay in sync — force-splitting it manufactures sync bugs.

> Triage: `max-statements` is the review entry point — the verdict stays with review.

### 4. Orchestration Shell — A page only orchestrates.

Route/id resolution, the loading shell, shared sources, cross-child lifecycle — never deriving values on behalf of each child. Field-tested: a 6666-line detail page down to 552.

> Triage: `max-lines` is the review entry point — the verdict stays with review.

### 5. Scoped Writable State — Writable state lives at the lowest common owner of its writers and readers.

Hoist only what is genuinely shared across a boundary; state that must survive a route change goes to the URL or a store. "Might be shared later" is YAGNI — hoist when the sharing arrives.

### 6. Lifecycle Internalization — If lifecycle is part of the responsibility, build it in.

The caller receives a unit that is already running and cleans itself up — not a kit of handlers to wire into mount/effect hooks. Field-tested: 19 exports down to a one-line call.

### 7. Pure Helpers ≠ Composables — Keep pure functions out of reactive/lifecycle units.

One exported function does not demand one file: responsibility splits at the function level; the file splits only when max-lines approaches. Expose the decision a unit makes, not its raw ingredients.

## Principles

### Behavioral (held in review / CLAUDE.md)

- **Split by responsibility, not by size** — The signal to split is how many things a unit does — line count is only a backstop.
- **One source of truth** — Derive computed values; never store duplicate mutable state that can desync.
- **Keep interfaces narrow** — Narrow inputs and outputs so illegal states cannot be expressed.
- **Keep knowledge where it is used** — Push derivation to the child and state to its lowest common owner; do not hoist.
- **Dead code: delete it or mark it** — An abstraction with no consumer is dead; sweep orphans, mark retained-dead as deprecated.
- **Lint is an entry point, not a verdict** — Mechanical checks only triage; cohesion and invariants need review.
- **Acceptance criteria are a start, not scripture** — Fixing a ticket that violates an abstraction's responsibility is upholding the design.
- **YAGNI — do not over-engineer** — "Might need it later" is not a reason to abstract now.
- **Cost is the third dimension** — Cost = work per event × event frequency; price any logic wired to a data source.

## Working playbook

Judgment rules no tool enforces — they hold in review and in the agent contract.

### Runtime load discipline

- **Price every handler attached to a data source.** — Before wiring anything to WS / polling / scroll / input, answer: events per second, data per event, per-event cost. If you cannot answer, it does not merge — and copying an existing pattern is no exemption, because frequency is not in the code.
- **High-frequency updates write in place.** — Patch the changed entry and keep container identity; whole-replace is for baseline rebuilds only. A prop whose identity changed while its value did not is the disease. Write shapes do not port across frameworks.
- **Diagnose re-renders in four steps, never by guessing.** — Who renders (profiler) → what triggered it (render tracing) → who produced the identity (grep the assignment sites) → was it worth it (compare against the event payload).
- **Performance claims must be acceptance-testable.** — "Fewer re-renders" is not a claim; "one event re-renders at most N components" is. Pin it with a render-count or identity-stability test — an unmeasured performance claim did not happen.

### Refactor discipline

- **Safety net first, then split, then tidy the tests.** — Three stages, one commit each, non-overlapping review scopes. Writing the net first forces the observable contract into the open.
- **One refactor arc = one PR, one commit per phase.** — The PR body maps each commit to its phase; ask before splitting the arc into separate tickets.
- **Extract by copying from source, never by rewriting from memory.** — After extraction, diff the target against git history — a passing suite alone does not prove the extraction faithful.
- **Scan every identifier before extracting.** — Not just reactive refs — imports, local definitions, parameters. A missed dependency surfaces later as a broken extraction.
- **Do not pin what the refactor itself will change.** — A safety net asserting values the arc is about to change fails the moment the sibling refactor lands.
- **AC-named payload fields deserve a contract test.** — Asserting that the mocked service receives field X is not a tautology — a dropped field or an unbound handler breaks it while the source constant stays green.
- **Wrap an arc with cross-cutting themes and verified numbers.** — Name the forces (ownership inversion, IO shrinkage, SRP) and attach before/after numbers verified against git history.

### Design collaboration

- **Frame architectural corrections as guarding the design.** — State the principle being protected, show how the literal ticket reading violates it, and present the choice as that principle's natural consequence.
- **Do not reopen settled designs.** — When the shape has been specified, implement it as spec. Raise genuine concerns once, with reasons — not as a menu of alternatives.
- **"The user can work around it" does not park a bug.** — Judge by diff size, scope, and standalone impact; a normal-path bug that violates expectations deserves its ticket.

## Rules

| Rule | Tier | Option | Enforced by |
| --- | --- | --- | --- |
| `maxLines` | `error` | `400` | lint |
| `maxLinesPerFunction` | `error` | `100` | lint |
| `maxParams` | `error` | `3` | lint |
| `maxStatements` | `error` | `15` | lint |
| `complexity` | `error` | `12` | lint |
| `unusedVars` | `error` | — | lint |
| `explicitAny` | `error` | — | lint |
| `codeStyle` | `error` | — | lint |
| `statementsPerLine` | `error` | — | lint |
| `statementPadding` | `error` | — | lint |
| `importBlock` | `error` | — | lint |
| `fixtureImports` | `error` | — | lint |
| `cycles` | `error` | — | `blueprint inspect` |
| `deadCode` | `error` | — | documentation only |
| `usePrefix` | `error` | — | lint |
| `testFilename` | `error` | — | lint |
| `usePrefixReactivity` | `error` | — | lint |
| `typedefOnlyFile` | `error` | — | lint |
| `moduleDependencySync` | `error` | — | `blueprint inspect` |

The tier is what the enforcing machine does with a violation: `error` fails, `warn` is advisory, `off` is disabled. Which machine differs — `lint` rows fail the project's lint run, `blueprint inspect` rows fail `blueprint inspect` and never appear in a lint run, documentation-only rows are recorded intent with no gate behind them at any tier, and a row reading `nothing` is lint-gated in general but cannot emit on THIS blueprint — the cell says which fact rules it out. Every row reaches only the files the architecture globs match: a declared position holding no code has nothing that can fail, which is runway rather than protection — `blueprint doctor` reports which of the two this repo has today.

## Naming

| Concept | Convention |
| --- | --- |
| `component` | PascalCase; the implementation file is named after the unit |
| `hook` | useX — only when it genuinely uses reactivity |
| `service` | snake_case |
| `context` | XxxProvider / XxxContext |
