const queue = require('./index');

let timer = setInterval(() => {
    if (queue.connected) {
        clearInterval(timer);
        timer = null;
        addSubscriptions();
    }
}, 500);

function addSubscriptions() {
    queue.subscribe('test', (msg, ackCallback) => {
        console.log(`Received message from "test" queue: ${msg.content.toString()}`);
        ackCallback();
    });
}

setInterval(() => {
    queue.publish('test', new Buffer(new Date().toLocaleString()));
}, 1000);
