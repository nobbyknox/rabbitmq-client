const amqp = require('amqplib/callback_api');

let amqpConn = null;
let confirmChannel = null;
let receiveChannel = null;
let pubChannel = null;
let offlinePubQueue = [];
let offlineDepth = 0;

function start() {

    amqp.connect(process.env.RABBIT_URL, function (err, conn) {
        if (err) {
            console.error("[AMQP]", err.message);
            return setTimeout(start, 3000);
        }

        conn.on("error", function (err) {
            if (err.message !== "Connection closing") {
                console.error("[AMQP] conn error", err.message);
                return setTimeout(start, 3000);
            }
        });

        conn.on("close", function () {
            console.error("[AMQP] reconnecting");
            return setTimeout(start, 3000);
        });

        console.log("[AMQP] connected");
        amqpConn = conn;

        whenConnected();
    });
}

function whenConnected() {
    startPublisher();
    startConsumer();
}

function startPublisher() {

    amqpConn.createConfirmChannel(function (err, ch) {
        if (closeOnErr(err)) return;

        ch.on("error", function (err) {
            console.error("[AMQP] channel error", err.message);
        });

        ch.on("close", function () {
            console.log("[AMQP] channel closed");
        });

        pubChannel = ch;

        function publishOneOfflineMessage() {

            if (offlineDepth > 10) {
                console.log('Too many offline messages. Throttling back...');
                return;
            }

            if (pubChannel && offlinePubQueue && offlinePubQueue.length > 0) {
                var m = offlinePubQueue.shift();

                if (m) {
                    publish(m[0], m[1], m[2]);
                    offlineDepth++;
                    publishOneOfflineMessage();
                }
            }

        }

        setInterval(function () {

            if (offlinePubQueue && offlinePubQueue.length > 0) {
                console.log(offlinePubQueue.length + ' messages in offline queue');
            }

            offlineDepth = 0;
            publishOneOfflineMessage();
        }, 5000);

    });
}

// Method to publish a message, will queue messages internally if the connection is down and resend later
function publish(exchange, routingKey, content) {

    if (pubChannel) {
        try {
            pubChannel.publish(exchange, routingKey, content, { persistent: true },
                function (err, ok) {
                    if (err) {
                        console.error("[AMQP] publish", err);
                        offlinePubQueue.push([exchange, routingKey, content]);

                        if (pubChannel && pubChannel.connection) {
                            pubChannel.connection.close();
                        }
                        pubChannel = null;
                    }
                });
        } catch (e) {
            console.error("[AMQP] publish", e.message);
            offlinePubQueue.push([exchange, routingKey, content]);

            if (pubChannel && pubChannel.connection) {
                pubChannel.connection.close();
            }

            pubChannel = null;
        }
    } else {
        console.log('No pubChannel. Adding message to offline queue');
        offlinePubQueue.push([exchange, routingKey, content]);
    }

}

function subscribe(queueName, callback) {
    const options = {
        noAck: false
    };

    receiveChannel.assertQueue(queueName, { durable: true }, function (err, _ok) {
        if (closeOnErr(err)) return;
        receiveChannel.consume(queueName, (msg) => { messagePreHandler(callback, msg, receiveChannel); }, options);
    });
}

function messagePreHandler(callback, msg, channel) {
    callback(msg, (err) => {
        if (err) {
            channel.reject(msg, true);
        } else {
            channel.ack(msg);
        }
    });
}

function startConsumer() {

    amqpConn.createChannel(function (err, ch) {
        if (closeOnErr(err)) return;

        ch.on("error", function (err) {
            console.error("[AMQP] channel error", err.message);
        });

        ch.on("close", function () {
            console.log("[AMQP] channel closed");
        });

        ch.prefetch(10);

        receiveChannel = ch;
    });
}

function closeOnErr(err) {
    if (!err) return false;
    console.error("[AMQP] error", err);
    amqpConn.close();
    return true;
}

function connected() {
    return (receiveChannel);
}

start();

module.exports = {
    connected,
    publish,
    subscribe
};
