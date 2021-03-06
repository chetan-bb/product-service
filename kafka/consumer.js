"use strict";

require('../setup');
const kafka = require('kafka-node');
const cacheUtil = require('../utils/updateCacheUtil');

const kafkaUtil = require('./util');
const consumerGroupConfig = global.kafkaConfig;
const queueNameSpace = consumerGroupConfig.queueNameSpace;

const topics = consumerGroupConfig.topics.map((topic)=> {
    return kafkaUtil.appendTopicNameSpace(topic, queueNameSpace)
});

Object.assign(consumerGroupConfig.memberOptions,
    {groupId: kafkaUtil.getConsumerGroup(consumerGroupConfig.topics[0])});

const consumer = new kafka.ConsumerGroup(consumerGroupConfig.memberOptions, topics);

consumer.on("message", function (message) {
    qLogger.info(`Message received from kafka ${JSON.stringify(message)}`);
    let data = kafkaUtil.getMessageData(message, topics);
    if (!data) return;

    // update product cache
    cacheUtil.emitUpdateCacheList(data['ids'], data['ris']);

});

consumer.on('connect', function () {
    qLogger.debug("ConsumerGroup is ready. ");
});


consumer.on("error", function (err) {
    qLogger.debug("error", err);
});


