const express = require('express');
const app = express();
const countriesRouter = require('./routes/countries');

app.use(express.json());
app.use('/countries', countriesRouter);

// Generic 404 JSON
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

module.exports = app;