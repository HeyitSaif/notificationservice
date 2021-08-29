const amqplib = require('amqplib');
const amqpUrl = process.env.AMQP_URL || 'amqp://localhost:5673';
exports.create_connection = async () => {
  this.connection = await amqplib.connect(amqpUrl, 'heartbeat=5');
  this.channel = await this.connection.createChannel();
  try {
    console.log('Publishing');
    const exchange = 'notification';
    const queue = 'notification';
    const routingKey = 'notification';
    
    await this.channel.assertExchange(exchange, 'direct', {durable: true});
    await this.channel.assertQueue(queue, {durable: true});
    await this.channel.bindQueue('notification', exchange, routingKey);
    this.channel.prefetch(5)
    console.log('Message published');
  } catch(e) {
    console.error('Error in publishing message', e);
  }
}
exports.channel = this.channel;
exports.connection = this.connection;
