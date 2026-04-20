// ঘড়ি চালানোর জন্য গ্লোবাল ভেরিয়েবল
let clockInterval;

async function fetchWeather(city) {
    try {
        // ক্যাশ সমস্যা এড়াতে টাইমস্ট্যাম্প
        const cacheBuster = new Date().getTime();
        
        // ১. শহরের নাম থেকে অক্ষাংশ ও দ্রাঘিমাংশ বের করা
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json&_=${cacheBuster}`);
        const geoData = await geoRes.json();

        if (!geoData.results) {
            alert("City not found! Please check the spelling.");
            return;
        }

        const { latitude, longitude, timezone, name } = geoData.results[0];
        const validTz = timezone || 'Asia/Dhaka';

        // ২. ওই শহরের বর্তমান আবহাওয়া এবং দিন/রাত ডেটা আনা
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=${validTz}`);
        const weatherData = await weatherRes.json();

        const current = weatherData.current;
        const daily = weatherData.daily;

        // --- UI আপডেট (টেক্সট ডেটা) ---
        document.getElementById('city-name').innerText = name;
        document.getElementById('temp').innerText = Math.round(current.temperature_2m) + "°";
        document.getElementById('temp-range').innerText = Math.round(daily.temperature_2m_max[0]) + "°—" + Math.round(daily.temperature_2m_min[0]) + "°";
        document.getElementById('wind').innerText = "Wind " + Math.round(current.wind_speed_10m) + " km/h";
        document.getElementById('feels-like').innerText = "Feels " + Math.round(current.apparent_temperature) + "°";
        document.getElementById('precip').innerText = "Precip " + daily.precipitation_probability_max[0] + "%";

        // --- ৩. লাইভ ঘড়ি সেট করা (Live Clock Logic) ---
        if (clockInterval) clearInterval(clockInterval); // আগের ঘড়ি বন্ধ করা

        function updateTime() {
            const now = new Date();
            // সেকেন্ডসহ টাইম দেখাবে
            const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: validTz };
            const dateOptions = { weekday: 'long', day: 'numeric', month: 'long', timeZone: validTz };
            
            document.getElementById('local-time').innerText = new Intl.DateTimeFormat('en-US', timeOptions).format(now);
            document.getElementById('current-date').innerText = new Intl.DateTimeFormat('en-GB', dateOptions).format(now).replace(' ', '—') + ".";
        }

        updateTime(); // সাথে সাথে দেখানোর জন্য
        clockInterval = setInterval(updateTime, 1000); // প্রতি সেকেন্ডে চলবে

        // --- ৪. দিন/রাত এবং আবহাওয়ার ম্যাজিক লজিক ---
        const isDay = current.is_day; // ১ হলে দিন, ০ হলে রাত
        const code = current.weather_code;
        const screen = document.getElementById('weather-screen');
        const scenery = document.getElementById('scenery');
        const human = document.getElementById('human-character');
        const desc = document.getElementById('description');

        // ক) দিন বা রাত অনুযায়ী ব্যাকগ্রাউন্ডের আলো পরিবর্তন
        if (isDay === 1) {
            screen.classList.add('day-bg');
            screen.classList.remove('night-bg');
            scenery.innerText = "☀️"; // দিনের বেলা সূর্য
            scenery.style.filter = "drop-shadow(0 0 20px yellow)";
        } else {
            screen.classList.add('night-bg');
            screen.classList.remove('day-bg');
            scenery.innerText = "🌙"; // রাতে চাঁদ
            scenery.style.filter = "drop-shadow(0 0 20px white)";
        }

        // খ) আবহাওয়া কোড অনুযায়ী ইফেক্ট
        let weatherStatus = "Clear Sky";
        let humanEmoji = isDay ? "🚶‍♂️😎" : "🚶‍♂️🌙";

        if (code >= 51 && code <= 67) {
            weatherStatus = "It's raining.";
            humanEmoji = "🚶‍♂️☔️"; // বৃষ্টিতে ছাতা
            scenery.innerText = "☁️🌧️"; 
        } else if (code >= 1 && code <= 3) {
            weatherStatus = "Partly Cloudy";
            scenery.innerText = isDay ? "⛅" : "☁️";
        } else if (code >= 95) {
            weatherStatus = "Thunderstorm!";
            humanEmoji = "🏃‍♂️⛈️"; // বজ্রপাতে দৌড়াচ্ছে
            scenery.innerText = "⚡☁️";
        } else if (current.temperature_2m >= 35) {
            weatherStatus = "Extremely Hot";
            humanEmoji = "🥵💧";
        }

        desc.innerText = weatherStatus;
        human.innerText = humanEmoji;

    } catch (error) {
        console.error("Error fetching weather:", error);
    }
}

// সার্চ আইকনে ক্লিক করলে পপআপ আসবে
document.getElementById('search-icon').addEventListener('click', () => {
    const city = prompt("Enter City/Country Name:");
    if (city) fetchWeather(city);
});

// শুরুতে আপনার এলাকার আবহাওয়া দেখাবে
fetchWeather("Dhaka");
