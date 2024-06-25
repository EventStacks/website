---
title: "Working on AsyncAPI at Postman - a reverse in process"
date: 2023-10-09T22:00:00+01:00
type: Communication
tags:
  - AsyncAPI
  - specification 
cover: /img/posts/request-and-reply.webp
authors:
  - name: Jonas Lagoni
    photo: /img/avatars/jonaslagoni.webp
    link: https://github.com/jonaslagoni
    byline: AsyncAPI Maintainer
excerpt: 'We started out with shape-up, left it, and now we are back, here is how we work with Open Source and AsyncAPI full time'
---

> While this is how we work on AsyncAPI at Postman, it by no means reflect how others in the industry work with open source, but I wanted to bring some attention and bring light to howe we work on AsyncAPI at Postman.

Back [in 2021](https://github.com/asyncapi/shape-up-process/issues?q=is%3Aissue+is%3Aclosed), we started working on AsyncAPI using a process called [shape-up](https://basecamp.com/shapeup). After a few cycles, in a retro-perspective a problem we faced was that we where not engaging with the community at the level open source should probably be. Shapeup simply did not enable us to split focus during the cycles for things that was unrelated to the bet. This ultimately made us go away from the shapeup and ended up on an individual approach where each of us where allowed to work on what ever we wanted to as long as it aligned with [the roadmap](https://www.asyncapi.com/roadmap).

However, a side-effect to that decision was that we all where no longer steered in the same direction. Without a strong sense of direction we where flying in a million directions, for better or worse. This made it hard to solve major problems or work on major things together, because we did not have any incentive to work together more then what regular contributing allowed or if we personally reached out to others on the team. On top of that we had no hierarchy that enabled one or the other to band together, unless there was a mutual alignment on the individual level.

So recently it started to become such a big problem, that we had to change our process again. This time, we went back to the same process, which a slight difference, cause we still had to solve the problem that made us switch in the first place.

So the small difference we added, was to select 10 repositories that we all should focus on. And of course that list is not static, it's dynamically changing based on different factors. The initial list being asyncapi-react, bindings, cli, glee, modelina, parser-api, parser-js, spec, spec-json-schemas, studio.

What that means for those repositories is that each team member is responsible to not be a blocker for others that are contributing. This among other things means that PRs/issues or comments we strive for the following:
- To respond to them within 48 hours (comes the [Mozilla Community Metrics case study](https://docs.google.com/presentation/d/1hsJLv1ieSqtXBzd5YZusY-mB8e1VJzaeOmh8Q4VeMio/edit#slide=id.g43d857af8_0177), this is something I personally have experienced multiple times).
- 

