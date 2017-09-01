# RabbitMQ Client

## Abstract

This client library makes it easy to publish and consume RabbitMQ messages.

## Installation

```
npm install @nobbyknox/rabbitmq-client --save
```

## Sample Usage

Specify the RabbitMQ connection URL via an environment variable, like this:

```
RABBITMQ_URL=amqp://user:password@127.0.0.1?heartbeat=60 node lib/example.js
```

Here is a full working example that illustrates all the moving parts.
You can also find this example in the `lib` directory.

```js
const queue = require('@nobbyknox/rabbitmq-client');

let timer = setInterval(() => {
    if (queue.connected) {
        clearInterval(timer);
        timer = null;
        addSubscriptions();
    }
}, 500);

function addSubscriptions() {
    // Subscribe to the "test" queue
    queue.subscribe('test', (msg, ackCallback) => {
        console.log(`Received message from "test" queue: ${msg.content.toString()}`);
        ackCallback(); // Acknowledge consumption of the message. Add instance of `Error` to reject message.
    });
}

// Publish a message to the "test" queue every second
setInterval(() => {
    queue.publish('test', new Buffer(new Date().toLocaleString()));
}, 1000);
```
