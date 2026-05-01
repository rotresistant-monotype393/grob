# ADR-0012: Solution Structure and Naming Convention

**Status:** Accepted
**Date:** April 2026

**Decision:** Seven-assembly solution structure confirmed. `Grob` prefix used in
full for all runtime types — `Gro` is never used as an abbreviation.

## Context

During solution scaffolding, two questions arose: whether `Chunk` should live in
`Grob.Core` or `Grob.Runtime`, and whether a shortened prefix (`Gro`) was
acceptable for internal runtime types.

## Decision

**`Chunk` lives in `Grob.Core`.** Both `Grob.Compiler` (produces chunks) and
`Grob.Vm` (consumes chunks) need it. `Grob.Runtime` holds the plugin contract,
not internal execution primitives. Moving `Chunk` to `Grob.Runtime` would make
the plugin contract depend on an internal execution concern.

**The prefix is always `Grob` in full.** `GrobType` not `GroType`. `GrobValue`
not `GroValue`. `GrobError` not `GroError`. The abbreviation `Gro` is not a
convention in this codebase.

The seven source assemblies are:
`Grob.Core`, `Grob.Runtime`, `Grob.Compiler`, `Grob.Vm`, `Grob.Stdlib`,
`Grob.Cli`, `Grob.Lsp`.

## Alternatives Considered

**`Chunk` in `Grob.Runtime`** — would have made `Grob.Runtime` a mix of plugin
contract and execution primitives, blurring its purpose. Rejected.

**`Gro` prefix** — shorter but inconsistent with the assembly name prefix
(`Grob`). Would produce confusing names like `GroType` alongside `Grob.Compiler`.
Rejected.

## Consequences

`Grob.Core` is the only coupling between `Grob.Compiler` and `Grob.Vm`. Neither
references the other. `Grob.Runtime` remains a clean plugin contract.

All tooling, documentation and code that uses `Gro` as a type prefix abbreviation
is incorrect and must be updated.
