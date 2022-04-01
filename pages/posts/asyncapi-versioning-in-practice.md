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
cover: /img/posts/asyncapi-versioning-in-practice.webp
authors:
  - name: Jonas Lagoni
    photo: /img/avatars/jonaslagoni.webp
    link: https://github.com/jonaslagoni
excerpt: "Now that there is a version strategy, how do you use it in practice?"
---

Before getting comfortable, please do check out the [first versioning post](/posts/versioning-is-easy) which clarifies the version strategy this post continues of. Please do remember, that the workflow in this post, is not one workflow to fit all use-cases. Again weigh the pros and cons against your versioning strategy.

## AsyncAPI versioning in practice

If you were a contributor, how would you like to propose your changes to the APIs?

I truly enjoy the workflow process [we have at AsyncAPI](https://github.com/asyncapi/.github/blob/master/CONTRIBUTING.md), and I want to use the same pattern for [GamingAPI](https://gamingapi.org) and how to make changes to the APIs.

The pattern is as follows: `Open an issue -> Open a PR -> Merge the changes`.

This pattern has a couple of benefits that will be necessary to have down the line: 
1. We can create GitHub workflows to automatically check [against your design guidelines](https://eventstack.tech/posts/getting-started-with-governance#consistency) (which the next couple of posts will focus on).
2. Once a PR has been merged, it's possible to automate the release process and do different kinds of actions such as version bumping (as this post is about), bundling, automatic code generation, etc.

When you open a PR, you should not care about manually changing the version. In an optimal world, the CI system should be able to automatically find the correct version change based on the changes and your version strategy. However, we will have to settle with using something called [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/), at least for now. In the future, I might want to leverage [AsyncAPI Diff](https://github.com/asyncapi/diff) to not rely on conventional commits and human opinion on what changed. With diff, it would completely remove it to ensure fewer errors are made and ensure we never break compatibility.

Back to conventional commits, they enable you to make iteratively make changes to the APIs. To that end, we need a GitHub action to do this, which I had to create [jonaslagoni/gh-action-asyncapi-document-bump](https://github.com/jonaslagoni/gh-action-asyncapi-document-bump).

Because the AsyncAPI documents all reside in one repository, we need to create a GitHub workflow for each API. For the [Rust game server](https://github.com/GamingAPI/definitions/blob/main/.github/workflows/bump-rust-server-version.yml), its AsyncAPI document is bumped through the following GitHub workflow: 

```yml
name: Bump release rust server
env:
  GH_USER: jonaslagoni
  GH_EMAIL: <jonas-lt@live.dk>
on:
  workflow_dispatch: 
  push:
    branches:
      - main
    paths:
      - documents/components/**
      - documents/rust_server.asyncapi.json
jobs:
  bump:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v2
      - name: Automated Version Bump
        id: version_bump
        uses: jonaslagoni/gh-action-asyncapi-document-bump@main
        env:
          GITHUB_TOKEN: '${{ secrets.GH_TOKEN }}'
        with:
          path-to-asyncapi: ./documents/rust_server.asyncapi.json
          skip-tag: 'true'
          skip-commit: 'true'
          commit-message: 'chore\(release\): rust server v{{version}}'
      - if: steps.version_bump.outputs.wasBumped == 'true'
        name: Create Pull Request with bumped version
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
To briefly explain what happens in the workflow jobs. In the `Automated version bump` job the GitHub action is figuring out, based on the commit history of relevant files, how it should bump the API version in the AsyncAPI document. It finds all commits up until it encounters the declared release commit message which bumped the version last time (defined in `commit-message`). Based on the related commits it bumps the AsyncAPI version accordingly to [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/).

If the AsyncAPI document was bumped, the `Create pull request with bumped version` job commits the changes and creates a PR with the new version for the API. 

### Ensure PRs stay consistent 
To ensure that we don't commit wrong titles, we need to make sure each PR title (so when commits are squashed it triggers the correct version change) lint's it against conventional commits. For that you can use the simple GitHub action [amannn/action-semantic-pull-request](https://github.com/amannn/action-semantic-pull-request):

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

Next up is to ensure that each PR comply with all the [design guidelines](/posts/getting-started-with-governance#consistency) so they are not an empty promise. This can be done using various GitHub workflows with various tools.

> Photo by <a href="https://unsplash.com/@saycheezestudios?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Say Cheeze Studios</a> on <a href="https://unsplash.com/s/photos/first-second-third?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
  