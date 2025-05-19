import * as crypto from "node:crypto";

export function generateRandomString(length) {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

export const codeVerifier = generateRandomString(64);

export async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return crypto.subtle.digest("SHA-256", data);
}

export function base64encode(input) {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export async function challenge() {
  const hashed = await sha256(codeVerifier);
  return base64encode(hashed);
}
export const codeChallenge = await challenge();

export default {
  generateRandomString,
  sha256,
  base64encode,
  challenge,
  codeVerifier,
  codeChallenge,
};
