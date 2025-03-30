#!/bin/bash
set -e  # Exit immediately if any command fails

# Explicitly set Node.js version (alternative method)
export NODE_VERSION=18.16.0
echo "Using Node.js $NODE_VERSION"

# Define the environment file path
ENV_FILE="src/environments/environment.prod.ts"

# Create directory if it doesn't exist
mkdir -p src/environments

# Create environment.prod.ts with placeholders if it doesn't exist
if [ ! -f "$ENV_FILE" ]; then
  echo "Creating $ENV_FILE with placeholders..."
  cat > "$ENV_FILE" << 'EOL'
export const environment = {
  production: true,
  mapbox: {
    accessToken: 'MAPBOX_TOKEN',
  },
  firebase: {
    apiKey: 'FIREBASE_API_KEY',
    authDomain: 'FIREBASE_AUTH_DOMAIN',
    projectId: 'FIREBASE_PROJECT_ID',
    storageBucket: 'FIREBASE_STORAGE_BUCKET',
    messagingSenderId: 'FIREBASE_MESSAGING_SENDER_ID',
    appId: 'FIREBASE_APP_ID',
    measurementId: 'FIREBASE_MEASUREMENT_ID',
    vapidKey: 'FIREBASE_VAPID_KEY'
  }
};
EOL
fi

# Replace all placeholders with environment variables
sed -i "s|MAPBOX_TOKEN|${MAPBOX_ACCESS_TOKEN:-MISSING_MAPBOX_TOKEN}|g" "$ENV_FILE"

sed -i "s|FIREBASE_API_KEY|${FIREBASE_API_KEY:-MISSING_FIREBASE_API_KEY}|g" "$ENV_FILE"
sed -i "s|FIREBASE_AUTH_DOMAIN|${FIREBASE_AUTH_DOMAIN:-MISSING_FIREBASE_AUTH_DOMAIN}|g" "$ENV_FILE"
sed -i "s|FIREBASE_PROJECT_ID|${FIREBASE_PROJECT_ID:-MISSING_FIREBASE_PROJECT_ID}|g" "$ENV_FILE"
sed -i "s|FIREBASE_STORAGE_BUCKET|${FIREBASE_STORAGE_BUCKET:-MISSING_FIREBASE_STORAGE_BUCKET}|g" "$ENV_FILE"
sed -i "s|FIREBASE_MESSAGING_SENDER_ID|${FIREBASE_MESSAGING_SENDER_ID:-MISSING_FIREBASE_MESSAGING_SENDER_ID}|g" "$ENV_FILE"
sed -i "s|FIREBASE_APP_ID|${FIREBASE_APP_ID:-MISSING_FIREBASE_APP_ID}|g" "$ENV_FILE"
sed -i "s|FIREBASE_MEASUREMENT_ID|${FIREBASE_MEASUREMENT_ID:-MISSING_FIREBASE_MEASUREMENT_ID}|g" "$ENV_FILE"
sed -i "s|FIREBASE_VAPID_KEY|${FIREBASE_VAPID_KEY:-MISSING_FIREBASE_VAPID_KEY}|g" "$ENV_FILE"

# Build with production configuration
echo "Building Angular application..."
npm run build -- --configuration=production