exports.bunnyBus = {
    username      : 'guest',
    password      : 'guest',
    hostname      : 'localhost',
    vhost         : '/',
    globalExchange: 'log-collector-bunnybus',
    dispatchType  : 'serial',
    queue         : 'log-collector-bunnybus',
    prefetch      : 1,
    maxRetryCount : 2
}

exports.rabbitmq = {
    connectUrl: 'amqp://localhost',
    consistent: {
        exchange: {
            name: 'log-collector-consistent',
            type: 'x-consistent-hash'
        },
        queue   : 'log-collector-consistent'
    },
    topic       : {
        exchange: {
            name: 'log-collector-topic',
            type: 'topic'
        },
        queue   : 'log-collector-topic'
    },
    direct      : {
        exchange: {
            name: 'log-collector-direct',
            type: 'direct'
        },
        queue   : 'log-collector-direct'
    }
}

exports.redis = {
    host: 'localhost',
    port: 6379
}