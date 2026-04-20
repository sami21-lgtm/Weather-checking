// ওয়েদার আপডেট করার মূল ফাংশন
async function fetchLiveWeather(city) {
    try {
        // লোডিং বোঝানোর জন্য
        document.getElementById('description').innerText = "Searching...";

        // ১. শহরের নাম থেকে Latitude, Longitude এবং Timezone বের করা
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`);
        const geoData = await geoResponse.json();

        if (!geoData.results) {
            alert("City not found! Please check the spelling.");
            document.getElementById('description').innerText = "Not Found";
            return;
        }

        const location = geoData.results[0];
        const lat = location.latitude;
        const lon = location.longitude;
        const timezone = location.timezone;
        const displayName = location.name;

        // ২. Latitude ও Longitude দিয়ে লাইভ ওয়েদার ডেটা আনা
        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=${timezone}`);
        const weatherData = await weatherResponse.json();

        const current = weatherData.current;
        const daily = weatherData.daily;

        // ৩. UI আপডেট করা (শহরের নাম)
        document.getElementById('city-name').innerText = displayName;

        // ৪. ওই শহরের লোকাল টাইম এবং তারিখ বের করা
        const now = new Date();
        const timeOptions = { hour: '2-digit', minute: '2-digit', timeZone: timezone };
        const dateOptions = { weekday: 'long', day: 'numeric', month: 'long', timeZone: timezone };

        const localTime = now.toLocaleTimeString('en-US', timeOptions);
        let localDate = now.toLocaleDateString('en-GB', dateOptions).replace(' ', '—');

        document.getElementById('local-time').innerText = localTime;
        document.getElementById('current-date').innerText = localDate + ".";

        // ৫. তাপমাত্রা, বাতাস এবং বৃষ্টির সম্ভাবনা
        document.getElementById('temp').innerText = Math.round(current.temperature_2m) + "°";
        document.getElementById('temp-range').innerText = Math.round(daily.temperature_2m_max[0]) + "°—" + Math.round(daily.temperature_2m_min[0]) + "°";
        document.getElementById('wind').innerText = "Wind " + Math.round(current.wind_speed_10m) + " km/h";
        document.getElementById('precip').innerText = "Precipitation " + daily.precipitation_probability_max[0] + "%";

        // ৬. ওয়েদার কোড অনুযায়ী টেক্সট পরিবর্তন (যেমন: বৃষ্টি, মেঘলা, রোদ)
        const code = current.weather_code;
        let weatherText = "Clear Sky";
        if (code >= 1 && code <= 3) weatherText = "Partly Cloudy";
        if (code === 45 || code === 48) weatherText = "Foggy";
        if (code >= 51 && code <= 67) weatherText = "Yes. It's raining.";
        if (code >= 71 && code <= 77) weatherText = "Snowing";
        if (code >= 95) weatherText = "Thunderstorm!";
        
        document.getElementById('description').innerText = weatherText;

    } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to get weather data. Check your internet connection.");
    }
}

// সার্চ আইকনে ক্লিক ইভেন্ট
document.getElementById('search-icon').addEventListener('click', () => {
    const userInput = prompt("Enter any City or Country Name (e.g., Tokyo, Paris, New York):");
    if (userInput) {
        fetchLiveWeather(userInput);
    }
});

// অ্যাপ লোড হলে ডিফল্টভাবে 'Dhaka' এর ওয়েদার দেখাবে
document.addEventListener("DOMContentLoaded", () => {
    fetchLiveWeather("Dhaka");
});
