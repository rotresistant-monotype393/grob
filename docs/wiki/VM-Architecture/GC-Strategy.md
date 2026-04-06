# GC Strategy

**Status:** Open question (OQ-006). Tentative direction: lean on C#'s GC.

## What Needs Collecting

**Value types** — `int`, `float`, `bool` — live on the stack as structs. No GC
needed. Gone when the frame pops.

**Heap types** — `string`, `array`, `function` — live on the heap. Need tracking.

## Tentative Strategy: Lean on C#

Since Grob's VM is written in C#, the .NET GC handles heap memory automatically.
The design work is in value representation — minimising heap allocations in the
hot path so GC pressure is low.

Use `struct` for value types (stack allocated, zero GC pressure). Use `class`
only for heap objects (string, array, function).

## Alternative: Custom Mark-and-Sweep

If profiling shows C#'s GC is insufficient, a custom mark-and-sweep is the
fallback. Two phases:

**Mark** — starting from all roots (stack, globals, frames), follow every
reference and mark each reachable object.

**Sweep** — walk every heap object. Unmarked = unreachable = free. Marked = clear
the mark for next cycle.

Triggered when heap grows past a threshold, then double the threshold.

## GC Pauses

Mark-and-sweep stops the program during collection. For scripting use cases
(file operations, automation) pauses are invisible. This limitation is documented
honestly. Concurrent GC is explicitly out of scope — not needed for the target
use case.

## Decision Point

This decision is deferred until clox is complete. The clox implementation
provides hands-on experience with mark-and-sweep in a bytecode VM context. The
C# lean-on-GC strategy is likely correct but will be confirmed after profiling.

See also: [Value Representation](Value-Representation.md), [Overview](Overview.md)
