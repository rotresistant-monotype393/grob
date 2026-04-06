# Grob — Built-in Type Method Registry

> Compiler-known methods and properties per built-in type.
> Decisions authorised in the decisions log — April 2026 design sessions.
> This document is the implementation reference for the type checker and
> compiler — it defines the complete set of members registered on each type.
> Calling anything not in this registry is a compile error.
> When this document and the decisions log conflict, the decisions log wins.

-----

All method calls on primitives are rewritten to native function calls at compile
time — no boxing, no vtable, no heap allocation.

-----

## `string`

|Member                                            |Kind    |Signature   |Notes                                                    |
|--------------------------------------------------|--------|------------|---------------------------------------------------------|
|`length`                                          |property|`→ int`     |                                                         |
|`isEmpty`                                         |property|`→ bool`    |                                                         |
|`toInt()`                                         |method  |`→ int?`    |Returns nil if not parseable                             |
|`toFloat()`                                       |method  |`→ float?`  |Returns nil if not parseable                             |
|`trim()`                                          |method  |`→ string`  |Removes leading and trailing whitespace                  |
|`trimStart()`                                     |method  |`→ string`  |Removes leading whitespace only                          |
|`trimEnd()`                                       |method  |`→ string`  |Removes trailing whitespace only                         |
|`upper()`                                         |method  |`→ string`  |                                                         |
|`lower()`                                         |method  |`→ string`  |                                                         |
|`split(sep: string)`                              |method  |`→ string[]`|                                                         |
|`contains(s: string)`                             |method  |`→ bool`    |                                                         |
|`startsWith(s: string)`                           |method  |`→ bool`    |                                                         |
|`endsWith(s: string)`                             |method  |`→ bool`    |                                                         |
|`replace(from: string, to: string)`               |method  |`→ string`  |Replaces all occurrences                                 |
|`indexOf(s: string)`                              |method  |`→ int`     |First occurrence; -1 if not found                        |
|`lastIndexOf(s: string)`                          |method  |`→ int`     |Last occurrence; -1 if not found                         |
|`substring(start: int, length: int)`              |method  |`→ string`  |Zero-based start; throws `RuntimeError` if out of range  |
|`padLeft(width: int, char: string = " ")`         |method  |`→ string`  |Pads to total width on the left                          |
|`padRight(width: int, char: string = " ")`        |method  |`→ string`  |Pads to total width on the right                         |
|`repeat(count: int)`                              |method  |`→ string`  |Repeats the string n times                               |
|`truncate(maxLength: int, suffix: string = "...")`|method  |`→ string`  |Truncates to max length; appends suffix if truncated     |
|`left(n: int)`                                    |method  |`→ string`  |First `n` characters. Throws `RuntimeError` if n > length|
|`right(n: int)`                                   |method  |`→ string`  |Last `n` characters. Throws `RuntimeError` if n > length |

-----

## `int`

|Member                |Kind  |Signature              |Notes          |
|----------------------|------|-----------------------|---------------|
|`toString()`          |method|`→ string`             |               |
|`toFloat()`           |method|`→ float`              |Always succeeds|
|`abs()`               |method|`→ int`                |               |
|`int.min(a, b)`       |static|`(int, int) → int`     |               |
|`int.max(a, b)`       |static|`(int, int) → int`     |               |
|`int.clamp(v, lo, hi)`|static|`(int, int, int) → int`|               |

-----

## `float`

|Member                  |Kind  |Signature                      |Notes                     |
|------------------------|------|-------------------------------|--------------------------|
|`toString()`            |method|`→ string`                     |                          |
|`toInt()`               |method|`→ int`                        |Truncates — does not round|
|`round()`               |method|`→ int`                        |Nearest integer           |
|`round(decimals: int)`  |method|`→ float`                      |Round to N decimal places |
|`floor()`               |method|`→ int`                        |                          |
|`ceil()`                |method|`→ int`                        |                          |
|`abs()`                 |method|`→ float`                      |                          |
|`float.min(a, b)`       |static|`(float, float) → float`       |                          |
|`float.max(a, b)`       |static|`(float, float) → float`       |                          |
|`float.clamp(v, lo, hi)`|static|`(float, float, float) → float`|                          |

-----

## `bool`

|Member      |Kind  |Signature |Notes                        |
|------------|------|----------|-----------------------------|
|`toString()`|method|`→ string`|Returns `"true"` or `"false"`|

-----

## `T[]` (All Arrays)

|Member                                     |Kind    |Signature|Notes                                                     |
|-------------------------------------------|--------|---------|----------------------------------------------------------|
|`length`                                   |property|`→ int`  |                                                          |
|`isEmpty`                                  |property|`→ bool` |                                                          |
|`first()`                                  |method  |`→ T?`   |nil if empty                                              |
|`last()`                                   |method  |`→ T?`   |nil if empty                                              |
|`contains(v: T)`                           |method  |`→ bool` |                                                          |
|`filter(fn: T → bool)`                     |method  |`→ T[]`  |                                                          |
|`map(fn: T → U)`                           |method  |`→ U[]`  |                                                          |
|`each(fn: T → void)`                       |method  |`→ void` |                                                          |
|`sort(fn: T → U, descending: bool = false)`|method  |`→ T[]`  |Returns new sorted array                                  |
|`select(fn: T → U)`                        |method  |`→ U[]`  |Projection — alias for map, reads better in data pipelines|

-----

## `File` (Returned by `fs.list()`)

|Member                   |Kind    |Signature |Notes                                    |
|-------------------------|--------|----------|-----------------------------------------|
|`name`                   |property|`→ string`|Filename with extension, no path         |
|`path`                   |property|`→ string`|Full absolute path                       |
|`directory`              |property|`→ string`|Parent directory path                    |
|`extension`              |property|`→ string`|Lowercased, includes dot — e.g. `.xlsx`  |
|`size`                   |property|`→ int`   |Size in bytes                            |
|`modified`               |property|`→ date`  |Last write time                          |
|`created`                |property|`→ date`  |Creation time                            |
|`isDirectory`            |property|`→ bool`  |True if entry is a directory             |
|`rename(newName: string)`|method  |`→ void`  |Rename in place — new name only, not path|
|`moveTo(destDir: string)`|method  |`→ void`  |Move to destination directory            |
|`copyTo(destDir: string)`|method  |`→ void`  |Copy to destination directory            |
|`delete()`               |method  |`→ void`  |Delete the file                          |

-----

## `date` (Instance Methods — Additions)

The following are additions to the `date` type registry confirmed in this session.
The full construction, parsing, formatting, arithmetic, comparison, component, epoch,
and timezone members are specified in the confirmed decisions table (Apr 2026,
`date module — API`).

|Member                  |Kind  |Signature|Notes                                                           |
|------------------------|------|---------|----------------------------------------------------------------|
|`daysUntil(other: date)`|method|`→ int`  |Positive if `other` is later than receiver; negative if reversed|
|`daysSince(other: date)`|method|`→ int`  |Positive if receiver is later than `other`; negative if reversed|

-----

## `strings` Module

|Member                                                 |Signature |Notes                                                                                       |
|-------------------------------------------------------|----------|--------------------------------------------------------------------------------------------|
|`strings.join(parts: string[], separator: string = "")`|`→ string`|Joins array with separator. Receiver is an array — cannot be an instance method on `string`.|

-----

## `csv.Table` (Returned by `csv.read()`, `csv.parse()`, `csv.stdin()`)

|Member      |Kind    |Signature   |Notes                                                      |
|------------|--------|------------|-----------------------------------------------------------|
|`headers`   |property|`→ string[]`|Empty array if `hasHeaders: false`                         |
|`rowCount`  |property|`→ int`     |Number of data rows                                        |
|`rows`      |property|`→ CsvRow[]`|All rows as raw access                                     |
|`mapAs<T>()`|method  |`→ T[]`     |Typed deserialisation — string-to-type coercion at boundary|

-----

## `CsvRow`

|Member             |Kind   |Signature |Notes                                                                |
|-------------------|-------|----------|---------------------------------------------------------------------|
|`get(name: string)`|method |`→ string`|By header name. Throws `RuntimeError` if no headers or name not found|
|`get(index: int)`  |method |`→ string`|By zero-based index. Throws `RuntimeError` if out of range           |
|`[name: string]`   |indexer|`→ string`|Sugar for `get(name)`                                                |
|`[index: int]`     |indexer|`→ string`|Sugar for `get(index)`                                               |

-----

## `Regex` (Regex Literal `/pattern/flags`)

|Member                                          |Kind    |Signature   |Notes                                       |
|------------------------------------------------|--------|------------|--------------------------------------------|
|`pattern`                                       |property|`→ string`  |The source pattern string                   |
|`flags`                                         |property|`→ string`  |Active flags, e.g. `"i"` or `"im"`          |
|`isMatch(input: string)`                        |method  |`→ bool`    |Fast existence check — no `Match` allocation|
|`match(input: string)`                          |method  |`→ Match?`  |First match or nil                          |
|`matchAll(input: string)`                       |method  |`→ Match[]` |All non-overlapping matches                 |
|`replace(input: string, replacement: string)`   |method  |`→ string`  |Replace first match                         |
|`replaceAll(input: string, replacement: string)`|method  |`→ string`  |Replace all matches                         |
|`split(input: string)`                          |method  |`→ string[]`|Split on pattern                            |

-----

## `Match` (Returned by `Regex.match()` and `Regex.matchAll()`)

|Member               |Kind    |Signature   |Notes                                                                     |
|---------------------|--------|------------|--------------------------------------------------------------------------|
|`value`              |property|`→ string`  |The matched text                                                          |
|`index`              |property|`→ int`     |Zero-based position in input                                              |
|`length`             |property|`→ int`     |Length of match                                                           |
|`groups`             |property|`→ string[]`|Capture groups. `groups[0]` is full match; `groups[1]`+ are capture groups|
|`group(name: string)`|method  |`→ string?` |Named capture group. Nil if not present                                   |

-----

*This registry will grow as stdlib design progresses. Add entries here when locked.*

-----

*Document created April 2026 — extracted from Grob___Decisions___Context_Log.md.*
*Authorised decisions recorded in Grob___Decisions___Context_Log.md.*
*This document is the implementation reference — the decisions log is the authority.*
