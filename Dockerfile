FROM node:20-alpine AS build
WORKDIR /app

# install dependencies
COPY package*.json ./
# Use `npm install` when `package-lock.json` is not present (safer in CI/buildx)
RUN npm install --silent

# copy sources and build
COPY . .
ARG VITE_API_URL
ARG VITE_PUBLIC_URL=/
ENV VITE_API_URL=$VITE_API_URL VITE_PUBLIC_URL=$VITE_PUBLIC_URL
RUN npm run build

FROM nginx:stable-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY deploy/nginx/growbolt.conf /etc/nginx/conf.d/growbolt.conf

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
