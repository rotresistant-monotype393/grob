# ADR-0014: Error Code Numbering Scheme

**Status:** Accepted
**Date:** April 2026

**Decision:** Seven-category error code registry with `Exxxx` format.
`Wxxxx` namespace reserved for future warnings. 86 codes across seven categories.

## Context

Grob produces structured error messages. The question was how to number and
categorise error codes for stable external reference (documentation, `--explain`,
tooling).

## Decision

**Error codes use `Exxxx` format** — a capital E followed by a four-digit number.

**Seven categories by thousands digit:**

| Range     | Category              |
|-----------|-----------------------|
| E0xxx     | Type errors           |
| E1xxx     | Name resolution       |
| E2xxx     | Syntax                |
| E3xxx     | Module / import       |
| E4xxx     | Param / decorator     |
| E5xxx     | Runtime               |
| E9xxx     | Reserved / internal   |

**`Wxxxx` namespace reserved** for future warning codes.

See `grob-error-codes.md` for the full registry.

## Alternatives Considered

**Flat sequential numbering** — no category grouping. Loses the signal that
error codes in the same range are related in kind. Rejected.

**String-based codes** (`TYPE_MISMATCH`, `NAME_NOT_FOUND`)** — verbose, no
natural sort order, harder to document. Rejected.

## Consequences

Positive: error codes are structured enough to be useful at a glance. The
thousands digit tells you whether you have a type error, a syntax error, or a
runtime error before reading the message.

Negative: gaps will appear in each category range as codes are retired. Retired
codes are never reused (see ADR-0017).
