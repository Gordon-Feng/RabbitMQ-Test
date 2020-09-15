const amqp = require('amqplib');
const { rabbitmq } = require('../config');

const initProducer = (async () => {
    try {
        const connection = await amqp.connect(rabbitmq.connectUrl);
        const channel = await connection.createChannel()
        await channel.assertExchange(rabbitmq.consistent.exchange.name, rabbitmq.consistent.exchange.type, { durable: true });

        if(process.argv[2] == 'loop') {
            const loopTimes = Number(process.argv[4]);
            for (let i = 0; i < loopTimes; i++) {
                const message = {
                    id     : i.toString(),
                    action : process.argv[3]
                };
                channel.publish(rabbitmq.consistent.exchange.name, message.id, Buffer.from(JSON.stringify(message)));    
                console.log(`(loop sent) message:[ ${JSON.stringify(message)} ] sent successfully !`);
            }
        } else {
            const message = {
                id    : process.argv[2],
                action: process.argv[3]
            };
            const loopTimes = Number(process.argv[4]);
            for (let i = 0; i < loopTimes; i++) {
                channel.publish(rabbitmq.consistent.exchange.name, message.id, Buffer.from(JSON.stringify(message)));
                console.log(`(single sent) message [ ${JSON.stringify(message)} sent successfully !`);
            }
        }
    } catch (error) {
        console.error('Init producer failed:', error);
    }
});

initProducer();

// 使用方式

// 1. 循环发送 id: 0 -> n 的消息
// CMD: node ./consistent_hash/producer.js loop action(create|update) 1000

// 2. 循环发送 n 次指定 id 的消息
// CMD: node ./consistent_hash/producer.js id action(create|update) 100