const getContext = function(req, resp, next){
    // TODO: Integrate API CALL for Context
    return setTimeout(function(){
        req.context = {};
        req.context['masterRi'] = 1;
        req.context['cityId'] = 1;
        req.context['visitorId'] = 1;
        req.query['member_id'] = 10;
        next();
    },0)

};

module.exports = {getContext};