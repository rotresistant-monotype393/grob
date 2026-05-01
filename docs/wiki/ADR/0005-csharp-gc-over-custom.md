# ADR-0005: C# GC over Custom

**Status:** Tentatively Accepted (OQ-006, pending confirmation)
**Date:** February 2026
**Decision:** Lean on C#'s garbage collector rather than implementing custom mark-and-sweep.

## Context

Grob's VM is written in C#. C# has a mature generational garbage collector.
Implementing a custom GC would duplicate functionality that already exists in
the host runtime.

## Decision

Use C#'s GC for heap object management. The design investment goes into value
representation — use `struct` for value types (stack allocated, zero GC pressure)
and `class` only for heap objects. Minimise heap allocations in the hot path.

## Alternatives Considered

**Custom mark-and-sweep** — full control over collection timing and behaviour.
This is the approach used in clox (which runs in C without a host GC). In C#
it would mean duplicating what the runtime already provides.

**Reference counting** — deterministic destruction but adds overhead to every
assignment and has the classic cycle problem.

## Consequences

Positive: no GC implementation to write, test or maintain. The .NET GC is
battle-tested. Development effort goes to language features instead.

Negative: less control over collection timing. GC pauses are possible but
invisible for scripting workloads (file operations, automation).

This decision will be confirmed after clox is complete and the mark-and-sweep
experience is internalised. If profiling shows C#'s GC is insufficient for Grob's
workloads, a custom collector can be added without changing the language.
