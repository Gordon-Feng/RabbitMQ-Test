// Run `node comsumer.js 1` `1` is name of the current consumer;

const amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(error, connection) {
    if(error) {
        throw error;
    } else {
        connection.createChannel(function(error, channel) {
            if(error) {
                throw error;
            } else {
                const exchangeName = 'fanout_exchange'; 
                const exchangeType = 'fanout';
                channel.assertExchange(exchangeName, exchangeType, { durable: true });

                const queueName = `fanout_queue_${process.argv[2]}`;
                const routeKey  = ''; // We need to supply a routing key when sending, but its value is ignored for fanout exchanges.
                channel.assertQueue(queueName, { exclusive: false }, function(error, queue) {
                    if(error) {
                        throw error;
                    } else {
                        console.log(`Consumer[${process.argv[2]}] Create Success!`);

                        channel.bindQueue(queue.queue, exchangeName, routeKey);
                        channel.consume(queue.queue, function(msg) {
                            if(msg.content) {
                                console.log(`Received Messsge From Consumer[${process.argv[2]}]:${msg.content.toString()}`);
                            }
                            channel.ack(msg);
                        }, { noAck: false });
                    }
                });
            }
        });
    }
});