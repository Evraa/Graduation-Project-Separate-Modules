const amqp = require('amqplib');
const _ = require('lodash');

const queueName = "task_queue";

/**
 * @var {Promise<MessageBroker>}
 */
let instance;

/**
 * Broker for async messaging
 */
class MessageBroker {
   
    /**
     * Initialize connection to rabbitMQ
     */
    async init() {
        try {
            this.connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
            this.channel = await this.connection.createChannel();
            await this.channel.assertQueue(queueName, {durable: true});
            return this;
            
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * Send message to queue
     * @param {Object} msg Message as Buffer
     */
    send(msg) {
        
        this.channel.sendToQueue(queueName, msg, {
            persistent: true
        });
        console.log(`Sent job: ${msg}`);
    }

}

/**
 * @return {Promise<MessageBroker>}
 */
MessageBroker.getInstance = async function () {
    if (!instance) {
        const broker = new MessageBroker();
        instance = broker.init();
    }
    return instance;
};

module.exports = MessageBroker;