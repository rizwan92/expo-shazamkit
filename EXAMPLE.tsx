import React, { useEffect, useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Button,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as ShazamKit from "react-native-apple-shazamkit";
import { check, PERMISSIONS, request, RESULTS } from "react-native-permissions";

interface MatchedItem {
  title?: string;
  artist?: string;
  shazamID?: string;
  appleMusicID?: string;
  appleMusicURL?: string;
  artworkURL?: string;
  genres?: string[];
  webURL?: string;
  subtitle?: string;
  videoURL?: string;
  explicitContent?: boolean;
  matchOffset?: number;
}

const ShazamExample: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<MatchedItem | null>(null);
  const [history, setHistory] = useState<MatchedItem[]>([]);
  const [isAvailable, setIsAvailable] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string>("checking");

  useEffect(() => {
    checkAvailabilityAndPermissions();
  }, []);

  const checkAvailabilityAndPermissions = async () => {
    try {
      // Check if ShazamKit is available
      const available = await ShazamKit.isAvailable();
      setIsAvailable(available);

      if (available) {
        // Check microphone permission
        const permission =
          Platform.OS === "ios"
            ? PERMISSIONS.IOS.MICROPHONE
            : PERMISSIONS.ANDROID.RECORD_AUDIO;

        const result = await check(permission);
        setPermissionStatus(result);
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      setIsAvailable(false);
    }
  };

  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      const permission =
        Platform.OS === "ios"
          ? PERMISSIONS.IOS.MICROPHONE
          : PERMISSIONS.ANDROID.RECORD_AUDIO;

      let result = await check(permission);

      if (result === RESULTS.DENIED) {
        result = await request(permission);
      }

      setPermissionStatus(result);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error("Permission request failed:", error);
      return false;
    }
  };

  const handleStartListening = async () => {
    try {
      if (!isAvailable) {
        Alert.alert("Error", "ShazamKit is not available on this device");
        return;
      }

      // Check and request permission if needed
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        Alert.alert(
          "Permission Required",
          "Microphone access is required to identify music",
        );
        return;
      }

      setIsListening(true);
      setCurrentMatch(null);

      // Add timeout for better UX
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Recognition timeout")), 15000),
      );

      const listenPromise = ShazamKit.startListening();

      const matches = await Promise.race([listenPromise, timeoutPromise]);

      if (matches && matches.length > 0) {
        const match = matches[0];
        setCurrentMatch(match);
        setHistory(prev => [match, ...prev.slice(0, 9)]); // Keep last 10 items

        // Show success feedback
        Alert.alert(
          "Song Identified!",
          `${match.title || "Unknown"} by ${match.artist || "Unknown Artist"}`,
          [
            { text: "OK" },
            ...(match.appleMusicURL
              ? [
                  {
                    text: "Open in Apple Music",
                    onPress: () => openInAppleMusic(match),
                  },
                ]
              : []),
          ],
        );
      } else {
        Alert.alert(
          "No Match",
          "Could not identify the song. Make sure music is playing clearly.",
        );
      }
    } catch (error: any) {
      console.error("Recognition error:", error);

      let errorMessage = "An unknown error occurred";
      if (error.message.includes("timeout")) {
        errorMessage = "Recognition timed out. Please try again.";
      } else if (error.message.includes("permission")) {
        errorMessage = "Microphone permission is required to identify music";
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Recognition Failed", errorMessage);
    } finally {
      setIsListening(false);
    }
  };

  const handleStopListening = () => {
    ShazamKit.stopListening();
    setIsListening(false);
  };

  const addToShazamLibrary = async () => {
    if (!currentMatch) {
      Alert.alert("Error", "No song to add to library");
      return;
    }

    try {
      const result = await ShazamKit.addToShazamLibrary();
      Alert.alert(
        result.success ? "Success!" : "Failed",
        result.success
          ? "Song added to your Shazam library"
          : "Could not add song to library",
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add to library");
    }
  };

  const openInAppleMusic = (song: MatchedItem) => {
    if (song.appleMusicURL) {
      Linking.openURL(song.appleMusicURL);
    }
  };

  const openInShazam = (song: MatchedItem) => {
    if (song.webURL) {
      Linking.openURL(song.webURL);
    }
  };

  const showMusicAppOptions = (song: MatchedItem) => {
    const searchQuery = encodeURIComponent(
      `${song.title || ""} ${song.artist || ""}`,
    );
    const options = [
      "Cancel",
      ...(song.appleMusicURL ? ["Apple Music"] : []),
      "Spotify",
      "YouTube Music",
      ...(song.webURL ? ["Shazam"] : []),
    ];

    const urls = [
      ...(song.appleMusicURL ? [song.appleMusicURL] : []),
      `spotify:search:${searchQuery}`,
      `https://music.youtube.com/search?q=${searchQuery}`,
      ...(song.webURL ? [song.webURL] : []),
    ];

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 0,
        },
        buttonIndex => {
          if (buttonIndex > 0) {
            const urlIndex = buttonIndex - 1;
            if (urls[urlIndex]) {
              Linking.openURL(urls[urlIndex]);
            }
          }
        },
      );
    } else {
      // Android implementation would need a different approach
      Alert.alert(
        "Open in...",
        "Select a music app",
        urls
          .map((url, index) => ({
            text: options[index + 1],
            onPress: () => Linking.openURL(url),
          }))
          .concat([{ text: "Cancel", style: "cancel" }]),
      );
    }
  };

  const renderSongCard = (song: MatchedItem, isMain = false) => (
    <View style={[styles.songCard, isMain && styles.mainSongCard]}>
      {song.artworkURL && (
        <Image
          source={{ uri: song.artworkURL }}
          style={[styles.artwork, isMain && styles.mainArtwork]}
        />
      )}
      <View style={styles.songInfo}>
        <Text
          style={[styles.title, isMain && styles.mainTitle]}
          numberOfLines={2}
        >
          {song.title || "Unknown Title"}
        </Text>
        <Text
          style={[styles.artist, isMain && styles.mainArtist]}
          numberOfLines={1}
        >
          {song.artist || "Unknown Artist"}
        </Text>
        {song.subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {song.subtitle}
          </Text>
        )}
        {song.genres && song.genres.length > 0 && (
          <Text style={styles.genres}>{song.genres.join(", ")}</Text>
        )}
        {isMain && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => showMusicAppOptions(song)}
            >
              <Text style={styles.actionButtonText}>Open in...</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.libraryButton]}
              onPress={addToShazamLibrary}
            >
              <Text style={styles.actionButtonText}>Add to Library</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  if (!isAvailable) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>
            ShazamKit is not available on this device
          </Text>
          <Text style={styles.errorSubtext}>
            Requires iOS 15.0+ or Android 5.0+
          </Text>
          <Button title="Retry" onPress={checkAvailabilityAndPermissions} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎵 Music Identifier</Text>
        <Text style={styles.headerSubtitle}>Powered by ShazamKit</Text>
      </View>

      <View style={styles.listenSection}>
        {isListening ? (
          <View style={styles.listeningContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.listeningText}>Listening for music...</Text>
            <Button title="Stop" onPress={handleStopListening} />
          </View>
        ) : (
          <TouchableOpacity
            style={styles.listenButton}
            onPress={handleStartListening}
          >
            <Text style={styles.listenButtonText}>🎤 Start Listening</Text>
          </TouchableOpacity>
        )}
      </View>

      {currentMatch && (
        <View style={styles.currentMatchSection}>
          <Text style={styles.sectionTitle}>Current Match</Text>
          {renderSongCard(currentMatch, true)}
        </View>
      )}

      {history.length > 0 && (
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>
            Recent Discoveries ({history.length})
          </Text>
          {history.map((song, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => showMusicAppOptions(song)}
            >
              {renderSongCard(song)}
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.statusSection}>
        <Text style={styles.statusTitle}>Status</Text>
        <Text style={styles.statusText}>
          ShazamKit: {isAvailable ? "✅ Available" : "❌ Not Available"}
        </Text>
        <Text style={styles.statusText}>
          Microphone:{" "}
          {permissionStatus === RESULTS.GRANTED
            ? "✅ Granted"
            : "❌ Not Granted"}
        </Text>
        <Text style={styles.statusText}>
          Platform: {Platform.OS} {Platform.Version}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    padding: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  listenSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  listeningContainer: {
    alignItems: "center",
    padding: 20,
  },
  listeningText: {
    fontSize: 18,
    marginVertical: 15,
    color: "#007AFF",
  },
  listenButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  listenButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  currentMatchSection: {
    marginBottom: 30,
  },
  historySection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  songCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mainSongCard: {
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  artwork: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  mainArtwork: {
    width: 80,
    height: 80,
  },
  songInfo: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  mainTitle: {
    fontSize: 20,
  },
  artist: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  mainArtist: {
    fontSize: 16,
  },
  subtitle: {
    fontSize: 12,
    color: "#999",
    marginBottom: 2,
  },
  genres: {
    fontSize: 11,
    color: "#007AFF",
    fontStyle: "italic",
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
  },
  actionButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  libraryButton: {
    backgroundColor: "#34C759",
  },
  actionButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  statusSection: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  statusText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
});

export default ShazamExample;
