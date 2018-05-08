//https://nodewebapps.com/2017/11/04/getting-started-with-nodejs-and-kafka/
//https://blog.mimacom.com/apache-kafka-with-node-js/
//https://www.linkedin.com/pulse/introduction-kafka-using-nodejs-pankaj-panigrahi/
//https://medium.freecodecamp.org/understanding-node-js-event-driven-architecture-223292fcbc2d
const kafka = require('kafka-node');
module.exports = function (app) {
    let kafkaConfig = {
        brokerUrl: "localhost:9092",
        options: {
            groupId: "bb-consumer-group",
            fetchMaxWaitMs: 1000,
            autoCommit: true,
            autoCommitIntervalMs: 5000,
            encoding: 'utf8'
        },
        topics: [
            {
                topic: "updateProductCacheQueue_bbasync"
            }
        ]
    };

    const client = new kafka.Client(kafkaConfig.brokerUrl);


    const consumer = new kafka.HighLevelConsumer(client, kafkaConfig.topics, kafkaConfig.options);

    consumer.on("message", function (message) {
        console.log(`Message received from kafka ${JSON.stringify(message)}`);
    });

    consumer.on("error", function (err) {
        console.log("error", err);
    });

    consumer.on('offsetOutOfRange', function (err) {
        console.log('offsetOutOfRange:', err);
    });

};
