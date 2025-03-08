# Use Node.js to build the frontend
FROM node:18 AS build

# Set working directory in the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Build the React app
RUN npm run build

# Use Nginx to serve the built frontend
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

# Expose the port used by Nginx
EXPOSE 3000

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]

