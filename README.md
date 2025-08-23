# Local Weather App

A beautiful, responsive weather application that displays comprehensive weather data with dynamic background images that reflect current weather conditions. The app runs locally and provides detailed 7-day forecasts with temperature, precipitation, humidity, and air quality information.

## Features

### 🌤️ Weather Data
- **Current Conditions**: Real-time temperature, weather conditions, wind speed
- **7-Day Forecast**: Daily high/low temperatures, precipitation chance, humidity
- **Air Quality**: AQI readings and health categories (when available)
- **Auto-refresh**: Updates every 30 minutes automatically

### 🎨 Dynamic Vintage Backgrounds
- **Weather-responsive**: Background changes based on current conditions
- **Vintage Aesthetic**: Beautiful old-timey, sepia-toned backgrounds
- **Period Elements**: Antique suns, cross-shaped stars, vintage cloud formations
- **Aged Effects**: Paper textures, vignetting, and sepia color palettes
- **Smooth Transitions**: Beautiful fade effects between weather changes
- **Fallback System**: CSS gradients when images aren't available

### 📱 User Experience
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Location Services**: GPS, IP-based location, or manual search
- **Fast Loading**: Cached API responses and optimized assets
- **Offline Graceful**: Handles network issues with cached data
- **Accessibility**: WCAG compliant with keyboard navigation

### 🔧 Technical Features
- **No API Keys Required**: Uses free Open-Meteo weather service
- **Local Development**: Runs entirely on your machine
- **Modern Tech Stack**: Node.js, Express, vanilla JavaScript
- **Caching System**: Smart caching reduces API calls and improves performance

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Modern web browser

### Installation
```bash
# Clone or download the project
cd weather-app

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Production
```bash
# Start in production mode
npm start
```

## Project Structure

```
weather-app/
├── server.js              # Express server
├── package.json           # Dependencies and scripts
├── public/               # Frontend files
│   ├── index.html        # Main HTML
│   ├── styles.css        # Responsive CSS
│   ├── script.js         # Frontend JavaScript
│   └── assets/           # Images and icons
├── src/                  # Backend services
│   ├── weather.service.js    # Weather API integration
│   ├── location.service.js   # Location handling
│   ├── background.service.js # Dynamic backgrounds
│   └── cache.service.js      # Data caching
├── test/                 # Test files
├── DESIGN.md            # Design documentation
└── IMPLEMENTATION.md    # Technical implementation guide
```

## Configuration

### Environment Variables (Optional)
Create a `.env` file:
```env
PORT=3000
NODE_ENV=development
```

### Background Images
Add weather background images to `public/assets/backgrounds/`:
- Images should be 1920x1080 pixels, ~200KB each
- See `public/assets/backgrounds/placeholder.txt` for required filenames
- The app works without images using gradient fallbacks

## API Endpoints

### Weather Data
- `GET /api/weather/current?lat={lat}&lng={lng}` - Current weather + background
- `GET /api/weather/forecast?lat={lat}&lng={lng}&days={days}` - Multi-day forecast

### Location Services  
- `GET /api/location/search?query={query}` - Search locations
- `GET /api/location/ip` - Get location from IP address

## Usage

### Location Detection
1. **GPS Location** - Requests browser geolocation (most accurate)
2. **IP Location** - Falls back to IP-based city detection  
3. **Manual Search** - Search for any city/location
4. **Default Location** - Seattle, WA as final fallback

### Changing Location
- Click the 📍 button next to the location name
- Search for cities, states, or countries
- Click "Use My Location" for GPS
- Recent searches are remembered

### Keyboard Shortcuts
- `Escape` - Close modals and error messages
- `Ctrl/Cmd + R` - Refresh weather data

## Testing

```bash
# Test weather API integration
npm test

# Or run specific test
node test/test-weather-api.js
```

## Deployment

### Local Network Access
To access from other devices on your network:
```bash
# Find your local IP address
ifconfig | grep inet

# Start server binding to all interfaces
PORT=3000 node server.js
# Then access via http://YOUR_LOCAL_IP:3000
```

### Production Deployment
```bash
# Using PM2 process manager
npm install -g pm2
pm2 start server.js --name "weather-app"
pm2 startup
pm2 save
```

## Data Sources

- **Weather Data**: [Open-Meteo](https://open-meteo.com/) - Free weather API
- **Geocoding**: [Nominatim](https://nominatim.org/) - OpenStreetMap geocoding  
- **IP Location**: [ipapi.co](https://ipapi.co/) - IP geolocation service

All services are free and don't require API keys for basic usage.

## Browser Support

- **Modern Browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Mobile**: iOS Safari 12+, Chrome Mobile 60+
- **Features Used**: Geolocation API, Fetch API, CSS Grid, Flexbox

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Guidelines
- Follow existing code style
- Add tests for new features  
- Update documentation
- Ensure responsive design works
- Test error handling scenarios

## License

MIT License - see LICENSE file for details

## Support

- Check the [Design Document](DESIGN.md) for architectural details
- Review the [Implementation Guide](IMPLEMENTATION.md) for technical specifics
- Run tests to verify your setup: `npm test`
- Check browser console for debugging information

## Troubleshooting

### Common Issues

**"Failed to fetch weather data"**
- Check internet connection
- Verify coordinates are valid numbers
- Check browser console for detailed errors

**Location not working**  
- Allow location permission in browser
- Try manual search instead
- Check if GPS is enabled on device

**Images not loading**
- Add background images to `public/assets/backgrounds/`
- App works with gradient fallbacks if images missing
- Check image file names match expected format

**Server won't start**
- Ensure port 3000 is available
- Check Node.js version (needs v16+)
- Run `npm install` to install dependencies