import React, { useState, useEffect } from 'react';
import './index.css';

const api = {
  key: process.env.REACT_APP_WEATHER_API_KEY, // Fetching API key from environment variables
  base: "https://api.openweathermap.org/data/2.5/"
};

function App() {
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.querySelector('.search-bar')?.focus();
  }, []);

  const search = async () => {
    if (!query.trim()) {
      setError('Please enter a city name.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${api.base}weather?q=${query}&units=metric&APPID=${api.key}`);
      const result = await response.json();

      if (response.ok) {
        setWeather(result);
      } else {
        setError(result.message || 'Something went wrong!');
      }
    } catch (err) {
      setError('Failed to fetch weather data.');
    } finally {
      setLoading(false);
      setQuery('');
    }
  };

  const dateBuilder = (d) => {
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    let day = days[d.getDay()];
    let date = d.getDate();
    let month = months[d.getMonth()];
    let year = d.getFullYear();

    return `${day}, ${date} ${month} ${year}`;
  };

  return (
    <div className="app">
      <main>
        <div className="search-box">
          <input
            type="text"
            className="search-bar"
            placeholder="Enter city name..."
            onChange={e => setQuery(e.target.value)}
            value={query}
          />
          <button className="search-button" onClick={search}>Search</button>
        </div>
        {loading && <div className="loading">Fetching weather data...</div>}
        {error && <div className="error">{error}</div>}
        {(typeof weather.main !== "undefined" && !loading && !error) && (
          <div>
            <div className="location-box">
              <div className="location">{weather.name}, {weather.sys.country}</div>
              <div className="date">{dateBuilder(new Date())}</div>
            </div>
            <div className="weather-box">
              <div className="temp">{Math.round(weather.main.temp)}°C</div>
              <div className="weather">{weather.weather[0].main}</div>
            </div>
          </div>
        )}
        <div className="a-link">
          Made by
          <a href="https://www.linkedin.com/in/vinodhkumar102/" target='_blank' rel="noreferrer"> Vinodh Kumar</a>
        </div>
      </main>
    </div>
  );
}

export default App;
