# regex — Regular Expressions

Pattern matching, replacement and extraction. Core module — auto-available, no
import required. Powered by the .NET regex engine.

## Regex Literals

```grob
pattern := /\d{3}-\d{4}/
email   := /^[\w.]+@[\w.]+$/i
```

Regex literals are delimited by `/`. Supported flags: `i` (case-insensitive),
`m` (multiline `^`/`$`). Compiled once at declaration.

The `/` character is disambiguated by context: after an operator, assignment or
opening paren it starts a regex literal. After a value it is the division
operator.

## Module Convenience Functions

One-shot functions that take string patterns. Compile on each call — for repeated
use, prefer regex literals.

| Function | Signature | Description |
|----------|-----------|-------------|
| `regex.isMatch(pattern, input)` | `→ bool` | Test for match |
| `regex.match(pattern, input)` | `→ Match?` | First match or nil |
| `regex.matchAll(pattern, input)` | `→ Match[]` | All matches |
| `regex.replace(pattern, input, replacement)` | `→ string` | Replace first |
| `regex.replaceAll(pattern, input, replacement)` | `→ string` | Replace all |
| `regex.split(pattern, input)` | `→ string[]` | Split on pattern |
| `regex.escape(input: string)` | `→ string` | Escape special characters |

## Regex Type Methods

See [Regex type registry](../Type-Registry/Regex.md).

| Method | Signature | Description |
|--------|-----------|-------------|
| `isMatch(input)` | `→ bool` | Fast existence check |
| `match(input)` | `→ Match?` | First match or nil |
| `matchAll(input)` | `→ Match[]` | All non-overlapping matches |
| `replace(input, replacement)` | `→ string` | Replace first |
| `replaceAll(input, replacement)` | `→ string` | Replace all |
| `split(input)` | `→ string[]` | Split on pattern |

## The Match Type

See [Match type registry](../Type-Registry/Match.md).

| Member | Type | Description |
|--------|------|-------------|
| `value` | `string` | Matched text |
| `index` | `int` | Zero-based position |
| `length` | `int` | Length of match |
| `groups` | `string[]` | Capture groups (`[0]` is full match) |
| `group(name)` | `→ string?` | Named capture group |

## Examples

### Filter log lines

```grob
pattern := /ERROR|WARN/i

for line in fs.readLines("C:\\Logs\\app.log") {
    if (pattern.isMatch(line)) {
        print(line)
    }
}
```

### Extract data with named groups

```grob
pattern := /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/

m := pattern.match("Created on 2026-04-05")
if (m != nil) {
    year  := m.group("year")
    month := m.group("month")
    print("Year: ${year}, Month: ${month}")
}
```

### Replace in file content

```grob
content := fs.readText("C:\\config.txt")
updated := /version=\d+\.\d+/.replaceAll(content, "version=2.0")
fs.writeText("C:\\config.txt", updated)
```

## Notes

String literals are never implicitly treated as regex patterns. The regex
literal syntax is a grammar addition — `/pattern/flags` is always explicit.
The full .NET regex feature set is available including named groups and
lookaheads.
