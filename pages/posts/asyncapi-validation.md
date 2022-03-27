---
title: "Validating AsyncAPI documents"
date: 2022-04-04T15:00:00+00:00
type: 
  - Engineering
  - Governance
tags:
  - GamingAPI
  - NATS
  - AsyncAPI
  - Versioning
cover: /img/posts/asyncapi-validation.webp
authors:
  - name: Jonas Lagoni
    photo: /img/avatars/jonaslagoni.webp
    link: https://github.com/jonaslagoni
excerpt: "Not"
---

### AsyncAPI validation
We need to make sure that what ever document we have is a valid AsyncAPI document.

```yml
on:
  workflow_dispatch: 
  pull_request:
  push:
    branches:
      - main
jobs:
  bump:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v2
      - name: Validate document
        uses: WaleedAshraf/asyncapi-github-action@v0
        with:
          filepath: 'asyncapi.yaml'
```

Photo by <a href="https://unsplash.com/@harlimarten?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Harli  Marten</a> on <a href="https://unsplash.com/s/photos/still-water?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
  