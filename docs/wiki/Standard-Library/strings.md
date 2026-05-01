# strings — String Utilities

String module function. Core module — auto-available, no import required.

The `strings` module contains one function. All other string operations are
instance methods on the `string` type. See [string type registry](../Type-Registry/string.md).

## Module Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `strings.join(parts: string[], separator: string = "")` | `→ string` | Join array elements with separator |

`strings.join()` lives on the module because its receiver is an array, not a
string instance. There is no `strings.split()` — `"value".split(sep)` is already
an instance method on the type.

## Examples

### Join an array of strings

```grob
names := ["Alice", "Bob", "Charlie"]
result := strings.join(names, ", ")
print(result)   // Alice, Bob, Charlie
```

### Join path segments (prefer `path.join()` for file paths)

```grob
parts := ["home", "chris", "documents"]
result := strings.join(parts, "\\")
```

## All Other String Operations

Instance methods and properties on the `string` type:

```grob
name := "  Hello World  "
name.trim()                  // "Hello World"
name.upper()                 // "  HELLO WORLD  "
name.lower()                 // "  hello world  "
name.length                  // 15
name.contains("World")       // true
name.startsWith("  He")      // true
name.replace("World", "Grob") // "  Hello Grob  "
name.split(" ")              // ["", "", "Hello", "World", "", ""]
```

See [string type registry](../Type-Registry/string.md) for the complete member
list.
