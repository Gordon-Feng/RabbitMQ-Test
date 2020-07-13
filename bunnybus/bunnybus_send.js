const BunnyBus = require('@tenna-llc/bunnybus');
const bunnyBus = new BunnyBus({
    dispatchType: 'serial'
});

async function send(params) {
    await bunnyBus.publish({ event : 'create-event', comment : 'hello world!' });
}

send();