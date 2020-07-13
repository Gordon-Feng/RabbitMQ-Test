const amqp = require('amqplib/callback_api');
const uuid = require('node-uuid');

amqp.connect('amqp://localhost', function(error, connection) {
    if (error) {
        throw error;
    }
    connection.createChannel(function(error, channel) {
        if (error) {
            throw error;
        }

        const exchangeName = 'consistent_exchange';
        const exchangeType = 'x-consistent-hash';
        const routingPattern = process.argv[2];
        const queueName = `data-sync-${uuid.v4()}`;
        // const queueName = 'data-sync-46a8c852-564c-477c-acc6-a3ad2dc4642a';

        channel.assertExchange(exchangeName, exchangeType, {
            durable: true
        });

        channel.prefetch(1);

        channel.assertQueue(queueName, { exclusive: true, autoDelete: true }, function(error, queue) {
            if (error) {
                throw error;
            }
            console.log(`Consumer[${process.argv[2]}] Create Success For Queue: ${queueName}!`);

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