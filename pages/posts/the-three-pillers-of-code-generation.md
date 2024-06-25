---
title: "The Three Pillars of code generation"
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

This concept is something new for me too, because I have never been able to conceptualize it's entirety until now. I have had pieces of this along the way, individually, but never the greater picture.

# The Three Pillars

When it comes to code generation, there is in my opinion 3 pillars needed to form a perfect triangle, of tools that go hand in hand when it comes to not only APIs, but code generation in general. 

## The data models
POJOs, Data Transfer Object (DTO), beans, Model, is the core representation of data and how you interact with it. When it comes to code generation this part is the core of it all. 

- For AsyncAPI its about generating models that represent the payloads of operations, on any kind of protocol, in the programming language of your choice, based on what ever standard you use to define the payload with.
- For OpenAPI it's about generating models that represent the payload of REST operations on both server and client side, in any kind of programming language, with JSON Schema payload models. 
- For JSON Schema, it's about generating a model that best represent **any** valid data based on the constraint rules. 
- For AVRO, its about generating a model that follows the standard.

For JSON Schema and AVRO that is what code generation is, for AsyncAPI and OpenAPI it's just a small part of it. 

## The Project structure


## Integration

In the world of APIs, code generation is often seen as a one time thing, that you only do once. In the world of REST interfaces when building servers, you mix and match generated code with custom code, that make it hard to re-generate it. 

Generated code should follow you document and be versioned accordingly,

> Photo by <a href="https://unsplash.com/@tateisimikito?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Jukan Tateisi</a> on <a href="https://unsplash.com/photos/bJhT_8nbUA0?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
