# Use a Node base image
FROM node:latest as build

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the project files into the container
COPY . .

# Build the project
RUN npm run build

# Use Nginx to serve the static files
FROM nginx:alpine

# Remove the default Nginx configuration file
RUN rm /etc/nginx/conf.d/default.conf

# Copy the modified Nginx configuration file
COPY default.conf /etc/nginx/conf.d/

# Copy the build output to replace the default nginx contents.
COPY --from=build /usr/src/app/dist/frontend/browser /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx and keep it running
CMD ["nginx", "-g", "daemon off;"]
