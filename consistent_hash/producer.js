const amqp = require('amqplib/callback_api');

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

        channel.assertExchange(exchangeName, exchangeType, {
            durable: true
        });

        if(process.argv[2] == 'loop') {
            const loopTimes = Number(process.argv[3]);
            for (let i = 0; i < loopTimes; i++) {
                const routingKey = i.toString();
                const msg = {
                    msgId     : i,
                    routingKey: i
                };
                channel.publish(exchangeName, routingKey, Buffer.from(JSON.stringify(msg)));    
                
                console.log(`Loop Msg:${JSON.stringify(msg)} Sent Success!`);
                console.log(' ');
            }
        } else {
            const routingKey = process.argv[2];
            const msg = {
                msgId: process.argv[2]
            };
            const loopTimes = Number(process.argv[3]);
            for (let i = 0; i < loopTimes; i++) {
                channel.publish(exchangeName, routingKey, Buffer.from(JSON.stringify(msg)));

                console.log(`Msg:${JSON.stringify(msg)} Sent Success By RoutingKey:${JSON.stringify(msg)}`);
            }
        }
    });
});