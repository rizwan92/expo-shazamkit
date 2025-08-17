#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Find the root project directory
function findProjectRoot() {
  let dir = process.cwd();
  while (dir !== "/") {
    if (fs.existsSync(path.join(dir, "package.json"))) {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(dir, "package.json"), "utf8"),
      );
      // Check if this is the main project (not node_modules)
      if (!dir.includes("node_modules")) {
        return dir;
      }
    }
    dir = path.dirname(dir);
  }
  return process.cwd();
}

// Copy AAR file to the main project
function copyAARFile() {
  try {
    const projectRoot = findProjectRoot();
    const sourceAAR = path.join(
      __dirname,
      "android",
      "libs",
      "shazamkit-android-release.aar",
    );
    const targetDir = path.join(projectRoot, "android", "app", "libs");
    const targetAAR = path.join(targetDir, "shazamkit-android-release.aar");

    // Check if we're in a React Native project
    if (!fs.existsSync(path.join(projectRoot, "android", "app"))) {
      console.log("⚠️  No Android project found. Skipping AAR copy.");
      return;
    }

    // Create libs directory if it doesn't exist
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Copy the AAR file
    if (fs.existsSync(sourceAAR)) {
      fs.copyFileSync(sourceAAR, targetAAR);
      console.log("✅ ShazamKit Android AAR copied successfully");

      // Update build.gradle if needed
      updateBuildGradle(projectRoot);
    } else {
      console.error("❌ Source AAR file not found:", sourceAAR);
    }
  } catch (error) {
    console.error("❌ Error copying AAR file:", error.message);
  }
}

// Update build.gradle to include the AAR dependency
function updateBuildGradle(projectRoot) {
  try {
    const buildGradlePath = path.join(
      projectRoot,
      "android",
      "app",
      "build.gradle",
    );

    if (!fs.existsSync(buildGradlePath)) {
      console.log(
        "⚠️  build.gradle not found. Please manually add the dependency.",
      );
      return;
    }

    let buildGradleContent = fs.readFileSync(buildGradlePath, "utf8");

    // Check if the dependency is already added
    if (buildGradleContent.includes("shazamkit-android-release.aar")) {
      console.log("✅ ShazamKit dependency already exists in build.gradle");
      return;
    }

    // Find the dependencies block and add the AAR dependency
    const dependenciesRegex = /(dependencies\s*\{[^}]*)(})/s;
    const match = buildGradleContent.match(dependenciesRegex);

    if (match) {
      const newDependency =
        "    implementation files('libs/shazamkit-android-release.aar')\n";
      const updatedContent = buildGradleContent.replace(
        dependenciesRegex,
        match[1] + newDependency + match[2],
      );

      fs.writeFileSync(buildGradlePath, updatedContent);
      console.log("✅ Added ShazamKit dependency to build.gradle");
    } else {
      console.log(
        "⚠️  Could not find dependencies block in build.gradle. Please manually add:",
      );
      console.log(
        "    implementation files('libs/shazamkit-android-release.aar')",
      );
    }
  } catch (error) {
    console.error("❌ Error updating build.gradle:", error.message);
  }
}

// Run the script
if (require.main === module) {
  copyAARFile();
}

module.exports = { copyAARFile, updateBuildGradle };
