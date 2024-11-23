const mongoose = require("mongoose");

const connectdb = async () => {
  await mongoose.connect(
    "mongodb+srv://ujjwaldb09:12345@bot.vckhc.mongodb.net/"
  );
};

module.exports = connectdb;
