const axios = require('axios');
const cacheService = require('./cache.service');

const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1';

class WeatherService {
    async getCurrentWeather(latitude, longitude) {
        const cacheKey = `current_${latitude}_${longitude}`;
        const cached = cacheService.get(cacheKey);
        
        if (cached) {
            return cached;
        }
        
        try {
            const response = await axios.get(`${OPEN_METEO_BASE_URL}/forecast`, {
                params: {
                    latitude,
                    longitude,
                    temperature_unit: 'fahrenheit',
                    wind_speed_unit: 'mph',
                    current: 'temperature_2m,weathercode,windspeed_10m,winddirection_10m,is_day',
                    timezone: 'auto'
                }
            });
            
            const data = response.data.current;
            
            const weatherData = {
                temperature: Math.round(data.temperature_2m),
                condition: this.mapWeatherCode(data.weathercode),
                windSpeed: data.windspeed_10m,
                windDirection: data.winddirection_10m,
                isDay: data.is_day === 1,
                timestamp: new Date().toISOString(),
                location: { latitude, longitude }
            };
            
            // Cache for 10 minutes
            cacheService.set(cacheKey, weatherData, 10 * 60 * 1000);
            
            return weatherData;
            
        } catch (error) {
            console.error('Error fetching current weather:', error);
            throw new Error('Failed to fetch current weather data');
        }
    }
    
    async getForecast(latitude, longitude, days = 14) {
        const cacheKey = `forecast_${latitude}_${longitude}_${days}`;
        const cached = cacheService.get(cacheKey);
        
        if (cached) {
            return cached;
        }
        
        try {
            const response = await axios.get(`${OPEN_METEO_BASE_URL}/forecast`, {
                params: {
                    latitude,
                    longitude,
                    daily: 'weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,relative_humidity_2m_mean,sunrise,sunset',
                    temperature_unit: 'fahrenheit',
                    forecast_days: days,
                    timezone: 'auto'
                }
            });
            
            const daily = response.data.daily;
            
            // Get today's date in YYYY-MM-DD format in local timezone
            const today = new Date().toLocaleDateString('en-CA'); // ISO format YYYY-MM-DD
            
            const forecastData = {
                days: daily.time
                    .map((date, index) => ({
                        date,
                        tempMax: Math.round(daily.temperature_2m_max[index]),
                        tempMin: Math.round(daily.temperature_2m_min[index]),
                        condition: this.mapWeatherCode(daily.weathercode[index]),
                        precipitationChance: daily.precipitation_probability_max[index] || 0,
                        humidity: Math.round(daily.relative_humidity_2m_mean[index] || 0),
                        sunrise: daily.sunrise[index],
                        sunset: daily.sunset[index]
                    }))
                    .filter(day => day.date >= today) // Only include today and future dates
            };
            
            // Cache for 1 hour
            cacheService.set(cacheKey, forecastData, 60 * 60 * 1000);
            
            return forecastData;
            
        } catch (error) {
            console.error('Error fetching forecast:', error);
            throw new Error('Failed to fetch forecast data');
        }
    }
    
    async getAirQuality(latitude, longitude) {
        try {
            const response = await axios.get(`${OPEN_METEO_BASE_URL}/air_quality`, {
                params: {
                    latitude,
                    longitude,
                    current: 'european_aqi,pm10,pm2_5'
                }
            });
            
            const current = response.data.current;
            
            return {
                aqi: current.european_aqi,
                pm10: current.pm10,
                pm25: current.pm2_5,
                category: this.getAQICategory(current.european_aqi)
            };
            
        } catch (error) {
            console.error('Error fetching air quality:', error);
            return null; // Air quality is optional
        }
    }
    
    mapWeatherCode(code) {
        const weatherCodes = {
            0: 'clear',
            1: 'partly_cloudy',
            2: 'partly_cloudy',
            3: 'cloudy',
            45: 'fog',
            48: 'fog',
            51: 'light_rain',
            53: 'light_rain',
            55: 'rain',
            61: 'rain',
            63: 'rain',
            65: 'heavy_rain',
            71: 'light_snow',
            73: 'snow',
            75: 'heavy_snow',
            77: 'snow',
            80: 'rain',
            81: 'rain',
            82: 'heavy_rain',
            85: 'snow',
            86: 'heavy_snow',
            95: 'thunderstorm',
            96: 'thunderstorm',
            99: 'thunderstorm'
        };
        
        return weatherCodes[code] || 'clear';
    }
    
    getAQICategory(aqi) {
        if (!aqi) return 'Unknown';
        if (aqi <= 50) return 'Good';
        if (aqi <= 100) return 'Moderate';
        if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
        if (aqi <= 200) return 'Unhealthy';
        if (aqi <= 300) return 'Very Unhealthy';
        return 'Hazardous';
    }
}

module.exports = new WeatherService();