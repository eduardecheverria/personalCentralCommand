import { Redis } from "@upstash/redis";

// La integracion de Upstash en Vercel inyecta KV_REST_API_URL / KV_REST_API_TOKEN.
// Tambien aceptamos los nombres UPSTASH_* por si configuras Upstash directo.
const url =
  process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? "";
const token =
  process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? "";

if (!url || !token) {
  console.warn(
    "[redis] Faltan KV_REST_API_URL / KV_REST_API_TOKEN. " +
      "En local: copia .env.local.example a .env.local. " +
      "En Vercel: conecta la base con la integracion de Upstash."
  );
}

export const redis = new Redis({ url, token });
