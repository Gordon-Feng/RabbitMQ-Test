const amqp = require('amqplib');
const uuid = require('node-uuid');
const Redis = require('ioredis');
const { rabbitmq, redis } = require('../config');
const redisClient = new Redis(redis);

const initConsumer = (async () => {
    try {
        const connection = await amqp.connect(rabbitmq.connectUrl);
        const channel = await connection.createChannel();
        const queueName = `${rabbitmq.consistent.queue}-${uuid.v4()}`;

        await channel.prefetch(1);
        await channel.assertExchange(rabbitmq.consistent.exchange.name, rabbitmq.consistent.exchange.type, { durable: true });
        await channel.assertQueue(queueName, { exclusive: false });
        await channel.bindQueue(queueName, '');

        await channel.consume(queueName, (msg) => {
            setTimeout(async () => {
                if(msg.content) {
                    const message = JSON.parse(msg.content.toString());
                    await redisClient.set(`x-consistent-hash:${message.id}`, message.action);// create | update
                }
                channel.ack(msg);
            }, 1000);
        }, { noAck: false });

        console.info('Init consumer successfully !');
    } catch (error) {
        console.error('Init consumer failed:', error);
    }
});

initConsumer();

// 使用方式
// CMD: node ./consistent_hash/consumer.js