require('./config/env');

const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes');
const {
  notFoundHandler,
  errorHandler,
} = require('./middleware/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
