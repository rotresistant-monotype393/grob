# ADR-0003: Exceptions over Error Values

**Status:** Accepted
**Date:** April 2026
**Decision:** Exceptions are Grob's runtime error model.

## Context

Two established patterns exist: exceptions (C#, Python, Java) and error values
(Go, Rust). Both have trade-offs. The question was which model fits a scripting
language targeting developers and hobbyists.

## Decision

Exceptions with `try/catch`. Functions throw on failure. Unhandled exceptions
propagate to the VM top level — a Grob-quality diagnostic is produced and the
script halts.

Multiple typed catch blocks are supported. Bare `catch e` is the catch-all and
must appear last.

Exception hierarchy: `GrobError` as root, with `IoError`, `NetworkError`,
`JsonError`, `ProcessError`, `NilError`, `RuntimeError`.

## Alternatives Considered

**Go-style error values** — explicit but verbose. Every function call that might
fail requires an `if err != nil` check. For scripting, where the common case is
"fail and stop," this adds ceremony without proportional benefit.

**Result types (Rust)** — elegant but steep learning curve. Pattern matching on
`Result<T, E>` is powerful but not approachable for hobbyists. Conflicts with
the design target.

## Consequences

Positive: familiar to C# developers, low ceremony for the common case (let it
crash), `try/catch` available when recovery is needed.

Negative: exceptions can be silently swallowed with an empty catch block.
Mitigated by Grob's two-mode error strategy: the compiler catches most errors
before execution and unhandled runtime exceptions always produce diagnostics.

User-defined exception types are deferred post-MVP.
