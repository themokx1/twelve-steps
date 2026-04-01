import { createHmac } from "node:crypto";

const LEGACY_ITERATIONS = 310000;
const DEFAULT_ITERATIONS = 310000;
const MAX_NATIVE_ITERATIONS = 310000;
const KEY_LENGTH = 32;
const HASH_LENGTH = 32;
const HASH_SCHEME = "pbkdf2-sha256";

type ParsedStoredHash = {
  iterations: number;
  hashHex: string;
  needsRehash: boolean;
};

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string) {
  if (hex.length % 2 !== 0) {
    throw new Error("Invalid hex input length.");
  }

  const bytes = new Uint8Array(hex.length / 2);

  for (let index = 0; index < hex.length; index += 2) {
    bytes[index / 2] = Number.parseInt(hex.slice(index, index + 2), 16);
  }

  return bytes;
}

function joinBytes(left: Uint8Array, right: Uint8Array) {
  const joined = new Uint8Array(left.length + right.length);
  joined.set(left);
  joined.set(right, left.length);
  return joined;
}

function encodeBlockIndex(blockIndex: number) {
  const view = new DataView(new ArrayBuffer(4));
  view.setUint32(0, blockIndex, false);
  return new Uint8Array(view.buffer);
}

function toBufferSource(bytes: Uint8Array) {
  return Uint8Array.from(bytes);
}

function timingSafeEqual(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) {
    return false;
  }

  let diff = 0;

  for (let index = 0; index < left.length; index += 1) {
    diff |= left[index] ^ right[index];
  }

  return diff === 0;
}

function encodeStoredHash(hashHex: string, iterations: number) {
  return `${HASH_SCHEME}$${iterations}$${hashHex}`;
}

function parseStoredHash(storedHash: string): ParsedStoredHash {
  const [scheme, iterationValue, hashHex] = storedHash.split("$");

  if (scheme === HASH_SCHEME && iterationValue && hashHex) {
    const iterations = Number.parseInt(iterationValue, 10);

    if (Number.isFinite(iterations) && iterations > 0) {
      return {
        iterations,
        hashHex,
        needsRehash: iterations !== DEFAULT_ITERATIONS
      };
    }
  }

  return {
    iterations: LEGACY_ITERATIONS,
    hashHex: storedHash,
    needsRehash: true
  };
}

async function importPbkdf2Key(passphrase: string) {
  return crypto.subtle.importKey("raw", toBufferSource(new TextEncoder().encode(passphrase)), "PBKDF2", false, [
    "deriveBits"
  ]);
}

async function deriveBitsNative(passphrase: string, salt: Uint8Array, iterations: number) {
  const key = await importPbkdf2Key(passphrase);
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: toBufferSource(salt),
      iterations
    },
    key,
    KEY_LENGTH * 8
  );

  return new Uint8Array(derivedBits);
}

function signLegacyHmac(key: Uint8Array, data: Uint8Array) {
  return new Uint8Array(createHmac("sha256", key).update(toBufferSource(data)).digest());
}

async function deriveBitsPortable(passphrase: string, salt: Uint8Array, iterations: number) {
  const key = new TextEncoder().encode(passphrase);
  const blockCount = Math.ceil(KEY_LENGTH / HASH_LENGTH);
  const derived = new Uint8Array(blockCount * HASH_LENGTH);

  for (let blockIndex = 1; blockIndex <= blockCount; blockIndex += 1) {
    let block = signLegacyHmac(key, joinBytes(salt, encodeBlockIndex(blockIndex)));
    const accumulator = block.slice();

    for (let iteration = 1; iteration < iterations; iteration += 1) {
      block = signLegacyHmac(key, block);

      for (let byteIndex = 0; byteIndex < accumulator.length; byteIndex += 1) {
        accumulator[byteIndex] ^= block[byteIndex];
      }
    }

    derived.set(accumulator, (blockIndex - 1) * HASH_LENGTH);
  }

  return derived.slice(0, KEY_LENGTH);
}

async function deriveBits(passphrase: string, salt: Uint8Array, iterations: number) {
  if (iterations <= MAX_NATIVE_ITERATIONS) {
    return deriveBitsNative(passphrase, salt, iterations);
  }

  return deriveBitsPortable(passphrase, salt, iterations);
}

export async function hashPassphrase(passphrase: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await deriveBits(passphrase, salt, DEFAULT_ITERATIONS);

  return {
    saltHex: bytesToHex(salt),
    hashHex: encodeStoredHash(bytesToHex(hash), DEFAULT_ITERATIONS)
  };
}

export async function verifyPassphrase(passphrase: string, saltHex: string, storedHash: string) {
  const parsed = parseStoredHash(storedHash);
  const actual = await deriveBits(passphrase, hexToBytes(saltHex), parsed.iterations);
  const expected = hexToBytes(parsed.hashHex);

  return {
    valid: timingSafeEqual(actual, expected),
    needsRehash: parsed.needsRehash
  };
}
