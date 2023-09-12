const dotenv = require('dotenv');
dotenv.config({path: './config.env'});
const mongoose = require('mongoose');
// console.log(process.env);
const DB = 'mongodb+srv://dushyant:02122002@cluster0.f0fvosx.mongodb.net/?retryWrites=true&w=majority'
mongoose.connect(DB, {
    useNewUrlParser: true, 
    useUnifiedTopology: true 
}).then(() =>{
    // console.log(con.connections);
    console.log('DB connection succesful');
  }).catch((err)=>{
    console.log(err);
  });