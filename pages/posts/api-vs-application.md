---
title: "API vs Application"
date: 2023-04-12T16:00:00+01:00
type: Communication
tags:
  - Modelina
  - Tooling
cover: /img/posts/modelina.jpg
authors:
  - name: Jonas Lagoni
    photo: /img/avatars/jonaslagoni.webp
    link: https://github.com/jonaslagoni
    byline: AsyncAPI Maintainer
excerpt: 'One question that has been nagging me lately is; what is the difference between an API and an application in the context of AsyncAPI?'
---

At which point does something become an API? What is the difference between an API and an application in the context of AsyncAPI? How does it relate to what we are used to with OpenAPI?

These questions have been nagging me lately since the release of AsyncAPI v3, and as [Mete Atamel puts it](https://medium.com/google-cloud/asyncapi-gets-a-new-version-3-0-and-new-operations-013dd1d6265b);

>  While I agree that publish and subscribe were confusing, I'm not sure if send and receive are less confusing. You still need to talk about whose perspective when defining these operations. AsyncAPI docs talk about application but that's not clear either. Does application refer to the code sending the message (user) or the code receiving the message (server)?

So where to even begin to unravel these questions?

## An Application
Lets start with what the [AsyncAPI specification defines it as;](https://www.asyncapi.com/docs/reference/specification/v3.0.0#definitionsApplication)

> An application is any kind of computer program or a group of them. It MUST be a sender, a receiver, or both. An application MAY be a microservice, IoT device (sensor), mainframe process, message broker, etc. An application MAY be written in any number of different programming languages as long as they support the selected protocol. An application MUST also use a protocol supported by the server in order to connect and exchange messages.

Application to me always meant, a unit, entity, (not server or client, because it can be both!), a grouping (serverless functions for example) - basically see it as something that sends and receives something, however you want to group it :D

Let me run a few examples to get a better understanding, lets start with a simple OpenAPI document, it describes what a client might do to your server. 

```yaml

```

- AsyncAPI is more dynamic, here you have 3 options instead of just one, first option is describing the server itself, how it interacts with the world, i.e. it receives on a bunch of channels.

AsyncAPI is more dynamic, here you define the server itself as an application that are receiving requests;

```yaml
channels:
  test:
    address: '/test'
    messages: 
      test: 
        payload: 
          type: object
          properties:
            test:
              type: string
operations:
  test: 
    action: receive
    channel: 
      $ref: '#/channels/test'
```

Remember it might also be sending messages on its own to fulfill those requests!


```diff
channels:
  test:
    # ...
operations:
  test: 
    action: receive
    channel: 
      $ref: '#/channels/test'
+  test2: 
+    action: send
+    channel: 
+      $ref: '#/channels/test'
```

The client is also an application, but here it gets a little more complex, should the client really be maintaining their own AsyncAPI document? Do you just want to expose what others may do to your system? Is the client still part of your system?

I personally think that from the clients perspective, it comes down to whether or not that application is interacting with something else then the server. Because if it's the later, its a true copy of the server with switched action keywords;

```diff
channels:
  test:
    # ...
operations:
  test: 
-    action: receive
+    action: send
    channel: 
      $ref: '#/channels/test'
```

However, such a client rarely only interact with a single service, and thats where the power of AsyncAPI really comes into place;

```yaml
channels:
  test:
    # ...
operations:
  test: 
    # ...
  test: 
    action: receive
    channel: 
      $ref: '#/channels/test'
```

But it also creates a more fragile service, because how do you ensure consistency between the two applications if they share common definitions?





https://atamel.dev/posts/2023/05-18_asyncapi_publishsubscribe_refactor/

https://www.asyncapi.com/docs/tutorials/getting-started/coming-from-openapi



> Photo by <a href="https://unsplash.com/@tateisimikito?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Jukan Tateisi</a> on <a href="https://unsplash.com/photos/bJhT_8nbUA0?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
