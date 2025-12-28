export async function handler(event) {
  const API_KEY = process.env.OPENWEATHER_KEY;

  const { lat, lon } = JSON.parse(event.body);

  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`
  );

  const data = await res.json();

  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
}
