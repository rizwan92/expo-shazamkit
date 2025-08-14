# Compatibility Guide

## Kotlin Version Compatibility

This module is designed to be compatible with different Kotlin versions used across different Expo SDK versions.

### Supported Configurations

- **Expo SDK 51+**: Uses Kotlin 2.x (automatic compatibility)
- **Expo SDK 50 and below**: Uses Kotlin 1.9.x (automatic compatibility)

### Troubleshooting Kotlin Version Issues

If you encounter an error like:

```
Module was compiled with an incompatible version of Kotlin. The binary version of its metadata is X.X.X, expected version is Y.Y.Y
```

This indicates a Kotlin version mismatch. Here are the solutions:

#### Solution 1: Update Expo SDK (Recommended)

Update to the latest Expo SDK version:

```bash
npx expo install --fix
```

#### Solution 2: Override Kotlin Version

Add this to your `android/build.gradle` (project level):

```gradle
buildscript {
    ext.kotlinVersion = "1.9.23" // or your desired version
}
```

#### Solution 3: Clean and Rebuild

```bash
cd android
./gradlew clean
cd ..
npx expo run:android
```

### Version Compatibility Matrix

| Expo SDK | Kotlin Version | Module Version |
| -------- | -------------- | -------------- |
| 53+      | 2.1.x          | 1.0.3+         |
| 51-52    | 2.0.x          | 1.0.3+         |
| 50       | 1.9.x          | 1.0.3+         |
| 49       | 1.9.x          | 1.0.2-         |

### Need Help?

If you continue to experience compatibility issues, please:

1. Check your Expo SDK version: `expo --version`
2. Check your Kotlin version in `android/build.gradle`
3. Open an issue with your configuration details
