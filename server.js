const app = require("./app.js");
const http = require("http");
const dotenv = require("dotenv");
const configureSocket = require("./utills/socket");
// const service = require("./module/user/service.js");
dotenv.config({
  path: "./.env",
});
const port = process.env.PORT || 3001;

const server = http.createServer(app);
const io = configureSocket(server);



server.listen(port, () => {
  console.log(`💻 Server is listening on port ${port}`);
});
