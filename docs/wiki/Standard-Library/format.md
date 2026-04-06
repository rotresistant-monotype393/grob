# format — Output Formatting

Human-readable output formatters. Core module — auto-available, no import
required. Distinct from `json.stdout()` which is machine-readable.

## Chained Form

The canonical calling convention is chained from a collection:

```grob
results.format.table()
results.format.list()
results.format.csv()
```

The compiler treats `.format` as a known namespace prefix — not a runtime
property. At the call site the compiler rewrites to an internal call equivalent
to `format.table(results)`. No runtime object is created, no boxing.

## Functions

| Function | Description |
|----------|-------------|
| `T[].format.table()` | Auto-column table from struct fields |
| `T[].format.table(columns: string[])` | Explicit column selection |
| `T[].format.list()` | One item per line, key: value |
| `T[].format.csv()` | CSV to stdout |

`format.table()` derives column names from the type's field registry at compile
time. Works on named structs and anonymous structs.

## Examples

### Table output

```grob
type FileEntry {
    name:    string
    folder:  string
    size_mb: float
}

entries := fs.list("C:\\Reports", recursive: true)
    .filter(f => f.size > threshold)
    .map(f => FileEntry {
        name:    f.name,
        folder:  f.directory,
        size_mb: (f.size / 1024.0 / 1024.0).round(2)
    })
    .sort(f => f.size_mb, descending: true)

entries.format.table()
```

Output:

```
name              folder              size_mb
────────────────  ──────────────────  ───────
database.bak      C:\Reports\backup   1024.50
archive.zip       C:\Reports          512.30
```

### Filter, project, format

```grob
results
    .filter(r => r.stale_count > 0)
    .select(r => #{ repo: r.repo, stale: r.stale_count, as_of: r.as_of })
    .format.table()
```

### List output

```grob
config.format.list()
```

```
host:    localhost
port:    8080
timeout: 30
```

## Scalar Formatting

Numeric formatting (`float.format.number()`) and date formatting (`d.format()`)
are handled by the respective types, not by this module. See
[float type registry](../Type-Registry/float.md) and
[date module](date.md).
