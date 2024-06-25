---
title: "t"
date: 2023-12-25T22:00:00+01:00
type: Communication
tags:
  - AsyncAPI
  - specification 
cover: /img/posts/nats-jetstream-asyncapi-integration.webp
authors:
  - name: Jonas Lagoni
    photo: /img/avatars/jonaslagoni.webp
    link: https://github.com/jonaslagoni
    byline: AsyncAPI Maintainer
excerpt: 'This is the first iteration of how to pair AsyncAPI and NATS JetStream configurations together'
---

One of the greatest strength to AsyncAPI is when you start using it as a configuration as it fixes the drifting problems between implementation and documentation. Whether you use it as a design first or code first does not matter in this case.

However, one big drawback right now, is that there are no tools that automatically setup streams (similar to Kafka topics) based on the need of each application. This blog post explores how it can be achieved.

## Foundation

If your applications uses protocols such as NATS (more specifically JetStream) or Kafka, some ground work is required to setup the broker with the right settings. For example how many different streams do you need? What are the constraints and general settings of each? Who have permission to write and read to and from it? If you enforce AsyncAPI documents for everyone within your system boundary, it should not be needed to do any manual work as it's already defined.

On-top of this it changes from time to time based on the needs of each application, that might require a new stream, adding a subject to an existing stream, or changing configurations of an existing one. 

I want to utilize the AsyncAPI documents for each application to automate some of the setup and maintenance required to run the brokers along side the applications. 

One part I will not go into details with is how this setup can be applied to larger organizations and teams, because I have only applied it to one project with 2 developers. I would love to hear if you are doing it in a large enterprise setting!

## Possibilities
What I am looking for are the following features to be met:
- Adding a new channel (in AsyncAPI) automatically setup the stream.
- Changing the configuration of an existing channel (in AsyncAPI) automatically changes the stream settings.

There are a bunch of different ways to achieve this, but what all have in common is it comes down to two actions;
- Building the streams and their settings
- Applying the settings to the brokers

The first action is mostly unconstrained from the second one, which is we have to walk over all the applications in the system (each having an AsyncAPI document describing their connection within the system/world) and build the streams and settings for the broker.

The second action about where the logic should be placed so it can apply those settings to the broker are so diverse that is depends on what is part of your development process. Are you using a specific framework?

## Configuring the channels
What I am gonna use to configure the AsyncAPI channels (that will be interpreted as NATS streams) is bindings (`nats`) and extensions (`x-jetstream`). Optimally only bindings should be needed, but since I am still experimenting there is no need to make it official yet. 

```json
{
	"asyncapi": "2.6.0",
	...
	"channels": {
    "start.{type}.{run_uid}": {
      "parameters": {
        "run_uid": {
          "schema": {
            "type": "string"
          }
        },
        "type": {
          "schema": {
            "$ref": "#/components/schemas/runTypes"
          }
        }
      },
      "publish": { ... },
      "bindings": {
        "$ref": "./bindings.json#/components/channelBindings/StartRun"
        // "nats": {
        //    "x-jetstream": {
        // 	    "name": "StartRun",
        //      "retention": "limits",
        //      "max_consumers": -1,
        //      "max_msgs_per_subject": -1,
        //      "max_msgs": -1,
        //      "max_bytes": -1,
        //      "max_age": 0,
        //      "max_msg_size": -1,
        //      "storage": "memory",
        //      "discard": "old",
        //      "num_replicas": 1,
        //      "duplicate_window": 120000000000,
        //      "sealed": false,
        //      "deny_delete": false,
        //      "deny_purge": false,
        //      "allow_rollup_hdrs": false,
        //      "allow_direct": true,
        //      "mirror_direct": false
        //    }
        // }
      }
    },
    ...
  }
}
```
Everything except `name` is required, as we need to have a name/ID for the stream that is unique on the NATS broker.

Currently the AsyncAPI documents are written in AsyncAPI v2, and I want to migrate to AsyncAPI v3 as soon as possible, but I have not had a chance to do it yet. It will enable reusability of channels between multiple AsyncAPI documents, simplifying this setup even more.

## Building streams
The first step in building the stream configuration is to parse and walk over each of the AsyncAPI documents. And since we (so far) only have a parser for TS/JS, it makes sense to continue in that and create a TS script.

... And just for fun, I tried using Bun as the runtime ;) So I setup a project with `bun init` and started by installing the AsyncAPI parser and configuration the different files we need to iterate over.

```ts
import path from 'path';
import {Parser, fromFile} from '@asyncapi/parser';
const parser = new Parser({ruleset: {}});

const asyncapiFiles = [
  path.resolve(import.meta.dir, '../../../definitions/services/x/asyncapi.json'),
  // For each of your AsyncAPI documents
];
...
```

For the AsyncAPI parser, I am disabling all the spectral rules `{ruleset: {}}` that comes with the parser by default. We simply assume that by the time the script runs the AsyncAPI are valid and correct based on what ever governance rules we have in place (that is ensured by something else). **A side benefit with the parser approach is that I do not have to change the implementation when switching to AsyncAPI v3**

When it comes to the AsyncAPI documents, in my case it's a mono-repository, so I have local access to all the services and therefore the AsyncAPI documents. If yours are remote, just use URL's or implement functionality that fetches the documents beforehand.

```ts
const defaultSettings: NatsStreamSettings = {
  "retention": "limits",
  "max_consumers": -1,
  "max_msgs_per_subject": -1,
  "max_msgs": -1,
  "max_bytes": -1,
  "max_age": 0,
  "max_msg_size": -1,
  "storage": "memory",
  "discard": "old",
  "num_replicas": 1,
  "duplicate_window": 120000000000,
  "sealed": false,
  "deny_delete": false,
  "deny_purge": false,
  "allow_rollup_hdrs": false,
  "allow_direct": true,
  "mirror_direct": false
};
```
Next is setting up all the default stream settings that is merged together with the custom settings of each channel.

```ts
const parsedDocuments = await Promise.all(
  asyncapiFiles.map(async (asyncapiFilePath) => {
    const {document, diagnostics} = await fromFile(parser, asyncapiFilePath, {}).parse();
    if(document) {
      return document;
    }
    throw new Error(diagnostics.join('\n'));
  })
);
```

Parsing all the AsyncAPI files with the AsyncAPI parser so we can interact with the documents, or fail the script if any errors occur.

```ts
const streamMapper: Record<string, NatsChannelSettings> = {};

for (const asyncapi of parsedDocuments) {
  // Filter out any channel that does not have the required settings
  const channelsWithExtensions = filterChannels(asyncapi);

  // Create the streams for each channel
  for (const channel of channelsWithExtensions) {
    const channelSettings = channel.bindings().get('nats')!.json()['x-jetstream'];
    const streamId = channelSettings.name;

    // Convert RFC 6570 URI template to NATS topic
    let address = channel.address()!;
    address = address?.replaceAll(/(\{.+?\})/g, '*');

    const cachedStream = streamMapper[streamId];
    if(cachedStream) {
      // If stream already seen, make sure that the topic is added to the list of subjects
      if(!cachedStream.subjects.includes(address)) cachedStream.subjects.push(address);
    } else {
      streamMapper[streamId] = {
        ...defaultSettings, 
        ...channelSettings,
        subjects: [address]
      };
    }
  }
}
```
For each AsyncAPI document, we now want to iterate over all the channels that contains our JetStream settings, to create a map of streams and their settings. One thing to note here is that the address is written with [RFC 6570 URI template](https://tools.ietf.org/html/rfc6570) (`start.{type}.{run_uid}`), but NATS has no such concept, and instead we want convert it to NATS compliant topics using wildcards for parameters (`start.*.*`).

I am also using the assuming that all AsyncAPI channels across multiple applications with the same `name` have the same settings (with AsyncAPI v3 that would be an inherent invariant from the structure). So when we encounter a stream that is already cached, we just need to add the address of the channel.

The `filterChannels` logic is just filtering out any channels that does not have an address, the nats bindings or the custom `x-jetstream` extension.

```ts
function filterChannels(asyncapi: AsyncAPIDocumentInterface)  {
  return asyncapi.allChannels().filter((channel) => {
    if(!channel.address()) return false;
    if(!channel.bindings().has('nats')) return false;
    const channelSettings = channel.bindings().get('nats')!.json()['x-jetstream'];
    if(!channelSettings) return false;
    return true;
  });
}
```

## Applying the configuration

Now that we have a map of all the streams and their configuration, we need to figure out a way to apply it to the NATS broker that can both work for local development and production. 


## Next iteration

- Using the JetStream management library to remove the need for shell scripts
  - Soft changing settings instead of complete remove/add
- Switch to AsyncAPI v3

> Photo by <a href="https://unsplash.com/@flowforfrank?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Ferenc Almasi</a> on <a href="https://unsplash.com/photos/text-An6M5zgFPj4?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  