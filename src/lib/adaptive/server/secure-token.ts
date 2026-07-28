import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import type { GeneratedQuestion } from "@/lib/adaptive/types";

function key() {
  const material = process.env.MASTERY_TOKEN_SECRET ?? process.env.OPENAI_API_KEY;
  if (!material) throw new Error("SERVER_NOT_CONFIGURED");
  return createHash("sha256").update(material).digest();
}

export function sealQuestion(question: GeneratedQuestion) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(question), "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString("base64url")).join(".");
}

export function openQuestion(token: string) {
  const [ivValue, tagValue, dataValue] = token.split(".");
  if (!ivValue || !tagValue || !dataValue) throw new Error("INVALID_QUESTION_TOKEN");
  const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(ivValue, "base64url"));
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataValue, "base64url")), decipher.final()]);
  return JSON.parse(decrypted.toString("utf8")) as GeneratedQuestion;
}
