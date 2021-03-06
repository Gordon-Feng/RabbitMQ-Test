var amqp = require('amqplib');



amqp.connect('amqp://localhost', function(error, connection) {
  if (error) {
    throw error;
  }
  connection.createChannel(function(error, channel) {
    if (error) {
      throw error;
    }
    var exchange = 'direct_logs';

    channel.assertExchange(exchange, 'direct', {
      durable: false
    });

    channel.assertQueue('', {
      exclusive: true
      }, function(error, q) {
        if (error) {
          throw error;
        }
      console.log(' [*] Waiting for logs. To exit press CTRL+C');

      args.forEach(function(severity) {
        channel.bindQueue(q.queue, exchange, severity);
      });

      channel.consume(q.queue, function(msg) {
        console.log(`[ ${msg.fields.routingKey} ]消费者接受消息: `, msg.content.toString());
      }, {
        noAck: true
      });
    });
  });
});