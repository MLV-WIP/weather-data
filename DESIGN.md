# Weather App Design Document

## Project Overview

A local weather web application that displays comprehensive weather information with dynamic rotating background imagery that reflects current weather conditions. The app runs on a local web server and provides 5-10 day forecasts with rich data visualization. The application is fully containerized using Docker for easy deployment and consistent runtime environments across development and production systems.

## Design Goals

### Primary Objectives
- **Immersive Experience**: Dynamic rotating backgrounds that change with weather conditions
- **Comprehensive Data**: Temperature, precipitation, humidity, air quality for 5-10 days
- **Local Server**: Runs locally on available port with containerized deployment
- **Responsive Design**: Works seamlessly across all device sizes
- **Real-time Updates**: Current conditions with regular data refreshes
- **Containerization**: Docker-based deployment for consistency and portability

### User Experience Goals
- **Intuitive Navigation**: Minimal learning curve
- **Visual Appeal**: Beautiful, weather-appropriate imagery
- **Performance**: Fast loading and smooth transitions
- **Accessibility**: High contrast ratios and readable text
- **Reliability**: Graceful fallbacks for all failure scenarios

## Architecture Overview

### Tech Stack
- **Backend**: Node.js + Express
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **API**: Open-Meteo (free, unlimited weather data)
- **Containerization**: Docker + Docker Compose
- **Base Image**: node:18-slim (security-optimized)
- **Additional Libraries**: 
  - Axios (HTTP requests)
  - Chart.js (data visualization)
  - Node-cron (optional caching)

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Browser       │    │ Docker Container│    │  Open-Meteo API│
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │  Frontend   │◄├────┤ │ Express App │◄├────┤ │ Weather API │ │
│ │  (UI/UX)    │ │    │ │  (Port 3000)│ │    │ │    Data     │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Geolocation │ │    │ │ Background  │ │    │ │   Geocoding │ │
│ │   Service   │ │    │ │ Rotation    │ │    │ │   Service   │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                       Host Port 8080
```

### Docker Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Host System                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Docker Container                       │   │
│  │                                                     │   │
│  │  ┌─────────────┐  ┌─────────────────────────────┐   │   │
│  │  │ Node.js App │  │    Static Assets            │   │   │
│  │  │ (Port 3000) │  │                             │   │   │
│  │  │             │  │  ┌─────────────────────────┐ │   │   │
│  │  │  Express    │  │  │  Background Images      │ │   │   │
│  │  │  Server     │  │  │  - 4 variants per       │ │   │   │
│  │  │             │  │  │    weather condition    │ │   │   │
│  │  │  Weather    │  │  │  - Rotation logic       │ │   │   │
│  │  │  Services   │  │  └─────────────────────────┘ │   │   │
│  │  └─────────────┘  └─────────────────────────────┘   │   │
│  │                                                     │   │
│  │  Security: Non-root user 'weather'                 │   │
│  │  Health Check: /api/weather/current endpoint       │   │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                               │
│                    Port Mapping 8080:3000                  │
└─────────────────────────────────────────────────────────────┘
```

## Docker Container Design

### Container Architecture Decisions

#### Base Image Selection: node:18-slim
- **Rationale**: Minimal attack surface while maintaining Node.js compatibility
- **Size**: ~100MB smaller than full node:18 image
- **Security**: Reduced package count minimizes vulnerability exposure
- **Performance**: Faster container startup and image pulls

#### Security Hardening
```dockerfile
# Non-root user execution
RUN groupadd -r weather && useradd -r -g weather weather
USER weather

# Workdir permissions
WORKDIR /usr/src/app
COPY --chown=weather:weather . .

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/weather/current?lat=47.6062&lng=-122.3321'..."
```

#### Container Design Principles
- **Single Responsibility**: One service per container (Express app only)
- **Immutable Infrastructure**: Container recreated for updates, not modified
- **Stateless Design**: No persistent data stored in container
- **Health Monitoring**: Built-in health checks for container orchestration
- **Resource Efficiency**: Optimized for minimal memory and CPU footprint

### Docker Compose Orchestration

#### Service Configuration
```yaml
services:
  weather-app:
    build: .
    ports:
      - "8080:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/weather/current?lat=47.6062&lng=-122.3321"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped
```

#### Network Architecture
- **Custom Bridge Network**: Isolated network for security
- **Port Mapping**: Host 8080 → Container 3000
- **Service Discovery**: Container accessible via service name
- **External Access**: Only exposed port accessible from host

#### Volume Strategy
- **No Persistent Volumes**: Stateless application design
- **Asset Delivery**: Static assets served from container filesystem
- **Image Storage**: Background images bundled in container image
- **Configuration**: Environment-based configuration only

### Deployment Workflow

#### Build Process
```bash
# Multi-stage build for optimization
FROM node:18-slim as dependencies
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-slim as runtime
COPY --from=dependencies node_modules ./node_modules
COPY . .
```

#### Container Lifecycle
1. **Image Build**: Dockerfile creates optimized image with dependencies
2. **Container Start**: Docker Compose launches container with health checks
3. **Service Ready**: Health check validates API endpoint accessibility
4. **Runtime**: Application serves requests with rotating background logic
5. **Updates**: Container recreation for deployments (blue-green pattern)

#### Production Considerations
- **Resource Limits**: CPU and memory constraints via Docker Compose
- **Logging**: Structured logging to stdout for container log aggregation
- **Monitoring**: Health checks integrate with orchestration platforms
- **Scaling**: Horizontal scaling possible via Docker Compose replicas
- **Security**: Non-root execution and minimal attack surface

### Container Integration with Background Rotation

#### Static Asset Management
- **Image Bundling**: All 36 background images included in container
- **Asset Serving**: Express serves static files from `/public/assets`
- **Caching Strategy**: Browser caching enabled, server-side rotation
- **Container Size**: Optimized image compression maintains reasonable size

#### Runtime Behavior
- **Rotation Logic**: Executed within container on each API request
- **No External Dependencies**: Self-contained background selection
- **Performance**: In-memory variant selection for fast response times
- **Consistency**: Same rotation logic across container instances

## User Interface Design

### Layout Structure

#### Desktop Layout (>1024px)
```
┌─────────────────────────────────────────────────────────────┐
│                    Header (App Title, Location)            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────────────────────────────┐  │
│  │   Current   │  │        5-10 Day Forecast            │  │
│  │   Weather   │  │                                     │  │
│  │             │  │ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐     │  │
│  │ Temperature │  │ │Day 1│ │Day 2│ │Day 3│ │Day 4│     │  │
│  │ Conditions  │  │ └─────┘ └─────┘ └─────┘ └─────┘     │  │
│  │ Humidity    │  │ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐     │  │
│  │ Air Quality │  │ │Day 5│ │Day 6│ │Day 7│ │Day 8│     │  │
│  └─────────────┘  │ └─────┘ └─────┘ └─────┘ └─────┘     │  │
│                   └─────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│              Footer (Refresh, Settings)                    │
└─────────────────────────────────────────────────────────────┘
```

#### Mobile Layout (<768px)
```
┌─────────────────────┐
│     Header          │
├─────────────────────┤
│                     │
│   Current Weather   │
│   ┌───────────────┐ │
│   │  Temperature  │ │
│   │  Conditions   │ │
│   │  Humidity     │ │
│   │  Air Quality  │ │
│   └───────────────┘ │
│                     │
│   Forecast Cards    │
│   ┌─────────────────┐ │
│   │     Day 1       │ │
│   └─────────────────┘ │
│   ┌─────────────────┐ │
│   │     Day 2       │ │
│   └─────────────────┘ │
│   ┌─────────────────┐ │
│   │     Day 3       │ │
│   └─────────────────┘ │
│        ...            │
├─────────────────────┤
│      Footer         │
└─────────────────────┘
```

### Color Scheme & Typography

#### Dynamic Color System
- **Primary**: Adapts to background brightness
- **Secondary**: Weather-condition specific accents
- **Text**: High contrast with dynamic shadows
- **Backgrounds**: Semi-transparent glass-morphism panels

#### Typography
- **Primary Font**: System font stack (SF Pro, Segoe UI, Roboto)
- **Temperature**: Light weight, large scale (4rem desktop, 3rem mobile)
- **Body Text**: Regular weight, optimal reading size (16px minimum)
- **Labels**: Medium weight for hierarchy

### Dynamic Background System

#### Rotating Image System
The application implements a sophisticated image rotation system that displays different background images for the same weather condition on each page refresh, enhancing user engagement and visual variety.

#### Weather Condition Mapping with Rotation
```javascript
const backgroundMapping = {
  // Clear conditions (4 variants each)
  clear_day: ['sunny-blue-sky-1.jpg', 'sunny-blue-sky-2.jpg', 'sunny-blue-sky-3.jpg', 'sunny-blue-sky-4.jpg'],
  clear_night: ['starry-night-1.jpg', 'starry-night-2.jpg', 'starry-night-3.jpg', 'starry-night-4.jpg'],
  
  // Cloudy conditions (4 variants each)
  partly_cloudy_day: ['partly-cloudy-day-1.jpg', 'partly-cloudy-day-2.jpg', 'partly-cloudy-day-3.jpg', 'partly-cloudy-day-4.jpg'],
  cloudy: ['overcast-clouds-1.jpg', 'overcast-clouds-2.jpg', 'overcast-clouds-3.jpg', 'overcast-clouds-4.jpg'],
  
  // Precipitation (4 variants each)
  rain: ['heavy-rain-1.jpg', 'heavy-rain-2.jpg', 'heavy-rain-3.jpg', 'heavy-rain-4.jpg'],
  thunderstorm: ['lightning-storm-1.jpg', 'lightning-storm-2.jpg', 'lightning-storm-3.jpg', 'lightning-storm-4.jpg'],
  snow: ['heavy-snow-1.jpg', 'heavy-snow-2.jpg', 'heavy-snow-3.jpg', 'heavy-snow-4.jpg'],
  
  // Atmospheric (4 variants each)
  fog: ['misty-fog-1.jpg', 'misty-fog-2.jpg', 'misty-fog-3.jpg', 'misty-fog-4.jpg'],
  mist: ['morning-mist-1.jpg', 'morning-mist-2.jpg', 'morning-mist-3.jpg', 'morning-mist-4.jpg']
};
```

#### Rotation Logic Implementation
```javascript
// Background service handles variant selection
class BackgroundService {
  constructor() {
    this.imageVariants = 4; // Number of variants per condition
  }
  
  getRandomVariant() {
    return Math.floor(Math.random() * this.imageVariants) + 1;
  }
  
  getBackgroundForWeather(condition, isDay = true, season = null) {
    const variant = this.getRandomVariant();
    const backgroundFile = `${baseFilename}-${variant}.jpg`;
    return {
      type: 'image',
      source: `/assets/backgrounds/${backgroundFile}`,
      variant: variant,
      baseCondition: baseFilename
    };
  }
}
```

#### Background Characteristics
- **Format**: High-quality JPEG images
- **Resolution**: 1920x1080 optimized for various screen sizes
- **File Size**: ~200-300KB each for optimal loading balance
- **Variants**: 4 unique images per weather condition (36 total images)
- **Selection**: Pseudo-random rotation on each API request
- **Transition**: 1.5s smooth fade between different images
- **Fallback**: CSS gradients when images fail to load
- **Caching**: Browser-cached for performance, rotated server-side

## Data Models

### Weather Data Structure
```javascript
// Current Weather with Background Rotation
{
  temperature: number,        // Current temperature (°F/°C)
  conditions: string,         // "sunny", "cloudy", "rain", etc.
  humidity: number,          // Humidity percentage
  timestamp: string,         // ISO 8601 timestamp
  location: {
    latitude: number,
    longitude: number,
    city: string,
    state: string
  },
  backgroundImage: {         // Dynamic background rotation
    type: 'image',
    source: string,          // "/assets/backgrounds/overcast-clouds-3.jpg"
    fallback: string,        // CSS gradient fallback
    variant: number,         // 1-4, current variant selection
    baseCondition: string    // "overcast-clouds" base filename
  },
  locationInfo: {            // Reverse geocoded location name
    city: string,            // "Seattle"
    state: string,           // "Washington"
    country: string          // "United States"
  }
}

// Daily Forecast
{
  date: string,              // YYYY-MM-DD
  tempMin: number,           // Low temperature
  tempMax: number,           // High temperature
  conditions: string,        // Weather condition
  precipitationChance: number, // Precipitation probability (0-100)
  humidity: number,          // Average humidity
  airQuality: {              // Optional - if available
    aqi: number,             // Air Quality Index
    pm25: number,            // PM2.5 particles
    pm10: number,            // PM10 particles
    category: string         // "Good", "Moderate", etc.
  }
}
```

## Location Services

### Location Priority Hierarchy
1. **User's Current GPS** (highest accuracy)
2. **Saved User Preference** (localStorage)
3. **IP-based Geolocation** (city-level accuracy)
4. **Manual Search Input** (user-specified)
5. **Default Location** (Seattle, WA: 47.6062, -122.3321)

### Location UI Components
- **Location Display**: Shows current location with accuracy indicator
- **Change Location Button**: Prominent, always accessible
- **Search Interface**: Autocomplete with recent searches
- **GPS Button**: "Use My Location" quick action

## API Integration

### Open-Meteo API Endpoints
- **Current Weather**: `/v1/current_weather`
- **Forecast**: `/v1/forecast`
- **Air Quality**: `/v1/air_quality`
- **Historical**: `/v1/archive` (optional)

### Rate Limiting & Caching
- **API Calls**: No limits (Open-Meteo is free)
- **Caching Strategy**: 
  - Current weather: 10 minutes
  - Forecast data: 1 hour
  - Location data: 24 hours
- **Refresh Logic**: Auto-refresh + manual refresh button

## Performance Considerations

### Loading Strategy
- **Critical Path**: Location → Current Weather → UI Render
- **Progressive Enhancement**: Show basic data first, enhance with forecast
- **Background Loading**: Preload next weather condition images
- **Lazy Loading**: Non-critical forecast days

### Optimization Techniques
- **Image Compression**: WebP format with quality optimization
- **CSS/JS Minification**: Production build optimization
- **Caching Headers**: Aggressive caching for static assets
- **Service Worker**: Offline support for basic functionality

## Error Handling & Fallbacks

### Failure Scenarios
1. **API Unavailable**: Show cached data with offline indicator
2. **Location Denied**: Fall back to IP location or manual input
3. **Network Issues**: Offline mode with last known data
4. **Image Loading Fails**: CSS gradient backgrounds
5. **JavaScript Disabled**: Graceful degradation with basic HTML

### User Feedback
- **Loading States**: Skeleton screens and progress indicators
- **Error Messages**: Clear, actionable error descriptions
- **Retry Mechanisms**: Automatic retries with exponential backoff
- **Status Indicators**: Connection status, last update time

## Accessibility Features

### WCAG Compliance
- **Color Contrast**: Minimum 4.5:1 ratio for all text
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: Semantic HTML and ARIA labels
- **Focus Management**: Clear focus indicators

### Responsive Features
- **Touch Targets**: Minimum 44px for mobile interactions
- **Text Scaling**: Respects user's font size preferences
- **Motion Preferences**: Reduced motion support
- **High Contrast**: Enhanced contrast mode support

## Security Considerations

### Data Privacy
- **No Personal Data**: Only location coordinates stored locally
- **Local Storage**: Weather preferences in browser only
- **No Tracking**: No analytics or user tracking
- **HTTPS Only**: Secure connections for all external requests

### API Security
- **No API Keys**: Open-Meteo requires no authentication
- **CORS Policy**: Proper cross-origin request handling
- **Input Validation**: Sanitize all user inputs
- **Rate Limiting**: Prevent abuse of server resources

## Future Enhancement Opportunities

### Advanced Features
- **Weather Alerts**: Push notifications for severe weather
- **Multiple Locations**: Save and switch between favorite locations
- **Historical Data**: Weather trends and historical comparisons
- **Weather Maps**: Radar and satellite imagery integration
- **Seasonal Background Themes**: Background selection based on calendar seasons

### Personalization
- **Theme Preferences**: Custom color schemes beyond weather-based themes
- **Unit Preferences**: Celsius/Fahrenheit, metric/imperial toggles
- **Background Preferences**: User control over image rotation frequency
- **Widget Mode**: Compact display options for embedding

### Technical Improvements
- **Progressive Web App**: Offline functionality and app-like experience
- **Real-time Updates**: WebSocket connections for live weather data
- **Advanced Caching**: Smart cache invalidation and preloading strategies
- **Performance Monitoring**: Real user monitoring and analytics
- **Container Orchestration**: Kubernetes deployment for production scale
- **Image CDN**: External CDN for background images to reduce container size

### Implemented Features ✅
- **Dynamic Backgrounds**: ✅ Rotating background images (4 variants per condition)
- **Docker Deployment**: ✅ Full containerization with Docker Compose
- **Location Services**: ✅ Reverse geocoding for descriptive location names
- **Responsive Design**: ✅ Mobile-first responsive interface
- **Caching System**: ✅ Multi-layer caching for performance