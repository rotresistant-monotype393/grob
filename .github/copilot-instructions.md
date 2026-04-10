# Grob — Copilot Instructions

## Project Identity

Grob is a statically typed scripting language with a bytecode VM, written in
C# .NET 10. It is a serious project — not a toy, not a prototype. Every line
of code should be written as if it will ship.

The wiki specification in `docs/wiki/` is the authority for language behaviour.
The decisions log in `docs/design/decisions-log.md` is the authority for design
decisions. When in doubt, check those documents before generating code.

---

## Implementation Context

- **Language:** C# .NET 10
- **Solution format:** `Grob.slnx` — the XML-based solution format, not legacy `.sln`
- **Target platform:** Windows-native. All paths in examples and tests use
  Windows conventions. No Unix paths, no Unix commands.
- **IDE:** Visual Studio Code on Windows
- **Architecture:** Lexer → Parser → Type Checker → Compiler → Bytecode VM
- **AST passes:** Visitor pattern — three passes (type checker, optimiser,
  compiler) walk the same AST. Visitor earns its place here.
- **Value types:** `struct` for stack-allocated value types (int, float, bool).
  `class` for heap objects only (string, array, function).
- **Compiler organisation:** `partial class` files for physical separation of
  concerns within `Grob.Compiler`. Same namespace, same assembly.
- **Standard library:** Implemented as `IGrobPlugin` instances, auto-registered
  at VM startup by `Grob.Cli`. Not hardwired into the VM.

---

## Namespace Conventions

Namespaces are adjectives or gerunds — never the same word as the class they contain.
This prevents `Grob.Compiler.Lexer.Lexer` and similar clashes.

| Namespace | Contains |
|---|---|
| `Grob.Core` | `Chunk`, `OpCode`, `GrobType`, `GrobValue`, `ConstantPool`, `SourceLocation` |
| `Grob.Runtime` | `IGrobPlugin`, `GrobVM`, `FunctionSignature`, `GrobError` hierarchy |
| `Grob.Compiler.Lexing` | `Lexer`, `Token`, `TokenType`, `LexError` |
| `Grob.Compiler.Parsing` | `Parser`, `ParseError` |
| `Grob.Compiler.Parsing.Ast` | All AST node types |
| `Grob.Compiler.TypeChecking` | `TypeChecker`, `TypeRegistry`, `Symbol` |
| `Grob.Compiler.Emitting` | `Compiler` (the bytecode emitter) |
| `Grob.Vm` | `VirtualMachine`, `ValueStack`, `CallFrame`, `Globals`, `PluginLoader` |
| `Grob.Stdlib` | `FsPlugin`, `JsonPlugin`, and all other stdlib plugin classes |
| `Grob.Cli` | `Program`, `RunCommand`, `ReplCommand`, and all CLI command classes |

The rule: if the namespace and the primary class it contains would share the same
name, the namespace needs a different word. `Lexing` not `Lexer`. `Parsing` not
`Parser`. `TypeChecking` not `TypeChecker`. `Emitting` not `Compiler`. `Ast` is
fine — there is no class called `Ast`.

---

## Naming Conventions

- Type prefix is always `Grob` in full — `GrobType`, `GrobValue`, `GrobError`.
  Never abbreviated to `Gro`. `GroType` is wrong. `GrobType` is correct.
- `PascalCase` for types and public members
- `camelCase` for local variables
- `_camelCase` for private fields
- British English in all documentation, comments and XML doc comments
- No Oxford comma

---

## Code Style

- Same-line braces in C# code
- No `var` where the type is not immediately obvious from the right-hand side
- Prefer `switch` expressions over `if/else` chains for type dispatch
- `readonly` and `const` wherever applicable
- Structs for value types — no GC pressure. Classes for heap objects only.
- `snake_case` for Grob language identifiers in code examples and tests

---

## TDD Discipline

Tests are written before implementation, not after.

For every new type or method:
1. Write the test. Confirm it fails.
2. Write the implementation. Confirm the test passes.

Do not write implementation code and test code in the same step. Test files
in `Grob.Compiler.Tests` are the highest priority — bugs live in the compiler.
The VM loop can be trusted once verified on simple cases.

- Test compiler outputs exhaustively: given source, assert correct bytecode
- Test error paths as thoroughly as happy paths
- Every compiler change requires tests
- Test standard library functions independently via plugin registration

---

## Compiler Construction Rules

- Every AST node carries a `SourceLocation` — enforced by the base class
  constructor, not by convention. This is a day-one requirement. Do not
  create AST nodes without source location.
- Every identifier node resolved by the type checker carries a `Declaration`
  back-reference to its declaration node. Required for go-to-definition.
- The compiler and type checker collect ALL errors before execution stops.
  Never halt at the first error in the compiler pipeline.
- The VM stops on the FIRST runtime error. These are different strategies
  and must not be confused.
- `Grob.Compiler` and `Grob.Vm` never reference each other. `Grob.Core`
  is the only shared ground between them.

---

## Language Rules — Do Not Violate

- No semicolons — Grob uses newline termination with implicit continuation
- Declaration is `:=` — there is no `var` keyword in the Grob language
- `#{` is a single token — the anonymous struct opener, not `#` followed by `{`
- All type checking happens at compile time — no dynamic type checks at runtime
- Method-call syntax on primitives is compiler sugar — primitives are never boxed
- The `Grob` type prefix is always used in full — `GrobValue` not `GroValue`
- No pipe operator `|` inside scripts — fluent chaining is the in-script idiom
- `else if` is two keywords — not `elif`

---

## What Not To Do

- Do not generate code that has not been reviewed and understood by the
  developer. This is AI-augmented development, not vibe coding.
- Do not use `cat`, `ls` or other Unix commands in any example or test
- Do not use the word "simply" in any documentation or comment
- Do not add emoji to compiler output, CLI output or error messages
- Do not introduce semicolons
- Do not box primitives
- Do not write tests after implementation — tests come first

---

## Key References

- `docs/wiki/Language-Specification/` — language syntax and semantics
- `docs/wiki/Standard-Library/` — all twelve core module APIs
- `docs/wiki/Type-Registry/` — built-in type members (compiler reference)
- `docs/wiki/VM-Architecture/` — bytecode VM design
- `docs/design/decisions-log.md` — authoritative design decisions
