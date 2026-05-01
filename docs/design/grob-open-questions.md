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

**Question:** Lean entirely on C#’s GC, or implement a custom mark-and-sweep?

**Tentative direction:** Lean on C#. Revisit only if profiling shows a problem.
**Defer until:** clox complete.

-----

## Resolved Questions

These questions have been decided. Full rationale is preserved here for reference.
One-line resolutions are recorded in the confirmed decisions table of
`grob-decisions-log.md`.

-----

### OQ-007 — `for...in` Loop and Iterable Protocol

**Status: RESOLVED — April 2026**

**Decision:** `for...in` is special-cased in v1. The compiler handles exactly
three cases:

1. **Numeric range** (`for i in 0..10 { }`) — already confirmed. Lowered to `while`.
2. **`T[]` array** (`for item in arr { }`, `for i, item in arr { }`) — index-based
   lowering to `while`. Both single and two-identifier forms supported.
3. **`map<K, V>`** (`for k, v in myMap { }`) — iterates insertion-order keys.
   Two-identifier form **required**. Single-identifier form on a map is a compile
   error with a suggestion to use `for k in myMap.keys` instead. Lowered to a
   `while` loop over an internal keys array.

Any other type in `for...in` subject position is a compile error.

**Formal iterable protocol:** Post-MVP. The compiler architecture accommodates it
without rework — the three special cases become the first implementors when the
protocol is defined.

**Rationale:** Every v1 use case in the sample scripts is array or range iteration.
A formal protocol adds `Grob.Runtime` surface, type checker conformance checking,
and plugin author complexity — none of which is justified in v1. `map<K, V>` is
special-cased because `for k, v in myMap` is immediately natural and the
alternative (`for k in myMap.keys { v := myMap[k] }`) is visibly clunky for a
type that is now first-class.

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
generics, the grammar simply doesn’t expose the declaration syntax yet. Analogous
to Go pre-1.18.

**Plugin constraint:** Plugins that expose generic functions must express type
parameters via `FunctionSignature` in `Grob.Runtime`. Designed in from the start.

-----

### OQ-002 — Struct / Record Types

**Status: RESOLVED — April 2026 (SharpBASIC retrospective)**

**Decision:** Grob needs user-defined struct/record types.

**Evidence:** The Sunken Crown required parallel arrays as a substitute for records.
The retrospective verdict: *“Messy, wasteful, and slow.”* The absence of a `type`
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
in `grob-stdlib-reference.md`.

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

### OQ-011 — `Grob.Crypto` API Shape

**Status: RESOLVED — April 2026**

**Decision:** First-party plugin (`import Grob.Crypto`). Full API:

- `crypto.sha256File(path: string): string` — lowercase hex, streams internally
- `crypto.md5File(path: string): string` — lowercase hex, streams internally
- `crypto.sha256(value: string): string` — lowercase hex, UTF-8 encoded
- `crypto.md5(value: string): string` — lowercase hex, UTF-8 encoded
- `crypto.verifySha256(path: string, expected: string): bool` — constant-time comparison
- `crypto.verifyMd5(path: string, expected: string): bool` — constant-time comparison

All hex output is lowercase. File functions stream internally — never load full file
into memory. Verify functions use constant-time comparison for security. SHA-1,
SHA-512, HMAC, byte array output — all post-MVP.

-----

### OQ-012 — `process.run()` Timeout Behaviour

**Status: RESOLVED — April 2026**

**Decision:** All four process functions get `timeout: int = 0` as a named parameter.
`0` means infinite — runs until the process completes or the OS kills it. On timeout
expiry, throws `ProcessError("Process timed out after {n} seconds: {cmd}")`.
`ProcessResult` is unchanged — no `timedOut` property. The throw is the signal.

Full signatures:

```
process.run(cmd: string, args: string[], timeout: int = 0): ProcessResult
process.runShell(cmd: string, timeout: int = 0): ProcessResult
process.runOrFail(cmd: string, args: string[], timeout: int = 0): ProcessResult
process.runShellOrFail(cmd: string, timeout: int = 0): ProcessResult
```

**Rationale:** Option 3 from the original question. No silent default kill avoids
surprising behaviour for long-running legitimate processes. `timeout: int` is
available when the caller needs it. `ProcessError` on timeout with a clear message.
`ProcessResult` does not need `timedOut` — the throw communicates the condition.

-----

### OQ-009 — `GrobValue` Provisional Representation

**Status: RESOLVED — April 2026 (D-297)**

**Decision:** `GrobValue` ships as a hand-rolled tagged-union `readonly struct` under
**.NET 10 LTS**. Three private fields: `GrobValueKind` discriminator, `long _scalar`
(holds `int`/`bool`/`float` non-allocating), `object? _reference` (holds reference
types). Total 24 bytes on x64. Nine kinds: `Nil`, `Bool`, `Int`, `Float`, `String`,
`Array`, `Map`, `Struct`, `Function`. `default(GrobValue)` is `Nil` by zero-init.
Public API: factory statics, `Kind`/`IsX` predicates, strict accessors (throw
`GrobInternalException` on kind mismatch), try-accessors, full equality and hashing.

**Rationale:** OQ-005 (tagged union vs NaN boxing) defers until clox is complete, but
`Grob.Core` cannot ship without a `GrobValue` definition. The provisional shape is
the most likely final answer regardless of OQ-005's resolution and confines any later
internal layout change to `Grob.Core/GrobValue.cs`. The .NET 11 preview `union`
keyword is **not** used — its compiler-generated form boxes every value-type case
(wrong cost profile for a stack-based VM) and depends on a feature still in preview
while .NET 10 is LTS. The shape chosen is deliberately compatible with the .NET 11
`[Union]` attribute escape hatch — adding it post-GA is a one-commit upgrade that
gains compile-time exhaustiveness checking on `switch` over `Kind` without storage
changes.

**Plugin types** (`date`, `guid`, `File`, `ProcessResult`, `json.Node`, etc.) and
user-defined `type`s all use the `Struct` kind. Discrimination between them is by
the runtime type of the boxed reference, not by `GrobValueKind` — keeping the
discriminator stable as plugins register new types.

**Equality semantics** (defensive at runtime, with the language compiler enforcing
type compatibility statically per D-169): value equality for `Nil`/`Bool`/`Int`/
`Float`/`String`; reference equality for `Array`/`Map`/`Function`; delegated to
`GrobStruct.Equals` (field-by-field) for `Struct`; cross-kind always false.

Full spec section in `grob-vm-architecture.md` titled "GrobValue provisional
representation". Test strategy in `Grob.Core.Tests/GrobValueTests.cs` covers
construction round-trip, discrimination, default-is-Nil, kind-mismatch behaviour,
equality (including IEEE 754 float edge cases), hashing, struct delegation and a
`sizeof(GrobValue) == 24` canary.

-----

### OQ-010 — `.grobc` Binary Format Specification

**Status: RESOLVED — April 2026 (D-298)**

**Decision:** Skeleton specification locked in `grob-grobc-format.md`. Header is
**40 bytes fixed**, magic bytes `0x47 0x52 0x4F 0x42` ("GROB") at offset 0, format
version `uint16` at offset 4 starting at `1` (per ADR-0008), flags `uint16` at offset
6 (bit 0 = source map present, bit 1 = symbol table present), six (offset, size)
`uint32` pairs for constant pool, instruction stream, function table, source map
sections. **Little-endian throughout**, no per-section toggle. **Constant pool**
entries each prefixed with a `uint8` kind tag — seven kinds: `Nil` (0x00),
`Bool` (0x01), `Int` (0x02, `int64`), `Float` (0x03, `double` IEEE 754), `String`
(0x04, `uint32` length + UTF-8), `Guid` (0x05, 16 bytes RFC 9562 byte order),
`Function` (0x06, `uint32` function table index). **Function table** holds each
function as a sub-chunk with name index, parameter count and (offset, size) pairs
for its constant pool and instruction stream. **Source map** (optional, flag bit 0):
file table reserved for multi-file post-MVP, PC entries with `(pc, line, column,
file index, function index)`. **Symbol table** (optional, flag bit 1): function
index, name, parameter names — minimum content for stack traces. **Versioning**:
`uint16` starts at `1`; mismatch produces a clear diagnostic naming both versions
and suggesting `grob run` to recompile, never silent. **`grob run` integration**:
`.grob` is canonical, `.grobc` is cache, lives in `.grob/cache/<stem>.grobc` next to
the source, mtime-driven invalidation, best-effort writes (read-only file system
never aborts the script), `grob run --no-cache` disables caching for that
invocation. **Explicit non-features for v1** (deliberate omissions, not gaps):
cryptographic signing, compression, encryption, multi-chunk packaging, embedded
resources, JIT-friendly metadata.

**Rationale:** Versioning from day one is essential — retrofitting it later is
expensive (ADR-0008). The format is section-based with explicit (offset, size)
pairs in the header so future versions can append fields without breaking older
readers up to the offset they understand. Constant pool kinds are deliberately
restricted to scalar primitives plus `Guid` and `Function`-by-reference — literal
arrays, maps and structs are constructed at runtime from primitive constants via
opcodes, keeping the wire format closed for v1. The `.grob/cache/` side directory
matches the convention used by Python's `__pycache__` and similar tools — generated
artefacts stay separate from source, are trivial to `.gitignore` and never clutter
the working directory.

Per-opcode operand encoding remains incremental, governed by ADR-0008 — opcodes
land sprint-by-sprint and the operand layout is documented at the opcode's source
of definition. The skeleton spec covers the framing; the per-opcode detail follows.

Full byte-level layout, implementation notes and rationale in
`grob-grobc-format.md`.

-----

*Resolved questions are summarised as one-line entries in the confirmed decisions*
*table of `grob-decisions-log.md`. The full rationale is preserved here.*

-----

*Document updated April 2026 — OQ-009 resolved (`GrobValue` provisional representation,*
*hand-rolled tagged-union struct under .NET 10 LTS, see D-297);*
*OQ-010 resolved (`.grobc` binary format skeleton spec, see D-298 and `grob-grobc-format.md`).*
*Previous: OQ-011 resolved (`Grob.Crypto` API shape);*
*OQ-012 resolved (`process.run()` timeout behaviour);*
*OQ-007 resolved (`for...in` iterable types).*
*OQ-005 (full value representation — tagged union vs NaN boxing) and*
*OQ-006 (GC strategy) remain open, both deferred until clox is complete.*
*Document created April 2026 — extracted from grob-decisions-log.md.*
*Authorised decisions recorded in grob-decisions-log.md.*
*This document is the implementation reference — the decisions log is the authority.*