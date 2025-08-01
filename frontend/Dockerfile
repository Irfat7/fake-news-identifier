# Step 1: Build the app
FROM node:20 AS build

WORKDIR /app
COPY . .

# Install dependencies and build
RUN npm install
RUN npm run build

# Step 2: Serve the app using a lightweight web server
FROM nginx:alpine

# Remove default nginx config
RUN rm -rf /usr/share/nginx/html/*

# Copy built app from previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config (optional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]