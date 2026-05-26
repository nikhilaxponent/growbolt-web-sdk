# SDK Deployment

This document covers deploying the `growbolt-web-sdk` to a Docker-enabled VPS, mirroring the FE deployment flow.

Quick facts:
- Target server dir: `/var/www/growbolt-sdk`
- Subdomain: `sdk.growbolt.ai`
- Image: `ghcr.io/nikhilaxponent/growbolt-sdk:latest`

CI workflow builds a Docker image and pushes it to GHCR, then SSH deploy pulls the image on the server and runs `docker-compose`.

Add these GitHub secrets:
- `SERVER_HOST`
- `SERVER_USER`
- `SERVER_SSH_KEY` (private key)
- `SERVER_SSH_PORT` (optional)
- Optionally: `VITE_API_URL`, `VITE_PUBLIC_URL`

See `.github/workflows/deploy.yml` for CI details and `deploy/nginx/growbolt.conf` for nginx config.
