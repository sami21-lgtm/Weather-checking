let clockTimer;

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        const video = document.getElementById('camera-stream');
        if (video) {
            video.srcObject = stream;
            video.onloadedmetadata = () => {
                video.style.display = "block";
                document.getElementById('human-character').style.display = "none";
            };
        }
    } catch (e) {
        console.log("Camera access denied.");
    }
}

async function updateWeather(city) {
    try {
        const cache = new Date().getTime();
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json&_=${cache}`);
        const geoData = await geoRes.json();

        if (!geoData.results) return;

        const { latitude, longitude, timezone, name } = geoData.results[0];
        const validTz = timezone || 'Asia/Dhaka';

        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`);
        const weatherData = await weatherRes.json();

        const cur = weatherData.current;
        const day = weatherData.daily;

        document.getElementById('city-name').innerText = name;
        document.getElementById('temp').innerText = Math.round(cur.temperature_2m) + "°";
        document.getElementById('wind').innerText = Math.round(cur.wind_speed_10m) + " km/h";
        document.getElementById('feels-like').innerText = Math.round(cur.apparent_temperature) + "°";
        document.getElementById('precip').innerText = day.precipitation_probability_max[0] + "%";
        document.getElementById('temp-range').innerText = Math.round(day.temperature_2m_max[0]) + "°—" + Math.round(day.temperature_2m_min[0]) + "°";

        if (clockTimer) clearInterval(clockTimer);
        function tick() {
            const now = new Date();
            const tOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: validTz };
            const dOptions = { weekday: 'long', day: 'numeric', month: 'short', timeZone: validTz };
            document.getElementById('local-time').innerText = new Intl.DateTimeFormat('en-US', tOptions).format(now);
            document.getElementById('current-date').innerText = new Intl.DateTimeFormat('en-GB', dOptions).format(now);
        }
        tick();
        clockTimer = setInterval(tick, 1000);

        document.getElementById('scenery').innerText = cur.is_day ? "☀️" : "🌙";
        document.getElementById('description').innerText = cur.weather_code === 0 ? "Clear Sky" : "Cloudy";

    } catch (err) { console.error(err); }
}

document.getElementById('search-icon').onclick = () => {
    const city = prompt("Enter City Name:");
    if (city) updateWeather(city);
};

window.onload = () => {
    startCamera();
    updateWeather("Dhaka");
};
