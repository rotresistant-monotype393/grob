# ADR-0001: Static Typing with Inference

**Status:** Accepted
**Date:** February 2026
**Decision:** Grob is statically typed with type inference from initialisers.

## Context

Scripting languages are overwhelmingly dynamically typed (Python, bash,
PowerShell, JavaScript). Static typing catches errors earlier but adds ceremony.
The question was whether Grob could be statically typed without feeling heavy.

## Decision

Grob uses static typing with inference. `:=` infers the type from the
right-hand side. Explicit annotations are available but only required where
inference cannot resolve (nil initialisations, empty arrays).

```grob
x := 42              // int — inferred
name: string? := nil // annotation required
```

Types are resolved at compile time and never checked at runtime. The type
checker annotates every expression; the compiler reads those annotations.

## Alternatives Considered

**Dynamic typing** — lower ceremony but errors appear at runtime. The entire
design target of Grob is to fill the gap where dynamic typing is the weakness.

**Mandatory annotations** — maximum clarity but too verbose for scripting.
Go requires explicit types on declarations; Kotlin and Swift use inference.
Inference is the right model for a scripting language.

## Consequences

Positive: compile-time error detection, better tooling support, method-call
sugar resolved at compile time with no boxing overhead.

Negative: the type checker is a significant implementation investment. Type
inference adds complexity to the compiler. These costs are justified by the
language's identity.
