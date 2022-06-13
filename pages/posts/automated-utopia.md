---
title: "Continuous code generation - An Automated Utopia"
date: 2022-06-13T23:00:00+00:00
type: 
  - Engineering
tags:
  - GamingAPI
  - AsyncAPI
  - Code generation
  - Automation
cover: /img/posts/automated-utopia.webp
authors:
  - name: Jonas Lagoni
    photo: /img/avatars/jonaslagoni.webp
    link: https://github.com/jonaslagoni
excerpt: "In principle, the goal is simple, changes made to the AsyncAPI files will automatically generate and release generated libraries, sounds easy right?"
---

Like many other programmers, I hate doing something manually if I can avoid it. I would much rather spend 10x of the time automating it than doing it manually, for better or for worse :laughing: 

In principle, **the goal is simple, changes made to the AsyncAPI files will automatically generate and release the corresponding libraries to act as the specific application**. 

However, I had a hard time finding any resources regarding this idea, [APIMetic has something similar to what I want to achieve](https://www.apimatic.io/continuous-code-generation/), where they label it as continuous code generation. Unfortunately, nothing is open-sourced.

I am also not looking for one specific setup that only works for my case, I want a setup that can be applied to any code generator or project. So I am more interested in the building blocks that enable this utopia regardless of what protocol, and programming language the code is generated in.

## Reasons
Why use code generation in general, *I can easily set it up myself*. Yes, but why would you? 

Now that you have a contract you MUST (**not** SHOULD) follow, there must be NO discrepancies between what the contract defines, and what is actually happening, or rather can happen. Code generation is part of solving this.

The main reasons I use it are:
- **Security**, not relying on my implementations but on the implementations of a community that works together to provide the safest library possible.
- **Consistency**, regardless of what library you switch to, if you worked with any of the other APIs, you KNOW exactly how this one works. 
- **Testing**, code generation gives it right out the box, or at least it can and should. 
- **Speed of implementation and focus on business logic**, with everything being served on a silver platter, you avoid having to maintain and change the boring stuff that should just work.

So code generation is important, what about continuous code generation?

To get a complete idea of the setup for GamingAPI, please check out the [concrete example](/posts/gaming-api-interacting-with-game-servers#a-concrete-example). But imagine this, you have APIs for 10 games. This is comprised of a public API that let you interact with the game server and the game server itself which defines how it interacts with the world. 

That is 20 APIs right out the gate, and the game server API probably only needs 1 library in whatever programming language the game is written in. The public API however needs as many languages as possible.  

In our early cases, that's a minimum of 30 libraries that needs to be maintained, regenerated, and released when the APIs change. No way in hell I want to, or even remotely possible to maintain that without automation.

## Achieving Utopia

There are many aspects to achieving this utopia, so let me see if I can break down some of the core aspects of it.

Regarding code generators, there are mainly two types of code structures that can be generated, either it generates a standalone library where the project setup is complete, or it generates code that can be integrated into an already existing project setup. 

The two templates that generate the libraries I will utilize are set up to generate standalone libraries ([ts-nats-template](github.com/asyncapi/ts-nats-template/) and [dotnet-nats-template](github.com/asyncapi/dotnet-nats-template)), so that will be my focus in the setup. However, it is also one of the more complex setups, so if the templates only generated the internal code instead of the project setup, it would arguably become better and easier to achieve. 

When a new change to the API is made, the corresponding libraries for that specific API need to be regenerated, version changed, and released. 

It is not only a matter of generating code the first time, but it's also about regenerating it. Therefore the generated code needs to be framed within a setup that enables this automation... This means mixing generated code (**not changing it**) with custom code. 

There is a fine line between what AsyncAPI code templates can help you with and what you need to set up yourself, as well as how you mix them. Generally, I don't mix generated code with custom code because of the very reason that you should be able to regenerate it at any time, without having to do manual stuff to make it work. I am not sure I have the perfect answer yet, but I have one.

Some other questions right out the gate that needs to be figured out:

- With new games and new libraries always lurking around the corner, how can you create a setup that can dynamically adapt to this?
- How do you version the generated libraries correctly? [As version strategy of the APIs use semver](/posts/versioning-is-easy#gamingapi), how do you ripple effect the version changes accurately so the generated libraries are compliant with semver and avoid non-caught breaking changes? 
- How can this setup be created to fit any use-case for AsyncAPI and not just the GamingAPI project?
- How do you set it up so you locally can test the entire generation process, so you can replicate the errors when things don't go as planned?

Most likely, many more unanswered questions emerge as the setup progresses, but gotta start with something.

## Next

To better explain the setup, I am gonna split it up into multiple parts to keep the scope as minimal as possible as it get's rather hairy at times. Most likely the split will look like the following:

1. Continuous code generation - Versioning
1. Continuous code generation - TypeScript libraries
1. Continuous code generation - .NET libraries
1. Continuous code generation - Automatically set up new libraries and APIs

As some last thoughts, I wonder if you need to keep the generated code in repositories... Maybe a tool would be able to continuously release new versions of the generated libraries without needing to reside in repositories :thinking: The more I think about it, the more I like the idea. Especially considering what is required to achieve this automation setup. 

But as [Dr. Károly Zsolnai-Fehér's from Two Minute Papers](https://www.youtube.com/c/K%C3%A1rolyZsolnai) says in his videos (if you have not watched them before, highly recommend it), let's see what happens two papers down the line!

> Photo by <a href="https://unsplash.com/@iswanto?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Iswanto Arif</a> on <a href="https://unsplash.com/s/photos/beach-sitting?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>