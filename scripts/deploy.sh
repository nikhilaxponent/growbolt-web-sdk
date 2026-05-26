#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/deploy.sh <SERVER_USER> <SERVER_HOST> [SSH_PORT]
SERVER_USER=${1:-$SERVER_USER}
SERVER_HOST=${2:-$SERVER_HOST}
SSH_PORT=${3:-${SERVER_SSH_PORT:-22}}

if [ -z "$SERVER_USER" ] || [ -z "$SERVER_HOST" ]; then
  echo "Usage: $0 <SERVER_USER> <SERVER_HOST> [SSH_PORT]"
  exit 2
fi

APP_DIR=/var/www/growbolt-sdk
TMP=/tmp/growbolt_deploy

echo "Packing repo..."
rm -rf $TMP && mkdir -p $TMP
tar --exclude-vcs --exclude='node_modules' -czf $TMP/app.tgz .

echo "Copying to server..."
scp -P $SSH_PORT $TMP/app.tgz ${SERVER_USER}@${SERVER_HOST}:/tmp/

echo "Deploying on server..."
ssh -p $SSH_PORT ${SERVER_USER}@${SERVER_HOST} bash -s <<'EOF'
set -e
APP_DIR=/var/www/growbolt-sdk
mkdir -p $APP_DIR
cd $APP_DIR
tar -xzf /tmp/app.tgz -C $APP_DIR
docker build -t ghcr.io/nikhilaxponent/growbolt-sdk:latest .
docker rm -f growbolt-sdk || true
docker run -d --name growbolt-sdk -p 80:80 --restart unless-stopped ghcr.io/nikhilaxponent/growbolt-sdk:latest
EOF

echo "Cleaning local tmp..."
rm -rf $TMP

echo "Deployment complete."
