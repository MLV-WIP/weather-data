class BackgroundService {
    constructor() {
        this.backgroundMapping = {
            clear: {
                day: 'sunny-blue-sky.jpg',
                night: 'starry-night.jpg'
            },
            partly_cloudy: {
                day: 'partly-cloudy-day.jpg',
                night: 'cloudy-night.jpg'
            },
            cloudy: {
                day: 'overcast-clouds.jpg',
                night: 'overcast-night.jpg'
            },
            light_rain: {
                day: 'light-rain.jpg',
                night: 'light-rain-night.jpg'
            },
            rain: {
                day: 'heavy-rain.jpg',
                night: 'heavy-rain.jpg'
            },
            heavy_rain: {
                day: 'heavy-rain.jpg',
                night: 'heavy-rain.jpg'
            },
            thunderstorm: {
                day: 'lightning-storm.jpg',
                night: 'lightning-storm.jpg'
            },
            light_snow: {
                day: 'gentle-snowfall.jpg',
                night: 'gentle-snowfall.jpg'
            },
            snow: {
                day: 'heavy-snow.jpg',
                night: 'heavy-snow.jpg'
            },
            heavy_snow: {
                day: 'heavy-snow.jpg',
                night: 'heavy-snow.jpg'
            },
            fog: {
                day: 'misty-fog.jpg',
                night: 'misty-fog.jpg'
            },
            mist: {
                day: 'morning-mist.jpg',
                night: 'morning-mist.jpg'
            }
        };
        
        this.fallbackGradients = {
            clear: 'linear-gradient(180deg, #87CEEB, #98D8E8)',
            cloudy: 'linear-gradient(180deg, #606c88, #3f4c6b)',
            rain: 'linear-gradient(180deg, #4B79A1, #283E51)',
            snow: 'linear-gradient(180deg, #e6f3ff, #b8d4f0)',
            thunderstorm: 'linear-gradient(180deg, #2c3e50, #4a6741)',
            fog: 'linear-gradient(180deg, #bdc3c7, #95a5a6)'
        };
    }
    
    getBackgroundForWeather(condition, isDay = true, season = null) {
        const timeOfDay = isDay ? 'day' : 'night';
        const normalizedCondition = condition.toLowerCase();
        
        // Check for exact match
        if (this.backgroundMapping[normalizedCondition]) {
            const backgroundFile = this.backgroundMapping[normalizedCondition][timeOfDay] ||
                                 this.backgroundMapping[normalizedCondition]['day'];
            
            return {
                type: 'image',
                source: `/assets/backgrounds/${backgroundFile}`,
                fallback: this.fallbackGradients[normalizedCondition] || this.fallbackGradients.clear
            };
        }
        
        // Check for partial matches
        for (const [key, value] of Object.entries(this.backgroundMapping)) {
            if (normalizedCondition.includes(key) || key.includes(normalizedCondition)) {
                const backgroundFile = value[timeOfDay] || value['day'];
                return {
                    type: 'image',
                    source: `/assets/backgrounds/${backgroundFile}`,
                    fallback: this.fallbackGradients[key] || this.fallbackGradients.clear
                };
            }
        }
        
        // Default fallback
        return {
            type: 'image',
            source: `/assets/backgrounds/${this.backgroundMapping.clear[timeOfDay]}`,
            fallback: this.fallbackGradients.clear
        };
    }
    
    getAvailableBackgrounds() {
        const backgrounds = [];
        
        for (const [condition, timeVariants] of Object.entries(this.backgroundMapping)) {
            for (const [timeOfDay, filename] of Object.entries(timeVariants)) {
                backgrounds.push({
                    condition,
                    timeOfDay,
                    filename,
                    path: `/assets/backgrounds/${filename}`
                });
            }
        }
        
        return backgrounds;
    }
    
    validateBackgroundExists(backgroundPath) {
        const fs = require('fs');
        const path = require('path');
        
        const fullPath = path.join(__dirname, '..', 'public', backgroundPath);
        return fs.existsSync(fullPath);
    }
}

module.exports = new BackgroundService();