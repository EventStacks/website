---
title: "Continuous code generation - .NET libraries"
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
excerpt: "Time to introduce continous code generation for .NET libraries!"
---

1. [Continuous code generation - Automated Utopia](/posts/automated-utopia)
2. [Continuous code generation - Versioning](/posts/automated-utopia-versioning)
3. [Continuous code generation - TypeScript libraries](/posts/automated-utopia-typescript)
4. **Continuous code generation - .NET libraries**
5. Continuous code generation - Automatically set up new libraries and APIs

*I got a little lazy and did not end up recording how the .NET library got released, but this is for the TypeScript setup, which is 95% the same as for a .NET package* :smile:
<video controls>
  <source src="/media/typescript-auto-generation.webm"
          type="video/webm"/>
  Sorry, your browser doesn't support embedded videos. Read below what is happening.
</video>

The video shows from start to finish the current state of the continuous code generation for TypeScript libraries (and this is 95% the same setup for .NET). So what is happening in the video? 

First, an API change happens, where we add a new channel for the public Rust API, through a PR ([read more about the setup here](/posts/asyncapi-versioning-in-practice)). The API version is then bumped to `0.8.0` as it was a minor version change. 

Once the version changes, it's time to remotely trigger the code generation process, in this example for the [`rust-ts-public-api`](https://github.com/GamingAPI/rust-ts-public-api) library. The code generation process is what [the previous blog post outlined](/posts/automated-utopia-versioning). The CI system then provides a PR with the desired change based on the version change of the API and code template. 

Once merged the library is then released with the appropriate new version and then afterward bumps the package version to `0.5.0`. For .NET that would be bumping the project version in `.csproj`.

As the video shows, it's not quite fully automated, as I still need to manually merge the PRs, it is, however, an "easy fix", as you can get the CI to auto-merge and even approve PRs if it's a specific bot that creates it ([we have a similar setup at AsyncAPI](https://github.com/asyncapi/modelina/blob/7ab5f2824a0904dcd1a6263a17091d845b0a7caf/.github/workflows/automerge-for-humans-merging.yml#L21)). I just have not come around to include it yet even though it's the idea.

## Generate new code

Because I choose to host (or at least that's how it came to be, as initially it was hosted on Gitlab) it on GitHub, many of the automation steps are for GitHub actions. However, it should be "rather easy" to translate it to another CI system as the building blocks and processes are there.

### Find the current version of the library
As part of the [generation script](/posts/automated-utopia-versioning#the-generation-code), one step was to [find the current version of the library](/posts/automated-utopia-versioning#find-the-current-version-of-the-library) to know our starting point. For the .NET libraries this is "slightly" more tricky then for [TypeScript](/posts/automated-utopia-typescript#generate-new-code).

The reason is its XML :sweat_smile: I ended up using a [support library](https://github.com/tyleradams/json-toolkit) which of course needs to be installed beforehand. Next, the .NET project file is piped into the `xml-to-json` converter to read the current version through `jq`. I guess you could use the GitHub API to read the latest release and use the version therein, but that has drawbacks as well.

<CodeBlock caption="The steps to follow to retrieve the current version of a .NET library" language="bash">
{`if [ -f "./$\{libary_name\}/$\{libary_name\}.csproj" ]; then
  if ! command -v xml-to-json &> /dev/null
  then
    git clone https://github.com/tyleradams/json-toolkit.git tooling
    cd ./tooling && make json-diff json-empty-array python-dependencies && sudo make install
    cd ..
  fi
  library_last_version=$(cat ./$\{libary_name\}/$\{libary_name\}.csproj | xml-to-json | jq -r '.Project.PropertyGroup.Version')
else
  library_last_version="0.0.0"
fi
`}</CodeBlock>

### Auto-generate the library 
Next is to trigger the code generation when the API definition receives a version change. If you have read the [TypeScript setup](/posts/automated-utopia-typescript), this setup is pretty much the same.

To achieve this I choose to add a generation workflow in the API library and one where the AsyncAPI documents are located, to remotely trigger the generation workflow. This is not the only way to achieve it, but it was the one I found most suiting in this case.

For the generation workflow, it's rather simple as all it does is execute the [`generate.sh` script](/posts/automated-utopia-versioning#the-bash-script), read the results of the generation process - and then create appropriate PR with the desired conventional commit. The workflow is then set to be triggered on [workflow dispatch](https://utensils.io/articles/trigger-github-actions-from-another-repo) which can be done remotely.

<CodeBlock caption="GitHub workflow that re/generate the .NET library and provide a PR with the change" language="yaml">
{`name: Auto update generated library
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
      \# Follow conventional commit for PR's to ensure accurate updates
      - name: Create pull request for major version if needed
        if: $\{\{env.major_version_change == 'true'\}\}
        uses: peter-evans/create-pull-request@v4
        with:
          title: "feat!: major version change"
          body: $\{\{env.commit_message\}\}
      - name: Create pull request for minor version if needed
        if: $\{\{env.minor_version_change == 'true'\}\}
        uses: peter-evans/create-pull-request@v4
        with:
          title: "feat: minor version change"
          body: $\{\{env.commit_message\}\}
      - name: Create pull request for patch version if needed
        if: $\{\{env.patch_version_change == 'true'\}\}
        uses: peter-evans/create-pull-request@v4
        with:
          title: "fix: patch version change"
          body: $\{\{env.commit_message\}\}
`}</CodeBlock>

To remotely trigger the code generation from where the AsyncAPI documents are located, we can then use the GitHub action `benc-uk/workflow-dispatch` to trigger the workflow remotely. This is run whenever the bundled AsyncAPI document change. This is my lazy way of detecting version changes, [as the AsyncAPI documents are bundled on each release](/posts/reusability-causing-problems).

<CodeBlock caption="GitHub workflow that triggers the above workflow when the API definition changes" language="yaml">
{`name: Trigger remote code generation for Rust public API
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
      - name: Update csharp public game API library
        uses: benc-uk/workflow-dispatch@v1
        with:
          workflow: Auto update generated library
          token: $\{\{ secrets.GH_TOKEN \}\}
          repo: GamingAPI/rust-csharp-public-api
      - \# Update ... public game API library
`}</CodeBlock>

The only thing we cannot trigger upon is when the code template receives a change. You could fall back to a cronjob which could trigger the generation workflow at some specific time, so it's semi-automatic. 

## Release the new library

This is the part that has taken me the longest to achieve because I wanted to reuse the same kind of setup as for TypeScript, at least as much as I possibly can. The fewer differences between the setups for each language the better, less to remember. Having a hard enough time remembering what I did yesterday...

The reason this was the hardest to achieve, was because at the time I started playing around with this setup, I did not look deep enough into the sematic-release library. This meant that I ended up writing a library to analyze the commits and change the version accordingly. Instead, I should have used their [plugin system](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/plugins.md) to achieve this.

For this blog post, I will keep my current setup, but in the future, I will probably switch to a sematic-release plugin. The same for [AsyncAPI versioning in practice](/asyncapi.versioning-in-practice), where I developed [gh-action-asyncapi-document-bump](https://github.com/jonaslagoni/gh-action-asyncapi-document-bump), this needs to be re-created to a sematic-release plugin (copy-paste more or less, just have to find the time).

The way the release workflow works are somewhat similar to the TypeScript setup just more simplified. It will be less customizable, but with the change mentioned above, it does not make sense to fix those limitations. How it works is that on each commit to the `main` branch, we analyze the commits since the last release. If it's determined that a new version is needed, the library is then packed and released.

For the .NET libraries I am [releasing them to GitHub](https://github.com/GamingAPI/rust-csharp-public-api/packages/1493231), this could of course be changed to something like NuGet. Once released it's time to commit the changes i.e. the version change, and potentially other resources that are changed during the release. These changes are committed to a branch and then provided through a PR to the main branch. You could directly commit them to the main branch, but I like the control a PR gives.

<CodeBlock caption="GitHub workflow that releases the .NET library on changes, and provide a PR with the updated release changes (such as version, etc)" language="yaml">
{`name: Release
env:
  GH_USER: jonaslagoni
  GH_EMAIL: <jonas-lt@live.dk>
on:
  push:
    branches:
      - main
jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      packages: write
      contents: read
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-dotnet@v1
        with:
          dotnet-version: '5.0.x' # SDK Version to use.
          source-url: https://nuget.pkg.github.com/GamingAPI/index.json
        env:
          NUGET_AUTH_TOKEN: $\{\{secrets.GITHUB_TOKEN\}\}
      - name: Install dependencies
        run: dotnet restore
      - name: 'Automated Version Bump'
        uses: 'jonaslagoni/gh-action-dotnet-bump@main'
        id: version_bump
        env:
          GITHUB_TOKEN: $\{\{ secrets.GITHUB_TOKEN \}\}
        with: 
          skip-tag: 'true'
          skip-commit: 'true'
          path-to-file: './RustGameAPI/RustGameAPI.csproj'
          release-commit-message-regex: 'chore\(release\): v\{\{version\}\}'
      - if: steps.version_bump.outputs.wasBumped == 'true' 
        run: dotnet build --configuration Release RustGameAPI
      - if: steps.version_bump.outputs.wasBumped == 'true' 
        name: Create the package
        run: dotnet pack --configuration Release RustGameAPI
      - if: steps.version_bump.outputs.wasBumped == 'true' 
        name: Publish the package to GitHub registry
        run: dotnet nuget push RustGameAPI/bin/Release/*.nupkg --api-key $\{\{secrets.NUGET_AUTH_TOKEN\}\}
      - if: steps.version_bump.outputs.wasBumped == 'true'
        name: Create Pull Request with bumped version
        uses: peter-evans/create-pull-request@v3
        with:
          token: '$\{\{ secrets.GH_TOKEN \}\}'
          commit-message: 'chore(release): v$\{\{steps.version_bump.outputs.newVersion\}\}'
          committer: '$\{\{env.GH_USER\}\} $\{\{env.GH_EMAIL\}\}'
          author: '$\{\{env.GH_USER\}\} $\{\{env.GH_EMAIL\}\}'
          title: 'chore(release): v$\{\{steps.version_bump.outputs.newVersion\}\}'
          body: Version bump
          branch: 'version-bump/v$\{\{steps.version_bump.outputs.newVersion\}\}'
`}</CodeBlock>

## Next
That finalizes the .NET setup, and now all there is left is to automate the library creation in GitHub, as it's ever-changing how many languages are provided for each game, and how many games are supported. Therefore I need some kind of setup where it enables me to quickly change any of these parameters.

> Photo by <a href="https://unsplash.com/@iswanto?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Iswanto Arif</a> on <a href="https://unsplash.com/s/photos/beach-sitting?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>