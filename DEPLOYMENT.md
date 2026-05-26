# SDK Deployment

This document covers deploying the `growbolt-web-sdk` to a Docker-enabled VPS, mirroring the FE deployment flow.

## Overview

- **Trigger**: Push to `main` branch
- **CI Job**: Builds Docker image and pushes to GHCR (`ghcr.io/nikhilaxponent/growbolt-sdk:latest`)
- **Deploy Job**: Runs after CI success; SCPs docker-compose and nginx config to server, then restarts services
- **Target Server**: 157.230.85.31, `/var/www/growbolt-sdk`
- **Subdomain**: `sdk.growbolt.ai` (reverse proxied via nginx on port 80 → container on port 5001)

## Required GitHub Secrets

Set these in the repository settings under **Secrets and variables > Actions**:

- `SERVER_HOST` = `157.230.85.31`
- `SERVER_USER` = `root`
- `SERVER_SSH_KEY` = (private SSH key, ed25519 or RSA)
- `SERVER_SSH_PORT` = `22`
- `VITE_API_URL` = `https://admin.growbolt.ai/api/`
- `VITE_PUBLIC_URL` = `/`

## Files

- `.github/workflows/deploy.yml` — CI/CD pipeline (build, push, deploy)
- `deploy/nginx/growbolt.conf` — Nginx reverse-proxy config (proxies `sdk.growbolt.ai:80` → container `:5001`)
- `docker-compose.yml` — Runs the SDK container on port 5001
- `Dockerfile` — Multi-stage build (Node → nginx:stable-alpine)

## Manual Deployment (if needed)

```bash
# Build and save image locally
npm ci
VITE_API_URL="https://admin.growbolt.ai/api/" VITE_PUBLIC_URL="/" npm run build
docker build -t growbolt-sdk:local -f Dockerfile .
docker save growbolt-sdk:local -o growbolt-sdk.tar

# Transfer to server
scp -P 22 growbolt-sdk.tar root@157.230.85.31:/tmp/

# On server: load, tag, and run
ssh -p 22 root@157.230.85.31 <<EOF
  docker load -i /tmp/growbolt-sdk.tar
  docker tag growbolt-sdk:local ghcr.io/nikhilaxponent/growbolt-sdk:latest
  cd /var/www/growbolt-sdk
  docker compose up -d --remove-orphans
EOF
```

## Monitoring & Troubleshooting

- Check Actions logs: https://github.com/nikhilaxponent/growbolt-web-sdk/actions
- SSH to server and check:
  - Container status: `docker ps | grep growbolt-sdk`
  - Logs: `docker logs -f growbolt-sdk`
  - Nginx: `sudo systemctl status nginx` or `sudo nginx -t`
- Test locally (with Host header): `curl -H "Host: sdk.growbolt.ai" http://157.230.85.31:80/`
