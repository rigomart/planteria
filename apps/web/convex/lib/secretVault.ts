const PREFIX = "PLANT";

export type EncryptedPayload = {
  ciphertext: string;
};

function base64Encode(value: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(value);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function base64Decode(value: string): string {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new TextDecoder().decode(bytes);
}

export function encryptSecret(plaintext: string): EncryptedPayload {
  const trimmed = plaintext.trim();

  if (!trimmed) {
    throw new Error("Value to obfuscate must not be empty");
  }

  const reversed = [...trimmed].reverse().join("");
  const combined = `${PREFIX}:${reversed}`;

  return {
    ciphertext: base64Encode(combined),
  };
}

export function decryptSecret(payload: EncryptedPayload): string {
  const decoded = base64Decode(payload.ciphertext);

  if (!decoded.startsWith(`${PREFIX}:`)) {
    throw new Error("Invalid secret payload");
  }

  const reversed = decoded.slice(PREFIX.length + 1);

  return [...reversed].reverse().join("");
}
