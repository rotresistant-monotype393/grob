# T[] (Array) — Type Registry

All members known to the type checker at compile time. Calling an undefined
member is a compile error. Arrays are typed — all elements must be the same type.

## Properties

| Member | Signature | Notes |
|--------|-----------|-------|
| `length` | `→ int` | |
| `isEmpty` | `→ bool` | |

## Methods

| Member | Signature | Notes |
|--------|-----------|-------|
| `first()` | `→ T?` | nil if empty |
| `last()` | `→ T?` | nil if empty |
| `contains(v: T)` | `→ bool` | |
| `filter(fn: T → bool)` | `→ T[]` | |
| `map(fn: T → U)` | `→ U[]` | |
| `each(fn: T → void)` | `→ void` | |
| `sort(fn: T → U, descending: bool = false)` | `→ T[]` | Returns new sorted array |
| `select(fn: T → U)` | `→ U[]` | Projection — alias for map |

`select()` reads better in data pipelines (PowerShell `Select-Object`
equivalent). It is functionally identical to `map()`.

## Formatting

| Member | Description |
|--------|-------------|
| `T[].format.table()` | Auto-column table output |
| `T[].format.table(columns: string[])` | Explicit column selection |
| `T[].format.list()` | One item per line |
| `T[].format.csv()` | CSV to stdout |

See [format module](../Standard-Library/format.md).

## Indexing

```grob
items[0]            // first element
items[items.length - 1]  // last element
matrix[r][c]        // multi-dimensional via chained indexing
```

Zero-based. Out-of-range access throws `RuntimeError`.

## Examples

### Filter and sort

```grob
large_files := files
    .filter(f => f.size > 1024 * 1024)
    .sort(f => f.size, descending: true)
```

### Project fields

```grob
names := repos
    .select(r => #{ name: r.name, url: r.ssh_url })
    .format.table()
```

### Iterate with index

```grob
for i, item in items {
    print("${i}: ${item}")
}
```

### Check contents

```grob
extensions := [".jpg", ".jpeg", ".png"]
if (extensions.contains(file.extension)) {
    print("Image file: ${file.name}")
}
```
