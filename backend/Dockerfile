# backend/Dockerfile
FROM node:23.3.0-alpine

WORKDIR /app

# Copy package.json and yarn.lock first to leverage Docker cache
COPY package.json ./

# Install dependencies
RUN yarn install

COPY yarn.lock ./

# Copy the rest of the application
COPY . .

# Expose port and start backend app
EXPOSE 8000
CMD ["yarn", "dev"]
