---
title: "AsyncAPI tooling update - Week 46"
date: 2022-11-16T16:00:00+01:00
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
excerpt: 'IntelliJ plugin, new visualization library, code generation tweaks, and Glee improvements!'
---

> This post bundles updates from the following official tools, but not limited to: [bundler](https://github.com/asyncapi/bundler), [chatbot](https://github.com/asyncapi/chatbot), [studio](https://github.com/asyncapi/studio), [diff](https://github.com/asyncapi/diff), [glee](https://github.com/asyncapi/glee), [create-glee-app](https://github.com/asyncapi/create-glee-app), [cli](https://github.com/asyncapi/cli), [optimizer](https://github.com/asyncapi/optimizer), [modelina](https://github.com/asyncapi/modelina), [generator](https://github.com/asyncapi/generator), [generator-react-sdk](https://github.com/asyncapi/generator-react-sdk), [java-template](https://github.com/asyncapi/java-template), [java-spring-cloud-stream-template](https://github.com/asyncapi/java-spring-cloud-stream-template), [java-spring-template](https://github.com/asyncapi/java-spring-template), [dotnet-nats-template](https://github.com/asyncapi/dotnet-nats-template) and [ts-nats-template](https://github.com/asyncapi/ts-nats-template).

You can find the last tooling update [here](/posts/asyncapi-tooling-update-week-39).

In case you want to read what other changes have been happening, you can get the overviews here:
- [Sergio](https://twitter.com/smoyac/)'s latest [AsyncAPI specification and parser update](https://gist.github.com/smoya/73297c3ad9ffb1be57fb6fb26f89b531)
- [Maciej](https://github.com/magicmatatjahu)'s latest [AsyncAPI design and documentation update](https://gist.github.com/magicmatatjahu/50e57e23cd91ceff20947dbf79a424f3)
- [Alejandra](https://twitter.com/QuetzalliAle)'s latest [AsyncAPI docs update](https://gist.github.com/alequetzalli/39a9585b88451da973970b79b0c8c665)
- [Barbaño](https://github.com/Barbanio)'s latest [AsyncAPI training update](https://gist.github.com/Barbanio/dda980111b7c62b4e3f741cb2f2d10d9)

## Highlights
These are some of the highlights of changes that have happened in the tools or what's to come! It of course does not cover all the changes but only certain ones.

### IntelliJ AsyncAPI plugin
In case you use [IntelliJ as your IDEA to edit AsyncAPI documents](https://plugins.jetbrains.com/plugin/15673-asyncapi), you can use the following plugin to make your experience better. It helps you edit the AsyncAPI document with reference auto-completion, validating your document on the fly and showing you the documentation right next to your editor!

<img src="/img/posts/week-45-update/IntelliJ-preview.png"/>

The plugin [can be found in jasyncapi-idea-plugin](https://github.com/asyncapi/jasyncapi-idea-plugin) repository.

### EDAVisualiser
Finally [donated to the AsyncAPI organization](https://github.com/asyncapi/EDAVisualiser), is the possibility to visualize AsyncAPI documents in the same or more advanced ways as the [AsyncAPI studio](https://studio.asyncapi.com/). It focuses on visualizing different views, each having a specific reason for being there. 

Do you want to figure out [which applications interact with one specific application](https://asyncapi.github.io/EDAVisualiser/social-media/backend)? [Use the `ApplicationFocusView`](https://github.com/asyncapi/EDAVisualiser#applicationfocusview). Do you want to [view the behavior of your application](https://asyncapi.github.io/EDAVisualiser/asyncapi)? [Use the `ApplicationView`](https://github.com/asyncapi/EDAVisualiser#applicationview). Do you want to get an overall perspective of how all your applications interact with each other? [Use the `SystemView`](https://github.com/asyncapi/EDAVisualiser#systemview). 

The hope is that going forward this library will provide different ways, and push the current developer experience, for how developers are onboarded to a complex system. 

<video controls>
  <source src="/media/edavisualiser.mp4"
          type="video/mp4"/>
  Sorry, your browser doesn't support embedded videos. Read below what is happening.
</video>

It of course works with a range of frameworks such as [angular, Next.JS, react, and Vue](https://github.com/asyncapi/EDAVisualiser/tree/master/examples).

You can play around with the small playground here: https://asyncapi.github.io/EDAVisualiser

### Kafka and AMQP 1.0 support for Glee
Currently, [Glee](https://github.com/asyncapi/glee) supports two protocols, WebSocket and MQTT, but it is currently being pushed with two new protocols, [Kafka](https://github.com/asyncapi/glee/pull/342) and [AMQP 1.0](https://github.com/asyncapi/glee/pull/348). This is being done by [Ruchi](https://github.com/Ruchip16) and [Atharva](https://github.com/atharvagadkari05) respectively as part of the [AsyncAPI mentorship program](https://github.com/asyncapi/community/discussions/284).

### Code generation

We have a bunch of changes to the code generation tools that I am gonna list here.

[Node.js code generator now throws validation exception when receiving incorrectly formatted payload](https://github.com/asyncapi/nodejs-template/pull/179). It [now also supports `mqtts`](https://github.com/asyncapi/nodejs-template/pull/174). [It now also supports `oneOf` messages](https://github.com/asyncapi/nodejs-template/issues/82).

TypeScript Nats code generator now supports [JetStream fetch](https://github.com/asyncapi/ts-nats-template/pull/479), [pull subscribe](https://github.com/asyncapi/ts-nats-template/pull/480), [push subscribe](https://github.com/asyncapi/ts-nats-template/pull/481), and [pull](https://github.com/asyncapi/ts-nats-template/pull/482).

.NET Nats code generator now supports two types of serialization libraries, [either Newtonsoft or the native System.text.Json](https://github.com/asyncapi/dotnet-nats-template/issues/305).

[Java code generator now supports different TLS options for `ibmmq-secure`](https://github.com/asyncapi/java-template/pull/76).

Modelina, [Python now supports two styles of imports](https://github.com/asyncapi/modelina/pull/981), either using [implicit or explicit](https://github.com/asyncapi/modelina/blob/c4a5f678affbdf78aa046aed310689580923665b/examples/generate-python-complete-models/index.ts#L26), Python also now [support basic Pydantic support](https://github.com/asyncapi/modelina/pull/964). 

[.NET now has a Newtonsoft preset](https://github.com/asyncapi/modelina/pull/970) for generating models with, well, methods for converting models to and from JSON using Newtonsoft. 

## To that end

In the end, thank you to everyone who contributes to AsyncAPI in any way you can :purple_heart: If you also want to help out but don't know where to begin, then join the [#11_how-to-contribute](https://asyncapi.slack.com/archives/C02FK3YDPCL) channel on Slack so we can help you any way we can :muscle: 

If you have worked on something or are working on something that you would like to be included in these updates, feel free to reach out!

> Photo by <a href="https://unsplash.com/@markuswinkler?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Markus Winkler</a> on <a href="https://unsplash.com/s/photos/update?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
