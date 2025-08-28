# Local Weather App

A beautiful, responsive weather application that displays comprehensive weather data with dynamic rotating background images that reflect current weather conditions. Fully containerized with Docker for easy deployment, the app runs locally and provides detailed 7-day forecasts with temperature, precipitation, humidity, and air quality information.

## Features

### 🌤️ Weather Data
- **Current Conditions**: Real-time temperature, weather conditions, wind speed
- **7-Day Forecast**: Daily high/low temperatures, precipitation chance, humidity
- **Air Quality**: AQI readings and health categories (when available)
- **Auto-refresh**: Updates every 30 minutes automatically

### 🎨 Dynamic Rotating Backgrounds
- **Weather-responsive**: Background changes based on current conditions
- **Image Rotation**: 4 unique images per weather condition (36 total images)
- **Variety**: Different image on each refresh, even for same weather
- **High-Quality**: Professional stock photography optimized for web
- **Smart Selection**: Pseudo-random rotation for engaging user experience
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
- **Docker Ready**: Fully containerized with Docker Compose
- **Modern Tech Stack**: Node.js, Express, vanilla JavaScript
- **Caching System**: Smart caching reduces API calls and improves performance
- **Security Hardened**: Non-root container execution and health monitoring
- **Production Ready**: Optimized container builds and deployment workflows

## Quick Start

### Option 1: Docker (Recommended)
```bash
# Prerequisites: Docker and Docker Compose
# Clone or download the project
cd weather-app

# Start with Docker Compose
docker compose up --build
```

The app will be available at `http://localhost:8080`

### Option 2: Node.js Development
```bash
# Prerequisites: Node.js (v16 or higher)
# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Production
```bash
# Docker (recommended)
docker compose up -d

# Or Node.js
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
The app includes 36 high-quality stock images (4 variants per weather condition):
- **Format**: JPEG, optimized for web delivery
- **Resolution**: 1920x1080 pixels for various screen sizes
- **Rotation**: Server-side selection of random variants
- **Fallback**: CSS gradients when images fail to load
- **Container**: All images bundled in Docker container

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

### Docker Deployment (Recommended)
```bash
# Production deployment
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Rebuild and restart
docker compose up --build -d
```

### Local Network Access
Docker deployment is accessible on your local network at `http://YOUR_LOCAL_IP:8080`

### Traditional Node.js Deployment
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
- Ensure Docker container includes background assets
- App works with gradient fallbacks if images missing
- Check container logs: `docker compose logs weather-app`

**Server won't start**
- **Docker**: Ensure Docker is running and port 8080 is available
- **Node.js**: Ensure port 3000 is available and Node.js v16+
- Run `npm install` for Node.js or rebuild Docker container

**Container issues**
- Rebuild container: `docker compose build --no-cache`
- Check container health: `docker compose ps`
- View detailed logs: `docker compose logs -f weather-app`