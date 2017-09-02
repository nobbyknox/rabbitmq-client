const RabbitMQClient = require('./index');
const queue = new RabbitMQClient('amqp://user:password@127.0.0.1?heartbeat=60');

queue.connect();

queue.on('connected', () => {
    addSubscriptions();
    startPublisher();
});

function addSubscriptions() {
    queue.subscribe('test', (msg, ackCallback) => {
        console.log(`[RX] Received message from "test" queue: ${msg.content.toString()}`);
        ackCallback();
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
