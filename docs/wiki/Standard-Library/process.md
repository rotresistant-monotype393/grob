# process — External Command Execution

Run external commands and capture output. Core module — auto-available, no
import required.

## Module Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `process.run(cmd: string, args: string[])` | `→ ProcessResult` | Safe form — no shell interpolation |
| `process.runOrFail(cmd: string, args: string[])` | `→ ProcessResult` | Safe form — throws on non-zero exit |
| `process.runShell(cmd: string)` | `→ ProcessResult` | Shell form — full command string |
| `process.runShellOrFail(cmd: string)` | `→ ProcessResult` | Shell form — throws on non-zero exit |

## `ProcessResult` Type

| Member | Type | Description |
|--------|------|-------------|
| `stdout` | `string` | Standard output |
| `stderr` | `string` | Standard error |
| `exitCode` | `int` | Process exit code |

## Safe vs Shell Form

`process.run()` is the primary form — arguments are never shell-interpolated,
preventing command injection. Use it whenever any argument comes from data (user
input, API responses, file content, environment variables).

`process.runShell()` passes the full command string to the shell. Use it only
when the command is a known trusted literal where shell interpretation is wanted.
The name makes shell involvement explicit.

The safe path has the shorter name by design.

## Examples

### Run a command safely

```grob
result := process.run("az", ["group", "show", "--name", group_name])
print(result.stdout)
```

### Fail fast

```grob
process.runOrFail("git", ["commit", "-m", message])
```

If the command returns a non-zero exit code, `runOrFail` throws `ProcessError`.

### Shell form for trusted commands

```grob
result := process.runShell("az bicep build --file main.bicep")
```

### Check exit code

```grob
result := process.run("git", ["status", "--porcelain"])
if (result.exitCode != 0) {
    log.error("Git status failed: ${result.stderr}")
    exit(1)
}
```

## Error Behaviour

`process.run()` and `process.runShell()` do not throw on non-zero exit codes —
check `exitCode` manually. `process.runOrFail()` and `process.runShellOrFail()`
throw `ProcessError` on any non-zero exit code.

## Security

`process.run(cmd, args[])` prevents command injection by never interpolating
arguments through a shell. This is the safe default and the recommended form for
all scripts. `process.runShell()` makes shell involvement visible at the call
site — the risk is documented, not hidden.
