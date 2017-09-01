const RabbitMQClient = require('./index2');
const queue = new RabbitMQClient('amqp://8lnx:password@127.0.0.1?heartbeat=60');

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
