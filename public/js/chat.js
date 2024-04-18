const socket = io("http://localhost:3001/", {
  cors: "*",
});

socket.on("message", (msg) => {
  console.log(msg);
});

socket.on("chat message", (msg) => {
  console.log("message: " + msg);
});
