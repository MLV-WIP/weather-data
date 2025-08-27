class BackgroundService {
    constructor() {
        // Map weather conditions to base filenames (without variant numbers)
        this.backgroundMapping = {
            clear: {
                day: 'sunny-blue-sky',
                night: 'starry-night'
            },
            partly_cloudy: {
                day: 'partly-cloudy-day',
                night: 'cloudy-night'
            },
            cloudy: {
                day: 'overcast-clouds',
                night: 'cloudy-night'
            },
            light_rain: {
                day: 'heavy-rain',
                night: 'heavy-rain'
            },
            rain: {
                day: 'heavy-rain',
                night: 'heavy-rain'
            },
            heavy_rain: {
                day: 'heavy-rain',
                night: 'heavy-rain'
            },
            thunderstorm: {
                day: 'lightning-storm',
                night: 'lightning-storm'
            },
            light_snow: {
                day: 'gentle-snowfall',
                night: 'gentle-snowfall'
            },
            snow: {
                day: 'heavy-snow',
                night: 'heavy-snow'
            },
            heavy_snow: {
                day: 'heavy-snow',
                night: 'heavy-snow'
            },
            fog: {
                day: 'misty-fog',
                night: 'misty-fog'
            },
            mist: {
                day: 'morning-mist',
                night: 'morning-mist'
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
        
        // Number of variants available for each image type
        this.imageVariants = 4; // We have 4 variants per condition
    }
    
    getRandomVariant() {
        // Generate random number between 1 and 4
        return Math.floor(Math.random() * this.imageVariants) + 1;
    }
    
    getBackgroundForWeather(condition, isDay = true, season = null) {
        const timeOfDay = isDay ? 'day' : 'night';
        const normalizedCondition = condition.toLowerCase();
        
        // Check for exact match
        if (this.backgroundMapping[normalizedCondition]) {
            const baseFilename = this.backgroundMapping[normalizedCondition][timeOfDay] ||
                               this.backgroundMapping[normalizedCondition]['day'];
            
            // Add random variant number
            const variant = this.getRandomVariant();
            const backgroundFile = `${baseFilename}-${variant}.jpg`;
            
            return {
                type: 'image',
                source: `/assets/backgrounds/${backgroundFile}`,
                fallback: this.fallbackGradients[normalizedCondition] || this.fallbackGradients.clear,
                variant: variant,
                baseCondition: baseFilename
            };
        }
        
        // Check for partial matches
        for (const [key, value] of Object.entries(this.backgroundMapping)) {
            if (normalizedCondition.includes(key) || key.includes(normalizedCondition)) {
                const baseFilename = value[timeOfDay] || value['day'];
                const variant = this.getRandomVariant();
                const backgroundFile = `${baseFilename}-${variant}.jpg`;
                
                return {
                    type: 'image',
                    source: `/assets/backgrounds/${backgroundFile}`,
                    fallback: this.fallbackGradients[key] || this.fallbackGradients.clear,
                    variant: variant,
                    baseCondition: baseFilename
                };
            }
        }
        
        // Default fallback
        const defaultBase = this.backgroundMapping.clear[timeOfDay];
        const variant = this.getRandomVariant();
        const backgroundFile = `${defaultBase}-${variant}.jpg`;
        
        return {
            type: 'image',
            source: `/assets/backgrounds/${backgroundFile}`,
            fallback: this.fallbackGradients.clear,
            variant: variant,
            baseCondition: defaultBase
        };
    }
    
    getAvailableBackgrounds() {
        const backgrounds = [];
        
        for (const [condition, timeVariants] of Object.entries(this.backgroundMapping)) {
            for (const [timeOfDay, baseFilename] of Object.entries(timeVariants)) {
                // Add all 4 variants for this condition/time combination
                for (let variant = 1; variant <= this.imageVariants; variant++) {
                    backgrounds.push({
                        condition,
                        timeOfDay,
                        variant,
                        filename: `${baseFilename}-${variant}.jpg`,
                        path: `/assets/backgrounds/${baseFilename}-${variant}.jpg`
                    });
                }
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
    
    // New method to get all variants for a specific condition
    getAllVariantsForCondition(condition, isDay = true) {
        const timeOfDay = isDay ? 'day' : 'night';
        const normalizedCondition = condition.toLowerCase();
        
        if (this.backgroundMapping[normalizedCondition]) {
            const baseFilename = this.backgroundMapping[normalizedCondition][timeOfDay] ||
                               this.backgroundMapping[normalizedCondition]['day'];
            
            const variants = [];
            for (let i = 1; i <= this.imageVariants; i++) {
                variants.push({
                    variant: i,
                    filename: `${baseFilename}-${i}.jpg`,
                    path: `/assets/backgrounds/${baseFilename}-${i}.jpg`
                });
            }
            return variants;
        }
        
        return [];
    }
}

module.exports = new BackgroundService();