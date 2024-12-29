# Use Node.js v23.3.0 image
FROM node:23.3.0-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and yarn.lock (if exists) files to the container
COPY package.json yarn.lock ./

# Install dependencies using yarn (you can also use npm if you prefer)
RUN yarn install

# Copy the rest of the app files to the container
COPY . .

# Expose the port for the Vite development server
EXPOSE 5173

# Command to run the frontend app in development mode
CMD ["yarn", "dev"]
