const axios = require("axios");

const getWeather = async (city) => {
  try {
    const apiKey = "bf19c0e4fa629303dc321ff2fc5fd0dd";
    const endpoint = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    const response = await axios.get(endpoint);
    console.log(response);
    const { name, main, weather } = response.data;
    return `🌤️ Weather in ${name}: ${weather[0].description}, Temperature: ${main.temp}°C`;
  } catch (error) {
    console.error("Error fetching weather data:", error);

    if (error.response?.status === 404) {
      return "City not found. Please check the name.";
    }

    return "Unable to fetch weather updates. Try again later.";
  }
};

module.exports = { getWeather };
