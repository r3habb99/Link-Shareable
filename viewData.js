const mongoose = require('mongoose');
const DeviceData = require('./models/DeviceData');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB');
  const data = await DeviceData.find();
  console.log('Device Data:', data);
  mongoose.disconnect();
}).catch(err => {
  console.error('Could not connect to MongoDB', err);
});
