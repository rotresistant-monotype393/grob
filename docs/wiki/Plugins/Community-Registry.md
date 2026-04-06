# Community Plugin Registry

Community plugins are built and maintained by their authors. The Grob project
does not review or maintain them.

> **Loading a plugin is equivalent to running arbitrary code.** It executes with
> full .NET permissions on your machine. Always review plugin source or satisfy
> yourself the author is trustworthy before installing. Presence in this registry
> is not an endorsement of safety or quality.

## Registry

| Plugin | Author | Alias | Description | Repo |
|--------|--------|-------|-------------|------|
| *Be the first* | | | | |

## Listing Your Plugin

Open a pull request adding a row to the registry table above. The bar is low:

- The repo exists and has a README
- The plugin is published to NuGet tagged `grob-plugin`
- The naming convention is followed (`Org.Name` format)
- A licence file is present (MIT preferred)

We are not reviewing plugin code as part of the listing PR.

### PR Checklist

- Plugin published to NuGet with `grob-plugin` tag
- README includes: what the plugin does, install command, import alias, function
  signatures, at least one example Grob script
- Licence file present
- Naming convention followed
- Tested against current stable Grob runtime version (state the version)
- Row added to the registry table above

Title your PR: `chore: add YourPlugin to community registry`

See also: [Writing Plugins](Writing-Plugins.md), [Overview](Overview.md)
