require('dotenv').config();
const server = require('./src/server');

process.on("unhandledRejection", (err) => {
  console.log(err);
  if (err instanceof DOMException && err.name === "AbortError") {
    console.log(`[Abort] ${err.message}`);
    return;
  }

  console.error(`[Unhandled rejection]`);
  console.error(err);
});

const main = () => {
  server.start();
};

main();
