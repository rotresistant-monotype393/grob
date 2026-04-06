# Operators

## Arithmetic

| Operator | Operation | Notes |
|----------|-----------|-------|
| `+` | Addition / string concatenation | `string + int` is a compile error |
| `-` | Subtraction | |
| `*` | Multiplication | |
| `/` | Division | `int / int → int` (truncating) |
| `%` | Modulo | |

Integer division truncates: `7 / 2` produces `3`. Mixed operands promote to
`float`: `7 / 2.0` produces `3.5`. String concatenation with `+` requires both
operands to be strings — use `.toString()` or string interpolation for mixed
types.

## Comparison

| Operator | Operation |
|----------|-----------|
| `==` | Equal |
| `!=` | Not equal |
| `<` | Less than |
| `>` | Greater than |
| `<=` | Less than or equal |
| `>=` | Greater than or equal |

## Logical

| Operator | Operation | Notes |
|----------|-----------|-------|
| `&&` | Logical AND | Short-circuit |
| `\|\|` | Logical OR | Short-circuit |
| `!` | Logical NOT | |

## Assignment

| Operator | Operation |
|----------|-----------|
| `:=` | Declare and assign (first use of a name) |
| `=` | Reassign (name must already exist) |
| `+=` | Add and assign |
| `-=` | Subtract and assign |
| `*=` | Multiply and assign |
| `/=` | Divide and assign |
| `%=` | Modulo and assign |

All compound assignment operators are statements — they do not produce a value
and cannot appear in expression position. Assignment is not an expression.
`if (x := foo())` is a compile error.

## Increment and Decrement

| Operator | Operation |
|----------|-----------|
| `i++` | Increment by 1 |
| `i--` | Decrement by 1 |

Postfix form only — prefix `++i` and `--i` are not valid. Both are statements,
not expressions. The compiler lowers `i++` to `i = i + 1`. Applies to `int`
only. `float++` is a compile error. `++` on a `const` binding is a compile error.

## Nil Handling

| Operator | Operation |
|----------|-----------|
| `??` | Nil coalescing — `a ?? b` returns `a` if non-nil, otherwise `b` |
| `?.` | Optional chaining — `a?.foo` returns nil if `a` is nil |

## Range

| Operator | Operation |
|----------|-----------|
| `..` | Inclusive range (numeric for loops only in v1) |

## Unary

| Operator | Operation |
|----------|-----------|
| `-` | Arithmetic negation |
| `!` | Logical NOT |

Bitwise operators are not in scope for v1.

## Precedence

Highest to lowest. Parentheses override precedence at any level.

| Level | Operators | Notes |
|-------|-----------|-------|
| 1 (highest) | `-` (unary), `!` | |
| 2 | `*`, `/`, `%` | |
| 3 | `+`, `-` | |
| 4 | `<`, `>`, `<=`, `>=` | |
| 5 | `==`, `!=` | |
| 6 | `&&` | |
| 7 | `\|\|` | |
| 8 | `??` | |
| 9 | `? :` (ternary) | |
| 10 (lowest) | `:=`, `=`, `+=`, `-=`, `*=`, `/=`, `%=` | |

This matches C-family precedence. The Pratt parser implements this as binding
powers.

See also: [Expressions](Expressions.md), [Types](Types.md)
