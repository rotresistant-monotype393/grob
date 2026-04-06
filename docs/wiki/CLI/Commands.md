# CLI Commands

## Usage

```
grob — a statically typed scripting language

Usage:
  grob run <script>          Run a Grob script
  grob repl                  Start an interactive session
  grob check <script>        Type-check without running
  grob fmt <script>          Format a Grob script
  grob new <script>          Create a new script with boilerplate
  grob install <plugin>      Install a plugin from NuGet
  grob uninstall <plugin>    Remove an installed plugin
  grob restore               Install all grob.json dependencies
  grob list                  List installed plugins
  grob search <query>        Search for available plugins
  grob update <package>      Update a plugin or the runtime
  grob init                  Create a grob.json manifest

Options:
  --dev-plugin <path>        Load a plugin (.dll) for development
  --params <file>            Load parameters from a .grobparams file
  --verbose                  Show compilation details and debug log output
  --version                  Print version and exit

Examples:
  grob run deploy.grob
  grob run stale-branches.grob --params stale.grobparams
  grob run report.grob --dev-plugin Grob.Http.dll
```

## `grob run`

Run a Grob script. Compiles in memory and executes immediately.

```
grob run deploy.grob
grob run deploy.grob --env staging
grob run deploy.grob --params deploy.grobparams
grob run deploy.grob --params deploy.grobparams --env production
grob run report.grob --dev-plugin C:\dev\Grob.Http.dll
grob run report.grob --verbose
```

## `grob repl`

Start an interactive session.

```
Grob 1.0.0  |  type 'help' for guidance, 'exit' to quit

G> _
```

Multiline input is handled gracefully. Errors in the REPL do not end the
session. `exit` and Ctrl+C both work.

## `grob check`

Type-check without running. Reports all compile-time errors.

```
grob check deploy.grob
```

No errors: `✓ deploy.grob`

With errors:
```
✗ deploy.grob

  Line 14 — type error
  Expected  int
  Got       string
```

## `grob fmt`

Format a Grob script. Never automatic, always opt-in.

```
grob fmt deploy.grob
```

## `grob new`

Create a new script with minimal boilerplate.

```
grob new deploy.grob
```

## Plugin Commands

See [Install Strategy](Install-Strategy.md) for full detail.

```
grob install Grob.Http
grob install Grob.Http --system
grob install Grob.Http --local
grob install Grob.Http --version 1.1.0
grob install                         // install all grob.json dependencies

grob uninstall Grob.Http
grob restore
grob list
grob list --all
grob search sharepoint
grob update Grob.Http
grob update                          // update the runtime
grob init
```

## Output Principles

Quiet on success, clear on failure. Errors to stderr, results to stdout.
`--verbose` is available but never the default. No emoji in compiler or CLI
output. Never "simply" in any output.
