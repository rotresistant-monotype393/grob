# ADR-0013: Opcode Stability and Bytecode Format Versioning

**Status:** Accepted
**Date:** April 2026

**Decision:** Opcodes are stable once allocated. The `.grobc` binary format is
versioned. Opcode numbers never change after their first release.

## Context

A bytecode VM needs a clear policy on what happens when the instruction set
evolves. If opcodes can be renumbered, cached `.grobc` files become silently
invalid. If opcodes are stable, old cache files remain valid across runtime
upgrades.

## Decision

**Opcodes are immutable once allocated.** An opcode number is its identity.
Deprecated opcodes are marked as such but their numbers are never reused.

**The `.grobc` format carries a version field.** The magic bytes are
`0x47 0x52 0x4F 0x42` ("GROB"). Format version is stored in the header.
The VM rejects files with an incompatible format version with a clear error.

**`OpCode` is an enum in `Grob.Core`.** The complete instruction set is defined
at the start of the project — not grown additively as new features are added.
Gaps in the enum (for reserved or deprecated opcodes) are acceptable.

See `grob-grobc-format.md` for the binary format specification.

## Alternatives Considered

**Versioned opcode tables** — opcodes could vary by format version. Adds
complexity with no benefit for this project's scale. Rejected.

**No caching** — recompile on every run. Acceptable for small scripts but
eliminates a meaningful performance optimisation for larger ones. Rejected.

## Consequences

Positive: cached `.grobc` files are trustworthy. Upgrading the runtime does not
silently produce wrong results from stale cache. Error messages on version
mismatch are actionable.

Negative: the opcode enum must be designed completely before Sprint 1. Additive
growth is not acceptable — gaps are, retired opcodes are, but renumbering is not.
