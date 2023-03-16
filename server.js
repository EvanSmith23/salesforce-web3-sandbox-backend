require('dotenv').config();
const path = require('path');
const cors = require('cors')
const express = require('express');
const app = express();

const swaggerUi = require('swagger-ui-express'),
swaggerDocument = require('./swagger.json');

const { errorHandler } = require("./middleware/error.middleware");
const { notFoundHandler } = require("./middleware/not-found.middleware");

app.use(express.json());
app.set("json spaces", 2);
app.use(cors());

app.use('/api/wallet', require('./api/wallet/wallet.routes'));
app.use('/api/token', require('./api/token/token.routes'));
app.use('/api/documentation', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/', (req, res) => res.sendFile(path.resolve(__dirname, 'public', 'index.html')));

app.use(errorHandler);
app.use(notFoundHandler);

exports.server = app;