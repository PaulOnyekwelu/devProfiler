const mongoose = require('mongoose');
const keys = require('./keys');
const debug = require('debug')('app:dbconnection');

const connectDb = async() => {

    try{
        if(keys.mongoURI){
            await mongoose.connect(keys.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false });
            debug('connected to database successfully...');
        }
    }catch(e) {
        debug('unable to connect to database')
        //exiting the application on failure
        process.exit(1)
    }

}

module.exports = connectDb;