const express = require('express');
const cors = require('cors');
const path = require('path');
const weatherService = require('./src/weather.service');
const locationService = require('./src/location.service');
const backgroundService = require('./src/background.service');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes
app.get('/api/weather/current', async (req, res) => {
    try {
        const { lat, lng } = req.query;
        
        if (!lat || !lng) {
            return res.status(400).json({ error: 'Latitude and longitude required' });
        }
        
        if (!locationService.validateCoordinates(lat, lng)) {
            return res.status(400).json({ error: 'Invalid coordinates' });
        }
        
        const weatherData = await weatherService.getCurrentWeather(lat, lng);
        const backgroundImage = backgroundService.getBackgroundForWeather(
            weatherData.condition, 
            weatherData.isDay
        );
        
        // Try to get air quality data
        const airQuality = await weatherService.getAirQuality(lat, lng);
        
        // Try to get location name for coordinates
        let locationInfo = null;
        try {
            locationInfo = await locationService.reverseGeocode(lat, lng);
        } catch (error) {
            console.log('Reverse geocoding failed, continuing without location name');
        }
        
        res.json({
            ...weatherData,
            backgroundImage,
            airQuality,
            locationInfo
        });
        
    } catch (error) {
        console.error('Current weather error:', error);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

app.get('/api/weather/forecast', async (req, res) => {
    try {
        const { lat, lng, days = 7 } = req.query;
        
        if (!lat || !lng) {
            return res.status(400).json({ error: 'Latitude and longitude required' });
        }
        
        if (!locationService.validateCoordinates(lat, lng)) {
            return res.status(400).json({ error: 'Invalid coordinates' });
        }
        
        const forecastData = await weatherService.getForecast(lat, lng, days);
        
        res.json(forecastData);
        
    } catch (error) {
        console.error('Forecast error:', error);
        res.status(500).json({ error: 'Failed to fetch forecast data' });
    }
});

app.get('/api/location/search', async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query) {
            return res.status(400).json({ error: 'Search query required' });
        }
        
        const locations = await locationService.searchLocations(query);
        res.json(locations);
        
    } catch (error) {
        console.error('Location search error:', error);
        res.status(500).json({ error: 'Failed to search locations' });
    }
});

app.get('/api/location/ip', async (req, res) => {
    try {
        const clientIP = req.ip || 
                        req.connection.remoteAddress || 
                        req.socket.remoteAddress || 
                        (req.connection.socket ? req.connection.socket.remoteAddress : null);
        
        const location = await locationService.getLocationFromIP(clientIP);
        res.json(location);
        
    } catch (error) {
        console.error('IP location error:', error);
        res.status(500).json({ error: 'Failed to get location from IP' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🌤️  Weather app running on http://localhost:${PORT}`);
    console.log(`📁 Serving static files from: ${path.join(__dirname, 'public')}`);
});

module.exports = app;