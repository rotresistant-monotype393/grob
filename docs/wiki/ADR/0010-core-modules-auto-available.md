# ADR-0010: Core Modules Auto-Available

**Status:** Accepted
**Date:** April 2026
**Decision:** Core stdlib modules are auto-available with no `import` required.

## Context

Some languages require importing everything explicitly (Go, Rust). Others make
standard library functions globally available (Python builtins, PowerShell).
The question was whether Grob's core modules should require import.

## Decision

Thirteen core modules are auto-available: `fs`, `strings`, `json`, `csv`, `env`,
`process`, `date`, `math`, `log`, `regex`, `path`, `formatAs`, `guid`. No import,
no ceremony.

The rule: if a reasonable developer expects it in any scripting language, it is
core.

Plugins (everything else) require explicit `import` and prior `grob install`.

## Alternatives Considered

**Import everything** — consistent but noisy. A file rename script would need
`import fs`, `import strings`, `import path` before the first line of logic.
For a scripting language this is unacceptable ceremony.

**Import with auto-import suggestion** — IDE feature, not a language feature.
Grob should work well without an IDE.

## Consequences

Positive: scripts are concise. A script with no imports is self-contained — no
external dependencies. The `import` lines serve as a clear dependency manifest
for non-core plugins.

Negative: thirteen namespaces are always in scope. Potential for name collisions
with user functions. Mitigated by namespace prefixing (`fs.list()`, not
`list()`).

The signal value of `import` is preserved: a script with no imports has no
external dependencies. A script with imports needs plugins installed. This
distinction is lost if core modules also require import.

*Updated April 2026 — module count corrected to thirteen; `format` renamed to
`formatAs` (D-282); `guid` confirmed as thirteenth core module.*
