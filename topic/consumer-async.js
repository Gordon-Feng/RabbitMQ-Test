const amqp = require('amqplib');

const initConsumer = (async () => {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();

        const exchangeName = 'topic_exchange';
        const exchangeType = 'topic';
        // const routingPattern = `${process.argv[2]}.data-sync`;
        const routingPattern = `*.data-sync`;
        const queueName = `data-sync`;

        await channel.prefetch(1);

        await channel.assertExchange(exchangeName, exchangeType, { durable: true });
        console.log(`Assert Exchange[${exchangeName}] Success!`);

        await channel.assertQueue(queueName, { exclusive: false, autoDelete: true });
        console.log(`Assert Queue[${queueName}] Success!`);

        await channel.bindQueue(queueName, exchangeName, routingPattern);
        console.log(`Bind Queue[${queueName}] Success!`);
        console.log(' ');
        console.log(' ');

        await channel.consume(queueName, (msg) => {
            setTimeout(async () => {
                if(msg.content) {
                    // console.log(`Current consumerTag: ${msg.fields.consumerTag}`);
                    console.log(`Received Messsge From Consumer[${process.argv[2]}]:${msg.content.toString()}`);
                    console.log(' ');
                    console.log(' ');
                }
                channel.ack(msg);
            }, 1000);
        }, { noAck: false });
    } catch (error) {
        console.error('Catch Some Error:', error);
    }
});

initConsumer();