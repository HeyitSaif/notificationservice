const mongoose = require('mongoose');

/*
    _id : mongoose primary key
    token : (the firebase cloud messaging -fcm- token)
    phoneNumber : the user's phone number
    userdId : the user's Id in the original Database (foreign key)
    email : the user's email

 */
const NotificationSchema   = new mongoose.Schema({
    sender: {type:mongoose.Schema.Types.ObjectId, ref:'User'}, // Notification creator
    receiver: [{type:mongoose.Schema.Types.ObjectId, ref:'User'}], // Ids of the receivers of the notification
    message: String, // any description of the notification message 
    read_by:[{
     readerId:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
     read_at: {type: Date, default: Date.now}
    }],
    created_at:{type: Date, default: Date.now},
    
});


module.exports = mongoose.model('Notification', NotificationSchema);