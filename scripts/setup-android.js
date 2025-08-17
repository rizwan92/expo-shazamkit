#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 🎵 ShazamKit Android Setup Script
console.log('🎵 ShazamKit Android Setup');
console.log('==========================');

// Find the root project directory
function findProjectRoot() {
  let dir = process.cwd();
  while (dir !== '/' && dir !== '') {
    if (fs.existsSync(path.join(dir, 'package.json'))) {
      const packageJsonPath = path.join(dir, 'package.json');
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        // Check if this is the main project (not node_modules)
        if (!dir.includes('node_modules') && 
            (packageJson.dependencies || packageJson.devDependencies)) {
          return dir;
        }
      } catch (e) {
        // Continue searching if package.json is invalid
      }
    }
    dir = path.dirname(dir);
  }
  return process.cwd();
}

// Copy AAR file and update build.gradle
function setupAndroid() {
  try {
    const projectRoot = findProjectRoot();
    console.log(`📁 Project root: ${projectRoot}`);

    // Check if we're in a React Native project
    const androidAppDir = path.join(projectRoot, 'android', 'app');
    if (!fs.existsSync(androidAppDir)) {
      console.error('❌ Error: This doesn\'t appear to be a React Native project.');
      console.error('   Make sure you\'re running this script from your project root.');
      process.exit(1);
    }

    // Find the module's AAR file
    const moduleAAR = path.join(projectRoot, 'node_modules', 'react-native-apple-shazamkit', 'android', 'libs', 'shazamkit-android-release.aar');
    if (!fs.existsSync(moduleAAR)) {
      console.error('❌ Error: ShazamKit AAR file not found.');
      console.error('   Make sure react-native-apple-shazamkit is installed.');
      console.error(`   Expected location: ${moduleAAR}`);
      process.exit(1);
    }

    // Create libs directory and copy AAR
    const targetDir = path.join(projectRoot, 'android', 'app', 'libs');
    const targetAAR = path.join(targetDir, 'shazamkit-android-release.aar');

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log('📁 Created libs directory');
    }

    console.log('📦 Copying ShazamKit AAR file...');
    fs.copyFileSync(moduleAAR, targetAAR);
    console.log('✅ ShazamKit AAR copied successfully');

    // Update build.gradle
    updateBuildGradle(projectRoot);

    console.log('');
    console.log('🎉 Setup completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Clean your project: cd android && ./gradlew clean');
    console.log('2. Rebuild your project: yarn android (or npm run android)');
    console.log('');
    console.log('If you encounter any issues, check the documentation:');
    console.log('https://github.com/rizwan92/expo-shazamkit#troubleshooting');

  } catch (error) {
    console.error('❌ Error during setup:', error.message);
    process.exit(1);
  }
}

// Update build.gradle to include the AAR dependency
function updateBuildGradle(projectRoot) {
  try {
    const buildGradlePath = path.join(projectRoot, 'android', 'app', 'build.gradle');
    
    if (!fs.existsSync(buildGradlePath)) {
      console.log('⚠️  build.gradle not found. Please manually add the dependency.');
      console.log('   Add this line to your dependencies block:');
      console.log('   implementation files(\'libs/shazamkit-android-release.aar\')');
      return;
    }

    let buildGradleContent = fs.readFileSync(buildGradlePath, 'utf8');
    
    // Check if the dependency is already added
    if (buildGradleContent.includes('shazamkit-android-release.aar')) {
      console.log('✅ ShazamKit dependency already exists in build.gradle');
      return;
    }

    // Create backup
    const backupPath = `${buildGradlePath}.backup.${Date.now()}`;
    fs.writeFileSync(backupPath, buildGradleContent);
    console.log(`📄 Created backup: ${path.basename(backupPath)}`);

    // Find the dependencies block and add the AAR dependency
    const dependenciesRegex = /(dependencies\s*\{)/;
    const match = buildGradleContent.match(dependenciesRegex);
    
    if (match) {
      const newDependency = "\n    implementation files('libs/shazamkit-android-release.aar')";
      const updatedContent = buildGradleContent.replace(
        dependenciesRegex,
        match[1] + newDependency
      );
      
      fs.writeFileSync(buildGradlePath, updatedContent);
      console.log('✅ Added ShazamKit dependency to build.gradle');
    } else {
      console.log('⚠️  Could not find dependencies block in build.gradle.');
      console.log('   Please manually add this line to your dependencies block:');
      console.log('   implementation files(\'libs/shazamkit-android-release.aar\')');
    }
  } catch (error) {
    console.error('❌ Error updating build.gradle:', error.message);
    console.log('⚠️  Please manually add this line to your dependencies block:');
    console.log('   implementation files(\'libs/shazamkit-android-release.aar\')');
  }
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.length > 0 && args[0] === '--help') {
  console.log('');
  console.log('Usage: npx react-native-apple-shazamkit setup-android');
  console.log('');
  console.log('This script will:');
  console.log('1. Copy the ShazamKit Android AAR file to your app\'s libs directory');
  console.log('2. Add the required dependency to your app\'s build.gradle');
  console.log('');
  console.log('This is only required for bare React Native projects.');
  console.log('Expo managed projects handle this automatically.');
  process.exit(0);
}

// Run the setup
setupAndroid();
