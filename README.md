# 🎵 React Native Apple ShazamKit

[![npm version](https://badge.fury.io/js/react-native-apple-shazamkit.svg)](https://badge.fury.io/js/react-native-apple-shazamkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey.svg)](https://github.com/rizwan92/expo-shazamkit)

A powerful React Native Expo module that brings Apple's ShazamKit audio recognition capabilities to your mobile applications. Identify music, get song metadata, and integrate with Apple Music seamlessly.

## 🎬 Preview

https://user-images.githubusercontent.com/30924086/229935589-ef3e60ae-10f0-4e0d-aebf-a0ce06d8dba2.mov

## ✨ Features

- 🎤 **Real-time Audio Recognition** - Identify songs playing around you
- 🎵 **Rich Metadata** - Get song title, artist, artwork, and more
- 🍎 **Apple Music Integration** - Direct links to Apple Music
- 📚 **Shazam Library** - Add discoveries to user's Shazam library
- 🔧 **Cross-platform** - Works on both iOS and Android
- ⚡ **TypeScript Support** - Full type definitions included
- 🎯 **Expo Compatible** - Works with Expo managed and bare workflows

## 📋 Requirements

- **iOS**: 15.0+ (ShazamKit requirement)
- **Android**: API 21+ (Android 5.0+)
- **Expo SDK**: 49+
- **React Native**: 0.70+

## 📦 Installation

```bash
npx expo install react-native-apple-shazamkit
```

For bare React Native projects, ensure you have [installed and configured the `expo` package](https://docs.expo.dev/bare/installing-expo-modules/) before continuing.

## ⚙️ Setup & Configuration

### iOS Configuration 🍏

#### 1. Update iOS Deployment Target

ShazamKit requires iOS 15.0+. Update your deployment target:

**Using expo-build-properties (Recommended):**

```json
{
  "plugins": [
    [
      "expo-build-properties",
      {
        "ios": {
          "deploymentTarget": "15.0"
        },
        "android": {
          "minSdkVersion": 21
        }
      }
    ]
  ]
}
```

**For bare React Native projects:**
Update `ios/Podfile`:

```ruby
platform :ios, '15.0'
```

#### 2. Enable ShazamKit Service

1. Go to [Apple Developer Console](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles** → **Identifiers**
3. Select your app identifier (or create a new one)
4. Under **App Services**, enable **ShazamKit**
5. Save your changes

#### 3. Add Microphone Permission

**Using the plugin (Recommended):**

```json
{
  "plugins": [
    [
      "react-native-apple-shazamkit",
      {
        "microphonePermission": "This app needs microphone access to identify music"
      }
    ]
  ]
}
```

**Manual setup for bare React Native:**
Add to `ios/YourApp/Info.plist`:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app needs microphone access to identify music</string>
```

#### 4. Install iOS Dependencies

```bash
npx pod-install
```

### Android Configuration 🤖

#### 1. Add Microphone Permission

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

#### 2. Request Runtime Permission

```typescript
import { Platform } from "react-native";
import { request, PERMISSIONS, RESULTS } from "react-native-permissions";

const requestMicrophonePermission = async () => {
  if (Platform.OS === "android") {
    const result = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
    return result === RESULTS.GRANTED;
  }
  return true; // iOS handles this automatically
};
```

## 🚀 Quick Start

```typescript
import React, { useState } from "react";
import { View, Button, Text, Image, Alert } from "react-native";
import * as Linking from "expo-linking";
import * as ShazamKit from "react-native-apple-shazamkit";

export default function App() {
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState(null);

  const handleIdentifyMusic = async () => {
    try {
      // Check if ShazamKit is available
      if (!(await ShazamKit.isAvailable())) {
        Alert.alert("Error", "ShazamKit is not available on this device");
        return;
      }

      setIsListening(true);
      setResult(null);

      // Start listening for audio
      const matches = await ShazamKit.startListening();

      if (matches.length > 0) {
        setResult(matches[0]);
      } else {
        Alert.alert("No Match", "Could not identify the song");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsListening(false);
    }
  };

  const addToLibrary = async () => {
    if (result) {
      const response = await ShazamKit.addToShazamLibrary();
      Alert.alert(
        response.success ? "Success" : "Error",
        response.success
          ? "Added to Shazam library!"
          : "Failed to add to library",
      );
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      {result && (
        <View style={{ alignItems: "center", marginBottom: 30 }}>
          <Image
            source={{ uri: result.artworkURL }}
            style={{ width: 200, height: 200, borderRadius: 10 }}
          />
          <Text style={{ fontSize: 24, fontWeight: "bold", marginTop: 15 }}>
            {result.title}
          </Text>
          <Text style={{ fontSize: 18, color: "gray", marginBottom: 20 }}>
            {result.artist}
          </Text>

          <View style={{ flexDirection: "row", gap: 10 }}>
            {result.appleMusicURL && (
              <Button
                title="Open in Apple Music"
                onPress={() => Linking.openURL(result.appleMusicURL)}
              />
            )}
            <Button title="Add to Shazam" onPress={addToLibrary} />
          </View>
        </View>
      )}

      <Button
        title={isListening ? "Listening..." : "🎵 Identify Music"}
        onPress={handleIdentifyMusic}
        disabled={isListening}
      />
    </View>
  );
}
```

## 📖 API Reference

### Methods

#### `isAvailable(): Promise<boolean>`

Checks if ShazamKit is available on the current device.

```typescript
const available = await ShazamKit.isAvailable();
if (!available) {
  console.log("ShazamKit not available");
}
```

#### `startListening(): Promise<MatchedItem[]>`

Starts listening for audio and attempts to identify any music. Returns an array of matched songs.

```typescript
try {
  const matches = await ShazamKit.startListening();
  if (matches.length > 0) {
    console.log("Found song:", matches[0].title);
  }
} catch (error) {
  console.error("Recognition failed:", error);
}
```

#### `stopListening(): void`

Stops the audio recognition process.

```typescript
ShazamKit.stopListening();
```

#### `addToShazamLibrary(): Promise<{ success: boolean }>`

Adds the most recently identified song to the user's Shazam library.

```typescript
const result = await ShazamKit.addToShazamLibrary();
console.log("Added to library:", result.success);
```

### Types

#### `MatchedItem`

```typescript
interface MatchedItem {
  /** Song title */
  title?: string;

  /** Artist name */
  artist?: string;

  /** Unique Shazam identifier */
  shazamID?: string;

  /** Apple Music track ID */
  appleMusicID?: string;

  /** Apple Music URL */
  appleMusicURL?: string;

  /** Album artwork URL */
  artworkURL?: string;

  /** Array of genres */
  genres?: string[];

  /** Web URL (Shazam page) */
  webURL?: string;

  /** Song subtitle/album */
  subtitle?: string;

  /** Music video URL */
  videoURL?: string;

  /** Whether content is explicit */
  explicitContent?: boolean;

  /** Match offset in seconds */
  matchOffset?: number;
}
```

## 🎛️ Advanced Usage

### Error Handling

```typescript
import { ShazamKitError } from "react-native-apple-shazamkit";

try {
  const matches = await ShazamKit.startListening();
} catch (error) {
  if (error instanceof ShazamKitError) {
    switch (error.code) {
      case "PERMISSION_DENIED":
        // Handle microphone permission denied
        break;
      case "NOT_AVAILABLE":
        // Handle ShazamKit not available
        break;
      default:
        // Handle other errors
        break;
    }
  }
}
```

### Custom Recognition Duration

```typescript
// Listen for a specific duration (implementation may vary)
const listenWithTimeout = async (timeoutMs = 10000) => {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Recognition timeout")), timeoutMs),
  );

  try {
    const result = await Promise.race([
      ShazamKit.startListening(),
      timeoutPromise,
    ]);
    return result;
  } catch (error) {
    ShazamKit.stopListening();
    throw error;
  }
};
```

### Integration with Music Streaming Services

```typescript
const openInMusicApp = (song: MatchedItem) => {
  const musicApps = [
    { name: "Apple Music", url: song.appleMusicURL },
    { name: "Spotify", url: `spotify:search:${song.title} ${song.artist}` },
    {
      name: "YouTube Music",
      url: `https://music.youtube.com/search?q=${encodeURIComponent(
        `${song.title} ${song.artist}`,
      )}`,
    },
  ];

  // Show action sheet with music app options
  ActionSheetIOS.showActionSheetWithOptions(
    {
      options: ["Cancel", ...musicApps.map(app => app.name)],
      cancelButtonIndex: 0,
    },
    buttonIndex => {
      if (buttonIndex > 0) {
        const selectedApp = musicApps[buttonIndex - 1];
        Linking.openURL(selectedApp.url);
      }
    },
  );
};
```

## 🔧 Troubleshooting

### Common Issues

#### "ShazamKit is not available"

- Ensure iOS deployment target is 15.0+
- Verify ShazamKit is enabled in Apple Developer Console
- Check device compatibility (ShazamKit requires iOS 15.0+)

#### "Module was compiled with an incompatible version of Kotlin"

See our detailed [Compatibility Guide](./COMPATIBILITY.md) for Kotlin version issues.

#### Microphone permission issues

```typescript
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";

const checkMicrophonePermission = async () => {
  const permission =
    Platform.OS === "ios"
      ? PERMISSIONS.IOS.MICROPHONE
      : PERMISSIONS.ANDROID.RECORD_AUDIO;

  const result = await check(permission);

  if (result === RESULTS.DENIED) {
    const requestResult = await request(permission);
    return requestResult === RESULTS.GRANTED;
  }

  return result === RESULTS.GRANTED;
};
```

#### No matches found

- Ensure audio is clear and music is playing
- Check internet connectivity
- Verify the song is in Shazam's database
- Try listening for a longer duration

### Debug Mode

Enable debug logging to troubleshoot issues:

```typescript
// This is a conceptual example - actual implementation may vary
ShazamKit.setDebugMode(true);
```

## 📱 Platform Differences

| Feature                 | iOS                   | Android                  |
| ----------------------- | --------------------- | ------------------------ |
| Audio Recognition       | ✅ Native ShazamKit   | ✅ Custom Implementation |
| Apple Music Integration | ✅ Full Support       | ✅ Web Links             |
| Shazam Library          | ✅ Native Integration | ✅ Web Integration       |
| Offline Recognition     | ✅ Limited            | ❌ Requires Internet     |
| Background Recognition  | ✅ Supported          | ⚠️ Limited               |

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Setup

1. Clone the repository
2. Install dependencies: `yarn install`
3. Build the module: `yarn build`
4. Run the example: `cd example && yarn ios`

### Testing

```bash
yarn test
yarn lint
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Apple's ShazamKit framework
- The Expo team for the excellent module infrastructure
- All contributors and users of this library

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/rizwan92/expo-shazamkit/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/rizwan92/expo-shazamkit/discussions)
- 📖 **Documentation**: [Wiki](https://github.com/rizwan92/expo-shazamkit/wiki)
- 💬 **Community**: [Discord](https://discord.gg/expo)

---

Made with ❤️ by the React Native community
