# Dockerfile for SoftAuth

# Use a lightweight Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Set build arguments and environment variables
ARG ADMIN_USER=admin
ARG ADMIN_PASSWORD=admin
ARG ADMIN_SALT=mysalt

ENV ADMIN_USER=${ADMIN_USER}
ENV ADMIN_PASSWORD=${ADMIN_PASSWORD}
ENV ADMIN_SALT=${ADMIN_SALT}

# Copy package manifests and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Update config.yaml with build args
RUN npm run update:config

# Build the Next.js application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD [ "npm", "start" ]
