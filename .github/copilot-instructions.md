# Grob — Copilot Instructions

## Project Identity

Grob is a statically typed scripting language with a bytecode VM, written in
C# .NET. It is a serious project — not a toy, not a prototype. Every line of
code should be written as if it will ship.

The wiki specification in `docs/wiki/` is the authority for language behaviour.
The decisions log in `docs/design/decisions-log.md` is the authority for design
decisions. When in doubt, check these documents before generating code.

## Implementation Context

- **Language:** C# .NET 10
- **Target platform:** Windows-native. All paths in examples and tests use
  Windows conventions. No Unix-isms.
- **IDE:** Visual Studio Code on Windows
- **Architecture:** Lexer → Parser → Type Checker → Compiler → Bytecode VM
- **AST pattern:** Visitor pattern — three passes (type checker, optimiser,
  compiler) walk the same AST
- **Value types:** `struct` for stack-allocated value types (int, float, bool).
  `class` for heap objects only (string, array, function).
- **Compiler organisation:** `partial class` files for physical separation of
  concerns. Same namespace, same architecture.
- **Standard library:** Implemented as `IGrobPlugin` instances, auto-registered
  at VM startup.

## Code Style

- British English in all documentation, comments and string messages
- No Oxford comma
- `snake_case` for Grob language examples in docs and tests
- C# naming conventions for implementation code (PascalCase types,
  camelCase locals, \_camelCase private fields)
- Same-line braces in C# code
- No `var` where the type is not obvious from the right-hand side
- Prefer `switch` expressions over `if/else` chains for type dispatch
- Use `readonly` and `const` where applicable

## Testing

- Test compiler outputs exhaustively — given source, assert correct bytecode
- Test error paths as thoroughly as happy paths
- Every compiler change requires tests
- The VM loop can be trusted once verified on simple cases — bugs live in the
  compiler
- Test standard library functions independently of the compiler

## What Not To Do

- Do not generate code that the developer has not reviewed and understood.
  This is AI-augmented development, not vibe coding.
- Do not use `cat`, `ls` or other Unix commands in any example or test
- Do not use the word "simply" in any documentation or comment
- Do not add emoji to compiler output, CLI output or error messages
- Do not introduce semicolons — Grob uses newline termination
- Do not use `var` as a keyword in Grob — declaration is `:=`
- Do not create dynamic type checks at runtime — all type checking happens
  at compile time
- Do not box primitives — method-call syntax on all types is compiler sugar

## Key References

- `docs/wiki/Language-Specification/` — language syntax and semantics
- `docs/wiki/Standard-Library/` — all twelve core module APIs
- `docs/wiki/Type-Registry/` — built-in type members (compiler reference)
- `docs/wiki/VM-Architecture/` — bytecode VM design
- `docs/design/decisions-log.md` — authoritative design decisions
- `docs/design/requirements-specification-v1.md` - definitve requirements specification and sprint plan
- `docs/design/solution-architecture.md` - authoritative solution architecture

