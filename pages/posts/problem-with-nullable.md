---
title: "Modelina - The problem with nullable"
date: 2022-08-16T16:00:00+01:00
type: Communication
tags:
  - AsyncAPI
  - Tooling
cover: /img/posts/tooling-update.webp
authors:
  - name: Jonas Lagoni
    photo: /img/avatars/jonaslagoni.webp
    link: https://github.com/jonaslagoni
    byline: AsyncAPI Maintainer
excerpt: ''
---

I want to use this post to dive into a problem, which I simply cannot solve in my head, so hopefully at the end of writing this I will have the answer to my question. How can Modelina dipict nullable types?

This blog post is my way of trying to solve the following: 

- https://github.com/asyncapi/modelina/pull/752
- https://github.com/asyncapi/modelina/pull/755
- https://github.com/asyncapi/modelina/pull/759
- https://github.com/asyncapi/modelina/issues/749
- https://github.com/asyncapi/modelina/issues/754

I have a feeling that if the MetaModel had something like a `nullable` property, to know if a certain model should be nullable, that would not be enough from the generators perspective. Starting off the `nullable` property can be used to set the type constraint for a model. That way instead of saying the type for a boolean is `boolean` it would be possible to set is as `boolean | null` in TypeScript.

```ts
const generator = new TypeScriptGenerator({
  typeMapping: {
    Boolean: ({constrainedModel, options, propertyKey}) => {
      if(constrainedModel.nullable === true) {
        return 'boolean | null';
      }
      return 'boolean';
    }
  }
});
```

But... Can generators use this type reliably? Lets say a TypeScript class constains a property with a nullable boolean type:

```ts
class Root {
  private _someProperty?: boolean | null;
  constructor(input: {
    someProperty?: boolean | null,
  }) {
    this._someProperty = input.someProperty;
  }
  get someProperty(): boolean | null { return this._someProperty; }
  set someProperty(someProperty: boolean | null) { this._someProperty = someProperty; }
}
```

That seems fine to be honest. But what about if you wanted to access the raw non-nullable type somewhere within the generator? Say I wanted to render `boolean` and not `null` because for some reason I the model to contain a function that only allowed you to set a "real" value. Another example instead of being used in a function, lets say we wanted to overwrite the set accessor, and add a default value if a null value is provided for some reason. Would these even be a use-case, where you would want to access both types individually?

```ts
class Root {
  private _someProperty?: boolean | null;
  constructor(input: {
    someProperty?: boolean | null,
  }) {
    this._someProperty = input.someProperty;
  }
  get someProperty(): boolean | null { return this._someProperty; }
  set someProperty(someProperty: boolean | null) { this._someProperty = someProperty; }
  
  somePropertyFunction(someProperty: boolean) { ... }
  somePropertyFunction2(someProperty: boolean | null) { 
    //Default value example
    const someProp2: boolean = someProperty === null ? true : someProperty;
  }
}
```

It is really hard to say... Of course if you only have `property.type` that returns `boolean | null` you could manually split the string variable, but that only works well if the type constraint has not been manually changed by the user to something different. So I would proably call that a hack which should probably be avoided...

Alternativly, the type constraints could be reworked to have to define both types, `model.type` and optionally `model.optionalType`. It seems a lot for just nullable types, but it might be required to do...
