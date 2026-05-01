# ADR-0009: Select Statement vs Switch Expression

**Status:** Accepted
**Date:** April 2026
**Decision:** Two distinct multi-branch forms: `select` (statement) and `switch` (expression).

## Context

Multi-branch control flow needs two modes: executing different blocks (statement)
and choosing between values (expression). Many languages overload one keyword for
both. The question was whether Grob should separate them.

## Decision

**`select`** is always a statement. Executes a block based on a matched value.
No fall-through.

```grob
select (code) {
    case 200 {
        print("OK")
    }
    default {
        print("Error")
    }
}
```

**Switch expression** is always an expression. Produces a value.

```grob
message := code switch {
    200 => "OK",
    404 => "Not found",
    _   => "Unknown"
}
```

The two forms are syntactically unambiguous. `select` uses `case` with blocks.
Switch expression uses `=>` with values.

## Alternatives Considered

**Single `switch` keyword for both** — C# approach. Requires context-dependent
parsing and can confuse new users about when a switch produces a value vs
executes a block.

**`match` expression** — Rust/Scala naming. The C# `switch` keyword was chosen
because Grob's target audience is C# developers. `match` was considered and the
deferred item was closed — switch expression with C# syntax is the match
expression.

## Consequences

Positive: no ambiguity between the two forms. The parser always knows which it
is seeing. Clear mental model for users.

Negative: two keywords for related concepts. Justified because the semantics
are genuinely different — statements execute, expressions produce values.
