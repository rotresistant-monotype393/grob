# ADR-0004: Constrained Generics

**Status:** Accepted
**Date:** April 2026
**Decision:** Users consume generic functions but cannot declare them in v1.

## Context

Type-safe collections and JSON deserialisation (`mapAs<T>()`) require the type
system to understand generic type parameters. Full user-facing generics is a
large feature surface. The question was how much to expose in v1.

## Decision

Constrained generics. The type checker and compiler understand generic type
parameters internally. Users consume generic functions via stdlib and plugins
(`mapAs<T>()`, `filter`, `map` etc) but cannot declare generic functions or
types in v1.

Evolution to user-facing generics is additive — a grammar extension only, no
architectural rework required. Analogous to Go pre-1.18.

## Alternatives Considered

**No generics** — would require `mapAsRepo()`, `mapAsTask()` etc as separate
functions per type. Untenable for a typed collections API.

**Full user-facing generics in v1** — significantly larger implementation scope.
Generic function and type declaration syntax, constraint syntax, type parameter
inference. Not proportional to v1 use cases.

## Consequences

Positive: type-safe collections and JSON without committing to full generic
syntax. Smaller v1 implementation. Clean additive path to full generics.

Negative: users cannot write their own generic functions in v1. This is
acceptable — the stdlib and plugin functions cover the primary use cases.

Plugins that expose generic functions must express type parameters via
`FunctionSignature` in `Grob.Runtime`. Designed in from the start.
