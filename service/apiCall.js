'use strict';

const request = require('request');
const urlJoiner = require('url-join');
const util = require('../utils/util');


function downloadPromoData(productDescriptionId, masterRi, cityId, memberId, visitorId) {
    return new Promise((resolve, _) => {
        process.env.HOST = 'https://qas6.bigbasket.com/'; // todo remove this
        
        let query = util.isNumber(memberId) ? `?member_id=${memberId}` : '';
        let url = urlJoiner(process.env.HOST, '/api/promo/',
            `/${productDescriptionId}/${visitorId}/${masterRi}/${cityId}/`, query);
        request.get(url, function (err, response, body) {
                if (!err && response.statusCode === 200) {
                    try {
                        resolve(JSON.parse(body));
                    } catch (ex) {
                        resolve({});
                    }
                } else {
                    resolve({});
                }
            }
        );
    });
}

function downloadAllAvailabilityInfo(productDescriptionId, masterRi, visitorId, memberId){
    return new Promise((resolve, reject)=>{
        process.env.HOST = 'https://qas6.bigbasket.com/'; // todo remove this        
        let query = util.isNumber(memberId) ? `?member_id=${memberId}` : '';
        let url = urlJoiner(process.env.HOST, '/api/availability/',
            `/${productDescriptionId}/${visitorId}/${masterRi}/`, query);
        request.get(url, function (err, response, body) {
            if (!err && response.statusCode === 200) {
                try {
                    resolve(JSON.parse(body));
                } catch (ex) {
                    resolve({
                        'contextual_children':[],
                        'availability_details':{}
                    });
                }
            } else {
                resolve({
                    'contextual_children':[],
                    'availability_details':{}
                });
            }
        });
    }); 
};

module.exports = {downloadPromoData, downloadAllAvailabilityInfo};
