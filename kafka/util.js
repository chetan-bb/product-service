"use strict";

const assert = require('assert');

function appendTopicNameSpace(topicName, queueNameSpace) {
    if (config.DEBUG) {
       return `${queueNameSpace}${topicName}`
    }
    return topicName;
}

function getConsumerGroup(topicName, queueNameSpace) {
    return `${appendTopicNameSpace(topicName, queueNameSpace)}_group`;
}

function getMessageData(message, topics) {
    try {
        if (!message.value || topics.indexOf(message.topic) === -1) return;
        let values = JSON.parse(message.value);

        let body = null;
        if (values['content-type'] === 'application/x-json-serialize' && values['content-encoding'] === 'binary') {
            body = new Buffer(values.body, 'base64').toString('utf-8');
        } else if (values['content-type'].indexOf("json") >= 0) {
            body = JSON.parse(values.body)
        } else {
            assert(false, 'Content-type not acceptable');
        }
        return body;
    } catch (e) {
        qLogger.exception(e);
    }
}

module.exports = {
    appendTopicNameSpace,
    getMessageData,
    getConsumerGroup
};
