---
title: "From constraints to structure"
date: 2022-09-30T16:00:00+01:00
type: Engineering
tags:
  - AsyncAPI
  - Tooling
cover: /img/posts/sacre-bleu-5IanwjLJq7Y-unsplash.webp
authors:
  - name: Jonas Lagoni
    photo: /img/avatars/jonaslagoni.webp
    link: https://github.com/jonaslagoni
    byline: AsyncAPI Maintainer
excerpt: 'Converting constraint rules, JSON Schema, into data structure is no easy task, or is it?'
---

This post is a blog post tribute to introducting the complexity behind Modelina, and how it tries to solve this very question of converting a constraint system, JSON Schema, and converting them into classes, interfaces and structs in programming languages.

I want to answer the questions, why it is so hard to generate models from JSON Schema and how do you convert a constrain system such as JSON Schema into a structural model for JSON values?

## From Constraints to Structure

In short, JSON Schema allows you to constrain your JSON data into something expected, but ever so often those constraints are mistaken with structure, or reality is that it can be structure, but it's also not. So alluding and confusing huh? :laughing: I will get back to that in a minute, but first I want to emphises what we are trying to achieve.

We are trying to get take **any arbitrary** JSON Schema document (with no exceptions to keywords) and convert it into structure.

## Why?

You might be asking yourself, why?

There can be many reasons you would like to get to the structure of the JSON data, rather then the constraints of it, it can be for code generation (where you want a model you can interact with programmably), or it can be for documentation purposes to show what JSON data can be send or recieved.

For example 

## Constraints
https://modern-json-schema.com/json-schema-is-a-constraint-system

Let me drive this point across by an example.

Given something like the following JSON Schema:

```json
{
  "type": "object", 
  "properties": { 
    "displayName": { 
      "type": "string", 
      "description": "Name of the user"
    },
    "email": { 
      "type": "string", 
      "format": "email", 
      "description": "Email of the user"
    }
  }
}
```

What the specification of JSON Schema dictates, is that you take the document, and pair it with a JSON instance, for example it could be the following:

```json
{
  "displayName": "test",
  "email": "test"
}
```

And you will be able say whether the data is valid or not, according to the validation rules dictated by the JSON Schema document. The specification dictate this process which means when you read the JSON Schema document 

```json
{                           // 9. invalid
  "type": "object",         // 1. valid
  "properties": {           // 8. invalid
    "displayName": {        // 4. valid
      "type": "string",   // 3. valid
      "description": "Name of the user"
    },
    "email": {              // 7. invalid
      "type": "string",   // 5. valid
      "format": "email",  // 6. invalid
      "description": "Email of the user"
    }
  }
}
```
Read the syntax as `{execution-step}. {validation result}` where `1. valid` means it's the first encountered keyword, and the validations result, against the instance data is `valid`.

And just to really drive the point across here, lets try do it with a double negation:
```json
{
    "not": {                                // 10. not valid = invalid
        "not": {                            // 9. not invalid = valid
            "type": "object",               // 1. valid
            "properties": {                 // 8. invalid
                "displayName": {            // 4. valid
                    "type": "string",       // 3. valid
                    "description": "Name of the user"
                },
                "email": {                  // 7. invalid
                    "type": "string",       // 5. valid
                    "format": "email",      // 6. invalid
                    "description": "Email of the user"
                }
            }
        }
    }
}
```

As you can see we end up with the same validation result as the first example, just with a double negation instead. **THIS** is the core concept of JSON Schema, there exist no notion of inheritance, delegation, programming language types, etc. All it does it say whether a JSON instance is valid or not, it does **NOT** define the structure of the JSON data.

### Code generation

Code generation for JSON Schema is all about **creating a model that you can use to create the JSON instance that will be valid against the JSON Schema docuent**. Thats it, bottom line. What that model looks like actually vary from programming language to programming language, but also from developer to developer for the same reason we have so many programming languages :laughing:

There are x parts to code generation for JSON Schema, 1. converting the validation rules to structure, 2. rendering that structure to a programming langugage, which is by no means trivial.

#### Converting validation rules to structure

First step, is to convert the validation rules into a structure that defines the JSON Structure.
Some keywords define the structure of the JSON value:
- type
- properties
- addtionalProperties
- patternProperties
- items
- additionalItems
- const
- enum
- required

Some keywords define instance validation behaviour that is applied when paired with an instance data: 
- format
- length and size keywords (maxLength, minLength, maxItems, minItems, uniqueItems, maxContains, minContains, maximum, exclusiveMaximum, minimum, exclusiveMinimum, maxProperties, minProperties)
- pattern
- if
- multipleOf
- default
- examples
- dependentRequired


Combination keywords that may or may not apply structure or instance validation:
- allOf
- oneOf
- anyOf
- not
- then
- else

Unimportant keywords:
- $id
- $schema
- $defs / definitions
- $ref
- $anchor
- $vocabulary
- readOnly
- writeOnly
- title
- description
- contentEncoding
- contentMediaType
- contentSchema


The question then become, can we define the JSON structure (without an instance) using the same structure keywords in JSON Schema?

### Special schemas

Boolean schemas basically mean either everything is allowed (`true`) or nothing at all (`false`).

`true` is allowing all types of JSON values and are defined as the following structural model:

```
{
  type: ["null", "boolean", "object", "array", "number", "string", "integer"]
  additionalProperties: true,
  additionalItems: true
}
```

### JSON value specifics
Some JSON values require specific requirements for the interpretation of the model.

**Object keywords**

Nested models from combination keywords can only apply extra properties, if `additionalProperties` is `true`, otherwise discard the model if `false` or use the model defined within `additionalProperties`.

Nested models from combination keywords can only apply extra properties, if `patternProperties` does not contain a pattern that matches that given property or the pattern property is `true`. Otherwise discard the model if the pattern model is `false`, or only use the model defined within here.

### Keyword interpretations
#### type
Type has the exact same core 7 types as in JSON Schema 

#### not
Even depth is enforcing or adding structure (depending on the #JSON value specifics) and odd depth is removing stucture.

##### Examples

**Odd depth not**
```
{
  type: 'object',
  properties: {
    animalType: {
      type: ['string', 'number'],
    }
  },
  not: {
    properties: {
      animalType: {
      	type: 'string'
      }
    }
  }
}
```

Converted to the following model:
```
{
  type: 'object',
  properties: {
    animalType: {
      type: ['number'],
    }
  }
}
```
Because only number type is allowed through.

valid:
```
{
	animalType: 1
}
```

invalid:
```
{
	animalType: "test"
}
```

**Even depth not**
This is enforcing the type for the property:
```
{
  type: 'object',
  properties: {
    animalType: {
      type: ['string', 'number'],
    }
  },
  not: {
    not: {
      properties: {
        animalType: {
          type: 'string'
        }
      }
    }
  }
}
```

Converted to the following model:
```
{
  type: 'object',
  properties: {
    animalType: {
      type: ['string'],
    }
  }
}
```
Because only string type is allowed through.

valid:
```
{
	animalType: "test"
}
```

invalid:
```
{
	animalType: 1
}
```

**Even depth not adding structure**

This is adding structure the property:
```
{
  type: 'object',
  properties: {
    animalType: true
  },
  not: {
    not: {
      properties: {
        animalType: {
          type: 'string'
        }
      }
    }
  }
}
```
Converted to the following model:
```
{
  type: 'object',
  properties: {
    animalType: {
      type: ['string'],
    }
  }
}
```
Because only string type is allowed through.

valid:
```
{
	animalType: "test"
}
```

invalid (anything else then string):
```
{
	animalType: 1
}
```

#### allOf
This one is debatable how the schemas are interpreted because it all depends on what you want out of it.

##### Examples



#### then and else
These keywords apply structure to the parent schema, we dont care about the if condition as it must always apply.


### Patterns to look for

There are also certain patterns that can produce different outcomes of the interpretation (merging of structures)

#### properties with oneOf

```
{
  title: 'Animal',
  type: 'object',
  properties: {
    animalType: {
      title: 'Animal Type',
      type: 'string',
    },
    age: {
      type: 'integer',
      min: 0,
    },
  },
  oneOf: [
    {
      title: 'Cat',
      type: 'object',
      properties: {
        animalType: {
          const: 'Cat'
        },
        huntingSkill: {
          title: 'Hunting Skill',
          type: 'string',
          enum: [
            'clueless',
            'lazy',
          ],
        },
      },
    },
    {
      title: 'Dog',
      type: 'object',
      additionalProperties: false,
      properties: {
        animalType: {
          const: 'Dog'
        },
        breed: {
          title: 'Dog Breed',
          type: 'string',
          enum: [
            'bulldog',
            'bichons frise',
          ],
        },
      },
    }
  ],
}
```

#### oneOf and allOf


```
{
  allOf: [{
    title: 'Animal',
    type: 'object',
    properties: {
      animalType: {
        title: 'Animal Type',
        type: 'string',
      },
      age: {
        type: 'integer',
        min: 0,
      },
    },
  }],
  oneOf: [
    {
      title: 'Cat',
      type: 'object',
      properties: {
        animalType: {
          const: 'Cat'
        },
        huntingSkill: {
          title: 'Hunting Skill',
          type: 'string',
          enum: [
            'clueless',
            'lazy',
          ],
        },
      },
    },
    {
      title: 'Dog',
      type: 'object',
      additionalProperties: false,
      properties: {
        animalType: {
          const: 'Dog'
        },
        breed: {
          title: 'Dog Breed',
          type: 'string',
          enum: [
            'bulldog',
            'bichons frise',
          ],
        },
      },
    }
  ],
  }
```


#### Post interpretation

Now that you have a model with all kinds of keywords in it, it might mean that it's a union of multiple types, but they are just all mixed together in one bundle.

So for this final step you need to look at the given model and see if it needs to match one or more JSON values.


> Photo by <a href="https://unsplash.com/ja/@sacreb1eu?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Sacre Bleu</a> on <a href="https://unsplash.com/photos/5IanwjLJq7Y?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
  