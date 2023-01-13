---
title: "AsyncAPI Time to First call in 10 seconds"
date: 2022-09-30T16:00:00+01:00
type: Communication
tags:
  - AsyncAPI
  - Tooling
cover: /img/posts/tooling-update.webp
authors:
  - name: Jonas Lagoni
    photo: /img/avatars/jonaslagoni.webp
    link: https://github.com/jonaslagoni
    byline: AsyncAPI Maintainer
excerpt: ''
---

One of the most existing features (I think), is the possibility to not lift a finger when a new API is released, and within 10 seconds have the possibility to make your first "call". A "call" in this context is subscribing to an event, publishing an event, requesting some resource, replying to some request, etc.

It's the whole reason why I use code generation. Problem is it's quite complex to enable this, and I have been playing around with it for some time ([part 1](/posts/automated-utopia), [part 2](/posts/automated-utopia-versioning), [part 3](/posts/automated-utopia-typescript), [part 4](/posts/automated-utopia-dotnet), part 5), and finally ended up trying to engineer a solution to battle the complexity.

For simplicity I just refer to this solution as `time-to-first-call` going forward.

# The Idea

<img src="/img/posts/time-to-first-call-10-seconds.png"/>

The idea is that 10 seconds after you made a change to the AsyncAPI file (design first), a new library is generated in x languages across x package managers, which enables anyone who use the contract, to install the new library and interact with the new contract.

Let me give you an example, John Doe is tasked to publish light measurements to Kafka, they use AsyncAPI and a generated library to easy integration.

So his first task is to add a new channel to the AsyncAPI file (because spec-first):

```diff
{
  "asyncapi": "2.5.0",
  ...,
  "channels": {
    ...,
+    "smartylighting.lighting.measured": {
+      "description": "The topic on which measured values may be produced and consumed.",
+      "subscribe": {
+        "summary": "Inform about environmental lighting conditions of a particular streetlight.",
+        "operationId": "publishLightMeasurement",
+        "message": {
+          "$ref": "#/components/messages/lightMeasured"
+        }
+      }
+    }
}
```

After pushing those changes of the AsyncAPI document, he now wants make the smartlight system publish the light measurements to kafka.

As the project is already using a pre-generated library that acts as a client library to interact with the Kafka broker he updates the dependency to the newest version that has just been released, automatically from using this library.

```diff
{
  "dependencies": [
    ...,
-   "smartylighting": "1.0.0"
+   "smartylighting": "1.1.0"
  ]
}
```

He now publish his measurements using the new function, from the updated library.

```diff
+ const message: LightMeasured = {
+   lumen: getMeasurement()
+ }
+ await smartylighting.publishMeasurement(message);
```

And that concludes his task. In rough form, but it should provide a description of the core workflow :laugh:

## Specifics

Intended users:
- Public APIs, where users interact with an already pre-defined contract, where you want the time to first call as low as possible.
- Internal APIs, where you want others to interact with a service as easy as possible.

### Code generator

This concept is NOT supposed to work where the code generator equire the user to make manual changes, something you usually see in for a REST server, but it's tuned towards "dumb" libraries that you integrate into your project to customize behavior and listen to specific events.

This means that the library has it's own lifecycle.

### Version strategies

One of the dificult parts is that we have multiple versions that needs to play together:
- The version of the API (from the AsycnAPI file)
- The version of the code generator (template or otherwise)
- The version of the currently generated library (it has it's own lifecycle)

There are also not just one version strategy, there exist different ones, that can be applied individually per above mentioned version:
- Semantic Versioning "semver"
- Date/calendar based versioning "calver"
- Incremental "incremental"

All of these things must be working together seemlessly, and I definitely believe this can be the case, so no stopping us there.

> New library version = API new version + Code generator new version + Current library version + Library version strategy + API version strategy + code generator version strategy


### Package managers

For each programming language there are always a wide range of package managers you can use to host those libraries:

- GitHub (Docker images, RubyGems, NPM, Maven, Gradle, NuGet)
- Google (Maven)
- Maven Central Repository
- NPM
- DockerHub (Docker images)
- ...

Therefore the library needs to be engineered to support a range of these.

# Example implementation

### Options
These are the options I expect that the library will need and understand, that does not take into consideration that you might want to 

```json
{
  asyncapi_version_strategy: 'semver' | 'calver' | 'incremental',
  asyncapi_document: './asyncapi.json',
  locator: {
    type: 'local' | 'remotely',
    path: './asyncapi.json' | ', 
    secrets: [...]
  }
  generators: [
    {
      type: 'generator' | ...,
      template: '@asyncapi/ts-nats-template',
      secrets: [...],
      library_name: 'asyncapi-ts-nats',
      // Version strategy for the generated library
      library_version_control: 'none' | 'git',
      library_version_strategy: 'semver' | 'calver' | 'incremental',

      //To where do we publish
      package_managers: [
        {
          type: 'github' | 'npm' | 'nuget' | 'maven',
          // Github specific config
          // NPM specific config
          // nuget specific config
          // Maven specific config
        },
        ...
      ]
    }
  ]
}
```

## Integrations
These are the integrations I think it makes sense to keep in mind. 

### Library
First and foremost, it's a library that can be integrated, it's the foremost integration option.

```js
import TimeToFirstCall from '@asyncapi/time-to-first-call';

await TimeToFirstCall.run('./time-to-first-call-config.json');
```

This indirectly enable you to reacting to some internal call as a service that can be used by API platforms to support continous code generation in a larger system to multiple customers.

### CLI
Manually trigger the code generation and packaging through the CLI:

```sh
$ asyncapi time-to-first-call ./time-to-first-call-config.json
```

### CI environment
Trigger the release at some point through a CI environment, for example when the AsyncAPI file changes on :
```yaml
name: Release new library for the API

on:
  push:
    paths:
      - 'asyncapi.js'

jobs:
  release-new-library:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
      - name: Use gh action
        uses: asyncapi/time-to-first-call
        with:
          config: ./time-to-first-call-config.json
          # Configuration from file, or inline
```


## FAQ

- Should this be a feature of the generator, or does this belong to a separate library?
I think it belongs in a separate repository, as this is not specifically for the AsyncAPI generator, thats just the most prodomoment use-case for us in AsyncAPI, but it should be any arbitrary generator, in thoery.