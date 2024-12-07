# Use the official Node.js LTS image
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src/app

# Install dependencies (only package.json and package-lock.json are needed)
COPY package*.json ./
RUN npm install

# Expose the application port
EXPOSE 3000

# Command to start the application
CMD ["npm", "start"]
