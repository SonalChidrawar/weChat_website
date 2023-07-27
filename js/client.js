// Initialized socket connection to the server
const socket = io("http://localhost:8000");

// Get DOM variables in respective js variables
const form = document.getElementById("send-container");
const messageInput = document.getElementById("messageInp");
const messageContainer = document.querySelector(".container");

// Audio element for message notification sound
var audio = new Audio("ring.mp3");

// Function that appends messages to the chat container
const append = (message, position) => {
  const messageElement = document.createElement("div");
  const timestampElement = document.createElement("span");
  timestampElement.innerText = getCurrentTime();
  timestampElement.classList.add("timestamp");
  messageElement.innerText = message;
  messageElement.classList.add("message");
  messageElement.classList.add(position);
  messageElement.prepend(timestampElement);
  messageContainer.append(messageElement);
  if (position == "left") {
    audio.play();
  }
};

// Function to get the current timestamp
const getCurrentTime = () => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const timestamp = `${hours}:${minutes}`;
  return timestamp;
};

// Ask user for their username and let the server know
let userName = prompt("Enter your userName to join");
while (!userName || userName.trim() === "") {
  userName = prompt("Invalid userName. Please enter a valid userName to join");
}
socket.emit("new-user-joined", userName);

// Listen for new user join event from the server
socket.on("user-joined", (userName) => {
  append(`${userName} joined the chat`, "right");
});

// Listen for received messages from the server
socket.on("receive", (data) => {
  const secretKey =
    "66d77461b5ea7beb22e2b085331d619f11243a0306414fa837421d156c89af93";
  console.log(data.message);
  const decryptedMessage = CryptoJS.AES.decrypt(
    data.message,
    secretKey
  ).toString(CryptoJS.enc.Utf8);
  append(`${data.userName}: ${decryptedMessage}`, "left");
});

// Listen for user leave event from the server & append the info to the container
socket.on("left", (userName) => {
  append(`${userName} left`, "right");
});

// Retrieve chat history from local storage
const chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];

// Display chat history on joining
chatHistory.forEach((message) => {
  append(message, "left");
});

// Function to delete the chat
const deleteChat = () => {
  messageContainer.innerHTML = ""; // Clear the chat container
  localStorage.removeItem("chatHistory"); // Remove chat history from local storage
};

// Listen for the delete chat button click event
const deleteChatBtn = document.getElementById("bin");
deleteChatBtn.addEventListener("click", deleteChat);

// If form gets submitted, send the message to the server
form.addEventListener("submit", (e) => {
  e.preventDefault(); // No page reload
  const message = messageInput.value.trim();
  if (message !== "") {
    const secretKey =
      "66d77461b5ea7beb22e2b085331d619f11243a0306414fa837421d156c89af93";
    const encryptedMessage = CryptoJS.AES.encrypt(
      message,
      secretKey
    ).toString();
    append(`You: ${message}`, "right");
    socket.emit("send", encryptedMessage);

    // Store message in chat history in local storage
    chatHistory.push(message);
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));

    messageInput.value = ""; // Clear the input field after sending the message
  }
});
