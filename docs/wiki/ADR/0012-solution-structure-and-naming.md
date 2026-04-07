# ADR-0012 — Solution Structure and Assembly Naming

**Date:** April 2026
**Status:** Accepted

---

## Context

Before implementation begins, the solution structure needs to be locked. Several
questions were open simultaneously:

1. How many assemblies should the solution contain, and where are the boundaries?
2. Where does `Chunk` live — the data structure that is both produced by the compiler
   and consumed by the VM?
3. What naming prefix do Grob runtime types use?

The constraint driving the structure is that `Grob.Compiler` and `Grob.Vm` must
never reference each other. The compiler's job ends at `Chunk` production. The VM
has no knowledge of how a `Chunk` was produced. Maintaining that separation requires
a shared assembly for the types they both need.

The naming question arose from inconsistency in early design notes, where `GroType`
appeared without a recorded rationale — likely an unconscious abbreviation.

---

## Decision

### Assembly structure

The solution is organised into six `src/` projects, three `plugins/` projects,
and five `tests/` projects:

**src/**

| Assembly        | Responsibility                                                                                            |
| --------------- | --------------------------------------------------------------------------------------------------------- |
| `Grob.Core`     | Shared primitives: `Chunk`, `OpCode`, `GrobType`, value types                                             |
| `Grob.Runtime`  | Plugin contract: `IGrobPlugin`, `GrobVM` registration surface, `FunctionSignature`, `GrobError` hierarchy |
| `Grob.Compiler` | Lexer, Parser, AST, TypeChecker, Compiler — source to bytecode                                            |
| `Grob.Vm`       | Fetch/decode/execute loop, value stack, call frames, plugin loader                                        |
| `Grob.Stdlib`   | Core modules as `IGrobPlugin` implementations — auto-registered at startup                                |
| `Grob.Cli`      | Entry point, composition root, all CLI commands, REPL                                                     |

**plugins/** — first-party plugins; built and tested as third-party plugins would be:

- `Grob.Http` — reference implementation
- `Grob.Crypto` — checksums and hashing
- `Grob.Zip` — archive operations

**tests/** — one per testable surface, plus integration:

- `Grob.Core.Tests`, `Grob.Compiler.Tests`, `Grob.Vm.Tests`, `Grob.Stdlib.Tests`, `Grob.Integration.Tests`

### Chunk placement

`Chunk` lives in `Grob.Core`. Both `Grob.Compiler` and `Grob.Vm` reference
`Grob.Core` — it is their only shared ground. This keeps the compiler/VM boundary
clean without creating a circular dependency.

### Type naming

The naming prefix for all Grob runtime types is `Grob` in full. `Gro` as an
abbreviation is not a convention in this codebase. The corrected names are:

- `GrobType` (was `GroType` in early design notes)
- `GrobValue` (not `GroValue`)
- `GrobError`, `GrobVM`, `GrobFunction` — unchanged, already correct

Every Grob type name reads unambiguously. No contributor needs to learn that
`Gro` means Grob.

---

## Alternatives Considered

### Option A — Two assemblies: Grob.Runtime contains Chunk

`Chunk` placed in `Grob.Runtime` alongside the plugin contract. Both `Grob.Compiler`
and `Grob.Vm` already reference `Grob.Runtime`, so the dependency is clean.

**Rejected because:** `Grob.Runtime` is the public NuGet package for plugin authors.
`Chunk` is an internal execution primitive — plugin authors never need it. Exposing
`Chunk` on the public plugin surface conflates two distinct concerns: the execution
model and the plugin contract. Keeping them separate in `Grob.Core` means `Grob.Runtime`
can evolve its public surface without dragging internal plumbing with it.

### Option B — Three assemblies: Grob.Core as thin shared layer (chosen)

`Grob.Core` holds execution primitives (`Chunk`, `OpCode`, `GrobType`, value types).
`Grob.Runtime` holds only the plugin contract and the error hierarchy.
Both compiler and VM reference `Grob.Core`. Plugin authors reference `Grob.Runtime`.

**Chosen because:** The separation is principled. `Grob.Core` = what you need to
execute code. `Grob.Runtime` = what you need to extend Grob. Plugin authors never
reference `Grob.Core`; internal implementors rarely need the full `Grob.Runtime`
plugin machinery.

### Keep `GroType` as-is

No principled argument for the abbreviation was found. The only benefit is
saving four characters. The cost is every contributor needing to learn a
non-obvious abbreviation. Rejected.

---

## Consequences

**Positive:**

- Dependency graph is a DAG with no cycles. Compiler and VM never reference each other.
- `Grob.Runtime` NuGet surface is clean — plugin authors see only what they need.
- Each assembly is independently testable in isolation.
- First-party plugins in `plugins/` are built exactly as third-party plugins — if
  they need special treatment, the model is broken.
- Naming is unambiguous throughout — no abbreviation conventions to memorise.

**Negative / watch points:**

- `Grob.Core` is a new project not present in earlier structural sketches. Low overhead
  in practice — it is a thin assembly with no behaviour, only data structures.
- `GrobType` rename from `GroType` must be applied consistently across all design
  documents on adoption. Early design notes (`Grob___VM_Architecture___Design_Notes.md`,
  `Grob_Plugins.md`) contain `GroType` references — treat as superseded by this ADR.

---

## Related Documents

- `Grob___Solution_Architecture.md` — full assembly reference
- `Grob___Decisions___Context_Log.md` — April 2026 entry: solution structure
- `Grob___VM_Architecture___Design_Notes.md` — superseded on structural points;
  `GroType` references in that document should be read as `GrobType`

