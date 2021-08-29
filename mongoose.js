const mongoose = require('mongoose');
mongoose.connect('mongodb://mongo:27017/testing', {
    useNewUrlParser: true
});

module.exports = mongoose;