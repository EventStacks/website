---
title: "AsyncAPI versioning is easy, right?"
date: 2022-03-26T20:00:00+00:00
type: 
  - Engineering
  - Governance
tags:
  - GamingAPI
  - NATS
  - AsyncAPI
  - Versioning
cover: /img/posts/gaming-api-versioning.webp
authors:
  - name: Jonas Lagoni
    photo: /img/avatars/jonaslagoni.webp
    link: https://github.com/jonaslagoni
excerpt: "How can you do versioning with AsyncAPI and what goes into selecting a versioning strategy?"
---

As [GamingAPI](https://gamingapi.org) is using AsyncAPI designing the system, I need to figure out how I want to do versioning.

Because others can interact with the services provided, it can have "catastrophic" ripple effects downstream if I don't follow a reliable and consistent strategy. Imagine I accidentally create a small version change but it breaks downstream services? Yea, let's not do that if we can avoid it.

However, there are no well-defined resources for how to handle versioning in AsyncAPI ([yet](https://github.com/asyncapi/website/issues/622)). Therefore we will have to do a bit of investigation as to how to handle this.

**As it turns out, versioning is by no means easy as the title hints at**... The version strategy you use with AsyncAPI depends on many different variables that affect the pros and cons of the type of strategies you can use. Let's try and determine what strategies are there and what affects the decision.

> TLDR: No one strategy fits all - There is no silver bullet! Know the different choices and weigh the possibilities to the best of your ability and learn as you go.

## Possible version strategies
As OpenAPI defines REST APIs, there might be some learning from them we can take into account. 

Many resources explain versioning, both with use-cases and concrete theories, however, I want to highlight two of them. [Phil](https://apisyouwonthate.com/authors/phil-sturgeon) has written a very nice post about [how there is no silver bullet for versioning](https://apisyouwonthate.com/blog/api-versioning-has-no-right-way) (like anything in life). Supplementing that with [Mark](https://www.mnot.net/personal/)'s post about [API evolution](https://www.mnot.net/blog/2012/12/04/api-evolution.html) it gives you a pretty good idea about how to achieve it for OpenAPI.

One thing that the other resources do not mention is schema versioning. As far as I can figure out, it's not a thing in OpenAPI, however, it is for us because products have emerged to produce such features for event-driven architectures, i.e. [schema registry](https://docs.confluent.io/platform/current/schema-registry/index.html).

### Global version
```yml
asyncapi: 2.3.0
info:
  version: x.x.x
```

In AsyncAPI you can define the `version` for the AsyncAPI document (as for OpenAPI), which is the global version of the API. Resource versioning as [Phil mentions](https://apisyouwonthate.com/blog/api-versioning-has-no-right-way) is local for that specific resource and document version is global. I can't find much information about how people currently version this in practice, but I imagine it's the same as any other library.

One thing to notice is that there is different versioning types here. The most used (that I know) of version types are [calendar versioning](https://calver.org/) and [semantic versioning](https://semver.org/), which both have benefits and drawbacks. 

The way I see the difference between the two is that `calver` is always a new major version in `semver`. That way you ensure that the old API never breaks the new one.

## Things you might want to consider
Now that you have the basic rundown of the different ways to do versioning, let's look at what might affect your decision making.

### Product requirements
The requirements for the product you develop can have influence on what version strategy to use.

Do you have control over all the applications which interact in the system? Can you decide when to update producers and consumers?

For example with GamingAPI, I plan to make the underlying events completely public, and have NO control over producers and consumers, and therefore as to which versions are used.

### Protocol specific
Each protocol has specific quarks and features that might be leveraged with a specific version strategy.

For example with NATS, you have the possibility to [granularly fine-tune access control on subjects](https://docs.nats.io/running-a-nats-service/configuration/securing_nats/authorization#permission-map) through permission maps. Through this if I use resource versioning for the topic, I will be able to control who and when new versions are made available.

### Event-driven architectures
There exist many different event-driven architectures that can affect the decision on a version strategy. 

Consider event-sourcing, where you have a single source of truth of what happened in your system. [There already exist version strategies that can be adapted](https://valerii-udodov.com/posts/event-sourcing/events-versioning/), however, how do these relate to AsyncAPI and the rest of the affecting variables?

The same of course goes for regular Pub/Sub messaging and other architectures.

### Product and tooling
The products and tooling might also affect your decision-making.

Say `semver` is more supported in tools/products than `calver`, if you went with `calver` it would probably mean you would be forced to build some of the tools yourself.

By products I mean external platforms and tools not publicly available, and what those are depends on the technology stack you use.

## GamingAPI
So what will it be? A or B? Honestly I found it hard to choose, but eventually, I settled upon the following strategy.

### Semver

```yml
asyncapi: 2.3.0
info: 
  version: x.x.x
```

I am going with `semver` as the backbone of the versioning strategy, because:
- As much as possible I want to limit breaking changes and when it affects the users of the network. This means that there are some very strict limitations on what may change in the AsyncAPI document. 
- In tooling, I want to utilize [sematic release](https://github.com/semantic-release/semantic-release) and I assume that there is just better tooling support for this than `calver` based on my experience.
- As I do not plan to release the API one time each year, but continuously, it makes more sense to stick to `semver`.

### Resource versioning
```yml
asyncapi: 2.3.0
info: 
  version: 1.2.0
channels: 
  v1/game/server/started:
    ...
  v2/game/server/started:
    ...
```

I am going to include a major version number in the topic alongside using `semver` for the document version of the API. 

My reasons for using it is:
- I want to control when a resource is breaking, meaning that I can start to work on the new version and integrate it as I go, without having to break the entire API. Eventually, I can clean everything up and break the entire API once I fine-tune it.
- As mentioned earlier regarding NATS (as I plan to use), I want to control who have access to new versions through permission maps.

Furthermore, to explain the version part, `v1` only refers to the topic itself and the versioning herein. This means that if I make something that can be considered a breaking change of the event, I would need to increase the version number to stay compliant. What the system will consider a breaking change can be read below.

If I wish to change the topic to something different, say I want to go with `server/started` instead of `game/server/started` (`v1/game/server/started`). The new topic would be `v1/server/started`, because it's the first time this topic enters the system, hence `v1`.

### Breaking changes
So what is considered a breaking change, and why is it important we discuss it?

Consider the following channel payload:

```yml
channels:
  v1/game/server/started:
    publish: 
      message:
        payload:
          type: object
          required: 
            - test
          properties:
            test:
              type: string
```

Say I wanted to make the `test` property optional, do you consider that a breaking change?

**The reality is that it's both**, and it depends on your perspective. For anyone who produces the event, because if it was required before, old producers will always include the property, for new producers they potentially include it. So from that perspective, there are no issues. 

But what about your consumers? If they expect the property to always be present, and it's suddenly is not? Well, that's a breaking change for them. 

You can reverse this example as well, so it's a breaking change for the producer instead of the consumer (This is also a [subject for discussion in the AsyncAPI specification itself](https://github.com/asyncapi/spec/issues/688)).

Therefore, there are very few things you are allowed to change (I don't think this is the full list, but this is what comes to mind at the moment):
- Adding new optional properties and enum values
- Changing meta-information (such as description, etc)

Anything else is not allowed to change in any way without it being considered a breaking change.

## Next

At least that is my thoughts at the moment, will they change in the future? Maybe... The next question becomes, [how do you use the version strategy in practice?](/posts/versioning-in-practice) 

Related resources about the subject:
- https://valerii-udodov.com/posts/event-sourcing/events-versioning/
- https://apisyouwonthate.com/blog/api-versioning-has-no-right-way
- https://www.mnot.net/blog/2012/12/04/api-evolution.html
- https://opensource.zalando.com/restful-api-guidelines/
- https://event-driven.io/en/how_to_do_event_versioning/
- https://event-driven.io/en/lets_take_care_of_ourselves_thoughts_about_comptibility/
- https://docs.confluent.io/platform/current/schema-registry/avro.html
- https://cloud.google.com/endpoints/docs/openapi/versioning-an-api

> Photo by <a href="https://unsplash.com/@chrislawton?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Chris Lawton</a> on <a href="https://unsplash.com/s/photos/change?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
  