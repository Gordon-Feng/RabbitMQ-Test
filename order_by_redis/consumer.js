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
                    console.log(`Received Messsge From Consumer[${process.argv[2]}]:${msg.content.toString()}`);
                    console.log(' ');

                    const msgObj = JSON.parse(msg.content.toString());
                    // 在 Redis 中检查该 msgId 是否存在 
                    const targetQueue = await redisClient.get(`x-consistent-hash:${msgObj.msgId}`);
                    if( !targetQueue || targetQueue === queueName )

                    if(msgObj.order === '1') {
                        redisClient.set(`x-consistent-hash:${msgObj.msgId}`, 'create');
                    } else if(msgObj.order === '2') {
                        redisClient.set(`x-consistent-hash:${msgObj.msgId}`, 'update');
                    }
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