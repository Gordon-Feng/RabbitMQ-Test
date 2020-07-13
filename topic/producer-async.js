const amqp = require('amqplib');

const initProducer = (async () => {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();

        const exchangeName = 'topic_exchange';
        const exchangeType = 'topic';

        await channel.assertExchange(exchangeName, exchangeType, { durable: true });
        console.log(`Assert Exchange[${exchangeName}] Success!`);

        if(process.argv[2] == 'loop') {
            const loopTimes = Number(process.argv[3]);
            for (let i = 0; i < loopTimes; i++) {
                const routingKey = `${i}.data-sync`;
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
            console.log(`Single Msg:${JSON.stringify(msg)} Sent Success!`);
            console.log(' ');
        }
    } catch (error) {
        console.error('Catch Some Error:', error);
    }
})

initProducer();