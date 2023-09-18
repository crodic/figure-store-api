const mongoose = require('mongoose');


const Connection = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI_2, {
            useNewUrlParser: true, useUnifiedTopology: true
        });
        console.log('Connection successfully !!!');
    } catch (error) {
        console.log(error)
        console.log('Connection Fail !');
    }
}


module.exports = Connection