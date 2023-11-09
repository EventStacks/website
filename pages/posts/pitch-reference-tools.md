---
title: "Better reference handling for AsyncAPI"
date: 2023-11-09T08:00:00+01:00
type: 
  - Pitch
  - Communication
tags:
  - AsyncAPI
  - Tooling
cover: /img/posts/pitch-reference-tools.webp
authors:
  - name: Jonas Lagoni
    photo: /img/avatars/jonaslagoni.webp
    link: https://github.com/jonaslagoni
    byline: AsyncAPI Maintainer
excerpt: 'How can we improve reference handling for AsyncAPI and beyond?'
---

For too long we have run into problems with references, could not use private references, could not resolve non-JSON references (Protobuf, etc), did not correctly work well when different standards were involved, and the list goes on. This pitch proposes a way to solve these things, while still providing the flexibility and extensibility to support any of your use cases.

This pitch is something I suggested for our team at Postman to work on for AsyncAPI. This has NOT been selected for development yet but is a suggestion (pitch) from my side. You can find the latest up-to-date version here (feel free to leave a comment!): [Discussion, Pitch: Better reference handling for AsyncAPI](https://github.com/jonaslagoni/jonaslagoni/discussions/2).

# Problem

These are the problems that this pitch aims to solve.

**TL;DR:**
- Problem 1: References cannot be loaded in a context-dependent way.
- Problem 2: Non-JSON/YAML references cannot be used.
- Problem 3: Cannot load references behind closed doors.

We have always used third-party tools to handle references for AsyncAPI, but nothing so far has ever solved all the needs that we have, on top of this the reference handling that it did support, does not allow the extensibility needed for AsyncAPI.

## Problem 1: Context Dependant
Depending on where in the AsyncAPI document you use references, it needs to behave differently following different standards. 

If you define a payload with an OpenAPI schema object, subsequent references in that object need to be [resolved based on their standard](https://spec.openapis.org/oas/v3.0.3#reference-object). [Same for any other schema format used](https://www.asyncapi.com/docs/reference/specification/v2.6.0#messageObjectSchemaFormatTable).

This is one of the major problems we need to solve, cause no other tool we have found so far can handle this.

## Problem 2: Non-JSON/YAML References
In AsyncAPI, we have had multiple discussions in multiple places about wanting to use payload models such as Protobuf and XSD, but that requires that the reference tool can support these non-JSON/YAML files.

No other tool we have found so far can handle these different reference formats.

## Problem 3: Load It From Anywhere

A problem we have had for a long time is that users want to load references, that are usually behind closed doors. 

No other tool we have found so far, can handle or allow us to extend existing handlers to support loading references from anywhere.

# Solution

The way to build this solution is through extensibility, assuming that we cannot know all the use cases, but allow the user to customize the behavior as they see fit while still providing support for the major use cases.

We need to remember that this solution should be scalable across multiple languages, especially when we join it together with the [Scaling AsyncAPI parsers pitch](https://eventstack.tech/posts/pitch-scaling-parsers). Although it's out of scope to include multiple languages, documenting the different use cases and the solution to each is important!

Do have a look at existing solutions and whether we can contribute to them instead, however, if there is none, don't hesitate to create it from scratch.

# Solution Guidelines

I suggest that we create the first implementation in TypeScript/JavaScript, so we can immediately benefit from it in our parser and [potential upcoming parser](https://eventstack.tech/posts/pitch-scaling-parsers).s

Requirements that the first solution should handle:
- Must be able to handle cyclic references
- Must be able to handle multiple standards within each other depending on the context of where the reference is located in the main input
- Must be able to walk over non-JSON/YAML structures such as Protobuf and XML syntax
- Must be able to handle references in protected locations
- Must be extendible to support new and unknown standards
- Must be extendible to support new and unknown locations 
- Must be able to load references from a file, within the document, or remotely

There are different ways that users should be able to interact with the library, i.e. its API surface ([I have left out some things for long-term instead of now](#long-term)):
- Replace the entire containing object with the resolved resource from the reference  (i.e `{$ref: ./test}` becomes `{...}`)
- Must be able to control the resolvement flow, and manually change the resolved object instance.
For example [in our parser](https://github.com/asyncapi/parser-js/issues/873), we need to be able to control the flow of resolving references, where the resolved object changes over time. 

Main inputs that should be supported:
1. AsyncAPI

Secondary inputs that you can encounter in the main input and that should be supported:
1. AsyncAPI Reference
2. JSON Schema Draft 7
3. [Protobuf and Protobuf imports](https://protobuf.dev/programming-guides/proto3/#importing)

# Boundaries

- Do not deep dive into the small edge cases, focus on the problems and create an issue for edge cases.
- Do not care about other languages as it will increase the scope exponentially, instead only focus on documenting the different use cases and solutions that were made.

# Risks

## 1. Too Complicated
Standards are notoriously complicated, and when you are implementing something where you have multiple standards interacting with each other, it becomes even more complicated. This case is no different. To mitigate the risk try to re-use from other libraries as much as possible and even incorporate utility libraries where possible.

# Long-term

Secondary inputs that you can encounter in the main input and that we should support long-term:
1. [Avro Schema](https://deeptimittalblogger.medium.com/defining-reusable-schemas-in-avro-991f2e21d1ca)
2. [XSD schemaLocation](https://www.oreilly.com/library/view/xml-in-a/0596007647/re168.html)
3. OpenAPI reference
4. Newer JSON Schema versions
5. Other

Long-term we need to support the following ways to interact with the library:

- Resolve the fully qualified URI for a reference (this varies because the potential base URI is located differently according to the input), and it depends on the standard 
- Get the resolved resource from the reference
- Replace the URI reference string with the resolved resource from the reference (i.e. `{$ref: ./test}` becomes `{$ref: {...}}`). This is needed for newer versions of JSON Schema

# Related resources

Related issues that this pitch will help solve:
- My initial proposal was added as a discussion and was then converted to a pitch https://github.com/orgs/asyncapi/discussions/485.
- https://github.com/asyncapi/parser-js/issues/761
- https://github.com/asyncapi/studio/issues/528
- https://github.com/asyncapi/parser-js/issues/866
- https://github.com/asyncapi/parser-js/issues/734
- https://github.com/asyncapi/generator/issues/1002
- https://github.com/asyncapi/generator/issues/1057
- https://github.com/asyncapi/spec/issues/930
- https://github.com/asyncapi/parser-js/issues/404
- https://github.com/asyncapi/spec/issues/414
- https://github.com/asyncapi/spec/issues/881
- https://github.com/asyncapi/asyncapi-react/issues/731
- https://github.com/asyncapi/parser-js/issues/797
- https://github.com/asyncapi/spec/issues/216
- https://github.com/asyncapi/parser-go/issues/146
- https://github.com/asyncapi/modelina/issues/608
- https://github.com/asyncapi/spec/issues/881
- https://github.com/asyncapi/shape-up-process/issues/56
- https://github.com/asyncapi/spec/issues/624
- https://github.com/asyncapi/spec/issues/163
- https://github.com/asyncapi/converter-js/issues/90
- https://github.com/asyncapi/parser-js/issues/873

Other related resources:
- https://datatracker.ietf.org/doc/html/rfc3986 
- https://datatracker.ietf.org/doc/html/draft-pbryan-zyp-json-ref-03
- https://github.com/APIDevTools/json-schema-ref-parser/issues/145
- https://github.com/asyncapi/spec/pull/825
- https://github.com/json-schema-org/json-schema-spec/issues/724
- https://github.com/json-schema-org/json-schema-spec/issues/729

> Photo by <a href="https://unsplash.com/@_nicksmith?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Nick Smith</a> on <a href="https://unsplash.com/photos/a-library-with-many-books-kkqZjDhAuoM?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  