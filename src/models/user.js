const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  chatId: { type: String, required: true, unique: true },
  subscribed: { type: Boolean, default: false },
  blocked: { type: Boolean, default: false },
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
