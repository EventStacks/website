---
title: "Continuous code generation - Versioning"
date: 2022-06-21T15:30:00+00:00
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
excerpt: "As part of achieving continuous code generation, one of the core issues is how to do versioning for the generated libraries. More precisely, how do you ripple effect version changes accurately - and in a manner that avoids non-caught breaking changes?"
---

1. [Continuous code generation - Automated Utopia](/posts/automated-utopia)
1. **Continuous code generation - Versioning**
1. Continuous code generation - TypeScript libraries
1. Continuous code generation - .NET libraries
1. Continuous code generation - Automatically set up new libraries and APIs

As part of achieving continuous code generation, one of the core issues is how to do versioning for the generated libraries. More precisely, how do you ripple effect version changes accurately - and in a manner that avoids non-caught breaking changes?

## The Idea

To answer this conundrum, we must first figure out what version changes affect the generated library. The way I see it, it comes down to two version changes. The version change of the API, and the code template since the last generation. 

However for us to use and trust those version changes, 2 invariants must hold:

1. The API version MUST [accurately use `semver` when making changes](https://semver.org/#semantic-versioning-specification-semver).
1. The code template version (from which the library is generated) MUST accurately use `semver` when making changes.

If any of these two invariants are broken, it means that the generated library will perform a version change, unfitting for the changes it introduces. Most likely this will be a breaking change disguised as a feature change, which means users of the library cannot update their dependency without potentially breaking their code. 

Many find [semver tricky to pull off correctly](https://blog.thoughtspile.tech/2021/11/08/semver-challenges/), and rightly so. Therefore, it is a lot easier said than done.

For the first invariant, we already have a [setup for how the AsyncAPI documents are gonna perform version changes](/posts/asyncapi-versioning-in-practice), and in the future, [AsyncAPI Diff](https://github.com/asyncapi/diff) will help ensure breaking changes cannot happen without the appropriate conventional commit.

Regarding the code template, the only way I see is to create integration tests and ensure they are tested on each change. This should be sufficient enough for most cases, definitely need to do more in this area.

Now that we know the invariants, how do we manage these version changes in practice?

## The generation code

Managing these version changes in practice actually is split up into a few steps, this post will focus on the generation phase, which figures out what version change to do, and regenerates the library.

To generate the libraries, we need some kind of code that we can execute, not only by the CI but also locally for debugging, when things don't go as planned. Cause that happens at times, especially when it's mostly trial and error to find a fitting solution.

The general steps I follow regardless of programming language are:

<CodeBlock caption="The steps to follow to generate the library over and over, while handling versions." language="markdown">
{`\# Find the versions the library was last generated from
\# Find the current version of the library
\# Find the new versions for the code template and the API document
\# Find the correct version change to apply based on the old versions and the new ones
\# Find out if any version changes occurred and if so
  \# Remove all the files that are not related to the continuous code generation setup 
  \# Generate the new library
  \# Save the versions of the current code template and the API document for next time
`}</CodeBlock>

In my case, I decided to write this code as a bash script (kinda regret it, but here we are :laughing:), but in theory, this could be anything language that fits your use case. I also think I am going to put all of this into a GitHub action or something similar :thinking: To make it easier to integrate into any setup.

But yea, let's break down how it's built with bash.

## The bash script
Before jumping into the specifics, the script has specific sections that change based on the programming language the library is for. The next two posts will dive into these sections more, and I will only quickly go over them here.

You can see the full scripts here:
- [TypeScript generate setup](https://github.com/GamingAPI/rust-ts-public-api/blob/main/generate.sh)
- [C#/.NET generate setup](https://github.com/GamingAPI/rust-csharp-public-api/blob/main/generate.sh)

### Find the versions the library was last generated from
The way I choose to handle them is through a simple JSON file, which contains the API and the template version that the library was generated from. This will look like the following and placed in the root of the repository:

<CodeBlock caption="An example `configs.json` which stores the information about the versions of the AsyncAPI document and template version for the last generation." language="json">
{`{
  "template_last_version": "0.4.11",
  "document_last_version": "0.7.0"
}
`}</CodeBlock>

This config file says that the last time the library got generated, it was done with the template version `0.4.11` and an AsyncAPI document version of `0.7.0`.

This config file is what makes the basis of our automation because it contains the information that is vital to know when we regenerate it at a later time. Otherwise, we are not able to know exactly which type of version change is required.

Utilizing [jq](https://stedolan.github.io/jq/), we can then read the versions:

<CodeBlock caption="Utilizing `jq` to read the content of the `configs.json` file." language="bash">
{`document_last_version=$(cat ./configs.json | jq -r '.document_last_version')
template_last_version=$(cat ./configs.json | jq -r '.template_last_version')
`}</CodeBlock>

The way to do this is by reading the file (`cat ./configs.json`) and using that as input to `jq`, where the property `document_last_version` and `document_last_version` can then be read and saved to a variable for later.

### Find the current version of the library
This step is highly dependent on the programming language, as most have a unique setup that requires slight variations.

This will be part of the next two parts of the series.

### Find the new versions for the code template and the API document

<CodeBlock caption="Utilizing `jq` and GitHub to read the current version of the template." language="bash">
{`template_to_use="jonaslagoni/dotnet-nats-template"
template_current_version=$(curl -sL https://raw.githubusercontent.com/$\{template_to_use\}/master/package.json | jq -r '.version' | sed 's/v//')
`}</CodeBlock>

Since the templates I use are all open-sourced, I can access the raw `package.json` file to read the current version. For example, here I am using a fork of the official AsyncAPI template for .NET NATS. The reason I am using a fork instead of the official is that I have quite a few changes that are needed so it gives you a bit more flexibility ([#260](https://github.com/asyncapi/dotnet-nats-template/pull/260), [#261](https://github.com/asyncapi/dotnet-nats-template/pull/261), [#262](https://github.com/asyncapi/dotnet-nats-template/pull/262), [#265](https://github.com/asyncapi/dotnet-nats-template/pull/265), [#266](https://github.com/asyncapi/dotnet-nats-template/pull/266) and [#268](https://github.com/asyncapi/dotnet-nats-template/pull/268)).

For the AsyncAPI documents, I am going to utilize the similar call as above, where I access the public bundled AsyncAPI document ([read more about why I use bundled documents here](/posts/reusability-causing-problems)). For the AsyncAPI documents, they are also all open-sourced, which means we can clone the repository with the documents and read the appropriate document.

<CodeBlock caption="Utilizing `jq` to read the current version of the AsyncAPI document." language="bash">
{`url_to_asyncapi_document="https://raw.githubusercontent.com/GamingAPI/definitions/main/bundled/rust.asyncapi.json"
document_current_version=$(curl -sL $\{url_to_asyncapi_document\} | jq -r '.info.version' | sed 's/v//')
`}</CodeBlock>

### Find the correct version change to apply based on the old versions and the new ones.

Because both the template and the AsyncAPI document use `semver`, we can split up the versions into major, minor, and patch (`major.minor.patch`). For simplicity, and because I don't have the use-case at the moment, I am leaving out pre-release and build ids. This way it's easier to compare the versions with each other.
<CodeBlock caption="Splitting up the semver versions of the current and last template and AsyncAPI document version." language="bash">
{`\# Initial setup of variables
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
\# Split the last used template version by '.' to split it up into 'major.minor.fix'
semver_template_last_version=( $\{template_last_version//./ \} )
major_template_last_version=$\{semver_template_last_version[0]\}
minor_template_last_version=$\{semver_template_last_version[1]\}
patch_template_last_version=$\{semver_template_last_version[2]\}
\# Split the current template version by '.' to split it up into 'major.minor.fix'
semver_template_current_version=( $\{template_current_version//./ \} )
major_template_current_version=$\{semver_template_current_version[0]\}
minor_template_current_version=$\{semver_template_current_version[1]\}
patch_template_current_version=$\{semver_template_current_version[2]\}
if [[ $major_template_current_version > $major_template_last_version ]]; then major_template_change="true"; else major_template_change="false"; fi
if [[ $minor_template_current_version > $minor_template_last_version ]]; then minor_template_change="true"; else minor_template_change="false"; fi
if [[ $patch_template_current_version > $patch_template_last_version ]]; then patch_template_change="true"; else patch_template_change="false"; fi
\# Split the last used AsyncAPI document version by '.' to split it up into 'major.minor.fix'
semver_document_last_version=( $\{document_last_version//./ \} )
major_document_last_version=$\{semver_document_last_version[0]\}
minor_document_last_version=$\{semver_document_last_version[1]\}
patch_document_last_version=$\{semver_document_last_version[2]\}
\# Split the current AsyncAPI document version by '.' to split it up into 'major.minor.fix'
semver_document_current_version=( $\{document_current_version//./ \} )
major_document_current_version=$\{semver_document_current_version[0]\}
minor_document_current_version=$\{semver_document_current_version[1]\}
patch_document_current_version=$\{semver_document_current_version[2]\}
if [[ $major_document_current_version > $major_document_last_version ]]; then major_document_change="true"; else major_document_change="false"; fi
if [[ $minor_document_current_version > $minor_document_last_version ]]; then minor_document_change="true"; else minor_document_change="false"; fi
if [[ $patch_document_current_version > $patch_document_last_version ]]; then patch_document_change="true"; else patch_document_change="false"; fi
\# Set the commit messages that details what changed
if [ $major_template_change == "true" ]; then
  commit_message="Template have changed to a new major version."
elif [ $minor_template_change == "true" ]; then
  commit_message="Template have changed to a new minor version."
elif [ $patch_template_change == "true" ]; then
  commit_message="Template have changed to a new patch version."
fi
if [ $major_document_change == "true" ]; then
  commit_message="$\{commit_message\}AsyncAPI document have changed to a new major version."
elif [ $minor_document_change == "true" ]; then
  commit_message="$\{commit_message\}AsyncAPI document have changed to a new minor version."
elif [ $patch_document_change == "true" ]; then
  commit_message="$\{commit_message\}AsyncAPI document have changed to a new patch version."
fi
\# Always use the most aggressive version change, and only do one type of version change
if [ $major_template_change == "true" ] || [ $major_document_change == "true" ]; then
  major_version_change="true"
elif [ $minor_template_change == "true" ] || [ $minor_document_change == "true" ]; then
  minor_version_change="true"
elif [ $patch_template_change == "true" ] || [ $patch_document_change == "true" ]; then
  patch_version_change="true"
fi
`}</CodeBlock>


It looks like much, but that's just bash for you, either it's easy to read and fill a lot of lines or short and unreadable :smile: 

For both the template and AsyncAPI document version we find out if any major, minor or patch version change is required. It also associate a commit message with details on what triggered the change. For this case just a simple sentence, but could be extended to more complex information, such as changelog etc.

### Find out if any version changes occurred and if so
Afterward it is as easy as checking if we need to do one of the three changes.

<CodeBlock caption="Checking if it's time to do a version change or not" language="bash">
{`if [ $major_version_change == "true" ] || [ $minor_version_change == "true" ] || [ $patch_version_change == "true" ]; then
  \# Time to do a version change
fi
`}</CodeBlock>

### Remove all the files that are not related to the continuous code generation setup 
The reason why we need to remove the generated code is that between template versions, new files might be introduced or removed. Simply re-generating without removing previous code could leave unintended code laying around.

So since we cannot control what the template generates, we can control what the continuous code generation introduces. Therefore by filtering everything we know we introduced, and remove the rest.

<CodeBlock caption="Removing all the previous generated files to ensure there are no unintended files present." language="bash">
{`\# Remove previous generated files to ensure clean slate
find . -not \( -name configs.json -or -name .gitignore -or -name LICENSE -or -name generate.sh -or -iwholename *.github* -or -iwholename *.git* -or -name . \) -exec rm -rf {} +
`}</CodeBlock>

### Generate the new library

Now that we have a clean slate, we can regenerate the code.

<CodeBlock caption="Regenerate the library from the AsyncAPI template." language="bash">
{`\# Install the generator if it does not already exist.
if ! command -v ag &> /dev/null
then
  npm install -g @asyncapi/generator
fi
\# Generating new code from the AsyncAPI document
  ag --force-write \\
    --output ./ \\
    $\{url_to_asyncapi_document\} \\
    https://github.com/$\{template_to_use\} \\
    -p version="$\{library_last_version\}" \\
     -p targetFramework="netstandard2.0;netstandard2.1;net461" \\
     -p repositoryUrl="$\{repository_url\}" \\
     -p projectName="$\{libary_name\}" \\
     -p packageVersion="$\{library_last_version\}" \\
     -p assemblyVersion="$\{library_last_version\}.0" \\
     -p fileVersion="$\{library_last_version\}.0"
`}</CodeBlock>

As each template has specific parameters this example shows how it uses the dotnet-nats-template with the specific parameters.

### Save the versions of the current code template and the API document for next time

With the new code generated, we can now save the template and the AsyncAPI document versions used to generate it for next time. Here we can utilize `jq` again to write the new values:

<CodeBlock caption="After the library is generated we can now save the versions used to generate the library for next time." language="bash">
{`\# Write new config file to ensure we keep the new state for next time
contents="$(jq ".template_last_version = \"$template_current_version\" | .document_last_version = \"$document_current_version\"" configs.json)" && echo "$\{contents\}" > configs.json
`}</CodeBlock>

In theory, you could overwrite the `configs.json` file without using `jq`, but if you wanted to add extra properties to the file, you would have to adapt this code, so this is more future-proof.

## Next

With the generation process done, it's time to tie it together with the specifics of the programming languages as each has specific needs.

Next up is the specific setup for TypeScript that contains the specifics how a TypeScript library can be auto updated, released and customized.

> Photo by <a href="https://unsplash.com/@iswanto?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Iswanto Arif</a> on <a href="https://unsplash.com/s/photos/beach-sitting?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>