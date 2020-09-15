const amqp = require('amqplib');
const { rabbitmq } = require('../config');

const initProducer = (async () => {
    const connection = await amqp.connect(rabbitmq.connectUrl);
    const channel = await connection.createChannel()
    await channel.assertExchange(rabbitmq.consistent.exchange.name, rabbitmq.consistent.exchange.type, { durable: true });
});

amqp.connect('amqp://localhost', function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    var exchange = 'direct_logs';
    var severity = process.argv[2] || 'info';
    var msg = `[ ${severity} ] ${new Date().getMinutes()}:${new Date().getSeconds()}:${new Date().getMilliseconds()}`;

    channel.assertExchange(exchange, 'direct', {
      durable: false
    });
    channel.publish(exchange, severity, Buffer.from(msg));
    console.log("生产者发送消息:", msg);
  });

  setTimeout(function() { 
    connection.close(); 
    process.exit(0) 
  }, 500);
});