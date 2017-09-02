# RabbitMQ Client

## Abstract

This client library makes it easy to publish and consume RabbitMQ messages.

## Features

1. API to publish and consume messages
1. Offline internal queue for when connection to the server is lost. Internally queued messages will be published to the server once it becomes available again.
1. Continuous reconnection attempts if the connection to the server is lost. No action on your part required.

## Installation

```
npm install @nobbyknox/rabbitmq-client --save
```

## Sample Usage

Here is a full working example that illustrates all the moving parts.
You can also find this example in the `lib` directory.

```js
const RabbitMQClient = require('@nobbyknox/rabbitmq-client');

const queue = new RabbitMQClient('amqp://user:password@127.0.0.1?heartbeat=60');

queue.connect();

queue.on('connected', () => {
    addSubscriptions();
    startPublisher();
});

function addSubscriptions() {
    queue.subscribe('test', (msg, ackCallback) => {
        console.log(`Received message from "test" queue: ${msg.content.toString()}`);
        ackCallback();
    });
}

function startPublisher() {
    setInterval(() => {
        queue.publish('test', new Buffer(new Date().toLocaleString()));
    }, 1000);
}
```
