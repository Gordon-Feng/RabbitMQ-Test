const BunnyBus = require('@tenna-llc/bunnybus');
const bunnyBus = new BunnyBus({
    prefetch: 1,
    dispatchType: 'serial'
});

async function receive(params) {
    let handlers = {};
    handlers[`*.${process.argv[2]}.data-sync`] = async (message, ack, reject, requeue) => {
        setTimeout( async () => {
            console.log(message.comment);
            if (Number(message.comment) == 5) {
                await requeue();
                // 将会重新推 message, 默认重复 10 次, 可通过 maxRetryCount 进行配置
                // 当达到重复次数的上限后, 如果没有指定 dead-queue, 将会把创建一个名为 `${当前队列名}_error` 的队列
            } else {
                await ack();
            }
        }, 1000);
    };
    await bunnyBus.subscribe('data-sync', handlers);   
}

receive();