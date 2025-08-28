# Use Node.js 18 slim base image for good balance of size and functionality
FROM node:18-slim

# Set working directory inside container
WORKDIR /app

# Create non-root user for security
RUN groupadd -r weather && useradd -r -g weather weather

# Copy package files first for better layer caching
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production --silent && \
    npm cache clean --force

# Copy application source code
COPY . .

# Copy pre-generated version file (should be created by generate-version.sh before build)

# Create necessary directories and set permissions
RUN mkdir -p public/assets/backgrounds && \
    chown -R weather:weather /app

# Switch to non-root user
USER weather

# Expose port 3000
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/weather/current?lat=47.6062&lng=-122.3321', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start the application
CMD ["node", "server.js"]