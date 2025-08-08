const socket = io();

// DOM elements
const chatBubble = document.getElementById("chat-bubble");
const chatWindow = document.getElementById("chat-window");
const chatInput = document.getElementById("chat-input");
const chatMessages = document.getElementById("chat-messages");
const closeChatBtn = document.getElementById("close-chat");

// Toggle chat window
chatBubble.addEventListener("click", () => {
    chatWindow.style.display = "block";
});

closeChatBtn.addEventListener("click", () => {
    chatWindow.style.display = "none";
});

// Send message
chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && chatInput.value.trim() !== "") {
        const msg = chatInput.value.trim();
        appendMessage("user-message", msg);
        socket.emit("userMessage", msg);
        chatInput.value = "";
    }
});

// Receive bot reply
socket.on("botReply", (reply) => {
    appendMessage("bot-message", reply);
});

// Add message to chat
function appendMessage(type, msg) {
    const bubble = document.createElement("div");
    bubble.className = `chat-message ${type}`;
    bubble.textContent = msg;
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
