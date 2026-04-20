async function fetchWeather(city) {
    try {
        document.getElementById('description').innerText = "Searching...";
        
        // সার্চ করার সময় ক্যারেক্টার খোঁজার ভঙ্গিতে থাকবে
        document.getElementById('human-character').innerText = "🚶‍♂️🔍"; 

        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`);
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            alert("City not found! Please check the spelling.");
            document.getElementById('description').innerText = "Not Found";
            document.getElementById('human-character').innerText = "🤷‍♂️"; // না পেলে কনফিউজড
            return;
        }

        const { latitude, longitude, timezone, name } = geoData.results[0];
        const validTimezone = timezone || 'UTC';

        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=${validTimezone}`);
        const weatherData = await weatherRes.json();

        const current = weatherData.current;
        const daily = weatherData.daily;

        document.getElementById('city-name').innerText = name;
        document.getElementById('temp').innerText = Math.round(current.temperature_2m) + "°";
        document.getElementById('temp-range').innerText = Math.round(daily.temperature_2m_max[0]) + "°—" + Math.round(daily.temperature_2m_min[0]) + "°";
        document.getElementById('wind').innerText = "Wind " + Math.round(current.wind_speed_10m) + " km/h";
        document.getElementById('feels-like').innerText = "Feels like " + Math.round(current.apparent_temperature) + "°";
        document.getElementById('precip').innerText = "Precip " + daily.precipitation_probability_max[0] + "%";

        const now = new Date();
        const timeOptions = { hour: '2-digit', minute: '2-digit', timeZone: validTimezone };
        const dateOptions = { weekday: 'long', day: 'numeric', month: 'long', timeZone: validTimezone };
        document.getElementById('local-time').innerText = now.toLocaleTimeString('en-US', timeOptions);
        document.getElementById('current-date').innerText = now.toLocaleDateString('en-GB', dateOptions).replace(' ', '—') + ".";

        // ওয়েদার কোড ও টেক্সট
        const code = current.weather_code;
        const temp = current.temperature_2m;
        let desc = "Clear Sky";
        let human = "🚶‍♂️😎"; // ডিফল্ট নরমাল আবহাওয়া

        // ক্যারেক্টার ও ডেসক্রিপশন বদলানোর ম্যাজিক লজিক
        if (code >= 51 && code <= 67) {
            desc = "Yes. It's raining.";
            human = "🚶‍♂️☔️"; // বৃষ্টি হলে ছাতা
        } else if (code >= 71 && code <= 77) {
            desc = "Snowing";
            human = "🥶🧥❄️"; // বরফ পড়লে জ্যাকেট
        } else if (code >= 95) {
            desc = "Thunderstorm!";
            human = "🏃‍♂️⛈️"; // বজ্রপাত হলে দৌড়াবে
        } else if (code === 45 || code === 48) {
            desc = "Foggy";
            human = "🚶‍♂️🌫️"; // কুয়াশা
        } else if (code >= 1 && code <= 3) {
            desc = "Partly Cloudy";
            human = "🚶‍♂️☁️"; // মেঘলা
        } else {
            // যদি আকাশ পরিষ্কার থাকে, তখন তাপমাত্রার ওপর নির্ভর করবে
            if (temp >= 32) {
                desc = "Hot & Sunny";
                human = "🥵💧"; // প্রচণ্ড গরমে ঘামবে
            } else if (temp <= 15) {
                desc = "Cold";
                human = "🥶🧥"; // শীতে জ্যাকেট পরবে
            }
        }

        document.getElementById('description').innerText = desc;
        document.getElementById('human-character').innerText = human;

    } catch (error) {
        console.error("Fetch error: ", error);
        document.getElementById('description').innerText = "Connection Error";
        document.getElementById('human-character').innerText = "🤦‍♂️"; // এরর হলে হতাশ
    }
}

document.getElementById('search-icon').addEventListener('click', () => {
    const city = prompt("Enter Country or City Name (e.g. Dubai, London, Moscow):");
    if (city) fetchWeather(city);
});

document.addEventListener('DOMContentLoaded', () => {
    fetchWeather("Dhaka");
});
