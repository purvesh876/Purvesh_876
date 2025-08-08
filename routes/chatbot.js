

const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbot');

router.post('/', chatbotController.chatBotHandler);

module.exports = router;


