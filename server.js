const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const linkRoutes = require('./routes/linkRoutes');
const { logger } = require('./utils/index');
require('dotenv').config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/', linkRoutes);
const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;

mongoose
  .connect(DATABASE_URL)
  .then(() => {
    logger.info('Connected to MongoDB');
    app.listen(PORT, () => {
      logger.info(`Server is running at port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('Could not connect to MongoDB', err);
  });
