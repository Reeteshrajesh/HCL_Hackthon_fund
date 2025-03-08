# Use an official Node.js runtime as a parent image
FROM node:18

# Set working directory in the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the backend port
EXPOSE 8000

# Start the application
CMD ["node", "server.js"]

