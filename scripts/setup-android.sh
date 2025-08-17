#!/bin/bash

# ShazamKit Android Setup Script
# This script helps copy the required AAR file and update build.gradle for bare React Native projects

set -e

echo "🎵 ShazamKit Android Setup"
echo "=========================="

# Check if we're in a React Native project
if [ ! -d "android/app" ]; then
    echo "❌ Error: This doesn't appear to be a React Native project."
    echo "   Make sure you're running this script from your project root."
    exit 1
fi

# Check if the AAR source file exists
AAR_SOURCE="node_modules/react-native-apple-shazamkit/android/libs/shazamkit-android-release.aar"
if [ ! -f "$AAR_SOURCE" ]; then
    echo "❌ Error: ShazamKit AAR file not found."
    echo "   Make sure react-native-apple-shazamkit is installed."
    exit 1
fi

# Create libs directory if it doesn't exist
mkdir -p android/app/libs

# Copy the AAR file
echo "📦 Copying ShazamKit AAR file..."
cp "$AAR_SOURCE" android/app/libs/

# Check if the dependency already exists in build.gradle
BUILD_GRADLE="android/app/build.gradle"
if grep -q "shazamkit-android-release.aar" "$BUILD_GRADLE"; then
    echo "✅ ShazamKit dependency already exists in build.gradle"
else
    echo "📝 Adding dependency to build.gradle..."
    
    # Create a backup
    cp "$BUILD_GRADLE" "$BUILD_GRADLE.backup"
    
    # Add the dependency to the dependencies block
    if grep -q "dependencies {" "$BUILD_GRADLE"; then
        # Use sed to add the dependency after the dependencies { line
        sed -i.tmp '/dependencies {/a\
    implementation files('\''libs/shazamkit-android-release.aar'\'')
' "$BUILD_GRADLE"
        rm "$BUILD_GRADLE.tmp"
        echo "✅ Added ShazamKit dependency to build.gradle"
        echo "📄 Backup created at: $BUILD_GRADLE.backup"
    else
        echo "⚠️  Could not find dependencies block in build.gradle"
        echo "   Please manually add: implementation files('libs/shazamkit-android-release.aar')"
    fi
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Clean your project: cd android && ./gradlew clean"
echo "2. Rebuild your project: yarn android"
echo ""
echo "If you encounter any issues, check the documentation:"
echo "https://github.com/rizwan92/expo-shazamkit#troubleshooting"
