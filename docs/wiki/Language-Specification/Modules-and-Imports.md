# Modules and Imports

## Core Modules

Twelve modules are auto-available in every script. No `import` required.

| Module | Purpose |
|--------|---------|
| `fs` | File system — list, read, write, rename, copy, move, delete |
| `strings` | String module function (`join`) |
| `json` | JSON parse and serialise |
| `csv` | CSV parse and serialise |
| `env` | Environment variables |
| `process` | External command execution |
| `date` | Date and time |
| `math` | Mathematics |
| `log` | Structured logging to stderr |
| `regex` | Regular expressions |
| `path` | Path string manipulation |
| `format` | Output formatting |

If a reasonable developer expects it in any scripting language, it is core.

A script with no `import` statements is self-contained. A script with `import`
statements has external dependencies. The `import` lines double as a dependency
manifest — this signal value is why core modules do not require import.

## Plugin Imports

Plugins require explicit `import` and a prior `grob install`.

```grob
import Grob.Http
```

The default alias is the last segment of the module name, lowercased:

| Import | Alias |
|--------|-------|
| `import Grob.Http` | `http.*` (also exposes `auth.*`) |
| `import AcmeCorp.Xml` | `xml.*` |
| `import Grob.Crypto` | `crypto.*` |

This is convention, not configuration. Always predictable.

`Grob.Http` is a special case: it exposes both `http.*` and `auth.*` as
sub-namespaces from a single import. This is the only case where one `import`
produces two namespace prefixes.

## Explicit Aliases

Use `as` only for collision resolution:

```grob
import AcmeCorp.Strings as acme     // 'strings' is a core module
import OldCo.Http as legacy_http    // 'http' already taken
```

`as` exists for collision resolution, not for personal preference.

## Package Resolution

When a script contains `import Grob.Http`, the compiler resolves the package
by checking locations in this order:

1. `.grob\packages\` — project local (highest priority)
2. `%USERPROFILE%\.grob\packages\` — user global
3. `%ProgramFiles%\Grob\packages\` — system global

If the package is not found:

```
error: 'Grob.Http' is not installed.
       Run: grob install Grob.Http
```

## `grob.json` Manifest

Optional project manifest for multi-script projects sharing dependencies.

```json
{
  "name": "ado-tools",
  "version": "1.0.0",
  "dependencies": {
    "Grob.Http": "^1.0.0"
  }
}
```

`grob.json` discovery walks up from the script file's location, not the current
working directory. `grob restore` installs all declared dependencies.

See also: [Install Strategy](../CLI/Install-Strategy.md),
[Plugins Overview](../Plugins/Overview.md)
