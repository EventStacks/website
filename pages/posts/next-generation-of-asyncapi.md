---
title: "Next Generation of AsyncAPI"
date: 2022-11-03T12:00:00+01:00
type: Communication
tags:
  - AsyncAPI
cover: /img/posts/tooling-update.webp
authors:
  - name: Jonas Lagoni
    photo: /img/avatars/jonaslagoni.webp
    link: https://github.com/jonaslagoni
    byline: AsyncAPI Maintainer
excerpt: 'AsyncAPI version 3 is around the corner, but what does it contain, and maybe more importantly why does it contain it?'
---

This is the writeup of the AsyncAPI conference talk called: `Next Generation of AsyncAPI`

Watch it here, or read the writeup, or use the two in conjunction!

INSERT VIDEO

I am a release coordinator for version 3, and for those of you who are unaware of what entails it all comes down to helping whereever it's needed in order to push version 3 forward. You can read more about release coordinators here: https://github.com/asyncapi/spec/blob/master/RELEASE_PROCESS.md#release-coordinator

These are just the changes that we currently
bring awareness of potential changes and discussions we have regarding version 3. 

## What I am gonna cover
It will unfortunately be impossible for me to cover all potential changes in only 20 minutes, so I am gonna highlight the ones that has seen the most progress and is most likely to be a change in version 3.

Here is the problems and use-cases that I will highlight:

- Publish and Subscribe confusion 
- Reusability improvements
- Request and response pattern
- References and message payloads
- New parser mentality

## Publish and Subscribe confusion

This confusion comes from the defintion of the operations `publish` and `subscribe`. For example if you take a look at [the definition for `publish` ](https://www.asyncapi.com/docs/reference/specification/v2.5.0#channelItemObject):

> A definition of the PUBLISH operation, which defines the messages consumed by the application from the channel. 

```yaml
asyncapi: '2.5.0'
info:
  title: 'Account Service'
  version: '1.0.0'
  description: 'This service is in charge of processing user signups'
channels:
  user/signedup:
    publish:
      message:
        $ref: '#/components/messages/UserSignedUp'
components:
  messages:
    UserSignedUp:
      payload:
        $ref: '#/components/schemas/UserSignedUpPayload'
  schemas:
    UserSignedUpPayload: 
      type: 'object'
      properties:
        displayName:
          type: 'string'
          description: 'Name of the user'
        email:
          type: 'string'
          format: 'email'
          description: 'Email of the user'
```

```yaml
asyncapi: '3.0.0'
info:
  title: 'Account Service'
  version: '1.0.0'
  description: 'This service is in charge of processing user signups'
channels:
  user/signedup:
    receive:
      message:
        $ref: '#/components/messages/UserSignedUp'
...
```

## Reusability improvements
There is multiple steps being taken to ensure reusability is at it's max allowing you to review the same definitions across multiple AsyncAPI documents.

### Reusability of channels
First up is the reusability of channel and operations. This problem become apperant in version 2, if you have two applications, where one produce a message (website backend) and another consumes it (account service), it's not possible for the two to reuse the channel definition between them.

```yaml
asyncapi: '2.5.0'
info:
  title: 'Account Service'
  description: 'This service is in charge of processing user signups'
channels:
  user/signedup:
    publish:
      message:
        ...
```

```yaml
asyncapi: '2.5.0'
info:
  title: 'Website backend'
  description: 'This website backend allows users to signup'
channels:
  user/signedup:
    subscribe:
      message:
        ...
```

There is no way you can reference the channel path/topic and reuse it across these two specs, because the operation keyword is different between the two applications.

The current fix is that two changes are being made.

1. The channel path is defined within the channel object, and a unique identifier is used as the key for the channel.

```yaml
asyncapi: '3.0.0'
info:
  title: 'Account Service'
  description: 'This service is in charge of processing user signups'
channels:
  UserSignedUp:
    address: user/signedup
    publish:
      message:
        ...
```

2. The operation and channel object have their roles reversed. Where the channel define what messages are being transmitted across it, and the operations are the actions what the application performs. 

```yaml
asyncapi: '3.0.0'
info:
  title: 'Account Service'
  description: 'This service is in charge of processing user signups'
channels:
  UserSignedUp:
    address: user/signedup
    message:
      ...
operations:
  ConsumeUserSignedUp:
    action: receive
    channel: 
      $ref: '#/channels/UserSignedUp'
```

What is acomplishes is that channels becomes selfcontained where each application can both reference the same channel (There are multiple ways to setup the reusability), here it's an external file which contain the definition for the channel (`./channels/UserSignUp.yaml`). 

This gives the AsyncAPI documents for the two documents:

```yaml
asyncapi: '3.0.0'
info:
  title: 'Account Service'
  description: 'This service is in charge of processing user signups'
channels:
  UserSignedUp:
    $ref: './channels/UserSignUp.yaml'
operations:
  ConsumeUserSignedUp:
    action: receive
    channel: 
      $ref: '#/channels/UserSignedUp'
```

```yaml
asyncapi: '3.0.0'
info:
  title: 'Website backend'
  description: 'This website backend allows users to signup'
channels:
  SignUpUser:
    $ref: './channels/UserSignUp.yaml'
operations:
  SignUpUser:
    action: send
    channel: 
      $ref: '#/channels/SignUpUser'
```

Further reading:
- https://github.com/asyncapi/spec/issues/663
- https://github.com/asyncapi/spec/issues/618#issuecomment-980093487
- https://github.com/asyncapi/spec/issues/829
- https://github.com/asyncapi/spec/issues/661
- https://github.com/asyncapi/spec/issues/660

### Reusability of schemas
There is a couple of issues with the current schemas.
1. It's not possible to define schemas that has other formats, in the `components` section.
2. It's not possible to properly define the schema and its format, in a self-contained object.


```yaml
...
components:
  messages:
    UserSignedUp:
      schemaFormat: application/vnd.aai.asyncapi;version=2.4.0
      payload:
        $ref: '#/components/schemas/UserSignedUpPayload'
  schemas:
    UserSignedUpPayload: 
      type: 'object'
      properties:
        displayName:
          type: 'string'
          description: 'Name of the user'
        email:
          type: 'string'
          format: 'email'
          description: 'Email of the user'
```

Further reading:
- https://github.com/asyncapi/spec/issues/622

## Request and response pattern
One of the oldest requests for AsyncAPI has been how to document request/response patterns, and it proves to be a slightly hard nut to crack then one might think. Lets look at the [use-cases](https://github.com/asyncapi/spec/issues/94#issuecomment-1128026943) that was gathered by [Heiko](https://github.com/GreenRover) and which this feature gets build from:

1. A pre-defined response topic
2. A dynamic response topic (inbox)
3. A new temporary reply topic for each individual response
4. (Websocket) The channel is a single topic where all the messages flow, only have access to a correlation id

Lets start of with a simple example where I want one part sending a ping and another sending a pong in response.

```yaml
channels:
  ping:
    address: /ping
    messages:
      ping:
        $ref: '#/components/messages/ping'
  pong:
    address: /pong
    messages:
      pong:
        $ref: '#/components/messages/pong'
```

```yaml
operations:
  InitiatePing:
    action: send
    channel: 
      $ref: '#/channels/ping'
    reply:
      channel: 
        $ref: '#/channels/pong'
  ReactToPing:
    action: receive
    channel: 
      $ref: '#/channels/ping'
    reply:
      channel: 
        $ref: '#/channels/pong'
```

In some protocols (NATS) request/reply happens over either dynamic channels or the same that is not determined until runtime, i.e. that you send a request over `/ping` and you dont design on which channel the response returns on, in these cases the channel `address` is either not sat (undefined) or explicit set to `null`. 

```yaml
channels:
  ping:
    address: /ping
    messages:
      ping:
        $ref: '#/components/messages/ping'
  pong:
    address: null
    messages:
      pong:
        $ref: '#/components/messages/pong'
``` 


Further reading:
- https://github.com/asyncapi/spec/pull/847
- https://github.com/asyncapi/spec/issues/558
- https://github.com/asyncapi/spec/issues/94
- https://docs.nats.io/nats-concepts/core-nats/reqreply/reqreply_walkthrough
- https://www.hivemq.com/blog/mqtt5-essentials-part9-request-response-pattern/
- 

## References and message payloads
One issue with schemas, is that some schema formats are not JSON compatible, for example Protobuf and XSD, and we want you to use whatever format best fits in your situation.

While it is 

## New parser mentality
It's not only about the specification, another important perspective of any standard is the tooling around it. Here we have been trying to figure out how it would be possible to minimize the friction not only for consumer of AsyncAPI but also tooling authors.

Therefore in conjunction with version 3 of the spec, you will see an entirely new approach to parsers, called intent driven.

What this means is that instead of modeling how you interact with the AsyncAPI document in a one to one manor, we provide certain intents that bypasses any AsyncAPI structure, and dont really care of the internal structure of the specification, and would remain the same across multiple AsyncAPI versions.

