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
  messageElement.innerText = message;
  messageElement.classList.add("message");
  messageElement.classList.add(position);
  messageContainer.append(messageElement);
  if (position == "left") {
    audio.play();
  }
};

// ask name anad let the server know
const name = prompt("Enter your name to join");
socket.emit("new-user-joined", name);

// if the new user joins, receive his/her name from the server
socket.on("user-joined", (name) => {
  append(`${name} joined the chat`, "right");
});

// if serverr sends a message, receive it
socket.on("receive", (data) => {
  append(`${data.name}: ${data.message}`, "left");
});

// if a user leaves the chat, append the info to the container
socket.on("left", (name) => {
  append(`${name} left`, "right");
});

// if form gets submitted, send server the message
form.addEventListener("submit", (e) => {
  e.preventDefault(); //does not reload page
  const message = messageInput.value;
  append(`You: ${message}`, "right");
  socket.emit("send", message);
  messageInput.value = "";
});
