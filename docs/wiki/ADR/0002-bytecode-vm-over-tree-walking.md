# ADR-0002: Bytecode VM over Tree-Walking

**Status:** Accepted
**Date:** February 2026
**Decision:** Grob uses a stack-based bytecode VM, not a tree-walking evaluator.

## Context

SharpBASIC used a tree-walking evaluator — recursive descent through the AST at
runtime. This is the simplest execution model but incurs overhead from tree
traversal and C# call stack usage. Grob needs to be faster and support a more
complex type system.

## Decision

A stack-based bytecode VM. The compiler walks the AST and emits a flat
instruction stream. The VM is a tight fetch-decode-execute loop. All
intelligence is in the compiler; the VM executes decisions already made.

The VM is written in C# .NET. The .NET JIT compiles the VM loop to efficient
native code.

## Alternatives Considered

**Tree-walking** — simpler to implement but slower. The SharpBASIC evaluator
demonstrated the approach's ceiling. Grob's type system and multiple compiler
passes (type checker, optimiser, compiler) favour a clean separation between
compilation and execution.

**Transpilation to C#** — compile Grob to C# source and use Roslyn. Deferred
as a post-MVP option (`grob build`). The bytecode VM is the primary execution
model.

**JIT compilation** — explicitly out of scope. A well-written bytecode VM is
sufficient for scripting workloads.

## Consequences

Positive: significant performance improvement over tree-walking, clean
separation of compilation and execution, constant pool eliminates value
extraction friction from AST nodes.

Negative: more complex implementation. Backpatching, call frames and the
instruction set are all additional machinery. This complexity is justified and
informed by the clox implementation experience.
