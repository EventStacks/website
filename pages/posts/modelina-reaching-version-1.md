---
title: "A bedrock for code generators - Modelina V1"
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
excerpt: ''
---

`Modelina`, or rather `generator-model-sdk` (yes, that was the original name!)

With the release of Modelina version 1, it sits as a bedrock for future code generators. It is build not just to generate the payload models for AsyncAPI, but any kind of format... 

### It's Rise

Lets go back in time to when we first created it, we long had talked about the complexity of generating strongly typed models from message payloads and [had to figure out how we wanted to solve it](https://github.com/asyncapi/shape-up-process/issues/21). 

The main driver was that with the AsyncAPI generator and it's template engine, having each template generate the data models is a huge effort to not only maintain but also pull off. 

We could either 1) find existing library that solves the problems we phase and become a main contributor to the library, 2) we create a library from the bottom up that was designed with the [specific set of requirements](https://github.com/asyncapi/shape-up-process/issues/42).

> 1. The library MUST be integrateable with our AsyncAPI generator and template engine for React and nunjucks.
> 2. The Library MUST allow extensibility of the existing data models
> 3. The library MUST be able to understand all kinds of inputs (Avro, JSON Type defintion, JSON Schema, etc)

We never did end up finding any existing library, altough QuickType looked quite promesing, but it was not possible for us to get involved.

So probably no stranger to you by now but [we ended up implementing our own library](https://github.com/asyncapi/shape-up-process/issues/43).

### The rise of integrations
In AsyncAPI, one of it's most prominent features is your ability to decide on how you want to define the payload structure. Maybe you are keen on using JSON Schema, and define the payloads as a constraint system, or maybe you are an Avro person? 

In reality it doesent matter, Modelina should be able to generate the data models regardless of the underlying standard you follow. It's also one of the major reasons it support many different kind of inputs https://github.com/asyncapi/modelina#features.

One Modelinas main features, is actually not so much generating the models, but rather give you access to information about the models in memory, so something like the AsyncAPI Generator and templates each can interact with the generated models.

### The rise of possibilities
Why do you think there exist so many different programming languages? 

When shove comes to shove, selecting anything for your stack depends in the end, on your team's current level and experience, and then where you want to go.

### Extensibility and customization of the model generation
Developers truly are a self-centered piece of work! Coding have never been a math equation, as the result various based on so many different variables, that if you use the same process in different scenarios, you will end up with different results. It's the same thought when it comes to code, "I know best". 

The library MUST be able to provide an answer to the use-case such as:
- I want to use a custom format for a string type
- I want to use a custom model naming strategy (naming rules)
- I want to add a custom function/method to each class
- ... This goes on and on and on...

The way Modelina currently handles this is through something called Presets. If you are familar to Node, it's very similar in nature to middlewares, where you can layer calls ontop of each other. Let me give you a basic example.

Although customization and extensibility is nice for the common use-case, one specific one is the main driver, and that is when generating the models for serilization models into data that is used as payloads (well thats the main use-case for AsyncAPI). People have different requirements based on their project, environment and expertise, so in some cases you want to serilize them into JSON, and in other binary or even into XML format. Maybe you normally use a specific library for it, take C# for example, if you want to serialize the models into JSON, the two main ways are the native `System.Json.Text` or `Newtonsoft`. With Modelinas presets it's as simple as changing presets, for [System.Json.Text it's CSHARP_JSON_SERIALIZER_PRESET](https://github.com/asyncapi/modelina/blob/next/examples/csharp-generate-json-serializer/index.ts):
```ts
const generator = new CSharpGenerator({ 
  presets: [
    CSHARP_JSON_SERIALIZER_PRESET
  ]
});
```

For [Newtonsoft it's `CSHARP_NEWTONSOFT_SERIALIZER_PRESET`](https://github.com/asyncapi/modelina/blob/next/examples/csharp-generate-newtonsoft-serializer/index.ts):
```ts
const generator = new CSharpGenerator({ 
  presets: [
    CSHARP_NEWTONSOFT_SERIALIZER_PRESET
  ]
});
```

Each of these presets just adds additional rendering ontop of the default one, exactly as you are able to so you end up with the desired model in your use-case.

Read more about presets here: https://github.com/asyncapi/modelina/blob/next/docs/presets.md

### Supporting all kinds of inputs
The special use-case in AsyncAPI is that we have `schemaFormat` which allows you to use all kinds of different schema formats for describing your message payload. That means we need to be able to generate data models from JSON Schema draft 4, 7, 2019-09, 2020-12, Avro, JTD (JSON Type definition), in the future Protobuf, GraphQL, XSD, or the new cool format!

Imagine all code templates to support this and duplicate the effort :grim:

Initially we (or rather I did), the mistake of not explicitly create the IDL for Modelina, but instead relyed on a structure similar to JSON Schema this created an instane complexity in presets that made the LOC nearly double of what it is today, see the difference here XXX.

Within Modelina ALL inputs are converted into a list of MetaModels which can be of the following core types:
- `ArrayModel` is an unordered collection of a specific MetaModel.
- `TupleModel` is an ordered collection of MetaModels.
- `EnumModel` is group of constants.
- `UnionModel` represent that the model can be either/or other MetaModels.
- `ObjectModel` is a structure, that can be generated to class/interface/struct, etc, depending on the output language
- `DictionaryModel` is a map/dictionary of key/value MetaModels.
- `ReferencedModel` is primarily used for when models should be split up (see the splitting of meta models) and referenced, or it could be an external reference to an external entity.
- `BooleanModel` represent boolean values.
- `IntegerModel` represent natural numbers.
- `FloatModel` represent floating-point numbers.
- `StringModel` represent string values.
- `AnyModel` represent generic values that cannot otherwise be represented by one of the other models.

This is also one of the core supported inputs to Modelina, meaning you can create your own input converter for any type of input you may have, and still use Modelina. And the whole idea is that regarding of which input you generate models from, the core generator or presets do not have to change for it to support the input.

### The future
SO... now what?

Well, I started a discussion laying out what I think is the next steps: https://github.com/asyncapi/modelina/discussions/848

It comes down to the following:

1. 250 contributors and at least two champions per area of responsibility

I have no intention of being a dictator and sole owner of Modelina, it's simply not how open-source works nor feesible. We want to give you the ownership of Modelina, that means you are the maintainer for certain parts, where you have (without neither me or Maciej approval) to merge changes and maintain it as you see fit! You have the resposibility! Read more about [the champions concept here](https://github.com/asyncapi/modelina/blob/master/docs/champions.md). We already have [Leigh Johnson](https://github.com/leigh-johnson) for Rust, Samridhi-98 for TypeScript and JavaScript, ron-debajyoti for C# and TypeScript input processor. 

This means we need to create an environment, that enables champions as much as possible.

2. At least 3 different ways of serializing models (this means adding support for serialization models to XML, JSON, and binary).

As I expressed in [](#extensibility-and-customization-of-the-model-generation) it should be possible to serilize the data models into any serilized format. In TypeScript 

1. Regardless of your input, Modelina supports it

Because you can use any schema format in AsyncAPI, we need to be prepared for any type of input, this means adding support for JSON Schema draft 2019-09, 2020-12, Avro, JSON Type definition, GraphQL Schema, Protobuf, OpenAPI 3.1, Postman collections, you name it!

### Conclusion 

Modelina is being build as a core tool that you can use years to come, regardless of the situation you see yourself in, maybe you switch job where they use Avro instead of JSON Schema? Still you can use Modelina. Maybe they use Protobuf instead of AsyncAPI? Still you can use Modelina. Are you using Java instead of TypeScript? Still you can use Modelina.

The idea is for it to be a versitile tool that once you learn it will keep providing value to you and be part of your development workflow, regardless of standards and situations you find yourself in.