const BunnyBus = require('bunnybus');
const { bunnyBus } = require('../config/index');

const bunnyBus = new BunnyBus(bunnyBus);

async function initProducer() {
    await bunnyBus.publish(
        {
            event: 'log-collector.error.v1',
            body : {
                timestamp: new Date(),
                log      : `Received a error log at ${new Date()}`
            }
        }
    );
    console.log(`Sent message success`);
    process.exit(0);
}

initProducer();

// 使用方式
// CMD: node ./bunnybus/producer.js