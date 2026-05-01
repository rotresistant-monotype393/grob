# ADR-0007: Windows-First Design

**Status:** Accepted
**Date:** April 2026
**Decision:** Grob is designed Windows-first. All paths, examples and tooling default to Windows conventions.

## Context

Most scripting tools are designed for Unix and adapted to Windows as an
afterthought. PowerShell is the notable exception but its syntax is hostile.
Grob's primary developer and target user base are on Windows.

## Decision

Windows-native by default:

- All documentation examples use Windows paths (`C:\\Reports`, not `./reports`)
- No `cat`, `ls` or other Unix-isms in documentation
- `winget install Grob.Grob` as the primary install method
- Windows Terminal profile ships with Grob
- `path.separator` returns `\` on Windows
- Install paths use `%USERPROFILE%` and `%ProgramFiles%`

Cross-platform is not excluded — .NET runs on Linux and macOS. But Windows is
the design target, not a second-class citizen.

## Alternatives Considered

**Unix-first** — the default for most language tooling. Would alienate the
primary user base and miss the opportunity to serve Windows developers who are
underserved by scripting tools.

**Platform-neutral** — use only relative paths and avoid platform-specific
conventions in docs. Produces documentation that helps nobody concretely.

## Consequences

Positive: Windows developers see themselves in the documentation immediately.
Install experience is native and frictionless.

Negative: Linux and macOS users see Windows paths in examples. This is
documented as intentional. Path-handling functions (`path.join()`,
`path.normalise()`) are platform-aware at runtime.
