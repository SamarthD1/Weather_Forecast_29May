        // API Keys
        const POINT_FORECAST_API = 'EEyFRikXKbEEhTjgOFLnVxeCW9xE3X7l';
        const MAP_FORECAST_API = 'UAKgMcofO7ZSPpnn4vOHXBVG5dt2siZG';

        // DOM Elements
        const locationInput = document.getElementById('location-input');
        const loadingElement = document.getElementById('loading');
        const errorElement = document.getElementById('error-message');
        const weatherContainer = document.getElementById('weather-container');
        const forecastContainer = document.getElementById('forecast-container');
        const rainAnimation = document.getElementById('rain-animation');
        const sunAnimation = document.getElementById('sun-animation');
        const snowAnimation = document.getElementById('snow-animation');

        // Weather icon mapping
        const weatherIcons = {
            'clear': 'https://cdn-icons-png.flaticon.com/512/3222/3222807.png',
            'clouds': 'https://cdn-icons-png.flaticon.com/512/414/414927.png',
            'rain': 'https://cdn-icons-png.flaticon.com/512/4150/4150904.png',
            'snow': 'https://cdn-icons-png.flaticon.com/512/6428/6428240.png',
            'thunderstorm': 'https://cdn-icons-png.flaticon.com/512/1146/1146860.png',
            'drizzle': 'https://cdn-icons-png.flaticon.com/512/3076/3076129.png',
            'mist': 'https://cdn-icons-png.flaticon.com/512/1197/1197102.png'
        };

        // Initialize map using Map Forecast API
        function initMap(lat = 19.0760, lng = 72.8777) { // Default to Mumbai
            const mapElement = document.getElementById('map');
            mapElement.innerHTML = `
                <iframe 
                    width="100%" 
                    height="100%" 
                    frameborder="0" 
                    scrolling="no" 
                    marginheight="0" 
                    marginwidth="0" 
                    src="https://maps.google.com/maps?q=${lat},${lng}&z=10&output=embed"
                    style="border-radius: 15px;">
                </iframe>
            `;
        }

        // Initialize the page
        window.onload = function() {
            initMap();
            locationInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    searchLocation();
                }
            });
        };

        // Search for a location
        function searchLocation(location) {
            const loc = location || locationInput.value;
            
            if (!loc) {
                showError('Please enter a location');
                return;
            }
            
            showLoading();
            hideError();
            hideWeather();
            clearAnimations();

            // Using OpenStreetMap Nominatim for geocoding 
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(loc)}`)
                .then(response => response.json())
                .then(data => {
                    if (data && data.length > 0) {
                        const lat = parseFloat(data[0].lat);
                        const lng = parseFloat(data[0].lon);
                        const locationName = data[0].display_name.split(',')[0];
                        
                        initMap(lat, lng);
                        
                        // Get weather data using Point Forecast API
                        getWeatherData(lat, lng, locationName);
                    } else {
                        showError('Location not found');
                        hideLoading();
                    }
                })
                .catch(error => {
                    console.error('Error fetching location:', error);
                    showError('Failed to fetch location');
                    hideLoading();
                });
        }

        // Get weather data using Point Forecast API
        function getWeatherData(lat, lng, locationName) {
            
            // Simulating API call with setTimeout
            setTimeout(() => {
                // Mock data 
                const mockWeatherData = {
                    current: {
                        temp: 28 + Math.round(Math.random() * 10 - 5), // Random temp around 28°C
                        humidity: 50 + Math.round(Math.random() * 30),
                        wind_speed: 5 + Math.random() * 10,
                        pressure: 1010 + Math.round(Math.random() * 10 - 5),
                        visibility: 10 + Math.random() * 5,
                        weather: [{
                            main: ['Clear', 'Clouds', 'Rain', 'Thunderstorm', 'Drizzle', 'Snow'][Math.floor(Math.random() * 6)],
                            description: ['Sunny', 'Partly cloudy', 'Light rain', 'Thunderstorms', 'Drizzling', 'Snowing'][Math.floor(Math.random() * 6)],
                            icon: ''
                        }]
                    },
                    daily: Array(5).fill().map((_, i) => ({
                        dt: Date.now() / 1000 + 86400 * i,
                        temp: {
                            max: 28 + Math.round(Math.random() * 10 - 5),
                            min: 20 + Math.round(Math.random() * 10 - 5)
                        },
                        weather: [{
                            main: ['Clear', 'Clouds', 'Rain', 'Thunderstorm', 'Drizzle', 'Snow'][Math.floor(Math.random() * 6)],
                            description: ['Sunny', 'Partly cloudy', 'Light rain', 'Thunderstorms', 'Drizzling', 'Snowing'][Math.floor(Math.random() * 6)]
                        }]
                    }))
                };

                displayWeather(mockWeatherData, locationName);
                setWeatherAnimation(mockWeatherData.current.weather[0].main);
                hideLoading();
                showWeather();
            }, 1000);
        }

        // Display weather data
        function displayWeather(data, locationName) {
            // Current weather
            document.getElementById('city-name').textContent = locationName;
            
            const now = new Date();
            document.getElementById('date-time').textContent = now.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            document.getElementById('temperature').textContent = `${Math.round(data.current.temp)}°C`;
            document.getElementById('weather-description').textContent = data.current.weather[0].description;
            
            const weatherCondition = data.current.weather[0].main.toLowerCase();
            document.getElementById('weather-icon').src = weatherIcons[weatherCondition] || weatherIcons['clear'];
            
            document.getElementById('humidity').textContent = `${data.current.humidity}%`;
            document.getElementById('wind').textContent = `${Math.round(data.current.wind_speed * 3.6)} km/h`;
            document.getElementById('pressure').textContent = `${data.current.pressure} hPa`;
            document.getElementById('visibility').textContent = `${data.current.visibility.toFixed(1)} km`;

            // Forecast
            forecastContainer.innerHTML = '';
            data.daily.forEach((day, index) => {
                const date = new Date(day.dt * 1000);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                
                const weatherCondition = day.weather[0].main.toLowerCase();
                const iconUrl = weatherIcons[weatherCondition] || weatherIcons['clear'];
                
                const forecastCard = document.createElement('div');
                forecastCard.className = 'forecast-card';
                forecastCard.innerHTML = `
                    <h3>${dayName}</h3>
                    <img class="forecast-icon" src="${iconUrl}" alt="${day.weather[0].description}">
                    <div class="forecast-temp">
                        <span class="high-temp">${Math.round(day.temp.max)}°</span>
                        <span class="low-temp">${Math.round(day.temp.min)}°</span>
                    </div>
                    <p>${day.weather[0].main}</p>
                `;
                
                forecastContainer.appendChild(forecastCard);
            });
        }

        // Seting weather animation based on conditions
        function setWeatherAnimation(weatherCondition) {
            clearAnimations();
            
            const condition = weatherCondition.toLowerCase();
            
            if (condition.includes('rain') || condition.includes('drizzle')) {
                createRain();
                rainAnimation.style.display = 'block';
            } else if (condition.includes('snow')) {
                createSnow();
                snowAnimation.style.display = 'block';
            } else if (condition.includes('clear')) {
                createSun();
                sunAnimation.style.display = 'block';
            }
        }

        // rain animation
        function createRain() {
            rainAnimation.innerHTML = '';
            for (let i = 0; i < 60; i++) {
                const drop = document.createElement('div');
                drop.className = 'drop';
                drop.style.left = `${Math.random() * 100}%`;
                drop.style.animationDuration = `${0.5 + Math.random() * 0.5}s`;
                drop.style.animationDelay = `${Math.random() * 0.5}s`;
                rainAnimation.appendChild(drop);
            }
        }

        // sun animation
        function createSun() {
            sunAnimation.innerHTML = '';
            for (let i = 0; i < 12; i++) {
                const ray = document.createElement('div');
                ray.className = 'sun-ray';
                ray.style.width = `${50 + Math.random() * 30}px`;
                ray.style.top = '40px';
                ray.style.left = '40px';
                ray.style.transform = `rotate(${i * 30}deg)`;
                ray.style.animationDelay = `${Math.random() * 2}s`;
                sunAnimation.appendChild(ray);
            }
        }

        // snow animation
        function createSnow() {
            snowAnimation.innerHTML = '';
            for (let i = 0; i < 50; i++) {
                const flake = document.createElement('div');
                flake.className = 'snowflake';
                flake.style.width = `${5 + Math.random() * 5}px`;
                flake.style.height = flake.style.width;
                flake.style.left = `${Math.random() * 100}%`;
                flake.style.animationDuration = `${5 + Math.random() * 10}s`;
                flake.style.animationDelay = `${Math.random() * 5}s`;
                snowAnimation.appendChild(flake);
            }
        }

        // Helper functions
        function clearAnimations() {
            rainAnimation.style.display = 'none';
            sunAnimation.style.display = 'none';
            snowAnimation.style.display = 'none';
        }

        function showLoading() {
            loadingElement.style.display = 'block';
        }

        function hideLoading() {
            loadingElement.style.display = 'none';
        }

        function showError(message) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }

        function hideError() {
            errorElement.style.display = 'none';
        }

        function showWeather() {
            weatherContainer.style.display = 'block';
        }

        function hideWeather() {
            weatherContainer.style.display = 'none';
        }