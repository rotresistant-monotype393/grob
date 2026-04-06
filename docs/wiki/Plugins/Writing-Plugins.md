# Writing Plugins

## Minimal Example

```csharp
using Grob.Runtime;

public class HelloPlugin : IGrobPlugin
{
    public string Name => "AcmeCorp.Hello";

    public void Register(GrobVM vm)
    {
        vm.RegisterNative(
            name: "hello.greet",
            signature: new FunctionSignature(
                parameters: [new Parameter("name", GroType.String)],
                returnType: GroType.String
            ),
            implementation: args => {
                var name = args[0].AsString();
                return new StringValue($"Hello, {name}!");
            }
        );
    }
}
```

Build as a class library targeting the same .NET version as the Grob runtime.
Reference the `Grob.Runtime` NuGet package for interfaces and types.

## During Development

```
grob run script.grob --dev-plugin C:\dev\bin\Debug\MyPlugin.dll
```

`--dev-plugin` is a development tool only. Published plugins are loaded via
`import` after `grob install`.

## Conventions

**Namespace your functions** — prefix all names with your plugin's alias:
`xml.parse()`, `pnp.getSite()`.

**Register type signatures** — always provide a `FunctionSignature`. This gives
scripts compile-time type safety.

**Fail with `GrobRuntimeException`** — do not let raw C# exceptions surface.

**Document your functions** — README with signatures, descriptions and examples.

## Naming

| Name | Valid |
|------|-------|
| `Grob.Xml` | Yes — first-party style |
| `AcmeCorp.Xml` | Yes — community style |
| `MyXmlPlugin` | No — will not appear in `grob search` |

## Generic Functions

Plugins that expose generic functions (like `mapAs<T>()`) must express type
parameters via `FunctionSignature` in `Grob.Runtime`. This is designed into the
SDK from the start.

## Recommended Repository Structure

```
grob-plugin-xml/
├── src/
│   └── AcmeCorp.Xml/
│       ├── AcmeCorp.Xml.csproj
│       ├── XmlPlugin.cs
│       └── ...
├── tests/
│   └── AcmeCorp.Xml.Tests/
├── examples/
│   └── parse-config.grob
├── README.md
└── LICENSE
```

## Publishing

Publish to NuGet with the `grob-plugin` tag. This makes the plugin discoverable
via `grob search`.

`Grob.Runtime` is versioned independently from the runtime. Your plugin declares
which version it targets — this is the compatibility contract.

See also: [Overview](Overview.md), [Community Registry](Community-Registry.md)
