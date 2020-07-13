const amqp = require('amqplib');

const initProducer = (async () => {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();

        const exchangeName = 'consistent_exchange';
        const exchangeType = 'x-consistent-hash';

        await channel.assertExchange(exchangeName, exchangeType, { durable: true });
        console.log(`Assert Exchange[${exchangeName}] Success!`);
        console.log(' ');

        if(process.argv[2] == 'loop') {
            const loopTimes = Number(process.argv[3]);
            for (let i = 0; i < loopTimes; i++) {
                const routingKey = i.toString();
                const msg = {
                    msgId     : i,
                    type      : 'loop',
                    order     : process.argv[4]
                };
                channel.publish(exchangeName, routingKey, Buffer.from(JSON.stringify(msg)));    
                
                console.log(`Loop Msg:${JSON.stringify(msg)} Sent Success!`);
                console.log(' ');
            }
        } else {
            const routingKey = process.argv[2];
            const msg = {
                msgId: process.argv[2],
                type : 'single'
            };
            const loopTimes = Number(process.argv[3]);
            for (let i = 0; i < loopTimes; i++) {
                channel.publish(exchangeName, routingKey, Buffer.from(JSON.stringify(msg)));

                console.log(`Single Msg:${JSON.stringify(msg)} Sent Success By RoutingKey:${JSON.stringify(msg)}`);
            }
        }
    } catch (error) {
        console.error('Catch Some Error:', error);
    }
});

initProducer();