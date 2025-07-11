import { requireNativeModule } from "expo-modules-core";

const nativeModule = requireNativeModule("ExpoShazamKit");

export default nativeModule || {
  isAvailable(): boolean {
    return false;
  },

  hello(): string {
    return "Hello from fallback implementation";
  },

  helloWithName(name: string): string {
    return `Hello ${name} from fallback implementation`;
  },

  startListening() {},

  stopListening() {},

  addToShazamLibrary() {
    return { success: false };
  },

  addListener() {
    // Nothing to do; unsupported platform.
    return Promise.resolve();
  },

  removeListeners() {
    // Nothing to do; unsupported platform.
    return Promise.resolve();
  },
};
