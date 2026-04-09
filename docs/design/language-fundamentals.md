# Grob — Language Fundamentals

> Specification document for core language syntax and semantics.
> Decisions authorised in the decisions log — April 2026 fundamentals session.
> This document is the implementation reference for the parser, type checker,
> and compiler for all foundational language features.
> When this document and the decisions log conflict, the decisions log wins.
>
> **Tooling note:** The keyword list and operator set in this document are the
> authoritative source for the TextMate grammar (`grob.tmLanguage.json`).
> When keywords are added or changed, the grammar must be updated.
> See `tooling-strategy.md`.

-----

## 1. Control Flow — `if/else`

```grob
if (condition) {
    // then block
}

if (condition) {
    // then block
} else {
    // else block
}

if (condition) {
    // then block
} else if (condition) {
    // else if block
} else {
    // fallback block
}
```

**Rules:**

- Parentheses around the condition are required.
- Opening brace must be on the same line as the `if` or `else if` keyword.
- `else if` is two keywords — not `elif` or `elsif`.
- `else {` must be on the same line as the closing brace of the preceding block.
- Nesting is unlimited — no compiler limit, convention only.
- `if/else` is a **statement**, not an expression. It cannot appear in expression
  position. Expression-position conditionals use ternary `? :` (two-way) or switch
  expression (multi-branch).

-----

## 2. Control Flow — `while`

```grob
while (condition) {
    // body
}
```

**Rules:**

- Parentheses around the condition are required.
- Opening brace must be on the same line as `while`.
- `do...while` is deferred post-MVP.
- `for...in` and functional methods are the preferred style for collection
  iteration. `while` exists for condition-driven loops where no collection
  is being iterated.

-----

## 3. Control Flow — `select/case`

`select` is the multi-branch statement for executing blocks based on a matched
value. It is distinct from the switch expression, which produces a value.

```grob
select (value) {
    case 0 {
        print("Zero")
    }
    case 1, 2 {
        print("One or two")
    }
    case "error" {
        log.error("Error state")
    }
    default {
        print("Something else: ${value}")
    }
}
```

**Rules:**

- Parentheses around the subject value are required.
- First matching case executes. No fall-through.
- Multiple values per case arm: `case 1, 2 { }` — matches either value.
- `default` arm is optional. If omitted and no case matches, execution continues
  past the `select` block with no error.
- Exhaustiveness is **not** enforced on `select` statements. (The switch
  *expression* enforces exhaustiveness because a missing case means a missing
  value — `select` has no such constraint.)
- Works on any comparable type: `int`, `string`, `bool`.
- `break` does not apply inside `select` — no fall-through means it is never
  needed. To exit an enclosing loop from inside a `select`, restructure into a
  function and use `return`, or use a flag variable.
- `select` is always a **statement**. The switch expression (`value switch { }`)
  is always an **expression**. The two forms are syntactically unambiguous.

-----

## 4. Control Flow — `break` and `continue`

```grob
for file in files {
    if (file.name == "skip.log") {
        continue
    }
    if (file.size > maxSize) {
        break
    }
    process(file)
}
```

**Rules:**

- `break` exits the innermost enclosing loop immediately.
- `continue` skips the remainder of the current iteration and proceeds to the next.
- Both work in `for...in` and `while` loops.
- Both are statements — they may not appear outside a loop body. Using either
  outside a loop is a compile error.
- Labelled break (for breaking an outer loop from inside a nested loop) is
  deferred post-MVP. The v1 alternative is to extract the inner loop into a
  function and use `return`.

-----

## 5. Loops — `for...in`

### Collection iteration

```grob
// Value only
for file in files {
    print(file.name)
}

// Index and value
for i, file in files {
    print("${i}: ${file.name}")
}
```

**Rules:**

- `for item in collection { }` — confirmed syntax.
- `for i, item in collection { }` — index form. `i` is zero-based `int`, inferred.
- The single-identifier form always binds the **value**, not the index.
- Both `i` and `item` are declared by the `for` statement — no `:=` in the loop
  header. Both are scoped to the loop body.
- The loop variable is **immutable** within the body — reassigning it is a compile
  error. This prevents the class of bug where modifying the iterator produces
  unexpected behaviour.
- Arrays confirmed as iterable in v1. Whether additional types (`string`,
  `csv.Table` rows, etc.) are iterable is governed by OQ-007 (iterable protocol,
  still open). The `for...in` mechanism accommodates a formal iterable protocol
  when OQ-007 is resolved — no architectural rework required.

### Numeric range iteration

```grob
// Basic range — inclusive both bounds
for i in 0..10 { }          // 0, 1, 2 ... 10

// With step
for i in 0..100 step 5 { }  // 0, 5, 10 ... 100

// Descending
for i in 10..0 step -1 { }  // 10, 9, 8 ... 0
```

**Rules:**

- `..` operator — both bounds are **inclusive**.
- `step` is optional. Default step is `1`.
- Step may be any non-zero `int` literal or variable.
- A descending range without an explicit negative step is a **compile error** —
  `for i in 10..0 { }` without `step -1` would produce an infinite loop and is
  rejected at compile time.
- The loop variable is `int`, declared by the `for` statement, immutable within
  the body.
- The compiler lowers range loops to `while`. The VM never sees range opcodes.
- `..` is a range-specific operator in v1 — it does not appear in other expression
  contexts.

-----

## 6. Operators

### Arithmetic

| Operator | Operation | Notes |
|----------|-----------|-------|
| `+` | Addition / string concatenation | |
| `-` | Subtraction | |
| `*` | Multiplication | |
| `/` | Division | See integer division rules below |
| `%` | Modulo | |

**Integer division:** `int / int → int` (truncating). `float / float → float`.
`int / float` and `float / int` promote to `float`. No separate floor-division
operator — the operand types determine the result.

**String concatenation:** `+` on strings is valid. `string + int` is a compile
error — no implicit conversion. Use `.toString()` or string interpolation.

### Comparison

| Operator | Operation |
|----------|-----------|
| `==` | Equal |
| `!=` | Not equal |
| `<` | Less than |
| `>` | Greater than |
| `<=` | Less than or equal |
| `>=` | Greater than or equal |

### Logical

| Operator | Operation | Notes |
|----------|-----------|-------|
| `&&` | Logical AND | Short-circuit — right operand not evaluated if left is `false` |
| `\|\|` | Logical OR | Short-circuit — right operand not evaluated if left is `true` |
| `!` | Logical NOT | |

### Assignment

| Operator | Operation |
|----------|-----------|
| `:=` | Declare and assign (first use of a name) |
| `=` | Reassign (name must already exist) |
| `+=` | Add and assign |
| `-=` | Subtract and assign |
| `*=` | Multiply and assign |
| `/=` | Divide and assign |
| `%=` | Modulo and assign |

All compound assignment operators are **statements** — they do not produce a value
and cannot appear in expression position.

### Increment and decrement

| Operator | Operation |
|----------|-----------|
| `i++` | Increment `i` by 1 |
| `i--` | Decrement `i` by 1 |

- Postfix form only — prefix (`++i`, `--i`) is not valid.
- Both are **statements** — they do not produce a value and cannot appear in
  expression position. The compiler lowers `i++` to `i = i + 1`.
- Applies to `int` only. `float++` and `float--` are compile errors.
- `++` and `--` on a `const` binding is a compile error.

### Unary

| Operator | Operation |
|----------|-----------|
| `-` | Arithmetic negation |
| `!` | Logical NOT |

### Other

| Operator | Operation |
|----------|-----------|
| `??` | Nil coalescing — `a ?? b` returns `a` if non-nil, otherwise `b` |
| `?.` | Optional chaining — `a?.foo` returns nil if `a` is nil |
| `..` | Range (numeric for loops only in v1) |

Bitwise operators are not in scope for v1.

-----

## 7. Operator Precedence

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

This matches C-family precedence. No surprises for C# or Go developers. The
Pratt parser implements this as binding powers — this table is the canonical
reference for the spec.

-----

## 8. Literals

### Integer literals

```grob
42          // decimal
0           // zero
-1          // negative
0xFF        // hexadecimal
0xff        // hexadecimal — case insensitive
0b1010      // binary
1_000_000   // underscore separator — readability only, ignored by compiler
0xFF_FF     // underscores valid in hex and binary literals too
```

### Float literals

```grob
3.14        // standard
0.5         // leading zero required — .5 is not valid
1.5e10      // scientific notation
2.3E-4      // scientific notation — E case insensitive
```

Leading dot (`.5`) is not valid — a leading digit is always required.

### String literals

```grob
"hello"             // double-quoted
"Hello ${name}"     // interpolation — confirmed load-bearing
`raw\nstring`       // raw string — backtick-delimited, no escape processing
`C:\Users\chris`    // raw strings for Windows paths
`/pattern/`         // raw strings for regex patterns
```

- Single-quoted strings are not valid.
- Double-quoted strings support escape sequences (`\n`, `\t`, `\\`, `\"`, etc.)
  and interpolation (`${expr}`).
- Raw strings (backtick-delimited) suppress all escape processing. Newlines inside
  a raw string are literal newlines — multi-line raw strings are valid.
- Double-quoted strings do not span lines. For multi-line content, use a raw string
  or concatenation.

### Bool literals

```grob
true
false
```

### Nil literal

```grob
nil
```

### Array literals

```grob
[1, 2, 3]               // int array, inferred
["alpha", "beta"]       // string array, inferred
[]                      // empty array — valid where type is known from context
```

`[]` requires the type to be known from context — an annotated left-hand side,
a parameter type, or a return type. `[]` in a position where the element type
cannot be inferred is a compile error.

```grob
items: int[] := []      // valid — type known from annotation
fn foo(): string[] {
    return []           // valid — type known from return type
}
items := []             // compile error — element type cannot be inferred
```

-----

## 9. Type Annotations

```grob
x := 42                  // inferred — x is int
x: int := 42             // explicit annotation — always valid, never required here

const MAX := 100         // inferred, immutable
const MAX: int := 100    // explicit, immutable

name: string? := nil     // annotation required — nil provides no type information
items: int[] := []       // annotation required — [] provides no element type
```

**Rules:**

- Explicit type annotation syntax: `name: Type := value`.
- Annotation is **optional** on local variables where inference can resolve the type.
- Annotation is **required** where inference cannot:
  - Declaration initialised with `nil` — `name: string? := nil`.
  - Declaration initialised with `[]` — `items: int[] := []`.
- Function parameters are **always explicitly typed** — no inference on parameters.
- Return type annotation on functions: `fn foo(): int { }` — colon before the
  return type, consistent with parameter syntax.
- **v1 rule:** explicit return types are required on all functions. Inference on
  return types is post-MVP. This eliminates a class of inference ambiguity and
  keeps the type checker simple.

-----

## 10. Type Declarations and Construction

### Declaration

```grob
type Repo {
    name:    string
    ssh_url: string
}

type Config {
    host:    string
    port:    int = 8080       // field default
    timeout: int = 30         // field default
}
```

- `type` keyword followed by the type name and a brace-delimited field list.
- Fields without defaults are **required** at construction.
- Fields with defaults are **optional** at construction — the default is used if omitted.

### Construction

```grob
r := Repo {
    name:    "grob",
    ssh_url: "git@github.com/..."
}

c := Config {
    host: "localhost"          // port and timeout use defaults
}
```

- Fields at construction are **named and unordered** — order need not match the
  declaration. Matches C# object initialiser behaviour.
- All field names must match the declared type. Unknown field names are a compile error.
- Omitting a field without a default is a compile error.

### Nested construction

```grob
type Address {
    city:    string
    country: string
}

type Person {
    name:    string
    address: Address
}

p := Person {
    name:    "Chris",
    address: Address { city: "London", country: "UK" }
}
```

`TypeName { }` is an expression that produces a value of that type. It can appear
anywhere that type is expected — nested construction requires no special case.

### The bare brace rule

`{ }` is **always a block**. Using bare braces as an object literal is a compile
error:

```
error: '{' begins a block, not a struct literal.
       Use '#{ field: value }' for an anonymous struct, or declare a named type.
```

| Syntax | Meaning |
|--------|---------|
| `{ }` | Block — always |
| `#{ field: value }` | Anonymous struct literal |
| `TypeName { field: value }` | Named type construction |

Partial construction and `with`-style record mutation are deferred post-MVP.

-----

## 11. Comments

```grob
// Single-line comment

/* Block comment
   spans multiple lines */

/// Doc comment — reserved, no semantics in v1
```

- `//` — single-line. Everything from `//` to end of line is ignored.
- `/* */` — block comment. Does not nest.
- `///` — the lexer recognises this token and discards it. No semantics attached
  in v1. Reserved so that `///` usage in scripts does not break when `grob doc`
  tooling arrives post-MVP.

-----

## 12. Expressions vs Statements

### Statements

These constructs are statements — they execute but do not produce a value:

- Variable declaration: `:=`
- Reassignment: `=`
- Compound assignment: `+=`, `-=`, `*=`, `/=`, `%=`
- Increment / decrement: `i++`, `i--`
- `if/else`
- `while`
- `select/case`
- `for...in`
- `try/catch`
- `break`, `continue`
- `return`

Assignment is **not** an expression. `if (x := foo())` is a compile error. This
eliminates a class of bugs common in C-family languages.

### Expressions

These constructs are expressions — they produce a value:

- Literals: `42`, `"hello"`, `true`, `nil`, `[1, 2, 3]`
- Identifiers: `x`, `name`
- Arithmetic, comparison, logical operations
- Function calls — produce the return value. May be used as a statement (value discarded).
- Ternary `? :` — two-way value selection
- Switch expression (`value switch { }`) — multi-branch value selection
- Anonymous struct literal `#{ }`
- Named type construction `TypeName { }`
- Method calls: `str.upper()`
- Member access: `file.name`

### `print()` and `void`

`print()` is a built-in function returning `void`. It is used as a statement.
Its return value cannot be assigned or used in expression position.
`void` is not a first-class type in Grob — it exists only as the return type of
functions that produce no value.

-----

## 13. `print()` Built-in

```grob
print("Hello, world")       // single value
print(42)                   // any type
print(a, b, c)              // variadic — values separated by single space
print()                     // no args — prints empty line
```

**Specification:**

- Accepts any type. Value types (`int`, `float`, `bool`) are converted to their
  string representations. Reference types call `.toString()`. `nil` prints as
  the string `"nil"`.
- Variadic — any number of arguments. Multiple values separated by a single space.
- A newline is appended after the last value.
- Output goes to **stdout**.
- Returns `void` — used as a statement only.
- There is no `printError()`. `log.error()` is the stderr output mechanism.
  The `print()` / `log.*` boundary: results go to stdout via `print()`,
  operational messages go to stderr via `log.*`. These do not overlap.

-----

## 14. Line Continuation

Newlines are significant in Grob — they end statements. A newline is **suppressed**
(the statement continues on the next line) in two cases:

**Case 1 — Trailing token:** The current line ends with any of:

| Token type | Examples |
|------------|---------|
| Binary operators | `+`, `-`, `*`, `/`, `%`, `==`, `!=`, `<`, `>`, `<=`, `>=`, `&&`, `\|\|`, `??` |
| Assignment operators | `=`, `:=`, `+=`, `-=`, `*=`, `/=`, `%=` |
| Comma | `,` |
| Open bracket or parenthesis | `(`, `[`, `{` |
| Member access dot | `.` |
| Lambda arrow | `=>` |

**Case 2 — Leading dot:** The *next* line begins with `.`. The lexer peeks one
token across the newline to detect this.

Leading-dot style is the **recommended form** for multi-line method chains:

```grob
// Recommended — leading dot
result := files
    .filter(f => f.extension == ".log")
    .map(f => f.name)
    .sort()

// Also valid — trailing dot
result := files.
    filter(f => f.extension == ".log").
    map(f => f.name).
    sort()

// Multi-line expression — trailing operator
total := price
    + tax
    + shipping

// Multi-line function call — trailing comma
result := someFunction(
    arg1,
    arg2
)

// Multi-line array literal
items := [
    "alpha",
    "beta",
    "gamma"
]
```

Both cases are implemented entirely in the lexer. The parser receives a clean
token stream with newlines already resolved. No explicit continuation character.
No semicolons.

-----

*Document created April 2026 — language fundamentals design session.*
*Authorised decisions recorded in decisions-log.md.*
*This document is the implementation reference — the decisions log is the authority.*
