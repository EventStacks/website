---
title: "Getting started with API governance in AsyncAPI"
date: 2022-03-30T18:00:00+00:00
type: 
  - Engineering
  - Governance
tags:
  - GamingAPI
  - NATS
  - AsyncAPI
  - Versioning
cover: /img/posts/governance-getting-started.webp
authors:
  - name: Jonas Lagoni
    photo: /img/avatars/jonaslagoni.webp
    link: https://github.com/jonaslagoni
excerpt: "This post introduces the initial set of governance guidelines and sets the foundation for building the APIs."
---

Since [GamingAPI](https://gamingapi.org) are open source, I want to create some consistency and set the level of expectation that one can expect from the project.

So what are API governance? Well, there are different interpretations of it, [Janet points to 9 different things to focus on](https://swagger.io/resources/articles/best-practices-in-api-governance/), [Kin points to 5](https://blog.postman.com/platform-api-governance/), but what they both points towards one thing. I like to think about this as **if your API's was a government, how does the government govern?**

It sounds like a dry pill you just have to swallow to get over with it. However, there is meaning behind it, and remember if you don't think the individual guidelines are for you, don't add them :smile:

What I want to focus on at the moment are what Kin refers to as discovery, consistency, and delivery.

## Consistency
I feel like it's important to set a level of consistency when designing the APIs. This makes it easier for others to consume them and even contribute to them. Currently, I have all of the [AsyncAPI documents in a GitHub repository](https://github.com/GamingAPI/definitions). It is also here that most of these consistencies must be enforced.

I do have a few requirements regarding the consistency guidelines though.
1. It MUST be executable locally on the developer's machine, so you don't have to wait to check whether your changes will go through the CI.
2. It MUST be a required check for making ANY changes to the AsyncAPI documents. This means that we should be confident that if all automated checks pass there should be no problems in merging the change.

On to the specific design guidelines, few of them are gonna be borrowed directly from [Zalando's API guidelines](https://opensource.zalando.com/restful-api-guidelines):
- [MUST contain API meta information [218]](https://opensource.zalando.com/restful-api-guidelines/#218).
- [MUST treat events as part of the service interface [194]](https://opensource.zalando.com/restful-api-guidelines/#194)).
- [MUST use semantic versioning [116]](https://opensource.zalando.com/restful-api-guidelines/#116) ([read more about the versioning strategy here](/posts/versioning-is-easy)).
- [MUST follow API first principle [100]](https://opensource.zalando.com/restful-api-guidelines/#100).
- [MUST write APIs using U.S. English [103]](https://opensource.zalando.com/restful-api-guidelines/#103).
- [MUST property names must be snake_case (and never camel case) [118]](https://opensource.zalando.com/restful-api-guidelines/#118).

Furthermore, the following is added to extend the above:
- MUST use the same schema format [partly spired by 196](https://opensource.zalando.com/restful-api-guidelines/#196) (because both REST and NATS are used, sharing the message schema payload between the two specifications is a must).
- MUST name date/time properties with `_at` suffix [inspired by 235](https://opensource.zalando.com/restful-api-guidelines/#235).
- MUST declare enum values using `UPPER_SNAKE_CASE` string [inspired by 240](https://opensource.zalando.com/restful-api-guidelines/#240).
- SHOULD avoid `additionalProperties` unless used as a map [partly inspired by 210](https://opensource.zalando.com/restful-api-guidelines/#210) (each object should be as constrained as possible and `additionalProperties` should not be used unless used to define a map.).
- MUST never break compatibility ([read more about the versioning strategy here](/posts/versioning-is-easy)).
- MUST include semantic versioning in channels (each channel and path must use resource versioning. [Read more about the versioning strategy here](/posts/versioning-is-easy)).
- MUST treat version 0 as work in progress (when getting started, changes happen rapidly, and to accommodate that, any time version 0 is used either in the documents or in a channel, it MUST be treated as work in progress and can potentially contain breaking changes without notice).
- MUST use references where at all possible (to leverage reusability, references MUST be used where at all possible).

## Delivery
I want to set some requirements for the delivery of the APIs and what consumers can expect from them.

- MUST monitor all GamingAPI services (If there exist services within the GamingAPI network they MUST be monitored).
- MUST make pre-built clients easily accessible for each public consumer (if it is expected others (outside of GamingAPI are a consumer or producers of events, i.e. the AsyncAPI document is targeting them) pre-built binaries MUST be made available. This will be through code generation from the specification).
- MUST always use the newest specification version (each time a new specification version is released, the underlying documents must be kept up to date).

## Discovery
I think it is important to set a level of discoverability for the APIs, it's not enough that they are there, people also need a way to discover them.

- MUST make all public API's available on [gamingapi.org](https://gamingapi.org) (not only simple [API documentation](https://gamingapi.org/platform/games/rust/server/api), but also more complex [event discovery and relations](https://gamingapi.org/platform/games/rust/server/flow)).
- MUST provide API specification using AsyncAPI [inspired by #101](https://opensource.zalando.com/restful-api-guidelines/#101).
- MUST make the governance guidelines available on [gamingapi.org](https://gamingapi.org) to make them easily discoverable.

## Next

There are a lot of different perspectives that I have not taken into account, some I do plan to include at a later time:
- As I have no experience with deprecation in production, I have left that out for now until I encounter it and can take a stance on it.
- As mentioned with the [NATS setup](/posts/nats-and-game-servers), I still have to figure out how to handle access control. And the solution for that needs to be added as part of the governance guidelines (I think).

**Governance guidelines are great and all but how do you use them in practice? :thinking:**

Related resources:
- https://blog.postman.com/platform-api-governance/
- https://www.digitalml.com/api-governance-best-practices/
- https://swagger.io/resources/articles/best-practices-in-api-governance/
- https://apievangelist.com/2018/02/06/you-have-to-know-where-all-your-apis-are-before-you-can-deliver-on-api-governance/
- https://opensource.zalando.com/restful-api-guidelines
- https://www.postman.com/webinars/api-governance/

> Photo by <a href="https://unsplash.com/@adijoshi11?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Aditya Joshi</a> on <a href="https://unsplash.com/s/photos/government?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
  