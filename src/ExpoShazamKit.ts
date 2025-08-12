import { NativeModulesProxy } from "expo-modules-core";

export default NativeModulesProxy.ExpoShazamKit || {
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
