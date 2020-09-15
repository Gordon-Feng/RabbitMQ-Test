const BunnyBus = require('bunnybus');
const { bunnyBus } = require('../config/index');

const bunnyBus = new BunnyBus(bunnyBus);

async function initConsumer() {
    await bunnyBus.subscribe(bunnyBus.queue, {
        'log-collector.error.v1': async (message, ack, reject, requeue) => {
            try {
                console.log(message.body.log);
                await ack();
            } catch (error) {
                console.error('Consume message failed:', error);
                await reject();
            }
        }
    });   
}

initConsumer();

// 使用方式
// CMD: node ./bunnybus/consumer.js