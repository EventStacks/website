---
title: "Continuous code generation - Automatically set up new libraries and APIs"
date: 2022-08-07T13:00:00+00:00
type: 
  - Engineering
tags:
  - GamingAPI
  - AsyncAPI
  - Code generation
  - Automation
  - Versioning
cover: /img/posts/automated-utopia.webp
authors:
  - name: Jonas Lagoni
    photo: /img/avatars/jonaslagoni.webp
    link: https://github.com/jonaslagoni
excerpt: "Time"
---

1. [Continuous code generation - Automated Utopia](/posts/automated-utopia)
2. [Continuous code generation - Versioning](/posts/automated-utopia-versioning)
3. [Continuous code generation - TypeScript libraries](/posts/automated-utopia-typescript)
4. [Continuous code generation - .NET libraries](/posts/automated-utopia-dotnet)
5. **Continuous code generation - Automatically set up new libraries and APIs**

So now that we have all the core setups for each library (TypeScript and .NET) it's time to tie the knot on 

There are three things that can trigger something 

The solution I am looking for must do the following:

1. Must be easy to setup new API libraries
2. Must be easy to setup new games

### GitHub Templates
One issue with the setup for TypeScript and .NET is that they contain very specific lines of code, that is ONLY relevant for the specific API and game.

- [The path to the AsyncAPI definition](https://github.com/GamingAPI/rust-csharp-public-api/blob/7a7b973dc8f2382e4f65434d2de13c59f9196bcc/generate.sh#L29)
- [For .NET, the repostiory URL](https://github.com/GamingAPI/rust-csharp-public-api/blob/7a7b973dc8f2382e4f65434d2de13c59f9196bcc/generate.sh#L9)
- [For .NET, the library name, based on the game it's for](https://github.com/GamingAPI/rust-csharp-public-api/blob/7a7b973dc8f2382e4f65434d2de13c59f9196bcc/generate.sh#L8)
- [For TypeScript, the library name](https://github.com/GamingAPI/rust-ts-public-api/blob/445b85ccc2695617ec1f01dc71077e474b447951/custom_package.json#L2)
- [For TypeScript, the homepage for the library](https://github.com/GamingAPI/rust-ts-public-api/blob/445b85ccc2695617ec1f01dc71077e474b447951/custom_package.json#L18)
- [For TypeScript, the bugs URL](https://github.com/GamingAPI/rust-ts-public-api/blob/445b85ccc2695617ec1f01dc71077e474b447951/custom_package.json#L11)
- [For TypeScript, the library description](https://github.com/GamingAPI/rust-ts-public-api/blob/445b85ccc2695617ec1f01dc71077e474b447951/custom_package.json#L3)

So, as you can see, there is quite a few places within the setup, that cannot be setup with abstract values. So how do we solve that problem?






> Photo by <a href="https://unsplash.com/@iswanto?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Iswanto Arif</a> on <a href="https://unsplash.com/s/photos/beach-sitting?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>