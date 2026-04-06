# Instruction Set

Grob's instruction set is custom — there is no standard bytecode format. Each
opcode is a single byte (256 possible instructions). The set grows organically
as features demand.

## Initial Opcode Set

### Values

| Opcode | Operands | Description |
|--------|----------|-------------|
| `Constant` | index (1–2 bytes) | Push constant from pool |
| `Nil` | — | Push nil |
| `True` | — | Push true |
| `False` | — | Push false |
| `Pop` | — | Discard top of stack |

### Arithmetic

| Opcode | Description |
|--------|-------------|
| `Add` | Pop two, push sum |
| `Subtract` | Pop two, push difference |
| `Multiply` | Pop two, push product |
| `Divide` | Pop two, push quotient |
| `Negate` | Negate top of stack |

### Comparison

| Opcode | Description |
|--------|-------------|
| `Equal` | |
| `NotEqual` | |
| `Less` | |
| `Greater` | |
| `LessEqual` | |
| `GreaterEqual` | |

### Logic

| Opcode | Description |
|--------|-------------|
| `Not` | |
| `And` | |
| `Or` | |

### Variables

| Opcode | Operands | Description |
|--------|----------|-------------|
| `GetLocal` | slot (1 byte) | Push local from stack slot |
| `SetLocal` | slot (1 byte) | Store top of stack in slot |
| `GetGlobal` | name index | Push global by name |
| `SetGlobal` | name index | Store in global by name |
| `DefineGlobal` | name index | Create global binding |

### Control Flow

| Opcode | Operands | Description |
|--------|----------|-------------|
| `Jump` | offset (2 bytes) | Unconditional forward jump |
| `JumpIfFalse` | offset (2 bytes) | Conditional forward jump |
| `Loop` | offset (2 bytes) | Unconditional backward jump |

### Functions

| Opcode | Operands | Description |
|--------|----------|-------------|
| `Call` | arg count (1 byte) | Call function |
| `Return` | — | Return from function |

### Closures

| Opcode | Operands | Description |
|--------|----------|-------------|
| `CaptureUpvalue` | — | Capture variable from enclosing scope |

### I/O

| Opcode | Description |
|--------|-------------|
| `Print` | Print top of stack to stdout |

## The Constant Pool

Literals do not live inline in the bytecode stream. They live in a separate
constant pool array. The bytecode references them by index.

```
[CONSTANT] [0]    // push constants[0]
[CONSTANT] [1]    // push constants[1]
[ADD]
```

## Backpatching

Forward jumps use backpatching: emit a placeholder offset, compile the target
block, then patch the real distance.

```csharp
int placeholder = EmitJump(OpCode.JumpIfFalse);
// ... compile block ...
PatchJump(placeholder);
```

Backward jumps (loops) do not need patching — the target position is already
known.

## Type-Driven Opcode Selection

The compiler uses type annotations from the type checker to emit specialised
opcodes where beneficial:

| Scenario | Opcode |
|----------|--------|
| Both sides `int` | `ADD_INT` |
| Both sides `float` | `ADD_FLOAT` |
| Both sides `string` | `CONCAT` |
| Mixed `int`/`float` | `PROMOTE_TO_FLOAT` then `ADD_FLOAT` |

No runtime type checks — the type checker already verified correctness.

## Bytecode File Format

The `.grobc` binary format:

| Field | Size | Description |
|-------|------|-------------|
| Magic number | 4 bytes | `GROB` (0x47 0x52 0x4F 0x42) |
| Version | 1 byte | Grob version |
| Constant pool size | 2 bytes | |
| Constants | variable | Each prefixed with type byte |
| Bytecode size | 4 bytes | |
| Bytecode | variable | Raw instruction stream |
| Function count | 2 bytes | |
| Functions | variable | Each is its own mini chunk |
