import { registerPlugin, Capacitor } from '@capacitor/core';

// Register the native Android plugin (name must match @CapacitorPlugin name)
export const GoogleSignIn = registerPlugin<any>('GoogleSignIn');

export function isNativeAndroid() {
  return Capacitor.getPlatform() === 'android';
}

export async function signInNative(): Promise<void> {
  if (!isNativeAndroid()) return;
  if (!GoogleSignIn || typeof GoogleSignIn.signIn !== 'function') {
    throw new Error('Google Sign-In plugin unavailable');
  }
  // This triggers the native Google sign-in flow.
  // Results are returned via window.handleGoogleSignInSuccess/Failure.
  await GoogleSignIn.signIn();
}
