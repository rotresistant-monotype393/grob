# Grob — Standard Library Reference

> Reference document for the standard library module shapes, built-in functions,
> conditional expressions, and lambda/closure semantics.
> Decisions authorised in the decisions log — April 2026 design sessions.
> This document is the implementation reference for stdlib module APIs and
> language-level expression forms confirmed during stdlib design.
> When this document and the decisions log conflict, the decisions log wins.

-----

## Core Modules — Auto-Available

These modules are always in scope. No `import` statement needed.
If a reasonable developer expects it in any scripting language, it's core.

|Module   |Purpose                                                                                                     |Status   |
|---------|------------------------------------------------------------------------------------------------------------|---------|
|`fs`     |File system — list, read, write, rename, copy, move, delete, traverse                                       |Specified|
|`strings`|String operations — `join()` module function; all other ops are instance methods on the `string` type       |Specified|
|`process`|External command execution — `run()`, `runOrFail()`, `runShell()`, `runShellOrFail()`, capture stdout/stderr|Specified|
|`env`    |Environment variables — `get(key): string?`, `require(key): string`                                         |Specified|
|`json`   |JSON parse/serialise — `read()`, `write()`, `parse()`, `stdin()`, `stdout()`, `Node` type                   |Specified|
|`date`   |Date/time — single type, full arithmetic, timezone/UTC, Unix epoch, parse/format                            |Specified|
|`csv`    |CSV parse/serialise — `read()`, `write()`, `parse()`, `stdin()`, `stdout()`, `Table` and `CsvRow` types     |Specified|
|`log`    |Structured logging — four levels, all to stderr, `setLevel()`, `--verbose` for debug                        |Specified|
|`regex`  |Regular expressions — `/pattern/flags` literal type, `Match` type, module convenience functions             |Specified|
|`path`   |Path manipulation — `join()`, `joinAll()`, decompose, normalise, OS separator constant                      |Specified|
|`math`   |Maths — sqrt, pow, log, trig, random, constants `pi`/`e`/`tau`                                              |Specified|
|`format` |Output formatting — `table()`, `list()`, `csv()`, numeric and date patterns                                 |Specified|

-----

## First-Party Plugins — Explicit Import Required

```grob
import Grob.Http   // http.* and auth.* both available — auth is a sub-namespace, not a separate plugin
```

Install once:

```bash
grob install Grob.Http
```

|Module       |Purpose                                                                                                               |
|-------------|----------------------------------------------------------------------------------------------------------------------|
|`Grob.Http`  |HTTP client — `get()`, `post()`, `put()`, `patch()`, `delete()`, `download()`, `auth.*` sub-namespace, `Response` type|
|`Grob.Crypto`|Checksums and hashing — MD5, SHA256, file integrity                                                                   |
|`Grob.Zip`   |Archive — compress and expand zip archives                                                                            |

-----

### `Grob.Http` — Shape (Sketch)

```grob
import Grob.Http
// http.* and auth.* both available — auth is a sub-namespace, not a separate install

// GET
response := http.get(url)
response := http.get(url, auth.bearer(token))
response := http.get(url, auth.bearer(token), headers: #{ "X-Api-Version": "2024-01-01" })

// POST / PUT / PATCH
response := http.post(url, body)
response := http.post(url, body, auth.bearer(token))
response := http.put(url, body, auth.bearer(token))
response := http.patch(url, body, auth.bearer(token))

// DELETE — no body
response := http.delete(url, auth.bearer(token))

// Timeout override (default is 30 seconds)
response := http.get(url, auth.bearer(token), timeoutSeconds: 60)

// File download — streaming to disk, does not load into memory
http.download(url, "C:\\downloads\\file.zip")
http.download(url, "C:\\downloads\\file.zip", auth.bearer(token))

// Response — properties and methods
response.statusCode     // int — 200, 404, etc.
response.isSuccess      // bool — true if statusCode 200–299
response.headers        // map<string, string>
response.asText()       // → string
response.asJson()       // → json.Node  (throws JsonError if body is not valid JSON)

// Auth helpers
auth.bearer(token: string) → AuthHeader
auth.basic(username: string, password: string) → AuthHeader
auth.apiKey(key: string, headerName: string = "X-Api-Key") → AuthHeader
```

`AuthHeader` is an opaque type — the type checker knows it as `Grob.Http.AuthHeader`
and only `http.*` functions accept it. It is not constructable directly.

`http.download()` streams to disk — it does not load the response body into memory.
Use this for file downloads. `fs.writeText(path, http.get(url).asText())` is valid
for small text files but is not appropriate for binary or large file downloads.

-----

### Community Plugins — Explicit Import Required

Any C# class library implementing `IGrobPlugin`. Published to NuGet tagged `grob-plugin`.
Loaded via `import` after `grob install`. The `import` lines are the dependency manifest.

```grob
import AcmeCorp.Xml           // alias: xml.*
import AcmeCorp.Xml as parser // explicit alias — collision resolution only
```

-----

### `env` Module — Detail

```grob
PAT   := env.require("ADO_PAT")          // hard fail with clear error if missing
days  := env.get("STALE_DAYS")?.toInt() ?? 30   // nil-safe, with default
```

`env.get()` returns `string?`. `env.require()` returns `string` — never nil, fails
fast if the variable is absent. This distinction matters for script safety.

-----

### `process` Module — Shape (Sketch)

```grob
// Safe form — use when any argument comes from data (the default choice)
// Arguments are never shell-interpolated — prevents command injection
result := process.run("az", ["group", "show", "--name", groupName])
print(result.stdout)
print(result.exitCode)

// Shell form — use when command is a known trusted literal
// Name makes shell involvement explicit
result := process.runShell("az group list")

// Fail fast if command fails
process.runOrFail("git", ["commit", "-m", message])
process.runShellOrFail("az bicep build --file main.bicep")
```

Returns a `ProcessResult` type with `stdout: string`, `stderr: string`, `exitCode: int`.

`process.run()` is the primary form — the safe path has the shorter name. Use it
whenever any argument comes from data (user input, API responses, file content,
environment variables). `process.runShell()` is available for full command strings
where shell interpretation is intentional. The distinction is documented prominently.

-----

### `json` Module — Shape (Sketch)

```grob
// File input — primary pattern
repos := json.read("repos.json").mapAs<Repo>()

// File output
json.write("results.json", results)

// Parse a string (e.g. process output, API response body)
node := json.parse(someString)

// Pipeline entry/exit — stdin/stdout forms for pipeline composition and agent use cases
repos := json.stdin().mapAs<Repo>()
json.stdout(results)

// Navigate a node
name := node["name"].asString()
items := node["items"].asArray()
```

`json.read()` and `json.write()` are the primary forms — file-based, Windows-native,
no shell piping required. `json.stdin()` and `json.stdout()` are valid on all
platforms and exist for genuine pipeline composition (agent hooks, CI stages).
Examples lead with file-read; stdin shown as the pipeline variant.

-----

### `date` Module — Shape

```grob
// Current moment
now   := date.now()           // date and time
today := date.today()         // date only, time zeroed

// Construction
d := date.of(2026, 4, 5)
t := date.ofTime(2026, 4, 5, 14, 30, 0)

// Parsing
d := date.parse("2026-04-05")               // ISO 8601 default
d := date.parse("05/04/2026", "dd/MM/yyyy") // explicit pattern

// Formatting
d.toIso()                     // "2026-04-05"
d.toIsoDateTime()             // "2026-04-05T14:30:00Z"
d.format("dd MMM yyyy")       // "05 Apr 2026"
d.format("dd/MM/yyyy HH:mm")  // "05/04/2026 14:30"

// Arithmetic
d.addDays(7)
d.minusDays(30)
d.addMonths(3)
d.addHours(2)
d.addMinutes(30)

// Comparison — operators and methods
d1 < d2
d1 > d2
d1 == d2
d.isBefore(other)
d.isAfter(other)

// Components — all properties, no ()
d.year
d.month
d.day
d.hour
d.minute
d.second
d.dayOfWeek    // "Monday" etc
d.dayOfYear

// Unix epoch
d.toUnixSeconds()
d.toUnixMillis()
date.fromUnixSeconds(epoch)
date.fromUnixMillis(epoch)

// Timezone and UTC
d.toUtc()
d.toLocal()
d.toZone("Europe/London")
d.utcOffset    // minutes as int

// Interval computation
created.daysUntil(date.today())   // positive if today is later
date.today().daysSince(created)   // same result, different direction
```

-----

### `format` Module — Shape (Sketch)

```grob
// Table output — auto-columns from struct fields
results.format.table()

// Table output — explicit columns
results.format.table(["repo", "staleCount", "asOf"])

// List output — one item per line, key: value
results.format.list()

// CSV to stdout
results.format.csv()

// Typical pattern — filter, project, format
results
    .filter(r => r.staleCount > 0)
    .select(r => #{ repo: r.repo, stale: r.staleCount, asOf: r.asOf })
    .format.table()

// Numeric formatting — DEFERRED, no confirmed v1 use case
// value.format.number(decimals: 2)
// value.format.number(decimals: 0, separator: true)  // thousands separator

// Date formatting
d.format("dd MMM yyyy")   // on the date value itself — see date module
```

-----

### `fs` Module — Shape (Sketch)

```grob
// List files in a directory (non-recursive)
files := fs.list("C:\\Reports")

// List recursively
files := fs.list("C:\\Reports", recursive: true)

// File object properties
file.name        // "report_2026.xlsx"
file.path        // "C:\\Reports\\report_2026.xlsx"
file.directory   // "C:\\Reports"
file.extension   // ".xlsx"  — always lowercased, always includes dot
file.size        // 204800   — bytes
file.modified    // date value — last write time
file.created     // date value — creation time
file.isDirectory // false

// File object methods
file.rename("report_2025.xlsx")
file.moveTo("C:\\Archive")
file.copyTo("C:\\Backup")
file.delete()

// Module functions — existence checks
fs.exists("C:\\Reports\\file.txt")        // bool
fs.isFile("C:\\Reports\\file.txt")        // bool
fs.isDirectory("C:\\Reports")             // bool

// Directory creation
fs.ensureDir("C:\\Reports\\2026\\April")  // creates full path if not exists, no-op if exists
fs.createDir("C:\\Reports\\NewFolder")    // fails with IoError if already exists

// Deletion
fs.delete("C:\\Reports\\old.txt")         // file or empty dir — refuses non-empty dir (IoError)
fs.deleteRecursive("C:\\Reports\\Old")    // directory and all contents

// Read / write
content := fs.readText("C:\\config.json")
lines   := fs.readLines("C:\\data.txt")   // string[]
fs.writeText("C:\\output.txt", content)   // creates or overwrites
fs.appendText("C:\\log.txt", line)        // creates or appends

// Copy / move by path
fs.copy("C:\\source.txt", "C:\\dest.txt")
fs.move("C:\\source.txt", "C:\\dest.txt")
```

`File` is a built-in type registered by the `fs` stdlib plugin at startup — the type
checker knows its full shape. Calling an undefined property or method on a `File` value
is a compile error.

`file.extension` is always lowercased and always includes the dot — callers never need
to normalise it. `".jpg"`, `".xlsx"`, `".csv"` — always that form.

Two levels of delete by design: `fs.delete()` refuses a non-empty directory and throws
`IoError`. `fs.deleteRecursive()` makes the destructive intent explicit at the call site.

-----

## `exit()` — Built-in Function

```grob
exit()     // exit with code 0
exit(0)    // explicit success
exit(1)    // signal failure to calling process

// Typical usage — fail fast after error
try {
    process.runOrFail("az", ["version"])
} catch e {
    log.error("Azure CLI not found.")
    exit(1)
}

// Signal success/failure based on result
if (results.isEmpty) {
    log.warning("No results found.")
    exit(0)
}
```

`exit()` is not a module function — no namespace, always available, same category as
`print()`. When called inside a function, it throws an uncatchable internal `ExitSignal`
that unwinds the entire call stack. The VM catches it at the top level, flushes output
buffers, and terminates with the specified code. It cannot be caught with `try/catch`.

Default exit codes: normal completion → `0`. Unhandled `GrobError` → `1`.

-----

## Conditional Expressions

```grob
// Ternary — two-way inline choices
label  := isActive ? "on" : "off"
prefix := count == 1 ? "item" : "items"

// Switch expression — multi-branch value selection
status := used_pct switch {
    >= crit_percent => "CRITICAL",
    >= warn_percent => "WARNING",
    _               => "OK"
}

// Switch on a value directly
message := http_code switch {
    200 => "OK",
    404 => "Not found",
    500 => "Server error",
    _   => "Unknown"
}

// Switch expression result assigned or passed directly
log.info(http_code switch {
    200 => "Request succeeded",
    _   => "Request failed with code ${http_code}"
})
```

Ternary `? :` for simple two-way choices — familiar to every C#/Go developer, no
ceremony. Switch expression for multi-branch — C# 8 style, each arm is `pattern => value`,
`_` is the catch-all. The type checker enforces exhaustiveness: missing `_` when not all
cases are covered is a compile error. All arms must return the same type — mismatch is a
type error. No `if/else` in expression position — these two forms cover the use cases
without introducing a third syntax.

-----

## Lambdas and Closures

```grob
// Single-expression lambda
files.filter(f => f.extension == ".jpg")
branches.filter(b => !b.name.contains("HEAD"))

// Closure — captures variable from enclosing scope
cutoff := date.today().minusDays(staleDays)
branches.filter(b => date.parse(b.lastCommit) < cutoff)

// Multi-parameter lambda
items.sort((a, b) => a.size > b.size)

// Block-body lambda
raw.split("\n")
    .filter(line => line.length > 0)
    .map(line => {
        parts := line.split("|")
        #{ branch: parts[0], date: parts[1], author: parts[2] }
    })

// Anonymous struct literal in lambda — #{ } not { }
results.select(r => #{ repo: r.name, stale: r.staleCount, asOf: r.asOf })
```

`{ }` after a lambda arrow is always a block body. `#{ }` is always an anonymous struct
literal. The parser never has to guess — no ambiguity.

Closures capture variables from the enclosing scope. The upvalue mechanism follows clox:
while the enclosing function is active, the upvalue holds a reference to the stack slot.
When the enclosing function returns, the value is copied to the heap. Each capturing
lambda becomes a `Closure` object at runtime — a `BytecodeFunction` plus its upvalue array.

-----

*Document created April 2026 — extracted from Grob___Decisions___Context_Log.md.*
*Authorised decisions recorded in Grob___Decisions___Context_Log.md.*
*This document is the implementation reference — the decisions log is the authority.*
