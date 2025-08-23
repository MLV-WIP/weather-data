class WeatherApp {
    constructor() {
        this.currentLocation = null;
        this.weatherData = null;
        this.forecastData = null;
        this.isLoading = false;
        
        this.init();
    }
    
    async init() {
        this.bindEvents();
        await this.initializeLocation();
        this.startAutoRefresh();
    }
    
    bindEvents() {
        // Location change button
        document.getElementById('changeLocationBtn').addEventListener('click', () => {
            this.showLocationModal();
        });
        
        // Modal controls
        document.getElementById('modalClose').addEventListener('click', () => {
            this.hideLocationModal();
        });
        
        document.getElementById('locationModal').addEventListener('click', (e) => {
            if (e.target.id === 'locationModal') {
                this.hideLocationModal();
            }
        });
        
        // GPS location button
        document.getElementById('useGpsBtn').addEventListener('click', () => {
            this.getCurrentPosition();
        });
        
        // Location search
        const searchInput = document.getElementById('locationSearch');
        let searchTimeout;
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length > 2) {
                searchTimeout = setTimeout(() => {
                    this.searchLocations(query);
                }, 300);
            } else {
                this.clearSearchResults();
            }
        });
        
        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refreshWeatherData();
        });
        
        // Error toast close
        document.getElementById('toastClose').addEventListener('click', () => {
            this.hideErrorToast();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideLocationModal();
                this.hideErrorToast();
            } else if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.refreshWeatherData();
            }
        });
    }
    
    async initializeLocation() {
        this.showLoading();
        
        try {
            // Try to get saved location first
            const savedLocation = this.getSavedLocation();
            if (savedLocation) {
                this.currentLocation = savedLocation;
                await this.loadWeatherData();
                return;
            }
            
            // Try GPS location
            try {
                await this.getCurrentPosition();
                return;
            } catch (gpsError) {
                console.log('GPS failed, trying IP location');
            }
            
            // Fallback to IP location
            try {
                const response = await fetch('/api/location/ip');
                const ipLocation = await response.json();
                
                if (response.ok) {
                    this.currentLocation = ipLocation;
                    await this.loadWeatherData();
                    return;
                }
            } catch (ipError) {
                console.log('IP location failed, using default');
            }
            
            // Final fallback - default location
            this.currentLocation = {
                latitude: 47.6062,
                longitude: -122.3321,
                city: 'Seattle',
                state: 'WA',
                source: 'default'
            };
            
            await this.loadWeatherData();
            
        } catch (error) {
            console.error('Failed to initialize location:', error);
            this.showError('Failed to initialize location. Using default location.');
        } finally {
            this.hideLoading();
        }
    }
    
    async getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }
            
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    this.currentLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        source: 'gps'
                    };
                    
                    await this.loadWeatherData();
                    this.hideLocationModal();
                    resolve();
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            );
        });
    }
    
    async loadWeatherData() {
        if (!this.currentLocation) return;
        
        try {
            this.isLoading = true;
            
            // Load current weather and forecast in parallel
            const [currentResponse, forecastResponse] = await Promise.all([
                fetch(`/api/weather/current?lat=${this.currentLocation.latitude}&lng=${this.currentLocation.longitude}`),
                fetch(`/api/weather/forecast?lat=${this.currentLocation.latitude}&lng=${this.currentLocation.longitude}&days=7`)
            ]);
            
            if (!currentResponse.ok || !forecastResponse.ok) {
                throw new Error('Failed to fetch weather data');
            }
            
            this.weatherData = await currentResponse.json();
            this.forecastData = await forecastResponse.json();
            
            // Update background
            this.updateBackground();
            
            // Update UI
            this.updateCurrentWeather();
            this.updateForecast();
            this.updateLocationDisplay();
            this.updateLastUpdated();
            
            // Save location for next time
            this.saveLocation();
            
        } catch (error) {
            console.error('Error loading weather data:', error);
            this.showError('Failed to load weather data. Please try again.');
        } finally {
            this.isLoading = false;
        }
    }
    
    updateBackground() {
        if (!this.weatherData?.backgroundImage) return;
        
        const app = document.getElementById('weatherApp');
        const backgroundInfo = this.weatherData.backgroundImage;
        
        if (backgroundInfo.type === 'image') {
            // Try to load the image
            const img = new Image();
            img.onload = () => {
                app.style.backgroundImage = `url('${backgroundInfo.source}')`;
            };
            img.onerror = () => {
                // Use fallback gradient
                app.style.background = backgroundInfo.fallback;
            };
            img.src = backgroundInfo.source;
        } else {
            app.style.background = backgroundInfo.fallback;
        }
        
        // Update overlay class based on time of day
        if (this.weatherData.isDay) {
            app.classList.add('bright-conditions');
            app.classList.remove('dark-conditions');
        } else {
            app.classList.add('dark-conditions');
            app.classList.remove('bright-conditions');
        }
    }
    
    updateCurrentWeather() {
        if (!this.weatherData) return;
        
        document.getElementById('currentTemp').textContent = `${this.weatherData.temperature}°F`;
        document.getElementById('currentConditions').textContent = this.formatCondition(this.weatherData.condition);
        document.getElementById('currentWind').textContent = `${Math.round(this.weatherData.windSpeed)} mph`;
        
        // Update air quality if available
        if (this.weatherData.airQuality) {
            const airQualitySection = document.getElementById('airQualitySection');
            const airQualityValue = document.getElementById('airQuality');
            
            airQualitySection.style.display = 'block';
            airQualityValue.textContent = `${this.weatherData.airQuality.aqi} (${this.weatherData.airQuality.category})`;
        }
    }
    
    updateForecast() {
        if (!this.forecastData?.days) return;
        
        const container = document.getElementById('forecastContainer');
        container.innerHTML = '';
        
        this.forecastData.days.forEach(day => {
            const card = this.createForecastCard(day);
            container.appendChild(card);
        });
    }
    
    createForecastCard(dayData) {
        const card = document.createElement('div');
        card.className = 'forecast-card';
        
        const date = new Date(dayData.date);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        card.innerHTML = `
            <div class="forecast-date">${dayName}, ${monthDay}</div>
            <div class="forecast-temps">
                <span class="temp-high">${dayData.tempMax}°</span>
                <span class="temp-low">${dayData.tempMin}°</span>
            </div>
            <div class="forecast-condition">${this.formatCondition(dayData.condition)}</div>
            <div class="forecast-details">
                <span>💧 ${dayData.precipitationChance}%</span>
                <span>💨 ${dayData.humidity}%</span>
            </div>
        `;
        
        return card;
    }
    
    updateLocationDisplay() {
        if (!this.currentLocation) return;
        
        const locationElement = document.getElementById('currentLocation');
        let displayText = '';
        
        // Use locationInfo from API response if available (for GPS coordinates)
        if (this.weatherData?.locationInfo) {
            const info = this.weatherData.locationInfo;
            if (info.city && info.state) {
                displayText = `${info.city}, ${info.state}`;
            } else if (info.city) {
                displayText = info.city;
            }
        }
        
        // Fall back to stored location data
        if (!displayText) {
            if (this.currentLocation.city && this.currentLocation.state) {
                displayText = `${this.currentLocation.city}, ${this.currentLocation.state}`;
            } else if (this.currentLocation.city) {
                displayText = this.currentLocation.city;
            } else {
                displayText = `${this.currentLocation.latitude.toFixed(2)}, ${this.currentLocation.longitude.toFixed(2)}`;
            }
        }
        
        // Add source indicator
        const sourceIcons = {
            gps: '🎯',
            ip: '🌐',
            manual: '📍',
            default: '🏙️'
        };
        
        const sourceIcon = sourceIcons[this.currentLocation.source] || '📍';
        locationElement.textContent = `${sourceIcon} ${displayText}`;
    }
    
    updateLastUpdated() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
        
        document.getElementById('lastUpdated').textContent = `Last updated: ${timeString}`;
    }
    
    async searchLocations(query) {
        try {
            const response = await fetch(`/api/location/search?query=${encodeURIComponent(query)}`);
            
            if (!response.ok) {
                throw new Error('Search failed');
            }
            
            const locations = await response.json();
            this.displaySearchResults(locations);
            
        } catch (error) {
            console.error('Location search error:', error);
            this.showError('Failed to search locations');
        }
    }
    
    displaySearchResults(locations) {
        const resultsContainer = document.getElementById('searchResults');
        resultsContainer.innerHTML = '';
        
        if (locations.length === 0) {
            resultsContainer.innerHTML = '<div class="search-result-item">No locations found</div>';
            return;
        }
        
        locations.forEach(location => {
            const item = document.createElement('div');
            item.className = 'search-result-item';
            item.textContent = location.displayName;
            
            item.addEventListener('click', async () => {
                this.currentLocation = {
                    ...location,
                    source: 'manual'
                };
                
                await this.loadWeatherData();
                this.hideLocationModal();
            });
            
            resultsContainer.appendChild(item);
        });
    }
    
    clearSearchResults() {
        document.getElementById('searchResults').innerHTML = '';
    }
    
    async refreshWeatherData() {
        if (this.isLoading || !this.currentLocation) return;
        
        const refreshBtn = document.getElementById('refreshBtn');
        refreshBtn.disabled = true;
        refreshBtn.innerHTML = '🔄 Refreshing...';
        
        try {
            await this.loadWeatherData();
        } finally {
            refreshBtn.disabled = false;
            refreshBtn.innerHTML = '🔄 Refresh';
        }
    }
    
    startAutoRefresh() {
        // Refresh every 30 minutes
        setInterval(() => {
            if (!this.isLoading) {
                this.refreshWeatherData();
            }
        }, 30 * 60 * 1000);
    }
    
    showLocationModal() {
        document.getElementById('locationModal').style.display = 'flex';
        document.getElementById('locationSearch').focus();
    }
    
    hideLocationModal() {
        document.getElementById('locationModal').style.display = 'none';
        document.getElementById('locationSearch').value = '';
        this.clearSearchResults();
    }
    
    showLoading() {
        document.getElementById('loadingOverlay').classList.remove('hidden');
    }
    
    hideLoading() {
        document.getElementById('loadingOverlay').classList.add('hidden');
    }
    
    showError(message) {
        const errorToast = document.getElementById('errorToast');
        const errorMessage = document.getElementById('errorMessage');
        
        errorMessage.textContent = message;
        errorToast.style.display = 'flex';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.hideErrorToast();
        }, 5000);
    }
    
    hideErrorToast() {
        document.getElementById('errorToast').style.display = 'none';
    }
    
    formatCondition(condition) {
        return condition.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    saveLocation() {
        if (this.currentLocation) {
            localStorage.setItem('weatherLocation', JSON.stringify(this.currentLocation));
        }
    }
    
    getSavedLocation() {
        try {
            const saved = localStorage.getItem('weatherLocation');
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.error('Error reading saved location:', error);
            return null;
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});