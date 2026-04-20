async function fetchWeather(city) {
    try {
        document.getElementById('description').innerText = "Searching...";
        document.getElementById('human-character').innerText = "🚶‍♂️🔍"; 

        // API URL পরিবর্তন করা হয়েছে, 'https' নিশ্চিত করা হয়েছে
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`);
        
        if (!geoRes.ok) {
            throw new Error(`Geocoding HTTP error! status: ${geoRes.status}`);
        }
        
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            alert("City not found! Please check the spelling.");
            document.getElementById('description').innerText = "Not Found";
            document.getElementById('human-character').innerText = "🤷‍♂️";
            return;
        }

        const { latitude, longitude, timezone, name } = geoData.results[0];
        const validTimezone = timezone || 'auto'; // 'auto' ব্যবহার করা বেশি সেফ

        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=${validTimezone}`);
        
        if (!weatherRes.ok) {
            throw new Error(`Weather HTTP error! status: ${weatherRes.status}`);
        }
        
        const weatherData = await weatherRes.json();

        const current = weatherData.current;
        const daily = weatherData.daily;

        document.getElementById('city-name').innerText = name;
        document.getElementById('temp').innerText = Math.round(current.temperature_2m) + "°";
        
        // Range এ মাঝে মাঝে undefined আসতে পারে, সেটার জন্য চেক বসানো হলো
        const maxTemp = daily.temperature_2m_max ? Math.round(daily.temperature_2m_max[0]) : '--';
        const minTemp = daily.temperature_2m_min ? Math.round(daily.temperature_2m_min[0]) : '--';
        document.getElementById('temp-range').innerText = `${maxTemp}°—${minTemp}°`;
        
        document.getElementById('wind').innerText = "Wind " + Math.round(current.wind_speed_10m) + " km/h";
        document.getElementById('feels-like').innerText = "Feels like " + Math.round(current.apparent_temperature) + "°";
        
        const precipProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[0] : 0;
        document.getElementById('precip').innerText = "Precip " + precipProb + "%";

        const now = new Date();
        const validTimezoneName = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
        const timeOptions = { hour: '2-digit', minute: '2-digit', timeZone: validTimezoneName };
        const dateOptions = { weekday: 'long', day: 'numeric', month: 'long', timeZone: validTimezoneName };
        
        document.getElementById('local-time').innerText = now.toLocaleTimeString('en-US', timeOptions);
        document.getElementById('current-date').innerText = now.toLocaleDateString('en-GB', dateOptions).replace(' ', '—') + ".";

        const code = current.weather_code;
        const temp = current.temperature_2m;
        let desc = "Clear Sky";
        let human = "🚶‍♂️😎";

        if (code >= 51 && code <= 67) {
            desc = "Yes. It's raining.";
            human = "🚶‍♂️☔️";
        } else if (code >= 71 && code <= 77) {
            desc = "Snowing";
            human = "🥶🧥❄️";
        } else if (code >= 95) {
            desc = "Thunderstorm!";
            human = "🏃‍♂️⛈️";
        } else if (code === 45 || code === 48) {
            desc = "Foggy";
            human = "🚶‍♂️🌫️";
        } else if (code >= 1 && code <= 3) {
            desc = "Partly Cloudy";
            human = "🚶‍♂️☁️";
        } else {
            if (temp >= 32) {
                desc = "Hot & Sunny";
                human = "🥵💧";
            } else if (temp <= 15) {
                desc = "Cold";
                human = "🥶🧥";
            }
        }

        document.getElementById('description').innerText = desc;
        document.getElementById('human-character').innerText = human;

    } catch (error) {
        console.error("Fetch error details: ", error);
        document.getElementById('description').innerText = "API Error";
        document.getElementById('human-character').innerText = "🤦‍♂️";
        alert("API Error! Please check console for details.");
    }
}

document.getElementById('search-icon').addEventListener('click', () => {
    const city = prompt("Enter Country or City Name:");
    if (city) fetchWeather(city);
});

document.addEventListener('DOMContentLoaded', () => {
    fetchWeather("Dhaka");
});
