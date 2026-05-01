# Grob — `.grobc` Bytecode File Format

> Skeleton specification for the compiled bytecode file format.
> This document is the build reference for `Grob.Core` and `Grob.Compiler`
> implementors writing the serialiser and deserialiser.
> Decisions authorised in the decisions log — April 2026.
> When this document and the decisions log conflict, the decisions log wins.

-----

## Status

This is the **skeleton** specification — what every implementor needs
before writing the first line of serialisation code, but stopping short
of full instruction-level operand encodings (which land incrementally as
opcodes are added in Sprints 1 onward, governed by ADR-0008).

Locked here:

- Magic bytes, version header, fixed header layout
- Endianness
- Constant pool wire format per kind
- Source map and symbol table shapes
- Versioning policy and version-mismatch behaviour
- `grob run` cache integration
- Explicit non-features for v1

Deferred (lands as opcodes do):

- Per-opcode operand encoding (covered by each opcode's introduction PR
  and the version bump policy in ADR-0008)
- Compression, signing, encryption — explicit non-features for v1, see
  the dedicated section below

-----

## File Anatomy

```
+--------------------------------------+
|  Header (40 bytes, fixed)            |
+--------------------------------------+
|  Constant pool                       |
+--------------------------------------+
|  Instruction stream (main chunk)     |
+--------------------------------------+
|  Function table                      |
|    [count] [function 1] [function 2]…|
+--------------------------------------+
|  Source map (optional, per flag)     |
+--------------------------------------+
|  Symbol table (optional, per flag)   |
+--------------------------------------+
```

Every section (constant pool, instruction stream, source map, symbol
table) is located by an explicit (offset, size) pair in the header. A
loader can read sections in any order and a future header version can
append new (offset, size) pairs after the current ones without breaking
older readers — they read up to the offset they understand and trust
that offset to point past anything they don't.

The function table is reachable from the constant pool's `Function`
entries — see "Constant pool wire format" below.

-----

## Endianness

**Little-endian throughout.** No per-section toggle, no big-endian
fallback. Grob targets x86 / x64 Windows; the format matches the host
byte order on the only platforms v1 supports. ARM64 Windows hosts are
also little-endian, so the format remains the host byte order if Grob
ships there post-MVP.

All multi-byte integer fields (`uint16`, `uint32`, `int64`) and IEEE 754
`double` values are encoded little-endian.

-----

## Header

The header is **40 bytes**, fixed size in v1.

|Offset|Size  |Field                       |Notes                                                       |
|------|------|----------------------------|------------------------------------------------------------|
|0     |4     |Magic bytes                 |`0x47 0x52 0x4F 0x42` — ASCII `"GROB"` (D-020)              |
|4     |2     |Format version (`uint16`)   |Starts at `1`. Bumped on any breaking format change.        |
|6     |2     |Flags (`uint16`)            |Bit 0: source map present. Bit 1: symbol table present. Bits 2–15 reserved, must be `0`.|
|8     |4     |Constant pool offset (`uint32`)|Bytes from start of file.                                |
|12    |4     |Constant pool size (`uint32`)  |Bytes.                                                   |
|16    |4     |Instruction stream offset      |Bytes from start of file.                                |
|20    |4     |Instruction stream size        |Bytes. Counts the main chunk only — the function table is separate.|
|24    |4     |Function table offset          |`0` if no functions defined.                             |
|28    |4     |Function table size            |`0` if no functions defined.                             |
|32    |4     |Source map offset              |`0` if absent (flag bit 0 not set).                      |
|36    |4     |Source map size                |`0` if absent.                                           |
|40    |—     |*end of header in v1*       |Future versions may extend by appending fields.             |

The symbol table (when present) is located by extension fields in a
future header version, or — for v1 simplicity — placed after the
source map and discoverable by the loader walking sections in order.
The flag bit indicates presence; the absence of an explicit (offset, size)
pair in v1's header is acceptable because the symbol table is the last
section and its size is recoverable from the file length and the other
section ranges. A version bump can add explicit symbol table fields if
the format grows additional trailing sections.

**Version mismatch.** When a loader reads a `.grobc` whose format version
exceeds the runtime's known maximum, the runtime emits a clear
diagnostic naming both versions and suggests `grob run` to recompile:

```
Cached bytecode (.grobc) is version 3; this Grob runtime supports up to
version 2. Run 'grob run <script>' to recompile from source, or upgrade
Grob.
```

The diagnostic is never silent. The cache is discarded, never partially
loaded.

-----

## Constant Pool

Layout:

```
[entry count: uint32]
[entry 1] [entry 2] … [entry N]
```

Each entry is `<kind: uint8> <payload>`. Payload depends on the kind.

|Kind value|Name      |Payload                                                       |
|----------|----------|--------------------------------------------------------------|
|`0x00`    |Nil       |*(none)*                                                      |
|`0x01`    |Bool      |`uint8` — `0` = false, `1` = true. Other values are invalid.  |
|`0x02`    |Int       |`int64` (little-endian)                                       |
|`0x03`    |Float     |`double` IEEE 754 (little-endian, bit-exact via `BitConverter.DoubleToInt64Bits`)|
|`0x04`    |String    |`uint32` byte length + UTF-8 bytes (no terminator, no BOM)    |
|`0x05`    |Guid      |16 bytes — RFC 9562 byte order (network order, *not* mixed-endian Variant 1)|
|`0x06`    |Function  |`uint32` — index into the function table                      |

The kind values are stable. Adding a new kind requires bumping the
format version per ADR-0008.

**`Nil`, `Bool`, `Int`, `Float`, `String`** — direct correspondence to the
matching `GrobValueKind` variants. See `grob-vm-architecture.md` for the
in-memory `GrobValue` representation.

**`Guid`** — `guid` literals validated at compile time (D-149) live in the
constant pool. RFC 9562 byte order is the canonical wire format and
matches `System.Guid.ToByteArray(bigEndian: true)` in modern .NET. The
order is the order of the GUID's textual representation read left to
right, byte by byte. The mixed-endian Variant 1 layout that
`System.Guid.ToByteArray()` produces with no argument is **not** used.

**`Function`** — function constants reference the function table by index.
The function table holds the body bytecode for each defined function;
the constant pool entry is just the index. This separation lets the
constant pool stay flat — no nested chunks inside it.

**No literal arrays, maps or struct instances in the constant pool.**
These are constructed at runtime from constant-pool primitives via
opcodes. `[1, 2, 3]` compiles to three `CONSTANT` loads followed by an
`ARRAY_NEW 3` opcode, not to a single `Array` constant. This keeps the
constant pool wire format closed for v1 and avoids the recursive
encoding question for nested literal data.

`date` literals do not exist in Grob (no `date` literal syntax), so no
`date` constant kind is needed.

**Instruction stream.** Just bytes. Length is given by the
"Instruction stream size" header field. The opcode encoding is governed
by ADR-0008 — append-only `OpCode` enum, explicit integer values
required, ordinal pinning test in `Grob.Core.Tests`. Per-opcode operand
sizes are introduced as opcodes land and are documented in the source
where each opcode is defined; the wire format lays them out as
the compiler emits them.

-----

## Function Table

Each function — top-level `fn` declarations and lambdas — lives in the
function table as a sub-chunk with its own constant pool and instruction
stream.

```
[function count: uint32]
[function 1]
[function 2]
…
```

Each function entry:

```
[name index: uint32]            -- index into the symbol table; 0xFFFFFFFF if anonymous (lambda)
[parameter count: uint8]
[constant pool offset: uint32]  -- bytes from start of file
[constant pool size: uint32]
[instruction stream offset: uint32]
[instruction stream size: uint32]
```

Function constant pools and instruction streams are **separate** byte
ranges in the file; the function entry holds pointers to them. The byte
ranges may be packed contiguously after the main constant pool /
instruction stream, or interleaved — the offsets are authoritative.

The simplest implementation lays the file out in this order:

1. Header
2. Main chunk constant pool (referenced by `Function` entries via
   indices into the function table)
3. Main chunk instruction stream
4. Function table entries
5. Per-function constant pools and instruction streams (in function
   order)
6. Optional source map
7. Optional symbol table

This order satisfies a single forward-only writer and is cache-friendly
on read.

-----

## Source Map (Optional)

Present when header flag bit 0 is set. Provides PC-to-(line, column)
mapping for stack traces and debugging.

```
[file count: uint32]            -- 0 or 1 in v1; reserved for multi-file post-MVP
[file entries]:
  [length: uint32] [UTF-8 bytes]   -- file path, no terminator

[entry count: uint32]
[entries]:
  [pc: uint32]      -- byte offset into the main instruction stream
  [line: uint32]    -- 1-based
  [column: uint32]  -- 1-based, in characters (UTF-16 code units, matching the lexer)
  [file index: uint16]  -- index into file entries; 0 in v1
  [function index: uint16]  -- 0xFFFF for the main chunk; otherwise function table index
```

Entries are sorted ascending by `(function index, pc)`. A loader can
binary-search for any given PC.

**v1 simplifications:**

- Single source file per `.grobc` — `file count` is `0` or `1`. The
  format reserves the multi-file shape so post-MVP imports of `.grob`
  scripts (currently disallowed by D-174) can extend additively.
- No delta encoding or run-length compression. Every PC that changes
  line gets its own entry. Implementations may add delta encoding via
  a future format version once the size becomes a concern.
- `column` is an aspirational field. Sprint-1 source maps may emit
  `0` for column and refine it later — the format does not require
  non-zero columns.

**Stripped builds** omit the source map entirely (flag bit 0 unset,
offset and size both `0`). Stack traces in stripped builds show only
function names from the symbol table.

-----

## Symbol Table (Optional)

Present when header flag bit 1 is set. Holds function names and
parameter names — the minimum content needed for non-trivial stack
traces.

```
[entry count: uint32]
[entries]:
  [function index: uint32]      -- index into the function table; 0xFFFFFFFF for the main chunk
  [name length: uint32]
  [name UTF-8 bytes]
  [parameter count: uint8]
  [parameters]:
    [length: uint32] [UTF-8 bytes]
```

Entries are sorted ascending by `function index`. The main chunk's
entry, if present, carries the script's file stem as its name (e.g.
`"organise-photos"` for `organise-photos.grob`). Anonymous lambdas
appear with an empty name (length `0`).

**v1 simplifications:**

- No local variable names, no per-PC scope information. Those would
  power a richer debugger experience and are deferred. The symbol
  table grows additively when they land — a flag bit and trailing
  fields, not a restructure.
- No type information. A future debugger needs it; v1 stack traces do
  not.

**Stripped builds** omit the symbol table. Stack traces in stripped
builds fall back to function indices (`fn#3` rather than `processFile`)
— acceptable for production deployments where source secrecy or file
size dominates over diagnostic richness.

-----

## Versioning Policy

The format version is a `uint16` in the header at bytes 4–5. It starts
at `1` and is incremented on any breaking format change. ADR-0008 is
the authority on what counts as breaking; in summary:

- New opcode at the **end** of the `OpCode` enum: not a format break.
- Reordered or removed opcode: format break.
- New constant pool kind: format break.
- New header field, new section: format break.
- Source map or symbol table extension: format break only if older
  readers cannot ignore the extension safely.

The runtime's *maximum supported version* is a constant in
`Grob.Core`. A `.grobc` whose version exceeds the runtime's maximum is
rejected with the diagnostic shown in the Header section above — never
silently misread.

A `.grobc` whose version is *less* than the runtime's maximum is
accepted: older format versions remain readable. Per ADR-0008, the
runtime maintains a deserialiser branch per supported old version. v1
ships with version `1` only — the branch tree starts empty.

-----

## `grob run` Integration

Source is canonical; `.grobc` is cache.

**Cache location.** `.grobc` files are written to a `.grob/cache/` side
directory next to the source file. For a script at `C:\scripts\report.grob`,
the cache file is `C:\scripts\.grob\cache\report.grobc`. The side
directory matches the convention used by Python's `__pycache__` and
similar tools — generated artefacts stay separate from source, are
trivial to `.gitignore` and never clutter the working directory the
user is editing.

**Cache invalidation.** `grob run script.grob` checks the cache:

1. If `.grob/cache/<stem>.grobc` does not exist → compile from source,
   write the cache, run.
2. If the cache file exists and its mtime is **older** than the source
   file's mtime → discard cache, recompile, overwrite, run.
3. If the cache file exists and its format version is **higher** than
   the runtime supports → discard cache, recompile, overwrite, run
   (with the diagnostic from the Header section).
4. Otherwise → load the cache and run.

**Cache writes are best-effort.** If the side directory cannot be
created (read-only file system, permission denied, network share
restriction), `grob run` proceeds without writing the cache. The user's
script still runs; the next invocation recompiles from source again.
Cache write failure is never a script failure.

**Cache reads on corruption** — magic-bytes mismatch, header parse
failure, truncated section — are treated identically to "cache absent":
discard, recompile, overwrite, run. A corrupt cache never aborts the
script.

**`grob run --no-cache`** disables both reading and writing the cache
for that invocation. Useful when debugging compiler output. CI systems
that run from a clean checkout each time may prefer this flag to avoid
spending I/O on a cache no subsequent run will read.

-----

## Explicit Non-Features for v1

Documented here so a later session does not re-open them as gaps. Each
is a deliberate omission, not an oversight.

|Feature                       |Why omitted from v1                                                    |
|------------------------------|----------------------------------------------------------------------|
|Cryptographic signing         |Grob plugins are arbitrary code anyway (D-073); signing `.grobc` files would imply a tamper-resistance guarantee that the broader system does not provide. Reconsider if a signed-distribution use case emerges.|
|Compression (gzip, zstd, etc.)|`.grobc` files are small (single-digit kilobytes for typical scripts); compression adds complexity without solving an observed problem. The format reserves no flag for it — adding compression would be a format-version bump.|
|Encryption                    |Same reasoning as signing. Source confidentiality, if needed, is a deployment concern (encrypted file system, secure delivery channel) not a file-format concern.|
|Multi-chunk packaging         |One `.grob` source file produces one `.grobc` cache file. Bundling multiple scripts into a single cache file is unnecessary for v1's single-script use case (D-174 disallows script imports anyway).|
|Embedded resources            |No bundled images, data files or other binary blobs in `.grobc`. Scripts that need data files reference them via `fs.readText` at runtime.|
|`.grobc` as a distribution format|Plugins are NuGet packages, not `.grobc` files; scripts are distributed as `.grob` source. `.grobc` is purely a runtime cache.|
|JIT-friendly precomputed metadata|No inline caches, no PIC stubs, no superinstructions. The bytecode VM is the execution model; JIT is explicitly out of scope for v1 (`grob-vm-architecture.md`).|

If a future need surfaces for any of these, they enter via a format
version bump and the migration policy in ADR-0008.

-----

## Implementation Notes

For implementors of `Grob.Core/BytecodeWriter.cs` and
`Grob.Core/BytecodeReader.cs`:

- All multi-byte writes use `BinaryWriter.Write(...)` with the system
  default little-endian convention on x86/x64. Verify with a unit
  test on a known fixture; do not assume.
- UTF-8 string writes use `Encoding.UTF8.GetBytes(s)` — no BOM, no
  null terminator.
- The header is written last (or with a placeholder, then patched)
  because section offsets are not known until the sections are written.
  Two passes: write sections to a `MemoryStream`, capture offsets,
  then write the header to the output stream followed by the section
  bytes.
- Round-trip tests in `Grob.Core.Tests`: serialise a fixture chunk,
  deserialise, assert equality. Cover every constant pool kind and
  both flag combinations (source map present/absent × symbol table
  present/absent).
- Endianness canary: a fixture file with a known 16-bit value at a
  known offset, asserting the bytes on disk are little-endian. Catches
  any future port to a big-endian platform without silent corruption.

-----

*Document created April 2026 — OQ-010 resolved (`.grobc` binary format*
*skeleton spec). Header layout, constant pool wire format, function table,*
*source map, symbol table, versioning policy, `grob run` cache integration,*
*and explicit non-features for v1 specified.*
*Authoritative for the bytecode file format — superseding the inline*
*sketch in `grob-vm-architecture.md` (which now points here).*
*Authorised decisions recorded in grob-decisions-log.md.*
*This document is the implementation reference — the decisions log is the authority.*
