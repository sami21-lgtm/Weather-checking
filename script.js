async function updateWeather(city) {
    try {
        // ১. শহরের নাম দিয়ে ল্যাটিটিউড ও লংগিটিউড বের করা
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&format=json`);
        const data = await res.json();
        
        if (!data.results) {
            alert("City not found! Please try another name.");
            return;
        }

        const { latitude, longitude, timezone, name } = data.results[0];
        
        // ২. ওয়েদার ডেটা আনা
        const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,is_day,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`);
        const wData = await wRes.json();

        // ৩. HTML-এ ডেটা সেট করা
        document.getElementById('city-name').innerText = name;
        document.getElementById('temp').innerText = Math.round(wData.current.temperature_2m) + "°";
        document.getElementById('wind').innerText = Math.round(wData.current.wind_speed_10m) + " km/h";
        document.getElementById('feels-like').innerText = Math.round(wData.current.temperature_2m - 1) + "°";
        document.getElementById('precip').innerText = wData.daily.precipitation_probability_max[0] + "%";
        document.getElementById('temp-range').innerText = Math.round(wData.daily.temperature_2m_max[0]) + "°—" + Math.round(wData.daily.temperature_2m_min[0]) + "°";
        
        // ৪. ওয়েদার ডেসক্রিপশন আপডেট
        const code = wData.current.weather_code;
        let desc = "Clear Sky";
        if(code > 0 && code < 45) desc = "Partly Cloudy";
        else if(code >= 45) desc = "Cloudy / Raining";
        document.getElementById('description').innerText = desc;

        // ৫. আইকন সেট করা (দিন/রাত অনুযায়ী চাঁদ বা সূর্য)
        const scenery = document.getElementById('scenery');
        scenery.innerText = wData.current.is_day === 1 ? "☀️" : "🌙";
        scenery.style.filter = wData.current.is_day === 1 ? "drop-shadow(0 0 15px gold)" : "drop-shadow(0 0 15px white)";

        // ৬. ঘড়ি ও তারিখ (অরিজিনাল আইফোন স্টাইল)
        if(window.timer) clearInterval(window.timer);
        
        window.timer = setInterval(() => {
            const now = new Date();
            
            // 12-hour format, AM/PM ছাড়া
            let timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: timezone });
            timeString = timeString.replace(/ AM| PM/i, ''); // AM বা PM মুছে দেওয়া
            
            document.getElementById('local-time').innerText = timeString;
            
            // ফুল ডেট ফরম্যাট (যেমন: Tuesday, 21 April)
            const dateStr = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: timezone });
            document.getElementById('current-date').innerText = dateStr;
        }, 1000);

    } catch (e) { 
        console.error("Error fetching data:", e); 
    }
}

// ৭. সার্চ বক্সের লজিক (বাটনে ক্লিক করলে)
document.getElementById('search-btn').onclick = () => {
    const city = document.getElementById('city-input').value;
    if (city) updateWeather(city);
};

// ৮. সার্চ বক্সের লজিক (Enter চাপলে)
document.getElementById('city-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        updateWeather(e.target.value);
    }
});

// ৯. শুরুতে ডিফল্টভাবে ঢাকা লোড হবে
updateWeather("Dhaka");
