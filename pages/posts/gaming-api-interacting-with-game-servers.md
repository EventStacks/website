---
title: "Interacting with game servers, the basic"
date: 2022-06-13T16:00:00+00:00
type: 
  - Communication
tags:
  - GamingAPI
  - AsyncAPI
  - Architecture
cover: /img/posts/gamingapi-architcture/cover.webp
authors:
  - name: Jonas Lagoni
    photo: /img/avatars/jonaslagoni.webp
    link: https://github.com/jonaslagoni
excerpt: "Wondering how you can create a setup that enables interactions with game servers by just installing a library? This blog post answers that question on a high abstraction level."
---

Wondering how you can create a setup that enables interactions with game servers by just installing a library? This blog post answers that question on a high abstraction level.
## The Target Segment

When it comes to hosting game servers, game companies generally have two approaches they can take (or a mixture of the two). 

The first is the game company themselves host the game servers. For some game companies, this means utilizing cloud technologies such as [Google cloud gaming](https://cloud.google.com/solutions/gaming) or [AWS Amazon GameSparks](https://aws.amazon.com/gamesparks/).

The second one is that the game company can let the public host them in any way they want, by simply releasing the game server executables. This enabled companies such as [Nitrado](https://server.nitrado.net/) and [GameServers](https://www.gameservers.com/) to provide a platform for you to one-click install a game server.

This is who GamingAPI targets, the games that have public game server executables that can be hooked into. Maybe in the future, if the game companies offer an API as well, that can be integrated into the ecosystem of GamingAPI, but that's for the future :smile:

## The Ultimate Goal
I want anyone to be able to easily run their game server and interact with it through 2 steps.

First, you run the game server that has the GamingAPI executables setup. This can either be done manually, especially if you use hosting providers such as [Nitrado](https://server.nitrado.net/) and [GameServers](https://www.gameservers.com/). Another way, and arguable the easiest, is by utilizing docker to run a GamingAPI docker image for the specific game, for example with [Rust](https://rust.facepunch.com/):

```bash
docker run ... gamingapi/rust-docker-image:latest
```

Next is for you to interact with it, through whatever preferred programming language you want to use. For example, if you use JS, maybe you want to do something when the server starts:

```ts
import {client} from 'gamingapi/rust';

client.connect();
client.onServerStarted((event) => {
  console.log(`Rust server ${event.serverId} just started`);
});
```

**This means you never have to leave the comforts of your favorite language to interact with your game server** :heart:

## The Architecture
<img src="/img/posts/gamingapi-architcture/simple-overview.webp"/>

For each game, GamingAPI defines primarily (but not necessarily) 2 APIs. 

For Rust, the game API is the first one defined which is for the game server itself, that defines what it provides and consumes. The game API needs a library generated in the programming language that enables us to hook into the game server.  For example for Rust (as it is built with [Unity](https://unity.com/)), C# is the primary programming language that would be needed. For Minecraft, it would be Java.

The second API is the public API that anyone can use to interact with the game server. A mirror API of the game API, that at a bare minimum has opposite operations.

Here there is not one specific language, as each programmer has developed their preferred language.

## A Concrete Example
<img src="/img/posts/gamingapi-architcture/rust-overview.webp"/>

Let's take a concrete example, with Rust there is a couple of ways to hook into a game server, the most common one is through a modding framework.

[uMod](https://umod.org/) could be one of those frameworks. This enables you to create your plugins and hook them into the game server to among other things, manipulate the game states.

Another alternative could be custom Dll injections to bypass the overhead of a framework. It could also be a proxy to manipulate the game network traffic, acting as a middleman between the game server and the players.

Regardless of what approach is used, the game API remains the same. The Rust API library is therefore an out-of-the-box C# library that will be auto-generated based on the AsyncAPI document `rust.asyncapi.json`. This AsyncAPI document defines the API of the game server.

The public API is defined with the AsyncAPI document `rust_public.asyncapi.json` which also will have auto-generated libraries in all possible (in this case I am gonna start with .NET and TS) languages.

This setup will be replicated for any game that will be supported. I am gonna start with Rust, and then probably go through all the games that uMod support to get a basis down. 

## Next

Next up is gonna be to set up the continuous code generation. I want the setup to not only autogenerate on API changes but also pack it with the correct version and release it.

> Photo by <a href="https://unsplash.com/@glenncarstenspeters?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Glenn Carstens-Peters</a> on <a href="https://unsplash.com/s/photos/game-server?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
  
  