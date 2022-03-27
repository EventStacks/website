---
title: "Keeping up to date with the specification"
date: 2022-04-01T15:00:00+00:00
type: 
  - Engineering
  - Governance
tags:
  - GamingAPI
  - AsyncAPI
  - Versioning
cover: /img/posts/governance-versioning.webp
authors:
  - name: Jonas Lagoni
    photo: /img/avatars/jonaslagoni.webp
    link: https://github.com/jonaslagoni
excerpt: "Not"
---

### AsyncAPI Document versioning
In order to ease how to keep the version number of the AsyncAPI documents in sync with the changes, I will leverage semantic versioning. I will do this through [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/).

For example I can add new channels to existing documents through a commit such as `feat: add game server started channel` which should automatically make a minor version bump for the AsyncAPI document.

To that end [I created a GitHub action which can do this for us jonaslagoni/gh-action-asyncapi-document-bump](https://github.com/jonaslagoni/gh-action-asyncapi-document-bump). 

For now I find it easier to have a GitHub workflow for each AsyncAPI service

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
      - name: Automated Version Bump
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

## Future

We need some help in order to make sure we do not accidentally make what our version strategy consider breaking change https://github.com/asyncapi/diff

> Photo by <a href="https://unsplash.com/@saycheezestudios?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Say Cheeze Studios</a> on <a href="https://unsplash.com/s/photos/first-second-third?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
  