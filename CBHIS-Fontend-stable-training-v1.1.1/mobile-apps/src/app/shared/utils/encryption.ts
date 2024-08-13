import { Buffer } from 'buffer';

function caesarCipher(str: string, shift: number, decrypt = false) {
  const s = decrypt ? (26 - shift) % 26 : shift; // Adjust shift for decryption
  const n = s > 0 ? s : 26 + (s % 26); // Handle negative shifts

  return [...str]
    .map((l, i) => {
      const c = str.charCodeAt(i);
      if (c >= 65 && c <= 90) {
        // Uppercase letter
        return String.fromCharCode(((c - 65 + n) % 26) + 65);
      } else if (c >= 97 && c <= 122) {
        // Lowercase letter
        return String.fromCharCode(((c - 97 + n) % 26) + 97);
      } else {
        return l;
      }
    })
    .join('');
}

export const encryptedTo = (str: string) => {
  const encryptStr = caesarCipher(str, 3);
  return Buffer.from(encryptStr).toString('base64');
};

export const decryptedTo = (str: string) => {
  const decryptStr = Buffer.from(str, 'base64').toString('ascii');
  return caesarCipher(decryptStr, 3, true);
};
