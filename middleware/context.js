const getContext = function(req, resp, next){
    // TODO: Integrate API CALL for Context
    // THIS IS STUB DATA. CHANGE VALUES DURING DEVELOPMENT
    return setTimeout(function(){
        req.context = {};
        req.context['masterRi'] = 1;
        req.context['cityId'] = 1;
        req.context['visitorId'] = 359249811;
        req.query['member_id'] = 10;
        req.context['memberId'] = 10;  //For GraphQL, args are all being passed from context
        next();
    },0)

};

module.exports = {getContext};