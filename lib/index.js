const EventEmitter = require('events');
const amqp = require('amqplib/callback_api');

// -----------------------------------------------------------------------------
// Private functions
// -----------------------------------------------------------------------------

function messagePreHandler(callback, msg, channel) {
    callback(msg, (err) => {
        if (err) {
            channel.reject(msg, true);
        } else {
            channel.ack(msg);
        }
    });
}

// -----------------------------------------------------------------------------
// Class definition
// -----------------------------------------------------------------------------

class RabbitMQClient extends EventEmitter {

    constructor(url) {
        super();

        this.url = url;
        this.amqpConn = null;
        this.receiveChannel = null;
        this.pubChannel = null;
        this.offlinePubQueue = [];
        this.offlineDepth = 0;

    }

    connect() {

        let clazz = this;

        amqp.connect(clazz.url, function (err, conn) {
            if (err) {
                console.error('[AMQP]', err.message);
                return setTimeout(() => {
                    clazz.connect(clazz.url);
                }, 3000);
            }

            conn.on('error', function (conErr) {
                if (conErr.message !== 'Connection closing') {
                    console.error('[AMQP] conn error', conErr.message);
                    return setTimeout(() => {
                        clazz.connect();
                    }, 3000);
                }
            });

            conn.on('close', function () {
                console.error('[AMQP] reconnecting');
                return setTimeout(() => {
                    clazz.connect();
                }, 3000);
            });

            clazz.amqpConn = conn;

            clazz.createPublishChannel(() => {
                clazz.createReceiveChannel(() => {
                    clazz.emit('connected');
                });
            });

        });
    }

    createPublishChannel(next) {

        let clazz = this;

        clazz.amqpConn.createConfirmChannel(function (err, ch) {

            if (err) {
                clazz.amqpConn.close();
                clazz.amqpConn = null;
                return;
            }

            ch.on('error', function (chanErr) {
                console.error('[AMQP] channel error', chanErr.message);
            });

            ch.on('close', function () {
                console.log('[AMQP] channel closed');
            });

            clazz.pubChannel = ch;
            next();

            function publishOneOfflineMessage() {

                if (clazz.offlineDepth > 10) {
                    console.log('Too many offline messages. Throttling back...');
                    return;
                }

                if (clazz.pubChannel && clazz.offlinePubQueue && clazz.offlinePubQueue.length > 0) {
                    let m = clazz.offlinePubQueue.shift();

                    if (m) {
                        clazz.publish(m[0], m[1]);
                        clazz.offlineDepth++;
                        publishOneOfflineMessage();
                    }
                }

            }

            setInterval(function () {
                if (clazz.offlinePubQueue && clazz.offlinePubQueue.length > 0) {
                    console.log(clazz.offlinePubQueue.length + ' messages in offline queue');
                }

                clazz.offlineDepth = 0;
                publishOneOfflineMessage();
            }, 5000);

        });

    }

    createReceiveChannel(next) {

        let clazz = this;

        clazz.amqpConn.createChannel(function (err, ch) {

            if (err) {
                clazz.amqpConn.close();
                clazz.amqpConn = null;
                return;
            }

            ch.on('error', function (chanErr) {
                console.error('[AMQP] channel error', chanErr.message);
            });

            ch.on('close', function () {
                console.log('[AMQP] channel closed');
            });

            ch.prefetch(10);
            clazz.receiveChannel = ch;
            next();
        });
    }

    subscribe(queueName, callback) {

        let clazz = this;

        const options = {
            noAck: false
        };

        clazz.receiveChannel.assertQueue(queueName, { durable: true }, (err) => {
            if (err) {
                clazz.amqpConn.close();
                clazz.amqpConn = null;
                return;
            }

            clazz.receiveChannel.consume(queueName, (msg) => { messagePreHandler(callback, msg, clazz.receiveChannel); }, options);
        });
    }

    publish(queueName, message, callback) {

        let clazz = this;

        if (clazz.pubChannel) {
            try {
                clazz.pubChannel.publish('', queueName, message, { persistent: true }, (err) => {
                    if (err) {
                        console.error('[AMQP] publish', err);
                        clazz.offlinePubQueue.push([queueName, message]);

                        if (clazz.pubChannel && clazz.pubChannel.connection) {
                            clazz.pubChannel.connection.close();
                        }

                        clazz.pubChannel = null;

                        if (callback) {
                            callback(err);
                        }
                    } else if (callback) {
                        callback();
                    }
                });
            } catch (e) {
                console.error('[AMQP] publish', e.message);
                clazz.offlinePubQueue.push([queueName, message]);

                if (clazz.pubChannel && clazz.pubChannel.connection) {
                    clazz.pubChannel.connection.close();
                }

                clazz.pubChannel = null;

                if (callback) {
                    callback(e);
                }
            }
        } else {
            clazz.offlinePubQueue.push([queueName, message]);
            if (callback) {
                callback();
            }
        }
    }
}

module.exports = RabbitMQClient;
