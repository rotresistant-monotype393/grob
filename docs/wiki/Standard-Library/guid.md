# guid — GUID Generation

GUID generation, parsing and formatting. Core module — auto-available, no import
required. Registers the `guid` built-in type.

## Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `guid.v4()` | `→ guid` | Random UUID (version 4) |
| `guid.v5(namespace: guid, name: string)` | `→ guid` | Deterministic name-based UUID (version 5, SHA-1) |
| `guid.v7()` | `→ guid` | Time-ordered UUID (version 7) |
| `guid.parse(s: string)` | `→ guid?` | Parse from string; returns nil if invalid |
| `guid.empty()` | `→ guid` | Returns the nil GUID (all zeros) |

## guid Type Methods

| Member | Signature | Description |
|--------|-----------|-------------|
| `toString()` | `→ string` | Lowercase hyphenated format (`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`) |
| `toStringUpper()` | `→ string` | Uppercase hyphenated format |
| `toStringN()` | `→ string` | 32 hex digits, no hyphens |
| `isEmpty` | `→ bool` | True if all zeros |

## Examples

```grob
id := guid.v4()
print(id.toString())
// e.g. 3f2504e0-4f89-11d3-9a0c-0305e82c3301

// Deterministic ID from a name
ns := guid.parse("6ba7b810-9dad-11d1-80b4-00c04fd430c8")!
user_id := guid.v5(ns, "chris@example.com")

// Time-ordered (sortable) ID — useful for database keys
record_id := guid.v7()

// Parsing
parsed := guid.parse("not-a-guid")
if parsed == nil {
    print("Invalid GUID")
}
```

## Notes

- `guid.v4()` uses a cryptographically secure random number generator.
- `guid.v7()` produces lexicographically sortable GUIDs — preferred for
  database primary keys.
- For deterministic IDs derived from content, use `guid.v5()` with a
  well-known namespace GUID.
