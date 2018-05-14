"use strict";

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compression = require("compression");
const reqResLogger = global.reqLogger;
const routes = require('./routes/urls');
const handler = require('./handler/productHandler');
const app = express();
const context = require('./middleware/context');
app.disable('x-powered-by');
app.set('etag', false); // turn off

// view engine setup
app.use(compression({ threshold: 0 }));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

app.engine('handlebars', require('hbs').__express);
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

app.use("/product/health/", handler.health);

app.use("/",(req,res,next) => reqResLogger.requestLogMiddleware(req,res,next));
app.use("/static", express.static(path.join(__dirname, 'public')));
app.use("/product/", context.getContext);

//graphQL
const graphQLHTTP = require('express-graphql');
const ProductAppSchema = require('./models/graphQLSchema/graphQuery');
app.use('/product/v:apiVersion/gql', graphQLHTTP((req, res) => ({
    schema:ProductAppSchema,
    graphiql: app.get('env') === 'development', //Set to false if you don't want graphiql enabled
    context: {
        header: req.headers,
        bb_context: req.context  //This is coming from GetContext API from member service
    },
})));


app.use('/', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
