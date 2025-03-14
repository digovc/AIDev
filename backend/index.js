require('dotenv').config();
const server = require('./src/server');

const main = () => {
  server.start();
};

main();
