// Run `node comsumer.js 1` `1` is name of the current consumer;

const amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(error, connection) {
    if (error) {
        throw error;
    }
    connection.createChannel(function(error, channel) {
        if (error) {
            throw error;
        }
        const exchangeName = 'topic_exchange';
        const exchangeType = 'topic';
        const routingPattern = '*.data-sync';
        const queueName = 'data-sync';

        channel.assertExchange(exchangeName, exchangeType, {
          durable: true
        });

        channel.prefetch(1);

        channel.assertQueue(queueName, { exclusive: false }, function(error, queue) {
            if (error) {
              throw error;
            }
            console.log(`Consumer[${process.argv[2]}] Create Success!`);

            channel.bindQueue(queue.queue, exchangeName, routingPattern);

            channel.consume(queue.queue,async function(msg) {
                // Simulated time-consuming operation
                setTimeout(() => {
                    if(msg.content) {
                        console.log(`Current consumerTag: ${msg.fields.consumerTag}`);
                        console.log(`Received Messsge From Consumer[${process.argv[2]}]:${msg.content.toString()}`);
                        console.log(' ');
                        console.log(' ');
                    }
                    channel.ack(msg);
                }, 1000);
            }, {
                noAck: false
            });
        });
    });
});