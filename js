document.addEventListener("DOMContentLoaded", () => {
    const searchIcon = document.getElementById('search-icon');
    const cityDisplay = document.getElementById('city-name');
    const descDisplay = document.getElementById('description');
    const humanDisplay = document.getElementById('human-character');

    async function fetchWeather(city) {
        try {
            // লোডিং শুরু
            cityDisplay.innerText = "Loading...";
            descDisplay.innerText = "Connecting API...";
            humanDisplay.innerText = "🚶‍♂️🔍";

            // গিটহাবের ক্যাশ ফাঁকি দেওয়ার ট্রিক (URL এর শেষে র‍্যান্ডম টাইম)
            const noCache = new Date().getTime();
            const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json&_=${noCache}`;
            
            const geoRes = await fetch(geoUrl);
            if (!geoRes.ok) throw new Error("API Blocked by Browser");
            
            const geoData = await geoRes.json();

            if (!geoData.results) {
                cityDisplay.innerText = "Not Found";
                descDisplay.innerText = "Check Spelling";
                humanDisplay.innerText = "🤷‍♂️";
                return;
            }

            const { latitude, longitude, timezone, name } = geoData.results[0];

            // ওয়েদার ফেচ করা
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&_=${noCache}`;
            
            const weatherRes = await fetch(weatherUrl);
            if (!weatherRes.ok) throw new Error("Weather Data Blocked");
            
            const weatherData = await weatherRes.json();
            const current = weatherData.current;
            const daily = weatherData.daily;

            // UI আপডেট
            cityDisplay.innerText = name;
            document.getElementById('temp').innerText = Math.round(current.temperature_2m) + "°";
            
            const maxT = daily.temperature_2m_max ? Math.round(daily.temperature_2m_max[0]) : '--';
            const minT = daily.temperature_2m_min ? Math.round(daily.temperature_2m_min[0]) : '--';
            document.getElementById('temp-range').innerText = `${maxT}°—${minT}°`;
            
            document.getElementById('wind').innerText = "Wind " + Math.round(current.wind_speed_10m) + " km/h";
            document.getElementById('feels-like').innerText = "Feels like " + Math.round(current.apparent_temperature) + "°";
            
            const precip = daily.precipitation_probability_max ? daily.precipitation_probability_max[0] : 0;
            document.getElementById('precip').innerText = "Precip " + precip + "%";

            // সময়
            const validTz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
            const now = new Date();
            document.getElementById('local-time').innerText = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: validTz });
            document.getElementById('current-date').innerText = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: validTz }).replace(' ', '—') + ".";

            // ইমোজি লজিক
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

            descDisplay.innerText = desc;
            humanDisplay.innerText = human;

        } catch (error) {
            // যদি এবারও কাজ না করে, আপনার স্ক্রিনেই এরর মেসেজ দেখাবে!
            cityDisplay.innerText = "Error!";
            descDisplay.innerText = error.message;
            humanDisplay.innerText = "🛠️";
        }
    }

    searchIcon.addEventListener('click', () => {
        const city = prompt("Enter City Name (e.g. Dhaka):");
        if (city) fetchWeather(city);
    });

    // অ্যাপ লোড হলেই ঢাকার ওয়েদার কল করবে
    fetchWeather("Dhaka");
});
