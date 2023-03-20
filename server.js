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

// Documentation
app.use('/api/documentation', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Arbitrum
const ArbitrumController = require('./api/controllers/arbitrum.controller');
app.get('/api/arbitrum/account/:account/tokens', ArbitrumController.GET_ARBITRUM_ACCOUNT_TOKENS);
app.get('/api/arbitrum/account/:account/transactions', ArbitrumController.GET_ARBITRUM_ACCOUNT_TRANSACTIONS);

// Ethereum 
const EthereumController = require('./api/controllers/ethereum.controller');
app.get('/api/ethereum/account/:account/tokens', EthereumController.GET_ETHEREUM_ACCOUNT_TOKENS);
app.get('/api/ethereum/account/:account/transactions', EthereumController.GET_ETHEREUM_ACCOUNT_TRANSACTIONS);
app.get('/api/ethereum/token/pairs/:symbol', EthereumController.GET_ETHEREUM_TOKEN_PAIRS);
app.get('/api/ethereum/token/categories', EthereumController.GET_ETHEREUM_TOKEN_CATEGORIES);

// Users
const UserController = require('./api/controllers/user.controller');
app.get('/api/user', UserController.getUser);
app.post('/api/user', UserController.postUser);
app.put('/api/user', UserController.putUser);

// UI Routes
app.get('/', (req, res) => res.sendFile(path.resolve(__dirname, 'public', 'index.html')));

app.use(errorHandler);
app.use(notFoundHandler);

exports.server = app;