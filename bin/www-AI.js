const app = require('../app');
const debug = require('debug')('server:server');
const http = require('http');
const CONFIG = require('../config/config');

// local 은 주석 처리
console.log('🔴ENV: ' + CONFIG.app);
console.log('🔴INSTANCE_ID : ' + process.env.INSTANCE_ID );
require('../cron/runQueue');

const port = normalizePort(CONFIG.port);
app.set('port', port);
const server = http.createServer(app);

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }

  return false;
}

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  debug('Listening on ' + bind);
  console.log('🔴Server listenning on port: ' + addr.port);
}