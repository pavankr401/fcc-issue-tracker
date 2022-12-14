require('dotenv').config();
const {MongoClient} = require('mongodb');

async function main(callback){
  const URI = process.env.MONGO_URI;
  const client = new MongoClient(URI, {useNewUrlParser: true, useUnifiedTopology: true});

  try{
    await client.connect();
    console.log('connected to db');
    // make the appropriate DB calls
    await callback(client);
  }
  catch(e){
    console.error(e);
    throw new Error('Unable to Connect to Database');
  }
}

module.exports = main;