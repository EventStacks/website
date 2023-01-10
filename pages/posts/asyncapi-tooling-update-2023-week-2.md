---
title: "AsyncAPI tooling update - Week 2"
date: 2023-01-10T16:00:00+01:00
type: Communication
tags:
  - AsyncAPI
  - Tooling
cover: /img/posts/tooling-update-2.webp
authors:
  - name: Jonas Lagoni
    photo: /img/avatars/jonaslagoni.webp
    link: https://github.com/jonaslagoni
    byline: AsyncAPI Maintainer
excerpt: 'Glee WebSocket client support, improved CLI and Modelina integration, Modelina generator tweaks, and NATS JetStream support for code generators!'
---

> This post bundles updates from the following official tools, but not limited to: [bundler](https://github.com/asyncapi/bundler), [chatbot](https://github.com/asyncapi/chatbot), [studio](https://github.com/asyncapi/studio), [diff](https://github.com/asyncapi/diff), [glee](https://github.com/asyncapi/glee), [create-glee-app](https://github.com/asyncapi/create-glee-app), [cli](https://github.com/asyncapi/cli), [optimizer](https://github.com/asyncapi/optimizer), [modelina](https://github.com/asyncapi/modelina), [generator](https://github.com/asyncapi/generator), [generator-react-sdk](https://github.com/asyncapi/generator-react-sdk), [java-template](https://github.com/asyncapi/java-template), [java-spring-cloud-stream-template](https://github.com/asyncapi/java-spring-cloud-stream-template), [java-spring-template](https://github.com/asyncapi/java-spring-template), [dotnet-nats-template](https://github.com/asyncapi/dotnet-nats-template) and [ts-nats-template](https://github.com/asyncapi/ts-nats-template).

You can find the last tooling update [here](/posts/asyncapi-tooling-update-week-46).

In case you want to read what other changes have been happening, you can get the overviews here:
- [Maciej](https://github.com/magicmatatjahu)'s latest [AsyncAPI design and documentation update](https://gist.github.com/magicmatatjahu/50e57e23cd91ceff20947dbf79a424f3)
- [Alejandra](https://twitter.com/QuetzalliAle)'s latest [AsyncAPI docs update](https://gist.github.com/alequetzalli/1df44522de1b0c66f3471e70b2b84945)
- [Barbaño](https://github.com/Barbanio)'s latest [AsyncAPI training update](https://gist.github.com/Barbanio/9390e74131219b1f80cc27b541857c1b)

## Highlights
These are some of the highlights of changes that have happened in the tools or what's to come! It of course does not cover all the changes but only certain ones.

### Glee 
Glee now supports [WebSocket client adapter](https://github.com/asyncapi/glee/pull/319) which enables you to use Glee for a WebSocket client. You can check out a [Crypto Glee example](https://github.com/asyncapi/glee/tree/master/examples/crypto-websockets) that contains both a server and client implementation.

Since AsyncAPI does not (yet, [#689](https://github.com/asyncapi/spec/issues/689), [#874](https://github.com/asyncapi/spec/pull/874)) support when a server is remote vs run locally, it uses the extension `x-remoteServers` to define when glee should act as a client or server.

An example [AsyncAPI document](https://github.com/asyncapi/glee/blob/master/examples/crypto-websockets/client/asyncapi.yaml).
```yaml
asyncapi: 2.5.0
info: 
  title: AsyncAPI coin WebSocket client
  version: 1.0.0
  description: |
    This app creates a client that subscribes to the server for the price change.
servers:
  websockets:
    url: ws://localhost:3000
    protocol: ws
x-remoteServers:
  - websockets
channels:
  /price:
    publish:
      operationId: index
      message:
        payload:
          type: object
          properties:
            status:
              type: string
            time:
              type: number
            price:
              type: number
```

You can then have a [Glee function that reacts to the server](https://github.com/asyncapi/glee/blob/master/examples/crypto-websockets/client/functions/index.ts) sending messages:
```js
export default async function (event) {
    const payload = event.payload
    switch (payload.status) {
        case 'started':
          ...
          break
        case 'intransit':
          ...
          break
        case 'finished':
          ...
    }
    return undefined;
}
```

### CLI
Currently, the Modelina integration within the CLI is very simple, with almost no customization, but now it supports a range of the [TypeScript options](https://github.com/asyncapi/cli/pull/384) where you can change the enum type (union or enum), export types (default or named), class type (interface or class), and which module system to target (ESM or CJS).

```
% asyncapi generate models typescript --help
Generates typed models

USAGE
  $ asyncapi generate models [LANGUAGE] [FILE] [-h] [-o <value>] [--tsModelType class|interface] [--tsEnumType enum|union] [--tsModuleSystem ESM|CJS] [--tsExportType default|named] [--packageName <value>] [--namespace <value>]

ARGUMENTS
  LANGUAGE  (typescript|csharp|golang|java|javascript|dart) The language you want the typed models generated for.
  FILE      Path or URL to the AsyncAPI document, or context-name

FLAGS
  -h, --help                 Show CLI help.
  -o, --output=<value>       The output directory where the models should be written to. Omitting this flag will write the models to `stdout`.
  --namespace=<value>        C# specific, define the namespace to use for the generated models. This is required when language is `csharp`.
  --packageName=<value>      Go and Java specific, define the package to use for the generated models. This is required when language is `go` or `java`.
  --tsEnumType=<option>      TypeScript specific, define which type of enums needs to be generated.
                             <options: enum|union>
  --tsExportType=<option>    TypeScript specific, define which type of export needs to be generated.
                             <options: default|named>
  --tsModelType=<option>     TypeScript specific, define which type of model needs to be generated.
                             <options: class|interface>
  --tsModuleSystem=<option>  TypeScript specific, define the module system to be used.
                             <options: ESM|CJS>
```

### Modelina
The model generators are becoming increasingly more accurate and slowly getting ready for its V1 release. Herein we had to figure out how versioning has to be [dealt with going forward](https://github.com/asyncapi/modelina/pull/991). 

> .... In short, any changes that change the generated outcome are not allowed as it's a breaking change for the consumer of the generated models.
> 
> Here is a list of changes we are allowed to do that would not require a breaking change:
> 
> - Adding new features (that do not change existing output), such as generators, presets, input processors, etc.
> - Change existing features, by providing options that default to current behavior. This could be a preset that adapts the output based on options, as long as the API of Modelina and the API of the generated models does not have any breaking changes.
> - Bug fixes where the generated code is otherwise unusable (syntax errors, etc).
> 
> Breaking changes are allowed and expected at a frequent rate, of course where it makes sense we will try to bundle multiple changes together.

Read the full description here: https://github.com/asyncapi/modelina/tree/next#versioning-and-maintenance

#### Rust

[Union types now generate more accurate namings](https://github.com/asyncapi/modelina/pull/1056) as before a union was generated as such:
```rust
// VideoSource represents a union of types: Camera0, PlaybackVideo1
#[derive(Clone, Debug, Deserialize, Eq, Hash, Ord, PartialEq, PartialOrd, Serialize)]
pub enum VideoSource {
  #[serde(rename="Camera0")]
  Camera0(crate::Camera),
  #[serde(rename="PlaybackVideo1")]
  PlaybackVideo1(crate::PlaybackVideo),
}
```
Which is now generated as:
```rust
// VideoSource represents a union of types: Camera, PlaybackVideo
#[derive(Clone, Debug, Deserialize, Eq, Hash, Ord, PartialEq, PartialOrd, Serialize)]
pub enum VideoSource {
  #[serde(rename="Camera")]
  Camera(crate::Camera),
  #[serde(rename="PlaybackVideo")]
  PlaybackVideo(crate::PlaybackVideo),
}
```

#### C#
The C# generator now [accurately generates optional and required properties](https://github.com/asyncapi/modelina/pull/1051). 

```json
{
  "$schema":"http://json-schema.org/draft-07/schema#",
  "type":"object",
  "additionalProperties":false,
  "properties":{
    "requiredBoolean":{
      "type":"boolean"
    },
    "notRequiredBoolean":{
      "type":"boolean"
    },
    "requiredString":{
      "type":"string"
    },
    "notRequiredString":{
      "type":"string"
    }
  },
  "required":[
    "requiredBoolean",
    "requiredString"
  ]
}
```

```csharp
public class Root
{
  private bool requiredBoolean;
  private bool? notRequiredBoolean;
  private string requiredString;
  private string? notRequiredString;
  public bool RequiredBoolean 
  {
    get { return requiredBoolean; }
    set { requiredBoolean = value; }
  }
  public bool? NotRequiredBoolean 
  {
    get { return notRequiredBoolean; }
    set { notRequiredBoolean = value; }
  }
  public string RequiredString 
  {
    get { return requiredString; }
    set { requiredString = value; }
  }
  public string? NotRequiredString 
  {
    get { return notRequiredString; }
    set { notRequiredString = value; }
  }
}
```

### NATS code templates

The [NATS TypeScript code template](https://github.com/asyncapi/ts-nats-template) now support the JetStream operations publish, [fetch](https://github.com/nats-io/nats.deno/blob/main/jetstream.md#fetching-batch-of-messages), [push](https://github.com/nats-io/nats.deno/blob/main/jetstream.md#push-subscriptions), [pull](https://github.com/nats-io/nats.deno/blob/main/jetstream.md#requesting-a-single-message) and [pull subscribe](https://github.com/nats-io/nats.deno/blob/main/jetstream.md#pull-subscriptions). This means 4 new functions are generated per defined channel ([checkout this example](https://github.com/asyncapi/ts-nats-template/blob/master/examples/simple-subscribe/asyncapi-nats-client/src/index.ts#L169)). 

```ts
...
export class NatsAsyncApiClient {
  ...
  // Core subscribe function
  public subscribeToStreetlightStreetlightIdCommandTurnon(...) {}
  public publishToStreetlightStreetlightIdCommandTurnon(...) {}

  // New JetStream operations
  public jetStreamPublishToStreetlightStreetlightIdCommandTurnon(...) {}
  public jetStreamPullStreetlightStreetlightIdCommandTurnon(...) {}
  public jetStreamPushSubscribeToStreetlightStreetlightIdCommandTurnon(...) {}
  public jetStreamPullSubscribeToStreetlightStreetlightIdCommandTurnon(...) {}
  public jetStreamFetchStreetlightStreetlightIdCommandTurnon(...) {}
}
```

For the .NET NATS template, it now supports [publishing to JetStream](https://github.com/asyncapi/dotnet-nats-template/blob/master/examples/newtonsoft/streetlight/AsyncapiNatsClient/Client.cs#L124).

```csharp
...
namespace Asyncapi.Nats.Client
{
  ...
  public class NatsClient
  {
    // Core publish function
    public void PublishToStreetlightStreetlightIdEventTurnon() {}

    // New JetStream operation
    public void JetStreamPublishToStreetlightStreetlightIdEventTurnon() {}
  }
}
```

The NATS .NET template is also one of the first code templates to support multiple serialization libraries, as it currently supports `Newtonsoft` and `system.text.json` because Modelina supports it, it's rather easy to dynamically switch between them (code for [system.text.json](https://github.com/asyncapi/dotnet-nats-template/blob/master/template/AsyncapiNatsClient/models/jsonModels.js) and [Newtonsoft](https://github.com/asyncapi/dotnet-nats-template/blob/master/template/AsyncapiNatsClient/models/newtonsoftModels.js)). 

When using the [CLI](https://github.com/asyncapi/cli) you can choose with the parameter `serializationLibrary`.

```bash
asyncapi generate fromTemplate asyncapi.yaml @asyncapi/ts-nats-template --param serializationLibrary="newtonsoft | json"
```

## To that end

In the end, thank you to everyone who contributes to AsyncAPI in any way you can :purple_heart: If you also want to help out but don't know where to begin, then join the [#11_how-to-contribute](https://asyncapi.slack.com/archives/C02FK3YDPCL) channel on Slack so we can help you any way we can :muscle: 

If you have worked on something or are working on something that you would like to be included in these updates, feel free to reach out!

> Photo by <a href="https://unsplash.com/@iamromankraft?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Roman Kraft</a> on <a href="https://unsplash.com/photos/_Zua2hyvTBk?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
  
