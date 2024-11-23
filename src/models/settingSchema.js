const mongoose = require("mongoose");

const SettingSchema = mongoose.Schema({
  apiKey: { type: String, required: true },
});

const Setting = mongoose.model("Setting", SettingSchema);
module.exports = Setting;
