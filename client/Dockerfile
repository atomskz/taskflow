# --- Build stage: compile the React app with Vite ---
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies (use the lockfile when present for reproducible builds).
COPY package*.json ./
RUN npm install

# Build. VITE_API_URL is empty so the app calls same-origin '/api', which nginx
# proxies to the backend (see nginx.conf).
COPY . .
RUN npm run build

# --- Runtime stage: serve static files + reverse-proxy the API via nginx ---
FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
