const socket = io("http://localhost:8000");

// Get DOM variables in respective js variables
const form = document.getElementById("send-container");
const messageInput = document.getElementById("messageInp");
const messageContainer = document.querySelector(".container");

// audio that will play on receiving messages
var audio = new Audio("ring.mp3");

// function that appends event info to the container
const append = (message, position) => {
  const messageElement = document.createElement("div");
  const timestampElement = document.createElement("span"); // Create a new element for the timestamp
  timestampElement.innerText = getCurrentTime();
  timestampElement.classList.add("timestamp"); // Add a CSS class to the timestamp element
  messageElement.innerText = message;
  messageElement.classList.add("message");
  messageElement.classList.add(position);
  messageElement.prepend(timestampElement); // Prepend the timestamp element to the message element
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

// ask user Name  anad let the server know
let userName = prompt("Enter your userName to join");
while (!userName || userName.trim() === "") {
  userName = prompt("Invalid userName. Please enter a valid userName to join");
}
socket.emit("new-user-joined", userName);

// if the new user joins, receive their user Name  from the server
socket.on("user-joined", (userName) => {
  append(`${userName} joined the chat`, "right");
});

// if server sends a message, receive it
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

// if a user leaves the chat, append the info to the container
socket.on("left", (userName) => {
  append(`${userName} left`, "right");
});

const chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];

// display chat history on joining
chatHistory.forEach((message) => {
  append(message, "left");
});

// function to delete the chat
const deleteChat = () => {
  messageContainer.innerHTML = ""; // Clear the chat container
  localStorage.removeItem("chatHistory"); // Remove chat history from local storage
};

// listen for the delete chat button click event
const deleteChatBtn = document.getElementById("bin");
deleteChatBtn.addEventListener("click", deleteChat);

// if form gets submitted, send server the message
form.addEventListener("submit", (e) => {
  e.preventDefault(); //does not reload page
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

    messageInput.value = "";
  }
});
