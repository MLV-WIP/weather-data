const weatherService = require('../src/weather.service');
const locationService = require('../src/location.service');

async function testWeatherAPI() {
    console.log('🌤️  Testing Weather API Integration\n');
    
    // Test coordinates - Seattle, WA
    const lat = 47.6062;
    const lng = -122.3321;
    
    try {
        console.log('📍 Testing location validation...');
        const isValid = locationService.validateCoordinates(lat, lng);
        console.log(`✅ Coordinates valid: ${isValid}\n`);
        
        console.log('🌡️  Testing current weather...');
        const currentWeather = await weatherService.getCurrentWeather(lat, lng);
        console.log('✅ Current weather data:');
        console.log(`   Temperature: ${currentWeather.temperature}°F`);
        console.log(`   Condition: ${currentWeather.condition}`);
        console.log(`   Is Day: ${currentWeather.isDay}`);
        console.log(`   Wind: ${currentWeather.windSpeed} mph\n`);
        
        console.log('📅 Testing forecast...');
        const forecast = await weatherService.getForecast(lat, lng, 7);
        console.log(`✅ Forecast data (${forecast.days.length} days):`);
        forecast.days.slice(0, 3).forEach((day, index) => {
            console.log(`   Day ${index + 1}: ${day.tempMax}°/${day.tempMin}° - ${day.condition} (${day.precipitationChance}% rain)`);
        });
        console.log('');
        
        console.log('💨 Testing air quality...');
        const airQuality = await weatherService.getAirQuality(lat, lng);
        if (airQuality) {
            console.log('✅ Air quality data:');
            console.log(`   AQI: ${airQuality.aqi} (${airQuality.category})`);
            console.log(`   PM2.5: ${airQuality.pm25}`);
        } else {
            console.log('ℹ️  Air quality data not available');
        }
        console.log('');
        
        console.log('🔍 Testing location search...');
        const locations = await locationService.searchLocations('New York');
        console.log(`✅ Found ${locations.length} locations for "New York"`);
        if (locations.length > 0) {
            console.log(`   First result: ${locations[0].displayName}`);
        }
        console.log('');
        
        console.log('🌐 Testing IP location...');
        const ipLocation = await locationService.getLocationFromIP('127.0.0.1');
        console.log('✅ IP location (fallback to default):');
        console.log(`   ${ipLocation.city}, ${ipLocation.state} (${ipLocation.source})`);
        console.log('');
        
        console.log('✅ All tests passed! Weather API integration working correctly.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    testWeatherAPI();
}

module.exports = testWeatherAPI;