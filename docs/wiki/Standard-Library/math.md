# math — Mathematics

Mathematical functions and constants. Core module — auto-available, no import
required.

`math` does not duplicate `abs`, `floor`, `ceil`, `round`, `clamp`, `min` or
`max` — those live on the type registry as instance or static methods. No
overlap by design.

## Constants

| Constant | Type | Value |
|----------|------|-------|
| `math.pi` | `float` | 3.14159265358979... |
| `math.e` | `float` | 2.71828182845904... |
| `math.tau` | `float` | 6.28318530717958... |

## Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `math.sqrt(n: float)` | `→ float` | Square root. Throws `RuntimeError` if n < 0 |
| `math.pow(base: float, exp: float)` | `→ float` | Exponentiation |
| `math.log(n: float)` | `→ float` | Natural logarithm. Throws if n ≤ 0 |
| `math.log10(n: float)` | `→ float` | Base-10 logarithm |

## Trigonometry (radians)

| Function | Signature |
|----------|-----------|
| `math.sin(n: float)` | `→ float` |
| `math.cos(n: float)` | `→ float` |
| `math.tan(n: float)` | `→ float` |
| `math.asin(n: float)` | `→ float` |
| `math.acos(n: float)` | `→ float` |
| `math.atan(n: float)` | `→ float` |
| `math.atan2(y: float, x: float)` | `→ float` |
| `math.toRadians(degrees: float)` | `→ float` |
| `math.toDegrees(radians: float)` | `→ float` |

## Random

| Function | Signature | Description |
|----------|-----------|-------------|
| `math.random()` | `→ float` | Uniform [0.0, 1.0) |
| `math.randomInt(min: int, max: int)` | `→ int` | Inclusive both ends |
| `math.randomSeed(seed: int)` | `→ void` | Deterministic testing |

## Examples

### Pythagorean distance

```grob
fn distance(x1: float, y1: float, x2: float, y2: float): float {
    dx := x2 - x1
    dy := y2 - y1
    return math.sqrt(math.pow(dx, 2.0) + math.pow(dy, 2.0))
}
```

### Random selection

```grob
names := ["Alice", "Bob", "Charlie", "Diana"]
index := math.randomInt(0, names.length - 1)
print("Selected: ${names[index]}")
```
