---
title: "Complete SDK for any language and any protocol"
date: 2023-11-15T22:00:00+01:00
type: 
  - Pitch
  - Communication
tags:
  - AsyncAPI
  - Tooling
cover: /img/posts/request-and-reply.webp
authors:
  - name: Jonas Lagoni
    photo: /img/avatars/jonaslagoni.webp
    link: https://github.com/jonaslagoni
    byline: AsyncAPI Maintainer
excerpt: ''
---

I want to propose how we are going to tackle the goal `API development experience is seamless`. This is a multipart pitch, which consist of x.

# Problem

**TL;DR;**
- Having single templates per language and protocol does not create a community (low engagement)
- No real strategy around templates and what protocols they offer support to (confuse users, some support a single one, others multiple)
- Hard keep the level of usability high (testing)
- 

# Solution
Maintaining something of this magnitude are simply not possible for our team at Postman, so instead of ONLY focusing on the actual implementation, we need to be facilitators. This facilitation process might stretch across multiple cycles.

# Solution guidelines

Exposed functions:
- A function per operation in the AsyncAPI document, that lets you forget about the specific channel and gives you a clear syntax including message payload, headers, and parameters (with flipped meaning)
- A function per channel in the AsyncAPI document, that lets you easily interact with the specific channel including the message payload, headers, and parameters that lets you interact with it however you like, regardless of operation
- A function per server defined in the AsyncAPI document, with the correct security details.
- A function per channel that validates the received data against the defined message payload, headers, and content type.

Exposed models:
- A typed model that represent the payload for each defined message in the AsyncAPI document, that enable multiple content type encodings such as JSON, binary, etc.
- A typed model that represent the headers for each defined message in the AsyncAPI document. 
- A typed model that bundles message information defined in the AsyncAPI document, including payload, headers, and content type.

The bundled:
- A full library that has all or partial features of exposed models and exposed functions that easily lets others interact with my application defined in the AsyncAPI document.
- A full library that has all the above features that lets me focus on my business logic of the application rather then the communication aspects.
- A partial library that I can generate (and keep generating) into my existing project so I can focus on my business logic.

Each of these outputs, should be possible across multiple languages, multiple protocols, and multiple clients (there can be more then one client implementation per protocol).

Requirements:
- If possible we could write a small shell around the code code generation so what generates the code can be reused by other generators.

Stage 1: Preparation

This is all about preparing for the engagement with the community in stage 2 and ensuring everything is setup to scale.

- Make sure Modelina can easily integrate with generator for type support (so we dont have to care about payloads in templates)
- Give generator documentation an overhaul (if needed)
- Prepare the workshops and promote them (making the templates together)
- Prepare how to have multiple protocols in a single template (i.e. setup the right framework/API to use across languages so they remain similar)
- Create templates for templates to easy create new repositories for the languages (so we have bare minimum setup with minimal parameters, debug scripts, dependencies, and all that stuff)

Stage 2: Community work
There are no way we can scale this just within our team, so we need to leverage the community as much as possible. This means that instead of creating all the templates ourself, we create a framework for others to do the same through workshops, live streams, blog posts, etc.

- Host workshops
- Host live streams
- Create templates live 
- Teach creating templates

Stage 3: Enabling others

This stage is all about getting people to engage with the new templates and enable contribution from others.

- Creating good first issues
- Engage in issues and PRs and discussions (max 24h)
- Live stream solving issues
- 

# Boundaries

- Initial implementation should be done in one language such as Java, Go, TypeScript, Rust, or C# with support for a single protocol either Kafka, WebSocket, or MQTT with JSON message encoding
- Getting a codeowner per protocol while having core codeowner for the language as well (following similar setup as we have in Modelina)
