// node server which will handle socket io connections
const io = require("socket.io")(8000, {
  cors: {
    origin: "*",
  },
});
const users = {};
// CryptoJS library for encryption and decryption
const CryptoJS = require("crypto-js");

// Encryption function
function encryptMessage(message, secretKey) {
  return CryptoJS.AES.encrypt(message, secretKey).toString();
}

// Decryption function
function decryptMessage(encryptedMessage, secretKey) {
  const decryptedBytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
  return decryptedBytes.toString(CryptoJS.enc.Utf8);
}

io.on("connection", (socket) => {
  // if any new user joins, let other users connected to the server know
  socket.on("new-user-joined", (userName) => {
    users[socket.id] = userName;
    socket.broadcast.emit("user-joined", userName);
  });

  // if someone sends a message, broadcast it to other people
  socket.on("send", (encryptedMessage) => {
    const secretKey =
      "66d77461b5ea7beb22e2b085331d619f11243a0306414fa837421d156c89af93";
    const decryptedMessage = decryptMessage(encryptedMessage, secretKey);
    socket.broadcast.emit("receive", {
      message: encryptMessage(decryptedMessage, secretKey),
      userName: users[socket.id],
    });
  });

  // if someone leaves the chat, let others know
  socket.on("disconnect", () => {
    socket.broadcast.emit("left", users[socket.id]);
    delete users[socket.id];
    //we are identifying the user by id becoz if users with same userName  enters in the chat, there must not be any issue.......identifying by id is more scalable
  });
});
