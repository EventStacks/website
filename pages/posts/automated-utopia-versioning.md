---
title: "Continuous code generation - Versioning"
date: 2022-06-14T23:00:00+00:00
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
excerpt: "As part of achieving continuous code generation, one of the core issues is how to do versioning for the generated libraries. How do you ripple effect the version changes accurately so the generated libraries avoid non-caught breaking changes?"
---

1. [Continuous code generation - Automated Utopia](http://localhost:8080/posts/automated-utopia)
1. **Continuous code generation - Versioning**
1. Continuous code generation - TypeScript libraries
1. Continuous code generation - .NET libraries
1. Continuous code generation - Automatically set up new libraries and APIs

As part of achieving continuous code generation, one of the core issues is how to do versioning for the generated libraries. The core issue is, how do you ripple effect version changes accurately? And in a manner that avoids non-caught breaking changes?

## The Idea

To answer this conundrum, we must first figure out what version changes affect the generated library. The way I see it, it comes down to two version changes.  The version change of the API, and the code template since the last generation. 

However for us to use and trust those version changes, 2 invariants must hold:

1. The API version MUST always use `semver` and [accurately change the version based on any new changes](https://semver.org/#semantic-versioning-specification-semver).
1. The code template (what the library is generated from) version MUST always use `semver` and accurately change the version based on any new changes.

If any of these two invariants are broken, it means that the generated library will perform a version change, unfitting for the changes it introduces. Most likely this will be a breaking change disguised as a feature change, which means users of the library cannot update their dependency without potentially breaking their code.

For the first invariant, we already have a [setup for how the AsyncAPI documents are gonna perform version changes](/posts/asyncapi-versioning-in-practice), and in the future, [AsyncAPI Diff](https://github.com/asyncapi/diff) will help ensure breaking changes cannot happen without the appropriate conventional commit.

Regarding the code template, the only way I see is to create integration tests and ensure they are tested on each change. This should be sufficient enough for most cases.

So now that the invariants are taken care of, how do we manage these version changes in practice?

## The generation code
To generate the libraries, we need some kind of code that we can execute, not only by the CI but also locally for debugging, when things don't go as planned. Cause that happens at times, especially when it's mostly trial and error to find a fitting solution.

The general syntax regardless of programming language is going to be the following:

```
# Find the versions the library was last generated from
# Find the current version of the library
# Find the new versions for the code template and the API document
# Find the correct version change to apply based on the old versions and the new ones
# Find out if any version changes occurred and if so
  # Remove all the files that are not related to the continuos code generation setup 
  # Generate the new library
  # Save the versions of the current code template and the API document for next time
```

In my case, I decided to write this code as a bash script, but in theory, this could be anything language that fits your use case. I also think I am going to put all of this into a GitHub action or something similar :thinking:

But yea, let's break down how it's built with bash.

## The bash script
Before jumping into the specifics, the script has specific sections that change based on the programming language the library is for. The next two posts will dive into these sections more, and I will only quickly go over them here.

### Find the versions the library was last generated from
The way I choose to handle them is through a simple JSON file, which contains the API and the template version that the library was generated from. This will look like the following and placed in the root of the repository:

```json
{
  "template_last_version": "0.4.11",
  "document_last_version": "0.7.0"
}
```

This config file says that the last time the library got generated, it was done with the template version `0.4.11` and an AsyncAPI document version of `0.7.0`.

This config file is what makes the basis of our automation because it contains the information that is vital to know when we regenerate it at a later time. Otherwise, we are not able to know exactly which type of version change is required.

Utilizing [jq](https://stedolan.github.io/jq/), we can then read the versions:

```bash
document_last_version=$(cat ./configs.json | jq -r '.document_last_version')
template_last_version=$(cat ./configs.json | jq -r '.template_last_version')
```

The way to do this is by reading the file (`cat ./configs.json`) and using that as input to `jq`, where we then read the simple object and the property `document_last_version` and `document_last_version` based on which data we want to read.

### Find the current version of the library
This step is highly dependent on the programming language, as most have a unique setup that requires slight variations.

This will be part of the next two parts of the series.

### Find the new versions for the code template and the API document

```bash
template_current_version=$(curl -sL https://api.github.com/repos/jonaslagoni/dotnet-nats-template/releases/latest | jq -r '.tag_name' | sed 's/v//')
```

Since the templates I use are all open-sourced, I can use the GitHub API to find the latest release. For example, here I am using a fork of the official AsyncAPI template for .NET NATS. The reason I am using a fork instead of the official is that I have quite a few changes that are needed ([#260](https://github.com/asyncapi/dotnet-nats-template/pull/260), [#261](https://github.com/asyncapi/dotnet-nats-template/pull/261), [#262](https://github.com/asyncapi/dotnet-nats-template/pull/262), [#265](https://github.com/asyncapi/dotnet-nats-template/pull/265) and [#266](https://github.com/asyncapi/dotnet-nats-template/pull/266)).

For the AsyncAPI documents, I am going to utilize the similar call as above, where I access the public bundled AsyncAPI document ([read more about why I use bundled documents here](/posts/reusability-causing-problems)). For the AsyncAPI documents, they are also all open-sourced, which means we can clone the repository with the documents and read the appropriate document.

```bash
url_to_asyncapi_document="https://raw.githubusercontent.com/GamingAPI/definitions/main/bundled/rust.asyncapi.json"
document_current_version=$(curl -sL ${url_to_asyncapi_document} | jq -r '.info.version' | sed 's/v//')
```

### Find the correct version change to apply based on the old versions and the new ones.

Because both the template and the AsyncAPI document use semver, we can split up the versions into major, minor, and patch (`major.minor.patch`). For simplicity, and because I don't have the use-case at the moment, I am leaving out pre-release and build ids. This way it's easier to compare the versions with each other.

```bash
# Initial setup of variables
library_last_version="0.0.0"
template_last_version="0.0.0"
template_current_version="0.0.0"
document_last_version="0.0.0"
document_current_version="0.0.0"
major_template_last_version=0
minor_template_last_version=0
patch_template_last_version=0
major_template_current_version=0
minor_template_current_version=0
patch_template_current_version=0
major_version_change="false"
minor_version_change="false"
patch_version_change="false"
commit_message=""

## Split semver version by '.'
semver_template_last_version=( ${template_last_version//./ } )
major_template_last_version=${semver_template_last_version[0]}
minor_template_last_version=${semver_template_last_version[1]}
patch_template_last_version=${semver_template_last_version[2]}
## Split semver version by '.'
semver_template_current_version=( ${template_current_version//./ } )
major_template_current_version=${semver_template_current_version[0]}
minor_template_current_version=${semver_template_current_version[1]}
patch_template_current_version=${semver_template_current_version[2]}
if (($major_template_current_version > $major_template_last_version)); then
  major_version_change="true"
  commit_message="${commit_message}Template have changed to a new major version."
elif (($minor_template_current_version > $minor_template_last_version)); then
  minor_version_change="true"
  commit_message="${commit_message}Template have changed to a new minor version."
elif (($patch_template_current_version > $patch_template_last_version)) && (($minor_template_current_version < $minor_template_last_version)) && (($major_template_current_version < $major_template_last_version)); then
  patch_version_change="true"
  commit_message="${commit_message}Template have changed to a new patch version."
fi
## Split semver version by '.'
semver_document_last_version=( ${document_last_version//./ } )
major_document_last_version=${semver_document_last_version[0]}
minor_document_last_version=${semver_document_last_version[1]}
patch_document_last_version=${semver_document_last_version[2]}
## Split semver version by '.'
semver_document_current_version=( ${document_current_version//./ } )
major_document_current_version=${semver_document_current_version[0]}
minor_document_current_version=${semver_document_current_version[1]}
patch_document_current_version=${semver_document_current_version[2]}
if (($major_document_current_version > $major_document_last_version)); then
  major_version_change="true"
  commit_message="${commit_message}AsyncAPI document have changed to a new major version."
elif (($minor_document_current_version > $minor_document_last_version)); then
  minor_version_change="true"
  commit_message="${commit_message}AsyncAPI document have changed to a new minor version."
elif (($patch_document_current_version > $patch_document_last_version && $minor_document_current_version < $minor_document_last_version && $major_document_current_version < $major_document_last_version)); then
  patch_version_change="true"
  commit_message="${commit_message}AsyncAPI document have changed to a new patch version."
fi
```

It looks like much, but that's bash for you :smile: 

### Find out if any version changes occurred and if so
Afterward it is as easy as checking if we need to do one of the three changes.

```bash
if $major_version_change == 'true' || $minor_version_change == 'true' || $patch_version_change == 'true'; then
  # Time to do a version change
fi
```

### Remove all the files that are not related to the continuos code generation setup 
The reason why we need to remove the generated code is that between template versions, new files might be introduced or removed. Simply re-generating without removing previous code could leave unintended code laying around.

So since we cannot control what the template generates, we can control what the continuous code generation introduces. Therefore by filtering everything we know we introduced, we can remove the rest.

```bash
# Remove previous generated files to ensure clean slate
find . -not \( -name configs.json -or -name .gitignore -or -name LICENSE -or -name generate.sh -or -iwholename *.github* -or -iwholename *.git* -or -name . \) -exec rm -rf {} +
```

### Generate the new library

Now that we have a clean slate, we can regenerate the code.

```bash
# Install the generator if it does not already exist.
if ! command -v ag &> /dev/null
then
  npm install -g @asyncapi/generator
fi
# Generating new code from the AsyncAPI document
ag --force-write --output ./ ${url_to_asyncapi_document} https://github.com/jonaslagoni/dotnet-nats-template -p version="$library_last_version" -p targetFramework="netstandard2.0;netstandard2.1;net461" -p repositoryUrl="https://github.
com/GamingAPI/rust-csharp-game-api.git" -p projectName="${library_name}"
```

### Save the versions of the current code template and the API document for next time

With the new code generated, we can now save the template and the AsyncAPI document versions used to generate it for next time. Here we can utilize JQ again to write the new values:

```bash
# Write new config file to ensure we keep the new state for next time
contents="$(jq ".template_last_version = \"$template_current_version\" | .document_last_version = \"$document_current_version\"" configs.json)" && echo "${contents}" > configs.json
```

In theory, you could overwrite the JSON data completely without using JQ, but if you wanted to add extra properties, you would have to adapt this code, so this is more future-proof.

## Next

Now that the general setup with how versioning and code generation works, we need to tie it together with the specifics of the programming language as each has specific needs.

Next up is the setup for TypeScript.

> Photo by <a href="https://unsplash.com/@iswanto?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Iswanto Arif</a> on <a href="https://unsplash.com/s/photos/beach-sitting?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>