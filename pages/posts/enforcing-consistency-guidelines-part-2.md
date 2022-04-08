---
title: "Enforcing consistency guidelines - part 2"
date: 2022-04-08T19:01:00+00:00
type: 
  - Engineering
  - Governance
tags:
  - GamingAPI
  - AsyncAPI
  - Linting
  - Spectral
cover: /img/posts/enforcing-consistency-guidelines-part-2.webp
authors:
  - name: Jonas Lagoni
    photo: /img/avatars/jonaslagoni.webp
    link: https://github.com/jonaslagoni
excerpt: "Continuing, part 2 focuses on advanced Spectral rules and functions to enforce the GamingAPI consistency guidelines."
---

Part 2 clarifies the more advanced Spectral rules for enforcing the [consistency governance guidelines](/posts/getting-started-with-governance#consistency). For a better introduction into spectral and the setup please [checkout part 1 of enforcing consistency guidelines](/posts/enforcing-consistency-guidelines-part-1).

I have suggested including each of the custom rules into the built-in AsyncAPI ruleset which is linked to at the end of each. If you also would like to see them added, please go to the corresponding issue voice it :+1:


### Enforce `_at` suffix for date/time properties
> MUST name date/time properties with _at suffix.

This one is a bit tricky. I ended up going with a rule that matches any object containing `properties` keyword and calls the custom function `use-suffix-for-date-time` for each.

<CodeBlock language="yaml">
{`...
functions: [..., use-suffix-for-date-time]
rules: 
  ...
  asyncapi-date-time-must-use-at-suffix:
    given: $.channels.[*][subscribe,publish].message..properties
    severity: error
    then:
      function: use-suffix-for-date-time
`}</CodeBlock>

The custom function then checks all properties against whether the property use date/time formats and if they do, ensure that the property ends with `_at`:

```js
// Based on https://json-schema.org/understanding-json-schema/reference/string.html#dates-and-times
export default (properties, _, { path }) => {
  const results = [];
  for (const [propertyName, property] of Object.entries(properties)) {
    const formats = ["date-time", "time", "date"];
    const formatsForMessage = formats.map(format => `"${format}"`).join(',');
    if(property.format && formats.includes(property.format)) {
      const lastThreeChars = propertyName.slice(propertyName.length-3, propertyName.length);
      if(lastThreeChars !== '_at'){
        results.push({
          message: `Formats ${formatsForMessage} MUST end with "_at". Expected property "${propertyName}" to be called "${propertyName}_at"`,
          path: [...path, propertyName],
        });
      }
    }
  }
  return results;
};
```

Issue proposing to bring this as part of the built-in ruleset in Spectral: https://github.com/stoplightio/spectral/issues/2114

### Force snake_case format for property names
> MUST property names must be snake_case.


Same as with the date/time suffix check, the best way I found to solve this was with a rule that matches any object containing `properties` keyword and calls the custom function `snake-case-properties` for each.

<CodeBlock language="yaml">
{`...
functions: [..., snake-case-properties]
rules: 
  ...
  asyncapi-properties-must-follow-snake-case:
    given: $.channels.[*][subscribe,publish].message..properties
    severity: error
    then:
      function: snake-case-properties
`}</CodeBlock>

The custom function then for each property, format it as snake_case, and if the original property is not equal to the snake case variant, return there is an issue.

```js
function snake_case_string(str) {
  return str && str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map(s => s.toLowerCase())
    .join('_');
}

export default (properties, _, { path }) => {
  const results = [];
  for (const [property, _] of Object.entries(properties)) {
    const expectedPropertyName = snake_case_string(property);
    if (property !== expectedPropertyName) {
      results.push({
        message: `Property MUST follow snake-case. Expected property "${property}" to be called "${expectedPropertyName}"`,
        path: [...path, property],
      });
    }
  }
  return results;
};
```

Issue proposing to bring this as part of the built-in ruleset in Spectral: https://github.com/stoplightio/spectral/issues/2115

### Include versioning in channels
> MUST include semantic versioning in channels (each channel and path must use resource versioning. Read more about the versioning strategy here).


This check can be done by matching all channel keys against a regex pattern, which ensures `v<NUMBER>` MUST be present, otherwise, it will result in an error.
<CodeBlock language="yaml">
{`rules: 
  ...
  asyncapi-channel-must-have-version:
    given: "$.channels"
    description: 'Channel MUST have version number included in the topic. Example: "v1/channel/example"'
    severity: error
    then:
      field: "@key"
      function: pattern
      functionOptions:
        match: ".*(v(.*[0-9])).*"
`}</CodeBlock>

Issue proposing to bring this as part of the built-in ruleset in Spectral: https://github.com/stoplightio/spectral/issues/2116

### Always use references
> MUST use references where at all possible (to leverage reusability, references MUST be used where at all possible).

Spectral normally resolves all references before you can check them, but you can disable that through `resolved: false`. I will only enforce reusability for parameters and message objects for now, as I have no idea how to change the depth references are resolved. 

#### Parameters
The channel parameters can be checked that each is always defined with `$ref` instead of any information.
<CodeBlock language="yaml">
{`rules: 
  ...
  asyncapi-parameters-must-use-references:
    description: Channel parameters must be references
    given: $.channels.[*]
    severity: error
    resolved: false
    then:
      function: schema
      functionOptions:
        schema:
          properties:
            parameters:
              additionalProperties:
                type: object
                required:
                  - $ref
`}</CodeBlock>

Issue proposing to bring this as part of the built-in ruleset in Spectral: https://github.com/stoplightio/spectral/issues/2117

#### Messages
Messages are a bit different because you can define messages with `oneOf`, and if that is the case, we need to match against an array of references instead of a single instance.
<CodeBlock language="yaml">
{`rules: 
  ...
  asyncapi-messages-must-use-references:
    description: Operation messages must be references
    given: $.channels.[*][subscribe,publish].message
    severity: error
    resolved: false
    then:
      function: schema
      functionOptions:
        schema: 
          if:
            required:
              - oneOf
          then:
            properties: 
              oneOf:
                type: array
                items:
                  type: object
                  required:
                    - $ref
          else:
            type: object
            required:
              - $ref
`}</CodeBlock>

Issue proposing to bring this as part of the built-in ruleset in Spectral: https://github.com/stoplightio/spectral/issues/2118

#### Message payload
I would have liked to force message payloads to always contain references. However, because messages themselves are references, you need a way to control the "depth" references are resolved. 

I proposed this is a new feature for Spectral: https://github.com/stoplightio/spectral/issues/2120

### Always use top-level JSON object
> MUST always return JSON objects as top-level data structures

For this rule, we can check that the message payloads always are defined as `type: "object"`.
<CodeBlock language="yaml">
{`rules: 
  ...
  asyncapi-message-payload-must-have-root-level-object:
    description: Message payloads must at the root be an object
    given: $.channels.[*][subscribe,publish].message..payload
    severity: error
    then:
      function: schema
      functionOptions:
        schema:
          properties:
            type:
              const: "object"
`}</CodeBlock>

Issue proposing to bring this as part of the built-in ruleset in Spectral: https://github.com/stoplightio/spectral/issues/2119

### Only use `additionalProperties` for map types
> SHOULD avoid additionalProperties unless used as a map partly inspired by 210 (each object should be as constrained as possible and additionalProperties should not be used unless used to define a map.).

For this, the simplest form of rule I found, was to match all objects `@object()` under the message payload.
<CodeBlock language="yaml">
{`...
functions: [..., payload-with-no-additional-properties-unless-map]
rules: 
  ...
  asyncapi-payload-with-no-additional-properties-unless-map:
    given: $.channels.[*][subscribe,publish].message..payload.@object()
    severity: error
    then:
      function: payload-with-no-additional-properties-unless-map
`}</CodeBlock>

And then ensure that `properties` and `additionalProperties` cannot be defined at the same time for each JSON object. The easiest way to solve this was through a custom function.

```js
export default (jsonObject, _, { path }) => {
  const results = [];
  if(jsonObject.properties !== undefined && jsonObject.additionalProperties !== false) {
    results.push({
      message: `Object with properties should not also define additionalProperties`,
      path: [...path, propertyName],
    });
  }
  return results;
};
```

### Conclusion

The rest of the consistency guidelines are not possible to enforce by Spectral because it is not about the AsyncAPI document itself, but the processes and documentation around it.

I think spectral is perfect for enforcing consistency for AsyncAPI documents. I am looking forward to having a more comprehensive standard ruleset, which will make it easier for everyone to use. Because it does take some time to learn how to `target` rules and how and what functions to `then` apply. 

> Photo by <a href="https://unsplash.com/@lh1me?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">HONG LIN</a> on <a href="https://unsplash.com/s/photos/lego-building?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
  
