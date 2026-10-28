const express = require("express");
const controller = require("../controllers/chatbot");

const router = express.Router();

router.post("/", controller.prompt);

module.exports = router;
