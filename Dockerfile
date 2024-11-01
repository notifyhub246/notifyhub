# Use Node.js LTS as the base image
FROM node:lts

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port your app runs on (if your app runs on a specific port, replace 3000)
EXPOSE 3000

# Start the app
CMD ["node", "server.js"]
