# Value Representation

**Status:** Open question (OQ-005). Tentative direction: tagged union. Final
decision deferred until clox is complete.

## Tagged Union (Tentative)

```csharp
struct Value
{
    public ValueKind Kind;
    public long Raw;        // int/float/bool stored directly
    public object? Ref;     // string/array/function — only when needed
}
```

Value types (`int`, `float`, `bool`) live on the stack as structs — zero GC
pressure. Heap types (`string`, `array`, `function`) use the `Ref` field.

## Alternative: NaN Boxing

NaN boxing packs type information into unused bits of a 64-bit float. Worth
understanding (clox covers it in chapter 30) but the C# idiom argues against it
— C#'s type system and struct layout make tagged unions natural.

## Design Principles

**Minimise heap allocations in the hot path.** Use `struct` for value types,
`class` for heap objects only. C#'s GC handles the rest.

**Primitives are never boxed.** Method-call syntax on primitives is compiler
sugar — rewritten to native function calls at compile time with zero runtime
overhead.

See also: [GC Strategy](GC-Strategy.md), [Overview](Overview.md)
