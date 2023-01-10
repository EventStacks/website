---
title: "AsyncAPI tooling update - Week 39"
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
excerpt: 'CLI generator integration, AsyncAPI 2.5, Modelina python support and union precisions and more!'
---

> This post bundles updates from the following official tools, but not limited to: [bundler](https://github.com/asyncapi/bundler), [chatbot](https://github.com/asyncapi/chatbot), [studio](https://github.com/asyncapi/studio), [diff](https://github.com/asyncapi/diff), [glee](https://github.com/asyncapi/glee), [create-glee-app](https://github.com/asyncapi/create-glee-app), [cli](https://github.com/asyncapi/cli), [optimizer](https://github.com/asyncapi/optimizer), [modelina](https://github.com/asyncapi/modelina), [generator](https://github.com/asyncapi/generator), [generator-react-sdk](https://github.com/asyncapi/generator-react-sdk), [java-template](https://github.com/asyncapi/java-template), [java-spring-cloud-stream-template](https://github.com/asyncapi/java-spring-cloud-stream-template), [java-spring-template](https://github.com/asyncapi/java-spring-template), [dotnet-nats-template](https://github.com/asyncapi/dotnet-nats-template) and [ts-nats-template](https://github.com/asyncapi/ts-nats-template).

You can find the last tooling update [here](/posts/asyncapi-tooling-update-week-33).

Finally time for another tooling update after the holidays and catchups! 

In case you want to read what other changes have been happening get the overviews here:
- [Sergio](https://twitter.com/smoyac/)'s latest [specification and parser update](https://gist.github.com/smoya/7579feb4f1d76a77d1321111ea8ea698)
- [Maciej](https://github.com/magicmatatjahu)'s latest [design and documentation update](https://gist.github.com/magicmatatjahu/a4bf587dc88b0d07adf7cb157a257c73)
- [Missy](https://twitter.com/missyturco)'s latest [visual design and experience update ](https://missyturco.notion.site/Update-7-26e252ba508f4fe7887fec76a81680ba)
- [Alejandra](https://twitter.com/QuetzalliAle)'s latest [AsyncAPI docs update](https://gist.github.com/alequetzalli/f56c3d0c15534d9bf13c0d25efb0a969)

## Highlights
These are some of the highlights of changes that have happened in the tools or what's to come! It of course does not cover all the changes but only certain ones.

### AsyncAPI version 2.5
Yesterday AsyncAPI 2.5 was released, and shortly after most of the tools were updated to support it, some just required a simple update of the parser dependency (thank god for CI), and some required a bit more work to support the new features.

You can take a look at [Vladimír Gorej](https://twitter.com/@vladimirgorej) [release notes to see the tools and which versions you need to upgrade to](https://www.asyncapi.com/blog/release-notes-2.5.0#tooling-support).

### CLI
The [long awaited feature](https://github.com/asyncapi/cli/pull/221) from [Souvik](https://twitter.com/souvik_ns) to integrate the [generator](https://github.com/asyncapi/generator) into the CLI has finally arrived! This means you from your favorite CLI tool can trigger code generation from any template.

```
USAGE
  $ asyncapi generate fromTemplate [ASYNCAPI] [TEMPLATE] [-h] [-d <value>] [-i] [--debug] [-n <value>] [-o <value>] [--force-write] [-w] [-p <value>] [--map-base-url <value>]

ARGUMENTS
  ASYNCAPI  - Local path, url or context-name pointing to AsyncAPI file
  TEMPLATE  - Name of the generator template like for example @asyncapi/html-template or https://github.com/asyncapi/html-template

FLAGS
  -d, --disable-hook=<value>...  Disable a specific hook type or hooks from a given hook type
  -h, --help                     Show CLI help.
  -i, --install                  Installs the template and its dependencies (defaults to false)
  -n, --no-overwrite=<value>...  Glob or path of the file(s) to skip when regenerating
  -o, --output=<value>           Directory where to put the generated files (defaults to current directory)
  -p, --param=<value>...         Additional param to pass to templates
  -w, --watch                    Watches the template directory and the AsyncAPI document, and re-generate the files when changes occur. Ignores the output directory.
  --debug                        Enable more specific errors in the console
  --force-write                  Force writing of the generated files to given directory even if it is a git repo with unstaged files or not empty dir (defaults to false)
  --map-base-url=<value>         Maps all schema references from base url to local folder

DESCRIPTION
  Generates whatever you want using templates compatible with AsyncAPI Generator.

EXAMPLES
  $ asyncapi generate fromTemplate asyncapi.yaml @asyncapi/html-template --param version=1.0.0 singleFile=true --output ./docs --force-write
```

As you can see it has all the features which the current generator has, so you will not miss anything!

### Modelina

#### Union interpretation
Even though unions have been supported in the core models for some time, inputs such as AsyncAPI, JSON Schema, and OpenAPI documents did not create the appropriate models to be more accurately rendered.

Thankfully [Kenneth Aasan](https://github.com/kennethaasan) came to [the rescue and solved the issue](https://github.com/asyncapi/modelina/pull/899). This means that from version `1.0.0-next.10` you should see more accurate union representations. 

<CodeBlock caption="The scattered AsyncAPI document (asyncapi.yaml), for whatever reason the email can be either a string or number" language="yaml">
{`asyncapi: '2.5.0'
info:
  title: Account Service
  version: 1.0.0
  description: This service is in charge of processing user signups
channels:
  user/signup:
    subscribe:
      message:
        payload:
          type: object
          additionalProperties: false
          properties:
            email:
              oneOf: 
                - type: string
                - type: number`}</CodeBlock>

<CodeBlock caption="TypeScript example output with union types" language="typescript">
{`class Root {
  private _email?: string | number; \n
  constructor(input: {
    email?: string | number,
  }) {
    this._email = input.email;
  }\n
  get email(): string | number | undefined { return this._email; }
  set email(email: string | number | undefined) { this._email = email; }
}`}</CodeBlock>

If they are supported in the language of course, as many languages dont natively support unions, we still need to figure out how to handle it i.e. for [Java](https://github.com/asyncapi/modelina/issues/391), [Go](https://github.com/asyncapi/modelina/issues/392), [C#](https://github.com/asyncapi/modelina/issues/393). We currently just fall back to the most unconstrained type i.e. allow everything. TBD! 

#### Python

On the backbone of what [Mahak](https://github.com/mahakporwal02) [started](https://github.com/asyncapi/modelina/pull/604) Modelina now finally supports python!

This means you from your AsyncAPI document can get the core data model for Python:

<CodeBlock caption="The AsyncAPI document (asyncapi.yaml)" language="yaml">
{`asyncapi: '2.5.0'
info:
  title: Account Service
  version: 1.0.0
  description: This service is in charge of processing user signups
channels:
  user/signup:
    subscribe:
      message:
        payload:
          type: object
          properties:
            email:
              type: string
              format: email
              description: Email of the user`}</CodeBlock>

<CodeBlock caption="Python output for the above AsyncAPI document" language="python">
{`class Root: 
  def __init__(self, input):
    if hasattr(input, 'email'):
      self._email = input.email
  @property
  def email(self):
    return self._email
  @email.setter
  def email(self, email):
    self._email = email`}</CodeBlock>

Next up is adding presets to properly support the serialization of the data models.

### Bundler
If you love decoupling your AsyncAPI documents, you might have reasons to bundle them all together within a single AsyncAPI document at some point. This is what [the bundler](https://github.com/asyncapi/bundler) can help you with, and [a feature that's been brewing for some time finally arrived a couple of weeks ago, which enables you to bundle external resources into the components section of the AsyncAPI document](https://github.com/asyncapi/bundler/pull/46). I included it in [the last update, where you can read more about the feature](https://eventstack.tech/posts/asyncapi-tooling-update-week-33#bundler).

## To that end

In the end, thank you to everyone who contributes to AsyncAPI in any way you can :purple_heart: If you also want to help out but don't know where to begin, then join the [#11_how-to-contribute](https://asyncapi.slack.com/archives/C02FK3YDPCL) channel on Slack so we can help you any way we can :muscle: 

If you have worked on something or are working on something that you would like to be included in these updates, feel free to reach out on slack!

> Photo by <a href="https://unsplash.com/@markuswinkler?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Markus Winkler</a> on <a href="https://unsplash.com/photos/cxoR55-bels?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
