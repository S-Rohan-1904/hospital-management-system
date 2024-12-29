# Use Node.js v23.3.0 image
FROM node:23.3.0-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and yarn.lock (if exists) files to the container
COPY package.json yarn.lock ./

# Install dependencies using yarn
RUN yarn install

# Copy the rest of the app files to the container
COPY . .

# Expose the backend server port (default for Express is 5000)
EXPOSE 8000

# Command to run the backend app in development mode using nodemon
CMD ["yarn", "dev"]
