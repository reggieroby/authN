import { genSaltSync, hashSync } from 'bcryptjs'

export async function generateKey() {
  return crypto.subtle.generateKey(
    {
      name: "AES-CBC",
      length: 256
    },
    true,
    ["encrypt", "decrypt"]
  );
}
export async function importKey(rawKey) {
  return crypto.subtle.importKey(
    "raw",
    rawKey,
    "AES-CBC",
    true,
    ["encrypt", "decrypt"]
  );
}
export async function exportKey(key) {
  const buff = await crypto.subtle.exportKey(
    "raw",
    key
  );
  return new Uint8Array(buff)
}
export function encodeData(str) {
  if (typeof str !== "string") {
    str = ""
  }
  return (new TextEncoder()).encode(str)
}
export function decodeData(str) {
  return (new TextDecoder()).decode(str)
}
export async function encryptData(key, iv, str) {
  return crypto.subtle.encrypt(
    {
      name: "AES-CBC",
      iv,
    },
    key,
    str,
  );
}
export async function decryptData(key, iv, str) {
  return crypto.subtle.decrypt(
    {
      name: "AES-CBC",
      iv,
    },
    key,
    str,
  );
}
export async function sha512Hash(data) {
  return crypto.subtle.digest("SHA-512", data)
}
export function arrayFromBuffer(buff) {
  return Array.from(new Uint8Array(buff))
}
export function hexFromArray(arr) {
  return arr
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}
export function hexDigest(buff) {
  return hexFromArray(arrayFromBuffer(buff))
}

export function bcryptSalt() {
  return genSaltSync()
}

export const getPasswordHash = (password) => hashSync(password, genSaltSync(10))
export const getEmailHash = (email, salt) => salt ? hashSync(email, salt) : email;