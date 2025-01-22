import React, { useState } from "react";
import {
  Search,
  Cloud,
  Sun,
  CloudRain,
  Wind,
  Droplets,
  ThermometerSun,
  CloudLightning,
  CloudSnow,
  CloudFog,
} from "lucide-react";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
  

  const getBackgroundImage = (weatherCode: string) => {
    if (!weatherCode)
      return "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=2000&q=80";

    const code = weatherCode.toLowerCase();
    if (code.includes("rain"))
      return "https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=2000&q=80";
    if (code.includes("cloud"))
      return "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=2000&q=80";
    if (code.includes("thunder"))
      return "https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?auto=format&fit=crop&w=2000&q=80";
    if (code.includes("snow"))
      return "https://images.unsplash.com/photo-1478265409131-1f65c88f965c?auto=format&fit=crop&w=2000&q=80";
    if (code.includes("mist") || code.includes("fog"))
      return "https://images.unsplash.com/photo-1485236715568-ddc5ee6ca227?auto=format&fit=crop&w=2000&q=80";
    return "https://images.unsplash.com/photo-1601297183305-6df142704ea2?auto=format&fit=crop&w=2000&q=80"; // sunny
  };

  const fetchWeather = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }

    if (!API_KEY) {
      setError(
        "Weather API key is not configured. Please check your environment variables."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city
      )}&appid=${API_KEY}&units=metric`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
        city
      )}&appid=${API_KEY}&units=metric`;

      const [weatherResponse, forecastResponse] = await Promise.all([
        fetch(weatherUrl).catch(() => ({ ok: false, status: 0 })),
        fetch(forecastUrl).catch(() => ({ ok: false, status: 0 })),
      ]);

      if (!weatherResponse.ok || !forecastResponse.ok) {
        if (weatherResponse.status === 0 || forecastResponse.status === 0) {
          throw new Error(
            "Network error: API requests are being blocked. Please disable your ad blocker or add openweathermap.org to the allowed list."
          );
        }

        if (weatherResponse.status === 404 || forecastResponse.status === 404) {
          throw new Error("City not found. Please enter a valid city name.");
        }

        throw new Error("Failed to fetch weather data. Please try again.");
      }

      const [weatherData, forecastData] = await Promise.all([
        weatherResponse.json(),
        forecastResponse.json(),
      ]);

      setWeather(weatherData);
      const dailyForecasts = forecastData.list.reduce((acc: { [x: string]: any; }, curr: { dt: number; }) => {
        const date = new Date(curr.dt * 1000).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = curr;
        }
        return acc;
      }, {});
      setForecast(Object.values(dailyForecasts).slice(1, 8));
    } catch (err) {
      setError(
        err.message || "Failed to fetch weather data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (weatherCode: string, size = 16) => {
    if (!weatherCode)
      return <Sun className={`w-${size} h-${size} text-yellow-400`} />;

    const code = weatherCode.toLowerCase();
    if (code.includes("rain"))
      return <CloudRain className={`w-${size} h-${size} text-blue-400`} />;
    if (code.includes("cloud"))
      return <Cloud className={`w-${size} h-${size} text-gray-400`} />;
    if (code.includes("thunder"))
      return (
        <CloudLightning className={`w-${size} h-${size} text-yellow-400`} />
      );
    if (code.includes("snow"))
      return <CloudSnow className={`w-${size} h-${size} text-blue-200`} />;
    if (code.includes("mist") || code.includes("fog"))
      return <CloudFog className={`w-${size} h-${size} text-gray-400`} />;
    return <Sun className={`w-${size} h-${size} text-yellow-400`} />;
  };

  const getDayName = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      weekday: "short",
    });
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4 md:p-8 transition-all duration-1000"
      style={{
        backgroundImage: `url('${getBackgroundImage(
          weather?.weather[0]?.main
        )}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="backdrop-blur-md bg-black/30 rounded-3xl p-6 md:p-8 shadow-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-8">
            Weather Dashboard
          </h1>

          <form onSubmit={fetchWeather} className="mb-8">
            <div className="relative max-w-md mx-auto">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city name..."
                className="w-full px-6 py-3 rounded-full bg-white/20 border border-white/30 text-black placeholder-black/70 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/20 transition-colors"
                disabled={loading}
              >
                <Search className="w-6 h-6 text-white" />
              </button>
            </div>
          </form>

          {loading && (
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            </div>
          )}

          {error && (
            <div className="text-center text-red-200 bg-red-500/20 rounded-lg p-4 mb-8 animate-fadeIn">
              {error}
            </div>
          )}

          {weather && (
            <div className="animate-fadeIn space-y-8">
              <div className="bg-white/20 rounded-2xl p-6 backdrop-blur-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="text-center md:text-left">
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {weather.name}, {weather.sys.country}
                    </h2>
                    <div className="flex items-center justify-center md:justify-start space-x-4">
                      {getWeatherIcon(weather.weather[0].main, 16)}
                      <span className="text-5xl font-bold text-white">
                        {Math.round(weather.main.temp)}°C
                      </span>
                    </div>
                    <p className="text-xl text-white/90 capitalize mt-2">
                      {weather.weather[0].description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="flex items-center space-x-2">
                        <ThermometerSun className="w-5 h-5 text-yellow-300" />
                        <span className="text-white/90">Feels Like</span>
                      </div>
                      <p className="text-2xl font-bold text-white mt-2">
                        {Math.round(weather.main.feels_like)}°C
                      </p>
                    </div>

                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="flex items-center space-x-2">
                        <Droplets className="w-5 h-5 text-blue-300" />
                        <span className="text-white/90">Humidity</span>
                      </div>
                      <p className="text-2xl font-bold text-white mt-2">
                        {weather.main.humidity}%
                      </p>
                    </div>

                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="flex items-center space-x-2">
                        <Wind className="w-5 h-5 text-gray-300" />
                        <span className="text-white/90">Wind Speed</span>
                      </div>
                      <p className="text-2xl font-bold text-white mt-2">
                        {Math.round(weather.wind.speed)} m/s
                      </p>
                    </div>

                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="flex items-center space-x-2">
                        <Cloud className="w-5 h-5 text-gray-300" />
                        <span className="text-white/90">Cloudiness</span>
                      </div>
                      <p className="text-2xl font-bold text-white mt-2">
                        {weather.clouds.all}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {forecast && (
                <div className="bg-white/20 rounded-2xl p-6 backdrop-blur-sm">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    7-Day Forecast
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
                    {forecast.map((day: { dt: React.Key | null | undefined; weather: { main: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }[]; main: { temp: number; }; }) => (
                      <div
                        key={day.dt}
                        className="bg-white/10 rounded-xl p-4 text-center"
                      >
                        <p className="text-white font-bold mb-2">
                          {getDayName(day.dt)}
                        </p>
                        <div className="flex justify-center mb-2">
                          {getWeatherIcon(day.weather[0].main, 8)}
                        </div>
                        <p className="text-white font-bold">
                          {Math.round(day.main.temp)}°C
                        </p>
                        <p className="text-white/70 text-sm">
                          {day.weather[0].main}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
