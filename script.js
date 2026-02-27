const API_KEY = "1d246c4c8205d8d4f8f0f874bbc68637";

const state = {
  elements: {},
};

const weatherBg = {
  clear: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
  clouds: "linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)",
  rain: "linear-gradient(135deg, #4e54c8 0%, #8f94fb 100%)",
  drizzle: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
  thunderstorm: "linear-gradient(135deg, #373b44 0%, #4286f4 100%)",
  snow: "linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)",
  mist: "linear-gradient(135deg, #3e5151 0%, #decba4 100%)",
  default: "linear-gradient(135deg, #ece9e6 0%, #ffffff 100%)",
};

document.addEventListener("DOMContentLoaded", init);

function init() {
  state.elements.app = document.getElementById("app");
  renderBaseUI();
}

function renderBaseUI() {
  state.elements.app.innerHTML = `
    <header class="app-header">
      <div class="title">Weather<span class="highlight">Now</span></div>
      <div class="search-wrapper">
        <input type="text" id="city-input" placeholder="Search city..." />
        <button id="city-btn">Go</button>
      </div>
    </header>
    <main class="main-area">
      <div class="loader hidden">Loading...</div>
      <div class="weather-card hidden" id="weather-card"></div>
    </main>
  `;

  state.elements.searchInput = document.getElementById("city-input");
  state.elements.searchBtn = document.getElementById("city-btn");
  state.elements.loader = document.querySelector(".loader");
  state.elements.weatherCard = document.getElementById("weather-card");

  state.elements.searchBtn.addEventListener("click", handleSearch);
  state.elements.searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSearch();
  });
}

async function handleSearch() {
  const city = state.elements.searchInput.value.trim();
  if (!city) return alert("Please enter a city name");
  showLoader();
  try {
    const data = await fetchWeather(city);
    populateWeather(data);
  } catch (err) {
    alert(err.message || "Could not get weather");
  } finally {
    hideLoader();
  }
}

async function fetchWeather(city) {
  const geoResp = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      city,
    )}&count=1`,
  );
  const geo = await geoResp.json();
  if (!geo.results || !geo.results.length)
    throw new Error("Location not found");
  const { latitude, longitude, name, country } = geo.results[0];

  const weatherResp = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`,
  );
  const weather = await weatherResp.json();

  // fetch 5-day daily forecast via onecall API (unused if preferred)
  const onecallResp = await fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=current,minutely,hourly,alerts&appid=${API_KEY}&units=metric`,
  );
  const forecast = await onecallResp.json();

  // also fetch 3-hour interval forecast by city name
  const forecast3hResp = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
      city,
    )}&appid=${API_KEY}&units=metric`,
  );
  const forecast3h = await forecast3hResp.json();
  console.log("forecast3h response", forecast3h);

  return { weather, location: { name, country }, forecast, forecast3h };
}

function populateWeather({ weather, location, forecast, forecast3h }) {
  const w = weather.weather[0];
  const main = w.main.toLowerCase();
  const gradient = weatherBg[main] || weatherBg.default;
  document.body.style.background = gradient;

  const html = `
    <div class="loc">${location.name}, ${location.country}</div>
    <div class="temp">${Math.round(weather.main.temp)}°C</div>
    <div class="cond">
      <img src="https://openweathermap.org/img/wn/${w.icon}@2x.png" alt="${w.description}"/>
      <span>${w.description}</span>
    </div>
    <div class="details">
      <div class="detail-item"><span class="icon">🌡️</span><span>Feels like ${Math.round(weather.main.feels_like)}°C</span></div>
      <div class="detail-item"><span class="icon">💧</span><span>Humidity ${weather.main.humidity}%</span></div>
      <div class="detail-item"><span class="icon">💨</span><span>Wind ${Math.round(weather.wind.speed * 3.6)} km/h ${getDirection(
        weather.wind.deg,
      )}</span></div>
      <div class="detail-item"><span class="icon">⬇️</span><span>Min ${Math.round(weather.main.temp_min)}°C</span></div>
      <div class="detail-item"><span class="icon">⬆️</span><span>Max ${Math.round(weather.main.temp_max)}°C</span></div>
    </div>
    <div class="update">Updated: ${new Date(
      weather.dt * 1000,
    ).toLocaleTimeString()}</div>
  `;
  let forecastHtml = "";
  if (forecast && forecast.daily) {
    forecastHtml = renderForecast(forecast.daily);
  }

  let listHtml = "";
  if (forecast3h && forecast3h.list) {
    listHtml = renderThreeHour(forecast3h.list);
  }

  // inject forecast into card
  state.elements.weatherCard.innerHTML = html + forecastHtml + listHtml;
  state.elements.weatherCard.classList.remove("hidden");
}

function renderForecast(daily) {
  // show next 5 days excluding today
  const items = daily
    .slice(1, 6)
    .map((d) => {
      const dayName = new Date(d.dt * 1000).toLocaleDateString("en-US", {
        weekday: "short",
      });
      const icon = d.weather[0].icon;
      const desc = d.weather[0].description;
      return `<div class="forecast-day">
        <div class="f-day">${dayName}</div>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}" />
        <div class="f-temp">${Math.round(d.temp.max)}° / ${Math.round(d.temp.min)}°</div>
      </div>`;
    })
    .join("");
  return `<div id="forecast" class="forecast">${items}</div>`;
}

function renderThreeHour(list) {
  // take up to 7 entries
  const items = list
    .slice(0, 7)
    .map((it) => {
      const time = new Date(it.dt * 1000).toLocaleTimeString("en-US", {
        hour: "numeric",
        hour12: true,
      });
      const icon = it.weather[0].icon;
      const temp = Math.round(it.main.temp);
      return `<div class="threehour-item">
        <div class="th-time">${time}</div>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="" />
        <div class="th-temp">${temp}°C</div>
      </div>`;
    })
    .join("");
  return `<div id="threehour" class="threehour">${items}</div>`;
}

function getDirection(deg) {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

function showLoader() {
  state.elements.loader.classList.remove("hidden");
  state.elements.weatherCard.classList.add("hidden");
}
function hideLoader() {
  state.elements.loader.classList.add("hidden");
}
