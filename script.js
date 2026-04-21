async function updateWeather(city) {
    try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&format=json`);
        const data = await res.json();
        if (!data.results) return;

        const { latitude, longitude, timezone, name } = data.results[0];
        const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,is_day,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`);
        const wData = await wRes.json();

        // ডেটা সেট করা
        document.getElementById('city-name').innerText = name;
        document.getElementById('temp').innerText = Math.round(wData.current.temperature_2m) + "°";
        document.getElementById('wind').innerText = Math.round(wData.current.wind_speed_10m) + " km/h";
        document.getElementById('feels-like').innerText = Math.round(wData.current.temperature_2m - 1) + "°";
        document.getElementById('precip').innerText = wData.daily.precipitation_probability_max[0] + "%";
        
        // ডেসক্রিপশন
        const code = wData.current.weather_code;
        let desc = "Clear Sky";
        if(code > 0 && code < 45) desc = "Partly Cloudy";
        else if(code >= 45) desc = "Cloudy/Rainy";
        document.getElementById('description').innerText = desc;

        // ঘড়ি ও তারিখ
        if(window.timer) clearInterval(window.timer);
        window.timer = setInterval(() => {
            const now = new Date();
            document.getElementById('local-time').innerText = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: timezone });
            document.getElementById('current-date').innerText = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', timeZone: timezone });
        }, 1000);

        // আইকন
        const scenery = document.getElementById('scenery');
        scenery.innerText = wData.current.is_day === 1 ? "☀️" : "🌙";

    } catch (e) { console.error("Error:", e); }
}

document.getElementById('search-btn').onclick = () => {
    const city = document.getElementById('city-input').value;
    if (city) updateWeather(city);
};

document.getElementById('city-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') updateWeather(e.target.value);
});

updateWeather("Dhaka");
