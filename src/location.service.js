const axios = require('axios');

class LocationService {
    constructor() {
        this.defaultLocation = {
            latitude: 47.6062,
            longitude: -122.3321,
            city: 'Seattle',
            state: 'WA',
            country: 'US'
        };
    }
    
    async searchLocations(query) {
        try {
            const response = await axios.get('https://nominatim.openstreetmap.org/search', {
                params: {
                    q: query,
                    format: 'json',
                    limit: 5,
                    addressdetails: 1
                },
                headers: {
                    'User-Agent': 'LocalWeatherApp/1.0'
                }
            });
            
            return response.data.map(location => ({
                latitude: parseFloat(location.lat),
                longitude: parseFloat(location.lon),
                city: location.address?.city || location.address?.town || location.address?.village || '',
                state: location.address?.state || '',
                country: location.address?.country || '',
                displayName: location.display_name
            }));
            
        } catch (error) {
            console.error('Error searching locations:', error);
            throw new Error('Failed to search locations');
        }
    }
    
    async getLocationFromIP(ip) {
        try {
            // Handle local development IPs
            if (ip === '::1' || ip === '127.0.0.1' || ip?.startsWith('::ffff:127') || ip?.startsWith('::ffff:192.168')) {
                return {
                    ...this.defaultLocation,
                    source: 'default'
                };
            }

            const response = await axios.get(`https://ipapi.co/${ip}/json/`, {
                timeout: 5000
            });
            
            if (response.data.error) {
                throw new Error(response.data.reason);
            }
            
            return {
                latitude: response.data.latitude,
                longitude: response.data.longitude,
                city: response.data.city,
                state: response.data.region,
                country: response.data.country_name,
                source: 'ip'
            };
            
        } catch (error) {
            console.error('Error getting location from IP:', error);
            return {
                ...this.defaultLocation,
                source: 'default'
            };
        }
    }
    
    async reverseGeocode(latitude, longitude) {
        try {
            const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
                params: {
                    lat: latitude,
                    lon: longitude,
                    format: 'json',
                    addressdetails: 1
                },
                headers: {
                    'User-Agent': 'LocalWeatherApp/1.0'
                },
                timeout: 5000
            });
            
            const address = response.data.address;
            if (address) {
                return {
                    city: address.city || address.town || address.village || address.county,
                    state: address.state,
                    country: address.country
                };
            }
            
            return null;
            
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            return null;
        }
    }

    getDefaultLocation() {
        return {
            ...this.defaultLocation,
            source: 'default'
        };
    }
    
    validateCoordinates(latitude, longitude) {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        
        return !isNaN(lat) && 
               !isNaN(lng) && 
               lat >= -90 && 
               lat <= 90 && 
               lng >= -180 && 
               lng <= 180;
    }
}

module.exports = new LocationService();