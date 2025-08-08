// const express = require("express");
// const router = express.Router();
// const { chatBotHandler } = require("../controllers/chatbot");

// router.post("/", chatBotHandler);

// module.exports = router;

const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbot');

router.post('/', chatbotController.chatbot);

module.exports = router;


