---
title: "AsyncAPI versioning in practice"
date: 2022-04-01T15:00:00+00:00
type: 
  - Engineering
  - Governance
tags:
  - GamingAPI
  - AsyncAPI
  - Versioning
cover: /img/posts/versioning-in-practice.webp
authors:
  - name: Jonas Lagoni
    photo: /img/avatars/jonaslagoni.webp
    link: https://github.com/jonaslagoni
excerpt: "Not that the strategy is in place, how do you accomplish it in practice?"
---

Before getting comfortable, please do check out the [first versioning post](/posts/versioning-is-easy) which clarify the version strategy this post continues of. Also the [governance post might be of good to visit before continuing](/posts/governance-getting-started).

Ultimately I want to enforce the following governance guidelines:

- MUST use semantic versioning [116] (read more about the versioning strategy here).
- MUST never break compatibility (read more about the versioning strategy here).


## AsyncAPI versioning in practice

When I make changes to the APIs, I do not want to spend time on manually handle versioning. In an optimal world the CI system should be able to automatically find the correct version change based on the changes proposed.
 
I want to do as minimal amount of work as possible to ensure we always comply with the defined governance rules and version strategy. So therefore I am taking some inspiration from how libraries are released in AsyncAPI - and that is through conventional release.  

In order to ease how to keep the version number of the AsyncAPI documents in sync with the changes, I will leverage semantic versioning. I will do this through [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/).

For example I can add new channels to existing documents through a commit such as `feat: add game server started channel` which should automatically make a minor version bump for the related AsyncAPI document.

To that end I created a GitHub action which can do this for us [jonaslagoni/gh-action-asyncapi-document-bump](https://github.com/jonaslagoni/gh-action-asyncapi-document-bump). 

Because the AsyncAPI documents all reside in one repository, we need to create a GitHub workflow for each document i.e. so we don't trigger a release in the wrong API.

For the rust game server, it's AsyncAPI document is bumped through the following GitHub workflow.
```yml
name: Bump release - rust server
env:
  GH_USER: jonaslagoni
  GH_EMAIL: <jonas-lt@live.dk>
on:
  workflow_dispatch: 
  push:
    branches:
      - main
    paths:
      - components/**
      - rust_server.json
jobs:
  bump:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v2
      - name: Automated version bump
        id: version_bump
        uses: jonaslagoni/gh-action-asyncapi-document-bump@main
        env:
          GITHUB_TOKEN: '${{ secrets.GH_TOKEN }}'
        with:
          path-to-asyncapi: ./rust_server.json
          skip-tag: 'true'
          skip-commit: 'true'
          commit-message: 'chore\(release\): rust server v{{version}}'
      - if: steps.version_bump.outputs.wasBumped == 'true'
        name: Create pull request with bumped version
        uses: peter-evans/create-pull-request@v3
        with:
          token: '${{ secrets.GH_TOKEN }}'
          commit-message: 'chore(release): rust server v${{steps.version_bump.outputs.newVersion}}'
          committer: '${{env.GH_USER}} ${{env.GH_EMAIL}}'
          author: '${{env.GH_USER}} ${{env.GH_EMAIL}}'
          title: 'chore(release): rust server v${{steps.version_bump.outputs.newVersion}}'
          body: Version bump rust server
          branch: 'version-bump/rust-server-v${{steps.version_bump.outputs.newVersion}}'
```
In the `Automated version bump` job the GH action is figuring out, based on the commit history, how it should bump the API version in the AsyncAPI document. It finds all commits up until it encounters the declared release commit message which bumped the version last time (`commit-message`). 

Next, if the AsyncAPI document was bumped, the `Create pull request with bumped version` job commits the changes and creates a PR with the new version for the API for the rust server. 

There are some current limitations to the action you need to be aware of:
- It only looks through references 1 level deep. I.e. if you have a reference that reference another, making changes to that file, will not trigger releases.


### Ensure PR's stay consistent 
In order to force conventional commits, we make sure that each PR title (so when commits are squashed it triggers the correct version change) lint's it against the conventional commits. We can utilize [amannn/action-semantic-pull-request](https://github.com/amannn/action-semantic-pull-request)

```yml
name: "Lint PR title"

on:
  pull_request_target:
    types:
      - opened
      - edited
      - synchronize

jobs:
  main:
    name: Validate PR title
    runs-on: ubuntu-latest
    steps:
      - uses: amannn/action-semantic-pull-request@v4
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Next

I really want to leverage [AsyncAPI Diff](https://github.com/asyncapi/dif) to not rely on conventional commits and human opinion on what changed. With that library it would completely remove the human part and ensure we make less errors in regards to what how to bump the API. 

In order to ensure that the AsyncAPI files always comply with our governance rules, we must leverage linting and other tools to ensure we never break the defined governance rules regarding versioning. That will be the next post.

> Photo by <a href="https://unsplash.com/@saycheezestudios?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Say Cheeze Studios</a> on <a href="https://unsplash.com/s/photos/first-second-third?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
  