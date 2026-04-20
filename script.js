let clockTimer;

// ১. ওয়েদার ডেটা এবং আইকন আপডেট করার মেইন ফাংশন
async function updateWeather(city) {
    try {
        const cacheBuster = new Date().getTime();
        
        // লোকেশন ডেটা আনা (Open-Meteo Geocoding)
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json&_=${cacheBuster}`);
        const geoData = await geoRes.json();

        if (!geoData.results) {
            alert("City not found, Sami bhai!");
            return;
        }

        const { latitude, longitude, timezone, name } = geoData.results[0];

        // ওয়েদার ফোরকাস্ট ডেটা আনা
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,is_day,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`);
        const weatherData = await weatherRes.json();

        const current = weatherData.current;
        const daily = weatherData.daily;

        // ২. UI আপডেট করা (টেক্সট সেকশন)
        document.getElementById('city-name').innerText = name;
        document.getElementById('temp').innerText = Math.round(current.temperature_2m) + "°";
        document.getElementById('wind').innerText = Math.round(current.wind_speed_10m) + " km/h";
        document.getElementById('feels-like').innerText = Math.round(current.temperature_2m - 2) + "°";
        document.getElementById('precip').innerText = daily.precipitation_probability_max[0] + "%";
        document.getElementById('temp-range').innerText = Math.round(daily.temperature_2m_max[0]) + "°—" + Math.round(daily.temperature_2m_min[0]) + "°";

        // ৩. ডাইনামিক চাঁদ ও সূর্য লজিক (ঘড়ির পাশে)
        const scenery = document.getElementById('scenery');
        const isDay = current.is_day;
        const weatherCode = current.weather_code;

        if (isDay === 1) {
            scenery.innerText = "☀️"; // দিন হলে সূর্য
            scenery.style.filter = "drop-shadow(0 0 15px gold)";
        } else {
            scenery.innerText = "🌙"; // রাত হলে চাঁদ
            scenery.style.filter = "drop-shadow(0 0 15px white)";
        }

        // বিশেষ আবহাওয়ায় ইমোজি চেঞ্জ
        if (weatherCode >= 51 && weatherCode <= 67) {
            scenery.innerText = "🌧️"; // বৃষ্টি হলে
        } else if (weatherCode >= 1 && weatherCode <= 3) {
            scenery.innerText = isDay === 1 ? "⛅" : "☁️"; // মেঘলা আকাশ
        }

        let descriptionText = "Clear Sky";
        if (weatherCode > 0) descriptionText = "Partly Cloudy";
        if (weatherCode >= 51) descriptionText = "Raining";
        document.getElementById('description').innerText = descriptionText;

        // ৪. লাইভ ঘড়ি (Timezone অনুযায়ী)
        if (clockTimer) clearInterval(clockTimer);
        
        function tick() {
            const now = new Date();
            const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: timezone };
            const dateOptions = { weekday: 'long', day: 'numeric', month: 'short', timeZone: timezone };
            
            document.getElementById('local-time').innerText = new Intl.DateTimeFormat('en-US', timeOptions).format(now);
            document.getElementById('current-date').innerText = new Intl.DateTimeFormat('en-GB', dateOptions).format(now);
        }

        tick();
        clockTimer = setInterval(tick, 1000);

    } catch (err) {
        console.error("Error fetching data:", err);
    }
}

// ৫. সার্চ আইকনে ক্লিক করলে শহর পরিবর্তন
document.getElementById('search-icon').addEventListener('click', () => {
    const city = prompt("Enter City Name (e.g. Dubai, New York):");
    if (city) updateWeather(city);
});

// ৬. অ্যাপ লোড হওয়ার সময় ডিফল্ট ঢাকা সেট করা
window.addEventListener('load', () => {
    updateWeather("Dhaka");
});
