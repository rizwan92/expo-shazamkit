# React Native Apple ShazamKit

ShazamKit for React Native with iOS and Android support

## Preview

https://user-images.githubusercontent.com/30924086/229935589-ef3e60ae-10f0-4e0d-aebf-a0ce06d8dba2.mov

# Installation

```sh
npm install react-native-apple-shazamkit
```

or

```sh
yarn add react-native-apple-shazamkit
```

## Platform Support

This library supports:
- ✅ iOS (15.0+)
- ✅ Android (API 21+)
- ✅ Expo (managed workflow)
- ✅ React Native (bare workflow)

For bare React Native projects, you must ensure that you have [installed and configured the `expo` package](https://docs.expo.dev/bare/installing-expo-modules/) before continuing.

## Configuration for iOS 🍏

> This is only required for usage in bare React Native apps.

Run `npx pod-install` after installing the npm package.

Add the following to your `Info.plist`:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>$(PRODUCT_NAME) would like to access your microphone</string>
```

ShazamKit is only available on iOS 15.0 and above. You'll need to set your deployment target to iOS 15.0 or above.

## Configuration for Android 🤖

Add the following permissions to your `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.INTERNET" />
```

Android support requires API level 21 (Android 5.0) or above.

## Activate the ShazamKit service

On your apple developer account page, under `Certificates, Identifiers & Profiles` select `Identifiers`. If you have already created an identifier for your app, select it. If not, create a new one. Under `App Services` enable `ShazamKit`.

### Plugin Configuration

You need to request access to the microphone to record audio. You can use the plugin to set the message you would like or use the default `Allow $(PRODUCT_NAME) to access your microphone`.

Also, you will need to set the deployment target to iOS 15.0 or above for iOS. You can do this by installing `expo-build-properties`

`app.json`

```json
{
  "plugins": [
    [
      "react-native-apple-shazamkit",
      {
        "microphonePermission": "Your permission message"
      }
    ],
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

## Usage

```ts
import * as Linking from "expo-linking";
import * as ReactNativeAppleShazamKit from "react-native-apple-shazamkit";

// ...
const [searching, setSearching] = useState(false);
const [song, setSong] = useState<MatchedItem | null>(null);

const startListening = async () => {
  try {
    if (song) {
      setSong(null);
    }

    setSearching(true);
    const result = await ReactNativeAppleShazamKit.startListening();
    if (result.length > 0) {
      setSong(result[0]);
    } else {
      Alert.alert("No Match", "No songs found");
    }

    setSearching(false);
  } catch (error: any) {
    if (error instanceof Error) {
      Alert.alert("Error", error.message);
    }
    setSearching(false);
  }
};

<View>
  {song && (
    <View style={styles.song}>
      <Image
        source={{ uri: song.artworkURL }}
        style={{
          width: 150,
          height: 150,
        }}
      />
      <View style={{ alignItems: "center", gap: 10 }}>
        <Text style={{ fontSize: 22, fontWeight: "bold" }}>{song.title}</Text>
        <Text style={{ fontSize: 18, textAlign: "center", fontWeight: "600" }}>
          {song.artist}
        </Text>

        <View style={{ flexDirection: "row" }}>
          <Button
            title="Apple Music"
            onPress={() => Linking.openURL(song.appleMusicURL ?? "")}
          />
          <Button
            title="Shazam"
            onPress={() => Linking.openURL(song.webURL ?? "")}
          />
        </View>
        <Button title="Add to Shazam Library" onPress={addToShazamLibrary} />
      </View>
    </View>
  )}
  <Button title="Start listening" onPress={startListening} />
</View>;
```

### Available methods

| Name                 | iOS | Android | Description                                                                                               |
| -------------------- | --- | ------- | --------------------------------------------------------------------------------------------------------- |
| `isAvailable`        | ✅   | ✅       | Returns a boolean indicating if the library is available on the current platform                          |
| `startListening`     | ✅   | ✅       | async. Returns an array of matches. Usually only contains a single item                                   |
| `stopListening`      | ✅   | ✅       | Stop the recording                                                                                        |
| `addToShazamLibrary` | ✅   | ❌       | async. Adds the most recently discovered item to the users Shazam library. returns `{ success: boolean }` (iOS only) |

### Platform-specific Notes

**iOS:**
- Full ShazamKit API support
- Add to Shazam Library functionality
- Requires iOS 15.0+
- Apple Music integration

**Android:**
- Audio recognition using Shazam's audio fingerprinting
- Basic song identification
- Requires Android API 21+ (Android 5.0)
- No Shazam Library integration (platform limitation)

# Contributing

Contributions are welcome!
