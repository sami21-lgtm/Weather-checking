// একদম সেফ লজিক, যাতে কোনোভাবেই আটকে না থাকে
window.onload = async function() {
    const cityDisplay = document.getElementById('city-name');
    const descDisplay = document.getElementById('description');
    const humanDisplay = document.getElementById('human-character');

    // যদি ফাইলে কোনো হিডেন এরর থাকে, তবে সেটা স্ক্রিনে দেখাবে
    window.onerror = function() {
        cityDisplay.innerText = "JS Error!";
        descDisplay.innerText = "Check your code";
        humanDisplay.innerText = "💀";
    };

    async function getWeather(city) {
        try {
            // খোঁজা শুরু হচ্ছে
            cityDisplay.innerText = "Fetching...";
            descDisplay.innerText = "Please wait...";
            humanDisplay.innerText = "🏃‍♂️";

            // ১. লোকেশন বের করা
            const url1 = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`;
            const res1 = await fetch(url1);
            const data1 = await res1.json();

            if (!data1.results || data1.results.length === 0) {
                cityDisplay.innerText = "Not Found";
                descDisplay.innerText = "Check Spelling";
                humanDisplay.innerText = "🤷‍♂️";
                return;
            }

            const { latitude, longitude, timezone, name } = data1.results[0];
            const tz = timezone || 'Asia/Dhaka';

            // ২. ওয়েদার ডেটা আনা
            const url2 = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=${tz}`;
            const res2 = await fetch(url2);
            const data2 = await res2.json();

            const cur = data2.current;
            const day = data2.daily;

            // ৩. স্ক্রিনে ডেটা বসানো
            cityDisplay.innerText = name;
            document.getElementById('temp').innerText = Math.round(cur.temperature_2m) + "°";
            
            const maxT = day.temperature_2m_max ? Math.round(day.temperature_2m_max[0]) : '--';
            const minT = day.temperature_2m_min ? Math.round(day.temperature_2m_min[0]) : '--';
            document.getElementById('temp-range').innerText = `${maxT}°—${minT}°`;
            
            document.getElementById('wind').innerText = "Wind " + Math.round(cur.wind_speed_10m) + " km/h";
            document.getElementById('feels-like').innerText = "Feels like " + Math.round(cur.apparent_temperature) + "°";
            const precip = day.precipitation_probability_max ? day.precipitation_probability_max[0] : 0;
            document.getElementById('precip').innerText = "Precip " + precip + "%";

            // ৪. টাইম আপডেট
            const now = new Date();
            document.getElementById('local-time').innerText = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: tz });
            document.getElementById('current-date').innerText = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: tz }).replace(' ', '—') + ".";

            // ৫. ইমোজি ম্যাজিক
            const code = cur.weather_code;
            const temp = cur.temperature_2m;
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

        } catch (err) {
            // যদি ইন্টারনেট বা API সমস্যা করে
            cityDisplay.innerText = "Network Error";
            descDisplay.innerText = "API Blocked";
            humanDisplay.innerText = "🚫";
        }
    }

    // সার্চ বাটনের কাজ
    document.getElementById('search-icon').onclick = function() {
        const city = prompt("Enter City Name (e.g. Dubai):");
        if (city) getWeather(city);
    };

    // শুরুতে ঢাকার ওয়েদার লোড হবে
    getWeather("Dhaka");
};
