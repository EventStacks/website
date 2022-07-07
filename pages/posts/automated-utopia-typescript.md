---
title: "Continuous code generation - TypeScript libraries"
date: 2022-07-08T17:00:00+00:00
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
excerpt: "Finally time to tie the last two posts together to explain how to achieve continuous code generation for TypeScript libraries"
---

1. [Continuous code generation - Automated Utopia](/posts/automated-utopia)
1. [Continuous code generation - Versioning](/posts/automated-utopia-versioning)
1. **Continuous code generation - TypeScript libraries**
1. Continuous code generation - .NET libraries
1. Continuous code generation - Automatically set up new libraries and APIs

*First time putting a video together since, forever, so don't judge too harshly. No idea why it's so matrix-like at times, and no idea how to fix it, so it is what it is* :smile:
<video controls>
  <source src="/media/typescript-auto-generation.webm"
          type="video/webm"/>
  Sorry, your browser doesn't support embedded videos. Read below what is happening.
</video>

The video shows from start to finish the current state of the continuous code generation for TypeScript libraries. So what is happening in the video? 

First, an API change happens, where we add a new channel for the public Rust API, through a PR ([read more about the setup here](/posts/asyncapi-versioning-in-practice)). The API version is then bumped to `0.8.0` as it was a minor version change. 

Once the version changes, it's time to remotely trigger the code generation process, in this example for the [`rust-ts-public-api`](https://github.com/GamingAPI/rust-ts-public-api) library. The code generation process is what [the previous blog post outlined](/posts/automated-utopia-versioning). The CI system then provides a PR with the desired change based on the version change of the API and code template. 

Once merged the library is then released with the appropriate new version and then afterward bumps the package version to `0.5.0`.

As the video shows, it's not quite fully automated, as I still need to manually merge the PRs, it is, however, an "easy fix", as you can get the CI to auto-merge and even approve PRs if it's a specific bot that creates it ([we have a similar setup at AsyncAPI](https://github.com/asyncapi/modelina/blob/7ab5f2824a0904dcd1a6263a17091d845b0a7caf/.github/workflows/automerge-for-humans-merging.yml#L21)). I just have not come around to include it yet even though it's the idea.

## Generate new code

Because I choose to host (or at least that's how it came to be, as initially it was hosted on Gitlab) it on GitHub, many of the automation steps are for GitHub actions. However, it should be "rather easy" to translate it to another CI system as the building blocks and processes are there.

### Find the current version of the library
As part of the [generation script](/posts/automated-utopia-versioning#the-generation-code), one step was to [find the current version of the library to know where we are left off](/posts/automated-utopia-versioning#find-the-current-version-of-the-library). For the TypeScript library, it is straightforward, as we can read the version with `jq` from the `package.json` file.

```bash
library_last_version=$(cat ./package.json | jq -r '.version')
```

### Auto generate the library 
Next is to trigger the code generation when the API receives a version change.

To achieve this I choose to add a generation workflow in the API library and one where the AsyncAPI documents are located, to remotely trigger the generation workflow. This is not the only way to achieve it, but it was the one I found must suiting in this case.

For the generation workflow, it's rather simple as all it does is execute the [`generate.sh` script](/posts/automated-utopia-versioning#the-bash-script), read the results of the generation process - and then create appropriate PR with the desired conventional commit. The workflow is then set to be triggered on [workflow dispatch](https://utensils.io/articles/trigger-github-actions-from-another-repo) which can be done remotely.

```yml
name: Auto update generated client
on:
  workflow_dispatch:

jobs:
  update-code:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '14'
      
      - name: Generate code
        run: chmod +x ./generate.sh && ./generate.sh

      - name: Set Environment Variables from generator file
        uses: ./.github/actions/setvars
        with:
          varFilePath: ./.github/variables/generator.env

      # Follow conventional commit for PR's to ensure accurate updates
      - name: Create pull request for major version if needed
        if: ${{env.major_version_change == 'true'}}
        uses: peter-evans/create-pull-request@v4
        with:
          title: "feat!: major version change"
          body: ${{env.commit_message}}

      - name: Create pull request for minor version if needed
        if: ${{env.minor_version_change == 'true'}}
        uses: peter-evans/create-pull-request@v4
        with:
          title: "feat: minor version change"
          body: ${{env.commit_message}}

      - name: Create pull request for patch version if needed
        if: ${{env.patch_version_change == 'true'}}
        uses: peter-evans/create-pull-request@v4
        with:
          title: "fix: patch version change"
          body: ${{env.commit_message}}
```

To remotely trigger the code generation from where the AsyncAPI documents are located, we can then use the GitHub action `benc-uk/workflow-dispatch` to trigger the workflow remotely. This is run whenever the bundled AsyncAPI document change. This is my lazy way of detecting version changes, [as the AsyncAPI documents are bundled on each release](/posts/reusability-causing-problems).

```yml
---
name: Trigger remote code generation for Rust public API
on: 
  workflow_dispatch: 
  push:
    branches:
      - main
    paths:
      - 'bundled/rust_public.asyncapi.json'
jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - name: Update TS public game API library
        uses: benc-uk/workflow-dispatch@v1
        with:
          workflow: Auto update generated library
          token: ${{ secrets.GH_TOKEN }}
          repo: GamingAPI/rust-ts-public-api
      - # Update ... public game API library
```

The only thing we cannot trigger upon is when the code template receives a change. You could fall back to a cronjob which could trigger the generation workflow at some specific time, so it's semi-automatic. 

## Release the new library

This setup is a page out of the AsyncAPI setup, where I reuse the exact setup that [Lukasz](https://github.com/derberg) authored. If you want a more in-depth description of the setup, you can watch the [Let's talk about contributing - CI/CD at AsyncAPI](https://www.youtube.com/watch?v=DsQfmlc3Ubo), otherwise, I will make sure to recap the major parts below.

It has two core concepts, the package.json file has [specific release scripts](https://github.com/asyncapi/modelina/blob/master/package.json#L84-L88) and [release configurations](https://github.com/asyncapi/modelina/blob/8e6fe34b8870a2aa758697b0a341736b2ef30658/package.json#L93) which is being triggered by a [release workflow](https://github.com/asyncapi/modelina/blob/8e6fe34b8870a2aa758697b0a341736b2ef30658/.github/workflows/if-nodejs-release.yml#L52) that ensures everything is released based on the conventional commits it finds since the last release. [Similar to what the setup is for the AsyncAPI files](/posts/asyncapi-versioning-in-practice). Once released we bump the version of the library.

The first dilemma is that the template I am using is generating the `package.json` file which contains the minimum to make it usable (which is expected) - such as dependencies and basic scripts. It does not contain any specific scripts or developer dependencies for supporting the continuous release.

Luckily it's JSON, so we can `jq` once again to make it contain what we need.

We can therefore create a [`custom_package.json` file](https://github.com/GamingAPI/rust-ts-public-api/blob/main/custom_package.json) to contain all our customized properties (more or less copy-pasted from the AsyncAPI setup):
```json
{
  "name": "@gamingapi/rust-ts-public-api",
  "description": "TypeScript public API wrapper for rust",
  "publishConfig": {
    "access": "public"
  },
  "keywords": [],
  "author": "Jonas Lagoni (jonas-lt@live.dk)",
  "license": "Apache-2.0",
  "bugs": {
    "url": "https://github.com/GamingAPI/rust-ts-public-api/issues"
  },
  "files": [
    "/lib",
    "./README.md",
    "./LICENSE"
  ],
  "homepage": "https://github.com/GamingAPI/rust-ts-public-api#readme",
  "scripts": {
    "generate:assets": "npm run build && npm run docs",
    "bump:version": "npm --no-git-tag-version --allow-same-version version $VERSION",
    "release": "semantic-release",
    "prepublishOnly": "npm run generate:assets"
  },
  "devDependencies": {
    "@semantic-release/commit-analyzer": "^8.0.1",
    "@semantic-release/github": "^7.0.4",
    "@semantic-release/npm": "^7.0.3",
    "@semantic-release/release-notes-generator": "^9.0.1",
    "conventional-changelog-conventionalcommits": "^4.2.3",
    "semantic-release": "^17.0.4"
  },
  "release": {
    "branches": [
      "main"
    ],
    "plugins": [
      [
        "@semantic-release/commit-analyzer",
        {
          "preset": "conventionalcommits"
        }
      ],
      [
        "@semantic-release/release-notes-generator",
        {
          "preset": "conventionalcommits"
        }
      ],
      "@semantic-release/npm",
      "@semantic-release/github"
    ]
  }
}
```

The [generator script](https://github.com/GamingAPI/rust-ts-public-api/blob/09eef3fbdb1cc03e5ca7b4191d1f236ffb1d0c37/generate.sh#L98) can then be adapted so after the code is generated, we can merge the `package.json` file from the code template without `custom_package.json`. 

```bash
# Merge custom package file with template generated
jq -s '.[0] * .[1]' ./package.json ./custom_package.json > ./package_tmp.json
rm ./package.json
mv ./package_tmp.json ./package.json
```

## Some reflection

While that finishes the setup for TypeScript libraries, it's far from over - cause this is quite a complex setup and quite a few steps to take to achieve it. I still think how all of this can be reduced to a single step... Maybe it's not necessary to have the library in a repository, but rather just releasing it through a library. But I need some more experience in how different languages do things to put something together.

It is hard for the consumer of the library to know exactly which versions represent which API versions. So some kind of compatibility matrix would be great to have... Not sure how that would be achievable :thinking:

The same goes for the commit messages, could be better to describe exactly which API changes they reflect. As you can see on the video, it only describes what triggered the change, either the template or the AsyncAPI document, which is not very informative - but maybe they don't need to be :thinking:

Gotta say, this automated utopia really pushes my skills to the limits, but what a learning experience.

> Photo by <a href="https://unsplash.com/@iswanto?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Iswanto Arif</a> on <a href="https://unsplash.com/s/photos/beach-sitting?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>