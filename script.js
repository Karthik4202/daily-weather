const weatherData = async (city) => {
  const searchcity= String(city).trim();
  const result = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${searchcity}&count=1`
  );
  const data = await result.json();
  console.log(data);

  let latitude;
  let longitude;
  let country;

  try {
    latitude = data.results[0].latitude;
    longitude = data.results[0].longitude;
    country = data.results[0].country;
  } catch (error) {
    alert("Please Enter Valid City")
    console.log("Invalid City")
    return 
  }
  
  

  const weatherReport1 = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relativehumidity_2m`
  );
  const weatherReport1Json = await weatherReport1.json();

  console.log(weatherReport1Json);

  const weatherReport2 = await fetch('/.netlify/functions/weather', {
    method: 'POST',
    body: JSON.stringify({
      lat: latitude,
      lon: longitude
  })
});
  const weatherReport2Json = await weatherReport2.json();
  console.log(weatherReport2Json);

  const description = weatherReport2Json.weather[0].main;
  console.log(description);

  const updatedTime = weatherReport1Json.current_weather.time + "Z";

  const istTime = new Date(updatedTime).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const feelsLike = Math.round(weatherReport2Json.main.feels_like - 273.15);
  const temperature = Math.round(weatherReport2Json.main.temp - 273.15);
  const mintemp = Math.round(weatherReport2Json.main.temp_min - 273.15);
  const maxtemp = Math.round(weatherReport2Json.main.temp_max - 273.15);
  const windspeed = Math.round(weatherReport2Json.wind.speed * 3.6).toFixed(1);
  const humidity = weatherReport2Json.main.humidity;
  const isDay = weatherReport1Json.current_weather.is_day === 1 ? "Day" : "Night";
  const countrycode = data.results[0].country_code;

  const weathercode = weatherReport1Json.current_weather.weathercode;
  function getDirection(deg) {
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return dirs[Math.round(deg / 45) % 8];
  }

  const direction = getDirection(weatherReport2Json.wind.deg);

  //sunrise //sunset
  const sunrise = weatherReport2Json.sys.sunrise;
  const sunset = weatherReport2Json.sys.sunset;

  const sunriseIST = new Date(sunrise * 1000).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const sunsetIST = new Date(sunset * 1000).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const iconcode = weatherReport2Json.weather[0].icon;

  const weathertext = getWeatherText(weathercode, isDay);

  const currentcity = data.results[0].name

  document.querySelector("body").style.backgroundColor=
  

  document.querySelector("#updated").innerHTML=`Last Updated :- ${istTime}`
  document.querySelector("#description").innerHTML=`Desc :- ${description}`
  document.querySelector("#feelslike").innerHTML=`Feels Like :- ${feelsLike}°C`
  document.querySelector("#windspeed").innerHTML=`${windspeed} km/hr`
  document.querySelector("#winddirection").innerHTML=`Towards ${direction}`
  document.querySelector("#humidity").innerHTML=`Humidity :- ${humidity}%`
  document.querySelector("#mintemp").innerHTML=`Min Temp :- ${mintemp}°C`
  document.querySelector("#maxtemp").innerHTML=`Max Temp :- ${maxtemp}°C`
  document.querySelector("#city").innerHTML=`${currentcity}, ${country}`
  document.querySelector("#condition").innerHTML=`${weathertext}`
  document.querySelector("#temperature").innerHTML=`${temperature}°C`
  document.querySelector("#isday").innerHTML=`${isDay}`
  document.querySelector("#isdaylogo").src=`images/${isDay}.svg`
  document.querySelector("#condition-logo").src=`https://openweathermap.org/img/wn/${iconcode}@2x.png`

};


const weatherMap = {
  0:  { day: "Sunny", night: "Clear night", dayColor: "#8EC5FC", nightColor: "#1F3B73", dayurl:"sunny.jpg", nighturl:"night.jpg" },
  1:  { day: "Mainly clear", night: "Mainly clear night", dayColor: "#8EC5FC", nightColor: "#1F3B73", dayurl:"sunny.jpg", nighturl:"night.jpg"},
  2:  { day: "Partly cloudy", night: "Partly cloudy night", dayColor: "#AFC8FF", nightColor: "#2A3F6E", dayurl:"partlycloudy.jpg", nighturl:"night.jpg" },
  3:  { day: "Overcast", night: "Overcast", dayColor: "#9EA7B3", nightColor: "#2A2E36", dayurl:"overcast.jpg", nighturl:"overcast-night.jpg" },

  45: { day: "Fog", night: "Fog", dayColor: "#BFC6CF", nightColor: "#3A3F47", dayurl:"fog.jpg", nighturl:"night.jpg" },
  48: { day: "Rime fog", night: "Rime fog", dayColor: "#C9D2DD", nightColor: "#3F444D", dayurl:"fog.jpg", nighturl:"night.jpg" },

  51: { day: "Light drizzle", night: "Light drizzle", dayColor: "#9EB7D9", nightColor: "#27364E", dayurl:"light-drizzle.jpg", nighturl:"drizzle-night.jpg" },
  53: { day: "Moderate drizzle", night: "Moderate drizzle", dayColor: "#8FA7CC", nightColor: "#223049", dayurl:"light-drizzle.jpg", nighturl:"drizzle-night.jpg" },
  55: { day: "Dense drizzle", night: "Dense drizzle", dayColor: "#7C93B5", nightColor: "#1C283B", dayurl:"light-drizzle.jpg", nighturl:"drizzle-night.jpg" },

  56: { day: "Light freezing drizzle", night: "Light freezing drizzle", dayColor: "#AFCBDD", nightColor: "#304559", dayurl:"light-drizzle.jpg", nighturl:"drizzle-night.jpg" },
  57: { day: "Heavy freezing drizzle", night: "Heavy freezing drizzle", dayColor: "#99B7CC", nightColor: "#293A4C", dayurl:"light-drizzle.jpg", nighturl:"drizzle-night.jpg" },

  61: { day: "Light rain", night: "Light rain", dayColor: "#6FA3D2", nightColor: "#233A56", dayurl:"day-rain.jpg", nighturl:"night-rain.jpg" },
  63: { day: "Moderate rain", night: "Moderate rain", dayColor: "#5B8FBE", nightColor: "#1E2F47", dayurl:"day-rain.jpg", nighturl:"night-rain.jpg" },
  65: { day: "Heavy rain", night: "Heavy rain", dayColor: "#4A6FA5", nightColor: "#18263A", dayurl:"day-rain.jpg", nighturl:"night-rain.jpg" },

  66: { day: "Freezing rain", night: "Freezing rain", dayColor: "#7EA6C7", nightColor: "#26384F", dayurl:"day-rain.jpg", nighturl:"night-rain.jpg" },
  67: { day: "Freezing rain", night: "Freezing rain", dayColor: "#7EA6C7", nightColor: "#26384F", dayurl:"day-rain.jpg", nighturl:"night-rain.jpg" },

  71: { day: "Light snow", night: "Light snow", dayColor: "#E6F2FF", nightColor: "#2B3E5A", dayurl:"light-snow.jpg", nighturl:"night-light-snow.jpg" },
  73: { day: "Snow", night: "Snow", dayColor: "#D6E9FF", nightColor: "#233447", dayurl:"heavy-snow.jpg", nighturl:"heavy-night-snow.jpg" },
  75: { day: "Heavy snow", night: "Heavy snow", dayColor: "#C2DBF5", nightColor: "#1A2738",dayurl:"heavy-snow.jpg", nighturl:"heavy-night-snow.jpg" },

  77: { day: "Snow grains", night: "Snow grains", dayColor: "#DFEAF7", nightColor: "#2A3A4E",dayurl:"heavy-snow.jpg", nighturl:"heavy-night-snow.jpg" },

  80: { day: "Light rain showers", night: "Light rain showers", dayColor: "#80B3E0", nightColor: "#223A56", dayurl:"light-drizzle.jpg", nighturl:"drizzle-night.jpg" },
  81: { day: "Rain showers", night: "Rain showers", dayColor: "#6FA3D2", nightColor: "#1E314A", dayurl:"light-drizzle.jpg", nighturl:"drizzle-night.jpg" },
  82: { day: "Heavy rain showers", night: "Heavy rain showers", dayColor: "#507EAD", nightColor: "#17273A", dayurl:"day-rain.jpg", nighturl:"night-rain.jpg" },

  85: { day: "Light snow showers", night: "Light snow showers", dayColor: "#E6F4FF", nightColor: "#2C3F5C", dayurl:"heavy-snow.jpg", nighturl:"heavy-night-snow.jpg" },
  86: { day: "Heavy snow showers", night: "Heavy snow showers", dayColor: "#CCE3F8", nightColor: "#1F2F44", dayurl:"heavy-snow.jpg", nighturl:"heavy-night-snow.jpg" },

  95: { day: "Thunderstorm", night: "Thunderstorm", dayColor: "#4F5D75", nightColor: "#121A24",dayurl:"thunderstorm.jpg", nighturl:"thunderstorm-night.jpg" },
  96: { day: "Thunderstorm with hail", night: "Thunderstorm with hail", dayColor: "#435065", nightColor: "#0F1620", dayurl:"thunderstorm.jpg", nighturl:"thunderstorm-night.jpg" },
  99: { day: "Severe thunderstorm", night: "Severe thunderstorm", dayColor: "#2F3A4A", nightColor: "#0B0F15", dayurl:"heavy-thunderstorm-day.jpg", nighturl:"heavy-thunderstorm-night.jpg" },
};


function getWeatherText(code, isDay) {
  const item = weatherMap[code];
  if (!item) return "Unknown weather";

  document.querySelector("body").style.backgroundImage=isDay === "Day"?`url(images/${item.dayurl})` : `url(images/${item.nighturl})`
  document.querySelector("body").style.color=isDay === "Day"? "black" : "white"

  if(isDay === "Day"){
    document.querySelector(".windimg").classList.remove("windcolor")
  }else{
    document.querySelector(".windimg").classList.add("windcolor")
  }

  return isDay === "Day" ? item.day : item.night;
}

document.querySelector("#search").addEventListener('click',()=>{
    const city = document.querySelector('input').value;
    weatherData(city);
})


document.querySelector(".nav-logo").addEventListener('click',()=>{
  location.reload();
})

