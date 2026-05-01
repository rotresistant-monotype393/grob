# Grob — Agent and Copilot Instructions

This file is read by every AI coding surface that touches this repository —
Copilot inline completion, Copilot chat, Copilot agent mode, Claude Code, and
any future agent tool. Its guidance applies across all of them. Where a section
references behaviour specific to one tool (e.g. plan mode in Copilot agent mode),
that is called out explicitly.

Read this file in full before generating any code, editing any file, or running
any terminal command. If anything here conflicts with a general default behaviour,
this file wins.

---

## Section A — Project Facts

**What Grob is.** Grob is a statically typed scripting language with a bytecode
VM, written in C# .NET 10 LTS. It is a hobby project but not a toy — it is a
serious attempt to fill the gap between Go (too ceremonious for scripts),
PowerShell (syntactically hostile), and Python (dynamically typed and clunky at
scale). Every design decision, every line of code, every document is made with
that in mind.

**Solution structure.** Seven source projects, three first-party plugins, five
test projects:

```
src/
  Grob.Core        shared primitives: Chunk, OpCode, GrobType, GrobValue, SourceLocation
  Grob.Runtime     plugin contract: IGrobPlugin, GrobVM surface, FunctionSignature, GrobError hierarchy
  Grob.Compiler    lexer, parser, AST, type checker, codegen (partial class organisation)
  Grob.Vm          VM execution engine: fetch/decode/execute, value stack, call frames, PluginLoader
  Grob.Stdlib      all thirteen core modules as IGrobPlugin implementations
  Grob.Cli         entry point, REPL, all CLI commands, composition root
  Grob.Lsp         language server (LSP)

plugins/
  Grob.Http        first-party HTTP plugin; reference implementation; auth.* sub-namespace lives here
  Grob.Crypto      checksums and hashing
  Grob.Zip         archive operations

tests/
  Grob.Core.Tests
  Grob.Compiler.Tests
  Grob.Vm.Tests
  Grob.Stdlib.Tests
  Grob.Integration.Tests
```

**Dependency graph — DAG, no cycles:**

- `Grob.Compiler` and `Grob.Vm` never reference each other.
- `Grob.Core` is the only shared ground between them. `Chunk` lives there
  because both compiler (produces) and VM (consumes) need it.
- `Grob.Cli` is the only project that references all other source assemblies.
- `Grob.Lsp` references `Grob.Compiler`, `Grob.Core`, `Grob.Runtime` — never
  `Grob.Vm`. It analyses code; it never runs it.
- First-party plugins reference `Grob.Runtime` only. If a plugin needs more,
  the plugin model is broken.

**Target framework:** `net10.0` throughout. No exceptions.

**Thirteen core stdlib modules** — auto-available, no `import` required:
`fs`, `strings`, `json`, `csv`, `env`, `process`, `date`, `math`, `log`,
`regex`, `path`, `formatAs`, `guid`.

The module is `formatAs` — not `format`. Renamed D-282. Any reference to a
`format` module is stale and incorrect.

**Error model.** Two-mode: compiler and type checker collect ALL errors before
execution. VM stops on FIRST runtime error. Ten-leaf exception hierarchy under
`GrobError`: `IoError`, `NetworkError`, `JsonError`, `ProcessError`, `NilError`,
`ArithmeticError`, `IndexError`, `ParseError`, `LookupError`, `RuntimeError`.

Error code registry — seven categories:
`E0xxx` (type), `E1xxx` (name resolution), `E2xxx` (syntax),
`E3xxx` (module/import), `E4xxx` (param/decorator), `E5xxx` (runtime),
`E9xxx` (reserved). `Wxxxx` reserved for future warnings. 86 codes total.
Codes are immutable once shipped (ADR-0017).

**GrobValue.** Hand-rolled `readonly struct`, 24 bytes on x64, nine-variant
discriminator. `int`, `float`, `bool` stored inline — zero GC pressure.
`string`, `array`, `function`, `struct` use the heap reference field.
Encapsulated factory surface — never construct `GrobValue` directly.

Do NOT use the .NET `union` keyword. Its compiler-generated form boxes
value-type cases on every assignment — wrong cost profile for a VM hot path.
The project targets .NET 10 LTS; the hand-rolled struct is correct.

**Canonical documents** live in `docs/design/`. The decisions log
(`docs/design/grob-decisions-log.md`) is the authority. The wiki in
`docs/wiki/` is a derived view. Where they disagree, the decisions log wins.

---

## Section B — Conventions

These apply to every line of code, every comment, every error message, and every
documentation edit. They bind on inline completion as much as agent mode.

**British English throughout.** No Oxford comma. Never the word "simply" in any
documentation or comment. No emoji in CLI output, error messages, REPL output,
or normative documentation.

**Naming — the `Grob` prefix is always used in full. Never `Gro`.**

| Correct | Incorrect |
|---------|-----------|
| `GrobType` | `GroType` |
| `GrobValue` | `GroValue` |
| `GrobError` | `GroError` |
| `GrobChunk` | `GroChunk` |

This is an absolute rule enforced by ADR-0012.

**C# code style.**

- `PascalCase` for types and public members.
- `camelCase` for locals and parameters.
- `_camelCase` for private fields.
- `partial class` throughout `Grob.Compiler` for physical separation of
  concerns within the same namespace.
- `struct` for value types. `class` for heap objects only.
- Same-line braces.
- `var` only where the type is obviously visible from the right-hand side.
- `switch` expressions over `if/else` chains for type dispatch.

**Grob language conventions** (for examples, tests, and documentation).

- `snake_case` for variable and function names in Grob source.
- `:=` declares and assigns on first use. `=` reassigns. No `var` keyword.
- `const` is for compile-time-constant bindings only (D-288). Not a general
  immutability marker.
- `readonly` is for runtime-once bindings — set once at runtime, never
  reassigned (D-289).
- String interpolation: `"Hello ${name}"` — dollar sign, curly braces.
- Windows paths in backtick raw strings: `` `C:\Reports\file.txt` `` — not
  double-quoted with escapes (D-285).
- No semicolons. Newline is the statement terminator.
- `.select()` is the projection method on arrays — not `.map()`. The name
  `.map()` does not exist in Grob (D-280). `.mapAs<T>()` is distinct:
  typed deserialisation on JSON and CSV results only.
- `print()`, `input()`, `exit()` are built-ins resolved at type-check time.
  They are not keywords (D-270).

**Test discipline.** Every behavioural change has a corresponding xunit test in
the matching `.Tests` project. Tests live in their own projects. Test compiler
outputs exhaustively — given source text, assert emitted bytecode. The VM loop
can be trusted once verified on simple cases; bugs live in the compiler.

**Decisions log primacy.** Before writing code that involves a design choice,
check `docs/design/grob-decisions-log.md`. If the canonical docs appear to
conflict on a point, the decisions log wins.

---

## Section C — Behavioural Expectations

These govern how an AI agent plans and executes work. They apply most directly
in agent mode (Copilot agent mode, Claude Code, or equivalent). Inline
completion is unaffected.

**Plan first, execute second.** Always present an execution plan before editing
files or running terminal commands. For Copilot agent mode: use plan mode to
scope the task before switching to agent mode to execute. A plan check that
surfaces a misunderstanding saves a multi-minute agent run that produces wrong
output. After test failures, present what you intend to change before iterating.

**Sprint-bound scope.** The active sprint is in
`docs/design/grob-v1-requirements.md`. Do not create files outside the active
sprint's scope without explicit confirmation. Do not add features not in the
current sprint's acceptance criteria. If a task surfaces a need to touch
out-of-scope files, stop and ask before proceeding.

**Three-iteration test discipline.** Run tests after every change. Iterate
against failures up to three times. After three failed iterations, stop and
report the state. The engineer is better placed to redirect once context is lost.

**Stop-and-ask triggers.** Halt and seek confirmation when:

- A task requires touching files outside the active sprint's scope.
- The decisions log is silent on a design question that affects implementation.
- Two canonical docs disagree and the decisions log does not resolve it.
- A terminal command would touch files outside the project root, perform a
  destructive operation (`rm -rf`, `git push --force`, package uninstall), or
  invoke external services.
- The implementation requires a new opcode, error code, keyword, or stdlib API
  that does not already exist in the canonical docs.

**No invented design decisions.** The canonical docs almost certainly cover any
choice that looks like it needs one — search `docs/design/` first. If they
genuinely do not cover it, stop and ask. Do not invent.

**No new D-### entries from agent work.** The decisions log is maintained by
Chris. Agent work may propose; Chris decides and records.

**This is AI-augmented development, not vibe coding.** AI can write code,
suggest implementations, and review work. Chris understands and owns every
decision and every line. Produce code that is ready to be understood and reviewed.

---

## Section D — Token Budget Guidance

Applies to metered agent interactions (Copilot Pro+ agent mode, Claude Code, or
any future metered tool). The goal is correct output on the first attempt.

**Prefer cheaper models for routine work.** Standard-tier models are correct for
boilerplate, test scaffolding, doc updates, mechanical refactors, and exhaustive-
but-shallow changes. Reserve the most capable model for genuinely hard reasoning:
parser edge cases, type-checker logic, design judgement on ambiguous spec,
multi-file refactors with non-trivial dependencies.

**Plan mode before agent mode (Copilot-specific).** Scope tasks in plan mode
before executing in agent mode. This surfaces misunderstandings before they
consume budget.

**One task per session.** Avoid parallel sub-agent workflows. Solo-development
gains nothing from parallelism and pays tokens at multiples.

**Prefer concise diffs over wholesale rewrites.** Targeted edits consume output
tokens proportional to the change. Wholesale rewrites consume tokens proportional
to the file. When a small change will do, make the small change.

**Stop after three iterations.** Three iterations is sufficient to surface that
the agent has lost the thread. Further iterations burn budget without improving
output. Stop and report.

---

*Keep this file current. Update it in the same commit as the canonical doc change
that necessitates an update. Its accuracy is load-bearing.*
