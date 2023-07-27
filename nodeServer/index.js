// Node server which will handle socket io connections
const io = require("socket.io")(8000, {
  cors: {
    origin: "*",
  },
});

// Object to store connected users with their socket IDs
const users = {};

// CryptoJS library for encryption and decryption
const CryptoJS = require("crypto-js");

// Function to encrypt a message
function encryptMessage(message, secretKey) {
  return CryptoJS.AES.encrypt(message, secretKey).toString();
}

// Function to decrypt an encrypted message
function decryptMessage(encryptedMessage, secretKey) {
  const decryptedBytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
  return decryptedBytes.toString(CryptoJS.enc.Utf8);
}

// Socket.io connection event
io.on("connection", (socket) => {
  // When a new user joins, inform other connected users about it
  socket.on("new-user-joined", (userName) => {
    users[socket.id] = userName;
    socket.broadcast.emit("user-joined", userName);
  });

  // When someone sends a message, broadcast it to other connected users
  socket.on("send", (encryptedMessage) => {
    const secretKey =
      "66d77461b5ea7beb22e2b085331d619f11243a0306414fa837421d156c89af93";
    const decryptedMessage = decryptMessage(encryptedMessage, secretKey);

    // Broadcast the decrypted message
    socket.broadcast.emit("receive", {
      message: encryptMessage(decryptedMessage, secretKey), // Encrypt the message before broadcasting
      userName: users[socket.id], // Retrieve the sender's name using their socket ID
    });
  });

  // When someone leaves the chat, inform others about it
  socket.on("disconnect", () => {
    socket.broadcast.emit("left", users[socket.id]);
    delete users[socket.id];
    //Identifying the user by id becoz if users with same username enters in the chat, there must not be any issue & increase scalability
  });
});
