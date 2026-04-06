# float — Type Registry

All members known to the type checker at compile time. Calling an undefined
member is a compile error.

## Methods

| Member | Signature | Notes |
|--------|-----------|-------|
| `toString()` | `→ string` | |
| `toInt()` | `→ int` | Truncates — does not round |
| `round()` | `→ int` | Nearest integer |
| `round(decimals: int)` | `→ float` | Round to N decimal places |
| `floor()` | `→ int` | |
| `ceil()` | `→ int` | |
| `abs()` | `→ float` | |

## Static Functions

| Member | Signature | Notes |
|--------|-----------|-------|
| `float.min(a, b)` | `(float, float) → float` | |
| `float.max(a, b)` | `(float, float) → float` | |
| `float.clamp(v, lo, hi)` | `(float, float, float) → float` | |

## Literals

```grob
3.14            // standard
0.5             // leading zero required — .5 is not valid
1.5e10          // scientific notation
2.3E-4          // E case-insensitive
```

## Examples

```grob
x := 3.7
x.toInt()                  // 3 (truncates)
x.round()                  // 4
x.floor()                  // 3
x.ceil()                   // 4

ratio := 2.0 / 3.0
ratio.round(2)             // 0.67

float.clamp(1.5, 0.0, 1.0)  // 1.0
```
