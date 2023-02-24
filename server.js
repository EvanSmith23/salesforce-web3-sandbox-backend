require('dotenv').config();
const path = require('path');
const cors = require('cors')
const express = require('express');
const app = express();

const { errorHandler } = require("./middleware/error.middleware");
const { notFoundHandler } = require("./middleware/not-found.middleware");

app.use(express.json());
app.set("json spaces", 2);
app.use(cors());

app.use('/api/magic-eden', require('./api/magic-eden/magic-eden.routes'));
app.use('/api/solana', require('./api/solana/solana.routes'));
app.use('/api/etherscan', require('./api/etherscan/etherscan.routes'));
app.get('/', (req, res) => res.sendFile(path.resolve(__dirname, 'public', 'index.html')));

app.use(errorHandler);
app.use(notFoundHandler);

exports.server = app;