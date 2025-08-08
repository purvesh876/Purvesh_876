const socket = io({ transports: ["websocket"] }); // force WebSocket to prevent polling issues


// DOM elements
const chatBubble = document.getElementById("chat-bubble");
const chatWindow = document.getElementById("chat-window");
const chatInput = document.getElementById("chat-input");
const sendButton = document.getElementById("send-button"); // NEW
const chatMessages = document.getElementById("chat-messages");
const closeChatBtn = document.getElementById("close-chat");

// Toggle chat window
chatBubble.addEventListener("click", () => {
    chatWindow.style.display = "block";
});

closeChatBtn.addEventListener("click", () => {
    chatWindow.style.display = "none";
});

// Send message on Enter key
chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && chatInput.value.trim() !== "") {
        sendMessage();
    }
});

// Send message on Send button click
sendButton.addEventListener("click", () => {
    if (chatInput.value.trim() !== "") {
        sendMessage();
    }
});

function sendMessage() {
    const msg = chatInput.value.trim();
    appendMessage("user-message", msg);
    socket.emit("userMessage", msg);
    chatInput.value = "";
}

// Receive bot reply
socket.on("botReply", (reply) => {
    if (!reply || !reply.type) return;

    if (reply.type === "text") {
        appendMessage("bot-message", reply.data);
    } else if (reply.type === "listings" && Array.isArray(reply.data)) {
        reply.data.forEach(listing => appendListingCard(listing));
    }
});


// Add normal message to chat
function appendMessage(type, msg) {
    const bubble = document.createElement("div");
    bubble.className = `chat-message ${type}`;
    bubble.textContent = msg;
    chatMessages.appendChild(bubble);
    // chatMessages.scrollTop = chatMessages.scrollHeight;
    bubble.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Add listing card to chat
function appendListingCard(listing) {
    const card = document.createElement("div");
    card.className = "chat-listing-card";

    card.innerHTML = `
        <img src="${listing.image}" alt="${listing.title}" class="img-fluid rounded">
        <div class="listing-card-body">
            <h6 class="mt-2 mb-1">${listing.title}</h6>
            <p class="mb-1">📍 ${listing.location}</p>
            <p class="mb-0">💰 ₹${listing.price}</p>
        </div>
    `;

    chatMessages.appendChild(card);
    // chatMessages.scrollTop = chatMessages.scrollHeight;
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

