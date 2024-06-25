---
title: "Setting a new standard | A Modelina backstory"
date: 2023-04-12T16:00:00+01:00
type: Communication
tags:
  - Modelina
  - Tooling
cover: /img/posts/modelina.jpg
authors:
  - name: Jonas Lagoni
    photo: /img/avatars/jonaslagoni.webp
    link: https://github.com/jonaslagoni
    byline: AsyncAPI Maintainer
excerpt: ''
---

If you been stalking me, you have without a doubt seen a massive investment from my side in [Modelina](https://modelina.org) across the last year and a half, and the reason for this is to set a new standard for model generation.

## What is Model generation?

When I talk about model generation, what I refer to is a few concepts. For AsyncAPI, it is focused on generating typed models for your payload, same for OpenAPI. But a payload is often defined with other standards such as JSON Schema and raw JSON Schema documents define nothing more then constraints on JSON data, so for such inputs it's about generating typed models that best represent **any** valid data.

It also dont stop there, we also have XSD, JSON Type Definition, AVRO, etc, that all falls within the realm of model generation. But for now, lets focus on generated typed models for your AsyncAPI payloads.

The generated models are often for strongly typed languages, where they are needed in order to have the information such as `my message is of type x` that either is very bare, or feature rich with serialization support, descriptions, custom functions, etc. 

These models can then be used in the adjacent code to minimize you manually need to write.

## It's Rise

Lets go back in time to when we first created it, we long had talked about the complexity of generating strongly typed models from message payloads and [had to figure out how we wanted to solve it](https://github.com/asyncapi/shape-up-process/issues/21). 

The main driver was that with the AsyncAPI generator and it's template engine, having each template generate the data models is a huge effort to not only maintain but also pull off. 

We could either 1) find existing library that solves the problems we phase and become a main contributor to the library, 2) we create a library from the bottom up that was designed with the [specific set of requirements](https://github.com/asyncapi/shape-up-process/issues/42). Those where:

> 1. The library MUST be integratable with other tools
> 2. The Library MUST allow extensibility of the standard models
> 3. The library MUST be able to understand multiple kinds of inputs (Avro, JSON Type defintion, JSON Schema, etc)

We never did end up finding any existing library, although [QuickType](https://quicktype.io) looked quite promising, but it was not possible for us to get involved. We therefore ended up building it from the ground up.

## Modelina
That library ended up being called Modelina, (or initially `generator-model-sdk`), 

Developers truly are a self-centered piece of work! Coding have never been a math equation, as the result various based on so many different variables, that if you use the same process in different scenarios, you will end up with different results. It's the same thought when it comes to code, "I know best". 

Thats why the focus has been to place the capability right in your hands so you can have full creative freedom with the models:
- You want to use a custom format for a string type? Sure!
- You want to use a custom model naming strategy (naming rules)? Sure!
- You want to add a custom function/method to each class? Sure!
- ... This goes on and on and on...

Modelina is not build to only produce a single answer, **it is build to be versatile and adaptive to you**!

## Building it TOGETHER

The whole idea about Modelina, is not a single small group of people build it as part of some exclusive club, this level of library is meant to be build **together**. Therefore we aim to share codeownership among the contributors that want to help out

## The long way to go

Model generation is by no means and easy game, especially when you consider the requirements. 


> Photo by <a href="https://unsplash.com/@tateisimikito?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Jukan Tateisi</a> on <a href="https://unsplash.com/photos/bJhT_8nbUA0?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
