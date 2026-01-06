---
title: "NATS and game servers"
date: 2022-03-28T20:30:00+00:00
type: Engineering
tags:
  - GamingAPI
  - NATS
  - Event Sourcing
  - Docker compose
  - Swarm
cover: /img/posts/nats-setup.webp
authors:
  - name: Jonas Lagoni
    photo: /img/avatars/jonaslagoni.webp
    link: https://github.com/jonaslagoni
excerpt: "Why NATS and how is it setup for GamingAPI?"
---

I have recently spent some time trying to learn about event sourcing and it happens to fit perfectly for [GamingAPI](https://gamingapi.org). I want to have a log of events that happened in the game server, to enable server owners to pull those events as needed.

This would enable you to create all kinds of applications but to name a few:
- Create a historical database of the game server, i.e. leader boards, player profiles, among others.
- Create a discord bot that notifies your players that a game server has started/stopped, etc.
- Send any type of commands from anywhere to the game server which can consume them once it is ready to do so.
You can read more about their features here: https://docs.nats.io/nats-concepts/overview

In [NATS](https://nats.io/) to do event sourcing, you will have to utilize a feature they call [JetStream](https://docs.nats.io/nats-concepts/jetstream).

Some of the reasons why I chose NATS:
- It's diverse and easy setup and focus on performance.
- It's ability to scale servers from a single server to [clusters](https://docs.nats.io/running-a-nats-service/configuration/clustering) and even [super clusters](https://docs.nats.io/running-a-nats-service/configuration/gateways).
- It has decent support in AsyncAPI code generation in [C#](https://github.com/asyncapi/dotnet-nats-template) and [TS](https://github.com/asyncapi/ts-nats-template/) (and soon Go).
- I have been using it for some time now, and are comfortable around it.

## Initial setup

I have two dedicated servers within a Swarm cluster, that I am gonna deploy the NATS broker to that everything related to GamingAPI is gonna run on. At least as a start.

I did plan to start off with a cluster of NATS servers, however, I ended up deciding to go with the absolute minimal solution of a single NATS server. Eventually, it will most definitely become a cluster or even a supercluster, however, there is no reason to overcomplicate things when I don't have to at this early stage.

### Initial configuration
The initial configuration looks like the following:
```
#./configs/nats/nats-1.conf
server_name = "nats-1"
listen = 4222

jetstream {
  store_dir = "/data/gamingapi"
}

accounts {
  GA-1: {
    jetstream: {
      max_mem: 512M
      max_file: 1G
      max_streams: 10
      max_consumers: 100
    },
    users: [
      {
        user: UDXU4RCSJNZOIQHZNWXHXORDPRTGNJAHAHFRGZNEEJCPQTT2M7NLCNF4
      }
    ]
  }
}
```
My initial idea regarding accounts is that each game server owner gets their own account. 

Each account can have x restrictions, such as the maximum number of consumers (`max_consumers`), etc. At some point in the future, I need to figure out which **types** of accounts should be present in the system i.e. accounts with certain restrictions that can be upgraded. Cause I will by no means want to pay for your +1TB events :laughing: As everything will be open-source, so you are of course free to set up your own NATS broker and use that instead of the provided one. The account then has x users associated. 

A user in this context is anyone who needs to have access to any of the APIs, i.e. either a normal user account, game server, or third-party applications. This means that you can create as many users as you like, each with their own access token. 

Accounts also create an excellent segregation between users to provide a solid security model. For example, two accounts cannot, unless explicitly states, have access to each other's events. 

### Security in the future
I do plan to take [advantage of JWT](https://docs.nats.io/running-a-nats-service/configuration/securing_nats/auth_intro/jwt), however, I haven't quite figured out how to actually use them yet or how much they will benefit... So for now that setup is on the back burner. The reason I want to go with JWT is that I have a feeling I will be able to set it up with the REST API as well as [giving game owners the power to authorize third parties easily](https://auth0.com/docs/get-started/applications/confidential-and-public-applications/first-party-and-third-party-applications). How? No idea. 

## Docker compose

Single NATS server is configured with the following docker-compose file.
```yml
#nats.yml
version: '3.8'
services:
  nats-1:
    restart: unless-stopped
    image: nats
    command: "-c /etc/nats/nats.conf"
    volumes:
      - "./configs/nats/nats-1.conf:/etc/nats/nats.conf"
      - "/nats/data/nats-1:/data/gamingapi"
    ports:
      - 4222:4222
    networks:
      - gamingapi
networks:
  gamingapi:
    external: true
```
Notice how I already have an [overlay network](https://docs.docker.com/network/overlay/) in place called `gamingapi`. This enables me to independently deploy services and game servers and attach them to the same network to be discoverable.

I can then deploy the NATS server using the command `docker stack deploy -c ./nats.yml gaming_api_nats`

One of the things I have not quite figured out with docker swarm deployments is the best way to share files across the nodes in the swarm cluster. For example, the NATS configuration, how to best give other nodes access to the underlying configurations. Eventually, I will need to find a solution for this, but it seems complex...

## Next
Designing the account system and how to map that to AsyncAPI and NATS is gonna be interesting and probably complex, but that is the next step in the NATS setup. 

Once the account system is designed, I need a dynamic way for users to manage their accounts and access to the NATS server in a dynamic way. That would enable me to tie the [developer portal](https://gamingapi.org/) together with the NATS server for a dynamic configuration.

However, that is not gonna happen until the underlying communication has been designed with AsyncAPI and the first game server is in production running on the network.

Related resources:
- https://martinfowler.com/eaaDev/EventSourcing.html
- Really recommend this talk by Greg Young - https://www.youtube.com/watch?v=8JKjvY4etTY
- Same goes for this from Martin Fowler - https://www.youtube.com/watch?v=STKCRSUsyP0

Photo by <a href="https://unsplash.com/@billy_huy?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Billy Huynh</a> on <a href="https://unsplash.com/s/photos/cluster?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
  
  