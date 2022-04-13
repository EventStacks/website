---
title: "Reusability causing problems"
date: 2022-04-13T18:00:00+00:00
type: Engineering
tags:
  - GamingAPI
  - AsyncAPI
cover: /img/posts/reusability-causing-problems.webp
authors:
  - name: Jonas Lagoni
    photo: /img/avatars/jonaslagoni.webp
    link: https://github.com/jonaslagoni
excerpt: "Enforcing reusability is great when you want to design your AsyncAPI documents, but what about when you want to use it in tooling?"
---

When you [enforce reusability](/posts/enforcing-consistency-guidelines-part-2#always-use-references), using such a sharded document can be rather problematic at times in tooling. I encountered this problem when I wanted to [render the AsyncAPI files within the developer platform for GamingAPI](https://gamingapi.org/platform/games/rust/server/api).

The way I solved the problem was to provide a bundled AsyncAPI document instead of multiple small files.

### A sharded document

There are many ways to utilize references, but take this document for example, that uses a local reference to define the [message](https://www.asyncapi.com/docs/specifications/v2.3.0#messageObject).

<CodeBlock caption="./asyncapi.json" language="json">
{`{
  "asyncapi": "2.3.0",
  "info": {
    "title": "Some API",
    "version": "0.0.0"
  },
  "channels": {
    "some/channel": {
      "subscribe": {
        "message": {
          "$ref": "./components/messages/SomeMessage.json"
        }
      }
    }
  }
}`}</CodeBlock>


<CodeBlock caption="./components/messages/SomeMessage.json" language="json">
{`{
  "name": "SomeMessage",
  "payload": {
    "type": "object"
  }
}`}</CodeBlock>

The bundled AsyncAPI document would then have no, or only [local references within the same document](https://github.com/asyncapi/bundler/issues/34).

<CodeBlock caption="./asyncapi.bundled.json" language="json">
{`{
  "asyncapi": "2.3.0",
  "info": {
    "title": "Some API",
    "version": "0.0.0"
  },
  "channels": {
    "some/channel": {
      "subscribe": {
        "operationId": "ServerStarted",
        "message": {
          "name": "SomeMessage",
          "payload": {
            "type": "object"
          }
        }
      }
    }
  }
}`}</CodeBlock>

### Easier to consume

The problem I faced was occurring because the local references have to be resolved in tooling. While it is, and should, be possible to use the sharded AsyncAPI documents with external references, I just find it easier to work and share them as bundled documents. 

The only downside about the bundled documents is that you cannot, or rather should not, make any changes to them. This means they can only be used as read-only, which might or might not affect whether you use this. 

To achieve the bundling I am using the [official AsyncAPI bundler](https://github.com/asyncapi/bundler) which is maintained and created by [Souvik](https://github.com/Souvikns).

To bundle the documents we can create a simple code script ([at least until the CLI has this feature](https://github.com/asyncapi/cli/issues/219)) which can bundle all the documents we want:

```js
// Because the bundler does not work outside of the working directory we have to keep this package here for now: https://github.com/asyncapi/bundler/issues/35
const bundler = require('@asyncapi/bundler');
const fs = require('fs');
const path = require('path');

async function bundleDocuments(filePath, outputFile) {
  const fullPath = path.resolve(filePath);
  const content = fs.readFileSync(fullPath, 'utf-8');
  const fileContent = JSON.parse(content);
  const bundledDocument = await bundler(
    [fileContent]
  );
  fs.writeFileSync(outputFile, bundledDocument.string());
};
bundleDocuments('./rust_server.asyncapi.json', '../bundled/rust_server.asyncapi.bundled.json');
```
Because of [#35](https://github.com/asyncapi/bundler/issues/35), the code [MUST be within the same folder as the AsyncAPI documents](https://github.com/GamingAPI/definitions/blob/main/documents/bundle-documents.js), but that should only be temporary.

As introduced in [Enforcing consistency guidelines](/posts/enforcing-consistency-guidelines-part-1#running-the-linting), running the linter was done through a simple [package.json file](https://github.com/GamingAPI/definitions/blob/main/package.json), we can now adapt this file to also include a script for bundling documents:
```json
{
  "scripts": {
    ...,
    "bundle": "cd documents && node bundle-documents.js"
  },
  "dependencies": {
    ...,
    "@asyncapi/bundler": "0.1.0"
  }
}
```

### Adapting release workflow
The [release workflow](https://github.com/GamingAPI/definitions/blob/main/.github/workflows/bump-rust-server-version.yml#L39) for the AsyncAPI documents can then be adapted to always run this script when the API version for the application changes:

```yml
...
jobs:
  bump:
    steps:
      ...
      - if: steps.version_bump.outputs.wasBumped == 'true'
        name: Bundle documents
        run: npm run bundle
      ...
```

> Photo by <a href="https://unsplash.com/@impatrickt?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Patrick Tomasso</a> on <a href="https://unsplash.com/s/photos/pages?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
  