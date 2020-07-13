const amqp = require('amqplib');
const uuid = require('node-uuid');
const redis = require('ioredis');
const redisClient = new redis();

const initConsumer = (async () => {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();

        const exchangeName = 'consistent_exchange';
        const exchangeType = 'x-consistent-hash';
        const routingPattern = process.argv[2];
        const queueName = `data-sync-${uuid.v4()}`;
        // const queueName = `data-sync-test`;

        await channel.prefetch(1);

        await channel.assertExchange(exchangeName, exchangeType, { durable: true });
        console.log(`Assert Exchange[${exchangeName}] Success!`);

        await channel.assertQueue(queueName, { exclusive: false });
        console.log(`Assert Queue[${queueName}] Success!`);

        await channel.bindQueue(queueName, exchangeName, routingPattern);
        console.log(`Bind Queue[${queueName}] Success!`);
        console.log(' ');

        await channel.consume(queueName, (msg) => {
            setTimeout(async () => {
                if(msg.content) {
                    const msgObj = JSON.parse(msg.content.toString());
                    if(msgObj.order === '1') {
                        redisClient.set(`x-consistent-hash:${msgObj.msgId}`, 'create');
                    } else if(msgObj.order === '2') {
                        redisClient.set(`x-consistent-hash:${msgObj.msgId}`, 'update');
                    }
                    console.log(`Current consumerTag: ${msg.fields.consumerTag}`);
                    console.log(`Received Messsge From Consumer[${process.argv[2]}]:${msg.content.toString()}`);
                    console.log(' ');
                    console.log(' ');
                    if(msgObj.msgId === 99) {
                        redisClient.get(['x-consistent-hash:*'], function(error, redisResult) {
                            if(error){
                                throw error;
                            }
                            console.log(`redisResult:${redisResult}`);
                        });
                    }
                }
                channel.ack(msg);
            }, 1000);
        }, { noAck: false });
    } catch (error) {
        console.error('Catch Some Error:', error);
    }
});

initConsumer();

// let total = 0;
// for (let i = 0; i < 100; i++) {
//     redisClient.get([`x-consistent-hash:${i}`], function(error, redisResult) {
//         if(error){
//             throw error;
//         }
//         if(redisResult === 'create') {
//             total = total + 1;
//         }
//         console.log(`redisResult:${redisResult}`);
//         console.log('total:', total);
//     });
// }