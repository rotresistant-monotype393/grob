# env — Environment Variables

Environment variable access. Core module — auto-available, no import required.

## Module Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `env.get(key: string)` | `→ string?` | Get value or nil if absent |
| `env.require(key: string)` | `→ string` | Get value or throw `RuntimeError` if absent |

`env.get()` returns `string?` — the caller is responsible for nil handling.
`env.require()` returns `string` — never nil, fails fast with a clear error if
the variable is absent. This distinction matters for script safety.

## Examples

### Credentials — the canonical pattern

```grob
pat := env.require("ADO_PAT")
```

If `ADO_PAT` is not set:

```
RuntimeError: Environment variable 'ADO_PAT' is required but not set.
```

### Optional with default

```grob
days := env.get("STALE_DAYS")?.toInt() ?? 30
```

### Checking for presence

```grob
debug_mode := env.get("DEBUG") != nil
```

## Security

`env.require()` is the canonical pattern for credentials in Grob scripts.
Never hardcode secrets in script source. The `env` module documentation is
explicit about this.

See also: [Script Parameters](../Language-Specification/Script-Parameters.md)
