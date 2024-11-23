const express = require("express");
const dotenv = require("dotenv");
const connectdb = require("./config/database");
const { bot } = require("./bot"); // Import bot
dotenv.config();

const app = express();
const PORT = process.env.PORT || 7777;

// Connect to MongoDB
connectdb().then(() => {
  console.log("Database Connected Successfully");

  // Start the server
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  bot;
});
