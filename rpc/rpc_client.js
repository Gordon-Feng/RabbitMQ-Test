var amqp = require('amqplib/callback_api');

var args = process.argv.slice(2);

if (args.length === 0) {
    console.log("Usage: rpc_client.js num");
    process.exit(1);
}

amqp.connect('amqp://localhost', function(error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }
        channel.assertQueue('', {
            exclusive: true
        }, function(error2, q) {
            if (error2) {
                throw error2;
            }
            var correlationId = generateUuid();
            var num = parseInt(args[0]);

            console.log(' [x] Requesting fib(%d)', num);

            // 在此处接受回调, 本质上就是建立另一个随机队列去监听.
            channel.consume(q.queue, function(msg) {
                if (msg.properties.correlationId === correlationId) {
                    console.log(' [.] Got %s', msg.content.toString());
                    // 若消息发送后, 没有一个running的worker, 消息将暂时挂起, 直到有可用的worker处理消息.
                    setTimeout(function() {
                        connection.close();
                        process.exit(0);
                    }, 500);
                }
            }, {
                noAck: true
            });
            
            channel.sendToQueue('rpc_queue',
                Buffer.from(num.toString()), {
                    correlationId: correlationId,// 当前消息的标识(感觉与socket中的socket-id作用类似)
                    replyTo: q.queue// 此处就是指定接受回调的queue名称, 就是上方随机生成的queue
                }
            );
        });
    });
});

function generateUuid() {
    return Math.random().toString() +
        Math.random().toString() +
        Math.random().toString();
}