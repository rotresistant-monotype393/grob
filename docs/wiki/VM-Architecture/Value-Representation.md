# Value Representation

**Decision:** Tagged union struct on .NET 10 LTS. See D-297.
OQ-005 is open (tagged union vs NaN boxing) — final decision deferred until clox
is complete. The `GrobValue` shape is encapsulated behind a clean boundary so
that a retrofit, if required, is localised.

## GrobValue (Provisional Shape — D-297)

```csharp
/// <summary>
/// Hand-rolled discriminated union — 24 bytes on x64.
/// Nine discriminator variants. Do not access fields directly;
/// use the factory surface and property accessors.
/// </summary>
public readonly struct GrobValue
{
    public GrobDiscriminator Kind { get; }

    // Value-type payload — int, float, bool stored inline
    private readonly long   _raw;

    // Heap-type payload — string, array, function, struct, nil
    // Only non-null when Kind requires a heap reference
    private readonly object? _ref;

    // Factory surface — the only correct way to construct a GrobValue
    public static GrobValue FromInt(long value)      { ... }
    public static GrobValue FromFloat(double value)  { ... }
    public static GrobValue FromBool(bool value)     { ... }
    public static GrobValue FromString(string value) { ... }
    public static GrobValue Nil                      { get; }
    // ... etc.
}

public enum GrobDiscriminator
{
    Nil     = 0,
    Int     = 1,
    Float   = 2,
    Bool    = 3,
    String  = 4,
    Array   = 5,
    Map     = 6,
    Struct  = 7,  // user-defined structs and plugin types share this discriminator
    Function = 8,
}
```

Key properties:

- 24 bytes on x64 — `Kind` (4 bytes) + `_raw` (8 bytes) + `_ref` (8 bytes) + padding
- `int`, `float`, `bool` stored inline in `_raw` — zero GC pressure for value types
- `string`, `array`, `function`, `struct` use `_ref` — heap via the C# GC
- Plugin types share the `Struct` discriminator, distinguished via the type registry
- Encapsulated factory surface — callers never construct `GrobValue` directly

## Why .NET 10 LTS — Not `union`

Do not use the .NET discriminated union (`union`) keyword if it becomes available.
That keyword's compiler-generated form boxes value-type cases on every assignment,
producing the wrong cost profile for a VM hot path. The hand-rolled struct is the
correct implementation.

## NaN Boxing (Alternative — OQ-005)

NaN boxing packs type information into unused bits of a 64-bit float. Covered in
*Crafting Interpreters* chapter 30. The C# idiom argues against it — C#'s struct
layout and the GC boundary between `_raw` and `_ref` make the tagged union natural.

The `GrobValue` encapsulation contract means this decision is localised. If OQ-005
resolves to NaN boxing, only `GrobValue` changes.

## Design Principles

**Minimise heap allocations in the hot path.** `int`, `float`, `bool` live on the
stack as inline values — zero GC pressure. Heap types (`string`, `array`, `function`,
`struct`) use the `_ref` field and are managed by the C# GC.

**Primitives are never boxed.** Method-call syntax on primitives is compiler
sugar — rewritten to native function calls at compile time with zero runtime
overhead. `42.toString()` does not create a boxed `int`.

See also: [GC Strategy](GC-Strategy.md), [Overview](Overview.md)

*Updated April 2026 — GrobValue provisional shape per D-297; .NET 10 LTS target
confirmed; NaN boxing documented as alternative under OQ-005.*
