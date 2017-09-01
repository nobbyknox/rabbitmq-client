const queue = require('./index');

// This is still a little hacky. Need to find an elegant way of notifying users
// of the library that the connection to the server is ready.
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
