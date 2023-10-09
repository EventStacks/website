---
title: "First look at request and reply in AsyncAPI v3"
date: 2023-10-09T22:00:00+01:00
type: Communication
tags:
  - AsyncAPI
  - specification 
cover: /img/posts/request-and-reply.webp
authors:
  - name: Jonas Lagoni
    photo: /img/avatars/jonaslagoni.webp
    link: https://github.com/jonaslagoni
    byline: AsyncAPI Maintainer
excerpt: 'Get a first look at the new request and reply pattern in AsyncAPI v3'
---

This post was originally intended for the AsyncAPI website, but [they had other plans](https://github.com/asyncapi/website/pull/2071#issuecomment-1753486030) and I had already written it, so now you get the pleasure of a teaser instead :smile: Thanks [Heiko Henning](https://github.com/GreenRover), [Hhridyesh Bisht](https://github.com/kakabisht), [Animesh Kumar](https://github.com/AnimeshKumar923), [Sergio Moya](https://github.com/smoya), and [Alejandra Quetzalli](https://github.com/alequetzalli) for the initial reviews :pray:

A common messaging pattern is [request and reply](https://www.enterpriseintegrationpatterns.com/patterns/messaging/RequestReply.html) and up until now it has been near impossible to describe it in AsyncAPI, that changes with AsyncAPI v3. And within it we will se there are different sub-patterns that of course are all supported in AsyncAPI v3. Enough talk, lets jump straight into it.

# Describing a requester

We are going to use a very simple ping and pong example where a requester sends the ping and the replier responds with a pong. To describe a **requester** in AsyncAPI, we make use of an operation that `send`s to the `ping` channel and expects a `reply` over `pong`.

```yml
asyncapi: 3.0.0

info:
  title: Ping/pong example for a requester with static reply channel
  version: 1.0.0
  description: Example with a requester that initiates the request/reply pattern on a different channel than the reply is using.

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

operations:
  pingRequest:
    action: send
    channel: 
      $ref: '#/channels/ping'
    reply:
      channel: 
        $ref: '#/channels/pong'
```

The `reply` section defines all the necessary information to properly reply to the request, such as where to, and with what message. This is just a simple example, but you can check the full list of properties under the [Operation Reply Object](https://www.asyncapi.com/docs/reference/specification/latest#operationReplyObject)

# Describing a replier

Defining the **replier** is the same as for the requester, where we instead make use of the `receive` action.

```yml
asyncapi: 3.0.0

info:
  title: Ping/pong example for replier with static reply channel
  version: 1.0.0
  description: Example with a replier that returns the response on a different channel than the request happened on.

channels:
  // Same as for the requester

operations:
  pongReply:
    action: receive
    channel: 
      $ref: '#/channels/ping'
    reply:
      channel: 
        $ref: '#/channels/pong'
```

This means that we `receive` a message over `ping` and we are expected to return a reply over `pong`.

# Sub-patterns in request/reply

In the simple example above, we saw how you could set up a request/reply pattern across two applications where one application is the requester and the other is the replier.

However, in an protocol-agnostic world there are many different sub-patterns to the simple request/reply. All of which AsyncAPI v3 enables.

## Request/reply with dynamic response channel

In some cases, we do not know the reply channel at design time, but instead, it's dynamically determined at runtime. This could, for example, be using the request message payload or header to dictate the response address.

Take notice of how we utilize `address: null` to define that we don't know the address just yet. This is just for illustration purposes as you can also omit the property entirely. We then utilize the [Operation Reply Address Object](https://www.asyncapi.com/docs/reference/specification/latest#operationReplyAddressObject) to define that the address of where to send the reply is located dynamically in the message header under `replyTo`.

```yml
asyncapi: 3.0.0

info:
  title: Ping/pong example for a requester with a dynamic reply channel
  version: 1.0.0
  description: Example with a requester that initiates the request/reply pattern where the reply will happen on whatever is defined in the header `replyTo` of the request.

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

operations:
  pingRequest:
    action: send
    channel: 
      $ref: '#/channels/ping'
    reply:
      address:
        description: The reply address is dynamically determined based on the request header `replyTo`
        location: "$message.header#/replyTo"
      channel: 
        $ref: '#/channels/pong'
```

Defining the replier is the same as for the requester, again using the `receive` action instead is the only difference.

```yml
asyncapi: 3.0.0

info:
  title: Ping/pong example for replier with a dynamic reply channel
  version: 1.0.0
  description: Example with a replier that returns the response on a channel determined by the header `replyTo` of the request.

channels:
  // Same as for the requester

operations:
  pongReply:
    action: receive
    channel: 
      $ref: '#/channels/ping'
    reply:
      address:
        description: The reply address is dynamically determined based on the request header `replyTo`
        location: "$message.header#/replyTo"
      channel: 
        $ref: '#/channels/pong'
```

You can use different types of `location` values here as it's not limited to headers specifically. You can also use payload properties with `$message.payload#/replyTo`. These types of values are [Runtime Expressions](https://www.asyncapi.com/docs/reference/specification/latest#runtimeExpression).

## Request/reply over the same channel

The request/reply can also occur over the same channel (for example `/`), which could be HTTP or WebSocket.

To do this it's as simple as having both channels use the same address.

```yml
asyncapi: 3.0.0

info:
  title: Ping/pong example with requester
  version: 1.0.0
  description: Requester example initiating the request-reply pattern.

channels:
  ping:
    address: /
    messages:
      ping:
        $ref: '#/components/messages/ping'
  pong:
    address: /
    messages:
      pong:
        $ref: '#/components/messages/pong'

operations:
  pingRequest:
    action: send
    channel: 
      $ref: '#/channels/ping'
    reply:
      channel: 
        $ref: '#/channels/pong'
```

Defining the replier is the same as for the requester, again using the `receive` action instead is the only difference.

```yml
asyncapi: 3.0.0

info:
  title: Ping/pong example with replier
  version: 1.0.0
  description: Simple example with a replier that replies to the request.

channels:
  // Same as for the requester

operations:
  pongReply:
    action: receive
    channel: 
      $ref: '#/channels/ping'
    reply:
      channel: 
        $ref: '#/channels/pong'
```

## Multiple messages over the same channel with request/reply

In WebSocket, you often encounter that a channel will contain multiple messages, which means you will have to make your operations explicitly define which messages are used for each operation.

The following example is very similar to the above example, with the difference being that we merged the two ping and pong channels into a single one (because they use the same address). The request operation then explicitly defined the request message among the available channel messages and the same for the reply.

```yml
asyncapi: 3.0.0

info:
  title: Ping/pong example when a channel contains multiple messages
  version: 1.0.0
  description: Simple example with a requester that initiates the request-reply pattern, where the root channel contains multiple messages.

channels:
  rootChannel:
    address: /
    messages:
      ping:
        $ref: '#/components/messages/ping'
      pong:
        $ref: '#/components/messages/pong'

operations:
  pingRequest:
    action: send
    channel: 
      $ref: '#/channels/rootChannel'
    messages:
      - $ref: "/components/messages/ping"
    reply:
      messages:
        - $ref: "/components/messages/pong"
      channel: 
        $ref: '#/channels/rootChannel'
```

Notice how we have to add `messages` to the operation and reply information, to explicitly state which messages are used for when.

> Photo by <a href="https://unsplash.com/@keepsakes_and_daydreams?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Steven Skerritt</a> on <a href="https://unsplash.com/photos/vljZeX-WdQs?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  
