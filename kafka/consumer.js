"use strict";

const kafka = require('kafka-node');
const cacheUtil = require('../utils/updateCacheUtil');


const path = require("path");
require('../setup');
const kafkaUtil = require('./util');
const consumerGroupConfig = require(path.join(__dirname, "config.json"));
const queueNameSpace = consumerGroupConfig.queueNameSpace;

const topics = consumerGroupConfig.topics.map((topic)=> {
    return kafkaUtil.appendTopicNameSpace(topic, queueNameSpace)
});

Object.assign(consumerGroupConfig.memberOptions,
    {groupId: kafkaUtil.getConsumerGroup(consumerGroupConfig.topics[0])});

const consumer = new kafka.ConsumerGroup(consumerGroupConfig.memberOptions, topics);

consumer.on("message", function (message) {
    console.log(`Message received from kafka ${JSON.stringify(message)}`);
    let data = kafkaUtil.getMessageData(message, topics);
    if (!data) return;

    // update product cache
    cacheUtil.emitUpdateCacheList(data['ids'], data['ris']);

});

consumer.on('connect', function () {
    console.log("ConsumerGroup is ready. ");
});


consumer.on("error", function (err) {
    console.log("error", err);
});


