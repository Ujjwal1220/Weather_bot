const TelegramBot = require("node-telegram-bot-api");
const dotenv = require("dotenv");
const User = require("./models/user");
const { getWeather } = require("./services/weather");

dotenv.config();
const botToken = "7744663987:AAGfpk8DNcz8nnTNmfB8nI6kXsVI-9xxRK4"; // Make sure to store your token in .env
const bot = new TelegramBot(botToken, { polling: true });

const adminChatIds = ["123456789"]; // Replace with actual admin IDs

// Handle /start command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    let user = await User.findOne({ chatId });

    if (!user) {
      user = new User({ chatId, subscribed: true }); // Automatically subscribe new users
      await user.save();
      bot.sendMessage(
        chatId,
        `Welcome to the Weather Bot! 🌦️
Use the following commands:
- /subscribe - Subscribe to weather updates
- /weather <city> - Get current weather
- /unsubscribe - Stop receiving updates
- /block - Block the user
- /delete - Delete the user
/help - List available commands`
      );
    } else if (!user.subscribed) {
      bot.sendMessage(
        chatId,
        `You need to subscribe first using /subscribe.
Use the following commands:
- /subscribe - Subscribe to weather updates
- /weather <city> - Get current weather
- /unsubscribe - Stop receiving updates
- /block - Block the user
- /delete - Delete the user
/help - List available commands`
      );
    } else {
      bot.sendMessage(
        chatId,
        `Welcome back to the Weather Bot!
Use the following commands:
- /subscribe - Subscribe to weather updates
- /weather <city> - Get current weather
- /unsubscribe - Stop receiving updates
- /block - Block the user
- /delete - Delete the user
/help - List available commands`
      );
    }
  } catch (error) {
    console.error("Error handling /start:", error);
    bot.sendMessage(chatId, "An error occurred. Please try again later.");
  }
});

// Handle /subscribe command
bot.onText(/\/subscribe/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    let user = await User.findOne({ chatId });

    if (!user) {
      user = new User({ chatId, subscribed: true });
      await user.save();
    } else if (!user.subscribed) {
      user.subscribed = true;
      await user.save();
    }

    bot.sendMessage(
      chatId,
      `You have subscribed to weather updates!
Use the following commands:
- /subscribe - Subscribe to weather updates
- /weather <city> - Get current weather
- /unsubscribe - Stop receiving updates
- /block - Block the user
- /delete - Delete the user
/help - List available commands`
    );
  } catch (error) {
    console.error("Error handling /subscribe:", error);
    bot.sendMessage(chatId, "An error occurred. Please try again later.");
  }
});

// Handle /unsubscribe command
bot.onText(/\/unsubscribe/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const user = await User.findOne({ chatId });

    if (user && user.subscribed) {
      user.subscribed = false;
      await user.save();
      bot.sendMessage(
        chatId,
        `You have unsubscribed from weather updates.
Use the following commands:
- /subscribe - Subscribe to weather updates
- /weather <city> - Get current weather
- /unsubscribe - Stop receiving updates
- /block - Block the user
- /delete - Delete the user
/help - List available commands`
      );
    } else {
      bot.sendMessage(
        chatId,
        `You are not subscribed
        Use the following commands:
        - /subscribe - Subscribe to weather updates
        - /weather <city> - Get current weather
        - /unsubscribe - Stop receiving updates
        - /block - Block the user
        - /delete - Delete the user
        - /help - List available commands`
      );
    }
  } catch (error) {
    console.error("Error handling /unsubscribe:", error);
    bot.sendMessage(chatId, "An error occurred. Please try again later.");
  }
});

// Handle /weather command
bot.onText(/\/weather (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const city = match[1];

  try {
    const user = await User.findOne({ chatId });

    if (user && user.blocked) {
      bot.sendMessage(
        chatId,
        `You are blocked from using this bot.
Use the following commands:
- /subscribe - Subscribe to weather updates
- /weather <city> - Get current weather
- /unsubscribe - Stop receiving updates
- /block - Block the user
- /delete - Delete the user
/help - List available commands`
      );
      return;
    }

    if (!user || !user.subscribed) {
      bot.sendMessage(
        chatId,
        `You need to subscribe first using /subscribe.
Use the following commands:
- /subscribe - Subscribe to weather updates
- /weather <city> - Get current weather
- /unsubscribe - Stop receiving updates
- /block - Block the user
- /delete - Delete the user
/help - List available commands`
      );
      return;
    }

    const weatherInfo = await getWeather(city);
    bot.sendMessage(chatId, weatherInfo);
  } catch (error) {
    console.error("Error handling /weather:", error);
    bot.sendMessage(chatId, "Unable to fetch weather data. Try again later.");
  }
});

// Admin-only: Block a user
bot.onText(/\/block (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const targetChatId = match[1];

  if (!adminChatIds.includes(chatId.toString())) {
    bot.sendMessage(
      chatId,
      `You do not have permission to perform this action.
Use the following commands:
- /subscribe - Subscribe to weather updates
- /weather <city> - Get current weather
- /unsubscribe - Stop receiving updates
- /block - Block the user
- /delete - Delete the user
/help - List available commands`
    );
    return;
  }

  try {
    const user = await User.findOne({ chatId: targetChatId });

    if (!user) {
      bot.sendMessage(
        chatId,
        `User not found.
        Use the following commands:
- /subscribe - Subscribe to weather updates
- /weather <city> - Get current weather
- /unsubscribe - Stop receiving updates
- /block - Block the user
- /delete - Delete the user
/help - List available commands`
      );
    } else if (user.blocked) {
      bot.sendMessage(
        chatId,
        `User with ID ${targetChatId} is already blocked.
Use the following commands:
- /subscribe - Subscribe to weather updates
- /weather <city> - Get current weather
- /unsubscribe - Stop receiving updates
- /block - Block the user
- /delete - Delete the user
/help - List available commands`
      );
    } else {
      user.blocked = true;
      await user.save();
      bot.sendMessage(
        chatId,
        `User with ID ${targetChatId} has been blocked.
Use the following commands:
- /subscribe - Subscribe to weather updates
- /weather <city> - Get current weather
- /unsubscribe - Stop receiving updates
- /block - Block the user
- /delete - Delete the user
/help - List available commands`
      );
    }
  } catch (error) {
    console.error("Error handling /block command:", error);
    bot.sendMessage(chatId, "Failed to block the user. Please try again.");
  }
});

// Admin-only: Delete a user
bot.onText(/\/delete (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const targetChatId = match[1];

  if (!adminChatIds.includes(chatId.toString())) {
    bot.sendMessage(
      chatId,
      `You do not have permission to perform this action.
Use the following commands:
- /subscribe - Subscribe to weather updates
- /weather <city> - Get current weather
- /unsubscribe - Stop receiving updates
- /block - Block the user
- /delete - Delete the user
/help - List available commands`
    );
    return;
  }

  try {
    const result = await User.deleteOne({ chatId: targetChatId });

    if (result.deletedCount === 0) {
      bot.sendMessage(chatId, "User not found.");
    } else {
      bot.sendMessage(
        chatId,
        `User with ID ${targetChatId} has been deleted. Please subscribe again using /subscribe.
Use the following commands:
- /subscribe - Subscribe to weather updates
- /weather <city> - Get current weather
- /unsubscribe - Stop receiving updates
- /block - Block the user
- /delete - Delete the user
/help - List available commands`
      );
    }
  } catch (error) {
    console.error("Error handling /delete command:", error);
    bot.sendMessage(chatId, "Failed to delete the user. Please try again.");
  }
});

// /help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    `Welcome to the Weather Bot! 🌦️
Use the following commands:
- /subscribe - Subscribe to weather updates
- /weather <city> - Get current weather
- /unsubscribe - Stop receiving updates
- /block - Block the user
- /delete - Delete the user
/help - List available commands`
  );
});

module.exports = { bot };
