#!/bin/bash

# AR/VR Integration Dependencies Installation Script
# This script installs all necessary packages for AR/VR implementation

echo "Installing AR/VR dependencies for Event Venue Generator..."

# Install Three.js and React Three Fiber
npm install three @types/three @react-three/fiber @react-three/drei

# Install WebXR dependencies
npm install @react-three/xr

# Install QR code dependencies
npm install qrcode.react

# Update package.json with AR/VR dependencies
echo "Updating package.json..."

# Create or update .env file with necessary AR/VR configuration
echo "Configuring environment variables..."
cat > .env.ar-vr << EOL
# AR/VR Configuration
REACT_APP_ENABLE_AR_VR=true
REACT_APP_AR_MARKER_PATTERN_URL=/markers/pattern-marker.patt
REACT_APP_DEFAULT_MODEL_SCALE=0.1
EOL

# Copy AR/VR environment variables to .env file if it exists
if [ -f .env ]; then
  cat .env.ar-vr >> .env
  echo "Added AR/VR configuration to existing .env file"
else
  mv .env.ar-vr .env
  echo "Created new .env file with AR/VR configuration"
fi

# Create necessary directories
mkdir -p public/models
mkdir -p public/markers
mkdir -p public/images/demo

# Download sample assets
echo "Downloading sample assets for AR/VR demos..."

# Make image directories if they don't exist
mkdir -p public/images/demo

# Create placeholder images if they don't exist
echo "Creating placeholder images..."
for image in wedding-hall conference-center concert-venue placeholder-venue; do
  if [ ! -f "public/images/demo/${image}.jpg" ]; then
    touch "public/images/demo/${image}.jpg"
    echo "Created placeholder for ${image}.jpg"
  fi
done

echo "AR/VR dependencies installation complete!"
echo "You can now use the AR/VR features in the Event Venue Generator app."
echo "Remember to update the placeholder images with real images before deployment." 