---
title: "Modelina under the hood"
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

If you want the backstory of how and why Modelina was build, [checkout the introduction post](/posts/modelina-the-backstory) :v: 

So, how does it work?

It's split up into 2 sections, the input processing and generators

## The Inputs 

Modelina is build to generate models. Payload models, POJO's, strongly typed models, which means that the foundation of Modelina is it's abstraction layer of what a model is.

In Modelina that is called a Meta Model. Every input is converted into one or more depending on the input. For AsyncAPI by default it means taking all the defined messages and converting them into meta models.

Modelina is not only build to support AsyncAPI though, even if it's under the organization. For example there are no difference between OpenAPI documents generating models vs AsyncAPI and JSON Schema.

## The generators

Once the meta models reach the generators, they are going through a process called `constraining` (before anything gets generated). 

This step is important because it prepares the universal meta models (that each generator can understand) into what THAT specific generator understands and it's constrains. 

For example, in typescript you are not allowed to have a property called `yield` but in C# you are. In C# you are not allowed to have a property with similar name as the enclosing model (say model name is `MyTest` you cant have a property with that name) in TypeScript you can.

So once a meta model is constrained to a generator (output/language), you can use it's information directly in the generator. For example accessing `model.name` will never give you incorrect values for the generator at hand.

## Customization

By default, Modelina has a specific output from each generator, something we see as the bare minimum for the model representation. So you as a user will have to customize it to what your are expecting out of it.

There are so many different use-cases and features that there is not a not a silver bullet.

Almost everything within Modelina is based callbacks in one way or another.

Want to change how a property is rendered? Overwrite it, append or prepend content as you wish.

Want to use already pre-build callbacks thats exposed by Modelina? Just import them and use them.

Want to overwrite naming rules of models such as whether properties are formatted with pascal case or camel case? Just overwrite the callback and implement the logic as you see fit.

> Photo by <a href="https://unsplash.com/@tateisimikito?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Jukan Tateisi</a> on <a href="https://unsplash.com/photos/bJhT_8nbUA0?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
