const User = require('../models/user');
const Notifications = require('../models/notification');
const admin = require('../../firebase');
const rabbitmq = require('../controllers/rabbitmq')

/*
    send_notification function sends notification for
    the given tokens with the given payload. it receives
    the tokens and payload then return a promise, it tries
    to send notification to the tokens with fcm admin sdk
 */
exports.send_notification = (tokens, payload) => {

    let options = {
        priority: "normal",
        timeToLive: 60 * 60
    };
    return new Promise(function (resolve, reject) {
        resolve()
    })

};


/*
    send_notification_to_all function sends a notification
    to all users. it extracts the message,title and data from
    the request body. initialize the payload, gets the tokens
    of all users, divide the tokens in loads of 1000's (maximum
    number of tokens fcm can handle in one request. then sends
    notification for each load.
 */
exports.send_notification_to_all = (req, res, next) => {

    const title = req.body.title;
    const msg = req.body.message;
    const data = req.body.data;
    if (msg === undefined || msg === "" || title === undefined || title === "" || data === undefined) {
        res.status(400).json({error: "title, message, and data are required"});
    } else {
        let payload = {
            notification: {
                title: title,
                body: msg
            },
            data: data
        };

        User.find().exec().then(users => {

            let UserIds = users.map((user) => {
                rabbitmq.channel.publish('notification', 'notification', Buffer.from(JSON.stringify({
                    payload: payload,
                    token: user.token
                })));
                return user._id;
            });
            const notification = new Notifications({
                sender: UserIds[0], // Notification creator
                receiver: UserIds, // Ids of the receivers of the notification
                message: JSON.stringify(payload), // any description of the notification message 
                read_by:[],
            });
            notification.save().then(result => {
                res.status(201).json(result)
            }).catch(err => {
                    res.status(401).json(err);
                }
            );
          


            // if (tokens.length > 0) {
            //     let returnJson = [];
            //     let statusCode = 200;
            //     let noOfLoads = tokens.length / 1000;
            //     if (tokens.length % 1000 !== 0) {
            //         noOfLoads++;
            //     }
            //     noOfLoads = Math.floor(noOfLoads);

            //     for (let i = 0; i < noOfLoads; i++) {
            //         let start = i * 1000, end = (i + 1) * 1000;
            //         let batchTokens = tokens.slice(start, end);
            //         send_notification(batchTokens, payload).then(jsonObj => {
            //             returnJson.push({loadNumber: i + 1, success: jsonObj});
            //             if (i + 1 === noOfLoads) {
            //                 res.status(statusCode).json(returnJson);
            //             }
            //         }).catch(error => {
            //             returnJson.push({loadNumber: i + 1, error: error});
            //             statusCode = 500;

            //             if (i + 1 === noOfLoads) {
            //                 res.status(statusCode).json(returnJson);
            //             }
            //         });
            //     }
            // } else {
            //     res.status(200).json({message: "no tokens to send to"})
            // }


        }).catch(err => {
            console.log(err);
            res.status(500).json({
                error: err,
            });
        });
    }
};

/*
    send_notification_to_specific function send a notification
    to a specific user or users. it extracts the ids, message,
    title and data from the request body. Initialize the payload,
    get the users tokens then sends the notification to them.
 */
exports.send_notification_to_specific = (req, res, next) => {
    const Ids = req.body.ids;
    const title = req.body.title;
    const msg = req.body.message;
    const data = req.body.data;

    if (Ids === undefined || msg === undefined || title === undefined || data === undefined || msg === "" || title === "") {
        res.status(400).json({error: "ids, title, message, and data are required"});
    } else {
        let payload = {
            notification: {
                title: title,
                body: msg
            },
            data: data
        };

        User.find({'userId': Ids}).select('token -_id').then(users => {
           
            let UserIds = users.map((user) => {
                rabbitmq.channel.publish('notification', 'notification', Buffer.from(JSON.stringify({
                    payload: payload,
                    token: user.token
                })));
                return user._id;
            });
            const notification = new Notifications({
                sender: UserIds[0], // Notification creator
                receiver: UserIds, // Ids of the receivers of the notification
                message: JSON.stringify(payload), // any description of the notification message 
                read_by:[],
            });
            notification.save().then(result => {
                res.status(201).json(result)
            }).catch(err => {
                    res.status(401).json(err);
                }
            );
          
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                error: err,
            });
        });
    }

};


/*
    send_notification_to_group function sends notification
    to a specific group with a common topic. it extracts the
    topic, message, title and data from the request body.
    Initialize the the payload and sends the notification for
    the users subscribed to the given topic.
 */
exports.send_notification_to_group = (req, res, next) => {
    const topic = req.body.topic;
    const title = req.body.title;
    const msg = req.body.message;
    const data = req.body.data;

    if (topic === undefined || topic === "" || msg === undefined || title === undefined || data === undefined || msg === "" || title === "") {
        res.status(400).json({error: "topic, title, message, and data are required"});
    } else {

        let payload = {
            notification: {
                title: title,
                body: msg
            },
            data: data
        };

        admin.messaging().sendToTopic(topic, payload)
            .then(function (response) {
                res.status(200).json(response);
            })
            .catch(function (error) {
                res.status(500).json(error);
            });
    }
};
