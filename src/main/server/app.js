const express = require('express');
const app = express();
const cors = require('cors');

const server = app.listen(9876);
app.use(cors());

app.get('/manifest.json', (req, res) => {
  res.sendFile(`${__dirname}/manifest.json`);
});

app.get('/callback', (req, res) => {
  if (typeof req.query.authContinuation !== 'undefined') {
    res.redirect(req.query.authContinuation);
  } else {
    process.send({
      authResponse: req.query.authResponse
    });

    res.sendFile(`${__dirname}/success.html`);
  }
});

process.on('SIGTERM', () => {
  server.close();
});