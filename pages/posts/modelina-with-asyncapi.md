---
title: "Modelina with AsyncAPI"
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

If you want the backstory of how and why Modelina was build, [checkout the backstory post](/posts/modelina-the-backstory), and if you want a more general idea about how it works take a [look at the core of Modelina](/posts/modelina-core.md) :v: 

So, how do I use it with AsyncAPI? 

## The Concept 

Modelina is build to generate models. Payload models, POJO's, strongly typed models, which means that the foundation of Modelina is the abstraction layer of what a model is.

In Modelina that is called a Meta Model. Every input is converted into one or more depending on the input. For AsyncAPI by default it means taking all the defined messages and converting them into meta models.

With AsyncAPI it's slightly hard, because you can define message payloads with any schema format you wish, which means that Modelina also needs to understand something like Avro, Protobuf, JTD, etc. At least in theory.

Right now we take advantage of the AsyncAPI Schema parsers, that enable us to just add support for JSON Schema (at least for now).



> Photo by <a href="https://unsplash.com/@tateisimikito?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Jukan Tateisi</a> on <a href="https://unsplash.com/photos/bJhT_8nbUA0?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
