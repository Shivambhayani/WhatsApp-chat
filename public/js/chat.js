const socket = io();

socket.on("countUpdated", () => {
  console.log("count updated");
});
