---
title: "AsyncAPI Tooling update - Week 33"
date: 2022-08-16T16:00:00+01:00
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
excerpt: 'Are you wondering what changes have happened to the AsyncAPI tooling? Look no further! Here are the highlights of the changes that have happened in weeks 30-32'
---

> This post bundles updates from the following official tools, but not limited to: [bundler](https://github.com/asyncapi/bundler), [chatbot](https://github.com/asyncapi/chatbot), [studio](https://github.com/asyncapi/studio), [diff](https://github.com/asyncapi/diff), [glee](https://github.com/asyncapi/glee), [create-glee-app](https://github.com/asyncapi/create-glee-app), [cli](https://github.com/asyncapi/cli), [optimizer](https://github.com/asyncapi/optimizer), [modelina](https://github.com/asyncapi/modelina), [generator](https://github.com/asyncapi/generator), [generator-react-sdk](https://github.com/asyncapi/generator-react-sdk), [java-template](https://github.com/asyncapi/java-template), [java-spring-cloud-stream-template](https://github.com/asyncapi/java-spring-cloud-stream-template), [java-spring-template](https://github.com/asyncapi/java-spring-template), [dotnet-nats-template](https://github.com/asyncapi/dotnet-nats-template) and [ts-nats-template](https://github.com/asyncapi/ts-nats-template).

You can find the last tooling update [here](/posts/asyncapi-tooling-update-1).

## Highlights
These are some of the highlights of changes that have happened in the tools and what's to come! Let me know what you wish to see from these updates, as I did not end up adding all [the individual commits as I did in the last update](/posts/asyncapi-tooling-update-1#full-changelog) but choose to only highlight certain features here now and to come. It of course does not cover all the changes, so I am trying to find a balance somewhere.

### Modelina

As Modelina creeps closer and closer to version 1, we need to start to think about its vision and goals. Therefore I have started a [discussion with the proposed vision and goals](https://github.com/asyncapi/modelina/discussions/848). The proposed vision is that Modelina becomes the GOTO solution for generating models for APIs - but, how do we achieve that?

**Proposed Goals**
- 250 contributors and at least two champions, per area of responsibility 🤝
- At least three ways to serialize models 3️⃣
- Regardless of your input, Modelina supports it 💯

If you want to influence the future of Modelina, [jump into the discussion](https://github.com/asyncapi/modelina/discussions/848)!

#### Rust
As aired in the last update a [Rust generator](https://github.com/asyncapi/modelina/pull/818) was in the works, and it finally arrived thanks to [leigh-johnson](https://github.com/leigh-johnson)! 

<CodeBlock caption="A simple Rust usage example with Modelina." language="typescript">
{`import { RustGenerator } from '@asyncapi/modelina';
const input = {
  asyncapi: '2.4.0',
  info: {
    title: 'example',
    version: '0.1.0'
  },
  channels: {
    'user/signedup': {
      subscribe: {
        message: {
          payload: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            $id: 'root',
            type: 'object',
            additionalProperties: false,
            properties: {
              email: {
                type: 'string',
                format: 'email'
              }
            }
          }
        }
      }
    }
  }
};
const generator = new RustGenerator();
const models = await generator.generate(input);
...`}</CodeBlock>

<CodeBlock caption="A simple Rust struct generated for the message payload" language="rust">
{`\#[derive(Clone, Debug, Deserialize, Eq, Hash, Ord, PartialEq, PartialOrd, Serialize)]
pub struct Root {
  \#[serde(rename="email", skip_serializing_if = "Option::is_none")]
  email: Option<String>,
}
impl Root {
  pub fn new(email: Option<String>) -> Root {
    Root {
      email,
    }
  }
}`}</CodeBlock>

The Rust generator contains many features, such as generating tuples types, unions, enums, structs, and even the crate file! 

You can read more about the feature [here](https://github.com/asyncapi/modelina/blob/next/docs/languages/Rust.md).

#### Python

[Python is right around the corner](https://github.com/asyncapi/modelina/pull/863), which builds on what [Mahak](https://github.com/mahakporwal02) [started](https://github.com/asyncapi/modelina/pull/604) within [the `next` branch](https://github.com/asyncapi/modelina/tree/next). It will start off with only the core models, without any presets to add JSON Serializers, etc, but it's a good start!

### Bundler
If you love decoupling your AsyncAPI documents, you might have reasons to bundle them all together within a single AsyncAPI document at some point. This is what [the bundler](https://github.com/asyncapi/bundler) can help you with, and [a feature that is brewing that enables you to bundle external resources into the components section of the AsyncAPI document](https://github.com/asyncapi/bundler/pull/46).

<CodeBlock caption="The scattered AsyncAPI document (asyncapi.yaml)" language="yaml">
{`asyncapi: '2.4.0'
info:
  title: Account Service
  version: 1.0.0
  description: This service is in charge of processing user signups
channels:
  user/signup:
    subscribe:
      message:
        \$ref: './UserSignedUp.yaml'`}</CodeBlock>

And with an external message definition for the `UserSignedUp`.
<CodeBlock caption="The separated message definition (UserSignedUp.yaml)" language="yaml">
{`payload:
  type: object
  properties:
    displayName:
      type: string
      description: Name of the user
    email:
      type: string
      format: email
      description: Email of the user`}</CodeBlock>

The bundler can then place all the external dependencies into the components sections to give you the bundled AsyncAPI document:
<CodeBlock caption="The bundled AsyncAPI document that uses local references (asyncapi.bundled.yaml)" language="yaml">
{`asyncapi: 2.4.0
info:
  title: Account Service
  version: 1.0.0
  description: This service is in charge of processing user signups
channels:
  user/signedup:
    subscribe:
      message:
        \$ref: '#/components/messages/UserSignedUp'
components: 
  messages:
    UserSignedUp:
      payload:
        type: object
        properties:
          displayName:
            type: string
            description: Name of the user
          email:
            type: string
            format: email
            description: Email of the user`}</CodeBlock>

## To that end

In the end, thank you to everyone who contributes to AsyncAPI in any way you can :purple_heart: If you also want to help out but don't know where to begin, then join the [#11_how-to-contribute](https://asyncapi.slack.com/archives/C02FK3YDPCL) channel on Slack so we can help you any way we can :muscle: 