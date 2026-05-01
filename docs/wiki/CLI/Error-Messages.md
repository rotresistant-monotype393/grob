# Error Messages

## Principles

Error messages exist to unblock the developer — not to report a failure.

- Say what went wrong, where and why — in that order
- Never blame the developer, never be cryptic
- Suggest the fix when it is obvious. Do not suggest when it is not
- Show variable names and types, never values (prevents credential exposure)
- `--verbose` overrides the value-hiding behaviour for debugging

## Examples

### Type mismatch

```
Type error on line 14:
  Expected  int
  Got       string

  The function add() requires two int arguments.
  'name' is a string. Did you mean to convert it first?

  Hint: name.toInt() returns int? — check for nil before passing it.
```

### Undeclared variable

```
Error on line 8:
  'count' is not declared.
  Use := to declare a new variable, or check the spelling.
```

### Reassignment to declared variable

```
Error on line 12:
  'total' is already declared on line 3.
  Use = to reassign, not :=.
```

### Missing plugin

```
Error on line 1:
  'Grob.Http' is not installed.
  Run: grob install Grob.Http
```

### Nil safety

```
Type error on line 22:
  'name' is string? — it might be nil.
  Check for nil before using it, or use ?? to provide a default.
```

### Undefined member

```
Type error on line 15:
  'File' has no member 'filename'.
  Did you mean 'name'?

  Available members: name, path, directory, extension, size, modified, created
```

### Const reassignment

```
Error on line 9:
  'MAX' is declared as const and cannot be reassigned.
```

## What Error Messages Never Do

- Never output emoji
- Never use the word "simply"
- Never produce a wall of text when a sentence will do
- Never silently swallow an error
- Never show variable values (security concern)
- Never make the developer feel stupid

## Tone

Helpful and direct. Not apologetic, not terse. Warm without waffle.

See also: [Commands](Commands.md),
[Error Handling](../Language-Specification/Error-Handling.md)
