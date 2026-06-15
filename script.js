async function updateWeather(city) {
    try {
        // 1. Get coordinates for city
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&format=json`);
        const data = await res.json();
        
        if (!data.results) {
            alert("City not found! Please try another name.");
            return;
        }

        const { latitude, longitude, timezone, name } = data.results[0];
        
        // 2. Get weather data (current + daily + hourly for humidity)
        const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,is_day,weather_code,wind_speed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&timezone=auto`);
        const wData = await wRes.json();

        // 3. Update basic info
        document.getElementById('city-name').innerText = name;
        document.getElementById('temp').innerText = Math.round(wData.current.temperature_2m) + "°";
        document.getElementById('wind').innerText = Math.round(wData.current.wind_speed_10m) + " km/h";
        document.getElementById('feels-like').innerText = Math.round(wData.current.temperature_2m - 1) + "°";
        document.getElementById('precip').innerText = wData.daily.precipitation_probability_max[0] + "%";
        document.getElementById('humidity').innerText = (wData.current.relative_humidity_2m || "—") + "%";
        document.getElementById('temp-range').innerText = Math.round(wData.daily.temperature_2m_max[0]) + "°—" + Math.round(wData.daily.temperature_2m_min[0]) + "°";
        
        // 4. Weather description mapping (more accurate)
        const code = wData.current.weather_code;
        let desc = "Clear Sky";
        if (code == 1 || code == 2) desc = "Mainly Clear";
        else if (code == 3) desc = "Partly Cloudy";
        else if (code >= 45 && code < 70) desc = "Fog / Mist";
        else if (code >= 51 && code <= 55) desc = "Drizzle";
        else if (code >= 61 && code <= 65) desc = "Rain";
        else if (code >= 80 && code <= 82) desc = "Rain Showers";
        else if (code >= 95) desc = "Thunderstorm";
        document.getElementById('description').innerText = desc;

        // 5. Icon (Sun/Moon)
        const scenery = document.getElementById('scenery');
        scenery.innerText = wData.current.is_day === 1 ? "☀️" : "🌙";
        scenery.style.filter = wData.current.is_day === 1 ? "drop-shadow(0 0 15px gold)" : "drop-shadow(0 0 15px white)";

        // 6. Live clock & date
        if (window.timer) clearInterval(window.timer);
        
        window.timer = setInterval(() => {
            const now = new Date();
            let timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: timezone });
            timeString = timeString.replace(/\s*[AP]M\s*/i, '');
            document.getElementById('local-time').innerText = timeString;
            
            const dateStr = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: timezone });
            document.getElementById('current-date').innerText = dateStr;
        }, 1000);

        // 7. 7-Day Forecast
        const daily = wData.daily;
        const forecastDiv = document.getElementById('forecast-list');
        forecastDiv.innerHTML = '';
        
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        
        for (let i = 0; i < 7; i++) {
            const forecastDate = new Date();
            forecastDate.setDate(today.getDate() + i);
            const dayName = days[forecastDate.getDay()];
            const maxTemp = Math.round(daily.temperature_2m_max[i]);
            const minTemp = Math.round(daily.temperature_2m_min[i]);
            const weatherCode = daily.weather_code[i];
            let icon = "☁️";
            if (weatherCode === 0) icon = "☀️";
            else if (weatherCode === 1 || weatherCode === 2) icon = "🌤️";
            else if (weatherCode === 3) icon = "⛅";
            else if (weatherCode >= 45 && weatherCode < 70) icon = "🌫️";
            else if (weatherCode >= 51 && weatherCode <= 55) icon = "🌧️";
            else if (weatherCode >= 61 && weatherCode <= 65) icon = "🌧️";
            else if (weatherCode >= 80) icon = "🌧️";
            else if (weatherCode >= 95) icon = "⛈️";
            
            forecastDiv.innerHTML += `
                <div class="forecast-item">
                    <div class="forecast-day">${dayName}</div>
                    <div>${icon}</div>
                    <div class="forecast-temp">${maxTemp}° / ${minTemp}°</div>
                </div>
            `;
        }

    } catch (e) { 
        console.error("Error fetching weather data:", e); 
        alert("Network error. Please check your connection.");
    }
}

// Search events
document.getElementById('search-btn').onclick = () => {
    const city = document.getElementById('city-input').value.trim();
    if (city) updateWeather(city);
};

document.getElementById('city-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        updateWeather(e.target.value.trim());
    }
});

// Initial load
updateWeather("Dhaka");
