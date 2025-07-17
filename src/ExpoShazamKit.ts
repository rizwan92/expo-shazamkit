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

  startListening(developerToken: string): Promise<string> {
    return Promise.reject("Not implemented on this platform");
  },

  stopListening(): Promise<void> {
    return Promise.reject("Not implemented on this platform");
  },

  setValueAsync(value: string): Promise<void> {
    return Promise.reject("Not implemented on this platform");
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
