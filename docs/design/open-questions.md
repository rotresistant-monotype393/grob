# Grob — Open Questions

> Design questions requiring decisions before implementation reaches them,
> and resolved questions with their full rationale preserved.
> Decisions authorised in the decisions log — April 2026 design sessions.
> This document preserves the reasoning behind each question and resolution.
> When this document and the decisions log conflict, the decisions log wins.

-----

## Open Questions

These are unresolved. They require a decision before implementation reaches them.
Listed in rough priority order — earlier questions affect more downstream design.

-----

### OQ-005 — Value Representation

**Question:** Tagged union struct or NaN boxing?

**Tentative direction:** Tagged union. NaN boxing is worth understanding (clox
covers it) but the C# idiom argues against it.
**Defer until:** clox complete.

-----

### OQ-006 — GC Strategy (Confirm or Revise)

**Question:** Lean entirely on C#'s GC, or implement a custom mark-and-sweep?

**Tentative direction:** Lean on C#. Revisit only if profiling shows a problem.
**Defer until:** clox complete.

-----

### OQ-007 — `for...in` Loop and Iterable Protocol

**Question:** Is there a formal iterable protocol, or is `for...in` special-cased to arrays?

**Impact:** Medium. Affects compiler (loop lowering) and how the stdlib exposes collections.
**Defer until:** Collections API design session.

-----

## Resolved Questions

These questions have been decided. Full rationale is preserved here for reference.
One-line resolutions are recorded in the confirmed decisions table of
`decisions-log.md`.

-----

### OQ-001 — Generics Scope

**Status: RESOLVED — April 2026**

**Decision:** Constrained generics. The type checker and compiler understand generic
type parameters internally. Users consume generic functions via stdlib and plugins
(`mapAs<T>()`, `filter`, `map` etc) but cannot declare generic functions or types
in v1. Evolution to user-facing generics is an additive grammar extension — no
architectural rework required.

**Rationale:** Gets type-safe collections and JSON deserialisation without committing
to full user-facing generic syntax on day one. Implementation scope is meaningfully
smaller than full generics. Closes no doors — the type checker already understands
generics, the grammar simply doesn't expose the declaration syntax yet. Analogous
to Go pre-1.18.

**Plugin constraint:** Plugins that expose generic functions must express type
parameters via `FunctionSignature` in `Grob.Runtime`. Designed in from the start.

-----

### OQ-002 — Struct / Record Types

**Status: RESOLVED — April 2026 (SharpBASIC retrospective)**

**Decision:** Grob needs user-defined struct/record types.

**Evidence:** The Sunken Crown required parallel arrays as a substitute for records.
The retrospective verdict: *"Messy, wasteful, and slow."* The absence of a `type`
keyword was the single biggest language limitation revealed by writing a real program.

**Confirmed direction:** `type` keyword, structural types, fields declared inside
the block. Immutable by default, opt-in mutability. JSON deserialisation (`mapAs<T>()`)
maps JSON keys to fields by name.

```grob
type Repo {
    org:     string
    project: string
    name:    string
}
```

-----

### OQ-003 — JSON and the Type System Boundary

**Status: RESOLVED — April 2026**

**Decision:** `mapAs<T>()` is the confirmed boundary mechanism — a generic method
understood by the type checker, consuming the constrained generics infrastructure.
JSON nodes are accessed via `json.Node` with typed accessors (`asString()`, `asArray()`
etc.) and mapped to user-defined types via `mapAs<T>()`. Full json module API specified
in `stdlib-reference.md`.

-----

### OQ-004 — Error Handling Model

**Status: RESOLVED — April 2026**

**Decision:** Exceptions as the runtime error model. See confirmed decisions for detail.

-----

### OQ-008 — `date` as a Built-in or Stdlib Type

**Status: RESOLVED — April 2026**

**Decision:** `date` is a core stdlib type — auto-available, no import required.
Single type holds both date and time. Full API locked — see confirmed decisions.

-----

*Resolved questions are summarised as one-line entries in the confirmed decisions*
*table of `decisions-log.md`. The full rationale is preserved here.*

-----

*Document created April 2026 — extracted from decisions-log.md.*
*Authorised decisions recorded in decisions-log.md.*
*This document is the implementation reference — the decisions log is the authority.*
