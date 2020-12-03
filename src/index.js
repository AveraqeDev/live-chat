const path = require('path');
const express = require('express');
const http = require('http');

const sockets = require('./sockets');

const app = express();
const server = http.createServer(app);
sockets(server);

const staticPath = path.join(__dirname, '..', 'public');
app.use(express.static(staticPath));

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on port ${PORT}`);
});
