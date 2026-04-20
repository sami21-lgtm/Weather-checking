// Weather Data Object
const cities = {
    "london": { name: "London", temp: "13°", desc: "Yes. It's raining.", range: "17°—14°", wind: "16 km/h", precip: "55%" },
    "dhaka": { name: "Dhaka", temp: "32°", desc: "Hot & Sunny", range: "35°—28°", wind: "12 km/h", precip: "05%" },
    "new york": { name: "New York", temp: "21°", desc: "Partly Cloudy", range: "24°—18°", wind: "18 km/h", precip: "20%" }
};

const searchBtn = document.getElementById('search-icon');

// Function to update UI
function updateWeather(cityName) {
    const data = cities[cityName.toLowerCase()];
    
    if (data) {
        document.getElementById('city-name').innerText = data.name;
        document.getElementById('temp').innerText = data.temp;
        document.getElementById('description').innerText = data.desc;
        document.getElementById('temp-range').innerText = data.range;
        document.getElementById('wind').innerText = "Wind " + data.wind;
        document.getElementById('precip').innerText = "Precipitation " + data.precip;
    } else {
        alert("City not found! Try: London, Dhaka, or New York");
    }
}

// Search interaction
searchBtn.addEventListener('click', () => {
    const input = prompt("Enter City (London, Dhaka, New York):");
    if (input) {
        updateWeather(input);
    }
});

// Auto update date
const dateElement = document.getElementById('current-date');
const options = { weekday: 'long', day: 'numeric', month: 'long' };
dateElement.innerText = new Date().toLocaleDateString('en-GB', options).replace(' ', '—') + '.';
