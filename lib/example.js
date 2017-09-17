const RabbitMQClient = require('./index');

// Instantiate new client with connection URL and prefetch number
const queue = new RabbitMQClient('amqp://user:password@127.0.0.1?heartbeat=60', 10);

queue.connect();

queue.on('connected', () => {
    addSubscriptions();
    startPublisher();
});

function addSubscriptions() {
    queue.subscribe('test', (msg, ackCallback) => {
        console.log(`[RX] Received message from "test" queue: ${msg.content.toString()}`);
        ackCallback(); // Acknowledge handling of the message.

        /*
         * To reject this message and force RabbitMQ to place it back on the queue and
         * make it available for handling again, call `ackCallback` with an instance
         * of `Error`, like so:
         *
         * ackCallback(new Error('Unable to handle the message));
         */
    });
}

function startPublisher() {
    setInterval(() => {
        queue.publish('test', new Buffer(new Date().toLocaleString()), (err) => {
            if (err) {
                console.log('[TX] ERROR: ' + err.message);
            } else {
                console.log('[TX] message sent');
            }
        });
    }, 1000);
}
