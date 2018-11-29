# RabbitMQ Client

## Abstract

The primary aim for this library is to make it very easy to publish and consume RabbitMQ messages.

## Features

1. API to publish and consume messages
1. Offline internal queue for when connection to the server is lost. Internally queued messages will be published to the server once it becomes available again.
1. Continuous reconnection attempts if the connection to the server is lost. No action on your part required.

## Installation

```
npm install @nobbyknox/rabbitmq-client --save
```

## Sample Usage

Here is a fully working example that illustrates all the moving parts.
You can also look at `lib/example.js` for a fuller developed example.

```js
const RabbitMQClient = require('@nobbyknox/rabbitmq-client');

// Instantiate new client with connection URL and prefetch number
const queue = new RabbitMQClient('amqp://user:password@127.0.0.1?heartbeat=60', 10);

queue.connect();

queue.on('connected', () => {
    addSubscriptions();
    startPublisher();
});

function addSubscriptions() {
    queue.subscribe('test', (msg, ackCallback) => {
        console.log(`Received message from "test" queue: ${msg.content.toString()}`);
        ackCallback(); // Acknowledge handling of message
    });
}

function startPublisher() {
    setInterval(() => {
        queue.publish('test', new Buffer(new Date().toLocaleString()));
    }, 1000);
}
```
