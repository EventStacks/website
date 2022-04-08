---
title: "Enforcing consistency guidelines - part 1"
date: 2022-04-08T19:00:00+00:00
type: 
  - Engineering
  - Governance
tags:
  - GamingAPI
  - AsyncAPI
  - Linting
  - Spectral
cover: /img/posts/enforcing-consistency-guidelines-part-1.webp
authors:
  - name: Jonas Lagoni
    photo: /img/avatars/jonaslagoni.webp
    link: https://github.com/jonaslagoni
excerpt: "Based on your consistency guidelines, how do you enforce them? This can easily be done through Spectral."
---

This post takes the [consistency governance guidelines](/posts/getting-started-with-governance#consistency) into practice through something called linting. If you have spent time around JS, you might know [Eslint](https://eslint.org/), which is the same we want to apply for the AsyncAPI documents.

Before jumping into it, I did have to split this post up into two parts to make it more digestible. 

Part 1 will the basic introduction to linting, setup, and the CI changes.

[Part 2 will contain the more advanced linting rules as well as the conclusion to this setup](/posts/enforcing-consistency-guidelines-part-2).

Soo...

### Why enforce it?
I have heard of a couple of real-world scenarios, where consistency guidelines have not been enforced, only sat. To me, this is like having laws but no police and justice system to enforce them.

Why would you go through all the trouble of setting the guidelines if you have no intention of enforcing them? Because if the users are not given an error while making the change, it is bound to not be compliant with the guidelines. Especially if you have multiple people working on the documents.

### Spectral
The linting tool I will utilize is called [Spectral](https://meta.stoplight.io/docs/spectral). If you have not heard about Spectral, it is used to lint JSON or YAML files, meaning it supports AsyncAPI as well as other formats such as OpenAPI documents.

To understand spectral you need to know about [3 concepts](https://meta.stoplight.io/docs/spectral/ZG9jOjYyMDc0Mg-concepts): **rulesets**, **rules** and **functions**.

- **Rulesets** act as a container for **rules** and **functions**, this is what we will contain all the rules for ensuring the consistency guidelines are checked.
- **Rules** filter your object down to a set of target values and specify the function that is used to evaluate those values. Each consistency guideline will get either one or multiple rules the AsyncAPI document must comply with.
- **Functions** accept a value and return issues if the value is incorrect. Sometimes the built-in functions given by Spectral is not enough, as you will see in part 2.

### Getting started
To get started I want to create my own ruleset and place the rules within a `.spectral.yml` file. The full file can be found in the [spectral directory](https://github.com/GamingAPI/definitions/tree/main/spectral).

To start with the ruleset should extend the built-in AsyncAPI ruleset (so we can leverage already existing rules), but keep them disabled as a default. This means each rule can be explicitly enabled based on what is needed. 

<CodeBlock language="yaml">
{`extends: [[spectral:asyncapi, off]]
functions: [],
rules: 
  ...
`}</CodeBlock>

Now it's time to go through each of the consistency guidelines and match each up with a spectral rule.

### Rules
Each consistency guideline is then matched against one or more Spectral rules. The majority of the rules are explained in [part 2](/posts/enforcing-consistency-guidelines-part-2).

#### Enforce API meta information
> MUST contain API meta information [218].

For this some of the [built-in rules can be enabled](https://meta.stoplight.io/docs/spectral/ZG9jOjUzNDg-async-api-rules), and sat to give an error:

<CodeBlock language="yaml">
{`rules: 
  ...
  asyncapi-info-contact-properties: error
  asyncapi-info-description: error
  asyncapi-info-license-url: error
  asyncapi-operation-description: error
  asyncapi-parameter-description: error
  asyncapi-operation-operationId: error
  asyncapi-tag-description: error
`}</CodeBlock>


### Running the linting
As mentioned in the [Getting started with Governance post](/posts/getting-started-with-governance), I wanted the consistency guidelines to be checked locally, so you won't have to run it through a CI system. I want to receive feedback and fail as fast as possible when making changes to the AsyncAPI documents.

I tried a couple of setups but eventually ended up with a simple [package.json](https://github.com/GamingAPI/definitions/blob/main/package.json) file.

<CodeBlock language="json">
{`{
  "scripts": {
    "lint": "spectral lint ./documents/*.asyncapi.json --ruleset ./spectral/.spectral.yaml"
  },
  "dependencies": {
    "@stoplight/spectral-cli": "^6.3.0"
  }
}
`}</CodeBlock>

There are many ways you can achieve this, however, because I am gonna add other node scripts later this was the most simple for me.

### Linting changes on each PR
As introduced in [versioning in practice](/posts/versioning-in-practice), when changes are proposed through PRs, this script needs to be run to ensure the proposed changes do not break those consistency guidelines.

This can be done by simply adapting the existing [test job](https://github.com/GamingAPI/definitions/blob/main/.github/workflows/test-pr.yml) to also run the linter:

<CodeBlock language="yaml">
{`...
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      ...
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: 14
          cache: 'npm'
      - name: Install node dependencies
        run: npm install
      - name: Lint AsyncAPI files
        run: npm run lint
`}</CodeBlock>

### Next

Next up is [part 2](/posts/enforcing-consistency-guidelines-part-2). 

> Photo by <a href="https://unsplash.com/@canegridere?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Can Eğridere</a> on <a href="https://unsplash.com/s/photos/building-blocks?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
