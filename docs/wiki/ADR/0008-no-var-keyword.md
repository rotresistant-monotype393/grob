# ADR-0008: No Var Keyword

**Status:** Accepted
**Date:** February 2026
**Decision:** `:=` declares and assigns. There is no `var`, `let` or `local` keyword.

## Context

Most languages use a keyword for variable declaration: `var`, `let`, `local`,
`my`. Go uses `:=` for short variable declaration alongside `var` for typed
declarations. The question was which model best serves a scripting language.

## Decision

`:=` is the sole declaration mechanism. `=` is reassignment only. No keyword.

```grob
x := 42     // declare
x = 100     // reassign
```

This produces clear, actionable errors:
- `'x' already declared. Use = to reassign.`
- `'y' is not declared. Use := to declare.`

## Alternatives Considered

**`var` keyword** — adds ceremony without buying safety. In a language where
every variable must be initialised, the keyword is redundant noise.

**`let` keyword** — Rust/Swift convention. Attractive but in those languages
`let` also implies immutability. Grob uses `const` for immutability and mutable
by default — `let` would imply semantics it does not carry.

**Both `:=` and `var`** — Go offers both. In Go this makes sense because `var`
allows typed declarations without initialisation. Grob does not allow
uninitialised variables, so the second form has no purpose.

## Consequences

Positive: less ceremony, clear error messages, no ambiguity between declaration
and reassignment.

Negative: developers from Python or JavaScript may initially expect a keyword.
The `:=` syntax is immediately familiar to Go developers and learnable for
everyone else.
