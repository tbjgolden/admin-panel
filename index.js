const express = require('express');
const bodyParser = require('body-parser');
const { join } = require('path');
const { exec } = require('child_process');
const crypto = require('crypto');

const config = require('./config.json');
const statusCodes = require('./codes.js');

const app = express();
app.use(bodyParser.json());
app.use(express.static(join(__dirname, 'static')));

app.post('/login', (req, res) => {
  if (req.body.username === config.username) {
    const hash = crypto.createHmac('sha256', '').update(req.body.password || '').digest('hex');
    if (hash === config.password) return res.send({ token: config.token });
  }
  res.send(403);
});

app.use((req, res, next) => {
  if (req.method !== 'POST') return next();
  if (req.headers['x-token'] === config.token) return next();
  res.send(403);
});

app.post('/exec', (req, res) => {
  if (req.body.command) {
    exec(req.body.command, (err, stdout, stderr) => res.send({ err, stdout, stderr }));
  } else {
    res.sendStatus(400);
  }
});

app.listen(config.port, () => console.log(`Listening on port ${config.port}`));
