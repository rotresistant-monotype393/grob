# ADR-0011: NuGet as Plugin Registry

**Status:** Accepted
**Date:** April 2026
**Decision:** NuGet is the package registry for Grob plugins.

## Context

Grob needs a package registry for plugin discovery, hosting and distribution.
Building a custom registry is significant infrastructure. The question was
whether an existing registry could serve.

## Decision

NuGet. Plugins are NuGet packages tagged `grob-plugin`. `grob search` queries
the NuGet API filtered by tag. `grob install` downloads from NuGet.

## Alternatives Considered

**Custom registry** — full control but significant infrastructure to build,
host and maintain. Disproportionate effort for a hobbyist project.

**GitHub Releases** — no central discovery. Users would need to know the exact
repository URL. No version resolution.

**npm** — mature registry but designed for JavaScript. Grob plugins are C#
class libraries; NuGet is the natural home.

## Consequences

Positive: zero infrastructure to maintain. Versioning, hosting, push, search
and download are all provided by the NuGet ecosystem. Familiar to .NET
developers.

Negative: NuGet is primarily a .NET package registry. Grob plugins sharing the
registry with .NET libraries may cause discovery noise. Mitigated by the
`grob-plugin` tag filter — `grob search` only returns tagged packages.

Semantic versioning and `^` compatible version constraints follow npm
conventions, not NuGet's default behaviour. This is documented and enforced by
the `grob install` tooling.
