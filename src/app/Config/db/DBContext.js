const mongoose = require('mongoose');


const Connection = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI_2, {
            useNewUrlParser: true, useUnifiedTopology: true, autoReconnect: true,
            reconnectInterval: 1000,
            reconnectTries: 10,
        });
        console.log('Connection successfully !!!');
    } catch (error) {
        console.log(error)
        console.log('Connection Fail !');
    }
}


module.exports = Connection