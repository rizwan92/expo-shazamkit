import ExpoShazamKit from "./ExpoShazamKit";
import { MatchedItem } from "./ExpoShazamKit.types";

export function isAvailable(): boolean {
  return ExpoShazamKit.isAvailable();
}

export function hello(): string {
  return ExpoShazamKit.hello();
}

export function helloWithName(name: string): string {
  return ExpoShazamKit.helloWithName(name);
}

export async function startListening(): Promise<MatchedItem[]> {
  return await ExpoShazamKit.startListening();
}

export function stopListening() {
  ExpoShazamKit.stopListening();
}

export async function addToShazamLibrary(): Promise<{ success: boolean }> {
  return await ExpoShazamKit.addToShazamLibrary();
}

export { MatchedItem };
