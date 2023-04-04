require('dotenv').config();
const path = require('path');
const cors = require('cors')
const express = require('express');
const PORT = process.env.PORT || 8080;
const app = express();

const swaggerUi = require('swagger-ui-express'),
swaggerDocument = require('./swagger.json');

const { errorHandler } = require("./middleware/error.middleware");
const { notFoundHandler } = require("./middleware/not-found.middleware");

app.use(express.json());
app.set("json spaces", 2);
app.use(cors());

// Documentation

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
const NotificationController = require('./api/controllers/notification.controller');
app.post('/api/notification', NotificationController.POST_NOTIFICATION_FROM_ALCHEMY);

// Users
const UserController = require('./api/controllers/user.controller');
app.get('/api/user', UserController.getUser);
app.post('/api/user', UserController.postUser);
app.put('/api/user', UserController.putUser);

// UI Routes
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(errorHandler);
app.use(notFoundHandler);

// Remove X-Frame-Options to allow for rendering in an Iframe
app.use((req, res, next) => {
  res.removeHeader('X-Frame-Options');
  next();
});


// Logs every incoming HTTP requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl} over ${req.protocol}`);
  next();
});

app.get('/*', function(req, res) {
  res.sendFile(path.resolve(__dirname, 'build', 'index.html'), function(err) {
    if (err) {
      res.status(500).send(err);
    }
  });
});

// Catch any promise rejections
process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise ' + p + ' reason: ' + reason);
});

// Serve the app
app.listen(PORT, () => {
  console.log('Server running at port:' + PORT);
});