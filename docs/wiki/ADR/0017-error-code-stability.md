# ADR-0017: Error Code Stability

**Status:** Accepted
**Date:** April 2026

**Decision:** Error codes are immutable once shipped. A code number is its
identity and is never reused.

## Context

Error codes appear in documentation, `--explain` output, editor integrations,
and user scripts. If codes change meaning between releases, all of those
downstream consumers break silently.

## Decision

**Error codes are immutable once shipped.** An error code assigned in one
release means the same thing in all subsequent releases.

**Retired codes are never reused.** If an error condition is removed or merged,
its code is marked as retired in the registry but the number is never reassigned.

**Codes are not renumbered.** If the category scheme changes, existing codes
retain their original numbers. New codes are allocated in the correct category.

## Alternatives Considered

**Semantic versioning for error codes** — major version bump allows renumbering.
Breaks all external references that survive the version boundary. Rejected.

**Codes can be reused after a deprecation period** — still breaks references.
Rejected.

## Consequences

Positive: scripts, documentation, editor integrations, and CI pipelines that
reference error codes are stable across upgrades. The `--explain Exxxx`
documentation is permanently valid.

Negative: the registry accumulates retired codes over time. Mitigated by clear
documentation of retired status in the registry.
