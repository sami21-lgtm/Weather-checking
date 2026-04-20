async function fetchWeather(city) {
    try {
        // লোডিং শুরু
        document.getElementById('description').innerText = "Connecting API...";
        document.getElementById('human-character').innerText = "🚶‍♂️🔍"; 

        // ১. Geocoding API (শহরের লোকেশন বের করা)
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();

        if (!geoData.results) {
            document.getElementById('city-name').innerText = "Not Found";
            document.getElementById('description').innerText = "Try another city";
            document.getElementById('human-character').innerText = "🤷‍♂️";
            return;
        }

        const { latitude, longitude, timezone, name } = geoData.results[0];

        // ২. Weather API (timezone=auto ব্যবহার করে গিটহাবের সমস্যা সমাধান)
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();

        const current = weatherData.current;
        const daily = weatherData.daily;

        // ৩. UI-তে ডেটা বসানো
        document.getElementById('city-name').innerText = name;
        document.getElementById('temp').innerText = Math.round(current.temperature_2m) + "°";
        
        const maxTemp = daily.temperature_2m_max ? Math.round(daily.temperature_2m_max[0]) : '--';
        const minTemp = daily.temperature_2m_min ? Math.round(daily.temperature_2m_min[0]) : '--';
        document.getElementById('temp-range').innerText = `${maxTemp}°—${minTemp}°`;
        
        document.getElementById('wind').innerText = "Wind " + Math.round(current.wind_speed_10m) + " km/h";
        document.getElementById('feels-like').innerText = "Feels like " + Math.round(current.apparent_temperature) + "°";
        
        const precip = daily.precipitation_probability_max ? daily.precipitation_probability_max[0] : 0;
        document.getElementById('precip').innerText = "Precip " + precip + "%";

        // ৪. তারিখ ও সময়
        const now = new Date();
        const validTz = timezone || 'Asia/Dhaka'; 
        const timeOptions = { hour: '2-digit', minute: '2-digit', timeZone: validTz };
        const dateOptions = { weekday: 'long', day: 'numeric', month: 'long', timeZone: validTz };
        
        document.getElementById('local-time').innerText = now.toLocaleTimeString('en-US', timeOptions);
        document.getElementById('current-date').innerText = now.toLocaleDateString('en-GB', dateOptions).replace(' ', '—') + ".";

        // ৫. মানুষ এবং ওয়েদার কন্ডিশন
        const code = current.weather_code;
        const temp = current.temperature_2m;
        let desc = "Clear Sky";
        let human = "🚶‍♂️😎";

        if (code >= 51 && code <= 67) { desc = "It's raining."; human = "🚶‍♂️☔️"; } 
        else if (code >= 71 && code <= 77) { desc = "Snowing"; human = "🥶🧥❄️"; } 
        else if (code >= 95) { desc = "Thunderstorm!"; human = "🏃‍♂️⛈️"; } 
        else if (code === 45 || code === 48) { desc = "Foggy"; human = "🚶‍♂️🌫️"; } 
        else if (code >= 1 && code <= 3) { desc = "Partly Cloudy"; human = "🚶‍♂️☁️"; } 
        else {
            if (temp >= 32) { desc = "Hot & Sunny"; human = "🥵💧"; } 
            else if (temp <= 15) { desc = "Cold"; human = "🥶🧥"; }
        }

        document.getElementById('description').innerText = desc;
        document.getElementById('human-character').innerText = human;

    } catch (error) {
        // যদি ফেইল করে, স্ক্রিনে দেখাবে
        console.error(error);
        document.getElementById('city-name').innerText = "API Blocked";
        document.getElementById('description').innerText = "Check connection";
        document.getElementById('human-character').innerText = "🛠️";
    }
}

document.getElementById('search-icon').addEventListener('click', () => {
    const city = prompt("Enter Country or City Name (e.g. Dubai):");
    if (city) fetchWeather(city);
});

// পেজ লোড হলেই রান করবে
fetchWeather("Dhaka");
