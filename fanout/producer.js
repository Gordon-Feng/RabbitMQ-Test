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

                const routeKey  = ''; // We need to supply a routing key when sending, but its value is ignored for fanout exchanges.
                const msg = JSON.stringify({ msgId: process.argv[2] });
                channel.publish(exchangeName, routeKey, Buffer.from(msg));

                console.log(`Msg:${msg} Sent Success!`);

                setTimeout(() => {
                    process.exit(0);
                }, 500);
            }
        });
    }
});