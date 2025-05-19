// Import Node.js crypto module for cryptographic functions
import * as crypto from "node:crypto";

/**
 * Generates a random string of the specified length using
 * uppercase, lowercase letters, and digits.
 */
export function generateRandomString(length) {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

// Create a code verifier for PKCE (Proof Key for Code Exchange)
export const codeVerifier = generateRandomString(64);

/**
 * Takes a plain string and returns a SHA-256 digest (hash).
 * Used for generating the code challenge.
 */
export async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return crypto.subtle.digest("SHA-256", data);
}

/**
 * Encodes binary data to base64 URL format, which is required
 * by the Spotify API for PKCE code challenge.
 */
export function base64encode(input) {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, "")   // Remove padding
    .replace(/\+/g, "-") // Replace '+' with '-'
    .replace(/\//g, "_"); // Replace '/' with '_'
}

/**
 * Creates a base64-encoded SHA-256 challenge using the code verifier.
 */
export async function challenge() {
  const hashed = await sha256(codeVerifier);
  return base64encode(hashed);
}

// Pre-compute the code challenge at module load time
export const codeChallenge = await challenge();

/**
 * Export all relevant functions and values for use in other files
 */
export default {
  generateRandomString,
  sha256,
  base64encode,
  challenge,
  codeVerifier,
  codeChallenge,
};
