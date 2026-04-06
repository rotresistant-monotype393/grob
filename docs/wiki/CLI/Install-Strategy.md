# Install Strategy

## Design Principles

**No elevation by default.** The default install path is within the current
user's profile.

**Explicit over implicit.** Plugins are never downloaded at runtime. `grob
install` is always a deliberate, separate step.

**The safe path is the short path.** The most common operation requires the
fewest flags.

## Scope Model

| Scope | Flag | Location (Windows) | Who sees it |
|-------|------|--------------------|-------------|
| User (default) | *(none)* | `%USERPROFILE%\.grob\packages\` | Current user |
| System | `--system` | `%ProgramFiles%\Grob\packages\` | All users |
| Project local | `--local` | `.grob\packages\` relative to `grob.json` | Current project |

### User scope (default)

```
grob install Grob.Http
```

No flag, no elevation. Available to all scripts run by the current user.

### System scope

```
grob install Grob.Http --system
```

Requires administrator elevation. For shared machines, build servers and CI.

### Project local scope

```
grob install Grob.Http --local
```

Requires `grob.json`. Recorded as a dependency. For version isolation.

## Resolution Order

1. `.grob\packages\` — project local (highest priority)
2. `%USERPROFILE%\.grob\packages\` — user global
3. `%ProgramFiles%\Grob\packages\` — system global

Local always wins. First match stops the search.

## grob.json Discovery

Walks up the directory tree from the script file's location, not the CWD.

```
C:\projects\my-scripts\
├── grob.json              ← found here
├── .grob\packages\
└── src\
    └── deploy.grob        ← script here; walk finds grob.json
```

## Runtime Installation

```
winget install Grob.Grob
```

One command, no manual PATH configuration. The installer adds the `bin\`
directory to the user or system PATH.

| Method | Location | Elevation |
|--------|----------|-----------|
| User install | `%USERPROFILE%\.grob\bin\grob.exe` | No |
| System install | `%ProgramFiles%\Grob\bin\grob.exe` | Yes |

## grob.json Shape

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "dependencies": {
    "Grob.Http": "^1.0.0",
    "Grob.Crypto": "1.2.3"
  }
}
```

| Constraint | Meaning |
|------------|---------|
| `"^1.0.0"` | Compatible — `>=1.0.0 <2.0.0` |
| `"1.2.3"` | Exact version pinned |
| `"*"` | Latest stable |

## CI Considerations

```yaml
# Azure DevOps pipeline
- script: |
    grob restore
    grob run deploy.grob --params deploy.grobparams
  displayName: Run deployment script
```

`grob restore` is idempotent — safe to run on every pipeline execution.

See also: [Commands](Commands.md),
[Modules and Imports](../Language-Specification/Modules-and-Imports.md)
