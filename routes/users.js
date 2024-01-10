const mongoose = require('mongoose')
const plm = require('passport-local-mongoose')

require('dotenv').config(); // .env file ko load karna important hai

const uri = process.env.MONGODB_URI;

mongoose.connect(uri, {  useNewUrlParser: true,useUnifiedTopology: true,})
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    // Server start karein ya aur kuch karein
  })
  .catch(error => {
    console.error('Error connecting to MongoDB Atlas:', error);
  });

const userSchema = mongoose.Schema({
  username: String,
  password: String,
  name: String,
  email: String,
  note: [{
    title: String,
    content: String,
  }]
})
userSchema.plugin(plm)

module.exports = mongoose.model('user', userSchema)