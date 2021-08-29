const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('./mongoose');
const notificationsRoutes = require('./api/routes/notifications');
const smsRoutes = require('./api/routes/sms');
const subscribeRoutes = require('./api/routes/subscribe');
const refreshTokenRoutes = require('./api/routes/refreshToken');
const rabbitmq = require('./api/controllers/rabbitmq');
const SMSController = require('./api/controllers/sms');
const NotificationsController = require('./api/controllers/notifications');
let count=0;
rabbitmq.create_connection().then(()=>{
    rabbitmq.channel.consume('notification', async (msg) => {
        console.log('processing messages');
        msg.content = JSON.parse(msg.content.toString())
        if (msg.content.type && msg.content.type == 'sms' ){
            SMSController.send_sms(msg.content)
        }else{
            NotificationsController.send_notification(msg.content.token, msg.content.payload)
        }
        setTimeout(function(){
            rabbitmq.channel.ack(msg);
        },5000);
    }, 
    {
    noAck: false,
    consumerTag: 'notification'
    });
})

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

//Routes which handle the requests
app.use('/notifications', notificationsRoutes);
app.use('/sms', smsRoutes);
app.use('/subscribe', subscribeRoutes);
app.use('/refreshToken', refreshTokenRoutes);

app.use((req, res, next) => {
    const error = new Error("not found");
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
});

module.exports = app;