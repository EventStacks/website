---
title: "GamingAPI - The Architecture"
date: 2022-05-04T16:00:00+00:00
type: 
  - Engineering
tags:
  - GamingAPI
  - AsyncAPI
cover: /img/posts/gamingapi-architcture/cover.webp
authors:
  - name: Jonas Lagoni
    photo: /img/avatars/jonaslagoni.webp
    link: https://github.com/jonaslagoni
excerpt: "So what is the setup that enables interactions with game servers by just installing a library?"
---

Up until now I have not really put my thoughts of the architecture of GamingAPI into writing. This post should clear that up.

## The target segment

When it comes to hosting game servers, game companies generally have two approaches they can take (or a mixture of the two). 

The first is the game company themselves host the game servers. For some game companies this means utilize cloud technologies such as [Google cloud gaming](https://cloud.google.com/solutions/gaming) or [AWS Amazon GameSparks](https://aws.amazon.com/gamesparks/).


The second one is that game companies let the public host them in any way they want. Simply releasing the game server executables would enable this. 

This is who GamingAPI targets, the games which has public game server executables that can be hooked into.

## The ultimate goal
I want anyone to be able to easily run their own game server and interacting with it through 2 easy steps **anyone** can do. 

First, you run the game server, arguable the easiest way to achieve this is by utilizing docker. More specifically, it's simply pairing the game server executables with the GamingAPI library.

```bash
docker run -d gamingapi/rust
```

Next, you interact with it through your preferred programming language.

```ts
import {} from 'gamingapi/rust'
```

## The Architecture
<img src="/img/posts/gamingapi-architcture/simple-overview.webp"/>

For each game there are primarily (but not necessarily) 2 APIs defined. 

One is defined for the game server itself, how it interacts with the world. This specific API needs a library generated in the programming language that enables us to hook into the game server. 

For example for [Rust](https://rust.facepunch.com/) (as it is build with [Unity](https://unity.com/)), C# is the primary programming language that would be needed. For Minecraft, it would be Java.

The second one, is the public API that anyone can use to interact with the game server. Here there is not one specific language, as each programmer have developed their own preference in which language.

<img src="/img/posts/gamingapi-architcture/advanced-overview.webp"/>

Lets take a concrete example, with Rust there is a couple of ways to hook into a game server, most common one is through a modding framework.

[uMod](https://umod.org/) could be one of those frameworks. Which enables you to create your own plugins and hook into the game server and manipulate the game states.

Another way could be custom Dll injections which bypass the overhead of a framework.

I have not yet seen this in practice, but in theory you could even build a proxy and listen in on the network traffic for the events. 

Regardless of what approach is used, the game API remains the same. The Rust API library is therefore an out of the box library that will be auto generated based on the AsyncAPI document `rust.asyncapi.json`.

The public API is how one can interact with the game server which is defined with the AsyncAPI document `rust_public.asyncapi.json`.

From this API definition, each library will be auto generated in all possible (in this case I am gonna start with .NET and TS) languages. This means you never have to leave the comforts of your favorite language to interact with your game server :heart:

This setup will be replicated for any game that will be supported. I am gonna start with Rust, and then probably go through all the games that uMod support to get a basis down. 

## Next

Next up is gonna be to setup the automation for code generation. I want it setup so that each change to the API will automatically generate the new libraries, pack it with the correct version and release it.


> Photo by <a href="https://unsplash.com/@glenncarstenspeters?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Glenn Carstens-Peters</a> on <a href="https://unsplash.com/s/photos/game-server?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
  
  