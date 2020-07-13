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
        channel.assertExchange(exchangeName, exchangeType, {
            durable: true
        });

        if(process.argv[2] == 'loop') {
            const loopTimes = Number(process.argv[3]);
            for (let i = 0; i < loopTimes; i++) {
                const routingKey = `${process.argv[3]}.data-sync`;
                const msg = {
                    msgId: i
                };
                channel.publish(exchangeName, routingKey, Buffer.from(JSON.stringify(msg)));    
                
                console.log(`Loop Msg:${JSON.stringify(msg)} Sent Success!`);
                console.log(' ');
            }
        } else {
            const routingKey = `${process.argv[2]}.data-sync`;
            const msg = {
                msgId: process.argv[2]
            };
            channel.publish(exchangeName, routingKey, Buffer.from(JSON.stringify(msg)));
            console.log(`Msg:${JSON.stringify(msg)} Sent Success!`);
            console.log(' ');
        }
    });
});