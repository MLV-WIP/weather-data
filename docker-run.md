# Docker Deployment Guide

## Quick Start

### Using Docker Compose (Recommended)
```bash
# Build and start the container
npm run docker:compose

# Or manually:
docker-compose up --build
```

The weather app will be available at: **http://localhost:8080**

### Stop the container
```bash
npm run docker:compose:down

# Or manually:
docker-compose down
```

## Manual Docker Commands

### Build the image
```bash
npm run docker:build

# Or manually:
docker build -t local-weather-app .
```

### Run the container
```bash
npm run docker:run

# Or manually:
docker run -p 8080:3000 local-weather-app
```

### Run with environment variables
```bash
docker run -p 8080:3000 -e NODE_ENV=production -e PORT=3000 local-weather-app
```

## Container Features

### Port Mapping
- **Container Port**: 3000 (internal)
- **Host Port**: 8080 (external)
- **Access URL**: http://localhost:8080

### Health Checks
- Automatic health monitoring every 30 seconds
- Tests weather API endpoint for responsiveness
- Container restarts if health checks fail

### Security Features
- Non-root user execution (`weather` user)
- Minimal base image (node:18-slim)
- Production-only dependencies

### Environment Variables
- `NODE_ENV`: Set to `production` for optimal performance
- `PORT`: Container port (default: 3000)

## Development vs Production

### Development (Current setup)
```bash
npm run dev  # Local development with nodemon
```

### Production (Docker)
```bash
docker-compose up --build  # Containerized production
```

## Customization

### Custom Background Images
Uncomment the volume mount in `docker-compose.yml`:
```yaml
volumes:
  - "./custom-backgrounds:/app/public/assets/backgrounds"
```

### Custom Port
Change the port mapping in `docker-compose.yml`:
```yaml
ports:
  - "9000:3000"  # Access via http://localhost:9000
```

## Troubleshooting

### Container logs
```bash
docker-compose logs weather-app
```

### Enter container for debugging
```bash
docker-compose exec weather-app sh
```

### Clean up Docker resources
```bash
npm run docker:clean
```

### Rebuild from scratch
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

## Container Specifications

- **Base Image**: node:18-slim
- **Container Size**: ~150MB
- **Memory Usage**: ~50-100MB
- **Startup Time**: ~5-10 seconds
- **Health Check**: Weather API endpoint test