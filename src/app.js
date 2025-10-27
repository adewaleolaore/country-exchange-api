const express = require('express');
const app = express();
const countriesRouter = require('./routes/countries');
const statusRouter = require('./routes/status');

app.use(express.json());
app.use('/countries', countriesRouter);
app.use('/status', statusRouter);

// Generic 404 JSON
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

module.exports = app;